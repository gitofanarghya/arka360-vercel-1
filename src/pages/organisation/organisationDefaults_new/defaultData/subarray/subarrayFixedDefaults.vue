<template>
    <div>
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_6">
            <div class="item_ditails">
              <div class="item_label">PV Module</div>
              <div class="item_value">{{ templateData.moduleProperties.moduleMake }}</div>
            </div>
          </div>
          <div class="col col_6">
            <div class="item_ditails">
              <div class="item_label">Structure Type</div>
              <div class="item_value"> {{ templateData.structureType }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Tilt</div>
              <div class="item_value">{{ templateData.tilt }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Azimuth</div>
              <div class="item_value">{{ templateData.azimuth }}</div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Row Spacing Mode</div>
              <div class="item_value">{{ templateData.rowSpacingMode }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <div class="col_row"> 
         <div class="col col_3">
            <div class="item_ditails" >
              <div class="item_label">Row Spacing</div>
              <div class="item_value">
                <div v-if="templateData.rowSpacingMode === 'Auto'">{{templateData.rowSpacingMode === 'Auto' ? "Will be auto-calculated":"" }}</div><div v-else><display-length :appendMeterUnit="true"
                        :metric-value="templateData.rowSpacing"/></div>
            </div>
          </div>
          
          </div> 
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
        </div>
     </div>
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Array Columns</div>
              <div class="item_value">{{ templateData.tableSizeWide }}</div>
            </div>
          </div>
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
        </div>
      </div>
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Horizontal Module Spacing</div>
              <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="templateData.moduleSpacingWide"/></div>
            </div>
          </div>
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
export default {
  name: 'SubarrayFixedDefaults',
  props: {
    templateData: {
      type: Object,
      default() {
        return {};
      },
    },
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