<template>
  <div id="ahjInformation" :class="isCrmUser() ? 'marginTopCRM': ''">
    <div class="card">
      <div class="card_header flex_header">
        <h4>Authority Having Jurisdiction (AHJ) Information</h4>
        <div 
          class="edit"
          data-toggle="modal"
          data-target="#info_edit"
          @click="openConsumptionForm"
          v-if="AHJName!==null || AHJCode!==null"
        >
          <span class="icon edit-alt"></span>
          Edit
        </div>
      </div>
      <!-- permissionObject.ahj == true (tooltip disabled = true) and (disbaled button = false) -->
      <div class="card_content">
        <div v-if="AHJName===null && AHJCode===null" class="addAhj" @click="openConsumptionForm">
          <el-tooltip
              :disabled="Boolean(!isCrmUser() || permissionObject.ahj)"
              effect="dark"
              placement="top-start"
              :content="'You dont have permission to add AHJ.'"
          >
          <el-button type="primary" :disabled="isCrmUser() && !permissionObject.ahj" class="addAHJButton">Add AHJ</el-button>
          </el-tooltip>
        </div>
        <div class="ahjCard" v-else>
        <div class="ahjCell">
          <label for="" class="ahjLabel">AHJ Name</label>
          <div class="ahjValues">{{AHJName}}</div>
        </div>
        <div class="ahjCell">
          <label for="" class="ahjLabel">AHJ Code</label>
          <div class="ahjValues">{{AHJCode}}</div>
        </div>
        <div class="ahjCell">
          <label for="" class="ahjLabel">Building Code</label>
          <div class="ahjValues">{{BuildingCode}}</div>
        </div>
        <div class="ahjCell">
          <label for="" class="ahjLabel">Electrical Code</label>
          <div class="ahjValues">{{ElectricCode}}</div>
        </div>
        <div class="ahjCell">
          <label for="" class="ahjLabel">Fire Code</label>
          <div class="ahjValues">{{FireCode}}</div>
        </div>
        <div class="ahjCell">
          <label for="" class="ahjLabel">Residential Code</label>
          <div class="ahjValues">{{ResidentialCode}}</div>
        </div>
        </div>                                  
      </div>
    </div>
    <ahjInformationDialog
      v-if="isConsumptionFormVisible"
      :isConsumptionFormVisible.sync="isConsumptionFormVisible"
      @update="emitHandler()"
    />
  </div>
</template>

<script>
import { METERING_TYPES } from "@/pages/constants";
import API from "@/services/api";
import ahjInformationDialog from "./ahjInformationDialog.vue";
import { mapState, mapActions } from "pinia";
import { useProjectStore } from '../../../../stores/project';
import { useLeadStore } from "../../../../stores/lead";
import { isCrmUser } from '@/utils.js'

export default {
  name: "ahjInformation",
  components: {
    ahjInformationDialog,
  },
  data() {
    return {
      isConsumptionFormVisible: false,
      AHJCode: null,
      Level: null,
      AHJName: null,
      BuildingCode: null,
      ElectricCode: null,
      FireCode: null,
      ResidentialCode: null,
    };
  },
  nonReactiveData() {
    return {
      METERING_TYPES,
    };
  },
  computed: {
    ...mapState(useProjectStore, {
      projectInformation: "GET_PROJECT_INFORMATION",
      consumption: "GET_PROJECT_CONSUMPTION_DETAILS",
      currencySymbol: "GET_CURRENCY_SYMBOL",
      ahjDetails :"GET_AHJ_DETAILS",
      permissionObject: "GET_PERMISISON_OBJECT"
    }),
    ...mapState(useLeadStore, {
      leadInfo: state => state
    }),
    averagePriceText() {
      return this.consumption.metering_type ===
        this.METERING_TYPES.GROSS_METERING
        ? "Average import unit price"
        : "Price/kWh";
    },
    isGrossMeteringEnable() {
      return (
        this.consumption.metering_type === this.METERING_TYPES.GROSS_METERING
      );
    },
    projectId(){
      return (this.$route.params.projectId  || this.leadInfo?.project_details?.id);
    }
  },
  mounted(){
    this.handleUpdate();
  },
  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    async getProjectDetails() {
      try {
        await this.GET_CURRENT_PROJECT(this.projectId);
      } catch (e) {
        if (e.response.status) {
          if (e.response.status === 404 || e.response.status === 403) {
            this.$message({
              showClose: true,
              message: "Project not found. Redirecting to Home Page ...",
              type: "error",
              center: true
            });
          } else if (e.response.status === 500) {
            this.$message({
              showClose: true,
              message: "Error in loading project. Please try again.",
              type: "error",
              center: true
            });
          }
          setTimeout(() => {
            this.redirectToHomeBasedOnCountry()
            // this.$router.push({ name: "home" });
          }, 2000);
        }
      }
    },
    openConsumptionForm() {
      if(isCrmUser() && !this.permissionObject.ahj)
      return;
      this.isConsumptionFormVisible = true;
    },
    async handleUpdate(payLoad){

      this.AHJCode=this.ahjDetails.AHJCode;
      this.AHJName=this.ahjDetails.AHJName;
      this.Level=this.ahjDetails.Level;
      this.BuildingCode=this.ahjDetails.BuildingCode;
      this.FireCode=this.ahjDetails.FireCode;
      this.ResidentialCode=this.ahjDetails.ResidentialCode;
      this.ElectricCode=this.ahjDetails.ElectricCode;
      this.isConsumptionFormVisible = false;
    },

    async emitHandler(){
      await  this.getProjectDetails();
      this.handleUpdate();
      this.isConsumptionFormVisible = false;
    },
    isCrmUser,
  },
};
</script>

