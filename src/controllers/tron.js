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
  });


//ERC721 functions
//const abi721 = [{"entrys":[{"inputs":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"baseTokenURI","type":"string"},{"name":"preMint","type":"uint256"}],"stateMutability":"Nonpayable","type":"Constructor"},{"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"approved","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"Event"},{"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"Event"},{"inputs":[{"indexed":true,"name":"id","type":"uint256"},{"name":"invalid","type":"bool"},{"name":"admin","type":"address"}],"name":"Invalidate","type":"Event"},{"inputs":[{"name":"account","type":"address"}],"name":"Paused","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"previousAdminRole","type":"bytes32"},{"indexed":true,"name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"RoleGranted","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"RoleRevoked","type":"Event"},{"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"Event"},{"inputs":[{"name":"account","type":"address"}],"name":"Unpaused","type":"Event"},{"outputs":[{"type":"bytes32"}],"name":"DEFAULT_ADMIN_ROLE","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"name":"MINTER_ROLE","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"name":"PAUSER_ROLE","stateMutability":"View","type":"Function"},{"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","stateMutability":"View","type":"Function"},{"inputs":[{"name":"tokenId","type":"uint256"}],"name":"burn","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"inputs":[{"name":"role","type":"bytes32"}],"name":"getRoleAdmin","stateMutability":"View","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"role","type":"bytes32"},{"name":"index","type":"uint256"}],"name":"getRoleMember","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"role","type":"bytes32"}],"name":"getRoleMemberCount","stateMutability":"View","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"grantRole","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"hasRole","stateMutability":"View","type":"Function"},{"inputs":[{"name":"id","type":"uint256"},{"name":"invalid","type":"bool"}],"name":"invalidate","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"id","type":"uint256"}],"name":"isInvalid","stateMutability":"View","type":"Function"},{"outputs":[{"name":"id","type":"uint256"}],"inputs":[{"name":"to","type":"address"}],"name":"mint","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"to","type":"address"},{"name":"id","type":"uint256"}],"name":"mintWithID","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"string"}],"name":"name","stateMutability":"View","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","stateMutability":"View","type":"Function"},{"name":"pause","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"name":"paused","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"preMintValue","stateMutability":"View","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"renounceRole","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"revokeRole","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"operator","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"baseURI_","type":"string"}],"name":"setBaseURI","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","stateMutability":"View","type":"Function"},{"outputs":[{"type":"string"}],"name":"symbol","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"index","type":"uint256"}],"name":"tokenByIndex","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","stateMutability":"View","type":"Function"},{"outputs":[{"type":"string"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"totalMinted","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"totalSupply","stateMutability":"View","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"transferFrom","stateMutability":"Nonpayable","type":"Function"},{"name":"unpause","stateMutability":"Nonpayable","type":"Function"}]}];
//const abi721 = [{"entrys":[{"inputs":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"baseTokenURI","type":"string"},{"name":"preMint","type":"uint256"}],"stateMutability":"Nonpayable","type":"Constructor"},{"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"approved","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"Event"},{"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"Event"},{"inputs":[{"indexed":true,"name":"id","type":"uint256"},{"name":"invalid","type":"bool"},{"name":"admin","type":"address"}],"name":"Invalidate","type":"Event"},{"inputs":[{"name":"account","type":"address"}],"name":"Paused","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"previousAdminRole","type":"bytes32"},{"indexed":true,"name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"RoleGranted","type":"Event"},{"inputs":[{"indexed":true,"name":"role","type":"bytes32"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"sender","type":"address"}],"name":"RoleRevoked","type":"Event"},{"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"Event"},{"inputs":[{"name":"account","type":"address"}],"name":"Unpaused","type":"Event"},{"outputs":[{"type":"bytes32"}],"name":"DEFAULT_ADMIN_ROLE","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"name":"MINTER_ROLE","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"name":"PAUSER_ROLE","stateMutability":"View","type":"Function"},{"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","stateMutability":"View","type":"Function"},{"inputs":[{"name":"tokenId","type":"uint256"}],"name":"burn","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"inputs":[{"name":"role","type":"bytes32"}],"name":"getRoleAdmin","stateMutability":"View","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"role","type":"bytes32"},{"name":"index","type":"uint256"}],"name":"getRoleMember","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"role","type":"bytes32"}],"name":"getRoleMemberCount","stateMutability":"View","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"grantRole","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"hasRole","stateMutability":"View","type":"Function"},{"inputs":[{"name":"id","type":"uint256"},{"name":"invalid","type":"bool"}],"name":"invalidate","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"id","type":"uint256"}],"name":"isInvalid","stateMutability":"View","type":"Function"},{"outputs":[{"name":"id","type":"uint256"}],"inputs":[{"name":"to","type":"address"}],"name":"mint","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"to","type":"address"},{"name":"id","type":"uint256"}],"name":"mintWithID","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"string"}],"name":"name","stateMutability":"View","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","stateMutability":"View","type":"Function"},{"name":"pause","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"name":"paused","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"preMintValue","stateMutability":"View","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"renounceRole","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"role","type":"bytes32"},{"name":"account","type":"address"}],"name":"revokeRole","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"operator","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"baseURI_","type":"string"}],"name":"setBaseURI","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"bool"}],"inputs":[{"name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","stateMutability":"View","type":"Function"},{"outputs":[{"type":"string"}],"name":"symbol","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"index","type":"uint256"}],"name":"tokenByIndex","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","stateMutability":"View","type":"Function"},{"outputs":[{"type":"string"}],"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"totalMinted","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"totalSupply","stateMutability":"View","type":"Function"},{"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"transferFrom","stateMutability":"Nonpayable","type":"Function"},{"name":"unpause","stateMutability":"Nonpayable","type":"Function"}]}];
const abi721 = [
    {
      "inputs": [
        {"name": "name", "type": "string"},
        {"name": "symbol", "type": "string"},
        {"name": "baseTokenURI", "type": "string"},
        {"name": "preMint", "type": "uint256"}
      ],
      "stateMutability": "Nonpayable",
      "type": "Constructor"
    },
    {
      "outputs": [{"type": "string"}],
      "name": "name",
      "stateMutability": "View",
      "type": "Function"
    },
    {
      "outputs": [{"type": "string"}],
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "tokenURI",
      "stateMutability": "View",
      "type": "Function"
    }
  ];
