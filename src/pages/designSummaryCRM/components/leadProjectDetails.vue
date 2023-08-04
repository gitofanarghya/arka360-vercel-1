<template>
  <div>
    <div class="leadProContainer">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <router-link :to="{ name: 'leadManagement' }" class="backBtn"
          >Back to leads</router-link
        >
        <el-button
          style="border: none; font-size: 20px; font-weight: 700"
          icon="el-icon-close"
          plain
          v-if="isEditMode"
          @click="toggleEditMode()"
        />
      </div>

      <div class="flexContainer" v-if="!isEditMode">
        <div class="flexContainer2">
          <p
            class="shrtForm"
            :style="{
              backgroundColor: generateColorFromName(leadInfo?.name)
                ? generateColorFromName(leadInfo?.name)
                : '#1c3366',
            }"
          >
            {{ leadInfo?.name[0] }}
          </p>
          <div class="flexContainer3">
            <p class="name">
              <abbr :title="leadInfo?.name" class="abbrTag">{{
                leadInfo?.name
              }}</abbr>
            </p>
            <p class="res">({{ leadInfo?.project_details?.project_type }})</p>
          </div>
        </div>
        <div class="iconContainer">
          <img
            src="../assets/share.svg"
            class="shareIcon"
            @click="openShareProjectPopup()"
          />
          <img
            src="../assets/edit.svg"
            class="editIcon"
            @click="toggleEditMode()"
          />
        </div>
      </div>

      <div class="gridContainer marginBottom" v-else>
        <div class="boxOne">
          <p class="label">Name<span class="astrisk"> *</span></p>
          <el-input
            placeholder="Please input"
            v-model="editLeadData.name"
            @input="isLeadName($event)"
            v-validate="firstNameValidation"
            name="firstName"
          ></el-input>
          <p class="errorMsg" v-show="errors.has('firstName')">
            This field is required.
          </p>
        </div>
        <div class="boxOne">
          <p class="label">Type<span class="astrisk"> *</span></p>
          <el-select
            v-model="editLeadData.project_type"
            placeholder="Select Project Type"
            v-if="isEditMode"
          >
            <el-option
              v-for="item in propertyType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="gridContainer">
        <div class="boxOne">
          <p class="label">Stage<span  v-if="isEditMode" class="astrisk"> *</span></p>
          <el-select
            v-model="editLeadData.stage"
            placeholder="Due Date"
            @change="changeLeadStage()"
          >
            <el-option
              v-for="stage in pipeline"
              :key="stage"
              :label="stage"
              :value="stage"
            >
            </el-option>
          </el-select>
        </div>
        <div class="boxOne">
          <p class="label">Lead Source<span  v-if="isEditMode" class="astrisk"> *</span></p>
          <el-select
            v-model="editLeadData.lead_source"
            placeholder="Due Date"
            v-if="isEditMode"
          >
            <el-option
              v-for="item in leadSourceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <p class="values lead-source" v-else>
            {{ leadInfo?.lead_source || "N/A" }}
          </p>
        </div>
        <div class="boxOne">
          <p class="label">Deal Value</p>
          <el-input
            type="number"
            class="inputs-with-units"
            v-model="editLeadData.deal_value"
            v-if="isEditMode"
          >
            <template slot="append">{{ currencySymbol }}</template>
          </el-input>
          <p class="values" v-else>
            {{ currencySymbol
            }}{{
              formatNumberWithCommas(
                leadInfo?.deal_value,
                isIndianLocationOrAccount
              )
            }}
          </p>
        </div>
        <div class="boxOne">
          <p class="label">System Size</p>
          <el-input
            type="number"
            class="inputs-with-units"
            v-model="editLeadData.estimated_system_size"
            v-if="isEditMode"
          >
            <template slot="append">kW</template>
          </el-input>
          <p class="values" v-else>
            {{
              formatNumberWithCommas(
                leadInfo?.estimated_system_size,
                isIndianLocationOrAccount
              )
            }}
            kW
          </p>
        </div>
      </div>

      <div class="flexContainer5">
        <p
          class="shrtFormSmall"
          :style="{
            backgroundColor: generateColorFromName(leadInfo?.owner?.name)
              ? generateColorFromName(leadInfo?.owner?.name)
              : '#1c3366',
          }"
        >
          {{ leadInfo?.owner?.name?.[0] }}
        </p>
        <infiniteScrollUsers
          v-if="isEditMode"
          :user.sync="selectedUser"
          :isUserListDisabled="isPublicShared"
          :crmMode="true"
          style="flex-grow: 1"
        />
        <p class="ownerName" v-else>{{ leadInfo?.owner?.name }}</p>
      </div>

      <div class="gridContainer">
        <div class="boxOne" v-if="false">
          <p class="label">Pipeline</p>
          <el-input
            placeholder="Please input"
            v-model="input"
            v-if="isEditMode"
          ></el-input>
          <p class="values" v-else>{{ leadInfo.pipeline || "N/A" }}</p>
        </div>
        <div class="boxOne">
          <p class="label">Target Close Date</p>
          <el-date-picker
            v-if="isEditMode"
            v-model="editLeadData.target_closure_date"
            type="date"
            :picker-options="pickerOptions"
            format="dd-MMM-yyyy"
            value-format="yyyy-MM-dd"
            placeholder="Select a day"
          >
          </el-date-picker>
          <!-- <el-input placeholder="Please input" v-model="input" v-if="isEditMode"></el-input> -->
          <p class="values" v-else>
            {{ formatDate(leadInfo.target_closure_date) || "None" }} 
          </p>
        </div>
      </div>

      <div class="tagsContainer">
        <p class="label">Tags</p>
        <Tags
          :tagsInProps="leadInfo.tags"
          :lead="leadDetailsToSendToTags"
          :isUsingStore="true"
        />
        <!-- <div class="flexContainer6">
                <p class="tags">Last<img src="../../leadManagement/components/assets/X.svg" class="crossIcon" /></p>
                <p class="tags">Las<img src="../../leadManagement/components/assets/X.svg" class="crossIcon" /></p>
                <p class="tags">Last <img src="../../leadManagement/components/assets/X.svg" class="crossIcon" /></p>
                <img src="../../leadManagement/components/assets/add.svg" class="addIcon" />
            </div> -->
      </div>

      <p class="relCont">Related Contact</p>

      <div class="detailCont" v-if="!isEditMode">
        <p class="email">{{ leadInfo.email }}</p>
        <p class="phNo">{{ leadInfo.phone }}</p>
        <p class="contact-address" v-if="leadInfo.address">
          <img src="../../leadManagement//components/assets/distanceBlack.svg"/>
          {{ leadInfo.address }}
        </p>
        <div>
          <el-button
            type="danger"
            plain
            v-if="enableAddressAndMap"
            @click="enableAddressAndMap = false"
            >Cancel</el-button
          >
          <el-button
            type="primary"
            class="addAddrBtn"
            v-if="!leadInfo.address && !enableAddressAndMap"
            @click="enableAddressAndMap = true"
            >Add Address</el-button
          >
        </div>
        <div class="mapContainer" v-if="leadInfo.address">
          <img :src="projectImageURL" class="imgMap" />
          <el-button
            type="primary"
            class="updateBtn"
            v-if="enableAddressAndMap"
            :disabled="errors.items.length > 0"
            >Update</el-button
          >
          <div class="mapDetails" v-if="!enableAddressAndMap">
            <div class="bottomMap">
              <p class="weatherFile">Weather File</p>
              <p
                class="fileVal"
                v-if="Object.keys(selectedWeatherStation).length > 0"
              >
                {{ selectedWeatherStation.siteName }} <br />
                ({{ selectedWeatherStation.latitude }},
                {{ selectedWeatherStation.longitude }})
              </p>
              <el-button class="changeBtn" @click="weatherFileDialog = true"
                >Change</el-button
              >
            </div>
          </div>
        </div>
      </div>

      <div class="gridContainer" v-if="isEditMode">
        <div class="boxOne">
          <p class="label">Email ID<span class="astrisk"> *</span></p>
          <el-input
            placeholder="Please input"
            v-validate="emailValidation"
            name="email id"
            @input="isEmail()"
            v-model="editLeadData.email"
            v-if="isEditMode"
          >
          </el-input>
          <p class="errorMsg" v-show="errors.has('email id')">
            Please Enter a valid E-mail Address!
          </p>
        </div>
        <div class="boxOne">
          <p class="label">Phone number<span class="astrisk"> *</span></p>
          <el-input
            placeholder="Please input"
            v-validate="phNoValidation"
            onkeypress="return ((event.charCode > 47 && 
                    event.charCode < 58) || (event.charCode === 40 || event.charCode === 41 || event.charCode === 43||event.charCode === 45))"
            name="mobile number"
            @input="isPhNo()"
            type="text"
            v-model="editLeadData.phone"
            v-if="isEditMode"
          >
          </el-input>
          <p class="errorMsg" v-show="errors.has('mobile number') || isPhoneNoTooLong">
              <span v-show="isPhoneNoTooLong">Phone Number is too long.</span>
          </p>
          <p class="errorMsg" v-show="errors.has('mobile number')">
            This field is required.
          </p>
        </div>
      </div>
      <div
        v-if="isEditMode && leadInfo.address"
        style="width: 100%; margin-top: 16px; text-align: end"
      >
        <el-button
          type="primary"
          :loading="isUpdating"
          @click="updateLeadInfo('lead')"
          :disabled="errors.items.length > 0 || isUpdateDisabled"
          >Update</el-button
        >
      </div>

      <div
        class="boxOne marginTop"
        v-if="!leadInfo.address && (isEditMode || enableAddressAndMap)"
      >
        <p class="label">Address</p>
        <div class="searchBarWrapper">
          <GoogleMapsAutocompleteInputVue
            :placeholder="'Enter the property address'"
          />
        </div>
        <div class="add-address-container">
          <div style="width: 200px; height: 200px">
            <newProjectMapSelector
              :geo-location="geoLocation"
              :place="placeForMap"
            />
          </div>
          <!-- If adding address outside of edit mode, passing just address and otherwise both lead and address -->
          <el-button
            type="primary"
            :loading="isUpdating"
            @click="
              enableAddressAndMap
                ? updateLeadInfo('address')
                : updateLeadInfo('addressAndLead')
            "
            :disabled="errors.items.length > 0"
            >Update</el-button
          >
        </div>
      </div>

      <!-- <projectSummaryWeatherFile :weatherFiles.sync="weatherFiles" :weatherFileDialog.sync="weatherFileDialog"
            :selectedWeatherStation.sync="selectedWeatherStation" @fetchLatestWeatherOnceAgain="fetchLatestWeatherOnceAgain"
            @updateWeatherFile="updateWeatherFile" /> -->
    </div>
    <ShareProject
      :shareDialogBoxVisible.sync="shareDialogBoxVisible"
      :project_id="leadInfo?.project_details?.id"
    />
    <projectSummaryWeatherFile
      :weatherFiles.sync="weatherFiles"
      :weatherFileDialog.sync="weatherFileDialog"
      :selectedWeatherStation.sync="selectedWeatherStation"
      @fetchLatestWeatherOnceAgain="fetchLatestWeatherOnceAgain"
      @updateWeatherFile="updateWeatherFile"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useLeadStore } from "../../../stores/lead";
