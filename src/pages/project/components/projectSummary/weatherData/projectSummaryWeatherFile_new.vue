<template>
<div id="weatherFileContainer">
<el-dialog
  :visible.sync="weatherFileDialog"
  width="30%"
  >
  <div class="modal modal_table" id="weather_station" v-if="weatherFileDialog">
    <div
      class="modal-overlay modal-toggle"
      data-dismiss="modal"
      @click="$emit('update:weatherFileDialog', false)"
    ></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="headerModel">Weather Stations</h4>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:weatherFileDialog', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>
        <div class="table_section table_normal" v-loading="isLoading">
          <table ref="weatherFileTable">
            <thead>
              <tr>
                <th style="padding-left:24px;">#</th>
                <th>Location</th>
                <th>Source</th>
                <th>Distance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(weather, index) in weatherFiles"
                :key="index"
                @click="handleWeatherFileChange(weather, index)"
                class="weather-row"
                :class="{ highlight: index === selectedRow }"
              >
                <td>
                  <span class="sr_no">Sr. No.</span>
                  <strong class="sr_value">{{ index + 1 }}</strong>
                </td>
                <td>
                  <div class="md_head">Location</div>
                  <div class="value_type">
                    {{ weather.siteName }}
                    ({{ weather.latitude }}, {{ weather.longitude }})
                  </div>
                </td>
                <td>
                  <div class="md_head">Source</div>
                  <div class="value_type">
                    <span class="nowrap">{{ weather.source }}</span>
                  </div>
                </td>
                <td>
                  <div class="md_head">Distance</div>
                  <div class="value_type">
                    <span class="nowrap">
                      {{ weather.distance }} km ({{
                        (Number(weather.distance) * 0.62).toFixed(2)
                      }}
                      miles)
                    </span>
                  </div>
                </td>
                <td>
                  <div class="md_head">Status</div>
                  <div class="value_type">
                    <span class="nowrap">
                   {{weather.status==='true'?'Not Verified' : 'Verified'}}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal_footer">
          <div class="action_sction">
          <div class="fetch_and_upload">
            <div class="upload_files" @click="openUploadForm">
              <span class="icon upload-alt"></span>
              Upload New File
            </div>
            <div class="FetchFile" @click="fetchLatest">
              <span></span>
              Fetch Latest Weather File
            </div>
            <div class="FetchFile" @click="fetchLatestNSRDB" v-if="projectCountry === 52">
              <span></span>
              Fetch NSRDB File
            </div>
            <div class="FetchFile" @click="fetchLatestPVGIS">
              <span></span>
              Fetch PVGIS File
            </div>         
            </div>
            <div class="save">
            <div class="save_btn">
              <button
                class="btn btn-primary"
                type="submit"
                v-show="!isChangingWeatherStation"
                :disabled="isChangingWeatherStation"
                @click="onConfirmDialog"
              >
                Save
              </button>
              <div class="btn btn-primary" v-show="isChangingWeatherStation">
                <i class="el-icon-loading"></i>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <uploadWeatherFile
      :uploadWeatherFileDialog="uploadWeatherFileDialog"
      @close-upload="openUploadForm"
      @updateWeatherFile = "updateWeatherFile"
    />
  </div>
  <span slot="footer" class="dialog-footer">
  </span>
</el-dialog>
</div>
  
</template>

<script>
import { serverBus } from "../../../../../main";
import uploadWeatherFile from "./uploadWeatherFile1.vue";
import { weatherMixin } from "./weatherMixin.js";
import API from "@/services/api";
import { useProjectStore } from '../../../../../stores/project';
import { useLeadStore } from '../../../../../stores/lead';

