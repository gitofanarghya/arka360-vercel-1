<template>
    <div>
        <canvas id="myChartConsumption"></canvas>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

export default {
    props: ['chartData', 'reRender'],
    mounted () {
        const canvas = document.getElementById('myChartConsumption');
        const myChart = new Chart(canvas, {
            type: 'line',
            data: this.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    point: {
                        radius: 0
                    },
                    line: {
                        fill: true,
                        tension: 0.4
                    } 
                },
                bezierCurve: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Consumption Pattern',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hours of the Day',
                        },
                    }
                }
            }
        })
        this.myChart = myChart
    },
    watch: {
        reRender() {
            this.myChart.data = this.chartData
            this.myChart.update()
        }
    }
}
</script>

<style scoped>
@media (max-width: 650px) {
  canvas {
    min-width: auto;
  }
}

@media (min-width: 800px) {
  canvas {
    min-width: 503px; 
    max-width: 504px;
  }
}
</style>