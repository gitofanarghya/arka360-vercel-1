<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isModifyProposalPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 830px"
      title="Modify Proposal"
      width="600px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="mdHeight">
          <div class="containerOne">
            <div class="selectAll">
              <el-checkbox
                :indeterminate="isIndeterminateAllPages"
                v-model="checkAll"
                >Select All Pages</el-checkbox
              >
            </div>
            <div class="grpContainer">
              <el-checkbox-group
                v-model="profileData.report_defaults.pages"
              >
                <el-checkbox
                  v-for="page in checkListReportPages"
                  :label="page.label"
                  :key="page.label"
                  :disabled="isThisPageDisabled(page.label)"
                >
                  {{ page.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
          <div class="containerTwo">
            <h3 class="hdngTwo">Data for 3D Model</h3>
            <div class="flexCont">
              <div class="switch">
                Generation<el-switch v-model="profileData['report_defaults']['threed_data']['generation']"></el-switch>
              </div>
              <div class="switch">
                Financials
                <el-switch v-model="financialSwitchHandler" 
                :disabled = "!profileData['financial_data']['payback']" >
                </el-switch>
              </div>
            </div>
          </div>
          <div
            v-show="
              profileData.report_defaults.pages.indexOf('shadow-analysis') !==
                -1
            ">
            <h3 class="formHeadings">
              Time Consideration for Shadow Analysis <!--({{
              projectData.timezone
              }) -->
            </h3>
            <div class="gridTime">
              <div class="timeinCol">
                <label for="Start Time" class="labelStart">Start Time</label><br>
                <input
                  type="time"
                  id="Start Time"
                  class="startTime"
                  required
                  @change="onstartChange($event)"
                  v-model="
                    profileData.report_defaults.shadowAnalysis.start_time_shadow_analysis
                  "
                  v-validate="shadowAnalysisStartTimeValidation"
                  name="Start Time"
                />
                <p class="formErrors">
                  <span>{{ errors.first("Start Time") }}</span>
                </p>
              </div>
              <div class="timeinCol">
                <label for="End Time" class="labelEnd">End Time</label><br>
                <input
                  type="time"
                  id="End Time"
                  class="endTime"
                  @change="onendChange($event)"
                  required
                  v-model="
                    profileData.report_defaults.shadowAnalysis.end_time_shadow_analysis
                  "
                  v-validate="shadowAnalysisStartTimeValidation"
                  name="End Time"
                />
                <p class="formErrors">
                  <span>{{ errors.first("End Time") }}</span>
                </p>
              </div>
            </div>
          </div>
          
        </div>
        <div class="containerThree">
             <el-button type="primary" class="updateBtn" @click="onUpdateButton" :loading="loadingState">Update</el-button>
        </div>
        
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../stores/design";
import { useProjectStore } from "../../stores/project";
import { reportPagesListUs } from "../../utils";

export default {
  props: {
    isBatteryAvailable:{
      type: Number,
      default: -1,
    },
    isModifyProposalPopupVisible: {
      type: Boolean,
      default: false,
    },
    profileData: {
      type: Object,
      default: function() {
        return {};
      },
    },
    designVersionSettingsData:{
      type: Object,
      default: function() {
        return {};
      },
    }
  },

  data() {
    return {
      // checkAll: false,
      isStartDateChanged: false,
      isEndDateChanged: false,
      checkedPages: reportPagesListUs,
      pages: reportPagesListUs,
      isIndeterminate: false,
      value1: true,
      value2: true,
      checkListReportPages: JSON.parse(JSON.stringify(reportPagesListUs)),
      userCountry: null,
      updatedPages:[],
      designVerId:null,
      constDefaultColors:{},
      reset: false,
      defaultColors: {},
      defaultPrimary: "",
      defaultSecondary: "",
      defaultTertiary: "",
      isOrientation: false,
      report_type: "",
      template_name: "solar_labs",
      value: "",
      isDownloading: false,
      shadowAnalysisStartTimeValidation: {
        required: true,
      },
      shadowAnalysisEndTimeValidation: {
        required: true,
      },
      valDetermineArray: ["heat-map", "shadow-analysis", "title"],
      reportColor: "blue",
      designId: this.$route.params.designId,
      oldState: [],
      lengthPages: 1,
      updatedState: [],
      tempProfileData: {},
      loadingState:false,
    };
  },
   mounted() {
    this.updatedState = this.profileData.report_defaults.pages;
    if(!this.profileData['financial_data']['payback']){
      this.profileData['report_defaults']['threed_data']['financial']=false;
    }
    this.tempProfileData = JSON.parse(JSON.stringify(this.profileData));
    this.template_name = this.profileData['report_defaults']['template_name'];
    this.report_type =  this.profileData['report_defaults']['report_type'];
    this.colorDefault();
  },
  created(){
    const user = JSON.parse(localStorage.getItem("user")) || {};
    this.userCountry = user.country;
  },

  watch: {
    consumption:{
      handler(val){   
      if(!this.profileData['financial_data']['payback']){
      this.profileData['report_defaults']['threed_data']['financial']=false;
    }
      }
    },
    financials:{
      handler(val){
     if(!this.profileData['financial_data']['payback']){
       this.profileData['report_defaults']['threed_data']['financial']=false;
    }
      }
    },
  },

  methods: {

    isThisPageDisabled(page){
      if (page == 'battery-storage' && !this.isBatteryAvailable)
        return true;
      return false;
    },

    onstartChange() {
       this.isStartDateChanged=true;
     
    },
    onendChange() {
      this.isEndDateChanged=true;
     
    },
    updatePages() {
      console.log("updatePage", this.checkedPages);
      // serverBus.$emit('checkedPages', this.checkedPages);
      this.onDialogClose();
    },
    handleCheckAllChange(val) {
      let newPages = this.checkListReportPages.map(a => a.label)
      this.checkedPages = val ? newPages : [];
      console.log(this.checkedPages);
      this.isIndeterminate = false;
    },
    // handleCheckedPagesChange(value) {
    //   let checkedCount = value.length;
    //   console.log("gidgifk",checkedCount)
    //   console.log("Checked Pages",this.checkedPages);
    //   this.checkAll = checkedCount === this.pages.length;
    //   this.isIndeterminate =
    //     checkedCount > 0 && checkedCount < this.pages.length;
    // },
    onDialogClose() {
      this.$emit("update:isModifyProposalPopupVisible", false);
    },


    // -----------------------------------------------------------------------------------------------------------------------------------------//





    ...mapActions(useDesignStore, {
      UPDATE_DESIGN_VERSION_SETTINGS: "UPDATE_DESIGN_VERSION_SETTINGS",
    }),
    handleReset(){
      this.reset=false;
    },
    async colorDefault() {
      try {
        if (this.designVersionSettingsData) {
          this.designVerId= this.designVersionSettingsData.id;
          this.defaultColors =
            this.designVersionSettingsData.report_defaults.custom_color;
          this.constDefaultColors=this.defaultColors;
        }
      } catch (e) {
        console.log(e);
      }
    },

    onCancelReportPageDialog() {
      this.profileData.report_defaults.pages = this.oldState;
      this.$emit("update:isReportPageSelectDialogVisible", false);
    },
    async updateReport() {
      // this.onCancelReportPageDialog();
      let profileDataPage = this.updatedState;
      // this.profileData.report_defaults["pages"] = this.updatedState;
      this.updatedState = this.profileData.report_defaults["pages"];  // Just Going out of the Flow For now
      // debugger
      this.updatedPages = this.updatedState;
      this.tempProfileData.report_defaults[
        "template_name"
      ] = this.template_name;
      let fetchDesignVersion=await API.DESIGN_VERSION_SETTINGS.FETCH_VERSION_SETTINGS(
        this.designVerId   
      );
      let designVersionId=fetchDesignVersion.data.report_defaults.defaultProfileId;
      let designVersionName=fetchDesignVersion.data.report_defaults.defaultProfileName;
      this.tempProfileData.report_defaults["report_type"] = this.report_type;
      this.tempProfileData.report_defaults.custom_color = this.profileData.report_defaults.custom_color;
      this.tempProfileData.report_defaults.shadowAnalysis = this.profileData.report_defaults.shadowAnalysis;
      this.tempProfileData.report_defaults.threed_data = this.profileData.report_defaults.threed_data;
      this.tempProfileData.report_defaults["defaultProfileId"]=designVersionId;
      this.tempProfileData.report_defaults["defaultProfileName"]=designVersionName;
      this.tempProfileData.report_defaults.pages=this.updatedPages;
      this.isDownloading = true;
      let patchData = {
        report_defaults: this.tempProfileData.report_defaults,
      };
      try {
        // await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
         await API.DESIGN_VERSION_SETTINGS.PATCH_VERSION_SETTINGS(
                this.designVerId ,
                patchData,
          );
        //   const response = await API.DESIGNS.FETCH_REPORT(
        //     this.designId,
        //     profileDataPage
        //   );
        // const reportUrl = response.data;
        // this.downloadFileHelper(reportUrl, ".pdf");
        this.isDownloading = false;
        this.$emit("getAllCheckedPages",this.profileData.report_defaults["pages"],this.tempProfileData.report_defaults);
        this.loadingState=false;
        
      } catch (e) {
        console.error("ERROR: updateReport failed");
        this.isDownloading = false;
        this.loadingState=false;
        this.$message({
          showClose: true,
          message: "There was an error updating the report. Please try again.",
          type: "error",
          center: true
        });
      }
    },

    async onUpdateButton(){
      console.log(this.profileData['report_defaults']['pages']);
      this.loadingState=true;
      // debugger
      if(this.updatedState.length===0 && this.profileData['report_defaults']['pages'].length==0 )
      {
        this.$message({
          showClose: true,
          message: "No Pages Selected!",
          type: "error",
          center: true
        });
      }
      else{    
        await this.updateReport();
        this.$emit("updateshadow", {
          startDateChange:this.isStartDateChanged,
          endDateChange:this.isEndDateChanged,
        });
        this.onDialogClose();
      }
    },
    
    downloadFileHelper(url, extension) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.setAttribute("download", this.designId + extension); // or any other extension
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    },
    determineValuesPresent(arrContainingVal) {
      let allValuesPresent = true;
      for (let i = 0; i < arrContainingVal.length; i++) {
        if (
          this.profileData.report_defaults.pages.indexOf(
            arrContainingVal[i]
          ) === -1
        ) {
          allValuesPresent = false;
          return allValuesPresent;
        }
      }
      return allValuesPresent;
    },
    determineValuesAbsent(arrContainingVal) {
      let allValuesAbsent = true;
      for (let i = 0; i < arrContainingVal.length; i++) {
        if (
          this.profileData.report_defaults.pages.indexOf(
            arrContainingVal[i]
          ) !== -1
        ) {
          allValuesAbsent = false;
          return allValuesAbsent;
        }
      }
      return allValuesAbsent;
    },
    //  style="height: 40px; width:200px; border-radius: 4px;"
    addMissingShadingReportValues(arrContainingVal) {
      for (let i = 0; i < arrContainingVal.length; i++) {
        if (
          this.profileData.report_defaults.pages.indexOf(
            arrContainingVal[i]
          ) === -1
        ) {
          this.profileData.report_defaults.pages.push(arrContainingVal[i]);
        }
      }
    },
    removeShadingReportValues(arrContainingVal) {
      for (let i = 0; i < arrContainingVal.length; i++) {
        let currentValIndex = this.profileData.report_defaults.pages.indexOf(
          arrContainingVal[i]
        );
        if (currentValIndex !== -1) {
          this.profileData.report_defaults.pages.splice(currentValIndex, 1);
        }
      }
    },


  },

  computed: {
    ...mapState(useDesignStore, {
      projectCountry: (state) => state.project.country,
      projectDetails: (state)=> state.project,
      summary: 'GET_DESIGN_INFORMATION',
      financials: "GET_FINANCIAL_DATA",
    }),
    ...mapState(useProjectStore, {
      consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
    }),
    isUSFlagEnabled(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    isIndeterminateAllPages: function() {
      if (
        this.profileData.report_defaults.pages.length > 0 &&
        this.profileData.report_defaults.pages.length <
          this.checkListReportPages.length
      ) {
        return true;
      }
      return false;
    },
    checkAll: {
      get: function() {
        if (
          this.profileData.report_defaults.pages.length ===
          this.checkListReportPages.length
        ) {
          return true;
        }
        return false;
      },
      set: function(value) {
        if (value) {
          this.profileData.report_defaults.pages = [
            ...reportPagesListUs.map(pageDict => pageDict.label).filter(page => !this.isThisPageDisabled(page))
          ];
        } else {
          this.profileData.report_defaults.pages = [];
        }
      },
    },
    isIndeterminateShadingReport: function() {
      if (
        this.determineValuesAbsent(this.valDetermineArray) ||
        this.determineValuesPresent(this.valDetermineArray)
      ) {
        return false;
      }
      return true;
    },
    shadingReportPages: {
      get: function() {
        if (this.determineValuesPresent(this.valDetermineArray)) {
          return true;
        }
        return false;
      },
      set: function(value) {
        if (value) {
          this.addMissingShadingReportValues(this.valDetermineArray);
        } else {
          this.removeShadingReportValues(this.valDetermineArray);
        }
      },
    },
    financialSwitchHandler: {
      // return  this.profileData['report_defaults']['threed_data']['financial'];
      get: function() {
      //   const index1 = this.profileData.report_defaults.pages.indexOf("pv-as-an-asset");
      //   const index2 = this.profileData.report_defaults.pages.indexOf("estimated-monthly-savings");
      //   const index3 = this.profileData.report_defaults.pages.indexOf("cost-of-not-going-solar");
      //   let indexes = [index1, index2, index3];
      //   indexes.sort();
      // if(!this.profileData['report_defaults']['threed_data']['financial']){
      //   for (var i = indexes.length -1; i >= 0; i--){
      //     if(indexes[i]>-1)
      //     {
      //       this.profileData.report_defaults.pages.splice(indexes[i],1);
      //     }
      //   }
      // }
      return this.profileData['report_defaults']['threed_data']['financial'];
      },
      set: function(value) {
        this.profileData['report_defaults']['threed_data']['financial']=value;
      },
    }
  },

  updated() {
    if (this.lengthPages === 1) {
      this.oldState = this.profileData.report_defaults.pages;
      this.lengthPages = 2;
    } else {
      this.updatedState = this.profileData.report_defaults.pages;
    }
  },
};
</script>

<style scoped>
#parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#parentContainer >>> .el-dialog__title {
  width: 157px;
  /* height: 19px; */
  /* margin: 3px 892px 2px 0; */
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  /* font-weight: 600; */
  margin-left: 10px;
  color: #222222 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 2vh !important;
  width: 900px !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  overflow: hidden;
  overflow-y: scroll;
  word-break: break-word;
}

.containerOne {
  padding: 24px;
}

.selectAll {
  border-bottom: 1px solid #ccc;
  padding: 0px 0px 16px 0px;
}

.grpContainer {
  padding: 24px 0px 16px 0px;
}

#parentContainer >>> .el-checkbox {
  width: 30%;
  margin-right: 0px;
}

#parentContainer >>> .el-checkbox__label {
  font-size: 16px;
  color: #222;
  font-weight: normal;
}

