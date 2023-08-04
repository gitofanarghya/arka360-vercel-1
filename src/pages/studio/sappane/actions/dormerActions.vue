<template>
    <div
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

            <el-col class="button-actions-wrapper" v-if="actionsData.isHippedDormer && !actionsData.hasFold">
                <button
                    id="add_verticalFold"
                    class="button-actions"
                    @click="addVerticalFold">
                    Vertical Fold
                </button>
            </el-col>
            <el-col class="button-actions-wrapper" v-if="actionsData.isHippedDormer && actionsData.hasFold" >
                <button
                    id="delete_verticalFold"
                    class="button-actions"
                    @click="deleteVerticalFold">
                    Delete Fold
                </button>
            </el-col>
        </el-row>
        <modal-box />
    </div>
</template>

<script>
import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
  components: { modalBox },
    name: 'DormerActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteDormer: () => {},
                };
            },
        },
    },
    methods: {
        deleteModelAction() {
            serverBus.$emit('modalBoxOn', this.actionsData.deleteDormer, 'Performing this action will delete the model. Are you sure you want to continue?')
        },

        addVerticalFold() {
            this.actionsData.addVerticalFoldDormer();
            this.actionsData.hasFold = true;

        },
        deleteVerticalFold() {
            this.actionsData.deleteVerticalFoldDormer();
            this.actionsData.hasFold = false;
        },
    },
    computed: {
        deleteEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
    },
    mounted() {
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.deleteModelAction();
        });
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

.colRight {
    padding: 0 0 0 0.8vw !important;
}
.colLeft {
    padding: 0 0.8vw 0 0 !important;
}
</style>