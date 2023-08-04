<template>
    <div id="inverterProperties">
        <div
            vbar
            class="scroll-area">
            <div class="dataProperties">
                <div class="border-pro" />
                <div class="sappane-label">
                    <br >Azimuth
                    <label>
                        <input
                            v-validate="azimuthValidation"
                            v-model.number="azimuth"
                            :disabled="!editEnabled"
                            class="sappane-input-value"
                            name="Azimuth"
                            autocomplete="off"
                        >
                    </label>
                    <p>
                        <span>{{ errors.first('Azimuth') }}</span>
                    </p>
                </div>
                <div class="sappane-label">
                    Mount Height
                    <input-length
                        v-model="mountHeight"
                        :name="'Mount Height'"
                        :disabled="!editEnabled || !mountHeightEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Mount Height') }}</span>
                    </p>
                </div>
                <div class="sappane-label">
                    Name
                    <input
                        v-model="name"
                        :name="'subArrayName'"
                        :disabled="!editEnabled"
                        class="sappane-input-value" >
                </div>
                <div class="button-actions-row">
                    <div class="button-actions-wrapper">
                        <button
                            class="button-actions"
                            :disabled="!editEnabled"
                            @click="updateProperties">Update</button>
                    </div>
                    <div class="button-actions-wrapper">
                        <button
                            class="button-actions"
                            :disabled="!editEnabled"
                            @click="resetProperties">Reset</button>
                    </div>
                </div>
                <div class="border-pro" />
                <div
                    v-if="propertiesData.optimizerStatus"
                    class="sappane-label optimizer_section">
                    <div class="sappane-label">
                        <br >Optimizer
                        <el-select
                            v-model="optimizerPanelMake"
                            placeholder
                            name="optimizer"
                            :disabled="!editEnabled"
                            class="text-toolbar-select sappane-input-value"
                            popper-class="darkDropdown"
                        >
                            <el-option
                                v-for="(row,index) in optimizerList"
                                :key="index"
                                :value="row.optimizer.Make"
                                :label="row.optimizer.Make"
                            />
                        </el-select>
                    </div>
                    <div class="sappane-label">
                        String Range
                        <span class="sappane-value"> {{ `1 - ${maxOptimizerPanelLength}` }}</span>
                    </div>
                    <div class="sappane-label">
                        String Length
                        <label>
                            <input
                                v-model.number="optimizerStringLength"
                                :class="{'border-danger': !isInputStringLengthValid}"
                                class="sappane-input-value"
                                :disabled="!editEnabled"
                                name="strngLength"
                                autocomplete="off"
                            >
                        </label>
                    </div>
                    <div
                        class="sappane-label"
                        style="margin: -1.3vh 0px 0.3vh 0px;">
                        <br >Module
                        <!-- margin: -1.3vh 0px 0.3vh 0px; -->
                        <el-select
                            v-model="optimizerPanel"
                            placeholder
                            :disabled="!editEnabled"
                            name="optimizerPanel"
                            class="text-toolbar-select sappane-input-value"
                            popper-class="darkDropdown"
                            @change="optimizerPanelSelected(optimizerPanel)"
                        >
                            <el-option
                                v-for="(i,index) in optimizerPanelList"
                                :key="index"
                                :value="i"
                                :label="i.make"
                            />
                        </el-select>
                    </div>
                    <div class="sappane-label">
                        Module Count
                        <span class="sappane-value">{{ panelCount }}</span>
                    </div>
                    <div class="sappane-label">
                        Optimizer Count
                        <span class="sappane-value">{{ optimizerCount }}</span>
                    </div>
                    <div
                        class="button-actions-row"
                        style="justify-content: space-around;">
                        <div class="button-actions-wrapper">
                            <button
                                :disabled="!isInputStringLengthValid || !editEnabled"
                                class="button-actions"
                                @click.prevent="updateOptimizer">Update</button>
                        </div>
                    </div>
                </div>

                <!-- <div v-if="propertiesData.mppts.length>0">
                    <div class="border-pro" />
                    <br >
                    <div class="sappane-label">
                        <div
                            class="sappane-label dc-cable-pros string-range-com"
                            @click="handleCollapsable('1')"
                        >
                            <div>DC CABLE PROPERTIES</div>
                            <div v-if="dropClose == 1">
                                <img
                                    :src="dropdownArrowUp"
                                    width="20px"
                                    height="20px" >
                            </div>
                            <div v-else>
                                <img
                                    :src="dropdownArrowDown"
                                    width="20px"
                                    height="20px" >
                            </div>
                        </div>
                        <div
                            v-if="isAddOnEnabled"
                            id="1"
                            class="hidden">
                            <div>
                                <div class="module">Module to DCDB</div>
                                <div class="sappane-label">
                                    Cable Type
                                    <el-select
                                        v-model="dcCableModuleToDcbdCableType"
                                        placeholder
                                        name="dcCableModuleToDcbdCableTypeData"
                                        class="text-toolbar-select sappane-input-value"
                                        popper-class="darkDropdown"
                                    >
                                        <el-option
                                            v-for="(i,index) in this.propertiesData.dcCable.options.cableType"
                                            :key="index"
                                            :value="i"
                                            :label="i"
                                        />
                                    </el-select>
                                </div>
                                <div class="sappane-label">
                                    Cable Size ({{ wiringUnit }})
                                    <el-select
                                        v-if="wiringUnit === 'sq.mm'"
                                        v-model.number="dcCableModuleToDcbdCableSizeMM"
                                        class="text-toolbar-select sappane-input-value"
                                        placeholder
                                        popper-class="darkDropdown"
                                        name="dcCableModuleToDcbdCableSizeData"
                                    >
                                        <el-option
                                            v-for="(i,index) in propertiesData.dcCable.options.cableSizeMM"
                                            :key="index"
                                            :value="i"
                                            :label="i"
                                        />
                                    </el-select>
                                    <el-select
                                        v-else
                                        v-model.number="dcCableModuleToDcbdCableSizeAWG"
                                        class="text-toolbar-select sappane-input-value"
                                        placeholder
                                        popper-class="darkDropdown"
                                        name="dcCableModuleToDcbdCableSizeData"
                                    >
                                        <el-option
                                            v-for="(i,index) in propertiesData.dcCable.options.cableSizeAWG"
                                            :key="index"
                                            :value="i"
                                            :label="i"
                                        />
                                    </el-select>
                                </div>
                            </div>
                            <div>
                                <div class="module">DCDB To Inverter</div>
                                <div class="sappane-label">
                                    Cable Type
                                    <el-select
                                        v-model="dcCabletoInverterCableType"
                                        placeholder
                                        name="dcCabletoInverterCableTypeData"
                                        class="text-toolbar-select sappane-input-value"
                                        popper-class="darkDropdown"
                                    >
                                        <el-option
                                            v-for="(i,index) in this.propertiesData.dcCable.options.cableType"
                                            :key="index"
                                            :value="i"
                                            :label="i"
                                        />
                                    </el-select>
                                </div>
                                <div class="sappane-label">
                                    Cable Size ({{ wiringUnit }})
                                    <el-select
                                        v-if="wiringUnit === 'sq.mm'"
                                        v-model.number="dcCabletoInverterCableSizeMM"
                                        placeholder
                                        name="dcCabletoInverterCableSizeData"
                                        class="text-toolbar-select sappane-input-value"
                                        popper-class="darkDropdown"
                                    >
                                        <el-option
                                            v-for="(i, inds) in propertiesData.dcCable.options.cableSizeMM"
                                            :key="inds"
                                            :label="i"
                                            :value="i"
                                            class="drop-text"
                                        />
                                    </el-select>
                                    <el-select
                                        v-else
                                        v-model.number="dcCabletoInverterCableSizeAWG"
                                        placeholder
                                        name="dcCabletoInverterCableSizeData"
                                        class="text-toolbar-select sappane-input-value"
                                        popper-class="darkDropdown"
                                    >
                                        <el-option
                                            v-for="(i, inds) in propertiesData.dcCable.options.cableSizeAWG"
                                            :key="inds"
                                            :label="i"
                                            :value="i"
                                            class="drop-text"
                                        />
                                    </el-select>
                                </div>
                            </div>
                            <div class="button-actions-row">
                                <div class="button-actions-wrapper">
                                    <button
                                        class="button-actions"
                                        @click="updateDcCableProperties">Update</button>
                                </div>
                                <div class="border-pro" />
                                <div class="sappane-label switch">
                                    AJB Toggle
                                    <el-switch
                                        v-model="ajbToggle"
                                        active-color="#3498db"
                                        class="sappane-switch"
                                        @change= "toggle"
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            v-else
                            id="1"
                            class="hidden">
                            <div v-if="isRequestAddOn">
                                <div>Buy DC Stringing Add-on to use this feature.</div>
                                <button
                                    class="dc-add-on"
                                    @click="requestAddOn">Request Add-on</button>
                            </div>
                            <div
                                v-else
                                class="req-addon-msg">
                                Your Request has been submitted
                                <br >successfully
                            </div>
                        </div>
                        <div class="border-pro" />
                        <br >

                        <div class="sappane-label">
                            <div
                                class="sappane-label inverter-propss string-range-com"
                                @click="handleCollapsable('3')"
                            >
                                <div>MPPTs</div>
                                <div v-if="dropClose == 3">
                                    <img
                                        :src="dropdownArrowUp"
                                        width="20px"
                                        height="20px" >
                                </div>
                                <div v-else>
                                    <img
                                        :src="dropdownArrowDown"
                                        width="20px"
                                        height="20px" >
                                </div>
                            </div>
                            <div
                                v-if="isAddOnEnabled"
                                id="3"
                                class="hidden">
                                <Mppt :properties-data="propertiesData" />
                            </div>
                            <div
                                v-else
                                id="3"
                                class="hidden">
                                <div v-if="isRequestAddOn">
                                    <div>Buy DC Stringing add-on to use this feature.</div>
                                    <button
                                        class="dc-add-on"
                                        @click="requestAddOn">Request Add-on</button>
                                </div>
                                <div
                                    v-else
                                    class="req-addon-msg">
                                    Your Request has been submitted
                                    <br >successfully
                                </div>
                            </div>
                        </div>
                        <span />
                    </div>
                    
                </div> -->
                <div v-if="propertiesData.mppts.length>0">
                    <div class="border-pro" />
                    <br >
                    <div class="sappane-label">
                        <div
                            class="sappane-label dc-cable-pros string-range-com"
                            @click="handleCollapsable('1')">
                            <div>DC CABLE PROPERTIES</div>
                            <div v-if="dropClose == 1"><img
                                :src="dropdownArrowUp"
                                width="20px"
                                height="20px" ></div>
                            <div v-else><img
                                :src="dropdownArrowDown"
                                width="20px"
                                height="20px" ></div>
                        </div>
                        <div
                            v-if="isAddOnEnabled"
                            id="1"
                            class="hidden">
                            <div>
                                <div class="sappane-label">
                                    Cable Type
                                    <el-select
                                        v-model="dcCableModuleToDcbdCableType"
                                        placeholder=""
                                        :disabled="!editEnabled"
                                        name="dcCableModuleToDcbdCableTypeData"
                                        class="text-toolbar-select sappane-input-value"
                                        popper-class="darkDropdown"
                                    >
                                        <el-option
                                            v-for="(i,index) in this.propertiesData.dcCable.options.cableType"
                                            :key="index"
                                            :value="i"
                                            :label="i"/>
                                    </el-select>
                                </div>
                                <keep-alive>
                                    <cable-size-pop-up
                                        :is-cable-size-pop-up-open="isCableSizePopUpOpen"
                                        :cable-size-properties="cableSizeProperties"
                                        :calculation-result-arr="calculationResultArr"
                                        @select-cable="selectCableSize"
                                        @close-popup="isCableSizePopUpOpen = false"
                                        @setNewInputValues="getNewValuesFromPopUpInputForm"
                                    />
                                </keep-alive>
                                <div class="Cable-Size">
                                    <div class="label-value">
                                        Cable Size
                                        <el-tooltip
                                            content="Open Cable Size Calculator"
                                            placement="top">
                                            <i
                                                class="button-dark-theme-icons el-icon-info icons-circle'"
                                                style="margin-left: 5px"/>
                                        </el-tooltip>
                                    </div>
                                    <button
                                        class="edit-btn"
                                        :disabled="!editEnabled"
                                        @click="getVoltageAndCurrent">
                                        <p v-if="!receivingVoltageAndCurrent">{{ `${cableSizeWithUnit}, ${voltageDrop}%` }}</p>
                                        <i
                                            v-else
                                            class="el-icon-loading"/>
                                    </button>
                                </div>
                            </div>
                            <div class="sappane-label range-string">
                                <button
                                    class="prop-button"
                                    :disabled="!editEnabled"
                                    @click="updateDcCableProperties">Update</button>
                                <button
                                    class="prop-button"
                                    :disabled="!editEnabled"
                                    @click="cancelDcCableProperties">Reset</button>
                            </div>
                        </div>
                        <div
                            v-else
                            id="1"
                            class="hidden">
                            <div v-if="isRequestAddOn">
                                <div>Buy DC Stringing Add-on to use this feature.</div>
                                <button
                                    class="dc-add-on"
                                    @click="requestAddOn">Request Add-on</button>
                            </div>
                            <div
                                v-else
                                class="req-addon-msg">Your Request has been submitted <br>successfully</div>
                        </div>
                    </div>
                    <div class="border-pro" />
                    <br >
                    <div class="sappane-label">
                        <div
                            class="sappane-label inverter-propss string-range-com"
                            @click="handleCollapsable('3')">
                            <div>MPPTs</div>
                            <div v-if="dropClose == 3"><img
                                :src="dropdownArrowUp"
                                width="20px"
                                height="20px" ></div>
                            <div v-else><img
                                :src="dropdownArrowDown"
                                width="20px"
                                height="20px" ></div>
                        </div>
                        <div
                            v-if="isAddOnEnabled"
                            id="3"
                            class="hidden">
                            <Mppt
                                :properties-data="propertiesData"
                                :editEnabled="editEnabled"
                            />
                        </div>
                        <div
                            v-else
                            id="3"
                            class="hidden">
                            <div v-if="isRequestAddOn">
                                <div>Buy DC Stringing add-on to use this feature.</div>
                                <button
                                    class="dc-add-on"
                                    @click="requestAddOn">Request Add-on</button>
                            </div>
                            <div
                                v-else
                                class="req-addon-msg">Your Request has been submitted <br>successfully</div>
                        </div>
                    </div>
                </div>
                <div
                    v-else
                    class="old-inverter">
                    This inverter doesn’t support stringing.
                    <br >In order to do stringing select other inverter.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import axios from 'axios';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import Mppt from './mppt/index.vue';
