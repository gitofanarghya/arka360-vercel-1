<template>
    <div id="settingsReportDefaults">
        <div>
            <div>
                <p class="formHeadings"> Data for 3D Model1</p>
            </div>
            <div class="dataSwitches">
                <p class="headings">Generation</p>
                <el-switch
                        class="input"
                        v-model="profileData['report_defaults']['threed_data']['generation']"
                        active-color="#13ce66"
                        inactive-color="#999999"
                        disabled>
                </el-switch>
            </div>

            <div class="dataSwitches">
                <p class="headings">Financials</p>
                <el-switch
                        class="input"
                        v-model="profileData['report_defaults']['threed_data']['financial']"
                        active-color="#13ce66"
                        inactive-color="#999999"
                        disabled>
                </el-switch>
            </div>

            <div v-show="profileData.report_defaults.pages.indexOf('shadow-analysis') !== -1">
                <div>
                    <p class="formHeadings">Time Consideration for Shadow Analysis</p>
                </div>

                <div>
                    <p class="headings"> Start Time </p>
                    <p class="data"> {{ profileData.report_defaults.shadowAnalysis.start_time_shadow_analysis }} </p>
                </div>

                <div>
                    <p class="headings"> End Time </p>
                    <p class="data"> {{ profileData.report_defaults.shadowAnalysis.end_time_shadow_analysis }} </p>
                </div>
            </div>

            <div 
                class="nameCheckBox" style="padding: 0 10px 0 0">
                <div class="formHeadings" style="padding: 0">Pages</div>
                <div style="cursor: not-allowed;">
                    <el-checkbox 
                        :indeterminate="isIndeterminate" 
                        v-model="checkAll"
                        class="checkBoxBorder"
                        style="pointer-events: none">
                    </el-checkbox>
                </div>
            </div>
            <el-checkbox-group 
                v-model="profileData.report_defaults.pages" 
                class="checkBoxBorder">
                <div 
                    v-for="page in checkListReportPages" 
                    :key="page.label"
                    class="nameCheckBox"> 
                    <div class="headings"> {{page.name}} </div>
                    <div style="cursor: not-allowed;">
                        <el-checkbox :label="page.label" style="pointer-events: none"> 
                            <div style="display: none"> &nbsp; </div>
                        </el-checkbox>
                    </div>
                </div>
            </el-checkbox-group>
        </div>
        <div class="report-main">
            <div class="report-heading">Report Custom Colors</div>
            <div class="custom-color-report">
                <TSLBasicReportDefaults 
                    :colorScheme="profileData"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TSLBasicReportDefaults from '../customColor';
import { reportPagesListNonUs } from '../../../../../utils';

    export default {
        name: 'settingsReportDefaults',
        props: ['profileData'],
        components: {
            TSLBasicReportDefaults: TSLBasicReportDefaults   
        },
        data() {
            return {
                msg: ' I am in settingsReportDefaults',
                checkListReportPages: reportPagesListNonUs,
            };
        },
        computed: {
            isIndeterminate: function () {
                if ((this.profileData.report_defaults.pages.length > 0) && (this.profileData.report_defaults.pages.length < this.checkListReportPages.length)) {
                    return true
                }
                return false
            },
            checkAll: function () {
                if (this.profileData.report_defaults.pages.length === this.checkListReportPages.length) {
                    return true;
                }
                return false
            },
        },
        mounted() {
            this.$emit('profileData', this.profileData)
        }
    }

</script>

<style type="text/css">

    #settingsReportDefaults .formHeadings {
        color: #606266;
        font-size: 15px;
        text-align: left;
        padding-bottom: 10px;
        padding-top: 0px;
        font-weight: 600;
    }

    .nameCheckBox {
        display: flex; 
        justify-content: space-between; 
        margin: 0 0 18px 0;
        align-items: center;
    }
    
    .el-checkbox-group {
        font-size: 14px;
    }

    .checkBoxBorder .el-checkbox__inner {
        border: 1px solid #DCDFE6 !important;
        width: 18px;
        height: 18px;
    }

    .checkBoxBorder .el-checkbox__inner::after {
        top: 3px;
        left: 6px;
    }

    .report-main {
        margin-bottom: 20px;
    }

    .report-heading {
        text-align: center;
        color: black;
        font-size: 14px;
        padding: 0 10px 10px 10px;
    }

    .custom-color-report {
        margin-right: 10px;
        padding: 15px 15px 5px 15px;
        border: 1px solid black;
    }

</style>

