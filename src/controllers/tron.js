var express = require('express');
var router = express.Router();

const TronWeb = require('tronweb');
const bip39 = require('bip39');

const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const bip32 = BIP32Factory(ecc)

//Conexion con el cluster de tron 
const tronWeb = new TronWeb({
    fullHost : 'https://api.trongrid.io/',
    solidityNode: 'https://api.trongrid.io/' 
  }
)

router.post('/keypair', async (req, res) => {
    const mnemonic = req.body.mnemonic;

    const isValid = bip39.validateMnemonic(mnemonic);

    if (isValid === true) {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const node = bip32.fromSeed(seed);
        const child = node.derivePath(`m/44'/195'/0'/0/0`);
        const privateKey = child.privateKey.toString('hex');
        const address = await TronWeb.address.fromPrivateKey(privateKey);
        res.json({
            'public_key': address,
            'private_key': privateKey
        })
    } else {
        res.json({
            'error': 'La frase de recuperacion es invalida'})
    }
})

router.get('/balance-trx/:publicKey', async (req, res) => {
    const { publicKey } = req.params;

    let balance = await tronWeb.trx.getBalance(publicKey);
    res.json({
        "balance-TRX: ": balance/1000000
    })
})

router.get('/balance-trc20/:publicKey/:tokenAddress', async (req, res) => {
    const { publicKey, tokenAddress } = req.params;

    tronWeb.setAddress(publicKey);
    try {
        let contract = await tronWeb.contract().at(tokenAddress);

        let result = await contract.balanceOf(publicKey).call();
        let balance = tronWeb.toDecimal(result);
        res.json({
            'balance': balance
        })
    } catch(error) {
        res.json({
            'error': error
        })
    }
})


//router.post('/send-trc20', async (req, res) => {
//    const tokenAddress = req.body.tokenAddress;
//    const toPublicKey = req.body.toPublicKey;
//    const amount = req.body.amount;
//    const fromPrivateKey = req.body.fromPrivateKey;

//    const tronWeb = new TronWeb({
//        fullHost : 'https://api.trongrid.io/',
//        solidityNode: 'https://api.trongrid.io/', 
//        privateKey: fromPrivateKey
//      }
//    )

//    try {
//        let contract = await tronWeb.contract().at(tokenAddress);
//        const decimals = await contract.decimals().call();
//        const lamports = Math.pow(10,decimals)
//        
//        let result = await contract.transfer(
//            toPublicKey, 
//            amount * lamports
//        ).send()
//        res.json({
//            'result': result
//        });
//    } catch (error) {
//        res.json({
//            'error': error
//        })
//    }
//})

router.post('/send-trx', async (req, res) => {
    const toPublicKey = req.body.toPublicKey;
    const amount = req.body.amount;
    const fromPrivateKey = req.body.fromPrivateKey;

    const tronWeb = new TronWeb({
        fullHost : 'https://api.trongrid.io/',
        solidityNode: 'https://api.trongrid.io/', 
        privateKey: fromPrivateKey
    });

    try {
        // Obtener la dirección del remitente desde la clave privada
        const fromAddress = tronWeb.address.fromPrivateKey(fromPrivateKey);

        // Obtener el balance actual del remitente
        const currentBalance = await tronWeb.trx.getBalance(fromAddress);

        // Verificar si el balance es suficiente para realizar la transacción
        if (currentBalance < amount) {
            return res.json({
                'error': 'Fondos insuficientes para realizar la transacción'
            });
        }

        // Enviar la transacción de TRX
        const result = await tronWeb.trx.sendTransaction(toPublicKey, amount);

        res.json({
            'result': result
        });
    } catch (error) {
        res.json({
            'error': error
        });
    }
});


module.exports = router;
