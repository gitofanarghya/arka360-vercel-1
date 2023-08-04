<template>
  <div id="ahjInformationDialog" v-loading.fullscreen="isLoading">
    <el-dialog
      :visible="isAhjPopupVisible"
      :close-on-click-modal="false"
      title="Add AHJ"
      width="50%"
      @open="assignConsumptionFormValues"
      @close="onCancelConsumptionForm"
    >
      <div class="containerContainer">
    <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{requestedServiceType}}</p>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isAhjPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

      <!-- -----------------Container------------->
      <div class="contContainer">

        <h3 class="containerHeading">Authority Having Jurisdiction (AHJ)*</h3>
        <el-form>
        <div class="container">
          <div class="inputs">
            <label for="" class="ahjDialogLabel">AHJ Name</label>
            <el-input placeholder="Please input" :disabled="true" v-model="AHJName"></el-input>
          </div>
          <div class="inputs">
            <label for="" class="ahjDialogLabel">AHJ Code</label>
            <el-input placeholder="Please input" :disabled="true" v-model="AHJCode"></el-input>
          </div>
          <div class="inputs">
            <label for="" class="ahjDialogLabel">Building Code</label>
            <el-select v-model="BuildingCode" placeholder="Select" filterable allow-create>
              <el-option
                v-for="item in buildCodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="inputs">
            <label for="" class="ahjDialogLabel">Electrical Code</label>
            <el-select v-model="ElectricCode" placeholder="Select" filterable allow-create>
              <el-option
                v-for="item in electricCodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="inputs">
            <label for="" class="ahjDialogLabel">Fire Code</label>
            <el-select v-model="FireCode" placeholder="Select" filterable allow-create>
              <el-option
                v-for="item in fireCodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="inputs">
            <label for="" class="ahjDialogLabel">Residential Code</label>
            <el-select v-model="ResidentialCode" placeholder="Select" filterable allow-create>
              <el-option
                v-for="item in resiCodeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div style="margin-left:15px; word-break:keep-all;">
          *AHJ information available according to public sources
        </div>
        <div class="ahjTable">
          <!-- <el-table
            ref="singleTable"
            :data="tableData"
            highlight-current-row
            @current-change="handleCurrentChange"
            style="width: 100%"
            :key="index"
          >
            <el-table-column width="40">
                <input type="radio" id="age1" name="age" value="30" :ref="'inputField' + index">
            </el-table-column>
            <el-table-column property="AHJCode" label="AHJ Code" width="120">
            </el-table-column>
            <el-table-column property="AHJName" label="AHJ Name" width="120">
            </el-table-column>
            <el-table-column property="Level" label="Level" width="120">
            </el-table-column>
            <el-table-column property="BuildingCode" label="Building Code" width="160">
            </el-table-column>
            <el-table-column
              property="ElectricCode"
              label="Electrical Code"
              width="140"
            >
            </el-table-column>
            <el-table-column property="FireCode" label="Fire Code" width="160">
            </el-table-column>
            <el-table-column property="ResidentialCode" label="Residential Code" width="160">
            </el-table-column>
          </el-table> -->


        <div v-if="window.width>=1200">
          <div class="ahjTableHeader">
              <div></div>
              <div class="ahjHead">AHJ Code</div>
              <div class="ahjHead">AHJ Name</div>
              <div class="ahjHead">Level</div>
              <div class="ahjHead">Building Code</div>
              <div class="ahjHead">Electrical Code</div>
              <div class="ahjHead">Fire Code</div>
              <div class="ahjHead">Residential Code</div>
          </div>
          <div v-for="(item, index) in tableData" :key="item.id" class="ahjTableData" :style="[index%2===0 ? {'background': '#f7f7f7'} : {'background': '#fff'}]">
              <div style="text-align:center;"><input @click="handleClick(item)" type="radio" id="age1" name="isChecked" v-model="isChecked"
               :value="item.AHJCode"></div>
              <div class="ahjValues">{{item.AHJCode}}</div>
              <div class="ahjValues">{{item.AHJName}}</div>
              <div class="ahjValues">{{item.Level}}</div>
              <div class="ahjValues">{{item.BuildingCode}}</div>
              <div class="ahjValues">{{item.ElectricCode}}</div>
              <div class="ahjValues">{{item.FireCode}}</div>
              <div class="ahjValues">{{item.ResidentialCode}}</div>
          </div>
        </div>
          <div v-else>
            <div v-for="(item, index) in tableData" :key="item.id" class="ahjTableMob" :style="[index%2===0 ? {'background': '#f7f7f7'} : {'background': '#fff'}]">
              <div style="text-align:center; margin-top:22px;"><input @click="handleClick(item)" type="radio" id="age1" name="isChecked" v-model="isChecked"
               :value="item.AHJCode"></div>
              <div class="ahjMob">
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">AHJ Code</label>
                <div class="ahjValuesMob">{{item.AHJCode}}</div>
              </div>
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">AHJ Name</label>
                <div class="ahjValuesMob">{{item.AHJName}}</div>
              </div>
                <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">Level</label>
                <div class="ahjValuesMob">{{item.Level}}</div>
              </div>
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">Building Code</label>
                <div class="ahjValuesMob">{{item.BuildingCode}}</div>
              </div>
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">Electrical Code</label>
                <div class="ahjValuesMob">{{item.ElectricCode}}</div>
              </div>
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">Fire Code</label>
                <div class="ahjValuesMob">{{item.FireCode}}</div>
              </div>
              <div class="ahjCellsMob">
                <label for="" class="ahjMobLabel">Residential Code</label>
                <div class="ahjValuesMob">{{item.ResidentialCode}}</div>
              </div>
              </div>
          </div>
          </div>
        </div> 
      </el-form>
      </div>

      <!-- <span slot="footer">
        <button
          :disabled="errors.items.length > 0"
          class="button-confirm"
          @click="onAhjUpdate()"
        >
          Add AHJ
        </button>
      </span> -->
       <div class="footer">
          <p class="footerStep">Step {{currentStepInProp}}<span class="unBold">/{{totalSteps}}</span></p>
          <div class="notesBtn">
            <el-button class="backBtn" @click="$emit('closeAhjPopup','previous')">Back</el-button>
            <el-button 
            type="primary"
            :loading="isUpdatingAhj"
            :disabled="errors.items.length > 0" 
            @click="onAhjUpdate()"
            class="submitBtn">
                Save & Next
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { METERING_TYPES } from "@/pages/constants";
import API from "@/services/api/";
import { mapState, mapActions } from "pinia";
import { useProjectStore } from '../../../stores/project';

