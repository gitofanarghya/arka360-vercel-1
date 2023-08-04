<template>
  <div class="container">
    <div class="navContainer" @click="handleCardSelect">
      <div class="gridContainer">
        <div class="firstContainer">
          <MenuView
            :menuItems="menuData"
            @statusCheckbox="statusCheckbox"
            @start-Date="startDateRange"
            @due-Date="dueDateRange"
            @priorityCheck="priorityCheck"
          />
          <div class="relativeCont">
            <el-select
              v-model="selectedTaskValue"
              placeholder="My Tasks"
              @change="handleSelect"
            >
              <el-option
                v-for="item in computedOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div
            style="margin-bottom: 30px"
            v-if="admin == 'ADMIN' || manager == true"
          >
            <AvatarHandler
              :avatars="avatars"
              :overlap="true"
              :imgWidth="35"
              :removable="true"
              :editable="false"
              :fontSize="'14px'"
              :hover="true"
            />
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
            <el-button
              type="primary"
              class="createLeadBtn"
              @click="handleShowOrHideDrawer"
              >Create Task</el-button
            >
            <GlobalDrawer
              :isOpen="showCreateDrawer"
              :title="createTaskHeading"
              :handleCloseDialog="handleShowOrHideDrawer"
              :drawer-size="550"
            >
              <template v-if="showCreateDrawer" v-slot:header>
                <TaskDrawerDynamic
                  :fieldsArray="returnFieldsForCreateTask()"
                  :reminderData.sync="reminderDetails"
                  @createTask="createTask"
                  :avatars="selectedAvatars"
                />
                <!-- @openSetReminder="handleOpenSetReminder" -->
              </template>
            </GlobalDrawer>
            <GlobalDrawer
              :isOpen="showSetReminderDrawer"
              :title="setReminderHeading"
              :handleCloseDialog="handleHideSetReminder"
              :drawer-size="360"
            >
              <template v-if="showCreateDrawer" v-slot:header>
                <!-- <SetReminderDrawer :reminderInfo="returnSetReminderData()" /> -->
              </template>
            </GlobalDrawer>
          </div>
        </div>
      </div>
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
            statusSources ||
            startDateClosure ||
            dueDateClosure ||
            priorityValue
          "
        >
          <div>
            <img src="./assets/filter_alt.svg" alt="alter" />
          </div>
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
              v-if="statusSources"
              class="tag"
              size="medium"
              closable
              @close="handleStatusremove()"
            >
              {{ statusSources.label }} : {{ statusSources.value }}
            </el-tag>
            <el-tag
              v-if="startDateClosure"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleRemovestartClosure()"
            >
              {{ startDateClosure.label }} :
              {{ formattedDate(startFrom, startTo) }}
            </el-tag>
            <el-tag
              v-if="dueDateClosure"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleRemoveEndClosure()"
            >
              {{ dueDateClosure.label }} : {{ formattedDate(dueFrom, dueTo) }}
            </el-tag>
            <el-tag
              v-if="priorityValue"
              class="tag"
              size="medium"
              closable
              :disable-transitions="false"
              @close="handleRemovePriority()"
            >
              {{ priorityValue.label }} : {{ priorityValue.value }}
            </el-tag>
          </div>
        </div>
        <p
          class="clrAll"
          v-if="
            selectedFilter.length > 0 ||
            statusSources ||
            startDateClosure ||
            dueDateClosure ||
            priorityValue ||
            selectedSort.length > 0
          "
          @click="handleClear"
        >
          Clear all
        </p>
      </div>
    </div>
    <div style="height: 60vh; margin-top: 10px">
      <KanbanView
        v-if="!isTableOptClicked"
        :kanBanColumns="kanbanColumnsData"
        :dataTable="kanbanDataValue"
        :selectedCard="selectedCard"
        :isLoading="isKanbanLoading"
        :page="'Tasks'"
        @updateDate="updateDate"
        :loadMoreData="loadMoreData"
        @handleColumnNumber="handleColumnNumber"
        :handleOrderClick="handleOnClick"
        :offSetHeight="'18.5rem'"
        @handlePriority="handlePriority"
        @updateStatus="updateStatus"
        @editableName="editableName"
      />
      <TableView
        :tableData="tableColumnData"
        @update="editableName"
        @updateStatus="updateTableStatus"
        @updatePriority="handleTablePriority"
        v-else
      />
      <!-- Commenting duplicate create task and set reminder -->
      <!-- <GlobalDrawer
        :isOpen="showCreateDrawer"
        :title="createTaskHeading"
        :handleCloseDialog="handleShowOrHideDrawer"
        :drawer-size="550"
      >
        <template v-if="showCreateDrawer" v-slot:header>
          <TaskDrawerDynamic
            :fieldsArray="returnFieldsForCreateTask()"
            @createTask="createTask"
            @openSetReminder="handleOpenSetReminder"
            :avatars="selectedAvatars"
          />
        </template>
      </GlobalDrawer>
      <GlobalDrawer
        :isOpen="showSetReminderDrawer"
        :title="setReminderHeading"
        :handleCloseDialog="handleHideSetReminder"
        :drawer-size="360"
      >
        <template v-if="showCreateDrawer" v-slot:header>
          <SetReminderDrawer :reminderInfo="returnSetReminderData()" />
        </template>
      </GlobalDrawer> -->
    </div>
  </div>
