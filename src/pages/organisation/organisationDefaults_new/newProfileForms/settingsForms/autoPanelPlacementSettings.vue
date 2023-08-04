<template>
  <div class="table_container">
    <h5>Default Table Types for Auto Module Placement</h5>
    <div class="table_section table_normal">
      <table>
        <thead>
          <tr>
            <th rowspan="2">Orientation</th>
            <th colspan="2" class="text-center">Table Size</th>
            <th colspan="2" class="text-center">Module Spacing</th>
            <th rowspan="2">Mount Height</th>
            <th rowspan="2" class="text-center">Actions</th>
          </tr>
          <tr>
            <th>UP</th>
            <th>Wide</th>
            <th>UP</th>
            <th class="last-th">Wide</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, idx) in profileData.default_table_types" :key="idx">
            <td>
              <div class="value_type">{{data.panelOrientation}}</div> 
            </td>
            <td>
              <div class="value_type">{{data.tableSizeUp}}</div> 
            </td>
            <td>
              <div class="value_type">{{data.tableSizeWide}}</div>
            </td>
            <td>
              <div class="value_type">{{data.moduleSpacingUp}}</div>
            </td>
            <td>
              <div class="value_type">{{parseFloat(data.moduleSpacingWide).toFixed(2)}}</div>
            </td>
            <td>
              <div class="value_type">{{data.mountHeight}}</div>
            </td>
            <td class="text-center">
              <div class="value_type" @click="deleteTableType(idx, data)">
                <i class="far fa-trash-alt"></i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="tbl_form">
      <h5>Add Table</h5>
      <div class="col_row">
        <div class="col col_3">
          <div class="radio_label">Module Orientation</div>
          <div class="radio-items">
            <div>
              <input 
                id="a1" 
                class="only-sr"
                :class="{'active': addTableType.panelOrientation==='Landscape'}"
                type="radio"
                value="Landscape"
                v-model="addTableType.panelOrientation"
              >
              <label for="a1">Landscape</label>
            </div>
            <div>
              <input
                id="a2" 
                class="only-sr"
                :class="{'active': addTableType.panelOrientation==='Potrait'}"
                type="radio"
                value="Potrait"
                v-model="addTableType.panelOrientation"
              >
              <label for="a2">Portrait</label>
            </div>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="addTableType.tableSizeUp"
            />
            <label>Array Rows</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model.number="addTableType.tableSizeWide"
            />
            <label>Array Columns</label>
          </div>
        </div>
      </div>
      <div class="col_row">
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model="addTableType.moduleSpacingUp"
            />
            <label>Vertical Module Spacing</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model="addTableType.moduleSpacingWide"
            />
            <label>Horizontal Module Spacing</label>
          </div>
        </div>
        <div class="col col_3">
          <div class="floating-label">
            <input 
              class="floating-input" 
              type="number"
              v-model="addTableType.mountHeight"
            />
            <label>Mount Height</label>
          </div>
        </div>
      </div>
    </div>
    <div class="button_group">
      <button class="btn btn-outline" @click="handleCancel">Cancel</button>
      <button class="btn btn-outline" @click="addToAPPTable">Add Table</button>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'default_table_typesForm',
        props: ['profileData', 'profileData.default_table_types'],
        data() {
            return {
                msg: 'I am in default_table_typesForm',
                addTableType: {
                    panelOrientation: 'Landscape',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.01
                },
                tableSizeUpValidation: {
                    required: true,
                    numeric: true,
                    min_value: 1,
                },
                tableSizeWideValidation: {
                    required: true,
                    numeric: true,
                    min_value: 1
                },
                mountHeightValidation: {
                    required: true,
                    min_value: 0.001,
                    decimal: 3
                },
                moduleSpacingUpValidation: {
                    required: true,
                    min_value: 0,
                    decimal: 3
                },
                moduleSpacingWideValidation: {
                    required: true,
                    min_value: 0,
                    decimal: 3
                },
            };
        },

        methods: {
            addToAPPTable(){
                this.profileData.default_table_types.push({
                    "mountHeight": this.addTableType.mountHeight,
                    "tableSizeUp": this.addTableType.tableSizeUp,
                    "tableSizeWide": this.addTableType.tableSizeWide,
                    "moduleSpacingUp": this.addTableType.moduleSpacingUp,
                    "panelOrientation": this.addTableType.panelOrientation,
                    "moduleSpacingWide": this.addTableType.moduleSpacingWide
                });
            },
            deleteTableType(index, row) {
                this.profileData.default_table_types.splice(index, 1);
            },
            handleCancel() {
              this.addTableType.panelOrientation =  'Landscape';
              this.addTableType.tableSizeUp =  1;
              this.addTableType.tableSizeWide = 1;
              this.addTableType.moduleSpacingUp = 0.025;
              this.addTableType.moduleSpacingWide = 0.025;
              this.addTableType.mountHeight = 0.01;
              
            }

        }
    };

</script>