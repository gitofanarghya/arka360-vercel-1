<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isShareProposalPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 830px"
      title="Share Proposal"
      width="600px"
      @close="onDialogClose"
    >
      <div class="container">  
        <previousProposalRequests
          v-if="isPreviousRequestsPopupVisible"
          :isPreviousRequestsPopupVisible.sync="isPreviousRequestsPopupVisible"
          :currency_code="currencyCode"
          :design_id="design_id"
      />     
        <div class="borderCont">
          <div class="backOne">
            <!-- <div id="success" class="success">Email sent successfully</div> -->
            <!-- <div id="error" class="error">Invalid Email</div> -->
            <div class="inpOneCont containerTest">
              <div id="tag-container" class="tag-container">
                <label for="fname" class="inpLabOne">To:</label>
                <!-- <div class="tag">
                  <span>Javascript</span>
                  <i class="material-icons">X</i>
                </div> -->
                <input
                  type="text"
                  id="fname"
                  placeholder=""
                  class="inptsOne"
                  v-model="enteredEmail"
                /><br />
                <!-- <div id="err-email" class="err-message-block">Incorrect Email.</div> -->
                <div id="err-email" class="err-message-block" v-if="emailIsRequired">* This is a required field.</div>
                <div id="err-email" class="err-message-block" v-if="enterValidEmail">Please enter a valid email id.</div>
              </div>
            </div>

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

            <div class="borderContent" id="emailBody" contentEditable="true">
              <p class="hiiT">Hi there,</p>
              <p class="ssq">Here's your {{ systemCapacity }} solar system quotation.</p>
              <p class="ques">Please let us know, if you have any questions.</p>
              <p class="ssq">Proposal Link: 
                <a target="_blank" :href="referenceIdUrl">
                  {{ referenceIdUrl }}</a>
              </p>
              <p class="reg">Regards,<br />{{ projectCreator }}</p>
            </div>
          </div>
          <div class="btnCont">
            <span @click="isPreviousRequestsPopupVisible = true" class="Previous-Requests">
              Previous Proposal Requests
            </span>
            <!-- <el-button class="dSendBtn">Send</el-button> -->
            <!-- <el-button type="primary" class="sendBtn" @click="sendEmail">Send</el-button> -->
            <el-button type="primary" class="btn" @click="sendEmail">Send</el-button>
          </div>
        </div>
        <div class="footerSPP">
          <p class="spl">Share Proposal Link:</p>
          <div class="flexCont">
            <!-- <a
              :href="webProposalPageUrl"
              class="linkF"
              >{{ webProposalPageUrl }}</a
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
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import func from 'vue-editor-bridge';
import { checkEmailValidation } from "../../core/utils/utils";
import API from "@/services/api/";
import previousProposalRequests from "./previousProposalRequests.vue";