<style type="text/css" scoped>

.marginTopCRM {
  margin-top: 32px;
}

#ahjInformation >>> .ahjCard{
    display: grid;
    grid-template-columns: 33% 33% 33%;
    grid-row-gap: 10px;

}

#ahjInformation >>> .addAhj{
  text-align: center;
}

#ahjInformation >>> .ahjCell{
  height: 55px;
}

#ahjInformation >>> .ahjLabel{
  color: #777777;
}


#ahjInformation >>> .ahjValues{
  margin-top: 6px;
}

.consumptionParameters {
  font-size: 0.9vw;
  color: #707070;
  font-weight: 700;
}

.consumptionValues {
  font-size: 0.9vw;
  padding-top: 5px;
  padding-bottom: 15px;
  color: #707070;
  font-weight: 100;
}

.cardHeaderVerticalAligner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 15px 0;
}

.consumptionHeader {
  font-size: 1vw;
  color: #707070;
  font-weight: bold;
}

h6 {
  margin-top: -7px;
  margin-bottom: 16px;
  font-size: 14px;
}

/* project summary */
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
#ahjInformation >>> .card .card_header {
  padding: 0px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px !important;
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}
.card .card_header.flex_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card .card_header.flex_header h4 {
  flex-grow: 1;
  padding-right: 8px;
}
.card .card_header.flex_header .edit {
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  font-size: 16px;
  font-weight: 500;
  color: var(--primary);
  cursor: pointer;
}
.card .card_header.flex_header .edit .icon {
  margin-right: 4px;
  font-size: 24px;
  color: inherit;
}
.card .card_content {
  padding: 24px;
  border-radius: 12px 12px 0 0;
}

.sub_title {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 500;
}

.group_title {
  margin-top: 16px;
  display: flex;
  align-items: center;
}
.group_title .title_text {
  font-size: 1.5rem;
  font-weight: normal;
  color: var(--primary);
  display: inline-flex;
  padding-right: 8px;
}
.group_title .action_btn {
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
}
.group_title .action_btn:focus {
  outline: none;
}
.group_title .icon {
  font-size: 20px;
}

.col_row {
  margin: 0 -16px;
  display: flex;
}
@media (max-width: 1024px) {
  .col_row {
    flex-wrap: wrap;
  }
}
.col_row .col {
  padding: 0 16px;
  flex-grow: 1;
}
@media (min-width: 768px) {
  .col_row .col_4 {
    flex: 0 0 25%;
  }
}
@media (max-width: 767px) {
  .col_row .col_4 {
    flex: 0 0 50%;
  }
  #ahjInformation >>> .ahjCard{
    display: grid;
    grid-template-columns: 50% 50%;
    grid-row-gap: 10px;

}
}
@media (min-width: 768px) {
  .col_row .col_3 {
    flex: 0 0 33.333%;
  }
}
@media (max-width: 767px) {
  .col_row .col_3 {
    flex: 0 0 50%;
  }
}
@media (max-width: 1024px) {
  .col_row .col.info_col {
    order: 2;
  }
}

