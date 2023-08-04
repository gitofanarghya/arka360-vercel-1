<template>
  <div @click="handleCardSelect">
    <DesignOrdersPage
      :title="`Design Orders`"
      :togglebtn1="'Kanban'"
      :togglebtn2="'Grid'"
      @toggle="toggleView"
      :active="active"
      @filterView="getFilter"
      @selected-column="handleColumnType"
      @handlefilterView="handlefilterView"
      @removeFilter="removeFilter"
      @sortView="sortView"
      @removeSort="removeSort"
      @customDate="customDate"
      @customDueDate="customDueDate"
      @columnType="columnType"
      @search="handleSearch"
      @refresh="handleRefresh"
    >
      <template v-slot:children>
        <!-- content for the Page  slot -->
        <!-- <PageHeading
          :active="active"
          @toggle-view="toggleView"
          :title="title"
          :togglebtn1="'Kanban'"
          :togglebtn2="'Map'"
        /> -->
        <!-- <all-drawer
          :drawer="drawer"
          :propsData="{
            order: order,
            users: users,
            orderDetailsPopVisible: orderDetailsPopVisible,
            orderStatusOptions: orderStatusOptions,
            handleOrderUpdate: handleOrderUpdate,
            drawer: drawer,
          }"
          @save="drawer = false"
          :componentName="'dialogSection'"
          :drawerSize="700"
          @close="drawer = false"
        /> -->
        <GlobalDrawer
          :isOpen="drawer"
          :title="''"
          :handleCloseDialog="handleClose"
        >
          <template v-slot:body>
            <DialogSection
              :propsData="{
                order: order,
                users: users,
                orderDetailsPopVisible: orderDetailsPopVisible,
                orderStatusOptions: orderStatusOptions,
                handleOrderUpdate: handleOrderUpdate,

                drawer: drawer,
              }"
              @save="drawer = false"
              :drawerSize="700"
              @close="drawer = false"
              @update-card="handleCardUpdate"
              @update-card-column="handleCardColumns"
            />
          </template>
        </GlobalDrawer>

        <!-- <DesignOrdersPopUp
          :orderDetailsPopVisible.sync="orderDetailsPopVisible"
          :order="order"
          :users="users"
          :dialogUpdates.sync="dialogUpdates"
        /> -->
        <!-- <FilterData
          @filter-value="filter"
          @filter-start-date="startdate"
          @filter-end-date="enddate"
          @current-user="currentUser"
        /> -->
        <div
          v-if="active === false"
          v-loading="designOrdersData.length > 0 ? false : true"
          style="height: 60vh"
        >
          <!-- RKChange2 emitted events -->
          <ListViewTable
            :tableColumns="headTable"
            :tableData="designOrdersData"
            :getCellStyles="getCellStyles"
            :handleRowClick="handleOrderClick"
            :order.sync="order"
            :loadMoreLeadData="loadMoreLeadData"
            :tableHeightOffset="'17rem'"
          >
            <template v-slot:actions>
              <div class="icon">
                <span @click.stop="doSome" id="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-pencil-square"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                    />
                  </svg>
                </span>

                <span @click.stop="doSome" id="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-person-badge"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                    />
                    <path
                      d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0h-7zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492V2.5z"
                    />
                  </svg>
                </span>
              </div>
            </template>
          </ListViewTable>
          <!-- <DesignOrdersTableView
            :containerHeight="containerHeight"
            :headers="headTable"
            :data="designOrdersData"
            :handleOrderClick="handleOrderClick"
            :order.sync="order"
            @onDesign="handleDesign"
            @onViewSurvey="handleViewSurvey"
            :buttonsData="buttonsData"
          /> -->
        </div>
        <div
          v-else
          v-loading="kanbanDataValue.length > 0 ? false : true"
          style="height: 60vh"
        >
          <KanbanView
            :kanBanColumns="kanbanColumns"
            :dataTable="kanbanDataValue"
            :buttonsData="buttonsData"
            :handleOrderClick="handleOrderClick"
            @handleChange="handleChange"
            :order.sync="order"
            :page="'Orders'"
            :getHeaderTitle="() => 'void'"
            :columnType="'order_status'"
            :loadMoreData="loadMoreData"
            :selectedColumnType="selectedColumnType"
            :offSetHeight="'20.1rem'"
            :selectedCard="selectedCard"
            @handleColumnNumber="handleColumnNumber"
          />
          <!-- <KanbanView v-else :dataTable="dataTable" /> -->

          <!-- RKChange3 emitted events -->
          <!-- <DesignOrders
            v-if="dataTable.length"
            :containerHeight="containerHeight"
            :dataTable="designOrdersData"
            :buttonsData="buttonsData"
            :handleOrderClick="handleOrderClick"
            :order.sync="order"
            @handleDesign="handleDesign"
            @viewSurveyEvent="handleViewSurvey"
            :page="'Lead'"
          />
          <DesignOrders v-else :dataTable="dataTable" /> -->
        </div>
      </template>
    </DesignOrdersPage>
  </div>
