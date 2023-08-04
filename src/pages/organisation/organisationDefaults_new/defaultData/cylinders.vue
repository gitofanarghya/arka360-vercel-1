<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Base Height</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.coreHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Top Height</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.topHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Tilt</div>
            <div class="item_value">
              {{ profileData.drawing_defaults.cylinderModel.tilt }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Azimuth</div>
            <div class="item_value">
              {{ profileData.drawing_defaults.cylinderModel.azimuth }}
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Parapet Height</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.parapetHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Parapet Thickness</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.parapetThickness"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Setback Inside</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.setbackInside"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Setback Outside</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.setbackOutside"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Irradiance Map Threshold</div>
            <div class="item_value">
              <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.cylinderModel.heatMapThreshold"
                        :convert-value="true"/>
            </div>
          </div>
        </div>
        <!-- <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Placeable</div>
            <div class="item_value">
              <div class="toggle_btn">
                <input
                  type="checkbox"
                  class="checkbox"
                  checked
                  v-model="profileData.drawing_defaults.cylinderModel.placeable"
                  disabled
                />
                <div class="knobs"></div>
                <div class="layer"></div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Ignored</div>
            <div class="item_value">
              <div class="toggle_btn">
                <input
                  type="checkbox"
                  class="checkbox"
                  checked
                  v-model="profileData.drawing_defaults.cylinderModel.ignored"
                  disabled
                />
                <div class="knobs"></div>
                <div class="layer"></div>
              </div>
            </div>
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
  name: "CylindersDefaults",
  props: {
    profileData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      lockConstants: {
        CORE_HEIGHT_LOCKED,
        TOP_HEIGHT_LOCKED,
        TILT_LOCKED,
      },
      msg: " I am in cylindersDefaults",
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
