<template>
  <div id="dcCableProperties" style="height: 90%">
    <div v-bar class="scroll-area">
      <div class="dataProperties">
        <div style="height: 85%; overflow-y:scroll;">
          <div class="sappane-label">
            Name
            <label>
              <input
                v-model="name"
                :disabled="!editEnabled"
                class="sappane-input-value"
                name="name"
                autocomplete="off"
              />
            </label>
            <p>
              <span>{{ errors.first("name") }}</span>
            </p>
          </div>
          <div class="sappane-label">
            Material Type
            <el-select
              v-model="materialType"
              class="sappane-select dcCable-select"
              placeholder="Select Material Type"
              popper-class="darkDropdown dcCable-dropdown"
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
          <div class="sappane-label">
            Width
            <label>
              <input
                v-model="width"
                :disabled="!editEnabled"
                class="sappane-input-value"
                name="width"
                autocomplete="off"
              />
            </label>
            <p>
              <span>{{ errors.first("width") }}</span>
            </p>
          </div>
          <div class="sappane-label">
            Height
            <label>
              <input
                v-model="height"
                :disabled="!editEnabled"
                class="sappane-input-value"
                name="height"
                autocomplete="off"
              />
            </label>
            <p>
              <span>{{ errors.first("height") }}</span>
            </p>
          </div>
          <div class="sappane-label">
            Max Fill Factor
            <label>
              <input
                v-model="maxFillFactor"
                :disabled="!editEnabled"
                class="sappane-input-value"
                name="maxFillFactor"
                autocomplete="off"
              />
            </label>
            <p>
              <span>{{ errors.first("maxFillFactor") }}</span>
            </p>
          </div>
          <div class="border-pro" />
          <br />
          <div class="sappane-label">
            <div
              class="sappane-label dc-cable-pros string-range-com"
              @click="handleCollapsable('1')"
            >
              <div>LIST OF CABLES INSIDE CONDUIT</div>
              <div v-if="dropClose == 1">
                <img :src="dropdownArrowUp" width="20px" height="20px" />
              </div>
              <div v-else>
                <img :src="dropdownArrowDown" width="20px" height="20px" />
              </div>
            </div>
            <div
              class="hidden"
              id="1"
              style="overflow-y: scroll color: #eaeaea; font-size: 0.84vw"
            >
              <hr />
              <div
                v-for="cable in cables"
                :key="cable.id"
                class="conduitListSelection"
              >
                <p style="padding-top: 5px">{{ cable.inverterName }}</p>
                <div
                  style=" width=20px; height=20px;float: right; padding-right:10px"
                  @click="deleteCable(cable.string)"
                >
                  X
                </div>
                <p style="margin-top: 5px">MPPT {{ cable.mpptIndex }}</p>
                <p style="margin-top: 5px margin-bottom: 7px">
                  string {{ cable.stringIndex }}
                </p>
                <hr />
              </div>
            </div>
          </div>
        </div>
        <div style="height: 10%">
          <el-row class="button-actions-row">
            <el-col class="button-actions-wrapper">
              <button
                id="conduit_delete"
                class="button-actions"
                @click="propertiesData.updateCables"
              >
                Add String
              </button>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <properties-buttons-bar
      :creation-mode="creationMode"
      :update-enabled="updateEnabled"
      :cancel-enabled="cancelEnabled"
      :reset-enabled="resetEnabled"
      :update-properties="updateProperties"
      :cancel-properties="resetProperties"
      :reset-properties="resetProperties"
    />
  </div>
</template>

