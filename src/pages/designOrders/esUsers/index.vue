<template>
  <div id="dashboard">
    <GlobalDrawer
      :handleCloseDialog="handleCloseDialog"
      :title="'ES User profile'"
      :drawerSize="500"
      :isOpen="selectedUser ? true : false"
    >
      <template v-slot:header>
        <div v-if="selectedUser ? true : false">
          <ProfileInfo
            :fullName="selectedUser.first_name + selectedUser.last_name"
            :phoneNumber="profile1.phoneNumber"
            :email="selectedUser.first_name"
            :address="selectedUser.first_name"
          >
          </ProfileInfo>
        </div>
      </template>
      <template v-slot:body>
        <div style="padding: 1.5rem;">
          <TagsComponent
            title="Shifts"
            :selectedTags.sync="selectedShifts"
            :availableTags.sync="shiftsData"
            :handleUpdate="handleUpdateShifts"
            :editable="true"
          />
          <TagsComponent
            title="Competencies"
            :selectedTags.sync="selectedCompetencies"
            :availableTags.sync="competencyData"
            :handleUpdate="handleUpdateCompetencies"
            :editable="true"
          />
        </div>
      </template>
      <template v-slot:pinned-footer> </template>
    </GlobalDrawer>

    <ListViewTable
      :handleRowClick="handleRowClick"
      :tableColumns="headTable"
      :tableData="usersList"
      :getCellStyles="getCellStyles"
      :getHeaderStyles="getHeaderStyles"
      :showBorder="false"
      :tableHeightOffset="'16rem'"
    >
      <template v-slot:tags="slotProps">
        <TagsComponent
          :availableTags="[]"
          :selectedTags="dataFormat(slotProps.scope.scope.row.competence)"
          :editable="false"
          :handleUpdate="() => {}"
          :tagSize="'mini'"
        />
      </template>

      <template v-slot:shiftTags="slotProps">
        <TagsComponent
          :availableTags="[]"
          :selectedTags="dataFormat(slotProps.scope.scope.row.shift)"
          :editable="false"
          :handleUpdate="() => {}"
          :tagSize="'mini'"
        />
      </template>
    </ListViewTable>
  </div>
</template>

<script>
import API from "@/services/api/";
import ListViewTable from "../../designOrders/components/ListViewTable.vue";
import GlobalDrawer from "../../commonComponents/allDrawer/globalDrawer.vue";
import EsUserAttributeFields from "./components/esUserAttributeFields.vue";
import ProfileInfo from "./components/profileInfo.vue";
import TagsComponent from "./components/tagsComponent.vue";
import { isShiftOngoing } from "../../../utils/userStatus.js";
import { getOrderStatusColor } from "../../../utils";
import { FieldExistsAsNonTerminalError } from "pdf-lib";

