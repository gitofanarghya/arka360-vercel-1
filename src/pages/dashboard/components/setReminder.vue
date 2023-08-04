<template>
  <div class="setRemminder">
    <el-drawer
      title="I am the title"
      :visible.sync="drawer"
      :with-header="false"
    >
      <div class="wholeBody">
        <h1 style="font-weight: bolder; padding: 0.75rem 0.5rem 20px">
          Set Reminder
        </h1>
        <div class="datePicker">
          <input type="date" id="birthday" name="birthday" v-model="date" />
          <date-pick v-model="date" :hasInputElement="false"></date-pick>
        </div>
        <div class="fullTimePicker">
          <div
            v-if="!isTimePicker"
            @click="isTimePicker = true"
            class="addTimerText"
          >
            <div>
              <i class="fas fa-clock" style="padding-right: 10px"></i>
              <span>Add a time</span>
            </div>
          </div>
          <div class="timePicker" v-else>
            <div class="innerTimePicker">
              <input type="text" class="timeInput1" />
              <span class="px1">:</span>
              <input type="text" class="timeInput2" />
            </div>
            <div class="gapper">
              <div class="flex align-center pl1 amPm">
                <span
                  class="text-purple-hover mr1 cursor-pointer amTime"
                  :class="isAM ? 'selctedPeriod' : ''"
                  @click="isAM = true"
                  >AM</span
                >
                <span
                  class="text-purple-hover mr1 text-purple text-heavy pmTime"
                  :class="!isAM ? 'selctedPeriod' : ''"
                  @click="isAM = false"
                  >PM</span
                >
              </div>
              <span class="cross" @click="isTimePicker = false">&#x2716;</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bottomCard">
        <el-card class="boxCard">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="Add your notes here"
          ></el-input>
          <div class="outerBtn">
            <el-button type="primary" class="submitBtn">Submit</el-button>
          </div>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import DatePick from "./../../../../node_modules/vue-date-pick/src/vueDatePick.vue";
import "vue-date-pick/dist/vueDatePick.css";

export default {
  name: "setReminder",
  props: {
    drawer: {
      default: true,
      type: Boolean,
    },
  },
  components: {
    DatePick,
  },
  data() {
    return {
      date: "2019-01-01",
      isAM: true,
      isTimePicker: false,
    };
  },

  methods: {},
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
