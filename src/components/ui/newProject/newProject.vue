<template>
  <div id="newProject">
    <el-dialog
      :visible="isNewProjectFormVisible"
      :close-on-click-modal="false"
      :show-close="!isIntegration"
      style="min-width: 800px;"
      title="Create a New Project"
      width="65%"
      @open="assignIntegratedProjectData"
      @close="onNewProjectDialogClose"
    >
      <div>
        <div class="new-project-container">
          <div class="fields-container">
            <el-form
              :model="projectData"
              size="mini"
              label-position="left"
              label-width="130px"
            >
              <!-- <p class="formHeadings">Project Details</p> -->
              

              <el-form-item :label="flagForUS ? 'Project Address' : 'Enter Location'">
                <div class="searchBarWrapper">
                  <!-- <gmap-autocomplete
                    id="mapAutoSearch"
                    placeholder=""
                    @place_changed="setPlace"
                    :options="{
                      fields: [
                        'geometry',
                        'formatted_address',
                        'address_components',
                      ],
                    }"
                  /> -->
                  <GoogleMapsAutocompleteInputVue />
                </div>
                
              </el-form-item>

              <el-form-item label="Project Name*">
                <el-input
                  v-validate="projectNameValidation"
                  v-model="projectData.projectName"
                  :disabled="isIntegration"
                  name="Project Name"
                />
                <p class="formErrors">
                  {{ errors.first("Project Name") }}
                </p>
              </el-form-item>

              <!-- <p class="formHeadings">Client Details</p> -->

              <el-form-item label="Client Name*">
                <el-input
                  v-validate="nameValidation"
                  v-model="projectData.clientName"
                  :disabled="isIntegration"
                  name="Name"
                />
                <p class="formErrors">
                  {{ errors.first("Name") }}
                </p>
              </el-form-item>

              <el-form-item label="Client Number">
                <!-- <el-input
                 type="text" onkeypress="return ((event.charCode > 47 && 
	                event.charCode < 58) || (event.charCode === 40 || event.charCode === 41 || event.charCode === 43||event.charCode === 45))"
                  v-model="projectData.clientContactNumber"
                  :disabled="isIntegration"
                  name="Client Number"
                /> -->
                <!-- {{ projectData.clientContactNumber }} -->
                <vue-tel-input 
                  v-model="projectData.clientContactNumber"
                  :key="counter"
                  :defaultCountry="defaultCountryCode" 
                  :dropdownOptions="{showFlags:true,showDialCodeInSelection:true,showDialCodeInList:true, showSearchBox:true}" 
                  :autoFormat="false"
                  :mode="international"
                  :validCharactersOnly="true"
                  @country-changed="setCountryCode"
                  @validate="validateClientNumber"
                  @open="onDropdownOpen(true)"
                  @close="onDropdownOpen(false)"
                  name="Client Number"
                  >
                  <template v-slot:arrow-icon>
                    <span>{{ open ? '▲' : '▼' }}</span> 
                  </template>
                </vue-tel-input>
                <!-- <p class="formErrors" >
                  {{ errors.first("Client Number") }}
                </p> -->
                <!-- <p class="formErrors" v-if="projectData.clientContactNumber && !isMobileNumberValid && isAllowedToShowMobileValidation">
                  Please Enter Valid Mobile Number
                </p> -->
               
              </el-form-item>

              <el-form-item label="Client Email" v-if="flagForUS">
                <el-input
                  v-model="projectData.clientEmail"
                  :disabled="isIntegration"
                />
              </el-form-item>

              <el-form-item label="Email Id" v-else>
                <el-input
                  v-model="projectData.clientEmail"
                  :disabled="isIntegration"
                />
              </el-form-item>

              <el-form-item label="Address">
                <el-input
                  v-model="projectData.clientAddress"
                  :disabled="isIntegration"
                  placeholder="Address to show in proposal"
                />
              </el-form-item>
              <el-form-item
                v-if="PLANS_HAVING_SMALL_AND_MEDIUM.includes(userTier)"
                v-show="isAccountSubscribed"
                label="Project Size"
              >
                <el-tooltip
                  :disabled="availableProjectSizes.small"
                  :content="TOOLTIP_CONTENT_QUOTA_EXHAUSTED"
                  effect="light"
                  placement="bottom"
                >
                  <el-radio
                    v-model="quotaType"
                    :disabled="!availableProjectSizes.small"
                    :label="QUOTA_TYPE.SMALL"
                  >
                    Small (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.SMALL }} kW)
                  </el-radio>
                </el-tooltip>
                <el-tooltip
                  :content="getMediumTooltipContent"
                  effect="light"
                  placement="bottom"
                >
                  <el-radio
                    v-model="quotaType"
                    :disabled="!availableProjectSizes.medium"
                    :label="QUOTA_TYPE.MEDIUM"
                  >
                    Medium (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.MEDIUM }} kW)
                  </el-radio>
                </el-tooltip>
              </el-form-item>
            </el-form>
          </div>

          <div class="map-container">
            <!-- <p class="formHeadings"> Mark Location </p> -->
            <newProjectMapSelector
              :geo-location="geoLocation"
              :place="placeForMap"
              :isSelfDesignPopup="isSelfDesignPopup"
              :totalPayableCreditsNonUS="totalPayableCreditsNonUS"
              :totalPayableCreditsUS="totalPayableCreditsUS"
              :selfDesigningInfo="selfDesigningInfo"
              :selectedAddOnChecked="selectedAddOnChecked"
            />
            <p class="map-prompt-text">Zoom in to fill the project area.</p>
          </div>
          <div class="third-container">
            <div v-if="isSelfDesignPopup">
              <div class="creditDetailsOne">
                <p class="detailsLight">Credit Balance</p>
                <p class="detailsLight">{{totalCredits}}</p>
              </div>
              <div class="creditDetailsTwo">
                <p class="details">Total Payable Credits:</p>
                <p class="details" v-if="selfDesigningInfo.input_dropdown.length > 0">{{totalPayableCreditsNonUS.credits}}</p>
                <p class="details" v-if="selfDesigningInfo.input_checkbox.length > 0">{{totalPayableCreditsUS}}</p>
              </div>
            </div>
            <div class="sharingForm" v-if="!(flagForUS || isSelfDesignPopup || isTataOrg)">
              <p class="shareFormHeading">
                Share Project
              </p>
              <el-switch
                v-model="isPublicShared"
                style="display: block; text-align: right; margin-top: -34px"
              />
              <div class="disclaimer">
                This project is
                <span v-show="!isPublicShared"> not </span> visible to everyone
                from your organisation
              </div>

              <div
                v-show="!isPublicShared"
                label=""
                style="margin-bottom: 0px;"
              >
                <div style="display: flex; line-height: 0px; align-items: baseline;">
                  <infiniteScrollUsers
                    :user.sync="selectedUser"
                    style="flex-grow: 1"
                  />
                  <button
                    :disabled="
                      Object.entries(selectedUser).length === 0 &&
                        selectedUser.constructor === Object
                    "
                    class="button-confirm"
                    style="height: 48px !important;
                            margin: 0;
                            width: 70px;
                            border-radius: 0px 4px 4px 0px !important;
                            padding: 0 15px;"
                    @click="addUserToSharerList"
                  >
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div
                v-show="usersHavingAccessList"
                style="height: 17vh; padding: 10px 0 10px 10px; text-align: left"
              >
                <VuePerfectScrollbar class="scroll-area-users-list">
                  <el-row
                    v-for="(persons, index) in usersSharedWithList"
                    :key="index"
                    style="text-align: left; padding-top: 1.5vh"
                  >
                    <el-col :span="15" class="verticalAligner">
                      {{ persons.first_name }}
                      {{ persons.last_name }}
                    </el-col>
                    <el-col :span="6" style="text-align: right">
                      <el-select
                        v-model="persons.permission"
                        class="permissions"
                        popper-class="lightDropdown"
                      >
                        <el-option
                          v-for="(options,
                          indexPermission) in permissionsAvailable"
                          :key="indexPermission"
                          :value="options.value"
                          :label="options.label"
                        />
                      </el-select>
                    </el-col>
                    <el-col
                      :span="3"
                      style="text-align: right; line-height: 15px"
                    >
                      <i
                        class="el-icon-close"
                        style="cursor: pointer;
                        padding: 0px 18px 0 0;
                        font-size: 10px"
                        @click="removeUserFromSharerList(index)"
                      />
                    </el-col>
                  </el-row>
                </VuePerfectScrollbar>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" :class="[isSelfDesignPopup && !isOnProjectSummaryPage ? 'footer' : '']">
        <el-button v-if="isSelfDesignPopup && !isOnProjectSummaryPage" class="backBtn" @click="isNewProjectFormVisible=false">Back</el-button>
        <button
          id="newProjectConfirmButton"
          :disabled="errors.items.length > 0 || isProjectGettingCreated"
          class="button-confirm create-button"
          style="width: 74px;"
          @click="confirmOnClickAction()"
        >
          <span v-show="!isProjectGettingCreated">{{isSelfDesignPopup  ? "Pay & Create Design":"Create Project"}}</span>
          <i v-show="isProjectGettingCreated" class="el-icon-loading" />
        </button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/dist/vue-tel-input.css';
