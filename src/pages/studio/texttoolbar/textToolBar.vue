<template>
    <div
        v-show="toolbarEnabled"
        id="textToolBar"
        class="textToolBar">
        <el-row class="toolBarRow">
            <div class="text-list">Size</div>
            <div class="text-toolbar-select-block">
                <el-select
                    v-validate="fontSizeValidation"
                    id="font_size"
                    ref="fontSizeInput"
                    v-model.number="fontSize"
                    :disabled="!buttonsEnabled"
                    placeholder=""
                    class="text-toolbar-select"
                    filterable
                    allow-create
                    popper-class="darkDropdown"
                    name="Size">
                    <el-option
                        :value="1"
                        label="1"/>
                    <el-option
                        :value="2"
                        label="2"/>
                    <el-option
                        :value="3"
                        label="3"/>
                    <el-option
                        :value="4"
                        label="4"/>
                    <el-option
                        :value="5"
                        label="5"/>
                    <el-option
                        :value="6"
                        label="6"/>
                    <el-option
                        :value="7"
                        label="7"/>
                </el-select>
            </div>
            <div class="text-list">Color</div>
            <div class="tool-bar-icon">
                <el-color-picker
                    v-model="fontColor"
                    :disabled="!buttonsEnabled"
                    size="small"
                    class="tool-bar-icons"/>
            </div>
            <div class="text-list">Font</div>
            <div class="text-toolbar-icon-block">
                <el-select
                    v-model="font"
                    :disabled="!buttonsEnabled"
                    placeholder=""
                    class="text-toolbar-select"
                    popper-class="darkDropdown">
                    <el-option
                        :value="'Arial'"
                        label="Arial"/>
                    <el-option
                        :value="'Helvetica'"
                        label="Helvetica"/>
                    <el-option
                        :value="'Gentilis'"
                        label="Gentilis"/>
                </el-select>
            </div>
            <div
                class="button-block"
                style="marginLeft: 5px">
                <!-- <el-button
                    :disabled="!(buttonsEnabled)"
                    :class="[buttonsEnabled && fontBold ?
                    'active' : 'inactive']"
                    type="plain"
                    round
                    @click="toggleBold">
                    <b> B </b>
                </el-button> -->
                <button
                    ref="fontBold"
                    :disabled="!buttonsEnabled"
                    :class="[buttonsEnabled ? 'button-enable' : 'button-disable', fontBold ? 'active' : 'inactive']"
                    class="font-button"
                    @click="toggleBold">
                    B
                </button>
            </div>
            <div class="button-block">
                <!-- <el-button
                    :disabled="!(buttonsEnabled)"
                    :class="[buttonsEnabled && fontItalics ?
                    'active' : 'inactive']"
                    type="plain"
                    round
                    @click="toggleItalics">
                    <b><i> I </i></b>
                </el-button> -->
                <button
                    ref="fontItalics"
                    :disabled="!buttonsEnabled"
                    :class="[buttonsEnabled ? 'button-enable' : 'button-disable', fontItalics ? 'active' : 'inactive']"
                    class="font-button"
                    @click="toggleItalics">
                    I
                </button>
            </div>
            <div
                class="text-list"
                style="margin: 0 5px 0 5px">
                Shape Width</div>
            <div class="text-toolbar-select-block">
                <el-select
                    v-validate="shapeWidthValidation"
                    id="shape_size"
                    ref="shapeSizeInput"
                    v-model.number="shapeWidth"
                    :disabled="!buttonsEnabled"
                    placeholder=""
                    class="text-toolbar-select"
                    filterable
                    allow-create
                    popper-class="darkDropdown"
                    name="Shape Width">
                    <el-option
                        :value="1"
                        label="1"/>
                    <el-option
                        :value="2"
                        label="2"/>
                    <el-option
                        :value="3"
                        label="3"/>
                    <el-option
                        :value="4"
                        label="4"/>
                    <el-option
                        :value="5"
                        label="5"/>
                    <el-option
                        :value="6"
                        label="6"/>
                    <el-option
                        :value="7"
                        label="7"/>
                </el-select>
            </div>
            <div
                class="text-list"
                style="margin: 0 5px 0 5px">
                Shape Color</div>
            <div class="tool-bar-icon">
                <el-color-picker
                    v-model="shapeColor"
                    :disabled="!buttonsEnabled"
                    size="small"
                    class="tool-bar-icons"/>
            </div>
            <div
                class="adjust-button-block">
                <button
                    :disabled="!(buttonsEnabled)"
                    :class="[buttonsEnabled ? 'adjust-button-enable' : 'button-disable', ]"
                    class="adjust-button"
                    @click="handleClick">
                    adjust
                </button>
            </div>
        </el-row>
    </div>
