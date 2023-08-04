<template>
    <div class="sappane-label">
        <div v-for="(items, index) in propertiesData.mppts" :key="index">
            <div :key="index" :class="'mppt-list sappane-label'" @click="handleCollapsable(`${index+10}`)">
                <div>MPPT {{ index + 1 }}</div>
                <div v-if="dropClose == `${index+10}`"><img :src="dropdownArrowUp" width="20px" height="20px" /></div>
                <div v-else><img :src="dropdownArrowDown" width="20px" height="20px" /></div>
            </div>
            <div :key="index+20" class="hidden" :id="`${index+10}`">
                <div class="mppt-props-label">
                    <div class="sappane-label">
                        <div class="sappane-label string-ranges string-range-com">
                            <div>STRING RANGE</div>
                            <div v-if="dropClose == 2"><img :src="dropdownArrowUp" width="20px" height="20px" /></div>
                            <div v-else><img :src="dropdownArrowDown" width="20px" height="20px" /></div>
                        </div>
                        <div>
                            <div class="sappane-label">
                                Minimum
                                <label>
                                    <input
                                        v-model.number="stringRanges[index].minimum"
                                        type="number"
                                        class="sappane-input-value"
                                        :disabled="!editEnabled"
                                        name="minimum"
                                        autocomplete="off">
                                        <p class = 'stringRangeMaxMinError' v-if = "(!Number.isInteger(stringRanges[index].minimum))">
                                            {{ 'Value should be integer' }}
                                        </p>
                                        <p class = 'stringRangeMaxMinError' v-if = "stringRanges[index].minimum < 0">
                                            {{ 'value should be more than 0' }}
                                        </p>
                                </label>
                            </div>
                            <div class="sappane-label">
                                Maximum
                                <label>
                                    <input
                                        v-model.number="stringRanges[index].maximum"
                                        type = "number"
                                        class="sappane-input-value"
                                        :disabled="!editEnabled"
                                        name="maximum"
                                        autocomplete="off">
                                        <p class = 'stringRangeMaxMinError' v-if = "(!Number.isInteger(stringRanges[index].maximum))">
                                            {{ 'Value should be integer' }}
                                        </p>
                                        <p class = 'stringRangeMaxMinError' v-if = "stringRanges[index].maximum < stringRanges[index].minimum">
                                            {{  'value should be more than' }} {{ stringRanges[index].minimum }}
                                        </p>
                                </label>
                            </div>
                            <div class="button-actions-row">
                                <div class='button-actions-wrapper'>
                                    <button class="button-actions" :disabled="!editEnabled || updateDisabled(index)" v-on:click="updateStringRange(items, index)">Update</button>
                                </div>
                                <div class='button-actions-wrapper'>
                                    <button class="button-actions" :disabled="!editEnabled" v-on:click="resetStringRange(items, index)">Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sappane-label">
                    Maximum String Count
                    <label class="sappane-input-value">{{items.maxStringCount}}</label>
                </div>
                <div class="sappane-label">
                    Suggested String Count
                    <label class="sappane-input-value">{{items.suggestedStringCount()}}</label>
                </div>
                <div class="sappane-label">
                    String Length
                    <label class="sappane-input-value">{{items.stringsCompleted.length > 0 ? items.stringsCompleted[0].length : 0 }}</label>
                </div>
                <div class="sappane-label">
                    <div>
                        <div class="string-comp">String Completed {{items.stringsCompleted.length}}</div>
                        <div class="string-label">
                            <div class="sappane-label-string" v-for="(string, ind) in items.stringsCompleted" :key="ind">
                                <div>String {{ind+1}}</div>
                                <el-select
                                    v-model="stringComp"
                                    class="text-toolbar-select sappane-drop-value img-url el-icon-more"
                                    :disabled="!editEnabled"
                                    popper-class="darkDropdown"
                                    id="stringCompButton">
                                    <el-option class="drop-text" :value="ind">
                                        <div v-on:click="editString(string)" class="delete-string">
                                            <div >Edit</div>
                                            <img :src="editButton" width="18px" height="18px" />
                                        </div>
                                    </el-option>
                                    <el-option class="drop-text" :value="ind">
                                        <div v-on:click="delStrings(string.removeWithContainer)" class="delete-string">
                                            <div>Delete</div>
                                            <img :src="deleteButton" width="18px" height="18px" />
                                        </div>
                                    </el-option>
                                </el-select>
                            </div>
                            <div class='button-actions-row'>
                                <div class='button-actions-wrapper'>
                                    <button class="button-actions" :disabled="(items.stringsCompleted.length === items.maxStringCount) || !editEnabled" @click="items.addString">Add String</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import dropdownArrowUp from '../../../../../assets/drop/dropdown-arrow-up.png';
import dropdownArrowDown from '../../../../../assets/drop/dropdown-arrow-down.png';
import Dotted from '../../../../../assets/drop/dotted.png';
import ModalBox from '../modalBox.vue';
import { serverBus } from '../../../../../main';
import EditButton from '../../../../../assets/drop/edit.png';
import DeleteButton from '../../../../../assets/drop/delete.png'
import * as notificationsAssistant from '../../../../../../src/componentManager/notificationsAssistant';

