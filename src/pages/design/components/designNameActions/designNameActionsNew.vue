<template>


<div   v-loading.fullscreen.lock="isDownloading" class="group_title"  >
        
            <span class="title_text"> {{ designName }}</span>
            <el-tooltip effect="dark" placement="top-start" content="Edit Design">
            <button class="action_btn"  @click="isEditDesignNameDialogVisible = true" 
                data-toggle="modal" data-target="#edit_design"
                :class="{disable_design: isDesignDisabled(order_status)}"
            >
                <span class="icon edit-alt"></span>
            </button>
            </el-tooltip>
            <editDesignNameDialog
            :is-edit-design-name-dialog-visible.sync="isEditDesignNameDialogVisible"
            :design-name="designName"/>

            <div :v-if="showlogoutconfirmbox">
                <vue-confirm-dialog class="ConfirmBox"></vue-confirm-dialog>
            </div>

            <el-dropdown trigger="click" :class="{disable_design: isDesignDisabled(order_status)}">
                <span class="el-dropdown-link">
                    <el-tooltip effect="dark" placement="top-start" content="Download Design">
                    <button
                        class="icon download-alt action_btn"/>
                    </el-tooltip>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <!-- <div v-if="isItTataOrganisation"
                        :class="[(summary.nameplateDcSize == 0 || summary.acSize == 0) ?
                        'cursorNotAllowed' : '']">
                        <el-dropdown-item
                            id="reportExportButton"
                            :disabled="summary.nameplateDcSize == 0 || summary.acSize == 0"
                            @click.native="downloadReport">
                            Download Report
                        </el-dropdown-item>
                    </div> -->
                    <div
                        :class="[(summary.nameplateDcSize == 0 || summary.acSize == 0) ?
                        'cursorNotAllowed' : '']">
                        <el-dropdown-item
                            id="reportExportButton"
                            v-if="is_heaven_solar_integrated"
                            :disabled="summary.nameplateDcSize == 0 || summary.acSize == 0 || !isAutoCadEnabled || is_exported_heaven_solar"
                            @click.native="export_to_heaven_solar">
                            Get Detail Design
                        </el-dropdown-item>
                    </div>
                    <el-dropdown-item
                        v-if="isAutoCadEnabled"
                        id="autoCadExportButton"
                        @click.native="downloadAutoCadExport"
                    >
                        Download CAD Layout
                    </el-dropdown-item>
                    <el-dropdown-item
                        id="CSVexportButton"
                        @click.native="downloadCSVExport">
                        Download Generation CSV
                    </el-dropdown-item>
                    <el-dropdown-item
                        id="DwgPropsExportButton"
                        @click.native="downloadDwgPropsExport">
                        Download DWG Props.
                    </el-dropdown-item>
                    <!-- <el-dropdown-item
                        v-if="isDocsEnabled"
                        id="googleDocExportButton"
                        @click.native="downloadDocsAndSheets">
                        Export to Google Doc
                    </el-dropdown-item> -->
                    <el-dropdown-item
                        id="wireSizeCalculator">
                        <router-link :to="'/wireSizeCalculator/'+this.designId">  
                            Wire Size Calculator
                        </router-link>
                    </el-dropdown-item>

                    <el-dropdown-item
                        id="detailedBOM"
                        v-if="isBOMEnabled"
                        @click.native="redirectToDetailedBOM">

                       Detailed BOM
                    </el-dropdown-item>
                    <el-dropdown-item
                        id="detailedBOM"
                        @click.native="redirectToDatasheet">
                       Export Datasheet
                    </el-dropdown-item>


                </el-dropdown-menu>
            </el-dropdown>
            <ShareRecordedVideoDialog
            :isShareVideoDialogVisible.sync="isShareVideoPopupOpen"
            :videoLink="recordedVideoLink"/>
            <reportPageSelectDialog
            :isReportPageSelectDialogVisible.sync="isReportPageSelectDialogVisible"
            :profileData="profileData"
            :projectData="projectData"/>
            <el-tooltip v-if="!is_request_expert_service && isAccountSubscribed" effect="dark" placement="top-start" content="Copy Design">
                <button class="action_btn icon copy-alt"
                    
                    :disabled="isDuplicatingDesign"
                    :class="{disable_design: isDesignDisabled(order_status)}"
                    @click="openPopupToDuplicate"
                > 
                </button>
            </el-tooltip>
            <div class='duplicate-design-dialog'>
                <el-dialog
                    title="Duplicate Design"
                    :visible="isDuplicatePopupOpen"
                    :close-on-click-modal="false"
                    @close='isDuplicatePopupOpen = false'
                >
                    <el-form
                        style="text-align: left"
                        label-position="left"
                        label-width="150px"
                        size="small"
                        @submit.native.prevent
                    >
                        <el-form-item label="Design Name">
                            <el-input
                                v-model="duplicateDesignName"
                                placeholder="Design Name"
                                name="Design Name"
                            />
                            <!-- <p class="formErrors"><span>{{ errors.first('Design Name') }}</span></p> -->
                        </el-form-item>
                    </el-form>
                    <div class='confirm-button'>
                        <button class='confirm-btn' @click="duplicateDesign">
                            <span v-if="!isDuplicatingDesign">Duplicate</span>
                            <span v-else class="el-icon-loading"></span>
                        </button>
                    </div>
                </el-dialog>
            </div>
            <el-tooltip v-if="!is_request_expert_service && isAccountSubscribed" effect="dark" placement="top-start" content="Delete Design">
                <button
                    v-if="!is_request_expert_service && isAccountSubscribed" 
                    class="action_btn" 
                    :class="{disable_design: isDesignDisabled(order_status)}" 
                    @click="isDeleteProjectPopupOpen=true"
                >
                    <span class="icon delete-alt"></span>
                </button>
            </el-tooltip>
            <!-- <el-tooltip v-if="videoGenerationStatus == 'idle'" effect="dark" placement="top-start" content="Record a 3D video of the design">
            <button
                v-if="videoGenerationStatus == 'idle'"
                class="action_btn"
                :class="{disable_design: isDesignDisabled(order_status)}" 
                @click="request3DVideo"
            >
                <span class="icon">
                    <img src="../../assets/img/video.svg" width="20" alt="Video" />
                </span>
            </button>
            </el-tooltip> -->
            <el-tooltip v-if="videoGenerationStatus == 'active'" effect="dark" placement="top-start" content="Video recording is in progress. Link to share will be available shortly.">
            <button v-if="videoGenerationStatus == 'active'" class="action_btn">
                <span class="icon spinning">
                    <img src="../../assets/img/spinner-solid.svg" width="20" alt="Video" />
                </span>
            </button>
            </el-tooltip>
            <el-tooltip v-if="videoGenerationStatus == 'complete'" effect="dark" placement="top-start" content="Share video link">
            <button v-if="videoGenerationStatus == 'complete'" class="action_btn" @click="isShareVideoPopupOpen = true">
                <span class="icon">
                    <img src="../../assets/img/video-complete.svg" width="20" alt="Video" />
                </span>
            </button>
            </el-tooltip>
            <!-- <el-dropdown trigger="click" :class="{disable_design: isDesignDisabled(order_status)}">
                <span class="el-dropdown-link">
                    <el-tooltip effect="dark" placement="top-start" content="Share video link">
                    <button v-if="videoGenerationStatus == 'complete'" class="action_btn">
                        <span class="icon share-alt"></span>
                    </button>
                    </el-tooltip>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                        @click.native="copyLinkToRecordedVideo">
                        <span class="icon">
                            <img src="../../assets/img/copy.svg"/>
                        </span>
                        Copy Link
                    </el-dropdown-item>
                    <el-dropdown-item
                        @click.native="shareVideoLinkOnWhatsApp">
                        <span class="icon">
                            <img src="../../assets/img/whatsapp.svg"/>
                        </span>
                        Share Link on WhatsApp
                    </el-dropdown-item>
                    <el-dropdown-item
                        @click.native="shareVideoLinkOnEmail">
                        <span class="icon">
                            <img src="../../assets/img/mail.svg"/>
                        </span>
                        Share via Email
                    </el-dropdown-item>
                    <el-dropdown-item
                        @click.native="downloadRecordedVideo">
                        <span class="icon">
                            <img src="../../assets/img/download.svg"/>
                        </span>
                        Download Video
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown> -->
            <DeleteDesign 
                v-if="isDeleteProjectPopupOpen"
                :isDeleteProjectPopupOpen="isDeleteProjectPopupOpen" 
                @confirmDelete="deleteDesign()"
                @cancelDelete="isDeleteProjectPopupOpen = false"
            />  

            <checksPopUpForDetailedBOM
            :isChecksPopUpForDetailedBOMVisible = "isChecksPopUpForDetailedBOMVisible"
            :isDCSizeInRange ="isDCSizeInRange"
            @cancelDelete="isChecksPopUpForDetailedBOMVisible = false"/>
          </div>
