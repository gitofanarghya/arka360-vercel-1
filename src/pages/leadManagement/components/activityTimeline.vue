<template>
  <div ref="blockRef" class="block" :class="isDrawer ? '' : 'lead'">   
  <div class="timeline-container">
  <el-timeline :reverse="reverse">
    <el-timeline-item
      v-for="(activity, index) in activityComputed"
      :key="index"
      :style="[index===activityComputed.length-1 ? {'marginTop': '20px'} : {}  ]"
      :hide-timestamp="true"
      :icon="getActivityIcon(activity)"
      :type="type"
      :timestamp="activity.timestamp">
      <div class="container">
        <div class="wholeItem" :class="window.width<minWidth ? 'wholeItemMedia': ''">
            <div class="dateBlock" :class="window.width<minWidth ? 'dateBlockMedia': ''">
              <span>{{getDateAndTime(activity.activitylog_created).date}}</span>
            </div>
            <div class="activityContent" :class="window.width<minWidth ? 'activityContentMedia': ''"  @click="onClickActivity(activity)">
                <p class="activityName">
                    {{ activity.name }}
                </p>
            </div>
            <div class="timeDiv" :class="window.width<minWidth ? 'timeDivMedia': ''">
                <p class="timeClass">
                    {{ getDateAndTime(activity.activitylog_created).time }}
                </p>
            </div>
        </div>
        <p class="activityDesc" :class="window.width<minWidth?'activityDescMedia':''"  @click="onClickActivity(activity)">
          {{ getTruncatedDescription(activity) }}
          <span v-if="showSeeMore(activity)" class="see-more">...See More</span>
        </p>
        <div class="docs" v-if="activity.documents.length" :class="window.width<minWidth?'docsMedia':''">
            <p class="docText">Documents:</p>
            <div class="allDocs">
              <div class="specificDoc" v-for="(doc, index) in activity.documents" :key="index">
                <p class="docName">{{getTruncatedFileName(doc.display_name, 14)}}</p>
                <div class="actionIcons">
                  <img src="./assets/Download.svg" class="downloadIcon" @click="downloadClick(doc)"/>
                  <!-- <span>&#x2716;</span> -->
                </div>
              </div>
            </div>
          </div>
        </div>
    </el-timeline-item>
  </el-timeline>
</div>
  <div class="bottomCard">
      <el-card class="boxCard">
        <div class="callerClass">
          <div class="optionsDrop">
            <el-select v-model="selectedValue" placeholder="Select">
              <template slot="prefix" >
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
              <abbr :title="leadInfo?.name || leadInfo?.lead_details?.name" class="abbrTag">
                {{this.leadNameComputed}}
              </abbr>
            </span> {{selectedValue=="general" ? 'made a note' : ''}}
        </div>
        <div class="dateAndTime">
          <!-- <timePicker/>  -->
          <span style="color: #777;">
            at
          </span>
          <div class="timePicker">
            <!-- <el-time-picker
              v-model="pickedTime"
              :clearable="false"
              value-format="HH:mm:ss"
              format="HH:mm"
              placeholder="Arbitrary time">
            </el-time-picker> -->
            <input
              class="inputTime"
              type="time"
              v-validate="'required'"
              name="time"
              v-model="pickedTime"
              placeholder="Select a time"
            />
          </div>
          <span style="color: #777;">
            on
          </span>
          <!-- <datePicker/> -->
          <el-date-picker
            v-model="pickedDate"
            type="date"
            :picker-options="pickerOptions"
            :clearable="false"
            :format="computedDateFormat"
            value-format="yyyy-MM-dd"
            placeholder="Pick a day">
          </el-date-picker>
        </div>
        </div>
        <div class="descriptionText">
          <el-input type="textarea" :rows="4" placeholder="Add your notes here" v-model="notes" ref="addNoteInput" class="describe" :autofocus="true" v-validate="descValidation" name="description"></el-input>
          <p
            class="formErrors"
            style="color: red"
            v-show="errors.has('description') && isDisabled"
          >
            {{ errors.first('description') }}
          </p>
        </div>
          <div class="outerBtn">
            <div class="allFiles">
              <div v-for="(file, index) in fileList" :key="index" class="fileName">
                <p>{{getTruncatedFileName(file.name,14)}}</p>
                <span class="cross" @click="onClose(index)" style="font-weight: bolder;">&#x2716;</span>
              </div>
            </div>
            <div class="uploadAndSave">
              <div class="file-input">
                <input id="file-upload" type="file" class="file-input-element" multiple ref="file" @change="onChange">
                <label for="file-upload" class="file-label">
                  <img src="./assets/upload.svg" alt="" class="iconUpload">
                </label>
              </div>
              <div class="saveButton">
                <el-tooltip
                  :disabled="projectPermissionObject.add_activitylog"
                  effect="dark"
                  placement="top-start"
                  :content="'You dont have permission to change the activity timeline'"
                >
                  <span>
                    <el-button type="primary" :disabled="!projectPermissionObject.add_activitylog || errors.items.length > 0 && isDisabled" :loading="isLoading"
                    class="submitBtn" @click="submitDetails()">
                    Update
                    </el-button>
                  </span>
                </el-tooltip>
              </div>
            </div>
        </div>
      </el-card>
  </div>
  <!-- <all-drawer :drawer="editDrawer" @save="reminderDrawer = false" :componentName="componentName" :drawerSize="700" @close="editDrawer = false" :isDrawer="isDrawer"/> -->
  <editActivity :showCreateDrawer="showCreateDrawer" @close="showCreateDrawer=false" :isDrawer="isDrawer" @save="onSave" :key="editKey"/>
