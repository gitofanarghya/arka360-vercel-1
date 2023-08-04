<template>
  <div class="deleteModule" v-if="isAddPricingPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      :title="requestedServiceType"
      @close="$emit('update:isAddPricingPopupVisible', false)"
      class="delete_module"
    >
      <div class="containerOP">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{requestedServiceType}}</p>
         
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isAddPricingPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer">
          <h3 class="containerHeading">Add Pricing*</h3>
           <p class="AddPricingSubHeading">These details will be used by the team to send you the Proposal. You also have the flexibility to edit these fields later and generate a proposal with different numbers.</p>
          <form class="inside_form">
            <div class="scroll_content edit-form">
              <div class="container">
                <div class="floating-form">
                  <div class="gridView">
                    <div class="gridItem">
                      <div class="floating-label right_value right_spacing">
                        <input
                          class="floating-input"
                          type="text"
                          v-model="financingDetailsForm.price"
                          @input="Isprice()"
                        />

                        <p
                          v-if="priceInvalid"
                          class="validationCss"
                          style="color: red"
                        >
                          {{ PriceInvalid }}
                        </p>
                        <p
                          v-if="priceDecimal"
                          class="validationCss"
                          style="color: red"
                        >
                          {{ DecimalPoint }}
                        </p>

                        <label>Price*</label>

                        <div class="value_area">
                          <!-- <span>
                            {{ currencySymbol }}/W
                             -->
                            <!-- <select class="" id="" v-model="priceUnit">
                              <option value="relative">
                                {{ currencySymbol }}/kW
                              </option>

                              <option value="absolute">
                                {{ currencySymbol }}
                              </option>
                            </select> -->
                          <!-- </span> -->
                          <span>
                            <select class="" id="" v-model="priceUnit"  @change="IsPriceUnit()" >
                              <option value="relative">
                                {{ currencySymbol }}/kW
                              </option>
                              <option value="absolute">
                                {{ currencySymbol }}
                              </option>
                              <option value="absolute3">
                                {{ currencySymbol }}/W 
                              </option>
                            </select>
                          </span>
                        </div>

                        <p class="formErrors">
                          <span>{{ errors.first("Price") }}</span>
                        </p>
                      </div>

                      <div class="floating-label right_value right_spacing">
                        <input
                          class="floating-input"
                          type="number"
                          step="any"
                          v-model="financingDetailsForm.tax"
                          @input="IsTax()"
                        />

                        <p
                          v-if="taxInvalid"
                          class="validationCss"
                          style="color: Red"
                        >
                          {{ TaxInvalid }}
                        </p>

                        <label> {{ isUSFlagEnabled ? 'Sales Tax' : 'GST' }} </label>

                        <div class="value_area">
                          <span>%</span>
                        </div>

                        <p class="formErrors">
                          <span>{{ errors.first("Tax") }}</span>
                        </p>
                      </div>
                    </div>

                    <div class="gridItem">
                      <div class="floating-label right_value right_spacing">
                        <input
                          class="floating-input"
                          type="text"
                          v-model="financingDetailsForm.expected_life_years"
                          @input="IsLifeYears()"
                        />

                        <p
                          v-if="expected_life_yearsInvalid"
                          class="validationCss"
                          style="color: red"
                        >
                          {{ Expected_life_yearsInvalid }}
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

                      <div class="floating-label right_value right_spacing">
                        <input
                          class="floating-input"
                          type="text"
                          v-model="financingDetailsForm.maintenance_cost"
                          @input="IsMaintenanceCost()"
                        />

                        <p
                          v-if="maintenance_costInvalid"
                          class="validationCss"
                          style="color: red"
                        >
                          {{ Maintenance_costInvalid }}
                        </p>

                        <label>Maintenance Cost</label>
                          
                        <div class="value_area">
                          <!-- {{ currencySymbol }}/year -->
                          <!-- <select v-model="maintenanceCostUnit">
                            <option value="relative">
                              {{ currencySymbol }}/kW/year
                            </option>

                            <option value="absolute">
                              {{ currencySymbol }}/year
                            </option>
                          </select> -->
                          <select v-model="maintenanceCostUnit">
                            <option value="relative">
                              {{ currencySymbol }}/kW/year
                            </option>
                            <option value="absolute">
                              {{ currencySymbol }}/year
                            </option>
                          </select>
                        </div>
                      </div>

                      <div
                        class="floating-label right_value right_spacing dsplyNone"
                        style="width: -webkit-fill-available"
                      >
                        <input
                          class="floating-input"
                          type="text"
                          v-model="financingDetailsForm.discount_rate"
                          @input="IsDiscountRate()"
                        />

                        <p
                          v-if="discount_rateInvalid"
                          class="validationCss"
                          style="color: red"
                        >
                          {{ Discount_rateInvalid }}
                        </p>

                        <label>Discount Rate</label>

                        <div class="value_area">
                          <span>%</span>
                        </div>
                      </div>
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

                      
                    </div>
                  </div>

                <DesignIncentives  :adminMode="true" :selectedIncentivesData="selectedIncentivesData"  @updatedIncentivesList="updatedIncentivesListData" @update="updatedIncentivesListData"/>


                  <div
                    class="floating-label right_value dsplyNone" 
                    style="color: #1c3366"
                  >
                    Accelerated Depreciation
                  </div>

                  <div class="gridItem dsplyNone">
                    <div class="floating-label right_value right_spacing">
                      <input
                        class="floating-input"
                        type="text"
                        v-model="financingDetailsForm.ad_percentage"
                      />

                      <!-- <p v-if="ad_percentageInvalid" style="color: red">

                      {{ Ad_percentageInvalid }}

                    </p> -->

                      <label>Percentage</label>

                      <div class="value_area">
                        <span>%</span>
                      </div>

                      <p class="formErrors">
                        <span>
                          {{ errors.first("Accelerated Percentage") }}
                        </span>
                      </p>
                    </div>

                    <div class="floating-label right_value right_spacing">
                      <input
                        class="floating-input"
                        type="text"
                        v-model="financingDetailsForm.ad_years"
                      />

                      <p
                        v-if="ad_yearsInvalid"
                        class="validationCss"
                        style="color: red"
                      >
                        {{ Ad_yearsInvalid }}
                      </p>

                      <label>Years</label>

                      <div class="value_area">
                        <span>Years</span>
                      </div>

                      <!--  <p class="formErrors">

                      <span>{{ errors.first("Accelerated Years") }}</span>

                    </p> -->
                    </div>
                  </div>

                  <div class="gridItem dsplyNone">
                    <div class="floating-label right_value right_spacing">
                      <input
                        class="floating-input"
                        type="text"
                        v-model="financingDetailsForm.ad_tax_slab"
                      />

                      <!--  <p v-if="ad_tax_slabInvalid" style="color: red">

                      {{ Ad_tax_slabInvalid }}

                    </p> -->

                      <label>Tax Bracket</label>

                      <div class="value_area">
                        <span>%</span>
                      </div>

                      <p class="formErrors">
                        <span>
                          {{ errors.first("Accelerated Tax Slab") }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- -----------------Footer----------------->
        <div class="footer">
          <p class="footerStep">
            Step {{ currentStepInProp
            }}<span class="unBold">/{{ totalSteps }}</span>
          </p>
          <div class="notesBtn">
            <el-button
              class="backBtn"
              @click="$emit('closeAddPricingPopup', 'previous')"
              >Back</el-button
            >
            <el-button
              type="primary"
              class="submitBtn"
              :loading="isSubmitting"
              @click="onAddPricingUpdate()"
              >Save & Next</el-button
            >
            <!-- <el-button type="primary" class="submitBtn" @click="$emit('closeAddPricingPopup','next')">Save & Next</el-button> -->
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { checkTwoDecimalPointValidation,} from "../../../core/utils/utils.js";
import DesignIncentives from "../../design/components/dsIncentives/designIncentive.vue";

import axios from "axios";

import API from "@/services/api/";

import Vue from "vue";

import InfiniteLoading from "vue-infinite-loading";
import { useDesignStore } from '../../../stores/design.js';
import { useProjectStore } from '../../../stores/project.js';


Vue.use(InfiniteLoading);

export default {
  name: "addPricingPopup",

  props: {
    isAddPricingPopupVisible: {
      type: Boolean,
      default: false,
    },
    totalSteps: {
      type: Number,
      default: 5,
    },
    requestedServiceType:{
            type: String,
            default:""
        },

    currentStepInProp: {
      type: Number,
      default: 1,
    },
  projectIdFromGenericComponent:{
            type : Number,
            default: null,
        },
    // financialPaymentData: {

    //   type: Object,

    //   default: {

    //     payment_method_type: "Cash",

    //     payment_method: "",

    //   },

    // },

    // isEdited: {

    //   type: Boolean,

    //   default: false,

    // },

    isfinancialDetailsFormVisible: {
      type: Boolean,

      default: false,
    },

    // financingDetailsData: {

    //   type: Object,

    //   default: {

    //     id: "",

    //     price: null,

    //     tax: null,

    //     expected_life_years: null,

    //     discount_rate: null,

    //     subsidy: null,

    //     ad_percentage: null,

    //     ad_years: null,

    //     ad_tax_slab: null,

    //     maintenance_cost: null,

    //   },

    // },

    isFinancialsUndefined: {
      type: Boolean,

      default: false,
    },

    isPricingAdded: {
      type: Boolean,

      default: false,
    },
    request_object_id: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      Update: false,
      priceUnit: "relative",
      maintenanceCostUnit: "relative",
      financialPaymentData: {
        payment_method_type: "cash",
        payment_method: "",
        priceUnit:"absolute"
      },
      financingDetailsData: {
        id: "",

        price: 0,

        tax: 8.9,

        expected_life_years: 25,

        discount_rate: 6.25,

        subsidy: null,

        ad_percentage: 0,

        ad_years: 0,

        ad_tax_slab: 0,

        maintenance_cost: 0,

    },
      Update: false,

      financialPaymentBox: {},

      selectedTemplate: "",

      monthlyPayment: ["0", null, null],

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

      isSubmitting: false,

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

        incentives: null,
      },
      priceDecimal:false,

      selectedIncentivesData: [],

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

      DecimalPoint:"*field may contain 1 or 2 decimal points.",
      Exceeds_expected_life_years:"Expected life should be less than 50.",

      priceUnit: "absolute",

      subsidyUnit: "relative",

    };
  },
  components: {
    DesignIncentives,
  },

  computed: {
    ...mapState(useDesignStore, {
      summary: "GET_DESIGN_INFORMATION",
    }),

    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
    isUSFlagEnabled(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
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
 
 watch: {
request_object_id(newval,oldval){
       this.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newval);
    },
    // isfinancialDetailsFormVisible(newVal) {

    //   // setTimeout(myGreeting, 5000);

    //   console.log("newVal");
    //   this.financialPaymentBox = this.financialPaymentData;
    //   this.selectedTypeOfFinancial = this.financialPaymentBox.payment_method_type;
    //   this.selectedTemplate = this.financialPaymentBox.payment_method;
    //   this.priceUnit = this.financialPaymentBox.priceUnit;
    //   if (this.selectedTypeOfFinancial == "cash") {
    //     this.selectedTemplate = "";
    //   }
    //   this.getCalculatedData();

    // },
    isAddPricingPopupVisible(newVal) {
      this.financialPaymentBox = this.financialPaymentData;
      this.selectedTypeOfFinancial =
        this.financialPaymentBox.payment_method_type;
      this.selectedTemplate = this.financialPaymentBox.payment_method;
      this.priceUnit = this.financialPaymentBox.priceUnit;
      if (this.selectedTypeOfFinancial == "cash") {
        this.selectedTemplate = "";
      }
      this.getCalculatedData();
    },

    selectedTypeOfFinancial(newval) {
      // console.log("####isCashTypeOfFinancialSelected" , this.isCashTypeOfFinancialSelected);

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
  created() {
    // console.log("****request_object_id", this.$props.request_object_id);
    this.financingDetailsForm = this.financingDetailsData;

    if (this.selectedTypeOfFinancial == "cash") {
      this.isCashTypeOfFinancialSelected = true;
    } else {
      this.isCashTypeOfFinancialSelected = false;
    }
 
    // if(typeof this.financialPaymentBox == 'object'){

    //   console.log("@@@@@financialPaymentBox payment methoad",this.financialPaymentBox.payment_method_type);

    // this.selectedTypeOfFinancial = this.financialPaymentBox.payment_method_type

    // }
  },
  mounted(){

  },
  methods: {
    IsPriceUnit(){
        this.Update = true;
    },

    updatedIncentivesListData(data){
      this.selectedIncentivesData  = data;
      this.financingDetailsForm.incentives = data.map(incentive => incentive.id);
    },
   async GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newID){
     var response = await API.DASHBOARD_INFO.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newID);
      if (response.status == 200) {
        if (!response.data.financial_data) { return }

        this.financingDetailsForm.ad_percentage = response.data.financial_data.ad_percentage,
        this.financingDetailsForm.ad_tax_slab =  response.data.financial_data.ad_tax_slab,
        this.financingDetailsForm.ad_years = response.data.financial_data.ad_years,
        this.financingDetailsForm.discount_rate = response.data.financial_data.discount_rate,
        this.financingDetailsForm.expected_life_years =response.data.financial_data.expected_life_years,
        // this.financingDetailsForm.id = 0,{}
        this.financingDetailsForm.maintenance_cost = response.data.financial_data.absolute_maintenance_cost,
        this.financingDetailsForm.price =  response.data.financial_data.price_per_watt,
        // this.financingDetailsForm.subsidy = 0,
        this.financingDetailsForm.tax = response.data.financial_data.tax,
        this.financingDetailsForm.incentives = response.data.financial_data.incentives
        let multipleIncentivesData = await API.INCENTIVE_INFORMATION.SELECT_MULTIPLE_INCENTIVES_FROM_EXPERT_SERVICE(
          {
            incentives: response.data.financial_data.incentives,
          }
        )
        this.selectedIncentivesData  = multipleIncentivesData.data;
      }           
   },
  async onAddPricingUpdate(){
    const isFormValid = this.validate();

      if (!isFormValid) {
        return;
      }
      this.isSubmitting = true

      let price_per_kw_value = null;

      let absolute_price_value = null;
      
      let price_per_watt_value = null;

      if (this.priceUnit === "relative") {
          price_per_kw_value = this.financingDetailsForm.price;

      } else if(this.priceUnit === "absolute3"){
          price_per_watt_value =  this.financingDetailsForm.price;

      }else{
          absolute_price_value = this.financingDetailsForm.price;
      }

    //  absolute_price_value= parseInt(absolute_price_value);
    //  var pw = absolute_price_value * 1000;

      let newPatchData = {
        financial_data: {

          incentives: this.financingDetailsForm.incentives,

          expected_life_years: this.financingDetailsForm.expected_life_years,

          tax: this.financingDetailsForm.tax,

          ad_years: this.financingDetailsForm.ad_years,

          ad_percentage: this.financingDetailsForm.ad_percentage,

          ad_tax_slab: this.financingDetailsForm.ad_tax_slab,

          discount_rate: this.financingDetailsForm.discount_rate,

          design: this.$route.params["designId"],

          // subsidy_percentage: subsidy_percentage_value,

          payment_method_type: this.selectedTypeOfFinancial,

          payment_method: this.selectedTemplate,

          // subsidy_amount: subsidy_amount_value,

          price_per_kw: price_per_kw_value,
          absolute_price: absolute_price_value,
          price_per_watt: price_per_watt_value,

          absolute_maintenance_cost:
            this.maintenanceCostUnit === "absolute"
              ? this.financingDetailsForm.maintenance_cost
              : null,

          maintenance_cost_per_kw:
            this.maintenanceCostUnit === "relative"
              ? this.financingDetailsForm.maintenance_cost
              : null,
        },
      };
      let response = await API.DASHBOARD_INFO.FINANCIAL_ADD_PRICING_POPUP_ADDED(
        this.$props.request_object_id,
        newPatchData
      );
      this.isSubmitting = false
      this.$emit("closeAddPricingPopup", "next");
    },
    closenewDesignDialogForm() {
      this.$emit("update:isOrderDetailPopupVisible", false);
      this.$validator.reset();
    },
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

    handleClose() {
      this.dialogOpen = false;
    },

    async confirmFinancialFormData() {
      this.Update = true;

      this.dialogOpen = false;

      const isFormValid = this.validate();

      if (!isFormValid) {
        return;
      }

      const isValid = await this.$validator.validateAll();

      if (isValid) {
        let subsidy_percentage_value = "";

        // let subsidy_amount_value = "";

        let price_per_kw_value = "";

        let absolute_price_value = "";

        if (this.priceUnit === "relative") {
          price_per_kw_value = this.financingDetailsForm.price;

          absolute_price_value = null;
        } else {
          price_per_kw_value = null;

          absolute_price_value = this.financingDetailsForm.price;
        }

        // if (this.subsidyUnit === "relative") {

        //   subsidy_percentage_value = this.financingDetailsForm.subsidy;

        //   subsidy_amount_value = null;

        // } else {

        //   subsidy_percentage_value = null;

        //   subsidy_amount_value = this.financingDetailsForm.subsidy;

        // }

        //data to be post/patch

        let postData = {
          expected_life_years: this.financingDetailsForm.expected_life_years,

          tax: this.financingDetailsForm.tax,

          ad_years: this.financingDetailsForm.ad_years,

          ad_percentage: this.financingDetailsForm.ad_percentage,

          ad_tax_slab: this.financingDetailsForm.ad_tax_slab,

          discount_rate: this.financingDetailsForm.discount_rate,

          design: this.$route.params["designId"],

          // subsidy_percentage: subsidy_percentage_value,

          payment_method_type: this.selectedTypeOfFinancial,

          payment_method: this.selectedTemplate,

          subsidy_amount: subsidy_amount_value,

          price_per_kw: price_per_kw_value,

          absolute_price: absolute_price_value,

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
            await this.UPDATE_DESIGN_FINANCIAL_DETAILS(postData);

            this.closefinancialDetailsForm();
          } catch (e) {
            this.displayError();
          }
        } else {
          try {
            await this.POST_FINANCIAL_DETAILS(postData);

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
      } else {
        this.totalCost = this.financingDetailsForm.price;
      }
    },

    getCalculatedData() {
      if (this.priceUnit == "relative") {
        this.totalCost =
          Math.round(
            this.financingDetailsForm.price *
              this.summary.nameplateDcSize *
              1000
          ) / 1000;
      } else {
        this.totalCost =
          Math.round(this.financingDetailsForm.price * 1000) / 1000;
      }

      if (this.selectedTypeOfFinancial == "cash") {
        return;
      }

      this.isTemplateSelected = true;

      var url = "/financials/payment-details";

      var reqObj = {
        cost: this.totalCost,
        payment_method_type: this.selectedTypeOfFinancial,
        payment_method: this.selectedTemplate,
        project:this.$props.projectIdFromGenericComponent
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

    displayError() {
      this.$message({
        showClose: true,

        message: "Error in updating financial details. Try again",

        type: "error",
        center: true
      });

      this.closefinancialDetailsForm();
    },

    async getData() {
      // this.selectedTemplate = ""

      this.loading = true;

      var reqObj = `payment_method_type=${this.selectedTypeOfFinancial}`;

      let response =
        await API.FINANACIALS_INFORMATION.FETCH_PAYMENT_METHOAD_TYPE(reqObj);

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
      this.dialogOpen = false;

      // this.$emit("update:isfinancialDetailsFormVisible", false);

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
      if (this.financingDetailsForm.discount_rate < 0) {
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
         if (this.financingDetailsForm.price!="" && !checkTwoDecimalPointValidation(this.financingDetailsForm.price)) {  
             this.priceDecimal = true;
             countValid++;
      } else {
             this.priceDecimal=false;
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

      if (this.financingDetailsForm.maintenance_cost < 0) {
        this.maintenance_costInvalid = true;

        countValid++;
      } else {
        this.maintenance_costInvalid = false;
      }
      if (this.financingDetailsForm.tax < 0) {
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
      if (this.financingDetailsForm.price <= 0) {
        this.priceInvalid = true;
      } else {
        this.priceInvalid = false;
      }
      if (this.financingDetailsForm.price!="" && !checkTwoDecimalPointValidation(this.financingDetailsForm.price)) {  
             this.priceDecimal = true;
      } else {
           this.priceDecimal = false;
      }

      this.Update = true;
    },

    IsTax() {
      if (this.financingDetailsForm.tax < 0) {
        this.taxInvalid = true;
      } else {
        this.taxInvalid = false;
      }

      if (this.financingDetailsForm.tax > 100) {
        this.taxInvalid = true;
      } else {
        this.taxInvalid = false;
      }
    },

    IsLifeYears() {
      if((!(this.financingDetailsForm.expected_life_years >=0))|| this.financingDetailsForm.expected_life_years === "") {

        this.expected_life_yearsInvalid = true;

      } else {

        this.expected_life_yearsInvalid = false;
      }
      if (this.financingDetailsForm.expected_life_years > 50) {
        this.expected_life_years_Exceeds = true;
      } else {
        this.expected_life_years_Exceeds = false;
      }

    },

    IsDiscountRate() {
      if (this.financingDetailsForm.discount_rate < 0) {
        this.discount_rateInvalid = true;
      } else {
        this.discount_rateInvalid = false;
      }

      if (this.financingDetailsForm.discount_rate > 100) {
        this.discount_rateInvalid = true;
      } else {
        this.discount_rateInvalid = false;
      }
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
      if (this.financingDetailsForm.maintenance_cost < 0) {
        this.maintenance_costInvalid = true;
      } else {
        this.maintenance_costInvalid = false;
      }
    },
  },
};
</script>


<style scoped>
.deleteModule .delete_module >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

.deleteModule .delete_module >>> .el-dialog__title {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366 !important;
}

.deleteModule .delete_module >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule >>> .delete_module {
  overflow: hidden !important;
  margin-top: 5vh !important;
}

.Rectangle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: none;
}

.rectContent {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-left: 20px;
}

.modal-close {
  background-color: #e8edf2;
  border: none;
}

.el-dialog__close {
  font-size: 25px;
  font-weight: 700;
  margin-right: 8px;
  cursor: pointer;
}

.contContainer {
  padding: 8px 0px 0px 0px;
  height: 65vh;
  overflow-y: scroll;
}

.containerHeading{
  color: #777777;
  font-size: 16px;
  font-weight: 100;
  padding: 18px 0px 8px 21px;
}

.footer {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.footerStep {
  font-size: 16px;
  font-weight: 700;
  color: #222222;
  line-height: 2.5;
}

.unBold {
  color: #777777;
}

.el-button {
  font-size: 18px !important;
}

.backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
}

.submitBtn {
  padding: 12px 14px;
}

.unBold {
  color: #777777;
}

/* .card{
    width: 98% !important;
} */

.deleteModule >>> .card[data-v-05cfa349] {
  width: 98% !important;
}

.deleteModule >>> .currIcon[data-v-5d28bb6f] {
  top: 42% !important;
}

@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

  .contContainer {
    padding: 0px 0px 0px 0px;
    max-height: 70vh;
  }
  .rectContent {
    margin-left: 16px;
  }
}
</style>



<style scoped>
.AddPricingSubHeading{
 font-size: 14px;
 font-weight: 100;
 line-height: 1.36;
 text-align: left;
 color: #222; 
 padding-left: 22px;
 padding-right: 22px;
 padding-top: 2px;
 word-break: break-word;
}
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

  font-size: 15px;

  color: var(--step-200);
}

.formErrors {
  text-align: left;

  color: red;

  word-break: break-word;

  font-size: 12px;
}

.edit-form {
  padding: 20px 17px 0px 6px;
}

.inside_form {
  padding: 10px 10px 24px 16px !important;
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

.deleteModule .delete_module >>> .el-select {
  width: 100%;

  margin-bottom: 10px !important;
}

.deleteModule .delete_module >>> .el-input--suffix .el-input__inner {
  border: none;

  color: #222 !important;
}

.deleteModule .delete_module >>> .el-select .el-input .el-select__caret {
  color: #222 !important;

  font-weight: bold !important;
}

.deleteModule .delete_module >>> .el-select > .el-input {
  text-align: left;

  text-align-last: left;
}

.loanDropdownTwo {
  padding: 0 0px !important;

  height: auto !important;

  white-space: inherit !important;
}

.deleteModule .delete_module >>> ::placeholder {
  color: #222 !important;
}

.labelDropdown {
  padding: 4px 15px !important;

  font-size: 14px !important;

  color: #222 !important;

  font-weight: 100 !important;

  line-height: 20px !important;

  word-wrap: break-word !important;

  width: 450px !important;
}

.descDropdown {
  padding: 0 15px 5px 15px !important;

  font-size: 12px !important;

  line-height: 18px !important;

  color: #777 !important;

  font-weight: 100 !important;

  word-wrap: break-word !important;

  width: 450px !important;
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
}

.modal-header {
  padding: 16px 22px !important;
}

.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}
.deleteModule .delete_module >>> .el-dialog {
  border-radius: 16px;
  margin-top: 2vh !important;
  width: 90% !important;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.dsplyNone{
  display: none !important;
}

@media screen and (max-width: 1600px) {
.labelDropdown { 
  width: 375px !important;
}

.descDropdown {
  width: 375px !important;
}
}



@media screen and (max-width: 1280px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

  .labelDropdown { 
  width: 275px !important;
}

  .descDropdown {
  width: 275px !important;
}
}

@media (max-width: 720px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
    margin-top: 0vh !important;
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

  .footer {
    padding: 16px 14px;
  }

  .el-button {
    font-size: 16px !important;
  }

  .backBtn {
    padding: 11px 24px;
    border: 1px solid #999;
  }

  .submitBtn {
    padding: 11px 22px;
  }
}

.deleteModule >>> .el-dialog__header {
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

  height: 50px;

  background-color: #e8edf2;

  border-top-left-radius: 16px;

  border-top-right-radius: 16px;
}

.deleteModule >>> .el-dialog__headerbtn {
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
}
.tittle {
  color: #222;

  margin-left: 22px;
}

.deleteModule >>> .el-dialog__headerbtn .el-dialog__close {
  color: #222;

  font-size: 22px !important;
}

.tittle {
  color: #222;
  margin-left: 22px;
  font-size: 16px;
}

.deleteModule >>> .el-icon-close:before {
  content: "\E6DB";
  color: #222;
}
</style>