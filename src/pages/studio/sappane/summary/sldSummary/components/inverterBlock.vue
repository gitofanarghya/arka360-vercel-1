<template>
    <div style="height: 100%;" id="sldFormWireInverters"  v-if="renderComponent">
        <div style="line-height: 1.1vw">
            <span
                class="sappane-label ellipsisProperty" 
                style="width: 45%;"> 
                Total Modules Left                          
            </span>
            <span 
                class="sappane-value" 
                style="height: auto;"> 
                {{ modulesLeftComputed }} 
            </span>
        </div>

        <div class="scroll-area" v-bar style="height: calc(100% - 80px)">
            <div>
                <div>
                    <p class="header_sap">
                        Wires
                    </p>
                    <div>
                        <div class="dataProperties">
                            <div class="sappane-label" style="display: flex; align-items: flex-start;"> 
                                <span style="width: 35%"> DC Wire Make </span>
                                <div style="padding-left:5px; display: inline-flex; width: 60%; justify-content: space-between;">
                                    <el-select
                                            v-model="wireMakes.dcCableMake.type"
                                            class="sappane-select"
                                            placeholder="Select"
                                            popper-class="darkDropdown"
                                            style="width: 40%">
                                            <el-option
                                                v-for="(wireType, index) in wireMakeTypes"
                                                :key="index"
                                                :label="wireType.label"
                                                :value="wireType.value"/>
                                    </el-select>
                                    <div style="width: 50%; display:inline-flex; justify-content: space-between; align-items: baseline;">
                                        <input
                                            v-model.number="wireMakes.dcCableMake.size"
                                            type="number"
                                            class="sappane-input-value"
                                            autocomplete="off"
                                            name="DC Cable Make Size"
                                            v-validate="positiveDecimals"
                                            style="width: 40%"/>
                                        <span style="font-size: 0.7vw">
                                            {{ wireMakeUnit }}
                                        </span>                
                                    </div>
                                </div>
                                
                            </div>
                            <div class='formErrors' style="padding: 0 0 5px 0">{{errors.first('DC Cable Make Size')}}</div>
                        </div>
                        <div class="dataProperties">
                            <div class="sappane-label" style="display: flex; align-items: flex-start;"> 
                                <span style="width: 35%"> AC Wire Make </span>
                                <div style="padding-left:5px; display: inline-flex; width: 60%; justify-content: space-between;">
                                    <el-select
                                        v-model="wireMakes.acCableMake.type"
                                        class="sappane-select"
                                        placeholder="Select"
                                        popper-class="darkDropdown"
                                        style="width: 40%">
                                        <el-option
                                            v-for="(wireType, index) in wireMakeTypes"
                                            :key="index"
                                            :label="wireType.label"
                                            :value="wireType.value"/>
                                    </el-select>
                                    <div style="width: 50%; display:inline-flex; justify-content: space-between; align-items: baseline;">
                                        <input
                                            v-model.number="wireMakes.acCableMake.size"
                                            type="number"
                                            class="sappane-input-value"
                                            autocomplete="off"
                                            v-validate="positiveDecimals"
                                            name="AC Cable Make Size"
                                            style="width: 40%"/>
                                        <span style="font-size: 0.7vw">
                                            {{ wireMakeUnit }}
                                        </span>                
                                    </div>
                                </div>
                            </div>
                            <div class='formErrors'>{{errors.first('AC Cable Make Size')}}</div>
                        </div>
                    </div> 
                </div> 
                <div id="inverterSLD">
                        <p class="header_sap" style="padding-top: 10px;">
                            Inverters
                        </p>
                    <div v-for="(inverter, index) in sldInformationComplete.inverters" :key="index">
                        <el-collapse v-model="activeCollapseNameInverter" class="inverterCollapseBorder">
                            <el-collapse-item :name="index">
                                <template slot="title">
                                    <div style="width: calc(100% - 1vw)">
                                        <div style="line-height: 1.1vw">
                                            <span 
                                                class="sappane-label ellipsisProperty" 
                                                style="padding-bottom: 0; width: 45%; position: relative; top: 0.5vw"> 
                                                {{ inverter.inverterDetails.Make }}
                                            </span>
                                            <span 
                                                class="sappane-value" 
                                                style="height: auto;"> 
                                                {{ inverter.inverterDetails.Size }} 
                                                kW
                                            </span>
                                        </div>
                                        <div style="line-height: 1.1vw">
                                            <span class="sappane-value" style="height: auto;">{{inverter.numberOfInvertersStrung}}/{{inverter.quantity}}</span>
                                        </div>
                                    </div>
                                </template>
                                <div>
                                    <div class="sappane-label voltageSizingBlock"> MPPT Voltage Range 
                                        <div class="inputVoltageSizing">
                                            <input
                                                class="sappane-input-value"
                                                autocomplete="off"
                                                v-model="inverter.inverterDetails.MPPT_Low_V"
                                                disabled
                                                style="width: 40%"/>
                                            <span style="line-height: 1.2vw"> to </span>
                                            <input
                                                class="sappane-input-value"
                                                autocomplete="off"
                                                v-model="inverter.inverterDetails.MPPT_High_V"
                                                disabled
                                                style="width: 40%"/>
                                        </div>
                                    </div>
                                    <div class="sappane-label voltageSizingBlock"> Recommended Sizing
                                        <div class="inputVoltageSizing">
                                            <input
                                                class="sappane-input-value"
                                                v-model="inverter.sizingRange.minSeriesModules"
                                                autocomplete="off"
                                                style="width: 40%"
                                                disabled/>
                                            <span style="line-height: 1.2vw"> to </span>
                                            <input
                                                class="sappane-input-value"
                                                autocomplete="off"
                                                v-model="inverter.sizingRange.maxSeriesModules"
                                                style="width: 40%"
                                                disabled/>
                                        </div>
                                    </div>
                                    <p class="sappane-label" style="display: inline-block; margin: 0 5px 0 0"> Configurations </p>
                                    <button
                                        class="button-dark-theme-icons el-icon-plus icons-circle"
                                        @click="newRowInverter(index)"
                                    />
                                    <div v-show="inverterCountError.formDisplayError[index].hasErrorInverterCount" class="formErrors">Inverters used should match inverter available</div>
                                </div>
                                <div v-if="inverter.sizing.length > 0">
                                    <div 
                                        v-for="(sizing, indexSizing) in inverter.sizing" 
                                        :key="indexSizing"
                                        class="reducedHeight">
                                        <el-collapse v-model="activeCollapseNameConfiguration" class="configurationCollapseBorder">
                                            <el-collapse-item :name="index.toString() + indexSizing.toString()">
                                                <template slot="title">
                                                    <div style="width: calc(100% - 1vw);">
                                                        <div class="sappane-label" style="padding-bottom: 0;"> 
                                                            {{sizing.inverterCountCurrentSizing}} Inverter(s) of 
                                                                <span 
                                                                    v-for="(sizingIndividual, indexStringConfiguration) in sizing.stringsConfiguration" 
                                                                    :key="indexStringConfiguration"> 
                                                                    {{sizingIndividual.numberOfStrings}} * {{sizingIndividual.numberOfModules}} 
                                                                        <span v-show="indexStringConfiguration + 1 != sizing.stringsConfiguration.length"> , </span>
                                                                </span> 
                                                        </div>
                                                    </div>
                                                </template>
                                                <div>
                                                    <div class="sappane-label" style="line-height: 1.2vw"> 
                                                        <span> Inverter Count </span>
                                                        <label>
                                                            <input
                                                                v-model.number="sizing.inverterCountCurrentSizing"
                                                                type="number"
                                                                :name="'Inverter Count' + index + indexSizing"
                                                                v-validate="positiveInteger"
                                                                class="sappane-input-value"
                                                                autocomplete="off">
                                                        </label>
                                                    </div>
                                                    <div class="formErrors">{{errors.first("Inverter Count" + index + indexSizing)}}</div>
                                                    <div>
                                                        <p class="sappane-label" style="display: inline-block; margin: 0 5px 0 0"> Sizing </p>
                                                        <button
                                                            class="button-dark-theme-icons el-icon-plus icons-circle"
                                                            @click="appendRowSizing(indexSizing, index)"/>
                                                        <div v-for="(sizingIndividual, indexStringConfiguration) in sizing.stringsConfiguration" 
                                                            :key="indexStringConfiguration">
                                                            <div style="display: inline-flex; width: 100%; justify-content: space-between; align-items: baseline; padding: 0 0 5px 0">
                                                                <div style="width: 90%; display: inline-flex; justify-content: space-between;">
                                                                    <input
                                                                        class="sappane-input-value"
                                                                        v-validate="positiveInteger"
                                                                        :name="'Number Of Strings' + index + indexSizing + indexStringConfiguration"
                                                                        autocomplete="off"
                                                                        type="number"
                                                                        style="width: 40%"
                                                                        placeholder="Number of Strings"
                                                                        v-model.number="sizingIndividual.numberOfStrings">
                                                                    <span style="line-height: 16px; font-size: 12px; color: white"> of </span>
                                                                    <input
                                                                        class="sappane-input-value"
                                                                        v-validate="positiveInteger"
                                                                        autocomplete="off"
                                                                        :name="'Number Of Modules' + index + indexSizing + indexStringConfiguration"
                                                                        style="width: 40%"
                                                                        placeholder="Number of Modules"
                                                                        v-model.number="sizingIndividual.numberOfModules"
                                                                        type="number"/>
                                                                </div>
                                                                <button class="button-dark-theme-icons el-icon-delete" @click="deleteStringConfiguration(indexStringConfiguration, indexSizing, index)"/>
                                                            </div>
                                                            <div class="formErrors">{{errors.first("Number Of Strings" + index + indexSizing + indexStringConfiguration)}}</div>
                                                            <div class="formErrors">{{errors.first("Number Of Modules" + index + indexSizing + indexStringConfiguration)}}</div>
                                                        </div>
                                                    </div>
                                                    <div class="sappane-label" style="line-height: 1.2vw; padding: 10px 0"> 
                                                        <span> DC-AC Ratio </span>
                                                        <label>
                                                            <input
                                                                class="sappane-input-value"
                                                                autocomplete="off"
                                                                v-model="sizing.loadRatio"
                                                                disabled>
                                                        </label>
                                                    </div>
                                                </div>
                                            </el-collapse-item>
                                        </el-collapse>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </div>        
                </div>
            </div>
        </div>
        <div style="text-align: center; margin: 10px 0 0 0">
            <button 
                :disabled="loading"
                class="button-properties" 
                style="min-width: 90px;"
                @click="autoSizeInverters">
                Auto Size
            </button>
            <button 
                :disabled="modulesLeftComputed !== 0 || loading || inverterCountError.updateError || errors.items.length > 0"
                class="button-properties" 
                style="min-width: 90px;"
                @click="updateSLDForm">
                Update SLD
            </button>
        </div>
    </div>
