<template>
  <div>
    <h3>Map</h3>
    <br/>
    <b>Metric</b>
    <b-form-select v-model="metricSelected" :options="metricOptions" @input="renderDailyData()" :value="null"></b-form-select>
    <b>Date</b>
    <b-form-select v-model="dateSelected" :options="dateOptions" @input="renderDailyData()"></b-form-select>
    <div id="mapid" ref="mapElement" :style="styles"></div>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';

import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default {
  name: 'MetricMap',
  props: [
    'apiUrl'
  ],
  data() {
    return {
      map: null,
      poiEventsDaily: null,
      poiStatsDaily: null,
      selected: null,
      dateOptions: [],
      metricOptions: [
        { value: 'events', text: 'Events' },
        { value: 'impressions', text: 'Impressions' },
        { value: 'clicks', text: 'Clicks' },
        { value: 'revenue', text: 'Revenue' }
      ],
      metricSelected: 'events',
      dateSelected: '',
      displayMarkers: null
    }
  },
  mounted() {
    this.setupMap();
    this.renderDailyData();
  },
  computed: {
    styles: function() {
      return {
        width: this.windowWidth + 'px',
        height: this.windowHeight * 0.60 + 'px'
      };
    }
  },
  methods: {
    async renderDailyData() {
      // Initial data fetch
      if (!this.poiEventsDaily) {
        this.poiEventsDaily = (await axios.get(`${this.apiUrl}/poi/events/daily`)).data;
        this.dateSelected = this.poiEventsDaily[0].date;
      }
      if (!this.poiStatsDaily) {
        this.poiStatsDaily = (await axios.get(`${this.apiUrl}/poi/stats/daily`)).data;
        this.dateSelected = this.poiStatsDaily[0].date;
      }

      // Select data for rendering
      let dataSet = null;
      if (this.metricSelected === 'events') {
        dataSet = this.poiEventsDaily;
      } else {
        dataSet = this.poiStatsDaily;
      }

      // Bundle data 
      let groupedDates = _.groupBy(dataSet, (x) => {
        return x.date;
      })

      let dateOptions = [];

      // Map date options available to be selected in UI
      _.forEach(groupedDates, (value, key) => {
        dateOptions.push({ value: key, text: key });
      })

      this.dateOptions = dateOptions;
      let displayData = groupedDates[this.dateSelected];

      // Collect all POIs with metrics at timestamp
      let data = {
        "type": "FeatureCollection",
        "features": []
      }

      _.forEach(displayData, (item) => {
        data.features.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [item.lon, item.lat]
            },
            "properties": {
              "name": item.name,
              "poi_id": item.poi_id,
              "date": item.date,
              "value": item[this.metricSelected]
            }
          })
      })

      // Collect a min/max range for proportional rendering
      let min = _.minBy(displayData, (o) => {
        return o[this.metricSelected];
      })[this.metricSelected];

      let max = _.maxBy(displayData, (o) => {
        return o[this.metricSelected];
      })[this.metricSelected];

      this.addMarkerCluster(data, this.metricSelected, min, max);
    },
    addMarkerCluster(data, metric, scaleMin, scaleMax) {
      let self = this;

      // Remove previous rendered markers
      if (this.displayMarkers) {
        this.map.removeLayer(this.displayMarkers);
      }     

      // Setup GeoJSON render layer
      let geojson = L.geoJson(data, {
        style: function (feature) {
          return {color: feature.properties.color};
        },
        onEachFeature: function (feature, layer) {
          // Date string templates
          const datasetString = {
            'events': `${parseInt(feature.properties.value).toLocaleString()} events`,
            'impressions': `${parseInt(feature.properties.value).toLocaleString()} impressions`,
            'clicks': `${parseInt(feature.properties.value).toLocaleString()} clicks`,
            'revenue': `$${Number(feature.properties.value).toFixed(2).toLocaleString()}`,
          };

          // Setup popup text
          let popupText = `<b>${feature.properties.name}</b>`;
          popupText += `<br/>ID: ${feature.properties.poi_id}`;
          popupText += `<br/>Date: ${feature.properties.date}`;
          popupText += `<br/>${metric.substring(0, 1).toUpperCase()}${metric.substring(1)}: ${datasetString[metric]}`;
          layer.bindPopup(popupText);
        },

        pointToLayer: function(feature, latlng) {
          let defaultSize = 10;
          let relativeSize = (defaultSize + (defaultSize * (feature.properties.value/scaleMax))) * self.map.getZoom();
          return L.circle(latlng, {
            color: 'black',
            fillColor: 'black',
            fillOpacity: 0.8,
            radius: relativeSize
          });
        },
      });

      this.displayMarkers = L.markerClusterGroup({});
      this.displayMarkers.addLayer(geojson);      
      this.map.addLayer(this.displayMarkers);
    },
    setupMap() {
      this.map = L.map(this.$refs['mapElement']).setView([43.6708, -79.3899], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Fix required with build package
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png")
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
		.mycluster {
			width: 40px;
			height: 40px;
			background-color: greenyellow;
			text-align: center;
			font-size: 24px;
		}

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
