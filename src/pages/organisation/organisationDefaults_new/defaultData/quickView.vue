<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Smartroof Model Tilt</div>
            <div class="item_value">
              {{ profileData.drawing_defaults.smartroofModel.tilt }}
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails" v-if="!isVipPowerGazebo">
            <div class="item_label">PV Module</div>
            <div class="item_value">{{ profileData.drawing_defaults.subarray.flushMount.moduleProperties.moduleMake }}</div>
          </div>
        </div>
      </div>
    </div>
    <p> Smartroof Setbacks </p>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Ridge</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.ridge"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Eaves</div>
            <div class="item_value">
               <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.eaves"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Hips</div>
            <div class="item_value">
               <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.hips"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Valley</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.valley"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Rack</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.rack"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isOrgUnirac" class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Number of Modules</div>
            <div class="item_value">{{ profileData.drawing_defaults.quickView.totalModules}}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Total Module Area</div>
            <div class="item_value">{{ profileData.drawing_defaults.quickView.moduleArea}}%</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Total Roof Area</div>
            <div class="item_value">{{ profileData.drawing_defaults.quickView.roofArea}}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  TOP_HEIGHT_LOCKED,
  CORE_HEIGHT_LOCKED,
  TILT_LOCKED,
} from "../../../../core/coreConstants";

export default {
  name: "QuickViewDefaults",
  props: ["profileData"],
  
  data() {
    return {
      lockConstants: {
        CORE_HEIGHT_LOCKED,
        TOP_HEIGHT_LOCKED,
        TILT_LOCKED,
      },
      msg: " I am in polygonsDefaults",
      isOrgUnirac : false,
      isVipPowerGazebo: false,
    };
  },
  async mounted() {
    this.isVipPowerGazebo = await this.setGazeboStatus();
    this.isOrganisationUnirac();
  },
  methods: {
    async isOrganisationUnirac() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const organisationId = user.organisation_id;
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!Object.keys(responseData).length){
        responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      this.isOrgUnirac = (responseData.name === 'Unirac' && responseData.id === 114 );
    },
    async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        }
  },
};
</script>
<style scoped>
.item_label{
  font-size:16px;
}
.design_section .col_area .item_ditails .item_label {
    font-size: 16px;
    color: var(--step-250);
}
</style>
