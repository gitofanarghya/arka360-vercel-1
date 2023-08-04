<template>
  <div id="designOrders">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      @close="oncloseDialog"
      :show-close="true"
      style="min-width: 800px"
      :title="'Order Details'"
      width="90%"
    >
      <div>
        <el-row class="btn-section">
          <button
            v-if="orderData.order_status === 'incomplete'"
            class="btn btn-primary btn-spacing"
            @click="handleAccept"
            data-toggle="modal"
            data-target="#make_panel"
          >
            Accept
          </button>
          <!-- <button
            class="btn btn-danger"
            @click="resetSearch()"
            data-toggle="modal"
            data-target="#make_panel"
          >
            Reject
          </button> -->
          <RejectDialog
            v-if="orderData?.order_status !== 'rejected'"
            :orderData="orderData"
            :orderDetailsPopVisible.sync="orderDetailsPopVisible"
          />
        </el-row>
      </div>
      <!---------------------------- Customer details---------------------->

      <div class="section">
        <el-row class="section_body">
          <el-col :span="24"
            ><h3 class="section__heading">Customer Details</h3></el-col
          >
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Name :</el-col>
          <el-col :span="18">{{ projectData?.client_name || "NA" }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6"><h4>Email :</h4> </el-col>
          <el-col :span="18">{{ projectData?.client_email_id || "NA" }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Address :</el-col>
          <el-col :span="18">{{ projectData?.client_address || "NA" }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Token :</el-col>
          <el-col :span="18">{{ orderData?.user_token || "NA" }}</el-col>
        </el-row>
      </div>
      <!---------------------------- Owner details---------------------->
      <div class="section">
        <el-row>
          <el-col :span="24"
            ><h3 class="section__heading">Owner Details</h3></el-col
          >
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Name :</el-col>
          <el-col :span="18">{{
            orderData?.created_by.first_name +
              orderData?.created_by.last_name || "NA"
          }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6"><h4>Email :</h4> </el-col>
          <el-col :span="18">{{ orderData?.created_by.email || "NA" }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Phone Number :</el-col>
          <el-col :span="18">{{ orderData?.created_by.phone || "NA" }}</el-col>
        </el-row>
      </div>

      <!---------------------------- Project details---------------------->
      <div class="section">
        <el-row>
          <el-col :span="24"
            ><h3 class="section__heading">Project Details</h3></el-col
          >
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">ID :</el-col>
          <el-col :span="18">{{ projectData?.id }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6"><h4>Stage :</h4> </el-col>
          <el-col :span="18">{{ projectData?.stage || "NA" }}</el-col>
        </el-row>
      </div>
      <!-- moudle inverter details -->
      <div class="section">
        <el-row>
          <el-col :span="24"
            ><h3 class="section__heading">Moudle Inverter Data</h3></el-col
          >
        </el-row>

        <el-row>
          <el-col :span="6">Module ID :</el-col>
          <el-col :span="18">{{
            orderData?.module_inverter_data?.moduleID || "NA"
          }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="6"><h4>Inverter ID :</h4> </el-col>
          <el-col :span="18">{{
            orderData?.module_inverter_data?.inverterID || "NA"
          }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="6">Module Data :</el-col>
          <el-col :span="18">{{
            orderData?.module_inverter_data?.moduleData || "NA"
          }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="6">Inverter Data :</el-col>
          <el-col :span="18">{{
            orderData?.module_inverter_data?.moduleData || "NA"
          }}</el-col>
        </el-row>
      </div>

      <!-- Additional Notes -->
      <div class="section">
        <el-row>
          <el-col :span="24"
            ><h3 class="section__heading">Additional Notes</h3></el-col
          >
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Local Code :</el-col>
          <el-col :span="18">{{
            orderData?.additional_notes?.local_code || "NA"
          }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6"><h4>Phone Number:</h4> </el-col>
          <el-col :span="18">{{
            orderData?.additional_notes?.phone_number || "NA"
          }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Email Address :</el-col>
          <el-col :span="18">{{
            orderData?.additional_notes?.email_address || "NA"
          }}</el-col>
        </el-row>

        <el-row class="section_body">
          <el-col :span="6">Project Requirements :</el-col>
          <el-col :span="18">{{
            orderData?.additional_notes?.Project_Requirements || "NA"
          }}</el-col>
        </el-row>
      </div>
      <!-- Assign To select  -->

      <div class="section">
        <el-row>
          <el-col :span="6"> Assign to :</el-col>
          <el-col :span="18">
            <el-select
              class="select-container"
              v-model="orderData.engineer_name"
              placeholder="Select"
              @change="onAssigneeChange"
            >
              <el-option
                v-for="item in users"
                :key="item.id"
                :label="item.first_name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6"> Order Status :</el-col>
          <el-col :span="18">
            <el-select
              class="select-container"
              v-model="orderData.order_status"
              placeholder="Select"
              @change="onStautsChange"
            >
              <el-option
                v-for="item in orderStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>

      <DndUploader
        :limit="2"
        :permittedFileTypes="'.png, .jpg, .xlsx '"
        :handleUpload="handleUploadFiles"
      />
      <div :v-if="documentData">
        <!-- 
        <DesignOrdersTableView
          :headers="documentTableHeaders"
          :data="documentData"
          :handleOrderClick="handleDownloadFile"
          :buttonsData="buttonsData"
          @actions-handler="handleAction"
        /> -->

        <DialogTable
          v-if="documentDataformat?.length > 0"
          :headers="documentTableHeaders"
          :data="documentData"
          :handleOrderClick="handleDownloadFile"
          :buttonsData="buttonsData"
          @actions-handler="handleAction"
        />

        <DeleteConformation
          v-if="isDeleteProjectDocumentPopupOpen"
          :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
          :title="`Delete Document`"
          :info="`Are you sure you want to delete this file?`"
          @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
          @confirmDelete="confirmDelete"
        />
      </div>

      <!-- Order status select  -->

      <!-- <div class="footer">
        <el-button type="primary" @click="oncloseDialog">Ok</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
import DndUploader from "./upload.vue";
import DesignOrdersTableView from "./designOrdersTableView.vue";
import RejectDialog from "./rejectDialog.vue";
import RejectDialogConform from "./rejectDialogConform.vue";
import DialogTable from "./diaogTable.vue";
import { DateTime } from "luxon";
import { saveAs } from "file-saver";
import DeleteConformation from "./deleteConformation.vue";

export default {
  name: "DesignOrderInfoPopup",
  components: {
    RejectDialog,
    RejectDialogConform,
    DndUploader,
    DesignOrdersTableView,
    DialogTable,
    DeleteConformation,
  },

  props: {
    orderDetailsPopVisible: {
      type: Boolean,
      default: false,
    },

    order: {
      required: true,
    },
    users: {
      type: Array,
    },
    dialogUpdates: {
      type: Boolean,
    },
  },

  data() {
    return {
      orderData: null,
      documentData: null,
      projectData: null,
      isDeleteProjectDocumentPopupOpen: false,
      documentId: null,

      value: "incomplete",
      orderStatusOptions: [
        {
          label: "Incomplete",
          value: "incomplete",
        },
        { label: "In-Process", value: "in_process" },

        { label: "Pending", value: "pending" },
        { label: "Complete", value: "complete" },

        { label: "Reject", value: "rejected" },
        { label: "Cancel", value: "cancelled" },
      ],

      documentTableHeaders: [
        { prop: "id", label: "Document ID", width: "140" },
        { prop: "display_name", label: "Name", width: "140" },
        { prop: "file_type", label: "Type", width: "140" },
        { prop: "created_at", label: "Created on", width: "140" },
      ],
      buttonsData: [
        {
          type: "primary",
          icon: "el-icon-download",
          size: "mini",
          handleAction: "btn1Action()",
          callback: (row) => {
            console.log("Table 1 Delete", row);
            this.handleDownloadFile(row);
            // this.handleDesign(row);
          },
          exist: "dialog",
          tooltipContent: "Download Document",
        },
        {
          type: "danger",
          icon: "el-icon-delete",
          size: "mini",
          handleAction: "btn1Action()",
          callback: (row) => {
            console.log("Table sdf", row);
            this.isDeleteProjectDocumentPopupOpen = true;
            this.documentId = row.id;
            // this.handleDesign(row);
          },
          exist: "dialog",
          tooltipContent: "Delete Document",
        },
      ],
    };
  },
  computed: {
    documentDataformat() {
      this.documentData?.map((d) => {
        d.modified_at = DateTime.fromISO(d.modified_at).toFormat("dd/MM/y");
        d.created_at = DateTime.fromISO(d.created_at).toFormat("dd/MM/y");
      });
      console.log(this.documentData);
      return this.documentData;
    },
  },
  methods: {
    handleAction(data) {
      console.log("action", data);
      this.btn1Action();
    },
    async handleDownloadFile(postData) {
      console.log(postData);
      const documentid = {
        document_ids: [postData.id],
      };

      if (postData.id) {
        let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(documentid);

        if (response.data.length > 0) {
          for (let fileUrl of response.data) {
            let splitArray = fileUrl.split("?")[0].split("/");
            let fileName = splitArray[splitArray.length - 1];
            const regForFileName = /-[0-9a-zA-Z]{12}_/;
            let display_name_arr = fileName.split(regForFileName);
            let display_name;
            if (display_name_arr.length > 0) {
              display_name = display_name_arr[display_name_arr.length - 1];
            } else splitArray[splitArray.length - 1];
            saveAs(fileUrl, display_name);
          }
        }
      }

      // console.log(response);
    },
    updateOrders(id, data) {
      API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(id, data);
      this.$emit("update:dialogUpdates", !this.$props.dialogUpdates);
    },
    oncloseDialog() {
      this.$emit("update:orderDetailsPopVisible", false);
    },
    onStautsChange(e) {
      const status = { order_status: e };
      this.updateOrders(this.orderData.id, status);
    },
    onAssigneeChange(e) {
      const assignee = { engineer_name: e };
      this.updateOrders(this.orderData.id, assignee);
    },
    handleAccept() {
      console.log("accept");
      console.log(this.orderData);
      let orderStatus = {
        order_status: "in_process",
      };
      this.updateOrders(this.orderData.id, orderStatus);
    },
    async handleUploadFiles(data) {
      const formData = new FormData();
      formData.append("project", this.orderData.project);
      formData.append("order", this.orderData.id);
      formData.append("uploaded_by", "designer");
      data.map((item) => formData.append("file[]", item.raw));

      let response = await API.DOCUMENT_INFO.POST_DOCUMENTS(formData);
      this.getDocuments(this.orderData.project, this.orderData.id);
    },
    async getDocumentsByDesigner(projectId, orderId) {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_DESIGNER(
        projectId,
        "designer",
        orderId
      );
      console.log(response);
      return response.data;
    },
    async getDocumentsByInstaller(projectId, orderId) {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_DESIGNER(
        projectId,
        "installer",
        orderId
      );
      console.log(response);
      return response.data;
    },
    async getDocuments(projectId, orderId) {
      const designerDocs = await this.getDocumentsByDesigner(
        projectId,
        orderId
      );
      const installerDocs = await this.getDocumentsByInstaller(
        projectId,
        orderId
      );
      const newData = [];
      newData.push(...designerDocs);
      newData.push(...installerDocs);
      this.documentData = newData;
    },
    async confirmDelete(isDelete) {
      if (this.documentId) {
        if (isDelete) {
          try {
            let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(
              this.documentId
            );
            this.documentId = "";
            this.isDeleteProjectDocumentPopupOpen = false;
            this.getDocuments(this.orderData.project, this.orderData.id);
          } catch (error) {
            let errorMessage =
              error.response.status === 403
                ? "You don't have permission to edit this project."
                : "error";
            this.$message({
              showClose: true,
              message: errorMessage,
              type: "error",
              center: true,
            });

            this.isDeleteProjectDocumentPopupOpen = false;
          }
        }
      } else {
        if (isDelete) {
          let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(
            this.fileIdToBeDeletedForDesigner
          );
          this.fileIdToBeDeletedForDesigner = "";
          this.isDeleteProjectDocumentPopupOpen = false;
          this.getFilesForDesigner();
        }
      }
    },
  },

  async mounted() {
    console.log("order", this.order);
    if (!this.order) return;
  },

  watch: {
    async order(newOrder, oldOrder) {
      console.log(newOrder, oldOrder);

      this.projectData = newOrder.project ? newOrder.project : null;

      let response = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_BY_ID_METHOD(
        newOrder.id
      );
      console.log(response);
      this.orderData = response.data;
      if (response.data) {
        let documentResponse = await this.getDocuments(
          response.data.project,
          response.data.id
        );
        // this.documentData = documentResponse.data
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../../../styles/components/button";
@import "../../../styles/components/switch";
@import "../../../styles/components/forms";
</style>

<style type="text/css" scoped>
.section {
  margin-bottom: 18px;
}

.section__heading {
  margin-bottom: 4px;
}

#designOrders >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#designOrders >>> .el-input__icon {
  line-height: 0;
}

#designOrders >>> .el-dialog__body {
  overflow: hidden;
  height: 65vh;
  padding: 24px 19px !important;
}

#designOrders >>> .el-dialog__footer {
  margin: 0;
  text-align: center !important;
  padding: 0px !important;
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
  height: 50px !important;
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
    width: 90vw !important;
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
  margin: 0;
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
.footer {
  display: flex;
  justify-content: flex-end;
}
</style>
