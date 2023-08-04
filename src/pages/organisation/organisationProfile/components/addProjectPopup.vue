<template>
  <div class="parentContainer">
    <el-dialog
      :visible="isAddProjectPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title="title"
      width="700px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="imgContainer">
          <div class="imgBorder">
            <img v-if="form.projectImage" :src="form.projectImage" alt="Project Image" class="image"/>
            <img v-else-if="mode=='add'" src="../../../../assets/img/card-image.svg" alt="Project Image" class="noimage"/>
            <img v-else :src="editImageURL" class="image" />
            <span class="change_btn" style="">
                <img src="../../../../assets/drop/camera.svg" alt="" style="cursor:pointer;">
                 <input
                    type="file"
                    accept=".jpeg,.jpg,.png,"
                    @change="beforeLogoUpload($event)"
                    ref="file"
                    name="project image"
                    id="file"
                    class="img_input"
                    v-validate = "imageValidation"
                  />
            </span>
          </div>
          <span class="error-msg">{{ (errors.first('project image') == "The project image field is required.") ? 'This field is required.' : 
                                                                      (errors.first('project image') == "The project image field must have a valid file type.") 
                                                                      ? "Only .png and .jpg file formats are supported." : ""  }}</span>
        </div>
        <el-form ref="form" :model="form" @submit.native.prevent>
            <el-form-item label="Enter Project Name and Description*">
              <el-input v-model="form.projectName" v-validate = "validation" name="Project Name" type="textarea"></el-input>
            <span class="error-msg">{{ errors.first('Project Name') == 'The Project Name field is required.' ? 'This field is required.' : ( errors.first('Project Name') ==  errorVlaidText) ?  errorText: ""}}</span>            
            </el-form-item>
        </el-form>
      </div>
      <div class="btnContainer">
        <el-button type="primary" class="addFAQBtn" @click="postProjectData()" :loading="isLoading" :disabled="errors.items.length > 0 || !isEdited" >{{buttonText}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";

export default {
  name: "addProjectPopup",

      mounted() {
    this.setFormValues();
  },

  props: {
    isAddProjectPopupVisible: {
      type: Boolean,
      default: false,
    },
    mode : "",
    index : "",
    previousProjects : "",
  },

  data() {
    return {
      form: {
        projectName: "",
        projectImage: "",
      },
        editImageURL: "",
        isLoading: false,
        isEdited: false,
    };
  },

    computed: {
        title(){
            return this.mode === 'add' ? 'Add new Project' : 'Edit Project';
        },
        buttonText() {
            return this.mode === 'add' ? 'Add Project' : 'Save Project'
        },
        successMessage() {
            return this.mode === 'add' ? 'New project added.' : 'Project details updated.'
        },
        failMessage() {
            return this.mode === 'add' ? 'Failed to add new project.' : 'Failed to update project details.'          
        },
         imageValidation() {
            return (this.mode === 'add' && this.form.projectImage == '') ? 'required|mimes:image/jpeg,image/png' : 'mimes:image/jpeg,image/png'          
        }, 
        ISUs() {
          const organisation = JSON.parse(localStorage.getItem("organisation")) || {};
          if(organisation.country === 52){
            return true;
          }
          return false;
        },
        validation(){
          if(this.ISUs) {
            return "required|max:100";
          } else {
            return "required|max:400";
          }
        },
        errorText(){
          if(this.ISUs) {
            return "This field may not be greater than 100 characters."
          } else {
            return "This field may not be greater than 400 characters."
          }
        },
        errorVlaidText(){
          if(this.ISUs) {
            return "The Project Name field may not be greater than 100 characters."
          } else {
            return "The Project Name field may not be greater than 400 characters."
          }
        }
    },

  methods: {
    onDialogClose() {
            this.form.projectName =  "",
            this.form.projectImage = "",
            this.editImageURL = "",
      this.$emit("update:isAddProjectPopupVisible", false);
    },
    async postProjectData() {
      const isValid = await this.$validator.validateAll();
      if(isValid)      
      try {
        this.isLoading= true;
        const user = JSON.parse(localStorage.getItem("user"));
        const previousProjects = this.previousProjects;
        let patchData = "";
        switch(this.index) {
                     case "1": {
                            if(this.form.projectImage !== null && this.form.projectImage !== "")
                            {
                              patchData = { previous_project_one_name : this.form.projectName,
                                              previous_project_one_image : this.form.projectImage };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                                previousProjects.previous_project_one_image = this.form.projectImage;
                              }
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                                previousProjects.previous_project_one_image = this.form.projectImage;
                              }
                            }
                            else
                            {
                              patchData = { previous_project_one_name : this.form.projectName };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                              }              
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                              }
                            }     
                            previousProjects.previous_project_one_name = this.form.projectName;
                              }
                       break;
                     case "2":
                       {
                            if(this.form.projectImage !== null && this.form.projectImage !== "")
                            {
                              patchData = { previous_project_two_name : this.form.projectName,
                                              previous_project_two_image : this.form.projectImage };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                              }
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                              }
                              previousProjects.previous_project_two_image = this.form.projectImage;
                            }
                            else
                            {
                              patchData = { previous_project_two_name : this.form.projectName };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                              }                
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                              }
                            }     
                            previousProjects.previous_project_two_name = this.form.projectName;
                           }
                       break;
                     default:
                       {
                            if(this.form.projectImage !== null && this.form.projectImage !== "")
                            {
                              patchData = { previous_project_three_name : this.form.projectName,
                                              previous_project_three_image : this.form.projectImage };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                              }
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                              }
                              previousProjects.previous_project_three_image = this.form.projectImage;
                            }
                            else
                            {
                              patchData = { previous_project_three_name : this.form.projectName };
                              if(this.ISUs){
                                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
                              }
                              else{
                                const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                                  user.organisation_id,
                                  patchData
                                );    
                                localStorage.setItem('organisation',JSON.stringify(response.data));
                              }
                            }     
                            previousProjects.previous_project_three_name = this.form.projectName;
                           }
                    };      
        this.$message({
          showClose: true,
          message: this.successMessage,
          type: "success",
          center: true
        });
        this.onDialogClose(); 
      } catch (e) {
        console.error(e);
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
        switch(this.index) {
                     case "1": {
                             this.form.projectName = this.previousProjects.previous_project_one_name;
                             this.editImageURL = this.previousProjects.previous_project_one_image
                              }
                       break;
                     case "2":
                       {
                            this.form.projectName = this.previousProjects.previous_project_two_name;
                            this.editImageURL = this.previousProjects.previous_project_two_image
                       }
                       break;
                     default:
                       {
                            this.form.projectName = this.previousProjects.previous_project_three_name;
                            this.editImageURL = this.previousProjects.previous_project_three_image
                       }
                    }; 
      }
      else 
      {
        this.form.projectName= null;
        this.form.projectImage= "";
        this.isEdited = true;
      }
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
          vm.form.projectImage = fileLoadedEvent.target.result;
        };
        fileReader.readAsDataURL(file);
      }
      // this ensures that no request is sent on action url
      return false;
    },
        isFormEdited() {
          switch(this.index) {
            case "1" : {
                        return this.isEdited = !_.isEqual(this.form.projectName, this.previousProjects.previous_project_one_name) 
                                              || this.form.projectImage != "";
            }
            case "2" : {
                        return this.isEdited = !_.isEqual(this.form.projectName, this.previousProjects.previous_project_two_name) 
                                              || this.form.projectImage != "";
            }
            case "3" : {
                        return this.isEdited = !_.isEqual(this.form.projectName, this.previousProjects.previous_project_three_name) 
                                              || this.form.projectImage != "";
            }
            default : {
                        return false;
            }
          };
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
  border: 1px solid #ccc;
  height: 208px;
  width: 208px;
  margin: 0px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  position: relative;
  border-radius: 4px;
}

.addPhotoIcon {
  position: absolute;
  bottom: -12px;
  right: -12px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 50%;
}

.noImage {
  width: 76px;
  object-fit: contain;
  height: 56px;
}

.image {
  height: 206px;
  width: 206px;
  object-fit: cover;
}

.parentContainer >>> .el-form-item {
  margin-bottom: 16px;
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

.parentContainer >>> .el-textarea__inner{
  min-height: 125px !important;
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  border: none;
  word-break: break-word;
}

.btnContainer {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 30px;
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
    padding: 24px 16px 0px 16px;
    overflow: hidden;
    overflow-y: scroll;
  }

}


.change_btn {
    position: absolute;
    bottom: -10px;
    right: -10px;
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
  min-width: 28px;
}

.imgContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

</style>