<template>
  <div class="container">
    <div class="navContainer" @click="handleCardSelect">
      <div class="gridContainer">
        <div class="firstContainer">
          <MenuView
            :menuItems="menuData"
            :clearAll.sync="clearAll"
            @ExpectedClosure="ExpectedClosure"
            @DCValue="DCValue"
            @systemCost="systemCost"
            @leadCheckbox="leadCheckbox"
            @tagCheckbox="tagCheckbox"
          />
          <div class="relativeCont">
            <p class="customize" v-if="isTableOptClicked">Customize Table</p>
            <div class="customizeDropdown" v-if="showCustomizeTable">
              <p class="drpDwnHeading">Select columns to view</p>
              <div class="drpdwnFlex" id="checkColor">
                <el-checkbox-group v-model="checkedColumnsList">
                  <el-checkbox
                    v-for="(column, index) in allColumnsList"
                    :key="index"
                    :label="column"
                  >
                    {{ column }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="applyBtnContainer">
                <el-button
                  type="primary"
                  class="applyBtn"
                  @click="applySelectedColumns()"
                  >Apply</el-button
                >
              </div>
            </div>
          </div>
        </div>
        <div class="secContainer">
          <div class="searchInpCont">
            <img src="./assets/search.svg" class="searchIcon" />
            <input
              type="text"
              class="searchInput"
              placeholder="Search"
              v-model="search"
            />
          </div>
          <div class="tableTypeCont">
            <div
              :class="['tableOpt', !isTableOptClicked ? 'activeClass' : '']"
              @click="setLeadListingView(false)"
            >
              <img
                :src="
                  !isTableOptClicked ? kanbanActiveIcon : kanbanNotActiveIcon
                "
                class="typeIcon"
              />
            </div>
            <div
              :class="['cardOpt', isTableOptClicked ? 'activeClass' : '']"
              @click="setLeadListingView(true)"
            >
              <img
                :src="isTableOptClicked ? tableActiveIcon : tableNotactiveIcon"
                class="typeIcon"
              />
            </div>
          </div>
          <el-button type="primary" class="createLeadBtn" @click="handleCreate"
            >Create Lead</el-button
          >
        </div>
      </div>
      <!-- TODO: Active Filters section incomplete -->
      <div class="activeFilters">
        <div>
          <div class="tagsContainer" v-if="selectedSort.length > 0">
            <div>
              <img src="./assets/sort.svg" alt="alter" />
            </div>
            <div>
              <el-tag
                class="tag"
                size="medium"
                style="margin-right: 15px"
                closable
                @close="handleRemoveSort()"
              >
                {{ handleDisplaySort(selectedSort) }}
              </el-tag>
            </div>
          </div>
        </div>
        <div
          class="tagsContainer"
          v-if="
            selectedFilter.length > 0 ||
            expectClosure ||
            systemsCost ||
            dcValue ||
            tags ||
            leadSources
          "
        >
          <div>
            <img src="./assets/filter_alt.svg" alt="alter" />
          </div>
          <!-- <p class="actFil">Active Filters</p> -->
          <div>
            <el-tag
              v-for="item in selectedFilter"
              :key="item"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleRemoveFilter(item)"
            >
              {{ handleDisplayFilters(item) }} : {{ item[2] }}
            </el-tag>

            <el-tag
              v-if="expectedClosure"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleRemovestartClosure()"
            >
              {{ expectedClosure.label }} : {{ formattedDate }}
            </el-tag>

            <el-tag
              v-if="dcValue?.value"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleDCremove()"
            >
              {{ dcValue.label }}:{{
                `${dcValue.value[0]}kW - ${dcValue.value[1]}kW`
              }}
            </el-tag>

            <el-tag
              v-if="systemsCost?.value"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleCostremove()"
            >
              {{ systemsCost.label }}:{{
                `${isUSFlagEnabled ? "$" : "₹"}${systemsCost.value[0]} - ${
                  isUSFlagEnabled ? "$" : "₹"
                }${systemsCost.value[1]}`
              }}
            </el-tag>

            <el-tag
              v-if="leadSources"
              class="tag"
              size="medium"
              closable
              @close="handleLeadremove()"
            >
              {{ leadSources.label }} : {{ leadSources.value }}
            </el-tag>

            <el-tag
              v-if="tags"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleTagremove()"
            >
              {{ tags.label }} : {{ tags.value }}
            </el-tag>
          </div>
        </div>
        <p
          class="clrAll"
          v-if="
            selectedFilter.length > 0 ||
            expectClosure ||
            systemsCost ||
            dcValue ||
            tags ||
            leadSources ||
            selectedSort.length > 0
          "
          @click="handleClear"
        >
          Clear all
        </p>
      </div>
    </div>
    <div
      v-loading="kanbanDataValue.length > 0 ? false : true"
      :style="{
        height: '60vh',
        marginTop: kanbanDataValue.length > 0 ? 0 : '1.5rem',
      }"
    >
      <KanbanView
        v-if="!isTableOptClicked"
        :kanBanColumns="kanbanColumnsData"
        :isLoading="isKanbanLoading"
        :dataTable="kanbanDataValue"
        @handleChange="handleChange"
        :buttonsData="buttonsData"
        :handleOrderClick="handleOnClick"
        :order.sync="order"
        :page="'Leads'"
        :getHeaderTitle="() => 'void'"
        :handleCreate="handleCreate"
        :columnType="'stage'"
        :drawer.sync="drawer"
        :drawerStage.sync="drawerStage"
        :componentName.sync="componentName"
        :drawerSize.sync="drawerSize"
        :leadDrawer="leadDrawer"
        :loadMoreData="loadMoreData"
        :offSetHeight="'18.5rem'"
        :showCreateDrawer.sync="showCreateDrawer"
        @updateReminder="handleReminder"
        :selectedCard="selectedCard"
        @handleColumnNumber="handleColumnNumber"
      />

      <LeadManagementTable
        v-else-if="kanbanDataValue.length"
        :search="search"
        :checkedColumnsList="checkedColumnsListToSend"
        :selectedSort.sync="selectedSort"
        :selectedFilter.sync="selectedFilter"
        :DCvalue.sync="DCvalue"
        :Systemcost.sync="Systemcost"
        :expectClosure.sync="expectClosure"
        :leadSeperator.sync="leadSeperator"
        :tagSeperator.sync="tagSeperator"
        :clearFlag.sync="clearFlag"
      />
    </div>

    <all-drawer
      :componentName="componentName"
      :key="createKey"
      :drawer.sync="drawer"
      :drawerStage.sync="drawerStage"
      :drawerSize="drawerSize"
      :propsData="{ leadData: order }"
      @save="drawer = false"
      @close="drawer = false"
    ></all-drawer>

    <setReminder
      :key="setKey"
      :showCreateDrawer="showCreateDrawer"
      @close="showCreateDrawer = false"
      :lead="order"
      @save="onSave"
    />

    <LeadsDrawer
      v-if="leadDrawer"
      :drawer="leadDrawer"
      :lead="leadValue"
      @update-kanban="handleUpdateKanban"
      :currentRowNumber="currentRowNumber"
      @close="[(leadDrawer = false), (activeTab = 'first')]"
      @update-owner="updateOwnerInCurrentRow"
      @update-stage="updateStageInCurrentRow"
      @update-lead-source="updateLeadSourceInCurrentRow"
      :activeTab="'first'"
      @updated-tags="updateTagsInCurrentRow"
    />
    <!-- <LeadsDrawer :drawer="drawer" /> -->

    <!-- <all-drawer
      :drawer="reminderDrawer"
      @save="reminderDrawer = false"
      :componentName="componentName"
      :drawerSize="500"
      @close="reminderDrawer = false"
    /> -->
  </div>
