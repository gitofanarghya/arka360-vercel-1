<template>
    <div id="homeSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                    <p class="sappane-label"> Project Name <span class="sappane-value"  v-html="projectNameFiltered(projectName)"></span></p>
                    <p class="sappane-label"> Design Name <span class="sappane-value"> {{ designName }} </span></p>
                    <p class="sappane-label"> Latitude <span class="sappane-value"> {{ latitude }} </span></p>
                    <p class="sappane-label"> Longitude <span class="sappane-value"> {{ longitude }} </span></p>
                    <p class="sappane-label"> DC Size <span class="sappane-value"> {{ dcSize }} kW</span></p>
                    <p class="sappane-label"> Stringed DC Size <span class="sappane-value"> {{ stringedDcSize }} kW</span></p>
                    <p class="sappane-label"> AC Size <span class="sappane-value"> {{ acSize }} kW</span></p>
                    <p class="sappane-label"> DC-AC Ratio
                       <el-tooltip
                            content="To Be Decided"
                            placement="top"
                        >
                        <span class="sappane-value"> {{ loadRatio }}</span>
                        </el-tooltip>
                    </p>
                    <p class="sappane-label"> Module Quantity <span class="sappane-value"> {{ moduleQuantity }}</span></p>
                    <p class="sappane-label"> Inverter Quantity  <span class="sappane-value"> {{ inverterQuantity }}</span></p>
                    <p class="sappane-label"> Optimizer Quantity  <span class="sappane-value"> {{ optimizerQuantity }}</span></p>
                    <!-- <p class="sappane-label"> DC Cables Length  <span class="sappane-value"> {{ dcCablesLength }} mm</span></p>
                    <p class="sappane-label"> AC Cables Length  <span class="sappane-value"> {{ acCablesLength }} mm</span></p> -->
                    <br>
                    <div class="sappane-label" v-if="!summaryData.isProductionEnv">
                        <el-switch
                                v-model="rStatsEnabled"
                                @change="summaryData.toggleRStats"
                            />
                    </div>
                    <br>
                    <div v-if="nearmapEnabled && isLidarEnabled" class="sappane-label">
                        <span style="padding-right: 5px; color: #eaeaea; font-size: 0.84vw">
                            LIDAR MODE
                        </span>
                        <el-tooltip 
                            effect="dark" 
                            placement="top-start" 
                            content="Please Select Nearmap with 3D data"
                            :disabled="isLidarValid">
                            <el-switch
                                v-model="lidarSwitchEnabled"
                                v-if="isLidarValid"
                                :disabled="!isLidarValid"
                                active-color="#3498db"
                                class="sappane-switch"
                                @change="summaryData.lidarMode"
                            />
                            <el-switch
                                v-if="!isLidarValid"
                                active-color="#3498db"
                                class="sappane-switch"
                                @change="displayMapPopup"
                            />
                        </el-tooltip>
                    </div>
                    <upload-dialog
                        :upload-box-visible.sync="uploadBoxVisible"
                        :get-image-dimensions="summaryData.getImageDimension"
                        :get-default-ground-size="summaryData.getGroundSize"
                        :fetch-lidar-data="summaryData.lidarFetchData"
                    />
                    <div v-if="nearmapEnabled && isLidarEnabled">
                        <button
                            id="autofit"
                            :disabled="!(lidarSwitchEnabled && !summaryData.sceneIn3D() && summaryData.lidarDataFetched)"
                            @click="summaryData.autoFitModel">
                            AutoFit all Models
                        </button>
                    </div>
                    <!-- <div class="sappane-label">
                        <span style="padding-right: 5px; color: #eaeaea; font-size: 0.84vw">
                            GOOGLE 3D MODE
                        </span>
                        <el-tooltip 
                            effect="dark" 
                            placement="top-start" 
                            :disabled="isTileValid">
                            <el-switch
                                v-model="isGoogle3dSwitchEnabled"
                                v-if="isTileValid"
                                :disabled="!isTileValid"
                                active-color="#3498db"
                                class="sappane-switch"
                                @change="onClick3dSwitch"
                            />
                        </el-tooltip>
                    </div>
                    <div v-if="isGoogle3dSwitchEnabled">
                            <el-tooltip 
                                    effect="dark" 
                                    placement="top-start" 
                                    content="All smartroofs will be fitted to 3D data"
                                    >
                            <button
                                id="autofit"
                                class="btn"
                                :disabled="!isFitToTilesEnabled"
                                @click="summaryData.fitToTiles">
                                AutoFit to Google 3D
                            </button>
                        </el-tooltip>
                    </div> -->
                    <div 
                        style="overflow: scroll;" 
                        class="firefoxScrollbarRemover" 
                        id="inverterSimulationWrapper">
                        <time-controller
                            v-if="summaryEnabled"
                            :tween-data="summaryData.sunSimulation"
                            :lidarMode="lidarSwitchEnabled"/>
                        <br>
                    </div>
                    <GenerationEstimation
                        :annualConsumption="annualConsumption"
                        :isDesignSaved="summaryData.isDesignSaved"
                        :panelMap="summaryData.panelMap"
                        :roofMap="summaryData.roofMap"
                        :acSize="acSize"
                        :dcSize="dcSize"
                        style="width: 96%;
                            padding-bottom: 10px;
                            z-index: 5;
                            padding-right: 10px;
                            position: absolute;
                            background: #141414;
                            bottom: 0px"/>
                </div>
        </div>
        <modal-box />
    </div>
