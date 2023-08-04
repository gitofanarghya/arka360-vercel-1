<template>
  <div style="display: block" :class="chartHeight">
    <canvas id="myChartWithOrWithoutSolarCommon" width="400" height="400"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables)

  export default {
    props: {
      updatedData:{
        type: Object,
      },
      estimatedUtilityBillWithSolarData: {
        type: Array
      },
      estimatedUtilityBillWithoutSolarData: {
        type: Array
      },
      estimatedUtilityBillDataLabels: {
        type: Array
      },
      currencyCode: {
        type: String
      },
      reportTemplate: {
        type: String,
      },
      countryCode: {
        type: String
      }
    },

    mounted() {
      const reportName = this.reportTemplate;
      const currency_code = this.currencyCode;
      const ctx = document.getElementById('myChartWithOrWithoutSolarCommon');
      // let color = this.updatedData.report_type === 'solar'
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: this.estimatedUtilityBillDataLabels,
            datasets: [
                {
                    data: this.estimatedUtilityBillWithSolarData,
                    // backgroundColor: '#1c3366',
                    backgroundColor:  this.backgroundColorWithSolar,
                    borderWidth: 1,
                    maxBarThickness: 10,
                },

                {
                    data: this.estimatedUtilityBillWithoutSolarData,
                    // backgroundColor: '#cbcbcb',
                    backgroundColor: this.backgroundColorWithoutSolar,
                    borderWidth: 1,
                    maxBarThickness: 10,
                },
                        
            ]  
        },
        options: {
          title: {
            // display: true,
            display: false,
            text: 'Estimated Utility Bill',
            fontSize: 18,
            fontFamily: 'Helvetica Neue',
            fontStyle: 'bold',
            // fontColor: '#222',
            fontColor: this.titleAndLabelFontColor,
          },
          
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
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              position: 'top',
              scaleLabel: {
                // display: true,
                display: false,
                labelString: '$',
                fontSize: 18,
                fontFamily: 'Helvetica Neue',
                fontStyle: 'bold',
                fontColor: '#222',
                position: 'top',
              },

              grid: {
                // display:false,
                // drawBorder: true,
                // color: '#999999',
                lineWidth: 2,
                drawOnChartArea: false,
              },
              border: {
                display: true,
                color: this.reportTemplate === 'reportTata' ? "#00c2c780"  : "rgba(0, 0, 0, 0.1)"
              },

              ticks: {
                callback: function(value, index, values) {
                  // Convert the number to a string and split the string every 3 charaters from the end
                      if(currency_code=='INR'){
                        return value.toLocaleString('en-IN');
                      }
                      else{
                        return value.toLocaleString();
                      }
                      // if(reportName === 'reportUSA'){
                      //   value = value.toString();
                      //   value = value.split(/(?=(?:...)*$)/);
                      //   value = value.join(',');
                      //   return value;
                      //  }
                      //  else{
                      //   return value.toLocaleString('en-IN');
                      //  }
                },
                maxTicksLimit: this.reportTemplate == "reportTata" ? 8 : 10,
                color: this.ticksFontColor
              }
            },
            x: {
              title: {
                display: this.reportTemplate === 'reportTata' ? false : true,
                text: 'Years',
                font: {
                  size: 18,
                  family: 'Helvetica Neue',
                  weight: 'bold',
                },
                // fontColor: '#222',
                color: this.titleAndLabelFontColor,
              },

              ticks: {
                font: {
                  size: 8,
                },
                color: this.ticksFontColor
              },

              grid: {
                lineWidth: 2,
                drawOnChartArea: false,
              },
              border: {
                display: true,
                color: this.reportTemplate === 'reportTata' ? "#00c2c780"  : "rgba(0, 0, 0, 0.1)"
              }
            }
          }
        }
      });

      this.myChart = myChart;
    },

    computed: {
      backgroundColorWithSolar() {
        if (this.reportTemplate === 'reportTwo') {
          return '#cbcbcb';
        } else if (this.reportTemplate === 'reportThree') {
          return '#999999';
        } else if (this.reportTemplate === 'reportDefault' || this.reportTemplate === 'reportTata') {
          return '#ffffff';
        } else if (this.reportTemplate === 'reportUSA' || this.reportTemplate === 'reportGazebo') {
          return '#409eff';
        } else if (this.reportTemplate === 'webProposal') {
          return '#409eff';
        }
      },

      backgroundColorWithoutSolar() {
        if (this.reportTemplate === 'reportTwo') {
          return `${this.updatedData.custom_color.tertiary_color}`;
        } else if (this.reportTemplate === 'reportThree') {
          return `${this.updatedData.custom_color.primary_color}`;
        } else if (this.reportTemplate === 'reportDefault' || this.reportTemplate === 'reportTata') {
        return `${this.updatedData.custom_color.tertiary_color}`;
        } else if (this.reportTemplate === 'reportUSA' || this.reportTemplate === 'reportGazebo') {
          return '#ff8d8f';
        } else if (this.reportTemplate === 'webProposal') {
          return '#ff8d8f';
        }
      },

      chartHeight() {
        return this.reportTemplate + 'Height'
      },

      ticksFontColor() {
        if (this.reportTemplate === 'reportTwo') {
          return '#666';
        } else if (this.reportTemplate === 'reportThree') {
          return '#666';
        } else if (this.reportTemplate === 'reportUSA' || this.reportTemplate === 'reportGazebo') {
          return '#666';
        } else if (this.reportTemplate === 'webProposal') {
          return '#666';
        } else if (this.reportTemplate === 'reportDefault' || this.reportTemplate === 'reportTata') {
          return '#ffffff';
        }
      },

      titleAndLabelFontColor() {
        if (this.reportTemplate === 'reportTwo') {
          return '#222';
        } else if (this.reportTemplate === 'reportThree') {
          return '#222';
        } else if (this.reportTemplate === 'reportUSA'  || this.reportTemplate === 'reportGazebo') {
          return '#222';
        } else if (this.reportTemplate === 'webProposal') {
          return '#222';
        } else if (this.reportTemplate === 'reportDefault' || this.reportTemplate === 'reportTata') {
          return '#ffffff';
        }
      },
    },

    watch: {
        estimatedUtilityBillWithSolarData: {
          deep: true,
          handler(newVal) {
              this.myChart.data.datasets[0].data = newVal;
              this.myChart.update();
          },
        },

        estimatedUtilityBillWithoutSolarData: {
          deep: true,
          handler(newVal) {
              this.myChart.data.datasets[1].data = newVal;
              this.myChart.update();
          },
        },
    },

    methods: {
      labelTooltip: function(tooltipItems) {
      if (tooltipItems.datasetIndex === 0) {
        console.log(this.currencyCode);
              return 'Bill With Solar: ' + this.currencyCode + ' ' + tooltipItems.yLabel.toLocaleString('en-IN');
          } else if (tooltipItems.datasetIndex === 1) {
              return 'Bill Without Solar: ' + this.currencyCode + ' ' + tooltipItems.yLabel.toLocaleString('en-IN');
          }
      },

      titleTooltip: function(tooltipItems) {
        return  'Year ' + tooltipItems[0].xLabel;
      },
    }
  }
</script>

<style scoped>
  /* canvas{
    width: auto !important;
    height: 400px !important;
  } */

  .reportTwoHeight {
    width: auto !important;
    height: 295px !important;
  }

  .reportThreeHeight {
    width: auto !important;
    height: 300px !important;
  }

  .reportUSAHeight {
    width: auto !important;
    height: 400px !important;
  }

  .webProposalHeight {
    width: auto !important;
    height: 400px !important;
  }

  .reportDefaultHeight {
    height: 400px;
    width: 560px;
  }

  .reportTataHeight {
    height: 220px;
    width: auto !important;
  }  

  .reportGazeboHeight {
    height: 300px;
    width: auto !important;
  }

  @media (max-width: 840px) {
    .reportDefaultHeight {
      width: auto !important;
    }
  }

  @media (max-width: 500px) {
    .reportDefaultHeight {
      height: 330px !important;
    }
  }

  @media (max-width: 590px) {
    .reportTwoHeight {
      width: auto !important;
      height: 400px !important;
    }
  }
</style>


