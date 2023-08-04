<template>
  <div>
    <div class="tableContainer" v-loading="isLoading">
      <div class="tableHeader">
        <div class="headerTitle leadDet">Lead Details</div>
        <div
          v-if="checkedColumnsList.includes('Stage')"
          class="headerTitle stage"
        >
          Stage
        </div>
        <div
          v-if="checkedColumnsList.includes('Owner')"
          class="headerTitle owner"
        >
          Owner
        </div>
        <div
          v-if="checkedColumnsList.includes('Type')"
          class="headerTitle type"
        >
          Type
        </div>
        <div
          v-if="checkedColumnsList.includes('Created On')"
          class="headerTitle createdOn"
        >
          Created On
        </div>
        <div
          v-if="checkedColumnsList.includes('Deal Value')"
          class="headerTitle dealVal"
        >
          Deal Value
        </div>
        <div
          v-if="checkedColumnsList.includes('Latest Note')"
          class="headerTitle latestNote"
        >
          Latest Note
        </div>
        <div
          v-if="checkedColumnsList.includes('System Size')"
          class="headerTitle sysSize"
        >
          System Size
        </div>
        <div
          v-if="checkedColumnsList.includes('Last Contacted')"
          class="headerTitle lastCont"
        >
          Last Contacted
        </div>
        <div
          v-if="checkedColumnsList.includes('Country')"
          class="headerTitle lastCont"
        >
          Country
        </div>
      </div>
      <div class="parentBodyContainer">
        <div
          class="bodyContainer"
          v-for="(lead, index) in computedAllLeadsList"
          :key="index"
          @click="openLeadDrawer(lead, index, $event)"
        >
          <div class="bodyContent leadDetBody">
            <div class="leadFlex">
              <div class="leadDetcolumn">
                <p class="name">
                  <el-tooltip placement="top">
                    <div slot="content">
                      <span
                        ><p class="lead-name">
                          {{ lead?.lead_details?.name }}
                        </p></span
                      >
                    </div>
                    <span
                      ><p>
                        {{ lead?.lead_details?.name }}
                      </p></span
                    >
                  </el-tooltip>
                </p>
                <p
                  v-if="lead.reminder_details"
                  class="remainder"
                  @click="onSetReminder(lead, index)"
                >
                  {{ reminderTimeText(lead) }}
                </p>
                <p v-else class="remainder" @click="onSetReminder(lead, index)">
                  Set Reminder
                </p>
              </div>
              <div class="leadIcons">
                <div
                  class="tooltipCommon"
                  id="addNoteBtn"
                  @click="addNoteClick($event, lead, index)"
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Add Notes"
                    placement="top-start"
                    popper-class="tooltipClass"
                  >
                    <img src="./assets/Vector (1).svg" class="vectorIcon" />
                  </el-tooltip>
                </div>
                <div class="tooltipCommon">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="View Tasks"
                    placement="top-start"
                  >
                    <img
                      src="./assets/event_list.svg"
                      @click="onClickTasks"
                      class="eventListIcon"
                    />
                  </el-tooltip>
                </div>
                <div class="tooltipCommon site-survey-button">
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">
                      <!-- TODO: 'isGeneratingSiteSurvey' condition should ideally be specific to a lead -->
                      <i
                        class="el-icon-loading"
                        v-if="isGeneratingSiteSurvey"
                      ></i>
                      <div v-else>{{ siteSurveyOptionToolTip(lead) }}</div>
                    </div>
                    <span>
                      <img
                        @click="onClickSiteSurvey(lead)"
                        src="./assets/assignment.svg"
                        class="assignmentIcon"
                        :class="{ disabled: !lead.address }"
                      />
                    </span>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <div
            class="bodyContent stageBody"
            v-if="checkedColumnsList.includes('Stage')"
          >
            <el-select
              v-model="lead.lead_details.stage"
              @change="changeLeadStage(lead)"
              placeholder="Negotiation"
            >
              <el-option
                v-for="stage in pipeline"
                :key="stage"
                :label="stage"
                :value="stage"
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="bodyContent ownerBody"
            v-if="checkedColumnsList.includes('Owner')"
          >
            <p
              class="ownerN"
              :style="{
                backgroundColor: generateColorFromName(
                  lead?.lead_details?.owner
                )
                  ? generateColorFromName(lead?.lead_details?.owner)
                  : '#1c3366',
              }"
              v-if="lead?.lead_details?.owner ? lead?.lead_details?.owner : ''"
            >
              {{ textInitial(lead?.lead_details?.owner) }}
            </p>
            <!-- <span class="ownerLine">{{
                      lead?.lead_details?.owner? lead?.lead_details?.owner : "—" }}
                    </span> -->
            <el-tooltip placement="bottom" :hide-after="0">
              <div slot="content">
                <span
                  >{{
                    lead?.lead_details?.owner ? lead?.lead_details?.owner : "—"
                  }}
                </span>
              </div>
              <span class="ownerLine"
                >{{
                  lead?.lead_details?.owner ? lead?.lead_details?.owner : "—"
                }}
              </span>
            </el-tooltip>
          </div>
          <div
            class="bodyContent typeBody"
            v-if="checkedColumnsList.includes('Type')"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <img
                :src="
                  lead?.project_type == 'residential'
                    ? residentialIcon
                    : commercialIcon
                "
              />
              <p class="typeLine">{{ lead?.project_type }}</p>
            </div>
          </div>
          <div
            class="bodyContent createdOnBody"
            v-if="checkedColumnsList.includes('Created On')"
          >
            <p class="createdOnLine">
              {{
                handleFormatDate(
                  lead?.lead_details?.created_at,
                  typeConstants.shortDate,
                  isUSFlagEnabled
                )
              }}
            </p>
          </div>
          <div
            class="bodyContent dealValBody"
            v-if="checkedColumnsList.includes('Deal Value')"
          >
            <p class="dealValLine">
              {{ currencySymbol(lead)
              }}{{
                formatNumberWithCommas(
                  lead?.lead_details?.deal_value,
                  isIndianLocationOrAccount(lead)
                )
              }}
            </p>
          </div>
          <div
            class="bodyContent latestNoteBody"
            v-if="checkedColumnsList.includes('Latest Note')"
          >
            <p class="latestNoteLine">
              {{ lead?.lead_details?.latest_notes || "—" }}
            </p>
          </div>
          <div
            class="bodyContent sysSizeBody"
            v-if="checkedColumnsList.includes('System Size')"
          >
            <p class="sysSizeLine">
              {{
                formatNumberWithCommas(
                  lead?.lead_details?.estimated_system_size || 0,
                  isIndianLocationOrAccount(lead)
                )
              }}
              kWp
            </p>
          </div>
          <div
            class="bodyContent lastContBody"
            v-if="checkedColumnsList.includes('Last Contacted')"
          >
            <p class="lastContLine">
              {{ lead?.lead_details?.last_contacted || "—" }}
            </p>
          </div>
          <div
            class="bodyContent lastContBody"
            v-if="checkedColumnsList.includes('Country')"
          >
            <p class="lastContLine">{{ lead?.country?.name || "—" }}</p>
          </div>
        </div>
        <div
          v-infinite-scroll="loadMoreLeads"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="10"
          style="text-align: center"
        >
          <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
        </div>
      </div>
    </div>
    <EmptySiteSurveyLinkPopUp
      :emptySiteSurvey.sync="emptySiteSurvey"
      :closeEmptySiteSurveyPopUp.sync="closeEmptySiteSurveyPopUp"
    />
    <LeadsDrawer
      v-if="drawer"
      :drawer="drawer"
      :focusNote="focusOnAddNote"
      :lead="activeLead"
      :currentRowNumber="currentRowNumber"
      @close="[(drawer = false), (activeTab = 'first')]"
      @update-owner="updateOwnerInCurrentRow"
      @update-stage="updateStageInCurrentRow"
      @update-lead-source="updateLeadSourceInCurrentRow"
      :activeTab="activeTab"
      @updated-tags="updateTagsInCurrentRow"
    />
    <!-- <all-drawer :drawer="reminderDrawer" @save="reminderDrawer = false" :componentName="componentName" :drawerSize="500"
            @close="reminderDrawer = false" :leadId="leadId"/> -->
    <setReminder
      :key="setKey"
      :showCreateDrawer="showCreateDrawer"
      @close="showCreateDrawer = false"
      :lead="activeLead"
      @save="onSave"
      :drawerSize="400"
    />
  </div>

  <!-- <LeadsDrawer :drawer="drawer" />
    <all-drawer
      :drawer="reminderDrawer"
      @save="reminderDrawer = false"
      :componentName="componentName"
      :drawerSize="500"
      @close="reminderDrawer = false"
    /> -->
  <!-- </div> -->
