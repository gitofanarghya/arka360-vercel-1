<template>
    <div
        id="inverterActions"
        class="data-actions">
        <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
                <button
                    id="inverter_delete"
                    :disabled="!deleteEnabled"
                    class="button-actions"
                    @click="deleteInverterAction">
                    Delete
                </button>
            </el-col>
        </el-row>
        <modal-box
            message="Performing this action will delete the Inverter. Are you sure you want to continue?"
        />
    </div>
</template>

<script>

import modalBox from '../properties/modalBox.vue';
import { serverBus } from '../../../../main';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    components: { modalBox },
    name: 'InverterActions',
    props: {
        actionsData: {
            type: Object,
            default() {
                return {
                    deleteInverter: () => {},
                };
            },
        },
    },
    methods: {
        deleteInverterAction() {
            serverBus.$emit('modalBoxOn', this.actionsData.deleteInverter, 'Performing this action will delete the Inverter. Are you sure you want to continue?');
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
            if (this.deleteEnabled) this.deleteInverterAction();
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
