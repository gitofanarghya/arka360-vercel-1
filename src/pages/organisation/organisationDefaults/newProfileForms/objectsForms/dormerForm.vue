<template>
    <div id="dormerForm">
        <VuePerfectScrollbar class="scroll-area">

            <el-form
                :model="profileData.drawing_defaults.dormer"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>

                <!-- <el-form-item label="Base Height">
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.coreHeight"
                        :name="'Base Height'"
                        :metric-validation="{
                            min_value: 0.001,
                            decimal: 3,
                        }"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Base Height') }}</span></p>
                </el-form-item> -->

                <!-- <el-form-item label="Top Height">
                    <img
                        :class="[profileData.drawing_defaults.dormer.lockedParameter ===
                        lockConstants.TOP_HEIGHT_LOCKED ? 'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        @click="lockParameter(lockConstants.TOP_HEIGHT_LOCKED)"
                    >
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.topHeight"
                        :name="'Top Height'"
                        :disabled="profileData.drawing_defaults.dormer.lockedParameter === lockConstants.TOP_HEIGHT_LOCKED"
                        :metric-validation="{
                            required: profileData.drawing_defaults.dormer.lockedParameter !==
                                lockConstants.TOP_HEIGHT_LOCKED,
                            min_value: 0.001,
                            decimal: 3,
                        }"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Top Height') }}</span></p>
                </el-form-item> -->

                <el-form-item label="Tilt">
                    <input
                        v-validate="{
                            between: {
                                min: 0,
                                max: 89.9,
                            },
                            decimal: 1,
                        }"
                        v-model.number="profileData.drawing_defaults.dormer.tilt"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Tilt"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Tilt') }}</span></p>
                </el-form-item>

                <!-- <el-form-item label="Azimuth">
                    <input
                        v-validate="azimuthValidation"
                        v-model.number="profileData.drawing_defaults.dormer.azimuth"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Azimuth"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Azimuth') }}</span></p>
                </el-form-item>

                <el-form-item label="Parapet Height">
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.parapetHeight"
                        :name="'Parapet Height'"
                        :metric-validation="parapetHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Parapet Height') }}</span></p>
                </el-form-item>

                <el-form-item label="Parapet Thickness">
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.parapetThickness"
                        :name="'Parapet Thickness'"
                        :metric-validation="parapetThicknessValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Parapet Thickness') }}</span></p>
                </el-form-item> -->

                <!-- <el-form-item label="Setback Inside">
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.setbackInside"
                        :name="'Setback Inside'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Setback Inside') }}</span></p>
                </el-form-item> -->

                 <el-form-item label="Setback Outside">
                    <input-length
                        v-model="profileData.drawing_defaults.dormer.setbackOutside"
                        :name="'Setback Outside'"
                        :metric-validation="setbackOutsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Setback Outside') }}</span></p>
                </el-form-item>

                <!-- <el-form-item label="Placeable">
                    <div style="width:90%">
                        <el-switch v-model="profileData.drawing_defaults.dormer.placable"/>
                    </div>
                </el-form-item>

                <el-form-item label="Ignored">
                    <div style="width:90%">
                        <el-switch v-model="profileData.drawing_defaults.dormer.ignored"/>
                    </div>
                </el-form-item> -->
            </el-form>
        </VuePerfectScrollbar>

    </div>

</template>

<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
    name: 'DormerForm',
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
            labelPosition: 'left',
            polygonProp: {
                coreHeight: 5,
                tilt: 20,
                setbackInside: 0.5,
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
    },
    methods: {
    },
};
</script>
<style type="text/css">

    #newProfile .el-dialog__body {
        text-align: left
    }

    #newProfile .formHeadings {
        color: #606266;
        font-size: 14px;
        text-align: left;
        padding-bottom: 10px;
        padding-top: 0px;
        font-weight: 600;
    }

    #polygonForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }

    #polygonForm .icon-lock {
        opacity: 1;
        cursor: not-allowed;
    }

    #polygonForm .icon-unlock {
        opacity: 0.2;
        cursor: pointer;
    }

    #polygonForm .icon-lock, #polygonForm .icon-unlock {
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

</style>
