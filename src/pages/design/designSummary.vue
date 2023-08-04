<template>
  <div class="main-controller">
    <div class="disabled-overlay" v-if="false"></div>
    <section class="main-controller right_section">
      <div class="content_section">
        <div class="project_summary">
          <router-link :to="{ name: 'projectListViewHome' }" class="backLink">
            Projects /
          </router-link>
          <router-link :to="'/projectSummary/' + projectId" class="backLink">
            Project Summary /
          </router-link>
          <router-link
            :to="{ name: 'designSummary', params: { designId } }"
            class="backLink active"
          >
            Design Summary
          </router-link>
          <div class="flexContDes">
            <designNameActionsNew />
            <div class="flexContDesBtn">
              <el-tooltip
                :disabled="!isWebProposalDisabled"
                effect="dark"
                placement="top-start"
                :content="tooltipMessageForPropoal"
                v-if="!isItTataOrganisation"
              >
                <span>
                  <button
                    class="webProBtn"
                    @click="openWebProposalPage()"
                    :disabled="isWebProposalDisabled"
                  >
                    Web Proposal
                    <img :src="webProposalButtonImageURL" class="arrowDes" />
                  </button>
                </span>
              </el-tooltip>

              <el-tooltip
                :disabled="!isDocumentProposalDisabled"
                effect="dark"
                placement="top-start"
                :content="tooltipMessageForPropoal"
              >
                <span>
                  <button
                    class="docProBtn"
                    @click="openDocProposalPage()"
                    :disabled="isDocumentProposalDisabled"
                  >
                    Document Proposal
                    <img
                      :src="documentProposalButtonImageURL"
                      class="arrowDes"
                    />
                  </button>
                </span>
              </el-tooltip>
            </div>
          </div>
          <!-- <designNameActionsNew /> -->
          <div class="project_information">
            <div class="flexContOne">
              <div class="col_row">
                <DesignInformation />
              </div>
              <div class="card" v-if="monthlyAc.length > 0">
                <div class="card_header">
                  <h4>Generation Analysis</h4>
                </div>
                <div class="card_content">
                  <div class="col_row">
                    <div class="col">
                      <div class="info_item">
                        <div class="label">Total Generation</div>
                        <div class="value">
                          {{ totalGenerationInMWh.toFixed(2) }} MWh
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="graph_area">
                    <generationChart :monthlyGeneration="monthlyAc" />
                  </div>
                </div>
              </div>

              <div
                class="card"
                v-if="showAdditionalNotesCard"
                :class="{ disable_design: isDesignDisabled(order_status) }"
              >
                <div class="card_header">
                  <h4>Additional Notes</h4>
                  <button class="btnEdit" @click="openEditForm()">
                    <span class="icon edit-alt"></span>
                  </button>
                </div>
                <div class="card_content">
                  <div class="codeContainer" v-if="isUS">
                    <h4 class="codeHeading">Local Jurisdiction Codes</h4>
                    <p class="codeValue">
                      {{
                        this.additional_notes === null
                          ? "-"
                          : this.additional_notes.local_code === null
                          ? "-"
                          : this.additional_notes.local_code
                      }}
                    </p>
                  </div>
                  <div class="reqContainer">
                    <h3 class="reqHeading">Project Requirements</h3>
                    <p class="reqValue" style="white-space: pre-line">
                      {{
                        this.additional_notes === null
                          ? "-"
                          : this.additional_notes.Project_Requirements === null
                          ? "-"
                          : this.additional_notes.Project_Requirements
                      }}
                    </p>
                  </div>
                  <div class="contactContainer">
                    <h3 class="quariesHead">Contact for any queries</h3>
                    <div class="gridContainer">
                      <div class="pNoContainer">
                        <h3 class="phoneNoHead">Phone Number</h3>
                        <h3 class="phoneNo">
                          {{
                            this.additional_notes === null
                              ? "-"
                              : this.additional_notes.phone_number === null
                              ? "-"
                              : this.additional_notes.phone_number
                          }}
                        </h3>
                      </div>
                      <div class="emailContainer">
                        <h3 class="emailHead">Email Address</h3>
                        <h3 class="emailAddress">
                          {{
                            this.additional_notes === null
                              ? "-"
                              : this.additional_notes.email_address === null
                              ? "-"
                              : this.additional_notes.email_address
                          }}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <RequestRevisionCard
                v-if="revisionNotes && isExpertService"
                :class="{
                  disable_design:
                    orderStatusDict[order_status] === 'Cancelled' ||
                    orderStatusDict[order_status] === 'Rejected',
                }"
              />
              <div class="card" v-if="Object.keys(lossData).length > 0">
                <div class="card_header">
                  <h4>Loss Analysis</h4>
                </div>
                <div class="card_content">
                  <div class="graph_area">
                    <lossBarChart
                      class="lossBarChart"
                      :lossData="convertLossDataFromJsonToGraphFormat(lossData)"
                    />
                  </div>
                </div>
              </div>

              <DesignBOM
                :class="{ disable_design: isDesignDisabled(order_status) }"
                :orderStatus="order_status"
              />

              <storageCard
                :class="{ disable_design: isDesignDisabled(order_status) }"
                :designId="designId"
              />
              <!-- {{order_status}} -->
              <DesignFinancial
                :class="{ disable_design: isDesignDisabled(order_status) }"
                :reportTemplate="profileData.report_defaults.template_name"
                @isFormValid="isFormValid"
              />
              <DesignIncentives
                :designId="designId"
                :adminMode="adminMode"
                :class="{ disable_design: isDesignDisabled(order_status) }"
              />
              <div class="card">
                <div class="card_header">
                  <h4>Adders and Discounts</h4>
                </div>
                <div class="adderTable-container">
                  <AdderTable :designId="designId" :systemCost="systemCost" @systemTotalCost="systemTotalCost"
                   />
                </div>
              </div>
              <designSiteForm
                v-if="
                  this.request_expert_service &&
                  (this.request_expert_service.service_type ===
                    'Permit Package' ||
                    this.request_expert_service.service_type === 'PV Design')
                "
                :siteSurveyPath="siteSurveyPath"
                :class="{ disable_design: isDesignDisabled(order_status) }"
              />
              <additionalNotesPopup
                v-if="request_object_id_from_ds"
                :isadditionalNotesPopupVisible.sync="
                  isadditionalNotesPopupVisible
                "
                :additionalNotes.sync="additional_notes"
                :isEdited="isEdited"
                :request_object_id_from_ds="request_object_id_from_ds"
              />
            </div>
            <div
              class="flexContTwo"
              :class="{ disable_design: isDesignDisabled(order_status) }"
            >
              <div class="col design_col design_outer">
                <div class="design_card">
                  <figure>
                    <img :src="designImageUrl" />
                    <el-tooltip
                      effect="dark"
                      placement="top-start"
                      content="Edit Design in Studio"
                    >
                      <button class="btn btn-primary" @click="leadToStudio">
                        <span v-if="isLoading">
                          <i class="el-icon-loading"></i> Loading...
                        </span>
                        <span v-else> Edit Design </span>
                      </button>
                    </el-tooltip>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import homeRedirectionMixin from "@/pages/homeRedirectionMixin";
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../stores/design";
import lossAnalysis from "./components/lossGraph/lossAnalysis.vue";
// import designGeneration from "./components/generation/generation.vue";
// import generationChart from "./components/generation/generationChart.vue";
import generationChart from "./components/generation/generationChartNew.vue";
import lossBarChart from "@/components/ui/lossAnalysisChart.vue";
import designNameActionsNew from "./components/designNameActions/designNameActionsNew.vue";
import DesignInformation from "./components/designInformation.vue";
import DesignBOM from "./components/designBOM_new.vue";
import DesignFinancial from "./components/designFinancial/designFinancial_new.vue";
import DesignIncentives from "./components/dsIncentives/designIncentive.vue";
import designSiteForm from "@/pages/dashboard/components/designSiteForm.vue";
import additionalNotesPopup from "@/pages/dashboard/components/additionalNotesPopup.vue";
import API from "@/services/api/";
import RequestRevisionCard from "./components/requestRevisionCard.vue";
import storageCard from "./components/storageCard.vue";
import {
  convertLossDataFromJsonToGraphFormat,
  isTataOrg,
  orderStatusDict,
} from "@/utils.js";
import AdderTable from "../../components/adderTable/index.vue";

