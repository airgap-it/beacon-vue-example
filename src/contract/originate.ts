import { importKey } from "@taquito/signer"
import { TezosToolkit } from '@taquito/taquito';

const tezos = new TezosToolkit('https://delphinet.smartpy.io')
const FAUCET_KEY = require('./faucet-account.json')

importKey(
    tezos,
    FAUCET_KEY.email,
    FAUCET_KEY.password,
    FAUCET_KEY.mnemonic.join(' '),
    FAUCET_KEY.secret
);

tezos.contract
  .originate({
    code: require('./ICO-contract.json'),
    init: require('./ICO-contract-storage.json')
  })
  .then((originationOp) => {
    console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
    return originationOp.contract();
  })
  .then((contract) => {
    console.log(`Origination completed.`);
  })
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));