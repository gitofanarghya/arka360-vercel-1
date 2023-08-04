<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Material Type</div>
            <div class="item_value">{{ profileData.drawing_defaults.acCable.materialType }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">No. of Cores</div>
            <div class="item_value">{{ profileData.drawing_defaults.acCable.cores }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails" v-if="profileData.wiring_unit === 'awg'">
            <div class="item_label">Size of Cable (in AWG)</div>
            <div class="item_value">{{ profileData.drawing_defaults.acCable.cableSizeAWG }}</div>
          </div>
          <div class="item_ditails" v-else>
            <div class="item_label">Size of Cable (in mm<sup>2</sup>)</div>
            <div class="item_value">{{ profileData.drawing_defaults.acCable.cableSizeMM }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AcCableDefaults',
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
      msg: ' I am in acCableDefaults',
    };
  },
};
</script>
<style scoped>
.item_label{
  font-size:16px;
}
</style>