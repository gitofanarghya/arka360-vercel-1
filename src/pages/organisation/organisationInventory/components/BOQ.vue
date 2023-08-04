<template>
    <div id="BOQ">
        <div class="addBOQWrapper">
            <div v-show="!isNewBOQFieldBeingAdded">
                <button
                    class="button-confirm"
                    style="height: 40px; margin: 0;"
                    @click="isNewBOQFieldBeingAdded = true">
                    Add BOQ
                </button>
            </div>
            <div v-show="isNewBOQFieldBeingAdded">
                <div>
                    <el-select
                        v-validate="requiredValidation"
                        v-model="newBOQRowDetails.category"
                        name="Category"
                        data-vv-scope="newBOQ"
                        placeholder="Select Category (required)">
                        <el-option
                            v-for="category in BOQ_CATEGORIES"
                            :key="category.VALUE"
                            :label="category.LABEL"
                            :value="category.VALUE"/>
                    </el-select>
                    <el-input
                        v-validate="requiredValidation"
                        v-model="newBOQRowDetails.make"
                        name="Make"
                        data-vv-scope="newBOQ"
                        class="addMakeInput"
                        placeholder="Enter Make (required)"/>
                    <button
                        :disabled="areNewBOQRowFieldsInvalid || addNewBOQRowRequestInProgress"
                        class="button-confirm"
                        style="height: 40px; margin: 0;"
                        @click="addNewBOQField">
                        <i
                            v-show="addNewBOQRowRequestInProgress"
                            class="el-icon-loading"
                            style="color: white; font-size: 12px"/>
                        <span
                            v-show="!addNewBOQRowRequestInProgress"
                            style="margin-left: 0 !important;">
                            Add
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <el-table
            class="bodyLessTable">
            <el-table-column
                label="Category"/>
            <el-table-column
                label="Make"
                width="300"/>
            <el-table-column
                label="Actions"/>
        </el-table>
        <div
            v-for="(categoryData, categoryName) in boqData"
            :key="categoryName">
            <h3 style="margin: 15px 0 10px 0"> {{ categoryName }} </h3>
            <el-table
                :data="categoryData"
                :show-header="false"
                :row-style="{height: '60px'}"
                style="width: 100%">
                <el-table-column
                    prop="category"/>
                <el-table-column
                    width="300">
                    <template slot-scope="scope">
                        <div
                            v-show="scope.row.id !== currentEditingBOQDetails.id">
                            {{ scope.row.make }}
                        </div>
                        <div
                            v-show="scope.row.id === currentEditingBOQDetails.id">
                            <input
                                v-model="currentEditingBOQDetails.make"
                                placeholder="required"
                                class="customInputBOQ">
                        </div>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope">
                        <div style="display: flex">
                            <button
                                v-show="scope.row.id !== currentEditingBOQDetails.id"
                                :disabled="isRowBeingEdited"
                                class="el-icon-edit"
                                @click="onEditExistingBOQ(scope.row.id, scope.row.make)"/>
                            <button
                                v-show="scope.row.id === currentEditingBOQDetails.id"
                                :disabled="isCurrentEditingRowInvalid || existingBOQConfirmInProgress"
                                :class="BOQTableConfirmLoadingIconToggle"
                                @click="onConfirmExistingBOQ(scope.row.id, categoryName)"/>
                            <button
                                :class="scope.row.id === deletingBOQId ? 'el-icon-loading' : 'el-icon-delete'"
                                :disabled="existingBOQDeleteInProgress"
                                style="margin: 0 10px"
                                @click="onDeleteExistingBOQRow(scope.row.id)"/>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>

import { BOQ_CATEGORIES } from '@/pages/constants';
import { mapState, mapActions } from 'pinia';
import { useOrgInventoryBOQStore } from '../../../../stores/organisation-inventory-BOQ';

