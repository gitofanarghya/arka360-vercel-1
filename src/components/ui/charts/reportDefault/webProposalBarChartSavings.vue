<!-- UNUSED FILE -->
<template>
  <div>
    <canvas id="myChartSavingsReportDefault" width="400" height="400"></canvas>
  </div>
</template>

<script>
  import Chart from 'chart.js';
  export default {
    props: {
      savingsData: {
        type: Array
      },
      savingsDataLabels: {
        type: Array
      },
      currencyCode: {
        type: String
      }
    },
    mounted() {
      // console.log("chart js mounted");
      const ctx = document.getElementById('myChartSavingsReportDefault');
      let vm = this;
      const reportName = this.reportTemplate;
      const myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: this.savingsDataLabels,
            datasets: [{
                data: this.savingsData,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                barPercentage: 0.5,
                categoryPercentage: 1,
            }]
        },
        options: {
          tooltips: {
            enabled: true,
            callbacks: {
                label: this.labelTooltip,
                // title: this.titleTooltip
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
                          ctx.fillText(value, right - 60, model.y + 4);
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
                labelString: '$',
                fontSize: 18,
                fontFamily: 'BrandonText',
                fontStyle: 'bold',
                fontColor: '#222',
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
                // fontSize: 10,
              }
            }],
            xAxes: [{
              position: 'top',

              scaleLabel: {
                // display: true,
                display: false,
                labelString: 'Years',
                fontSize: 18,
                fontFamily: 'BrandonText',
                fontStyle: 'bold',
                fontColor: '#ffffff',
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
                // fontSize: 8.5,
                fontSize: 10,
                fontColor: '#ffffff',
                position: 'top',
                beginAtZero: true
              },

              gridLines: {
                // display:false,
                drawBorder: true,
                // color: '#999999',
                lineWidth: 2,
                drawOnChartArea: false
              }
            }]
          }
        }
      });
    },

    computed: {
      isPuppeteer() {
        return this.$route.name === 'documentProposalPuppeteer'
      },
    },

    watch: {
        savingsData: {
            deep: true,
            // handler(newVal) {
            //     this.chartData.datasets[0].data = newVal;
            //     this.render();
            // },

            handler(newVal, context) {
                context.dataset.data = newVal;
                this.render();
            },
        },
    },

    methods: {
      labelTooltip: function(tooltipItems) {
        // return 'Savings: '  + this.currencyCode + ' ' + tooltipItems.xLabel;
        return 'Savings: '  + this.currencyCode + ' ' + tooltipItems.xLabel.toLocaleString('en-IN');
      },

      // titleTooltip: function(tooltipItems) {
      //       return 'Year ' + tooltipItems[0].xLabel;
      //   },

      assignColor() {
            let data = this.chartData.datasets[0].data;
            let newArr = data.map(this.myFunc);
            // console.log(newArr); 
            return newArr;
        },

        myFunc(num) {
            if (num < 0) {
                return '#ff8d8f'
            } else {
                return '#409eff'
            }
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



