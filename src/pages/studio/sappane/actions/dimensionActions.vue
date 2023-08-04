<template>
    <div
        id="dimensionActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="dimension_delete"
                    :disabled="!removeEnabled"
                    class="button-actions"
                    @click="actionsData.remove">
                    Delete
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    id="toggle_moving_direction"
                    :disabled="!toggleMovingDirectionEnabled"
                    class="button-actions"
                    @click="actionsData.toggleMovingDirection">
                    Toggle
                </button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'DimensionActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    remove: () => {},
                    toggleMovingDirection: () => {},
                };
            },
        },
    },
    computed: {
        removeEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            );
        },
        toggleMovingDirectionEnabled() {
            return !useStudioSapPaneStore().creationMode;
        },
    },
    mounted() {
        this.$mousetrap.bind(['del', 'backspace'], () => {
            if (this.removeEnabled) this.actionsData.remove();
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
