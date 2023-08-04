<template>
    <div>
        <canvas id="myChartGeneration" width="400" height="400"></canvas>
    </div>
</template>
<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

export default {
    props: {
        monthlyGeneration: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Month',
                        },
                    },
                    y: {
                        ticks: {
                            beginAtZero: true,
                        },
                        title: {
                            display: true,
                            text: 'AC Energy (kWh)',
                        },
                    },

                },
            },
            chartData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Monthly Energy Consumption',
                        backgroundColor: '#409eff',
                        data: this.monthlyGeneration,
                        barThickness: 22,
                    },
                ],
            },
        };
    },
    watch: {
        monthlyGeneration: {
            deep: true,
            handler(newVal) {
                this.chartData.datasets[0].data = newVal;
                this.myChart.update();
            },
        },
    },
    mounted() {
        this.render();
    },
    methods: {
        render() {
            const canvas = document.getElementById('myChartGeneration');
            const myChart = new Chart(canvas, {
                type: 'bar',
                data: this.chartData,
                options: this.chartOptions,
            })
            this.myChart = myChart
            
            // this.renderChart(this.chartData, this.chartOptions);
        },
    },
};
</script>
