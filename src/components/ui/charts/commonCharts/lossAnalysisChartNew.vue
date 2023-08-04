<!-- UNUSED FILE -->
<template>
    <div>
        <canvas id="myChartLoss" width="400" height="400"></canvas>
    </div>
</template>
<script>
import Chart from 'chart.js';
// import { HorizontalBar } from 'vue-chartjs';
import { isNumber } from 'makerjs';

export default {
    // extends: HorizontalBar,
    props: {
        lossData: {
            type: Array,
            // default: () => {},
        },
        
        updatedData:{
            type: Object,
        },

        
        reportTemplate: {
            type: String,
        },
        
        options: {
            type: Object,
            default: () => {
                return {
                    fontSize: 11,
                    yOffset: 8,
                    xOffset: 85,
                    barThickness: 16,
                }
            },
        }
    },
    methods: { 

        convertLossDataToGraphFormat() {
            const lossDataGraphFormat = [
                {
                    Irradiance: [
                        {
                            initial_name: 'Horizontal Global Irradiation',
                            initial_value: this.lossData.energy.irradiance.ghi,
                            units: 'kWh/m2',
                        },
                        {
                            loss: 'Global Incidence on PV plane',
                            percent: this.lossData.losses.irradiance.epoa,
                        },
                        {
                            loss: 'Near Shading: irradiance loss',
                            percent: this.lossData.losses.irradiance.shading,
                        },
                        {
                            loss: 'Soiling loss factor',
                            percent: this.lossData.losses.irradiance.soiling,
                        },
                        {
                            loss: 'Irradiance after reflection',
                            percent: this.lossData.losses.irradiance.iam,
                        },
                    ],
                },
                {
                    DC: [
                        {
                            initial_name: 'Nominal Energy after PV conversion',
                            initial_value: this.lossData.energy.dc.nominal, 
                            units: 'kWh',
                        },
                        {
                            loss: 'PV loss due to environmental condition',
                            percent: this.lossData.losses.dc.environmental,
                        },
                        {
                            loss: 'Light Induced Degradation',
                            percent: this.lossData.losses.dc.lid,
                        },
                        {
                            loss: 'Mismatch loss, modules and strings',
                            percent: this.lossData.losses.dc.mismatch,
                        },
                        {
                            loss: 'Ohmic wiring loss',
                            percent: this.lossData.losses.dc.dc_ohmic,
                        },
                    ],
                },
                {
                    AC: [
                        {
                            loss: 'Clipping losses',
                            percent: this.lossData.losses.ac.clipping,
                        },
                        {
                            loss: 'DC/AC conversion',
                            percent: this.lossData.losses.ac.inverter_conversion,
                        },
                        {
                            loss: 'System Availability', percent: this.lossData.losses.ac.unavailability,
                        },
                        {
                            loss: 'AC Ohmic loss', percent: this.lossData.losses.ac.ac_ohmic,
                        },
                    ],
                },
            ];
            return lossDataGraphFormat;
        },
        parseUnstructuredData(lossData, colors, reportTemplate) {
            var loss_bar_color = "#f0f3f8";
            var bar_height_initial = 10;
            let vm = this;
            function _parseData() {
                function randColor(i) {
                    // var color = ["#409EFF", "#6EC3F8", "#7BD5DD", "#39d8c1"];
                    var color = [];
                    if (reportTemplate === 'solar_labs_2') {
                    color = [`${colors.primary_color}`, `${colors.secondary_color}`, `${colors.tertiary_color}`, "#39d8c1"];
                    } else if (reportTemplate === 'solar_labs_3') {
                    color = [`${colors.primary_color}`, `${colors.secondary_color}`, `${colors.tertiary_color}`, "#39d8c1"];
                    } else if (reportTemplate === 'solar_labs') {
                    color = ["#fff", `${colors.secondary_color}`, `${colors.tertiary_color}`, `${colors.tertiary_color}`];
                    }
                    return color[i];
                    
                }
                var component_names = [];
                var loss_names = [];
                var units = [];
                var loss_percentages = [];
                var absolute_values = [];
                var bar_height = [];
                for (var i = 0; i < lossData.length; ++i) {
                    component_names.push(Object.keys(lossData[i])[0]);
                    loss_names.push([]);
                    loss_percentages.push([]);
                    absolute_values.push([]);
                    bar_height.push([]);
                    for (var j = 0; j < lossData[i][component_names[i]].length; ++j) {
                        var l = lossData[i][component_names[i]][j];
                        if (j === 0) {
                            if (
                                l["initial_name"] === undefined &&
                                l["initial_value"] === undefined &&
                                l["units"] === undefined
                            ) {
                                loss_names[i].push("", l["loss"]);
                                loss_percentages[i].push(l["percent"]);
                                absolute_values[i].push(
                                    absolute_values[i - 1][absolute_values[i - 1].length - 1]
                                );
                                absolute_values[i].push(
                                    absolute_values[i][0] * (1 + l["percent"] / 100)
                                );
                            } else {
                                loss_percentages[i].push(null);
                                loss_names[i].push(l["initial_name"] || "");
                                absolute_values[i].push(
                                    l["initial_value"] ||
                                    absolute_values[i - 1][absolute_values[i - 1].length - 1]
                                );
                            }
                            units.push(l["units"] || units[i - 1]);
                            if (i === 0) {
                                bar_height[i].push(bar_height_initial);
                            } else if (l["loss"]) {
                                bar_height[i].push(bar_height[i - 1][bar_height[i - 1].length - 1]);
                                bar_height[i].push((bar_height[i][0] * (100 + l["percent"])) / 100);
                            } else {
                                bar_height[i].push(bar_height[i - 1][bar_height[i - 1].length - 1]);
                            }
                        } else {
                            loss_names[i].push(l["loss"]);
                            loss_percentages[i].push(l["percent"]);
                            absolute_values[i].push(
                                absolute_values[i][absolute_values[i].length - 1] *
                                (1 + l["percent"] / 100)
                            );
                            bar_height[i].push(
                                bar_height[i][bar_height[i].length - 1] *
                                (absolute_values[i][absolute_values[i].length - 1] /
                                    absolute_values[i][absolute_values[i].length - 2])
                            );
                        }
                    }
                }
                var datasets = [];
                for (var i = 1; i < bar_height.length; ++i) {
                    let zeros = [];
                    for (var j = 0; j < bar_height[i - 1].length; ++j) zeros.push(0);
                    if (loss_names[i][0] === "") {
                        bar_height[i] = zeros.concat(bar_height[i].slice(1));
                        absolute_values[i] = zeros.concat(absolute_values[i].slice(1));
                    } else {
                        bar_height[i] = zeros.concat(bar_height[i]);
                        absolute_values[i] = zeros.concat(absolute_values[i]);
                    }
                    loss_percentages[i] = zeros.concat(loss_percentages[i]);
                }
                var labels = [].concat(...loss_names);
                labels = labels.filter(label => label !== "");
                for (i = 0; i < component_names.length; ++i) {
                    let d = {
                        label: component_names[i],
                        backgroundColor: randColor(i),
                        data: bar_height[i],
                        abs_values: absolute_values[i],
                        unit: units[i],
                        loss_percentages: loss_percentages[i]
                    };
                    datasets.push(d);
                }
                for (i = 0; i < loss_percentages.length; ++i) {
                    let d = {
                        label: component_names[i],
                        backgroundColor: loss_bar_color,
                        data: bar_height[i].map(function(height, idx) {
                            var l = (100 * height) / (100 + loss_percentages[i][idx]);
                            if (100 + loss_percentages[i][idx] === 0) l = height;
                            return l;
                        })
                    };
                    datasets.push(d);
                }
                let data = {
                    labels: labels,
                    datasets: datasets
                };
                return data;
            }
            let chartData = _parseData();
            // let chartOptions = {
            //     scales: {
            //         xAxes: [
            //             {
            //                 ticks: {
            //                     beginAtZero: true,
            //                     display: false
            //                 },
            //                 gridLines: {
            //                     display: false,
            //                     drawBorder: false
            //                 }
            //             }
            //         ],
            //         yAxes: [
            //             {
            //                 stacked: true,
            //                 position: "right",
            //                 ticks: {
            //                     display: false
            //                 },
            //                 gridLines: {
            //                     display: false,
            //                     drawBorder: false
            //                 },
            //                 barThickness: vm.options.barThickness,
            //             }
            //         ]
            //     },
            //     maintainAspectRatio: false,
            //     animation: {
            //         onComplete: function() {
            //             var ctx = this.chart.ctx;

            //             ctx.font = "normal";
            //             ctx.textAlign = "left";
            //             ctx.textBaseline = "bottom";
            //             ctx.position = "right";
            //             ctx.font = `${vm.options.fontSize}px HelveticaNeue`;

            //             chartData.datasets.forEach(function(dataset) {
            //                 if (dataset.backgroundColor !== loss_bar_color) {
            //                     for (var i = 0; i < dataset.data.length; i++) {
            //                         if (dataset.data[i] !== 0) {
            //                             var model =
            //                                     dataset._meta[Object.keys(dataset._meta)[0]].data[i]
            //                                         ._model,
            //                                 left =
            //                                     dataset._meta[Object.keys(dataset._meta)[0]].data[i]
            //                                         ._xScale.left,
            //                                 width =
            //                                     dataset._meta[Object.keys(dataset._meta)[0]].data[i]
            //                                         ._xScale.width,
            //                                 right =
            //                                     dataset._meta[Object.keys(dataset._meta)[0]].data[i]._view
            //                                         .x;
            //                             var label = model.label;
            //                             var value = Math.round(dataset.abs_values[i]) + "  " + dataset.unit;

            //                             // Labels
            //                             ctx.fillStyle = "#191919";
            //                             ctx.fillText(label, left + 0, model.y - vm.options.yOffset);
            //                             ctx.fillText(value, left - vm.options.xOffset, model.y + 6);

            //                             // for equal separation between percent values and bar
            //                             if (i > 1 && model.label !== 'Clipping losses') {
            //                                 right = dataset._meta[Object.keys(dataset._meta)[0]].data[i-1]._view.x;
            //                             } 
            //                             if (model.label === 'Clipping losses') {
            //                                 right = right + 13;
            //                             }
            //                             // loss percentages
            //                             if (dataset.loss_percentages[i] !== null) {
            //                                 var percent_loss = dataset.loss_percentages[i].toFixed(2) + "%";
            //                                 ctx.fillText(percent_loss, right * 1.02, model.y + 4);
            //                             }
            //                         }
            //                     }
            //                 }
            //             });
            //         },
            //         duration: 0
            //     },
            //     responsive: true,
            //     responsiveAnimationDuration: 0,
            //     legend: {
            //         // position: "bottom",
            //         position: 'bottom',
            //         display: true,
            //         labels: {
            //             filter: (legendItem, chartData) => {
            //                 return legendItem.fillStyle != loss_bar_color;
            //             },
            //             fontColor: "black",
            //             boxWidth: 25,
            //         }
            //     },
            //     tooltips: {
            //         enabled: false
            //     },
            //     layout: {
            //         padding: {
            //             left: 100,
            //             right: 20,
            //             top: 20,
            //             bottom: 0
            //         }
            //     },
            // }
            let chart = {
                data: chartData,
                // options: chartOptions
            }
            return chart;
        },
        // async render() {
        //     const lossDataGraphFormat = await this.convertLossDataToGraphFormat();
        //     let chart = await this.parseUnstructuredData(lossDataGraphFormat);
        //     this.renderChart(chart.data, chart.options);
        // },
    },
    mounted() {
        // this.render();
        // const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        // let datasets = [{
        //     axis: 'y',
        //     label: 'My First Dataset',
        //     data: [65, 59, 80, 81, 56, 55, 40],
        //     // data: [10, 10, 10, 10, 10, 10, 10],
        //     fill: false,
        //     // barPercentage: 0.5,
        //     backgroundColor: [
        //         'rgba(255, 99, 132, 0.2)',
        //         'rgba(255, 159, 64, 0.2)',
        //         'rgba(255, 205, 86, 0.2)',
        //         'rgba(75, 192, 192, 0.2)',
        //         'rgba(54, 162, 235, 0.2)',
        //         'rgba(153, 102, 255, 0.2)',
        //         'rgba(201, 203, 207, 0.2)'
        //     ],
        //     borderColor: [
        //         'rgb(255, 99, 132)',
        //         'rgb(255, 159, 64)',
        //         'rgb(255, 205, 86)',
        //         'rgb(75, 192, 192)',
        //         'rgb(54, 162, 235)',
        //         'rgb(153, 102, 255)',
        //         'rgb(201, 203, 207)'
        //     ],
        //     borderWidth: 1
        // }, {
        //     axis: 'y',
        //     label: 'SECOND',
        //     data: [10, 10, 10, 10, 10, 10, 10],
        //     fill: false,
        //     // barPercentage: 0.5,

        //     backgroundColor: [
        //         'rgba(255, 99, 132, 0.5)',
        //         'rgba(255, 159, 64, 0.5)',
        //         'rgba(255, 205, 86, 0.5)',
        //         'rgba(75, 192, 192, 0.5)',
        //         'rgba(54, 162, 235, 0.5)',
        //         'rgba(153, 102, 255, 0.5)',
        //         'rgba(201, 203, 207, 0.5)',
        //     ],
        //     borderColor: [
        //         'rgb(255, 99, 132)',
        //         'rgb(255, 159, 64)',
        //         'rgb(255, 205, 86)',
        //         'rgb(75, 192, 192)',
        //         'rgb(54, 162, 235)',
        //         'rgb(153, 102, 255)',
        //         'rgb(201, 203, 207)'
        //     ],
        //     borderWidth: 1
        // }]
        const lossDataGraphFormat = this.lossData
        // let chart = this.parseUnstructuredData(lossDataGraphFormat);
        let chart = this.parseUnstructuredData(lossDataGraphFormat, this.updatedData.custom_color, this.updatedData.template_name);

        // Labels
        let subLabels1 = chart.data.datasets[0].abs_values.map(val => Math.round(val).toLocaleString() + ' kWh/m²')
        let subLabels2 = chart.data.datasets[1].abs_values.filter((val, ind) => ind > 4).map(val => Math.round(val).toLocaleString() + ' kWh')
        let subLabels3 = chart.data.datasets[2].abs_values.filter((val, ind) => ind > 9).map(val => Math.round(val).toLocaleString() + ' kWh')
        let labels2 = [
            ...subLabels1,
            ...subLabels2,
            ...subLabels3,
        ]

        // Loss Percentages
        let lp1 = chart.data.datasets[0].loss_percentages.map(val => { return { value: val, chartInd: 0 }})
        let lp2 = chart.data.datasets[1].loss_percentages.filter((val, ind) => ind > 4).map(val => { return { value: val, chartInd: 1 }})
        let lp3 = chart.data.datasets[2].loss_percentages.filter((val, ind) => ind > 9).map(val => { return { value: val, chartInd: 2 }})
        let lossPercentages = [
            ...lp1,
            ...lp2,
            ...lp3
        ]

        // chart.data.datasets.forEach(set => set.barPercentage = 0.6)
        chart.data.datasets.forEach(set => {
            // set.barThickness = 8
            set.barPercentage = 0.7
            set.categoryPercentage = 1
        })
        const data = {
            // labels: chart.data.labels,
            labels: labels2,
            datasets: chart.data.datasets,
            loss_percentages: lossPercentages
            // labels: labels,
            // datasets: datasets
        };

        data.abs_values = chart.data.labels

        const floatingLabels = {
            id: 'floatingLabels',
            afterDatasetsDraw(chart, args, options) {
                const {ctx} = chart

                chart.config.data.abs_values.forEach((val, ind) => {

                    let model = chart.getDatasetMeta(2).data[ind]._model
                    let barHeight = model.height
                    let fontSize = barHeight * 0.7
                    fontSize = 10
                    let xPosition = model.base
                    let yPosition = model.y

                    ctx.save()
                    ctx.fillStyle = 'black'
                    ctx.font = `${fontSize}px Arial`
                    ctx.fillText(val, xPosition, yPosition)

                    let lpObj = chart.config.data.loss_percentages[ind]
                    model = chart.getDatasetMeta(lpObj.chartInd).data[ind]._model
                    xPosition = model.x + (8 * 0.7)
                    yPosition = model.y
                    let lossPercentage = lpObj.value
                    if (isNumber(lossPercentage)) {
                        var percentLoss = lpObj.value.toFixed(2) + "%";
                        ctx.fillText(percentLoss, xPosition, yPosition)
                    }
                })

            }
        }
        const config = {
            type: 'horizontalBar',
            data,
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    yAxes: [{
                        stacked: true,
                        position: 'top',
                        scaleLabel: {
                            // display: true,
                            // // display: false,
                            // labelString: 'AC Energy (kWh)',
                            // fontSize: 18,
                            // fontFamily: 'Helvetica Neue',
                            // fontStyle: 'bold',
                            // fontColor: '#222',
                            // position: 'top',
                        },

                        gridLines: {
                            display:false,
                            drawBorder: true,
                            // color: '#999999',
                            lineWidth: 2,
                            drawOnChartArea: false
                        },

                        ticks: {
                            // fontSize: 11,
                            fontColor: '#ffffff',
                        },

                        // ticks: {
                        //     userCallback: function(value, index, values) {
                        //         // Convert the number to a string and split the string every 3 charaters from the end
                        //         value = value.toString();
                        //         value = value.split(/(?=(?:...)*$)/);
                        //         value = value.join(',');
                        //         return value;
                        //     }
                        // }
                    }],
                    xAxes: [{
                        ticks: {
                            display: false,
                            fontColor: '#ffffff',
                        },
                        // stacked: true,
                        scaleLabel: {
                            // display: true,
                            // labelString: 'Months',
                            // fontSize: 18,
                            // fontFamily: 'Helvetica Neue',
                            // fontStyle: 'bold',
                            // fontColor: '#222',
                        },

                        gridLines: {
                            display:false,
                            drawBorder: false,
                            // color: '#999999',
                            lineWidth: 2,
                            drawOnChartArea: false
                        }
                    }]
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        filter: function(item, data) {
                            if (item.datasetIndex > 2) {
                                return false
                            }
                            return true
                        },
                        fontColor: "white"
                    }
                },
                layout: {
                    padding: {
                        // left: 100,
                        right: 50,
                        // top: 20,
                        // bottom: 0
                    }
                },
            },
            plugins: [floatingLabels],
        }
        // console.log(this.lossData)
        const ctx = document.getElementById('myChartLoss');
        const myChart = new Chart(ctx, config)
        // console.log(myChart)
    },

    computed: {
      backgroundColor() {
        if (this.reportTemplate === 'reportTwo') {
          return ["#1c3366", "#f46545", "#4c618f", "#39d8c1"];
        } else if (this.reportTemplate === 'reportThree') {
          return ["#f8d6ce", "#d7e1f8", "#cccccc", "#39d8c1"];
        } else if (this.reportTemplate === 'reportDefault') {
          return ["#409EFF", "#6EC3F8", "#7BD5DD", "#39d8c1"];
        }
      },

      fontColor() {
        if (this.reportTemplate === 'reportTwo') {
          return '#191919';
        } else if (this.reportTemplate === 'reportThree') {
          return '#191919';
        } else if (this.reportTemplate === 'reportDefault') {
          return '#ffffff';
        }
      },

      displayLegend() {
        if (this.reportTemplate === 'reportTwo') {
          return true;
        } else if (this.reportTemplate === 'reportThree') {
          return true;
        } else if (this.reportTemplate === 'reportDefault') {
          return true;
        }
      },

      barThickness() {
        if (this.reportTemplate === 'reportTwo') {
        //   return 14;
          return 8;
        } else if (this.reportTemplate === 'reportThree') {
        //   return 12;
          return 8;
        } else if (this.reportTemplate === 'reportDefault') {
          return 8;
        }
      },

      boxWidth() {
        if (this.reportTemplate === 'reportTwo') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 25;
            }
        } else if (this.reportTemplate === 'reportThree') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 25;
            }
        } else if (this.reportTemplate === 'reportDefault') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 25;
            }
        }
      },

      fontSize() {
        if (this.reportTemplate === 'reportTwo') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 12;
            }
        } else if (this.reportTemplate === 'reportThree') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 12;
            }
        } else if (this.reportTemplate === 'reportDefault') {
            if (window.innerWidth >= 375 && window.innerWidth < 455) {
                return 10;
            } else if (window.innerWidth < 375) {
                return 8;
            } else {
                return 12;
            }
        }
      }
 
    //   backgroundColorWithoutSolar() {
    //     if (this.reportTemplate === 'reportTwo') {
    //       return '#cbcbcb';
    //     } else if (this.reportTemplate === 'reportThree') {
    //       return '#cccccc';
    //     }
    //   },

    //   chartHeight() {
    //     if (this.reportTemplate === 'reportTwo') {
    //       return 'reportTwoHeight';
    //     } else if (this.reportTemplate === 'reportThree') {
    //       return 'reportThreeHeight';
    //     }
    //   }
    },

    watch: {
        lossData: {
            deep: true,
            handler(value) {
                // this.render();
            },
        }
    },
};

</script>
