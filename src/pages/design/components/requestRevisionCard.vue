<template>
  <div class="card">
    <div class="card_header flex_header">
      <div class="heading">
        <h4>Revision Requests</h4>
      </div>
    </div>
    <div class="chatBoxContainer">
    <div  v-for="(noteRevision, index) in revisionNotes" :key = "index">
      <p class="revOne">Revision {{ noteRevision.version}}</p>
      <p class="revOneContent">
        {{noteRevision.notes}}
      </p>
      <div class="gridContainer">
        <div class="PDcard" v-for="(doc,index) in noteRevision.documents" :key="index">
           <img
                  :src="
                    `/src/assets/drop/fileUploadImages/${findFileTypeIcon(
                      doc
                    )}`
                  "
                />
          <p class="contentOne">
            <abbr title="file.name" class="abbrTag">{{doc.display_name}}</abbr>
          </p>
          <div class="icons">
            <img src="../../../assets/drop/Group 1832.png" class="dwnldIcon" @click="downloadClick(doc.document_id)" />
            <img src="../../../assets/drop/Group 1831.png" class="delBtn" @click="deleteClick(doc)" />
          </div>
        </div>
      </div>
    </div>
    </div>
    <DeleteProjectDocument
      :isDeleteProjectDocumentPopupOpen="isDeleteProjectDocumentPopupOpen"
      @cancelDelete="isDeleteProjectDocumentPopupOpen = false"
      @confirmDelete="confirmDelete"
    />
  </div>
</template>

<script>
import API from '@/services/api/';
import DeleteProjectDocument from "./requestRevisionDeletePopup.vue";
import fileType from "@/pages/utils/fileType";
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../stores/design';
export default {
  name: "requestRevisionCard",

  data() {
    return {
      designId: this.$route.params.designId,
      revisionNotesArray: [],
      fileIdToBeDeleted:'',
      isDeleteProjectDocumentPopupOpen:false
    };
  },
   components: {
    DeleteProjectDocument,
  },

  created(){
    // this.assignProjectDetail();
  },
computed: {

  ...mapState (useDesignStore, {
      order_status: state => state.request_expert_service.order_status,
      rejectionReasonMessage : state=> state.request_expert_service.rejection_reason,
      requestObject : state=> state.request_expert_service,
      projectId : state=> state.project.id,
      revisionNotes: state => state.request_expert_service.revision_notes,
    }),

  //  ...mapGetters('design',{
  //           revisionNotes: 'GET_DESIGN_REVISION_NOTE',
  //   }),

   },
  methods: {
      ...mapActions(useDesignStore, {
            SET_DESIGN: 'SET_DESIGN',
      }),
    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
      if (fileType[file.file_type]) {
        iconName = fileType[file.file_type];
      }
      else {
        if(file.display_name.split('.').pop() === 'dxf' || file.display_name.split('.').pop() === 'dwg') {
          iconName = fileType["image/x-dxf"];
        }
      }
      return iconName;
    },
    deleteClick(doc){
       this.isDeleteProjectDocumentPopupOpen = true;
       this.fileIdToBeDeleted = doc.document_id;
    },
   
    async downloadClick(fileID) {
      let arrayIds = [];
      arrayIds.push(fileID);
      let postData = {
        document_ids: arrayIds,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let url = response.data[0];
      saveAs(url);
    },
    async confirmDelete(isDelete) {
      if (isDelete) {
        let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(
          this.fileIdToBeDeleted
        );
        this.fileIdToBeDeleted = "";
        this.isDeleteProjectDocumentPopupOpen = false;
         await this.SET_DESIGN(this.designId);
      }
    },
    async assignProjectDetail() {
      this.revisionNotesArray = this.revisionNotes;
    },
  }
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
  padding: 16px 24px;
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

.chatBoxContainer {
  padding: 24px 24px 0px 24px;
  max-height: 612px;
  overflow: hidden;
  overflow-y: scroll;
  margin-bottom: 16px;
}

.revOne,
.revTwo {
  font-size: 14px;
  font-weight: 500;
  color: #777;
  margin-bottom: 8px;
}

.revOneContent,
.revTwoContent {
  color: #222;
  font-size: 16px;
  line-height: 1.5;
}

.revOneContent {
  margin-bottom: 20px;
}

.gridContainer {
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(auto-fill, 168px);
  margin-bottom: 24px;
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
}
</style>




