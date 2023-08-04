<template>
  <div class="table_container">
    <div class="tbl_form">
      <div class="col_row">
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.irradiance.soiling"
              v-validate="soilingLossValidation"
						  name="Soiling Loss"
            />
            <p class="formErrors"><span>{{ errors.first('Soiling Loss') }}</span></p>
            <label class="losses">Soiling Loss </label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.dc.mismatch"
              v-validate="mismatchLossValidation"
						  name="Mismatch Loss"
            />
            <p class="formErrors"><span>{{ errors.first('Mismatch Loss') }}</span></p>
            <label class="losses">Mismatch Loss</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.dc.lid"
              v-validate="lidLossValidation"
						  name="LID Loss"
            />
            <p class="formErrors"><span>{{ errors.first('LID Loss') }}</span></p>
            <label class="losses">LID Loss</label>
          </div>
        </div>
      </div>
      <div class="col_row">
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.dc.dc_ohmic"
              v-validate="dcOhmicLossValidation"
						  name="DC Ohmic Loss"
            />
            <p class="formErrors"><span>{{ errors.first('DC Ohmic Loss') }}</span></p>
            <label class="losses">DC Ohmic Loss</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.ac.ac_ohmic"
              v-validate="acOhmicLossValidation"
						  name="AC Ohmic Loss"
            />
            <p class="formErrors"><span>{{ errors.first('AC Ohmic Loss') }}</span></p>
            <label class="losses">AC Ohmic Loss</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.ac.unavailability"
              v-validate="UnavailabilityLossValidation"
						  name="System Availability"
            />
            <p class="formErrors"><span>{{ errors.first('System Availability') }}</span></p>
            <label class="losses">System Availability</label>
          </div>
        </div>
      </div>
      <div class="col_row">
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number" 
              v-model.number="profileData.constant_losses.module_degradation_rate"
              v-validate="moduleDegradationValidation"
              name="Module Degradation Rate"
            />
            <p class="formErrors"><span>{{ errors.first('Module Degradation Rate') }}</span></p>
            <label class="losses">Module Degradation Rate</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="profileData.constant_losses.inverter_efficiency"
              v-validate="inverterEfficiencyLossValidation"
						  name="Inverter Efficiency"
            />
            <p class="formErrors"><span>{{ errors.first('Inverter Efficiency') }}</span></p>
            <label class="losses">Inverter Efficiency</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'lossesSettingsForm',
        props: ['profileData', 'profileData.constant_losses'],
        data() {
            return {
                msg: 'I am in lossesSettingsForm',
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
    };

</script>

<style scoped>
.formErrors{
  color: #ff0000;
  font-size: 12px;
  margin-top: 8px;
}
.losses {
  font-size:14px !important;
  color: #222 !important;
}

.floating-input{
  height: 48px !important;
  color: #222 !important;
  font-size: 16px !important;
}

.floating-input::placeholder{
  color: #222 !important;
}
</style>