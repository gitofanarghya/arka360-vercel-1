<template>
    <div class="editActivity">
      <GlobalDrawer
        :isOpen="showCreateDrawer"
        :title="''"
        :handleCloseDialog="closeCreateDrawer"
        :drawerSize="700"
      >
        <template #header>
          <div class="title">
              <span class="cross" @click="onClose()" style="font-weight: bolder; padding: 0.75rem 0.5rem 20px;">&#x2716;</span>
          </div>
        </template>
        <template #body>
          <div class="wholeBodyEdit">
            <div class="callerClass">
            <div class="optionsDrop">
              <el-select v-model="computedSelectedValue" placeholder="Select" :disabled="!editMode">
                <template slot="prefix">
                  <i :class="getSelectedIconClass" class="iconClass"></i>
                </template>
                <el-option
                  v-for="item in activityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                  <i :class="item.icon"></i> {{ item.label }}
                </el-option>
              </el-select>
          </div>
          <div class="lilText">
              <span>
                {{getSelectedText}}
              </span>
              <span class="nameTo">
                <abbr :title="leadInfo?.lead_details?.name || leadInfo?.name" class="abbrTag">
                  {{leadNameComputed}}
                </abbr>
              </span> {{computedSelectedValue=="general" ? 'made a note' : ''}}
          </div>
          <div class="dateAndTime">
            <!-- <timePicker/>  -->
            <span style="color: #777;">
              at
            </span>
            <div class="timePicker">
              <!-- <el-time-picker
                :disabled="!editMode"
                v-model="pickedTime"
                :clearable="false"
                value-format="HH:mm:ss"
                format="HH:mm"
                placeholder="Arbitrary time">
              </el-time-picker> -->
              <input
                class="inputTime"
                type="time"
                :class="!editMode ? 'disableTimePicker':''"
                v-validate="'required'"
                name="time"
                v-model="pickedTime"
                :disabled="!editMode"
                placeholder="Select a time"
              />
            </div>
            <span style="color:#777;">
              on
            </span>
            <!-- <datePicker/> -->
            <el-date-picker
              :disabled="!editMode"   
              v-model="pickedDate"
              type="date"
              :clearable="false"
              :format="computedDateFormat"
              value-format="yyyy-MM-dd"
              placeholder="Select a day">
            </el-date-picker>
          </div>
        </div>
            <!-- <div class="descriptionClass"><el-input type="textarea" :rows="4" v-model="editedDesc" placeholder="Add your description"></el-input></div> -->
            <div class="card">
                  <div v-if="!editMode" class="about_content">
                    <div class="floating-label">
                      <p class="descriptionText">
                        {{ editedDesc }}
                      </p>
                    </div>
                  </div>
              <div v-if="editMode" class="about_content">
                <div class="floating-label">
                  <textarea
                    id="autoresizing"
                    role="textbox"
                    class="floating-input floating-textarea"
                    name="aboutUs"
                    placeholder=" "
                    @keydown="autoResizeAboutUs();"
                    v-model="editedDesc"
                  >
                  </textarea>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #pinned-footer>
          <div class="bottomCard">
                  <div class="outerBtn">
                      <el-button type="primary" class="submitBtn" @click="toggleEditMode(); delayAutoResizeAboutUs();"  v-if="!editMode">Edit</el-button>
                  </div>
                  <div class="outerBtn">
                      <el-button type="primary" class="submitBtn" @click="toggleEditMode(); submitDetails();" v-if="editMode">Save</el-button>
                  </div>
          </div>
        </template>
      </GlobalDrawer>
    </div>
</template>

<script>

import API from "@/services/api/";
import { mapState, mapActions } from 'pinia';
import { useActivityStore  } from '../../../stores/activity';
import { useLeadStore } from '../../../stores/lead';
import GlobalDrawer from "../../commonComponents/allDrawer/globalDrawer.vue";

