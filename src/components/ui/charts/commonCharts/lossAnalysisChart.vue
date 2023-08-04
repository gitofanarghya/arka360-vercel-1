<!-- UNUSED FILE -->
<script>
import { HorizontalBar } from 'vue-chartjs';

export default {
    extends: HorizontalBar,
    props: {
        lossData: {
            type: Array,
            // default: () => {},
        },
        updatedData:{
            type: Object,
        },
        options: {
            type: Object,
            default: () => {
                return {
                    fontSize: 11,
                    // yOffset: 8,
                    // yOffset: this.yOffset,
                    xOffset: 85,
                    barThickness: 16,
                }
            },
        },
        reportTemplate: {
        type: String,
      }
    },
    methods: { 
        labelTooltip: function(tooltipItems, data) {
            return  'Production: ' + tooltipItems.xLabel + ' kWh';
        },

        convertLossDataToGraphFormat() {
            const lossDataGraphFormat = [
                {
                    Irradiation: [
                        {
                            initial_name: 'Horizontal Global Irradiation',
                            // initial_value: this.lossData.energy.irradiance.ghi,
                            initial_value: this.lossData[0].Irradiance[0].initial_value,
                            units: 'kWh/m²',
                        },
                        {
                            loss: 'Global Incidence on PV plane',
                            // percent: this.lossData.losses.irradiance.epoa,
                            percent: this.lossData[0].Irradiance[1].percent,
                        },
                        {
                            loss: 'Near Shading: irradiance loss',
                            // percent: this.lossData.losses.irradiance.shading,
                            percent: this.lossData[0].Irradiance[2].percent,
                        },
                        {
                            loss: 'Irradiance after reflection',
                            // percent: this.lossData.losses.irradiance.soiling,
                            percent: this.lossData[0].Irradiance[3].percent,
                        },
                        {
                            loss: 'Soiling loss factor',
                            // percent: this.lossData.losses.irradiance.iam,
                            percent: this.lossData[0].Irradiance[4].percent,
                        },
                    ],
                },
                {
                    DC: [
                        {
                            initial_name: 'Nominal Energy after PV conversion',
                            // initial_value: this.lossData.energy.dc.nominal,
                            initial_value: this.lossData[1].DC[0].initial_value, 
                            units: 'kWh',
                        },
                        {
                            loss: 'PV loss due to environmental condition',
                            // percent: this.lossData.losses.dc.environmental,
                            percent: this.lossData[1].DC[1].percent,
                        },
                        {
                            loss: 'Light Induced Degradation',
                            // percent: this.lossData.losses.dc.lid,
                            percent: this.lossData[1].DC[2].percent,
                        },
                        {
                            loss: 'Mismatch loss, modules and strings',
                            // percent: this.lossData.losses.dc.mismatch,
                            percent: this.lossData[1].DC[3].percent,
                        },
                        {
                            loss: 'Ohmic wiring loss',
                            // percent: this.lossData.losses.dc.dc_ohmic,
                            percent: this.lossData[1].DC[4].percent,
                        },
                    ],
                },
                {
                    AC: [
                        {
                            loss: 'Clipping losses',
                            // percent: this.lossData.losses.ac.clipping,
                            percent: this.lossData[2].AC[0].percent, 
                        },
                        {
                            loss: 'DC/AC conversion',
                            // percent: this.lossData.losses.ac.inverter_conversion,
                            percent: this.lossData[2].AC[1].percent, 
                        },
                        {
                            loss: 'System Availability', 
                            // percent: this.lossData.losses.ac.unavailability,
                            percent: this.lossData[2].AC[2].percent, 
                        },
                        {
                            loss: 'AC Ohmic loss', 
                            // percent: this.lossData.losses.ac.ac_ohmic,
                            percent: this.lossData[2].AC[3].percent, 
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
                    // var color = ["#1c3366", "#f46545", "#4c618f", "#39d8c1"];
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
            let chartOptions = {
                scales: {
                    xAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                                display: false,
                                userCallback: function(value, index, values) {
                                // Convert the number to a string and split the string every 3 charaters from the end
                                        return value.toLocaleString('en-US');
                                 },
                            },
                            gridLines: {
                                display: false,
                                drawBorder: false
                            }
                        }
                    ],
                    yAxes: [
                        {
                            stacked: true,
                            position: "right",
                            ticks: {
                                display: false,
                                userCallback: function(value, index, values) {
                                // Convert the number to a string and split the string every 3 charaters from the end
                                        return value.toLocaleString('en-US');
                                 },
                            },
                            gridLines: {
                                display: false,
                                drawBorder: false
                            },
                            // barThickness: vm.options.barThickness,
                            // barThickness: vm.barThickness,
                            // barPercentage: 0.5,
                            barPercentage: 0.2,
                            categoryPercentage: 1,
                            // categoryPercentage: 0.2,
                        }
                    ]
                },
                maintainAspectRatio: false,
                animation: {
                    onComplete: function(elem) {
                        let { chart } = elem
                        let { legend, ctx } = chart

                        ctx.font = "normal";
                        ctx.textAlign = "left";
                        ctx.textBaseline = "bottom";
                        ctx.position = "right";
                        ctx.font = `${vm.options.fontSize}px Helvetica Neue`;

                        // Custom legend code - START
                        let legendItems = legend.legendItems
                        let totalWidth = 0
                        let boxHeight = vm.options.fontSize + 5
                        legendItems.forEach((item, ind) => {
                            let text = item.text
                            totalWidth += (boxHeight + 5)
                            let width = ctx.measureText(text).width
                            if (ind == legendItems.length - 1) { return }
                            totalWidth += (width + 10)
                        })
                        
                        let curXCo = (chart.width - totalWidth)/2
                        let chartHeight = chart.height
                        let boxYCo = (chartHeight - 20) + boxHeight + ((20 - boxHeight)/2) - 10
                        let textYCo = boxYCo - ((boxHeight - vm.options.fontSize)/2)
                        legendItems.forEach(item => {
                            ctx.fillStyle = item.fillStyle;
                            ctx.fillRect(curXCo, boxYCo, boxHeight, -boxHeight)
                            curXCo += (boxHeight + 5)

                            let text = item.text
                            ctx.fillStyle = vm.fontColor;
                            ctx.fillText(text, curXCo, textYCo);

                            let width = ctx.measureText(text).width
                            curXCo += (width + 10)
                        })
                        // Custom legend code - END

                        ctx.fillStyle = vm.fontColor;
                        chartData.datasets.forEach(function(dataset) {
                            if (dataset.backgroundColor === loss_bar_color) { return }
                            
                            for (var i = 0; i < dataset.data.length; i++) {
                                if (dataset.data[i] === 0) { continue }

                                var model =
                                        dataset._meta[Object.keys(dataset._meta)[0]].data[i]
                                            ._model,
                                    left =
                                        dataset._meta[Object.keys(dataset._meta)[0]].data[i]
                                            ._xScale.left

                                var label = model.label;
                                var value = Math.round(dataset.abs_values[i]).toLocaleString('en-US') + "  " + dataset.unit;

                                // Labels
                                // y offset calculation for labels
                                let barHeight = model.height
                                let tickHeight = barHeight * (1/0.2)
                                let yOffset = (barHeight/2) + ((tickHeight - barHeight)*0.2)
                                ctx.fillText(label, left + 0, model.y - yOffset);

                                ctx.textAlign = "right";
                                ctx.fillText(value, left - 10, model.y + 6);
                                ctx.textAlign = "left";


                                // Printing values
                                // To calculate x coordinate of the text
                                let dataDict = dataset._meta[Object.keys(dataset._meta)[0]].data[i]
                                let right = dataDict._view.x;
                                let dataDict2 = dataset._meta[Object.keys(dataset._meta)[0]].data[i-1]
                                if (dataDict2 && dataDict2._view.x > right) {
                                    right = dataDict2._view.x
                                }
                                right = right + 8

                                let rightValue = value
                                if (dataset.loss_percentages[i]) {
                                    rightValue = dataset.loss_percentages[i].toFixed(2) + "%"
                                }
                                ctx.fillText(rightValue, right, model.y + 6);
                            }
                        });
                    },
                    duration: 0
                },
                responsive: true,
                responsiveAnimationDuration: 0,
                legend: {
                    // display: vm.displayLegend,
                    display: false,
                    // position: "bottom",
                    position: 'bottom',
                    // fullWidth: false,
                    // display: true,
                    // display: false,
                    labels: {
                        filter: (legendItem) => {
                            return legendItem.fillStyle != loss_bar_color;
                        },
                        // fontColor: "black",
                        fontColor: vm.fontColor,
                        // boxWidth: 25,
                        // boxWidth: 15,
                        boxWidth: vm.boxWidth,
                        fontSize: vm.fontSize,
                    }
                },
                tooltips: {
                    enabled: false,
                    // enabled: true,
                    callbacks: {
                        // label: this.labelTooltip,
                        label: vm.labelTooltip
                    }
                    
                },
                layout: {
                    padding: {
                        left: 100,
                        right: 80,
                        top: 20,
                        bottom: 20 // Adding bottom padding for custom legend
                    }
                },
            }
            let chart = {
                data: chartData,
                options: chartOptions
            }
            return chart;
        },
        render() {
            const lossDataGraphFormat = this.convertLossDataToGraphFormat();
            let chart = this.parseUnstructuredData(lossDataGraphFormat, this.updatedData.custom_color, this.updatedData.template_name);
            this.renderChart(chart.data, chart.options);
        },
    },
    mounted() {
        this.render();
    },

    computed: {
      yOffset() {
        if (this.reportTemplate === 'reportTwo') {
          return 4;
        } else if ((this.reportTemplate === 'reportThree') && (this.updatedData.report_type === 'landscape')) {
          return 2;
        } else if ((this.reportTemplate === 'reportThree') && (this.updatedData.report_type === 'portrait')) {
          return 5;
        } else if (this.reportTemplate === 'reportDefault') {
          return 7;
        }
      },

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
                this.render();
            },
        }
    },
};

</script>
