<template>
  <div class="subFlush">
    <div class="col_row">
     <div class="col col_3">
        <div class="item_ditails">
          <div class="item_label">Default</div>
          <div class="item_value">
            <div class="toggle_btn">
              <input type="checkbox" class="checkbox" v-model="isDefaultMountType">
              <div class="knobs"></div>
              <div class="layer"></div>
            </div>
          </div>
        </div>
      </div>
    <div class="col grow_1">
      <div class="floating-label">  
        <div class="item_label">Module</div>
          <InfinitePanelScroll
            :panel.sync="subarrayPanel"
            :module-id="profileData
            .drawing_defaults.subarray[mountTypeKey].moduleProperties.moduleId"
            :component-id="panelInfiniteScrollId"
          />
      </div>
    </div>
  </div>

  <div class="col_row">
    <div class="col col_3">
      <!-- <div class='item_label'>Structure Type</div> -->
      <div class="floating-label">  
        <select class="floating-select" value="Default Fixed Tilt" :disabled="true">
          <option value="select">Default Fixed Tilt</option>
        </select>
        <label class="disabled-input-label">Structure Type1</label>
      </div>
    </div>
    <div class="col col_3">
      <div class="floating-label" v-if="isNaN(profileData.drawing_defaults.subarray[mountTypeKey].tilt)">
         <input
                            v-model="profileData
                            .drawing_defaults.subarray[mountTypeKey].tilt"
                            class="inputBoxStyler"
                            disabled="true"
                        />
                      
        <label>Tilt</label>
        </div>
         <div v-else>
                        <input
                         
                            v-validate="tiltValidation"
                            v-model.number="profileData
                            .drawing_defaults.subarray[mountTypeKey].tilt"
                            class="inputBoxStyler"
                            type="number"
                            autocomplete="off"
                            name="Tilt"
                            step="any"/>
                            <label>Tilt</label>
                   </div>
    </div>
    <div class="col col_3">
      <div class="floating-label"
      v-if="isNaN(profileData.drawing_defaults.subarray[mountTypeKey].azimuth)">
            <input
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].azimuth"
                            class="inputBoxStyler"
                            disabled="true"/>
        <label>Azimuth</label>
        </div>
        <div v-else>  
                            <input
                          
                            v-validate="azimuthValidation"
                            v-model.number="profileData
                            .drawing_defaults.subarray[mountTypeKey].azimuth"
                            class="inputBoxStyler"
                            type="number"
                            autocomplete="off"
                            name="Azimuth"
                            step="any"/>
                            <label>Azimuth</label>
                            </div>
    </div>
  </div>
  <div class="col_row">
    <div class="col col_3">
      <div class="floating-label">
          <input
          class="floating-input"
          v-if="rowSpacingDisabled"
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].tilt"
                            
                        />
         <input-length
         class="floating-input"
         v-else
                            v-model="profileData.drawing_defaults.subarray[mountTypeKey].rowSpacing"
                            :name="'Row Spacing'"
                            :disabled="rowSpacingDisabled"
                            :metric-validation="rowSpacingValidation"
                           
                            :error-view-ancestor="this"
                        />
        <label>Row Spacing</label>
      </div>
    </div>
    <div class="col col_3">
      <div class="floating-label">
        <input-length
        class="floating-input"
                        v-model="profileData.drawing_defaults.subarray[mountTypeKey].tableSpacing"
                        :name="'Table Spacing'"
                        :metric-validation="tableSpacingValidation"
                        
                        :error-view-ancestor="this"
                    />
        <label>Table Spacing</label>
      </div>
    </div>
    <div class="col col_3">
      <div class="floating-label">
        <input
        class="floating-input"
                        v-validate="tableSizeUpValidation"
                        v-model.number="profileData
                        .drawing_defaults.subarray[mountTypeKey].tableSizeUp"
                        
                        type="number"
                        autocomplete="off"
                        name="Array Rows"
                        step="any"/>
        <label>Array Rows</label>
      </div>
    </div>
  </div>
  <div class="col_row">
    <div class="col col_3">
      <div class="floating-label">
         <input
         class="floating-input"
                        v-validate="tableSizeWideValidation"
                        v-model.number="profileData
                        .drawing_defaults.subarray[mountTypeKey].tableSizeWide"
                        
                        type="number"
                        autocomplete="off"
                        name="Array Columns"
                        step="any"/>
        <label>Array Columns</label>
      </div>
    </div>
    <div class="col col_3">
      <div class="radio_label">Module Orientation</div>
      <div class="radio-items">
        <div>
          <input 
            id="a11" 
            class="only-sr" 
            type="radio" 
            name="temp11" 
            value="Landscape"
            :class="{'active': profileData.drawing_defaults.subarray[mountTypeKey].panelOrientation==='Landscape'}"
            v-model="profileData.drawing_defaults.subarray[mountTypeKey].panelOrientation"
          />
          <label for="a11">Landscape</label>
        </div>
        <div>
          <input 
            id="a22" 
            class="only-sr" 
            type="radio" 
            name="temp11" 
            value="Portrait"
            :class="{'active': profileData.drawing_defaults.subarray[mountTypeKey].panelOrientation==='Portrait'}"
            v-model="profileData.drawing_defaults.subarray[mountTypeKey].panelOrientation"
          />
          <label for="a22">Portrait</label>
        </div>
      </div>
    </div>
    <div class="col col_3">
      <div class="floating-label">
        <input-length
        class="floating-input"
                        v-model="profileData.drawing_defaults.subarray[mountTypeKey].mountHeight"
                        :name="'Mount Height'"
                        :metric-validation="mountHeightValidation"
                        
                        :error-view-ancestor="this"
                    />
        <label>Mount Height</label>
      </div>
    </div>
  </div>
  <div class="col_row">
    <div class="col col_3">
      <div class="floating-label">
       <input-length
       class="floating-input"
                        v-model="profileData.drawing_defaults
                        .subarray[mountTypeKey].moduleSpacingUp"
                        :name="'Vertical Module Spacing'"
                        :metric-validation="moduleSpacingUpValidation"
                       
                        :error-view-ancestor="this"
                    />
        <label>Vertical Module Spacing</label>
      </div>
    </div>
    <div class="col col_3">
        <div class="floating-label">
          <input-length
          class="floating-input"
                        v-model="profileData.drawing_defaults
                        .subarray[mountTypeKey].moduleSpacingWide"
                        :name="'Horizontal Module Spacing'"
                        :metric-validation="moduleSpacingWideValidation"
                       
                        :error-view-ancestor="this"
                    />
          <label>Horizontal Module Spacing</label>
        </div>
      </div>
  </div>
  </div>
