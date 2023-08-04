<template>
  <div class="card">
    <div class="cardOne">
      <div class="card_header flex_header">
        <h4>Consumption Type</h4>
      </div>
      <div class="card_content">
        <div class="loading-section" v-if="isProjectInfoLoading" v-loading="isProjectInfoLoading">
          <span class="el-icon-loading"></span>
        </div>
        <div class="form" v-else>
          <div class="row">
            <div class="col col_4">
              <div class="field_container">
                <label>Type</label>
                <div class="group_radio">
                  <label>
                    <input
                      type="radio"
                      name="radio"
                      value="Residential"
                      v-model="projectDetails.projectType"
                      @change="enableUpdate()"
                    />
                    <div class="box">
                      <img src="../assests/Group 1684.svg" class="commercialSvg" />
                      <span>Residential</span>
                    </div>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="radio"
                      value="Commercial"
                      v-model="projectDetails.projectType"
                      @change="enableUpdate()"
                    />
                    <div class="box">
                      <img src="../assests/Group 1685.svg" class="commercialSvg" />
                      <span>Commercial</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="col col_4">
              <div class="field_container">
                <label>Consumption Profile*</label>
                <div class="custom_select" @click="openConsumptionProfileModal">
                  <div class="select_area">
                    <div type="text" class="input_field">
                      <p class="input_field_p">
                        {{
                          this.consumptionDetails.profile == null
                            ? "Select Consumption Profile"
                            : selectedProfile.Name ||
                              "Select Consumption Profile"
                        }}
                      </p>
                    </div>
                    <img src="../assests/Group 1654.svg" class="dropDownSvg" />
                  </div>
                </div>
              </div>
            </div>

            <!-- <div class="col col_4">
              <div class="field_container">
                <div class="flexCont">
                  <label>Estimated Energy Consumption</label>
                  <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>
                          Average consumption on per day basis
                        </p>
                      </div>
                  </div>
                </div>
                <span class="inputValues">kWh/Day</span>
                <el-input
                  v-model="estimatedEnergyConsumption"
                  type="Number"
                  @input="enableUpdate()"
                ></el-input>
                <p class="validationForInputs" v-if="estimatedEnergyConsumptionNegativeError">
                  This field cannot be negative number
                </p>
              </div>
            </div>  -->

            <div class="col col_4">
              <div class="field_container">
                <div class="flexCont">
                  <label>Critical Load</label>
                  <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>
                          Minimum load to maintain per hour
                        </p>
                      </div>
                  </div>
                </div>
                <span class="inputValues">kW</span>
                <el-input
                  v-model="criticalLoad"
                  type="Number"
                  @input="enableUpdate()"
                ></el-input>
                <p class="validationForInputs" v-if="criticalLoadNegativeError">
                  This field cannot be negative number
                </p>
              </div>
            </div> 

          <!-- <div class="col col_4" v-if="false">
          <label>Group Classification</label>
          <el-select v-model="group_classification"  @change="enableUpdate()" placeholder="Select Use and Occupancy Classification">
            <el-option-group
              v-for="group in options"
              :key="group.label"
              :label="group.label"
              :value="group.value"
              >
              <div class="dropdownContainer">
              <p class="headDropdownOne">Group <br/>Classification</p><p class="headDropdownTwo">Group <br/>Type</p>
              </div>
              <hr/>
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.label"
                >
                <div class="dropdownContainer">
                <p class="valueDropdown">{{ item.value }}</p><p class="labelDropdown">{{ item.label }}</p>
                </div>
              </el-option>
            </el-option-group>
          </el-select>
          </div> -->
            
          </div>
          <div
            class="group_button"
          >
            <el-button v-if="isUpdateEnabled" type="primary" @click="updateProjectInfo()">Update</el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isConsumptionProfileOpen">
      <ConsumptionProfile
        @closeConsumptionProfileModal="isConsumptionProfileOpen = false"
        @confirmProfile="confirmProfile"
        :profileData="consumptionProfileData"
        :selectedProfile="selectedProfile"
      />
    </div>
  </div>
</template>


