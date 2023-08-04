<script>
import { Bar } from 'vue-chartjs';

export default {
    extends: Bar,
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
                    xAxes: [{
                        gridLines: {
                            display: false,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Month',
                        },
                        barThickness: 22,
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'AC Energy (kWhr)',
                        },
                    }],

                },
            },
            chartData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Monthly Generation',
                        backgroundColor: '#409eff',
                        data: this.monthlyGeneration,
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
                this.render();
            },
        },
    },
    mounted() {
        this.render();
    },
    methods: {
        render() {
            this.renderChart(this.chartData, this.chartOptions);
        },
    },
};
</script>
