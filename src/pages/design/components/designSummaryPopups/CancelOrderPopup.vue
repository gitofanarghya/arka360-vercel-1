<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isCancelOrderPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title= "cancelOrderCase ? 'Cancel Order' : 'Cancel Revision' "
      width="560px"
      @close="onDialogClose"
    >
      <div class="container">
        <p class="heading">
          {{ cancelOrderCase ? 'Please choose any reason below that made you cancel the order.' : 'Please choose any reason below that made you cancel the revision.'}}
        </p>
        <div class="contContainer">
          <el-radio v-model="reason" :label="cancelOrderReasons.one" @change="enableCancelOrder = true" v-if="cancelOrderReasons.one">
            {{ cancelOrderReasons.one }}
          </el-radio>
          <el-radio v-model="reason" :label="cancelOrderReasons.two" @change="enableCancelOrder = true" v-if="cancelOrderReasons.two">
            {{ cancelOrderReasons.two }}
          </el-radio>
          <el-radio v-model="reason" :label="cancelOrderReasons.three" @change="enableCancelOrder = true" v-if="cancelOrderReasons.three">
            {{ cancelOrderReasons.three }}
          </el-radio>
          <el-radio v-model="reason" :label="cancelOrderReasons.four" @change="enableCancelOrder = true" v-if="cancelOrderReasons.four">
            {{ cancelOrderReasons.four }}
          </el-radio>
          <el-radio v-model="reason" label="Others" @change="enableCancelOrder = true">
            Others
          </el-radio>
          <textarea id="addInfo" placeholder="Please specify if any other." v-model="description" v-if="reason === 'Others'">
          </textarea>
          <!-- {{ reason }} -->
          <!-- {{ description }} -->
        </div>
      </div>
      <div class="btnCont" slot="footer">
        <el-button
          type="primary" class="cancelOrderBtn" @click="cancelOrder"
          :loading="isCancelling" :disabled="!this.enableCancelOrder" v-if="cancelOrderCase"
        >
          Cancel Order
        </el-button>
        <el-button
          type="primary" class="cancelOrderBtn" @click="cancelRevision" 
          :loading="isCancelling" :disabled="!this.enableCancelOrder" v-if="cancelRevisionCase"
        >
          Cancel Revision
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from '@/services/api/';
import { mapActions, mapState } from "pinia";
import { useCreditsStore } from '../../../../stores/credits';
import { useProjectStore } from '../../../../stores/project';

export default {
  name: "cancelOrderPopup",

  props: {
    isCancelOrderPopupVisible: {
      type: Boolean,
      default: false,
    },
    cancelDeliveryType:{
      type: String,
      default: null
    },
    cancelSiteSize:{
      type: String,
      default: null
    },
    resId: {
      type: Number,
    },
    serviceType: {
      type: String,
    },
    projectId: {
      type: Number,
    },
    cancelRevisionCase: {
      type: Boolean,
    },
    cancelOrderCase: {
      type: Boolean,
    }
  },

  data() {
    return {
      additionalRevisionId: null, 
      order_type: null,
      enableCancelOrder: false,
      radio: '',
      base_type: null,
      serviceTemplateInfo: {},
      description: '',
      label: '',
      reason: '',
      service_type: this.$props.serviceType,
      cancelOrderReasons: {},
      isCancelling: false,
    };
  },

  computed: {
    ...mapState(useProjectStore, {
      designDetails: "GET_DESIGNS_DETAILS",
    }),
    details_list(){
      return this.serviceTemplateInfo['0']['input_dropdown']['0'];
    },
  },
  created(){
      this.serviceTemplateInfo =  JSON.parse(localStorage.getItem("allServicesInfo")).service_templates.filter(obj => {
        return obj["template_constant"]["0"]["service_type"] === this.serviceType;
      });    
      this.order_type = this.cancelSiteSize ? this.cancelSiteSize : this.cancelDeliveryType;
      this.base_type = this.serviceTemplateInfo["0"][this.details_list].filter(obj => {
        return obj.base.type == this.order_type;
      });
      this.additionalRevisionId = this.base_type["0"]["additional_revision"]["id"];
      this.cancelOrderReasons = this.serviceTemplateInfo["0"]["template_constant"]["0"]["cancel_order_reason"];
  },
  methods: {
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),
    async cancelOrder() {
      this.isCancelling = true
      try {
        const patchData = {
          "order_status": "cancelled",
          // "reason_for_cancellation": this.description,
          "reason_for_cancellation": (this.reason === 'Others') ? this.description : this.reason, 
        }

        const response = await API.DESIGNS.CANCEL_ORDER(this.resId, patchData);
        let credits = {
          purchased_credits: response.data.credits.purchased_credits,
          promotional_credits: response.data.credits.promotional_credits,
        }
        this.setCreditBalance(credits);
        // To update the store with latest status (cancelled) that should reflect in projectSummary on clicking "Cancel Order" without reloading.
        await this.getProjectDetails();
      }
      catch(e) {
        console.error(e);
      }
      this.isCancelling = false
      this.onDialogClose();
    },
    onDialogClose() {
      this.$emit("update:isCancelOrderPopupVisible", false);
      this.$emit("update:cancelRevisionCase", false);
      this.$emit("update:cancelOrderCase", false);
    },
    async cancelRevision() {
      this.isCancelling = true
      try {
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
          "contractor_license": this.contractor_license,
        }
        patchData["features"] = [this.additionalRevisionId];

        const response = await API.DESIGNS.CANCEL_REVISION(this.resId, patchData);
        let credits = {
          purchased_credits: response.data.credits.purchased_credits,
          promotional_credits: response.data.credits.promotional_credits,
        }
        this.setCreditBalance(credits);
        // To update the store with latest status (cancelled) that should reflect in projectSummary on clicking "Cancel Order" without reloading.
        await this.getProjectDetails();
      }
      catch(e) {
        console.error(e);
      }
      this.isCancelling = false
      this.onDialogClose();
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

.cancelOrderBtn {
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