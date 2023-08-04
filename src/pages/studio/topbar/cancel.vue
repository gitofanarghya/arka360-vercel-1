<template>
    <div
        id="cancel"
        class="navBarMidButtons">
        <el-button
            id="studio-app-cancel-button"
            :disabled="!cancelEnabled"
            class="navBarIcon iconNavBar-cancel"
            @click="cancelFunc"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { SET_CANCEL } from '../../../componentManager/componentManagerConstants';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarCancelButton',
    data() {
        return {
            cancelFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioTextTopBarStore, {
            cancelEnabled: state => state.cancelEnabled,
        }),
    },
    mounted() {
        serverBus.$on(SET_CANCEL, (cancelFunc) => {
            this.cancelFunc = cancelFunc;
            this.$mousetrap.bind('esc', () => {
                if (this.cancelEnabled) this.cancelFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('esc');
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
