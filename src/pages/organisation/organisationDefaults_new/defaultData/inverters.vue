<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Azimuth</div>
            <div class="item_value">{{ profileData.drawing_defaults.inverter.azimuth }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Mount Height</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.inverter.mountHeight"/></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvertersDefaults',
  props: {
    profileData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      msg: ' I am in invertersDefaults',
    };
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