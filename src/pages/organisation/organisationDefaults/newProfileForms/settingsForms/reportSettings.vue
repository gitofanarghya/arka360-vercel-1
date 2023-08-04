<template>
    <div id="reportSettingsForm">

        <VuePerfectScrollbar class="scroll-area">

            <el-form :model="profileData" size="mini" label-position="left" label-width="250px">

                <p class="formHeadings"> Data for 3D Model </p>
                
                <el-form-item label="Generation">
                    <el-switch v-model="profileData['report_defaults']['threed_data']['generation']">
                    </el-switch>
                </el-form-item>
                <el-form-item label="Financials">
                    <el-switch v-model="profileData['report_defaults']['threed_data']['financial']">
                    </el-switch>
                </el-form-item>

                <div v-show="profileData.report_defaults.pages.indexOf('shadow-analysis') !== -1">
                    <p class="formHeadings">Time Consideration for Shadow Analysis</p>
                    
                    <el-form-item label="Start time">
                        <input
                class="floating-input"
                type="time"
                v-model="
                  profileData.report_defaults.shadowAnalysis.start_time_shadow_analysis"
                v-validate="shadowAnalysisStartTimeValidation"
                name="Start Time"
              />
                        <p class="formErrors"><span>{{ errors.first('Start Time') }}</span></p>
                    </el-form-item>

                    <el-form-item label="End time">
                         <input
                class="floating-input"
                type="time"
                v-model="
                  profileData.report_defaults.shadowAnalysis.end_time_shadow_analysis"
                v-validate="shadowAnalysisStartTimeValidation"
                name="End Time"
              />
                        <p class="formErrors"><span>{{ errors.first('End Time') }}</span></p>
                    </el-form-item>
                </div>
            
            </el-form>

            <div>
                <div 
                    class="nameCheckBox">
                    <div style="font-weight: 900; width: 250px">Pages</div>
                    <el-checkbox 
                        :indeterminate="isIndeterminate" 
                        v-model="checkAll" 
                        class="checkBoxBorder"
                        style="padding: 0 0 0 0; flex-grow: 1">
                    </el-checkbox>
                </div>
                <el-checkbox-group 
                    v-model="profileData.report_defaults.pages" 
                    class="checkBoxBorder">
                    <div 
                        v-for="page in finalCheckListReportPages" 
                        :key="page.label"
                        class="nameCheckBox"> 
                        <div style="width: 250px"> {{page.name}} </div>
                        <el-checkbox :label="page.label" style="flex-grow: 1"> 
                            <div style="display: none"> &nbsp; </div>
                        </el-checkbox>
                    </div>
                </el-checkbox-group>
            </div>
            <left v-if="!flagForUS"><h4>Report Custom Colors </h4></left>
            <div class="custom-color-report" v-if="!flagForUS">
                <TSLBasicReportEditDefaults 
                    :profileData="profileData"
                />
            </div>
        </VuePerfectScrollbar>
    </div>
</template>

<script>

    import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
    import TSLBasicReportEditDefaults from '../settingsForms/customColorEdit.vue';
    import { reportPagesListNonUs, reportPagesListUs, reportPagesPlainListUs } from '../../../../../utils';

    const checkedPagesCopy = reportPagesListNonUs.map(page => page.label)

    const checkedPagesCopyForUS = reportPagesPlainListUs

    export default {
        name: 'reportSettingsForm',
        props: ['profileData'],
        components: {
            VuePerfectScrollbar,
            TSLBasicReportEditDefaults,
        },
        data() {
            return {
                msg: 'I am in generalSettings',
                shadowAnalysisStartTimeValidation: {
                    required: true,
                },
                shadowAnalysisEndTimeValidation: {
                    required: true,
                },
                checkListReportPages: reportPagesListNonUs,
                checkListReportPagesForUS: reportPagesListUs,
            };
        },
        computed: {
            isIndeterminate: function () {
                if ((this.profileData.report_defaults.pages.length > 0) && (this.profileData.report_defaults.pages.length < this.finalCheckListReportPages.length)) {
                    return true
                }
                return false
            },
            checkAll: {
                get: function () {
                    if (this.profileData.report_defaults.pages.length === this.finalCheckListReportPages.length) {
                        return true;
                    }
                    return false
                },
                set: function(value) {
                    this.profileData.report_defaults.pages = value ? checkedPagesCopy : [];
                }
            }, 
            flagForUS(){
                const user = JSON.parse(localStorage.getItem("user")) || {};
                return user.isUSFlagEnabled;
            },
            finalCheckListReportPages(){
                if(this.flagForUS){
                    return this.checkListReportPagesForUS;
                }
                else{
                    return this.checkListReportPages;
                }
            }
        },
    };

</script>

<style type="text/css" scoped>

#reportSettingsForm .scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 55vh;
}
#reportSettingsForm .el-switch {
    margin: 0 10% 0 0;
}

.checkBoxBorder >>> .el-checkbox__inner {
    border: 1px solid #DCDFE6 !important;
    width: 18px;
    height: 18px;
}

.checkBoxBorder >>> .el-checkbox__inner::after {
    top: 3px;
    left: 6px;
}

.checkBoxBorder >>> .el-checkbox__input {
    padding: 0 10% 0 0;
    float: right;
}

.el-checkbox-group {
    font-size: 14px;
}

.nameCheckBox {
   display: flex; 
   justify-content: space-between; 
   margin: 0 0 18px 0;
   align-items: center;
}
.custom-color-report {
    margin-right: 40px;
    padding: 15px 15px 5px 15px;
    border: 1px solid black;
}
.floating-input {
    font-size: 14px;
    padding: 10px 16px;
    display: block;
    width: 90%;
    height: 28px;
    background-color: #ffff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #606266;
}
</style>

<style lang="scss" scoped>
@import '../../../../../styles/components/forms';
</style>
