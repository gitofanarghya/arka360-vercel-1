<template>
    <div
        v-loading.fullscreen.lock="isDownloading"
        id="designSummaryHeader"
        class="width-hundred-percent"
    >
        <div
            style="min-height: 55px; display: flex; align-items: center; margin: 0 0 10px 0">
            <div class="designSummaryHeading">
                <button
                    class="el-icon-arrow-left icon_size_header"
                    style="cursor:pointer; left: -40px; position: absolute;"
                    @click="goToProjectPage"/>
                <div
                    class="page-header"
                    style="margin: 0 10px 0 0">
                    {{ designName }}
                </div>
            </div>
            <el-tooltip
                :visible-arrow="false"
                effect="light"
                content="Edit in Studio"
                placement="right"
                popper-class="customLightPopper"
            >
                <div class="allPagesIcons">
                    <button
                        class="el-icon-edit-outline button-light-theme-icons"
                        style="font-size: 30px; padding: 0"
                        @click="leadToStudio"/>
                </div>
            </el-tooltip>
        </div>
        <div style="float: left;">
            <button
                class="el-icon-edit button-light-theme-icons"
                @click="isEditDesignNameDialogVisible = true"/>

            <!-- <button

                class="el-icon-download button-light-theme-icons"
                @click="downloadReport"
                /> -->
            <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                    <button
                        class="el-icon-download button-light-theme-icons"/>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <div
                        :class="[(summary.nameplateDcSize == 0 || summary.acSize == 0) ?
                        'cursorNotAllowed' : '']">
                        <el-dropdown-item
                            id="reportExportButton"
                            :disabled="summary.nameplateDcSize == 0 || summary.acSize == 0"
                            @click.native="downloadReport">
                            Download Report
                        </el-dropdown-item>
                    </div>
                    <div
                        :class="[(summary.nameplateDcSize == 0 || summary.acSize == 0) ?
                        'cursorNotAllowed' : '']">
                        <el-dropdown-item
                            id="reportExportButton"
                            v-if="is_heaven_solar_integrated"
                            :disabled="summary.nameplateDcSize == 0 || summary.acSize == 0 || !isAutoCadEnabled || is_exported_heaven_solar || heaven_solar_export"
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
                        v-if="isDocsEnabled"
                        id="googleDocExportButton"
                        @click.native="downloadDocsAndSheets">
                        Export to Google Doc
                    </el-dropdown-item>
                     <el-dropdown-item
                        id="wireSizeCalculator"
                        @click.native="redirectToWireSize">
                        Wire Size Calculator
                    </el-dropdown-item>
                    <el-dropdown-item
                        id="detailedBOM"
                        @click.native="redirectToDetailedBOM">
                       Detailed BOM
                    </el-dropdown-item>

                </el-dropdown-menu>
            </el-dropdown>
            <button
                :disabled="isDuplicatingDesign"
                :class="(isDuplicatingDesign) ?
                    'el-icon-loading button-light-theme-icons' :
                'el-icon-document-copy button-light-theme-icons'"
                @click="duplicateDesign"/>
            <button
                class="el-icon-delete button-light-theme-icons"
                @click="deleteDesign"/>
        </div>
        <editDesignNameDialog
            :is-edit-design-name-dialog-visible.sync="isEditDesignNameDialogVisible"
            :design-name="designName"/>
        <reportPageSelectDialog
            :isReportPageSelectDialogVisible.sync="isReportPageSelectDialogVisible"
            :profileData="profileData"
            :projectData="projectData"/>

        
    </div>
</template>
<script>
import API from '@/services/api/';
import editDesignNameDialog from './designNameEditDialog.vue';
import reportPageSelectDialog from './reportPageSelectDialog.vue';
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../../stores/design';
import { isTataOrg } from '../../../../utils';

