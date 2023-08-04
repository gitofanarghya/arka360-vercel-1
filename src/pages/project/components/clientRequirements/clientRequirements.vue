<template>
    <div id="clientRequirement">
      <div class="card">
        <div class="card_header flex_header">
        <h4>Consumption</h4>
        <div
          class="edit"
          data-toggle="modal"
          data-target="#info_edit"
          @click="redirectToConsumptionProfile"
        >
          <span class="icon edit-alt"></span>
          Edit
        </div>
      </div>

      <div class="card_content">
          <!-- <h6>Consumption</h6> -->
        <div class="col_row">
          <div class="info_item">
            <div class="label"> Consumption Type</div>
            <div class="headCont"> {{projectInfo.project_type}} </div>
          </div>
          <div class="info_item" v-if="isUtilityTariffDetailsAvailable">
            <div class="label">Utility Provider</div>
            <div class="value">{{ (consumption.utility_tariff_details.utility_provider_name) || '-' }}</div>
          </div>
          <div class="info_item" v-if="isUtilityTariffDetailsAvailable">
            <div class="label">Tariff Rates</div>
            <div class="value">{{ (consumption.utility_tariff_details.utility_rate_name) || '-' }}</div>
          </div>
          <div class="info_item">
            <div class="label">Monthly Consumption</div>
            <div class="value">{{ (consumption.averageMonthlyConsumption.toFixed(2)) }} kWhr</div>
          </div>
          <div class="info_item" v-if="!isUtilityTariffDetailsAvailable">
            <div class="label"> {{ averagePriceText }}</div>
            <div class="value">{{currencySymbol}}{{ consumption.average_price_per_unit }}/kWhr</div>
          </div>
          <div class="info_item" v-show="isGrossMeteringEnable && !isUtilityTariffDetailsAvailable">
            <div class="label">  Average export unit price</div>
            <div class="value">{{currencySymbol}}{{ consumption.average_export_price_per_unit }}/kWhr</div>
          </div>
          <div class="info_item">
            <div class="label" v-if="flagForUS">  Annual Escalation Rate</div>
            <div class="label" v-else>  Tariff Escalation Rate</div>
            <div class="value"> {{ consumption.tariff_escalation_rate }} %</div>
          </div>
          <!-- <div class="info_item">
            <div class="label"> Estimated Energy Consumption</div>
            <div class="value"> {{consumption.estimated_energy_consumption}} kWh/Day </div>
          </div> -->
          <div class="info_item">
            <div class="label"> Critical Load</div>
            <div class="value"> {{consumption.critical_load}} kWh </div>
          </div>
      </div> 
    </div>
  </div>
        <clientRequirementDialog :isConsumptionFormVisible.sync="isConsumptionFormVisible"/>
    </div>
</template>

<script>
import axios from 'axios';
import { METERING_TYPES } from '@/pages/constants';
import API from '@/services/api/';
import clientRequirementDialog from './clientRequirementDialog.vue';
import { mapState } from 'pinia';
import { useProjectStore } from '../../../../stores/project';


export default {
    name: 'ClientRequirementView',
    components: {
        clientRequirementDialog,
    },
    mounted(){
      // this.getProjectQuotaType();
      
    },
    data() {
        return {
            isConsumptionFormVisible: false,
            projectType:'',
            projectId: this.$route.params.projectId,
            selectedProfile: {
                Name: '',
            },
            consumptionDetails: {
                consumption: 0,
                period: 'MONTHLY',
                profile: -1,
            },
            consumptionProfileData: [],
            allConsumptionProfileData: [],
            // flagForUS:false,
        };
    },
    nonReactiveData() {
        return {
            METERING_TYPES,
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
            projectInfo: 'GET_PROJECT_INFORMATION',
            currencySymbol: 'GET_CURRENCY_SYMBOL',
            typeOfRate : 'GET_TYPE_OF_RATE'
        }),
        averagePriceText() {
            return this.consumption.metering_type === this.METERING_TYPES.GROSS_METERING ? 'Average import unit price' : 'Price/kWh';
        },
        isGrossMeteringEnable() {
            return this.consumption.metering_type === this.METERING_TYPES.GROSS_METERING;
        },
        flagForUS(){
          const user = JSON.parse(localStorage.getItem("user")) || {};
          return user.isUSFlagEnabled;
        },
        isUtilityTariffDetailsAvailable(){
          if(this.typeOfRate=='tou')
           return true;
          else
            return false;
        }

    },
    methods: {

        redirectToConsumptionProfile(){
          this.$router.push({ name: "consumptionProfile", params: { projectId: this.projectId } });
        },
        openConsumptionForm() {
            this.isConsumptionFormVisible = true;
        },
        async getProjectQuotaType(){
          const projectInfo = await API.PROJECTS.FETCH_PROJECT(this.projectId);
          // this.projectType= projectInfo.data.quota_type=='LARGE' ? 'Commercial' : 'Residential';
          this.projectType = projectInfo.data.project_type;

          this.consumptionDetails.consumption =  projectInfo.data.consumption;
          this.consumptionDetails.period = projectInfo.data.period.includes('MONTHLY') ? 'MONTHLY': this.consumptionDetails.consumption !=0 ? 'YEARLY' : 'MONTHLY';
          this.consumptionDetails.profile =  projectInfo.data.consumption_profile;
          this.getConsumptionProfileData();
        },
        async getConsumptionProfileData(){
          const consumptionProfileResp = await axios.get('api/master-data/consumptionProfile/');
          this.allConsumptionProfileData = consumptionProfileResp.data.results;
          for(let i=0; i<this.allConsumptionProfileData.length;i++){
                if(this.allConsumptionProfileData[i].id== this.consumptionDetails.profile)
                {  
                  this.selectedProfile.Name = this.allConsumptionProfileData[i].Name;
                  break;
                }
          }
        }
    },
};
</script>

<style type="text/css" scoped>

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
    font-weight: bold
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
#clientRequirement >>> .card .card_header {
  padding: 0px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px !important;
}
.card .card_header h4 {
  font-size: 16px;
  font-weight: 600 !important;
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin: 0px;
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
  margin: 0px;
  max-width: inherit;
}
.project_summary .info_item .label {
  font-size: 14px;
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
  background-image: linear-gradient(to bottom, #E8EDF2, #e9ecf2);
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
.headCont {
  font-size: 16px;
  color: var(--step-250);
  margin-top: 6px;
  text-align: left;
  text-transform: capitalize;
}


@media (max-width: 750px) {
  .col_row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

<style lang="scss" scoped>
@import '../../../../styles/components/button';
</style>
