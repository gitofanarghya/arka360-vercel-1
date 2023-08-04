<template>
    <div class="addtask">
        <slot name="header">
          <div class="title">
            <h3 class="task-title-text" v-if="forAddTask">Add task</h3>
            <h3 class="task-title-text" v-else>{{ editOrDetails }}</h3>
            <span class="cross" @click="onClose()" style="font-weight: bolder; padding: 0.75rem 0.5rem 20px;">&#x2716;</span>
          </div>
        </slot>
        <slot name="body">
          <div class="wholeBody">
            <div class="forLabel"> 
                <label class="label">Task Name<span class="astrisk"> *</span></label>
                <p class="task_name" v-if="!(editMode || forAddTask)">{{ tasks.name }}</p>
                <el-input 
                v-else
                placeholder="Enter task name" 
                v-model="taskName" 
                v-validate="taskNameValidation" 
                name="taskName" 
                @input="isTaskName()"
                class="custom-input"></el-input>
                <p class="errorMsg" v-show="errors.has('taskName')">
                  This field is required.
                </p>
            </div>
            <div class="boxOne">
                <p class="label">Owner<span class="astrisk"> *</span></p>
                    <div class="bodyContent ownerBody" v-if="!(editMode || forAddTask)">
                        <p class="ownerN">{{ textInitial(tasks.assigned_to) }}</p><span class="ownerLine">{{
                            tasks.assigned_to }}</span>
                    </div>
                    <div class="flexContainer4" v-else>
                        <infiniteScrollUsers
                            :user.sync="selectedUser"
                            :crmMode="true"
                            style="flex-grow: 1;"
                            />
                    </div>
                    <p class="errorMsg" v-if="showOwnerError">
                    This field is required.
                  </p>
             </div>
             <div class="forLabel"> 
                <label class="label" v-if="editMode || forAddTask">Description</label>
                <p class="description" v-if="!(editMode || forAddTask)">{{description}}</p>
                <!-- <el-input 
                v-if="editMode || forAddTask"
                type="textarea" 
                class="descriptionBox"
                :rows="4" 
                placeholder="Add your description" 
                v-model="description" 
                name="description" 
                @input="isDescription($event)"></el-input> -->
                <div v-if="editMode || forAddTask" class="about_content">
                  <div class="floating-label">
                    <textarea
                      id="autoresizing"
                      role="textbox"
                      class="floating-input floating-textarea"
                      name="aboutUs"
                      placeholder=" "
                      @keydown="autoResizeAboutUs();"
                      v-model="description" 
                    >
                    </textarea>
                  </div>
                </div>
                <div class="belowDescriptionBox">
                  <p class="errorMsg" v-if="errors.has('description')">
                    This field is required.
                  </p>
                  <p v-else-if="showDescriptionError" class="errorMsg">This field may not be greater than 500.</p>
                <p class="charracterCount" v-if="editMode || forAddTask">{{ descriptionLength }}/500</p>
                </div>
            </div>
             
          </div>
        </slot>
        <slot name="footer">
          <div class="bottomCard">
              <!-- <el-card class="boxCard"> -->
                  
                  <div class="outerBtn">
                      <el-button v-if="forAddTask" type="primary" class="submitBtn" @click="beforeCreateTask()" :loading="loadingStateButton">Create Task</el-button>
                       <el-button v-if="!(editMode || forAddTask)" type="default" class="submitBtn1" @click="deleteTask()" :loading="loadingStateButton" style="color: red;">Delete</el-button>
                       <el-button v-if="editMode && !forAddTask" type="default" class="submitBtn1" @click="toggleEditMode()" :loading="loadingStateButton">Cancel</el-button>
                      <el-button  v-if="!(editMode || forAddTask)" type="primary" class="submitBtn"  @click="toggleEditMode();" :loading="loadingStateButton">Edit</el-button>
                      <el-button v-if="!(!editMode || forAddTask)" type="primary" class="submitBtn" @click="editTask()" :loading="loadingStateButton">Update</el-button>
                  </div>
              <!-- </el-card> -->
          </div>
        </slot>
        <leadPermissionPopup
          v-if="isLeadPermissionPopup"
          :isLeadPermissionPopup="isLeadPermissionPopup"
          :project_id="project_id"
          :userId="selectedUser.email"
          :userName="selectedUser.first_name"
          @cancelDelete="isLeadPermissionPopup = false"
          @close="isLeadPermissionPopup = false"
          @closeAfterShare="closeAfterShare"
        />
    </div>
