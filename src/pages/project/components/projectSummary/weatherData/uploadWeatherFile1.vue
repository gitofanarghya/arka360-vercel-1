<template>
  <div class="modal data_modal" id="weather_data" v-if="uploadWeatherFileDialog">
    <div class="modal-overlay modal-toggle" data-dismiss="modal"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Weather Data</h4>
          <button @click="$emit('close-upload')" class="modal-close modal-toggle">
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="upload_section">
          <div class="upload_from">
            <div class="row">
              <div class="col">
                <div class="upload_area" @dragover="dragover" @drop="drop">
                  <div class="insicloseUploadde_content">
                    <h5>Drag Files to Upload</h5>
                    <div class="or">or</div>
                    <div class="browse_button">
                      <label class="select_label" v-show="!isWeatherFileUploading">
                        <input
                          v-show="!isWeatherFileUploading"
                          class="btn btn-outline"
                          type="file"
                          ref="file"
                          @change="onChange"
                          :disabled="isWeatherFileUploading"
                        />
                        browse file
                      </label>
                      <i class="el-icon-loading" v-show="isWeatherFileUploading"></i>
                      <ul class="mt-4" v-if="this.fileList.length" >
                        <li class="text-sm p-1" v-for="(file, i) in fileList" :key="i">
                          {{ file.name }}
                          <button class="btn btn-primary" type="button" @click="remove(fileList.indexOf(file))" title="Remove file">remove</button>
                        </li>
                      </ul>
                    </div>
                    <div class="file_types">* Only .tm2, .tm3 and .csv formats supported</div>
                  </div>
                </div>
                <p v-show="isInvalidFile" class="error-msg">* {{errorMsg}}</p>
              </div>
              <div class="col">
                <div class="data_form">
                  <div class="floating-label">
                    <select
                      :disabled="isFileReadyToUse || isWeatherFileUploading"
                      class="floating-select"
                      v-model="weatherStationData.file_type"
                      aria-placeholder="Select"
                    >
                      <option
                        v-for="item in file_types"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </select>
                    <label :class="{'is-disabled': isFileReadyToUse}">File type</label>
                    <span v-show="!weatherStationData.file_type && !isFileReadyToUse" class="error_label">Select this field before uploading the document</span>
                  </div>
                  <div class="floating-label">
                    <select
                      class="floating-select"
                      :disabled="isFileReadyToUse || isWeatherFileUploading"
                      v-model="weatherStationData.source"
                      placeholder="Select"
                    >
                      <option
                        v-for="item in sources"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></option>
                    </select>
                    <label :class="{'is-disabled': isFileReadyToUse}">Select Source</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      placeholder=" "
                      :disabled="!isFileReadyToUse"
                      v-model="weatherStationData.siteName"
                    />
                    <label>Site Name</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      placeholder=" "
                      disabled
                      v-model="weatherStationData.latitude"
                    />
                    <label>Latitude</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      placeholder=" "
                      disabled
                      v-model="weatherStationData.longitude"
                    />
                    <label>Longitude</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col"></div>
              <div class="col">
                <button 
                  class="btn btn-primary" 
                  @click="onUseFileConfirmation"
                  :disabled="!isFileReadyToUse || isWeatherFileUploading || isPatchingWeatherFile"
                >
                  <span v-show="!isPatchingWeatherFile">Use File</span>
                  <i class="el-icon-loading" v-show="isPatchingWeatherFile"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serverBus } from "../../../../../main";
import { weatherMixin } from "./weatherMixin.js";
import API from "@/services/api";

