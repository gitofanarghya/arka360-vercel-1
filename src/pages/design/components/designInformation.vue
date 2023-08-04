<template>
  <div class="col info_col" v-loading.fullscreen="isLoading">
    <div
      class="card"
      :class="{ disable_design: isDesignDisabled(order_status) }"
    >
      <div
        :class="{
          card_header: !isOnLeadSummaryPage,
          flex_header: !isOnLeadSummaryPage,
          'incentive-header': isOnLeadSummaryPage,
        }"
      >
        <h4>Design Information</h4>
      </div>
      <div class="card_content"> 
        <div
        :class="{
          'flexContainer':!isOnLeadSummaryPage,
          'flexContainerCRM':isOnLeadSummaryPage
        }">
          
          <div v-if="isOnLeadSummaryPage" class="thumbnail-container">
            <img
              :src="designImageUrl"
              class="image"
            />
            <el-button
              type="primary"
              class="edit-design-button"
              v-if="showEditDesignButton"
              @click="goToStudio()"
              >Edit Design</el-button
            >
          </div>
          <div class="rightSideCard">
          <div class="headers" v-if="isOnLeadSummaryPage">
            <div class="flexBetween">
              <p class="designName">{{ designDataFull.name }}</p>
              <td class="incentive_actin_icons">
                <el-tooltip effect="dark" placement="top-start" content="Rename Design">
                  <i  
                       @click="isEditDesignNameDialogVisible = true"
                      class="icon edit-alt"
                  />
                </el-tooltip>
                <el-tooltip v-if="!requestObject?.id && isAccountSubscribed" effect="dark" placement="top-start" content="Copy Design">
                  <i 
                    @click="openPopupToDuplicate"
                    class="icon copy-alt" 
                  />
                </el-tooltip>
                <el-tooltip v-if="!requestObject?.id && isAccountSubscribed" effect="dark" placement="top-start" content="Delete Design">
                  <i
                    @click="isDeleteProjectPopupOpen=true"
                    class="icon delete-alt"
                  />
                </el-tooltip>
              </td>
            </div>
            <p class="info">
              Created by {{ `${designDataFull?.created_by?.first_name} ${designDataFull?.created_by?.last_name}` }} | Last modified on {{ `${convertDateFormat(designDataFull?.modified_at)}` }}
            </p>
          </div>
          <div class="gridContainer">
            <div class="info_item" v-if="ESInfo?.id">
              <div class="designInfoLabel">Status</div>
              <div
                class="designInfoVal orderPlaced"
                :style="{ color: getOrderStatusColor(ESInfo?.order_status) }"
              >
                {{ orderStatusDict[order_status] }}
              </div>
            </div>
            <div class="info_item" v-for="item in infoItems">
              <div class="designInfoLabel">{{ item.name }}</div>
              <div class="designInfoVal">{{ item.value }}</div>
            </div>
            <!-- <div class="info_item">
              <div class="designInfoLabel">Nameplate DC Size</div>
              <div class="designInfoVal">{{ summary.nameplateDcSize }} kWp</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">Performance Ratio</div>
              <div class="designInfoVal">{{ summary.performanceRatio }}</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">Total AC Size</div>
              <div class="designInfoVal">{{ summary.acSize }} kW</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">DC:AC Ratio</div>
              <div class="designInfoVal">{{ summary.acDcRatio }}</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">Specific Generation</div>
              <div class="designInfoVal">{{ summary.specificGeneration }}</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">Last modified at</div>
              <div class="designInfoVal">{{ summary.lastModifiedAt }}</div>
            </div>
            <div class="info_item">
              <div class="designInfoLabel">Created By</div>
              <div class="designInfoVal">{{ createdBy || "-" }}</div>
            </div> -->
            <div class="info_item" v-if="!isOnLeadSummaryPage">
              <div class="designInfoLabel">Proposal Requests</div>
              <div class="designInfoVal Proposal-Requests-View-Details" @click="isPreviousRequestsPopupVisible = true">View details</div>
            </div> 
            <!-- <div class="col_4 col">
              <div class="info_item">
                <div class="designInfoLabel">Status</div>
                <div class="designInfoVal" :class="[(isItInCompleteColor(order_status) ? 
                'incompleteColor' : 'inProcessColor'), (order_status === 'complete' ? 'completedColor' : '')]">
                  {{ order_status ? getOrderStatus(order_status) : "NA"}}
                  <p
                    class="viewMore"
                    @click="isRejectionReasonPopupVisible = true"
                    v-if="isStatusRejected(order_status) || isStatusCancelled(order_status)"
                  >
                    View More
                  </p>
                </div>
              </div>
            </div> -->
              <div class="info_item">
                <!-- <a href="" class="orderActivity">View Order Activity</a> -->
              </div>
              <!-- <div class="col_row" v-if="flagForUS">
              <div class="col_4 col">
                <div class="info_item">
                  <div class="btnCont" v-if="isStatusComplete(order_status)">
                    <el-button
                      type="primary"
                      class="dwnldBtn"
                      @click="isDownloadFilesPopupVisible = true"
                      >Download File</el-button
                    >
                    <el-button
                      type="primary"
                      class="reqRevBtn"
                      @click="openRequestRevisionPopup()"
                      >Request Revision</el-button
                    >
                  </div>
                </div>
              </div>
            </div> -->
            </div>
            <div
              class="btnsContainer"
              v-if="isOnLeadSummaryPage && showProposalButtons(designDataFull)"
            >
              <!-- TODO: Disable these buttons depending on report availability -->
              <!-- <router-link :to="{ name: 'webProposal', params: { designUUID: designDataFull?.versions?.reference_id } }"
              type="primary" class="commonBtn btn btn-primary" target="_blank">Web</router-link>
            <router-link :to="{ name: 'documentProposal', params: { designId: designDataFull.id } }" type="primary"
              class="commonBtn btn btn-primary" target="_blank">Doc</router-link>
            <router-link :to="{ name: 'DesignOverview', params: { designUUID: designDataFull?.versions?.reference_id } }"
              class="commonBtn btn btn-primary" target="_blank">3D</router-link> -->
              <ProposalButtons :design="designDataFull" />
              <!-- <p class="reqRev" v-if="isOnLeadSummaryPage">Request Revision</p> -->
              <p
                class="reqRev"
                v-if="showRequestRevisionButton"
                @click="openRequestRevisionPopup()"
              >
                Request Revision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DeleteDesign 
      v-if="isDeleteProjectPopupOpen"
      :isDeleteProjectPopupOpen="isDeleteProjectPopupOpen" 
      @confirmDelete="deleteDesign()"
      @cancelDelete="isDeleteProjectPopupOpen = false"
    />  
    <editDesignNameDialog
      :is-edit-design-name-dialog-visible.sync="isEditDesignNameDialogVisible"
      :design-name="designDataFull.name"/>
    <previousProposalRequests
      v-if="isPreviousRequestsPopupVisible"
      :isPreviousRequestsPopupVisible.sync="isPreviousRequestsPopupVisible"
      :currency_code="currencyCode.CurrencyCode"
    />

    <RejectionReasonPopup
      v-if="isRejectionReasonPopupVisible"
      :isRejectionReasonPopupVisible.sync="isRejectionReasonPopupVisible"
      :rejectionReasonMessage="rejectionReasonMessage"
      :cancelReasonMessage="cancelReasonMessage"
      :orderStatus="order_status"
    />
    <RequestRevisionPopup
      v-if="isRequestRevisionPopupVisible"
      :isRequestRevisionPopupVisible.sync="isRequestRevisionPopupVisible"
      :resId="requestObject.id"
      :revision_notes="revision_notes"
      :revision_version="revision_version"
      :projectId="String(projectId)"
      @confirmRevisionNote="confirmRevisionNote"
    />
    <div :v-if="showlogoutconfirmbox">
      <vue-confirm-dialog class="ConfirmBox"></vue-confirm-dialog>
    </div>
    <DownloadFilesPopup
      v-if="isDownloadFilesPopupVisible"
      :isDownloadFilesPopupVisible.sync="isDownloadFilesPopupVisible"
      :requestObjIdForDownloadFile="String(requestObject.id)"
    />
    <div class='duplicate-design-dialog'>
      <el-dialog
          title="Duplicate Design"
          :visible="isDuplicatePopupOpen"
          :close-on-click-modal="false"
          @close='isDuplicatePopupOpen = false'
      >
          <el-form
              style="text-align: left"
              label-position="left"
              label-width="150px"
              size="small"
              @submit.native.prevent
          >
              <el-form-item label="Design Name">
                  <el-input
                      v-model="duplicateDesignName"
                      placeholder="Design Name"
                      name="Design Name"
                  />
                  <!-- <p class="formErrors"><span>{{ errors.first('Design Name') }}</span></p> -->
              </el-form-item>
          </el-form>
          <div class='confirm-button'>
              <button class='confirm-btn' @click="duplicateDesign">
                  <span v-if="!isDuplicatingDesign">Duplicate</span>
                  <span v-else class="el-icon-loading"></span>
              </button>
          </div>
      </el-dialog>
      </div>
  </div>
