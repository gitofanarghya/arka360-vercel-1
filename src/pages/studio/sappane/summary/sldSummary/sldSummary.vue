<template>
    <div
        id="sldSummary"
        v-if="blockReadyToRender">
            <!-- style="height: 100%" -->
            <div>
                <sldSwitch
                    :switchToSLD ="summaryData.switchToSLD"
                    :switchTo3LD ="summaryData.switchTo3LD"/>
                <div
                    class="bottom-border sappane-flex"
                    style="margin: 10px 0 10px 0">
                    <div 
                    class="inverter-prop1 ">
                        Total Modules Left
                    </div>             
                    <div class="inverter-prop1">
                        {{ summaryData.modulesLeft }}
                    </div>
                </div>
                </div>
                <div
                    class="bottom-border sappane-flex"
                    style="margin: 10px 0 10px 0">
                    <div 
                    class="inverter-prop1">
                        AC Disconnnect
                    </div>
                    <div class="inverter-prop1 dropdownWidth">
                        <el-select v-model="selectedAC" placeholder="PM-AC" @change="changeAcDisconnectToggle">
                            <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div
                    class="bottom-border sappane-flex"
                    style="margin: 10px 0 10px 0">
                    <div 
                    class="inverter-prop1 ">
                        Enable Production Meter
                    </div>
                    <el-switch
                        v-model="summaryData.isMeterEnabled"
                        active-color="#3498db"
                        class="inverter-prop1"
                        @change="summaryData.toggleMeter"
                    />
                </div>
                

                <div v-if="!inInverterSummary">
                <div
                    style="margin: 10px 0 10px 0">
                    <span 
                    class="inverter-prop1 ">
                        INVERTERS
                    </span>
                    <span class="inverter-prop1">
                        ({{ summaryData.strings.length }})
                    </span>
                </div>     
                    <div
                        v-if="summaryData.inverters.length === 0">
                        <div
                            v-for="(inverter, index) in summaryData.microInverters"
                            :key="index"
                            class="inverter-card bottom-border"
                            @click="viewInverterSummary(inverter,index)">
                            <div class="inverter-prop1 inverter-heading">
                                Micro Inverter # {{ index + 1 }} ({{ inverter.panelCount }})
                            </div>
                            <div class="inverter-prop1">
                                {{ inverter.Manufacturer }}
                            </div>
                            <div class="inverter-prop1">
                                {{ inverter.Make }}
                            </div>
                            <div class="inverter-prop1 sappane-flex">
                                <div>
                                    Size
                                </div>
                                <div>
                                    {{ inverter.Size }} kW
                                </div>
                            </div>
                            <div class="inverter-prop1 sappane-flex">
                                <div>
                                    Module Count
                                </div>
                                <div>
                                    {{ inverter.panelCount }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-for="(inverter, index) in summaryData.inverters"
                        :key="index"
                        class="inverter-card bottom-border"
                        @click="viewInverterSummary(inverter,index)">
                        <div class="inverter-prop1 sappane-flex inverter-heading">
                            <div>
                            String Inverter # {{ index + 1 }}
                            </div>
                            <i class="el-icon-right"></i>                        
                        </div>
                        <div class="inverter-prop1">
                            {{ inverter.Manufacturer }}
                        </div>
                        <div class="inverter-prop1">
                            {{ inverter.Make }}
                        </div>
                        <div class="inverter-prop1 sappane-flex">
                            <div>
                                Size
                            </div>
                            <div>
                                {{ inverter.Size }} kW
                            </div>
                        </div>
                        <div class="inverter-prop1 sappane-flex">
                            <div>
                                Module Count
                            </div>
                            <div>
                                {{ panelCounts[index] }}
                            </div>
                        </div>
                    </div>
                </div>
            
            <div
                v-else
                style="margin: 10px 0 0 0; height: 100%">
                <div class="go-back-section">
                    {{ inverterType }} INVERTER SUMMARY
                    <button
                        class="button-dark-theme-icons el-icon-close close-button"
                        style="float: right"
                        @click="goBack"/>
                </div>
                <inverterCard
                    :inverter ="selectedInverter"
                    :inverterType ="inverterType"
                    :strings ="summaryData.strings"
                    :modules ="summaryData.modules"
                    :modulesLeft ="summaryData.modulesLeft"
                    :index ="selectedIndex"
                    :autoSize ="summaryData.autoSize"
                    :updateSLD ="summaryData.updateSLD"/>
            </div>
    </div>
</template>

<script>
import sldSwitch from './components/sldSwitch.vue';
import inverterCard from './components/inverterCard.vue';


export default {
    components: {
        inverterCard,
        sldSwitch,
    },
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    inverters: [],
                    strings: [],
                    microInverters: [],
                    modulesLeft: 0,
                    modules: () => {},
                    updateSLD: () => {},
                    autoSize: () => {},
                    switchToSLD: () => {},
                    switchTo3LD: () => {},
                    toggleMeter: () => {},
                    changeAcDisconnect: () => {},
                };
            },
        },
    },
    data() {
        return {
            msg: 'I am in SLD summary',
            blockReadyToRender: false,
            inverters: [],
            inInverterSummary: false,
            selectedInverter: null,
            selectedIndex: null,
            inverterType: null,
            totalModules: this.summaryData.modules.count,
            totalModulesUsed: 0,
            isMeterEnabled: true,
            selectedAC: undefined,
            options: [
                {
                    value: 3,
                    label: 'PM-AC'
                }, {
                    value: 0,
                    label: 'PM-AC-AC'
                }, {
                    value: 1,
                    label: 'AC-PM-AC'
                }, {
                    value: 2,
                    label: 'AC-AC-PM'
                }, 
            ],
            panelCounts: [],
        };
    },
    computed: {

    },
    mounted() {
        this.updatePanelCount();
        this.$root.$on('panelCount', (arg, i) => {
            this.panelCounts[i] = arg;
            this.calculateModulesLeft();
        });
        if (this.summaryData.inverters.length > 0) {
            this.inverterType = 'STRING';
        }
        else {
            this.inverterType = 'MICRO';
        }
        this.blockReadyToRender = true;
    },
    beforeDestroy() {
        this.$root.$off('panelCount');
    },
    destroyed() {

    },

    methods: {
        calculateModulesLeft() {
            let totalModulesUsed = 0;
            for (let i = 0, len = this.panelCounts.length; i < len; i += 1) {
                totalModulesUsed += this.panelCounts[i];
            }
            this.summaryData.modulesLeft = this.totalModules - totalModulesUsed;
        },
        viewInverterSummary(inverter, index) {
            this.selectedIndex = index;
            this.selectedInverter = inverter;
            this.inInverterSummary = true;
        },
        goBack() {
            this.inInverterSummary = false;
            this.updatePanelCount();
            this.calculateModulesLeft();
        },
        changeAcDisconnectToggle() {
            this.summaryData.changeAcDisconnect(this.selectedAC);
        },
        updatePanelCount() {
            for (let i = 0, l = this.summaryData.strings.length; i < l; i += 1) {
                const { sizingData } = this.summaryData.strings[i];
                let totalModulesUsed = 0;
                for (let j = 0; j < sizingData.length; j += 1) {
                    const sizing = sizingData[j];
                    totalModulesUsed += sizing.numberOfModules * sizing.numberOfStrings;
                }
                this.panelCounts[i] = totalModulesUsed;
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../../../../styles/components/button.scss';
</style>

<style  scoped>
#sldSummary ::-webkit-scrollbar {
    display: none;
}

#sldSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#sldSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#sldSummary .data-summary  {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.bottom-border {
    border-bottom: 0.5px solid grey;
    margin-bottom: 5px;
}
.inverter-card:hover {
    background-color: rgba(110, 121, 133, 0.425);
    cursor: pointer;
}
.inverter-prop1 {
    color: white;
    font-size: 0.9vw;
    margin-bottom: 5px;
    padding-top:0.2em;
}

.dropdownWidth{
    width: 50%;
}

#sldSummary >>> .el-input__inner {
    background-color: #141414 !important;
    color: #fff;
}

#sldSummary >>> .el-select .el-input.is-focus .el-input__inner{
    border-color: #fff;
}

#sldSummary >>>  .el-select .el-input__inner:focus{
    border-color: #fff;
}

#sldSummary >>> .el-select .el-input .el-select__caret{
    color: #fff;
}

.inverter-heading {
    color: gray;
}
.sappane-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
}
.go-back-section {
    color: white;
    font-size: 0.9vw;
}
.close-button {
    border: 1px solid #fafafa;
    border-radius: 50%;
    padding: 2px;
}

#sldSummary .el-input--suffix .el-input__inner{
        width: 28px !important;
        height: 14px !important;
}
#sldSummary > div:nth-child(1) > div.bottom-border.sappane-flex > div:nth-child(2) > div > div.el-input.el-input--suffix > input{
           width: 28px !important;
        height: 14px !important;
}
</style>
