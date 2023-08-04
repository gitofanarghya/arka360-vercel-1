<template>
  <div id="reportPageDialog" v-loading.fullscreen.lock="isDownloading">
    <el-dialog
      title="Export Report"
      :visible="isReportPageSelectDialogVisible"
      :close-on-click-modal="false"
      @close="onCancelReportPageDialog"
      width="75vw"
    >
      <div v-bar class="scroll-area">
        <div>
          <div  class="tempandOri">
            <div>
              <div>
                <label for="templateOpts" class="selectTemplate"
                  >Select Template</label
                >
              </div>
              <div>
                <el-select v-model="template_name" placeholder="Select">
                  <el-option
                    v-for="item in templateOpts"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <span class="templateLabel">{{ item.label }}</span>
                    <span
                      style="float: right; color: color: #263342; font-size: 11px; font-style: italic"
                      ><a v-if="template_name == 'solar_lab'"></a>
                      <a
                        v-else-if="report_type == 'landscape' || report_type == ''"
                        :href="item.land_link"
                        target="_blank"
                      >
                        <u>{{ item.label_link }}</u>
                      </a>
                      <a v-else :href="item.port_link" target="_blank">
                        <u>{{ item.label_link }}</u>
                      </a>
                    </span>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div v-if="isOrientation" class="outerOrientation">
              <label class="labelOrientation" for="orientation"
                >Orientation</label
              >
              <div class="allOrientations">
                <p class="orientation">
                  <input
                    v-model="report_type"
                    value="landscape"
                    type="radio"
                    id="test1"
                    name="radio-group"
                    checked
                  />
                  <label for="test1">Landscape</label>
                </p>
                <p class="orientation">
                  <input
                    v-model="report_type"
                    value="portrait"
                    type="radio"
                    id="test2"
                    name="radio-group"
                  />
                  <label for="test2">Portrait</label>
                </p>
              </div>
            </div>
          </div>

          <div class="allCheckboxes">
            <div
              class="nameCheckBox"
              style="float: none; width:100%; border-top: outset; padding-top: 0.85em; padding-left:1.5rem;"
            >
              <el-checkbox
                :indeterminate="isIndeterminateAllPages"
                v-model="checkAll"
                class="checkBoxBorder"
                style="padding: 0 10px 0 0"
              >
              </el-checkbox>
              <div style="font-weight: 900">Select All Pages</div>
            </div>
            <div class="checkBox">
              <div class="checkboxIn">
                <div class="nameCheckBox">
                  <el-checkbox
                    :indeterminate="isIndeterminateShadingReport"
                    v-model="shadingReportPages"
                    class="checkBoxBorder"
                    style="padding: 0 10px 0 0"
                  >
                  </el-checkbox>
                  <div>Shading Report</div>
                </div>

                <el-checkbox-group
                  v-model="profileData.report_defaults.pages"
                  class="checkBoxBorder"
                >
                  <div
                    v-for="page in checkListReportPages"
                    :key="page.label"
                    class="nameCheckBox"
                  >
                    <el-checkbox :label="page.label">
                      <div style="display: none">&nbsp;</div>
                    </el-checkbox>
                    <div>
                      {{ page.name }}
                    </div>
                  </div>
                </el-checkbox-group>
              </div>
            </div>
          </div>

          <!-- ==================== Custom color report component ========================= -->
          <div class="outercustomColor">
            <div class="formHeadings" style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center; /* border-top: outset; */ padding-top: 1rem;">
            <span>Report Custom</span> 
            </div>
            <TSLBasicReportEditDefaults
              :profileData="profileData"
              :template_name="template_name"
              :defaultColors="defaultColors"
              :reset="reset"
              @resetFalse="handleReset"
            />
          </div>
          <!-- ============================= End ========================================== -->
          <!-- <div
                        v-if="true"
                        class="nameCheckBoxs"
                        > -->
          <!-- <div style="line-height: 40px"> Report Colors</div> -->
          <!-- <el-select 
                            v-model="reportColor"
                            disabled
                            size="mini"
                            :popper-append-to-body="false"
                            class="colorDropdown">
                            <el-option value="#005482 #194a91 #0086ae" label="blue">
                                <div class="colorOptionsWrapper">
                                    <div style="background: #005482; width: 20px;"></div>
                                    <div style="background: #194a91; width: 20px;"></div>
                                    <div style="background: #0086ae; width: 20px;"></div>
                                </div>
                            </el-option>
                        </el-select> -->
          <!-- </div> -->
          <el-form
            :model="profileData"
            size="mini"
            label-position="left"
            label-width="250px"
          >
            <p class="formHeadings">Data for 3D Model</p>
            <div class="defaultData">
              <el-form-item class="generations" label="Generation">
                <el-switch
                  class="generationClass"
                  v-model="
                    profileData['report_defaults']['threed_data']['generation']
                  "
                >
                </el-switch>
              </el-form-item>
              <el-form-item label="Financials">
                <el-switch
                  v-model="
                    financialSwitchHandler
                  "
                  :disabled = "!financials.length || !financials[0].payback"
                >
                </el-switch>
              </el-form-item>
            </div>
            <div
              style="margin-bottom:2rem;"
              v-show="
                profileData.report_defaults.pages.indexOf('shadow-analysis') !==
                  -1
              "
            >
              <p class="formHeadings">
                Time Consideration for Shadow Analysis 
                <!-- ({{
                  projectData.timezone
                }}) -->
              </p>
              <div class="gridTime">
                <div class="timeinCol">
                  <label for="Start Time" class="labelStart">Start Time</label>
                  <input
                    type="time"
                    id="Start Time"
                    class="startTime"
                    required
                    v-model="
                      profileData.report_defaults.shadowAnalysis
                        .start_time_shadow_analysis
                    "
                    v-validate="shadowAnalysisStartTimeValidation"
                    name="Start Time"
                  />
                  <p class="formErrors">
                    <span>{{ errors.first("Start Time") }}</span>
                  </p>
                </div>
                <div class="timeinCol">
                  <label for="End Time" class="labelEnd">End Time</label>
                  <input
                    type="time"
                    id="End Time"
                    class="endTime"
                    required
                    v-model="
                      profileData.report_defaults.shadowAnalysis
                        .end_time_shadow_analysis
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
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <!-- <button 
                    class="button-cancel" 
                    @click="onCancelReportPageDialog">
                    Cancel
                </button> -->
        <button
          native-type="submit"
          type="primary"
          class="button-confirm"
          :disabled="errors.items.length > 0 && errors.items[0].field!=='Category'"
          @click="isValid"
        >
          Export 
        </button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
