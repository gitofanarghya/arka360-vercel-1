<template>
    <div id="designBOQ">
        <!-- <div class="designSummaryHeadings">
            <div
                class="allPagesIcons heading_"
                style="padding: 0 15px 0 0">BILL OF QUANTITY</div>
        </div> -->
        <el-table
            v-loading="IsTableRendering"
            v-if="!isBOQTableDataEmpty"
            :data="boqTableData"
            :header-cell-style="tableHeaderStyle"
            :row-style="{height: '60px'}">
            <el-table-column
                prop="category"/>
            <el-table-column>
                <template slot-scope="scope">
                    <div
                        v-show="editBOQRowData.index !== scope.$index">
                        {{ scope.row.make }}
                    </div>
                    <div
                        v-show="editBOQRowData.index === scope.$index">
                        <div v-if="isRowCategoryAvailableInInventory(scope.row.category)">
                            <el-select
                                v-model="editBOQRowData.make"
                                allow-create
                                filterable
                                class="selectStyleCustom">
                                <el-option
                                    v-for="(makeOptions, index) in boqInventoryData[scope.row.category]"
                                    :key="index"
                                    :label="makeOptions.make"
                                    :value="makeOptions.make"/>
                            </el-select>
                        </div>
                        <div v-else>
                            <el-input
                                v-model="editBOQRowData.make"
                                placeholder="required"
                                class="inputValueCustomStyle"/>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <div 
                        v-show="editBOQRowData.index !== scope.$index">
                        {{ scope.row.quantity }}
                    </div>
                    <div
                        v-show="editBOQRowData.index === scope.$index">
                        <el-input
                            v-model="editBOQRowData.quantity"
                            placeholder="required"
                            class="inputValueCustomStyle"/>
                    </div>
                </template>
            </el-table-column>
            <el-table-column>
                <template slot-scope="scope">
                    <div style="display: flex">
                        <button
                            v-show="editBOQRowData.index !== scope.$index"
                            :disabled="isBOQRowBeingEdited"
                            class="el-icon-edit"
                            @click="onEditBOQRowCategory(scope.$index, scope.row.make, scope.row.quantity)"/>
                        <button
                            v-show="editBOQRowData.index === scope.$index"
                            :disabled="isEditedBOQRowInvalid || existingBOQConfirmInProgress"
                            :class="BOQTableConfirmLoadingIconToggle"
                            @click="onConfirmBOQRowEdit(scope.$index)"/>
                        <button
                            :class="deletingBOQIndex === scope.$index ? 'el-icon-loading' : 'el-icon-delete'"
                            :disabled="existingBOQDeleteInProgress"
                            style="margin: 0 10px"
                            @click="onDeleteBOQRow(scope.$index)"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div>
            <el-form
                :inline="true"
                :model="newBOQRowData"
                @submit.native.prevent>
                <el-form-item>
                    <el-select
                        v-validate="requiredValidation"
                        v-model="newBOQRowData.category"
                        data-vv-scope="newBOQ"
                        name="Category"
                        class="marginForAlignButton newBOQRowCategoryDropdown"
                        placeholder="Select Component"
                        @change="resetNewBOQRowData">
                        <el-option
                            v-for="category in BOQ_CATEGORIES"
                            :key="category.VALUE"
                            :label="category.LABEL"
                            :value="category.VALUE"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select
                        v-show="isCategoryAvailableInInventory"
                        v-model="newBOQRowData.make"
                        data-vv-scope="newBOQ"
                        name="Make"
                        class="marginForAlignButton newBOQRowMakeDropdownInput"
                        allow-create
                        filterable
                        placeholder="Select Make">
                        <el-option
                            v-for="(makeOptions, index) in boqInventoryData[newBOQRowData.category]"
                            :key="index"
                            :label="makeOptions.make"
                            :value="makeOptions.make"/>
                    </el-select>
                    <el-input
                        v-show="!isCategoryAvailableInInventory"
                        v-model="newBOQRowData.make"
                        data-vv-scope="newBOQ"
                        name="Make"
                        class="marginForAlignButton newBOQRowMakeDropdownInput"
                        placeholder="Enter Make"/>
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-validate="requiredValidation"
                        v-model="newBOQRowData.quantity"
                        data-vv-scope="newBOQ"
                        name="Quantity"
                        class="marginForAlignButton newBOQRowQuantityInput"
                        placeholder="Enter Quantity"/>
                </el-form-item>
                <el-form-item>
                    <button
                        :disabled="areNewBOQRowFieldsInvalid || newRowAdditionInProgress"
                        class="button-confirm"
                        style="height: 39px; margin: 0"
                        @click="addNewBOQRow">
                        <i
                            v-show="newRowAdditionInProgress"
                            class="el-icon-loading"
                            style="color: white; font-size: 12px"/>
                        <span
                            v-show="!newRowAdditionInProgress"
                            style="margin-left: 0 !important;">
                            Add
                        </span>
                    </button>
                </el-form-item>
            </el-form>
            <div
                v-show="errors.any('newBOQ')"
                class="formErrors"
                style="margin: 0 0 20px 0">
                Component, Quantity fields are required
            </div>
        </div>
    </div>