<script>
import axios from "axios";
import ConsumptionProfile from "../consumptionDetails_components/consumptionProfileModal.vue";
import API from "@/services/api/";
import { mapActions } from "pinia";
import { useProjectStore } from "../../../stores/project";
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';
export default {
  components: {
    ConsumptionProfile,
  },
  data() {
    return {
        options: [{
          label: '',
          options: [{
            value: 'A',
            label: 'Assembly'
          }, {
            value: 'B',
            label: 'Business'
          },{
            value: 'I',
            label: 'Institutional'
          },{
            value: 'R1',
            label: 'Transient Residential Dwelling'
          },{
            value: 'R2',
            label: 'High Occupancy Residential Dwelling'
          },{
            value: 'R3',
            label: '1 or 2 Family Dwelling'
          },{
            value: 'R4',
            label: 'Assisted Living Residential Dwelling'
          },{
            value: 'S',
            label: 'Storage'
          },{
            value: 'U',
            label: 'Utility and Miscellaneous'
          },{
            value: 'E',
            label: 'Educational'
          },{
            value: 'F',
            label: 'Factory and Industrial'
          },{
            value: 'H',
            label: 'High Hazard'
          },{
            value: 'M',
            label: 'Mercantile'
          },]
        }],
        group_classification: '',
      isProjectInfoLoading: false,
      // projectId: this.$route.params.projectId,
      projectId: this.$route.params.projectId || this.projectIdFromGenericComponent,
      // projectId: 23329,
      projectInformation: {
        projectType: "",
        consumption: 0,
        profile: "",
      },
      projectDetails: {
        projectType: "",
      },
      consumptionDetails: {
        consumption: 0,
        profile: -1,
      },
      isConsumptionProfileOpen: false,
      consumptionProfileData: [],
      allConsumptionProfileData: [],
      selectedProfile: {
        Name: "",
      },
      isUpdateEnabled:false,
      estimatedEnergyConsumption:0,
      estimatedEnergyConsumptionNegativeError:false,
      criticalLoad:0,
      criticalLoadNegativeError:false,

    };
  },
  props:{
      projectIdFromGenericComponent:{
        type: Number,
        default:null,
      }
  },
   mixins: [homeRedirectionMixin],
  computed: {
    watchProjectType() {
      return this.projectDetails.projectType;
    },
    enableUpdateProjectInfo() {
      return (
        this.projectDetails.projectType != this.projectInformation.projectType
      );
    },
    enableUpdateConsumptionDetails() {
      return this.projectInformation.profile != this.consumptionDetails.profile;
    },
  },
  mounted() {
    // this.getProjectDetails();
    this.assignProjectDetail();
  },
  methods: {
    ...mapActions(useProjectStore, [
      "UPDATE_PROJECT_INFORMATION",
      "GET_CURRENT_PROJECT",
      'UPDATE_PROJECT_CONSUMPTION_DETAILS'
    ]),
    async getProjectDetails() {
      try {
        await this.GET_CURRENT_PROJECT(this.projectId);
        this.isProjectBeingLoaded = false;
      } catch (e) {
        if (e.response.status) {
          if (e.response.status === 404 || e.response.status === 403) {
            this.$message({
              showClose: true,
              message: "Project not found. Redirecting to Home Page ...",
              type: "error",
              center: true
            });
          } else if (e.response.status === 500) {
            this.$message({
              showClose: true,
              message: "Error in loading project. Please try again.",
              type: "error",
              center: true
            });
          }
          setTimeout(() => {
            this.redirectToHomeBasedOnCountry()
            // this.$router.push({ name: "home" });
          }, 2000);
        }
      }
    },
    async assignProjectDetail() {
      this.isProjectInfoLoading = true;
      const projectInfo = await API.PROJECTS.FETCH_PROJECT(this.projectId);
      this.projectDetails.projectType = this.projectInformation.projectType =
        projectInfo.data.project_type == "residential"
          ? "Residential"
          : "Commercial";  

      this.criticalLoad = projectInfo.data.consumption_details.critical_load;
      this.estimatedEnergyConsumption = projectInfo.data.consumption_details.estimated_energy_consumption;
      // this.group_classification = projectInfo.data.group_classification;

      // consumptionDetails
      this.consumptionDetails.consumption =
        this.projectInformation.consumption = projectInfo.data.consumption;
      this.consumptionDetails.profile = this.projectInformation.profile =
        projectInfo.data.consumption_profile;

      const consumptionProfileResp = await axios.get(
        "api/master-data/consumptionProfile/"
      );
      this.allConsumptionProfileData = consumptionProfileResp.data.results;
      this.consumptionProfileData = [];
      if(!this.projectDetails.projectType){
        this.projectDetails.projectType = "Commercial";
      }
      this.allConsumptionProfileData.forEach((item) => {
        if (item.Profile_type == this.projectDetails.projectType)
          this.consumptionProfileData.push(item);
      });
      if (!this.consumptionDetails.profile) {
        this.selectedProfile = JSON.parse(
          JSON.stringify(this.consumptionProfileData[0])
        );
        this.consumptionDetails.profile = this.selectedProfile.id;
        this.updateConsumptionDetails();
      }
      let tempSelectedProfile =
        this.consumptionDetails.profile == null
          ? this.consumptionProfileData[0]
          : this.consumptionProfileData.filter(
              (item) => item.id == this.consumptionDetails.profile
            )[0];

      if (!tempSelectedProfile)
        tempSelectedProfile = JSON.parse(
          JSON.stringify(this.consumptionProfileData[0])
        );
      this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
      this.isProjectInfoLoading = false;
    },
    isValidationPassed(){
      this.estimatedEnergyConsumptionNegativeError = this.estimatedEnergyConsumption<0 ? true : false;
      this.criticalLoadNegativeError = this.criticalLoad <0 ? true : false;

      if(this.estimatedEnergyConsumptionNegativeError || this.criticalLoadNegativeError){
        return false;
      }
      return true;
    },
    async updateProjectInfo() {

      if(!this.isValidationPassed()){
        return ;
      }
      // if (!this.enableUpdateProjectInfo) return;
      let reqBody = {
        project_type:
          this.projectDetails.projectType == "Commercial"
            ? "commercial"
            : "residential",
        consumption_profile_type: this.consumptionDetails.profile,
        critical_load: Number(this.criticalLoad),
        // estimated_energy_consumption:(this.estimatedEnergyConsumption)
        // group_classification: this.group_classification
      };
      try {
        // await this.UPDATE_PROJECT_INFORMATION(reqBody);
        console.log("req body",reqBody)
        await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(reqBody);
        this.projectInformation.projectType = this.projectDetails.projectType;
        this.projectInformation.profile = this.consumptionDetails.profile;
        this.isUpdateEnabled=false;

        this.$message({
          showClose: true,
          message: "Successfully Updated",
          type: "success",
          center: true
        });
      } catch (error) {
        let errorMessage = error.response.status === 403 ? "You don't have permission to edit this project." : 'error'
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        })
      }
    },
    async updateConsumptionDetails() {
      // if(!this.enableUpdateConsumptionDetails) return;
      let reqBody = {
        // consumption: this.consumptionDetails.consumption,
        consumption_profile: this.consumptionDetails.profile,
        // period: this.consumptionDetails.period,
      };
      try {
        console.log("Here");
        await this.UPDATE_PROJECT_INFORMATION(reqBody);
        this.projectInformation.consumption =
          this.consumptionDetails.consumption;
        this.projectInformation.profile = this.consumptionDetails.profile;
        // this.projectInformation.period = this.consumptionDetails.period;
      } catch (e) {
        console.error(e);
      }
    },
    resetProjectInfo() {
      this.projectDetails.projectType = this.projectInformation.projectType;
    },
    resetConsumptionDetails() {
      this.consumptionDetails.consumption = this.projectInformation.consumption;
      this.consumptionDetails.profile = this.projectInformation.profile;
      // this.consumptionDetails.period = this.projectInformation.period;
      const tempSelectedProfile =
        this.projectInformation.profile == null
          ? { Name: "" }
          : this.allConsumptionProfileData.filter(
              (item) => item.id === this.projectInformation.profile
            )[0];
      this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
    },
    async openConsumptionProfileModal() {
      this.isConsumptionProfileOpen = true;
    },
    confirmProfile(profile) {
      this.selectedProfile = JSON.parse(JSON.stringify(profile));
      this.consumptionDetails.profile = this.selectedProfile.id;
      this.isUpdateEnabled=true;
    },
    closeModal() {
      this.isConsumptionProfileOpen = false;
    },
    enableUpdate(){
      this.isUpdateEnabled = true;
    }
  },
  watch: {
    watchProjectType() {
      if (this.allConsumptionProfileData.length > 0) {
        let tempProfileData = [];
        this.allConsumptionProfileData.forEach((item) => {
          if (item.Profile_type == this.projectDetails.projectType)
            tempProfileData.push(item);
        });
        this.consumptionProfileData = JSON.parse(
          JSON.stringify(tempProfileData)
        );

        let tempSelectedProfile =
          this.consumptionDetails.profile == null
            ? this.consumptionProfileData[0]
            : this.consumptionProfileData.filter(
                (item) => item.id == this.consumptionDetails.profile
              )[0];

        if (!tempSelectedProfile)
          tempSelectedProfile = JSON.parse(
            JSON.stringify(this.consumptionProfileData[0])
          );
        this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
      }
    },
    estimatedEnergyConsumption:{
      handler(val){
        this.estimatedEnergyConsumptionNegativeError = val <0 ? true : false;
      }
    },
    criticalLoad:{
      handler(val){
        this.criticalLoadNegativeError = val <0 ? true : false;
      }
    }
  },
};
</script>

