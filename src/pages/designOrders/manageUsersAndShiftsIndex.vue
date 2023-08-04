<template>
  <div id="dashboard">
    <GlobalPageHeader>
      <template v-slot:children>
        <div class="headSection">
          <p class="headContent">Manage Users & Shifts</p>
          <el-button
            type="primary"
            v-show="createButton !== null"
            @click="handleButtonClick"
            >{{ createButton }}</el-button
          >
        </div>
        <el-tabs
          v-model="activeName"
          type="border-card"
          @tab-click="handleClick"
        >
          <el-tab-pane label="User" name="user">
            <EsUsersIndex :fetchShift="fetchShift" />
          </el-tab-pane>
          <el-tab-pane label="Shift" name="shift">
            <ShiftsPage
              :createShiftFlag="shiftFlag"
              @closeCreateShift="shiftFlag = false"
            />
          </el-tab-pane>
          <!-- <el-tab-pane label="Adder" name="Adder">
            <div style="padding: 10px"><AdderTable /></div>
          </el-tab-pane>
          <el-tab-pane label="AddAdders" name="Add Adders">
            <DiscountTable />
          </el-tab-pane> -->
        </el-tabs>
      </template>
    </GlobalPageHeader>
  </div>
</template>

<script>
import GlobalPageHeader from "../../components/ui/GlobalPageHeader/globalPageHeader.vue";
import ShiftsPage from "./adminPanel/ShiftsPage.vue";
import EsUsersIndex from "./esUsers/index.vue";
import AdderTable from "../../components/adderTable/index.vue";
import DiscountTable from "../AND/index.vue";
import API from "../../services/api";

export default {
  components: {
    GlobalPageHeader,
    EsUsersIndex,
    ShiftsPage,
    AdderTable,
    DiscountTable,
  },
  data() {
    return {
      activeName: "user",
      createButton: null,
      shiftFlag: false,
      fetchShift: false,
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
      this.createButton = this.activeName === "user" ? null : "Create Shift";
    },
    handleButtonClick() {
      this.shiftFlag = this.activeName === "user" ? false : true;
      console.log(this.shiftFlag);
    },

    async getShiftData() {
      const { data } = await API.SHIFTS.FETCH_SHIFTS_DATA();
      console.log(data);
    },
  },

  mounted() {
    this.getShiftData();
  },

  watch: {
    activeName(value) {
      value === "user" ? (this.fetchShift = true) : (this.fetchShift = false);
      console.log(this.fetchShift);
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

.headSection {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  /*padding-bottom: 10px;*/
  /*padding: 20px;*/
  margin: 20px;
  height: 1.5rem;
}

.headContent {
  font-size: 1.125rem;
  font-weight: 100;
  color: #222;
  line-height: 1.2;
}
.el-row {
  margin-bottom: 1rem;
}

.el-tabs {
  margin: 0 20px;
  border-radius: 16px;
}

.el-tabs::v-deep .el-tabs__header {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.el-tabs::v-deep .el-tabs__nav-wrap {
  border-top-left-radius: 16px;
}

.el-tabs::v-deep .el-tabs__content {
  padding: 0;
}

/* .sales-trend {
  height: 100px;
  width: 100px;
} */
#dashboard::v-deep .el-button--primary {
  height: auto;
}
</style>
