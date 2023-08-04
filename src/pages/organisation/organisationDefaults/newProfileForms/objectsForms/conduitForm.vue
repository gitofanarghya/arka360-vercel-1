<template>
  <div id="conduitForm">
    <VuePerfectScrollbar class="scroll-area">
      <el-form
        :model="profileData.drawing_defaults.conduit"
        :label-position="labelPosition"
        label-width="250px"
        size="mini"
      >
        <p class="formHeadings">PROPERTIES</p>
        <el-form-item label="Material Type">
          <div style="width: 70%" class="select-block">
            <el-select
              v-model="profileData.drawing_defaults.conduit.materialType"
              placeholder="Select Material Type"
            >
              <el-option
                value="EMT - Electrical Metallic Tubing"
                label="EMT - Electrical Metallic Tubing"
              />
              <el-option
                value="ENT - Electrical Non-Metallic Tubing"
                label="ENT - Electrical Non-Metallic Tubing"
              />
              <el-option
                value="FMC - Flexible Metal Conduit"
                label="FMC - Flexible Metal Conduit"
              />
              <el-option
                value="PVC - Rigid PVC Conduit"
                label="PVC - Rigid PVC Conduit"
              />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="Inner Diameter">
          <el-select
              v-model="profileData.drawing_defaults.conduit.innerDiameter"
              placeholder="Select inner diameter"
            >
              <el-option
                v-for="val in diameter"
                :key="val"
                :label="val"
                :value="val"
              />
            </el-select>
        </el-form-item>
        <el-form-item label="Outer Diameter">
          <el-select
              v-model="profileData.drawing_defaults.conduit.outerDiameter"
              placeholder="Select outer diameter"
            >
              <el-option
                v-for="val in diameter"
                :key="val"
                :label="val"
                :value="val"
              />
            </el-select>
        </el-form-item>
        <el-form-item label="Max Fill Factor">
          <input
            v-validate="fillFactorValidation"
            v-model="profileData.drawing_defaults.conduit.maxFillFactor"
            class="inputBoxStyler"
            autocomplete="off"
            name="maxFillFactor"
            step="any"
          />
          <p class="formErrors">
            <span>{{ errors.first("maxFillFactor") }}</span>
          </p>
        </el-form-item>
      </el-form>
    </VuePerfectScrollbar>
  </div>
</template>

<script>
import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';

export default {
  name: "ConduitForm",
  components: {
    VuePerfectScrollbar,
  },
  props: ["profileData", "profileData.drawing_defaults.conduit"],
  // props: {
  //     profileData: {
  //         type: Object,
  //         default() {
  //             return {};
  //         },
  //     },
  // },
  data() {
    return {
        diameter: [
        0.5,
        0.75,
        1.0,
        1.25,
        1.5,
        1.75,
        2.0,
        2.25,
        2.5,
        2.75,
        3.0,
        3.25,
        3.5,
        3.75,
        4.0,
        4.25,
        4.5,
        4.75,
        5.0,
        5.25,
        5.5,
        5.75,
        6.0,
      ],
      labelPosition: "left",
      conduitProp: {
        materialType: "EMT - Electrical Metallic Tubing",
        innerDiameter: 0.5,
        outerDiameter: 0.5,
        maxFillFactor:0.4,
      },
      fillFactorValidation: {
        required: true,
        between: {
          min: 0.1,
          max: 1.0,
        },
        decimal: 5,
      },
    };
  },
  computed: {},
  methods: {},
};
</script>

<style type="text/css">
#newProfile .el-dialog__body {
  text-align: left;
}

#newProfile .formHeadings {
  color: #606266;
  font-size: 14px;
  text-align: left;
  padding-bottom: 10px;
  padding-top: 0px;
  font-weight: 600;
}
#conduitForm .scroll-area {
  position: relative;
  margin: auto;
  width: 100%;
  height: 55vh;
}
</style>
