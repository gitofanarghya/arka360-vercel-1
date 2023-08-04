<template>
    <div>
        <div class="inverter-summary">
            <div>
                <div class="flex-dix">
                    <div>
                        Manufacturer
                    </div>
                    <div>
                        {{ inverter.Manufacturer }}
                    </div>
                </div>
                <div class="flex-dix">
                    <div>
                        Model Name
                    </div>
                    <div>
                        {{ inverter.Make }}
                    </div>
                </div>
                <div class="flex-dix">
                    <div>
                        Size
                    </div>
                    <div>
                        {{ inverter.Size }} kW
                    </div>
                </div>
                <div
                    v-if="inverterType === 'STRING'"
                    class="flex-dix">
                    <div>
                        Module Count
                    </div>
                    <div>
                        {{ inverter.panelCount }}
                    </div>
                </div>
                <div
                    v-if="inverterType === 'MICRO'"
                    class="flex-dix">
                    <div>
                        Module Count
                    </div>
                    <div>
                        {{ inverter.panelCount }}
                    </div>
                </div>
                <div class="flex-dix">
                    <div>
                        String Length
                    </div>
                    <div>
                        1
                    </div>
                </div>
                <div class="flex-dix">
                    <div>
                        MPPT Voltage Range
                    </div>
                    <div>
                        {{ inverter.mmptVoltageRange.min }} to {{ inverter.mmptVoltageRange.max }}
                    </div>
                </div>
                <div
                    v-if="inverterType === 'STRING'"
                    class="flex-dix" >
                    <div>
                        String Range
                    </div>
                    <div
                        style="width: 40%; display: inline-flex; justify-content: space-between; align-items:baseline">
                        <input
                            v-validate="positiveInteger"
                            :name="'Number Of Strings'"
                            v-model.number="stringRange.min"
                            class="sappane-input-value"
                            autocomplete="off"
                            type="number"
                            style="width: 40%"
                            placeholder="Number of Strings">
                        <div> to </div>
                        <input
                            v-validate="positiveInteger"
                            :name="'Number Of Modules'"
                            v-model.number="stringRange.max"
                            class="sappane-input-value"
                            autocomplete="off"
                            style="width: 40%"
                            placeholder="Number of Modules"
                            type="number">
                    </div>
                </div>
                <div
                    v-if="inverterType === 'MICRO'"
                    class="flex-dix" >
                    <div>
                        String Range
                    </div>
                    <div>
                        {{ strings[index].sizingRange.maxModules }} to {{ strings[index].sizingRange.minModules }}
                    </div>
                </div>
                <div class="flex-dix">
                    <div>
                        No. of MPPTs
                    </div>
                    <div>
                        {{ inverter.mmptCount }}
                    </div>
                </div>
            </div>
            <div
                v-if="inverterType === 'MICRO'"
                class="flex-dix">
                <div>
                    MicroInverter Count
                </div>
                <div>
                    {{ inverter.microInverterCount }}
                </div>
            </div>

            <div class="sub-header">
                Combiner Box / Load Center
            </div>
            <div
                v-if="inverterType === 'MICRO'"
                class="flex-dix">
                <div>
                    Max String Length
                </div>
                <div>
                    {{ inverter.maxString }}
                </div>
            </div>
            <!-- stringing rows -->
            <div>
                <div class="sub-header">
                    Sizing
                </div>
                <div class="flex-dix">
                    <div style="width: 90%; display: inline-flex; justify-content: space-between;">
                        <div>
                            No. Of Strings
                        </div>
                        <div
                            v-if="inverterType === 'MICRO'"
                        >
                            Inverter / Junction Box
                        </div>
                        <div
                            v-if="inverterType === 'STRING'"
                        >
                            Modules / String
                        </div>
                    </div>
                </div>
                <div
                    v-for="(string, index) in stringData"
                    :key="index"
                    style="display: inline-flex; width: 100%; justify-content: space-between; align-items: baseline; padding: 0 0 5px 0; margin-bottom: 5px;">
                    <div
                        style="width: 90%; display: inline-flex; justify-content: space-between;">
                        <input
                            v-validate="positiveInteger"
                            :name="'Number Of Strings'"
                            v-model.number="string.numberOfStrings"
                            class="sappane-input-value"
                            autocomplete="off"
                            type="number"
                            style="width: 40%"
                            placeholder="Number of Strings">
                        <input
                            v-validate="positiveInteger"
                            :name="'Number Of Modules'"
                            v-model.number="string.numberOfModules"
                            class="sappane-input-value"
                            autocomplete="off"
                            style="width: 50%"
                            placeholder="Number of Modules"
                            type="number">
                    </div>
                    <button
                        class="button-dark-theme-icons el-icon-delete"
                        @click="deleteRow(index)"/>
                </div>

                <!-- add string button -->

                <div class="flex-dix">
                    <button
                        :disabled="modulesLeft <= 0"
                        class="add-button"
                        @click="appendRowSizing()">
                        <i class="el-dark-theme-icons el-icon-plus"/>
                        <span> Add more</span>
                    </button>
                </div>
            </div>
            <div
                v-if="inverterType === 'STRING'"
                class="flex-dix">
                <div>
                    DC-AC Ratio
                </div>
                <div>
                    {{ loadRatio }}
                </div>
            </div>
            <div
                v-if="inverter.optimizer">
                <div class="bottom-border"></div>
            </div>
            <div
                v-if="inverterType === 'STRING'"
                class="flex-dix">
                <div>
                    OPTIMIZER
                </div>
            </div>
            <div>
                <div
                    v-if="!inverter.optimizer"
                    class="flex-dix">
                    <div style="color:red">
                        This inverter doesn't contain optimizers
                    </div>
                </div>
                <div
                    v-if="inverter.optimizer">
                    <div
                        class="flex-dix">
                        <div>
                            Optimizer Model
                        </div>
                        <div>
                            {{ inverter.optimizer.make }}
                        </div>
                    </div>
                    <div
                        class="flex-dix">
                        <div>
                            String Range
                        </div>
                        <div>
                            {{ `1 - ${inverter.optimizer.maxOptimizerPanelLength}` }}
                        </div>
                    </div>
                    <div
                        class="flex-dix">
                        <div>
                            String Length
                        </div>
                        <div>
                            {{ inverter.optimizer.stringLength }}
                        </div>
                    </div>
                    <div
                        class="flex-dix">
                        <div>
                            Module
                        </div>
                        <div>
                            {{ inverter.optimizer.optimizerPanel }}
                        </div>
                    </div>
                    <div
                        class="flex-dix">
                        <div>
                            Module Count
                        </div>
                        <div>
                            {{ inverter.optimizer.panelCount }}
                        </div>
                    </div>
                    <div
                        class="flex-dix">
                        <div>
                            Optimizer Count
                        </div>
                        <div>
                            {{ inverter.optimizer.optimizerCount }}
                        </div>
                    </div>
                </div>
            </div>
            <!-- updation buttons -->
            <div
                class= "functional-button">
                <button
                    disabled
                    class="button-properties"
                    style="min-width: 90px;"
                    @click="autoSizeInverters">
                    Auto Size
                </button>
                <el-tooltip
                    :disabled="modulesLeft >= 0"
                    content="No Modules Left"
                    placement="bottom"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <div>
                        <button
                            :disabled="modulesLeft < 0 || isUpdateDisabled"
                            class="button-properties"
                            style="min-width: 90px;"
                            @click="updateSLDHelper">
                            Update SLD
                        </button>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
