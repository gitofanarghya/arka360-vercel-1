<template>
  <div id="select-container">
    <el-select
      v-model="selectedItem"
      :placeholder="placeholderText"
      :filterable="true"
      :filter-method="filterMethod"
      @change="addItem"
      width="100%"
      class="custom-select"
    >
      <el-option
        :style="{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'white',
        }"
      >
        <el-row class="border">
          <el-col :span="6" class="column-data">{{ "Name" }}</el-col>
          <el-col :span="6" class="column-data">{{ "Type" }}</el-col>
          <el-col :span="8" class="column-data">{{ "Rate Type" }}</el-col>
          <el-col :span="4" class="column-amount">{{ "Default Value" }}</el-col>
        </el-row>
      </el-option>
      <div
        class="scroll-bar"
        ref="selectContainer"
        v-infinite-scroll="LoadMoreData"
      >
        <el-option
          v-for="item in items"
          :key="item.name"
          :label="item.name"
          :value="item"
        >
        <div class="dropdown-container">
          <el-row class="border">
            <el-col :span="6" class="column-data">
              <el-tooltip
                class="item"
                effect="dark"
                :content="item.name"
                placement="top-start"
            >
              <span> {{ getShortenName(item.name) }}</span>
            </el-tooltip>
              </el-col
            >
            <el-col :span="6" class="column-data">{{ item.type }}</el-col>
            <el-col :span="8" class="column-data">{{ item.rate_type }}</el-col>
            <el-col :span="4" class="column-amount">{{
            item.rate_type === "percentage_of_system_cost" || item.rate_type === "Percentage (of system cost)"
               ? `${item.default_percentage.toFixed(2)}%`: `${item.country_details? handleCurrencySymbol(item.country_details.currency_code):handleCurrencySymbol(countryCode.currency_code)}${ item.country_details? generateFormattedComas(item.country_details.currency_code,item.amount) : generateFormattedComas(countryCode.currency_code,item.amount)} `
             
            }}</el-col>
          </el-row>
        </div>
        </el-option>
      </div>
    </el-select>
  </div>
</template>

<script>
import debounce from "debounce";
import API from "../../../services/api";
import {
  getCurrencySymbol,
  getFormattedComas,
  getFormattedCurrencyComas,
  getFormattedNumberWithCurrency,
} from "../../../utils/numberFormat/currencyFormatter";
import { adderRateType } from "./adderTypesConstants";
import infiniteScroll from "vue-infinite-scroll";

