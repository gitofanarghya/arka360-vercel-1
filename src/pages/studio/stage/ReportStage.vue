<template>
    <div id="report-stage">
        <color-bar/>
        <compass/>
        <design-canvas
            v-if="designLoaded"
            :latitude="latitude"
            :longitude="longitude"
            :zoom="zoom"
            :design-settings="designSettings"
            :map-image="mapImage"
            :stage-data="stageData"
            :overview-mode="overviewMode"
            :design-id="designId"/>
        <LoadingScreen 
        v-if="isLoadingVisible"
        />
    </div>
</template>

<script>
import { mapActions } from 'pinia';
import API from '@/services/api';
import designCanvas from './DesignCanvas.vue';
import colorBar from './ColorBar.vue';
import Compass from './Compass.vue';
import { INVALID_SCALE } from '../../../core/coreConstants';
import { serverBus } from "../../../main";

import LoadingScreen from '../../../components/ui/loadingScreen.vue'
import { useProjectStore } from '../../../stores/project';


export default {
    name: 'ReportStage',
    components: {
        designCanvas,
        colorBar,
        Compass,
        LoadingScreen,
    },
    props: {
        overviewMode: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            designLoaded: false,
            stageData: {},
            mapImage: {},
            designSettings: {},
            designId: -1,
            videoFunction: ()=>{},
            isLoadingVisible: false,
        };
    },
    computed: {
        latitude() {
            return parseFloat(this.stageData.latitude);
        },
        longitude() {
            return parseFloat(this.stageData.longitude);
        },
        zoom() {
            return parseInt(this.stageData.zoom, 10);
        },
    },
    async created() {

        try {
            const response = await API.DESIGN_VERSION_SCENE
                .FETCH_DESIGN_VERSION_SCENE(this.$route.params.designUUID);
            const result = response.data.results[0];
            this.stageData = result.scene;
            // localStorage.setItem('heatmap', result.scene.heat_map)
            // localStorage.setItem('solaraccessData', JSON.stringify(result.scene.solar_access))
            if (result.design.id !== undefined) {
                this.designId = result.design.id;
            }
            else {
                console.log('design id is undefined');
            } 

            this.mapImage = {
                url: (result.map_image.image === null || result.map_image.image === undefined) ?
                    this.stageData.imageURL : result.map_image.image,
                rotation: (result.map_image.rotation === null ||
                    result.map_image.rotation === undefined) ? 0 : result.map_image.rotation,
                scale: ((result.map_image.scale === null || result.map_image.scale === undefined)
                    ? INVALID_SCALE : result.map_image.scale),
                offset: (result.map_image.offset === null || result.map_image.offset === undefined)
                    ? [0, 0] : result.map_image.offset,
                source: (result.map_image.source === undefined ||
                    result.map_image.source === null) ? "google" : result.map_image.source,
                zoom: (result.map_image.zoom === undefined ||
                    result.map_image.zoom === null) ? 20 : result.map_image.zoom,
            };
            this.designSettings = JSON.parse(JSON.stringify(result.setting));
            this.UPDATE_WEATHER_ID({ weatherID: result.weather.id.toString() });
            this.designLoaded = true;
        }
        catch (error) {
            console.error('Error loading design', error);
        }
    },
    mounted(){
        serverBus.$once('getVideoFunction', (videoFunc) => {
            if( this.$route.query.hasOwnProperty('video')){
                //call the record video method
                if(this.$route.query.video ===  'true'){
                    this.isLoadingVisible = true;
                    videoFunc();
                }
            }
        });
    },
    methods: {
        ...mapActions(useProjectStore, {
            UPDATE_WEATHER_ID: 'UPDATE_WEATHER_ID',
        }),
    },
};
</script>

<style lang="scss">
    @import '../../../styles/components/htmlText';
</style>

<style type="text/css">
    #report-stage {
        height: 100%;
        overflow: hidden;
        width: 100%;
    }
</style>