Vue.use(VueTelInput);
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import API from "@/services/api/";
import {
  USER_TIER,
  TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
  TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
  QUOTA_TYPE,
  PLANS_HAVING_SMALL_AND_MEDIUM,
} from "@/pages/constants";
import { QUOTA_TYPES_DC_CAP_SIZE } from "@/core/coreConstants";
import infiniteScrollUsers from "@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue";
import { mapState, mapActions } from "pinia";
import { useOrganisationStore } from '../../../stores/organisation';
import { useIntegrationStore } from '../../../stores/integration';
import { useCreditsStore } from '../../../stores/credits';
import { useMiscStore } from '../../../stores/misc';
import newProjectMapSelector from "./newProjectMapSelector.vue";
import GoogleMapsAutocompleteInputVue from '../../googleMaps/GoogleMapsAutocompleteInput.vue';
import { isTataOrg } from '../../../utils';

export default {
  name: "NewProject",
  components: {
    infiniteScrollUsers,
    newProjectMapSelector,
    VuePerfectScrollbar,
    GoogleMapsAutocompleteInputVue
  },
  props: {
    isNewProjectFormVisible: {
      type: Boolean,
      default: false,
    },
    isIntegration: {
      type: Boolean,
      default: false,
    },
    isSelfDesignPopup: {
      type: Boolean,
      default: false
    },
    totalPayableCreditsNonUS: {
      type: Object,
      default: null
    },
    totalPayableCreditsUS: {
      type: Number,
      default: null
    },
    selfDesigningInfo: {
      type: Object,
      default: null
    },
    selectedAddOnChecked: {
      type: Array,
      default: null
    },
    avilFeaturesIds: {
      type: Array,
      default: null
    },
    iSPromotionalChecked: {
      type: Boolean
    }
  },
  data() {
    return {
      msg: " I am in newProject",
       window: {
          width: 0,
          height: 0
        },
      isProjectGettingCreated: false,
      projectData: {
        projectName: "",
        clientName: "",
        clientEmail: "",
        clientContactNumber: "",
        clientAddress: "",
        source_id: "",
        source: "",
      },
      projectNameValidation: {
        required: true,
      },
      nameValidation: {
        required: true,
      },
      geoLocation: {
        center: { lat: 28.5421285, lng: 77.3348087 },
        zoom: 19,
      },
      isPublicShared: false,
      usersSharedWithList: [],
      permissionsAvailable: [
        { value: "change", label: "EDIT" },
        { value: "view", label: "VIEW" },
      ],
      selectedUser: {},
      sharingMessage: true,
      usersHavingAccessList: false,
      currUserProfile: {},
      placeForMap: {},
      // flagForUS:false,

      defaultCountryCode: 'IN',
      isMobileNumberValid:false,
      isMobileNumberValidForSubmission: true,
      isAllowedToShowMobileValidation:false,
      international:'international',
      dialCode:'',
      open:false,
      counter:0,
    };
  },
  nonReactiveData() {
    return {
      USER_TIER,
      PLANS_HAVING_SMALL_AND_MEDIUM,
      QUOTA_TYPES_DC_CAP_SIZE,
      TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
      QUOTA_TYPE,
      TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
    };
  },
  computed: {
    ...mapState(useIntegrationStore, {
      integratedProjectData: (state) => state.projectData,
    }),
    ...mapState(useCreditsStore, {
      credits: 'GET_CREDIT_BALANCE',
    }),
    ...mapState(useMiscStore, {
      googleMapsState: "GET_GOOGLE_MAPS_STATE"
    }),
    ...mapState(useOrganisationStore, {
      userTier: "GET_USER_TIER",
      availableProjectSizes: "GET_AVAILABLE_PROJECT_SIZES",
    }),
    totalCredits() {
      let total = this.credits.purchased_credits + this.credits.promotional_credits
      return total.toFixed(2)
    },
    quotaType: {
      get() {
        return useOrganisationStore().quotaType;
      },
      set(quotaType) {
        this.setQuotaType(quotaType);
      },
    },
    isOnProjectSummaryPage() {
      return Object.keys(this.$route.params).includes("projectId");
    },
    isAccountSubscribed(){
        let selfDesignId = JSON.parse(localStorage.getItem('allServicesInfo'))['self_designing_info']['id'];
        return !Boolean(selfDesignId);
    },
    getMediumTooltipContent() {
      return this.availableProjectSizes.medium
        ? TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO
        : TOOLTIP_CONTENT_QUOTA_EXHAUSTED;
    },
    flagForUS(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    isTataOrg
  },
  created(){
      window.addEventListener('resize', this.handleResize);
     this.handleResize();
    //  this.getData();
     console.log('rohitprops', this.$props.avilFeaturesIds, this.$props.selfDesigningInfo);
  },
  mounted() {
    this.INITIALIZE_COUNTRY_CODE('IN');
    this.fetchUserProfile();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    ...mapActions(useOrganisationStore, {
      setQuotaType: "SET_QUOTA_TYPE",
      setDefaultQuotaType: "SET_DEFAULT_QUOTA_TYPE",
    }),
    ...mapActions(useIntegrationStore, {
      removeProjectDataFromSessionStorage:
        "REMOVE_PROJECTDATA_FROM_SESSION_STORAGE",
    }),
    ...mapActions(useCreditsStore, ["FETCH_AND_UPDATE_CREDIT_BALANCE"]),
    ...mapActions(useMiscStore, ["INITIALIZE_COUNTRY_CODE"]),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    setPlace(place) {
      this.placeForMap = place;
    },
    validateClientNumber(numberInfo){
      this.isMobileNumberValid = numberInfo.valid;
    },
    validateMobileNumberForSubmission(){
      this.isMobileNumberValidForSubmission = this.isMobileNumberValid;
    },
    onDropdownOpen(val){
      this.open = val;
    },
    setCountryCode(country) {
      this.dialCode = '+'+country.dialCode
    },
    async fetchUserProfile() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const user_id = user.user_id;

      try {
        const response = await API.USERS.FETCH_USER(user_id);
        this.currUserProfile = response.data;
        this.populateDefaultSharers();
      } catch (e) {
        console.error();
      }
    },
    assignIntegratedProjectData() {
      if (this.isIntegration) {
        const projectData = this.integratedProjectData;
        this.projectData.projectName = projectData.project_name;
        this.projectData.clientName = projectData.client_name;
        this.projectData.clientContactNumber = projectData.phone_number;
        this.projectData.clientEmail = projectData.email;
        this.projectData.clientAddress = projectData.address;
        this.projectData.source_id = projectData.source_id;
        this.projectData.source = projectData.source;
      }
    },
    async postSharingPermissionsHelper(
      userPermissionStructuredData,
      projectId
    ) {
      // fetching all default sharers
      // const postData = {
      //   permissions: userPermissionStructuredData,
      // };
      const postData = {
        new_users: userPermissionStructuredData
      }

      try {
        const response = await API.PROJECTS.POST_PROJECT_PERMISSIONS(
          projectId,
          postData
        );
        this.$router.push({ name: "projectSummary", params: { projectId } });
        // this resets default value of quota type
        // resetting it here as close isn't called in case of project creation
        this.setDefaultQuotaType();
      } catch (e) {
        this.projectCreationError();
      }
    },

    async postSharingPermissions(projectId) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let newUsersArray = [];
      newUsersArray.push(
        {
          "email": user.email,
          "permission": "change"
        }
      );
      this.usersSharedWithList.forEach((user)=>{
          newUsersArray.push(
            {
              "email": user.email,
              "permission": user.permission,
            }
        )
      })


      // const userDetails = await this.fetchUserProfile();

      // let userPermissionStructuredData = [
      //   {
      //     permission: "view_project",
      //     users: [],
      //   },
      //   {
      //     permission: "change_project",
      //     users: [],
      //   },
      // ];

      // change rights to current user(Always)
      // userPermissionStructuredData[1].users.push(user.user_id);

      // if (this.isPublicShared === true) {
      //   // if this is true, then adding organisation key to json in change right
      //   // 0 for view, 1 for edit
      //   userPermissionStructuredData[1].organisation = user.organisation_id;
      // }

      // add the users in the users shared list to the post permission body
      // userPermissionStructuredData = this.addUsersSharedList(
      //   userPermissionStructuredData
      // );

      // this.postSharingPermissionsHelper(
      //   userPermissionStructuredData,
      //   projectId
      // );
      this.postSharingPermissionsHelper(
        newUsersArray,
        projectId
      );
    },

    addUsersSharedList(userRestructuredData) {
      this.usersSharedWithList.forEach((arrayItem) => {
        if (arrayItem.permission === "VIEW") {
          // view mode
          userRestructuredData[0].users.push(arrayItem.id);
        } else {
          // edit mode
          userRestructuredData[1].users.push(arrayItem.id);
        }
      });

      return userRestructuredData;
    },

    onNewProjectDialogClose() {
      this.$emit("update:isNewProjectFormVisible", false);
      // this resets the default coordinates
      this.geoLocation.center.lat = 28.5421285;
      this.geoLocation.center.lng = 77.3348087;
      this.geoLocation.zoom = 18;
      // this resets the form input fields
      this.$validator.reset();
      this.projectData.projectName = "";
      this.projectData.clientName = "";
      this.projectData.clientEmail = "";
      this.projectData.clientContactNumber = "";
      this.projectData.clientAddress = "";
      // this resets default users list
      this.populateDefaultSharers();
      this.hideUserSharedWithList();
      // this resets default value of quota type
      this.setDefaultQuotaType();
    },

    async getData() {
      if(this.$props.isSelfDesignPopup) {
        var reqSelfDesign = this.$props.isSelfDesignPopup;
        let response = await API.SELF_DESIGN.FETCH_SELF_DESIGN(reqSelfDesign);
        console.log('responseSelfDesign: ', response);
        let data = response.data;
        console.log('dataSelfDesign: ', data);
      }
    },

    async postNewProjectData() {
      var featuresArray = [] ;
      if (this.selfDesigningInfo && this.selfDesigningInfo.input_dropdown && this.selfDesigningInfo.input_dropdown.length == 0) {
        featuresArray = this.avilFeaturesIds;
      } else if (this.totalPayableCreditsNonUS) {
        featuresArray.push(this.totalPayableCreditsNonUS.id);
      }

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      if(!this.projectData.clientAddress){
        this.projectData.clientAddress = this.googleMapsState.address;
      }
      if (!token) { return }

      let postData = {
        name: this.projectData.projectName,
        latitude: this.geoLocation.center.lat,
        longitude: this.geoLocation.center.lng,
        zoom: this.geoLocation.zoom,
        client_name: this.projectData.clientName,
        client_email_id: this.projectData.clientEmail,
        client_phone: this.projectData.clientContactNumber? ( this.dialCode + " " + this.projectData.clientContactNumber) : null,
        client_address: this.projectData.clientAddress,
        state:this.googleMapsState.state,
        quota_type: this.isAccountSubscribed ? this.quotaType : null,
        is_public_sharing_enabled: this.isPublicShared,
      };
      if (this.isSelfDesignPopup) {
        postData["features"] = featuresArray
        postData["use_promotional_credits"] =  this.iSPromotionalChecked
        postData["quota_type"] = null
      }
      // add source_id and import_source for integration case
      if (this.isIntegration) {
        postData.source_id = this.projectData.source_id;
        postData.import_source = this.projectData.source;
      }
      let response
      try {
        if (this.isSelfDesignPopup) {
          response = await API.SELF_DESIGN.FETCH_SELF_DESIGN(postData, this.isSelfDesignPopup);
          await this.FETCH_AND_UPDATE_CREDIT_BALANCE()
        } else {
          response = await API.PROJECTS.POST_PROJECT(postData);

          //------------------------Now POST PROJECT API FOR ARKA IF U ARE SL360 USER---------------//
          let postDataForArka = {
            "latitude": this.geoLocation.center.lat,
            "longitude": this.geoLocation.center.lng,
            "address": this.projectData.clientAddress,
            "gmaps_address_string":this.projectData.clientAddress,
            "tsl_project_ID":response.data.id,
            "first_name":this.projectData.clientName,
            "last_name": null,
            "phone_number":  this.projectData.clientContactNumber,
            "email":this.projectData.clientEmail,
            "project_name":  this.projectData.projectName ,
          }
          // console.log("response and user",response, response.id, user, user.is_sl_360_user);
          if(response.data.id && user.is_sl_360_user){
            API.ARKA.CREATE_PROJECT_FOR_ARKA(postDataForArka);
          }

          //---------------------------------------------------------------------------------------------//
        }
      } catch (e) {
        this.isProjectGettingCreated = false
        this.$message({
          showClose: true,
          message: e.response.data.detail,
          type: "error",
          center: true
        })
        return
      }
      const createdProjectId = response.data.id;

      if(!this.isPublicShared)
      this.postSharingPermissions(createdProjectId);
      else{
        this.$router.push({ name: "projectSummary", params: { projectId : createdProjectId } });
        this.setDefaultQuotaType();
      }

      if (this.isIntegration) {
        this.removeProjectDataFromSessionStorage();
      }
    },
    async confirmOnClickAction() {
      const isValid = await this.$validator.validateAll();
      if(this.isAccountSubscribed && !this.userTier){
        this.$message({
          showClose: true,
          message: "This is a subsciption account but dont have any allocated quota!",
          type: "error",
          center: true
        });
        return;
      }
      // if (isValid) {
      // this.isMobileNumberValidForSubmission = this.isMobileNumberValid;
      // this.isAllowedToShowMobileValidation=true;
      if (isValid) {
        this.isProjectGettingCreated = true;
        this.postNewProjectData();
      }
    },

    async populateDefaultSharers() {
      this.usersSharedWithList = [];
      this.currUserProfile.user_shares.forEach((currUserItem) => {
        this.usersSharedWithList.push({
          id: currUserItem.user.id,
          first_name: currUserItem.user.first_name,
          last_name: currUserItem.user.last_name,
          email: currUserItem.user.email,
          permission: currUserItem.permission,
        });
      });

      if (!isTataOrg()) {
        // setting organisation
        if(!this.flagForUS) {
          this.isPublicShared = this.currUserProfile.org_shares.length > 0;
        }
      }
    },

    addUserToSharerList() {
      let doesUserAlreadyExist = false;

      let permissionView = isTataOrg() ? "change" : "view";

      this.usersSharedWithList.forEach((item) => {
        if (item.id === this.selectedUser.id) {
          doesUserAlreadyExist = true;
        }
      });

      if (!doesUserAlreadyExist) {
        this.usersSharedWithList.push({
          id: this.selectedUser.id,
          first_name: this.selectedUser.first_name,
          last_name: this.selectedUser.last_name,
          email: this.selectedUser.email,
          permission: permissionView,
        });

        this.$message({
          showClose: true,
          message: "User successfully added. ",
          type: "success",
          center: true
        });
      } else {
        this.$message({
          showClose: true,
          message: "User already exist in the list. ",
          type: "error",
          center: true
        });
      }

      // resetting input field
      this.selectedUser = {};
    },

    projectCreationError() {
      this.$message({
        showClose: true,
        message: "Error in creating project. Try again",
        type: "error",
        center: true
      });
      this.isProjectGettingCreated = false;
    },

    removeUserFromSharerList(index) {
      this.usersSharedWithList.splice(index, 1);
    },

    clearUsersSharedWithList() {
      // clearing whole list
      this.usersSharedWithList = [];
    },

    showUserSharedWithList() {
      this.usersHavingAccessList = true;
      this.sharingMessage = false;
    },

    hideUserSharedWithList() {
      this.usersHavingAccessList = false;
      this.sharingMessage = true;
    },
  },
  watch:{
    googleMapsState:{
      deep:true,
      handler(val){
        this.defaultCountryCode = val.countryCode;
        this.counter++;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/components/button";
@import "../../../styles/components/switch";
@import "../../../styles/components/forms";
</style>

<style type="text/css" scoped>

.new-project-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 0.9fr 0fr;
  grid-gap: 1rem;
}

.fields-container {
  grid-row: 1 / 3;
  grid-column: 1 / 2;
}

.creditDetailsOne {
  display: flex;
  justify-content: space-between;
  padding: 0px 0px 16px 0px;
  border-bottom: 1px solid #ccc;
  margin-top: 24px;
}

.creditDetailsTwo {
  display: flex;
  justify-content: space-between;
  padding: 16px 0px;
}

.detailsLight {
  font-size: 16px;
  color: #777;
}

.details {
  font-size: 16px;
  color: #222;
}

#newProject >>> .backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
  height: 50px;
}

#newProject >>> .footer{
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  padding-top: 16px;
}

