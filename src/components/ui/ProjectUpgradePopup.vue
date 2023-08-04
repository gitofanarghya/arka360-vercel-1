<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isProjectUpgradePopupVisible"
      :close-on-click-modal="false"
      title="Project Ad-ons"
      width="976px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="leftContainer" v-loading="isLoading">
          <div class="headerContainer">
            <p class="headContent">
              Select features to add and use in the project.
            </p>
          </div>
          <div class="drpDownContainer" v-if="isInfoInDropdown">
            <el-select v-model="selectedOption" placeholder="Select">
              <el-option
                v-for="options in availableFeaturesInDropdown"
                :key="options.id"
                :value="options.type"
                class="loanDropdown"
              >
              <div class="flexContainer">
                <div class="">
                  <p class="flexContainer">
                    {{options.type }}
                  </p>
                  <p class="uptoKW">{{options.description}}</p>
                </div>                                    
                <p class="droDwnCredits">{{formatNumberWithCommas(options.credits)}} Credits</p>
              </div>   
              </el-option>
            </el-select>
          </div>
          <!-- {{availedFeaturesIdsList}} -->
          <div v-if="isInfoInCheckbox" >
            <el-checkbox-group v-model="availedFeaturesIdsList" class="checkBoxContainer">
            <el-checkbox
              :label="option.id"
              v-for="option in availableFeaturesInCheckbox"
              :key="option.id"
              :disabled="option.isSelected"
            >
              {{option.name}} ({{formatNumberWithCommas(option.credits) + ' Credits'}})
              <div v-if="option.description" class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    {{option.description}}
                  </p>
                </div>
              </div>
            </el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="" v-if="isInfoInDropdown">
            <p class="detailsValue" v-if="selectedOption">
              <span class="tickSign">✓</span>Project size {{selectedDropdownObj.description}}
            </p>
          </div>
        </div>
        <div class="rightContainer">
          <div class="headerContainerTwo">
            <h3 class="headings">Payment Details</h3>
          </div>
          <div class="selectedPayments" v-if="isInfoInCheckbox">
            <div class="packageDetails" v-for="data in availableFeaturesInCheckbox" :key="data.id"  >
              <p class="detailsSmall" v-if="!data.isSelected && availedFeaturesIdsList.includes(data.id)">{{data.name}}</p>
              <p class="detailsValue" v-if="!data.isSelected && availedFeaturesIdsList.includes(data.id)">{{formatNumberWithCommas(data.credits)}} Credits</p>
            </div>
          </div>
          <div class="selectedPayments" v-else>
            <div class="packageDetails" v-if="selectedOption">
              <p class="detailsSmall">{{selectedDropdownObj.type}}</p>
              <p class="detailsValue" >{{formatNumberWithCommas(selectedDropdownObj.credits)}} Credits</p>
            </div>
          </div>
          <div class="estDeleiveryTimeContainerTwo">
            <h3 class="creditBal">Credit Balance</h3>
            <div class="packageDetails">
              <div class="crdtBalChkBoxContainer">
                <el-checkbox v-model="isUsingPromotionalBalance"
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
              <p class="details">{{formatNumberWithCommas(creditsInfo.promotional_credits)}}</p>
            </div>
          </div>
          <div class="purCredBalContainer">
            <div class="packageDetails">
              <p class="detailsSmall">Purchased Credit Balance</p>
              <p class="detailsValue">{{formatNumberWithCommas(creditsInfo.purchased_credits)}}</p>
            </div>
          </div>
          <div class="footerBtnContainer">
            <div class="packageDetails">
              <p class="totalPayCred">Total Payable Credits:</p>
              <p class="totalPayCredVal">{{formatNumberWithCommas(totalPayableCredits)}}</p>
            </div>
            <el-button
              class="footerBtn"
              type="primary"
              :loading="loadingStateButton"
              :disabled="totalPayableCredits<0"
              @click="dynamicButtonName == 'Pay Now'? upgradeFeatures() : isAddCreditPopupVisible = true"
            >
              {{dynamicButtonName}}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <add-credit-popup v-if="isAddCreditPopupVisible"
      :isAddCreditPopupVisible.sync="isAddCreditPopupVisible" :preFilledCreditCount ="insufficientCredits"/>
  </div>
