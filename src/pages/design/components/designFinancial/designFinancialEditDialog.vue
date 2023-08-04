<template>
    <div id="designFinancialEditDialog">
        <el-dialog
            title="Financial Analysis"
            :visible="isfinancialDetailsFormVisible"
            :close-on-click-modal="false"
            width="50%"
            @open="assignFinancialDataToForm"
            @close="closefinancialDetailsForm"
        >
            <div class="scroll-area" v-bar>
                <el-form
                    :model="financingDetailsForm"
                    size="mini"
                    label-position="left"
                    label-width="200px"
                    ref="financingDetailsForm"
                >
                    <p class="formHeadings">Pricing</p>
                    <el-form-item label="Price">
                        <el-input
                            v-model="financingDetailsForm.price"
                            v-validate="priceValidation"
                            name="Price"
                            class="unitSelector">
                            <el-select slot="append" v-model="priceUnit" :popper-append-to-body="false">
                                <el-option
                                    :label="`${currencySymbol}/kW`"
                                    value="relative"/>
                                <el-option
                                    :label="`${currencySymbol}`"
                                    value="absolute"/>
                            </el-select>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Price') }}</span>
                        </p>
                    </el-form-item>

                    <el-form-item label="Tax">
                        <el-input v-model="financingDetailsForm.tax" v-validate="taxValidation" name="Tax">
                            <template slot="append">%</template>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Tax') }}</span>
                        </p>
                    </el-form-item>

                    <el-form-item label="Expected Life">
                        <el-input
                            v-model="financingDetailsForm.expected_life_years"
                            v-validate="expectedLifeValidation"
                            name="Expected Life"
                        >
                            <template slot="append">years</template>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Expected Life') }}</span>
                        </p>
                    </el-form-item>

                    <el-form-item label="Discount Rate">
                        <el-input
                            v-model="financingDetailsForm.discount_rate"
                            v-validate="discountRateValidation"
                            name="Discount Rate"
                        >
                            <template slot="append">%</template>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Discount Rate') }}</span>
                        </p>
                    </el-form-item>

                    <p class="formHeadings">Subsidy</p>

                    <el-form-item label="Subsidy">
                        <el-input
                            v-model="financingDetailsForm.subsidy"
                            v-validate="subsidyValidation"
                            name="Subsidy"
                            class="unitSelector"
                        >
                            <el-select slot="append" v-model="subsidyUnit" :popper-append-to-body="false">
                                <el-option
                                    :label="`${currencySymbol}`"
                                    value="absolute"/>
                                <el-option
                                    label="%" 
                                    value="relative"/>
                            </el-select>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Subsidy') }}</span>
                        </p>
                    </el-form-item>

                    <p class="formHeadings">Maintenance</p>

                    <el-form-item label="Maintenance Cost">
                        <el-input
                            v-validate="maintenanceCostValidation"
                            v-model="financingDetailsForm.maintenance_cost"
                            name="Maintenance Cost"
                            class="unitSelector"
                        >
                            <el-select
                                slot="append"
                                v-model="maintenanceCostUnit"
                                :popper-append-to-body="false">
                                <el-option
                                    :label="`${currencySymbol}/kW/year`"
                                    value="relative"/>
                                <el-option
                                    :label="`${currencySymbol}/year`"
                                    value="absolute"/>
                            </el-select>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Maintenance Cost') }}</span>
                        </p>
                    </el-form-item>

                    <p class="formHeadings">Accelerated Depreciation</p>

                    <el-form-item label="Percentage">
                        <el-input
                            v-model="financingDetailsForm.ad_percentage"
                            v-validate="acceleratedPercentageValidation"
                            name="Accelerated Percentage"
                        >
                            <template slot="append">%</template>
                        </el-input>
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first('Accelerated Percentage')
                                }}
                            </span>
                        </p>
                    </el-form-item>

                    <el-form-item label="Years">
                        <el-input
                            v-model="financingDetailsForm.ad_years"
                            v-validate="acceleratedYearsValidation"
                            name="Accelerated Years"
                        >
                            <template slot="append">years</template>
                        </el-input>
                        <p class="formErrors">
                            <span>{{ errors.first('Accelerated Years') }}</span>
                        </p>
                    </el-form-item>

                    <el-form-item label="Tax-Slab">
                        <el-input
                            v-model="financingDetailsForm.ad_tax_slab"
                            v-validate="acceleratedTaxValidation"
                            name="Accelerated Tax Slab"
                        >
                            <template slot="append">%</template>
                        </el-input>
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first('Accelerated Tax Slab')
                                }}
                            </span>
                        </p>
                    </el-form-item>
                </el-form>
            </div>

            <span slot="footer">
                <!-- <button
                    class="button-cancel"
                    @click="closefinancialDetailsForm">
                    Cancel
                </button> -->

                <button
                    :disabled="errors.items.length > 0"
                    class="button-confirm"
                    @click="confirmFinancialFormData">
                    Confirm
                </button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../../stores/design';