</template>
<script >
import API from '@/services/api/';
import leadPermissionPopup from "./leadPermissionPopup.vue";
import { useLeadStore } from '../../../stores/lead';
import { mapActions, mapState } from "pinia"
import infiniteScrollUsers from '@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue/';
export default {
  name: "addOrEditTask",
  components: {
        infiniteScrollUsers,
        leadPermissionPopup,
    },
  props: {
    project_id:{
        type: Number,
    },
    forAddTask: {
      type: Boolean,
    },
    tasks:{
      type: Object,
      default: () => {}
    },
    leadId: {
      type: Number
    }
  },
  mounted(){
    this.fetchtaskdetails();
  },
 
  computed:{
    showOwnerError() {
      return this.validateOwner && this.selectedUser.id==null;
    },

    editOrDetails(){
      if(this.editMode){
        return "Edit Task";
      } else {
        return "Task Details";
      }
    },
    showOwnerError() {
      return this.validateOwner && this.selectedUser.id == null;
    },
    leadIdFinal() {
      return this.leadId || this.leadInfo?.id
    }
  },
  data() {
    return {
        taskNameValidation: {
          required: true,
        },
        editMode: false,
        taskName:"",
        description:"",
        descriptionLength: 0,
        showDescriptionError:false,
        validateOwner:false,
        selectedUser: {},
        loadingStateButton: false,
        isLeadPermissionPopup: false,
    };
  },
  methods: {
    ...mapActions(useLeadStore, {
      ondeleteTask: "DELETE_TASK_IN_LEAD",
      leadInfo: (state) => state
    }),
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    autoResizeAboutUs() {
      try{
        let textArea = document.getElementById("autoresizing");
        textArea.style.height = "auto";
        textArea.style.height = String(Number(textArea.scrollHeight)+20) + "px";
      }
      catch{
      }
    },
    delayAutoResizeAboutUs(){
        setTimeout(this.autoResizeAboutUs,100);
    },
    textInitial(text) {
      return text?.[0]?.toUpperCase()
    },
    closeAfterShare(){
      this.createTask();
      this.isLeadPermissionPopup = false;
      this.onClose();
    },
    onSave(){
        this.$emit('save', false);
    },
    async deleteTask(){
      try{
          let response = await API.LEADS.DELETE_TASK(this.tasks.id);
          this.ondeleteTask(this.tasks.id);
        } catch(e){
          this.$message({
            showClose: true,
            message: 'Unable to delete task.',
            type: "error",
            center: true
          });
        }
        this.onClose()
    },
    isTaskName() {
      this.$validator.validate("taskName", this.taskName);
    },
    isDescription(event) {
      this.$validator.validate("description", this.description);
    },
    ...mapActions(useLeadStore, {
      addTask: "ADD_TASK_IN_LEAD",
      oneditTask: "EDIT_TASK_IN_LEAD",
    }),
    
    async editTask(){
      let isFormValid = false;
      await this.$validator.validateAll().then((result) => {
        if (!result) {
          const errors = this.$validator.errors.all();
        } else {
          isFormValid = true;
        }
      });
      if (isFormValid) {
      const patchData = {
            project_id: this.project_id,
            name: this.taskName,
            description: this.description.trim(),
            assignee_id: this.selectedUser.id,
        };
        
        try{
          let response = await API.LEADS.UPDATE_TASK(this.tasks.id,patchData);
          console.log(response.data);
          this.oneditTask(this.tasks.id,response.data)
        } catch(e){
          this.$message({
            showClose: true,
            message: 'Unable to edit task.',
            type: "error",
            center: true
          });
        }
        this.onClose()
      }
    },
    fetchtaskdetails(){
      if(!this.forAddTask){
        this.taskName= this.tasks.name;
        this.description=this.tasks.description;
        this.selectedUser=this.tasks.assigned_to;
      }
    },
    onClose(){
      this.$emit('close', false);
      this.$validator.reset();
    },
    async beforeCreateTask() {
      let isFormValid = false;
      await this.$validator.validateAll().then((result) => {
        if (!result) {
          const errors = this.$validator.errors.all();
        } else {
          isFormValid = true;
        }
      });
      if (this.selectedUser.id === undefined || this.selectedUser.id === null || this.selectedUser.id === "") {
        this.validateOwner=true;
        isFormValid = false;
        console.log(this.validateOwner);
      } 
      if(isFormValid) {
        const response = await API.PROJECTS.FETCH_PROJECT_PERMISSIONS(this.project_id);
        const isUserPresent = response.data.some((item) => item.user.id === this.selectedUser.id);
        if (!isUserPresent && isFormValid) {
          this.isLeadPermissionPopup = true;
        } else {
          this.createTask();
        }
      }
    },
    async createTask(){
      const postData = {
        lead_id: this.leadIdFinal,
        project_id: this.project_id,
        name: this.taskName,
        description: this.description.trim(),
        assignee_id: this.selectedUser.id,
      };
        try{
          let response = await API.LEADS.CREATE_TASK(postData);
          this.addTask(response.data);
          console.log(response.data);
        } catch(e){
          this.$message({
            showClose: true,
            message: 'Unable to create task.',
            type: "error",
            center: true
          });
        }
      
        this.taskName="",
        this.description="",
        this.selectedUser= {},
        this.$validator.reset(); 
        this.onClose()
      }
  },
  watch: {
    description(value,oldValue) {
      if(oldValue.length === 500 && value.length > oldValue.length){
        this.description = oldValue;
        return;
      }
      if(value.length > 500){
        const allowedPart = value.substring(0,500);
        this.description = allowedPart;
        this.descriptionLength = allowedPart.length;
        return;
      }
      this.descriptionLength = value.length;
    }
  }
};