import { mapState } from "pinia";
export default {
  name: "projectSummaryWeatherDataDialog",
  mixins: [weatherMixin],
  props: {
    weatherFiles: {
      type: Array,
      default: () => [],
    },
    weatherFileDialog: {
      type: Boolean,
      default: false,
    },
    selectedWeatherStation: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    uploadWeatherFile,
  },
  computed: {
    ...mapState(useProjectStore, {
      projectCountry: (state) => state.country,
      latitude: (state) => state.latitude,
      longitude: (state) => state.longitude,
    }),
    ...mapState(useLeadStore, {
      leadInfo: state => state
    }),
    projectId(){
      return (this.$route.params.projectId || this.leadInfo?.project_details?.id);
    }

  },
  data() {
    return {
      msg: "I am in projectSummaryWeatherDataDialog",
      modelsFormVisible: false,
      selectedWeatherStationLocal: this.selectedWeatherStation,
      uploadWeatherFileDialog: false,
      isChangingWeatherStation: false,
      selectedRow: null,
      //  projectId: this.$route.params.projectId,
       isLoading:false,
    };
  },
  methods: {
    async fetchLatestPVGIS() {
      try {
        this.isLoading=true;
        let response = await API.MASTER_DATA_WEATHER.PATCH_LATEST_PVGIS_WEATHER_FILE(this.projectId);
        // this.setBounds();
        this.$message({
        showClose: true,
        message: " Weather File Fetched Successfully.",
        type: "success",
        center: true
        });
      } catch(e) {
        this.$message({
        showClose: true,
        message: "Error in fetching files.",
        type: "error",
        center: true
        });
        this.isLoading=false;
      }
      this.isLoading=false;
      this.$emit('fetchLatestWeatherOnceAgain');
    },

    updateWeatherFile(){
      this.$emit('updateWeatherFile')
    },
    async fetchLatest() {
      try {
      this.isLoading=true;
      let response = await API.MASTER_DATA_WEATHER.PATCH_LATEST_WEATHER_FILE(
            this.projectId
          );
        // this.setBounds();
        this.$message({
        showClose: true,
        message: " Weather File Fetched Successfully.",
        type: "success",
        center: true
      });
       this.isLoading=false;
      } catch(e) {
        this.$message({
        showClose: true,
        message: "Error in fetching files.",
        type: "error",
        center: true
      });
       this.isLoading=false;
      }
      this.isLoading=false;
      this.$emit('fetchLatestWeatherOnceAgain');
    },
    async fetchLatestNSRDB() {
      try {
        this.isLoading=true;
        let response = await API.MASTER_DATA_WEATHER.PATCH_LATEST_NSRDB_WEATHER_FILE(
              this.projectId
            );
        // this.setBounds();
        this.$message({
        showClose: true,
        message: " Weather File Fetched Successfully.",
        type: "success",
        center: true
      });
      } catch(e) {
        this.$message({
        showClose: true,
        message: "Error in fetching files.",
        type: "error",
        center: true
      });
       this.isLoading=false;
      }
       this.isLoading=false;
      this.$emit('fetchLatestWeatherOnceAgain');
    },
    async onConfirmDialog() {
      try {
        this.isChangingWeatherStation = true;
        this.selectedWeatherStationLocal = Object.keys(this.selectedWeatherStationLocal).length === 0 ? this.selectedWeatherStation : this.selectedWeatherStationLocal;
        await this.patchWeatherStation(this.selectedWeatherStationLocal.id);
        this.$emit(
          "update:selectedWeatherStation",
          this.selectedWeatherStationLocal
        );
        this.isChangingWeatherStation = false;
        this.$emit("update:weatherFileDialog", false);
      } catch (error) {
        let errorMessage = error.response.status === 403 ?
                            "You don't have permission to edit this project." :
                            "Error in updating weather station. Try again";

        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        })
        this.isChangingWeatherStation = false;
        this.$emit("update:weatherFileDialog", false);
      }
    },

    handleWeatherFileChange(currentSelection, rowIndex) {
      this.selectedRow = rowIndex;
      this.selectedWeatherStationLocal = this.selectedWeatherStationLocal.id
      this.selectedWeatherStationLocal = currentSelection;
    },
    openUploadForm() {
      this.uploadWeatherFileDialog = !this.uploadWeatherFileDialog;
    },
  },
  watch: {
    weatherFileDialog: function() {
      //this.selectedRow = this.weatherFiles.indexOf(this.selectedWeatherStation.id);
      this.selectedRow = this.weatherFiles.findIndex(i => i.id === this.selectedWeatherStation.id);
    },
  },
  mounted() {
    serverBus.$on(
      "weatherStationUpdated",
      async (station, isUsingUploadedFile) => {
        if (isUsingUploadedFile) {
          this.$emit("update:selectedWeatherStation", station);
          this.$emit("update:weatherFileDialog", false);
        }
        this.$emit(
          "update:weatherFiles",
          await this.fetchWeatherFiles(this.latitude, this.longitude)
        );
      }
    );
  },
};
</script>

