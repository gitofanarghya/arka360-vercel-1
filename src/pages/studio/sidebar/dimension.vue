<template>
    <div id="dimension">
        <button
            id="dimension_button"
            slot="reference"
            :disabled="!dimensionEnabled"
            class="iconLeftSideBar-tape-measure button-sidebar-icons"
            @click="newDimensionFunc"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_DIMENSION } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Dimension',
    nonReactiveData() {
        return {
            newDimensionFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            dimensionEnabled: state => state.dimensionEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_DIMENSION, (newDimensionFunc) => {
            this.newDimensionFunc = newDimensionFunc;
            this.$mousetrap.bind('d', () => {
                if (this.dimensionEnabled) newDimensionFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('d');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>