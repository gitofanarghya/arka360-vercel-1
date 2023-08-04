<template>
    <div id="SubarrayTemplateForm">
        <div
            v-bar
            class="scroll-area">
            <el-form
                :label-position="labelPosition"
                :model="profileData"
                label-width="250px"
                class="demo-ruleForm"
                size="mini">
                <el-form-item label="Default">
                    <el-switch
                        v-model="isDefaultMountType"
                        style="margin-right: 5px; float: left"
                    />
                </el-form-item>
                <el-form-item label="Module">
                    <infinite-scroll-dropdown-panel
                        :panel.sync="subarrayPanel"
                        :module-id="profileData
                        .drawing_defaults.subarray[mountTypeKey].moduleProperties.moduleId"
                        :component-id="panelInfiniteScrollId"/>
                </el-form-item>
                <el-form-item label="Structure Type">
                    <div v-if="mountTypeKey==='fixedMount'">
                        <el-select
                            v-model="profileData.drawing_defaults
                            .subarray[mountTypeKey].structureType"
                            placeholder="Select"
                            class="data">
                            <el-option
                                value="Default Fixed Tilt"
                                label="Default Fixed Tilt"/>
                            <el-option
                                value="Pergola"
                                label="Pergola"/>
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
                    <div v-if="mountType==='Tilted Mount'">
                        <el-select
                            :disabled="true"
                            v-model="profileData.drawing_defaults
                            .subarray[mountTypeKey].structureType"
                            placeholder="Select"
                            class="data">
                            <el-option
                                value="Default Fixed Tilt"
                                label="Default Fixed Tilt"/>
                        </el-select>
                    </div>
                    <div v-if="mountType==='East West Racking'">
                        <el-select
                            v-model="profileData.drawing_defaults
                            .subarray[mountTypeKey].structureType"
                            placeholder="Select"
                            class="data">
                            <el-option
                                value="Low Foundation Fixed Tilt"
                                label="Low Foundation Fixed Tilt"/>
                        </el-select>
                    </div>
                </el-form-item>
                <!-- <div v-if="mountType==='flush'">
                    <el-form-item label="Structure Type">
                        <el-select
                        :disabled="true"
                        v-model="profileData
                                .drawing_defaults.subarray[mountTypeKey].structureType"
                        placeholder="Select"
                        class="data">
                            <el-option
                                value="NA"
                                label="NA"/>
                        </el-select>
                    </el-form-item>
                </div> -->
                <el-form-item label="Tilt">
                    <div
                        v-if="isNaN(profileData.drawing_defaults.subarray[mountTypeKey].tilt)"
                    >
                        <input
                            v-model="profileData
                            .drawing_defaults.subarray[mountTypeKey].tilt"
                            class="inputBoxStyler"
                            disabled="true"
                        >
                    </div>
                    <div
                        v-else>
                        <input
                            v-validate="tiltValidation"
                            v-model.number="profileData
                            .drawing_defaults.subarray[mountTypeKey].tilt"
                            class="inputBoxStyler"
                            type="number"
                            autocomplete="off"
                            name="Tilt"
                            step="any">
                    </div>
                    <p class="formErrors"><span>{{ errors.first('Tilt') }}</span></p>
                </el-form-item>

                <el-form-item label="Azimuth">
                    <div
                        v-if="isNaN(profileData.drawing_defaults.subarray[mountTypeKey].azimuth)"
                    >
                        <input
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].azimuth"
                            class="inputBoxStyler"
                            disabled="true"
                        >
                    </div>
                    <div
                        v-else>
                        <input
                            v-validate="azimuthValidation"
                            v-model.number="profileData
                            .drawing_defaults.subarray[mountTypeKey].azimuth"
                            class="inputBoxStyler"
                            type="number"
                            autocomplete="off"
                            name="Azimuth"
                            step="any">
                    </div>
                    <p class="formErrors"><span>{{ errors.first('Azimuth') }}</span></p>
                </el-form-item>
                <div v-if="mountType === 'East West Racking'">
                    <el-form-item label="Intra Row Spacing">
                        <input-length
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].intraRowSpacing"
                            :name="'Intra Row Spacing'"
                            :class-input="'inputBoxStyler'"
                            :error-view-ancestor="this"
                        />
                        <p class="formErrors"><span>{{ errors.first('Intra Row Spacing') }}</span></p>
                    </el-form-item>
                </div>
                <div v-if="mountType === 'East West Racking'">
                    <el-form-item label="Inter Row Spacing Mode">
                        <el-radio-group
                            v-model="profileData
                            .drawing_defaults.subarray[mountTypeKey].interRowSpacingMode">
                            <el-radio-button label="Auto"/>
                            <el-radio-button label="Manual"/>
                        </el-radio-group>
                        <p class="formErrors"><span>{{ errors.first('Inter Row Spacing Mode') }}</span></p>
                    </el-form-item>
                </div>
                <div v-if="mountType === 'East West Racking'">
                    <el-form-item label="Inter Row Spacing">
                        <input-length
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].interRowSpacing"
                            :name="'Inter Row Spacing'"
                            :class-input="'inputBoxStyler'"
                            :error-view-ancestor="this"
                        />
                        <p class="formErrors"><span>{{ errors.first('Inter Row Spacing') }}</span></p>
                    </el-form-item>
                </div>
                
                <div
                v-if="mountType !== 'East West Racking'"
                    v-show="rowSpacingModeEnabled"
                >
                    <el-form-item
                        label="Row Spacing Mode"
                    >
                        <el-radio-group
                            v-model="profileData
                            .drawing_defaults.subarray[mountTypeKey].rowSpacingMode">
                            <el-radio-button label="Auto"/>
                            <el-radio-button label="Manual"/>
                        </el-radio-group>
                    </el-form-item>
                </div>

                <el-form-item v-if="mountType !== 'East West Racking'" label="Row Spacing">
                    <div
                        v-if="rowSpacingDisabled "
                    >
                        <input
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].rowSpacing"
                            class="inputBoxStyler"
                        >
                    </div>
                    <div
                        v-else>
                        <input-length
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].rowSpacing"
                            :name="'Row Spacing'"
                            :disabled="rowSpacingDisabled"
                            :metric-validation="rowSpacingValidation"
                            :class-input="'inputBoxStyler'"
                            :error-view-ancestor="this"
                        />
                        <p class="formErrors"><span>{{ errors.first('Row Spacing') }}</span></p>
                    </div>
                </el-form-item>

                <el-form-item label="Table Spacing">
                    <input-length
                        v-model="profileData.drawing_defaults.subarray[mountTypeKey].tableSpacing"
                        :name="'Table Spacing'"
                        :metric-validation="tableSpacingValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Table Spacing') }}</span></p>
                </el-form-item>

                <el-form-item label="Array Rows">
                    <input
                        v-validate="tableSizeUpValidation"
                        v-model.number="profileData
                        .drawing_defaults.subarray[mountTypeKey].tableSizeUp"
                        class="inputBoxStyler"
                        type="number"
                        autocomplete="off"
                        name="Array Rows"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Array Rows') }}</span></p>
                </el-form-item>

                <el-form-item label="Array Columns">
                    <input
                        v-validate="tableSizeWideValidation"
                        v-model.number="profileData
                        .drawing_defaults.subarray[mountTypeKey].tableSizeWide"
                        class="inputBoxStyler"
                        type="number"
                        autocomplete="off"
                        name="Array Columns"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Array Columns') }}</span></p>
                </el-form-item>

                <el-form-item label="Module Orientation">
                    <el-radio-group
                        v-model="profileData
                        .drawing_defaults.subarray[mountTypeKey].panelOrientation">
                        <el-radio-button label="Landscape"/>
                        <el-radio-button label="Portrait"/>
                    </el-radio-group>
                </el-form-item> 
                <el-form-item label="Mount Height">
                    <input-length
                        v-model="profileData.drawing_defaults.subarray[mountTypeKey].mountHeight"
                        :name="'Mount Height'"
                        :metric-validation="mountHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Mount Height') }}</span></p>
                </el-form-item>

                <el-form-item label="Vertical Module Spacing">
                    <input-length
                        v-model="profileData.drawing_defaults
                        .subarray[mountTypeKey].moduleSpacingUp"
                        :name="'Vertical Module Spacing'"
                        :metric-validation="moduleSpacingUpValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Vertical Module Spacing') }}</span></p>
                </el-form-item>

                <el-form-item label="Horizontal Module Spacing">
                    <input-length
                        v-model="profileData.drawing_defaults
                        .subarray[mountTypeKey].moduleSpacingWide"
                        :name="'Horizontal Module Spacing'"
                        :metric-validation="moduleSpacingWideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Horizontal Module Spacing') }}</span></p>
                </el-form-item>
            </el-form>
        </div>
    </div>

