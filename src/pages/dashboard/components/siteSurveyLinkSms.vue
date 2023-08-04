<template>
    <div id="siteSurveyLinkSms">
    <el-dialog
    :visible = "isSiteSurveyLinkSms"
    custom-class="dialog-box"
    @close="closeSiteSurveyLinkSms"
    >
    <div class="siteSurveyPhoneCont">
      <label style="font-weight: bold;">Please enter the phone number to share the site survey link.</label>
      <div class="mobileInput">
        <label>Enter Mobile Number</label>
        <vue-tel-input 
          v-model="value"
          :dropdownOptions="{showFlags:true,showDialCodeInSelection:true,width:'600px !important',showSearchBox:true}"
          :defaultCountry="defaultCountryCode" 
          :inputOptions="{
          maxlength:25,
          }"
          :autoFormat="false"
          :mode="international"
          :validCharactersOnly="true"
          @country-changed="setCountryCode"
          @validate="phoneObject"
          @open="onDropdownOpen(true)"
          @close="onDropdownOpen(false)" >
          <template v-slot:arrow-icon>
            <span>{{ open ? '▲' : '▼' }}</span> 
          </template>
        </vue-tel-input>
        </div>
      
      <div>
            <button  
            :disabled="!isValid"
            class="sendbtn" 
            @click="copyURL()"
            >Send Link</button>
        </div>
    </div>
    </el-dialog>
    </div>
    
</template>
<script>
import {VueTelInput} from 'vue-tel-input';
import API from '../../../services/api';

  export default {
  name: 'SiteSurveyLinkSms',
  components : {
    VueTelInput,
  },
  props: {
      isSiteSurveyLinkSms: Boolean,
      siteSurveyLinkUrl: String,
  },
  data() {
    let smsData = {
        smsNumber: this.VueTelInput,
        site_survey_link: "",
        siteSurveyLinkUrl:"",
    }
    return {
      international:'international',
      open:false,
      defaultCountryCode: 'IN',
       value:"",
       dialCode:'',
       data: smsData,
       isValid: false,  
    }
  },
  methods: {
    onDropdownOpen(val){
      this.open = val;
    },
    closeSiteSurveyLinkSms(){
      this.$emit('update:isSiteSurveyLinkSms', false);
    },
    setCountryCode(country) {
      this.dialCode = '+'+country.dialCode
    },
    async copyURL() {
      try {
        const mobileNumber = this.dialCode + this.value.toString().split(" ").join("");
        const postData = {
          phone: mobileNumber,
          site_survey_link: this.siteSurveyLinkUrl,
        }
        const response = await API.SITE_SURVEY_LINK.SHARE_SITE_SURVEY_LINK(postData);
        await navigator.clipboard.writeText(this.siteSurveyLinkUrl);
        this.copyNotification();
        this.closeSiteSurveyLinkSms();
      } catch(e) {
        this.$message({
          showClose: true,
          message: "Failed to send the site survey link.",
          type: "error",
          center: true
        })
      }
    },
    copyNotification(){
      try{
        this.$message({
            showClose: true,
            message: "Site survey link send successfully.",
            type: "success",
            center: true
          });
      }
      catch (error) {
        this.$message({
          showClose: true,
          message: "Failed to copy the site survey link.",
          type: "error",
          center: true
        })
      }
    },
    phoneObject: function(object) {
      if (object.valid === true) {
        this.isValid = true;
      } else {
        this.isValid = false;
      }
    },
  }
  }
  </script>
  <style scoped>
  .mobileInput{
    display: flex;
    flex-direction: column;
    align-items: baseline;
    margin-top: 15px;
  }
   #siteSurveyLinkSms >>> .el-dialog{
    width: 25% !important;
    height: auto !important;
    padding: 0.3% 2% 1% 2% !important;
  }
  #siteSurveyLinkSms >>> .vti__selection .vti__country-code{
    width: 70px;
  }
  #siteSurveyLinkSms >>> .el-dialog__header{
    background: #fff;
  }
  #siteSurveyLinkSms >>> .sendbtn {
    cursor: pointer;
    color: white;
    background-color: #409eef;
    height: auto;
    width: 30%;
    padding: 10px;
    border-radius: 4px;
    display: inline-flex;
    justify-content: center !important;
    align-items: center !important;
    margin-left: 30%;
    margin-top: 18px;
    margin-bottom: 10px;
    border: none;
    border-color: var(--step-100);
  }
  #siteSurveyLinkSms >>> .sendbtn:disabled{
  background-image: linear-gradient(to bottom, #f1f1f1, #ddd);
  color: #ccc;
  cursor: not-allowed;
  }
  #siteSurveyLinkSms >>> .label{
    display: block;
    text-align: center !important;
  }
  .vue-tel-input {
    width: 100%;
    height: 35px;
    justify-content: center !important;
    /* margin-left: 30px; */
    /* margin-right: 20px; */
    margin-top: 7px;
  }
  .mobileInput >>> .vti__selection {
    font-size: .8em;
    display: flex;
    align-items: center;
    width: 70px;
}
  @media (max-width: 1150px) {
    #siteSurveyLinkSms >>> .el-dialog{
      width: 50% !important
    }  
  }
  @media (max-width: 700px) {
    #siteSurveyLinkSms >>> .el-dialog{
      width: 70% !important
    }  
  }
    @media (max-width: 500px) {
    #siteSurveyLinkSms >>> .el-dialog{
      width: 90% !important
    }  
    .vue-tel-input{
      width: 90%;
    }
  }
  </style>
  
  