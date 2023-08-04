<template>
  <div class="card" id="chat">
    <div class="card_header" @click="toggleCollapse">
      <div class="heading-container">
        <el-row>
          <el-col :span="12" class="left-content">
            <!-- <h4>Chat_{{ orderData?.id }}</h4> -->
            <h4 v-if="isESOrg()">
              {{
                orderData.owner_name && orderData.owner_name !== "NA"
                  ? orderData.owner_name
                  : `Installer`
              }}
            </h4>
            <h4 v-else>
              {{ `Expert Services` }}
            </h4>
          </el-col>
          <el-col :span="12" class="right-content">
            <h4>
              <i
                :class="
                  this.collapsed == false
                    ? 'fas fa-angle-down'
                    : 'fas fa-angle-up'
                "
              ></i>
            </h4>
          </el-col>
        </el-row>

        <div class="hover_information">
          <i class="fas fa-info-circle"></i>
          <div class="tooltip">
            <p>You can talk to the designer here related to this project.</p>
          </div>
        </div>
      </div>
      <img
        src="../../../../assets/img/arrows-angle-expand.png"
        class="expand"
      />
    </div>
    <div class="chatBoxContainer" v-show="!collapsed">
      <div
        class="card_content"
        id="messageContainer"
        v-if="chatMessages && chatMessages.length != 0"
      >
        <div
          class="contentShow"
          id="messageContainer-content"
          v-for="(data, index) in chatMessages"
          :key="index"
        >
          <div
            class="userMsgCont"
            v-if="!currentUser(data.user_id) && data.message_type === 'message'"
          >
            <p class="userName">{{ data.user_name }}</p>
            <div class="userMsgDiv">
              <p
                v-if="
                  data.documents.length === 0 && data.message_type === 'message'
                "
                class="userMsg"
              >
                {{ data.message }}
              </p>

              <div
                v-if="
                  data.documents.length > 0 && data.message_type === 'message'
                "
                @click="isDropdown = true"
                class="userMsg"
                id="userMsgID"
              >
                <p
                  v-for="document in data.documents"
                  :key="document.id"
                  class="documentFeedMessage"
                  id="userMsgID"
                >
                  <i class="el-icon-document"></i>
                  {{ document.display_name }}
                  <span
                    class="download-container"
                    @click="downloadDocument(document)"
                  >
                    <img src="./assests/Download.svg" class="allDwnldIcon"
                  /></span>
                  <!-- <span
                    v-if="isDropdown === document.id"
                    class="dropdownMenu"
                    :id="`dropdown-${document.display_name}`"
                  >
                    <p
                      class="dropdownItem menuProp"
                      @click="downloadDocument(document)"
                    >
                      Download
                    </p>
                    <p class="dropdownItem" @click="previewDocument(document.id)">Preview</p>
                  </span> -->
                </p>
                <!-- 
                       </p> -->

                <p class="userMsg">{{ data.message }}</p>
              </div>
              <p class="userTime">
                {{ convertUTCInLocalDate(data.timestamp) }}
              </p>
            </div>
          </div>

          <div class="ourMsgCont" v-else>
            <p
              v-if="
                data.documents.length === 0 && data.message_type === 'message'
              "
              class="ourMsg"
            >
              {{ data.message }}
            </p>
            <div
              v-if="
                data.documents.length > 0 && data.message_type === 'message'
              "
              class="dropdownMenu"
            >
              <p
                @click="isDropdown = document.id"
                v-for="document in data.documents"
                :key="document.id"
                class="documentFeedMessage"
                id="userMsgID"
              >
                <i class="el-icon-document"></i>
                {{ document.display_name }}
                <span
                  class="download-container"
                  @click="downloadDocument(document)"
                >
                  <img src="./assests/Download.svg" class="allDwnldIcon"
                /></span>
                <!-- <span v-if="isDropdown === document.id" class="dropdownMenu">
                  <p class="dropdownItem" @click="downloadDocument(document)">
                    Download
                  </p>
                  <p class="dropdownItem" @click="previewDocument(document.id)">Preview</p>
                </span> -->
              </p>

              <p class="ourMsg">{{ data.message }}</p>
            </div>

            <p class="ourTime">{{ convertUTCInLocalDate(data.timestamp) }}</p>
          </div>
          <div class="eventContainer">
            <p class="eventMessages" v-if="data.message_type === 'event'">
              {{ data.message }}
            </p>
          </div>
        </div>
      </div>
      <div class="noChat" v-else>
        <img src="../../../../assets/drop/chat-dots.png" class="chatIcon" />
        <p class="noChatContent">
          You can discuss doubt or share additional information regarding this
          project with the designer here.
        </p>
      </div>
      <div class="msgContainer">
        <img src="../../../../assets/img/Group 1804.png" class="emoji" />
        <img src="../../../../assets/img/Group 1805.png" class="filesIcon" />
        <div class="footer-container">
          <div class="msgInput">
            <!-- <el-row class="footer-content">
            <el-row style="background-color:#e8edf2">
              <el-col :span="10" v-for="(file, index) in fileList" :key="index" > 
                    <div id="chatField" class="file-preview input">
                        <div class="previewContainer">   <i class="el-icon-document"></i>
                          <span><p class="filename">{{file.name}}</p></span>   
                          <span class="removeFile" @click="removeFile(index)">&times;</span>
                        </div>
                     </div>
                </el-col>
            </el-row>
            <el-row>
            <el-col :span="2">
              <el-upload class="upload-demo"  :on-preview="handlePreview" :on-remove="handleRemove" :onChange="handleOnChange"
                 :before-upload="handleBeforeUpload" action="" :before-remove="handleBeforeRemove" :on-success="handleSuccess"
                 :on-progress="handleOnProgress" :submit="handleOnSubmitFinal" :on-error="handleOnError"
                 :http-request="handleHttpReq" :on-exceed="handleOnExceed" :file-list="fileList" multiple :show-file-list=false
                 thumbnail-mode  ref="uploader">
                 <img src="./assests/upload.svg" class="chatIcon" @click="handleFileUpload"/>
               </el-upload>
            </el-col >
            <el-col :span="24">
              <el-row>
                <el-col>
                  <input type="text" id="chatField" class="input" v-model="messageVmodal" />
                </el-col>
              </el-row>
            </el-col>
              
            
            <el-button type="primary" class="sendBtn" @click="chatSend()"
                >Send</el-button>
          </el-row>
        </el-row> -->
            <el-row
              style="
                margin-left: 35px;
                background-color: #e8edf2;
                margin-right: 35px;
              "
            >
              <!-- First row of footer-content -->
              <el-col :span="12" v-for="(file, index) in fileList" :key="index">
                <div class="file-preview">
                  <span class="previewContainer">
                    <i class="el-icon-document"></i>
                    <span
                      ><p class="filename">{{ file.name }}</p></span
                    >
                    <span class="removeFile" @click="removeFile(index)"
                      >&times;</span
                    >
                  </span>
                </div>
              </el-col>
            </el-row>

            <el-row class="footer-content">
              <!-- Second row of footer-content -->
              <el-col :span="this.$props.orderData?.project ? 2 : 1">
                <el-upload
                  class="upload-demo"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :onChange="handleOnChange"
                  :before-upload="handleBeforeUpload"
                  action=""
                  :before-remove="handleBeforeRemove"
                  :on-success="handleSuccess"
                  :on-progress="handleOnProgress"
                  :submit="handleOnSubmitFinal"
                  :on-error="handleOnError"
                  :http-request="handleHttpReq"
                  :on-exceed="handleOnExceed"
                  :file-list="fileList"
                  multiple
                  :show-file-list="false"
                  thumbnail-mode
                  ref="uploader"
                >
                  <img
                    v-if="this.$props.orderData?.project"
                    style="margin-top: 1rem"
                    src="./assests/upload.svg"
                    class="chatIcon"
                    @click="handleFileUpload"
                  />
                </el-upload>
              </el-col>

              <el-col
                :span="this.$props.orderData?.project ? 20 : 20"
                class="input-col"
              >
                <el-input type="textarea" autosize v-model="messageVmodal">
                </el-input>
                <!-- <textarea
                id="chatField"
                class="input"
                v-model="messageVmodal"
                @input="handleInput"
              ></textarea> -->
              </el-col>

              <el-col
                :span="this.$props.orderData?.project ? 2 : 3"
                class="button-col"
              >
                <el-button type="primary" class="sendBtn" @click="chatSend()"
                  >➤</el-button
                >
              </el-col>
            </el-row>
          </div>
        </div>
        <div id="recMsgFromWS"></div>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
