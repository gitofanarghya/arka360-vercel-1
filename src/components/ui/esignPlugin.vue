<template>
  <div id="parentContainer">
    <div class="container">
      <div class="contAAS">
        <!-- <div class="headingContAAS">
            <p class="accASign">Accept & Sign</p>
            <div class="shareContAAS">
              <img
                src="../../assets/drop/group-167.png"
                class="crossIcon"
                @click="onDialogClose"
              />
            </div>
          </div> -->
        <div class="inputsContAAS">
          <div class="inpTextContAAS">
            <label for="fname" class="inpLabAAS">Enter Your Name </label><br />
            <el-input
              type="text"
              id="fnameIp"
              placeholder=""
              v-model="enteredName"
              :disabled="isdocument_signed"
            ></el-input>
            <div id="err-email" class="err-message-block" v-if="nameIsRequired">
              * This is a required field.
            </div>

            <label for="email" class="inpLabAAS">Enter Your Email Id</label
            ><br />
            <el-input
              type="email"
              id="emailIp"
              placeholder=""
              v-model="enteredEmail"
              :disabled="isdocument_signed"
            ></el-input>
            <!-- <div id="err-email" class="err-message-block">Incorrect Email.</div> -->
            <div
              id="err-email"
              class="err-message-block"
              v-if="emailIsRequired"
            >
              * This is a required field.
            </div>
            <div
              id="err-email"
              class="err-message-block"
              v-if="enterValidEmail"
            >
              Please enter a valid email id.
            </div>
            <!-- <el-checkbox
              v-model="acceptanceCheckbox"
              :disabled="isdocument_signed"
              >Terms & Conditions</el-checkbox
            > -->
            <!-- <div class="chekBxContAAS">
                <el-checkbox  type="checkbox" id="inpChkAAS" v-model="acceptanceCheckbox" :disabled="isdocument_signed"></el-checkbox>
                <p class="chBxAAS">
                  I accept the <span class="boldAAS">Terms & Conditions</span>
                </p>
              </div> -->
          </div>
          <div class="signContAAS">
            <label for="sign" class="inpLabAAS" v-if="!isdocument_signed">Sign Here</label><br />

            <div class="dsignClass">
              <el-tabs v-model="activeName" @tab-click="handleClick" v-if="!isdocument_signed">
                <el-tab-pane label="Draw" name="first">
                  <vueEsign
                    v-if="!isdocument_signed"
                    ref="esign"
                    :isCrop="isCrop"
                    :lineWidth="lineWidth"
                    :lineColor="lineColor"
                    :bgColor.sync="bgColor"
                    :width="800"
                    :height="400"
                    style="border-radius: 10px;"
                  />
                  <img :src="client_signature" v-else />
                </el-tab-pane>

                <!-- The aspect-ratio value below should be in the same
                  ratio as the width:height of the vueEsign component above -->
                  
                <el-tab-pane label="Upload" name="second" style="aspect-ratio: 2 / 1">
                  <div class="imgUploadContainer">
                    <!-- <p class="dragDrop">Drag & Drop the Signature File</p>
                      <p class="dragDrop">OR</p>
                      <button class="brwsImg">Browse File</button> -->
                    <fileUpload
                    v-if="!image"
                      @openFiles="openFiles"
                      :fromEsign="fromEsign"
                    ></fileUpload>
                    <!-- <div  style="height:100%;width:100%"> -->
                      <img v-else :src="preview" class="imgUploadPlace" />
                    <!-- </div> -->
                  </div>
                </el-tab-pane>
              </el-tabs>
               <img :src="client_signature" v-else  class="imgUploadAfterPlace"/>
                <div id="err-sign" class="err-message-block" v-if="signError">*Document not signed</div>
            </div>
            <!-- <div class="chekBxContAASMD">
                <input type="checkbox" class="inpChkAASMD" />
                <p class="chBxAASMD">
                  I accept the <span class="boldAAS">Terms & Conditions</span>
                </p>
              </div> -->
            <div class="fBtnAAS">
              <el-button
                class="rAsAAS"
                @click="handleReset"
                v-if="!isdocument_signed"
                >Reset Signature</el-button
              >
              <div>
                <el-button
                  v-if="!isdocument_signed && $router.currentRoute.name === 'webProposal' && proposalData.state=='PENDING'"
                  type="default"
                  class="rAsAAS"
                  @click="rejectProposalPopupVisible = true"
                  >Reject</el-button
                >
                <el-button
                  v-if="$router.currentRoute.name === 'webProposal' && isRejected"
                  type="danger"
                  class="aAndSBtn"
                  >Rejected</el-button
                >

                <el-button
                  v-if="!isdocument_signed && proposalData.state=='PENDING'"
                  type="primary"
                  plain
                  :disabled="ButtonDisabled"
                  @click="acceptProposal"
                  :loading="loadingState"
                  >Accept </el-button
                >
                <div  v-if="isdocument_signed && !isRejected">Signed on: {{ this.timeStamp }}</div>
            </div>
            </div>
            <rejectProposalPopup 
              v-if="rejectProposalPopupVisible"
              :rejectProposalPopupVisible.sync="rejectProposalPopupVisible"
              :referenceId="referenceId"
              @isDocumentRejected="isDocumentRejected"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import { checkEmailValidation } from "../../core/utils/utils";