</template>

<script>
import DesignOrdersTableView from "./designOrdersTableView.vue";
import ListViewTable from "./ListViewTable.vue";
import DesignOrders from "./kanbanView.vue";
import KanbanView from "../../../components/ui/kanban/components/kanbanView.vue";
import API from "@/services/api/";
// import PageHeading from "./pageHeading.vue";
import Navbar from "../../../components/ui/newNavbar.vue";
import Sidebar from "../../../components/ui/sidebar.vue";
import DesignOrdersPage from "./designOrdersPage.vue";
import FilterData from "./FilterData.vue";
import DesignOrdersPopUp from "./designOrderinfoPopUp.vue";
import {
  SITE_SURVEY_LINK,
  BASE_URL_FOR_REPORT_IMAGES,
} from "../../../constants";
import { DateTime } from "luxon";
import LeadsDrawer from "../../leadManagement/components/leadsDrawer.vue";
import GlobalDrawer from "../../commonComponents/allDrawer/globalDrawer.vue";
import DialogSection from "./dialogSection.vue";
import { isShiftOngoing } from "../../../utils/userStatus";
import { formatDateTime } from "../../../utils/dateFormatter";
export default {
  name: "designOrdersPageContent",
  components: {
    DesignOrdersTableView,
    // PageHeading,
    DesignOrders,
    FilterData,
    Navbar,
    DesignOrdersPopUp,
    Sidebar,
    DesignOrdersPage,
    KanbanView,
    ListViewTable,
    LeadsDrawer,
    GlobalDrawer,
    DialogSection,
  },

  data() {
    return {
      selectedCard: false,
      nextUrl: "",
      searchText: "",
      componentName: "dialog",
      sort: [1, "created_at", 2],
      drawer: false,
      create: [],
      hancreate: [],
      handue: [],
      hanservice: [],
      due: [],
      service: "",
      owner: "",
      delivery: "",
      containerHeight: "25rem",
      filterValue: "",
      duefilterValue: "",
      customStart1: "",
      customEnd1: "",
      duecustomStart: "",
      duecustomEnd: "",
      selectedColumnType: "order_status",
      dialogUpdates: false,
      kanbanData: [],
      custom: [],
      speedColumn: ["Base", "Expedited", "Super Expedited"],
      customValue: "",
      customStart: "",
      customEnd: "",
      headTable: [
        { id: "id", title: "ORDER ID", width: "140" },
        // { id: "name", title: "Name", width: "140" },
        { id: "service_type", title: "ORDER TYPE", width: "140" },

        { id: "project", title: "Project", width: "140" },
        { id: "owner", title: "Owner", width: "140" },
        { id: "order_status", title: "STATUS", width: "140" },
        {
          id: "due_date_string",
          title: "DUE DATE",
          width: "140",
        },
        {
          id: "created_at",
          title: "CREATED ON",
          width: "140",
        },

        // { prop: "actions", label: "Actions", width: "140" },
      ],
      dataTable: [],
      tableDataref: [],
      isSidebarOpen: false,
      active: true,
      title: "Design Orders",
      isShareLoading: false,
      orderDetailsPopVisible: false,
      kanbanColumnsData: [
        "order_placed",
        "incomplete",
        "in_process",
        "pending",
        "complete",
        "rejected",
        "cancelled",
      ],
      columnsData: [],
      kanbanColumns: [
        {
          title: "incomplete",
          tasks: [],
        },
        {
          title: "in_process",
          tasks: [],
        },

        {
          title: "pending",
          tasks: [],
        },
        {
          title: "complete",
          tasks: [],
        },
        {
          title: "order_placed",
          tasks: [],
        },
        {
          title: "rejected",
          tasks: [],
        },
        {
          title: "cancelled",
          tasks: [],
        },
        // {
        //   title: "addSection",
        //   tasks: [],
        // },
      ],
      order: null,
      pagesPerRequest: 5,
      recordsPerPage: 10,
      timeRange: {
        start_time: "",
        end_time: "",
      },
      duetimeRange: {
        due_start_time: "",
        due_end_time: "",
      },
      users: [],
      buttonsData: [
        {
          type: "none",
          icon: "el-icon-edit-outline",
          size: "mini",
          callback: (row) => {
            console.log("Table 1 Delete", row);
            this.handleDesign(row);
          },
          exist: "desgin",
          tooltipContent: "View / Edit Design",
        },
        {
          type: "none",
          icon: "el-icon-document-checked",
          size: "mini",
          callback: (row) => {
            console.log("Table 1 Delete", row);
            this.handleViewSurvey(row.additional_info?.path);
          },
          exist: "survey",
          tooltipContent: "View / Edit SiteSurvey",
        },
      ],
      orderStatusOptions: [
        {
          label: "Order Placed",
          value: "order_placed",
        },
        {
          label: "Incomplete",
          value: "incomplete",
        },
        { label: "In Process", value: "in_process" },

        { label: "Pending", value: "pending" },
        { label: "Complete", value: "complete" },

        { label: "Reject", value: "rejected" },
        { label: "Cancel", value: "cancelled" },
      ],
    };
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
    handleRefresh() {
      this.designOrdersDatas();
      this.designOrdersUsers();
      this.getData();
    },
    dataFormaterTable(data) {
      data.map((d) => {
        d.name = d.project ? d.project.name : "NA";
        d.engineer_name = d.engineer_name
          ? this.fullNameHandler(d)
          : "Unassigned";
        d.due_date_string = this.handleDates(d.due_date);
        d.project = d.project ? d.project.type_of_rate : "";
        d.due_date = this.handleDueDate(d.due_date);
        d.owner = d.engineer_name ? d.engineer_name : "NA";
        d.created_at = DateTime.fromISO(d.created_at).toFormat("dd/MM/y");
        d.color = this.handleColor(d);
        d.isOnline =
          d.engineer_name &&
          d.shifts?.length > 0 &&
          this.handleIsShiftOngoing(d.shifts);
      });
      return data;
    },
    handleClose() {
      this.drawer = false;
    },
    handleReject() {},
    handleIsShiftOngoing(shift) {
      return isShiftOngoing(shift);
    },
    handleSearch(data) {
      this.searchText = data;
      console.log({ data });
    },
    getHeaderTitle(value) {
      switch (value) {
        case "incomplete":
          return "Incomplete";
        case "in_process":
          return "In Process";
        case "pending":
          return "Pending";
        case "complete":
          return "Completed";
        case "order_placed":
          return "Order Placed";
        case "rejected":
          return "Rejected";
        case "cancelled":
          return "Cancelled";

        case "Incomplete":
          return "incomplete";
        case "In Process":
          return "in_process";
        case "Pending":
          return "pending";
        case "Completed":
          return "complete";
        case "Order Placed":
          return "order_placed";
        case "Rejected":
          return "rejected";
        case "Cancelled":
          return "cancelled";
        case "Base":
          return "Base";
        case "Expedited":
          return "Expedited";
        case "Super Expedited":
          return "Super Expedited";

        default:
          return "";
      }
    },
    handleCardColumns(data, value) {
      console.log(value);
      let oldTask = "";
      const oldData = this.kanbanDataValue.map((d) => {
        d.tasks.map((t) => {
          if (t.id === data.id) {
            t.order_status = value;
            console.log(t);
            oldTask = t;
          }
        });
      });
      console.log(oldTask);

      this.kanbanDataValue.map((m) => {
        if (m.title === this.getHeaderTitle(data.order_status)) {
          m.tasks.push(oldTask);
          m.tasks = m.tasks.sort((a, b) => b.id - a.id);
        } else {
          if (m.tasks.length > 0) {
            m.tasks = m.tasks.filter((s) => s.id !== data.id);
          }
        }
      });
      console.log(this.kanbanDataValue);
      this.kanbanData = this.kanbanDataValue;
    },
    handleCardUpdate(data, value) {
      console.log(data);
      console.log(value);
      const oldData = this.kanbanDataValue.map((d) => {
        if (d.title === this.getHeaderTitle(data.order_status)) {
          d.tasks.map((c) => {
            if (c.id === data.id) {
              c.engineer_name = this.fullNameHandler(data);
            }
          });
        }
      });
      // this.kanbanData = this.kanbanDataValue;
    },

    handleOrderUpdate(data, previousdata) {
      // console.log(previousdata.order_status);
      // const titlevalue = this.getHeaderTitle(data.order_status);
      // console.log(titlevalue);
      // console.log(this.kanbanData.find((d) => d.title === titlevalue));
      // const previousFilterValues = this.kanbanData.find(
      //   (d) => d.title === previousdata.order_status
      // );

      // const filterValues = this.kanbanData.find((d) => d.title === titlevalue);
      // filterValues.tasks.filter((d) => console.log(d));
      // previousFilterValues.tasks.filter((d) => console.log(d.id));

      this.designOrdersDatas();
      this.designOrdersUsers();
      // this.getData();
    },
    dataFormater(dataValue) {
      dataValue.map((d) => {
        d.name = d.project ? d.project.name : "NA";
        d.engineer_name = d.engineer_name
          ? this.fullNameHandler(d)
          : "Unassigned";
        d.due_date_string = this.handleDates(d.due_date);
        // d.project = d.project ? d.project : "";
        d.due_date = this.handleDueDate(d.due_date);
        d.owner = d.engineer_name ? d.engineer_name : "NA";
        d.created_at = DateTime.fromISO(d.created_at).toFormat(
          "dd/MM/y  hh:mm a"
        );
        d.color = this.handleColor(d);
        d.orderStatus = this.getHeaderTitle(d.order_status);
        d.isOnline =
          d.engineer_name &&
          d.shifts?.length > 0 &&
          this.handleIsShiftOngoing(d.shifts);
      });
      console.log(dataValue);
      return dataValue;
    },
    handleGenerateQueryParams(params) {
      return Object.entries(params)
        .filter(([key, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== null && value !== "";
        })
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            const encodedValues = value.map((item) => encodeURIComponent(item));
            return `${key}=${encodedValues.join(",")}`;
          }
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join("&");
    },

    async getData() {
      console.log(this.selectedColumnType);
      console.log(this.timeRange);
      const { start_time, end_time } = this.timeRange;
      const { due_start_time, due_end_time } = this.duetimeRange;
      console.log(start_time);
      console.log(end_time);
      this.kanbanData = [];
      let kanbanColumns =
        this.selectedColumnType === "delivery_type"
          ? this.speedColumn
          : this.kanbanColumnsData;

      let reqObj = "";

      kanbanColumns.map(async (dt, index) => {
        let params = {
          start_time,
          end_time,
          due_start_time,
          due_end_time,
          delivery_type: this.delivery,
          service_type: this.service,
          engineer_name: this.owner,
          order_by: this.sort[1] ? this.sort[1] : [],
          sort_type: this.sort[2] ? this.sort[2] : [],
        };
        if (this.selectedColumnType && dt) {
          params = { ...params, [this.selectedColumnType]: dt };
        }
        if (this.searchText) {
          params = { ...params, q: this.searchText };
        }

        let queryParams = this.handleGenerateQueryParams(params);

        console.log(queryParams);

        let result = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD(
          queryParams
        );
        let dataValue = result.data.results;
        let count = result?.data.count || 0;

        console.log(this.getHeaderTitle(dt));

        let newData = {
          sequence: index,
          columnType: this.selectedColumnType,
          count: count,
          title: this.getHeaderTitle(dt),
          tasks: dataValue ? this.dataFormater(dataValue) : [],
          next: result ? result.data.next : [],
          previous: result ? result.data.previous : [],
        };
        this.kanbanData.push(newData);
      });
      console.log(this.kanbanData);
    },
    async loadMoreData(col) {
      console.log("loadMore", col);
      const response = await API.DESIGN_ORDERS.LOAD_MORE_Leads(col.next);
      console.log(response);
      this.kanbanData.map((dt) => {
        if (dt.title === col.title) {
          dt.tasks.push(...this.dataFormater(response.data.results));
          dt.next = response.data.next;
        }
      });
      console.log(this.kanbanData);
    },
    async designOrdersDatas() {
      let data = await this.resovleRequests(
        API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
        this.pagesPerRequest,
        this.recordsPerPage,
        "orders",
        this.timeRange,
        this.duetimeRange
      );
      this.dataTable = this.dataFormaterTable(data);
      console.log(this.dataTable);
    },
    removeSort(value) {
      console.log(value);
      this.sort = [];
    },
    removeFilter(value) {
      console.log(value);
      this.sort = [];
      this.create = [];
      this.due = [];
      this.service = "";
      this.delivery = "";
      this.owner = "";
      if (this.create[2] !== "custom") {
        this.filterValue = this.create[2];
      }
      if (this.due[2] !== "duecustom") {
        console.log(this.due[2]);
        this.duefilterValue = this.due[2];
      }
    },
    handlefilterView(value) {
      console.log(value); //empty array

      if (value === this.create) {
        this.create = [];
      }
      if (value === this.due) {
        this.due = [];
      }

      if (value[2] === this.service) {
        this.service = "";
      }
      if (value[2] === this.delivery) {
        this.delivery = "";
      }
      if (value[2] === this.owner) {
        this.owner = "";
      }
      // });
      console.log(this.create);
      console.log(this.due);
      console.log(this.service);
      console.log(this.delivery);

      if (this.create[2] !== "custom") {
        this.filterValue = this.create[2];
      }
      if (this.due[2] !== "duecustom") {
        console.log(this.due[2]);
        this.duefilterValue = this.due[2];
      }
    },
    getFilter(value) {
      console.log(value);
      value.forEach((item) => {
        console.log(item);
        const key = item[1];
        if (value.length > 0) {
          if (key === "Created at") {
            this.create = item;
          }
          if (key === "Due Date") {
            this.due = item;
          }
          if (key === "Service Type") {
            const deliveryType = this.speedColumn.filter((d) => d === item[2]);
            console.log(deliveryType);
            if (deliveryType.length > 0) {
              console.log(item[2]);
              this.delivery = item[2];
            } else {
              this.service = item[2];
            }
          }
          if (key === "Owner") {
            this.owner = item[2];
          }
        }
      });
      console.log(this.create);
      console.log(this.due);
      console.log(this.service);

      this.custom = value;
      if (this.create.length > 0) {
        if (this.create[2] !== "Custom") {
          this.filterValue = this.create[2];
        }
      }
      if (this.due.length > 0) {
        if (this.due[2] !== "Custom") {
          console.log(this.due[2]);
          this.duefilterValue = this.due[2];
        }
      }
    },
    handleColumnType(value) {
      console.log(value);
      this.selectedColumnType = value[1];
    },
    customDate(value) {
      console.log(value);
      console.log(this.create);
      this.customStart1 = value[0].toISOString();
      this.customEnd1 = value[1].toISOString();
      console.log([this.customStart1, this.customEnd1]);
      // if (this.due[1] == "due_date") {
      //   this.duefilterValue = "duecustom";
      // } else if (this.create[1] == "created_at") {
      this.filterValue = "Custom";
      // }
    },
    customDueDate(value) {
      console.log(value);
      this.duecustomStart = value[0].toISOString();
      this.duecustomEnd = value[1].toISOString();
      this.duefilterValue = "Custom";
    },
    sortView(value) {
      console.log(value);
      this.sort = value;
    },
    columnType(value) {
      this.selectedColumnType = value;
      console.log(value);
    },
    async designOrdersUsers() {
      const users = await this.resovleRequests(
        API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_USERS.bind(API.DESIGN_ORDERS),
        this.pagesPerRequest,
        this.recordsPerPage,
        "users",
        this.timeRange,
        this.duetimeRange
      );
      this.users = users;
      // this.users = [
      //   {
      //     id: 2562,
      //     first_name: "Bharath",
      //     last_name: "Reddy",
      //     email: "bmalapareddy@arka.energy",
      //     phone: "8197942429",
      //     organisation: {
      //       id: 491,
      //       name: "Arka Energy",
      //       email_id: "ckumar@arka.energy",
      //       phone: "9490891245",
      //       website: "",
      //       address: ".",
      //     },
      //     last_login: null,
      //     org_shares: [
      //       {
      //             id: 2782,
      //         author: 2562,
      //         organisation: 491,
      //         permission: "CHANGE",
      //       },
      //     ],
      //     user_shares: [],
      //     role: "ADMIN",
      //     is_active: true,
      //     company_name: null,
      //     telephonic_code: null,
      //     country: null,
      //     image: null,
      //     add_ons: [
      //       "ac_cable_enabled",
      //       "autocad_enabled",
      //       "docs_export_enabled",
      //       "stl_export_enabled",
      //       "threeds_export_enabled",
      //       "is_heaven_solar_integrated",
      //       "is_manual_stringing_enabled",
      //     ],
      //     managers: [],
      //     api_key: null,
      //     plan_details: {
      //       plan_id: {
      //         id: 2,
      //         deleted: false,
      //         deleted_at: null,
      //         Name: "Basic",
      //         small_project_quota: 0,
      //         medium_project_quota: 0,
      //         large_project_quota: 5000,
      //         plan_type: 1,
      //         actual_price: 90000,
      //         discounted_price: 90000,
      //         cashfree_id: null,
      //         frequency: "12",
      //         number_of_seats: 1,
      //       },
      //       users_count: {
      //         used_users: 100,
      //         unused_users: -99,
      //       },
      //       add_ons_count: {
      //         ac_cable_enabled: {
      //           total_users: 38,
      //           used_users: 38,
      //           unused_users: 0,
      //         },
      //         autocad_enabled: {
      //           total_users: 38,
      //           used_users: 38,
      //           unused_users: 0,
      //         },
      //         docs_export_enabled: {
      //           total_users: 38,
      //           used_users: 38,
      //           unused_users: 0,
      //         },
      //         stl_export_enabled: {
      //           total_users: 38,
      //           used_users: 38,
      //           unused_users: 0,
      //         },
      //         threeds_export_enabled: {
      //           total_users: 38,
      //           used_users: 38,
      //           unused_users: 0,
      //         },
      //       },
      //     },
      //     ac_cable_enabled: true,
      //     autocad_enabled: true,
      //     docs_export_enabled: true,
      //     stl_export_enabled: true,
      //     threeds_export_enabled: true,
      //     is_manager: false,
      //     is_bom_enabled: false,
      //     logo: null,
      //     about_us: null,
      //     website: null,
      //     email_id: null,
      //     is_three_d_link: true,
      //     is_logo_on_all: true,
      //     address: null,
      //     previous_project_one_image: null,
      //     previous_project_two_image: null,
      //     previous_project_three_image: null,
      //     previous_project_one_name: null,
      //     previous_project_two_name: null,
      //     previous_project_three_name: null,
      //     frequently_asked_questions: [],
      //     team_members: [],
      //     is_sl_360_user: true,
      //     role_id: "ROLE000045",
      //     app_id: "APP000002",
      //   },
      // ];
      console.log(users);
    },
    async handleChange(value, columns) {
      console.log(columns, value);
      console.log(this.selectedColumnType);
      if (!value) return;
      let { id } = value;
      let i = 0,
        newStatus;
      while (i < columns.length) {
        let status = columns[i].tasks.find((e) => e.id === id);
        if (status) {
          console.log(columns[i]);
          newStatus = this.getHeaderTitle(columns[i].title);
          console.log(newStatus);
          const filter = {};
          filter[this.selectedColumnType] = newStatus;
          try {
            let res = await API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(
              id,
              filter
            );
            return res;
          } catch (err) {
            console.log(err.message);
          }
        }
        i++;
      }
    },
    fullNameHandler(data) {
      console.log(this.users.find((u) => u.id == parseInt(data.engineer_name)));
      const nameValue = this.users.find(
        (u) => u.id == parseInt(data.engineer_name)
      );
      console.log(this.users);
      const firstName = nameValue?.first_name;
      const lastName = nameValue?.last_name;
      const fullName = firstName + lastName;
      console.log(fullName);
      return fullName || "NA";
    },
    btn1Action(row) {
      console.log("action", row);
    },
    handleTimeRange() {
      let today = new Date();
      let startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );
      let endOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - today.getDay())
      );
      console.log("timeRange");
      this.timeRange = {
        start_time: startOfWeek.toISOString() || "",
        end_time: endOfWeek.toISOString() || "",
      };
      this.getData();
    },

    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    toggleView(active) {
      this.active = !active;
    },
    handleOrderClick(row, column, event) {
      this.drawer = true;
      this.orderDetailsPopVisible = true;
      console.log(this.orderDetailsPopVisible);
      this.order = row;
    },
    // filter(period) {
    //   console.log(period);
    //   this.filterValue = period;
    // },
    startdate(start) {
      console.log(start);
      this.customStart = start;
    },
    enddate(end) {
      console.log(end);
      this.customEnd = end;
    },
    currentUser(status) {
      console.log(status);
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (status === true) {
        this.dataTable = this.tableDataref.filter(
          (d) => parseInt(d.engineer_name) === user.user_id
        );
      } else {
        this.dataTable = this.tableDataref;
      }
      console.log(user);
      console.log(this.dataTable);
    },

    //RKchange1
    handleDesign(orderData) {
      console.log(orderData);
      window.open(`${BASE_URL_FOR_REPORT_IMAGES}studio/${orderData.design}`);
    },
    handleViewSurvey(surveyPath) {
      const url = `${SITE_SURVEY_LINK}${surveyPath}/tsl`;
      window.open(url);
    },
    //end

    getQueryString(pageNumber, type, timeRange, duetimeRange) {
      console.log(this.filterValue);
      let queryString = "";
      let params;
      if (type === "orders") {
        const { start_time, end_time } = timeRange;
        const { due_start_time, due_end_time } = duetimeRange;

        // queryString = `page=${pageNumber}&start_time=${start_time}&end_time=${end_time}&order_by=${this.sort[1]}&sort_type=${this.sort[2]}&due_date_start_time=${due_start_time}&due_date_end_time=${due_end_time}&service_type=${this.service}&engineer_name=${this.owner}&delivery_type=${this.delivery}`;

        params = {
          start_time,
          end_time,
          due_start_time,
          due_end_time,
          page: pageNumber,
          delivery_type: this.delivery,
          service_type: this.service,
          engineer_name: this.owner,
          order_by: this.sort[1] ? this.sort[1] : [],
          sort_type: this.sort[2] ? this.sort[2] : [],
        };
        if (this.searchText) {
          params = { ...params, q: this.searchText };
        }
      }
      if (type === "users") {
        params = {
          page: pageNumber,
        };
      }
      queryString = this.handleGenerateQueryParams(params);
      return queryString;
    },
    async resovleRequests(
      requestCallback,
      pagesPerRequest = 5,
      recordsPerPage = 10,
      type,
      timeRange,
      duetimeRange
    ) {
      const orders = [];

      let queryString = this.getQueryString(1, type, timeRange, duetimeRange);

      const res = await requestCallback(queryString);
      console.log(res.data.results);
      this.nextUrl = res.data.next;
      orders.push(...res.data.results);
      const pages = Math.ceil(res.data.count / recordsPerPage);

      const count = Math.ceil(pages / pagesPerRequest);

      console.log(pages, count);

      // for (let i = 1; i <= count; i++) {
      //   const promises = [];

      //   for (
      //     let j = pagesPerRequest * (i - 1) + 1;
      //     j <= pagesPerRequest * i;
      //     j++
      //   ) {
      //     if (j === 1) ++j;
      //     if (j <= pages) {
      //       console.log("request page", j);
      //       promises.push(
      //         requestCallback(
      //           this.getQueryString(j, type, timeRange, duetimeRange)
      //         )
      //       );
      //     }
      //   }

      //   const x = await Promise.all(promises);

      //   x.forEach((response) => {
      //     let resResult = response.data;
      //     if (resResult?.results) orders.push(...resResult.results);
      //   });
      // }
      console.log(orders);
      return orders;
    },
    async loadMoreLeadData() {
      if (this.nextUrl !== null) {
        let data = await API.DESIGN_ORDERS.LOAD_MORE_Leads(this.nextUrl);
        console.log(data);
        let leadData = data.data.results;
        this.nextUrl = data.data.next;
        let formatData = this.dataFormaterTable(leadData);
        this.dataTable.push(...formatData);
        console.log(this.dataTable);
      }
    },
    handleColor(data) {
      switch (data.service_type) {
        case "PV Design":
          return "danger";

        case "Solar Sales Proposal":
        case "Sales Proposal":
        case "Preliminary Proposal":
          return "success";
        case "Permit Package":
          return "warning";
        default:
          return "";
      }
    },
    handleDueDate(dateTime) {
      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() ===
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return { lable: "Today", color: "#EF6C00" };
      }

      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() <
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return { lable: "Overdue", color: "red" };
      }

      return {
        lable: DateTime.fromISO(dateTime).toFormat("dd/MM/y  hh:mm a"),
      };
    },

    handleDates(dateTime) {
      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() ===
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return "Today";
      }

      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() <
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return "Overdue";
      }

      return DateTime.fromISO(dateTime).toFormat("dd/MM/y");
    },

    doSome() {
      alert("Hello");
    },

    getCellStyles(row, prop) {
      if (row?.order_status === "cancelled" && prop.id === "order_status") {
        return {
          color: "red",
        };
      }

      if (row?.due_date_string === "Today" && prop.id === "due_date_string") {
        return {
          color: "#EF6C00",
        };
      }

      if (row?.due_date_string === "Overdue" && prop.id === "due_date_string") {
        return {
          color: "red",
        };
      }

      if (
        row.service_type === "Preliminary Proposal" &&
        prop.id === "service_type"
      ) {
        return { color: "green" };
      }
      if (
        row.service_type === "Full Construction Drawing" &&
        prop.id === "service_type"
      ) {
        return { color: "#7286D3" };
      }

      return {};
    },
  },
  computed: {
    designOrdersData() {
      const user = this.users;
      console.log(this.dataTable);
      // this.dataTable.map((d) => {

      //   d.name = d.project ? d.project.name : "NA";
      //   d.engineer_name = d.engineer_name
      //     ? this.fullNameHandler(d)
      //     : "Unassigned";
      //   d.due_date_string = this.handleDates(d.due_date);
      //   d.project = d.project ? d.project.type_of_rate : "";
      //   d.due_date = this.handleDueDate(d.due_date);
      //   d.owner = d.engineer_name ? d.engineer_name : "NA";
      //   d.created_at = DateTime.fromISO(d.created_at).toFormat("dd/MM/y");
      //   d.color = this.handleColor(d);
      //   d.isOnline =
      //     d.engineer_name &&
      //     d.shifts?.length > 0 &&
      //     this.handleIsShiftOngoing(d.shifts);
      // });
      console.log(this.dataTable);
      return this.dataTable ? this.dataTable : [];
    },
    kanbanDataValue() {
      console.log(this.kanbanData);
      const sortedValue = this.kanbanData.sort(
        (a, b) => a.sequence - b.sequence
      );
      let key = "sequence";
      const arrayUniqueByKey = [
        ...new Map(sortedValue.map((item) => [item[key], item])).values(),
      ];
      console.log(arrayUniqueByKey);
      return arrayUniqueByKey;
    },
  },
  watch: {
    searchText: {
      handler: async function (newVal, oldVal) {
        if (this.active) {
          this.getData();
        } else {
          this.resovleRequests(
            API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
            this.pagesPerRequest,
            this.recordsPerPage,
            "orders",
            this.timeRange,
            this.duetimeRange
          );
        }
      },
    },
    filterValue: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        let start, end;
        switch (newVal) {
          case "Week":
            let today = new Date();
            let startOfWeek = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - today.getDay()
            );
            let endOfWeek = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + (6 - today.getDay())
            );
            start = startOfWeek.toISOString();
            end = endOfWeek.toISOString();
            break;
          case "Today":
            start = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate() + 1
            ).toISOString();
            break;
          case "Month":
            start = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ).toISOString();
            break;
          case "Quarter":
            let currentQuarter = Math.floor(new Date().getMonth() / 3);
            start = new Date(
              new Date().getFullYear(),
              currentQuarter * 3,
              1
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              currentQuarter * 3 + 3,
              0
            ).toISOString();
            break;
          case "Custom":
            let customStartDate = this.customStart1;
            let customEndDate = this.customEnd1;
            start = customStartDate;
            end = customEndDate;
            break;
          default:
            break;
        }
        this.timeRange = {
          start_time: start || "",
          end_time: end || "",
        };
        this.getData();
        console.log(this.timeRange);
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD.bind(API.DESIGN_ORDERS),
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        // let reqObj = `page=2&start_time=${start}&end_time=${end}&order_by=created_at&sort_type=2`;
        // let response = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD(
        //   reqObj
        // );
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    duefilterValue: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        let start, end;
        switch (newVal) {
          case "Week":
            let today = new Date();
            start = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - today.getDay()
            ).toISOString();
            end = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + (6 - today.getDay())
            ).toISOString();
            // start = startOfWeek.toISOString();
            // end = endOfWeek.toISOString();
            break;
          case "Today":
            start = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate() + 1
            ).toISOString();
            break;
          case "Month":
            start = new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ).toISOString();
            break;
          case "Quarter":
            let currentQuarter = Math.floor(new Date().getMonth() / 3);
            start = new Date(
              new Date().getFullYear(),
              currentQuarter * 3,
              1
            ).toISOString();
            end = new Date(
              new Date().getFullYear(),
              currentQuarter * 3 + 3,
              0
            ).toISOString();
            break;
          case "Custom":
            let customStartDate = this.duecustomStart;
            let customEndDate = this.duecustomEnd;
            start = customStartDate;
            end = customEndDate;
            break;
          default:
            break;
        }
        this.duetimeRange = {
          due_start_time: start || "",
          due_end_time: end || "",
        };
        console.log(this.duetimeRange);
        this.getData();
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        // let reqObj = `page=2&start_time=${start}&end_time=${end}&order_by=created_at&sort_type=2`;
        // let response = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD(
        //   reqObj
        // );
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    dialogUpdates: {
      handler: async function (newVal, oldVal) {
        console.log(newVal, oldVal);
        this.designOrdersDatas();
        this.designOrdersUsers();
      },
    },
    sort: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        this.getData();
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    service: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        this.getData();
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    delivery: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        this.getData();
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    owner: {
      handler: async function (newVal, oldVal) {
        console.log(newVal);
        const data = await this.resovleRequests(
          API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD,
          this.pagesPerRequest,
          this.recordsPerPage,
          "orders",
          this.timeRange,
          this.duetimeRange
        );
        this.getData();
        this.dataTable = this.dataFormaterTable(data);
        this.tableDataref = data;
        console.log(this.dataTable);
      },
    },
    selectedColumnType(newVal, oldVal) {
      console.log(newVal);
      this.getData();
    },
  },
  async created() {
    this.designOrdersUsers();
    // this.getData();
  },
  async mounted() {
    this.handleTimeRange();
    this.designOrdersDatas();
    this.getCellStyles();

    // let reqObj =
    //   "page=2&start_time=2023-03-31T18:30:00.000Z&end_time=2023-04-30T18:29:59.999Z&order_by=created_at&sort_type=2";
    // let data = await this.resovleRequests(
    //   API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD.bind(API.DESIGN_ORDERS),
    //   this.pagesPerRequest,
    //   this.recordsPerPage,
    //   "orders",
    //   reqObj
    // );
    // this.dataTable = data;
    // console.log(this.dataTable);
    // const users = await this.resovleRequests(
    //   API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_USERS.bind(API.DESIGN_ORDERS),
    //   this.pagesPerRequest,
    //   this.recordsPerPage,
    //   "users",
    //   this.timeRange
    // );
    // this.users = users;
    // console.log(users);

    // let response = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_METHOAD(reqObj);
    // this.dataTable = response.data.results;
    // console.log(this.dataTable);
  },
};
</script>

<style scoped>
.icon {
  color: #4083ff;
}

#icon {
  margin-right: 5px;
}
</style>
