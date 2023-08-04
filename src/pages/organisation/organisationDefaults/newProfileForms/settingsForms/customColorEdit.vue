/** * @Author: Vivek Yadav * @Date: 2020-10-20T05:05:28+05:30 * @Email:
vivek@thesolarlabs.com * @Last modified by: Vivek Yadav * @Last modified time:
2020-10-20T05:05:28+05:30 */

<template>
  <div class="customColor">
    <div class="custom-color">
      <div>Primary Color</div>
      <span class="primaryCode" title="Copy color code for future">{{
        colorCode1
      }}</span>
      <div>
        <input type="color" title="Choose your color" v-model="colorCode1" />
      </div>
    </div>
    <div class="custom-color">
      <div>Secondary Color</div>
      <span class="secondaryCode" style="margin-right:20px;">{{
        colorCode2
      }}</span>
      <div><input type="color" v-model="colorCode2" /></div>
    </div>
    <div class="custom-color">
      <div>Tertiary Color</div>
      <span class="tertiaryCode">{{ colorCode3 }}</span>
      <div><input type="color" v-model="colorCode3" /></div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  name: "reportCustomColorDefaults",
  props: {
    profileData: {
      type: Object,
      default: function() {
        return {};
      },
    },
    template_name: {
      type: String,
      default: "solar_labs",
    },
    defaultColors: {
      type: Object,
      default: function() {
        return {
          primary_color: "#1c3366",
          secondary_color: "#f46545",
          tertiary_color: "#4c618f",
        };
      },
    },
  },
  data() {
    return {
      msg: " I am in settingsGeneralDefaults",
      defaultPrimary:null,
      defaultSecondary:null,
      defaultTertiary:null,
    };
  },
  watch: {
    reset:{
      handler(val){
        if(val===true)
        {
          if(this.template_name==="solar_labs")
          {
        this.colorCode1 = this.defaultPrimary
        this.colorCode2 = this.defaultSecondary;
        this.colorCode3 = this.defaultTertiary;        
          }
          else if (this.template_name === "solar_labs_2") {
            this.colorCode1 = "#1c3366";
            this.colorCode2 = "#f46545";
            this.colorCode3 = "#4c618f";
          } else if (this.template_name === "solar_labs_3") {
            this.colorCode1 = "#f8d6ce";
            this.colorCode2 = "#d7e1f8";
            this.colorCode3 = "#cccccc";
          }

          this.$emit("resetFalse");
        }
      },
    },
    template_name: {
      handler(val, oldVal) {
        // console.log(val);
        this.updateTemplateColor(val);
      },
    },
  },
  mounted() {
    //this.updateTemplateColor("solar_labs");
    this.defaultPrimary = this.defaultColors.primary_color;
    this.defaultSecondary = this.defaultColors.secondary_color;
    this.defaultTertiary = this.defaultColors.tertiary_color;
  },
  methods: {
    updateTemplateColor(val) {
      if (val == "solar_labs") {
        this.colorCode1 = this.defaultPrimary
        this.colorCode2 = this.defaultSecondary;
        this.colorCode3 = this.defaultTertiary;
      } else if (val == "solar_labs_2") {
        this.colorCode1 = "#1c3366";
        this.colorCode2 = "#f46545";
        this.colorCode3 = "#4c618f";
      } else if (val == "solar_labs_3") {
        this.colorCode1 = "#f8d6ce";
        this.colorCode2 = "#d7e1f8";
        this.colorCode3 = "#cccccc";
      }
       else if (val == "solar_labs_usa") {
        this.colorCode1 = "#f8d6ce";
        this.colorCode2 = "#d7e1f8";
        this.colorCode3 = "#cccccc";
      }

    },
  },
  computed: {
    colorCode1: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.primary_color
          : this.defaultColors.primary_color;
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.primary_color = value;
      },
    },
    colorCode2: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.secondary_color
          : this.defaultColors.secondary_color;
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.secondary_color = value;
      },
    },
    colorCode3: {
      get: function() {
        return this.profileData.report_defaults.custom_color
          ? this.profileData.report_defaults.custom_color.tertiary_color
          : this.defaultColors.tertiary_color;
      },
      set: function(value) {
        this.profileData.report_defaults.custom_color.tertiary_color = value;
      },
    },
  },
};
</script>

<style type="text/css" scoped>
.customColor {
  padding-left: 1.5rem;
  padding-right: 3rem;
  padding-top: 0.5rem;
}
.custom-color {
  display: flex;
  font-size: 16px;
  direction: row;
  justify-content: space-between;
  padding-bottom: 10px;
}

@media (max-width: 550px) {
  .primaryCode {
    display: none;
  }

  .secondaryCode {
    display: none;
  }

  .tertiaryCode {
    display: none;
  }
}

@media (max-width: 390px) {
  .custom-color {
    display: flex;
    font-size: 14px;
    direction: row;
    justify-content: space-between;
    padding-bottom: 10px;
  }
}
</style>
