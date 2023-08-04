<template>
  <div :class="['container', isCrmUser() ? 'containerCRM': '']">
    <div class="content_section">
      <div class="filter_section">
        <div class="title">Orders</div>
        <!-- <div class="search_field">
            <span
              class="icon search"
              @click="isSearchEnabled = !isSearchEnabled"
            ></span>
            <input
              v-model="search"
              suffix-icon="el-icon-search"
              class="input_field"
              :class="{ isSearchEnabled:isSearchEnabled }"
              type="search"
              placeholder="Search Projects by Name or Created by"
            />
          </div> -->
      </div>
      <div class="favorite_section">
        <div class="tabs_section">
          <el-tabs v-model="activeTab">
            <el-tab-pane
              :label="tab.label"
              :name="tab.label"
              v-for="(tab, index) in tab"
              :key="index"
            >
              <OrdersData :typeOfTab="tab.value" id="1" />
              <template v-slot:label>
                <el-row type="flex" justify="center" align="left">
                  <el-col :span="24">{{ tab.label }}</el-col>
                    <el-col :span="2">
                      <el-tooltip placement="top" v-if=" tab.label !='All'">
                        <i class="el-icon-info" style="font-size: 12px;"></i>
                        <div class="infocontent" slot="content">{{ tab.info }}</div>
                      </el-tooltip>
                    </el-col>
                  </el-row>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { isCrmUser } from "../../../utils";
import OrdersData from "../components/ordersData.vue";
export default {
  components: {
    OrdersData,
  },
  data() {
    return {
      activeTab: "All",
      tab: [
        { label: "All", value: "" },
        { label: "Order Placed", value: "order_placed", info: "The order is received and the team will start working on it." },
        { label: "Incomplete", value: "incomplete", info: "The order is missing the information, provide all information to place the order." },
        { label: "Active", value: "in_process", info: "The order is received and the team has started working on it." },
        { label: "Pending", value: "pending", info: "The orders that are started by the design team but waiting for some information." },
        { label: "Completed", value: "complete", info: "The order has been completed and shipped to you." },
        { label: "Rejected", value: "rejected", info: "The order has been rejected due to missing information or inconsistent information." },
        { label: "Cancelled", value: "cancelled", info: "The order has been cancelled by the user." },
      ],
    };
  },
  created() {
    if (this.$route.params.activeTab === "incomplete") {
      this.activeTab = "Incomplete";
    }
    if (this.$route.params.activeTab === "in_process") {
      this.activeTab = "Active";
    }
     if (this.$route.params.activeTab === "pending") {
      this.activeTab = "Pending";
    }
     if (this.$route.params.activeTab === "complete") {
      this.activeTab = "Completed";
    }
    if (this.$route.params.activeTab === "rejected") {
      this.activeTab = "Rejected";
    }
    if (this.$route.params.activeTab === "cancelled") {
      this.activeTab = "Cancelled";
    }
    if(this.$route.params.activeTab === 'order_placed'){
      this.activeTab = "Order Placed";
    }
  },
  methods: {
    isCrmUser,
  }
};
</script>


<style scoped>
@media (min-width: 1281px) {
  .container {
    width: calc(100% - 260px);
    margin-left: auto;
    background: var(--step-50);
  }

  .containerCRM {
    width: calc(100% - 74px);
  }
}

.content_section {
  padding: 24px;
  min-height: calc(100vh - 100px);
}
@media (max-width: 767px) {
  .content_section {
    overflow: hidden;
  }
}
@media (min-width: 1201px) {
  .content_section {
    padding: 24px 64px;
    background-color: var(--step-50);
  }
}
@media (max-width: 767px) {
  .content_section {
    padding: 24px;
    min-height: calc(100vh - 56px);
  }
}

