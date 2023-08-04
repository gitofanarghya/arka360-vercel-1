<template>
    <div
        v-show="isthreedsEnabled || isStlEnabled || isDxfEnabled"
        id="export"
        class="navBarMidButtons">
        <el-dropdown
            v-if="isthreedsEnabled || isStlEnabled || isDxfEnabled"
            :append-to-body="false"
            trigger="click">
            <span class="el-dropdown-link">
                <el-button
                    :disabled="!exportEnabled || loading"
                    class="navBarIcon el-icon-download"/>
            </span>
            <el-dropdown-menu
                slot="dropdown"
                :append-to-body="false"
                class="exportDropdown">
                <el-dropdown-item
                    v-if="isStlEnabled"
                    id="sketchUpExportButton"
                    @click.native = "exportSTLFunc">
                    Export for Sketchup
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="isthreedsEnabled"
                    id="pvSystExportButton"
                    @click.native = "exportColladaFunc">
                    Export for PVsyst
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="isDxfEnabled"
                    id="SLDExportButton"
                    @click.native = "exportDXFFunc">
                    Export SLD as CAD
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="isDxfEnabled"
                    id="SLDExportButton"
                    @click.native = "exportDesignDXFFunc">
                    Export Design as CAD
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="isDxfEnabled"
                    id="VideoExportButton"
                    @click.native = "createVideo">
                    Record 3D Video
                </el-dropdown-item>
                <!-- <el-dropdown-item
                    v-if="isPdfEnabled"
                    id="PDFExportButton"
                    @click.native = "exportPDFFunc">
                    Export as PDF
                </el-dropdown-item> -->
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { SET_STL_EXPORT, SET_DAE_EXPORT, SET_DXF_EXPORT,SET_VIDEO_EXPORT, SET_DESIGN_DXF_EXPORT, SET_PDF_EXPORT } from '../../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import API from '@/services/api/';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarExportButton',
    data() {
        return {
            loading: false,
            isStlEnabled: false,
            isthreedsEnabled: false,
            isDxfEnabled: true,
            isPdfEnabled: true,
        };
    },
    nonReactiveData() {
        return {
            exportSTL: () => {},
            exportCollada: () => {},
            exportDXF: () => {},
            exportVideo: () => {},
            exportDesignDXF: () => {},
        };
    },
    computed: {
        ...mapState(useStudioTextTopBarStore, {
            exportEnabled: state => state.exportEnabled,
        }),
    },
    mounted() {
        this.$eventBus.$once(SET_STL_EXPORT, (exportSTL) => {
            this.exportSTL = exportSTL;
        });
        this.$eventBus.$once(SET_DAE_EXPORT, (exportCollada) => {
            this.exportCollada = exportCollada;
        });
        this.$eventBus.$once(SET_DXF_EXPORT, (exportDXF) => {
            this.exportDXF = exportDXF;
        });
        this.$eventBus.$once(SET_DESIGN_DXF_EXPORT, (exportDesignDXF) => {
            this.exportDesignDXF = exportDesignDXF;
        });
        this.$eventBus.$once(SET_PDF_EXPORT, (exportPDF) => {
            this.exportPDF = exportPDF;
        });
        this.$eventBus.$once(SET_VIDEO_EXPORT, (exportVideo) => {
            this.exportVideo = exportVideo;
        });
        this.fetchAddOnsPermissions();
    },
    methods: {
        async fetchAddOnsPermissions() {
            try {
                const response = await API.FEATURE_STATUS.GET_FEATURES_STATUS();
                const featuresPermissions = response.data.results[0];
                this.isStlEnabled = featuresPermissions.stl_export_enabled;
                this.isthreedsEnabled = featuresPermissions.threeds_export_enabled;
                // this.isDxfEnabled = featuresPermissions.threeds_export_enabled;
            }
            catch (e) {
                console.error();
            }
        },
        exportSTLFunc() {
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'Exporting',
                message: 'Design is being exported',
            });
            this.exportSTL().then(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }).catch((err) => {
                console.error(err)
                this.loading = false;
                notificationsAssistant.close(notification);
                notificationsAssistant.error({
                    title: 'Export',
                    message: 'Sketchup Export failed',
                });
            });
        },
        exportColladaFunc() {
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'Exporting',
                message: 'Design is being exported',
            });
            this.exportCollada().then(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }).catch((err) => {
                console.error(err)
                this.loading = false;
                notificationsAssistant.close(notification);
                notificationsAssistant.error({
                    title: 'Export',
                    message: 'PVsyst Export failed',
                });
            });
        },
        exportDXFFunc() {
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'Exporting',
                message: 'Design is being exported',
            });
            this.exportDXF().then(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }).catch(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
                notificationsAssistant.error({
                    title: 'Export',
                    message: 'DXF Export failed',
                });
            });
        },
        exportDesignDXFFunc() {
            // this.loading = true;
            // const notification = notificationsAssistant.loading({
            //     title: 'Exporting',
            //     message: 'Design is being exported',
            // });
            this.exportDesignDXF();
            // .then(() => {
            //     this.loading = false;
            //     notificationsAssistant.close(notification);
            // }).catch(() => {
            //     this.loading = false;
            //     notificationsAssistant.close(notification);
            //     notificationsAssistant.error({
            //         title: 'Export',
            //         message: 'Dessign DXF Export failed',
            //     });
            // });
        },
        createVideo(){
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'Recording Video',
                message: "Please do not exit the popup page",
            });
            this.exportVideo();
            setTimeout(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }, 3000);
        },
        exportPDFFunc() {
            this.loading = true;
            const notification = notificationsAssistant.loading({
                title: 'Exporting',
                message: 'Design is being exported',
            });
            this.exportPDF().then(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
            }).catch(() => {
                this.loading = false;
                notificationsAssistant.close(notification);
                notificationsAssistant.error({
                    title: 'Export',
                    message: 'PDF Export failed',
                });
            });
        },
    },
};
</script>

<style scoped>
.navBarMidButtons {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navBarMidButtons .navBarIcon {
    font-size: 1.25vw;
    border: none;
    background-color: inherit;
    color: white;
}
</style>

<style scoped>
    .exportDropdown {
        background-color: #141414;
        border: none;
        width: 180px;
        top: 2.3vw !important;
        z-index: 9999 !important;
        left: -85px !important;
    }

    .el-dropdown-menu {
        padding: 0
    }

    .exportDropdown .el-dropdown-menu__item {
        color: white !important;
        text-align: left;
    }

    .exportDropdown .el-dropdown-menu__item:hover {
        color: white;
        background-color: #a9a9a9 !important;
    }

    #export >>> .el-popper[x-placement^="bottom"] .popper__arrow {
        border-bottom-color: #141414;
        left: 51% !important;
        margin-right: 0 !important;
    }

    .is-disabled {
        color: #4c4c4c !important;
    }

    .el-icon-download {
        /*ensures that the size of all icons look similar*/
        font-size: 1.5vw !important;
    }
</style>
