<template>
  <div id="elForm">
    <el-dialog
      :visible="isfinancialDetailsFormVisible"
      :close-on-click-modal="false"
      @close="closefinancialDetailsForm"
      class="delete_module"
    >
      <div class="tittle" slot="title">
        <h4 class="headerHeading">
          {{ isEdited ? "Edit Pricing" : "Add Pricing" }}
        </h4>
      </div>
      <form class="inside_form">
        <div class="scroll_content edit-form">
          <div class="container">
            <div class="floating-form">
              <div class="gridView">
                <div class="gridItem">
                  <!-- Price Input starts here---------------------- -->
                  <div class="floating-label right_value right_spacing">
                    <input
                      class="floating-input"
                      v-validate="priceValidation"
                      type="Number"
                      name="price"
                      v-model="financingDetailsForm.price"
                      @input="Isprice()"
                    />
                    <p
                      class="formErrors"
                      style="color: red"
                      v-show="errors.has('price')"
                    >
                      {{ errors.first('price') }}
                    </p>
                    <label>Price*</label>
                    <div class="value_area">
                      <span>
                        <select
                          class=""
                          id=""
                          v-model="priceUnit"
                          @change="IsPriceUnit()"
                        >
                          <option value="relative" v-if="isNotGazebo">{{ currencySymbol }}/kW</option>
                          <option value="absolute">{{ currencySymbol }}</option>
                          <option value="absolute3" v-if="isNotGazebo">{{ currencySymbol }}/W</option>
                        </select>
                      </span>
                    </div>
                    <p class="formErrors">
                      <span>{{ errors.first("Price") }}</span>
                    </p>
                  </div>
                  <!-- Price Input ends here---------------------- -->
                  <!-- Tax Input starts here---------------------- -->
                  <div class="floating-label right_value right_spacing">
                    <input
                      class="floating-input"
                      type="Number"
                      name="tax"
                      v-validate="taxValidation"
                      v-model="financingDetailsForm.tax"
                      @input="IsTax()"
                    />
                    <label>{{ taxType }}</label>
                    <div class="value_area">
                      <span>%</span>
                    </div>
                    <p
                      class="validationCss"
                      style="color: red"
                      v-show="errors.has('tax')"
                    >
                      {{ errors.first('tax') }}
                    </p>
                  </div>
                  <!-- Price Input starts here---------------------- -->
                </div>
                <div class="gridItem">
                  <!-- Expected Life Input starts here---------------------- -->
                  <div class="floating-label right_value right_spacing">
                    <input
                      class="floating-input"
                      type="Number"
                      name="expected life years"
                      v-validate="expectedLifeValidation"
                      v-model="financingDetailsForm.expected_life_years"
                      @input="IsLifeYears()"
                    />
                    <p class="formErrors" v-show="errors.has('expected life years')">
                      <span>{{ errors.first("expected life years") }}</span>
                    </p>
                    <label>Expected Life*</label>
                    <div class="value_area">
                      <span>Years</span>
                    </div>
                    <p class="formErrors">
                      <span>{{ errors.first("Expected Life") }}</span>
                    </p>
                    <p
                      v-if="expected_life_years_Exceeds"
                      class="validationCss"
                      style="color: red"
                    >
                      {{ Exceeds_expected_life_years }}
                    </p>
                  </div>
                  <!-- Expected Life Input ends here---------------------- -->
                  <!-- Discount Rate Input starts here---------------------- -->
                  <div
                    class="floating-label right_value right_spacing"
                    style="width: -webkit-fill-available"
                  >
                    <input
                      class="floating-input"
                      v-validate="discountRateValidation"
                      type="Number"
                      name="discount rate"
                      v-model="financingDetailsForm.discount_rate"
                      @input="IsDiscountRate()"
                    />
                    <p class="formErrors" v-show="errors.has('discount rate')">
                      <span>{{ errors.first("discount rate") }}</span>
                    </p>
                    <label>Discount Rate</label>
                    <div class="value_area">
                      <span>%</span>
                    </div>
                  </div>
                  <!-- Discount Rate Input ends here---------------------- -->
                </div>
                <div class="gridItem">
                  <!-- <div class="floating-label right_value right_spacing">
                      <input
                        class="floating-input"
                        type="text"
                        v-model="financingDetailsForm.subsidy"
                        @input="IsSubsidy()"
                      />
                      <p
                        v-if="subsidyInvalid"
                        class="validationCss"
                        style="color: red"
                      >
                        {{ SubsidyInvalid }}
                      </p>
                      <label>Subsidy*</label>
                      <div class="value_area">
                        <select v-model="subsidyUnit">
                          <option value="relative">%</option>
                          <option value="absolute">{{ currencySymbol }}</option>
                        </select>
                      </div>
                    </div> -->
                  <!--Maintenance Cost Input starts here---------------------- -->
                  <div class="floating-label right_value right_spacing">
                    <input
                      class="floating-input"
                      type="Number"
                      min="0"
                      v-model="financingDetailsForm.maintenance_cost"
                      @input="IsMaintenanceCost()"
                    />
                    <!-- <p
                      v-if="maintenance_costInvalid"
                      class="validationCss"
                      style="color: red"
                    >
                      {{ Maintenance_costInvalid }}
                    </p> -->
                    <label>Maintenance Cost</label>
                    <div class="value_area">
                      <select v-model="maintenanceCostUnit">
                        <option value="relative" v-if="isNotGazebo">
                          {{ currencySymbol }}/kW/year
                        </option>
                        <option value="absolute">
                          {{ currencySymbol }}/year
                        </option>
                      </select>
                    </div>
                  </div>
                  <!--Maintenance Cost Input ends here---------------------- -->
                </div>
              </div>
              <div class="floating-label right_value" style="color: #1c3366">
                Accelerated Depreciation
              </div>
              <div class="gridItem">
                <!--Accelerated Percentage Input starts here---------------------- -->
                <div class="floating-label right_value right_spacing">
                  <input
                    class="floating-input"
                    type="Number"
                    name="accelerated depreciation percentage"
                    v-model="financingDetailsForm.ad_percentage"
                    v-validate="discountRateValidation"
                    @input="isad_Percentage()"
                  />
                  <p class="formErrors" v-show="errors.has('accelerated depreciation percentage')">
                    <span> {{ errors.first("accelerated depreciation percentage") }} </span>
                  </p>
                  <label>Percentage</label>
                  <div class="value_area">
                    <span>%</span>
                  </div>
                </div>
                <!--Accelerated Percentage Input ends here---------------------- -->
                <!--Accelerated Years Input starts here---------------------- -->
                <div class="floating-label right_value right_spacing">
                  <input
                    class="floating-input"
                    type="Number"
                    name="accelerated depreciation years"
                    v-model="financingDetailsForm.ad_years"
                    v-validate="adYearsValidation"
                    @input="isad_years()"
                  />
                  <p class="formErrors" v-show="errors.has('accelerated depreciation years')">
                    <span> {{ errors.first("accelerated depreciation years") }} </span>
                  </p>
                  <label>Years</label>
                  <div class="value_area">
                    <span>Years</span>
                  </div>
                  <p class="formErrors">
                    <span>{{ errors.first("Accelerated Years") }}</span>
                  </p>
                </div>
                <!--Accelerated Years Input ends here---------------------- -->
              </div>
              <div class="gridItem">
                <!--Accelerated Tax Slab Input starts here---------------------- -->
                <div class="floating-label right_value right_spacing">
                  <input
                    class="floating-input"
                    type="Number"
                    v-validate="taxValidation"
                    min="0"
                    name="tax-slab"
                    v-model="financingDetailsForm.ad_tax_slab"
                    @input="isTaxSlab()"
                  />
                  <p
                    class="validationCss"
                    style="color: red"
                    v-show="errors.has('tax-slab')"
                  >
                    {{ errors.first('tax-slab') }}
                  </p>
                  <label>Tax Bracket</label>
                  <div class="value_area">
                    <span>%</span>
                  </div>
                  <p class="formErrors">
                    <span> {{ errors.first("Accelerated Tax Slab") }} </span>
                  </p>
                </div>
                <!--Accelerated Tax Slab Input ends here---------------------- -->
              </div>
            </div>
            <div class="containerTwo">
              <div class="containerTwoBox">
                <!-- ----------------dropdowns--------- -->
                <div class="dropdowns">
                  <el-form>
                    <el-select
                      v-model="selectedTypeOfFinancial"
                      @change="onChangeFinancialtype()"
                      placeholder="Select"
                    >
                      <el-option
                        v-for="item in typeOfFinancial"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                    <el-select
                      v-if="!isCashTypeOfFinancialSelected"
                      :disabled="loading"
                      v-model="selectedTemplate"
                      placeholder="Select Template"
                    >
                      <el-option
                        v-for="(template, index) in loanData"
                        :key="index"
                        :label="template.name"
                        :value="template.id"
                        :summary="template.description"
                        class="loanDropdownTwo"
                        ><h3 class="labelDropdown">{{ template.name }}</h3>
                        <p class="descDropdown">{{ template.description }}</p>
                        <hr class="dataLine" />
                      </el-option>
                      <infinite-loading
                        :distance="0"
                        spinner="bubbles"
                        @infinite="loadMoreFinancial"
                      >
                        <div
                          slot="no-more"
                          style="color: #606266; font-size: 12px"
                        ></div>
                        <div
                          slot="error"
                          style="color: #606266; font-size: 12px"
                        ></div>
                        <div
                          slot="no-results"
                          style="color: #606266; font-size: 12px"
                        ></div>
                      </infinite-loading>
                    </el-select>
                    <p class="totalCost" v-if="isCashTypeOfFinancialSelected">
                      Total Cost
                    </p>
                    <h4
                      class="totalCostRupee"
                      v-if="isCashTypeOfFinancialSelected"
                    >
                      {{ currencySymbol }}{{ finalCost }}
                    </h4>
                  </el-form>
                </div>
                <div v-if="!isCashTypeOfFinancialSelected">
                  <!-- ------------summary---------- -->
                  <div class="summaryContainer">
                    <h4 class="heading">Monthly Payment</h4>
                    <div v-if="isTemplateSelected == true">
                      <div v-if="monthlyPayment.length != undefined">
                        <span
                          v-for="(month, index) in monthlyPayment"
                          :key="index"
                        >
                          <span v-if="month != null"
                            >{{ currencySymbol }} {{ month }}
                            <span
                              v-if="
                                  index < monthlyPayment.length - 1 &&
                                    monthlyPayment[index + 1] !== null
                                "
                              >|</span
                            >
                          </span>
                        </span>
                      </div>
                      <div v-else>
                        <span>{{ currencySymbol }}{{ monthlyPayment }}</span>
                      </div>
                    </div>
                    <div v-else>{{ currencySymbol }} 0</div>
                    <p class="summary" style="margin-top: 10px">
                      The financial information on this proposal may not be an
                      exact representation of your actual financing loan
                      agreement.
                    </p>
                  </div>
                  <!-- -------------details--------- -->
                  <div
                    class="paymentEscalationContainer"
                    v-if="selectedTypeOfFinancial == 'ppa'"
                  >
                    <div class="paymentEscalation">
                      <p class="payment">Upfront Payments</p>
                      <h3 class="values">
                        {{ currencySymbol }}{{ upfront_payment }}
                      </h3>
                    </div>
                    <div class="paymentEscalation">
                      <p class="payment">PPA Esclation</p>
                      <h3 class="values">
                        <span>{{ ppa_escalation_rate }}% per year</span>
                      </h3>
                    </div>
                    <div class="paymentEscalation">
                      <p class="payment">PPA Rate</p>
                      <h3 class="values">
                        {{ currencySymbol }}{{ ppa_rate }}/kWh
                      </h3>
                    </div>
                  </div>
                  <!-- -------------details--------- -->
                  <div
                    class="paymentEscalationContainer"
                    v-else-if="selectedTypeOfFinancial == 'lease'"
                  >
                    <div class="paymentEscalation">
                      <p class="payment">Upfront Payments</p>
                      <h3 class="values">
                        {{ currencySymbol }}{{ upfront_payment }}
                      </h3>
                    </div>
                    <div class="paymentEscalation">
                      <p class="payment">lease Esclation</p>
                      <h3 class="values">
                        <span>{{ escalation_rate }} </span>% per year
                      </h3>
                    </div>
                  </div>
                  <!-- -------------details--------- -->
                  <div
                    v-else
                    style="
                        display: grid;
                        column-gap: 50px;
                        grid-template-columns: auto auto;
                        row-gap: 30px;
                      "
                  >
                    <!-- <div class="paymentEscalationContainer" > -->
                    <div class="paymentEscalation">
                      <p class="payment">Down Payments</p>
                      <h3 class="values">
                        {{ currencySymbol }}{{ down_payment }}
                      </h3>
                    </div>
                    <div class="paymentEscalation">
                      <p class="payment">Interest Rate ( per year )</p>
                      <h3 v-if="interest_rate != null" class="values">
                        {{ interest_rate }}%
                      </h3>
                      <h3 v-else class="values">
                        {{ interest_rate_for_term_one }}% | {{
                        interest_rate_for_term_two }}%
                      </h3>
                    </div>
                    <!-- </div>  -->
                    <!-- <div class="paymentEscalationContainer" > -->
                    <div class="paymentEscalation">
                      <p class="payment">Loan Principal</p>
                      <h3 class="values">
                        {{ currencySymbol }}{{ loan_principal }}
                      </h3>
                    </div>
                    <div class="paymentEscalation">
                      <p class="payment">Loan Term (Years)</p>
                      <h3 class="values">
                        <span v-if="computedDuration.years != 0"
                          >{{ computedDuration.years }} Year(s)</span
                        >
                        <span
                          v-if="
                              computedDuration.years != 0 && computedDuration.months != 0
                            "
                        >
                          and
                        </span>
                        <span v-if="computedDuration.months != 0"
                          >{{ computedDuration.months }} Month(s)</span
                        >
                      </h3>
                    </div>
                    <!-- </div> -->
                  </div>
                </div>
                <el-button
                  v-if="
                      this.Update === true && financingDetailsForm.price != 0 
                    "
                  type="primary"
                  class="boxBtn"
                  @click="updateCalculationBaseOnPrice()"
                  >Update Calculation</el-button
                >
              </div>
            </div>
          </div>
        </div>
      </form>
      <div class="gridButton" slot="footer">
        <el-button
          type="primary"
          class="button"
          :loading="isButtonLoading"
          :disabled= "errors.items.length > 0"
          @click.prevent="confirmFinancialFormData"
        >
          <span> {{ isEdited ? "Update Pricing" : "Add Pricing" }} </span>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>