</template>

<script>
import {
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
} from '../../../../../../core/coreConstants';
import { getPropertiesForSubarrayForAutoFix } from '../../../../../../core/structure/utils/structureValidationUtils';
import InfinitePanelScroll from '../../../../../../components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel_new.vue'

export default {
    name: 'SubarrayTemplateForm',
    props: {
        profileData: {
            type: Object,
            default() {
                return {};
            },
        },
        mountType: {
            type: String,
            default() {
                return SUBARRAY_RACK_STYLE_FIXED;
            },
        },
        mountTypeKey: {
            type: String,
            default() {
                return 'fixedMount';
            },
        },
        panelInfiniteScrollId: {
            type: String,
            default: 'panel',
        },
    },
    components: {
      InfinitePanelScroll,
    },
    data() {
        return {
            labelPosition: 'left',
            otherMountType: this.mountType === SUBARRAY_RACK_STYLE_FIXED ?
                SUBARRAY_RACK_STYLE_FLUSH : SUBARRAY_RACK_STYLE_FIXED,
            subarrayPanel: {},
            rowSpacingModeEnabled: this.mountType === SUBARRAY_RACK_STYLE_FIXED,
            tiltValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 89.9,
                },
                decimal: 2,
            },
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 359.99,
                },
                decimal: 2,
            },
            tableSpacingValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            rowSpacingValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            tableSizeUpValidation: {
                required: true,
                min_value: 1,
                decimal: 0,
            },
            tableSizeWideValidation: {
                required: true,
                min_value: 1,
                decimal: 0,
            },
            mountHeightValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            moduleSpacingUpValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            moduleSpacingWideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            formLabelWidth: '200px',
        };
    },
    computed: {
        isDefaultMountType: {
            get() {
                return this.mountType ===
                    this.profileData.drawing_defaults.subarray.mountType;
            },
            set(value) {
                this.profileData.drawing_defaults.subarray.mountType =
                    value ?
                        this.mountType : this.otherMountType;
            },
        },
        rowSpacingDisabled: {
            get() {
                return this.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].rowSpacingMode === ROW_SPACING_MODE_AUTO;
            },
        },
    },
    watch: {
        subarrayPanel: {
            deep: true,
            handler(value) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleId = parseInt(value.id, 10);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleMake =
                        `${value.characteristics.manufacturer}  ${value.model}`;
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleLength = parseFloat(value.characteristics.length);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleWidth = parseFloat(value.characteristics.width);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .moduleProperties.moduleSize =
                        parseFloat(value.characteristics.p_mp_ref / 1000);
                this.profileData.drawing_defaults.subarray[this.mountTypeKey]
                    .panelProperties = value;
            },
        },
    },
    mounted() {
        if (!('tilt' in this.profileData.drawing_defaults.subarray[this.mountTypeKey])) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].tilt =
                'Will be auto-calculated';
        }
        if (!('azimuth' in this.profileData.drawing_defaults.subarray[this.mountTypeKey])) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].azimuth =
                'Will be auto-calculated';
        }
        if (this.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
            this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacingMode =
            ROW_SPACING_MODE_MANUAL;
        }
        const vm = this;
        this.$watch(
            () => ({
                structureType: vm.profileData.drawing_defaults
                    .subarray[this.mountTypeKey].structureType,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (
                        vm.structureType !==
                        vm.profileData.drawing_defaults.subarray[this.mountTypeKey].structureType
                    ) {
                        this.fixProperties();
                    }
                });
            },
        );
    },
    methods: {
        fixProperties() {
            const { subarrayProperties, allErrorsFixable } = getPropertiesForSubarrayForAutoFix(
                this.profileData.drawing_defaults.subarray[this.mountTypeKey],
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].structureType,
                true,
            );

            if (subarrayProperties.tilt && subarrayProperties.tilt !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tilt =
                    subarrayProperties.tilt;
            }
            if (subarrayProperties.panelOrientation
                && subarrayProperties.panelOrientation !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].panelOrientation =
                    subarrayProperties.panelOrientation;
            }
            if (subarrayProperties.rowSpacing && subarrayProperties.rowSpacing !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacing =
                    subarrayProperties.rowSpacing;
            }
            if (subarrayProperties.rowSpacingMode && subarrayProperties.rowSpacingMode !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].rowSpacingMode =
                    subarrayProperties.rowSpacingMode;
            }
            if (subarrayProperties.mountHeight && subarrayProperties.mountHeight !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].mountHeight =
                    subarrayProperties.mountHeight;
            }
            if (subarrayProperties.moduleSpacingUp && subarrayProperties.moduleSpacingUp !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].moduleSpacingUp =
                    subarrayProperties.moduleSpacingUp;
            }
            if (subarrayProperties.moduleSpacingWide
                && subarrayProperties.moduleSpacingWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].moduleSpacingWide =
                    subarrayProperties.moduleSpacingWide;
            }
            if (subarrayProperties.tableSizeUp && subarrayProperties.tableSizeUp !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeUp =
                    subarrayProperties.tableSizeUp;
            }
            if (subarrayProperties.tableSizeWide && subarrayProperties.tableSizeWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeWide =
                    subarrayProperties.tableSizeWide;
            }
            if (subarrayProperties.tableSizeWide && subarrayProperties.tableSizeWide !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSizeWide =
                    subarrayProperties.tableSizeWide;
            }
            if (subarrayProperties.tableSpacing && subarrayProperties.tableSpacing !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].tableSpacing =
                    subarrayProperties.tableSpacing;
            }
            if (subarrayProperties.azimuth && subarrayProperties.azimuth !== null) {
                this.profileData.drawing_defaults.subarray[this.mountTypeKey].azimuth =
                    subarrayProperties.azimuth;
            }
        },
    },
};
</script>

<style scoped>
 .floating-label label {
    top: -19px;
    left: 0;
    font-size: 14px !important;
}

.tbl_form .radio_label {
    font-size: 14px !important;
}

.subFlush >>> .el-input--suffix .el-input__inner{
   border: none !important;
    background-color: #f5f7fa !important;
}

.subFlush >>> .el-select .el-input .el-select__caret{
  color: #222 !important;
    font-weight: 800 !important;
}

.profile_data .item_label{
  font-size: 14px !important;
}

.tbl_form .item_ditails {
    padding: 23px 0px 8px 0px !important;
}

.radio-items>div {
    display: table-cell;
    height: 37px !important;
    line-height: 37px !important;
}

.radio-items label{
  font-size: 14px !important;
}

.tbl_form .radio-items {
  margin-top: 6px !important;
}
 .subFlush .el-form-item--mini.el-form-item {
    margin-bottom: 1px;
}.subFlush >>> .el-form-item--mini .el-form-item__content {
    line-height: 28px;
    margin-top: 5px;
}
</style>