</template>
      
<script>
import API from "@/services/api/";
import { mapActions, mapState } from "pinia";
import { useCreditsStore } from "../../stores/credits";
import { useDesignStore } from "../../stores/design";
import { useProjectStore } from "../../stores/project"
import { formatNumberWithCommas } from '@/utils.js'

export default {
  name: "ProjectUpgradePopup",
  props: {
    isProjectUpgradePopupVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isUsingPromotionalBalance: true,
      selectedOption: '',
      selfDesigningInfo:{},
      isInfoInCheckbox:false,
      isInfoInDropdown:false,
      availableFeaturesInCheckbox:[],
      availableFeaturesInDropdown:[],
      // projectId: this.$route.params.projectId,
      availedFeaturesIdsList : [],
      availedFeaturesIdsListInitial: [],
      isLoading:false,
      isAddCreditPopupVisible: false,
      loadingStateButton:false,
    };
  },
  created() {
    this.getAllAvailableFeatures();
    this.fetchAvailedFeaturesID();
  },

  methods: {
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),
    ...mapActions(useDesignStore, {
      UPDATE_ALL_FEATURES_FROM_DESIGN: "UPDATE_ALL_AVAILABLE_FEATURES"
    }),
    ...mapActions(useProjectStore, {
      UPDATE_ALL_FEATURES_FROM_PROJECT: 'UPDATE_ALL_AVAILABLE_FEATURES',
    }),
    getAllAvailableFeatures(){
      this.selfDesigningInfo =  JSON.parse(localStorage.getItem("allServicesInfo")).self_designing_info;
      if(this.selfDesigningInfo['input_checkbox'] && this.selfDesigningInfo['input_checkbox'].length){
        this.isInfoInCheckbox = true;
        this.availableFeaturesInCheckbox = [...this.selfDesigningInfo.available_features];
      }
      else if(this.selfDesigningInfo['input_dropdown'] && this.selfDesigningInfo['input_dropdown'].length){
        this.isInfoInDropdown = true;
        this.availableFeaturesInDropdown = [...this.selfDesigningInfo.available_features];

        let existingFeatureId = this.getAllFeaturesFromProject.existing_features[0]
        let selectedFeature = this.availableFeaturesInDropdown.find(feature => feature.id == existingFeatureId)
        let selectedCredit = selectedFeature['credits'];
        for(let i=1;i<this.availableFeaturesInDropdown.length;i++){
          this.availableFeaturesInDropdown[i]["credits"] =  this.availableFeaturesInDropdown[i]["credits"] - selectedCredit;
        }
      }
    },
    async fetchAvailedFeaturesID(){
      try{
        this.isLoading = true;
        // const response =  await API.PROJECTS.FETCH_AVAILED_FEATURES(this.projectId);
        // this.availedFeaturesIdsList = [... response.data.availed_features];
        // this.availedFeaturesIdsListInitial = [... response.data.availed_features]
        this.availedFeaturesIdsList = [... this.getAllFeatures.availed_features];
        this.availedFeaturesIdsListInitial = [... this.getAllFeatures.availed_features];
        // this.availedFeaturesIdsListInitial = []; //static, will remove later
        // this.availedFeaturesIdsList = []; //static, will remove later
        this.assignMoreKeyToTotalAvaibleObj(this.availedFeaturesIdsList);
        // console.log("availed features IDs list", this.availedFeaturesIdsList);
        if(this.isInfoInDropdown){
          let tempArray = [];
          for(let i=0;i<this.availableFeaturesInDropdown.length;i++){
            let data = this.availableFeaturesInDropdown[i];
            if(!this.availedFeaturesIdsList.includes(data.id)){
              tempArray.push(data);
            } 
          }
          this.availableFeaturesInDropdown= [... tempArray];
        }
        this.isLoading = false;
      }
      catch(e){
        // console.log("error inside project upgrade popup",e);
        this.isLoading = false;
        this.$message({
          showClose: true,
          message: "Not able to fetch availed Features",
          type: "error",
          center: true
        });
      }
    },
    async upgradeFeatures(){
      this.loadingStateButton = true;
      const patchData = {
        "features": [... this.listOfIdsToPurchaseNow],
        "use_promotional_credits": this.isUsingPromotionalBalance,
        "project_id": this.projectId,
      }
      try{
        const response =  await API.PROJECTS.UPGRADE_PROJECT_FEATURES(patchData);
        let credits = {
          purchased_credits: response.data.credits.purchased_credits,
          promotional_credits: response.data.credits.promotional_credits,
        }
        this.setCreditBalance(credits);
        
        // let idsAvailedToUpateStore = [... this.availedFeaturesIdsList];
        // let idsAvailableToUpdateStore = this.getAllFeatures.available_features.filter(id=> !idsAvailedToUpateStore.includes(id));

        let idsAvailedToUpateStore = [... response.data.features.availed_features];
        let idsAvailableToUpdateStore = [... response.data.features.available_features];
        let updatesFeaturesJson = { 
            "available_features" : idsAvailableToUpdateStore,
            "availed_features"   : idsAvailedToUpateStore,
            "existing_features"  : [... response.data.features.existing_features]
        }
        let overAllJson = {
          updatesFeaturesJson: updatesFeaturesJson,
          type : this.selectedDropdownObj.type
        }
        if(this.$route.params.projectId)
        this.UPDATE_ALL_FEATURES_FROM_PROJECT(updatesFeaturesJson);
        else if(this.$route.params.designId){
          this.UPDATE_ALL_FEATURES_FROM_DESIGN(overAllJson);
          this.$emit("projectUpgraded");
          // this.UPDATE_ALL_FEATURES_FROM_DESIGN(updatesFeaturesJson);
        }
        this.$message({
          showClose: true,
          message: "Feature upgraded successfully!",
          type: "success",
          center: true
        });
        // console.log("updated availed and available ids",idsAvailedToUpateStore,idsAvailableToUpdateStore);
        this.loadingStateButton = false;
        this.onDialogClose();
      }
      catch(error){
        console.error(error)
        let errorMessage = error.response.status === 403 ?
                            "You don't have permission to edit this project." :
                            "We're unable to upgrade this project."

        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        });
        this.loadingStateButton = false;
        this.onDialogClose();
      }
    },
    assignMoreKeyToTotalAvaibleObj(availedIDsList){
      for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
        if(availedIDsList.includes(this.availableFeaturesInCheckbox[i].id)){
          this.availableFeaturesInCheckbox[i]['isSelected'] = true;
        }
        else{
          this.availableFeaturesInCheckbox[i]['isSelected'] = false;
        }
      }
    },
    onDialogClose() {
      this.$emit("update:isProjectUpgradePopupVisible", false);
    },
    formatNumberWithCommas,
  },

  computed: {
    ...mapState(useCreditsStore, {
      creditsInfo: "GET_CREDIT_BALANCE"
    }),
    ...mapState(useProjectStore, {
      getAllFeaturesFromProject: 'GET_TOTAL_FEATURES',
      projectInfo: 'GET_PROJECT_INFORMATION'
    }),
    ...mapState(useDesignStore, {
      getAllFeaturesFromDesign: 'GET_TOTAL_FEATURES',
    }),
    
    projectIdFromStore() {
      return this.projectInfo.id
    },
    getAllFeatures(){
      if(this.$route.params.projectId && this.getAllFeaturesFromProject.available_features)
        return this.getAllFeaturesFromProject
      else if(this.$route.params.designId && this.getAllFeaturesFromDesign.available_features)
        return  this.getAllFeaturesFromDesign

      // return ( this.getAllFeaturesFromProject || this.getAllFeaturesFromDesign);
    },
    projectId(){
      return (this.$route.params.projectId || this.projectIdFromStore);
    },
    ISUs() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    listOfIdsToPurchaseNow(){
      let tempArray=[];
      if(this.isInfoInCheckbox){
        for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
          let data = this.availableFeaturesInCheckbox[i];
          if(!data.isSelected && this.availedFeaturesIdsList.includes(data.id)){
              tempArray.push(data.id);
          }
        }
      }
      if(this.isInfoInDropdown){
        tempArray.push(this.selectedDropdownObj.id);
      }
      return tempArray;
    },
    extraCreditsRequired(){
      if(this.totalPayableCredits> (this.creditsInfo.promotional_credits + this.creditsInfo.purchased_credits)){
        return this.totalPayableCredits - (this.creditsInfo.promotional_credits + this.creditsInfo.purchased_credits);
      }
      else return 0;
    },
    totalPayableCredits(){
      let total=0;
      if(this.isInfoInCheckbox){
        for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
          let data = this.availableFeaturesInCheckbox[i];
          if(!data.isSelected && this.availedFeaturesIdsList.includes(data.id)){
            total+= data.credits;
          }
        }
      }
      else if(this.isInfoInDropdown){
        total = this.selectedDropdownObj.credits
      }
      if(total)
      return total;
      else return 0;
    },
    selectedDropdownObj(){
      let tempObj = {
        "type":'',
        "credits":'',
        "description":'',
        "id":'',
      }
      for(let i=0;i<this.availableFeaturesInDropdown.length;i++){
        let currentObj = this.availableFeaturesInDropdown[i];
        if(currentObj.type == this.selectedOption ){
          tempObj.type = currentObj.type;
          tempObj.credits = currentObj.credits;
          tempObj.description = currentObj.description;
          tempObj.id = currentObj.id;
          return tempObj;
        }
      }
      return tempObj;
    },
    totalCreditBalance() {
      return this.creditsInfo.purchased_credits + this.creditsInfo.promotional_credits;
    },
    chosenCreditBalance() {
      if (this.isUsingPromotionalBalance) {
        return this.totalCreditBalance
      } else {
        return this.creditsInfo.purchased_credits
      }
    },
    dynamicButtonName() {
      if (this.insufficientCredits > 0) {
        return "Add " + this.insufficientCredits + " credits"
      } else {
        return "Pay Now"
      }
    },
    insufficientCredits() {
      return this.totalPayableCredits - this.chosenCreditBalance
    },
  },
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
  height: 40px !important;
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
  /* overflow-y: auto; */
  margin-top: 4vh !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
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
  padding: 24px 16px 24px 24px;
}

