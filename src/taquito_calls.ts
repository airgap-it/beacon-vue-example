import { TezosToolkit } from "@taquito/taquito";
import { importKey } from "@taquito/signer"

const Tezos = new TezosToolkit('https://delphinet.smartpy.io')
const FAUCET_KEY = require('./contract/faucet-account.json')

let investors: any = [
    {
        receiver : "tz1ezATW7wh5Q8FTyTFbKWzc4C64miYWeJar",
        smak : 10,
        duration : 1000
    },
    {
        receiver : "tz1UuFDiMMiedwh6DHaWyFqT5baEdoCjm5zD",
        smak : 20, 
        duration : 1
    },
]

importKey(
    Tezos,
    FAUCET_KEY.email,
    FAUCET_KEY.password,
    FAUCET_KEY.mnemonic.join(' '),
    FAUCET_KEY.secret
);

const contract = Tezos.contract
.at('KT1UULSK1vjMrNjoU3fk5QL52o7T5AREohsF')
.then((contract) => {
    const batch = Tezos.batch();
    for(let i=0; i < investors.length; i++)
    {
        batch.withContractCall(contract.methods.transferAndFreeze(
            investors[i].receiver,
            investors[i].smak,
            investors[i].duration
        ))
    }

    batch.send()
    .then((batchOp) => {
        console.log("yay")
        batchOp.confirmation();
        console.log("Hash of the operation", batchOp.hash)
        console.log("Result of the operation", batchOp.results);
        }
    )
})




   



