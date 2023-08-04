<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Base Height</div>
            <div class="">
               <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.coreHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Top Height</div>
            <div class="item_value">
                <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.topHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Tilt</div>
            <div class="item_value">
              {{ profileData.drawing_defaults.polygonModel.tilt }}
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
              {{ profileData.drawing_defaults.polygonModel.azimuth }}
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Parapet Height</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.parapetHeight"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Parapet Thickness</div>
            <div class="item_value">
               <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.parapetThickness"/>
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
                        :metric-value="profileData.drawing_defaults.polygonModel.setbackInside"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Setback Outside</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.setbackOutside"/>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Irradiance Map Threshold</div>
            <div class="item_value">
             <display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.polygonModel.heatMapThreshold"
                        :convert-value="true"/>
            </div>
          </div>
        </div>
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
                  disabled
                  v-model="profileData.drawing_defaults.polygonModel.ignored"
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
  name: "PolygonsDefaults",
  props: ["profileData"],
  
  data() {
    return {
      lockConstants: {
        CORE_HEIGHT_LOCKED,
        TOP_HEIGHT_LOCKED,
        TILT_LOCKED,
      },
      msg: " I am in polygonsDefaults",
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
