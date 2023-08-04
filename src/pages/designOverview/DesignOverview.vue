<template>
    <el-container class="design-overview-body">
        <el-header class="design-overview-header" v-if="!this.$props.isReport">
            <div>
            <span v-if="organisation_logo" class="design-overview-title">
                <img
                class="design-overview-logo"
                :src="organisation_logo"
                alt="logo"
            >
            </span>
            </div>
            <img :src="arkaEnergyLogo" @click="onClickLogo" class="design-overview-logo" />
        </el-header>
    <el-container class="loader-container" v-if="!designfetched" >
        <div class="loader">
            <img :src="arkaEnergyGif" class = "loader_image" />
        </div>
    </el-container>
        <el-container v-if="designfetched" class="design-overview-main">
            <div class="imgCont">
                <img
                    v-touch:swipe.bottom="onSwipeDown"
                    @click="onUpArrowTap"
                    v-touch-options="vTouchOptions"
                    class="design-overview-side-pane-swipe-up-pill"
                    src="../../assets/drop/dropdown-arrow-down.png"
                    alt="Swipe up"
                >
                <img
                    v-touch:swipe.top="onSwipeUp"
                    @click="onDownArrowTap"
                    v-touch-options="vTouchOptions"
                    class="design-overview-side-pane-swipe-down-pill"
                    src="../../assets/drop/dropdown-arrow-up.png"
                    alt="Swipe up"
                >
            </div>
            <el-aside class="design-overview-side-pane">
                <div
                    v-if="stageLoaded"
                    class="design-overview-side-pane-div">
                    <!-- <span class="design-overview-side-pane-swipe-up-text">
                        Swipe up for more details
                    </span> -->
                    <div class="flexContRev">
                    <el-main
                        v-if="generationVisible || financialVisible"
                        class="design-overview-section">
                        <design-stats
                            :generation-stats-visible="generationVisible"
                            :financial-stats-visible="financialVisible"
                            :annual-production="annualProduction"
                            :system-size="systemSize"
                            :npv="npv"
                            :payback-period="paybackPeriod"/>
                    </el-main>
                    <div class="flexCont">
                    <div class="shadEffContainer">
                        <span  :class="shadingEffectEnabled == true ? 'shadEffHeadingActive' : 'shadEffHeading'">Shading Effects </span>
                        <el-switch
                            v-model="shadingEffectEnabled"
                            active-color="#3498db"
                            class="sappane-switch"
                        />
                    </div>
                    <div v-if="shadingEffectEnabled">
                        <el-main class="design-overview-section">
                            <p class="design-overview-section-heading">
                                Sun Path Simulation
                            </p>
                            <sun-simulation-controls
                                :update-sun-position="updateSunPosition"
                                :latitude="latitude"
                                :longitude="longitude"
                                :isMenubarOpen="isMenubarOpen"/>
                            <div class="quickViewContainer">
                                <h4 class="quickViewHeading">Quick View</h4>
                                <div class="quickViewFlexContainer">
                                    <button
                                        @click="setCustomTime('jun', 9) ; toggleClassSettingBtnOne()" class="btnQV" :class="{ activeSettingOne }">
                                        Jun 21 | 9:00 AM
                                    </button>
                                    <button
                                        @click="setCustomTime('jun', 4) ; toggleClassSettingBtnTwo()" class="btnQV" :class="{ activeSettingTwo }">
                                        Jun 21 | 4:00 PM
                                    </button>
                                    <button
                                        @click="setCustomTime('dec', 9) ; toggleClassSettingBtnThree()" class="btnQV" :class="{ activeSettingThree }">
                                        Dec 21 | 9:00 AM
                                    </button>
                                    <button
                                        @click="setCustomTime('dec', 4) ; toggleClassSettingBtnFour()" class="btnQV" :class="{ activeSettingFour }">
                                        Dec 21 | 4:00 PM
                                    </button>
                                </div>
                            </div>
                        </el-main>
                    </div>
                    <div class="irrContainer">
                        <span :class="irradianceEnabled == true ? 'irrHeadingActive' : 'irrHeading'">Irradiance </span>
                        <el-switch
                            :disabled="irradianceLoading"
                            v-model="irradianceEnabled"
                            active-color="#3498db"
                            class="sappane-switch"
                            @change="irradianceSwitch()"
                        />
                    </div>
                    </div>
                </div>            
                    <el-footer class="design-overview-footer" v-if="!this.$props.isReport">
                        <div class="organisation_detail">
                             Design by {{organisation_name}}
                        </div>
                        <div>
                            <a
                                href="https://thesolarlabs.com/privacy-policy/"
                                target="_blank"
                                class="design-overview-footer-links">
                                Privacy Policy
                            </a>
                            <a
                                href="https://thesolarlabs.com/terms/"
                                target="_blank"
                                class="design-overview-footer-links">
                                Terms of Use
                            </a>
                        </div>
                        <div>
                            ©2023 Arka Energy, Inc.
                        </div>
                    </el-footer>
                </div>
            </el-aside>
            <el-main class="design-overview-canvas">
                <design-overview-stage
                    v-if="designDataLoaded"
                    :stage-data="stageData"
                    :design-settings="designSettings"
                    :map-image="mapImage"
                />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import API from '@/services/api';
