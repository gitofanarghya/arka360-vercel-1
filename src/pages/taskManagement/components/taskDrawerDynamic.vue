<template>
  <div class="taskCard">
    <el-form :label-position="'top'" label-width="100px" :model="task">
      <div v-for="field in fields" :key="field.title">
        <el-col
          :span="8"
          v-show="
            field.type !== 'mapText' &&
            field.type !== 'largeText' &&
            field.type !== 'longText'
          "
        >
          <el-form-item :label="field.label">
            <!-- Text field -->
            <el-input
              v-if="field.type === 'text'"
              :placeholder="field.placeholder"
              v-model="task[field.title]"
            ></el-input>
            <!-- Text field with icons on either side -->
            <div
              class="text-field-with-2-icons"
              v-if="field.type === 'iconTextIcon'"
            >
              <img :src="field.leftIcon" class="icon-style-left" />
              <el-input
                :placeholder="field.placeholder"
                v-model="task[field.title]"
              ></el-input>
              <img :src="field.rightIcon" class="icon-style-right" />
            </div>
            <!--  regular Dropdown field -->
            <el-select
              v-if="field.type === 'dropdown'"
              v-model="task[field.title]"
              :placeholder="field.placeholder"
              @change="changeDropdown($event, field)"
              :multiple="field.isMultiple || false"
              :filterable="field.isFilterable || false"
            >
              <el-option
                v-for="option in field.options"
                :label="option.label"
                :value="option.id"
                :key="option.id"
              ></el-option>
            </el-select>
            <!--  Infinite Dropdown field -->
            <el-select
              class="infinite-dropdown"
              v-if="field.type === 'dropdownInfinite'"
              v-model="task[field.title]"
              :placeholder="field.placeholder"
              @change="changeDropdown($event, field)"
              :multiple="field.isMultiple || false"
              :filterable="field.isFilterable || false"
            >
              <div v-infinite-scroll="loadMore">
                <!-- infinite-scroll-disabled="busy"
                infinite-scroll-distance="10" -->
                <el-option
                  v-for="option in field.options"
                  :label="option.label"
                  :value="option.id"
                  :key="option.id"
                ></el-option>
              </div>

              <!-- <infinite-loading
                :distance="0"
                spinner="bubbles"
                @infinite="loadMore(field)"
              >
                <div slot="no-more" style="color: #606266; font-size: 12px">
                  No more users!!
                </div>
                <div slot="error" style="color: #606266; font-size: 12px">
                  Error in fetching users, retry!!
                </div>
                <div slot="no-results" style="color: #606266; font-size: 12px">
                  No more users!!
                </div>
              </infinite-loading> -->
            </el-select>
            <!-- Collaborator field -->
            <div class="collaborators">
              <AvatarHandler
                v-if="field.type === 'collaborators'"
                :overlap="false"
                :limit="2"
                :imgWidth="30"
                :fontSize="'14px'"
                :avatars="task.collaborators"
                :selectionAvatars="field.selectionAvatars"
                :removable="true"
                :gap="5"
                @handleRemove="handleCollaboratorRemove"
                @handleAdd="handleCollaboratorAdd"
              />
            </div>
            <!-- Dropdown field with icons on either side -->
            <div
              class="dropdown-field-with-2-icons"
              v-if="field.type === 'iconDropdownIcon'"
            >
              <el-select
                :clearable="true"
                v-model="task[field.title]"
                :placeholder="field.placeholder"
                @change="changeDropdown($event, field)"
                @visible-change="onDropdownVisibleChange(field)"
                :multiple="field.isMultiple || false"
                :filterable="field.isFilterable || false"
                class="select-with-prefix"
              >
                <template #prefix>
                  <img
                    :src="field.leftIcon"
                    v-show="!dropdownVisible && !task[field.title]"
                    class="icon-style-left-dropdown"
                    @click="hideIcon(field)"
                  />
                  <el-avatar
                    v-show="task[field.title]"
                    :size="32"
                    class="selected-avatar"
                    :style="
                      getAvatarStyle(
                        findLabelById(task[field.title], field.options)
                      )
                    "
                    >{{
                      extractLetters(
                        findLabelById(task[field.title], field.options)
                      )
                    }}</el-avatar
                  >
                </template>
                <el-option
                  class="dropdown-option"
                  v-for="option in field.options"
                  :label="option.label"
                  :value="option.id"
                  :key="option.id"
                >
                  <template #default>
                    <el-avatar
                      :size="32"
                      class="option-avatar"
                      :style="getAvatarStyle(option.label)"
                      >{{ extractLetters(option.label) }}</el-avatar
                    >
                    {{ option.label }}
                  </template>
                </el-option>
              </el-select>
              <!-- <img :src="field.rightIcon" class="icon-style-right" /> -->
            </div>
            <!-- Date picker -->
            <el-date-picker
              v-if="field.type === 'date'"
              v-model="task[field.title]"
              type="date"
              :placeholder="field.placeholder"
              prefix-icon="''"
            >
            </el-date-picker>
            <!-- toggle -->
            <el-switch
              v-if="field.type === 'toggle'"
              v-model="task[field.title]"
            ></el-switch>
            <!-- single icon plus text -->
            <div v-if="field.type === 'iconText'" @click="field.handleOnClick">
              <!-- @click="handleReminderClick" -->
              <!-- render values if they exist -->
              <div
                v-show="task.reminder_details?.reminder_sent_at"
                class="text-field-with-left-icon"
              >
                <span class="text-style">{{
                  extractDateTimeFromSetReminderDetails()
                }}</span>
              </div>
              <!-- render if no reminder values -->
              <div
                v-show="!task.reminder_details?.reminder_sent_at"
                class="text-field-with-left-icon"
              >
                <img :src="field.leftIcon" class="icon-style-left" />
                <span v-if="field.placeholder" class="text-style">{{
                  field.placeholder
                }}</span>
              </div>
            </div>
            <!-- toggle icon with text -->
            <div
              v-if="field.type === 'toggleIcon'"
              class="toggle-icon-parent"
              @click="toggleIcon(field)"
            >
              <!-- <img :src="field.leftIcon" class="icon-style-left" /> -->
              <img :src="field.currentIcon" class="icon-style-left" />
              <span
                v-show="field.currentIcon === field.defaultIcon"
                style="color: #999999"
              >
                {{ field.iconTextDefault }}
              </span>
              <span
                v-show="field.currentIcon === field.checkedIcon"
                class="icon-text"
              >
                {{ field.iconTextChecked }}
              </span>
            </div>
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
          v-if="
            field.type === 'mapText' ||
            field.type === 'largeText' ||
            field.type === 'longText'
          "
        >
          <el-form-item :label="field.label">
            <!-- Map field -->
            <div class="container" v-show="field.type === 'mapText'">
              <el-input
                disabled
                :value="task[field.title]"
                :placeholder="'-'"
              ></el-input>
              <!-- <div class="searchBarWrapper">
                  <GoogleMapsAutocompleteInputVue
                    :placeholder="'Enter the property address'"
                    @placesChanged="isMapDisabled = false"
                  />
                </div> -->
              <!-- <div class="big-div forLabel">
                  <div class="map">
                    <div class="map-container">
                      <div
                        class="map-disabled-overlay"
                        v-if="isMapDisabled"
                        style="display: flex; flex-direction: column"
                      >
                        <img
                          src="../../../pages/createLead/components/assests/location_logo.svg"
                        />
                        <p style="padding-top: 26px" class="map-disabled-text">
                          Enter an address to view the map
                        </p>
                      </div>
  
                      <newProjectMapSelector
                        :geo-location="geoLocation"
                        :place="placeForMap"
                      />
                    </div>
                  </div>
                </div> -->
            </div>
            <!-- Large text field -->
            <!-- Text Area field -->
            <el-input
              class="largeText"
              v-show="field.type === 'largeText'"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder"
              v-model="task[field.title]"
            ></el-input>
            <!-- Long text field -->
            <!-- Text field -->
            <el-input
              v-if="field.type === 'longText'"
              :placeholder="field.placeholder"
              v-model="task[field.title]"
            ></el-input>
          </el-form-item>
        </el-col>
      </div>
    </el-form>
    <!-- Documents upload -->
    <div class="gridContainer">
      <div class="PDcard" v-for="(file, i) in task.documentInfo.files" :key="i">
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
            src="../../../assets/drop/Group 1832.png"
            class="dwnldIcon"
            target="_blank"
            @click="downloadClick(file)"
          />
          <img
            src="../../../assets/drop/Group 1831.png"
            class="delBtn"
            @click="deleteClick(file.id)"
          />
        </div>
      </div>
      <div class="PDcard" @click="isShareDocumentPopupVisible = true">
        <img src="../../../assets/drop/plus-circle (1).png" class="dwnldIcon" />
        <p class="addDocCon">Add Document</p>
      </div>
    </div>
    <ShareDocumentPopup
      :isShareDocumentPopupVisible.sync="isShareDocumentPopupVisible"
      @confirmUploaded="confirmUploaded"
      :isTaskMode="true"
      @documentData="setDocumentDataOnTask"
    />
    <DeleteProjectDocument
      v-if="isDeleteDocumentPopupOpen"
      :isDeleteProjectDocumentPopupOpen="isDeleteDocumentPopupOpen"
      @cancelDelete="isDeleteDocumentPopupOpen = false"
      @confirmDelete="confirmDelete"
    />
    <!-- End documents upload -->
    <el-button class="create-button" type="primary" @click="createTaskData"
      >Create</el-button
    >
  </div>
