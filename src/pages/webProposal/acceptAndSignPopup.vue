<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isAcceptAndSignPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 830px"
      title="Modify Proposal"
      width="600px"
    >
    <div class="contAAS">
     <div class="headingContAAS">
            <p class="accASign">Accept & Sign </p>
            <div class="shareContAAS">
              <img
                src="../../assets/drop/group-167.png"
                class="crossIcon"
                @click="onDialogClose"
              />
            </div>
      </div>
     <esignPlugin :referenceId="referenceId" :proposalData="proposalData" @acceptedDocumentSign="acceptedDocumentSign"></esignPlugin>
      </div>
    </el-dialog>
  </div>
</template>



<script>
import { checkEmailValidation } from "../../core/utils/utils";
import esignPlugin from "../../components/ui/esignPlugin.vue";
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
    esignPlugin
    
  },
  created(){

  },

  data() {
    return {
      nameIsRequired: false,
      emailIsRequired: false,
      enterValidEmail: false,
      acceptanceCheckbox: false,
      enteredName: '',
      enteredEmail: '',
       lineWidth: 6,
      lineColor: "#000000",
      bgColor: "#fff",
      resultImg: "",
      isCrop: false,
    };
  },
  created(){
   console.log("%%%%proposalData",this.$props.proposalData);
  },
  methods: {
    acceptedDocumentSign(isSign){
      console.log("!!calling nice");
      if(isSign){
        this.$emit("acceptedDocumentSignSubmit",true);
      }

    },
     handleReset() {
      this.$refs.esign.reset();
    },
    onDialogClose() {
      this.$emit("update:isAcceptAndSignPopupVisible", false);
    },
    async acceptProposal() {
       // TEST Start
      if(!this.enteredName && !this.enteredEmail) {
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
      } else if (!this.enteredEmail && !checkEmailValidation(this.enteredEmail)) {
        this.enterValidEmail = false;
        this.emailIsRequired = true;
        return;
      } else if (this.enteredEmail && !checkEmailValidation(this.enteredEmail)) {
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
      } else if (!this.enteredName && this.enteredEmail && !checkEmailValidation(this.enteredEmail)) {
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

      try {
        const postData = {
          name: this.enteredName,
          email: this.enteredEmail,
          // link: this.webProposalPageUrl,
          signature: '',
        }

        console.log("payload", postData);
        this.resetAcceptProposalFields();
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

    resetAcceptProposalFields() {
      this.enteredName = '';
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
  padding: 24px;
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
  margin-top: 32px;
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

.inpChkAAS {
  width: 24px;
  height: 24px;
  border: 1px solid #999;
  border-radius: 2px;
  background-color: #fff;
  margin-right: 8px;
  cursor: pointer;
}
.dsignClass{
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
    gap: 0px;
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

  .contAAS {
    max-height: 85vh;
    overflow: hidden;
    overflow-y: scroll;
  padding: 24px 16px;
  }
}
</style>