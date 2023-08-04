<template>
  <div id="addIncentiveDialog">
    <el-dialog
      title="Add New Incentive"
      :visible="addIncDialogFormVisible"
      @close="closeIconHandller"
      :close-on-click-modal="false"
    >
      <el-form>
        <div
          class="floating-label right_value right_spacing"
          style="margin-left: 1rem;"
        >
          <label style="color: #222;">Incentive Name*</label>
          <input
            class="floating-input"
            type="text"
            name="incentiveName"
            v-model="incName"
          />
          <p class="formErrors" v-if="isError">
            <span style="color:red;">This field is required</span>
          </p>
        </div>
        <div
          class="floating-label right_value right_spacing"
          style="margin-left:1rem; padding-top:0.4rem;"
        >
          <label style="top:-1rem; left:0; font-size:12px;"
            >Incentive Type*</label
          >
          <div>
            <el-select v-model="incType" placeholder="Select Incentive Type">
              <el-option
                v-for="item in incTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <p class="formErrors" v-if="isTypeError">
              <span style="color:red;">The field is required</span>
            </p>
          </div>
        </div>

        <div
          v-if="incType === 'fixed_amount'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="Amount"
            v-model="fixedAmount"
            min="0"
          />
          <label>Amount*</label>
          <div class="value_area">
            <span class="currencySymbols">{{
              currencySymbolNameMap[currencyCode]
            }}</span>
          </div>
          <p class="formErrors" v-if="isAmountError">
            <span style="color:red;">The field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_cost_based' && isCapped"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="cap"
            v-model="costCap"
            min="0"
          />
          <label>Cap*</label>
          <div class="value_area">
            <span class="currencySymbols">{{
              currencySymbolNameMap[currencyCode]
            }}</span>
          </div>
          <p class="formErrors" v-if="iscapError">
            <span style="color:red;">The field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_cost_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="amountPercent"
            v-model="costAmoPercent"
            min="0"
          />
          <label>Amount Percent*</label>
          <div class="value_area">
            <span class="currencySymbols">%</span>
          </div>
          <p class="formErrors" v-if="isAmountPercentError">
            <span style="color:red;">The field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_production_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="returnRate"
            v-model="prodReturnRate"
            min="0"
            style="padding-right: 62px !important;"
          />
          <label>Return rate per kWh*</label>
          <div class="value_area">
            <span class="currencySymbols"
              >{{ currencySymbolNameMap[currencyCode] }}/kWh</span
            >
          </div>
          <p class="formErrors" v-if="isRateError">
            <span style="color:red;">This field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_production_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            style="padding-right: 62px !important;"
            name="escalationFactor"
            v-model="prodEscaFactor"
            min="0"
          />
          <label>Escalation Factor*</label>
          <div class="value_area">
            <span class="currencySymbols">%/Year</span>
          </div>
          <p class="formErrors" v-if="isEscaError">
            <span style="color:red;">This field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_production_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="duration"
            style="padding-right: 50px !important;"
            v-model="prodDuration"
            min="0"
          />
          <label>Duration in Years*</label>
          <div class="value_area">
            <span class="currencySymbols">Years</span>
          </div>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
          <p class="formErrors" v-if="isDurationError">
            <span style="color:red;">This field is required</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_size_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem; padding-top:0.4rem;"
        >
          <label style="top:-1rem; left:0; font-size:12px;">Based On*</label>
          <div>
            <el-select v-model="baseOn" placeholder="Select">
              <el-option
                v-for="item in basedOn"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div
          v-if="incType === 'system_size_based'"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="returnRate"
            v-model="sizeReturnRate"
            min="0"
            style="padding-right: 62px !important;"
          />
          <label>Return rate per kW*</label>
          <div class="value_area">
            <span class="currencySymbols"
              >{{ currencySymbolNameMap[currencyCode] }}/kW</span
            >
          </div>
          <p class="formErrors" v-if="isSizeError">
            <span style="color:red;">This field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          v-if="incType === 'system_size_based' && isCapped"
          class="floating-label right_value right_spacing"
          style="margin-left:1rem;"
        >
          <input
            class="floating-input"
            type="number"
            name="cap"
            v-model="sizeCap"
            min="0"
          />
          <label>Cap*</label>
          <div class="value_area">
            <span class="currencySymbols">{{
              currencySymbolNameMap[currencyCode]
            }}</span>
          </div>
          <p class="formErrors" v-if="isSizeCapError">
            <span style="color:red;">This field is required</span>
          </p>
          <p class="formErrors">
            <span>{{ errors.first("Tax") }}</span>
          </p>
        </div>
        <div
          style="display:flex; justify-content: space-between; margin: 1.2rem;"
        >
          <el-checkbox
            v-model="isCapped"
            v-if="
              incType === 'system_cost_based' || incType === 'system_size_based'
            "
            >Capped</el-checkbox
          >
          <div style="width: 12rem;">
            <el-select
              v-model="currency"
              filterable
              remote
              reserve-keyword
              @change="onCountryChange"
            >
              <el-option
                v-for="country in countryDetails"
                :key="country.id"
                :label="
                  `${country.currency_code} ${
                    currencySymbolNameMap[country.currency_code]
                      ? `(${currencySymbolNameMap[country.currency_code]}) ${
                          country.name
                        } `
                      : ''
                  }`
                "
                :value="country.id"
              />
            </el-select>
          </div>
        </div>
        <div v-if="incDesc.length">
          <div class="summaryHead">
            Summary
          </div>
          <div class="summaryDesc" style="word-break:keep-all;">
            {{ this.incDesc }}
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <div class="gridButton">
          <div class="button_area">
            <el-button
              :disabled="incName === '' || incType === ''"
              type="submit"
              class="btn btn-primary"
              :key="counter"
              :loading="isButtonLoading"
              @click="isValidated"
            >
              Add Incentive
            </el-button>
          </div>
        </div>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useGeographyStore } from "../../../stores/geography";
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import { QUOTA_TYPES_DC_CAP_SIZE } from "@/core/coreConstants";
import {
  USER_TIER,
  TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
  QUOTA_TYPE,
  TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
  exchangeRateTypes,
} from "@/pages/constants";
import API from "@/services/api/";
import { useProjectStore } from '../../../stores/project';

