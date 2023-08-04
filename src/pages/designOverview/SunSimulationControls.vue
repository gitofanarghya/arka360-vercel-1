<template>
    <div class="sun-simulation-controls-container">
        <span class="sun-simulation-contorls-slider-label">Date</span>
        <el-slider
            v-model="dayMillisecond"
            :min="currentYearStartMillisecond"
            :max="currentYearEndMillisecond"
            :step="millisecondsInOneDay"
            :format-tooltip="getDayFromMillisecond"
            :marks="getDaySliderMarks()"
            :show-tooltip="isMenubarOpenCopy"
            class="sun-simutation-slider"
            @change="eventListener1()"
            @input="updateSun"/>
        <span class="sun-simulation-contorls-slider-label">Time</span>
        <el-slider
            v-model="timeMillisecond"
            :min="dayStartMillisecond"
            :max="dayEndtMillisecond"
            :step="millisecondsInOneMinute"
            :show-tooltip="isMenubarOpenCopy"
            :format-tooltip="getTimeFromMillisecond"
            :marks="getTimeSliderMarks()"
            class="sun-simutation-slider"
            @change="eventListener1()"
            @input="updateSun"/>
    </div>
</template>

<script>
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';
import { serverBus } from '../../main';

const currentYear = new Date().getFullYear();

export default {
    name: 'SunSimulationControls',
    props: {
        updateSunPosition: {
            type: Function,
            default: () => {},
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        isMenubarOpen: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            dayMillisecond: new Date(currentYear, 5, 21).getTime(), // summer solstice
            timeMillisecond: 43200000, // 12 pm
            isMenubarOpenCopy: null,
        };
    },
    nonReactiveData() {
        return {
            currentYearStartMillisecond: new Date(currentYear, 0, 1).getTime(),
            currentYearEndMillisecond: new Date(currentYear, 11, 31).getTime(),
            millisecondsInOneDay: 3600 * 1000 * 24,
            dayStartMillisecond: 0,
            dayEndtMillisecond: 3600 * 1000 * 24,
            millisecondsInOneMinute: 60 * 1000,
            dateObject: new Date(),
        };
    },
    computed: {
        locationTimeOffset() {
            return DateTime.fromMillis(
                Date.now(),
                { zone: tzLookup(this.latitude, this.longitude) },
            ).offset * (60 * 1000);
        },
        userTimeOffset() {
            return this.dateObject.getTimezoneOffset() * (60 * 1000);
        },
    },
    mounted() {
        this.updateSun();
        serverBus.$on('timeChange', (dayMillisecond, timeMillisecond) =>{
            this.timeMillisecond = timeMillisecond;
            this.dayMillisecond = dayMillisecond;
            this.updateSun();
        });
        this.isMenubarOpenCopy = this.isMenubarOpen;

    },
    methods: {
        eventListener1(){
           this.isMenubarOpenCopy = false;
        },
        updateSun() {
            this.updateSunPosition((this.dayMillisecond + this.timeMillisecond) -
                this.locationTimeOffset -
                this.userTimeOffset);
            this.isMenubarOpenCopy = true;
        },
        getDaySliderMarks() {
            const marksObject = {};
            for (let i = 0; i < 12; i += 1) {
                const monthStartDate = new Date(currentYear, i, 1);
                marksObject[monthStartDate.getTime()] =
                    monthStartDate.toLocaleString('default', { month: 'long' }).charAt(0);
            }
            return marksObject;
        },
        getTimeSliderMarks() {
            return {
                0: '12',
                10800000: '3',
                21600000: '6',
                32400000: '9',
                43200000: '12',
                54000000: '3',
                64800000: '6',
                75600000: '9',
                86400000: '12',
            };
        },
        getDayFromMillisecond() {
            this.dateObject.setTime(this.dayMillisecond + this.timeMillisecond);
            return this.dateObject.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
        },
        getTimeFromMillisecond() {
            this.dateObject.setTime(this.dayMillisecond + this.timeMillisecond);
            return this.dateObject.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        },
    },
    beforeDestroy() {
        serverBus.$off('timechange');
    },
};
</script>

<style scoped>
    .sun-simulation-controls-container {
        padding: 0px
    }
    .sun-simutation-slider {
        padding: 10px 0px 20px 0px
    }
    .sun-simulation-contorls-slider-label {
        font-size: 12px;
        color: rgb(0, 84, 130);
        position: relative;
        float: right;
    }
</style>
