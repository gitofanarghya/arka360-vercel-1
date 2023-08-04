<template>
  <div class="parentContainer">
    <el-drawer
      title="I am the title"
      :visible.sync="drawer"
      :with-header="false"
      :before-close="onClose"
      :size="700"
    >
      <div>
        <div class="headerLD">
          <el-button
            type="primary"
            class="shareBtn"
            @click="isShareProposalPopupVisible = true"
            >Share Proposal</el-button
          >
          <div class="header-left-buttons-container">
            <router-link
              :to="{
                name: 'leadSummary',
                params: { leadId: lead?.lead_details?.id },
              }"
            >
              <div class="fullDetContainer">
                <p class="fullDet">View full details</p>
                <img src="./assets/Arrow forward.svg" class="arrowIcon" />
              </div>
            </router-link>
            <span class="cross" @click="onClose()">&#x2716;</span>
          </div>
        </div>
        <div class="detContainer">
          <div class="flexContainer">
            <div class="flexContainer2">
              <p
                class="shrtForm"
                :style="{
                  backgroundColor: generateColorFromName(
                    lead?.lead_details?.name
                  )
                    ? generateColorFromName(lead?.lead_details?.name)
                    : '#1c3366',
                }"
              >
                {{ lead?.lead_details?.name[0] }}
              </p>
              <div class="flexContainer3">
                <p class="name">
                  <abbr :title="lead?.lead_details?.name" class="abbrTag">
                    {{ lead?.lead_details?.name }}</abbr
                  >
                </p>
                <span class="res">({{ lead?.project_type }})</span>
                <p class="number">
                  {{ lead?.lead_details?.phone }} &nbsp;
                  <span class="email">{{ lead?.lead_details?.email }}</span>
                </p>
                <p class="address">{{ lead?.address || "Unknown Address" }}</p>
              </div>
            </div>
            <img
              src="./assets/share.svg"
              class="shareIcon"
              @click="openShareProjectPopup()"
            />
          </div>
          <div class="gridContainer">
            <div class="boxOne">
              <p class="label">Owner</p>
              <div class="flexContainer4">
                <infiniteScrollUsers
                  :user.sync="selectedUser"
                  :isUserListDisabled="isPublicShared"
                  :crmMode="true"
                  style="flex-grow: 1"
                />
                <!-- <div class="flexContainer5">
                                <p class="shrtFormSmall">AL</p>
                                <p class="ownerName">{{ lead?.lead_details?.owner }}</p>
                            </div>
                            <img src="./assets/X.svg" class="crossIcon" /> -->
              </div>
            </div>
            <div class="boxOne">
              <p class="label">Stage</p>
              <el-select
                v-model="lead.lead_details.stage"
                placeholder="Due Date"
                @change="updateStageInLead()"
              >
                <el-option
                  v-for="stage in pipeline"
                  :key="stage"
                  :label="stage"
                  :value="stage"
                >
                </el-option>
              </el-select>
            </div>
            <div class="boxOne">
              <p class="label">Lead Source</p>
              <el-select
                v-model="lead.lead_details.lead_source"
                placeholder="Due Date"
                @change="updateLeadSource()"
              >
                <el-option
                  v-for="item in leadSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div style="padding: 0px 24px; margin-bottom: 16px">
            <p class="label">Tags</p>
            <Tags
              :tagsInProps="lead.tags"
              :lead="lead"
              :isUsingStore="false"
              :currentRowNumber="currentRowNumber"
              @updated-tags="emitUpdatedTags"
            />
          </div>
          <!-- <div style="padding: 0px 24px 24px 24px"> -->
        </div>
      </div>
      <Tabs
        :lead="lead"
        :activeTab="activeTab"
        :project_id="lead.id"
        :focusAddNote="focusNote"
        :isDrawer="true"
      />
    </el-drawer>
    <ShareProject
      :shareDialogBoxVisible.sync="shareDialogBoxVisible"
      :project_id="lead.id"
    />
    <ShareProposalPopup
      v-if="isShareProposalPopupVisible"
      :isShareProposalPopupVisible.sync="isShareProposalPopupVisible"
      :lead="lead"
    />
  </div>
</template>

