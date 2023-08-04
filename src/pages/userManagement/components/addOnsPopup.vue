<template>
  <div class="modal modal_form" id="addons">
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Add New Add-ons</h4>
          <button
            class="modal-close modal-toggle"
            @click="$emit('toggleAddonPopup')"
          >
            <img src="../assets/img/close.svg" alt="Close" />
          </button>
        </div>
        <form class="inside_form">
          <div class="scroll_content">
            <ul class="addons_items">
              <li v-for="(addons, i) in allAddOns" :key="i">
                <div class="items_info">
                  <h5>{{ addons.label }}</h5>
                  <div class="remaining" v-if="addonCounts[addons.value]">
                    {{
                      `${addonCounts[addons.value].unused_users}/${
                        addonCounts[addons.value].total_users
                      } Remaining`
                    }}
                  </div>
                </div>
                <div class="action_status">
                  <span
                    v-if="addOnList.indexOf(addons.value) > -1"
                    class="added"
                    >Added <i class="fa fa-check"></i
                  ></span>
                  <button
                    v-else
                    class="btn btn-primary"
                    @click.prevent="addNewAddon(addons.value)"
                  >
                    Add Add-on
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  props: {
    addedAddonList: {
      type: Array,
      default: () => [],
    },
    userId: {
      type: Number,
      default: -1,
    },
    addonCounts: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      allAddOns: [
        {
          label: "AC Cable",
          value: "ac_cable_enabled",
        },
        {
          label: "Export CAD Layout",
          value: "autocad_enabled",
        },
        {
          label: "Export to Google Doc",
          value: "docs_export_enabled",
        },
        {
          label: "Export for SketchUp",
          value: "stl_export_enabled",
        },
        {
          label: "Export for PVSyst",
          value: "threeds_export_enabled",
        },
        {
          label: "Heaven Solar Integration",
          value: "is_heaven_solar_integrated",
        },
        {
          label: "Manual Stinging",
          value: "is_manual_stringing_enabled",
        },
      ],
      addOnList: [],
    };
  },
  mounted() {
    this.addOnList = JSON.parse(JSON.stringify(this.addedAddonList));
    console.log(this.addonCounts);
  },
  methods: {
    async addNewAddon(val) {
      try {
        await API.USERS.PATCH_USER_DATA(this.userId, { [val]: true });
        this.addonCounts[val].unused_users--;
        this.addOnList.push(val);
        this.$message({
          showClose: true,
          message: "Addon added successfully.",
          type: "success",
          center: true
        });
      } catch (error) {
        console.error(error);
        this.$message({
          showClose: true,
          message: "Failed to add new addon. Please try again.",
          type: "error",
          center: true
        });
      }
    },
  },
};
</script>
