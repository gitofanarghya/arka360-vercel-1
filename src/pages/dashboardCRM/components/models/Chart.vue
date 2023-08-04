<template>
  <div class="outer-container">
    <p v-show="helpText"><span style="color: red">*</span> Weeks are calculated as 7 days from the first day of the quarter.</p>
    <div class="container"><!-- <canvas id="chart"></canvas> -->
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
export default {
  name: "ChartJs",
  data() {
    return {
      chart: null,
      helpText: false
    };
  },
  props: {
    type: String,
    data: {},
    options: {},
  },
  mounted() {
    //console.log("mounted");
    this.renderChart();
  },

  methods: {
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }
      // Create new chart instance
      const chartOptions = {
        plugins: {
          legend: {
            display: false, // Remove the legend
          },
        },
      };
      const chartCanvas = this.$refs.chartCanvas;
      const chart = new Chart(chartCanvas, {
        type: this.type,
        data: this.data,
        options: {
          ...this.options,
          maintainAspectRatio: false,
          responsive: true,
        },
      });

      // Save the chart instance if needed for later use or updates
      this.chart = chart;
    },
    updateChart() {
      // Update the chart's data
      this.chart.data = this.data;
      // Update the chart
      this.renderChart();
      if(this.$props.data.datasets[0].label === 'Quater'){
        this.helpText = true
      }else{
        this.helpText = false
      }
    },
  },

  watch: {
    data() {
      // Update the chart when the chartData prop changes
      //console.log("watching");
      this.updateChart();
    },
  },
};
</script>

<style scoped>
.container {
  height: 45vh;
}
.outer-container{
  position: relative;;
}

p{
  color: #777;
  font-size: small;
  position: absolute;
  top: -4%;
  left: 25%;
}
@media only screen and (max-width: 1500px) {
  p{
  color: #777;
  font-size: 0.6rem;
  position: absolute;
  top: -4%;
  left: 25%;
}
}
</style>