export default {
  directives: {
    infiniteScroll,
  },
  data() {
    return {
      nextUrl: "",
      items: [],
      scrollData: [],
      placeholderText: "Select an Adder or Discount",
      countryCode: JSON.parse(localStorage.getItem("organisation")) || {},
      scrollRefData: 0,
      tableHeightRef: 0,
    };
  },
  props: ["total"],
  // computed: {
  //   handleCurrencySymbol(val) {
  //     console.log(val);
  //     console.log(getCurrencySymbol(val));
  //     return  getCurrencySymbol(val)
  //   },
  // },
  methods: {
    handleCurrencySymbol(val) {
      console.log(val);
      console.log(getCurrencySymbol(val));
      return getCurrencySymbol(val);
    },
    generateFormattedComas(country, num) {
      console.log(num);
      if (num.toString().includes(".")) {
        let arr = num.toString().split(".");
        return getFormattedComas(country, parseInt(arr[0])) + "." + arr[1];
      }
      return getFormattedComas(country, num);
    },
    getShortenName(name) {
      if (name.length >= 30) {
        return name.slice(0, 30);
      }
      return name;
    },
    handleScroll() {
      console.log("scroll");
      const table = this.$refs.selectContainer;
      const scrollPosition = table.scrollTop + table.clientHeight;
      const tableHeight = table.scrollHeight;
      if (this.scrollRefData === 0 || tableHeight !== this.tableHeightRef) {
        this.tableHeightRef = tableHeight;
        this.scrollRefData = tableHeight - 1;
      }
      console.log(tableHeight, Math.floor(scrollPosition));
      if (
        Math.floor(scrollPosition) === this.scrollRefData ||
        Math.floor(scrollPosition) === tableHeight
      ) {
        this.scrollRefData = scrollPosition;
        this.LoadMoreData();
      }
    },
    checkScroll() {
      const container = this.$refs.selectContainer;
      const scrollableHeight = container.scrollHeight - container.clientHeight;
      const scrollTop = container.scrollTop;
      console.log(scrollTop, scrollableHeight);

      if (scrollTop === scrollableHeight) {
        // Scroll has reached the bottom
        // Replace with your method name
        this.LoadMoreData();
      }
    },
    handleSwap(type, returnType, value) {
      console.log(value);
      let data = adderRateType().find((e) => e[type] === value);
      console.log(data);
      if (data === undefined) return value;
      console.log(data[returnType]);
      return data[returnType];
    },
    handleAmount(amount) {
      console.log(amount);
      return getFormattedNumberWithCurrency(amount, true);
    },
    addItem() {
      if (this.selectedItem) {
        console.log(this.selectedItem);
        this.$emit("selectedItem", this.selectedItem);
        this.selectedItem = null;
      }
      this.getAddersData();
    },

    async LoadMoreData() {
      if (this.nextUrl !== null) {
        let { data } = await API.ADDERS_DISCOUNTS.LOAD_MORE_ADDERS(
          this.nextUrl
        );
        this.nextUrl = data.next;
        this.scrollData = data.results.map((item) => {
          let default_quantity = 1;
          let default_value = 0;
          let amount = 0;
          let isPercentage = 0;
          item.type = this.handleSwap("value", "label", item.type);
          item.rate_type = this.handleSwap("value", "label", item.rate_type);

          if (item.rate_type === "percentage_of_system_cost") {
            default_value = item.default_percentage.toFixed(2);
            amount = item.default_percentage.toFixed(2);
          } else {
            default_value = item.default_amount.toFixed(2);
            amount = item.default_amount.toFixed(2);
          }

          if (item.rate_type === "percentage_of_system_cost") {
            isPercentage = (
              (item.default_percentage / 100) *
              this.total
            ).toFixed(2);
          } else {
            isPercentage = item.default_amount.toFixed(2);
          }

          return {
            ...item,
            default_quantity,
            default_value,
            isPercentage,
            amount,
          };
        });

        this.items = [...this.items, ...this.scrollData];
      }
    },

    filterMethod: debounce(async function (term) {
      let { data } =
        await API.ADDERS_DISCOUNTS.FETCH_ALL_SEARCHED_ADDERS_AND_DISCOUNTS(
          term
        );
      this.items = data.results.map((item) => {
        let default_quantity = 1;
        let default_value = 0;
        let amount = 0;
        let isPercentage = 0;
        item.type = this.handleSwap("value", "label", item.type);
        item.rate_type = this.handleSwap("value", "label", item.rate_type);

        if (item.rate_type === "percentage_of_system_cost") {
          default_value = item.default_percentage.toFixed(2);
          amount = item.default_percentage.toFixed(2);
        } else {
          default_value = item.default_amount.toFixed(2);
          amount = item.default_amount.toFixed(2);
        }

        if (item.rate_type === "percentage_of_system_cost") {
          isPercentage = ((item.default_percentage / 100) * this.total).toFixed(
            2
          );
        } else {
          isPercentage = item.default_amount.toFixed(2);
        }

        return {
          ...item,
          default_quantity,
          default_value,
          isPercentage,
          amount,
        };
      });
      this.nextUrl = data.next;
    }, 500),
    // (value) {
    //   debounce(async (value) => {
    //     console.log(value);
    //
    //   }, 500);
    // },
    async getAddersData() {
      let { data } =
        await API.ADDERS_DISCOUNTS.FETCH_ALL_ADDERS_AND_DISCOUNTS();
      console.log(data.results);
      this.nextUrl = data.next;
      this.items = data.results.map((item) => {
        let default_quantity = 1;
        let default_value = 0;
        let amount = 0;
        let isPercentage = 0;
        item.type = this.handleSwap("value", "label", item.type);
        item.rate_type = this.handleSwap("value", "label", item.rate_type);

        if (item.rate_type === "percentage_of_system_cost") {
          default_value = item.default_percentage.toFixed(2);
          amount = item.default_percentage.toFixed(2);
        } else {
          default_value = item.default_amount.toFixed(2);
          amount = item.default_amount.toFixed(2);
        }

        if (item.rate_type === "percentage_of_system_cost") {
          isPercentage = ((item.default_percentage / 100) * this.total).toFixed(
            2
          );
        } else {
          isPercentage = item.default_amount.toFixed(2);
        }

        return {
          ...item,
          default_quantity,
          default_value,
          isPercentage,
          amount,
        };
      });
      console.log(this.items);
      if (this.nextUrl !== null) {
        this.LoadMoreData();
      }
    },
  },

  mounted() {
    this.getAddersData();
  },
};
</script>
<style scoped>
.scroll-bar {
  max-height: 12rem;
  overflow-y: scroll;
}
#select-container >>> .el-select {
  width: 100%;
}