</template>

<script>

import validationMixins from './validationMixins';
import { serverBus } from '../../../main';
import { SET_TEXT_TOOL_BAR } from '../../../componentManager/componentManagerConstants';
import mutationTypes from '../../../store/modules/studio/modules/textToolBar/mutationTypes';
import { mapState, mapActions } from 'pinia';
import { useStudioTextToolBarStore } from '../../../stores/studio-textToolBar'

export default {
    name: 'TextToolBar',
    components: {
    },
    mixins: [
        validationMixins.fontSizeValidation,
        validationMixins.shapeWidthValidation,
    ],
    data() {
        return {
            valuesChanged: false,
            propertiesData: {},
            font: 'Arial',
            fontSize: 1,
            fontColor: '#FFFFFF',
            fontBold: false,
            fontItalics: false,
            shapeWidth: 0.9,
            shapeColor: '#000000',
            adjust: false,
        };
    },
    computed: {
        ...mapState(useStudioTextToolBarStore, {
            toolbarEnabled: state => state.toolbarEnabled,
            buttonsEnabled: state => state.buttonsEnabled,
        }),
    },
    created() {
        window.addEventListener('click', this.removeFocus);
    },
    beforeDestroy() {
        window.removeEventListener('click', this.removeFocus);
    },
    mounted() {
        serverBus.$on(
            SET_TEXT_TOOL_BAR,
            (propertiesData) => {
                this.propertiesData =
                    propertiesData !== undefined ? propertiesData : this.propertiesData;
                this.font = this.propertiesData.font;
                this.fontSize = this.propertiesData.fontSize;
                this.fontColor = this.propertiesData.fontColor;
                this.fontBold = this.propertiesData.fontBold;
                this.fontItalics = this.propertiesData.fontItalics;
                this.shapeWidth = this.propertiesData.shapeWidth;
                this.shapeColor = this.propertiesData.shapeColor;
                this.adjust = this.propertiesData.adjust;
            },
        );
        const vm = this;

        this.$watch(
            () => ({
                font: vm.font,
                fontColor: vm.fontColor,
                fontSize: vm.fontSize,
                fontBold: vm.fontBold,
                fontItalics: vm.fontItalics,
                shapeWidth: vm.shapeWidth,
                shapeColor: vm.shapeColor,
                adjust: vm.adjust,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.errors.first('Size') || typeof (this.fontSize) === 'string') {
                        if (typeof (this.fontSize) === 'string') {
                            this.fontSize = this.propertiesData.fontSize;
                        }
                        if (this.fontSize > 400) {
                            this.fontSize = 400;
                        }
                        if (this.fontSize < 1) {
                            this.fontSize = 1;
                        }
                    }
                    if (this.errors.first('Shape Width') || typeof (this.shapeWidth) === 'string') {
                        if (typeof (this.shapeWidth) === 'string') {
                            this.shapeWidth = this.propertiesData.shapeWidth;
                        }
                        if (this.shapeWidth > 50) {
                            this.shapeWidth = 50;
                        }
                        if (this.shapeWidth < 0) {
                            this.shapeWidth = 0;
                        }
                    }
                    // if (this.creationMode) {
                    //     this.updateProperties();
                    // }
                    if (
                        vm.font !== vm.propertiesData.font ||
                        vm.fontColor !== vm.propertiesData.fontColor ||
                        vm.fontSize !== vm.propertiesData.fontSize ||
                        vm.fontBold !== vm.propertiesData.fontBold ||
                        vm.fontItalics !== vm.propertiesData.fontItalics ||
                        vm.shapeWidth !== vm.propertiesData.shapeWidth ||
                        vm.shapeColor !== vm.propertiesData.shapeColor ||
                        vm.adjust !== vm.propertiesData.adjust
                    ) {
                        // this.updateProperties();
                        this.valuesChanged = true;
                        this.updateProperties();
                    }
                    else {
                        this.valuesChanged = false;
                    }
                });
            },
        );
        if (this.toolbarEnabled && this.buttonsEnabled) {
            this.updateProperties();
        }
    },
    methods: {
        ...mapActions(useStudioTextToolBarStore, {
            setCreationMode: mutationTypes.ALL_BUTTONS_DISABLED_STATE,
            setEditingMode: mutationTypes.TOOLBAR_ENABLED_STATE,
        }),
        updateProperties() {
            const updateProperties = {
                textBoxProperties: {
                    font: this.font,
                    fontSize: this.fontSize,
                    fontColor: this.fontColor,
                    fontBold: this.fontBold,
                    fontItalics: this.fontItalics,
                    shapeWidth: this.shapeWidth,
                    shapeColor: this.shapeColor,
                    adjust: this.adjust,
                },
            };
            // call update function below
            this.propertiesData.update({
                font: this.font,
                fontSize: this.fontSize,
                fontColor: this.fontColor,
                fontBold: this.fontBold,
                fontItalics: this.fontItalics,
                shapeWidth: this.shapeWidth,
                shapeColor: this.shapeColor,
                adjust: this.adjust,
            });
        },
        toggleBold() {
            this.fontBold = !this.fontBold;
            this.$refs.fontBold.blur();
        },
        toggleItalics() {
            this.fontItalics = !this.fontItalics;
            this.$refs.fontItalics.blur();
        },
        removeFocus() {
            this.$refs.fontSizeInput.blur();
            this.$refs.shapeSizeInput.blur();
        },
        handleClick() {
            // this.valuesChanged = true;
            this.adjust = !this.adjust;
            // this.updateProperties();
        },
    },
};
</script>

