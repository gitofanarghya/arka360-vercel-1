<template>
  <div id="parentContainer">    
    <el-dialog
      :visible="isShareAndDownloadPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 830px"
      title="Share & Download"
      width="600px"
      @close="onDialogClose"
    >  
      <div class="container">
       
      <previousProposalRequests
          v-if="isPreviousRequestsPopupVisible"
          :isPreviousRequestsPopupVisible.sync="isPreviousRequestsPopupVisible"
          :currency_code="currency_code"
      />
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
              <!-- <div id="err-email" class="err-message-block">Incorrect Email.</div> -->
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
              /><br />
            </div>
            <div id="err-email" class="err-message-block" v-if="subjectFieldRequiredError">* This is a required field.</div>

            <div class="borderContent" id="emailBody" contentEditable="true">
              <p class="hiiT">Hi there,</p>
              <p class="ssq">Here's your {{ systemCapacity }} solar system quotation.</p>
              <p class="ques">Please let us know, if you have any questions.</p>
              <p class="ssq">Proposal Link: 
                <a target="_blank" :href="referenceIdUrl">
                  {{ referenceIdUrl }}
                </a>
              </p>
              <p class="reg">Regards,<br />{{ projectCreator }}</p>
            </div>
          </div>
          
          <div class="btnCont">
            <!-- <el-button class="dSendBtn">Send</el-button> -->
            <span @click="isPreviousRequestsPopupVisible = true" class="Previous-Requests">
              Previous Proposal Requests
            </span>
            <!-- <p class="previousRequestInpt"  >Previous Requests</p> -->

            <el-button type="primary" class="sendBtn" @click="sendEmail">Send</el-button>
          </div>
        </div>
        <div class="footerSAD">
          <p class="spl">Share Proposal Link:</p>
          <div class="flexCont">
            <!-- <a
              href="https://app.solarlabs360/proposals/9b7bWY9gt0"
              class="linkF"
              >https://app.solarlabs360/proposals/9b7bWY9gt0</a
            > -->
            <p class="linkF" id="webLink">
              {{ referenceIdUrl }}
            </p>
            <div class="tooltip">
              <p class="copy" @click="copyLink" @mouseout="outFunc">
                <span class="tooltiptext" id="myTooltip" v-if="copyWebLink">Copy Weblink</span>  
                <span class="tooltiptext" id="myTooltip" v-if="linkCopied">Link Copied</span> 
                Copy
              </p>
            </div>
            <!-- <p class="copy">Copy</p> -->
          </div>
        </div>
        <!-- <el-button type="primary" class="dwnldBtn" @click="downloadPDF()" :loading="loadingState">Download PDF</el-button> -->
        <!-- <el-button type="primary" class="dwnldBtn" @click="flagForUS ? downloadPDF() : downloadFrontendPDF()" :loading="loadingState">Download PDF </el-button> -->
      </div>
      <div class="footerContainer">
        <el-tooltip
          :disabled="!downloadButtonLoadingState && !imageLoadFailed"
          effect="dark"
          placement="top-start"
          :content="downloadTooltipContent"
        >
          <span>
          <el-button
            type="primary"
            class="dwnldBtn"
            @click="downloadFrontendPDF()"
            :loading="downloadButtonLoadingState"
            :disabled="imageLoadFailed"
          >
            {{buttonText}}
          </el-button>
          </span>
        </el-tooltip>
        <div class="progress-bar-container">
          <div id="report-progress-bar" class="progress-bar" :class="{'progress-bar-complete': !loadingState}" style="width: 0%"></div>
          <div class="progress-bar-text" v-if="loadingState">Generating PDF report..</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { checkEmailValidation } from "../../core/utils/utils";
import API from "@/services/api/";
import { formatDateForReport } from "@/pages/utils/utils.js"
import { SAVE_REPORT_LAMBDA_ENDPOINT } from "../../constants";
import previousProposalRequests from "./previousProposalRequests.vue";

let progressInterval
function startFakeProgressBar() {
  let progressBar = document.getElementById('report-progress-bar')
  if (!progressBar) { return }
  
  progressBar.style.width = `0%`
  let approxTime = 20 // seconds
  let refreshRate = 100 // milliseconds
  let maxPer = 90 // percentage
  progressInterval = setInterval(() => {
    let curProg = parseFloat(progressBar.style.width)
    let newProg = Math.min(curProg + maxPer/(approxTime/(refreshRate/1000)), maxPer)
    progressBar.style.width = `${newProg}%`
  }, refreshRate);
}