import { useProjectStore } from '../../../../stores/project';

export default {
    name: "designFinancialEditDialog",
    props: {
        isfinancialDetailsFormVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            msg: "I am in designFinancialEditDialog",
            financingDetailsForm: {
                id: "",
                price: null,
                tax: null,
                expected_life_years: null,
                discount_rate: null,
                subsidy: null,
                ad_percentage: null,
                ad_years: null,
                ad_tax_slab: null,
                maintenance_cost: null,
            },
            priceUnit: "relative",
            subsidyUnit: "relative",
            maintenanceCostUnit: null,
            priceValidation: {
                required: true,
                min_value: 1,
                decimal: 2,
            },
            taxValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            expectedLifeValidation: {
                required: true,
                min_value: 1,
                integer: true,
            },
            discountRateValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            subsidyValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            acceleratedPercentageValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            acceleratedYearsValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            acceleratedTaxValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            maintenanceCostValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            financialsParameters: 'GET_FINANCIAL_DATA',
        }),
        ...mapState(useProjectStore, {
            currencySymbol: 'GET_CURRENCY_SYMBOL',
        }),
    },

    methods: {
        ...mapActions(useDesignStore, [
            "UPDATE_DESIGN_FINANCIAL_DETAILS",
            "POST_FINANCIAL_DETAILS",
        ]),

        async confirmFinancialFormData() {
            const isValid = await this.$validator.validateAll();

            if (isValid) {
                let subsidy_percentage_value = "";
                let subsidy_amount_value = "";
                let price_per_kw_value = "";
                let absolute_price_value = "";

                if (this.priceUnit === "relative") {
                    price_per_kw_value = this.financingDetailsForm.price;
                    absolute_price_value = null;
                } else {
                    price_per_kw_value = null;
                    absolute_price_value = this.financingDetailsForm.price;
                }

                if (this.subsidyUnit === "relative") {
                    subsidy_percentage_value = this.financingDetailsForm.subsidy;
                    subsidy_amount_value = null;
                } else {
                    subsidy_percentage_value = null;
                    subsidy_amount_value = this.financingDetailsForm.subsidy;
                }

                //data to be post/patch
                let postData = {
                    expected_life_years: this.financingDetailsForm.expected_life_years,
                    tax: this.financingDetailsForm.tax,
                    ad_years: this.financingDetailsForm.ad_years,
                    ad_percentage: this.financingDetailsForm.ad_percentage,
                    ad_tax_slab: this.financingDetailsForm.ad_tax_slab,
                    discount_rate: this.financingDetailsForm.discount_rate,
                    design: this.$route.params["designId"],
                    subsidy_percentage: subsidy_percentage_value,
                    subsidy_amount: subsidy_amount_value,
                    price_per_kw: price_per_kw_value,
                    absolute_price: absolute_price_value,
                    absolute_maintenance_cost: this.maintenanceCostUnit === 'absolute' ? this.financingDetailsForm.maintenance_cost : null,
                    maintenance_cost_per_kw: this.maintenanceCostUnit === 'relative' ? this.financingDetailsForm.maintenance_cost : null,
                };
                //checking if this is is a new form or edit one
                if (this.financialsParameters[0] !== undefined) {
                    try {
                        await this.UPDATE_DESIGN_FINANCIAL_DETAILS(postData);
                        this.closefinancialDetailsForm();
                    } catch (e) {
                        this.displayError();
                    }
                } else {
                    try {
                        await this.POST_FINANCIAL_DETAILS(postData);
                        this.closefinancialDetailsForm();
                    } catch (e) {
                        this.displayError();
                    }
                }
            }
        },

        displayError() {
            this.$message({
                showClose: true,
                message: "Error in updating financial details. Try again",
                type: "error",
                center: true
            });
            this.closefinancialDetailsForm();
        },

        closefinancialDetailsForm() {
            this.$emit("update:isfinancialDetailsFormVisible", false);
        },
        assignFinancialDataToForm() {
            this.$validator.reset();

            if (this.financialsParameters[0] !== undefined) {
                // assigning the values of particular financials
                this.financingDetailsForm["id"] = this.financialsParameters[0]["id"];
                this.financingDetailsForm[
                    "expected_life_years"
                ] = this.financialsParameters[0]["expected_life_years"];
                this.financingDetailsForm["tax"] = this.financialsParameters[0]["tax"];
                this.financingDetailsForm["ad_tax_slab"] = this.financialsParameters[0][
                    "ad_tax_slab"
                ];
                this.financingDetailsForm["ad_years"] = this.financialsParameters[0][
                    "ad_years"
                ];
                this.financingDetailsForm[
                    "ad_percentage"
                ] = this.financialsParameters[0]["ad_percentage"];
                this.financingDetailsForm[
                    "discount_rate"
                ] = this.financialsParameters[0]["discount_rate"];

                //checking for price, subsidy and maintenance cost
                if (this.financialsParameters[0]["absolute_price"] === null) {
                    this.financingDetailsForm["price"] = this.financialsParameters[0][
                        "price_per_kw"
                    ];
                    this.priceUnit = "relative";
                } else {
                    this.financingDetailsForm["price"] = this.financialsParameters[0][
                        "absolute_price"
                    ];
                    this.priceUnit = "absolute";
                }

                if (this.financialsParameters[0]["subsidy_amount"] === null) {
                    this.financingDetailsForm["subsidy"] = this.financialsParameters[0][
                        "subsidy_percentage"
                    ];
                    this.subsidyUnit = "relative";
                } else {
                    this.financingDetailsForm["subsidy"] = this.financialsParameters[0][
                        "subsidy_amount"
                    ];
                    this.subsidyUnit = "absolute";
                }
                // for old designs initially both absolute and relative maintenance cost would be null
                if (this.financialsParameters[0].absolute_maintenance_cost === null ||
                        (this.financialsParameters[0].absolute_maintenance_cost === null && this.financialsParameters[0].maintenance_cost_per_kw === null)) {
                    this.financingDetailsForm.maintenance_cost = this.financialsParameters[0].maintenance_cost_per_kw || 0;
                    this.maintenanceCostUnit = 'relative';
                }
                else {
                    this.financingDetailsForm.maintenance_cost = this.financialsParameters[0].absolute_maintenance_cost;
                    this.maintenanceCostUnit = 'absolute';
                }
            } else {
                //to reset all the keys when the new form option is used
                this.financingDetailsForm.price = null;
                this.financingDetailsForm.tax = 8.9;
                this.financingDetailsForm.expected_life_years = 25;
                this.financingDetailsForm.discount_rate = 6.25;
                this.financingDetailsForm.subsidy = 0;
                this.financingDetailsForm.maintenance_cost = 0;
                this.financingDetailsForm.ad_percentage = 0;
                this.financingDetailsForm.ad_years = 0;
                this.financingDetailsForm.ad_tax_slab = 0;
                this.priceUnit = "relative";
                this.subsidyUnit = "relative";
                this.maintenanceCostUnit = 'relative';
            }
        },
    },
};
</script>

