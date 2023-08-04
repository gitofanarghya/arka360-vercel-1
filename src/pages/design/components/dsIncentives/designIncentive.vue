<template>
  <div class="card">
    <div :class="{
      'card_header':!isOnLeadSummaryPage,
      'flex_header':!isOnLeadSummaryPage,
      'incentive-header':isOnLeadSummaryPage
    }">
      <h4>Incentives</h4>
      <div class="button_action" v-if="updatedList.length >= 1">
        <ul class="action_list" v-if="designId">
          <li>
            <button
              class="btn el-icon-circle-plus-outline"
              @click="addIncDialogFormVisible = true"
              style="font-size:16px !important;"
              v-if="isPermitted"
            >
              <!-- <span class="el-icon-circle-plus-outline"></span> -->
              <div class="cniHead">
                Create New Incentive
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div class="" :class="{
      'card_content':!isOnLeadSummaryPage,
      'card_content_CRM':isOnLeadSummaryPage
      }"
      style="padding-bottom: 0;">
      <div
        class="add_price_td"
        style="margin-bottom:2rem;"
        v-if="updatedList.length == 0 && updatedTotal == 0"
        v-loading="isLodingDone" 
      >
        <div style="margin-bottom:1rem;" v-if="isPermitted">
          You have not created any incentives yet. Click below button to create
          incentive.
        </div>
        <div style="margin-bottom:1rem;" v-if="!isPermitted">
          The admin has not added any incentives yet. Please contact admin to
          add incentives in organisation settings.
        </div>
        <button
          class="btn btn-primary createButton"
          @click="addIncDialogFormVisible = true"
          data-toggle="modal"
          data-target="#weather_station"
          v-if="isPermitted && designId"
        >
          Create New Incentive
        </button>
      </div>
      <div
        class="add_price_td"
        style="margin-bottom:2rem;"
        :style="[
          designId
            ? {}
            : { 'text-align' : 'center'},
        ]"
        v-if="updatedList.length == 0 && updatedTotal >= 1"
        v-loading="isLodingDone"
      >
      <!-- class="btn btn-primary createButton"
          type="button" -->
      <el-tooltip
        :disabled="!isCrmUser() || projectPermissionObject.edit_design"
        effect="dark"
        placement="top-start"
        :content="'You dont have permission to change design information.'"
      >
        <span>
          <button
            class="btn btn-primary createButton"
            type="button"
            :disabled="isCrmUser() && !projectPermissionObject.edit_design"
            @click="addIncDialogFormVisible = true"
            data-toggle="modal"
            data-target="#weather_station"
            v-if="isPermitted && designId"
          >
            Create New Incentive
          </button>
        </span>
      </el-tooltip>

      <el-tooltip
        :disabled="!isCrmUser() || projectPermissionObject.edit_design"
        effect="dark"
        placement="top-start"
        :content="'You dont have permission to change design information.'"
      >
        <span>
          <button
            class="btn btn-primary selectButton"
            type="button"
            :disabled="isCrmUser() && !projectPermissionObject.edit_design"
            @click="selectDialogFormVisible = true"
            data-toggle="modal"
            data-target="#weather_station"
          >
            Select Incentive
          </button>
        </span>
      </el-tooltip>

      </div>
      <AddIncentive
        :addIncDialogFormVisible="addIncDialogFormVisible"
        @close="currValues()"
        :key="counter"
      />
      <div :class="{'table_section':!isOnLeadSummaryPage,'table_normal':!isOnLeadSummaryPage,'incentive_table':isOnLeadSummaryPage} ">
        <table :class="{
          'data_table':!isOnLeadSummaryPage,
          'incentive_data_table':isOnLeadSummaryPage
        }">
          <tr v-for="incentive in updatedList" :key="incentive.id">
            <td style="width:100%;">
              <div class="incentiveName">{{ incentive.name }}</div>
              <div class="value_type">
                {{ incentive.description }}
              </div>
            </td>
            <td :class="{'incentive_actin_icons':isOnLeadSummaryPage,'text-center':!isOnLeadSummaryPage,'action-delete':!isOnLeadSummaryPage}">
              <i 
                class="icon copy-alt" 
                @click="handleCopy(incentive.id)" 
                v-if="isPermitted && designId"
              />
              <i
                :class="designId ? 'icon delete-alt' : 'el-icon-close' "
                @click="handleDelete(incentive)"
                v-if="isPermitted"
              />
             <i
                class="icon edit-alt"
                @click="handleEdit(incentive)"
                v-if="isPermitted && designId"
              />
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div :class="{
          'incentive-footer':isOnLeadSummaryPage,
          'card__footer':!isOnLeadSummaryPage
        }" v-if="updatedList.length >= 1">
      <button
        class="btn el-icon-circle-plus-outline footerBtn"
        @click="selectDialogFormVisible = true"
        type="button"
      >
        <!-- <span class="el-icon-circle-plus-outline"></span> -->
        <div style="margin-left:0.5rem;">
          Select New Incentive
        </div>
      </button>

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
    </div>
    <SelectIncentive
      :designId="designId"
      :selectedIncentivesData="selectedIncentivesData"
      :selectDialogFormVisible="selectDialogFormVisible"
      @close="handleClose()"
      @added="handleAdd"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia"
