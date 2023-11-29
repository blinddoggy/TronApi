var express = require('express');
var router = express.Router();

//require("dotenv").config();

const bip39 = require('bip39');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const ed25519 = require("ed25519-hd-key");
const SPL = require("@solana/spl-token");
const { Metaplex } = require("@metaplex-foundation/js");
const fetch = require('node-fetch');

const LAMPORTS_PER_SOL = web3.LAMPORTS_PER_SOL
const endpoint = process.env.QN_ENDPOINT_URL
const feepayer = process.env.FEE_PAYER

const { findAssociatedTokenAddress, getTokenLamports } = require('../helpers/index')

// Obtener Mnemonic
router.get('/mnemonic', (req, res) => {
    const mnemonic = bip39.generateMnemonic()
    res.send(mnemonic)
})

// Obtener keypair asi de la nada
router.get('/keypair', (req, res) => {
    const keypair = web3.Keypair.generate();
    const secret_key = bs58.encode(keypair.secretKey)
    res.json({
        'public_key': keypair.publicKey.toString(),
        'secret_key': secret_key
    })
})

// Obtener Keypair con mnemonic
router.post('/keypair', (req,res) => {
    const mnemonic = req.body.mnemonic;
    const isValid = bip39.validateMnemonic(mnemonic);
    if (isValid === true) {
        const seed = bip39.mnemonicToSeedSync(mnemonic, "")
        const path = `m/44'/501'/0'/0'`;
        const keypair = web3.Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
        const secret_key = bs58.encode(keypair.secretKey)
        res.json({
            'public_key': keypair.publicKey.toString(),
            'secret_key': secret_key
        })
    } else {
        res.json({
            'error': "La frase de recuperacion es invalida"
        })
    }
})

// Obtener Balance de SOL con llave Publica
router.get('/getSolBalance/:publicKey', async (req, res) => {
    const { publicKey } = req.params;
    const connection = new web3.Connection(endpoint)
    
    const lamports = await connection.getBalance(new web3.PublicKey(publicKey)).catch((err) => {
        console.log(err);
    })
    
    const sol = lamports / LAMPORTS_PER_SOL
    res.json({
        'balance': sol
    })
})

// Obtener Balance de SPL Token
router.get('/getBalanceSPL/:publicKey/:splToken', async (req, res) => {
    const { publicKey, splToken } = req.params;
    const connection = new web3.Connection(endpoint)
    const account = await findAssociatedTokenAddress(new web3.PublicKey(publicKey), new web3.PublicKey(splToken))
    try {
        const balance = await connection.getTokenAccountBalance(new web3.PublicKey(account.toString()))
        res.json({
            'balance': balance.value.uiAmount
        })
    } catch (e) {
        res.json({
            'balance': 0
        })
    }
})

//Enviar SOL con la secret key 
router.post('/sendSol/', async (req, res) => {
    const secretKey = req.body.secretKey;
    const toPublicKey = req.body.toPublicKey;
    const amount = req.body.amount;
    const fee_payer = web3.Keypair.fromSecretKey(bs58.decode(feepayer));

    try {
        const toPubKey = new web3.PublicKey(toPublicKey)
        const connection = new web3.Connection(endpoint, "confirmed")

        //create Keypair
        const keypair = web3.Keypair.fromSecretKey(
            bs58.decode(secretKey)
        );   
          
        const transferTransaction = new web3.Transaction()
        .add(web3.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: toPubKey,
            lamports: amount * LAMPORTS_PER_SOL 
        }))
    
        var signature = await web3.sendAndConfirmTransaction(
            connection, 
            transferTransaction, 
            [fee_payer, keypair]).catch((err) => {
            res.send(err.message)
        })
        res.json({
            'transfer_transaction': `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
        })
    } catch (error) {
        res.json({
            'error': error
        })
    }

})

// Enviar SPL Tokens, el que sea ;)
router.post('/sendTokens/', async (req, res) => {
    const payer = web3.Keypair.fromSecretKey(bs58.decode(req.body.secretKey));
    const receiver = new web3.PublicKey(req.body.toPublicKey);
    const amount = req.body.amount;
    const mint = req.body.mint;
    const fee_payer = web3.Keypair.fromSecretKey(bs58.decode(feepayer));

    const connection = new web3.Connection(endpoint, "confirmed")

    const mintAddress = new web3.PublicKey(mint)

    try {
    
        const transactionLamports = await getTokenLamports(mint)
    
        const fromTokenAccount = await SPL.getOrCreateAssociatedTokenAccount(
            connection,
            fee_payer,
            mintAddress,
            payer.publicKey
        )
    
        const toTokenAccount = await SPL.getOrCreateAssociatedTokenAccount(
            connection,
            fee_payer,
            mintAddress,
            receiver
        )
            
        const transactionSignature = await SPL.transfer(
            connection,
            fee_payer,
            fromTokenAccount.address,
            toTokenAccount.address,
            payer.publicKey,
            amount * transactionLamports,
            [fee_payer, payer]
        )
        
        res.json({
            'transfer_transaction': `https://explorer.solana.com/tx/${transactionSignature}?cluster=mainnet-beta`
        })
    } catch (error) {
        res.send(error.message)
    }
})

// Obtener NFTs con llave Publica
router.get('/getNfts/:pubKey', async (req,res) => {
    try {
        const { pubKey } = req.params;
        
        const nfts = []
    
        const connection = new web3.Connection(endpoint);
        const wallet = new web3.PublicKey(pubKey)
    
        const metaplex = new Metaplex(connection);
        const myNfts = await metaplex.nfts().findAllByOwner({
            owner: wallet
        });
    
        for (let i = 0; i < myNfts.length; i++) {
            let fetchResult = await fetch(myNfts[i].uri)
            let json = await fetchResult.json()
            nfts.push(json)
        }
    
        res.json(nfts)
    } catch (error) {
        res.json({
            "error": error
        })
    }
})

module.exports = router;