<template>
  <div class="tableClass" id="tableView">
    <el-table :data="items" :border="false" row-class-name="no-hover">
      <el-table-column
        v-for="column in tableHeaders"
        :key="column.id"
        v-bind:prop="column.id"
        v-bind:label="column.title"
        :min-width="column.width"
        :header-align="getHeaderStyle(column)"
      >
        <template slot-scope="scope">
          <span
            v-if="column.id === 'amount'"
            style="display: flex; align-items: end; justify-content: end"
          >
            <el-input
              :min="1"
              class="right-input"
              v-if="scope.row.allow_amount_edit"
              v-model="scope.row.amount"
              @change="valueChanged(scope.row)"
              @input="
                (value) => {
                  if (scope.row.rate_type === 'percentage_of_system_cost') {
                    scope.row.amount = validateNumber(value, 'percentage');
                  } else {
                    scope.row.amount = validateNumber(value, 'amount');
                  }
                }
              "
            >
              <template
                v-slot:append
                v-if="scope.row.rate_type === 'percentage_of_system_cost'"
              >
                <span class="prefix-text">%</span>

                <!-- Replace with your desired text -->
              </template>
              <template v-else v-slot:prepend>
                <span class="prefix-text">{{ handleCurrencySymbol }}</span>
              </template>
            </el-input>
            <span v-else
              ><span
                v-if="scope.row.rate_type !== 'percentage_of_system_cost'"
                >{{ handleCurrencySymbol }}</span
              >{{ getFormattedNumber(scope.row.amount, true)
              }}<span v-if="scope.row.rate_type === 'percentage_of_system_cost'"
                >%</span
              ></span
            >
            <span
              :class="[
                scope.row.rate_type === 'percentage_of_system_cost'
                  ? 'warningField'
                  : 'warningField-Flat',
              ]"
              :style="{ display: scope.row.amount === '' ? 'block' : 'none' }"
              >Field cannot be empty!</span
            >
          </span>

          <span
            class="right-input"
            v-if="column.id === 'default_quantity'"
            style="display: flex; align-items: end; justify-content: end"
          >
            <el-input
              :min="1"
              v-if="scope.row.allow_quantity_edit"
              v-model="scope.row.default_quantity"
              @change="valueChanged(scope.row)"
              @input="
                (value) => {
                  scope.row.default_quantity = validateQuantity(value);
                }
              "
              style="color: black; text-align: end"
            ></el-input>
            <span v-else style="margin-right: 0.5rem">{{
              getFormattedNumber(scope.row.default_quantity, true)
            }}</span>
            <span
              class="warningField-Quantity"
              :style="{
                display: scope.row.default_quantity === '' ? 'block' : 'none',
              }"
              >Field cannot be empty!</span
            >
          </span>

          <span
            v-if="column.id === 'actions'"
            style="display: flex; align-items: center; justify-content: center"
          >
            <!-- <img src="../../../../src/assets/img/binAND.svg" alt="delete" width="20px"/> -->
            <i
              class="icon delete-alt"
              @click="deleteMode(scope.row)"
              style="font-size: 20px; cursor: pointer"
            ></i>
          </span>
          <span
            v-if="column.id === 'total'"
            style="display: flex; align-items: end; justify-content: end"
          >
            <span v-if="scope.row.type == 'Adder'">
              <el-tooltip
                class="item"
                effect="dark"
                :content="
                  getFormattedNumber(
                    calculateTotal(
                      scope.row.amount,
                      scope.row.default_quantity,
                      scope.row.rate_type
                    ),
                    true
                  )
                "
                placement="top-start"
              >
                <span style="text-overflow: ellipsis; width: 2px">
                  {{ handleCurrencySymbol
                  }}{{
                    generateFormattedComas(
                      countryCode,
                      calculateTotal(
                        scope.row.amount,
                        scope.row.default_quantity,
                        scope.row.rate_type
                      ),
                      true
                    )
                  }}</span
                >
              </el-tooltip></span
            >
            <span v-else>
              <el-tooltip
                class="item"
                effect="dark"
                :content="
                  getFormattedNumber(
                    calculateTotal(
                      scope.row.amount,
                      scope.row.default_quantity,
                      scope.row.rate_type
                    ),
                    true
                  )
                "
                placement="top-start"
              >
                <span style="text-overflow: ellipsis">
                  {{ "-" + handleCurrencySymbol
                  }}{{
                    generateFormattedComas(
                      countryCode,
                      calculateTotal(
                        scope.row.amount,
                        scope.row.default_quantity,
                        scope.row.rate_type
                      )
                    )
                  }}</span
                >
              </el-tooltip></span
            >
          </span>

          <span
            v-else-if="
              column.id !== 'amount' && column.id !== 'default_quantity'
            "
          >
            {{ scope.row[column.id] }}</span
          >
        </template>
      </el-table-column>
    </el-table>
    <DeleteConformation
      v-if="this.delete == true"
      :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
      :title="``"
      :info="info"
      @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
      @confirmDelete="confirmDelete(addedData)"
    />
  </div>
