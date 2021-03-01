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

const get_participants_and_their_amount = 'SELECT reception_addr, sum(amount*price_dollar) AS total_amount FROM transactions t INNER JOIN kyc k ON k.sender_addr = t.sender_addr INNER JOIN blockchain b ON b.tx_hash = t.tx_hash where is_smak_sent IS NULL  GROUP BY reception_addr'
const set_sent_smak = 'UPDATE kyc  SET is_smak_sent = ? WHERE reception_addr LIKE ?';

// Import the signer account
signer.importKey(
    Tezos, 
    config.SIGNER_EMAIL, 
    config.SIGNER_PASSWORD, 
    config.SIGNER_MNEMONIC, 
    config.SIGNER_SECRET
);

async function connectToDb()
{
    console.log("Smartlink ICO API: Connecting to the database...");
    const connection = await mysql2.createConnection({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME
      }).catch(error => {console.log(error)});

      return connection;
}

function endDbConnection(connection_to_end)
{
    console.log("Smartlink ICO API: Closing connection");
    connection_to_end.end();
    console.log("Smartlink ICO API: Connection closed !");
}

async function getBatchesFromDb()
{
    // Connection to the database
    const connection = await connectToDb();
      

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
    const data_batches = await chunk(results, 2);

    // Ending connection with database
    endDbConnection(connection)
    return data_batches;

}

async function prepareBatchToSendToBlockchain(contract, data)
{
    // Init batch
    const batch = await Tezos.batch();
    
    // Add transactions to send to the batch
    for(var i = 0; i < data.length; i++)
    {
        var smakAmount = computeSmakAmount(data[i].total_amount)
        var duration = computeFreezeDuration()

        batch.withContractCall(
            contract.methods.transferAndFreeze(
                data[i].reception_addr,
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
    
    // Connect to the database
    const connection = await connectToDb();

    // Prepare the batch to send
    for(var i = 0; i < data_batch.length; i++)
    {
        console.log("Smartlink ICO API: Preparing the batch n° ", i);
        const batch = await prepareBatchToSendToBlockchain(contract, data_batch[i])
        
        console.log("Smartlink ICO API: Sending the batch n° ", i);

        // Send the batch
        const batchOp = await batch.send().catch(error => {
            console.log(error)
        });
        
        // Wait for batch confirmation
        await batchOp.confirmation();
        console.log("Smartlink ICO API: The operation of the batch n° "+i+" is confirmed! The hash of the operation is "+ batchOp.hash);

        // Update the database with the new batch transaction hash
        console.log("Smartlink ICO API:  Now updating the database...");
        await updateKycWithTxHash(connection, data_batch[i], batchOp.hash).catch(error => {console.log(error)});
        console.log("Smartlink ICO API: Database updated! Finished processing batch n° "+i+".");
    }

    endDbConnection(connection)
}

async function updateKycWithTxHash(connection, data, tx_hash)
{
    // For a batch, get the reception address, and update the kyc table accordingly
    for(var i = 0; i < data.length; i++)
    {
        await connection.query(set_sent_smak, [tx_hash, data[i].reception_addr]).catch(error => {console.log(error)});
    }
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

/**
* Function that chunks an array in chunks of a certain size,
* @param    {Array} array	- array to chunk
* @param    {Number} size	- size of the chunks
* @returns  {Array[Array]} 	- array contening the chunks
*/

function chunk(array, size) {
	const chunked_arr = [];
	let copied = [...array]; // ES6 destructuring
	const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
	for (let i = 0; i < numOfChild; i++) {
		chunked_arr.push(copied.splice(0, size));
	}
	return chunked_arr;
}

async function main(){
    const data_in_batches = await getBatchesFromDb();
    sendBatchesToBlockchain(data_in_batches);
}

main();




