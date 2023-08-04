<template>
  <div class="project-summary-container" v-loading.fullscreen="isDesignGettingCreated">
    <main class="main-controller">
      <div class="backdrop"></div>
      <section class="right_section">

         <div :v-if="showlogoutconfirmbox">
             <vue-confirm-dialog class="ConfirmBox"></vue-confirm-dialog>
         </div>     
        <div class="content_section">
          <div class="project_summary">
            <router-link :to="{ name: 'projectListViewHome' }" class="backLink">
              Projects /
            </router-link>
            <router-link :to="'/projectSummary/' + projectId" class="backLink active">
              Project Summary
            </router-link>
             <div class="group_title">
              <div class="">
              <span class="title_text" v-html="projectNameFiltered"></span>
                <el-tooltip effect="dark" placement="top-start" content="Share Project">
                <button
                v-if = "isSharingAllowed"
                class="action_btn"
                @click="openShareProjectPopup()"
                >
                <span class="icon share-alt"></span>
                </button>
                </el-tooltip>
                <el-tooltip effect="dark" placement="top-start" content="Delete Project">
                <button
                class="action_btn"
                @click="deleteProject"
                >
                <span class="icon delete-alt"></span>
                </button>
                </el-tooltip>
              <ShareProject
                :shareDialogBoxVisible.sync="shareDialogBoxVisible"
                :project_id="projectId"
              />
              </div>
              <div class="">
              <div v-if="isLinkEnabled">
               <button v-if="!viewSiteSurveyLink"
                class="btn btn-primary createButton"  
                @click="generateSiteSurveyLink()">Get Site Survey Link</button>
              <button v-else
                class="btn btn-primary createButton"
                @click="openMedia()">View Site Survey</button>
              <span>
              <button v-if="viewSiteSurveyLink" class="action_btn"
                :class="'icon share-alt'"
                @click="shareSiteSurveyLink()">
              </button>
              </span>
              </div>
              <SiteSurveyLinkPopUp
                :siteSurveyLinkUrl.sync="siteSurveyLinkUrl"
                :isSiteSurveyLinkVisible.sync="isSiteSurveyLinkVisible"
                :viewSiteSurveyLink.sync = "viewSiteSurveyLink"
                :createdBy.sync = "createdBy"
              />
              <EmptySiteSurveyLinkPopUp
                :emptySiteSurvey.sync = 'emptySiteSurvey'
                :closeEmptySiteSurveyPopUp.sync='closeEmptySiteSurveyPopUp'
                />
              </div>
              <!-- <el-button type="primary" v-if="isSL360User" class="mngPrjtBtn" :loading="isButtonLoading"
                @click="getCorrespondingProjectID()">
                Manage Project
              </el-button> -->
            </div>
            
            <!-- <div class="sub_title">Project Summary</div> -->
          
            <div class="card">
              <div class="card_header flex_header">
                <h4 >Project Information</h4>
                <div
                  class="edit"
                  data-toggle="modal"
                  data-target="#info_edit"
                  @click="isProjectEditFormVisible = !isProjectEditFormVisible"
                >
                  <span class="icon edit-alt"></span>
                  Edit
                </div>
                <projectEditDialog :isProjectEditFormVisible.sync = "isProjectEditFormVisible"/>
              </div>
              <div class="card_content">
                <div class="col_row">
                  <div class="col">
                    <div class="col_row">
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Project Name</div>
                          <div class="value" v-html="projectNameFiltered"></div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Client Name</div>
                          <div class="value" v-html="clientNameFiltered"></div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Contact Number</div>
                          <div class="value" style="width: 240px;">
                            {{ projectInformation.clientPhone || '-' }}
                          </div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Email ID</div>
                          <div class="value">
                            <small>{{ projectInformation.clientEmail || '-' }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col_row">
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Address</div>
                          <div class="value">{{ projectInformation.clientAddress || '-' }}</div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Created On</div>
                          <div class="value">{{ projectInformation.createdAt || '-' }}</div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Created By</div>
                          <div class="value" style="width: 240px;">{{ projectInformation.createdBy || '-' }}</div>
                        </div>
                      </div>
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label">Currency</div>
                          <div
                            class="value"
                          >{{ projectInformation.country_details.currency_code || '-' }} ({{ currencySymbol }})</div>
                        </div>
                      </div>
                    </div>
                    <div class="col_row">
                      <div class="clo_4 col">
                        <div class="info_item">
                          <div class="label" >
                            Weather File
                            <button
                              class="btn outline_danger"
                              @click="weatherFileDialog=true"
                            >Change</button>
                          </div>
                          <div>
                            <div
                              v-if="Object.keys(selectedWeatherStation).length > 0"
                              class="projectInformationValues"
                              style="font-size: 13px"
                            >
                              {{ selectedWeatherStation.siteName }}
                              ({{ selectedWeatherStation.latitude }},
                              {{ selectedWeatherStation.longitude }})
                            </div>
                            <div
                              v-else
                              style="padding: 5px; color: #606266;"
                              class="el-icon-loading"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col design_col">
                    <el-tooltip effect="dark" placement="top-start" content="View in Google Maps">
                    <div class="design_card">
                      <figure>
                        <a :href="projectImageHref" target="_blank">
                          <img :src="projectImageURL" alt="Design" />
                        </a>
                      </figure>
                    </div>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>

           <div class="" :class=" ISUs? 'flexContainer' : ''">
          <!-- <div class="">  if you want to show chatbox then uncomment above one and comment this div  -->
           <div class="flexContainerOne">

             <ProjectDocuments />
            
            <clientRequirements
            v-if="consumption.averageMonthlyConsumption>0"/>
            <clientRequirementsInitial
            v-else/>

            <ahjInformation v-if="countryCode==='US'"/>

            <div class="card" id="order_service">
              <div class="card_header flex_header">
                <h4>Order Services</h4>
              </div>
              <div class="card_content expertServiceContainer">
                <div class="containerOne" v-for="serviceTypes in orderServicesTypes" :key="serviceTypes.id">
                  <h3 class="serviceHeading">{{serviceTypes.serviceName}}</h3>
                  <p class="serviceDesc">
                    {{serviceTypes.description}}
                  </p>
                  <el-button
                    type="primary"
                    class="serviceBtn" @click="payNowPopupVisible(serviceTypes.detailedService)"
                    >Order Now</el-button
                  >
                </div>
              </div>
            </div>

            <ProjectUpgradeCard :totalSelfDesigns="selfDesigns.length"/>


             <!-- Expert Service Order Card Starts Here------------------------------------------------------------------------------------------------------->


             <div class="card">
              <div class="card_header flex_header">
                <h4>Expert Service Orders</h4>
              </div>

              
              <div class="card_content">
                <div v-if="!expertServiceDesigns.length" class="no_designs_class">No Designs Yet</div>
                <div class="added_design">
                  <div
                    class="card_col"
                    v-for="(design, index) in expertServiceDesigns"
                    :span="8"
                    :key="index"
                  >
                    <div class="design_card" 
                    :class="{disable_design: isStatusCancelled(design)} ? '' : 'cardHeight'">
                      <el-tooltip effect="dark" placement="top-start" content="Open design Summary">
                        <figure @click.stop="onDesignClickHandler(design.id)">
                          <router-link :to="`/designSummary/${design.id}`">
                            <img :src="expertServiceDesignThumbnailsData[index]?.url" alt="Design" />
                          </router-link>
                        </figure>
                      </el-tooltip>
                      <div class="info_design">
                        <div class="name">
                          <div style="padding: 6px  0px">
                          <el-tooltip effect="dark" placement="top-start" :content= "design.name">
                            <div style="display: inline-block; font-size: 16px; cursor:pointer; ">
                            {{ design.name.length >26 ? `${design.name.substring(0,26)}`+" "+ "..." : `${design.name}`}}
                            </div> 
                          </el-tooltip>
                            <div 
                              style="display: inline-block; float: right; position: relative; top: -6px; margin-right: -18px; background: #f6fafe;"
                              v-if="!(isStatusCancelled(design) || isStatusRejected(design))"
                              :disabled="!isCurrentUserAllowedToEdit"
                              class="edit action_btn" @click.stop="leadToStudio(design,index,'expertServiceDesign',)"
                            >
                              <span :class="(isOpeningStudio && currentDesign === design.id)? 'el-icon-loading' : 'icon edit-alt'"></span>
                            </div>
                          </div>
                          <div v-if="design.request_expert_service" style="padding: 6px  0px">
                            <span class="desLabel">Status: </span>
                            <span class="desValue"
                              :style="{ color: getOrderStatusColor(design?.request_expert_service?.order_status) }"
                            >
                              {{ orderStatusDict[design?.request_expert_service?.order_status] || "NA" }}
                            </span>
                            <p class="viewMore"
                              @click="sendRejectionReasonMessage(design.request_expert_service.rejection_reason,
                              design.request_expert_service.reason_for_cancellation,design.request_expert_service.order_status)"
                              v-if="isStatusRejected(design) || isStatusCancelled(design)"
                            >
                              View More
                            </p>
                          </div>
                          <div v-if="design.request_expert_service" style="padding: 6px  0px"  >
                          <span class="desLabel">Order Type: </span>
                          <span class="desValue">{{design.request_expert_service.service_type ? design.request_expert_service.service_type : "NA"}}</span>
                          </div>
                          <!-- <div class="activityCont"><a href="" class="orderActivity">View Order Activity</a></div> -->
                          <!-- The above View Order Activity is needed for next revision -->
                         
                          <!-- REF -->
                          <!-- {{ project_id }} -->
                          <!-- {{ ((currentTimestamp()) - (createdTimestamp(design.versions.created_at))) / 1000 }} -->
                          <!-- {{ ((currentTime) - (createdTimestamp(design.versions.created_at))) / 1000 }} -->
                          <!-- {{ currentTime }} -->
                          <!-- {{ currentTimestamp() }} -->
                          <!-- REF -->
                          
                          <div class="btnCont" v-if="design.request_expert_service && isStatusComplete(design)">
                            <el-button type="primary" class="dwnldBtn"  @click="openDownloadFilePopup(design)" :disabled="!isProjectBeingLoaded">Download File</el-button>
                            <el-button type="primary" class="reqRevBtn"  @click="openRequestRevisionPopup(design.request_expert_service, design.features)" v-if="isStatusComplete(design)" :disabled="!isProjectBeingLoaded">
                              Request Revision
                            </el-button>
                          </div>
                          <div class="btnContTwo">
                            <el-button type="primary" class="cancelBtn"
                             @click="openCancelOrderPopup(design.request_expert_service)"
                              v-if="(isStatusInprocess(design)|| isStatusOrderPlaced(design)) && !design.request_expert_service.revision_notes" 
                              :disabled="timeIsUpForCancellation(design.versions.created_at)">
                              Cancel Order
                              <!-- {{ design.request_expert_service.revision_notes ? 'Cancel Revision' : 'Cancel Order'}} -->
                            </el-button>
                            <el-button type="primary" class="cancelBtn"
                             @click="openCancelRevisionPopup(design.request_expert_service)"
                              v-if="(isStatusInprocess(design)|| isStatusOrderPlaced(design)) && design.request_expert_service.revision_notes" 
                              :disabled="timeIsUpForRevisionCancellation(design.request_expert_service.revision_notes.slice(-1)[0].revision_created_at)">
                              Cancel Revision
                              <!-- {{ design.request_expert_service.revision_notes ? 'Cancel Revision' : 'Cancel Order'}} -->
                            </el-button>
                            <!-- {{ design.request_expert_service.revision_notes ?  design.request_expert_service.revision_notes.slice(-1)[0].revision_created_at : 'NA'}} -->
                            <div class="hover_information"
                             v-if="(isStatusInprocess(design)|| isStatusOrderPlaced(design)) && !design.request_expert_service.revision_notes" 
                             :disabled="timeIsUpForCancellation(design.versions.created_at)">
                              <img src="../../../../assets/drop/exclamation.png" class="exclamation">
                              <div class="tooltip">
                                <p v-if="timeIsUpForCancellation(design.versions.created_at)">
                                  Order can’t be cancelled after 1 hour of order placement
                                </p>
                                <p v-else>
                                  Order can be cancelled only before 
                                  {{ addOneHourNew(design.versions.created_at) }}.
                                </p>
                              </div>
                            </div>
                            
                            <div class="hover_information"
                             v-if="(isStatusInprocess(design)|| isStatusOrderPlaced(design)) && design.request_expert_service.revision_notes" 
                             :disabled="timeIsUpForRevisionCancellation(design.request_expert_service.revision_notes.slice(-1)[0].revision_created_at)">
                              <img src="../../../../assets/drop/exclamation.png" class="exclamation">
                              <div class="tooltip">
                                <p v-if="timeIsUpForRevisionCancellation(design.request_expert_service.revision_notes.slice(-1)[0].revision_created_at)">
                                  Revision order can’t be cancelled after 1 hour of requesting revision.
                                </p>
                                <p v-else>
                                  Revision order can be cancelled only before 
                                  {{ addOneHourNew(design.request_expert_service.revision_notes.slice(-1)[0].revision_created_at) }}.
                                </p>
                              </div>
                            </div>
                            <!-- {{ cancelOrderCase }} -->
                            <!-- {{ cancelRevisionCase }} -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- </div> -->
              </div>
            </div>

             <!-- Expert Service Order Card Ends Here-------------------------------------------------------------------------------------------------------->

              <!-- Self Design Card Starts Here------------------------------------------------------------------------------------------------------->

            <div class="card">
              <div class="card_header flex_header">
                <h4>Designs</h4>
              </div>

              
              <div class="card_content">
                <!-- <div v-if="!selfDesigns.length">No Designs Yet</div> -->
                <div class="added_design">
                  <div
                    class="card_col cardHeight"
                    v-for="(design, index) in selfDesigns"
                    :span="8"
                    :key="index"
                  >
                    <div class="design_card cardHeight" >
                      <el-tooltip effect="dark" placement="top-start" content="Open design Summary">
                        <figure @click.stop="onDesignClickHandler(design.id)">
                          <router-link :to="`/designSummary/${design.id}`">
                            <img :src="selfDesignThumbnailsData[index]?.url" alt="Design" />
                          </router-link>
                        </figure>
                      </el-tooltip>
                      <div class="info_design">
                        <div class="name">
                          <div style="padding: 6px  0px">
                          <el-tooltip effect="dark" placement="top-start" :content= "design.name">
                            <div style="display: inline-block; font-size: 16px; cursor:pointer; ">
                            {{ design.name.length >26 ? `${design.name.substring(0,26)}`+" "+ "..." : `${design.name}`}}
                            </div> 
                          </el-tooltip>
                          </div>
                          <!-- <div class="activityCont"><a href="" class="orderActivity">View Order Activity</a></div> -->
                          <!-- The above View Order Activity is needed for next revision -->

                          <!-- REF -->
                          <!-- {{ project_id }} -->
                          <!-- {{ ((currentTimestamp()) - (createdTimestamp(design.versions.created_at))) / 1000 }} -->
                          <!-- {{ ((currentTime) - (createdTimestamp(design.versions.created_at))) / 1000 }} -->
                          <!-- {{ currentTime }} -->
                          <!-- {{ currentTimestamp() }} -->
                          <!-- REF -->
                        </div>
                        <div class='group_button'>
                          <el-tooltip effect="dark" placement="top-start" :content="copyDesignTooltipContent" v-if="isAccountSubscribed">
                            <span>
                              <button class="edit action_btn" 
                                :disabled="isDuplicatingDesign"
                                :class="'icon copy-alt'"
                               
                                @click="openPopupToDuplicate(design)">
                              </button>
                            </span>
                          </el-tooltip>
                          <el-tooltip effect="dark" placement="top-start" content="Edit in Studio">
                            <div 
                              :disabled="!isCurrentUserAllowedToEdit"
                              class="edit action_btn" @click.stop="leadToStudio(design,index,'selfDesign')"
                            >
                              <span :class="(isOpeningStudio && currentDesign === design.id)? 'el-icon-loading' : 'icon edit-alt'"></span>
                            </div>
                          </el-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card_col add_design_container cardHeight">
                      <div @click="selfDesignPopupVisible(selfDesignInfo)" class="design_card add_design cardHeight">
                        <div style="" class="add_design_icon_container">
                          <div class="el-icon-plus" style="font-size: 28px;"></div>
                        </div>
                        <div class="add_design_text">
                          Add New Design
                          </div>
                      </div>
                  </div>
                </div>
                <!-- </div> -->
              </div>
            </div>


             <!-- Self Design Card Ends Here------------------------------------------------------------------------------------------------------->


            <Comments v-if="isSL360User" />

            <NewDesignDialog :is-new-design-modal-visible.sync="isNewDesignModalVisible" />
            
            <projectSummaryWeatherFile
              :weatherFiles.sync="weatherFiles"
              :weatherFileDialog.sync="weatherFileDialog"
              :selectedWeatherStation.sync="selectedWeatherStation"
              @fetchLatestWeatherOnceAgain="fetchLatestWeatherOnceAgain"
              @updateWeatherFile ="updateWeatherFile"
            />

            <payNowPopup
              v-if="isPayNowPopupVisible"
              :buttonclicked.sync="buttonclicked"
              :buttonclickedNEW.sync="buttonclickedNEW"
              :isPayNowPopupVisible.sync="isPayNowPopupVisible"
            />
           </div>
           <div class="flexContainerTwo">
             <ChatBox v-if="ISUs" />
           </div>
           </div>
          </div>
        </div>
        <DeleteProject 
          v-if="isDeleteProjectPopupOpen"
          :isDeleteProjectPopupOpen="isDeleteProjectPopupOpen" 
          @confirmDelete="actualDelete()"
          @cancelDelete="isDeleteProjectPopupOpen = false"
        />  
        <RequestRevisionPopup
          v-if="isRequestRevisionPopupVisible"
          :isRequestRevisionPopupVisible.sync="isRequestRevisionPopupVisible"
          :featuresArray="featuresArray"
          :resId="res_id"
          :key="res_id"
          :project_type="projectInformation.project_type"
          :requestServiceType = requestServiceType
          :revision_notes="revision_notes"
          :projectId="projectId"
          :design_type="design_type"
          :available_revisions="available_revisions"
          :order_type="order_type"
          @confirmRevisionNote="confirmRevisionNote"
        />
        <RejectionReasonPopup
          v-if="isRejectionReasonPopupVisible"
          :isRejectionReasonPopupVisible.sync="isRejectionReasonPopupVisible"
          :rejectionReasonMessage="rejectionReasonMessage"
          :cancelReasonMessage="cancelReasonMessage"
          :orderStatus="orderStatus"
        />
        <DownloadFilesPopup
          v-if="isDownloadFilesPopupVisible"
          :isDownloadFilesPopupVisible.sync="isDownloadFilesPopupVisible"
          :requestObjIdForDownloadFile="String(requestObjIdForDownloadFile)"
        />
        <CancelOrderPopup
          v-if="isCancelOrderPopupVisible"
          :isCancelOrderPopupVisible.sync="isCancelOrderPopupVisible"
          :resId="res_id"
          :serviceType="service_type"
          :cancelDeliveryType="cancel_delivery_type"
          :cancelSiteSize="cancel_site_size"
          :projectId="projectId"
          :cancelOrderCase.sync="cancelOrderCase"
          :cancelRevisionCase.sync="cancelRevisionCase"
          :isCancelRevisionPopupVisible.sync="isCancelRevisionPopupVisible"
        />
        <self-design-popup v-if="isSelfDesignPopupVisible"
          :isSelfDesignPopupVisible.sync="isSelfDesignPopupVisible"
          :buttonclickedNEW.sync="buttonclickedNEW"
          :isSelfDesignPopup="isSelfDesignPopup"
          :totalSelfDesigns="selfDesigns.length"
            @OrderSelfDesign="OrderSelfDesign"
           />
      </section>
    </main>

    <ShareRecordedVideoDialog
      :isShareVideoDialogVisible.sync="isShareVideoPopupOpen"/>
    <!-- share form popup -->

    <div class="modal modal_form" id="info_edit" v-if="isEditFormOpen">
      <div class="modal-overlay modal-toggle" data-dismiss="modal" @click="openProjectEditForm"></div>
      <div class="modal-wrapper">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Edit Project Details</h4>
            <button class="modal-close modal-toggle" data-dismiss="modal">
              <img
                src="../../../home/assets/img/close.svg"
                alt="Close"
                @click="openProjectEditForm"
              />
            </button>
          </div>
          <form class="inside_form" @submit.prevent="updateProjectDetails">
            <div class="scroll_content">
              <div class="floating-form">
                <div class="floating-label">
                  <input class="floating-input" type="text" v-model="editFormInput.projectName" />
                  <label>Project Name*</label>
                </div>
                <div class="floating-label">
                  <input class="floating-input" type="text" v-model="editFormInput.systemType" />
                  <label>System Type*</label>
                </div>
                <div class="floating-label">
                  <input class="floating-input" type="text" v-model="editFormInput.clientName" />
                  <label>Client Name*</label>
                </div>
                <div class="floating-label">
                  <input class="floating-input" type="text" v-model="editFormInput.clientPhone" />
                  <label>Contact Number</label>
                </div>
                <div class="floating-label">
                  <input class="floating-input" type="text" v-model="editFormInput.clientEmail" />
                  <label>Email Id</label>
                </div>
                <div class="floating-label">
                  <textarea rows="5" class="floating-input floating-textarea" v-model="editFormInput.clientAddress"></textarea>
                  <label>Address</label>
                </div>
              </div>
              <div class="button_area">
                <button type="submit" class="btn btn-primary"  >
                  <span v-show="!areProjectDetailsBeingEdited">Confirm</span>
                    <i
                      v-show="areProjectDetailsBeingEdited"
                      class="el-icon-loading" 
                    />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class='duplicate-design-dialog'>
      <el-dialog
        title="Duplicate Design"
        :visible="isDuplicatePopupOpen"
        :close-on-click-modal="false"
        @close='isDuplicatePopupOpen = false'
      >
        <el-form
          @submit.native.prevent
        >
          <el-form-item label="Design Name"><br/>
            <el-input
              v-model="duplicateDesignName"
              placeholder="Design Name"
              name="Design Name"
            />
            <!-- <p class="formErrors"><span>{{ errors.first('Design Name') }}</span></p> -->
            </el-form-item>
        </el-form>
        <div class='confirm-button'>
          <el-button class='confirm-btn' type="primary" @click="duplicateDesign">
            <span v-if="!isDuplicatingDesign">Duplicate</span>
            <span v-else class="el-icon-loading"></span>
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useCreditsStore } from "../../../../stores/credits";
import { useProjectStore } from "../../../../stores/project";
import { useDesignStore } from "../../../../stores/design";
import projectEditDialog from "./projectSummaryEditDialog.vue";
import projectSummaryWeatherFile from "./weatherData/projectSummaryWeatherFile_new.vue";
import { weatherMixin } from "./weatherData/weatherMixin.js";
import NewDesignDialog from "../projectDesigns/newDesignDialog.vue";
import API from "@/services/api";
import ShareProject from "../projectNameAndActions/shareProject.vue";
import clientRequirements from "../clientRequirements/clientRequirements.vue";
import clientRequirementsInitial from "../clientRequirements/clientRequirementsInitial.vue";
import DeleteProject from './deleteProject.vue'
import ahjInformation from '../ahjInformation/ahjInformation.vue';

