/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module 
 */

const config = require('../../config/config.js');	                //env variables
const mysql2 = require('mysql2/promise'); 			//used to communicate with the DB
const axios = require('axios');				//used to send HTTP requests


/////////////////////////////////////////// DATABASE ///////////////////////////////////////////

/**
* Function that connects to the database, it takes parameters from config file
*/
async function connectToDb() {
    console.log("Smartlink ICO API: Connecting to the database...");
    const connection = await mysql2.createConnection({
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME
      }).catch(error => {console.log(error)});
      console.log("Smartlink ICO API: Database connected !");
    return connection;
}


/**
* Function that closes the connection to the database
* @param connection_to_end
*/
function endDbConnection(connection_to_end)
{
    console.log("Smartlink ICO API: Closing connection...");
    connection_to_end.end();
    console.log("Smartlink ICO API: Connection closed !");
}


/**
* Function that gets all the hashes of the transactions registered in the table "blockchain"
* @param    co  the current connection to the database
* @returns      hashes of transactions
*/
async function getDBTransactions(co) {

    console.log("Smartlink ICO API: Querying the database for the transactions hashes...");
    const [rows, fields] = await co.execute('SELECT tx_hash FROM blockchain').catch(error => {console.log(error)});

    if (rows === undefined){
        throw "ERROR Smartlink ICO API: no response from database";
    }

    const res = rows.map(x => { return x['tx_hash']});
    console.log("Smartlink ICO API: " + res.length + " transactions returned");
    return res;
}


/**
* Function that adds new transactions in the database for a specific coin (BTC, ETH or XTZ),
* it compares the input transactions (txs) with the transactions already in the DB (db_txs),
* it adds the latest price in USD for each transaction
* @param    co      the current connection to the database
* @param    db_txs  transactions in the database
* @param    txs     list of transactions to be added
* @param    price   price in USD
*/
async function addDBTransactions(co, db_txs, txs, coin, price) {

    console.log("Smartlink ICO API: Adding new " + coin + " transactions to the database");
    
    // queries to insert data in the "blockchain" and "transactions" tables
    const insert_blockchain = 'INSERT INTO blockchain (tx_hash, amount, price_dollar, tx_date, price_date) VALUES (?, ?, ?, ?, ?)';
    const insert_transactions = 'INSERT INTO transactions (sender_addr, tx_hash) VALUES (?, ?)';

    let index = index2 = blockchain_counter = transactions_counter = 0;
    const txs_nb = txs.length;

    for (; index < txs_nb; index++) {
        
        // checks for each transaction to be added of the transaction is already in the database
        if (!db_txs.includes(txs[index].hash)) {

            // if not present, adds the transactions in the blockchain table and updates associated counter
            await co.query(insert_blockchain, [txs[index].hash, txs[index].amount, (price.usd).toString(), txs[index].timestamp, price.last_updated_at]).catch(error => {console.log(error)});
            blockchain_counter++;

            // iterates through the array of sender addresses (can only be > 1 for BTC because of UTxO model, = 1 for ETH and XTZ)
            let sender_addr_nb = txs[index].sender.length;
            for (index2 = 0; index2 < sender_addr_nb; index2++) {
                await co.query(insert_transactions, [txs[index].sender[index2], txs[index].hash]).catch(error => {console.log(error)});
                transactions_counter++;
            }
        }   
    }
    // shows counters of rows inserted for each tables
    console.log("Smartlink ICO API: " + blockchain_counter + " rows added in table blockchain");
    console.log("Smartlink ICO API: " + transactions_counter + " rows added in table transactions");
}



/////////////////////////////////////////// REVOLUT API ///////////////////////////////////////////

