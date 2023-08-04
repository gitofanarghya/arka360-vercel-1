<template>
  <div id="cabletrayForm">
    <VuePerfectScrollbar class="scroll-area">
      <el-form
        :model="profileData.drawing_defaults.cabletray"
        :label-position="labelPosition"
        label-width="250px"
        size="mini"
      >
        <p class="formHeadings">PROPERTIES</p>
        <el-form-item label="Material Type">
          <div style="width: 70%" class="select-block">
            <el-select
              v-model="profileData.drawing_defaults.cabletray.materialType"
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
        <el-form-item label="Width">
                    <input
                    v-validate="widthValidation"
                        v-model="profileData.drawing_defaults.cabletray.width"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="width"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('width') }}</span></p>
                </el-form-item>
        <el-form-item label="Height">
                    <input
                    v-validate="heightValidation"
                        v-model="profileData.drawing_defaults.cabletray.height"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="height"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('height') }}</span></p>
                </el-form-item>
        <el-form-item label="Max Fill Factor">
          <input
            v-validate="fillFactorValidation"
            v-model="profileData.drawing_defaults.cabletray.maxFillFactor"
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
  name: "CabletrayForm",
  components: {
    VuePerfectScrollbar,
  },
  props: ["profileData", "profileData.drawing_defaults.cabletray"],
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
      labelPosition: "left",
      cabletrayProp: {
        materialType: "EMT - Electrical Metallic Tubing",
        width: 150,
        height: 45,
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
      widthValidation: {
        required: true,
        between: {
          min: 150,
          max: 600,
        },
        decimal: 1,
      },
      fillFactorValidation: {
        required: true,
        between: {
          min: 45,
          max: 85,
        },
        decimal: 1,
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
#cabletrayForm .scroll-area {
  position: relative;
  margin: auto;
  width: 100%;
  height: 55vh;
}
</style>
