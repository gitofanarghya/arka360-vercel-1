<template>
  <div class="card">
    <div class="card_header flex_header">
      <div class="heading">
        <h4>Documents</h4>
        <!-- <div class="hover_information">
          <i class="fas fa-info-circle"></i>
          <div class="tooltip">
            <p>
              In this section, you will be able to view and download all the
              project reports and the documents you may have shared.
            </p>
          </div>
        </div> -->
      </div>
    </div>
    <div class="chatBoxContainer">
      <div v-if="resultOfFilesForDesigner.length !== 0">
        <div class="fileDownloadCont">
          <h4 class="PFRHeading">Project Files/ Reports</h4>
          <div class="flexContAll" @click="downloadAllClickForDesigner">
            <img
              src="../../../../assets/drop/Group 1808.svg"
              class="allDwnldIcon"
            />
            <p class="dwnldCont">Download All</p>
          </div>
        </div>
        <div class="gridContainer mBottom">
          <div
            class="PDcard"
            v-for="(file, i) in finalListForDesigner"
            :key="i"
          >
            <!-- <img
              :src="
                fileUploadAssets[
                  `/src/assets/drop/fileUploadImages/${findFileTypeIcon(file)}`
                ]
              "
            /> -->
            <p class="contentOne">
              <abbr :title="file.display_name" class="abbrTag">{{
                file.display_name
              }}</abbr>
            </p>
            <div class="icons">
              <img
                src="../../../../assets/drop/Group 1832.png"
                class="dwnldIcon"
                target="_blank"
                @click="downloadClickForDesigner(file)"
              />
              <img
                src="../../../../assets/drop/Group 1831.png"
                class="delBtn"
                @click="deleteClickForDesigner(file.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="fileDownloadCont">
        <h4 class="docHeading"></h4>
        <div class="flexContAll" @click="downloadAllClick">
          <img
            src="../../../../assets/drop/Group 1808.svg"
            class="allDwnldIcon"
          />
          <p class="dwnldCont">Download All</p>
        </div>
      </div> -->
      <div class="gridContainer">
        <div class="PDcard" v-for="(file, i) in finalList" :key="i">
          <img
            :src="
              fileUploadAssets[
                `/src/assets/drop/fileUploadImages/${findFileTypeIcon(file)}`
              ]
            "
          />
          <p class="contentOne">
            <abbr :title="file.display_name" class="abbrTag">{{
              file.display_name
            }}</abbr>
          </p>
          <div class="icons">
            <img
              src="../../../../assets/drop/Group 1832.png"
              class="dwnldIcon"
              target="_blank"
              @click="downloadClick(file)"
            />
            <img
              src="../../../../assets/drop/Group 1831.png"
              class="delBtn"
              @click="deleteClick(file.id)"
            />
          </div>
        </div>
        <div class="PDcard" @click="isShareDocumentPopupVisible = true">
          <img
            src="../../../../assets/drop/plus-circle (1).png"
            class="dwnldIcon"
          />
          <p class="addDocCon">Add Document</p>
        </div>
      </div>
    </div>
    <DeleteDocument
      v-if="isDeleteProjectDocumentPopupOpen"
      :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
      @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
      @confirmDelete="confirmDelete"
    />
    <ShareDocumentPopup
      :isShareDocumentPopupVisible.sync="isShareDocumentPopupVisible"
      :handleSave="handleSave"
      :isCRMMode="true"
      @confirmUploaded="confirmUploaded"
    />
  </div>
</template>

<script>
import DeleteDocument from "./deleteDocumnets.vue";
import fileUpload from "../../../../components/ui/fileUpload.vue";
import ShareDocumentPopup from "../tabs/shareDocumentPopup.vue";
import API from "@/services/api";
import fileType from "@/pages/utils/fileType";
import { saveAs } from "file-saver";

const fileUploadAssets = import.meta.glob(
  "/src/assets/drop/fileUploadImages/*",
  { eager: true, as: "url" }
);