import DesignOverviewStage from '../studio/stage/DesignOverviewStage.vue';
import SunSimulationControls from './SunSimulationControls.vue';
import DesignStats from './DesignStats.vue';
import MonthlyGenerationChart from './MonthlyGenerationChart.vue';
import LifetimeSavingsChart from './LifetimeSavingsChart.vue';
import { SET_SUN_SIMULATION_ROOF_VIEW } from '../../componentManager/componentManagerConstants';
import { INVALID_SCALE } from '../../core/coreConstants';
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';
import { serverBus } from '../../main';
import { INIT_IRRADIANCE } from '../../componentManager/componentManagerConstants';
import arkaEnergyGif from '../../assets/drop/SL360_Icon_Animation_2.gif';
import { fetchArkaEnergyLogo } from "@/pages/utils/utils.js";
import { useMapImagesStore } from '../../stores/mapImages';
import { signRequest } from '../../core/utils/utils';

export default {
    name: 'DesignOverview',
    props: [ 'isReport' ],
    components: {
        DesignOverviewStage,
        SunSimulationControls,
        DesignStats,
        //MonthlyGenerationChart,
       // LifetimeSavingsChart,
    },
    data() {
        return {
            arkaEnergyLogo: fetchArkaEnergyLogo(),
            solarLabsLogo: 'https://front-end-assests.s3-us-west-2.amazonaws.com/tsl_logo.png',
            solarLabsGif: 'https://gif-loder.s3.amazonaws.com/GIF.gif',
            arkaEnergyGif: arkaEnergyGif,
            generationVisibilitySetting: true,
            financialVisibilitySetting: true,
            annualProduction: null,
            organisation_logo: null,
            systemSize: null,
            paybackPeriod: null,
            npv: null,
            monthlyGeneration: null,
            cumulativeSavings: null,
            designDataLoaded: false,
            stageLoaded: false,
            stageData: null,
            mapImage: null,
            designSettings: null,
            statsPaneSwipedUp: false,
            designfetched:false,
            organisation_name: '',
            shadingEffectEnabled: false,
            irradianceEnabled: false,
            activeSettingOne: false,
            activeSettingTwo: false,
            activeSettingThree: false,
            activeSettingFour: false,
            irradianceLoading: false,
            isMenubarOpen: true,
        };
    },
    nonReactiveData() {
        return {
            showSolarAccess: () => {},
            hideSolarAccess: () => {},
            showHeatmap: () => {},
            hideHeatmap: () => {},
            showShadow: () => {},
            hideShadow: () => {},
            updateSunPosition: () => {},
            vTouchOptions: {
            },
            dateObject: new Date(),
            currentYear: new Date().getFullYear(),
        };
    },
    computed: {
        statsVisible() {
            return this.generationVisible || this.financialVisible;
        },
        generationVisible() {
            return this.generationVisibilitySetting &&
                this.annualProduction !== null &&
                this.annualProduction !== undefined &&
                this.systemSize !== null &&
                this.systemSize !== undefined;
        },
        financialVisible() {
            return this.financialVisibilitySetting &&
                this.paybackPeriod !== null &&
                this.paybackPeriod !== undefined &&
                this.npv !== null &&
                this.npv !== undefined;
        },
        generationGraphVisible() {
            return this.generationVisibilitySetting &&
                this.monthlyGeneration !== null &&
                this.monthlyGeneration !== undefined;
        },
        financialGraphVisible() {
            return this.financialVisibilitySetting &&
                this.cumulativeSavings !== null &&
                this.cumulativeSavings !== undefined;
        },
        latitude() {
            return this.stageData !== null ? parseFloat(this.stageData.latitude) : null;
        },
        longitude() {
            return this.stageData !== null ? parseFloat(this.stageData.longitude) : null;
        },
        locationTimeOffset() {
            return DateTime.fromMillis(
                Date.now(),
                { zone: tzLookup(this.latitude, this.longitude) },
            ).offset * (60 * 1000);
        },
        userTimeOffset() {
            return this.dateObject.getTimezoneOffset() * (60 * 1000);
        },
    },
    watch: {
        shadingEffectEnabled: {
            deep: true,
            handler(newVal) {
                if (newVal) {
                    this.showShadow();
                }
                else {
                    this.hideShadow();
                }
            },
        },
    },
    async created() {
        const setIntervalId = setInterval(() => {
            if (window.stageLoaded) {
                clearInterval(setIntervalId);
                this.stageLoaded = true;
            }
        }, 100);

        this.$eventBus.$once(SET_SUN_SIMULATION_ROOF_VIEW, (updateSun) => {
            this.updateSunPosition = updateSun;
        });

        try {

            // const responseData = await API.DESIGN_VERSION_SCENE.FETCH_3D_MODEL(this.$route.params.designUUID);
            // console.log(responseData);
            const { data } = await API.DESIGN_VERSION_SCENE
                        .FETCH_DESIGN_VERSION_METRICS(this.$route.params.designUUID);
            this.organisation_logo = data.organisation_logo;
            this.organisation_name = data.organisation_name;

            const response = await API.DESIGN_VERSION_SCENE
                .FETCH_DESIGN_VERSION_SCENE(this.$route.params.designUUID);
            this.designfetched = true
            const result = response.data.results[0];
            console.log(result);
            useMapImagesStore().latitude = result.design.map_data ? result.design.map_data.latitude_for_map ? result.design.map_data.latitude_for_map : parseFloat(result.scene.latitude) : parseFloat(result.scene.latitude);
            useMapImagesStore().longitude = result.design.map_data ? result.design.map_data.longitude_for_map ? result.design.map_data.longitude_for_map : parseFloat(result.scene.longitude) : parseFloat(result.scene.longitude);
            useMapImagesStore().zoomLevel = result.design.map_data ? result.design.map_data.zoomLevel ? result.design.map_data.zoomLevel : result.scene.zoom : result.scene.zoom;
            useMapImagesStore().dimensions = result.design.map_data ? result.design.map_data.dimensions ? result.design.map_data.dimensions : 512 : 512;
            this.stageData = result.scene;
            let studioMapImage = {};
            // await useMapImagesStore().POPULATE_ALL_MAP_IMAGES_3DLINK(this.$route.params.designUUID).then(()=>{
            //     studioMapImage = useMapImagesStore().GET_STANDARD_IMAGES[useMapImagesStore().GET_CURRENT_APPLIED_IMAGE_SOURCE] ? useMapImagesStore().GET_STANDARD_IMAGES[useMapImagesStore().GET_CURRENT_APPLIED_IMAGE_SOURCE] : {};
            // });
            this.mapImage = {
                url: (result.map_image.image) ? result.map_image.image : this.stageData.imageURL,
                rotation: (result.map_image.rotation === null ||
                    result.map_image.rotation === undefined) ? 0 : result.map_image.rotation,
                scale: (result.map_image.scale === null || result.map_image.scale === undefined)
                    ? INVALID_SCALE : result.map_image.scale,
                offset: (result.map_image.offset === null || result.map_image.offset === undefined)
                    ? [0, 0] : result.map_image.offset,
                source: (result.map_image.source === undefined ||
                    result.map_image.source === null) ? "google" : result.map_image.source,
                zoom: (result.map_image.zoom === undefined ||
                    result.map_image.zoom === null) ? 20 : result.map_image.zoom,
            };
            this.designSettings = JSON.parse(JSON.stringify(result.setting));
            this.designDataLoaded = true;

            const reportSettings = result.setting.report_defaults;
            if (Object.prototype.hasOwnProperty.call(reportSettings, 'threed_data')) {
                this.generationVisibilitySetting = reportSettings.threed_data.generation;
                this.financialVisibilitySetting = reportSettings.threed_data.financial;
            }

            if (this.generationVisibilitySetting || this.financialVisibilitySetting) {
                try {
                    this.annualProduction = data.annual_production;
                    // This might not be the best approach to calculate locale
                    let locale = "en-" + data?.country?.country_code
                    
                    this.systemSize = `${new Intl.NumberFormat(locale).format(data.system_size.toFixed(2))} kWp`;
                    if (data.payback_period !== null) {
                        this.paybackPeriod = `${data.payback_period.years} yrs. ${data.payback_period.months} mos.`;
                    }
                    if (data.npv !== null) {
                        this.npv = new Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: data.country.currency_code,
                        }).format(parseFloat(data.npv).toFixed(2));
                    }

                    this.monthlyGeneration = data.monthly_gen_graph_data;
                    this.cumulativeSavings = data.cumulative_savings;
                }
                catch (error) {
                    console.log('DesignOverview: Created: Error in fetching design metrics', error);
                }
            }
        }
        catch (error) {
            clearInterval(setIntervalId);
            this.$router.push({ name: 'error' });
        }
    },
    mounted() {
        document.body.style.overflow = 'auto';
        serverBus.$once(INIT_IRRADIANCE, (showSolarAccess, hideSolarAccess, showHeatmap, hideHeatmap, showShadow, hideShadow) => {
            this.showSolarAccess = showSolarAccess;
            this.hideSolarAccess = hideSolarAccess;
            this.showHeatmap = showHeatmap;
            this.hideHeatmap = hideHeatmap;
            this.showShadow = showShadow;
            this.hideShadow = hideShadow;
            if(this.$route.name == 'DesignOverview')
            {
                this.shadingEffectEnabled = true;
            }
        });
    },
    beforeDestroy() {
        document.body.style.overflow = 'visible';
    },
    methods: {
        onClickLogo() {
            window.open('https://thesolarlabs.com/', '_blank');
        },
        showStats() {
            document.querySelector('.design-overview-canvas').classList.add('design-overview-canvas__swipe-top');
            document.querySelector('.design-overview-canvas').classList.remove('design-overview-canvas__swipe-bottom');
            document.querySelector('.design-overview-side-pane').classList.add('design-overview-side-pane__swipe-top');
            document.querySelector('.design-overview-side-pane').classList.remove('design-overview-side-pane__swipe-bottom');
            document.querySelector('.design-overview-side-pane-div').classList.add('design-overview-side-pane-div__swipe-top');
            document.querySelector('.design-overview-side-pane-div').classList.remove('design-overview-side-pane-div__swipe-bottom');
            let arrowDir = document.querySelector('.imgCont');
            arrowDir.style.bottom = '2px';
            arrowDir.style.transition = 'bottom 0.48s ease-out';
            document.querySelector('.design-overview-side-pane-swipe-up-pill').style.display = 'none';
            document.querySelector('.design-overview-side-pane-swipe-down-pill').style.display = 'block';
            this.isMenubarOpen = false;
        },
        hideStats() {
            document.querySelector('.design-overview-canvas').classList.remove('design-overview-canvas__swipe-top');
            document.querySelector('.design-overview-canvas').classList.add('design-overview-canvas__swipe-bottom');
            document.querySelector('.design-overview-side-pane').classList.remove('design-overview-side-pane__swipe-top');
            document.querySelector('.design-overview-side-pane').classList.add('design-overview-side-pane__swipe-bottom');
            document.querySelector('.design-overview-side-pane-div').classList.remove('design-overview-side-pane-div__swipe-top');
            document.querySelector('.design-overview-side-pane-div').classList.add('design-overview-side-pane-div__swipe-bottom');
            let arrowDir = document.querySelector('.imgCont');
            arrowDir.style.bottom = '33vh';
            arrowDir.style.transition = 'bottom 0.5s ease-out';
            document.querySelector('.design-overview-side-pane-swipe-down-pill').style.display = 'none';
            document.querySelector('.design-overview-side-pane-swipe-up-pill').style.display = 'block';
            this.isMenubarOpen = true;
        },
        onUpArrowTap() {
            this.statsPaneSwipedUp = true;
            this.showStats();
        },
        onDownArrowTap() {
            this.statsPaneSwipedUp = false;
            this.hideStats();
        },
        onSwipeDown(direction, event) {
            if (
                !event.target.classList.contains('el-slider__button') &&
                !event.target.classList.contains('el-slider__button-wrapper') &&
                !this.statsPaneSwipedUp
            ) {
                this.statsPaneSwipedUp = true;
                this.showStats();
            }
        },
        onSwipeUp(event) {
            this.statsPaneSwipedUp = false;
            this.hideStats();
        },
        setCustomTime(month, time) {
            let monthNumber = 5; //june
            let timeMillisecond = 32400000; //9AM
            if(month==='dec'){
                monthNumber = 11; //december
            }
            if(time===4){
                timeMillisecond = 57600000; //4PM
            }
            const dayMillisecond = new Date(this.currentYear, monthNumber, 21).getTime();
            this.updateSunPosition((dayMillisecond+timeMillisecond)-this.locationTimeOffset-this.userTimeOffset);
            serverBus.$emit('timeChange',dayMillisecond, timeMillisecond);
        },
        async irradianceSwitch(){
            this.irradianceLoading = true;
            if(!this.irradianceEnabled){
                this.hideHeatmap();
                this.hideSolarAccess();
                this.irradianceLoading = false;
            }
            else{
                this.showHeatmap().then(() => {
                    this.showSolarAccess().then(() => {
                        this.irradianceLoading = false;
                    })
                });
            }
        },

        toggleClassSettingBtnOne() {
        this.activeSettingOne = !this.activeSettingOne;
        this.activeSettingTwo = false;
        this.activeSettingThree = false;
        this.activeSettingFour = false;
        },
        toggleClassSettingBtnTwo() {
        this.activeSettingTwo = !this.activeSettingTwo;
        this.activeSettingOne = false;
        this.activeSettingThree = false;
        this.activeSettingFour = false;

        },
        toggleClassSettingBtnThree() {
        this.activeSettingThree = !this.activeSettingThree;
        this.activeSettingOne = false;
        this.activeSettingTwo = false;
        this.activeSettingFour = false;
        },
        toggleClassSettingBtnFour() {
        this.activeSettingFour = !this.activeSettingFour;
        this.activeSettingThree = false;
        this.activeSettingTwo = false;
        this.activeSettingOne = false;
        },
    },
};
</script>

