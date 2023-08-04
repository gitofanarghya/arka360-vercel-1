<template>
  <div id="newProject">
    <el-dialog
      :visible="isNewProjectFormVisible"
      :close-on-click-modal="false"
      :show-close="!isIntegration"
      style="min-width: 800px;"
      :title="requestedServiceType"
      width="90%"
      @open="assignIntegratedProjectData"
      @close="onNewProjectDialogClose"
    >
        <h3 class="containerHeading">Project Information*</h3>
        <div class="new-project-container">
          <div class="fields-container">
            <el-form
              :model="projectData"
              size="mini"
              label-position="left"
              label-width="150px"
            >
              <!-- <p class="formHeadings">Project Details</p> -->


              <el-form-item :label="flagForUS ? 'Project Address' : 'Enter Location'">
                <div class="searchBarWrapper">
                  <!-- <label>
                    <gmap-autocomplete
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
                    />
                  </label> -->
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
                  name="Name"
                />
                <p class="formErrors">
                  {{ errors.first("Name") }}
                </p>
              </el-form-item>

              <el-form-item label="Client Number"
                v-if="!flagForUS">
                <vue-tel-input
                  v-model="projectData.clientContactNumber"
                  :key="counter"
                  :defaultCountry="defaultCountryCode" 
                  :dropdownOptions="{showFlags:true,showDialCodeInSelection:true,showDialCodeInList:true, showSearchBox:true}" 
                  :inputOptions="{maxlength:15}"
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
                <!-- <el-input
                  type="number"
                  v-model="projectData.client_phone"
                  :disabled="isIntegration"
                  name="Client Number"
                /> -->
              </el-form-item>

              <el-form-item label="Client Email"
                v-if="!flagForUS">
                <el-input
                  v-model="projectData.client_email"
                  name="clientMail"
                />
                <p class="formErrors">
                  {{ errors.first("field") }}
                </p>
              </el-form-item>

              <el-form-item label="Assessor Parcel
                Number (APN)" v-if="flagForUS">
                <el-input
                  v-model="projectData.assessor_parcel_number"
                />
              </el-form-item>

              <el-form-item label="Contractor License"
                v-if="flagForUS">
                <el-input
                  v-model="projectData.contractor_license"
                  :disabled="isIntegration"
                />
              </el-form-item>

              <el-form-item
                v-if="PLANS_HAVING_SMALL_AND_MEDIUM.includes(userTier)"
                v-show="false"
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
            <newProjectMapSelector
              :geo-location="geoLocation"
              :place="placeForMap"
            />
          </div>
        </div>
       <div slot="footer" class="footer">
          <p class="footerStep">Step 1<span class="unBold">/{{totalSteps}}</span></p>
          <div class="notesBtn">
            <!-- <el-button class="backBtn">Back</el-button> -->
            <el-button type="primary"
              :disabled="errors.items.length > 0 || isProjectGettingCreated"
              @click="confirmOnClickAction()"
              class="submitBtn">
              <span v-show="!isProjectGettingCreated">Create</span>
              <i v-show="isProjectGettingCreated" class="el-icon-loading" />
            </el-button>
          </div>
        </div>
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
  PLANS_HAVING_SMALL_AND_MEDIUM,
  TOOLTIP_CONTENT_QUOTA_EXHAUSTED,
  TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO,
  QUOTA_TYPE,
} from "@/pages/constants";
import { QUOTA_TYPES_DC_CAP_SIZE } from "@/core/coreConstants";
import infiniteScrollUsers from "@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue";
import { mapState, mapActions } from "pinia"
import { useIntegrationStore } from '../../../stores/integration';
import { useOrganisationStore } from '../../../stores/organisation';
import { useMiscStore } from '../../../stores/misc';
// import newProjectMapSelector from "./newProjectMapSelecter.vue";
import newProjectMapSelector from "@/components/ui/newProject/newProjectMapSelector.vue";
import { getServiceSpecificInfo } from "@/pages/utils/utils.js"
import { isTataOrg } from '../../../utils';
import GoogleMapsAutocompleteInputVue from '@/components/googleMaps/GoogleMapsAutocompleteInput.vue';


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
    request_object_id:{
       type: Number,
      default: 0
    },
    requestedServiceType:{
      type: String,
      default:""
    },
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
        assessor_parcel_number: "",
        contractor_license: "",
        client_phone: null,
        client_email: null,
        installation_partner: "",
      },
      projectNameValidation: {
        required: true,
      },
      nameValidation: {
        required: true,
      },
      geoLocation: {
        center: { lat: 28.5421285, lng: 77.3348087 },
        zoom: 18,
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

      serviceType: "dsds",
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
    ...mapState(useMiscStore, {
      googleMapsState: "GET_GOOGLE_MAPS_STATE"
    }),
    ...mapState(useOrganisationStore, {
      userTier: "GET_USER_TIER",
      availableProjectSizes: "GET_AVAILABLE_PROJECT_SIZES",
    }),
    isAccountSubscribed(){
        let selfDesignId = JSON.parse(localStorage.getItem('allServicesInfo'))['self_designing_info']['id'];
        return !Boolean(selfDesignId);
    },
    quotaType: {
      get() {
        return useOrganisationStore().quotaType;
      },
      set(quotaType) {
        this.setQuotaType(quotaType);
      },
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
    totalSteps(){
      // if(this.requestedServiceType==='Solar Sales Proposal' || this.requestedServiceType==='Permit Package' )
      //   return 6;
      // else if(this.requestedServiceType==='PV Design')
      //   return 5;
      if(!JSON.parse(localStorage.getItem("allServicesInfo")))
      return;
      let data = getServiceSpecificInfo(this.requestedServiceType);
      if(!data)
      return;
      return data['template_constant'][0]['pop_ups'].length; 
      
    },
    
  },
  watch:{
    request_object_id(newval,oldval){
      console.log("new,old",newval,oldval);
    },
    isNewProjectFormVisible:{
      handler(val){
        this.isProjectGettingCreated=false;
      }
    }
  },
  created(){
      window.addEventListener('resize', this.handleResize);
     this.handleResize();
     console.log("request_object_id",this.$props.request_object_id);
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
    ...mapActions(useMiscStore, ["INITIALIZE_COUNTRY_CODE"]),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    setPlace(place) {
      console.log("Palace",place);
      this.placeForMap = place;
      this.projectData.clientAddress = this.googleMapsState.address;
      // console.log("place",place);
      // console.log(typeof place);
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
        console.log("My Project Dataaaaaaaaaa",projectData);
        this.projectData.projectName = projectData.project_name;
        this.projectData.clientName = projectData.client_name;
        this.projectData.clientContactNumber = projectData.phone_number;
        this.projectData.clientEmail = projectData.email;
        this.projectData.clientAddress = projectData.address;
        this.projectData.source_id = projectData.source_id;
        this.projectData.source = projectData.source;
        this.projectData.assessor_parcel_number = projectData.assessor_parcel_number;
        this.projectData.contractor_license = projectData.contractor_license;
        this.projectData.client_email = projectData.client_email;
        this.projectData.client_phone = projectData.client_phone;
        this.projectData.installation_partner = projectData.installation_partner;
      }
    },
    async postSharingPermissionsHelper(
      userPermissionStructuredData,
      projectId,
      siteSurveyPath
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

        // this.$router.push({ name: "projectSummary", params: { projectId } });
        console.log("@@@@ final siteSurveyPath",siteSurveyPath);
        var jsonPass = {
          "projectId":projectId,
          "siteSurveyPath":siteSurveyPath
        }
        this.$emit("closeNewProjectPopup",jsonPass);
        // this.$emit("closeNewProjectPopup",projectId);

        // this resets default value of quota type
        // resetting it here as close isn't called in case of project creation
        this.setDefaultQuotaType();
      } catch (e) {
        this.projectCreationError();
      }
    },

    async postSharingPermissions(projectId,siteSurveyPath) {
      console.log("@@@@@@@siteSurveyPath",siteSurveyPath);
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

      let userPermissionStructuredData = [
        {
          permission: "view_project",
          users: [],
        },
        {
          permission: "change_project",
          users: [],
        },
      ];

      // change rights to current user(Always)
      userPermissionStructuredData[1].users.push(user.user_id);

      if (this.isPublicShared === true) {
        // if this is true, then adding organisation key to json in change right
        // 0 for view, 1 for edit
        userPermissionStructuredData[1].organisation = user.organisation_id;
      }

      // add the users in the users shared list to the post permission body
      userPermissionStructuredData = this.addUsersSharedList(
        userPermissionStructuredData
      );

      // this.postSharingPermissionsHelper(
      //   userPermissionStructuredData,
      //   projectId,
      //   siteSurveyPath
      // );
      this.postSharingPermissionsHelper(
        newUsersArray,
        projectId,
        siteSurveyPath
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
      this.geoLocation.zoom = 19;
      // this resets the form input fields
      this.$validator.reset();
      this.projectData.projectName = "";
      this.projectData.clientName = "";
      this.projectData.clientEmail = "";
      this.projectData.clientContactNumber = "";
      this.projectData.clientAddress = "";
      this.projectData.assessor_parcel_number = "";
      this.projectData.contractor_license = "";
      this.projectData.client_email = null;
      this.projectData.client_phone = null;
      this.projectData.installation_partner = null;
      // this resets default users list
      this.populateDefaultSharers();
      this.hideUserSharedWithList();
      // this resets default value of quota type
      this.setDefaultQuotaType();
    },

    async postNewProjectData() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      
      if (!this.projectData.clientAddress) {
        this.projectData.clientAddress = this.googleMapsState.address;
      }
      if (!token) { return }

      let postData = {
        name: this.projectData.projectName,
        latitude: this.geoLocation.center.lat,
        longitude: this.geoLocation.center.lng,
        zoom: this.geoLocation.zoom,
        client_name: this.projectData.clientName,
        client_email_id: this.projectData.client_email,
        client_phone:  this.projectData.clientContactNumber? ( this.dialCode + " " + this.projectData.clientContactNumber) : null,
        client_address: this.projectData.clientAddress,
        state:this.googleMapsState.state,
        quota_type: this.isAccountSubscribed ? this.quotaType : null,
        assessor_parcel_number: this.projectData.assessor_parcel_number,
        contractor_license: this.projectData.contractor_license,
        // client_phone: this.projectData.client_phone,
        installation_partner: this.projectData.installation_partner,
        is_public_sharing_enabled: this.isPublicShared,
      };
      // add source_id and import_source for integration case
      if (this.isIntegration) {
        postData.source_id = this.projectData.source_id;
        postData.import_source = this.projectData.source;
      }
      try {
        console.log(" this.$props.request_object_id", this.$props.request_object_id);
        let response = await API.DASHBOARD_INFO.CREATE_PROJECT(
          this.$props.request_object_id,postData
        );
        console.log("res",response);
        const createdProjectId = response.data.id;
        var siteSurveyPath =""
        if (response.data.request_expert_service!=undefined) {
          siteSurveyPath = response.data.request_expert_service.path;
        }
        
        // this.postSharingPermissions(createdProjectId,siteSurveyPath);
        if(!this.isPublicShared)
        this.postSharingPermissions(createdProjectId,siteSurveyPath);
        else{
          var jsonPass = {
            "projectId":createdProjectId,
            "siteSurveyPath":siteSurveyPath
          }
          this.$emit("closeNewProjectPopup",jsonPass);
        }
        if (this.isIntegration) {
          this.removeProjectDataFromSessionStorage();
        }
      } catch (e) {
        console.error();
      }
    },
    async confirmOnClickAction() {
      const isValid = await this.$validator.validateAll();
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

      // setting organisation
       if(!this.flagForUS)
      this.isPublicShared = this.currUserProfile.org_shares.length > 0;
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
          message: "User successfully added.",
          type: "success",
          center: true
        });
      } else {
        this.$message({
          showClose: true,
          message: "User already exist in the list.",
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

.el-dialog__wrapper{
  margin-top: 6vh !important;
}


.backBtn{
    padding: 13px 32px;
    border: 1px solid #999;
}

.submitBtn{
    padding: 13px 30px;
    font-size: 18px !important;
}
.footer {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
}

.footerStep {
  font-size: 16px;
  font-weight: 700;
  color: #222222;
  line-height: 2.5;
}

.unBold {
  color: #777777;
}

.new-project-container {
  display: flex;
  justify-content: left;
  flex-direction: row;
  gap: 24px;
}

.fields-container {
  width: auto;
  flex-grow: 1;
}

.map-container {
  width: 320px;
}

@media (max-width: 1140px) {
.new-project-container {
  flex-direction: column-reverse;
}

.map-container {
  width: 100%;
  height: 350px;
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
  height: 48px !important;
}

.containerHeading{
  color: #777777;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 22px;
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
  outline: none;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  background-color: #e8edf2;
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
    margin-top: -5px;
    margin-bottom: 8px;
}

/* .el-form-item--mini >>> .el-form-item {
    margin-bottom: 5px;
} */

.el-form-item {
  height: 40px !important;
}

.el-form-item--mini {
  margin-bottom: 35px !important;
}

.sharingForm {
  width: 325px;
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
}

.el-input--mini >>> .el-input__inner {
  height: 48px !important;
  outline: none;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  color: #000;
  background-color: #e8edf2;
}
.el-form-item--mini >>> .el-form-item__label {
  font-size: 16px !important;
  width: 101px;
  height: 38px;
  /* margin: 29px 212px 44px 31px; */
  /* font-family: "Roboto" !important; */
  font-size: 16px;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  word-break: break-word !important;
  margin-top: 12px !important;

}

.el-input {
  margin-bottom: 7px;
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
  height: 65vh;
  padding: 24px 19px !important;
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

#newProject >>> .el-dialog__footer {
  margin: 0;
  text-align: center !important;
  padding: 0px !important;
}

#newProject >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
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
    min-width: 0 !important;
    overflow: hidden;
}

#newProject >>> .el-dialog__body {
  overflow-y: scroll;
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
 margin-left: 2vw;
}

.sharingForm {
 width: -webkit-fill-available;
 margin-left: 2vw;
}



  }
</style>