/**
* Function that uses the refresh token to get a new access token from the Revolut API,
* @returns  {string}  Revolut API access token 
*/
async function connectRevolut() {
    console.log("Smartlink ICO API: Refreshing connection to Revolut API...");
    axios.defaults.baseURL = config.REVOLUT_API;
	const url = "/api/1.0/auth/token";
    const options = {
        grant_type: 'refresh_token',
        refresh_token: config.REVOLUT_REFRESH_TOKEN,
        client_id: config.REVOLUT_CLIENT_ID,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: config.REVOLUT_JWT
    };
    const encodeForm = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
            .join('&');
      }
    const apiResp = await axios.post(url, encodeForm(options), {headers: {'Accept': 'application/json'}}).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: Connected to Revolut API, new access token : " + apiResp.data.access_token);
	return apiResp.data.access_token;
};


/**
* Function that gets the details of the transactions received on the Revolut accounts (all accounts linked to the client),
* @param    {string}    access_token    to the Revolut API
* @returns  {JSON}                      list of transactions 
*/
async function getRevolutTxs(access_token) {
    console.log("Smartlink ICO API: Fetching Revolut transactions...");
    axios.defaults.baseURL = config.REVOLUT_API;
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
	const url = "/api/1.0/transactions?type=transfer";
	const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: " + apiResp.data.length + " transactions fetched");
	return apiResp.data;
};


/**
* Function that extracts usefull information about the Revolut transactions :
*   - sender identified by the reference of the transfer (has to be unique)
*   - amount received
*   - currency
*   - timestamp of the transaction
*   - hash of the transaction for further analysis
* @param    {JSON} txs  transactions with full detail
* @returns  {JSON}      transactions with important information only
*/
function parseRevolutTxs(txs) {
    const res = txs.map(x => {
        return {
                    "sender": [x['reference']],
                    "amount": (x['legs'][0]['amount']).toString(),
                    "currency": x['legs'][0]['currency'],
                    "timestamp": new Date(x['completed_at']).setMilliseconds(0)/1000,
                    "hash": x['id']
                }
    });
    return res;
}


/**
* Function that selects only valid Revolut transactions for which the field timestamp is not NaN and returns USD and EUR transactions separately
* @param    {JSON}          txs                 list of transactions
* @returns  {JSON, JSON}    usd txs, eur txs    list of valid transactions 
*/
function getValidRevolutTxs(txs) {
    const res = txs.filter(x => !!x['timestamp']);
    console.log("Smartlink ICO API: " + res.length + " of " + txs.length + " valid Revolut transactions (that have been completed)");
    const usd_txs = res.filter(x => x['currency'] == "USD");
    console.log("Smartlink ICO API: " + usd_txs.length + " USD transactions");
    const eur_txs = res.filter(x => x['currency'] == "EUR");
    console.log("Smartlink ICO API: " + eur_txs.length + " EUR transactions");
    return [usd_txs, eur_txs];
}


/////////////////////////////////////////// BITCOIN ///////////////////////////////////////////

/**
* Function that gets the details of the transactions received on the Bitcoin address,
* @returns  {JSON}  list of transactions 
*/
async function getBitcoinTxs() {
    console.log("Smartlink ICO API: fetching Bitcoin transactions...");
    axios.defaults.baseURL = config.BITCOIN_API;
	const url = "/rawaddr/" + config.BITCOINADDRESS;
	const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: " + apiResp.data.txs.length + " transactions fetched");
	return apiResp.data.txs;
};


/**
* Function that extracts usefull information about the Bitcoin transactions :
*   - sender address
*   - block height
*   - amount of BTC received
*   - timestamp of the transaction
*   - hash of the transaction for further analysis
* @param    {JSON} txs  transactions with full detail
* @returns  {JSON}      transactions with important information only
*/
function parseBitcoinTxs(txs) {
    const res = txs.map(x => {
        return {
                    "sender": x['inputs'].map(x => {return x['prev_out']['addr']}), // retourne l'ensemble des utxos entrantes
                    "block": x['block_height'],
                    "amount": (x['result']/100000000).toString(),
                    "timestamp": x['time'],
                    "hash": x['hash']
                }
    });
    return res;
}


