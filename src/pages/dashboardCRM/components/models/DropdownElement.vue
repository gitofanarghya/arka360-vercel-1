<template>
  <div>
    <!-- <label for="dynamicDropdown">Select an option:</label> -->
    <el-dropdown @command="changeChart">
      <span class="el-dropdown-link">
        {{ selectedFilter }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="Weekly">This Week</el-dropdown-item>
        <el-dropdown-item command="Monthly">This Month</el-dropdown-item>
        <el-dropdown-item command="Quarterly">This Quarter</el-dropdown-item>
        <el-dropdown-item command="Yearly">This Year</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- <select
      id="dynamicDropdown"
      v-model="selectedOption"
      @change="$emit('selectionMade', selectedOption)"
    >
      <option
        v-for="option in dataOptions"
        :value="option.value"
        :key="option.value"
      >
        {{ option.label }}
      </option>
    </select> -->
    <!-- <p>You selected: {{ selectedOption }}</p> -->
  </div>
</template>

<script>
export default {
  name: "DropdownElement",
  emits: ["selectionMade"],
  props: {
    dataOptions: {
      type: Array,
    },
  },
  data() {
    return {
      selectedOption: "",
      selectedFilter: "This Week",
    };
  },
  methods: {
    changeChart(data) {
      switch (data) {
        case "Weekly":
          this.selectedFilter = "This Week";
          break;
        case "Monthly":
          this.selectedFilter = "This Month";
          break;
        case "Quarterly":
          this.selectedFilter = "This Quarter";
          break;
        case "Yearly":
          this.selectedFilter = "This Year";
          break;
      }
      this.$emit("selectionMade", data);
    },
  },
  mounted() {
    //set a default selection
    // if (!this.selectedOption) {
    //this.selectedOption = this.$props.dataOptions[0].value;
    // console.log(this.options);
    // }
    if (this.dataOptions.length > 0)
      this.selectedOption = this.$props.dataOptions[0].value;
  },
};
</script>

<style scoped>
select {
  padding: 6px 12px;
  gap: 10px;
  background-color: white;
  width: 8.25rem;
  height: 33px;

  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #222222;
}
.el-dropdown-link {
  padding: 5px;
  padding-left: 0.5rem;
  border-radius: 5px;
  border: 0.5px solid rgb(205, 205, 205);
  font-weight: 400;
  cursor: pointer;
  font-size: 1rem;
  color: #222222;
  line-height: 1.31rem;
}

.el-icon-arrow-down {
  font-size: 12px;
  margin-left: 20px;
}

.el-dropdown {
  width: max-content;
}
</style>
