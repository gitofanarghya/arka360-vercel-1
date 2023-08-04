<template>
  <div class="parentContainer">
    <el-dialog
      :visible="isAddMemberPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title="title"
      width="700px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="imgContainer">
          <div class="imgBorder">
            <img v-if="form.image" :src="form.image" alt="User Profile" class="image"/>
            <img v-else src="../../../../assets/img/person-fill.svg" class="image" />
            <span class="change_btn" style="">
                <img src="../../../../assets/drop/camera.svg" alt="" style="cursor:pointer;">
                 <input
                    type="file"
                    accept=".jpeg,.jpg,.png,"
                    @change="beforeLogoUpload($event)"
                    ref="file"
                    name="profile image"
                    id="file"
                    class="img_input"
                    v-validate="imageValidation"
                  />
            </span>
          </div>
          <span class="error-msg">{{ (errors.first('profile image') == "The profile image field is required.") ? 'This field is required.' : 
                                                                      (errors.first('profile image') == "The profile image field must have a valid file type.") 
                                                                      ? "Only .png and .jpg file formats are supported." : ""  }}</span>
        </div>
        <el-form ref="form" :model="form" @submit.native.prevent>
          <div class="gridContainer">
            <div><el-form-item label="Full Name*">
              <el-input v-model="form.name" v-validate="'required|max:100'" name="Name"></el-input>
            </el-form-item>
            <span class="error-msg">{{ errors.first('Name') == 'The Name field is required.' ? 'This field is required.' : 
                                                            ( errors.first('Name') == 'The Name field may not be greater than 100 characters.' ) 
                                                                    ? 'This field may not be greater than 100 characters.' : ""  }}</span>
            </div>
            <div>
            <el-form-item label="Designation*">
              <el-input v-model="form.position" v-validate="'required|max:100'" name="Designation"></el-input>
            </el-form-item>
            <span class="error-msg">{{ errors.first('Designation') == 'The Designation field is required.' ? 'This field is required.' :
                                                                   ( errors.first('Designation') == 'The Designation field may not be greater than 100 characters.' ) 
                                                                    ? 'This field may not be greater than 100 characters.' : ""  }}</span>
            </div>
          </div>
          <el-form-item label="About Member">
            <el-input type="textarea" v-model="form.description" v-validate="'required|max:500'" name="About"></el-input>
          </el-form-item>
            <span class="error-msg">{{ errors.first('About') == 'The About field may not be greater than 500 characters.' ? 'This field may not be greater than 500 characters.' : ""}}</span>
        </el-form>
      </div>
      <div class="btnContainer">
        <el-button type="primary" class="addFAQBtn" @click="postMemberData()" :loading=isLoading :disabled="errors.items.length > 0 || !isEdited">{{buttonText}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  name: "addMemberPopup",

  mounted() {
    this.setFormValues();
  },

  props: {
    isAddMemberPopupVisible: {
      type: Boolean,
      default: false,
    },
    mode: '',
    formProp: {
        name: "",
        image:"",
        position: "",
        description: "",
      },
    teamProp: {
      type: Array,
    },
    index:"",
  },

  data() {
    return {
      form: {
        name: "",
        image:"",
        position: "",
        description: "",
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
            return this.mode === 'add' ? 'Add new member' : 'Edit member details';
        },
        buttonText() {
            return this.mode === 'add' ? 'Add Member' : 'Save Detail'
        },
        isRequired() {
            return this.mode === 'add' ? 'true' : 'false'
        },
        successMessage() {
            return this.mode === 'add' ? 'New member added.' : 'Member details updated.'
        },
        failMessage() {
            return this.mode === 'add' ? 'Failed to add new member.' : 'Failed to update member details.'          
        },
        imageValidation() {
            return (this.mode === 'add' && this.form.image == "") ? 'required|mimes:image/jpeg,image/png' : 'mimes:image/jpeg,image/png'          
        },
    },

  methods: {
    onDialogClose() {
      this.$validator.reset();
      this.$emit("update:isAddMemberPopupVisible", false);
    },
    beforeLogoUpload(event) {
      let file = event.target.files[0]; 
      if(!file)
      return;

      const isLt256KB = file.size / 1024 < 10000;
      const vm = this;
      // taking the base64 string if image size is less than 256KB

      if (!isLt256KB) {
        this.$message.error("Image size can not exceed 256KB!");
      } else {
        const fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
          vm.form.image = fileLoadedEvent.target.result;
        };
        fileReader.readAsDataURL(file);
      }
      // this ensures that no request is sent on action url
      return false;
    },
    async postMemberData() {
      const isValid = await this.$validator.validateAll();
      if(isValid)
      try {
        this.isLoading= true;
        const user = JSON.parse(localStorage.getItem("user"));
        // await API.USERS.PATCH_USER_DATA(user.user_id, {team_members : []});
        const team = this.teamProp;
       if(this.mode == "edit")
       {
       const index = this.index;
        team[index].name = this.form.name;
        team[index].position = this.form.position;
        team[index].description = this.form.description;
        team[index].image = this.form.image;
        }
        
        else  if(this.mode == "add")
        {
          const index = this.index;
            team[index] = {
             name : this.form.name,
             position : this.form.position,
             description : this.form.description,
             image : this.form.image,
          };
        }
          const patchData = {
            team_members : team
          }; 
        if(this.ISUs){
          await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
        }else{
        const resp = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
          user.organisation_id,
          patchData
        );    
        localStorage.setItem('organisation',JSON.stringify(resp.data));
        }
        
        
        this.$message({
          showClose: true,
          message: this.successMessage,
          type: "success",
          center: true
        });
        this.onDialogClose();
      } catch (e) {
        this.$message({
          showClose: true,
          message: this.failMessage,
          type: "error",
          center: true
        });
      }
      this.isLoading= false;      
    },
    setFormValues() {
      if(this.mode == "edit")
      {
        this.form.name= this.formProp.name;
        this.form.image= this.formProp.image;
        this.form.position= this.formProp.position;
        this.form.description= this.formProp.description;
      }
      else 
      {
        this.form.name= "";
        this.form.image= "";
        this.form.position= "";
        this.form.description= "";
        this.isEdited = true;
      }
    },
    isFormEdited() {
              this.isEdited = !_.isMatch(this.form, this.formProp);
        },
  },

   watch: {
        form: {
            deep: true,
            handler(value) {
              if(this.mode == 'edit')
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
  margin-top: 4vh !important;
}

.parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 24px 24px 0px 24px;
}

.imgBorder {
  border: 3px solid #e8edf2;
  height: 112px;
  width: 112px;
  margin: 0px auto;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  position: relative;
}

.addPhotoIcon {
  position: absolute;
  bottom: 0px;
  right: 0px;
  cursor: pointer;
}

.image {
  height: 112px;
  width: 112px;
  border-radius: 50%;
  object-fit: cover;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
  row-gap: 0px;
  margin-bottom: 18px;
}

.parentContainer >>> .el-form-item {
  margin-bottom: 4px;
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
  padding-top: 4px;
  padding-bottom: 24px;
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
  .parentContainer >>> .el-dialog__wrapper {
    margin-top: 6vh !important;
  }
  .parentContainer >>> .el-dialog {
    margin-top: 0vh !important;
  }

  .parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  .container {
    padding: 24px 16px 16px 16px;
    height: 70vh;
    overflow: hidden;
    overflow-y: scroll;
  }

  .gridContainer {
    display: grid;
    grid-template-columns: auto;
  }

  .parentContainer >>> .el-textarea__inner {
    height: 38vh;
  }

  .btnContainer {
    padding-top: 16px;
  }
}

.change_btn {
    position: absolute;
    bottom: 0;
    right: 5px;
    width: 28px;
    border-radius: 50%;
    height: 28px;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    background-color: var(--white);
    cursor: pointer;
}

.img_input {
  opacity: 0;
  /* visibility: hidden; */
  visibility: unset;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  font-size: 0;
  cursor: pointer;
}

.imgContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>