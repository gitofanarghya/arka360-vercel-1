<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isCancelRevisionPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      title="Cancel Revision"
      width="560px"
      @close="onDialogClose"
    >
      <div class="container">
        <p class="heading">
          Please choose any reason below that made you cancel the revision.
        </p>
        <div class="contContainer" v-if="service_type === 'Solar Sales Proposal'">
          <el-radio v-model="reason" :label="solarSalesProposalReasons.one" @change="enableCancelRevision = true">
            {{ solarSalesProposalReasons.one }}
          </el-radio>
          <el-radio v-model="reason" :label="solarSalesProposalReasons.two" @change="enableCancelRevision = true">
            {{ solarSalesProposalReasons.two }}
          </el-radio>
          <el-radio v-model="reason" :label="solarSalesProposalReasons.three" @change="enableCancelRevision = true">
            {{ solarSalesProposalReasons.three }}
          </el-radio>
          <el-radio v-model="reason" label="Others" @change="enableCancelRevision = true">
            Others
          </el-radio>
          <textarea id="addInfo" placeholder="Please specify if any other." v-model="description" v-if="reason === 'Others'">
          </textarea>
          <!-- {{ reason }} -->
          <!-- {{ description }} -->
        </div>
        <div class="contContainer" v-if="service_type === 'Permit Package'">
          <el-radio v-model="reason" :label="permitPackageReasons.one" 
          @change="enableCancelRevision = true">
            {{ permitPackageReasons.one }}
          </el-radio>
          <el-radio v-model="reason" :label="permitPackageReasons.two"
          @change="enableCancelRevision = true">
            {{ permitPackageReasons.two }}
            </el-radio>
          <el-radio v-model="reason" :label="permitPackageReasons.three"
          @change="enableCancelRevision = true">
            {{ permitPackageReasons.three }}
          </el-radio>
          <el-radio v-model="reason" :label="permitPackageReasons.four"
          @change="enableCancelRevision = true">
            {{ permitPackageReasons.four }}
          </el-radio>
          <el-radio v-model="reason" label="Others"
          @change="enableCancelRevision = true">
            Others
          </el-radio>
          <textarea id="addInfo" placeholder="Please specify if any other." v-model="description" v-if="reason === 'Others'">
          </textarea>
          <!-- {{ reason }} -->
          <!-- {{ description }} -->
        </div>
        <div class="contContainer" v-if="service_type === 'PV Design'">
          <el-radio v-model="reason" :label="pvDesignReasons.one"
          @change="enableCancelRevision = true">
            {{ pvDesignReasons.one }}
          </el-radio>
          <el-radio v-model="reason" :label="pvDesignReasons.two"
          @change="enableCancelRevision = true">
            {{ pvDesignReasons.two }}
            </el-radio>
          <el-radio v-model="reason" :label="pvDesignReasons.three"
          @change="enableCancelRevision = true">
            {{ pvDesignReasons.three }}
          </el-radio>
          <el-radio v-model="reason" :label="pvDesignReasons.four"
          @change="enableCancelRevision = true">
            {{ pvDesignReasons.four }}
          </el-radio>
          <el-radio v-model="reason" label="Others"
          @change="enableCancelRevision = true">
            Others
          </el-radio>
          <textarea id="addInfo" placeholder="Please specify if any other." v-model="description" v-if="reason === 'Others'">
          </textarea>
          <!-- {{ reason }} -->
          <!-- {{ description }} -->
        </div>
      </div>
      <div class="btnCont" slot="footer">
        <el-button type="primary" class="cancelRevisionBtn" @click="cancelRevision" :disabled="!this.enableCancelRevision">
          Cancel Revision
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from '@/services/api/';
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from '../../../../stores/project';
export default {
  name: "cancelRevisionPopup",

  props: {
    isCancelRevisionPopupVisible: {
      type: Boolean,
      default: false,
    },
    resId: {
      type: Number,
    },
    serviceType: {
      type: String,
    },
    projectId: {
      type: String,
    }
  },

  data() {
    return {
      enableCancelRevision: false,
      radio: '',
      description: '',
      label: '',
      reason: '',
      service_type: this.$props.serviceType,
      solarSalesProposalReasons: {
        "one": "Client cancellation",
        "two": "Client chooses to go with another installer or the Installer loses the lead",
        "three": "Installer does sales proposals elsewhere or in-house",
      },
      permitPackageReasons: {
        "one": "Project changes after contract signing",
        "two": "Project delay or change in schedule",
        "three": "Project cancellation",
        "four": "Permit package done elsewhere or in-house",
      },
      pvDesignReasons: {
        "one": "Project changes after contract signing",
        "two": "Project delay or change in schedule",
        "three": "Project cancellation",
        "four": "Permit package done elsewhere or in-house",
      },
    };
  },

  computed: {
    ...mapState(useProjectStore, {
      revisionNotes: state => state.request_expert_service.revision_notes,
      name: state => state.name,
      latitude: state => state.latitude,
      longitude: state => state.longitude,
      zoom: state => state.zoom,
      client_name: state => state.client_name,
      client_email_id: state => state.client_email_id,
      client_phone: state => state.client_phone,
      client_address: state => state.client_address,
      quota_type: state => state.quota_type,
      assessor_parcel_number: state => state.assessor_parcel_number,
      contractor_license: state => state.contractor_license,
      designDetails: "GET_DESIGNS_DETAILS"
    })
  },

  methods: {
    async cancelRevision() {
      console.log('cancel revision');
      try {
        // const patchData = {
        //   "order_status": "cancelled",
        //   // "reason_for_cancellation": this.description,
        //   "reason_for_cancellation": (this.reason === 'Others') ? this.description : this.reason, 
        // }
        const patchData = {
          // "order_status": "cancelled",
          // "reason_for_cancellation": (this.reason === 'Others') ? this.description : this.reason, 
          "name": this.name,
          "latitude": this.latitude,
          "longitude": this.longitude,
          "zoom": this.zoom,
          "client_name": this.client_name,
          "client_email_id": this.client_email_id,
          "client_phone": this.client_phone,
          "client_address": this.client_address,
          "quota_type": this.quota_type,
          "assessor_parcel_number": this.assessor_parcel_number,
          "contractor_license": this.contractor_license
        }
        console.log("The patch data is:", patchData);

        const response = await API.DESIGNS.CANCEL_REVISION(this.resId, patchData);
        console.log("response from backend", response.data);

        // To update the store with latest status (cancelled) that should reflect in projectSummary on clicking "Cancel Order" without reloading.
        await this.getProjectDetails();
      }
      catch(e) {
        console.log(e);
      }
      this.onDialogClose();
    },
    onDialogClose() {
      this.$emit("update:isCancelRevisionPopupVisible", false);
    },
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    async getProjectDetails() {
      try {
        // await this.GET_CURRENT_PROJECT(this.$route.params.projectId);
        await this.GET_CURRENT_PROJECT(this.projectId);
      }
      catch(e) {
        console.log(e);
      }
    }
  },
};
</script>

