<template>
    <div id="microInverterSummary">
        <div
            class="select-panels-text"
            v-if="summaryData.microInverter.panels.length===0">
            Select Modules in studio for inverter addition
            <div
                class="sappane-label">
                    No. of modules
                    <span class="sappane-value">
                        {{ panelCount }}
                    </span>
                </div>
        </div>
        <div
            v-if="summaryData.microInverter.panels.length"
            class="scroll__area">
            <div class="data-summary">
                <p class="sappane-label">
                    Manufacture and
                    
                    <span class="sappane-value">
                        {{ summaryData.microInverterManufacturer}},
                    </span>
                </p>
                <p class="sappane-label model-name">
                    Model Name
                    <span class="sappane-value">
                        {{summaryData.microInverterMake }}
                    </span>
                </p>
                <p class="sappane-label">
                    Module Count
                    <span class="sappane-value">
                        {{ panelCount }}
                    </span>
                </p>
                <p class="sappane-label" style="display: flex; justify-content: space-between">
                    String Length
                    <input
                        type="number"
                        :min="summaryData.stringRange.min"
                        :max="summaryData.stringRange.max"
                        v-model="summaryData.stringLength"
                        :name="'String Length'"
                        id="setStringLength"
                        class="sappane-input-value"
                    />
                </p>
                <p v-show="!isInputStringLengthValid" class="error-msg">Input out of range</p>
                <p class="sappane-label">
                    String Range
                    <span class="sappane-value">
                        {{ stringRange }}
                    </span>
                </p>
                <p class="sappane-label">
                    Micro Inverter Count
                    <span class="sappane-value">
                        {{ microInverterCount }}
                    </span>
                </p>
                <el-row class="button-actions-row">
                    <el-col class="button-actions-wrapper">
                        <button
                            id = "update-button"
                            :disabled="!buttonEnabled || !isInputStringLengthValid "
                            class="button-actions"
                            @click="updateButton">
                            Update
                        </button>
                    </el-col>
                    <el-col class="button-actions-wrapper">
                        <button
                            id = "update-button"
                            :disabled="!cancelButtonEnabled"
                            class="button-actions"
                            @click="cancelButton">
                            Cancel
                        </button>
                    </el-col>
                </el-row>
                <el-row class = "button-actions-row">
                    <el-col class="button-actions-wrapper">
                        <button
                            class="button-actions"
                            :disabled="!buttonEnabled"
                            @click="selectPanel">
                            Select Modules
                        </button>
                    </el-col>
                    <el-col class="button-actions-wrapper">
                        <button
                            class="button-actions"
                            :disabled="!buttonEnabled"
                            @click="deleteButton">
                            Delete
                        </button>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div v-if="summaryData.microInverter.panels.length">
            <hr>
            <div class='combiner_box'>
                <div class='box_head' @click="handleCollapsable">
                    <h5 class='title'>combiner box/ load center</h5>
                    <div v-if="!isHidden"><img :src="dropdownArrowUp"/></div>
                    <div v-else><img :src="dropdownArrowDown"/></div>
                </div>
                <div v-if="!isHidden">
                    <div class='menu_options'>
                        <div v-if="!summaryData.microInverter.combinerBox"
                            class = "remove-section">
                            <p class='option_title'>Add in design (Optional)</p>
                            <button
                                class="el-icon-circle-plus-outline"
                                :disabled="!buttonEnabled"
                                @click="openModalToAdd"
                                style="padding: 0"
                            />
                        </div>
                        <div v-else class = "remove-section close">
                            <p class='option_title'>Remove from design</p>
                            <button
                                class="el-icon-circle-plus-outline"
                                style="padding: 0px ; transform: rotate(45deg);"
                                :disabled="!buttonEnabled"
                                @click="deleteCombinerBox"
                            />
                        </div>
                    </div>
                    <div class='menu_options'>
                        <p class='option_title'>Max String Length</p>
                        <span class="sappane-value"
                            style="height: auto; font-size: 15px;">
                        {{ summaryData.microInverter.maxString}}
                    </span>
                    </div>
                    <div class='string_data'>
                        <div class='show_data'
                            v-for="(string, index) in summaryData.microInverter.strings"
                            :key="index"
                        >
                            <p class='string_name'>String {{index+1}}</p>
                            <div class='string_length'>
                                <p class='length' style="font-size: 15px;">{{string.linkedPanels.length}}</p>
                                <el-select
                                    v-model="stringComp"
                                    :disabled="!buttonEnabled"
                                    class="text-toolbar-select sappane-drop-value img-url el-icon-more"
                                    popper-class="darkDropdown"
                                    id="stringCompButton">
                                    <el-option class="drop-text" :value="index">
                                        <div v-on:click="editString(string)" class="delete-string">
                                            <div >Edit</div>
                                            <img :src="editButton" width="18px" height="18px" />
                                        </div>
                                    </el-option>
                                    <el-option class="drop-text" :value="index">
                                        <div v-on:click="delStrings(string)" class="delete-string">
                                            <div>Delete</div>
                                            <img :src="deleteButtonImg" width="18px" height="18px" />
                                        </div>
                                    </el-option>
                                </el-select>
                            </div>
                        </div>
                    </div>
                    <button
                        class='string_add_btn'
                        :disabled="!isStringingValid || !buttonEnabled"
                        @click="addNewString">
                        Add String
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import deleteImage from "../../../../assets/drop/delete.png";
import EditButton from '../../../../assets/drop/edit.png';
import Dotted from '../../../../assets/drop/dotted.png';
import DeleteButton from "../../../../assets/drop/delete.png"
import dropdownArrowUp from '../../../../assets/drop/dropdown-arrow-up.png';
import dropdownArrowDown from '../../../../assets/drop/dropdown-arrow-down.png';
import { serverBus } from '../../../../main';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';


