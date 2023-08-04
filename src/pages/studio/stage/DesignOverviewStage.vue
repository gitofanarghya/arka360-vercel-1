<template>
    <div id="design-overview-stage">
        <color-bar/>
        <compass/>
        <design-canvas
            :latitude="latitude"
            :longitude="longitude"
            :zoom="zoom"
            :design-settings="designSettings"
            :map-image="mapImage"
            :stage-data="stageData"
            :overview-mode="true"
        />
    </div>
</template>

<script>
import { mapActions } from 'pinia';
import designCanvas from './DesignCanvas.vue';
import colorBar from './ColorBar.vue';
import Compass from './Compass.vue';
import { useDesignStore } from '../../../stores/design';

export default {
    name: 'ReportStage',
    components: {
        designCanvas,
        colorBar,
        Compass,
    },
    props: {
        stageData: {
            type: Object,
            default() {
                return null;
            },
        },
        designSettings: {
            type: Object,
            default() {
                return null;
            },
        },
        mapImage: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    computed: {
        latitude() {
            this.toggleOverviewMode();
            return parseFloat(this.stageData.latitude);
        },
        longitude() {
            return parseFloat(this.stageData.longitude);
        },
        zoom() {
            return parseInt(this.stageData.zoom, 10);
        },
    },

    methods: {
        ...mapActions(useDesignStore, ["SET_OVERVIEW_MODE"]),

        toggleOverviewMode() {
            this.SET_OVERVIEW_MODE(true);
        },

    }
};
</script>

<style lang="scss">
    @import '../../../styles/components/htmlText';
</style>

<style type="text/css" scoped>
    #design-overview-stage {
        height: 100%;
        overflow: hidden;
        width: 100%;
        position: relative;
    }
</style>
