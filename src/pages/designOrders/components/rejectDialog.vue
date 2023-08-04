<template>
  <div>
    <el-popover class="popover" placement="bottom" v-model="visible">
      <div class="container">
        <el-radio v-model="radio" label="1">Proposal Details missing</el-radio>
        <el-radio v-model="radio" label="2">other</el-radio>
        <el-input
          v-if="radio === '2'"
          placeholder="Please input"
          v-model="input"
        ></el-input>
        <div style="text-align: right; margin: 0; padding-top: 10px">
          <!-- <el-button size="mini" type="text" @click="visible = false"
            >cancel</el-button
          > -->
          <el-button type="primary" size="mini" @click="handleReject"
            >Reject</el-button
          >
          <RejectDialogConform
            :rejectState.sync="rejectState"
            :input="dispalyInput"
            :orderData="orderData"
            @reject-state="handleRejectStatus"
            @reject-confirm="handleRejectConfirm"
          />
        </div>
      </div>

      <el-button
        v-if="rejectState === false"
        slot="reference"
        type="danger"
        class="btn btn-danger"
        >Reject</el-button
      >
    </el-popover>
  </div>
</template>

<script>
import RejectDialogConform from "./rejectDialogConform.vue";

export default {
  name: "rejectDialog",
  data() {
    return {
      visible: false,
      radio: "0",
      input: null,
      rejectState: false,
      dispalyInput: null,
    };
  },
  props: {
    orderData: {
      type: Object,
      required: true,
    },
    orderDetailsPopVisible: {
      type: Boolean,
      default: false,
    },
    rejectStatus: {
      type: Boolean,
    },
  },
  components: {
    RejectDialogConform,
  },

  methods: {
    handleRejectStatus(status) {
      this.visible = status;
      this.rejectState = status;
      this.$emit("update:orderDetailsPopVisible", false);
    },
    handleRejectConfirm() {
      console.log("askghasdgsdabhgash");
      this.$emit("update:rejectStatus", true);
    },
    handleReject() {
      this.rejectState = true;
      if (this.radio === "1") {
        this.dispalyInput = "Proposal Details missing";
      } else {
        this.dispalyInput = this.input;
      }
      console.log(this.input);
    },
  },
};
</script>

<style scoped>
.popover {
  border: none;
}
.container {
  box-sizing: border-box;
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 16px;
}
.btn-danger {
  background-color: red;
  color: white;
}
.el-radio {
  padding: 10px;
  font-size: 1rem;
}
.el-popper .el-popper {
  visibility: hidden !important;
}
</style>