export default {
  name: "ahjInformationDialog",
  emits: ["update"], 
  props: {
    isAhjPopupVisible: {
      type: Boolean,
      default: false,
    },
    requestedServiceType:{
            type: String,
            default:""
        },
    projectIdFromGenericComponent:{
      type : Number,
      default: null,
    },
    request_object_id:{
        type: Number,
        default: 0
      },
    currentStepInProp:{
      type: Number,
      default:1,
    },
    totalSteps:{
      type: Number,
      default: 5,
    }
  },
  data() {
    return {
        window: {
          width: 0,
          height: 0
        },
        AHJCode: null,
        Level: null,
        AHJName: null,
        BuildingCode: null,
        ElectricCode: null,
        FireCode: null,
        ResidentialCode: null,
        bgTable:"ahjTableData",
        isChecked: null,
        isLoading: false,
        isUpdatingAhj: false,
        buildCodeOptions: [
          {
            label: "2021 IBC",
            value: "2021IBC"
          },
          {
            label: "2018 IBC",
            value: "2018IBC"
          },
          {
            label: "2015 IBC",
            value: "2015IBC"
          },
          {
            label: "2012 IBC",
            value: "2012IBC"
          },
          {
            label: "2009 IBC",
            value: "2009IBC"
          },
          {
            label: "No Solar Regulations",
            value: "NA"
          },
        ],
        electricCodeOptions: [
          {
            label: "2020 NEC",
            value: "2020NEC"
          },
          {
            label: "2017 NEC",
            value: "2017NEC"
          },
          
          {
            label: "2014 NEC",
            value: "2014NEC"
          },
          {
            label: "2011 NEC",
            value: "2011NEC"
          },
          {
            label: "2008 NEC",
            value: "2008NEC"
          },
          {
            label: "No Solar Regulations",
            value: "NA"
          },
        ],
        fireCodeOptions: [
          {
            label: "2021 IFC",
            value: "2021IFC"
          },
          {
            label: "2018 IFC",
            value: "2018IFC"
          },
          {
            label: "2015 IFC",
            value: "2015IFC"
          },
          {
            label: "2012 IFC",
            value: "2012IFC"
          },
          {
            label: "2009 IFC",
            value: "2009IFC"
          },
          {
            label: "No Solar Regulations",
            value: "NA"
          },
        ],
        resiCodeOptions: [
          {
            label: "2021 IRC",
            value: "2021IRC"
          },
          {
            label: "2018 IRC",
            value: "2018IRC"
          },
          {
            label: "2015 IRC",
            value: "2015IRC"
          },
          {
            label: "2012 IRC",
            value: "2012IRC"
          },
          {
            label: "2009 IRC",
            value: "2009IRC"
          },
          {
            label: "No Solar Regulations",
            value: "NA"
          },
        ],
      tableData: [
    {
        AHJCode: "OH-3921000",
        Level: "",
        AHJName: "Dayton city",
        BuildingCode: "",
        ElectricCode: "",
        FireCode: "",
        ResidentialCode: ""
    },
    {
        AHJCode: "OH-39113",
        Level: "Kern County",
        AHJName: "Kern County",
        BuildingCode: "",
        ElectricCode: "",
        FireCode: "",
        ResidentialCode: ""
    },
    {
        AHJCode: "OH-39",
        Level: "",
        AHJName: "Ohio state",
        BuildingCode: "2015IBC",
        ElectricCode: "2014NEC",
        FireCode: "",
        ResidentialCode: "2018IRC"
    }
],
      currentRow: null,
      averageMonthlyConsumptionValidation: {
        required: true,
        min_value: 0,
        decimal: 2,
      },
      averagePriceValidation: {
        required: true,
        min_value: 0,
        decimal: 4,
      },
      tariffValidation: {
        required: true,
        min_value: 0,
        decimal: 2,
      },
      averageExportPriceValidation: {
        required: true,
        min_value: 0,
        decimal: 2,
      },
      consumptionDetails: {
        meteringType: "",
        averageMonthlyConsumption: "",
        averageUnitPrice: "",
        averageExportPrice: "",
        tariffEscalationRate: "",
        sanctionedLoad: "",
        tariffRate: "",
        tariffProfile: "",
        monthlyBill: [],
        monthlyUnits: [],
      },
    };
  },
  async created(){
    this.isLoading = true
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    await Promise.all([
      this.ahjTableValues(),
      this.currentValues(),
    ])
    this.isLoading = false
  },
  nonReactiveData() {
    return {
      METERING_TYPES,
    };
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    ...mapState(useProjectStore, {
      consumption: "GET_PROJECT_CONSUMPTION_DETAILS",
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
    isGrossMeteringEnable() {
      return (
        this.consumptionDetails.meteringType ===
        this.METERING_TYPES.GROSS_METERING
      );
    },
  },
  watch:{
      isChecked:{
          handler(val)
          {
              console.log("isChecked", val);
          }
      },
      request_object_id(newval,oldval){
        console.log("new,old",newval,oldval);
        this.ahjTableValues();
        this.handleUpdate();
        
    },

  },
  methods: {
    ...mapActions(useProjectStore, ["UPDATE_PROJECT_CONSUMPTION_DETAILS"]),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    assignConsumptionFormValues() {
      // assigning the values of the consumption to the form when it opens
      this.consumptionDetails.averageMonthlyConsumption = this.consumption.averageMonthlyConsumption;
      this.consumptionDetails.meteringType = this.consumption.metering_type;
      this.consumptionDetails.averageExportPrice = this.consumption.average_export_price_per_unit;
      this.consumptionDetails.tariffEscalationRate = this.consumption.tariff_escalation_rate;
      this.consumptionDetails.averageUnitPrice = this.consumption.average_price_per_unit;
    },
      async handleUpdate(){
       const response =  await API.PROJECTS.FETCH_PROJECT(this.$props.projectIdFromGenericComponent);
       console.log("$$$$$$$ response",response);
       this.AHJCode=response.data.AHJCode;
       this.AHJName=response.data.AHJName;
       this.Level=response.data.Level;
       this.BuildingCode=response.data.BuildingCode;
       this.FireCode=response.data.FireCode;
       this.ResidentialCode=response.data.ResidentialCode;
       this.ElectricCode=response.data.ElectricCode;
    },
    async currentValues(){
    //    const response =  await API.PROJECTS.FETCH_PROJECT(this.$route.params.projectId);
        if(!this.projectIdFromGenericComponent)
        return;

       const response =  await API.PROJECTS.FETCH_PROJECT(this.projectIdFromGenericComponent);
       console.log(response);
       this.isChecked=response.data.AHJCode; 
       this.AHJCode=response.data.AHJCode;
       this.AHJName=response.data.AHJName;
       this.Level=response.data.Level;
       this.BuildingCode=response.data.BuildingCode;
       this.FireCode=response.data.FireCode;
       this.ResidentialCode=response.data.ResidentialCode;
       this.ElectricCode=response.data.ElectricCode;
    },
    async ahjTableValues(){
        if(!this.projectIdFromGenericComponent)
        return;
        let response = await API.AHJ_INFORMATION.FETCH_AHJ_INFORMATION(this.projectIdFromGenericComponent)
        console.log(response);
        this.tableData=response.data
        console.log("@@@@@table Data", this.tableData);
    },
    handleClick(val){
        this.AHJCode= val.AHJCode;
        this.Level= val.Level;
        this.AHJName= val.AHJName;
        this.BuildingCode= val.BuildingCode;
        this.ElectricCode= val.ElectricCode;
        this.FireCode= val.FireCode;
        this.ResidentialCode= val.ResidentialCode;
    },
    async onAhjUpdate(){
      this.isUpdatingAhj = true
      let payLoad = {
        "AHJCode": this.AHJCode,
        "Level": this.Level,
        "AHJName": this.AHJName,
        "BuildingCode": this.BuildingCode,
        "ElectricCode": this.ElectricCode,
        "FireCode": this.FireCode,
        "ResidentialCode": this.ResidentialCode,
      };
      await API.AHJ_INFORMATION.PATCH_AHJ_INFORMATION(this.projectIdFromGenericComponent,payLoad);
      this.isUpdatingAhj = false
      this.$emit('closeAhjPopup','next');
    //   this.$emit("update", payLoad);
    },
    setCurrent(row) {
      console.log("Hello");
      this.currentRow=this.tableData[0];
      console.log(this.currentRow);
    },

    handleCurrentChange(val) {
      console.log(val);
        this.currentRow = val;
        this.AHJCode= val.AHJCode;
        this.Level= val.Level;
        this.AHJName= val.AHJName;
        this.BuildingCode= val.BuildingCode;
        this.ElectricCode= val.ElectricCode;
        this.FireCode= val.FireCode;
        this.ResidentialCode= val.ResidentialCode;
    },
    onCancelConsumptionForm() {
      this.$emit("update:isAhjPopupVisible", false);
    },
    async onConfirmConsumptionForm() {
      const monthlyUnitsArray = Array(12).fill(
        this.consumptionDetails.averageMonthlyConsumption
      );
      const postData = {
        average_price_per_unit: this.consumptionDetails.averageUnitPrice,
        monthly_units: monthlyUnitsArray,
        tariff_escalation_rate: this.consumptionDetails.tariffEscalationRate,
        average_export_price_per_unit: this.consumptionDetails
          .averageExportPrice,
        metering_type: this.consumptionDetails.meteringType,
      };
      await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(postData);
      this.$emit("update:isConsumptionFormVisible", false);
    },
  },
};
</script>

<style type="text/css" scoped>


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


#ahjInformationDialog >>> .el-select {
  width: 100%;
}

#ahjInformationDialog >>> .el-input {
  margin-top: 4px;
}

