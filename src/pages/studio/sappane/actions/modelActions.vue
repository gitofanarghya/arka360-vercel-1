<template>
    <div
        id="modelActions"
    >
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper paddingZero">
                <button
                    id="model_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="deleteModelAction">
                    Delete
                </button>
            </el-col>
            <el-col v-if="!actionsData.isObstruction && (!isVipPowerGazebo)" class="colRight button-actions-wrapper paddingZero displayFlex">
                <button
                    id="model_fill"
                    :disabled="!fillFaceEnabled"
                    class="fill-face button-actions"
                    @click="actionsData.fillFace">
                    Fill Face
                </button>
                <el-tooltip
                    placement="top"
                    popper-class="addTableToolTip">
                    <div slot="content">Edit Subarray Properties
                        <br>and Fill Face
                    </div>
                    <button
                        id="custom_model_fill"
                        :disabled="!fillFaceEnabled"
                        class="custom-fill-face el-icon-s-tools"
                        @click="actionsData.customFillFace"
                    />
                </el-tooltip>
            </el-col>
        </el-row>

        <el-row v-if="!actionsData.isObstruction && (!isVipPowerGazebo)" 
            class="button-actions-row">
            <el-col class="button-actions-wrapper paddingZero">
                <button
                    id="model_add_table"
                    :disabled="!addTableEnabled"
                    style="float: left;"
                    class="button-actions"
                    @click="actionsData.addTable">
                    Add Table 
                </button>
            </el-col>
            <el-col></el-col>
        </el-row>
        <modal-box />
    </div>
</template>

<script>
import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import API from "@/services/api/";
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
  components: { modalBox },
    name: 'ModelActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteModel: () => {},
                    fillFace: () => {},
                    customFillFace: () => {},
                    addTable: () => {},
                    fillFacePossible: true,
                    isObstruction: isObstruction,
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
            serverBus.$emit('modalBoxOn', this.actionsData.deleteModel, 'Performing this action will delete the model. Are you sure you want to continue?')
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
            let studioSapPanStore = useStudioSapPaneStore()
            return (
                !studioSapPanStore.creationMode &&
                studioSapPanStore.actionsEnabled && this.actionsData.fillFacePossible
            );
        },
        addTableEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
    },
    updated() {
        if(!this.actionsData.isObstruction && !this.isVipPowerGazebo){
            this.$mousetrap.bind('f', () => {
                if (this.fillFaceEnabled) this.actionsData.fillFace();
            });
            this.$mousetrap.bind('alt+f', (e) => {
                e.preventDefault();
                if (this.fillFaceEnabled) this.actionsData.customFillFace();
            });
        }
        else{
            this.$mousetrap.unbind('f');
            this.$mousetrap.unbind('alt+f');
        }
    },
    async mounted() {

        this.isVipPowerGazebo = await this.setGazeboStatus();

        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.deleteModelAction();
        });
        if(!this.actionsData.isObstruction && !this.isVipPowerGazebo ){
            this.$mousetrap.bind('f', () => {
                if (this.fillFaceEnabled) this.actionsData.fillFace();
            });
            this.$mousetrap.bind('alt+f', (e) => {
                e.preventDefault();
                if (this.fillFaceEnabled) this.actionsData.customFillFace();
            });
        }
    },
    beforeDestroy() {
        this.$mousetrap.unbind(['del', 'backspace']);
        this.$mousetrap.unbind('f');
        this.$mousetrap.unbind('alt+f');
    },
};
</script>
<style lang="scss" scoped>
@import "../../../../styles/components/button.scss";
</style>

<style lang="scss" scoped>
.custom-fill-face {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    width: auto !important;
    background-color: inherit!important;
    font-size: .73vw!important;
    border: 1px solid #fff;
    color: #fff;
    padding: 1vh!important;
    border-left-width: 0px;


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

#modelActions {
    padding: 0% 2.5% 2.5% 4%;
}

.button-actions-row {
    gap: 8px;
}

.button-actions-row .button-actions-wrapper .button-actions {
    width: 100%;
}

.paddingZero {
    padding: 0px !important;
}

.displayFlex {
    display: flex;
}
</style>
