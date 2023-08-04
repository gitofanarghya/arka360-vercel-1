<template>
    <div
        id="arrayProperties"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        element-loading-text="Loading..."
        element-loading-spinner="el-icon-loading"
        class=""
        style="overflow:hidden"> 
        <div class="sappane-label">
            Name
            <input
                v-model="name"
                :name="'name'"
                class="sappane-input-value"
                style="position: relative; top: -4px;"
            />
        </div>
        <hr/><br/>
        <div
            class="scroll-area " style="overflow:auto;" >
            <div class="dataProperties scroll-subarray">
                <div class="sappane-label sappane-label-panel">
                    <div>Panel Selection</div>
                    <div>
                        <div>
                            <infinite-scroll-dropdown-panel
                                :panel.sync="selectedPanel"
                                :module-id="defaultModuleId"
                                theme="darkDropdownWithFilters"/>
                        </div>
                    </div>
                </div>
                <div
                    v-show="enableSwitch"
                    class="sappane-label sappane-label-panel">
                    <div>Bifacial</div>
                        <el-switch
                            style="float: right;"
                            v-model="bifacialEnabled"
                            class="sappane-switch"/>
                </div>
                <div class="sappane-label sappane-label-panel" style="display: flex; justify-content: space-between;">
                    <div style="display: flex; justify-content: flex-start;">
                        <div>Template</div>
                        <el-tooltip 
                        placement="top" popper-class="designStudioToolTip">
                    
                            <template #content>Solar panel template are of two types i.e.,<br />Tilted Mount and Roof Mount. Tilted Mount<br/>solar panels are installed directly onto a<br/>surface for a streamlined appearance, while<br/>Roof Mount solar panels are installed at an <br/>angle to optimize sunlight capture.</template>
                            <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                        </el-tooltip>
                    </div>
                        <el-select
                            style="width: 55%; float: right;"
                            v-model="mountType"
                            :disabled="!editEnabled"
                            class="sappane-select"
                            placeholder="Select"
                            popper-class="darkDropdown">
                            <el-option
                                :value="CONSTANTS.SUBARRAY_RACK_STYLE_FLUSH"
                                label="Tilted Mount"/>
                            <el-option
                                :value="CONSTANTS.SUBARRAY_RACK_STYLE_FIXED"
                                label="Fixed Mount"/>
                            <el-option 
                                :value="CONSTANTS.SUBARRAY_RACK_STYLE_EWRACKING"
                                label="East West Racking"/>
                        </el-select>
                </div>
                <div
                    v-if="mountType==CONSTANTS.SUBARRAY_RACK_STYLE_FIXED"
                    class="sappane-label sappane-label-panel">
                    <div>Structure Type</div>
                    <el-select
                        style="width: 55%; float: right;"
                        v-model="structureType"
                        :disabled="!editEnabled"
                        class="sappane-select"
                        placeholder="Select"
                        popper-class="darkDropdown">
                        <el-option
                            value="Default Fixed Tilt"
                            label="Default Fixed Tilt"/>
                        <el-option
                            value="Pergola"
                            label="Pergola"/>
                        <el-option
                            value="ArkaPergola1"
                            label="PGIN-01S1-250-D01"/>
                        <el-option
                            value="Low Foundation Fixed Tilt"
                            label="Low Foundation Fixed Tilt"/>
                        <el-option
                            value="Four MMS One Leg"
                            label="TPSSL 4MMS 1 Leg"/>
                        <el-option
                            value="Four MMS Two Leg"
                            label="TPSSL 4MMS 2 Leg"/>
                        <el-option
                            value="Ballast Type 1"
                            label="TPSSL Ballast type 1"/>
                        <el-option
                            value="Ballast Type 2"
                            label="TPSSL Ballast type 2"/>
                        <el-option
                            value="Ballast Type 3"
                            label="TPSSL Ballast type 3"/>
                        <el-option
                            value="General Ballast"
                            label="General Ballast"/>
                        <el-option
                            value="UNIRAC RM 5"
                            label="UNIRAC RM 5"/>
                        <el-option
                            value="UNIRAC RM 10"
                            label="UNIRAC RM 10"/>
                        <el-option
                            value="Ground Mount MMS"
                            label="TPSSL Ground Mount MMS"/>
                        <el-option
                            value="Elevated MMS"
                            label="TPSSL Elevated MMS"/>
                        <el-option
                            value="Fixed Tilt 2500mm"
                            label="Fixed Tilt 2500mm"/>
                    </el-select>
                </div>
                <div
                    v-if="mountType==CONSTANTS.SUBARRAY_RACK_STYLE_FLUSH"
                    class="sappane-label sappane-label-panel">
                    <div>Structure Type</div>
                    <el-select
                        :disabled="true"
                        v-model="structureType"
                        class="sappane-select"
                        placeholder="Select"
                        popper-class="darkDropdown">
                        <el-option
                            value="Default Fixed Tilt"
                            label="N/A"/>
                    </el-select>
                </div>
                <div
                    v-if="mountType==CONSTANTS.SUBARRAY_RACK_STYLE_EWRACKING"
                    class="sappane-label sappane-label-panel">
                    <div>Structure Type</div>
                    <el-select
                        style="width: 55%; float: right;"
                        v-model="structureType"
                        class="sappane-select"
                        placeholder="Select"
                        popper-class="darkDropdown">
                        <el-option
                            value="Low Foundation Fixed Tilt"
                            label="Low Foundation Fixed Tilt"/>
                    </el-select>
                </div>
                <!-- <div class="sappane-label">
                    Structure Type
                    <el-form-item label="Structure Template">
                        <el-select
                            popper-class="darkDropdown">
                            <el-option
                                label="Default Fixed Tilt"
                                value="Default Fixed Tilt"/>
                            <el-option
                                label="Pergola"
                                value="Pergola"/>
                            <el-option
                                label="Low Foundation Fixed Tilt"
                                value="Low Foundation Fixed Tilt"/>
                            <el-option
                                label="TPSSL 4MMS 1 Leg"
                                value="Four MMS One Leg"/>
                            <el-option
                                label="TPSSL 4MMS 2 Leg"
                                value="Four MMS Two Leg"/>
                            <el-option
                                label="TPSSL Ballast type 1"
                                value="Ballast Type 1"/>
                            <el-option
                                label="TPSSL Ballast type 2"
                                value="Ballast Type 2"/>
                            <el-option
                                label="TPSSL Ballast type 3"
                                value="Ballast Type 3"/>
                            <el-option
                                label="General Ballast"
                                value="General Ballast"/>
                            <el-option
                                label="UNIRAC RM 5"
                                value="UNIRAC RM 5"/>
                            <el-option
                                label="UNIRAC RM 10"
                                value="UNIRAC RM 10"/>
                            <el-option
                                label="TPSSL Ground Mount MMS"
                                value="Ground Mount MMS"/>
                            <el-option
                                label="TPSSL Elevated MMS"
                                value="Elevated MMS"/>
                        </el-select>
                    </el-form-item>
                </div> -->
                <!-- <div class="sappane-label">
                    Panel
                    <div style="width: 65%; float: right;">
                        <div>
                            <infinite-scroll-dropdown-panel
                                :panel.sync="selectedPanel"
                                :module-id="defaultModuleId"
                                theme="darkDropdownWithFilters"/>
                        </div>
                    </div>
                </div> -->
                
                <div
                    v-if="CONSTANTS.STRUCTURE_TYPES.includes(structureType)"
                    class="sappane-label">
                    Tilt
                    <span>
                        <label>
                            <input
                                v-validate="tiltValidation"
                                :disabled="!editEnabled || flushMountMode"
                                v-model.number="tilt"
                                class="sappane-input-value"
                                name="Tilt"
                                autocomplete="off">
                        </label>
                    </span>
                    <p>
                        <span>{{ errors.first('Tilt') }}</span>
                    </p>
                </div>
                <div
                    v-else
                    class="sappane-label">
                    Tilt
                    <span>
                        <el-tooltip
                            content="Tilt of the Structure cannot be Edited"
                            placement="top-start">
                            <label>
                                <input
                                    :disabled="true"
                                    v-model.number="tilt"
                                    class="sappane-input-value"
                                    name="Tilt"
                                    placeholder="Select"
                                    autocomplete="off">
                            </label>
                        </el-tooltip>
                    </span>
                </div>
                <div class="sappane-label">
                    Azimuth
                    <span>
                    <label>
                    <el-select
                        v-validate="azimuthValidation"
                        v-model.number="azimuth"
                        :disabled="!editEnabled || flushMountMode"
                        class="sappane-select sappane-input-value"
                        filterable
                        allow-create
                        popper-class="darkDropdown"
                        name="Azimuth"
                        style="width: 25%;">
                        <el-option
                            v-for="azimuth_ in possibleAzimuths"
                            :key="azimuth_"
                            :label="azimuth_"
                            :value="azimuth_">
                            <div class="possibleAzimuthDropdown">
                                <span> {{ azimuth_ }} </span>
                                <i
                                    :style="{
                                        transform:
                                            'rotate(' +
                                            (Number(azimuth_) + 90) +
                                            'deg)',
                                    }"
                                    class="el-icon-back"/>
                            </div>
                        </el-option>
                    </el-select>
                    </label>
                    </span>
                    <p>
                        <span>{{ errors.first('Azimuth') }}</span>
                    </p>
                </div>

                <div class="sappane-label" >
                    Intra Row Spacing
                    <el-tooltip
                        placement="top" popper-class="designStudioToolTip">
                        <template #content>Spacing in between east <br/>and west side of a row.</template>
                        <button class="button-dark-theme-icons el-icon-info icons-circle'"/>      
                    </el-tooltip>
                    <span>
                        <label>
                            <input-length
                                v-model="intraRowSpacing"
                                :name="'Intra Row Spacing'"
                                :disabled="!editEnabled"
                                :metric-validation="lengthValidation"
                                :class-input="'sappane-input-value'"
                            />
                        </label>
                    </span>
                    <p>
                        <span>{{ errors.first('Intra Row Spacing') }}</span>
                    </p>
                </div>
                <div
                id="rowSpacingModeToggle"
                class="sappane-label sappane-radio-wrapper">
                    Inter Row Spacing Mode
                    <el-radio-group v-model="interRowSpacingMode">
                        <el-radio-button
                            :disabled="!editEnabled"
                            :label="CONSTANTS.ROW_SPACING_MODE_AUTO"/>
                        <el-radio-button
                            :disabled="!editEnabled"
                            :label="CONSTANTS.ROW_SPACING_MODE_MANUAL"/>
                    </el-radio-group>
                </div>
                <div class="sappane-label">
                    Inter Row Spacing
                    <el-tooltip
                        placement="top" popper-class="designStudioToolTip">
                        <template #content>Distance between the <br/>east of one row and west<br/>of adjacent row.</template>
                        <button class="button-dark-theme-icons el-icon-info icons-circle'"/>      
                    </el-tooltip>
                    <input-length
                        v-model="interRowSpacing"
                        :name="'Row Spacing'"
                        :disabled="!editEnabled || autoInterRowSpacingMode"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Row Spacing') }}</span>
                    </p>
                </div>
                
                <div class="sappane-label">
                    Table Spacing
                    <span>
                        <label>
                            <input-length
                                v-model="tableSpacing"
                                :name="'Table Spacing'"
                                :disabled="!editEnabled"
                                :metric-validation="lengthValidation"
                                :class-input="'sappane-input-value'"
                            />
                        </label>
                    </span>
                    <p>
                        <span>{{ errors.first('Table Spacing') }}</span>
                    </p>
                </div>
                <div class="sappane-label">
                    <h3 v-if="flagForUS">Array Properties</h3>
                    <h3 v-else>Table Properties</h3>
                </div>
                <div class="table-prop">
                    <div
                        class="sappane-label">
                        Array Rows
                        <label>
                            <input
                                v-validate="unitsValidation"
                                v-model.number="tableSizeUp"
                                :disabled="!editEnabled"
                                class="sappane-input-value"
                                name="Array Rows"
                                autocomplete="off">
                        </label>
                        <p>
                            <span>{{ errors.first('Array Rows') }}</span>
                        </p>
                    </div>
                    <div
                        class="sappane-label">
                        Array Columns
                        <label>
                            <input
                                v-validate="unitsValidation"
                                v-model.number="tableSizeWide"
                                :disabled="!editEnabled"
                                class="sappane-input-value"
                                name="Array Columns"
                                autocomplete="off">
                        </label>
                        <p>
                            <span>{{ errors.first('Array Columns') }}</span>
                        </p>
                    </div>
                    <div
                        id="select_toggle"
                        class="sappane-label sappane-radio-wrapper">
                        Orientation
                        <el-radio-group v-model="panelOrientation">
                            <el-radio-button
                                :disabled="!editEnabled"
                                :label="CONSTANTS.PANEL_ORIENTATION_LANDSCAPE"/>
                            <el-radio-button
                                :disabled="!editEnabled"
                                :label="CONSTANTS.PANEL_ORIENTATION_PORTRAIT"/>
                        </el-radio-group>
                    </div>
                    <div
                        :v-show="!flushMountMode"
                        class="sappane-label" style="display: flex; justify-content: space-between;">
                        <div style="display: flex; justify-content: flex-start;">
                            <div>Mount Height</div>
                            <el-tooltip
                            placement="top" popper-class="designStudioToolTip">
                        
                                <template #content>The mount height of solar panel is the<br/>distance between its bottom edge and the
                                    <br/>mounting surface. It affects system<br/>performance by impacting the amount of<br/>
                                    sunlight captured and may also increase<br/>wind damage risk.</template>
                                <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                                    
                            </el-tooltip>
                            </div>
                        <input-length   
                            v-model="mountHeight"
                            :name="'Mount Height'"
                            :disabled="!editEnabled"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value-1'"
                        />
                        
                    </div>
                    <p class="sappane-label ">
                        <span>{{ errors.first('Mount Height') }}</span>
                    </p>
                    
                    <div
                        class="sappane-label">
                        Vertical Module Spacing
                        <input-length
                            v-model="moduleSpacingUp"
                            :name="'Vertical Module Spacing'"
                            :disabled="!editEnabled"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p>
                            <span>{{ errors.first('Vertical Module Spacing') }}</span>
                        </p>
                    </div>
                    <div
                        class="sappane-label">
                        Horizontal Module Spacing
                        <input-length
                            v-model="moduleSpacingWide"
                            :name="'Horizontal Module Spacing'"
                            :disabled="!editEnabled"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p>
                            <span>{{ errors.first('Horizontal Module Spacing') }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    <properties-buttons-bar
        :creation-mode="buttonsBarCreationMode"
        :update-enabled="updateEnabled"
        :cancel-enabled="cancelEnabled"
        :reset-enabled="resetEnabled"
        :update-properties="updateProperties"
        :cancel-properties="cancelProperties"
        :reset-properties="resetProperties"
        :update-button-text="updateButtonText"/>
    </div>
</template>
<script>
// TODO
import PropertiesButtonsBar from '@/pages/studio/sappane/properties/PropertiesButtonsBar.vue';
import validationMixins from '@/pages/studio/sappane/properties/validationMixins';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';
import { mapState } from 'pinia';
import { collapseDiv } from './collapseCommon';

import dropdownArrowUp from '../../../../assets/drop/dropdown-arrow-up.png';
import dropdownArrowDown from '../../../../assets/drop/dropdown-arrow-down.png';

import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import {
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_EWRACKING,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
    STRUCTURE_TYPES,
} from '../../../../core/coreConstants';
import { getPropertiesForSubarrayForAutoFix } from '../../../../core/structure/utils/structureValidationUtils';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'EwrackProperties',
    components: {
        infiniteScrollDropdownPanel,
        PropertiesButtonsBar,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.tiltValidation,
        validationMixins.azimuthValidation,
        validationMixins.unitsValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    moduleId: 0,
                    tilt: 0,
                    structureType: '',
                    azimuth: 0,
                    tableSpacing: 0,
                    tableSizeUp: 0,
                    tableSizeWide: 0,
                    panelOrientation: '',
                    intraRowSpacing: 0,
                    interRowSpacing: 0,
                    interRowSpacingMode: '',
                    mountHeight: 0,
                    moduleSpacingUp: 0,
                    moduleSpacingWide: 0,
                    mountType: '',
                    update: () => {},
                    updateRequired: false,
                    getParent: () => {},
                    getPossibleAzimuths: () => {},
                    getOptimisedRowSpacing: () => {},
                    getFlushMountProperties: () => {},
                    getFixedMountProperties: () => {},
                    getEastWestRackingProperties: () => {},
                    customFillFaceMode: false,
                    completeCustomFillFace: () => {},
                    cancelCustomFillFace: () => {},
                    subarrayCreated: () => {},
                    structureErrors: [],
                    structureErrorAutoFixFunction: () => 0,
                    getDcSize: () => 0,
                    getAcSize: () => 0,
                    getModuleQuantity: () => 0,
                    updateInverters: () => {},
                    updateInverterAddition: () => {},
                    updateInverterDeletion: () => {},
                    inverters: [],
                    bifacialEnabled: false,
                };
            },
        },
        updateGettersFlag: {
            type: Number,
            default() {
                return 0;
            },
        },
    },
    data() {
        return {
            selectedPanel: {},
            valuesChanged: false,
            name: this.propertiesData.name,
            tilt: this.propertiesData.tilt,
            structureType: this.propertiesData.structureType,
            azimuth: this.propertiesData.azimuth,
            possibleAzimuths: this.propertiesData.getPossibleAzimuths(),
            interRowSpacing: this.propertiesData.interRowSpacing,
            intraRowSpacing: this.propertiesData.intraRowSpacing,
            tableSpacing: this.propertiesData.tableSpacing,
            tableSizeUp: this.propertiesData.tableSizeUp,
            tableSizeWide: this.propertiesData.tableSizeWide,
            panelOrientation: this.propertiesData.panelOrientation,
            mountHeight: this.propertiesData.mountHeight,
            moduleSpacingUp: this.propertiesData.moduleSpacingUp,
            moduleSpacingWide: this.propertiesData.moduleSpacingWide,
            mountType: this.propertiesData.mountType,
            defaultModuleId: this.propertiesData.moduleId,
            updateAcSize: 0,
            bifacialEnabled: this.propertiesData.bifacialEnabled,
            dropdownArrowUp: dropdownArrowUp,
            dropdownArrowDown: dropdownArrowDown,
            prevComId: null,
            dropClose: false,
            interRowSpacingMode: this.propertiesData.interRowSpacingMode,
            // flagForUS:false,

        };
    },
    nonReactiveData() {
        return {
            CONSTANTS: {
                SUBARRAY_RACK_STYLE_FIXED,
                SUBARRAY_RACK_STYLE_FLUSH,
                SUBARRAY_RACK_STYLE_EWRACKING,
                ROW_SPACING_MODE_AUTO,
                ROW_SPACING_MODE_MANUAL,
                PANEL_ORIENTATION_LANDSCAPE,
                PANEL_ORIENTATION_PORTRAIT,
                STRUCTURE_TYPES,
            },
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
        enableSwitch() {
            if (!this.selectedPanel.characteristics) {
                return false;
            }
            return this.selectedPanel.characteristics.cell_type.includes('Bifacial');
        },
        updateEnabled() {
            return (
                (
                    !this.creationMode &&
                    this.editEnabled &&
                    this.valuesChanged &&
                    !this.errors.any()
                )
                ||
                (
                    this.propertiesData.customFillFaceMode &&
                    !this.errors.any()
                )
                ||
                (
                    this.propertiesData.updateRequired
                )
            );
        },
        cancelEnabled() {
            return (
                (!this.creationMode && this.editEnabled && this.valuesChanged)
                ||
                (this.propertiesData.customFillFaceMode)
            );
        },
        resetEnabled() {
            return this.creationMode && this.valuesChanged;
        },
        autoInterRowSpacingMode() {
            return this.interRowSpacingMode === this.CONSTANTS.ROW_SPACING_MODE_AUTO;
        },
        flushMountMode() {
            return this.mountType === this.CONSTANTS.SUBARRAY_RACK_STYLE_FLUSH;
        },
        eastWestRackingEnabled() {
            return this.mountType === this.CONSTANTS.SUBARRAY_RACK_STYLE_EWRACKING;
        },
        updateButtonText() {
            return this.propertiesData.customFillFaceMode ? 'Fill Face' : undefined;
        },
        buttonsBarCreationMode() {
            return this.creationMode && !this.propertiesData.customFillFaceMode;
        },
        moduleProperties: {
            get() {
                this.defaultModuleId = this.selectedPanel.id;
                return {
                    moduleId: parseInt(this.selectedPanel.id, 10),
                    moduleMake: `${this.selectedPanel.characteristics.manufacturer} ${
                        this.selectedPanel.model
                    }`,
                    moduleLength: parseFloat(this.selectedPanel.characteristics.length),
                    moduleWidth: parseFloat(this.selectedPanel.characteristics.width),
                    moduleSize: parseFloat(this.selectedPanel.characteristics.p_mp_ref) / 1000,
                    panelProperties: this.selectedPanel,
                };
            },
        },
        dcSize() {
            return this.propertiesData.getDcSize().toFixed(2);
        },
        acSize() {
            // TODO: Remove this jugaad
            this.updateAcSize += 1;
            return this.propertiesData.getAcSize().toFixed(2);
        },
        moduleQuantity() {
            return this.propertiesData.getModuleQuantity().toFixed(2);
        },
        flagForUS(){
          const user = JSON.parse(localStorage.getItem("user")) || {};
          return user.isUSFlagEnabled;
        }
    },
    watch: {
        updateGettersFlag() {
            // Used for updating values of getter functions returned in protertiesData
            this.possibleAzimuths = this.propertiesData.getPossibleAzimuths();
        },
        mountType(newVal) {
            let propertiesData = {};
            if (newVal === this.CONSTANTS.SUBARRAY_RACK_STYLE_EWRACKING){
                propertiesData = this.propertiesData.getEastWestRackingProperties();
            }
            else if (newVal === this.CONSTANTS.SUBARRAY_RACK_STYLE_FLUSH) {
                propertiesData = this.propertiesData.getFlushMountProperties();
                this.propertiesData.subarrayCreated(this.CONSTANTS.SUBARRAY_RACK_STYLE_FLUSH);
            }
            else {
                propertiesData = this.propertiesData.getFixedMountProperties();
                this.propertiesData.subarrayCreated(this.CONSTANTS.SUBARRAY_RACK_STYLE_FIXED);
            }
            this.tilt =
                propertiesData.tilt !== undefined ? propertiesData.tilt : this.propertiesData.tilt;
            this.structureType =
                propertiesData.structureType !== undefined
                    ? propertiesData.structureType
                    : this.propertiesData.structureType;
            this.azimuth =
                propertiesData.azimuth !== undefined
                    ? propertiesData.azimuth
                    : this.propertiesData.azimuth;
            // if(this.eastWestRackingEnabled){
            //     this.azimuth = 90;
            //     this.tilt = 5;
            // }
            this.intraRowSpacing =
                propertiesData.intraRowSpacing !== undefined
                    ? propertiesData.intraRowSpacing
                    : this.propertiesData.intraRowSpacing;
            this.interRowSpacing =
                propertiesData.interRowSpacing !== undefined
                    ? propertiesData.interRowSpacing
                    : this.propertiesData.interRowSpacing;
            this.interRowSpacingMode =
                propertiesData.interRowSpacingMode !== undefined
                    ? propertiesData.interRowSpacingMode
                    : this.propertiesData.interRowSpacingMode;
            this.panelOrientation =
                propertiesData.panelOrientation !== undefined
                    ? propertiesData.panelOrientation
                    : this.propertiesData.panelOrientation;
            this.mountHeight =
                propertiesData.mountHeight !== undefined
                    ? propertiesData.mountHeight
                    : this.propertiesData.mountHeight;
            this.tableSizeUp =
                propertiesData.tableSizeUp !== undefined
                    ? propertiesData.tableSizeUp
                    : this.propertiesData.tableSizeUp;
            this.tableSizeWide =
                propertiesData.tableSizeWide !== undefined
                    ? propertiesData.tableSizeWide
                    : this.propertiesData.tableSizeWide;
            this.tableSpacing =
                propertiesData.tableSpacing !== undefined
                    ? propertiesData.tableSpacing
                    : this.propertiesData.tableSpacing;
            this.moduleSpacingUp =
                propertiesData.moduleSpacingUp !== undefined
                    ? propertiesData.moduleSpacingUp
                    : this.propertiesData.moduleSpacingUp;
            this.moduleSpacingWide =
                propertiesData.moduleSpacingWide !== undefined
                    ? propertiesData.moduleSpacingWide
                    : this.propertiesData.moduleSpacingWide;
            this.defaultModuleId =
                propertiesData.moduleProperties !== undefined
                    ? propertiesData.moduleProperties.moduleId
                    : this.defaultModuleId;
        },
        structureType(newVal) {
            if (newVal !== undefined) {
                const currentSubarrayProperties = this.propertiesData;

                // FIX: Jugad for dynamic structure properties updation
                const dynamicSubarrayProperties = this.propertiesData;
                if (dynamicSubarrayProperties.tilt !== this.tilt && this.tilt !== null) {
                    dynamicSubarrayProperties.tilt = this.tilt;
                }
                if (dynamicSubarrayProperties.azimuth !== this.azimuth && this.azimuth !== null) {
                    dynamicSubarrayProperties.azimuth = this.azimuth;
                }
                if (dynamicSubarrayProperties.panelOrientation !== this.panelOrientation && this.panelOrientation !== null) {
                    dynamicSubarrayProperties.panelOrientation = this.panelOrientation;
                }
                if (dynamicSubarrayProperties.mountHeight !== this.mountHeight && this.mountHeight !== null) {
                    dynamicSubarrayProperties.mountHeight = this.mountHeight;
                }
                if (dynamicSubarrayProperties.tableSizeUp !== this.tableSizeUp && this.tableSizeUp !== null) {
                    dynamicSubarrayProperties.tableSizeUp = this.tableSizeUp;
                }
                if (dynamicSubarrayProperties.tableSizeWide !== this.tableSizeWide && this.tableSizeWide !== null) {
                    dynamicSubarrayProperties.tableSizeWide = this.tableSizeWide;
                }
                if (dynamicSubarrayProperties.tableSpacing !== this.tableSpacing && this.tableSpacing !== null) {
                    dynamicSubarrayProperties.tableSpacing = this.tableSpacing;
                }
                if (dynamicSubarrayProperties.moduleSpacingUp !== this.moduleSpacingUp && this.moduleSpacingUp !== null) {
                    dynamicSubarrayProperties.moduleSpacingUp = this.moduleSpacingUp;
                }
                if (dynamicSubarrayProperties.moduleSpacingWide !== this.moduleSpacingWide && this.moduleSpacingWide !== null) {
                    dynamicSubarrayProperties.moduleSpacingWide = this.moduleSpacingWide;
                }
                if (dynamicSubarrayProperties.moduleId !== this.selectedPanel.id && this.selectedPanel.id !== null) {
                    dynamicSubarrayProperties.moduleId = this.selectedPanel.id;
                }
                currentSubarrayProperties.moduleLength =
                    parseFloat(this.selectedPanel.characteristics.length);
                currentSubarrayProperties.moduleWidth =
                    parseFloat(this.selectedPanel.characteristics.width);
                // Jugad Fix: dynamic structure type updation 
                // initially const data = getPropertiesForSubarrayForAutoFix(currentSubarrayProperties, newVal);
                const data = getPropertiesForSubarrayForAutoFix(dynamicSubarrayProperties, newVal);

                const { subarrayProperties } = data;
                if (subarrayProperties.tilt && subarrayProperties.tilt !== null) {
                    this.tilt = subarrayProperties.tilt;
                }
                if (subarrayProperties.azimuth && subarrayProperties.azimuth !== null) {
                    this.azimuth = subarrayProperties.azimuth;
                }
                if (subarrayProperties.panelOrientation
                    && subarrayProperties.panelOrientation !== null) {
                    this.panelOrientation = subarrayProperties.panelOrientation;
                }
                if (subarrayProperties.mountHeight && subarrayProperties.mountHeight !== null) {
                    this.mountHeight = subarrayProperties.mountHeight;
                }
                if (subarrayProperties.tableSizeUp && subarrayProperties.tableSizeUp !== null) {
                    this.tableSizeUp = subarrayProperties.tableSizeUp;
                }
                if (subarrayProperties.tableSizeWide && subarrayProperties.tableSizeWide !== null) {
                    this.tableSizeWide = subarrayProperties.tableSizeWide;
                }
                if (subarrayProperties.tableSpacing && subarrayProperties.tableSpacing !== null) {
                    this.tableSpacing = subarrayProperties.tableSpacing;
                }
                if (subarrayProperties.moduleSpacingUp
                    && subarrayProperties.moduleSpacingUp !== null) {
                    this.moduleSpacingUp = subarrayProperties.moduleSpacingUp;
                }
                if (subarrayProperties.moduleSpacingWide
                    && subarrayProperties.moduleSpacingWide !== null) {
                    this.moduleSpacingWide = subarrayProperties.moduleSpacingWide;
                }
                if (subarrayProperties.moduleId
                    && subarrayProperties.moduleId !== null) {
                    this.selectedPanel.id = subarrayProperties.moduleId;
                }
            }
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                azimuth: vm.azimuth,
                structureType: vm.structureType,
                tilt: vm.tilt,
                tableSizeUp: vm.tableSizeUp,
                moduleSpacingUp: vm.moduleSpacingUp,
                selectedPanel: vm.selectedPanel,
                panelOrientation: vm.panelOrientation,
                intraRowSpacing: vm.intraRowSpacing,
                interRowSpacing: vm.interRowSpacing,
                interRowSpacingMode: vm.interRowSpacingMode,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (
                        !this.errors.any() &&
                        this.interRowSpacingMode === this.CONSTANTS.ROW_SPACING_MODE_AUTO &&
                        (this.mountType === this.CONSTANTS.SUBARRAY_RACK_STYLE_FIXED || this.mountType === this.CONSTANTS.SUBARRAY_RACK_STYLE_EWRACKING)
                    ) {
                        this.updateRowSpacing();
                    }
                });
            },
        );
        if (this.propertiesData.customFillFaceMode) {
            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, true);
        }
        else {
            this.$watch(
                () => ({
                    selectedPanel: vm.selectedPanel,
                    tilt: vm.tilt,
                    structureType: vm.structureType,
                    azimuth: vm.azimuth,
                    tableSpacing: vm.tableSpacing,
                    interRowSpacing: vm.interRowSpacing,
                    interRowSpacingMode: vm.interRowSpacingMode,
                    intraRowSpacing: vm.intraRowSpacing,
                    tableSizeUp: vm.tableSizeUp,
                    tableSizeWide: vm.tableSizeWide,
                    panelOrientation: vm.panelOrientation,
                    mountHeight: vm.mountHeight,
                    moduleSpacingUp: vm.moduleSpacingUp,
                    moduleSpacingWide: vm.moduleSpacingWide,
                    intraRowSpacing: vm.intraRowSpacing,
                    interRowSpacing: vm.interRowSpacing,
                    interRowSpacingMode: vm.interRowSpacingMode,
                    mountType: vm.mountType,
                    name: vm.name,
                    bifacialEnabled: vm.bifacialEnabled,
                }),
                (newVal, preVal) => {
                    this.$validator.validate().then(() => {
                        // TODO: !this.errors.any(), add this check here as well.
                        if (this.creationMode) {
                            // Jugaad fix for panels updated due to the response of
                            // panel fetch api and updating the panel after a delay
                            // To fix that the panels are not updated if the previous val
                            // was null
                            if (Object.keys(preVal.selectedPanel).length !== 0 && preVal.selectedPanel !== newVal.selectedPanel) {
                                this.updateProperties();
                            }
                            else if (
                                (preVal.tilt !== newVal.tilt) ||
                                (preVal.structureType !== newVal.structureType) ||
                                (preVal.azimuth !== newVal.azimuth) ||
                                (preVal.tableSizeUp !== newVal.tableSizeUp) ||
                                (preVal.tableSizeWide !== newVal.tableSizeWide) ||
                                (preVal.tableSpacing !== newVal.tableSpacing) ||
                                (preVal.panelOrientation !== newVal.panelOrientation) ||
                                (preVal.mountHeight !== newVal.mountHeight) ||
                                (preVal.moduleSpacingUp !== newVal.moduleSpacingUp) ||
                                (preVal.moduleSpacingWide !== newVal.moduleSpacingWide) ||
                                (preVal.intraRowSpacing !== newVal.intraRowSpacing) ||
                                (preVal.interRowSpacing !== newVal.interRowSpacing) ||
                                (preVal.interRowSpacingMode !== newVal.interRowSpacingMode) ||
                                (preVal.mountType !== newVal.mountType) ||
                                (preVal.name !== newVal.name)
                            ) {
                                this.updateProperties();
                            }
                        }
                        if (
                            vm.moduleProperties.moduleId !== vm.propertiesData.moduleId ||
                            vm.tilt !== vm.propertiesData.tilt ||
                            vm.structureType !== vm.propertiesData.structureType ||
                            vm.azimuth !== vm.propertiesData.azimuth ||
                            vm.tableSpacing !== vm.propertiesData.tableSpacing ||
                            // Temp fix for EW: REWORK REQUIRED
                            (vm.eastWestRackingEnabled && vm.interRowSpacing !== vm.propertiesData.interRowSpacing) ||
                            (vm.eastWestRackingEnabled && vm.intraRowSpacing != vm.propertiesData.intraRowSpacing) ||
                            vm.tableSizeUp !== vm.propertiesData.tableSizeUp ||
                            vm.tableSizeWide !== vm.propertiesData.tableSizeWide ||
                            vm.panelOrientation !== vm.propertiesData.panelOrientation ||
                            vm.mountHeight !== vm.propertiesData.mountHeight ||
                            vm.moduleSpacingUp !== vm.propertiesData.moduleSpacingUp ||
                            vm.moduleSpacingWide !== vm.propertiesData.moduleSpacingWide ||
                            vm.intraRowSpacing !== vm.propertiesData.intraRowSpacing ||
                            vm.interRowSpacing !== vm.propertiesData.interRowSpacing ||
                            vm.interRowSpacingMode !== vm.propertiesData.interRowSpacingMode ||
                            vm.mountType !== vm.propertiesData.mountType || 
                            vm.name != vm.propertiesData.name
                            || vm.bifacialEnabled !== vm.propertiesData.bifacialEnabled
                        ) {
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
        }
        // no shortcuts in creation mode since
        // it will override complete and cancel shortcuts in topBar
        if (!this.creationMode || this.propertiesData.customFillFaceMode) {
            if (!this.topBarCompleteEnabled) {
                this.$mousetrap.bind('enter', () => {
                    if (this.updateEnabled) this.updateProperties();
                });
            }
            if (!this.topBarCancelEnabled) {
                this.$mousetrap.bind('esc', () => {
                    if (this.cancelEnabled) this.cancelProperties();
                });
            }
        }
        collapseDiv('collapsible-subarry-prop')
        collapseDiv('collapsible-inverter-prop')
    },
    beforeDestroy() {
        // no undinding shortcuts in creation mode since
        // it will unbind complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) this.$mousetrap.unbind('enter');
            if (!this.topBarCancelEnabled) this.$mousetrap.unbind('esc');
        }
    },
    methods: {
        updateProperties() {
            if (!this.creationMode || this.propertiesData.customFillFaceMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.bifacialEnabled = (this.enableSwitch && this.bifacialEnabled);
            const updatedProperties = {
                moduleProperties: {
                    moduleId: this.moduleProperties.moduleId,
                    moduleMake: this.moduleProperties.moduleMake,
                    moduleLength: this.moduleProperties.moduleLength,
                    moduleWidth: this.moduleProperties.moduleWidth,
                    moduleSize: this.moduleProperties.moduleSize,
                    panelProperties: this.moduleProperties.panelProperties,
                },
                tilt: this.tilt,
                structureType: this.structureType,
                azimuth: this.azimuth,
                tableSpacing: this.tableSpacing,
                intraRowSpacing: this.intraRowSpacing,
                interRowSpacing: this.interRowSpacing,
                interRowSpacingMode: this.interRowSpacingMode,
                tableSizeUp: this.tableSizeUp,
                tableSizeWide: this.tableSizeWide,
                panelOrientation: this.panelOrientation,
                mountHeight: this.mountHeight,
                moduleSpacingUp: this.moduleSpacingUp,
                moduleSpacingWide: this.moduleSpacingWide,
                mountType: this.mountType,
                name: this.name,
                bifacialEnabled: this.bifacialEnabled,
                eastWestRackingEnabled: this.eastWestRackingEnabled
            };
            if (this.propertiesData.customFillFaceMode) {
                this.propertiesData.completeCustomFillFace(updatedProperties);
            }
            else {
                this.propertiesData.update(updatedProperties, !this.errors.any());
            }
            // Auto fix subarray function to be called here.
            if (!this.creationMode && this.propertiesData && this.propertiesData.structureErrors
            && this.propertiesData.structureErrors.length !== 0) {
                this.propertiesData.structureErrorAutoFixFunction();
            }
        },

        resetProperties() {
            this.tilt = this.propertiesData.tilt;
            this.structureType = this.propertiesData.structureType;
            this.azimuth = this.propertiesData.azimuth;
            this.tableSpacing = this.propertiesData.tableSpacing;
            this.interRowSpacing = this.propertiesData.interRowSpacing;
            this.interRowSpacingMode = this.propertiesData.interRowSpacingMode;
            this.intraRowSpacing = this.propertiesData.intraRowSpacing;
            this.tableSizeUp = this.propertiesData.tableSizeUp;
            this.tableSizeWide = this.propertiesData.tableSizeWide;
            this.panelOrientation = this.propertiesData.panelOrientation;
            this.mountHeight = this.propertiesData.mountHeight;
            this.moduleSpacingUp = this.propertiesData.moduleSpacingUp;
            this.moduleSpacingWide = this.propertiesData.moduleSpacingWide;
            this.mountType = this.propertiesData.mountType;
            this.defaultModuleId = this.propertiesData.moduleId;
        },
        cancelProperties() {
            if (this.propertiesData.customFillFaceMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
                this.propertiesData.cancelCustomFillFace();
            }
            else {
                this.resetProperties();
            }
        },
        updateRowSpacing() {
            const params = {
                moduleProperties: {
                    moduleLength: this.moduleProperties.moduleLength,
                    moduleWidth: this.moduleProperties.moduleWidth,
                },
                panelOrientation: this.panelOrientation,
                tableSizeUp: this.tableSizeUp,
                moduleSpacingUp: this.moduleSpacingUp,
                azimuth: this.azimuth,
                tilt: this.tilt,
            };
            if (this.interRowSpacingMode === this.CONSTANTS.ROW_SPACING_MODE_AUTO) { 
                this.interRowSpacing = this.propertiesData.getOptimisedRowSpacing(params);;
            }
        },
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
    @import '../../../../styles/components/select';
</style>

<style scoped>


#arrayProperties >>> .sappane-select input{
    text-align: right !important;
}

#arrayProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
#arrayProperties .vb > .vb-dragger {
    visibility: visible;
    top: 0px;
    height: 150px;
}

#arrayProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
     top: 0px;
    height: 150px;
}
.collapsible-subarry-prop {
    color: white;
    cursor: pointer;
}
.collapsible-inverter-prop {
    color: white;
    cursor: pointer;
}
#arrayProperties .content {
    display: none;
    padding-left: 7px;
    margin-right: 10px;
}
.pro-heading {
    font-family: 'Helvetica neue', 'Times', serif;
    font-size: 1.1vw;
    padding: 0px 0px 7px 5px;
    position: relative;
    display: flex;
    justify-content: space-between;
}

.el-icon-arrow-down {
    font-weight: bold;
    font-size: 13px;
    padding-right: 4px;
}
.subarray-name {
    display: flex;
    justify-content: space-between;
}

.sappane-label-panel {
    display: flex;
    justify-content: space-between;
}


.hidden {
    display: none;
}
.hidden.open {
    display: block;
}
.collapsible-inverter-props {
    margin-top: 5px;
    margin-bottom: 10px;
}
</style>
<style scoped>
#arrayProperties .scroll-area {
    height: 70%;
}
#arrayProperties .scroll-area ::-webkit-scrollbar {
  -webkit-appearance: none !important;
  width: 7px !important;
}

#arrayProperties .scroll-subarray {
    overflow-y: scroll;
    height: 95%;
    padding-left: 0px;

}
#arrayProperties .scroll-area ::-webkit-scrollbar-thumb {
  border-radius: 4px !important;
  background-color: #ccc !important;
  box-shadow: 0 0 1px rgba(255, 255, 255, .5) !important;
} 

hr {
    width: 100%;
}


#arrayProperties .el-select .el-input .el-input__inner{
    text-align: right;
}
.designStudioToolTip{
    font-size: 14px;
}

</style>
