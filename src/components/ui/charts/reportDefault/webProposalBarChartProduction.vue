<!-- UNUSED FILE -->
<template>
  <div>
    <canvas id="myChartProductionReportDefault" width="400" height="400"></canvas>
  </div>
</template>

<script>
  import Chart from 'chart.js';

  export default {
    props: {
      productionData: {
        type: Array
      },
      productionDataLabels: {
        type: Array
      },
    },

    mounted() {
      // console.log("chart js mounted");
      const reportName = this.reportTemplate;
      const ctx = document.getElementById('myChartProductionReportDefault');
      let vm = this;

      const myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: this.productionDataLabels,
            datasets: [{
                data: this.productionData,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                barPercentage: 0.5,
                categoryPercentage: 1,
            }]
        },
        options: {
          indexAxis: 'y',

          tooltips: {
            enabled: true,
            callbacks: {
                label: this.labelTooltip
            }
          },
          legend: {
              display: false
          },
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            onComplete: function() {
              var ctx = this.chart.ctx;
              ctx.height = parent.innerHeight;

              ctx.fillStyle = "rgba(0,0,0,0.7)";
              ctx.fontFamily = "HelveticaNeue;";

              this.data.datasets.forEach(function(dataset) {
                for (var i = 0; i < dataset.data.length; i++) {
                    if (dataset.data[i] !== 0) {
                      var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                      left = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._xScale.left,
                      width = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._xScale.width,
                      right = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._view.x;

                      // var value = dataset.data[i].toLocaleString();
                      // var value = vm.chartValues(dataset.data[i]);
                      var value = dataset.data[i].toLocaleString('en-IN');
                      if (vm.isPuppeteer) {
                        ctx.save();
                        if (dataset.data[i] % 1 !== 0) {
                          ctx.fillText(value, right - 75, model.y + 4);
                        } else {
                          ctx.fillText(value, right - 65, model.y + 4);
                          ctx.restore();
                        }
                      } else {
                        return;
                      }
                    }
                }
              });
            },
            duration: 0
          },
          scales: {
            yAxes: [{
              position: 'top',
              scaleLabel: {
                // display: true,
                display: false,
                labelString: 'kWh',
                fontSize: 18,
                fontFamily: 'BrandonText',
                fontStyle: 'bold',
                fontColor: '#ffffff',
                position: 'top',
              },

              gridLines: {
                // display:false,
                // drawBorder: true,
                // color: '#999999',
                lineWidth: 2,
                drawOnChartArea: false
              },

              ticks: {
                // userCallback: function(value, index, values) {
                //   // Convert the number to a string and split the string every 3 charaters from the end
                //   value = value.toString();
                //   value = value.split(/(?=(?:...)*$)/);
                //   value = value.join(',');
                //   return value;
                // },
                
                fontColor: '#ffffff',
              }
            }],
            xAxes: [{
              position: 'top',
              
              scaleLabel: {
                // display: true,
                display: false,
                labelString: 'Months',
                fontSize: 18,
                fontFamily: 'BrandonText',
                fontStyle: 'bold',
                fontColor: '#ffffff',
              },

              gridLines: {
                // display:false,
                drawBorder: true,
                // color: '#999999',
                lineWidth: 2,
                drawOnChartArea: false
              },

              ticks: {
                userCallback: function(value, index, values) {
                  // Convert the number to a string and split the string every 3 charaters from the end
                      if(reportName === 'reportUSA'){
                        value = value.toString();
                        value = value.split(/(?=(?:...)*$)/);
                        value = value.join(',');
                        return value;
                       }
                       else{
                        return value.toLocaleString('en-IN');
                       }
                },
                fontColor: '#ffffff',
                position: 'top',
                beginAtZero: true,
                fontSize: 10
              }
            }]
          }
        },
      });

      this.myChart = myChart;
    },

    computed: {
      isPuppeteer() {
        return this.$route.name === 'documentProposalPuppeteer'
      },
    },

    watch: {
        productionData: {
          deep: true,
          handler(newVal) {
              this.myChart.data.datasets[0].data = newVal;
              this.myChart.update();
          },
        },
    },

    methods: {
      labelTooltip: function(tooltipItems) {
        // return  'Production: ' + tooltipItems.xLabel + ' kWh';
        return  'Production: ' + tooltipItems.xLabel.toLocaleString('en-IN') + ' kWh';
      },

      chartValues(value) {
        value = value.toString();
        if (value.includes(".")) {
            value = value.split(".")[0].split(/(?=(?:...)*$)/).join(',') + "." +  value.split(".")[1];
            return value;
            
        } else {
            value = value.split(/(?=(?:...)*$)/).join(',');
            return value;
        }
      }
    }
  }
</script>

<style scoped>
  canvas {
    width: auto !important;
    height: 500px !important;
  }
</style>

