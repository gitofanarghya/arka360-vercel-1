<template>
  <div class="docContainer">
    <div class="electBillContainer">
      <div class="flexCont">
        <el-checkbox v-model="electricityBillCheckbox"
          >Electricity Bill</el-checkbox
        >
        <p class="downloadAll" @click="downloadSelected">Download Selected</p>
      </div>
      <div class="gridCOntainer">
        <div
          class="card"
          v-for="(file, index) in computedElectricityBillFiles"
          :key="index"
        >
          <img
            :src="
              fileUploadAssets[
                `../../../assets/drop/fileUploadImages/${findFileTypeIcon(
                  file
                )}`
              ]
            "
            class="uploadIcon"
          />
          <p class="docFileName">
            <abbr :title="file.display_name" class="abbrTag">{{
              file.display_name
            }}</abbr>
          </p>
          <div class="flexIcon">
            <img
              src="./assets/Download.svg"
              class="downloadIconDoc"
              @click="downloadClick(file)"
            />
            <img
              src="./assets/delete.svg"
              class="deleteIcon"
              @click="deleteClick(file.id)"
            />
          </div>
        </div>
        <div
          class="addCard"
          @click="commonDocumentContainerFunc('electricity_bill')"
        >
          <img src="./assets/add.svg" class="addIcon" />
        </div>
      </div>
    </div>
    <div class="electBillContainer">
      <div class="flexCont">
        <el-checkbox v-model="signedContractCheckbox"
          >Signed Contract</el-checkbox
        >
      </div>
      <div class="gridCOntainer">
        <div
          class="card"
          v-for="(file, index) in computedSignedContractFiles"
          :key="index"
        >
          <img
            :src="
              fileUploadAssets[
                `../../../assets/drop/fileUploadImages/${findFileTypeIcon(
                  file
                )}`
              ]
            "
            class="uploadIcon"
          />
          <p class="docFileName">
            <abbr :title="file.display_name" class="abbrTag"
              >{{ file.display_name }}
            </abbr>
          </p>
          <div class="flexIcon">
            <img
              src="./assets/Download.svg"
              class="downloadIconDoc"
              @click="downloadClick(file)"
            />
            <img
              src="./assets/delete.svg"
              class="deleteIcon"
              @click="deleteClick(file.id)"
            />
          </div>
        </div>
        <div
          class="addCard"
          @click="commonDocumentContainerFunc('signed_contract')"
        >
          <img src="./assets/add.svg" class="addIcon" />
        </div>
      </div>
    </div>
    <div class="electBillContainer">
      <div class="flexCont">
        <el-checkbox v-model="financeCheckbox"
          >Finance Approval / Cash</el-checkbox
        >
      </div>
      <div class="gridCOntainer">
        <div
          class="card"
          v-for="(file, index) in computedFinanceFiles"
          :key="index"
        >
          <img
            :src="
              fileUploadAssets[
                `../../../assets/drop/fileUploadImages/${findFileTypeIcon(
                  file
                )}`
              ]
            "
            class="uploadIcon"
          />
          <p class="docFileName">
            <abbr :title="file.display_name" class="abbrTag"
              >{{ file.display_name }}
            </abbr>
          </p>
          <div class="flexIcon">
            <img src="./assets/Download.svg" class="downloadIconDoc" @click="downloadClick(file)"/>
            <img src="./assets/delete.svg" class="deleteIcon" @click="deleteClick(file.id)" />
          </div>
        </div>
        <div class="addCard" @click="commonDocumentContainerFunc('finance')">
          <img src="./assets/add.svg" class="addIcon" />
        </div>
      </div>
    </div>
    <div class="electBillContainer">
      <div class="flexCont">
        <el-checkbox v-model="siteSurveyCheckbox"
          >Site Survey</el-checkbox
        >
      </div>
      <div class="gridCOntainer">
        <div
          class="card"
          v-for="(file, index) in computedSiteSurveyFiles"
          :key="index"
        >
          <img
            :src="
              fileUploadAssets[
                `../../../assets/drop/fileUploadImages/${findFileTypeIcon(
                  file
                )}`
              ]
            "
            class="uploadIcon"
          />
          <p class="docFileName">
            <abbr :title="file.display_name" class="abbrTag"
              >{{ file.display_name }}
            </abbr>
          </p>
          <div class="flexIcon">
            <img src="./assets/Download.svg" class="downloadIconDoc" @click="downloadClick(file)"/>
            <img src="./assets/delete.svg" class="deleteIcon" @click="deleteClick(file.id)" />
          </div>
        </div>
        <div class="addCard" style="cursor: not-allowed">
          <img src="./assets/add.svg" class="addIcon" />
        </div>
      </div>
    </div>
    <div class="electBillContainer otherDoc">
      <div class="flexCont">
        <el-checkbox v-model="otherDocCheckbox">Other Documents</el-checkbox>
      </div>
      <div class="gridCOntainer">
        <div
          class="card"
          v-for="(file, index) in computedOtherFiles"
          :key="index"
        >
          <img
            :src="
              fileUploadAssets[
                `../../../assets/drop/fileUploadImages/${findFileTypeIcon(
                  file
                )}`
              ]
            "
            class="uploadIcon"
          />
          <p class="docFileName">
            <abbr :title="file.display_name" class="abbrTag"
              >{{ file.display_name }}
            </abbr>
          </p>
          <div class="flexIcon">
            <img src="./assets/Download.svg" class="downloadIconDoc" @click="downloadClick(file)"/>
            <img src="./assets/delete.svg" class="deleteIcon" @click="deleteClick(file.id)"/>
          </div>
        </div>
        <div class="addCard" @click="commonDocumentContainerFunc('other')">
          <img src="./assets/add.svg" class="addIcon" />
        </div>
      </div>
    </div>
    <div class="flexCont lastFlexCont">
      <div></div>
      <p class="downloadAll" @click="downloadAllClick">
        Download All Documents
      </p>
    </div>
    <ShareDocumentPopup
      :isShareDocumentPopupVisible.sync="isShareDocumentPopupVisible"
      :isCRMMode="isCRMMode"
      @confirmUploaded="confirmUploaded"
      :projectId="projectId"
      :documentContainer="documentContainer"
    />
    <DeleteProjectDocument
      v-if="isDeleteProjectDocumentPopupOpen"
      :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
      @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
      @confirmDelete="confirmDelete"
    />
  </div>
