<template>
    <div
        id="arrayActions"
        class="data-actions">
        <div class="scroll-area" v-bar>
            <div class="scroll-content">
                <el-row class="button-actions-row">
                    <el-col
                        :span="12"
                        class="button-actions-wrapper">
                        <button
                            id="subarray_delete"
                            :disabled="!deleteEnabled"
                            class="button-actions"
                            @click="deleteModelAction">
                            Delete
                        </button>
                    </el-col>
                    <el-col
                        v-if="!actionsData.eastWestRackingEnabled"
                        :span="12"
                        class="button-actions-wrapper">
                        <el-tooltip placement="top" popper-class="addTableToolTip">
                            <div slot="content">Adds a table to a new subarray.
                                <br/>For adding table to the same
                                <br/>subarray use copy paste.
                            </div>
                            <button
                                :disabled="!addTableEnabled"
                                class="button-actions"
                                @click="actionsData.addTables">
                                Add Table
                            </button>
                        </el-tooltip>
                    </el-col>
                    <el-col
                        v-if="actionsData.eastWestRackingEnabled"
                        :span="12"
                        class="button-actions-wrapper">
                        <el-tooltip placement="top" popper-class="addTableToolTip">
                            <div slot="content">Adds a East table to a new subarray.
                            </div>
                            <button
                                :disabled="!addTableEnabled"
                                class="button-actions"
                                @click="actionsData.addTables(eastType)">
                                Add East Table
                            </button>
                        </el-tooltip>
                    </el-col>
                </el-row>
                <el-row class="button-actions-row">
                    <el-col
                        v-if="actionsData.eastWestRackingEnabled"
                        :span="12"
                        class="button-actions-wrapper">
                        <el-tooltip placement="top" popper-class="addTableToolTip">
                            <div slot="content">Adds a Wast table to a new subarray.
                            </div>
                            <button
                                :disabled="!addTableEnabled"
                                class="button-actions"
                                @click="actionsData.addTables(westType)">
                                Add West Table
                            </button>
                        </el-tooltip>
                    </el-col>
                    <el-col
                        v-if="actionsData.eastWestRackingEnabled"
                        :span="12"
                        class="button-actions-wrapper">
                        <el-tooltip placement="top" popper-class="addTableToolTip">
                            <div slot="content">Adds a Wast table to a new subarray.
                            </div>
                            <button
                                :disabled="!addTableEnabled"
                                class="button-actions"
                                @click="actionsData.addTables(ewType)">
                                Add East-West Table
                            </button>
                        </el-tooltip>
                    </el-col>
                </el-row>
                <el-row class="button-actions-row">
                    <el-col 
                    :span="12"
                    class="button-actions-wrapper">
                        <button
                            id="subarray_optimize"
                            :disabled="!optimiseEnabled"
                            class="button-actions"
                            @click="onClickOptimiseButton">
                            <span v-if="!sliderVisible">Optimize</span>
                            <span v-else>Close</span>
                        </button>
                    </el-col>
                    <el-col
                    :span="12"
                    v-if="!actionsData.eastWestRackingEnabled" class="button-actions-wrapper">
                        <button
                            :disabled="!resetEnabled || actionsData.addTableFlow"
                            class="button-actions"
                            @click="actionsData.resetSubarray">
                            Reset
                        </button>
                    </el-col>  
                </el-row>
                <el-row
                    v-show="sliderVisible"
                    class="button-actions-row">
                    <el-col>
                        <div class="demonstration">Optimization</div>
                        <el-slider
                            v-model="nTables"
                            :min="1"
                            :max="maxTables"
                            :step="1"
                            :show-tooltip="false"
                            class="sappane-slider"
                            @change="onLeaveSlider"/>
                    </el-col>
                </el-row>
                <el-row
                    v-show="sliderVisible">
                    <div class="dataActions">
                        <div class="sappane-label"> Subarray Size
                            <label>
                                <input
                                    v-model.number.lazy="subarraySize"
                                    class="sappane-input-value">
                            </label>
                            <p><span>{{ errorMessages.subarraySize }}</span></p>
                        </div>
                        <div class="sappane-label"> Solar Access Threshold
                            <label>
                                <input
                                    v-model.number.lazy="solarAccessThreshold"
                                    class="sappane-input-value">
                            </label>
                            <p><span>{{ errorMessages.solarAccessThreshold }}</span></p>
                        </div>
                        <div class="sappane-label"> Module Quantity
                            <label>
                                <input
                                    v-model.number.lazy="moduleQuantity"
                                    class="sappane-input-value">
                            </label>
                            <p><span>{{ errorMessages.moduleQuantity }}</span></p>
                        </div>
                    </div>
                </el-row>
                <modal-box />
            </div>
        </div>
    </div>
