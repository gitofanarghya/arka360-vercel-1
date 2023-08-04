<template>
    <div id="textBox">
        <button
            id="text_button"
            slot="reference"
            :disabled="!textBoxEnabled"
            class="el-icon-s-comment button-sidebar-icons"
            style="font-size: 1.4vw;"
            @click="newTextBoxFunc"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_TEXT_TOOL } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'TextBox',
    nonReactiveData() {
        return {
            newTextBoxFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            textBoxEnabled: state => state.textEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_TEXT_TOOL, (newTextBoxFunc) => {
            this.newTextBoxFunc = newTextBoxFunc;
            this.$mousetrap.bind('b', () => {
                if (this.textBoxEnabled) newTextBoxFunc();
            });
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('b');
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
