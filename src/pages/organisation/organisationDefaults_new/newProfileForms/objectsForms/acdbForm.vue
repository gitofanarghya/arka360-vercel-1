<template>
    <div id="acdbForm">
        <VuePerfectScrollbar class="scroll-area">
            <el-form
                :model="profileData.drawing_defaults.acdb"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>
                <el-form-item label="Azimuth">
                    <input
                        v-validate="azimuthValidation"
                        v-model.number="profileData.drawing_defaults.acdb.azimuth"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Azimuth"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Azimuth') }}</span></p>
                </el-form-item>
                <el-form-item label="Mount Height">
                    <input-length
                        v-model="profileData.drawing_defaults.acdb.mountHeight"
                        :name="'Mount Height'"
                        :metric-validation="lengthValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('Mount Height') }}</span></p>
                </el-form-item>
            </el-form>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
    name: 'ACDBForm',
    components: {
        VuePerfectScrollbar,
    },
    props: ['profileData', 'profileData.drawing_defaults.acdb'],
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
    computed: {
    },
    methods: {
    },
};
</script>

<style type="text/css">

#newProfile .el-dialog__body {
    text-align: left
}

.formHeadings[data-v-06f2d3e4] {
    color: #606266;
    font-family: "Helvetica Neue";
    font-size: 16px;
    text-align: left;
    padding-bottom: 14px;
    padding-top: 0px;
    font-weight: 600;
}
#acdbForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
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
#acdbForm  .el-form-item__label {
    text-align: left;
    vertical-align: middle;
    float: left;
    font-size: 16px !important;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;}
</style>
<style scoped>
.formErrors{font-size: 13px;
color: red;}
#acdbForm >>> .el-form-item--mini.el-form-item {
    margin-bottom: 1px;
}#acdbForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
</style>
