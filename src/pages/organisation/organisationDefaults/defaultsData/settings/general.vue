<template>
    <div id="settingsGeneralDefaults">
        <div>
            <div>
                <p class="headings"> Solar Access Threshold </p>
                <p class="data"> {{ profileData.default_solar_access_threshold }} </p>
            </div>

            <div class="dataSwitches">
                <p class="headings"> Show Structures </p>
                <el-switch
                        class="input"
                        v-model="profileData['drawing_defaults']['structures']['visible']"
                        active-color="#13ce66"
                        inactive-color="#999999"
                        disabled>
                </el-switch>
            </div>
            <div class="dataSwitches">
                <p class="headings"> High Resolution Shadows </p>
                <el-switch
                    v-model="profileData['shadows']['high_resolution_shadows']"
                    class="input"
                    active-color="#13ce66"
                    inactive-color="#999999"
                    disabled/>
            </div>
            <!-- for old profiles with no value showing Default -->
            <!-- <div>
                <p class="headings"> Structure Template </p>
                <p class="data"> {{ profileData['drawing_defaults']['structures']['template'] }} </p>
            </div> -->

            <p class="formHeadings"> Time consideration for Row Spacing (Solar Time)</p>

            <div>
                <p class="headings"> Start Time </p>
                <p class="data"> {{ profileData.start_time_auto_row_spacing }} </p>
            </div>

            <div>
                <p class="headings"> End Time </p>
                <p class="data"> {{ profileData.end_time_auto_row_spacing }} </p>
            </div>

            <p class="formHeadings"> Measurement Units </p>

            <div>
                <p class="headings"> Wiring unit </p>
                <p class="data"> {{ profileData.wiring_unit }} </p>
            </div>

            <div>
                <p class="headings"> Distance unit </p>
                <p class="data"> {{ profileData.distance_unit }} </p>
            </div>

            <p class="formHeadings"> Time consideration for Irradiance map</p>

            <div>
                <p class="headings"> Start date Irradiance map</p>
                <!--<p class="data"> {{ profileData.start_date_heatmap }} </p>-->
                <p class="data"> 1st January </p>
            </div>

            <div>
                <p class="headings"> End date Irradiance map </p>
                <!--<p class="data"> {{ profileData.end_date_heatmap }} </p>-->
                <p class="data"> 31st December </p>
            </div>

            <div>
                <p class="headings"> Start time Irradiance map </p>
                <p class="data"> {{ profileData.start_time_heatmap }} </p>
            </div>

            <div>
                <p class="headings"> End time Irradiance map </p>
                <p class="data"> {{ profileData.end_time_heatmap }} </p>
            </div>
        </div>



    </div>
</template>

<script>

    export default {
        name: 'settingsGeneralDefaults',
        props: ['profileData'],

        data() {
            return {
                msg: ' I am in settingsGeneralDefaults',
            }
        },
    }

</script>

<style type="text/css">

    #settingsGeneralDefaults .formHeadings {

        color: #606266;
        font-size: 15px;
        text-align: left;
        padding-bottom: 10px;
        padding-top: 0px;
        font-weight: 600;
    }

</style>