#parentContainer >>> .el-checkbox-group {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  column-gap: 16px;
  row-gap: 24px;
}

#parentContainer >>> .el-checkbox__inner {
  width: 24px;
  height: 24px;
  border: 1px solid #222;
}

#parentContainer >>> .el-checkbox__inner::after {
  height: 13px;
  left: 7px;
  width: 7px;
  border-width: 3px;
}

#parentContainer >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  border: none !important;
}

.containerTwo {
  border-top: 2px solid #ccc;
  padding: 24px 24px 32px 24px;
}

.hdngTwo {
  font-size: 16px;
  font-weight: 600;
  color: #1c3366;
}

.flexCont {
  display: flex;
  column-gap: 189px;
  align-items: center;
  font-size: 16px;
  color: #222;
  margin-top: 24px;
}

#parentContainer >>> .el-switch {
  margin-left: 18px;
}

#parentContainer >>> .el-switch__core {
  height: 24px;
}

#parentContainer >>> .el-switch.is-checked .el-switch__core::after {
  left: 87%;
}

#parentContainer >>> .el-switch__core:after {
  width: 18px;
  height: 18px;
  top: 2px;
}

#parentContainer >>> .el-switch.is-checked .el-switch__core {
  border-color: #007bff;
  background-color: #007bff;
}

