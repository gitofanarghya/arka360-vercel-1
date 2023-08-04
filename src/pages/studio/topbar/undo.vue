<template>
    <div
        id="undo"
        class="navBarMidButtons">
        <el-button
            id="studio-app-undo-button"
            :disabled="!undoEnabled"
            class="navBarIcon iconNavBar-undo"
            circle
            @click="undo"/>
    </div>
</template>

<script>
import { serverBus } from '../../../main';
import { SET_UNDO } from '../../../componentManager/componentManagerConstants';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarUndoButton',
    nonReactiveData() {
        return {
            undoFunc: () => {},
        };
    },
    computed: {
        undoEnabled() {
            return (
                useStudioTextTopBarStore().undo.enabled &&
                useStudioTextTopBarStore().undo.available
            );
        },
    },
    mounted() {
        serverBus.$once(SET_UNDO, (undoFunc) => {
            this.undoFunc = undoFunc;
            this.$mousetrap.bind('mod+z', () => {
                if (this.undoEnabled) this.undoFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('mod+z');
    },
    methods: {
        undo(e) {
            e.currentTarget.blur();
            this.undoFunc();
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