import { reportPagesListNonUs } from "../../../../utils";
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../../stores/design";
import { useProjectStore } from "../../../../stores/project";
import TSLBasicReportEditDefaults from "../../../organisation/organisationDefaults/newProfileForms/settingsForms/customColorEdit.vue";

const checkedPagesCopy = reportPagesListNonUs.map(page => page.label)

export default {
  name: "DesignNameEditDialog",
  props: {
    isReportPageSelectDialogVisible: {
      type: Boolean,
      default: false,
    },
    profileData: {
      type: Object,
      default: function() {
        return {};
      },
    },
    projectData: {
      type: Object,
      default: function() {
        return {};
      },
    },
  },
  data() {
    return {
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
      options: [
        {
          value: "solar_labs",
          label: "Default",
          label_link: "",
          land_link: "",
          port_link: "",
        },
        {
          value: "solar_labs_2",
          label: "Theme 2",
          label_link: "View Sample",
          land_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_1_Horizontal.pdf",
          port_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_1_Verticle.pdf",
        },
        {
          value: "solar_labs_3",
          label: "Theme 3",
          label_link: "View Sample",
          land_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_2_Horizontal.pdf",
          port_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_2_Verticle.pdf",
        },
        {
          value: "solar_labs_usa",
          label: "Theme 4",
          label_link: "",
          land_link: "",
          port_link: "",
        },
      ],
      options1: [
        {
          value: "solar_labs",
          label: "Default",
          label_link: "",
          land_link: "",
          port_link: "",
        },
        {
          value: "solar_labs_2",
          label: "Theme 2",
          label_link: "View Sample",
          land_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_1_Horizontal.pdf",
          port_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_1_Verticle.pdf",
        },
        {
          value: "solar_labs_3",
          label: "Theme 3",
          label_link: "View Sample",
          land_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_2_Horizontal.pdf",
          port_link:
            "https://public-resources-bucket.s3.ap-south-1.amazonaws.com/report-templates/Report_2_Verticle.pdf",
        },
      ],
      value: "",
      isDownloading: false,
      checkListReportPages: reportPagesListNonUs,
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
    };
  },
  mounted() {
    if(!this.financials.length || !this.financials[0].payback){
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
      if(!this.financials.length || !this.financials[0].payback){
      this.profileData['report_defaults']['threed_data']['financial']=false;
    }
      }
    },
    financials:{
      handler(val){
     if(!this.financials.length || !this.financials[0].payback){
       this.profileData['report_defaults']['threed_data']['financial']=false;
    }
      }
    },
    template_name: {
      handler(val, oldVal) {
        if (val == "solar_labs_2" || val == "solar_labs_3") {
          // this.report_type = "landscape";
          this.isOrientation = true;
        } else if (val == "solar_labs") {
          this.report_type = "";
          this.isOrientation = false;
        } else if (val == "solar_labs_usa") {
          this.report_type = "portrait";
          this.isOrientation = false;
        }
      },
    },
  },

  components: {
    TSLBasicReportEditDefaults,
  },
  methods: {
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
    async downloadReport() {
      this.onCancelReportPageDialog();
      let profileDataPage = this.updatedState;
      this.profileData.report_defaults["pages"] = this.updatedState;
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
        await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
        const response = await API.DESIGNS.FETCH_REPORT(
          this.designId,
          profileDataPage
        );
        const reportUrl = response.data;
        this.downloadFileHelper(reportUrl, ".pdf");
        this.isDownloading = false;
      } catch (e) {
        console.error("ERROR: designSummaryHeader: downloadReport failed");
        this.isDownloading = false;
        this.$message({
          showClose: true,
          message: "Error downloading report. Try again.",
          type: "error",
          center: true
        });
      }
    },

    isValid(){
      if(this.updatedState.length===0)
      {
        this.$message({
          showClose: true,
          message: "No Pages Selected!",
          type: "error",
          center: true
        });
      }
      else{
        this.downloadReport();
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
    ...mapState(useProjectStore, {
      consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
    }),
    ...mapState(useDesignStore, {
      projectCountry: (state) => state.project.country,
      projectDetails: (state) => state.project,
      designVersionSettingsData: "GET_DESIGN_VERSION_SETTINGS",
      summary: 'GET_DESIGN_INFORMATION',
      financials: "GET_FINANCIAL_DATA",
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
    templateOpts(){
      return this.projectCountry===52 ? this.options : this.options1;
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
          this.profileData.report_defaults.pages = [...checkedPagesCopy];
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
      get: function() {
        const index1 = this.profileData.report_defaults.pages.indexOf("savings");
        const index2 = this.profileData.report_defaults.pages.indexOf("monthly-savings");
        const index3 = this.profileData.report_defaults.pages.indexOf("bill-with-without-solar");
        let indexes = [index1, index2, index3];
        indexes.sort();
      if(!this.profileData['report_defaults']['threed_data']['financial']){
        for (var i = indexes.length -1; i >= 0; i--){
          if(indexes[i]>-1)
          {
            this.profileData.report_defaults.pages.splice(indexes[i],1);
          }
        }
      }
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

<style type="text/css" scoped>
.outercustomColor {
  margin-top: 1rem;
  height: 180px;
}

.templateLabel {
  float: left;
  font-size: 16px;
}

.outerOrientation {
  margin-left: 4rem;
}

#reportPageDialog >>> .el-input__inner {
  font-size: 16px !important;
}

.labelStart {
  font-size: 16px !important;
  padding-bottom: 4px;
  font-family: "Helvetica Neue";
  font-weight: 500;
  color: #777;
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
  color: #777;
  letter-spacing: normal;
  line-height: 2;
  font-stretch: normal;
  font-style: normal;
  min-width: max-content;
}

.labelOrientation {
  padding-top: 0.75rem;
  font-weight: 600;
  font-family: "Helvetica Neue";
  font-size: 16px;
  /* font-weight: 500; */
  font-stretch: normal;
  font-style: normal;
  /* line-height: 2.13; */
  letter-spacing: normal;
  text-align: left;
  color: #1c3366;
}

.nameCheckBox {
  display: flex;
  float: left;
  flex-direction: row;
  width: 33.3%;
  margin-bottom: 1rem;
  /* font-family: Roboto; */
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

.allCheckboxes {
  height: 274px;
}

@media (max-width: 1175px) {
  .allCheckboxes {
    height: 332px;
  }
  .outerOrientation {
    margin-left: 3rem;
  }

  .nameCheckBox {
    display: flex;
    float: left;
    flex-direction: row;
    width: 50%;
    margin-bottom: 1rem;
/*    font-family: Roboto; */
    font-size: 16px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
    color: #222;
  }
  .outercustomColor {
    margin-top: 2rem;
    height: 180px;
  }
}

.selectTemplate {
  padding-bottom: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  font-family: "Helvetica Neue";
  font-size: 16px;
  /* font-weight: 500; */
  font-stretch: normal;
  font-style: normal;
  /* line-height: 2.13; */
  letter-spacing: normal;
  text-align: left;
  color: #1c3366;
}

.startTime {
  width: 11rem;
  height: 2.5rem;
  border-radius: 4px;
  background-color: #f5f7fa;
  border: 0;
}

.endTime {
  width: 11rem;
  height: 2.5rem;
  border-radius: 4px;
  background-color: #f5f7fa;
  border: 0;
}

.defaultData {
  display: flex;
  width: fit-content;
  padding-left: 1.5rem;
}

.orientation {
  padding-right: 1rem;
}

.tempandOri {
  display: flex;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  margin-left: 1rem;
}

.allOrientations {
  display: flex;
  padding-top: 1rem;
}

[type="radio"]:checked,
[type="radio"]:not(:checked) {
  font-size: 16px;
  position: absolute;
  left: -9999px;
}
[type="radio"]:checked + label,
[type="radio"]:not(:checked) + label {
  font-size: 16px;
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  line-height: 20px;
  display: inline-block;
  color: #666;
}
[type="radio"]:checked + label:before,
[type="radio"]:not(:checked) + label:before {
  font-size: 16px;
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  border-radius: 100%;
  background: #fff;
}
[type="radio"]:checked + label:after,
[type="radio"]:not(:checked) + label:after {
  font-size: 16px;
  content: "";
  width: 12px;
  height: 12px;
  background: #409eff;
  position: absolute;
  top: 4px;
  left: 4px;
  border-radius: 100%;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}
[type="radio"]:not(:checked) + label:after {
  font-size: 16px;
  opacity: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
}
[type="radio"]:checked + label:after {
  font-size: 16px;
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}
.gridTime {
  display: flex;
  padding-left: 1.5rem;
}

.timeinCol {
  display: block;
  width: 30%;
  margin-bottom: 1.2rem !important;
}

.checkBox {
  border-top: outset;
  padding-top: 1.5rem;
  margin-left: 1.5rem;
}

#reportPageDialog >>> .el-dialog {
  border-radius: 10px;
}

#reportPageDialog >>> .el-dialog__footer {
  border-top-style: ridge;
  text-align: center !important;
  margin-top: auto;
  padding: 1rem !important;
}

#reportPageDialog >>> .el-dialog__body {
  padding: 0 !important;
  overflow: hidden;
}

#reportPageDialog >>> .el-dialog__header {
  /* background-color: #1c3366; */
  padding: 1rem !important;
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0px !important;
}

#reportPageDialog >>> .el-form-item--mini .el-form-item__label {
  line-height: 28px;
  font-size: 16px;
}

#reportPageDialog >>> .el-dialog__title {
  font-weight: 550;
  color: #222222 !important;
}

