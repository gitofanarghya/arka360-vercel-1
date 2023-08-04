<template>
    <div
        v-show="solarAccessVisible"
        id="bottomBar">
        <div
            class="colorBarWrapper"
            style="border: 2px solid black; box-sizing: border-box;">
            <div class="colorBarTicksTextWrapper">
                <div
                    v-for="(tickIdx, idx) in ticksLength"
                    :key="idx" >
                    <span
                        :style="{ left : paddingBetweenTicks[ tickIdx - 1 ] }"
                        class="colorBarTicks"
                    >|</span>
                    <h4
                        :style="{ left : paddingBetween[ tickIdx - 1 ] }"
                        class="colorBarText"
                    >{{ ticks[ tickIdx - 1] }}</h4>
                </div>
            </div>
            <div
                v-for="(colorIdx, idx) in noOfColors"
                :key="idx"
                class="colorBarColorsWrapper">
                <div
                    :style="{ backgroundColor : getColor(colorIdx) , 'width' : colorDivWidth }"
                    class="colorBarColors"
                />
            </div>
        </div>
    </div>
</template>

<script>
import chroma from 'chroma-js';
import { mapState } from 'pinia';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';
import { INIT_SOLAR_ACCESS_COLOR_BAR } from '../../../componentManager/componentManagerConstants';

export default {
    name: 'ColorBar',
    data() {
        return {
            msg: 'Color component',
            colorMap: chroma
                .scale(['000099',  "#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"])
                .domain([0, 0.01, 0.45, 0.5, 0.55, 0.6, 0.75, 0.8, 0.9, 1.0]),
            startValue: 0.7,
            endValue: 1.0,
            incrementValue: 0.01,
            ticks: [],
            colorlength: 31,
            index: [70, 85, 100],
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            solarAccessVisible: state => state.solarAccess.visible,
        }),
        noOfColors() {
            return Math.ceil((this.endValue - this.startValue) / this.incrementValue);
        },
        colorDivWidth() {
            return `${(100 / this.colorlength).toString()}%`;
        },
        ticksLength() {
            return this.ticks.length;
        },

        paddingBetween() {
            const length = 100 / (this.ticks.length - 1);
            const A = [];
            for (let i = 0; i < this.ticks.length; i++) {
                const currCharCount = this.ticks[i].toString().length;
                A.push(`${(length * i - currCharCount / 2).toString()}%`);
            }
            return A;
        },

        paddingBetweenTicks() {
            const length = 100 / (this.ticks.length - 1);
            const A = [];
            A.push('-0.7%');
            for (let i = 1; i < this.ticks.length - 1; i++) {
                A.push(`${(length * i).toString()}%`);
            }
            A.push('99.8%');
            return A;
        },
    },
    mounted() {
        this.updateColorBar();

        this.$eventBus.$once(
            INIT_SOLAR_ACCESS_COLOR_BAR,
            (colorMap, startValue, endValue, incrementValue) => {
                this.colorMap = colorMap;
                this.startValue = startValue;
                this.endValue = endValue;
                this.incrementValue = incrementValue;
                this.updateColorBar();
            },
        );
    },
    methods: {
        updateColorBar() {
            this.ticks = [
                this.startValue,
                this.startValue + (this.endValue - this.startValue) * 0.2,
                this.startValue + (this.endValue - this.startValue) * 0.4,
                this.startValue + (this.endValue - this.startValue) * 0.6,
                this.startValue + (this.endValue - this.startValue) * 0.8,
                this.endValue,
            ];
        },
        getColor(index) {
            const color = this.colorMap(this.startValue + index * this.incrementValue).rgb();
            return (
                `rgb(${
                    color[0].toString()
                },${
                    color[1].toString()
                },${
                    color[2].toString()
                })`
            );
        },
    },
    destroyed() {
       useStudioSideBarStore().solarAccess.visible = false;
    }
};
</script>

<style type="text/css">
#bottomBar {
    height: 40px;
    z-index: 1;
    position: absolute;
    bottom: calc(75px + 1.5vw);
    margin-bottom: 0;
    padding-top: 0;
    width: 324px;
    left: 16px;
}
.colorBarTicksTextWrapper {
    position: relative;
    width: 100%;
}
.colorBarColorsWrapper {
    top: 0;
    display: inline;
}
.colorBarWrapper {
    height: 100%;
    width: 100%;
    padding-right: 0;
}

.colorBarColors {
    height: 100%;
    float: left;
}

.colorBarText {
    position: absolute;
    top: calc(35px + 0.7vw);
    font-size: 0.7vw;
    color: black;
    font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
    font-size-adjust: inherit;
    padding: 0 1px;
    background-color: white;
    opacity: 0.7;
    border-radius: 2px;
}

.colorBarTicks {
    position: absolute;
    top: 32px;
    font-size: 0.7vw;
    color: black;
    font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
    font-size-adjust: inherit;
    width: 1px;
}
</style>