</template>
<script>
import TableView from "./tableView.vue";
import KanbanView from "../../../components/ui/kanban/components/kanbanView.vue";
import MenuView from "../../designOrders/components/header/menuView.vue";
import LeadsDrawer from "../../leadManagement/components/leadsDrawer.vue";
import GlobalDrawer from "../../commonComponents/allDrawer/globalDrawer.vue";
import TaskDrawerDynamic from "./taskDrawerDynamic.vue";
import SetReminderDrawer from "./setReminderDrawer.vue";
import kanbanActive from "./assets/kanbanActive.svg";
import kanbanNotActive from "./assets/kanbanNotActive.svg";
import tableActive from "./assets/tableActive.svg";
import tableNotactive from "./assets/tableNotactive.svg";
import API from "@/services/api";
import { getUiFromStorage, setUiInStorage } from "../../../utils";
import AvatarHandler from "../../dashboardCRM/avatars/AvatarHandler.vue";
export default {
  data() {
    return {
      reminderDetails: {},
      homeOwnerResponse: {},
      priorityValue: "",
      priority: "",
      selectedTaskValue: JSON.parse(localStorage.getItem("ui")).taskManagement
        ? JSON.parse(localStorage.getItem("ui")).taskManagement.viewTask
        : "",
      showCreateDrawer: false,
      showSetReminderDrawer: false,
      createTaskHeading: "Create Task",
      setReminderHeading: "Set Reminder",
      selectedCard: false,
      isSearchedLeadEmpty: false,
      searchVal: "",
      status: "",
      startDateClosure: "",
      dueDateClosure: "",
      statusSeperator: "",
      statusSources: "",
      search: "",
      startDate: [],
      startFrom: "",
      sortStrings: "",
      filtersString: "",
      startTo: "",
      selectedSort: [],
      isKanbanLoading: true,
      tableColumnData: [],
      selectedFilter: [],
      dueDate: [],
      allLeads: [],
      dueFrom: "",
      dueTo: "",
      kanbanActiveIcon: kanbanActive,
      kanbanNotActiveIcon: kanbanNotActive,
      tableActiveIcon: tableActive,
      tableNotactiveIcon: tableNotactive,
      getAPIData: [],
      datePicker: "false",
      isTableOptClicked: false,
      taskValue: {},
      selectedAvatars: [],
      isAdmin: true,
      manager: JSON.parse(localStorage.getItem("user")).is_manager,
      admin: JSON.parse(localStorage.getItem("user")).role,
      avatars: [
        { id: 1, name: "Kaarn Kaarn" },
        { id: 2, name: "Charan M1231" },
        { id: 3, name: "Qdasdsa Adasdasd" },
        { id: 4, name: "Adasd Adsad" },
        { id: 5, name: "Cdasdsaads Bsaddsa" },
        { id: 6, name: "Sasdsadsda Sdasdsadas" },
        { id: 7, name: "Ussssss Asdadsa" },
      ],
      options: [
        {
          value: "my",
          label: "My Tasks",
        },
        {
          value: "collaborated",
          label: "Collaborations",
        },
      ],
      value: "",
      kanbanColumnsData: [
        {
          label: "to_be_scheduled",
          value: "To Be Scheduled",
        },
        {
          label: "due_today",
          value: "Due Today",
        },
        {
          label: "overdue",
          value: "Overdue",
        },
        {
          label: "due_this_week",
          value: "Due This Week",
        },
        {
          label: "due_later",
          value: "Due Later",
        },
        {
          label: "completed",
          value: "Completed",
        },
        {
          label: "archived",
          value: "Archived",
        },
      ],
      kanbanData: [],
    };
  },
  components: {
    MenuView,
    KanbanView,
    LeadsDrawer,
    AvatarHandler,
    GlobalDrawer,
    TaskDrawerDynamic,
    SetReminderDrawer,
    TableView,
  },
  watch: {
    selectedSort(val) {
      console.log(val);
      this.sortStrings = val;
      console.log(this.sortStrings);
      this.getData();
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
      console.log(reqObj);
      this.filtersString = reqObj;
      this.getData();
    },
    search(val) {
      this.searchAllLeads(val);
      // this.searchVal = val;
      console.log(val);
      // if (!this.isTableOptClicked) {
      //   this.getKanbanData();
      // }
    },
  },
  // created() {
  //     this.kanbanColumnsData.forEach((dt, index) => {
  //         let newData = {
  //             sequence: index,
  //             tasks: this.getTasks(dt),
  //             title: dt,
  //         };
  //         console.log(newData)
  //         this.kanbanData.push(newData)
  //     })
  //     console.log(this.kanbanData)
  // },
  methods: {
    handleColumnNumber(column) {
      console.log(column);
      console.log(this.kanbanDataValue);
      const newData = this.loadMoreData(column);
      console.log(newData);
    },
    async loadMoreData(col) {
      console.log(col);
      const response = await API.DESIGN_ORDERS.LOAD_MORE_Leads(col.next);
      this.kanbanData.map((dt) => {
        if (dt.title === col.title) {
          dt.tasks.push(...response.data.results);
          dt.next = response.data.next;
        }
      });
    },
    handleShowOrHideDrawer() {
      this.showCreateDrawer = !this.showCreateDrawer;
    },
    handleOpenSetReminder() {
      this.showSetReminderDrawer = true;
    },
    handleHideSetReminder() {
      this.showSetReminderDrawer = false;
      //get the reminder date and time and pass to the taskDrawerDynamic
      //by setting this.reminderDetails to the value returned by setReminder
      this.reminderDetails = {
        reminder_sent_at: "2023-07-05T11:32:04.000Z",
        notes: "",
      };
      //console.log(this.reminderDetails);
    },
    returnSetReminderData() {
      return {
        date: "",
        time: "",
        notes: "",
      };
    },
    createTask(data) {
      console.log(data);
      this.createTaskData(data);
    },
    async createTaskData(taskObj) {
      console.log("create task call");
      let responseTask = await API.TASKS.CREATE_TASK(taskObj);
      console.log(responseTask);
    },
    async getMoreLeadsData(nextURL) {
      let { data } = await API.TASKS.LOAD_MORE_LEADS(nextURL);
      console.log(data);
      return { ...data };
    },
    returnFieldsForCreateTask() {
      return [
        {
          title: "taskName",
          label: "",
          placeholder: "Task Name",
          type: "longText",
        },
        {
          title: "assignee",
          label: "Assign To",
          placeholder: "Assignee name",
          type: "iconDropdownIcon",
          leftIcon: "/src/pages/taskManagement/components/assets/Person.svg",
          rightIcon: "/src/pages/taskManagement/components/assets/close.svg",
          isFilterable: true,
          clicked: false,
          options: [
            { id: 1, label: "Alexander" },
            { id: 2, label: "Nathaniel" },
            { id: 3, label: "Patrick" },
            { id: 4, label: "Richard" },
            { id: 5, label: "Victoria" },
          ],
        },
        {
          title: "startDate",
          label: "Start Date",
          placeholder: "Select a date",
          type: "date",
        },
        {
          title: "dueDate",
          label: "Due Date",
          placeholder: "Select a date",
          type: "date",
        },
        {
          title: "priority",
          label: "Priority",
          placeholder: null,
          type: "toggleIcon",
          iconTextDefault: "Default",
          iconTextChecked: "Urgent",
          defaultIcon:
            "/src/pages/taskManagement/components/assets/Priority.svg",
          checkedIcon:
            "/src/pages/taskManagement/components/assets/FlagFill.svg",
          currentIcon:
            "/src/pages/taskManagement/components/assets/Priority.svg",
        },
        {
          title: "setReminder",
          label: "Reminder",
          placeholder: "Set Reminder",
          type: "iconText",
          leftIcon:
            "/src/pages/taskManagement/components/assets/CalendarEvent.svg",
          handleOnClick: () => {
            console.log("open set reminder drawer");
            this.handleOpenSetReminder();
          },
        },
        {
          title: "status",
          label: "Status",
          placeholder: "Select a status",
          type: "dropdown",
          options: [
            { id: "new", label: "New" },
            { id: "in_progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
            //{ id: "overdue", label: "Overdue" },
          ],
        },
        {
          title: "homeOwner",
          label: "Homeowner",
          placeholder: "Enter a homeowner",
          type: "dropdownInfinite",
          isFilterable: true,
          nextURL: this.homeOwnerResponse.next,
          // options: [
          //   { id: 1260, label: "Alexander" },
          //   { id: 1261, label: "David" },
          //   { id: 1262, label: "Isabella" },
          //   { id: 1263, label: "James" },
          //   { id: 1264, label: "Margaret" },
          //   { id: 1265, label: "Elizabeth" },
          // ],
          options: [...this.homeOwnerResponse.results],
          handleGetMoreOptions: (nextURL) => {
            console.log("make API call and return data");
            const nextResponse = this.getMoreLeadsData(nextURL);
            console.log(nextResponse);
            return nextResponse;
          },
        },
        {
          title: "leadStage",
          label: "Lead Stage",
          placeholder: "Select a stage",
          type: "dropdown",
          options: [
            { id: "Lead", label: "Lead" },
            { id: "Appointment", label: "Appointment" },
            { id: "Proposal", label: "Proposal" },
            { id: "Negotiation/Open", label: "Negotiation/Open" },
            { id: "Closed/Won", label: "Closed/Won" },
            { id: "Closed/Lost", label: "Closed/Lost" },
            { id: "Overdue", label: "Overdue" },
          ],
        },
        {
          title: "collaborators",
          label: "Collaborators",
          avatars: this.selectedAvatars,
          selectionAvatars: this.avatars,
          placeholder: "Enter a homeowner",
          type: "collaborators",
          isMultiple: true,
          isFilterable: true,
          options: [
            { id: 1, label: "Alexander" },
            { id: 2, label: "Nathaniel" },
            { id: 3, label: "Patrick" },
            { id: 4, label: "Richard" },
            { id: 5, label: "Victoria" },
          ],
        },
        {
          title: "location",
          label: "Location",
          type: "mapText",
          //location is a display field
          //its value will changed based on the homeowner
          //selection which is the lead id
        },
        {
          title: "description",
          label: "Description",
          placeholder: "what is this task about?",
          type: "largeText",
        },
      ];
    },
    handleCardSelect() {
      console.log("data");
      this.selectedCard = !this.selectedCard;
    },
    async getData() {
      let kanbanColumns = this.kanbanColumnsData;
      let reqobj = "";
      let tableData = "";
      let ui = getUiFromStorage();

      kanbanColumns.forEach(async (dt, index) => {
        reqobj = `stage=${dt.label}&view=kanban&order_by=${
          this.sortStrings
            ? this.sortStrings[2] % 2 == 0
              ? "desc"
              : "asc"
            : ""
        }&sort_by=${this.sortStrings ? this.sortStrings[1] : ""}&status=${
          this.statusSeperator
        }&priority=${this.priority}&start_date_before=${
          this.startTo
        }&start_date_after=${this.startFrom}&due_date_before=${
          this.dueTo
        }&due_date_after=${this.dueFrom}&tasks=${ui.taskManagement.viewTask}`;
        if (this.filtersString) {
          console.log(this.filtersString);
          reqobj += `&${this.filtersString}`;
        }
        if (this.searchVal) {
          reqobj += `&query=${this.searchVal}`;
        }
        let result = await API.TASKS.FETCH_TASK_LIST(reqobj);
        console.log(result);
        let dataValue = result?.data.results;
        let count = result?.data.count || 0;

        let newData = {
          sequence: index,
          count: count,
          title: dt.value,
          tasks: dataValue.length > 0 ? dataValue : [],
          next: result ? result.data.next : "",
          previous: result ? result.data.previous : "",
        };
        console.log(index);
        console.log(newData);
        this.kanbanData.push(newData);
      });
      tableData = `order_by=${
        this.sortStrings ? (this.sortStrings[2] % 2 == 0 ? "desc" : "asc") : ""
      }&sort_by=${this.sortStrings ? this.sortStrings[1] : ""}&status=${
        this.statusSeperator
      }&priority=${this.priority}&start_date_before=${
        this.startTo
      }&start_date_after=${this.startFrom}&due_date_before=${
        this.dueTo
      }&due_date_after=${this.dueFrom}&tasks=${ui.taskManagement.viewTask}`;

      const { data } = await API.TASKS.FETCH_TASK_LIST(tableData);
      data.results.map((item) => {
        item.dueDate = this.formatDate(item.due_by.split("T")[0]);
        item.location = item.lead_details.address;
        item.homeOwner = item.lead_details.name;
        item.assignees = item.assigned_to !== " " ? item.assigned_to : "N/A";
        item.flag = false;
        item.status = item.status ? item.status : "Select";
        item.showInput = false;
        item.showDropdown = false;
        item.statusOption = [
          {
            id: 1,
            value: "in_progress",
            label: "In-Progress",
          },
          {
            id: 2,
            value: "completed",
            label: "Completed",
          },
        ];
      });

      this.tableColumnData = data.results;
      console.log(this.tableColumnData);
      this.isKanbanLoading = false;
    },

    formatDate(inputDate) {
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const formattedDate = `${day} ${month}, ${year}`;

      return formattedDate;
    },

    async patchData(id, data) {
      const formData = new FormData();
      data.map((i) =>
        formData.append(
          i.isArray ? i.propertyName + "[]" : i.propertyName,
          i.value
        )
      );
      let result = await API.TASKS.UPDATE_TASK_LIST(id, formData);
      console.log(result);
      this.getData();
    },
    handleSelect() {
      let ui = getUiFromStorage();
      ui.taskManagement.viewTask = this.selectedTaskValue;
      setUiInStorage(ui);
      console.log(ui.taskManagement.viewTask);
      this.getData();
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
        this.getData();
      }
    },
    async searchAllLeadsHelper(query) {
      try {
        this.isSearchedLeadEmpty = true;
        // this.isLoading = true;
        this.isSearchingLeads = true;
        this.searchVal = query;
        this.getData();
        const response = await API.LEADS.SEARCH_ALL_TASK_KANBAN(query, "all");
        console.log(response);
        // this.allLeadsList = [];
        // this.assignAPIResponse(response);
        // this.isLoading = false;

        // if (this.allLeadsList.lenght > 0) this.isSearchedLeadEmpty = false;
      } catch (error) {
        console.error(error);
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
    handleRemoveFilter(item) {
      console.log(item);
      console.log(this.selectedFilter);
      this.selectedFilter = this.selectedFilter.filter((e) => {
        if (e !== item) return e;
      });
      console.log(this.selectedFilter);
    },
    handleDisplayFilters(data) {
      console.log(data);
      const FilterData = this.menuData.find((d) => d.title === "Filter");
      console.log(FilterData);

      if (FilterData) {
        const FilterOptions = FilterData.options;
        console.log(FilterOptions);
        const options = FilterOptions.find((f) => f.label === data[1]);
        console.log(options);
        return options.value;
      }
    },
    handleRemoveSort() {
      this.selectedSort = "";
      this.sortStrings = "";
    },
    handleStatusremove() {
      this.statusSeperator = "";
      this.statusSources = "";
      this.getData();
    },
    handleRemovestartClosure() {
      this.startDateClosure = "";
      this.startFrom = "";
      this.startTo = "";
      this.startDate = "";
      this.getData();
    },
    handleRemoveEndClosure() {
      this.dueDateClosure = "";
      this.dueFrom = "";
      this.dueTo = "";
      this.dueDate = "";
      this.getData();
    },
    handleRemovePriority() {
      this.priority = "";
      this.priorityValue = "";
      this.getData();
    },
    handleClear() {
      this.priority = "";
      this.priorityValue = "";
      this.selectedFilter = [];
      this.selectedSort = "";
      this.startDateClosure = "";
      this.startFrom = "";
      this.startTo = "";
      this.startDate = "";
      this.dueDateClosure = "";
      this.dueFrom = "";
      this.dueTo = "";
      this.dueDate = "";
      this.sortStrings = "";
      this.statusSeperator = "";
      this.statusSources = "";
    },
    statusCheckbox(value) {
      console.log(value);
      this.statusSeperator = value.join(",");
      this.status = value[0];
      let data = value ? { label: "Status", value: value.join(",") } : "";
      this.statusSources = data;
      this.getData();
    },
    priorityCheck(value) {
      console.log(value);
      this.priority = value;
      let data = value ? { label: "Priority", value: value } : "";
      this.priorityValue = data;
      this.getData();
    },
    startDateRange(value) {
      console.log(value);
      this.startDate = value;
      this.startFrom = value[0].toISOString();
      this.startTo = value[1].toISOString();
      let data = value
        ? {
            label: "Start Date",
            value: value,
          }
        : "";
      this.startDateClosure = data;
      this.getData();
    },
    dueDateRange(value) {
      console.log(value);
      this.dueDate = value;
      this.dueFrom = value[0].toISOString();
      this.dueTo = value[1].toISOString();
      let data = value
        ? {
            label: "Due Date",
            value: value,
          }
        : "";
      this.dueDateClosure = data;
      this.getData();
    },
    updateDate(value) {
      console.log(value);
      const { id } = value;
      this.patchData(id, [
        {
          propertyName: "due_by",
          value: value.due_by,
          isArray: false,
        },
      ]);
    },
    handlePriority(value) {
      console.log(value);
      value.priority = value.priority == "default" ? "high" : "default";
      console.log(value.priority);
      const { id } = value;
      this.patchData(id, [
        {
          propertyName: "priority",
          value: value.priority,
          isArray: false,
        },
      ]);
    },

    handleTablePriority(value) {
      const { id } = value;
      const { priority } = value;
      this.patchData(id, [
        {
          propertyName: "priority",
          value: priority,
          isArray: false,
        },
      ]);
    },

    updateStatus(value) {
      console.log(value.status);
      value.status = value.status == "completed" ? "in_progress" : "completed";
      // value.is_completed=value.is_completed==false ? true: false
      console.log(value.status);
      const { id } = value;
      this.patchData(id, [
        {
          propertyName: "status",
          value: value.status,
          isArray: false,
        },
      ]);
    },

    updateTableStatus(value) {
      const { id } = value;
      this.patchData(id, [
        {
          propertyName: "status",
          value: value.status,
          isArray: false,
        },
      ]);
    },

    editableName(value) {
      console.log(value);
      const { id } = value;
      this.patchData(id, [
        {
          propertyName: "name",
          value: value.name,
          isArray: false,
        },
      ]);
    },
    getTasks(dt) {
      console.log(dt);
      let task = this.columns.filter((e) => e.title === dt);
      console.log(task);
      return task[0].tasks;
    },
    handleCreate() {
      console.log("Callling");
    },
    handleOnClick(data) {
      console.log(data);
      this.taskValue = data;
      //open task drawer and pass the task value
      this.showCreateDrawer = true;
    },
    setLeadListingView(isTable) {
      this.isTableOptClicked = isTable;
    },
    formattedDate(start, end) {
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

      const date = new Date(start);
      const day = date.getDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const month = months[monthIndex];

      const enddate = new Date(end);
      const endday = enddate.getDate();
      const endmonthIndex = enddate.getMonth();
      const endyear = date.getFullYear();
      const endmonth = months[endmonthIndex];

      return `${day} ${month} ${year} - ${endday} ${endmonth} ${endyear}`;
    },
    async getAllLeads() {
      try {
        const response = await API.TASKS.FETCH_ALL_LEAD_LIST();
        const allLead = response.data.results;
        this.homeOwnerResponse = response.data;
        //console.log("rk test mount", this.homeOwnerResponse);
        allLead?.map((t) => {
          t.label = t.name;
          t.value = t.id;
          t.location = t.address;
        });
        this.allLeads = allLead ? allLead : [];
        //console.log("RK lead check", this.allLeads);
        console.log(allLead);
      } catch (e) {
        this.$message({
          showClose: true,
          message: "There was an unknown error while fetching the tags",
          type: "error",
          center: true,
        });
      }
    },
  },
  async mounted() {
    this.getData();
    //something was wrong with this so commenting
    //this.getTableData();
    this.getAllLeads();
    console.log(this.tableColumnData);
  },
  computed: {
    computedOptions() {
      const options = [
        {
          value: "my",
          label: "My Tasks",
        },
        {
          value: "collaborated",
          label: "Collaborations",
        },
      ];

      //   if (this.admin=='ADMIN') {
      //     options.unshift({
      //       value: 'all',
      //       label: 'All Task'
      //     });
      //   }
      if (this.admin == "ADMIN") {
        options.unshift({
          value: "team",
          label: "My Teams Tasks",
        });
      }

      return options;
    },
    kanbanDataValue() {
      console.log(this.kanbanData);
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
              value: "Task Name",
              label: "task_name",
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
              value: "Status",
              label: "status",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 3,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 4,
                },
              ],
            },
            {
              value: "Priority",
              label: "priority",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 5,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 6,
                },
              ],
            },
            {
              value: "Due Date",
              label: "due_date",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 7,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 8,
                },
              ],
            },
            {
              value: "Start Date",
              label: "start_date",
              subOptions: [
                {
                  value: "Ascending",
                  label: "asc",
                  index: 9,
                },
                {
                  value: "Descending",
                  label: "desc",
                  index: 10,
                },
              ],
            },
            {
              value: "Project Name",
              label: "project_name",
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
              value: "Stage",
              label: "stage",
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
              value: "Status",
              label: "status",
              type: "checkbox",
              subOptions: [
                {
                  value: "New",
                  label: "new",
                },
                // {
                //     value: "Overdue",
                //     label: "overdue",
                // },
                {
                  value: "In Progress",
                  label: "in_progress",
                },
                {
                  value: "Completed",
                  label: "completed",
                },
              ],
            },
            {
              value: "Priority",
              label: "priority",
              type: "radio",
              subOptions: [
                {
                  value: "Default",
                  label: "default",
                },

                {
                  value: "Urgent",
                  label: "high",
                },
              ],
            },
            {
              value: "Due Date",
              label: "due_by",
              type: "date",
            },
            {
              value: "Start Date",
              label: "started_on",
              type: "date",
            },
            // {
            //     value: "Involvement",
            //     label: "involvement",
            //     type: "text",
            //     subOptions: [
            //         {
            //             value: "Assignee",
            //             label: "assignee",

            //         },
            //         {
            //             value: "Collaborator",
            //             label: "collaborator",

            //         },
            //     ],
            // },
            {
              value: "Collaborators",
              label: "collaborator",
              type: "collaborators",
            },
            {
              value: "Homeowners",
              label: "homeowners",
              type: "homeowner",
              subOptions: this.allLeads,
            },
          ],
          expected_closure: "",
        },
      ];
      return menuItems;
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
  margin-left: 30px;
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
