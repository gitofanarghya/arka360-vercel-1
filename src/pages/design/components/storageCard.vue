<template>
  <div class="card" v-loading.fullscreen="isLoading">
    <div :class="{
      'card_header':!isOnLeadSummaryPage,
      'flexCont':!isOnLeadSummaryPage,
      'incentive-header':isOnLeadSummaryPage
    }">
      <h4>Storage</h4>
      <div class="editCont" v-if="!isEmptyStorage">
        <button :class="{'btnEditModified': isOnLeadSummaryPage, 'btnEdit': !isOnLeadSummaryPage }" @click="isAddBatteryPopupVisible = true" >
          <span class="icon edit-alt"></span>
        </button>
        <button :class="{'btnEditModified': isOnLeadSummaryPage, 'btnEdit': !isOnLeadSummaryPage }" @click="isDeleteStoragePopupOpen = true">
          <span class="icon delete-alt"></span>
        </button>
      </div>
    </div>
    <div
    :class="{
      'emptyStorageContainer':!isOnLeadSummaryPage,
      'emptyStorageContainerCRM':isOnLeadSummaryPage
      }"
     v-if="isEmptyStorage">
      <el-tooltip
        :disabled="!isBatteryDisabled && (!isCrmUser() || projectPermissionObject.edit_design)"
        effect="dark"
        placement="top-start"
        :content="tooltipContent()"
      >
        <span>
          <el-button
            type="primary"
            class="addBtn"
            @click="isAddBatteryPopupVisible = true"
            :disabled="isBatteryDisabled || (isCrmUser() && !projectPermissionObject.edit_design)"
          >
            Add Battery
          </el-button>
        </span>
      </el-tooltip>
    </div>
    <div class="storageContainer" 
    :class="{
      'storageContainer':!isOnLeadSummaryPage,
      'storageContainerCRM':isOnLeadSummaryPage
      }"
    v-else>
      
      <div class="contContainer">
        <p class="headCont">Capacity</p>
        <p class="valueCont">{{consumptionData.total_battery_capacity}} kWh</p>
      </div>
      <div class="contContainer">
        <p class="headCont">Backup on Storage</p>
        <p class="valueCont">{{batteryBackupOnStorageText}}</p>
      </div>
      <div class="contContainer">
        <p class="headCont">Backup on Solar & Storage</p>
        <p class="valueCont">{{batteryBackupOnStorageAndSolarText}}</p>
      </div>
      <div class="batteries-section">
        <div class="contContainer">
          <p class="headCont">Battery</p>
        </div>
        <div class="battery-row" style="border-bottom: 1px solid #ccc;">
          <div class="contContainer">
            <p class="headCont">Manufacturer</p>
          </div>
          <div class="contContainer">
            <p class="headCont">Model</p>
          </div>
          <div class="contContainer">
            <p class="headCont">Quantity</p>
          </div>
        </div>
        <div class="battery-row" v-for="(bat, ind) in consumptionData.battery_detail" :key="'battery' + ind">
          <div class="contContainer">
            <p class="valueCont">{{bat.manufacturer.name}}</p>
          </div>
          <div class="contContainer">
            <p class="valueCont">{{bat.battery.model}}</p>
          </div>
          <div class="contContainer">
            <p class="valueCont">{{bat.quantity}}</p>
          </div>
        </div>
      </div>
    </div>
    <AddBattery
      v-if="isAddBatteryPopupVisible"
      :isAddBatteryPopupVisible.sync="isAddBatteryPopupVisible"
    />
    <DeleteStorage
      v-if="isDeleteStoragePopupOpen"
      :isDeleteStoragePopupOpen="isDeleteStoragePopupOpen"
      @confirmDelete="deleteStorage()"
      @cancelDelete="isDeleteStoragePopupOpen = false"
    />
  </div>
</template>

<script>
import AddBattery from "./addBatteryPopup.vue";
import DeleteStorage from "./deleteStorage.vue"
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../stores/design";
import { useProjectStore } from "../../../stores/project";
import { isCrmUser } from "../../../utils";
import { modifyBackupTime } from './js/utils.js'
import API from "@/services/api/";