<style scoped>
.textAreaStyle {
  display: none;
}

#parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#parentContainer >>> .el-dialog__title {
  width: 157px;
  /* height: 19px; */
  /* margin: 3px 892px 2px 0; */
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  /* font-weight: 600; */
  font-size: 18px;
  margin-left: 10px;
  color: #222222 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 10vh !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 16px 24px;
}

.heading {
  font-size: 16px;
  font-weight: 100;
  color: #222;
  word-break: break-word;
  margin-top: 8px;
  margin-bottom: 20px;
}

.contContainer {
  display: flex;
  flex-direction: column;
}

#parentContainer >>> .el-radio {
  margin-bottom: 20px;
  display: flex;
}

#parentContainer >>> .el-radio__inner {
  width: 20px;
  height: 20px;
  border: 1px solid #707070;
}

#parentContainer >>> .el-radio__inner:hover {
  border: 1px solid #707070;
}

#parentContainer >>> .el-radio__label {
  font-size: 16px;
  padding-left: 12px;
  color: #222;
  word-break: break-word;
  white-space: initial;
}

#parentContainer >>> .el-radio__input.is-checked + .el-radio__label {
  color: #222 !important;
}

#addInfo {
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  border: none;
  border-radius: 4px;
  background-color: #e8edf2;
  font-size: 16px;
  min-height: 128px;
  padding: 16px;
  margin-top: 8px;
  word-break: break-word;
}

#addInfo::placeholder {
  color: #777;
}

.btnCont {
  text-align: center;
  margin: 24px auto 8px auto;
}

.cancelRevisionBtn {
  font-size: 18px;
}

#parentContainer >>> .el-dialog__footer {
  padding: 20px;
  padding-top: 0px;
  text-align: right;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin-top: -10px;
}

@media (max-width: 760px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    top: -15vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  #parentContainer >>> .el-dialog__title {
    margin-left: 0px;
  }

  .container {
    padding: 24px 16px 16px 16px;
  }
}

@media (max-width: 760px) {
  .container {
    padding: 24px 16px 16px 16px;
    max-height: 55vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}
</style>