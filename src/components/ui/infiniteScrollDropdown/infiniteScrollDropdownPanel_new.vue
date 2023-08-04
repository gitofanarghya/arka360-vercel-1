<template>
  <div id="panelInfiniteScroll">
    <el-select
      :id="componentId"
      v-model="selectedPanel"
      :disabled="!doesSelectedPanelExist"
      :class="[
        'panel-select',
        theme === 'darkDropdownWithFilters' ? 'sappane-select' : '',
      ]"
      :popper-class="theme"
      :loading="loading"
      :multiple="isAdminPanel"
      placeholder="Search for Panel"
      value-key="id"
      no-data-text="No panels with searched query! Resetting... "
      @change="$emit('update:panel', JSON.parse(JSON.stringify(selectedPanel)))"
    >
      <form :submit="generateQueryAndMakeRequest" action="#">
        <div class="filter-div">
          <div class="search-input">
            <span class="make-span">Make</span>
            <input
              v-model="panelMakeInput"
              type="text"
              placeholder="Search Module"
              class="filter-input-light make"
              autocomplete="off"
            />
          </div>
          <div class="range-input">
            <span class="size-span">Size</span>
            <div class="range">
              <input
                v-validate="'decimal|min_value:' + 0"
                v-model="filters['p_min']"
                name="min-filter"
                placeholder="Min(W)"
                class="filter-input-light"
                autocomplete="off"
              />
              <div class="not-valid">{{ errors.first("min-filter") }}</div>
              <!-- <span>-</span> -->
              <input
                v-validate="'decimal|min_value:' + filters['p_min']"
                v-model="filters['p_max']"
                name="max-filter"
                placeholder="Max(W)"
                class="filter-input-light"
                autocomplete="off"
              />
              <div class="not-valid">{{ errors.first("max-filter") }}</div>
            </div>
          </div>
          <div class="dropdownSearchDeleteButtonStyler">
            <span></span>
            <div class="submit-btn">
              <button
                class="el-icon-search button-light-theme-icons searchButtonStyleAddition"
                type="submit"
                @click="generateQueryAndMakeRequest"
              />
            </div>
          </div>
        </div>
      </form>
      <el-option-group
        v-for="(group, index) in panelList"
        :key="index"
        :label="group.label"
      >
        <el-option
          v-for="(item, panelIndex) in group.options"
          :key="panelIndex"
          :label="
            item.characteristics.manufacturer + item.characteristics.model
          "
          :value="item"
        >
          <div class="row-section">
            <div class="manufacturer-section">
              <div style="width: 50%;" class="inventoryInformationDropdownStyling">
                {{ item.characteristics.manufacturer }}
              </div>
              <div style="width: 35%;">
                <div
                  style="display: flex: justify-content: flex-start;"
                  v-if="item.characteristics.model.length <= 5"
                  class="inventoryInformationDropdownStyling"
                >
                  {{ item.characteristics.series }}
                  {{ item.characteristics.model }}
                </div>

                <div v-else class="inventoryInformationDropdownStyling">
                  {{ item.characteristics.model }}
                </div>
              </div>
              <span class="info-popper">
                <el-popover
                  :close-delay="1"
                  :visible-arrow="false"
                  :popper-class="
                    theme === 'darkDropdownWithFilters'
                      ? 'panelSummaryPopoverDark'
                      : 'panelSummaryPopoverLight'
                  "
                  placement="top-end"
                  trigger="hover"
                >
                  <div v-if="item.characteristics" class="item-characteristics">
                    <!-- have a single variable for this -->
                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        Company
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.manufacturer }}
                      </div>
                    </div>

                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        Series
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.series }}
                      </div>
                    </div>

                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        Model
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.model }}
                      </div>
                    </div>

                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        No. of Cells
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.cell_number }}
                      </div>
                    </div>

                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        Cell type
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.cell_type }}
                      </div>
                    </div>

                    <div class="displayFlex">
                      <div :class="popperInfoTitleTheme">
                        Max Voltage
                      </div>
                      <div :class="currentInfoTheme">
                        {{ item.characteristics.v_max }}
                      </div>
                    </div>
                  </div>
                  <i slot="reference" class="el-icon-info" />
                </el-popover>
              </span>
            </div>
            <div class="characteristics-detail">
              {{ item.characteristics.p_mp_ref }} W
            </div>
          </div>
        </el-option>
      </el-option-group>
      <infinite-loading
        :distance="0"
        spinner="bubbles"
        @infinite="loadMorePanels"
      >
        <div slot="no-more" class="no-data">
          No more panels!!
        </div>
        <div slot="no-results" class="no-data">
          No more panels!!
        </div>

        <div slot="error" class="no-data">
          Error in fetching panels, retry!!
        </div>
      </infinite-loading>
    </el-select>
  </div>
