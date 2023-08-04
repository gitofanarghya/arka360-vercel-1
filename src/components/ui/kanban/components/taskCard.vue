<template>
  <div class="task-card" id="task-card" @click="selectRow" :style="{ border: selected ,margin:taskIndex!==0?'1rem 0rem':0,marginBottom:0}">
    <el-row class="wrapper" v-if="page == 'Leads'">
      <el-row class="wrapper-avatar">
        <el-col :span="4" class="avatar">
          <el-avatar :icon="task.name ? '' : 'el-icon-user-solid'" :style="{
            backgroundColor: task.color ? task.color : '#1c3366',
            color: 'white',
          }" :src="''">
            <!-- {{ task.name ? task.name.match(/\b(\w)/g).join("") : "" }} -->
            {{ task.name ? extractLetters(task.name) : "" }}
          </el-avatar>
        </el-col>

        <el-col :span="19" class="user-container">
          <p class="name-container" style="
              display: flex;
              justify-content: flex-start;
              align-items: center;
            "
          >
            <!-- <span
              ><p
                class="overfolw-ellipsis user-name"
                style="max-width: 7.5rem !important"
              >
                {{ task.name ? task.name : "NA" }}
              </p></span
            > -->
            <el-tooltip placement="top">
              <div slot="content">
                <span
                  ><p class="lead-name" style="max-width: 7.5rem !important">
                    {{ task.name ? task.name : "NA" }}
                  </p></span
                >
              </div>
              <span
                ><p
                  class="overfolw-ellipsis lead-name"
                  style="max-width: 7.5rem !important"
                >
                  {{ task.name ? task.name : "NA" }}
                </p></span
              >
            </el-tooltip>

            <span class="project-type"> {{ `(${task.project_type})` }}</span>
          </p>

          <p class="time">{{ task.created_at }}</p>
        </el-col>
      </el-row>
      <div class="container">
        <el-row class="leadDetcolumn" >
          <el-col :span="20" @click.native.stop="handleReminder">
            <p class="remainder overfolw-ellipsis overfolw-texts">
              {{
                task.reminder_details
                ? dateTimeFormater(task.reminder_details.reminder_sent_at)
                : "Set Reminder"
              }}
            </p>
          </el-col>
        </el-row>
        <el-row class="leadDetcolumn">
          <el-col :span="10" class="body-content">
            <p class="phone">{{ task.phone }}</p>
          </el-col>
        </el-row>
        <el-row class="leadDetcolumn">
          <el-col :span="10" class="body-content">
            <p class="email">
              <span>
                <p class="overfolw-ellipsis overfolw-texts" style="font-size: 0.85rem">
                  {{ task.email }}
                </p>
              </span>
            </p>
          </el-col>
        </el-row>
      </div>
    </el-row>

    <!-- <div>
      <span>{{ task.date }}</span>
      <badge v-if="task.type" :color="badgeColor">{{ task.type }}</badge>
    </div>
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
    </el-row> -->
    <el-row class="wrapper" v-else>
      <el-row class="spacing">
        <el-col :span="15" class="first-content">
          <p class="label">{{ task.id }}</p>
        </el-col>
        <el-tooltip content="Order type" placement="top" effect="light">
          <el-col :span="9" class="addition-section">
            <el-tag class="tag" :type="task.color" size="mini">
              {{ task.service_type }}
            </el-tag>

            <!-- <el-tag class="tag" size="small">
            <badge v-if="task.service_type" :color="badgeColor"
             :style="{ borderColor: task.color, color: task.color }"
            >{{
              task.service_type
            }}</badge>
          </el-tag> -->
          </el-col>
        </el-tooltip>
      </el-row>
      <el-row class="spacing">
        <el-col :span="24" class="first-content">
          <!-- <p class="label-name overfolw-ellipsis" style="padding-left: 0.5rem">
            {{ task.name }}
          </p> -->
          <el-tooltip class="item" effect="light" :content="'Power Gazebo'" placement="top-start">

              <img 
              v-if="task?.component_type==='Power Gazebo'"
              src="../../../../assets/img/gazeboIcons.svg" alt="" style="
                   {
                    width: 13.5px;
                    height: 13.5px;
                    margin-left: 0;
                  }
                " />
                </el-tooltip>
          <el-tooltip placement="bottom">
            <div slot="content">
            
            <el-col :span=20>
              <p class="label-name" style="padding-left: 0.5rem">
              
        
           
                <p style="color:white">{{ task.name }}</p> 
              </p>
            </el-col>
            </div>
            <p
              class="label-name overfolw-ellipsis"
              style="padding-left: 0.5rem ;display: flex;align-items: center;"
            >
       
          
              {{ task.name }}
            </p>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row class="spacing">
        <el-tooltip class="item" effect="light" :content="'Ordered on'" placement="top-start">
          <el-col :span="20" class="first-content">
            <!-- <span
            ><i class="el-icon-user icon-size" style="padding-right: 0.5rem"></i
          ></span> -->

            <el-col :span="3">
              <img src="../assets/opendoor.svg" alt="" style="
                   {
                    width: 13.5px;
                    height: 13.5px;
                    margin-left: 0;
                  }
                " />
            </el-col>
            <el-col :span="20">
              <p class="label">{{ task.created_at }}</p>
            </el-col>
          </el-col>
        </el-tooltip>
      </el-row>
      <el-row class="spacing">
        <el-tooltip class="item" effect="light" :content="'Due on'" placement="top-start">
          <el-col :span="20" class="first-content">
            <el-col :span="3">
              <img src="../assets/warning.svg" alt="" style="
                   {
                    width: 8px;
                    height: 13px;
                    margin-left: 0;
                  }
                " />
            </el-col>
            <el-col :span="20">
              <p class="label" :style="{ color: task.due_date.color }">
                {{ task.due_date.lable }}
              </p>
            </el-col>
          </el-col>
        </el-tooltip>

        <el-col :span="3" class="addition-section">
          <p v-if="task.due_date.color" :style="{ color: task.due_date.color }">
            &#9679;
          </p>
        </el-col>
      </el-row>
      <el-row class="spacing">
        <el-tooltip class="item" effect="light" :content="selectedColumnType === 'order_status'
            ? 'Delivery type'
            : 'Order type'
          " placement="top-start">
          <el-col :span="20" class="first-content">
            <el-col :span="3">
              <img src="../assets/info.svg" alt="" style="
                   {
                    width: 13.5px;
                    height: 13.5px;
                    margin-left: 0;
                  }
                " />
            </el-col>
            <el-col :span="20">
              <p v-if="selectedColumnType === 'order_status'" class="label">
                {{ task?.delivery_type || "NA" }}
              </p>

              <p v-else class="label">
                {{ task?.orderStatus || "NA" }}
              </p>
            </el-col>
          </el-col>
          <el-col :span="9" class="addition-section"> </el-col>
        </el-tooltip>
      </el-row>
      <el-row class="spacing">
        <el-tooltip class="item" effect="light" :content="'Assigned to'" placement="top-start">
          <el-col :span="15" class="first-content">
            <el-col :span="3">
              <img src="../assets/person.svg" alt="" style="
                   {
                    width: 13.5px;
                    height: 13.5px;
                    margin-left: 0;
                  }
                " />
            </el-col>
            <el-col :span="24">
              <div class="engineer-details" style="">
                <p class="label overfolw-ellipsis">
                  {{ task.engineer_name }}
                </p>
                <div v-if="task.engineer_name !== 'NA' && task.engineer_name !== 'Unassigned'" >
                  <el-badge is-dot :type="task.isOnline ? 'success' : 'info'"
                    style="margin-left: 10px"></el-badge>
                  <!-- <span v-if="task.isOnline === true" style="margin-left: 10px; color: green">Online</span>
                  <span v-else style="margin-left: 10px; color: grey">Offline</span> -->
                </div>
              </div>
            </el-col>
          </el-col>
        </el-tooltip>
        <el-col :span="9" class="addition-section">
          <div v-for="(icon, inx) in buttonsData">
            <el-tooltip class="item" effect="light" :content="icon.tooltipContent" placement="top-start">
              <i v-if="(task.design && icon.exist === 'desgin') ||
                (task.additional_info?.path && icon.exist === 'survey')
                " :key="inx" :class="icon.icon" class="icon-size" style="padding-left: 1rem; color: #777"
                @click.navtive.stop="icon.callback(task)">
              </i>
            </el-tooltip>
          </div>


          <!--messages  -->
          <div style="display: flex;align-items: center;padding-left: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" fill="#777" class="bi bi-chat-left" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