</template>

<script>
import API from '@/services/api/';
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../stores/design";
import {
  orderStatusDict,
  getOrderStatusColor,
  isUserOfRole,
  showProposalButtons,
  isAccountSubscribed
} from "../../../utils";

import RejectionReasonPopup from "../components/designSummaryPopups/RejectionReasonPopup.vue";
import RequestRevisionPopup from "../components/designSummaryPopups/RequestRevisionPopup.vue";
import DownloadFilesPopup from "../components/designSummaryPopups/DownloadFilesPopup.vue";
import previousProposalRequests from "../../webProposal/previousProposalRequests.vue";
import ProposalButtons from "../../designSummaryCRM/components/ProposalButtons.vue";
import { useProjectStore } from "../../../stores/project";
import { useLeadStore } from "../../../stores/lead";
import editDesignNameDialog from '@/pages/design/components/designNameActions/designNameEditDialog.vue';
import DeleteDesign from '@/pages/design/components/designNameActions/deleteDesign.vue';
import {
  formatNumberWithCommas
} from '../../../utils';


export default {
  components: {
    RejectionReasonPopup,
    RequestRevisionPopup,
    DownloadFilesPopup,
    previousProposalRequests,
    ProposalButtons,
    editDesignNameDialog,
    DeleteDesign
  },
  props: {
    currency_code: {
      type: String,
    },
  },

  data() {
    return {
      reusableButtonStyles: {
        fontSize: "12px",
        fontWeight: "600",
        height: "28px",
        padding: "6px 10px",
      },
      tooltipMessageForNoModules:
        "Please add modules and inverters to the design, and calculate generation.",
      isPreviousRequestsPopupVisible: false,
      isRejectionReasonPopupVisible: false,
      isRequestRevisionPopupVisible: false,
      isDownloadFilesPopupVisible: false,
      revision_notes: [],
      revision_version: 0,
      orderStatusDict,
      isLoading: false,
      isOnLeadSummaryPage: this.$route.name.includes("leadSummary"),
      isEditDesignNameDialogVisible: false,
      duplicateDesignName: '',
      isDuplicatePopupOpen: false,
      isDuplicatingDesign: false,
      isDeleteProjectPopupOpen: false,
      showlogoutconfirmbox: false,
    };
  },

  mounted() {
    if (this.order_status == "rejected" || this.order_status == "cancelled") {
      this.isRejectionReasonPopupVisible = true;
    }
  },

  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT", "CHANGE_DESIGN_LIST"]),
    ...mapActions(useDesignStore, {
      STORE_DESIGN_VERSION: "STORE_DESIGN_VERSION",
      SET_DESIGN: "SET_DESIGN",
    }),
    openPopupToDuplicate() {
            this.duplicateDesignName = this.designDataFull.name + ' (Copy)';
            this.isDuplicatePopupOpen = true;
    },
    async duplicateDesign() {
        try {
            this.isDuplicatingDesign = true;
            const response = await API.DESIGNS.DUPLICATE_DESIGN(this.designDataFull.id, this.duplicateDesignName);
            this.CHANGE_DESIGN_LIST();
            this.$router.push(`/leadSummary/${this.leadInfo?.id}/design/${response.data}`)
        }
        catch (e) {
            console.error('ERROR: designSummaryHeader: duplicate design failed', e);
            this.isDuplicatingDesign = false;
            // Error message
            let errorMessage = e.response.status === 403 ? 
              "You don't have permission to edit this project." :
              'Error duplicating design, Try again.'
            this.$message({
                showClose: true,
                message: errorMessage,
                type: 'error',
                center: true
            });
          }
        this.isDuplicatePopupOpen = false;
        // setTimeout is required because router.go takes time to route,
        // before that button gets re-enabled.
        setTimeout(() => {
            this.isDuplicatingDesign = false;
        }, 1000);
    },
    async deleteDesign() {
            this.showlogoutconfirmbox = true;
            this.isDeleteProjectPopupOpen = true;

            try{
                await API.DESIGNS.DELETE_DESIGN(this.designDataFull.id);
                this.isDeleteProjectPopupOpen = false;
                try {
                  await this.GET_CURRENT_PROJECT(this.leadInfo.project_details.id);
                  // this.isLoadingProject = false
                } catch (err) {
                  console.error(err)
                  this.$message({
                    showClose: true,
                    message: 'There was an error loading project details for this lead.',
                    type: 'error',
                    center: true
                  }); 
                }
                this.$router.push({
                    name: 'leadSummary',
                    params: { leadId: this.leadInfo.id },
                });
            }
            catch(error){
                console.error(error)
                let errorMessage = error.response.status === 403 ?
                                   "You don't have permission to edit this project." :
                                   "error"
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: "error",
                    center: true
                })
                this.isDeleteProjectPopupOpen = false;
            }
        },
    confirmRevisionNote(isConfirm) {
      if (isConfirm) {
        this.getDesignDetails();
      }
    },

    async getDesignDetails() {
      try {
        await this.SET_DESIGN(
          this.$route.params.designId || this.designDataFull.id
        );
        this.isDesignGettingLoaded = false;
        this.isLoading = false;
      } catch (e) {
        if (e.response.status) {
          if (e.response.status === 404 || e.response.status === 403) {
            this.$message({
              showClose: true,
              message: "Design not found. Redirecting to Home Page ...",
              type: "error",
              center: true,
            });
          } else if (e.response.status === 500) {
            this.$message({
              showClose: true,
              message: "Error in loading design. Please try again.",
              type: "error",
              center: true,
            });
          }
          setTimeout(() => {
            this.$router.push({ name: "home" });
          }, 2000);
        }
      }
    },

    openRequestRevisionPopup() {
      if (this.requestObject.revision_notes) {
        this.revision_notes = this.requestObject.revision_notes;
      }
      if (this.requestObject.revision_version) {
        this.revision_version = this.requestObject.revision_version;
      }
      this.res_id = this.requestObject.id;
      this.isRequestRevisionPopupVisible = true;
    },

    isItInCompleteColor(status) {
      if (["incomplete", "rejected", "cancelled"].includes(status)) return true;
      else return false;
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
    isDesignDisabled(status) {
      if (this.isStatusCancelled(status) || this.isStatusRejected(status)) {
        return true;
      } else return false;
    },
    convertDateFormat(dateString) {
      let date = new Date(dateString);
      let curDate = date.toDateString();
      let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
      let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
      let dt = `${curDate[8]}${curDate[9]}`;
      let modifiedDate = `${dt} ${month} ${year}`;
      return modifiedDate;
    },
    async goToStudio() {
      this.isLoading = true;
      try {
        let designId = this.designDataFull.id;
        this.$router.push({
          name: "studio",
          params: { designId: designId },
        });
      } catch (e) {
        console.error(e);
      }
    },
    getOrderStatusColor,
    isUserOfRole,
    showProposalButtons,
  },

  computed: {
    ...mapState(useLeadStore, {
      leadInfo: (state) => state,
    }),
    ...mapState(useDesignStore, {
      order_status: (state) => state.request_expert_service.order_status,
      rejectionReasonMessage: (state) =>
        state.request_expert_service.rejection_reason,
      requestObject: (state) => state.request_expert_service,
      designImageUrl: "GET_DESIGN_IMAGE",
      projectId: (state) => state.project.id,
      cancelReasonMessage: (state) =>
        state.request_expert_service.reason_for_cancellation,
      summary: "GET_DESIGN_INFORMATION",
      currencyCode: "GET_CURRENCY_CODE",
      ESInfo: "GET_EXPERT_SERVICE_INFO",
      designDataFull: (state) => state,
      isExpertService: "isExpertService",
      isAccountSubscribed,
    }),
    createdBy() {
      const name = `${this.summary.created_by.first_name} ${this.summary.created_by.last_name}`;
      if (name.trim()) {
        return name;
      }
      return "-";
    },
    flagForUS() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    showRequestRevisionButton() {
      if (this.$route.name != "leadSummary") {
        return false;
      }

      if (this.isExpertService && this.order_status == "complete") {
        return true;
      }

      return false;
    },
    showEditDesignButton() {
      if (!this.isOnLeadSummaryPage) {
        return false;
      }

      return (
        (isUserOfRole("DESIGNER") || isUserOfRole("ADMIN")) &&
        showProposalButtons(this.designDataFull)
      );
    },
    infoItems() {
      let infoItemsDesignSummary = [
        {
          name: "Nameplate DC Size",
          value: this.summary.nameplateDcSize + " kWp"
        },
        {
          name: "Performance Ratio",
          value: this.summary.performanceRatio
        },
        {
          name: "Total AC Size",
          value: this.summary.acSize + " kW"
        },
        {
          name: "DC:AC Ratio",
          value: this.summary.acDcRatio
        },
        {
          name: "Specific Generation",
          value: this.summary.specificGeneration
        },
        {
          name: "Last modified at",
          value: this.summary.lastModifiedAt
        },
        {
          name: "Created By",
          value: this.createdBy || "-"
        },
      ]

      let infoItemsLeadSummary = [
        {
          name: "Type",
          value: this.ESInfo?.id ? "Expert Order" : "Self-Design"
        },
        {
          name: "Annual Generation",
          value: formatNumberWithCommas(this.designDataFull.annual_generation) + " kWh"
        },
        {
          name: "System Size",
          value: this.summary.nameplateDcSize + " kWp"
        },
        {
          name: "AC Size",
          value: this.summary.acSize + " kW"
        },
        {
          name: "Specific Generation",
          value: this.summary.specificGeneration
        },
        {
          name: "Performance Ratio",
          value: this.summary.performanceRatio
        },
        {
          name: "DC:AC Ratio",
          value: this.summary.acDcRatio
        },
      ]

      if (this.isOnLeadSummaryPage) {
        return infoItemsLeadSummary
      } else {
        return infoItemsDesignSummary
      }
    }
  },
};
</script>

