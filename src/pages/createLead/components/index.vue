<template>
  <div class="createLead">
    <slot name="header">
      <div class="title">
        <h4 style="font-weight: bolder; padding: 1rem 0.5rem 20px">
          Create Lead
        </h4>
        <el-button
          v-if="environment == 'dev'"
          type="primary"
          class="leadBtn"
          @click="autofillValues"
          >Autofill</el-button
        >
        <span
          class="cross"
          @click="onClose()"
          style="
            font-weight: bolder;
            padding: 0.75rem 0.5rem 20px;
            cursor: pointer;
          "
          >&#x2716;</span
        >
      </div>
    </slot>
    <slot name="body">
      <div class="parentBody">
        <div class="parent">
          <div class="div1 forLabel">
            <label for="" class="labelClass"
              >Full Name<span class="astrisk"> *</span></label
            >
            <el-input
              placeholder="Enter Name"
              v-model="userDetails.leadName"
              v-validate="firstNameValidation"
              name="firstName"
              @input="isLeadName($event)"
            ></el-input>
            <p class="errorMsg" v-show="errors.has('firstName')">
              This field is required.
            </p>
          </div>
          <div class="div2 forLabel">
            <label for="" class="labelClass"
              >Select Owner<span class="astrisk"> *</span></label
            >
            <el-select
              placeholder="Select an Owner"
              v-model="userDetails.ownerName"
              name="ownerName"
              v-validate="ownerValidation"
            >
              <el-option
                v-for="owner in owners"
                :key="owner.id"
                :label="owner.first_name + ' ' + owner.last_name"
                :value="owner.id"
              >
              </el-option>
            </el-select>
            <p class="errorMsg" v-show="errors.has('ownerName')">
              This field is required.
            </p>
          </div>
          <div class="div3 forLabel">
            <label for="" class="labelClass"
              >Email ID<span class="astrisk"> *</span></label
            >
            <el-input
              placeholder="Enter Email ID"
              v-model="userDetails.leadEmailId"
              v-validate="emailValidation"
              name="email id"
              @input="isEmail()"
            ></el-input>
            <p class="errorMsg" v-show="errors.has('email id') && isEmailTooLong">
              <span>Email address is too long.</span>
            </p>
            <p class="errorMsg" v-show="errors.has('email id') && !isEmailTooLong">
              This field is required.
            </p>
          </div>
          <div class="div4 forLabel">
            <label for="" class="labelClass"
              >Phone number<span class="astrisk"> *</span></label
            >
            <el-input
              onkeypress="return ((event.charCode > 47 && 
              event.charCode < 58) || (event.charCode === 40 || event.charCode === 41 || event.charCode === 43||event.charCode === 45))"
              placeholder="Enter phone number"
              v-model="userDetails.leadPhone"
              type="text"
              v-validate="phNoValidation"
              name="mobile number"
              @input="isPhNo()"
            >
            </el-input>
            <p class="errorMsg" v-show="errors.has('mobile number') || isPhoneNoTooLong">
              <span v-show="isPhoneNoTooLong">Phone Number is too long.</span>
            </p>
            <p class="errorMsg" v-show="errors.has('mobile number')">
              This field is required.
            </p>
          </div>
          <div class="div5 forLabel">
            <label for="" class="labelClass"
              >Property Type<span class="astrisk"> *</span></label
            >
            <el-select
              placeholder="Select a property type"
              v-model="userDetails.propertyType"
              name="propertyType"
              v-validate="propertyTypeValidation"
            >
              <el-option
                v-for="propertyType in propertyType"
                :key="propertyType.value"
                :label="propertyType.label"
                :value="propertyType.value"
              >
              </el-option>
            </el-select>
            <p class="errorMsg" v-show="errors.has('propertyType')">
              This field is required.
            </p>
          </div>
          <div class="div6 forLabel">
            <label for="" class="labelClass"
              >Stage<span class="astrisk"> *</span></label
            >
            <el-select
              placeholder="Select a Stage"
              v-model="userDetails.stage"
              name="stage"
              v-validate="stageValidation"
            >
              <el-option
                v-for="stage in pipeline"
                :key="stage"
                :label="stage"
                :value="stage"
              >
              </el-option>
            </el-select>
            <p class="errorMsg" v-show="errors.has('stage')">
              This field is required.
            </p>
          </div>
          <div class="div7 forLabel">
            <label for="" class="labelClass"
              >Lead Source<span class="astrisk"> *</span></label
            >
            <el-select
              placeholder="Select a lead source type"
              v-model="userDetails.leadSource"
              name="leadSource"
              v-validate="leadSourceValidation"
            >
              <el-option
                v-for="stage in leadSource"
                :key="stage.value"
                :label="stage.label"
                :value="stage.value"
              >
              </el-option>
            </el-select>
            <p class="errorMsg" v-show="errors.has('leadSource')">
              This field is required.
            </p>
          </div>
        </div>
        <div class="container">
          <div class="oneColumn">
            <div class="column forLabel">
              <label for="" class="labelClass">Address</label>
              <div class="createLeadSearchBarWrapper">
                <GoogleMapsAutocompleteInputVue
                  @placesChanged="isMapDisabled = false"
                  :placeholder="'Enter the property address'"
                />
              </div>
            </div>
            <div class="column forLabel">
              <label for="" class="labelClass">Target Close Date</label>
              <DatePicker
                :label="false"
                @dateChanged="onDateChange"
                :disabledPrev="true"
              />
            </div>
            <div class="column forLabel">
              <label for="" class="labelClass">Deal Value</label>
              <el-input
                placeholder="Enter potential deal value"
                class="inputs-with-units"
                v-model="userDetails.dealValue"
                name="dealValue"
                oninput="this.value = this.value.replace(/[^0-9]/g, '');"
              >
                <template slot="append">{{ currencySymbol }}</template>
              </el-input>
            </div>
            <!-- <div class="column forLabel" style="width: 173%">
              <label for="" class="labelClass">Tags</label>
              <Tags />
            </div> -->
          </div>
          <div class="big-div forLabel">
            <div class="map">
              <div class="map-container">
                <div
                  class="map-disabled-overlay"
                  v-if="isMapDisabled"
                  style="display: flex; flex-direction: column"
                >
                  <img src="./assests/location_logo.svg" />
                  <p style="padding-top: 26px" class="map-disabled-text">
                    Enter an address to view the map
                  </p>
                </div>
                <!-- <p class="formHeadings"> Mark Location </p> -->
                <newProjectMapSelector
                  :geo-location="geoLocation"
                  :place="placeForMap"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="column forLabel" style="width: 100%">
          <label for="" class="labelClass">Tags</label>
          <!-- <el-select multiple filterable allow-create placeholder="Add tags to help your group leads (optional)" v-model="userDetails.tags"></el-select> -->
          <Tags
            :isCreateLeadMode="true"
            :isUsingStore="false"
            @fetchTagsToSendForLead="fetchTagsToSendForLead"
          />
        </div>
      </div>
    </slot>
    <slot name="footer">
      <div class="footerContainer">
        <el-button
          type="primary"
          class="leadBtn"
          @click="submitDetails()"
          :loading="loadingStateButton"
          :disabled="errors.items.length > 0 || isdisabled"
          >Create Lead</el-button
        >
      </div>
    </slot>
  </div>