export default {
  components: {
    ListViewTable,
    GlobalDrawer,
    EsUserAttributeFields,
    ProfileInfo,
    TagsComponent,
  },
  props: {
    fetchShift: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isSidebarOpen: false,
      shiftDataFetch: this.$props.fetchShift,
      headTable: [
        // { id: "id", title: "ORDER ID", width: "140" },
        { id: "fullName", title: "Full name", width: "140", type: "avatar" },
        { id: "email", title: "Email", width: "140" },
        { id: "isOnline", title: "Status", type: "onlineStatus", width: "60" },
        { id: "competence", title: "Competence", width: "140", type: "tag" },
        { id: "shift", title: "Shifts", width: "140", type: "shiftTags" },
      ],
      usersList: [],
      selectedUser: null,
      profile1: {
        fullName: "John Doe",
        phoneNumber: "1234567890",
        email: "johndoe@example.com",
        address: "123 Main Street, City, Country",
        imageSrc:
          "https://fastly.picsum.photos/id/960/400/400.jpg?hmac=Zw2u_C92_DqVEI-S0hLPumR4g1UP-9--vfyaeZwwN2E", // Example with an image
      },
      profile2: {
        fullName: "Jane Smith",
        phoneNumber: "9876543210",
        email: "janesmith@example.com",
        address: "456 Elm Street, City, Country",
        imageSrc: "", // Example without an image
      },
      shiftsData: [],
      competencyData: [],
      selectedShifts: [],
      selectedCompetencies: [],
    };
  },
  mounted() {
    this.getEsUsers();
    this.getShiftsData();
    this.getCompetencyData();
    console.log(this.shiftDataFetch);
  },
  methods: {
    handleIsShiftOngoing(shift) {
      return isShiftOngoing(shift);
    },
    getHeaderStyles(column) {
      if (column.id === "fullName") {
        return "left";
      } else return "center";
    },
    getCellStyles(row, column) {
      if (column.id === "isOnline") {
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      }

      if (column.type === "shiftTags") {
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      }
      if (column.id === "email") {
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      }
      if (column.type === "tag") {
        return {
          display: "flex",
          flexFlow: "row wrap",
          alignItems: "center",
          justifyContent: "center",
        };
      }
    },

    dataFormat(row) {
      console.log(typeof row);
      let data;
      if (typeof row === "string") {
        data = [
          {
            name: row,
            id: row,
          },
        ];
      } else {
        data = row.map((d) => {
          return {
            name: d,
            id: d,
          };
        });
      }

      console.log(data);
      return data;
    },
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    async getEsUsers() {
      try {
        const response = await API.ES_USERS.FETCH_ALL_USERS();
        console.log(response);
        let isOnline = false;
        this.usersList = response.data.results.map((item) => {
          if (item.shifts) {
            isOnline = this.handleIsShiftOngoing(item.shifts);
          }
          const shift = [];
          item.shifts.map((a) => {
            shift.push(a.name);
          }),
            console.log(name);
          return {
            ...item,
            fullName: item.first_name + item.last_name,
            shift,
            isOnline,
          };
        });
      } catch (error) {
        console.log("Error", error);
      }
    },
    async getShiftsData() {
      try {
        let result = await API.SHIFTS.FETCH_SHIFTS_DATA();
        console.log({ a: result.data });
        this.shiftsData = result.data;
      } catch (error) {
        console.log("Error", error);
      }
    },
    async getCompetencyData() {
      try {
        let { data } = await API.COMPETENCIES.FETCH_COMPETENCY_DATA();
        let objData = data.competencies.map((item) => ({
          id: item,
          name: item,
        }));
        this.competencyData = objData;
      } catch (error) {
        console.log("Error", error);
      }
    },
    async getUserAttributes(data) {
      try {
        if (!this.selectedUser) throw new Error("Invalid user selected");
        const result = await API.USERS.FETCH_USER(data.id);
        console.log({ result });
        let { competence, shifts } = result.data;
        this.selectedShifts = this.shiftsData.filter((item) =>
          shifts.includes(item.id)
        );
        this.selectedCompetencies = this.competencyData.filter((item) =>
          competence.includes(item.id)
        );
        // this.selectedShifts
      } catch (error) {
        console.log("Error", error);
      }
    },
    handleRowClick(row) {
      this.selectedUser = row;
      this.getUserAttributes(row);
    },
    handleCloseDialog() {
      this.getEsUsers();
      console.log("bye");
      this.selectedUser = null;
    },
    async handleUpdateUser(data) {
      try {
        if (!this.selectedUser) throw new Error("No selected user");
        const result = await API.USERS.PATCH_USER_DATA(
          this.selectedUser.id,
          data
        );
      } catch (error) {
        console.log("Error", error);
      }
    },
    handleUpdateShifts(data) {
      let items = data.map((item) => item.id);
      this.handleUpdateUser({ shifts: items });
    },
    handleUpdateCompetencies(data) {
      let items = data.map((item) => item.name);
      this.handleUpdateUser({ competence: items });
    },
  },
  watch: {
    selectedShifts: function (newVal, oldVal) {
      this.handleUpdateShifts(newVal);
    },
    selectedCompetencies: function (newVal, oldVal) {
      this.handleUpdateCompetencies(newVal);
    },
    fetchShift(value) {
      if (value === true) {
        this.getShiftsData();
      }
    },
  },
};
</script>

<style scoped>
.dashboardContainer {
  margin-left: 10px;
  margin-top: 10px;
  padding: 10px;
}

#dashboard {
  width: 100%;
  height: 100%;
}

.el-row {
  margin-bottom: 1rem;
}

/* .sales-trend {
  height: 100px;
  width: 100px;
} */
</style>
