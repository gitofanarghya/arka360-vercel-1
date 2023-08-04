<template>
  <div class="deleteModule" v-if="isShareDocumentPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      title="Add User"
      class="delete_module"
      append-to-body
    >
      <div class="container">
        <div class="Rectangle">
          <p v-if="requestedServiceType" class="rectContent">
            {{ requestedServiceType }}
          </p>
          <p v-if="!requestedServiceType" class="rectContent">
            Upload Documents
          </p>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isShareDocumentPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <div
          class="contContainer"
          id="fileContainer"
          @dragover="dragover"
          @drop="drop"
        >
          <h3 class="containerHeading">Share Documents (Optional)</h3>
          <h3 class="containerNote">
            The maximum file size can not exceed 50MB.
          </h3>
          <div class="gridContainer">
            <div class="conditionCont">
              <div class="card" v-for="(file, index) in fileList" :key="index">
                <img
                  src="../../../assets/drop/x-circle-fill.svg"
                  class="crossIcon"
                  @click="remove(index, file)"
                />
                <img
                  :src="
                    fileUploadAssets[
                      `/src/assets/drop/fileUploadImages/${findFileTypeIcon(
                        file
                      )}`
                    ]
                  "
                />
                <p class="contentSD" v-if="file.display_name">
                  <abbr :title="file.name" class="abbrTag">{{
                    file.display_name
                  }}</abbr>
                </p>
                <p class="contentSD" v-else>
                  <abbr :title="file.name" class="abbrTag">{{
                    file.name
                  }}</abbr>
                </p>
              </div>
              <fileUpload
                @openFiles="openFiles"
                :key="componentKey"
                :enableDragAndDrop="enableDragAndDrop"
              ></fileUpload>
            </div>
          </div>
        </div>

        <div
          class="footer"
          v-if="$route.name != 'projectSummary' && isCRMMode == false"
        >
          <p class="footerStep">
            Step {{ currentStepInProp
            }}<span class="unBold">/{{ totalSteps }}</span>
          </p>
          <div class="notesBtn">
            <el-button
              class="backBtn"
              @click="$emit('closeShareDocumentPopup', 'previous')"
              :disabled="this.isExecuting"
              >Back</el-button
            >
            <el-button
              :loading="isExecuting"
              type="primary"
              class="submitBtn"
              @click="closeShareDocumentPopup()"
              >Save & Next</el-button
            >
          </div>
        </div>
        <div class="footer" v-if="isCRMMode || $route.name == 'projectSummary'">
          <div></div>
          <el-button
            :loading="isExecuting"
            type="primary"
            class="submitBtn"
            @click="saveDocuments(false)"
            >Save</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import fileUpload from "../../../../src/components/ui/fileUpload.vue";
import fileType from "@/pages/utils/fileType";
import API from "@/services/api";
import { mapActions, mapState } from "pinia";
import { useLeadStore } from "../../../stores/lead";

const fileUploadAssets = import.meta.glob(
  "/src/assets/drop/fileUploadImages/*",
  { eager: true, as: "url" }
);