<style scoped>
.weather-row{
  cursor:pointer;
}
#weatherFileContainer >>> .el-dialog__header{
  display: none !important;
}

#weatherFileContainer >>> .el-dialog__footer{
  display: none !important;
}
.action_sction{
  justify-content:start;
}
.modal-wrapper >>> .headerModel {
    color: #222;
    font-size: 16px;
    word-break: break-all;
}
button {
  overflow: visible;
}
button[disabled] {
  cursor: default;
}

h4 {
  font-weight: 600;
  margin: 0px;
}
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
menu,
nav,
section,
summary {
  display: block;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}

td {
  padding: 0;
}

th {
  padding: 0;
}
.highlight {
  background: #ccd1d6 !important;
}
.FetchFile{
  margin-left:16px;
}
.fetch_and_upload{
  display:flex;
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
.update{
   align-items: center;
   align-content: space-between;
   padding: 0px;
   margin: 0px;
   display:flex;
   justify-content: space-between;
}
.Fetch{
    align-items: center;
    align-content: space-between;
    padding: 0px;
    margin-right: 187px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    justify-content: space-between;
}
.save{
    display: flex;
    width: 162px;
    justify-content: flex-end;
}
@media (max-width: 767px) {
  .btn {
    padding: 6px 24px;
  }
}

input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
  box-sizing: border-box;
}
.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092f7);
  color: var(--white);
}
.btn.btn-primary:disabled {
  background-image: linear-gradient(
    to bottom,
    var(--light-gray),
    var(--step-100)
  );
  border-color: var(--step-100);
}

.modal.modal_form .modal-wrapper .modal-content .modal-header,
.modal.more_details .modal-wrapper .modal-content .modal-header,
.modal.data_modal .modal-wrapper .modal-content .modal-header,
.modal.modal_table .modal-wrapper .modal-content .modal-header,
.table_section table thead tr th,
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
}
body.modal-open {
  overflow-x: hidden;
}