<script>
// import { ObjectLoader } from 'three';
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../../stores/design";
import { useProjectStore } from "../../../../stores/project";
import { checkTwoDecimalPointValidation,} from "../../../../core/utils/utils.js"
import { formatNumberWithCommas } from "../../../../utils";
import axios from "axios";
import API from "@/services/api/";
import Vue from "vue";
import InfiniteLoading from "vue-infinite-loading";
Vue.use(InfiniteLoading);

export default {
  name: "designFinancialEditDialog",
  props: {
    financialPaymentData: {
      type: Object,
      default: {
        payment_method_type: "Cash",
        payment_method: "",
      },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isfinancialDetailsFormVisible: {
      type: Boolean,
      default: false,
    },
    financingDetailsData: {
      type: Object,
      default: {
        id: "",
        system_lifetime: null,
        o_and_m_cost: null,
        equipment_lifetime: null,
        equipment_replacement_cost: null,
        price: null,
        tax: null,
        expected_life_years: null,
        discount_rate: null,
        subsidy: null,
        ad_percentage: null,
        ad_years: null,
        ad_tax_slab: null,
        maintenance_cost: null,
      },
    },
    isFinancialsUndefined: {
      type: Boolean,
      default: false,
    },
    isPricingAdded: {
      type: Boolean,
      default: false,
    },
    isNotGazebo: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      finalCostNum: 0,
      pricee: 0, 
      finalCost: 0,
      maintenance_cost: null,
     isButtonLoading: false,
      Update: false,
      financialPaymentBox: {},
      selectedTemplate: "",
      monthlyPayment: ["0", null, null],
      pri: {
        required: true,
      },
      priceValidation: {
        required: true,
        above_zero: true,
      },
      taxValidation: {
        min_value: 0,
        max_value: 100,
      },
      discountRateValidation: {
        required: true,
        min_value: 0,
        max_value: 100,
      },
      expectedLifeValidation: {
        required: true,
        above_zero: true,
        max_value: 50,
      },
      adYearsValidation:{
        min_value: 0,
        max_value: 25,
      },
      interest_rate_for_term_one: 0,
      interest_rate_for_term_two: 0,
      interest_rate: 0,
      down_payment: 0,
      loan_principal: 0,
      loan_term: 0,
      upfront_payment: 0,
      ppa_rate: 0,
      ppa_escalation_rate: 0,
      selectedTypeOfFinancial: "cash",
      escalation_rate: 0,
      loading: false,
      previousUrl: "",
      totalCount: "",
      loanData: [],
      nextUrl: "",
      isCashTypeOfFinancialSelected: false,
      isTemplateSelected: false,
      totalCost: 0,
      ad_percentageInvalid: false,
      ad_tax_slabInvalid: false,
      ad_yearsInvalid: false,
      discount_rateInvalid: false,
      expected_life_yearsInvalid: false,
      idInvalid: false,
      maintenance_costInvalid: false,
      priceInvalid: false,
      priceDecimal:false,
      subsidyInvalid: false,
      taxInvalid: false,
      expected_life_years_Exceeds:false,
      typeOfFinancial: [
        {
          value: "cash",
          label: "Cash Payment",
        },
        {
          value: "loan",
          label: "Loan",
        },
        {
          value: "ppa",
          label: "PPA",
        },
        {
          value: "lease",
          label: "Lease",
        },
      ],
      value: "",
      msg: "I am in designFinancialEditDialog",
      financials: this.financials,
      financingDetailsForm: {
        ad_percentage: 0,
        ad_tax_slab: 0,
        ad_years: 0,
        discount_rate: 0,
        expected_life_years: 0,
        id: 0,
        maintenance_cost: 0,
        price: 0,
        subsidy: 0,
        tax: 0,
      },
      TaxInvalid: "* Tax Field Is Required",
      Discount_rateInvalid: "* Discount Rate Field is Required ",
      Ad_percentageInvalid: "* Ad Percentage  Field is Required ",
      Ad_tax_slabInvalid: "* Ad tax Slab is Required",
      Ad_yearsInvalid: " * Ad Years Field Is Required",
      IdInvalid: "* Id Field Is Required",
      Maintenance_costInvalid: "* Maintennace Cost Fiels Is Required",
      PriceInvalid: "* Price Field Is Required",
      SubsidyInvalid: "* Subsidy Field Is Required",
      Expected_life_yearsInvalid: "* Expected Life Years IS Required",
      DecimalPoint: "* Price field may contain 1 or 2 decimal points.",
      Exceeds_expected_life_years:"Expected life should be less than 100.",
      priceUnit: "relative",
      subsidyUnit: "relative",
      maintenanceCostUnit: "relative",
      subsidyUnit: "relative",
      taxType: 'Sales Tax',
    };
  },
  computed: {
    ...mapState(useDesignStore, {
      summary: "GET_DESIGN_INFORMATION",
      designPathData: 'GET_DESIGN_PATH_DATA',
      designDataFull: (state) => state
    }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
      currencyCode: state => state.country_details.currency_code
    }),
    defaultPriceUnit() {
      return this.isNotGazebo == true ? this.financialPaymentBox.priceUnit : "absolute"
    },
    defaultMaintenanceCostUnit() {
      if(this.isNotGazebo){
        return this.financingDetailsForm.maintenanceCostUnit;
      } else {
        return "absolute"
      }
    },
    computedDuration: {
      get() {
        return {
          years: parseInt(this.loan_term / 12),
          months: this.loan_term % 12,
        };
      },
    },
  },
  created() {
    this.financingDetailsForm = this.$props.financingDetailsData;
    if (this.selectedTypeOfFinancial == "cash") {
      this.isCashTypeOfFinancialSelected = true;
    } else {
      this.isCashTypeOfFinancialSelected = false;
    }
    // if(typeof this.financialPaymentBox == 'object'){
    //   console.log("@@@@@financialPaymentBox payment methoad",this.financialPaymentBox.payment_method_type);
    // this.selectedTypeOfFinancial = this.financialPaymentBox.payment_method_type
    // }
    const user = JSON.parse(localStorage.getItem("user")) || {};
    if(user.country === 91) this.taxType = 'GST'

  },
  watch: {
    isfinancialDetailsFormVisible(newVal) {
      // setTimeout(myGreeting, 5000);
      this.financialPaymentBox = this.$props.financialPaymentData;
      this.selectedTypeOfFinancial = this.financialPaymentBox.payment_method_type;
      this.selectedTemplate = this.financialPaymentBox.payment_method;
      this.priceUnit =  this.isNotGazebo == true ? this.financialPaymentBox.priceUnit : "absolute";
      this.maintenanceCostUnit = this.isNotGazebo ? this.financingDetailsForm.maintenanceCostUnit : "absolute";
      if (this.selectedTypeOfFinancial == "cash") {
        this.selectedTemplate = "";
      }
      this.getCalculatedData();
    },
    /*  "financingDetailsForm.ad_percentage": {
      handler(val) {
        if (val == "") {
          this.ad_percentageInvalid = true;
        } else {
          this.ad_percentageInvalid = false;
        }
      },
    }, */
    /*  "financingDetailsForm.ad_tax_slab": {
      handler(val) {
        if (val == "") {
          this.ad_tax_slabInvalid = true;
        } else {
          this.ad_tax_slabInvalid = false;
        }
      },
    }, */
    /*  "financingDetailsForm.ad_years": {
      handler(val) {
        if (val == "") {
          this.ad_yearsInvalid = true;
        } else {
          this.ad_yearsInvalid = false;
        }
      },
    }, */
    /* "financingDetailsForm.discount_rate": {
      handler(val) {
        if (val == "") {
          this.discount_rateInvalid = true;
        } else {
          this.discount_rateInvalid = false;
        }
      },
    },
    "financingDetailsForm.expected_life_years": {
      handler(val) {
        if (val == "") {
          this.expected_life_yearsInvalid = true;
        } else {
          this.expected_life_yearsInvalid = false;
        }
      },
    },
    "financingDetailsForm.id": {
      handler(val) {
        if (val == "") {
          this.idInvalid = true;
        } else {
          this.idInvalid = false;
        }
      },
    },
    "financingDetailsForm.maintenance_cost": {
      handler(val) {
        if (val == "") {
          this.maintenance_costInvalid = true;
        } else {
          this.maintenance_costInvalid = false;
        }
      },
    },
    "financingDetailsForm.price": {
      handler(val) {
        if (val == "") {
          console.log("price invalid", this.priceInvalid);
          this.priceInvalid = true;
        } else {
          this.priceInvalid = false;
        }
      },
    },
    "financingDetailsForm.subsidy": {
      handler(val) {
        if (val == "") {
          console.log("subsidyInvalid invalid", this.subsidyInvalid);
          this.subsidyInvalid = true;
        } else {
          this.subsidyInvalid = false;
        }
      },
    },*/
    "financingDetailsForm.tax": {
      handler(val) {
        if (val == "") {
          this.taxInvalid = true;
        } else {
          this.taxInvalid = false;
        }
      },
    }, 
    selectedTypeOfFinancial(newval) {
      // console.log("####calling type of financial");
      if (newval == "cash") {
        this.isCashTypeOfFinancialSelected = true;
      } else {
        this.isCashTypeOfFinancialSelected = false;
      }
      this.getData();
    },
    selectedTemplate(newVal) {
      this.getCalculatedData(newVal);
    },
  },
  methods: {
    ...mapActions(useDesignStore, [
      "UPDATE_DESIGN_FINANCIAL_DETAILS",
      "POST_FINANCIAL_DETAILS",
    ]),
    updateCalculationBaseOnPrice() {
      this.getCalculatedData();
      this.Update = false;
    },
    onChangeFinancialtype() {
      this.selectedTemplate = "";
    },
    handleClose(){
      this.dialogOpen =false;
    },
    async confirmFinancialFormData() {
      this.Update = true;
      this.dialogOpen = false;
      let isFormValid = false;
      
      this.financingDetailsForm.discount_rate = this.financingDetailsForm.discount_rate || 0
      await this.$validator.validateAll().then((result)=> {
        if (!result) {
          // validation failed, display error messages
          const errors = this.$validator.errors.all();
          // do something with the errors, such as displaying them in a div on the page
        } else {
          isFormValid = true
          // validation passed, submit the form normally
        }
      });
      console.log(isFormValid);
      if (isFormValid) {
        this.isButtonLoading = true;
        let subsidy_percentage_value = "";
        let subsidy_amount_value = "";
        let price_per_kw_value = "";
        let absolute_price_value = "";
        let price_per_watt = "";
        if (this.priceUnit === "relative") {
          price_per_kw_value = this.financingDetailsForm.price;
          absolute_price_value = null;
          price_per_watt = null;
        } else if(this.priceUnit === "absolute3"){
          price_per_kw_value = null;
          absolute_price_value = null;
          price_per_watt =  this.financingDetailsForm.price;
        }else{
          price_per_kw_value = null;
          price_per_watt = null;
          absolute_price_value = this.financingDetailsForm.price;
        }
        if (this.subsidyUnit === "relative") {
          subsidy_percentage_value = this.financingDetailsForm.subsidy;
          subsidy_amount_value = null;
        } else {
          subsidy_percentage_value = null;
          subsidy_amount_value = this.financingDetailsForm.subsidy;
        }
        //data to be post/patch
        let postData = {
          expected_life_years: this.financingDetailsForm.expected_life_years,
          tax: this.financingDetailsForm.tax,
          ad_years: this.financingDetailsForm.ad_years,
          ad_percentage: this.financingDetailsForm.ad_percentage,
          ad_tax_slab: this.financingDetailsForm.ad_tax_slab,
          discount_rate: this.financingDetailsForm.discount_rate,
          design: this.$route.params["designId"] || this.designDataFull.id,
          subsidy_percentage: subsidy_percentage_value,
          payment_method_type: this.selectedTypeOfFinancial,
          payment_method: this.selectedTemplate,
          subsidy_amount: subsidy_amount_value,
          price_per_kw: price_per_kw_value,
          absolute_price: absolute_price_value,
          price_per_watt : price_per_watt,
          absolute_maintenance_cost:
            this.maintenanceCostUnit === "absolute"
              ? this.financingDetailsForm.maintenance_cost
              : null,
          maintenance_cost_per_kw:
            this.maintenanceCostUnit === "relative"
              ? this.financingDetailsForm.maintenance_cost
              : null,
        };
        //checking if this is is a new form or edit one
        if (this.isPricingAdded || !this.isFinancialsUndefined) {
          try {
            await this.UPDATE_DESIGN_FINANCIAL_DETAILS(postData)
            this.$emit("isFormValid",isFormValid)
            this.isButtonLoading = false;
            this.closefinancialDetailsForm();
          } catch (e) {
            this.displayError(e);
          }
        } else {
          try {
            await this.POST_FINANCIAL_DETAILS(postData);
            this.$emit("isFormValid",isFormValid)
            this.isButtonLoading = false;
            this.closefinancialDetailsForm();
          } catch (e) {
            this.displayError();
          }
        }
      }
    },
    getTotalCost() {
      if (this.priceUnit == "relative") {
        this.totalCost =
          this.financingDetailsForm.price * this.summary.nameplateDcSize;
      } else if(this.priceUnit == "absolute3"){
         this.financingDetailsForm.price * this.summary.nameplateDcSize * 1000;
      }else{
        this.totalCost = this.financingDetailsForm.price;
      }
    },
    getCalculatedData() {
              // this.finalCost = this.financingDetailsForm.price;
      this.financingDetailsForm.discount_rate = this.financingDetailsForm.discount_rate || 0

              if (this.priceUnit == "relative") {
        this.totalCost =
          Math.round(
            this.financingDetailsForm.price *
              this.summary.nameplateDcSize *
              1000
          ) / 1000;
        } else if(this.priceUnit == "absolute3"){
            this.totalCost =
          Math.round(
            this.financingDetailsForm.price *
              this.summary.nameplateDcSize *
              1000 * 1000
          ) / 1000;
        }else {
        this.totalCost =
          Math.round(this.financingDetailsForm.price * 1000) / 1000;
        }
        this.finalCost = this.totalCost;
        if(this.financingDetailsForm.tax){
          this.finalCost += this.finalCost * this.financingDetailsForm.tax / 100;
        }
        this.finalCostNum = this.finalCost;
        this.finalCost = parseFloat(this.finalCost).toFixed(2);
        this.finalCost = formatNumberWithCommas(this.finalCost, this.currencyCode == "INR")
// if (this.maintenanceCostUnit == "relative" &&  this.financingDetailsForm.maintenance_cost){
//   this.maintenance_cost = this.financingDetailsForm.maintenance_cost * this.summary.nameplateDcSize;
// }
// else{
//   this.maintenance_cost = this.financingDetailsForm.maintenance_cost;
// }

// if(!this.maintenance_cost){
//   this.maintenance_cost = 0;
// }

// var totalMaintenanceCost = this.maintenance_cost * this.financingDetailsForm.expected_life_years;
// console.log(totalMaintenanceCost);
// this.finalCost= this.finalCost + totalMaintenanceCost;
// console.log("total cost after adding maintainence", this.finalCost);

// if(this.financingDetailsForm.subsidyUnit == "relative"){
//   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_percentage_value/100; 
// }
// else if(this.financingDetailsForm.subsidy_amount_value){
//   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_amount_value;
// }

// console.log("Cost after subsidy",this.finalCost);
// if (this.financingDetailsForm.o_and_m_cost  && this.financingDetailsForm.system_lifetime){
//   this.finalCost += this.financingDetailsForm.o_and_m_cost * this.financingDetailsForm.system_lifetime
// }

// if (this.financingDetailsForm.system_lifetime && this.financingDetailsForm.equipment_lifetime){
// let frequency = (this.financingDetailsForm.system_lifetime - 1) / this.financingDetailsForm.equipment_lifetime
//   if (this.financingDetailsForm.equipment_replacement_cost){
//     this.finalCostt += frequency * this.financingDetailsForm.equipment_replacement_cost;
//   }
// }

// console.log(this.finalCost);

if (this.selectedTypeOfFinancial == "cash") {

return;

}

this.isTemplateSelected = true;



var url = "/financials/payment-details";

var reqObj = {

  cost: parseFloat(this.finalCostNum),

  payment_method_type: this.selectedTypeOfFinancial,

  payment_method: this.selectedTemplate,

  design: this.$route.params.designId,
  project: this.designPathData.projectId
  

};

axios.post(url, reqObj).then((res) => {

  if (this.selectedTypeOfFinancial == "ppa") {

    this.monthlyPayment = res.data.monthly_payment;

    this.upfront_payment = res.data.upfront_payment;

    this.ppa_rate = res.data.ppa_rate;

    this.ppa_escalation_rate = res.data.ppa_escalation_rate;

    this.payment_method = res.data.payment_method;

  } else if (this.selectedTypeOfFinancial == "lease") {

    this.monthlyPayment = res.data.monthly_payment;

    this.upfront_payment = res.data.upfront_payment;

    this.escalation_rate = res.data.escalation_rate;

    this.payment_method = res.data.payment_method;

  } else {

    this.monthlyPayment = res.data.monthly_payment;

    this.interest_rate_for_term_one = res.data.interest_rate_for_term_one;

    this.interest_rate_for_term_two = res.data.interest_rate_for_term_two;

    this.interest_rate = res.data.interest_rate;

    this.down_payment = res.data.down_payment;

    this.loan_principal = res.data.loan_principal;

    this.loan_term = res.data.loan_term;

    this.payment_method = res.data.payment_method;

  }

  // this.selectedTemplate = ""

});

},


    displayError(error) {
      let errorMessage = error.response.status === 403 ?
        "You don't have permission to edit this project."
        : "Error in updating financial details, Try again."
      this.$message({
        showClose: true,
        message: errorMessage,
        type: "error",
        center: true
      })
      this.isButtonLoading=false;
      this.closefinancialDetailsForm();
    },
    async getData() {
      // this.selectedTemplate = ""
      this.loading = true;
      var reqObj = `payment_method_type=${this.selectedTypeOfFinancial}`;
      let response = await API.FINANACIALS_INFORMATION.FETCH_PAYMENT_METHOAD_TYPE(
        reqObj
      );
      this.loading = false;
      this.previousUrl = response.data.previous;
      this.totalCount = response.data.count;
      this.loanData = [];
      this.loanData = this.getFormatData(response.data.results);
      // this.selectedTemplate = "";
      this.nextUrl = response.data.next;
    },
    getFormatData(res) {
      var formatResult = [];
      formatResult = res.map((res) => {
        var obj = {};
        obj["name"] = res.name;
        obj["id"] = res.id;
        obj["description"] = res.description;
        return obj;
      });
      return formatResult;
    },
    closefinancialDetailsForm() {
      this.Update = false;
      this.dialogOpen =false;
      this.$emit("update:isfinancialDetailsFormVisible", false);
      this.dialogOpen = false;
      this.ad_percentageInvalid = false;
      this.ad_tax_slabInvalid = false;
      this.ad_yearsInvalid = false;
      this.discount_rateInvalid = false;
      this.expected_life_yearsInvalid = false;
      this.idInvalid = false;
      this.maintenance_costInvalid = false;
      this.priceInvalid = false;
      this.subsidyInvalid = false;
      this.taxInvalid = false;
    },
    /* removeFromArray(arr) {
      let newarr = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
          newarr.push(arr[i]);
        }
      }
      return newarr;
    }, */
    loadMoreFinancial($state) {
      if (this.nextUrl !== null) {
        this.loading = true;
        this.loadMoreFinancialHelper(this.nextUrl, $state);
      } else {
        $state.complete();
      }
    },
    async loadMoreFinancialHelper(url, $state) {
      try {
        const response = await API.FINANACIALS_INFORMATION.LOAD_MORE_FINANCIAL(
          url
        );
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        for (let i = 0; i < response.data.results.length; i++) {
          this.loanData.push(response.data.results[i]);
        }
        this.assignAPIResponse(response);
        this.loading = false;
        $state.loaded();
      } catch (e) {
        // console.error();
      }
    },
    assignAPIResponse(response) {
      const data = this.getFormatData(response.data.results);
      this.loanData = this.loanData.concat(
        this.getFormatData(response.data.results)
      );
      this.nextUrl = response.data.next;
    },
    validate() {
      let countValid = 0;
      /* if (this.financingDetailsForm.ad_percentage === "") {
        this.ad_percentageInvalid = true;
        countValid++;
      } else {
        this.ad_percentageInvalid = false;
      } */
      /*if (this.financingDetailsForm.ad_tax_slab === "") {
        this.ad_tax_slabInvalid = true;
        countValid++;
      } else {
        this.ad_tax_slabInvalid = false;
      } */
      /* if (this.financingDetailsForm.ad_years === "") {
        this.ad_yearsInvalid = true;
        countValid++;
      } else {
        this.ad_yearsInvalid = false;
      } */
      if ((!(this.financingDetailsForm.discount_rate >=0)) ||this.financingDetailsForm.discount_rate === "") {
        this.discount_rateInvalid = true;
        countValid++;
      } else {
        this.discount_rateInvalid = false;
      }
      if (this.financingDetailsForm.price <= 0) {
        this.priceInvalid = true;
        countValid++;
      } else {
        this.priceInvalid = false;
      }
        if (this.financingDetailsForm.price !="" && !checkTwoDecimalPointValidation(this.financingDetailsForm.price)) {  
             this.priceDecimal= true;
             countValid++;
      } else {
           this.priceDecimal = false;
      }
      if ((!(this.financingDetailsForm.expected_life_years >=0))||this.financingDetailsForm.expected_life_years === "") {
        this.expected_life_yearsInvalid = true;
        countValid++;
      } else {
        this.expected_life_yearsInvalid = false;
      }
      if( this.financingDetailsForm.expected_life_years > 100){
        this.expected_life_years_Exceeds = true;
         countValid++;
      }else{
          this.expected_life_years_Exceeds= false;
      }
      if ((!(this.financingDetailsForm.maintenance_cost >=0)) ||this.financingDetailsForm.maintenance_cost === "") {
        this.maintenance_costInvalid = true;
        countValid++;
      } else {
        this.maintenance_costInvalid = false;
      }
      /*  if (this.financingDetailsForm.subsidy <= 0) {
        this.subsidyInvalid = true;
        countValid++;
      } else {
        this.subsidyInvalid = false;
      } */
      if ((!(this.financingDetailsForm.tax >=0))||this.financingDetailsForm.tax ==="") {
        this.taxInvalid = true;
        countValid++;
      } else {
        this.taxInvalid = false;
      }
      if (countValid === 0) {
        return true;
      } else {
        return false;
      }
    },
    Isprice() {
      this.$validator.validate('price', this.financingDetailsForm.price);
      this.Update = true;
    },
    IsPriceUnit(){
        this.Update = true;
    },
    IsTax() {
      this.$validator.validate('tax', this.financingDetailsForm.tax);
      this.Update = true; 
    },
    isTaxSlab(){
      this.$validator.validate('tax-slab', this.financingDetailsForm.ad_tax_slab);
    },
    IsLifeYears() {
      this.$validator.validate("expected life years", this.financingDetailsForm.expected_life_years);      
    },
    IsDiscountRate() {
      this.$validator.validate('discount rate', this.financingDetailsForm.discount_rate);
    },
    /* IsSubsidy() {
      if (this.financingDetailsForm.subsidy === "") {
        this.subsidyInvalid = true;
      } else {
        this.subsidyInvalid = false;
      }
      if (this.financingDetailsForm.subsidy > 100) {
        this.subsidyInvalid = true;
      } else {
        this.subsidyInvalid = false;
      }
    }, */
    IsMaintenanceCost() {
      if ((!(this.financingDetailsForm.maintenance_cost >=0))||this.financingDetailsForm.maintenance_cost === "") {
        this.maintenance_costInvalid = true;
      } else {
        this.maintenance_costInvalid = false;
      }
      this.Update = true;
    },
    isad_Percentage(){
      this.$validator.validate('accelerated depreciation percentage', this.financingDetailsForm.ad_percentage);
    },
    isad_years(){
      this.$validator.validate('accelerated depreciation years', this.financingDetailsForm.ad_years);
    }
  },
};
</script>



