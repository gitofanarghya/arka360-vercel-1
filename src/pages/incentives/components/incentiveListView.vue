<template>
  <div id="incentiveList" v-if="isActive" class="manage_details">
    <div
      class="header_details"
      v-if="filteredList.length > 0 || searchText.length > 0"
    >
      <div class="search_group">
        <div
          class="addition_form"
        >
          <div class="field_group">
            <input
              class="input_field"
              type="text"
              placeholder="Search Incentive"
              v-model="searchText"
              style="border-radius: 4px !important; padding-right: 37px;"
            />
            <i
              class="el-icon-search"
              v-if="searchText===''"
            ></i>
             <i
              v-else
              @click="searchText=''"
              class="el-icon-close"
            ></i>
          </div>
          <!-- <button
            class="btn btn-primary"
            @click="getIncentives()"
            data-toggle="modal"
            data-target="#make_panel"
          >
            Get API
          </button> -->

          <button
            class="btn btn-primary"
            @click="addIncDialogFormVisible = true"
            data-toggle="modal"
            data-target="#make_panel"
            v-if="isPermitted"
          >
            Create Incentive
          </button>
        </div>
        <div class="not-valid">{{ errors.first("min-filter") }}</div>
        <div class="not-valid">{{ errors.first("max-filter") }}</div>
      </div>
    </div>
    <div
      class="table_section table_normal"
      :style="[
        window.width >= 1200
          ? { 'margin-top': '0', height: `64vh` }
          : {height: `64vh`,},
      ]"
      style="border:0;"
    >
      <div
        class="centreIncentive"
        v-if="!isPermitted && filteredList.length == 0"
      >
        <p>
          The admin has not added any incentives yet. Please contact admin to
          add incentives in organisation settings.
        </p>
      </div>
      <div
        class="centreIncentive"
        v-if="
          filteredList.length === 0 && searchText.length === 0 && isPermitted
        "
      >
        <p>
          You have not created any financial incentives, click below button to
          add incentive.
        </p>
        <button
          class="btn btn-primary"
          @click="addIncDialogFormVisible = true"
          style="margin:1rem;"
        >
          Create Incentive
        </button>
      </div>
      <table class="data_table" v-else>
        <thead style="position:sticky; top:-1px;">
          <tr>
            <th class="incHead">Name</th>
            <th class="incBody" style="padding-left: 12px;" v-if="window.width >= 767 && isPermitted">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredList"
            :key="item.id"
            :style="[
              window.width <= 767
                ? { display: 'grid', 'grid-template-columns': '95% 5%' }
                : {},
            ]"
          >
            <td style="width:90%;">
              <div class="incentiveName">{{ item.name }}</div>
              <div class="value_type" style="word-break:keep-all;">
                {{ item.description }}
              </div>
            </td>
            <td class="text-center action-delete" v-if="window.width >= 767" style="text-align: justify;">
              <i
                class="icon copy-alt"
                @click="handleCopy(item.id)"
                v-if="isPermitted"
              />
              <i
                  :style="[
                    item.organisation == null || item.organisation!=userOrganisation
                      ? { cursor: 'not-allowed', color: '#bbbaba' }
                      : { cursor: 'pointer', opacity: '1' },
                  ]"
                class="icon edit-alt"
                style="font-size: 1.7rem;"
                @click="handleEdit(item)"
                v-if="isPermitted"
              />
              <i
                 :style="[
                    item.organisation == null || item.organisation!=userOrganisation
                      ? { cursor: 'not-allowed', color: '#bbbaba'  }
                      : { cursor: 'pointer', opacity: '1' },
                  ]"
                class="icon delete-alt"
                @click="handleDelete(item)"
                v-if="isPermitted"
              />
            </td>
            <td v-else>
              <el-dropdown
                trigger="click"
                v-if="isPermitted"
                @command="handleCommand"
              >
                <span class="el-dropdown-link">
                  <span data-v-12684b02="" class="fas fa-ellipsis-v"></span>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    icon="icon copy-alt"
                    :command="{ name: 'copy', id: `${item.id}` }"
                    >Copy</el-dropdown-item
                  >
                  <el-dropdown-item
                    :style="[
                        item.organisation == null || item.organisation!=userOrganisation
                          ? { cursor: 'not-allowed', opacity: '0.6' }
                          : { cursor: 'pointer', opacity: '1' },
                      ]"
                    icon="icon edit-alt"
                    :command="{ name: 'edit', id: `${item.id}` }"
                    >Edit</el-dropdown-item
                  >
                  <el-dropdown-item
                     :style="[
                          item.organisation == null || item.organisation!=userOrganisation
                            ? { cursor: 'not-allowed', opacity: '0.6' }
                            : { cursor: 'pointer', opacity: '1' },
                        ]"
                    icon="icon delete-alt"
                    :command="{ name: 'delete', id: `${item.id}` }"
                    >Delete</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </td>
          </tr>
        </tbody>
        <tbody>
             <tr class="empty-list" v-if="allIncentives==0">
                       <td colspan="6">
                         <div class="create_list" >
                           <div class="info_content">
                              <p class="searcNotFound">
                                 Sorry, no result found.
                             </p>
                           </div>
                         </div>
                       </td>
                     </tr>
          </tbody>
      </table>

      <div
        v-if="allIncentives.length"
        v-observe-visibility="handleScrollBottom"
        style="text-align: center"
      >
        <i
          v-if="loading"
          class="el-icon-loading infiniteScrollLoader"
          style="margin:1rem;"
        />
      </div>
    </div>
    <AddIncentive
      :addIncDialogFormVisible="addIncDialogFormVisible"
      @close="handleClose()"
      :key="counter"
    />
    <EditIncentive
      :editDialogFormVisible="editDialogFormVisible"
      @update="updated()"
      @close="closeEdit()"
      :incentive_id="incentive_id"
    />
    <CopyIncentive
      :copyDialogFormVisible="copyDialogFormVisible"
      @close="closeCopy()"
      @update="addCopy()"
      :incentive_id="incentive_id"
    />
    <DeleteIncentive
      v-if="deleteDialogFormVisible"
      :deleteDialogFormVisible="deleteDialogFormVisible"
      @close="incDelete()"
      @cancelDelete="deleteDialogFormVisible = false"
      :incentive_id="incentive_id"
    />
  </div>