export default {
  name: "addIncentive",
  emits: ["close"],
  props: {
    addIncDialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },

  /*created() {
    this.fetchCountryDetails();
  },*/

  watch: {
    incName: {
      handler(val) {
        if (val === "") {
          this.isError = true;
        } else {
          this.isError = false;
        }
      },
    },
    currencyCode: {
      handler(val) {
        if (this.incType === "fixed_amount") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.fixedAmount} in the form of a cash grant.`;
        } else if (this.incType === "system_cost_based") {
          this.incDesc = `The system owner will receive ${
            this.costAmoPercent
          }% of the system cost in the form of a tax credit/rebate in year 1 with the Cap amount of ${
            currencySymbolNameMap[this.currencyCode]
          }${this.costCap}.`;
        } else if (this.incType === "system_production_based") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.prodReturnRate} per kWh produced for the first ${
            this.prodDuration
          } year with an Escalation Factor of ${
            this.prodEscaFactor
          }% per year.`;
        } else if (this.incType === "system_size_based") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.sizeReturnRate} per kW ${
            this.baseOn
          } installed (up to a maximum of ${
            currencySymbolNameMap[this.currencyCode]
          }${this.sizeCap}) in the form of a cash grant.`;
        } else {
          this.incDesc = "";
        }
      },
    },
    isCapped: {
      handler(val) {
        if (val === false) {
          console.log("isCapped");
          this.costCap = 0;
          this.sizeCap = 0;
        }
      },
    },
    incType: {
      handler(val) {
        this.isTypeError = false;
        if (val === "fixed_amount") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.fixedAmount} in the form of a cash grant.`;
        } else if (val === "system_cost_based") {
          if (this.costCap > 0) {
            this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1 with the Cap amount of ${currencySymbolNameMap[this.currencyCode]}${this.costCap}.`;
          } else {
            this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1.`;
          }
        } else if (val === "system_production_based") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.prodReturnRate} per kWh produced for the first ${
            this.prodDuration
          } year with an Escalation Factor of ${
            this.prodEscaFactor
          }% per year.`;
        } else if (val === "system_size_based") {
          this.incDesc = `The system owner will receive ${
            currencySymbolNameMap[this.currencyCode]
          }${this.sizeReturnRate} per kW ${
            this.baseOn
          } installed (up to a maximum of ${
            currencySymbolNameMap[this.currencyCode]
          }${this.sizeCap}) in the form of a cash grant.`;
        } else {
          this.incDesc = "";
        }
      },
    },
    fixedAmount: {
      handler(val) {
        if (val <= 0) {
          this.isAmountError = true;
        } else {
          this.isAmountError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.fixedAmount} in the form of a cash grant.`;
      },
    },
    costCap: {
      handler(val) {
        if (val <= 0 && this.isCapped) {
          this.iscapError = true;
        } else {
          this.iscapError = false;
        }
        if (this.costCap > 0) {
          this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1 with the Cap amount of ${currencySymbolNameMap[this.currencyCode]}${this.costCap}.`;
        } else {
          this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1.`;
        }
      },
    },
    costAmoPercent: {
      handler(val) {
        if (val <= 0) {
          this.isAmountPercentError = true;
        } else {
          this.isAmountPercentError = false;
        }
        if (this.costCap > 0) {
          this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1 with the Cap amount of ${currencySymbolNameMap[this.currencyCode]}${this.costCap}.`;
        } else {
          this.incDesc = `The system owner will receive ${this.costAmoPercent}% of the system cost in the form of a tax credit/rebate in year 1.`;
        }
      },
    },
    prodReturnRate: {
      handler(val) {
        if (val <= 0) {
          this.isRateError = true;
        } else {
          this.isRateError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.prodReturnRate} per kWh produced for the first ${
          this.prodDuration
        } year with an Escalation Factor of ${this.prodEscaFactor}% per year.`;
      },
    },
    prodDuration: {
      handler(val) {
        if (val <= 0) {
          this.isDurationError = true;
        } else {
          this.isDurationError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.prodReturnRate} per kWh produced for the first ${
          this.prodDuration
        } year with an Escalation Factor of ${this.prodEscaFactor}% per year.`;
      },
    },
    prodEscaFactor: {
      handler(val) {
        if (val <= 0) {
          this.isEscaError = true;
        } else {
          this.isEscaError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.prodReturnRate} per kWh produced for the first ${
          this.prodDuration
        } year with an Escalation Factor of ${this.prodEscaFactor}% per year.`;
      },
    },
    sizeReturnRate: {
      handler(val) {
        if (val <= 0) {
          this.isSizeError = true;
        } else {
          this.isSizeError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeReturnRate} per kW ${
          this.baseOn
        } installed (up to a maximum of ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeCap}) in the form of a cash grant.`;
      },
    },
    sizeCap: {
      handler(val) {
        console.log(val);
        if (val <= 0 && this.isCapped) {
          this.isSizeCapError = true;
        } else {
          this.isSizeCapError = false;
        }
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeReturnRate} per kW AC installed (up to a maximum of ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeCap}) in the form of a cash grant.`;
      },
    },
    baseOn: {
      handler(val) {
        this.incDesc = `The system owner will receive ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeReturnRate} per kW ${
          this.baseOn
        } installed (up to a maximum of ${
          currencySymbolNameMap[this.currencyCode]
        }${this.sizeCap}) in the form of a cash grant.`;
      },
    },
  },
  data() {
    return {
      isButtonLoading : false,
      counter: 0,
      isError: false,
      isTypeError: false,
      isRateError: false,
      isSizeError: false,
      isSizeCapError: false,
      isEscaError: false,
      isDurationError: false,
      isCappedError: false,
      isAmountError: false,
      isAmountPercentError: false,
      iscapError: false,
      chosenCurrencyCode: "",
      presetConversionFactor: null,
      currencyCodeChanged: null,
      customExchangeRateConversionFactorValidation: {
        required: true,
        min_value: 0.000001,
        decimal: 6,
      },
      currency: 52,
      prevConversionFactor: 0.0,
      currencyCode: "USD",
      isCapped: true,
      incDesc: "",
      incType: "",
      incName: "",
      fixedAmount: 0.0,
      costCap: 0.0,
      costAmoPercent: 0.0,
      prodReturnRate: 0.0,
      prodEscaFactor: 0.0,
      sizeReturnRate: 0.0,
      sizeCap: 0.0,
      prodDuration: 0.0,
      baseOn: "dc",

      incTypes: [
        {
          label: "Fixed Grant",
          value: "fixed_amount",
        },
        {
          label: "System Cost Based Grant",
          value: "system_cost_based",
        },
        {
          label: "System Production Based Grant",
          value: "system_production_based",
        },
        {
          label: "System Size Based Grant",
          value: "system_size_based",
        },
      ],
      basedOn: [
        {
          label: "AC",
          value: "ac",
        },
        {
          label: "DC",
          value: "dc",
        },
      ],
      formLabelWidth: "120px",
    };
  },
  computed: {
    // ...mapGetters('design', {
    //     financials: 'GET_FINANCIAL_DATA',
    // }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
    ...mapState(useGeographyStore, {
      countryDetails: "GET_COUNTRY_DETAILS",
    }),
  },

  nonReactiveData() {
    return {
      USER_TIER,
      QUOTA_TYPES_DC_CAP_SIZE,
      TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
      QUOTA_TYPE,
      TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
      currencySymbolNameMap,
      exchangeRateTypes,
    };
  },
  methods: {
    isValidated() {
      console.log("Is Validated");

      if (this.incName === "") {
        this.isError = true;
      }
      if (this.incType === "") {
        this.isTypeError = true;
      }
      const isFormValid = this.validate();
      if (!isFormValid) {
        return;
      }
      if (this.incName !== "" && this.incType !== "") {
        this.isError = false;
        this.isTypeError = false;
        this.postIncentives();
      }
    },
    validate() {
      let countValid = 0;
      if (this.incType === "fixed_amount" && this.fixedAmount <= 0) {
        this.isAmountError = true;
        countValid++;
      } else {
        this.isAmountError = false;
      }

      if (this.incType === "system_cost_based" && this.costCap <= 0 && this.isCapped) {
        this.iscapError = true;
        countValid++;
      } else {
        this.iscapError = false;
      }
      if (this.incType === "system_cost_based" && this.costAmoPercent <= 0) {
        this.isAmountPercentError = true;
        countValid++;
      } else {
        this.isAmountPercentError = false;
      }
      if (
        this.incType === "system_production_based" &&
        this.prodReturnRate <= 0
      ) {
        this.isRateError = true;
        countValid++;
      } else {
        this.isRateError = false;
      }
      if (
        this.incType === "system_production_based" &&
        this.prodEscaFactor <= 0
      ) {
        this.isEscaError = true;
        countValid++;
      } else {
        this.isEscaError = false;
      }
      if (this.incType === "system_size_based" && this.sizeReturnRate <= 0) {
        this.isSizeError = true;
        countValid++;
      } else {
        this.isSizeError = false;
      }

      if (this.incType === "system_size_based" && this.sizeCap <= 0 && this.isCapped) {
        this.isSizeCapError = true;
        countValid++;
      } else {
        this.isSizeCapError = false;
      }
      if (
        this.incType === "system_production_based" &&
        this.prodDuration <= 0
      ) {
        this.isDurationError = true;
        countValid++;
      } else {
        this.isDurationError = false;
      }

      if (countValid === 0) {
        return true;
      } else {
        return false;
      }
    },
    /*  defaultValues() {
      this.incType = "";
      this.incName = "";
      this.fixedAmount = 0.0;
      this.costCap = 1.0;
      this.costAmoPercent = 0.0;
      this.prodReturnRate = 0.0;
      this.prodEscaFactor = 0.0;
      this.sizeReturnRate = 0.0;
      this.sizeCap = 0.0;
      this.prodDuration = 0.0;
      this.baseOn = "";
      this.isError = false;
      this.isTypeError = false;
      this.incDesc = "";
    }, */
    onCountryChange(countryId) {
      // chosen is the one selected through dropdown
      const chosenCountryDetails = this.countryDetails.find(
        (country) => country.id === countryId
      );
      console.log(chosenCountryDetails);
      this.currencyCode = chosenCountryDetails.currency_code;
      // this.fixedAmount=(this.fixedAmount*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.costCap=(this.costCap*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.sizeCap=(this.sizeCap*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.prodReturnRate=(this.prodReturnRate*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.sizeReturnRate=(this.sizeReturnRate*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.prevConversionFactor=chosenCountryDetails.conversion_factor;
      const chosenCountryCurrencyCode = chosenCountryDetails.currency_code;
      this.chosenCurrencyCode = chosenCountryDetails.currency_code;
      console.log(currencySymbolNameMap[this.chosenCurrencyCode]);
      // console.log(this.projectInformation);
      //this.presetConversionFactor = parseFloat((Number(chosenCountryDetails.conversion_factor) / this.projectInformation.country_details.conversion_factor).toFixed(6));
      // this.currencyCodeChanged = chosenCountryCurrencyCode !== this.projectInformation.country_details.currency_code;
      // this.customExchangeRateConversionFactor = this.presetConversionFactor;
    },
    closeIconHandller() {
      //this.defaultValues();
      this.$emit("close");
    },
    async postIncentives() {
      this.isButtonLoading = true;
      let postData = {};

      if (this.incType === "fixed_amount") {
        postData = {
          name: this.incName,
          incentive_type: "fixed_amount",
          amount_required: this.fixedAmount,
          description: this.incDesc,
          is_capped: this.isCapped,
          country: this.currency,
        };
      } else if (this.incType === "system_cost_based") {
        postData = {
          name: this.incName,
          incentive_type: this.incType,
          amount_percentage: this.costAmoPercent,
          capped_amount: this.costCap,
          description: this.incDesc,
          is_capped: this.isCapped,
          country: this.currency,
        };
      } else if (this.incType === "system_production_based") {
        postData = {
          name: this.incName,
          incentive_type: this.incType,
          return_rate_per_kwh: this.prodReturnRate,
          escalation_factor: this.prodEscaFactor,
          duration: this.prodDuration,
          description: this.incDesc,
          is_capped: this.isCapped,
          country: this.currency,
        };
      } else if (this.incType === "system_size_based") {
        postData = {
          name: this.incName,
          incentive_type: this.incType,
          capped_amount: this.sizeCap,
          return_rate_per_kwh: this.sizeReturnRate,
          system_size_based_type: this.baseOn,
          description: this.incDesc,
          is_capped: this.isCapped,
          country: this.currency,
        };
      }

      try {
        const response = await API.INCENTIVE_INFORMATION.POST_NEW_INCENTIVE(
          postData
        );
        //this.defaultValues();
        this.$message({
          showClose: true,
          message: "Incentive added successfully.",
          type: "success",
          center: true
        });
        this.isButtonLoading = false;
        this.$emit("close");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
.right_spacing {
  margin-right: 1rem;
  width: -webkit-fill-available;
}
#addIncentiveDialog >>> .el-select {
  display: inline-block;
  position: relative;
  width: -webkit-fill-available;
}

#addIncentiveDialog >>> .el-dialog__footer {
  text-align: center !important;
  margin-top: 0 !important;
}

#addIncentiveDialog >>> .el-dialog {
  width: 57vh;
  border-radius: 8px;
}
#addIncentiveDialog >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}
#addIncentiveDialog >>> .el-dialog__header {
  padding-left: 1.6rem !important;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  justify-content: flex-start;
  background-color: #e8edf2;
  margin-bottom: 0 !important;
}
#addIncentiveDialog >>> .el-select > .el-input {
  display: block;
  color: #222 !important;
  font-size: 16px;
  /* padding: 10px 16px; */
  display: block;
  width: 100%;
  height: 40px;
  background-color: var(--step-50);
  border: none;
  border-radius: 4px;
}

