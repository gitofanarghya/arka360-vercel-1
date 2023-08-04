<template>
  <div
    class="modal add_panel_modal"
    id="losses"
    v-if="newEditProfileFormVisible"
    style="z-index:1000"
  >
    <div class="modal-overlay modal-toggle" data-dismiss="modal"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Design Defaults</h4>
          <button
            class="modal-close modal-toggle"
            data-dismiss="modal"
            @click="newEditProfileFormVisible = false;"
          >
            <span class="close"></span>
          </button>
        </div>
        <div class="search_in_modal">
          <input type="search"
           v-model="profileData.name"
           v-validate="profileNameValidation"
           name="Design Profile Name"
           placeholder="Enter Design Profile Name"/>
           <p class="formErrors"><span>{{ errors.first('Design Profile Name') }}</span></p>
        </div>
        <div class="add_panel_content">
          <aside class="panel_types">
            <ul class="properties_nav">
              <li class="inside_items" @click="activteCurrentCategory({ label: 'QuickViewSettings', id: 20 })">
                <span :class="{ 'active-category': activeCategory === 20 }">
                  Quick-View 
                </span>
              </li>
              <li
                 class="inside_items" :class="{ activeSetting }"
                @click="activteCurrentCategory({ label: 'settings', id: 0 })"
                key="0"
              >
                <span :class="{ 'active-category': activeCategory === 0 }" @click="toggleClassSetting();"
                  >Settings <img src="../../../assets/drop/group-44.png" class="dropDownArrow"></span
                >
                <ul class="propertis_navbar" id="settings_navbar">
                  <li
                    :class="{ active: data.id === activeData }"
                    v-for="data in settingsData"
                    :key="data.id"
                    @click="openSelectedComponent(data)"
                  >
                    <span v-if="data.label !== 'AutoModulePlacement'">{{ data.label }}</span>
                    <i class="fas fa-arrow-right"></i>
                  </li>
                </ul>
              </li>
              <li class="inside_items" :class="{ activeObject }">
                <span :class="{ 'active-category': activeCategory > 0 && activeCategory !== 20 }" @click="toggleClassObject();"
                  >Object <img src="../../../assets/drop/group-44.png" class="dropDownArrow"></span
                >
                <ul class="propertis_navbar" id="objects_navbar">
                  <li
                    class="inside_items"
                    v-for="category in objectsData"
                    :key="category.id"
                    @click="activteCurrentCategory(category)"
                  >
                    <span
                      :class="{
                        'active-category': activeCategory === category.id,
                      }" @click="toggleClassInsideObject(category.label);"
                      >{{ category.label }}<img  src="../../../assets/drop/group-44.png" v-if="category.label !== 'Subarray'" class="dropDownArrow"></span
                    >
                    <ul class="sub_navbar" :id="category.label" :class="[{activeModel:activeModel} ,{activeAC: activeAC}]">
                      <li
                        :class="{ active: data.id === activeData }"
                        v-for="data in category.children"
                        :key="data.id"
                        @click="openSelectedComponent(data)"
                      >
                        <span>{{ data.label }}</span>
                        <i class="fas fa-arrow-right"></i>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </aside>
          <div class="right_aside">
            <div class="inside_form">
              <div class="floating-form pt_0">
                <keep-alive>
                  <component
                    :is="currentComponent"
                    :profileData="profileData"
                    :profile-type="profileType"
                  />
                </keep-alive>
              </div>
            </div>
            <div class="form_footer">
              <div class="sumbmit_btn" style="justify-content: flex-end;">
                <input
                  class="btn btn-primary"
                  type="submit"
                  value="Save"
                  @click="onSaveNewEditProfile"
                  :disabled="errors.items.length > 0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from "../../../services/api/";