export default {
  name: "projectSummaryWeatherDataDialog",
  mixins: [weatherMixin],
  props: [
    'uploadWeatherFileDialog'
  ],
  data() {
    return {
      msg: "I am in projectSummaryWeatherDataDialog",
      fileList: [],
      isWeatherFileUploading: false,
      isFileReadyToUse: false,
      isPatchingWeatherFile: false,
      isInvalidFile: false,
      errorMsg: '',
      weatherStationData: {
        id: null,
        format: null,
        location: null,
        source: "Meteonorm",
        latitude: null,
        longitude: null,
        siteName: null,
        format: null,
        file_type: "Hourly",
      },
      file_types: [
        {
          value: "Hourly",
          label: "Hourly",
        },
        {
          value: "Monthly",
          label: "Monthly",
        },
      ],
      sources: [
        {
          value: "Meteonorm",
          label: "Meteonorm",
        },
        {
          value: "SolarGIS",
          label: "SolarGIS",
        },
        {
          value: "SolarGISProspect",
          label: "SolarGISProspect",
        },
        {
          value: "3Tier",
          label: "3Tier",
        },
        {
          value: "NREL",
          label: "NREL",
        },
      ],
    };
  },
  methods: {
    patchMasterWeatherData(id) {
      const patchData = {
        site_name: this.weatherStationData.siteName,
      };

      API.MASTER_DATA_WEATHER.PATCH_MASTER_WEATHER_DATA(id, patchData);
    },
    async uploadWeatherFile(file) {
      this.isWeatherFileUploading = true;
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      const organisationId = user.organisation_id;

      let postData = new FormData();
      postData.append("source_file", file);
      postData.append("source", this.weatherStationData.source);
      postData.append("format", file.type);
      postData.append("organisation", organisationId);
      postData.append("file_type", this.weatherStationData.file_type);

      try {
        let response = await API.MASTER_DATA_WEATHER.UPLOAD_WEATHER_FILE(
          postData
        );
        // this.$message({
        //   showClose: true,
        //   message: "Successfully added weather station. ",
        //   type: "success",
        //   center: true
        // });
        this.$toastr.s("Successfully added weather station.");

        this.weatherStationData.latitude = parseFloat(
          response.data.latitude
        ).toFixed(3);
        this.weatherStationData.longitude = parseFloat(
          response.data.longitude
        ).toFixed(3);
        this.weatherStationData.siteName = response.data.site_name;
        this.weatherStationData.source = response.data.source;
        this.weatherStationData.file_type = response.data.file_type || this.weatherStationData.file_type;
        this.weatherStationData.id = response.data.id;
        this.weatherStationData.format = response.data.format;
        this.isFileReadyToUse = true;
      } catch (e) {
        this.errorMsg =  e.response ? e.response.data.error : "Error in uploading weather file. Try again";
        // this.$toastr.e(message);
        this.isInvalidFile = true;
        setTimeout(() => {
          this.isInvalidFile = false;
        }, 7000);
      }

      this.isWeatherFileUploading = false;
      this.$emit('updateWeatherFile')
    },
    async onUseFileConfirmation() {
      // patch new weather station to project summary
      this.isPatchingWeatherFile = true;
      this.patchMasterWeatherData(this.weatherStationData.id);
      try {
        await this.patchWeatherStation(this.weatherStationData.id);
        serverBus.$emit(
          "weatherStationUpdated",
          JSON.parse(JSON.stringify(this.weatherStationData)),
          true
        );
      } catch (error) {}
      this.isPatchingWeatherFile = false;
      this.$emit('close-upload')

    },

    handleFileUpload() {
      this.uploadWeatherFile(file);
    },
    onChange() {
      this.fileList = this.$refs.file.files[0];
      this.uploadWeatherFile(this.fileList);
    },
    remove(i) {
      this.fileList.splice(i, 1);
    },
    dragover(event) {
      event.preventDefault();
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.onChange(); // Trigger the onChange event manually
    }
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font);
}

ul {
  padding: 0;
  list-style: none;
}
button {
  overflow: visible;
}

body {
  margin: 0;
  font-size: 16px;
  color: var(--step-250);
}

button {
  color: inherit;
  font: inherit;
  margin: 0;
}
button:focus {
  outline: none;
  text-transform: none;
  -webkit-appearance: button;
  cursor: pointer;
}
button:focus::-moz-focus-inner {
  border: 0;
  padding: 0;
}