#select-container >>> .el-popper {
  /* background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2) !important; */
  margin: 0;
}
#select-container >>> .el-select-dropdown__item.hover,
.el-select-dropdown__item {
  border-bottom: 1px solid #ebeef5 !important;
  padding: 2px 20px;
  height: 38px;
  color: black;
}
.custom-select ::placeholder {
  color: #1d1d1d;
}
.custom-select ::ui {
  color: red;
}
#select-container >>> .el-col {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 0.5rem;
}
#select-container >>> .el-select-dropdown__list {
  background-color: red;
  padding: 0 !important;
}
#select-container >>> .el-scrollbar__view {
  padding-top: 0 !important;
}
#select-container /deep/ .el-scrollbar__thumb {
  display: none !important;
  visibility: hidden !important;
  background: red;
}

.column-data {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
}
.column-amount {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
  text-align: right;
}
#select-container >>> .el-select .el-input .el-select__caret {
  color: black !important;
}
#select-container >>> .el-scrollbar__wrap {
  display: none !important;
  background-color: white !important;
}
#select-container {
  overflow: hidden;
}
.dropdown-container {
  max-width: 800px;
}
@media screen and (min-width: 1800px) {
  .dropdown-container {
    max-width: 100%;
  }
}
</style>

<!-- <template>
    <div>
      <el-select v-model="selectedItem" placeholder="Select an item" @change="addItem">
        <el-option
      </el-select>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        selectedItem: null,
        items: [
          {
            name: "adder 1",
            type: "Adder",
            rateType: "Flat",
            defaultValue: 179,
            defaultQuantity: 3,
            editableValue: true,
            editableQuantity: false,
          },
          {
            name: "adder 2",
            type: "Adder",
            rateType: "Per module",
            defaultValue: 149,
            defaultQuantity: 2,
            editableValue: false,
            editableQuantity: true,
          },
          {
            name: "discount 1",
            type: "Discount",
            rateType: "Flat",
            defaultValue: 179,
            defaultQuantity: 3,
            editableValue: true,
            editableQuantity: false,
          },
          {
            name: "discount 2",
            type: "Discount",
            rateType: "Per module",
            defaultValue: 179,
            defaultQuantity: 3,
            editableValue: true,
            editableQuantity: false,
          },
        ],
      };
    },
    methods: {
      addItem() {
        if (this.selectedItem) {
          this.$emit("selectedItem", this.selectedItem);
          this.selectedItem = null;
        }
      },
      getLabel(item) {
        return `${item.name} -- ${item.type} -- ${item.rateType} -- ${item.defaultValue}`;
      },
    },
  };
  </script> -->
