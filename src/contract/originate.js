"use strict";
exports.__esModule = true;
var signer_1 = require("@taquito/signer");
var taquito_1 = require("@taquito/taquito");
var tezos = new taquito_1.TezosToolkit('https://delphinet.smartpy.io');
var FAUCET_KEY = require('./faucet-account.json');
signer_1.importKey(tezos, FAUCET_KEY.email, FAUCET_KEY.password, FAUCET_KEY.mnemonic.join(' '), FAUCET_KEY.secret);
tezos.contract
    .originate({
    code: require('./ICO-contract.json'),
    init: require('./ICO-contract-storage.json')
})
    .then(function (originationOp) {
    console.log("Waiting for confirmation of origination for " + originationOp.contractAddress + "...");
    return originationOp.contract();
})
    .then(function (contract) {
    console.log("Origination completed.");
})["catch"](function (error) { return console.log("Error: " + JSON.stringify(error, null, 2)); });
