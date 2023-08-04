<template>
    <div
        id="walkwayForm"
        style="height: 300px">
        <el-form
            :model="profileData.drawing_defaults.walkwayModel"
            :label-position="labelPosition"
            label-width="250px"
            size="mini">
            <p class="formHeadings">PROPERTIES </p>
            <p>{{ dummyVariable }}</p>
            <el-form-item label="Core Height">
                <input-length
                    v-model="profileData.drawing_defaults.walkwayModel.coreHeight"
                    :name="'Core Height'"
                    :metric-validation="coreHeightValidation"
                    :class-input="'inputBoxStyler'"
                    :error-view-ancestor="this"
                />
                <p class="formErrors"><span>{{ errors.first('Core Height') }}</span></p>
            </el-form-item>
            <el-form-item label="Width">
                <input-length
                    v-model="profileData.drawing_defaults.walkwayModel.width"
                    :name="'Width'"
                    :metric-validation="widthValidation"
                    :class-input="'inputBoxStyler'"
                    :error-view-ancestor="this"
                />
                <p class="formErrors"><span>{{ errors.first('Width') }}</span></p>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'WalkwayForm',
    components: {},
    props: ['profileData', 'profileData.drawing_defaults.walkwayModel'],
    data() {
        return {
            dummyVariable: '',
            labelPosition: 'left',
            walkwayProp: {
                coreHeight: 0.1,
                width: 0.25,
            },
            formLabelWidth: '200px',
            coreHeightValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            widthValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
        };
    },
    mounted() {
        this.dummyVariable = ' ';
    },
    methods: {},
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

</style>
