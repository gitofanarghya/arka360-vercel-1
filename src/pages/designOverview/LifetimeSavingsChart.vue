<!--<template>
    <apexchart
        :options="chartOptions"
        :series="series"
        height="300"
        type="bar"/>
</template>

<script>
import VueApexCharts from 'vue-apexcharts';

export default {
    name: 'LifetimeSavingsChart',
    components: {
        apexchart: VueApexCharts,
    },
    props: {
        cumulativeSavings: {
            type: Array,
            default() {
                return [1, 1, 1, 1, 1];
            },
        },
    },
    computed: {
        series() {
            return [{
                name: 'Saving',
                data: this.cumulativeSavings,
            }];
        },
        xCategories() {
            const xCategories = [];
            for (let idx = 1; idx <= this.cumulativeSavings.length; idx += 1) {
                xCategories.push(idx);
            }
            return xCategories;
        },
        chartOptions() {
            return {
                chart: {
                    toolbar: {
                        show: false,
                    },
                },
                plotOptions: {
                    bar: {
                        columnWidth: '50%',
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                colors: ['#607d8b'],
                xaxis: {
                    tickPlacement: 'between',
                    categories: this.xCategories,
                    tickAmount: 25,
                    labels: {
                        show: false,
                    },
                    axisTicks: {
                        show: false,
                    },
                    axisBorder: {
                        show: false,
                    },
                },
                yaxis: {
                    labels: {
                        formatter(val) {
                            return new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                            }).format(val);
                        },
                    },
                },
                fill: {
                    opacity: 1,
                    colors: [
                        ({ value }) => {
                            if (value < 0) {
                                return '#0086ae';
                            }
                            return '#00c2c7';
                        },
                    ],
                },
                tooltip: {
                    x: {
                        formatter(val) {
                            return `Year ${val}`;
                        },
                    },
                    y: {
                        formatter(val) {
                            return new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                            }).format(val);
                        },
                    },
                },
            };
        },
    },
};
</script>
<style scoped>

</style>
-->