</template>

<script>
import API from "@/services/api/";
import { mapState, mapActions } from 'pinia';
import { useOrgInventoryPanelsStore } from '../../../stores/organisation-inventory-panels';
export default {
  name: "PanelScroll",
  props: {
    areFavoritesRequired: {
      type: Boolean,
      default: true,
    },
    panel: {
      type: [Object, Array],
      default() {
        return this.isAdminPanel ? [] : {};
      },
    },

    moduleId: {
      type: Number,
      default: null,
    },

    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
    componentId: {
      type: String,
      default: "panel",
    },
    isAdminPanel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isScrollStateToBeReset: null,
      scrollState: "",
      msg: " I am in panelInventory",
      panelList: [],
      selectedPanel: this.panel,
      currentInfoTheme:
        this.theme === "darkDropdownWithFilters"
          ? "panelSummaryValueDark"
          : "panelSummaryValueLight",
      popperInfoTitleTheme:
        this.theme === "darkDropdownWithFilters"
          ? "panelSummaryKeyDark"
          : "panelSummaryKeyLight",
      panelSearch: "",
      addPanelDiv: false,
      loading: true,
      paneldb: [],
      nextURL: null,
      prevURL: null,
      panelMakeInput: null,
      filters: {
        p_min: null,
        p_max: null,
      },
      getRequestObject: {
        p_min: null,
        p_max: null,
        query: null,
      },
    };
  },
  computed: {
    ...mapState(useOrgInventoryPanelsStore, ["GET_ORGANISATION_PANELS"]),
    doesSelectedPanelExist() {
      if (!this.areFavoritesRequired) {
        return true;
      }
      return !(
        Object.entries(this.selectedPanel).length === 0 &&
        this.selectedPanel.constructor === Object
      );
    },
  },
  watch: {
    moduleId() {
      this.fetchSelectedModuleId();
    },
    panel: {
      deep: true,
      handler(value) {
        this.selectedPanel = JSON.parse(JSON.stringify(value));
      },
    },
  },
  async mounted() {
    await this.FETCH_ORGANISATION_PANELS();  
    this.fetchPanels();
  },
  methods: {
    ...mapActions(useOrgInventoryPanelsStore, [
      "FETCH_ORGANISATION_PANELS",
    ]),
    async fetchSelectedModuleId() {
      try {
        const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(
          this.moduleId
        );
        this.selectedPanel = response.data;
        this.$emit("update:panel", this.selectedPanel);
        this.addSelectedPanelToPanelList();
      } catch (e) {
        console.log(
          "fetchSelectedModuleId: Error in fetching selected panel",
          e
        );
      }
    },
    async fetchOrganisationPanels() {
      try {
        const orgInventoryResponseObject = this.GET_ORGANISATION_PANELS;
        const orgPanels = [];

        orgInventoryResponseObject.forEach((item) => {
          orgPanels.push(item.panel);
        });

        this.favoritesPanels = {
          label: "Favorites",
          options: orgPanels,
        };
        this.panelList.push(this.favoritesPanels);
      } catch (e) {
        console.error();
      }
    },

    async fetchMasterDataPanels() {
      try {
        this.loading = true;
        const response = await (this.isAdminPanel
          ? API.MASTER_DATA_PANEL.FETCH_ALL_MASTER_PANELS()
          : API.MASTER_DATA_PANEL.FETCH_MASTER_PANELS());
        this.setMasterDataPanels(response.data.results);
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        this.loading = false;
      } catch (e) {
        console.error();
      }
    },

    async addSelectedPanelToPanelList() {
      try {
        const vm = this;
        let isSelectedPanel = false;

        // check if this panel is in the favorites or starting list of panel list in selected menu
        this.panelList.forEach((arrayItem) => {
          arrayItem.options.forEach((panel) => {
            if (panel.id === vm.selectedPanel.id) {
              isSelectedPanel = true;
            }
          });
        });

        // if panel is not there add a new group to panelList and push it to the start of list
        if (!isSelectedPanel) {
          this.panelList.forEach((arrayItem) => {
            if (arrayItem.label === "Inventory") {
              arrayItem.options.push(this.selectedPanel);
            }
          });
        }
      } catch (e) {
        console.error();
      }
    },
    async searchMasterPanelsHelper(query) {
      try {
        this.loading = true;
        const response = await API.MASTER_DATA_PANEL.SEARCH_MASTER_PANELS(
          query,
          this.isAdminPanel
        );
        // resetting filters and request object in case of no results
        if (response.data.results.length === 0) {
          // Clear Query and reload Inventory
          setTimeout(() => {
            this.clearQueryAndReloadInventory();
            return null;
          }, 2000);
        }
        this.panelList = [];
        this.setMasterDataPanels(response.data.results);
        this.maintainScrollState();
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        this.loading = false;
      } catch (e) {
        console.error(e);
      }
    },
    async loadMorePanelsHelper(url, $state) {
      try {
        const response = await API.MASTER_DATA_PANEL.LOAD_MORE_PANELS(url);
        const panelsToBeAppended = response.data.results;
        // Appending it to inventory group
        this.panelList.forEach((currentGroup) => {
          if (currentGroup.label === "Inventory") {
            panelsToBeAppended.forEach((panel) => {
              currentGroup.options.push(panel);
            });
          }
        });
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        $state.loaded();
      } catch (e) {
        $state.error();
        console.error();
      }
    },
    async fetchPanels() {
      this.panelList = [];
      // fetching organisation panels
      if (this.areFavoritesRequired) await this.fetchOrganisationPanels();

      // Calling after favorites are added to the list
      await this.fetchMasterDataPanels();

      if (this.areFavoritesRequired) {
        this.fetchSelectedModuleId();
      }
    },
    setMasterDataPanels(allInventoryPanels) {
      const currentGroup = {
        label: "Inventory",
        options: allInventoryPanels,
      };
      this.panelList.push(currentGroup);
    },

    loadMorePanels($state) {
      this.scrollState = $state;
      if (this.nextURL !== null) {
        this.loadMorePanelsHelper(this.nextURL, $state);
      } else {
        $state.complete();
        this.isScrollStateToBeReset = true;
      }
    },

    removeEmptyKeys() {
      Object.keys(this.getRequestObject).forEach((key) => {
        if (this.getRequestObject[key] === null) {
          delete this.getRequestObject[key];
        }
      });
    },

    maintainScrollState() {
      if (this.isScrollStateToBeReset) {
        this.scrollState.reset();
        this.isScrollStateToBeReset = null;
      }
    },
    checkRequestStatusAndReloadInventory(requestObject) {
      if (Object.keys(requestObject).length === 0) {
        this.maintainScrollState();
        this.fetchPanels();
      } else {
        this.searchMasterPanelsHelper(requestObject);
      }
    },

    async clearQueryAndReloadInventory() {
      // Reset size filter
      this.filters.p_min = null;
      this.filters.p_max = null;
      Object.assign(this.getRequestObject, this.filters);

      // Reset Make query
      this.panelMakeInput = null;
      this.getRequestObject.query = null;

      await this.removeEmptyKeys();

      // Reload Inventory
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
    },

    generateQueryAndMakeRequest(e) {
      // Make a function to convert the object into query
      this.getRequestObject.query = this.panelMakeInput;
      this.getRequestObject.p_min = this.filters.p_min;
      this.getRequestObject.p_max = this.filters.p_max;

      // Remove empty keys from getRequestObject
      this.removeEmptyKeys();

      // Check if query object consist of non null arguments and make a call
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
      e.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
// These are global css needs to available across the app
//  classes which are appended to body can't be made scoped
@import "../../../styles/components/notification";
@import "../../../styles/components/switch";
@import "../../../styles/components/select";
@import "../../../styles/components/radio";
@import "../../../styles/components/dialog";
@import "../../../styles/components/utils";
@import "../../../styles/components/button";
</style>
<style scoped>
.panel-select {
  width: 100%;
}
.search-input {
  width: 65%;
  display: grid;
  padding: 0;
}
.filter-div span {
  color: #7f7f7f;
  font-size: 11px;
}
.info-popper {
  float: right;
  font-size: 13px;
}
.item-characteristics {
  padding: 10px;
  border: none;
}
.characteristics-detail {
  float: right;
}
.no-data {
  color: #606266;
  font-size: 12px;
}
.range-input {
  display: grid;
  width: 40%;
}
.range {
  display: flex;
}
.range input {
  width: 50%;
  border-radius: 0;
}
.dropdownSearchDeleteButtonStyler {
  text-align: right;
  display: flex;
}
.row-section {
  display: flex;
  justify-content: space-between;
  border: none;
}
.row-section .manufacturer-section {
  width: 90%;
  display: flex;
  justify-content: space-between;
}
.row-section .manufacturer-section .inventoryInformationDropdownStyling div {
  width: 70%;
  display: flex;
  justify-content: flex-start;
}
.displayFlex {
  display: flex;
  justify-content: flex-start;
}
.not-valid {
  font-size: 10.5px;
  color: red;
  position: absolute;
  right: 20px;
  top: 34px;
}
.inventoryInformationDropdownStyling {
  overflow-x: hidden;
  padding: 0 10px 0 0;
  text-overflow: ellipsis !important;
}

.panelSummaryKeyDark,
.panelSummaryValueDark {
  text-align: left;
  font-size: 0.8vw;
  text-overflow: ellipsis !important;
  padding-bottom: 2%;
  font-family: Helvetica Neue, sans-serif;
  color: #eaeaea;
  overflow-x: hidden;
  word-break: break-word;
}

.panelSummaryValueDark {
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  display: inline-block;
  max-width: 150px;
  min-width: 100px;
  white-space: nowrap;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
}
.panelSummaryKeyDark {
  font-weight: 400;
  text-decoration: none;
  width: 80px;
}
.panelSummaryPopoverDark {
  background-color: #363636 !important;
  border: 1px solid #363636 !important;
}

.panelSummaryPopoverDark .popper__arrow {
  border-top-color: #363636 !important;
  border-right-color: transparent !important;
  bottom: -7px !important;
}
.filter-div {
  position: absolute;
  width: 100%;
  height: 70px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 17px 0 17px;
  top: 0;
  background: #fff;
}
.filter-div input {
  height: 39px;
  margin: 0;
  font-size: 0.8rem;
  margin-top: 5px;
}
.range input {
  border-left: 0;
}
.filter-input-light {
  height: 25px;
  border-radius: 3px;
  border: 1px solid #909090;
  padding: 0 8px;
  font-size: 10px;
  color: #222;
}
.filter-input-light.make {
  border-radius: 4px 0 0 4px;
  width: 100%;
}
.submit-btn {
  border: 1px solid #409EFF;
  border-radius: 0 4px 4px 0;
  height: 39px;
  width: 45px;
  margin-top: 17px;
}
.panelSummaryKeyLight,
.panelSummaryValueLight {
  text-align: left;
  font-size: 0.8vw;
  text-overflow: ellipsis !important;
  padding-bottom: 2%;
  font-family: Helvetica Neue, sans-serif;
}
.panelSummaryKeyLight {
  color: #1b1b1b;
  font-weight: 400;
  text-decoration: none;
  overflow: hidden;
  width: 80px;
  word-break: break-word;
}
.panelSummaryValueLight {
  color: #606266;
  box-sizing: content-box;
  display: inline-block;
  max-width: 150px;
  min-width: 100px;
  overflow-x: hidden;
  white-space: nowrap;
  flex-grow: 1;
}

.panelSummaryPopoverLight .popper__arrow {
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  bottom: -7px !important;
}

.el-select-group__wrap:not(:last-of-type) {
  margin-top: 60px;
}
body >>> .el-scrollbar__wrap {
  margin-top: 0 !important;
}
.searchButtonStyleAddition {
  height: 100%;
  width: 100%;
  background: #409EFF;
  border-radius: 0;
  color: #fff;
  font-weight: 600;
}
</style>
