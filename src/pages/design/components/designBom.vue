<template>
  <div id="designBom" class="width-hundred-percent">
    <div class="designSummaryHeadings">
      <div class="allPagesIcons heading_">BILL OF MATERIALS</div>
    </div>

    <div>
      <el-table :data="bomData" style="width: 100%">
        <el-table-column prop="component" label="Component" />
        <el-table-column prop="make" label="Description" />
        <el-table-column prop="count" label="Quantity">
          <template slot-scope="scope">
            <span
              v-if="
                scope.row.component === 'Walkways' ||
                scope.row.component === 'SafetyLine' ||
                scope.row.component === 'Handrail' ||
                scope.row.component === 'AC Cable'
              "
            >
              <display-length :metric-value="scope.row.count" /><span>{{
                distanceUnit === "meters" ? "m" : ""
              }}</span>
            </span>
            <span v-else>
              {{ scope.row.count }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Actions"> </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useDesignStore } from '../../../stores/design';

export default {
  name: "DesignBom",
  data() {
    return {
      msg: "I am in designBom",
      showBomData: false,
      data: [],
    };
  },
  computed: {
    ...mapState(useDesignStore, {
      wiringUnit: (state) => state.versions.setting.wiring_unit,
      distanceUnit: (state) => state.versions.setting.distance_unit,
      bomData: "GET_BOM_DATA"
    }),
  },
};
</script>

<style type="text/css" scoped>
#designBom >>> .el-table th > .cell {
  font-size: 1.1vw;
  color: #409eff;
  font-weight: normal;
}

#designBom >>> .el-table td div {
  font-size: 1.1vw;
  font-weight: normal;
}

.designSummaryHeadings {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 3vw 0 3% 0;
}

.heading_ {
  font-size: 1.2vw;
  color: #707070;
  font-weight: bold;
}
</style>
<style type="text/css" >
.el-table .cell {
  word-break: normal;
}
</style>