</template>

<script>
import { generateColorFromName } from "../../../utils";
import GoogleMapsAutocompleteInputVue from "../../../components/googleMaps/GoogleMapsAutocompleteInput.vue";
import newProjectMapSelector from "../../../components/ui/newProject/newProjectMapSelector.vue";
import AvatarHandler from "../../dashboardCRM/avatars/AvatarHandler.vue";
import ShareDocumentPopup from "../../dashboard/components/shareDocumentPopup.vue";
import fileType from "@/pages/utils/fileType";

const fileUploadAssets = import.meta.glob(
  "/src/assets/drop/fileUploadImages/*",
  { eager: true, as: "url" }
);
export default {
  props: {
    fieldsArray: {
      type: Array,
      required: true,
    },
    avatars: {
      type: Array,
      required: true,
    },
    reminderData: {
      type: Object,
      required: true,
    },
  },
  components: {
    GoogleMapsAutocompleteInputVue,
    newProjectMapSelector,
    AvatarHandler,
    ShareDocumentPopup,
  },
  data() {
    return {
      isDeleteDocumentPopupOpen: false,
      isShareDocumentPopupVisible: false,
      fileUploadAssets,
      busy: false,
      dropdownVisible: false,
      isMapDisabled: true,
      geoLocation: {
        center: { lat: 28.5421285, lng: 77.3348087 },
        zoom: 3,
      },
      placeForMap: {},
      task: {
        taskName: "",
        assignee: "",
        startDate: "",
        dueDate: "",
        priority: "default",
        reminder_details: this.$props.reminderData,
        status: "",
        homeOwner: "",
        location: "",
        leadStage: "",
        collaborators: [],
        location: "",
        description: "",
        documentInfo: {},
      },
      fields: [],
    };
  },
  watch: {
    reminderData(newvalue) {
      console.log(newvalue);
      this.task.reminder_details = newvalue;
      console.log(this.task);
    },
  },
  created() {
    console.log("created ran");
    this.setFields(this.$props.fieldsArray);
  },
  methods: {
    handleCollaboratorRemove(id) {
      let filteredArr = this.task.collaborators.filter((e) => e.id !== id);
      this.task.collaborators = filteredArr;
    },
    handleCollaboratorAdd(ele) {
      this.task.collaborators.push(ele);
    },
    // Documents methods
    setDocumentDataOnTask(data) {
      console.log(data);
      this.task.documentInfo = { ...data };
    },
    confirmUploaded() {
      console.log("confirm");
    },
    findFileTypeIcon(file) {
      let iconName = fileType["defaultFile"];
      if (fileType[file.file_type]) {
        iconName = fileType[file.file_type];
      } else {
        if (
          file.name.split(".").pop() === "dxf" ||
          file.name.split(".").pop() === "dwg"
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
      //?????
      let response = await API.DOCUMENT_INFO.DOWNLOAD_DOCUMENTS(postData);
      let url = response.data[0];
      saveAs(url, file.display_name);
    },
    async deleteClick(fileID) {
      this.isDeleteDocumentPopupOpen = true;
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
            this.isDeleteDocumentPopupOpen = false;
            this.getFiles();
          } catch (error) {
            let errorMessage =
              error.response.status === 403
                ? "You don't have permission to edit this task."
                : "error";
            this.$message({
              showClose: true,
              message: errorMessage,
              type: "error",
              center: true,
            });

            this.isDeleteDocumentPopupOpen = false;
          }
        }
      } else {
        if (isDelete) {
          let response = await API.DOCUMENT_INFO.DELETE_DOCUMENTS(
            this.fileIdToBeDeletedForDesigner
          );
          this.fileIdToBeDeletedForDesigner = "";
          this.isDeleteDocumentPopupOpen = false;
          this.getFilesForDesigner();
        }
      }
    },
    // End documents methods
    loadMore() {
      console.log("load more homeowners");
      const field = this.fields.filter((f) => f.type === "dropdownInfinite")[0];
      console.log(field);
      console.log(field.nextURL);
      if (field.nextURL !== null) {
        this.busy = true;
        console.log("loading");
        this.loadMoreLeadData(field);
        // const response = await field.handleGetMoreOptions(field.nextURL);
      }
    },
    async loadMoreLeadData(field) {
      console.log("add more data");
      if (field.nextURL !== null) {
        console.log("test");
        const response = await field.handleGetMoreOptions(field.nextURL);
        console.log(response);
        const leads = response.results;
        console.log(leads);
        field.nextURL = response.next;
        //add to options
        leads.map((t) => {
          t.label = t.name;
          t.value = t.id;
          t.location = t.address;
        });
        const options = leads ? leads : [];
        //check if an element from options exists in field.options
        //and then push
        const present = field.options.filter((o) => o.id === options[0].id)[0];
        if (!present) {
          field.options.push(...options);
          console.log("added options");
        }

        console.log(field.options);

        this.busy = false;
        //console.log(field);
        console.log(this.fields);
        //reset the nextURL field
        //Check if it loops properly
      }
    },

    setFields(fieldsList) {
      this.fields = [...fieldsList];
      console.log(this.fields);
    },
    extractLetters(sentence) {
      // Extract the first letter of the sentence

      // const firstLetter = sentence.match(/^\b(\w)/)[0];

      // Extract the last word of the sentence

      const words = sentence.split(" ");

      const firstLetter = words[0][0];

      const lastWordFirstLetter =
        words.length > 1 ? words[words.length - 1][0] : "";

      //console.log(firstLetter + lastWordFirstLetter);
      return firstLetter + lastWordFirstLetter;
    },
    getAvatarStyle(value) {
      const backgroundColor = generateColorFromName(value);
      //console.log(backgroundColor);
      return {
        backgroundColor: backgroundColor,
      };
    },
    findLabelById(id, options) {
      const option = options.find((option) => option.id === id);
      if (option) {
        return option.label;
      }
      return ""; // Return null if no corresponding label is found
    },
    changeDropdown(data, field) {
      console.log(data);
      if (field.hasOwnProperty("clicked")) {
        this.showIcons(field);
      }
      if (field.title === "homeOwner") {
        const loc = field.options.find((option) => option.id === data)?.address;
        this.task.location = loc ? loc : "";
        console.log(this.task.location);
      }
    },
    onDropdownVisibleChange(field) {
      console.log("show/hide dropdown");
      this.dropdownVisible = !this.dropdownVisible;
      console.log(this.dropdownVisible);
    },
    // clearInput() {
    //   this.task.assigneeName = "";
    // },
    // handleReminderClick() {
    //   console.log("click reminder");
    //   this.$emit("openSetReminder");
    // },
    extractDateTimeFromSetReminderDetails() {
      if (
        this.$props.reminderData &&
        this.$props.reminderData.reminder_sent_at
      ) {
        const dateObj = new Date(this.$props.reminderData.reminder_sent_at);
        const formattedDate = dateObj.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const formattedTime = dateObj.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        console.log(formattedDate); // Output: Jul 5, 2023
        console.log(formattedTime); // Output: 11:32 AM
        return `${formattedDate} | ${formattedTime}`;
      }
    },
    hideIcon(field) {
      console.log("hidden");
      field.clicked = true;
      this.dropdownVisible = true;
    },
    showIcons(field) {
      console.log("show");
      field.clicked = false;
    },
    toggleIcon(field) {
      if (field.currentIcon === field.defaultIcon) {
        field.currentIcon = field.checkedIcon;
        this.task.priority = "high";
      } else {
        field.currentIcon = field.defaultIcon;
        this.task.priority = "default";
      }
    },
    createTaskData() {
      console.log(this.task);
      // const newTask = {
      //   name: this.task.taskName,
      //   description: this.task.description,
      //   assignee_id: this.task.assignee,
      //   started_on: this.task.startDate.toISOString(),
      //   lead_id: this.task.homeOwner,
      //   //project_id: 67267,
      //   //location also not required
      //   due_by: this.task.dueDate.toISOString(),
      //   priority: this.task.priority,
      //   reminder_details: this.task.reminder_details,
      //   status: this.task.status,
      //   lead_stage: this.task.leadStage,
      //   collaborators: this.task.collaborators.map((e) => e.id),
      // };
      console.log(this.task.reminder_details);
      console.log(JSON.stringify(this.task.reminder_details));
      const formData = new FormData();
      formData.append("name", this.task.taskName);
      formData.append("description", this.task.description);
      formData.append("assignee_id", this.task.assignee);
      formData.append("started_on", this.task.startDate.toISOString());
      formData.append("lead_id", this.task.homeOwner);
      formData.append("due_by", this.task.dueDate.toISOString());
      formData.append("priority", this.task.priority);
      formData.append(
        "reminder_details",
        JSON.stringify(this.task.reminder_details)
      );
      formData.append("status", this.task.status);
      formData.append("lead_stage", this.task.leadStage);
      formData.append(
        "collaborators",
        this.task.collaborators.map((e) => e.id)
      );
      //document upload
      this.task.documentInfo.document_container = "other";
      formData.append(
        "document_container",
        this.task.documentInfo.document_container
      );
      formData.append("uploaded_by", this.task.documentInfo.uploaded_by);
      //files
      for (let file of this.task.documentInfo.files) {
        if (file.name) {
          formData.append(
            "file[]",
            file,
            file?.name?.replace(/[<>$:@"\/%|\?\#*!]/g, "_")
          );
        }
      }
      console.log(formData);
      this.$emit("createTask", formData);
    },
  },
};
</script>

<style scoped>
.taskCard {
  margin: 0 10px 10px 10px;
}

.el-form-item {
  padding: 0 10px;
  margin-bottom: 0;
}

.dropdown-option {
  display: flex;
  align-items: center;
}

.dropdown-option .el-avatar {
  padding-right: 20px;
}

.dropdown-field-with-2-icons::v-deep .el-input__prefix {
  left: 0x;
  top: 4px;
}

.dropdown-field-with-2-icons .icon-style-left-dropdown {
  border: black 1px dashed;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  padding: 3px;
  margin-top: 4px;
}

.dropdown-field-with-2-icons .selected-avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
}

