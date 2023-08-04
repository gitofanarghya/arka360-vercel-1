<template>
    <div>
        <canvas id="myChartLoss" width="400" height="400"></canvas>
    </div>
</template>
<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
    props: {
        lossData: {
            type: Array,
            default: () => [],
        },
        updatedData:{
            type: Object,
        },
        options: {
            type: Object,
            default: () => {
                return {
                    fontSize: 11,
                    yOffset: 8,
                    xOffset: 85,
                    // barThickness: 16,
                    barThickness: 12,
                }
            },
        },
        reportTemplate: {
            type: String,
        }
    },

    data() {
        return {
            paddingAdded: false,
        }
    },
    
    methods: {
        createChartObj(lossData) {
            var loss_bar_color = "#CEE6FF";
            if (this.reportTemplate) { loss_bar_color = "#f0f3f8" }
            var bar_height_initial = 10;
            let vm = this;
            function _parseData() {
                function randColor(i) {
                    let color
                    if (vm.reportTemplate) {
                        let colors = vm.updatedData.custom_color
                        let reportTemplate = vm.updatedData.template_name
                        if (reportTemplate === 'solar_labs_2') {
                            color = [`${colors.primary_color}`, `${colors.secondary_color}`, `${colors.tertiary_color}`, "#39d8c1"];
                        } else if (reportTemplate === 'solar_labs_3') {
                            color = [`${colors.primary_color}`, `${colors.secondary_color}`, `${colors.tertiary_color}`, "#39d8c1"];
                        } else if (reportTemplate === 'solar_labs') {
                            color = ["#fff", `${colors.secondary_color}`, `${colors.tertiary_color}`, `${colors.tertiary_color}`];
                        }
                    } else {
                        color = ["#409EFF", "#6EC3F8", "#7BD5DD", "#39d8c1"];
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
            
            let yAxisTicks = []
            let overallInd = 0
            let maxXAxisVal = 0
            chartData.datasets.forEach(set => {
                maxXAxisVal = Math.max(...set.data, maxXAxisVal)
                if (vm.reportTemplate) {
                    set.barPercentage = 0.2
                    set.categoryPercentage = 1
                } else {
                    set.barThickness = vm.options.barThickness
                }

                if (!set.abs_values) { return }

                for (let val of set.abs_values) {
                    if (!val) { continue }
                    let valString = Math.round(val).toLocaleString('en-US') + " " + set.unit
                    yAxisTicks[overallInd] = valString
                    overallInd++
                }
            })

            let chartOptions = {
                indexAxis: 'y',
                scales: {
                    x:{
                        display: false,
                        max: maxXAxisVal,
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: function(value, index) {
                                return yAxisTicks[index]
                            },
                            color: vm.fontColor || "black",
                            font: {
                                size: vm.options.fontSize,
                            }
                        },
                        grid: {
                            display: false,
                        },
                        border: {
                            display:false,
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: {
                    onComplete: function(e) {
                        var ctx = e.chart.ctx;

                        ctx.font = "normal";
                        ctx.textAlign = "left";
                        ctx.textBaseline = "bottom";
                        ctx.position = "right";
                        ctx.font = `${vm.options.fontSize}px Helvetica Neue`;

                        let labelCnt = 0
                        let rightOffsetVal

                        if (vm.reportTemplate) {
                            ctx.fillStyle = vm.fontColor;
                        }
                        chartData.datasets.forEach((dataset, ind) => {
                            if (dataset.backgroundColor === loss_bar_color) { return }

                            let datasetMeta = e.chart.getDatasetMeta(ind)
                            let datasetMeta2 = e.chart.getDatasetMeta(ind + 3)
                            
                            for (var i = 0; i < dataset.data.length; i++) {
                                if (dataset.data[i] === 0) { continue }

                                var model = datasetMeta.data[i]
                                var left = model.base
                                rightOffsetVal = left
                                
                                // Labels
                                var label = chartData.labels[labelCnt]
                                labelCnt++
                                // y offset calculation for labels
                                let barHeight = model.height
                                let tickHeight = barHeight * (1/0.2)
                                let yOffset = (barHeight/2) + ((tickHeight - barHeight)*0.2)
                                if (!vm.reportTemplate) { yOffset -= 7}
                                ctx.fillText(label, left, model.y - yOffset);


                                // Values
                                let rightValue = Math.round(dataset.abs_values[i]).toLocaleString('en-US') + "  " + dataset.unit
                                if (typeof dataset.loss_percentages[i] === "number") {
                                    rightValue = dataset.loss_percentages[i].toFixed(2) + "%"
                                }
                                // To calculate x coordinate of the text
                                let right = model.x;
                                let model2 = datasetMeta2.data[i]
                                if (model2 && model2.x > right) {
                                    right = model2.x
                                }
                                right = right + 8
                                ctx.fillText(rightValue, right, model.y + barHeight/2);
                            }
                        });

                        // Padding for the labels at the right
                        if (!vm.paddingAdded && e.chart.ctx.canvas.width) {
                            vm.paddingAdded = true
                            e.chart.options.layout.padding.right = rightOffsetVal
                            e.chart.update()
                        }
                    },
                    duration: 0
                },
                responsive: true,
                responsiveAnimationDuration: 0,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            filter: (legendItem, chartData) => {
                                return legendItem.fillStyle != loss_bar_color;
                            },
                            color: vm.fontColor || "black",
                            boxWidth: 25,
                        }
                    },
                },
                tooltips: {
                    enabled: false
                },
                layout: {
                    padding: {
                        top: 20,
                        left: 10
                    }
                },
            }
            let chart = {
                type: 'bar',
                data: chartData,
                options: chartOptions
            }
            return chart;
        },
        render() {
            let chart = this.createChartObj(this.lossData);
            const canvas = document.getElementById('myChartLoss');
            const myChart = new Chart(canvas, chart)
            this.myChart = myChart;
        },
    },
    computed: {
        fontColor() {
            if (this.reportTemplate === 'reportTwo') {
                return '#191919';
            } else if (this.reportTemplate === 'reportThree') {
                return '#191919';
            } else if (this.reportTemplate === 'reportDefault') {
                return '#ffffff';
            }
        }
    },
    mounted() {
        this.render();
    },
    watch: {
        lossData: {
            deep: true,
            handler() {
                this.myChart.update();
            },
        }
    },
};

</script>
