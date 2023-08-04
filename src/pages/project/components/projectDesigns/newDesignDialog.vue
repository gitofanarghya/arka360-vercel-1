<template>
    <div id="newDesignDialog">
        <el-dialog
            :visible="isNewDesignModalVisible"
            :close-on-click-modal="false"
            title="New Design"
            width="35%"
            @close="closenewDesignDialogForm">
            <el-form
                :model="designName"
                style="text-align: left"
                label-position="left"
                label-width="150px"
                size="small"
                @submit.native.prevent>
                <el-form-item label="Design Name">
                    <el-input
                        v-validate="designNameValidation"
                        v-model="designName.name"
                        placeholder="Design Name"
                        name="Design Name"/>
                    <p class="formErrors"><span>{{ errors.first('Design Name') }}</span></p>
                </el-form-item>
                <el-form-item label="Defaults Profile">
                    <el-tooltip effect="dark" placement="top-start">
                        <template #content>Choose a design profile from the available options <br/>to set the default values and apply it to the design.</template>
                        <button style="margin-left:-50px;" class="button-dark-theme-icons el-icon-info icons-circle'"/>
                    </el-tooltip>
                    
                    <el-select
                        v-validate="designDefaultsValidation"
                        v-model="selectedProfile"
                        size="small"
                        value-key="id"
                        filterable
                        reserve-keyword
                        placeholder="Profiles"
                        style="width: 100%;"
                        name="Design Defaults">
                        <el-option
                            v-for="(item, index) in allProfiles_"
                            :key="index"
                            :label="item.name"
                            :value="item"/>
                        <infinite-loading
                            :distance="0"
                            system-throttle-limit
                            spinner="bubbles"
                            @infinite="loadMoreProfiles">
                            <div
                                slot="no-more"
                                style="color: #606266; font-size: 12px">
                                No more profiles!!
                            </div>
                        </infinite-loading>
                    </el-select>
                    <p class="formErrors"><span>{{ errors.first('Design Defaults') }}</span></p>
                </el-form-item>
                <el-form-item style="text-align: center; padding-bottom: 10px;">
                    <!-- <button
                        id="projectDesignsCancelButton"
                        :disabled="isDesignGettingCreated"
                        class="button-cancel"
                        @click="onCancel">
                        Cancel
                    </button> -->
                    <button
                        id="projectDesignsConfirmButton"
                        :disabled="errors.items.length > 0 || isDesignGettingCreated"
                        native-type="submit"
                        class="button-confirm"

                        @click="handleNewDesignCreation">
                        <span v-show="!isDesignGettingCreated">Confirm</span>
                        <i
                            v-show="isDesignGettingCreated"
                            class="el-icon-loading"/>
                    </button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
import API from '@/services/api/';
import { mapState, mapActions } from "pinia"
import { useOrganisationStore } from '../../../../stores/organisation';
import { useProjectStore } from '../../../../stores/project';
import { useDesignStore } from '../../../../stores/design';
import { useLeadStore } from '../../../../stores/lead';
import { ERROR_MESSAGE_QUOTA_EXHAUSTED } from '@/pages/constants';
import * as utils from '../../../../core/utils/utils';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from '../../../../constants';
import { useMapImagesStore } from '../../../../stores/mapImages';
import { reportPagesPlainListUs } from '../../../../utils';

