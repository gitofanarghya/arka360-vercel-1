<template>
    <div id="projectInformationEditDialog">
        <el-dialog
            :visible="isProjectEditFormVisible"
            :close-on-click-modal="false"
            title="Edit Project Details"
            width="40%"
            @open="assignProjectDataToForm"
            @close="cancelOnClickAction">
            <div class="scroll_content">
                <el-form
                    :model="projectDetails"
                    :label-width="labelWidth"
                    size="mini"
                    label-position="left"
                    @submit.native.prevent>
                    <!-- <p class="formHeadings"> Project Details </p> -->
                    <!-- <el-form-item
                        label="Project Name">
                        <el-input
                            v-validate="projectNameValidation"
                            v-model="projectDetails.projectName"
                            name="Project Name"/>
                        <p class="formErrors"> {{ errors.first('Project Name') }} </p>
                    </el-form-item> -->

                      <div class="floating-label">
                  <input class="floating-input" type="text" v-validate="projectNameValidation" v-model="projectDetails.projectName" 
                   name="Project Name"/>
                  <label>Project Name*</label>
                   <p class="formErrors"> {{ errors.first('Project Name') }} </p>
                </div>

                
                    <!-- <p class="formHeadings"> Client Details </p>
                    <el-form-item
                        label="Name">
                        <el-input
                            v-validate="clientNameValidation"
                            v-model="projectDetails.clientName"
                            name="Client Name"/>
                        <p class="formErrors">{{ errors.first('Client Name') }}</p>
                    </el-form-item> -->


                    <div class="floating-label">
                  <input class="floating-input" type="text" v-validate="clientNameValidation" v-model="projectDetails.clientName" 
                   name="Client Name"/>
                  <label>Client Name*</label>
                   <p class="formErrors"> {{ errors.first('Client Name') }} </p>
                </div>

                     

                    <!-- <el-form-item label="Contact Number">
                        <el-input v-model="projectDetails.clientPhone"/>
                    </el-form-item> -->
            
                    <el-form-item label="Contact Number*">
                              <!-- <label>Contact Number</label> -->
                      <!-- <input class="floating-input" maxlength="21" type="text" onkeypress="return ((event.charCode > 47 && 
                        event.charCode < 58) || (event.charCode === 40 || event.charCode === 41 || event.charCode === 43||event.charCode === 45))" v-model="projectDetails.clientPhone" /> -->
                            <vue-tel-input 
                                v-model="clientNumberDetails.number"
                                :defaultCountry="clientNumberDetails.defaultDialCode"
                                :dropdownOptions="{showFlags:true,showDialCodeInSelection:true,showDialCodeInList:true, showSearchBox:true}" 
                                :autoFormat="false"
                                :mode="'international'"
                                :validCharactersOnly="true"
                                @country-changed="setCountryCode"
                                @input="setInputNumber"
                                @open="onDropdownOpen(true)"    
                                @close="onDropdownOpen(false)"
                                name="Client Number"
                            >
                            <template v-slot:arrow-icon>
                                    <span>{{ open ? '▲' : '▼' }}</span> 
                                </template>
                            </vue-tel-input>
                    </el-form-item>




                    <!-- <el-form-item label="Email">
                        <el-input v-model="projectDetails.clientEmail"/>
                    </el-form-item> -->


                      <div class="floating-label">
                  <input class="floating-input" type="text" name="email" v-model="projectDetails.clientEmail"  v-validate.immediate="emailValidation"  @input="handleEmail"/>
                  <p v-show="errors.has('email')" class="formErrors" id="err-phone">{{ errors.first('email') }}</p>
                  <label>Email Id</label>
                </div>
                 
                    <!-- <el-form-item label="Address">
                        <el-input v-model="projectDetails.clientAddress"/>
                    </el-form-item> -->


                     <div class="floating-label">
                         <textarea class="floating-textarea floating-input" v-model="projectDetails.clientAddress" 
                   name="Client Name" cols="30" rows="3"></textarea>
                  <!-- <input /> -->
                  <label>Address</label>
                </div>



                    <el-form-item label="Currency">
                        <el-select
                            v-model="projectDetails.country"
                            filterable
                            remote
                            reserve-keyword
                            @change="onCountryChange">
                            <el-option
                                v-for="country in countryDetails"
                                :key="country.id"
                                :label="`${country.currency_code} ${currencySymbolNameMap[country.currency_code] ? `(${currencySymbolNameMap[country.currency_code]}) ${country.name} ` : ''}`"
                                :value="country.id"/>
                        </el-select>
                    </el-form-item>

                    <div class="exchange-rate" v-show="currencyCodeChanged === true">
                        <el-form-item label="Select Exchange Rate">
                            <el-radio-group v-model="exchangeRateType">
                                <el-radio :label="exchangeRateTypes.preset">Preset</el-radio>
                                <el-radio :label="exchangeRateTypes.custom">Custom</el-radio>
                            </el-radio-group>
                        </el-form-item>

                        <div
                            v-show="exchangeRateType === exchangeRateTypes.preset"
                            :style="{marginLeft: labelWidth}" class="conversion">
                            1 {{ projectInformation.country_details.currency_code }} = {{ presetConversionFactor }} {{ chosenCurrencyCode }} 
                        </div>
                        <div
                            v-show="exchangeRateType === exchangeRateTypes.custom"
                            class="custom-exchange-rate"
                            :style="{marginLeft: labelWidth, display: 'flex', alignItems: 'center'}">
                            1 {{ projectInformation.country_details.currency_code }} =
                            <el-input
                                v-validate="customExchangeRateConversionFactorValidation"
                                v-model="customExchangeRateConversionFactor"
                                name="Exchange Rate"
                                class="reducedHeightInput"
                                style="width: 100px; margin: 0 10px"/>
                            {{ chosenCurrencyCode }}
                        </div>
                        <p
                            :style="{marginLeft: labelWidth}"
                            class="formErrors exchange-error">
                            {{ errors.first('Exchange Rate') }}
                        </p>
                    </div>

                    <div
                        v-show="currencyCodeChanged === false"
                        class="currency-message"
                        :style="{marginLeft: labelWidth}">
                        The currency you have selected is similar to the previously selected currency.
                    </div>
                    
                    <el-form-item
                        v-if="PLANS_HAVING_SMALL_AND_MEDIUM.includes(userTier)"
                        label="Project Size">
                        <el-radio
                            v-model="projectDetails.quotaType"
                            :disabled="!isSmallProjectSizeRadioEnabled"
                            :label="QUOTA_TYPE.SMALL">
                            Small (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.SMALL }} kW)
                        </el-radio>
                        <el-tooltip
                            :disabled="!isMediumProjectSizeRadioEnabled || !isSmallProjectSizeRadioEnabled"
                            :content="TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO"
                            effect="light"
                            placement="bottom">
                            <el-radio
                                :disabled="!isMediumProjectSizeRadioEnabled"
                                v-model="projectDetails.quotaType"
                                :label="QUOTA_TYPE.MEDIUM">
                                Medium (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.MEDIUM }} kW)
                            </el-radio>
                        </el-tooltip>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <button
                    :disabled="!isValueUpdated || errors.items.length > 0 || areProjectDetailsBeingEdited"                            
                    class="button-confirm"
                    style="width: 74px"
                    @click="confirmOnClickAction">
                    <span v-show="!areProjectDetailsBeingEdited">Update</span>
                    <i
                        v-show="areProjectDetailsBeingEdited"
                        class="el-icon-loading"/>
                </button>
            </span>    
        </el-dialog>

    </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useProjectStore } from '../../../../stores/project';