input {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
input:focus {
  outline: none;
}
input:focus::-moz-focus-inner {
  border: 0;
  padding: 0;
}

optgroup {
  color: inherit;
  font: inherit;
  margin: 0;
}
optgroup:focus {
  outline: none;
  font-weight: bold;
}

select {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
select:focus {
  outline: none;
  text-transform: none;
}

input[type="file"] {
  width: 10vw;
  height: 4vh;
  display: none;
}
.select_label {
  height: 4vh;
  border-radius: 5px;
  border: 1px solid #1c3366;
  columns: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: normal;
  cursor: pointer;
  transition: transform 0.2s ease-out;
}

input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}

button[disabled] {
  cursor: default;
}

.modal.data_modal .modal-wrapper .modal-content .modal-header {
  background-image: linear-gradient(to bottom, #E8EDF2, #e9ecf2);
}

.modal-wrapper {
  position: absolute;
  z-index: 999;
  left: 50%;
  top: 50%;
  max-width: 704px;
  width: 100%;
  margin: 32px 0;
  transform: translate(-50%, -50%);
}

.modal {
  position: fixed;
  z-index: 10000;
  /* 1 */
  top: 0;
  left: 0;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgba(0, 0, 0, 0.25);
}
.modal.in {
  visibility: visible;
}
.modal.in .modal-overlay {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.5s;
}
.modal .modal-content {
  padding: 32px 24px 24px;
  background-color: var(--white);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.35);
  border-radius: 12px;
  position: relative;
}
@media (max-width: 1280px) {
  .modal .modal-content {
    max-width: calc(100% - 48px);
    margin: auto;
  }
}
.modal .modal-close {
  background: transparent;
  border: 0;
  position: absolute;
  right: 8px;
  top: 12px;
  cursor: pointer;
}
.modal .modal-close:focus {
  outline: none;
}
.modal .modal-header {
  padding: 24px;
}
.modal.data_modal .modal-wrapper {
  max-width: 650px;
  margin: 0;
}
.modal.data_modal .modal-wrapper .modal-content {
  padding: 0;
}
.modal.data_modal .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.data_modal .modal-wrapper .modal-content .error_label {
  font-size: 12px;
}
.modal.data_modal .modal-wrapper .modal-content .upload_section {
  padding: 20px 0;
}
.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from {
  padding: 6px 24px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .upload_area {
  background: var(--step-50);
  padding: 20px;
  text-align: center;
  border: 2px dashed var(--step-100);
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
@media (min-width: 768px) {
  .modal.data_modal
    .modal-wrapper
    .modal-content
    .upload_section
    .upload_from
    .upload_area {
    height: calc(100% - 30px);
    margin-bottom: 0;
  }
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .upload_area
  h5 {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.78;
  color: var(--step-200);
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .upload_area
  .or {
  font-size: 14px;
  font-weight: normal;
  line-height: 1.78;
  color: var(--step-200);
  margin: 8px 0;
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .upload_area
  .file_types {
  font-size: 12px;
  font-weight: normal;
  color: var(--step-250);
  margin: 18px 0 0;
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .upload_area
  .browse_button
  .btn-outline {
  box-shadow: none;
  border-color: var(--primary);
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: normal;
  background: var(--step-50);
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .row {
  display: flex;
  margin: 0 -12px;
}
@media (max-width: 767px) {
  .modal.data_modal
    .modal-wrapper
    .modal-content
    .upload_section
    .upload_from
    .row {
    flex-wrap: wrap;
  }
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .row
  .col {
  flex-grow: 1;
  width: 50%;
  padding: 12px 12px 0;
}
@media (max-width: 767px) {
  .modal.data_modal
    .modal-wrapper
    .modal-content
    .upload_section
    .upload_from
    .row
    .col {
    width: 100%;
  }
}
.modal.data_modal
  .modal-wrapper
  .modal-content
  .upload_section
  .upload_from
  .row
  .col:empty {
  padding: 0;
  line-height: 0;
  max-height: 0;
}

.modal-overlay {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  /* visibility: hidden; */
  opacity: 0;
  transition: visibility 0s linear 0.3s, opacity 0.3s;
}

/****  floating-Lable style end ****/
.floating-label {
  position: relative;
  margin-bottom: 30px;
}
.floating-label label {
  color: var(--step-200);
  font-size: 14px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 16px;
  top: 12px;
  transition: 0.2s ease all;
}
.is-disabled {
  top: -19px !important;
  left: 0 !important;
  font-size: 12px !important;
}

.floating-input {
  font-size: 14px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 40px;
  background-color: #E8EDF2;
  border: none;
  border-radius: 4px;
}
.floating-input:focus {
  outline: none;
}
.floating-input:focus ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}
.floating-input:focus ~ .bar:before {
  width: 50%;
}
.floating-input:focus ~ .bar:after {
  width: 50%;
}
.floating-input:focus ~ .highlight {
  animation: inputHighlighter 0.3s ease;
}
.floating-input:not(:placeholder-shown) ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}

.floating-select {
  font-size: 14px;
  padding: 10px 16px;
  display: block;
  width: 100%;
  height: 40px;
  background-color: var(--step-50);
  border: none;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-repeat: no-repeat;
  background-position: calc(100% - 8px) center;
  background-size: 22px;
}
.floating-select:focus {
  outline: none;
}
.floating-select:focus ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}
.floating-select:focus ~ .bar:before {
  width: 50%;
}
.floating-select:focus ~ .bar:after {
  width: 50%;
}
.floating-select:not([value=""]):valid ~ label {
  top: -19px;
  left: 0;
  font-size: 12px;
}

.floating-label.right_value .floating-input {
  padding-right: 70px;
}

.floating-label.right_value .value_area {
  position: absolute;
  right: 12px;
  top: 13px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--step-200);
}
.floating-label.right_value .value_area .fas {
  font-size: 12px;
  margin-left: 4px;
  cursor: pointer;
}
@media (max-width: 1280px) {
  body {
    font-size: 14px;
  }
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 500;
}
.btn {
  color: var(--dark);
  background-color: var(--step-0);
  border: 1px solid var(--step-150);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  font-size: var(--f14);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.55rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  box-shadow: 0 1px 2px 0 var(--step-150);
}
@media (max-width: 767px) {
  .btn {
    padding: 6px 8px;
  }
}
.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092F7);
  color: var(--white);
}
.btn:disabled {
  background: rgb(190, 189, 189);
  color: rgb(44, 44, 44);
  border-color: rgb(194, 192, 192);
}

.error_label {
  font-size: var(--f14);
  color: var(--error);
}
.bg-green-300{
  background: green;
}
.bg-grey-100{
  background: rgb(103, 231, 103);
}
.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area {
    background: var(--step-50);
    padding: 20px;
    text-align: center;
    border: 2px dashed var(--step-100);
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    justify-content: center;
}

@media (min-width: 768px) {
    .modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area {
        height: calc(100% - 30px);
        margin-bottom: 0;
        justify-content: center;
    }
}

.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area h5 {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.78;
    color: var(--step-200);
}

.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area .or {
    font-size: 14px;
    font-weight: normal;
    line-height: 1.78;
    color: var(--step-200);
    margin: 8px 0;
}

.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area .file_types {
    font-size: 12px;
    font-weight: normal;
    color: var(--step-250);
    margin: 18px 0 0;
}

.modal.data_modal .modal-wrapper .modal-content .upload_section .upload_from .upload_area .browse_button .btn-outline {
    box-shadow: none;
    border-color: var(--primary);
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 14px;
    font-weight: normal;
    background: var(--step-50);
}
.error-msg{
  color:red;
  font-size: small;
}
</style>