import { useDesignStore } from "../../../../stores/design";
import { useProjectStore } from "../../../../stores/project";

import AddIncentive from "../../../incentives/components/addIncentive.vue";
import SelectIncentive from "./selectIncentive.vue";
import EditIncentive from "../../../incentives/components/editIncentive.vue";
import CopyIncentive from "../../../incentives/components/copyIncentive.vue";
import API from "@/services/api/";
import { isCrmUser } from "../../../../utils";
// const { mapGetters } = createNamespacedHelpers('design');


export default {
  name: "designFinancialView",
  emits: ["update", "updatedIncentivesList"],
  props: {
    selectedIncentivesData: {
      default: () => [],
    },
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
    SelectIncentive,
    EditIncentive,
    CopyIncentive,
  },
  watch: {
    selectDialogFormVisible: {
      handler(val) {},
    },
  },
  data() {
    return {
      msg: "I am in designIncentive",
      counter: 0,
      isLoaded: false,
      selectedIncentives: [],
      selectedIncentivesList: [],
      totalIncentives: null,
      editDialogFormVisible: false,
      incentive_id: null,
      addIncDialogFormVisible: false,
      copyDialogFormVisible: false,
      selectDialogFormVisible: false,
      isOnLeadSummaryPage: this.$route.name.includes("leadSummary"),
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
    };
  },
  async created() {
    let response = await API.INCENTIVE_INFORMATION.FETCH_INCENTIVES();
    this.totalIncentives = response.data.count;
  },
  mounted() {
    // this.getIncentives();
   
    this.getIncentiveFromStore();
  },
  computed: {
    ...mapState(useDesignStore, {
      incentivesData: 'GET_DESIGN_INCENTIVES_INFORMATION',
      isDesignLoaded: state => state.isDesignLoaded,
      designDataFull: (state) => state
    }),
    ...mapState(useProjectStore, {
        projectPermissionObject: 'GET_PERMISISON_OBJECT',
    }),
    isLodingDone() {
      if (this.designId) {
        return !this.isDesignLoaded || !this.isLoaded;
      } else {
        return !this.isLoaded;
      }
    },
    designId() {
      return this.$route.params.designId || this.designDataFull.id
    },
    updatedList() {
      return this.selectedIncentivesList;
    },
    updatedTotal() {
      return this.totalIncentives;
    },
    isPermitted() {
      if (!this.isAdmin && !this.adminMode)
      {
        return false;
      }
      return true;
    },
   isAdmin() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.role == "ADMIN") {
        return true;
      }
      return false;
    },
  },
  methods: {
    ...mapActions(useDesignStore, {
      SET_DESIGN: 'SET_DESIGN',
    }),
    closeCopy() {
      this.copyDialogFormVisible = false;
      // this.getIncentives();
    },
    async updateCopy(value) {
      this.selectedIncentives = this.updatedList.map((a) => a.id);
      this.selectedIncentives.push(value);
      const response = await API.INCENTIVE_INFORMATION.UPDATE_ADDED_INCENTIVE_LIST(
        { incentives: this.selectedIncentives },
        this.designId
      );
      this.getIncentives();
      this.copyDialogFormVisible = false;
    },
    async handleCopy(itemId) {
      this.incentive_id = itemId;
      this.copyDialogFormVisible = true;
      // console.log("itemId", this.incentive_id);
      // this.getIncentives();
    },
    async handleEdit(item) {
        this.incentive_id = item.id;
        this.editDialogFormVisible = true;
    },
    async handleDelete(item) {
      this.isLoaded = false;
        this.selectedIncentivesList = this.selectedIncentivesList.filter(function(
          obj
        ) {
          return obj.id !== item.id;
        });
        // console.log(this.selectedIncentivesList);
        this.selectedIncentives = this.selectedIncentivesList.map((a) => a.id);
        if(this.designId){
          const response = await API.INCENTIVE_INFORMATION.UPDATE_ADDED_INCENTIVE_LIST(
            { incentives: this.selectedIncentives },
            this.designId
          );
        }else{
          this.$emit("update", this.selectedIncentivesList);
          let resp = await API.INCENTIVE_INFORMATION.SELECT_MULTIPLE_INCENTIVES_FROM_EXPERT_SERVICE(
            {
              incentives: this.selectedIncentives,
            }
          )
          
          // console.log("response",resp)
        }
        this.getIncentives(this.selectedIncentivesList);
        this.$message({
            showClose: true,
            message: "This incentive is removed successfully, You can add the same incentive by clicking on the Select Incentive Button",
            type: "success",
            center: true
          });
    },
    handleAdd(addedIncentivesList) {
      // debugger
      // console.log(addedIncentivesList)
      if(this.designId){
        this.getIncentives();
      } else{
        this.getIncentives(addedIncentivesList.data);
      }
    },
    handleClose() {
      if(this.designId){
        this.getIncentives();
      }
      this.selectDialogFormVisible = false;
    },
    async getIncentiveFromStore(){
      if(this.designId){
        this.selectedIncentivesList = this.incentivesData;
      }else{
        this.selectedIncentivesList = this.selectedIncentivesData;
        // console.log(this.selectedIncentivesData);
      }
      this.isLoaded = true;
    },
    async getIncentives(addedIncentivesList) {
      this.isLoaded = false;
      if(this.designId){
        console.log("ggg",this.designDataFull)
        await this.SET_DESIGN(this.designId);
        this.selectedIncentivesList = this.incentivesData;
        this.isLoaded = true;
      }
      else{
        // debugger
        // console.log("inside get incentives function with incentives list",addedIncentivesList);
        this.$emit("updatedIncentivesList", addedIncentivesList);
        this.selectedIncentivesList = addedIncentivesList;
        this.isLoaded = true;
      }
    },
    async currValues() {
      this.addIncDialogFormVisible = false;
      this.counter++;
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
    },
    closeCopy() {
      this.copyDialogFormVisible = false;
    },
    isCrmUser,
  },
};
</script>

