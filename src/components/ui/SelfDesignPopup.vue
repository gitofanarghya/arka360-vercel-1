<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isSelfDesignPopupVisible"
      :close-on-click-modal="false"
      title="Order Details"
      width="976px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="leftContainer">
          <div class="headerContainer">
            <h3 class="headingOne">{{this.$props.buttonclickedNEW.name}}</h3>
            <p class="headContent">
              {{this.$props.buttonclickedNEW.description}}
            </p>
          </div>
          <div class="drpDownContainer" v-if="dropdownOptionsAvailable">
          <el-tooltip effect="dark" placement="top-start" content="You can upgrade your designs using the Project Upgrade option." :disabled="!isDropdownDisabled">
            <el-select v-model="selectedOption" :disabled="isDropdownDisabled" :placeholder="selectedOption.type">
              <el-option
                v-for="option in allDropdownFeatures"
                :key="option.id"
                :value="option"
                class="loanDropdown"
              >
                <div class="flexContainer">
                  <div class="">
                    <p class="flexContainer">
                      {{option.type }}
                    </p>
                    <p class="uptoKW">{{option.description}}</p>
                  </div>                                    
                  <p class="droDwnCredits">{{formatNumberWithCommas(option.credits)}} Credits</p>
                </div>
              </el-option>
            </el-select>
          </el-tooltip>
          </div>
          <div class="prjtSize" v-if="dropdownOptionsAvailable">
            <p class="detailsValue" v-if="selectedOption">
              <span class="tickSign">✓</span>Project size {{selectedOption.description}}
            </p>
          </div>
          <div>
            <el-checkbox-group class="checkBoxContainer" v-model="selectedAddOnChecked" @change="addonsChange" v-if="checkboxOptionsAvailable">
              <el-checkbox  v-for="feature in buttonclickedNEW.available_features" :key="feature.features" :label="feature" :disabled="availedAddOn(feature.id)" :checked="availedAddOn(feature.id)">
                {{feature.name}} ({{formatNumberWithCommas(feature.credits)}} Credits)
                <div v-if="feature.description" class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        {{feature.description}}
                      </p>
                    </div>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="rightContainer">
          <div class="headerContainer">
            <h3 class="headingTwo">Payment Details</h3>
            <div class="packageDetails">
              <p class="details">Add New Design</p>
              <p class="detailsValue" v-if="dropdownOptionsAvailable">{{formatNumberWithCommas(selectedOption.credits)}}</p>
              <p class="detailsValue" v-else>{{this.$props.buttonclickedNEW.base_price}}</p>
            </div>
          </div>
          <div class="selectedPayments">
            <div class="packageDetails" v-for="addon in manuallySelectedAddons" :key="addon.id">
              <p class="detailsSmall">{{(addon.name)}}</p>
              <p class="detailsValue">{{(addon.credits)}}</p>
            </div>
          </div>
          <div class="estDeleiveryTimeContainerTwo">
            <h3 class="creditBal">Credit Balance</h3>
            <div class="packageDetails">
              <div class="crdtBalChkBoxContainer">
                <el-checkbox v-model="iSPromotionalChecked"
                  >Promotional Credit Balance
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Use your bonus credits for sales proposals, revision requests, self-design creation, and some upgrades on a design level.
                      </p>
                    </div>
                  </div>
                </el-checkbox>
              </div>
              <p class="details">{{formatNumberWithCommas(this.credits.promotional_credits)}}</p>
            </div>
          </div>
          <div class="purCredBalContainer">
            <div class="packageDetails">
              <p class="details">Purchased Credit Balance</p>
              <p class="detailsValue">{{formatNumberWithCommas(this.credits.purchased_credits)}}</p>
            </div>
          </div>
          <div class="footerBtnContainer">
            <div class="packageDetails">
              <p class="totalPayCred">Total Payable Credits:</p>
              <!-- <p class="totalPayCredVal" v-if="this.$props.buttonclickedNEW.input_dropdown.length > 0">{{selectedOption.credits}}</p>
              <p class="totalPayCredVal" v-else>{{totalAddonsPrice + this.$props.buttonclickedNEW.base_price}}</p> -->
              <p class="totalPayCredVal">{{formatNumberWithCommas(totalPayableCredits)}}</p>
            </div>
            <el-button class="footerBtn" type="primary" @click="selfDesignPopup" 
              >{{dynamicButtonName}}</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
    <CreateNewProjectPopup
      v-if="isNewProjectFormVisible"
      :isNewProjectFormVisible.sync="isNewProjectFormVisible"
      :isSelfDesignPopup="isSelfDesignPopup"
      @onNewProjectDialogClose="onNewProjectDialogClose"
      :totalPayableCreditsNonUS="selectedOption"
      :totalPayableCreditsUS="totalAddonsPrice + this.$props.buttonclickedNEW.base_price"
      :selfDesigningInfo="this.$props.buttonclickedNEW"
      :selectedAddOnChecked="manuallySelectedAddons"
      :avilFeaturesIds="avilFeaturesIds"
      :iSPromotionalChecked="iSPromotionalChecked"
    />
    <add-credit-popup v-if="isAddCreditPopupVisible"
      :isAddCreditPopupVisible.sync="isAddCreditPopupVisible" :preFilledCreditCount ="insufficientCredits"/>
  </div>