export default {

    name: 'NewDesignDialog',
    props: {
        isNewDesignModalVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            designName: {
                name: '',
            },
            designDefaultsValidation: {
                required: true,
            },
            designNameValidation: {
                required: true,
            },
            selectedProfile: {},
            allProfiles_: [],
            nextURL: null,
            isDesignGettingCreated: false,
            totalPagesForUS: reportPagesPlainListUs,
        };
    },
    nonReactiveData() {
        return {
            ERROR_MESSAGE_QUOTA_EXHAUSTED,
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            designsCount: 'GET_DESIGNS_COUNT',
            designDetails: "GET_DESIGNS_DETAILS",
        }),
        ...mapState(useLeadStore, {
            leadInfo: state => state
        }),
        projectId() {
            return this.$route.params.projectId || this.leadInfo?.project_details?.id
        },
        flagForUS(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
        }
    },
    mounted() {
        this.fetchAllProfiles();
        if (this.designDetails.length){
            this.designName.name = '';
        }else{
            this.designName.name = 'Design 1';
        }
    },
    methods: {
        ...mapActions(useOrganisationStore, {
            setUsedQuotaDetailsAndQuotaType: 'SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE'
        }),
        ...mapActions(useDesignStore, {
            SET_DESIGN: 'SET_DESIGN',
              STORE_DESIGN_VERSION: "STORE_DESIGN_VERSION",
        }),
        closenewDesignDialogForm() {
            this.$emit('update:isNewDesignModalVisible', false);
            this.$validator.reset();
            this.designName.name = '';
        },
        async patchDesignVersionSettings(designVersionSettingsId) {
             console.log("############# calling new code");
            let report_defaults_temp=this.selectedProfile.report_defaults;
            // not adding check for template_name and report_type as this function meant for NonUS right now
            report_defaults_temp['template_name'] ='solar_labs'; 
            report_defaults_temp['report_type'] ='landscape'; 
            report_defaults_temp["defaultProfileId"]=this.selectedProfile.id;
            report_defaults_temp["defaultProfileName"]=this.selectedProfile.name;

            //-------------------------If US Account, Design Creation through ------------------------------------------//
            if(this.flagForUS){
                report_defaults_temp['template_name'] ='solar_labs_usa'; 
                report_defaults_temp['report_type'] ='portrait'; 
                report_defaults_temp['pages'] =[...this.totalPagesForUS]; 
            }
            //-----------------------------END-----------------------------------------------//
            console.log("report_default_temp", report_defaults_temp);
            const patchData = {
                name: this.selectedProfile.name,
                distance_unit: this.selectedProfile.distance_unit,
                wiring_unit: this.selectedProfile.wiring_unit,
                shadows: this.selectedProfile.shadows,
                start_time_auto_row_spacing: this.selectedProfile.start_time_auto_row_spacing,
                end_time_auto_row_spacing: this.selectedProfile.end_time_auto_row_spacing,
                start_date_heatmap: this.selectedProfile.start_date_heatmap,
                end_date_heatmap: this.selectedProfile.end_date_heatmap,
                start_time_heatmap: this.selectedProfile.start_time_heatmap,
                end_time_heatmap: this.selectedProfile.end_time_heatmap,
                default_solar_access_threshold: this.selectedProfile.default_solar_access_threshold,
                default_table_types: this.selectedProfile.default_table_types,
                constant_losses: this.selectedProfile.constant_losses,
                drawing_defaults: this.selectedProfile.drawing_defaults,
                report_defaults: report_defaults_temp,

            };
            if(patchData['wiring_unit']=='millimeter_square'){
                patchData['wiring_unit'] = 'mmsq';
            }
            try {
                API.DESIGN_VERSION_SETTINGS.PATCH_VERSION_SETTINGS(designVersionSettingsId, patchData);
            }
            catch (e) {
                console.error();
                this.handleDesignCreationError(e);
            }
        },
        async fetchAllProfiles() {
            try {
                const response = await API.DEFAULTS_PROFILE.FETCH_ALL_PROFILES();
                // this.allProfiles_ = JSON.parse(JSON.stringify(response.data.results));
                for(let i1=0;i1<(response.data.results.length) ; i1++){
                    if(response.data.results[i1].name && response.data.results[i1].drawing_defaults)
                    this.allProfiles_.push(response.data.results[i1]);
                }

                this.nextURL = response.data.next;
                this.prevURL = response.data.prev;
                // setting first userProfile to be the default option
                if (this.allProfiles_.length > 0) {
                    this.selectedProfile = this.allProfiles_[0];
                }
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in fetching defaults userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        handleDesignCreationError(e) {
            console.log(e)
            let errorMessage = 'Error in creating design. Try again';
            if (e.response.status === 302) {
                errorMessage = this.ERROR_MESSAGE_QUOTA_EXHAUSTED;
            }
            this.$message({
                showClose: true,
                message: errorMessage,
                type: 'error',
                center: true
            });
            this.isDesignGettingCreated = false;
        },
        getPostDataForDesignCreation() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const userId = user.user_id;
            return {
                name: this.designName.name,
                project: this.projectId,
                created_by: userId,
                modified_by: userId,
                design_profile_id: this.selectedProfile.id,
            };
        },
        async handleNewDesignCreation() {
            const isValid = await this.$validator.validateAll();
            if (!isValid) { return }

            try {
                this.isDesignGettingCreated = true;
                const postData = this.getPostDataForDesignCreation();
                const response = await API.DESIGNS.CREATE_NEW_DESIGN(postData);
                const designVersionSettingsId = response.data.versions.setting.id;
                const designId = response.data.id;
                

                //    this.patchDesignVersionSettings(designVersionSettingsId);
                await this.SET_DESIGN(designId);
                // fetch the updated used quota and set update default val quota type when first desgn is created
                // if (this.designsCount === 0) {
                //     this.setUsedQuotaDetailsAndQuotaType();
                // }
                this.closenewDesignDialogForm();
                // await API.FETCH_MAP.POST_MAP_IMAGE(this.fetchGoogleMapsImage(designId));

                const responseNEW = await API.DESIGNS.FETCH_DESIGN(designId);
                console.log("responseNEW",responseNEW);
                if (responseNEW.data.versions !== null) {
                    await this.STORE_DESIGN_VERSION(responseNEW);
                } else {
                    // create new design version and push to studio
                    const postData = {
                        scene: null,
                        notes: null,
                        design: designId,
                    };
                    await API.DESIGN_VERSIONS.POST_DESIGN_VERSION(postData);
                    // send it to the studio app
                }
                this.$emit('showLoaderInParent', true);
                this.$router.push({ name: "studio", params: { designId } });
                // this.routeToDesignSummaryPage(designId);
            }
            catch (e) {
                this.closenewDesignDialogForm();
                this.handleDesignCreationError(e);
                this.isDesignGettingCreated = false;
            }
        },
        routeToDesignSummaryPage(designId) {
            this.$router.push({ name: 'studio', params: { designId } });
        },
        onCancel() {
            this.closenewDesignDialogForm();
        },
        async loadMoreProfilesHelper(url, $state) {
            try {
                const response = await API.DEFAULTS_PROFILE.FETCH_MORE_PROFILES(url);
                const new_profiles = response.data.results;
                this.nextURL = response.data.next;
                // Appending it to inventory group
                for (const key in new_profiles) {
                    if(new_profiles[key].name && new_profiles[key].drawing_defaults)
                    this.allProfiles_.push(new_profiles[key]);
                };
                // when load is complete
                $state.loaded();
            }
            catch (e) {
                console.error();
            }
        },

        loadMoreProfiles($state) {
            if (this.nextURL !== null) {
                this.loadMoreProfilesHelper(this.nextURL, $state);
            }
            else {
                $state.complete();
            }
        },
        fetchGoogleMapsImage(designId) {
            // this.isImageBeingApplied = true;
            const groundImageData = {
                url: `https://maps.googleapis.com/maps/api/staticmap?center=${useMapImagesStore().latitude},${useMapImagesStore().longitude}&scale=2&zoom=${useMapImagesStore().zoomLevel}&maptype=satellite&size=${useMapImagesStore().dimensions}x${useMapImagesStore().dimensions}&key=${GOOGLE_API_KEY}`,
                imageType: 'map',
                rotation: 0,
                scale: 0,
                offset: [0, 0],
                source: 'google_maps',
                zoom: useMapImagesStore().zoomLevel,
            };
            groundImageData.url = utils.signRequest(groundImageData.url, GOOGLE_SIGNING_SECRET);
            return this.saveImageJSON(groundImageData, designId);
        },
        saveImageJSON(obj, designId){
            return {
                "url": obj.url,
                "rotation": obj.rotation,
                "scale": obj.scale,
                "design": designId,
                "source": obj.source,
                "zoom": obj.zoom,
                "is_visible": true,
            };
        },
    },
};
</script>