</template>

<script>
import { mapState } from 'pinia';
import timeController from './timeController.vue';
import modalBox from '../../properties/modalBox.vue';
import GenerationEstimation from './generationEstimation.vue';
import UploadDialog from '../../../sidebar/uploadDialog/uploadDialog.vue';
import STUDIO_STORE_MUTATION_TYPES from '../../../../../store/modules/studio/mutationTypes';
import API from '@/services/api';
import { serverBus } from '../../../../../main';
import { useDesignStore } from '../../../../../stores/design';
import { useStudioSapPaneStore } from '../../../../../stores/studio-sapPane';
import { useStudioStore } from '../../../../../stores/studio';

export default {
    name: 'HomeSummary',
    components: {
        timeController,
        GenerationEstimation,
        UploadDialog,
        modalBox,
    },
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    isDesignSaved: true,
                    latitude: 0,
                    longitude: 0,
                    setDesignDefaultOpen: () => 0,
                    fitToTiles: () => 0,
                    designDefaultsOpened: false,
                    getDcSize: () => 0,
                    getDcCablesLength: () => 0,
                    getStringedDcSize: () => 0,
                    getAcSize: () => 0,
                    getAcCablesLength: () => 0,
                    getInverterQuantity: () => 0,
                    getOptimizerQuantity: () => 0,
                    getModuleQuantity: () => 0,
                    getImageDimension: () => 0,
                    getGroundSize: () => 0,
                    lidarFetchData: () => 0,
                    sceneIn3D: () => 0,
                    lidarMode: () => 0,
                    lidarModeEnabled: 0,
                    lidarDataFetched: 0,
                    mapSource: 0,
                    mapZoom: 0,
                    autoFitModel: () => 0,
                    sunSimulation: {},
                    panelMap: () => [],
                    roofMap: () => {},
                    toggleRStats: () => {},
                    isProductionEnv: true,
                };
            },
        },
    },
    data() {
        return {
            annualConsumption: 0,
            projectName: 'Project',
            designName: 'Design',
            designId: this.$route.params.designId,
            rStatsEnabled: false,
            nearmapEnabled: false,
            isLidarEnabled: false,
            isTileValid: true,
            // isGoogle3dSwitchEnabled: false,
            isAutofitButtonEnabled: false,
            uploadBoxVisible: false,
            isOrgUnirac : false,
        };
    },
    methods: {

        projectNameFiltered(val){
            if(val){
                const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
                return eval("`" + escapedVal + "`");
            }
            else{
                return "-"
            }
        },

        async isOrganisationUnirac() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!Object.keys(responseData).length){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            this.isOrgUnirac = (responseData.name === 'Unirac' && responseData.id === 114 );
        },
        async getProjectDesignName() {
            try {
                const response = await API.DESIGNS.FETCH_PROJECT_DESIGN_NAME(this.designId);
                this.annualConsumption = response.data.project.consumption_details.annual_consumption;
                this.projectName = response.data.project.name;
                this.designName = response.data.name;
            }
            catch (error) {
                console.error(error);
            }  
        },
        async isNearmapEnabled() {
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!Object.keys(responseData).length){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            this.nearmapEnabled = responseData.nearmap_enabled;
            this.isLidarEnabled = responseData.is_lidar_enabled;
        },
        toggleUploadBoxVisibility() {
            this.uploadBoxVisible = true;
        },
        displayMapPopup() {
            serverBus.$emit('modalBoxOn', this.toggleUploadBoxVisibility, 'Please Select Nearmap with 3D data in Add Map. Are you sure you want to continue ?');
        },
        onClick3dSwitch(val) {
            if (val) {
                serverBus.$emit('load3dTiles');
                this.isAutofitButtonEnabled = this.isGoogle3dSwitchEnabled;
            } else {
                this.isAutofitButtonEnabled = this.isGoogle3dSwitchEnabled;
                serverBus.$emit('hide3DTiles');
            }
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            summaryEnabled: state => state.summaryEnabled,
        }),
        ...mapState(useDesignStore, {
            designSettingsData: 'GET_DESIGN_VERSION_SETTINGS',
        }),
        latitude() {
            return parseFloat(this.summaryData.latitude).toFixed(6);
        },
        longitude() {
            return parseFloat(this.summaryData.longitude).toFixed(6);
        },
        dcSize() {
            return this.summaryData.getDcSize().toFixed(2);
        },
        dcCablesLength() {
            return this.summaryData.getDcCablesLength().toFixed(2);
        },
        stringedDcSize() {
            return (this.summaryData.getStringedDcSize() / 1000).toFixed(2);
        },
        acSize() {
            // TODO: Remove this jugaad
            return this.summaryData.getAcSize().toFixed(2);
        },
        acCablesLength() {
            return this.summaryData.getAcCablesLength().toFixed(2);
        },
        inverterQuantity() {
            return this.summaryData.getInverterQuantity();
        },
        optimizerQuantity() {
            return this.summaryData.getOptimizerQuantity();
        },
        loadRatio() {
           
            if(Number(this.dcSize) && Number(this.acSize)){
                return (this.dcSize / this.acSize).toFixed(2);
            }
            else{
                return "TBD";
            }
                
        },
        isLidarValid() {
            if(this.summaryData.mapSource == 'nearmap3D'){
                return true;
            }
            else{
                return false;
            }
        },
        lidarSwitchEnabled: {
            get() {
                return useStudioStore().lidarSwitchEnabled;
            }, 
            set() {
                useStudioStore().SET_LIDAR_STATUS(this.lidarSwitchEnabled)
                document.activeElement.blur();
            },
        },
        isGoogle3dSwitchEnabled: {
            get() {
                return useStudioStore().isGoogle3dSwitchEnabled;
            }, 
            set() {
                useStudioStore().SET_GOOGLE3D_STATUS(!useStudioStore().isGoogle3dSwitchEnabled);
                // useStudioStore().SET_FITGOOGLE3D_STATUS(true);
                document.activeElement.blur();
            },
        },
        isFitToTilesEnabled: {
            get() {
                return useStudioStore().isFitToTilesEnabled;
            }, 
            set() {
                useStudioStore().SET_FITGOOGLE3D_STATUS(!useStudioStore().isFitToTilesEnabled);
                document.activeElement.blur();
            },
        },
        moduleQuantity() {
            return Number(this.summaryData.getModuleQuantity()).toFixed(0);
        }
    },
    created() {
        this.isOrganisationUnirac();
        this.getProjectDesignName();
        this.isNearmapEnabled();
        if(this.isOrgUnirac && !this.summaryData.designDefaultsOpened){
            serverBus.$emit(
                'newEditProfileVisible',
                this.designSettingsData,
                'designVersionSettings',
            );
            this.summaryData.setDesignDefaultOpen();
        }
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../../styles/components/input';
</style>

<style type="text/css" scoped>
.homeSummaryHeading .el-button {
    background-color: #141414 !important;
    color: #fafafa;
    border: 1px solid #fafafa;
    font-size: 0.8vw;
    padding: 0.4vw;
}

#autofit {
    width: auto !important;
    padding: 1vh !important;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    border-radius: 4px;
    width: 6vw;
    background-color: inherit !important;
    font-size: 0.83vw !important;
    border: 1px solid white;
    color: white;
}

#autofit:disabled {
    background-color: inherit !important;
    cursor: not-allowed;
    border: 1px solid rgba(225, 225, 225, 0.4) !important;
    color: #4c4c4c !important;
}

.tableDeleteButton .el-button--info {
    background-color: inherit !important;
    color: white;
    border: none !important;
}

#homeSummary .el-table {
    font-size: 10px;
    color: white !important;
    background-color: #141414 !important;
}

#homeSummary .el-table td div {
    color: #fff;
    font-size: 0.9vw;
}

#homeSummary .el-table th > .cell {
    font-size: 0.9vw;
    color: white;
}

#homeSummary .el-table th,
#homeSummary .el-table td {
    background-color: #141414 !important;
    line-height: 15px !important;
    padding: 5px 0 !important;
    min-width: 50px;
}

#homeSummary .el-table__header {
    width: 100% !important;
}

#homeSummary .el-table::before {
    height: 0;
}

#homeSummary ::-webkit-scrollbar {
    display: none;
}

#homeSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#homeSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

.vb-content {
    scrollbar-width: none 
}
          
.btn:active {
    transform: scale(0.98);
    /* Scaling button to 0.98 to its original size */
    box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
    /* Lowering the shadow */
}

#homeSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>