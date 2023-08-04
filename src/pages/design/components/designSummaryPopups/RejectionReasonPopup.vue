<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isRejectionReasonPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title="title"
      width="600px"
      @close="onDialogClose"
    >
      <div class="container">
        <pre v-if="orderStatus=='rejected'">{{rejectionReasonMessage}}</pre>
        <pre v-else-if="orderStatus=='cancelled'">{{cancelReasonMessage}}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "rejectionReasonPopup",

  props: {
    isRejectionReasonPopupVisible: {
      type: Boolean,
      default: false,
    },
    rejectionReasonMessage:{
      type : String,
      default: "",
    },
    cancelReasonMessage:{
      type : String,
      default:"",
    },
    orderStatus:{
      type : String,
      default:""
    }
  },

  data() {
    return {};
  },

  computed:{
    title(){
      if(this.orderStatus=='rejected')
       return 'Rejection Reason';
      else if(this.orderStatus=='cancelled') 
       return 'Cancellation Reason';
    }

  },

  methods: {
    onDialogClose() {
      this.$emit("update:isRejectionReasonPopupVisible", false);
    },
  },
};
</script>

<style scoped>

pre {
  white-space: pre-wrap; 
  word-wrap: break-word;
  font-family: inherit;
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
  /* width: 157px; */
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
  margin-top: 14vh !important;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 24px;
}

.reason {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  word-break: break-word;
}

.marginTop {
  margin-top: 16px;
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
}
</style>