</template>

<script>

import { mapState, mapActions } from 'pinia';
import { BOQ_CATEGORIES } from '@/pages/constants';
import { useOrgInventoryBOQStore } from '../../../stores/organisation-inventory-BOQ';
import { useDesignStore } from '../../../stores/design';

export default {
    data() {
        return {
            newBOQRowData: {
                category: '',
                make: '',
                quantity: '',
            },
            requiredValidation: {
                required: true,
            },
            editBOQRowData: {
                make: '',
                quantity: '',
                index: '',
            },
            isBOQRowBeingEdited: false,
            IsTableRendering: false,
            existingBOQConfirmInProgress: false,
            existingBOQDeleteInProgress: false,
            deletingBOQIndex: '',
            newRowAdditionInProgress: false,
        };
    },
    nonReactiveData() {
        return {
            BOQ_CATEGORIES,
        };
    },
    computed: {
        ...mapState(useOrgInventoryBOQStore, {
            boqInventoryData: 'GET_ORGANISATION_BOQ_INVENTORY',
        }),
        ...mapState(useDesignStore, {
            boqTableData: 'GET_ORGANISATION_BOQ_TABLE_DATA',
        }),
        isBOQTableDataEmpty() {
            if (this.boqTableData === undefined || this.boqTableData === null) {
                return true;
            }
            return this.boqTableData.length === 0;
        },
        isCategoryAvailableInInventory() {
            const categoriesInBOQData = Object.keys(this.boqInventoryData);
            return categoriesInBOQData.indexOf(this.newBOQRowData.category) !== -1;
        },
        isEditedBOQRowInvalid() {
            return this.editBOQRowData.quantity.trim().length === 0;
        },
        areNewBOQRowFieldsInvalid() {
            return this.errors.any('newBOQ');
        },
        BOQTableConfirmLoadingIconToggle() {
            return this.existingBOQConfirmInProgress ? 'el-icon-loading' : 'el-icon-check';
        },
        BOQTableDeleteLoadingIconToggle() {
            return this.existingBOQDeleteInProgress ? 'el-icon-loading' : 'el-icon-delete';
        },

    },
    methods: {
        ...mapActions(useDesignStore, {
            updateBOQTable: 'UPDATE_BOQ_TABLE',
        }),
        isRowCategoryAvailableInInventory(category) {
            const availableCategoriesInInventory = Object.keys(this.boqInventoryData);
            return availableCategoriesInInventory.indexOf(category) !== -1;
        },
        onEditBOQRowCategory(rowIndex, rowMake, rowQuantity) {
            this.assignTempValueForMakeQuantity(rowMake, rowQuantity, rowIndex);
            this.isBOQRowBeingEdited = true;
        },
        assignTempValueForMakeQuantity(rowMake, rowQuantity, rowIndex) {
            this.editBOQRowData.make = rowMake;
            this.editBOQRowData.quantity = rowQuantity;
            this.editBOQRowData.index = rowIndex;
        },
        async onConfirmBOQRowEdit(rowIndex) {
            this.existingBOQConfirmInProgress = true;
            const boqTableDataCopy = [...this.boqTableData];
            boqTableDataCopy[rowIndex].make = this.editBOQRowData.make;
            boqTableDataCopy[rowIndex].quantity = this.editBOQRowData.quantity;
            const payload = {
                manual_bom_data: boqTableDataCopy,
            };
            await this.updateBOQTable(payload);
            this.isBOQRowBeingEdited = false;
            this.existingBOQConfirmInProgress = false;
            this.editBOQRowData.index = '';
        },
        async onDeleteBOQRow(rowIndex) {
            this.deletingBOQIndex = rowIndex;
            this.existingBOQDeleteInProgress = true;
            const boqTableDataCopy = [...this.boqTableData];
            boqTableDataCopy.splice(rowIndex, 1);
            const payload = {
                manual_bom_data: boqTableDataCopy,
            };
            await this.updateBOQTable(payload);
            if (this.isBOQRowBeingEdited && rowIndex === this.editBOQRowData.index) {
                this.isBOQRowBeingEdited = false;
                this.editBOQRowData.index = '';
            }
            // when editing row place gets changed
            else if (this.isBOQRowBeingEdited && rowIndex < this.editBOQRowData.index) {
                this.editBOQRowData.index -= 1;
                this.manageTableRendering();
            }
            this.existingBOQDeleteInProgress = false;
            this.deletingBOQIndex = '';
        },
        resetNewBOQRowData() {
            this.newBOQRowData.quantity = '';
            this.newBOQRowData.make = '';
        },
        manageTableRendering() {
            this.IsTableRendering = true;
            setTimeout(() => {
                this.IsTableRendering = false;
            }, 1500);
        },
        tableHeaderStyle ({ row, column, rowIndex, columnIndex }) {
            if (rowIndex === 0) {
              return 'display:none'
          }
        },
        async addNewBOQRow() {
            const areNewBOQFieldsValid = await this.$validator.validateAll('newBOQ');
            if (areNewBOQFieldsValid) {
                this.newRowAdditionInProgress = true;
                let payload = {};
                if (Array.isArray(this.boqTableData)) {
                    const boqTableDataCopy = [...this.boqTableData];
                    boqTableDataCopy.push(this.newBOQRowData);
                    payload = {
                        manual_bom_data: boqTableDataCopy,
                    };
                }
                else {
                    payload = {
                        manual_bom_data: [this.newBOQRowData],
                    };
                }
                await this.updateBOQTable(payload);
                this.newRowAdditionInProgress = false;
            }
        },
    },
};
</script>

