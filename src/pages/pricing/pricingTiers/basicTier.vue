<template>
    <div id="basicTier">
        <el-card shadow="never">
            <div class="paddingDescriptionAndAddonCard">
                <div style="display: flex; align-items: center;">
                    <div class="headingsTier">
                        Basic
                    </div>
                    <div class="planValidity">
                        Valid till
                        <span style="font-weight: bold;">
                            {{ projectsQuota.end_date }}
                        </span>
                    </div>
                </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div>
                <progressBarUsedQuota
                    :projects-used="projectsUsed.large_used"
                    :projects-quota="projectsQuota.large_projects"
                    quota-type="Projects"
                />
            </div>
        </el-card>
        <el-card
            shadow="never"
            style="margin:40px 0 10px 0">
            <div class="paddingDescriptionAndAddonCard">
                <div
                    class="headingsAddOns"
                    style="line-height: 38px">
                    Add-ons
                </div>
                <div class="descriptions"> Buy add-ons to design with more power </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div class="paddingDescriptionAndAddonCard">
                <div class="center-space-between-alignment">
                    <div class="headingsAddOnType"> PvSyst Export </div>
                    <button
                        :disabled="!isPvsystRequestEnabled"
                        class="button-confirm"
                        @click="requestPvsystUpgrade">
                        <i
                            v-show="isPvsystUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isPvsystUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Request
                        </span>
                    </button>
                </div>
                <div class="descriptions">
                    <span v-if="!isPvsystAlreadyBought ">
                        Buy this add-on and export your design to PvSyst.
                    </span>
                    <span v-else>
                        You have already bought PvSyst add-on. You can export your design to pvsyst from design studio page.
                    </span>
                </div>
            </div>
            <hr class="pricinghorizontalLine">
            <div class="paddingDescriptionAndAddonCard">
                <div class="center-space-between-alignment">
                    <div class="headingsAddOnType">Sketchup Export</div>
                    <button
                        :disabled="!isSketupRequestEnabled"
                        class="button-confirm"
                        @click="requestSketchUpUpgrade">
                        <i
                            v-show="isSketchupUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isSketchupUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Request
                        </span>
                    </button>
                </div>
                <div class="descriptions">
                    <span v-if="!isSketchupAlreadyBought">
                        Buy this add-on and export your design to Sketchup.
                    </span>
                    <span v-else>
                        You have already bought SketchUp add-on. You can export your design to Sketchup from design studio page.
                    </span>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import API from '@/services/api';
import progressBarUsedQuota from '@/components/ui/progressBarUsedQuota.vue';
import pricingMixin from '../pricingMixin';
import { PVSYST_UPGRADE_REQUEST_SUCCESS, SKETCHUP_UPGRADE_REQUEST_SUCCESS } from '../../constants';
import { mapState } from 'pinia';
import { useOrganisationStore } from '../../../stores/organisation';
export default {
    name: 'BasicTier',
    components: {
        progressBarUsedQuota,
    },
    mixins: [pricingMixin],
    data() {
        return {
            isPvsystUpgradeRequestInProgress: false,
            isSketchupUpgradeRequestInProgress: false,
            isPvsystAlreadyBought: false,
            isSketchupAlreadyBought: false,
        };
    },
    computed: {
        ...mapState(useOrganisationStore, {
            projectsQuota: 'GET_PROJECTS_QUOTA',
            projectsUsed: 'GET_PROJECTS_USED',
        }),
        isPvsystRequestEnabled() {
            return this.isPvsystUpgradeRequestInProgress || !this.isPvsystAlreadyBought;
        },
        isSketupRequestEnabled() {
            return this.isSketchupUpgradeRequestInProgress || !this.isSketchupAlreadyBought;
        },
    },
    mounted() {
        this.fetchAddOnsPermissions();
    },
    methods: {
        async requestPvsystUpgrade() {
            try {
                this.isPvsystUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.showSuccessMessagePlanRequestUpgrade(PVSYST_UPGRADE_REQUEST_SUCCESS);
                this.isPvsystUpgradeRequestInProgress = false;
            }
            catch (e) {
                this.showErrorMessageAPIRequest();
                this.isPvsystUpgradeRequestInProgress = false;
            }
        },

        async requestSketchUpUpgrade() {
            try {
                this.isSketchupUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.showSuccessMessagePlanRequestUpgrade(SKETCHUP_UPGRADE_REQUEST_SUCCESS);
                this.isSketchupUpgradeRequestInProgress = false;
            }
            catch (e) {
                this.showErrorMessageAPIRequest();
                this.isSketchupUpgradeRequestInProgress = false;
            }
        },
        async fetchAddOnsPermissions() {
            try {
                const response = await API.FEATURE_STATUS.GET_FEATURES_STATUS();
                const featuresPermissions = response.data.results[0];
                this.isSketchupAlreadyBought = featuresPermissions['stl_export_enabled'];
                this.isPvsystAlreadyBought = featuresPermissions['threeds_export_enabled'];           
            }
            catch (e) {
                console.error('Error fetching permissions', e);
            }
        },
    },
};
</script>

<style scoped>
.button-confirm {
    min-width: 80px !important;
}
#basicTier >>> .el-progress-bar {
    padding-right: 0px;
}
#basicTier >>> .el-card__body {
    padding: 0;
}
#basicTier >>> .el-card {
    border: 1px solid #969595;
}
</style>

<style lang="scss" scoped>
@import '../../../../src/styles/components/utils.scss'
</style>
