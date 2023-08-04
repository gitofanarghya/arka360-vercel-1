<template>
    <div
        id="walkwayActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="walkway_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteWalkway">
                    Delete
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    id="walkway_toggle_direction"
                    :disabled="!toggleDirectionEnabled"
                    class="button-actions"
                    @click="actionsData.toggleDirection">
                    Toggle <br> Direction
                </button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'WalkwayActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteWalkway: () => {},
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
            if (this.deleteEnabled) this.actionsData.deleteWalkway();
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