</template>

<script>
import KanbanView from "../../../components/ui/kanban/components/kanbanView.vue";
import API from "@/services/api/";
import LeadManagementTable from "./leadManagementTable.vue";
import { DateTime } from "luxon";
import createLead from "./../../createLead/components/index.vue";
import setReminder from "./../../setReminder/setReminder.vue";
import LeadsDrawer from "./leadsDrawer.vue";
import MenuView from "../../designOrders/components/header/menuView.vue";
import {
  generateColorFromName,
  getUiFromStorage,
  setUiInStorage,
  isUSFlagEnabled,
} from "../../../utils";
import debounce from "debounce";
import kanbanActive from "./assets/kanbanActive.svg";
import kanbanNotActive from "./assets/kanbanNotActive.svg";
import tableActive from "./assets/tableActive.svg";
import tableNotactive from "./assets/tableNotactive.svg";
import { formatDateTime, typeConstants } from "../../../utils/dateFormatter";

export default {
  components: {
    LeadManagementTable,
    KanbanView,
    createLead,
    setReminder,
    LeadsDrawer,
    MenuView,
  },

  data() {
    return {
      selectedCard: false,
      currentRowNumber: 0,
      setKey: 0,
      createKey: 0,
      clearFlag: false,
      clearAll: false,
      ui: getUiFromStorage(),
      startClosure: "",
      endClosure: "",
      expectClosure: "",
      expectedClosure: "",
      leadSources: "",
      tags: "",
      lessDC: "",
      moreDC: "",
      DCvalue: "",
      dcValue: "",
      Systemcost: "",
      leadSeperator: "",
      tagSeperator: "",
      costLess: "",
      costMore: "",
      expectedClosure: "",
      systemsCost: "",
      selectedSort: [],
      selectedFilter: [],
      filtersString: "",
      sortStrings: "",
      isUSFlagEnabled: isUSFlagEnabled,
      kanbanActiveIcon: kanbanActive,
      kanbanNotActiveIcon: kanbanNotActive,
      tableActiveIcon: tableActive,
      tableNotactiveIcon: tableNotactive,
      allTags: [],
      drawerStage: "",
      drawerSize: 700,
      leadDrawer: false,
      showCreateDrawer: false,
      leadData: "",
      leadValue: {},
      order: {},
      drawer: false,
      isKanbanLoading: true,
      isSearchedLeadEmpty: false,
      isSearchingLeads: false,
      searchVal: "",
      componentName: "createLead",
      value: "",
      selectedCheckboxes: [],
      selectedOption: "",
      selectedDate: "",
      datePickerOptions: {},
      activeIndex: "1",

      pipelines: [],
      options: [
        {
          value: "Option1",
          label: "Option1",
        },
        {
          value: "Option2",
          label: "Option2",
        },
      ],
      buttonsData: [],
      value: "",
      isTableOptClicked: false,
      showCustomizeTable: false,
      search: "",
      checkedColumnsList: [],
      typeConstants: typeConstants,
      allColumnsList: [
        "Stage",
        "Owner",
        "Type",
        "Created On",
        "Deal Value",
        "Latest Note",
        "System Size",
        "Last Contacted",
        "Country",
      ],
      checkedColumnsListToSend: [
        "Stage",
        "Owner",
        "Type",
        "Created On",
        "Deal Value",
        "Latest Note",
        "System Size",
        "Last Contacted",
        "Country",
      ],
      containerHeight: "2rem",
      kanBanColumns: [
        {
          title: "lead",
          tasks: [],
        },
        {
          title: "appointment",
          tasks: [],
        },

        {
          title: "proposal",
          tasks: [],
        },
        {
          title: "negotiation",
          tasks: [],
        },
        {
          title: "won",
          tasks: [],
        },
        {
          title: "lost",
          tasks: [],
        },
      ],
      kanbanData: [],
    };
  },

  watch: {
    selectedFilter(val) {
      console.log(val);
      let ui = getUiFromStorage();

      let reqObj = "";
      val.map((k, inx) => {
        reqObj = reqObj + `${k[1]}=${k[2]}`;
        if (inx < val.length - 1) {
          reqObj += "&";
        }
      });
      console.log(reqObj);
      this.filtersString = reqObj;
      // ui.leadManagement.selectedFilter = val;
      // ui.leadManagement.filterStrings = reqObj;

      // setUiInStorage(ui);

      this.getKanbanData();
    },
    leadSources(val) {
      // let ui = getUiFromStorage();
      // console.log(val);
      // ui.leadManagement.leadSource = val;
      // setUiInStorage(ui);
    },
    selectedSort(val) {
      console.log(val);
      this.sortStrings = val;
      console.log(this.sortStrings);
      let ui = getUiFromStorage();
      // ui.leadManagement.selectedSort = val;
      // setUiInStorage(ui);
      this.getKanbanData();
    },
    order(val) {
      console.log(val);
      // val.id = val.project_id;
      this.leadValue = val;
    },
    isTableOptClicked(val) {
      if (!val) {
        this.getKanbanData();
      }
    },
    search(val) {
      this.searchAllLeads(val);
      // this.searchVal = val;
      console.log(val);
      // if (!this.isTableOptClicked) {
      //   this.getKanbanData();
      // }
    },
    DCvalue(val) {
      console.log(val);

      // let ui = getUiFromStorage();
      // let data = val ? { label: "DC Capacity", value: val } : "";
      // this.dcValue = data;
      // ui.leadManagement.DCvalue = data;
      // setUiInStorage(ui);
    },
    Systemcost(val) {
      // let ui = getUiFromStorage();
      // let data = val ? { label: "System Cost", value: val } : "";
      // this.systemsCost = data;
      // ui.leadManagement.systemCost = data;
      // setUiInStorage(ui);
    },
    leadSeperator(val) {
      // let ui = getUiFromStorage();
      // let data = val ? { label: "Lead Source", value: val } : "";
      // this.leadSources = data;
      // ui.leadManagement.leadSource = data;
      // setUiInStorage(ui);
    },
    tagSeperator(val) {
      // console.log(val);
      // let ui = getUiFromStorage();
      // let data = val ? { label: "Tags", value: val } : "";
      // this.tags = data;
      // ui.leadManagement.tags = data;
      // setUiInStorage(ui);
    },
    // tags(val) {
    //   console.log(val);
    //   let ui = getUiFromStorage();
    //   let data = val ? { label: "Tags", value: val } : "";
    //   ui.leadManagement.tags = data;
    //   setUiInStorage(ui);
    // },

    expectClosure(val) {
      // let ui = getUiFromStorage();
      // console.log(val);
      // let data = val
      //   ? {
      //       label: "Expected Closure",
      //       value: val,
      //     }
      //   : "";
      // this.expectedClosure = data;
      // ui.leadManagement.ExpectedClosure = data;
      // setUiInStorage(ui);
    },
  },

  async mounted() {
    this.getAllTags();
    this.getKanbanData();
    // const lead = await API.LEADS.FETCH_LEAD_LIST();
    // console.log(lead);
    // const data = lead.data.results;
    // // const data = [
    // //   {
    // //     id: 65556,
    // //     weather: null,
    // //     project_type: "residential",
    // //     lead_details: {
    // //       id: 345,
    // //       stage: "Appointment",
    // //       owner: "CRM 2",
    // //       deal_value: 2000,
    // //       estimated_system_size: 0,
    // //       last_contacted: null,
    // //       lead_source: null,
    // //       target_closure_date: "12-03-2023",
    // //       name: "bewjk",
    // //       email: "a@i.com",
    // //       phone: "169900",
    // //       created_at: "2023-05-12T10:13:08.059251Z",
    // //     },
    // //     country: null,
    // //     tags: [],
    // //   },
    // //   {
    // //     id: 65555,
    // //     weather: null,
    // //     project_type: "residential",
    // //     lead_details: {
    // //       id: 344,
    // //       stage: "Lead",
    // //       owner: "CRM2",
    // //       deal_value: 2000,
    // //       estimated_system_size: 0,
    // //       last_contacted: null,
    // //       lead_source: null,
    // //       target_closure_date: "12-03-2023",
    // //       name: "g",
    // //       email: "a@i.com",
    // //       phone: "169900",
    // //       created_at: "2023-05-12T10:12:30.550894Z",
    // //     },
    // //     country: null,
    // //     tags: [],
    // //   },
    // // ];
    // let datacont = [];
    // data.map((d) => {
    //   d.lead_details.created_at = this.formateDateTime(
    //     d.lead_details.created_at
    //   );
    //   d.lead_details.tags = d.tags;
    //   d.lead_details.country = d.country;
    //   d.lead_details.project_type = d.project_type;
    //   d.lead_details.weather = d.weather;
    //   d.lead_details.project_id = d.id;
    //   datacont.push(d.lead_details);
    // });
    // console.log(datacont);
    // this.kanbanData = [];
    let ui = getUiFromStorage();
    ui.leadManagement.tableSelectedColumns ||= [...this.allColumnsList];

    setUiInStorage(ui);
    console.log(ui.leadManagement);
    this.isTableOptClicked = ui.leadManagement.isTableView;
    // this.selectedFilter = ui.leadManagement?.selectedFilter || "";
    // this.leadSources = ui.leadManagement?.leadSource || "";

    // this.dcValue = ui.leadManagement?.DCvalue || "";
    // this.expectClosure = ui.leadManagement?.ExpectedClosure || "";
    // console.log(this.leadSources);
    // this.Systemcost = ui.leadManagement?.systemCost || "";
    // this.tags = ui.leadManagement?.tags || "";

    this.checkedColumnsList = [...ui.leadManagement.tableSelectedColumns];
    this.checkedColumnsListToSend = [...ui.leadManagement.tableSelectedColumns];
    const vm = this;
    window.addEventListener(
      "click",
      function (e) {
        let customizeTableButton = document.querySelector(".relativeCont");
        if (!customizeTableButton) {
          return;
        }

        if (customizeTableButton?.contains(e.target)) {
          this.showCustomizeTable = true;
        } else {
          this.showCustomizeTable = false;
        }
      }.bind(vm)
    );
  },
  computed: {
    formattedDate() {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const date = new Date(this.startClosure);
      const day = date.getDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const month = months[monthIndex];

      const enddate = new Date(this.endClosure);
      const endday = enddate.getDate();
      const endmonthIndex = enddate.getMonth();
      const endyear = date.getFullYear();
      const endmonth = months[endmonthIndex];

      return `${day} ${month} ${year} - ${endday} ${endmonth} ${endyear}`;
    },
    menuData() {
      const menuItems = [
        {
          title: "Sort",
          icon: "sort",
          callback: (key, keypoints) => {
            console.log(keypoints);
            this.selectedSort = keypoints;
          },
          options: [
            {
              value: "Amount",
              label: "deal_value",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 1,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 2,
                },
              ],
            },
            {
              value: "Sales Stage",
              label: "stage",
              subOptions: [
                {
                  value: "Oldest To Newest",
                  label: "asc",
                  index: 3,
                },
                {
                  value: "Newest To Oldest",
                  label: "desc",
                  index: 4,
                },
              ],
            },
            {
              value: "Expected Closure Date",
              label: "target_closure_date",
              subOptions: [
                {
                  value: "Nearest First",
                  label: "asc",
                  index: 5,
                },
                {
                  value: "Farthest First",
                  label: "desc",
                  index: 6,
                },
              ],
            },
            {
              value: "Created Date",
              label: "created_at",
              subOptions: [
                {
                  value: "Oldest To Newest",
                  label: "asc",
                  index: 7,
                },
                {
                  value: "Newest To Oldest",
                  label: "desc",
                  index: 8,
                },
              ],
            },
            {
              value: "Last modified",
              label: "modified_at",
              subOptions: [
                {
                  value: "Oldest To Newest",
                  label: "asc",
                  index: 9,
                },
                {
                  value: "Newest To Oldest",
                  label: "desc",
                  index: 10,
                },
              ],
            },
            {
              value: "Deal Owner",
              label: "owner",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 11,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 12,
                },
              ],
            },
            {
              value: "Location",
              label: "country",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 13,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 14,
                },
              ],
            },
            {
              value: "System Size",
              label: "estimated_system_size",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 15,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 16,
                },
              ],
            },
            {
              value: "Client Names",
              label: "name",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 17,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 18,
                },
              ],
            },
          ],
        },
        {
          title: "Filter",
          icon: "filter",
          // callback: (key, keypoints) => {
          //   this.selectedFilter = keypoints;
          //   console.log("filter", key, keypoints);
          // },

          callback: (key, keypoints) => {
            console.log("filter", key, keypoints);
            const isExist = this.selectedFilter.find(
              (e) => e[1] === keypoints[1]
            );
            if (isExist) {
              if (keypoints[1] === "Created at" && keypoints[2] === "Custom")
                this.show = !this.show;
              if (keypoints[1] === "Due Date" && keypoints[2] === "Custom")
                this.dueshow = !this.dueshow;
              this.selectedFilter = this.selectedFilter.filter((e) => {
                if (e[1] !== keypoints[1]) return e;
              });
              this.selectedFilter.push(keypoints);
            } else {
              // this.ExpectedClosure()
              this.selectedFilter.push(keypoints);
            }

            console.log(this.selectedFilter);
            this.$emit("filterView", this.selectedFilter);
          },
          options: [
            {
              value: "Time Period",
              label: "time_period",
              type: "text",
              subOptions: [
                {
                  value: "This Week",
                  label: "This Week",
                  index: "This Week",
                },
                {
                  value: "This Month",
                  label: "This Month",
                  index: "This Month",
                },
                {
                  value: "This Quarter",
                  label: "This Quarter",
                  index: "This Quarter",
                },
              ],
            },
            {
              value: "Lead Source",
              label: "lead_source",
              type: "checkbox",
              subOptions: [
                {
                  value: "Website",
                  label: "website",
                },
                {
                  value: "Referral",
                  label: "referral",
                },
                {
                  value: "Marketing Compaigns",
                  label: "marketing",
                },
                {
                  value: "Outbound",
                  label: "outbound",
                },
              ],
            },
            {
              value: "Tags",
              label: "tags",
              type: "checkbox",
              // subOptions: [
              //   {
              //     value: "Rooftop",
              //     label: "Rooftop",
              //   },
              //   {
              //     value: "Ground-mount",
              //     label: "Ground-mount",
              //   },
              //   {
              //     value: "Storage",
              //     label: "Storage",
              //   },
              //   {
              //     value: "Re-roofing Required",
              //     label: "Re-roofing Required",
              //   },
              //   {
              //     value: "Gazebo",
              //     label: "Gazebo",
              //   },
              //   {
              //     value: "Special",
              //     label: "Special",
              //   },
              // ],
              subOptions: this.allTags,
            },
            {
              value: "Expected Closure",
              label: "Expected closure",
              type: "date",
            },
            // {
            //   label: "Location",
            //   value: "Location",
            //   type: "dropdown",
            //   subOptions: [
            //     { label: "USA", value: "USA" },
            //     { label: "California", value: "California" },
            //     { label: "90001", value: "9001" },
            //   ],
            // },
            {
              value: "Property Type",
              label: "property_type",
              type: "text",
              subOptions: [
                {
                  value: "Residential",
                  label: "residential",
                  index: "residential",
                },
                {
                  value: "Commercial",
                  label: "commercial",
                  index: "commercial",
                },
              ],
            },
            {
              value: "DC Capacity",
              label: "DC Capacity",
              type: "input",
            },
            {
              value: "System Cost",
              label: "System Cost",
              type: "$input",
            },
          ],
          expected_closure: "",
        },
      ];
      return menuItems;
    },
    computedShowCustomizeTable() {
      return this.showCustomizeTable;
    },
    kanbanColumnsData() {
      let organisationData =
        JSON.parse(localStorage.getItem("organisation")) || {};
      const pipelines = organisationData.pipelines;
      const kanbancol = pipelines.find((d) => d.name == "default")["stages"];
      this.pipelines = kanbancol;
      // kabancol.map((k) => {
      //   console.log(k);
      //   this.pipelines.push({ title: k, tasks: [] });
      // });
      return this.pipelines;
    },
    kanbanDataValue() {
      const kanbanSortedData = this.kanbanData.sort(
        (a, b) => a.sequence - b.sequence
      );
      let key = "sequence";
      console.log(kanbanSortedData);
      const arrayUniqueByKey = [
        ...new Map(kanbanSortedData.map((item) => [item[key], item])).values(),
      ];
      return arrayUniqueByKey;
    },
  },
  methods: {
    handleColumnNumber(column) {
      console.log(column);
      console.log(this.kanbanDataValue);
      const newData = this.loadMoreData(column);
      console.log(newData);
    },
    handleCardSelect() {
      console.log("data");
      this.selectedCard = !this.selectedCard;
    },
    handleUpdateKanban(lead, type, owner) {
      console.log(owner);

      // this.kanbanDataValue.map((d) => {
      //   if (d.title === lead.stage) {
      //     d.tasks.map((t) => {
      //       if (t.id === lead.id) {
      //         console.log(t);
      //         t.lead_details.owner = ` ${owner?.first_name || ""} ${
      //           owner?.last_name || ""
      //         }`;
      //         t.owner = ` ${owner?.first_name || ""} ${owner?.last_name || ""}`;
      //       }
      //     });
      //   }
      // });
      // this.kanbanData = this.kanbanDataValue;
      // const columnData = this.kanbanDataValue
      //   ? this.kanbanDataValue.length > 0
      //   : this.kanbanData;
      // const oldValue = this.kanbanDataValue.find((k) => k.title === lead.stage);
      // console.log(oldValue);
      // const oldLead = oldValue.tasks.find((l) => {
      //   if (l.id === lead.id) {
      //     l.owner = owner?.first_name || "" + owner?.last_name || "";
      //   }
      // });

      console.log(this.kanbanDataValue);
    },
    handleReminder() {
      this.setKey++;
    },
    handleDateFormate(isoDate, type, isUS) {
      return formatDateTime(isoDate, type, isUS);
    },
    async getAllTags() {
      try {
        const response = await API.ORGANISATION.GET_TAGS();
        const tagsData = response.data;
        tagsData?.map((t) => {
          t.label = t.name;
          t.value = t.name;
        });
        this.allTags = tagsData ? tagsData : [];
        console.log(tagsData);

        // this.suggestions = response.data;
        // this.totalSuggestions = response.data;
      } catch (e) {
        this.$message({
          showClose: true,
          message: "There was an unknown error while fetching the tags",
          type: "error",
          center: true,
        });
      }
    },
    handleClear() {
      this.clearAll = true;
      this.selectedFilter = [];
      this.selectedSort = "";
      this.sortStrings = "";
      this.startClosure = "";
      this.endClosure = "";
      this.lessDC = "";
      this.costLess = "";
      this.DCvalue = "";
      this.Systemcost = "";
      this.systemsCost = "";
      this.dcValue = "";
      this.expectClosure = "";
      this.costMore = "";
      this.moreDC = "";
      this.leadSeperator = "";
      this.tagSeperator = "";
      this.expectedClosure = "";
      // this.selectedSort = "";
      this.leadSources = "";
      this.tags = "";
      let ui = getUiFromStorage();
      ui.leadManagement.DCvalue = "";
      ui.leadManagement.tags = "";
      ui.leadManagement.ExpectedClosure = "";
      ui.leadManagement.leadSource = "";
      ui.leadManagement.systemCost = "";
      ui.leadManagement.selectedSort = "";
      ui.leadManagement.selectedFilter = "";

      setUiInStorage(ui);
    },
    handleRemoveFilter(item) {
      console.log(item);
      this.removed = item;
      console.log(this.selectedFilter);
      this.selectedFilter = this.selectedFilter.filter((e) => {
        if (e !== item) return e;
      });
      console.log(this.selectedFilter);
    },
    handleRemoveSort() {
      this.selectedSort = "";
      this.sortStrings = "";
      let ui = getUiFromStorage();
      ui.leadManagement.selectedSort = "";
      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleRemovestartClosure() {
      this.expectClosure = "";
      this.startClosure = "";
      this.endClosure = "";
      this.expectedClosure = "";

      let ui = getUiFromStorage();
      ui.leadManagement.ExpectedClosure = "";
      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleDCremove() {
      this.DCvalue = "";
      this.dcValue = "";
      this.lessDC = "";
      this.moreDC = "";
      let ui = getUiFromStorage();
      ui.leadManagement.DCvalue = "";
      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleCostremove() {
      this.Systemcost = "";
      this.systemsCost = "";
      this.costLess = "";
      this.costMore = "";
      let ui = getUiFromStorage();

      ui.leadManagement.systemCost = "";

      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleLeadremove() {
      this.leadSeperator = "";
      this.leadSources = "";
      let ui = getUiFromStorage();

      ui.leadManagement.leadSource = "";

      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleTagremove() {
      this.tagSeperator = "";
      this.tags = "";
      let ui = getUiFromStorage();
      ui.leadManagement.tags = "";
      setUiInStorage(ui);
      this.getKanbanData();
    },
    handleDisplayFilters(data) {
      console.log(data);
      const FilterData = this.menuData.find((d) => d.title === "Filter");
      console.log(FilterData);

      if (FilterData) {
        const FilterOptions = FilterData.options;
        console.log(FilterOptions);
        const options = FilterOptions.find((f) => f.label === data[1]);
        // const optionValue = options.subOptions.find(
        //   (so) => so.label === data[2]
        // );
        console.log(options);
        return options.value;
      }
    },
    handleDisplaySort(data) {
      console.log(data);

      const SortData = this.menuData.find((d) => d.title === "Sort");
      console.log(SortData);

      if (SortData) {
        const SortOptions = SortData.options;
        console.log(SortOptions);
        const options = SortOptions.find((f) => f.label === data[1]);
        const subOptions = options?.subOptions.find(
          (op) => op.index === data[2]
        );
        console.log(options);
        console.log(subOptions);
        return `${options.value} : ${subOptions.value}`;
      }
    },
    handleSort(data) {
      console.log(data);
      const SortData = this.menuData.find((d) => d.title === "Sort");
      console.log(SortData);

      if (SortData) {
        const SortOptions = SortData.options;
        let Sortsub = SortOptions[0].subOptions;
        console.log(Sortsub);
        const options = Sortsub.find((f) => f.index === data);
        console.log(options);
        return options.value;
      }
    },
    ExpectedClosure(value) {
      console.log(value);
      this.expectClosure = value;
      this.startClosure = value[0].toISOString();
      this.endClosure = value[1].toISOString();
      let ui = getUiFromStorage();
      console.log(value);
      let data = value
        ? {
            label: "Expected Closure",
            value: value,
          }
        : "";
      this.expectedClosure = data;
      // ui.leadManagement.ExpectedClosure = data;
      // setUiInStorage(ui);
      // this.selectedFilter.push([
      //   "Expected Closure",
      //   this.startClosure,
      //   this.endClosure,
      // ]);
      console.log(this.selectedFilter);
      this.getKanbanData();
    },
    DCValue(value) {
      console.log(value);
      this.DCvalue = value;
      console.log(this.DCvalue);
      this.lessDC = value[1];
      this.moreDC = value[0];
      let ui = getUiFromStorage();
      let data = value ? { label: "DC Capacity", value: value } : "";
      this.dcValue = data;
      // ui.leadManagement.DCvalue = data;
      // setUiInStorage(ui);
      this.getKanbanData();
    },
    systemCost(value) {
      console.log(value);
      this.Systemcost = value;
      this.costLess = value[1];
      this.costMore = value[0];
      let ui = getUiFromStorage();

      let data = value ? { label: "System Cost", value: value } : "";
      this.systemsCost = data;
      // ui.leadManagement.systemCost = data;
      setUiInStorage(ui);
      this.getKanbanData();
    },
    leadCheckbox(value) {
      this.leadSeperator = value.join(",");
      console.log(value);
      let ui = getUiFromStorage();
      let data = value ? { label: "Lead Source", value: value.join(",") } : "";
      this.leadSources = data;
      // ui.leadManagement.leadSource = data;
      // setUiInStorage(ui);
      this.getKanbanData();
    },
    tagCheckbox(value) {
      console.log(value);
      this.tagSeperator = value.join(",");
      let ui = getUiFromStorage();
      let data = value ? { label: "Tags", value: value.join(",") } : "";
      this.tags = data;
      // ui.leadManagement.tags = data;
      // setUiInStorage(ui);
      console.log(this.tagSeperator);
      this.getKanbanData();
    },
    onSave(remainderDetails) {
      this.showCreateDrawer = false;
      this.getKanbanData();
    },

    updateOwnerInCurrentRow(owner, row, lead) {
      this.kanbanDataValue.map((d) => {
        if (d.title === lead.stage) {
          d.tasks.map((t) => {
            if (t.id === lead.id) {
              console.log(t);
              t.lead_details.owner = ` ${owner?.first_name || ""} ${
                owner?.last_name || ""
              }`;
              t.owner = ` ${owner?.first_name || ""} ${owner?.last_name || ""}`;
            }
          });
        }
      });
      this.kanbanData = this.kanbanDataValue;
    },
    updateStageInCurrentRow(stage, row, lead, oldStage) {
      console.log(lead, stage);
      if (stage !== lead.stage) {
        const oldData = this.kanbanDataValue.find(
          (d) => d.title === lead.stage
        );
        const oldLead = oldData.tasks.find((l) => l.id === lead.id);
        this.kanbanDataValue.map((data) => {
          // if (data.title === lead.stage) {
          //   console.log(lead);
          //   console.log(data.tasks.filter((t) => t.id !== lead.id));
          //   data.tasks = data.tasks.filter((t) => t.id !== lead.id);
          // }
          if (data.title === stage) {
            oldLead.stage = stage;

            data.tasks.push(oldLead);
            data.tasks = data.tasks.sort((a, b) => b.lead_id - a.lead_id);
          } else {
            data.tasks = data.tasks.filter((t) => t.id !== lead.id);
          }
        });
        this.kanbanData = this.kanbanDataValue;
        console.log(this.kanbanDataValue);
      }
    },
    updateLeadSourceInCurrentRow(leadSource, row, lead) {
      this.kanbanDataValue.map((d) => {
        if (d.title === lead.stage) {
          d.tasks.map((t) => {
            if (t.id === lead.id) {
              console.log(t);
              t.lead_details.lead_source = leadSource;
              t.lead_source = leadSource;
            }
          });
        }
      });
      this.kanbanData = this.kanbanDataValue;
    },
    updateTagsInCurrentRow() {},

    formateToISO(date) {
      const originalDate = DateTime.fromISO(date);

      // Format the date to ISO format
      const formattedDate = originalDate.toISO();
      console.log(formattedDate);
    },

    formateDateTime(dateTime) {
      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() ===
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        const time = date.toLocaleString(DateTime.TIME_SIMPLE);
        return `Today at ${time}`;
      }

      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() ===
        DateTime.local().startOf("day").minus({ days: 1 }).toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        const time = date.toLocaleString(DateTime.TIME_SIMPLE);
        return `Yesterday at ${time}`;
      }

      return DateTime.fromISO(dateTime).toFormat("dd/MM/y  hh:mm a");
    },
    dataFormater(data) {
      let datacont = [];
      data.map((d) => {
        d.created_at = this.formateDateTime(d.lead_details.created_at);
        d.color = generateColorFromName(d.lead_details.name);
        d.lead_id = d.lead_details.id;
        d.project_id = d.id;
        d.name = d.lead_details.name;
        d.deal_value = d.email = d.lead_details.email;
        d.phone = d.lead_details.phone;
        d.estimated_system_size = d.lead_details.estimated_system_size;
        d.lead_source = d.lead_details.lead_source;
        d.last_contacted = d.lead_details.last_contacted;
        d.latest_notes = d.lead_details.latest_notes;
        d.owner = d.lead_details.owner;
        d.stage = d.lead_details.stage;
        d.target_closure_date = d.lead_details.target_closure_date;

        // d.lead_details.lead_details = d.lead_details;

        // d.lead_details.created_at = this.formateDateTime(
        //   d.lead_details.created_at
        // );
        // d.lead_details.color = generateColorFromName(d.lead_details.name);

        // d.lead_details.tags = d.tags;
        // d.lead_details.country = d.country;
        // d.lead_details.project_type = d.project_type;
        // d.lead_details.lead_id = d.lead_details.id;
        // d.lead_details.id = d.id;
        // d.lead_details.project_id = d.id;
        // d.lead_details.lead_details.id = d.lead_details.id;

        // d.lead_details.activity_logs = d.activity_logs;
        // d.lead_details.address = d.address;
        // d.lead_details.country = d.country;
        // d.lead_details.project_type = d.project_type;
        // d.lead_details.reminder_details = d.reminder_details;

        // d.lead_details.zoom = d.zoom;
        datacont.push(d);
      });
      return datacont;
    },

    async getKanbanData() {
      let kanbanColumns = this.kanbanColumnsData;
      let ui = getUiFromStorage();
      // let sortData = ui.leadManagement.selectedSort;
      // console.log(sortData);
      // let leadsSource = ui.leadManagement.leadSource?.value || "";
      // let dcless = ui.leadManagement.DCvalue
      //   ? ui.leadManagement.DCvalue.value[0]
      //   : "";
      // let dcmore = ui.leadManagement.DCvalue
      //   ? ui.leadManagement.DCvalue?.value[1]
      //   : "";

      // let expectedCloseure = ui.leadManagement.ExpectedClosure
      //   ? ui.leadManagement.ExpectedClosure.value[0]
      //   : "";
      // let expectedCloseureend = ui.leadManagement.ExpectedClosure
      //   ? ui.leadManagement.ExpectedClosure.value[1]
      //   : "";

      // let systemCostless = ui.leadManagement.systemCost
      //   ? ui.leadManagement.systemCost.value[0]
      //   : "";
      // let systemCostmore = ui.leadManagement.systemCost
      //   ? ui.leadManagement.systemCost.value[1]
      //   : "";

      // let tags = ui.leadManagement.tags ? ui.leadManagement.tags.value : "";
      // let selectedFilters = ui.leadManagement.selectedFilter
      //   ? ui.leadManagement.selectedFilter
      //   : "";
      // let filterString = ui.leadManagement.filterStrings;

      this.kanbanData = [];
      let reqObj = "";
      console.log(this.sortStrings);
      kanbanColumns.map(async (dt, index) => {
        // reqObj = `stage=${dt}&view=kanban&order_by=${
        //   sortData ? sortData[2] : ""
        // }&sort_by=${
        //   sortData ? sortData[1] : ""
        // }&expected_closure=${expectedCloseure}&expected_closure_before=${expectedCloseureend}&dc_capacity_above=${dcmore}&dc_capacity_below=${dcless}&system_cost_below=${systemCostless}&system_cost_above=${systemCostmore}&tags=${tags}&lead_source=${leadsSource}`;

        // let listParams = `order_by=${sortData ? sortData[2] : ""}&sort_by=${
        //   sortData ? sortData[1] : ""
        // }&expected_closure=${expectedCloseure}&expected_closure_before=${expectedCloseureend}&dc_capacity_above=${dcmore}&dc_capacity_below=${dcless}&system_cost_below=${systemCostless}&system_cost_above=${systemCostmore}&tags=${tags}&lead_source=${leadsSource}`;
        reqObj = `stage=${dt}&view=kanban&order_by=${
          this.sortStrings
            ? this.sortStrings[2] % 2 == 0
              ? "desc"
              : "asc"
            : ""
        }&sort_by=${
          this.sortStrings ? this.sortStrings[1] : ""
        }&expected_closure=${this.startClosure}&expected_closure_below=${
          this.endClosure
        }&dc_capacity_above=${this.lessDC}&dc_capacity_below=${
          this.moreDC
        }&system_cost_below=${this.costMore}&system_cost_above=${
          this.costLess
        }&tags=${this.tagSeperator}&lead_source=${this.leadSeperator}`;

        let listParams = `order_by=${
          this.sortStrings
            ? this.sortStrings[2] % 2 == 0
              ? "desc"
              : "asc"
            : ""
        }&sort_by=${
          this.sortStrings ? this.sortStrings[1] : ""
        }&expected_closure=${this.startClosure}&expected_closure_below=${
          this.endClosure
        }&dc_capacity_above=${this.lessDC}&dc_capacity_below=${
          this.moreDC
        }&system_cost_below=${this.costMore}&system_cost_above=${
          this.costLess
        }&tags=${this.tagSeperator}&lead_source=${this.leadSeperator}`;

        // if (selectedFilters) {
        //   console.log(selectedFilters);
        //   reqObj += `&${selectedFilters}`;
        //   listParams += `&${selectedFilters}`;
        // }
        if (this.filtersString) {
          console.log(this.filtersString);
          reqObj += `&${this.filtersString}`;
          listParams += `&${this.filtersString}`;
        }

        if (this.searchVal) {
          reqObj += `&query=${this.searchVal}`;
          listParams += `&query=${this.searchVal}`;
        }

        ui.leadManagement.filterKanbanParams = reqObj;
        ui.leadManagement.filterListParams = listParams;
        setUiInStorage(ui);
        console.log(reqObj);
        let result = await API.LEADS.FETCH_LEAD_LIST(
          ui.leadManagement.filterKanbanParams
        );
        console.log(result)
        let dataValue = result?.data.results;
        let count = result?.data.count || 0;

        let newData = {
          sequence: index,
          count: count,
          title: dt,
          tasks: dataValue.length > 0 ? this.dataFormater(dataValue) : [],
          next: result ? result.data.next : "",
          previous: result ? result.data.previous : "",
        };
        console.log(index);
        console.log(newData);

        this.kanbanData.push(newData);
      });
      this.isKanbanLoading = false;
    },

    applySelectedColumns() {
      let ui = getUiFromStorage();
      ui.leadManagement.tableSelectedColumns = [...this.checkedColumnsList];
      setUiInStorage(ui);
      this.checkedColumnsListToSend = [...this.checkedColumnsList];
      this.showCustomizeTable = false;
    },

    async handleChange(value, columns) {
      if (!value) return;
      let leadData = value;
      let id = leadData.id;

      let i = 0,
        newStatus;
      while (i < columns.length) {
        let status = columns[i].tasks.find((e) => e.id === id);
        if (status) {
          newStatus = columns[i].title;
          this.order = value;
          this.order.stage = newStatus;
          this.order.lead_details.stage = newStatus;

          const postData = {
            stage: newStatus,

            // name: leadData.name,
            // phone: leadData.phone,
            // email: leadData.email,
            // address: leadData.address ? leadData.address : "",
            // owner: leadData.owner,
            // target_closure_date: leadData.target_closure_date,
            // deal_value: leadData.deal_value,
            // pipeline: 1,
            // tags: leadData.tags,
            // quota_type: leadData.quota_type ? leadData.quota_type : null,
            // Is_public_sharing_enabled: leadData.Is_public_sharing_enabled
            //   ? leadData.Is_public_sharing_enabled
            //   : true,
            // lead_source: leadData.lead_source,
          };

          try {
            let res = await API.LEADS.UPDATE_LEAD(
              leadData.lead_id,
              leadData.project_id,
              postData
            );
            return res;
          } catch (err) {}
        }
        i++;
      }
    },
    handleCreate(data) {
      if (data.title) {
        this.drawerStage = data.title;
      } else {
        this.drawerStage = "";
      }
      this.createKey++;
      this.componentName = "createLead";
      this.drawerSize = 700;
      this.drawer = true;
    },
    handleOnClick(data) {
      console.log(data);
      this.leadData = data;
      this.leadDrawer = true;
    },
    async loadMoreData(col) {
      const response = await API.DESIGN_ORDERS.LOAD_MORE_Leads(col.next);
      this.kanbanData.map((dt) => {
        if (dt.title === col.title) {
          dt.tasks.push(...this.dataFormater(response.data.results));
          dt.next = response.data.next;
        }
      });
    },
    searchAllLeads(query) {
      if (query !== "") {
        this.isLoading = true;
        setTimeout(() => {
          this.searchAllLeadsHelper(query);
        }, 200);
      } else {
        // fetching all leads
        this.allLeadsList = [];
        this.isLoading = true;
        this.searchVal = "";
        this.getKanbanData();
      }
    },
    async searchAllLeadsHelper(query) {
      try {
        this.isSearchedLeadEmpty = true;
        // this.isLoading = true;
        this.isSearchingLeads = true;
        this.searchVal = query;
        this.getKanbanData();
        const response = await API.LEADS.SEARCH_ALL_LEADS_KANBAN(query, "Lead");
        console.log(response);
        // this.allLeadsList = [];
        // this.assignAPIResponse(response);
        // this.isLoading = false;

        // if (this.allLeadsList.lenght > 0) this.isSearchedLeadEmpty = false;
      } catch (error) {
        console.error(error);
      }
    },
    setUiOptions() {
      let ui = getUiFromStorage();
      this.isTableOptClicked = ui?.leadManagement?.isTableView == true;
    },
    setLeadListingView(isTable) {
      this.isTableOptClicked = isTable;
      let ui = getUiFromStorage();
      ui.leadManagement.isTableView = isTable;
      setUiInStorage(ui);
    },
  },
};
</script>

<style scoped>
.checkBox {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 2%;
}

.checkBox .el-checkbox {
  padding: 5%;
}

.updateButton {
  background-color: #1c191c2e;
  border: none;
  color: white;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  float: right;
  margin-right: 12px;
}

.labelText {
  margin-right: 10px;
}

@media (min-width: 1281px) {
  .container {
    width: calc(100% - 74px);
    margin-left: auto;
    padding: 24px 30px;
    height: calc(100vh - 101px);
    background-color: #e8edf2;
  }
}

@media (max-width: 1280px) {
  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}

@media (max-width: 650px) {
  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}
</style>

<style scoped>
.gridContainer {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.firstContainer,
.secContainer {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: 24px;
}

.commonPtag {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: -8px;
}

.filterCont {
  display: flex;
  align-items: center;
  gap: 12px;
}

.relativeCont {
  position: relative;
}

.customize {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  cursor: pointer;
}

.customizeDropdown {
  position: absolute;
  top: 24px;
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  z-index: 1;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.25);
}

.drpDwnHeading {
  font-size: 16px;
  font-weight: 600;
  color: #1c3366;
}

.drpdwnFlex >>> .el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  overflow: hidden;
  overflow-y: scroll;
  height: 250px;
}

.applyBtnContainer {
  text-align: center;
  margin-top: 8px;
}

.searchInpCont {
  position: relative;
  max-width: 320px;
}

.searchInput {
  width: 100%;
  font-size: 18px;
  padding-left: 36px;
  height: 42px;
  border-radius: 4px;
  border: none;
}

.searchIcon {
  position: absolute;
  top: 12px;
  left: 8px;
}

.tableTypeCont {
  display: flex;
  align-items: center;
}

.tableOpt,
.cardOpt {
  display: grid;
  place-items: center;
  height: 40px;
  width: 40px;
  border: solid 1.1px #999;
  cursor: pointer;
}

.tableOpt {
  border-right: none;
}

.activeClass {
  background-color: #1c3366;
}

.createLeadBtn {
  width: 123px;
  height: 40px;
  font-size: 16px;
  font-weight: 600;
  padding: 0px;
}

.relativeCont >>> .el-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  display: flex;
  align-items: center;
  font-size: 16px;
}