<style scoped>

.validationCss {

  word-break: break-word;

  margin: 0px auto 0px auto;

  line-height: 25px;

  font-size: 12px;

}

.boxBtn {

  margin: 15px auto 10px auto;

  font-weight: 700;

}

.modal {

  z-index: 450 !important;

  background-color: rgba(0, 0, 0, 0.5);

}


select {

  background: inherit;

  border: none;

  outline: none;

  font-size: 16px;

  color: #222;

}

.formErrors {

  text-align: left;

  color: red;

  word-break: break-word;

  font-size: 12px;

  margin-top: 8px;

}

.edit-form {

  padding: 20px 17px 0px 6px;

}


.inside_form {

  padding: 10px 10px 0px 16px !important;

}

.gridView {

  display: flex;

  width: 100%;

  flex-direction: column;

}

.gridItem {

  display: flex;

  width: 100%;

  flex-direction: row;

  justify-content: flex-start;

  margin-bottom: 0.5rem;

}

.right_spacing {

  margin-right: 1rem;

  width: 48% !important;

}



.container {

  display: flex;

  flex-direction: row;

}



.floating-form {

  width: 100% !important;

}



.containerTwo {

  width: 50%;

}



.containerTwoBox {

  display: flex;

  flex-direction: column;

  padding: 15px;

  height: auto;

  width: 100%;

  border-radius: 4px;

  background-color: #e8edf2;

}