#newProject >>> .el-dialog__footer {
  margin: 0;
  text-align: center !important;
  /* padding: 0 !important; */
}

#newProject >>> .el-dialog__wrapper {
  max-height: 95vh !important;
}

.third-container {
  width: 320px;
}

@media (max-width: 1140px) {
.new-project-container {
  grid-template-columns: 1fr;
  grid-template-rows: 0fr 0fr 0fr;
}

.fields-container {
  grid-row: 2 / 3;
}

.map-container {
  grid-row: 1 / 2;
  height: 350px;
}

.third-container {
  width: -webkit-fill-available;
}

#newProject >>> .backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
  height: 50px;
}

#newProject >>> .footer{
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  padding-top: 16px;
}

.third-container {
  margin: 0 1.5em;
}
}
  
#newProject >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
}

.searchBarWrapper {
  text-align: left;
  /* border: 1px solid #c0c4cc; */
  height: 40px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  height: 44px;
}
.searchBarWrapper input {
  height: 48px;
  background-color: #e8edf2;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  color: #222;
  border-radius: 4px;
}
.el-input--mini {
  text-align: left;
  /* border: 1px solid #c0c4cc; */
  height: 40px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
}

.formErrors {
  margin-top: -6px;
  margin-bottom: 0px;
}

/* .el-form-item--mini >>> .el-form-item {
    margin-bottom: 5px;
} */

