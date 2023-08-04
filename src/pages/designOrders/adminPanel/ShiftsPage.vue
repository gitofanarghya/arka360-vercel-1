<template>
  <div v-if="shiftsData">
    <!-- <nav>
      <el-button type="primary" @click="openCreateShiftBox"
        >Create Shift</el-button
      >
    </nav> -->
    <div class="body">
      <!-- <GlobalDialog
        :dialogTitle="deleteShiftHeading"
        :dialogVisible="deletedShiftId !== null"
        :footerButtonText="'Yes'"
        @handleClick="deleteShiftData"
        @handleClose="deletedShiftId = null"
      >
        <template v-slot:body>
          <span>{{ deleteShiftMessage }}</span>
        </template>
      </GlobalDialog> -->
      <GlobalDeleteDialog
        :dialogTitle="deleteShiftHeading"
        :dialogVisible="deletedShiftId !== null"
        :footerButtonText="'Yes'"
        :width="'18.75rem'"
        :deleteMessage="deleteShiftMessage"
        @handleClick="deleteShiftData"
        @handleClose="deletedShiftId = null"
      >
      </GlobalDeleteDialog>

      <ListViewTable
        :tableColumns="tableColumns"
        :tableData="shiftsData"
        :handleRowClick="handleClickOnRow"
        :getCellStyles="styleCells"
        :getHeaderStyles="getHeaderStyles"
        :showBorder="false"
        :loadMoreLeadData="loadMoreLeadData"
        :tableHeightOffset="'16rem'"
      >
        <template v-slot:actions="slotProps">
          <div>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click.native.stop="openEditShiftBox(slotProps.scope)"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-delete"
              size="small"
              @click.native.stop="deleteShift(slotProps.scope)"
            ></el-button>
          </div>
        </template>

        <!-- <template v-slot:tags="slotProps">
          <TagsComponent
            :availableTags="[]"
            :selectedTags="[
              { name: 'tag', id: 'tag' },
              { name: 'amana', id: 'same' },
            ]"
            :editable="false"
            :handleUpdate="() => {}"
          />
        </template> -->
      </ListViewTable>

      <GlobalDrawer
        :isOpen="showCreateDrawer"
        :title="createBoxHeading"
        :handleCloseDialog="closeCreateDrawer"
        :drawerSize="drawerWidth"
      >
        <template v-if="showCreateDrawer" v-slot:header>
          <CreateShift :createShift="createShift" />
        </template>
      </GlobalDrawer>
      <GlobalDrawer
        :isOpen="showEditDrawer"
        :title="editBoxHeading"
        :handleCloseDialog="closeEditDrawer"
        :drawerSize="drawerWidth"
      >
        <template v-slot:header>
          <EditShift
            :editShift="editShift"
            :shiftObj="shiftToEdit"
            :v-if="shiftToEdit ? true : false"
          />
        </template>
      </GlobalDrawer>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
import CreateShift from "./CreateShift.vue";
import ListViewTable from "../components/ListViewTable.vue";
import GlobalDrawer from "../../commonComponents/allDrawer/globalDrawer.vue";
import EditShift from "./EditShift.vue";
import GlobalDialog from "../../commonComponents/GlobalDialog.vue";
import GlobalDeleteDialog from "../../commonComponents/GlobalDeleteDialog.vue";
import TagsComponent from "../esUsers/components/tagsComponent.vue";