import API from "@/services/api";
import fileUpload from "./fileUpload.vue";
import vueEsign from 'vue-esign';
import rejectProposalPopup from "../../pages/webProposal/rejectProposalPopup.vue";
export default {
  props: {
    isAcceptAndSignPopupVisible: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: String,
    },
    proposalData: {
      type: Object,
    },
  },

  components: {
    fileUpload,
    vueEsign,
    rejectProposalPopup,
  },

  data() {
    return {
      rejectProposalPopupVisible: false,
      nameIsRequired: false,
      emailIsRequired: false,
      enterValidEmail: false,
      acceptanceCheckbox: true,
      enteredName: "",
      enteredEmail: "",
      lineWidth: 6,
      lineColor: "#000000",
      bgColor: "#fff",
      resultImg: "",
      isCrop: false,
      isdocument_signed: false,
      proposalRejected: false,
      client_signature: "",
      designIdFromApi: "",
      loadingState: false,
      timeStamp: "",
      document_type: "web_proposal",
      activeName: "first",
      fileList: [],
      fromEsign: true,
      isDraw:true,
      image: false,
      example: "",
      preview: "",
      convertedImgTobase64:"",
      signError: false,
    };
  },
  created() {
    console.log(
      "!! calling propos",
      this.document_type,
      this.$props.proposalData,
      this.$props
    );
    // this.getDetailOfISDocumentSignedOrNot()
    this.setDownDocumentSign(this.$props.proposalData);
      },
  computed: {
    ButtonDisabled() {
      if(this.enteredName && this.enteredEmail && this.acceptanceCheckbox)
      return false;
      else
      return true;
    },
    isRejected(){
      if(this.$props.proposalData.state=="REJECTED" || this.proposalRejected==true)
      return true;
      else
      return false;
    },
    
  },
  methods: {
    isDocumentRejected(){
      this.proposalRejected=true;
      this.getDetailOfISDocumentSignedOrNot();
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleReset() {
      console.log("calling reset");
      this.$refs.esign.reset();
      this.image = false
      this.fileList = ""
    },
    onDialogClose() {
      this.$emit("update:isAcceptAndSignPopupVisible", false);
    },
    async getDetailOfISDocumentSignedOrNot() {
      let refID = this.$route.params.designUUID;
      console.log("%%before ref id", refID);
      if (refID == undefined) {
        console.log("%%inside ref id", refID);
        this.document_type = "document_proposal";
        refID = this.$props.referenceId;
      }
      console.log("%%refid", refID);
      //  const response = await API.PROPOSAL_INFO.IS_DOCUMENT_SIGNED_OR_NOT(refID);
      // console.log("## response of is doc signed",response);

      // this.setDownDocumentSign(response.data);

      this.isdocument_signed = true;
      const d = new Date();
      this.timeStamp = d.toLocaleString();
      this.client_signature = this.resultImg;
    },
    setDownDocumentSign(obj) {
      if(obj.state=="ACCEPTED" || obj.state=="REJECTED"){
        this.isdocument_signed=true;
      }

      if (this.isdocument_signed) {
        this.enteredName = obj.client_name;
        this.enteredEmail = obj.client_email;
        this.acceptanceCheckbox = true;
        this.client_signature = obj.client_signature;
        this.timeStamp = obj.timestamp;
        const d = new Date(this.timeStamp);
        this.timeStamp = d.toLocaleString();
      }
      this.designIdFromApi = obj.design_id;
      console.log("designIdFromApi", this.designIdFromApi);
    },

    async doSignDocument(patchData) {
      try{
        let refID=this.$props.referenceId;
        // const response = await API.PROPOSAL_INFO.ACCEPT_AND_SIGNED(postData);
        const response =await API.PROPOSAL_INFO.ACCEPT_OR_REJECT_PROPOSAL(refID,patchData);
        console.log("%%reponse", response);
        this.$emit("acceptedDocumentSign", true);
        this.loadingState = false;
        this.getDetailOfISDocumentSignedOrNot();

      }catch(e) {
          console.log(e);
          this.$message({
              showClose: true,
              message: 'There was an unknown error while processing accept proposal request',
              type: "error",
              center: true
          })
      }
      
    },
    //  async sentEmailAfterSigned(designVersionId){
    //   console.log("calling email sent",designVersionId);
    //   //    let designVersionId= response.data.id
    //      const response2 = await API.PROPOSAL_INFO.SENT_EMAIL_AFTER_SIGNED(designVersionId);
    //      console.log("%%response 2",response2);
    //       let newVres= await this.newDesignVersion();
    //       console.log("%%newres",newVres);
    //      return response2

    //   },
    //  async newDesignVersion(){
    //   console.log("@@@ desing id",this.designIdFromApi);
    //     const newVersionRes =  await API.PROPOSAL_INFO.NEW_VERSION(this.designIdFromApi)
    //     console.log("newversionres",newVersionRes);
    //     this.getDetailOfISDocumentSignedOrNot();
    //     this.loadingState = false
    //   },
    dynamicPayload(){
        let refID = this.$route.params.designUUID;
          console.log("%%before ref id", refID);
          if (refID == undefined) {
            console.log("%%inside ref id", refID);
            this.document_type = "document_proposal";
            refID = this.$props.referenceId;
          }

          const patchData = {
            client_signature: this.resultImg,
            client_name: this.enteredName,
            client_email: this.enteredEmail,
            state: "ACCEPTED",
            document_type: this.document_type,
            reject_reason: "null",
          };
          this.doSignDocument(patchData);

    },
    handleUploadImgSign(){
      this.resultImg = ""
      this.resultImg = this.preview;
      console.log("resimg",this.resultImg,this.convertedImgTobase64);
    this.dynamicPayload();
    },
    handleSign() {
      this.$refs.esign
        .generate()
        .then((res) => {
          this.resultImg = res;
         this.dynamicPayload();
          // this.resetAcceptProposalFields();
          // this.onDialogClose();
        })
        .catch((err) => {
          // alert(err); // 'Not Signned'
          this.signError = true;
          this.loadingState = false;
        });
    },
    async acceptProposal() {
      this.signError = false;
      if(!checkEmailValidation(this.enteredEmail))
      {
        this.enterValidEmail = true;
        return;
      }
      this.loadingState = true;
      // TEST Start
      if (!this.enteredName && !this.enteredEmail) {
        this.nameIsRequired = true;
        this.emailIsRequired = true;
        this.enterValidEmail = false;
        return;
      } else if (this.enteredName && !this.enteredEmail) {
        this.nameIsRequired = false;
        this.emailIsRequired = true;
        this.enterValidEmail = false;
        return;
      } else if (!this.enteredName && this.enteredEmail) {
        this.nameIsRequired = true;
        this.emailIsRequired = false;
        return;
      } else if (
        !this.enteredEmail &&
        !checkEmailValidation(this.enteredEmail)
      ) {
        this.enterValidEmail = false;
        this.emailIsRequired = true;
        return;
      } else if (
        this.enteredEmail &&
        !checkEmailValidation(this.enteredEmail)
      ) {
        this.enterValidEmail = true;
        this.emailIsRequired = false;
        return;
      } else if (this.enteredName && !checkEmailValidation(this.enteredEmail)) {
        this.enterValidEmail = true;
        this.emailIsRequired = false;
        this.nameIsRequired = false;
        return;
      } else if (!this.enteredName && checkEmailValidation(this.enteredEmail)) {
        this.enterValidEmail = false;
        this.emailIsRequired = false;
        this.nameIsRequired = true;
        return;
      } else if (
        !this.enteredName &&
        this.enteredEmail &&
        !checkEmailValidation(this.enteredEmail)
      ) {
        this.enterValidEmail = true;
        this.emailIsRequired = false;
        this.nameIsRequired = true;
        return;
      }
      // TEST End

      // if (!this.enteredEmail) {
      //   this.emailIsRequired = true;
      //   this.enterValidEmail = false;
      //   return;
      // }

      // if (!checkEmailValidation(this.enteredEmail)) {
      //   this.enterValidEmail = true;
      //   this.emailIsRequired = false;
      //   return;
      // }

      this.nameIsRequired = false;
      this.enterValidEmail = false;
      this.emailIsRequired = false;

      // try {
        if(this.isDraw){
          this.handleSign();
      
      }else{
        console.log("calling handleUploadImgSign");
        this.handleUploadImgSign();
      }

      // this.isLoading = true;
      // const response = await API.DESIGNS.TEST_POST_ACCEPTANCE_DATA(postData);
      // console.log("testAPI response", response.data);
      // this.isLoading = false;
      // }
      // catch (error) {
      //   this.$message({
      //     showClose: true,
      //     message: "Failed to post details. Try Again!",
      //     type: "error",
      //     center: true
      //   })
      // }
    },

    resetAcceptProposalFields() {
      this.enteredName = "";
      this.enteredEmail = "";
    },

    openFiles(fileList) {
      this.isDraw = false;
      this.fileList = fileList;
      console.log("openFiles", this.fileList);
      this.example = this.fileList[0];
      this.image = true;

      // const reader = new FileReader();
      // let rawImg;
      // reader.onloadend = () => {
      //   rawImg = reader.result;
      //   console.log(rawImg);
          
      // };
 const vm = this;
        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
          vm.preview = fileLoadedEvent.target.result;
        };
        fileReader.readAsDataURL(fileList[0]);

    // this.convertedImgTobase64= fileReader.readAsDataURL(this.example);
    console.log("cn inside",this.convertedImgTobase64);

      // this.preview = URL.createObjectURL(this.example);
      console.log("preview", this.preview);
      console.log("preview cn", this.convertedImgTobase64);
      
    },
  },
};
</script>


