<template>
  <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
    <div class="content_section">
      <div class="filter_section">
        <div class="title">Manage Components</div>
        <div class="starred_action">
          <div class="toggle-button-cover">
            <h5>
              Use starred components only
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    If you turn off the toggle, your organization will be able
                    to view/use all the inverters/modules available on The Solar Labs
                    database
                  </p>
                </div>
              </div>
            </h5>
            <div class="toggle_btn">
              <input type="checkbox" class="checkbox" v-model="onlyFavoritesVisible" />
              <div class="knobs"></div>
              <div class="layer"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="favorite_section">
        <div class="tabs_section">
          <ul class="tabs_list">
            <li :class="{ active: isActive }" @click="setPanelTrue">
              <!-- <li @click="setPanelTrue"> -->
              <span class="fontChange">Modules</span>
            </li>
            <li :class="{ active: !isActive }" @click="setPanelFalse">
              <span class="fontChange">Inverters</span>
            </li>
          </ul>
        </div>
        <panelListView :is-active="isActive" />
        <inverterListView :is-active="isActive" />
      </div>
    </div>
  </section>
</template>

<script>
import inverterListView from "./inverterListView.vue";
import panelListView from "./panelListView.vue";
import API from '@/services/api';
import { isCrmUser } from "../../../utils";

export default {
  components: {
    inverterListView,
    panelListView,
  },
  data() {
    return {
      currentAtPanel: true,
      isActive: true,
      addPanelVisible: false,
      inverterListToDisplay: [],
      favInverterListToDisplay: [],
      displayFavOrAllInverter: "ALL",
      displayFavOrAllPanel: "ALL",
      onlyFavoritesVisible:false,
    };
  },
  mounted(){
    this.fetchPermission();
  },
  methods: {
    isCrmUser,
    async fetchPermission(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      try{
        // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisationId);
        let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
        if(!Object.keys(responseData).length){
           responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
        }
        if(responseData.is_inverter_restricted && responseData.is_panel_restricted){
          this.onlyFavoritesVisible=true;
        }
        else
        this.onlyFavoritesVisible=false;
      }
      catch{
        this.$message({
          showClose: true,
          message: "Error in fetching Organisation Data",
          type: "error",
          center: true
        });
      }
    },
    async changePermission(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      let patchData={};
      if(this.onlyFavoritesVisible){
        patchData = {
          is_inverter_restricted:true,
          is_panel_restricted: true,
        }
      }
      else{
        patchData = {
          is_inverter_restricted:false,
          is_panel_restricted: false,
        }
      }
      const response= await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(organisationId, patchData);
      localStorage.setItem('organisation',JSON.stringify(response.data));

    },
    setPanelToAll() {
      this.displayFavOrAllPanel = "ALL";
    },

    setPanelToFav() {
      this.displayFavOrAllPanel = "FAV";
    },

    setInverterToAll() {
      this.displayFavOrAllInverter = "ALL";
    },
    setInverterToFav() {
      this.displayFavOrAllInverter = "FAV";
    },
    setPanelTrue() {
      this.isActive = true;
      this.currentAtPanel = true;
    },
    setPanelFalse() {
      this.isActive = false;
      this.currentAtPanel = false;
    }, 
  },
  watch:{
      onlyFavoritesVisible:{
        handler(){
            this.changePermission();
        }
      }

  }
};
</script>

<style scoped>
.infiniteScrollLoader {
  font-size: 20px;
}

.tabs_list .fontChange {
  font-size: 15px;
}

@media (min-width: 1281px) {
.right_sectionCRM {
  width: calc(100% - 74px) !important;
  margin-left: auto;
}
}
</style>