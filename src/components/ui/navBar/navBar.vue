<template>
    <div
        id="navBar"
        class="ss">
        <el-row
            type="flex"
            align="middle">
            <el-col
                class="leftPart">
                <div
                    v-if="currentPage !== 'studio'" 
                    style="text-align: left; display: flex;">
                    <logo/>
                    <div
                        v-if="userTier === USER_TIER.LITE"
                        class="liteTierLogoText">
                        <span>&#42;</span> Lite
                    </div>
                </div>
                <div v-if="currentPage === 'studio'">
                    <design-path/>
                </div>
            </el-col>
            <el-col
                class="midPart">
                <studio-top-bar
                    v-if="currentPage === 'studio'"/>
                <el-row
                    v-if="currentPage !== 'studio'"
                    class="header2" style="max-height:58px !important; background:#141414 !important;">
                    <el-col :span="24">
                        <el-header class="header_inside">
                            {{ headersData[currentPage] }}
                        </el-header>
                    </el-col>
                </el-row>
            </el-col>
            <el-col
                class="rightPart">
                <el-row>
                    <el-col :span="11"/>
                    <el-col :span="7">
                        <div 
                            id="site-survey-files"
                            @click="openMedia()">
                            <i
                                slot="reference"
                                class="el-icon-files"/>
                            Site Survey Files
                        </div>
                    </el-col>
                    <el-col :span="2">
                        <el-tooltip
                            content="Help"
                            placement="bottom"
                            popper-class="navBarToolTip">
                            <help/>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="2">
                        <el-tooltip
                            content="Settings"
                            placement="bottom"
                            popper-class="navBarToolTip">
                            <settingsButton/>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="2">
                        <el-tooltip
                            content="Profile"
                            placement="bottom"
                            popper-class="navBarToolTip">
                            <profile/>
                        </el-tooltip>
                    </el-col>
                </el-row>
            </el-col>

        </el-row>
        <div v-if= "!hideExpiryPopupCondition" id="expiry-popup-block">
            <div>Your Subscription is going to expire in 30 days</div>
            <div class="button" @click="redirectRouter()">Renew Now</div>
            <div id="expiry-cancel-button" @click="hideExpiryPopup()">cancel</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { USER_TIER } from '@/pages/constants';
import logo from './logo.vue';
import DesignPath from '../../../pages/studio/topbar/DesignPath.vue';
import StudioTopBar from '../../../pages/studio/topbar/index.vue';
import help from './components/help.vue';
import profile from './components/profile.vue';
import settingsButton from './components/settingsButton.vue';
import { calculateDiffBtwTwoDates } from '../../../core/utils/mathUtils';
import { expiryPopupDisplay } from '../../../core/utils/utils';
import { useOrganisationStore } from '../../../stores/organisation';
import { useDesignStore } from '../../../stores/design';

export default {
    name: 'NavBar',
    components: {
        logo,
        DesignPath,
        StudioTopBar,
        help,
        profile,
        settingsButton,
    },
    props: {
        currentPage: {
            type: String,
            default: '',
        },
    },
    nonReactiveData() {
        return {
            USER_TIER,
        };
    },
    data() {
        return {
            headersData: {
                projectSummary: 'Project Summary',
                Projects: 'Projects',
                designSummary: 'Design Summary',
                settings: 'Settings',
                userProfile: 'User Profile',
                organisationSummary: 'Organisation Summary',
                organisationSettings: 'Organisation Settings',
                pricing: 'Plan and Pricing',
                admin: 'Admin',
                wireSizeCalculator: 'Wire Size Calculator',
                isPlanExpired: false,
                hideExpiryPopup: false,
                detailedBOM : 'Detailed BOM',
                detailedBOMDownload: 'Detailed BOM Download',
            },
        };
    },
    computed: {
        ...mapState(useOrganisationStore, {
            userTier: 'GET_USER_TIER',
            pricingPlansDetails: 'GET_PRICING_PLANS_DETAILS',
        }),
        ...mapState(useDesignStore, {
            isValidSurveryID: state => state.project.site_survey_token,
            projectInfo: state => state.project
        }),
        hideExpiryPopupCondition() {
            if (this.currentPage == "studio") {
            return true
        } else {
            return false;
        }
        }
    },
    created() {
    },
    mounted() {
        if (this.isValidSurveryID) {
            document.getElementById("site-survey-files").classList.remove("disabled");
        } else {
            document.getElementById("site-survey-files").classList.add("disabled");
        }
        // if (this.pricingPlansDetails.plan_id && (calculateDiffBtwTwoDates(this.pricingPlansDetails.end_date) < 0 )) {
        //     this.$router.push({ name: 'pricing' });
        //     return;
        // }
        // if (expiryPopupDisplay.isPricingPage) {
        //     document.getElementById('expiry-popup-block').style.display = 'none';
        // }
        // else if (expiryPopupDisplay.isFirstLoad) {
        //     const timer = setInterval(() => {
        //         if (this.pricingPlansDetails.end_date) {
        //             expiryPopupDisplay.isPlanExpired = calculateDiffBtwTwoDates(this.pricingPlansDetails.end_date) < 31;
        //             if (expiryPopupDisplay.isPlanExpired) {
        //                 document.getElementById('expiry-popup-block').style.display = 'flex';
        //                 if (expiryPopupDisplay.isStudioPage) {
        //                     document.getElementById('expiry-cancel-button').style.display = 'flex';
        //                 }
        //             }
        //             expiryPopupDisplay.isFirstLoad = false;
        //             clearInterval(timer);
        //         }
        //     }, 1000);
        // }
        // else if (expiryPopupDisplay.isPopup && expiryPopupDisplay.isPlanExpired) {
        //     document.getElementById('expiry-popup-block').style.display = 'flex';
        //     if (expiryPopupDisplay.isStudioPage) {
        //         document.getElementById('expiry-cancel-button').style.display = 'flex';
        //     };
        // }
    },
    watch: {
        isValidSurveryID: {
            deep: true,
            handler(value) {
                if (value) {
                    document.getElementById("site-survey-files").classList.remove("disabled");
                } else {
                    document.getElementById("site-survey-files").classList.add("disabled");
                }
            },
        }
    },
    methods: {
        redirectRouter() {
            this.$router.push({ name: 'pricing' });
        },
        hideExpiryPopup() {
            expiryPopupDisplay.isPopup = false;
            document.getElementById('expiry-popup-block').style.display = 'none';
        },
        async openMedia() {
            const surveyData = this.projectInfo.site_survey_token;
            if (surveyData) {
                const routeData = this.$router.resolve({ name: 'mediaBox', params: { surveyId: surveyData } });
                window.open(routeData.href, '_blank');
            }
        },
    }
};
</script>