.el-dialog__wrapper {
  margin-top: 6vh !important;
}


#elForm .delete_module >>> .el-select {

  width: 100%;

  margin-bottom: 10px !important;

}



#elForm .delete_module >>> .el-input--suffix .el-input__inner {

  border: none;

  color: #222 !important;
  height: 48px !important;
  font-size: 16px !important;
}



#elForm .delete_module >>> .el-select .el-input .el-select__caret {

  color: #222 !important;

  font-weight: bold !important;
  font-size: 16px !important;

}



#elForm .delete_module >>> .el-select > .el-input {

  text-align: left;

  text-align-last: left;

}



.loanDropdownTwo {

  padding: 0 0px !important;

  height: auto !important;

  white-space: inherit !important;

}



#elForm .delete_module >>> ::placeholder {

  color: #222 !important;

}



.labelDropdown {

  padding: 4px 15px !important;

  font-size: 14px !important;

  color: #222 !important;

  font-weight: 100 !important;

  line-height: 20px !important;

  word-wrap: break-word !important;

  width: 275px !important;

}

.descDropdown {

  padding: 0 15px 5px 15px !important;

  font-size: 12px !important;

  line-height: 18px !important;

  color: #777 !important;

  font-weight: 100 !important;

  word-wrap: break-word !important;

  width: 275px !important;

}



