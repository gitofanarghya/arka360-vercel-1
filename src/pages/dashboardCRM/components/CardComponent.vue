<template>
  <div class="card">
    <div class="card-header">
      <div class="title">
        {{ title }}

        <!-- <span class="icon-box" :style="iconStyle">
          <i :class="iconClass"></i>
        </span> -->

        <img :src="iconUrl" alt="" :style="{ width: '2rem' }" />
      </div>
    </div>
    <div class="card-content">
      <div class="values">
        <div class="value">
          <div
            style="
              font-family: 'Switzer';
              font-style: normal;
              font-weight: 600;
              font-size: 24px;
              line-height: 24px;
            "
          >
            <h3 v-if="unit === 'dollar'">{{ formatNumber }}</h3>
            <h3 v-else-if="unit === 'integer'">{{ value1 }}</h3>
            <!-- <h3 v-else-if="unit === 'integer'">{{ value1 }}</h3> -->
          </div>
          <i :class="trendIconClass" :style="greenRedText"></i>
          <div :style="greenRedText">
            <h5 style="font-weight: 400; font-size: 14px; line-height: 18px">
              {{ Math.abs(percentageChange) }}% this week
            </h5>
          </div>
        </div>
        <!-- <div class="value">{{ value2 }}</div> -->
      </div>
      <div class="progress-bar">
        <el-progress
          :percentage="percentage > 0 ? percentage : percentage * -1"
          :color="percentageColor"
        ></el-progress>
        <!-- <el-progress :percentage="percentage > 0 ? percentage : percentage * -1" :color="themeColor"></el-progress> -->
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrencySymbol, getLocaleAbbreviations, getFormattedComas } from "../../../utils/numberFormat/currencyFormatter"
export default {
  name: "CardComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    value1: {
      type: Number,
      required: true,
    },
    value2: {
      type: Number,
      required: true,
    },
    themeColor: {
      type: String,
      required: true,
    },
    secondaryColor: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    percentageChange: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: false,
    },
    iconUrl: {
      type: String,
    },
  },
  computed: {
    iconClass() {
      return `el-icon-${this.icon}`;
    },

    trendIconClass() {
      if (this.percentageChange >= 0) {
        return "el-icon-top-right";
      } else {
        return "el-icon-bottom-left";
      }
    },

    iconStyle() {
      return `background-color: ${this.$props.themeColor}; color: ${this.$props.secondaryColor};`;
    },
    formatNumber() {
      let currencyCode = JSON.parse(localStorage.getItem("organisation")).currency_code 
      //currencyCode = "INR"
      return `${getCurrencySymbol(currencyCode)}${getLocaleAbbreviations(currencyCode, this.$props.value1, false, true)}`;
    },
    greenRedText() {
      let style = "margin-left:5px;";
      if (this.percentageChange >= 0)
        style += `color:#2CC21C;font-weight: 400;font-size: 14px;line-height: 18px;`;
      else
        style += `color:#FF0000;font-weight: 400;font-size: 14px;line-height: 18px;`;
      return style;
    },
  },
  methods: {
    percentageColor(percentage) {
      if (this.title === "Uncontacted leads" && percentage >= 0) {
        return "#409EFF";
      }
      if (this.title === "Contacted Leads" && percentage >= 0) {
        return "#F88227";
      }
      if (this.title === "Open Deals" && percentage >= 0) {
        return "#2CC21C";
      }
      if (this.title === "Closed Sales" && percentage >= 0) {
        return "#7C1EA4";
      }
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  padding: 16px;
  background-color: #fff;
  transition: box-shadow 0.3s ease-in-out;
  width: 100%;
  height: 100%;
}

/* .card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
} */

.icon-box {
  color: var(--theme-color);
  background-color: var(--secondary-color);
  padding: 5px;
}

.icon-container {
  position: absolute;
  top: 16px;
  right: 16px;
}

.title {
  color: grey;
  display: flex;
  justify-content: space-between;
  height: 40px;
  /* font-style: normal; */
  /* font-weight: 400;
  font-size: 18px; */
  margin-bottom: 0.5rem;
  padding: 0;
}

.content_section .title {
  font-weight: 400;
  font-size: 18px;
  color: #777777;
  flex-flow: 1;
  padding-right: 0px;
  line-height: 24px;
}

.card-content {
  /* margin-bottom: 8px; */
}

.values {
  display: flex;
  margin-bottom: 8px;
}
.el-progress {
    position: relative;
    line-height: 1;
    display: flex;
    justify-content: space-between;
}
.value {
  display: flex;
  font-size: 24px;
  font-weight: 600;
  align-items: center;
  height: 40px;
}
h3 {
  font-weight: 600;
}
@media only screen and (max-width: 1500px) {
  .value {
    display: flex;
    font-size: 0.8rem;
    align-items: center;
  }
}
@media only screen and (max-width: 1200px ) and (min-width: 768px){
  .card{
    margin-bottom: 1rem;
  }
}

.progress-bar {
  margin-bottom: 6px;
  white-space: nowrap;
  /* Prevent text from wrapping */
}
</style>