import { DATABASE_URL_FOR_WEBSOCKET } from "../../../../constants";
import {
  connectWebsocketUtil,
  chatSendUtil,
  getMessagesFromWebsocketUtil,
  getChatMessagesFromDbUtil,
} from "../../../../utils";
import { Upload } from "element-ui";
import { saveAs } from "file-saver";
import { es_org_id } from "../../../../constants";

export default {
  name: "chatBox",
  data() {
    return {
      myMessages: null,
      messageVmodal: "",
      projectId: this.$route.params.projectId,
      chatSocket: "",
      chatMessages: [],
      socket: "",
      collapsed: this.isESOrg() ? false : true,
      fileList: [],
      document_ids: [],
      isDropdown: false,
    };
  },
  components: {
    "el-upload": Upload,
  },
  props: {
    orderData: {
      type: Object,
    },
  },
  created() {
    console.log(this.$props.orderData);
    // const url =this.orderData?DATABASE_URL_FOR_WEBSOCKET+"order/"+this.orderData.id+"/": DATABASE_URL_FOR_WEBSOCKET + id + "/";
    // const id=this.orderData?this.orderData.id:this.projectId
    // this.socket = connectWebsocketUtil(url);
    // console.log(this.socket);

    // getMessagesFromWebsocketUtil(this.socket);

    // getChatMessagesFromDbUtil(id);
    this.connectWebsocket();
    this.getMessagesFromWebsocket();
    this.getChatMessagesFromDb();
  },
  watch: {
    orderData(newVal, oldVal) {
      //     this.connectWebsocket();
      //   this.getMessagesFromWebsocket();
      //   this.getChatMessagesFromDb();
      //     // console.log(newVal, oldVal);
      //     // const url = this.orderData
      //     //   ? DATABASE_URL_FOR_WEBSOCKET + "order/" + this.orderData.id + "/"
      //     //   : DATABASE_URL_FOR_WEBSOCKET + this.projectId + "/";
      //     // const id = this.orderData ? this.orderData.id : this.projectId;
      //     // this.socket = connectWebsocketUtil(url);
      //     // console.log(this.socket);

      //     // // getMessagesFromWebsocketUtil(this.socket);
      this.getChatMessagesFromDb();
      this.collapsed = false;

      //     // getChatMessagesFromDbUtil(id);
    },
  },
  mounted() {
    window.addEventListener("chatSocket-onMessage-called", (event) => {
      this.myMessages = event.detail.storage;
      this.myMessages = JSON.parse(this.myMessages);
      this.chatMessages.push(this.myMessages);
      this.scrollToBottom();
    });
    console.log(this.$props.orderData);

    // this.User=JSON.parse(localStorage.getItem("user")).first_name
    // this.scrollToBottom();

    this.$mousetrap.bind("enter", () => {
      this.chatSend();
    });
  },
  beforeDestroy() {
    this.closeWebSocket(); // Close the WebSocket connection when the component is destroyed
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    hasSpacingOrNewline(text) {
      const regex = /^\s*$/;
      return regex.test(text);
    },
    isESOrg() {
      const org = JSON.parse(localStorage.getItem("organisation")) || {};
      if (org.id === es_org_id) {
        return true;
      }
      return false;
    },
    checkWebSocketConnection() {
      console.log(
        "chat socet",
        this.chatSocket.readyState,
        this.chatSocket,
        WebSocket.OPEN
      );
      if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
        console.log("connected");
        return true;
      } else {
        console.log("not connected");
        return false;
      }
    },
    // toggleDropdown(id) {
    //     const dropdownId = `dropdown-${id}`;
    //     console.log(dropdownId);
    //     const dropdownMenu = document.getElementById(dropdownId);
    //     dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    //   },
    async downloadDocument(file) {
      // Implement your logic to handle the download action for the document with the given ID
      console.log(`Download document with ID: ${file}`);
      console.log(file);
      let fileIDForDesigner = file.id;
      let arrayIds_forDesigner = [];
      arrayIds_forDesigner.push(fileIDForDesigner);
      let postData = {
        document_ids: arrayIds_forDesigner,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let url = response.data[0];
      saveAs(url, file.display_name);
      this.isDropdown = false;
    },
    async previewDocument(id) {
      // Implement your logic to handle the preview action for the document with the given ID
      console.log(`Preview document with ID: ${id}`);
      let fileIDForDesigner = id;
      let arrayIds_forDesigner = [];
      arrayIds_forDesigner.push(fileIDForDesigner);
      let postData = {
        document_ids: arrayIds_forDesigner,
      };
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let previewUrl = response.data[0];

      if (previewUrl) {
        window.location.href = previewUrl;
      } else {
        console.error("Error retrieving preview URL.");
      }
    },

    async handleSave() {
      const formData = new FormData();
      for (let i = 0; i < this.fileList.length; i++) {
        formData.append(
          "file[]",
          this.fileList[i].raw,
          this.fileList[i].name.replace(/[<>$:@"\/%|\?\#*!]/g, "_")
        );
        console.log("postData");
      }
      console.log(this.$props.orderData);
      if (this.$props.orderData) {
        formData.append("project", this.$props.orderData.project);
        formData.append("order", this.$props.orderData.id);
      }

      let uploaded_by = localStorage.getItem("organisation").id;
      formData.append(
        "uploaded_by",
        uploaded_by == 822 ? "designer" : "installer"
      );
      //   formData.append("file[]", data);
      //   data.map((item) => formData.append("file[]", item.raw));
      console.log(formData);

      let response =
        this.fileList.length > 0
          ? await API.DOCUMENT_INFO.POST_DOCUMENTS(formData)
          : [];
      console.log(response);
      this.document_ids =
        this.fileList.length > 0 ? response.data.map((item) => item.id) : [];
      console.log(this.document_ids);
      this.messageVmodal
        ? (this.messageVmodal = this.messageVmodal)
        : (this.messageVmodal = " ");
      // this.getDocuments();
    },
    removeFile(index) {
      this.fileList.splice(index, 1); // Remove the file from the files array
    },
    async handleUploadFiles() {
      console.log({ files: this.fileList });
      await this.$props.handleUpload(this.fileList);
      this.$refs.uploader.clearFiles();
    },
    handleOnChange(file, fileList) {
      console.log("handleOnChange", { file, fileList });
      this.fileList = fileList;
    },
    handleBeforeUpload(file) {
      console.log("handleBeforeUpload", { file });
    },
    handleHttpReq(e) {
      console.log("handleHttpReq", { e });
    },

    handlePreview(data) {
      console.log("handlePreview", {
        bane: data.name,
        percentage: data.percentage,
        raw: data.raw,
        size: data.size,
        status: data.status,
        uid: data.uid,
      });
    },

    handleRemove(data, fileList) {
      console.log("handleRemove", { data, fileList });
      this.fileList = fileList;
    },
    handleBeforeRemove(file, fileList) {
      console.log("handleBeforeRemove", { file, fileList });
    },
    handleOnExceed(files, fileList) {
      console.log("handleOnExceed", { files, fileList });
      this.$notify({
        title: "Warning",
        message: `Only ${this.limit} file(s) can be uploaded`,
        type: "warning",
        duration: 2000,
        position: "top-right",
      });
      // this.toggleExceedDialogModeState()
    },
    handleSuccess(response, file, fileList) {
      console.log("handleSuccess", { response, file, fileList });
    },
    handleOnError(err, file, fileList) {
      console.log("handleOnError", { err, file, fileList });
    },
    handleOnProgress(event, file, fileList) {
      console.log("handleOnProgress", { event, file, fileList });
    },

    handleOnSubmitFinal() {
      console.log("handleOnSubmitFinal", { fileList: this.fileList });
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
    reverseDisplay(myList) {
      let result = myList.slice().reverse();
      return result;
    },

    convertUTCInLocalDate(utcDate) {
      let localDate = new Date(utcDate);
      localDate = localDate.toLocaleString();
      return localDate;
    },
    currentUser(userId) {
      const user = this.getUserIformation();
      let result = false;
      if (userId == user.user_id) {
        result = true;
      }
      return result;
    },
    async getChatMessagesFromDb() {
      // alert("called")
      const response = this.orderData
        ? await API.CHAT_iNFO.FETCH_CHAT_MESSAGE(this.$props.orderData.id)
        : await API.CHAT_iNFO.FETCH_CHAT_MESSAGES(this.projectId);

      console.log("!! messages from rest api", response);
      this.chatMessages = response.data.results;
      this.chatMessages = this.reverseDisplay(this.chatMessages);
      console.log(this.orderData, response);
      if (response.data?.count) {
        const patchData = {
          order_id: this.orderData.id,
          message_offset: response.data.count,
        };
        await API.DESIGN_ORDERS.UNREAD_NOTIFICATIONS_UPDATE(patchData);
      }
    },
    handleFileUpload() {
      // this.$refs.upload.$el.querySelector('input[type="file"]').click();
      // alert("hello")
    },
    handleUploadSuccess(response) {
      // Handle the upload success event
      console.log("hello");
    },
    async chatSend() {
      let user = JSON.parse(localStorage.getItem("user")) || {};
      const checkEmpty = this.hasSpacingOrNewline(this.messageVmodal);
      console.log(checkEmpty);
      await this.handleSave();
      // this.messageVmodal==null?this.messageVmodal=" ":this.messageVmodal=this.messageVmodal;

      this.fileList = [];
      if (this.checkWebSocketConnection() === false) {
        await this.connectWebsocket();
        // this.chatSend();
      }
      // chatSendUtil(this.messageVmodal, this.socket, PostObj);
      console.log(this.document_ids.length, this.messageVmodal);
      console.log(this.messageVmoda === "/n");
      if (this.messageVmodal || this.document_id) {
        console.log(this.document_id);

        let user = this.getUserIformation();
        let PostObj = {};
        this.$props.orderData
          ? (PostObj = {
              order_id: this.$props.orderData.id,
              message: this.messageVmodal,
              user_id: user.user_id,
              event: "message",
              message_type: "message",
              document_ids: this.document_ids,
            })
          : (PostObj = {
              project_id: this.projectId,
              message: this.messageVmodal,
              user_id: user.user_id,
              document_ids: this.document_ids,
            });
        let jsonSt = JSON.stringify(PostObj);
        if (
          this.chatSocket &&
          this.chatSocket.readyState === WebSocket.OPEN &&
          this.messageVmodal &&
          !checkEmpty
        ) {
          console.log("dsajd");
          this.chatSocket.send(jsonSt);
          this.getMessagesFromWebsocket();
        } else if (
          this.chatSocket &&
          this.chatSocket.readyState === WebSocket.OPEN &&
          this.document_ids.length > 0
        ) {
          console.log("docs");
          this.chatSocket.send(jsonSt);
          this.getMessagesFromWebsocket();
        }
        this.scrollToBottom();

        this.messageVmodal = "";
      }
    },
    getUserIformation() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user;
    },
    connectWebsocket() {
      // this.chatSocket = new WebSocket(
      //   "wss://" +
      //     DATABASE_URL_FOR_WEBSOCKET +
      //     "ws/chat/" +
      //     this.projectId +
      //     "/"
      // );
      const url = this.orderData
        ? DATABASE_URL_FOR_WEBSOCKET + "order/" + this.orderData.id + "/"
        : DATABASE_URL_FOR_WEBSOCKET + this.projectId + "/";

      if (this.orderData?.id || this.projectId) {
        this.chatSocket = new WebSocket(url);
      }
      this.chatSocket.onopen = function (event) {
        console.log(event);
        console.log("!!Successfully connected to the websocket server...");
      };

      this.chatSocket.onmessage = (event) => {
        console.log("Received message:", event.data);
        // Handle incoming messages
      };

      this.chatSocket.onclose = () => {
        console.log("WebSocket connection closed");
        // Perform any necessary cleanup or handle connection closure
      };

      this.chatSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        // this.connectWebsocket();
        // Handle WebSocket errors
      };
    },
    getMessagesFromWebsocket() {
      this.chatSocket.onmessage = function (event) {
        console.log("!!!Message from server ", event.data);
        window.dispatchEvent(
          new CustomEvent("chatSocket-onMessage-called", {
            detail: {
              storage: event.data,
            },
          })
        );
      };
    },
    scrollToBottom() {
      let objDiv = document.getElementById("messageContainer");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    },
    closeWebSocket() {
      if (this.chatSocket) {
        this.chatSocket.close();
        console.log(this.chatSocket.close());
      }
    },
  },
};
</script>

<!-- <script>
import API from "@/services/api/";
import { DATABASE_URL_FOR_WEBSOCKET } from "../../../../constants";
export default {
  name: "chatBox",
  data() {
    return {
      myMessages: null,
      messageVmodal: null,
      projectId: this.$route.params.projectId,
      chatSocket: "",
      chatMessages: [],
      collapsed: true,
    };
  },
  created() {
    this.connectWebsocket();
    this.getMessagesFromWebsocket();
    this.getChatMessagesFromDb();
  },
  mounted() {
    window.addEventListener("chatSocket-onMessage-called", (event) => {
      this.myMessages = event.detail.storage;
      this.myMessages = JSON.parse(this.myMessages);
      this.chatMessages.push(this.myMessages);
      this.scrollToBottom();
    });
    // this.scrollToBottom();

    this.$mousetrap.bind("enter", () => {
      this.chatSend();
    });
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    handleUpload() {
      console.log("asjdgjhsagdj");
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
    reverseDisplay(myList) {
      let result = myList.slice().reverse();
      return result;
    },

    convertUTCInLocalDate(utcDate) {
      let localDate = new Date(utcDate);
      localDate = localDate.toLocaleString();
      return localDate;
    },
    currentUser(userId) {
      const user = this.getUserIformation();
      let result = false;
      if (userId == user.user_id) {
        result = true;
      }
      return result;
    },
    async getChatMessagesFromDb() {
      const response = await API.CHAT_iNFO.FETCH_CHAT_MESSAGES(this.projectId);
      console.log("!! messages from rest api", response);
      this.chatMessages = response.data.results;
      this.chatMessages = this.reverseDisplay(this.chatMessages);
    },
    chatSend() {
      if (this.messageVmodal) {
        let user = this.getUserIformation();
        let PostObj = {
          project_id: this.projectId,
          message: this.messageVmodal,
          user_id: user.user_id,
        };
        let jsonSt = JSON.stringify(PostObj);
        this.chatSocket.send(jsonSt);
        this.scrollToBottom();
        this.messageVmodal = "";
        this.getMessagesFromWebsocket();
      }
    },
    getUserIformation() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user;
    },
    connectWebsocket() {
      this.chatSocket = new WebSocket(
        "wss://" +
          DATABASE_URL_FOR_WEBSOCKET +
          "ws/chat/" +
          this.projectId +
          "/"
      );
      this.chatSocket.onopen = function (event) {
        console.log(event);
        console.log("!!Successfully connected to the websocket server...");
      };
    },
    getMessagesFromWebsocket() {
      this.chatSocket.onmessage = function (event) {
        console.log("!!!Message from server ", event.data);
        window.dispatchEvent(
          new CustomEvent("chatSocket-onMessage-called", {
            detail: {
              storage: event.data,
            },
          })
        );
      };
    },
    scrollToBottom() {
      let objDiv = document.getElementById("messageContainer");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    },
  },
};
</script> -->

<style scoped>
.documentFeedMessage {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 5px;
}
.filename {
  white-space: nowrap;

  max-width: 8rem;

  overflow: hidden;

  text-overflow: ellipsis;
}
.file-preview {
  margin-left: 5px;
  margin-top: 10px;
}
.previewContainer {
  display: flex;
  margin-left: 13px;
  margin-right: 20px;
}
.docPreview {
  display: flex;
  width: 100px;
}
.removeFile {
  font-size: 25px;
  cursor: pointer;
  line-height: 12px;
}
.card {
  top: auto !important;
  bottom: 0;
  right: 0;
  z-index: 999;
  position: fixed;
  width: 450px;
  margin-right: 4.5rem;
  /* border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
  */
}
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  padding: 16px 16px 16px 10px;
  border-radius: 12px 12px 0 0;
  height: 48px;
  cursor: pointer;
}
.heading-container {
  width: 100%;
}
.left-content {
  display: flex;
  justify-content: left;
}
.right-content {
  display: flex;
  justify-content: right;
}
#chatField {
  width: 100%;
}
.heading,
.msgInput {
  /* display: flex;
  align-items: center; */
  /* justify-content: right; */
}
.footer-content {
  display: flex;
  align-items: flex-end;
}

