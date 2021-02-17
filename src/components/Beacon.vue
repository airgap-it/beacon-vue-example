<template>
  <div class="hello">
    <h3>Demo 1 - Request Permission</h3>
    <br />
    <button v-on:click="requestPermission">Request Permission</button>
    <br />

    <span v-if="address">
      {{ address }}
      <br />
      {{ scopes }}
    </span>

    <h3>Demo 2 - Send Operation Request</h3>
    <br />
    <button v-on:click="requestOperation">Delegate Operation</button>
    <br />

    {{ operationHash }}

    <h3>Demo 3 - Contract Call</h3>
    <br />
    <button v-on:click="callContract">Call Contract</button>
    <br />

    {{ taquitoOperationHash }}

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
  BeaconEvent,
} from "@airgap/beacon-sdk";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Component, Vue } from "vue-property-decorator";
import { defaultEventCallbacks } from "@airgap/beacon-sdk/dist/events";

const Tezos = new TezosToolkit('https://delphinet.smartpy.io')

@Component
export default class Beacon extends Vue {
  // PermissionRequest
  public address: string | null = null;
  public scopes: PermissionScope[] | null = null;

  // OperationRequest
  public operationHash: string | null = null;

  // Taquito Example
  public taquitoOperationHash: string | null = null;

  private beaconClient = new DAppClient({
    name: "Vue DApp",
    eventHandlers: {
      // Overwrite standard behavior of certain events
      [BeaconEvent.P2P_LISTEN_FOR_CHANNEL_OPEN]: {
        handler: async (syncInfo) => {
          // Add standard behavior back (optional)
          await defaultEventCallbacks.P2P_LISTEN_FOR_CHANNEL_OPEN(syncInfo);
          console.log("syncInfo", syncInfo);
        },
      },
    },
  });

  // Send a permission request to the wallet / extension
  async requestPermission() {
    const permissions = await this.beaconClient.requestPermissions();

    this.address = permissions.address;
    this.scopes = permissions.scopes;
  }

  // Send an operation request to the wallet / extension
  async requestOperation() {
    const operationResponse = await this.beaconClient.requestOperation({
      operationDetails: [
        {
          kind: TezosOperationType.TRANSACTION,
          amount: "123",
          destination: "tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT",
        },
      ],
    });

    this.operationHash = operationResponse.transactionHash;
  }

  // Showcase the Taquito Wallet API
  // In a real application, we wouldn't initialize the wallet in a method
  // but in a service, so it only happens once.
  async callContract() {
    const wallet = new BeaconWallet({ name: "Taquito DApp" });
    Tezos.setWalletProvider(wallet);
    // Request permissions
    await wallet.requestPermissions();

    // Get contract
    const contract = await Tezos.wallet.at(
      "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn" // TZBTC
    );

    // Call a method on a contract
    const result = await contract.methods
      .transfer(
        "tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7",
        "tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT",
        1
      )
      .send();

    this.taquitoOperationHash = result.opHash;
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
