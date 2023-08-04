<template>
  <div class="table_container">
    <div class="tbl_form">
      <div class="profile_data">
        <h5 class="report">Data for 3D Model</h5>
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
        <h5 class="report">Time Consideration for Shadow Analysis</h5>
        <div class="col_row">
          <div class="col col_3">
            <div class="floating-label">
              <input
                class="floating-input"
                type="time"
                v-model="
                  profileData.report_defaults.shadowAnalysis.start_time_shadow_analysis"
                v-validate="shadowAnalysisStartTimeValidation"
                name="Start Time"
              />
              <p class="formErrors"><span>{{ errors.first('Start Time') }}</span></p>
              <label class="report">Start Time</label>
              <!-- <i class="fas fa-clock"></i> -->
            </div>
          </div>
          <div class="col col_3">
            <div class="floating-label">
              <input
                class="floating-input"
                type="time"
                v-model="
                  profileData.report_defaults.shadowAnalysis.end_time_shadow_analysis"
                v-validate="shadowAnalysisStartTimeValidation"
                name="End Time"
              />
              <p class="formErrors"><span>{{ errors.first('End Time') }}</span></p>
              <label class="report">End Time</label>
              <!-- <i class="fas fa-clock"></i> -->
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
                @click="toggleSelectAll" 
                :checked="
                  profileData.report_defaults.pages.length ==
                  finalCheckListReportPages.length
                "
              />
              <span class="checkmark"></span>
            </label>
          </li>
          <li v-for="(page, idx) in finalCheckListReportPages" :key="idx">
            <label class="checkbutton"
              >{{ page.name }}
              <input
                type="checkbox"
                @click="toggleLable(page.label)"
                :checked="
                  profileData.report_defaults.pages.includes(page.label)
                "
              />
              <span class="checkmark"></span>
            </label>
          </li>
        </ul>
      </div>
      <div class="profile_data" v-if="!flagForUS">
        <h5 class="report">Report Custom Colors</h5>
          <div class="custom-color-report">
                <TSLBasicReportEditDefaults 
                    :profileData="profileData"
                />
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import TSLBasicReportEditDefaults from '../settingsForms/customColorEdit.vue';
import { reportPagesListNonUs, reportPagesListUs } from '../../../../../utils';
 
export default {
  name: "reportSettingsForm",
  components: {  TSLBasicReportEditDefaults},
  props: ["profileData"],
  data() {
    return {
      msg: "I am in generalSettings",
      shadowAnalysisStartTimeValidation: {
        required: true,
      },
      shadowAnalysisEndTimeValidation: {
        required: true,
      },
      checkListReportPages: reportPagesListNonUs,
      checkListReportPagesForUS: reportPagesListUs,
    };
  },
  computed: {
    colorCode1: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.primary_color
          : "#005482";
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.primary_color = value;
      },
    },
    colorCode2: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.secondary_color
          : "#0086ae";
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.secondary_color = value;
      },
    },
    colorCode3: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.tertiary_color
          : "#00c2c7";
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.tertiary_color = value;
      },
    },
    flagForUS(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      console.log('isUSFlagEnabled: ', user.isUSFlagEnabled);
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
  methods: {
    toggleLable(label) {
      const idx = this.profileData.report_defaults.pages.indexOf(label);
      if (idx != -1) {
        this.profileData.report_defaults.pages.splice(idx, 1);
      } else {
        this.profileData.report_defaults.pages.push(label);
      }
    },
    toggleSelectAll() {
      if (
        this.profileData.report_defaults.pages.length ==
        this.finalCheckListReportPages.length
      ) {
        this.profileData.report_defaults.pages = [];
      } else {
        this.profileData.report_defaults.pages = [];
        this.finalCheckListReportPages.forEach((element) => {
          this.profileData.report_defaults.pages.push(element.label);
        });
      }
    },
  },
};
</script>

<style scoped>
.formErrors{
  color: #ff0000;
  font-size: 12px;
  margin-top: 8px;
}

.tbl_form .item_ditails .item_label {
    font-size: 14px;
    color: #222;
}.custom-color-report {
  margin-top: 6px;
    margin-right: 40px;
    padding: 15px 15px 5px 15px;
    border: 1px solid black;
}
.field_selection .check_list li .checkbutton {
    min-height: 18px;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    font-weight: 500;
    font-size: 16px;
}.report {
  font-size:14px !important;
  color: #222 !important;
}.profile_data h5 {
    color: var(--primary);
    font-size: 16px !important;
    padding-top: 8px;
}

.floating-input{
  height: 48px !important;
  color: #222 !important;
  font-size: 16px !important;
}

.floating-input::placeholder{
  color: #222 !important;
}

</style>