export default {
  name: "ShiftsPage",
  components: {
    ListViewTable,
    CreateShift,
    EditShift,
    GlobalDrawer,
    GlobalDialog,
    GlobalDeleteDialog,
    TagsComponent,
  },
  props: {
    createShiftFlag: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    getTableHeight() {
      if (window.matchMedia("(max-width: 600px)").matches) {
        return "27rem"; // Condition for small screens
      } else if (window.matchMedia("(max-width: 960px)").matches) {
        return "27rem"; // Condition for medium screens
      } else if (window.matchMedia("(max-width: 1280px)").matches) {
        return "27.5rem"; // Condition for large screens
      } else if (window.matchMedia("(max-width: 1300px)").matches) {
        return "27.5rem"; // Condition for large screens
      } else {
        return "27.9rem"; // Default table height for other screen sizes
      }
    },
  },
  data() {
    return {
      drawerWidth: 400,
      showCreateDrawer: false,
      showEditDrawer: false,
      createBoxHeading: "Create Shift",
      editBoxHeading: "Edit Shift",
      shiftToEdit: {},
      nextUrl: null,
      // tableColumns: [
      //   { id: "name", title: "Name" },
      //   { id: "from_time", title: "From" },
      //   { id: "duration", title: "Duration" },
      //   { id: "days_of_week", title: "Days of week" },
      // ],
      tableColumns: [
        { id: "name", title: "Name", width: "250" },
        { id: "from_time", title: "From", align: "center" },
        { id: "duration", title: "Duration", align: "center" },
        { id: "mon", title: "Mon", align: "center" },
        { id: "tue", title: "Tue", align: "center" },
        { id: "wed", title: "Wed", align: "center" },
        { id: "thur", title: "Thur", align: "center" },
        { id: "fri", title: "Fri", align: "center" },
        { id: "sat", title: "Sat", align: "center" },
        { id: "sun", title: "Sun", align: "center" },
      ],
      shiftsData: [],
      deletedShiftId: null,
      deleteShiftHeading: "Delete Shift",
      deleteShiftMessage: "Are you sure you want to delete this shift?",
    };
  },
  methods: {
    async loadMoreLeadData() {
      if (this.nextUrl !== null) {
        let data = await API.DESIGN_ORDERS.LOAD_MORE_Leads(this.nextUrl);
        console.log(data);
        this.shiftsData = await data.data.results;
        this.nextUrl = data.data.next;
        let newData = this.addDaysColumnsValues(this.shiftsData);
        this.shiftsData.push(...newData);
        // let formatData = this.dataFormaterTable(leadData);
        // this.dataTable.push(...formatData);
        console.log(this.dataTable);
      }
    },
    getHeaderStyles(column) {
      if (column.id === "name") {
        return "left";
      } else return "center";
    },
    async getShiftsData() {
      let { data } = await API.SHIFTS.FETCH_SHIFTS_DATA();
      this.shiftsData = await data;
      console.log(this.shiftsData);
      //Modify each shift to have a property for each day of the week and assign them with Yes/No
      //based on the day_of_week property
      this.shiftsData = this.addDaysColumnsValues(this.shiftsData);
    },
    async createShift(shiftObj) {
      let { data } = await API.SHIFTS.CREATE_SHIFT(shiftObj);
      console.log(data);
      this.getShiftsData();
      this.closeCreateDrawer();
    },
    async editShift(shiftObj) {
      console.log("make edit request");
      console.log(shiftObj);
      let { data } = await API.SHIFTS.UPDATE_SHIFT(shiftObj.id, shiftObj);
      console.log(data);
      this.shiftToEdit = {};
      this.getShiftsData();
      this.closeEditDrawer();
    },
    async deleteShiftData() {
      console.log(this.deletedShiftId);
      let { data } = await API.SHIFTS.DELETE_SHIFT(this.deletedShiftId);
      console.log(data);
      this.getShiftsData();
    },
    openCreateShiftBox() {
      console.log("creating shift");
      this.showCreateDrawer = true;
    },
    closeCreateDrawer() {
      this.showCreateDrawer = false;
      this.$emit("closeCreateShift", this.showCreateDrawer);
    },
    closeEditDrawer() {
      this.showEditDrawer = false;
      this.shiftToEdit = {};
    },
    handleClickOnRow(data) {
      console.log("click");
      console.log(data);
    },
    deleteShift(slotData) {
      console.log("delete");
      console.log(slotData);
      this.deletedShiftId = slotData.scope.row.id;
      console.log(this.deletedShiftId);
      //this.deleteShiftData(slotData.scope.row.id);
    },
    openEditShiftBox(slotData) {
      console.log("edit");
      console.log(slotData);
      this.shiftToEdit = slotData;
      this.showEditDrawer = true;
    },
    addDaysColumnsValues(shifts) {
      console.log(shifts);
      //Now modify to add property with the days of the week
      const daysOfWeek = ["mon", "tue", "wed", "thur", "fri", "sat", "sun"];
      const tickMark = "\u2713";
      const shiftsWithDays = shifts.map((shift) => {
        // Iterate over each day of the week
        for (const day of daysOfWeek) {
          // Check if the current day is in the `day_of_week` array
          const isDayPresent = shift.days_of_week.includes(day);
          //console.log(day);
          // Add a new property to the `shift` object based on the current day
          shift[day] = isDayPresent ? tickMark : "-";
        }
        delete shift.days_of_week;
        return shift;
      });

      console.log(shiftsWithDays);
      return shiftsWithDays;
    },
    mapAbbreviatedDayToFull(abbreviatedDay) {
      const dayMapping = {
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thur: "Thursday",
        fri: "Friday",
        sat: "Saturday",
        sun: "Sunday",
      };

      return dayMapping[abbreviatedDay.toLowerCase()] || abbreviatedDay;
    },
    styleCells(row, prop) {
      if (prop.align === "center") {
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      }
      return {};
    },
  },
  created() {
    this.getShiftsData();
  },
  watch: {
    createShiftFlag(newValue) {
      console.log(newValue);
      if (newValue) {
        this.openCreateShiftBox();
      } else this.closeCreateDrawer();
    },
  },
};
</script>

<style scoped>
nav,
.body {
  margin: 0;
}
.el-button--primary {
  color: #4083ff;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  /* background-color: #409EFF; */
  /* border-color: #409EFF; */
}

::v-deep [class^="el-icon-"] {
  font-weight: 600;
}
</style>
