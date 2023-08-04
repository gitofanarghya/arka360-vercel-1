<template>
    <div
        id="walkwayProperties"
        class="height-hundred-percent-">
        <div
            v-bar
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Core Height
                    <input-length
                        v-model="coreHeight"
                        :name="'Core Height'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'mousetrap sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Core Height') }}</span>
                    </p>
                </div>

                <div class="sappane-label">
                    Width
                    <input-length
                        v-model="width"
                        :name="'Width'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'mousetrap sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Width') }}</span>
                    </p>
                </div>
            </div>
        </div>
        <properties-buttons-bar
            :creation-mode="creationMode"
            :update-enabled="updateEnabled"
            :cancel-enabled="cancelEnabled"
            :reset-enabled="resetEnabled"
            :update-properties="updateProperties"
            :cancel-properties="resetProperties"
            :reset-properties="resetProperties"
        />
    </div>
</template>

<script>
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'WalkwayProperties',
    components: {
        PropertiesButtonsBar,
    },
    mixins: [validationMixins.lengthValidation],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    coreHeight: 0,
                    width: 0,
                    update: () => {},
                };
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            coreHeight: this.propertiesData.coreHeight,
            width: this.propertiesData.width,
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled
        }),
        ...mapState(useStudioTextTopBarStore, {
            topBarCompleteEnabled: state => state.completeEnabled,
            topBarCancelEnabled: state => state.cancelEnabled
        }),
        updateEnabled() {
            return (
                !this.creationMode && this.editEnabled && this.valuesChanged && !this.errors.any()
            );
        },
        cancelEnabled() {
            return !this.creationMode && this.editEnabled && this.valuesChanged;
        },
        resetEnabled() {
            return this.creationMode && this.valuesChanged;
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                coreHeight: vm.coreHeight,
                width: vm.width,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.coreHeight !== this.propertiesData.coreHeight ||
                        this.width !== this.propertiesData.width
                    ) {
                        this.valuesChanged = true;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, true);
                        }
                    }
                    else {
                        this.valuesChanged = false;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
                        }
                    }
                });
            },
        );
        // no shortcuts in creation mode since
        // it will override complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) {
                this.$mousetrap.bind('enter', () => {
                    if (this.updateEnabled) this.updateProperties();
                });
            }
            if (!this.topBarCancelEnabled) {
                this.$mousetrap.bind('esc', () => {
                    if (this.cancelEnabled) this.resetProperties();
                });
            }
        }
    },
    beforeDestroy() {
        // no undinding shortcuts in creation mode since
        // it will unbind complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) this.$mousetrap.unbind('enter');
            if (!this.topBarCancelEnabled) this.$mousetrap.unbind('esc');
        }
    },
    methods: {
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update(
                {
                    coreHeight: this.coreHeight,
                    width: this.width,
                },
                !this.errors.any(),
            );
        },
        resetProperties() {
            this.coreHeight = this.propertiesData.coreHeight;
            this.width = this.propertiesData.width;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
@import '../../../../styles/components/button';
</style>

<style scoped>
#walkwayProperties .dataProperties {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#walkwayProperties ::-webkit-scrollbar {
    display: none;
}

#walkwayProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#walkwayProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
.height-hundred-percent- {
    height: 75%;
}
</style>
