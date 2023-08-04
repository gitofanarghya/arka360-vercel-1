<template>
  <div id="ahjInformationDialog">
    <el-dialog
      :visible="isConsumptionFormVisible"
      :close-on-click-modal="false"
      title="Add AHJ"
      width="50%"
      @open="assignConsumptionFormValues"
      @close="onCancelConsumptionForm"
    >
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


        <div v-if="window.width>=1200" class="tableBorder">
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

      <span slot="footer">
        <!-- <button
                    class="button-cancel"
                    @click="onCancelConsumptionForm()">
                    Cancel
                </button> -->
        <el-button
          :disabled="errors.items.length > 0"
          :loading="isLoading"
          class="button-confirm"
          @click="onAhjUpdate()"
        >
          Add AHJ
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { METERING_TYPES } from "@/pages/constants";
import API from "@/services/api/";

import { mapState, mapActions } from "pinia";
import { useProjectStore } from '../../../../stores/project';
import { useLeadStore } from "../../../../stores/lead";

export default {
  name: "ahjInformationDialog",
  emits: ["update"], 
  props: {
    isConsumptionFormVisible: {
      type: Boolean,
      default: false,
    },
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
  created(){
     window.addEventListener('resize', this.handleResize);
     this.handleResize();
     this.ahjTableValues();
  },
  nonReactiveData() {
    return {
      METERING_TYPES,
    };
  },
  mounted(){
    this.currentValues();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    ...mapState(useProjectStore, {
      consumption: "GET_PROJECT_CONSUMPTION_DETAILS",
      currencySymbol: "GET_CURRENCY_SYMBOL",
      ahjDetails :"GET_AHJ_DETAILS",
    }),
    ...mapState(useLeadStore, {
      leadInfo: state => state
    }),
    isGrossMeteringEnable() {
      return (
        this.consumptionDetails.meteringType ===
        this.METERING_TYPES.GROSS_METERING
      );
    },
    projectId(){
      return (this.$route.params.projectId  || this.leadInfo?.project_details?.id);
    }
  },
  watch:{
      isChecked:{
          handler(val)
          {
              console.log("isChecked", val);
          }
      }
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
    async currentValues(){
       this.isChecked=this.ahjDetails.AHJCode; 
       this.AHJCode=this.ahjDetails.AHJCode;
       this.AHJName=this.ahjDetails.AHJName;
       this.Level=this.ahjDetails.Level;
       this.BuildingCode=this.ahjDetails.BuildingCode;
       this.FireCode=this.ahjDetails.FireCode;
       this.ResidentialCode=this.ahjDetails.ResidentialCode;
       this.ElectricCode=this.ahjDetails.ElectricCode;
    },
    async ahjTableValues(){
        let response =await API.AHJ_INFORMATION.FETCH_AHJ_INFORMATION(this.projectId)
        this.tableData=response.data
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
         this.isLoading = true;
         let payLoad = {
        "AHJCode": this.AHJCode,
        "Level": this.Level,
        "AHJName": this.AHJName,
        "BuildingCode": this.BuildingCode,
        "ElectricCode": this.ElectricCode,
        "FireCode": this.FireCode,
        "ResidentialCode": this.ResidentialCode,
        };
      try{
        let response= await API.AHJ_INFORMATION.PATCH_AHJ_INFORMATION(this.projectId, payLoad);
        this.$emit("update", payLoad);
      }catch(error){
        let errorMessage = error.response?.status === 403 ?
                            "You don't have permission to edit this project." :
                            "Error";

        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        })
      }
      this.isLoading = false;
      this.onCancelConsumptionForm();
    },
    setCurrent(row) {
      this.currentRow=this.tableData[0];
    },

    handleCurrentChange(val) {
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
      this.$emit("update:isConsumptionFormVisible", false);
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
#ahjInformationDialog >>> .el-select {
  width: 100%;
}

#ahjInformationDialog >>> .el-input {
  margin-top: 4px;
}

#ahjInformationDialog >>> .ahjTable {
  padding-top: 1rem;
  padding-right: 8px;
  padding-left: 14px;
}

#ahjInformationDialog >>> .ahjTablePicked {
  padding-top: 1rem;
  background-color: #fff;
}

#ahjInformationDialog >>> .inputs {
  padding-left: 15px;
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
  grid-template-columns: 33% 33% 33%;
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
    color:#222 !important;
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
  height: 48px;
}

#ahjInformationDialog >>> .el-dialog__wrapper {
 overflow: hidden !important;
 top: -15px !important;
}

#ahjInformationDialog >>> .el-dialog__body {
 overflow: scroll !important;
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
  border-radius: 12px;
  width: 70% !important;
}

@media (max-width: 674px) {
  #ahjInformationDialog >>> .el-dialog {
    width: 90% !important;
  }
}

@media (max-width: 376px) {
  #ahjInformationDialog >>> .el-dialog {
    width: 98% !important;
  }
}

#ahjInformationDialog >>> .el-dialog__footer {
  text-align: center !important;
  padding-bottom: 30px;
}


#ahjInformationDialog >>> .el-input--suffix .el-input__inner{
    background-color: #e8edf2 !important;
        color: #222222 !important;
        height: 48px !important;
        font-size: 16px !important;
        border: none !important;
}

#ahjInformationDialog >>> .el-input--suffix .el-input__inner::placeholder{
  color: #222 !important;
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

.tableBorder{
  border: 1px solid #ccc;
  border-radius: 4px;
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
    height: 48px !important;
    font-size: 16px !important;
    border: none !important;
}

#ahjInformationDialog >>> .el-select .el-input .el-select__caret {
    color: #222 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
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

  @media (max-width: 1200px) {
#ahjInformationDialog >>> .container {
  display: grid;
  grid-template-columns: 50% 50%;
  height: auto;
 }
 #ahjInformationDialog >>> .el-dialog__body {
 overflow: scroll !important;
 height: 64vh;
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
  #ahjInformationDialog >>> .el-dialog__body {
 overflow: scroll !important;
 height: 64vh;
}
#ahjInformationDialog .button-confirm {
  width: 50% !important;
  
}
}
</style>

<style lang="scss" scoped>
@import "../../../../styles/components/button";
@import "../../../../styles/components/forms";
</style>