import { serverBus } from "../../../main";
import { mapActions } from "pinia";
import { useDesignStore } from "../../../stores/design";
import PolygonForm from "./newProfileForms/objectsForms/polygonForm.vue";
import CylinderForm from "./newProfileForms/objectsForms/cylinderForm.vue";
import TreeForm from "./newProfileForms/objectsForms/treeForm.vue";
import InverterForm from "./newProfileForms/objectsForms/inverterForm.vue";
import ACDBForm from "./newProfileForms/objectsForms/acdbForm.vue";
import WalkwaysForm from "./newProfileForms/objectsForms/walkwayForm.vue";
import SubarrayForm from "./newProfileForms/objectsForms/subarrayForm/subarrayForm.vue";
import GeneralForm from "./newProfileForms/settingsForms/generalSettings.vue";
import ReportForm from "./newProfileForms/settingsForms/reportSettings.vue";
import AutoPanelPlacementForm from "./newProfileForms/settingsForms/autoPanelPlacementSettings.vue";
import LossesForm from "./newProfileForms/settingsForms/lossesSettings.vue";
import AcCableProperties from "../../studio/sappane/properties/acCableProperties.vue";
import ACDBProperties from "../../studio/sappane/properties/acdbProperties.vue";
import AcCableForm from "./newProfileForms/objectsForms/acCableForm.vue";
import SmartroofForm from './newProfileForms/objectsForms/smartroofForm.vue';
import QuickViewSettingsForm from './newProfileForms/objectsForms/quickViewSettings.vue';
import debounce from "debounce";
export default {
  name: "newProfile",
  data() {
    return {
      activeSetting:true,
      activeObject:true,
      activeModel:true,
      activeAC:true,
      isSelectedPanelFetching: true,
      newEditProfileFormVisible: false,
      currentComponent: QuickViewSettingsForm,
      currentComponentData: "",
      profileNameValidation: {
        required: true,
      },
      activeNode: "QuickViewSettings",
      activeCategory: 20,
      profileType: "",
      isNewProfile: "",
      isDesignVersionSetting: false,
      profileData: "",
      originalProfileData: "",
      activeData: null,
      settingsData: [
        {
          id: 1,
          label: "General",
        },
        {
          id: 2,
          label: "Losses",
        },
        {
          id: 3,
          label: "AutoModulePlacement",
        },
        {
          id: 4,
          label: "Report",
        },
      ],
      objectsData: [
        {
          id: 5,
          label: "Models",
          children: [
            {
              id: 6,
              label: "Polygon",
            },
            {
              id: 7,
              label: "Cylinder",
            },
            {
              id: 77,
              label: "Smartroof",
            },
            {
              id: 8,
              label: "Walkways",
            },
            {
              id: 9,
              label: "Tree",
            },
          ],
        },
        // {
        //   id: 10,
        //   label: "Subarray",
        //   children: [],
        // },
        // {
          // id: 11,
          // label: "Components",
          // children: [
          //   {
          //     id: 12,
          //     label: "Inverter",
          //   },
            //this code is hidden temporarily.ACDB_HIDE
            // {
            //   id: 13,
            //   label: "ACDB",
            // },
            /* {
              id: 14,
              label: "AC Cable",
            }, */
          // ],
        // },
      ],
      distanceUnitBeforeOpeningProfile: null,
      wiringUnitBeforeOpeningProfile: null,
      profileDataNameError:false,
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
    InverterForm,
    ACDBForm,
    AcCableProperties,
    AcCableForm,
    SmartroofForm,
    QuickViewSettingsForm,
  },
  props:{
        selectedProperty:Object
  },
  async mounted() {
    this.isVipPowerGazebo = await this.setGazeboStatus();
    const isOrgUnirac = await this.isOrganisationUnirac();
    if (!this.isVipPowerGazebo){
      this.objectsData.push( {
        id: 10,
        label: "Subarray",
        children: [],
      });
      this.objectsData.push({
        label: "Components",
        children: [
          {
            id: 12,
            label: "Inverter",
          },
        ],
      });
    }
    serverBus.$on("newEditProfileVisible", (profileData, profileType) => {
      this.profileType = profileType;
      this.profileData = JSON.parse(JSON.stringify(profileData));
      this.setMeasurementUnitState(this.profileData.distance_unit);
      this.setWiringUnitState(this.profileData.wiring_unit);
      // this.currentComponent = QuickViewSettingsForm;
      switch(this.$props.selectedProperty.id){
        case 20:
          this.currentComponent = QuickViewSettingsForm;
          this.activeData = 10;
          this.activeCategory = 20;
          break;
        case 1:
          this.currentComponent = GeneralForm;
          this.activeData = 1;
          this.activeCategory = 0;
          break;
        case 2:
          this.currentComponent = LossesForm;
          this.activeData = 2;
          this.activeCategory = 0;
          break;
        case 4:
          this.currentComponent = ReportForm;
          this.activeData = 4;
          this.activeCategory = 0;
          break;
        case 6:
          this.currentComponent = PolygonForm;
          this.activeData = 6;
          this.activeCategory = 5;
          break;
        case 7:
          this.currentComponent = CylinderForm;
          this.activeData = 7;
          this.activeCategory = 5;
          break;
        case 77:
          this.currentComponent = SmartroofForm;
          this.activeData = 77;
          this.activeCategory = 5;
          break;
        case 8:
          this.currentComponent = WalkwaysForm;
          this.activeData = 8;
          this.activeCategory = 5;
          break;
        case 9:
          this.currentComponent = TreeForm;
          this.activeData = 9;
          this.activeCategory = 5;
          break;
        case 10:
          this.currentComponent = SubarrayForm;
          this.activeData = 10;
          this.activeCategory = 10;
          break;
        case 12:
          this.currentComponent = InverterForm;
          this.activeData = 12;
          this.activeCategory = undefined;
          break;
        default:
          this.currentComponent = GeneralForm;
          this.activeData = 1;
          this.activeCategory = 0;
      }
      // if(isOrgUnirac) {
      //     this.currentComponent = QuickViewSettingsForm;
      //     this.activeData = 10;
      //     this.activeCategory = 20;
      // }
      // else{
          // this.currentComponent = GeneralForm;
          // this.activeData = 1;
          // this.activeCategory = 0;
      // }
      this.newEditProfileFormVisible = true;
    });
  },

  beforeDestroy() {
    serverBus.$off("newEditProfileVisible");
  },
  created() {
    this.onSaveNewEditProfile = debounce(this.onSaveNewEditProfile, 500);
  },
  methods: {
    ...mapActions(useDesignStore, [
      "SET_DISTANCE_UNIT",
      "SET_WIRING_UNIT",
      "UPDATE_DESIGN_VERSION_SETTINGS"
    ]),
    async setGazeboStatus() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
          responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      return Promise.resolve(responseData.vip_for_power_gazebo);
    },
    async isOrganisationUnirac() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const organisationId = user.organisation_id;

      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!Object.keys(responseData).length && organisationId){
          responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      return (responseData.name === 'Unirac' && responseData.id === 114 );
    },
    async fetchSelectedPanel() {
      try {
        this.isSelectedPanelFetching = true;
        const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(
          this.profileData.drawing_defaults.subarray.moduleProperties.moduleId
        );
        this.profileData.drawing_defaults.subarray.moduleProperties =
          response.data;
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
        start_time_auto_row_spacing: this.profileData
          .start_time_auto_row_spacing,
        end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
        start_date_heatmap: this.profileData.start_date_heatmap,
        end_date_heatmap: this.profileData.end_date_heatmap,
        start_time_heatmap: this.profileData.start_time_heatmap,
        end_time_heatmap: this.profileData.end_time_heatmap,
        default_solar_access_threshold: this.profileData
          .default_solar_access_threshold,
        default_table_types: this.profileData.default_table_types,
        constant_losses: this.profileData.constant_losses,
        report_defaults: report_defaults_temp,
        drawing_defaults: JSON.parse(
          JSON.stringify(this.profileData.drawing_defaults)
        ),
      };

      try {
        this.UPDATE_DESIGN_VERSION_SETTINGS(patchData);
        serverBus.$emit("designVersionSettingsUpdated", patchData);
      } catch (e) {
        if (typeof e.response !== "undefined" && e.response.status === 403) {
          this.$message({
            showClose: true,
            message: "You are not allowed to edit design settings.",
            type: "error",
            center: true
          });
        } else {
          this.$message({
            showClose: true,
            message: "Error in updating design settings. Try again.",
            type: "error",
            center: true
          });
        }
      }

     // this.newEditProfileFormVisible = false;
    },

    async patchEditProfile() {
            let report_defaults_temp=this.profileData.report_defaults;
            report_defaults_temp["defaultProfileId"]=this.profileData.id;
            report_defaults_temp["defaultProfileName"]=this.profileData.name;
            
      let patchData = {

        name: this.profileData.name,
        distance_unit: this.profileData.distance_unit,
        wiring_unit: this.profileData.wiring_unit,
        shadows: this.profileData.shadows,
        start_time_auto_row_spacing: this.profileData
          .start_time_auto_row_spacing,
        end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
        start_date_heatmap: this.profileData.start_date_heatmap,
        end_date_heatmap: this.profileData.end_date_heatmap,
        start_time_heatmap: this.profileData.start_time_heatmap,
        end_time_heatmap: this.profileData.end_time_heatmap,
        default_solar_access_threshold: this.profileData
          .default_solar_access_threshold,
        default_table_types: this.profileData.default_table_types,
        constant_losses: this.profileData.constant_losses,
        report_defaults: report_defaults_temp,
        drawing_defaults: JSON.parse(
          JSON.stringify(this.profileData.drawing_defaults)
        ),
      };
      try {
        let response = await API.DEFAULTS_PROFILE.PATCH_PROFILE(
          this.profileData.id,
          patchData
        );
        //this.newEditProfileFormVisible = false;
      } catch (e) {
        this.$message({
          showClose: true,
          message: "Error in updating userProfile. Try again.",
          type: "error",
          center: true
        });
      }
    },

    async postNewProfile() {
                  let report_defaults_temp=this.profileData.report_defaults;
            report_defaults_temp["defaultProfileId"]=this.profileData.id;
            report_defaults_temp["defaultProfileName"]=this.profileData.name;
            console.log("Report DEfault Temp ",report_defaults_temp);
      let postData = {
        name: this.profileData.name,
        distance_unit: this.profileData.distance_unit,
        wiring_unit: this.profileData.wiring_unit,
        shadows: this.profileData.shadows,
        start_time_auto_row_spacing: this.profileData
          .start_time_auto_row_spacing,
        end_time_auto_row_spacing: this.profileData.end_time_auto_row_spacing,
        start_date_heatmap: this.profileData.start_date_heatmap,
        end_date_heatmap: this.profileData.end_date_heatmap,
        start_time_heatmap: this.profileData.start_time_heatmap,
        end_time_heatmap: this.profileData.end_time_heatmap,
        default_solar_access_threshold: this.profileData
          .default_solar_access_threshold,
        default_table_types: this.profileData.default_table_types,
        constant_losses: this.profileData.constant_losses,
        report_defaults: report_defaults_temp,
        drawing_defaults: JSON.parse(
          JSON.stringify(this.profileData.drawing_defaults)
        ),
      };
      try {
        let response = await API.DEFAULTS_PROFILE.POST_NEW_PROFILE(postData);
        //this.newEditProfileFormVisible = false;
      } catch (e) {
        this.$message({
          showClose: true,
          message: "Error in creating new userProfile. Try again.",
          type: "error",
          center: true
        });
      }
    },

    openSelectedComponent(data) {
      this.activeData = data.id;
      if (data.label === "AC Cable") this.currentComponent = "AcCableForm";
      else this.currentComponent = data.label + "Form";
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

      this.$refs.newEditProfRef.setCurrentKey(23);
      this.currentComponent = QuickViewSettingsForm;
      this.resetMeasurementUnitState(this.profileData.distance_unit);
      this.resetWiringUnitState(this.profileData.wiring_unit);
    },

    async onSaveNewEditProfile() {

      const isValid = await this.$validator.validateAll();

      if(!isValid)
      return;
      
      if (this.profileType === "designVersionSettings") {
        // emmit to call save function in save.vue,
        // also saving the design when we are saving settings.
        serverBus.$emit("settingsSaved");
        // patch design version
        await this.patchDesignVersionSettings();
      } else if (this.profileType === "editProfile") {
        // patch
        await this.patchEditProfile();
      } else {
        // default is new userProfile
        await this.postNewProfile();
      }

      // database is not returning updated data
      setTimeout(() => {
        serverBus.$emit("profilesUpdated");
       // this.currentComponent = GeneralForm;
        this.$message({
        showClose: true,
        message: " Design Profile is Updated Successfully.",
        type: "success",
        center: true
      });
      }, 200);
    },
    activteCurrentCategory(category) {
      this.activeCategory = category.id;
      if (category.id === 10 || category.id === 20) {
        this.openSelectedComponent(category);
      }
    },
    gotoNextComponent() {
      if (this.activeData === 0) this.activeData++;
      this.activeData = (this.activeData + 1) % 15;
      // this.openSelectedComponent()
    },
    toggleClassSetting(){
      this.activeSetting =!this.activeSetting;
    },
    toggleClassObject(){
      this.activeObject =!this.activeObject;
    },
    toggleClassInsideObject(category){
      if(category==='Models')
      this.activeModel = !this.activeModel;
      else if(category==='Components')
      this.activeAC = !this.activeAC;
    }
  },
};
</script>


