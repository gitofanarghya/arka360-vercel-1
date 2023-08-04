<template>
  <div class="organisationProfile" v-loading="isLoading">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <main class="main-controller">
      <div class="backdrop"></div>
      <Sidebar :isSidebarOpen="isSidebarOpen" />
      <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
        <div class="content_section">
          <div class="filter_section" style="justify-content:flex-start">
            <div class="title">Organization Profile</div>
          </div>

          <div class="favorite_section">
            <div class="tabs_section">
              <el-tabs v-model="activeTab">
               <el-tab-pane
              :label="tab.label"
              :name="tab.label"
              v-for="(tab, index) in availableTabs"
              :key="index"
              >
              <!-- <OrdersData :typeOfTab="tab.value" id="1" /> -->
             <div class="profile_controller org_page" v-if="activeTab == 'Organization'">
              <div class="col_row">
              <div class="col col_left">
                <div class="card">
                  <div class="profile_form">
                    <div class="profile_icon rectangle">
                      <figure>
                        <img
                          v-if="organisationSettingsData.logoUrl"
                          :src="organisationSettingsData.logoUrl"
                          alt="Organization Name"
                        />
                        <span class="change_btn">
                          <img src="../../../assets/drop/camera.svg" alt="" style="cursor:pointer;">
                          <!-- <i class="fas fa-camera"> -->
                            <!-- <input type="file"  /> -->
                            <input
                              type="file"
                              accept=".jpeg,.jpg,.png,"
                              @change="beforeLogoUpload($event);"
                              ref="file"
                              name="image"
                              id="file"
                            />
                          <!-- </i> -->
                        </span>
                      </figure>
                    </div>
                    <div class="floating-form">
                      <div class="floating-label">
                        <input
                          class="floating-input"
                          name="Name"
                          type="text"
                          placeholder=" "
                          v-validate="organisationNameValidation"
                          v-model="organisationSettingsData.name"
                          v-on:input="
                            saveModeToTrue();
                            cancelModeToTrue();
                          "
                        />
                        <p class="formErrors">
                          <span>
                            {{ errors.first("Name") }}
                          </span>
                        </p>
                        <label>Organization Name</label>
                      </div>
                      <div class="floating-label">
                        <input
                          class="floating-input"
                          name="Email"
                          type="text"
                          placeholder=" "
                          v-validate="emailValidation"
                          v-model="organisationSettingsData.email"
                        />
                        <p v-if="!isEmailValid" id="err-email">Please Enter a valid E-mail Address!</p>
                        <p class="formErrors">
                          <span>
                            {{ errors.first("Email") }}
                          </span>
                        </p>
                        <label>Email Id</label>
                      </div>
                      <div class="floating-label">
                        <!-- <div class="cCode" >                      
                          <vue-tel-input 
                            :defaultCountry="defaultCountryCode" 
                            :dropdownOptions="{showFlags:true,showDialCodeInSelection:true}" 
                            @country-changed="setCountryCode"
                            style="width:4rem; height:2.8rem; margin-right 0.5rem;">
                          </vue-tel-input>
                        </div> -->
                        <input
                          class="floating-input"
                          name="Contact Number"
                          type="text"
                          onkeypress="return((event.charCode > 47 && event.charCode < 58)||(event.charCode === 40)|| (event.charCode === 41)||(event.charCode === 43)||(event.charCode === 45))"
                          placeholder=" "
                          v-model="organisationSettingsData.phone"
                          v-validate="checkMobileNumberValidation"
                        />
                        <p v-if="!isMobileValid" id="err-phone">Please Enter a valid Mobile Number!</p>
                        <p class="formErrors">
                          <span>
                            {{ errors.first("Contact Number") }}
                          </span>
                        </p>
                        <label>Mobile Number</label>
                      </div>
                      <div class="floating-label">
                        <input
                          class="floating-input"
                          name="Website"
                          type="text"
                          placeholder=" "
                          v-model="organisationSettingsData.website"
                          v-on:input="
                            saveModeToTrue();
                            cancelModeToTrue();"
                        />
                        <label>Website</label>
                      </div>
                      <div class="floating-label">
                        <textarea
                          class="floating-input floating-textarea"
                          name="Address"
                          placeholder=" "
                          v-validate="addressValidation"
                          v-model="organisationSettingsData.address"
                          v-on:input="
                            saveModeToTrue();
                            cancelModeToTrue();"
                        >
                        </textarea>
                        <p  class="formErrors">
                          <span>
                            {{errors.first("Address")}}
                          </span>
                        </p>
                        <label>Address</label>
                      </div>
                      <div class="sumbmit_btn">
                        <!-- <input class="btn btn-primary" disabled type="submit" value="Save" /> -->
                        <button
                          @click="onSave()"
                          class="btn btn-primary"
                          :disabled="
                            organisationSettingsData.name === '' ||
                            organisationSettingsData.email === '' ||
                            organisationSettingsData.phone === '' ||
                            organisationSettingsData.address === '' ||
                            !saveMode
                          "
                        >
                          Save
                        </button>
                        <button
                          :disabled="!cancelMode"
                          @click="
                            onOrganisationCancel();
                            saveModeToFalse();
                            cancelModeToFalse();
                          "
                          class="btn btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col col_right">
                <div class="card">
                  <h4>About Us</h4>
                  <div v-if="!editMode" class="about_content">
                    <div class="floating-label">
                      <p style="white-space: pre-line;">
                        {{ organisationSettingsData.aboutUs }}
                      </p>
                    </div>
                  </div>
                  <div class="edit_btn" v-if="!editMode">
                      <button
                        @click="
                          toggleEditMode();
                          delayAutoResizeAboutUs();
                        "
                        class="btn btn-outline"
                      >
                        Edit
                      </button>
                    </div>
                  <div v-if="editMode" class="about_content">
                    <div class="floating-label">
                      <textarea
                        id="autoresizing"
                        role="textbox"
                        class="floating-input floating-textarea"
                        name="aboutUs"
                        placeholder=" "
                        @keydown="autoResizeAboutUs();"
                        v-validate="{
                          max: 900,
                          regex: /^\s*\S+(?:\s+\S+){0,199}\s*$/,
                        }"
                        v-model="organisationSettingsData.aboutUs"
                      >
                      </textarea>
                      <p class="formErrors">
                        <span>{{ errors.first("aboutUs") }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="edit_btn" v-if="editMode" >
                      <button
                        @click="
                          toggleEditMode();
                          updateOrganisationSettings();
                        "
                        class="btn btn-primary"
                        :disabled="
                          organisationSettingsData.aboutUs?.length > 900
                        "
                      >
                        Save
                      </button>
                    </div>
                </div>
              </div>
             </div>
            </div>
             
              </el-tab-pane>
             <OurTeam v-if="activeTab == 'Our Team'" :team_members="team_members"/>
             <FaqsOrg v-if="activeTab == 'FAQs'" :frequently_asked_questions="frequently_asked_questions"/>
             <PreviousProject v-if="activeTab == 'Previous Projects'" :previous_projects="previous_projects"/>
              </el-tabs>
            </div>
          </div>
        </div>
      </section>
      <div id="error-msg-block">E-mail Id is incorrect</div>
    </main>
  </div>
</template>

<script>
import API from "@/services/api/";
import Vue from 'vue';
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/dist/vue-tel-input.css';
Vue.use(VueTelInput);
import Navbar from "@/components/ui/newNavbar.vue";
import Sidebar from "@/components/ui/sidebar.vue";
import { Validator } from "vee-validate";
import {
  checkEmailValidation,
  checkMobileNumberValidation,
} from "../../../core/utils/utils";
import OurTeam from "./components/ourTeam.vue";
import FaqsOrg from "./components/faqsOrg.vue";
import PreviousProject from "./components/previousProjects.vue";
import { isCrmUser } from "../../../utils";


const dict = {
  custom: {
    aboutUs: {
      max: "The About Us field can contain a maximum of 900 characters",
      regex: "The About Us field can contain a maximum of 200 words",
    },
  },
};

Validator.localize("en", dict);

export default {
  name: "OrganisationSettings",
  components: {
    Navbar,
    Sidebar,
    OurTeam,
    FaqsOrg,
    PreviousProject,
  },

  data() {
    return {
      activeTab: "Organization",
      msg: " I am in organisationSettings",
      userMobile: null,
      country: null,
      isSidebarOpen: false,
      isLoading: false,
      editMode: false,
      saveMode: false,
      cancelMode: false,
      counter: 1,
      currentPage: "organisationSummary",
      organisationSettingsData: {
        name: "",
        phone: "",
        email: "",
        website: "",
        cin: "",
        address: "",
        logoUrl: "",
        aboutUs: "",
        nearmapEnabled: false,
        nearmapApiKey: "",
        countryCode: "355",
      },
      organisationSettingsDataTemp: {
        name: "",
        phone: "",
        email: "",
        website: "",
        cin: "",
        address: "",
        logoUrl: "",
        aboutUs: "",
        nearmapEnabled: false,
        nearmapApiKey: "",
        countryCode: "355",
      },
      organisationNameValidation: {
        required: true,
      },
      contactNumberValidation: {
        required: true,
      },
      checkMobileNumberValidation: {
        required: true,
      },
      emailValidation: {
        required: true,
      },
      websiteValidation: {
        required: true,
      },
      addressValidation: {
        required: true,
      },
      aboutUsValidation: {
        max: 900,
      },

      currentHeightOfAboutUs: 200,
      isEmailValid:true,
      isMobileValid: true,
      defaultCountryCode: 0,
      team_members : [],
      previous_projects : {
        previous_project_one_image : null,
        previous_project_one_name : null,
        previous_project_three_image : null,
        previous_project_three_name : null,
        previous_project_two_image : null,
        previous_project_two_name : null,
      },
      frequently_asked_questions : [],
    };
  },
  computed: {
    nearmapApiKeyValidation() {
      return {
        required: this.organisationSettingsData.nearmapEnabled,
      };
    },
    onChangeEmail(){
      return this.organisationSettingsData.email;
    },
    onChangeMobile(){
      return this.organisationSettingsData.phone;
    },
    aboutUsForTriggerEvent(){
      return this.organisationSettingsData.aboutUs;
    },
    availableTabs(){
      return [{ label: "Organization"},{ label: "Our Team"},{ label: "FAQs",},{ label: "Previous Projects",},] 
        }
  },
  watch:{
    onChangeEmail:{
      handler(){
        this.checkEmail();
      }
    },
    onChangeMobile:{
      handler(){
        this.checkMobile();
      }
    },
    aboutUsForTriggerEvent:{
      handler(value){
        this.delayAutoResizeAboutUs();
      }
    }
  },
  created() {
    this.fetchOrganisationSettings();
  },
  methods: {
    isCrmUser,
    async onSave(){
      const isValuesValid = await this.$validator.validateAll();
      if (isValuesValid) {
        this.updateOrganisationSettings();
        this.saveModeToFalse();
        this.cancelModeToFalse();
      }
    },
    delayAutoResizeAboutUs(){
        setTimeout(this.autoResizeAboutUs,100);
    },
    autoResizeAboutUs() {
      try{
        let textArea = document.getElementById("autoresizing");
        textArea.style.height = "auto";
        textArea.style.height = String(Number(textArea.scrollHeight)+20) + "px";
      }
      catch{
      }
    },
    cancelModeToFalse() {
      this.cancelMode = false;
    },
    cancelModeToTrue() {
      this.cancelMode = true;
    },
    saveModeToTrue() {
      this.saveMode = true;
    },
    saveModeToFalse() {
      this.saveMode = false;
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    checkEmail() {
      if(this.organisationSettingsData.email === this.organisationSettingsDataTemp.email){
        this.saveMode = false;
        this.cancelMode = false;
        this.isEmailValid=true;
        return;
      }
      if(this.organisationSettingsData.email==='')
      {
        this.saveMode=false;
        this.cancelMode = true;
        this.isEmailValid=true;
        return;
      }
      if (!checkEmailValidation(this.organisationSettingsData.email)) {
        // this.callErrorMessageBlock('Invalid Email Id');
        this.saveMode = false;
        this.cancelMode = true;
        this.isEmailValid=false;
        
      } else {
        this.isEmailValid=true;
        this.saveMode = true;
        this.cancelMode = true;
      }
    },
    hideEmailWarning() {
      //  document.getElementById("err-email").style.display = "none";
      this.isEmailValid = true;
    },
    checkMobile() {

      if(this.organisationSettingsData.phone === this.organisationSettingsDataTemp.phone){
        this.saveMode = false;
        this.cancelMode = false;
        this.isMobileValid = true;
        // document.getElementById("err-phone").style.display = "none";
        return;
      }
       if(this.organisationSettingsData.phone==='')
      {
        this.saveMode=false;
        this.cancelMode = true;
        return;
      }
      // if (!checkMobileNumberValidation(this.organisationSettingsData.phone)) {
      //   this.saveMode = false;
      //   this.cancelMode = true;
      //   this.isMobileValid = false;
        
      // } else {
      //   this.isMobileValid = true;
      //   this.saveMode = true;
      //   this.cancelMode = true;
      // }
        this.isMobileValid = true;
        this.saveMode = true;
        this.cancelMode = true;
    },
    hideMobileWarning(){
      this.isMobileValid = true;
        //  document.getElementById("err-phone").style.display = "none";
    },

    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },
    success() {
      this.$message({
        showClose: true,
        message: "Organisation Settings are updated successfully.",
        type: "success",
        center: true
      });
    },
    failure() {
      this.$message({
        showClose: true,
        message: "Error in updating Organisation settings. Try Again.",
        type: "error",
        center: true
      });
    },
    async updateOrganisationSettings() {
      this.isLoading = true

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      const organisationId = user.organisation_id;
      if (token) {
        let patchData={};
       try {
        if(this.country===52 && (this.userMobile || this.userEmail || this.userWeb || this.userAddress || this.userCompName)){
            patchData = {
                      company_name: this.organisationSettingsData.name,
                      address: this.organisationSettingsData.address,
                      email_id: this.organisationSettingsData.email,
                      phone: this.organisationSettingsData.phone,
                      cin: this.organisationSettingsData.cin,
                      website: this.organisationSettingsData.website,
                      about_us: this.organisationSettingsData.aboutUs,
                      nearmap_enabled: this.organisationSettingsData.nearmapEnabled,
                      nearmap_api_key: this.organisationSettingsData.nearmapApiKey,
                      // countryCode: this.organisationSettingsData.countryCode,
                    };
                    if (
                          this.organisationSettingsDataTemp.logoUrl !==
                          this.organisationSettingsData.logoUrl
                        ) {
                          patchData.logo = this.organisationSettingsData.logoUrl;
                        }
                   const response =  await API.USERS.PATCH_USER_DATA(user.user_id, patchData); 

                    // If updating on user, then logo for user in local storage should also be updated
                    let userData = JSON.parse(localStorage.getItem('user')) || {};
                    userData['logo'] =   response.data.logo;
                    localStorage.setItem('user',JSON.stringify(userData));
                    window.dispatchEvent(new CustomEvent('user-logo-changed', {
                      detail: {
                        storage: JSON.parse(localStorage.getItem('user')).logo
                      }
                    }));

          }
        else {
          patchData = {
                    name: this.organisationSettingsData.name,
                    address: this.organisationSettingsData.address,
                    email_id: this.organisationSettingsData.email,
                    phone: this.organisationSettingsData.phone,
                    cin: this.organisationSettingsData.cin,
                    website: this.organisationSettingsData.website,
                    about_us: this.organisationSettingsData.aboutUs,
                    nearmap_enabled: this.organisationSettingsData.nearmapEnabled,
                    nearmap_api_key: this.organisationSettingsData.nearmapApiKey,
                    // countryCode: this.organisationSettingsData.countryCode,
                  };
                  // to patch the logo only if it has changed
                  if (
                    this.organisationSettingsDataTemp.logoUrl !==
                    this.organisationSettingsData.logoUrl
                  ) {
                    patchData.logo = this.organisationSettingsData.logoUrl;
                  }
                  const response =   await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                    organisationId,
                    patchData
                  );    
                  localStorage.setItem('organisation',JSON.stringify(response.data));
                  window.dispatchEvent(new CustomEvent('user-logo-changed', {
                    detail: {
                      storage: JSON.parse(localStorage.getItem('organisation')).logo
                    }
                  }));
     
       }
      
          this.organisationSettingsDataTemp.name = this.organisationSettingsData.name;
          this.organisationSettingsDataTemp.address = this.organisationSettingsData.address;
          this.organisationSettingsDataTemp.email = this.organisationSettingsData.email;
          this.organisationSettingsDataTemp.phone = this.organisationSettingsData.phone;
          this.organisationSettingsDataTemp.cin = this.organisationSettingsData.cin;
          this.organisationSettingsDataTemp.website = this.organisationSettingsData.website;
          this.organisationSettingsDataTemp.logoUrl = this.organisationSettingsData.logoUrl;
          this.organisationSettingsDataTemp.aboutUs = this.organisationSettingsData.aboutUs;
          this.organisationSettingsDataTemp.nearmapEnabled = this.organisationSettingsData.nearmapEnabled;
          this.organisationSettingsDataTemp.nearmapApiKey = this.organisationSettingsData.nearmapApiKey;
          this.organisationSettingsDataTemp.countryCode = this.organisationSettingsData.countryCode;
          this.success();
        } catch (error) {
          this.failure();
          this.onOrganisationCancel();
        }
      }
      this.isLoading = false
    },

    onOrganisationCancel() {
      this.organisationSettingsData.address = this.organisationSettingsDataTemp.address;
      this.organisationSettingsData.name = this.organisationSettingsDataTemp.name;
      this.organisationSettingsData.cin = this.organisationSettingsDataTemp.cin;
      this.organisationSettingsData.email = this.organisationSettingsDataTemp.email;
      this.organisationSettingsData.phone = this.organisationSettingsDataTemp.phone;
      this.organisationSettingsData.website = this.organisationSettingsDataTemp.website;
      this.organisationSettingsData.logoUrl = this.organisationSettingsDataTemp.logoUrl;
      this.organisationSettingsData.aboutUs = this.organisationSettingsDataTemp.aboutUs;
      this.organisationSettingsData.nearmapEnabled = this.organisationSettingsDataTemp.nearmapEnabled;
      this.organisationSettingsData.nearmapApiKey = this.organisationSettingsDataTemp.nearmapApiKey;
      this.organisationSettingsData.countryCode = this.organisationSettingsDataTemp.countryCode;

      this.isMobileValid=true;
      this.isEmailValid=true;

      // setTimeout(this.hideEmailWarning,50);
      // setTimeout(this.hideMobileWarning,50);
      // this.hideEmailWarning();
      // this.hideMobileWarning();
      document.getElementById("file").value = "";

    },

    async fetchOrganisationSettings() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      const organisationId = user.organisation_id;
      
      if (token) {
        try {
          // const response = await API.ORGANISATION.FETCH_ORGANISATION(
          //   organisationId
          // );
          let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
          if(!Object.keys(responseData).length){
            responseData = ( await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
          }
          let resultOrganisationData = responseData;
          this.country=resultOrganisationData.country;
          const respUser = await API.USERS.FETCH_USER(user.user_id);
          let resultOrganisationDatas=respUser.data;

          
          this.previous_projects.previous_project_one_image = responseData.country===52 ? resultOrganisationDatas.previous_project_one_image: responseData.previous_project_one_image;
          this.previous_projects.previous_project_one_name = responseData.country===52 ? resultOrganisationDatas.previous_project_one_name : responseData.previous_project_one_name;
          this.previous_projects.previous_project_three_image = responseData.country===52 ? resultOrganisationDatas.previous_project_three_image: responseData.previous_project_three_image;
          this.previous_projects.previous_project_three_name = responseData.country===52 ? resultOrganisationDatas.previous_project_three_name : responseData.previous_project_three_name;
          this.previous_projects.previous_project_two_image = responseData.country===52 ? resultOrganisationDatas.previous_project_two_image : responseData.previous_project_two_image;
          this.previous_projects.previous_project_two_name = responseData.country===52 ? resultOrganisationDatas.previous_project_two_name: responseData.previous_project_two_name;
          this.team_members = responseData.country===52 ? resultOrganisationDatas.team_members: responseData.team_members;
          this.frequently_asked_questions = responseData.country===52 ? resultOrganisationDatas.frequently_asked_questions : responseData.frequently_asked_questions;
          if(resultOrganisationData.country===52)
          {       
              this.userMobile = resultOrganisationDatas.phone;
              this.userCompName = resultOrganisationDatas.company_name;
              this.userEmail = resultOrganisationDatas.email_id;
              this.userWeb = resultOrganisationDatas.website;
              this.userAddress = resultOrganisationDatas.address;
              if(this.userMobile || this.userEmail || this.userWeb || this.userAddress || this.userCompName)
              {
                this.organisationSettingsDataTemp.name = resultOrganisationDatas.company_name || "";
                this.organisationSettingsDataTemp.address =
                  resultOrganisationDatas.address;
                this.organisationSettingsDataTemp.email =
                  resultOrganisationDatas.email_id || "";
                this.organisationSettingsDataTemp.phone =
                  resultOrganisationDatas.phone || ""; 
                this.organisationSettingsDataTemp.website =
                  resultOrganisationDatas.website || "";
                this.organisationSettingsDataTemp.logoUrl =
                  resultOrganisationDatas.logo;
                this.organisationSettingsDataTemp.aboutUs =
                  resultOrganisationDatas.about_us;
                this.organisationSettingsDataTemp.countryCode =
                  resultOrganisationDatas.countryCode;
              }
              else{
                this.organisationSettingsDataTemp.name = resultOrganisationData.name;
                this.organisationSettingsDataTemp.address =
                  resultOrganisationData.address;
                this.organisationSettingsDataTemp.email =
                  resultOrganisationData.email_id;
                this.organisationSettingsDataTemp.phone =
                  resultOrganisationData.phone;   
                this.organisationSettingsDataTemp.website =
                  resultOrganisationData.website;
                this.organisationSettingsDataTemp.logoUrl =
                  resultOrganisationData.logo;
                this.organisationSettingsDataTemp.aboutUs =
                  resultOrganisationData.about_us;
                this.organisationSettingsDataTemp.countryCode =
                  resultOrganisationData.countryCode;
              }
          }
          else{
          this.organisationSettingsDataTemp.name = resultOrganisationData.name;
          this.organisationSettingsDataTemp.address =
            resultOrganisationData.address;
          this.organisationSettingsDataTemp.email =
            resultOrganisationData.email_id;
          this.organisationSettingsDataTemp.phone =
            resultOrganisationData.phone;   
          this.organisationSettingsDataTemp.website =
            resultOrganisationData.website;
          this.organisationSettingsDataTemp.logoUrl =
            resultOrganisationData.logo;
          this.organisationSettingsDataTemp.aboutUs =
            resultOrganisationData.about_us;
          this.organisationSettingsDataTemp.countryCode =
            resultOrganisationData.countryCode;
          }
          this.organisationSettingsDataTemp.cin = resultOrganisationData.cin;
          this.organisationSettingsDataTemp.nearmapEnabled =
            resultOrganisationData.nearmap_enabled === undefined
              ? false
              : resultOrganisationData.nearmap_enabled;
          this.organisationSettingsDataTemp.nearmapApiKey =
            resultOrganisationData.nearmap_api_key === undefined
              ? ""
              : resultOrganisationData.nearmap_api_key;
          // Creating two copies of response data to provide cancel
          // functionality without making a api call
          this.onOrganisationCancel();
        } catch (e) {
          console.error();
        }
      }
    },
    resizeImage: function(logoUrl, fileType) {
      let maxDim=1500
      const vm=this
      let image=document.createElement("img")
      image.onload=()=>{
        if(image.height>maxDim || image.width>maxDim){
          let newW,newH
          if (image.height > image.width) {
            newH = maxDim
            newW = image.width * (newH/image.height)
          } else {
            newW = maxDim
            newH = image.height * (newW/image.width)
          }
          this.$message({
            showClose: true,
            message: 'The uploaded image has been resized to 1500px',
            type: "warning",
            center: true
          })
          let canvas=document.createElement("canvas")
          canvas.width=newW
          canvas.height=newH
          const context=canvas.getContext("2d")
          context.drawImage(image,0,0,canvas.width,canvas.height)
          let new_image_url=context.canvas.toDataURL(fileType, 90)
          vm.organisationSettingsData.logoUrl=new_image_url
        }
      }
      image.src=logoUrl
    },
   
    beforeLogoUpload(event) {
      let file = event.target.files[0];
      if (!file) return;

      this.saveModeToTrue();
      this.cancelModeToTrue();

      const isLt256KB = file.size / 1024 < 10000;
      const vm = this;
      // taking the base64 string if image size is less than 256KB
      if (!isLt256KB) {
        this.$message.error("Image size can not exceed 256KB!");
      } else {
        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
          vm.organisationSettingsData.logoUrl = fileLoadedEvent.target.result;
          vm.resizeImage(vm.organisationSettingsData.logoUrl, file.type);
        };
        fileReader.readAsDataURL(file);
      }
      // this ensures that no request is sent on action url
      return false;
    },
    
    toggleNearmapSwitch(enabled) {
      if (!enabled) {
        this.organisationSettingsData.nearmapApiKey = "";
      }
      this.$nextTick(() => {
        this.$validator.validateAll();
      });
    },
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    setCountryCode(country) {
          this.defaultCountryCode = parseInt(country.dialCode);
          // this.organisationSettingsData.countryCode = country.dialCode;
          this.organisationSettingsData.countryCode = this.defaultCountryCode;
    },
  },
};
</script>

