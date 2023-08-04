<template>
    <div id="designFinancialView">
        <div class="designSummaryHeadings">
            <div
                class="heading_" 
                style="padding: 0 15px 0 0">
                PRICING
            </div>
            <button
                class="el-icon-circle-plus-outline"
                @click="openDesignFinancialForm"
                style="padding: 0"
                :disabled="financials.length >= 1"/>
                <!-- dialog imported below -->
        </div>
        <div
            v-if="financials.length > 0"
            style="position: relative; margin: 0 0 10px 0">
            <el-table
                :data="financials"
                style="width: 100%;"
                :header-cell-style="changeHead"
            >
                <el-table-column
                    fixed
                    label="Instrument"
                    min-width="110"
                    class-name="cellPaddingReducer"
                >
                    <template>
                        <span>Cash</span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Price"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.price_per_kw !== null">
                            {{ scope.row.price_per_kw }} {{ currencySymbol }}/kW
                        </span>
                        <span v-else>{{ scope.row.absolute_price }} {{ currencySymbol }}</span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="ROI"
                    min-width="110"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.roi !== null">
                            {{ scope.row.roi }} {{ currencySymbol }}
                        </span>
                        <span v-else> - </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="IRR"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.irr !== null">
                            {{ scope.row.irr }} %
                        </span>
                        <span v-else> - </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="LCOE"
                    min-width="100"
                    class-name="cellPaddingReducer">
                    <template
                        slot-scope="scope">
                        <span v-if="scope.row.LCOE !== null">
                            {{ scope.row.LCOE.toFixed(2) }}
                        </span>
                        <span v-else>
                            -
                        </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Payback"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span
                            v-if="scope.row.payback !== null">
                            {{ scope.row.payback.years }} 
                            <span style="font-size: 0.72vw">
                                yrs.
                            </span>
                            {{ scope.row.payback.months }}
                            <span style="font-size: 0.72vw">
                                mos.
                            </span>
                        </span>
                        <span v-else> - </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Tax"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span> {{ scope.row.tax }} % </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Discount Rate"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span> {{ scope.row.discount_rate }} % </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Subsidy"
                    min-width="100"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.subsidy_percentage !== null">
                            {{ scope.row.subsidy_percentage }} %
                        </span>
                        <span v-else>{{ scope.row.subsidy_amount }} {{ currencySymbol }}</span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Maintenance Cost"
                    min-width="100"
                    class-name="cellPaddingReducer">
                    <template slot-scope="scope">
                        <span v-if="scope.row.maintenance_cost_per_kw !== null">
                            {{ scope.row.maintenance_cost_per_kw }} {{ currencySymbol }}/kW/year
                        </span>
                        <span v-else-if="scope.row.absolute_maintenance_cost !== null">
                            {{ scope.row.absolute_maintenance_cost }} ₹/year
                        </span>
                        <span v-else>
                            -
                        </span>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Accelerated Depreciation"
                    min-width="270"
                >
                    <el-table-column
                        label="Years"
                        min-width="70"
                        class-name="cellPaddingReducer"
                    >
                        <template slot-scope="scope">
                            <span> {{ scope.row.ad_years }} yr. </span>
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="Percentage"
                        min-width="120"
                        class-name="cellPaddingReducer"
                    >
                        <template slot-scope="scope">
                            <span> {{ scope.row.ad_percentage }} % </span>
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="Tax-Slab"
                        min-width="110"
                        class-name="cellPaddingReducer"
                    >
                        <template slot-scope="scope">
                            <span> {{ scope.row.ad_tax_slab }} % </span>
                        </template>
                    </el-table-column>
                </el-table-column>

                <el-table-column
                    fixed="right"
                    label="Actions"
                    min-width="115"
                    class-name="cellPaddingReducer"
                >
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            @click="openDesignFinancialForm"
                        >
                            Edit
                        </el-button>
                        <el-button
                            type="text"
                            @click="
                                deleteFinancialInstrument(
                                    scope.$index,
                                    financials
                                )
                            "
                        >
                            Delete
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <designFinancialEditDialog :isfinancialDetailsFormVisible.sync="isfinancialDetailsFormVisible" />
    </div>
</template>

<script>


import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../../stores/design';
import { useProjectStore } from '../../../../stores/project';
import designFinancialEditDialog from './designFinancialEditDialog.vue';



export default {
    name: 'designFinancialView',
    data() {
        return {
            msg: 'I am in designFinancialView',
            isfinancialDetailsFormVisible: false,
        };
    },
    computed: {
        ...mapState(useDesignStore, { 
            financials: 'GET_FINANCIAL_DATA'
        }),
        ...mapState(useProjectStore, {
            currencySymbol: 'GET_CURRENCY_SYMBOL',
        }),
    },
    components: {
        designFinancialEditDialog,
    },
    methods: {
        ...mapActions(useDesignStore, [
            'DELETE_DESIGN_FINANCIAL_DETAILS'
        ]),

        deleteFinancialInstrument(index, rows) {
            this.DELETE_DESIGN_FINANCIAL_DETAILS(rows[index]['id']);
        },
        openDesignFinancialForm() {
            this.isfinancialDetailsFormVisible = true
        },
        changeHead() {
            return { padding: '3px 0' }
        },
    },
}
</script>

<style type="text/css" scoped>

#designFinancialView {
    width: 100%;
    margin: 3vw 0 0 0;
}

#designFinancialView >>> .el-table .cell {
    word-break: break-word;
}

#designFinancialView >>> .cell {
    display: flex;
    justify-content: space-around;
}
/*hides the scrollbar of the table*/
#designFinancialView .el-table__body-wrapper {
    overflow: scroll !important;
}

#designFinancialView >>> .el-table th > .cell {
    font-size: 0.9vw;
}

#designFinancialView >>> .el-table td div {
    font-size: 0.9vw;
}

#designFinancialView .el-button--text {
    font-size: 0.9vw;
}

#designFinancialView >>> td.cellPaddingReducer {
    padding: 0px;
}
/*ensures proper styling of fixed right and left part in table*/
#designFinancialView >>> .el-table__fixed {
    height: 100% !important;
}

#designFinancialView >>> .el-table__fixed-right {
    height: 100% !important;
}
/*ensures no space is taken by default (horizontal) scrollbar*/
#designFinancialView >>> .el-table__body-wrapper::-webkit-scrollbar {
    height: 0;
    width: 0;
}

#designFinancialView >>> .el-table th > .cell {
    font-size: 1vw;
    color: #409eff;
    font-weight: normal;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
}

.heading_ {
    font-size: 1.2vw;
    color: #707070;
    font-weight: bold;
}

.designSummaryHeadings {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 3%;
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
.el-icon-circle-plus-outline:disabled {
    cursor: not-allowed;
    color: #c0c4cc;
}
</style>