import dropdownArrowUp from '../../../../assets/drop/dropdown-arrow-up.png';
import dropdownArrowDown from '../../../../assets/drop/dropdown-arrow-down.png';
import cableSizePopUp from '../../../../components/cableSize/cableSizePopUp1.vue';

import ModalBox from './modalBox.vue';
import API from '@/services/api/';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';
import { useDesignStore } from '../../../../stores/design';
// TODO: remove all the variables/functions releated to string range.

export default {
    name: 'InverterProperties',
    components: {
        cableSizePopUp,
        PropertiesButtonsBar,
        Mppt,
        ModalBox,
    },
    mixins: [
        validationMixins.azimuthValidation,
        validationMixins.lengthValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            required: true,
            default() {
                return {
                    azimuth: 0,
                    mountHeight: 0.001,
                    mountHeightEditable: true,
                    ajbToggle: false,
                    update: () => {},
                    allSubarrays: [],
                    mppts: [],
                    onclickAJBToggle: () => {},
                    designId: 0,
                    attachedMaxCableLength: () => 1,
                    manufacturer,
                    getStringingData,
                    getOptimizerPanelList,
                    optimizerStringLength,
                    getOptimizerList,
                    optimizer,
                    optimizerPanel,
                    getOptimizerCount,
                    optimizerStatus,
                    inverter,
                    getPanelCount,
                };
            },
        },
    },
    data() {
        return {
            dcCableModuleToDcbdCableType: this.propertiesData.dcCable.moduleToDcbd.cableType,
            cableSize: this.propertiesData.cableSize,
            dcCableModuleToDcbdCableSizeMM: this.propertiesData.dcCable.moduleToDcbd.cableSizeMM,
            dcCableModuleToDcbdCableSizeAWG: this.propertiesData.dcCable.moduleToDcbd.cableSizeAWG,
            dcCabletoInverterCableType: this.propertiesData.dcCable.toInverter.cableType,
            dcCabletoInverterCableSizeMM: this.propertiesData.dcCable.toInverter.cableSizeMM,
            dcCabletoInverterCableSizeAWG: this.propertiesData.dcCable.toInverter.cableSizeAWG,

            valuesChanged: false,
            azimuth: this.propertiesData.azimuth,
            mountHeight: this.propertiesData.mountHeight,
            name: this.propertiesData.name,
            mountHeightEditable: this.propertiesData.mountHeightEditable,
            dropdownArrowUp,
            dropdownArrowDown,
            dropClose: false,
            designId: this.propertiesData.designId,
            dcCable: {
                cableType: [],
                cableSize: [],
            },
            isAddOnEnabled: '',
            isRequestAddOn: true,
            prevComId: null,
            ajbToggle: this.propertiesData.ajbToggle,
            isCableSizePopUpOpen: false,
            receivingVoltageAndCurrent: false,
            deratingFactor: 0,
            voltageDrop: 0.99,
            calculationResultArr: [],
            cableSizeProperties: {
                designId: 0,
                wireSizeUnit: '',
                deratingFactor: 0,
                voltage: 0,
                current: 0,
                maxCableLength: this.propertiesData.attachedMaxCableLength(),
                size: 4,
            },
            moduleId: this.propertiesData.moduleId,

            optimizer: this.propertiesData.optimizer,
            optimizerStringLength: this.propertiesData.optimizerStringLength,
            optimizerPanel: this.propertiesData.optimizerPanel || this.propertiesData.getOptimizerPanelList()[0],
            optimizerPanelMake: this.propertiesData.optimizer && this.propertiesData.optimizer.optimizer.Make,
            optimizerList: this.propertiesData.optimizerList,
            optimizerPanelList: this.propertiesData.getOptimizerPanelList(),
            panelCount: this.propertiesData.getPanelCount(),
            optimizerCount: this.propertiesData.getOptimizerCount(),
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled,
        }),
        ...mapState(useStudioTextTopBarStore, {
            topBarCompleteEnabled: state => state.completeEnabled,
            topBarCancelEnabled: state => state.cancelEnabled
        }),
        ...mapState(useDesignStore, {
            wiringUnit: state => (state.versions.setting.wiring_unit == 'mmsq' ? 'sq.mm' : state.versions.setting.wiring_unit),
            designSetting: state => state.versions.setting
        }),
        updateEnabled() {
            return (
                !this.creationMode && this.editEnabled && this.valuesChanged && !this.errors.any()
            );
        },
        cancelEnabled() {
            return !this.creationMode && this.editEnabled && this.valuesChanged;
        },
        resetEnabled() {
            return this.creationMode && this.valuesChanged;
        },
        mountHeightEnabled() {
            return this.mountHeightEditable;
        },
        cableSizeWithUnit() {
            return `${this.cableSize} ${this.wiringUnit === 'sq.mm' ? 'mm2' : 'AWG'}`;
        },
        getOptimizerModuleMake() {
            if (this.optimizer) {
                console.log(this.optimizer.optimizer.Make, 'optimizer_make');
                return this.optimizer.optimizer.Make;
            }
            return '';
        },
        showOptimizerSappane() {
            if (this.propertiesData.manufacturer == 'SolarEdge') {
                return true;
            }
            return false;
        },
        maxOptimizerPanelLength() {
            if (this.optimizer) {
                return this.optimizer.maxOptimizerPanelLength;
            }

            return 1;
        },
        isInputStringLengthValid() {
            if (this.optimizerStringLength >= 1 && this.optimizerStringLength <= this.maxOptimizerPanelLength) {
                return 1;
            }
            return 0;
        },
    },
    watch: {
        optimizerPanelMake() {
            for (const x in this.optimizerList) {
                if (this.optimizerList[x].optimizer.Make === this.optimizerPanelMake) {
                    this.optimizer = this.optimizerList[x];
                    return;
                }
            }
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                azimuth: vm.azimuth,
                mountHeight: vm.mountHeight,
                name: vm.name,
                cableSize: vm.cableSize,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (this.azimuth !== this.propertiesData.azimuth
                        || this.mountHeight !== this.propertiesData.mountHeight || this.name !== this.propertiesData.name
                        || this.cableSize !== this.propertiesData.cableSize) {
                        this.valuesChanged = true;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, true);
                        }
                    }
                    else {
                        this.valuesChanged = false;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
                        }
                    }
                });
            },
        );
        // no shortcuts in creation mode since
        // it will override complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) {
                this.$mousetrap.bind('enter', () => {
                    if (this.updateEnabled) this.updateProperties();
                });
            }
            if (!this.topBarCancelEnabled) {
                this.$mousetrap.bind('esc', () => {
                    if (this.cancelEnabled) this.resetProperties();
                });
            }
        }
        this.fetchAddOnsPermissions();
    },
    beforeDestroy() {
        // no unbinding shortcuts in creation mode since
        // it will unbind complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) this.$mousetrap.unbind('enter');
            if (!this.topBarCancelEnabled) this.$mousetrap.unbind('esc');
        }
    },
    methods: {
        async optimizerPanelSelected(panelSelected) {
            this.optimizerList = await this.propertiesData.getOptimizerList(panelSelected.id);
        },
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update({
                azimuth: this.azimuth,
                mountHeight: this.mountHeight,
                name: this.name,
                cableSize: this.cableSize,
            }, !this.errors.any());
        },
        resetProperties() {
            this.azimuth = this.propertiesData.azimuth;
            this.mountHeight = this.propertiesData.mountHeight;
            this.name = this.propertiesData.name;
            this.cableSize = this.propertiesData.cableSize;
        },
        async requestAddOn() {
            console.log(localStorage.getItem('user'));
            const addOnKey = JSON.parse(localStorage.getItem('user')).is_manual_stringing_enabled;
            try {
                const addOnReq = { add_on: 'manual_stringing_enabled' };
                const response = await API.FEATURE_STATUS.POST_FEATURES_STATUS(addOnReq);
                if (response.data.status === 200) {
                    this.isRequestAddOn = false;
                }
            }
            catch (e) {
                console.error(e);
            }
        },
        async resetStringRange() {
            if (this.propertiesData.mppts[0] !== undefined &&
                this.propertiesData.mppts[0].linkedSubarrays[0] !== undefined) {
                const stringRange = await this.propertiesData.getStringingData(this.propertiesData.mppts[0].linkedSubarrays[0].getModuleId());
                this.minimumRange = stringRange.min;
                this.maximumRange = stringRange.max;
                this.updateStringRange();
            }
            else {
                console.error('Not able to reset the stringing data.');
            }
        },
        updateOptimizer() {
            const newOptimizerValue = {
                optimizer: this.optimizer,
                optimizerStringLength: this.optimizerStringLength,
                optimizerPanel: this.optimizerPanel.make,
            };
            this.propertiesData.update(newOptimizerValue, !this.errors.any());
        },

        updateStringRange() {
            this.propertiesData.stringRange.minimum = this.minimumRange;
            this.propertiesData.stringRange.maximum = this.maximumRange;
            this.propertiesData.setStringRange({
                min: this.minimumRange,
                max: this.maximumRange,
            });
        },
        updateDcCableProperties() {
            this.updateProperties();
            this.propertiesData.cableSize = this.cableSize;
            this.propertiesData.dcCable.moduleToDcbd.cableType = this.dcCableModuleToDcbdCableType;
            this.propertiesData.dcCable.moduleToDcbd.cableSizeMM = this.dcCableModuleToDcbdCableSizeMM;
            this.propertiesData.dcCable.moduleToDcbd.cableSizeAWG = this.dcCableModuleToDcbdCableSizeAWG;
            this.propertiesData.dcCable.toInverter.cableType = this.dcCabletoInverterCableType;
            this.propertiesData.dcCable.toInverter.cableSizeMM = this.dcCabletoInverterCableSizeMM;
            this.propertiesData.dcCable.toInverter.cableSizeAWG = this.dcCabletoInverterCableSizeAWG;
            this.propertiesData.setDcCableProperties({
                moduleToDcdb: {
                    cableType: this.dcCableModuleToDcbdCableType,
                    cableSizeMM: this.dcCableModuleToDcbdCableSizeMM,
                    cableSizeAWG: this.dcCableModuleToDcbdCableSizeAWG,
                },
                toInverter: {
                    cableType: this.dcCabletoInverterCableType,
                    cableSizeMM: this.dcCabletoInverterCableSizeMM,
                    cableSizeAWG: this.dcCabletoInverterCableSizeAWG,
                },
            });
        },
        cancelDcCableProperties() {
            this.resetProperties();
            this.cableSize = this.propertiesData.cableSize;
            this.dcCableModuleToDcbdCableType = this.propertiesData.dcCable.moduleToDcbd.cableType;
            this.dcCableModuleToDcbdCableSizeMM = this.propertiesData.dcCable.moduleToDcbd.cableSizeMM;
            this.dcCableModuleToDcbdCableSizeAWG = this.propertiesData.dcCable.moduleToDcbd.cableSizeAWG;
            this.dcCabletoInverterCableType = this.propertiesData.dcCable.toInverter.cableType;
            this.dcCabletoInverterCableSizeMM = this.propertiesData.dcCable.toInverter.cableSizeMM;
            this.dcCabletoInverterCableSizeAWG = this.propertiesData.dcCable.toInverter.cableSizeAWG;
        },

        async fetchAddOnsPermissions() {
            const addOnKey = JSON.parse(localStorage.getItem('user')) === null ? false : JSON.parse(localStorage.getItem('user')).is_manual_stringing_enabled;
            this.isAddOnEnabled = addOnKey;
        },
        handleCollapsable(id) {
            if(this.editEnabled){
                if (this.prevComId !== id) {
                    this.prevComId ? document.getElementById(this.prevComId).classList.remove('open') : '';
                    this.dropClose = id;
                    document.getElementById(id).classList.add('open');
                    this.prevComId = id;
                }
                else if (this.prevComId === id) {
                    document.getElementById(this.prevComId).classList.remove('open');
                    this.dropClose = false;
                    this.prevComId = null;
                }
            }
        },
        toggle() {
            this.propertiesData.onclickAJBToggle(this.ajbToggle);
        },

        async getVoltageAndCurrent() {
            if (!this.isCableSizePopUpOpen) {
                this.receivingVoltageAndCurrent = true;
                // will receive data from backend
                try {
                    const resp = await axios.post(`api/designs/${this.designId}/get_max_IV/`, {
                        maxLength: this.propertiesData.attachedMaxCableLength(),
                        moduleID: this.moduleId,
                    });
                    const { voltage, current } = resp.data;
                    this.cableSizeProperties.voltage = voltage.toFixed(2);
                    this.cableSizeProperties.current = current.toFixed(2);
                    this.cableSizeProperties.designId = this.designId;
                    this.cableSizeProperties.wireSizeUnit = this.wiringUnit;
                    this.cableSizeProperties.deratingFactor = this.designSetting.constant_losses.derating_factor;
                }
                catch (error) {
                    console.error(error);
                }
                try {
                    const resp = await axios.post(`api/designs/${this.designId}/get_wire_size/`, {
                        voltage: parseFloat(this.cableSizeProperties.voltage),
                        current: parseFloat(this.cableSizeProperties.current),
                        powerFactor: 1,
                        deratingFactor: this.cableSizeProperties.deratingFactor,
                        length: parseFloat(this.cableSizeProperties.maxCableLength),
                        voltageDrop: this.voltageDrop,
                    });
                    const response = resp.data;

                    if (this.calculationResultArr.length) {
                        this.calculationResultArr = [];
                    }

                    for (let i = 0; i < response.sqmm.length; i++) {
                        this.calculationResultArr.push({
                            id: i,
                            size: this.cableSizeProperties.wireSizeUnit === 'sq.mm' ? response.sqmm[i] : response.AWG[i],
                            rating: response.Imax[i],
                            voltageDrop: response.vdrop[i],
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }
                this.receivingVoltageAndCurrent = false;
                this.isCableSizePopUpOpen = true;
            }
            else {
                this.isCableSizePopUpOpen = false;
            }
        },
        selectCableSize(row) {
            this.cableSize = row.size;
            this.voltageDrop = row.voltageDrop;
            this.cableSizeProperties.size = row.size;
        },
        getNewValuesFromPopUpInputForm(values) {
            this.deratingFactor = values.deratingFactor;
        },
    },

};
</script>
<style lang="scss" scoped>
@import "../../../../styles/components/input";
@import "../../../../styles/components/button.scss";
</style>

<style scoped>
#inverterProperties .dataProperties {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#inverterProperties .dataProperties .sappane-label {
  padding-right: 12px;
}

