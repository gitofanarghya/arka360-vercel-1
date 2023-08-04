<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Soiling</div>
            <div class="item_value">{{ profileData.constant_losses.irradiance.soiling }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Mismatch</div>
            <div class="item_value">{{ profileData.constant_losses.dc.mismatch }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">LID</div>
            <div class="item_value">{{ profileData.constant_losses.dc.lid }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">DC Ohmic</div>
            <div class="item_value">{{ profileData.constant_losses.dc.dc_ohmic }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">AC Ohmic</div>
            <div class="item_value">{{ profileData.constant_losses.ac.ac_ohmic }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Unavailibility</div>
            <div class="item_value">{{ profileData.constant_losses.ac.unavailability }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Module Degradation Rate</div>
            <div class="item_value">{{ profileData.constant_losses.module_degradation_rate }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Inverter Efficiency</div>
            <div class="item_value">{{ profileData.constant_losses.inverter_efficiency }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'settingsLossesDefaults',
  props: ['profileData'],
  data() {
    return {
      msg: ' I am in settingsLossesDefaults',
    }
  },
}
</script>
<style scoped>
.design_section .col_area .item_ditails .item_label {
    font-size: 16px;
    color: var(--step-250);
}
.item_label{
  font-size: 16px;
}
</style>