export default {
    name: 'MicroInverterSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    onClickUpdate: () => {},
                    onClickSelectPanels: () => {},
                    onClickCancel: () => {},
                    onClickAddCombinerBox: () => {},
                    onClickDeleteCombinerBox: () => {},
                    onClickDeleteString: () => {},
                    onClickEditString: () => {},
                    onClickAddString: () => {},
                    microInverter,
                    stringLength,
                    stringRange,
                    microInverterNumber: 0,
                    microInverterMake: 'Custom Inverter',
                    microInverterManufacturer: '',
                };
            },
        },
    },
    data() {
        return {
            msg: 'I am in Micro Inverter addition mode',
            stringLength : this.summaryData.stringLength,
            editButton: EditButton,
            deleteButtonImg: DeleteButton,
            stringComp: null,
            dotted: Dotted,
            dropdownArrowUp,
            dropdownArrowDown,
            isHidden: true,
            isInputStringLengthValid: true,
            totalStrings: 0,
        }
    },
    mounted() {
        this.$mousetrap.bind( 'del', () => {
            this.deleteButton();
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('del');
    },
    computed: {
        buttonEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            )
        },
        cancelButtonEnabled() {
            return (
                !useStudioSapPaneStore().creationMode &&
                useStudioSapPaneStore().actionsEnabled
            )
        },
        stringRange() {
            return `${this.summaryData.stringRange.min} - ${this.summaryData.stringRange.max}`;
        },
        watchStringLength(){
            return this.summaryData.stringLength;
        },
        panelCount() {
            if(this.summaryData.microInverter.currentPanels.length != 0){
                return this.summaryData.microInverter.currentPanels.length;
            }else{
                return this.summaryData.microInverter.panels.length;
            }
        },
        isStringingValid(){
            let currentLength = this.totalStrings;
            for(let i = 0 ; i < this.summaryData.microInverter.strings.length; i++){
                this.totalStrings += this.summaryData.microInverter.strings[i].linkedPanels.length;
            }
            this.totalStrings -= currentLength;

            if(this.totalStrings >= this.summaryData.microInverter.panels.length-1){
                return false ;
            }
            else{
                return true ;
            }
        },
        microInverterCount(){
            if(this.isInputStringLengthValid){
                const microInverterCount = Math.ceil(this.summaryData.microInverter.panels.length/
                                                        this.summaryData.stringLength);
                return microInverterCount;
            }else{
                return;
            }
        }
    },
    methods: {
        selectPanel() {
            this.summaryData.onClickSelectPanels();
        },
        updateButton() {
            try{
                if(this.summaryData.stringLength >= this.summaryData.stringRange.min 
                    && this.summaryData.stringLength <= this.summaryData.stringRange.max){
                    this.summaryData.onClickUpdate(this.summaryData.stringLength);
                }
            } catch(e){
                console.error();
            }
        },
        cancelButton() {
            this.summaryData.onClickCancel(this.summaryData.microInverter);
        },
        deleteButton() {
            let microInverterArr = [];
            microInverterArr = this.summaryData.microInverter.stage.ground.microInverters;
            // serverBus.$emit(
            //     'modalBoxMicroInverter',
            //     this.summaryData.microInverter,
            //     microInverterArr,
            //     'Performing this action will delete the MicroInverter. Are you sure you want to continue?',
            // );
            let microInvertersToBeDeleted = this.summaryData.microInverter;
            
            for (let inverter in microInverterArr) {
                if (microInvertersToBeDeleted.id === microInverterArr[inverter].id) {
                    let index = microInverterArr.indexOf(microInvertersToBeDeleted);
                    microInverterArr.splice(index, 0);
                    break;
                }
            }
            microInvertersToBeDeleted.removeObject();

            this.summaryData.onClickCancel(this.summaryData.microInverter);
        },
        openModalToAdd(){
            this.summaryData.onClickAddCombinerBox(this.summaryData.microInverter);
        },
        deleteCombinerBox(){
            this.summaryData.onClickDeleteCombinerBox(this.summaryData.microInverter);
        },
        editString(string) {
            this.summaryData.onClickEditString(string);
        },
        delStrings(string){
            this.summaryData.onClickDeleteString(string);
        },
        handleCollapsable() {
            if(this.buttonEnabled) this.isHidden = !this.isHidden;
        },
        addNewString(){
            this.summaryData.onClickAddString(this.summaryData.microInverter);
        },
    },
    watch:{
        watchStringLength(){
            if(this.summaryData.stringLength > this.summaryData.stringRange.max || this.summaryData.stringLength < this.summaryData.stringRange.min){
                this.isInputStringLengthValid = false;
            }else{
                this.isInputStringLengthValid = true;
            }
        }
    }
}
</script>