<style scoped>
.imgUploadPlace{
    height: 100%;
    width: 100%;
    object-fit: contain;
}
.imgUploadAfterPlace{
    width: 100%;
    height: 200px;
    object-fit: contain;
}
#err-email {
  color: red;
  /* font-size: 13px; */
}

.err-message-block {
  /* display: none; */
  width: 100%;
  height: 16px;
  margin: -9px 0 10px 0px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
  font-size: 0.87rem;
  font-weight: normal;
  text-align: left;
  color: #ff0808;
}

.btnDisabled {
  opacity: 0.5;
}

#parentContainer >>> .el-dialog__header {
  display: none !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 10vh !important;
  width: 900px !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.contAAS {
  border-radius: 8px;
  background-color: #f0f3f8;
}

.headingContAAS {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accASign {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}

.crossIcon {
  cursor: pointer;
}

.inputsContAAS {
  display: flex;
  gap: 24px;
  text-align: left;
  padding-top: 32px;
}

.inpTextContAAS,
.signContAAS {
  width: 50%;
}

.inpLabAAS {
  font-size: 16px;
  font-weight: normal;
  color: #777;
}
#fnameIp {
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
  outline: none;
  border: none;
  height: 48px;
  margin-bottom: 16px;
  margin-top: 2px;
  padding: 8px 16px;
  font-size: 16px;
}
#emailIp {
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
  outline: none;
  border: none;
  height: 48px;
  margin-bottom: 16px;
  margin-top: 2px;
  padding: 8px 16px;
  font-size: 16px;
}

