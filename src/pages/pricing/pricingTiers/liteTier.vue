<template>
    <div id="liteTier">
        <el-card shadow="never">
            <div class="paddingDescriptionAndAddonCard">
                <div class="center-space-between-alignment">
                    <div class="center-space-between-alignment">
                        <div class="headingsTier">
                            Lite
                        </div>
                        <div class="planValidity">
                            Valid till
                            <span style="font-weight: bold;">
                                {{ projectsQuota.end_date }}
                            </span>
                        </div>
                    </div>
                    <button
                        :disabled="isTierUpgradeRequestInProgress"
                        class="button-confirm"
                        @click="postTierUpgradeRequest">
                        <i
                            v-show="isTierUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isTierUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Upgrade
                        </span>
                    </button>
                </div>
                <div>
                    <div class="descriptions"> Go basic and design unlimited projects of any size </div>
                </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div>
                <progressBarUsedQuota
                    :projects-used="projectsUsed.small_used"
                    :projects-quota="projectsQuota.small_projects"
                    :max-allowed-size="QUOTA_TYPES_DC_CAP_SIZE.SMALL"
                    quota-type="Small"
                />
                <progressBarUsedQuota
                    :projects-used="projectsUsed.medium_used"
                    :projects-quota="projectsQuota.medium_projects"
                    :max-allowed-size="QUOTA_TYPES_DC_CAP_SIZE.MEDIUM"
                    quota-type="Medium"
                />
            </div>
        </el-card>
        <el-card
            shadow="never"
            style="margin:40px 0 10px 0">
            <div class="paddingDescriptionAndAddonCard">
                <div
                    class="headingsAddOns"
                    style="line-height: 38px"> Add-ons </div>
                <div class="descriptions"> Buy add-ons to design with more power </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div class="paddingDescriptionAndAddonCard">
                <div class="center-space-between-alignment">
                    <div class="headingsAddOnType">Residential Pack</div>
                    <button
                        :disabled="isResidentialUpgradeRequestInProgress"
                        class="button-confirm"
                        @click="postResidentialPackRequest">
                        <i
                            v-show="isResidentialUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isResidentialUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Request
                        </span>
                    </button>
                </div>
                <div class="descriptions">
                    Buy residential and design unlimited small projects (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.SMALL }} kW) per month
                </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div class="paddingDescriptionAndAddonCard">
                <div class="center-space-between-alignment">
                    <div class="headingsAddOnType">Commercial Pack</div>
                    <button
                        :disabled="isCommercialUpgradeRequestInProgress"
                        class="button-confirm"
                        @click="postCommercialPackRequest">
                        <i
                            v-show="isCommercialUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isCommercialUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Request
                        </span>
                    </button>
                </div>
                <div class="descriptions">
                    Buy commercial and design 5 medium projects (&#60; {{ QUOTA_TYPES_DC_CAP_SIZE.MEDIUM }} kW) per month
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { QUOTA_TYPES_DC_CAP_SIZE } from '@/core/coreConstants';
import API from '@/services/api';
import progressBarUsedQuota from '@/components/ui/progressBarUsedQuota.vue';
import pricingMixin from '../pricingMixin';
import { 
    COMMERCIAL_PLAN_UPGRADE_REQUEST_SUCCESS,
    RESIDENTIAL_PLAN_UPGRADE_REQUEST_SUCCESS,
    PLAN_UPGRADE_REQUEST_SUCCESS } from '../../constants';

import { mapState } from 'pinia';
import { useOrganisationStore } from '../../../stores/organisation';


export default {
    name: 'LiteTier',
    components: {
        progressBarUsedQuota,
    },
    mixins: [pricingMixin],
    data() {
        return {
            isTierUpgradeRequestInProgress: false,
            isResidentialUpgradeRequestInProgress: false,
            isCommercialUpgradeRequestInProgress: false,
        };
    },
    nonReactiveData() {
        return {
            QUOTA_TYPES_DC_CAP_SIZE,
        };
    },
    computed: {
        ...mapState(useOrganisationStore, {
            projectsQuota: 'GET_PROJECTS_QUOTA',
            projectsUsed: 'GET_PROJECTS_USED',
        }),
    },
    methods: {
        async postTierUpgradeRequest() {
            try {
                this.isTierUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.showSuccessMessagePlanRequestUpgrade(PLAN_UPGRADE_REQUEST_SUCCESS);
                this.isTierUpgradeRequestInProgress = false;
            }
            catch (e) {
                this.showErrorMessageAPIRequest();
                this.isTierUpgradeRequestInProgress = false;
            }
        },
        async postResidentialPackRequest() {
            try {
                this.isResidentialUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.showSuccessMessagePlanRequestUpgrade(RESIDENTIAL_PLAN_UPGRADE_REQUEST_SUCCESS);
                this.isResidentialUpgradeRequestInProgress = false;
            }
            catch (e) {
                this.showErrorMessageAPIRequest();
                this.isResidentialUpgradeRequestInProgress = false;
            }
        },
        async postCommercialPackRequest() {
            try {
                this.isCommercialUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.showSuccessMessagePlanRequestUpgrade(COMMERCIAL_PLAN_UPGRADE_REQUEST_SUCCESS);
                this.isCommercialUpgradeRequestInProgress = false;
            }
            catch (e) {
                this.showErrorMessageAPIRequest();
                this.isCommercialUpgradeRequestInProgress = false;
            }
        },
    },
};
</script>

<style scoped>
.button-confirm {
    min-width: 80px !important;
}
#liteTier >>> .el-progress-bar {
    padding-right: 0px;
}
#liteTier >>> .el-card__body {
    padding: 0;
}
#liteTier >>> .el-card {
    border: 1px solid #969595;
}

</style>

<style lang="scss" scoped>
@import '../../../../src/styles/components/utils.scss'
</style>
