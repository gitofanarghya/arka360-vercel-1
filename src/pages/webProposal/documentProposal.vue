<template>
  <div>
    <div class="" v-loading.fullscreen.lock="isLoading"></div>
    <div
      class="parentContainer"
      :class="isPuppeteer ? 'parentContainerPuppeteer' : ''"
      v-if="!isLoading"
    >
      <AcceptAndSignPopup
        v-if="isAcceptAndSignPopupVisible && !isPuppeteer"
        :isAcceptAndSignPopupVisible.sync="isAcceptAndSignPopupVisible"
        :referenceId="referenceId"
        :proposalData="proposalData"
        @acceptedDocumentSignSubmit="acceptedDocumentSignSubmit"
      />
      <rejectProposalPopup
        v-if="rejectProposalPopupVisible"
        :rejectProposalPopupVisible.sync="rejectProposalPopupVisible"
        :referenceId="referenceId"
        @isDocumentRejected="isDocumentRejected"
      />
      <ModifyProposalPopup
        v-if="
          isModifyProposalPopupVisible &&
          profileData['report_defaults']['template_name'] == 'solar_labs_usa' &&
          !isPuppeteer
        "
        :isModifyProposalPopupVisible.sync="isModifyProposalPopupVisible"
        :profileData="profileData"
        :isBatteryAvailable="isBatteryAvailable"
        :designVersionSettingsData="designVersionSettingsData"
        @getAllCheckedPages="eventToFetchCheckedPages"
        @updateshadow="refreshShadowImages"
      />
      <ModifyProposalNonUSPopup
        v-if="
          isModifyProposalPopupVisible &&
          !(
            profileData['report_defaults']['template_name'] == 'solar_labs_usa'
          ) &&
          !isPuppeteer
        "
        :isModifyProposalPopupVisible.sync="isModifyProposalPopupVisible"
        :profileData="profileData"
        :isBatteryAvailable="isBatteryAvailable"
        :designVersionSettingsData="designVersionSettingsData"
        @getAllCheckedPages="eventToFetchCheckedPages"
        @updateshadow="refreshShadowImages"
      />
      <ShareAndDownloadPopup
        v-if="isShareAndDownloadPopupVisible && !isPuppeteer"
        :isShareAndDownloadPopupVisible.sync="isShareAndDownloadPopupVisible"
        :systemCapacity="systemCapacity"
        :referenceIdUrl="referenceIdUrl"
        :referenceId="referenceId"
        :reportOrientation="updatedData.report_type"
        :projectCreator="projectCreator"
        :profileData="profileData"
        :imagesAvailable="imagesAvailable"
        :imageLoadFailed="imageLoadFailed"
        :currency_code="dataFromAPI.country.currency_code"
      />

      <div class="proSumContainer" v-if="!isPuppeteer">
        

        <div class="cardContainer">
          <div
            class="cardPS"
            v-if="
              profileData['financial_data'] &&
              profileData['financial_data']['payback']
            "
          >
            <p class="proSumHead">Proposal Summary</p>
            <div class="flexContPS">
              <p class="txtPS">Lifetime Savings</p>
              <p class="txtPS boldPS">
                {{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(
                    dataFromAPI.financial_data &&
                      dataFromAPI.financial_data.total_savings
                  )
                }}
              </p>
            </div>
            <div class="flexContPS">
              <p class="txtPS">Payback Period</p>
              <p class="txtPS boldPS">
                {{
                  dataFromAPI.financial_data &&
                  dataFromAPI.financial_data.payback &&
                  dataFromAPI.financial_data.payback.years
                }}
                <span
                  v-if="
                    dataFromAPI.financial_data &&
                    dataFromAPI.financial_data.payback &&
                    dataFromAPI.financial_data.payback.years &&
                    dataFromAPI.financial_data.payback.years > 1
                  "
                  >yrs.</span
                >
                <span v-else> yr. </span>

                {{
                  dataFromAPI.financial_data &&
                  dataFromAPI.financial_data.payback &&
                  dataFromAPI.financial_data.payback.months
                }}
                <span
                  v-if="
                    dataFromAPI.financial_data &&
                    dataFromAPI.financial_data.payback &&
                    dataFromAPI.financial_data.payback.months &&
                    dataFromAPI.financial_data.payback.months > 1
                  "
                  >mons.</span
                >
                <span v-else>mon.</span>
              </p>
            </div>
            <div class="flexContPS">
              <p class="txtPS">Total Incentive</p>
              <p class="txtPS boldPS">
                -{{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(dataFromAPI.total_insentive)
                }}
              </p>
            </div>
            <hr class="hrPS" />
            <div class="flexContPS">
              <p class="txtPS boldPS">Total Cost</p>
              <p class="txtPS boldPS">
                {{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(dataFromAPI.total_cost_after_incentive)
                }}
              </p>
            </div>
            <div v-if="$router.currentRoute.name === 'documentProposalRef'">
              <el-button
                v-if="proposalState == 'PENDING'"
                type="primary"
                class="aAndSBtn"
                @click="isAcceptAndSignPopupVisible = true"
                >Accept & Sign</el-button
              >
              <el-button
                v-if="proposalState == 'ACCEPTED'"
                type="success"
                class="aAndSBtn"
                @click="isAcceptAndSignPopupVisible = true"
                >Accepted</el-button
              >
            </div>
            <div v-if="$router.currentRoute.name === 'documentProposalRef'">
              <el-button
                v-if="proposalState == 'PENDING'"
                type="default"
                class="aAndSBtn"
                @click="rejectProposalPopupVisible = true"
                >Reject</el-button
              >
              <el-button
                v-if="proposalState == 'REJECTED'"
                type="danger"
                class="aAndSBtn1"
                >Rejected</el-button
              >
            </div>
          </div>
          <div v-else>
            <div v-if="$router.currentRoute.name === 'documentProposalRef'">
              <el-button
                v-if="proposalState == 'PENDING'"
                type="primary"
                class="aAndSBtn"
                @click="isAcceptAndSignPopupVisible = true"
                >Accept & Sign</el-button
              >
              <el-button
                v-if="proposalState == 'ACCEPTED'"
                type="success"
                class="aAndSBtn"
                @click="isAcceptAndSignPopupVisible = true"
                >Accepted</el-button
              >
            </div>
            <div v-if="$router.currentRoute.name === 'documentProposalRef'">
              <el-button
                v-if="proposalState == 'PENDING'"
                type="default"
                class="aAndSBtn"
                @click="rejectProposalPopupVisible = true"
                >Reject</el-button
              >
              <el-button
                v-if="proposalState == 'REJECTED'"
                type="danger"
                class="aAndSBtn1"
                >Rejected</el-button
              >
            </div>
          </div>
          <el-button
            type="primary"
            class="solarFinBtn aAndSBtn"
            @click="isUserDetailsPopupVisible = true"
            v-if="dataFromAPI.country.country_code == 'IN'"
            >Get Solar Financing</el-button
          >
          <div
            class="lowBtnCont"
            @click="isModifyProposalPopupVisible = true"
            v-if="
              !checkURL &&
              profileData['report_defaults']['template_name'] !=
                'report_gazebo' &&
              profileData['report_defaults']['template_name'] != 'tata_power'
            "
          >
            <p class="lowBtn">Modify Proposal</p>
          </div>
          <div
            class="lowBtnCont"
            @click="isShareAndDownloadPopupVisible = true"
            v-if="!checkURL"
          >
            <p class="lowBtn">Download & Share</p>
          </div>
        </div>
      </div>
      <div id="app">
        <report-usa
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'solar_labs_usa'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :key="componentKey4"
          :dataFromAPI="dataFromAPI"
          :isPuppeteer="isPuppeteer"
          :batteryBackupOnStorageText="batteryBackupOnStorageText"
          :batteryBackupOnStorageAndSolarText="
            batteryBackupOnStorageAndSolarText
          "
          :batteryBackupOnStorageAndLoadText="batteryBackupOnStorageAndLoadText"
          :isBatteryAvailable="isBatteryAvailable"
        />

        <report-two
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'solar_labs_2'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :dataFromAPI="dataFromAPI"
          :updatedData="updatedData"
          :key="componentKey2"
          :isPuppeteer="isPuppeteer"
          :batteryBackupOnStorageText="batteryBackupOnStorageText"
          :batteryBackupOnStorageAndSolarText="
            batteryBackupOnStorageAndSolarText
          "
          :batteryBackupOnStorageAndLoadText="batteryBackupOnStorageAndLoadText"
          :isBatteryAvailable="isBatteryAvailable"
        />
        <report-three
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'solar_labs_3'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :dataFromAPI="dataFromAPI"
          :updatedData="updatedData"
          :key="componentKey3"
          :isPuppeteer="isPuppeteer"
          :batteryBackupOnStorageText="batteryBackupOnStorageText"
          :batteryBackupOnStorageAndSolarText="
            batteryBackupOnStorageAndSolarText
          "
          :batteryBackupOnStorageAndLoadText="batteryBackupOnStorageAndLoadText"
          :isBatteryAvailable="isBatteryAvailable"
        />
        <report-default
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'solar_labs'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :dataFromAPI="dataFromAPI"
          :updatedData="updatedData"
          :key="componentKey1"
          :isPuppeteer="isPuppeteer"
          :batteryBackupOnStorageText="batteryBackupOnStorageText"
          :batteryBackupOnStorageAndSolarText="
            batteryBackupOnStorageAndSolarText
          "
          :batteryBackupOnStorageAndLoadText="batteryBackupOnStorageAndLoadText"
          :isBatteryAvailable="isBatteryAvailable"
        />

        <report-gazebo
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'report_gazebo'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :dataFromAPI="dataFromAPI"
          :updatedData="updatedData"
          :key="componentKey1"
          :isPuppeteer="isPuppeteer"
        />
        <report-tata
          v-if="
            profileData['report_defaults'] &&
            profileData['report_defaults']['template_name'] == 'tata_power'
          "
          :pages="pages"
          :pagesNew="pagesNew"
          :dataFromAPI="dataFromAPI"
          :updatedData="updatedData"
          :key="componentKey1"
          :isPuppeteer="isPuppeteer"
        />
        <UserDetailsPopup
          v-if="isUserDetailsPopupVisible"
          :designId="dataFromAPI.design_id"
          :isUserDetailsPopupVisible.sync="isUserDetailsPopupVisible"
        />
      </div>
    </div>
  </div>