<style scoped>

    .design-overview-body {
        height: 100%;
        overflow: hidden;
    }
    .design-overview-header {
        display: flex;
        justify-content: space-between;
        height: 60px !important;
        background-color: #f5f5f5;
        z-index: 9999;
        box-shadow: 0px 1px 12px 10px rgba(0, 0, 0, 0.055);
    }
    .design-overview-title {
        color: #005482;
        line-height: 60px;
        padding-left: 20px;
        font-size: 35px;
        font-weight: 1000;
        letter-spacing: 1px;
    }
    .design-overview-logo {
        /* width: 100px; */
        height: 40px;
        position: relative;
        float: right;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }
    .design-overview-main {
        height: calc(100% - 60px);
        flex-direction: row-reverse;
    }
    .design-overview-side-pane {
        width: 50% !important;
        max-width: 400px;
        height: 100%;
        background-color: #f5f5f5;
        overflow: hidden;
    }
    .design-overview-side-pane-div {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;
    }
    .design-overview-side-pane-swipe-up-pill {
        height: 20px;
        width: 40px;
        margin-bottom: -5px;
        display: none;
    }
    .design-overview-side-pane-swipe-up-text {
        display: none;
        font-size: 10px;
        margin-bottom: -20px;
        opacity: 0;
    }
    .design-overview-side-pane-swipe-down-pill {
        height: 20px;
        width: 40px;
        margin-bottom: -5px;
        display: none;
    }
    .design-overview-canvas {
        padding: 0px;
    }
    .design-overview-section {
        padding-bottom: 0px;
        flex: 0 0 auto;
        width: 100%
    }
    .design-overview-section-heading {
        font-size: 20px;
        font-weight: bold;
        margin-left: -6px;
        color: #777;
        text-align: left;
    }
    .organisation_detail {
        display: flex;
        justify-content:center;
    }
    .design-overview-footer {
        display: flex;
        flex: 1 0 auto;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        line-height: 1.5;
        padding-bottom: 10px;
        height: auto  !important;
        padding-top: 24px;
    }
    .design-overview-footer-links {
        margin: 0px 5px;
        color: #005482;
        text-decoration: none;
    }
    .loader-container {
        display: flex;
    }
    .loader {
        display: flex;
        width:100%;
        height: 100%;
        justify-content: center;
        align-content: center;
        align-items: center;
    }
    .loader_image {
        max-width: 90%;
    }

    .shadEffContainer{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0px 0px 0px;
        width: 100%;
        border-top: 2px solid #ccc;
        margin-top: 24px;
    }

    .shadEffHeading{
        font-size: 20px;
        font-weight: bold;
        color: #777;
    }

    .shadEffHeadingActive{
        color: #263342;
        font-size: 20px;
        font-weight: bold;
    }

    .design-overview-body >>> .el-switch.is-checked .el-switch__core{
        border-color: #005482 !important;
        background-color:#005482 !important;
    }

    .design-overview-body >>> .el-switch__core {
        width: 40px !important;
        height: 26px !important;
        border: 1px solid #cccccc;
        border-radius: 14px;
        background: #cccccc;
    }

    .design-overview-body >>> .el-switch.is-checked .el-switch__core::after{
        left: 78%;
    }

    .design-overview-body >>> .el-switch__core:after{
        width: 22px;
        height: 22px;
    }

    .quickViewContainer{
        margin-top: 16px;
    }

    .quickViewHeading{
        font-size: 19px;
        font-weight: bold;
        color: #263342;
        text-align: left;
    }

    .quickViewFlexContainer{
        display: grid;
        grid-template-columns: 48% 48%;
        gap: 16px;
        margin-top: 12px;
    }

    .btnQV{
        font-size: 16px;
        font-weight: bold;
        padding: 16px 16px;
        border-radius: 4px;
        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.12);
        background-color: #fff;
        color: #222;
        border: none;
        cursor: pointer;
    }

    .btnQV.activeSettingOne,
    .btnQV.activeSettingTwo,
    .btnQV.activeSettingThree,
    .btnQV.activeSettingFour {
        color: #fff;
        border-radius: 4px;
        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.12);
        background-color: #263342;
    }

    .irrContainer{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 20px 0px 0px 0px;
        border-top: 2px solid #ccc;
        margin-top: 30px;
    }

    .irrHeading{
        font-size: 20px;
        font-weight: bold;
        color: #777;
    }

    .irrHeadingActive{
        font-size: 20px;
        font-weight: bold;
        color: #263342;
    }

    .flexCont {
        width: 100%;
        padding: 0px 20px;
    }

    .flexCont >>> .el-main {
        padding: 20px 10px 0px 10px;
        overflow: hidden;
    }

    .flexContRev {
        width: 100%;
    }

    @media only screen and (max-width: 767px) and (orientation: portrait) {
        .design-overview-header {
            height: 50px !important;
        }
        .design-overview-title {
            font-size: 25px;
            letter-spacing: 0px;
            padding-left: 10px;
            line-height: 50px;
        }
        .design-overview-logo {
            /* width: 75px; */
            height: 30px;
        }
        .design-overview-main {
            flex-direction: column-reverse;
            height: calc(100% - 50px);
            position: relative;
        }
        .design-overview-side-pane {
            width: 100% !important;
            max-width: unset;
            height: 35vh;
            margin-top: -10px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            z-index: 100;
            padding-top: 16px;
            position: absolute;
        }
        .design-overview-side-pane-div {
            overflow: hidden;
            overflow-y: scroll;
        }

        .imgCont {
            position: absolute;
            bottom: 33vh;
            right: 50%;
            border-radius: 50%;
            background: #f5f5f5;
            z-index: 100000;
            transform: translate(50%, 0%);
        }

        .bottomImgCont {
            bottom: 4px;
        }
        .design-overview-side-pane-swipe-up-pill {
            display: block;
            z-index: 200;
            width: 30px;
            filter: invert(1);
            height: auto;
        }
        .design-overview-side-pane-swipe-down-pill {
            display: none;
            z-index: 200;
            width: 30px;
            filter: invert(1);
            height: auto;
        }
        .design-overview-side-pane-swipe-up-text {
            display: block;
            animation-name: design-overview-side-pane-swipe-up-text__slide-up;
            animation-duration: 4s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: 3;
            display: none;
        }
        @keyframes design-overview-side-pane-swipe-up-text__slide-up {
            0% {
                opacity: 0;
                transform: translateY(6px);
            }
            30% {
                opacity: 0.3;
                transform: translateY(0px);
            }
            70% {
                opacity: 0.3;
                transform: translateY(0px);
            }
            100% {
                opacity: 0;
                transform: translateY(-6px);
            }
        }
        .design-overview-side-pane__swipe-top {
            height: 0px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            animation-name: design-overview-side-pane__slide-up;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-side-pane__slide-up {
            from {
                height: 35vh;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            to {
                height: 0%;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
        }
        .design-overview-side-pane__swipe-bottom {
            height: 35vh;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            animation-name: design-overview-side-pane__slide-down;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-side-pane__slide-down {
            from {
                height: 0%;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            to {
                height: 35vh;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
        }
        .design-overview-side-pane-div__swipe-top {
            overflow: auto;
            margin-top: 0px;
            /* height: calc(100% + 220px); */
            height: 0px;
            animation-name: design-overview-side-pane-div__swipe-top__slide-up;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-side-pane-div__swipe-top__slide-up {
            from {
                overflow: hidden;
                margin-top: 0;
                height: 35vh;
            }
            to {
                overflow: auto;
                /* margin-top: -220px; */
                /* height: calc(100% + 220px); */
                height: 0%;
            }
        }
        .design-overview-side-pane-div__swipe-bottom {
            overflow: scroll;
            margin-top: 0;
            height: 100%;
            animation-name: design-overview-side-pane-div__swipe-top__slide-down;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-side-pane-div__swipe-top__slide-down {
            from {
                overflow: auto;
                margin-top: -220px;
                height: calc(100% + 220px);
            }
            to {
                overflow: hidden;
                margin-top: 0;
                height: 100%;
            }
        }
        .design-overview-canvas__swipe-top {
            /* opacity: 0; */
            animation-name: design-overview-canvas__swipe-top__slide-up;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-canvas__swipe-top__slide-up {
            from {
                opacity: 1;
            }
            to {
                opacity: 1;
            }
        }
        .design-overview-canvas__swipe-bottom {
            opacity: 1;
            animation-name: design-overview-canvas__swipe-top__slide-bottom;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
        }
        @keyframes design-overview-canvas__swipe-top__slide-bottom {
            from {
                opacity: 1;
            }
            to {
                opacity: 1;
            }
        }

        .flexContRev {
            display: flex;
            flex-direction: column-reverse;
        }

        .quickViewContainer {
            display: none;
        }

        .shadEffContainer{
        padding: 0px 0px 16px 0px;
        border-bottom: 2px solid #ccc;
        border-top: none;
        margin-top: 16px;
    }
    .irrContainer{
        padding: 0px 0px 16px 0px;
        border-bottom: 2px solid #ccc;
        border-top: none;
        margin-top: 16px;
    }

    #design-canvas {
        height: 100% !important;
    }
    }
</style>