</template>

<script>
import API from "@/services/api";
import DeleteProjectDocument from "../../project/components/projectDocuments/deleteProjectDocument.vue";
import ShareDocumentPopup from "../../dashboard/components/shareDocumentPopup.vue";
import fileType from "@/pages/utils/fileType";
import { mapActions, mapState } from "pinia";
import { useLeadStore } from "../../../stores/lead";

const fileUploadAssets = import.meta.glob(
  "../../../../src//assets/drop//fileUploadImages/*",
  { eager: true, as: "url" }
);

export default {
  components: {
    ShareDocumentPopup,
    DeleteProjectDocument,
  },

  props: {
    lead: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      uploaded_by_installer: "installer",
      electricityBillCheckbox: false,
      signedContractCheckbox: false,
      otherDocCheckbox: false,
      financeCheckbox: false,
      siteSurveyCheckbox: false,
      showHistoryBtn: false,
      isShareDocumentPopupVisible: false,
      isDeleteProjectDocumentPopupOpen: false,
      isCRMMode: true,
      fileList: [],
      electricityBillFiles: [],
      signedContractFiles: [],
      financeFiles: [],
      siteSurveyFiles: [],
      otherFiles: [],
      fileIdToBeDeleted: "",
      documentContainer: null,
      fileUploadAssets,
    };
  },

  created() {
    this.getFiles();
  },

  computed: {
    computedFileList() {
      return this.fileList;
    },
    ...mapState(useLeadStore, {
      leadInfo: (state) => state,
    }),
    computedElectricityBillFiles() {
      return this.electricityBillFiles;
    },
    computedSignedContractFiles() {
      return this.signedContractFiles;
    },
    computedFinanceFiles() {
      return this.financeFiles;
    },
    computedSiteSurveyFiles() {
      return this.siteSurveyFiles;
    },
    computedOtherFiles() {
      return this.otherFiles;
    },
    projectId() {
      return this.lead?.id || this.leadInfo?.project_details?.id
    }
  },

  methods: {
    commonDocumentContainerFunc(val) {
      this.isShareDocumentPopupVisible = true;
      this.documentContainer = val;
    },
    ...mapActions(useLeadStore, {
            setActivity: "SET_ACTIVITY"
        }),
    async getFiles() {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FOR_CRM(
        this.projectId
      );
      this.fileList = response.data;
      this.electricityBillFiles = [];
      this.signedContractFiles = [];
      this.financeFiles = [];
      this.otherFiles = [];

      this.fileList.forEach((obj) => {
        if (obj.document_container == "electricity_bill") {
          this.electricityBillFiles.push(obj);
        } else if (obj.document_container == "signed_contract") {
          this.signedContractFiles.push(obj);
        } else if (obj.document_container == "finance") {
          this.financeFiles.push(obj);
        } else if (obj.document_container == "site_survey") {
          this.siteSurveyFiles.push(obj);
        } else {
          this.otherFiles.push(obj);
        }
      });
    },

    async downloadAllClick() {
      let arrayIds = [];
      if (this.fileList.length > 0) {
        for (var i = 0; i < this.fileList.length; i++) {
          arrayIds.push(this.fileList[i].id);
        }
      }

      let postData = {
        document_ids: arrayIds,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
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
    },

    async downloadSelected() {
      let arrayIds = [];
      let checkboxes = [
        {
          name: "electricityBillCheckbox",
          files: this.computedElectricityBillFiles,
        },
        {
          name: "signedContractCheckbox",
          files: this.computedSignedContractFiles,
        },
        { name: "otherDocCheckbox", files: this.computedOtherFiles },
        { name: "financeCheckbox", files: this.computedFinanceFiles },
        { name: "siteSurveyCheckbox", files: this.computedSiteSurveyFiles },
      ];

      for (let checkbox of checkboxes) {
        if (this[checkbox.name] && checkbox.files.length > 0) {
          for (let file of checkbox.files) {
            arrayIds.push(file.id);
          }
        }
      }

      if (arrayIds.length > 0) {
        let postData = {
          document_ids: arrayIds,
        };

        let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);

        if (response.data.length > 0) {
          for (let fileUrl of response.data) {
            let splitArray = fileUrl.split("?")[0].split("/");
            let fileName = splitArray[splitArray.length - 1];
            const regForFileName = /-[0-9a-zA-Z]{12}_/;
            let display_name_arr = fileName.split(regForFileName);
            let display_name;
            if (display_name_arr.length > 0) {
              display_name = display_name_arr[display_name_arr.length - 1];
            } else {
              display_name = splitArray[splitArray.length - 1];
            }
            saveAs(fileUrl, display_name);
          }
        }
      } else {
        this.$message({
          showClose: true,
          message: "No checkbox selected or document uploaded.",
          type: "error",
          center: true,
        });
      }
    },

    // async downloadSelected() {
    //   let arrayIds = [];
    //   if(this.electricityBillCheckbox == true) {
    //     if (this.computedElectricityBillFiles.length > 0) {
    //       for (var i = 0; i < this.computedElectricityBillFiles.length; i++) {
    //         arrayIds.push(this.computedElectricityBillFiles[i].id);
    //       }
    //     }
    //     let postData = {
    //       document_ids: arrayIds,
    //     };
    //     let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
    //     if (response.data.length > 0) {
    //       for (let fileUrl of response.data) {
    //         let splitArray = fileUrl.split('?')[0].split('/')
    //         let fileName = splitArray[splitArray.length - 1]
    //         const regForFileName=/-[0-9a-zA-Z]{12}_/
    //         let display_name_arr=fileName.split(regForFileName)
    //         let display_name;
    //         if(display_name_arr.length>0){
    //           display_name=display_name_arr[display_name_arr.length-1]
    //         }else splitArray[splitArray.length-1];
    //         saveAs(fileUrl, display_name)
    //       }
    //     }
    //   } else {
    //   }
    // },

    async confirmUploaded(val) {
      // this.getFiles();
      this.fileList.push(...val);
      val.forEach((obj) => {
        if (obj.document_container == "electricity_bill") {
          this.electricityBillFiles.push(obj);
        } else if (obj.document_container == "signed_contract") {
          this.signedContractFiles.push(obj);
        } else if (obj.document_container == "finance") {
          this.financeFiles.push(obj);
        } else if (obj.document_container == "site_survey") {
          this.siteSurveyFiles.push(obj);
        } else {
          this.otherFiles.push(obj);
        }
      });
      let resp = await API.LEADS.FETCH_ACTIVITY(this.projectId);
      this.setActivity(resp.data);
    },

    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
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
      return iconName;
    },

    async downloadClick(file) {
      let fileID = file.id;
      let arrayIds = [];
      arrayIds.push(fileID);
      let postData = {
        document_ids: arrayIds,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let url = response.data[0];
      saveAs(url, file.display_name);
    },

    async deleteClick(fileID) {
      this.isDeleteProjectDocumentPopupOpen = true;
      this.fileIdToBeDeleted = fileID;
    },

    async confirmDelete(isDelete) {
      if (this.fileIdToBeDeleted) {
        if (isDelete) {
          try {
            let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(
              this.fileIdToBeDeleted
            );
            this.fileIdToBeDeleted = "";
            this.isDeleteProjectDocumentPopupOpen = false;
            this.getFiles();
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
            this.projectId
          );
          this.fileIdToBeDeletedForDesigner = "";
          this.isDeleteProjectDocumentPopupOpen = false;
          this.getFiles();
        }
      }
      let resp = await API.LEADS.FETCH_ACTIVITY(this.projectId);
      this.setActivity(resp.data);
    },
  },
};
</script>