.rightContainer {
  padding: 24px 24px 24px 16px;
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

.headerContainerTwo {
  border-bottom: 1px solid #ccc;
  padding-bottom: 12px;
}

.headings {
  font-size: 18px;
  font-weight: 600;
  color: #1c3366;
  margin-bottom: 8px;
}

.headContent {
  font-size: 14px;
  font-weight: 100;
  color: #222;
  line-height: 1.5;
}

.drpDownContainer,
.checkBoxContainer,
.purCredBalContainer,
.estDeleiveryTimeContainerTwo {
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: auto;
  gap: 13px;
}

.drpDownContainer {
  margin-bottom: 16px;
}

.estDeleiveryTimeContainerTwo {
  border-bottom: none;
  padding-bottom: 0px;
}

.checkBoxContainer {
  border-bottom: none;
}

.selectedPayments {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  min-height: 223px;
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

#parentContainer >>> .el-select-dropdown__item  {
    height: auto !important;
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
    padding: 16px 16px 16px 16px;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .rightContainer {
    padding: 16px 16px 0px 16px;
  }

  .headerContainerTwo {
    border-bottom: none;
    padding-bottom: 0px;
}

  .selectedPayments {
    min-height: auto;
    padding: 0px 0px 16px 0px;
  }
}
</style>