</template>

<script>
import API from "@/services/api/";
import debounce from "debounce";
import LeadsDrawer from "./leadsDrawer.vue";
import setReminder from "./../../setReminder/setReminder.vue";
import {
  getLeadPipelineStages,
  generateColorFromName,
  formatNumberWithCommas,
  isUSFlagEnabled,
  getUiFromStorage,
} from "../../../utils";
import { DateTime } from "luxon";
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import residentialIcon from "./assets/residential.svg";
import commercialIcon from "./assets/commercial.svg";
import { formatDateTime, typeConstants } from "../../../utils/dateFormatter";
import EmptySiteSurveyLinkPopUp from "../../dashboard/components/emptySiteSurveyPopUp.vue";
import { DATABASE_URL } from "../../../constants";
import { mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";

export default {
  components: {
    setReminder,
    LeadsDrawer,
    EmptySiteSurveyLinkPopUp,
  },

  data() {
    return {
      setKey: 0,
      startClosure: "",
      endClosure: "",
      lessDC: "",
      moreDC: "",
      leadSeperator: "",
      ui: getUiFromStorage(),
      tagSeperator: "",
      costLess: "",
      costMore: "",
      residentialIcon,
      commercialIcon,
      leadIndex: 0,
      showCreateDrawer: false,
      componentName: "setReminder",
      reminderDrawer: false,
      drawer: false,
      leadId: null,
      checked: true,
      isLoading: false,
      isSearchedLeadEmpty: false,
      isSearchingLeads: false,
      isGeneratingSiteSurvey: false,
      nextUrl: null,
      prevUrl: null,
      allLeadsList: [],
      busy: false,
      pipeline: getLeadPipelineStages(),
      filtersString: "",
      sortString: "",
      isSiteSurvey: false,
      closeEmptySiteSurveyPopUp: true,
      emptySiteSurvey: false,
      // pipeline: [
      //     {
      //         label: 'option1',
      //         value: 'option1',
      //     },
      //     {
      //         label: 'option2',
      //         value: 'option2',
      //     }
      // ],
      selectedStage: "option1",
      activeLead: null,
      drawer: false,
      activeTab: "first",
      currentRowNumber: 0,
      focusOnAddNote: false,
      typeConstants: typeConstants,
    };
  },
  props: {
    search: {
      type: String,
      default: "",
    },
    checkedColumnsList: {
      type: Array,
      default: [
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
    },
    selectedSort: {
      type: Array,
      default: [],
    },
    selectedFilter: {
      type: Array,
      default: [],
    },
    DCvalue: {
      type: Array,
      default: [],
    },
    Systemcost: {
      type: Array,
      default: [],
    },
    expectClosure: {
      type: Array,
      default: [],
    },
    leadSeperator: {
      type: String,
      default: "",
    },
    tagSeperator: {
      type: String,
      default: "",
    },
  },
  mounted() {
    let ui = getUiFromStorage();
    console.log(ui.leadManagement);
    ui.leadManagement.filterListParams
      ? this.fetchFilteredLeads(ui.leadManagement.filterListParams)
      : this.fetchAllLeads();
  },
  created() {
    this.searchAllLeads = debounce(this.searchAllLeads, 1000);
  },
  watch: {
    search(val) {
      this.searchAllLeads(val);
    },
    selectedSort(val) {
      this.sortString = val;
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    selectedFilter(val) {
      console.log(val);
      let reqObj = "";
      val.map((k, inx) => {
        reqObj = reqObj + `${k[1]}=${k[2]}`;
        if (inx < val.length - 1) {
          reqObj += "&";
        }
      });
      this.filtersString = reqObj;
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    DCvalue(val) {
      console.log(val);
      this.lessDC = val[1] == undefined ? "" : val[1];
      this.moreDC = val[0] == undefined ? "" : val[0];
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    expectClosure(val) {
      console.log(val);
      if (val.length > 0) {
        this.startClosure = val[0].toISOString();
        this.endClosure = val[1].toISOString();
        if (val) {
          this.fetchFilteredLeads();
        }
      } else {
        this.startClosure = "";
        this.endClosure = "";
        if (val) {
          this.fetchFilteredLeads();
        }
      }
    },
    Systemcost(val) {
      console.log(val);
      this.costLess = val[1] == undefined ? "" : val[1];
      this.costMore = val[0] == undefined ? "" : val[0];
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    leadSeperator(val) {
      console.log(val);
      this.leadSeperator = val;
      let ui = getUiFromStorage();
      console.log(ui);
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    tagSeperator(val) {
      console.log(val);
      this.tagSeperator = val;
      console.log(this.tagSeperator);
      if (val) {
        this.fetchFilteredLeads();
      }
    },
    drawer(val) {
      if (!val) {
        this.focusOnAddNote = false;
      }
    },
  },

  computed: {
    computedAllLeadsList() {
      return this.allLeadsList;
    },
    isUSFlagEnabled,
  },
  methods: {
    siteSurveyOptionToolTip(lead) {
      if (!lead.address) {
        return "Please Add Address";
      } else if (lead.address && lead.site_survey_token === null) {
        return "Get Site Survey Link";
      } else {
        return "View Site Survey";
      }
    },
    onClickSiteSurvey(lead) {
      let siteSurveyToken = lead.site_survey_token;
      if (siteSurveyToken) {
        this.viewSiteSurvey(lead);
      } else {
        this.generateSiteSurveyToken(lead);
      }
    },
    async viewSiteSurvey(lead) {
      const surveyData = lead.site_survey_token;
      const URL = `${DATABASE_URL}api/site-survey-details/${surveyData}/`;
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const { token } = user;

      const myHeaders = new Headers();
      myHeaders.append("authorization", `Token ${token}`);
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };
      await fetch(URL, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);
          if (
            data.site_survey_details.length === 0 &&
            this.closeEmptySiteSurveyPopUp
          )
            this.emptySiteSurvey = true;
        });
      if (surveyData && !this.emptySiteSurvey) {
        const routeData = this.$router.resolve({
          name: "mediaBox",
          params: { surveyId: surveyData },
        });
        window.open(routeData.href, "_blank");
      }
    },
    async generateSiteSurveyToken(lead) {
      this.isSiteSurvey = true;
      this.isGeneratingSiteSurvey = true;
      try {
        let response = await API.SITE_SURVEY_LINK.FETCH_SITE_SURVEY_LINK();
        let siteSurveyToken = response.data.token;
        await API.PROJECTS.PATCH_PROJECT(lead.id, {
          site_survey_token: this.siteSurveyToken,
        });
        lead.site_survey_token = siteSurveyToken;
      } catch (e) {
        console.error("error", e);
      }
      this.isGeneratingSiteSurvey = false;
    },
    handleFormatDate(isoDateTime, type, isUS) {
      return formatDateTime(isoDateTime, type, isUS);
    },
    async fetchFilteredLeads() {
      try {
        // console.log(keypoints);
        // let reqObj = `order_by=${
        //   this.sortString ? this.sortString[2] : ""
        // }&sort_by=${
        //   this.sortString ? this.sortString[1] : ""
        // }&expected_closure=${this.startClosure}&expected_closure_below=${
        //   this.endClosure
        // }&dc_capacity_above=${this.lessDC}&dc_capacity_below=${
        //   this.moreDC
        // }&system_cost_below=${this.costMore}&system_cost_above=${
        //   this.costLess
        // }&tags=${this.tagSeperator}&lead_source=${this.leadSeperator}&`;
        // // keypoints.map((k, inx) => {
        // //   reqObj = reqObj + `${k[1]}=${k[2]}`;
        // //   if (inx < keypoints.length - 1) {
        // //     reqObj += "&";
        // //   }
        // // });
        // if (this.filtersString) {
        //   reqObj += `${this.filtersString}`;
        // }

        this.allLeadsList = [];
        this.isLoading = true;
        this.isSearchingLeads = false;
        this.nextUrl = null;
        // console.log(reqObj);
        let ui = getUiFromStorage();
        console.log(ui);
        const response = await API.LEADS.FETCH_LEAD_LIST(
          ui.leadManagement.filterListParams
        );
        if (this.isSearchingLeads) {
          return;
        }
        //---------------------------------------------------------------------//
        this.assignAPIResponse(response);
        this.isLoading = false;
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while sorting leads",
          type: "error",
          center: true,
        });
      }
    },
    async fetchSortedLeads(keypoints) {
      try {
        console.log(keypoints);
        this.allLeadsList = [];
        this.isLoading = true;
        this.isSearchingLeads = false;
        const response = await API.LEADS.FETCH_SORTED_LEADS(
          keypoints[2],
          keypoints[1]
        );
        if (this.isSearchingLeads) {
          return;
        }
        //---------------------------------------------------------------------//
        this.assignAPIResponse(response);
        this.isLoading = false;
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while sorting leads",
          type: "error",
          center: true,
        });
      }
    },
    onSave(remainderDetails) {
      this.allLeadsList[this.leadIndex].reminder_details = remainderDetails;
      console.log(
        "this.allLeadsList[this.leadIndex]: ",
        this.allLeadsList[this.leadIndex]
      );
      this.showCreateDrawer = false;
    },
    onSetReminder(val, index) {
      this.setKey++;
      this.leadIndex = index;
      console.log("this.leadIndex", this.leadIndex);
      this.activeLead = val;
      this.showCreateDrawer = true;
    },
    async fetchAllLeads() {
      try {
        this.isLoading = true;
        this.isSearchingLeads = false;
        const response = await API.LEADS.FETCH_ALL_LEADS();
        //--------- we dont to use Lead API's results if we searched somehting
        if (this.isSearchingLeads) {
          return;
        }
        //---------------------------------------------------------------------//
        this.assignAPIResponse(response);
        this.isLoading = false;
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message:
            "There was an unknown error while fetching lead information.",
          type: "error",
          center: true,
        });
      }
    },
    assignAPIResponse(response) {
      this.nextUrl = response.data.next;
      this.prevUrl = response.data.previous;
      let resultTableData = response.data.results;

      for (let obj of resultTableData) {
        // let tempLeadObject = {};
        // let obj = resultTableData[key];
        // tempLeadObject["id"] = obj.id;
        // tempLeadObject["leadName"] = obj?.lead_details?.name || "";
        // tempLeadObject["projectType"] = obj.project_type || "";
        // tempLeadObject["owner"] = obj?.lead_details?.owner || '-';
        // tempLeadObject["deal_value"] = obj?.lead_details?.deal_value || '-';
        // tempLeadObject["last_contacted"] = obj?.lead_details?.last_contacted || '-';

        // let curDate = obj?.lead_details?.created_at.split("T")[0];
        // curDate = new Date(curDate);
        // curDate = curDate.toDateString();
        // let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
        // let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
        // let dt = `${curDate[8]}${curDate[9]}`;
        // let modifiedDate = `${dt} ${month} ${year}`;
        // tempLeadObject["date"] = modifiedDate;

        // tempLeadObject['stage'] = obj?.lead_details?.stage;

        obj.lead_details.originalStage = obj.lead_details.stage;

        this.allLeadsList.push(obj);
        console.log(this.allLeadsList);
      }
    },
    async loadMoreLeadsHelper() {
      try {
        const response = await API.PROJECTS.LOAD_MORE_PROJECTS(this.nextUrl);
        this.assignAPIResponse(response);
        this.busy = false;
      } catch (error) {
        console.error();
      }
    },

    loadMoreLeads() {
      if (this.nextUrl !== null) {
        this.busy = true;
        this.loadMoreLeadsHelper();
      }
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
        this.fetchAllLeads();
      }
    },
    async searchAllLeadsHelper(query) {
      try {
        this.isSearchedLeadEmpty = true;
        this.isLoading = true;
        this.isSearchingLeads = true;
        const response = await API.LEADS.SEARCH_ALL_LEADS(query);
        this.allLeadsList = [];
        this.assignAPIResponse(response);
        this.isLoading = false;

        if (this.allLeadsList.lenght > 0) this.isSearchedLeadEmpty = false;
      } catch (error) {
        console.error(error);
      }
    },
    // TODO: Update this once reminder is available in the response
    reminderTimeText(lead) {
      let timeString = lead?.reminder_details?.reminder_sent_at;
      if (!timeString) {
        return "Unknown";
      }
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const isUsUser = user.isUSFlagEnabled;

      const dateTime =
        formatDateTime(timeString, "Date Dash", isUsUser) +
        " | " +
        formatDateTime(timeString, "Short Time", isUsUser);
      return dateTime;
      // let date = DateTime.fromISO(timeString);
      // let finalString = date.toFormat("dd-LL-yyyy | h:mm a");
      // return finalString;
    },
    textInitial(text) {
      if (text) {
        return text?.[0]?.toUpperCase();
      }
    },
    openLeadDrawer(lead, index, event) {
      let eventTarget = event.target;
      let ignoreClass = ".site-survey-button";
      let parent = eventTarget.closest(ignoreClass);
      if (parent) {
        return;
      }

      if (!this.showCreateDrawer) {
        this.drawer = true;
        this.activeLead = lead;
        this.currentRowNumber = index;
      }
    },
    addNoteClick(event, lead, index) {
      event.stopPropagation();
      this.openLeadDrawer(lead, index, event);
      this.focusOnAddNote = true;
    },
    async changeLeadStage(lead) {
      try {
        await API.LEADS.UPDATE_LEAD(lead.lead_details.id, lead.id, {
          stage: lead.lead_details.stage,
        });
        lead.lead_details.originalStage = lead.lead_details.stage;
      } catch (err) {
        console.error(err);
        this.$message({
          showClose: true,
          message: "There was an error while updating the stage.",
          type: "error",
          center: true,
        });

        lead.lead_details.stage = lead.lead_details.originalStage;
      }
    },
    convertDateFormat(dateString) {
      let date = new Date(dateString);
      let curDate = date.toDateString();
      let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
      let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
      let dt = `${curDate[8]}${curDate[9]}`;
      let modifiedDate = `${dt} ${month} ${year}`;
      return modifiedDate;
    },
    isIndianLocationOrAccount(lead) {
      // If location is indian then follow indian format and if location is not added, the if country code is 91 then indian format
      if (lead?.country?.country_code == "IN") {
        return true;
      } else if (!lead.country) {
        let countryCode = JSON.parse(
          localStorage.getItem("organisation")
        ).country;
        if (countryCode == 91) return true;
      }
      return false;
    },
    currencySymbol(lead) {
      if (lead?.country?.country_code)
        return currencySymbolNameMap[lead?.country?.currency_code];
      // when no address is selected
      else {
        if (this.isUSFlagEnabled) return "$";
        else return "₹";
      }
    },
    onClickTasks() {
      this.activeTab = "second";
    },
    updateOwnerInCurrentRow(selectedOwnerObj, rowNumber) {
      if (typeof selectedOwnerObj == "object") {
        this.allLeadsList[rowNumber].lead_details.owner =
          selectedOwnerObj.first_name + " " + selectedOwnerObj.last_name;
      } else {
        this.allLeadsList[rowNumber].lead_details.owner = selectedOwnerObj;
      }
    },
    updateStageInCurrentRow(stage, rowNumber) {
      this.allLeadsList[rowNumber].lead_details.stage = stage;
    },
    updateLeadSourceInCurrentRow(leadSource, rowNumber) {
      this.allLeadsList[rowNumber].lead_details.lead_source = leadSource;
    },
    updateTagsInCurrentRow(allTags, rowNumber) {
      this.allLeadsList[rowNumber].tags = [...allTags];
    },
    generateColorFromName,
    formatNumberWithCommas,
  },
};
</script>

