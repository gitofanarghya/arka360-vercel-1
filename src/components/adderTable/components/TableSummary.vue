<template>
  <div style="font-size: 14px">
    <div class="summary-line">
      <span>System cost</span>
      <span class="right-summary" v-if="total>0">{{handleCurrencySymbol}}{{ getFormattedNumber(total.toFixed(2)) }}</span>
      <span class="right-summary" v-else>-</span>
    </div>

    <div class="summary-line">
      <span>Total adders cost</span>
      <span class="right-summary"
        >{{ handleCurrencySymbol
        }}{{ getFormattedNumber(adders.toFixed(2)) }}</span
      >
    </div>

    <div class="summary-line">
      <span>Total discounts</span>
      <span class="right-summary"
        >-{{ handleCurrencySymbol
        }}{{ getFormattedNumber(discounts.toFixed(2)) }}</span
      >
    </div>
    <hr c />
    <div class="summary-line bold">
      <span>Total System Cost</span>
      <span class="right-summary" v-if="grandTotal > 0 && total>0"
        >{{ handleCurrencySymbol
        }}{{ getFormattedNumber(grandTotal.toFixed(2)) }}</span
      >
      <span class="right-summary" v-else-if="grandTotal < 0 && total>0"
        >-{{ handleCurrencySymbol
        }}{{ getFormattedNumber(Math.abs(grandTotal.toFixed(2))) }}</span
      >
      <span style="color:#777777;" class="right-summary" v-else
        >Please add consumption and pricing to view the value</span
      >
    </div>
  </div>
</template>

<style scoped>
.right-summary {
  /* margin-right: 7%; */
}
.summary-line {
  display: flex;
  justify-content: space-between;
}

.summary-line {
  margin-top: 10px;
  margin-right: 7%;
  margin-left: 1%;
}

hr {
  margin-top: 10px;
  border: none;
  border-bottom: 1px solid #cccccc;
}

.bold {
  font-weight: 600;
}
</style>

<script>
import {
  getCurrencySymbol,
  getFormattedComas,
} from "../../../utils/numberFormat/currencyFormatter";
export default {
  data() {
    return {
      
    };
  },
  props: ["lineItems", "total","countryCode"],
  methods: {
    getFormattedNumber(num) {
      console.log(num);
      //num = num.toFixed(2)
      num = parseFloat(num.toString().replace(/,/g, ""));
      let cc = this.countryCode;
      let formattedFirst = getFormattedComas(cc, num);
      let isDot = formattedFirst.toString().includes(".");
      if (!isDot) return formattedFirst + ".00";
      return formattedFirst;
    },
    getFloatNumber(num) {
      return parseFloat(num.toString().replace(/,/g, ""));
    },
  },
  computed: {
    handleCurrencySymbol() {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode));
      return this.countryCode
        ? getCurrencySymbol(this.countryCode)
        : "";
    },
    adders() {
      let addersTotal = 0;
      for (const item of this.lineItems) {
        let amount =parseFloat(item.amount.toString().replace(/,/g, "")).toFixed(2) || 0;
        let defaultQuantity =parseFloat( item.default_quantity.toString().replace(/,/g, "")).toFixed(2) || 0;
        if (isNaN(amount)) amount = 1;
        if (isNaN(defaultQuantity)) defaultQuantity = 1;
        if (
          item.type === "Adder" &&
          item.rate_type == "percentage_of_system_cost"
        ) {
          addersTotal += ((amount * this.total) / 100) * defaultQuantity;
        } else if (
          item.type === "Adder" &&
          item.rate_type !== "percentage_of_system_cost"
        ) {
          addersTotal += amount * defaultQuantity;
        }
      }
      return addersTotal;
    },
    discounts() {
      let discountsTotal = 0;
      for (const item of this.lineItems) {
        let amount =
          parseFloat(item.amount.toString().replace(/,/g, "")).toFixed(2) || 0;
        let defaultQuantity =
          parseFloat(
            item.default_quantity.toString().replace(/,/g, "")
          ).toFixed(2) || 0;
        if (isNaN(amount)) amount = 1;
        if (isNaN(defaultQuantity)) defaultQuantity = 1;
        if (
          item.type === "Discount" &&
          item.rate_type == "percentage_of_system_cost"
        ) {
          discountsTotal += ((amount * this.total) / 100) * defaultQuantity;
        } else if (
          item.type === "Discount" &&
          item.rate_type !== "percentage_of_system_cost"
        ) {
          discountsTotal += amount * defaultQuantity;
        }
      }
      return discountsTotal;
    },
    grandTotal() {
      return this.total + this.adders - this.discounts;
    },
  },
};
</script>