.dropdown-option .el-avatar {
  padding-right: 0;
}

/*.dropdown-field-with-2-icons:hover {
  border-radius: 8px;
  background: #e8edf2;
}*/

.dropdown-field-with-2-icons {
  background: #e8edf2;
  border-radius: 8px;
}

.select-with-prefix::v-deep .el-input {
  padding-left: 30px; /* Adjust the value as needed */
}

.text-field-with-2-icons,
.dropdown-field-with-2-icons {
  display: flex;
  flex-flow: row nowrap;
}

.dropdown-field-with-2-icons::v-deep .el-input__inner {
  padding-left: 10px;
  padding-right: 10px;
}

/*.text-field-with-2-icons:hover {
  border-radius: 8px;
  background: #e8edf2;
}*/

.text-field-with-2-icons ::v-deep .el-input__inner {
  border-radius: 8px;
  background: #e8edf2;
}

.text-field-with-left-icon {
  display: flex;
  cursor: pointer;
  border-radius: 8px;
  background: #e8edf2;
  padding-left: 15px;
}

/*.text-field-with-left-icon:hover {
  border-radius: 8px;
  background: #e8edf2;
}*/

::v-deep .el-input__inner,
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
  border: none;
  padding: 0 15px;
  background-color: #e8edf2;
  border-radius: 8px;
}