</template>

<script>
import API from '@/services/api/';
import { mapActions, mapState } from "pinia";
import { useDesignStore } from '../../../../stores/design';
import editDesignNameDialog from './designNameEditDialog.vue';
import reportPageSelectDialog from './reportPageSelectDialog.vue';
import checksPopUpForDetailedBOM from './checksPopUpForDetailedBOM.vue';
import ShareRecordedVideoDialog from './shareRecordedVideoDialog.vue';
import DeleteDesign from './deleteDesign.vue';
import * as XLSX from 'xlsx';
import {
    isTataOrg,
    isAccountSubscribed,
} from '../../../../utils';

export default {
    
    components: {
        editDesignNameDialog,
        reportPageSelectDialog,
        checksPopUpForDetailedBOM,
        DeleteDesign,
        ShareRecordedVideoDialog
    },
     data() {
        return {
            msg: 'I am in designSummaryHeader',
            designId: this.$route.params.designId,
            isEditDesignNameDialogVisible: false,
            isReportPageSelectDialogVisible: false,
            reportUrl: '',
            isDownloading: false,
            isAutoCadEnabled: false,
            isDocsEnabled: false,
            isDuplicatingDesign: false,
            excludedOrganisations: [],
            projectData: {},
            is_heaven_solar_integrated: false,
            showlogoutconfirmbox: false,
            isDuplicatePopupOpen: false,
            duplicateDesignName: '',
            isChecksPopUpForDetailedBOMVisible:false,
            isDCSizeInRange:false,
            isDeleteProjectPopupOpen: false,
            projectTobeDeleted:{},
            isBOMEnabled:false,
            videoGenerationStatus: 'idle', // idle, active, complete
            isShareVideoPopupOpen: false,
            recordedVideoLink: '',
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            designName: state => state.name,
            projectId: state => state.project.id,
            referenceId: state => state.versions.reference_id,
            is_exported_heaven_solar: state => state.is_exported_heaven_solar,
            order_status: state => state.request_expert_service.order_status,
            is_request_expert_service: state => Object.keys(state.request_expert_service).length ? true: false,
            summary: 'GET_DESIGN_INFORMATION',
            profileData: 'GET_DESIGN_VERSION_SETTINGS',
            designImageUrl: 'GET_DESIGN_IMAGE'
        }),
        showDownloadDropdown() {
            return !isTataOrg();
        },
        isItTataOrganisation(){
            return isTataOrg()
        },
        flagForUS(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
        },
        isAccountSubscribed
    },
     mounted() {
        this.fetchAddOnsPermissions();
    },

    methods: {

        isStatusRejected(status){
            if(status=='rejected')
            return true;
            else 
            return false;
        },
        isStatusCancelled(status){
            if(status=='cancelled')
            return true;
            else 
            return false;
        },

        isDesignDisabled(status){
            if(this.isStatusCancelled(status) || this.isStatusRejected(status)){
                return true;
            }
            else
            return false;
        },
        getOrderStatus(orderStatus){
            switch(orderStatus){
                case 'incomplete':
                return 'Incomplete'
                break;
                case 'pending':
                return 'Pending'
                break;
                case 'in_process':
                return 'In Process'
                break;
                case 'on_hold':
                return 'On Hold'
                break;
                case 'complete':
                return 'Complete'
                break;
                case 'cancelled':
                return 'Cancelled'
                break;
            }
        },
        ...mapActions(useDesignStore, {
            STORE_DESIGN_VERSION: 'STORE_DESIGN_VERSION',
        }),
        redirectToWireSize(){
            //  let id = this.designId;
            //  console.log(id);
            //  console.log(this.$router);
             this.$router.push({ name: 'wireSizeCalculator', params: {designId: this.designId} });
            //  this.$router.push({ name: 'projectSummary', params: { projectId: this.projectId } });
        },

        moveToProjectSummary(){
              this.$router.push({
                        name: 'projectSummary',
                        params: { projectId: this.projectId },
                    });
        },
        async leadToStudio() {
            try {
                // routing to studio
                this.$router.push({
                    name: 'studio',
                    params: { designId: this.designId },
                });
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader in leadToStudio');
            }
        },

        // Report api call for design summary report pdf with checked Tata Power organization
        async downloadReportCall() {
            try {
                // checked for Pricing called api
                const response = await API.DESIGNS.FETCH_REPORT(this.designId, 'shadow-analysis');

                const reportdUrl = response.data;
                this.downloadFileHelper(reportdUrl, '.pdf');
                this.isDownloading = false;
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: downloadReport failed');
                // for any status code
                this.isDownloading = false;

                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error downloading Report. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },


        async deleteDesign() {
            this.showlogoutconfirmbox = true;
            this.isDeleteProjectPopupOpen = true;

            try{
                await API.DESIGNS.DELETE_DESIGN(this.designId);
                this.isDeleteProjectPopupOpen = false;
                this.$router.push({
                    name: 'projectSummary',
                    params: { projectId: this.projectId },
                });
            }
            catch(error){
                console.error(error)
                let errorMessage = error.response.status === 403 ?
                                   "You don't have permission to edit this project." :
                                   "error"
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: "error",
                    center: true
                })
                this.isDeleteProjectPopupOpen = false;
            }
        },



        async downloadAutoCadExport() {
            this.isDownloading = true;

            try {
                const response = await API.DESIGNS.FETCH_AUTO_CAD(this.designId);
                const autoCadUrl = response.data;
                this.isDownloading = false;
                this.downloadFileHelper(autoCadUrl, '.dxf');
                this.downloadImage(this.designImageUrl, this.referenceId+'.png');
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: downloadAutoCad failed');
                // for any status code
                this.isDownloading = false;

                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error downloading autoCad. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },

        redirectToDetailedBOM(){
            let ac =    this.summary.acSize;
            let dc =    this.summary.nameplateDcSize;
            if(ac * dc ===0){
                this.isChecksPopUpForDetailedBOMVisible=true;
                this.isDCSizeInRange=true;
            }
            // to check range between 10KW to 1MW and this nameplateDCSize is already in KW
            else if((this.summary.nameplateDcSize)*1000 <10000 || (this.summary.nameplateDcSize)*1000 >1000000){ 
                this.isChecksPopUpForDetailedBOMVisible=true;
                this.isDCSizeInRange=false;
            }
            else{
            this.isDCSizeInRange=true;
            this.$router.push({ name: 'detailedBOM', params: {designId: this.designId} });
            }
        },

        redirectToDatasheet() {
            this.$router.push({ name: 'datasheet', params: {designId: this.designId} });
        },

        async downloadCSVExport() {
            this.isDownloading = true;
            try {
                const response = await API.DESIGNS.FETCH_GENERATION_CSV(this.designId);
                const csvUrl = response.data;
                this.isDownloading = false;
                this.downloadFileHelper(csvUrl, '.csv');
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: downloadCSVExport failed');
                // for any status code
                this.isDownloading = false;
                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error downloading CSV. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        async downloadDwgPropsExport() {
            this.isDownloading = true;
            try {
                const response = await API.DESIGNS.FETCH_DWG_PROPS(this.designId);
                const data = response.data;
                this.isDownloading = false;
                this.downloadDwgProps(data);
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: downloadExcelExport failed');
                // for any status code
                this.isDownloading = false;
                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error downloading Excel. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        // Report api call for design summary report pdf with checked Tata Power organization
        async downloadReport() {
            // Cache solar access for faster report download
            const cacheSolarAccess = API.DESIGNS.CACHE_SOLAR_ACCESS(this.designId);
            let responseDesign = API.DESIGNS.FETCH_DESIGN(this.designId);
            this.isDownloading = true;
            Promise.all([cacheSolarAccess,responseDesign]).then((result) => {
                responseDesign = result[1];
                this.projectData = responseDesign.data.project;
                const user = JSON.parse(localStorage.getItem('user'));
                const organisation_id = user.organisation_id;
                if(this.showDownloadDropdown) {
                    if (this.excludedOrganisations.indexOf(organisation_id) === -1) {
                        this.isReportPageSelectDialogVisible = true;
                    }
                    else {
                        this.downloadReportCall()
                    }
                } else {
                    if(responseDesign.data.pricing.length !==0 && responseDesign.data.pricing[0]["roi"]) {
                        this.downloadReportCall()
                    } else {
                        alert("Kindly fill project consumption details and pricing information download the report");
                    }
                }
                this.isDownloading = false;
            }).catch(() => {
                this.isDownloading = false;
            })
        },

        async downloadDocsAndSheets() {
            this.isDownloading = true;

            try {
                const response = await API.REPORTS.DOWNLOAD_GOOGLE_DOC(this.referenceId);
                const googleDocsLink = response.data.google_docs;
                window.open(googleDocsLink);
                this.isDownloading = false;
            }
            catch (e) {
                this.isDownloading = false;

                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error opening Google Docs. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },

        async fetchAddOnsPermissions() {
            try {
                // Cache solar access for faster report download
                if(this.isItTataOrganisation){
                    const cacheSolarAccess = API.DESIGNS.CACHE_SOLAR_ACCESS(this.designId);
                    const get_heat_map = API.DESIGNS.GET_HEAT_MAP(this.designId);
                }
                const response = await API.FEATURE_STATUS.GET_FEATURES_STATUS();
                let localAddon = response.data;
                localStorage.setItem('addon',  JSON.stringify(localAddon))
                const organisation_id = JSON.parse(localStorage.getItem('user')).organisation_id
                // const organisation = await API.DESIGNS.GET_ORGANISATION(organisation_id);
                const responseData = JSON.parse(localStorage.getItem('organisation')) || {};
                this.is_heaven_solar_integrated = responseData.is_heaven_solar_integrated;
                if(!Object.keys(responseData).length){
                    const organisation = await API.DESIGNS.GET_ORGANISATION(organisation_id);
                    this.is_heaven_solar_integrated = organisation.data.is_heaven_solar_integrated;
                }
                // this.is_heaven_solar_integrated = organisation.data.is_heaven_solar_integrated;
                const featuresPermissions = response.data.results[0]; // Dont change this to responseData as it is coming from  API.FEATURE_STATUS.GET..
                this.isAutoCadEnabled = featuresPermissions.autocad_enabled;
                this.isDocsEnabled = featuresPermissions.docs_export_enabled;
                this.isStlEnabled = featuresPermissions.stl_export_enabled;
                this.isthreedsEnabled = featuresPermissions.threeds_export_enabled;
                this.isBOMEnabled =  JSON.parse(localStorage.getItem('user')).is_bom_enabled;
            }
            catch (e) {
                console.error();
            }
        },
        openPopupToDuplicate() {
            this.duplicateDesignName = this.designName + '(Copy)';
            this.isDuplicatePopupOpen = true;
        },
        async duplicateDesign() {
            try {
                this.isDuplicatingDesign = true;
                const response = await API.DESIGNS.DUPLICATE_DESIGN(this.designId, this.duplicateDesignName);
                this.$router.push(`/designSummary/${response.data}`);
                this.$router.go();
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: duplicate design failed', e);
                this.isDuplicatingDesign = false;
                // Error message
                let errorMessage = e.response.status === 403 ? 
                                    "You don't have permission to edit this project." :
                                    'Error duplicating design, Try again.'
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: 'error',
                    center: true
                });
                this.isDuplicatePopupOpen = false;
            }
            // setTimeout is required because router.go takes time to route,
            // before that button gets re-enabled.
            setTimeout(() => {
                this.isDuplicatingDesign = false;
            }, 1000);
        },

        async request3DVideo() {
            this.videoGenerationStatus = 'active'

            this.$message({
                showClose: true,
                message: 'Recording started. It will be available shortly.',
                type: 'info',
                center: true
            });

            // const response = await API.DESIGNS.REQUEST_3D_VIDEO_OF_DESIGN(this.designId);
            const response = await API.DESIGNS.REQUEST_3D_VIDEO_OF_DESIGN(this.designId);
            this.recordedVideoLink = response.data

            this.videoGenerationStatus = 'complete'
        },

        downloadFileHelper(url, extension) {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.setAttribute('download', this.designId + extension); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        },

        mmToInches(value) {
            const inches = parseInt(value)/25.4;
            return inches.toFixed(2);
        },

        downloadDwgProps(data) {
            const ws_data =[
                ['NAME', 'VALUE'],
            ];
            // getting pv breaker value from calculated value
            let pv_breaker = parseFloat(data.pv_breaker);
            if (pv_breaker <= 20) {
                pv_breaker = 20;
            } else if (pv_breaker % 10 === 0 && data.pv_breaker !== pv_breaker) {
                pv_breaker++;
            }
            if (pv_breaker % 10 !== 0) {
                pv_breaker = pv_breaker + (10 - (pv_breaker % 10));
            }

            for (let i = 0; i < data.modules.length; i++) {
                ws_data.push([`Module manufacturer name#${i+1}`,data.modules[i].manufacturer_name]);
                ws_data.push([`Module model name#${i+1}`,data.modules[i].model]);
                ws_data.push([`Module watt#${i+1}`,data.modules[i].watt]);
                if (i=== 0) {
                    ws_data.push([`No. of modules`,data.moduleCount]);
                }
                ws_data.push([`Module Weight#${i+1}`,data.modules[i].weight]);
                ws_data.push([`Module length#${i+1}`,this.mmToInches(data.modules[i].length)]);
                ws_data.push([`Module width#${i+1}`,this.mmToInches(data.modules[i].width)]);
                ws_data.push([`Module Imp#${i+1}`,data.modules[i].Imp]);
                ws_data.push([`Mod Vmp#${i+1}`,data.modules[i].Vmp]);
                ws_data.push([`Mod Voc#${i+1}`,data.modules[i].Voc]);
                ws_data.push([`PV module Isc#${i+1}`,data.modules[i].Isc]);
                ws_data.push([`Module Thickness#${i+1}`,this.mmToInches(data.modules[i].thickness)]);
                ws_data.push([`Module Temp. Coeff#${i+1}`,data.modules[i].voltage_temp_coeff]);
            }
            for (let i = 0; i < data.inverters.length; i++) {
                ws_data.push([`Inverter manufacturer name#${i+1}`,data.inverters[i].manufacturer_name]);
                ws_data.push([`Inverter Model name#${i+1}`,data.inverters[i].model]);
                ws_data.push([`Inv Max Output Current#${i+1}`,data.inverters[i].max_output_current]);
                if (i === 0) {
                    ws_data.push([`No. of Inv`,data.inverterCount]);
                }
                ws_data.push([`Inverter Watt#${i+1}`,'']);  // No Data Available as of now
                ws_data.push([`Efficiency of Inverter#${i+1}`,data.inverters[i].euro_efficiency]);              
                if(data.inverters[i].max_branch_length) {
                    ws_data.push([`Max. Branch length#${i+1}`,data.inverters[i].max_branch_length]); 
                }
                ws_data.push([`INV1-String#${i+1}`,data.inverters[i].strings]);
                if (data.inverters[i].optimizerCount) {
                    ws_data.push([`Optimizer Name#${i+1}`,data.inverters[i].optimizer_make]);
                    ws_data.push([`Optimizer Watt#${i+1}`,data.inverters[i].optimizer_watt]);
                    ws_data.push([`Optimizer current#${i+1}`,data.inverters[i].optimizer_current]);
                }
                if (data.optimizerCount) {
                    ws_data.push(['Number of Optimizers',data.optimizerCount]);
                }
            }
            ws_data.push(['Cust. Name',data.customer_name]);
            ws_data.push(['Coordinate',`(${data.latitude}, ${data.longitude})`]);
            ws_data.push(['Weather Station',data.weather_station]);
            ws_data.push(['Utility',data.utility_provider]);
            ws_data.push(['AHJ',data.AHJName]);
            ws_data.push(['Attachment Count',data.attachment_count]);
            ws_data.push(['Attachment Max. spacing',data.max_attachment_spacing]);
            ws_data.push(['Total Area',data.totalRoofArea]);
            for (let i = 0; i < data.roof_data.length; i++) {
                ws_data.push([`Roof#${i+1} module count`,data.roof_data[i].no_of_modules]);
                ws_data.push([`Roof#${i+1} Azimuth`,data.roof_data[i].azimuth]);
                ws_data.push([`Roof#${i+1} Tilt`,data.roof_data[i].tilt]);
            }
            if (data.pv_breaker === 0){
                ws_data.push(['PV Breaker','']);
            } else {
                ws_data.push(['PV Breaker',pv_breaker]);
            }
            ws_data.push(['Date',data.project_created_at.split('T')[0]]);

            //Empty Rows
            ws_data.push(['Load Center','']);
            ws_data.push(['Seam Spacing','']);
            ws_data.push(['Wind Exposure','']);
            ws_data.push(['Wind Speed','']);
            ws_data.push(['Snow Load','']);
            ws_data.push(['Main Breaker (E or N)','']);
            ws_data.push(['MSP(E or N)','']);
            ws_data.push(['RAIL','']);
            ws_data.push(['Attachment','']);
            ws_data.push(['Story','']);
            ws_data.push(['Disconnect Type','']);
            ws_data.push(['2% Temp','']);
            ws_data.push(['Low Temperature','']);
            ws_data.push(['Roof member size','']);
            ws_data.push(['Roof Member','']);
            ws_data.push(['Utility ESID no.','']);
            ws_data.push(['AC AMP','']);
            ws_data.push(['Roof type','']);
            ws_data.push(['Cust Street Name','']);
            ws_data.push(['Cust BLDG No','']);
            ws_data.push(['Country','']);
            ws_data.push(['Cust State ZIP','']);
            ws_data.push(['Cust City','']);
            ws_data.push(['Main Breaker','']);
            ws_data.push(['MSP','']);
            ws_data.push(['Roof Member Spacing','']);
            ws_data.push(['APN','']);

            const wb= XLSX.utils.book_new();
            wb.Props = {
                Title: "FirstTry",
                Subject: "TestFile",
                Author: "Yash Rao",
                CreatedDate: new Date(2023,2,17),
            }
            wb.SheetNames.push("INPUT");
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["INPUT"] = ws;
            const wbout = XLSX.write(wb, {bookType:'xlsx', type: 'binary'})
            const buf = new ArrayBuffer(wbout.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i < wbout.length; i++){
                view[i] = wbout.charCodeAt(i) & 0xff;
            }
            const blobData = new Blob([buf], { type: "application/octet-stream" });
            try {
                saveAs(blobData, `${data.customer_name} - ${data.weather_station}.xlsx`);
                return Promise.resolve(true);
            }
            catch (error) {
                return Promise.reject(error);
            }
        },

        async downloadImage(imageSrc,imgName) {
            const image = await fetch(imageSrc)
            const imageBlog = await image.blob()
            const imageURL = URL.createObjectURL(imageBlog)

            const link = document.createElement('a')
            link.href = imageURL
            link.download = imgName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },

        goToProjectPage() {
            this.$router.push({ name: 'projectSummary', params: { projectId: this.projectId } });
        },
        async export_to_heaven_solar() {
            try {
                const is_exported = await API.DESIGNS.export_to_heaven_solar(this.designId);
                //this.is_exported_heaven_solar = true
                window.open(is_exported.data);
            } catch (e) {
                alert(e.message)
            }
        },

        goBack() {
            window.history.length > 1
                ? this.$router.go(-1)
                : this.$router.push('/')
        },
    },
};
</script>

<style scoped>
.disable_design {
  opacity: 0.5;
  pointer-events: none;
}

a {
    text-decoration: none;
    color: inherit;
    display: contents;
}

.backButton {
    font-size: 23px;
    color: #303133;
}

 .backButton:hover {
    font-weight: bold;
    cursor: pointer;
}
.group_title .duplicate-design-dialog >>> .el-dialog{
  width: fit-content;
  border-radius: 12px;
  height: auto;
}
.group_title .duplicate-design-dialog >>> .el-dialog__header{
  background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
  display: flex;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
}
.group_title .duplicate-design-dialog >>> .el-dialog__title{
  color: black !important;
}
.group_title .duplicate-design-dialog >>> .el-form-item--small.el-form-item{
  margin: 18px 7.5px;
}

.group_title .duplicate-design-dialog >>> .el-dialog__close{
    font-weight: 800;
    font-size: 18px;
    color: #222;
}

 .el-form-item__content{
    margin-left: 0;
    display: inline-block;
}
#app > div > main > div:nth-child(3) > section > div > div > div.group_title > div.duplicate-design-dialog > div > div > div.el-dialog__body > form > div > div{
    margin-left: 0;
    display: inline-block;
}

.group_title .duplicate-design-dialog .confirm-button{
  display: flex;
  justify-content: space-around;
}
.group_title .confirm-btn{
  background: #409EFF !important;
  color: white;
  border-radius: 4px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.55rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  border: none;
  background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
  font-family: HelveticaNeue;
  font-size: 18px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
    /* line-height: 3.89; */
  letter-spacing: normal;
  text-align: center;
  margin-bottom: 20px;
}
.group_title .action_btn {
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}

.spinning {
    animation:spin 2s linear infinite;
}

@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>


<style lang="scss" scoped>

    @import '../../../../styles/pages/project-design-pages';
    @import '../../../../styles/components/button';

</style>