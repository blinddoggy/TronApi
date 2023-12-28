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





// Clave secreta para cifrado (asegúrate de guardar esto de manera segura)
// const secretKey = 'UnaClaveSecretaMuySegura';

//encriptar con AES(advanced encryptation standard)
function encryptAES(data) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
  }
  
  //deseencriptar con AES
  function decryptAES(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');
    return decryptedData;
  }
  


// Middleware
router.use(bodyParser.json());
router.use(cors());

const users = [];
// Ruta para crear un nuevo usuario
router.post('/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      // Verificar si el usuario ya existe
      if (users.some((user) => user.username === username)) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }
  
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Almacenar en la base de datos (o en tu sistema de almacenamiento)
      users.push({ username, password: hashedPassword });
      //almacenando en firebsae
      usuariosRef.push({username,password : hashedPassword});

      res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Ruta para la autenticación y generación del token JWT
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Buscar el usuario en la base de datos
      const user = users.find((user) => user.username === username);
  
      // Verificar si el usuario existe y si la contraseña coincide
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
  
      // Generar token JWT
      const token = jwt.sign({ username }, 'tu_secreto_secreto', { expiresIn: '1h' });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  
  async function sendBitcoin(privateKeyWIF, toAddress, amount) {
    try {
      // Crear una clave privada a partir de la clave WIF (Wallet Import Format)
      const privateKey = bitcoin.ECPair.fromWIF(privateKeyWIF);
  
      // Obtener información de la dirección de destino para construir la transacción
      const toAddressInfo = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${toAddress}`);
      
      if (toAddressInfo.status !== 200 || !toAddressInfo.data || !toAddressInfo.data.data) {
        throw new Error('No se pudo obtener información de la dirección de destino');
      }
  
      // Construir la transacción
      const txBuilder = new bitcoin.TransactionBuilder();
      const utxos = toAddressInfo.data.data[toAddress].utxo;
  
      // Agregar las entradas (utxos) a la transacción
      for (const utxo of utxos) {
        txBuilder.addInput(utxo.transaction_hash, utxo.index);
      }
  
      // Agregar la salida (destinatario)
      txBuilder.addOutput(toAddress, amount);
  
      // Calcular el cambio (si es necesario)
      const changeAmount = utxos.reduce((total, utxo) => total + utxo.value, 0) - amount;
      if (changeAmount > 0) {
        const changeAddress = privateKey.getAddress();
        txBuilder.addOutput(changeAddress, changeAmount);
      }
  
      // Firmar la transacción con la clave privada
      for (let i = 0; i < utxos.length; i++) {
        txBuilder.sign(i, privateKey);
      }
  
      // Construir la transacción
      const tx = txBuilder.build();
  
      // Convertir la transacción a formato hexadecimal
      const txHex = tx.toHex();
  
      // Enviar la transacción a través de una API de broadcasting (ejemplo: blockchair.com)
      const broadcastResponse = await axios.post('https://api.blockchair.com/bitcoin/pushtx', { data: txHex });
  
      if (broadcastResponse.status !== 200 || !broadcastResponse.data || !broadcastResponse.data.data) {
        throw new Error('No se pudo enviar la transacción');
      }
  
      const transactionId = broadcastResponse.data.data.transaction_hash;
      return transactionId;
    } catch (error) {
      throw new Error(`Error al enviar bitcoins: ${error.message}`);
    }
  }


    

  // Función para generar un par de claves y obtener una dirección de Bitcoin
    function generateBitcoinAccount() {
        try {
        // Crea una clave privada aleatoria
        const keyPair = bitcoin.ECPair.makeRandom();
    
        // Obtiene la clave privada y pública en formato hexadecimal
        const privateKeyHex = keyPair.privateKey.toString('hex');
        const publicKeyHex = keyPair.publicKey.toString('hex');
    
        // Crea un objeto de dirección de Bitcoin desde la clave pública
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    
        console.log('Clave privada (hex):', privateKeyHex);
        console.log('Clave pública (hex):', publicKeyHex);
        console.log('Dirección de Bitcoin:', address);
    
        return {
            privateKey: privateKeyHex,
            publicKey: publicKeyHex,
            bitcoinAddress: address,
        };
        } catch (error) {
        console.error('Error al generar la cuenta de Bitcoin:', error.message);
        throw error;
        }
    }
  

  //generar cuenta de bitcoin
  router.post('/generate-bitcoin-account/', async (req, res) => {
    //try {
    const mnemonic = req.params.mnemonic;
  
      // Uso de la función
    const privateKeyWIF = 'tu_clave_privada_en_formato_WIF';
    const toAddress = 'direccion_del_destinatario';
    const amountToSend = 0.001; // Cantidad de bitcoins a enviar

      // Validar el mnemónico
    //   if (!bip39.validateMnemonic(mnemonic)) {
    //     return res.status(400).json({ error: 'Mnemónico inválido' });
    //   }
  
    //   // Obtener la semilla desde el mnemónico
    //   const seed = bip39.mnemonicToSeedSync(mnemonic);
        
    //   // Generar la clave privada y la dirección Bitcoin
    //   const keyPair = bitcoin.ECPair.fromPrivateKey(seed.slice(0, 32), { compressed: true });
    //   const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address;
    //   const privateKey = keyPair.toWIF();
    sendBitcoin(privateKeyWIF, toAddress, amountToSend)
    .then(transactionId => console.log(`Transacción exitosa. ID: ${transactionId}`))
    .catch(error => console.error(`Error: ${error.message}`));
        //generateBitcoinAccount();

    //   const bitcoinAccount = {
    //     publicKey: address,
    //     privateKey: privateKey,
    //   };
  
    //   res.json(bitcoinAccount);
    // } catch (error) {
    //   console.error('Error al generar la cuenta de Bitcoin:', error);
    //   res.status(500).json({ error: 'Error interno del servidor' });
    // }
  });


 


  // Enviar SPL Tokens, el que sea ;)
router.post('/send-spl-token', async (req, res) => {
    const payer = web3sol.Keypair.fromSecretKey(bs58.decode(req.body.secretKey));
    const receiver = new web3sol.PublicKey(req.body.toPublicKey);
    const amount = req.body.amount;
    const mint = req.body.mint;
    const fee_payer = web3sol.Keypair.fromSecretKey(bs58.decode(feepayer));

    const connection = new web3sol.Connection(endpoint, "confirmed")

    const mintAddress = new web3sol.PublicKey(mint)

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


  // Enviar SPL Tokens, el que sea ;)
  router.post('/transfer-nft-solana', async (req, res) => {
    const payer = web3sol.Keypair.fromSecretKey(bs58.decode(req.body.secretKey));
    const receiver = new web3sol.PublicKey(req.body.toPublicKey);
    const amount = 1;//
    const mint = req.body.mint;
    const fee_payer = web3sol.Keypair.fromSecretKey(bs58.decode(feepayer));

    const connection = new web3sol.Connection(endpoint, "confirmed")

    const mintAddress = new web3sol.PublicKey(mint)

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


// Obtener NFTs con llave Publica
router.get('/get-solana-nft/:pubKey', async (req,res) => {
    try {
        const { pubKey } = req.params;

        const nfts = []
    
        const connection = new web3sol.Connection(endpoint);
        const wallet = new web3sol.PublicKey(pubKey)
    
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


  // Obtener Balance de SPL Token
router.get('/get-balance-spl/:publicKey/:splToken', async (req, res) => {
    const { publicKey, splToken } = req.params;
    const connection = new web3sol.Connection(endpoint)
    const account = await findAssociatedTokenAddress(new web3sol.PublicKey(publicKey), new web3sol.PublicKey(splToken))
    try {
        const balance = await connection.getTokenAccountBalance(new web3sol.PublicKey(account.toString()))
        res.json({
            'balance': balance.value.uiAmount
        })
    } catch (e) {
        res.json({
            'balance': 0
        })
    }
})

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


//importar llaves desde 12 palabras
    router.post('/get-keypairs', async (req, res) => {

        const mnemonic = req.body.mnemonic;

        const isValid = bip39.validateMnemonic(mnemonic);

        if (isValid === true) {

        const seed = await bip39.mnemonicToSeed(mnemonic);
        const node = bip32.fromSeed(seed);

        let path, privateKey, publicKey;

        // Generar claves para EVM
        path = `m/44'/60'/0'/0/0`;
        privateKey = node.derivePath(path).privateKey.toString('hex');
        publicKey = new ethers.Wallet(privateKey).address;
        const evmKeyPair = {
            'public_key': publicKey,
            'private_key': privateKey
        };

        // Generar claves para Tron
        path = `m/44'/195'/0'/0/0`;
        privateKey = node.derivePath(path).privateKey.toString('hex');
        publicKey = await TronWeb.address.fromPrivateKey(privateKey);
        const tronKeyPair = {
            'public_key': publicKey,
            'private_key': privateKey
        };

        //Generar claves para Solana
        path = `m/44'/501'/0'/0'`;
        const keypair = web3sol.Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
        privateKey = bs58.encode(keypair.secretKey);
        publicKey = keypair.publicKey.toString();
        const solanaKeyPair = {
            'public_key': publicKey,
            'private_key': privateKey
        };


        res.json({
            // 'mnemonic':mnemonic,
            'evm_keypair': evmKeyPair,
            'tron_keypair': tronKeyPair,
            'solana_keypair': solanaKeyPair
            // 'bitcoin_keypair': bitcoinKeyPairObject
        });

    }else {
        res.json({
            'error': 'La frase de recuperacion es invalida'})
    }

});