import { cloneDeep } from 'lodash';

export default {
    props: {
        inverter: {
            type: Object,
            default: () => [],
        },
        inverterType: {
            type: String,
            default: () => [],
        },
        strings: {
            type: Array,
            default: () => [],
        },
        modules: {
            type: Object,
            default: () => [],
        },
        modulesLeft: {
            type: Number,
            default: () => [],
        },
        index: {
            type: Number,
            default: () => [],
        },
        updateSLD: {
            type: Function,
            default: () => null,
        },
        autoSize: {
            type: Function,
            default: () => null,
        },
    },
    data() {
        return {
            sizingIndividual: {
                numberOfModules: 10,
                numberOfStrings: 20,
            },
            positiveInteger: {
                min_value: 1,
                integer: true,
                required: true,
            },
            isUpdateDisabled: true,
            cardView: this.cardView,
            stringData: cloneDeep(this.strings[this.index].sizingData),
            remainingModules: null,
            totalStringCount: 0,
            loadRatio: null,
            stringRange: {
                max: this.strings[this.index].sizingRange.maxModules,
                min: this.strings[this.index].sizingRange.minModules,
            },
        };
    },
    computed: {
        modulesLeftComputed() {
            let strungModules = 0;
            for (let i = 0; i < this.stringData.length; i += 1) {
                strungModules += this.stringData[i].numberOfModules * this.stringData[i].numberOfStrings;
            }
            const difference = this.totalStringCount - strungModules;
            this.totalStringCount = strungModules;
            this.computeLoadRatio();
        },
    },
    watch: {
        stringData: {
            handler() {
                this.updateNumberOfModules();
                this.updatePanelCount();
            },
            deep: true,
        },
        modulesLeftComputed(newValue) {
            if (newValue === 0) {
                // notificationsAssistant.close(this.modulesLeftNotificationObject);
                // this.modulesLeftNotificationObject = {};
            }
            else if (newValue !== 0) {
                // this.modulesLeftNotificationObject = notificationsAssistant.longInfo({
                //     title: 'SLD',
                //     duration: 0,
                //     message: 'Please size remaining modules to generate SLD',
                // });
            }
        },

    },
    mounted() {
        this.calculateStringCount();
        this.computeLoadRatio();
    },
    methods: {
        computeLoadRatio() {
            this.loadRatio = parseFloat(((this.totalStringCount * this.modules.characteristics.pmpp) /
                this.inverter.Size / 1000).toFixed(3));
        },
        calculateStringCount() {
            let modulesStrung = 0;
            for (let i = 0; i < this.stringData.length; i += 1) {
                modulesStrung += this.stringData[i].numberOfModules * this.stringData[i].numberOfStrings;
            }
            this.totalStringCount = modulesStrung;
        },
        appendRowSizing() {
            if (this.inverterType === 'STRING') {
                if (this.modulesLeft !== 0) {
                    let noOfModules = this.stringRange.min;
                    if (this.modulesLeft - this.stringRange.min < 0) {
                        noOfModules = this.modulesLeft;
                    }
                    this.stringData.push({
                        numberOfStrings: 1,
                        numberOfModules: noOfModules,
                    });
                    this.$notify({
                        title: 'Updated',
                        message: 'String Updated',
                        type: 'success',
                        duration: 1400,
                        offset: 40,
                    });
                }
            }
            else if (this.inverterType === 'MICRO') {
                if (this.modulesLeft !== 0) {
                    this.stringData.push({
                        numberOfStrings: 1,
                        numberOfModules: 1,
                    });

                    this.$notify({
                        title: 'Updated',
                        message: 'String Updated',
                        type: 'success',
                        duration: 1400,
                        offset: 40,
                    });
                }
            }
        },
        deleteRow(index) {
            if (this.stringData.length > 1) {
                this.stringData.splice(index, 1);
            }
        },
        autoSizeInverters() {
            this.stringData = this.autoSize(this.index);
        },
        updatePanelCount() {
            let modulesStrung = 0;
            for (let i = 0; i < this.stringData.length; i += 1) {
                modulesStrung += this.stringData[i].numberOfModules *
                    this.stringData[i].numberOfStrings;
            }
            this.$root.$emit('panelCount', modulesStrung, this.index);
        },
        updateSLDHelper() {
            this.$notify({
                title: 'Updated',
                message: 'SLD Updated',
                type: 'success',
                duration: 1400,
                offset: 40,
            });
            this.updatePanelCount();
            this.updateSLD(this.index, this.stringData);
            this.isUpdateDisabled = true;
        },
        updateNumberOfModules() {
            let modulesStrung = 0;
            for (let i = 0; i < this.stringData.length; i += 1) {
                modulesStrung += this.stringData[i].numberOfModules * this.stringData[i].numberOfStrings;
            }
            this.isUpdateDisabled = false;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../../../styles/components/input';
//@import '../../../../../../styles/components/forms';
@import '../../../../../../styles/components/button';
@import '../../../../../../styles/components/utils';
.flex-dix {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.inverter-summary{
    margin-top: 10px;
    color: white;
    font-size: 0.8vw;
    display: flex;
    flex-direction: column;
}
.sub-header {
    color: grey;
    margin-bottom: 10px;
}
.el-icon-plus {
    border: 1px solid #409EFF;
    border-radius: 50%;
    color: #409EFF;
    font-size:x-small;
}
.add-button {
    color :#409EFF;
    background-color: inherit;
    border: none;
    font-size: inherit;
    cursor: pointer;
}
.functional-button {
    display: flex;
    align-self: center;
    text-align: center;
    margin: 10px 0 20px 0;
}
.bottom-border {
    border-bottom: 0.5px solid grey;
    margin-bottom: 5px;
}
</style>