</div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useLeadStore } from '../../../stores/lead';
import { useProjectStore } from '../../../stores/project';
import { useActivityStore } from '../../../stores/activity';
import datePicker from '../../setReminder/components/datePicker.vue';
import timePicker from '../../setReminder/components/timePicker.vue';
import API from '@/services/api/';
import editActivity from './editActivity.vue';





  export default {
    data() {
      return {
        isDisabled: false,
        editKey: 0,
        window: {
          width: 0,
          height: 0,
        },
        minWidth: 694,
        isLoading : false,
        leadName: "",
        type: 'primary',
        showCreateDrawer: false,
        selectedText: "",
        componentName: "editActivity",
        editDrawer: false,
        reverse: true,
        assignment : './assets/assignment.svg',
        notes: "",
        fileList: [],
        selectedValue: "call",
        pickedDate: "",
        pickedTime: "",
        activities:  [],
        descValidation: {
          required: true,
        },
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
        };
    },
    props:{
      isDrawer: {
        default: true,
        type: Boolean,
      },
      focusAddNote: {
        type: Boolean,
        default: false
      },
      lead: {
        type: Object,
        default: () => {
          return {};
      },
    },
  },
    components:{
      datePicker,
      timePicker,
      editActivity
    },
    created(){
      window.addEventListener("resize", this.handleResize1);
      this.handleResize1();
      var now = new Date();
      var currentDate = new Date();

      // Get the year, month, and day from the current date
      var year = currentDate.getFullYear();
      var month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with leading zeros if necessary
      var day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zeros if necessary
      var hours = String(currentDate.getHours()).padStart(2, '0'); // Pad with leading zeros if necessary
      var minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Pad with leading zeros if necessary
      var seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Pad with leading zeros if necessary

      // Concatenate the hours, minutes, and seconds with colons
      this.pickedTime = hours + ':' + minutes;

      // Concatenate the year, month, and day with hyphens
      this.pickedDate = year + '-' + month + '-' + day;
    },
    mounted(){
      this.handleResize1();
      const clone = Object.assign({}, this.leadInfo);
      this.fetchActivity();
      if(this.focusAddNote){
        this.focusOnAddNotesSection();
      }
    },
    destroyed(){
      window.removeEventListener("resize", this.handleResize1);
    },
    methods:{
        ...mapActions(useActivityStore, {
              setActivity: "SET_ACTIVITY_DETAILS",
          }),
      ...mapActions(useLeadStore, {
              updateLatestNote: "UPDATE_LATEST_NOTE",
          }),

        isDesc() {
          this.$validator.validate('description', this.notes);

        },
        async fetchActivity(){
          let response = await API.LEADS.FETCH_ACTIVITY(this.projectId);
          this.activities = response.data;
          
        },
        getActivityIcon(activity) {
          if (activity.activity_type === "lead_created" || activity.activity_type === "deal_won") {
            return "el-icon-star-on";
          } else if (activity.activity_type === "lead_updated") {
            return "el-icon-right";
          } else if (activity.documents.length > 0) {
            return "el-icon-document";
          } else {
            return "el-icon-tickets";
          }
        },

        handleResize1() {
          const blockDiv = this.$refs.blockRef;
          if (blockDiv) {
            const rect = blockDiv.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Use the width and height as needed
            this.window.width = rect.width;
            this.window.height = rect.height;
            
            
          }
        },


        handleResize() {
          this.window.width = window.innerWidth;
          this.window.height = window.innerHeight;
        },

        getTruncatedDescription(activity) {
          if (activity.description.length > 140) {
            return activity.description.substring(0, 140);
          } else {
            return activity.description;
          }
        },

        getTruncatedFileName(fileName, length) {
          if (fileName.length > length) {
            return "..." + fileName.substring(fileName.length-length);
          } else {
            return fileName;
          }
        },

        showSeeMore(activity) {
          return activity.description.length > 125;
        },

        focusOnAddNotesSection() {
          this.$refs.addNoteInput.focus();
        },

        onSave(updatedActivity){

          for (let i = 0; i < this.activities.length; i++) {
            if (this.activities[i].id === updatedActivity.id) {
              this.activities[i] = updatedActivity;
              break;
            }
          }
          this.showCreateDrawer = false;
        },
        getDateAndTime(val){
          const isoString = val;
          const parsedDate = new Date(isoString);
          const day = parsedDate.getDate();
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = monthNames[parsedDate.getMonth()];
          return {
            "date": `${day} ${month}`,
            "time": parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          }
        },
        async downloadClick(file) {
          let fileID = file.id;
          let arrayIds = [];
          arrayIds.push(fileID);
          let postData = {
            document_ids: arrayIds,
          };
          let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
          let url = response.data[0];
          saveAs(url, file.display_name);
        },
        async submitDetails() {
          this.isLoading = true;
          let isFormValid = false;
          await this.$validator.validateAll().then((result)=> {
          if (!result) {
            // validation failed, display error messages
            this.isDisabled = true;
            const errors = this.$validator.errors.all();
            // do something with the errors, such as displaying them in a div on the page
          } else {
            isFormValid = true
            // validation passed, submit the form normally
          }
        });
        if(isFormValid) {
          const formData = new FormData();

          // Add fields to the form data
          formData.append('activity_type', this.selectedValue);
          formData.append('name', this.computedName);
          formData.append('project', this.projectId);
          formData.append('description', this.notes);
          formData.append('uploaded_by', 'installer');
          formData.append('document_container', 'other');
          formData.append('activity_time', this.computedISOString);

          // Add files to the form data
          for (let i = 0; i < this.fileList.length; i++) {
            formData.append('file[]', this.fileList[i]);
          }

          try {
            let response = await API.LEADS.ADD_ACTIVITY(formData);
            this.updateLatestNote(this.notes);
            this.activities.push(response.data);
            this.notes = "";
            this.fileList = [];
            this.selectedValue = "call";
            this.isDisabled = false;
          } catch (e) {
            console.log(e);
            this.$message({
              showClose: true,
              message: 'Unable to add activity.',
              type: 'error',
              center: true
            });
          }
        }
        this.isLoading = false; 
        },
      onChange() {
        const inputFiles = this.$refs.file.files;
        for (let i = 0; i < inputFiles.length; i++) {
          this.fileList.push(inputFiles[i]);
        }
      },
      onClose(val) {
        this.fileList.splice(val, 1);
      },
      onClickActivity(activity) {
        this.editKey++;
        const selectedOption = this.activityOptions.find(option => option.value === activity.activity_type);
        if (selectedOption) {
          this.showCreateDrawer = true;
          this.setActivity(activity);
          this.editDrawer = !this.editDrawer;
        } else {
          // Activity type not found in activityOptions
          // Perform any desired action or show an error message
        }
      }
    },
    computed:{
        ...mapState(useLeadStore, {
              leadActivityLogs: state => state.activity_logs,
              leadInfo: state => state,
              leadInfoName: state => state?.name || state?.lead_details?.name
          }),
        ...mapState(useProjectStore, {
          projectPermissionObject: 'GET_PERMISISON_OBJECT',
        }),
        computedDateFormat(){
          const user = JSON.parse(localStorage.getItem('user')) || {};
          const isUsUser=user.isUSFlagEnabled;
          return isUsUser ? "MM-dd-yyyy" : "dd-MM-yyyy";
        },
        pickerOptions() {
          if (1) {
            return {
              disabledDate: (date) =>
                date.getTime() > new Date().setHours(0, 0, 0, 0),
            };
          } else {
            return {};
          }
        },
        projectId(){
          return this.lead?.id || this.leadInfo?.project_details?.id
        },
        computedName(){
          if(this.selectedValue=="general"){
            return `${this.leadInfo?.name || this.leadInfo?.lead_details?.name} made a note at ${this.computedTime} on ${this.computedDate}`;
          } else {
            return `${this.getSelectedText} ${this.leadInfo?.name || this.leadInfo?.lead_details?.name} at ${this.computedTime} on ${this.computedDate}`;
          }
        },
        computedISOString(){
          // Assuming you have selectedDate and selectedTime variables with the values from the pickers
          const selectedDate = new Date(this.pickedDate); // Example date value
          const selectedTime = this.pickedTime; // Example time value

          // Extracting individual date components
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth(); // Months are zero-based, so adding 1
          const day = selectedDate.getDate();

          // Splitting the time into hours, minutes, and seconds
          const [hours, minutes] = selectedTime.split(":");

          // Creating a new Date object with the combined date and time components
          const combinedDateTime = new Date(year, month, day, hours, minutes);

          // Getting the ISO string format
          const isoString = combinedDateTime.toISOString();

          return isoString;

        },
        getSelectedText() {
          const selectedItem = this.activityOptions.find(item => item.value === this.selectedValue);
          return selectedItem ? selectedItem.text : '';
        },

        getSelectedIconClass() {
          const selectedItem = this.activityOptions.find(item => item.value === this.selectedValue);
          return selectedItem ? selectedItem.icon : '';
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

        leadNameComputed(){
          const leadName = this.leadInfo?.name || this.leadInfo?.lead_details?.name;
          if (leadName && leadName.length > 9) {
            return leadName.substring(0, 9) + "...";
          }
          return leadName;
        },
        // getDateAndTime(){
        //   const isoString = "2023-05-30T10:15:30Z";
        //   const parsedDate = new Date(isoString);
        //   const day = parsedDate.getDate();
        //   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        //   const month = monthNames[parsedDate.getMonth()];
        //   const hours = parsedDate.getUTCHours();
        //   const minutes = parsedDate.getUTCMinutes();
        //   const seconds = parsedDate.getUTCSeconds();
        //   return {
        //     "date": `${day}-${month}`,
        //     "time": `${hours}:${minutes}:${seconds}`  
        //   }
        // },

        activityComputed() {
          this.activities.map(activity => ({
            ...activity,
            icon: (activity.activity_type === "lead_created" || activity.activity_type === "deal_won") ? "el-icon-star-on" : (activity.activity_type === "lead_updated" ? "el-icon-right" : (activity.documents.length > 0 ? "el-icon-document" : "el-icon-tickets")),
          }));
          return this.activities;
        },

    },
    watch:{
      leadActivityLogs() {
        this.activities =  this.leadInfo.activity_logs;
      },
      // leadInfo:{
      //   handler(val) {
      //     this.activities =  this.leadInfo.activity_logs;
      //     this.leadName = this.leadInfo.name;
      //   },
      //   deep: true
      // }
    },
  };
</script>

<style scoped>

.boxCard {
  container-type: inline-size;
  /* border: none !important;
  box-shadow: none !important; */
}

.formErrors {
  color: red;
  font-size: 14px;
  padding-top: 4px;
}

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

.lead .boxCard {
  border: none !important;
  box-shadow: none !important;
}

.callerClass{
  display: flex;
  align-items: center;
  gap: 10px;
}

@container (max-width: 650px) {
  .callerClass {
    flex-direction: column;
  }
}

.see-more {
  color: #409eff; 
  font-weight: bold; 
  cursor: pointer;
}

.container{
  margin-bottom: 20px;
}

.bottomCard{
  position: fixed;
  bottom: 0;
  z-index: 10;
  width: -webkit-fill-available;
}

.block.lead .bottomCard{
  position: relative;
  /* top: 0; */
  width: -webkit-fill-available;
}

.docText{
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

.timeDiv{
  position: relative;
}

.timeDiv.timeDivMedia {
  grid-row: 1 !important;
}

.fileName{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 176px;
  gap: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  background-color: #e8edf2;
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

.iconUpload{
  position: relative;
  cursor: pointer;
  padding-top: 5px;
}

.cross {
  cursor: pointer;
}

.abbrTag{
  text-decoration: none;
}


.descriptionText{
  margin-top: 20px;
}

.describe .el-textarea__inner{
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
  border: solid 1px #ccc;
  background-color: #fff;
  font-size: 16px;
}

.lilText{
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

.dateAndTime{
  display: flex;
  align-items: center;
  gap: 10px;
}

.downloadIcon{
  height: 50%;
  cursor: pointer;
  margin-top: 10px;
}

.activityContent{
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activityContent.activityContentMedia{
  grid-row: 2;
  grid-column: 1 / -1;
}

.allFiles{
  display: flex;
  flex-basis: 75%;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 477px;
}

.docName{
  flex-basis: 65%;
  /* font-weight: 900; */
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

.wholeItem{
  display: grid;
  /* justify-content: space-between; */
  grid-template-columns: 15% 70% 15%;
  padding-bottom: 15px;
  cursor: pointer;
}

.wholeItem.wholeItemMedia{
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
}

.specificDoc{
  width: 195px;
  height: 45px;
  flex-grow: 0;
  align-items: center;
  margin: 0 8px 0 0;
  /* padding: 0 0 12px 12px; */
  padding-left: 12px;
  border-radius: 4px;
  display: flex;
  background-color: #e8edf2;
  justify-content: space-between;
}

.iconClass{
  position: absolute;
  top: 14px;
  left: 5px;
  color: #222;
}

.actionIcons{
  display: flex;
  flex-basis: 35%;
  height: -webkit-fill-available;
  justify-content: space-evenly;
}

.docs{
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-left: 15%;
}

.docs.docsMedia{
  padding-left: 0;
}

.uploadAndSave {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saveButton .el-button {
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
}

.saveButton .el-button span{
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #fff;
}

.allDocs{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-input-element {
  cursor: pointer;
  width: 20px;
  display: none;
}

.icon {
  display: inline-block;
  margin-right: 5px;
}



.outerBtn{
  padding: 20px 0px 0px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.dateBlock{
    width: 60px;
    height: 24px;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    /* margin: 0 0 133px; */
    padding: 4px 8px;
    border-radius: 4px;
    border: solid 1px #ccc;
    background-color: #fff;
    font-size: 11px;
    color: #409eff; 
}

.dateBlock.dateBlockMedia {
  grid-row: 1;
}

.activityName{
    /* width: 72px; */
    /* height: 21px; */
    flex-grow: 0;
    /* font-family: Switzer; */
    font-size: 16px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #222;
}

.activityDesc{
  white-space: pre-line;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #777;
  color: #777;
  font-size: 14px;
  padding-left: 15%;
  word-break: break-word;
  margin-bottom: 20px;
  cursor: pointer;
}

.activityDesc.activityDescMedia{
  padding-left: 0px;
}

.timeClass{
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #777;
    position: absolute;
    right: 0;
}
</style>

<style scoped>

.timeline-container {
  overflow-y: auto;
}

.lead .timeline-container {
  overflow-y: auto;
  height: max-content;
}

.block {
  /* height: 68vh; */
  /* height: 70%; */
}

.block.lead{
  display: flex;
  flex-direction: column-reverse;
  justify-content: start;
  height: -webkit-fill-available;
}

.block >>> .el-input{
    height: 40px !important;
    background-color: #e8edf2;
    width: 150px !important;
    max-width: none !important;
    border-radius: 4px;
}

.block .timePicker .el-input{
    height: 40px !important;
    background-color: #e8edf2;
    width: 87px !important;
    max-width: none !important;
    border-radius: 4px;
}


.block >>> .el-timeline-item__node {
  width: 23px;
  height: 23px;
}

.block >>> .el-timeline-item__wrapper {
  top: 0px !important;
  padding-left: 35px !important;

}

.block >>> .el-date-editor .el-input__inner{
    background-color: #e8edf2;
    padding-left: 8px;
    max-width: none !important;
    border-radius: 4px;
    font-size: 16px;
    padding-right: 0;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #222  ;
}

.block >>> .el-input__inner{
    background-color: #e8edf2;
    max-width: none !important;
    border-radius: 4px;
    font-size: 16px;
    padding-right: 0;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #222  ;
}

.block >>> .el-icon-date:before{
  color: #000;
  font-weight: 600;
}

.block >>> .el-date-editor .el-input__prefix {
  position: absolute;
  height: 100%;
  left: auto;
  top: 0;
  text-align: center;
  color: #C0C4CC;
  transition: all 0.3s;
  right: 2px;
}

.block >>> .el-icon-arrow-up:before {
  content: url('./assets/CaretDownFill.svg');
}

.block >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  position: relative;
  top: 1px;
  transform: rotate(0deg);
}

.block >>> .el-select .el-input .el-select__caret.is-reverse {
  position: relative;
  top: 0px;
  transform: rotate(180deg);
}

.block >>> .optionsDrop .el-input{
  width: 120px !important;
}

.block >>> .el-timeline{
  padding: 0 24px 0 24px;
}

.block >>> .el-timeline-item__tail{
  position: absolute;
  left: 9px;
  height: 100%;
  border-left: 2px solid #E4E7ED;
}

.block >>> .el-timeline-item {
  padding: 8px;
}


</style>