/**
* Function that gets the current block height of the Bitcoin blockchain,
* @returns  {number} 
*/
async function getBitcoinBlock() {
    console.log("Smartlink ICO API: fetching current Bitcoin block...");
    axios.defaults.baseURL = config.BITCOIN_API;
	const url = "/latestblock";
	const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: current Bitcoin block is " + apiResp.data.height);
	return apiResp.data.height;
}


/**
* Function that selects only valid Bitcoin transactions (with 3 confirmations or more)
* @param    {JSON}   txs            list of transactions
* @param    {number} block_height   current block height
* @returns  {JSON}                  list of valid transactions 
*/
function getValidBitcoinTxs(txs, block_height) {
    const res = txs.filter(x => block_height - x['block'] >= 3);
    console.log("Smartlink ICO API: " + res.length + " of " + txs.length + " valid Bitcoin transactions (3 or more block confirmations)");
    return res;
}



/////////////////////////////////////////// ETHEREUM ///////////////////////////////////////////

/**
* Function that gets the details of the transactions received on the Ethereum address,
* @returns  {String} 		- list of transactions
*/
async function getEthereumTxs() {
    console.log("Smartlink ICO API: fetching Ethereum transactions...");
    axios.defaults.baseURL = config.ETHEREUM_API;
	const url = "/api?module=account&action=txlist&address=" + config.ETHEREUMADDRESS + "&startblock=0&endblock=99999999&sort=asc&apikey=" + config.ETHERSCANTOKEN;
	const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: " + apiResp.data.result.length + " transactions fetched");
	return apiResp.data.result;
};


/**
* Function that extracts usefull information about the Ethereum transactions :
*   - sender address
*   - amount of ETH received
*   - timestamp of the transaction
*   - hash of the transaction for further analysis
*   - number of confirmations
* @param    {JSON} txs  transactions with full detail
* @returns  {JSON}      transactions only with important informations
*/
function parseEthereumTxs(txs) {
    const res = txs.map(x => { 
        return {
                    "sender": [x['from']],
                    "amount": (x['value'].slice(0, -10)/100000000).toString(),   // ethereum has a 10e-18 precision, we reduce it to 10e-8
                    "timestamp": parseInt(x['timeStamp'], 10),
                    "hash": x['hash'],
                    "confirmations": x['confirmations']
                }
    });
    return res;
}


/**
* Function that selects only valid Ethereum transactions (with 100 confirmations or more)
* @param    {JSON}   txs            list of transactions
* @returns  {JSON}                  list of valid transactions 
*/
function getValidEthereumTxs(txs) {
    const res = txs.filter(x => x['confirmations'] >= 100);
    console.log("Smartlink ICO API: " + res.length + " of " + txs.length + " valid Ethereum transactions (100 or more block confirmations)");
    return res;
}



/////////////////////////////////////////// TEZOS ///////////////////////////////////////////


/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- list of transactions
*/
async function getTezosTxs() {
    console.log("Smartlink ICO API: fetching Tezos transactions...");
    axios.defaults.baseURL = config.TEZOS_API;
	const url = "/v1/accounts/" + config.TEZOSADDRESS + "/operations";
	const apiResp = await axios.get(url).catch(error => {console.log(error)});
    // keeps only transactions, removes "key revelation" or "delegation" associated transactions
    const res = apiResp.data.filter(x => x['type'] == 'transaction');
    console.log("Smartlink ICO API: " + res.length + " transactions fetched");
	return res;
};


/**
* Function that extracts usefull information about the Tezos transactions :
*   - sender address
*   - amount of XTZ received
*   - timestamp of the transaction
*   - hash of the transaction for further analysis
*   - block height
* @param    {JSON} txs  transactions with full detail
* @returns  {JSON}      transactions only with important informations
*/
function parseTezosTxs(txs) {
    const res = txs.map(x => {
        return {
                    "sender": [x['sender']['address']],
                    "amount": (x['amount']/1000000).toString(),
                    "timestamp": new Date(x['timestamp'])/1000,
                    "hash": x['hash'],
                    "block": x['level']
                }
    });
    return res;
}


