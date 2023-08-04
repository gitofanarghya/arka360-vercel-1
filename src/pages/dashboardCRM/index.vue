<template>
  <div id="dashboard">
      <GlobalPageHeader>
        <template v-slot:children >
          <div class="dashboardContainer" style="padding: 10px">
            <el-row :gutter="20"  class="card-row">
              <div class="cardFilter">
                <p class="title" style="padding-left: 10px">Overview</p>
                <!-- <el-dropdown @command="handleCommand" v-if="dashboardData.uncontacted_leads">
                  <span class="el-dropdown-link">
                    {{ selectedFilter
                    }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="Week-to-date">Week-to-date</el-dropdown-item>
                    <el-dropdown-item command="Month-to-date">Month-to-date</el-dropdown-item>
                    <el-dropdown-item command="Quarterly-to-date">Quarterly-to-date</el-dropdown-item>
                    <el-dropdown-item command="Year-to-date">Year-to-date</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown> -->
              </div>
              <el-col
                v-for="card in cardData"
                :xs="24"
                :sm="12"
                :md="12"
                :lg="6"
                :xl="6"
                :key="card.title"
              >
                <card-component
                  :title="card.title"
                  :icon="card.icon"
                  :iconUrl="card.iconUrl"
                  :value1="card.value1"
                  :value2="card.value2"
                  :themeColor="card.themeColor"
                  :secondaryColor="card.secondaryColor"
                  :unit="card.unit"
                  :percentage="+card.percentage"
                  :percentageChange="+card.percentageChange"
                  v-if="dashboardData.uncontacted_leads"
                ></card-component>
                <Skeleton :height="'15vh'" v-else />
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                <BarGraph
                  v-if="dashboardData.sales_trend"
                  :apiData="dashboardData.sales_trend"
                  :barName="'Sales Trend'"
                  :titleY="'No. of Sales'"
                  :ticks="3"
                />
                <Skeleton v-else />
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                <BarGraph
                  v-if="dashboardData.sales_trend"
                  :apiData="dashboardData.sales_trend"
                  :barName="'Revenue'"
                  :titleY="currency"
                  :color="'#F88227'"
                  :ticks="5"
                  :minAxis="2000"
                  :minTicks="5"
                />
                <Skeleton v-else />
              </el-col>
            </el-row>
            <!-- <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                <SalesTrends
                  v-if="dashboardData.sales_trend"
                  :data="dashboardData.sales_trend"
                />
                <Skeleton v-else />
              </el-col>
              <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                <RevenueChart
                  v-if="dashboardData.sales_trend"
                  :apiData="dashboardData.revenue"
                />
                <Skeleton v-else />
              </el-col>
            </el-row> -->
  
            <!-- <el-row>
              <el-col :span="24">
                <TaskActivity />
              </el-col>
            </el-row> -->
            <!-- <el-row :gutter="20">
                          <el-col :span="12">
                              <el-card class="box-card">
                                  <Timeline />
                              </el-card>
                          </el-col>
                      </el-row>
                      <el-row>
                          <el-col :span="12">
                              <div class="grid-content bg-purple">
                                  <LeadsTable :data="tableData" :headers="header1">
                                      <el-table-column prop="status" label="Status">
                                          <template slot-scope="scope">
                                              <el-tag :type="scope.row.status === 'Open' ? 'primary' : 'success'"
                                                  disable-transitions>{{
                                                      scope.row.status
                                                  }}</el-tag>
                                          </template>
                                      </el-table-column>
                                  </LeadsTable>
                              </div>
                          </el-col>
                      </el-row> -->
            <el-row :gutter="20" class="grid">
              <div class="lower-container" style="display: flex">
                <el-col
                  :xs="24"
                  :sm="12"
                  :md="12"
                  :lg="12"
                  :xl="12"
                  style="height: 100%"
                >
                  <div style="height: 100%">
                    <BarGraph
                      v-if="dashboardData.deals_by_stage"
                      :apiData="dashboardData.deals_by_stage"
                      :reverseAxis="true"
                      :barName="'Deals Amount By Stage'"
                      :switchBtn="true"
                      :titleY="'Stage'"
                      :ticks="5"
                    />
                    <!-- <DealsAmountByStage style="height:50%"
                    v-if="dashboardData.deals_by_stage"
                    :data="dashboardData.deals_by_stage"
                  /> -->
                    <BarGraph
                      v-if="dashboardData.leads_by_source"
                      :apiData="dashboardData.leads_by_source"
                      :barName="'Leads By Source'"
                      :titleY="'No. of Leads'"
                      :reverseAxis="true"
                      :color="'#F88227'"
                      style="margin-top: 20px"
                      :ticks="10"
                    />
                    <!-- <LeadsBySource
                    style="margin-top: 20px; max-height: 50%"
                    :graphData="leads_by_source"
                    v-if="dashboardData.leads_by_source"
                  /> -->
                    <Skeleton v-else />
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div style="height: 100%">
                    <LeadsTable
                      v-if="dashboardData.potential_deals"
                      :data="dashboardData.potential_deals"
                      :headingText="'Potential Deals to Close'"
                    >
                    </LeadsTable>
                    <Skeleton v-else />
                  </div>
                </el-col>
              </div>
            </el-row>
          </div>
        </template>
      </GlobalPageHeader>
    </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import CardComponent from "./components/CardComponent.vue";
import LeadsBySource from "./components/LeadsBySourceGraph.vue";
import LeadsTable from "./components/LeadsTable.vue";
import Timeline from "./components/timeline.vue";
import DealsAmountByStage from "./components/dealsAmountByStageGraph/DealsAmountByStageGraph.vue";
import GlobalPageHeader from "../../components/ui/GlobalPageHeader/globalPageHeader.vue";
import Skeleton from "./components/models/Card/Skeleton.vue";
import BarGraph from "./components/BarGraph.vue";
//import TaskActivity from "./components/TaskActivity.vue";
import API from "../../services/api";
import emptyData from "./static/emptyData"
import { fetchOrganisationId } from "@/utils.js";

export default {
  components: {
    Navbar,
    Sidebar,
    CardComponent,
    LeadsTable,
    Timeline,
    LeadsBySource,
    DealsAmountByStage,
    GlobalPageHeader,
    Skeleton,
    BarGraph,
    //TaskActivity,
  },
  data() {
    return {
      isError: false,
      currency: false,
      isSidebarOpen: false,
      selectedFilter: "Week-to-date",
      dashboardData: {},

      cardData: {},
      tableData: [
        {
          phoneNo: "(405)555-0122",
          name: "Tom Hanks",
          email: "Tom@gmail.com",
          status: "Open",
          amount: 5000,
        },
        {
          phoneNo: "(405)555-0122",
          name: "Tom",
          email: "Tom@gmail.com",
          status: "Closed",
          amount: 5000,
        },
        {
          phoneNo: "(405)555-0122",
          name: "",
          email: "Tom@gmail.com",
          status: "Open",
          amount: 5000,
        },
        {
          phoneNo: "(405)555-0122",
          name: "Tom",
          email: "Tom@gmail.com",
          status: "Open",
          amount: 5000,
        },
        {
          phoneNo: "(405)555-0122",
          name: "",
          email: "Tom@gmail.com",
          status: "Open",
          amount: 5000,
        },
        {
          phoneNo: "(405)555-0122",
          name: "Tom",
          email: "Tom@gmail.com",
          status: "Open",
          amount: 5000,
        },
      ],
    };
  },
  methods: {
    getUrl(url) {
      return new URL(`/src/assets/img/${url}`, import.meta.url).href;
    },
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    async getGraphsData() {
      try {
        //throw new 'Error'
        let { data } = await API.CRM_DASHBOARD.FETCH_CRM_DASHBOARD_DATA(
          fetchOrganisationId()
        );
        this.dashboardData = data;
        this.createCardData(
          this.dashboardData.uncontacted_leads?.this_week,
          this.dashboardData.contacted_leads?.this_week,
          this.dashboardData?.open_deals?.this_week,
          this.dashboardData.closed_sales?.this_week
        );
        this.isError = false;

      } catch (err) {
        this.dashboardData = JSON.parse(emptyData)
        this.createCardData(
          this.dashboardData.uncontacted_leads?.this_week,
          this.dashboardData.contacted_leads?.this_week,
          this.dashboardData?.open_deals?.this_week,
          this.dashboardData.closed_sales?.this_week
        );
        this.$message({
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: "There was an error while fetching the data. <br> Close to refresh the page ",
          type: "error",
          center: true,
          duration: 10000,
          onClose: ()=> {
            location.reload();
          }
        });
      }
    },
    handleCommand(command) {
      this.selectedFilter = command;
    },

    createCardData(unContacted, contactedLeads, openDeals, closedSales) {
      const dataChart = [
        {
          title: "Uncontacted Leads",
          icon: "tickets",
          iconUrl: this.getUrl(`userIcon.svg`),
          value1:
            unContacted.count === null || undefined ? 0 : unContacted.count,
          value2: 35,
          themeColor: " #E6FFFD",
          secondaryColor: "#B799FF",
          unit: "integer",
          percentage: unContacted.percentage.toFixed(1),
          percentageChange: unContacted.percentage_change.toFixed(1),
        },
        {
          title: "Contacted Leads",
          icon: "coffee-cup",
          iconUrl: this.getUrl(`pointerIcon.svg`),
          value1:
            contactedLeads.count === null || undefined
              ? 0
              : contactedLeads.count,
          value2: 35,
          themeColor: "#FDEEDC",
          secondaryColor: "#E57C23",
          unit: "integer",
          percentage: contactedLeads.percentage.toFixed(1),
          percentageChange: contactedLeads.percentage_change.toFixed(1),
        },
        {
          title: "Open Deals",
          icon: "user-solid",
          iconUrl: this.getUrl(`checklistIcon.svg`),
          value1: openDeals.count === null || undefined ? 0 : openDeals.count,
          value2: 35,
          themeColor: "#E1FFB1",
          secondaryColor: "#AAC8A7",
          unit: "dollar",
          percentage: openDeals.percentage.toFixed(1),
          percentageChange: openDeals.percentage_change.toFixed(1),
        },
        {
          title: "Closed Sales",
          icon: "document-copy",
          iconUrl: this.getUrl(`moneyIcon.svg`),
          value1:
            closedSales.count === null || undefined ? 0 : closedSales.count,
          value2: 35,
          themeColor: "#E5BEEC",
          secondaryColor: "#9384D1",
          unit: "dollar",
          percentage: closedSales.percentage.toFixed(1),
          percentageChange: closedSales.percentage_change.toFixed(1),
        },
      ];
      return (this.cardData = dataChart);
    },
    fetchOrganisationId,
  },
  created() {
    this.getGraphsData();
    this.currency = JSON.parse(localStorage.getItem("user")).isUSFlagEnabled
      ? "USD"
      : "INR";
  },

  watch: {
    selectedFilter(newVal) {
      switch (newVal) {
        case "Year-to-date":
          this.createCardData(
            this.dashboardData.uncontacted_leads?.this_year,
            this.dashboardData.contacted_leads?.this_year,
            this.dashboardData?.open_deals?.this_year,
            this.dashboardData.closed_sales?.this_year
          );
          break;
        case "Week-to-date":
          this.createCardData(
            this.dashboardData.uncontacted_leads?.this_week,
            this.dashboardData.contacted_leads?.this_week,
            this.dashboardData?.open_deals?.this_week,
            this.dashboardData.closed_sales?.this_week
          );
          break;
        case "Month-to-date":
          this.createCardData(
            this.dashboardData.uncontacted_leads?.this_month,
            this.dashboardData.contacted_leads?.this_month,
            this.dashboardData?.open_deals?.this_month,
            this.dashboardData.closed_sales?.this_month
          );
          break;
        case "Quarterly-to-date":
          this.createCardData(
            this.dashboardData.uncontacted_leads?.quarter,
            this.dashboardData.contacted_leads?.quarter,
            this.dashboardData?.open_deals?.quarter,
            this.dashboardData.closed_sales?.quarter
          );
          break;
      }
    },
  },
  computed: {
    leads_by_source() {
      //console.log(this.dashboardData.leads_by_source);
      return this.dashboardData.leads_by_source;
    },
  },
};
</script>

<style scoped>
.dashboardContainer {
  margin-left: 10px;
  margin-top: 10px;
  padding: 10px;
  max-height: calc(100vh - 119px);
  overflow: scroll;
}

#dashboard {
  width: 100%;
  height: 100%;
}

.el-row {
  margin-bottom: 1rem;
}

.cardFilter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.el-dropdown-link {
  padding: 5px;
  border-radius: 5px;
  border: 0.5px solid rgb(205, 205, 205);
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
}

.el-icon-arrow-down {
  font-size: 12px;
  margin-left: 20px;
}
/* .grid {
  height: 115vh;
} */
/* @media screen and (min-height: 750px) {
  .grid {
    height: 106vh;
  }
} */
@media screen and (max-width: 768px) {
  .el-col {
    margin-bottom: 15px;
  }
  .grid {
    height: 100%;
  }
  .lower-container {
    /*flex-direction: column;*/
    flex-flow: row wrap;
  }
  .dashboardContainer[data-v-08c65831] {
    margin-right: 5px;
    margin-left: 5px;
    margin-top: 10px;
    padding: 10px;
    max-height: calc(100vh - 119px);
    overflow: scroll;

  }
}
.error-container{
  height: 100%;
  max-width: 100vh;
  display: flex;
  flex-direction: column;
  margin: 20vh auto 0;
}
@media only screen and (max-width: 1200px){
  .card-row{
    margin-bottom: 0;
  }
}
</style>
