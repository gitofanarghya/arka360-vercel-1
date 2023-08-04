<template>
    <div
        v-if="monthlyAc.length > 0"
        id="designGeneration">
        <div
            class="heading_"
            style="text-align: left; padding: 3vw 0 3% 0;" > GENERATION ANALYSIS</div>
        <div style="display: flex; justify-content: space-between;">
            <div
                class="chartWrapperClass">
                <generationChart
                    :monthlyGeneration="monthlyAc"
                    style="height: 400px; width: 500px;"/>
            </div>
            <div style="height : fit-content; margin-right: 250px;">
                <div class="totalGenerationHeading"> Total Generation </div>
                <div class="totalGenerationValue">{{ totalGenerationInMWh.toFixed(2) }} MWh</div>
            </div>
            
        </div>
    </div>
</template>

<script>
import generationChart from './generationChart.vue';
import { mapState } from 'pinia';
import { useDesignStore } from '../../../../stores/design';

export default {
    name: 'DesignGeneration',
    components: {
        generationChart,
    },
    data() {
        return {
            msg: 'I am in designGeneration',
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            monthlyAc: 'GET_DESIGN_MONTHLY_AC_GENERATION',
        }),
        totalGenerationInMWh() {
            return this.monthlyAc ? this.monthlyAc.reduce((a, b) => a + b, 0) / 1000 : 0;
        },
    },
};
</script>

<style type="text/css" scoped>
.heading_ {
    font-size: 1.2vw;
    color: #707070;
    font-weight: bold;
}
.totalGenerationHeading {
    font-size: 0.9vw;
    color: #707070;
    font-weight: 900;
    text-align: right;
}

.totalGenerationValue {
    font-size: 0.9vw;
    color: #707070;
    font-weight: 500;
    padding-top: 5px;
    padding-bottom: 15px;
}
</style>
