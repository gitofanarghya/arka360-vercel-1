<template>
    <div
        id="dcCableActions"
        class="data-actions">
        <!-- <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="dc_cable_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteDcCable">
                    Delete
                </button>
            </el-col>
        </el-row> -->
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'DcCableActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteDcCable: () => {},
                    toggleDirection: () => {},
                };
            },
        },
    },
    computed: {
        deleteEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
        toggleDirectionEnabled() {
            return useStudioSapPaneStore().actionsEnabled;
        },
    },
    mounted() {
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.actionsData.deleteDcCable();
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind(['del', 'backspace']);
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/button.scss';
</style>