<script>
import Tabs from "./tabs.vue";
import Tags from "./tags.vue";
import { mapActions, mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";
import { useLeadStore } from "../../../stores/lead";
import {
  getLeadPipelineStages,
  getLeadSourceOptions,
  generateColorFromName,
  isCrmUser,
} from "../../../utils";
import ShareProject from "../../project/components/projectNameAndActions/shareProject.vue";
import API from "@/services/api/";
import infiniteScrollUsers from "@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue/";
import ShareProposalPopup from "../../../components/ui/shareProposalPopup.vue";
import { useMiscStore } from "../../../stores/misc";

export default {
  components: {
    Tabs,
    Tags,
    ShareProject,
    infiniteScrollUsers,
    ShareProposalPopup,
  },
  props: {
    drawer: {
      type: Boolean,
      default: false,
    },
    lead: {
      type: Object,
      default: () => {
        return {};
      },
    },
    activeTab: {
      type: String,
      default: "active",
    },
    currentRowNumber: {
      type: Number,
      default: 0,
    },
    focusNote: {
      type: Boolean,
      default: false,
    },
  },
  async created() {
    console.log(this.lead)
    this.fetchProjectPermissionForLead();
    this.fetchCurrentLeadInfo();
    await this.setLeadFromData(this.lead);
    // this.selectedUser = "sanchit";
  },
  mounted() {
    console.log("opened leads drawer", this.$props.lead);
    this.oldStageValue = this.lead.lead_details.stage;
    this.oldSourcevalue = this.lead.lead_details.lead_source;
    this.setDrawerState("leadsDrawer", true);
  },
  destroyed() {
    this.setDrawerState("leadsDrawer", false);
  },
  data() {
    return {
      options: [
        {
          value: "Option1",
          label: "Option1",
        },
        {
          value: "Option2",
          label: "Option2",
        },
      ],
      value: "",
      selectedUser: {},
      oldSelectedUser: {},
      oldStageValue: null,
      oldSourcevalue: null,
      isPublicShared: false,
      pipeline: getLeadPipelineStages(),
      leadSourceOptions: getLeadSourceOptions(),
      shareDialogBoxVisible: false,
      isShareProposalPopupVisible: false,
    };
  },

  computed: {
    ...mapState(useProjectStore, {
      projectPermissionObject: "GET_PERMISISON_OBJECT",
    }),
  },

  methods: {
    ...mapActions(useMiscStore, {
      setDrawerState: "SET_DRAWER_STATE",
    }),
    ...mapActions(useProjectStore, ["FETCH_PERMISSION_OBJECT"]),
    ...mapActions(useLeadStore, {
      updateLead: "UPDATE_LEAD_FROM_DRAWER",
    }),
    ...mapActions(useLeadStore, {
      setLeadFromData: "SET_LEAD_FROM_DATA",
    }),
    onClose() {
      this.$emit("close", false);
    },
    fetchCurrentLeadInfo() {
      this.selectedUser = this.lead?.lead_details?.owner;
    },
    openShareProjectPopup() {
      if (isCrmUser() && !this.projectPermissionObject["share_project"]) {
        this.$toastr.e("You don't have permission to share this project");
        return;
      }
      this.shareDialogBoxVisible = true;
    },
    async fetchProjectPermissionForLead() {
      try {
        this.FETCH_PERMISSION_OBJECT(this.lead.id);
      } catch (e) {
        console.error(e);
      }
    },
    async updateOwnerInLead(ownerId, selectedOwnerObj, oldSelectedOwnerObj) {
      const patchData = {
        owner: ownerId,
      };
      try {
        this.$emit(
          "update-owner",
          selectedOwnerObj,
          this.currentRowNumber,
          this.lead
        );
        this.$emit("update-kanban", this.lead, selectedOwnerObj);
        await this.updateLead(
          this.lead.lead_details.id,
          this.lead.id,
          patchData
        );
      } catch (e) {
        this.$emit(
          "update-owner",
          oldSelectedOwnerObj,
          this.currentRowNumber,
          this.lead
        );
        this.selectedUser = JSON.parse(JSON.stringify(oldSelectedOwnerObj));
        this.$message({
          showClose: true,
          message: "There is an error while updating the information.",
          type: "error",
          center: true,
        });
      }
    },
    async updateStageInLead() {
      const patchData = {
        stage: this.lead.lead_details.stage,
      };
      this.$emit(
        "update-stage",
        this.lead.lead_details.stage,
        this.currentRowNumber,
        this.lead,
        this.oldStageValue
      );
      try {
        await this.updateLead(
          this.lead.lead_details.id,
          this.lead.id,
          patchData
        );
      } catch (e) {
        this.lead.lead_details.stage = this.oldStageValue;
        this.$emit(
          "update-stage",
          this.oldStageValue,
          this.currentRowNumber,
          this.lead,
          this.oldStageValue
        );
        this.$message({
          showClose: true,
          message: "There was an error while updating the stage.",
          type: "error",
          center: true,
        });
      }
    },
    async updateLeadSource() {
      const patchData = {
        lead_source: this.lead.lead_details.lead_source,
      };
      this.$emit(
        "update-lead-source",
        this.lead.lead_details.lead_source,
        this.currentRowNumber,
        this.lead
      );
      try {
        await this.updateLead(
          this.lead.lead_details.id,
          this.lead.id,
          patchData
        );
        this.oldSourcevalue = this.lead.lead_details.lead_source;
      } catch (error) {
        this.$message({
          showClose: true,
          message: "There was an error while updating the stage.",
          type: "error",
          center: true,
        });
      }
      this.$emit(
        "update-lead-source",
        this.oldSourcevalue,
        this.currentRowNumber,
        this.lead
      );
    },
    emitUpdatedTags(totalTags, index) {
      this.$emit("updated-tags", totalTags, index);
    },
    generateColorFromName,
    isCrmUser,
  },
  watch: {
    selectedUser: {
      deep: true,
      handler(value, oldValue) {
        if (value.id) {
          this.updateOwnerInLead(value.id, value, oldValue);
        }
      },
    },
    drawer(newDrawer) {
      if (newDrawer) {
        this.setDrawerState("leadsDrawer", true);
      } else {
        this.setDrawerState("leadsDrawer", false);
      }
    },
    async lead(val) {
      console.log(val);
      this.fetchProjectPermissionForLead();
      this.fetchCurrentLeadInfo();
      await this.setLeadFromData(this.$props.lead);
    },
  },
};
</script>

<style scoped>
/* .parentContainer {
  position: fixed;
  width: 700px;
  height: calc(100vh);
  top: 0px;
  right: 0px;
  background-color: #fff;
  z-index: 1000;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.25);
} */

p,
span,
h1,
h2,
h3 {
  word-break: break-word;
}

.parentContainer >>> .el-drawer__body {
  /* overflow: hidden; */
  display: grid;
  grid-template-rows: max-content auto;
}

.parentContainer >>> .el-drawer {
  max-width: 760px;
  min-width: 650px;
  height: 100vh;
}

.headerLD {
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #ccc;
}

.header-left-buttons-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.shareBtn {
  width: 158px;
  height: 45px;
  font-size: 18px;
  font-weight: bold;
}

.fullDetContainer {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 290px;
}

.fullDet {
  font-size: 12px;
  font-weight: bold;
  color: #222;
}

.flexContainer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.flexContainer {
  margin-bottom: 24px;
  padding: 24px 24px 0px 24px;
}

.flexContainer2 {
  display: grid;
  grid-template-columns: 60px auto;
  gap: 16px;
}

.shrtForm {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  font-size: 32px;
  color: #fff;
  background-color: #ef6c00;
  border-radius: 50%;
}

.flexContainer3 {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name {
  font-size: 24px;
  font-weight: bold;
  color: #222;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.abbrTag {
  text-decoration: none;
}

.res {
  font-size: 16px;
  color: #777;
  text-transform: capitalize;
}

.number,
.email,
.address {
  font-size: 14px;
  color: #777;
  display: flex;
  gap: 8px;
  align-items: center;
}

.address {
  display: grid;
  grid-template-columns: 20px auto;
  align-items: flex-start;
}

.email {
  padding-left: 8px;
}

.number::before {
  content: "";
  background: url("./assets/call.svg");
  width: 20px;
  height: 20px;
  display: block;
}

.email::before {
  content: "";
  background: url("./assets/mail.svg");
  width: 20px;
  height: 20px;
  display: block;
}

.address {
  font-size: 16px;
}

.address::before {
  content: "";
  background: url("./assets/distance.svg");
  width: 20px;
  height: 20px;
  display: block;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 8px;
  padding: 0px 24px 0px 24px;
}

.flexContainer5 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.label {
  font-size: 14px;
  color: #777;
  margin-bottom: 4px;
}

.flexContainer4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.ownerName {
  font-size: 16px;
  color: #222;
}

.shrtFormSmall {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: #fff;
  background-color: #1c3366;
  border-radius: 50%;
}

.tagsContainer {
  margin-bottom: 24px;
}

.flexContainer6 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.tags {
  padding: 4px 12px;
  border-radius: 50px;
  background-color: #e8edf2;
  color: #222;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.addIcon,
.crossIcon,
.shareIcon {
  cursor: pointer;
}

.gridContainer >>> .el-input__inner {
  border: none;
  background-color: #e8edf2;
  height: 40px;
  font-size: 16px;
  color: #222;
}

.gridContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  position: relative;
  top: 2px;
  transform: rotate(0deg);
}

.gridContainer >>> .el-select .el-input .el-select__caret.is-reverse {
  position: relative;
  top: 0px;
  transform: rotate(180deg);
}

.gridContainer >>> .el-icon-arrow-up:before {
  content: url("./assets/CaretDownFill.svg");
}

.gridContainer >>> .el-input__inner::placeholder {
  font-size: 14px;
  color: #222;
}

.parentContainer >>> .el-select {
  max-width: inherit !important;
}

.shareIcon {
  cursor: pointer;
}
</style>
