<template>
  <div class="table_container">
    <div class="tbl_form">
      <div class="profile_data">
        <div class="col_row">
          <div class="col col_3">
            <div class="floating-label">
              <select class="floating-select" v-model="profileData.drawing_defaults.acCable.materialType">
                <option value="aluminium">Aluminium</option>
                <option value="copper">Copper</option>
              </select>
              <label>Material Type</label>
            </div>
          </div>
          <div class="col col_3">
            <div class="floating-label">
              <!-- <input
                class="floating-input"
                v-model="profileData.drawing_defaults.acCable.cores"
                type="number"
                placeholder=""
                value="1"
              /> -->
              <el-select
                            v-model.number="profileData.drawing_defaults.acCable.cores"
                            placeholder="Select cores">
                            <el-option
                                value=1
                                label="1"/>
                            <el-option
                                value=2
                                label="2"/>
                            <el-option
                                value=3
                                label="3"/>
                            <el-option
                                value=3.5
                                label="3.5"/>
                            <el-option
                                value=4
                                label="4"/>
                            <el-option
                                value=5
                                label="5"/>
                </el-select>
              <label>No. of Cores</label>
            </div>
          </div>
          <div class="col col_3" v-if="profileData.wiring_unit === 'awg'">
            <div class="floating-label">
              <!-- <input
                class="floating-input"
                type="number"
                v-model="profileData.drawing_defaults.acCable.cableSizeAWG"
              /> -->
              <el-select
                  v-model.number="profileData.drawing_defaults.acCable.cableSizeAWG"
                  placeholder="Select">
                  <div
                      v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_AWG"
                      :key="index">
                      <el-option
                          :value=i
                          :label="i"/>
                  </div>
              </el-select>
              <label>Size of Cable (in AWG)</label>
            </div>
          </div>
          <div class="col col_3" v-if="profileData.wiring_unit === 'mmsq'">
            <div class="floating-label">
              <!-- <input
                class="floating-input"
                type="number"
                v-model="profileData.drawing_defaults.acCable.cableSizeMM"
              /> -->
              <el-select
                  v-model.number="profileData.drawing_defaults.acCable.cableSizeMM"
                  placeholder="Select">
                  <div
                      v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_MM"
                      :key="index">
                      <el-option
                          :value=i
                          :label="i"/>
                  </div>
                </el-select>
              <label>Size of Cable (in mm<sup>2</sup>)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
    ACCABLE_SIZE_AWG,
    ACCABLE_SIZE_MM,
} from '../../../../../core/coreConstants';

export default {
  name: 'AcCableForm',
  props: ['profileData', 'profileData.drawing_defaults.acCable'],
  nonReactiveData() {
        return {
            CONSTANTS: {
                ACCABLE_SIZE_AWG,
                ACCABLE_SIZE_MM,
            },
        };
  },
};
</script>


<style scoped>
.floating-label label {
    top: -21px;
}

.el-select{
  width: 100% !important;
}

.table_container >>> .el-input--suffix .el-input__inner {
    border: none !important;
    background-color: #f5f7fa !important;
}

.table_container >>> .el-select .el-input .el-select__caret {
    color: #222 !important;
    font-weight: 800 !important;
    font-size: 18px !important;
}

.floating-select:not([value=""]):valid~label {
    top: -19px;
    left: 0;
    font-size: 14px;
}

.floating-label label[data-v-4552e2e5] {
    top: -19px;
    left: 1px;
}
.inputBoxStyler {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 2px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 28px;
    line-height: 28px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 90%;
    font-size: 12px;
}#polygonForm >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
</style>