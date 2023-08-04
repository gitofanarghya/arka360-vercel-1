<template>
  <div class="reminderCard">
    <el-form
      :label-position="'top'"
      label-width="100px"
      :model="reminderDetails"
    >
      <el-form-item label="Date picker">
        <el-date-picker
          v-model="reminderDetails.date"
          type="date"
          placeholder="Pick a day"
          prefix-icon="''"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Time picker">
        <el-time-select
          v-model="reminderDetails.time"
          :picker-options="{
            start: '00:00',
            end: '23:59',
          }"
          placeholder="Pick a time"
        >
        </el-time-select>
      </el-form-item>
      <el-form-item label="Notes">
        <el-input v-model="reminderDetails.notes"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="createReminder">Save</el-button>
  </div>
</template>

<script>
export default {
  props: {
    reminderInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      reminderDetails: null,
    };
  },
  created() {
    this.reminderDetails = { ...this.reminderInfo };
  },
  methods: {
    createReminder() {
      console.log(this.convertToUTC());
    },
    convertToUTC() {
      if (this.reminderDetails.date && this.reminderDetails.time) {
        const timeParts = this.reminderDetails.time.split(":");
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);

        const dateTime = new Date(
          this.reminderDetails.date.getFullYear(),
          this.reminderDetails.date.getMonth(),
          this.reminderDetails.date.getDate(),
          hours,
          minutes,
          0
        );
        const utcDateTime = dateTime.toUTCString();
        return utcDateTime;
      }
    },
  },
};
</script>

<style scoped>
.reminderCard {
  margin: 10px;
}
</style>
