<!-- <template>
    <apexchart
        :options="chartOptions"
        :series="series"
        height="300"
        type="bar"/>
</template>

<script>
import VueApexCharts from 'vue-apexcharts';

export default {
    name: 'MonthlyGenerationChart',
    components: {
        apexchart: VueApexCharts,
    },
    props: {
        monthlyGeneration: {
            type: Array,
            default() {
                return [1, 1, 1, 1, 1];
            },
        },
    },
    computed: {
        series() {
            return [{
                name: 'Generation',
                data: this.monthlyGeneration,
            }];
        },
    },
    nonReactiveData() {
        return {
            chartOptions: {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                plotOptions: {
                    bar: {
                        columnWidth: '50%%',
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    labels: {
                        rotate: -90,
                        rotateAlways: true,
                    },
                    categories: [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                    ],
                },
                yaxis: {
                    labels: {
                        formatter(val) {
                            return `${val.toFixed()} KWh`;
                        },
                    },
                },
                colors: ['#00c2c7'],
                tooltip: {
                    y: {
                        formatter(val) {
                            return `${val.toFixed()} KWh`;
                        },
                    },
                },
            },
        };
    },
};

</script>
-->
