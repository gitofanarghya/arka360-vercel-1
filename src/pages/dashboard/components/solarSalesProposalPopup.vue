<template>
  <div class="deleteModule" v-if="isSolarSalesProposalPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      :title="requestedServiceType"
      class="delete_module"
    >
      <div class="container">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{requestedServiceType}}</p>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isSolarSalesProposalPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer" v-loading="isLoading">
          <h4 class="compoHeading">Components</h4>
          <div class="radioBtnPVS boxed">
            <input type="radio" id="android" name="skills" v-model="componentType" value="Conventional PV" class="inputOnePVS" checked>
            <label for="android" class="labelOnePVS">Conventional PV</label>
            <input type="radio" id="ios" name="skills" v-model="componentType" value="Power Gazebo" class="inputTwoPVS" >
            <label for="ios" class="labelTwoPVS">Power Gazebo</label>
          </div>
          <!-- Using V-show So that The API do not gets called again and again for these Infinite scroll dropdown components -->
            <el-form ref="form" :model="form" class="gridCont" v-show="componentType=='Conventional PV'" >
                <el-form-item label="Select Module"><br/>
                    <infinite-scroll-dropdown-panel-for-request-proposal
                      :panel.sync="selectedPanel"
                      :areFavoritesRequired="false"
                    />
                </el-form-item>
                 <el-form-item label="Select Inverter"><br/>
                    <infinite-scroll-dropdown-inverter-for-request-proposal
                      :inverter.sync="selectedInverter"
                      :are-favorites-required="false"/>
                </el-form-item>
                 <el-form-item label="Select Optimizer" v-if="optimizerList.length"><br/>
                    <el-select v-model="optimizerVal" placeholder="Select Optimizer" :disabled="isDisabled">
                        <el-option
                          v-for="item in optimizerList"
                          :key="item"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Select Optimization Target"><br/>
                    <el-select v-model="optimisationTarget" placeholder="Select Optimization Target">
                        <el-option label="Maximise available roof space" value="Maximise available roof space"></el-option>
                        <el-option label="Maximise bill savings" value="Maximise bill savings"></el-option>
                    </el-select>
                </el-form-item>
            </el-form >
            <!-- As there is some issue if we have same selectedPanel name for both as when changed the toggle some errors thrown so can have diff name in v-model  -->
            <el-form ref="form" :model="form" class="gridCont" v-show="componentType=='Power Gazebo'">
              <el-form-item label="Select Power Gazebo"><br/>
                    <el-select v-model="selectedPanelForPowerGazebo" placeholder="Select Module" >
                        <el-option
                          v-for="item in powerGazeboModuleList"
                          :key="item"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                    </el-select>
              </el-form-item>
            </el-form>
        </div>

        <!-- -----------------Footer----------------->
        <div class="footer">
          <p class="footerStep">Step  {{currentStepInProp}}<span class="unBold">/{{totalSteps}}</span></p>
          <div class="notesBtn">
            <el-button class="backBtn" @click="$emit('closeSolarSalesPopup','previous')">Back</el-button>
            <el-button :loading="isSubmitting" type="primary" class="submitBtn" @click="submitNext">Save & Next</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import InfiniteScrollDropdownPanelForRequestProposal from '../../../components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanelForRequestProposal.vue';
