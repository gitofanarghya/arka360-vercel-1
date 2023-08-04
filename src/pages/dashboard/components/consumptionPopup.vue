<template>
  <div class="deleteModule" v-if="isconsumptionPopupVisible" >
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      title="Add User"
      class="delete_module"
    >
      <div class="container">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{requestedServiceType}}</p>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isconsumptionPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer" v-loading.lock="isLoading">
          <h3 class="containerHeading">Consumption Profile*</h3>
          <p class="consumptionSubheading">These details will be used by the team to send you the Proposal. You also have the flexibility to edit these fields later and generate a proposal with different numbers.</p>
          <!-- <ConsumptionType
            v-if="!isLoading"
            :projectIdFromGenericComponent="projectIdFromGenericComponent"
          /> -->
          <MeteringType
            v-if="!isLoading"
            :isGenabilityEnabled="isGenabilityEnabled"
            :projectIdFromGenericComponent="projectIdFromGenericComponent"
            :isManageTariffOptionsHidden=true
            :isExpertServicePopup=true
          />
          <!-- <ConsumptionType
            v-if="!isLoading"
            :projectIdFromGenericComponent="projectIdFromGenericComponent"
          /> -->
          <ConsumptionProfileEnergy
            v-if="!isLoading"
            :projectIdFromGenericComponent="projectIdFromGenericComponent"
            :isGenabilityEnabled="isGenabilityEnabled"
            :isExpertServicePopup=true
          />
        </div>

        <!-- -----------------Footer----------------->
        <div class="footer">
          <p class="footerStep">
            Step {{ currentStepInProp
            }}<span class="unBold">/{{ totalSteps }}</span>
          </p>
          <div class="notesBtn">
            <el-button @click="$emit('closeConsumptionPopup', 'previous')"  class="backBtn"
              >Back</el-button
            >
            <el-button
              type="primary"
              class="submitBtn"
              @click="$emit('closeConsumptionPopup', 'next')"
              >Save & Next</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ConsumptionType from "../../consumptionProfile/components/consumptionType.vue";
import MeteringType from "../../consumptionProfile/components/meteringType.vue";
import ConsumptionProfileEnergy from "../../consumptionProfile/components/consumptionProfileEnergy.vue";
import API from '@/services/api/';
import { mapActions } from "pinia";
import { useProjectStore } from '../../../stores/project';

export default {
  components: {
    ConsumptionType,
    MeteringType,
    ConsumptionProfileEnergy,
  },

  name: "consumptionPopup",

  props: {
    isconsumptionPopupVisible: {
      type: Boolean,
      default: false,
    },
    requestedServiceType:{
            type: String,
            default:""
        },
    projectIdFromGenericComponent: {
      type: Number,
      default: null,
    },
    currentStepInProp: {
      type: Number,
      default: 1,
    },
    totalSteps: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      isadditionalNotesPopupVisible: false,
      isGenabilityEnabled: false,
      isLoading: false,
    };
  },
    created(){
    this.getProjectDetails();
    this.getOrganisationInformation();
  },

  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    closenewDesignDialogForm() {
      this.$emit("update:isconsumptionPopupVisible", false);
      this.$validator.reset();
    },
    async getOrganisationInformation(){
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisation_id);
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!Object.keys(responseData).length){
        responseData =( await API.ORGANISATION.FETCH_ORGANISATION(organisation_id)).data;
      }
      this.isGenabilityEnabled = responseData.is_genability_enabled;

    },

    async getProjectDetails() {
      try {
        this.isLoading = true;
        await this.GET_CURRENT_PROJECT(this.projectIdFromGenericComponent);
        this.isProjectBeingLoaded = false;
        this.isLoading = false;
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
  },

};
</script>


<style scoped>
.consumptionSubheading{
 font-size: 14px;
 font-weight: 100;
 line-height: 1.36;
 text-align: left;
 color: #222;
 padding-left: 14px;
 padding-top: 15px;
 word-break: break-word;
}
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule >>> .delete_module {
  overflow: hidden !important;
  margin-top: 5vh !important;
}

.Rectangle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.rectContent {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-left: 20px;
}

.modal-close {
  background-color: #e8edf2;
  border: none;
}

.el-dialog__close {
  font-size: 25px;
  font-weight: 700;
  margin-right: 8px;
  cursor: pointer;
}

.containerHeading{
  color: #777777;
  font-size: 16px;
  font-weight: 100;
  padding-left: 14px;
  padding-top: 10px;
}

.contContainer {
  padding: 16px;
  height: 65vh;
  overflow-y: scroll;
}

.footer {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.footerStep {
  font-size: 16px;
  font-weight: 700;
  color: #222222;
  line-height: 2.5;
}

.unBold {
  color: #777777;
}

.backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
  font-size: 18px !important;
}

.submitBtn {
  padding: 12px 14px;
  font-size: 18px !important;
}

.card,
.containerUtlityRateToggle {
  width: 98% !important;
}

.deleteModule >>> .card[data-v-05cfa349] {
  width: 98% !important;
}

.deleteModule >>> .currIcon[data-v-5d28bb6f] {
  top: 42% !important;
}

@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

.consumptionSubheading{
  padding-left: 4px;
  }

  .contContainer {
    padding: 4px;
    max-height: 70vh;
  }
  .rectContent {
    margin-left: 16px;
  }

  .backBtn {
    padding: 13px 20px;
    border: 1px solid #999;
    font-size: 14px !important;
  }

  .submitBtn {
    padding: 13px 16px;
    font-size: 14px !important;
  }

  .containerHeading {
    padding-left: 4px;
    padding-top: 16px;
}
}
</style>

