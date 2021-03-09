// config.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
   path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

module.exports = {
    // Environment variables
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Tezos Network variables
    TEZOS_NETWORK: process.env.TEZOS_NETWORK || 'https://delphinet.smartpy.io',

    // Signer Variables
    SIGNER_EMAIL: process.env.SIGNER_EMAIL || 'tenhvyxn.obmprmyv@tezos.example.org',
    SIGNER_PASSWORD: process.env.SIGNER_PASSWORD || 'EyMJCD0OZQ',
    SIGNER_MNEMONIC: process.env.SIGNER_MNEMONIC || 'early night exotic romance own casino winner slogan grant ethics light meat digital gasp around',
    SIGNER_SECRET: process.env.SIGNER_SECRET || '3f45364979235067e8008bb64863f58aa4ff1571',
    
    // Database variables
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_NAME: process.env.DB_NAME || 'smart_link_ICO',

    // Blockchains variables to query addresses
    BITCOINADDRESS: process.env.BITCOINADDRESS,
    ETHEREUMADDRESS: process.env.ETHEREUMADDRESS,
    TEZOSADDRESS: process.env.TEZOSADDRESS,
    ETHERSCANTOKEN: process.env.ETHERSCANTOKEN,

    // Revolut variables to query bank API
    REVOLUT_REFRESH_TOKEN:process.env.REVOLUT_REFRESH_TOKEN,
    REVOLUT_CLIENT_ID:process.env.REVOLUT_CLIENT_ID,
    REVOLUT_JWT:process.env.REVOLUT_JWT
  }