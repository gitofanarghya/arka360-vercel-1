<template>
  <div>
    <CardElement :headingText="headingText">
      <template v-slot:header>
        <ToggleSwitch
          @change="handleToggleChange"
          v-if="$props.reverseAxis && $props.switchBtn"
        />
        <DropdownElement
          v-else-if="$props.reverseAxis && !$props.switchBtn"
          @selectionMade="changeChart"
          :dataOptions="computedDropdown"
        />
        <el-dropdown @command="changeChart" v-else>
          <span class="el-dropdown-link">
            {{ selectedFilter
            }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="Weekly">Weekly</el-dropdown-item>
            <el-dropdown-item command="Monthly">Monthly</el-dropdown-item>
            <el-dropdown-item command="Quarterly">Quarterly</el-dropdown-item>
            <div class="hr"><hr /></div>

            <el-dropdown-item command="This Week">This Week</el-dropdown-item>
            <el-dropdown-item command="This Month">This Month</el-dropdown-item>
            <el-dropdown-item command="This Quarter"
              >This Quarter</el-dropdown-item
            >
            <el-dropdown-item command="This Year">This Year</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
import ToggleSwitch from "./dealsAmountByStageGraph/ToggleSwitch.vue";
import { getCurrencySymbol, getLocaleAbbreviations, getFormattedComas, getFormattedCurrencyComas } from "../../../utils/numberFormat/currencyFormatter"
import { DateTime } from "luxon";
import { array } from "jszip/lib/support";

export default {
  name: "BarGraph",
  components: {
    Chart,
    DropdownElement,
    CardElement,
    ToggleSwitch,
  },
  props: {
    apiData: {
      required: true,
    },
    barName: {
      required: true,
      type: String,
      default: "",
    },
    titleY: {
      type: String,
      default: "",
    },
    titleX: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#4083ff",
    },
    reverseAxis: {
      type: Boolean,
      default: false,
    },
    switchBtn: {
      type: Boolean,
      default: false,
    },
    minAxis: {
      type: Number,
      default: 20,
    },
    minTicks: {
      type: Number,
      default: 5,
    },
    ticks: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      userFlag: JSON.parse(localStorage.getItem('organisation')).currency_code,
      isINDflag: false,
      selectedFilter: "Weekly",
      headingText: "",
      isToggled: false,
      backgroundColor: [
        "rgba(64, 158, 255, 1)",
        "rgba(248, 130, 39, 1)",
        "rgba(44, 194, 28, 1)",
        "rgba(193, 58, 94, 1)",
        "rgba(124, 30, 164, 1)",
      ],
      dropdownOptions: [],
      bar: "bar",
      isBar1: true,
      isBar2: false,
      chartData: null,
      options: {
        indexAxis: "x",
        animation: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {},
          },
        },
        scales: {
          x: {
            ticks: {
              beginAtZero: false,
              minRotation: 0,
              maxRotation: 0,
            },
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: "Weekly",
              color: "#222222",
            },
          },
          y: {
            max: 20,
            ticks: {
              beginAtZero: false,
              stepSize: 5,
            },
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: this.$props.titleY,
              color: "#222222",
              padding: { top: 0, left: 0, right: 0, bottom: 10 },
            },
          },
        },
      },
    };
  },
  methods: {
    generateMinBarLength(arr){
      let max = Math.max(...arr)
      let min = Math.min.apply(null, arr.filter(Boolean))
      if(max * 0.01 >= min) return 10
      return 0
    },
    generateMaxAmount(amt) {
      let arr = Math.ceil(amt).toString().split("");
      let filteredArr = arr.map((e, index) => {
        if (index > 1 && arr.length > 2) {
          return 0;
        } else {
          return e;
        }
      });
      return +filteredArr.join("");
    },
    setChartAxis(axis){
        this.options.scales[axis].max = Math.floor(this.$props.minAxis);
        this.options.scales[axis].ticks.stepSize = Math.floor(this.$props.minAxis/this.$props.minTicks)
    },
    changeChart(data) {
      this.selectedFilter = data;
      this.options.scales.x = {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: this.$props.reverseAxis ? "No. of Leads" : data,
          color: "black",
          padding: { top: 15, left: 0, right: 0, bottom: 0 },
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
      };
      this.selectedFilter = data;

      this.setChartData();
    },
    setChartData() {
      let graphData = this.$props.apiData;
      let maxAmt = 0;
      const currentMonth = new Date().getMonth();
      const dateTime = new Date();
      const currentQuarter = Math.ceil(dateTime.getMonth() / 3);
      let filteredData;
      let tempArr = [];
      switch (this.selectedFilter) {
        case "toggle":
          tempArr = [];
          filteredData = this.filterOrder(graphData, 'Deals');
          if (this.isToggled == false) {
            this.chartData = {
              labels: filteredData.map((e) => {
                return e.stage;
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Year`,
                  data: filteredData.map((e) => {
                    tempArr.push(e.amount);
                    return e.amount;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#F88227",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('x')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return getFormattedCurrencyComas(this.userFlag, context.raw)
              };
            }
          } else {
            this.chartData = {
              labels: filteredData.map((e) => {
                return e.stage;
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Year`,
                  data: filteredData.map((e) => {
                    tempArr.push(e.count);
                    return e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#4083ff",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('x')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return [
                  `${getFormattedComas(this.userFlag, context.raw)}`,
                ];
              };
            }
          }
          break;
        case "Yearly":
          if (this.$props.barName === "Leads By Source") {
            let filteredArr = this.filterOrder(graphData.this_year, 'Leads')
            tempArr = [];
            this.chartData = {
              labels: filteredArr.map((e) => {
                return (
                  e.lead_source.charAt(0).toUpperCase() + e.lead_source.slice(1)
                );
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Year`,
                  data: filteredArr.map((e) => {
                    tempArr.push(e.count);
                    return e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#4083ff",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('x')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return [`${getFormattedComas(this.userFlag, context.raw)}`];
              };
            }
          } else {
          }
          break;

        case "This Year":
          filteredData = graphData.year_to_date;
          while (filteredData.length < 12) {
            let upcomingMonth = DateTime.fromISO(
              filteredData[filteredData.length - 1].date_obj
            ).plus({ months: 1 });
            filteredData.push({
              date_obj: upcomingMonth,
              revenue: 0,
              count: 0,
            });
          }
          tempArr = [];
          this.chartData = {
            labels: graphData.year_to_date.map((e) => {
              let monthName = DateTime.fromISO(e.date_obj).toLocaleString({
                month: "short",
              });
              return monthName;
            }),
            datasets: [
                {
                  maxBarThickness: 30,
                label: `Year`,
                data: graphData.year_to_date.map((e) => {
                  if (this.barName === "Revenue") {
                    tempArr.push(e.revenue);
                  } else {
                    tempArr.push(e.count);
                  }
                  return this.barName === "Revenue" ? e.revenue : e.count;
                }),
                borderColor: "#36A2EB",
                backgroundColor: this.color,
                borderRadius: 3,
              },
            ],
          };
          if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.y.max = maxAmt;
              this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
                Math.floor(maxAmt / this.$props.ticks)
              );
    
              this.options.plugins.tooltip.callbacks.title = (context) => {
                let startString =
                  graphData.year_to_date[context[0].dataIndex].date_obj;
                let startDate = DateTime.fromISO(startString);
                return `${context[0].label.replace(",", " ")} ${startDate.year} `;
              };
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return `${
                  this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
              };
            }
            this.options.scales.y.maxBarThickness= 8;
          break;

        case "Monthly":
          tempArr = [];
          if (this.$props.barName === "Leads By Source") {
            let filteredArr = this.filterOrder(graphData.this_month, 'Leads')
            this.chartData = {
              labels: filteredArr.map((e) => {
                return (
                  e.lead_source.charAt(0).toUpperCase() + e.lead_source.slice(1)
                );
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Month`,
                  data: filteredArr.map((e) => {
                    tempArr.push(e.count);
                    return e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#4083ff",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return [`${getFormattedComas(this.userFlag, context.raw)}`];
              };
            }
          } else {
            this.chartData = {
              labels: graphData.monthly.map((e) => {
                let monthName = DateTime.fromISO(e.date_obj).toLocaleString({
                  month: "short",
                });
                let year = DateTime.fromISO(e.date_obj)
                  .toLocaleString("yyyy")
                  .split("/")[2];
                return [monthName, year];
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Monthly`,
                  data: graphData.monthly.map((e) => {
                    if (this.barName === "Revenue") {
                      tempArr.push(e.revenue);
                    } else {
                      tempArr.push(e.count);
                    }
                    return this.barName === "Revenue" ? e.revenue : e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: this.color,
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + (Math.max(...tempArr) * 0.125)
              );
              this.options.scales.y.max = maxAmt
              this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
                Math.ceil(maxAmt / this.$props.ticks)
              );
              this.options.plugins.tooltip.callbacks.title = (context) => {
                return context[0].label.replace(",", " ");
              };
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return `${
                this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
              };
            }
          }

          break;

        case "This Month":
          filteredData = graphData.month_to_date;

          if (filteredData.length < 31) {
            while (filteredData.length < 31) {
              let upcomingDay = DateTime.fromISO(
                filteredData[filteredData.length - 1].date_obj
              ).plus({ days: 1 });
              let month = upcomingDay.month;
              if (currentMonth + 1 !== month) break;
              filteredData.push({
                date_obj: upcomingDay,
                revenue: 0,
                count: 0,
              });
            }
          }
          tempArr = [];
          this.chartData = {
            labels: graphData.month_to_date.map((e) => {
              let day = DateTime.fromISO(e.date_obj).toLocaleString({
                day: "numeric",
              });
              return day;
            }),
            datasets: [
                {
                  maxBarThickness: 30,
                label: `Month`,
                data: graphData.month_to_date.map((e) => {
                  if (this.barName === "Revenue") {
                    tempArr.push(e.revenue);
                  } else {
                    tempArr.push(e.count);
                  }
                  return this.barName === "Revenue" ? e.revenue : e.count;
                }),
                borderColor: "#36A2EB",
                backgroundColor: this.color,
                borderRadius: 1,
              },
            ],
          };
          if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.y.max = maxAmt;
              this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
    
              this.options.plugins.tooltip.callbacks.title = (context) => {
                let startString =
                  graphData.month_to_date[context[0].dataIndex].date_obj;
                let startDate = DateTime.fromISO(startString);
                return `${context[0].label.replace(",", " ")} ${
                  startDate.monthShort
                } ( ${startDate.weekdayShort} )`;
              };
    
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return `${
                  this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
              };
            }
          break;

        case "Weekly":
          tempArr = [];
          if (this.$props.barName === "Leads By Source") {
            let filteredArr = this.filterOrder(graphData.this_week, 'Leads')
            this.chartData = {
              labels: filteredArr.map((e) => {
                return (
                  e.lead_source.charAt(0).toUpperCase() + e.lead_source.slice(1)
                );
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Week`,
                  data: filteredArr.map((e) => {
                    tempArr.push(e.count);
                    return e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#4083ff",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('x')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return [`${getFormattedComas(this.userFlag, context.raw)}`];
              };
            }
          } else {
            this.chartData = {
              labels: graphData.weekly.map((e) => {
                let dayName = DateTime.fromISO(e.date_obj).weekNumber;
                return ["Week", dayName];
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Week`,
                  data: graphData.weekly.map((e) => {
                    if (this.barName === "Revenue") {
                      tempArr.push(e.revenue);
                    } else {
                      tempArr.push(e.count);
                    }
                    return this.barName === "Revenue" ? e.revenue : e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: this.color,
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.y.max = maxAmt;
              this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return `${
                this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
              };
              this.options.plugins.tooltip.callbacks.title = (context) => {
                let startString = graphData.weekly[context[0].dataIndex].date_obj;
                let startDate = DateTime.fromISO(startString);
                let endDate = DateTime.fromISO(startString).plus({ days: 6 });
                let title = `${context[0].label.replace(",", " ")} ( ${
                  startDate.day
                } ${startDate.monthShort} - ${endDate.day} ${
                  endDate.monthShort
                } )`;
                return title;
              };
            }
          }

          break;

        case "This Week":
          filteredData = graphData.week_to_date;
          while (filteredData.length < 7) {
            let upcomingDay = DateTime.fromISO(
              filteredData[filteredData.length - 1].date_obj
            ).plus({ days: 1 });
            filteredData.push({ date_obj: upcomingDay, revenue: 0, count: 0 });
          }
          tempArr = [];
          this.chartData = {
            labels: graphData.week_to_date.map((e) => {
              let dayName = DateTime.fromISO(e.date_obj).toLocaleString({
                weekday: "short",
              });
              return dayName;
            }),
            datasets: [
                {
                  maxBarThickness: 30,
                label: `Week`,
                data: graphData.week_to_date.map((e) => {
                  if (this.barName === "Revenue") {
                    tempArr.push(e.revenue);
                  } else {
                    tempArr.push(e.count);
                  }
                  return this.barName === "Revenue" ? e.revenue : e.count;
                }),
                borderColor: "#36A2EB",
                backgroundColor: this.color,
                borderRadius: 3,
              },
            ],
          };
          if(Math.max(...tempArr) === 0){
            this.setChartAxis('y')
          }else{
            maxAmt = this.generateMaxAmount(
              Math.max(...tempArr) + Math.max(...tempArr) * 0.125
            );
            this.options.scales.y.max = maxAmt;
            this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
              maxAmt / this.$props.ticks
            );
            this.options.plugins.tooltip.callbacks.title = (context) => {
              let startString =
                graphData.week_to_date[context[0].dataIndex].date_obj;
              let startDate = DateTime.fromISO(startString);
              return `${context[0].label.replace(",", " ")} ( ${startDate.day} ${
                startDate.monthShort
              } )`;
            };
            this.options.plugins.tooltip.callbacks.label = (context) => {
              return `${
                this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
            };
          }
          this.options.scales.y.maxBarThickness= 8;
          break;

        case "Quarterly":
          tempArr = [];
          if (this.$props.barName === "Leads By Source") {
            let filteredArr = this.filterOrder(graphData.this_quarter, 'Leads')
            this.chartData = {
              labels: filteredArr.map((e) => {
                return (
                  e.lead_source.charAt(0).toUpperCase() + e.lead_source.slice(1)
                );
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Quarter`,
                  data: filteredArr.map((e) => {
                    tempArr.push(e.count);
                    return e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: "#4083ff",
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('x')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.x.max = maxAmt;
              this.options.scales.x.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return [`${getFormattedComas(this.userFlag, context.raw)}`];
              };
            }
          } else {
            this.chartData = {
              labels: graphData.quaterly.map((e) => {
                let monthName = DateTime.fromISO(e.date_obj).month;
                let year = DateTime.fromISO(e.date_obj).year;
                return ["Q" + Math.ceil(monthName / 3), year];
              }),
              datasets: [
                {
                  maxBarThickness: 30,
                  label: `Monthly`,
                  data: graphData.quaterly.map((e) => {
                    if (this.barName === "Revenue") {
                      tempArr.push(e.revenue);
                    } else {
                      tempArr.push(e.count);
                    }
                    return this.barName === "Revenue" ? e.revenue : e.count;
                  }),
                  borderColor: "#36A2EB",
                  backgroundColor: this.color,
                  borderRadius: 3,
                },
              ],
            };
            if(Math.max(...tempArr) === 0){
              this.setChartAxis('y')
            }else{
              maxAmt = this.generateMaxAmount(
                Math.max(...tempArr) + Math.max(...tempArr) * 0.125
              );
              this.options.scales.y.max = maxAmt;
              this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
                maxAmt / this.$props.ticks
              );
              this.options.plugins.tooltip.callbacks.title = (context) => {
                return context[0].label.replace(",", " ");
              };
              this.options.plugins.tooltip.callbacks.label = (context) => {
                return `${
                this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
              };
            }
          }

          break;

        case "This Quarter":
          filteredData = graphData.quater_to_date;

          // generating the remaining weeks of the month
          if (filteredData.length < 14) {
            while (filteredData.length < 14) {
              let upcomingWeek = DateTime.fromISO(
                filteredData[filteredData.length - 1].date_obj
              ).plus({ days: 7 });
              let quarter = Math.ceil(upcomingWeek.month / 3);
              if (quarter !== currentQuarter) break;
              filteredData.push({
                date_obj: upcomingWeek,
                revenue: 0,
                count: 0,
              });
            }
          }
          tempArr = [];
          this.chartData = {
            labels: filteredData.map((e, index) => {
              return ["Week", index + 1];
            }),
            datasets: [
                {
                  maxBarThickness: 30,
                label: `Quarter`,
                data: filteredData.map((e) => {
                  if (this.barName === "Revenue") {
                    tempArr.push(e.revenue);
                  } else {
                    tempArr.push(e.count);
                  }
                  return this.barName === "Revenue" ? e.revenue : e.count;
                }),
                borderColor: "#36A2EB",
                backgroundColor: this.color,
                borderRadius: 3,
              },
            ],
          };
          if(Math.max(...tempArr) === 0){
            this.setChartAxis('y')
          }else{
            maxAmt = this.generateMaxAmount(
              Math.max(...tempArr) + Math.max(...tempArr) * 0.125
            );
            this.options.scales.y.max = maxAmt;
            this.options.scales.y.ticks.stepSize = this.generateMaxAmount(
              maxAmt / this.$props.ticks
            );
  
            this.options.plugins.tooltip.callbacks.title = (context) => {
              let startString =
                graphData.quater_to_date[context[0].dataIndex].date_obj;
              let startDate = DateTime.fromISO(startString);
              let endDate = DateTime.fromISO(startString).plus({ days: 6 });
              return `${context[0].label.replace(",", " ")} ( ${startDate.day} ${
                startDate.monthShort
              } - ${endDate.day} ${endDate.monthShort} )`;
            };
            this.options.plugins.tooltip.callbacks.label = (context) => {
              return `${
                this.barName === "Revenue" ? getFormattedCurrencyComas(this.userFlag, context.raw) : getFormattedComas(this.userFlag, context.raw)}`;
            };
          }
          break;

        default:
          break;
      }
    },
    handleToggleChange(data) {
      this.isToggled = data;
      data
        ? (this.headingText = "No. of Deals By Stage")
        : (this.headingText = "Deals Amount By Stage");
      this.selectedFilter = "toggle";
      if (this.isToggled === false) {
        this.options.scales.x = {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: JSON.parse(localStorage.getItem("organisation")).currency_code,
            color: "black",
            padding: {
              top: 15, bottom: 0, left: 0, right: 0
            }
          },
          ticks: {
            callback: function (value, index, values) {
              return getLocaleAbbreviations(JSON.parse(localStorage.getItem('organisation')).currency_code, value, true);
            },
          },
        };
      } else {
        this.options.scales.x = {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "No. of Deals",
            color: "black",
            padding: {
              top: 15, bottom: 0, left: 0, right: 0
            }
          },
          ticks: {}
        };
        this.options.plugins.tooltip.callbacks.label = (context) => {
              return [
                `${getFormattedComas(this.userFlag, context.raw)}`,
              ];
            };
      }
      // Handle the toggle value change here
      this.setChartData();
    },
    filterOrder(arr, type) {
      let filteredArr= []
      switch(type){
        case 'Deals':
            filteredArr = [
            { amount: 0, count: 0, stage: "Lead" },
            { amount: 0, count: 0, stage: "Appointment" },
            { amount: 0, count: 0, stage: "Proposal" },
            { amount: 0, count: 0, stage: "Negotiation" },
            { amount: 0, count: 0, stage: "Closed / Won" },
            { amount: 0, count: 0, stage: "Closed / Lost" },
          ];
          arr.forEach((e) => {
            let matchIndex = filteredArr.findIndex(
              (item) => item.stage === e.stage
            );
            filteredArr[matchIndex] = e;
            if (
              filteredArr[matchIndex].stage.includes("/ ") &&
              filteredArr[matchIndex].stage.length > 13
            ) {
              filteredArr[matchIndex] = { ...e, stage: e.stage.split("/ ") };
              filteredArr[matchIndex].stage[0] =
                filteredArr[matchIndex].stage[0] + "/";
            }
          });
          let newData = filteredArr.map((e) => {
            if (e.stage.includes("/ ") && e.stage.length > 13) {
              e = { ...e, stage: e.stage.split("/ ") };
              e.stage[0] = e.stage[0] + "/";
            }
            return e;
          });

          return newData;

        case 'Leads':
        filteredArr = [
            { count: 0, lead_source: "marketing" },
            { count: 0, lead_source: "outbound" },
            { count: 0, lead_source: "referral" },
            { count: 0, lead_source: "website" },
          ];
          arr.forEach((e) => {
            let matchIndex = filteredArr.findIndex(
              (item) => item.lead_source === e.lead_source
            );
            filteredArr[matchIndex] = e;
          });
          return filteredArr;

         default:
            return null
      }
      
    },
  },
  computed: {
    computedDropdown() {
      return [
        { value: "Weekly", label: "This Week" },
        { value: "Monthly", label: "This Month" },
        { value: "Quarterly", label: "This Quarter" },
        { value: "Yearly", label: "This Year" },
      ];
    },
  },
  created() {
    this.isINDflag = !JSON.parse(localStorage.getItem("user")).isUSFlagEnabled;
  },
  mounted() {
    if (this.$props.barName === "Revenue") {
      this.options.scales.y.ticks = {
        callback: function (value, index, values) {
          return getLocaleAbbreviations(JSON.parse(localStorage.getItem('organisation')).currency_code, value, true);
        },
      };
    }
    if (this.$props.reverseAxis && !this.$props.switchBtn) {
      this.selectedFilter = this.computedDropdown[0].value;
      this.changeChart(this.computedDropdown[0].value);
    } else if (this.$props.switchBtn && this.$props.reverseAxis) {
      this.selectedFilter = "toggle";
      this.options.scales.x.title.text = this.userFlag;
      this.handleToggleChange(false);
    } else {
      this.changeChart("Weekly");
    }
    if (this.$props.barName === "Leads By Source") {
      this.options.scales.y.title.text = "Sources";
      this.options.scales.x.title.text = "No. of Leads";
    }
    if (this.$props.reverseAxis) this.options.indexAxis = "y";
    this.headingText = this.$props.barName;
  },
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  width: 100%;
  height: 100%;
}
.el-dropdown-link {
  padding: 5px;
  padding-left: 0.5rem;
  border-radius: 5px;
  border: 1px solid #cccccc;
  cursor: pointer;
  color: #222222;
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
}

.el-icon-arrow-down {
  font-size: 12px;
  margin-left: 20px;
}
</style>
