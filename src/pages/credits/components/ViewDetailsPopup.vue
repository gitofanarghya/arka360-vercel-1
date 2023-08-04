<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isViewDetailsPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      :title="transactionDetails.service_type"
      width="700px"
      @close="onDialogClose"
    >
      <div class="container">
        <div v-if="transactionDetails.order_type != 'Credit Purchase'" class="prNameContainer">
          <p class="heading">Project Name</p>
          <p class="value" v-if="transactionDetails.project_id">{{transactionDetails.project_name}}</p>
          <p class="value" v-else>N/A</p>
          <router-link v-if="transactionDetails.project_id" :to="'/projectSummary/' + transactionDetails.project_id" class="viewProject">
            View Project
          </router-link>
        </div>
        <div class="orderTypeContainer">
          <p class="heading">Order Type</p>
          <p class="value">{{transactionDetails.order_type}}</p>
        </div>
        <div v-if="transactionDetails.order_type != 'Credit Purchase'" class="featuresContainer">
          <p class="heading">Added Features</p>
          <div v-if="!transactionDetails.added_features.length">
            —
          </div>
          <li class="liValues" v-for="(feature, ind) in transactionDetails.added_features" :key="'f' + ind">
            {{feature}}
          </li>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
  
  <script>
export default {
  name: "viewDetailsPopup",

  props: {
    isViewDetailsPopupVisible: {
      type: Boolean,
      default: false,
    },
    transactionDetails: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {};
  },

  methods: {
    onDialogClose() {
      this.$emit("update:isViewDetailsPopupVisible", false);
    },
  },
};
</script>
  
  <style scoped>
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
  margin-left: 5px;
  font-family: "Helvetica Neue";
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  font-size: 16x;
  color: #1c3366 !important;
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 24px;
  padding: 24px 24px 40px 24px;
  word-break: break-word;
}

.heading {
  font-size: 14px;
  color: #777;
  margin-bottom: 8px;
}

.value,
.liValues {
  font-size: 16px;
  color: #222;
  list-style-type: none;
  margin-bottom: 8px;
}

.viewProject {
	color: #1c3366;
	font-size: 14px;
	font-weight: 600;
	text-decoration: underline;
	margin-top: 10px;
	cursor: pointer;
}

/* .liValues:before {
  content: '✓';
  margin-right: 12px;
  color: #0fbc0f;
  font-size: 14px;
} */

@media (max-width: 780px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    top: -5vw;
    min-width: 0 !important;
    overflow: hidden;
  }
}

@media (max-width: 500px) {
  .container {
    grid-template-columns: 1fr;
    grid-gap: 24px;
  }
}

</style>