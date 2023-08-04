<template>
    <div
        id="timeController"
        class="block">
        <div
            style="margin-bottom: 300px"
        >
            <div
                class="center-space-between-alignment"
                style="padding: 10px 0 0 0; justify-content: space-between;">
                <div style=" justify-content: flex-start;">
                    <span style=" color: #eaeaea; font-size: 0.84vw">
                        Sun Path Simulation
                    </span>
                    <el-tooltip style=" font-size: 0.9vw; "
                        placement="top" popper-class="designStudioToolTip">
                    
                        <template #content>View the illumination approximating natural<br />sunlight for different dates time of the year. </template>
                        <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                    </el-tooltip>
                </div>
                <el-switch
                    v-model="sunSimulationEnabled"
                    :disabled="isSimRunning"
                    active-color="#3498db"
                    class="sappane-switch"
                    @change="toggleShadows"
                />
            </div>
            <div
                v-if="sunSimulationEnabled"
                id="hide"
                class="center-space-between-alignment"
                style="padding-top: 20px">
                <p
                    class="sappane-label"
                    style="padding-bottom: 0;">
                    Date
                </p>

                <dateInput
                    v-model="pickerDate"
                    :disabled="isSimRunning"
                    @change="onChangeDatePicker"
                />
            </div>

            <div
                v-if="sunSimulationEnabled"
                id="hide"
                class="wrapper">
                <vue-slider
                    ref="slider"
                    v-model="sliderDate"
                    v-bind="options"
                    v-if="!videoRecording"
                    :min="minDate"
                    :max="maxDate"
                    :formatter="convertDate"
                    :interval="timeDateSteps"
                    :piecewise-filter="
                        ({ index }) => (index % 30) * 24 * 60 * 60 * 1000 === 0
                    "
                    class="slider"
                    @change="log"
                    @drag-start="dragStartDate"
                    @drag="onDateDrag"
                >
                    <template
                        slot="label"
                        slot-scope="{ label, active, index }">
                        <span :class="['custom-label', { active }]">
                            {{ months[index].m }}
                        </span>
                    </template>
                </vue-slider>

                <button
                    :class="yearRunning ? 'button-dark-theme-icons el-icon-video-pause' : 'button-dark-theme-icons el-icon-video-play'"
                    style="font-size: 1.3vw;"
                    @click="simulateYear"
                />
            </div>

            <div
                v-if="sunSimulationEnabled"
                id="hide"
                class="center-space-between-alignment">
                <p
                    class="sappane-label"
                    style="padding-bottom: 0;">
                    Time
                </p>

                <timeInput
                    v-model="pickerTime"
                    :disabled="isSimRunning"
                    :zone-iana="localIana"
                    @change="onChangeTimePicker"
                />
            </div>

            <div
                v-if="sunSimulationEnabled"
                id="hide"
                class="wrapper">
                <vue-slider
                    ref="slider"
                    v-if="!videoRecording"
                    v-model="sliderTime"
                    v-bind="options"
                    :interval="timeSliderSteps"
                    :formatter="convertTime"
                    :max="maxSliderTime"
                    :min="minSliderTime"
                    :piecewise-filter="({ index }) => (index % 60) * 1000 === 0"
                    class="slider"
                    @change="log"
                    @drag-start="dragStartTime"
                    @drag="onTimeDrag"
                >
                    <template
                        slot="label"
                        slot-scope="{ label, active, index}">
                        <span
                            v-if="index % 3 === 0 && index < 24"
                            :class="['custom-label', { active }]"
                        >
                            {{ time[index].m }}
                        </span>
                    </template>
                </vue-slider>

                <button
                    :class="dayRunning ? 'button-dark-theme-icons el-icon-video-pause' : 'button-dark-theme-icons el-icon-video-play'"
                    style="font-size: 1.3vw;"
                    @click="simulateDay"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import vueSlider from 'vue-slider-component';
import dateInput from './dateInput.vue';
import timeInput from './timeInput.vue';
import STUDIO_STORE_MUTATION_TYPES from '../../../../../store/modules/studio/mutationTypes';

import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';
import { useStudioStore } from '../../../../../stores/studio';