import payNowPopup from "../../../dashboard/components/payNowPopup.vue";
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';
import ChatBox from '../chatBox/chatBox.vue'
import ProjectDocuments from '../projectDocuments/projectDocuments.vue'
import RequestRevisionPopup from "../../../design/components/designSummaryPopups/RequestRevisionPopup.vue";
import RejectionReasonPopup from "../../../design/components/designSummaryPopups/RejectionReasonPopup.vue";
import DownloadFilesPopup from "../../../design/components/designSummaryPopups/DownloadFilesPopup.vue";
import CancelOrderPopup from "../../../design/components/designSummaryPopups/CancelOrderPopup.vue";
import CancelRevisionPopup from "../../../design/components/designSummaryPopups/CancelRevisionPopup.vue";
import ShareRecordedVideoDialog from "../../../design/components/designNameActions/shareRecordedVideoDialog.vue";
import SiteSurveyLinkPopUp from "../../../dashboard/components/siteSurveyLinkPopUp.vue";
import EmptySiteSurveyLinkPopUp from "../../../dashboard/components/emptySiteSurveyPopUp.vue";
import Comments from '../comments.vue'
import ProjectUpgradeCard from '../ProjectUpgradeCard.vue';
import { SL360_URL, SITE_SURVEY_LINK, DATABASE_URL_FOR_SITE_SURVEY, DATABASE_URL } from '../../../../constants';
import {
  isTataOrg,
  getExpertServicesList,
  getSelfDesignInfo,
  orderStatusDict,
  getOrderStatusColor,
} from "../../../../utils";
import * as utils from '../../../../core/utils/utils';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from '../../../../constants';
import { useMapImagesStore } from '../../../../stores/mapImages';


