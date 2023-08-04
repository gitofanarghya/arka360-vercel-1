<template>
    <div
        id="acdbActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="acdb_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="actionsData.deleteACDB">
                    Delete
                </button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'ACDBActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteACDB: () => {},
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
            if (this.deleteEnabled) this.actionsData.deleteACDB();
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