</template>

<script>

import infiniteScrollDropdownPanel from
    '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';
import {
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
} from '../../../../../../core/coreConstants';
import { getPropertiesForSubarrayForAutoFix } from '../../../../../../core/structure/utils/structureValidationUtils';


export default {
    name: 'SubarrayTemplateForm',
    components: {
        infiniteScrollDropdownPanel,
    },
    props: {
        profileData: {
            type: Object,
            default() {
                return {};
            },
        },
        mountType: {
            type: String,
            default() {
                return SUBARRAY_RACK_STYLE_FIXED;
            },
        },
        mountTypeKey: {
            type: String,
            default() {
                return 'fixedMount';
            },
        },
        panelInfiniteScrollId: {
            type: String,
            default: 'panel',
        },
    },
    data() {
        return {
            labelPosition: 'left',
            otherMountType: this.mountType === SUBARRAY_RACK_STYLE_FIXED ?
                SUBARRAY_RACK_STYLE_FLUSH : SUBARRAY_RACK_STYLE_FIXED,
            subarrayPanel: {},
            rowSpacingModeEnabled: this.mountType === SUBARRAY_RACK_STYLE_FIXED,
            tiltValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 89.9,
                },
                decimal: 2,
            },
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 359.99,
                },
                decimal: 2,
            },
            tableSpacingValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            rowSpacingValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            tableSizeUpValidation: {
                required: true,
                min_value: 1,
                decimal: 0,
            },
            tableSizeWideValidation: {
                required: true,
                min_value: 1,
                decimal: 0,
            },
            mountHeightValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            moduleSpacingUpValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            moduleSpacingWideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            formLabelWidth: '200px',
        };
    },
    computed: {
        isDefaultMountType: {
            get() {
                return this.mountType ===
                    this.profileData.drawing_defaults.subarray.mountType;
            },
            set(value) {
                this.profileData.drawing_defaults.subarray.mountType =
                    value ?
                        this.mountType : this.otherMountType;
            },
        },
        rowSpacingDisabled: {
            get() {
                return this.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].rowSpacingMode === ROW_SPACING_MODE_AUTO;
            },
        },
        rowSpacingAuto:{
            get(){
                return (this.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].rowSpacingMode === ROW_SPACING_MODE_AUTO? 'Will be auto-calculated' : `${this.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].rowSpacing}`);
            },
        }
    },
    watch: {
        subarrayPanel: {
            deep: true,
            handler(value) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleId = parseInt(value.id, 10);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleMake =
                        `${value.characteristics.manufacturer}  ${value.model}`;
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleLength = parseFloat(value.characteristics.length);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleWidth = parseFloat(value.characteristics.width);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleSize =
                        parseFloat(value.characteristics.p_mp_ref / 1000);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .panelProperties = value;
            },
        },
    },
    mounted() {
   
        if (!('tilt' in this.profileData.drawing_defaults.subarray[this.mountTypeKey])) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].tilt =
                'Will be auto-calculated';
        }
        if (!('azimuth' in this.profileData.drawing_defaults.subarray[this.mountTypeKey])) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].azimuth =
                'Will be auto-calculated';
        }
        
        if (this.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacingMode =
            ROW_SPACING_MODE_MANUAL;
        }
        const vm = this;
        this.$watch(
            () => ({
                structureType: vm.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].structureType,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (
                        vm.structureType !==
                        vm.profileData.drawing_defaults.subarray[this.mountTypeKey].structureType
                    ) {
                        this.fixProperties();
                    }
                });
            },
        );
    },
    methods: {
        fixProperties() {
            const { subarrayProperties, allErrorsFixable } = getPropertiesForSubarrayForAutoFix(
                this.profileData.drawing_defaults.subarray[this.mountTypeKey],
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].structureType,
                true,
            );

            if (subarrayProperties.tilt && subarrayProperties.tilt !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tilt =
                    subarrayProperties.tilt;
            }
            if (subarrayProperties.panelOrientation
                && subarrayProperties.panelOrientation !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].panelOrientation =
                    subarrayProperties.panelOrientation;
            }
            if (subarrayProperties.rowSpacing && subarrayProperties.rowSpacing !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacing =
                    subarrayProperties.rowSpacing;
            }
            if (subarrayProperties.rowSpacingMode && subarrayProperties.rowSpacingMode !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacingMode =
                    subarrayProperties.rowSpacingMode;
            }
            if (subarrayProperties.mountHeight && subarrayProperties.mountHeight !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].mountHeight =
                    subarrayProperties.mountHeight;
            }
            if (subarrayProperties.moduleSpacingUp && subarrayProperties.moduleSpacingUp !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].moduleSpacingUp =
                    subarrayProperties.moduleSpacingUp;
            }
            if (subarrayProperties.moduleSpacingWide
                && subarrayProperties.moduleSpacingWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].moduleSpacingWide =
                    subarrayProperties.moduleSpacingWide;
            }
            if (subarrayProperties.tableSizeUp && subarrayProperties.tableSizeUp !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeUp =
                    subarrayProperties.tableSizeUp;
            }
            if (subarrayProperties.tableSizeWide && subarrayProperties.tableSizeWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeWide =
                    subarrayProperties.tableSizeWide;
            }
            if (subarrayProperties.tableSizeWide && subarrayProperties.tableSizeWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeWide =
                    subarrayProperties.tableSizeWide;
            }
            if (subarrayProperties.tableSpacing && subarrayProperties.tableSpacing !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSpacing =
                    subarrayProperties.tableSpacing;
            }
            if (subarrayProperties.azimuth && subarrayProperties.azimuth !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].azimuth =
                    subarrayProperties.azimuth;
            }
        },
    },
};
</script>