#ahjInformationDialog >>> .ahjTable {
  margin-top: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#ahjInformationDialog >>> .ahjTablePicked {
  padding-top: 1rem;
  background-color: #fff;
}

#ahjInformationDialog >>> .inputs {
  margin-bottom: 15px;
}

#ahjInformationDialog >>> .el-form-item {
  width: 91% !important;
}
#ahjInformationDialog >>> .el-table__header-wrapper, .el-table__footer-wrapper{
    border-bottom: 1px solid #999;
}
#ahjInformationDialog >>> .container {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 24px;
  height: 11rem;
  margin-top: 12px;
}
.heading_ {
  font-size: 1.5vw;
  margin: 3% 0 2% 0;
}

.heading2_ {
  font-size: 1.3vw;
  margin: 0 20px 0 0;
}

#ahjInformationDialog >>> .el-form-item__label {
  word-break: break-word;
}

#ahjInformationDialog >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#ahjInformationDialog >>> .ahjDialogLabel {
    color:#777777 !important;
    font-size: 14px !important;
}

#ahjInformationDialog >>> .el-icon-arrow-up:before{
    color: #222222;
}

#ahjInformationDialog >>> .el-input-group__append {
  width: 45px;
  padding: 0 10px 0 10px;
  background-color: #eaebed;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
}

