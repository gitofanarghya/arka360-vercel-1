<template>
  <div>
    <canvas id="myChartProductionCommon" width="400" height="400" :class="chartHeight"></canvas>
  </div>
</template>

<script>
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables)

  export default {
    props: {
      productionData: {
        type: Array
      },
      updatedData:{
        type: Object,
      },
      productionDataLabels: {
        type: Array
      },
      reportTemplate: {
        type: String,
      },
      countryCode: {
        type: String
      }
    },

    mounted() {
      const ctx = document.getElementById('myChartProductionCommon');
      let vm = this;
      const reportName = this.reportTemplate;
      let dataset = {
        data: this.removeDecimalFromProductionData,
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
            labels: this.productionDataLabels,
            datasets: [dataset]
        },
        options: {
          indexAxis: vm.reportTemplate == 'reportDefault' ? 'y' : 'x',
          tooltips: {
            enabled: true,
            callbacks: {
                label: this.labelTooltip
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
              title: {
                // display: true,
                display: this.reportTemplate == "reportTata" ? true : false,
                text: 'kWh (units)',
                fontSize: this.xyAxesFontsize,
                fontFamily: 'Helvetica Neue',
                // fontStyle: 'bold',
                color: '#ffffff',
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
                color: this.isReportDefault || this.reportTemplate == "reportTata" ? "#ffffff" : "#515151",
                beginAtZero: true,
                size: this.isReportDefault || this.reportTemplate == "reportTata" ? 8 : 10,
              }
            },
            x: {
              position: this.isReportDefault ? 'top' : 'bottom',
              title: {
                display: this.isReportDefault ? false : true,
                text: this.isReportDefault ? 'kWh (units)' : 'Months',
                font: {
                  size: this.xyAxesFontsize,
                  weight: 'bold',
                  family: 'Helvetica Neue',
                },
                color: this.isReportDefault || this.reportTemplate == "reportTata" ? '#ffffff' : '#222',
              },
              ticks: {    
                beginAtZero: true,
                font: {
                  size: this.isReportDefault || this.reportTemplate == "reportTata" ? 8 : 10,
                },
                color: this.isReportDefault || this.reportTemplate == "reportTata" ? "#ffffff" : "#515151",
              },
              grid: {
                lineWidth: 2,
                drawOnChartArea: false
              },
              border: {
                display: true,
              }
            }
          }
        },
        // plugins: [pluginDataLabels],
      });

      this.myChart = myChart;
    },

    computed: {
      ctxFontSize() {
        return this.reportTemplate == "reportGazebo" || this.reportTemplate == "reportTata" ? "8px" : "12px"      
      },
      removeDecimalFromProductionData() {
        return this.productionData.map(function(num) {
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
        } else if  (this.reportTemplate === 'reportTata') {
          return '#ffffff';
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
          return 'reportGazebo';
        } else if (this.reportTemplate === 'reportTata') {
          return 'reportTata';
        }
      },
      xyAxesFontsize() {
        if (this.reportTemplate === 'reportDefault') {
          return 16
        } else if (this.reportTemplate === 'reportGazebo' || this.reportTemplate === 'reportTata') {
          return 10
        } else {
          return 18
        }
      }
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
        // return  'Production: ' + tooltipItems.yLabel + ' kWh';
        return  'Production: ' + tooltipItems.yLabel.toLocaleString('en-IN') + ' kWh';
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
  .reportDefaultHeight {
    width: auto !important;
    height: 500px !important;
  }

  .reportTwoHeight {
    width: 100% !important;
    height: 250px !important;
  }

  .reportThreeHeight {
    width: 100% !important;
    height: 250px !important;
  }

  .reportUSAHeight {
    width: auto !important;
    height: 400px !important;
  }

  .webProposalHeight {
    width: auto !important;
    height: 400px !important;
  }

  .reportGazebo {
    width: 100% !important;
    height: 190px !important;
  }

  .reportTata {
    width: 100% !important;
    height: 220px !important;
  }

  /* @media (max-width: 590px) {
    .reportTwoHeight {
    width: 100% !important;
    height: 400px !important;
  }
  } */

</style>