export default {
  name: "DesignSummary",
  data() {
    return {
      isLoading: false,
      systemCost:false,
      msg: "I am in design",
      isfinancialDetailsFormVisible: false,
      isadditionalNotesPopupVisible: false,
      isEdited: false,
      designId: this.$route.params.designId,
      adminMode: true,
      siteSurveyPath: "",
      additional_notes: {
        Project_Requirements: "-",
        // "contact_information": "-",
        local_code: "-",
        phone_number: "-",
        email_address: "-",
      },
      request_object_id_from_ds: null,
      isUS: false,
      orderStatusDict,
    };
  },
  components: {
    lossAnalysis,
    // designGeneration,
    generationChart,
    lossBarChart,
    designNameActionsNew,
    DesignInformation,
    DesignBOM,
    DesignFinancial,
    DesignIncentives,
    designSiteForm,
    additionalNotesPopup,
    RequestRevisionCard,
    storageCard,
    AdderTable,
  },
  mixins: [homeRedirectionMixin],
  computed: {
    ...mapState(useDesignStore, {
      designName: (state) => state.name,
      projectId: (state) => state.project.id,
      referenceId: (state) => state.versions.reference_id,
      is_exported_heaven_solar: (state) => state.is_exported_heaven_solar,
      request_expert_service: (state) => state.request_expert_service,
      order_status: (state) => state.request_expert_service.order_status,
      revisionNotes: (state) => state.request_expert_service.revision_notes,
      summary: "GET_DESIGN_INFORMATION",
      profileData: "GET_DESIGN_VERSION_SETTINGS",
      designImageUrl: "GET_DESIGN_IMAGE",
      monthlyAc: "GET_DESIGN_MONTHLY_AC_GENERATION",
      lossData: "GET_DESIGN_LOSS_DATA",
      ESInfo: "GET_EXPERT_SERVICE_INFO",
      financials: "GET_FINANCIAL_DATA",
      isExpertService: "isExpertService",
    }),
    totalGenerationInMWh() {
      return this.monthlyAc
        ? this.monthlyAc.reduce((a, b) => a + b, 0) / 1000
        : 0;
    },
    isItTataOrganisation() {
      return isTataOrg();
    },
    isWebProposalDisabled() {
      if (this.isDesignDisabled(this.order_status)) {
        return true;
      }

      return (
        this.summary.nameplateDcSize == 0 ||
        this.summary.acSize == 0 ||
        (this.financials.length > 0 && !this.financials[0].payback) ||
        this.financials.length == 0
      );
    },
    isDocumentProposalDisabled() {
      if (this.isDesignDisabled(this.order_status)) {
        return true;
      }

      let isDisabled =
        this.summary.nameplateDcSize == 0 || this.summary.acSize == 0;
      // For US and Gazebo reports, a lot of pages depend on payback period. Hence, there is a check for payback as well.
      if (
        this.isUS ||
        this.profileData.report_defaults.template_name == "report_gazebo" ||
        this.profileData.report_defaults.template_name == "tata_power"
      ) {
        isDisabled =
          isDisabled ||
          (this.financials.length > 0 && !this.financials[0].payback) ||
          this.financials.length == 0;
      }
      return isDisabled;
    },
    tooltipMessageForPropoal() {
      if (this.summary.nameplateDcSize == 0 || this.summary.acSize == 0)
        return "Add Inverters and Modules";
      else if (
        (this.financials.length > 0 && !this.financials[0].payback) ||
        this.financials.length == 0
      )
        return "Add Consumption and Pricing";
    },
    documentProposalButtonImageURL() {
      let normalUrl = new URL(
        "/src/assets/drop/box-arrow-up-right-white.svg",
        import.meta.url
      ).href;
      let greyUrl = new URL(
        "/src/assets/drop/box-arrow-up-right-grey.svg",
        import.meta.url
      ).href;
      return this.isDocumentProposalDisabled ? greyUrl : normalUrl;
    },
    webProposalButtonImageURL() {
      let normalUrl = new URL(
        "/src/assets/drop/box-arrow-up-right.svg",
        import.meta.url
      ).href;
      let greyUrl = new URL(
        "/src/assets/drop/box-arrow-up-right-grey.svg",
        import.meta.url
      ).href;
      return this.isWebProposalDisabled ? greyUrl : normalUrl;
    },
    showAdditionalNotesCard() {
      return this.isExpertService;
    },
  },
  created() {
    this.updateModes();
    if (this.ESInfo) {
      if (this.ESInfo.additional_info) {
        this.siteSurveyPath = this.ESInfo.additional_info.path;
      }
      if (this.ESInfo.additional_notes) {
        (this.additional_notes.Project_Requirements =
          this.ESInfo.additional_notes.Project_Requirements),
          (this.additional_notes.local_code =
            this.ESInfo.additional_notes.local_code),
          (this.additional_notes.phone_number =
            this.ESInfo.additional_notes.phone_number),
          (this.additional_notes.email_address =
            this.ESInfo.additional_notes.email_address),
          (this.request_object_id_from_ds = this.ESInfo.id);
      }
    }
    const user = JSON.parse(localStorage.getItem("user"));
    // TODO: isUS should be based on location of project, not based on org or user.
    if (user.isUSFlagEnabled) this.isUS = true;
    else this.isUS = false;
  },
  methods: {
    isFormValid(value){
      console.log(value)
      this.systemCost = value
    },
    systemTotalCost(){
      this.systemCost=false
    },
    convertLossDataFromJsonToGraphFormat,
    openDocProposalPage(designId) {
      console.log("open document proposal");
      let routeData = this.$router.resolve({
        name: "documentProposal",
        params: { designId: this.designId },
      });
      window.open(routeData.href, "_blank");
    },
    openWebProposalPage(designId) {
      console.log("open web proposal", this.referenceId);
      let routeData = this.$router.resolve({
        name: "webProposal",
        params: { designUUID: this.referenceId },
      });
      window.open(routeData.href, "_blank");
    },
    isDesignDisabled(status) {
      return this.isStatusCancelled(status) || this.isStatusRejected(status);
    },

    isStatusInprocess(status) {
      if (status == "in_process") return true;
      else return false;
    },
    isStatusComplete(status) {
      if (status == "complete") return true;
      else return false;
    },
    isStatusRejected(status) {
      if (status == "rejected") return true;
      else return false;
    },
    isStatusCancelled(status) {
      if (status == "cancelled") return true;
      else return false;
    },

    ...mapActions(useDesignStore, ["DELETE_DESIGN_FINANCIAL_DETAILS"]),

    deleteFinancialInstrument(index, rows) {
      this.DELETE_DESIGN_FINANCIAL_DETAILS(rows[index]["id"]);
    },
    openDesignFinancialForm() {
      this.isfinancialDetailsFormVisible = true;
    },
    changeHead() {
      return { padding: "3px 0" };
    },
    async updateModes() {
      const { organisation_id } = {
        ...JSON.parse(localStorage.getItem("user")),
      };
      // const res = await API.INCENTIVE_INFORMATION.GET_MODE(organisation_id);
      let responseData = JSON.parse(localStorage.getItem("organisation")) || {};
      if (!Object.keys(responseData).length) {
        responseData = (
          await API.INCENTIVE_INFORMATION.GET_MODE(organisation_id)
        ).data;
      }
      this.adminMode = responseData.allow_adding_updating_incentives;
    },

    async leadToStudio() {
      this.isLoading = true;
      try {
        // routing to studio
        this.$router.push({
          name: "studio",
          params: { designId: this.designId },
        });
      } catch (e) {
        console.error(e);
      }
    },
    openEditForm() {
      this.isadditionalNotesPopupVisible = !this.isadditionalNotesPopupVisible;
      this.isEdited = true;
    },

    async assignProjectDetail() {
      this.isProjectInfoLoading = true;
      console.log("project ID is", this.projectId);
      const projectInfo = await API.PROJECTS.FETCH_PROJECT(this.projectId);
      console.log("project info is", projectInfo);
      console.log(this.projectDetails);

      this.projectDetails.projectType = this.projectInformation.projectType =
        projectInfo.data.project_type == "residential"
          ? "Residential"
          : "Commercial";

      this.group_classification = projectInfo.data.group_classification;

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
      if (!this.projectDetails.projectType) {
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
  },
};
</script>
<style scoped>
.main-controller {
  position: relative;
}

.disabled-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(232, 237, 242, 0.5);
  z-index: 400;
}

.flexContDesBtn {
  display: flex;
  column-gap: 20px;
  flex-wrap: wrap;
  row-gap: 10px;
}

.flexContDes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.webProBtn {
  display: flex;
  align-items: center;
  font-size: 18px;
  border-radius: 4px;
  border: solid 1px #999;
  background-color: #e8edf2;
  height: 48px;
  color: #222;
  padding: 0px 16px;
  cursor: pointer;
}

.webProBtn:disabled {
  border: solid 1px #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.docProBtn {
  display: flex;
  align-items: center;
  border: none;
  color: #ffffff;
  font-size: 18px;
  height: 48px;
  padding: 0px 16px;
  margin-left: 0;
  border-radius: 4px;
  background-image: linear-gradient(to bottom, #409eff, #3092f7);
  cursor: pointer;
}

.docProBtn:disabled {
  background-image: linear-gradient(to bottom, #f1f1f1, #ddd);
  color: #ccc;
  cursor: not-allowed;
}

.arrowDes {
  width: 18px;
  margin-left: 12px;
}
.disable_design {
  opacity: 0.5;
  pointer-events: none;
}

.project_information {
  display: grid;
  grid-gap: 24px;
  grid-template-columns: 65% auto;
}

.backLink {
  color: #777777;
  font-size: 14px;
}
.backLink:hover {
  cursor: pointer;
  color: #1c3366;
}
.active {
  color: #1c3366;
}

.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover,
.el-button--primary.is-disabled:focus,
.el-button--primary.is-disabled:active {
  color: #ffffff;
  background-color: #a0cfff;
  border-color: #a0cfff;
  margin-left: 10px;
}

.card .card_header {
  height: 48px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card .card_header h4 {
  font-size: 16px;
  font-weight: 600 !important;
  color: var(--primary);
}

.btnEdit {
  border: none;
  background: linear-gradient(180deg, #e8edf2, #e9ecf2);
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
}
</style>

<style scoped>
.codeHeading,
.reqHeading,
.phoneNoHead,
.emailHead {
  font-size: 14px;
  font-weight: 500;
  color: #777;
  line-height: 1.7;
  word-break: break-word;
}

.codeValue,
.reqValue {
  font-size: 16px;
  font-weight: 100;
  line-height: 1.5;
  color: #222;
  word-break: break-word;
}

.quariesHead,
.phoneNo,
.emailAddress {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.7;
  color: #222;
  word-break: break-word;
}

.quariesHead {
  margin-bottom: 16px;
}

.gridContainer {
  display: grid;
  grid-template-columns: auto auto auto;
}

.codeContainer {
  margin-bottom: 24px;
}

.reqContainer {
  margin-bottom: 24px;
}

.project_summary .design_card figure .btn {
  height: 48px;
  font-size: 18px;
  font-weight: 600;
}

.lossBarChart {
  padding: 8px;
}
.adderTable-container {
  margin: 1rem;
}

@media (min-width: 768px) {
  .project_summary .design_col.design_outer {
    max-width: 100%;
    top: 124px;
    position: sticky;
  }
}

@media (max-width: 700px) {
  .project_information {
    display: flex;
    flex-direction: column-reverse;
    grid-gap: 0px;
    grid-template-columns: auto;
  }
}

@media (max-width: 450px) {
  .gridContainer {
    grid-template-columns: auto;
    grid-gap: 16px;
  }
}
</style>
