<template>
    <div id="gazebo">
        <button
            id="gazebo_button"
            :disabled="!gazeboEnabled"
            style="background-color: #121212; border: none; padding: 1.3vh 20px;"
            @click="newGazeboFunc">
            <img
                class="gazeboImg"
                src="../../../assets/img/Gazeboicon.svg"
                alt="Add other sources">
        </button>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_GAZEBO_MODEL } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Gazebo',
    nonReactiveData() {
        return {
            newGazeboFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            gazeboEnabled: state => state.gazeboEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_GAZEBO_MODEL, (newGazeboFunc) => {
            this.newGazeboFunc = newGazeboFunc;
            this.$mousetrap.bind('g', () => {
                if (this.gazeboEnabled) newGazeboFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('g');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';

.gazeboImg {
    width: 1.7vw;
    max-width: 28px;
    height: auto;
}
</style>