.containerThree {
  padding: 24px;
  text-align: right;
  border-top: 2px solid #ccc;
}

.updateBtn {
  font-size: 16px;
  font-weight: 600;
  padding: 15px 40px;
}

.mdHeight {
  max-height: 60vh;
  overflow: hidden;
  overflow-y: scroll;
}

.formHeadings {
  font-family: "Helvetica Neue";
  font-size: 16px !important;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 14px;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366;
  border-top: outset;
  padding-top: 1.4rem;
  padding-bottom: 13px;
  padding-left: 1.5rem;
}
.gridTime {
  display: flex;
  column-gap: 150px;
  padding-left: 1.5rem;
  padding-bottom: 24px;
}
.timeinCol {
  display: block;
}
.labelStart {
  font-size: 16px !important;
  padding-bottom: 4px;
  font-family: "Helvetica Neue";
  font-weight: 500;
  color: #222222;
  letter-spacing: normal;
  line-height: 2;
  font-stretch: normal;
  font-style: normal;
  min-width: max-content;
}
.labelEnd {
  font-size: 16px !important;
  padding-bottom: 4px;
  font-family: "Helvetica Neue";
  font-weight: 500;
  color: #222222;
  letter-spacing: normal;
  line-height: 2;
  font-stretch: normal;
  font-style: normal;
  min-width: max-content;
}
.startTime {
  width: 11rem;
  height: 2.5rem;
  border-radius: 4px;
  background-color: #f5f7fa;
  border: 0;
  padding: 4px 16px;
}

.endTime {
  width: 11rem;
  height: 2.5rem;
  border-radius: 4px;
  background-color: #f5f7fa;
  border: 0;
  padding: 4px 16px;
}

@media (max-width: 950px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  #parentContainer >>> .el-dialog__title {
    margin-left: 0px;
  }

  #parentContainer >>> .el-checkbox {
    width: 48%;
    margin-right: 0px;
  }

  .mdHeight {
    max-height: 55vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}
@media (max-width: 390px) {
  .formHeadings {
    font-size: 14px !important;
  }
}
@media (max-width: 650px) {
  #parentContainer >>> .el-dialog__wrapper {
    margin-top: 5vh !important;
  }

  #parentContainer >>> .el-checkbox {
    width: 100%;
    margin-right: 0px;
  }

  .flexCont {
    column-gap: 18px;
  }

  .gridTime {
    column-gap: 18px;
  }

  #parentContainer >>> .el-switch {
    margin-left: 10px;
  }

  .mdHeight {
    max-height: 68vh;
  }

  .containerThree{
    text-align: center;
    padding: 16px;
  }

  .startTime,
  .endTime {
    width: auto;
  }
}

</style>