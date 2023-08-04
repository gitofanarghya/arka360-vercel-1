<template>
    <div
        id="handrailActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="handrail_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteHandrail">
                    Delete
                </button>
            </el-col>
            <el-col class="button-actions-wrapper">
                <button
                    id="handrail_toggle_direction"
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
    name: 'HandrailActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteHandrail: () => {},
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
            if (this.deleteEnabled) this.actionsData.deleteHandrail();
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