import InfiniteScrollDropdownInverterForRequestProposal from '../../../components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverterForRequestProposal.vue';
import API from "@/services/api/";
export default {

  name: "solarSalesProposalPopup",
  components: {InfiniteScrollDropdownInverterForRequestProposal, InfiniteScrollDropdownPanelForRequestProposal},
  watch: {
    request_object_id(newval,oldval){
          this.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newval);
        },
    isSolarSalesProposalPopupVisible(){
      this.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(this.$props.request_object_id);
    } ,   
    selectedPanel:{
      handler(val){
        if(val.id)
        this.selectedPanelId=val.id;
        if(val && this.selectedInverter)
        {
          this.postOptimizer();
        }

      }
    },
    selectedInverter:{
      handler(val){
        if(val.id)
        this.selectedInverterId=val.id;
        if(val && this.selectedPanel)
        {
          this.postOptimizer();
        }  
      }
    },
  },
  props: {
    requestedServiceType:{
        type: String,
        default:""
    },
    isSolarSalesProposalPopupVisible: {
      type: Boolean,
      default: false,
    },
    projectIdFromGenericComponent:{
      type : Number,
      default: null,
    },
    totalSteps:{
      type: Number,
      default: 5,
    },
    currentStepInProp:{
      type: Number,
      default:1,
    },
    request_object_id:{
      type: Number,
      default: 0
    }

  },
  data() {
    return {
      selectedPanel: null,
      selectedInverter: null,
      selectedPanelId: null,
      selectedInverterId: null,
      optimizerList: [], 
      optimizerStatus: null,
      optimizer: null,
      isAvail: false,
      optimisationTarget: null,
      optimizerVal: null,
      form: {
          name: '',
          region: '',
      },
      isLoading:false,
      isSubmitting: false,
      componentType: 'Conventional PV',
      powerGazeboModuleList:[
                          "PGUS01-01M1-77- 4x8",
                          "PGUS01-01M1-77- 5x8",
                          "PGUS01-01M1-77- 6x8",
                          "PGUS01-01M1-77- 7x8"
                        ],
      selectedPanelForPowerGazebo: null,

    };
  },
  mounted(){
      this.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(this.$props.request_object_id);
  },
  methods: {
    async GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newID){
      this.isLoading=true;
      let response = await API.DASHBOARD_INFO.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newID);
      if(typeof response.data.module_inverter_data==='undefined' || response.data.module_inverter_data===null)
      {
       //do nothing
        // this.selectedPanel = {"company_name":null};
        // this.selectedInverter={"Make":null};
      }
      else if(response.data.module_inverter_data){
        let incomingData = response.data.module_inverter_data;

        this.selectedPanelId= incomingData.moduleID;
        this.selectedInverterId= incomingData.inverterID;
        this.selectedPanel =  incomingData.moduleData;
        this.selectedInverter =  incomingData.inverterData;
        this.optimizerVal= incomingData.optimisationID;
        this.optimisationTarget = incomingData.optimisationTarget;
        this.componentType =  response.data.component_type ? response.data.component_type : 'Conventional PV' //For old projects If this key is missing then have default

        if(this.componentType=='Power Gazebo'){
          this.selectedPanelForPowerGazebo = incomingData.moduleData;
          this.selectedPanel = null;
        }
      }
     
      this.isLoading=false;
    },
    closenewDesignDialogForm() {
      this.$emit("update:isSolarSalesProposalPopupVisible", false);
      this.$validator.reset();
    },
    async postOptimizer(){
          const requestBody = {"moduleID": this.selectedPanelId,"inverterID": this.selectedInverterId}
          const response = await API.OPTIMIZER_LIST.POST_OPTIMIZER(requestBody);
          let respData = response.data.optimizerList;
          let respFilter =  Object.values(respData);
          let respMap = respFilter.map(a => a.optimizer);
          this.optimizerList = respMap.map(a => a.Make);
    },
    async submitNext()
    {
      this.isSubmitting = true
      let patchData={};
      if(this.componentType=='Power Gazebo'){
        patchData = {
                      module_inverter_data:{
                        "moduleID": null,
                        "moduleData": this.selectedPanelForPowerGazebo,
                        "inverterID": null,
                        "inverterData": null ,
                        "optimisationTarget": null,
                      },
                      "component_type": this.componentType,
                    }
      } 
      else{
        if(this.selectedPanel && this.selectedInverter){
          patchData = {
                        module_inverter_data:{
                          "moduleID":  this.selectedPanelId,
                          "moduleData": this.selectedPanel.company_name ? `${this.selectedPanel.company_name} ${this.selectedPanel.model}` : this.selectedPanel,
                          "inverterID":  this.selectedInverterId,
                          "inverterData": this.selectedInverter.Manufacturer? `${this.selectedInverter.Manufacturer} ${this.selectedInverter.Make}` : this.selectedInverter,
                          "optimisationTarget": this.optimisationTarget,
                        },
                        "component_type": this.componentType,
              }
        }
        if(this.optimizerVal){
          patchData['module_inverter_data']['optimisationID'] =  this.optimizerVal;
        }
      }
      let response = await API.DASHBOARD_INFO.FINANCIAL_ADD_PRICING_POPUP_ADDED(
        this.$props.request_object_id,
        patchData
      );
      this.$emit('closeSolarSalesPopup','next');
    },
  },
  computed: {
    isDisabled(){
      if(this.selectedPanel && this.selectedInverter)
      {
        return false;
      }
      else{
        return true;
      }
    },
    isComponentPVConventional(){
      return this.componentType=='Conventional PV';
    }
  },
};
</script>


