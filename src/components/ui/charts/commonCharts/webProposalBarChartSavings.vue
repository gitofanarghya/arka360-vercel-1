<template>
  <div>
    <canvas id="myChartSavingsCommon" width="400" height="400" :class="chartHeight"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables)
  export default {
    props: {
      savingsData: {
        type: Array
      },
      updatedData:{
        type: Object,
      },
      savingsDataLabels: {
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
      // console.log("chart js mounted");
      const reportName = this.reportTemplate;
      const ctx = document.getElementById('myChartSavingsCommon');
      let vm = this;

      let dataset = {
        data: this.removeDecimalFromSavingsData,
        // backgroundColor: '#1c3366',
        backgroundColor: this.backgroundColor,
        borderWidth: 1,
        // barThickness: 25,
      }
      if (vm.isReportDefault) {
        dataset.barPercentage = 0.5
        dataset.categoryPercentage = 1
      }

      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: this.savingsDataLabels,
            datasets: [dataset]
        },
        options: {
          indexAxis: vm.reportTemplate == 'reportDefault' ? 'y' : 'x',
          tooltips: {
            enabled: true,
            callbacks: {
                label: this.labelTooltip,
                // title: this.titleTooltip,
                // title: this.computedTitleTooltip
            }
          },
					plugins: {
						legend: {
							display: false
						},
					},
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            onComplete: function(e) {
              if (!vm.isPuppeteer) { return }

              var ctx = e.chart.ctx;
              ctx.height = parent.innerHeight;

              ctx.fillStyle = "rgba(0,0,0,0.7)";
              ctx.font = vm.ctxFontSize + " 'Helvetica Neue', Helvetica, Arial, sans-serif";
              const lineHeight = ctx.measureText("M").width;

              this.data.datasets.forEach((dataset, ind) => {
                let datasetMeta = e.chart.getDatasetMeta(ind)
                for (var i = 0; i < dataset.data.length; i++) {
                  if (dataset.data[i] == 0) { continue }
                  
                  let model = datasetMeta.data[i]
                  let right = model.x;

                  // var value = vm.chartValues(dataset.data[i]);
                  let locale = 'en-IN'
                  if (vm.countryCode === 'US') { locale = 'en-US' }
                  var value = dataset.data[i].toLocaleString(locale);
                  
                  if (vm.isReportDefault) {
                    ctx.save();
                    ctx.textAlign = 'right';
                    ctx.fillText(value, right - 5, model.y + 4);
                    ctx.restore();
                  } else {
                    ctx.save();
                    ctx.translate(model.x + (lineHeight*1/2), model.y + 10);
                    ctx.rotate(-Math.PI/2);
                    ctx.textAlign = 'right';
                    ctx.fillText(value, 0, 0);
                    ctx.restore();
                  }
                  // ctx.font = "12px 'Helvetica Neue', Helvetica, Arial, sans-serif";
                }
              });
            },
            duration: 0
          },
          layout: {
            padding: {
                left: 0,
                right: 0,
                top: this.isReportDefault ? 0 : 20,
                bottom: 0
            }
          },
          scales: {
            y: {
              position: 'top',
              scaleLabel: {
                // display: true,
                display: false,
                labelString: '$',
                fontSize: this.xyAxesFontsize,
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
                drawOnChartArea: false
              },

              ticks: {
                color: this.isReportDefault ? "#ffffff" : "black",
                beginAtZero: true,
              }
            },
            x: {
              position: this.isReportDefault ? 'top' : 'bottom',
              title: {
                display: this.isReportDefault ? false : true,
                text: 'Months',
								font: {
									size: this.xyAxesFontsize,
									family: 'Helvetica Neue',
									weight: 'bold',
								},
                color: this.isReportDefault ? '#ffffff' : '#222',
              },
              ticks: {
                beginAtZero: true,
                autoSkip: false,
                font: {
                  size: 10,
                },
                color: this.isReportDefault ? "#ffffff" : "black",
              },
              // ticks: {
              //   // fontSize: 8.5,
              //   fontSize: this.ticksFontSize,
              // },

              grid: {
                lineWidth: 2,
                drawOnChartArea: false
              },
              border: {
                display: true,
              }
            }
          }
        }
      });

      this.myChart = myChart;
    },

    computed: {
      ctxFontSize() {
        return this.reportTemplate == "reportGazebo" ? "8px" : "12px"      
      },
      removeDecimalFromSavingsData() {
        return this.savingsData.map(function(num) {
          return Math.floor(num);
        });
      },
      isPuppeteer() {
        return this.$route.name === 'documentProposalPuppeteer'
      },

      isReportDefault() {
        return this.reportTemplate === 'reportDefault'
      },
      
      backgroundColor() {
        if (this.reportTemplate === 'reportDefault') {
          return '#ffffff';
        } else if (this.reportTemplate === 'reportTwo') {
          return `${this.updatedData.custom_color.secondary_color}`;
        } else if (this.reportTemplate === 'reportThree') {
          return `${this.updatedData.custom_color.primary_color}`;
        } else if (this.reportTemplate === 'reportUSA' || this.reportTemplate === 'reportGazebo') {
          return '#409eff';
        } else if (this.reportTemplate === 'webProposal') {
          return '#409eff';
        }
      },

      chartHeight() {
        if (this.reportTemplate === 'reportDefault') {
          return 'reportDefaultHeight';
        } else if (this.reportTemplate === 'reportTwo') {
          return 'reportTwoHeight';
        } else if (this.reportTemplate === 'reportThree') {
          return 'reportThreeHeight';
        } else if (this.reportTemplate === 'reportUSA') {
          return 'reportUSAHeight';
        } else if (this.reportTemplate === 'webProposal') {
          return 'webProposalHeight';
        } else if (this.reportTemplate === 'reportGazebo') {
          return 'reportGazeboHeight';
        }
      },

      ticksFontSize() {
        if (this.reportTemplate === 'reportTwo') {
          return 8.5;
        } else if (this.reportTemplate === 'reportThree') {
          return 8.5;
        } else if (this.reportTemplate === 'reportUSA') {
          return 12;
        } else if (this.reportTemplate === 'webProposal') {
          return 12;
        } else if (this.reportTemplate === 'reportGazebo') {
          return 10;
        }
      },

      labelString() {
        if (this.reportTemplate === 'reportTwo') {
          return 'Years';
        } else if (this.reportTemplate === 'reportThree') {
          return 'Years';
        } else if (this.reportTemplate === 'reportUSA'  || this.reportTemplate === 'reportGazebo') {
          return 'Months';
        } else if (this.reportTemplate === 'webProposal') {
          return 'Months';
        }
      },

      computedTitleTooltip() {
        if (this.reportTemplate === 'reportTwo') {
          return this.titleTooltip;
        } else if (this.reportTemplate === 'reportThree') {
          return this.titleTooltip;
        } else if (this.reportTemplate === 'reportDefault') {
          return this.titleTooltip;
        } else if (this.reportTemplate === 'reportUSA'  || this.reportTemplate === 'reportGazebo') {
          return this.titleTooltipUSA;
        } else if (this.reportTemplate === 'webProposal') {
          return this.titleTooltipUSA;
        }
      },

      xyAxesFontsize() {
        return this.reportTemplate === 'reportGazebo' ? 10 : 18
       }
     },

    watch: {
        savingsData: {
          deep: true,
          handler(newVal) {
              this.myChart.data.datasets[0].data = newVal;
              this.myChart.update();
          },
        },
    },

    methods: {
      labelTooltip: function(tooltipItems) {
        // return 'Savings: '  + this.currencyCode + ' ' + tooltipItems.yLabel;
        return 'Savings: '  + this.currencyCode + ' ' + tooltipItems.yLabel.toLocaleString('en-IN');
      },

      titleTooltip: function(tooltipItems) {
        return 'Year ' + tooltipItems[0].xLabel;
      },

      titleTooltipUSA: function(tooltipItems) {
        return tooltipItems[0].xLabel;
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
  /* canvas{
    width: auto !important;
    height: 350px !important;
  } */
  .reportDefaultHeight {
    width: auto !important;
    height: 500px !important;
  }

  .reportTwoHeight {
    width: 100% !important;
    height: 300px !important;
  }

  .reportThreeHeight {
    width: auto !important;
    height: 330px !important;
  }

  .reportUSAHeight {
    width: auto !important;
    height: 300px !important;
  }

  .webProposalHeight {
    width: auto !important;
    height: 400px !important;
  }

  .reportGazeboHeight {
    width: 100% !important;
    height: 190px !important;
  }
  /* @media (max-width: 590px) {
    .reportTwoHeight {
    width: 100% !important;
    height: 400px !important;
  }
  } */
</style>


