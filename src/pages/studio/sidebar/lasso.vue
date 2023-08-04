<template>
    <div id="lasso">
        <button
            id="lasso_button"
            slot="reference"
            :disabled="!lassoEnabled"
            class="el-icon-rank button-sidebar-icons"
            style="font-size: 1.4vw;"
            @click="newLassoFunc"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_LASSO_TOOL } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'Lasso',
    nonReactiveData() {
        return {
            newLassoFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            lassoEnabled: state => state.lassoEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_LASSO_TOOL, (newLassoFunc) => {
            this.newLassoFunc = newLassoFunc;
            this.$mousetrap.bind('l', () => {
                if (this.lassoEnabled) newLassoFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('l');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>