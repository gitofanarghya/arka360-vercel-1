<template>
  <div
    class="designCRMContainer"
    v-loading.fullscreen="isLoading"
    v-loading="isLoadingDesign"
  >
    <div
      class="es-container"
      v-if="
        expertServices.length ||
        isUserOfRole('DESIGNER') ||
        isUserOfRole('ADMIN')
      "
    >
      <div class="solarSaleCard" v-if="!isUserOfRole('SALESPERSON')">
        <p class="heading">{{ selfDesignInfo.name }}</p>
        <p class="desc">{{ selfDesignInfo.description }}</p>
        <el-tooltip
          :disabled="
            Boolean(leadAddressExists) &&
            Boolean(!isCrmUser() || projectPermissionObject.edit_design)
          "
          effect="dark"
          placement="top-start"
          :content="tooltipContentForSelfDesign"
        >
          <span
            ><el-button
              type="primary"
              class="orderNowBtn"
              :disabled="
                !leadAddressExists ||
                (isCrmUser() && !projectPermissionObject.edit_design)
              "
              @click="openSelfDesignPopup()"
              >New Design</el-button
            ></span
          >
        </el-tooltip>
      </div>
      <div class="solarSaleCard" v-for="service in expertServices">
        <p class="heading">{{ service.serviceName }}</p>
        <p class="desc">{{ service.description }}</p>
        <el-tooltip
          :disabled="Boolean(leadAddressExists)"
          effect="dark"
          placement="top-start"
          :content="'Please add the lead address to order this service.'"
        >
          <span
            ><el-button
              type="primary"
              class="orderNowBtn"
              :disabled="!leadAddressExists"
              @click="payNowPopupVisible(service.detailedService)"
              >Order Now</el-button
            ></span
          >
        </el-tooltip>
      </div>
    </div>
    <div class="no-services-container" v-else>
      No services available. You need to log in with a designer account to
      create your own designs.
    </div>
    <div
      class="designCardsContainer address-unavailable"
      v-if="!leadAddressExists"
    >
      <p>You have not created any designs yet.</p>
      <p>Add the lead address to create a design.</p>
    </div>
    <div class="designCardsContainer" v-else-if="designs.length">
      <div
        class="cards"
        :class="{ 'disabled-order-card': isOrderCancelled(design) }"
        v-for="design in designs"
      >
        <div class="flexTwo" style="align-items: start">
          <div class="thumbnail-container">
            <el-button
              type="primary"
              class="edit-design-button"
              v-if="
                (isUserOfRole('DESIGNER') || isUserOfRole('ADMIN')) &&
                showProposalButtons(design)
              "
              @click="goToStudio(design)"
              >Edit Design</el-button
            >
            <img :src="design.thumbUrl" class="imgMap" />
          </div>
          <div class="rightSideCard">
            <div class="flexOne">
              <div>
                <router-link
                  class="designName"
                  :to="{
                    name: 'leadSummary:design',
                    params: {
                      leadId: $route.params.leadId,
                      designId: design.id,
                    },
                  }"
                >
                  {{ design.name }}
                </router-link>
                <p class="info">
                  Created by {{ design.created_by }} | Last modified on
                  {{ convertDateFormat(design.modified_at) }}
                </p>
              </div>
              <img
                src="../assets/delete.svg"
                class="deleteIcon"
                v-if="!isDesignExpertService(design) && isAccountSubscribed"
                @click="openDeleteDesignPopup(design)"
              />
            </div>
            <div class="gridContainer">
              <div class="infoCont" v-if="isDesignExpertService(design)">
                <p class="label">Status</p>
                <p
                  class="value"
                  :style="{
                    color: getOrderStatusColor(
                      design?.request_expert_service?.order_status
                    ),
                  }"
                >
                  {{
                    orderStatusDict[
                      design?.request_expert_service?.order_status
                    ]
                  }}
                </p>
              </div>
              <div class="infoCont">
                <p class="label">Type</p>
                <p class="value">
                  {{
                    isDesignExpertService(design)
                      ? "Expert Order"
                      : "Self-Design"
                  }}
                </p>
              </div>
              <div class="infoCont">
                <p class="label">Annual Generation</p>
                <p class="value">{{ designGenerationValue(design) }}</p>
              </div>
              <div class="infoCont">
                <p class="label">System Size</p>
                <p class="value">{{ designSystemSize(design) }}</p>
              </div>
              <div class="infoCont">
                <p class="label">AC Size</p>
                <p class="value">{{ designDcSize(design) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flexTwo" v-if="!isOrderCancelled(design)">
          <div class="cancelOrderSection" >
              <span>
                <a
                  href="#"
                  v-if="
                    isDesignExpertService(design) && !isOrderCancelled(design)
                  "
                  class="cancelOrder"
                  :class="{ disabled: timeIsUpForCancellation(design) }"
                  @click="openCancelOrderPopup(design)"
                >
                  Cancel Order
                </a>
                </span
              >
              <el-tooltip
                effect="dark"
                placement="top"
                :content="'Orders can only be cancelled within one hour of placing the order.'"
                style="margin-left: 6px; cursor: pointer;"
                v-if="isDesignExpertService(design) && !isOrderCancelled(design)"
              >
                <img src="../assets/info.svg" />
              </el-tooltip>
          </div>
          <div class="gridContTwo">
            <router-link
              class="viewDet"
              :to="{
                name: 'leadSummary:design',
                params: {
                  leadId: $route.params.leadId,
                  designId: design.id,
                },
              }"
            >
              View Details
            </router-link>
            <div class="btnsContainer">
              <!-- <el-button type="primary" class="commonBtn" v-if="isDesignExpertService(design)" -->
              <el-button
                type="primary"
                class="commonBtn"
                v-if="showRequestRevisionButton(design)"
                @click="openRequestRevisionPopup(design)"
                >Request Revision</el-button
              >
              <!-- TODO: Omitting Generate Proposal button for now -->
              <el-button v-if="false" type="primary" class="commonBtn"
                >Generate Proposal</el-button
              >

              <!-- <el-tooltip
                :disabled="!isWebProposalDisabledForDesign(design)"
                effect="dark"
                placement="top-start"
                :content="tooltipMessageForProposal(design)"
              >
                <span
                  ><router-link
                    :to="{
                      name: 'webProposal',
                      params: { designUUID: design?.versions?.reference_id },
                    }"
                    class="commonBtn btn btn-primary design-btn"
                    :class="{
                      disabled: isWebProposalDisabledForDesign(design),
                    }"
                    target="_blank"
                  >
                    Web
                  </router-link></span
                >
              </el-tooltip>
              <el-tooltip
                :disabled="!isDocumentProposalDisabledForDesign(design)"
                effect="dark"
                placement="top-start"
                :content="tooltipMessageForProposal(design)"
              >
                <span
                  ><router-link
                    :to="{
                      name: 'documentProposal',
                      params: { designId: design.id },
                    }"
                    class="commonBtn btn btn-primary design-btn"
                    :class="{
                      disabled: isDocumentProposalDisabledForDesign(design),
                    }"
                    target="_blank"
                  >
                    Doc
                  </router-link></span
                >
              </el-tooltip>
              <el-tooltip
                :disabled="!is3DLinkDisabledForDesign(design)"
                effect="dark"
                placement="top-start"
                :content="tooltipMessageForNoModules"
              >
                <span
                  ><router-link
                    :to="{
                      name: 'DesignOverview',
                      params: { designUUID: design?.versions?.reference_id },
                    }"
                    class="commonBtn btn btn-primary design-btn"
                    target="_blank"
                    :class="{ disabled: is3DLinkDisabledForDesign(design) }"
                  >
                    3D
                  </router-link></span
                >
              </el-tooltip> -->

              <!-- <ReusableButton
                :button="webProposalButtonData(design)"
                @click="navigateToWebProposal(design)"
              />

              <ReusableButton
                :button="documentProposalButtonData(design)"
                @click="navigateToDocumentProposal(design)"
              />

              <ReusableButton
                :button="designOverviewButtonData(design)"
                @click="navigateToDesignOverview(design)"
              /> -->
              <ProposalButtons :design="design"></ProposalButtons>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="designCardsContainer noDesigns">
      This lead has no designs.
    </div>

    <NewDesignDialog
      :is-new-design-modal-visible.sync="showNonPayableSelfDesignPopup"
      @showLoaderInParent="isLoading = true"
    />

    <self-design-popup
      v-if="showPayableSelfDesignPopup"
      :isSelfDesignPopupVisible.sync="showPayableSelfDesignPopup"
      :buttonclickedNEW.sync="selfDesignData"
      :totalSelfDesigns="selfDesignsList.length"
      @OrderSelfDesign="orderSelfDesign"
    />

    <DeleteDesign
      v-if="showDeleteDesignPopup"
      :isDeleteProjectPopupOpen="showDeleteDesignPopup"
      @confirmDelete="deleteDesign()"
      @cancelDelete="showDeleteDesignPopup = false"
    />
    <PayNowPopup
      v-if="showPayNowPopup"
      :buttonclickedNEW.sync="serviceData"
      :isPayNowPopupVisible.sync="showPayNowPopup"
      @timeUpdateEvent="timeUpdateFunc"
      @emit-for-payment-status="methodAfterPayment"
    />
    <paymentSuccessfulPopup
      :isPaymentSuccessfulPopupVisible.sync="isPaymentSuccessfulPopupVisible"
      :timeUpdateData="timeUpdateData"
      :requestedServiceType="requestedServiceType"
      :timeRemaining="timeRemaining"
      @closeSuccessFullPopup="afterPaymentSuccessfull"
    />
    <genericComponents
      :siteSurveyPath="siteSurveyPath"
      :projectId="projectId"
      :request_object_id="request_object_id"
      :requestedServiceType="requestedServiceType"
      :invokeGenericComponent.sync="invokeGenericComponent"
      :currentStepInProp="currentStep"
      :totalSteps="totalSteps"
    />
    <CancelOrderPopup
      v-if="showCancelOrderPopup"
      :isCancelOrderPopupVisible.sync="showCancelOrderPopup"
      :resId="cancelOrderData.res_id"
      :serviceType="cancelOrderData.service_type"
      :cancelDeliveryType="cancelOrderData.cancel_delivery_type"
      :cancelSiteSize="cancelOrderData.cancel_site_size"
      :projectId="projectId"
      :cancelOrderCase.sync="cancelOrderData.cancelOrderCase"
      :cancelRevisionCase.sync="cancelOrderData.cancelRevisionCase"
    />
    <RequestRevisionPopup
      v-if="showRequestRevisionPopup"
      :isRequestRevisionPopupVisible.sync="showRequestRevisionPopup"
      :featuresArray="requestRevisionData.featuresArray"
      :resId="requestRevisionData.res_id"
      :key="requestRevisionData.res_id"
      :project_type="'TODO'"
      :requestServiceType="requestRevisionData.requestServiceType"
      :revision_notes="requestRevisionData.revision_notes"
      :projectId="projectId"
      :design_type="'Base'"
      :available_revisions="requestRevisionData.available_revisions"
      :order_type="requestRevisionData.order_type"
      @confirmRevisionNote="confirmRevisionNote"
    />
  </div>