</template>

<script>
import * as notificationsAssistant from '../../../../../../componentManager/notificationsAssistant';
import { getInverterSizing } from '../../../../../../core/utils/inverterUtils'; 

export default {
    props: {
        inverters: {
            type: Array,
            default: () => [],
        },
        modules: {
            type: Object,
            default: () => {
                return {
                    characteristics: {},
                    count: 0,
                    totalModulesLeft: 0,
                }
            },
        },
        updateInverters: {
            type: Function,
            default: () => { return null; }
        },
        updateWires: {
            type: Function,
            default: () => { return null; }
        },
        wires: {
            type: Object,
            default: () => {},
        },
        updateSLD: {
            type: Function,
            default: () => { return null; }
        },
        temperature: {
            type: Object,
            default: () => {
                return {
                    min: 0,
                    max: 50
                }
            }
        },
    },
    data() {
        return {
            loading: false,
            activeCollapseNameInverter: [],
            activeCollapseNameConfiguration: [],
            positiveInteger: {
                min_value: 1,
                integer: true,
                required: true,
            },
            positiveDecimals: {
                // check the min. value and decimals
                min_value: 0,
                required: true,
            },
            renderComponent: false,
            inverterCountError: {
                formDisplayError: [],
                updateError: false,
            },
            sldInformationComplete: {
                inverters: [],
                totalModulesLeft: this.modules.totalModulesLeft,
            },
            wireMakeTypes: [
                {
                    label: 'Cu',
                    value: 'Cu',
                },
                {
                    label: 'Al',
                    value: 'Al',
                },
            ],
            wireMakeUnit: 'Sq mm',
            wireMakes: Object.keys(this.wires).length > 0 
                ? this.wires :
                {
                    dcCableMake: {
                        type: 'Cu',
                        size: 4,
                    },
                    acCableMake: {
                        type: 'Al',
                        size: 6,
                    },
                },
            modulesLeftNotificationObject: {},
            inverterMap: {},
        };
    },
    nonReactiveData() {
        return {
            modulesLeftNotificationObject: () => {},
        };
    },
    methods: {
        assignSizedInvertersToLocalVariable() {
            try {
                this.sldInformationComplete.inverters = [];
                this.inverters.forEach((inverter, index) => {
                    let inverterObject = {};
                    this.$set(inverterObject, 'inverterDetails', inverter.electricalProperties);
                    this.$set(inverterObject, 'quantity', 1);
                    this.$set(inverterObject, 'numberOfInvertersStrung', 1);
                    this.$set(inverterObject, 'numberOfStrings', inverter.numberOfStrings);
                    this.$set(inverterObject, 'sizingRange', inverter.sizingRange);
                    this.$set(inverterObject, 'sizing', inverter.sizing);
                    this.$set(this.sldInformationComplete.inverters, index, inverterObject);
                });
            }
            catch(err) {
                console.error(err)
            }
        },
        addinverterCountError() {
            for (let i = 0; i < this.sldInformationComplete.inverters.length; i++) {
                this.inverterCountError.formDisplayError.push(
                    { 
                        hasErrorInverterCount: false,
                    }
                )
            }
            this.renderComponent = true;
        },
        async newRowInverter(index) {
            this.sldInformationComplete.inverters[index].sizing.push({
                inverterCountCurrentSizing: 1,
                loadRatio: '',
                stringsConfiguration: [{
                    numberOfModules: 1,
                    numberOfStrings: 1
                }]
            });
            const indexSizing = this.sldInformationComplete.inverters[index].sizing.length - 1;
            this.activeCollapseNameConfiguration.push(index.toString() + indexSizing.toString());            
        },
        computeLoadRatioAndInverterStrung() {
            const modulePower = this.modules.characteristics.pmpp;
            this.sldInformationComplete.inverters.forEach(currentInverter => {
                currentInverter.numberOfInvertersStrung = 0;
                let currentInverterPaco = currentInverter.inverterDetails.Size;
                currentInverter.sizing.forEach(currentSizing => {
                    currentInverter.numberOfInvertersStrung += currentSizing.inverterCountCurrentSizing;
                    let modulesInCurrentSizing = currentSizing.stringsConfiguration.reduce((a, b) => a + (b.numberOfStrings * b.numberOfModules), 0);
                    // check the precision for decimals
                    // the inverter data is stored in kW and panels
                    // data is stored in W
                    currentSizing.loadRatio = parseFloat(((modulesInCurrentSizing * modulePower) / currentInverterPaco / 1000).toFixed(3));
                });
            });
        },
        updateSLDForm() {
            const sldData = {
                inverters: JSON.parse(JSON.stringify(this.sldInformationComplete.inverters)),
                modules: JSON.parse(JSON.stringify(this.modules)),
                wires: JSON.parse(JSON.stringify(this.wireMakes)),
            };
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'SLD',
                message: 'SLD is being generated',
            });
            this.updateSLD(sldData).then(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }).catch(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
                notificationsAssistant.error({
                    title: 'SLD',
                    message: 'SLD generation failed',
                });
            });
            this.updateWires(this.wireMakes);
            // this.updateInverters(this.sldInformationComplete.inverters);
            // this.sldInformationComplete.inverters = this.updateInverters();
        },

        updateSLDHelper() {
            try {
                this.assignSizedInvertersToLocalVariable();
                this.computeLoadRatioAndInverterStrung();
                this.addinverterCountError();
                // if (this.sldInformationComplete.totalModulesLeft === 0) {
                //     this.updateSLDForm();
                // }
                this.updateSLDForm();
                // else if (Object.keys(this.modulesLeftNotificationObject).length === 0) {
                //     this.modulesLeftNotificationObject = notificationsAssistant.longInfo({
                //         title: 'SLD',
                //         duration: 0,
                //         message: 'Please size remaining modules to generate SLD',
                //     });
                // }
            }
            catch(err) {
                console.error(err)
            }
        },

        autoSizeInverters() {
            // empty previous sizing for each inverter
            this.inverters.forEach((inverter) => {
                inverter.numberOfInvertersStrung = 0;
                inverter.numberOfStrings = 0;
                inverter.sizing = [];
            });
            const { inverters, totalModulesLeft } = getInverterSizing(this.modules, this.inverters, this.temperature, true);
            this.inverters = inverters;
            if(!this.inverterMap.isStringing){
                for(let inverter of inverters){
                    for(let sizing of inverter.sizing){
                        for(let index of sizing.stringsConfiguration){
                            const maxNumberOfModules = index.numberOfModules;
                            const minNumberOfModules = index.numberOfModules;
                            const totalNumberOfModules = index.numberOfModules*index.numberOfStrings;

                            index["maxNumberOfModules"] = maxNumberOfModules;
                            index["minNumberOfModules"] = minNumberOfModules;
                            index["totalNumberOfModules"] = totalNumberOfModules;
                       }
                    }
                }
            }
            this.sldInformationComplete.totalModulesLeft = totalModulesLeft;
            this.updateSLDHelper();
        },
        deleteStringConfiguration(indexStringConfiguration, indexSizing, index) {
            const sizing = this.sldInformationComplete.inverters[index].sizing;
            const sizingConf = this.sldInformationComplete.inverters[index].sizing[indexSizing].stringsConfiguration;
            const stringConfLength = sizingConf.length;
            const sizingLength = sizing.length;
            let modulesRemoved = sizingConf[indexStringConfiguration].numberOfStrings * sizingConf[indexStringConfiguration].numberOfModules * 
                sizing[indexSizing].inverterCountCurrentSizing;
            this.sldInformationComplete.totalModulesLeft += modulesRemoved;
            if (sizingLength > 1 && stringConfLength > 1 || sizingLength === 1 && stringConfLength > 1) {
                sizingConf.splice(indexStringConfiguration, 1);
            }
            else if (sizingLength > 1 && stringConfLength === 1 || sizingLength === 1 && stringConfLength === 1) {
                this.sldInformationComplete.inverters[index].numberOfInvertersStrung -= sizing[indexSizing].inverterCountCurrentSizing;
                sizing.splice(indexSizing, 1);
            }
        },
        appendRowSizing(indexSizing, index) {
            this.sldInformationComplete.inverters[index].sizing[indexSizing].stringsConfiguration.splice(0, 0, 
                {
                    numberOfStrings: 1,
                    numberOfModules: 1,
                }
            );
        },
    },
    computed: {
        modulesLeftComputed() {
            this.computeLoadRatioAndInverterStrung();
            let formUpdateError = false;
            let inverterCountCurrentSizing = 0;
            let modulesEquipped = 0;
            for (let i = 0; i < this.sldInformationComplete.inverters.length; i++) {
                if (this.sldInformationComplete.inverters[i].quantity !== this.sldInformationComplete.inverters[i].numberOfInvertersStrung) {
                    this.inverterCountError.formDisplayError[i].hasErrorInverterCount = true;
                    formUpdateError = true;
                }
                else {
                    this.inverterCountError.formDisplayError[i].hasErrorInverterCount = false;
                }
                for (let j = 0; j < this.sldInformationComplete.inverters[i].sizing.length; j++) {
                    inverterCountCurrentSizing = this.sldInformationComplete.inverters[i].sizing[j].inverterCountCurrentSizing;
                    for (let k = 0; k < this.sldInformationComplete.inverters[i].sizing[j].stringsConfiguration.length; k++) {
                        modulesEquipped +=  inverterCountCurrentSizing * this.sldInformationComplete.inverters[i].sizing[j].stringsConfiguration[k].numberOfModules * this.sldInformationComplete.inverters[i].sizing[j].stringsConfiguration[k].numberOfStrings;  
                    }     
                }
            }
            if (formUpdateError){
                this.inverterCountError.updateError = true;
            }
            else {
                this.inverterCountError.updateError = false;
            }
            return this.modules.count - modulesEquipped;
        }

    },
    watch: {
        modulesLeftComputed(newValue) {
            if (newValue === 0) {
                notificationsAssistant.close(this.modulesLeftNotificationObject);
                this.modulesLeftNotificationObject = {};
            }
            else if (newValue !== 0 && Object.keys(this.modulesLeftNotificationObject).length === 0) {
                this.modulesLeftNotificationObject = notificationsAssistant.longInfo({
                    title: 'SLD',
                    duration: 0,
                    message: 'Please size remaining modules to generate SLD',
                });
            }
        }
    },
    mounted() {
        this.updateSLDHelper();
    },
    destroyed() {
        if (Object.keys(this.modulesLeftNotificationObject).length !== 0) {
            notificationsAssistant.close(this.modulesLeftNotificationObject);
            this.modulesLeftNotificationObject = {};
        }
    }
}
</script>

