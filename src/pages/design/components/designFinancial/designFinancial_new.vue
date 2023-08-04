<template>
  <div class="card">
    <div :class="{
      'card_header':!isOnLeadSummaryPage,
      'flex_header':!isOnLeadSummaryPage,
      'incentive-header':isOnLeadSummaryPage
    }">
      <h4>Pricing</h4>
      <div class="button_action" v-if="financials.length > 0">
        <ul class="action_list">
          <li>
            <button
              :disabled="financials.length === 0"
              class="btn"
              @click="openEditForm()"
            >
              <span class="icon edit-alt"></span>
            </button>
          </li>
          <li>
            <el-tooltip
              effect="dark"
              placement="top-start"
              content="Delete Financials"
            >
              <button
                class="action_btn"
                style="border: none; cursor: pointer; background: none"
                @click="isDeletePriceingPopupOpen = true"
              >
                <span class="icon delete-alt"></span>
              </button>
            </el-tooltip>
            <deletePriceing
              v-if="isDeletePriceingPopupOpen"
              :isDeletePriceingPopupOpen="isDeletePriceingPopupOpen"
              @confirmDelete="deletePriceingMethod()"
              @cancelDelete="isDeletePriceingPopupOpen = false"
            />
          </li>
        </ul>
      </div>
    </div>
    <div :class="{
      'card_content':!isOnLeadSummaryPage,
      'card_content_CRM':isOnLeadSummaryPage
      }">
      <div v-if="financials.length > 0" v-loading="!isDesignLoaded">
        <div class="col_row">
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Instrument</div>

              <div
                class="value"
                v-if="financials[0].payment_method_type == null"
              >
                Cash
              </div>
              <div class="value" v-else>
                {{ financials[0].payment_method_type }}
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Price</div>
              <div class="value">
                {{ formattedPriceWithUnits(computedPrice) }}
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Net Present Value</div>
              <div class="value">
                <div v-if="financials[0].npv !== 'NA'">
                  {{ currencySymbol }}
                  <!-- {{
                    parseFloat(financials[0].npv).toFixed(2) >= 0
                      ? parseFloat(financials[0].npv).toFixed(2)
                      : "-"
                  }} -->
                  {{
                    parseFloat(financials[0].npv).toFixed(2) >= 0
                      ? formattedPriceWithUnits(
                          parseFloat(financials[0].npv).toFixed(2)
                        )
                      : "-"
                  }}
                </div>
                <div v-else>-</div>
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">IRR</div>
              <div class="value">
                <div v-if="financials[0].irr !== 'NA'">
                  {{
                    parseFloat(financials[0].irr).toFixed(2) >= 0
                      ? parseFloat(financials[0].irr).toFixed(2)
                      : "-"
                  }}
                </div>
                <div v-else>-</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">LCOE</div>
              <div v-if="currencySymbol !== 'د.إ'">
                {{
                  parseFloat(financials[0].LCOE).toFixed(2) >= 0
                    ? parseFloat(financials[0].LCOE).toFixed(2)
                    : "-"
                }}
              </div>
              <div v-else>
                {{
                  parseFloat(financials[0].LCOE).toFixed(3) >= 0
                    ? parseFloat(financials[0].LCOE).toFixed(3)
                    : "-"
                }}
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Payback</div>
              <div class="value">{{ paybackField }}</div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Tax</div>
              <div class="value">
                {{
                  financials[0].tax
                    ? parseFloat(financials[0].tax).toFixed(2) + "%"
                    : "-"
                }}
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Discount Rate</div>
              <div class="value">
                {{
                  financials[0].discount_rate
                    ? parseFloat(financials[0].discount_rate).toFixed(2) + "%"
                    : "-"
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
          <!-- <div class="col_4 col">
            <div class="info_item">
              <div class="label">Subsidy</div>
              <div class="value">{{ computedSubsidy }}</div>
            </div>
          </div> -->
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Maintenance Cost</div>
              <!-- <div class="value">
                {{ computedMaintenanceCost }}
              </div> -->
              <div class="value">
                {{ formattedPriceWithUnits(computedMaintenanceCost) }}
              </div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Accelerated Years</div>
              <div class="value">{{ accelaratedYears }}</div>
            </div>
          </div>
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Accelerated %</div>
              <div class="value">
                {{
                  financials[0].ad_percentage
                    ? parseFloat(financials[0].ad_percentage).toFixed(2) + "%"
                    : "-"
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
          <div class="col_4 col">
            <div class="info_item">
              <div class="label">Accelerated Tax-Slab</div>
              <div class="value">
                {{
                  financials[0].ad_tax_slab
                    ? parseFloat(financials[0].ad_tax_slab).toFixed(2) + "%"
                    : "-"
                }}
              </div>
            </div>
          </div>
        </div>
        <!-- add -->
      </div>
      <div :class="{
      'add_price_td':!isOnLeadSummaryPage,
      'add_price_td_CRM':isOnLeadSummaryPage
      }" v-if="financials.length === 0">
        <!-- <p>
        Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod
        tempor invidunt
      </p> -->
      <el-tooltip
        :disabled="!isCrmUser() || projectPermissionObject.pricing"
        effect="dark"
        placement="top-start"
        :content="'You dont have permission to change design information.'"
      >
        <span>
          <button
            :disabled="isCrmUser() && !projectPermissionObject.pricing"
            class="btn btn-primary"
            @click="AddPricing()"
            data-toggle="modal"
            data-target="#weather_station"
          >
            Add Pricing
          </button>
        </span>
      </el-tooltip>
      </div>
      <designFinancialEditDialog
        :isFinancialsUndefined="isFinancialsUndefined"
        :financingDetailsData.sync="financingDetailsForm"
        :isEdited="isEdited"
        :isPricingAdded="isPricingAdded"
        :financialPaymentData.sync="financialPayment"
        :isfinancialDetailsFormVisible.sync="isfinancialDetailsFormVisible"
        :isNotGazebo="isNotGazebo"
        @isFormValid="isFormValid"
      />
      <!-- end add -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../../stores/design";
import { useProjectStore } from "../../../../stores/project";

import designFinancialEditDialog from "./designFinancialEditDialog_new.vue";
import deletePriceing from "./deletePriceing.vue";
import { formatNumberWithCommas, isCrmUser } from "@/utils.js";

export default {
  name: "designFinancialView",
  data() {
    return {
      count: 0,
      msg: "I am in designFinancialView",
      isfinancialDetailsFormVisible: false,
      financingDetailsForm: {},
      financialPayment: {},
      isEdited: false,
      isPricingAdded: false,
      isFinancialsUndefined: false,
      isDeletePriceingPopupOpen: false,
      isEdited: false,
      isOnLeadSummaryPage: this.$route.name.includes("leadSummary"),
    };
  },
  props: {
    reportTemplate: {
      type: String,
    },
  },
  computed: {
    ...mapState(useDesignStore, {
      financials: "GET_FINANCIAL_DATA",
      isDesignLoaded: (state) => state.isDesignLoaded,
    }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
      projectInformation: "GET_PROJECT_INFORMATION",
      projectPermissionObject: 'GET_PERMISISON_OBJECT',
    }),
    IsUSFlag() {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        return user.isUSFlagEnabled || this.projectInformation.country==52;
    },
    computedPrice() {
      var countOfDecimal = 2;
      if (this.currencySymbol == "د.إ") {
        countOfDecimal = 3;
      }
      if (
        !this.financials[0].price_per_kw &&
        !this.financials[0].absolute_price &&
        !this.financials[0].price_per_watt
      )
        return "-";
      if (
        !this.financials[0].absolute_price &&
        !this.financials[0].price_per_watt
      ) {
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].price_per_kw
        ).toFixed(countOfDecimal)}/kW`;
      } else if (
        !this.financials[0].absolute_price &&
        !this.financials[0].price_per_kw
      ) {
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].price_per_watt
        ).toFixed(countOfDecimal)}/W`;
      } else
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].absolute_price
        ).toFixed(countOfDecimal)}`;
    },
    paybackField() {
      if (this.financials[0].payback) {
        if (this.financials[0].payback.years > 1) {
          if (this.financials[0].payback.months > 1)
            return `${this.financials[0].payback.years} yrs. ${this.financials[0].payback.months} months`;
          else
            return `${this.financials[0].payback.years} yrs. ${this.financials[0].payback.months} month`;
        } else {
          if (this.financials[0].payback.months > 1)
            return `${this.financials[0].payback.years} yr. ${this.financials[0].payback.months} months`;
          else
            return `${this.financials[0].payback.years} yr. ${this.financials[0].payback.months} month`;
        }
      }
      return "-";
    },
    accelaratedYears() {
      if (this.financials[0].ad_years > 1)
        return `${this.financials[0].ad_years} yrs.`;
      else if (this.financials[0].ad_years <= 1)
        return `${this.financials[0].ad_years} yr.`;
      else return "-";
    },
    computedMaintenanceCost() {
      if (this.financials[0].maintenance_cost_per_kw !== null) {
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].maintenance_cost_per_kw
        ).toFixed(2)}/kW/year`;
      }
      if (this.financials[0].absolute_maintenance_cost !== null) {
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].absolute_maintenance_cost
        ).toFixed(2)}/year`;
      }
      return "-";
    },
    computedSubsidy() {
      if (this.financials[0].subsidy_percentage) {
        return `${parseFloat(this.financials[0].subsidy_percentage).toFixed(
          2
        )}%`;
      } else if (this.financials[0].subsidy_amount) {
        return `${this.currencySymbol}${parseFloat(
          this.financials[0].subsidy_amount
        ).toFixed(2)}`;
      }
      return "-";
    },
    isNotGazebo() {
      return this.reportTemplate != "report_gazebo" ? true : false;
    },
  },
  components: {
    designFinancialEditDialog,
    deletePriceing,
  },
  methods: {
    isFormValid(value){
      console.log(value)
      this.$emit('isFormValid',value)
    },
    ...mapActions(useDesignStore, ["DELETE_DESIGN_FINANCIAL_DETAILS"]),

    async deleteFinancialInstrument(index, rows) {
      try {
        await this.DELETE_DESIGN_FINANCIAL_DETAILS(rows[index]["id"]);
      } catch (error) {
        throw error;
      }
    },
    assignFinancialDataToForm() {
      console.log("Fiancial Data", this.financials[0]);
      // this.$validator.reset();
      if (this.financials[0] !== undefined) {
        // assigning the values of particular financials
        this.financingDetailsForm["id"] = this.financials[0]["id"];
        this.financingDetailsForm["expected_life_years"] =
          this.financials[0]["expected_life_years"];
        this.financingDetailsForm["system_lifetime"] =
          this.financials[0]["system_lifetime"];
        this.financingDetailsForm["o_and_m_cost"] =
          this.financials[0]["o_and_m_cost"];
        this.financingDetailsForm["equipment_lifetime"] =
          this.financials[0]["equipment_lifetime"];
        this.financingDetailsForm["equipment_replacement_cost"] =
          this.financials[0]["equipment_replacement_cost"];
        this.financingDetailsForm["tax"] = this.financials[0]["tax"];
        this.financingDetailsForm["ad_tax_slab"] =
          this.financials[0]["ad_tax_slab"];
        this.financingDetailsForm["ad_years"] = this.financials[0]["ad_years"];
        this.financingDetailsForm["ad_percentage"] =
          this.financials[0]["ad_percentage"];
        this.financingDetailsForm["discount_rate"] =
          this.financials[0]["discount_rate"];
        // console.log("@@payment methoad type of financial",this.financials[0]["payment_method_type"]);
        if (this.financials[0]["payment_method_type"] == null) {
          this.financialPayment["payment_method_type"] = "cash";
        } else {
          this.financialPayment["payment_method_type"] =
            this.financials[0]["payment_method_type"];
        }
        // console.log("#####payment methoad",this.financials[0]["payment_method"]);
        this.financialPayment["payment_method"] =
          this.financials[0]["payment_method"];

        //checking for price, subsidy and maintenance cost
        if (
          this.financials[0]["absolute_price"] === null &&
          this.financials[0]["price_per_watt"] === null
        ) {
          this.financingDetailsForm["price"] =
            this.financials[0]["price_per_kw"];
          this.priceUnit = "relative";
        } else if (
          this.financials[0]["absolute_price"] === null &&
          this.financials[0]["price_per_kw"] === null
        ) {
          this.financingDetailsForm["price"] =
            this.financials[0]["price_per_watt"];
          this.priceUnit = "absolute3";
        } else {
          this.financingDetailsForm["price"] =
            this.financials[0]["absolute_price"];
          this.priceUnit = "absolute";
        }
        this.financialPayment["priceUnit"] = this.priceUnit;

        if (this.financials[0]["subsidy_amount"] === null) {
          this.financingDetailsForm["subsidy"] =
            this.financials[0]["subsidy_percentage"];
          this.subsidyUnit = "relative";
        } else {
          this.financingDetailsForm["subsidy"] =
            this.financials[0]["subsidy_amount"];
          this.subsidyUnit = "absolute";
        }
        // for old designs initially both absolute and relative maintenance cost would be null
        if (
          this.financials[0].absolute_maintenance_cost === null ||
          (this.financials[0].absolute_maintenance_cost === null &&
            this.financials[0].maintenance_cost_per_kw === null)
        ) {
          this.financingDetailsForm.maintenance_cost =
            this.financials[0].maintenance_cost_per_kw || 0;
          this.maintenanceCostUnit = "relative";
        } else {
          this.financingDetailsForm.maintenance_cost =
            this.financials[0].absolute_maintenance_cost;
          this.maintenanceCostUnit = "absolute";
        }
      } else {
        //to reset all the keys when the new form option is used
        this.isFinancialsUndefined = true;
        this.financingDetailsForm["system_lifetime"] = null;
        this.financingDetailsForm["o_and_m_cost"] = null;
        this.financingDetailsForm["equipment_lifetime"] = null;
        this.financingDetailsForm["equipment_replacement_cost"] = null;
        this.financingDetailsForm.price = 0;
        this.financingDetailsForm.tax = this.IsUSFlag ? 0 : 8.9;
        this.financingDetailsForm.expected_life_years = 25;
        this.financingDetailsForm.discount_rate = this.IsUSFlag ? 0 : 1.5;
        this.financingDetailsForm.subsidy = 0;
        this.financingDetailsForm.maintenance_cost = 0;
        this.financingDetailsForm.ad_percentage = 0;
        this.financingDetailsForm.ad_years = 0;
        this.financingDetailsForm.ad_tax_slab = 0;
        this.priceUnit = this.IsUSFlag ? "absolute3": "relative";
        this.subsidyUnit = "relative";
        this.maintenanceCostUnit = "relative";
        this.financialPayment["payment_method_type"] = "cash";
        // console.log("#####payment methoad",this.financials[0]["payment_method"]);
        this.financialPayment["payment_method"] = "";
        this.financialPayment["priceUnit"] = this.priceUnit;
      }
      this.financingDetailsForm.maintenanceCostUnit = this.maintenanceCostUnit;
    },
    AddPricing() {
      this.isfinancialDetailsFormVisible = !this.isfinancialDetailsFormVisible;
      this.isPricingAdded = false;
      this.isFinancialsUndefined = false;
    },
    openEditForm() {
      this.isfinancialDetailsFormVisible = !this.isfinancialDetailsFormVisible;
      this.isEdited = true;
      this.isFinancialsUndefined = false;
      this.isPricingAdded = !this.isPricingAdded;
    },
    async deletePriceingMethod() {
      // debugger;
      this.showlogoutconfirmbox = true;
      this.isEdited = false;
      this.isFinancialsUndefined = true;
      this.isPricingAdded = false;

      try {
        await this.deleteFinancialInstrument(0, this.financials);
        this.$emit('isFormValid',true)
      } catch (error) {
        let errorMessage =
          error.response.status === 403
            ? "You don't have permission to edit this project."
            : "error";
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true,
        });
      }
      this.isDeletePriceingPopupOpen = false;
    },
    formatNumberWithCommas,
    formattedPriceWithUnits(computedString) {
      // var computedString = this.computedPrice;
      var matchedArr = computedString.match(/\d+\.?\d+/g);
      if (matchedArr) {
        var num = matchedArr[0];
        var formattedNum;
        if (this.currencySymbol === "₹")
          formattedNum = formatNumberWithCommas(num, true);
        else formattedNum = formatNumberWithCommas(num, false);
        var finalFormattedStr = computedString.replace(num, formattedNum);
        return finalFormattedStr;
      }
      return computedString;
    },
    isCrmUser,
  },
  watch: {
    isfinancialDetailsFormVisible() {
      if (this.isfinancialDetailsFormVisible) {
        // this.counter = this.counter + 1;
        this.assignFinancialDataToForm();
      }
    },
  },
};
</script>

<style scoped>
.card .card_header {
  height: 48px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.incentive-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 16px 16px 16px;
}

.card .incentive-header h4 {
    font-size: 16px;
    font-weight: 600 !important;
    color: #222;
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 600 !important;
  color: var(--primary);
}

.button_action .action_list .btn span.edit-alt {
  font-size: 24px !important;
}

.delete-alt {
  font-size: 20px !important;
}

.card_content_CRM {
  padding: 0px 16px 0px 16px;
}

.add_price_td_CRM {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  padding-top: 12px;
  padding-bottom: 44px;
}

.info_item {
  margin: 8px 0;
  max-width: 270px;
}

.info_item .label {
  font-size: 14px;
  color: #777;
  display: flex;
  align-items: center;
}

.info_item .value {
  font-size: 16px;
  color: #222;
  margin-top: 6px;
}
</style>