.totalCost {

  font-size: 13px;

  font-weight: 100;

  margin: 10px auto 5px auto;

}



.totalCostRupee {

  font-size: 22px;

  font-weight: bold;

}



.summaryContainer {

  margin: 13px auto;

}



.summaryContainer .heading {

  font-size: 13px;

  font-weight: 100;

  color: #222;

  margin-bottom: 5px;

  word-break: break-word !important;


}



.summaryContainer .money {

  font-size: 22px;

  font-weight: bold;

  margin-bottom: 15px;

  word-break: break-word !important;


}



.summaryContainer .summary {

  font-size: 12px;

  font-weight: 100;

  color: #777;

  line-height: 16px;

  word-break: break-word !important;


}



.paymentEscalationContainer {

  display: flex;

  flex-direction: row;

  justify-content: space-between;

  margin-top: 8px;

  margin-bottom: 12px;

}



.paymentEscalation .payment {

  font-size: 12px;

  font-weight: 100;
  word-break: break-word !important;


}



.paymentEscalation .values {

  font-size: 14px;

  font-weight: 500;

  word-break: break-word !important;

}



.gridButton {

  text-align: center;

}



.button {

  font-size: 18px;

  font-weight: bold;

  padding: 17px 40px;

}

.floating-input{
  height: 48px !important;
  color: #222 !important;
}