<style scoped>
.heading_ {
    font-size: 1.2vw;
    color: #707070;
    font-weight: bold;
}
.designSummaryHeadings {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 3vw 0 3% 0;
}
#designBOQ >>> .el-table th > .cell {
    font-size: 1.1vw;
    color: #409eff;
    font-weight: normal;
}
#designBOQ >>> .el-table thead  {
    height: 1px;
}

#designBOQ >>> .el-table td div {
    font-size: 1.1vw;
    font-weight: normal;
}
.el-icon-loading {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
}
.el-icon-loading:focus {
    outline: none;
}

.el-icon-delete {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
}
.el-icon-delete:disabled {
    cursor: not-allowed;
}
.el-icon-delete:hover {
    color: #409EFF;
}

.el-icon-delete:focus {
    outline: none;
}
.el-icon-edit {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
}

.el-icon-edit:hover {
    color: #409EFF;
}
.el-icon-edit:disabled {
    cursor: not-allowed;
}
.el-icon-edit:focus {
    outline: none;
}

.el-icon-check {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 20px;
}

.el-icon-check:disabled {
    cursor: not-allowed;
}

.el-icon-check:hover {
    color: #409EFF;
}

.el-icon-check:focus {
    outline: none;
}
.el-icon-circle-plus-outline {
    background-color: transparent;
    border: transparent;
    font-size: 1.6vw;
    cursor: pointer;
    color: #606266;
}

.el-icon-circle-plus-outline:hover:enabled {
    color: #409eff;
}

.el-icon-circle-plus-outline:focus {
    outline: none;
}
.inputValueCustomStyle >>> .el-input__inner {
    height: 30px;
    line-height: 30px;
}

.selectStyleCustom >>> .el-input__inner {
    height: 30px;
    line-height: 30px;
}
.selectStyleCustom >>> .el-input__icon {
    line-height: 30px;
}
.marginForAlignButton {
    margin: 2px 0 0 0;
}
.newBOQRowCategoryDropdown {
    width: 150px;
}
.newBOQRowMakeDropdownInput {
    width: 250px
}
.newBOQRowQuantityInput {
    width: 150px;
}
tr {
 display: none;
}


</style>
