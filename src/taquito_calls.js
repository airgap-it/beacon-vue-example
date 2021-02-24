
var taquito_1 = require("@taquito/taquito");
var signer_1 = require("@taquito/signer");
var Tezos = new taquito_1.TezosToolkit('https://delphinet.smartpy.io');
var FAUCET_KEY = require('./contract/faucet-account.json');
var investors = [
    {
        receiver: "tz1ezATW7wh5Q8FTyTFbKWzc4C64miYWeJar",
        smak: 10,
        duration: 1000
    },
    {
        receiver: "tz1UuFDiMMiedwh6DHaWyFqT5baEdoCjm5zD",
        smak: 20,
        duration: 1
    },
];
signer_1.importKey(Tezos, FAUCET_KEY.email, FAUCET_KEY.password, FAUCET_KEY.mnemonic.join(' '), FAUCET_KEY.secret);
var contract = Tezos.contract
    .at('KT1UULSK1vjMrNjoU3fk5QL52o7T5AREohsF')
    .then(function (contract) {
    var batch = Tezos.batch();
    for (var i = 0; i < investors.length; i++) {
        batch.withContractCall(contract.methods.transferAndFreeze(investors[i].receiver, investors[i].smak, investors[i].duration));
    }
    batch.send()
        .then(function (batchOp) {
        batchOp.confirmation();
        console.log("Hash of the operation", batchOp.hash);
        console.log("Result of the operation", batchOp.results);
    });
});
