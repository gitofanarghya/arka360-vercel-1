<template>
    <div class="button-properties-wrapper">
        <button
            v-show="!creationMode"
            :disabled="!updateEnabled"
            class="button-properties"
            @click="updateProperties">
            {{ updateButtonText }}
        </button>
        <button
            v-show="!creationMode"
            :disabled="!cancelEnabled"
            class="button-properties "
            @click="cancelProperties">
            Cancel
        </button>
        <button
            v-show="creationMode"
            :disabled="!resetEnabled"
            class="button-properties"
            @click="resetProperties">
            Reset
        </button>
    </div>
</template>

<script>
export default {
    name: 'PropertiesButtonsBar',
    components: {},
    props: {
        creationMode: {
            type: Boolean,
            default: false,
        },
        updateEnabled: {
            type: Boolean,
            default: false,
        },
        cancelEnabled: {
            type: Boolean,
            default: false,
        },
        resetEnabled: {
            type: Boolean,
            default: false,
        },
        updateProperties: {
            type: Function,
            default: () => {},
        },
        cancelProperties: {
            type: Function,
            default: () => {},
        },
        resetProperties: {
            type: Function,
            default: () => {},
        },
        updateButtonText: {
            type: String,
            default: 'Update',
        },
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/button.scss';
</style>

<style scoped>
    .button-properties-wrapper {
        margin-top: 10px;
    }
</style>