<template>
    <div
        id="dcdbActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <!--<button
                    id="dcdb_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteDCDB">
                    Delete
                </button>-->
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'DCDBActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteDCDB: () => {},
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
            if (this.deleteEnabled) this.actionsData.deleteDCDB();
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
