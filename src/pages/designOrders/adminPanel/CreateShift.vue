<template>
  <div>
    <div class="body">
      <el-form :label-position="labelPos">
        <el-form-item label="Name">
          <el-input
            id="name"
            v-model="nameInput"
            placeholder="Enter shift name"
          ></el-input>
        </el-form-item>
        <p v-if="Object.keys(errors).length !== 0">{{ errors.shiftName }}</p>
        <el-form-item label="Start time">
          <el-time-select
            id="start-time"
            placeholder="Select start time"
            v-model="startTime"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:45',
            }"
          >
          </el-time-select>
        </el-form-item>
        <p v-if="Object.keys(errors).length !== 0">{{ errors.startTime }}</p>
        <el-form-item label="Duration">
          <!-- <label for="end-time">Duration </label> -->
          <el-time-select
            id="end-time"
            placeholder="Enter shift duration"
            v-model="duration"
            :picker-options="{
              start: '01:00',
              step: '00:15',
              end: '14:00',
              //minTime: startTime,
            }"
          >
          </el-time-select>
        </el-form-item>

        <p v-if="Object.keys(errors).length !== 0">{{ errors.duration }}</p>
        <el-form-item label="Shift days">
          <el-checkbox-group v-model="selectedDays">
            <el-checkbox
              v-for="item in options"
              :key="item.value"
              :label="item.label"
            ></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <p v-if="Object.keys(errors).length !== 0">{{ errors.daysPicker }}</p>
      <el-button
        type="primary"
        @click="createShiftData"
        :disabled="disableCreateShift()"
        >Create</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "CreateShift",
  props: {
    createShift: {
      required: true,
      type: Function,
    },
  },
  data() {
    return {
      labelPos: "top",
      nameInput: "",
      options: [
        {
          value: "mon",
          label: "Monday",
        },
        {
          value: "tue",
          label: "Tuesday",
        },
        {
          value: "wed",
          label: "Wednesday",
        },
        {
          value: "thur",
          label: "Thursday",
        },
        {
          value: "fri",
          label: "Friday",
        },
        {
          value: "sat",
          label: "Saturday",
        },
        {
          value: "sun",
          label: "Sunday",
        },
      ],
      selectedDays: [],
      startTime: "",
      duration: "",
      timeDifference: "",
      errors: {},
    };
  },
  methods: {
    resetForm() {
      this.nameInput = "";
      this.selectedDays = [];
      this.startTime = "";
      this.duration = "";
      this.timeDifference = "";

      // Reset the errors related to form fields individually
      delete this.errors.shiftName;
      delete this.errors.daysPicker;
      delete this.errors.startTime;
      delete this.errors.duration;
    },
    createShiftData() {
      //Assemble shiftObject
      let shift = {
        name: this.nameInput,
        from_time: this.startTime,
        duration: this.duration,
        days_of_week: this.convertWeekdaysToAbbreviatedForm(this.selectedDays),
      };
      //make HTTP post call
      console.log(shift);
      //this.resetForm();
      this.$props.createShift(shift);
    },
    convertWeekdaysToAbbreviatedForm(weekdays) {
      const abbreviatedWeekdays = {
        Monday: "mon",
        Tuesday: "tue",
        Wednesday: "wed",
        Thursday: "thur",
        Friday: "fri",
        Saturday: "sat",
        Sunday: "sun",
      };

      return weekdays.map((weekday) => abbreviatedWeekdays[weekday]);
    },
    calculateTimeDifference() {
      if (this.startTime && this.duration) {
        const start = new Date(`1970-01-01 ${this.startTime}`);
        const end = new Date(`1970-01-01 ${this.duration}`);
        const diff = end.getTime() - start.getTime();
        const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
        const minutes = Math.abs(
          Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        );
        this.timeDifference = `${hours} hours ${minutes} minutes`;
      } else {
        this.timeDifference = "";
      }
      console.log(this.timeDifference);
      //Add check for 1 and 14 hrs
      // if (this.isTimeDifferenceExceeded()) {
      //   this.errors.duration = "A shift cannot exceed 14 hours.";
      //   console.log("Time Error 14");
      // } else if (this.isNotMinimumShiftLength()) {
      //   this.errors.duration = "A shift has to be at least an hour long.";
      //   console.log("Time Error 1");
      // } else {
      //   delete this.errors["duration"];
      //   console.log("no duration error");
      // }
    },
    isTimeDifferenceExceeded() {
      if (this.timeDifference) {
        const hours = parseInt(this.timeDifference.split(" ")[0]);
        console.log(hours);
        return hours >= 14;
      }
      return false;
    },
    isNotMinimumShiftLength() {
      if (this.timeDifference) {
        const hours = parseInt(this.timeDifference.split(" ")[0]);
        console.log(hours);
        return hours < 1;
      }
      return false;
    },
    errorsPresent() {
      // console.log(this.errors.daysPicker);
      // console.log(this.errors.startTime);
      // console.log(this.errors.duration);
      // console.log(this.errors.shiftName);
      if (
        this.errors.daysPicker ||
        this.errors.startTime ||
        this.errors.duration ||
        this.errors.shiftName
      )
        return true;
      else return false;
    },
    fieldsAreBlank() {
      // console.log(this.nameInput);
      // console.log(this.startTime);
      // console.log(this.duration);
      // console.log(this.isValidSelection);
      if (
        !this.nameInput ||
        !this.startTime ||
        !this.duration ||
        !this.isValidSelection
      )
        return true;
      else return false;
    },
    disableCreateShift() {
      //disable if there are any errors or if any of the fields are blank
      if (this.errorsPresent() || this.fieldsAreBlank()) {
        console.log("disabling");
        return true;
      } else {
        console.log("enabling");
        return false;
      }
    },
  },
  computed: {
    isValidSelection() {
      return this.selectedDays.length >= 2;
    },
  },
  watch: {
    selectedDays: {
      handler() {
        if ((this.errors.daysPicker = this.isValidSelection)) {
          delete this.errors["daysPicker"];
        } else this.errors.daysPicker = "Please select at least two days.";
      },
      deep: true,
    },
    startTime: {
      handler() {
        if (!this.startTime)
          this.errors.startTime = "Please select a start time.";
        else {
          //start time exists
          delete this.errors["startTime"];
          this.calculateTimeDifference();
          // timeDifference field has value
          //check for 14 hours and 1 hour
          // if (this.isTimeDifferenceExceeded()) {
          //   this.errors.duration = "A shift cannot exceed 14 hours.";
          //   console.log("Time Error 14");
          // } else if (this.isNotMinimumShiftLength()) {
          //   this.errors.duration = "A shift has to be at least an hour long.";
          //   console.log("Time Error 1");
          // } else delete this.errors["duration"];
        }
      },
    },
    duration: {
      handler() {
        if (!this.duration)
          this.errors.duration = "Please select a value for duration.";
        else {
          //duration exists
          delete this.errors["duration"];
          this.calculateTimeDifference();
          // timeDifference field has value
          //check for 14 hours and 1 hour
          // if (this.isTimeDifferenceExceeded()) {
          //   this.errors.duration = "A shift cannot exceed 14 hours.";
          //   console.log(this.errors.duration);
          //   console.log("Time Error 14");
          // } else if (this.isNotMinimumShiftLength()) {
          //   this.errors.duration = "A shift has to be at least an hour long.";
          //   console.log("Time Error 1");
          // } else delete this.errors["duration"];
        }
      },
    },
    nameInput: {
      handler() {
        if (!this.nameInput)
          this.errors.shiftName = "Please enter a name for the shift.";
        else delete this.errors["shiftName"];
      },
    },
  },
};
</script>

