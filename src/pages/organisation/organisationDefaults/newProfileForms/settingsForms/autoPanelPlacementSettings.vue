<template>
    <div id="default_table_typesForm">

        <VuePerfectScrollbar class="scroll-area">

            <p class="formHeadings"> Default Table Types for Auto Module Placement </p>
            <div style="width: 97%">
                <el-table :data="profileData.default_table_types"
                          style="width: 100%; margin-top: 10px">
                    <el-table-column property="panelOrientation" label="Orientation"></el-table-column>

                    <el-table-column label="Table Size">
                        <el-table-column property="tableSizeUp" label="Up"></el-table-column>
                        <el-table-column property="tableSizeWide" label="Wide"></el-table-column>
                    </el-table-column>


                    <el-table-column label="Module Spacing">
                        <el-table-column label="Up">
                            <template slot-scope="scope">
                                <display-length
                                    :metric-value="scope.row.moduleSpacingUp"/>
                            </template>
                        </el-table-column>
                        <el-table-column label="Wide">
                            <template slot-scope="scope">
                                <display-length
                                    :metric-value="scope.row.moduleSpacingWide"/>
                            </template>
                        </el-table-column>
                    </el-table-column>


                    <el-table-column label="Mount Height">
                        <template slot-scope="scope">
                            <display-length
                                :metric-value="scope.row.mountHeight"/>
                        </template>
                    </el-table-column>
                    <el-table-column label="Operations">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="danger"
                                    @click="deleteTableType(scope.$index, scope.row)"> Delete
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>


            <p class="formHeadings" style="padding-top: 20px;"> Add New Table </p>
            <el-form :model="addTableType" size="mini" label-position="left" label-width="250px" style="padding: 15px 0 15px 0">

                <el-form-item label="Module Orientation" prop="panelOrientation">
                    <el-radio-group v-model="addTableType.panelOrientation" size="mini">
                        <el-radio-button label="Landscape"></el-radio-button>
                        <el-radio-button label="Portrait"></el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="Array Rows" prop="tableSizeUp">
                    <input
                            autocomplete="off"
                            class="inputBoxStyler"
                            v-model.number="addTableType.tableSizeUp"
                            data-vv-scope="addTableFormScope"
                            v-validate="tableSizeUpValidation"
                            name="Array Rows"
                            type="number"
                            />
                    <!-- </input> -->
                    <p class="formErrors"><span>{{ errors.first('Array Rows', "addTableFormScope" ) }}</span>
                    </p>
                </el-form-item>

                <el-form-item label="Array Columns" prop="tableSizeWide">
                    <input
                            autocomplete="off"
                            class="inputBoxStyler"
                            v-model.number="addTableType.tableSizeWide"
                            data-vv-scope="addTableFormScope"
                            v-validate="tableSizeWideValidation"
                            name="Array Columns"
                            type="number" 
                            />
                    <!-- </input> -->
                    <p class="formErrors">
                        <span>{{ errors.first('Array Columns', "addTableFormScope") }}</span></p>
                </el-form-item>

                <el-form-item label="Vertical Module Spacing" prop="moduleSpacingUp">
                    <input-length
                        v-model="addTableType.moduleSpacingUp"
                        :name="'Vertical Module Spacing'"
                        :metric-validation="moduleSpacingUpValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                        error-scope="addTableFormScope"
                    />
                    <p class="formErrors">
                        <span>{{ errors.first('Vertical Module Spacing', "addTableFormScope") }}</span></p>
                </el-form-item>

                <el-form-item label="Horizontal Module Spacing" prop="moduleSpacingWide">
                    <input-length
                        v-model="addTableType.moduleSpacingWide"
                        :name="'Horizontal Module Spacing'"
                        :metric-validation="moduleSpacingWideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                        error-scope="addTableFormScope"
                    />
                    <p class="formErrors">
                        <span>{{ errors.first('Horizontal Module Spacing', "addTableFormScope") }}</span></p>
                </el-form-item>

                <el-form-item label="Mount Height" prop="mountHeight">
                    <input-length
                        v-model="addTableType.mountHeight"
                        :name="'Mount Height'"
                        :metric-validation="mountHeightValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                        error-scope="addTableFormScope"
                    />
                    <p class="formErrors"><span> {{ errors.first('Mount Height', "addTableFormScope") }} </span>
                    </p>
                </el-form-item>

                <el-button type="primary" @click="addToAPPTable()" :disabled="errors.any('addTableFormScope')">Add</el-button>
            </el-form>
        </VuePerfectScrollbar>
    </div>
</template>

<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

    export default {
        name: 'default_table_typesForm',
        components: {
            VuePerfectScrollbar,
        },
        props: ['profileData', 'profileData.default_table_types'],
        data() {
            return {
                msg: 'I am in default_table_typesForm',
                addTableType: {
                    panelOrientation: 'Landscape',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.01
                },
                tableSizeUpValidation: {
                    required: true,
                    numeric: true,
                    min_value: 1,
                },
                tableSizeWideValidation: {
                    required: true,
                    numeric: true,
                    min_value: 1
                },
                mountHeightValidation: {
                    required: true,
                    min_value: 0.001,
                    decimal: 3
                },
                moduleSpacingUpValidation: {
                    required: true,
                    min_value: 0,
                    decimal: 3
                },
                moduleSpacingWideValidation: {
                    required: true,
                    min_value: 0,
                    decimal: 3
                },
                // autoSubarray: {
                //     tableTypes: [
                //         {
                //             panelOrientation: 'Landscape',
                //             tableSizeUp: 1,
                //             tableSizeWide: 1,
                //             moduleSpacingUp: 0.025,
                //             moduleSpacingWide: 0.025,
                //             mountHeight: 1
                //         },
                //         {
                //             panelOrientation: 'Portrait',
                //             tableSizeUp: 1,
                //             tableSizeWide: 1,
                //             moduleSpacingUp: 0.025,
                //             moduleSpacingWide: 0.025,
                //             mountHeight: 1
                //         },
                //         {
                //             panelOrientation: 'Landscape',
                //             tableSizeUp: 2,
                //             tableSizeWide: 1,
                //             moduleSpacingUp: 0.025,
                //             moduleSpacingWide: 0.025,
                //             mountHeight: 1
                //         },
                //         {
                //             panelOrientation: 'Portrait',
                //             tableSizeUp: 2,
                //             tableSizeWide: 1,
                //             moduleSpacingUp: 0.025,
                //             moduleSpacingWide: 0.025,
                //             mountHeight: 1
                //         },
                //     ]
                // },
            };
        },

        methods: {
            addToAPPTable(){
                this.profileData.default_table_types.push({
                    "mountHeight": this.addTableType.mountHeight,
                    "tableSizeUp": this.addTableType.tableSizeUp,
                    "tableSizeWide": this.addTableType.tableSizeWide,
                    "moduleSpacingUp": this.addTableType.moduleSpacingUp,
                    "panelOrientation": this.addTableType.panelOrientation,
                    "moduleSpacingWide": this.addTableType.moduleSpacingWide
                });
            },
            deleteTableType(index, row) {
                this.profileData.default_table_types.splice(index, 1);
            },

        }
    };

</script>

<style type="text/css">
    #default_table_typesForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }
    .el-table__body-wrapper::-webkit-scrollbar {
        height: 0 !important
    }
    #default_table_typesForm .el-table::before {
        height: 0px;
    }

</style>