<style scoped>

    #newDesignDialog >>> .el-dialog {
        border-radius: 10px;
        
    }

    #newDesignDialog >>> .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px !important;
        height: 48px !important;
        }

    #newDesignDialog >>> .el-dialog__title{
        font-weight: 600;
        color: #222222 !important;
        font-size: 16px !important;
        }

    #newDesignDialog >>> .el-dialog__close {
        color: #222222 !important;
        font-size: 18px !important;
        font-weight: 600  !important;
        }


    #newDesignDialog >>> .el-form-item__content {   
        margin-left: 5px  !important;
        }

          #newDesignDialog >>> .el-form-item {   
        /* margin-left: 5px  !important; */
        margin-bottom: 0px !important;
        }


    #newDesignDialog  >>>    .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       padding: 16px 24px !important;
       /* height: 40px  !important; */
       font-weight: 600 !important;
       margin: 16px auto 8px auto !important;
       }

       #newDesignDialog  >>> .el-form-item--small .el-form-item__label {
           line-height: 32px;
           color: #222 !important;
           font-size: 14px !important;
       }
       .button-dark-theme-icons {   
            color: #222 !important;      
        }

       .el-input--small, .el-select{
           margin-left: -5px;
       }
       #newDesignDialog  >>> .el-input__inner{
            padding: 0px 4px !important;
            background-color: #e8edf2 !important;
            border: none !important;
            color: #222 !important;
            font-size: 16px !important;
            height: 48px !important;
        }

        #newDesignDialog  >>> .el-select .el-input .el-select__caret{
            font-weight: 600 !important;
            font-size: 16px !important;
            color: #222 !important;
        }

        @media screen and (max-width: 1200px) {
            #newDesignDialog >>> .el-dialog {
            width: 60% !important;   

            }
        }

        @media screen and (max-width: 500px) {
            #newDesignDialog >>> .el-dialog {
            width: 80% !important;   

            }
        }

</style>

<style lang="scss" scoped>


    @import '../../../../styles/components/button';
    @import '../../../../styles/components/forms';

</style>