export default {
    name: 'DesignSummaryHeader',
    components: {
        editDesignNameDialog,
        reportPageSelectDialog,
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
            heaven_solar_export: false,
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            designName: state => state.name,
            projectId: state => state.project.id,
            referenceId: state => state.versions.reference_id,
            is_exported_heaven_solar: state => state.is_exported_heaven_solar,
            summary: 'GET_DESIGN_INFORMATION',
            profileData: 'GET_DESIGN_VERSION_SETTINGS'
        }),
        showDownloadDropdown() {
            return !isTataOrg()
        },
    },
    mounted() {
        this.fetchAddOnsPermissions();
    },
    methods: {
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
            const answer = window.confirm('Are you sure you want to delete the design?');

            if (answer) {
                try {
                    await API.DESIGNS.DELETE_DESIGN(this.designId);

                    this.$message({
                        showClose: true,
                        message: 'Design deleted successfully.',
                        type: 'success',
                        center: true
                    });
                    this.$router.push({
                        name: 'projectSummary',
                        params: { projectId: this.projectId },
                    });
                }
                catch (e) {
                    this.$message({
                        showClose: true,
                        message: 'Error deleting design. Try again.',
                        type: 'error',
                        center: true
                    });
                }
            }
        },

        async downloadAutoCadExport() {
            this.isDownloading = true;

            try {
                const response = await API.DESIGNS.FETCH_AUTO_CAD(this.designId);

                const autoCadUrl = response.data;
                this.isDownloading = false;
                this.downloadFileHelper(autoCadUrl, '.dxf');
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
             this.$router.push({ name: 'detailedBOM', params: {designId: this.designId} });
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

        // Report api call for design summary report pdf with checked Tata Power organization

        async downloadReport() {
            // Cache solar access for faster report download
            const cacheSolarAccess = API.DESIGNS.CACHE_SOLAR_ACCESS(this.designId);
            let responseDesign = API.DESIGNS.FETCH_DESIGN(this.designId);
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
                    this.isDownloading = true;
                    this.downloadReportCall()
                }
            } else {
                if(responseDesign.data.pricing.length !==0 && responseDesign.data.pricing[0]["roi"]) {
                    this.isDownloading = true;
                    this.downloadReportCall()
                } else {
                    alert("Kindly fill project consumption details and pricing information download the report");
                }
            }
            });
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
                const cacheSolarAccess = API.DESIGNS.CACHE_SOLAR_ACCESS(this.designId);
                const get_heat_map = API.DESIGNS.GET_HEAT_MAP(this.designId);
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
            }
            catch (e) {
                console.error();
            }
        },

        async duplicateDesign() {
            try {
                this.isDuplicatingDesign = true;
                const response = await API.DESIGNS.DUPLICATE_DESIGN(this.designId);
                this.$router.push(`/designSummary/${response.data}`);
                this.$router.go();
            }
            catch (e) {
                console.error('ERROR: designSummaryHeader: duplicate design failed', e);
                this.isDuplicatingDesign = false;
                // Error message
                this.$message({
                    showClose: true,
                    message: 'Error duplicating design. Try again.',
                    type: 'error',
                    center: true
                });
            }
            // setTimeout is required because router.go takes time to route,
            // before that button gets re-enabled.
            setTimeout(() => {
                this.isDuplicatingDesign = false;
            }, 1000);
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

        goToProjectPage() {
            this.$router.push({ name: 'projectSummary', params: { projectId: this.projectId } });
        },
        async export_to_heaven_solar() {
            try {
                const is_exported = await API.DESIGNS.export_to_heaven_solar(this.designId);
                this.heaven_solar_export = true
                window.open(is_exported.data);
            } catch (e) {
                alert(e.message)
            }
        }
    },
};
</script>

<style type="text/css">

    .cursorNotAllowed {
        cursor: not-allowed;
    }

    #designSummaryHeader {
        width: 100%;
    }

    #designSummaryHeader .headerText {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 3em;
        font-weight: bold;
        color: black;
    }

    #designSummaryHeader .headerButtons {
        display: flex;
        align-items: center;
        height: 100%;
        justify-content: flex-end;
    }

    .buttons_header {
        padding: 5px;
        color: #606266;
    }
</style>

<style lang="scss" scoped>
    .icon_size_header {
        font-size: 30px;
        cursor:pointer;
        outline: none;
        border: transparent;
        background-color: transparent;
        margin-left: -15px;

        &:hover {
            font-weight: bold;
        }
    }

    .designSummaryHeading {
        display: flex;
        align-items: center;
        position: relative;
    }

    .button-light-theme-icons {
        padding: 5px 7px 5px 7px;
        font-size: 1.6vw;
        color: #707070;
    }
</style>

<style type="text/css">
/*styling of edit in studio tooltip*/

.customLightPopper {
    color: #606266;
    background-color: #fff !important;
    border: 1px solid #f2f2f2 !important;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
    -wsebkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.customLightPopper:before {
    position: absolute;
    left: -14px;
    top: 11px;
    content: '';
    height: 0;
    width: 0;
    border: 7px solid transparent !important;
    z-index: 1;
    border-right-color: #f2f2f2 !important;
}

.customLightPopper:after {
    position: absolute;
    left: -12px;
    top: 11px;
    content: '';
    height: 0;
    width: 0;
    border: 7px solid transparent !important;
    z-index: 2;
    border-right-color: white !important;
}
</style>

<style lang="scss" scoped>

    @import '../../../../styles/pages/project-design-pages';
    @import '../../../../styles/components/button';

</style>
