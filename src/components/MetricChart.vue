<template>
  <div id="chart">
    <h3>Chart</h3>
    <br/>
    <b>Chart Type</b>
    <b-form-select mt-3 v-model="chartType" :options="chartTypeOptions" @input="renderChartType(chartType)"></b-form-select>
    <div class="chart-container" :style="styles">
      <canvas :id="chartDiv"></canvas>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Chart from 'chart.js';

export default {
  name: 'MetricChart',
  props: [
    'apiUrl'
  ],
  data() {
    return {
        eventsHourly: null,
        statsHourly: null,
        eventsDaily: null,
        statsDaily: null,
        chartDiv: 'chartjs',
        chart: null,
        chartType: 'hourly',
        chartTypeOptions: [
          { value: 'hourly', text: 'Hourly' },
          { value: 'daily', text: 'Daily' },
        ],
        timeFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          tooltips: {
            callbacks: {
              title: function() {
                return "";
              },
              label: function(item, data) {
                var datasetLabel = data.datasets[item.datasetIndex].label || "";
                var dataPoint = item.yLabel;
                const datasetUnit = {
                  'Hourly Events': `${datasetLabel}: ${dataPoint.toLocaleString()} events`,
                  'Hourly Impressions': `${datasetLabel}: ${dataPoint.toLocaleString()} impressions`,
                  'Hourly Clicks': `${datasetLabel}: ${dataPoint.toLocaleString()} clicks`,
                  'Hourly Revenue': `${datasetLabel}: $${dataPoint.toFixed(2).toLocaleString()}`,
                  'Daily Events': `${datasetLabel}: ${dataPoint.toLocaleString()} events`,
                  'Daily Impressions': `${datasetLabel}: ${dataPoint.toLocaleString()} impressions`,
                  'Daily Clicks': `${datasetLabel}: ${dataPoint.toLocaleString()} clicks`,
                  'Daily Revenue': `${datasetLabel}: $${dataPoint.toFixed(2).toLocaleString()}`,
                }
                return datasetUnit[datasetLabel]
              }
            }
          },
          scales: {
              xAxes: [{
                  type: "time",
                  time: {
                    format: this.timeFormat,
                    unit: 'hour',
                    minUnit: 'hour',
                    displayFormats: {
                    quarter: 'MMM YYYY'
                  }
                  },
                  scaleLabel: {
                      display:     true,
                      labelString: 'Date'
                  }
              }],
              yAxes: [{
                  scaleLabel: {
                      display:     true,
                      labelString: 'value'
                  }
              }]
          }
      }
    }
  },
  computed: {
    styles: function() {
      return {
        width: this.windowWidth + 'px',
        height: this.windowHeight * 0.60 + 'px',
      };
    }
  },
  mounted() {
    this.renderChartType(this.chartType);
  },
  methods: {
    renderChartType(type) {
      // Recycle chart element
      if (this.chart) {
        this.chart.destroy();
      }

      // Select chart type
      if(type === 'hourly') {
        this.composeHourlyData();
      } else {
        this.composeDailyData();
      }
      return;
    },
    // Date and hour datetime helper 
    composeDateTime(dt, hour) {
      let dataTime = moment(dt).hour(hour);
      return dataTime;
    },
    async composeHourlyData() {
      // Initial data fetch
      if (!this.eventsHourly) {
        this.eventsHourly = (await axios.get(`${this.apiUrl}/events/hourly`)).data;
      }
      if (!this.statsHourly) {
        this.statsHourly = (await axios.get(`${this.apiUrl}/stats/hourly`)).data;
      }
      
      // Map data to chart data convention
      this.eventsChartEventsMapped = _.map(this.eventsHourly, (obj) => {
        return {'t': this.composeDateTime(obj.date, obj.hour), 'y': obj.events};
      })

      this.statsChartImpressionsMapped = _.map(this.statsHourly, (obj) => {
        return {'t': this.composeDateTime(obj.date, obj.hour), 'y': obj.impressions};
      })

      this.statsChartClicksMapped = _.map(this.statsHourly, (obj) => {
        return {'t': this.composeDateTime(obj.date, obj.hour), 'y': obj.clicks};
      })

      this.statsChartRevenueMapped = _.map(this.statsHourly, (obj) => {
        return {'t': this.composeDateTime(obj.date, obj.hour), 'y': obj.revenue};
      })

      // Chart configuration
      var config = {
        type: 'line',
        data: {
          datasets: [
            {
              label: "Hourly Events",
              data: this.eventsChartEventsMapped,
              fill: true,
              borderColor: 'red'
            },
            {
              label: "Hourly Impressions",
              data: this.statsChartImpressionsMapped,
              fill: true,
              borderColor: 'blue'
            },
            {
              label: "Hourly Clicks",
              data: this.statsChartClicksMapped,
              fill: true,
              borderColor: 'green'
            },
            {
              label: "Hourly Revenue",
              data: this.statsChartRevenueMapped,
              fill: true,
              borderColor: 'yellow'
            }
          ]
        },
        options: this.chartOptions
      };
      var ctx = document.getElementById(this.chartDiv);
      this.chart = new Chart(ctx, config);
      return;
    },

    async composeDailyData() {
      // Initial data fetch
      if (!this.eventsDaily) {
        this.eventsDaily = (await axios.get(`${this.apiUrl}/events/daily`)).data;
      }
      if (!this.statsDaily) {
        this.statsDaily = (await axios.get(`${this.apiUrl}/stats/daily`)).data;
      }
      
      // Map data to chart data convention
      this.eventsChartEventsMapped = _.map(this.eventsDaily, (obj) => {
        return {'t': obj.date, 'y': obj.events};
      })

      this.statsChartImpressionsMapped = _.map(this.statsDaily, (obj) => {
        return {'t': obj.date, 'y': obj.impressions};
      })

      this.statsChartClicksMapped = _.map(this.statsDaily, (obj) => {
        return {'t': obj.date, 'y': obj.clicks};
      })

      this.statsChartRevenueMapped = _.map(this.statsDaily, (obj) => {
        return {'t': obj.date, 'y': obj.revenue};
      })

      var config = {
          type: 'line',
          data: {
              datasets: [
                  {
                      label: "Daily Events",
                      data: this.eventsChartEventsMapped,
                      fill: true,
                      borderColor: 'red'
                  },
                  {
                      label: "Daily Impressions",
                      data: this.statsChartImpressionsMapped,
                      fill: true,
                      borderColor: 'blue'
                  },
                  {
                      label: "Daily Clicks",
                      data: this.statsChartClicksMapped,
                      fill: true,
                      borderColor: 'green'
                  },
                  {
                      label: "Daily Revenue",
                      data: this.statsChartRevenueMapped,
                      fill: true,
                      borderColor: 'yellow'
                  }
              ]
          },
          options: this.chartOptions
      };
      var ctx = document.getElementById(this.chartDiv);
      this.chart = new Chart(ctx, config);
      return;
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