<style scoped>
.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.assignmentIcon.disabled {
  filter: grayscale(100%);
}

p,
span,
h1,
h2,
h3 {
  word-break: break-word;
}

.tableContainer {
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 16px;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  overflow-x: scroll;
  margin-top: 24px;
}

.parentBodyContainer {
  height: calc(100vh - 340px);
  overflow: hidden;
  overflow-y: scroll;
  width: fit-content;
}

.tableHeader {
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
}

.tableHeader,
.bodyContainer {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 8px;
  border-bottom: 1px solid #ccc;
  width: fit-content;
  transition: 0.2s;
}

.bodyContainer:hover {
  background-color: rgb(245, 245, 245);
}

.bodyContainer {
  height: auto;
  width: fit-content;
  cursor: pointer;
}

.headerTitle {
  font-size: 16px;
  font-weight: 600;
  padding-left: 16px;
  padding-right: 16px;
  color: #1c3366;
  height: 60px;
  display: flex;
  align-items: center;
}

.leadFlex,
.leadIcons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.leadIcons {
  gap: 16px;
}

/* .leadIcons *:hover {
    background: rgb(240, 240, 240);
} */

.el-tooltip__popper >>> .tooltipClass {
  padding: 4px;
}

.tooltipCommon {
  position: relative;
}

