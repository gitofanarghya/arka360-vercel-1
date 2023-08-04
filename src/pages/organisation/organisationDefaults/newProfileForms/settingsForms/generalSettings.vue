<template>
    <div id="generalsettingsForm">

        <VuePerfectScrollbar class="scroll-area">

            <el-form :model="profileData" size="mini" label-position="left" label-width="250px">
                <el-form-item label="Solar Access Threshold">
                    <input
                            autocomplete="off"
                            class="inputBoxStyler"
                            v-model.number="profileData.default_solar_access_threshold"
                            v-validate="solarAccessThresholdValidation"
                            name="Solar Access Threshold"
                            type="number"
                            step="any">
                    <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p>
                </el-form-item>
                <el-form-item v-if="!isVipPowerGazebo" label="Show Structures" style="position: relative">
                    <el-switch
                            v-model="profileData.drawing_defaults.structures.visible"
                            style="margin-right: 5px; float: left">
                    </el-switch>
                    <span style="font-size: 10px; position: absolute; top: -10px"><i> &#42; Beta</i></span>
                </el-form-item>
                <el-form-item label="High Resolution Shadows" style="position: relative">
                    <el-switch
                            v-model="profileData.shadows.high_resolution_shadows"
                            style="margin-right: 5px; float: left">
                    </el-switch>
                </el-form-item>
                <el-form-item label="Rooftop Texture" style="position: relative">
                    <el-switch
                            v-model="profileData.drawing_defaults.texture"
                            style="margin-right: 5px; float: left"
                            >
                    </el-switch>
                </el-form-item>
                <el-form-item v-if="!isVipPowerGazebo" 
                    label="Turn Modules black for Mono-Crystalline Modules" 
                    style="position: relative;word-break: break-word; max-width: 200px; white-space: normal;">
                    <el-switch
                            v-model="profileData.drawing_defaults.monocrystallinepanels"
                            style="margin-right: 5px; float: left"
                            >
                    </el-switch>
                </el-form-item>
                <!-- <el-form-item label="Structure Template">
                    <el-select
                        v-model="profileData.drawing_defaults.structures.template"
                        class="tiltAligner"
                    >
                        <el-option label="Default Fixed Tilt" value="Default Fixed Tilt"></el-option>
                        <el-option label="Pergola" value="Pergola"></el-option>
                        <el-option label="Low Foundation Fixed Tilt" value="Low Foundation Fixed Tilt"></el-option>
                        <el-option label="TPSSL 4MMS 1 Leg" value="Four MMS One Leg"></el-option>
                        <el-option label="TPSSL 4MMS 2 Leg" value="Four MMS Two Leg"></el-option>
                        <el-option label="TPSSL Ballast type 1" value="Ballast Type 1"></el-option>
                        <el-option label="TPSSL Ballast type 2" value="Ballast Type 2"></el-option>
                        <el-option label="TPSSL Ballast type 3" value="Ballast Type 3"></el-option>
                        <el-option label="General Ballast" value="General Ballast"></el-option>
                        <el-option label="UNIRAC RM 5" value="UNIRAC RM 5"></el-option>
                        <el-option label="UNIRAC RM 10" value="UNIRAC RM 10"></el-option>
                        <el-option label="TPSSL Ground Mount MMS" value="Ground Mount MMS"></el-option>
                        <el-option label="TPSSL Elevated MMS" value="Elevated MMS"></el-option>
                    </el-select>
                </el-form-item> -->

                <p class="formHeadings"> Time consideration for Row Spacing ( Solar Time )</p>
                <p>{{dummyVariable}}</p>

                <el-form-item label="Start time">
                    <el-time-picker
                            value-format="HH:mm:ss"
                            format="HH:mm"
                            v-model="profileData.start_time_auto_row_spacing"
                            v-validate="rowSpacingStartTimeValidation"
                            name="Start Time">
                    </el-time-picker>
                    <p
                        v-if="profileType === designVersionSettings"
                        class="solarClockOffset">
                        {{ startSolarLocalTime }}
                    </p>
                    <p class="formErrors"><span>{{ errors.first('Start Time') }}</span></p>
                </el-form-item>

                <el-form-item label="End time">
                    <el-time-picker
                            value-format="HH:mm:ss"
                            format="HH:mm"
                            v-model="profileData.end_time_auto_row_spacing"
                            v-validate="rowSpacingEndTimeValidation"
                            name="End Time">
                    </el-time-picker>
                    <p
                        v-if="profileType === designVersionSettings"
                        class="solarClockOffset">
                        {{ endSolarLocalTime }}
                    </p>
                    <p class="formErrors"><span>{{ errors.first('End Time') }}</span></p>
                </el-form-item>

                <p class="formHeadings"> Measurement Units </p>

                <el-form-item
                    label="Distance unit">
                    <el-radio-group
                        v-model="profileData.distance_unit"
                        @change="syncMeasurementUnitComponentState">
                        <el-radio label="meters">Meters</el-radio>
                        <el-radio label="feet">Feets &amp; Inches</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="Wiring unit">
                    <el-radio-group
                        v-model="profileData.wiring_unit"
                        @change="syncWiringUnitComponentState">
                        <el-radio label="awg">AWG</el-radio>
                        <el-radio label="mmsq">Sq.mm</el-radio>
                    </el-radio-group>
                    <!-- <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p> -->
                </el-form-item>

                <p class="formHeadings"> Time consideration for Irradiance Map</p>

                <el-form-item label="Start date Irradiance map">
                    <el-date-picker
                            v-model="profileData.start_date_heatmap"
                            type="date"
                            disabled
                            format="dd MMMM"
                            value-foramt="yyyy-mm-dd">
                    </el-date-picker>
                    <!-- <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p> -->
                </el-form-item>

                <el-form-item label="End date Irradiance map">
                    <el-date-picker
                            v-model="profileData.end_date_heatmap"
                            type="date"
                            disabled
                            format="dd MMMM"
                            value-foramt="yyyy-mm-dd">
                    </el-date-picker>
                    <!-- <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p> -->
                </el-form-item>

                <el-form-item label="Start time Irradiance map">
                    <el-input v-model="profileData.start_time_heatmap" name="Start time heatmap" :disabled="true">
                    </el-input>
                    <!-- <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p> -->
                </el-form-item>

                <el-form-item label="End time Irradiance map">
                    <el-input v-model="profileData.end_time_heatmap" name="End time heatmap" :disabled="true">
                    </el-input>
                    <!-- <p class="formErrors"><span>{{ errors.first('Solar Access Threshold') }}</span></p> -->
                </el-form-item>

            </el-form>
        </VuePerfectScrollbar>
    </div>
</template>

<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import { getSolarNoon } from '../../../../../core/utils/subarrayUtils';
import { mapState, mapActions } from 'pinia';
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';
import { useDesignStore } from '../../../../../stores/design';

export default {
    name: 'generalSettingsForm',
    props: ['profileData', 'profileType'],
    components: {
        VuePerfectScrollbar,
    },
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
        syncMeasurementUnitComponentState(selectedUnit) {
            this.SET_DISTANCE_UNIT(selectedUnit);
        },
        syncWiringUnitComponentState(selectedUnit) {
            this.SET_WIRING_UNIT(selectedUnit);
        },
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        }
    },
};

</script>

<style type="text/css">

    #generalsettingsForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }

    /*for aligning tilt dropdown*/
    #generalsettingsForm .tiltAligner .el-select-dropdown {
        width: 90% !important;
        min-width: 0 !important;
    }

    /*for making the dropdown work in the dialog box*/
    #generalsettingsForm .el-select-dropdown {
        position: absolute !important;
        right: 10% !important;
        left: auto !important;
        font-family: Helvetica-Neue !important;
    }

    .solarClockOffset {
        font-size: 12px;
        font-style: italic;
        color: grey;
    }

</style>