import { useGeographyStore } from '../../../../stores/geography';
import { useOrganisationStore } from '../../../../stores/organisation';
import currencySymbolNameMap from '@/pages/currency-symbol-name-map';

import {
    USER_TIER,
    PLANS_HAVING_SMALL_AND_MEDIUM,
    TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
    QUOTA_TYPE,
    TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
    exchangeRateTypes,
} from '@/pages/constants';
import { QUOTA_TYPES_DC_CAP_SIZE } from '@/core/coreConstants';

export default {
    name: 'ProjectInformationEditDialog',
    props: {
        isProjectEditFormVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            projectDetails: {
                projectName: '',
                clientName: '',
                clientPhone: '',
                clientAddress: '',
                clientEmail: '',
                quotaType: this.QUOTA_TYPE.SMALL,
                country: '',
            },
            emailValidation:{
                email:true,
            },
            customExchangeRateConversionFactor: 1,
            labelWidth: '150px',
            exchangeRateType: this.exchangeRateTypes.preset,
            areProjectDetailsBeingEdited: false,
            isValueUpdated: false,
            clientNameValidation: {
                required: true,
            },
            projectNameValidation: {
                required: true,
            },
            chosenCurrencyCode: '',
            presetConversionFactor: null,
            currencyCodeChanged: null,
            customExchangeRateConversionFactorValidation: {
                required: true,
                min_value: 0.000001,
                decimal: 6,
            },
            clientNumberDetails: {
                currentCountryCode: 0,
                defaultDialCode: 0,
                number: 0
            },
            open: false
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            projectInformation: 'GET_PROJECT_INFORMATION',
        }),
        ...mapState(useGeographyStore, {
            countryDetails: 'GET_COUNTRY_DETAILS',
        }),
        ...mapState(useOrganisationStore, {
            userTier: 'GET_USER_TIER',
            availableProjectSizes: 'GET_AVAILABLE_PROJECT_SIZES',
        }),

        isSmallProjectSizeRadioEnabled() {
            return this.projectInformation.quotaType === this.QUOTA_TYPE.SMALL;
        },
        isMediumProjectSizeRadioEnabled() {
            return (this.availableProjectSizes.medium || this.projectInformation.quotaType === this.QUOTA_TYPE.MEDIUM);
        },
    },
    nonReactiveData() {
        return {
            USER_TIER,
            PLANS_HAVING_SMALL_AND_MEDIUM,
            QUOTA_TYPES_DC_CAP_SIZE,
            TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
            QUOTA_TYPE,
            TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
            currencySymbolNameMap,
            exchangeRateTypes,
        };
    },
    methods: {
        ...mapActions(useProjectStore, [
            'UPDATE_PROJECT_INFORMATION',
        ]),
        separateClientNumber(num){
            if(num){
                this.clientNumberDetails.currentCountryCode = this.clientNumberDetails.defaultDialCode = parseInt(num.substring(0, num.indexOf(' '))); 
                this.clientNumberDetails.number = num.substring(num.indexOf(' ') + 1); 
            }else{
                this.clientNumberDetails.defaultDialCode = this.projectInformation.country_details.currency_code
            }
        },
        handleEmail(){
            this.$validator.validate('email', this.form.email_address);
        },
        setCountryCode(country) {
            this.clientNumberDetails.currentCountryCode = parseInt(country.dialCode)
            this.projectDetails.clientPhone = `+${country.dialCode} ${this.clientNumberDetails.number}`
        },
        setInputNumber(number){
            let updatedNum = `+${this.clientNumberDetails.currentCountryCode} ${number}`
            if(this.projectDetails.clientPhone === updatedNum) return
            this.isValueUpdated = true
            this.projectDetails.clientPhone = updatedNum
        },
        onDropdownOpen(val){
            this.open = val;
        },

        assignProjectDataToForm() {
            this.$validator.reset();
            this.projectDetails.projectName = this.projectInformation.projectName;
            this.projectDetails.clientName = this.projectInformation.clientName;
            this.separateClientNumber(this.projectInformation.clientPhone)
            this.projectDetails.clientPhone = this.projectInformation.clientPhone;
            this.projectDetails.clientAddress = this.projectInformation.clientAddress;
            this.projectDetails.clientEmail = this.projectInformation.clientEmail;
            this.projectDetails.country = this.projectInformation.country;
            console.log(this.projectDetails.country)
            this.clientNumberDetails.defaultDialCode = (this.countryDetails.find(country => country.id === this.projectDetails.country)).country_code
            this.projectDetails.quotaType = this.projectInformation.quotaType;
            this.currencyCodeChanged = null;
            this.customExchangeRateConversionFactor = 1;
            this.exchangeRateType = this.exchangeRateTypes.preset;
        },
        async confirmOnClickAction() {
            this.areProjectDetailsBeingEdited = true;
            const patchData = {
                name: this.projectDetails.projectName,
                client_name: this.projectDetails.clientName,
                client_phone: `+${this.clientNumberDetails.currentCountryCode} ${this.clientNumberDetails.number}`,
                client_address: this.projectDetails.clientAddress,
                client_email_id: this.projectDetails.clientEmail,
                quota_type: this.projectDetails.quotaType,
                country: this.projectDetails.country,
            };
            if (this.exchangeRateType === exchangeRateTypes.custom && this.currencyCodeChanged) {
                patchData.conversion_factor = Number(this.customExchangeRateConversionFactor);
            }

            try{
                await this.UPDATE_PROJECT_INFORMATION(patchData);
                this.$message({
                showClose: true,
                message: 'Project details updated.',
                type: "success",
                center: true
            })}catch(error){
                let errorMessage = error.response.status === 403 ? "You don't have permission to edit this project." : 'error'
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: "error",
                    center: true
                })   
            }
            
            this.$emit('update:isProjectEditFormVisible', false);
            this.areProjectDetailsBeingEdited = false;
        },
        onCountryChange(countryId) {
            // chosen is the one selected through dropdown
            const chosenCountryDetails = this.countryDetails.find(country => country.id === countryId);
            const chosenCountryCurrencyCode = chosenCountryDetails.currency_code;
            this.chosenCurrencyCode = chosenCountryDetails.currency_code;
            this.presetConversionFactor = parseFloat((Number(chosenCountryDetails.conversion_factor) / this.projectInformation.country_details.conversion_factor).toFixed(6));
            this.currencyCodeChanged = chosenCountryCurrencyCode !== this.projectInformation.country_details.currency_code;
            this.customExchangeRateConversionFactor = this.presetConversionFactor;
        },
        cancelOnClickAction() {
            this.$emit('update:isProjectEditFormVisible', false);
        },
        isValueUpdate() {
            this.isValueUpdated = !_.isMatch(this.projectInformation, this.projectDetails);
        },
    },
     watch: {
        projectDetails: {
            deep: true,
            handler(value) {
                this.isValueUpdate();
            },
        }
    },
};
</script>