.card .card_header .heading h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.noChat {
  padding: 10px 16px 16px 10px;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.noChatContent {
  font-size: 16px;
  font-weight: 100;
  color: #777;
  line-height: 1.5;
  margin-top: 8px;
}

.card_content {
  height: 350px;
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
  padding: 10px 16px 16px 10px;
}

.contentShow {
  display: flex;
  flex-direction: column;
}

.userMsgCont {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin: 8px 0px;
}

.userName {
  font-size: 16px;
  font-weight: 500;
  color: #777;
  margin-bottom: 8px;
  word-break: break-word;
}

.userMsgDiv {
  padding: 8px 8px 4px 8px;
  border-radius: 4px;
  background-color: #e8edf2;
  max-width: 80%;
}

.userMsg {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  word-break: break-word;
}

.userTime {
  font-size: 12px;
  color: #777777;
  float: right;
  margin-top: 4px;
}

.ourMsgCont {
  margin: 8px 0px 8px auto;
  float: right;
  max-width: 85%;
  background-color: #409eff;
  padding: 8px 8px 4px 8px;
  border-radius: 4px;
}

.ourMsg {
  font-size: 16px;
  color: #fff;
  word-break: break-word;
  line-height: 1.5;
}

.ourTime {
  font-size: 12px;
  color: #fff;
  float: right;
  margin-top: 4px;
}

.hover_information {
  display: inline-block;
  position: relative;
  display: none;
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

.expand {
  cursor: pointer;
  display: none;
}

.msgContainer {
  padding: 16px 16px 16px 8px;
  display: grid;
  align-items: center;
  grid-template-columns: auto;
}

.emoji,
.filesIcon {
  width: 30px;
  cursor: pointer;
  display: none;
}

.sendBtn {
  height: 40px;
  padding: 10px;
  border-radius: 0px 4px 4px 0px;
  font-size: 16px;
}

.input {
  background-color: #e8edf2;
  border: none;
  color: #222;
  font-size: 18px;
  /* height: 40px; */
  min-height: 40px;
  border-radius: 0px 0px 0px 4px;
  width: calc(100% - 75px);
  padding: 5px;
}

@media (max-width: 1280px) {
  .card {
    top: 81px;
  }
}
.eventMessages {
  background-color: #e8edf2;
  text-align: center;
  border-radius: 9px;
  font-style: oblique;
  color: darkgray;
  padding: 8px;
}
.eventContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.menuProp {
  z-index: 10;
  border: 1px solid black;
}
#chat >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242);
  border: none;
  border-radius: none;
  min-height: 40px !important;
}
.footer-content {
  /* display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%; */
  align-self: flex-end;
}

.input-col {
  flex-grow: 1;
}

.button-col {
  align-self: flex-end;
}
.upload-demo {
  margin-left: 0.5rem;
}
.download-container {
  margin-left: 1rem;
  cursor: pointer;
}
</style>
