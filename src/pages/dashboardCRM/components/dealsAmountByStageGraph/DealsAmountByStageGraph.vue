<template>
  <div style="height:100%">
    <CardElement :headingText="barName">
      <template v-slot:header>
        <ToggleSwitch @change="handleToggleChange" />
      </template>
      <template v-slot:body>
        <Chart :type="bar" :data="chartData" :options="options" />
      </template>
    </CardElement>
  </div>
</template>

<script>
import Chart from "../models/Chart.vue";
import ToggleSwitch from "./ToggleSwitch.vue";
import CardElement from "../models/Card/CardElement.vue";

export default {
  name: "DealsAmountByStage",
  components: {
    Chart,
    ToggleSwitch,
    CardElement,
  },
  props: ["data"],
  data() {
    return {
      isActive: false,
      barName: "",
      barName1: "Deals Amount By Stage",
      barName2: "No. of Deals By Stage",
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
        plugins: { legend: { display: false } },
        responsive: true,
        scales: {
          x: {
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: localStorage.getItem('user').isUSFlagEnabled ? 'USD' : 'INR',
              color: '#222222'
            },
            ticks: {
              callback: function (value, index, values) {
                if(localStorage.getItem('user').isUSFlagEnabled==true){
                  return value
                }else{
                if (value >= 1000000000) {
                  return (value / 1000000000) + "B";
                } else if (value >= 1000000) {
                  return (value / 1000000) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000) + 'K';
                } else {
                  return value;
                }
              }
            }
          }
          },
          y: {
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: "Stage",
              color: '#222222'
            },
          },
        },
      },
      barData1: {
        labels: this.data.map((e) => e.stage),
        datasets: [
          {
            data: this.data.map((e) => e.amount),
            backgroundColor: "rgba(54, 162, 235, 1)",
          },
        ],
      },
      barData2: {
        labels: this.data.map((e) => e.stage),
        datasets: [
          {
            data: this.data.map((e) => e.count),
            backgroundColor: "rgba(255, 165, 0, 1)",
          },
        ],
      },
    };
  },
  methods: {
    //   changeChart(data) {
    //     this.dropdownSelection = data;
    //     this.setChartData();
    //   },
    setChartData() {
      if (this.isActive) {
        console.log("setting graph data");
        this.barName = this.barName2;
        this.chartData = this.barData2;
      } else {
        console.log("setting graph data");
        this.barName = this.barName1;
        this.chartData = this.barData1;
      }
    },
    handleToggleChange(value) {
      if(this.isActive==true){
        this.options.scales.x={
          grid:{
            display: false,
          },
          title: {
            display: true,
            text: localStorage.getItem('user').isUSFlagEnabled ? 'USD' : 'INR',
            color: 'black'
          },
          ticks: {
              callback: function (value, index, values) {
                if(localStorage.getItem('user').isUSFlagEnabled==true){
                  return value
                }else{
                if (value >= 1000000000) {
                  return (value / 1000000000) + "B";
                } else if (value >= 1000000) {
                  return (value / 1000000) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000) + 'K';
                } else {
                  return value;
                }
              }
              }
            }
        }
      }else{
        this.options.scales.x= {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "No. of Deals",
            color: 'black'
          }
        }
      }
      // Handle the toggle value change here
      console.log(value);
      this.isActive = value;
      this.setChartData();
    },
  },
  mounted() {
    this.setChartData();
    console.log(this.data);
  },
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  /* 5px rounded corners */
  width: 100%;
  height: 100%;
  /*padding: 30px;*/
}
</style>