#inverterProperties ::-webkit-scrollbar {
  display: none;
}

#inverterProperties .vb > .vb-dragger > .vb-dragger-styler {
  visibility: hidden;
}

#inverterProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
  visibility: visible;
}

.string-range-com {
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.dc-cable-pro {
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.range-string {
  display: flex;
  justify-content: space-around;
  margin-bottom: 7.5%;
}
.prop-button {
  width: 40%;
  background: #151515;
  color: white;
  padding: 4px;
  border: 1px solid white;
  cursor: pointer;
  border-radius: 4px;
  outline: none;
}
.prop-button:hover {
  background-color: #7b7d7d;
  color: black;
}
.module {
  color: #999999;
  padding-bottom: 7px;
}
.inverter-heading {
  color: white;
  display: flex;
  justify-content: space-between;
  font-family: "Helvetica neue", "Times", serif;
  font-size: 0.9vw;
  text-decoration: none;
  padding-top: 10px;
  padding-bottom: 10px;
  font-weight: 500;
}
.border-pro {
    border-top: 1px solid #606060;
    margin: 5px 0;
}
.sappane-input-value option {
  background: #000000;
}
.old-inverter {
  font-family: HelveticaNeue;
  font-size: 11px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: center;
  color: #e62525;
  margin: 18px 2px 0 0px;
}
.hidden {
  display: none;
}
.hidden.open {
  display: block;
}
/* .button-actions{
  width: 6vw;
  background-color: inherit !important;
  font-size: 0.73vw !important;
  border: 1px solid white;
  color: white;
  padding: 1vh !important;
  cursor: pointer;
}

.button-actions:disabled {
  background-color: inherit !important;
  border: 1px solid rgba(225, 225, 225, 0.4) !important;
  color: #4c4c4c !important;
} */
</style>
<style scoped>
.dc-add-on {
  width: 50%;
  padding: 4px;
  border: none;
  color: #fff;
  background-color: #3e99f7;
  font-size: 10px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 6px;
}
.req-addon-msg {
  width: 100%;
  margin: 6px 0 2px;
  border-radius: 35px;
  color: #000000;
  padding: 8px 3px 17px 8px;
  font-size: 12px;
  height: 20px;
  text-align: center;
  font-family: HelveticaNeue;
  font-weight: normal;
  font-stretch: normal;
  font-style: italic;
  line-height: 1.38;
  background-image: linear-gradient(102deg, #ffffff, #deeaf5 50%, #f7e6df 100%);
}
.inverter-prop,
.mppt-list {
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.optimizer-label {
  height: 25px;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
}
.optimizer-value {
  width: 9.5ch;
  right: 0;
  font-size: small;
  text-align: right;
  background: transparent;
  padding: 2px;
  margin-top: 1.5px
}
.stringLength-input{
    width: 10ch;
    height: 26px;
    padding: 3px 1px;
}
.border-danger{
  border: 1px solid red !important;
}
button:disabled{
  cursor: not-allowed !important;
}
.el-input--suffix .el-input__inner{
  padding: 10px !important;
}
.switch{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.Cable-Size{
    display:flex;
    justify-content: space-between;
    margin-bottom: 3%;
    margin-top: 1.5%;
}

.edit-btn{
    width: 35%;
    height: 25px;
    border-radius: 3px;
    background-color: transparent;
    border: solid 1px #5f5f5f;
    color: #fff;
    font-size: x-small;
    font-weight: 300;
    cursor: pointer;
    transition: all .1s ease-in-out;
}
.edit-btn:hover {
    background-color: #999999;
    transition: all .1s ease-in-out;
}
.button-actions-class{
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    border-radius: 4px;
    width: 6vw;
    background-color: inherit !important;
    font-size: 0.73vw !important;
    border: 1px solid white;
    color: white;
    padding: 1vh !important;
}
</style>
