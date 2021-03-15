// config.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
   path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

module.exports = {
    // Environment variables
    NODE_ENV: process.env.NODE_ENV,

    // Tezos Network variables
    RPC_ADDRESS: process.env.RPC_ADDRESS,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,

    // Signer Variables
    SIGNER_EMAIL: process.env.SIGNER_EMAIL,
    SIGNER_PASSWORD: process.env.SIGNER_PASSWORD,
    SIGNER_MNEMONIC: process.env.SIGNER_MNEMONIC,
    SIGNER_SECRET: process.env.SIGNER_SECRET,
    
    // Database variables
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    // Blockchains variables to query addresses
    BITCOINADDRESS: process.env.BITCOINADDRESS,
    ETHEREUMADDRESS: process.env.ETHEREUMADDRESS,
    TEZOSADDRESS: process.env.TEZOSADDRESS,
    ETHERSCANTOKEN: process.env.ETHERSCANTOKEN,

    // Revolut variables to query bank API
    REVOLUT_REFRESH_TOKEN:process.env.REVOLUT_REFRESH_TOKEN,
    REVOLUT_CLIENT_ID:process.env.REVOLUT_CLIENT_ID,
    REVOLUT_JWT:process.env.REVOLUT_JWT,

    // APIs
    TEZOS_API: process.env.TEZOS_API || 'https://api.delphinet.tzkt.io',
    BITCOIN_API: process.env.BITCOIN_API || 'https://blockchain.info',
    ETHEREUM_API: process.env.ETHEREUM_API || 'https://api-ropsten.etherscan.io',
    REVOLUT_API: process.env.REVOLUT_API || 'https://sandbox-b2b.revolut.com',

    EUR_USD_RATE: process.env.EUR_USD_RATE || 0.84

  }