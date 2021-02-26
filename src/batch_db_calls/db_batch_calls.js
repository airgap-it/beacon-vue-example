/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module 
 */

const mysql2 = require('mysql2/promise');    // Used to communicate with the Database
const taquito = require("@taquito/taquito");    // Used to communicate with the Tezos Blockchain
const signer = require("@taquito/signer");      // Used to be able to interact with all the functions requiring signing in
const config = require('../../config/config.js');

const Tezos = new taquito.TezosToolkit('https://delphinet.smartpy.io');     // Connexion to the desired Tezos Network

const get_participants_and_their_amount = 'SELECT reception_addr, sum(amount*price_euro) AS total_amount FROM transactions t INNER JOIN kyc k ON k.sender_addr = t.sender_addr INNER JOIN blockchain b ON b.tx_hash = t.tx_hash WHERE is_smak_sent IS false GROUP BY reception_addr'

// Import the signer account
signer.importKey(
    Tezos, 
    config.SIGNER_EMAIL, 
    config.SIGNER_PASSWORD, 
    config.SIGNER_MNEMONIC, 
    config.SIGNER_SECRET
);

async function getBatchesFromDb()
{
    // Connection to the database
    console.log("Smartlink ICO API: Connecting to the database...");
    const connection = await mysql2.createConnection({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME
      });
      

    // Querying the database for participants and their invested amounts
    console.log("Smartlink ICO API: Querying the database...");
    const [results, columns_def] = await connection.execute(get_participants_and_their_amount);	

    if (results === undefined){
        throw "ERROR Smartlink ICO API: no response from database";
    }

    if(results.length < 1)
    { 
        console.log("Smartlink ICO API: No data to handle!")
    }

    // Batching the results

    // Ending connection with database
    console.log("Smartlink ICO API: Closing connection");
    connection.end();
    console.log("Smartlink ICO API: Connection closed !");

    return results;

}

async function prepareBatchToSendToBlockchain(contract, data_batch)
{
    // Init batch
    const batch = await Tezos.batch();
    
    // Add transactions to send to the batch
    for(var i = 0; i < data_batch.length; i++)
    {
        console.log(data_batch[i].reception_addr)
        var smakAmount = computeSmakAmount(data_batch[i].total_amount)
        var duration = computeFreezeDuration()
        
        console.log(data_batch[i].reception_addr)
        console.log(smakAmount)
        console.log(duration)

        batch.withContractCall(
            contract.methods.transferAndFreeze(
                data_batch[i].reception_addr,
                smakAmount,
                duration
            )
        )
    }

    return batch;
}

async function sendBatchesToBlockchain(data_batch)
{
    // Get the contract
    const contract = await Tezos.contract.at('KT1F6R2HyqnUcZ1sL9c89iaGYYhYAuukTMA3');
    
    console.log("Smartlink ICO API: Preparing the batch n°...");
    // Prepare the batch to send
    const batch = await prepareBatchToSendToBlockchain(contract, data_batch)
    
    console.log("Smartlink ICO API: Sending the batch n°...");
    
    // Send the batch
    const batchOp = await batch.send().catch(error => {
        console.log(error)
    });

    await batchOp.confirmation();
    console.log("Smartlink ICO API: The operation of the batch n° is confirmed!");
    console.log("Smartlink ICO API: The hash of the operation is ", batchOp.hash);
}

function computeSmakAmount(euroPrice){
    const smakPriceEur = 0.5
    const smakPrecision = 1000
    var smakAmount = Math.ceil(euroPrice / smakPriceEur * smakPrecision)

    return smakAmount
}

function computeFreezeDuration(){
    const finalDate = new Date("02/24/2021")
    
    // This operation returns the number of milliseconds between the two dates
    // If it is negative, this means that the finalDate has expired, so the account needs to be freezed for a default duration
    var datesDiff = finalDate - Date.now()
    
    // Default duration of the freeze
    var duration = 1

    if(datesDiff >0){
        duration = Math.ceil(datesDiff/1000)
    }
    
    return duration
}

console.log(config.TEZOS_NETWORK)

getBatchesFromDb().then(
    (results)  => {
        sendBatchesToBlockchain(results)
    }
)