function stopFakeProgressBar(finalVal) {
  let progressBar = document.getElementById('report-progress-bar')
  if (!progressBar) { return }
  
  progressBar.style.width = `${finalVal}%`
  clearInterval(progressInterval)
}

export default {
  props: {
    isShareAndDownloadPopupVisible: {
      type: Boolean,
      default: false,
    },
    systemCapacity: {
      type: String,
    },
    currency_code:{
      type: String,
    },
    referenceIdUrl: {
      type: String,
    },
    referenceId: {
      type: String,
    },
    reportOrientation: {
      type: String,
    },
    projectCreator: {
      type: String,
    },
    profileData: {
      type: Object,
      default: function() {
        return {};
      },
    },
    imagesAvailable: {
      type: Boolean,
      default: false
    },
    imageLoadFailed: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isPreviousRequestsPopupVisible: false,
      copyWebLink: true,
      linkCopied: false,
      emailIsRequired: false,
      enterValidEmail: false,
      enteredEmail: '',
      enteredSubject: '',
      designId: this.$route.params.designId,
      loadingState: false,
      subjectFieldRequiredError:false,
    };
  },
  components: {
    previousProposalRequests,
  },
 
  computed: {
    pageSize() {
      return this.profileData.report_defaults.template_name == 'report_gazebo' ? 'Letter' : 'A4'
    },
    isLandscape() {
      // "solar_labs" is Default report theme and will always be a landscape theme.
      // Sometimes for some undiscovered reason, it gets stored in the backend as portrait.
      // To neutralise that, this condition is introduced.
      if (this.profileData.report_defaults.template_name == 'solar_labs') {
        return true
      }
      return this.reportOrientation === "landscape" ? true : false;
    },
    flagForUS(){
     const user = JSON.parse(localStorage.getItem("user")) || {};
     return user.isUSFlagEnabled;
    },
    buttonText() {
      if (this.imageLoadFailed) {
        return "Download unavailable"
      } else if (!this.downloadButtonLoadingState) {
        return "Download PDF"
      } else {
        if (!this.imagesAvailable) {
          return "Please wait.."
        } else if (this.loadingState) {
          return "Downloading.."
        }
      }
      return "Download PDF"
    },
    downloadButtonLoadingState() {
      if (this.imageLoadFailed) {
        return false
      } else {
        return this.loadingState || (!this.imagesAvailable)
      }
    },
    downloadTooltipContent() {
      if (this.imageLoadFailed) {
        return "There was an error while generating the report images. Please refresh the page to try again."
      } else if (!this.imagesAvailable) {
        return 'Waiting for the images to load..'
      } else if (this.loadingState) {
        return "The proposal will be downloaded in about 20 seconds.."
      }
    }
  },

  methods: {
    downloadFileHelper(url, extension) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.setAttribute("download", this.designId + extension); // or any other extension
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    },
   async downloadPDF(){
    this.loadingState = true
    let reportPagesInPayload = this.profileData.report_defaults.pages;
    if(!this.profileData['financial_data'] || !this.profileData['financial_data']['payback'])
      reportPagesInPayload = reportPagesInPayload.filter(item => !["savings","monthly-savings","bill-with-without-solar"].includes(item))
      
    try {
        const response = await API.DESIGNS.FETCH_REPORT(
          this.designId,
          reportPagesInPayload
        );
        const reportUrl = response.data;
        this.downloadFileHelper(reportUrl, ".pdf");
        this.loadingState = false
      } catch (e) {
        console.error("ERROR: designSummaryHeader: downloadReport failed");
        console.error(e);
        this.loadingState = false
        this.$message({
          showClose: true,
          message: "Error downloading report. Please try again.",
          type: "error",
          center: true
        });
      }
    },

    getToken() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        return user.token;
    },

    async downloadFrontendPDF(){
      this.loadingState = true
      let dateString = formatDateForReport(new Date())
      // TODO: Remove the 'reference_id' from the payload and let the backend figure it out on its own,
      // as the backend uses this for the name of the stored report file, which could be a security risk.
      let payload = {
        "reference_id": this.referenceId,
        "base_url": this.referenceIdUrl + "puppeteer/" + dateString + '/'+ this.getToken(),
        "scale": this.profileData.report_defaults.template_name === "solar_labs" ? 1.34 : 1.33,
        "landscape": this.isLandscape,
        "format": this.pageSize
      }
      startFakeProgressBar()

      try {
        let response = await fetch(SAVE_REPORT_LAMBDA_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        let respText = await response.text();
        if (!response.ok) {
          throw respText
        }

        let reportUrl = respText;
        stopFakeProgressBar(100)
        this.downloadFileHelper(reportUrl, ".pdf");
        this.loadingState = false
      } catch (e) {
        console.error(e);
        stopFakeProgressBar(0)
        this.loadingState = false
        this.$message({
          showClose: true,
          message: "Error downloading report. Try again.",
          type: "error",
          center: true
        });
      }
    },
    onDialogClose() {
      this.$emit("update:isShareAndDownloadPopupVisible", false);
    },

    copyLink() {
      let copyLinkText = document.getElementById("webLink");
      navigator.clipboard.writeText(copyLinkText.innerHTML);
      this.linkCopied = true;
      this.copyWebLink = false;
    },

    outFunc() {
      this.copyWebLink = true;
      this.linkCopied = false;
    },

    async sendEmail() {
      // document.getElementById('err-email').style.display = 'none';

      if (!this.enteredEmail) {
        this.emailIsRequired = true;
        this.enterValidEmail = false;
        return;
      }
      this.emailIsRequired = false;

      if (!checkEmailValidation(this.enteredEmail)) {
        this.enterValidEmail = true;
        this.emailIsRequired = false;
        return;
      }
      this.enterValidEmail = false;

      if(!this.enteredSubject){
        this.subjectFieldRequiredError = true;
        return;
      }

      this.enterValidEmail = false;
      this.emailIsRequired = false;

      try {
        // const postData = {
        //   email: this.enteredEmail,
        //   subject: this.enteredSubject,
        //   body: document.getElementById('emailBody').textContent,
        //   // link: this.webProposalPageUrl
        // }

        const postData = {
          "recipients": [this.enteredEmail],
          "subject": this.enteredSubject,
          // "body": document.getElementById('emailBody').textContent,
          "body": document.getElementById('emailBody').innerText,
          "design": this.designId
          // link: this.webProposalPageUrl
        }

        console.log("payload", postData);

        const response = await API.DESIGNS.SHARE_PROPOSAL_EMAIL(postData);
        console.log("response from backend for email", response.data);
        this.resetSendEmailFields();
        this.onDialogClose();

        // this.isLoading = true;
        // const response = await API.DESIGNS.TEST_POST_ACCEPTANCE_DATA(postData);
        // console.log("testAPI response", response.data);
        // this.isLoading = false;
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
  },
};
</script>

<style scoped>

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

#parentContainer >>> .el-dialog__wrapper {
  margin-top: 6vh !important;
  overflow: hidden;
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
  width: 257px;
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
  padding: 16px 24px 0px 24px;
  max-height: 64vh;
  overflow: hidden;
  overflow-y: scroll;
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

.previousRequestInpt{
  font-size: 16px;
  font-weight: normal;
  color: #222;
}
.Previous-Requests {
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366;
  text-decoration: underline;
  cursor: pointer;
}

.inptsOne {
  width: calc(100% - 22px);
}

.inptsTwo {
  width: calc(100% - 60px);
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
  margin-bottom: 42px;
  max-height: 200px;
  overflow: hidden;
  overflow-y: scroll;
}

[contentEditable] {
  outline: 0px solid transparent;
}

.hiiT,
.ssq,
.ques,
.reg {
  font-size: 16px;
  font-weight: normal;
  text-align: left;
  color: #222;
  margin-bottom: 24px;
  line-height: 1.3;
}

.btnCont {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.footerContainer {
  padding: 24px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2em;
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
}

@media (max-width: 700px) {
  .footerContainer {
    flex-direction: column-reverse;
    gap: 1em;
  }
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

@media (max-width: 840px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  #parentContainer >>> .el-dialog__title {
    margin-left: 0px;
  }

  .container {
    padding: 24px 16px 0px 16px;
  }

  .footerContainer {
    padding: 16px;
  }

  .linkF {
    width: 70%;
  }
}

@media (max-width: 500px) {
  #parentContainer >>> .el-dialog__wrapper {
    margin-top: 4vh !important;
  }
  .container {
    max-height: 68vh;
  }

  .borderContent {
    max-height: 242px;
  }
}
.headerSticky{
  position: sticky !important;
  top: 0px !important;
  z-index: 1 !important;
}
.title_text {
  font-size: 14px !important;
  
  color: #777777;
}
</style>