#ahjInformationDialog >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  display: none !important;
}

#ahjInformationDialog >>> .el-dialog__wrapper {
 overflow: hidden !important;
 top: -15px !important;
 margin-top: 7vh !important;
}

#ahjInformationDialog >>> .el-dialog__body {
 padding: 0 !important;
}



#ahjInformationDialog >>> .el-dialog__title {
  color: #222222 !important;
  margin-left: 0px !important;
  font-size: 16px;
  line-height: 2.38;
  font-family: 'HELVETICA NEUE';
  margin-left: 20px !important;
  font-weight: 600 !important;
}


#ahjInformationDialog >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

@media (max-width: 674px) {
  #ahjInformationDialog >>> .el-dialog {
    width: 90% !important;
  }
}


#ahjInformationDialog >>> .el-dialog__footer {
  text-align: center !important;
  padding-bottom: 30px;
}


#ahjInformationDialog >>> .el-input--suffix .el-input__inner{
    background-color: #e8edf2 !important;
        color: #222222 !important;
}

#ahjInformationDialog >>> .ahjTableMob{
  display: grid;
  grid-template-columns: 10% 90%;
}

#ahjInformationDialog >>> .ahjMob{
  display: grid;
  grid-template-columns: 50% 50%;
}

#ahjInformationDialog >>> .ahjValuesMob{
  margin-top: 3px;
}


