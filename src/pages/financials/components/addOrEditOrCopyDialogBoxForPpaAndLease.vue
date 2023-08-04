<template>
  <div class="deleteModule">
    <el-dialog
      :visible="isAddOrEditOrCopyPopupOpen"
      :close-on-click-modal="false"
      title="Add User"
      width="45%"
      class="delete_module"
      @close="closeModal"
    >
      <div class="container">
        <!-- -----------------header--------- -->
        <div class="Rectangle">
          <p class="rectContent">{{ typeOfOperation }} {{ typeOfTab }}</p>
          <img
            src="../../../../src/assets/img/close.svg"
            alt="close"
            @click="$emit('cancelAdd')"
            class="closeBtn"
          />
        </div>

        <!-- -----------------input Container--------- -->
        <div class="inputContainer">
          <el-form ref="form" :model="formObj">
            <!-- -----------------Input One--------- -->
            <div>
              <el-form-item
                :label="'Enter ' + typeOfTab + ' Name*'"
                class="firstInput"
              >
                <el-input v-model="formObj.name" @input="ProjectName">
                </el-input>
                <p class="validationCss" v-if="nameInvalid" >
                  {{ nameField }}
                </p>
              </el-form-item>
            </div>
            <!-- -----------------other Four Inputs--------- -->
            <div class="inputs">
              <el-form-item label="Project Type*"
                ><br />
                <el-select
                  v-model="formObj.project_type"
                  placeholder="Select Project Type"
                  @change="ProjectType"
                >
                  <el-option
                    label="Residential"
                    class="projectType"
                    value="residential"
                  ></el-option>
                  <el-option
                    label="Commercial"
                    class="ProjectType"
                    value="commercial"
                  ></el-option>
                </el-select>
                <p
                  class="validationCss"
                  v-if="projectTypeInvalid"
                  
                >
                  {{ project_typeField }}
                </p>
              </el-form-item>

              <el-form-item label="Upfront Payment*">
                <span class="inputValues"
                  >{{ currencySymbolNameMap[currencyCode] }}
                </span>
                <el-input
                  v-model="formObj.upfront_payment"
                  type="Number"
                  min="0"
                  @input="Isupfront()"
                ></el-input>
                <p
                  class="validationCss"
                  v-if="upFrontPaymentInvalid"
                  
                >
                  {{ upfront_paymentField }}
                </p>
              </el-form-item>

              <el-form-item label="Rate*" v-if="typeOfTab == 'PPA'">
                <span class="inputValues"
                  >{{ currencySymbolNameMap[currencyCode]
                  }}<span v-if="typeOfTab == 'Lease'">/month</span
                  ><span v-else>/kwh</span></span
                >
                <el-input
                  v-model="formObj.ppa_rate"
                  type="Number"
                  min="0"
                  @input="Israte()"
                ></el-input>
                <p class="validationCss" v-if="rateInvalid" >
                  {{ ppa_rateField }}
                </p>
              </el-form-item>
              <el-form-item label="Monthly Payment" v-else>
                <span class="inputValues"
                  >{{ currencySymbolNameMap[currencyCode]
                  }}<span v-if="typeOfTab == 'Lease'">/month</span
                  ><span v-else>/kwh</span></span
                >
                <el-input
                  v-model="formObj.monthly_lease_payment"
                  type="Number"
                  min="0"
                  @input="IsMonthly()"
                ></el-input>
                <p class="validationCss" v-if="monthInvalid" >
                  {{ monthly_lease_paymentInvalid }}
                </p>
              </el-form-item>

              <el-form-item label="Escalation Rate*">
                <!-- <span class="rupeeIcon">{{currencySymbolNameMap[currencyCode]}}</span> -->
                <span class="inputValues">% per year</span>
                <el-input
                  v-model="formObj.escalation_rate"
                  type="Number"
                  min="0"
                  @input="Isescalation()"
                ></el-input>
                <p
                  class="validationCss"
                  v-if="escalationExceed"
                  
                >
                  {{ escalationIsInvalid }}
                </p>
                <p
                  class="validationCss"
                  v-if="escalationRateInvalid"
                  
                >
                  {{ escalation_Field }}
                </p>
              </el-form-item>
              <el-form-item label="Currency Selection*">
                <el-select
                  v-model="currency"
                  @change="onCountryChange"
                  filterable
                  remote
                  reserve-keyword
                >
                  <el-option
                    v-for="country in countryDetails"
                    :key="country.id"
                    :label="`${country.currency_code} ${
                      currencySymbolNameMap[country.currency_code]
                        ? `(${currencySymbolNameMap[country.currency_code]}) ${
                            country.name
                          } `
                        : ''
                    }`"
                    :value="country.id"
                  />
                </el-select>
                <p class="validationCss" v-if="currInvalid" >
                  {{ currField }}
                </p>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div class="bottomInfo">
          <hr />
          <p style="word-break: break-word">
            {{ getDescription() }}
          </p>
        </div>
        <!-- -----------------button--------- -->
        <div class="popupBtnContainer">
          <el-button
            v-if="typeOfOperation === 'Add' || typeOfOperation === 'Copy'"
            class="popupBtn"
            type="primary"
            @click="onSubmit"
            >{{ typeOfOperation }} {{ typeOfTab }}</el-button
          ><el-button
            v-if="typeOfOperation === 'Edit'"
            class="popupBtn"
            type="primary"
            @click="onSubmit"
            >Update {{ typeOfTab }}</el-button
          >
        </div>
      </div>

      <!-- <p class="msg">Are you sure you want to oprn this {{ toBeAdded }} ?</p> -->
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
import { useProjectStore } from '../../../stores/project';
export default {
  props: [
    "isAddOrEditOrCopyPopupOpen",
    "typeOfTab",
    "editOrCopyObj",
    "typeOfOperation",
  ],

  data() {
    return {
      isError: false,
      chosenCurrencyCode: "",
      presetConversionFactor: null,
      currencyCodeChanged: null,
      customExchangeRateConversionFactorValidation: {
        required: true,
        min_value: 0.000001,
        decimal: 6,
      },
      currency: 52,
      prevConversionFactor: 1.1,
      currencyCode: "USD",
      escalationExceed: false,
      currInvalid: false,
      nameInvalid: false,
      monthInvalid: false,
      projectTypeInvalid: false,
      upFrontPaymentInvalid: false,
      rateInvalid: false,
      rateExceed: false,
      escalationRateInvalid: false,
      formObj: {
        name: "",
        project_type: "",
        upfront_payment: 0,
        escalation_rate: 0,
        ppa_rate: 0,
        description: "",
        country: 52,
        monthly_lease_payment: 0,
      },

      nameField: "* This field is required",
      currField: "*Currency Field is required",
      project_typeField: "* This field is required",
      upfront_paymentField: "* This field is required",
      escalation_Field: "* This field is required",
      ppa_rateField: "* Enter Value above 0",
      rateExceeds: "* Enter Valid Field",
      escalationIsInvalid: "* Enter the valid Percentage",
      monthly_lease_paymentInvalid: "* Enter Value above 0",
      descriptionField: "",
      projectNameValidationField: "",
    };
  },
  computed: {
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
    ...mapState(useGeographyStore, {
      countryDetails: "GET_COUNTRY_DETAILS",
    }),
  },
  watch: {
    currency: {
      handler(val) {
        if (val === "") {
          this.currInvalid = true;
        } else {
          this.currInvalid = false;
        }
      },
    },
    // "formObj.name": {
    //handler(val) {
    //if (val == "") {
    //this.nameInvalid = true;
    //   } else {
    //   this.nameInvalid = false;
    //}
    //},
    // },
    // "formObj.project_type": {
    // handler(val) {
    // if (val == "") {
    // this.projectTypeInvalid = true;
    //} else {
    //this.projectTypeInvalid = false;
    //}
    //},
    //"},
    /* "formObj.upfront_payment": {
      handler(val) {
        if (val === "") {
          this.upFrontPaymentInvalid = true;
        } else {
          this.upFrontPaymentInvalid = false;
        }
      },
    },
    "formObj.escalation_rate": {
      handler(val) {
        if (val === "") {
          this.escalationRateInvalid = true;
        } else {
          this.escalationRateInvalid = false;
        }
      },
    },
    "formObj.ppa_rate": {
      handler(val) {
        if (val === "") {
          this.rateInvalid = true;
        } else {
          this.rateInvalid = false;
        }
      },
    },
    "formObj.monthly_lease_payment": {
      handler(val) {
        if (val === "") {
          this.monthInvalid = true;
        } else {
          this.monthInvalid = false;
        } 
      },
    },*/
    editOrCopyObj(newval) {
      switch (this.$props.typeOfOperation) {
        case "Add":
          this.formObj = {
            name: "",
            project_type: "",
            upfront_payment: 0,
            escalation_rate: 0,
            ppa_rate: 0,
            monthly_lease_payment: 0,
            country: 52,
          };
          this.currency = 52;
          this.projectTypeInvalid = false;
          this.nameInvalid = false;
          break;
        case "Edit":
        case "Copy":
          this.editOrCopyObjFunction(newval);
          break;
      }
    },
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
    
    getDescription() {
      var unit = "";
      var rateMonthly = "";
      if (this.typeOfTab == "Lease") {
        unit = "/month payment";
        rateMonthly = this.formObj.monthly_lease_payment;
      } else {
        unit = "/kwh rate";
        rateMonthly = this.formObj.ppa_rate;
      }
      var res = ` ${
        this.currencySymbolNameMap[this.currencyCode]
      } ${rateMonthly}
      ${unit}  with
            ${this.formObj.escalation_rate}% escalation rate and
           ${this.currencySymbolNameMap[this.currencyCode]} ${
        this.formObj.upfront_payment
      } down payment for ${this.typeOfTab}.`;
      this.formObj.description = res;
      return res;
    },
    onCountryChange(countryId) {
      // chosen is the one selected through dropdown
      const chosenCountryDetails = this.countryDetails.find(
        (country) => country.id === countryId
      );
      this.formObj.country = chosenCountryDetails.id;
      this.currencyCode = chosenCountryDetails.currency_code;
      const chosenCountryCurrencyCode = chosenCountryDetails.currency_code;
      this.chosenCurrencyCode = chosenCountryDetails.currency_code;
    },
    editOrCopyObjFunction(newVal) {
      if (this.$props.editOrCopyObj) {
        this.formObj = {
          name: "",
          project_type: 0,
          upfront_payment: 0,
          escalation_rate: 0,
          ppa_rate: 0,
          country: 0,
          monthly_lease_payment: 0,
        };

        this.projectTypeInvalid = false;
        this.formObj.name = newVal.name;
        this.formObj.monthly_lease_payment = newVal.monthly_lease_payment;
        this.formObj.project_type = newVal.project_type;
        this.formObj.escalation_rate = newVal.escalation_rate;
        this.formObj.upfront_payment = newVal.upfront_payment;
        this.formObj.ppa_rate = newVal.ppa_rate;
        this.formObj.monthly_lease_payment = newVal.monthly_lease_payment;
        this.formObj.country = newVal.country;
        this.currency = newVal.country;
        const chosenCountryDetails = this.countryDetails.find(
          (country) => country.id === this.currency
        );
        this.currencyCode = chosenCountryDetails.currency_code;
      }
    },
    closeModal() {
      this.$emit("cancelAdd");
    },
    onSubmit() {
      const isFormValid = this.validate();
      if (!isFormValid) {
        return;
      }
      this.$emit("confirmOperation", this.formObj);

      this.formObj = {};
      this.currency = 52;
    },
    validate() {
      let countValid = 0;
      if (this.formObj.name === "") {
        this.nameInvalid = true;
        countValid++;
      } else {
        this.nameInvalid = false;
      }
      if (this.currency === "") {
        this.currInvalid = true;
        countValid++;
      } else {
        this.currInvalid = false;
      }
      if (this.formObj.project_type === "") {
        this.projectTypeInvalid = true;
        countValid++;
      } else {
        this.projectTypeInvalid = false;
      }
      if (
        this.formObj.upfront_payment < 0 ||
        this.formObj.upfront_payment === ""
      ) {
        this.upFrontPaymentInvalid = true;
        countValid++;
      } else {
        this.upFrontPaymentInvalid = false;
      }
      if (
        (this.formObj.ppa_rate <= 0 || this.formObj.ppa_rate === "") &&
        this.typeOfTab == "PPA"
      ) {
        this.rateInvalid = true;
        countValid++;
      } else {
        this.rateInvalid = false;
      }

      if (
        this.formObj.escalation_rate < 0 ||
        this.formObj.escalation_rate === ""
      ) {
        this.escalationRateInvalid = true;
        countValid++;
      } else {
        this.escalationRateInvalid = false;
      }

      if (this.formObj.escalation_rate > 100) {
        this.escalationExceed = true;
        countValid++;
      } else {
        this.escalationExceed = false;
      }
      if (
        (this.formObj.monthly_lease_payment <= 0 ||
          this.formObj.monthly_lease_payment == "") &&
        this.typeOfTab == "Lease"
      ) {
        this.monthInvalid = true;
        countValid++;
      } else {
        this.monthInvalid = false;
      }

      if (countValid === 0) {
        return true;
      } else {
        return false;
      }
    },
    Israte() {
      if (this.formObj.ppa_rate <= 0 || this.formObj.ppa_rate === "") {
        this.rateInvalid = true;
      } else {
        this.rateInvalid = false;
      }
    },
    ProjectType() {
      if (this.formObj.project_type === "") {
        this.projectTypeInvalid = true;
      } else {
        this.projectTypeInvalid = false;
      }
    },
    ProjectName() {
      if (this.formObj.name === "") {
        this.nameInvalid = true;
      } else {
        this.nameInvalid = false;
      }
    },
    isValidated() {
      if (this.formObj.name === "") {
        this.isError = true;
      }
    },
    Isupfront() {
      if (
        this.formObj.upfront_payment < 0 ||
        this.formObj.upfront_payment === ""
      ) {
        this.upFrontPaymentInvalid = true;
      } else {
        this.upFrontPaymentInvalid = false;
      }
    },
    Isescalation() {
      if (
        this.formObj.escalation_rate < 0 ||
        this.formObj.escalation_rate === ""
      ) {
        this.escalationRateInvalid = true;
      } else {
        this.escalationRateInvalid = false;
      }

      if (this.formObj.escalation_rate > 100) {
        this.escalationExceed = true;
      } else {
        this.escalationExceed = false;
      }
    },
    IsMonthly() {
      if (
        this.formObj.monthly_lease_payment <= 0 ||
        this.formObj.monthly_lease_payment === ""
      ) {
        this.monthInvalid = true;
      } else {
        this.monthInvalid = false;
      }
    },
  },
};
</script>

<style scoped>
.validationCss {
  word-break: break-word;
  margin: 2px auto 0px auto;
  line-height: 25px;
  font-size: 12px;
  color: #FF0000;
}
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}
.deleteModule .delete_module >>> .el-dialog {
  border-radius: 8px;
  margin-top: 4vh !important;
}
.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

.deleteModule .delete_module >>> ::placeholder {
  color: #222;
}

.Rectangle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 48px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.bottomInfo p {
  padding: 15px 20px;
  margin: auto;
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: 100;
  text-align: left;
  color: #777;
  line-height: 1.5;
}

.rectContent {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 20px;
}

.closeBtn {
  margin-right: 15px;
  cursor: pointer;
}

.inputContainer {
  padding: 8px 20px 20px 20px;
}

.inputs {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.deleteModule .delete_module >>> .el-form-item__label {
  font-size: 14px !important;
  color: #222 !important;
}

.deleteModule .delete_module >>> .el-form-item {
  width: 48%;
  margin-bottom: 5px !important;
}

.el-select {
  width: 100%;
}

.firstInput {
  width: 100% !important;
}

.deleteModule .delete_module >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
  /* padding: 0 25px !important; */
}

/* .rupeeIcon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  z-index: 100;
} */

.inputValues {
  position: absolute;
  right: 10px;
  font-size: 16px;
  z-index: 100;
  margin-top: 4px;
  color: #222;
}
.ProjectType {
  word-break: break-word;
  margin: 0px auto 0px auto;
  line-height: 25px;
  font-size: 14px;
}
.popupBtnContainer {
  margin: auto;
  text-align: center;
}

.popupBtn {
  padding: 17px 52px 17px 62px;
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  margin-bottom: 25px;
}
.deleteModule .delete_module >>> input::-webkit-outer-spin-button,
.deleteModule .delete_module >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

@media screen and (max-width: 1200px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 80% !important;
    margin-top: 0vh !important;
  }
}

@media screen and (max-width: 500px) {
  .deleteModule .delete_module >>> .el-form-item {
    width: 100%;
  }

  .deleteModule .delete_module >>> .el-form-item__label {
    /* font-size: 12px !important; */
  }

  .deleteModule .delete_module >>> .el-dialog__wrapper{
    overflow: hidden !important;
    margin-top: 8vh !important;
  }

  .Rectangle {
    height: 40px;
  }

  .rectContent {
    font-size: 14px;
    margin-left: 10px;
  }

  .closeBtn {
    height: 18px;
  }

  .popupBtn {
    padding: 12px 30px 12px 30px;
    font-size: 14px;
  }

  .inputContainer{
    padding: 8px 16px 20px 16px;
    height: 58vh;
    overflow-y: scroll;
}
  .bottomInfo p {
    padding: 15px 16px;
  }
  
}
</style>
