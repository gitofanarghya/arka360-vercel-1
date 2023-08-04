<template>
    <div class="tabsParentContainer">
        <div class="backgroundCont">
            <el-tabs v-model="activeTab" @tab-click="onTabClick">
                <el-tab-pane :label="tab" :name="tab" v-for="tab in tabs" :key="tab">
                </el-tab-pane>
            </el-tabs>
        </div>
        <div v-if="activeTab == 'Design'" class="secBackground" v-loading="isLoadingDesign">
            <DesignCRM
                :key="counterKey"
                v-if="activeDesignSection == 'Design'"
                @viewDesignDetails="toggleDesignDetailsSection"
            />
            <DesignDetailCRM
                v-if="activeDesignSection == 'Design Summary'"
                @viewDesignDetails="toggleDesignDetailsSection"
            />
        </div>
        <div v-if="activeTab == 'Project Info'" class="tabBackground">
            <el-tabs class="projecttabsParentContainer" v-model="projectActiveTab">
                <el-tab-pane :label="projectTab" :name="projectTab" v-for="projectTab in computedTabs" :key="projectTab">
                </el-tab-pane>
            </el-tabs>
            <div class="secBackground">
                <div class="consumptionScroll" v-if="projectActiveTab == 'Consumption' && activeTab == 'Project Info'">
                    <meteringType
                    :isGenabilityEnabled="isGenabilityEnabled"
                    />
                    <consumptionProfileEnergy 
                    :isGenabilityEnabled="isGenabilityEnabled"
                    />
                </div>
                <div class="secBackground" v-if="projectActiveTab == 'Documents' && activeTab == 'Project Info'">
                    <Documents class="documentSection" />
                </div>
                <div class="secBackground" v-if="projectActiveTab == 'AHJ' && activeTab == 'Project Info'">
                    <ahjInformation />
                </div>
            </div>
        </div>
        <div v-if="activeTab == 'Activity Timeline'" class="activityTabBackground">
            <div class="secActivityBackground">
                <activityTimeline :isDrawer="false"/>
            </div>
        </div>
    </div>
</template>


<script>

import DesignCRM from './designCRM.vue'
import DesignDetailCRM from './designDetailCRM.vue'
import Documents from '../../../../src/pages/leadManagement/components/documents.vue'
import ahjInformation from '../../../../src/pages/project/components/ahjInformation/ahjInformation.vue'
import meteringType from "../../consumptionProfile/components/meteringType.vue"
import consumptionProfileEnergy from "../../consumptionProfile/components/consumptionProfileEnergy.vue"
import activityTimeline from '../../leadManagement/components/activityTimeline.vue'
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from '../../../stores/project';
import { useDesignStore } from '../../../stores/design'
import { useLeadStore } from '../../../stores/lead';
import {
    getUiFromStorage,
    setUiInStorage
} from '../../../utils'

