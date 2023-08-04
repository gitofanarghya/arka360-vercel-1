<template>
    <div id="newProfile">
        <el-dialog
            title="Defaults Settings"
            :visible.sync="newEditProfileFormVisible"
            width="65%"
            height='70%'
            :close-on-click-modal="false"
            @close="onCancelNewEditProfile">
            <el-row>
                <!-- <VuePerfectScrollbar class="scroll-area"> -->
                <el-col :span="7" style="overflow:scroll;">
                    <el-tree 
                        :data="profileTreeStructure"
                        node-key="id"
                        ref="newEditProfRef"
                        default-expand-all
                        highlight-current
                        :current-node-key="defaultNodeKey"
                        @node-click="openSelectedComponent"/>
                </el-col>
                <el-col
                    :span="17"
                    style="padding: 29px 0px 0px 10px;">
                    <el-form
                        :model="profileData"
                        size="mini"
                        label-position="left"
                        label-width="250px"
                        v-if="(profileType !== 'designVersionSettings')"
                        @submit.native.prevent>
                        <el-form-item label="Profile Name">
                            <el-input v-model="profileData.name"/>
                        </el-form-item>
                    </el-form>
                    <!-- current approach would ensure that this dynamic component is recreated
                    after the selected panel fetching is done and there would be no need to pass a prop to the forms
                    to show loading icon till the time the panel is being fetched and also the selected panel would always be visible
                    and no previous profile results would be there
                    
                    Check if this approach is good in current scenario-->
                    <div>
                        <keep-alive>
                            <component
                                :is="currentComponent"
                                :profileData="profileData"
                                :profile-type="profileType"
                                :roofArea="roofArea"
                            />
                        </keep-alive>
                    </div>
                </el-col>
            </el-row>

            <span slot="footer" class="dialog-footer">
                <button
                    @click="onCancelNewEditProfile"
                    class="button-cancel">
                    Cancel
                </button>
                <button
                    class="button-confirm"
                    @click="onSaveNewEditProfile"
                    size="mini"
                    :disabled="errors ? errors.items.length > 0 : disable">
                    Save
                </button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
