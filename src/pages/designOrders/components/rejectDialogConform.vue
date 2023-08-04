<template>
  <div id="designOrders">
    <el-dialog
      :visible="rejectState"
      :close-on-click-modal="false"
      @close="oncloseDialog"
      :show-close="true"
      :title="'Confirm Order Rejection'"
      width="60%"
    >
      <div>
        <el-row>
          <el-col :span="24">
            <span>
              {{ `Please confirm that you want to reject the order ` }}</span
            >
            <span
              ><b>{{ orderData.id }}</b>
            </span>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <span> {{ `The reason you have stated is ` }}</span
            ><span
              ><b>{{ input ? input : "" }}</b></span
            >
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="oncloseDialog">Cancel</el-button>
        <el-button type="primary" @click="handleconfirm">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
import { chatEvents, sendEvent } from "../../../utils";

export default {
  props: {
    rejectState: {
      type: Boolean,
      required: true,
    },
    input: {
      type: String,
    },
    orderData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      backdrop: false,
    };
  },
  methods: {
    oncloseDialog() {
      this.backdrop = true;
      this.$emit("reject-state", false);
    },
    handleconfirm() {
      this.oncloseDialog();
      const orderUpdateData = {
        order_status: "rejected",
        rejection_reason: this.$props.input,
      };
      API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(
        this.orderData.id,
        orderUpdateData
      ).then((res) => {
        sendEvent(chatEvents.ORDER_REJECTED, this.orderData.id);
        this.$emit("reject-confirm");
      });
    },
  },
};
</script>

<style type="text/css" scoped>
.section {
  margin-bottom: 18px;
}

.section__heading {
  margin-bottom: 4px;
}
.el-dialog__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
#designOrders >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: right;
  margin-bottom: 0 !important;
  /* height: 48px !important; */
}

#designOrders >>> .el-input__icon {
  line-height: 0;
}

#designOrders >>> .el-dialog__body {
  overflow: hidden;
  /* height: 65vh; */
  padding: 24px 19px !important;
  text-align: left !important;
}

#designOrders >>> .el-dialog__footer {
  margin: 0;
  text-align: right !important;
  padding: 10px !important;
}

#designOrders >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
}

#designOrders >>> .el-dialog__title {
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
  font-size: 15px;
  margin-left: 10px;
  color: #222222 !important;
}

#designOrders >>> .scroll-area {
  margin-left: 10px;
  overflow: visible !important;
}

#designOrders >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#designOrders >>> .button-confirm {
  background-color: #409eff !important;
  font-size: 16px !important;
  border: none !important;
  padding: 9px 2px !important;
  width: 200px !important;
  /* height: 40px !important; */
  border-radius: 4px !important;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#409eff),
    to(#3092f7)
  ) !important;
  background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
  font-family: "Helvetica Neue" !important;
  font-size: 18px !important;
  font-weight: bold !important;
  /* height: 50px !important; */
}

#designOrders >>> .create-button {
  margin-right: 15px;
}

#designOrders >>> .el-dialog {
  border-radius: 12px !important;
  height: auto !important;
  /* overflow-y: auto; */
}
#designOrders >>> .el-dialog__body {
  overflow-y: scroll;
}
@media (max-width: 1140px) {
  #designOrders >>> .el-dialog {
    border-radius: 12px !important;
    /* width: 90vw !important; */
    overflow-y: hidden;
    height: auto;
  }

  #designOrders >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  #designOrders >>> .el-dialog__body {
    overflow-y: scroll;
  }
}
.select-container {
  margin-bottom: 1rem;
}
.btn-section {
  display: flex;
  justify-content: right;
}
.btn-danger {
  background-color: red;
  color: white;
}
.btn-spacing {
  margin-right: 0.5rem;
}

.section_body {
  margin-bottom: 0.5rem;
}
</style>
