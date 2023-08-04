<template>
    <div id="views">
        <el-popover
            v-model="popperVisible"
            placement="right"
            width="50%">
            <div
                @click="popperVisible = !popperVisible">
                <button
                    id="2d_button"
                    :disabled="!view2DEnabled"
                    class="button-sidebar-dropdown"
                    @click="onClick2D">
                    2D (Double Press '2')
                </button>
                <button
                    id="3d_button"
                    :disabled="!view3DEnabled"
                    class="button-sidebar-dropdown"
                    @click="onClick3D">
                    3D (Double Press '3')
                </button>
                <div>
                        <button
                        id="sld_button"
                        :disabled="!isSldEnabled"
                        class="button-sidebar-dropdown"
                        @click="onClickSLD">
                        Line Diagram (Double Press '4')
                        </button>
                    </div>
                <!-- <el-tooltip
                    :disabled="true"
                    content="Under Development. For any assistance contact us through Intercom."
                    placement="right">
                    <div :disabled="false">
                        <button
                            id="sld_button"
                            :disabled="false"
                            class="button-sidebar-dropdown"
                            @click="onClickSLD">
                            SLD
                        </button>
                    </div>
                </el-tooltip> -->
                
            </div>
            <button
                slot="reference"
                :disabled="!viewsEnabled"
                class="iconLeftSideBar-view button-sidebar-icons"/>
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import {
    INIT_VIEWS,
    SET_SAP_PANE,
    SET_2D_VIEW,
} from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Views',
    props: {
        isMicroinvertersOptimizersPresent: {
            type: Boolean,
            default: false,
        },
        updateMicroinvertersPresent: {
            type: Function,
            default: () => {},
        },
    },
    data() {
        return {
            popperVisible: false,
            view2DEnabled: false,
            view3DEnabled: true,
            viewSLDEnabled: true,
            microInverterInScene: false,
        };
    },
    nonReactiveData() {
        return {
            switchTo2DFunc: () => {},
            switchTo3DFunc: () => {},
            switchToSLDFunc: () => {},
            getMicroinverters: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            viewsEnabled: state => state.viewsEnabled,
        }),
        isSldEnabled() {
            return this.viewSLDEnabled // && !this.isMicroinvertersOptimizersPresent;
        },
        sldHoverContent() {
            if (this.isMicroinvertersOptimizersPresent) {
                return 'SLD is disabled for Microinverters and Optimizers';
            }
            return 'SLD';
        }
    },
    mounted() {
        serverBus.$once(INIT_VIEWS, (switchTo2DFunc, switchTo3DFunc, switchToSLDFunc, getMicroinverters) => {
            this.switchTo2DFunc = switchTo2DFunc;
            this.switchTo3DFunc = switchTo3DFunc;
            this.switchToSLDFunc = switchToSLDFunc;
            this.getMicroinverters = getMicroinverters;
            this.$mousetrap.bind('2 2', () => {
                if (this.view2DEnabled && this.viewsEnabled) this.onClick2D();
            });
            this.$mousetrap.bind('3 3', () => {
                if (this.view3DEnabled && this.viewsEnabled) this.onClick3D();
            });
            this.$mousetrap.bind('4 4', () => {
                if (this.isSldEnabled && this.viewsEnabled) {
                    this.onClickSLD();
                }
            });
        });

        serverBus.$on(
            SET_2D_VIEW,
            this.onClick2D,
        );
    },
    beforeDestroy() {
        this.$mousetrap.unbind('2 2');
        this.$mousetrap.unbind('3 3');
        this.$mousetrap.unbind('4 4');

        serverBus.$off(SET_2D_VIEW);
    },
    methods: {
        onClick2D() {
            this.switchTo2DFunc();
            this.view2DEnabled = false;
            this.view3DEnabled = true;
            this.viewSLDEnabled = true;
            this.$root.$emit('onViewChange', true);
        },
        onClick3D() {
            this.switchTo3DFunc();
            this.view2DEnabled = true;
            this.view3DEnabled = false;
            this.viewSLDEnabled = true;
            this.$root.$emit('onViewChange', false);
        },
        onClickSLD() {
            this.switchToSLDFunc();
            this.view2DEnabled = true;
            this.view3DEnabled = true;
            this.viewSLDEnabled = false;
            this.$root.$emit('onViewChange', true);
        },
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