.relativeCont >>> .el-checkbox__label {
  font-size: 16px;
  color: #222;
}

.relativeCont >>> .el-checkbox__inner {
  width: 18px;
  height: 18px;
  border: 1px solid #777;
}

.filterCont >>> .el-select {
  width: 100%;
  max-width: 150px;
}

.filterCont >>> .el-input__inner {
  border: none;
}

.filterCont >>> .el-input__inner::placeholder {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.filterCont >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  position: relative;
  font-size: 18px;
}

.filterCont >>> .thirdSelect {
  width: 100%;
  max-width: 190px;
}

.navContainer >>> .el-checkbox__inner::after {
  border: 2px solid #ffffff;
  border-left: 0;
  border-top: 0;
  height: 8px;
  left: 5px;
}

.tagsContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.activeFilters {
  display: flex;
  margin: 15px auto;
}

.actFil,
.clrAll {
  font-size: 16px;
  color: #777;
  padding-right: 8px;
  margin: auto 0;
}

.clrAll {
  text-align: center;
  padding-left: 8px;
  cursor: pointer;
}

.tags {
  padding: 4px 12px;
  border-radius: 50px;
  background-color: #1c3366;
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.crossIcon {
  cursor: pointer;
}
.el-tag {
  color: #ffffff;
  background-color: #1c3366;
  height: 29px;
  font-size: 16px;
  font-weight: 400;
  border-radius: 50px;
  text-align: center;
  position: relative;
  padding-right: 33px;
}
.el-tag >>> .el-icon-close {
  position: absolute;
  right: 13px;
  top: 6.5px;
  color: #ffffff;
  font-size: 16px;
}
.el-tag >>> .el-icon-close::before {
  color: #ffffff;
  font-size: 16px;
}
</style>

<style>
::-webkit-scrollbar {
  width: 5px;
  border-radius: 4px;
  height: 6px;
}
</style>