<style scoped>
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
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
  padding: 16px;
  max-height: 65vh;
  min-height: 65vh;
  overflow-y: scroll;
}

.gridCont{
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 32px;
  row-gap: 0px;
}

.deleteModule .delete_module >>> .el-select {
    width: 100% !important;
}

.deleteModule .delete_module >>> .el-form-item__label{
    color: #222 !important;
}

.deleteModule .delete_module >>> .el-input--suffix .el-input__inner{
    border: none !important;
    background-color: #e8edf2 !important;
    color: #222 !important;
    height: 48px !important;
    font-size: 16px !important;
}

.deleteModule .delete_module >>> .el-select > .el-input{
    font-size: 16px !important;
}

.deleteModule .delete_module >>> .el-input--suffix .el-input__inner::placeholder{
    color: #222 !important;
}


.deleteModule .delete_module >>> .el-select .el-input .el-select__caret{
    color: #222 !important;
    font-weight: 600 !important;
    font-size: 16px !important;
}

.footer{
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.footerStep{
  font-size: 16px;
  font-weight: 700;
  color: #222222;
  line-height: 2.5;
}

.unBold{
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

.compoHeading {
  font-size: 16px;
  color: #777;
  margin-bottom: 16px;
  margin-top: 6px;
}

.radioBtnPVS {
    position: relative;
    margin-bottom: 80px;
}

.labelOnePVS,
.labelTwoPVS {
    display: inline-block;
    width: 200px;
    height: 48px;
    padding: 10px;
    transition: all 0.3s;
    border-radius: 24px;
    background-color: #fff;
    position: absolute;
    cursor: pointer;
}

.labelOnePVS {
    left: 0;
    right: 40%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #999;
    border: 1px solid #ccc;
}

.labelTwoPVS {
    left: 164px;
    right: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #263342;
    border: 1px solid #ccc;
    color: #999;
}


.boxed input[type="radio"] {
    display: none;
}

.boxed input[type="radio"]:checked+.labelOnePVS {
    background-color: #409eff;
    color: #fff;
    z-index: 1;
}

.boxed input[type="radio"]:checked+.labelTwoPVS {
    background-color: #409eff;
    color: #fff;
    z-index: 1;
}

@media (max-width: 800px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

  .contContainer {
    padding: 12px 18px;
  }
  .rectContent {
    margin-left: 18px;
  }

  .gridCont{
    display: grid;
    grid-template-columns: auto;
    grid-gap: 0px;
  }

  .el-button {
  font-size: 14px !important;
 }

 .backBtn {
  padding: 13px 20px;
  border: 1px solid #999;
}

.submitBtn {
  padding: 13px 16px;
}

.labelOnePVS,
 .labelTwoPVS {
    width: 160px;
    font-size: 14px;
}

.labelTwoPVS {
  left: 135px;
}

}
</style>