export default {
  props: {
    isShareProposalPopupVisible: {
      type: Boolean,
      default: false,
    },
    systemCapacity: {
      type: String,
    },
    referenceIdUrl: {
      type: String,
    },
    projectCreator: {
      type: String,
    },
    currencyCode:{
      type: String,
    },
    design_id:{
      type: String,
    },
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
    };
  },
  components: {
    previousProposalRequests,
  },

  methods: {
    onDialogClose() {
      this.$emit("update:isShareProposalPopupVisible", false);
    },

    // copyLink() {
    //   let copyLinkText = document.getElementById("webLink");
    //   navigator.clipboard.writeText(copyLinkText.innerHTML);
      
    //   let tooltip = document.getElementById("myTooltip");
    //   tooltip.innerHTML = "Link Copied";
    // },

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
          "design": this.design_id
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

    
  // TEST start
  test() {
    const tagContainer =  document.getElementById('tag-container');
    const input = document.getElementById('fname');

    let tags = [];

    input.addEventListener('keyup', function(e) {
        if(e.key === 'Enter') {
          tags.push(input.values);
          this.addTags();
          input.value = '';
        }
      });
    },

    addTags() {
      this.reset();
      tags.slice().reverse().forEach(function(tag) {
        const input = this.createTag(tag);
        tagContainer.prepend(input);
      })
    },

    reset() {
      document.querySelectorAll('.tag').forEach(function(tag) {
        tag.parentElement.removeChild(tag);
      })
    },

    createTag(label) {
      const div = document.createElement('div');
      div.setAttribute('class', 'tag');
      const span = document.createElement('span');
      span.innerHTML = label;
      const closeBtn = document.createElement('i');
      closeBtn.setAttribute('class', 'material-icons');
      closeBtn.setAttribute('data-item', label);
      closeBtn.innerHTML = 'x';

      div.appendChild(span);
      div.appendChild(closeBtn);
      return div;
    },

    noName() {
      document.addEventListener('click', function(e) {
        if(e.target.tagName === 'I') {
          const value = e.target.getAttribute('data-item');
          const index = tags.indexOf(value);
          tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
          this.addTags();
        }
      })
    },

  //   // Button Part
  //   send() {
  //     valid = true;

  //     if(tags.length < 1) {
  //       valid = false;
  //     };

  //     tags.forEach(function(tag) {
  //       if(!validateEmail(tag)) {
  //         valid = false;
  //       }
  //     });

  //     if(valid == true) {
  //       this.sendEmailTest();
  //     }
  //     else {
  //       document.getElementById('error').style.display = 'block';
  //       document.getElementById('success').style.display = 'none';
  //     }
  //   },

  //   validateEmail(email) {
  //     // const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)
  //     const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //     // return re.test(String(email).toLowerCase());
  //     return re.test(email);
  //   },

  //   sendEmailTest() {
  //     document.getElementById('success').style.display = 'block';
  //     document.getElementById('error').style.display = 'none';
  //   }





  
  
  
  // // TEST end
  },
};
</script>

<style scoped>

#err-email {
  color: red;
  /* font-size: 13px; */
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
  padding: 16px 24px 0px 24px;
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

.footerSPP {
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
  text-align: left;
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
    padding: 24px 16px 16px 16px;
  }

  .linkF {
    width: 70%;
  }
}

@media (max-width: 500px) {
  #parentContainer >>> .el-dialog__wrapper {
    margin-top: 5vh !important;
  }
  .container {
    max-height: 75vh;
  }

  .borderContent {
    max-height: 242px;
  }

  /* TEST start */
  .containerTest {
    display: inline-block;
    margin-top: 1rem;
  }

  .tag-container {
    border: 2px solid rgb(102, 199, 255);
    padding: 10px;
    border-radius: 45px;
    display: flex;
  }

  .tag-container .tag {
    padding: .5rem 1rem;
    border: 1px solid rgb(102, 199, 255);
    margin: 5px;
    display: flex;
    align-items: center;
    border-radius: 15px;
    background: white;
    cursor: default;
  }

  .tag-container .tag:hover {
    background: rgb(102, 199, 255);
  }

  .tag i {
    font-size: 16px;
    margin-left: 5px;
  }

  .tag-container input {
    flex: 1;
    font-size: 16px;
    padding: 5px;
    outline: none;
    border: 0;
  }

  .material-icons {
    padding-bottom: .1rem;
    padding-left: .5rem;
  }

  .material-icons:hover {
    color: red;
    cursor: pointer;
  }

  .btn {
    color: rgb(102, 199, 255);
    border: 2px soid rgb(102, 199, 255);
    border-radius: 15px;
    padding: .5rem 1rem;
    text-align: center;
    display: inline-block;
  }

  .btn:hover {
    color: white;
    background: rgb(102, 199, 255);
    cursor: pointer;
  }

  .success {
    border: 1px solid green;
    color: green;
    border-radius: 15px;
    padding: 0.5rem 1rem;
    background: rgb(158, 253, 158);
    display: none;
  }

  .error {
    border: 1px solid red;
    color: red;
    border-radius: 15px;
    padding: 0.5rem 1rem;
    background: rgb(248, 188, 188);
    display: none;
  }
  /* TEST end */
}
</style>