<style scoped>
#error-msg-block {
  box-sizing: border-box;
  position: fixed;

  min-height: 50px;
  padding: 1% 2%;
  display: none;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #e74c3c;
  z-index: 1010;
}

#err-email,
#err-phone {
  color: red;
  font-size: 13px;
}

@media only screen and (min-width: 1200px) {
  #error-msg-block {
    top: 13%;
    margin-left: 50%;
  }
}

@media only screen and (min-width: 768px) and (max-width: 1199px) {
  #error-msg-block {
    top: 10%;
    margin-left: 50%;
  }
}

@media only screen and (max-width: 767px) {
  #error-msg-block {
    top: 0;
    left: 0;
    width: 100%;
  }
}

.organisationProfile {
  height: 100vh;
}
@media (min-height: 840px) {
  .organisationProfile {
    overflow-y: hidden;
  }
}

/* @media (max-height:840px) {
  .organisationProfile{
    overflow-y: auto;
  }
} */

@media (max-width: 900px) {
  .organisationProfile {
    overflow-y: auto;
  }
}

.org_page .about_content .floating-textarea {
  height: 200px;
}

.formErrors {
  font-size: 13px;
  text-align: left;
  color: #ff0000;
  word-break: break-word;
  margin-top: 8px;
}
.backButton {
  font-size: 23px;
  color: #303133;
}