</template>

<script>
import Vue from "vue";
import { mapActions } from "pinia";
import { useGeographyStore } from "../../../stores/geography";
import API from "@/services/api/";
import debounce from "debounce";
import AddIncentive from "./addIncentive.vue";
import VueObserveVisibility from "vue-observe-visibility";
import EditIncentive from "./editIncentive.vue";
import CopyIncentive from "./copyIncentive.vue";
import DeleteIncentive from "./deleteIncentive.vue";
Vue.use(VueObserveVisibility);

export default {
  props: {
    isActive: {
      type: Boolean,
      default: true,
    },
    adminMode: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    AddIncentive,
    EditIncentive,
    DeleteIncentive,
    CopyIncentive,
  },

  data() {
    return {
      counter: 0,
      window: {
        width: 0,
        height: 0,
      },
      searchText: "",
      loading: true,
      incentive_id: null,
      totalIncentives: null,
      addIncDialogFormVisible: false,
      centerDialogVisible: false,
      editDialogFormVisible: false,
      deleteDialogFormVisible: false,
      copyDialogFormVisible: false,
      incentiveType: "",
      form: {
        name: "",

        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
      },
      allIncentives: [],
      formLabelWidth: "120px",
      incentives: [
        {
          name: "Incentive Name 1",
          summary:
            "The system owner will receive ₹0 in the form of a cash grant. The revenue from this incentive is not taxed.",
        },
        {
          name: "Incentive Name 2",
          summary:
            "The system owner will receive ₹0 in the form of a cash grant. The revenue from this incentive is not taxed.",
        },
        {
          name: "Incentive Name 3",
          summary:
            "The system owner will receive ₹0 in the form of a cash grant. The revenue from this incentive is not taxed.",
        },
        {
          name: "Incentive Name 4",
          summary:
            "The system owner will receive ₹0 in the form of a cash grant. The revenue from this incentive is not taxed.",
        },
      ],
      isScrollStateToBeReset: null,
      scrollState: "",
      msg: " I am in module Inventory",
      labelPosition: "left",
      styleSearchButton:
        "el-icon-search button-light-theme-icons searchButtonStyleAddition",
      styleDeleteButton:
        "el-icon-delete button-light-theme-icons deleteButtonStyleAddition",
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
      innerIdToOuterIdMap: {},
      window: {
        width: 0,
        height: 0,
      },
    };
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.searchIncentives = debounce(this.searchIncentives, 1000);
    this.fetchCountryDetails();
  },
  watch: {
    searchText: {
      handler(val) {
        this.searchIncentives(val);
      },
    },
  },
  computed: {
    userOrganisation(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.organisation_id;
    },
    
    isPermitted() {
      if (!this.isAdmin && !this.adminMode) {
        return false;
      }
      return true;
    },
    windowWidth() {
      return screen.width;
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.role == "ADMIN") {
        return true;
      }
      return false;
    },
    filteredList() {
      // return this.allIncentives.filter((str) =>
      //   str.name.toLowerCase().includes(this.searchText.toLowerCase())
      // );
      return this.allIncentives;
    },
  },

  mounted() {
    this.getIncentives();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    ...mapActions(useGeographyStore, {
      fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
    }),
    async searchIncentives(value) {
      let response = await API.INCENTIVE_INFORMATION.SEARCH_ALL_INCENTIVES(
        value
      );
      this.allIncentives = response.data.results;
    },
    handleCommand(command) {
      if (command.name === "edit") {
        this.handleEdit(command.id);
      } else if (command.name === "copy") {
        this.handleCopy(command.id);
      } else if (command.name === "delete") {
        this.handleDelete(command.id);
      }
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    updated() {
      this.editDialogFormVisible = false;
      this.getIncentives();
    },
    closeEdit() {
      this.editDialogFormVisible = false;
    },
    addCopy() {
      this.copyDialogFormVisible = false;
      this.getIncentives();
    },
    closeCopy() {
      this.copyDialogFormVisible = false;
    },
    incDelete() {
      this.getIncentives();
      this.deleteDialogFormVisible = false;
    },
    handleClose() {
      this.getIncentives();
      this.addIncDialogFormVisible = false;
      this.counter++;
    },
    handleDelete(item) {
      if(item.organisation)
      { 
        this.incentive_id = item.id;
        this.deleteDialogFormVisible = true;
      }
    },
    handleEdit(item) {
      if(item.organisation)
      {
          this.incentive_id = item.id;
          this.editDialogFormVisible = true;
      }
    },
    handleCopy(itemId) {
      this.incentive_id = itemId;
      this.copyDialogFormVisible = true;
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }

      if (this.nextUrl) {
        this.getMoreIncentives();
      } else {
        this.loading = false;
      }
    },
    loadMoreIncentives() {
      if (this.nextUrl !== null) {
        this.busy = true;
        this.loadMoreIncentivesHelper();
      }
    },
    async loadMoreIncentivesHelper() {
      try {
        const response = await API.INCENTIVE_INFORMATION.LOAD_MORE_INCENTIVES(
          this.nextUrl
        );
        this.assignAPIResponse(response);
        this.busy = false;
      } catch (error) {
        console.error();
      }
    },
    async deleteIncentive(itemId) {
      try {
        await API.INCENTIVE_INFORMATION.DELETE_INCENTIVE(itemId);

        this.$message({
          showClose: true,
          message: "Design deleted successfully.",
          type: "success",
          center: true
        });
        this.getIncentives();
      } catch (e) {
        this.$message({
          showClose: true,
          message: "Error deleting the incentive. Try again.",
          type: "error",
          center: true
        });
      }
      this.centerDialogVisible = false;
    },

    async getMoreIncentives() {
      let moreIncentives = await API.INCENTIVE_INFORMATION.LOAD_MORE_INCENTIVES(
        this.nextUrl
      );
      this.allIncentives.push(...moreIncentives.data.results);
      this.nextUrl = moreIncentives.data.next;
    },
    async getIncentives() {
      try {
        const response = await API.INCENTIVE_INFORMATION.FETCH_INCENTIVES();
        this.totalIncentives = response.data.count;
        this.nextUrl = response.data.next;
        this.allIncentives = response.data.results;
        // while (nextPage) {
        //   let nextResponse = await API.INCENTIVE_INFORMATION.LOAD_MORE_INCENTIVES(
        //     nextPage
        //   );
        //   this.allIncentives = this.allIncentives.concat(
        //     nextResponse.data.results
        //   );
        //   nextPage = nextResponse.data.next;
        // }

        // console.log(this.allIncentives);
      } catch (error) {
        console.log(error);
       
      }
    },
    maintainScrollState() {
      if (this.isScrollStateToBeReset) {
        this.scrollState.reset();
        this.isScrollStateToBeReset = null;
      }
    },
  },
};
</script>

