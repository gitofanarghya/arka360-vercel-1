<template>
    <div id="ShareSiteSurveyLinkMail" class="parentContainer">
    <el-dialog
      :visible="isShareSiteSurveyLinkMail"
      title="Share Site Survey Link"
      @close="closeShareSiteSurveyLinkMail"
    >
    <div class="container">
        <div class="borderCont">
          <div class="backOne">
            <div class="inpOneCont">
              <label for="fname" class="inpLabOne">To:</label>
              <input
                type="text"
                id="fname"
                placeholder=""
                class="inptsOne"
                v-model="enteredEmail"
              /><br />
            </div>
            <div id="err-email" class="err-message-block" v-if="emailIsRequired">* This is a required field.</div>
            <div id="err-email" class="err-message-block" v-if="enterValidEmail">Please enter a valid email id.</div>

            <div class="inpTwoCont">
              <label for="email" class="inpLabTwo">Subject:</label>
              <input
                type="email"
                id="email"
                placeholder=""
                class="inptsTwo"
                v-model="enteredSubject"
                autocomplete="off"
              /><br />
            </div>
            <div id="err-email" class="err-message-block" v-if="subjectRequired">* This is a required field.</div>

            <div class="borderContent" id="emailBody" contentEditable="true">
              <p class="hiiT">Hi there,</p>
              <p class="ssq">Here's your Site Survey Link.</p>
              <p class="ques">Please let us know, if you have any questions.</p>
              <p class="ssq">Site Survey Link: 
                <a target="_blank" :href="siteSurveyLinkUrl">
                  {{ siteSurveyLinkUrl }}
                </a>
              </p>
              <p class="regardsSec">Regards,<br />{{ createdBy }}</p>
            </div>
          </div>
          <div class="btnCont">
            <el-button type="primary" class="sendBtn" @click="sendEmail">Send</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    </div>
</template>
<script>
import { checkEmailValidation } from '../../../core/utils/utils';
import API from '../../../services/api';
export default {
    name: 'SiteSurveyLinkSms',
    props: {
        isShareSiteSurveyLinkMail: Boolean,
        siteSurveyLinkUrl: String,
        createdBy: String,
       
    },
    data() {
        return {
            enteredEmail: '',
            enteredSubject: '',
            emailIsRequired: false,
            subjectRequired: false,
            enterValidEmail: false,
        }
    },
    methods: {
        closeShareSiteSurveyLinkMail(){
        this.$emit('update:isShareSiteSurveyLinkMail', false);
        },
        
    async sendEmail() {
      if (!this.enteredSubject) {
        this.subjectRequired = true;
      }
      if (!this.enteredEmail) {
        this.emailIsRequired = true;
        this.enterValidEmail = false;
        return;
      }
      if (!checkEmailValidation(this.enteredEmail)) {
        this.enterValidEmail = true;
        this.emailIsRequired = false;
        return;
      }

      this.enterValidEmail = false;
      this.emailIsRequired = false;

      try {
        const postData = {
          "recipients": [this.enteredEmail],
          "subject": this.enteredSubject,
          "body": document.getElementById('emailBody').innerText,
        }

        const response = await API.DESIGNS.SHARE_PROPOSAL_EMAIL(postData);
        this.resetSendEmailFields();
        this.copyNotification();
        this.closeShareSiteSurveyLinkMail();
      }
      catch (error) {
        this.$message({
          showClose: true,
          message: "Failed to post details. Try Again!",
          type: "error",
          center: true
        })
      }
    },
    
    resetSendEmailFields() {
      this.enteredSubject = '';
      this.enteredEmail = '';
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
          message: "Failed to send the site survey link.",
          type: "error",
          center: true
        })
      }
    },
  },
  }
</script>

<style scoped>
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px white inset;
}
#ShareSiteSurveyLinkMail >>> .el-dialog{
    width: 35% !important;
    height: auto !important;
}
#ShareSiteSurveyLinkMail >>> .el-dialog__title {
  color: rgb(54, 48, 48) !important;;
}

#ShareSiteSurveyLinkMail >>> .el-dialog__header{
  margin-bottom: 0;
}
#err-email {
  color: red;
  /* font-size: 13px; */
}

.err-message-block {
  /* display: none; */
  width: 100%;
  height: 16px;
  margin: 5px 0 0 5px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
  font-size: 0.87rem;
  font-weight: normal;
  text-align: left;
  color: #ff0808;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 140px;
  background-color: #409eff;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 150%;
  left: 50%;
  margin-left: -75px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #409eff transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

#parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#parentContainer >>> .el-dialog__title {
  width: 157px;
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
  margin-left: 10px;
  color: #222222 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 2vh !important;
  width: 800px !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 16px 24px 24px 24px;
  margin-bottom: 0px!important;
  word-break: break-word;
}

.borderCont {
  border: 1px solid #ccc;
  background-color: #f8f9fc;
  border-radius: 8px;
}

.backOne {
  padding: 18px 16px 0px 16px;
}

.inpLabOne,
.inpLabTwo {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

.inpLabTwo {
  margin-top: 17px;
}

.inpOneCont,
.inpTwoCont {
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
}

.inpTwoCont {
  margin-top: 16px;
}

.inptsOne {
  width: calc(100% - 22px);
  color: #222;
}

.inptsTwo {
  width: calc(100% - 60px);
  color: #222;
}

.inptsOne,
.inptsTwo {
  background-color: #f8f9fc;
  border: none;
  font-size: 16px;
  padding: 0px 10px 0px 10px;
}

.borderContent {
  margin-top: 20px;
}

[contentEditable] {
  outline: 0px solid transparent;
}

.hiiT,
.ssq,
.ques
 {
  font-size: 16px;
  font-weight: normal;
  text-align: left;
  color: #222;
  margin-bottom: 24px;
  line-height: 1.3;
}

.regardsSec{
  font-size: 16px;
  font-weight: normal;
  text-align: left;
  color: #222;
  margin-bottom: 3px;
}
.btnCont {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  background-color: #fff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.dSendBtn,
.sendBtn {
  font-size: 18px;
  padding: 8px 24px;
}

.footerSAD {
  padding: 16px;
  background-color: #f0f3f8;
  border-radius: 4px;
  margin: 24px 0px;
}

.spl {
  font-size: 14px;
  font-weight: normal;
  color: #777;
  margin-bottom: 8px;
}

.flexCont {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.linkF {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

.copy {
  color: #409eff;
  font-size: 16px;
  font-weight: normal;
  cursor: pointer;
  word-break: keep-all;
}

.dwnldBtn{
  font-size: 18px;
  font-weight: 600;
}

.progress-bar-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 1.5em;
  background: #f0f3f8;
  border-radius: 3px;
  margin: auto;
  margin-bottom: 24px;
}

.progress-bar {
  position: absolute;
  height: 100%;
  background: #83C0FF;
  border-radius: 3px;
  transition: 0.2s;
}

.progress-bar-complete {
  background: #409EFF;
}

.progress-bar-text {
  color: white;
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
@media (max-width: 1150px) {
  #ShareSiteSurveyLinkMail >>> .el-dialog{
    width: 50% !important;
    }
  }
  @media (max-width: 750px) {
    #ShareSiteSurveyLinkMail >>> .el-dialog{
      width: 70% !important;
    } 
  }
  @media (max-width: 500px) {
    #ShareSiteSurveyLinkMail >>> .el-dialog{
      width: 90% !important;
    } 
  }

</style>