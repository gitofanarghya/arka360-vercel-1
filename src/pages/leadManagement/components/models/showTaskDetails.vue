<template>
    <div class="taskdetails">
        <slot name="header">
          <div class="title">
            <h3 class="task-title-text">Task Details</h3>
            <span class="cross" @click="onClose()" style="font-weight: bolder; padding: 0.75rem 0.5rem 20px;">&#x2716;</span>
          </div>
        </slot>
        <slot name="body">
          <div class="wholeBody">
            <div>
                <p class="label">Task Name <span class="astrisk"> *</span> </p>
                <p class="task_name">{{ tasks.name }}</p>
            </div>
            <div> 
                <p class="label">Owner <span class="astrisk"> *</span></p>
      
                  <div class="bodyContent ownerBody" >
                    <p class="ownerN">{{ textInitial(tasks.assigned_to) }}</p><span class="ownerLine">{{
                        tasks.assigned_to }}</span>
                </div>
               

            <!-- </div>
            <div>  -->
                <!-- <p class="label">Description</p> -->
                <p class="description">{{tasks.description}}</p>

            </div>
          </div>
        </slot>
        <slot name="footer">
          <div class="bottomCard">
              <!-- <el-card class="boxCard"> -->
                  
                  <div class="outerBtn">
                    <el-button type="default" class="submitBtn1" @click="deleteTask()" :loading="loadingStateButton">Delete</el-button>
                      <el-button type="primary" class="submitBtn" @click="detailsDrawer=true" :loading="loadingStateButton">Edit</el-button>
                  </div>
              <!-- </el-card> -->
          </div>
        </slot>
        <all-drawer :drawer="detailsDrawer" @save="detailsDrawer = false" :componentName="componentName" :drawerSize="500"
        @close="onClose()" :forAddTask="forAddTask" :tasks="tasks"/>
    </div>
</template>
<script >
import API from '@/services/api/';
import { useLeadStore } from '../../../../stores/lead';
import { mapActions, mapState } from "pinia"
export default {
  name: "showTaskDetails",
  props: {
    tasks:{
        type: Object,
        default: []
    }
  },
 
  computed:{
    
  },
  data() {
    return {
      forAddTask:false,
      detailsDrawer: false,
      componentName: "addOrEditTask",
    };
  },

  methods: {
    textInitial(text) {
      return text?.[0]?.toUpperCase()
    },
    onSave(){
        this.$emit('save', false);
    },
    onClose(){
      this.$emit('close', false);
    },
    ...mapActions(useLeadStore, {
      ondeleteTask: "DELETE_TASK_IN_LEAD"
    }),
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
    
  },
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
  color: #222;
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
  color: #777;
  margin-bottom: 10px;
}

.description {
  flex: 1;
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