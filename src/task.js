/**
 * @module smart-link-ICO
 * @author Smart-Chain
 * @version 1.0.0
 * This module gives a few basic functions to interact with the Smart-Chain Certification API
 */

require('dotenv').config({ path: process.env.PWD + `/../.env` });	                //module customisation
const mysql = require('mysql2/promise'); 			//used to communicate with the DB
const axios = require('axios');				//used to send HTTP requests




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

/**c
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- JSON 
*/

async function getBitcoinTxs() {
    axios.defaults.baseURL = "https://blockchain.info";
	const url = "/rawaddr/" + process.env.BITCOINADDRESS;
	const apiResp = await axios.get(url);
	return apiResp.data.txs;
};

function parseBitcoinTxs(txs) {
    const resb = txs.map(x => {
        return {
                    //"sender": x['inputs'][0]['prev_out']['addr'],
                    /**
                    * Attention ! si plusieurs utxo en inputs, l'adresse d'envoi est-elle la même ? à vérifier
                    */
                    "sender": x['inputs'].map(x => {return {"addr": x['prev_out']['addr'], "value": x['prev_out']['value']}}), // retourne l'ensemble des utxos entrantes pour vérifier le comportement
                    /**
                    * Attention ! s'assurer que l'adresse SmartLink est dans les utxo en outputs et que le montant correspond bien au champ "amount"
                    */
                    "receiver": x['out'].map(x => {return {"addr": x['addr'], "value": x['value']}}),  // retourne l'ensemble des utxos sortantes pour vérifier le comportement
                    "block": x['block_height'],
                    "amount": x['result'],
                    "timestamp": x['time'],
                    "hash": x['hash']
                }
    });
    return res;
}

/** 
 * TO DO 
 * 1) vérifier que le champ "amount" est bien le montant reçu par SmartLink
 * 2) récupérer la hauteur de bloc actuel pour comparer avec le numéro de bloc de la tx et vérifier le nombre de confirmation
*/

/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- extended status
*/

async function getEthereumTxs() {
    axios.defaults.baseURL = "https://api.etherscan.io"
	const url = "/api?module=account&action=txlist&address=" + process.env.ETHEREUMADDRESS + "&startblock=0&endblock=99999999&sort=asc&apikey=" + process.env.ETHERSCANTOKEN;
	const apiResp = await axios.get(url);
	return apiResp.data.result;
};

function parseEthereumTxs(txs) {
    const res = txs.map(x => { 
        return {
                    "sender": x['from'],
                    "receiver": x['to'],
                    "amount": x['value'],
                    "timestamp": x['timeStamp'],
                    "hash": x['hash'],
                    "gas": x['gas'],
                    "gasPrice": x['gasPrice'],
                    "cumulativeGasUsed": x['cumulativeGasUsed'],
                    "gasUsed": x['gasUsed'],
                    "confirmations": x['confirmations']
                }
    });
    return res;
}

/**
 * TO DO
 * vérifier que le champ amount est bien celui reçu par SmartLink et qu'il ne faut pas soustraire le gas ou autre...
 */


/**
* Function that gets the details of the transactions received on the Tezos address,
* @returns  {String} 		- extended status
*/

async function getTezosTxs() {
    axios.defaults.baseURL = "https://api.tzkt.io";
	const url = "/v1/accounts/" + process.env.TEZOSADDRESS + "/operations";
	const apiResp = await axios.get(url);
	return apiResp.data;
};

function parseTezosTxs(txs) {
    const res = txs.map(x => {
        return {
                    "sender": x['sender']['address'],
                    "reveiver": x['target']['address'],
                    "amount": x['amount'],
                    "timestamp": x['timestamp'],
                    "hash": x['hash'],
                    "block": x['level'],
                    "gas": x['gasUsed'],
                    "storage": x['storageUsed'],
                    "bakerFee": x['bakerFee'],
                    "storageFee": x['storagrFee']
                }
    });
    return res;
}

/**
 * TO DO
 * 1) vérifier que le champ amount est bien celui reçu par SmartLink et qu'il ne faut pas soustraire le gas, baker fee...
 * 2) récupérer la hauteur de bloc actuel pour comparer avec le numéro de bloc de la tx et vérifier le nombre de confirmation
*/

async function main(){
    /*
    const res = await getBitcoinTxs();
    console.log(res);
    */
    const res = await getEthereumTxs();
    //console.log(res);
    const txs = parseEthereumTxs(res);
    console.log(txs);
    /*
    const res = await getTezosTxs();
    //console.log(res);
    const txs = parseTezosTxs(res);
    console.log(txs);
    */
}

main();