</template>
<script>
import CreateNewProjectPopup from "./newProject/newProject.vue";
import { formatNumberWithCommas } from '@/utils.js'
import { mapState } from "pinia";
import { useCreditsStore } from "../../stores/credits";
import { useProjectStore } from "../../stores/project";

export default {
  name: "SelfDesignPopupVisible",

  components: {
    CreateNewProjectPopup,
  },

  props: {
    isSelfDesignPopupVisible: {
      type: Boolean,
      default: false,
    },
    buttonclickedNEW:{
      type: Object,
      default() {
        return {}
      }
    },
    totalSelfDesigns: {
      type: Number,
      default: 0
    },
  },

  data() {
    return {
      iSPromotionalChecked: true,
      isAddCreditPopup: false,
      form: {
        name: "",
      },
      value: "",
      selectedAddOnChecked:[],
      additionalFeatures: [],
      totalAddonsPrice: 0,
      basePrice: 0,
      selectedOption: {},
      isNewProjectFormVisible: false,
      isSelfDesignPopup: false,
      avilFeaturesIds:[],
      isAddCreditPopupVisible: false,
      isAddCredits: false,
    };
  },
  created() {
    if (this.isOnProjectSummaryPage || this.isOnLeadSummaryPage) {
      let existingFeatureId = this.getAllFeaturesFromProject.existing_features[0]
      let selectedFeature = this.allDropdownFeatures.find(feature => feature.id == existingFeatureId)
      this.selectedOption = selectedFeature
      if (!this.selectedOption) { this.selectedOption = this.allDropdownFeatures[0] }
    } else {
      this.selectedOption = this.allDropdownFeatures[0];
    }
  },

  methods: {
    availedAddOn(addOnId) {
      if (this.projectId && this.getAllFeaturesFromProject.availed_features.includes(addOnId))
        return true
      return false
    },
    selfDesignPopup() {
      this.isSelfDesignPopup = true;

      if (this.dropdownOptionsAvailable) {
        this.avilFeaturesIds[0] = this.selectedOption.id
      }
      if(!this.avilFeaturesIds.includes(this.buttonclickedNEW.id))
        this.avilFeaturesIds.push(this.buttonclickedNEW.id);
      
      if (this.insufficientCredits > 0) {
        this.isAddCreditPopupVisible = true;
      } else {
        if (this.isOnProjectSummaryPage || this.isOnLeadSummaryPage) {
          this.orderSelfDesign();
        } else {
          this.isNewProjectFormVisible = true;
        }
      }

    },
    orderSelfDesign() {
      var objPass = {
        "avilFeaturesIds" : this.avilFeaturesIds,
        "use_promotional_credits" : this.iSPromotionalChecked,
        "isSelfDesign" : true
      }
      this.$emit("OrderSelfDesign",objPass);
    },
   
    onDialogClose() {
      this.$emit("update:isSelfDesignPopupVisible", false);
    },
    
    onNewProjectDialogClose() {
      this.isNewProjectFormVisible = false;
    },

    addonsChange(){
      let credits = 0
      this.avilFeaturesIds = [];
      for (let addon of this.manuallySelectedAddons) {
        credits += parseFloat((addon.credits))
        this.avilFeaturesIds.push((addon.id))
      }
      this.totalAddonsPrice = credits;
    },

    formatNumberWithCommas,
  },

  computed: {
    ...mapState(useCreditsStore,{
      credits: 'GET_CREDIT_BALANCE',
     }),
    ...mapState(useProjectStore, {
      getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
    }),
    manuallySelectedAddons() {
      let manuallySelectedAddons = this.selectedAddOnChecked
      if (this.projectId)
        manuallySelectedAddons = this.selectedAddOnChecked.filter(x => !this.getAllFeaturesFromProject.availed_features.includes(x.id))
      return manuallySelectedAddons
    },
    projectId () {
      return this.$route.params.projectId || null
    },
    dropdownOptionsAvailable() {
      return this.buttonclickedNEW.input_dropdown.length
    },

    checkboxOptionsAvailable() {
      return this.buttonclickedNEW.input_checkbox.length
    },

    allDropdownFeatures() {
      let allFeatures = this.buttonclickedNEW.available_features
      return allFeatures
    },

    isOnProjectSummaryPage() {
      return Object.keys(this.$route.params).includes("projectId");
    },

    isOnLeadSummaryPage() {
      return this.$route.name == 'leadSummary'
    },
    
    isDropdownDisabled(){
      return Boolean(this.totalSelfDesigns);
    },
    
    totalCreditBalance() {
      return this.credits.purchased_credits + this.credits.promotional_credits;
    },

    chosenCreditBalance() {
      if (this.iSPromotionalChecked) {
        return this.totalCreditBalance
      } else {
        return this.credits.purchased_credits
      }
    },

    totalPayableCredits() {
      if (this.dropdownOptionsAvailable) {
        return this.selectedOption.credits;
      } else {
        return this.totalAddonsPrice + this.$props.buttonclickedNEW.base_price;
      }
    },

    insufficientCredits() {
      return this.totalPayableCredits - this.chosenCreditBalance
    },

    dynamicButtonName() {
      let buttonText = "N/A"
      if (this.insufficientCredits > 0) {
        buttonText = "Add " + this.insufficientCredits + " Credits"
      } else {
        buttonText = "Continue"
        if (this.isOnProjectSummaryPage || this.isOnLeadSummaryPage) {
          buttonText = "Pay Now"
        }
      }
      return buttonText
    },
  }
};
</script>
      
  
  
  <style scoped>
