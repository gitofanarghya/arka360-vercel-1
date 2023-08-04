<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isDownloadFilesPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      title="Download Files"
      width="600px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="allDwnldCont">
          <div class="flexContAll">
            <img
              src="../../../../assets/drop/Group 1808.svg"
              class="allDwnldIcon"
            />
            <p class="dwnldCont" @click="downloadAllClick">Download All</p>
          </div>
        </div>
        <hr class="hrTag" />
        <div class="cardContainer" v-for="(file, i) in finalList" :key="i">
          <div class="gridCont">
            <img
              class="adobeIcon"
              :src="
                    `/src/assets/drop/fileUploadImages/${findFileTypeIcon(
                      file
                    )}`
                  "
            />
            <div class="flexCont">
              <p class="fileName">
                <abbr :title="file.file_name" class="abbrTag">
                {{file.file_name}}
                </abbr> 
                <!-- <span class="latest">Latest</span> -->
              </p>
              <p class="rivisions" v-if="file.tags">Revision {{file.tags}}</p>
              <!-- <p class="timing">Generate on 03 May, 18:36 PM</p> -->
              <p class="timing">Generate on  {{dateToString(file.created_at)}}</p>
            </div>
            <el-button type="primary" class="dwnldBtn" @click="downloadClick(file)">Download</el-button>
          </div>
          <hr class="hrTag" />
        </div>
        <!-- <div class="cardContainer">
          <div class="gridCont">
            <img
              class="adobeIcon"
              src="../../../../assets/drop/file-pdf (3).png"
            />
            <div class="flexCont">
              <p class="fileName">
                File_Name.pdf <span class="latest">Latest</span>
              </p>
              <p class="rivisions">Revision 2</p>
              <p class="timing">Generate on 03 May, 18:36 PM</p>
            </div>
            <el-button type="primary" class="dwnldBtn">Download</el-button>
          </div>
          <hr class="hrTag" />
        </div>
        <div class="cardContainer">
          <div class="gridCont">
            <img
              class="adobeIcon"
              src="../../../../assets/drop/file-pdf (3).png"
            />
            <div class="flexCont">
              <p class="fileName">
                File_Name.pdf <span class="latest">Latest</span>
              </p>
              <p class="rivisions">Revision 2</p>
              <p class="timing">Generate on 03 May, 18:36 PM</p>
            </div>
            <el-button type="primary" class="dwnldBtn">Download</el-button>
          </div>
          <hr class="hrTag" />
        </div>
        <div class="cardContainer">
          <div class="gridCont">
            <img
              class="adobeIcon"
              src="../../../../assets/drop/file-pdf (3).png"
            />
            <div class="flexCont">
              <p class="fileName">
                File_Name.pdf <span class="latest">Latest</span>
              </p>
              <p class="rivisions">Revision 2</p>
              <p class="timing">Generate on 03 May, 18:36 PM</p>
            </div>
            <el-button type="primary" class="dwnldBtn">Download</el-button>
          </div>
          <hr class="hrTag" />
        </div>
        <div class="cardContainer">
          <div class="gridCont">
            <img
              class="adobeIcon"
              src="../../../../assets/drop/file-pdf (3).png"
            />
            <div class="flexCont">
              <p class="fileName">
                File_Name.pdf <span class="latest">Latest</span>
              </p>
              <p class="rivisions">Revision 2</p>
              <p class="timing">Generate on 03 May, 18:36 PM</p>
            </div>
            <el-button type="primary" class="dwnldBtn">Download</el-button>
          </div>
          <hr class="hrTag" />
        </div> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api";
import fileType from "@/pages/utils/fileType";
import { saveAs } from "file-saver";
import { mapState } from 'pinia';
import { useDesignStore } from '../../../../stores/design';
export default {
  name: "downloadFilesPopup",

  props: {
    isDownloadFilesPopupVisible: {
      type: Boolean,
      default: false,
    },
    requestObjIdForDownloadFile: {
      type: String,
      default: "",
    }
  },

  data() {
    return {
      projectid: this.$route.params.projectId,
      resultOfFiles: [],
      uploaded_by: "designer",
    };
  },
  created(){
    this.getFiles();
  },
  computed:{
    ...mapState (useDesignStore, {
      projectIdFromStore : state=> state.project.id,
    }),

    finalList(){
      return this.resultOfFiles;
    }
  },
  methods: {
    onDialogClose() {
      this.$emit("update:isDownloadFilesPopupVisible", false);
    },
    async getFiles() {
      if(!this.projectid){
        this.projectid = this.projectIdFromStore;
      }
      let response = await API.DOCUMENT_INFO.FETCH_DOCUMENTS_FROM_DESIGNER(
        this.projectid,
        this.uploaded_by,
        this.requestObjIdForDownloadFile
      );
      this.resultOfFiles = response.data;
    },
    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
      if (fileType[file.file_type]) {
        iconName = fileType[file.file_type];
      }
      return iconName;
    },
    dateToString: function (_dateString) {
      var mydate = new Date(_dateString)
        .toLocaleString()
        .replace(",", "")
        .replace(/:.. /, " ");
      return mydate;
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
          saveAs(url);
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
        for (var i = 0; i < response.data.length; i++) {
          saveAs(response.data[i]);
        }
      }
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
  padding: 24px 24px 16px 24px;
  border-bottom: 16px solid #fff;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  height: 365px;
  overflow: hidden;
  overflow-y: scroll;
}

.allDwnldCont {
}

.flexContAll {
  display: flex;
  justify-content: right;
  align-items: center;
}

.dwnldCont {
  font-size: 18px;
  color: #222;
  text-decoration: underline;
  cursor: pointer;
}

.allDwnldIcon {
  margin-right: 8px;
  cursor: pointer;
}

.gridCont {
  display: grid;
  grid-template-columns: 35px 68% auto;
  grid-gap: 20px;
  margin-bottom: 16px;
}

.fileName {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  word-break: break-word;
}

.latest {
  font-size: 12px;
  color: #fff;
  border-radius: 2px;
  background-color: #263342;
  padding: 2px 4px;
  font-weight: 100;
}

.rivisions {
  font-size: 16px;
  font-style: italic;
  color: #263342;
  line-height: 1.4;
  word-break: break-word;
}

.timing {
  font-size: 14px;
  color: #777;
  word-break: break-word;
}

.dwnldBtn {
  height: 40px;
}

.hrTag {
  margin: 16px auto;
  color: #cccccc;
  opacity: 0.5;
}
.abbrTag {
  text-decoration: none;
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

  .gridCont {
    display: grid;
    grid-template-columns: 35px auto 80px;
    grid-gap: 8px;
    margin-bottom: 16px;
  }

  .dwnldBtn {
    padding: 0px;
  }
}

@media (max-width: 500px) {
  .container {
  height: 70vh;
}
}

</style>