<template>
  <div>
    <canvas id="myChartEstimatedSavingsCommon" width="400" height="400" :class="chartHeight"></canvas>
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
      savingsData: {
        type: Array
      },
      savingsDataLabels: {
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
      const reportName = this.reportTemplate;
      const ctx = document.getElementById('myChartEstimatedSavingsCommon');
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: this.savingsDataLabels,
            datasets: [{
                data: this.savingsData,
                // backgroundColor: this.backgroundColor,
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
                display: this.displayTitle,
                // display: false,
                text: 'Estimated Savings',
                fontColor: '#222',
                position: 'bottom'
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
                        text: '$',
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
                        drawOnChartArea: false
                    },

                    ticks: {
                        callback: function(value) {
                            // Convert the number to a string and split the string every 3 charaters from the end
                            if (this.currencyCode === 'USD') {
                                value = value.toString();
                                value = value.split(/(?=(?:...)*$)/);
                                value = value.join(',');
                                return value;
                            }
                            else{
                                return value.toLocaleString('en-IN');
                            }
                        },

                        // fontColor: '#222',
                        color: this.ticksFontColor,
                        // beginAtZero: true,
                        // autoSkip: true,
                        autoSkip: this.autoSkip,
                        // maxTicksLimit: 5,
                        maxTicksLimit: this.maxTicksLimit
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Years',
                        font: {
                            size: this.scaleLabelFontSize,
                            family: 'Helvetica Neue',
                            weight: 'bold',
                        },
                        color: '#222',
                        align: this.reportTemplate === 'reportTata' ? 'end' : 'center'
                    },

                    ticks: {
                        font: {
                            size: 8,
                        },
                        color: this.ticksFontColor,
                        // position: 'top',
                        // beginAtZero: true,
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
        }
      });

      this.myChart = myChart;
    },

    computed: {
      backgroundColor() {
        if (this.reportTemplate === 'reportTwo') {
          return `${this.updatedData.custom_color.tertiary_color}`;
        } else if (this.reportTemplate === 'reportThree') {
          return `${this.updatedData.custom_color.secondary_color}`;
        } else if (this.reportTemplate === 'reportDefault') {
          return `${this.updatedData.custom_color.tertiary_color}`;
        } else if (this.reportTemplate === 'reportUSA') {
          return '#409eff';
        } else if (this.reportTemplate === 'webProposal') {
          return '#409eff';
        } else if (this.reportTemplate === 'reportTata') {
          return '#00c2c7';
        }
      },

      displayTitle() {
        if (this.reportTemplate === 'reportTwo') {
          return false;
        } else if (this.reportTemplate === 'reportThree') {
          return false;
        } else if (this.reportTemplate === 'reportDefault') {
          return false;
        } else if (this.reportTemplate === 'reportUSA') {
          return false;
        } else if (this.reportTemplate === 'webProposal') {
          return false;
        } else if (this.reportTemplate === 'reportTata') {
          return true;
        }
      },

      chartHeight() {
        if (this.reportTemplate === 'reportTwo') {
          return 'reportTwoHeight';
        } else if (this.reportTemplate === 'reportThree') {
          return 'reportThreeHeight';
        } else if (this.reportTemplate === 'reportDefault') {
          return 'reportDefaultHeight';
        } else if (this.reportTemplate === 'reportUSA') {
          return 'reportUSAHeight';
        } else if (this.reportTemplate === 'webProposal') {
          return 'webProposalHeight';
        } else if (this.reportTemplate === 'reportTata') {
          return 'reportTataHeight';
        }
      },

      scaleLabelFontSize() {
        if (this.reportTemplate === 'reportTwo') {
          return 18;
        } else if (this.reportTemplate === 'reportThree') {
          return 18;
        } else if (this.reportTemplate === 'reportDefault') {
          return 14;
        } else if (this.reportTemplate === 'reportUSA') {
          return 18;
        } else if (this.reportTemplate === 'webProposal') {
          return 18;
        } else if (this.reportTemplate === 'reportTata') {
          return 12;
        }
      },

      ticksFontColor() {
        if (this.reportTemplate === 'reportTwo') {
          return '#666';
        } else if (this.reportTemplate === 'reportThree') {
          return '#666';
        } else if (this.reportTemplate === 'reportDefault') {
          return '#222';
        } else if (this.reportTemplate === 'reportUSA') {
          return '#666';
        } else if (this.reportTemplate === 'webProposal') {
          return '#666';
        } else if (this.reportTemplate === 'reportTata') {
          return '#222';
        } 
      },

      autoSkip() {
        if (this.reportTemplate === 'reportTwo') {
          // return false;
          return true;
        } else if (this.reportTemplate === 'reportThree') {
          return false;
        } else if (this.reportTemplate === 'reportDefault') {
          return true;
        } else if (this.reportTemplate === 'reportUSA') {
          return false;
        } else if (this.reportTemplate === 'webProposal') {
          return false;
        } else if (this.reportTemplate === 'reportTata') {
          return false;
        } 
      },

      maxTicksLimit() {
        if (this.reportTemplate === 'reportTwo') {
          // return 11;
          return 7;
        } else if (this.reportTemplate === 'reportThree') {
          return 11;
        } else if (this.reportTemplate === 'reportDefault') {
          return 5;
        } else if (this.reportTemplate === 'reportUSA') {
          return 11;
        } else if (this.reportTemplate === 'webProposal') {
          return 11;
        } 
      },

      labelString() {
        if (this.reportTemplate === 'reportTwo') {
          return 'Years';
        } else if (this.reportTemplate === 'reportThree') {
          return 'Years';
        } else if (this.reportTemplate === 'reportUSA') {
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
        } else if (this.reportTemplate === 'reportUSA') {
          return this.titleTooltipUSA;
        } else if (this.reportTemplate === 'webProposal') {
          return this.titleTooltipUSA;
        }
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

      assignColor(context) {
        let data = context.dataset.data;
        let newArr = data.map(this.selectColor);
        // console.log(newArr); 
        return newArr;
      },

      selectColor(data) {
        if (data < 0) {
            // return '#ff8d8f';
            if (this.reportTemplate === 'reportUSA') {
              return '#ff8d8f';
            } else {
              return `${this.updatedData.custom_color.primary_color}`;
            }
        } else {
            // return '#409eff';
            if (this.reportTemplate === 'reportUSA') {
              return '#409eff';
            } else if (this.reportTemplate === 'reportThree') {
              return `${this.updatedData.custom_color.secondary_color}`;
            } else {
              return `${this.updatedData.custom_color.tertiary_color}`;
            } 
        }
      }
    }
  }
</script>

<style scoped>
  /* canvas{
    width: auto !important;
    height: 180px !important;
  } */

  .reportTwoHeight {
    width: 100% !important;
    height: 190px !important;
  }

  .reportThreeHeight {
    width: auto !important;
    height: 295px !important;
  }

  .reportDefaultHeight {
    width: auto !important;
    height: 180px !important;
  }

  .reportTataHeight {
    width: auto !important;
    height: 140px !important;
  }
  /* @media (max-width: 590px) {
    .reportTwoHeight {
    width: auto !important;
    height: 400px !important;
  }
  } */

</style>


