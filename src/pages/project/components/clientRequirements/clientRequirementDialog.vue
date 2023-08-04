<template>
    <div id="clientRequirementDialog">
        <el-dialog
            :visible="isConsumptionFormVisible"
            :close-on-click-modal="false"
            title="Consumption Details"
            width="50%"
            @open="assignConsumptionFormValues"
            @close="onCancelConsumptionForm">
            <el-form
                ref="consumptionDetails"
                :model="consumptionDetails"
                size="mini"
                label-position="left"
                label-width="200px">
                <p class="formHeadings" >Edit Consumption</p>

                <el-form-item label="Metering Type">
                    <el-radio-group v-model="consumptionDetails.meteringType">
                        <el-radio :label="METERING_TYPES.NET_METERING"/>
                        <el-radio :label="METERING_TYPES.GROSS_METERING"/>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="Average monthly unit consumption">
                    <el-input
                    type="number"
                        v-validate="averageMonthlyConsumptionValidation"
                        v-model="consumptionDetails.averageMonthlyConsumption"
                        name="Average monthly unit consumption">
                        <template slot="append">kWhr</template>
                    </el-input>
                    <p class="formErrors">
                        <span>
                            {{ errors.first('Average monthly unit consumption') }}
                        </span>
                    </p>
                </el-form-item>
                <!-- two fields as v-validate name doesn't work dynamically -->
                <el-form-item
                    v-show="isGrossMeteringEnable"
                    label="Average import unit price">
                    <el-input
                        type="number"
                        v-validate="averagePriceValidation"
                        v-model="consumptionDetails.averageUnitPrice"
                        name="Average import unit price">
                        <template slot="append">{{currencySymbol}}/kWhr</template>
                    </el-input>
                    <p class="formErrors">
                        <span>{{ errors.first('Average import unit price') }}</span>
                    </p>
                </el-form-item>

                <el-form-item
                    v-show="!isGrossMeteringEnable"
                    label="Price/kWh">
                    <el-input
                        type="number"
                        v-validate="averagePriceValidation"
                        v-model="consumptionDetails.averageUnitPrice"
                        name="Price/kWh">
                        <template slot="append">{{ currencySymbol }}/kWhr</template>
                    </el-input>
                    <p class="formErrors">
                        <span>{{ errors.first('Price/kWh') }}</span>
                    </p>
                </el-form-item>

                <el-form-item
                    v-show="isGrossMeteringEnable"
                    label="Average export unit price">
                    <el-input
                        type="number"
                        v-validate="averageExportPriceValidation"
                        v-model="consumptionDetails.averageExportPrice"
                        name="Average export unit price">
                        <template slot="append">{{currencySymbol}}/kWhr</template>
                    </el-input>
                    <p class="formErrors">
                        <span>
                            {{ errors.first('Average export unit price') }}
                        </span>
                    </p>
                </el-form-item>

                <el-form-item label="Tariff escalation rate">
                    <el-input
                        type="number"
                        v-validate="tariffValidation"
                        v-model="consumptionDetails.tariffEscalationRate"
                        name="Tariff escalation rate">
                        <template slot="append">%</template>
                    </el-input>
                    <p class="formErrors">
                        <span>{{ errors.first('Tariff escalation rate') }}</span>
                    </p>
                </el-form-item>
            </el-form>

            <span slot="footer">
                <!-- <button
                    class="button-cancel"
                    @click="onCancelConsumptionForm()">
                    Cancel
                </button> -->
                <button
                    :disabled="errors.items.length > 0"
                    class="button-confirm"
                    @click="onConfirmConsumptionForm()">
                    Confirm
                </button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import { METERING_TYPES } from '@/pages/constants';
import { mapActions, mapState } from 'pinia';
import { useProjectStore } from '../../../../stores/project';

