<template>
    <div
        id="modelActions"
    >
        <!-- <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper" v-if="actionsData.isDeleted">
                <button
                    id="make_primary_edge"
                    class="button-actions"
                    @click="actionsData.makePrimaryEdge">
                    Primary Edge
                </button>
            </el-col>
        </el-row> -->
        <el-row class="button-actions-row" >
            <el-col class="button-actions-wrapper"  v-if="!actionsData.isDrawFace">
                <button
                    id="model_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteFace">
                    Delete
                </button>
            </el-col>

            <el-col class="colRight button-actions-wrapper" v-if="!actionsData.isDeleted && !isVipPowerGazebo">
                <button
                    id="model_fill"
                    :disabled="!fillFaceEnabled"
                    class="fill-face button-actions"
                    @click="actionsData.fillFace">
                    Fill Face
                </button>
            </el-col>
        </el-row>
        <el-row class="button-actions-row">
            <el-col class="colRight button-actions-wrapper" v-if="!actionsData.isDeleted  && !isVipPowerGazebo">
                <button
                    id="model_add_table"
                    :disabled="!addTableEnabled"
                    style="float: left;"
                    class="button-actions"
                    @click="actionsData.addTable">
                    Add Table
                </button>
            </el-col>
            <el-col class="button-actions-wrapper"  v-if="!actionsData.isDrawFace">
                <button
                    id="model_add_pitched_fold"
                    :disabled="!addFoldEnabled"
                    class="button-actions fold_properties"
                    @click="actionsData.addfold">
                    Add Pitched Fold
                </button>
            </el-col>
        </el-row>
        <el-row class="button-actions-row"  v-if="!actionsData.isDrawFace">
            <el-col class="button-actions-wrapper">
                <button
                    id="model_add_flat_fold"
                    :disabled="!addFoldEnabled"
                    style="float: left;"
                    class="button-actions fold_properties"
                    @click="actionsData.addFlatFold">
                    Add Flat Fold
                </button>
            </el-col>
            <el-col class="colRight button-actions-wrapper">
                <button
                    id="model_add_vertical_fold"
                    :disabled="!addFoldEnabled"
                    class="button-actions fold_properties"
                    @click="actionsData.addVerticalFold">
                    Add Vertical Fold
                </button>
            </el-col>
        </el-row>
        <el-row class="button-actions-row"  v-if="!actionsData.isDrawFace">
            <el-col class="button-actions-wrapper">
                <button
                    id="model_add_flat_fold"
                    :disabled="!addFoldEnabled"
                    style="float: left;"
                    class="button-actions fold_properties"
                    @click="actionsData.mergeFace">
                    Merge Face
                </button>
            </el-col>
            <el-col class="colRight button-actions-wrapper">
                <button
                    id="model_add_vertical_fold"
                    :disabled="!addFoldEnabled"
                    class="button-actions fold_properties"
                    @click="actionsData.editFace">
                    Adjust Face
                </button>
            </el-col>
        </el-row>
        <modal-box />
    </div>
</template>

<script>
import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import API from '@/services/api/';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
  components: { modalBox },
    name: 'SmartrooffaceActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    isParentDormer: false,
                    isDrawFace: false,
                    isDeleted: false,
                    deleteFace: () => {},
                    fillFace: () => {},
                    addTable: () => {},
                    makePrimaryEdge: () => {},
                    fillFacePossible: true,
                    multiFoldAllow: true,
                };
            },
        },
    },
    data() {
        return{
            isVipPowerGazebo: false,
        }
    },
    methods: {
        deleteModelAction() {
            this.actionsData.deleteFace();
        },
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        }
    },
    computed: {
        deleteEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
        fillFaceEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled && this.actionsData.fillFacePossible
            );
        },
        addTableEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
        addFoldEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled && this.actionsData.multiFoldAllow
            );
        },
    },
   async mounted() {
        this.isVipPowerGazebo = await this.setGazeboStatus();
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.deleteModelAction();
        });
        if(!this.isVipPowerGazebo) {
            this.$mousetrap.bind('f', () => {
                if (this.fillFaceEnabled) this.actionsData.fillFace();
            });
        }
        // this.$mousetrap.bind('alt+f', (e) => {
        //     e.preventDefault();
        //     if (this.fillFaceEnabled) this.actionsData.customFillFace();
        // });
    },
    beforeDestroy() {
        this.$mousetrap.unbind(['del', 'backspace']);
        this.$mousetrap.unbind('f');
        // this.$mousetrap.unbind('alt+f');
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
.fill-face {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

.fold_properties {
    width: 100% !important;
    padding: 1vh !important;
}

.button-actions-row {
    gap: 0.8vw;
}

.button-actions {
    width: 100% !important;
}

.lastBtn {
    width: 48% !important;
}

.button-actions-row .button-actions-wrapper {
    padding: 0px !important;
}

</style>