.el-form-item {
  height: 40px !important;
}

.el-form-item--mini {
  margin-bottom: 36px !important;
}

.sharingForm {
  /* width: 325px; */
  /* width: 276px; */
  /* height: 90px; */
  /* margin: 56px
px
 116px 0 24px; */
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: normal;
  text-align: left;
  color: #777;
  margin-top:15px;
}

.el-input--mini >>> .el-input__inner {
  height: 48px;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  color: #222;
  background-color: #e8edf2;
  border-radius: 4px;

}
.el-form-item--mini >>> .el-form-item__label {
  font-size: 14px !important;
  line-height: 2.5;
  width: 101px;
  height: 38px;
  /* margin: 29px 212px 44px 31px; */
  /* font-family: "Roboto" !important; */
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  /* line-height: 1.25; */
  letter-spacing: normal;
  text-align: left;
  color: #222;
  margin-top: 6px !important;
}

.el-input {
  padding-bottom: 5px;
  height: 44px;
}

.disclaimer {
  font-size: 14px;
  color: #909399;
  text-align: left;
  /* padding: 10px 0 10px 0; */
  word-break: break-word;
  line-height: 1.43;
  padding-right: 55px;
  color: #777777;
  margin-bottom: 8px !important;
  font-weight: 500;
}



.scroll-area-users-list {
  height: 100%;
  background-color: #f8f8f8;
}