export default {
  name: "editActivity",
  props: {
    showCreateDrawer:{
        default: true,
        type: Boolean,
    },
    isDrawer:{
      default: true,
      type: Boolean
    },
    leadId: {
      default: '',
      type: String
    },
    // activityDetails:{
    //     default: null,
    // }
  },
  components:{
    GlobalDrawer
  },
  computed:{
    ...mapState(useActivityStore, {
        activityDetails: state => state.activityData,
    }),
    ...mapState(useLeadStore, {
        leadInfo: state => state
    }),
    leadNameComputed(){
      const leadName = this.leadInfo?.lead_details?.name || this.leadInfo?.name
      if (leadName && leadName.length > 9) {
        return leadName.substring(0, 9) + "...";
      }
      return leadName;
    },
    computedDateFormat(){
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const isUsUser=user.isUSFlagEnabled;
      return isUsUser ? "MM-dd-yyyy" : "dd-MM-yyyy";
    },
    computedName(){
      if(this.computedSelectedValue=="general"){
        return `${this.leadName} made a note at ${this.computedTime} on ${this.computedDate}`;
      } else {
        return `${this.getSelectedText} ${this.leadName} at ${this.computedTime} on ${this.computedDate}`;
      }
    },
    computedISOString() {


// Combine the date and time values into a single string
      const combinedDateTime = `${this.pickedDate}T${this.pickedTime}`;

      // Create a new Date object from the combined date and time string
      const dateTime = new Date(combinedDateTime);

      // Get the ISO string representation of the date and time
      const isoString = dateTime.toISOString();
      return isoString;
    },
    computedTime() {
      if (!this.pickedTime) {
        return '';
      }

      const [hours, minutes] = this.pickedTime.split(':');
      let suffix = 'AM';
      let formattedHours = parseInt(hours);

      if (formattedHours >= 12) {
        suffix = 'PM';
        formattedHours -= 12;
      }

      if (formattedHours === 0) {
        formattedHours = 12;
      }

      return `${formattedHours}:${minutes} ${suffix}`;
    },
    computedDate() {
      const isoString = this.pickedDate;
      const parsedDate = new Date(isoString);

      return parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    },
    leadName(){
      if(this.isDrawer ){
        return this.leadInfo.lead_details.name;
      } else {
        return this.leadInfo.name;
      }
    },

    projectId(){
      if(this.isDrawer){
        return this.leadInfo.id;
      } else {
        return this.leadInfo.project_details.id;
      }
    },

    getSelectedText() {
      const selectedItem = this.activityOptions.find(item => item.value === this.computedSelectedValue);
      return selectedItem ? selectedItem.text : '';
    },

    computedId(){
      return this.leadId;
    },
    getSelectedIconClass() {
        const selectedItem = this.activityOptions.find(item => item.value === this.computedSelectedValue);
        return selectedItem ? selectedItem.icon : '';
    },
    aboutUsForTriggerEvent(){
      return this.organisationSettingsData.aboutUs;
    },
    computedSelectedValue: {
    get() {
      return this.activityDetails.activity_type;
    },
    set(value) {
      this.activityDetails.activity_type = value;
    }
  },
  },
  watch:{
    activityDetails:{
      handler(val) {
        this.editedDesc = val.description;
      }
    },
    aboutUsForTriggerEvent:{
      handler(value){
        this.delayAutoResizeAboutUs();
      }
    }
  },
  data() {
    return {
        activeTab: "Organization",
        msg: " I am in organisationSettings",
        userMobile: null,
        country: null,
        isSidebarOpen: false,
        isLoading: false,
        editMode: false,
        saveMode: false,
        cancelMode: false,
        counter: 1,
        currentPage: "organisationSummary",
        organisationSettingsData: {
          name: "",
          phone: "",
          email: "",
          website: "",
          cin: "",
          address: "",
          logoUrl: "",
          aboutUs: "",
          nearmapEnabled: false,
          nearmapApiKey: "",
          countryCode: "355",
        },
        organisationSettingsDataTemp: {
          name: "",
          phone: "",
          email: "",
          website: "",
          cin: "",
          address: "",
          logoUrl: "",
          aboutUs: "",
          nearmapEnabled: false,
          nearmapApiKey: "",
          countryCode: "355",
        },
        organisationNameValidation: {
          required: true,
        },
        contactNumberValidation: {
          required: true,
        },
        checkMobileNumberValidation: {
          required: true,
        },
        emailValidation: {
          required: true,
        },
        websiteValidation: {
          required: true,
        },
        addressValidation: {
          required: true,
        },
        aboutUsValidation: {
          max: 900,
        },

        currentHeightOfAboutUs: 200,
        isEmailValid:true,
        isMobileValid: true,
        defaultCountryCode: 0,
        team_members : [],
        previous_projects : {
          previous_project_one_image : null,
          previous_project_one_name : null,
          previous_project_three_image : null,
          previous_project_three_name : null,
          previous_project_two_image : null,
          previous_project_two_name : null,
        },
        frequently_asked_questions : [],
        createBoxHeading : "Edit Activity",
        pickedDate: new Date(),
        pickedTime: new Date(),
        editedDesc:  null,
        selectedValue: "call",
        activityOptions: [{
            value: 'call',
            label: 'Call',
            text: 'Called',
            icon: 'el-icon-phone-outline'
          }, {
            value: 'visit',
            label: 'Visit',
            text: 'Visited',
            icon: 'el-icon-s-home'
          }, {
            value: 'text',
            label: 'Text',
            text: 'Texted',
            icon: 'el-icon-chat-line-square'
          }, {
            value: 'email',
            label: 'Email',
            text: 'Emailed',
            icon: 'el-icon-message'
          }, {
            value: 'general',
            label: 'General',
            text: '',
            icon: 'el-icon-document-add'
          }],
        date: '2019-01-01',
        time: '',
        dateAndTime: '',
        isAM: true,
        isTimePicker: false,
        notes: '',
        loadingStateButton: false
    };
  },
  mounted(){
    this.selectedValue = this.activityDetails.activity_type;
    this.editedDesc = this.activityDetails.description;
    const isoString = this.activityDetails.activity_time;
    const currentDate = new Date(isoString);
    var year = currentDate.getFullYear();
    var month = String(currentDate.getMonth()+1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with leading zeros if necessary
    var day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zeros if necessary
    var hours = String(currentDate.getHours()).padStart(2, '0'); // Pad with leading zeros if necessary
    var minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Pad with leading zeros if necessary
    var seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Pad with leading zeros if necessary

    // Concatenate the hours, minutes, and seconds with colons
    this.pickedTime = hours + ':' + minutes + ':' + seconds;

    // Concatenate the year, month, and day with hyphens
    this.pickedDate = year + '-' + month + '-' + day;
  },
  methods: {
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
    closeCreateDrawer() {
      this.$emit("close")
    },
    onSave(){
        this.$emit('save', false);
    },
    onClose(){
      this.$emit('close', false);
    },
    onDateChange(val) {
      let dateStr = val;
      let date = new Date(dateStr);
      let day = String(date.getDate()).padStart(2, '0');
      let month = String(date.getMonth()).padStart(2, '0');
      let year = String(date.getFullYear()).slice(-2);
      const formattedDate = `${day}/${month}/${year}`;
      this.date = formattedDate;
    },
    onTimeChange(val) {
      const dateTime = new Date(val);
      const hours = this.padZero(dateTime.getHours());
      const minutes = this.padZero(dateTime.getMinutes());
      const seconds = this.padZero(dateTime.getSeconds());
      const formattedTime = `${hours}:${minutes}:${seconds}`;
      this.time = formattedTime;
    },
    padZero(value) {
      return value.toString().padStart(2, '0');
    },
    isoString() {
      const [day, month, year] = this.date.split('/');
      const [hours, minutes, seconds] = this.time.split(':');

      // Create a new Date object using the provided values
      const date = new Date(`20${year}`, month - 1, day, hours, minutes, seconds);

      // Get the ISO 8601 representation of the date and time
      const isoString = date.toISOString();
      this.dateAndTime = isoString;
    },
    async submitDetails() {  
      this.loadingStateButton = true;
      const formData = new FormData();
      formData.append('activity_type', this.computedSelectedValue);
      formData.append('name', this.computedName);
      formData.append('project', this.projectId);
      formData.append('description', this.editedDesc);
      formData.append('activity_time', this.computedISOString);
      try {
          let response = await API.LEADS.UPDATE_ACTIVITY(this.projectId, this.activityDetails.id, formData);
          this.$emit("save", response.data);
          this.loadingStateButton = false;
      } catch (e) {
          this.$message({
              showClose: true,
              message: e,
              type: "error",
              center: true
          });
          this.loadingStateButton = false;
      }
    }
  },
};

</script>

<style lang="scss" scoped>

.setRemminder .el-drawer.rtl{
    min-width: 355px !important;
}

.dateAndTime{
  display: flex;
  align-items: center;
  gap: 10px;
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

.nameTo{
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}


.fullTimePicker{
    padding: 0.5rem;
}

.iconClass{
  position: absolute;
  top: 13px;
  left: 5px;
  color: #222;
}

.descriptionClass {
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #777;
  line-height: 1.5;
}

.amTime, .pmTime {
  cursor: pointer;
  margin-right: 0.5rem;

}

.descriptionText{
  white-space: pre-line;
  overflow: scroll;
  color: rgb(119, 119, 119);
  height: 76vh;
  word-break: break-all;
}

.floating-input {
  font-size: 16px;
  max-height: 76vh;
  display: block;
  width: 100%;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}

.callerClass{
  display: flex;
  gap: 10px;
  align-items: center;
}
.wholeBodyEdit{
  margin-left: 1.5rem;
  margin-right: 2rem;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.lilText{
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

.title{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  flex-direction: row-reverse;
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
  margin-bottom: 20px;
}
.submitBtn{
    position: absolute;
    /* left: 75%; */
    right: 20px;
    bottom: 20px;
    width: 78px;
    height: 36px;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 6px 12px;
    border-radius: 4px;
    background-color: #409eff;
    font-size: 16px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #fff;
}

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

.Div2{
    display: flex;
    align-items: center;
    gap: 20px;
}

</style>

<style scoped>

.inputTime {
  width: 115px;
  height: 40px;
  padding-left: 8px;
  border: 1px solid #ccc;
  background-color: #e8edf2;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.wholeBodyEdit >>> .el-input{
  width: 120px !important;
}

.wholeBodyEdit .callerClass .optionsDrop >>> .el-input{
    height: 40px !important;
    background-color: #e8edf2;
    width: 120px !important;
    max-width: none !important;
    border-radius: 4px;
}

.wholeBodyEdit >>> .el-input{
    height: 40px !important;
    background-color: #e8edf2;
    width: 150px !important;
    max-width: none !important;
    border-radius: 4px;
}

.wholeBodyEdit .callerClass .dateAndTime .timePicker >>> .el-input{
    height: 40px !important;
    background-color: #e8edf2;
    width: 87px !important;
    max-width: none !important;
    border-radius: 4px;
}

.wholeBodyEdit >>> .el-input__inner{
    background-color: #e8edf2;
    max-width: none !important;
    border-radius: 4px;
    font-size: 16px;
    padding-right: 0;
    font-weight: 600;
    padding-left: 30px;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #222;
}

.wholeBodyEdit >>> .el-date-editor .el-input__inner{
    background-color: #e8edf2;
    max-width: none !important;
    border-radius: 4px;
    font-size: 16px;
    padding-right: 0;
    font-weight: 600;
    padding-left: 15px;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #222;
}



.disableTimePicker{
  background-color: #F5F7FA;
  border-color: #E4E7ED;
  color: #C0C4CC;
  cursor: not-allowed;
}

</style>



<style scoped>


.floating-input {
  font-size: 16px;
  max-height: 76vh;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 48px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}



.card{
  box-shadow: none !important;
  border: none !important;
}
</style>

<style>

.wholeBodyEdit .el-date-editor .el-input__prefix {
  position: absolute;
  height: 100%;
  left: auto;
  top: 0;
  text-align: center;
  color: #C0C4CC;
  transition: all 0.3s;
  right: 2px;
}

.wholeBodyEdit .el-input__prefix {
    position: absolute;
    height: 100%;
    left: 2px;
    top: 0;
    text-align: center;
    color: #222;
    transition: all 0.3s;
    right: 15px;
}

.wholeBodyEdit .el-icon-date:before {
  font-weight: bolder;
  color: black;
}


</style>
