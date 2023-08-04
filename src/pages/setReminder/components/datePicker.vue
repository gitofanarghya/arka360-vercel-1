<template>
  <div class="datePicker forLabel">
    <!-- <input type="date" id="birthday" name="birthday" v-model="date">
        <date-pick v-model="date" :hasInputElement="false"></date-pick> -->
    <label for="" class="labelClass" v-if="label">Date Picker</label>
    <el-date-picker
      v-model="pickedDate"
      type="date"
      @change="onChange"
      :picker-options="pickerOptions"
      placeholder="Select Date"
    >
    </el-date-picker>
  </div>
</template>

<script>
import DatePick from "./../../../../node_modules/vue-date-pick/src/vueDatePick.vue";
import "vue-date-pick/dist/vueDatePick.css";

export default {
  name: "setReminder",
  props: {
    date: {
      default: true,
      type: String,
    },
    label: {
      default: true,
      type: Boolean,
    },
    disabledPrev: {
      default: false,
      type: Boolean,
    },
  },
  components: {
    DatePick,
  },
  data() {
    return {
      pickedDate: null,
      //pickerOptions: {}
    };
  },

  computed: {
    pickerOptions() {
      if (this.disabledPrev) {
        return {
          disabledDate: (date) =>
            date.getTime() < new Date().setHours(0, 0, 0, 0),
        };
      } else {
        return {};
      }
    },
  },

  methods: {
    onChange() {
      console.log(this.pickedDate);
      this.$emit("dateChanged", this.pickedDate);
    },
  },
};
</script>

<style lang="scss" scoped>
.setRemminder .el-drawer.rtl {
  min-width: 355px !important;
}

.bottomCard {
  position: absolute;
  bottom: 0px;
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
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
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

.outerBtn {
  padding: 20px 0px 20px 20px;
  margin-bottom: 20px;
}

.submitBtn {
  position: absolute;
  /* left: 75%; */
  right: 20px;
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

.forLabel {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.labelClass {
  font-size: 12px;
  color: #777;
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
</style>

<style scoped>
.datePicker >>> .el-input {
  width: 100%;
}

.datePicker >>> .el-input__inner {
  height: 45px !important;
  background-color: #e8edf2;
  width: 100% !important;
  max-width: none !important;
  border-radius: 4px;
}
</style>
