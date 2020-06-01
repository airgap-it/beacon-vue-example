<template>
  <div class="hello">
    <h1>Beacon Demo</h1>
    <h3>Demo 1 - Request Permission</h3>
    <button v-on:click="requestPermission">Request Permission</button>
    {{ address }}
    {{ scopes }}
    <h3>Demo 2 - Send Operation Request</h3>
    <button v-on:click="requestOperation">Delegate Operation</button>
    {{ operationHash }}
    <h3>Demo 3 - Contract Call</h3>
    <button v-on:click="callContract">Call Contract</button>
    <h3>Links</h3>
    <ul>
      <li>
        <a
          href="https://github.com/airgap-it/beacon-vue-example"
          target="_blank"
          rel="noopener"
          >Github</a
        >
      </li>
      <li>
        <a
          href="https://github.com/airgap-it/beacon-sdk"
          target="_blank"
          rel="noopener"
          >Beacon SDK</a
        >
      </li>
      <li>
        <a href="https://www.walletbeacon.io/" target="_blank" rel="noopener"
          >walletbeacon.io</a
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  DAppClient,
  PermissionScope,
  TezosOperationType,
} from "@airgap/beacon-sdk";
import { Tezos } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Beacon extends Vue {
  @Prop() private msg!: string;

  public address: string | undefined;
  public scopes: PermissionScope[] | undefined;

  public operationHash: string | undefined;

  private beaconClient = new DAppClient({ name: "Vue Sample DApp" });

  data() {
    return {
      address: undefined,
      scopes: undefined,
      operationHash: undefined,
    };
  }

  async requestPermission() {
    const permissions = await this.beaconClient.requestPermissions();

    this.address = permissions.address;
    this.scopes = permissions.scopes;
  }
  async requestOperation() {
    const operationResponse = await this.beaconClient.requestOperation({
      operationDetails: [
        {
          kind: TezosOperationType.TRANSACTION,
          amount: "123",
          destination: "tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7",
        },
      ],
    });

    this.operationHash = operationResponse.transactionHash;
  }
  async callContract() {
    alert("contract call");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