<style scoped>
.body {
  margin: 30px;
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.el-form-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
}
.el-form-item::v-deep .el-form-item__label {
  text-align: left;
  padding-left: 0;
  font-size: 0.875rem;
  line-height: 28px;
  color: #777777;
}
.el-form-item::v-deep .el-input {
  width: 100%;
  /*#e8edf2*/
}

.el-form-item::v-deep .el-input__inner {
  background-color: #e8edf2;
}

.el-form-item::v-deep .el-input__inner::placeholder {
  /*color: red;*/
  color: #777777;
}
.el-form-item::v-deep .el-select {
  width: 100%;
}

.el-form-item::v-deep .el-checkbox-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  border: #cccccc 1px solid;
  border-radius: 8px;
  padding: 16px;
  height: 250px;
  justify-content: space-between;
}

.el-form-item::v-deep .el-checkbox {
  display: flex;
  flex-flow: row-reverse;
  justify-content: space-between;
  align-content: space-between;
  margin-right: 0;
}

.el-form-item::v-deep .el-checkbox__label {
  color: #222222;
}
.el-form-item::v-deep .el-checkbox__inner {
  border: 1px solid #777777;
}

.el-form-item::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #222222;
}

.body::v-deep .el-button--primary {
  width: 150px;
  align-self: flex-end;
}
</style>