<style type="text/css" scoped>


#projectInformationEditDialog >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

.reducedHeightInput .el-input__inner {
    height: 30px;
    line-height: 30px;
}

#projectInformationEditDialog  >>> .el-dialog {
        border-radius: 12px;
        width: 37%  !important;
    }

#projectInformationEditDialog >>> .el-dialog__header {
        /* background-color: #1c3366; */
        display: flex;
        padding-left: 1.1rem!important;
        margin-bottom: 0 !important;
    border-top-right-radius: 8px !important;
    border-top-left-radius: 8px !important;
    -webkit-box-pack: start !important;
    -ms-flex-pack: start !important;
    justify-content: flex-start !important;
    background-color: #e8edf2 !important;
    height: 48px !important;
        }

    

        #projectInformationEditDialog >>> .el-form-item__content {
        
        margin-left: 0px  !important;
        
        }

      #projectInformationEditDialog >>>   .el-form-item__label {

          margin-left: 10px ;
          width: 100%  !important;
          color: #222 !important; 
      }

    #projectInformationEditDialog >>> .el-dialog__wrapper {
    position: fixed;
    top: -22px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    margin: 0;
}

       #projectInformationEditDialog >>>   .el-form-item {

          margin-top: -25px;
      }

      #projectInformationEditDialog >>>  .el-input  {

          margin-left: 4% ;
      }
      #projectInformationEditDialog >>>  .el-input__inner  {

          background-color: var(--step-50);
          border: none;
          height: 48px !important;
          width: 100%;
          display: block;
          color: #222 !important;
          font-size: 16px !important;
      }

         #projectInformationEditDialog >>> .el-form {
        
        margin-top: 25px  !important;
        height: -webkit-fill-available;
        }

         #projectInformationEditDialog >>> .el-dialog__title{
        font-weight: 600;
        color: #222222 !important;
        font-size: 16px !important;
        }

         #projectInformationEditDialog >>> .el-dialog__close {
        color: #222222 !important;
        }


         #projectInformationEditDialog >>>    .button-confirm {
    background-color: #409EFF !important;
    border: none !important;
    padding: 9px 2px !important;
    width: 100% !important;
    height: 45px !important;
    font-family: 'Helvetica Neue' !important;
    font-size: 18px !important;
    font-weight: bold !important;
    font-stretch: normal !important;
    font-style: normal !important;
    /* line-height: 3.89; */
    letter-spacing: normal !important;
    text-align: center !important;
    color: #fff !important;
        margin: 0px !important;
       }

        #projectInformationEditDialog >>> .exchange-rate {
        margin-top: 30px;
        }

         #projectInformationEditDialog >>> .el-radio-group {
        margin-left: 10px;
        }
        #projectInformationEditDialog >>> .conversion {
        margin-left: 10px  !important; 
        }
        #projectInformationEditDialog >>> .currency-message {
        margin-left: 10px  !important; 
        word-break: break-word  !important;
        }
        #projectInformationEditDialog >>> .custom-exchange-rate {
        margin-left: 10px  !important;
        }
        
         #projectInformationEditDialog >>> .exchange-error {
        margin-left: 10px  !important;
        }

        #projectInformationEditDialog >>> .el-dialog__body {

            padding: 0px 0px   !important;
            margin-left: 5px   !important;
            margin-right: 3px  !important;
            padding-top: 13px !important;
            height: 62vh !important;
        } 





    .floating-label {
  position: relative;
  margin-bottom: 42px;
  /* padding-left: 8px;
  padding-right: 8px; */

  margin-left: 10px;
  margin-right: 10px;
}
.floating-label label {
  color: var(--step-200);
  font-size: 14px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 16px;
  top: 12px;
  transition: 0.2s ease all;
}

