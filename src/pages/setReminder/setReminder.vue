<template>
  <div class="setRemminder">
    <globalDrawer
      :isOpen="showCreateDrawer"
      :title="createBoxHeading"
      :handleCloseDialog="closeCreateDrawer"
      :drawerSize="400"
    >
    <!-- <template #header>
      <div class="title">
        <h4 style="font-weight: bolder; padding: 0.75rem 0.5rem 20px">
          Set Reminder
        </h4>
        <span
          class="cross"
          @click="onClose()"
          style="font-weight: bolder; padding: 0.75rem 0.5rem 20px"
          >&#x2716;</span
        >
      </div>
    </template> -->
    <template #body>
      <div class="wholeBody">
        <div class="custom-date-picker">
          <label for="" class="dateLabel">Date Picker</label>
          <el-date-picker
              class="is-image-suffix"         
              v-model="pickedDate"
              :clearable="false"
              type="date"
              name="date"
              v-validate="'required'"
              :format="computedDateFormat"
              value-format="yyyy-MM-dd"
              :suffix-icon="iconSuffix"
              :picker-options="pickerOptions"
              placeholder="Select a day">
              <template #suffix>
                <img src="./../leadManagement/components/assets/event.png" alt="Icon" class="suffix-icon">
              </template>
            </el-date-picker>
            <p class="formErrors">
                <span>{{ errors.first('date') }}</span>
            </p>
          <!-- <img src="../../assets/img/calendar.svg" alt="Icon" class="suffix-icon"> -->
        </div>
          <div class="custom-date-picker">
            <label for="" class="dateLabel">Time Picker</label>
            <!-- <el-time-picker
              :clearable="false"
              v-model="pickedTime"
              v-validate="'required'"
              format="HH:mm"
              name="time"
              :suffix-icon="iconSuffix"
              value-format="HH:mm:ss"
              placeholder="Select a time">
            </el-time-picker> -->
            <input
              class="inputTime"
              type="time"
              v-validate="'required'"
              name="time"
              v-model="pickedTime"
              placeholder="Select a time"
            />
            <p class="formErrors">
                <span>{{ errors.first('time') }}</span>
            </p>
          </div>
      </div>
    </template>
    <template #pinned-footer>
      <div class="bottomCard">
        <el-card class="boxCard">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="Add your notes here"
            v-model="notes"
          ></el-input>
          <div class="outerBtn">
            <el-button
              type="primary"
              :disabled="errors.items.length > 0"
              class="submitBtn"
              @click="submitDetails()"
              >Save</el-button
            >
          </div>
        </el-card>
      </div>
    </template>
  </globalDrawer>
  </div>
</template>

<script>
import API from "@/services/api/";
import { mapActions, mapState } from "pinia";
import { useReminderStore } from "../../stores/reminder";
import "vue-date-pick/dist/vueDatePick.css";
import DatePicker from "./components/datePicker.vue";
import TimePicker from "./components/timePicker.vue";
import globalDrawer from '../commonComponents/allDrawer/globalDrawer.vue';

export default {
  name: "setReminder",
  props: {
    drawer: {
      default: true,
      type: Boolean,
    },
    lead: {
      default: -1,
    },
    showCreateDrawer:{
        default: true,
        type: Boolean,
    },
  },
  components: {
    DatePicker,
    TimePicker,
    globalDrawer
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        },
      },
      iconSuffix: "el-icon-date",
      pickedDate: "",
      pickedTime: "",
      createBoxHeading: "Set Reminder",
      date: "2019-01-01",
      time: "",
      dateAndTime: "",
      isAM: true,
      isTimePicker: false,
      notes: "",
      loadingStateButton: false,
    };
  },
  mounted(){
    this.myDateTimeSetter();
  },
  computed:{
    computedISOString() {
      const date = new Date(this.pickedDate);
      const timeParts = this.pickedTime.split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      // const seconds = parseInt(timeParts[2]);

      // Get the date components
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Months are zero-based, so we add 1
      const day = date.getDate();

      // Create a new Date object with the date and time components
      const isoDate = new Date(year, month - 1, day, hours, minutes).toISOString();

      return isoDate;
    },
    computedDateFormat(){
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const isUsUser=user.isUSFlagEnabled;
      return isUsUser ? "MM-dd-yyyy" : "dd-MM-yyyy";
    }
  },
  methods: {
    myDateTimeSetter(){
      if(this.lead.reminder_details){
          this.createBoxHeading = "Edit Reminder";
          this.notes = this.lead.reminder_details.notes;
          var currentDate = new Date(this.lead.reminder_details.reminder_sent_at);
          // Get the year, month, and day from the current date
          var year = currentDate.getFullYear();
          var month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with leading zeros if necessary
          var day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zeros if necessary
          var hours = String(currentDate.getHours()).padStart(2, '0'); // Pad with leading zeros if necessary
          var minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Pad with leading zeros if necessary
          var seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Pad with leading zeros if necessary

          // Concatenate the hours, minutes, and seconds with colons
          this.pickedTime = hours + ':' + minutes + ':' + seconds;

          // Concatenate the year, month, and day with hyphens
          this.pickedDate = year + '-' + month + '-' + day;
      } else {
          this.notes = "";
          this.createBoxHeading = "Set Reminder";
          var currentDate = null;
          this.pickedDate = null;
          this.pickedTime = null;
      }
    },
    onSave() {
      this.$emit("save", false);
    },
    closeCreateDrawer() {
      this.$emit('close')
    },
    onClose() {
      this.$emit("close", false);
    },
    async submitDetails() {
      const isValid = await this.$validator.validateAll();

      if(isValid){
        this.loadingStateButton = true;
      let response;
      try {
        const postData = {
          reminder_sent_at: this.computedISOString,
          notes: this.notes,
        };
        response = await API.LEADS.POST_REMINDER_INFO(this.lead.lead_details.id, postData);
        this.loadingStateButton = false;
        this.$message({
          showClose: true,
          message: 'Reminder has been set successfully.',
          type: "success",
          center: true
        })
        this.$emit('save',postData);
      } catch (e) {
        this.$message({
          showClose: true,
          message: e,
          type: "error",
          center: true,
        });
        this.loadingStateButton = false;
      }
      }
    },
    onTimeChange(val) {
      const dateTime = new Date(val);
      const hours = this.padZero(dateTime.getHours());
      const minutes = this.padZero(dateTime.getMinutes());
      const seconds = this.padZero(dateTime.getSeconds());
      const formattedTime = `${hours}:${minutes}:${seconds}`;
      this.time = formattedTime;
    },
    onDateChange(val) {
      let dateStr = val;
      let date = new Date(dateStr);
      let day = String(date.getDate()).padStart(2, "0");
      let month = String(date.getMonth() + 1).padStart(2, "0");
      let year = String(date.getFullYear()).slice(-2);
      const formattedDate = `${day}/${month}/${year}`;
      this.date = formattedDate;
    },
    onClose() {
      this.$emit("close", false);
    },
    isoString() {
      const [day, month, year] = this.pickedDate.split("-");
      const [hours, minutes, seconds] = this.pickedTime.split(":");
      // Create a new Date object using the provided values
      const date = new Date(
        `20${year}`,
        month - 1,
        day,
        hours,
        minutes,
        seconds
      );

      // Get the ISO 8601 representation of the date and time
      const isoString = date.toISOString();
      this.dateAndTime = isoString;
    },
    padZero(value) {
      return value.toString().padStart(2, "0");
    },
  },

  watch: {
    propsData(newVal, oldVal) {
      console.log(newVal);
    },
  },
};
</script>

