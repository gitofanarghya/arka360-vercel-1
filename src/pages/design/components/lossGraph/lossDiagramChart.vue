<template>
	<div>
	<!-- <div id="sankey_loss_diagram" ref="sankey_loss_diagram"></div> -->
		<lossBarChart :lossData="lossData"/>
		<!-- <p style="color: red">LDC {{this.lossData}}</p> -->
		<!-- <button @click="test" style="color: red">Test</button> -->
	</div>
</template>

<script>

// import {renderSankeyDiagram, resizeSankeyDiagram} from './sankeyLossDiagram.js';
import lossBarChart from './lossBarChart';

export default {
	props: ['lossData'],
	data() {
		return {
			data: [{"Irradiance": [{"initial_name": "Irradiance at optimal tile/orientation", "initial_value": 1949, "units": "kWh/m2"}, {"loss": "tilt", "percent": -3.9}, {"loss": "shade", "percent": -3.7}, {"loss": "soiling", "percent": -2}, {"loss": "snow", "percent": 0}, {"loss": "incidence angle modifier", "percent": -3.3}]}, {"DC": [{"initial_name": "energy after PV conversion", "initial_value": 34213, "units": "kWh"}, {"loss": "environmental conditions", "percent": -11.7}, {"loss": "module nameplate rating", "percent": 0}, {"loss": "light induced degradation", "percent": -1.5}, {"loss": "connections", "percent": -0.5}, {"loss": "Mismatch", "percent": -2}, {"loss": "dc wiring", "percent": -2}]}, {"AC": [{"loss": "DC/AC conversion", "percent": -4.3}, {"loss": "Inverter clipping", "percent": 0}]}, {"Other": [{"loss": "Age", "percent": 0}, {"loss": "system availability", "percent": -3}, {"loss": "Other", "percent": 0}]}],
			canvasSize: null,
            lossesData: {
            labels: ['AC Ohmic', 'Unavability', 'DC Ohmic', 'Mismatch', 'Irradiance', 'Temperature', 'Inverter Efficiency', 'IAM', 'Shading', 'Soiling'],
            datasets: [
                {
                    label: 'Losses',
                    backgroundColor: '#409eff',
                    data: [],
                }
            ]
        },

		}
	},
	methods: {
	},
	mounted () {
	},
	components: {
		lossBarChart,
	},
    watch: {

        lossData: {

            //deep: true,
            handler(newVal) {
                if(newVal.hasOwnProperty('ac' || 'dc' || 'irradiance') && newVal['ac' || 'dc' || 'irradiance'] !== null) {
                	var lossesTypes = Object.values(newVal);
                	for (let i = 0; i < lossesTypes.length; i++){
                		for (let key in lossesTypes[i]){
                			this.lossesData.datasets[0].data.push(parseFloat(lossesTypes[i][key]));
                		}
                	}
                } 
                else {
                    this.showGenerationData = false;
                }

            }, 
        },
    },
}

</script>
