<template>
    <div
        id="dcCableActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    style="width:100%"
                    id="cable_tray_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteCableTray">
                    Delete Cable Tray
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    style="width:100%"
                    id="conduit_reverse"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.reversePolarity">
                    Reverse Polarity
                </button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'CabletrayActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteCableTray: () => {},
                    reversePolarity: () => {},
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
    },
    mounted() {
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.deleteEnabled) this.actionsData.deleteCableTray();
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
