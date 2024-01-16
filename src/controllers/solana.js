var express = require('express');
var router = express.Router();

const TronWeb = require('tronweb');

const bip39 = require('bip39');

const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)

const web3sol = require("@solana/web3.js");
// (async () => {
//   const solana = new web3.Connection("https://flashy-blue-reel.solana-mainnet.quiknode.pro/c2e829af6a866905a19c02a601dc50aee1573a5d/");
//   console.log(await solana.getSlot());
// })();
const ed25519 = require("ed25519-hd-key");
const bs58 = require('bs58');
const ethers = require('ethers');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const crypto = require('crypto');
const LAMPORTS_PER_SOL = web3sol.LAMPORTS_PER_SOL
const endpoint = process.env.QN_ENDPOINT_URL
const feepayer = process.env.FEE_PAYER
const SPL = require("@solana/spl-token");
const { Metaplex , keypairIdentity } = require("@metaplex-foundation/js");
const { TokenStandard } = require ("@metaplex-foundation/mpl-token-metadata");




const { findAssociatedTokenAddress, getTokenLamports } = require('../helpers/index');
const bitcoin = require('bitcoinjs-lib');


// Obtener Balance de SOL con llave Publica
router.get('/get-solana-balance/:publicKey', async (req, res) => {
    const { publicKey } = req.params;
    const connection = new web3sol.Connection(endpoint)
    // const sendAir = await connection.requestAirdrop(new web3sol.PublicKey(publicKey),1000000);
    const lamports = await connection.getBalance(new web3sol.PublicKey(publicKey)).catch((err) => {
        console.log(err);
    })
    
    const sol = lamports / LAMPORTS_PER_SOL
    res.json({
        'balance': sol,
    })
})


//Enviar SOL con la secret key 
router.post('/send-sol/', async (req, res) => {
    const secretKey = req.body.secretKey;
    const toPublicKey = req.body.toPublicKey;
    const amount = req.body.amount;
    const fee_payer = web3sol.Keypair.fromSecretKey(bs58.decode(feepayer));

    try {
        const toPubKey = new web3sol.PublicKey(toPublicKey)
        const connection = new web3sol.Connection(endpoint, "confirmed")

        //create Keypair
        const keypair = web3sol.Keypair.fromSecretKey(
            bs58.decode(secretKey)
        );   
          
        const transferTransaction = new web3sol.Transaction()
        .add(web3sol.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: toPubKey,
            lamports: amount * LAMPORTS_PER_SOL 
        }))
    
        var signature = await web3sol.sendAndConfirmTransaction(
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




























//exportando modulo
module.exports = router;