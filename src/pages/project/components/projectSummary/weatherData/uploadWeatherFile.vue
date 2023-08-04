<template>
	<div id="projectSummaryWeatherDataDialog">
		<el-dialog title="Weather Data"
                :visible="uploadWeatherFileDialog"
                :close-on-click-modal="false"
                @close="onWeatherFileDialogOpen"
                width="28%">
			<div style="width:90%; margin: auto; ">
                <div style="padding: 10px 0px">
                    <el-form
                            label-position="left"
                            label-width="100px"
                            :model="weatherStationData"
                            style="text-align: left;"
                            size="small">
                        <el-form-item label="File type">
                            <el-select
                                    :disabled="isFileReadyToUse || isWeatherFileUploading"
                                    style="width: 100%;" 
                                    v-model="weatherStationData.file_type" 
                                    placeholder="Select">
                                <el-option
                                        v-for="item in file_types"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Source">
                            <el-select
                                    :disabled="isFileReadyToUse || isWeatherFileUploading"
                                    style="width: 100%;" 
                                    v-model="weatherStationData.source" 
                                    placeholder="Select">
                                <el-option
                                        v-for="item in sources"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>

                    <el-upload
                        class="upload-demo"
                        action=""
                        :http-request="uploadWeatherFile"
                        multiple
                        :limit="5"
                        :show-file-list=false
                        :file-list="fileList"
                        style="width: 100%;">
                        <button
                                class="button-confirm"
                                style="width: 100%; height: 30px;"
                                :disabled="isWeatherFileUploading">
                            <span v-show="!isWeatherFileUploading">Upload</span>
                            <i class="el-icon-loading" v-show="isWeatherFileUploading"></i>
                        </button>
                    </el-upload>
                    <p style="font-size: 10px; text-align:right; padding-top: 5px;">&#42; Only .tm2, .tm3 and .csv formats supported. </p>
                    <div style="padding: 25px 0 10px 0px;">
                        <p style="text-align: left;"> Weather Station Information </p>
                    </div>
                    <el-form
                            label-position="left"
                            label-width="100px"
                            :model="weatherStationData"
                            style="text-align: left;"
                            size="small">
                        <el-form-item label="Site Name">
                            <el-input
                                    :disabled="!isFileReadyToUse" 
                                    v-model="weatherStationData.siteName"></el-input>
                        </el-form-item>
                        <el-form-item label="Latitude">
                            <el-input disabled v-model="weatherStationData.latitude"></el-input>
                        </el-form-item>
                        <el-form-item label="Longitude">
                            <el-input disabled v-model="weatherStationData.longitude"></el-input>
                        </el-form-item>
                        <el-form-item style="text-align: right;">
                            <!-- <button 
                                    class="button-cancel"
                                    :disabled="isWeatherFileUploading || isPatchingWeatherFile"
                                    @click="onUploadFileCancel">
                                Cancel 
                            </button> -->
                            <button 
                                    class="button-confirm"
                                    style="width: 80px;"
                                    @click="onUseFileConfirmation"
                                    :disabled="!isFileReadyToUse || isWeatherFileUploading || isPatchingWeatherFile"> 
                                <span v-show="!isPatchingWeatherFile">Use File</span>
                                <i class="el-icon-loading" v-show="isPatchingWeatherFile"></i>
                            </button>
                        </el-form-item>
                    </el-form>
                </div>
			</div>
		</el-dialog>
	</div>
</template>

