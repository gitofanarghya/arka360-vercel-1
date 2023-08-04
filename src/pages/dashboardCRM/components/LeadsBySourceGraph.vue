<template>
  <div>
    <CardElement :headingText="barName">
      <template v-slot:header>
        <DropdownElement
          @selectionMade="changeChart"
          :dataOptions="computedDropdown"
        />
      </template>
      <template v-slot:body>
        <Chart :type="bar" :data="chartData" :options="options" />
      </template>
    </CardElement>
  </div>
</template>

<script>
import Chart from "./models/Chart.vue";
import CardElement from "./models/Card/CardElement.vue";

import DropdownElement from "./models/DropdownElement.vue";
export default {
  name: "LeadsBySource",
  components: {
    Chart,
    DropdownElement,
    CardElement,
  },
  props: ["graphData"],
  data() {
    return {
      dropdownSelection: "",
      dropdownOptions: [],
      barName: "Leads By Source",
      bar: "bar",
      isBar1: true,
      isBar2: false,
      chartData: null,
      options: {
        indexAxis: "y",
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        responsive: true,
        scales: {
          x: {
            grid: {
              display: false,
            },
            title:{
              display:true,
              text:"No. of Leads",
              color: '#222222'
            }
          },
          y: {
            grid: {
              display: false,
            },
            title:{
              display:true,
              text:"Sources",
              color: '#222222'
            }
          },
        },
        plugins: {
          legend: {
            display: false, // Set display to false to hide the legend
          },
        },
      },
      // barData1: {
      //   labels: [],
      //   datasets: [
      //     {
      //       data: [],
      //       backgroundColor: [
      //         "rgba(64, 158, 255, 1)",
      //         "rgba(248, 130, 39, 1)",
      //         "rgba(44, 194, 28, 1)",
      //         "rgba(193, 58, 94, 1)",
      //         "rgba(124, 30, 164, 1)",
      //       ],
      //     },
      //   ],
      // },
      // barData2: {
      //   labels: [],
      //   datasets: [
      //     {
      //       data: [],

      //       backgroundColor: [
      //         "rgba(64, 158, 255, 1)",
      //         "rgba(248, 130, 39, 1)",
      //         "rgba(44, 194, 28, 1)",
      //         "rgba(193, 58, 94, 1)",
      //         "rgba(124, 30, 164, 1)",
      //       ],
      //     },
      //   ],
      // },
      // barData3: {
      //   labels: [],
      //   datasets: [
      //     {
      //       data: [],
      //       backgroundColor: [
      //         "rgba(64, 158, 255, 1)",
      //         "rgba(248, 130, 39, 1)",
      //         "rgba(44, 194, 28, 1)",
      //         "rgba(193, 58, 94, 1)",
      //         "rgba(124, 30, 164, 1)",
      //       ],
      //     },
      //   ],
      // },
      // barData4: {
      //   labels: [],
      //   datasets: [
      //     {
      //       data: [],
      //       backgroundColor: [
      //         "rgba(64, 158, 255, 1)",
      //         "rgba(248, 130, 39, 1)",
      //         "rgba(44, 194, 28, 1)",
      //         "rgba(193, 58, 94, 1)",
      //         "rgba(124, 30, 164, 1)",
      //       ],
      //     },
      //   ],
      // },
      barDataCommon: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "rgba(64, 158, 255, 1)",
              "rgba(248, 130, 39, 1)",
              "rgba(44, 194, 28, 1)",
              "rgba(193, 58, 94, 1)",
              "rgba(124, 30, 164, 1)",
            ],
          },
        ],
      },
    };
  },
  methods: {
    changeChart(data) {
      this.dropdownSelection = data;
      this.setChartData();
    },
    setChartData() {
      switch (this.dropdownSelection) {
        case "this_week":
          console.log(this.$props.graphData.this_week);
          let week = this.getLabelsAndData(this.$props.graphData.this_week);
          this.barDataCommon.labels = week.labels;
          this.barDataCommon.datasets[0].data = week.data;
          console.log(this.barDataCommon);
          this.chartData = JSON.parse(JSON.stringify(this.barDataCommon));
          // this.chartData = this.barData1;
          break;

        case "this_month":
          // this.chartData = this.barData2;
          let month = this.getLabelsAndData(this.$props.graphData.this_month);
          this.barDataCommon.labels = month.labels;
          this.barDataCommon.datasets[0].data = month.data;
          console.log(this.barDataCommon);
          this.chartData = JSON.parse(JSON.stringify(this.barDataCommon));
          break;

        case "this_quarter":
          let quarter = this.getLabelsAndData(
            this.$props.graphData.this_quarter
          );
          this.barDataCommon.labels = quarter.labels;
          this.barDataCommon.datasets[0].data = quarter.data;
          this.chartData = JSON.parse(JSON.stringify(this.barDataCommon));

          //this.chartData = this.barData3;
          break;

        case "this_year":
          //this.chartData = this.barData4;
          let year = this.getLabelsAndData(this.$props.graphData.this_year);
          this.barDataCommon.labels = year.labels;
          this.barDataCommon.datasets[0].data = year.data;
          this.chartData = JSON.parse(JSON.stringify(this.barDataCommon));
          break;

        default:
          break;
      }
    },
    getLabelsAndData(arr) {
      //console.log(arr);
      let labels = [];
      let data = [];
      for (let i = 0; i < arr.length; i++) {
        labels.push(arr[i].lead_source);
        data.push(arr[i].count);
      }
      return { labels, data };
    },
  },
  computed: {
    computedDropdown() {
      console.log(this.$props.graphData);
      if (this.$props.graphData) {
        console.log(Object.keys(this.$props.graphData));
        let dropDownValues = Object.keys(this.$props.graphData);
        return [
          { value: dropDownValues[0], label: "This Week" },
          { value: dropDownValues[1], label: "This Month" },
          { value: dropDownValues[2], label: "This Quarter" },
          { value: dropDownValues[3], label: "This Year" },
        ];
      }
    },
  },
  watch: {
    dropdownSelection: {
      immediate: true,
      handler(newSelection) {
        this.setChartData(newSelection);
      },
    },
  },
  mounted() {
    //console.log(this.computedDropdown);
    this.dropdownSelection = this.computedDropdown[0].value;
    console.log(this.dropdownSelection);
    //set the barData objects
    //bar1
    // let week = this.getLabelsAndData(this.$props.graphData.this_week);
    // this.barData1.labels = week.labels;
    // this.barData1.datasets[0].data = week.data;
    // //bar2
    // let month = this.getLabelsAndData(this.$props.graphData.this_month);
    // this.barData2.labels = month.labels;
    // this.barData2.datasets[0].data = month.data;
    // //bar3
    // let quarter = this.getLabelsAndData(this.$props.graphData.this_quarter);
    // this.barData3.labels = quarter.labels;
    // this.barData3.datasets[0].data = quarter.data;
    // //bar4
    // let year = this.getLabelsAndData(this.$props.graphData.this_year);
    // this.barData4.labels = year.labels;
    // this.barData4.datasets[0].data = year.data;

    this.setChartData();
  },
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px; /* 5px rounded corners */
  width: 100%;
  height: 100%;
}
</style>