.permissions >>> .el-input__inner {
  border: 0px;
  font-size: 12px;
  padding-left: 0px;
  padding-right: 0px;
  background-color: #f8f8f8;
  line-height: 15px;
  height: 15px;
}

.projectSharing >>> .el-input {
  height: 100%;
}

.projectSharing >>> .el-input__inner {
  height: 100%;
  font-size: 12px;
  border-right: 0px;
  border-radius: 4px 0px 0px 4px !important;
  line-height: 13px;
}

.verticalAligner {
  padding: 0px 10px 0px 10px;
  color: #303133;
  font-size: 14px;
  line-height: 2.5vh;
  vertical-align: middle;
}
.shareFormHeading {
  margin: 0px;
  color: #222222;
  font-size: 16px;
  text-align: left;
  padding-bottom: 10px;
  font-weight: 300;
}
/* #newProject >>> .el-dialog{
    width: 70% !important;
} */

#newProject >>> .el-input__icon {
  line-height: 0;
}
#newProject >>> .el-dialog__body {
  overflow: hidden;
  padding-top: 30px !important;
  padding-left: 20px !important;
  padding-bottom: 20px !important;
}

.anchorTagStyler {
  text-decoration: none;
  color: #409eff;
  cursor: pointer;
}

.scroll-area {
  position: relative;
  margin: auto;
  width: 100%;
  height: 60vh;
}
/* override default vue bar style */
.vb-content {
  display: flex !important;
  width: 98% !important;
  overflow: inherit !important;
}

