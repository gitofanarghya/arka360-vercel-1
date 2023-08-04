<template>
    <div id="polygonsDefaults">

        <div>

            <div>
                <p class="headings"> Base Height
                    <img
                        v-show="profileData.drawing_defaults.polygonModel.lockedParameter ===
                        lockConstants.CORE_HEIGHT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.coreHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Top Height
                    <img
                        v-show="profileData.drawing_defaults.polygonModel.lockedParameter ===
                        lockConstants.TOP_HEIGHT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.topHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Tilt
                    <img
                        v-show="profileData.drawing_defaults.polygonModel.lockedParameter ===
                        lockConstants.TILT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data"> {{ profileData.drawing_defaults.polygonModel.tilt }} </p>
            </div>

            <div>
                <p class="headings"> Azimuth </p>
                <p class="data"> {{ profileData.drawing_defaults.polygonModel.azimuth }} </p>
            </div>

            <div>
                <p class="headings"> Parapet Height </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.parapetHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Parapet Thickness </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.parapetThickness"/>
                </p>
            </div>

            <div>
                <p class="headings"> Setback Inside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.setbackInside"/>
                </p>
            </div>

            <div>
                <p class="headings"> Setback Outside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.polygonModel.setbackOutside"/>
                </p>
            </div>

            <div class="dataSwitches">
                <p class="headings"> Heat Map Threshold </p>
                <el-switch
                    v-model="profileData.drawing_defaults.polygonModel.heatMapThreshold"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled />
            </div>

            <div class="dataSwitches">
                <p class="headings"> Ignored </p>
                <el-switch
                    v-model="profileData.drawing_defaults.polygonModel.ignored"
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
    name: 'PolygonsDefaults',
    props: ['profileData'],
    data() {
        return {
            lockConstants: {
                CORE_HEIGHT_LOCKED,
                TOP_HEIGHT_LOCKED,
                TILT_LOCKED,
            },
            msg: ' I am in polygonsDefaults',
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


	#defaultsData .el-switch {

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

</style>