export default {
  name: "ProjectInformationView",
  mixins: [weatherMixin, homeRedirectionMixin],
  components: {
    country: null,
    projectEditDialog,
    projectSummaryWeatherFile,
    NewDesignDialog,
    ShareProject,
    SiteSurveyLinkPopUp,
    EmptySiteSurveyLinkPopUp,
    clientRequirements,
    DeleteProject,
    clientRequirementsInitial,
    ahjInformation,
    payNowPopup,
    ChatBox,
    ProjectDocuments,
    RequestRevisionPopup,
    RejectionReasonPopup,
    DownloadFilesPopup,
    CancelOrderPopup,
    CancelRevisionPopup,
    Comments,
    ProjectUpgradeCard,
    ShareRecordedVideoDialog,
  },

  props: {
    isSelfDesignPopup: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      isOrderService:false,
      isLinkEnabled:true,
      viewSiteSurveyLink:false,
      isSiteSurveyLinkVisible:false,
      closeEmptySiteSurveyPopUp: true,
      siteSurveyyToken: "",
      siteSurveyLinkUrl: "",
      emptySiteSurvey: false,
      createdBy: "",
      cancel_site_size: null,
      cancel_delivery_type: null,
      isProjectBeingLoaded: true,
      disableButton: false,
      featuresArray: {},
      order_type: null,
      design_type: "Base",
      info_type: null,
      isSelfDesignPopupVisible: false,
      requestServiceType : null,
      cancelOrderCase: false,
      cancelRevisionCase: false,
      revision_notes:[],
      available_revisions:0,
      res_id: '',
      service_type: '',
      oneHour: 60,
      countryCode:null,
      // designDetails: [],
      weatherFileDialog: false,
      selectedWeatherStation: {},
      weatherFiles: [],
      isEditFormOpen: false,
      isProjectEditFormVisible: false,
      isNewDesignModalVisible: false,
      thumbnailHeight: "",
      areThumbnailsVisible: false,
      designThumbnailsData: [],
      selfDesignThumbnailsData:[],
      expertServiceDesignThumbnailsData:[],
      shareDialogBoxVisible: false,
      showlogoutconfirmbox: false,
      projectId: this.$route.params.projectId,
      isDuplicatingDesign: false,
      isOpeningStudio: false,
      currentDesign: null,
      duplicateDesignName: '',
      designIndexToDuplicate: -1,
      isDuplicatePopupOpen: false,
      isDeleteProjectPopupOpen: false,
      projectTobeDeleted:{},
      designCardButtons : true,
      isRequestRevisionPopupVisible: false,
      isRejectionReasonPopupVisible : false,
      isDownloadFilesPopupVisible: false,
      isCancelOrderPopupVisible: false,
      isCancelRevisionPopupVisible: false,
      rejectionReasonMessage:"",
      cancelReasonMessage:"",
      thumbnail: {
        id: null,
        url: null,
        isLoading: null,
        isDesignBeingLoaded: false,
      },
      areProjectDetailsBeingEdited: false,
      editFormInput: {
        projectName: "",
        systemType: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        address: "",
      },
      isExpertServiceEnabled:null,
      expertServicePermissionFetched:false,

      buttonclicked: "",
      isPayNowPopupVisible: false,
      //---------------------------3D Model Service---------------------------------------//
      isDesignGettingCreated: false,
      selectedProfile: {},
      allProfiles_: [],
      //----------------------------Order Permit Especial--------------------------------//
      surveyInfo : {
              path : '',
              surveyId : '',
      },
      requestObjIdForDownloadFile:'',
      orderServicesTypes: getExpertServicesList(),
      orderStatusDict,
      selfDesignInfo: getSelfDesignInfo(),
      buttonclickedNEW:{},
      isShareVideoPopupOpen: false,
      isButtonLoading:false,
    };
  },

  created() {
    // this.getDesignDetais();
    // this.currentTimestampNew();
    this.getData();
    // this.allServiceInfo();
    this.orderServiceURL();
  },

  computed: {
    // diffTimestamp() {
    //   // return this.currentTime - this.createdTime;
    //   // this.currentTimestamp() - this.createdTime()
    // },
    
    ...mapState(useProjectStore, {
      projectInformation: "GET_PROJECT_INFORMATION",
      projectType: "GET_PROJECT_TYPE",
      currencySymbol: "GET_CURRENCY_SYMBOL",
      projectImageURL: "GET_PROJECT_IMAGE_URL",
      projectImageHref: "GET_PROJECT_IMAGE_HREF",
      designDetails: "GET_DESIGNS_DETAILS",
      staticImageUrl: "GET_PROJECT_IMAGE_URL",
      isCurrentUserAllowedToEdit: "GET_USER_PERMISSION",
      consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
    }),

    projectNameFiltered(){
      this.createdBy = this.projectInformation.createdBy;
      if(this.projectInformation.site_survey_token) {
        this.viewSiteSurveyLink = true;
        this.siteSurveyToken = this.projectInformation.site_survey_token;
        this.siteSurveyLinkUrl = DATABASE_URL_FOR_SITE_SURVEY.concat(this.siteSurveyToken);
      }
      else{
        this.viewSiteSurveyLink = false;
      }
      if(this.projectInformation.projectName){
        const escapedVal = this.projectInformation.projectName.replace(/`/g, "\\`"); // Escape backticks
        return eval("`" + escapedVal + "`");
      }
      else{
        return "-"
      }
    },

    clientNameFiltered(){
      if(this.projectInformation.clientName){
        return eval('`'+this.projectInformation.clientName+'`');
      }
      else{
        return "-"
      }
    },

    isSharingAllowed() {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      if (user.role !== "ADMIN" && isTataOrg()) {
        return false;
      }
      return true;

    },
    ISUs(){
      const user = JSON.parse(localStorage.getItem('user')) || {};
      return user.isUSFlagEnabled;
    },
    isSL360User() {
      const user = JSON.parse(localStorage.getItem('user')) || {}
      return user.is_sl_360_user
    },
    isAccountSubscribed(){
        let selfDesignId = JSON.parse(localStorage.getItem('allServicesInfo'))['self_designing_info']['id'];
        return !Boolean(selfDesignId);
    },
    expertServiceDesigns() {
      return this.designDetails.filter(function(item) {
        return item.request_expert_service &&
               Object.keys(item.request_expert_service).length > 0;
      });
    },
    selfDesigns() {
      return this.designDetails.filter(function(item) {
        return !item.request_expert_service || (item.request_expert_service &&
               Object.keys(item.request_expert_service).length === 0);
      });
    },
    copyDesignTooltipContent() {
      if (this.isDuplicatingDesign) {
        return "Duplicating design.."
      } 
      // -------Later told to make this availabe even for view permission and removing this --------------------//
      // else if (!this.isCurrentUserAllowedToEdit) {
      //   return "You do not have access to duplicate this design."
      // }
      return "Copy Design"
    }
  },
  mounted() {
    if(this.isOrderService){
      this.scrollToOrderServiceDiv();
    }
    this.fetchExpertServicePermission();
    this.initiateAfterPaymentPart();
    // this.allServiceInfo();
  },
  methods: {
    // isSelfDesign(){
    //   const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
    //   if(allServicesInfo.self_designing_info.id == null){
    //     this.isSelfDesignPopupVisible = true;
    //   }
    //   else{
    //     this.isNewDesignModalVisible = true
    //   }
    // },
    fetchGoogleMapsImage(designId) {
        // this.isImageBeingApplied = true;
        const groundImageData = {
            url: `https://maps.googleapis.com/maps/api/staticmap?center=${useMapImagesStore().latitude},${useMapImagesStore().longitude}&scale=2&zoom=${useMapImagesStore().zoomLevel}&maptype=satellite&size=${useMapImagesStore().dimensions}x${useMapImagesStore().dimensions}&key=${GOOGLE_API_KEY}`,
            imageType: 'map',
            rotation: 0,
            scale: 0,
            offset: [0, 0],
            source: 'google_maps',
            zoom: useMapImagesStore().zoomLevel,
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
    shareSiteSurveyLink() {
      this.isSiteSurveyLinkVisible = true;
    },
    async generateSiteSurveyLink() {
      this.isSiteSurveyLinkVisible = true;
      this.viewSiteSurveyLink = true;
      try{
        let response = await API.SITE_SURVEY_LINK.FETCH_SITE_SURVEY_LINK();
        this.siteSurveyToken = response.data.token;
        this.siteSurveyLinkUrl = response.data.url;
        await API.PROJECTS.PATCH_PROJECT(this.projectInformation.id, {site_survey_token: this.siteSurveyToken})
      }
      catch(e){
        console.error("error",e);
      }
    },
    async openMedia() {
      const surveyData = this.siteSurveyToken;
      const URL = `${DATABASE_URL}api/site-survey-details/${surveyData}/`;
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const { token } = user;

      const myHeaders = new Headers();
      myHeaders.append("authorization", `Token ${token}`);
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      await fetch(URL, requestOptions)
					.then(response => response.text())
					.then(result => {
            const data = JSON.parse(result);
            if (data.site_survey_details.length === 0 && this.closeEmptySiteSurveyPopUp) this.emptySiteSurvey = true;
          });
      if (surveyData && !this.emptySiteSurvey) {
        const routeData = this.$router.resolve({ name: 'mediaBox', params: { surveyId: surveyData } });
        window.open(routeData.href, '_blank');
      }
    },
    orderServiceURL() {
      if (this.$route.name === "orderService") {
        const serviceId = this.$route.params.serviceId;
        const service = this.orderServicesTypes.find(
          (el) => el.id == serviceId
        );
        if (service) {
          this.isOrderService = true;
          this.payNowPopupVisible(service.detailedService);
        } else {
          this.$message({
            showClose: true,
            message: "No service were found.",
            type: "error",
            center: true,
          });
        }
      }
    },

    scrollToOrderServiceDiv() {
      console.log('scroll to order service div function ran')
      if (this.isOrderService) {
        document.getElementById("order_service").scrollIntoView();
      }
    },
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),
    OrderSelfDesign(objPass){
      this.handleNewDesignCreation(objPass);
    },
    async getData() {
      if(this.$props.isSelfDesignPopup) {
        var reqSelfDesign = this.$props.isSelfDesignPopup;
        let response = await API.SELF_DESIGN.FETCH_SELF_DESIGN(reqSelfDesign);
        let data = response.data;
      }
    },

    async getCorrespondingProjectID(){
      let response;
      this.isButtonLoading = true;
      response = await API.ARKA.GET_PROJECT_ID_FOR_ARKA(this.projectId);
      response = await response.json();  //As it is a stream Data
      const arkaProjectID = response['message']['project_ID'];
      if(arkaProjectID){
        window.location.href = `${SL360_URL}projects/${arkaProjectID}`; 
      }
      else{

        //------------------------Now POST PROJECT API FOR ARKA IF THIS DESIGN IS OLD AND DOES NOT EXIST FOR ARKA(Fallback)---------------//
        let postDataForArka = {
          "latitude": this.projectInformation.latitude,
          "longitude": this.projectInformation.longitude,
          "address": this.projectInformation.clientAddress,
          "gmaps_address_string":this.projectInformation.clientAddress,
          "tsl_project_ID":this.$route.params.projectId,
          "first_name":this.projectInformation.clientName,
          "last_name": null,
          "phone_number":  this.projectInformation.clientPhone,
          "email":this.projectInformation.clientEmail,
          "project_name":  this.projectInformation.projectName ,
        }
        if(this.isSL360User){
          let response1 = await API.ARKA.CREATE_PROJECT_FOR_ARKA(postDataForArka);
          response1 = await response1.json();  //As it is a stream Data
          let arkaProjectID = response1['message']['project']['project_ID'];
          window.location.href = `${SL360_URL}projects/${arkaProjectID}`; 

        }
        //---------------------------------------------------------------------------------------------//
      }
      this.isButtonLoading = false;
    },
    
    selfDesignPopupVisible(data) {
      // this.isSelfDesignPopupVisible = true;
      this.buttonclickedNEW = data;
      const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
      if(allServicesInfo.self_designing_info.id == null){
        this.isNewDesignModalVisible = true;
      }
      else{
        this.isSelfDesignPopupVisible = true;
      }
    },

    allServiceInfo() {
      const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
      if(allServicesInfo) {
        for(let i = 0; i < allServicesInfo.service_templates.length; i++) {
          this.orderServicesTypes.push({
            id: allServicesInfo.service_templates[i].id,
            serviceName: allServicesInfo.service_templates[i].template_constant[0].name,
            description: allServicesInfo.service_templates[i].template_constant[0].description,
            detailedService: allServicesInfo.service_templates[i],
            basePrice: allServicesInfo.service_templates[i].base_price,
          });
        }
        allServicesInfo['selfDesigningInfo'] =  allServicesInfo.self_designing_info;
        this.selfDesignInfo = allServicesInfo['selfDesigningInfo'];
      }
    },

    openDownloadFilePopup(design){
      this.requestObjIdForDownloadFile = design.request_expert_service.id;
      this.isDownloadFilesPopupVisible = true;
    },
    confirmRevisionNote(isConfirm){
      if(isConfirm){
        this.getProjectDetails();
      }
      
    },
    timeIsUpForCancellation(createdAt){
      if( (((this.currentTimestamp()) - (this.createdTimestamp(createdAt))) / 1000 / 60) > this.oneHour){
        return true;
      }
      else 
      return false;
    },
    timeIsUpForRevisionCancellation(createdAt){
      if( (((this.currentTimestamp()) - (this.createdTimestamp(createdAt))) / 1000 / 60) > this.oneHour){
        return true;
      }
      else 
      return false;
    },
    isStatusIdServiceTypeNotNull(design){
      if(!design.request_expert_service)
      return false;
      if( (design.request_expert_service.id !== null) && 
          (design.request_expert_service.order_status !== null) &&
          (design.request_expert_service.service_type !== null)){
          return true;
      }
      else 
      return false;
    },
    isItInCompleteColor(design){
      if(!design.request_expert_service)
      return false;
      let status = design.request_expert_service.order_status;
      if(['incomplete','rejected','cancelled'].includes(status))
      return true;
      else 
      return false;
    },
    isStatusInprocess(design){
      if(!design.request_expert_service)
      return false;
      let status = design.request_expert_service.order_status;
      if(status=='in_process')
      return true;
      else 
      return false;
    },
    isStatusOrderPlaced(design){
      if(!design.request_expert_service)
      return false;
      let status = design.request_expert_service.order_status;
      if(status=='order_placed')
      return true;
      else 
      return false;
    },
    isStatusComplete(design){
      if(!design.request_expert_service)
        return false;
      let status = design.request_expert_service.order_status;
      if(status=='complete')
        return true;
      else 
        return false;
    },
    isStatusRejected(design){
      if(!design.request_expert_service)
      return false;
      let status = design.request_expert_service.order_status;
      if(status=='rejected')
      return true;
      else 
      return false;
    },
    isStatusCancelled(design){
      if(!design.request_expert_service)
      return false;
      let status = design.request_expert_service.order_status;
      if(status=='cancelled')
      return true;
      else 
      return false;
    },
    convertDateFormat(date,time) {

      //--------------------------taking time and converting to desired Date--------------------//
      // TODO : need to make a common function for date in the utils file and use it everywhere
      let curDate = time.split("T")[0];
      curDate = new Date(curDate);
      curDate = curDate.toDateString();
      let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
      let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
      let dt = `${curDate[8]}${curDate[9]}`;
      let modifiedDate = `${dt} ${month} ${year}`;
      //-----------------------------------------------------------------------------------------// 

      //------------------Here using Date object -----------------------------------------//
      let objToday = date;
      let curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours());
      let curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes();
      let curMeridiem = objToday.getHours() > 12 ? "PM" : "AM";
      let timezone = objToday.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4).match(/\b(\w)/g).join('');
      return curHour + ":" + curMinute+ " "+ curMeridiem + " " + timezone + " " +   modifiedDate;
      //----------------------------------------------------------------------------------------------------//
    },
    addOneHourNew(time) {
      let date = new Date(time);
      date.setHours(date.getHours() + 1); // add 1 hour to this date
      return this.convertDateFormat(date,time);  
    },

    addZero(num) {
      if (num <= 9) {
        return "" + 0 + num;
      } else {
        return num;
      }
    },

    currentTimestamp() {
      var mydate = new Date().valueOf();
      return mydate;
    },
    currentTimestampNew() {
      var mydate = new Date().valueOf();
      this.currentTime = mydate;
    },

    createdTimestamp(ts) {
      let mydate = new Date(ts).valueOf();
      return mydate;
    },

    openRequestRevisionPopup(reqObj, featuresArray) {
      this.revision_notes = [];
      if (reqObj.revision_notes) {
        this.revision_notes = reqObj.revision_notes;
      }
      this.featuresArray = featuresArray;
      this.order_type = reqObj.site_size ? reqObj.site_size : reqObj.delivery_type;
      if (reqObj.available_revisions) {
        this.available_revisions = reqObj.available_revisions;
      }
      this.res_id = reqObj.id;
      this.requestServiceType = reqObj.service_type;
      this.isRequestRevisionPopupVisible = true;
    },
    openCancelOrderPopup(requestExpertService) {
      this.res_id = requestExpertService.id;
      this.service_type = requestExpertService.service_type;
      this.cancel_site_size = requestExpertService.site_size;
      this.cancel_delivery_type = requestExpertService.delivery_type;
      this.isCancelOrderPopupVisible = true;
      this.cancelOrderCase = true;
    },
    openCancelRevisionPopup(requestExpertService) {
      this.res_id = requestExpertService.id;
      this.service_type = requestExpertService.service_type;
      this.cancel_site_size = requestExpertService.site_size;
      this.cancel_delivery_type = requestExpertService.delivery_type;
      // this.isCancelRevisionPopupVisible = true;
      this.isCancelOrderPopupVisible = true;
      this.cancelRevisionCase = true;
    },
    async  fetchLatestWeatherOnceAgain(){
      this.weatherFiles = await this.fetchWeatherFiles(
        this.projectInformation.latitude,
        this.projectInformation.longitude
      );
      this.fetchSelectedStation(this.projectInformation.weather);
    },
    async updateWeatherFile(){
       this.weatherFiles = await this.fetchWeatherFiles(
          this.projectInformation.latitude,
          this.projectInformation.longitude
        );
       this.fetchSelectedStation(this.projectInformation.weather);
    },
    sendRejectionReasonMessage(rejectionMessage,cancellationMessage,status){
      this.rejectionReasonMessage = rejectionMessage;
      this.cancelReasonMessage = cancellationMessage;
      this.orderStatus = status;
      this.isRejectionReasonPopupVisible=true;
    },
    ...mapActions(useDesignStore, {
      STORE_DESIGN_VERSION: "STORE_DESIGN_VERSION",
      SET_DESIGN: 'SET_DESIGN',
    }),
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    async leadToStudio(design,index,type) {
      let designId = design.id;
      // let index = Object.keys(this.designDetails).find(key => this.designDetails[key] === design);
      this.currentDesign = designId;
      this.isOpeningStudio = true
      try {
        // for object reactivity
        if(type=='expertServiceDesign')
          this.$set(
            this.expertServiceDesignThumbnailsData[index],
            "isDesignBeingLoaded",
            true
          );
        else if(type=='selfDesign')
        this.$set(
            this.selfDesignThumbnailsData[index],
            "isDesignBeingLoaded",
            true
          );
        const response = await API.DESIGNS.FETCH_DESIGN(designId);

        if (response.data.versions !== null) {
          await this.STORE_DESIGN_VERSION(response);
          this.$router.push({ name: "studio", params: { designId } });
        } else {
          // create new design version and push to studio
          const postData = {
            scene: null,
            notes: null,
            design: designId,
          };
          await API.DESIGN_VERSIONS.POST_DESIGN_VERSION(postData);
          // send it to the studio app
          this.$router.push({ name: "studio", params: { designId } });
        }
      } catch (e) {
        // for object reactivity
        if(type=='expertServiceDesign')
          this.$set(
            this.expertServiceDesignThumbnailsData[index],
            "isDesignBeingLoaded",
            false
          );
        else if(type=='selfDesign')
        this.$set(
            this.selfDesignThumbnailsData[index],
            "isDesignBeingLoaded",
            false
          );
        console.error("ERROR: FetchDesign", e);
      }
      this.isOpeningStudio = false
    },

    onDesignClickHandler(designId) {
      this.$router.push({ name: "designSummary", params: { designId } });
    },

    thumbnailHeightSetter() {
      // returning an array and using the width of the first element
      const thumbnailWrapperWidth = document.getElementsByClassName(
        "added_design"
      )[0].clientWidth;
      const viewportWidth = window.innerWidth;
      this.thumbnailHeight = `${
        (thumbnailWrapperWidth / viewportWidth) * 100
      }vw`;
    },

    getDesignThumbnails() {
      for (let i = 0; i < this.selfDesigns.length; i += 1) {
        this.thumbnail.url = this.staticImageUrl;
        this.thumbnail.id = this.selfDesigns[i].id;
        this.thumbnail.isLoading = true;
        API.DESIGNS.FETCH_DESIGN_LAYOUT(this.selfDesigns[i].id)
          .then((response) => {
            if (response.data !== "")
              this.selfDesignThumbnailsData[i].url = response.data;
          })
          .catch(() => {
            console.error();
          })
          .then(() => {
            this.selfDesignThumbnailsData[i].isLoading = false;
          });
        this.selfDesignThumbnailsData.push({ ...this.thumbnail });
      }
      for (let i = 0; i < this.expertServiceDesigns.length; i += 1) {
        this.thumbnail.url = this.staticImageUrl;
        this.thumbnail.id = this.expertServiceDesigns[i].id;
        this.thumbnail.isLoading = true;
        API.DESIGNS.FETCH_DESIGN_LAYOUT(this.expertServiceDesigns[i].id)
          .then((response) => {
            if (response.data !== "")
              this.expertServiceDesignThumbnailsData[i].url = response.data;
          })
          .catch(() => {
            console.error();
          })
          .then(() => {
            this.expertServiceDesignThumbnailsData[i].isLoading = false;
          });
        this.expertServiceDesignThumbnailsData.push({ ...this.thumbnail });
      }
      this.areThumbnailsVisible = true;
      // Required to ensure that thumbnailHeightSetter is able to execute properly
      this.$nextTick(() => this.thumbnailHeightSetter());
    },
    openProjectEditForm() {
      this.isEditFormOpen = !this.isEditFormOpen;
      if(this.isEditFormOpen)
      this.editprojectInformation()
    },
    openPopupToDuplicate(design) {
      // this.designIndexToDuplicate = Object.keys(this.designDetails).find(key => this.designDetails[key] === design) - 1;
      this.designIndexToDuplicate = this.selfDesigns.indexOf(design);
      this.duplicateDesignName = this.selfDesigns[this.designIndexToDuplicate].name + ' (Copy)';
      this.isDuplicatePopupOpen = true;
    },
    async fetchSelectedStation(weatherId) {
      if (this.projectInformation.weather !== null) {
        try {
          let response = await API.MASTER_DATA_WEATHER.FETCH_SELECTED_STATION(
            weatherId
          );
          this.selectedWeatherStation = {
            id: response.data.id,
            format: response.data.format,
            siteName: response.data.site_name,
            latitude: parseFloat(response.data.latitude).toFixed(3),
            longitude: parseFloat(response.data.longitude).toFixed(3),
            source: response.data.source,
          };
        } catch (e) {}
      }
    },
        
    async duplicateDesign() {
      const designInfoTOduplicate = this.selfDesigns[this.designIndexToDuplicate];
        try {
          this.isDuplicatingDesign = true;
          const newDesignId = await API.DESIGNS.DUPLICATE_DESIGN(designInfoTOduplicate.id, this.duplicateDesignName);
          const name = this.duplicateDesignName;
          const id = newDesignId.data;
          this.selfDesignThumbnailsData.unshift(this.selfDesignThumbnailsData[this.designIndexToDuplicate]);
          this.designDetails.unshift({
            name,
            id,
            'distance_unit': designInfoTOduplicate.distance_unit,
            'modified_by': designInfoTOduplicate.modified_by,
            'versions': designInfoTOduplicate.versions
          });
          // this.$router.go(0);
        }
        catch (error) {
          let errorMessage = error.response.status === 403 ?
          "You don't have permission to edit this project."
          : "Error duplicating design. Try again."
          this.isDuplicatingDesign = false;
          // Error message
          this.$message({
            showClose: true,
            message: errorMessage,
            type: 'error',
            center: true
          });
        }
        
        // setTimeout is required because router.go takes time to route,
        // before that button gets re-enabled.
        setTimeout(() => {
          this.isDuplicatingDesign = false;
          this.isDuplicatePopupOpen = false;
        });
    },
    async deleteProject() {
      if(this.isCurrentUserAllowedToEdit){
        this.showlogoutconfirmbox = true;
        this.isDeleteProjectPopupOpen = true;
      }
      else
      this.$toastr.e("You don't have permission to delete this project"); 

      // let is_user_permitted = await this.checkUserpermission();
      // if (is_user_permitted) {
      //   this.showlogoutconfirmbox = true;
      //   this.isDeleteProjectPopupOpen = true;
      // }
      // else
      //   this.$toastr.e("You don't have permission to delete this project");      
    },

    async actualDelete(){

      let is_user_permitted = await this.checkUserpermission();
      try{
        await API.PROJECTS.DELETE_PROJECT(this.projectId);
        this.isDeleteProjectPopupOpen = false;
         this.redirectToHomeBasedOnCountry();
        // this.$router.push({ name: "home" });
        this.$message({
            showClose: true,
            message: "Project deleted successfully.",
            type: "success",
            center: true
          });
      }
        catch (error) {
          this.$message({
            showClose: true,
            message: "Failed to delete project.",
            type: "error",
            center: true
          })
        }
    },

    async checkUserpermission() {
      const user = JSON.parse(localStorage.getItem('user'));
      const currUserId = user.user_id;
      let currentUserEditPermission = false;
      this.project_id = this.projectId.toString();
      const response = await API.PROJECTS.FETCH_PROJECT_PERMISSIONS(this.project_id);
      const users = JSON.parse(JSON.stringify(response.data));

      // IT means it is publicly shared So I have the permisison to delete
      if(Array.isArray(response.data) && response.data.length==0){
        currentUserEditPermission = true;
        return true;
      }
      // checking if current user has permission to modify sharing permissions
      users.forEach((item) => {
          if (
              item.user.id === currUserId &&
              item.permission== 'change'
          ) {
              currentUserEditPermission = true;
              return true;
          }
      });
      return currentUserEditPermission;

      // // slicing current user. Users list is also modified here
      // let isPublicShared = response.data.organisation.length > 0;
      // if (isPublicShared || currentUserEditPermission) {
      //   return true
      // } else {
      //   return false;
      // }
    },
    async updateProjectDetails() {
            this.areProjectDetailsBeingEdited = true
            const patchData = {
                name: this.editFormInput.projectName,
                client_name: this.editFormInput.clientName,
                client_phone: this.editFormInput.clientPhone,
                client_address: this.editFormInput.clientAddress,
                client_email_id: this.editFormInput.clientEmail,
                quota_type: 'Residential',//this.editFormInput.quotaType,
                country: 'India',//this.editFormInput.country,
            };
            // if (this.exchangeRateType === exchangeRateTypes.custom && this.currencyCodeChanged) {
                patchData.conversion_factor = Number(1.0);
            // }
            await this.UPDATE_PROJECT_INFORMATION(patchData);
            // calling it separately to avoid name confusion
            this.isEditFormOpen = false
            this.areProjectDetailsBeingEdited = false;
        },
        editprojectInformation(){
           setTimeout(() => {
           this.editFormInput.projectName = this.projectInformation.projectName;
           this.editFormInput.clientName = this.projectInformation.clientName;
           this.editFormInput.clientPhone = this.projectInformation.clientPhone;
           this.editFormInput.clientEmail = this.projectInformation.clientEmail;
           this.editFormInput.clientAddress = this.projectInformation.clientAddress;
           }, 0)
        },
        async fetchExpertServicePermission(){
          const user = JSON.parse(localStorage.getItem('user'));
          this.country=user.country;
          // const response = await API.ORGANISATION.FETCH_EXPERT_SERVICE_PERMISSION(user.organisation_id);
          let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
          if(!Object.keys(responseData).length){
            responseData = ( await API.ORGANISATION.FETCH_EXPERT_SERVICE_PERMISSION(user.organisation_id)).data;
          }
          this.isExpertServiceEnabled = responseData.is_expert_service_enabled;
          this.expertServicePermissionFetched=true;
        },
        payNowPopupVisible(data) {
          this.buttonclickedNEW = data;
          this.buttonclicked = data.template_constant.name;
          this.isPayNowPopupVisible = true;
        },



  //-----------------------------------------------------------------Order 3D Model Functionality----------------------------------------------------------------------------//
         async initiateAfterPaymentPart(){
              if(this.$route.params.orderServiceType==='3DModelling' ||this.$route.params.orderServiceType==='ExpertProposal'
              || this.$route.params.orderServiceType==='OrderPermit' ){
                await this.fetchAllProfiles();
                await this.handleNewDesignCreation();
              }
          },
          async fetchAllProfiles() {
            try {
                const response = await API.DEFAULTS_PROFILE.FETCH_ALL_PROFILES();
                this.allProfiles_ = JSON.parse(JSON.stringify(response.data.results));
                if (this.allProfiles_.length > 0) {
                    this.selectedProfile = this.allProfiles_[0];
                }
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in fetching defaults userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        // TODO: Need to cleanup this function 
        async handleNewDesignCreation(objPass) {
                try {
                    this.isDesignGettingCreated = true;
                    var postData = this.getPostDataForDesignCreation(objPass);
                    var response = ""
                    if(objPass.isSelfDesign == true){
                       postData["use_promotional_credits"] = objPass.use_promotional_credits
                       postData["features"]=objPass.avilFeaturesIds
                      response =  await API.SELF_DESIGN.CREATE_NEW_SELF_DESIGN(postData,objPass.isSelfDesign);
                      this.setCreditBalance({
                        purchased_credits: response.data.credits.purchased_credits,
                        promotional_credits: response.data.credits.promotional_credits
                      })     
                    }else{
                      response = await API.DESIGNS.CREATE_NEW_DESIGN(postData);
                    }
                    const designVersionSettingsId = response.data.versions.setting.id;
                    const designId = response.data.id;
                    await this.SET_DESIGN(designId);
                    // await API.FETCH_MAP.POST_MAP_IMAGE(this.fetchGoogleMapsImage(designId));
                    if( this.$route.params.orderServiceType==='OrderPermit'){
                       await this.getSurveyInfo();
                    }
                    await this.getProjectDetails();
                    let link;
                    if( this.$route.params.orderServiceType==='OrderPermit'){
                      link = `${SITE_SURVEY_LINK}${this.surveyInfo.path}/tsl`
                      // link = 'https://tsl-survey-tool.azurewebsites.net'+ this.surveyInfo.path+'/tsl';
                      await this.postPermitInfo(link);
                    }
                    // else{
                    //   await this.post3dModelOrderInfo();
                    // }

                    if( this.$route.params.orderServiceType==='OrderPermit'){
                      window.open(link,'_blank');
                    }

                    this.isDesignGettingCreated = false;
                    this.getDesignThumbnails(); 
                     this.isSelfDesignPopupVisible = false   
                }
                catch (e) {
                    
                    this.handleDesignCreationError(e);
                    this.isSelfDesignPopupVisible = false
                    this.isDesignGettingCreated = false;
                }   
        },

        getPostDataForDesignCreation(objPass) {
           const user = JSON.parse(localStorage.getItem('user')) || {};
            const userId = user.user_id;
          
            if(objPass.isSelfDesign == true){
              return {
                  name: (this.selfDesigns.length+1) + '. Self Design',
                  project: this.$route.params.projectId,
                  created_by: userId,
                  modified_by: userId,
              };
            }else if(this.$route.params.orderServiceType==='3DModelling'){
              return {
                  name: (this.designDetails.length+1) + '. 3D Model Request',
                  project: this.$route.params.projectId,
                  created_by: userId,
                  modified_by: userId,
              };
            }
            else if(this.$route.params.orderServiceType==='ExpertProposal'){
              return {
                  name: (this.designDetails.length+1) + '. Expert Proposal Request',
                  project: this.$route.params.projectId,
                  created_by: userId,
                  modified_by: userId,
              };
            }
            
            else{
              return {
                  name: (this.designDetails.length+1) + '. Permit Request',
                  project: this.$route.params.projectId,
                  created_by: userId,
                  modified_by: userId,
              };
            }
        },

        async getSurveyInfo() {
        const projectIdObj = {
              projectId: this.$route.params.projectId,
        };
            try {
                const response = await API.DESIGNS.FETCH_SURVEY_INFO(projectIdObj);
                this.surveyInfo.path = response.data.path;
                this.surveyInfo.surveyId = response.data.surveyId;
            }
            catch (e) {
                console.error();
            }
        },

        async getProjectDetails() {
          this.isProjectBeingLoaded = false;
            try {
              await this.GET_CURRENT_PROJECT(this.$route.params.projectId);
              this.isProjectBeingLoaded = true;
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
                  this.redirectToHomeBasedOnCountry();
                  // this.$router.push({ name: "home" });
                }, 2000);
              }
            }
        },

        async postPermitInfo(link) {
            const user = JSON.parse(localStorage.getItem("user"));
            const postData ={
                     'user_id': user.user_id,
                      'organisation_id': user.organisation_id,
                      'user_token': null, 
                      'design_id': this.designDetails[this.designDetails.length-1].id,
                      'project_id': this.$route.params.projectId,
                      'surveyId': this.surveyInfo.surveyId,
                      'service_type': 'Permit',
                      'notes': null,
                      'additional_info' :  {
                          'survey_form_url' : link,
                          },
                      'revision_no' : null,
                      'created_at' : null,
                      'modified_at' : null, 
                      'completed_time' : null,
                      'delayed_by' : null,
                      'completed' : null,
                      'total': this.$route.params.totalPrice,
                };
            try {
                const response = await API.DESIGNS.POST_DESIGN_SERVICE_INFO(postData);
            }
            catch (e) {
                console.error();
            }
        },

          async post3dModelOrderInfo() {
                  const user = JSON.parse(localStorage.getItem("user"));
                  let postData;
                  if(this.$route.params.orderServiceType==='3DModelling'){
                       postData ={
                              'user_id': user.user_id,
                                'organisation_id': user.organisation_id,
                                'user_token': null, 
                                'design_id': this.designDetails[this.designDetails.length-1].id,
                                'project_id': this.$route.params.projectId,
                                'surveyId': null,
                                'service_type': '3D_modeling',
                                'notes': this.notes,
                                'additional_info' : null,
                                'revision_no' : null,
                                'created_at' : null,
                                'modified_at' : null, 
                                'completed_time' : null,
                                'delayed_by' : null,
                                'completed' : null,
                      };
                  }
                  else if(this.$route.params.orderServiceType==='ExpertProposal'){
                      postData ={
                        'user_id': user.user_id,
                          'organisation_id': user.organisation_id,
                          'user_token': null, 
                          'design_id': this.designDetails[this.designDetails.length-1].id,
                          'project_id': this.$route.params.projectId,
                          'surveyId': null,
                          'service_type': 'Proposal',
                          'notes': this.notes,
                          'additional_info' : {
                            'moduleId' : this.$route.params.panelId,
                            'inverterId' : this.$route.params.inverterId,
                          },
                          'revision_no' : null,
                          'created_at' : null,
                          'modified_at' : null, 
                          'completed_time' : null,
                          'delayed_by' : null,
                          'completed' : null,
                      };

                  }
                  try {
                      const response = await API.DESIGNS.POST_DESIGN_SERVICE_INFO(postData);
                      }
                  catch (e) {
                      console.error();
                  }
          },

         handleDesignCreationError(e) {
            let errorMessage = 'Error in creating design. Try again';
            if (e.response.status === 302) {
                errorMessage = this.ERROR_MESSAGE_QUOTA_EXHAUSTED;
            }
            this.$message({
                showClose: true,
                message: errorMessage,
                type: 'error',
                center: true
            });
            this.isDesignGettingCreated = false;
        },
        openShareProjectPopup(){
          if(this.isCurrentUserAllowedToEdit)
          this.shareDialogBoxVisible = true;
          else{
            this.$toastr.e("You don't have permission to share this project");
          }
        },

    //--------------------------------------------------------------Order 3D Model Functionality END----------------------------------------------------------------------------//
    getOrderStatusColor,
  },

  watch: {
    projectInformation: {
      deep: true,
      immediate: true,
      async handler(value) {
        this.countryCode=value.country_details.country_code;
        this.weatherFiles = await this.fetchWeatherFiles(
          this.projectInformation.latitude,
          this.projectInformation.longitude
        );
       this.fetchSelectedStation(this.projectInformation.weather);
      },
    },
    siteSurveyToken: {
      deep: true,
      immediate: true,
      handler(value) {
        if (value) {
          this.viewSiteSurveyLink = true;
        }
        else {
          this.viewSiteSurveyLink = false;
        }
      },
    },
    designDetails: function () {
      // to ensure that call is not sent again when forms are edited and not sent in case of no designs
      if (!this.areThumbnailsVisible && this.designDetails.length > 0) {
        this.getDesignThumbnails();
      }
    },
  },
};
</script>