.scroll_content {
  /* overflow-y: auto; */
  overflow-x: hidden;
  padding: 0 24px 24px;
  position: relative;
}
@media (max-width: 1280px) {
  .scroll_content {
    overflow: hidden;
    padding-bottom: 6px;
  }
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
  z-index: 999;
  /* 1 */
  top: 0;
  left: 0;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
  overflow: auto;
  /*background-color: rgba(0, 0, 0, 0.6)*/;
}
.modal.modal_table {
  z-index: 999;
  top: 0;
  left: 0;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
  overflow: auto;
}
.modal.in {
  visibility: visible;
}
.modal.in .modal-overlay {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
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
.modal_delete .modal-wrapper {
  max-width: 472px;
  text-align: center;
}
.modal_delete .modal-wrapper .modal-content {
  min-height: 290px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal_delete .modal-wrapper .modal-content p {
  margin-top: 24px;
  font-size: var(--f16);
}

.modal_delete .modal-wrapper .modal-content .button_area {
  margin-top: 24px;
}
.modal_delete .modal-wrapper .modal-content .button_area .btn {
  min-width: 112px;
}
.modal_share .modal-wrapper {
  max-width: 704px;
  text-align: center;
}
.modal_share .modal-wrapper .modal-content {
  min-height: 290px;
  display: flex;
  justify-content: center;
  align-items: center;
}




.modal_share .modal-wrapper .modal-content .error_label {
  text-align: left;
  font-size: 12px;
  margin-top: 8px;
}
.modal_share .modal-wrapper .modal-content p {
  margin: 0 auto;
  font-size: var(--f16);
  max-width: 410px;
  width: 100%;
  color: var(--step-200);
  line-height: 1.5;
}
.modal_share .modal-wrapper .modal-content .share_content {
  width: 100%;
}
.modal_share .modal-wrapper .modal-content .add_email {
  background: var(--step-50);
  padding: 16px;
  margin-top: 24px;
  text-align: left;
  overflow: auto;
}
.modal_share .modal-wrapper .modal-content .add_email .tag {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 30px;
  font-size: var(--f14);
  color: var(--step-200);
  border: 1px solid var(--step-100);
  background: var(--white);
  padding: 4px 8px;
  margin: 2px 1px;
}
.modal_share .modal-wrapper .modal-content .add_email .tag img {
  width: 12px;
  cursor: pointer;
  margin-left: 6px;
  line-height: 1;
}
.modal_share .modal-wrapper .modal-content .add_email .tag.error {
  border-color: var(--error);
}
.modal_share .modal-wrapper .modal-content .add_email .add_field {
  background: transparent;
  border: none;
}
.modal_share .modal-wrapper .modal-content .share_with {
  display: flex;
  text-align: left;
  position: relative;
  margin-top: 10px;
}
.modal_share .modal-wrapper .modal-content .share_with label {
  font-size: var(--f14);
  color: var(--step-200);
  margin-right: 4px;
}
.modal_share
  .modal-wrapper
  .modal-content
  .share_with
  .email_group
  .selected_email {
  font-size: var(--f14);
  color: var(--step-250);
  display: flex;
  align-items: center;
}
.modal_share
  .modal-wrapper
  .modal-content
  .share_with
  .email_group
  .selected_email
  .arrow_down {
  margin-left: 6px;
  cursor: pointer;
}
.modal_share
  .modal-wrapper
  .modal-content
  .share_with
  .email_group
  .dropdown_list {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px var(--step-50);
  background: var(--white);
}
.modal_share
  .modal-wrapper
  .modal-content
  .share_with
  .email_group
  .dropdown_list
  li {
  font-size: 12px;
}
.modal_share
  .modal-wrapper
  .modal-content
  .share_with
  .email_group
  .dropdown_list
  li:not(:first-child) {
  margin-top: 12px;
}
.modal_share .modal-wrapper .modal-content .button_area {
  margin-top: 24px;
}
.modal_share .modal-wrapper .modal-content .button_area .btn {
  min-width: 112px;
}
.modal.modal_form .modal-wrapper {
  max-width: 500px;
  margin: 0;
}
.modal.modal_form .modal-wrapper .modal-content {
  padding: 0;
}
.modal.modal_form .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.modal_form .modal-wrapper .modal-content .inside_form {
  padding: 0 24px 16px;
}
.modal.more_details .modal-wrapper {
  max-width: 768px;
  margin: 0;
}
.modal.more_details .modal-wrapper .modal-content {
  padding: 0;
}
.modal.more_details .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.more_details .modal-wrapper .modal-content .modal-header h4 {
  font-size: 14px;
  font-weight: 500;
  color: var(--step-250);
}
.modal.more_details .modal-wrapper .modal-content .new_content {
  padding: 24px 0;
}
.modal.more_details .modal-wrapper .modal-content .new_content .scroll_content {
  padding-bottom: 0;
  max-height: calc(100vh - 160px);
}
.modal.more_details .modal-wrapper .modal-content .new_content h5 {
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
}
.modal.more_details
  .modal-wrapper
  .modal-content
  .new_content
  h5:not(:first-child) {
  margin-top: 20px;
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
  padding: 4px 24px;
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
  .action_sction {
    display: flex;
    flex-direction: column;
  }
  .fetch_and_upload {
    display: flex;
    flex-direction: column;
    
  }
  .FetchFile{
    margin-top:8px;
    margin-left:0px;
  }
  .save{
    justify-content: center;
    margin-top:8px;
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
.modal.modal_table .modal-wrapper {
     max-width:70%;
}
.modal.modal_table .modal-wrapper .modal-content {
  padding: 0;
  word-break:normal;
}
.modal.modal_table .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.modal_table .modal_footer {
  padding: 12px 24px;
  margin-top: 4px;
} 
.modal.modal_table .modal_footer .action_sction{
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  margin-top: 3px;
  display: flex;
  flex-wrap: wrap;
}
.modal.modal_table .modal_footer .action_sction .upload_files {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--primary);
  border-radius: 4px;
  background: var(--white);
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
}
.modal.modal_table .modal_footer .action_sction .upload_files input {
  position: absolute;
  /* opacity: 0; */
  cursor: pointer;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
.modal.modal_table .modal_footer .action_sction .upload_files .icon {
  font-size: 18px;
  margin-right: 6px;
  display: inline-flex;
}
.modal.modal_table .modal_footer .action_sction .FetchFile {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--primary);
  border-radius: 4px;
  background: var(--white);
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  text-align:center;
}
.modal-overlay {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  /* visibility: hidden;
  opacity: 0; */
  transition: visibility 0s linear 0.3s, opacity 0.3s;
}

.modal_table .modal-wrapper {
  margin: 0;
}
.modal_table .modal-wrapper .table_normal {
  max-height: calc(100vh - 250px) !important;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .modal_table .modal-wrapper .table_normal {
    padding: 12px;
  }
}
.modal_table .modal-wrapper .table_normal table td,
.modal_table .modal-wrapper .table_normal table th {
  padding: 16px 12px;
}
@media (min-width: 1281px) {
  .modal_table .modal-wrapper .table_normal table td:first-child,
  .modal_table .modal-wrapper .table_normal table th:first-child {
    padding-left: 24px;
  }
  .modal_table .modal-wrapper .table_normal table td:last-child,
  .modal_table .modal-wrapper .table_normal table th:last-child {
    padding-right: 24px;
  }
}
@media (max-width: 1280px) {
  .modal_table .modal-wrapper .table_normal table td,
  .modal_table .modal-wrapper .table_normal table th {
    padding: 8px 12px;
  }
}
@media (max-width: 1280px) {
  .modal_table .modal-wrapper .table_normal table tbody tr {
    padding: 6px 0;
  }
}
.modal_table .modal-wrapper .table_normal table tbody tr:hover {
  background-color: var(--light-blue);
}
.modal_form .scroll_content {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding: 20px 0 6px;
}

.modal_form .button_area .btn {
  width: 100%;
}

.table_section {
  overflow-x: auto;
}
.table_section table {
  width: 100%;
  border-radius: 12px;
  border-collapse: separate;
  background-color: var(--white);
}
@media (max-width: 1280px) {
  .table_section table {
    display: block;
    background-color: transparent;
  }
}
.table_section table th,
.table_section table td {
  padding: 16px;
}
.table_section table th .date,
.table_section table td .date {
  white-space: nowrap;
}


@media(max-width: 1113px) {
    .modal.modal_table .modal-wrapper{
      max-width: 70% !important;
    }
  }

@media(max-width: 900px) {
    .modal.modal_table .modal-wrapper{
      max-width: 85% !important;
    }
  }

 

.table_section table thead tr th {
  padding-top: 16px;
  padding-bottom: 16px;
  text-align: left;
  color: var(--primary);
  font-size: var(--f14);
  font-weight: 500;
  text-transform: uppercase;
  border-top: 1px solid var(--step-100);
  white-space: nowrap;
}
.table_section table thead tr th:first-child {
  border-left: 1px solid var(--step-100);
}
.table_section table thead tr th:last-child {
  border-right: 1px solid var(--step-100);
}
.table_section table thead tr:first-child th:first-child {
  border-top-left-radius: 10px;
}
.table_section table thead tr:first-child th:last-child {
  border-top-right-radius: 10px;
}
@media (max-width: 1280px) {
  .table_section table tbody {
    display: block;
    width: 100%;
  }
}
@media (max-width: 1280px) {
  .table_section table tbody tr {
    display: flex;
    flex-wrap: wrap;
    padding: 24px 32px 24px 24px;
    position: relative;
    background: var(--white);
    border: 1px solid var(--step-100);
    border-radius: 4px;
  }
  .table_section table tbody tr:not(:last-child) {
    margin-bottom: 16px;
  }
}
@media (max-width: 1280px) and (max-width: 767px) {
  .table_section table tbody tr:not(:last-child) {
    margin-bottom: 8px;
  }
}
@media (max-width: 1280px) {
  .table_section table tbody tr .act_text {
    display: block;
    margin-left: 8px;
  }
}
@media (min-width: 1281px) {
  .table_section table tbody tr td {
    border-bottom: 1px solid var(--step-100);
  }
  .table_section table tbody tr td:first-child {
    border-left: 1px solid var(--step-100);
  }
  .table_section table tbody tr td:last-child {
    border-right: 1px solid var(--step-100);
  }
}
.table_section table tbody tr td .action_btn {
  display: flex;
}
.table_section table tbody tr td .action_btn .btn {
  background-color: var(--white);
  padding: 8px;
  border: 1px solid var(--step-100);
  box-shadow: none;
  min-width: 32px;
  height: 32px;
  transition: all ease-in-out 0.35s;
  padding: 6px;
}
.table_section table tbody tr td .action_btn .btn:not(:last-child) {
  margin-right: 12px;
}
.table_section table tbody tr td .action_btn .btn span {
  color: var(--step-200);
  font: 14px;
}
.table_section table tbody tr td .action_btn .btn:hover {
  background-color: var(--step-100);
}
.table_section table tbody tr td .action_btn .btn:hover span {
  color: var(--primary);
}
@media (max-width: 1280px) {
  .table_section table tbody tr td {
    padding: 0;
  }
  .table_section table tbody tr td.address_td {
    flex-grow: 1;
    flex: 0 0 100%;
  }
  .table_section table tbody tr td.title_td {
    flex-grow: 1;
  }
}
@media (max-width: 1280px) and (max-width: 767px) {
  .table_section table tbody tr td.title_td {
    margin-top: 12px;
  }
}
@media (max-width: 1280px) {
  .table_section table tbody tr td.title_td.grow_td {
    margin-left: 84px;
  }
}
@media (max-width: 1280px) and (max-width: 767px) {
  .table_section table tbody tr td.title_td.grow_td {
    margin-left: 0;
  }
}
@media (max-width: 1280px) {
  .table_section table tbody tr td.title_td:not(:last-child) {
    padding-right: 12px;
  }
  .table_section table tbody tr td.md_dot {
    position: absolute;
    right: 16px;
    cursor: pointer;
  }
  .table_section table tbody tr td.md_dot .action_btn {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    opacity: 0;
    visibility: hidden;
    transition: all ease-in-out 0.4s;
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list {
    width: 152px;
    border-radius: 4px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
    border: solid 1px var(--step-100);
    background: var(--white);
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list li {
    display: flex;
    width: 100%;
    padding: 4px 8px;
    align-items: center;
  }
  .table_section
    table
    tbody
    tr
    td.md_dot
    .action_btn
    .action_list
    li:not(:last-child) {
    border-bottom: 1px solid var(--step-100);
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list li .btn {
    padding: 0;
    border: 0;
    width: 24px;
    height: 24px;
    margin: 0;
  }
  .table_section table tbody tr td.md_dot.active .action_btn {
    opacity: 1;
    visibility: visible;
  }
  .table_section table tbody tr td .value_type,
  .table_section table tbody tr td .date {
    margin-top: 4px;
    display: block;
  }
}
@media (min-width: 1281px) {
  .table_section table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }
  .table_section table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }
}
.table_section.table_normal table {
  border-collapse: collapse;
  width: 100%;
  border: 0;
}
.table_section.table_normal table td,
.table_section.table_normal table th {
  padding: 12px;
  text-align: left;
  font-family: Helvetica;
  font-size: 14px;
}
@media (min-width: 1281px) {
  .table_section.table_normal table td:first-child,
  .table_section.table_normal table th:first-child {
    padding-left: 0;
    border-left: 0;
  }
  .table_section.table_normal table td:last-child,
  .table_section.table_normal table th:last-child {
    padding-right: 0;
    border-right: 0;
  }
}
.table_section.table_normal table thead tr th {
  border-bottom: solid 2px var(--step-100);
  border-top: 0;
  font-weight: 500;
  background: var(--white);
}
.table_section.table_normal table thead tr th.action-title {
  text-align: right;
}
@media (max-width: 1024px) {
  .table_section.table_normal table tbody tr {
    padding: 0;
  }
}
@media (min-width: 1281px) {
  .table_section.table_normal table tbody tr td {
    display: table-cell;
    border-bottom: solid 1px var(--step-100);
  }
}
@media (max-width: 1280px) {
  .table_section.table_normal table tbody tr td {
    width: 33.333%;
  }
}
@media (max-width: 767px) {
  .table_section.table_normal table tbody tr td {
    width: 100%;
  }
}
.table_section.table_normal table tbody tr td.no_border {
  border: 0;
}

@media (min-width: 1281px) {
  .action_list {
    display: flex;
  }
  .dot,
  .md_head,
  .act_text,
  .sr_no {
    display: none;
  }
}
.md_head,
.sr_value {
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}
.nowrap {
  display: inline-block;
  white-space: nowrap;
}
tr:hover {
  background-color: rgb(220, 220,220) !important;
}
.table_section.table_normal {
  overflow-x: auto;
  border-top-style: outset;
  margin-top: 0rem;
}
@media (max-width: 1097px){
.save{
  justify-content: flex-start;
  margin-top: 12px;
}
.btn{
  width: 153.7px;
}
}
</style>