#addIncentiveDialog >>> .floating-label {
  margin-bottom: 40px !important;
}

#addIncentiveDialog >>> .currencySymbols {
  font-size: 16px !important;
  color: #222 !important;
}

#addIncentiveDialog >>> .floating-label label {
  font-family: "Helvetica Neue";
  font-size: 14px !important;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 0.5;
  letter-spacing: normal;
  text-align: left;
  color: #222 !important;
  font-size: 14px !important;
  font-weight: normal;
  position: absolute;
}

#incentiveList >>> .floating-label label {
  color: #222 !important;
}

#addIncentiveDialog >>> .floating-input {
  color: #222;
  font-size: 16px;
  padding: 10px 16px;
  padding-right: 27px;
  display: block;
  width: 100%;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}

#addIncentiveDialog >>> .el-select .el-input .el-select__caret {
  color: #222 !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

#addIncentiveDialog >>> .el-input__suffix{
  top: 5px !important;
}

#addIncentiveDialog >>> .el-dialog__title {
  font-family: "Helvetica Neue" !important;
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  color: #222222 !important;
}

#addIncentiveDialog >>> .el-checkbox__label {
  font-family: "Helvetica Neue";
  position: relative;
  font-size: 16px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  /* line-height: 4.38; */
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

#addIncentiveDialog >>> #currencySelect {
  width: auto;
}