#reportPageDialog >>> .el-dialog__wrapper {
  overflow: hidden;
}

#reportPageDialog >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800;
  font-size: 18px;
}

#reportPageDialog >>> .el-select-dropdown__list {
  height: 8rem;
}

#reportPageDialog >>> .el-select-dropdown {
  overflow: overlay !important;
}

#reportPageDialog >>> .button-confirm {
  background-color: #409eff !important;
  font-size: 16px !important;
  border: none !important;
  padding: 9px 2px !important;
  /* height: 40px  !important; */
  display: block;
  width: 7rem;
  border-radius: 4px;
}

#reportPageDialog >>> .el-select-dropdown__item {
  font-size: 16px !important;
}

.colorOptionsWrapper {
  display: flex;
  height: 20px;
  justify-content: space-around;
  margin: 7px 0 0 0;
}

.checkBoxBorder >>> .el-checkbox__inner {
  border: 1px solid #dcdfe6 !important;
  width: 18px;
  height: 18px;
}

.checkBoxBorder >>> .el-checkbox__inner::after {
  top: 3px;
  left: 6px;
}

.marginCheckBox {
  margin: 10px 0 0 0;
}

.el-checkbox-group {
  font-size: 16px;
}

#reportPageDialog .scroll-area {
  width: 100%;
  height: 65vh;
  position: relative;
  overflow: hidden auto !important;
}

