// import { HorizontalBar } from 'vue-chartjs/types';
import { HorizontalBar } from 'vue-chartjs'

export default {
    extends: HorizontalBar,
    data() {
        return {

            data: null,
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            display: true,

                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Month',
                        },
                        gridLines: {
                            display: false,
                        },
                    }],
                    yAxes: [{
                        stacked: false,
                        position: 'left',
                        // barPercentage: 2,
                        // categoryPercentage: 2,
                        ticks: {
                            display: true,
                            beginAtZero: true,
                            mirror: true,
                            labelOffset: -15,
                            padding: -10,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Monthy',
                        },
                        gridLines: {
                            display: false,
                        },
                        barThickness: 2,
                    }],
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'point',
                    enabled: false,
                    custom(tooltipModel) {
                        // Tooltip Element
                        let tooltipEl = document.getElementById('chartjs-tooltip');

                        // Create element on first render
                        if (!tooltipEl) {
                            tooltipEl = document.createElement('div');
                            tooltipEl.id = 'chartjs-tooltip';
                            tooltipEl.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        if (tooltipModel.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Set caret Position
                        tooltipEl.classList.remove('above', 'below', 'no-transform');
                        if (tooltipModel.yAlign) {
                            tooltipEl.classList.add(tooltipModel.yAlign);
                        } else {
                            tooltipEl.classList.add('no-transform');
                        }

                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }

                        // Set Text
                        if (tooltipModel.body) {
                            const titleLines = tooltipModel.title || [];
                            const bodyLines = tooltipModel.body.map(getBody);
                            let innerHtml = '<thead>';

                            titleLines.forEach((title) => {
                                innerHtml += `<tr><th>${title}</th></tr>`;
                            });
                            innerHtml += '</thead><tbody>';

                            bodyLines.forEach((body, i) => {
                                if (i === 0) {
                                    const colors = tooltipModel.labelColors[i];
                                    let style = `background:${colors.backgroundColor} !important`;
                                    style += `; border-color:${colors.borderColor}`;
                                    style += '; border-width: 2px';
                                    const span = `<span style="${style}"></span>`;
                                    innerHtml += `<tr><td>${span}${body}</td></tr>`;
                                }
                            });
                            innerHtml += '</tbody>';

                            const tableRoot = tooltipEl.querySelector('table');
                            tableRoot.innerHTML = innerHtml;
                        }

                        // `this` will be the overall tooltip
                        const position = this._chart.canvas.getBoundingClientRect();

                        // Display, position, and set styles for font
                        tooltipEl.style.opacity = 1;
                        tooltipEl.style.backgroundColor = 'rgb(0, 0, 0, 0.8)';
                        tooltipEl.style.color = 'rgb(255, 255, 255)';
                        tooltipEl.style.borderRadius = '5px';
                        tooltipEl.style.position = 'absolute';
                        tooltipEl.style.left = `${position.left + window.pageXOffset + tooltipModel.caretX - tooltipEl.offsetWidth}px`;
                        tooltipEl.style.top = `${position.top + window.pageYOffset + tooltipModel.caretY}px`;
                        tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                        tooltipEl.style.fontSize = `${tooltipModel.bodyFontSize}px`;
                        tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                        tooltipEl.style.padding = `${tooltipModel.yPadding}px ${tooltipModel.xPadding}px`;
                        tooltipEl.style.pointerEvents = 'none';
                    },
                    callbacks: {
                        label(item, data) {
                            for (let i = 0; i < data.datasets.length; ++i) {
                                if (data.datasets[i].backgroundColor !== 'rgb(225, 225, 225)') {
                                    const val = data.datasets[i].abs_values[item.index];
                                    const unit = data.datasets[i].unit;
                                    if (val > 0) {
                                        break;
                                    }
                                }
                            }
                            return `${Math.round(val)} ${unit}`;
                        },
                    },
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    fontSize: 50,
                    labels: {
                        filter: (legendItem, data) => legendItem.fillStyle !== this.loss_bar_color,
                    },
                },
            },
            bar_height_initial: 10,
            // color of the bar showing decrease in value
            loss_bar_color: 'rgb(225, 225, 225)',
        };
    },
    props: ['lossData'],
    mounted() {
        // this.parseData();
        // this.render();
        // this.renderChart(this.lossData, this.options);
    },
    methods: {
        render() {
            this.renderChart(this.lossData, this.options);
        },
        parseData() {
            const component_names = [];
            const loss_names = [];
            const units = [];
            const loss_percentages = [];
            const absolute_values = [];
            const bar_height = [];
            for (let i = 0; i < this.lossData.length; ++i) {
                component_names.push(Object.keys(this.lossData[i])[0]);
                loss_names.push([]);
                loss_percentages.push([]);
                absolute_values.push([]);
                bar_height.push([]);
                for (let j = 0; j < this.lossData[i][component_names[i]].length; ++j) {
                    const l = this.lossData[i][component_names[i]][j];
                    if (j === 0) {
                        if (l.initial_name === undefined && l.initial_value === undefined && l.units === undefined) {
                            loss_names[i].push('', l.loss);
                            loss_percentages[i].push(l.percent);
                            absolute_values[i].push(absolute_values[i - 1][absolute_values[i - 1].length - 1]);
                            absolute_values[i].push(absolute_values[i][0] * (1 + (l.percent) / 100));
                        } else {
                            loss_percentages[i].push(0);
                            loss_names[i].push(l.initial_name || '');
                            absolute_values[i].push(l.initial_value || absolute_values[i - 1][absolute_values[i - 1].length - 1]);
                        }
                        units.push(l.units || units[i - 1]);
                        if (i === 0) {
                            bar_height[i].push(this.bar_height_initial);
                        } else if (l.loss) {
                            bar_height[i].push(bar_height[i - 1][bar_height[i - 1].length - 1]);
                            bar_height[i].push(bar_height[i][0] * (100 + l.percent) / 100);
                        } else {
                            bar_height[i].push(bar_height[i - 1][bar_height[i - 1].length - 1]);
                        }
                    } else {
                        loss_names[i].push(l.loss);
                        loss_percentages[i].push(l.percent);
                        absolute_values[i].push(absolute_values[i][absolute_values[i].length - 1] * (1 + (l.percent) / 100));
                        bar_height[i].push(bar_height[i][bar_height[i].length - 1] * (absolute_values[i][absolute_values[i].length - 1] / absolute_values[i][absolute_values[i].length - 2]));
                    }
                }
            }
            const datasets = [];
            for (let i = 1; i < bar_height.length; ++i) {
                const zeros = [];
                for (let j = 0; j < bar_height[i - 1].length; ++j) {
                    zeros.push(0);
                }
                if (loss_names[i][0] === '') {
                    bar_height[i] = zeros.concat(bar_height[i].slice(1));
                    absolute_values[i] = zeros.concat(absolute_values[i].slice(1));
                } else {
                    bar_height[i] = zeros.concat(bar_height[i]);
                    absolute_values[i] = zeros.concat(absolute_values[i]);
                }
                loss_percentages[i] = zeros.concat(loss_percentages[i]);
            }
            let labels = [].concat(...loss_names);
            labels = labels.filter(label => label !== '');
            for (let i = 0; i < component_names.length; ++i) {
                const d = {
                    label: component_names[i],
                    backgroundColor: this.randColor(),
                    data: bar_height[i],
                    abs_values: absolute_values[i],
                    unit: units[i],
                };
                datasets.push(d);
            }
            for (let i = 0; i < loss_percentages.length; ++i) {
                const d = {
                    label: component_names[i],
                    backgroundColor: this.loss_bar_color,
                    data: bar_height[i].map((height, idx) => {
                        let l = (100 * height) / (100 + loss_percentages[i][idx]);
                        if (100 + loss_percentages[i][idx] === 0) {
                            l = height;
                        }
                        return l;
                    }),
                };
                datasets.push(d);
            }
            this.data = {
                labels,
                datasets,
            };
        },
        randColor() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const color = `rgb(${r},${g},${b})`;
            if (color !== this.loss_bar_color) {
                return color;
            }
            return this.randColor();
        },
    },
    watch: {
        lossData: {
            deep: true,
            handler(newVal) {
                // this.lossData.datasets[0].data.push(93);
                // this.lossData = newVal;
                // this.renderChart(this.lossData, this.options);
                // this.parseData();
                this.render();
                // this.newVal.lossesData.datasets[0].data.push(93);
                // this.parseData();
            },
        },
    },
};