</template>

<script>
import DeleteConformation from "../../../pages/designOrders/components/deleteConformation.vue";
import {
  getCurrencySymbol,
  getFormattedComas,
} from "../../../utils/numberFormat/currencyFormatter";
export default {
  props: {
    items: {
      required: true,
      type: Array,
    },
    tableHeaders: {
      required: true,
      type: Array,
    },
    total: {
      required: true,
      type: Array,
    },
    countryCode: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      // countryCode: JSON.parse(localStorage.getItem("organisation")) || {},
      delete: false,
      isDeleteProjectDocumentPopupOpen: false,
      info: "",
      addedData: "",
    };
  },
  methods: {
    getHeaderStyle(column) {
      if (
        column.id === "default_quantity" ||
        column.id === "amount" ||
        column.id === "total"
      )
        return "right";
    },
    validateQuantity(value) {
      if (value === "" || value === ".") return "";
      let str = value.toString();
      let res = str.replace(/[^0-9]/g, "");
      if (isNaN(parseInt(res))) return "";
      // if(parseFloat(res) > 999){
      //   res = '999'
      // }
      return parseInt(res);
    },
    validatePercentage(value) {
      if (value === "" || value === ".") return "";
      let str = value.toString();
      let res = str.replace(/[^0-9.]/g, "");
      if (isNaN(parseFloat(res))) return "";
      if (parseFloat(res) > 99.99) {
        res = "99";
      }
      return parseInt(res);
    },
    validateNumber(value, type) {
      console.log(value, type);
      let decimalNum = "";
      if (value === "" || value === ".") return "";
      let str = value.toString();
      let res = str.replace(/[^0-9.]/g, "");
      res = res.replace(/\.(?=.*\.)/g, "");
      if (isNaN(parseFloat(res))) return "";
      if (res.charAt(res.length - 1) === ".") return res;
      if (parseFloat(res) > 1000000 && type === "amount") {
        res = "1000000";
      }
      if (parseFloat(res) > 99.99 && type === "percentage") {
        res = "99";
      }
      if (res.includes(".")) {
        let arr = res.split(".");
        if (arr[1]) {
          if (arr[1].length < 3) {
            decimalNum = arr[1];
          } else {
            decimalNum = arr[1].slice(0, 2);
          }
          if (arr[0]) {
            res = arr[0];
          } else {
            res = 0;
          }
        }
      }
      // if (res.includes(".")) {
      //   let arr = res.split(".");
      //   if (arr[1].length > 2) {
      //     let num = arr[0] + "." + arr[1].slice(0, 2);
      //     return this.getFormattedNumber(parseFloat(num), false);
      //   }
      // }
      return `${this.getFormattedNumber(parseFloat(res), false)}${
        decimalNum ? `.${decimalNum}` : ""
      }`;
    },

    generateFormattedComas(country, num) {
      console.log(num);
      if (num.toString().includes(".")) {
        num = num.toFixed(2);
        let arr = num.toString().split(".");
        return getFormattedComas(country, parseInt(arr[0])) + "." + arr[1];
      }
      return getFormattedComas(country, num) + ".00";
    },
    getFormattedNumber(num, isDecimal) {
      let cc = this.countryCode;
      let formattedFirst = getFormattedComas(cc, num);
      let isDot = formattedFirst.toString().includes(".");
      if (!isDot && isDecimal) return formattedFirst;
      return formattedFirst;
    },
    deleteMode(data) {
      this.delete = true;
      this.isDeleteProjectDocumentPopupOpen = true;
      this.info = "Are you sure you want to delete this Item?";
      this.addedData = data;
      // alert("It's Working");
      console.log(this.isDeleteProjectDocumentPopupOpen);
    },
    valueChanged(item) {
      console.log(item);
      let dq = item.default_quantity;
      let amt = item.amount;

      if (dq <= 0 || dq == "") {
        item.default_quantity = 0;
      } else if (amt <= 0 || amt == "") {
        item.amount = item.default_value;
      } else {
        this.$emit("valueChanged", item);
        this.$emit("updateTable", item);
      }
      // if (item.default_quantity <= 0 || item.amount <= 0) {
      //   if(item.default_quantity === '' || item.default_quantity <= 0) item.default_quantity = 1
      //   if(item.amount === '' || item.default_quantity <= 0) item.amount = 1
      // this.$message({
      //   showClose: true,
      //   message: "Quantity and price must be greater than zero",
      //   type: "error",
      //   center: true,
      // });
    },

    calculateTotal(quantity, value, type) {
      if (
        quantity === "" ||
        value === "" ||
        value === null ||
        quantity === null
      )
        return 0;
      value = parseFloat(value.toString().replace(/,/g, ""));
      quantity = parseFloat(quantity.toString().replace(/,/g, ""));
      if (type === "percentage_of_system_cost") {
        let amount = (value / 100) * this.total;
        return quantity * amount;
      } else {
        return quantity * value;
      }
    },
    confirmDelete(value) {
      const { id } = value;
      this.$emit("deleteData", id);
      const index = this.items.indexOf(value);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      // this.$emit("delete", this.selectedData);
      this.isDeleteProjectDocumentPopupOpen = false;
      // this.handleClose();
    },
    // confirmDelete(item) {
    //   const index = this.items.indexOf(item);
    //   if (index !== -1) {
    //     this.items.splice(index, 1);
    //   }

    // },
    Value(row) {
      console.log(row);
    },
    // handleValue(scope, column) {
    //   if (column.id === "value") {
    //   }
    // },
  },

  // computed: {
  //   computedProperty(quantity, value, type) {
  //     if (type === "percentage_of_system_cost") {
  //       return ((value / 100) * 10000).toFixed(2);
  //     } else {
  //       return value.toFixed(2);
  //     }
  //   },
  // },
  computed: {
    handleCurrencySymbol() {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode));
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },
  },

  watch: {},
  components: { DeleteConformation },
};
</script>