//generar mnemonic y llaves para TRON, SOLANA y EVMs
router.get('/generate-keypair', async (req, res) => {
    const mnemonic = bip39.generateMnemonic();

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const node = bip32.fromSeed(seed);

    let path, privateKey, publicKey;

    // Generar claves para EVM
    path = `m/44'/60'/0'/0/0`;
    privateKey = node.derivePath(path).privateKey.toString('hex');
    publicKey = new ethers.Wallet(privateKey).address;
    const evmKeyPair = {
        'public_key': publicKey,
        'private_key': privateKey
    };

    // Generar claves para Tron
    path = `m/44'/195'/0'/0/0`;
    privateKey = node.derivePath(path).privateKey.toString('hex');
    publicKey = await TronWeb.address.fromPrivateKey(privateKey);
    const tronKeyPair = {
        'public_key': publicKey,
        'private_key': privateKey
    };

    //Generar claves para Solana
    path = `m/44'/501'/0'/0'`;
    const keypair = web3sol.Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
    privateKey = bs58.encode(keypair.secretKey);
    publicKey = keypair.publicKey.toString();
    const solanaKeyPair = {
        'public_key': publicKey,
        'private_key': privateKey
    };

    //Generar claves para Bitcoin
    // Generar un par de claves público-privado aleatorio
    // const keyPair = bitcoin.ECPair.makeRandom();
        
    // // Obtener la dirección de Bitcoin desde la clave pública
    // const address = keyPair.getAddress();
    
    // // Obtener la clave privada de Bitcoin en formato WIF (Wallet Import Format)
    // const privateKeyWIF = keyPair.toWIF();
    // const bitcoinKeyPairObject = {
    //     'public_key': address,
    //     'private_key': privateKeyWIF
    // };

    res.json({
        'mnemonic':mnemonic,
        'evm_keypair': evmKeyPair,
        'tron_keypair': tronKeyPair,
        'solana_keypair': solanaKeyPair
        // 'bitcoin_keypair': bitcoinKeyPairObject
    });
});


// Obtener Mnemonic
router.get('/get-mnemonic', (req, res) => {
    try {
        const mnemonic = bip39.generateMnemonic()
        res.json({"mnemonic":mnemonic});
    }  catch (error) {
        console.error('Error al obtener las 12 palabras:', error);
        res.status(500).json({ error: 'Error al obtener las 12 palabras.' });
    }
})


//exportando modulo
module.exports = router;