#parentContainer >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

#parentContainer >>> .el-dialog__title {
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

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 8px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 4vh !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px;
}

#parentContainer >>> .el-form-item__label {
  color: #222;
  font-size: 16px;
}

#parentContainer >>> .el-select {
  max-width: 290px;
}
#parentContainer >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
}

.container {
  display: grid;
  grid-template-columns: 60% 40%;
  word-break: break-word;
}

.leftContainer {
  border-right: 1px solid #ccc;
  padding: 24px 16px 24px 14px;
}

.rightContainer {
  padding: 24px 14px 24px 16px;
}

.flexContainer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    font-size: 16px;
    color: #222;
}

.loanDropdown {
  height: auto !important;
}

.uptoKW {
  font-size: 14px;
  color: #777;
  margin-top: -12px;
}

.droDwnCredits {
  color: #222;
  font-size: 14px;
}

.prjtSize {
  padding-bottom: 16px;
}

.headerContainer {
  border-bottom: 1px solid #ccc;
  padding-bottom: 12px;
}

.headingOne {
  font-size: 16px;
  font-weight: 500;
  color: #222;
  margin-bottom: 6px;
}

.headingTwo {
  font-size: 18px;
  font-weight: 600;
  color: #1c3366;
  margin-bottom: 8px;
}

.headContent {
  font-size: 14px;
  font-weight: 100;
  color: #777;
  line-height: 1.5;
}

.drpDownContainer,
.checkBoxContainer,
.purCredBalContainer,
.estDeleiveryTimeContainerOne,
.estDeleiveryTimeContainerTwo {
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: auto;
  gap: 13px;
}

.drpDownContainer {
  border-bottom: none;
}
.checkBoxContainer {
    border-bottom: none;
}

.estDeleiveryTimeContainerTwo {
  border-bottom: none;
  padding-bottom: 0px;
}

.selectedPayments {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  min-height: 143px;
}

#parentContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

#parentContainer >>> ::placeholder {
  color: #222;
}

.hover_information {
  display: inline-block;
  position: relative;
  margin-left: 4px;
}

.hover_information .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 300px;
  left: -15px;
  bottom: 75%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
  z-index: 100;
}

.hover_information .tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
  white-space: initial;
}
.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.fa-info-circle {
  color: #777;
}

.tickSign {
  display: inline-block;
  margin-right: 12px;
  color: #0fbc0f;
}

.footer {
  margin-top: 10px;
}

.note {
  color: #777;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.boldTxt {
  font-weight: 600;
  color: #222;
}

#parentContainer >>> .el-checkbox {
  display: flex;
  margin-right: 0px;
}

#parentContainer >>> .el-checkbox__inner {
  width: 20px;
  height: 20px;
}

#parentContainer >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

#parentContainer >>> .el-checkbox__label {
  color: #222;
  font-size: 16px;
  white-space: initial;
  padding-left: 12px;
}

.footer >>> .el-checkbox__label {
  color: #222;
  font-size: 14px;
  white-space: initial;
  padding-left: 12px;
}

#parentContainer >>> .el-checkbox__inner::after {
  top: 3px;
  left: 7px;
  border-width: 2px;
}

#parentContainer >>> .el-checkbox__inner {
  border: 1px solid #777;
}

.agreeContent {
  font-size: 14px;
  line-height: 1.5;
  white-space: initial;
}

.packageDetails {
  display: flex;
  justify-content: space-between;
}

.details,
.detailsValue {
  font-size: 16px;
  color: #222;
}

.detailsSmall {
  font-size: 14px;
  color: #222;
}

.creditBal {
  color: #1c3366;
  font-size: 16px;
  font-weight: 600;
}

.footerBtnContainer {
  padding: 16px 0px 0px 0px;
}

.totalPayCred,
.totalPayCredVal {
  font-weight: 600;
  font-size: 16px;
  color: #222;
  padding-bottom: 21px;
}

.footerBtn {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
}

@media (max-width: 1000px) {
  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
    margin-top: 0vh !important;
    max-height: auto !important;
  }

  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
    height: auto;
  }

  #parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  #parentContainer >>> .el-dialog__body {
    overflow: hidden;
    overflow-y: scroll;
    max-height: 76vh;
    margin-bottom: 16px;
  }

  .container {
    grid-template-columns: 1fr;
  }

  .leftContainer {
    padding: 16px 6px 0px 6px;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .rightContainer {
    padding: 16px 6px 0px 6px;
  }

  .selectedPayments {
    border-bottom: none;
    min-height: initial;
  }
}
</style>