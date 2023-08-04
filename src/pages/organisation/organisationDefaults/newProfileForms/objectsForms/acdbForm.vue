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

#newProfile .formHeadings {

    color: #606266;
    font-size: 14px;
    text-align: left;
    padding-bottom: 10px;
    padding-top: 0px;
    font-weight: 600;
}
#acdbForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
}

</style>
