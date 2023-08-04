<template>
    <div id="lossesSettingsForm">

        <VuePerfectScrollbar class="scroll-area">

		<p class="formHeadings"> Losses </p>
        <p>{{dummyVariable}}</p>

		<el-form :model="profileData.constant_losses" size="mini" label-position="left" label-width="250px">
			<el-form-item label="Soiling Loss">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.irradiance.soiling"
						v-validate="soilingLossValidation"
						name="Soiling Loss"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('Soiling Loss') }}</span></p>
			</el-form-item>

			<el-form-item label="Mismatch Loss">
				<input
						autocomplete="off"
						class="inputBoxStyler"						
						v-model.number="profileData.constant_losses.dc.mismatch"
						v-validate="mismatchLossValidation"
						name="Mismatch Loss"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('Mismatch Loss') }}</span></p>
			</el-form-item>

            <el-form-item label="LID Loss">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.dc.lid"
						v-validate="lidLossValidation"
						name="LID Loss"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('LID Loss') }}</span></p>
			</el-form-item>

			<el-form-item label="DC Ohmic Loss">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.dc.dc_ohmic"
						v-validate="dcOhmicLossValidation"
						name="DC Ohmic Loss"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('DC Ohmic Loss') }}</span></p>
			</el-form-item>

			<el-form-item label="AC Ohmic Loss">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.ac.ac_ohmic"
						v-validate="acOhmicLossValidation"
						name="AC Ohmic Loss"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('AC Ohmic Loss') }}</span></p>
			</el-form-item>

			<el-form-item label="System Availability">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.ac.unavailability"
						v-validate="UnavailabilityLossValidation"
						name="System Availability"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('System Availability') }}</span></p>
			</el-form-item>

            <el-form-item label="Module Degradation Rate">
				<input
                    autocomplete="off"
                    class="inputBoxStyler"
                    v-model.number="profileData.constant_losses.module_degradation_rate"
                    v-validate="moduleDegradationValidation"
                    name="Module Degradation Rate"
                    type="number"
                    step="any">
				
				<p class="formErrors"><span>{{ errors.first('Module Degradation Rate') }}</span></p>
			</el-form-item>


			<el-form-item label="Inverter Efficiency">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.inverter_efficiency"
						v-validate="inverterEfficiencyLossValidation"
						name="Inverter Efficiency"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('Inverter Efficiency') }}</span></p>
			</el-form-item>
             <!-- TODO: Remove derating factor and add something else later -->
            <el-form-item label="Derating factor" v-if="false">
				<input
						autocomplete="off"
						class="inputBoxStyler"
						v-model.number="profileData.constant_losses.derating_factor"
						v-validate="inverterEfficiencyLossValidation"
						name="Derating factor"
						type="number"
						step="any">
				
				<p class="formErrors"><span>{{ errors.first('Derating factor') }}</span></p>
			</el-form-item>

		</el-form>
    </VuePerfectScrollbar>
	</div>
</template>

<script>

    import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

    export default {
        name: 'lossesSettingsForm',
        props: ['profileData', 'profileData.constant_losses'],
        components: {
            VuePerfectScrollbar,
        },
        data() {
            return {
                msg: 'I am in lossesSettingsForm',
                dummyVariable: '',
                losses: {
                    shading: 1,
                    iam: 1.5,
                    soiling: 2,
                    irradiance: 3,
                    temperature: 5,
                    mismatch: 1.5,
                    DCOhmicLoss: 1,
                    ACOhmicLoss: 1,
                    unavability: 0,
                    inverterEfficiencyLoss: 96,
				},
				lidLossValidation: {
					required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
				},
                shadingLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, iamLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, soilingLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, irradianceLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, temperatureLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, mismatchLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, dcOhmicLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, acOhmicLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, UnavailabilityLossValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 99.9,
                    },
                    decimal: 2
                }, inverterEfficiencyLossValidation: {
                    required: true,
                    between: {
                        min: 0.1,
                        max: 99.9,
                    },
                    decimal: 2
                }, solarAccessThresholdValidation: {
                    required: true,
                    between: {
                        min: 0,
                        max: 100,
                    },
                    decimal: 2
                },
                moduleDegradationValidation: {
                    required: true,
                    between: {
                        min: 0.01,
                        max: 100
                    },
                    decimal: 2
                }
            };
        },

        methods: {},
        mounted () {
            this.dummyVariable = " ";
        },
    };

</script>

<style type="text/css">

    #lossesSettingsForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }

    .el-form-item__content .inputBoxStyler {
        -webkit-appearance: none;
        background-color: #FFFFFF;
        background-image: none;
        border-radius: 4px;
        border: 2px solid #DCDFE6;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #606266;
        display: inline-block;
        font-size: inherit;
        height: 28px;
        line-height: 28px;
        outline: none;
        padding: 0 15px;
        -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        width: 90%;
        font-size: 12px;
    }

    .el-form-item__content .inputBoxStyler:hover {
        border-color: #C0C4CC
    }

    .el-form-item__content .customInputBoxStylerAPP { 
        width: 100% !important;
    }

    .el-form-item__content .inputBoxStyler:focus {
        outline: none;
        border-color: #409EFF
    }
    /*
        .formHeadings {

            color: #606266;
            font-size: 14px;
            text-align: left;
            padding-bottom: 10px;
            font-weight: 600;

        }

        #designSettings .el-input {

            max-width: 200px;
        }

        .el-dialog__body {

            padding: 10px !important;

        }*/


    /*.el-form {*/

    /*width: 500px;*/
    /*		height: 100px;
            overflow: scroll;
            font-size: 6px !important;
            background-color: white;*/
    /*border-style: 1px solid black;*/
    /*border-radius: 5px;*/
    /*
        }

        .el-popover .el-popper {

            /*height: 500px !important;*/
    /*overflow: scroll;*/

    /*}*/

    /*.el-form-item {

        margin-bottom: 10px !important;
    }*/

</style>
