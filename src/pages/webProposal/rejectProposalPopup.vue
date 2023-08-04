<template>
    <div id="parentContainer">
      <el-dialog
        :visible="rejectProposalPopupVisible"
        :close-on-click-modal="false"
        style="min-width: 300px"
        title="Reject Proposal"
        width="560px"
        @close="onDialogClose"
        append-to-body
      >
        <div class="container">
          <p class="heading">
            Please choose any reason below that made you reject the Proposal.
          </p>
          <div class="contContainer">
            <el-radio v-model="reason" :label="rejectProposalReason.one" @change="enableRejectProposal = true">
                {{ rejectProposalReason.one }}
            </el-radio>
            <el-radio v-model="reason" :label="rejectProposalReason.two" @change="enableRejectProposal = true">
                {{rejectProposalReason.two}}
            </el-radio>
            <el-radio v-model="reason" :label="rejectProposalReason.three" @change="enableRejectProposal = true">
              {{rejectProposalReason.three}}
            </el-radio>
            <el-radio v-model="reason" :label="rejectProposalReason.four" @change="enableRejectProposal = true">
              {{rejectProposalReason.four}}
            </el-radio> 
            <el-radio v-model="reason" label="Others"  @change="enableRejectProposal = true">
              Other
            </el-radio>
            <textarea id="addInfo" placeholder="Please specify if any other." v-model="description" v-if="reason === 'Others'">
            </textarea>
          </div>
        </div>
          
        <div class="btnCont" slot="footer">
          <el-button type="primary" class="cancelRevisionBtn" @click="rejectProposal" :disabled="!this.enableRejectProposal">
            Reject Proposal
          </el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
 import API from "@/services/api";
  
  export default {
    name: "rejectProposalPopup",
  
    props: {
        rejectProposalPopupVisible: {
            type: Boolean,
            default: false,
        },
        referenceId: {
            type: String,
        },
    },
  
    data() {
      return {
        document_type: "web_proposal",
        enableRejectProposal: false,
        reason: '',
        description: '',
        rejectProposalReason: {
            "one": "Accepting Competing Bid",
            "two": "Cost/Financing",
            "three": "System Design/Technical",
            "four": "Change of Mind",
        },
      };
    },
  
    computed: {
     
    },
  
    methods: { 
      
      async rejectProposal() {
        let refID = this.$route.params.designUUID;
          if (refID == undefined) {
            this.document_type = "document_proposal";
          }
        try {
            const patchData = {
                client_signature: "",
                client_name: "",
                client_email: "",
                state: "REJECTED",
                document_type: this.document_type,
                reject_reason: (this.reason === 'Others') ? this.description : this.reason,
            }
            
            let refID=this.$props.referenceId;
            const response =await API.PROPOSAL_INFO.ACCEPT_OR_REJECT_PROPOSAL(refID,patchData);
            this.$emit("isDocumentRejected",true);
        }
        catch(e) {
            console.log(e);
            this.$message({
              showClose: true,
              message: 'There was an unknown error while proccesing reject proposal request',
              type: "error",
              center: true
            })
        }
        this.onDialogClose();
      },
      onDialogClose() {
        this.$emit("update:rejectProposalPopupVisible", false);
      },
      
    },
  };
  </script>
  
  <style scoped>
  .textAreaStyle {
    display: none;
  }

  .el-dialog__wrapper >>> .el-dialog{
    max-width: 600px;
  }
  .el-dialog__wrapper >>> .el-dialog__header {
    /* background-color: #1c3366; */
    background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: flex !important;
    justify-content: space-between;
    margin-bottom: 0 !important;
    height: 48px !important;
  }
  
  .el-dialog__wrapper >>> .el-dialog__title {
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
    font-size: 18px;
    margin-left: 10px;
    color: #222222 !important;
  }
  
  .el-dialog__wrapper >>> .el-dialog__close {
    color: #222222 !important;
    font-weight: 800 !important;
    font-size: 24px !important;
  }
  
  .el-dialog__wrapper >>> .el-dialog {
    border-radius: 12px !important;
    height: auto;
    /* overflow-y: auto; */
    margin-top: 10vh !important;
  }
  
  .el-dialog__wrapper >>> .el-dialog__body {
    padding: 0px !important;
  }
  
  .container {
    padding: 16px 24px;
  }
  
  .heading {
    font-size: 16px;
    font-weight: 100;
    color: #222;
    word-break: break-word;
    margin-top: 8px;
    margin-bottom: 20px;
  }
  
  .contContainer {
    display: flex;
    flex-direction: column;
  }
  
  .el-dialog__wrapper >>> .el-radio {
    margin-bottom: 20px;
    display: flex;
  }
  
  .el-dialog__wrapper >>> .el-radio__inner {
    width: 20px;
    height: 20px;
    border: 1px solid #707070;
  }
  
  .el-dialog__wrapper >>> .el-radio__inner:hover {
    border: 1px solid #707070;
  }
  
  .el-dialog__wrapper >>> .el-radio__label {
    font-size: 16px;
    padding-left: 12px;
    color: #222;
    word-break: break-word;
    white-space: initial;
  }
  
  .el-dialog__wrapper >>> .el-radio__input.is-checked + .el-radio__label {
    color: #222 !important;
  }
  
  #addInfo {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    border: none;
    border-radius: 4px;
    background-color: #e8edf2;
    font-size: 16px;
    min-height: 128px;
    padding: 16px;
    margin-top: 8px;
    word-break: break-word;
  }
  
  #addInfo::placeholder {
    color: #777;
  }
  
  .btnCont {
    text-align: center;
    margin: 24px auto 8px auto;
  }
  
  .cancelRevisionBtn {
    font-size: 18px;
  }
  
  .el-dialog__wrapper >>> .el-dialog__footer {
    padding: 20px;
    padding-top: 0px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin-top: -10px;
  }
  
  @media (max-width: 760px) {
    .el-dialog__wrapper >>> .el-dialog {
      width: 90vw !important;
      overflow-y: hidden;
    }
  
    .el-dialog__wrapper >>> .el-dialog__wrapper {
      left: 5vw;
      right: 5vw;
      top: -15vw;
      min-width: 0 !important;
      overflow: hidden;
    }
  
    .el-dialog__wrapper >>> .el-dialog__title {
      margin-left: 0px;
    }
  
    .container {
      padding: 24px 16px 16px 16px;
    }
  }
  
  @media (max-width: 760px) {
    .container {
      padding: 24px 16px 16px 16px;
      max-height: 55vh;
      overflow: hidden;
      overflow-y: scroll;
    }
  }
  </style>