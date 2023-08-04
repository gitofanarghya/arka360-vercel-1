<template>
    <div
        id="sideBar"
        class="">
        <div class="sideBarTopPart">
            <!-- <div>
                <el-tooltip
                    content="Select"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <selection/>
                </el-tooltip>
            </div> -->
            <div>
                <el-tooltip
                    content="Model"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <model/>
                </el-tooltip>
            </div>
            <div v-if="!isIndianOrganization">
                <el-tooltip
                    content="Power Gazebo (G)"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <gazebo/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Obstruction"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <obstruction/>
                </el-tooltip>
            </div>
            <div v-if="!isVipPowerGazebo">
                <el-tooltip
                    content="Module"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <array/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="WireSize Calculator"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <wiring-zone/>
                </el-tooltip>
            </div>
            <!-- <div>
                <el-tooltip
                    :disabled="true"
                    content="Click to add BOS"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <bos/>
                </el-tooltip>
            </div> -->
            <div v-if="!isVipPowerGazebo">
                <el-tooltip
                    content="Components"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <ac-components/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    :content="heatMapHoverContent"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <heat-map/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    :content="solarAccessHoverContent"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <solar-access/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Dimension (D)"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <dimension/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Lasso Tool (L)"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <lasso/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Text Box (B)"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <text-box/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    :content="tooltipContentForAddMap"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <span>
                        <button
                            :disabled="isCrmUser() && !projectPermissionObject.map"
                            id="changeMapButton"
                            style="background-color: #121212; border: none; padding: 1.3vh 20px;"
                            @click="toggleUploadBoxVisibility">
                            <img
                                class="mapImg"
                                src="https://front-end-assests.s3-us-west-2.amazonaws.com/upload_map.svg"
                                alt="Add other sources">
                        </button>
                    </span>
                </el-tooltip>
            </div>
        </div>
        <upload-dialog
            :upload-box-visible.sync="uploadBoxVisible"
            :get-image-dimensions="getImageDimensions"
            :get-default-ground-size="getDefaultGroundSize"
            :fetch-lidar-data="fetchLidarData"
        />
        <div class="sideBarBottomPart">
            <div
                @click="updateMicroinvertersPresent">
                <el-tooltip
                    content="Views"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <views
                        :is-microinverters-optimizers-present="isMicroinvertersOptimizersPresent"
                        :update-microinverters-present="updateMicroinvertersPresent.bind(this)"
                    />
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Layers"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <layers/>
                </el-tooltip>
            </div>
            <div>
                <el-tooltip
                    content="Design Settings"
                    placement="right"
                    class="side-bar-tooltip-wrapper"
                    popper-class="side-bar-tooltip">
                    <design-settings/>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
import model from './model.vue';
import obstruction from './obstruction.vue';
import array from './subarray.vue';
import wiringZone from './wiringZone.vue';
import bos from './bos.vue';
import heatMap from './heatmap.vue';
import solarAccess from './solarAccess.vue';
import dimension from './dimension.vue';
import lasso from './lasso.vue';
import textBox from './textBox.vue';
import views from './views.vue';
import layers from './layers.vue';
import designSettings from './designSettings.vue';
import acComponents from './AcComponents.vue';
import UploadDialog from './uploadDialog/uploadDialog.vue';

import { mapState, mapActions } from 'pinia';
import { SET_SAVE, INIT_SIDEBAR } from '../../../componentManager/componentManagerConstants';
import { isCloselyEqual } from '../../../core/utils/comparisonUtils';
import selection from './selection.vue';
import gazebo from './gazebo.vue';
import API from '@/services/api/';
import { useDesignStore } from '../../../stores/design';
import { useProjectStore } from "../../../stores/project";
import { isCrmUser } from '../../../utils';