<style type="text/css">

    #subarrayForm .scroll-area {
        width: 100%;
        height: 55vh;
    }

    /*for making the dropdown work in the dialog box*/
    #subarrayForm .el-select-dropdown {

        position: absolute !important;
        right: 10% !important;
        font-family: Helvetica-Neue !important;
        min-width: 350px !important;
        left: auto !important;
    }

    /*for overriding the width changed by vuebar*/
    #subarrayForm .el-form {
        /* width: 100% !important; */
        box-sizing: border-box !important;
    }
    /*for removing the popper arrow*/
    #subarrayForm .el-popper .popper__arrow {
        display: none;
    }

    /*for aligning tilt dropdown*/
    #subarrayForm .tiltAligner .el-select-dropdown {
        width: 90% !important;
        min-width: 0 !important;
    }

    #subarrayForm .not-valid {
        font-size: 10.5px;
        color: red;
        position: absolute;
        right: 20px;
        top: 25px;
    }

    /* thsese styles are for the styling of the dropdown and  the filters part*/
    #subarrayForm .no-results-inventory {
        position: absolute;
        width: calc(100% - 55px);
        height: 40px;
        color: #999;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        top: 45px;
        z-index: 4;
        box-shadow: 0px 4px 15px rgba(0,0,0,0.14);
        background-color: white;
    }
    #subarrayForm .el-scrollbar__wrap {
        scrollbar-width: none !important;
        padding-right: 10px;
    }

    #subarrayForm .el-scrollbar__wrap::-webkit-scrollbar {
        width: 0;
        height: 20px
    }

    #subarrayForm > div .el-select-group__wrap:first-child .el-select-group__title {
        margin: 45px 0px 0px 0px;
        padding: 0 20px;
    }

    #subarrayForm .el-scrollbar__bar.is-vertical {
        top: 50px;
    }

    #subarrayForm .el-select-dropdown__list {
        padding: 6px 0 0 0;
    }

    #subarrayForm .el-select {
        width: 100%;
    }

    .demo-ruleForm {
        box-sizing: border-box !important;
    }
</style>