<style scoped>
.close:before, .close:after{
    display:none;
}
</style>


<style lang="scss" scoped>
@import 'src/styles/components/input.scss';
@import 'src/styles/components/button.scss';

#microInverterSummary .scroll__area{
    max-height: 95vh !important;
}

.select-panels-text {
    color: white;
    margin-bottom: 10px;
    font-size: small;
}

#inverterSummary ::-webkit-scrollbar {
    display: none;
}
#inverterSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#inverterSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
#inverterSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.model-name {
    margin-top: -4px;
}

.combiner_box{
    margin-top: 15px;
    overflow-x: hidden;
}
.combiner_box > *{
    color: white;
}
.combiner_box .box_head,
.combiner_box .menu_options,
.combiner_box  .show_data{
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
.combiner_box .box_head{
    cursor: pointer;
    text-transform: uppercase;
}
.combiner_box .string_length{
    display: flex;
}
.string_length .length{
    margin-right: 4px;
}

.drop-text {
    color: #fff !important;
    font-family: 'Helvetica neue', 'Times', serif;
    font-size: 12px;
    text-decoration: none;
    font-weight: 500;
    padding: 0px 10px 0px 10px;
    width: 200px;
}
/* .length{
    margin-right: 4px;
} */
#microInverterSummary img {
    width: 20px;
    height: 20px;
    float: right;
}
#microInverterSummary img:hover{
    cursor: pointer;
}
.string_add_btn{
    background: inherit;
    font-size: small;
    border: 1px solid white;
    height: 30px;
    width: 85px;
    margin-top: 15px;
    color: white;
    border-radius: 2px;
    cursor: pointer;
}
.string_add_btn:disabled{
    border: 1px solid rgba(225, 225, 225, 0.4) !important;
    color: #4c4c4c !important;
    cursor: not-allowed;
}
.el-icon-circle-plus-outline {
    background-color: transparent;
    border: transparent;
    font-size: 1.6vw;
    cursor: pointer;
    color: #606266;
}

.close el-icon-circle-plus-outline{
    transform: rotate(45deg);
}
.remove-section{
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.el-icon-circle-close-outline:focus{
    outline: none;
}
.el-icon-circle-plus-outline:hover:enabled {
    color: #409eff;
}

.el-icon-circle-plus-outline:focus {
    outline: none;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
.sappane-input-value{
    border-color: none;
}
.sappane-input-value:invalid{
    border: 1px solid red;
}
.sappane-drop-value {
    background-color: transparent;
    color: #fafafa;
    display: flex;
    width: 0px;
}
.img-url {
    width: 20px;
    height: 16px;
    background-image: url('../../../../assets/drop/dotted.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    background-color: transparent;
    color: #fafafa;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    z-index: 0;
    outline: none;
    border: none;
    color: transparent !important;
}
.delete-string {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.error-msg{
    color: red;
    font-size: x-small;
    text-align: end;
}
</style>

<style>
    #stringCompButton {
        display: none;
    }
</style>