.content_section .filter_section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 1200px) {
  .content_section .filter_section {
    flex-wrap: wrap;
  }
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.favorite_section {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
  margin-top: 24px;
}
@media (max-width: 1200px) {
  .favorite_section .tabs_section {
    margin: 0;
  }
  .favorite_section .table_section.table_normal table tbody tr {
    padding-right: 16px;
  }
  .favorite_section
    .table_section.table_normal
    table
    tbody
    tr
    td.action-delete {
    position: absolute;
    top: 2px;
    right: 0;
    width: auto;
  }
}
.favorite_section .add_btn {
  margin-top: 16px;
}
.favorite_section .favorite_details {
  padding: 0 24px 24px;
}
@media (max-width: 767px) {
  .favorite_section .favorite_details {
    padding: 0 12px 12px;
  }
}
.favorite_section .favorite_details .search_group {
  display: flex;
  justify-content: flex-end;
  margin: 24px 0;
}
.favorite_section .favorite_details .search_group .search_field {
  max-width: 306px;
  width: 100%;
  margin-right: 12px;
  position: relative;
}
.favorite_section .favorite_details .search_group .search_field .input_field {
  box-sizing: border-box;
  padding-right: 30px;
}
@media (max-width: 767px) {
  .favorite_section .favorite_details .search_group .search_field .input_field {
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 12px;
  }
}
.favorite_section .favorite_details .search_group .search_field .searh-icon {
  position: absolute;
  top: 16px;
  right: 14px;
  color: var(--step-200);
  cursor: pointer;
}
@media (max-width: 767px) {
  .favorite_section .favorite_details .search_group .search_field .searh-icon {
    top: 9px;
    right: 8px;
  }
}
@media (max-width: 767px) {
  .favorite_section .favorite_details .search_group .btn {
    font-size: 12px;
    font-weight: normal;
  }
}

.tabs_section {
  overflow-x: auto;
}
@media (max-width: 767px) {
  .tabs_section {
    margin: 0 -24px;
  }
  .infocontent{
    width: 35vw;
    font-size: 14px;
  }
}
.tabs_section .tabs_list {
  display: flex;
  border-bottom: 1px solid var(--step-100);
  margin-top: 16px;
}
@media (max-width: 767px) {
  .tabs_section .tabs_list {
    margin-top: 16px;
  }
}
.tabs_section .tabs_list li {
  padding: 0 24px;
  position: relative;
  transition: all ease-in-out 0.4s;
  margin-right: 1px;
  cursor: pointer;
}
@media (max-width: 767px) {
  .tabs_section .tabs_list li {
    padding: 0 12px;
  }
}
.tabs_section .tabs_list li span {
  display: inline-block;
  padding: 12px 0;
  color: var(--step-200);
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
}
.tabs_section .tabs_list li:after {
  content: "";
  position: absolute;
  left: 0;
  width: 0;
  bottom: -1px;
  height: 2px;
  background-color: var(--primary);
  transition: all ease-in-out 0.4s;
}
.tabs_section .tabs_list li:hover span,
.tabs_section .tabs_list li.active span {
  color: var(--primary);
}
.tabs_section .tabs_list li:hover:after,
.tabs_section .tabs_list li.active:after {
  width: 100%;
}
.tabs_section .tabs_list li.active {
  pointer-events: none;
}
.tabs_section .tabs_list li.active span {
  font-weight: 500;
}

.fontChange {
  font-size: 18px !important;
  font-weight: 500 !important;
}

.tabs_section .tabs_list {
  margin-top: 5px !important;
}

@media (max-width: 767px) {
  .content_section {
    padding: 24px;
    min-height: calc(100vh - 56px);
    background-color: var(--step-50);
  }
  .tabs_section::-webkit-scrollbar {
    display: none !important ;
  }
}

@media (max-width: 1201px) {
  .content_section {
    background-color: var(--step-50) !important;
  }
}
</style>

<style scoped>
.el-card.is-always-shadow {
  margin-top: 20px !important;
}

.el-tabs__item {
  font-size: 40px !important;
}
.el-tabs__item.is-active {
  color: rgb(255, 0, 0) !important;
  background: green !important;
}
.desktop {
  display: block;
}
.mobile {
  display: none;
}
#tab-firstu {
  color: rgb(255, 0, 0) !important;
  background: green !important;
}
.cardCss {
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid #ccc;
}
.container >>> .el-table__body-wrapper {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 394px);
  overflow-y: scroll;
}

.container >>> .el-tabs__item {
  color: #777777;
  font-size: 18px !important;
  font-weight: 100 !important;
}

.container >>> .el-tabs__item.is-active {
  color: #1c3366 !important;
}

.container >>> .el-tabs__active-bar {
  background-color: #1c3366 !important;
  margin: 0px 24px !important;
}

.container >>> .el-tabs__item:hover {
  color: #1c3366 !important;
  cursor: pointer;
}
.container >>> .el-tabs__nav {
  padding: 6px 24px !important;
}

.search_field {
  margin-right: 0px;
  width: 310px;
  position: relative;
}

.input_field {
  padding-right: 32px;
  transition: all ease-in-out 0.3s;
  box-sizing: border-box;
  z-index: 0;
}

.search{
  position: absolute;
    top: 30%;
    right: 4%;
}

@media screen and (max-width: 600px) {
  .container >>> .el-tabs__active-bar {
    background-color: #1c3366 !important;
    margin: 0px 0px !important;
  }

  .container >>> .el-tabs__nav {
    padding: 6px 0px !important;
  }

  .search_field {
  margin-right: 0px;
  width: 240px;
  position: relative;
}
}
</style>