.inpTextContAAS .inpAAS {
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
  outline: none;
  border: none;
  height: 48px;
  margin-bottom: 16px;
  margin-top: 2px;
  padding: 8px 16px;
  font-size: 16px;
}

.chekBxContAASMD {
  display: none;
}

.chekBxContAAS {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

#inpChkAAS {
  width: 24px;
  height: 24px;
  border: 1px solid #999;
  border-radius: 2px;
  background-color: #fff;
  margin-right: 8px;
  cursor: pointer;
}
.dsignClass {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.08);
  margin-top: 2px;
  margin-bottom: 10px;
}

.chBxAAS {
  font-size: 16px;
  font-weight: normal;
  text-align: left;
  color: #263342;
}

.boldAAS {
  font-weight: 600;
  text-decoration: underline;
}

.signDrwAAS {
  width: 100%;
  height: 224px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.08);
  margin-top: 2px;
}
.aAndSBtn{
  cursor: not-allowed;
}
.fBtnAAS {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 10px;
}

.rAsAAS {
  font-size: 20px;
  font-weight: bold;
  color: #777;
  padding: 10px 15px;
  background-color: #f0f3f8;
  border-radius: 4px;
  border: 1px solid #777;
  cursor: pointer;
}

.rAsAAS:hover {
  color: #777;
  border-color: #777;
  background-color: #f0f3f8;
}