<style lang="scss">
@import '../../../../../../styles/components/input';
@import '../../../../../../styles/components/forms';
@import '../../../../../../styles/components/button';
@import '../../../../../../styles/components/utils';

.inverterCollapseBorder {
    border-bottom: none !important;
}

.configurationCollapseBorder {
    border-top: 0.5px solid #EBEEF5 !important;
    border-bottom: none !important;
}

#inverterSLD .el-collapse-item__header {
    background-color: inherit;
    color: white;
    height: 40px;
    line-height: 20px;
    padding: 10px 0 10px 1vw;
}

#sldFormWireInverters input::-webkit-inner-spin-button,
#sldFormWireInverters input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}


#inverterSLD .reducedHeight .el-collapse-item__header {
    height: auto;
    padding: 10px 0 10px 1vw;
}


#inverterSLD .el-collapse-item__content {
    background: #141414;
    padding: 0 0 0 1vw;
}

.voltageSizingBlock {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

#inverterSLD .el-collapse-item__arrow {
    position: relative;
    right: 100%;
    font-size: 0.8vw;
    margin: 0;
}

.ellipsisProperty {
    white-space: nowrap;
    overflow: hidden;
    display: inline-block;
}

.inputVoltageSizing {
    display: inline-flex;
    width: 45%;
    justify-content: space-between;
}
</style>

<style scoped>

.button-dark-theme-icons {
    padding: 2px;
}

.el-icon-plus {
    font-size: 0.6vw;
}   

.el-icon-delete {
    font-size: 0.8vw;
}

.formErrors {
    font-size: 0.8vw;
}

</style>