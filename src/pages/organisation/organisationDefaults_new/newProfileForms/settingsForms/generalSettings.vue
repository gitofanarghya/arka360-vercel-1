<template>
  <div class="table_container">
    <div class="tbl_form">
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="floating-label">
              <input 
                class="floating-input" 
                type="number"
                v-model.number="profileData.default_solar_access_threshold"
                v-validate="solarAccessThresholdValidation"
                name="Solar Access Threshold"
              />
              <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p>
              <label class="general">Solar Access Threshold </label>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails" v-if="!isVipPowerGazebo">
              <div class="item_label">Show Structures <span class="chip">BETA</span></div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input 
                    type="checkbox" 
                    class="checkbox" 
                    v-model="profileData.drawing_defaults.structures.visible"
                  >
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">High Resolution Shadows</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input 
                    type="checkbox" 
                    class="checkbox"
                    v-model="profileData.shadows.high_resolution_shadows"
                  >
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
           <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Rooftop Texture</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input 
                    type="checkbox" 
                    class="checkbox"
                    v-model="profileData.drawing_defaults.texture"
                  >
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
           <div class="col col_3">
            <div class="item_ditails" v-if="!isVipPowerGazebo">
              <div class="item_label">Turn Modules black for Mono-Crystalline Modules</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input 
                    type="checkbox" 
                    class="checkbox"
                    v-model="profileData.drawing_defaults.monocrystallinepanels"
                  >
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5 class="general">Time consideration for Row Spacing (Solar Time)</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="floating-label">
              <input 
                class="floating-input" 
                type="time" 
                v-model="profileData.start_time_auto_row_spacing"
                v-validate="rowSpacingStartTimeValidation"
                name="Start Time"
               
              />
              <p class="formErrors"><span>{{ errors.first('Start Time') }}</span></p>
              <label class="general">Start Time</label>
              <!-- <i class="fas fa-clock"></i> -->
            </div>
          </div>
          <div class="col col_3">
            <div class="floating-label">
              <input 
                class="floating-input" 
                type="time"
                v-model="profileData.end_time_auto_row_spacing"
                v-validate="rowSpacingEndTimeValidation"
                name="End Time"
                
              />
              <p class="formErrors"><span>{{ errors.first('End Time') }}</span></p>
              <label class="general">End Time</label>
              <!-- <i class="fas fa-clock"></i> -->
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5 class="general">Measurement Units</h5>
        <div class="col_row">
          <div class="col col_3"> 
            <div class="item_label">Distance Unit</div>
            <div class="normal_radio">
              <input 
                id="radio1" 
                type="radio" 
                name="distance"
                value="meters"
                v-model="profileData.distance_unit"
                @change="syncMeasurementUnitComponentState(profileData.distance_unit)"
              />
              <label for="radio1" class="general">Meters</label>
            </div>
            <div class="normal_radio">
              <input
                id="radio2"
                type="radio" 
                name="distance"
                value="feet"
                v-model="profileData.distance_unit"
                @change="syncMeasurementUnitComponentState(profileData.distance_unit)"/>
              <label for="radio2" class="general">Feets &amp; Inches</label>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_label">Wiring Unit</div>
            <div class="normal_radio">
              <input 
                type="radio" 
                id="radio3" 
                name="wriing"
                value="awg"
                v-model="profileData.wiring_unit"
                @change="syncWiringUnitComponentState"
              />
              <label for="radio3" class="general">AWG</label>
            </div>
            <div class="normal_radio">
              <input 
                type="radio" 
                id="radio4" 
                name="wriing"
                value="mmsq"
                @change="syncWiringUnitComponentState"
                v-model="profileData.wiring_unit"
              />
              <label for="radio4" class="general">Sq.mm</label>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5 class="general">Time consideration for Irradiance map</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="block">
    <span class="heatmap">Irradiance map Start Date</span>
    <el-date-picker
      v-model="profileData.start_date_heatmap"
     type="date" 
     :disabled=true
      format="dd MMMM"
      value-format="yyyy-MM-dd"
      >
    </el-date-picker>
  </div>
          </div>
          <div class="col col_3">
                    <div class="block">
    <span class="heatmap">Irradiance map End Date</span>
    <el-date-picker
      v-model="profileData.end_date_heatmap"
      type="date"
      :disabled=true
      format="dd MMMM"
      value-format="yyyy-MM-dd"
      >
    </el-date-picker>
  </div>
          </div>
        </div>
        <div class="col_row">
          <div class="col col_3">
            <div class="floating-label">
              <input 
                class="floating-input" 
                type="text"
                v-model="profileData.start_time_heatmap"
                disabled
              />
              <label class="general">Heatmap Start Time</label>
              <!-- <i class="fas fa-clock"></i> -->
            </div>
          </div>
          <div class="col col_3">
            <div class="floating-label">
              <input 
                class="floating-input" 
                type="time"
                v-model="profileData.end_time_heatmap"
                disabled
              />
              <label class="general">Heatmap End Time</label>
              <!-- <i class="fas fa-clock"></i> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';
import { getSolarNoon } from '../../../../../core/utils/subarrayUtils';
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../../../stores/design';

