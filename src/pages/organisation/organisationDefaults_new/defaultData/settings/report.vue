<template>
  <div class="content_scroller">
    <div class="profile_container">
      <div class="profile_data">
        <h5 class="heading" >Data for 3D Model</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Generation</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input
                    type="checkbox"
                    class="checkbox"
                    v-model="
                      profileData['report_defaults']['threed_data'][
                        'generation'
                      ]
                    "
                    disabled
                  />
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Financials</div>
              <div class="item_value">
                <div class="toggle_btn">
                  <input
                    type="checkbox"
                    class="checkbox"
                    v-model="
                      profileData['report_defaults']['threed_data']['financial']
                    "
                    disabled
                  />
                  <div class="knobs"></div>
                  <div class="layer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="profile_data">
        <h5 class="heading">Time Consideration for Shadow Analysis</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">Start Time</div>
              <div class="item_value">
                {{
                  profileData.report_defaults.shadowAnalysis
                    .start_time_shadow_analysis
                }}
              </div>
            </div>
          </div>
          <div class="col col_3">
            <div class="item_ditails">
              <div class="item_label">End Time</div>
              <div class="item_value">
                {{
                  profileData.report_defaults.shadowAnalysis
                    .end_time_shadow_analysis
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="field_selection">
        <ul class="check_list">
          <li>
            <label class="checkbutton"
              ><strong>Select All</strong>
              <input
                type="checkbox"
                :checked="
                  profileData.report_defaults.pages.length ==
                  finalCheckListReportPages.length
                "
                disabled
              />
              <span class="checkmark"></span>
            </label>
          </li>
          <li v-for="page in finalCheckListReportPages" :key="page.label">
            <label class="checkbutton"
              ><strong>{{ page.name }}</strong>
              <input
                type="checkbox"
                :checked="
                  profileData.report_defaults.pages.includes(page.label)
                "
                disabled
              />
              <span class="checkmark"></span>
            </label>
          </li>
        </ul>
      </div>
      <div class="profile_data" v-if="!flagForUS">
        <h5 class="heading">Report Custom Colors</h5>
        <div class="custom-color-report">
                <TSLBasicReportDefaults 
                    :colorScheme="profileData"
                />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TSLBasicReportDefaults from "../customColor.vue";
import { reportPagesListNonUs, reportPagesListUs } from "../../../../../utils";

export default {
  name: "settingsReportDefaults",
  props: ["profileData"],
  components: {
    TSLBasicReportDefaults: TSLBasicReportDefaults,
  },
  data() {
    return {
      msg: " I am in settingsReportDefaults",
      checkListReportPages: reportPagesListNonUs,
      checkListReportPagesForUS: reportPagesListUs,
    };
  },
  computed: {
    colorCode1: {
      get: function() {
        return this.profileData.report_defaults.custom_color ? this.profileData.report_defaults.custom_color.primary_color : "#005482";
      },
    },
    colorCode2: {
    get: function() {
      return this.profileData.report_defaults.custom_color ? this.profileData.report_defaults.custom_color.secondary_color : "#0086ae";
    }
    },
    colorCode3: {
      get: function() {
        return this.profileData.report_defaults.custom_color ? this.profileData.report_defaults.custom_color.tertiary_color : "#00c2c7";
      }
    },
    flagForUS(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    finalCheckListReportPages(){
      if(this.flagForUS){
        return this.checkListReportPagesForUS
      }
      else{
        return this.checkListReportPages;
      }
    }
  },
  mounted() {
    this.$emit("profileData", this.profileData);
  },
};
</script>

<style scoped>
input[type="checkbox"][disabled] {
  cursor: not-allowed;
  
}
.custom-color-report {
  margin-top:6px;
        margin-right: 10px;
        padding: 15px 15px 5px 15px;
        border: 1px solid black;
    }
    .color-area{
    border: 1px solid black;
    width: 51px;
    height: 26px;
    margin: 0px;
}
.design_section .col_area .item_ditails .item_label {
    font-size: 16px;
    color: var(--step-250);
}
.item_label{
  font-size: 16px;
}
.checkbutton{
  font-size: 16px
} .heading{
    color: var(--primary);
    font-size: 16px;
    padding-top: 8px;
}
</style>