<script>
import { mapState } from "pinia";
import validationMixins from "./validationMixins";
import PropertiesButtonsBar from "./PropertiesButtonsBar.vue";
import { SET_PROPERTIES_EDIT_MODE } from "../../../../componentManager/componentManagerConstants";
import { serverBus } from "../../../../main";
import dropdownArrowUp from "../../../../assets/drop/dropdown-arrow-up.png";
import dropdownArrowDown from "../../../../assets/drop/dropdown-arrow-down.png";
import { useDesignStore } from '../../../../stores/design';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
  name: "CabletrayProperties",
  components: {
    PropertiesButtonsBar,
  },
  props: {
    propertiesData: {
      type: Object,
      default() {
        return {
          name: "name",
          width: 150,
          height: 45,
          maxFillFactor: 0.4,
          materialType: "EMT - Electrical Metallic Tubing",
          update: () => {},
          deleteCable: () => {},
        };
      },
    },
  },
  data() {
    return {
      name: this.propertiesData.name,
      width: this.propertiesData.width,
      height: this.propertiesData.height,
      maxFillFactor: this.propertiesData.maxFillFactor,
      materialType: this.propertiesData.materialType,
      cables: this.propertiesData.attachedDcCable(),
      prevComId: null,
      dropClose: false,
      dropdownArrowUp: dropdownArrowUp,
      dropdownArrowDown: dropdownArrowDown,
      valuesChanged: false,
    };
  },
  nonReactiveData() {
    return {};
  },
  computed: {
    ...mapState(useDesignStore, {
      wiringUnit: (state) => state.versions.setting.wiring_unit
    }),
    ...mapState(useStudioSapPaneStore, {
      creationMode: (state) => state.creationMode,
      editEnabled: (state) => state.propertiesEnabled,

    }),
    ...mapState(useStudioTextTopBarStore, {
      topBarCompleteEnabled: (state) => state.completeEnabled,
      topBarCancelEnabled: (state) => state.cancelEnabled,
    }),
    updateEnabled() {
      return (
        !this.creationMode &&
        this.editEnabled &&
        this.valuesChanged &&
        !this.errors.any()
      );
    },
    cancelEnabled() {
      return !this.creationMode && this.editEnabled && this.valuesChanged;
    },
    resetEnabled() {
      return this.creationMode && this.valuesChanged;
    },
  },
  mounted() {
    const vm = this;
    this.$watch(
      () => ({
        name: vm.name,
        width: vm.width,
        height: vm.height,
        materialType: vm.materialType,
        maxFillFactor: vm.maxFillFactor,
      }),
      () => {
        this.$validator.validate().then(() => {
          if (this.creationMode) {
            this.updateProperties();
          }
          if (
            this.name !== this.propertiesData.name ||
            this.width !== this.propertiesData.width ||
            this.height !== this.propertiesData.height ||
            this.materialType !== this.propertiesData.materialType ||
            this.maxFillFactor !== this.propertiesData.maxFillFactor
          ) {
            this.valuesChanged = true;
            if (!this.creationMode) {
              this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, true);
            }
          } else {
            this.valuesChanged = false;
            if (!this.creationMode) {
              this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
          }
        });
      }
    );
    if (!this.creationMode) {
      if (!this.topBarCompleteEnabled) {
        this.$mousetrap.bind("enter", () => {
          if (this.updateEnabled) this.updateProperties();
        });
      }
      if (!this.topBarCancelEnabled) {
        this.$mousetrap.bind("esc", () => {
          if (this.cancelEnabled) this.resetProperties();
        });
      }
    }
  },
  beforeDestroy() {
    if (!this.creationMode) {
      if (!this.topBarCompleteEnabled) this.$mousetrap.unbind("enter");
      if (!this.topBarCancelEnabled) this.$mousetrap.unbind("esc");
    }
  },
  methods: {
    handleCollapsable(id) {
      if (this.prevComId !== id) {
        this.prevComId
          ? document.getElementById(this.prevComId).classList.remove("open")
          : "";
        this.dropClose = id;
        document.getElementById(id).classList.add("open");
        this.prevComId = id;
      } else if (this.prevComId === id) {
        document.getElementById(this.prevComId).classList.remove("open");
        this.dropClose = false;
        this.prevComId = null;
      }
    },
    updateProperties() {
      if (!this.creationMode) {
        this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
      }
      this.propertiesData.update(
        {
          name: this.name,
          width: this.width,
          height: this.height,
          materialType: this.materialType,
          maxFillFactor: this.maxFillFactor,
        },
        !this.errors.any()
      );
    },
    resetProperties() {
      this.name = this.propertiesData.name;
      this.width = this.propertiesData.width;
      this.height = this.propertiesData.height;
      this.materialType = this.propertiesData.materialType;
      this.maxFillFactor = this.propertiesData.maxFillFactor;
    },
    deleteCable(string) {
      for (let i = 0; i < this.cables.length; i++) {
        if (
          string.attachedDcCable[0].id == this.cables[i].id ||
          string.attachedDcCable[1].id == this.cables[i].id
        ) {
          this.cables.splice(i, 1);
          break;
        }
      }
      for (let i = 0; i < this.cables.length; i++) {
        if (
          string.attachedDcCable[0].id == this.cables[i].id ||
          string.attachedDcCable[1].id == this.cables[i].id
        ) {
          this.cables.splice(i, 1);
          break;
        }
      }
      this.propertiesData.deleteCable(string);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../../../../styles/components/input";
@import "../../../../styles/components/button";
</style>

<style scoped>
#dcCableProperties .dataProperties {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

#dcCableProperties ::-webkit-scrollbar {
  display: none;
}

#dcCableProperties .vb > .vb-dragger > .vb-dragger-styler {
  visibility: hidden;
}

#dcCableProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
  visibility: visible;
}
.dcCable-select {
  max-width: 100px;
}
.hidden {
  display: none;
}
.hidden.open {
  display: block;
}
</style>
<style scoped>
.dcCable-select {
  position: relative !important;
}
.dcCable-dropdown .el-scrollbar {
  max-height: 270px !important;
}
.dcCable-dropdown {
  margin: 0 !important;
  /* left: 1328px !important; */
}
.border-pro {
  border-top: 1px solid #606060;
  margin: 5px 0;
}
.string-range-com {
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.conduitListSelection:hover {
  background-color: rgba(110, 121, 133, 0.425);
  cursor: pointer;
}
</style>
