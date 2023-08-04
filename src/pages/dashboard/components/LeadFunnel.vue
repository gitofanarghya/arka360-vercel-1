<template>
	<div class="graphContainer">
		<h4 class="grphHeading">Lead Funnel</h4>
		<div class="grphBox">
			<div class="headerGrph">
				<P class="grphCont"
					>This funnel depicts the progress of leads added in this month.</P
				>
				<div class="drpDownGrph">
					<el-select v-model="value" placeholder="All Regions">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
					<el-select v-model="value" placeholder="This Month">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
				</div>
			</div>
			<div class="grphContainer">
				<canvas id="myChartLeads" width="400" height="400"></canvas>
			</div>
		</div>
	</div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables)

export default {
	mounted() {
		let config = {
			type: "bar",
			data: {
				labels: [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				],
				// datasets: [
				// 	{
				// 		data: this.monthlyGeneration,
				// 		backgroundColor: "#409eff",
				// 		borderWidth: 1,
				// 		label: "Monthly Generation",
				// 	},
				// ],
			},
			options: {
				tooltips: {
					enabled: true,
					// callbacks: {
					// 	label: this.labelTooltip,
					// },
				},
				legend: {
					display: true,
				},
				responsive: true,
				maintainAspectRatio: false,
				// scales: {
				// 	yAxes: [
				// 		{
				// 			position: "top",
				// 			scaleLabel: {
				// 				display: true,
				// 				// display: false,
				// 				labelString: "AC Energy (kWh)",
				// 				fontSize: 18,
				// 				fontFamily: "BrandonText",
				// 				fontStyle: "bold",
				// 				fontColor: "#222",
				// 				position: "top",
				// 			},

				// 			gridLines: {
				// 				// display:false,
				// 				// drawBorder: true,
				// 				// color: '#999999',
				// 				lineWidth: 2,
				// 				drawOnChartArea: false,
				// 			},

				// 			ticks: {
				// 				userCallback: function (value, index, values) {
				// 					// Convert the number to a string and split the string every 3 charaters from the end
				// 					value = value.toString();
				// 					value = value.split(/(?=(?:...)*$)/);
				// 					value = value.join(",");
				// 					return value;
				// 				},
				// 			},
				// 		},
				// 	],
				// 	xAxes: [
				// 		{
				// 			scaleLabel: {
				// 				display: true,
				// 				labelString: "Months",
				// 				fontSize: 18,
				// 				fontFamily: "BrandonText",
				// 				fontStyle: "bold",
				// 				fontColor: "#222",
				// 			},

				// 			gridLines: {
				// 				// display:false,
				// 				drawBorder: true,
				// 				// color: '#999999',
				// 				lineWidth: 2,
				// 				drawOnChartArea: false,
				// 			},
				// 		},
				// 	],
				// },
			},
			// plugins: [pluginDataLabels],
		};

		const ctx = document.getElementById("myChartLeads");
		const myChart = new Chart(ctx, config);
	},
};
</script>

<style scoped>
.grphHeading {
	font-size: 18px;
	font-weight: 600;
	color: #222;
	margin-bottom: 16px;
}

.grphBox {
	border-radius: 8px;
	box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.12);
	background-color: #fff;
	word-break: break-word;
}

.headerGrph {
	display: flex;
	justify-content: space-between;
	gap: 24px;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #ccc;
}

.grphCont {
	font-size: 14px;
	font-weight: 100;
	color: #222;
}

.drpDownGrph {
	display: flex;
	gap: 16px;
}

.grphContainer {
	padding: 16px;
}

@media (max-width: 650px) {
	.headerGrph {
		gap: 16px;
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>