<style scoped>
.no_designs_class{
  margin-bottom : 10px;
}

.disable_design {
  opacity: 0.5;
  pointer-events: none;
}

.backLink{
  color: #777777;
  font-size: 14px;
}
.backLink:hover {
  cursor: pointer;
   color: #1c3366;
}
* {
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font);
}
.icon_size_header {
  font-size: 30px;
  cursor: pointer;
  outline: none;
  border: transparent;
  background-color: transparent;
  margin-left: -15px;
}

.icon_size_header:hover {
  font-weight: bold;
}
.projectSummaryHeading {
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 0 10px 0;
}
button {
  overflow: visible;
  color: inherit;
  font: inherit;
  margin: 0;
}
button:focus {
  outline: none;
  text-transform: none;
  -webkit-appearance: button;
  cursor: pointer;
}
button:focus::-moz-focus-inner {
  border: 0;
  padding: 0;
}
figure,
section {
  display: block;
}

figure {
  margin: 0;
}

strong {
  font-weight: bold;
}

small {
  font-size: 100%;
}

img {
  border: 0;
  max-width: 100%;
}

input {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
input:focus {
  outline: none;
}
input:focus::-moz-focus-inner {
  border: 0;
  padding: 0;
}

textarea {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
textarea:focus {
  outline: none;
  overflow: auto;
}

input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}

button[disabled] {
  cursor: default;
}
.modal.modal_form .modal-wrapper .modal-content .modal-header,
.card .card_header {
  background-image: linear-gradient(to bottom, #E8EDF2, #e9ecf2);
}

body.modal-open {
  overflow: hidden;
}

.scroll_content {
  /* overflow-y: auto; */
  overflow-x: hidden;
  padding: 0 24px 24px;
  position: relative;
}

.expertServiceContainer {
  display: flex;
  width: 100%;
  gap: 2%;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-bottom: 0px !important;
}

.containerOne,
.containerTwo,
.containerThree {
  width: 32%;
  border-radius: 4px;
  border: 1px solid #ccc;
  padding: 20px 15px;
  background-color: #e8edf2;
  margin-bottom: 24px;
}

@media (max-width: 1565px) {
  .containerOne,
.containerTwo,
.containerThree {
  width: 49%;
}
}




@media (max-width: 723px) {
    .containerOne,
  .containerTwo,
  .containerThree {
    width: 48%;
    margin-bottom: 15px;
  }
}


@media (max-width: 580px) {
  .containerOne,
  .containerTwo,
  .containerThree {
    width: 100%;
    margin-bottom: 15px;
  }
}

.serviceHeading {
  font-size: 18px;
  font-weight: 500;
  color: #1c3366;
  margin-bottom: 12px;
  font-family: "Helvetica Neue";
}

.serviceDesc {
  font-size: 16px;
  font-weight: 100;
  color: #222;
  word-break: break-word;
  min-height: 100px;
  height: auto;
}
.serviceBtn {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  margin: 19px auto 8px auto;
}

@media (max-width: 1280px) {
  .scroll_content {
    padding-bottom: 6px;
  }
}

.modal-wrapper {
  position: absolute;
  z-index: 999;
  left: 50%;
  top: 50%;
  max-width: 704px;
  width: 100%;
  margin: 32px 0;
  transform: translate(-50%, -50%);
}

.modal {
  position: fixed;
  z-index: 10000;
  /* 1 */
  top: 0;
  left: 0;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
  overflow: auto;
}
.modal .modal-content {
  padding: 32px 24px 24px;
  background-color: var(--white);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.35);
  border-radius: 12px;
  position: relative;
}
@media (max-width: 1280px) {
  .modal .modal-content {
    max-width: calc(100% - 48px);
    margin: auto;
  }
}
.modal .modal-close {
  background: transparent;
  border: 0;
  position: absolute;
  right: 8px;
  top: 12px;
  cursor: pointer;
}
.modal .modal-close:focus {
  outline: none;
}
.modal .modal-header {
  padding: 24px;
}
.modal.modal_form .modal-wrapper {
  max-width: 500px;
  margin: 0;
}
.modal.modal_form .modal-wrapper .modal-content {
  padding: 0;
}
.modal.modal_form .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.modal_form .modal-wrapper .modal-content .inside_form {
  padding: 0 24px 16px;
}
.modal-overlay {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* visibility: hidden; */
  opacity: 0.5;
  transition: background-color 0.5s ease-in;
  transition: opacity 400ms ease-in;
}

/****  floating-Lable style end ****/
.floating-label {
  position: relative;
  margin-bottom: 30px;
}
.floating-label label {
  color: var(--step-200);
  font-size: 14px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 16px;
  top: 12px;
  transition: 0.2s ease all;
}

.floating-input {
  font-size: 14px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 40px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}
.floating-input:focus {
  outline: none;
}
.floating-input:focus ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}
.floating-input:focus ~ .bar:before {
  width: 50%;
}
.floating-input:focus ~ .bar:after {
  width: 50%;
}
.floating-input:focus ~ .highlight {
  animation: inputHighlighter 0.3s ease;
}
.floating-input:not(:placeholder-shown) ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}

