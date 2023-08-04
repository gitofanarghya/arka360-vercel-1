<template>
    <div
        id="statusBar">
        <repeat
            v-if="repeatEnabled"
            :handleRepeatCountChange="repeat"
        />
        <cursorCoordinates
            :coordinates="coordinates"
        />
    </div>
</template>

<script>
import cursorCoordinates from './cursorCoordinates.vue';
import repeat from './repeat.vue';
import { MOUSE_MOVE, INIT_REPEAT } from '../../../componentManager/componentManagerConstants';
import { useStudioStatusBarStore } from '../../../stores/studio-statusBar'

export default {
    name: 'StatusBar',
    components: {
        cursorCoordinates,
        repeat,
    },
    data() {
        return {
            coordinates: {
                x: '--',
                y: '--',
                z: '--',
            },
        };
    },
    nonReactiveData() {
        return {
            repeat: () => {},
        };
    },
    computed: {
        repeatEnabled() {
            return (
                useStudioStatusBarStore().repeat.visible
            );
        },
    },
    mounted() {
        this.$eventBus.$on(MOUSE_MOVE, (coordinates) => {
            this.coordinates = coordinates;
        });
        this.$eventBus.$once(INIT_REPEAT, (onChange) => {
            this.repeat = onChange;
        });
    },
};
</script>

<style scoped>
    #statusBar {
        display: flex;
    }
</style>
