<template>
    <div
        id="redo"
        class="navBarMidButtons">
        <el-button
            id="studio-app-redo-button"
            :disabled="!redoEnabled"
            class="navBarIcon iconNavBar-redo"
            circle
            @click="redo"/>
    </div>
</template>

<script>
import { serverBus } from '../../../main';
import { SET_REDO } from '../../../componentManager/componentManagerConstants';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarRedoButton',
    nonReactiveData() {
        return {
            redoFunc: () => {},
        };
    },
    computed: {
        redoEnabled() {
            return (
                useStudioTextTopBarStore().redo.enabled &&
                useStudioTextTopBarStore().redo.available
            );
        },
    },
    mounted() {
        serverBus.$once(SET_REDO, (redoFunc) => {
            this.redoFunc = redoFunc;
            this.$mousetrap.bind('mod+shift+z', () => {
                if (this.redoEnabled) this.redoFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('mod+shift+z');
    },
    methods: {
        redo(e) {
            e.currentTarget.blur();
            this.redoFunc();
        },
    },
};
</script>
<style scoped>
.navBarMidButtons {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navBarMidButtons .navBarIcon {
    font-size: 1.25vw;
    border: none;
    background-color: inherit;
    color: white;
}
</style>