.accpAAS {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  border-radius: 4px;
  background-color: #409eff;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

#parentContainer >>> .el-input__inner {
  height: 48px;
  border: none;
  font-size: 16px;
  color: #222;
  margin-top: 4px;
}

#parentContainer >>> .el-input {
  margin-bottom: 16px;
}

#parentContainer >>> .el-checkbox__inner {
  width: 24px;
  height: 24px;
}

#parentContainer >>> .el-checkbox__label {
  color: #777;
  font-size: 16px;
  margin-top: 16px;
}

#parentContainer >>> .el-button {
  font-size: 20px;
}

#parentContainer >>> .el-checkbox__inner::after {
  height: 12px;
  left: 9px;
  top: 3px;
}

#parentContainer >>> .el-button--primary.is-plain {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}

#parentContainer >>> .el-button--primary.is-plain.is-disabled {
  color: #8cc5ff;
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.imgUploadContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 16px;
  flex-direction: column;
}

.dragDrop {
  margin-bottom: 13px;
  font-size: 14px;
  color: #222;
}

.brwsImg {
  color: #263342;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #263342;
  background-color: #fff;
  padding: 5px 16px;
  cursor: pointer;
  margin-bottom: 24px;
}

#parentContainer >>> .el-tabs__item {
  font-size: 14px;
  font-weight: normal;
  color: #777;
}

#parentContainer >>> .el-tabs__item.is-active {
  color: #263342;
  font-weight: bold;
}

#parentContainer >>> .el-tabs__active-bar {
  height: 2px;
  color: #263342;
  background-color: #263342;
}

#parentContainer >>> .el-tabs__nav-scroll {
  overflow: hidden;
  padding-left: 16px;
}

.el-tabs >>> .el-tabs__header {
  margin: 0;
}

@media (max-width: 950px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
    margin-top: 2vh !important;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }
}

@media (max-width: 750px) {
  #parentContainer >>> .el-dialog__wrapper {
    margin-top: 5vh !important;
  }

  .accASign {
    font-size: 24px;
  }

  .inputsContAAS {
    flex-wrap: wrap;
    gap: 24px;
  }

  .chekBxContAAS {
    display: none;
  }

  .chekBxContAASMD {
    display: flex;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .inpChkAASMD {
    width: 24px;
    height: 24px;
    border: 1px solid #999;
    border-radius: 2px;
    background-color: #fff;
    margin-right: 8px;
  }

  .chBxAASMD {
    font-size: 16px;
    font-weight: normal;
    text-align: left;
    color: #263342;
  }

  .inpTextContAAS,
  .signContAAS {
    width: 100%;
  }
}
</style>