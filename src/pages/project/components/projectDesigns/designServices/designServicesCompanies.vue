<!-- UNUSED FILE -->
<template>
    <div id="designServicesCompanies">
        <el-dialog
            :visible="isDesignServicesCompaniesDialogVisible"
            :close-on-click-modal="false"
            title="Detail Design Services"
            width="30%"
            @close="closeDesignServicesCompaniesDialog">
            <div
                v-bar
                class="scroll-area">
                <div>
                    <div
                        v-for="(partneredCompany, index) in partneredCompaniesDetails"
                        :key="index"
                        style="padding: 0 0 15px 0">
                        <el-card>
                            <div class="partneredCompanyLogoWrapper">
                                <img
                                    :src="require(`${partneredCompany.logoPath}`)"
                                    class="partneredCompanyLogo"
                                    @click="openDesignRequestFormDialogAndSetFormFrmaeSrc(partneredCompany.requestFormFrameSrc)">
                            </div>
                            <div class="companyDescription">
                                {{ partneredCompany.descriptionText }}
                            </div>
                            <div class="requestButtons">
                                <button
                                    class="button-confirm"
                                    @click="redirectToTrackRequestPage(partneredCompany.trackRequestUrl)">
                                    Track Request
                                </button>
                                <button
                                    class="button-confirm"
                                    @click="openDesignRequestFormDialogAndSetFormFrmaeSrc(partneredCompany.requestFormFrameSrc)">
                                    Initiate Request
                                </button>
                            </div>
                        </el-card>
                    </div>
                </div>
            </div>
        </el-dialog>
        <designRequestForm
            :request-form-frame-src="requestFormFrameSrc"
            :is-design-request-form-dialog-visible.sync="isDesignRequestFormDialogVisible"/>
    </div>
</template>
<script>

import designRequestForm from './designRequestForm.vue';

export default {
    name: 'DesignServicesCompanies',
    components: {
        designRequestForm,
    },
    props: {
        isDesignServicesCompaniesDialogVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            requestFormFrameSrc: null,
            isDesignRequestFormDialogVisible: false,
            partneredCompaniesDetails: [
                {
                    name: 'Heaven Solar',
                    trackRequestUrl: 'http://app.heavensolarenergy.com/',
                    descriptionText: 'Offers detailed design engineering services to state of Maharashtra, Gujarat and Rajasthan',
                    requestFormFrameSrc: 'https://forms.zohopublic.in/thesolarlabs/form/SoftwareRequest/formperma/lBBqoNtiYjDYhvSU0CXbrOLAnrgxmwTJk3bA5n5myg0',
                    logoPath: './assets/heavenSolar.png',
                },
            ],
        };
    },
    methods: {
        redirectToTrackRequestPage(requestPageUrl) {
            window.open(requestPageUrl, '_blank');
        },
        openDesignRequestFormDialogAndSetFormFrmaeSrc(requestFormFrameSrc) {
            this.requestFormFrameSrc = requestFormFrameSrc;
            this.isDesignRequestFormDialogVisible = true;
        },
        closeDesignServicesCompaniesDialog() {
            this.$emit('update:isDesignServicesCompaniesDialogVisible', false);
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '../../../../../styles/components/button';

    .partneredCompanyLogoWrapper {
        display: flex;
        justify-content: center;
        cursor: pointer;
    }
    .partneredCompanyLogo {
        width: 13vw;
        height: 4vw;
    }
    .requestButtons {
        display: flex;
        justify-content: flex-end;
        margin: 2vw 0 0 0;
    }
    // when vendors increase
    // .scroll-area {
    //     height: 55vh;
    //     max-height: 300px;
    // }
    .vb-content {
        width: calc(100% - 0px) !important;
    }
    .vb-content {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .vb-content::-webkit-scrollbar {
        width: 0;
    }
    .el-card {
        // when vendors increase
        // margin: 0 20px 0 0;
        border: 1px solid #b7babb
    }
    .companyDescription {
        font-size: 1vw;
        margin: 1vw 0 0 0;
        word-break: break-word;
    }
    .button-confirm {
        font-size: 0.8vw;
    }
</style>