</template>

<script>
import reportUsa from "./reportUSA/reportUSA.vue";
import reportDefault from "./reportDefault/reportDefault.vue";
import reportTwo from "./reportTwo/reportTwo.vue";
import reportThree from "./reportThree/reportThree.vue";
import reportGazebo from "./reportGazebo/reportGazebo.vue";
import reportTata from "./reportTata/reportTata.vue";
import AcceptAndSignPopup from "./acceptAndSignPopup.vue";
import rejectProposalPopup from "./rejectProposalPopup.vue";
import ModifyProposalPopup from "./modifyProposalPopup.vue";
import ModifyProposalNonUSPopup from "./modifyProposalNonUSPopup.vue";
import ShareAndDownloadPopup from "./shareAndDownloadPopup.vue";
import systemPricing from "./systemPricing.vue";
// import testAPIResponse from "@/services/api/testAPIResponse.json";
import API from "@/services/api";
import {
  BASE_URL_FOR_REPORT_IMAGES,
  STAGE_REPORT_LAMBDA_ENDPOINT,
} from "../../constants";
import currencySymbolNameMap from "../currency-symbol-name-map";
import { formatNumberWithCommas } from "@/utils.js";
import { addImagesLoadedFlag } from "@/pages/utils/utils.js";
import { modifyBackupTime } from "./../../pages/design/components/js/utils";
import UserDetailsPopup from "./userDetailsPopup.vue";