</template>

<script>
import API from "@/services/api";
import { mapState, mapActions } from "pinia";
import { useProjectStore } from "../../../stores/project";
import { useDesignStore } from "../../../stores/design";
import { useLeadStore } from "../../../stores/lead";
import { useCreditsStore } from "../../../stores/credits";
import {
  getExpertServicesList,
  getSelfDesignInfo,
  orderStatusDict,
  getOrderStatusColor,
  isUserOfRole,
  isAccountSubscribed,
  formatNumberWithCommas,
  isWebProposalDisabled,
  isDocProposalDisabled,
  isDesignExpertService,
  showProposalButtons,
} from "../../../utils";

import NewDesignDialog from "../../project/components/projectDesigns/newDesignDialog.vue";
import DeleteDesign from "../../design/components/designNameActions/deleteDesign.vue";
import designDetailCRM from "./designDetailCRM.vue";
import PayNowPopup from "../../dashboard/components/payNowPopup.vue";
import CancelOrderPopup from "../../design/components/designSummaryPopups/CancelOrderPopup.vue";
import RequestRevisionPopup from "../../design/components/designSummaryPopups/RequestRevisionPopup.vue";
import paymentSuccessfulPopup from "../../dashboard/components/paymentSuccessfulPopup.vue";
import genericComponents from "../../dashboard/components/genericComponent.vue";
import { getServiceSpecificInfo } from "@/pages/utils/utils.js";
import { isCrmUser } from "@/utils.js";
import ReusableButton from "./ReusableButton.vue";
import ProposalButtons from "./ProposalButtons.vue";
import * as utils from '../../../core/utils/utils';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from '../../../constants';
import { useMapImagesStore } from '../../../stores/mapImages';

