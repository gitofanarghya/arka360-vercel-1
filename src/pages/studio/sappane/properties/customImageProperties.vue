<template>
    <div
        id="customImageProperties"
        class="height-hundred-percent">
        <div class="scroll-area" v-bar>
            <div class="dataProperties">
                <div
                    class="sappane-label"
                    style="margin: 30px 0px 6px"
                >
                    <h3>Rotation</h3>
                    <label>
                        <input
                            v-validate="customImageRotationValidation"
                            :disabled="!controlsEnabled"
                            v-model.number="computedRotation"
                            class="sappane-input-value"
                            name="Rotation"
                            autocomplete="off">
                    </label>
                    <el-slider
                        :disabled="!controlsEnabled"
                        v-model.number="computedRotation"
                        :min="-180"
                        :max="180"
                        :show-tooltip="false"
                        :step="0.1"
                        style="margin: 6px 0px 15px 0px; width: 100%"
                    />
                    <p><span>{{ errors.first('Rotation') }}</span></p>
                </div>

                <div
                    class="sappane-label"
                    style="margin: 0px 0px -15px 0px;"
                >
                    <h3>Scale</h3>
                    <label>
                        <input
                            v-validate="lengthValidation"
                            :disabled="!controlsEnabled"
                            v-model.number="computedScale"
                            class="sappane-input-value"
                            name="Scale"
                            autocomplete="off">
                    </label>

                    <el-slider
                        :disabled="!controlsEnabled"
                        v-model="computedScale"
                        :min="0.01"
                        :max="10"
                        :step="0.1"
                        :show-tooltip="false"
                        style="margin: 6px 0px 15px 0px; width: 100%"
                    />
                    <p><span>{{ errors.first('Scale') }}</span></p>
                </div>
                <button
                    :disabled="!controlsEnabled"
                    class="button-properties gui-button"
                    @click="enableScaleGUI">
                    <span v-show="true">Set scale</span>
                </button>
                <div
                    class="sappane-label"
                    style="margin: 30px 0px 6px"
                >
                    <h3>Ground size</h3>
                    <input-length
                        v-model="computedGroundSize"
                        :name="'Ground size'"
                        :disabled="!controlsEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <el-slider
                        :disabled="!controlsEnabled"
                        v-model.number="computedGroundSize"
                        :min="groundSizeLimits.min"
                        :max="groundSizeLimits.max"
                        :show-tooltip="false"
                        :step="0.1"
                        style="margin: 6px 0px 15px 0px; width: 100%"
                    />
                    <p><span>{{ errors.first('Ground size') }}</span></p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component';
import validator from 'validator';
import validationMixins from './validationMixins';

export default {
    name: 'CustomImageProperties',
    components: {
        vueSlider,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.customImageRotationValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    rotation: 0,
                    scale: 1,
                    groundSize: 1,
                    groundSizeLimits: {},
                    updateRotation: () => {},
                    updateScale: () => {},
                    updateGroundSize: () => {},
                    enableRotationGUI: () => {},
                    enableScaleGUI: () => {},
                    controlsEnabled: true,
                };
            },
        },
    },
    data() {
        return {
            scale: this.propertiesData.scale,
            rotation: this.propertiesData.rotation,
            groundSize: this.propertiesData.groundSize,
            groundSizeLimits: this.propertiesData.groundSizeLimits,
            controlsEnabled: this.propertiesData.controlsEnabled,
        };
    },
    computed: {
        computedScale: {
            get() {
                return this.scale;
            },
            set(newValue) {
                if (validator.isFloat(newValue.toString())) {
                    this.scale = newValue;
                }
            },
        },
        computedRotation: {
            get() {
                return this.rotation;
            },
            set(newValue) {
                if (validator.isFloat(newValue.toString())) {
                    this.rotation = newValue;
                }
            },
        },
        computedGroundSize: {
            get() {
                return this.groundSize;
            },
            set(newValue) {
                if (validator.isFloat(newValue.toString())) {
                    this.groundSize = newValue;
                }
            },
        },
    },
    watch: {
        rotation(newValue) {
            this.$validator.validate().then((isValid) => {
                if (isValid) {
                    this.propertiesData.updateRotation(newValue);
                }
            });
        },
        scale(newValue) {
            this.$validator.validate().then((isValid) => {
                if (isValid) {
                    this.propertiesData.updateScale(newValue);
                }
            });
        },
        groundSize(newValue) {
            this.$validator.validate().then((isValid) => {
                if (isValid) {
                    this.propertiesData.updateGroundSize(newValue);
                }
            });
        },
    },
    methods: {
        enableScaleGUI() {
            this.propertiesData.enableScaleGUI();
            this.controlsEnabled = false;
        },
    },
};

</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>

#customImageProperties .gui-button {
    width: 100%;
    margin: 0px 0px 15px 0px;
    position: relative;
}

#customImageProperties h3 {
    display: inline-block;
}

#customImageProperties .dataProperties {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#customImageProperties ::-webkit-scrollbar {
    display: none;
}

#customImageProperties .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#customImageProperties:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

</style>