export default {
    name: 'SideBar',
    components: {
        model,
        obstruction,
        array,
        gazebo,
        wiringZone,
        bos,
        heatMap,
        solarAccess,
        dimension,
        lasso,
        textBox,
        views,
        layers,
        designSettings,
        acComponents,
        selection,
        UploadDialog,
    },
    data() {
        return {
            isDesignSaved: true,
            isMicroinvertersOptimizersPresent: false,
            uploadBoxVisible: false,
            getImageDimensions: () => {},
            getDefaultGroundSize: () => {},
            fetchLidarData: () => {},
            isVipPowerGazebo: false,
        };
    },
    nonReactiveData() {
        return {
            saveFunc: () => {},
            getMicroinverters: () => {},
            getOptimizersCount: () => {},
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            designVersionScene: state => state.versions.scene,
            projectId: state => state.project.id
        }),
        ...mapState(useProjectStore, {
            projectPermissionObject: 'GET_PERMISISON_OBJECT',
        }),
        tooltipContentForAddMap(){
            if(isCrmUser() && !this.projectPermissionObject.map)
                return "You dont have permission to add/edit Map Image.";
            else
                return "Add Map"    
        },
        solarAccessHoverContent() {
            if (this.isDesignSaved) {
                return 'Solar Access';
            }
            return 'Please Save the Design';
        },
        heatMapHoverContent() {
            if (this.isDesignSaved) {
                return 'Irradiance Map';
            }
            return 'Please Save the Design';
        },
        isIndianOrganization(){
            let organisationData = JSON.parse(localStorage.getItem('organisation'))
            return organisationData.country == 91 ? true : false
        }
    },
    async mounted() {
        this.$eventBus.$once(SET_SAVE, (saveFunc) => {
            this.saveFunc = saveFunc;
        });
        this.$eventBus.$once(INIT_SIDEBAR, (
            getMicroinverters, 
            getOptimizersCount,
            getImageDimensions,
            getDefaultGroundSize,
            fetchData,
            ) => {
            this.getMicroinverters = getMicroinverters;
            this.getOptimizersCount = getOptimizersCount;
            this.getImageDimensions = getImageDimensions;
            this.getDefaultGroundSize = getDefaultGroundSize;
            this.fetchLidarData = fetchData;
        });
        this.$eventBus.$on('designSaved', () => {
            this.isDesignSaved = !this.isDesignChanged();
            this.$eventBus.$emit('designSavedUpdated', this.isDesignSaved);
        });
        this.$eventBus.$on('designChanged', () => {
            this.isDesignSaved = !this.isDesignChanged();
            this.$eventBus.$emit('designSavedUpdated', this.isDesignSaved);
        });
        this.isVipPowerGazebo = await this.setGazeboStatus();
        // this.FETCH_PERMISSION_OBJECT(this.projectId);
    },
    beforeDestroy() {
        this.$eventBus.$off('designSaved');
        this.$eventBus.$off('designChanged');
    },
    methods: {
        ...mapActions(useProjectStore, ["FETCH_PERMISSION_OBJECT"]),
        toggleUploadBoxVisibility() {
            this.uploadBoxVisible = true;
        },
        isDesignChanged() {
            const currentStageData = this.saveFunc();
            const savedStageData = this.designVersionScene === undefined ?
                null :
                JSON.parse(JSON.stringify(this.designVersionScene));

            // when stage was never loaded
            if (typeof currentStageData === 'undefined') return false;

            // when design was never saved before
            if (savedStageData === null) {
                return currentStageData.ground.children.length !== 0;
            }

            return !isCloselyEqual(currentStageData.ground, savedStageData.ground, 3);
        },
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        },
        updateMicroinvertersPresent() {
            const microInverters = this.getMicroinverters();
            const optimizersCount = this.getOptimizersCount();
            if (microInverters !== undefined) {
                if (optimizersCount > 0 || microInverters.length > 0) {
                    this.isMicroinvertersOptimizersPresent = true;
                }
                else {
                    this.isMicroinvertersOptimizersPresent = false;
                }
            }
            return this.isMicroinvertersOptimizersPresent;
        },
        isCrmUser,
    },
    watch:{
        projectId:{
            handler(value){
                if(value)
                    this.FETCH_PERMISSION_OBJECT(value);
            }
        }
    }
};
</script>


<style scoped>

.sideBarTopPart {
    width: 100%;
    height: 50%;
    border: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sideBarBottomPart {
    width: 100%;
    height: 50%;
    border: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
}
.height-hundred-percent {
    /* overflow: hidden; */
}

#changeMapButton {
    cursor: pointer;
}

.mapImg {
    width: 1.7vw;
    max-width: 28px;
    height: auto;
}

@media (max-height: 650px) {
    .sideBarTopPart {
        height: 77%;
        overflow: hidden;
        overflow-y: scroll;
    }
    .sideBarBottomPart {
        height: 22%;
    }
}
</style>
<style lang="scss" scoped>
@import '../../../styles/components/utils';
#sideBar{
    height: 100%;
}
</style>
