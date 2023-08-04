<template>
    <div id="siteSurveyLinkPopUp">
    <el-dialog
      :visible = "isSiteSurveyLinkVisible"
      :close-on-click-modal="false"
      custom-class="dialog-box"
      @close="closeSiteSurvey"
    >
    <div>
      <label class="label">Your site survey link is ready. You can share this link with your<br> customers by clicking any of the options below.</label>
    </div>
    <span>
    <a href="https://web.whatsapp.com/" data-action="share/whatsapp/share">
      <button 
        class="btn" 
        style="margin-right: 2.5%;margin-top: 2.5%;"
        type="submit"
        @click="copyURL()"
        >Share via WhatsApp 
        <img
          class="siteSurveyIcons"
          src="../../../assets/img/Whatsappicon.svg"
          alt="Add other sources">
      </button>
    </a>
      <button 
        class="btn" 
        style="margin-top: 2.5%;"
        type="submit"
        @click="shareSiteSurveyLinkMail()"
        >Share via Email 
        <img
          class="siteSurveyIcons"
          src="../../../assets/img/Emailicon.svg"
          alt="Add other sources">
      </button>
    </span>
    <span>
    <button 
        class="btn" 
        style="margin-right: 2.5%;margin-top: 2.5%;"
        type="submit"
        @click="generateSiteSurveyLinkSms()">Share via SMS
        <img
          class="siteSurveyIcons"
          src="../../../assets/img/Smsicon.svg"
          alt="Add other sources">
    </button> 
    <button 
        class="btn" 
        style="margin-top: 2.5%"
        type="submit"
        @click="copyURL()"
        >Copy Link 
        <img
          class="siteSurveyIcons"
          src="../../../assets/img/copyicon.svg"
          alt="Add other sources">
    </button>
    </span>
    </el-dialog>
    <div> 
      <SiteSurveyLinkSms
       :isSiteSurveyLinkSms.sync="isSiteSurveyLinkSms"
       :siteSurveyLinkUrl.sync="copyLink"
       />
      <ShareSiteSurveyLinkMail
       :isShareSiteSurveyLinkMail.sync="isShareSiteSurveyLinkMail"
       :siteSurveyLinkUrl.sync="copyLink"
       :createdBy.sync = "createdBy"
      />
    </div>
    </div>
  </template>
  <script>
  import API from '@/services/api';
  import SiteSurveyLinkSms from "../../dashboard/components/siteSurveyLinkSms.vue";
  import ShareSiteSurveyLinkMail from "../../dashboard/components/shareSiteSurveyLinkMail.vue";

  export default {
  name: 'SiteSurveyLinkPopUp',
  components : {
    SiteSurveyLinkSms,
    ShareSiteSurveyLinkMail,
  },
  props: {
      isSiteSurveyLinkVisible: Boolean,
      siteSurveyLinkUrl: String,
      viewSiteSurveyLink: Boolean,
      createdBy: String,
  },
  data() {
    return {
        isSiteSurveyLinkSms:false,
        copyLink: null,
        isShareSiteSurveyLinkMail:false,
    }
  },
  methods: {
    generateSiteSurveyLinkSms(){
        this.copyLink = this.siteSurveyLinkUrl;
        this.isSiteSurveyLinkSms = true;
        this.closeSiteSurvey();
    },
    shareSiteSurveyLinkMail(){
        this.copyLink = this.siteSurveyLinkUrl;
      this.isShareSiteSurveyLinkMail = true;
      this.closeSiteSurvey();

    },
    closeSiteSurvey(){
      this.$emit('update:isSiteSurveyLinkVisible', false);
    },
    async copyURL() {
      try {
        await navigator.clipboard.writeText(this.siteSurveyLinkUrl);
        this.copyNotification();
        this.closeSiteSurvey();
        this.$emit('update:viewSiteSurveyLink',true); 
        this.viewSiteSurveyLink = true;
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
          message: "Site survey link copied successfully.",
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
  }
  }
  </script>
  <style scoped>
  #siteSurveyLinkPopUp >>> .el-dialog{
    box-sizing: border-box;
    border-radius: 2.3%;
    background: #fff;
    width: 35%;
    height: auto;
    padding: 0.3% 2% 2% 2%;
  }
  #siteSurveyLinkPopUp >>> .el-dialog__header{
    background: #fff;
  }

  #siteSurveyLinkPopUp >>> .btn{
    height: auto;
    width: 45%;
    font-size: 14px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-left: 3%;
    background-color: #ffffff;
    border-color: var(--step-100);
  }
  #siteSurveyLinkPopUp >>> .label{
    display: block;
    text-align: center;
    /* padding: 10px 5px 5px 20px; */
    padding-bottom: 20px;
  }
  .siteSurveyIcons {
    width: 1.4vw;
    max-width: 28px;
    height: auto;
    margin-left: 5%;
}
  
@media (max-width: 1100px) {
  #siteSurveyLinkPopUp >>> .el-dialog {
    width: 50%;
  }
}
@media (max-width: 750px) {
  #siteSurveyLinkPopUp >>> .el-dialog {
    width: 80%;
  }
}
@media (max-width: 450px) {
  #siteSurveyLinkPopUp >>> .el-dialog {
    width: 90%;
  }
  #siteSurveyLinkPopUp >>> .btn{
    font-size: 10px;
  }
}
  </style>
 