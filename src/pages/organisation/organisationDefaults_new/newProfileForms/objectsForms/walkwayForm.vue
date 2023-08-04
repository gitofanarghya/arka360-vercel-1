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

    .formHeadings {
        color: #606266;
        font-size: 16px;
        font-family: "Helvetica Neue";
        text-align: left;
        padding-bottom: 14px;
        padding-top: 0px;
        font-weight: 600;
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
#walkwayForm  .el-form-item__label {
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
.formErrors{
    font-size:13px;color:red;
}
#walkwayForm >>> .el-form-item--mini.el-form-item {
    margin-bottom: 1px;
}#walkwayForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
</style>