.el-date-editor::v-deep input.el-input__inner {
  padding-left: 0;
}

/*::v-deep .el-input__inner:hover,
.el-date-editor.el-input__inner:hover {
  border-radius: 8px;
  background: #e8edf2;
}*/

::v-deep .el-form-item__label {
  padding: 0;
}

.icon-style-right {
  padding-left: 4px;
}
.icon-style-left {
  padding-right: 14px;
}

.toggle-icon-parent {
  display: flex;
  cursor: pointer;
}
.icon-text {
  color: red;
}

.text-style {
  color: #409eff;
}

.largeText::v-deep .el-textarea__inner {
  background: #e8edf2;
  border: none;
  border-radius: 8px;
  padding-left: 15px;
  padding-top: 12px;
}

.create-button {
  margin-top: 1rem;
}

/* map stuff*/
/* Map input field*/
.container {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}
.searchBarWrapper {
  text-align: left;
  /* border: 1px solid #c0c4cc; */
  height: 40px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  height: 44px;
}
.searchBarWrapper input {
  height: 48px;
  outline: none;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  background-color: #e8edf2;
  border-radius: 4px;
}

/* Style the map*/
.big-div {
  flex-basis: 40%; /* Adjust the width as needed */
  padding: 10px 0px;
  box-sizing: border-box;
}

.forLabel {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
}

.map {
  background-color: #e8edf2;
  /*height: 100%;*/
  width: 100%;
  height: 150px;
}

.map-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.map-disabled-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background: #e8edf2;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.map-disabled-text {
  width: 60%;
}
.collaborators >>> [data-v-40b46efa] .el-input__inner:hover {
  border: transparent;
  background-color: transparent;
}

/* Document upload stuff*/
</style>