export default {
    name: 'TimeController',
    components: {
        VuePerfectScrollbar,
        vueSlider,
        dateInput,
        timeInput,
    },
    props: ['tweenData', 'lidarMode'],
    data() {
        return {
            value: 0,
            videoRecording: false,
            options: {
                data: null,
                eventType: 'auto',
                width: '90%',
                height: 6,
                dotSize: 16,
                dotHeight: null,
                dotWidth: null,
                show: true,
                speed: 0.2,
                disabled: false,
                piecewise: false,
                useKeyboard: true,
                enableCross: true,
                piecewiseStyle: false,
                piecewiseLabel: true,
                tooltip: 'hover',
                tooltipDir: 'top',
                reverse: false,
                data: null,
                clickable: false,
                realTime: false,
                lazy: false,
                bgStyle: null,
                sliderStyle: null,
                processStyle: null,
                piecewiseActiveStyle: null,
                piecewiseStyle: null,
                tooltipStyle: null,
                labelStyle: null,
                labelActiveStyle: null,
            },
            v: 0,
            TweenActions: this.tweenData,

            transitionSpeed: 0.5,

            minSliderTime: 0 - this.getLocalTimeOffset(),
            maxSliderTime: (3600 * 24 * 1000) - this.getLocalTimeOffset(),
            timeSliderSteps: 60 * 1000,

            localIana: this.getLocalIana(),
            localTimeOffset: this.getLocalTimeOffset(),

            minDate: Date.UTC(new Date(Date.now()).getFullYear(), 0, 1),
            maxDate: Date.UTC(new Date(Date.now()).getFullYear(), 0, 1) +
                (365 * 24 * 60 * 60 * 1000),

            timeDateSteps: 24 * 60 * 60 * 1000,

            actualTime: 0,
            months: [
                { m: 'J' },
                { m: 'F' },
                { m: 'M' },
                { m: 'A' },
                { m: 'M' },
                { m: 'J' },
                { m: 'J' },
                { m: 'A' },
                { m: 'S' },
                { m: 'O' },
                { m: 'N' },
                { m: 'D' },
                { m: '' },
            ],
            time: [
                { m: '12' },
                { m: '' },
                { m: '' },
                { m: '3' },
                { m: '' },
                { m: '' },
                { m: '6' },
                { m: '' },
                { m: '' },
                { m: '9' },
                { m: '' },
                { m: '' },
                { m: '12' },
                { m: '' },
                { m: '' },
                { m: '3' },
                { m: '' },
                { m: '' },
                { m: '6' },
                { m: '' },
                { m: '' },
                { m: '9' },
                { m: '' },
                { m: '' },
            ],
        };
    },
    computed: {
        sunSimulationEnabled: {
            get() {
                return useStudioStore().sunSimulation.enabled;
            },
            set(sunSimulationEnabled) {
                useStudioStore().SET_SUN_SIMULATION_STATUS(sunSimulationEnabled)
            },
        },
        sliderTime: {
            get() {
                return useStudioStore().sunSimulation.sliderTime;
            },
            set(sliderTime) {
                useStudioStore().SET_SLIDER_TIME(sliderTime)
            },
        },
        pickerTime: {
            get() {
                return useStudioStore().sunSimulation.pickerTime;
            },
            set(pickerTime) {
                useStudioStore().SET_PICKER_TIME(pickerTime)
            },
        },
        sliderDate: {
            get() {
                return useStudioStore().sunSimulation.sliderDate;
            },
            set(sliderDate) {
                useStudioStore().SET_SLIDER_DATE(sliderDate)
            },
        },
        pickerDate: {
            get() {
                return useStudioStore().sunSimulation.pickerDate;
            },
            set(pickerDate) {
                useStudioStore().SET_PICKER_DATE(pickerDate)
            },
        },
        dayRunning: {
            get() {
                return useStudioStore().sunSimulation.dayRunning;
            },
            set(dayRunning) {
                useStudioStore().SET_DAY_RUNNING(dayRunning)
            },
        },
        yearRunning: {
            get() {
                return useStudioStore().sunSimulation.yearRunning;
            },
            set(yearRunning) {
                useStudioStore().SET_YEAR_RUNNING(yearRunning)
            },
        },
        timer: {
            get() {
                return useStudioStore().sunSimulation.timer;
            },
            set(timer) {
                useStudioStore().SET_TIMER(timer)
            },
        },
        isSimRunning() {
            return this.dayRunning || this.yearRunning;
        },
        isRunning() {
            if (this.isSimRunning) {
                return 'el-icon-loading';
            }
            return 'el-icon-caret-right';
        },
        yearIcon() {
            if (this.yearRunning) {
                return 'el-icon-loading';
            }
            return 'el-icon-caret-right';
        },
    },
    mounted() {
        this.actualTime =
            this.sliderTime +
            (parseInt(this.sliderDate / 24 / 60 / 60 / 1000, 10) *
                24 *
                60 *
                60 *
                1000);
        this.TweenActions.time = this.actualTime;
        if(!this.lidarMode){
            this.TweenActions.sun();
        }
    },
    methods: {
        log() {},
        getCurrentTime() {
            const d = new Date(Date.now());
            return d.getTime();
        },
        getLocalIana() {
            const zoneIANA = tzLookup(this.tweenData.latitude, this.tweenData.longitude);
            return zoneIANA;
        },
        getLocalTimeOffset() {
            const zoneIANA = this.getLocalIana();
            const time = DateTime.fromMillis(Date.now(), { zone: zoneIANA });
            const timeOffset = time.offset * 60 * 1000;
            return timeOffset;
        },
        dragStartTime() {
            this.TweenActions.startDrag();
            if (this.yearRunning) {
                this.endYear();
            }
            if (this.dayRunning) {
                this.endDay();
            }
        },
        convertTime() {
            const localTime = DateTime.fromMillis(this.sliderTime, { zone: this.localIana });
            return `${localTime.hour}:${localTime.minute}`;
        },
        onTimeDrag() {
            this.pickerTime = this.sliderTime;
            this.actualTime = this.sliderTime + this.sliderDate;
            this.setSunPos();
        },
        onChangeTimePicker() {
            this.sliderTime = Number(this.pickerTime);
            this.actualTime = this.sliderTime + this.sliderDate;
            this.setSunPos();
        },
        convertPickerTime() {
            const d = new Date(this.pickerTime);
            return d.toLocaleTimeString();
        },
        simulateDay() {
            if (this.dayRunning) {
                this.endDay();
            }
            else {
                this.startDay();
            }
        },
        startDay() {
            if (this.yearRunning) {
                this.endYear();
            }
            this.dayRunning = true;
            this.TweenActions.startDay();
            this.transitionSpeed = 0;
            this.timer = setInterval(this.setSimDay.bind(this), 100);
        },
        endDay() {
            this.TweenActions.endDay();
            this.dayRunning = false;
            clearInterval(this.timer);
            this.transitionSpeed = 0.5;
        },

        convertDate() {
            const d = new Date(this.sliderDate);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        },
        onDateDrag() {
            this.pickerDate = this.sliderDate;
            this.actualTime = this.sliderTime + this.sliderDate;
            this.setSunPos();
        },
        dragStartDate() {
            clearInterval(this.timer);
            this.TweenActions.startDrag();
            if (this.yearRunning) {
                this.endYear();
            }
            if (this.dayRunning) {
                this.endDay();
            }
        },
        onChangeDatePicker() {
            clearInterval(this.timer);
            this.sliderDate = Number(this.pickerDate);
            this.actualTime = this.sliderTime + this.sliderDate;
            this.setSunPos();
        },
        simulateYear() {
            if (this.yearRunning) {
                this.endYear();
            }
            else {
                this.startYear();
            }
        },

        startYear() {
            if (this.dayRunning) {
                this.endDay();
            }
            this.yearRunning = true;
            this.TweenActions.startYear();
            this.transitionSpeed = 0;
            this.timer = setInterval(this.setSimYear.bind(this), 100);
        },
        endYear() {
            this.yearRunning = false;
            this.TweenActions.endYear();
            clearInterval(this.timer);
            this.transitionSpeed = 0.5;
        },
        setSunPos() {
            this.TweenActions.time = this.actualTime;
            this.TweenActions.sun();
        },
        toggleShadows() {
            this.TweenActions.toggleShadows();
            // make the scroll position at the bottom when overflow (no need to reset for now)
            this.$nextTick(() => {
                document.getElementById('inverterSimulationWrapper').scrollTop = 10000;
            });
        },

        setSimDay() {
            this.actualTime = this.TweenActions.time;
            let timeForSlider =
                this.actualTime -
                ((parseInt(this.actualTime / 24 / 60 / 60 / 1000, 10) *
                    24 *
                    60 *
                    60 *
                    1000));
            if (timeForSlider > this.maxSliderTime) {
                timeForSlider -= (24 * 60 * 60 * 1000);
            }
            if (timeForSlider < this.minSliderTime) {
                timeForSlider += (24 * 60 * 60 * 1000);
            }
            this.sliderTime = timeForSlider;
            this.pickerTime = this.sliderTime;
        },
        setSimYear() {
            this.actualTime = this.TweenActions.time;
            this.sliderDate =
                (parseInt(this.actualTime / 24 / 60 / 60 / 1000, 10) *
                24 *
                60 *
                60 *
                1000);
            this.pickerDate = this.sliderDate;
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../../../../styles/components/input';
@import '../../../../../styles/components/button';
@import '../../../../../styles/components/utils';
</style>

<style type="text/css" scoped>


#timeController>>> .vue-slider-piecewise-label{
    display: none !important;
}

.custom-label {
    position: absolute;
    bottom: 100%;
    left: 0;
    transform: translate(-50%, +24px);
    margin-left: 3px;
    color: white;
    text-align: left;
    font-size: 0.7vw;
    line-height: 10px;
    color: #909399;
    font-family: 'Helvetica';
}
  .el-switch{
    width: 40px;
    float: right;
  }

.wrapper {
    width: 100%;
    height: 40px;
    margin: 10px 0px 20px 0px;
  }

.slider {
    float: left;
    padding: 5px 5px 0px 5px;
    box-sizing: border-box;
}
.designStudioToolTip{
    font-size: 14px;
}
</style>

