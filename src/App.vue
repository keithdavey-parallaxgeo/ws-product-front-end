<template>
  <div id="app">
    <h2>Keith Davey Work Sample</h2>
    <b-tabs content-class="mt-3">
      <b-tab title="Chart" active><MetricChart :apiUrl="apiUrl" /></b-tab>
      <b-tab title="Table" lazy><MetricTable :apiUrl="apiUrl" /></b-tab>
      <b-tab title="Map" lazy><MetricMap :apiUrl="apiUrl" /></b-tab>
    </b-tabs>
  </div>
</template>

<script>
// Assumptions/Notes
// * Vue was used to generate a basic application framework for the components to reside
// * Component work samples are developed independently and each compoent handles it's own data fetching/organisation
// * Base App component provides minimal centralisation/globalisation of functionality to components
// * Graphic configuration's based in the components data for ease of use/ready, but this might be externalised
// * Straight-forward approach to data fetching/preparation - emphasis was on displaying component graphics

import MetricChart from './components/MetricChart.vue';
import MetricTable from './components/MetricTable.vue';
import MetricMap from './components/MetricMap.vue';

export default {
  name: 'App',
  components: {
    MetricChart,
    MetricTable,
    MetricMap
  },
  data() {
    return {
      apiUrl: 'https://half-gerbil-1mv6miz1t.glitch.me'
      // apiUrl: 'http://localhost:5555'
    }
  }
  
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
