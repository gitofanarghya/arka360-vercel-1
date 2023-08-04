<template>
    <div
        id="main_menu"
        :style="{ display : display , 'left' : leftX + 'px' , 'top' : topX + 'px'}">
        <div id="selection-menu">
            <div
                v-for="i in name.length"
                class="items_of_box" >
                <div @click="applyProperty(i-1)">
                    <div
                        :style="[i-1 === defaultLevel ? {'color' : '#409eff'} : {'color' : 'white'}]"
                        :class="className">
                        {{ name[i-1] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { serverBus } from '../../../main';
import * as CONSTANTS from '../../../componentManager/componentManagerConstants';

export default {
    name: 'SelectionContextMenu',
    data() {
        return {
            name: [],
            className: null,
            defaultLevel: 0,
            display: 'none',
            event: {},
            leftX: 0,
            topX: 0,
            div_width: 0,
            div_height: 0,
            pointerX: 0,
            pointerY: 0,
        };
    },
    mounted() {
        const vm = this;
        serverBus.$on(CONSTANTS.SHOW_SELECTION_CONTEXT_MENU, (L) => {
            if (L.disable) {
                vm.display = 'none';
            }
            else {
                vm.$mousetrap.bind(['esc', 'enter'], () => {
                    if (L.event.target.type === 'text') {
                        return;
                    }
                    vm.hideSelectionContextMenu();
                });

                vm.$mousetrap.bind('up', () => {
                    if (L.event.target.type === 'text') {
                        return;
                    }
                    if (vm.defaultLevel > 0) {
                        const newLevel = vm.defaultLevel - 1;
                        vm.changeFocus(newLevel);
                    }
                });

                vm.$mousetrap.bind('down', () => {
                    if (L.event.target.type === 'text') {
                        return;
                    }
                    if (vm.defaultLevel < vm.name.length - 1) {
                        const newLevel = vm.defaultLevel + 1;
                        vm.changeFocus(newLevel);
                    }
                });

                vm.display = 'block';
                vm.event = L.event;
                vm.name = L.name;
                vm.defaultLevel = parseInt(L.defaultLevel);
                vm.selectionFunction = L.selectionFunction;
                vm.makePosition(L.event);
            }
        });
        this.className = CONSTANTS.SELECTION_CONTEXT_MENU_CLASS_NAME;
    },
    methods: {
        applyProperty(i) {
            this.$mousetrap.unbind(['esc', 'enter']);
            this.$mousetrap.unbind('up');
            this.$mousetrap.unbind('down');

            // send emitting according to that (if clicking again on default selection - then don't send)
            if (i !== this.defaultLevel) {
                this.selectionFunction(i);
            }
            this.hideSelectionContextMenu();
        },
        changeFocus(i) {
            this.defaultLevel = i;
            this.selectionFunction(i);
        },
        makePosition(event) {
            //  for positioning the selectionContextMenu
            const topBarHeight = document.getElementById('navBar').clientHeight;
            const sideBarWidth = document.getElementById('sideBar').clientWidth;
            const parentHeight = document.getElementById('main_menu').parentElement.clientHeight;
            const parentWidth = document.getElementById('main_menu').parentElement.clientWidth;
            const divWidth = document.getElementById('main_menu').clientWidth;
            const divHeight = document.getElementById('main_menu').clientHeight;
            const mouseClickX = event.clientX;
            const mouseClickY = event.clientY;

            let leftX;
            let topX;
            if (mouseClickX + divWidth < parentWidth) {
                leftX = mouseClickX;
            }
            else {
                leftX = mouseClickX - divWidth;
            }

            if (mouseClickY + divHeight < parentHeight) {
                topX = mouseClickY;
            }
            else {
                topX = mouseClickY - divHeight;
            }

            // Little offset for styling
            this.leftX = leftX - (sideBarWidth - 15);
            this.topX = topX - topBarHeight;

            this.div_width = divWidth;
            this.div_height = divHeight;
            this.pointerX = this.leftX - 17;
            this.pointerY = this.topX + 15 * this.name.length;
        },
        hideSelectionContextMenu() {
            this.display = 'none';
        },
    },
};

</script>

<style scoped>

    #selection-menu {
        width: auto;
        height: auto;
        background-color : #141414;
        z-index: 5000;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }

    #selection-menu:hover {
    }

    #selection-menu .items_of_box {
        width: 100%;
    }

    #selection-menu .items_of_box:hover {
        width: 100%;
        background-color: #A9A9A9;
    }

    #main_menu {
        position: absolute;
        transform: translate3d(0, -50%, 0);
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
        background: none;
        z-index: 2000;
    }

    #main_menu:after {
        content: "";
        width: 0.8vw;
        height: 0.8vw;
        transform: rotate(-45deg);
        background: #141414;
        position: absolute;
        box-shadow: 1px 4px 8px rgba(0, 0, 0, 0.5);
        z-index: -1;
        left: -0.2vw;
        top: calc(50% - 0.4vw);
    }

    .text_each_items {
        font-size: 0.8vw;
        color : white;
        padding: 5px 10px 5px 10px;
        cursor: pointer;
        width: 100%;
        text-align: center;
        box-sizing: border-box;
    }

    .text_each_items:hover {
        /*color : #409eff;*/
    }
</style>