<!-- Reason being el-header from element is used where ever navBar is imported.
Either do it all the components using NavBar or do it here -->
<style type="text/css">
    .el-header {
        padding: 0 !important;
        height: 100% !important;
    }

    .navBarToolTip {
        z-index: 1 !important;
    }
</style>

<style type="text/css" scoped>

#site-survey-files {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    color: white !important;
    max-height: 58px !important;
    background: rgb(20, 20, 20) !important;
    border: 1px solid;
    padding: 5px;
    font-size: 0.84vw;
    cursor: pointer;
}

.disabled {
    pointer-events: none;
    opacity: 0.4;
}

.navBarToolTip {
    background-color: #141414 !important;
    font-size: 1vw;
}

.navBarToolTip .popper__arrow,
.popper__arrow::after,
.popper__arrow::before {
    border-bottom-color: #141414 !important;
}

#navBar {
    background-color: #141414;
    /* height: 3.8vw; */
    display: flex;
    flex-direction: column;
}

.header2 {
    color: white;
    font-size: 1.5vw;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
}

.header_inside {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100% !important;
}

.liteTierLogoText {

    color: white;
    font-size: 8px;
    padding-left: 5px;
    font-weight: bold;
}


.el-row {
    height: 100%;
}

.leftPart,
.rightPart,
.midPart,
.header2 {
    height: 100%;
}

.rightPart .el-row,
.midPart .el-row,
.header2 .el-row {
    height: 100%;
    width: 100%;
}

.rightPart .el-col,
.midPart .el-col,
.header2 .el-col {
    height: 100%;
}

.leftPart {
    display: flex;
    align-items: center;
    margin-left: 10px;
}
#expiry-popup-block {
    position: relative;
    height: 45px;
    min-height: 45px;
    width: 100%;
    min-width: 100%;
    padding: 0;
    background: rgb(223, 215, 201);
    display: none;
    justify-content: center;
    align-items: center;
    font-family: HelveticaNeue;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    letter-spacing: normal;
    color: #409EFF;
}
#expiry-popup-block .button {
    /* width: 60px;
    height: 35px; */
    margin-left: 10px;
    padding: 5px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    color: #ffffff;
    font-weight: bold;
    background-image: linear-gradient(to bottom, #409EFF, #3092F7);
    cursor: pointer;
}
#expiry-cancel-button {
    position: absolute;
    right: 10px;
    text-align: center;
    padding: 5px 8px;
    display: none;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    color: #ffffff;
    font-weight: bold;
    background-image: linear-gradient(to bottom, #409EFF, #3092F7);
    cursor: pointer;
}
</style>


<!-- Breadcrumbs Styling -->
<style type="text/css">
#navBar .el-breadcrumb__inner {
    color: white !important;
    font-size: 1vw;
    font-weight: normal;
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
}

#navBar .el-breadcrumb__inner p {
    white-space: nowrap;
    max-width: 100%;
    text-overflow: ellipsis !important;
    display: inline-block;
    line-height: 1;
}
/* kept globally as it is used everywhere navbar is imported and would be easier to change it from here */
.navBar-container {
    width: 100%;
    padding: 0;
    height: auto !important;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    /* this is kept one above the loading mask */
    z-index: 2000;
}

#navBar .navBarMidButtons > .el-button.is-disabled {
    background-color: inherit !important;
    border-color: transparent !important;
    color: #4c4c4c;
}

.rightPart .el-row{
    display: flex !important;
    padding-right: 10px !important;
}
</style>