import { useMiscStore } from "../../../stores/misc";
import { useProjectStore } from "../../../stores/project";
import Tags from "../../leadManagement/components/tags.vue";
import {
  getLeadPipelineStages,
  getLeadSourceOptions,
  isCrmUser,
} from "../../../utils";
import projectSummaryWeatherFile from "../../project/components/projectSummary/weatherData/projectSummaryWeatherFile_new.vue";
import newProjectMapSelector from "../../../components/ui/newProject/newProjectMapSelector.vue";
import GoogleMapsAutocompleteInputVue from "../../../components/googleMaps/GoogleMapsAutocompleteInput.vue";
import ShareProject from "../../project/components/projectNameAndActions/shareProject.vue";
import API from "@/services/api/";
import { weatherMixin } from "../../project/components/projectSummary/weatherData/weatherMixin.js";
import infiniteScrollUsers from "@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue/";
import {
  formatNumberWithCommas,
  isUSFlagEnabled,
  generateColorFromName,
} from "@/utils.js";
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import countryToCurrency  from 'country-to-currency'

export default {
  mixins: [weatherMixin],
  components: {
    Tags,
    projectSummaryWeatherFile,
    newProjectMapSelector,
    GoogleMapsAutocompleteInputVue,
    ShareProject,
    infiniteScrollUsers,
  },
  data() {
    return {
      geoLocation: {
        center: { lat: 28.5421285, lng: 77.3348087 },
        zoom: 18,
      },
      pickerOptions: {
        disabledDate: (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        },
      },
      placeForMap: {},
      options: [
        {
          value: "Option1",
          label: "Option1",
        },
        {
          value: "Option2",
          label: "Option2",
        },
      ],
      propertyType: [
        {
          label: "Residential",
          value: "residential",
        },
        {
          label: "Commercial",
          value: "commercial",
        },
      ],
      pipeline: getLeadPipelineStages(),
      leadSourceOptions: getLeadSourceOptions(),
      value: "",
      isEditMode: false,
      isWeatherFileDialogVisible: false,
      input: "",
      hasAddress: false,
      enableAddressAndMap: false,
      editLeadData: {
        name: "",
        lead_source: "",
        deal_value: "",
        stage: "",
        address: "",
        project_type: "",
        target_closure_date: "",
        email: "",
        phone: "",
        estimated_system_size: "",
      },
      shareDialogBoxVisible: false,
      selectedWeatherStation: {},
      weatherFiles: [],
      weatherFileDialog: false,
      selectedUser: {},
      isPublicShared: false,
      isUpdating: false,
      emailValidation: {
        required: true,
        email: true,
      },
      phNoValidation: {
        required: true,
      },
      firstNameValidation: {
        required: true,
      },
      hasInvalidName: false,
      currencyCode:null,
      isUpdateDisabled: false,

    };
  },
  created() {
    console.log("lead info from store", this.leadInfo);
    this.INITIALIZE_COUNTRY_CODE(JSON.parse(localStorage.getItem('organisation'))?.country_code);
    this.fetchProjectPermissionForLead();
    this.setEditinfo();
    this.fetchWeatherInfo();
  },
  computed: {
    ...mapState(useProjectStore, {
      projectPermissionObject: "GET_PERMISISON_OBJECT",
      countryDetails: (state) => state.country_details,
    }),
    ...mapState(useLeadStore, {
      leadInfo: (state) => state,
      projectImageURL: "GET_PROJECT_IMAGE_URL",
    }),
    ...mapState(useMiscStore, {
      googleMapsState: "GET_GOOGLE_MAPS_STATE",
    }),
    isPhoneNoTooLong() {
      const phoneNumber = this.editLeadData.phone;
      if(phoneNumber && phoneNumber.length > 15){
        this.isUpdateDisabled = true;
        return true;
      }
      this.isUpdateDisabled = false;
      return false;
    },
    isIndianLocationOrAccount() {
      // If location is indian then follow indian format and if location is not added, the if country code is 91 then indian format
      if (
        Object.keys(this.countryDetails).length > 0 &&
        this.countryDetails?.country_code == "IN"
      ) {
        return true;
      } else if (Object.keys(this.countryDetails).length == 0) {
        let countryCode = JSON.parse(
          localStorage.getItem("organisation")
        ).country;
        if (countryCode == 91) return true;
      }
      return false;
    },
    currencySymbol() {
      // WARNING/TODO: Currency code should be purely organisation based and not project location based
      // since backend doesn't handle conversions/calculations for different currencies right now
      if (Object.keys(this.countryDetails).length)
        return currencySymbolNameMap[this.countryDetails["currency_code"]];
      // when no address is selected
      else {
        return currencySymbolNameMap[this.currencyCode];
        // return currencySymbolNameMap[JSON.parse(localStorage.getItem('organisation'))?.currency_code]
        
      }
    },
    leadDetailsToSendToTags() {
      return {
        id: this.leadInfo?.project_details?.id, // project id
        lead_details: {
          id: this.leadInfo?.id, // lead id
        },
      };
    },
  },
  methods: {
    ...mapActions(useMiscStore, ["INITIALIZE_COUNTRY_CODE"]),
    ...mapActions(useProjectStore, [
      "FETCH_PERMISSION_OBJECT",
      "GET_CURRENT_PROJECT",
    ]),
    ...mapActions(useLeadStore, {
      updateLead: "UPDATE_LEAD",
    }),
    formatDate(date) {
      if(date){
        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = new Date(date).toLocaleDateString("en-US", options);
        return formattedDate;
      }
      else
      return null;
    },
    initializeLeadDataForEdit() {
      this.editLeadData.name = this.leadInfo?.name;
      this.editLeadData.project_type =
        this.leadInfo?.project_details?.project_type;
      this.editLeadData.stage = this.leadInfo?.stage;
      this.editLeadData.lead_source = this.leadInfo?.lead_source;
      this.editLeadData.deal_value = this.leadInfo?.deal_value || 0;
      this.editLeadData.estimated_system_size =
        this.leadInfo?.estimated_system_size || 0;
      this.editLeadData.owner = this.leadInfo?.owner;
      this.selectedUser = this.leadInfo?.owner;
      this.editLeadData.target_closure_date =
        this.leadInfo?.target_closure_date;
      this.editLeadData.phone = this.leadInfo?.phone;
      this.editLeadData.email = this.leadInfo?.email;
    },
    functionForNotification(type, message) {
      this.$message({
        showClose: true,
        message: message,
        type: type,
        center: true,
      });
    },
    async updateAddress() {
      this.isUpdating = true;
      let patchData = {
        address: this.googleMapsState.address,
        state: this.googleMapsState.state,
        latitude: this.geoLocation.center.lat,
        longitude: this.geoLocation.center.lng,
        zoom: parseInt(this.geoLocation.zoom) + 1,
        pincode: null,
      };
      // console.log("added address",patchData);
      await this.updateLead(patchData, this.functionForNotification);
      this.isUpdating = false;
      this.enableAddressAndMap = false;
    },
    async updateLeadInfo(addressOrLeadInfo) {
      let isFormValid = false;
      await this.$validator.validateAll().then((result) => {
        if (!result) {
          // validation failed, display error messages
          const errors = this.$validator.errors.all();
          // do something with the errors, such as displaying them in a div on the page
        } else {
          isFormValid = true;
          // validation passed, submit the form normally
        }
      });
      if (this.hasInvalidName) {
        this.$message({
          showClose: true,
          message: "Full Name length can't be more than 100.",
          type: "error",
          center: true,
        });
        return;
      }
      if (!isFormValid) return;
      this.isUpdating = true;
      let patchData = {};
      if (addressOrLeadInfo == "address") {
        patchData = {
          address: this.googleMapsState.address,
          state: this.googleMapsState.state,
          latitude: this.geoLocation.center.lat,
          longitude: this.geoLocation.center.lng,
          zoom: parseInt(this.geoLocation.zoom) + 1,
          pincode: this.googleMapsState?.postalCode?.[0]?.long_name || null,
        };
      } else if (addressOrLeadInfo == "lead") {
        patchData = {
          name: this.editLeadData.name,
          phone: this.editLeadData.phone,
          email: this.editLeadData.email,
          stage: this.editLeadData.stage,
          owner: this.selectedUser.id,
          target_closure_date: this.editLeadData.target_closure_date,
          deal_value: this.editLeadData.deal_value ? this.editLeadData.deal_value : 0,
          pipeline: 1,
          project_type: this.editLeadData.project_type,
          lead_source: this.editLeadData.lead_source,
          estimated_system_size: (this.editLeadData.estimated_system_size ? this.editLeadData.estimated_system_size : 0)
        };
      } else if (addressOrLeadInfo == "addressAndLead") {
        patchData = {
          name: this.editLeadData.name,
          phone: this.editLeadData.phone,
          email: this.editLeadData.email,
          stage: this.editLeadData.stage,
          owner: this.selectedUser.id,
          target_closure_date: this.editLeadData.target_closure_date,
          deal_value:  this.editLeadData.deal_value ? this.editLeadData.deal_value : 0,
          pipeline: 1,
          project_type: this.editLeadData.project_type,
          lead_source: this.editLeadData.lead_source,
          estimated_system_size: (this.editLeadData.estimated_system_size ? this.editLeadData.estimated_system_size : 0),
          // ----------------Address/Map info--------------------------//
          // If undefined, in that case these fields will not be there in the payload//
          address: this.googleMapsState.address
            ? this.googleMapsState.address
            : undefined,
          state: this.googleMapsState.address
            ? this.googleMapsState.state
            : undefined,
          latitude: this.googleMapsState.address
            ? this.geoLocation.center.lat
            : undefined,
          longitude: this.googleMapsState.address
            ? this.geoLocation.center.lng
            : undefined,
          zoom: this.googleMapsState.address
            ? parseInt(this.geoLocation.zoom) + 1
            : undefined,
          pincode: undefined,
          //----------------------end-------------------------------------//
        };
      }
      await this.updateLead(patchData, this.functionForNotification);
      // if (Object.keys(this.countryDetails).length==0){
      //   await this.GET_CURRENT_PROJECT(this.leadInfo.project_details.id);
      // }
      this.isUpdating = false;
      this.isEditMode = false;
      this.enableAddressAndMap = false;
    },
    async fetchProjectPermissionForLead() {
      try {
        if (this.leadInfo?.project_details?.id)
          this.FETCH_PERMISSION_OBJECT(this.leadInfo?.project_details?.id);
      } catch (e) {
        console.error(e);
      }
    },
    setEditinfo() {
      for (let key of Object.keys(this.leadInfo)) {
        this.editLeadData[key] = this.leadInfo[key];
      }
    },
    toggleEditMode() {
      // this.setEditinfo()
      this.initializeLeadDataForEdit();
      this.isUpdating = false;
      this.isEditMode = !this.isEditMode;
    },
    async changeLeadStage() {
      if (this.isEditMode) {
        return;
      }

      try {
        await this.updateLead(
          { stage: this.editLeadData.stage },
          this.functionForNotification
        );
      } catch (err) {
        console.error(err);
        this.$message({
          showClose: true,
          message: "There was an error while updating the stage.",
          type: "error",
          center: true,
        });
      }
      this.setEditinfo();
    },
    async fetchLatestWeatherOnceAgain() {
      this.weatherFiles = await this.fetchWeatherFiles(
        this.leadInfo.project_details.latitude,
        this.leadInfo.project_details.longitude
      );
      this.fetchSelectedStation(this.leadInfo.project_details.weather);
    },
    async updateWeatherFile() {
      this.weatherFiles = await this.fetchWeatherFiles(
        this.leadInfo.project_details.latitude,
        this.leadInfo.project_details.longitude
      );
      this.fetchSelectedStation(this.leadInfo.project_details.weather);
    },
    // TODO: Sanchit will take care of this Share Project functionality
    openShareProjectPopup() {
      if (isCrmUser() && !this.projectPermissionObject["share_project"]) {
        this.$toastr.e("You don't have permission to share this project");
        return;
      }
      this.shareDialogBoxVisible = true;
      // this.$toastr.$message("Open Share Project Popup! (WIP lol)")
      // if (this.isCurrentUserAllowedToEdit)
      //     this.shareDialogBoxVisible = true;
      // else {
      //     this.$toastr.e("You don't have permission to share this project");
      // }
    },
    async fetchSelectedStation(weatherId) {
      if (this.leadInfo.project_details.weather !== null) {
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
        } catch (e) {
          console.log(e);
        }
      }
    },
    formatNumberWithCommas,
    isUSFlagEnabled,
    generateColorFromName,
    isEmail() {
      this.$validator.validate("email id", this.editLeadData.email);
    },
    isPhNo() {
      this.$validator.validate("mobile number", this.editLeadData.phone);
    },
    isLeadName(value) {
      if (value.length > 100) {
        this.hasInvalidName = true;
      } else {
        this.hasInvalidName = false;
      }
      this.$validator.validate("firstName", this.editLeadData.name);
    },
    isCrmUser,
    async fetchWeatherInfo(){
        let lat = this.leadInfo?.project_details?.latitude
        let lng = this.leadInfo?.project_details?.longitude
        if (!(lat && lng)) { return }

        this.weatherFiles = await this.fetchWeatherFiles(lat, lng);
        this.fetchSelectedStation(this.leadInfo.project_details.weather);
    }
  },
    watch: {
        "leadInfo.stage": function () {
            this.setEditinfo();
        },
        // Avoiding deep watcher as it breaks the lead summary page for some reason
        "leadInfo.project_details.latitude": async function () {
            await this.fetchWeatherInfo();
            this.initializeLeadDataForEdit();
        },
        googleMapsState:{
          deep:true,
          handler(val){
            this.currencyCode = countryToCurrency[val?.countryCode];
          }
        }
    }
   
    
};
</script>

