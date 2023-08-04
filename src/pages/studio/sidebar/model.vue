<template>
    <div id="model">
        <el-popover
            v-model="popperVisible"
            placement="right"
            width="60">
            <div

                @click="popperVisible = !popperVisible">
                <button
                    id="polygon_button"
                    class="button-sidebar-dropdown"
                    @click="newPolygonFunc">
                    Flat Roof (P)
                </button>
                <button
                    id="pitched_roof_button"
                    class="button-sidebar-dropdown"
                    @click="newPitchedRoofFunc">
                    Pitched Roof (R)
                </button>
                <button
                    id="draw_face_button"
                    class="button-sidebar-dropdown"
                    @click="newDrawFaceFunc">
                    Draw Face (Shift + F)
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!modelEnabled"
                class="iconLeftSideBar-roof button-sidebar-icons"/>
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import {
    INIT_POLYGON_MODEL,
    INIT_PITCHED_ROOF_MODEL,
    INIT_DRAW_FACE,
} from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Model',
    data() {
        return {
            popperVisible: false,
        };
    },
    nonReactiveData() {
        return {
            newPolygonFunc: () => {},
            newPitchedRoofFunc: () => {},
            newDrawFaceFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            modelEnabled: state => state.modelEnabled
        }),
    },
    mounted() {
        serverBus.$once(INIT_POLYGON_MODEL, (newPolygon) => {
            this.newPolygonFunc = newPolygon;
            this.$mousetrap.bind('p', () => {
                if (this.modelEnabled) newPolygon();
            });
        });
        serverBus.$once(INIT_PITCHED_ROOF_MODEL, (newPitchedRoof) => {
            this.newPitchedRoofFunc = newPitchedRoof;
            this.$mousetrap.bind('r', () => {
                if (this.modelEnabled) newPitchedRoof();
            });
        });
        serverBus.$once(INIT_DRAW_FACE, (newDrawFace) => {
            this.newDrawFaceFunc = newDrawFace;
            this.$mousetrap.bind('shift+f', () => {
                if (this.modelEnabled) newDrawFace();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('p');
        this.$mousetrap.unbind('r');
        this.$mousetrap.unbind('shift+f');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
// .button-sidebar-icons {
//     padding: 0px;
// }
</style>
