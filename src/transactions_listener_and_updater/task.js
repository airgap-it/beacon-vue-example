/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module 
 */

const config = require('../../config/config.js');	                //env variables
const mysql = require('mysql2/promise'); 			//used to communicate with the DB
const axios = require('axios');				//used to send HTTP requests






const connection = await mysql.createConnection({
    host     : config.DB_HOST,
    user     : config.DB_USER,
    password : config.DB_PASSWORD,
    database : config.DB_NAME
}).catch(error => {
        console.log(error)
});


async function getDBTransactions(co) {
    const [rows, fields] = await co.execute('SELECT * FROM ');
}


/////////////////////////////////////////// BITCOIN ///////////////////////////////////////////

/**
* Function that gets the details of the transactions received on the Bitcoin address,
* @returns  {JSON}  list of transactions 
*/
async function getBitcoinTxs() {
    axios.defaults.baseURL = "https://blockchain.info";
	const url = "/rawaddr/" + config.BITCOINADDRESS;
	const apiResp = await axios.get(url);
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
    const resb = txs.map(x => {
        return {
                    "sender": x['inputs'].map(x => {return x['prev_out']['addr']}), // retourne l'ensemble des utxos entrantes
                    "block": x['block_height'],
                    "amount": x['result'],
                    "timestamp": x['time'],
                    "hash": x['hash']
                }
    });
    return res;
}


/**
* Function that gets the current block height of the Bitcoin blockchain,
* @returns  {JSON}  list of transactions 
*/
async function getBitcoinBlock() {
    axios.defaults.baseURL = "https://blockchain.info";
	const url = "/latestblock";
	const apiResp = await axios.get(url);
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
    return res;
}



/////////////////////////////////////////// ETHEREUM ///////////////////////////////////////////

/**
* Function that gets the details of the transactions received on the Ethereum address,
* @returns  {String} 		- list of transactions
*/
async function getEthereumTxs() {
    axios.defaults.baseURL = "https://api.etherscan.io"
	const url = "/api?module=account&action=txlist&address=" + config.ETHEREUMADDRESS + "&startblock=0&endblock=99999999&sort=asc&apikey=" + config.ETHERSCANTOKEN;
	const apiResp = await axios.get(url);
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
                    "sender": x['from'],
                    "amount": x['value'],
                    "timestamp": x['timeStamp'],
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
    return res;
}



/////////////////////////////////////////// TEZOS ///////////////////////////////////////////

/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- list of transactions
*/
async function getTezosTxs() {
    axios.defaults.baseURL = "https://api.tzkt.io";
	const url = "/v1/accounts/" + config.TEZOSADDRESS + "/operations";
	const apiResp = await axios.get(url);
	return apiResp.data;
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
                    "sender": x['sender']['address'],
                    "amount": x['amount'],
                    "timestamp": x['timestamp'],
                    "hash": x['hash'],
                    "block": x['level']
                }
    });
    return res;
}


/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- list of transactions
*/
async function getTezosBlock() {
    axios.defaults.baseURL = "https://api.tzkt.io";
    const url = "/v1/blocks/count";
    const apiResp = await axios.get(url);
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
    return res;
}


/////////////////////////////////////////// PRICES ///////////////////////////////////////////

/**
* Function that gets the last values with their timestamps of BTC, ETH and XTZ against USD
* @returns  {JSON} 		- list of transactions
*/
async function getPrices() {
    axios.defaults.baseURL = "https://api.coingecko.com";
    const url = "/api/v3/simple/price?ids=bitcoin%2Cethereum%2Ctezos&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true";
    const apiResp = await axios.get(url);
    return apiResp.data;
}
    







async function main(){
    /*
    const res = await getBitcoinTxs();
    console.log(res);
    */
   /*
    const res = await getEthereumTxs();
    //console.log(res);
    const txs = parseEthereumTxs(res);
    console.log(txs);
    */
    /*
    const res = await getTezosTxs();
    //console.log(res);
    const txs = parseTezosTxs(res);
    console.log(txs);
    */
   const res = await getBitcoinBlock();
   console.log(res);
}

main();