export default {
  name: "projectDocuments",

  components: {
    DeleteDocument,
    fileUpload,
    ShareDocumentPopup,
  },

  data() {
    return {
      uploaded_by_installer: "installer",
      uploaded_by_Designer: "designer",
      fileIdToBeDeleted: "",
      fileIdToBeDeletedForDesigner: "",
      resultOfFiles: [],
      resultOfFilesForDesigner: [],
      designerFiles: [],
      projectid: this.$route.params.projectId,
      projectId: this.$props.orderData.project,
      orderId: this.$props.orderData.id,
      fileList: [],
      isDeleteProjectDocumentPopupOpen: false,
      isShareDocumentPopupVisible: false,
      hrefUrl:
        "https://design-studio-app.s3.amazonaws.com/79a7d9a9-2a8c-4d06-b594-1903c79a55c3_AI2TZoe.dxf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJMYDVVI4WW322S7Q%2F20220615%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20220615T094636Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=27f527f6bb71e84371cdfc3522694627de6965de1bf93786008ee7d14540a34d",
      fileUploadAssets,
    };
    installer: false;
    designer: true;
  },
  created() {
    // this.getDocuments(this.projectId, this.orderId);
    // this.getFiles();
    // this.getFilesForDesigner();
  },
  mounted() {
    this.getDocuments();
  },
  computed: {
    finalList() {
      return this.resultOfFiles;
    },
    finalListForDesigner() {
      return this.resultOfFilesForDesigner;
    },
  },
  methods: {
    async handleSave(fileList) {
      console.log(fileList);

      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append(
          "file[]",
          fileList[i],
          fileList[i].name.replace(/[<>$:@"\/%|\?\#*!]/g, "_")
        );
        console.log("postData");
      }

      formData.append("project", this.$props.orderData.project);
      formData.append("order", this.$props.orderData.id);
      formData.append("uploaded_by", "designer");
      //   formData.append("file[]", data);
      //   data.map((item) => formData.append("file[]", item.raw));
      console.log(formData);

      let response = await API.DOCUMENT_INFO.POST_DOCUMENTS(formData);
      this.getDocuments();
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
    async getDocuments() {
      const projectId = this.$props.orderData.project;
      const orderId = this.$props.orderData.id;

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
      this.resultOfFilesForDesigner = newData;
    },

    findFileTypeIcon(file) {
      console.log(file);
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
    async downloadAllClick() {
      let arrayIds = [];
      if (this.resultOfFiles.length > 0) {
        for (var i = 0; i < this.resultOfFiles.length; i++) {
          arrayIds.push(this.resultOfFiles[i].id);
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
    async downloadAllClickForDesigner() {
      let arrayIdsForDesigner = [];

      if (this.resultOfFilesForDesigner.length > 0) {
        for (var i = 0; i < this.resultOfFilesForDesigner.length; i++) {
          arrayIdsForDesigner.push(this.resultOfFilesForDesigner[i].id);
        }
      }
      let postData = {
        document_ids: arrayIdsForDesigner,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      if (response.data.length > 0) {
        // for await (fileUrl of response.data) {
        //   let splitArray = fileUrl.split("?")[0].split("/");
        //   let fileName = splitArray[splitArray.length - 1];
        //   console.log(fileUrl)
        //   saveAs(fileUrl, fileName);
        // }
        response.data.forEach((e) => {
          let splitArray = e.split("?")[0].split("/");
          let fileName = splitArray[splitArray.length - 1];
          saveAs(e, fileName);
        });
      }
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
    async downloadClickForDesigner(file) {
      let fileIDForDesigner = file.id;
      let arrayIds_forDesigner = [];
      arrayIds_forDesigner.push(fileIDForDesigner);
      let postData = {
        document_ids: arrayIds_forDesigner,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let url = response.data[0];
      saveAs(url, file.display_name);
    },
    confirmUploaded() {
      this.getFiles();
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
            this.getDocuments();
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
          this.getDocuments();
        }
      }
    },
    async deleteClick(fileID) {
      this.isDeleteProjectDocumentPopupOpen = true;
      this.fileIdToBeDeleted = fileID;
    },
    async deleteClickForDesigner(fileID) {
      this.fileIdToBeDeletedForDesigner = "";
      this.isDeleteProjectDocumentPopupOpen = true;
      this.fileIdToBeDeletedForDesigner = fileID;
    },

    async getFiles() {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_INSTALLER(
        this.projectid,
        this.uploaded_by_installer
      );
      this.resultOfFiles = response.data;
      console.log("response.data: ", response.data);
    },
    async getFilesForDesigner() {
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_DESIGNER(
        this.projectid,
        this.uploaded_by_Designer
        //this.requestObjIdForDownloadFile
      );
      this.resultOfFilesForDesigner = response.data;
    },
    // async getFilesForDesigner() {
    //   let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS(
    //     this.projectid,
    //     this.uploaded_by_Designer,
    //   );
    //   this.resultOfFilesForDesigner = response.data;
    // },
    closeShareDocumentPopup() {
      this.$emit("closeShareDocumentPopup", "next");
    },
    openFiles(fileList) {
      this.fileList = fileList;
    },
  },
  props: {
    orderData: {
      type: Object,
    },
  },
  watch: {
    orderData(val) {
      this.getDocuments();
    },
  },
};
</script>

<style scoped>
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  padding: 16px 16px 16px 10px;
  border-radius: 12px 12px 0 0;
  height: 48px;
}

.heading,
.msgInput {
  display: flex;
  align-items: center;
  justify-content: right;
}

.card .card_header .heading h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.hover_information {
  display: inline-block;
  position: relative;
}

.fas {
  font-size: 13px;
  color: #777777;
  cursor: pointer;
}

.tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 300px;
  left: -15px;
  bottom: 100%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
  z-index: 100;
}

.tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
}
i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.chatBoxContainer {
  padding: 24px 24px 0px 24px;
  max-height: 555px;
  overflow: hidden;
  overflow-y: scroll;
  margin-bottom: 24px;
}

.fileDownloadCont {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.PFRHeading {
  margin: 0px 0px 0px 0px;
  font-size: 16px;
  font-weight: 100;
  color: #777777;
}

.flexContAll {
  display: flex;
  justify-content: right;
  align-items: center;
  cursor: pointer;
}

.allDwnldIcon {
  margin-right: 8px;
  cursor: pointer;
}

.dwnldCont {
  font-size: 18px;
  color: #222;
  text-decoration: underline;
}

.dwnldIcons {
  font-size: 20px;
  border: 0.5px solid;
  padding: 5px;
  border-radius: 4px;
}

.docHeading {
  margin: 0px 0px 0px 0px;
  font-size: 16px;
  font-weight: 100;
  color: #777777;
}

.gridContainer {
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(auto-fill, 168px);
}

.mBottom {
  margin-bottom: 16px;
}

.PDcard {
  padding: 16px 10px;
  border-radius: 4px;
  background-color: #e8edf2;
  text-align: center;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.contentOne {
  font-size: 14px;
  font-weight: 100;
  color: #222;
  margin: 10px 0px 14px 0px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
}

.abbrTag {
  text-decoration: none;
}

.addDocCon {
  font-size: 16px;
  font-weight: 600;
  color: #263342;
  margin-top: 16px;
}

.dwnldBtn {
  font-size: 16px;
  padding: 4px 12px;
  cursor: pointer;
  font-weight: 600;
  color: #263342;
}

.icons {
  display: flex;
  justify-content: center;
}

.delBtn {
  margin-left: 12px;
}

.dwnldIcon,
.delBtn {
  cursor: pointer;
}

@media (max-width: 450px) {
  .gridContainer {
    display: grid;
    grid-gap: 16px;
    grid-template-columns: 48% 48%;
  }

  .dwnldCont {
    font-size: 14px;
  }

  .PFRHeading {
    font-size: 14px;
  }

  .docHeading {
    font-size: 14px;
    width: 48%;
  }
}
</style>