.floating-input{
  color: #222 !important;
  font-size: 16px !important;
}

.floating-input:not(:placeholder-shown)~label{
  font-size: 14px !important;
  color: #222;
}

.floating-label.right_value .value_area {
    position: absolute;
    right: 12px;
    top: 15px;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-size: 16px;
    color: #222;
}



.modal-header {

  padding: 16px 22px !important;

}

#elForm .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}
#elForm .delete_module >>> .el-dialog {
  border-radius: 16px;
  margin-top: 2vh !important;
  width: 940px !important;
}

#elForm .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

#elForm .delete_module >>> .el-dialog__footer{
  margin: 0px !important;
}

@media screen and (max-width: 1280px) {
  #elForm .delete_module >>> .el-dialog {
    width: 90% !important;
  }
}


@media (max-width: 720px) {

  #elForm .delete_module >>> .el-dialog {
    width: 90% !important;
    margin-top: 0vh !important;
  }

  .el-dialog__wrapper {
  margin-top: 6vh !important;
  overflow: hidden !important;
}



  .gridItem {

    display: flex;

    width: 100%;

    flex-direction: column;

  }

  .right_spacing {

    margin-right: 0;

    width: -webkit-fill-available !important;

  }



  .container {

    flex-direction: column;

  }

  el-button {

    font-size: 13px;

  }



  .containerTwo {

    width: 100%;

    margin-bottom: 30px;

  }



  .button {

    font-size: 15px;

    padding: 15px 30px;

  }

  .modal-header {

    margin-left: -3px;

  }
  
  #elForm .delete_module >>> .el-dialog__body {
    padding: 0 !important;
    height: 65vh;
    overflow: hidden;
    overflow-y: scroll;
}
}

#elForm >>> .el-dialog__header {

       width: 100%;

    display: -webkit-box;

    display: -ms-flexbox;

    display: flex;

    -webkit-box-pack: justify;

    -ms-flex-pack: justify;

    justify-content: space-between;

    -webkit-box-align: center;

    -ms-flex-align: center;

    align-items: center;

    height: 48px;

    background-color: #e8edf2;

    border-top-left-radius: 16px;

    border-top-right-radius: 16px;

}

.headerHeading {
  font-weight: 600;
}

#elForm >>> .el-dialog__headerbtn {

    position: absolute;

    top: 20px;

    right: 20px;

    padding: 0;

    background: transparent;

    border: none;

    outline: none;

    cursor: pointer;

    font-size: 16px;

    color: #222;

}.tittle{

  color: #222;

  margin-left: 12px;

}

#elForm >>> .el-dialog__headerbtn .el-dialog__close {

    color: #222;

    font-size: 22px !important;
    font-weight: 600 !important;

}

.tittle {
    color: #222;
    margin-left: 12px;
    font-size: 16px;
}

 #elForm >>> .el-icon-close:before {
    content: "\E6DB";
    color: #222;
}

</style>