.vb-content::-webkit-scrollbar {
  width: 0 !important;
}

.vb-content {
  scrollbar-width: none; /* FireFox */
  -ms-overflow-style: none; /* IE 10+ */
}

.zoomLevel {
  color: #222222;
  font-size: 14px;
  text-align: left;
  font-weight: 300;
  padding: 10px;
  margin-bottom: 15px;
  border: solid #ccc 1px;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

#newProject >>> .el-dialog__footer {
  margin: 0;
  text-align: center !important;
  /* padding-top: 0px !important; */
}

#newProject >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
  height: 48px !important;
}

#newProject >>> .el-dialog__title {
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
  font-size: 15px;
  margin-left: 10px;
  color: #222222 !important;
}
#newProject >>> .scroll-area {
  margin-left: 10px;
  overflow: visible !important;
}

#newProject >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#newProject >>> .button-confirm {
    background-color: #409eff !important;
    font-size: 16px !important;
    border: none !important;
    padding: 9px 2px !important;
    width: 200px !important;
    /* height: 40px !important; */
    margin: 0 !important;
    border-radius: 4px !important;
    background-image: -webkit-gradient(linear, left top, left bottom, from(#409eff), to(#3092f7)) !important;
    background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
    font-family: 'Helvetica Neue' !important;
    font-size: 18px !important;
    font-weight: bold !important;
    height: 50px !important;
}
#newProject >>> .create-button {
  margin-right: 15px;
}