<style lang="scss" scoped>
.setRemminder .el-drawer.rtl {
  min-width: 355px !important;
}


.bottomCard {
    position: fixed;
    bottom: 0;
    z-index: 10;
    width: -webkit-fill-available;
}

.px1 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.amPm {
  display: flex;
  padding-left: 0.5rem;
  align-items: center;
}

.addTimerText {
  cursor: pointer;
  align-items: center;
  padding: 0.5rem;
  display: flex;
}

.fullTimePicker {
  padding: 0.5rem;
}

.amTime,
.pmTime {
  cursor: pointer;
  margin-right: 0.5rem;
}

.wholeBody {
  margin: 1rem;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.custom-date-picker {
  position: relative;
  display: inline-block;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.custom-date-picker .suffix-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
}

.title {
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.inputTime{
  background-color: #e8edf2;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  color: #222;
  display: inline-block;
  font-weight: 500;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}



.dateLabel{
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

.formErrors {
  text-align: left;
  color: red;
  word-break: break-word;
  font-size: 14px;
}

.timeInput1,
.timeInput2 {
  width: auto !important;
  color: #4c5773;
  font-size: 1.12em;
  padding: 0.75rem 0.75rem;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: border 0.3s linear;
  height: 36px;
}

.bottomCard .el-textarea__inner{
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
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: rgb(119, 119, 119);
  border: 1px solid rgb(204, 204, 204);
  background-color: rgb(255, 255, 255);
}

.outerBtn {
  padding: 20px 0px 20px 20px;
  margin-bottom: 20px;
  align-items: flex-start;
}
.submitBtn {
  position: absolute;
  /* left: 75%; */
  right: 20px;
  width: 61px;
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


#birthday {
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
  box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.05);
  outline: 0;
  margin-bottom: 10px;
  font-weight: 900;
}

.datePicker {
  padding: 0.5rem;
}

.timePicker {
  align-items: center;
  padding: 0.5rem;
  display: flex;
}

.gapper {
  display: flex;
  width: -webkit-fill-available;
  justify-content: space-between;
}

.cross {
  cursor: pointer;
}

.selctedPeriod {
  color: #7172ad;
  font-weight: 900;
}
.innerTimePicker {
  width: 125px;
  display: grid;
  grid-template-columns: 40% 20% 40%;
}

.wholeBody .el-input {
  width: 100%;
}


</style>


<style scoped>
  
.wholeBody .el-date-picker__editor.is-image-suffix .el-input__suffix {
  background-image: url('../../assets/img/calendar.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.wholeBody  .el-input__icon{
  color: #000;;
}

.bottomCard .el-textarea__inner{
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
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: rgb(119, 119, 119);
  border: 1px solid rgb(204, 204, 204);
  background-color: rgb(255, 255, 255);
}

.setReminder .el-drawer__header {
  font-size: 16px !important;
}

</style>

<style>

.wholeBody .el-date-editor .el-input__prefix {
    position: absolute;
    height: 100%;
    left: inherit;
    top: 0;
    text-align: center;
    color: #222;
    transition: all 0.3s;
    right: 13px;
}

.wholeBody .el-input--prefix .el-input__inner ::placeholder{
  background-color: #e8edf2;
  width: 100% !important;
  font-weight: 600;
  max-width: none !important;
  padding-left: 15px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

.wholeBody .el-input--prefix .el-input__inner{
  background-color: #e8edf2;
  width: 100% !important;
  max-width: none !important;
  border-radius: 4px;
  padding-left: 15px;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color:#222;
}


</style>