export default {

    components: {
        DesignCRM,
        Documents,
        ahjInformation,
        meteringType,
        consumptionProfileEnergy,
        DesignDetailCRM,
        activityTimeline,
    },

    data() {
        return {
            activeTab: "Activity Timeline",
            activeDesignSection: "Design",
            tabs: [
                "Activity Timeline",
                "Project Info",
                "Design"
            ],
            projectActiveTab: 'Consumption',
            projectTabs: [
                "Consumption",
                "Documents"
            ],
            counterKey:0,
            projectTabsForUS: [
                "Consumption",
                "AHJ",
                "Documents"
            ],
            isLoadingDesign: false,
            isGenabilityEnabled: false,
        };
    },
    mounted() {
        this.getOrganisationInformation();
        if (this.$route.name == 'leadSummary:design') {
            let designId = this.$route.params.designId
            this.toggleDesignDetailsSection(designId)
        } else {
            let ui = getUiFromStorage()
            let reqdMiddleTab = ui.leadSummary.activeMiddleSectionTab
            if (reqdMiddleTab) {
                this.activeTab = reqdMiddleTab
            }
        }
    },
    computed: {
        ...mapState(useLeadStore, {
            leadInfo: state => state
        }),
        ...mapState(useProjectStore, {
            isDesignListChanged: state => state.isDesignListChanged,
            projectInformation: "GET_PROJECT_INFORMATION",
        }),
        ...mapState(useDesignStore, {
            leadIdFromDesign: "leadIdFromDesign"
        }),

        computedTabs() {
            if(this.projectInformation.country_details.country_code == "US") {
                return this.projectTabsForUS;
            } else {
                return this.projectTabs;
            }
        },

    },
    methods: {
        ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
        ...mapActions(useDesignStore, {
            SET_DESIGN: "SET_DESIGN",
        }),
        async getCurrentProject(){
            this.isLoadingDesign = true
            try {
                await this.GET_CURRENT_PROJECT(this.leadInfo.project_details.id);
            } catch (err) {
                console.error(err)
                this.$message({
                showClose: true,
                message: 'There was an error loading project details for this lead.',
                type: 'error',
                center: true
                });
            }
            this.isLoadingDesign = false
        },
        async getOrganisationInformation(){
            const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
            // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisation_id);
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!Object.keys(responseData).length){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisation_id)).data;
            }
            this.isGenabilityEnabled = responseData.is_genability_enabled;
        },
        handleClick(tab, event) {
            console.log(tab, event);
        },
        async toggleDesignDetailsSection(designId) {
            this.activeTab = 'Design'
            this.isLoadingDesign = true
            let leadId = this.$route.params.leadId
            if (!designId) {
                this.$router.push({ name: 'leadSummary', params: { leadId }})
                this.activeDesignSection = "Design"
                this.isLoadingDesign = false
                return
            }

            try {
                await this.SET_DESIGN(designId);
                if (this.leadIdFromDesign != this.leadInfo.id) {
                    this.$message({
                        showClose: true,
                        message: 'The design does not correspond to the lead.',
                        type: "info",
                        center: true
                    })
                    this.$router.push({ name: 'leadSummary', params: { leadId }})
                } else {
                    this.$router.push({ name: 'leadSummary:design', params: {
                        leadId,
                        designId
                    }})
                    this.activeDesignSection = "Design Summary"
                }
            } catch (err) {
                console.error(err)
                this.$router.push({ name: 'leadSummary', params: { leadId }})
                this.$message({
                    showClose: true,
                    message: 'There was an unknown error while loading this design.',
                    type: "error",
                    center: true
                })
            }
            this.isLoadingDesign = false
        },
        onTabClick() {
            let ui = getUiFromStorage()
            ui.leadSummary.activeMiddleSectionTab = this.activeTab
            setUiInStorage(ui)
        }
    },
    watch:{
        isDesignListChanged:{
            async handler(val){
                await this.getCurrentProject();
                this.counterKey++;
            }
        },
        $route(to) {
            this.toggleDesignDetailsSection(to.params.designId)
        }
    },
};
</script>


<style scoped>
.documentSection{
    width: 100%;
    background-color: #fff;
    padding: 0px 8px 8px 8px;
    border-radius: 8px;
    margin-bottom: 24px;
    overflow-y: scroll;
    height: calc(100vh - 294px);
    margin-top: 8px;
}
.projecttabsParentContainer {
    width: 100%;
    height: 35px;
    padding: 5px;
    color: #1c3366;
}
.tabsParentContainer {
    width: 100%;
    padding: 24px;
    overflow: hidden;
}
.tabBackground{
    width: 100%;
    background-color: #fff;
    padding: 8px;
    margin-bottom: 24px;
    height: calc(100vh - 228px);
    border-radius: 8px;
}

.activityTabBackground{
    width: 100%;
    background-color: #fff;
    margin-bottom: 24px;
    height: calc(100vh - 228px);
    border-radius: 8px;
}
.consumptionType{
    height: 70vh;
    width: 100%;
    overflow-y: scroll;
}
.backgroundCont,
.secBackground {
    width: 100%;
    background-color: #fff;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 24px;
}

.secBackground {
    padding: 0px;
}

.secActivityBackground {
    height: 100%;
    padding: 0px;
}

.backgroundCont >>> .el-tabs__active-bar,
.backgroundCont >>> .el-tabs__nav-wrap::after {
    display: none;
}

.backgroundCont >>> .el-tabs__header {
    margin-bottom: 0px;
}

.backgroundCont >>> .el-tabs__item {
    font-size: 16px;
    color: #777;
    line-height: inherit;
    padding: 12px 32px !important;
}

.backgroundCont >>> .el-tabs__item.is-active {
    color: #1c3366;
    font-weight: 600;
    padding: 12px 32px;
    background-color: #e8edf2;
    border-radius: 6px;
}

.consumptionScroll {
    max-height: calc(100vh - 294px);
    overflow: hidden;
    overflow-y: scroll;
    margin-top: 8px;
}
</style>