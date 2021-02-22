<template>
  <div class="hello">
    <h3>Send SMAK and freeze</h3>
    
    <button v-on:click="sendSMAKfromDBAndFreeze">Send SMAK and freeze</button>
    <br />
    <br />
    <span v-if="opHash">
      address : https://delphi.tzstats.com/{{ opHash }}
      <br />
      <br />
      <pre>
      <code> 
        {{ result }}   
      </code>
      </pre>
    </span>
    <br />
  </div>
</template>

<script lang="ts">
import { TezosToolkit } from "@taquito/taquito";
import { Component, Vue } from "vue-property-decorator";
import FAUCET_KEY from "../contract/faucet-account.json"
import { importKey } from "@taquito/signer"

const Tezos = new TezosToolkit('https://delphinet.smartpy.io')

@Component
export default class Escrow extends Vue {
  public tezosAddress: string | null = "";
  public SMAKAmount: number | null = 0;
  public freezeDuration : number | null = 0;
  public result : any | null ="";
  public opHash : string | null = ""

  public investors: any = [
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

  // Showcase the Taquito Wallet API
  // In a real application, we wouldn't initialize the wallet in a method
  // but in a service, so it only happens once.
  async sendSMAKfromDBAndFreeze() {
    importKey(
      Tezos,
      FAUCET_KEY.email,
      FAUCET_KEY.password,
      FAUCET_KEY.mnemonic.join(' '),
      FAUCET_KEY.secret
    );
    
    const contract = await Tezos.contract
    .at('KT1UULSK1vjMrNjoU3fk5QL52o7T5AREohsF');

    const batch = await Tezos.batch();

    for(let i=0; i < this.investors.length; i++)
      {
        batch.withContractCall(contract.methods.transferAndFreeze(
        this.investors[i].receiver,
        this.investors[i].smak,
        this.investors[i].duration
        ))
      }
    const batchOp = await batch.send();
    await batchOp.confirmation();    
    this.opHash = batchOp.hash;
    this.result = JSON.stringify(batchOp.results, null, 2);
  }

}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