.backButton:hover {
  font-weight: bold;
  cursor: pointer;
}

.logo-uploader {
  margin: 0 0 10px 5vw;
  position: relative;
  width: 130px;
  margin-left: 1%;
}

.logo-uploader >>> .el-upload {
  border: 2px solid #E8EDF2;
  border-radius: 8px;
}

#organisationLogoID:hover >>> .el-upload {
  /* border: 1px dashed #363535; */
  border-radius: 6px;
}

.organisationLogo {
  width: 130px;
  height: 130px;
  display: block;
  border-radius: 6px;
}

.logoText {
  margin: 0 0 10px 5vw;
  font-size: 16px;
  color: #000;
  width: 125px;
}

* {
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font);
}

ul {
  padding: 0;
  list-style: none;
}

a {
  text-decoration: none;
}
a:focus {
  outline: none;
  background-color: transparent;
}
a:active,
a:hover {
  outline: 0;
}

html {
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

button {
  overflow: visible;
}

body {
  margin: 0;
  font-size: 16px;
  color: var(--step-250);
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
menu,
nav,
section,
summary {
  display: block;
}

figure {
  margin: 0;
}

button {
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

select {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
select:focus {
  outline: none;
  text-transform: none;
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

html input[type="button"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}

html input[disabled] {
  cursor: default;
}

input[type="reset"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}

input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}

button[disabled] {
  cursor: default;
}

input[type="checkbox"] {
  box-sizing: border-box;
  padding: 0;
}

input[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}

input[type="number"]::-webkit-inner-spin-button {
  height: auto;
}

input[type="number"]::-webkit-outer-spin-button {
  height: auto;
}

input[type="search"] {
  -webkit-appearance: textfield;
  box-sizing: content-box;
}
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

.scroll_content {
  /* overflow-y: auto; */
  overflow-x: hidden;
  padding: 0 24px 24px;
  position: relative;
}
@media (max-width: 1200px) {
  .scroll_content {
    padding-bottom: 6px;
  }
}

/****  floating-Lable style end ****/

.floating-label {
  position: relative;
  margin-bottom: 30px;
}
.floating-label label {
  color:#222;
  font-size: 16px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 16px;
  top: 12px;
  transition: 0.2s ease all;
}
.floating-label .fa-clock {
  position: absolute;
  right: 12px;
  top: 12px;
  font-size: 16px;
  color: var(--step-200);
  cursor: pointer;
}

.floating-input {
  font-size: 16px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 48px;
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
  font-size: 14px;
  color: #222;
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
  font-size: 14px;
  color: #222;
}

.floating-select {
  font-size: 14px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 40px;
  background-color: var(--step-50);
  border: none;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  /* background-image: url("../assets/img/chevron-down.svg"); */
  background-repeat: no-repeat;
  background-position: calc(100% - 8px) center;
  background-size: 22px;
}
.floating-select:focus {
  outline: none;
}
.floating-select:focus ~ label {
  top: -19px;
  left: 0;
  color: #222;
  font-size: 12px;
}
.floating-select:focus ~ .bar:before {
  width: 50%;
}
.floating-select:focus ~ .bar:after {
  width: 50%;
}
.floating-select:not([value=""]):valid ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
  color: #222;
}

.floating-textarea {
  min-height: 70px;
  /* max-height: 260px; */
  max-height: 385px;
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

@media (max-width: 1200px) {
  body {
    font-size: 14px;
  }
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 500;
}

/* end radio button2 */
.input_field {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--step-250);
  background-color: var(--white);
  background-clip: padding-box;
  border: 1px solid var(--step-100);
  border-radius: 0.25rem;
}

.text-center {
  text-align: center;
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
  box-shadow: 0 0 2px 0 var(--step-150);
}
@media (max-width: 767px) {
  .btn {
    padding: 6px 8px;
  }
}

.btn.btn-primary:disabled,
.btn.btn-primary.disabled {
  /* background-image: linear-gradient(to bottom, var(--light-gray), var(--step-100)); */
  background-image: none;
  background-color: #cccccc !important;
  border-color: var(--step-100);
}

.btn.btn-cancel:disabled,
.btn.btn-cancel.disabled {
  /* background-image: linear-gradient(to bottom, var(--light-gray), var(--step-100)); */
  background-image: none;
  background-color: white !important;
  color: #cccccc;
  border-color: #999;
  border-width: 1px;
  /* border: 1px #999; */
}

.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092F7);
  color: var(--white);
}

.btn.btn-cancel {
  /* border-color: var(--danger); */
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, #999, #777);
  margin-left: 17px;
  color: var(--white);
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

.button_action .action_list {
  display: flex;
}
.button_action .action_list li:not(:last-child) {
  margin-right: 12px;
}
.button_action .action_list .btn {
  background-color: transparent;
  padding: 8px;
  box-shadow: none;
  min-width: 24px;
  transition: all ease-in-out 0.35s;
  padding: 0;
  border: none;
}
.button_action .action_list .btn span {
  color: var(--primary);
  font-size: 20px;
}
.button_action .action_list .btn span.edit-alt {
  font-size: 1.5rem;
}

.main-controller .right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }

  .right_sectionCRM {
    width: calc(100% - 74px);
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

@media (max-width: 1200px) {
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

.content_section {
  padding: 24px;
  min-height: calc(100vh - 100px);
}
@media (max-width: 767px) {
  .content_section {
    overflow: hidden;
  }
}
@media (min-width: 1201px) {
  .content_section {
    padding: 24px 64px;
  }
}
@media (max-width: 767px) {
  .content_section {
    padding: 24px;
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
@media (max-width: 1200px) {
  .content_section .filter_section {
    flex-wrap: wrap;
  }
}
.content_section .filter_section .starred_action .toggle-button-cover h5 {
  color: var(--step-200);
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information {
  display: inline-block;
  position: relative;
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 270px;
  right: 0;
  top: 100%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
}
@media (max-width: 767px) {
  .content_section
    .filter_section
    .starred_action
    .toggle-button-cover
    .hover_information
    .tooltip {
    max-width: 220px;
    right: -20px;
  }
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  .tooltip
  p {
  font-size: 12px;
  color: var(--step-150);
  line-height: 1.5;
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  i:hover
  ~ .tooltip {
  opacity: 1;
  visibility: visible;
  z-index: 1;
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
.content_section .filter_section .filter_area .search_field {
  margin-right: 16px;
}

.content_section .filter_section .filter_area .search_field .input_field {
  padding-right: 32px;
  transition: all ease-in-out 0.3s;
  box-sizing: border-box;
  z-index: 0;
}
@media (min-width: 1201px) {
  .content_section .filter_section .filter_area .search_field .input_field {
    min-width: 250px;
  }
}
.content_section .filter_section .filter_area .search_field .search {
  position: relative;
  right: 0;
  top: 0;
  color: var(--step-200);
  cursor: pointer;
  z-index: 1;
}
@media (max-width: 767px) {
  .content_section .filter_section .filter_area .search_field {
    order: 2;
    margin: 0;
    position: absolute;
    right: 0;
    width: 32px;
    height: 30px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .content_section .filter_section .filter_area .search_field .input_field {
    visibility: hidden;
    height: 38px;
    padding: 10px 12px;
    top: -4px;
    right: -8px;
    position: absolute;
    transition: all ease-in-out 0.45s;
    opacity: 0;
  }
  .content_section .filter_section .filter_area .search_field .search {
    font-size: 22px;
  }
  .content_section
    .filter_section
    .filter_area
    .search_field.active
    .input_field {
    visibility: visible;
    max-width: none;
    min-width: calc(100vw - 32px);
    opacity: 1;
  }
}
.content_section .filter_section .filter_area .project_btn {
  margin-left: 16px;
}
@media (max-width: 1200px) {
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
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary);
}
.card .card_header.flex_header {
  display: flex;
  justify-content: space-between;
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

.col_row {
  margin: 0 -16px;
  display: flex;
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

/* profile page */

@media (min-width: 1025px) {
  .profile_controller .col_left {
    width: 55%;
  }
  .profile_controller .col_right {
    width: 45%;
  }
}

.profile_controller .card {
  border-radius: 12px;
  background-color: var(--white);
  border: 1px solid var(--step-100);
  padding: 24px;
  margin-top: 32px;
}
@media (max-width: 1200px) {
  .profile_controller .card {
    margin-top: 18px;
    padding: 16px;
  }
}
.profile_controller .card .info_list {
  margin-top: 24px;
}
.profile_controller .card .info_list li p {
  color: var(--step-250);
  font-size: 14px;
}
.profile_controller .card h4 {
  font-size: 18px;
  color: var(--primary);
  font-weight: normal;
}
.profile_controller .card .share_info p {
  font-size: 12px;
  color: var(--step-200);
  font-weight: normal;
  margin-top: 16px;
}
.profile_controller .card .share_input {
  margin-top: 24px;
}
.profile_controller .card .share_input label {
  font-size: 14px;
  color: var(--step-200);
  font-weight: 500;
}
.profile_controller .card .share_input label span {
  color: var(--danger);
}
.profile_controller .card .more_addons {
  margin-top: 24px;
}
.profile_controller .card .more_addons .btn {
  padding-left: 0.85rem;
  padding-right: 0.85rem;
}
.profile_controller .card .more_addons .btn:not(:last-child) {
  margin-right: 12px;
}
.profile_controller .card .table_section {
  margin-top: 16px;
}
@media (min-width: 1201px) {
  .profile_controller .card .table_section tr td:not(:first-child) {
    text-align: center;
  }
}
.profile_controller .card .table_section tr.td_heading {
  border: 0;
}
.profile_controller .card .table_section tr.td_heading td {
  border-bottom-width: 2px;
  width: 100%;
}
@media (max-width: 1200px) {
  .profile_controller .card .table_section tr.td_heading td {
    padding: 0;
    margin-top: 8px;
  }
}
.profile_controller .card .table_section tr.td_heading td strong {
  color: var(--primary);
  font-weight: 500;
}

.profile_controller.team_section .card {
  margin-top: 16px;
}

.profile_controller .profile_icon {
  min-width: 118px;
  max-width: 118px;
  margin-right: 24px;
}
@media (max-width: 767px) {
  .profile_controller .profile_icon {
    margin: 0 auto 24px;
  }
}
.profile_controller .profile_icon figure {
  margin: 0;
  width: 100%;
  height: 118px;
  border-radius: 50%;
  border: 2px solid var(--step-50);
  position: relative;
}
.profile_controller .profile_icon figure img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}
.profile_controller .profile_icon figure .change_btn {
  position: absolute;
  bottom: 0;
  right: 5px;
  width: 28px;
  border-radius: 50%;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
  cursor: pointer;
}
.profile_controller .profile_icon figure .change_btn input {
  opacity: 0;
  /* visibility: hidden; */
  visibility: unset;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  cursor: pointer;
}
.profile_controller .profile_icon figure .change_btn i {
  font-size: 14px;
}
.profile_controller .profile_icon.rectangle figure {
  height: auto;
  min-height: 118px;
  border-radius: 8px;
  align-items: center;
  display: flex;
  padding: 6px;
}
.profile_controller .profile_icon.rectangle figure img {
  max-width: 100%;
  height: auto;
  border-radius: unset;
}
.profile_controller .profile_icon.rectangle figure .change_btn {
  background: var(--step-50);
  bottom: -14px;
  right: -14px;
}

.profile_controller .profile_form {
  display: flex;
}
/* @media (max-width: 767px) {
    .profile_controller .profile_form {
      flex-wrap: wrap; } } */
.profile_controller .profile_form .floating-form {
  flex-grow: 1;
  margin-top: 24px;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .floating-form {
    width: 100%;
    margin-left: 17px;
  }
}
.profile_controller .profile_form .floating-form .floating-label {
  margin-bottom: 36px;
}
.profile_controller .profile_form .floating-form .api_field {
  position: relative;
}
.profile_controller .profile_form .floating-form .api_field .new_api {
  position: absolute;
  right: 0;
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
  bottom: calc(100% + 3px);
  cursor: pointer;
}
.profile_controller .profile_form .add_more_btn {
  margin-top: 16px;
}
.profile_controller .profile_form .addons-area h5 {
  margin-right: 8px;
  font-size: 18px;
  color: var(--primary);
  margin: 8px 0 0 0;
}
.profile_controller .profile_form .addons-area .addons_item {
  margin: 16px 0;
  padding-left: 24px;
  position: relative;
}
.profile_controller .profile_form .addons-area .addons_item p {
  font-size: 13px;
  font-weight: normal;
  color: var(--step-250);
}
.profile_controller .profile_form .addons-area .addons_item .pricing {
  font-size: 14px;
  font-weight: normal;
  color: var(--step-200);
  margin-top: 6px;
}
.profile_controller .profile_form .addons-area .addons_item:before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary);
  position: absolute;
  left: 0;
  top: 5px;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .addons-area .col_row .col {
    width: 100%;
    flex: 0 0 100%;
  }
}
.profile_controller .profile_form .member_detail {
  flex-grow: 1;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .member_detail {
    width: 100%;
    margin-top: 24px;
  }
}
.profile_controller .profile_form .member_detail .member_title {
  display: flex;
}
.profile_controller .profile_form .member_detail .member_title .name {
  margin-right: 8px;
  font-size: 18px;
  color: var(--primary);
}
.profile_controller .profile_form .member_detail .pro_info {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
@media (max-width: 1200px) {
  .profile_controller .profile_form .member_detail .pro_info {
    margin: 8px 0;
  }
}
.profile_controller .profile_form .member_detail .pro_info .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  max-width: 36px;
  height: 36px;
  background-color: var(--step-50);
  border-radius: 50%;
  margin-right: 12px;
}
.profile_controller .profile_form .member_detail .pro_info .icon img {
  max-width: 50%;
}
.profile_controller .profile_form .member_detail .pro_info .info_value {
  font-size: 14px;
  font-weight: normal;
}
.profile_controller .profile_form .member_detail .action_list {
  display: inline-flex;
}
.profile_controller
  .profile_form
  .member_detail
  .action_list
  li:not(:last-child) {
  margin-right: 12px;
}
.profile_controller .profile_form .member_detail .action_list .btn {
  background-color: transparent;
  padding: 8px;
  box-shadow: none;
  min-width: 24px;
  transition: all ease-in-out 0.35s;
  padding: 0;
  border: none;
}
.profile_controller .profile_form .member_detail .action_list .btn span {
  color: var(--step-200);
  font-size: 20px;
}
.profile_controller
  .profile_form
  .member_detail
  .action_list
  .btn
  span.edit-alt {
  font-size: 24px;
}

.profile_controller .profile_information .mng_list .mng_name {
  font-size: 14px;
  font-weight: normal;
  color: var(--step-250);
}

.profile_controller .profile_information .mng_list li {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 20px;
}
.profile_controller .profile_information .mng_list li .mng_name {
  flex-grow: 1;
  padding-right: 8px;
}
.profile_controller .profile_information .mng_list li .icon {
  cursor: pointer;
}

.profile_controller .search_group {
  display: flex;
  justify-content: flex-end;
  margin: 24px 0;
}
.profile_controller .search_group .search_field {
  max-width: 280px;
  width: 100%;
  margin-right: 12px;
  position: relative;
}
.profile_controller .search_group .search_field .input_field {
  box-sizing: border-box;
  padding-right: 30px;
}
@media (max-width: 767px) {
  .profile_controller .search_group .search_field .input_field {
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 12px;
  }
}
.profile_controller .search_group .search_field .searh-icon {
  position: absolute;
  top: 16px;
  right: 14px;
  color: var(--step-200);
  cursor: pointer;
}
@media (max-width: 767px) {
  .profile_controller .search_group .search_field .searh-icon {
    top: 9px;
    right: 8px;
  }
}
@media (max-width: 767px) {
  .profile_controller .search_group .btn {
    font-size: 12px;
    font-weight: normal;
  }
}

/* end profile page */

/* about page */

.edit_btn .btn-outline {
  border-color: var(--danger);
  color: var(--danger);
}

.org_page .about_content {
  height: 80%;
  overflow-y: auto;
}
.org_page .about_content .floating-textarea {
  resize: unset;
  height: 120px;
}
.org_page .about_content p {
  line-height: 1.63;
}
.org_page .about_content p:not(:first-child) {
  margin-top: 16px;
}

.org_page .floating-textarea {
  height: 86px;
}

@media (min-width: 1025px) {
  .org_page .card {
    height: calc(100% - 32px);
  }
}

@media (max-width: 1200px) {
  .org_page .card {
    height: calc(100% - 18px);
  }
}

.org_page .card h4 {
  margin-bottom: 12px;
}

/* end about page */
</style>

<style scoped>
.scroll_content {
  /* overflow-y: auto; */
  overflow-x: hidden;
  padding: 0 24px 24px;
  position: relative;
}
@media (max-width: 1200px) {
  .scroll_content {
    padding-bottom: 6px;
  }
}

/****  floating-Lable style end ****/

.floating-label {
  position: relative;
  margin-bottom: 30px;
}
.floating-label label {
  color: #222;
  font-size: 16px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 16px;
  top: 12px;
  transition: 0.2s ease all;
}
.floating-label .fa-clock {
  position: absolute;
  right: 12px;
  top: 12px;
  font-size: 16px;
  color: var(--step-200);
  cursor: pointer;
}

.floating-input {
  font-size: 16px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 48px;
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
  font-size: 14px;
  color: #222;
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
  font-size: 14px;
  color: #222;
}

.floating-select {
  font-size: 14px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 40px;
  background-color: var(--step-50);
  border: none;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  /* background-image: url("../assets/img/chevron-down.svg"); */
  background-repeat: no-repeat;
  background-position: calc(100% - 8px) center;
  background-size: 22px;
}
.floating-select:focus {
  outline: none;
}
.floating-select:focus ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
  color: #222;
}
.floating-select:focus ~ .bar:before {
  width: 50%;
}
.floating-select:focus ~ .bar:after {
  width: 50%;
}
.floating-select:not([value=""]):valid ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
  color: #222;
}

.floating-textarea {
  min-height: 70px;
  /* max-height: 260px; */
  max-height: 385px;
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

@media (max-width: 1200px) {
  body {
    font-size: 14px;
  }
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 500;
}

/* end radio button2 */
.input_field {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--step-250);
  background-color: var(--white);
  background-clip: padding-box;
  border: 1px solid var(--step-100);
  border-radius: 0.25rem;
}

.text-center {
  text-align: center;
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
  box-shadow: 0 0 2px 0 var(--step-150);
}
@media (max-width: 767px) {
  .btn {
    padding: 6px 8px;
  }
}

.btn.btn-primary:disabled,
.btn.btn-primary.disabled {
  /* background-image: linear-gradient(to bottom, var(--light-gray), var(--step-100)); */
  background-image: none;
  background-color: #cccccc !important;
  border-color: var(--step-100);
}

.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092F7);
  color: var(--white);
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
.floating-label .vue-tel-input.vti__input{
  width: 0;
}


.button_action .action_list {
  display: flex;
}
.button_action .action_list li:not(:last-child) {
  margin-right: 12px;
}
.button_action .action_list .btn {
  background-color: transparent;
  padding: 8px;
  box-shadow: none;
  min-width: 24px;
  transition: all ease-in-out 0.35s;
  padding: 0;
  border: none;
}
.button_action .action_list .btn span {
  color: var(--primary);
  font-size: 20px;
}
.button_action .action_list .btn span.edit-alt {
  font-size: 1.5rem;
}

.main-controller .right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }

  .right_sectionCRM {
    width: calc(100% - 74px);
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

@media (max-width: 1200px) {
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

.content_section {
  padding: 24px;
  min-height: calc(100vh - 100px);
}
@media (max-width: 767px) {
  .content_section {
    overflow: hidden;
  }
}
@media (min-width: 1201px) {
  .content_section {
    padding: 24px 64px;
  }
}
@media (max-width: 767px) {
  .content_section {
    padding: 24px;
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
@media (max-width: 1200px) {
  .content_section .filter_section {
    flex-wrap: wrap;
  }
}
.content_section .filter_section .starred_action .toggle-button-cover h5 {
  color: var(--step-200);
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information {
  display: inline-block;
  position: relative;
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 270px;
  right: 0;
  top: 100%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
}
@media (max-width: 767px) {
  .content_section
    .filter_section
    .starred_action
    .toggle-button-cover
    .hover_information
    .tooltip {
    max-width: 220px;
    right: -20px;
  }
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  .tooltip
  p {
  font-size: 12px;
  color: var(--step-150);
  line-height: 1.5;
}
.content_section
  .filter_section
  .starred_action
  .toggle-button-cover
  .hover_information
  i:hover
  ~ .tooltip {
  opacity: 1;
  visibility: visible;
  z-index: 1;
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
.content_section .filter_section .filter_area .search_field {
  margin-right: 16px;
}

.content_section .filter_section .filter_area .search_field .input_field {
  padding-right: 32px;
  transition: all ease-in-out 0.3s;
  box-sizing: border-box;
  z-index: 0;
}
@media (min-width: 1201px) {
  .content_section .filter_section .filter_area .search_field .input_field {
    min-width: 250px;
  }
}
.content_section .filter_section .filter_area .search_field .search {
  position: relative;
  right: 0;
  top: 0;
  color: var(--step-200);
  cursor: pointer;
  z-index: 1;
}
@media (max-width: 767px) {
  .content_section .filter_section .filter_area .search_field {
    order: 2;
    margin: 0;
    position: absolute;
    right: 0;
    width: 32px;
    height: 30px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .content_section .filter_section .filter_area .search_field .input_field {
    visibility: hidden;
    height: 38px;
    padding: 10px 12px;
    top: -4px;
    right: -8px;
    position: absolute;
    transition: all ease-in-out 0.45s;
    opacity: 0;
  }
  .content_section .filter_section .filter_area .search_field .search {
    font-size: 22px;
  }
  .content_section
    .filter_section
    .filter_area
    .search_field.active
    .input_field {
    visibility: visible;
    max-width: none;
    min-width: calc(100vw - 32px);
    opacity: 1;
  }
}
.content_section .filter_section .filter_area .project_btn {
  margin-left: 16px;
}
@media (max-width: 1200px) {
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
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary);
}
.card .card_header.flex_header {
  display: flex;
  justify-content: space-between;
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

.col_row {
  margin: 0 -16px;
  display: flex;
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

/* profile page */

@media (min-width: 1025px) {
  .profile_controller .col_left {
    width: 55%;
  }
  .profile_controller .col_right {
    width: 45%;
  }
}

.profile_controller .card {
  border-radius: 12px;
  background-color: var(--white);
  border: 1px solid var(--step-100);
  padding: 24px;
  margin-top: 32px;
}
@media (max-width: 1200px) {
  .profile_controller .card {
    margin-top: 18px;
    padding: 16px;
  }
}
.profile_controller .card .info_list {
  margin-top: 24px;
}
.profile_controller .card .info_list li p {
  color: var(--step-250);
  font-size: 14px;
}
.profile_controller .card h4 {
  font-size: 18px;
  color: var(--primary);
  font-weight: normal;
}
.profile_controller .card .share_info p {
  font-size: 12px;
  color: var(--step-200);
  font-weight: normal;
  margin-top: 16px;
}
.profile_controller .card .share_input {
  margin-top: 24px;
}
.profile_controller .card .share_input label {
  font-size: 14px;
  color: var(--step-200);
  font-weight: 500;
}
.profile_controller .card .share_input label span {
  color: var(--danger);
}
.profile_controller .card .more_addons {
  margin-top: 24px;
}
.profile_controller .card .more_addons .btn {
  padding-left: 0.85rem;
  padding-right: 0.85rem;
}
.profile_controller .card .more_addons .btn:not(:last-child) {
  margin-right: 12px;
}
.profile_controller .card .table_section {
  margin-top: 16px;
}
@media (min-width: 1201px) {
  .profile_controller .card .table_section tr td:not(:first-child) {
    text-align: center;
  }
}
.profile_controller .card .table_section tr.td_heading {
  border: 0;
}
.profile_controller .card .table_section tr.td_heading td {
  border-bottom-width: 2px;
  width: 100%;
}
@media (max-width: 1200px) {
  .profile_controller .card .table_section tr.td_heading td {
    padding: 0;
    margin-top: 8px;
  }
}
.profile_controller .card .table_section tr.td_heading td strong {
  color: var(--primary);
  font-weight: 500;
}

.profile_controller.team_section .card {
  margin-top: 16px;
}

.profile_controller .profile_icon {
  min-width: 118px;
  max-width: 118px;
  margin-right: 24px;
}
@media (max-width: 767px) {
  .profile_controller .profile_icon {
    margin: 0 auto 24px;
  }
}
.profile_controller .profile_icon figure {
  margin: 0;
  width: 100%;
  height: 118px;
  border-radius: 50%;
  border: 2px solid var(--step-50);
  position: relative;
}
.profile_controller .profile_icon figure img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}
.profile_controller .profile_icon figure .change_btn {
  position: absolute;
  bottom: 0;
  right: 5px;
  width: 28px;
  border-radius: 50%;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
  cursor: pointer;
}
.profile_controller .profile_icon figure .change_btn input {
  opacity: 0;
  /* visibility: hidden; */
  visibility: unset;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  cursor: pointer;
}
.profile_controller .profile_icon figure .change_btn i {
  font-size: 14px;
}
.profile_controller .profile_icon.rectangle figure {
  border-radius: 8px;
  align-items: center;
  display: flex;
  padding: 6px;
}
.profile_controller .profile_icon.rectangle figure img {
  max-width: 100%;
  height: auto;
  border-radius: unset;
}
.profile_controller .profile_icon.rectangle figure .change_btn {
  background: var(--step-50);
  bottom: -14px;
  right: -14px;
}

.profile_controller .profile_form {
  display: flex;
}
@media (max-width: 767px) {
  .profile_controller .profile_form {
    flex-wrap: wrap;
  }
}
.profile_controller .profile_form .floating-form {
  flex-grow: 1;
  margin-top: 24px;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .floating-form {
    width: 100%;
  }
}
.profile_controller .profile_form .floating-form .floating-label {
  margin-bottom: 36px;
}
.profile_controller .profile_form .floating-form .api_field {
  position: relative;
}
.profile_controller .profile_form .floating-form .api_field .new_api {
  position: absolute;
  right: 0;
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
  bottom: calc(100% + 3px);
  cursor: pointer;
}
.profile_controller .profile_form .add_more_btn {
  margin-top: 16px;
}
.profile_controller .profile_form .addons-area h5 {
  margin-right: 8px;
  font-size: 18px;
  color: var(--primary);
  margin: 8px 0 0 0;
}
.profile_controller .profile_form .addons-area .addons_item {
  margin: 16px 0;
  padding-left: 24px;
  position: relative;
}
.profile_controller .profile_form .addons-area .addons_item p {
  font-size: 13px;
  font-weight: normal;
  color: var(--step-250);
}
.profile_controller .profile_form .addons-area .addons_item .pricing {
  font-size: 14px;
  font-weight: normal;
  color: var(--step-200);
  margin-top: 6px;
}
.profile_controller .profile_form .addons-area .addons_item:before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary);
  position: absolute;
  left: 0;
  top: 5px;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .addons-area .col_row .col {
    width: 100%;
    flex: 0 0 100%;
  }
}
.profile_controller .profile_form .member_detail {
  flex-grow: 1;
}
@media (max-width: 767px) {
  .profile_controller .profile_form .member_detail {
    width: 100%;
    margin-top: 24px;
  }
}
.profile_controller .profile_form .member_detail .member_title {
  display: flex;
}
.profile_controller .profile_form .member_detail .member_title .name {
  margin-right: 8px;
  font-size: 18px;
  color: var(--primary);
}
.profile_controller .profile_form .member_detail .pro_info {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
@media (max-width: 1200px) {
  .profile_controller .profile_form .member_detail .pro_info {
    margin: 8px 0;
  }
}
.profile_controller .profile_form .member_detail .pro_info .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  max-width: 36px;
  height: 36px;
  background-color: var(--step-50);
  border-radius: 50%;
  margin-right: 12px;
}
.profile_controller .profile_form .member_detail .pro_info .icon img {
  max-width: 50%;
}
.profile_controller .profile_form .member_detail .pro_info .info_value {
  font-size: 14px;
  font-weight: normal;
}
.profile_controller .profile_form .member_detail .action_list {
  display: inline-flex;
}
.profile_controller
  .profile_form
  .member_detail
  .action_list
  li:not(:last-child) {
  margin-right: 12px;
}
.profile_controller .profile_form .member_detail .action_list .btn {
  background-color: transparent;
  padding: 8px;
  box-shadow: none;
  min-width: 24px;
  transition: all ease-in-out 0.35s;
  padding: 0;
  border: none;
}
.profile_controller .profile_form .member_detail .action_list .btn span {
  color: var(--step-200);
  font-size: 20px;
}
.profile_controller
  .profile_form
  .member_detail
  .action_list
  .btn
  span.edit-alt {
  font-size: 24px;
}

.profile_controller .profile_information .mng_list .mng_name {
  font-size: 14px;
  font-weight: normal;
  color: var(--step-250);
}

.profile_controller .profile_information .mng_list li {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 20px;
}
.profile_controller .profile_information .mng_list li .mng_name {
  flex-grow: 1;
  padding-right: 8px;
}
.profile_controller .profile_information .mng_list li .icon {
  cursor: pointer;
}

.profile_controller .search_group {
  display: flex;
  justify-content: flex-end;
  margin: 24px 0;
}
.profile_controller .search_group .search_field {
  max-width: 280px;
  width: 100%;
  margin-right: 12px;
  position: relative;
}
.profile_controller .search_group .search_field .input_field {
  box-sizing: border-box;
  padding-right: 30px;
}
@media (max-width: 767px) {
  .profile_controller .search_group .search_field .input_field {
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 12px;
  }
}
.profile_controller .search_group .search_field .searh-icon {
  position: absolute;
  top: 16px;
  right: 14px;
  color: var(--step-200);
  cursor: pointer;
}
@media (max-width: 767px) {
  .profile_controller .search_group .search_field .searh-icon {
    top: 9px;
    right: 8px;
  }
}
@media (max-width: 767px) {
  .profile_controller .search_group .btn {
    font-size: 12px;
    font-weight: normal;
  }
}

/* end profile page */

/* about page */

.edit_btn {
  margin-top: 5px;
  position: sticky;
}
.edit_btn .btn-outline {
  border-color: var(--danger);
  color: var(--danger);
}

.org_page .about_content {
  height: calc(80% - 20px);
  overflow-y: scroll;
  padding-bottom: 10px;
  margin-bottom: 20px;
  box-sizing: border-box;
}
.org_page .about_content .floating-textarea {
  resize: unset;
  height: 120px;
}
.org_page .about_content p {
  line-height: 1.63;
}
.org_page .about_content p:not(:first-child) {
  margin-top: 16px;
}

.org_page .floating-textarea {
  height: 86px;
}

@media (min-width: 1025px) {
  .org_page .card {
    height: calc(100% - 32px);
  }
}

@media (max-width: 1200px) {
  .org_page .card {
    height: calc(100% - 18px);
  }
}

.org_page .card h4 {
  margin-bottom: 12px;
}

/* end about page */
</style>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");
</style>

<style lang="scss" scoped>
@import "../../../styles/components/button";
@import "../../../styles/components/forms";
</style>


<style scoped>
.floating-textarea {
  min-height: 70px;
  /* max-height: 260px; */
  max-height: 385px;
  overflow: hidden;
  overflow-x: hidden;
  resize: none;
}

.favorite_section{
  background-color: #e8edf2;
  margin-top: 24px !important;
  border: none;
}

.organisationProfile >>> .el-tabs__item {
  color: #777777;
  font-size: 18px !important;
  font-weight: 100 !important;
}

.organisationProfile >>> .el-tabs__item.is-active {
  color: #1c3366 !important;
}

.organisationProfile >>> .el-tabs__active-bar {
  background-color: #1c3366 !important;
  margin: 0px 24px !important;
}

.organisationProfile >>> .el-tabs__item:hover {
  color: #1c3366 !important;
  cursor: pointer;
}
.organisationProfile >>> .el-tabs__nav {
  padding: 6px 24px !important;
}

.organisationProfile >>> .el-tabs__nav-wrap::after{
  background-color: #cccccc;
}

@media (min-width: 1281px) {
.right_sectionCRM {
  width: calc(100% - 74px) !important;
  margin-left: auto;
}
}

</style>