.tooltipContainer {
  width: max-content;
  background-color: #fff;
  position: absolute;
  z-index: 100;
  bottom: 30px;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  display: none;
}

.tooltipText {
  font-size: 12px;
  color: #222;
}

.tooltipCommon:hover .tooltipContainer {
  display: inherit;
}

.leadFlex {
  width: 100%;
  padding: 12px 0px;
}

.leadDetcolumn {
  display: grid;
  gap: 8px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  max-width: 280px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.time {
  font-size: 12px;
  font-weight: 600;
  color: #777;
  display: flex;
  gap: 8px;
}

.time::before {
  content: "";
  background: url("./assets/Vector.svg");
  width: 13.5px;
  height: 13.5px;
  display: block;
}

.remainder {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  display: flex;
  gap: 8px;
  cursor: pointer;
  width: fit-content;
}

.remainder:hover {
  background: rgb(230, 230, 230);
}

.remainder::before {
  content: "";
  background: url("./assets/event.svg");
  width: 12.3px;
  height: 14px;
  display: block;
}

.leadDet,
.leadDetBody {
  width: 390px;
  height: 100%;
  border-right: 1px solid #ccc;
}

.stage,
.stageBody {
  width: 160px;
  height: 100%;
  border-right: 1px solid #ccc;
}

.stageBody,
.stage {
  width: 169px;
}

.owner,
.ownerBody,
.type,
.typeBody {
  width: 200px;
  height: 100%;
  border-right: 1px solid #ccc;
}

.latestNote,
.latestNoteBody {
  width: 240px;
  height: 100%;
  border-right: 1px solid #ccc;
}

.createdOn,
.createdOnBody,
.dealVal,
.dealValBody,
.sysSize,
.sysSizeBody,
.lastCont,
.lastContBody {
  width: 175px;
  border-right: 1px solid #ccc;
  height: 100%;
}

.lastCont,
.lastContBody {
  height: 100%;
}

.typeBody,
.type,
.dealVal,
.dealValBody,
.sysSize,
.sysSizeBody,
.createdOn,
.createdOnBody {
  width: 144px;
}

.bodyContent {
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  min-height: 68px;
}

.ownerN {
  display: grid;
  place-items: center;
  min-width: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1c3366;
  font-size: 16px;
  color: #fff;
  margin-right: 8px;
}

.createdOnLine,
.dealValLine,
.sysSizeLine,
.lastContLine,
.typeLine {
  font-size: 14px;
  color: #222;
  text-transform: capitalize;
}

.latestNoteLine {
  font-size: 14px;
  color: #222;
}
.sysSizeLine {
  text-transform: unset;
}

.ownerLine {
  font-size: 16px;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.latestNoteLine {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tableContainer >>> .el-select {
  width: 100%;
  max-width: 135px;
}

.tableContainer >>> .el-input__inner {
  border: none;
  background-color: #e8edf2;
  height: 34px;
  color: #222;
}

.tableContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  position: relative;
  top: -1px;
  transform: rotate(0deg);
}

.tableContainer >>> .el-select .el-input .el-select__caret.is-reverse {
  position: relative;
  top: 2px;
  transform: rotate(180deg);
}

.tableContainer >>> .el-icon-arrow-up:before {
  content: url("./assets/CaretDownFill.svg");
}

.tableContainer >>> .el-input__inner::placeholder {
  font-size: 14px;
  color: #222;
}

.infiniteScrollLoader {
  font-size: 20px;
}
</style>
