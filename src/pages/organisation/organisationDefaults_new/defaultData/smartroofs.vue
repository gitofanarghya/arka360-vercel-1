<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Base Height</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.smartroofModel.coreHeight"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Tilt</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.smartroofModel.tilt"/></div>
          </div>
        </div>
        <!-- <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Setback Inside</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.smartroofModel.setbackInside"/></div>
          </div>
        </div> -->
        </div>
      </div>
      <span><h3>Smartroof Setbacks</h3></span>
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Setback Inside</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.ridge"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Ridge</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.ridge"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Eaves</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.eaves"/></div>
          </div>
        </div>
      </div>
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Hips</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.hips"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Valley</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.valley"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Rack</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                    :metric-value="profileData.drawing_defaults.quickView.smartroofSetbacks.rack"/></div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>

export default {
    name: 'SmartroofsDefaults',
    props: ['profileData'],
    data() {
        return {
            msg: ' I am in smartroofDefaults',
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
.profile_data h3 {
    color: var(--primary);
    font-size: 16px;
    padding-top: 8px;
}
</style>
