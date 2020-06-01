<template>
  <div class="hello">
    <h1>Beacon Demo</h1>
    <h3>Demo 1 - Request Permission</h3>
    <button v-on:click="requestPermission">Request Permission</button>
    <h3>Demo 2 - Send Operation Request</h3>
    <button v-on:click="requestOperation">Delegate Operation</button>
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
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Beacon extends Vue {
  @Prop() private msg!: string;

  requestPermission() {
    alert("requestPermission");
  }
  requestOperation() {
    alert("requestOperation");
  }
  callContract() {
    alert("callContract");
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
