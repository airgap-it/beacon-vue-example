var signer = require("@taquito/signer");
var taquito = require("@taquito/taquito");
const config = require('../../config/config.js');

var Tezos = new taquito.TezosToolkit(config.TEZOS_NETWORK);
// Import the signer account
signer.importKey(
    Tezos, 
    config.SIGNER_EMAIL, 
    config.SIGNER_PASSWORD, 
    config.SIGNER_MNEMONIC, 
    config.SIGNER_SECRET
);

async function originate()
{
    // Originate the contract
    const originationOp = await Tezos.contract.originate({
        code: require('./ICO-contract.json'),
        init: require('./ICO-contract-storage.json')
    }).catch(error => {
        console.log(error)
    });

    console.log("Waiting for confirmation of origination for " + originationOp.contractAddress + "...");
    
    // Get the originated contract
    const contract = await originationOp.contract().catch(error => {
        console.log(error)
    });
    console.log("Origination completed.");
    
}

originate();