export default {
  components: {
    NewDesignDialog,
    DeleteDesign,
    designDetailCRM,
    PayNowPopup,
    CancelOrderPopup,
    RequestRevisionPopup,
    paymentSuccessfulPopup,
    genericComponents,
    ReusableButton,
    ProposalButtons,
  },
  data() {
    return {
      reusableButtonStyles: {
        fontSize: "12px",
        fontWeight: "600",
        height: "28px",
        padding: "6px 10px",
      },
      expertServices: getExpertServicesList(),
      orderStatusDict,
      isLoading: false,
      isLoadingDesign: false,
      showPayableSelfDesignPopup: false,
      showNonPayableSelfDesignPopup: false,
      showDeleteDesignPopup: false,
      showPayNowPopup: false,
      showRequestRevisionPopup: false,
      showCancelOrderPopup: false,
      designIdToDelete: null,
      selfDesignInfo: {
        name: "Self-Design",
        description:
          "Create your own PV system design and solar sales proposal using our built-in design studio.",
      },
      tooltipMessageForNoModules:
        "Please add modules and inverters to the design, and calculate generation.",
      selfDesignData: getSelfDesignInfo(),
      requestRevisionData: {},
      cancelOrderData: {},
      serviceData: null,
      timeUpdateData: null,
      requestedServiceType: "",
      dueDate: null,
      createdAt: null,
      isPaymentSuccessfulPopupVisible: false,
      isNewProjectFormVisible: false,
      request_object_id: 0,
      invokeGenericComponent: false,
      siteSurveyPath: "",
      currentStep: 1,
    };
  },
  created() {
    this.setDesignThumbnails();
  },
  computed: {
    ...mapState(useProjectStore, {
      projectPermissionObject: "GET_PERMISISON_OBJECT",
      designs: "GET_DESIGNS_DETAILS",
      projectImageUrl: "GET_PROJECT_IMAGE_URL",
      projectId: (state) => state.id,
      staticImageUrl: "GET_PROJECT_IMAGE_URL",
      isDesignListChanged: (state) => state.isDesignListChanged,
    }),
    ...mapState(useLeadStore, {
      leadAddressExists: (state) => state.address,
      leadInfo: (state) => state,
    }),
    timeRemaining() {
      return this.dateToString2(this.dueDate, this.createdAt);
    },
    totalSteps() {
      if (!JSON.parse(localStorage.getItem("allServicesInfo"))) return;
      let data = getServiceSpecificInfo(this.requestedServiceType);
      if (!data) return;
      return data["template_constant"][0]["pop_ups"].length - 1;
      // if(this.isProjectNowCreated)
      //     return data['template_constant'][0]['pop_ups'].length;
      // else
      //     return data['template_constant'][0]['pop_ups'].length -1;
    },
    selfDesignsList() {
      return this.designs.filter(this.isSelfDesign);
    },
    tooltipContentForSelfDesign() {
      if (!this.leadAddressExists) {
        return "Please add the lead address to create a new design.";
      } else if (isCrmUser() && !this.projectPermissionObject.edit_design) {
        return "You dont have the permission to create a design.";
      }
    },
    isAccountSubscribed,
  },
  methods: {
    //add here
    webProposalButtonData(design) {
      console.log(design);
      return {
        label: "Web",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.isWebProposalDisabledForDesign(design),
        tooltip: this.tooltipMessageForProposal(design),
      };
    },
    fetchGoogleMapsImage(designId) {
        // this.isImageBeingApplied = true;
        const groundImageData = {
            url: `https://maps.googleapis.com/maps/api/staticmap?center=${useProjectStore().latitude},${useProjectStore().longitude}&scale=2&zoom=${useProjectStore().zoomLevel}&maptype=satellite&size=${useMapImagesStore().dimensions}x${useMapImagesStore().dimensions}&key=${GOOGLE_API_KEY}`,
            imageType: 'map',
            rotation: 0,
            scale: 0,
            offset: [0, 0],
            source: 'google_maps',
            zoom: useProjectStore().zoom,
        };
        groundImageData.url = utils.signRequest(groundImageData.url, GOOGLE_SIGNING_SECRET);
        return this.saveImageJSON(groundImageData, designId);
    },
    saveImageJSON(obj, designId){
        return {
            "url": obj.url,
            "rotation": obj.rotation,
            "scale": obj.scale,
            "design": designId,
            "source": obj.source,
            "zoom": obj.zoom,
            "is_visible": true,
        };
    },
    documentProposalButtonData(design) {
      return {
        label: "Doc",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.isDocumentProposalDisabledForDesign(design),
        tooltip: this.tooltipMessageForProposal(design),
      };
    },

    designOverviewButtonData(design) {
      return {
        label: "3D",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.is3DLinkDisabledForDesign(design),
        tooltip: this.tooltipMessageForNoModules,
        //why is this returning false even though the value exists?
      };
    },
    navigateToWebProposal(design) {
      //console.log("In parent, handling click");
      //console.log(design);
      const designUUID = design?.versions?.reference_id;
      //console.log(designUUID);
      const route = { name: "webProposal", params: { designUUID } };

      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      console.log(url);
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    navigateToDocumentProposal(design) {
      const designId = design?.id;
      const route = { name: "documentProposal", params: { designId } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    navigateToDesignOverview(design) {
      const designUUID = design?.versions?.reference_id;
      const route = { name: "DesignOverview", params: { designUUID } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    ...mapActions(useDesignStore, {
      SET_DESIGN: "SET_DESIGN",
      STORE_DESIGN_VERSION: "STORE_DESIGN_VERSION",
    }),
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),
    methodAfterPayment(isPaymentSuccessful, paymentId) {
      console.log("payment ID after payment", isPaymentSuccessful, paymentId);
      if (isPaymentSuccessful) {
        this.sendPaymentStatusToBackend(paymentId);
        this.showPayNowPopup = false; // close payNow popup after successful payment
      } else {
        this.$message({
          showClose: true,
          message: "Payment Failed! Please try again.",
          type: "error",
          center: true,
        });
      }
    },
    async sendPaymentStatusToBackend(paymentId) {
      this.isLoadingAfterPayment = true;
      const postData = {
        payment_id: paymentId,
        payment_status: "success",
      };
      try {
        const response = await API.DESIGNS.CONFIRM_PAYMENT_FROM_BACKEND(
          postData
        );
        this.requestedServiceType = response.data.data.service_type;
        let paymentStatus = response.data.data.payment_status;
        let repeat = response.data.data.repeat;
        this.createdAt = response.data.data.created_at;
        this.dueDate = response.data.data.due_date;
        this.request_object_id = response.data.data.request_object_id;
        console.log("requestedServiceType", this.requestedServiceType);
        console.log("request_object_id", this.request_object_id);
        this.isLoadingAfterPayment = false;
        if (paymentStatus === "success" && !repeat) {
          this.isPaymentSuccessfulPopupVisible = true;
        }
      } catch {
        this.isLoadingAfterPayment = false;
      }
    },
    timeUpdateFunc(val) {
      this.timeUpdateData = val;
    },
    afterPaymentSuccessfull() {
      this.isPaymentSuccessfulPopupVisible = false;
      // just invoke generic component because project must be created
      this.invokeGenericComponent = true;
      // if(!this.projectId)
      // this.isNewProjectFormVisible = true;
      // else
      // this.invokeGenericComponent = true;
    },
    dateToString2: function (_dateString2, _dateString) {
      var mydate = new Date(_dateString);
      var mydate2 = new Date(_dateString2);
      var diff_in_time = mydate2.getTime() - mydate.getTime();
      var ms = diff_in_time % 1000;
      diff_in_time = (diff_in_time - ms) / 1000;
      var ss = diff_in_time % 60;
      diff_in_time = (diff_in_time - ss) / 60;
      var mm = diff_in_time % 60;
      diff_in_time = (diff_in_time - mm) / 60;
      var hh = diff_in_time % 24;
      var days = (diff_in_time - hh) / 24;
      var finalOutcome = days * 24;
      if (finalOutcome / 24 == 1) {
        return finalOutcome / 24 + " " + "working day";
      } else {
        return finalOutcome / 24 + " " + "working days";
      }
    },
    payNowPopupVisible(data) {
      this.serviceData = data;
      this.showPayNowPopup = true;
    },
    designGenerationValue(design) {
      let val = design?.annual_generation;
      if (val != null) {
        return formatNumberWithCommas(val) + " kWh";
      }
      return "N/A";
    },
    designSystemSize(design) {
      let size = design?.versions?.summary?.nameplate_dc_size;
      if (size != null) {
        return formatNumberWithCommas(size) + " kWp";
      }
      return "N/A";
    },
    designDcSize(design) {
      let size = design?.versions?.summary?.ac_size;
      if (size != null) {
        return formatNumberWithCommas(size) + " kW";
      }
      return "N/A";
    },
    openCancelOrderPopup(design) {
      let service = design.request_expert_service;
      this.cancelOrderData = {
        res_id: service.id,
        service_type: service.service_type,
        cancel_site_size: service.site_size,
        cancel_delivery_type: service.delivery_type,
        cancelOrderCase: true,
      };

      this.showCancelOrderPopup = true;
    },
    isStatusComplete(design) {
      if (!design.request_expert_service) return false;
      let status = design.request_expert_service.order_status;
      if (status == "complete") return true;
      else return false;
    },
    showRequestRevisionButton(design) {
      if (isDesignExpertService(design) && this.isStatusComplete(design)) {
        return true;
      }

      return false;
    },
    openRequestRevisionPopup(design) {
      let reqObj = design.request_expert_service;
      this.requestRevisionData = {
        featuresArray: design.features,
        order_type: reqObj.site_size ? reqObj.site_size : reqObj.delivery_type,
        res_id: reqObj.id,
        requestServiceType: reqObj.service_type,
        revision_notes: reqObj.revision_notes || [],
        available_revisions: reqObj.available_revisions,
      };

      this.showRequestRevisionPopup = true;
    },
    async confirmRevisionNote(isConfirm) {
      if (isConfirm) {
        await this.GET_CURRENT_PROJECT(this.leadInfo.project_details.id);
      }
    },
    isSelfDesign(design) {
      return !isDesignExpertService(design);
    },
    async orderSelfDesign(orderInfo) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const userId = user.user_id;
      let projectId = this.leadInfo.project_details.id;

      this.isDesignGettingCreated = true;
      let postData = {
        name: "Self Design",
        project: projectId,
        created_by: userId,
        modified_by: userId,
        use_promotional_credits: orderInfo.use_promotional_credits,
        features: orderInfo.avilFeaturesIds,
      };

      try {
        let response = await API.SELF_DESIGN.CREATE_NEW_SELF_DESIGN(
          postData,
          orderInfo.isSelfDesign
        );
        this.setCreditBalance({
          purchased_credits: response.data.credits.purchased_credits,
          promotional_credits: response.data.credits.promotional_credits,
        });
        await this.GET_CURRENT_PROJECT(projectId);
        // await API.FETCH_MAP.POST_MAP_IMAGE(this.fetchGoogleMapsImage(designId));
        // await this.getProjectDetails();

        this.isDesignGettingCreated = false;
        this.setDesignThumbnails();
        this.showPayableSelfDesignPopup = false;
      } catch (e) {
        console.error(e);
        let errorMessage = "Error in creating design. Try again";
        if (e.response.status === 302) {
          errorMessage = this.ERROR_MESSAGE_QUOTA_EXHAUSTED;
        }
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true,
        });
        this.isDesignGettingCreated = false;
        this.isSelfDesignPopupVisible = false;
        this.showPayableSelfDesignPopup = false;
      }
    },
    openSelfDesignPopup() {
      const allServicesInfo = JSON.parse(
        localStorage.getItem("allServicesInfo")
      );
      if (allServicesInfo.self_designing_info.id == null) {
        this.showNonPayableSelfDesignPopup = true;
      } else {
        this.showPayableSelfDesignPopup = true;
      }
    },
    openDeleteDesignPopup(design) {
      this.designIdToDelete = design.id;
      this.showDeleteDesignPopup = true;
    },
    async deleteDesign() {
      try {
        await API.DESIGNS.DELETE_DESIGN(this.designIdToDelete);
        this.showDeleteDesignPopup = false;
        let deletedDesign = this.designs.find(
          (design) => design.id == this.designIdToDelete
        );
        let deleteInd = this.designs.indexOf(deletedDesign);
        this.designs.splice(deleteInd, 1);
        this.designIdToDelete = null;
      } catch (err) {
        console.error(err);
        let errorMessage =
          err.response.status === 403
            ? "You don't have permission to edit this project."
            : "There was an error deleting the design.";
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true,
        });
      }
    },
    async goToStudio(design) {
      this.isLoading = true;
      try {
        let designId = design.id;
        const response = await API.DESIGNS.FETCH_DESIGN(designId);
        await this.STORE_DESIGN_VERSION(response);
        this.$router.push({
          name: "studio",
          params: { designId: designId },
        });
      } catch (e) {
        console.error(e);
      }
    },
    setDesignThumbnails() {
      let self = this;
      this.designs.forEach((design) => {
        API.DESIGNS.FETCH_DESIGN_LAYOUT(design.id).then((resp) => {
          let thumbUrl = this.projectImageUrl;
          if (resp.data) {
            thumbUrl = resp.data;
          }
          self.$set(design, "thumbUrl", thumbUrl);
        });
      });
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
    isWebProposalDisabledForDesign(design) {
      return isWebProposalDisabled({
        orderStatus: design?.request_expert_service?.order_status,
        nameplateDcSize: design?.versions?.summary?.nameplate_dc_size,
        acSize: design?.versions?.summary?.ac_size,
        financials: design?.pricing,
      });
    },
    isDocumentProposalDisabledForDesign(design) {
      return isDocProposalDisabled({
        orderStatus: design?.request_expert_service?.order_status,
        nameplateDcSize: design?.versions?.summary?.nameplate_dc_size,
        acSize: design?.versions?.summary?.ac_size,
        reportTemplate:
          design?.versions?.setting?.report_defaults?.template_name,
        financials: design?.pricing,
      });
    },
    is3DLinkDisabledForDesign(design) {
      // Disable 3D link if generation is not calculated
      console.log(design);
      return !design?.annual_generation;
    },
    isOrderCancelled(design) {
      let orderStatus = design?.request_expert_service?.order_status;
      return orderStatus == "cancelled" || orderStatus == "rejected";
    },
    tooltipMessageForProposal(design) {
      console.log(design);
      let summary = design?.versions?.summary;
      let financials = design?.pricing;
      if (summary?.nameplate_dc_size == null || summary?.ac_size == null) {
        return this.tooltipMessageForNoModules;
      } else if (
        (financials?.length > 0 && !financials?.[0]?.payback) ||
        financials?.length == 0
      ) {
        return "Please add consumption and pricing to the project.";
      }
    },
    timeIsUpForCancellation(design) {
      let createdString = design.versions.created_at;
      let createdTime = new Date(createdString).getTime();
      let curTime = new Date().getTime();
      if ((curTime - createdTime) / 1000 / 60 > 60) {
        return true;
      }

      return false;
    },
    getOrderStatusColor,
    isUserOfRole,
    showProposalButtons,
    isDesignExpertService,
    isCrmUser,
  },
  watch: {
    // If the list of designs gets changed, fetch the thumbnails again
    designs: function() {
      this.setDesignThumbnails()
    },
  }
};
</script>

