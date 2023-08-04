<template>
    <div class="setRemminder">
        <slot name="header">
          <div class="title">
            <h4 style="font-weight: bolder; padding: 0.75rem 0.5rem 20px;">Set Reminder</h4>
            <span class="cross" @click="onClose()" style="font-weight: bolder; padding: 0.75rem 0.5rem 20px;">&#x2716;</span>
          </div>
        </slot>
        <slot name="body">
          <div class="wholeBody">
              <datePicker :date="date"/>
              <timePicker :isTimePicker="isTimePicker" :isAM="isAM"/>
          </div>
        </slot>
        <slot name="footer">
          <!-- <div class="bottomCard">
              <el-card class="boxCard">
                  <el-input type="textarea" :rows="4" placeholder="Add your notes here" ></el-input>
                  <div class="outerBtn">
                      <el-button type="primary" class="submitBtn" @click="onSave">Save</el-button>
                  </div>
              </el-card>
          </div> -->
          <textAndSaveFooter @save="onSave()"></textAndSaveFooter>
        </slot>
    </div>
</template>

<script>

import DatePick from './../../../node_modules/vue-date-pick/src/vueDatePick.vue';
import 'vue-date-pick/dist/vueDatePick.css';
import datePicker from './components/datePicker.vue'
import timePicker from './components/timePicker.vue'
import textAndSaveFooter from '../commonComponents/allFooters/textAndSaveFooter.vue';
import AllDrawer from '../commonComponents/allDrawer/allDrawer.vue';

export default {
  name: "setReminder",
  props: {
    drawer:{
        default: true,
        type: Boolean,
    }
  },
  components:{
    DatePick,
    datePicker,
    timePicker,
    textAndSaveFooter,
    AllDrawer
  },
  data() {
    return {
        date: '2019-01-01',
        isAM: true,
        isTimePicker: false,
    };
  },

  methods: {
    onSave(){
        this.$emit('save', false);
    },
    onClose(){
      this.$emit('close', false);
    }
  },
};

</script>

<style lang="scss" scoped>

.setRemminder .el-drawer.rtl{
    min-width: 355px !important;
}

.bottomCard{
    position: absolute;
    bottom: 0px;
    width: -webkit-fill-available;
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

.fullTimePicker{
    padding: 0.5rem;
}

.amTime, .pmTime {
  cursor: pointer;
  margin-right: 0.5rem;

}

.wholeBody{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.title{
  margin-left: 1rem;
  margin-right: 1rem;
  min-width: 300px;
  display: flex;
  display: flex;
  justify-content: space-between;
  gap: 15px;
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
    padding: 0.5rem;
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

</style>