/**
* Function that gets the current block height of the Tezos blockchain,
* @returns  {number}
*/
async function getTezosBlock() {
    console.log("Smartlink ICO API: fetching current Tezos block...");
    axios.defaults.baseURL = config.TEZOS_API;
    const url = "/v1/blocks/count";
    const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: current Tezos block is " + apiResp.data);
    return apiResp.data;
}
    

/**
* Function that selects only valid Tezos transactions (with 20 confirmations or more)
* @param    {JSON}   txs            list of transactions
* @param    {number} block_height   current block height
* @returns  {JSON}                  list of valid transactions 
*/
function getValidTezosTxs(txs, block_height) {
    const res = txs.filter(x => block_height - x['block'] >= 20);
    console.log("Smartlink ICO API: " + res.length + " of " + txs.length + " valid Tezos transactions (20 or more block confirmations)");
    return res;
}


/////////////////////////////////////////// PRICES ///////////////////////////////////////////

/**
* Function that gets the last values with their timestamps of BTC, ETH and XTZ against USD
* @returns  {JSON} 		- list of transactions
*/
async function getPrices() {
    console.log("Smartlink ICO API: fetching latest coins prices...");
    axios.defaults.baseURL = "https://api.coingecko.com";
    const url = "/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctezos&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true";
    const apiResp = await axios.get(url).catch(error => {console.log(error)});
    console.log("Smartlink ICO API: latest coins prices :");
    console.log("Bitcoin : " + apiResp.data.bitcoin.usd + " $ (" + new Date(apiResp.data.bitcoin.last_updated_at*1000) + ")");
    console.log("Ethereum : " + apiResp.data.ethereum.usd + " $ (" + new Date(apiResp.data.ethereum.last_updated_at*1000) + ")");
    console.log("Tezos : " + apiResp.data.tezos.usd + " $ (" + new Date(apiResp.data.tezos.last_updated_at*1000) + ")");
    return apiResp.data;
}
    







async function main(){

    
    // gets Bitcoin transactions and sorts them
    const btc = await getBitcoinTxs();
    const pbtc = await parseBitcoinTxs(btc);
    const block = await getBitcoinBlock();
    const vbtc = await getValidBitcoinTxs(pbtc, block);
    console.log(vbtc);

    // gets Ethereum transactions and sorts them
    const eth = await getEthereumTxs();
    const peth = await parseEthereumTxs(eth);
    const veth = await getValidEthereumTxs(peth);
    console.log(veth);

    // gets Tezos transactions and sorts them
    const xtz = await getTezosTxs();
    const pxtz = await parseTezosTxs(xtz);
    const xtzblock = await getTezosBlock();
    const vxtz = await getValidTezosTxs(pxtz, xtzblock);
    console.log(vxtz);

    // gets Revolut transactions and sorts them
    const token = await connectRevolut();
    const txs = await getRevolutTxs(token);
    const ptxs = await parseRevolutTxs(txs);
    const [usd_txs, eur_txs] = getValidRevolutTxs(ptxs);


    // gets last prices of BTC, ETH and XTZ in USD
    const prices = await getPrices();

    // adds new transactions to the database
    const co = await connectToDb();
    const db_txs = await getDBTransactions(co);
    await addDBTransactions(co, db_txs, vbtc, "Bitcoin", prices.bitcoin);
    await addDBTransactions(co, db_txs, veth, "Ethereum", prices.ethereum);
    await addDBTransactions(co, db_txs, vxtz, "Tezos", prices.tezos);
    await addDBTransactions(co, db_txs, usd_txs, "Revolut (USD)", {"usd":1,"last_updated_at":new Date().setMilliseconds(0)/1000});
    await addDBTransactions(co, db_txs, eur_txs, "Revolut (EUR)", {"usd":config.EUR_USD_RATE,"last_updated_at":new Date().setMilliseconds(0)/1000});
    endDbConnection(co);

    
}

main();