.floating-textarea {
  min-height: 70px;
  max-height: 260px;
  overflow: hidden;
  overflow-x: hidden;
  resize: none;
}

.modal_form .scroll_content {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding: 20px 0 6px;
}

.modal_form .button_area .btn {
  width: 100%;
}

.floating-label.right_value .floating-input {
  padding-right: 70px;
}
.edit-alt{
  font-size: 1.5rem;
}
.floating-label.right_value .value_area {
  position: absolute;
  right: 12px;
  top: 13px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--step-200);
}
.floating-label.right_value .value_area .fas {
  font-size: 12px;
  margin-left: 4px;
  cursor: pointer;
}

@media (max-width: 1280px) {
  body {
    font-size: 14px;
  }
}

h4 {
  font-weight: 500;
}

.btn {
  color: var(--dark);
  background-color: var(--step-0);
  border: 1px solid var(--step-150);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  font-size: var(--f14);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.55rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  box-shadow: 0 1px 2px 0 var(--step-150);
}
@media (max-width: 767px) {
  .btn {
    padding: 6px 8px;
  }
}
.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092F7);
  color: var(--white);
}
.btn.btn-primary:disabled {
  background-image: linear-gradient(
    to bottom,
    var(--light-gray),
    var(--step-100)
  );
  border-color: var(--step-100);
}
.btn.outline_danger {
  border: 1px solid var(--danger);
  background: var(--white);
  padding: 8px 14px;
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
  box-shadow: none;
}

