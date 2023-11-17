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

//funcion eviar trc20
router.post('/send-trc20', async (req, res) => {
    const tokenAddress = req.body.tokenAddress;
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

        // Crear una instancia del contrato del token TRC20
        const contract = await tronWeb.contract().at(tokenAddress);

        // Obtener la cantidad de decimales del token
        const decimals = await contract.decimals().call();
        const lamports = Math.pow(10, decimals);

        // Verificar si el balance es suficiente para realizar la transacción
        const balance = await contract.balanceOf(fromAddress).call();
        if (balance < amount) {
            return res.json({
                'error': 'Fondos insuficientes para realizar la transacción'
            });
        }

        // Enviar la transacción de TRC20
        const result = await contract.transfer(toPublicKey, amount * lamports).send();

        res.json({
            'result': result
        });
    } catch (error) {
        res.json({
            'error': error
        });
    }
});



//abi TRC20
const abi =   [{'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'spender','type':'address'},{'name':'value','type':'uint256'}],'name':'approve','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'totalSupply','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'sender','type':'address'},{'name':'recipient','type':'address'},{'name':'amount','type':'uint256'}],'name':'transferFrom','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'spender','type':'address'},{'name':'addedValue','type':'uint256'}],'name':'increaseAllowance','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'account','type':'address'}],'name':'balanceOf','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[],'name':'symbol','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'spender','type':'address'},{'name':'subtractedValue','type':'uint256'}],'name':'decreaseAllowance','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':false,'inputs':[{'name':'recipient','type':'address'},{'name':'amount','type':'uint256'}],'name':'transfer','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'owner','type':'address'},{'name':'spender','type':'address'}],'name':'allowance','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'inputs':[],'payable':false,'stateMutability':'nonpayable','type':'constructor'},{'anonymous':false,'inputs':[{'indexed':true,'name':'from','type':'address'},{'indexed':true,'name':'to','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Transfer','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'owner','type':'address'},{'indexed':true,'name':'spender','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Approval','type':'event'}]; 
// Función para obtener información del contrato TRC20
async function obtenerInformacionTokenTRC20(contractAddress) {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io/',
        solidityNode: 'https://api.trongrid.io/'
    });

    try {
        // Crear una instancia del contrato TRC20
        const trc20Contract = await tronWeb.contract(abi, contractAddress);

        // Llamar a las funciones del contrato para obtener información
        const tokenName = await trc20Contract.name().call();
        const tokenDecimals = await trc20Contract.decimals().call();
        const tokenSymbol = await trc20Contract.symbol().call();

        // Devolver la información recopilada
        return {
            name: tokenName,
            decimals: tokenDecimals,
            symbol: tokenSymbol
        };
    } catch (error) {
        console.error('Error al obtener información del contrato TRC20:', error);
        return null;
    }
}

// Definir el punto final GET para obtener información del contrato TRC20
router.get('/info-token-trc20/:contractAddress', async (req, res) => {
    const { contractAddress } = req.params;

    const informacionToken = await obtenerInformacionTokenTRC20(contractAddress);

    if (informacionToken) {
        res.json(informacionToken);
    } else {
        res.status(500).json({ error: 'Error al obtener información del contrato TRC20.' });
    }
});


module.exports = router;
