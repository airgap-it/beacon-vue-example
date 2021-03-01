/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module 
 */

const mysql2 = require('mysql2/promise');    // Used to communicate with the Database
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs/promises")
const path = require('path')

const config = require('../../config/config.js');

const export_only_kyc = "SELECT id_kyc, addr_type, k.sender_addr, reception_addr,  mail  FROM kyc k LEFT JOIN transactions t ON t.sender_addr = k.sender_addr WHERE tx_hash IS NULL";
const export_only_transactions = "SELECT temp2.sender_addr, temp2.tx_hash FROM (SELECT t.sender_addr, b.tx_hash FROM transactions t INNER JOIN kyc k ON k.sender_addr = t.sender_addr INNER JOIN blockchain b ON b.tx_hash = t.tx_hash) temp1 RIGHT JOIN (SELECT t.sender_addr, tx_hash FROM kyc k RIGHT JOIN transactions t ON k.sender_addr = t.sender_addr WHERE k.sender_addr IS NULL) temp2 on temp1.tx_hash = temp2.tx_hash WHERE temp1.sender_addr IS NULL";
const export_smak_transactions = "SELECT is_smak_sent FROM kyc WHERE is_smak_sent IS NOT NULL GROUP BY is_smak_sent";

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

async function writeToCSV(data, file_name){
    const jsonData = JSON.parse(JSON.stringify(data));
    console.log("jsonData", jsonData);

    const json2csvParser = new Json2csvParser({ header: true});
    const csv = json2csvParser.parse(jsonData);

    await fs.writeFile(file_name+".csv", csv);
    console.log("Write to csv successfully!");

}

function endDbConnection(connection_to_end)
{
    console.log("Smartlink ICO API: Closing connection");
    connection_to_end.end();
    console.log("Smartlink ICO API: Connection closed !");
}

async function exportToCSV(query, file_name)
{
    // Connection to the database
    const connection = await connectToDb();
      
    // Querying the database for participants and their invested amounts
    console.log("Smartlink ICO API: Querying the database...");
    const [results, columns_def] = await connection.execute(query);	

    if (results === undefined){
        throw "ERROR Smartlink ICO API: no response from database";
    }

    if(results.length < 1)
    { 
        console.log("Smartlink ICO API: No data to export!")
    }

    endDbConnection(connection)

    await writeToCSV(results, file_name)
}

async function main(){
    const dir = './output';

    // creates the output directory
    await fs.mkdir(dir, { recursive: true });
    console.log("Directory is created.");

    // export data
    await exportToCSV(export_only_kyc, "output/kyc")
    await exportToCSV(export_only_transactions, "output/transactions")
    await exportToCSV(export_smak_transactions, "output/smak_transactions")
} 

main();