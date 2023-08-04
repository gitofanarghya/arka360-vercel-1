<template>
  <div class="task-card" @click="selectRow">
    <!-- <el-row class="wrapper">
      <el-row class="wrapper-avatar">
      
        <el-col :span="3"  class="avatar" >
        <el-avatar :icon="task.name? '':'el-icon-user-solid'" :style="{ backgroundColor: task.color?task.color:'#1c3366' ,color:'white'}">{{ task.name[0] }}</el-avatar>
        </el-col>
      
       <el-col :span="20" class="user-container">
        <p class="name-container">{{ task.name ?task.name:'NA'}} <span> (Residensial)</span></p>
     
        <p class="time">Today at 4:30 PM</p>
      </el-col>
      </el-row>
<div class="container">
      <el-row  class="leadDetcolumn">
 <el-col :span="10" >
       <p class="remainder ">set Remindr </p>
       </el-col>
      </el-row>
      <el-row  class="leadDetcolumn">
 <el-col :span="10" class="body-content">
       <p class="time">{{ task.phone }}</p>
       </el-col>
      </el-row>
      <el-row  class="leadDetcolumn">
 <el-col :span="10" class="body-content">
       <p class="time">{{task.email}} </p>
       </el-col>
      </el-row>
    </div>
    
    </el-row> -->
    <!-- <div >
      <p >Order Type:{{task.service_type}}</p>

      <img
        
        src="https://pickaface.net/gallery/avatar/unr_sample_161118_2054_ynlrg.png"
        alt="Avatar"
      >
    </div>
    <div >
      <span >{{task.date}}</span>
      <badge v-if="task.type" :color="badgeColor">{{task.type}}</badge>
    </div> -->
    <el-row class="wrapper">
      <el-row>
        <el-col :span="5">
          <p class="label">Order Type</p>
        </el-col>

        <el-col :span="1">
          <p class="label">:</p>
        </el-col>
        <el-col :span="18">
          <el-tag class="tag" size="small">
            <badge v-if="task.service_type" :color="badgeColor">{{
              task.service_type
            }}</badge>
          </el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">
          <p class="label">Project</p>
        </el-col>
        <el-col :span="1">
          <p class="label">:</p>
        </el-col>
        <el-col :span="18">
          <p class="value">{{ task.name }}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">
          <p class="label">Order Id</p>
        </el-col>
        <el-col :span="1">
          <p class="label">:</p>
        </el-col>
        <el-col :span="18">
          <p class="value">{{ task.id }}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">
          <p class="label">Created on</p>
        </el-col>
        <el-col :span="1">
          <p class="label">:</p>
        </el-col>
        <el-col :span="18">
          <p class="value">{{ task.created_at }}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">
          <p class="label">Due date:</p>
        </el-col>
        <el-col :span="1">
          <p class="label">:</p>
        </el-col>
        <el-col :span="18">
          <p class="value">{{ task.due_date }}</p>
        </el-col>
      </el-row>
     
      <el-row class="alignButtons">
        <el-col v-if="task.design">
          <el-tooltip content="View/Edit Design" placement="top">
          
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="$emit('onDesign', task)"
              size="mini"
            ></el-button>
           
          </el-tooltip>
        </el-col>
        <el-col v-if="task.additional_info?.path">
          <el-tooltip content="View/Edit Survey" placement="top">
          
            <el-button
              type="success"
              icon="el-icon-document"
              @click="$emit('onViewSurvey', task.additional_info?.path)"
              size="mini"
            ></el-button>
          </el-tooltip>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <span class="assignee">Assignee: {{ task.engineer_name }}</span>
        </el-col>
      </el-row>
    </el-row>
  </div>
</template>
<script>
import Badge from "./Badge.vue";
import {
  SL360_URL,
  SITE_SURVEY_LINK,
  BASE_URL_FOR_REPORT_IMAGES,
} from "../../../constants";
export default {
  components: {
    Badge,
  },

  //RKChange2
  emits: ["onDesign", "onViewSurvey"],
  //end
  props: {
    task: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    selectRow() {
      this.$emit("select-card", this.$props.task);
    },
    // handleViewDesign(designId) {
    //   // const url = SL360_URL.includes("/360")
    //   //   ? `${envConfig.env.TSL_APP_URL_ARKA_DOMAIN}/studio/${designId}`
    //   //   : `${envConfig.env.TSL_APP_URL_SOLARLABS_DOMAIN}/studio/${designId}`;
    //   // window.open(url);
    //   window.open(`${BASE_URL_FOR_REPORT_IMAGES}studio/${designId}`);
    // },
    // handleViewSurvey(surveyPath) {
    //   const url = `${SITE_SURVEY_LINK}${surveyPath}/tsl`;
    //   window.open(url);
    // },
  },
  computed: {
    badgeColor() {
      switch (this.task.service_type) {
        case "Solar Sales Proposal":
          return "#ff9921";
        case "Permit Package":
          return "#de350b";
        //   return "teal"
        // case "Preliminary Proposal":
        //   return "green"
        // case "Feature Request":
        // case "Backend":
        //   return "blue"
        default:
          return "teal";
      }
      // const mappings = {
      //   "Preliminary Proposal": "green",
      //   "Feature Request": "teal",
      //   Backend: "blue",
      //   "Solar Sales Proposal": "green",
      //   default: "teal",
      // };
      // return mappings[this.task.type] || mappings.default;
    },
    localCreatedDateTime() {
      const utcDate = new Date(this.task.created_at);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return localDate.toLocaleString();
    },
    localDueDateTime() {
      const utcDate = new Date(this.task.due_date);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return localDate.toLocaleString();
    },
  },
  mounted(){
  console.log(this.$props.task)
}
};

</script>
<style scoped>
/* task-card.css 
.task-card {
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px 16px 20px;
  border: 1px solid #fff;
}*/
.user-container{
  margin-left: 8px;
}
.name-container{
  padding-bottom: 0.2rem;
}
.time {
    font-size: 12px;
    font-weight: 600;
    color: #777;
    display: flex;
    gap: 8px;
}

.time::before {
    content: '';
    background: url('../assets/Vector.svg');
    width: 13.5px;
    height: 13.5px;
    display: block;
}
.remainder {
    font-size: 14px;
    font-weight: 600;
    color: #409eff;
    display: flex;
    gap: 8px;
}

.remainder::before {
    content: '';
    background: url('../assets/event.svg');
    width: 11.3px;
    display: block;
}
.body-content{
  display: flex;
  justify-content: left;
}
.leadDetcolumn {

    display: grid;
    gap: 4px;
}
.task-card {
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 4px;
  /* box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px,
    rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px; */
  overflow: hidden;
  margin-top: 2px;
  margin-bottom: 1rem;
  padding: 0.5rem 0.5rem 0;
}
.task-card h2 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.task-card img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-left: 12px;
}

.task-card span {
  font-size: 12px;
  color: #666;
}

.task-card .badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.task-card .badge.teal {
  background-color: #e6fffa;
  color: #2dcca7;
}

.task-card .badge.blue {
  background-color: #ebf8ff;
  color: #3182ce;
}
</style>
<style scoped>
.wrapper {
  margin-bottom: 20px;
  /* margin-left: 1rem; */
}
.container{
  margin-left: 1rem;
}


.label {
  font-size: 14px;
  font-weight: 600;
}

.tag {
  margin-left: 10px;
}

.value {
  font-size: 14px;
}

.alignButtons {
  display: flex;
  width: 103px;
  margin: 1rem 0;
}

.assignee {
  font-size: 12px;
  color: #999;
  float: right;
}
.card-options {
  padding: 0.7rem 0rem;
}
</style>
