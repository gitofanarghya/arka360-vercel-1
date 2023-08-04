<template>
    <div class="" v-loading.fullscreen.lock="isLoading">
        <Navbar @handleToggleSideBar="handleSidebar"/>
        <main class='main-controller'>
            <div class='backdrop'></div>
            <Sidebar :isSidebarOpen="isSidebarOpen"/>
            <DesignSummary
            v-if="!isLoading"
            :isLoading="isLoading"/>
        </main>
    </div>
</template>

<script>
import Navbar from '../../components/ui/newNavbar.vue';
import Sidebar from '../../components/ui/sidebar.vue';
import DesignSummary from './designSummary.vue';
import { mapActions, mapState } from 'pinia';
import { useDesignStore } from '../../stores/design';
import { isTataOrg, reportPagesPlainListUs } from '../../utils';

export default {
    components:{
        Navbar,
        Sidebar,
        DesignSummary,
    },

    created() {
        this.getDesignDetails();
    },
    data() {
        return {
            isSidebarOpen: false,
            isLoading:true,
            tempReportDefaults: {},
            totalPages: reportPagesPlainListUs
        }
    },
    methods:{
        handleSidebar(isSidebarOpen){
            this.isSidebarOpen = isSidebarOpen;
        },
        ...mapActions(useDesignStore, {
            SET_DESIGN: 'SET_DESIGN',
            UPDATE_DESIGN_VERSION_SETTINGS: "UPDATE_DESIGN_VERSION_SETTINGS",
        }),
        async getDesignDetails() {
            try {
                await this.SET_DESIGN(this.$route.params.designId);
                if(!this.designVersionSettingsData.report_defaults.template_name || !this.designVersionSettingsData.report_defaults.report_type){
                    if(isTataOrg()){
                        this.tempReportDefaults = JSON.parse(JSON.stringify(this.designVersionSettingsData.report_defaults));
                        this.tempReportDefaults['template_name'] = 'tata_power';
                        this.tempReportDefaults['report_type'] = 'portrait';
                        let patchData = {
                         report_defaults: this.tempReportDefaults,
                        };
                        try{
                            await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
                        }
                        catch(e){
                            console.log(e);
                        }   
                    } else {
                        if(!this.isUSFlagEnabled){
                        this.tempReportDefaults = JSON.parse(JSON.stringify(this.designVersionSettingsData.report_defaults));
                        this.tempReportDefaults['template_name'] = 'solar_labs';
                        this.tempReportDefaults['report_type'] = 'portrait';
                        let patchData = {
                         report_defaults: this.tempReportDefaults,
                        };
                        try{
                            await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
                        }
                        catch(e){
                            console.log(e);
                        }   
                        }
                    }
                }
                else if(this.isUSFlagEnabled &&
                 ((this.designVersionSettingsData.report_defaults.template_name!='solar_labs_usa')
                 || (this.designVersionSettingsData.report_defaults.template_name=='solar_labs_usa'
                  && this.designVersionSettingsData.report_defaults.report_type!='portrait' ) ) ){
                    this.tempReportDefaults = JSON.parse(JSON.stringify(this.designVersionSettingsData.report_defaults));
                    this.tempReportDefaults['template_name'] = 'solar_labs_usa';
                    this.tempReportDefaults['report_type'] = 'portrait';
                    this.tempReportDefaults['pages'] = [...this.totalPages];
                    let patchData = {
                        report_defaults: this.tempReportDefaults,
                    };
                    try{
                        // await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
                    }
                    catch(e){
                        console.log(e);
                    }
                }
                else if (!this.isUSFlagEnabled && (!this.designVersionSettingsData.report_defaults.template_name || !this.designVersionSettingsData.report_defaults.report_type)){
                   this.tempReportDefaults = JSON.parse(JSON.stringify(this.designVersionSettingsData.report_defaults));
                    this.tempReportDefaults['template_name'] = 'solar_labs';
                    this.tempReportDefaults['report_type'] = 'landscape';
                    let patchData = {
                        report_defaults: this.tempReportDefaults,
                    };
                    try{
                        // await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
                    }
                    catch(e){
                        console.log(e);
                    }
                }
                this.isDesignGettingLoaded = false;
                this.isLoading = false;
            }
            catch (e) {
                console.error(e)
                if (e.response.status) {
                    if (e.response.status === 404 || e.response.status === 403) {
                        this.$message({
                            showClose: true,
                            message: 'Design not found. Redirecting to Home Page ...',
                            type: 'error',
                            center: true
                        });
                    }
                    else if (e.response.status === 500) {
                        this.$message({
                            showClose: true,
                            message: 'Error in loading design. Please try again.',
                            type: 'error',
                            center: true
                        });
                    }
                    setTimeout(()=>{ this.$router.goBackOrGoHome() }, 2000 );
                }
            }                
        },
    },
    computed:{
        ...mapState(useDesignStore, {
            designVersionSettingsData: "GET_DESIGN_VERSION_SETTINGS",
        }),
        isUSFlagEnabled(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
        },
        organisation_id(){
            const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
            return organisation_id;
        }
    }
}
</script>