<style scoped>
.validationForInputs{
  margin-left: 3px;
  line-height: normal;
  color: #ff0000;
  margin-top: 8px;
}
.hover_information {
  display: inline-block;
  position: relative;
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

.hover_information .tooltip.tooltip-end {
  left: unset;
  right: -15px;
}

.hover_information .tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
}

.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.inputValues {
  position: absolute;
  right: 24px;
  font-size: 16px;
  z-index: 100;
  margin-top: 4px;
  top: 38px;
  color: #222;
}
.validationCss {
  word-break: break-word;
  margin: 4px auto 0px auto;
  line-height: 25px;
  font-size: 12px;
  color: #ff0000;
}

.allContainer {
  width: 100%;
  height: 100%;
  background-color: #e8edf2;
  margin: 0;
  padding: 0;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  width: 90%;
  margin: 20px auto;
}

.card >>> ::placeholder {
  color: #222;
  font-size: 16px;
  font-weight: 100;
}

.el-select-group__wrap{
  margin-top: 0px !important;
}

.card >>> .el-form-item__label{
  color: #222 !important;
}

.card >>> .el-input--suffix .el-input__inner {
  height: 48px;
  border: none !important;
  background-color: #e8edf2 !important;
  color: #222 !important;
  font-size: 16px !important;
}