export default {
    components: {
        ModalBox
    },
    data() {
        return {
            valuesChanged:       false,
            azimuth:             this.propertiesData.azimuth,
            mountHeight:         this.propertiesData.mountHeight,
            mountHeightEditable: this.propertiesData.mountHeightEditable,
            dropdownArrowUp:     dropdownArrowUp,
            dropdownArrowDown:   dropdownArrowDown,
            dropClose:           false,
            dotted:              Dotted,
            isVisible:           false,
            editButton:          EditButton,
            deleteButton:        DeleteButton,
            mpptsItems:          this.propertiesData.mppts,
            allSubarraysLink:    this.propertiesData.mppts.allSubararysForMppt,
            stringComp:          null,
            selectedLinkSubArray:[],
            linkedSubArrayState: [],
            checkedBox:          false,
            isRequestAddOn:      true,
            modal: '',
            prevComId: null,
            isDropdownOpen: false,
            // V jugadu method
            // mppt needs refactor
            stringRanges: this.createStringRangesData() || this.propertiesData.mppts.stringRange,
        }
    },
    props: {
        propertiesData: {
            required: true,
            default() {
                return {
                    mppts: [],
                    stringRange,
                    azimuth: 0,
                    mountHeight: 0.001,
                    mountHeightEditable: true,
                    update: () => {},
                };
            },
        },
        editEnabled: true,
    },
    methods: {
        updateDisabled(index) {
            if ((!Number.isInteger(this.stringRanges[index].minimum)) ||
                this.stringRanges[index].minimum < 0 ||
                (!Number.isInteger(this.stringRanges[index].maximum)) ||
                this.stringRanges[index].maximum < this.stringRanges[index].minimum) {
                    return true;
            }
            else {
                return false;
            }
        },
        handleCollapsable(id) {
            if(this.editEnabled){
                this.isDropdownOpen = false
                if (this.prevComId !== id) {
                    this.prevComId ? document.getElementById(this.prevComId).classList.remove('open') : '';
                    document.getElementById(id).classList.add('open');
                    this.prevComId = id;
                    this.dropClose = id
                }
                else if (this.prevComId === id) {
                    document.getElementById(this.prevComId).classList.remove('open');
                    this.prevComId = null;
                    this.dropClose = false;
                }
            }
        },
        editString(string) {
            string.edit();
        },
        delStrings(del) {
            serverBus.$emit('modalBoxOn', del, 'Performing this action will delete the string/s. Are you sure you want to continue?');
        },
        // saveLinkSubArray(mppt) {
        //     let tilt = 0;
        //     let azimuth = 0;
        //     let panelId = 0;
        //     for (let i = 0, l = mppt.allSubararysForMppt.length; i < l; i += 1) {
        //         if (mppt.allSubararysForMppt[i].isChecked) {
        //             tilt = mppt.allSubararysForMppt[i].subarray.tilt;
        //             azimuth = mppt.allSubararysForMppt[i].subarray.azimuth;
        //             panelId = mppt.allSubararysForMppt[i].subarray.moduleProperties.moduleId;
        //             break;
        //         }
        //     }
        //     const linkedSubarrays = [];
        //     let selectedSubarrays = 0;
        //     for (let i = 0, l = mppt.allSubararysForMppt.length; i < l; i += 1) {
        //             if (tilt === mppt.allSubararysForMppt[i].subarray.tilt &&
        //                 azimuth === mppt.allSubararysForMppt[i].subarray.azimuth &&
        //                 panelId === mppt.allSubararysForMppt[i].subarray.moduleProperties.moduleId
        //             ) {
        //                 selectedSubarrays += 1;
        //                 linkedSubarrays.push(mppt.allSubararysForMppt[i].subarray);
        //             }
        //             else {
        //                 this.propertiesData.showNotSelectedSimilarSubarrays();
        //                 return;
        //             }
        //     }
        //     if (selectedSubarrays === 0) {
        //         this.propertiesData.showNotSelectedError();
        //         return;
        //     }
        //     this.isDropdownOpen = false;
        //     mppt.setLinkedSubarrays(linkedSubarrays);
        // },
        requestAddOn() {
            this.isRequestAddOn = false
        },
        handleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },
        createStringRangesData() {
            const stringRanges = [];
            for (let i = 0, l = this.propertiesData.mppts.length; i < l; i += 1) {
                stringRanges.push({
                    minimum: this.propertiesData.mppts[i].stringRange.minimum,
                    maximum: this.propertiesData.mppts[i].stringRange.maximum,
                });
            }
            return stringRanges;
        },
        updateStringRange(mppt, index, resetFlag = false) {
            if (this.stringRanges[index].minimum < this.stringRanges[index].maximum) {
                mppt.setStringRange({
                    min: this.stringRanges[index].minimum,
                    max: this.stringRanges[index].maximum,
                });
                if (!resetFlag) {
                    notificationsAssistant.success({
                        title: 'Updated',
                        message: 'String range updated successfully',
                    });
                }
                else {
                    notificationsAssistant.success({
                        title: 'Reset',
                        message: 'String range reset successfully',
                    });
                }
            } else {
                this.resetStringRange(mppt, index, false);
                notificationsAssistant.error({
                    title: 'Error',
                    message: 'Error updating string Range. Min string range must be less than Max String',
                });
            }
        },
        async resetStringRange(mppt, index, resetFlag = true) {
            try {
                const stringRange = await this.propertiesData.getStringingData(
                    mppt.linkedSubarrayModuleId,
                );
                this.stringRanges[index].minimum = stringRange.min;
                this.stringRanges[index].maximum = stringRange.max;
                this.updateStringRange(mppt, index, resetFlag = true);
            }
            catch (error) {
                console.error('Not able to reset the stringing data.', error);
            }
        },
    },
}
</script>
<style lang="scss" scoped>
    @import '../../../../../styles/components/button.scss';
    @import '../../../../../styles/components/input.scss';
