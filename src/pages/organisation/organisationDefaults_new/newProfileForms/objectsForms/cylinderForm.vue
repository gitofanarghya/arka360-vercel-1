<template>
    <div id="cylinderForm">
        <VuePerfectScrollbar class="scroll-area">
            <el-form
                :model="profileData.drawing_defaults.cylinderModel"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>

                <el-form-item label="Base Height">
                    <img
                        :class="[profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.CORE_HEIGHT_LOCKED ? 'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        @click="lockParameter(lockConstants.CORE_HEIGHT_LOCKED)"
                    >
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.coreHeight"
                        :name="'Base Height'"
                        :disabled="profileData.drawing_defaults.cylinderModel.lockedParameter === lockConstants.CORE_HEIGHT_LOCKED"
                        :metric-validation="{
                            required: profileData.drawing_defaults.cylinderModel.lockedParameter !==
                                lockConstants.CORE_HEIGHT_LOCKED,
                            min_value: 0.001,
                            decimal: 3,
                        }"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Base Height') }}</span></p>
                </el-form-item>

                <el-form-item label="Top Height">
                    <img
                        :class="[profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.TOP_HEIGHT_LOCKED ? 'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        @click="lockParameter(lockConstants.TOP_HEIGHT_LOCKED)"
                    >
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.topHeight"
                        :name="'Top Height'"
                        :disabled="profileData.drawing_defaults.cylinderModel.lockedParameter === lockConstants.TOP_HEIGHT_LOCKED"
                        :metric-validation="{
                            required: profileData.drawing_defaults.cylinderModel.lockedParameter !==
                                lockConstants.TOP_HEIGHT_LOCKED,
                            min_value: 0.001,
                            decimal: 3,
                        }"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Top Height') }}</span></p>
                </el-form-item>

                <el-form-item label="Tilt">
                    <img
                        :class="[profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.TILT_LOCKED ? 'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        @click="lockParameter(lockConstants.TILT_LOCKED)"
                    >
                    <input
                        v-validate="{
                            required: profileData.drawing_defaults.cylinderModel.lockedParameter !==
                                lockConstants.TILT_LOCKED,
                            between: {
                                min: 0,
                                max: 89.9,
                            },
                            decimal: 1,
                        }"
                        v-model.number="profileData.drawing_defaults.cylinderModel.tilt"
                        :disabled="profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.TILT_LOCKED"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Tilt"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Tilt') }}</span></p>
                </el-form-item>

                <el-form-item label="Azimuth">
                    <input
                        v-validate="azimuthValidation"
                        v-model.number="profileData.drawing_defaults.cylinderModel.azimuth"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Azimuth"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Azimuth') }}</span></p>
                </el-form-item>

                <el-form-item label="Parapet Height">
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.parapetHeight"
                        :name="'Parapet Height'"
                        :metric-validation="parapetHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Parapet Height') }}</span></p>
                </el-form-item>

                <el-form-item label="Parapet Thickness">
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.parapetThickness"
                        :name="'Parapet Thickness'"
                        :metric-validation="parapetThicknessValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Parapet Thickness') }}</span></p>
                </el-form-item>

                <el-form-item label="Setback Inside">
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.setbackInside"
                        :name="'Setback Inside'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Setback Inside') }}</span></p>
                </el-form-item>

                <el-form-item label="Setback Outside">
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.setbackOutside"
                        :name="'Setback Outside'"
                        :metric-validation="setbackOutsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Setback Outside') }}</span></p>
                </el-form-item>
                <el-form-item label="Irradiance Map Threshold">
                    <input-length
                        v-model="profileData.drawing_defaults.cylinderModel.heatMapThreshold"
                        :name="'Irradiance Map Threshold'"
                        :class-input="'inputBoxStyler'"
                        :convert-value="true"
                        :error-view-ancestor="this"
                    />
                </el-form-item>

                <!-- <el-form-item label="Placeable">
                    <div style="width:90%">
                        <el-switch v-model="profileData.drawing_defaults.cylinderModel.placeable"/>
                    </div>
                </el-form-item> -->

                <el-form-item label="Ignored">
                    <div style="width:90%">
                        <el-switch v-model="profileData.drawing_defaults.cylinderModel.ignored"/>
                    </div>
                </el-form-item>
            </el-form>
        </VuePerfectScrollbar>

    </div>

</template>

<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import {
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    TILT_LOCKED,
} from '../../../../../core/coreConstants';

export default {
    name: 'CylinderForm',
    components: {
        VuePerfectScrollbar,
    },
    props: {
        profileData: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            lockConstants: {
                CORE_HEIGHT_LOCKED,
                TOP_HEIGHT_LOCKED,
                TILT_LOCKED,
            },
            labelPosition: 'left',
            cylinderProp: {
                coreHeight: 2,
                parapetHeight: 0,
                parapetThickness: 0.3,
                tilt: 0,
                azimuth: 0,
                setbackInside: 0.5,
                setbackOutside: 0.5,
                heatMapThreshold: 100,
                placeable: true,
                ignored: true,
            },
            parapetHeightValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            parapetThicknessValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 359.9,
                },
                decimal: 2,
            },
            setbackInsideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            setbackOutsideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
        };
    },
    computed: {
    },
    mounted() {
      console.log(this.profileData);

    },
    methods: {
        lockParameter(parameterName) {
            if (this.profileData.drawing_defaults.cylinderModel.lockedParameter !== parameterName) {
                this.profileData.drawing_defaults.cylinderModel.lockedParameter = parameterName;
                switch (parameterName) {
                case TOP_HEIGHT_LOCKED: this.profileData.drawing_defaults.cylinderModel.topHeight = '';
                    break;
                case CORE_HEIGHT_LOCKED: this.profileData.drawing_defaults.cylinderModel.coreHeight = '';
                    break;
                case TILT_LOCKED: this.profileData.drawing_defaults.cylinderModel.tilt = '';
                    break;
                default:
                    console.error(`ERROR: CylinderForm: lockParameter failed -
                        Incorrect locked parameter name`);
                }

                // const scope = this;
                // this.$nextTick(() => {
                //     scope.$validator.validate('Base Height');
                //     scope.$validator.validate('Tilt');
                //     scope.$validator.validate('Top Height');
                // });
            }
        },
    },
};
</script>
<style type="text/css">

    #newProfile .el-dialog__body {
        text-align: left
    }

    .formHeadings {
        color: #606266;
        font-size: 16px;
        font-family: "Helvetica Neue";
        text-align: left;
        padding-bottom: 14px;
        padding-top: 0px;
        font-weight: 600;
    }

    #cylinderForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }

    #cylinderForm .icon-lock {
        opacity: 1;
        cursor: not-allowed;
    }

    #cylinderForm .icon-unlock {
        opacity: 0.2;
        cursor: pointer;
    }

    #cylinderForm .icon-lock, #cylinderForm .icon-unlock {
        height: 20px;
        border: 0px;
        background-color: transparent;
        border-color: transparent;
        padding: 0;
        position: absolute;
        left: -60px;
        font-size: 16px;
        top: 6px;
    }
.inputBoxStyler {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 2px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 28px;
    line-height: 28px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 90%;
    font-size: 12px;
}
#cylinderForm .el-form-item__label {
    
    text-align: left;
    vertical-align: middle;
    float: left;
    font-size: 16px !important;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
</style>
<style scoped>
.formErrors{font-size: 13px;
color: red;}
#cylinderForm >>> .el-form-item--mini.el-form-item {
    margin-bottom: 1px;
}#cylinderForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
</style>
