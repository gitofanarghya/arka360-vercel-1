<template>
  <div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col grow_1">
          <div class="item_ditails">
            <div class="item_label">PV Module</div>
            <div class="item_value">{{ templateData.moduleProperties.moduleMake }}</div>
          </div>
        </div>
        <div class="col col_3 mob_grow_1">
          <div class="item_ditails">
            <div class="item_label">Structure Type</div>
            <div class="floating-label">  
              <select class="floating-select" disabled>
                <option value="">Select</option>
              </select>
              <!-- <p>*Not Selected</p> -->
            </div>
            <p>*No Structure Type Selected</p>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3" v-if="templateData.rowSpacingMode === manualRowSpacing">
          <div class="item_ditails">
            <div class="item_label">Tilt</div>
            <div class="item_value">{{ templateData.tilt }}</div>
          </div>
        </div>
        <div class="col col_3" v-if="templateData.rowSpacingMode === manualRowSpacing">
          <div class="item_ditails">
            <div class="item_label">Azimuth</div>
            <div class="item_value">{{ templateData.azimuth }}</div>
          </div>
        </div>
        <div class="col col_3" v-if="templateData.rowSpacingMode === manualRowSpacing">
          <div class="item_ditails">
            <div class="item_label">Row Spacing</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.rowSpacing"/></div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Module Orientation</div>
            <div class="item_value">{{ templateData.panelOrientation }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Array Rows</div>
            <div class="item_value">{{ templateData.tableSizeUp }}</div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Array Columns</div>
            <div class="item_value">{{ templateData.tableSizeWide }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Table Spacing</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.tableSpacing"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Vertical Module Spacing</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.moduleSpacingUp"/></div>
          </div>
        </div>
         <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Horizontal Module Spacing</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.moduleSpacingWide"/></div>
          </div>
        </div>
      </div>
    </div>
    <div class="profile_data">
      <div class="col_row">
     <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Mount Height</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.mountHeight"/></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { ROW_SPACING_MODE_MANUAL } from '../../../../../core/coreConstants';

export default {
  name: 'SubarrayFlushDefaults',
  props: {
    templateData: {
      type: Object,
      default() {
        return {};
      },
    },
    mountType: {
      type: String,
      default: 'fixed',
    },
  },
  data() {
    return {
      manualRowSpacing: ROW_SPACING_MODE_MANUAL,
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
.floating-select {
    cursor: not-allowed;
    font-size: 14px;
    padding: 10px 30px 10px 16px;
    display: block;
    width: 100%;
    height: 40px;
    background-color: var(--step-50);
    border: none;
    border-radius: 4px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    /* background-image: url(/img/chevron-down.1eaf17d9.svg); */
    background-repeat: no-repeat;
    background-position: calc(100% - 8px) center;
    background-size: 22px;
}
</style>
