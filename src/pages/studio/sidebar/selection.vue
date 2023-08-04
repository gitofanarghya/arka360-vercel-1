<template>
    <div id="selection" style="max-height: 51px">
        <el-popover
            v-model="popperVisible"
            placement="right">
            <div
                @click="popperVisible = !popperVisible">
                <el-radio 
                    v-model="toggleValue"
                    label="table"
                    id="table_button"
                    class="button-sidebar-dropdown radio-sidebar"
                    @click="initTableSelection">
                    Table
                </el-radio>
            </div>
            <div
                @click="popperVisible = !popperVisible">
                <el-radio 
                    v-model="toggleValue"
                    label="Module"
                    id="panel_button"
                    class="button-sidebar-dropdown radio-sidebar"
                    @click="initPanelSelection">
                    Module
                </el-radio>
            </div>
            <button
                slot="reference"
                :disabled="!selection"
                class="el-icon-position button-sidebar-icons"
                style="font-size: 1.5vw"/>
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_TABLE_PANEL } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Selection',
    data() {
        return {
            popperVisible: false,
            toggleValue: 'table',
        };
    },
    nonReactiveData() {
        return {
            initTableSelection: () => {},
            initPanelSelection: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            selection: state => state.selection,
        }),
    },
    methods: {
    },
    mounted() {
        serverBus.$once(INIT_TABLE_PANEL, ( toggleFunctions ) => {
            this.initTableSelection = toggleFunctions.toggleToTable;
            this.initPanelSelection = toggleFunctions.toggleToPanel;
            this.$mousetrap.bind('v', () => {
                if (this.selection && this.toggleValue === 'table') {
                    this.toggleValue = 'panel';
                }
                else if (this.selection && this.toggleValue === 'panel') {
                    this.toggleValue = 'table';
                }

            });
        });
    },
    watch: {
        toggleValue(newVal) {
            if(newVal === 'table') {
                this.initTableSelection();
            }
            else if(newVal === 'panel') {
                this.initPanelSelection();
            }
        }
    },
    beforeDestroy() {
        this.$mousetrap.unbind('v');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
@import '../../../styles/components/radio';
</style>
<style scoped>
.el-popover {
    background-color: #141414 !important;
}
</style>
