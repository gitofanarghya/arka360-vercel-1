<template>
  <div class="content_scroller">
    <div class="profile_container">
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Solar Access Threshold</div>
              <div class="item_value">{{ profileData.default_solar_access_threshold }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails" v-if="!isVipPowerGazebo">
              <div class="item_label">Show Structures</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input type="checkbox" class="checkbox" disabled v-model="profileData['drawing_defaults']['structures']['visible']">
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">High Resolution Shadows</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input type="checkbox" class="checkbox" disabled v-model="profileData['shadows']['high_resolution_shadows']">
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
           <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Rooftop Texture</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input type="checkbox" class="checkbox" disabled v-model="profileData['drawing_defaults']['texture']">
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col_row">
           <div class="col col_3">
            <div class="item_ditails" v-if="!isVipPowerGazebo">
              <div class="item_label" >Turn Modules black for Mono-Crystalline Modules</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input type="checkbox" class="checkbox" disabled v-model="profileData['drawing_defaults']['monocrystallinepanels']">
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5>Time consideration for Row Spacing (Solar Time)</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Start Time</div>
              <div class="item_value">{{ profileData.start_time_auto_row_spacing }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">End Time</div>
              <div class="item_value">{{ profileData.end_time_auto_row_spacing }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5>Measurement Units</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Wiring Unit</div>
              <div class="item_value">{{ profileData.wiring_unit=== "awg" ? "AWG" :"Sq.mm" }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Distance Unit</div>
              <div class="item_value">{{ profileData.distance_unit === "feet" ? "Feets & Inches" : "Meters" }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5>Time consideration for Irradiance map</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Irradiance map Start Date</div>
              <div class="item_value">{{dateToString(profileData.start_date_heatmap)}}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Irradiance map End Date</div>
              <div class="item_value">{{dateToString(profileData.end_date_heatmap)}}</div>
            </div>
          </div>
        </div>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Irradiance map Start Time</div>
              <div class="item_value">{{ profileData.start_time_heatmap }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Irradiance map End Time</div>
              <div class="item_value">{{ profileData.end_time_heatmap }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'settingsGeneralDefaults',
  props: ['profileData'],
  data() {
    return {
      isVipPowerGazebo: false,
      msg: ' I am in settingsGeneralDefaults',
    }
  },
  async mounted () {
    this.isVipPowerGazebo = await this.setGazeboStatus();
  },
  methods: {
    async setGazeboStatus() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
          responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      return Promise.resolve(responseData.vip_for_power_gazebo);
    },
  dateToString: function(_dateString) {
    var mydate = new Date(_dateString);
    var date = mydate.toDateString();
    var splitDate = date.split(" ");
    var finalDate = "";
    for (var i = 1; i< splitDate.length -1;i++ ) {
        finalDate = splitDate[i]+ " " + finalDate ;
    }
    return finalDate;
  }
}
} 

</script>
<style scoped>
.item_label{
  font-size: 16px !important;
}.profile_data h5 {
    color: var(--primary);
    font-size: 16px;
    padding-top: 8px;
}
</style>