export default {
  name: "shareDocumentPopup",
  components: {
    fileUpload,
  },

  props: {
    projectId: {
      default: null,
    },
    isShareDocumentPopupVisible: {
      type: Boolean,
      default: false,
    },
    currentStepInProp: {
      type: Number,
      default: 1,
    },
    totalSteps: {
      type: Number,
      default: 5,
    },
    request_object_id: {
      type: Number,
      default: 5,
    },
    requestedServiceType: {
      type: String,
      default: "",
    },
    projectIdFromGenericComponent: {
      type: Number,
      default: 5,
    },
    isCRMMode: {
      type: Boolean,
      default: false,
    },
    documentContainer: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      enableDragAndDrop: false,
      isExecuting: false,
      fileList: [],
      DragFileList: [],
      componentKey: 0,
      fileListBeforeArray: [],
      uploaded_by: "installer",
      fileSize: 0,
      maxFileSize: 52428800.0,
      UploadFileType: "",
      fileTypeIncorrect: false,
      fileUploadAssets,
    };
  },
  computed: {
    ...mapState(useLeadStore, {
      leadInfo: (state) => state,
    }),
  },
  watch: {
    isShareDocumentPopupVisible: {
      handler(val) {
        if (val) {
          this.fileList = [];
          if (this.$route.name != "projectSummary") {
            this.getFiles();
          }
        }
      },
    },
  },
  mounted() {},
  methods: {
    dragover(event) {
      event.preventDefault();
    },
    async getFiles() {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_INSTALLER(
        this.$props.projectIdFromGenericComponent,
        "installer",
        this.$props.request_object_id
      );
      this.fileList = response.data;
    },
    drop(event) {
      event.preventDefault();
      this.DragFileList = event.dataTransfer.files;
      this.openFiles(this.DragFileList);
    },
    fileSizeValidation(fileList) {
      for (let i = 0; i < fileList.length; i++) {
        this.fileSize += parseInt(fileList[i].size);
      }
    },
    fileTypeValidation(fileList) {
      for (let j = 0; j < fileList.length; j++) {
        this.UploadFileType = fileList[j];
        if (this.UploadFileType.type === "application/x-msdownload") {
          this.fileTypeIncorrect = true;
          return;
        }
        this.fileTypeIncorrect = false;
      }
    },
    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
      if (file.file_type) {
        if (fileType[file.file_type]) {
          iconName = fileType[file.file_type];
        } else {
          if (
            file.display_name.split(".").pop() === "dxf" ||
            file.display_name.split(".").pop() === "dwg"
          ) {
            iconName = fileType["image/x-dxf"];
          }
        }
      } else {
        if (fileType[file.type]) {
          iconName = fileType[file.type];
        } else {
          if (
            file.name.split(".").pop() === "dxf" ||
            file.name.split(".").pop() === "dwg"
          ) {
            iconName = fileType["image/x-dxf"];
          }
        }
      }
      return iconName;
    },
    async saveDocuments(fromOrderServicePopups) {
      if (this.fileSize > this.maxFileSize) {
        this.$message({
          showClose: true,
          message: "The maximum file size can not exceed 50MB.",
          type: "error",
          center: true,
        });
        return;
      }
      this.fileTypeValidation(this.fileList);
      if (this.fileTypeIncorrect) {
        this.$message({
          showClose: true,
          message: ".exe file format not supported",
          type: "error",
          center: true,
        });
        return;
      }
      this.isExecuting = true;
      let postData = new FormData();
      for (let file of this.fileList) {
        if (file.name) {
          postData.append(
            "file[]",
            file,
            file?.name?.replace(/[<>$:@"\/%|\?\#*!]/g, "_")
          );
        }
      }
      postData.append("uploaded_by", "installer");
      if (this.isCRMMode) {
        postData.append("document_container", this.documentContainer);
      }
      if (fromOrderServicePopups == true) {
        postData.append("order", this.$props.request_object_id);
        postData.append("project", this.$props.projectIdFromGenericComponent);
      } else if (this.isCRMMode) {
        let projectId = this.leadInfo?.project_details?.id || this.projectId;
        postData.append("project", projectId);
      } else {
        let projectId = this.$route.params.projectId
          ? this.$route.params.projectId
          : this.projectId;
        postData.append("project", projectId);
      }
      try {
        let response = await API.DOCUMENT_INFO.POST_DOCUMENTS(postData);
        this.getFiles();
        this.$emit("confirmUploaded", response.data);
      } catch (error) {
        let errorMessage =
          error.response.status === 403
            ? "You don't have permission to edit this project."
            : "Error in uploading Document, Try again.";
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true,
        });

        this.isExecuting = false;
        return;
      }

      this.isExecuting = false;
      this.$emit("closeShareDocumentPopup", "next");
      this.$emit("update:isShareDocumentPopupVisible", false);
    },
    closeShareDocumentPopup() {
      this.saveDocuments(true);
    },
    openFiles(fileList) {
      this.fileSizeValidation(fileList);
      this.fileTypeValidation(fileList);
      this.fileListBeforeArray = fileList;
      let incomingFiles = Array.from(fileList);
      for (let i = 0; i < incomingFiles.length; i++) {
        this.fileList.push(incomingFiles[i]);
      }
      setTimeout(this.scrollToBottom, 10);
      this.componentKey++;
    },

    remove(index, file) {
      this.fileSize = 0;
      this.UploadFileType = "";
      if (file && file.id) {
        this.confirmDelete(file.id);
      }
      let temp = Array.from(this.fileList);
      temp.splice(index, 1);
      this.fileList = temp;
      this.fileSizeValidation(this.fileList);
      this.fileTypeValidation(this.fileList);
    },
    async confirmDelete(fileID) {
      if (fileID) {
        let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(fileID);

        // this.getFiles();
      }
    },
    scrollToBottom() {
      let objDiv = document.getElementById("fileContainer");
      objDiv.scrollTop = objDiv.scrollHeight;
    },
  },
};
</script>

