<template>
  <div class="heading-container">
    <el-row>
      <el-col :xs="24" :sm="24" :md="16" :lg="16" class="left-section">
        <MenuView :menuItems="menuData" />

        <div @click="handleRefresh" style="display: flex">
          <el-tooltip
            class="item"
            effect="light"
            content="Refresh"
            placement="top-start"
          >
            <img
              src="../../../assets/img/refreshIcon.svg"
              alt=""
              style="width: 1.5rem"
            />
          </el-tooltip>
        </div>

        <!-- <el-select v-model="columnTypeValue" placeholder="Select">
          <el-option
            v-for="item in columnsTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select> -->
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" class="right-section">
        <SearchBar @search="handleSearch" :debounceTime="400"></SearchBar>
        <ToggleBar :toggleViewType="toggleViewType" />
        <!-- <ButtonSection /> -->
      </el-col>
    </el-row>
    <!-- <el-row style="margin-top: 10px"> -->
    <div style="margin: 1rem 0">
      <div
        v-if="selectedFilter.length > 0 || selectedSort"
        style="display: flex"
      >
        <div style="display: flex; align-items: center">
          <img v-if="selectedSort" src="../assets/sort.svg" alt="" />
          <div>
            <el-tag
              v-if="selectedSort"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handlesortClose()"
              style="margin-right: 15px"
            >
              {{ handleDisplaySort() }} : {{ handlesort() }}
            </el-tag>
          </div>
        </div>
        <div style="display: flex; align-items: center">
          <img
            v-if="selectedFilter.length > 0"
            src="../assets/filter_alt.svg"
            alt=""
          />
          <!-- <p v-if="selectedFilter.length > 0" style="margin-right: 10px">
        Active Filters
      </p> -->
          <div>
            <el-tag
              v-for="item in selectedFilter"
              :key="item"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleClose(item)"
            >
              {{ item[1] }} : {{ handleDisplayFilters(item) }}
            </el-tag>
          </div>
          <!-- </div> -->
          <div v-if="selectedFilter.length > 0 || selectedSort">
            <button
              style="
                color: #409eff;
                margin-left: 10px;
                border: none;
                cursor: pointer;
                background: transparent;
              "
              @click="handleClear"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- </el-row> -->
    <div v-for="item in selectedFilter" :key="item" style="margin-top: 10px">
      <div
        style="display: flex; align-items: center"
        v-if="item[1] == 'Created at' && item[2] == 'Custom' && show == true"
      >
        <p style="margin-right: 10px">Created at:</p>
        <el-date-picker v-model="value1" type="date" placeholder="Select a day">
        </el-date-picker>
        <el-date-picker v-model="value2" type="date" placeholder="Select a day">
        </el-date-picker>
        <button class="filter-button" @click="updateDate">Apply</button>
      </div>
      <div
        style="display: flex; align-items: center"
        v-if="item[1] == 'Due Date' && item[2] == 'Custom' && dueshow == true"
      >
        <p style="margin-right: 17px">Due Date:</p>
        <el-date-picker v-model="value3" type="date" placeholder="Select a day">
        </el-date-picker>
        <el-date-picker v-model="value4" type="date" placeholder="Select a day">
        </el-date-picker>
        <button class="filter-button" @click="updateDueDate">Apply</button>
      </div>
    </div>
    <!-- <div class="title">
      <div class="title projectTitle" style="margin-left: -1.5%">
        {{ title }}
      </div>
      <el-col :span="6">
        <MenuView />
      </el-col>
    </div>
    <div class="search-container">
      <div class="search-bar">
        <img src="../assets/search.svg" class="searchIcon" />
        <input
          type="text"
          placeholder="Search.."
          v-model="searchTerm"
          @input="onInput"
        />
        <button @click="onSearch">Search</button>
      </div>
      <div class="heading-content2">
        <div class="view_type">
          <a
            v-if="togglebtn1"
            @click="toggleViewType"
            class="tab_list"
            :class="{ active }"
          >
            <span class="icon list-icon"></span>
          </a>
          <a
            v-if="togglebtn2"
            @click="toggleViewType"
            class="tab_list"
            :class="{ active: !active }"
          >
            <span class="icon location"></span>
          </a>
        </div>
      </div>
      <div class="view_type">
        <a class="tab_list" @click="create" :class="{ active: true }">
          <span class="list_text">Create {{ title }}</span>
        </a>
      </div>
    </div> -->
  </div>