<style scoped>
.docContainer {
  overflow: hidden;
  /* height: 50vh; */
  /* overflow-y: scroll; */
  padding: 0px 24px 32px 24px;
}

.electBillContainer {
  margin-bottom: 8px;
}

.flexCont {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.lastFlexCont {
  margin-top: 16px;
}

.downloadAll {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.downloadAll::after {
  content: "";
  background: url("./assets/Downloadblue.svg");
  width: 16px;
  height: 16px;
  display: block;
}

.gridCOntainer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 0px 24px;
}

.card {
  width: 160px;
  min-height: 140px;
  display: grid;
  justify-content: center;
  place-items: center;
  gap: 2px;
  text-align: center;
  border-radius: 6px;
  padding: 8px 16px;
  background-color: #e8edf2;
  border: none;
  overflow-x: hidden;
  box-shadow: none;
}

.addCard {
  width: 160px;
  min-height: 140px;
  border: 1px dashed #777;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.abbrTag {
  text-decoration: none;
}

.addIcon {
  width: 36px;
  height: 36px;
}

.docFileName {
  font-size: 12px;
  color: #222;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
}

.uploadIcon {
  max-width: 38px;
}

.flexIcon {
  display: flex;
  gap: 16px;
  align-items: center;
}

.docContainer >>> .el-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 60px;
  display: flex;
  align-items: center;
  color: #222;
}

.docContainer >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #222;
}

.docContainer >>> .el-checkbox__label {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.docContainer >>> .el-checkbox__inner {
  width: 18px;
  height: 18px;
  border: 1px solid #777;
}

.docContainer >>> .el-checkbox__inner::after {
  border: 2px solid #ffffff;
  border-left: 0;
  border-top: 0;
  height: 9px;
  left: 5px;
}

.downloadIconDoc,
.deleteIcon {
  cursor: pointer;
}
</style>
