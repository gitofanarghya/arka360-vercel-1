<template>
  <div id="sytemDetailsMain">
    <div class="systemDetails_section doc-page" id="systemDetailsId">
      <div class="headerRep">
        <div class="headerContentOne">
          <p
            class="headerName"
            v-html="projectNameFiltered(clientNameComputed)"
          ></p>
          <p class="headerAddress">{{ data?.project_head.address }}</p>
        </div>
        <div class="headerContentTwo" v-if="data.organisation_data.logo">
          <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
          <img :src="data.organisation_data.logo" class="logo" />
        </div>
      </div>

      <div class="contentContainer">
        <div class="secHeaderSDS secHeaderMD" id="secHeaderSDSId">
          <h1 class="secHeaderContentSDS">System Pricing</h1>
        </div>

        <div class="system_items">
          <div class="items">
            <p class="name">Base Price</p>
            <p class="amount">
              {{ handleCurrencySymbol }}{{ data.base_price }}
            </p>
          </div>
          <div v-if="data.adders && isHomeOwnerFacing">
            <div class="items">
              <p class="name">Add-ons</p>
              <p class="amount" v-if="data.adders != 0">
                {{ handleCurrencySymbol }}{{ data.adders }}
              </p>
            </div>
            <div v-for="adder in data.adders_and_discounts" :key="adder.id">
              <div
                v-if="
                  adder.adders_discounts__type === 'adder' &&
                  adder.adders_discounts__is_homeowner_facing === true
                "
                class="item"
              >
                <p
                  class="item_name sub_name"
                  v-if="adder.adders_discounts__is_homeowner_facing === true"
                >
                  {{ adder.adders_discounts__name }}
                </p>
                <p
                  class="amount"
                  v-if="adder.adders_discounts__show_adder_total === true"
                >
                  {{ handleCurrencyFormate(adder.amount * adder.quantity) }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="data.discounts && isHomeOwnerFacing">
            <div class="items">
              <p class="name">Discount</p>
              <p class="amount" v-if="data.discounts != 0">
                -{{ handleCurrencySymbol }}{{ data.discounts }}
              </p>
            </div>
            <div v-for="disc in data.adders_and_discounts" :key="disc.id">
              <div
                class="item"
                v-if="
                  disc.adders_discounts__type === 'discount' &&
                  disc.adders_discounts__is_homeowner_facing === true
                "
              >
                <p
                  class="item_name sub_name"
                  v-if="disc.adders_discounts__is_homeowner_facing === true"
                >
                  {{ disc.adders_discounts__name }}
                </p>
                <p
                  class="amount"
                  v-if="disc.adders_discounts__show_adder_total === true"
                >
                  {{ handleCurrencyFormate(disc.amount * disc.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="total_cost">
          <hr class="totalFooter" />
          <div class="amount_total">
            <p>Total Payable Now(See Payment Schedule)</p>
            <p>
              {{ handleCurrencySymbol }}{{ data.total_cost_before_incentive }}
            </p>
          </div>

          <div class="items">
            <p>Incentive</p>
            <p>-{{ handleCurrencySymbol }}{{ data.total_insentive }}</p>
          </div>
          <div>
            <div v-for="incentive in data.insentives_data" :key="incentive.id">
              <div class="item">
                <p class="item_name sub_name">{{ incentive?.name || "" }}</p>
                <p>
                  {{ handleCurrencySymbol
                  }}{{ incentive.tot_amount_contribution.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
          <div class="payable">
            <hr class="hrFooter" />
            <div class="last_item">
              <p>Effective Price after Incentive</p>
              <p>
                {{ handleCurrencySymbol
                }}{{ data.total_cost_after_adders_and_discounts_incentive }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <hr class="hrFooter" />
        <p class="footerContent">
          Powered by <span class="bold2">ARKA 360</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getCurrencySymbol,
  getFormattedCurrencyComas,
  getFormattedNumberWithCurrency,
} from "../../utils/numberFormat/currencyFormatter.js";
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      countryCode: "",
    };
  },
  computed: {
    isHomeOwnerFacing() {
      if (this.data.adders_and_discounts.length > 0) {
        const adderDiscounts = this.data.adders_and_discounts;
        const isAdderHomewner = adderDiscounts.find(
          (d) =>
            d.adders_discounts__is_homeowner_facing === true &&
            d.adders_discounts__type === "adder"
        );
        const isDiscountHomewner = adderDiscounts.find(
          (d) =>
            d.adders_discounts__is_homeowner_facing === true &&
            d.adders_discounts__type === "discount"
        );
        if (isAdderHomewner) {
          return true;
        } else if (isDiscountHomewner) {
          return true;
        } else {
          false;
        }
      } else {
        return false;
      }
    },
    clientNameComputed() {
      return this.data.project_head.client_name || this.data.project_head.name;
    },
    handleCurrencySymbol() {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode));
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },
  },
  methods: {
    handleCurrencyFormate(amount) {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode, amount));
      return this.countryCode
        ? getFormattedCurrencyComas(this.countryCode, amount)
        : "";
    },
    projectNameFiltered(val, short = false) {
      if (val) {
        if (short && val.length > 77) {
          const truncatedVal = val.slice(0, 77).replace(/`/g, "\\`") + "...";
          return truncatedVal;
        } else {
          const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
          return eval("`" + escapedVal + "`");
        }
      } else {
        return "-";
      }
    },
  },
  mounted() {
    console.log(this.$props.data);
    this.countryCode = this.$props.data.country.currency_code;
    console.log(this.countryCode);
  },
};
</script>

<style scoped>
.systemDetails_section {
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.system_items {
  margin: 1.5rem;
  margin-bottom: 0.5rem;
}
.headerRep {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  height: 94px;
  box-sizing: border-box;
}

.headerContentOne {
  width: 60%;
}

.headerName {
  font-weight: 600;
  font-size: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  width: 278px;
}

.headerAddress {
  margin: 4px 0px;
  font-weight: 500;
  font-size: 16px;
  width: 278px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.headerAddress {
  width: 100%;
}

.secHeaderSDS {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderMD {
  padding: 14px;
}

.secHeaderContentSDS {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.items {
  margin-top: 10px;
  background-color: #e8edf2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 1rem;
}

.item {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 1rem;
}

.item_name {
  margin-left: 10px;
}

.total_cost {
  margin: 1.5rem;
  margin-top: 0;
}
.amount_total {
  margin-bottom: -10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #409eff;
  padding: 1rem;
}
.last_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.hrFooter {
  color: #999;
  margin: 0px;
}

.totalFooter {
  border-color: #409eff;
}

.footerContent {
  text-align: right;
  font-weight: 500;
  font-size: 16px;
  padding: 4px 20px;
  margin: 16px 0px;
}

.bold2 {
  font-weight: 600;
}
.sub_name {
  padding-left: 0.5rem;
}
</style>
