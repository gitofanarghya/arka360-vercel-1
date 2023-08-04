<template>
  <el-row>
    <el-col id="filterButton">
      <el-button-group>
        <el-button @click="getUserIformation" style="margin-right: 20px">
          Assigned To Me
        </el-button>

        <el-button value="today" @click="updatePeriod('today')"
          >Today</el-button
        >
        <el-button value="week" @click="updatePeriod('week')"
          >This Week</el-button
        >
        <el-button value="month" @click="updatePeriod('month')"
          >This Month</el-button
        >
        <el-button value="quarter" @click="updatePeriod('quarter')"
          >Quarter</el-button
        >
        <el-button
          value="custom"
          @click="
            showDatePicker = true;
            hideDatePickerOnButtonClick = true;
          "
          >Custom</el-button
        >
      </el-button-group>
    </el-col>
    <el-col :span="12" v-if="showDatePicker" style="margin-top: 10px">
      <el-date-picker
        v-model="customDate"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        @change="updateCustomPeriod"
        @hide="hideDatePicker"
      />
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      isActive: false,
      FilterData: null,
      currentUserStatus: false,
      showDatePicker: false,
      customDate: null,
      hideDatePickerOnButtonClick: false,
      activeName: "quarter",
    };
  },
  methods: {
    getUserIformation() {
      this.$emit("current-user", !this.currentUserStatus);
    },
    updatePeriod(period) {
      if (this.hideDatePickerOnButtonClick) {
        this.hideDatePicker();
      }
      if (period === "custom") {
        this.FilterData = "custom";
      } else {
        this.FilterData = period;
      }
      this.$emit("filter-value", this.FilterData);
    },

    updateCustomPeriod() {
      const startDate = this.customDate[0].toISOString();
      const endDate = this.customDate[1].toISOString();
      this.$emit("filter-value", "custom");
      this.$emit("filter-start-date", startDate);
      this.$emit("filter-end-date", endDate);
    },
    hideDatePicker() {
      this.showDatePicker = false;
      this.customDate = null;
      if (this.hideDatePickerOnButtonClick) {
        this.hideDatePickerOnButtonClick = false;
      }
    },
  },
};
</script>

<style scoped>
#filterButton {
  /* width: 60%; */
  display: flex;
  justify-content: space-between;
  /* margin-top: 10px; */
}
</style>