export default {
  name: "storageCard",

  components: {
    AddBattery,
    DeleteStorage,
  },

  props: ["designId"],

  data() {
    return {
      isLoading: false,
      isAddBatteryPopupVisible: false,
      isDeleteStoragePopupOpen: false,
      isOnLeadSummaryPage: this.$route.name.includes("leadSummary"),
    };
  },

  computed: {
    ...mapState(useDesignStore, {
      consumptionData: "GET_CONSUMPTION_DATA",
      designSummary: "GET_DESIGN_INFORMATION",
      boqTableData: 'GET_ORGANISATION_BOQ_TABLE_DATA',
      designPathData: "GET_DESIGN_PATH_DATA",     
    }),
    ...mapState(useProjectStore, {
        projectPermissionObject: 'GET_PERMISISON_OBJECT',
    }),
    batteryBackupOnStorageText() {
      return modifyBackupTime(this.consumptionData.battery_backup_on_storage)
    },
    batteryBackupOnStorageAndSolarText() {
      return modifyBackupTime(this.consumptionData.battery_backup_on_storage_and_solar)
    },
    inverterMissing() {
      return !this.designSummary.acSize
    },
    isEmptyStorage() {
      return !(this.consumptionData.battery_detail &&
               this.consumptionData.battery_detail.length)
    },
    isBatteryDisabled() {
      return this.inverterMissing || !this.consumptionData.consumption_profile
    }
  },

  // async created() {
  //   if (this.consumptionData.battery_capacity != null) {
  //     this.isEmptyStorage = false
  //   }
  // },

  methods: {
    ...mapActions(useDesignStore, {
      updateBOQTable: "UPDATE_BOQ_TABLE",
      setDesign: "SET_DESIGN",
    }),

    // onConfirmDetails() {
    //   this.isEmptyStorage = false
    // },
    tooltipContent() {
      if (!this.consumptionData.consumption_profile && this.inverterMissing) {
        return "Please add an inverter to the design and add consumption details on project summary.";
      } else if (!this.consumptionData.consumption_profile) {
        return "Please add consumption details on project summary.";
      }
      else if( isCrmUser() && !this.projectPermissionObject.edit_design ){
        return "You dont have permisison to change design Information."
      }
      return "Please add an inverter to the design before adding the battery.";
    },
    async deleteStorage() {
      this.isLoading = true
      let designId = this.designPathData.designId
      try {
        await API.DESIGNS.DELETE_BATTERY(designId)
        await this.setDesign(designId)
      } catch (error) {
        let errorMessage = error.response.status === 403 ?
                          "You don't have permission to edit this project." :
                          "There was an error while deleting the battery."

        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        })
      }

      // // Update battery in manual_bom_data
      // let newTable = [...this.boqTableData]
      // let batteryComponent = newTable.find(mat => mat.category == 'Battery')
      // if (batteryComponent) {
      //   let ind = newTable.indexOf(batteryComponent)
      //   newTable.splice(ind, 1)
      // }
      // let payload = {
      //   manual_bom_data: newTable,
      // }
      // await this.updateBOQTable(payload);
      this.isLoading = false
      this.isDeleteStoragePopupOpen = false
    },
    isCrmUser,
  },
};
</script>

<style scoped>
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  padding: 16px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px;
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

.flexCont,
.editCont {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card .card_header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.btnEdit {
  border: none;
  background: linear-gradient(180deg, #e8edf2, #e9ecf2);
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  color: #1c3366;
}

.btnEditModified {
  border: none;
  background: #fff;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  color: #1c3366;
}

.edit {
  font-size: 16px;
  color: #1c3366;
  cursor: pointer;
}

.emptyStorageContainer {
  padding: 24px 24px 24px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.emptyStorageContainerCRM {
  padding: 0px 16px 24px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.addBtn {
  font-size: 16px;
  margin: 16px auto;
}

.storageContainer {
  display: grid;
  column-gap: 16px;
  row-gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 24px 24px 24px 24px;
  word-break: break-word;
}

.storageContainerCRM {
  display: grid;
  column-gap: 16px;
  row-gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0px 16px 24px 16px;
  word-break: break-word;
}

.batteries-section {
  grid-column-start: 1;
  grid-column-end: 4;
}

.battery-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-start: 1;
  grid-column-end: 4;
  column-gap: 16px;
  margin: 0.8em 0em;
}

.headCont {
  font-size: 14px;
  font-weight: 500;
  color: #777;
  margin-bottom: 6px;
  text-align: left;
}

.valueCont {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

@media (max-width: 500px) {
  .storageContainer,
  .storageContainerCRM {
    grid-template-columns: auto;
  }
}
</style>