#addIncentiveDialog >>> .el-checkbox:last-child {
  display: flex;
  flex-direction: row-reverse;
  margin-left: 1.5rem;
}

#addIncentiveDialog >>> .el-checkbox__inner {
  position: relative;
  border-radius: 2px;
  border: solid 1px #ccc;
}

#addIncentiveDialog >>> .el-dialog__wrapper {
  overflow: hidden !important;
  top: -18px !important;
  max-height: 96vh !important;
}
#addIncentiveDialog >>> .el-input--suffix .el-input__inner {
  background-color: var(--step-50) !important;
  height: 48px !important;
  border: none !important;
  color: #222 !important;
}

#addIncentiveDialog >>> .el-input--suffix .el-input__inner::placeholder {
  color: #222 !important;
}



#addIncentiveDialog >>> .btn.btn-primary {
  height: 3rem;
  width: 11rem;
  font-size: 16px !important;
  color: white !important;
  border: 0 !important;
}

#addIncentiveDialog >>> .btn.btn-primary:disabled,
.btn.btn-primary.disabled {
  background-image: linear-gradient(to bottom, #f1f1f1, #ddd);
}

#addIncentiveDialog >>> .el-dialog__body {
  max-height: 67vh;
  overflow: scroll;
  padding-top: 44px !important;
}

