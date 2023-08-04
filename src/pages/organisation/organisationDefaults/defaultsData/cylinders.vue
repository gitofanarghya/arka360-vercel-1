<template>
    <div id="cylinderDefaults">

        <div>

            <div>
                <p class="headings"> Base Height
                    <img
                        v-show="profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.CORE_HEIGHT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.coreHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Top Height
                    <img
                        v-show="profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.TOP_HEIGHT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.topHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Tilt
                    <img
                        v-show="profileData.drawing_defaults.cylinderModel.lockedParameter ===
                        lockConstants.TILT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data"> {{ profileData.drawing_defaults.cylinderModel.tilt }} </p>
            </div>

            <div>
                <p class="headings"> Azimuth </p>
                <p class="data"> {{ profileData.drawing_defaults.cylinderModel.azimuth }} </p>
            </div>

            <div>
                <p class="headings"> Parapet Height </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.parapetHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Parapet Thickness </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.parapetThickness"/>
                </p>
            </div>

            <div>
                <p class="headings"> Setback Inside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.setbackInside"/>
                </p>
            </div>

            <div>
                <p class="headings"> Setback Outside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.cylinderModel.setbackOutside"/>
                </p>
            </div>


            <div class="dataSwitches">
                <p class="headings"> Placeable </p>
                <el-switch
                    v-model="profileData.drawing_defaults.cylinderModel.placeable"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled />
            </div>

            <div class="dataSwitches">
                <p class="headings"> Ignored </p>
                <el-switch
                    v-model="profileData.drawing_defaults.cylinderModel.ignored"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled/>
            </div>


        </div>


    </div>
</template>

<script>

import {
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    TILT_LOCKED,
} from '../../../../core/coreConstants';

export default {
    name: 'CylindersDefaults',
    props: {
        profileData: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            lockConstants: {
                CORE_HEIGHT_LOCKED,
                TOP_HEIGHT_LOCKED,
                TILT_LOCKED,
            },
            msg: ' I am in cylindersDefaults',
        };
    },
};

</script>

<style type="text/css">

#defaultsData .headings {
    color: #121212;
    font-size: 14px;
    line-height: 16px;
}

#defaultsData .data {
    color: #707070;
    font-size: 14px;
    padding-bottom: 20px;
}

#defaultsData .el-switch.is-checked .el-switch__core {
    background-color: #409eff !important;
    border-color: #409eff !important;
}

#defaultsData .dataSwitches {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
}

#defaultsData .icon-lock {
    position: relative;
    height: 18px;
    top: 4px;
    margin-left: 8px;
}

</style>