export default {
  name: "documentProposal",

  data() {
    return {
      reportTwoKey: 0,
      pagesNew: [
        "user-note",
        "company-overview",
        "our-team",
        "system-layout",
        "system-details",
        "estimated-annual-production",
        "estimated-monthly-savings",
        "shadow-analysis",
        "pv-as-an-asset",
        "cost-of-not-going-solar",
        "warranties",
        "summary-and-approvals",
        "installation-roadmap",
        "frequently-asked-questions",
        "additional-information",
        "battery-storage",
      ],
      pages: [
        "title",
        "user-note",
        "company-overview",
        "our-team",
        "system-layout",
        "system-details",
        "estimated-annual-production",
        "estimated-monthly-savings",
        "shadow-analysis",
        "pv-as-an-asset",
        "cost-of-not-going-solar",
        "warranties",
        "summary-and-approvals",
        "installation-roadmap",
        "frequently-asked-questions",
        "additional-information",
        "thank-you",
        "battery-storage",
      ],

      referenceId: this.$route.params.referenceId,
      token: this.$route.params.token,
      designVersionSettingsData: null,
      isAcceptAndSignPopupVisible: false,
      rejectProposalPopupVisible: false,
      isModifyProposalPopupVisible: false,
      isShareAndDownloadPopupVisible: false,
      documentProposalPageUrl: window.location.href,
      dataFromAPI: [],
      isLoading: false,
      designId: this.$route.params.designId,
      profileData: "",
      updatedData: {},
      proposalData: {},
      proposalState: "PENDING",
      designVersion: null,
      componentKey1: 0,
      componentKey2: 0,
      componentKey3: 0,
      componentKey4: 0,
      resp1: null,
      resp2: null,
      resp3: null,
      resp4: null,
      imagesAvailable: false,
      imageLoadFailed: false,
      isUserDetailsPopupVisible: false,
    };
  },

  components: {
    AcceptAndSignPopup,
    ModifyProposalPopup,
    ModifyProposalNonUSPopup,
    ShareAndDownloadPopup,
    reportUsa,
    reportTwo,
    reportDefault,
    reportThree,
    reportGazebo,
    reportTata,
    UserDetailsPopup,
    rejectProposalPopup,
    systemPricing,
  },

  computed: {
    batteryBackupOnStorageText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage
      );
    },

    batteryBackupOnStorageAndSolarText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage_and_solar
      );
    },

    batteryBackupOnStorageAndLoadText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage_and_load
      );
    },

    isBatteryAvailable() {
      return this.dataFromAPI.battery_data.batteries.length;
    },

    isPuppeteer() {
      return this.$route.name === "documentProposalPuppeteer";
    },
    checkURL() {
      return this.documentProposalPageUrl.includes(this.referenceId);
    },

    //   finalCost() {
    //     let totalCost = 0;
    //     let dcSize = 0;

    //     if(this.dataFromAPI.system_metrics["Module DC Nameplate"]){
    //        dcSize = parseFloat(this.dataFromAPI.system_metrics["Module DC Nameplate"].split(" ")[0]);
    //     }

    //     if (this.dataFromAPI.financial_data.price_per_kw) {
    //       totalCost  = Math.round(
    //         parseFloat(this.dataFromAPI.financial_data.price_per_kw) * dcSize * 1000) / 1000;
    //       } else if(this.dataFromAPI.financial_data.price_per_watt){
    //         totalCost = Math.round( parseFloat(this.dataFromAPI.financial_data.price_per_watt) * dcSize * 1000 * 1000 ) / 1000;
    //       }else if(this.dataFromAPI.financial_data.absolute_price){
    //        totalCost =Math.round(parseFloat(this.dataFromAPI.financial_data.absolute_price.replace(/,/g,"")) * 1000)/ 1000;
    //       }
    //       else{
    //         totalCost = 0;
    //       }

    //       if(this.dataFromAPI.financial_data.tax){
    //         totalCost += totalCost * this.dataFromAPI.financial_data.tax / 100;
    //       }
    //       // if (this.maintenanceCostUnit == "relative" &&  this.financingDetailsForm.maintenance_cost){
    //       //   this.maintenance_cost = this.financingDetailsForm.maintenance_cost * this.summary.nameplateDcSize;
    //       // }
    //       // else{
    //       //   this.maintenance_cost = this.financingDetailsForm.maintenance_cost;
    //       // }

    //       // if(!this.maintenance_cost){
    //       //   this.maintenance_cost = 0;
    //       // }

    //       // var totalMaintenanceCost = this.maintenance_cost * this.financingDetailsForm.expected_life_years;
    //       // console.log(totalMaintenanceCost);
    //       // this.finalCost= this.finalCost + totalMaintenanceCost;
    //       // console.log("total cost after adding maintainence", this.finalCost);

    //       // if(this.financingDetailsForm.subsidyUnit == "relative"){
    //       //   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_percentage_value/100;
    //       // }
    //       // else if(this.financingDetailsForm.subsidy_amount_value){
    //       //   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_amount_value;
    //       // }

    //       // console.log("Cost after subsidy",this.finalCost);
    //       // if (this.financingDetailsForm.o_and_m_cost  && this.financingDetailsForm.system_lifetime){
    //       //   this.finalCost += this.financingDetailsForm.o_and_m_cost * this.financingDetailsForm.system_lifetime
    //       // }

    //       // if (this.financingDetailsForm.system_lifetime && this.financingDetailsForm.equipment_lifetime){
    //       // let frequency = (this.financingDetailsForm.system_lifetime - 1) / this.financingDetailsForm.equipment_lifetime
    //       //   if (this.financingDetailsForm.equipment_replacement_cost){
    //       //     this.finalCostt += frequency * this.financingDetailsForm.equipment_replacement_cost;
    //       //   }
    //       // }

    //       // console.log(this.finalCost);
    //       return totalCost.toFixed(2);
    // },

    referenceIdUrl() {
      let referenceUrl = `${BASE_URL_FOR_REPORT_IMAGES}documentProposalRef/${this.referenceId}/`;
      return referenceUrl;
    },
    systemCapacity() {
      return this.dataFromAPI.system_metrics["Module DC Nameplate"];
    },
    projectCreator() {
      return this.dataFromAPI.project_head.project_creator_name;
    },
    faqData() {
      return this.dataFromAPI.frequently_asked_questions;
    },
    flagForUS() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    // costAfterIncentive(){
    //   return parseFloat(this.finalCost - parseFloat(this.dataFromAPI.total_insentive.replace(',',''))).toFixed(2);
    // }
  },
  async created() {
    this.isLoading = true;
    this.testAPI();
    if (this.$route.params.referenceId != undefined) {
      await this.getProposalData();
    }
    if (!this.referenceId) await this.getDesignDetails();

    if (this.isPuppeteer) {
      window.documentProposalLoaded = false;
      API.SET_TOKEN_HEADER(this.token);
    }
  },
  nonReactiveData() {
    return {
      currencySymbolNameMap,
    };
  },

  methods: {
    convertedWithComas(value) {
      return formatNumberWithCommas(value, this.dataFromAPI.country.id === 91);
    },
    acceptedDocumentSignSubmit() {
      this.getProposalData();
    },
    isDocumentRejected() {
      this.getProposalData();
    },

    refreshShadowImages(data) {
      if (data.startDateChange) {
        this.dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image =
          null;
        this.dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image =
          null;
      }
      if (data.endDateChange) {
        this.dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image =
          null;
        this.dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image =
          null;
      }

      let shadowImageUrlPromises = this.fetchImageUrls();
      this.checkForImageLoad(shadowImageUrlPromises);
    },
    async testAPI() {
      try {
        let response;
        if (this.$route.name == "documentProposal") {
          response = await API.DESIGNS.FETCH_WEB_PROPOSAL_DATA(this.designId);
          this.referenceId = response.data.reference_id;
        } else if (
          this.$route.name == "documentProposalRef" ||
          this.$route.name == "documentProposalPuppeteer"
        ) {
          response = await API.DESIGNS.FETCH_WEB_PROPOSAL_DATA_BY_REFRENCE_ID(
            this.referenceId
          );
        }

        this.dataFromAPI = response.data;

        if (this.isPuppeteer) window.documentProposalLoaded = true;

        // Loading Report Image URLs
        let imageUrlPromises = this.fetchImageUrls();

        this.profileData = response.data;
        this.profileData["report_defaults"] =
          this.profileData["report_defaults_data"];
        this.updatedData = response.data.report_defaults;
        console.log("eventToFetchCheckedPages");
        this.pagesNew = this.profileData["report_defaults"]["pages"];
        this.isLoading = false;

        this.checkForImageLoad(imageUrlPromises);
      } catch (error) {
        console.error(error);
        this.$message({
          showClose: true,
          message: "Failed to fetch details. Try Again!",
          type: "error",
          center: true,
        });
      }
    },

    async getDesignDetails() {
      if (this.referenceId) return;
      const response = await API.DESIGNS.FETCH_DESIGN(this.designId);
      this.referenceId = response.data.versions.reference_id;
      this.designVersionSettingsData = response.data.versions.setting;
      this.updatedData = response.data.versions.setting.report_defaults;
      if (this.referenceId) {
        this.getProposalData();
      }
    },

    async getProposalData() {
      try {
        const response2 = await API.PROPOSAL_INFO.GET_PROPOSAL_DETAILS(
          this.referenceId
        );
        this.proposalData = response2.data;
        this.proposalState = response2.data.state;
        this.designVersion = response2.data.design_version;
        const postData = {
          design_version: this.referenceId,
        };
        if (this.designVersion == null) {
          this.createProposal(postData);
        }
      } catch (e) {
        console.log(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while fetching proposal details",
          type: "error",
          center: true,
        });
      }
    },
    async createProposal(postData) {
      try {
        const response = await API.PROPOSAL_INFO.CREATE_PROPOSAL(postData);
        this.proposalData = response.data;
      } catch (e) {
        console.log(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while creating proposal",
          type: "error",
          center: true,
        });
      }
    },

    eventToFetchCheckedPages(data, reportDefaultsJson) {
      console.log("eventToFetchCheckedPages");
      this.pagesNew = data;
      this.profileData["report_defaults"]["template_name"] =
        reportDefaultsJson["template_name"];
      this.profileData["report_defaults"]["report_type"] =
        reportDefaultsJson["report_type"];
      this.updatedData = reportDefaultsJson;
      if (reportDefaultsJson["template_name"] === "solar_labs") {
        this.componentKey1++;
      } else if (reportDefaultsJson["template_name"] === "solar_labs_2") {
        this.componentKey2++;
      }
      if (reportDefaultsJson["template_name"] === "solar_labs_3") {
        this.componentKey3++;
      }
      if (reportDefaultsJson["template_name"] === "solar_labs_usa") {
        this.componentKey4++;
      }
    },

    // For puppeteer to capture the pdf only after all the images are loaded
    // And also for the download button to get activated after all the images have been loaded
    checkForImageLoad(imageUrlPromises) {
      Promise.all(imageUrlPromises)
        .then(async () => {
          let imgUrls = [
            this.dataFromAPI.detailed_layout,
            this.dataFromAPI.heat_map,
            this.dataFromAPI.solar_access_image,
          ];
          if (this.dataFromAPI.shadow_analysis_images) {
            imgUrls = [
              ...imgUrls,
              ...Object.values(this.dataFromAPI.shadow_analysis_images),
            ];
          }
          await addImagesLoadedFlag(imgUrls);
          this.imagesAvailable = true;
        })
        .catch((err) => {
          console.error("Stage Report image fetch failed");
          console.error(err);
          this.imageLoadFailed = true;
        });
    },

    // This function requires cleanup
    fetchImageUrls() {
      let self = this;
      this.imagesAvailable = false;
      let keysList = [
        {
          stageLambdaKey: "detailed_layout",
          stageBackendKey: "layout",
          cacheKey: "layoutImageUrl",
          page: "title",
        },
        {
          stageLambdaKey: "heat_map",
          stageBackendKey: "heatmap",
          cacheKey: "heatMapImageUrl",
          page: "heat-map",
        },
        {
          stageLambdaKey: "solar_access_image",
          stageBackendKey: "solar_access",
          cacheKey: "solarAccessImageUrl",
          page: "heat-map",
        },
      ];
      let shadowKeysList = [
        {
          stageLambdaKey: "shadow_summer_start_time_image",
          stageBackendKey: "shadow_analysis",
          cacheKey: "startTimeSummerShadowImageUrl",
          page: "shadow-analysis",
        },
        {
          stageLambdaKey: "shadow_summer_end_time_image",
          stageBackendKey: "shadow_analysis",
          cacheKey: "endTimeSummerShadowImageUrl",
          page: "shadow-analysis",
        },
        {
          stageLambdaKey: "shadow_winter_start_time_image",
          stageBackendKey: "shadow_analysis",
          cacheKey: "startTimeWinterShadowImageUrl",
          page: "shadow-analysis",
        },
        {
          stageLambdaKey: "shadow_winter_end_time_image",
          stageBackendKey: "shadow_analysis",
          cacheKey: "endTimeWinterShadowImageUrl",
          page: "shadow-analysis",
        },
      ];
      this.dataFromAPI.shadow_analysis_images =
        this.dataFromAPI.shadow_analysis_images || {};
      let pagesList = this.dataFromAPI.report_defaults_data.pages;

      function addImageUrlToApiData(dict, data) {
        if (dict.page == "shadow-analysis") {
          self.dataFromAPI.shadow_analysis_images[dict.stageLambdaKey] =
            data[dict.stageLambdaKey];
        } else {
          self.dataFromAPI[dict.stageLambdaKey] = data[dict.stageLambdaKey];
        }
      }

      let imageUrlPromises = [];
      let cachePayload = {};

      // Set flag to true if you want to reduce the number of lambda requests
      let combineShadowImages = false;

      let lambdaRequestCount = 0;
      if (combineShadowImages) {
        // Fetch all required shadow images first in a single request
        if (pagesList.includes("shadow-analysis")) {
          let shadowsPayload = {
            base_url: BASE_URL_FOR_REPORT_IMAGES,
            reference_id: this.referenceId,
          };
          let requiredShadowKeys = shadowKeysList.filter((dict) => {
            let val =
              this.dataFromAPI.shadow_analysis_images[dict.stageLambdaKey];
            if (!val) {
              shadowsPayload[dict.stageLambdaKey] = true;
              return true;
            }
          });

          if (requiredShadowKeys.length) {
            let prom = fetch(STAGE_REPORT_LAMBDA_ENDPOINT, {
              method: "POST",
              body: JSON.stringify(shadowsPayload),
            }).then(async (resp) => {
              let data = await resp.json();
              requiredShadowKeys.forEach((dict) => {
                addImageUrlToApiData(dict, data);
                cachePayload[dict.cacheKey] = data[dict.stageLambdaKey];
              });
            });
            imageUrlPromises.push(prom);
            lambdaRequestCount++;
          }
        }
      } else {
        keysList = shadowKeysList.concat(keysList);
      }

      keysList.forEach((dict) => {
        let val;
        if (dict.page == "shadow-analysis") {
          val = this.dataFromAPI.shadow_analysis_images[dict.stageLambdaKey];
        } else {
          val = this.dataFromAPI[dict.stageLambdaKey];
        }
        if (val) {
          return;
        }

        let payload = {
          base_url: BASE_URL_FOR_REPORT_IMAGES,
        };

        let prom;
        // Splitting some requests to lambda and some to backend because
        // it is not possible to have more than 6 concurrent HTTP 1.1 requests to Lambda
        if (lambdaRequestCount < 6) {
          payload[dict.stageLambdaKey] = true;
          payload.reference_id = this.referenceId;

          prom = fetch(STAGE_REPORT_LAMBDA_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(payload),
          }).then(async (resp) => {
            let data = await resp.json();
            addImageUrlToApiData(dict, data);
            cachePayload[dict.cacheKey] = data[dict.stageLambdaKey];
          });
          lambdaRequestCount++;
        } else {
          payload[dict.stageBackendKey] = true;

          prom = API.DESIGN_VERSIONS.FETCH_IMAGES_FOR_REPORT(
            this.referenceId,
            payload
          ).then((resp) => {
            let data = resp.data;
            addImageUrlToApiData(dict, data);
          });
        }
        imageUrlPromises.push(prom);
      });

      console.time("Image URL Load Time");
      Promise.all(imageUrlPromises).then(() => {
        console.timeEnd("Image URL Load Time");

        // If there are any images to be cached, send request to cache them
        if (Object.keys(cachePayload).length) {
          API.DESIGN_VERSIONS.CACHE_REPORT_IMAGES(
            this.referenceId,
            cachePayload
          );
        }
      });

      return imageUrlPromises;
    },
  },
};
</script>

