<template>
  <div class='col_area finel_profile'>
    <div class="header_title">
      <h1>{{propertyTitle}}</h1>
      <div class="action_items">
        <i data-toggle="modal" data-target="#general_profile" class="fas fa-pencil-alt" @click="editProfile"></i>
        <i class="fas fa-trash-alt" @click="deleteProfile"></i>
      </div>
    </div>
    <keep-alive>
      <component
        :is="currentComponent"
        :profile-data="profileData"/>
    </keep-alive>
    <ConfirmProfileDelete v-if="isDeletePopupOpen" :id="profileIdToDelete" @closeDeleteProfilePopup="isDeletePopupOpen = !isDeletePopupOpen"/>
  </div>
</template>

<script>

import { serverBus } from '../../../../main';
import API from '@/services/api';
import PolygonDefaults from './polygons.vue';
import CylinderDefaults from './cylinders.vue';
import TreeDefaults from './trees.vue';
import InverterDefaults from './inverters.vue';
import ACDBDefaults from './acdb.vue';
import SubarrayDefaults from './subarray/subarray.vue';
import WalkwaysDefaults from './walkways.vue';
import AutoPanelPlacementDefaults from './settings/app.vue';
import LossesDefaults from './settings/losses.vue';
import ReportDefaults from './settings/report.vue';
import AcCableDefaults from './acCable.vue';
import GeneralDefaults from './settings/general.vue'
import ConfirmProfileDelete from './confirmDeleteProfilePopup.vue';
import SmartroofDefaults from './smartroofs.vue';
import QuickViewDefaults from './quickView.vue';

export default {
  name: 'defaultsData',
  props: ['profileData'],
  components: {
    GeneralDefaults,
    AutoPanelPlacementDefaults,
    LossesDefaults,
    AcCableDefaults,
    PolygonDefaults,
    CylinderDefaults,
    TreeDefaults,
    InverterDefaults,
    ACDBDefaults,
    SubarrayDefaults,
    WalkwaysDefaults,
    ReportDefaults,
    ConfirmProfileDelete,
    SmartroofDefaults,
    QuickViewDefaults,
  },
  data() {
    return {
      msg: ' I am in defaultsData',
      currentComponent: 'QuickViewDefaults',
      isDeletePopupOpen: false,
      profileIdToDelete: -1,
    }
  },
  computed: {
    propertyTitle() {
      return this.currentComponent.replace('Defaults',' Properties');
    },
  },
  methods: { 
    async deleteProfile() {
      // try {
      //   await API.DEFAULTS_PROFILE.DELETE_PROFILE(this.profileData.id);
      //   this.$message({
      //     showClose: true,
      //     message: 'Profile deleted successfully.',
      //     type: 'success',
      //     center: true
      //   });
      //   serverBus.$emit('profilesUpdated');
      // } catch (e) {
      //   this.$message({
      //     showClose: true,
      //     message: 'Error in deleting profile. Try again.',
      //     type: 'error',
      //     center: true
      //   });
      // }
      this.isDeletePopupOpen = !this.isDeletePopupOpen;
      this.profileIdToDelete = this.profileData.id;
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
    editProfile() {
      serverBus.$emit('newEditProfileVisible', this.profileData, 'editProfile');
    },
  },
  async mounted() {
    serverBus.$on('component', (body) => {
      if (body === 'AC Cable') {
        this.currentComponent = 'AcCableDefaults';
      }
      else if (body === 'Quick View') {
        this.currentComponent = 'QuickViewDefaults';
      }
      else {
        this.currentComponent = body + 'Defaults';
      }
    });
    const isOrgUnirac = await this.isOrganisationUnirac();
    if(isOrgUnirac) {
        this.currentComponent = 'QuickViewDefaults';
    }
    else{
        this.currentComponent = 'GeneralDefaults';
    }
  }, 

  watch: {
    profileData: function (newVal) {
      this.profileData = newVal;
    },
  },
}
</script>

<style scoped>
::v-deep .checkbox {
  pointer-events: none;
  }
</style>