<style type="text/css" scoped>
#designFinancialEditDialog >>> .el-input-group__append {
  width: 55px;
  padding: 0 10px 0 10px;
  background-color: #eaebed;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
}

/*arrow in select*/
#designFinancialEditDialog >>> .el-select .el-input .el-select__caret {
  font-size: 9px;
  color: #606266;
}

#designFinancialEditDialog >>> .el-input__suffix {
  top: 1px;
  right: -7px;
}
/*/different box for the select dropdown*/
.unitSelector >>> .el-input-group__append {
  color: #606266 !important;
  background-color: white !important;
}

/*alignment of content inside the select in box*/
.unitSelector >>> .el-input-group__append,
div .el-select >>> .el-input__inner {
  padding: 0;
  text-align: center;
}

.unitSelector >>> .el-select {
    margin: -10px -10px;
}

#designFinancialEditDialog .el-table .cell {
  word-break: break-word;
}

.scroll-area {
  width: 100%;
  height: 55vh;
}

.el-form {
  width: calc(100% - 12px) !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#designFinancialEditDialog >>> .el-select-dropdown {
  position: absolute !important;
  right: 0px !important;
  left: auto !important;
}

#designFinancialEditDialog >>> .el-popper .popper__arrow {
  display: none;
}

#designFinancialEditDialog >>> .el-select-dropdown__item {
  padding: 0;
  text-align: center;
}

#designFinancialEditDialog >>> .el-select-dropdown {
  width: 75px;
  min-width: 0px !important;
}

.el-form::-webkit-scrollbar {
  width: 0 !important;
}

.el-button {
  padding: 7px 15px;
  font-size: 12px;
}

#designFinancialEditDialog >>> .el-input--mini .el-input__inner {
    height: 28px;
}

#designFinancialEditDialog >>> .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
}

#designFinancialEditDialog >>> .el-dialog__title{

     font-weight: 550;
     margin-left: 0px;
      color: #222222 !important;
}

#designFinancialEditDialog >>> .el-dialog{

     border-radius: 12px;
}

#designFinancialEditDialog >>> .el-dialog__close {
        color: #222222 !important;
}

#designFinancialEditDialog >>> .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       /* height: 40px  !important; */ 
    }
#designFinancialEditDialog >>> .el-dialog__footer{

    text-align: center;
}

</style>

<style lang="scss" scoped>
@import "../../../../styles/components/forms";
@import "../../../../styles/components/button";
</style>
