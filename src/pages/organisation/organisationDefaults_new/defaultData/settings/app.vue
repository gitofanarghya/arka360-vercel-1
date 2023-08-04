<template>
  <div class="col_area finel_profile">
    <div class="content_scroller">
      <div class="profile_container">
        <div class="table_section table_normal">
          <table>
            <thead>
              <tr>
                <th rowspan="2">Orientation</th>
                <th colspan="2" class="text-center">Table Size</th>
              </tr>
              <tr>
                <th>UP</th>
                <th>Wide</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, i) in profileData.default_table_types" :key="i">
                <td>
                  <div class="value_type">
                    <div class="label_head"><span>Orientation:</span>{{data.panelOrientation}}</div>
                    <div class="label">Vertical Module Spacing</div>
                    <div class="value">{{data.moduleSpacingUp}}</div>
                  </div> 
                </td>
                <td>
                  <div class="md_head">Array Rows</div>
                  <div class="value_type">
                    <div class="label_head">{{data.tableSizeUp}}</div>
                    <div class="label">Horizontal Module Spacing</div>
                    <div class="value">{{data.moduleSpacingWide}}</div>
                  </div> 
                </td>
                <td>
                  <div class="md_head">Array Columns</div>
                  <div class="value_type">
                    <div class="label_head">{{data.moduleSpacingWide}}</div>
                    <div class="label">Mount Height</div>
                    <div class="value">{{data.mountHeight}}</div>
                  </div> 
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'settingsAppDefaults',
    props: ['profileData'],
    data() {
      return {
        msg: ' I am in settingsAppDefaults',
      }
    },
  }
</script>