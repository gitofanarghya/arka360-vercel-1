<template>
  <div>
    <div class="body">
      <el-form :label-position="labelPos">
        <el-form-item label="Name">
          <el-input
            id="name"
            v-model="shift.nameInput"
            :readonly="false"
          ></el-input>
        </el-form-item>
        <p v-if="Object.keys(errors).length !== 0">{{ errors.shiftName }}</p>
        <el-form-item label="Start time">
          <el-time-select
            id="start-time"
            placeholder="Select start time"
            v-model="shift.startTime"
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
          <el-time-select
            id="end-time"
            placeholder="Enter shift duration"
            v-model="shift.duration"
            :picker-options="{
              start: '01:00',
              step: '00:15',
              end: '14:00',
              //minTime: startTime,
            }"
          >
          </el-time-select>
        </el-form-item>
        <p v-if="Object.keys(errors).length !== 0">{{ errors.timePicker }}</p>
        <el-form-item label="Shift days">
          <!-- <el-select
            v-model="shift.selectedDays"
            id="daysOfWeek"
            multiple
            placeholder=""
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select> -->
          <el-checkbox-group v-model="shift.selectedDays">
            <el-checkbox
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              >{{ item.label }}</el-checkbox
            >
            <!-- <el-checkbox label="Option A">opt a</el-checkbox>
            <el-checkbox label="Option B">opt b</el-checkbox> -->
          </el-checkbox-group>
        </el-form-item>

        <p v-if="Object.keys(errors).length !== 0">{{ errors.daysPicker }}</p>
      </el-form>

      <el-button
        type="primary"
        @click="editShiftData"
        :disabled="disableEditShift()"
        >Update</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "EditShift",
  props: {
    editShift: {
      required: true,
      type: Function,
    },
    shiftObj: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      labelPos: "top",
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
      timeDifference: "",
      errors: {},
      shift: {
        nameInput: "",
        startTime: "",
        duration: "",
        selectedDays: [],
        id: "",
      },
      selectedDays: [],
    };
  },
  created() {
    console.log("created ran");
    this.setEditItem(this.$props.shiftObj);
  },
  //   updated() {
  //     console.log("updated ran");
  //     this.setEditItem();
  //   },

  methods: {
    setEditItem(newShiftOb) {
      if (newShiftOb && newShiftOb.scope && newShiftOb.scope.row) {
        console.log(newShiftOb);
        let shiftBeforeEdit = newShiftOb.scope.row;
        this.shift.id = shiftBeforeEdit.id;
        this.shift.nameInput = shiftBeforeEdit.name;
        this.shift.startTime = shiftBeforeEdit.from_time;
        this.shift.duration = shiftBeforeEdit.duration;

        //convert properties into an array like ["Monday","Tuesday"] from ["mon", "tue"]
        this.shift.selectedDays = this.convertAbbreviatedWeekdaysToFullForm(
          this.convertPropertiesToDaysArray(shiftBeforeEdit)
        );
        console.log(this.shift.selectedDays);
      }
    },
    editShiftData() {
      //Assemble shiftObject
      let shift = {
        id: this.shift.id,
        name: this.shift.nameInput,
        from_time: this.shift.startTime,
        duration: this.shift.duration,
        days_of_week: this.convertFullWeekdaysToAbbreviatedForm(
          this.shift.selectedDays
        ),
      };
      //make HTTP post call
      console.log(shift);
      this.$props.editShift(shift);
    },
    calculateTimeDifference() {
      if (this.shift.startTime && this.shift.duration) {
        const start = new Date(`1970-01-01 ${this.shift.startTime}`);
        const end = new Date(`1970-01-01 ${this.shift.duration}`);
        const diff = end.getTime() - start.getTime();

        // Calculate the hours and minutes difference
        //const hours = Math.floor(diff / (1000 * 60 * 60));
        //const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
        const minutes = Math.abs(
          Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        );
        this.timeDifference = `${hours} hours ${minutes} minutes`;
      } else {
        this.timeDifference = "";
      }
      console.log(this.timeDifference);
      //Add check for 4 and 14 hrs
      // if (this.isTimeDifferenceExceeded()) {
      //   this.errors.timePicker = "Time difference exceeds 14 hours.";
      //   console.log("Time Error");
      // } else {
      //   delete this.errors["timePicker"];
      //   console.log(this.errors.timePicker);
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
    convertFullWeekdaysToAbbreviatedForm(fullWeekdays) {
      const abbreviatedWeekdays = {
        Monday: "mon",
        Tuesday: "tue",
        Wednesday: "wed",
        Thursday: "thur",
        Friday: "fri",
        Saturday: "sat",
        Sunday: "sun",
      };

      return fullWeekdays.map(
        (fullWeekday) => abbreviatedWeekdays[fullWeekday]
      );
    },
    convertPropertiesToDaysArray(shift) {
      const tickMark = "\u2713";
      const daysOfWeek = Object.keys(shift).filter(
        (key) => shift[key] === tickMark
      );
      // return { ...shift, days_of_week: daysOfWeek }
      return daysOfWeek;
    },
    convertAbbreviatedWeekdaysToFullForm(abbreviatedWeekdays) {
      const fullWeekdays = {
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thur: "Thursday",
        fri: "Friday",
        sat: "Saturday",
        sun: "Sunday",
      };

      return abbreviatedWeekdays.map(
        (abbreviatedWeekday) => fullWeekdays[abbreviatedWeekday]
      );
    },
    errorsPresent() {
      console.log(this.errors.daysPicker);
      console.log(this.errors.startTime);
      console.log(this.errors.duration);
      console.log(this.errors.shiftName);
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
      // console.log(this.shift.nameInput);
      // console.log(this.shift.startTime);
      // console.log(this.shift.duration);
      // console.log(this.isValidSelection);
      if (
        !this.shift.nameInput ||
        !this.shift.startTime ||
        !this.shift.duration ||
        !this.isValidSelection
      )
        return true;
      else return false;
    },
    disableEditShift() {
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
      return this.shift.selectedDays.length >= 2;
    },
  },
  watch: {
    "shift.selectedDays": {
      handler() {
        if (this.isValidSelection) {
          delete this.errors["daysPicker"];
        } else this.errors.daysPicker = "Please select at least two days.";
      },
      deep: true,
    },
    "shift.startTime": {
      handler() {
        if (!this.shift.startTime) {
          this.errors.startTime = "Please select a start time.";
          console.log(this.errors);
        } else {
          //start time exists
          delete this.errors["startTime"];
          this.calculateTimeDifference();
        }
      },
      deep: true,
    },
    "shift.duration": {
      handler() {
        if (!this.shift.duration)
          this.errors.duration = "Please select a value for duration.";
        else {
          //duration exists
          delete this.errors["duration"];
          this.calculateTimeDifference();
        }
      },
      deep: true,
    },
    "shift.nameInput": {
      handler() {
        if (!this.shift.nameInput) {
          this.errors.shiftName = "Please enter a name for the shift.";
          console.log(this.errors);
        } else delete this.errors["shiftName"];
      },
      deep: true,
    },
    shiftObj: function (newVal, oldVal) {
      console.log("ran");
      if (newVal) this.setEditItem(newVal);
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