.main-controller .right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}

.main-controller .backdrop {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: all ease-in-out 0.35s;
  visibility: hidden;
  z-index: -21;
}

@media (max-width: 1280px) {
  .main-controller.expended .backdrop {
    opacity: 1;
    visibility: visible;
    z-index: 21;
  }
  .main-controller.expended .aside_setion {
    transform: translateX(0);
    box-shadow: 0 40px 40px 0 var(--medium);
  }
}


@media (max-width: 767px) {
  .content_section {
    overflow: hidden;
  }
}
@media (min-width: 1281px) {
}
@media (max-width: 767px) {
  .content_section {
    min-height: calc(100vh - 56px);
  }
}
@media (min-width: 768px) {
  .content_section.dashboard_section {
    padding: 32px;
  }
}
.content_section .breadcrumb {
  margin-bottom: 24px;
}
.content_section .breadcrumb .breadcrumb_items {
  display: flex;
  overflow-x: auto;
}
.content_section .breadcrumb .breadcrumb_items li a {
  white-space: nowrap;
  font-size: 14px;
  color: var(--step-200);
  font-weight: 500;
}
.content_section .breadcrumb .breadcrumb_items li:not(:first-of-type):before {
  content: ">";
  margin: 0 4px 0 6px;
  vertical-align: top;
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  color: var(--step-200);
}
.content_section .breadcrumb .breadcrumb_items li.current a {
  color: var(--primary);
}
.content_section .title {
  font-size: var(--f24);
  color: var(--primary);
  flex-flow: 1;
  padding-right: 12px;
}
@media (max-width: 767px) {
  .content_section .title {
    font-size: var(--f16);
    padding-right: 0;
  }
}
.content_section .filter_section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 1280px) {
  .content_section .filter_section {
    flex-wrap: wrap;
  }
}
.content_section .filter_section .head_btn_group .btn {
  box-shadow: none;
  color: var(--danger);
  border-color: var(--danger);
  font-weight: normal;
  margin: 6px 0;
}
@media (min-width: 768px) {
  .content_section .filter_section .head_btn_group .btn:not(:last-child) {
    margin-right: 8px;
  }
}
@media (max-width: 767px) {
  .content_section .filter_section .head_btn_group .btn {
    padding: 8px 10px;
    font-size: 12px;
  }
}
.content_section .filter_section .filter_area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 767px) {
  .content_section .filter_section .filter_area {
    position: fixed;
    top: 12px;
    right: 24px;
    z-index: 432;
    padding-right: 32px;
  }
}
.content_section .filter_section .filter_area .project_btn {
  margin-left: 16px;
}
@media (max-width: 1280px) {
  .content_section .filter_section .filter_area .project_btn {
    display: none;
  }
}
.content_section .filter_section .filter_area .view_type {
  display: flex;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
}
.content_section .filter_section .filter_area .view_type .tab_list {
  border: 1px solid var(--step-100);
  margin-right: -1px;
  overflow: hidden;
  padding: 12px 16px;
  cursor: pointer;
  background-color: var(--white);
  color: var(--step-200);
  transition: all ease-in-out 0.3s;
  display: flex;
  align-items: center;
}
@media (max-width: 767px) {
  .content_section .filter_section .filter_area .view_type .tab_list {
    padding: 8px 12px;
  }
}
.content_section .filter_section .filter_area .view_type .tab_list:first-child {
  border-radius: 4px 0 0 4px;
}
.content_section .filter_section .filter_area .view_type .tab_list:last-child {
  border-radius: 0px 4px 4px 0px;
}
.content_section .filter_section .filter_area .view_type .tab_list span {
  font-size: 15px;
  color: var(--step-200);
}
.content_section
  .filter_section
  .filter_area
  .view_type
  .tab_list
  span.stacklist-icon {
  font-size: 12px;
}
.content_section
  .filter_section
  .filter_area
  .view_type
  .tab_list
  span.list_text {
  margin-left: 8px;
}
@media (max-width: 767px) {
  .content_section
    .filter_section
    .filter_area
    .view_type
    .tab_list
    span.list_text {
    display: none;
  }
}
.backLink.active {
  color: #1c3366;
}
.content_section .filter_section .filter_area .view_type .tab_list:hover,
.content_section .filter_section .filter_area .view_type .tab_list.active {
  background-color: var(--step-100);
  color: var(--white);
}
.content_section .filter_section .filter_area .view_type .tab_list:hover span,
.content_section .filter_section .filter_area .view_type .tab_list.active span {
  color: var(--white);
}
.content_section .filter_section .filter_area .view_type .tab_list.active {
  background-color: var(--primary);
  border-color: var(--primary);
}