.floating-input {
  font-size: 16px;
  /* padding: 10px 16px; */
  padding-left: 10px;
  display: block;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
  color: #222;
}

.floating-input::placeholder {
    color: #222;
    font-size: 16px;
}
.floating-input:focus {
  outline: none;
}
.floating-input:focus ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}
.floating-input:focus ~ .bar:before {
  width: 50%;
}
.floating-input:focus ~ .bar:after {
  width: 50%;
}
.floating-input:focus ~ .highlight {
  animation: inputHighlighter 0.3s ease;
}
.floating-input:not(:placeholder-shown) ~ label {
  top: -21px;
  left: 2px;
  font-size: 14px !important;
  color: #222 !important;
}

.floating-textarea {
  min-height: 70px;
  max-height: 260px;
  overflow: hidden;
  overflow-x: hidden;
  resize: none;
}


 .scroll_content {
  position: relative;
  padding: 0;
  height: -webkit-fill-available;
}

/* .el-dialog__body::-webkit-scrollbar {
  width: 1px;
} */

.formErrors {
    text-align: left;
    color: #ff0000;
    margin-top: 8px !important;
    word-break: break-word;
}


@media (max-width: 1280px) {
  .scroll_content {
    padding-bottom: 6px;
  }
}

.modal_form .button_area .btn {
  width: 100%;
}

