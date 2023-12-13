var express = require('express');
var router = express.Router();

const functions = require('firebase-functions');
const admin = require('firebase-admin');


const TronWeb = require('tronweb');

const bip39 = require('bip39');

const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)

const web3 = require("@solana/web3.js");
(async () => {
  const solana = new web3.Connection("https://flashy-blue-reel.solana-mainnet.quiknode.pro/c2e829af6a866905a19c02a601dc50aee1573a5d/");
  console.log(await solana.getSlot());
})();
const ed25519 = require("ed25519-hd-key");
const bs58 = require('bs58');
const ethers = require('ethers');
const bitcoin = require('bitcoinjs-lib');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const crypto = require('crypto');

const firebaseConfig = {
    apiKey: "AIzaSyCWdWbBygpNdb_PdDbr1wj8mK7H_q5Z-SA",
    authDomain: "tradex-392f6.firebaseapp.com",
    projectId: "tradex-392f6",
    databaseURL:"https://tradex-392f6-default-rtdb.firebaseio.com/",
    storageBucket: "tradex-392f6.appspot.com",
    messagingSenderId: "373159113198",
    appId: "1:373159113198:web:5311893da5f151112edeff",
    measurementId: "G-148VV57WMB"
  };

  // Initialize Firebase
//admin.initializeApp(firebaseConfig);


//const db = admin.database();
//const usuariosRef = db.ref('usuarios');


// Clave secreta para cifrado (asegúrate de guardar esto de manera segura)
const secretKey = 'UnaClaveSecretaMuySegura';

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

        // Generar claves para Solana
        // path = `m/44'/501'/0'/0'`;
        // const keypair = web3.Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
        // privateKey = bs58.encode(keypair.secretKey);
        // publicKey = keypair.publicKey.toString();
        // const solanaKeyPair = {
        //     'public_key': publicKey,
        //     'private_key': privateKey
        // };


        // // Generar claves para Bitcoin
        // // Generar un par de claves público-privado aleatorio
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
            // 'mnemonic':mnemonic,
            'evm_keypair': evmKeyPair,
            'tron_keypair': tronKeyPair,
            // 'solana_keypair': solanaKeyPair
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

    // // Generar claves para Solana
    // path = `m/44'/501'/0'/0'`;
    // const keypair = web3.Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
    // privateKey = bs58.encode(keypair.secretKey);
    // publicKey = keypair.publicKey.toString();
    // const solanaKeyPair = {
    //     'public_key': publicKey,
    //     'private_key': privateKey
    // };

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
        //'solana_keypair': solanaKeyPair
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