<style scoped>
::v-deep .table_section table thead tr:first-child th:last-child,
::v-deep .table_section table tbody tr:last-child td:last-child,
::v-deep .table_section table tbody tr:last-child td:first-child,
::v-deep .table_section table thead tr:first-child th:first-child {
  border-radius: 0;
}

/* To remove element with class chartjs-size-monitor in report components which caused  1000+ pages in reports */
@media print {
  ::v-deep .chartjs-size-monitor {
    display: none;
  }
}

.parentContainer {
  background-color: #f0f3f8;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  padding: 50px 24px 24px 24px;
  gap: 80px;
  min-height: 100vh;
}

.cardContainer {
  width: 350px;
  position: sticky;
  top: 0px;
}

.cardPS {
  width: 100%;
  padding: 15px 15px 24px 15px;
  border-radius: 4px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f3f8;
  background-color: #fff;
}

.proSumHead {
  font-size: 16px;
  font-weight: normal;
  color: #777;
  margin-bottom: 16px;
}

.flexContPS {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.txtPS {
  font-size: 16px;
  font-weight: normal;
  color: #263342;
}

.boldPS {
  font-weight: 600;
}

.hrPS {
  margin: 16px auto;
  color: #ccc;
}

.aAndSBtn {
  width: 100%;
  margin-top: 16px;
  font-size: 20px;
  font-weight: bold;
  height: 48px;
}
.aAndSBtn1 {
  width: 100%;
  margin-top: 16px;
  font-size: 20px;
  font-weight: bold;
  height: 48px;
  cursor: not-allowed;
}

.solarFinBtn {
  height: 48px;
  margin-top: 24px;
}

.lowBtnCont {
  border-radius: 4px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #777;
  background-color: #fff;
  margin-top: 24px;
  text-align: center;
  padding: 14px 0px;
  cursor: pointer;
}

.lowBtn {
  font-size: 20px;
  font-weight: bold;
  color: #777;
}
.parentContainerPuppeteer {
  padding: 0px;
}

@media (max-width: 1064px) {
  .parentContainer {
    gap: 30px;
  }
}

@media (max-width: 1300px) {
  .parentContainer {
    flex-direction: column-reverse;
    gap: 0;
  }

  .cardContainer {
    width: 595px;
    margin: auto;
  }
}

@media (max-width: 1300px) {
  .cardContainer {
    width: 100%;
    max-width: 600px;
  }

  .parentContainer {
    padding: 24px 16px;
  }

  .parentContainerPuppeteer {
    padding: 0px;
  }

  body {
    font-size: 50%;
  }

  .potrait_screen {
    width: 100%;
    overflow: hidden;
  }
}
</style>
