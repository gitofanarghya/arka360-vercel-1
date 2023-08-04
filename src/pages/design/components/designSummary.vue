<template>
  <div id="designSummary" style="height: 100%; width: 100%;">
    <div class="designSummaryHeader">
      <div class="heading_">DESIGN INFORMATION</div>
    </div>

    <el-row id="designSummaryInformation">
      <el-col :span="12">
        <div class="designSummaryParameter">
          Nameplate DC Size
        </div>
        <div class="designSummaryValue">{{ summary.nameplateDcSize }} kW</div>

        <div class="designSummaryParameter">
          Total AC Size
        </div>
        <div class="designSummaryValue">{{ summary.acSize }} kW</div>

        <div class="designSummaryParameter">
          DC:AC Ratio
        </div>
        <div class="designSummaryValue">
          {{ summary.acDcRatio }}
        </div>

        <div class="designSummaryParameter">
          Specific Generation
        </div>
        <div class="designSummaryValue">
          {{ summary.specificGeneration }}
        </div>
      </el-col>

      <el-col :span="12">
        <div class="designSummaryParameter">
          Performance Ratio
        </div>
        <div class="designSummaryValue">
          {{ summary.performanceRatio }}
        </div>
        <div class="designSummaryParameter">
          Last Modified At
        </div>
        <div class="designSummaryValue">
          {{ summary.lastModifiedAt }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import API from "@/services/api/";
import { mapState } from "pinia";
import { useDesignStore } from "../../../stores/design";

export default {
  name: "DesignSummary",
  data() {
    return {
      msg: "I am in design",
    };
  },
  computed: {
    ...mapState(useDesignStore, {
      summary: "GET_DESIGN_INFORMATION",
    }),
  },
};
</script>

<style scoped>
.designSummaryHeader {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}

.heading_ {
  font-size: 1.2vw;
  color: #707070;
  font-weight: bold;
}

.designSummaryParameter {
  font-size: 0.9vw;
  color: #707070;
  font-weight: 900;
}

.designSummaryValue {
  font-size: 0.9vw;
  color: #707070;
  font-weight: 500;
  padding-top: 5px;
  padding-bottom: 15px;
}
</style>