<style scoped>
.card {
  height: 15.5rem !important;
}

.button_action .action_list .btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cniHead {
  font-size: 14px;
  font-weight: 600;
  color: #1c3366;
}
.icon {
  font-size: 1.5rem;
  margin-right: 8px;
  cursor: pointer;
}

.el-icon-circle-plus-outline:before {
  font-weight: bold;
}

.createButton {
  margin-right:1rem;
  height: 43px !important;
  border-radius: 4px !important;
  width: 170px !important;
  margin-right: 1rem !important;
}

.selectButton  {
  height: 43px !important;
  border-radius: 4px !important;
  width: 170px !important;
}

tr {
  border-bottom-style: solid;
  border-color: #cccccc;
  border-bottom-width: 1px;
}
.value_type {
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.57;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}
.incentiveName {
  width: -webkit-fill-available;
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

.table_section {
  border-top-style: none !important;
  border-bottom-width: 2px !important;
  margin-top: 0 !important;
}
.card {
  height: auto !important;
}

.card .card_header{
  height: 48px !important;
}

.incentive-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 16px 16px 16px;
}

.card .incentive-header h4 {
    font-size: 16px;
    font-weight: 600 !important;
    color: #222;
}

.card .card_header h4 {
    font-size: 16px;
    font-weight: 600 !important;
    color: var(--primary);
    letter-spacing: 0.3px;
}

.incentive_table{
  margin: 0%;
  width: 100%;
  margin-bottom: 20px;
}

.incentive_actin_icons,
.action-delete{
  display: flex;
}

.card_content_CRM {
  padding: 0px 16px 0px 16px;
}

.add_price_td {
    max-width: 450px;
    width: 100%;
    margin: 0 auto;
    text-align: center;
    padding-top: 12px;
}

.incentive_table table td, .incentive_table table th {
    padding: 12px 0px;
    text-align: left;
    font-size: 12px;
}

.footerBtn {
  box-shadow: none;
  border: none;
  display: flex;
  margin-bottom: 16px;
  color: #1c3366;
  font-weight: 600;
}

@media (max-width: 453px) {
  .selectButton  {
        margin-right: 1rem;
    margin-top: 0.5rem;
  height: 43px !important;
  border-radius: 4px !important;
  width: 170px !important;
}
}

@media (max-width: 437px) {
  .createButton {
    margin-right: 0;
  margin-bottom: 0.5rem;
  height: 43px !important;
  border-radius: 4px !important;
  width: 170px !important;
}
.selectButton  {
  margin-right: 0;
  margin-top: 0;
  height: 43px !important;
  border-radius: 4px !important;
  width: 170px !important;
}
}

.card .el-icon-close{
      color: #222;
    cursor: pointer;
    font-size: 22px !important;
    font-weight: 600;
}


</style>