.vb-content {
  width: calc(100% - 0px) !important;
}

#reportPageDialog .vb-content {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow: visible !important;
}

.vb-content::-webkit-scrollbar {
  width: 0;
}

#reportPageDialog >>> .el-input {
  width: calc(100% - 10px);
}

.colorDropdown >>> .el-select-dropdown {
  position: absolute !important;
  top: 33px !important;
  left: 0px !important;
  width: calc(100% - 10px);
  min-width: 0 !important;
}

label {
  display: block;
}
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 8px #f5f7fa;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #b30000;
}

.el-switch {
  height: 28px;
  margin: 0 10px 0 0;
  display: flex;
  right: 10rem;
}
.el-form-item--label-top .el-form-item__label {
  float: none;
  display: inline-block;
  text-align: left;
  padding: 0 0 10px;
}

.el-form-item--mini .el-form-item__label {
  line-height: 28px;
  /* width: 0 !important; */
  width: fit-content !important;
}

.el-form-item--label-top .el-form-item__content {
  margin-left: 0 !important;
}
.el-form-item--mini .el-form-item__content {
  display: contents !important;
}
.el-form-item__content {
  position: relative;
  font-size: 16px;
  margin-left: 0 !important;
  display: flex;
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

@media (max-width: 1040px) {
  #reportPageDialog >>> .el-dialog {
  border-radius: 10px;
  width: 93vw !important;
}

  .timeinCol {
    display: block;
    width: 30%;
    margin-bottom: 1rem;
  }

  .gridTime {
    display: block;
    padding-left: 1.5rem;
    padding-bottom: 0.1rem;
  }
}

