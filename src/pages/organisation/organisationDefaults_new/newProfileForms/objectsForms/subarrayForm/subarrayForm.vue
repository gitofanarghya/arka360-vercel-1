<template>
    <div id="subarrayForm">

        <div
            v-bar
            class="scroll-area">
            <div style="" >
                <el-tabs>
                    <el-tab-pane label="Roof Mount"> <subarray-template-form
                        :profile-data="profileData"
                        :mount-type="fixedMount"
                        :panel-infinite-scroll-id="panelInfiniteScrollId1"
                        mount-type-key="fixedMount"/>
                    </el-tab-pane>
                    <el-tab-pane label="Tilted Mount"> <subarray-template-form
                        :profile-data="profileData"
                        :mount-type="flushMount"
                        :panel-infinite-scroll-id="panelInfiniteScrollId2"
                        mount-type-key="flushMount"/>
                    </el-tab-pane>
                    <el-tab-pane label="East West Racking"> <subarray-template-form
                        :profile-data="profileData"
                        :mount-type="eastWestRacking"
                        :panel-infinite-scroll-id="panelInfiniteScrollId3"
                        mount-type-key="eastWestRacking"/>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>

</template>

<script>

import SubarrayTemplateForm from '../subarrayForm/subarrayTemplateForm.vue';
import {
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_EWRACKING,
} from '../../../../../../core/coreConstants';

export default {
    name: 'SubarrayForm',
    components: {
        SubarrayTemplateForm,
    },
    props: {
        profileData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            fixedMount: SUBARRAY_RACK_STYLE_FIXED,
            flushMount: SUBARRAY_RACK_STYLE_FLUSH,
            eastWestRacking: SUBARRAY_RACK_STYLE_EWRACKING,
            panelInfiniteScrollId1: 'fixedMountPanel',
            panelInfiniteScrollId2: 'flushMountPanel',
            panelInfiniteScrollId3: 'eastWestRacking',
        };
    },
};
</script>

<style type="text/css">

    #subarrayForm .scroll-area {
        width: 100%;
        height: inherit;
    }

    /*for making the dropdown work in the dialog box*/
    #subarrayForm .el-select-dropdown {

        position: absolute !important;
        right: 10% !important;
        font-family: Helvetica-Neue !important;
        min-width: 350px !important;
        left: auto !important;
    }

    /*for overriding the width changed by vuebar*/
    #subarrayForm .el-form {
        /* width: 100% !important; */
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    /*for removing the popper arrow*/
    #subarrayForm .el-popper .popper__arrow {
        display: none;
    }

    /*for aligning tilt dropdown*/
    #subarrayForm .tiltAligner .el-select-dropdown {
        width: 90% !important;
        min-width: 0 !important;
    }

    #subarrayForm .not-valid {
        font-size: 10.5px;
        color: red;
        position: absolute;
        right: 20px;
        top: 25px;
    }

    /* thsese styles are for the styling of the dropdown and  the filters part*/
    #subarrayForm .no-results-inventory {
        position: absolute;
        width: calc(100% - 55px);
        height: 40px;
        color: #999;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        top: 45px;
        z-index: 4;
        box-shadow: 0px 4px 15px rgba(0,0,0,0.14);
        background-color: white;
    }
    #subarrayForm .el-scrollbar__wrap {
        scrollbar-width: none !important;
        padding-right: 10px;
    }

    #subarrayForm .el-scrollbar__wrap::-webkit-scrollbar {
        width: 0;
        height: 20px
    }

    #subarrayForm > div .el-select-group__wrap:first-child .el-select-group__title {
        margin: 45px 0px 0px 0px;
        padding: 0 20px;
    }

    #subarrayForm .el-scrollbar__bar.is-vertical {
        top: 50px;
    }

    #subarrayForm .el-select-dropdown__list {
        padding: 6px 0 0 0;
    }

    #subarrayForm .el-select {
        width: 100%;
    }
    #subarrayForm .el-form-item__label {
    text-align: left;
    vertical-align: middle;
    float: left;
    font-size: 16px !important;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-bottom: 0px;
}
</style>
<style scoped>
.formErrors{font-size: 13px;
color: red;}
#subarrayForm >>> .el-input--mini .el-input__inner {
    height: 28px;
    line-height: 28px;
    width: 90%;
}
#subarrayForm >>> .el-select .el-input .el-select__caret {
    color: #C0C4CC;
    font-size: 15px;
    margin-right: 48px;
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s;
    transition: transform .3s, -webkit-transform .3s;
    -webkit-transform: rotateZ(180deg);
    transform: rotateZ(180deg);
    cursor: pointer;
}
 #subarrayForm >>> .tabs_section .tabs_list li.active span {
    font-weight: 500;
    font-size: 16px !important;
}
#subarrayForm >>> .tabs_section .tabs_list li span {
    display: inline-block;
    padding: 12px 0;
    color: var(--step-200);
    font-size: 16px !important;
    font-weight: normal;
    white-space: nowrap;
}
.subarray{
    font-size: 16px !important;
}
#subarrayForm >>> .el-tabs__item {
    padding: 0 20px;
    height: 40px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    line-height: 40px;
    display: inline-block;
    list-style: none;
    font-size: 16px !important;
    font-weight: 500;
    color: #303133;
    position: relative;
}
#subarrayForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
} 

#subarrayForm .scroll-area {
        width: 100%;
        height: inherit !important;
    }
</style>