<style scoped>
.formErrors{
  color: red;
  font-size: 12px;
  margin-top: 8px !important;

}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items #settings_navbar{
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeSetting #settings_navbar{
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items #objects_navbar{
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar{
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Models {
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Models.activeModel {
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Components {
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Components.activeAC {
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items #objects_navbar .inside_items #Subarray:after{
  display: none;
}

.modal.add_panel_modal .add_panel_content .panel_types {
    background: var(--light-blue);
    padding: 12px 0;
    width: 20% !important;
        min-height: 492px;
    overflow-y: scroll;
}


@media (max-width: 767px){

  .modal.add_panel_modal .modal-wrapper .modal-content{
    height: 95vh !important;
  }

.modal.add_panel_modal .add_panel_content .panel_types {
    width: 100% !important;
    min-height: 0px !important;
}
.modal .modal-wrapper .modal-content .add_panel_content .properties_nav .inside_items.activeObject #objects_navbar[data-v-8cd8d620] {
    visibility: visible;
    max-height: 495px !important;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
}

.modal.add_panel_modal .add_panel_content .right_aside{
  width: 100% !important;
}

.modal.add_panel_modal .add_panel_content .right_aside .inside_form{
  padding: 16px 8px !important;
}
}

.properties_nav .inside_items:after{
  display: none !important;
}



.dropDownArrow{
  float: right;
  width: 18px;
  transition: 0.3s;
}

.dropDownArrow:active{
 transform: rotate(-90deg);
}

.properties_nav span{
  padding: 8px 15px 8px 24px !important;
}

.properties_nav>li .propertis_navbar>li span{
  padding: 8px 36px !important;
}

.properties_nav>li .propertis_navbar>li .sub_navbar li span{
  padding-left: 46px !important;
}

.properties_nav .inside_items .propertis_navbar .inside_items>span {
    color: var(--step-200);
    padding-right: 15px !important;
}

.modal.add_panel_modal .modal-wrapper .modal-content .modal-header {
    height: 48px !important;
}

.modal.add_panel_modal .modal-wrapper .modal-content .search_in_modal input::placeholder{
  color: #222 !important;
}

.modal.add_panel_modal .modal-wrapper .modal-content .search_in_modal input{
  color: #222 !important;
  font-size: 16px !important;
  height: 48px !important;
}
</style>