</template>

<script>
import API from "@/services/api/";
import { mapState, mapActions } from "pinia";
import { useMiscStore } from "../../../stores/misc";
import Tags from "../../leadManagement/components/tags.vue";
import newProjectMapSelector from "./../../../components/ui/newProject/newProjectMapSelector.vue";
import GoogleMapsAutocompleteInputVue from "./../../../components/googleMaps/GoogleMapsAutocompleteInput.vue";
import onlySaveFooter from "./../../commonComponents/allFooters/onlySaveFooter.vue";
import DatePicker from "../../setReminder/components/datePicker.vue";

import { getLeadPipelineStages, getLeadSourceOptions } from "../../../utils";
import { environment } from "../../../constants";
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import countryToCurrency  from 'country-to-currency'


export default {
  data() {
    return {
      isdisabled:false,
      geoLocation: {
        center: { lat: 28.5421285, lng: 77.3348087 },
        zoom: 3,
      },
      firstNameValidation: {
        required: true,
      },
      emailValidation: {
        required: true,
        email: true,
      },
      phNoValidation: {
        required: true,
      },
      ownerValidation: {
        required: true,
      },
      propertyTypeValidation: {
        required: true,
      },
      stageValidation: {
        required: true,
      },
      leadSourceValidation: {
        required: true,
      },
      userDetails: {
        leadName: "",
        ownerName: "",
        leadEmailId: "",
        leadPhone: null,
        propertyType: null,
        stage: "",
        leadSource: "",
        targetCloseDate: "",
        dealValue: "",
        tags: [],
        address: "",
        longitude: null,
        latitude: null,
        pipeline: null,
        quotaType: null,
        isPublicSharingEnabled: false,
      },
      hasInvalidName: false,
      placeForMap: {},
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
      owners: [],
      pipeline: getLeadPipelineStages(),
      leadSource: getLeadSourceOptions(),
      loadingStateButton: false,
      isMapDisabled: true,
      environment,
      currencyCode:null,
    };
  },
  components: {
    newProjectMapSelector,
    GoogleMapsAutocompleteInputVue,
    onlySaveFooter,
    DatePicker,
    Tags,
  },

  computed: {
    isEmailTooLong() {
      if(this.userDetails.leadEmailId.length > 50){
        this.isdisabled=true;
        return true;
      }
      this.isdisabled=false;
      return false;
    },
    isPhoneNoTooLong() {
      const phoneNumber = this.userDetails.leadPhone;
      if(phoneNumber && phoneNumber.length > 20){
        this.isdisabled=true;
        return true;
      }
      this.isdisabled=false;
      return false;
    },
    ...mapState(useMiscStore, {
      googleMapsState: "GET_GOOGLE_MAPS_STATE",
    }),
    isValidEmail() {
      return /^[^@]+@\w+(\.\w+)+\w$/.test(this.userDetails.leadEmailId);
    },
    currencySymbol() {
      // let orgCurrencyCode = JSON.parse(localStorage.getItem('organisation'))?.currency_code
      return currencySymbolNameMap[this.currencyCode]
    }
  },

  methods: {
    ...mapActions(useMiscStore, ["INITIALIZE_COUNTRY_CODE"]),
    fetchTagsToSendForLead(finalTagsToSend) {
      let tags = finalTagsToSend.map((item) => item.id);
      this.userDetails.tags = [...tags];
    },
    isLeadName(value) {
      if (value.length > 100) {
        this.hasInvalidName = true;
      } else {
        this.hasInvalidName = false;
      }
      this.$validator.validate("firstName", this.userDetails.leadName);
    },
    isEmail() {
      this.$validator.validate("email id", this.userDetails.leadEmailId);
    },
    isPhNo() {
      this.$validator.validate("mobile number", this.userDetails.leadPhone);
    },
    getDataFromLS() {
      let dataFromLS = JSON.parse(localStorage.getItem("organisation"));
      let pipelineFromLS = dataFromLS.pipelines[0].id;
      let isSharingEnabledFromLS = dataFromLS.is_public_sharing_enable;
      this.userDetails.pipeline = pipelineFromLS;
      this.currencyCode = JSON.parse(localStorage.getItem("organisation")).currency_code;
      // this.userDetails.isPublicSharingEnabled = isSharingEnabledFromLS;
    },
    setPlace(place) {
      this.placeForMap = place;
    },
    onSave() {
      this.$emit("save", false);
    },
    onClose() {
      this.$emit("close", false);
    },
    onDateChange(val) {
      if (val) {
        let dateStr = val;
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, "0");
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let year = String(date.getFullYear()).slice(0);
        const formattedDate = `${year}-${month}-${day}`;
        this.userDetails.targetCloseDate = formattedDate;
      } else {
        this.userDetails.targetCloseDate = val;
      }
    },
    async fetchAllUsers() {
      let response;
      try {
        response = await API.USERS.FETCH_ALL_USERS();
        for (let i = 0; i < response.data.results.length; i++) {
          this.owners.push(response.data.results[i]);
        }
      } catch (e) {
        this.$message({
          showClose: true,
          message: e,
          type: "error",
          center: true,
        });
      }
    },
    async postSharingPermissions(projectID) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let isChangePermissionAllowed = true;
      // let isChangePermissionAllowed = ["DESIGNER", "ADMIN"].includes(user.role); // commneted for now for future references
      let payload = {
        new_users: [
          {
            email: user.email,
            permission: isChangePermissionAllowed ? "change" : "view",
          },
        ],
        lead_owner: [
          {
            user_id: this.userDetails.ownerName,
          },
        ],
      };

      try {
        const response = await API.PROJECTS.POST_PROJECT_PERMISSIONS(
          projectID,
          payload
        );
      } catch (e) {
        console.log(e);
      }
    },
    async submitDetails() {
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

      if (isFormValid) {
        this.loadingStateButton = true;
        let response;
        try {
          const postData = {
            name: this.userDetails.leadName,
            phone: this.userDetails.leadPhone,
            email: this.userDetails.leadEmailId,
            address: this.googleMapsState.address,
            stage: this.userDetails.stage,
            owner: this.userDetails.ownerName,
            lead_source: this.userDetails.leadSource,
            target_closure_date: this.userDetails.targetCloseDate || undefined,
            deal_value: this.userDetails.dealValue || undefined,
            pipeline: this.userDetails.pipeline,
            tags: this.userDetails.tags,
            project_type: this.userDetails.propertyType,
            quota_type: this.userDetails.quotaType,
            is_public_sharing_enabled: this.userDetails.isPublicSharingEnabled,
          };
          if (this.googleMapsState.address) {
            postData.latitude = this.geoLocation.center.lat
              ? this.geoLocation.center.lat
              : null;
            postData.longitude = this.geoLocation.center.lng
              ? this.geoLocation.center.lng
              : null;
            postData.zoom = parseInt(this.geoLocation.zoom) + 1;
            postData.pincode = this.googleMapsState?.postalCode?.[0]?.long_name
              ? this.googleMapsState?.postalCode?.[0]?.long_name
              : null;
            postData.state = this.googleMapsState.state;
          }
          response = await API.LEADS.POST_USER_INFO(postData);
          let createdProjectId = response.data.project_details.id;
          let createdLeadId = response.data.id;
          if (!this.userDetails.isPublicSharingEnabled) {
           await this.postSharingPermissions(createdProjectId);
          }
          this.$router.push({
            name: "leadSummary",
            params: { leadId: createdLeadId },
          });
          this.loadingStateButton = false;
        } catch (e) {
          console.error(e);
          this.$message({
            showClose: true,
            message: e,
            type: "There was an error while creating a new lead.",
            center: true,
          });
          this.loadingStateButton = false;
        }
      }
    },
    autofillValues() {
      this.userDetails.leadName = "Lead Name";
      this.userDetails.ownerName = 1596;
      this.userDetails.leadEmailId = "lead.name@gmail.com";
      this.userDetails.leadPhone = "9228383048";
      this.userDetails.propertyType = "residential";
      this.userDetails.stage = "Lead";
      this.userDetails.leadSource = "website";
    },
  },
  created() {
    this.INITIALIZE_COUNTRY_CODE(JSON.parse(localStorage.getItem('organisation'))?.country_code);
    this.fetchAllUsers();
    this.getDataFromLS();
    console.log("werwqedwqdwqdwqdwdsa", this.googleMapsState);
    this.userDetails.stage = this.$props.drawerStage
      ? this.$props.drawerStage
      : "";
  },
  props: {
    drawerStage: {
      type: String,
    },
  },

  watch: {
    drawerStage(val) {
      console.log(val);
      this.userDetails.stage = this.$props.drawerStage
        ? this.$props.drawerStage
        : "";
    },
    googleMapsState:{
      deep:true,
      handler(val){
        this.currencyCode = countryToCurrency[val?.countryCode];
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.errorMsg {
  color: rgb(214, 12, 12);
  font-size: 14px;
  margin-top: 4px;
}

.astrisk {
  font-size: 12px;
  font-weight: 600;
  color: #f00;
}

.wholeBody {
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
}

.title {
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.parentBody {
  padding: 24px 24px 88px 24px;
}
.parent {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 25px;
  grid-row-gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ccc;
}

.div1 {
  grid-area: 1 / 1 / 2 / 2;
}
.div2 {
  grid-area: 1 / 2 / 2 / 3;
}
.div3 {
  grid-area: 2 / 1 / 3 / 2;
}
.div4 {
  grid-area: 2 / 2 / 3 / 3;
}
.div5 {
  grid-area: 3 / 1 / 4 / 2;
}
.div6 {
  grid-area: 3 / 2 / 4 / 3;
}

.div7 {
  grid-area: 4 / 1 / 5 / 3; /* Span across both columns */
}

.forLabel {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.map {
  background-color: lightblue;
  height: 100%;
}

.labelClass {
  font-size: 14px;
  color: #777;
  font-weight: 600;
}

.inputs-with-units::v-deep .el-input-group__append {
  padding: 0 1em;
  background-color: #e8edf2;
  border: none;
  color: #777;
}

.map-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.map-disabled-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background: #e8edf2;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.map-disabled-text {
  width: 60%;
}

.oneColumn {
  flex-basis: 60%;
}
.container {
  display: flex;
  padding: 16px 0px 0px 0px;
  gap: 24px;
}

/* Style for the column divs */
.column {
  flex-basis: 25%; /* Adjust the width as needed */
  padding: 10px 0px;
  box-sizing: border-box;
}

/* Style for the big div */
.big-div {
  flex-basis: 40%; /* Adjust the width as needed */
  padding: 10px 0px;
  box-sizing: border-box;
}

.footerContainer {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  justify-content: flex-end;
  padding: 24px;
  background-color: #fff;
  width: 100%;
  z-index: 10;
}

.leadBtn {
  font-size: 16px;
  font-weight: 600;
  width: 123px;
  height: 40px;
  padding: 0px;
  border-radius: 8px;
}
</style>

<style scoped>
.createLead >>> .el-input__inner {
  height: 48px !important;
  background-color: #e8edf2;
  border: none;
  font-size: 16px;
  color: #222;
}

.createLead >>> .el-input__inner::placeholder {
  color: #777;
}

.createLead >>> .el-select {
  height: 45px !important;
  background-color: #e8edf2;
  width: 100% !important;
  max-width: none !important;
  border-radius: 4px;
}

.createLead >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

.datePicker {
  padding: 0px;
}
</style>