export default {
    name: 'ClientRequirementDialog',
    props: {
        isConsumptionFormVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            averageMonthlyConsumptionValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            averagePriceValidation: {
                required: true,
                min_value: 0,
                decimal: 4, 
            },
            tariffValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            averageExportPriceValidation: {
                required: true,
                min_value: 0,
                decimal: 2,
            },
            consumptionDetails: {
                meteringType: '',
                averageMonthlyConsumption: '',
                averageUnitPrice: '',
                averageExportPrice: '',
                tariffEscalationRate: '',
                sanctionedLoad: '',
                tariffRate: '',
                tariffProfile: '',
                monthlyBill: [],
                monthlyUnits: [],
            },
        };
    },
    nonReactiveData() {
        return {
            METERING_TYPES,
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
            currencySymbol: 'GET_CURRENCY_SYMBOL',
        }),
        isGrossMeteringEnable() {
            return this.consumptionDetails.meteringType === this.METERING_TYPES.GROSS_METERING;
        },
    },
    methods: {
        ...mapActions(useProjectStore, [
            'UPDATE_PROJECT_CONSUMPTION_DETAILS',
        ]),
        assignConsumptionFormValues() {
            // assigning the values of the consumption to the form when it opens
            this.consumptionDetails.averageMonthlyConsumption =
            this.consumption.averageMonthlyConsumption;
            this.consumptionDetails.meteringType =
            this.consumption.metering_type;
            this.consumptionDetails.averageExportPrice = this.consumption.average_export_price_per_unit;
            this.consumptionDetails.tariffEscalationRate = this.consumption.tariff_escalation_rate;
            this.consumptionDetails.averageUnitPrice = this.consumption.average_price_per_unit;
        },
        onCancelConsumptionForm() {
            this.$emit('update:isConsumptionFormVisible', false);
        },
        async onConfirmConsumptionForm() {
            const monthlyUnitsArray =
            Array(12).fill(this.consumptionDetails.averageMonthlyConsumption);
            const postData = {
                average_price_per_unit: this.consumptionDetails.averageUnitPrice,
                monthly_units: monthlyUnitsArray,
                tariff_escalation_rate: this.consumptionDetails.tariffEscalationRate,
                average_export_price_per_unit: this.consumptionDetails.averageExportPrice,
                metering_type: this.consumptionDetails.meteringType,
            };
            await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(postData);
            this.$emit('update:isConsumptionFormVisible', false);
        },

       
    },
};
</script>

<style type="text/css" scoped>
    .heading_ {
        font-size: 1.5vw;
        margin: 3% 0 2% 0;
    }

    .heading2_ {
        font-size: 1.3vw;
        margin: 0 20px 0 0;
    }

    #clientRequirementDialog >>> .el-form-item__label {
    word-break: break-word;
    }

    #clientRequirementDialog >>> .el-input-group__append {
        width: 45px;
        padding: 0 10px 0 10px;
        background-color: #eaebed;
        color: rgba(0, 0, 0, 0.6);
        text-align: center;
    }


    #clientRequirementDialog  >>> .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
        }


        #clientRequirementDialog >>> .el-dialog__title{
        font-weight: 550;
        color: #222222 !important;
        margin-left: 0px  !important;
        }

           #clientRequirementDialog  >>> .el-dialog__close {
        color: #222222 !important;
        }

       #clientRequirementDialog  >>> .el-dialog {
        border-radius: 12px;
        width: 50%  !important;

        
    }

    @media (max-width: 674px) {

           #clientRequirementDialog  >>> .el-dialog {
              width: 90%  !important; 
          }
    }

     @media (max-width: 376px) {

           #clientRequirementDialog  >>> .el-dialog {
              width: 98%  !important; 
          }
    }

     #clientRequirementDialog  >>> .el-dialog__footer {
        text-align: center !important;
        
    }


        #clientRequirementDialog  >>>    .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       padding: 9px 2px !important;
       width: 20%  !important;
       /* height: 40px  !important; */
       }

       




</style>

<style lang="scss" scoped>

    @import '../../../../styles/components/button';
    @import '../../../../styles/components/forms';

</style>
