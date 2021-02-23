/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module gives a few basic functions to interact with the Smart-Chain Certification API
 */

const config = require('../config.json');	//module customisation
const mysql = require('mysql2/promise'); 			//used to communicate with the DB
const axios = require('axios');				//used to send HTTP requests


/**Parameters of the HTTP requests
* {String} BASE_URL	- url of the API
* {String} AUTH_TOKEN	- client token to connect the API
*/

axios.defaults.baseURL = config.BASE_URL;


/**
* Function that connects to the DB, gets the new hashes, sends them to the API, gets the jobID from the API and stores it in the DB,
* @param    {String} DB_HOSTNAME
* @param    {number} DB_PORT
* @param    {String} DB_USER
* @param    {String} DB_PASSWORD
* @param    {String} DB_NAME
*/

async function sendBatch(DB_HOSTNAME, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) {

};

/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- JSON 
*/

async function getBitcoinTxs() {
    axios.defaults.baseURL = "https://blockchain.info";
	const url = "/rawaddr/" + config.BitcoinAddress;
	const apiResp = await axios.get(url);
	return apiResp.data.state;
};

/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- extended status
*/

async function getEthereumTxs() {
    axios.defaults.baseURL = "https://api.etherscan.io"
	const url = "/api?module=account&action=txlist&address=" + config.EthereumAddress + "&startblock=0&endblock=99999999&sort=asc&apikey=" + config.EtherscanToken;
	const apiResp = await axios.get(url);
	return apiResp.data;
};

/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- extended status
*/

async function getTezosTxs() {
    axios.defaults.baseURL = "https://api.tzkt.io";
	const url = "/v1/accounts/" + config.TezosAddress + "/operations";
	const apiResp = await axios.get(url);
	return apiResp.data;
};