<style scoped>
.el-table__fixed,
.el-table__fixed-right {
  box-shadow: none;
}

.tableClass {
  font-family: "Switzer";
}

#tableView >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none;
  color: #222222;
}

#tableView >>> .el-input-group__prepend {
  border: none;
  padding: 0px;
  padding-left: 0.5rem;
  background-color: #e8edf2 !important;
}
#tableView ::v-deep.el-table th.el-table__cell > .cell {
  display: inline-block;
  box-sizing: border-box;
  position: relative;
  vertical-align: middle;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  color: #222222;
  font-size: 14px;
  font-weight: bold;
  line-height: 23.76px;
}
#tableView ::v-deep.el-table .cell {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
  line-height: 23px;
  padding-left: 10px;
  color: #222;
  padding-right: 10px;
}

#tableView >>> .el-input-group__append {
  border: none;
  padding: 0px;
  padding-right: 0.5rem;
  background-color: #e8edf2 !important;
}
.prefix-text {
  color: #222222;
}
.right-input >>> .el-input__inner {
  text-align: end;
  padding-right: 0.5rem;
}

#tableView >>> .hover-row > td {
  background-color: initial !important;
}

#tableView >>> .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: unset;
}
.tableClass
  >>> .el-table--enable-row-transition
  .el-table__body
  td.el-table__cell {
  border-bottom: 1px solid #cccccc;
}

.tableClass >>> .el-table__header {
  border-top: 1px solid #cccccc;
  border-bottom: 2px solid #cccccc;
}
.tableClass >>> .el-table--enable-row-transition {
  border: none;
}
.tableClass >>> .el-table::before {
  background-color: transparent;
}
.tableClass >>> .el-table th.el-table__cell.is-leaf {
  border-bottom: none;
}
.warningField {
  position: absolute;
  color: red;
  font-size: 10px;
  width: 130px;
  bottom: -5%;
  margin: auto;
  left: 10%;
}
.warningField-Flat {
  position: absolute;
  color: red;
  font-size: 10px;
  width: 130px;
  bottom: -8%;
  margin: auto;
  left: 10%;
}
.warningField-Quantity {
  position: absolute;
  color: red;
  font-size: 10px;
  width: 130px;
  bottom: -8%;
  margin: auto;
  left: 8%;
}
</style>