#addIncentiveDialog >>> .floating-label.right_value .value_area {
  font-size: 16px !important;
}

.summaryDesc {
  font-size: 15px !important;
  margin: 0 1rem 1rem 1rem !important;
  color: #777777 !important;
}
.summaryHead {
  font-size: 14px !important;
  margin: 1rem 1rem 0.5rem 1rem !important;
  color: #777777 !important;
}

.formErrors{
  margin-top: 8px;
  color: #ff0000;
}

@media (max-width: 430px) {
  #addIncentiveDialog >>> .el-dialog {
    width: 89%;
    border-radius: 8px;
  }

  .summaryDesc {
    font-size: 13px !important;
  }
  .summaryHead {
    font-size: 12px !important;
  }

  #addIncentiveDialog >>> .floating-label.right_value .value_area {
    font-size: 14px !important;
  }

  #addIncentiveDialog >>> .el-checkbox__label {
    font-size: 14px;
  }

  #addIncentiveDialog >>> .el-dialog__title {
    font-size: 14px !important;
  }

  #addIncentiveDialog >>> .floating-input {
    font-size: 14px;
  }

  #addIncentiveDialog >>> .currencySymbols {
    font-size: 14px !important;
  }

  
}

#incentiveList[data-v-6224d5a8] .floating-label label {
  color: #222 !important;
}
</style>
