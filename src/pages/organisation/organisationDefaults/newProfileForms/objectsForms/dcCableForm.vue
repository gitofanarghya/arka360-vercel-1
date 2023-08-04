<template>
    <div id="dcCableForm">
        <VuePerfectScrollbar class="scroll-area">
            <el-form
                :model="profileData.drawing_defaults.dcCable"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>
                <el-form-item label="Cable Length">
                    <input
                        v-validate="cableLengthValidation"
                        v-model="profileData.drawing_defaults.dcCable.cableLength"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="cableLength"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('cableLength') }}</span></p>
                </el-form-item>
                <el-form-item label="Polarity">
                    <div
                        style = "width: 70%;"
                        class = "select-block">
                        <el-select
                            v-model="profileData.drawing_defaults.dcCable.polarity"
                            placeholder="Select the polarity">
                            <el-option
                                value="negative"
                                label="Negative"/>
                            <el-option
                                value="positive"
                                label="Positive"/>
                        </el-select>
                    </div>
                </el-form-item>
               <el-form-item label="Cable Size">
                    <input
                        v-model="profileData.drawing_defaults.dcCable.cableSize"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="cableSize"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('cableSize') }}</span></p>
                </el-form-item>
            </el-form>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
    name: 'DcCableForm',
    components: {
        VuePerfectScrollbar,
    },
    props: ['profileData', 'profileData.drawing_defaults.dcCable'],
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
            dcCableProp: {
                cableLength: 0,
                polarity: 'negative',
                cableSize:0,
            },
            cableLengthValidation: {
                required: true,
                between: {
                    min: 0.0001,
                    max: 5000,
                },
                decimal: 2,
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
#dcCableForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
}

</style>