router.get('/nft-info/:contractAddress/:tokenId/:ownerAddress', async (req, res) => {
    try {
        const { contractAddress,tokenId, ownerAddress } = req.params;

        // Crea una instancia del contrato ERC721
        const tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io/',
            solidityNode: 'https://api.trongrid.io/',
            privateKey: null, // Puedes dejarlo como null si no necesitas una clave privada
        });

        // Establece la dirección del propietario
        tronWeb.setAddress(ownerAddress);

        const instance = await tronWeb.contract(abiTrc20, contractAddress);

        // Llama a las funciones del contrato para obtener información
        const nftName = await instance.name().call();
        const symbol = await instance.symbol().call();
        //const nftImage = await instance.baseTokenURI(0).call();
        // Puedes agregar más llamadas aquí para obtener más información del contrato ERC721

        res.json({
            'name': nftName,
            //'id': nftId,
            //'image': nftImage,
            'symbol':symbol,
            // Agrega más campos según sea necesario
        });
    } catch (error) {
        console.error('Error al obtener información del NFT ERC721:', error);
        res.status(500).json({ error: 'Error al obtener información del NFT ERC721.' });
    }
});




//TRC20 functions 
const abiTrc20 = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_value","type":"uint256"}],"name":"calcFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"oldBalanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

router.get('/token-info/:contractAddress/:ownerAddress', async (req, res) => {
    try {
        const { contractAddress, ownerAddress } = req.params;

        // Crea una instancia del contrato TRC20
        const tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io/',
            solidityNode: 'https://api.trongrid.io/',
            privateKey: null, // Puedes dejarlo como null si no necesitas una clave privada
        });

        // Establece la dirección del propietario
        tronWeb.setAddress(ownerAddress);

        const instance = await tronWeb.contract(abiTrc20, contractAddress);

        // Llama a las funciones del contrato para obtener información
        const tokenName = await instance.name().call();
        const decimals = await instance.decimals().call();
        const tokenSymbol = await instance.symbol().call();
        // Puedes agregar más llamadas aquí para obtener más información del contrato

        res.json({
            'name': tokenName,
            'decimals': decimals,
            'symbol': tokenSymbol,
            // Agrega más campos según sea necesario
        });
    } catch (error) {
        console.error('Error al obtener información del token TRC20:', error);
        res.status(500).json({ error: 'Error al obtener información del token TRC20.' });
    }
})


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
});

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
})

module.exports = router;
