<template>
    <div
        v-if="!actionsData.is3d"
        id="modelActions"
    >
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="model_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="deleteModelAction">
                    Delete
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    id="new_dormer"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.newFlatDormer">
                    Add Flat Dormer
                </button>
            </el-col>
        </el-row>

        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="new_dormer"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.newHippedDormer">
                    Add Hipped Dormer
                </button>
            </el-col>

            <el-col class="button-actions-wrapper">
                <button
                    id="new_dormer"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.newGabledDormer">
                    Add Gabled Dormer
                </button>
            </el-col>
        </el-row>
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="new_dormer"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.newTurretDormer">
                    Add Turret Dormer
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    v-if="nearmapEnabled && isLidarEnabled"
                    id="lidar"
                    :disabled="!lidarEnabled"
                    class="button-actions"
                    @click="actionsData.fitToLidar">
                    Fit Model to LIDAR
                </button>
            </el-col>

            <!-- <el-col class="button-actions-wrapper">
                <button
                    id="new_dormer"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.newGabledDormer">
                    Add Gabled Dormer
                </button>
            </el-col> -->
        </el-row>        
        <!-- <el-row class="button-actions-row">

        </el-row> -->
        <modal-box />
    </div>
</template>

<script>
import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
  components: { modalBox },
    name: 'SmartroofmodelActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteModel: () => {},
                    addTurretFace: () => {},
                    removeTurretFace: () => {},
                    newHippedDormer: () => {},
                    newGabledDormer: () => {},
                    newFlatDormer: () => {},
                    newTurretDormer: () => {},
                    fitToLidar: () => {},
                    lidarModeEnabled: false,
                    in3d: false,
                    isTurret: false,
                };
            },
        },
    },
    data() {
        return {
            nearmapEnabled: false,
            isLidarEnabled: false,
            isTurret: false,
            in3d: this.actionsData.in3d,
        }
    },
    methods: {
        deleteModelAction() {
            serverBus.$emit('modalBoxOn', this.actionsData.deleteModel, 'Performing this action will delete the model. Are you sure you want to continue?')
        },
        newDormerAction() {
            newDormer();
        },
        async isNearmapEnabled() {
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if (!Object.keys(responseData).length){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            this.nearmapEnabled = responseData.nearmap_enabled;
            this.isLidarEnabled = responseData.is_lidar_enabled;
        },
        updateMode() {
            this.is3d = this.actionsData.is3d;
        },
    },
    computed: {
        deleteEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
        lidarEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled && this.actionsData.lidarModeEnabled
            );
        },      
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                is3d: vm.is3d,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.is3d != this.actionsData.is3d) {
                        this.updateMode();
                    }
                });
            },
        );

        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.deleteModelAction();
        });
    },
    created() {
        this.isNearmapEnabled();
    },
    beforeDestroy() {
        this.$mousetrap.unbind(['del', 'backspace']);
    },
};
</script>
<style lang="scss" scoped>
@import "../../../../styles/components/button.scss";
</style>

<style lang="scss" scoped>
.custom-fill-face {
    border-left-width: 0 !important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    width: auto !important;
    background-color: inherit!important;
    font-size: .73vw!important;
    border: 1px solid #fff;
    color: #fff;
    padding: 1vh!important;

    &:hover {
        cursor: pointer;
    }
    &:disabled {
        background-color: inherit !important;
        border: 1px solid rgba(225, 225, 225, 0.4) !important;
        color: #4c4c4c !important;
    }
}
#new_dormer {
    padding: 1vh !important;
}
#lidar {
    padding: 1vh !important;
}
#lidar:disabled {
    cursor: not-allowed;
}
.fill-face {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
.colRight {
    padding: 0 0 0 0.8vw !important;
}
.colLeft {
    padding: 0 0.8vw 0 0 !important;
}

.button-actions-row {
    margin-bottom: 4.5% !important;
    margin-top: 5% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.8vw;
}

.button-actions {
    width: 100% !important;
}

.button-actions-wrapper {
    padding: 0px !important;
}
</style>
