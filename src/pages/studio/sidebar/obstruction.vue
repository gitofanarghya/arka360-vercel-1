<template>
    <div id="obstruction">
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
                    Polygon (Shift + P)
                </button>
                <button
                    id="rectangle_button"
                    class="button-sidebar-dropdown"
                    @click="newRectangleFunc">
                    Rectangle (Shift + R)
                </button>
                <button
                    id="cylinder_button"
                    class="button-sidebar-dropdown"
                    @click="newCylinderFunc">
                    Cylinder (C)
                </button>
                <button
                    id="walkway_button"
                    class="button-sidebar-dropdown"
                    @click="newWalkwayFunc">
                    Walkway (W)
                </button>
                <button
                    id="safetyline_button"
                    class="button-sidebar-dropdown"
                    @click="newSafetyLineFunc">
                    Safety Line (E)
                </button>
                <button
                    id="handrail_button"
                    class="button-sidebar-dropdown"
                    @click="newHandrailFunc">
                    Handrail (H)
                </button>
                <button
                    id="property_button"
                    class="button-sidebar-dropdown"
                    @click="newPropertyFunc">
                    Property Line (N)
                </button>
                <button
                    id="Tree_button"
                    class="button-sidebar-dropdown"
                    @click="newTreeFunc">
                    Tree (T)
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!modelEnabled"
                class="iconLeftSideBar-obstruction button-sidebar-icons"/>
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import {
    INIT_POLYGON_OBSTRUCTION,
    INIT_RECTANGLE_MODEL,
    INIT_CYLINDER_MODEL,
    INIT_WALKWAY_MODEL,
    INIT_TREE_MODEL,
    INIT_SAFETY_LINE_MODEL,
    INIT_HANDRAIL_MODEL,
    INIT_PROPERTY_MODEL,
} from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Obstruction',
    data() {
        return {
            popperVisible: false,
        };
    },
    nonReactiveData() {
        return {
            newPolygonFunc: () => {},
            newRectangleFunc: () => {},
            newCylinderFunc: () => {},
            newWalkwayFunc: () => {},
            newSafetyLineFunc: () => {},
            newHandrailFunc: () => {},
            newPropertyFunc: () => {},
            newTreeFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            modelEnabled: state => state.modelEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_POLYGON_OBSTRUCTION, (newPolygon) => {
            this.newPolygonFunc = newPolygon;
            this.$mousetrap.bind('shift+p', () => {
                if (this.modelEnabled) newPolygon();
            });
        });
        serverBus.$once(INIT_RECTANGLE_MODEL, (newRectangle) => {
            this.newRectangleFunc = newRectangle;
            this.$mousetrap.bind('shift+r', () => {
                if (this.modelEnabled) newRectangle();
            });
        });
        serverBus.$once(INIT_CYLINDER_MODEL, (newCylinder) => {
            this.newCylinderFunc = newCylinder;
            this.$mousetrap.bind('c', () => {
                if (this.modelEnabled) newCylinder();
            });
        });
        serverBus.$once(INIT_WALKWAY_MODEL, (newWalkway) => {
            this.newWalkwayFunc = newWalkway;
            this.$mousetrap.bind('w', () => {
                if (this.modelEnabled) newWalkway();
            });
        });
        serverBus.$once(INIT_SAFETY_LINE_MODEL, (newSafetyLine) => {
            this.newSafetyLineFunc = newSafetyLine;
            this.$mousetrap.bind('e', () => {
                if (this.modelEnabled) newSafetyLine();
            });
        });
        serverBus.$once(INIT_HANDRAIL_MODEL, (newHandrail) => {
            this.newHandrailFunc = newHandrail;
            this.$mousetrap.bind('h', () => {
                if (this.modelEnabled) newHandrail();
            });
        });
        serverBus.$once(INIT_PROPERTY_MODEL, (newProperty) => {
            this.newPropertyFunc = newProperty;
            this.$mousetrap.bind('n', () => {
                if (this.modelEnabled) newProperty();
            });
        });
        serverBus.$once(INIT_TREE_MODEL, (newTree) => {
            this.newTreeFunc = newTree;
            this.$mousetrap.bind('t', () => {
                if (this.modelEnabled) newTree();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('shift+p');
        this.$mousetrap.unbind('shift+r');
        this.$mousetrap.unbind('c');
        this.$mousetrap.unbind('w');
        this.$mousetrap.unbind('e');
        this.$mousetrap.unbind('h');
        this.$mousetrap.unbind('n');
        this.$mousetrap.unbind('t');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
// .button-sidebar-icons {
//     padding: 0px;
// }
</style>