/* project summary */
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
.card .card_header {
  padding: 16px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px;
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}
.card .card_header.flex_header {
  display: flex;
  justify-content: space-between;
  height: 48px;
}
.card .card_header.flex_header h4 {
  flex-grow: 1;
  padding-right: 8px;
}
.card .card_header.flex_header .edit {
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  font-size: 16px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
}
.card .card_header.flex_header .edit .icon {
  margin-right: 4px;
  font-size: 24px;
  color: inherit;
}
.card .card_content {
  padding: 24px;
  border-radius: 12px 12px 0 0;
}

.sub_title {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 500;
}

.group_title {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.mngPrjtBtn {
  color: #fff;
  font-weight: 600;
}

.group_title .title_text {
  font-size: 1.5rem;
  font-weight: normal;
  color: var(--primary);
  display: inline-flex;
  padding-right: 8px;
  word-break: break-word !important;
}
.group_title .action_btn {
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}
.group_title .action_btn:focus {
  outline: none;
}
.group_title .icon {
  font-size: 20px;
}

.col_row {
  margin: 0 -16px;
  display: flex;
  flex-shrink: 1;
}

@media (max-width: 1024px) {
  .col_row {
    flex-wrap: wrap;
  }
}
.col_row .col {
  padding: 0 16px;
  flex-grow: 1;
}
@media (min-width: 768px) {
  .col_row .col_4 {
    flex: 0 0 25%;
  }
}
@media (max-width: 767px) {
  .col_row .col_4 {
    flex: 0 0 50%;
  }
}
@media (min-width: 768px) {
  .col_row .col_3 {
    flex: 0 0 33.333%;
  }
}
@media (max-width: 767px) {
  .col_row .col_3 {
    flex: 0 0 50%;
  }
}
@media (max-width: 1024px) {
  .col_row .col.info_col {
    order: 2;
  }
}

.project_summary .title_edit {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.project_summary .title_edit .icon {
  font-size: 22px;
  position: relative;
  top: 2px;
}

.project_summary .graph_area {
  border: 1px solid var(--step-100);
  border-radius: 4px;
}
.project_summary .graph_area > img {
  width: 100%;
  border-radius: 4px;
  display: flex;
}

.project_summary .add_design {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #e8edf2;
  row-gap: 1rem;
  cursor: pointer;
}
.project_summary .add_design strong {
  font-size: 24px;
}

@media (min-width: 768px) {
  .project_summary .design_col {
    max-width: 200px;
  }
}

.project_summary .design_col.design_outer {
  margin-top: 24px;
}
.design_card figure:hover {
  cursor: pointer;
}
@media (min-width: 768px) {
  .project_summary .design_col.design_outer {
    max-width: 242px;
    
  }
  .project_summary .design_col.design_outer .design_card {
    height: 100%;
  }
  .project_summary .design_col.design_outer .design_card figure {
    height: 100%;
  }
  .project_summary .design_col.design_outer .design_card figure img {
    height: 100%;
  }
}

.project_summary .design_card {
  border: 1px solid #ccc;
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
}
.project_summary .design_card figure {
  position: relative;
}
.project_summary .design_card figure img {
  width: 100%;
  object-fit: cover;
  display: flex;
}
.project_summary .design_card figure .btn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 6px 12px;
  font-weight: 400;
  font-size: 12px;
  border-radius: 0;
}

.project_summary .added_design {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 24px;
  margin: 0px !important;
}
.project_summary .added_design .design_card {
  border-radius: 4px;
  max-width: 100%;
  height: 413px;
}
.project_summary .added_design .design_card figure img {
  height: 236px !important;
}
.project_summary .added_design .card_col {
  /* padding: 8px 16px; */
  padding: 0px !important;
  background: #f6fafe;
  position: relative;
  width: 328px;
  height: 413px;
}

.cardHeight{
  height: 300px !important; 
}
.project_summary .added_design .info_design {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px 16px 16px;
  align-items: center;
}
.project_summary .added_design .info_design .name {
  flex-grow: 1;
  font-size: 16px;
  font-weight: normal;
  padding-right: 8px;
  color: var(--step-250);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: inherit;
}
.project_summary .added_design .info_design .name .desLabel{
  color: #777777;
}

/* .project_summary .added_design .info_design .name .desValue{
  color: #222;
} */

.viewMore {
  color: #409eff;
  border: 1px solid #409eff;
  font-size: 12px;
  padding: 3px 8px 2px 4px;
  font-style: italic;
  cursor: pointer;
  margin-left: 4px;
  display: inline;
}

.activityCont{
  margin: 8px 0px 16px 0px;
}

.orderActivity{
  font-style: italic;
  font-size: 16px;
  color: #222;
  text-decoration: underline;
}

.btnCont{
  display: grid;
  grid-template-columns: 45% 54%;
  grid-gap: 8px;
  margin-top: 10px;
}

.btnContTwo{
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.hover_information {
  display: inline-block;
  /* position: relative; */
  margin-left: 16px;
}

.hover_information .exclamation {
  cursor: pointer;
}

.tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 360px;
  bottom: 14%;
  left: 46%;
  visibility:hidden ;
  opacity: 0;
  transition: all ease-in-out 0.35s;
  z-index: 100;
  white-space: initial;
}

.tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
}
.exclamation:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}


