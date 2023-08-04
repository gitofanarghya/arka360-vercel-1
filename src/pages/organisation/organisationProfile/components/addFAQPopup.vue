<template>
  <div class="parentContainer">
    <el-dialog
      :visible="isAddFaqPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title="title"
      width="700px"
      @close="onDialogClose"
    >
      <div class="container">
        <el-form ref="form" :model="form" @submit.native.prevent>
          <!-- v-on:submit.prevent="postFaqData()" -->
          <el-form-item label="Enter Question*">
            <el-input v-model="form.question" v-validate="'required|max:250'" name="Question"></el-input>
          <span class="error-msg">{{ errors.first('Question') == 'The Question field is required.' ? 'This field is required.' :
                                                              ( errors.first('Question') == 'The Question field may not be greater than 250 characters.' ) 
                                                              ? 'This field may not be greater than 250 characters.' : ""  }}</span>
          </el-form-item>
          <el-form-item label="Enter Answer*">
            <el-input type="textarea" v-model="form.answer" v-validate="'required|max:500'" name="Answer"></el-input>
            <span class="error-msg">{{ errors.first('Answer') == 'The Answer field is required.' ? 'This field is required.' :
                                                              ( errors.first('Answer') == 'The Answer field may not be greater than 500 characters.' ) 
                                                              ? 'This field may not be greater than 500 characters.' : ""  }}</span>
          </el-form-item>
        </el-form>
        <div class="btnContainer">
          <el-button type="primary" class="addFAQBtn" @click="postFaqData()" :loading="isLoading" :disabled="errors.items.length > 0 || !isEdited" >{{buttonText}}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";

export default {
  name: "addFAQPopup",

    mounted() {
    this.setFormValues();
  },

  props: {
    isAddFaqPopupVisible: {
      type: Boolean,
      default: false,
    },
    mode : "",
    index : "",
    frequentlyAskedQuestions : "",
  },

  data() {
    return {
      form: {
        question: null,
        answer: null,
      },
      isLoading: false,
      isEdited: false,
    };
  },

  computed: {
        ISUs() {
          const organisation = JSON.parse(localStorage.getItem("organisation")) || {};
          if(organisation.country === 52){
            return true;
          }
          return false;
        },
        title(){
            return this.mode === 'add' ? 'Add new FAQ' : 'Edit FAQ';
        },
        buttonText() {
            return this.mode === 'add' ? 'Add FAQ' : 'Save FAQ'
        },
        successMessage() {
            return this.mode === 'add' ? 'New FAQ added.' : 'FAQ details updated.'
        },
        failMessage() {
            return this.mode === 'add' ? 'Failed to add new FAQ.' : 'Failed to update FAQ details.'          
        }
    },

  methods: {
    onDialogClose() {
      this.$validator.reset();
      this.$emit("update:isAddFaqPopupVisible", false);
    },
    async postFaqData() {
      const isValid = await this.$validator.validateAll();
      if(isValid)
      try {
        this.isLoading = true;
        const user = JSON.parse(localStorage.getItem("user"));
        const frequentlyAskedQuestions = this.frequentlyAskedQuestions;
        const index = this.index;
       if(this.mode == "edit")
       {
        frequentlyAskedQuestions[index].question = this.form.question;
        frequentlyAskedQuestions[index].answer = this.form.answer;
        }
        
        else  if(this.mode == "add")
        {
          frequentlyAskedQuestions[index] = {
             question : this.form.question,
             answer : this.form.answer,
          };
        }
          
        const patchData = {
            frequently_asked_questions : frequentlyAskedQuestions
        }; 
        if(this.ISUs){
          await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
        }
        else{
            const resp = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
              user.organisation_id,
              patchData
              );    
              localStorage.setItem('organisation',JSON.stringify(resp.data));
        }
        this.$message({
          showClose: true,
          message: "FAQ Updated.",
          type: "success",
          center: true
        });
        this.onDialogClose();
      } catch (e) {
        this.isLoading = false;
        console.error(e);
        if (e.response.status === 400) {
          this.errorMsg = e.response.data;
        }
        this.$message({
          showClose: true,
          message: "Failed to add new FAQ",
          type: "error",
          center: true
        });
      }     
        this.isLoading= false;
    },

    setFormValues() {
      if(this.mode == "edit")
      {
        this.form.question= this.frequentlyAskedQuestions[this.index].question;
        this.form.answer= this.frequentlyAskedQuestions[this.index].answer;
      }
      else 
      {
        this.form.question= "";
        this.form.answer= "";
        this.isEdited = true;
      }
    },
        isFormEdited() {
            this.isEdited = !_.isMatch(this.form, this.frequentlyAskedQuestions[this.index]);
        },
  },

   watch: {
        form: {
            deep: true,
            handler(value) {
              if (this.mode == 'edit')
              this.isFormEdited()  
            },
        }
  },
};
</script>

<style scoped>
.parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

.parentContainer >>> .el-dialog__title {
  width: 157px;
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366 !important;
}

.parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 14vh !important;
}

.parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 16px 24px 24px 24px;
}

.parentContainer >>> .el-form-item {
  margin-bottom: 12x;
}

.parentContainer >>> .el-form-item__label {
  color: #777777;
  line-height: 32px;
}

.parentContainer >>> .el-input__inner {
  height: 48px;
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  border: none;
}

.parentContainer >>> .el-textarea__inner {
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  height: 176px;
  border: none;
}

.btnContainer {
  text-align: center;
  padding-top: 10px;
}

.addFAQBtn {
  font-size: 18px;
}

@media (max-width: 800px) {
  .parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  .parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }
}

@media (max-width: 500px) {
  .parentContainer >>> .el-dialog {
    margin-top: 0vh !important;
  }

  .parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  .container {
    padding: 8px 16px 24px 16px;
  }
  .parentContainer >>> .el-textarea__inner {
    height: 38vh;
  }
}
</style>