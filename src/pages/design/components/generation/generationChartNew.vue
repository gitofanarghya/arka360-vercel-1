<template>
  <div>
    <canvas id="myChartGeneration" width="400" height="400"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables)

  export default {
    props: {
      monthlyGeneration: {
        type: Array,
        default: () => [],
      },
    },
    mounted() {
      const canvas = document.getElementById('myChartGeneration');

      const myChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            data: this.monthlyGeneration,
            backgroundColor: '#409eff',
            borderWidth: 1,
            label: 'Monthly Generation',
            barPercentage: 0.5,
            categoryPercentage: 1,
          }]
        },
        options: {
          tooltips: {
            enabled: true,
            callbacks: {
              label: tooltipItems => {
                return  'Monthly Generation: ' + tooltipItems.yLabel.toLocaleString('en-US') + ' kWh';
              }
            }
          },
          legend: {
            display: true,
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              position: 'top',
              title: {
                display: true,
                text: 'AC Energy (kWh)',
                font: {
                  size: 18,
                  family: 'Brandon Text',
                  weight: 'bold',
                },
                color: '#222',
                position: 'top',
              },

              grid: {
                drawTicks: true,
                drawOnChartArea: false,
                lineWidth: 2,
              },

              ticks: {
                beginAtZero: true,
                userCallback: function(value, index, values) {
                  // Convert the number to a string and split the string every 3 charaters from the end
                  value = value.toString();
                  value = value.split(/(?=(?:...)*$)/);
                  value = value.join(',');
                  return value;
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Months',
                font: {
                  size: 18,
                  family: 'Brandon Text',
                  weight: 'bold',
                },
                color: '#222',
              },

              grid: {
                drawTicks: true,
                drawOnChartArea: false,
                lineWidth: 2,
              }
            }
          }
        },
      });

      this.myChart = myChart;
    },

    watch: {
      monthlyGeneration: {
        deep: true,
        handler(newVal) {
          this.myChart.data.datasets[0].data = newVal;
          this.myChart.update();
        },
      },
    },
  }
</script>

<style scoped>
  canvas {
    width: auto !important;
    height: 400px !important;
  }
</style>