.dwnldBtn{
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding: 8px;
}

.reqRevBtn{
  background-image: linear-gradient(to bottom, #f67153, #f54d27);
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding: 8px;
  border: none;
  margin: 0px !important;
}

.reqRevBtn{
  background-image: linear-gradient(to bottom, #f67153, #f54d27);
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding: 8px;
  border: none;
  margin: 0px !important;
}

.reqRevBtn:disabled{
  background-image: none !important;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding: 8px;
  border: none;
  margin: 0px !important;
}

.cancelBtn{
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding: 8px;
}



.project_summary .added_design .info_design .edit {
  font-size: 20px;
  font-weight: normal;
  color: var(--primary);
  cursor: pointer;
  background-color: #f6fafe;
}

.project_summary .info_item {
  margin: 8px 0;
  max-width: 270px !important;
}
.project_summary .info_item .label {
  font-size: 13px;
  color: var(--step-200);
  display: flex;
  align-items: center;
}
.project_summary .info_item .label .btn {
  margin-left: 4px;
}
.project_summary .info_item .label .btn.outline_danger {
  padding: 4px 12px;
  font-size: 12px;
}
.project_summary .info_item .value {
  font-size: 14px;
  color: var(--step-250);
  margin-top: 6px;
  width: 16ch;
  word-break: break-word !important;
}
@media (max-width: 379px) {
  .project_summary .info_item .value{
    width: 11ch;
  }
}
.project_summary .card {
  margin-top: 24px;
}

.project_summary .col_row .col_2 {
  width: 100%;
}
@media (min-width: 1281px) {
  .project_summary .col_row .col_2 {
    max-width: 750px;
  }
}

.project_summary .col_row .col_1 .design_card {
  margin-top: 24px;
  max-width: 400px;
}

.project_summary .col_row ~ .graph_area {
  margin-top: 16px;
}

.project_summary .add_price_td {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  padding-top: 12px;
}
.project_summary .add_price_td p {
  font-size: 14px;
  font-weight: normal;
  line-height: 1.57;
  color: var(--step-250);
  margin-bottom: 24px;
}
.action_btn{
  background-color: var(--white);
  padding: 8px;
  border: 1px solid var(--step-100);
  box-shadow: none;
  min-width: 32px;
  height: 32px;
  transition: all ease-in-out 0.35s;
  padding: 6px;
  border: 0;
  color: var(--primary);
}
.group_button{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.project-summary-container .duplicate-design-dialog >>> .el-dialog{
  width: 500px !important;
  border-radius: 12px;
}
.project-summary-container .duplicate-design-dialog >>> .el-dialog__header{
  background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
  display: flex;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
  margin-bottom: 8px;
  padding-right: 24px !important;
  padding-left: 24px !important;
}
.project-summary-container .duplicate-design-dialog >>> .el-dialog__title{
  color: #222 !important;
  font-size: 16px;
  font-weight: 600;
}
.project-summary-container .duplicate-design-dialog >>> .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
}
.project-summary-container .duplicate-design-dialog >>> .el-dialog__body {
  padding: 0px 24px 24px 24px !important;
}

.project-summary-container .duplicate-design-dialog >>> .el-input__inner {
  background-color: #e8edf2;
  border: none;
  padding: 0 16px;
  color: #222;
  font-size: 16px;
  height: 48px;
}
.project-summary-container .duplicate-design-dialog .confirm-button{
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
}
.project-summary-container .confirm-btn{
  font-weight: 600;
  font-size: 18px;
  color: #fff;
}

 .project_summary .add_design_icon_container {
   border-radius: 50%;
   display: flex;
   justify-content: center;
   align-items:center;
   width: 48px;
   height: 48px;
   border: 1px solid #222;
   cursor: pointer;
   font-size: 5rem;
   color: #222;
 }

  .add_design_container {
    width:312px;height:366px;
  }

  .add_design_text {
    font-weight: 600;
  }
</style>

<style scoped>

/* .flexContainerTwo{
  display: none;
} */
.flexContainer{
  /* display: grid; */
  grid-gap: 24px;
  grid-template-columns: 65% auto;
}

@media (max-width: 1000px) {
.flexContainer{
  grid-template-columns: auto;
}

.tooltip {
    width : 200px;
    right: 10px;
    bottom: 15%;
  }


}


@media (max-width: 400px) {

  .project_summary .added_design .card_col {
  /* padding: 8px 16px; */
  padding: 0px !important;
  background: #f6fafe;
  position: relative;
  width: 100%;
}
}

@media (max-width: 580px) {
  .project-summary-container .duplicate-design-dialog >>> .el-dialog{
    width: 90% !important;
  }

  .project-summary-container .duplicate-design-dialog >>> .el-dialog__header {
    padding-right: 16px !important;
    padding-left: 16px !important;
  }

  .project-summary-container .duplicate-design-dialog >>> .el-dialog__body {
    padding: 0px 16px 24px 16px !important;
  }
}




</style>