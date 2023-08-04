<template>
    <div id="dormerDefaults">

        <div>

            <!-- <div>
                <p class="headings"> Base Height
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.coreHeight"/>
                </p>
            </div> -->

            <!-- <div>
                <p class="headings"> Top Height
                    <img
                        v-show="profileData.drawing_defaults.dormer.lockedParameter ===
                        lockConstants.TOP_HEIGHT_LOCKED"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        class="icon-lock"
                    >
                </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.topHeight"/>
                </p>
            </div> -->

            <div>
                <p class="headings"> Tilt
                </p>
                <p class="data"> {{ profileData.drawing_defaults.dormer.tilt }} </p>
            </div>

            <!-- <div>
                <p class="headings"> Azimuth </p>
                <p class="data"> {{ profileData.drawing_defaults.dormer.azimuth }} </p>
            </div>

            <div>
                <p class="headings"> Parapet Height </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.parapetHeight"/>
                </p>
            </div>

            <div>
                <p class="headings"> Parapet Thickness </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.parapetThickness"/>
                </p>
            </div> -->

            <!-- <div>
                <p class="headings"> Setback Inside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.setbackInside"/>
                </p>
            </div> -->

            <div>
                <p class="headings"> Setback Outside </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.dormer.setbackOutside"/>
                </p>
            </div>


            <!-- <div class="dataSwitches">
                <p class="headings"> Placeable </p>
                <el-switch
                    v-model="profileData.drawing_defaults.dormer.placable"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled />
            </div>

            <div class="dataSwitches">
                <p class="headings"> Ignored </p>
                <el-switch
                    v-model="profileData.drawing_defaults.dormer.ignored"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled/>
            </div> -->


        </div>


    </div>
</template>

<script>

export default {
    name: 'DormersDefaults',
    props: ['profileData'],
    data() {
        return {
            msg: ' I am in dormerDefaults',
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