.project_summary .title_edit {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.project_summary .title_edit .icon {
  font-size: 22px;
  position: relative;
  top: 2px;
}

.project_summary .graph_area {
  border: 1px solid var(--step-100);
  border-radius: 4px;
}
.project_summary .graph_area > img {
  width: 100%;
  border-radius: 4px;
  display: flex;
}

.project_summary .add_design {
  color: var(--primary);
  font-size: 14px;
  cursor: pointer;
}
.project_summary .add_design strong {
  font-size: 24px;
}

@media (min-width: 768px) {
  .project_summary .design_col {
    max-width: 200px;
  }
}

.project_summary .design_col.design_outer {
  margin-top: 24px;
}
.design_card figure:hover {
  cursor: pointer;
}
@media (min-width: 768px) {
  .project_summary .design_col.design_outer {
    max-width: 242px;
  }
  .project_summary .design_col.design_outer .design_card {
    height: 100%;
  }
  .project_summary .design_col.design_outer .design_card figure {
    height: 100%;
  }
  .project_summary .design_col.design_outer .design_card figure img {
    height: 100%;
  }
}

.project_summary .design_card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
}
.project_summary .design_card figure {
  position: relative;
}
.project_summary .design_card figure img {
  width: 100%;
  object-fit: cover;
  display: flex;
}
.project_summary .design_card figure .btn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 6px 12px;
  font-weight: 400;
  font-size: 12px;
  border-radius: 0;
}
/* .display_design{
  display: flex;
  justify-content: flex-start;
} */

.project_summary .added_design {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -16px;
}
.project_summary .added_design .design_card {
  max-width: 280px;
  border-radius: 8px;
}
.project_summary .added_design .design_card figure img {
  height: 300px;
}
.project_summary .added_design .card_col {
  padding: 8px 16px;
}
.project_summary .added_design .info_design {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
.project_summary .added_design .info_design .name {
  flex-grow: 1;
  font-size: 14px;
  font-weight: normal;
  padding-right: 8px;
  color: var(--step-250);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.project_summary .added_design .info_design .edit {
  font-size: 14px;
  font-weight: normal;
  color: var(--primary);
  cursor: pointer;
}

.project_summary .info_item {
  margin: 8px 0;
  max-width: 270px;
}
.project_summary .info_item .label {
  font-size: 13px;
  color: var(--step-200);
  display: flex;
  align-items: center;
}
.project_summary .info_item .label .btn {
  margin-left: 4px;
}
.project_summary .info_item .label .btn.outline_danger {
  padding: 4px 12px;
  font-size: 12px;
}
.project_summary .info_item .value {
  font-size: 14px;
  color: var(--step-250);
  margin-top: 6px;
}

.project_summary .card {
  margin-top: 24px;
}

.project_summary .col_row .col_2 {
  width: 100%;
}
@media (min-width: 1281px) {
  .project_summary .col_row .col_2 {
    max-width: 750px;
  }
}

.project_summary .col_row .col_1 .design_card {
  margin-top: 24px;
  max-width: 400px;
}

.project_summary .col_row ~ .graph_area {
  margin-top: 16px;
}

.project_summary .add_price_td {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  padding-top: 12px;
}
.project_summary .add_price_td p {
  font-size: 14px;
  font-weight: normal;
  line-height: 1.57;
  color: var(--step-250);
  margin-bottom: 24px;
}

/* end project summary */

.modal.modal_form .modal-wrapper .modal-content .modal-header,
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
}

body.modal-open {
  overflow: hidden;
}

.modal-wrapper {
  position: absolute;
  z-index: 999;
  left: 50%;
  top: 50%;
  max-width: 704px;
  width: 100%;
  margin: 32px 0;
  transform: translate(-50%, -50%);
}

.modal {
  position: fixed;
  z-index: 10000;
  /* 1 */
  top: 0;
  left: 0;
  /* visibility: hidden; */
  width: 100%;
  height: 100%;
  overflow: auto;
}
.modal .modal-content {
  padding: 32px 24px 24px;
  background-color: var(--white);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.35);
  border-radius: 12px;
  position: relative;
}
@media (max-width: 1280px) {
  .modal .modal-content {
    max-width: calc(100% - 48px);
    margin: auto;
  }
}
.modal .modal-close {
  background: transparent;
  border: 0;
  position: absolute;
  right: 8px;
  top: 12px;
  cursor: pointer;
}
.modal .modal-close:focus {
  outline: none;
}
.modal .modal-header {
  padding: 24px;
}
.modal.modal_form .modal-wrapper {
  max-width: 500px;
  margin: 0;
}
.modal.modal_form .modal-wrapper .modal-content {
  padding: 0;
}
.modal.modal_form .modal-wrapper .modal-content .modal-header {
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
.modal.modal_form .modal-wrapper .modal-content .inside_form {
  padding: 0 24px 16px;
}
.modal-overlay {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* visibility: hidden; */
  opacity: 0.5;
  transition: background-color 0.5s ease-in;
  transition: opacity 400ms ease-in;
}

#ahjInformation >>> .addAHJButton{
  width: 170px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
}

#ahjInformation >>> .el-dialog-footer{
  margin-top: 0 !important;
}

</style>

<style lang="scss" scoped>
@import "../../../../styles/components/button";
</style>
