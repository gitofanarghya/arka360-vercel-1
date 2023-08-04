<template>
    <div
        id="stringActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="string_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteString">
                    Delete
                </button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'StringActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteString: () => {},
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
            if (this.deleteEnabled) this.actionsData.deleteString();
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