</template>

<script>
import validator from 'validator';
import { SET_ACTION_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import {ADD_EAST_TABLE,
ADD_WEST_TABLE, ADD_EW_TABLE} from '../../../../core/coreConstants';
import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioStore } from '../../../../stores/studio';

export default {
    components: { modalBox },
    name: 'SubarrayActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteSubarray: () => {},
                    addTables: () => {},
                    onClickOptimise: () => {},
                    resetSubarray: () => {},
                    addTableFlow: false,
                    eastWestRackingEnabled: false,
                };
            },
        },
    },
    data() {
        return {
            sliderVisible: false,
            nTables: 1,
            maxTables: 1,
            isDesignSaved: false,
            tableSize: 0.3,
            moduleCountPerTable: 1,
            errorMessages: {
                subarraySize: '',
                solarAccessThreshold: '',
            },
            eastType: ADD_EAST_TABLE,
            westType: ADD_WEST_TABLE,
            ewType  : ADD_EW_TABLE,
        };
    },
    nonReactiveData() {
        return {
            onSlideSlider: () => {},
            onLeaveSlider: () => {},
            onOptimiseClose: () => {},
            onUpdateSolarAccessThreshold: () => {},
        };
    },
    computed: {
        deleteEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled &&
                !useStudioStore().solarAccess.loading &&
                !this.sliderVisible
            );
        },
        addTableEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled &&
                !useStudioStore().solarAccess.loading &&
                !this.sliderVisible
            );
        },
        optimiseEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled &&
                !useStudioStore().solarAccess.loading
            );
        },
        resetEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled &&
                !useStudioStore().solarAccess.loading &&
                !this.sliderVisible &&
                !this.actionsData.addTableFlow
            );
        },
        subarraySize: {
            get() {
                if (this.actionsData.eastWestRackingEnabled) {
                    return (this.nTables * this.tableSize * 2).toFixed(2);
                }
                return (this.nTables * this.tableSize).toFixed(2);
            },
            set(subarraySize) {
                if (validator.isFloat(subarraySize.toString())) {
                    this.errorMessages.subarraySize = '';
                    if (this.actionsData.eastWestRackingEnabled) {
                        subarraySize = Math.floor(subarraySize / 2);
                    }
                    let nTables = Math.floor(subarraySize / this.tableSize);
                    if (nTables > this.maxTables) nTables = this.maxTables;
                    else if (nTables < 1) nTables = 1;
                    if (nTables === this.nTables) {
                        this.$forceUpdate();
                    }
                    else {
                        this.nTables = nTables;
                    }
                }
                else {
                    this.errorMessages.subarraySize = 'Invalid Input';
                    setTimeout(() => {
                        this.errorMessages.subarraySize = '';
                    }, 1500);
                }
            },
        },
        solarAccessThreshold: {
            get() {
                return (100 *
                    (this.sliderVisible ? this.onSlideSlider(this.nTables) : 0)).toFixed(1);
            },
            set(solarAccessThreshold) {
                if (validator.isFloat(solarAccessThreshold.toString())) {
                    this.errorMessages.solarAccessThreshold = '';
                    let solarAccessThresholdLocal = solarAccessThreshold;
                    if (solarAccessThresholdLocal > 100) solarAccessThresholdLocal = 100;
                    else if (solarAccessThresholdLocal < 0) solarAccessThresholdLocal = 0;
                    const nTables =
                        this.onUpdateSolarAccessThreshold((solarAccessThreshold - 0.05) / 100);
                    if (nTables === this.nTables) {
                        this.$forceUpdate();
                    }
                    else {
                        this.nTables = nTables;
                    }
                }
                else {
                    this.errorMessages.solarAccessThreshold = 'Invalid Input';
                    setTimeout(() => {
                        this.errorMessages.solarAccessThreshold = '';
                    }, 1500);
                }
            },
        },
        moduleQuantity: {
            get() {
                if (this.actionsData.eastWestRackingEnabled) {
                    return this.nTables * this.moduleCountPerTable * 2;
                }
                return this.nTables * this.moduleCountPerTable;
            },
            set(moduleQuantity) {
                if (validator.isFloat(moduleQuantity.toString())) {
                    this.errorMessages.subarraySize = '';
                    if (this.actionsData.eastWestRackingEnabled) {
                        moduleQuantity = Math.floor(moduleQuantity / 2);
                    }
                    let nTables = Math.floor(moduleQuantity / this.moduleCountPerTable);
                    if (nTables > this.maxTables) nTables = this.maxTables;
                    else if (nTables < 1) nTables = 1;
                    if (nTables === this.nTables) {
                        this.$forceUpdate();
                    }
                    else {
                        this.nTables = nTables;
                    }
                }
                else {
                    this.errorMessages.subarraySize = 'Invalid Input';
                    setTimeout(() => {
                        this.errorMessages.subarraySize = '';
                    }, 1500);
                }
            }
        }
    },
    watch: {
        eastWestRackingEnabled: {
            handle(val) {
            }
        }
    },
    mounted() {
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.deleteModelAction();
        });
        this.$mousetrap.bind('o', () => {
            if (this.optimiseEnabled) this.onClickOptimiseButton();
        });
        this.$mousetrap.bind('+', () => {
            if (this.addTableEnabled) this.actionsData.addTables();
        });
        this.$eventBus.$on('designSavedUpdated', (isDesignSaved) => {
            this.isDesignSaved = isDesignSaved;
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind(['del', 'backspace']);
        this.$mousetrap.unbind('o');
        this.$mousetrap.unbind('+');
    },
    methods: {
        deleteModelAction() {
            serverBus.$emit('modalBoxOn', this.actionsData.deleteSubarray, 'Performing this action will delete the Subarray and the Associated Inverters. Are you sure you want to continue?');
        },
        onClickOptimiseButton() {
            if (this.sliderVisible) {
                this.hideSlider();
            } else if (!this.isDesignSaved) {
                 this.$message({
                    showClose: true,
                    message: 'Kindly save design to optimise the subarray.',
                    type: 'error',
                    center: true
                });

            } else {
                this.$eventBus.$emit(SET_ACTION_EDIT_MODE, true);
               
                this.actionsData.onClickOptimise(this.isDesignSaved).then(
                    (optimiseParams) => {
                        this.onSlideSlider = optimiseParams.onSlideSlider;
                        this.onLeaveSlider = optimiseParams.onLeaveSlider;
                        this.nTables = optimiseParams.nTables;
                        this.maxTables = optimiseParams.maxTables;
                        this.tableSize = optimiseParams.tableSize;
                        this.onOptimiseClose = optimiseParams.onOptimiseClose;
                        this.moduleCountPerTable = optimiseParams.moduleCountPerTable;
                        this.onUpdateSolarAccessThreshold =
                            optimiseParams.onUpdateSolarAccessThreshold;
                        this.sliderVisible = true;
                    },
                    (error) => {
                        console.error('ERROR: SubarrayActions: onClickOptimise failed', error);
                        this.hideSlider();
                    },
                );
            }
        },
        hideSlider() {
            this.sliderVisible = false;
            this.onOptimiseClose();
            this.$eventBus.$emit(SET_ACTION_EDIT_MODE, false);
        },
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/button.scss';
    @import '../../../../styles/components/input.scss';

    #arrayActions ::-webkit-scrollbar {
        display: none;
    }

    #arrayActions .vb > .vb-dragger > .vb-dragger-styler{
        visibility: hidden;
    }

    #arrayActions:hover .vb > .vb-dragger > .vb-dragger-styler{
        visibility: visible;
    }

    #arrayActions .data-summary  {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .addTableToolTip {
        background-color: #424242;
        font-size: 1vw;
    }

    .scroll-content {
        width: auto !important;
        padding-left: 4%;
    }

    .demonstration {
        font-size: 1vw;
        color: #fff;
        text-align: left;
        margin-top: 4px;
        margin-bottom: -4px;
    }

    .button-actions-row {
        gap: 8px;
    }

    .button-actions-row .button-actions-wrapper .button-actions {
        width: 100%;
    }

    .button-actions-row .button-actions-wrapper {
        padding: 0px;
    }
</style>