@media (max-width: 768px) {
  .tempandOri {
    display: block;
    margin-bottom: 1.5rem;
    margin-left: 1rem;
  }
  .outerOrientation {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .defaultData {
    display: block;
    width: fit-content;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
  }
}
@media (max-width: 750px) {
  .allCheckboxes {
    height: 610px;
  }

  .nameCheckBox {
    display: flex;
    float: left;
    flex-direction: row;
    width: 100%;
    margin-bottom: 1rem;
/*    font-family: Roboto; */
    font-size: 16px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    text-align: left;
    color: #222;
  }
}
@media (max-width: 390px) {
  .templateLabel {
    float: left;
    font-size: 14px;
  }
  .formHeadings {
    font-size: 14px !important;
  }
  #reportPageDialog >>> .el-form-item--mini .el-form-item__label {
    font-size: 14px;
  }
  .labelStart {
    font-size: 14px !important;
  }
  .labelEnd {
    font-size: 14px !important;
  }
  .nameCheckBox {
    font-size: 14px !important;
  }
  .selectTemplate {
    font-size: 14px;
  }
  .labelOrientation {
    font-size: 14px;
  }
  #reportPageDialog >>> .el-input__inner {
    font-size: 14px !important;
  }
  [type="radio"]:checked,
  [type="radio"]:not(:checked) {
    font-size: 14px;
    position: absolute;
    left: -9999px;
  }
  [type="radio"]:checked + label,
  [type="radio"]:not(:checked) + label {
    font-size: 14px;
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    line-height: 20px;
    display: inline-block;
    color: #666;
  }
  [type="radio"]:checked + label:before,
  [type="radio"]:not(:checked) + label:before {
    font-size: 14px;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border: 1px solid #ddd;
    border-radius: 100%;
    background: #fff;
  }
  [type="radio"]:checked + label:after,
  [type="radio"]:not(:checked) + label:after {
    font-size: 14px;
    content: "";
    width: 12px;
    height: 12px;
    background: #409eff;
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 100%;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
  }
  [type="radio"]:not(:checked) + label:after {
    font-size: 14px;
    opacity: 0;
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  [type="radio"]:checked + label:after {
    font-size: 14px;
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  .outercustomColor {
    margin-top: 1rem;
    height: 180px;
  }
}

@media (max-width: 390px) {
  .allCheckboxes {
    height: 626px;
  }
}
</style>

<style lang="scss" scoped>
@import "../../../../styles/components/button";
@import "../../../../styles/components/forms";
</style>
