<!-- Rules:  
1.if want to add the different data types or even if u want to display different data it should be before the given indication down below.
2.If want toi add after data just do after the given indication and color is controlled be the getCellColor and should be passed from parent.
-->

<template>
  <div class="table-view" id="table">
    <div v-if="showSearch">
      <searchBar
        @search="handleInputChange"
        :style="{ width: searchHeight, margin: '1rem' }"
      ></searchBar>
    </div>
    <el-table
      @row-click="handleRowClick"
      ref="table"
      class="table-container"
      :data="tableData"
      :style="{
        width: '100%',
        maxHeight: `calc(100vh - ${tableHeightOffset}) !important`,
        minHeight: `calc(100vh - ${tableHeightOffset}) !important`,
        overflowY: 'scroll',
        background: 'white',
        borderRadius: '10px',
      }"
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="busy"
      infinite-scroll-distance="10"
      :border="showBorder"
      :highlight-current-row="true"
      :row-style="rowClassName"
      :cell-style="{
        padding: '0',
        height: cellHeight,
        paddingLeft: paddingLeft,
      }"
      :header-cell-style="{ paddingLeft: paddingLeft }"
    >
      <el-table-column
        v-for="column in tableColumns"
        :key="column.id"
        v-bind:prop="column.id"
        v-bind:label="column.title"
        :min-width="column.width"
        :header-align="getHeaderStyles(column)"
      >
        <template slot="header" v-if="showHeaderSortable">
          <span
            class="headerButton"
            v-if="column.title === 'Name'"
            :style="{ color: nameColor }"
          >
            {{ column.title }}
            <i
              class="el-icon-top"
              v-if="!nameSortable"
              v-on:click="handleSort('name', false)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <i
              class="el-icon-bottom"
              v-else
              v-on:click="handleSort('name', true)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <!-- Replace with your desired icon -->
          </span>
          <span
            class="headerButton"
            v-if="column.title === 'Type'"
            :style="{ color: typeColor }"
          >
            {{ column.title }}
            <i
              class="el-icon-top"
              v-if="!typeSortable"
              v-on:click="handleSort('type', false)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <i
              class="el-icon-bottom"
              v-else
              v-on:click="handleSort('type', true)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <!-- Replace with your desired icon -->
          </span>
          <span
            class="headerButton"
            v-if="column.title === 'Rate Type'"
            :style="{ color: rateColor }"
          >
            {{ column.title }}
            <i
              class="el-icon-top"
              v-if="!rateSortable"
              v-on:click="handleSort('rate_type', false)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <i
              class="el-icon-bottom"
              v-else
              v-on:click="handleSort('rate_type', true)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <!-- Replace with your desired icon -->
          </span>
          <span
            class="headerButton"
            v-if="column.title === 'Default Value'"
            :style="{ color: valueColor }"
          >
            {{ column.title }}
            <i
              class="el-icon-top"
              v-if="!valueSortable"
              v-on:click="handleSort('default_amount', false)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <i
              class="el-icon-bottom"
              v-else
              v-on:click="handleSort('default_amount', true)"
              style="
                line-height: 1.1;
                margin-left: 3px;
                margin-top: 5px;
                cursor: pointer;
              "
            ></i>
            <!-- Replace with your desired icon -->
          </span>
        </template>

        <template scope="scope">
          <div
            :style="getCellStyles(scope.row, column)"
            :class="{
              place: true,
              'green-tick': scope.row[column.id] === '\u2713',
            }"
          >
            <span v-if="column.type === 'tag'">
              <slot :scope="{ scope, column }" name="tags"></slot>
            </span>

            <span v-if="column.type === 'shiftTags'">
              <slot :scope="{ scope, column }" name="shiftTags"></slot>
            </span>

            <span
              v-if="column.type === 'avatar'"
              style="display: flex; align-items: center"
            >
              <el-avatar
                :size="30"
                style="
                  margin-right: 1rem;
                  min-width: 30px;
                  background-color: red;
                "
                >{{ renderName(scope.row.fullName) }}</el-avatar
              >
              {{ scope.row.fullName }}
            </span>

            <span v-if="column.type === 'onlineStatus'">
              <div class="actionClass">
                <el-badge
                  is-dot
                  class="item"
                  :type="getStatus(scope.row, column)"
                  style="margin-top: 12px"
                ></el-badge>
                <span
                  v-if="scope.row.isOnline === true"
                  style="margin-left: 10px; color: green"
                  >Online</span
                >
                <span v-else style="margin-left: 10px; color: grey"
                  >Offline</span
                >
              </div>
            </span>

            <span v-if="column.type === 'dropdown'">
              <slot :scope="{ scope, column }" name="dropdown"></slot>
            </span>

            <!-- before this -->
            <span
              v-else-if="!column.type"
              style="
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              {{ scope.row[column.id] }}
            </span>
            <!-- after this -->
            <span v-if="column.id === tableColumns[0].id" class="actionClass">
              <slot :scope="{ scope, column }" name="actions"></slot>
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { generateInitials } from "../../../utils/initalsGenerator";
import TagsComponent from "../esUsers/components/tagsComponent.vue";
import infiniteScroll from "vue-infinite-scroll";
import searchBar from "./header/searchBar.vue";
export default {
  name: "ListViewTable",
  directives: {
    infiniteScroll,
  },
  components: {
    TagsComponent,
    searchBar,
  },
  props: {
    sortShow: {
      type: Boolean,
      default: false,
    },
    paddingLeft: {
      type: String,
      default: "0px",
    },
    cellHeight: {
      type: String,
      default: "80px",
    },
    searchHeight: {
      type: String,
      default: "100%",
    },
    tableColumns: {
      required: true,
      type: Array,
    },
    tableData: {
      required: true,
      type: Array,
    },
    handleRowClick: {
      type: Function,
    },
    getCellStyles: {
      type: Function,
      default: () => {
        return { color: "black" };
      },
    },
    getHeaderStyles: {
      type: Function,
      default: () => {
        const center = "center";
        return center;
      },
    },
    showBorder: {
      type: Boolean,
      default: true,
    },
    loadMoreLeadData: {
      type: Function,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    showHeaderSortable: {
      type: Boolean,
      default: false,
    },
    tableHeightOffset: {
      type: String,
    },
    nextUrl: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      trippleNameSort: false,
      trippleRateSort: false,
      trippleValueSort: false,
      trippleTypeSort: false,
      nameSortable: false,
      typeSortable: false,
      rateSortable: false,
      valueSortable: false,
      showSort: this.$props.sortShow,
      nameColor: "#909399",
      typeColor: "#909399",
      rateColor: "#909399",
      valueColor: "#909399",
      tablesData: 11,
      currentPage: 1,
      pageSize: 10,
      totalDataCount: 0,
      loading: false,
      busy: false,
      data: [],
      selectedRow: "",
      scrollRefData: 0,
      tableHeightRef: 0,
    };
  },
  computed: {
    scrollRefDatas() {
      this.scrollRefData;
      return this.scrollRefData;
    },
  },
  mounted() {
    console.log(this.tableData);
    console.log(this.nameSortable);
    console.log(this.$props.sortShow);
  },
  methods: {
    handleSort(name, type) {
      if (name === "name") {
        if (type === false && this.trippleNameSort === false) {
          this.nameSortable = true;
          this.typeSortable = false;
          this.rateSortable = false;
          this.valueSortable = false;
          this.nameColor = "black";

          this.typeColor = "#909399";
          this.rateColor = "#909399";
          this.valueColor = "#909399";
          this.$emit("sortTableApi", ["desc", "name"]);
        } else if (type === false && this.trippleNameSort === true) {
          this.trippleNameSort = false;
          this.nameColor = "#909399";
          this.$emit("getAddersData");
        } else {
          this.nameSortable = false;
          this.trippleNameSort = true;
          this.$emit("sortTableApi", ["asc", "name"]);
        }
      }
      if (name === "type") {
        if (type === false && this.trippleTypeSort === false) {
          this.typeSortable = true;
          this.nameSortable = false;
          this.rateSortable = false;
          this.valueSortable = false;
          this.nameColor = "#909399";

          this.typeColor = "black";
          this.rateColor = "#909399";
          this.valueColor = "#909399";
          this.$emit("sortTableApi", ["desc", "type"]);
        } else if (type === false && this.trippleTypeSort === true) {
          this.trippleTypeSort = false;
          this.typeColor = "#909399";
          this.$emit("getAddersData");
        } else {
          this.typeSortable = false;
          this.trippleTypeSort = true;
          this.$emit("sortTableApi", ["asc", "type"]);
        }
      }
      if (name === "rate_type") {
        if (type === false && this.trippleRateSort === false) {
          this.typeSortable = false;
          this.nameSortable = false;
          this.rateSortable = true;
          this.valueSortable = false;
          this.nameColor = "#909399";

          this.typeColor = "#909399";
          this.rateColor = "black";
          this.valueColor = "#909399";
          this.$emit("sortTableApi", ["desc", "rate_type"]);
        } else if (type === false && this.trippleRateSort === true) {
          this.trippleRateSort = false;
          this.rateColor = "#909399";
          this.$emit("getAddersData");
        } else {
          this.rateSortable = false;
          this.trippleRateSort = true;
          this.$emit("sortTableApi", ["asc", "rate_type"]);
        }
      }
      if (name === "default_amount") {
        if (type === false && this.trippleValueSort === false) {
          this.typeSortable = false;
          this.nameSortable = false;
          this.rateSortable = false;
          this.valueSortable = true;
          this.nameColor = "#909399";

          this.typeColor = "#909399";
          this.rateColor = "#909399";
          this.valueColor = "black";
          this.$emit("sortTableApi", ["desc", "default_value"]);
        } else if (type === false && this.trippleValueSort === true) {
          this.trippleValueSort = false;
          this.valueColor = "#909399";
          this.$emit("getAddersData");
        } else {
          this.valueSortable = false;
          this.trippleValueSort = true;
          this.$emit("sortTableApi", ["asc", "default_value"]);
        }
      }
    },

    getHeaderStyles(name) {
      console.log;
      if (name === "name") {
        return {
          color: "black",
        };
      }
    },

    loadData() {
      this.$props.loadMoreLeadData();
      this.busy = false;
    },
    loadMore() {
      if (this.$props.nextUrl !== null) {
        this.busy = true;
        this.loadData();
      }
    },
    handleScroll() {
      console.log("scroll");
      const table = this.$refs.table.$el;
      const scrollPosition = table.scrollTop + table.clientHeight;
      const tableHeight = table.scrollHeight;
      if (this.scrollRefData === 0 || tableHeight !== this.tableHeightRef) {
        this.tableHeightRef = tableHeight;
        this.scrollRefData = tableHeight - 1;
      }
      if (Math.round(scrollPosition) === this.scrollRefDatas) {
        this.scrollRefData = scrollPosition;
        this.$props.loadMoreLeadData();
      }
    },
    handleInputChange(data) {
      this.$emit("handleSearch", data);
    },

    handleRow(row) {
      this.selectedRow = row;
      this.handleRowClick(row);
    },

    rowClassName(row) {
      console.log(row.name === this.selectedRow.name);
      if (row === this.selectedRow) {
        return {
          color: "red",
        };
      }
    },

    getHeader(row, column) {
      console.log(row, column);
    },
    getStatus(row, column) {
      if (row.isOnline === true && column.id === "isOnline") {
        return "success";
      }
      return "info";
    },

    doSome() {
      alert("Hello");
    },

    renderName(name) {
      return generateInitials(name);
    },
  },
  beforeDestroy() {
    const scrollContainer = document.querySelector(".table-container");
    // scrollContainer.removeEventListener("scroll", this.handleScroll);
  },

  watch: {
    sortShow: {
      immediate: true,
      handler(prevValue, newValue) {
        console.log(prevValue, newValue);
        if (prevValue !== newValue) {
          this.typeSortable = false;
          this.nameSortable = false;
          this.rateSortable = false;
          this.valueSortable = false;
          this.nameColor = "#909399";

          this.typeColor = "#909399";
          this.rateColor = "#909399";
          this.valueColor = "#909399";
          this.$emit("getAddersData");
        }
      },
    },
  },
};
</script>

<style scoped>
.table-view {
  max-width: 100%;

  max-height: 85vh;
}

#scroll-bar {
  scrollbar-width: none;
}

#table >>> .el-table .success-row {
  color: red;
}

.color {
  background-color: red;
}

.sortable tr {
  cursor: pointer;
}

.place {
  text-align: left;
  display: flex;
  justify-content: space-between;
}

#table >>> .el-table__body tr.current-row > td.el-table__cell {
  background-color: #e8edf2;
}

.button {
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.green-tick {
  color: rgb(8, 210, 8) !important;
  font-weight: 800;
}

.actionClass {
  display: flex;

  align-items: center;
  justify-content: center;
}
#table >>> .el-table .el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
}
#table >>> .el-table::before,
.el-table--group::after,
.el-table--border::after {
  background-color: transparent;
}

.el-table .el-table__row.is-current-row {
  background-color: yellow; /* Replace with your desired color */
}

.headerButton {
  display: flex;
  align-items: center;
}
#table >>> .el-table__body .el-table__row {
  cursor: pointer;
  background-color: #ffffff;
}
#table >>> .el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
}

#table >>> .el-table .cell {
  white-space: normal;
  word-break: break-word;
  line-height: 23px;
}
</style>