<style scoped>

.textToolBar {
  background-color: #706e6b !important;
  opacity: 0.9;
}
.tool-bar {
  display: flex;
  justify-content: space-evenly;
  height: 50px;
}
.toolBarRow {
    height: 51px;
    max-height: 51px;
    min-height: 51px;
    display: flex;
    flex-direction: row;
}
.text-list {
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    min-width: 55px;
    max-width: 55px;
    width: 55px;
    /* padding: 15px 16px 0px 11px; */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
    color: black;
    text-align: center;
}

.tool-bar-icon {
    /* margin-top: 4px;
    width: 35px;
    height: 31px; */
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    min-width: 40px;
    max-width: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.el-select > .el-input {
    display: block;
    width: 40px;
    margin-top: 10px;
    text-align: center;
}
.text-toolbar-select-block {
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    min-width: 60px;
    max-width: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.text-toolbar-select {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    /* margin-top: 16px; */
}
.text-toolbar-icon-block {
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    min-width: 100px;
    max-width: 100px;
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.el-color-picker__trigger {
    display: inline-block;
    box-sizing: border-box;
    height: 35px;
    width: 36px;
    padding: 4px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    font-size: 0;
    position: relative;
    cursor: pointer;
}
.button-block {
    width: 50px;
    min-width: 50px;
    max-width: 50px;
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.el-button.is-round {
    width: 25px !important;
    min-width: 25px !important;
    max-width: 25px !important;
    height: 25px !important;
    min-height: 25px !important;
    max-height: 25px !important;
    border: 1px solid black;
    background: rgba(255, 255, 255, 0);
    color: rgb(0, 0, 0);
    outline: none;
}
button {
    outline: none;
}
.adjust-button-block {
    min-height: 100%;
    height: 100%;
    max-height: 100%;
    width: 70px;
    min-width: 70px;
    max-width: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.adjust-button {
    min-height: 30px;
    height: 30px;
    max-height: 30px;
    width: 50px;
    min-width: 50px;
    max-width: 50px;
    background-color: #E5E7E9;
    color: black;
    text-align: center;
    opacity: 1;
    transition: 0.3s;
    text-decoration: none;
    border: none;
    outline: none;
}
.adjust-button-enable:hover {
    opacity: 0.6;
    cursor: pointer;
    text-decoration: none;
    border: none;
}
/* .adjust-button > button:hover {
    opacity: 0.6;
    cursor: pointer;
    text-decoration: none;
    border: none;
} */
/* .adjust-button > button:active {
    transition: 1s;
    background-color: black;
} */
.font-button {
    min-width: 32.5px;
    width: 32.5px;
    max-width: 32.5px;
    height: 30px;
    min-height: 30px;
    max-height: 30px;
    background-color: transparent;
    border: 1px solid black;
    font-size: 12px;
    font-weight: 400;
    color: black;
    border-radius: 5px;
}
.active {
    border: 2px solid white;
    font-size: 15px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    outline: none;
}
.button-enable:hover:not(.active) {
    border: 2px solid white;
    font-size: 15px;
    font-weight: 600;
    color: white;
    cursor: pointer;
}
.button-disable {
    cursor: not-allowed;
    /* pointer-events: none; */
}
#textToolBar .active {
    opacity: 1;
}

#textToolBar .inactive {
    opacity: 0.50;
}
.el-radio-group {
    margin-top: 9px;
}
.el-color-picker__trigger {
    height: 32px;
    width: 35px;
    margin-top: 4px;
}

</style>
<style lang="scss" scoped>
@import "../../../styles/components/utils";
</style>
<style scoped>
.el-color-dropdown {
    top: 110px !important;
}

</style>