.floating-label.right_value .floating-input {
  padding-right: 70px;
}

.floating-label.right_value .value_area {
  position: absolute;
  right: 12px;
  top: 13px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--step-200);
}
.floating-label.right_value .value_area .fas {
  font-size: 12px;
  margin-left: 4px;
  cursor: pointer;
}

    #projectInformationEditDialog  >>> .el-dialog__footer {
        margin-top: 0px !important;
        text-align: center !important;
        padding: 20px 16px 20px 16px !important;
    }


@media (max-width: 767px) {
    
    #projectInformationEditDialog  >>> .el-dialog {
        border-radius: 12px;
        width: 80vw !important;
        height: auto;
    }
    #projectInformationEditDialog >>> .el-dialog__body {
    padding: 0px 0px   !important;
    margin-left: 5px   !important;
    margin-right: 3px  !important;
    height: 55vh;
    overflow: auto !important;
    padding-top: 13px !important;
    height: 62vh !important;
    } 

}
 div >>> .vue-tel-input{
    height: 3rem;
    width: 96%;
    border: none;
    background-color: #e5eaf0;
    margin: 0 0 1rem 0.6rem;
 }
 div >>> .vue-tel-input > input{
    background-color: #E8EDF2;
    color: black;
 }
 div >>> .vti__selection{
    width: 80px;
 }

 div >>> .vti__dropdown-list{
    width: 200px;
 }

</style>

<style lang="scss" scoped>

    @import '../../../../styles/components/button';
    @import '../../../../styles/components/forms';

</style>