#newProject >>> .el-dialog {
  border-radius: 12px !important;
  height: auto !important;
  /* overflow-y: auto; */
}
#newProject >>> .vti__selection .vti__country-code{
  width: 34px;
}
#newProject >>> .vue-tel-input{
  background-color: #e8edf2 ;
  border: none;
  width: 100%;
}
#newProject >>> .vti__input{
  background-color: #e8edf2 ;
  border:none;
  /* border-left: 1px solid #777; */
}

#newProject >>> .el-input__inner::placeholder{
  color: #606266;
  opacity: 1;
}

.map-prompt-text{
  text-align:center; 
  margin:10px;
}

#newProject >>> .vti__dropdown-list.below{
  top:42px ;
  width: 404px ;
}
@media (max-width: 1140px) {
  #newProject >>> .el-dialog {
  border-radius: 12px !important;
  width: 90vw !important;
  overflow-y: hidden;
  height: auto;
}

  #newProject >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    top: -5vw;
    min-width: 0 !important;
    overflow: hidden;
}

#newProject >>> .el-form {
  margin-left: 2vw;
  margin-right: 2vw;
  margin-bottom: 34px;
}

#newProject >>> .el-dialog__body {
  overflow-y: scroll;
  padding: 0 !important;
  height: 67vh;
}
#newProject >>> .el-form-item--mini .el-form-item__content{
    margin-left: 0 !important;
    line-height: 28px;
    width: 100% !important;
    margin-top: 36px !important;
}




#newProject >>> .el-form-item--mini.el-form-item{
  margin-bottom: 22px !important;
  height: 76px !important;
}
.shareFormHeading {
 width: -webkit-fill-available;
}

  }

@media (max-width: 800px) {
 #newProject >>> .backBtn {
  padding: 13px 20px;
  border: 1px solid #999;
  height: 50px;
  }
}  
</style>
