<template>
  <div id="table">
    <h3>Table</h3>
    <br/>
    <b>Search</b>
    <div id="table">
      <b-form-input type="text" @input="updateTableSelectAttrs()" v-model="searchString" placeholder="Search a Point of Interest (POI)"></b-form-input>
      <b-table striped hover :items="items" :fields="fields" :tbody-tr-class="rowClassSelector"></b-table>
    </div>
  </div>
</template>

<script>

import Fuse from 'fuse.js';
import _ from 'lodash';
import axios from 'axios';

export default {
  name: 'MetricTable',
  props: [
    'apiUrl'
  ],
  data() {
    return {
      'fields': ['poi_id', 'name', 'lat', 'lon'],
      'fuse': null,
      'searchString': '',
      'items': null,
      'fuzzySearchOptions': {
        shouldSort: true,
        threshold: .5,
        location: 0,
        distance: 10,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "name"
        ]
      }
    }
  },
  mounted() {
    this.renderPoiData();
  },
  methods: {
    async renderPoiData() {
      // Initial data fetch
      if (!this.items) {
        this.items = (await axios.get(`${this.apiUrl}/poi`)).data;
      }
      // Setup fuzzy search object
      this.fuse = new Fuse(this.items, this.fuzzySearchOptions);
      return;
    },

    updateTableSelectAttrs() {
      let searchNameMatches = this.fuse.search(this.searchString);
      this.items = _.map(this.items, (obj) => {
        return {...obj, _selected: _.includes(_.map(searchNameMatches, 'name'), obj.name)};
      })
      return;
    },

    // Row class render helper
    rowClassSelector(item, type) {
      if (!item || type !== 'row') return;
      if (item._selected === true) return 'table-success';
    }
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
