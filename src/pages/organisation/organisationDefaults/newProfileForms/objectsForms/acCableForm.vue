<template>
    <div
        id="acCableForm"
        class = "acCableForm">
        <VuePerfectScrollbar class="scroll-area">
            <el-form
                :model="profileData.drawing_defaults.acCable"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>
                <el-form-item label="Material Type">
                    <div
                        style = "width: 70%;"
                        class = "select-block">
                        <el-select
                            v-model="profileData.drawing_defaults.acCable.materialType"
                            placeholder="Select the material type">
                            <el-option
                                value="aluminium"
                                label="Aluminium"/>
                            <el-option
                                value="copper"
                                label="Copper"/>
                        </el-select>
                    </div>
                </el-form-item>
                <el-form-item label="No. of Cores">
                    <div
                        style = "width: 70%;"
                        class = "select-block">
                        <el-select
                            v-model="profileData.drawing_defaults.acCable.cores"
                            placeholder="Select cores">
                            <el-option
                                value="1"
                                label="1"/>
                            <el-option
                                value="2"
                                label="2"/>
                            <el-option
                                value="3"
                                label="3"/>
                            <el-option
                                value="3.5"
                                label="3.5"/>
                            <el-option
                                value="4"
                                label="4"/>
                            <el-option
                                value="5"
                                label="5"/>
                        </el-select>
                    </div>
                </el-form-item>
                <el-form-item
                    :class="[profileData.wiring_unit === 'mmsq' ? '' : 'hidden']"
                    label="Size of Cable(in sq.mm)">
                    <div
                        class = "select-block"
                        style = "width: 70%;">
                        <el-select
                            v-model="profileData.drawing_defaults.acCable.cableSizeMM"
                            placeholder="Select">
                            <div
                                v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_MM"
                                :key="index">
                                <el-option
                                    :value="i"
                                    :label="i"/>
                            </div>
                        </el-select>
                    </div>
                </el-form-item>
                <el-form-item
                    :class="[profileData.wiring_unit === 'awg' ? '' : 'hidden']"
                    label="Size of Cable (in AWG)">
                    <div
                        class = "select-block"
                        style = "width: 70%;">
                        <el-select
                            v-model="profileData.drawing_defaults.acCable.cableSizeAWG"
                            placeholder="Select">
                            <div
                                v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_AWG"
                                :key="index">
                                <el-option
                                    :value="i"
                                    :label="i"/>
                            </div>
                        </el-select>
                    </div>
                </el-form-item>
                
            </el-form>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import { 
    ACCABLE_SIZE_AWG,
    ACCABLE_SIZE_MM,
} from '../../../../../core/coreConstants';

export default {
    name: 'AcCableForm',
    components: {
        VuePerfectScrollbar,
    },
    props: ['profileData', 'profileData.drawing_defaults.acCable'],
    // props: {
    //     profileData: {
    //         type: Object,
    //         default() {
    //             return {};
    //         },
    //     },
    // },
    data() {
        return {
            labelPosition: 'left',
            acdbProp: {
                azimuth: 90,
                mountHeight: 0.5,
            },
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 359.9,
                },
                decimal: 2,
            },
            lengthValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
        };
    },
    nonReactiveData() {
        return {
            CONSTANTS: {
                ACCABLE_SIZE_AWG,
                ACCABLE_SIZE_MM,
            },
        };
    },
    mounted() {
    },
    updated() {
    },
};
</script>

<style type="text/css" scoped>

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
#acCableForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
}
.el-select {
    width: 100%;
}
.el-select-dropdown.el-popper {
    max-width: 350px !important;
}

.hidden {
    display: none !important;
}


</style>
<style scoped>
.select-block .el-select .el-input{
    width: 100% !important;
}
</style>
