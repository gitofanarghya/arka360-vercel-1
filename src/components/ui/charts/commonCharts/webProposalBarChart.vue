<template>
  <div>
    <canvas id="myChartBreakEvenCommon" width="400" height="400" :class="chartHeight"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables)

  export default {
    props: {
      breakEvenAnalysisData: {
        type: Array
      },
      breakEvenAnalysisDataLabels: {
        type: Array
      },
      currencyCode: {
        type: String
      },
      reportTemplate: {
        type: String,
      }
    },
    
    mounted() {
      // console.log("chart js mounted");
      const ctx = document.getElementById('myChartBreakEvenCommon');
      const reportName = this.reportTemplate;
      const currency_code = this.currencyCode;
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: this.breakEvenAnalysisDataLabels,
            datasets: [{
                data: this.breakEvenAnalysisData,
                backgroundColor: this.assignColor,
                borderWidth: 1
            }]
        },
        options: {
          tooltips: {
            enabled: true,
            callbacks: {
                label: this.labelTooltip,
                title: this.titleTooltip
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Break-Even Analysis',
              font: {
                size: 18,
                family: 'Helvetica Neue',
                weight: 'bold',
              },
              color: '#222',
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              position: 'top',
              title: {
                // display: true,
                display: false,
                text: 'kWh',
                font: {
                  size: 18,
                  family: 'Helvetica Neue',
                  weight: 'bold',
                },
                color: '#222',
                position: 'top',
              },

              grid: {
                // display:false,
                // drawBorder: true,
                // color: '#999999',
                lineWidth: 2,
                drawOnChartArea: false
              },

              ticks: {
                callback: function(value, index, values) {
                  // Convert the number to a string and split the string every 3 charaters from the end
                      if(currency_code === 'INR'){
                        // value = value.toString();
                        // value = value.split(/(?=(?:...)*$)/);
                        // value = value.join(',');
                        return value.toLocaleString('en-IN');
                       }
                       else{
                        return value.toLocaleString();
                       }
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Years',
                font: {
                  size: 18,
                  family: 'Helvetica Neue',
                  weight: 'bold',
                },
                fontColor: '#222',
              },

              grid: {
               
                lineWidth: 2,
                drawOnChartArea: false
              },
              border: {
                display: true,
              },
            }
          }
        }
      });

      this.myChart = myChart;
    },

    computed: {      
      chartHeight() {
        if (this.reportTemplate === 'reportUSA') {
          return 'reportUSAHeight';
        } else if (this.reportTemplate === 'webProposal') {
          return 'webProposalHeight';
        }
      }
    },

    watch: {
        breakEvenAnalysisData: {
            deep: true,
            handler(newVal) {
                this.myChart.data.datasets[0].data = newVal;
                this.myChart.update();
            },
        },
    },

    methods: {
      labelTooltip: function(tooltipItems) {
        return  'Cumulative Savings: ' + this.currencyCode + ' ' + tooltipItems.yLabel;
      },

      titleTooltip: function(tooltipItems) {
            return 'Year ' + tooltipItems[0].xLabel;
      },

      // assignColor() {
      //       // let data = this.chartData.datasets[0].data;
      //       let data = this.data.datasets[0].data;
      //       let newArr = data.map(this.myFunc);
      //       // console.log(newArr); 
      //       return newArr;
      //   },

      assignColor(context) {
        let data = context.dataset.data;
        let newArr = data.map(this.selectColor);
        // console.log(newArr); 
        return newArr;
      },

      selectColor(data) {
        if (data < 0) {
            return '#ff8d8f';
        } else {
            return '#409eff';
        }
      }
    }
  }
</script>

<style scoped>
  /* canvas{
    width: auto !important;
    height: 400px !important;
  } */

  .reportUSAHeight {
    width: auto !important;
    height: 280px !important;
  }

  .webProposalHeight {
    width: auto !important;
    height: 400px !important;
  }
</style>