#ahjInformationDialog >>> .ahjCellsMob{
  margin: 13px;
}

#ahjInformationDialog >>> .ahjMobLabel{
  color: #222;
  font-weight: 600;
}

#ahjInformationDialog >>> .ahjTableHeader{
display: grid;
    grid-template-columns: 5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
    /* height: 35px; */
    border-bottom: 1px solid #999;
    padding-top: 10px;
    padding-bottom: 10px;
    column-gap: 6px;
    font-weight: 600;
    letter-spacing: normal;
    text-align: left;
    color: #222;
    background-color: #f7f7f7;
    font-size: 16px !important;
}

#ahjInformationDialog >>> .ahjTableData{
    display: grid;
    grid-template-columns: 5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
    /* height: 20px; */
    padding-top: 20px;
    column-gap: 6px;
    text-align: left;
    color: #222;
    padding-bottom: 10px;
}


#ahjInformationDialog >>> .el-input.is-disabled .el-input__inner{
    background-color: #e8edf2 !important;
    color: #222222 !important;
}


#ahjInformationDialog >>> .button-confirm {
  background-color: #409eff !important;
  font-size: 16px !important;
  border: none !important;
  padding: 9px 2px !important;
  width: 200px !important;
  /* height: 40px  !important; */
      border-radius: 4px !important;
    background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
    font-family: 'Helvetica Neue' !important;
    font-size: 18px !important;
    font-weight: bold !important;
    height: 50px !important;
}

#ahjInformationDialog >>> .el-table th > .cell{
    color: #222222;
    font-weight: 600;
    font-size: 16px;
}

#ahjInformationDialog >>> .ahjValues{
  word-break:keep-all;
  margin: 0 !important;
}


#ahjInformationDialog >>> .ahjHead{
  word-break:keep-all;
  width: 40px;
}


#ahjInformationDialog >>> .el-table .cell{
    color: #222222;
    font-size: 16px;
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
  height: 65vh;
  overflow-y: scroll;
}

.containerHeading{
  color: #777777;
  font-size: 16px;
  font-weight: 100;
  padding: 10px 0px 8px 0px;
  word-break: break-word;
}

  @media (max-width: 1200px) {
#ahjInformationDialog >>> .container {
  display: grid;
  grid-template-columns: auto auto;
  height: auto;
 }
#ahjInformationDialog .button-confirm {
  width: 200px !important;
}
}

  @media (max-width: 767px) {
#ahjInformationDialog >>> .container {
  display: grid;
  grid-template-columns: 100%;
  height: auto;
 }
#ahjInformationDialog .button-confirm {
  width: 50% !important;
  
}

.backBtn {
  padding: 13px 20px;
  border: 1px solid #999;
  font-size: 14px !important;
  }

  .submitBtn {
  padding: 13px 16px;
  font-size: 14px !important;
  }

  #ahjInformationDialog >>> .inputs {
  padding-left: 0px;
  margin-bottom: 15px;
}

  .containerHeading{
  padding: 0px 0px 8px 0px;
}
}
</style>

<style lang="scss" scoped>
@import "../../../styles/components/button";
@import "../../../styles/components/forms";
</style>