<style scoped>
.backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
}
.consumptionSubheading {
  font-family: HelveticaNeue;
  font-size: 14px;
  font-weight: 100;
  line-height: 1.36;
  text-align: left;
  color: #222;
  padding-left: 14px;
  padding-top: 15px;
  word-break: break-word;
}
.notesBtn {
  display: flex;
  justify-content: space-between;
  align-content: space-between;
  margin-left: 4px;
  flex-wrap: wrap;
  width: auto;
}

.el-dialog__wrapper >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.el-dialog__wrapper >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.el-dialog__wrapper >>> .el-dialog__header {
  display: none;
}

.el-dialog__wrapper >>> .el-dialog__body {
  padding: 0 !important;
}

.el-dialog__wrapper >>> .delete_module {
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

.containerHeading {
  color: #777777;
  font-size: 16px;
  font-weight: 100;
  margin-bottom: 8px;
}
.containerNote {
  color: #222;
  font-size: 11px;
  font-weight: 100;
  margin-bottom: 12px;
}

.contContainer {
  padding: 24px;
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

.deleteModule .submitBtn {
  padding: 12px 14px;
  font-size: 14px !important;
  margin-left: 11px;
}

.conditionCont {
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(auto-fill, 160px);
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px;
  height: 160px;
  border-radius: 4px;
  background-color: #e8edf2;
  position: relative;
  text-align: center;
  border: none;
  margin-top: 0px !important;
}

.crossIcon {
  position: absolute;
  top: -7px;
  right: -7px;
  cursor: pointer;
}

.contentSD {
  line-height: 1.5;
  margin-top: 10px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.abbrTag {
  text-decoration: none;
}

.createIcon {
  cursor: pointer;
}

.addContentSD {
  line-height: 1.5;
  margin-top: 10px;
  font-size: 16px;
  color: #222;
  word-break: break-word;
  font-weight: 600;
}

@media (max-width: 600px) {
  .el-dialog__wrapper >>> .el-dialog {
    width: 90% !important;
  }

  .contContainer {
    padding: 12px 18px;
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
  .deleteModule .submitBtn {
    padding: 12px 14px;
    font-size: 16px !important;
    margin-left: 11px;
  }
}
@media (min-width: 600px) {
  .deleteModule .submitBtn {
    padding: 12px 14px;
    font-size: 16px !important;
    margin-left: 11px;
  }
}
@media (max-width: 420px) {
  .conditionCont {
    display: grid;
    grid-gap: 4%;
    grid-template-columns: 48% 48%;
  }
}
@media (min-width: 420px) {
  .notesBtn {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -ms-flex-line-pack: justify;
    align-content: space-between;
    margin-left: 4px;
    width: auto;
    flex-wrap: wrap;
  }
}
</style>
