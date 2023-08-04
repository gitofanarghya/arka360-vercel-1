<template>
    <div id="layers">
        <el-popover
            v-model="popperVisible"
            placement="right">
            <div

                style="text-align: left;"
                @click="popperVisible = !popperVisible">
                <div class="load-image-div">
                    <el-checkbox
                        :value="mapImageVisible"
                        class="button-sidebar-dropdown checkbox-sidebar"
                        @change="toggleMapImageFunc">
                        Show Map image
                    </el-checkbox>
                    <!-- TODO: Remove this hard coding of color -->
                    <!-- <div style="background-color: #121212">
                        <button
                            id="changeMapButton"
                            :disabled="!mapImageVisible"
                            class="upload-map-button"
                            @click="toggleUploadBoxVisibility">
                            <img
                                height="25px"
                                width="25px"
                                src="https://front-end-assests.s3-us-west-2.amazonaws.com/upload_map.svg"
                                alt="Add other sources">
                            Add Map
                        </button> -->
                        <!-- alteration in style to be taken care in refactor -->
                    <!-- </div> -->
                </div>
                <el-checkbox
                    v-model="lengthVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleLengthFunc">
                    Length
                </el-checkbox>
                <el-checkbox
                    v-model="arcVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleArcFunc">
                    Arc
                </el-checkbox>
                <el-checkbox
                    v-if="isView3D"
                    v-model="rafterVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleRafterFunc">
                    Rafter, Rail & Attachment
                </el-checkbox>
                <el-checkbox
                    v-model="dimensionVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleDimensionFunc">
                    Dimension
                </el-checkbox>
                <el-checkbox
                    v-if="isView3D"
                    v-model="propertyVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="togglePropertyFunc">
                    Property Line
                </el-checkbox>
                <el-checkbox
                    v-model="showStringing"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleShowStringingFunc">
                    Show Stringing
                </el-checkbox>
                <el-checkbox
                    v-model="setbackVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleSetbackFunc">
                    Setback
                </el-checkbox>
                <el-checkbox
                    v-model="edgeCenterVisible"
                    class="button-sidebar-dropdown checkbox-sidebar"
                    @change="toggleEdgeCenterFunc">
                    Edge Center
                </el-checkbox>
            </div>
            <button
                slot="reference"
                :disabled="!layersEnabled"
                class="iconLeftSideBar-layers button-sidebar-icons"/>
        </el-popover>
        <!-- <upload-dialog
            :upload-box-visible.sync="uploadBoxVisible"
            :get-image-dimensions="getImageDimensions"
            :get-default-ground-size="getDefaultGroundSize"
        /> -->
    </div>
</template>

<script>
// import { Image } from 'element-ui';
// import { debuglog } from 'util';
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_LAYERS } from '../../../componentManager/componentManagerConstants';
import UploadDialog from './uploadDialog/uploadDialog.vue';
import {POLYGON_EDGE_CENTER_VISIBILTY_DEFAULT, EDGE_LENGTH_VISIBILTY_DEFAULT, ARC_VISIBILTY_DEFAULT, RAFTER_VISIBILTY_DEFAULT, PROPERTY_VISIBILTY_DEFAULT, DIMENSION_VISIBILTY_DEFAULT, SETBACK_VISIBILTY_DEFAULT, MAPIMAGE_VISIBILTY_DEFAULT, STRINGING_VISIBILTY_DEFAULT} from '../../../core/coreConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';
import { useMapImagesStore } from '../../../stores/mapImages';

export default {
    name: 'Layers',
    components: {
        UploadDialog,
    },
    data() {
         return {
            isView3D: true,
            // mapImageVisible: MAPIMAGE_VISIBILTY_DEFAULT,
            popperVisible: false,
            lengthVisible: EDGE_LENGTH_VISIBILTY_DEFAULT,
            arcVisible: ARC_VISIBILTY_DEFAULT,
            rafterVisible: RAFTER_VISIBILTY_DEFAULT,
            propertyVisible: PROPERTY_VISIBILTY_DEFAULT,
            dimensionVisible: DIMENSION_VISIBILTY_DEFAULT,
            showStringing: STRINGING_VISIBILTY_DEFAULT,
            setbackVisible: SETBACK_VISIBILTY_DEFAULT,
            edgeCenterVisible: POLYGON_EDGE_CENTER_VISIBILTY_DEFAULT,
            uploadBoxVisible: false,
            getImageDimensions: () => {},
            getDefaultGroundSize: () => {},
        };
    },
    nonReactiveData() {
        return {
            toggleMapImageFunc: () => {},
            toggleLengthFunc: () => {},
            toggleArcFunc: () => {},
            toggleRafterFunc: () => {},
            togglePropertyFunc: () => {},
            toggleDimensionFunc: () => {},
            toggleShowStringingFunc: () => {},
            toggleSetbackFunc: () => {},
            toggleEdgeCenterFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            layersEnabled: state => state.layersEnabled,
        }),
        ...mapState(useMapImagesStore, {
            mapImageVisible: state => state.groundMapImageVisible,
        }),
    },
    mounted() {
        serverBus.$once(
            INIT_LAYERS,
            (
                toggleLengthFunc,
                toggleArcFunc,
                toggleRafterFunc,
                togglePropertyFunc,
                toggleDimensionFunc,
                toggleShowStringingFunc,
                toggleSetbackFunc,
                toggleMapImageFunc,
                getImageDimensions,
                getDefaultGroundSize,
                toggleEdgeCenterFunc,
            ) => {
                this.toggleLengthFunc = toggleLengthFunc;
                this.toggleArcFunc = toggleArcFunc;
                this.toggleRafterFunc = toggleRafterFunc;
                this.togglePropertyFunc = togglePropertyFunc;
                this.toggleDimensionFunc = toggleDimensionFunc;
                this.toggleShowStringingFunc = toggleShowStringingFunc;
                this.toggleSetbackFunc = toggleSetbackFunc;
                this.toggleMapImageFunc = toggleMapImageFunc;
                this.getImageDimensions = getImageDimensions;
                this.getDefaultGroundSize = getDefaultGroundSize;
                this.toggleEdgeCenterFunc = toggleEdgeCenterFunc;
            },
        );
        this.$root.$on('onViewChange', data => {
            this.isView3D = data; 
        });
    },
    methods: {
        toggleUploadBoxVisibility() {
            this.uploadBoxVisible = true;
        },
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>

<style type="text/css" scoped>

.el-checkbox .el-checkbox__input {
    padding-left: 10px;
    box-sizing: border-box;
}

.el-checkbox {
    margin-right: 0 !important;
    color: #666666 !important;
}

.el-checkbox__input.is-checked + .el-checkbox__label {
    color: #fff;
    font-weight: lighter;
}

.el-checkbox__inner {
    border: none !important;
    width: 13px;
    height: 13px;
}

.load-image-div {
    line-height: 36px;
    display: flex;
}

.upload-map-button {
    border: 1px solid #fff;
    border-radius: 5px;
    height: 31px;
    position: absolute;
    right: 0px;
    background: transparent;
    box-shadow: none;
    width: fit-content !important;
    color: white;
    font-weight: 400;
    margin-right: 7px;
    margin-top: 4px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0px 5px;
}

.upload-map-button[disabled="disabled"] {
    opacity: 0.4;
    cursor: default !important;
}

.upload-map-button:hover {
    cursor: pointer;
}
</style>