</svg><p style="padding-left: 0.5rem; font-weight: 600;font-size: 1rem; color:#777 ;display: flex;align-items: flex-start" > {{ task.unread_message_count?task.unread_message_count :0 }}</p>
</div>
          <!-- <i
            class="el-icon-document-checked"
            style="font-size: 1.2rem; padding-left: 0.5rem"
          ></i> -->
        </el-col>
      </el-row>
    </el-row>
  </div>
</template>
<script>
import Badge from "./Badge.vue";
import { DateTime } from "luxon";
import { formatDateTime} from '../../../../utils/dateFormatter'
import {
  SL360_URL,
  SITE_SURVEY_LINK,
  BASE_URL_FOR_REPORT_IMAGES,
} from "../../../../constants.js";
export default {
  components: {
    Badge,
  },
  data() {
    return {
      cardSelected: "",
    };
  },
  //RKChange2
  emits: ["onDesign", "onViewSurvey"],
  //end
  props: {
    task: {
      type: Object,
      default: () => ({}),
    },
    buttonsData: {
      type: Array,
    },
    page: {
      type: String,
    },
    componentName: {
      type: String,
    },
    drawer: {
      type: Boolean,
    },
    selected: {
      type: String,
    },
    selectedColumnType: {
      type: String,
    },
    taskIndex:{
      type:Number
    }
  },
  methods: {
    // extractLetters(sentence) {
    //   // Extract the first letter of the sentence
    //   const firstLetter = sentence.match(/^\b(\w)/)[0];

    //   // Extract the last word of the sentence
    //   const words = sentence.split(" ");

    //   const lastWord = words.length > 1 ? words[words.length - 1] : "";

    //   // Extract the first letter of the last word
    //   const lastWordFirstLetter = lastWord ? lastWord.match(/\b(\w)/)[0] : "";
    //   console.log(lastWordFirstLetter);

    //   return firstLetter + lastWordFirstLetter;
    // },

    extractLetters(sentence) {
      // Extract the first letter of the sentence
      // const firstLetter = sentence.match(/^\b(\w)/)[0];

      // Extract the last word of the sentence
      const words = sentence.split(" ");
      const firstLetter = words[0][0];
      const lastWordFirstLetter =
        words.length > 1 ? words[words.length - 1][0] : "";

      return firstLetter + lastWordFirstLetter;
    },
    dateTimeFormater(date) {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const isUsUser=user.isUSFlagEnabled
    
      const dateTime=formatDateTime(date,"Date Dash",isUsUser) +" | "+formatDateTime(date,"Short Time",isUsUser) 
      return dateTime

      // const dateFormate = DateTime.fromISO(date).toFormat("dd-MM-y");
      // const datevalue = DateTime.fromISO(date);
      // const time = datevalue.toLocaleString(DateTime.TIME_SIMPLE);
      // console.log(dateFormate + "|" + time);
      // const formatedDatetime = dateFormate + " |  " + time;
      // return formatedDatetime;
    },
    selectRow() {
      this.cardSelected = true;
      console.log(this.$props.task);

      this.$emit("select-card", this.$props.task);
    },
    handleReminder() {
      console.log("adgsadf");
      this.$emit("component-name", "setReminder", this.$props.task);
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
  mounted() {
    console.log(this.$props.selectedColumnType);
  },
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
.user-container {
  /* margin-left: 8px; */
  margin-bottom: 0.5rem;
}

.name-container {
  font-size: 1rem !important;
  font-weight: 600;
  padding-bottom: 0.2rem;
}

.spacing {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.first-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.engineer-details {
  display: flex;
  justify-content: flex-start;
}

.addition-section {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.time {
  font-size: 0.75rem;
  font-weight: 500;
  color: #777;
  display: flex;
  gap: 8px;
  padding-top: 0.1rem;
  align-items: center;
}

.time::before {
  content: "";
  background: url("../assets/Access-time.svg");
  width: 16px;
  height: 16px;
  display: block;
  background-repeat: no-repeat;
}

.remainder {
  font-size: 0.85rem;
  font-weight: 600;
  color: #409eff;
  display: flex;
  gap: 8px;
}

.remainder::before {
  content: "";
  background: url("../assets/event.svg");
  width: 0.75rem;
  height: 0.85rem;
  display: block;
}

.phone {
  font-size: 0.85rem;
  font-weight: 500;
  /* color: #777; */
  display: flex;
  gap: 8px;
}

.phone::before {
  content: "";
  background: url("../assets/phone.svg");
  width: 13.5px;
  height: 13.5px;
  display: block;
}

.email {
  font-size: 0.85rem;
  font-weight: 500;
  /* color: #777; */
  display: flex;
  gap: 8px;
}

.email::before {
  content: "";
  background: url("../assets/email.svg");
  width: 13.5px;
  height: 13.5px;
  display: block;
}

.body-content {
  display: flex;
  justify-content: left;
}

.leadDetcolumn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 3px;
  gap: 8px;
}

.task-card {
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 4px;
  /* box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px,
    rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px; */
  overflow: hidden;
  /* margin-top: 2px; */
  /* margin: 0.6rem 0rem; */
  margin-bottom: 0;
  cursor: pointer;
  padding: 12px 12px 2px 12px;
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
  /* color: #666; */
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
  /* margin-bottom: 0.5rem; */
  /* margin-left: 1rem; */
}

.container {
  margin-bottom: 0;
}

.label {
  font-size: 14px;
  font-weight: 600;
  padding-left: 5px;
}

.label-name {
  color: #409eff;
}

.tag {
  border-radius: 20px;
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

.icon-size {
  font-size: 1.3rem;
}

.activeClass {
  background: red;
}

#task-crad>>>.custom-tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

#task-crad>>>.custom-tooltip::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  /* border-style: solid; */
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent #000 transparent;
}
#task-crad >>> .el-tooltip__popper.is-dark {
  border: none;
}

.project-type {
  color: grey;
  font-weight: 500;
  text-transform: capitalize;
  padding-left: 0.2rem;
}

.overfolw-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-overfolw {
  white-space: nowrap;
  max-width: 0.5rem !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overfolw-texts {
  max-width: 12rem !important;
}

#task-card>>>.el-avatar {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-transform: uppercase;
}

.user-name {
  font-size: 1rem !important;
  font-weight: 600;
  padding-bottom: 0.2rem;
}

@media (min-width: 1200px) {
  .task-card {
    /* margin: 1rem 0rem; */
    margin-bottom: 0;
    padding: 12px 12px 4px 12px;
  }

  .user-name {
    font-size: 1rem !important;
    font-weight: 600;
    padding-bottom: 0.2rem;
  }
  .lead-name{
    font-size: 1rem !important;
  }
}
</style>
