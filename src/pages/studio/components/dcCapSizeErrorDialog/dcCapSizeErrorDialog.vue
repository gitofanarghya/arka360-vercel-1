<template>
    <div id="dcCapSizeErrorDialog">
        <el-dialog
            :visible.sync="isCapSizeErrorDialogVisible"
            :close-on-click-modal="false"
            title="Cap Size Exceeded"
            width="30%">
            <div class="center-alignment">
                <i class="el-icon-warning"/>
                <div class="capSizeExceededText">
                    It seems like you have exceeded your permissible DC size for current project.
                    <span
                        v-if="isConvertToMediumProjectButtonEnabled"
                        style="font-style: italic">
                        However, you can utilise your medium projects' quota and design upto 200kw.
                    </span>
                </div>
            </div>
            <div>
                <progressBarUsedQuota
                    :projects-used="projectsUsed.small_used"
                    :max-allowed-size="QUOTA_TYPES_DC_CAP_SIZE.SMALL"
                    :projects-quota="projectsQuota.small_projects"
                    quota-type="Small"
                />
                <progressBarUsedQuota
                    :projects-used="projectsUsed.medium_used"
                    :max-allowed-size="QUOTA_TYPES_DC_CAP_SIZE.MEDIUM"
                    :projects-quota="projectsQuota.medium_projects"
                    quota-type="Medium"
                />
            </div>
            <div
                class="center-alignment"
                style="padding: 0 20px 20px 20px">
                <el-tooltip
                    :content="TOOLTIP_CONTENT_BASIC_PLAN_DESC"
                    placement="top"
                    effect="light">
                    <button
                        :disabled="isPlanUpgradeRequestInProgress"
                        class="button-confirm"
                        style="min-width: 130px"
                        @click="handlePlanRequestUpgrade">
                        <i
                            v-show="isPlanUpgradeRequestInProgress"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isPlanUpgradeRequestInProgress"
                            style="margin-left: 0 !important;">
                            Go Basic
                        </span>
                    </button>
                </el-tooltip>
                <button
                    v-if="quotaType === QUOTA_TYPE.SMALL"
                    :disabled="isConvertToMediumProjectRequestInProgress || !isConvertToMediumProjectButtonEnabled"
                    class="button-confirm"
                    style="min-width: 180px"
                    @click="convertSmallProjectToMedium">
                    <i
                        v-show="isConvertToMediumProjectRequestInProgress"
                        class="el-icon-loading"/>
                    <span
                        v-show="!isConvertToMediumProjectRequestInProgress"
                        style="margin-left: 0 !important;">
                        Convert To Medium
                    </span>
                </button>
                 <!-- Upgrade Tier for Self Design Only  -->
                <el-button v-if="!isDesignServiceBased" @click="isProjectUpgradePopupVisible = true">Upgrade Project</el-button>
            </div>
        </el-dialog>
        <project-upgrade-popup 
            v-if="isProjectUpgradePopupVisible"
            :isProjectUpgradePopupVisible.sync="isProjectUpgradePopupVisible"
            @projectUpgraded="closeDCCapSizeErrorDialog"
        />
    </div>
</template>
<script>
import API from '@/services/api/';
import pricingMixin from '@/pages/pricing/pricingMixin';
import {
    QUOTA_TYPE,
    TOOLTIP_CONTENT_BASIC_PLAN_DESC,
    PLAN_UPGRADE_REQUEST_SUCCESS,
} from '@/pages/constants';
import { QUOTA_TYPES_DC_CAP_SIZE } from '@/core/coreConstants';
import progressBarUsedQuota from '@/components/ui/progressBarUsedQuota.vue';
import {mapState, mapActions} from 'pinia';
import { DC_CAP_SIZE_ERROR } from '../../../../componentManager/componentManagerConstants';
import { useDesignStore } from '../../../../stores/design';
import { useOrganisationStore } from '../../../../stores/organisation';
import { useProjectStore } from '../../../../stores/project';

export default {

    name: 'DcCapSizeErrorDialog',
    components: {
        progressBarUsedQuota,
    },
    mixins: [pricingMixin],
    data() {
        return {
            isCapSizeErrorDialogVisible: false,
            isPlanUpgradeRequestInProgress: false,
            isConvertToMediumProjectRequestInProgress: false,
            isProjectUpgradePopupVisible: false,
        };
    },
    nonReactiveData() {
        return {
            QUOTA_TYPE,
            TOOLTIP_CONTENT_BASIC_PLAN_DESC,
            QUOTA_TYPES_DC_CAP_SIZE,
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            quotaType: state => state.quota_type,
        }),
        ...mapState(useDesignStore, {
            ESInfo : 'GET_EXPERT_SERVICE_INFO',
        }),
        ...mapState(useOrganisationStore, {
            projectsQuota: 'GET_PROJECTS_QUOTA',
            projectsUsed: 'GET_PROJECTS_USED',
        }),
        isConvertToMediumProjectButtonEnabled() {
            return this.quotaType === this.QUOTA_TYPE.SMALL && this.projectsUsed.medium_used < this.projectsQuota.medium_projects;
        },
        isDesignServiceBased(){
            return Boolean(Object.keys(this.ESInfo).length)
        }
    },
    mounted() {
        this.$eventBus.$on(DC_CAP_SIZE_ERROR, () => {
            this.isCapSizeErrorDialogVisible = true;
        });
    },
    beforeDestroy() {
        this.$eventBus.$off(DC_CAP_SIZE_ERROR);
    },
    methods: {
        ...mapActions(useProjectStore, ['UPDATE_PROJECT_INFORMATION']),
        ...mapActions(useOrganisationStore, ['SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE']),
        ...mapActions(useDesignStore,{
            UPDATE_ADDONS_ON_CONVERTING_TO_MEDIUM: 'UPDATE_ADDONS_ON_CONVERTING_TO_MEDIUM',
        }),
        async handlePlanRequestUpgrade() {
            try {
                this.isPlanUpgradeRequestInProgress = true;
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                this.isPlanUpgradeRequestInProgress = false;
                this.showSuccessMessagePlanRequestUpgrade(PLAN_UPGRADE_REQUEST_SUCCESS);
                this.closeDCCapSizeErrorDialog();
            }
            catch (e) {
                this.isPlanUpgradeRequestInProgress = false;
                this.showErrorMessageAPIRequest();
            }
        },
        async convertSmallProjectToMedium() {
            try {
                this.isConvertToMediumProjectRequestInProgress = true;
                const patchData = {
                    quota_type: this.QUOTA_TYPE.MEDIUM,
                };
                await this.UPDATE_PROJECT_INFORMATION(patchData);
                await this.SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE();
                this.UPDATE_ADDONS_ON_CONVERTING_TO_MEDIUM('T2');
                this.isConvertToMediumProjectRequestInProgress = false;
                this.closeDCCapSizeErrorDialog();
            }
            catch (e) {
                this.isConvertToMediumProjectRequestInProgress = false;
                this.showErrorMessageAPIRequest();
            }
        },
        closeDCCapSizeErrorDialog() {
            this.isCapSizeErrorDialogVisible = false;
        },
    },
};
</script>

<style scoped>
.marginTop {
    margin: 15px 0 0 0;
}
#dcCapSizeErrorDialog >>> .el-progress-bar {
    padding-right: 0px;
}
#dcCapSizeErrorDialog >>> .el-dialog {
    min-width: 600px;
}
.capSizeExceededText{
    word-break: break-word;
    margin: 0 20px 0 10px;
    font-weight: 600
}
</style>
<style lang="scss" scoped>
@import '../../../../../src/styles/components/utils.scss'
</style>
