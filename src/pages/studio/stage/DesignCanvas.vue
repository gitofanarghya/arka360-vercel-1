<template>
        <div class="designCanvas">
            <canvas id="design-canvas"/>
        <!-- <div class="btnsContainer" v-if="editMode">
            <div class="">
                <el-button :disabled="!dualMapEnabled" class="dualBtnClass" :class="dualMapMode? 'dualMapBtn' :''" @click="switchDualMap" ><span class="button-content">
                    <img class="dual-map-icon" :src="dualMapIconUrl"/>Dual Map</span></el-button>
            </div>
            <div class="">
                <el-button :disabled="!resizeEnabled" class="dualBtnClass" @click="toggleMapEditorVisibility"><span class="button-content">
                    <img class="dual-map-icon" src="../../../assets/drop/resize.svg"/>Resize</span></el-button>
            </div>
            <map-dropdown/>
        </div>
            <map-editor 
                v-if="mapEditorVisible"
                :updateMapImageFunc='updateMapImageFunc'
                :mapEditorVisible.sync="mapEditorVisible"
                :toggleMapEditorVisibility="toggleMapEditorVisibility"
            /> -->
    </div>
</template>

<script>
import { mapState } from 'pinia';
import {
    loadStage,
    destroyStudio,
} from '../../../componentManager/componentManager';
import MapDropdown from './MapDropdown.vue';
import { useStudioStageStore } from '../../../stores/studio-stage';
import MapEditor from '../PopUps/MapEditor.vue';
import UploadDialog from '../sidebar/uploadDialog/uploadDialog.vue';
import { serverBus } from '../../../main';
import { UPDATE_MAP_IMAGE } from '../../../componentManager/componentManagerConstants';

let stage = {};
export default {
  components: { MapDropdown,
                UploadDialog,
                MapEditor,
                },
    name: 'DesignCanvas',
    props: {
        latitude: {
            type: Number,
            default: 28.612948,
        },
        longitude: {
            type: Number,
            default: 77.229557,
        },
        zoom: {
            type: Number,
            default: 19,
        },
        designSettings: {
            type: Object,
            default() {
                return {};
            },
        },
        mapImage: {
            type: Object,
            default() {
                return {};
            },
        },
        stageData: {
            type: Object,
            default() {
                return {};
            },
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        overviewMode: {
            type: Boolean,
            default: false,
        },
        designId: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return{
            switchDualMap: () => {},
            mapEditorVisible: false,
            updateMapImageFunc: function(){},

        }
    },
    mounted() {
        const vm = this;
        serverBus.$on(UPDATE_MAP_IMAGE, (updateMapImageFunc) => {
            vm.updateMapImageFunc = updateMapImageFunc;
        });

        const designCanvas = document.getElementById('design-canvas');
        const parent = designCanvas.parentElement;
        const parentPadding = parseInt(
            window.getComputedStyle(parent, null).getPropertyValue('padding-left'),
            10,
        );
        designCanvas.width = parent.offsetWidth - (2 * parentPadding);
        designCanvas.height = parent.offsetHeight - (2 * parentPadding);
        stage = loadStage(
            designCanvas,
            this.latitude,
            this.longitude,
            this.zoom,
            this.designSettings,
            this.mapImage,
            this.stageData,
        );

        if (!this.editMode) {
            stage.disableEditing();
            stage.setDesignId(this.designId);
        }

        if (this.overviewMode) {
            stage.switchTo3d();
        }
        this.canvasHeight();
        this.switchDualMap = stage.dualMapManager.switchDualMap.bind(stage.dualMapManager);
    },
    beforeDestroy() {
        stage.destroyStage();
        destroyStudio();
    },

    computed: {
        ...mapState(useStudioStageStore, {
            mapChangeEnabled: state => state.mapChangeEnabled,
            dualMapEnabled: state => state.dualMapEnabled,
            resizeEnabled: state => state.resizeEnabled,
            dualMapMode: state => state.dualMapMode,
        }),
        dualMapIconUrl() {
            return this.dualMapMode ? 
                new URL("../../../assets/drop/dualMapWhite.svg", import.meta.url).href  :
                new URL("../../../assets/drop/dualMap.svg",import.meta.url).href
        }
    },

    methods: {
        canvasHeight() {
            let wdthCnvs = document.getElementById("design-canvas");
            let hght = innerHeight;
            wdthCnvs.style.height = hght+"px";
        },
        toggleMapEditorVisibility() {
            // console.log("button worked")
            this.mapEditorVisible= !this.mapEditorVisible;
        }
    }
};
</script>

<style scoped>
.alarm{
    color: #b70000;
    text-shadow: 0 0 0 #b70000,
                 0 0 1px #fff,
                 0 0 1px #fff,
                 0 0 2px #fff,
                 0 0 2px #fff,
                 0 0 3px #fff,
                 0 0 3px #fff,
                 0 0 4px #fff,
                 0 0 4px #fff;
}

.rs-base{
    position: absolute;
    z-index: 10000;
    padding: 10px;
    background-color: #222;
    font-size: 10px;
    line-height: 1.2em;
    width: 350px;
    font-family: 'Roboto Condensed', tahoma, sans-serif;
    left: 0;
    top: 0;
    overflow: hidden;
}

.rs-base h1{
    margin: 0;
    padding: 0;
    font-size: 1.4em;
    color: #fff;
    margin-bottom: 5px;
    cursor: pointer;
}

.rs-base div.rs-group{
    margin-bottom: 10px;
}

.rs-base div.rs-group.hidden{
    display: none;
}

.rs-base div.rs-fraction{
    position: relative;
    margin-bottom: 5px;
}

.rs-base div.rs-fraction p{
    width: 120px;
    text-align: right;
    margin: 0;
    padding: 0;
}

.rs-base div.rs-legend{
    position: absolute;
    line-height: 1em;
}

.rs-base div.rs-counter-base{
    position: relative;
    margin: 2px 0;
    height: 1em;
}

.rs-base span.rs-counter-id{
    position: absolute;
    left: 0;
    top: 0;
}

.rs-base div.rs-counter-value{
    position: absolute;
    left: 90px;
    width: 30px;
    height: 1em;
    top: 0;
    text-align: right;
}

.rs-base canvas.rs-canvas{
    position: absolute;
    right: 0;
}

.designCanvas {
    position: relative;
    height: 100%;
    overflow: hidden;
}

.MapResizeBtnContainer {
    position: absolute;
    bottom: 40px;
    left: 260px;
}

.dualMapBtnContainer {
    position: absolute;
    bottom: 40px;
    left: 16px;
}
.dualBtnClass {
    position: relative;
    font-size: 14px;
    /* font-weight: 600; */
    height: 42px;
    width: auto;
    margin: 0px;
    z-index: 2;
    border-radius: 0px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    color: #000;
    padding: 8px 12px;
}
.dualMapBtn {
    background: #3a8ee6;
    border-color: #3a8ee6;
    color: #FFFFFF;
    outline: none;
}

.dualMapBtn:disabled {
    background: #3a8ee6;
    border-color: #3a8ee6;
    outline: none;
    color: #C0C4CC;
}

.btnsContainer {
    position: absolute;
    bottom: 16px;
    left: 16px;
    display: flex;
    column-gap: 8px;
    align-items: flex-end;
}

.button-content {
    display: flex;
    align-items: center;
    column-gap: 8px;
}

.dual-map-icon{
    height: 16px;
    width: 16px;
}

</style>