export default {
    name: 'generalSettingsForm',
    props: ['profileData', 'profileType'],
    data() {
        return {
            msg: 'I am in generalSettings',
            dummyVariable: '',
            formLabelWidth: '120px',
            profileDataData: {
                solarTime: {
                    startTime: 'Fri Mar 15 2019 ' + '09:00:00 GMT+0530 (IST)',
                    endTime: 'Fri Mar 15 2019 ' + '15:00:00 GMT+0530 (IST)'
                },
                solarAccessThreshold: 92
            },
            solarAccessThresholdValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 100,
                },
                decimal: 2
            },
            rowSpacingEndTimeValidation: {
                required: true,
            },
            rowSpacingStartTimeValidation: {
                required: true,
            },
            designVersionSettings: 'designVersionSettings',
            formatterString: "HH':'mm ' GMT'ZZ '('ZZZZZ')'",
            isVipPowerGazebo: false,
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            latitude: state => state.project.latitude,
            longitude: state => state.project.longitude,
        }),
        zoneIANA() {
            return tzLookup(this.latitude, this.longitude);
        },
        consideredDate() {
            return (DateTime.fromObject({
                year: 2019,
                month: 12,
                day: 21,
                hour: 12,
            }, {
                zone: this.zoneIANA,
            }));
        },
        solarNoon() {
            return getSolarNoon(this.latitude, this.longitude, this.consideredDate);
        },
        diffSolarAndClockNoon() {
            return this.solarNoon.getTime() - this.consideredDate;
        },
        startSolarLocalTime() {
            if (this.profileData.start_time_auto_row_spacing !== null) {
                const hourAndMinute = this.profileData.start_time_auto_row_spacing.split(':');
                const startSolarNoon = (DateTime.fromObject({
                    year: 2019,
                    month: 12,
                    day: 21,
                    hour: parseInt(hourAndMinute[0], 10),
                    minute: parseInt(hourAndMinute[1], 10),
                }, {
                    zone: this.zoneIANA,
                })).valueOf() + this.diffSolarAndClockNoon;
                const startDateLocal = DateTime.fromMillis(startSolarNoon, { zone: this.zoneIANA });
                return startDateLocal.toFormat(this.formatterString);
            }
            return '';
        },
        endSolarLocalTime() {
            if (this.profileData.end_time_auto_row_spacing !== null) {
                const hourAndMinute = this.profileData.end_time_auto_row_spacing.split(':');
                const endSolarNoon = (DateTime.fromObject({
                    year: 2019,
                    month: 12,
                    day: 21,
                    hour: parseInt(hourAndMinute[0], 10),
                    minute: parseInt(hourAndMinute[1], 10),
                }, {
                    zone: this.zoneIANA,
                })).valueOf() + this.diffSolarAndClockNoon;
                const endDateLocal = DateTime.fromMillis(endSolarNoon, { zone: this.zoneIANA });
                return endDateLocal.toFormat(this.formatterString);
            }
            return '';
        },
    },
    async mounted() {
      this.isVipPowerGazebo = await this.setGazeboStatus();
        this.dummyVariable = '';
    },
    methods: {
        ...mapActions(useDesignStore, [
            'SET_DISTANCE_UNIT',
            'SET_WIRING_UNIT',
        ]),
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        },
         syncMeasurementUnitComponentState(selectedUnit) {
            this.SET_DISTANCE_UNIT(selectedUnit);
        },
        syncWiringUnitComponentState(selectedUnit) {
            this.SET_WIRING_UNIT(selectedUnit);
    },
    },
};

</script>

<style scoped>
.formErrors{
  color: #ff0000;
  font-size: 12px;
  margin-top: 8px;
}

.profile_data .item_label{
  font-size: 14px !important;
  color: #222 !important;

}

.tbl_form .item_ditails .item_label{
  font-size: 14px !important;
  margin-bottom: 15px;
  color: #222 !important;
}

.tbl_form .item_ditails{
  padding: 2px 0px !important;
}
.table_container >>> .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100% !important;
}

.table_container >>> .el-input.is-disabled .el-input__inner {   
    border: none !important;
    background-color: #e8edf2;
    border-color: #e4e7ed;
    color: #222;
}

.floating-label .general{
  font-size: 14px;
  color: #222;
}
.item_label{
  font-size:16px;
}.profile_data h5 {
    color: var(--primary);
    font-size: 16px;
    padding-top: 8px;
}
.table_container .heatmap {
    font-size: 14px !important;
    color: #222 !important;
    line-height: 1.5 !important;
}
.normal_radio [type="radio"]:checked+label {
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    font-size: 16px;
    display: inline-block;
    color: #222;
}
.normal_radio [type="radio"]:not(:checked)+label {
    position: relative;
    padding-left: 28px;
    cursor: pointer;
    font-size: 16px;
    display: inline-block;
    color: #222;
}
html input[disabled] {
    cursor: not-allowed;
}

.floating-input{
  height: 48px !important;
  font-size: 16px !important;
  color: #222 !important;
}

.floating-input::placeholder{
  color: #222 !important;
}

.table_container >>> .el-input__prefix{
  color: #222 !important;
}
</style>