<style scoped>
p,
span,
h1,
h2,
h3 {
  word-break: break-word;
}

.leadProContainer {
  background-color: #fff;
  height: 100%;
  min-width: 380px;
  max-width: 400px;
  padding: 24px;
  overflow-y: auto;
}

.backBtn {
  font-size: 18px;
  color: #222;
  display: flex;
  align-items: center;
  gap: 16px;
}

.backBtn::before {
  content: "";
  background: url("../assets/ArrowLeftShort.svg");
  width: 20px;
  height: 20px;
  display: block;
}

.flexContainer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.flexContainer {
  margin-bottom: 24px;
}

.flexContainer2 {
  display: grid;
  grid-template-columns: 60px auto;
  align-items: center;
  gap: 16px;
}

.shrtForm {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  font-size: 32px;
  color: #fff;
  background-color: #ef6c00;
  border-radius: 50%;
}

.flexContainer3 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
  max-width: 162px;
  font-size: 24px;
  font-weight: bold;
  color: #222;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.abbrTag {
  text-decoration: none;
}

.res {
  font-size: 14px;
  color: #777;
  text-transform: capitalize;
}

.iconContainer {
  display: flex;
}

.editIcon {
  margin-left: 16px;
}

.shareIcon,
.editIcon {
  cursor: pointer;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.marginBottom {
  margin-bottom: 16px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.inputs-with-units >>> .el-input-group__append {
  padding: 0 1em;
  background-color: #e8edf2;
  border: none;
  color: #777;
}

.searchBarWrapper {
  margin-bottom: 16px;
}

.leadProContainer >>> .el-select {
  width: 100%;
}

.leadProContainer >>> .el-input__inner {
  border: none;
  background-color: #e8edf2;
  height: 40px;
  font-size: 16px;
  color: #222222;
}

.leadProContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  position: relative;
  top: 2px;
  transform: rotate(0deg);
}

.leadProContainer >>> .el-select .el-input .el-select__caret.is-reverse {
  position: relative;
  top: 0px;
  transform: rotate(180deg);
}

.leadProContainer >>> .el-icon-arrow-up:before {
  content: url("../../leadManagement/components/assets/CaretDownFill.svg");
}

.leadProContainer >>> .el-input__inner::placeholder {
  font-size: 16px;
  color: #222;
}

.values {
  margin-top: 14px;
}

.lead-source {
  text-transform: capitalize;
}

.flexContainer5 {
  display: grid;
  grid-template-columns: 39px auto;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  margin-bottom: 16px;
}

.shrtFormSmall {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: #fff;
  background-color: #1c3366;
  border-radius: 50%;
}

.ownerName {
  font-size: 16px;
  color: #222;
}

.tagsContainer {
  margin-bottom: 24px;
  margin-top: 24px;
}

.flexContainer6 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.tags {
  padding: 4px 12px;
  border-radius: 50px;
  background-color: #e8edf2;
  color: #222;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.addIcon,
.crossIcon {
  cursor: pointer;
}

.relCont {
  font-size: 20px;
  font-weight: 600;
  color: #1c3366;
  margin-bottom: 16px;
}

.marginTop {
  margin-top: 16px;
}

.detailCont {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.email,
.phNo,
.contact-address {
  font-size: 16px;
  color: #222;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}


.email::before {
  content: "";
  background: url("../assets/mail.png");
  width: 20px;
  height: 20px;
  display: block;
}

.phNo::before {
  content: "";
  background: url("../assets/call-non-optimized.png");
  width: 20px;
  height: 20px;
  display: block;
}

.addAddrBtn {
  width: 119px;
  height: 37px;
  font-size: 16px;
  font-weight: 600;
  padding: 0px;
}

.mapContainer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 16px;
  gap: 16px;
}

.add-address-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.imgMap {
  width: 165px;
  height: 165px;
  border-radius: 8px;
}

.updateBtn {
  font-size: 16px;
  font-weight: 600;
}

.mapDetails {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

.bottomMap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.addressMap,
.fileVal {
  font-size: 16px;
  color: #222;
}

.weatherFile {
  font-size: 14px;
  color: #777;
}

.changeBtn {
  border-radius: 4px;
  border: 1px solid #409eff;
  background-color: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  width: 80px;
  padding: 0px;
  height: 32px;
}

#usersInfiniteScroll {
  margin-bottom: 0px !important;
}

.astrisk {
  font-size: 12px;
  font-weight: 600;
  color: #f00;
}
.errorMsg {
  color: rgb(214, 12, 12);
  font-size: 14px;
  margin-top: 4px;
}
</style>