<script>

    import {serverBus} from '../../../../../main';
    import { weatherMixin } from './weatherMixin.js';
    import API from '@/services/api';

    export default {
        name: 'projectSummaryWeatherDataDialog',
        mixins: [weatherMixin],
        props: {
            uploadWeatherFileDialog: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                msg: 'I am in projectSummaryWeatherDataDialog',
                fileList: [],
                isWeatherFileUploading: false,
                isFileReadyToUse: false,
                isPatchingWeatherFile: false,
                weatherStationData: {
                        id: null,
                        format: null,
                        location: null,
                        source: 'Meteonorm',
                        latitude: null,
                        longitude: null,
                        siteName: null,
                        format: null,
                        file_type: 'Hourly',
                },
                file_types: [{
                    value: 'Hourly',
                    label: 'Hourly',
                },{
                    value: 'Monthly',
                    label: 'Monthly',
                }],
                sources: [{
                    value: 'Meteonorm',
                    label: 'Meteonorm'
                    }, {
                    value: 'SolarGIS',
                    label: 'SolarGIS'
                    }, {
                    value: '3Tier',
                    label: '3Tier'
                    }, {
                    value: 'NREL',
                    label: 'NREL'
                    }
                ],
            }
        },
        methods: {

            patchMasterWeatherData(id) {

                const patchData = {
                    site_name: this.weatherStationData.siteName,
                };

                API.MASTER_DATA_WEATHER.PATCH_MASTER_WEATHER_DATA(id, patchData);
            },
            async uploadWeatherFile(data) {
                this.isWeatherFileUploading = true;
                const user = JSON.parse(localStorage.getItem('user')) || {}
                const token = user.token;
                const organisationId = user.organisation_id;
                
                let postData = new FormData();
                postData.append("source_file", data.file);
                postData.append("source", this.weatherStationData.source);
                postData.append("format", data.file.type);
                postData.append("organisation", organisationId);
                postData.append("file_type", this.weatherStationData.file_type);

                try {
                    let response = await API.MASTER_DATA_WEATHER.UPLOAD_WEATHER_FILE(postData);
                    this.$message({
                        showClose: true,
                        message: 'Successfully added weather station.',
                        type: 'success',
                        center: true
                    });

                    this.weatherStationData.latitude = parseFloat(response.data.latitude).toFixed(3);
                    this.weatherStationData.longitude = parseFloat(response.data.longitude).toFixed(3);
                    this.weatherStationData.siteName = response.data.site_name;
                    this.weatherStationData.source = response.data.source;
                    this.weatherStationData.file_type = response.data.file_type;
                    this.weatherStationData.id = response.data.id;
                    this.weatherStationData.format = response.data.format;
                    this.isFileReadyToUse = true;

                } catch (e) {
                    this.$message({
                        showClose: true,
                        message: (e.response) ? e.response.data : 'Error in uploading weather file. Try again',
                        type: 'error',
                        center: true
                    });
                    
                }

                this.isWeatherFileUploading = false;
            
            },
            
            onWeatherFileDialogOpen() {
                this.$emit('update:uploadWeatherFileDialog', false);
                this.weatherStationData.latitude = null;
                this.weatherStationData.longitude = null;
                this.weatherStationData.siteName = 'SITE_LOCATION';
                this.weatherStationData.id = null;
                this.weatherStationData.source = 'Meteonorm'
                this.weatherStationData.file_type = 'Hourly'
                this.isFileReadyToUse = false;
            },
            async onUseFileConfirmation() {
                // patch new weather station to project summary
                this.isPatchingWeatherFile = true;
                await this.patchMasterWeatherData(this.weatherStationData.id);
                try {

                    await this.patchWeatherStation(this.weatherStationData.id);
                    serverBus.$emit('weatherStationUpdated', JSON.parse(JSON.stringify(this.weatherStationData)), true);

                } catch (error) {
                }
                this.$emit('update:uploadWeatherFileDialog', false);
                this.isPatchingWeatherFile = false;
            },

            onUploadFileCancel() {
                serverBus.$emit('weatherStationUpdated', {}, false);
                this.$emit('update:uploadWeatherFileDialog', false);
            }
        },
    };
</script>

<style lang="scss" scoped>
    @import '../../../../../styles/components/button';
</style>

<style type="text/css">
    tr {
        cursor: pointer;
    }
    .el-upload {
        width: 100%;
    }

</style>