.card >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  font-size: 18px;
}

.card >>> .el-select {
  width: 35%;
}

.el-select-group__wrap{
  margin-top: 0px !important;
}

.card .card_header {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  height: 48px;
  align-items: center;
  padding: 0px 0px 0pc 24px;
}

.flex_header {
  display: flex;
  justify-content: space-between;
}

.card .card_header h4 {
  /* font-family: "Roboto"; */
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.card_content {
  padding: 24px 24px 16px 24px;
  border-radius: 12px 12px 0 0;
}

.loading-section {
  display: flex;
  justify-content: center;
  padding-top: 25px;
  padding-bottom: 25px;
}

.form {
  font-size: 14px;
  color: #222;
}

.row {
  margin-right: -12px;
  margin-left: -12px;
  flex-wrap: wrap;
  display: flex;
}

.row .col {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
  min-height: 1px;
  padding-right: 12px;
  padding-left: 14px;
  position: relative;
}

.col.col_4 {
  flex: 0 0 33.333333%;
  max-width: 33.1%;
}

.field_container {
  margin-bottom: 16px;
}

.form label {
  margin-bottom: 10px;
  display: block;
  font-size: 14px;
}

.form label[class] {
  margin: 0;
}

.group_radio {
  width: 100%;
  display: flex;
  height: 48px;
}

.group_radio label {
  display: flex;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.group_radio label:first-child .box {
  border-radius: 4px 0 0 4px;
}

.group_radio label:last-child .box {
  border-radius: 0 4px 4px 0;
}

.group_radio input[type="radio"] {
  display: none;
}

.group_radio input[type="radio"]:checked + .box {
  background-color: #e8edf2;
}

.group_radio .box {
  width: 100%;
  overflow: hidden;
  border: 1px solid #999;
  background-color: #fff;
  transition: all 250ms ease;
  will-change: transition;
  display: inline-block;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  color: #222;
  padding: 6px 8px;
  user-select: none;
  display: flex;
  align-items: center;
  font-weight: 400;
}

.group_radio .box .icon {
  font-size: 22px;
  margin-right: 4px;
}

.custom_select {
  position: relative;
}

.select_area {
  position: relative;
}

.select_area input {
  padding-right: 30px;
}

.select_area .icon {
  position: absolute;
  right: 10px;
  top: 17px;
  cursor: pointer;
}

.form select,
.input_field {
  border: none;
  background-color: #e8edf2;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  height: 30px;
}

.input_field {
  padding: 0 0 0 8px !important;
  height: 46px !important;
  cursor: pointer;
}

.group_button {
  text-align: right;
}

/* .group_button .btn:not(:last-child) {
  margin-right: 12px;
} */

.group_button button:disabled {
  background: #e8edf2;
  color: #222;
  border: 1px solid #e8edf2;
  cursor: not-allowed;
}

/* .btn {
  padding: 8px 24px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #999;
  color: #222;
  border-radius: 4px;
}

.btn.btn-danger {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.btn.btn-outline {
  background: #fff;
} */

.commercialSvg{
  margin: auto 5px auto 0px;
}

.dropDownSvg {
  position: absolute;
  top: 24%;
  right: 2%;
  height: 24px;
  width: 24px;
}

.input_field_p{
  padding-top: 10px;
  font-size: 16px;
}

/* -------------------------graph----- */

/* .inputContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
}

.formContainer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
  padding: 10px 0px 10px 10px;
}

.card >>> .el-form-item {
  width: 15% !important;
  margin-bottom: 0px !important;
  position: relative !important;
}

.card >>> .el-input {
  width: 80% !important;
}

.card >>> .el-input__inner {
  border: 1px solid #999;
}

.currIcon {
  position: absolute;
  top: 22%;
  right: 20%;
  z-index: 1;
  height: 38px;
  width: 20%;
  text-align: center;
  background-color: #e8edf2;
  border-top: 1px solid #999;
  border-bottom: 1px solid #999;
  border-right: 1px solid #999;
  font-size: 14px;
  font-weight: 100;
  color: #222;
  border-radius: 0px 4px 4px 0px;
}

.inputInfo {
  margin: 0px;
  font-size: 14px;
  font-weight: 100;
  color: #777;
}

.btnContainer {
  text-align: right;
  margin: 10px 3% 10px 0px;
} */

.card >>> .el-select {
    width: 100% !important;
}


.headDropdownOne{
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #777;
  line-height: 1.5;
}

.headDropdownTwo{
  padding: 10px 0px;
  font-size: 14px;
  font-weight: 500;
  color: #777;
  line-height: 1.5;
}



.dropdownContainer{
  display: grid;
  grid-template-columns: 40% 60%;
}

.grpClsNone{
  display: none;
}

.valueDropdown,
.labelDropdown{
    font-size: 16px !important;
    color: #222 !important;
     width: auto;
     white-space: initial !important;
}

/* @media screen and (max-width: 1100px) {
  .col.col_4 {
    flex: auto;
    max-width: inherit;
  }

  .card >>> .el-select {
    width: 55% !important;
  }
  .card >>> .el-form-item {
    width: 25% !important;
  }

  .card >>> .el-input {
    width: 87% !important;
  }

  .currIcon {
    right: 13%;
  }

} */

.el-select-group .el-select-dropdown__item {
    padding-left: 20px;
    height: auto !important;
}

.card >>> .el-input__inner {
  height: 48px;
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  border: none;
}

.flexCont {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

@media screen and (max-width: 1100px) {
  .card_content {
    padding: 24px 12px !important;
  }

  .card >>> .el-select {
    width: 100% !important;
  }

  .card >>> .el-form-item {
    width: 50% !important;
  }


  .row {
    flex-direction: column;
  }

  .col.col_4 {
    flex: 0 0 33.333333%;
    max-width: 100%;
  }

  .form select,
  .input_field {
    width: 100%;
  }

  .card .card_header h4 {
  margin-left: -12px;
}

.valueDropdown,
.labelDropdown{
    font-size: 16px !important;
    color: #222 !important;
     width: auto;
}
}
</style>