</style>

<style scoped>
.hidden {
    display: none;
}
.hidden.open {
    display: block;
}
.inverter-prop, .mppt-list {
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}
.mppt-content {
    display: none;
    padding-left: 5px;
}
.l-string-save {
    width: 100%;
    padding: 6px;
    border: none;
    color: #fff;
    margin-top: 10px;
    background-color: #3e99f7;
}
.string-range-com {
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}
.prop-button {
    width: 40%;
    background: #151515;
    color: white;
    padding: 4px;
    border: 1px solid white;
    cursor: pointer;
    border-radius: 4px;
    outline: none;
}
.prop-button:hover {
    background-color: #7B7D7D ;
    color: black;
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
.add-string {
    width: 50%;
    height: 22px;
    border: solid 1px #ffffff;
    background-color: #151515;
    color: #fff;
    font-size: 10px;
    cursor: pointer;
    border-radius: 4px;;
}
.add-string:disabled {
    border: 1px solid rgba(225, 225, 225, 0.4) !important;
    color: #4c4c4c !important;
}
.add-string:hover {
    background-color: #7B7D7D ;
    color: black;
}
.add-string:disabled:hover {
    background-color: #151515 ;
    color: #ffffff;
}
.string-comp {
    text-align: left;
    color: #999999;
    margin-bottom: 5px;
}
.string-label {
    padding: 3px 0px 5px 8px;
}
.sappane-label-string {
    display: flex;
    justify-content: space-between;
}
.sappane-drop-value {
    background-color: transparent;
    color: #fafafa;
    display: flex;
    box-sizing: border-box;
    width: 0px;
}
.delete-string {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.img-url {
    width: 20px;
    height: 16px;
    background-image: url('../../../../../assets/drop/dotted.png');
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
.drop-text-substring {
    color: #fff !important;
}
.sappane-label-string >>> .el-input__inner {
    background: transparent;
}
.sappane-label-string >>>.el-input--suffix .el-input__inner {
    border-color: hsl(0deg 0% 8%);
}
.sappane-label-string >>> .el-select .el-input.is-focus .el-input__inner {
    border-color: hsl(0deg 0% 8%) !important;
}
.mppt-props-label {
    height: 25%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-bottom: 5px;
    font-size: 0.9vw;
}
.mppt-props-label .name {
    width: 50%;
    display: flex;
    flex-direction: row;
    text-align: start;
    align-items: flex-start;
}
.linked-subarray-block {
    width: 50%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;
}

.linked-subarray-block > input {
    min-width: 50%;
    max-block-size: 40px;
    cursor: pointer;
}
.linked-subarray-dropdown {
    position: absolute;
    top: 15px;
    right: 2px;
    min-height: 80px;
    max-height: 200px;
    min-width: 140px;
    font-family: "Helvetica Neue";
    background-color: #2a2a2a;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    z-index: 2002;
    overflow-y: scroll;
}
.linked-subarray-block .options {
    min-height: 35px;
    padding: 5px 0;
    margin-bottom: 3px;
    color: white !important;
    font-size: 14px;
    padding: 0 20px;
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 34px;
    cursor: pointer;
}
.linked-subarray-block .options:hover {
    background-color: #666666 ;
}
.linked-subarray-block .button {
    position: sticky;
    bottom: 0;
    min-height: 40px;
    max-height: 40px;
    min-width: 100%;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2002;
    background-color: #272626;
}
.linked-subarray-block .button button {
    min-height: 30px;
    max-height: 30px;
    min-width: 120px;
    max-width: 120px;
    border: none;
    color: #fff;
    background-color: #3e99f7;
    cursor: pointer;
}
.stringRangeMaxMinError {
    margin-top: 10px;
    margin-bottom: 5px;
  }

</style>

<style>
    #stringCompButton {
        display: none;
    }
</style>