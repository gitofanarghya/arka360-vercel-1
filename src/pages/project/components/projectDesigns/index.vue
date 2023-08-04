<template>
    <div id="designThumbnailAndActions">
        <div class="center-space-between-alignment">
            <div
                class="center-space-between-alignment">
                <div>
                    <div
                        class="cardHeaders">
                        DESIGNS
                    </div>
                </div>
                <!-- <el-tooltip
                    :disabled="isToolTipDisabled"
                    :content="TOOLTIP_PROJECT_COUNT_DESC"
                    effect="light"
                    placement="top"> -->
                    <!-- extra div helps to overcome pointer events none for diasbled button -->
                    <!-- <div> -->
                    <button
                        class="el-icon-plus button-light-theme-icons"
                        style="font-size: 1.1vw;"
                        @click="isNewDesignModalVisible=true"/>
                    <!-- </div> -->
                <!-- </el-tooltip> -->
            </div>
            <!-- <button
                class="button-confirm"
                @click="isDesignServicesCompaniesDialogVisible=true">
                Request Design
            </button> -->
        </div>
        <newDesignDialog
            :is-new-design-modal-visible.sync="isNewDesignModalVisible"/>
        <designServicesCompanies
            :is-design-services-companies-dialog-visible.sync="isDesignServicesCompaniesDialogVisible"/>
        <designThumbnail/>
    </div>
</template>

<script>

import { TOOLTIP_PROJECT_COUNT_DESC } from '@/pages/constants';
import { mapState } from 'pinia;'
import { useProjectStore } from '../../../../stores/project';
import { useOrganisationStore } from '../../../../stores/organisation';
import newDesignDialog from './newDesignDialog.vue';
import designThumbnail from './designThumbnail.vue';
import designServicesCompanies from './designServices/designServicesCompanies.vue';

export default {
    name: 'DesignThumbnailAndActions',
    components: {
        designThumbnail,
        newDesignDialog,
        designServicesCompanies,
    },
    data() {
        return {
            isNewDesignModalVisible: false,
            isDesignServicesCompaniesDialogVisible: false,
        };
    },
    nonReactiveData() {
        return {
            TOOLTIP_PROJECT_COUNT_DESC,
        };
    },
    computed: {
        ...mapState(useOrganisationStore, [
            'IS_PROJECT_QUOTA_EXHAUSTED',
        ]),
        ...mapState(useProjectStore, {
            designsCount: 'GET_DESIGNS_COUNT',
        }),
        isToolTipDisabled() {
            return this.designsCount !== 0;
        },
    },
};
</script>

<style type="text/css" scoped>
    .el-icon-plus {
        color: #707070
    }
    .cardHeaders {
        font-size: 1.2vw;
        color: #707070;
        font-weight: bold;
        margin: 0 10px 0 0;
    }
    .button-confirm {
        font-size: 0.9vw;
    }
</style>

<style lang="scss" scoped>
    @import '../../../../styles/components/button';
    @import '../../../../styles/components/utils';
</style>