</script>

<style lang="scss" scoped>
.taskdetails{
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
}
.avatar-img{
    margin-right: 10px;
    border-radius: 50%;
}
.bodyContent {
  display: flex;
  align-items: center;
  min-height: 60px;
}
.ownerN {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1c3366;
  font-size: 16px;
  color: #fff;
  
}
.ownerBody {
  width: auto;
}
.ownerLine {
  font-size: 16px;
  color: #777;
  margin-left: 10px;
}

.avatar-div{
    display: flex;
    align-items: center;
    margin: 0.7rem 0 0.3rem;
}
.taskdetails .el-drawer.rtl{
    min-width: 355px !important;
}

// .bottomCard{
//     position: absolute;
//     bottom: 0px;
//     width: -webkit-fill-available;
// }

.label {
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  color: #777;
  margin-bottom: 10px;
}

.description {
  flex: 1;
  color: rgb(119, 119, 119);
  font-size: 16px;
  word-wrap: break-word;
  white-space: pre-line;
}
.px1{
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.amPm{
  display: flex;
  padding-left: 0.5rem;
  align-items: center;

}

.floating-input {
  font-size: 16px;
  max-height: 50vh;
  display: block;
  width: 100%;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}

.floating-input {
  font-size: 16px;
  max-height: 50vh;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}

.addTimerText{
    cursor: pointer;
    align-items: center;
    padding: 0.5rem;
    display: flex;
}

.fullTimePicker{
    padding: 0.5rem;
}

.amTime, .pmTime {
  cursor: pointer;
  margin-right: 0.5rem;

}

.wholeBody{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.title{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.task-title-text {
  font-weight: bolder;
  padding: 0.75rem 0 20px;
}

.timeInput1, .timeInput2{
  width: auto !important;  
  color: #4c5773;
  font-size: 1.12em;
  padding: 0.75rem 0.75rem;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: border 0.3s linear;
  height: 36px;
}
.astrisk {
  font-size: 12px;
  font-weight: 600;
  color: #f00;
}

.bottomCard {
  display: flex;
  justify-content: flex-end;
  width: -moz-available;
}

.submitBtn {
  margin-right: 1rem;
}
// .submitBtn1 {
//   margin-right: 1rem;
// }

.outerBtn{
  padding: 20px 0px 20px 20px;
  // margin-bottom: 20px;
}
// .submitBtn{
//     position: absolute;
//     /* left: 75%; */
//     right: 20px;
// }
// .submitBtn1{
//     position: absolute;
//     /* left: 75%; */
//     right: 100px;

// }

#birthday{
  font-size: 16px;
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 15px;
    padding-right: 40px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 4px;
    background: transparent;
    border: 1px solid #e0e0e0;
    box-shadow: 0 0.1em 0.3em rgba(0,0,0,.05);
    outline: 0;
    margin-bottom: 10px;
    font-weight: 900;
}

.datePicker{
  padding: 0.5rem;
}

.timePicker{
    align-items: center;
    padding: 0.5rem;
    display: flex;
}

.gapper{
    display: flex;
    width: -webkit-fill-available;
    justify-content: space-between; 
}

.cross{
    cursor: pointer;
}

.selctedPeriod{
    color: #7172ad;
    font-weight: 900;
}
.innerTimePicker{
    width: 125px;
    display: grid;
    grid-template-columns: 40% 20% 40%;
}
.task_name{
  display: flex;
flex-direction: row;
align-items: center;
padding: 12px 16px;
gap: 8px;
height: 48px;
background: #E8EDF2;
border-radius: 8px;
}
</style>

<style lang="scss" scoped>

.addtask .el-drawer.rtl{
    min-width: 355px !important;
}
.bottomCard {
  display: flex;
  justify-content: flex-end;
  width: -moz-available;
}

.submitBtn {
  margin-right: 1rem;
}
// .bottomCard{
//     position: absolute;
//     bottom: 0px;
//     width: -webkit-fill-available;
// }
.forLabel {
  display: flex;
  flex-direction: column;
  
}
.custom-input .el-input {
  background-color: #ad1f1f;
}
// .el-input__inner {
//     -webkit-appearance: none;
//     background-color: rgb(34, 25, 158) !important;
//     background-image: none;
//     border-radius: 4px;
//     border: 1px solid #DCDFE6;
//     box-sizing: border-box;
//     color: #606266;
//     display: inline-block;
//     font-size: inherit;
//     height: 40px;
//     line-height: 40px;
//     outline: none;
//     padding: 0 15px;
//     transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
//     width: 100%;
// }

.px1{
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.label {
  font-size: 14px;
  color: #777;
  margin-bottom: 4px;
}
.flexContainer4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.amPm{
  display: flex;
  padding-left: 0.5rem;
  align-items: center;

}

.belowDescriptionBox{
  display: flex;
  justify-content: space-between;
  align-items: start;
}
.errorMsg {
  letter-spacing: 0.2px;
  color: rgb(214, 12, 12);
  font-size: 13px;
  margin: 6px auto 0 5px;
}
.charracterCount{
  position: absolute;
  right: 20px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  color: #777777;
}
.addTimerText{
    cursor: pointer;
    align-items: center;
    padding: 0.5rem;
    display: flex;
}
.astrisk {
  font-size: 12px;
  font-weight: 600;
  color: #f00;
}
.fullTimePicker{
    padding: 0.5rem;
}

.amTime, .pmTime {
  cursor: pointer;
  margin-right: 0.5rem;

}

.wholeBody{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.title{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.task-title-text {
  font-weight: bolder;
  padding: 0.75rem 0 20px;

}


.timeInput1, .timeInput2{
  width: auto !important;  
  color: #4c5773;
  font-size: 1.12em;
  padding: 0.75rem 0.75rem;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: border 0.3s linear;
  height: 36px;
}



.outerBtn{
  padding: 20px 0px 20px 20px;
  // margin-bottom: 20px;
}
// .submitBtn{
//     position: absolute;
//     left: 75%; 
//     right: 20px;
// }
// .submitBtn1{
//     position: absolute;
//     /* left: 75%; */
//     right: 100px;

// }

#birthday{
  font-size: 16px;
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 15px;
    padding-right: 40px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 4px;
    background: transparent;
    border: 1px solid #e0e0e0;
    box-shadow: 0 0.1em 0.3em rgba(0,0,0,.05);
    outline: 0;
    margin-bottom: 10px;
    font-weight: 900;
}

.datePicker{
  padding: 0.5rem;
}

.timePicker{
    align-items: center;
    padding: 0.5rem;
    display: flex;
}

.gapper{
    display: flex;
    width: -webkit-fill-available;
    justify-content: space-between; 
}

.cross{
    cursor: pointer;
}

.selctedPeriod{
    color: #7172ad;
    font-weight: 900;
}
.innerTimePicker{
    width: 125px;
    display: grid;
    grid-template-columns: 40% 20% 40%;
}

</style>

<style scoped>

.addtask >>> .el-input__inner {
  font-size: 16px !important;
}
.addtask >>> .el-input__inner::placeholder {
  font-size: 16px !important;
}

.addtask >>> .el-textarea__inner{
  min-height: 42px;
  height: 80px;
  align-self: stretch;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid rgb(204, 204, 204);
  background-color: rgb(255, 255, 255);
  font-size: 16px;
}
</style>