<style scoped>
.incentive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 12px;
  display: none;
}

.card .incentive-header h4 {
  font-size: 16px;
  font-weight: 600 !important;
  color: var(--primary);
}
.btnsContainer {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}

.commonBtn {
  font-size: 12px;
  font-weight: 600;
  height: 28px;
  padding: 6px 10px;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-between;
  gap: 24px;
}

.flexContainer {
  display: flex;
  align-items: flex-start;
  gap: 0px;
}

.flexContainerCRM {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.thumbnail-container {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
}

.edit-design-button {
  width: 100%;
  border-radius: 0 0 5px 5px;
}

.image {
  max-width: 200px;
  border-radius: 5px 5px 0 0;
}

.rightSideCard {
  width: 100%;
}

.headers {
  margin-bottom: 16px;
}

.flexBetween {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.incentive_actin_icons {
  display: flex;
  align-items: center;
  margin-right: -16px;
}

.icon {
  font-size: 24px;
  cursor: pointer;
}

.designName {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    margin-bottom: 12px;
}

.info {
  font-size: 12px;
  color: #777;
}

.disable_design {
  opacity: 0.5;
  /* pointer-events: none; */
}

.incompleteColor {
  color: #ff0404 !important;
}

.inProcessColor {
  color: #409eff !important;
}

.completedColor {
  color: #2cc21c !important;
}

.card .card_header.flex_header {
  height: 48px !important;
}

.card .card_header h4 {
  font-size: 16px;
  font-weight: 600 !important;
  color: var(--primary);
}

.info_item {
  max-width: inherit;
  margin: 0px;
}

.designInfoLabel {
  font-size: 14px;
  color: #777;
  margin-bottom: 6px;
}

.designInfoVal {
  font-size: 16px;
  color: #222;
  word-break: break-all;
}

.Proposal-Requests-View-Details {
  color: #1c3366 !important;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
}

.viewMore {
  color: #409eff;
  border: 1px solid #409eff;
  font-size: 14px;
  padding: 4px 8px;
  font-style: italic;
  cursor: pointer;
  margin-left: 4px;
  display: inline;
}

.orderActivity {
  font-size: 16px;
  color: #222;
  font-style: italic;
  text-decoration: underline;
}

.btnCont {
  display: flex;
}

.reqRevBtn {
  background-image: linear-gradient(to bottom, #f67153, #f54d27);
  border: none;
}

.reqRev {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  margin-left: 16px;
  text-decoration: underline;
  cursor: pointer;
}

.duplicate-design-dialog >>> .el-dialog{
  width: fit-content;
  border-radius: 12px;
  height: auto;
}
.duplicate-design-dialog >>> .el-dialog__header{
  background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
  display: flex;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
}
.duplicate-design-dialog >>> .el-dialog__title{
  font-size: 16px;
  font-weight: bold;
  color: #222 !important;
}
.duplicate-design-dialog >>> .el-form-item--small.el-form-item{
  margin: 18px 7.5px;
}

.duplicate-design-dialog >>> .el-dialog__close{
    font-weight: 800;
    font-size: 18px;
    color: #222;
}

 .el-form-item__content{
    margin-left: 0;
    display: inline-block;
}
#app > div > main > div:nth-child(3) > section > div > div > div> div.duplicate-design-dialog > div > div > div.el-dialog__body > form > div > div{
    margin-left: 0;
    display: inline-block;
}

.duplicate-design-dialog .confirm-button{
  display: flex;
  justify-content: space-around;
}
.confirm-btn{
  background: #409EFF !important;
  color: white;
  border-radius: 4px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.55rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  border: none;
  background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
  font-family: HelveticaNeue;
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
    /* line-height: 3.89; */
  letter-spacing: normal;
  text-align: center;
  margin-bottom: 20px;
}
.action_btn {
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .gridContainer {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 947px) {
  .viewMore {
    display: block;
    margin-top: 8px;
    width: 90px;
  }
}
</style>