<style scoped>
/* @import url(../styles/styles.css); */

.centreIncentive {
  text-align: center;
  margin: 159px;
}
.searcNotFound{
  font-size: 16px;
}
.empty-list {
  justify-content: center;
}
.el-icon-search{
cursor:pointer;
position: absolute; 
right: 20px;
top: 33%;
}
.el-icon-close{
cursor:pointer;
position: absolute; 
right: 20px;
top: 33%;
}
tr {
  border-bottom: 1px solid #ccc;
}
.header_details {
  border-bottom: 2px solid #ccc;
  height: auto;
}
.header_details .search_group {
  margin-left: auto;
  margin-bottom: 10px;
}
.icon {
  font-size: 1.5rem;
}
.infiniteScrollLoader {
  font-size: 20px;
}
.not-valid {
  margin-top: -13px;
  font-size: 13px;
  color: red;
  margin-bottom: 13px;
}

.gridView {
  display: flex;
  width: 100%;
  flex-direction: column;
}
.gridItem {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

.incentiveName {
  width: -webkit-fill-available;
  height: auto;
  margin: 2;
  margin: 0 0rem 0.5rem 0;
  /* margin: 25px 724px 7px 0; */
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  /* line-height: 2; */
  letter-spacing: normal;
  text-align: left;
  color: #222;
}
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 8px #f5f7fa;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #b30000;
}
#incentiveList  .incHead {
  color: #222;
  font-weight: 600;
  width: 90%;
  font-size: 14px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  width: 90%;
}
#incentiveList >>> .incBody {
  color: #222;
  font-weight: 600;
  font-size: 14px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  width: 10%;
}
#incentiveList >>> .incBody {
  color: #222;
  font-weight: 600;
  font-size: 14px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  width: 10%;
}



