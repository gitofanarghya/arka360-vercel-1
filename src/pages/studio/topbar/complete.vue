<template>
    <div
        id="complete"
        class="navBarMidButtons">
        <el-button
            id="studio-app-complete-button"
            :disabled="!completeEnabled"
            class="navBarIcon iconNavBar-complete "
            @click="completeFunc"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { SET_COMPLETE } from '../../../componentManager/componentManagerConstants';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarCompleteButton',
    data() {
        return {
            completeFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioTextTopBarStore, {
            completeEnabled: state => state.completeEnabled,
        }),
    },
    mounted() {
        serverBus.$on(SET_COMPLETE, (completeFunc, successCb) => {
            this.completeFunc = completeFunc;
            this.$mousetrap.bind('return', () => {
                if (this.completeEnabled) this.completeFunc();
            });
            successCb();
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('return');
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
