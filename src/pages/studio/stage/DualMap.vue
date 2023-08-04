<template>
<div v-if="this.dualMapMode" class="dualMapContainer">
    <div id="map_canvas">
    </div>
    <div class="btnContainer">
        <el-button :disabled="!satelliteViewEnabled || satelliteButtonStatus" class="commonBtnClass mapViewBtn" :class="satelliteButtonStatus?'activeButton':''" @click="satelliteMapFunc">Map View</el-button>
        <el-button :disabled="!streetViewEnabled || streetViewInvalid || !satelliteButtonStatus" class="commonBtnClass streetViewBtn" :class="!satelliteButtonStatus?'activeButton':''" @click="streetMapFunc">Streetview</el-button>
    </div>
</div>
</template>

<script>
import { serverBus } from '../../../main';
import { useStudioStageStore } from '../../../stores/studio-stage';
import { mapState } from 'pinia';

export default {
    name: 'DualMap',
    nonReactiveData(){
        return{
            switchSatelliteMap: () => {},
            switchStreetMap: () => {},
        }
    },
    data(){
        return {
            satelliteButtonStatus: true,
        }
    },
    methods :{
        satelliteMapFunc() {
            this.switchSatelliteMap();
            this.satelliteButtonStatus = true;
        },
        streetMapFunc() {
            this.switchStreetMap();
            this.satelliteButtonStatus = false;
        }
    },
    mounted() {
        serverBus.$on('satelliteMapFunc', (satelliteMapFunc) => {
            this.switchSatelliteMap = satelliteMapFunc;
            this.satelliteButtonStatus = true;
        });
        serverBus.$on('streetMapFunc', (streetMapFunc) => {
            this.switchStreetMap = streetMapFunc;
        });
    },
    computed: {
        ...mapState(useStudioStageStore, {
            dualMapMode: state => state.dualMapMode,
            streetViewEnabled: state => state.streetViewEnabled,
            streetViewInvalid: state => state.streetViewInvalid,
            satelliteViewEnabled: state => state.satelliteViewEnabled,
        }),
    }
};
</script>

<style lang="scss">
    @import '../../../styles/components/htmlText';
</style>

<style type="text/css" scoped>
.dualMapContainer {
    position: relative;
}

#map_canvas {
    height: 100%;
    width: 100%;
}

.btnContainer {
    position: absolute;
    bottom: 40px;
    left: 16px;
}

.commonBtnClass {
    position: relative;
    font-size: 14px;
    font-weight: 600;
    height: 40px;
    width: 96px;
    margin: 0px;
    z-index: 2;
    border-radius: 0px;
}

.mapViewBtn {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.streetViewBtn {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

.activeButton:disabled, .activeButton {
    background: #3a8ee6;
    border-color: #3a8ee6;
    color: #FFFFFF;
    outline: none;
}
</style>