<style scoped>
.designCRMContainer {
  padding: 16px;
  overflow-y: auto;
  height: calc(100vh - 228px);
}

.es-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.no-services-container {
  background-color: #e8edf2;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  margin-bottom: 16px;
}

.solarSaleCard {
  flex-basis: calc(50% - 8px);
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 10px;
  background-color: #e8edf2;
}

.heading {
  color: #1c3366;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: #222;
  margin-bottom: 16px;
  flex-grow: 1;
}

.orderNowBtn {
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
}

.designCardsContainer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #e8edf2;
  padding: 16px;
  border-radius: 10px;
}

.designCardsContainer.address-unavailable {
  text-align: center;
  color: gray;
}

.designCardsContainer.noDesigns {
  text-align: center;
}

.cards,
.flexOne {
  background-color: #fff;
  padding: 13px 16px;
  border-radius: 8px;
}

.disabled-order-card {
  pointer-events: none;
  opacity: 0.6;
}

.flexOne {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  justify-content: space-between;
  padding: 0px;
}

.flexCont {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.rightSideCard {
  width: 100%;
}

.designName {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}

.designName:hover {
  text-decoration: underline;
}

.info {
  font-size: 12px;
  color: #777;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #777;
}

.value {
  font-size: 16px;
  font-weight: 500;
  color: #222;
}

.flexTwo {
  display: grid;
  grid-template-columns: 192px auto;
  gap: 14px;
  align-items: center;
  margin-top: 6px;
}

.cancelOrderSection{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.cancelOrder {
  color: #fd000f;
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* TODO: Temporarily commented this as the i button needs to trigger a tooltip */
/* .cancelOrder::after {
    content: '';
    background: url('../assets/info.svg');
    width: 20px;
    height: 20px;
    display: block;
} */

.gridContTwo {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 16px;
  align-items: center;
}

.viewDet {
  font-size: 16px;
  font-weight: 600;
  color: #1c3366;
  text-decoration: underline;
}

.btnsContainer {
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
}

.commonBtn {
  font-size: 12px;
  font-weight: 600;
  height: 28px;
  padding: 6px 10px;
}

.design-btn.disabled {
  pointer-events: none;
}

.cancelOrder.disabled {
  pointer-events: none;
  opacity: 0.4;
}

.deleteIcon {
  cursor: pointer;
}

.thumbnail-container {
  position: relative;
}

.imgMap {
  border-radius: 5px;
  width: 192px;
  height: 192px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
}

.edit-design-button {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