export default {
    name: 'BOQ',
    data() {
        return {
            isNewBOQFieldBeingAdded: false,
            currentEditingBOQDetails: {
                make: '',
                id: '',
            },
            newBOQRowDetails: {
                category: '',
                make: '',
            },
            requiredValidation: {
                required: true,
            },
            isRowBeingEdited: false,
            addNewBOQRowRequestInProgress: false,
            existingBOQConfirmInProgress: false,
            existingBOQDeleteInProgress: false,
            deletingBOQId: '',
        };
    },
    nonReactiveData() {
        return {
            BOQ_CATEGORIES,
        };
    },
    computed: {
        ...mapState(useOrgInventoryBOQStore, {
            boqData: 'GET_ORGANISATION_BOQ_INVENTORY',
        }),
        areNewBOQRowFieldsInvalid() {
            return this.errors.any('newBOQ');
        },
        isCurrentEditingRowInvalid() {
            // v-validate isn't working properly
            return this.currentEditingBOQDetails.make.trim().length === 0;
        },
        BOQTableConfirmLoadingIconToggle() {
            return this.existingBOQConfirmInProgress ? 'el-icon-loading' : 'el-icon-check';
        },
        BOQTableDeleteLoadingIconToggle() {
            return this.existingBOQDeleteInProgress ? 'el-icon-loading' : 'el-icon-delete';
        },

    },
    methods: {
        ...mapActions(useOrgInventoryBOQStore, {
            updateOrganisationBOQ: 'UPDATE_ORGANISATION_BOQ',
            deleteOrganisationBOQ: 'DELETE_ORGANISATION_BOQ',
            addOrganisationBOQ: 'ADD_ORGANISATION_BOQ',
        }),
        async addNewBOQField() {
            const areNewBOQDetailsValid = await this.$validator.validateAll('newBOQ');
            if (areNewBOQDetailsValid) {
                this.addNewBOQRowRequestInProgress = true;
                await this.addOrganisationBOQ(this.newBOQRowDetails);
                this.addNewBOQRowRequestInProgress = false;
                this.isNewBOQFieldBeingAdded = false;
                this.resetCategoryMake();
            }
        },
        onEditExistingBOQ(categoryDataId, makeValue) {
            this.currentEditingBOQDetails.make = makeValue;
            this.currentEditingBOQDetails.id = categoryDataId;
            this.isRowBeingEdited = true;
        },
        async onConfirmExistingBOQ(id, category) {
            this.existingBOQConfirmInProgress = true;
            const editingBOQRowDetails = {
                id,
                make: this.currentEditingBOQDetails.make,
                category,
            };
            await this.updateOrganisationBOQ(editingBOQRowDetails);
            this.isRowBeingEdited = false;
            this.existingBOQConfirmInProgress = false;
            this.currentEditingBOQDetails.id = '';
        },
        resetCategoryMake() {
            this.newBOQRowDetails.category = '';
            this.newBOQRowDetails.make = '';
        },
        async onDeleteExistingBOQRow(id) {
            this.deletingBOQId = id;
            this.existingBOQDeleteInProgress = true;
            await this.deleteOrganisationBOQ(id);
            this.existingBOQDeleteInProgress = false;
            // if row in edit mode is deleted
            if (this.isRowBeingEdited && this.currentEditingBOQDetails.id === id) {
                this.isRowBeingEdited = false;
                this.currentEditingBOQDetails.id = '';
            }
            this.deletingBOQId = '';
        },
    },
};
</script>


<style type="text/css" scoped>

#BOQ >>> .el-table th > .cell {
    color: #409eff;
}

.el-icon-delete {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
}

.el-icon-delete:hover {
    color: #409EFF;
}
.el-icon-delete:disabled {
    cursor: not-allowed;
}

.el-icon-delete:focus {
    outline: none;
}

.bodyLessTable >>> .el-table__body-wrapper {
    display: none;
}

.el-icon-loading {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
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
.addBOQWrapper {
    display: flex;
    justify-content: flex-end;
    padding: 0 0 20px 0;
}
.customInputBOQ {
    background-color: #FFFFFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 30px;
    line-height: 30px;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 90%;
}
.addMakeInput {
    width: 250px;
}
input.el-input__inner{
  border: none !important;
}
</style>