</template>

<script>
import FilterData from "./FilterData.vue";
import MenuView from "./header/menuView.vue";
import SearchBar from "./header/searchBar.vue";
import ToggleBar from "./header/toogleBar.vue";
import ButtonSection from "./header/buttonSection.vue";
import API from "@/services/api/";
import { SL360_URL } from "../../../constants";

export default {
  name: "pageHeading",
  computed: {
    menuData() {
      console.log(this.users);
      const menuItems = [
        {
          title: "Sort",
          icon: "sort",
          callback: (key, keypoints) => {
            console.log("sort", key, keypoints);
            console.log(keypoints);
            this.selectedSort = keypoints;
            this.$emit("sortView", this.selectedSort);
          },
          options: [
            {
              value: "Created Date",
              label: "created_at",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
            {
              value: "Due Date",
              label: "due_date",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
            {
              value: "Order Type",
              label: "service_type",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
          ],
        },
        {
          title: "Filter",
          icon: "filter",
          callback: (key, keypoints) => {
            console.log("filter", key, keypoints);
            const isExist = this.selectedFilter.find(
              (e) => e[1] === keypoints[1]
            );
            if (isExist) {
              if (keypoints[1] === "Created at" && keypoints[2] === "Custom")
                this.show = !this.show;
              if (keypoints[1] === "Due Date" && keypoints[2] === "Custom")
                this.dueshow = !this.dueshow;
              this.selectedFilter = this.selectedFilter.filter((e) => {
                if (e[1] !== keypoints[1]) return e;
              });
              this.selectedFilter.push(keypoints);
            } else {
              this.selectedFilter.push(keypoints);
            }
            console.log(this.selectedFilter);
            this.$emit("filterView", this.selectedFilter);
          },
          options: [
            {
              value: "Created Date",
              label: "Created at",
              subOptions: [
                {
                  value: "Today",
                  label: "Today",
                },
                {
                  value: "This Week",
                  label: "Week",
                },
                {
                  value: "This Month",
                  label: "Month",
                },
                {
                  value: "Custom",
                  label: "Custom",
                },
              ],
            },
            {
              value: "Due Date",
              label: "Due Date",
              subOptions: [
                {
                  value: "Today",
                  label: "Today",
                },
                {
                  value: "This Week",
                  label: "Week",
                },
                {
                  value: "This Month",
                  label: "Month",
                },
                {
                  value: "Custom",
                  label: "Custom",
                },
              ],
            },
            {
              value: "Order Type",
              label: "Service Type",
              subOptions: [
                {
                  value: "Base",
                  label: "Base",
                },
                {
                  value: "Expedited",
                  label: "Expedited",
                },
                {
                  value: "Super Expedited",
                  label: "Super Expedited",
                },
                {
                  value: "PV Design",
                  label: "PV Design",
                },
                {
                  value: "Permit Package",
                  label: "Permit Package",
                },
                {
                  value: "Solar Sales Proposal",
                  label: "Solar Sales Proposal",
                },

                {
                  value: "3D Roof Modelling",
                  label: "3D Roof Modelling",
                },
                {
                  value: "Preliminary Proposal",
                  label: "Preliminary Proposal",
                },
                {
                  value: "Full Construction Drawing",
                  label: "Full Construction Drawing",
                },
                {
                  value: "Premium Order",
                  label: "Premium Order",
                },
                {
                  value: "Standard Order",
                  label: "Standard Order",
                },
              ],
            },
            {
              value: "Owner",
              label: "Owner",
              subOptions: this.users,
            },
            // {
            //   value: "Inverter Type",
            //   label: "Inverter Type",
            //   subOptions: [
            //     {
            //       value: "Micro Inverter",
            //       label: "1",
            //     },
            //     {
            //       value: "String Inverter",
            //       label: "77",
            //     },
            //     {
            //       value: "Central Inverter",
            //       label: "88",
            //     },
            //   ],
            // },
          ],
        },
        {
          title: "Column Type",
          icon: "",
          callback: (key, keypoints) => {
            console.log("sort", key, keypoints);
            console.log(keypoints);
            this.selectedColumnType = keypoints;
            this.$emit("selected-column", this.selectedColumnType);
          },
          singleLevel: true,
          options: [
            { label: "Order Status", value: "order_status" },
            { label: "Delivery Type", value: "delivery_type" },
          ],
        },
      ];
      return menuItems;
    },
  },

  data() {
    return {
      value1: "",
      value2: "",
      value3: "",
      value4: "",
      ClearAll: [],
      date: [],
      duedate: [],
      columnsTypeOptions: [
        { label: "Order Status", value: "order_status" },

        { label: "Delivary Speed", value: "delivery_type" },
      ],
      columnTypeValue: "order_status",
      selectedSort: "",
      selectedColumnType: "",
      selectedFilter: [["1", "Created at", "Week"]],
      removed: [],
      show: true,
      dueshow: true,
      handleselectedFilter: [],
      users: [],
      menuItems: [
        {
          title: "Sort",
          icon: "sort",
          callback: (key, keypoints) => {
            console.log("sort", key, keypoints);
            console.log(keypoints);
            this.selectedSort = keypoints;
            this.$emit("sortView", this.selectedSort);
          },
          options: [
            {
              value: "Created Date",
              label: "created_at",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
            {
              value: "Due Date",
              label: "due_date",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
            {
              value: "Order Type",
              label: "service_type",
              subOptions: [
                {
                  value: "Ascending",
                  label: "1",
                },
                {
                  value: "Descending",
                  label: "2",
                },
              ],
            },
          ],
        },
        {
          title: "Filter",
          icon: "filter",
          callback: (key, keypoints) => {
            console.log("filter", key, keypoints);
            const isExist = this.selectedFilter.find(
              (e) => e[1] === keypoints[1]
            );
            if (isExist) {
              this.selectedFilter = this.selectedFilter.filter((e) => {
                if (e[1] !== keypoints[1]) return e;
              });
              this.selectedFilter.push(keypoints);
            } else {
              this.selectedFilter.push(keypoints);
            }
            console.log(keypoints);
            this.$emit("filterView", this.selectedFilter);
          },
          options: [
            {
              value: "Created Date",
              label: "Created at",
              subOptions: [
                {
                  value: "Today",
                  label: "Today",
                },
                {
                  value: "This Week",
                  label: "Week",
                },
                {
                  value: "This Month",
                  label: "Month",
                },
                {
                  value: "Custom",
                  label: "Custom",
                },
              ],
            },
            {
              value: "Due Date",
              label: "Due Date",
              subOptions: [
                {
                  value: "Today",
                  label: "Today",
                },
                {
                  value: "This Week",
                  label: "Week",
                },
                {
                  value: "This Month",
                  label: "Month",
                },
                {
                  value: "Custom",
                  label: "Custom",
                },
              ],
            },
            {
              value: "Service Type",
              label: "Service Type",
              subOptions: [
                {
                  value: "PV Design",
                  label: "PV Design",
                },
                {
                  value: "Permit Package",
                  label: "Permit Package",
                },
                {
                  value: "Sales Proposal",
                  label: "Sales Proposal",
                },
              ],
            },
            {
              value: "Owner",
              label: "Owner",
              subOptions: this.users,
            },
            // {
            //   value: "Inverter Type",
            //   label: "Inverter Type",
            //   subOptions: [
            //     {
            //       value: "Micro Inverter",
            //       label: "1",
            //     },
            //     {
            //       value: "String Inverter",
            //       label: "77",
            //     },
            //     {
            //       value: "Central Inverter",
            //       label: "88",
            //     },
            //   ],
            // },
          ],
        },
        {
          title: "Column Type",
          icon: "",
          callback: (key, keypoints) => {
            console.log("sort", key, keypoints);
            console.log(keypoints);
            this.selectedColumnType = keypoints;
            this.$emit("selected-column", this.selectedColumnType);
          },
          singleLevel: true,
          options: [
            { label: "Order Status", value: "order_status" },
            { label: "Delivery Type", value: "delivery_type" },
          ],
        },
      ],
    };
  },
  props: {
    active: {
      type: Boolean,
      required: true,
    },
    search: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
    },

    togglebtn1: {
      type: String,
      required: true,
    },
    togglebtn2: {
      type: String,
      required: true,
    },
    columnType: {
      type: Function,
    },
  },
  methods: {
    handleRefresh() {
      this.$emit("refresh-data");
    },
    handleSearch(data) {
      this.$emit("search", data);
    },
    handleDisplayFilters(data) {
      console.log(data);
      const FilterData = this.menuData.find((d) => d.title === "Filter");
      console.log(FilterData);

      if (FilterData) {
        const FilterOptions = FilterData.options;
        const options = FilterOptions.find((f) => f.label === data[1]);
        const optionValue = options.subOptions.find(
          (so) => so.label === data[2]
        );
        console.log(optionValue);
        return optionValue.value;
      }
    },
    handleDisplaySort() {
      let data = this.selectedSort;
      console.log(data);
      const SortData = this.menuData.find((d) => d.title === "Sort");
      console.log(SortData);

      if (SortData) {
        const SortOptions = SortData.options;
        console.log(SortOptions);
        const options = SortOptions.find((f) => f.label === data[1]);
        console.log(options);
        return options.value;
      }
    },
    handlesort() {
      let data = this.selectedSort;
      console.log(data);
      const SortData = this.menuData.find((d) => d.title === "Sort");
      console.log(SortData);
      if (SortData) {
        const SortOptions = SortData.options;
        let Sortsub = SortOptions[0].subOptions;
        console.log(Sortsub);
        const options = Sortsub.find((f) => f.label === data[2]);
        console.log(options);
        return options.value;
      }
    },

    getQueryString(pageNumber, type, timeRange, duetimeRange) {
      console.log(this.filterValue);
      let queryString = "";
      if (type === "orders") {
        const { start_time, end_time } = timeRange;
        const { due_start_time, due_end_time } = duetimeRange;
        queryString = `page=${pageNumber}&start_time=${start_time}&end_time=${end_time}&order_by=${this.sort[1]}&sort_type=${this.sort[2]}&due_date_start_time=${due_start_time}&due_date_end_time=${due_end_time}&service_type=${this.service}&engineer_name=${this.owner}`;
      }
      if (type === "users") {
        queryString = `page=${pageNumber}`;
      }

      return queryString;
    },
    async resovleRequests(
      requestCallback,
      pagesPerRequest = 5,
      recordsPerPage = 10,
      type,
      timeRange,
      duetimeRange
    ) {
      const orders = [];

      let queryString = this.getQueryString(1, type, timeRange, duetimeRange);

      const res = await requestCallback(queryString);
      console.log(res.data.results);
      orders.push(...res.data.results);
      const pages = Math.ceil(res.data.count / recordsPerPage);

      const count = Math.ceil(pages / pagesPerRequest);

      console.log(pages, count);

      for (let i = 1; i <= count; i++) {
        const promises = [];

        for (
          let j = pagesPerRequest * (i - 1) + 1;
          j <= pagesPerRequest * i;
          j++
        ) {
          if (j === 1) ++j;
          if (j <= pages) {
            console.log("request page", j);
            promises.push(
              requestCallback(
                this.getQueryString(j, type, timeRange, duetimeRange)
              )
            );
          }
        }

        const x = await Promise.all(promises);

        x.forEach((response) => {
          let resResult = response.data;
          if (resResult?.results) orders.push(...resResult.results);
        });
      }
      console.log(orders);
      return orders;
    },
    async designOrdersUsers() {
      const users = await this.resovleRequests(
        API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_USERS.bind(API.DESIGN_ORDERS),
        this.pagesPerRequest,
        this.recordsPerPage,
        "users",
        this.timeRange,
        this.duetimeRange
      );
      users.map((u) => {
        let first = u?.first_name || "";
        let last = u?.last_name || "";
        u.label = u.id;
        u.value = first + " " + last;
      });
      this.users = users;
      console.log(this.users);
    },
    toggleViewType(status) {
      console.log(status);
      this.$emit("toggle-view", status);
    },
    handleClose(item) {
      console.log(item);
      this.removed = item;
      console.log(this.selectedFilter);
      this.selectedFilter = this.selectedFilter.filter((e) => {
        if (e !== item) return e;
      });
      console.log(this.selectedFilter);
      this.$emit("handlefilterView", this.removed);
    },
    handlesortClose() {
      this.selectedSort = "";
      this.$emit("removeSort", this.selectedSort);
    },
    handleClear() {
      this.selectedFilter = [];
      this.selectedSort = "";
      this.ClearAll = [this.selectedFilter, this.selectedSort];
      console.log(this.selectedFilter);
      this.$emit("removeFilter", this.ClearAll);
    },
    updateDate() {
      this.date = [this.value1, this.value2];
      console.log(this.date);
      this.show = false;
      this.$emit("customDate", this.date);
    },
    updateDueDate() {
      this.duedate = [this.value3, this.value4];
      console.log(this.duedate);
      this.dueshow = false;
      this.$emit("customDueDate", this.duedate);
    },
    handleSelect(index) {
      this.activeIndex = index; // Update the activeIndex with the index of the selected item
      this.selectedItem = index; // Set the selectedItem with the index of the selected item
    },
    handleSelected(index) {
      this.activeIndex2 = index; // Update the activeIndex with the index of the selected item
      this.selectedItem2 = index; // Set the selectedItem with the index of the selected item
    },
    create() {
      console.log("Create");
      this.$emit("create");
    },
    onInput() {
      console.log("Input");
      this.$emit("input", this.search);
    },
    onSearch() {
      console.log("Search");
      this.$emit("search", this.searchTerm);
    },
  },

  components: { FilterData, MenuView, SearchBar, ToggleBar, ButtonSection },
  created() {
    this.designOrdersUsers();
  },
  watch: {
    columnTypeValue(newVal, oldVal) {
      this.$emit("columnType", newVal);
      console.log(newVal);
    },
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");

.heading-container {
  padding: 0 0rem;
}

.filter-button {
  height: 34px;
  width: 70px;
  color: white;
  background-color: #409eff;
  border-color: #409eff;
  margin-left: 10px;
}

.left-section {
  display: flex;
  justify-content: left;
}

.right-section {
  display: flex;
  justify-content: flex-end;
  padding-left: 40px;
}

.search-container {
  width: 60%;
  display: flex;
  justify-content: space-between;
}

.search-bar {
  position: relative;
  max-width: 320px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.searchIcon {
  position: absolute;
  top: 12px;
  left: 8px;
}

.search-bar input {
  width: 100%;
  font-size: 18px;
  padding-left: 36px;
  height: 42px;
  border-radius: 4px;
  border: none;
}

.search-bar button {
  font-size: 18px;
  height: 42px;
  background-color: #3490dc;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-left: 10px;
}

.view_type {
  display: flex;
  height: 42px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
}

.view_type .tab_list {
  border: 1px solid var(--step-100);
  margin-right: -1px;
  overflow: hidden;
  padding: 15px 16px;
  cursor: pointer;
  background-color: var(--white);
  color: var(--step-200);
  transition: all ease-in-out 0s;
  display: flex;
  align-items: center;
}

.view_type .tab_list {
  padding: 8px 12px;
}

.view_type .tab_list:first-child {
  border-radius: 4px 0 0 4px;
}

.view_type .tab_list:last-child {
  border-radius: 0px 4px 4px 0px;
}

.view_type .tab_list:hover,
.view_type .tab_list.active {
  background-color: var(--step-100);
  color: var(--white);
}

.view_type .tab_list span {
  font-size: 15px;
  color: var(--step-200);
}

.view_type .tab_list:hover span,
.view_type .tab_list.active span {
  color: var(--white);
}

.view_type .tab_list.active {
  background-color: var(--step-100);
  color: var(--white);
  background-color: var(--primary);
  border-color: var(--primary);
}

.title {
  font-size: var(--f24);
  color: var(--primary);
  flex-flow: 1;
  display: flex;
  width: 40%;
  justify-content: space-between;
  padding-right: 12px;
  margin-right: 20px;
}

.el-menu--horizontal >>> .el-submenu .el-submenu__title {
  height: 42px;
  line-height: 42px;
  border-bottom: 2px solid transparent;
  color: #909399;
}
.el-tag {
  color: #ffffff;
  background-color: #1c3366;
  height: 29px;
  font-size: 16px;
  font-weight: 400;
  border-radius: 50px;
  text-align: center;
  position: relative;
  padding-right: 33px;
}
.el-tag >>> .el-icon-close {
  position: absolute;
  right: 13px;
  top: 6px;
  color: #ffffff;
  font-size: 16px;
}
.el-tag >>> .el-icon-close::before {
  color: #ffffff;
  font-size: 16px;
}

.view_type .tab_list span.list_text {
  margin-left: 8px;
}

.view_type .tab_list {
  border: 1px solid var(--step-100);
  margin-right: -1px;
  overflow: hidden;
  padding: 15px 16px;
  cursor: pointer;
  background-color: var(--white);
  color: var(--step-200);
  transition: all ease-in-out 0s;
  display: flex;
  align-items: center;
}

@media (max-width: 767px) {
  .title {
    font-size: 24px;
    padding-right: 0;
    /* width: 100% !important; */
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }

  .projectTitle {
    margin-left: 0px !important;
  }
}
</style>
