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

    BITCOINADDRESS: process.env.BITCOINADDRESS,
    ETHEREUMADDRESS: process.env.ETHEREUMADDRESS,
    TEZOSADDRESS: process.env.TEZOSADDRESS,
    ETHERSCANTOKEN: process.env.ETHERSCANTOKEN
  }