import API from '../../../services/api/';
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import {serverBus} from '../../../main';
import { mapActions } from 'pinia';
import { useDesignStore } from '../../../stores/design';
import PolygonForm from './newProfileForms/objectsForms/polygonForm.vue';
import CylinderForm from './newProfileForms/objectsForms/cylinderForm.vue';
import TreeForm from './newProfileForms/objectsForms/treeForm.vue';
import InverterForm from './newProfileForms/objectsForms/inverterForm.vue';
import ACDBForm from './newProfileForms/objectsForms/acdbForm.vue';
import WalkwaysForm from './newProfileForms/objectsForms/walkwayForm.vue';
import SubarrayForm from './newProfileForms/objectsForms/subarrayForm/subarrayForm.vue';
import GeneralForm from './newProfileForms/settingsForms/generalSettings.vue';
import QuickViewForm from'./newProfileForms/settingsForms/quickViewSettings.vue';
import ReportForm from './newProfileForms/settingsForms/reportSettings.vue';
import AutoPanelPlacementForm from './newProfileForms/settingsForms/autoPanelPlacementSettings.vue';
import LossesForm from './newProfileForms/settingsForms/lossesSettings.vue';
import AcCableProperties from '../../studio/sappane/properties/acCableProperties.vue';
import ACDBProperties from '../../studio/sappane/properties/acdbProperties.vue';
import SmartroofForm from './newProfileForms/objectsForms/smartroofForm.vue';
import DormerForm from './newProfileForms/objectsForms/dormerForm.vue';
import AcCableForm from './newProfileForms/objectsForms/acCableForm.vue';
import DcCableForm from './newProfileForms/objectsForms/dcCableForm.vue';
import ConduitForm from './newProfileForms/objectsForms/conduitForm.vue';
import CabletrayForm from './newProfileForms/objectsForms/cabletrayForm.vue';
import debounce from 'debounce';


    export default {
        name: 'newProfile',
        data() {
            return {
                isSaveClicked: false,
                disable:false,
                isSelectedPanelFetching: true,
                newEditProfileFormVisible: false,
                currentComponent: QuickViewForm,
                currentComponentData: '',
                profileNameValidation: {
                    required: true
                },
                activeNode: 'QuickView',
                defaultNodeKey: 23,
                profileType: '',
                isNewProfile: '',
                isDesignVersionSetting: false,
                profileData: '',
                originalProfileData: '',
                profileTreeStructure: [
                    {
                        label: 'QuickView',
                        id: 23,
                        children: [                  
                        ],
                    },
                    {
                        label: 'Settings',
                        id: 1,
                        children: [
                            {
                                id: 3,
                                label: 'General',
                            },
                            {
                                id: 4,
                                label: 'Losses'
                            },
                            /* {
                                id: 5,
                                label: 'AutoPanelPlacement'
                            },  */                  
                        ],
                    },
                    {
                        label: 'Objects',
                        id: 2,
                        children: [
                            {
                                id: 6,
                                label: 'Models',
                                children: [
                                    {
                                        id: 9,
                                        label: 'Polygon',
                                    },
                                    {
                                        id: 10,
                                        label: 'Cylinder',
                                    },
                                    {
                                        id: 11,
                                        label: 'Smartroof',
                                    },
                                    {
                                        id: 12,
                                        label: 'Dormer',
                                    },
                                    {
                                        id: 13,
                                        label: 'Walkways',
                                    },
                                    {
                                        id: 14,
                                        label: 'Tree',
                                    },
                                ],
                            },
                            // {
                            //     id: 7,
                            //     label: 'Subarray',
                            // },
                            // {
                            //     id: 8,
                            //     label: 'Components',
                            //     children: [
                            //         {
                            //             id: 13,
                            //             label: 'Inverter',
                            //         },
                            //         //this code is hidden temporarily.ACDB_HIDE
                            //         // {
                            //         //     id: 14,
                            //         //     label: 'ACDB',
                            //         // },
                            //         /* {
                            //             id: 9,
                            //             label: 'Cable',
                            //             children:[
                            //                 {
                            //                     id:15,
                            //                     label:'AC Cable'
                            //                 },
                            //                 // {
                            //                 //     id:16,
                            //                 //     label:'DC Cable'
                            //                 // }
                            //             ],
                            //         }, */
                            //         // {
                            //         //     id: 10,
                            //         //     label: 'Conduit',
                            //         //     children:[
                            //         //         {
                            //         //             id:17,
                            //         //             label:'Single Conduit'
                            //         //         },
                            //         //         {
                            //         //             id:18,
                            //         //             label:'Double Conduit'
                            //         //         },
                            //         //         {
                            //         //             id:19,
                            //         //             label:'Double Separate Conduit'
                            //         //         },
                            //         //     ],
                            //         // },
                            //         // {
                            //         //     id: 11,
                            //         //     label: 'Cabletray',
                            //         //     children:[
                            //         //         {
                            //         //             id:20,
                            //         //             label:'Single Cabletray'
                            //         //         },
                            //         //         {
                            //         //             id:21,
                            //         //             label:'Double Cabletray'
                            //         //         },
                            //         //         {
                            //         //             id:22,
                            //         //             label:'Double Separate Cabletray'
                            //         //         },
                            //         //     ],
                            //         // },
                            //     ],
                            // },
                        ],
                    },
                ],
                distanceUnitBeforeOpeningProfile: null,
                wiringUnitBeforeOpeningProfile: null,
                roofArea: () => {},
                isVipPowerGazebo: false,
            };
        },
        components: {
            PolygonForm,
            TreeForm,
            CylinderForm,
            WalkwaysForm,
            GeneralForm,
            AutoPanelPlacementForm,
            LossesForm,
            SubarrayForm,
            ReportForm,
            VuePerfectScrollbar,
            InverterForm,
            ACDBForm,
            AcCableProperties,
            AcCableForm,
            SmartroofForm,
            DormerForm,
            DcCableForm,
            ConduitForm,
            CabletrayForm,
            QuickViewForm,
        },

        mounted() {
            // function here to check if the key for report_defaults is to be added or not
            this.isVipPowerGazebo = this.setGazeboStatus();
            const isOrgUnirac = this.isOrganisationUnirac();
            this.profileTreeStructure[1].children.push(
                {
                    id: 11,
                    label: 'Report'
                }
            );
            if (!this.isVipPowerGazebo){
                this.profileTreeStructure.push({
    
                        id: 7,
                        label: 'Subarray',
                    });
                this.profileTreeStructure.push({
                    id: 8,
                    label: 'Components',
                    children: [
                        {
                            id: 13,
                            label: 'Inverter',
                        },
                    ],
                });
            }
            serverBus.$on('newEditProfileVisible', (profileData, profileType) => {
                // Temporary Solution using profile type
                // newProfile -> New Profile, editProfile -> Edit Profile, designVersionSettings -> Edit Design Version Settings

                this.profileType = profileType;
                // creating a copy not a reference
                this.profileData = JSON.parse(JSON.stringify(profileData));

                // Need to fetch selected panel here because of reference, otherwise on cancel won;t work
                // this.fetchSelectedPanel();

                // Maintaining state of distance unit for current profile
                this.setMeasurementUnitState(this.profileData.distance_unit);

                // Maintaining state of wiring unit for current profile
                this.setWiringUnitState(this.profileData.wiring_unit);

                // this.$refs.newEditProfRef.setCurrentKey(3);
                if(isOrgUnirac) {
                    this.currentComponent = QuickViewForm;
                    this.defaultNodeKey = 23;
                }
                else{
                    this.currentComponent = GeneralForm;
                    this.defaultNodeKey = 3
                }

                // this.originalProfileData = JSON.parse(JSON.stringify(profileData));
                this.newEditProfileFormVisible = true;
            });
            serverBus.$on('totalRoofArea', (data) => {
                this.roofArea = data;
            });
        },

    beforeDestroy() {
        serverBus.$off('newEditProfileVisible');
    },
// ========================== Stop multiple save click ====================== 
    created() {
        // we replaced the original method with a debounced version
        this.onSaveNewEditProfile = debounce(this.onSaveNewEditProfile, 500);
    },
// =================================== End ==================================
    methods: {
        ...mapActions(useDesignStore, [
            'SET_DISTANCE_UNIT',
            'SET_WIRING_UNIT',
            'UPDATE_DESIGN_VERSION_SETTINGS',
        ]),
        setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                //REMOVING API CALL BECAUSE MOUNTED CANNOT BE ASYNC DUE TO DEPENDANCY TO POPUP OPENING FOR UNIRAC.
                // responseData = (API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
                return false;
            }
            return (responseData.vip_for_power_gazebo);
        },
        isOrganisationUnirac() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const organisationId = user.organisation_id;

            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            console.log(responseData,"resporg");
            if(!Object.keys(responseData).length && organisationId){
                //REMOVING API CALL BECAUSE MOUNTED CANNOT BE ASYNC DUE TO DEPENDANCY TO POPUP OPENING FOR UNIRAC.
                // responseData = (API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
                return false;
            }
            return (responseData.name === 'Unirac' && responseData.id === 114 );
        },

        async fetchSelectedPanel() {
            try {
                // destroying the component first to set the selected panel
                this.isSelectedPanelFetching = true;
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.profileData.drawing_defaults.subarray.moduleProperties.moduleId);

                // updating subarray properties
                this.profileData.drawing_defaults.subarray.moduleProperties = response.data;
                // stopping the rendering till selected panel is available
                this.isSelectedPanelFetching = false;
            } catch (e) {
                console.error();
            }
        },

        async patchDesignVersionSettings() {
            let report_defaults_temp=this.profileData.report_defaults;
            report_defaults_temp["defaultProfileId"]=this.profileData.id;
            report_defaults_temp["defaultProfileName"]=this.profileData.name;
            let patchData = {

                id: this.profileData.id,
                distance_unit: this.profileData.distance_unit,
                wiring_unit: this.profileData.wiring_unit,
                shadows: this.profileData.shadows,
                start_time_auto_row_spacing: this.profileData.start_time_auto_row_spacing,
                end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
                start_date_heatmap: this.profileData.start_date_heatmap,
                end_date_heatmap: this.profileData.end_date_heatmap,
                start_time_heatmap: this.profileData.start_time_heatmap,
                end_time_heatmap: this.profileData.end_time_heatmap,
                default_solar_access_threshold: this.profileData.default_solar_access_threshold,
                default_table_types: this.profileData.default_table_types,
                constant_losses: this.profileData.constant_losses,
                report_defaults: report_defaults_temp,
                drawing_defaults: JSON.parse(JSON.stringify(this.profileData.drawing_defaults)),

            };

            try {
                await this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
                // let response = await API.DESIGN_VERSION_SETTINGS.PATCH_VERSION_SETTINGS(this.profileData.id, patchData);
                // TODO: Remove this and fetch settings from store
                serverBus.$emit('designVersionSettingsUpdated', patchData);
            } catch (e) {
                if (typeof e.response !== 'undefined' && e.response.status === 403) {
                    // error handling
                    this.$message({
                        showClose: true,
                        message: 'You are not allowed to edit design settings.',
                        type: 'error',
                        center: true
                    });
                } else {
                    // error handling
                    this.$message({
                        showClose: true,
                        message: 'Error in updating design settings. Try again.',
                        type: 'error',
                        center: true
                    });
                }
            }

            this.newEditProfileFormVisible = false;
        },

        async patchEditProfile() {
                  let report_defaults_temp=this.profileData.report_defaults;
                  report_defaults_temp["defaultProfileId"]=this.profileData.id;
                  report_defaults_temp["defaultProfileName"]=this.profileData.name;
            // let panelObj = {};
            // panelObj['moduleId'] = parseInt(this.profileData.drawing_defaults.subarray.moduleProperties.id);
            // panelObj['moduleMake'] = `${this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].manufacturer}  ${this.profileData.drawing_defaults.subarray.moduleProperties.model}`;

            // panelObj['moduleLength'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].length);
            // panelObj['moduleWidth'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].width);
            // panelObj['moduleSize'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].p_mp_ref / 1000);

            let  patchData = {

                name: this.profileData.name,
                distance_unit: this.profileData.distance_unit,
                wiring_unit: this.profileData.wiring_unit,
                shadows: this.profileData.shadows,
                start_time_auto_row_spacing: this.profileData.start_time_auto_row_spacing,
                end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
                start_date_heatmap: this.profileData.start_date_heatmap,
                end_date_heatmap: this.profileData.end_date_heatmap,
                start_time_heatmap: this.profileData.start_time_heatmap,
                end_time_heatmap: this.profileData.end_time_heatmap,
                default_solar_access_threshold: this.profileData.default_solar_access_threshold,
                default_table_types: this.profileData.default_table_types,
                constant_losses: this.profileData.constant_losses,
                report_defaults: report_defaults_temp,
                drawing_defaults: JSON.parse(JSON.stringify(this.profileData.drawing_defaults)),

            };
            // modifying module properties
            // patchData.drawing_defaults.subarray.moduleProperties = panelObj;

            try {
                let response = await API.DEFAULTS_PROFILE.PATCH_PROFILE(this.profileData.id, patchData);
                this.newEditProfileFormVisible = false;
            } catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in updating userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },

        async postNewProfile() {
     let report_defaults_temp=this.profileData.report_defaults;
      report_defaults_temp["defaultProfileId"]=this.profileData.id;
      report_defaults_temp["defaultProfileName"]=this.profileData.name;
            // let panelObj = {};

            // panelObj['moduleId'] = parseInt(this.profileData.drawing_defaults.subarray.moduleProperties.id);
            // panelObj['moduleMake'] = `${this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].manufacturer}  ${this.profileData.drawing_defaults.subarray.moduleProperties.model}`;

            // panelObj['moduleLength'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].length);
            // panelObj['moduleWidth'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].width);
            // panelObj['moduleSize'] = parseFloat(this.profileData.drawing_defaults.subarray.moduleProperties['characteristics'].p_mp_ref / 1000);

            let postData = {

                name: this.profileData.name,
                distance_unit: this.profileData.distance_unit,
                wiring_unit: this.profileData.wiring_unit,
                shadows: this.profileData.shadows,
                start_time_auto_row_spacing: this.profileData.start_time_auto_row_spacing,
                end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
                start_date_heatmap: this.profileData.start_date_heatmap,
                end_date_heatmap: this.profileData.end_date_heatmap,
                start_time_heatmap: this.profileData.start_time_heatmap,
                end_time_heatmap: this.profileData.end_time_heatmap,
                default_solar_access_threshold: this.profileData.default_solar_access_threshold,
                default_table_types: this.profileData.default_table_types,
                constant_losses: this.profileData.constant_losses,
                report_defaults: report_defaults_temp,
                drawing_defaults: JSON.parse(JSON.stringify(this.profileData.drawing_defaults)),

            };
            // modifying module properties
            // postData.drawing_defaults.subarray.moduleProperties = panelObj;

            try {
                let response = await API.DEFAULTS_PROFILE.POST_NEW_PROFILE(postData);
	                this.newEditProfileFormVisible = false;
            } catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in creating new userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },

        openSelectedComponent(data) {
            if (data.label === 'Objects'
                || data.label === 'Models'
                || data.label === 'Settings'
                || data.label === 'Components'
                || data.label === 'Cable'
                || data.label === 'Conduit'
                || data.label === 'Cabletray') {
                // doing nothing
            }
            else if (data.label === 'AC Cable') {
                this.activeNode = data.label;
                // set current component
                this.currentComponent = AcCableForm;
            }
            else if (data.label === 'DC Cable') {
                this.activeNode = data.label;
                // set current component
                this.currentComponent = DcCableForm;
            }
            else if (data.label === 'Single Conduit'
                    || data.label === 'Double Conduit'
                    || data.label === 'Double Separate Conduit') {
                this.activeNode = data.label;
                // set current component
                this.currentComponent = ConduitForm;
            }
            else if (data.label === 'Single Cabletray'
                    || data.label === 'Double Cabletray'
                    || data.label === 'Double Separate Cabletray') {
                this.activeNode = data.label;
                // set current component
                this.currentComponent = CabletrayForm;
            }
            else {
                this.activeNode = data.label;
                // set current component
                this.currentComponent = data.label + 'Form';
            }
        },

        setMeasurementUnitState(currentState) {
            this.distanceUnitBeforeOpeningProfile = currentState;
            this.SET_DISTANCE_UNIT(currentState);
        },

        setWiringUnitState(currentState) {
            this.wiringUnitBeforeOpeningProfile = currentState;
            this.SET_WIRING_UNIT(currentState);
        },

        resetMeasurementUnitState(onCloseDistanceUnitState) {
            // Reset the state if it is changed
            if (onCloseDistanceUnitState !== this.distanceUnitBeforeOpeningProfile) {
                this.SET_DISTANCE_UNIT(this.distanceUnitBeforeOpeningProfile);
            }
            // Remove all custom errors
            // this.clearMeasurementUnitCompErrors();
        },

        resetWiringUnitState(onCloseWiringUnitState) {
            // Reset the state if it is changed
            if (onCloseWiringUnitState !== this.wiringUnitBeforeOpeningProfile) {
                this.SET_WIRING_UNIT(this.wiringUnitBeforeOpeningProfile);
            }
            // Remove all custom errors
            // this.clearMeasurementUnitCompErrors();
        },

        onCancelNewEditProfile() {
            // do nothing
            this.newEditProfileFormVisible = false;

            this.$refs.newEditProfRef.setCurrentKey(this.defaultNodeKey);
            this.currentComponent = QuickViewForm;
            if(!this.isSaveClicked) {
                this.resetMeasurementUnitState(this.profileData.distance_unit);
                this.resetWiringUnitState(this.profileData.wiring_unit);
            }
        },

        async onSaveNewEditProfile() {
            this.isSaveClicked = true;
            this.disable=true;
            if (this.profileType === 'designVersionSettings') {
                // emmit to call save function in save.vue,
                // also saving the design when we are saving settings.
                // serverBus.$emit('settingsSaved');
                // patch design version
                await this.patchDesignVersionSettings()
                serverBus.$emit('settingsSaved');

            }
            else if (this.profileType === 'editProfile') {
                // patch
                await this.patchEditProfile();
            }
            else {
                // default is new userProfile
                await this.postNewProfile();
            }

            // database is not returning updated data 
            setTimeout(() => {
                serverBus.$emit('profilesUpdated');
                this.currentComponent = GeneralForm;
            }, 200);
            this.disable=false;
            this.isSaveClicked = false;
        },
    },
}
</script>

<style type="text/css" scoped>

#newProfile >>> .el-dialog__body {
    padding-left: 0px
}

#newProfile >>> .el-dialog {
    height: 80vh;
}

#newProfile >>> .el-input {
    width: 90%;
}

#newProfile >>> .el-dialog__footer {
   position: relative;
    margin: 0px;
    float: right;
    position: relative;
    bottom: 4%;
}

#newProfile >>> .el-dialog__header {
    margin-bottom: 0px;
}

#newProfile .el-tree {
    height: 65vh;
    padding-top: 15px;
}

#newProfile .dialog-footer {
    display: flex;
    justify-content: space-evenly;
}

#newProfile .el-col-24 {
    width: 90%;
}

#newProfile .el-select {
    width: 100%;
}

#newProfile .el-table th > .cell {
    font-size: 12px;
}

</style>

<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
