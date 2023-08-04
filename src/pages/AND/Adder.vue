<template>
  <div class="full-container">
    <div class="full-container-inner" v-if="selectedData.type == 'adder' ||
      selectedData.type == 'discount' ||
      this.mode ||
      this.selectedOption
      ">
      <div style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        ">
        <div v-if="mode == 'view'" style="display: flex; align-items: center; margin-left: -34px">
          <i style="font-size: 24px; cursor: pointer; margin-right: 10px" class="el-icon-back" @click="handleClose"></i>
          <h2 v-if="this.mode == 'view' &&
            (formData.type == 'Adder' || formData.type == 'adder')
            ">
            {{ form.heading1 }}
          </h2>
          <h2 v-else>Discount Details</h2>
        </div>
        <div v-else-if="mode == 'edit'" style="display: flex">
          <!-- <i
            style="font-size: 24px; cursor: pointer; margin-right: 10px"
            class="el-icon-back"
            @click="handleBack"
          ></i> -->
          <h2 v-if="formData.type == 'Adder' || formData.type == 'adder'">
            {{ form.heading }}
          </h2>
          <h2 v-else>Edit Discount</h2>
        </div>
        <div v-else-if="mode == 'adder'" style="display: flex">
          <!-- <i
            style="font-size: 24px; cursor: pointer; margin-right: 10px"
            class="el-icon-back"
            @click="handleClose"
          ></i> -->
          <h2>Create Adder</h2>
        </div>
        <div v-else style="display: flex">
          <!-- <i
            style="font-size: 24px; cursor: pointer; margin-right: 10px"
            class="el-icon-back"
            @click="handleClose"
          ></i> -->
          <h2>Create Discount</h2>
        </div>

        <div v-if="mode == 'view' && (permissions.isAdmin || permissions.toggleEdit)
          ">
          <img style="font-size: 24px; margin-right: 30px; cursor: pointer" @click="enterEditMode"
            src="./assets/Pencil.svg" />

          <img style="font-size: 24px; cursor: pointer" @click="deleteMode" src="./assets/Trash.svg" />
        </div>
      </div>
      <el-row style="height: 100%; padding: 0">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" style="height: 100%">
          <el-form :label-position="left" :model="formData" :rules="formRules" class="container" ref="form">
            <div v-for="field in form.fields" :key="field.prop">
              <el-form-item v-if="shouldDisplayField(field)" :label="getFieldLabel(field)" :key="field.prop" :class="(getFieldLabel(field) === 'Show adder amount in proposals' || getFieldLabel(field) === 'Show discount amount in proposals')
                ? 'homeowner'
                : ''
                ">
                <template v-if="mode == 'edit' || mode == 'adder' || mode == 'discount'">
                  <template v-if="field.input_type === 'text'">
                    <el-col :span="6">
                      <span class="asterisk" style="left: 45px">*</span>
                      <el-input v-model="formData[field.prop]" type="text"
                        @input="checkField(formData[field.prop], 'name')"
                        @blur="checkField(formData[field.prop], 'name')"></el-input><br />
                      <div :style="{
                        position: 'relative',
                        height: showWarning.name ? '10px' : '0',
                      }">
                        <span v-if="showWarning.name" class="valid-Warning">Please Enter a Name</span>
                      </div>
                    </el-col>
                  </template>
                  <template v-if="field.input_type === 'selection' &&
                    shouldDisplayField(field)
                    ">
                    <el-col :span="6">
                      <span :class="['asterisk']" style="left: 73px" v-if="field.prop === 'rate_type'">*</span>
                      <el-select v-model="formData[field.prop]" @change="checkField(formData[field.prop], field.prop)"
                        @blur="checkField(formData[field.prop], field.prop)">
                        <el-option v-for="(option, index) in field.options" :key="index" :label="option.label"
                          :value="option.value" :style="{
                            height: field.prop === 'sub_type' ? '48px' : '',
                          }">
                          <span style="font-size: 14px; font-weight: 400">{{
                            option.label
                          }}</span>
                          <p style="
                              line-height: 0;
                              font-size: 10px;
                              font-weight: 400;
                              margin: 0;
                              color: #777777;
                            ">
                            {{ option.description }}
                          </p>
                        </el-option>
                      </el-select>
                      <br style="line-height: 0" />
                      <div :style="{
                        position: 'relative',
                        height: showWarning.rate ? '10px' : '0',
                      }">
                        <span v-if="showWarning.rate" :class="[
                          'valid-Warning',
                          showWarning.rate ? 'slide-in' : 'slow-animation',
                        ]">Please Select an Option</span>
                      </div>
                    </el-col>
                  </template>
                  <template v-if="field.input_type === 'number'">
                    <el-col :span="6">
                      <div v-if="isPercentage">
                        <span class="asterisk" style="left: 138px">*</span>
                      </div>
                      <div v-else>
                        <span class="asterisk" style="left: 114px">*</span>
                        <span class="additiondis" style="left: 0px; top: 15px">{{ field.adderdis }}</span>
                      </div>

                      <el-form-item :prop="field.prop" :rules="numberInputRules">
                        <el-input style="display: flex; justify-content: space-between; padding-left: 0px; height: 20px"
                          v-model="formData[field.prop]" type="number" @input="$refs.form.validate()">
                          <template v-if="formData.rate_type !==
                            'percentage_of_system_cost' &&
                            formData.rate_type !==
                            'Percentage (of system cost)'
                            " slot="prepend"><span class="prefix">
                              <!-- {{
                                handleCurrencySymbol
                              }} -->
                              <el-select style="width:100%" v-model="currency" filterable @change="onCountryChange">
                                <el-option v-for="country in countryDetails" :key="country.id"
                                  :label=" `${country.currency_code}      ${
                    currencySymbolNameMap[country.currency_code]
                      ? `(${currencySymbolNameMap[country.currency_code]}) ${
                          country.name
                        } `
                      : ''
                  }`" :value="country.id" />
                              </el-select>
                            </span></template>
                          <template v-else slot="append"><span class="suffex">%</span></template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </template>
                  <template v-if="field.input_type === 'switch'">
                    <!-- <el-col > -->
                    <div class="el-switch-container" v-if="field.prop === 'allow_quantity_edit' &&
                      formData.rate_type !== 'Flat rate' &&
                      formData.rate_type !== 'flat_rate'
                      ">
                      <el-tooltip placement="top" effect="dark"
                        :content="'Quantity can be edited in only flat rate type'">
                        <el-switch v-model="formData[field.prop]" :active-value="field.options[0]"
                          :inactive-value="field.options[1]" :disabled="field.prop === 'allow_quantity_edit' &&
                            formData.rate_type !== 'Flat rate' &&
                            formData.rate_type !== 'flat_rate'
                            "></el-switch>
                      </el-tooltip>
                    </div>
                    <!-- <div
                      class="el-switch-container"
                      v-else-if="
                        field.prop === 'show_adder_total' &&
                        formData.is_homeowner_facing == false && (formData.type=='Adder' || mode=='adder')
                      "
                    >
                      <el-tooltip
                        placement="top"
                        effect="dark"
                        :content="'Show adder total will be modified only if Is Homeowner Facing is selected.'"
                      >
                        <el-switch
                          v-model="formData[field.prop]"
                          :active-value="field.options[0]"
                          :inactive-value="field.options[1]"
                          :disabled="
                            field.prop === 'show_adder_total' &&
                            formData.is_homeowner_facing == false
                          "
                        ></el-switch>
                      </el-tooltip>
                    </div> -->
                    <!-- <div
                      class="el-switch-container"
                      v-else-if="
                        field.prop === 'show_adder_total' &&
                        formData.is_homeowner_facing == true
                      "
                    >
                      <el-tooltip
                        placement="top"
                        effect="dark"
                        :content="'Show discount total will be modified only if Is Homeowner Facing is selected.'"
                      >
                        <el-switch
                          v-model="formData[field.prop]"
                          :active-value="field.options[0]"
                          :inactive-value="field.options[1]"
                          :disabled="
                            field.prop === 'show_adder_total' &&
                            formData.is_homeowner_facing == false
                          "
                        ></el-switch>
                      </el-tooltip>
                    </div> -->
                    <div v-else>
                      <div class="el-switch-container">
                        <el-switch v-model="formData[field.prop]" :active-value="field.options[0]"
                          :inactive-value="field.options[1]"></el-switch>
                      </div>
                    </div>
                    <div v-if="formData.type == 'Adder' ||formData.type == 'adder' || mode == 'adder'" style="padding-top: -10px"
                      class="addDiscription">
                      {{ field.adder_dis }}
                    </div>
                    <div v-else style="padding-top: -10px" class="addDiscription">
                      {{ field.discount_dis }}
                    </div>

                    <!-- </el-col> -->
                  </template>
                </template>
                <template v-else-if="mode == 'view'">
                  <!-- <el-col > -->
                  <span style="margin-top: 20px">{{
                    conversion(formData[field.prop])
                  }}</span>
                  <div style="padding-top: -10px" class="addDiscription">
                    {{ !isPercentage ? field.adderdis : "" }}
                  </div>
                  <div v-if="formData.type == 'Adder' || formData.type == 'adder' || mode == 'adder'" style="padding-top: -10px"
                    class="addDiscription">
                    {{ field.adder_dis }}
                  </div>
                  <div v-else style="padding-top: -10px" class="addDiscription">
                    {{ field.discount_dis }}
                  </div>
                  <!-- </el-col> -->
                </template>
              </el-form-item>
            </div>

            <template v-if="mode == 'edit' || mode == 'create'">
              <div class="form-footer">
                <el-button type="default" @click="handleCancel">Cancel</el-button>
                <el-button type="primary" @click="validateForm(formData)">Save</el-button>
              </div>
            </template>
            <template v-if="mode == 'adder' || mode == 'discount'">
              <div class="form-footer">
                <el-button type="default" @click="handleCancel">Cancel</el-button>
                <el-button type="primary" @click="validateSave(formData)">Save</el-button>
              </div>
            </template>
          </el-form>
        </el-col>
      </el-row>
    </div>
    <div>
      <DeleteConformation v-if="this.delete == true" :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
        :title="``" :info="info" @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
        @confirmDelete="confirmDelete" />
      <DeleteConformation v-else :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen" :title="``"
        :info="'Any unsaved changes will be discarded'" @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
        @confirmDelete="confirmCancel" />
    </div>
  </div>
</template>

<script>
import {
  getCurrencySymbol,
  getFormattedComas,
} from "../../utils/numberFormat/currencyFormatter";
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import { mapState, mapActions } from "pinia";
import { useGeographyStore } from "../../stores/geography";
import { useProjectStore } from '../../stores/project';
import DeleteConformation from "../designOrders/components/deleteConformation.vue";
export default {
  props: {
    handleClose: {
      type: Function,
      default: () => { },
    },
    selectedData: {
      type: Object,
      required: true,
    },
    selectedOption: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      validator: (value) => {
        return ["view", "create", "edit", "adder", "discount"].includes(value);
      },
    },
    form: {
      type: Object,
    },
    permissions: {
      type: Object,
      default: {
        toggleEdit: false,
        isAdmin: false,
      },
    },
  },
  nonReactiveData() {
    return {
      currencySymbolNameMap
    }},
  data() {
    return {
      currencyType: '',
      currency: this.selectedData.country ? this.selectedData.country : JSON.parse(localStorage.getItem("organisation")).country,
      isPercentage: false,
      showWarning: { name: false, rate: false },
      validateTimeout: null,
      countryCode: JSON.parse(localStorage.getItem("organisation")) || {},
      numberInputRules: [
        {
          validator: this.validateNumberInput,
          trigger: "blur",
        },
      ],
      // editMode: false,
      delete: false,
      isDeleteProjectDocumentPopupOpen: false,
      info: "",
      selectedSwitchValue: "",
      fullscreenLoading: true,
      formData: {
        id: "",
        name: "",
        rate_type: "",
        sub_type: "",
        default_amount: "",
        type: "",
        country: JSON.parse(localStorage.getItem("organisation")).country,
        // defaultPercentage: 0,
        allow_amount_edit: false,
        allow_quantity_edit: false,
        is_homeowner_facing: true,
        show_adder_total: false,
        apply_incentives: false,
      },
      formRules: {},
    };
  },
  watch: {
    countryDetails(val) {
      console.log(val)
    },
    selectedData: {
      immediate: true,
      handler(value) {
        this.formData.id = value.id;
        this.formData.name = value.name || "";
        this.formData.country=value.country||'';
        this.formData.default_amount = value.default_value;
        // value.rate_type == "Percentage (of system cost)"
        //   ? value.default_percentage
        //   : value.default_amount || "";
        // this.formData.defaultPercentage = value.defaultPercentage
        this.formData.rate_type = value.rate_type || "";
        this.formData.sub_type =
          value.rate_type == "Per sq ft. (of roof area)"
            ? value.sub_type
            : "" || "";
        this.formData.type = value.type || "";
        this.formData.country = value.country || "";
        this.formData.allow_amount_edit = value.allow_amount_edit || false;
        this.formData.allow_quantity_edit = value.allow_quantity_edit || false;
        this.formData.is_homeowner_facing = value.is_homeowner_facing || false;
        this.formData.show_adder_total = value.show_adder_total || false;
        this.formData.apply_incentives = value.apply_incentives || false;
      },
    },
    mode: {
      immediate: true,
      handler(newMode) {
        this.showWarning.name = false;
        this.showWarning.rate = false;
        if (newMode === "adder" || newMode === "discount") {
          this.initializeFormData();
        }
      },
    },
  },
  mounted() {
    this.fetchCountryDetails();
    console.log(this.countryDetails);
  },
  computed: {
    ...mapActions(useGeographyStore, {
      fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
    }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
    ...mapState(useGeographyStore, {
      countryDetails: "GET_COUNTRY_DETAILS",
    }),
    handleCurrencySymbol() {
      return this.countryCode
        ? getCurrencySymbol(this.countryCode.currency_code)
        : "";
    },
  },

  components: {
    DeleteConformation,
  },
  methods: {
    onCountryChange(countryId) {
      // chosen is the one selected through dropdown
      const chosenCountryDetails = this.countryDetails.find(
        (country) => country.id === countryId
      );
      console.log(chosenCountryDetails);
      this.currencyCode = chosenCountryDetails.currency_code;
      const chosenCountryCurrencyCode = chosenCountryDetails.currency_code;
      this.chosenCurrencyCode = chosenCountryDetails.id;
      console.log(this.chosenCurrencyCode);
      this.formData.country = this.chosenCurrencyCode;
      console.log(this.formData)
    },
    checkField(value, type) {
      if (type === "name") {
        if (!value) {
          this.showWarning.name = true;
        } else {
          this.showWarning.name = false;
        }
      }
      if (type === "rate_type") {
        if (!value) {
          this.showWarning.rate = true;
        } else {
          this.showWarning.rate = false;
        }
      }
    },
    formatComas() {
      return getFormattedComas(this.countryCode.currency_code, 1000000);
    },
    validateNumberInput(rule, value, callback, form) {
      if (this.isPercentage) {
        if (!Number.isNaN(parseFloat(value)) && value > 0 && value < 101) {
          callback();
        } else {
          callback(
            new Error("Percentage  must be greater than 0%  and less than 100%")
          );
        }
      } else {
        if (!Number.isNaN(parseFloat(value)) && value > 0 && value < 1000001) {
          callback();
        } else {
          callback(
            new Error(
              `Please enter a valid number more than 0 and less than ${this.formatComas()}`
            )
          );
        }
      }
    },
    conversion(value) {
      if (value === true) {
        return "Yes"; // Return "Yes" for true
      } else if (value === false) {
        return "No"; // Return "No" for false
      } else {
        return value; // Return value as it is for other cases
      }
    },
    getFieldLabel(field) {
      if (field.prop === "default_amount") {
        if (
          this.formData.rate_type === "Percentage (of system cost)" ||
          this.formData.rate_type === "percentage_of_system_cost"
        ) {
          this.isPercentage = true;
          return "Default Percentage";
        } else {
          this.isPercentage = false;
          return "Default Amount";
        }
      } else if (field.prop == 'is_homeowner_facing') {
        if (this.mode == 'adder' || this.formData.type == 'Adder' || this.formData.type == 'adder') {
          return 'Show adder in proposals'
        } else {
          return 'Show discount in proposals'
        }
      }
      else if (
        field.prop === "sub_type" &&
        this.formData.rate_type !== "Per sq ft. (of roof area)" &&
        this.formData.rate_type !== "per_sq_feet_of_roof_area"
      ) {
        return ""; // Return empty string to hide the label
      } else if (field.prop === "show_adder_total") {
        if (this.formData.is_homeowner_facing !== true &&
          this.formData.is_homeowner_facing !== "Yes") {
          return "";
        } else if (this.mode == 'adder' || this.formData.type == 'Adder' || this.formData.type == 'adder') {
          return 'Show adder amount in proposals'
        } else {
          return 'Show discount amount in proposals'
        }
      }
      return field.name;
    },
    shouldDisplayField(field) {
      if (
        field.prop === "sub_type" &&
        this.formData.rate_type !== "Per sq ft. (of roof area)" &&
        this.formData.rate_type !== "per_sq_feet_of_roof_area"
      ) {
        //console.log("hiding sub type")
        return false; // Hide the field
      } else if (
        field.prop == "allow_quantity_edit" &&
        this.formData.rate_type !== "Flat rate" &&
        this.formData.rate_type !== "flat_rate"
      ) {
        this.formData.allow_quantity_edit = false;
        return true;
      } else if (
        field.prop === "show_adder_total" &&
        this.formData.is_homeowner_facing !== true &&
        this.formData.is_homeowner_facing !== "Yes"
      ) {
        this.formData.show_adder_total = true;
        return false;
      }
      return true;
    },
    enterEditMode() {
      this.mode = "edit";
      // this.formData.country=this.selectedData.country
      this.currency=this.selectedData.country
      console.log(this.formData)
      this.formData.default_amount =
        this.selectedData.rate_type == "Percentage (of system cost)"
          ? this.selectedData.default_percentage
          : this.selectedData.default_amount || "";
      this.formData.defaultPercentage = this.selectedData.defaultPercentage;
    },
    deleteMode() {
      this.delete = true;
      this.isDeleteProjectDocumentPopupOpen = true;
      this.info = "Are you sure you want to delete this Adder?";
      // alert("It's Working");
    },
    handleBack() {
      this.mode = "view";
      // this.resetForm();
    },
    confirmDelete(value) {
      this.$emit("delete", this.selectedData);
      this.handleClose();
    },
    confirmCancel(value) {
      // console.log(this.selectedData);
      // this.$emit("delete", this.selectedData);
      this.handleClose();
    },

    handleCancel() {
      this.isDeleteProjectDocumentPopupOpen = true;
      this.info = "Any unsaved changes will be discarded";
    },
    cancelDelete() {
      this.isDeleteProjectDocumentPopupOpen = false;
    },
    initializeFormData() {
      this.formData.name = ""; // Set initial value for the 'name' property
      this.formData.default_amount = ""; // Set initial value for the 'defaultAmount' property
      this.formData.rate_type = ""; // Set initial value for the 'rateType' property
      this.formData.sub_type = "";
      this.formData.type = this.mode;
      this.currency=this.countryCode.country
      // this.formData.defaultPercentage = 0;
      this.formData.allow_amount_edit = false;
      this.formData.allow_quantity_edit = false;
      this.formData.is_homeowner_facing = false;
      this.formData.show_adder_total = false;
      this.formData.apply_incentives = false;
      // Set other initial values for the remaining properties
    },
    cancelEdit() {
      this.mode = "view";
      // this.resetForm();
    },
    resetForm() {
      // Reset the form data and clear any validation errors
      this.formData = {};
      this.$refs.form.resetFields();
    },
    validateForm(formData) {
      this.formData.country = this.formData.country ? this.formData.country : this.countryCode.country ;
      this.formData.country=(this.formData.rate_type=="Percentage (of system cost)" || this.formData.rate_type=='percentage_of_system_cost')? "" :this.formData.country
      this.formData.show_adder_total = !this.formData.is_homeowner_facing && this.formData.show_adder_total ? false : this.formData.show_adder_total 
      let a = !!!formData.name,
        b = !!!formData.rate_type;
      this.$refs.form.validate();
      if (a || b) {
        if (a) this.showWarning.name = a;
        if (b) this.showWarning.rate = b;
      } else {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (formData.name.length > 149 == true) {
              this.$emit("updateData", formData);
            } else {
              this.$emit("updateData", formData);
              this.handleClose();
            }
          }
          // else {
          //   this.$message.error("Form validation failed.");
          // }
        });
      }
    },

    validateSave(formData) {
      this.formData.country = this.formData.country ? this.formData.country : this.countryCode.country ;
       this.formData.show_adder_total = !this.formData.is_homeowner_facing && this.formData.show_adder_total ? false : this.formData.show_adder_total 
       this.formData.country=(this.formData.rate_type=="Percentage (of system cost)" || this.formData.rate_type=='percentage_of_system_cost')? "" :this.formData.country
      let a = !!!formData.name,
        b = !!!formData.rate_type;
      // if(!b && formData.sub_type === ''){
      //   console.log(!b)
      //   if(formData.rate_type === "Per sq ft. (of roof area)" || formData.rate_type === "per_sq_feet_of_roof_area"){
      //     this.showWarning.rate = true
      //   }
      // }
      this.$refs.form.validate();
      if (a || b) {
        if (a) this.showWarning.name = a;
        if (b) this.showWarning.rate = b;
        //this.$message.error("Form validation failed.");
      } else {
        this.$refs.form.validate((valid) => {
          if (valid) {
            if (formData.name.length > 149 == true) {
              this.$emit("submit", formData);
            } else {
              this.$emit("submit", formData);
              this.handleClose();
            }
          }
          // else {
          //   this.$message.error("Form validation failed.");
          // }
        });
      }
    },
  },

  // created() {
  //   this.numberInputRules[0].message = `Please enter a valid number more than 0 and less than ${this.formatComas()}`;
  // },
};
</script>

<style scoped>
.container::v-deep.el-form .el-form-item .el-form-item__content {
  line-height: 37px;
  margin-bottom: 10px;
}

.addDiscription {
  width: 45%;
  margin-top: -9px;
  color: #777777;
  line-height: 16px;
  font-size: 14px;
  font-weight: 400;
}

.prefix {
  margin-left: 3px;
  margin-right: 5px;
  padding: 5px;
}

.suffex {
  margin-left: -25px;
}

.container::v-deep.el-form .el-form-item .el-form-item__label {
  text-align: left;
  vertical-align: middle;
  height: 26px;
  /*float: left;*/
  font-weight: 400;
  font-size: 16px;
  color: #343a45;
  line-height: 34px;
  /* padding: 0 12px 0 0; */
  box-sizing: border-box;
  width: 50%;
}

/* .container::v-deep.el-form .el-form-item .el-form-item__content .el-col .el-col-6 .el-form-item .el-form-item__content .el-input .el-input-group .el-input-group--prepend .el-input__inner{
  padding-left:25px;
} */
.el-form .el-form-item {
  margin-bottom: 10px;
}

.container::v-deep.el-form .el-form-item .el-form-item__content .el-form-item__error {
  color: red;
  font-size: 11px;
  line-height: 0.9;
  margin-top: 19px;
  /* padding-top: 4px; */
  width: 250px;
  position: absolute;
  top: 100%;
  left: 0;
}
.container::v-deep.el-form .el-form-item .el-input .el-input--suffix{
  width:80px;
  margin-top:5px;
  margin-left:10px;
}
/* .container::v-deep.el-form .el-form-item .el-form-item__content . */
.valid-Warning {
  color: red;
  line-height: 0;
  font-size: 12px;
  /* color: #f56c6c; */
  position: absolute;
  bottom: 2px;
}

.container::v-deep.el-form .el-form-item .el-input {
  position: relative;
  text-align: left;
  font-size: 16px;
  line-height: 30px;
  display: inline-block;
  width: 250px;
}

.container::v-deep.el-form .el-form-item .el-input .el-input-group__prepend {
  background-color: transparent;
  margin-top: 5px;
  font-size: 14px;
  color: #606266;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: none;
  border-radius: 4px;
  padding: 0 0px;
  width: 150px;
  white-space: nowrap;
}

.container::v-deep.el-form .el-form-item .el-input .el-input-group__append {
  background-color: transparent;
  margin-top: 5px;
  color: #606266;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  border: none;
  border-radius: 4px;
  padding: 0;
  width: 1px;
  white-space: nowrap;
}

.container::v-deep.el-form .el-form-item .el-input .el-input__inner {
  -webkit-appearance: none;
  background-color: #e8edf2;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px 0 20px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}

.el-switch {
  float: left;
  width: 31px;
  height: 1rem;
}

::v-deep .el-form .el-form-item .el-form-item__content .el-switch.is-checked .el-switch__core::after {
  margin-left: -17px !important;
}

.el-switch-container {
  padding-top: 7px;
  /* margin-bottom: 7px; */
}

.el-switch__core {}

.container {
  /* display:grid; */
  padding: 0;
  margin: 0;
  height: 100%;
  overflow-y: scroll;
}

.full-container {
  /* display:grid; */
  height: 100%;
}

.full-container-inner {
  height: 90%;
}

.el-select-dropdown__item.selected {
  color: #222222;
  font-weight: bold;
}

.el-select-dropdown__item {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #222222;
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
}

.form-footer {
  margin-top: 10px;
  margin-bottom: 0px;
  margin-right: 2px;
  display: flex;
  justify-content: flex-end;
}

.asterisk {
  position: absolute;
  color: red;
}

.additiondis {
  position: absolute;
  color: #777777;
  margin-top: 11px;
  line-height: 15px;
  font-size: 14px;
  font-weight: 400;
}

.slow-animation {
  opacity: 0;
}

.slide-in {
  animation: slide 0.7s linear;
  opacity: 100%;
}

@keyframes slide {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 100%;
  }
}

.homeowner {
  padding-left: 3%;
  padding-right: 3%;
}
</style>