#incentiveList >>> .floating-label label {
  font-family: "Helvetica Neue";
  font-size: 14px !important;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 0.5;
  letter-spacing: normal;
  text-align: left;
  color: #777 !important;
  color: var(--step-200);
  font-size: 14px !important;
  font-weight: normal;
  position: absolute;
  /* pointer-events: none; */
}

#incentiveList >>> .value_type {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

@media (min-width: 1024px) {
  .header_details {
    border-bottom: 2px solid #ccc;
    height: 65px;
  }
}

@media (max-width: 767px) {
  #incentiveList >>> .el-icon-search {
    position: absolute;
    right: 20px;
    top: 50% !important;
  }
  #incentiveList >>> .header_details .search_group .addition_form {
    display: grid;
    grid-template-columns: 60% 40%;
  }
}
@media (min-width: 767px) and (max-width: 1023px) 
{
.header_details .search_group .addition_form .btn {
    display: inline-block;
    margin-top: 12px;
    margin-bottom: 8px;
}
.input_field {
    margin-top: 12px;
    margin-bottom: 8px;
}

.el-icon-search{
  top: 40% !important;
}
}

@media (max-width: 767px) 
{
  .header_details .search_group .addition_form .btn {
    margin-top: 12px;
    margin-bottom: 8px;
    display: inline-block;
    margin-left: 12px;
}
}

@media (max-width: 450px) {
    #incentiveList >>> .header_details .search_group .addition_form {
    display: grid;
    grid-template-columns: 50% 50%;
  }
}

</style>
