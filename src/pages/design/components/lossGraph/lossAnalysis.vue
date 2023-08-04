<template>
	<div
		v-if="Object.keys(lossData).length > 0"
        id="lossGeneration">
        <div
            class="heading_"
            style="text-align: left; padding: 3vw 0 3% 0;" > LOSS ANALYSIS </div>
		<div
			class="chartWrapperClass"
			style="pointer-events: none">
			<lossBarChart
				style="height: 530px;"
				:lossData="lossData"/>
		</div>
    </div>
	
</template>

<script>
import lossBarChart from '@/components/ui/lossAnalysisChart.vue';
import { mapState } from 'pinia';
import { useDesignStore } from '../../../../stores/design';
export default {
	data() {
		return {
			msg: 'I am in lossAnalysis'
		}
	},
	computed: {
		...mapState(useDesignStore, {
			lossData: 'GET_DESIGN_LOSS_DATA'
        }),
	},
	components: {
		lossBarChart,
	},
}

</script>

<style type="text/css" scoped>
.heading_ {
    font-size: 1.wvw;
    color: #707070;
    font-weight: bold;
}
</style>
