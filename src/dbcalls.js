const mysql = require('mysql2');
const taquito = require("@taquito/taquito");
const signer = require("@taquito/signer");

const Tezos = new taquito.TezosToolkit('https://delphinet.smartpy.io');
const FAUCET_KEY = require('./contract/faucet-account.json');

signer.importKey(
    Tezos, 
    FAUCET_KEY.email, 
    FAUCET_KEY.password, 
    FAUCET_KEY.mnemonic.join(' '), 
    FAUCET_KEY.secret
);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'smart_link_ICO'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});


Tezos.contract
.at('KT1F6R2HyqnUcZ1sL9c89iaGYYhYAuukTMA3')
.then(function (contract) 
{
    connection.query(
        'SELECT reception_addr, sum(amount*price_euro) AS total_amount FROM transactions t INNER JOIN kyc k ON k.sender_addr = t.sender_addr INNER JOIN blockchain b ON b.tx_hash = t.tx_hash WHERE is_smak_sent IS false GROUP BY reception_addr',
        function(err, results) 
        {
            if (err) throw err;
            var smakPriceEur = 0.5;
            var duration = 1;
            
            if(new Date("02/24/2021") - Date.now()>0){
                duration = Math.ceil((new Date("02/24/2021") - Date.now())/1000);
            }

            var batch = Tezos.batch();
            for (var i = 0; i < results.length; i++) {

                console.log(results)
                var smak_amount = Math.ceil((results[i].total_amount/smakPriceEur)*1000)
                batch.withContractCall(
                    contract.methods.transferAndFreeze(
                        results[i].reception_addr, 
                        smak_amount,
                        duration
                        )
                    );
            }
            batch.send()
                .then(function (batchOp) {
                batchOp.confirmation();
                console.log("Hash of the operation", batchOp.hash);
                console.log("Result of the operation", batchOp.results);
            });
        })
}).catch(error => {
    console.log(error)
});