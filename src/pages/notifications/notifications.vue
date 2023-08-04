<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <Navbar />
    <div class="page-container">
      <h2 class="page-heading">Notifications</h2>
      <div class="section-container">
        <div class="sidebar">
          <div class="tabs-container">
            <!-- TODO: Icons for these tabs -->
            <el-radio-group
              v-model="notifFilterOne"
              class="tabs tabs-one"
              @change="onClickTab"
            >
              <el-radio-button label="latest">
                <img src="../leadManagement/components/assets/latest_Icon.svg"/>
                Latest (this week)
              </el-radio-button>
              <el-radio-button label="direct">
                <img src="../leadManagement/components/assets/ExclamationSquareFill.svg" />
                Direct
              </el-radio-button>
              <el-radio-button label="collaborations">
                <img src="../leadManagement/components/assets/EyeFill.svg" />
                Collaborating
              </el-radio-button>
              <el-radio-button label="archived">
                <img src="../leadManagement/components/assets/ArchiveFill.svg" />
                Archived
              </el-radio-button>
            </el-radio-group>
            <div class="tab-section-heading">Type</div>
            <el-radio-group
              v-model="notifFilterTwo"
              class="tabs"
              @change="onClickTab"
            >
              <el-radio-button label="all">
                <img src="../leadManagement/components/assets/latest_Icon.svg" />
                All
              </el-radio-button>
              <el-radio-button label="leads">
                <img src="../leadManagement/components/assets/PersonBadge.svg" />
                Leads
              </el-radio-button>
              <el-radio-button label="tasks">
                <img src="../leadManagement/components/assets/CheckCircle.svg" />
                Tasks
              </el-radio-button>
              <el-radio-button label="reminders">
                <img src="../leadManagement/components/assets/Union.svg" />
                Reminders
              </el-radio-button>
              <el-radio-button label="nudges">
                <img src="../leadManagement/components/assets/Nudge Icon.svg" />
                Nudges
              </el-radio-button>
            </el-radio-group>
          </div>
          <el-radio-group
            v-model="settingsTab"
            class="tabs"
            @change="onClickSettings"
          >
            <el-radio-button label="settings">
              <img src="../leadManagement/components/assets/mail.svg" />
              Notification Settings
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-container" v-if="settingsTab != 'settings'" v-loading="isLoadingNotifications">
          <div class="top-row">
            <div class="latest-section">
              Latest Notifications
              <div class="notif-count">
                {{ notificationsList.length }}
              </div>
            </div>
            <div>
              <button>Mark all as read</button>
              Unread only
              <el-switch v-model="isUnreadFilterOn"></el-switch>
            </div>
          </div>
          <div v-if="notificationsList.length" class="notifications-container">
            <NotificationCards 
                        :notificationsList="notificationsList"
                        @handleClick="handleOpenDrawer" 
                        :maxWidth="'100%'"
                    />
          </div>
          <div v-else class="notifications-container">
            {{ notificationsInfoMessage }}
          </div>
        </div>
        <div class="table-container settings-page-container" v-else>
          <div class="settings-types-container">
            <el-radio-group v-model="activeSettingsTab" class="tabs">
              <el-radio-button label="in_app">
                <img src="../leadManagement/components/assets/mail.svg" />
                In-App Notifications
              </el-radio-button>
              <el-radio-button label="email">
                <img src="../leadManagement/components/assets/mail.svg" />
                Email Notifications
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="settings-border">
            <div class="settings-container">
              <div class="options-container" v-if="activeSettingsTab == 'in_app'">
                <span class="settings-header">Leads Notifications</span>
                <hr />
                <div>
                  Assignee for a lead was changed
                  <el-switch v-model="editSettingsDicts.in_app.lead_assignee_updated_in_app"></el-switch>
                </div>
                <div>
                  A lead was updated
                  <el-switch v-model="editSettingsDicts.in_app.lead_updated_in_app"></el-switch>
                </div>
                <div>
                  A service order was updated
                  <el-switch v-model="editSettingsDicts.in_app.order_updated_in_app"></el-switch>
                </div>
                <div>
                  A proposal was updated
                  <el-switch v-model="editSettingsDicts.in_app.proposal_updated_in_app"></el-switch>
                </div>
                <span class="settings-header">Tasks Notifications</span>
                <hr />
                <div>
                  Assignee or collaborator for a task was changed
                  <el-switch v-model="editSettingsDicts.in_app.task_assignee_updated_in_app"></el-switch>
                </div>
                <div>
                  A task was updated
                  <el-switch v-model="editSettingsDicts.in_app.task_updated_in_app"></el-switch>
                </div>
                <div>
                  A task is overdue
                  <el-switch v-model="editSettingsDicts.in_app.task_overdue_in_app"></el-switch>
                </div>
                <hr />
                <span class="info-message"
                  >Reminders and nudges cannot be disabled.</span
                >
              </div>
              <div class="options-container" v-if="activeSettingsTab == 'email'">
                <span class="settings-header">Leads Notifications</span>
                <hr />
                <div>
                  Assignee for a lead was changed
                  <el-switch v-model="editSettingsDicts.email.lead_assignee_updated_email"></el-switch>
                </div>
                <div>
                  A lead was updated
                  <el-switch v-model="editSettingsDicts.email.lead_updated_email"></el-switch>
                </div>
                <div>
                  A service order was updated
                  <el-switch v-model="editSettingsDicts.email.order_updated_email"></el-switch>
                </div>
                <div>
                  A proposal was updated
                  <el-switch v-model="editSettingsDicts.email.proposal_updated_email"></el-switch>
                </div>
                <span class="settings-header">Tasks Notifications</span>
                <hr />
                <div>
                  Assignee or collaborator for a task was changed
                  <el-switch v-model="editSettingsDicts.email.task_assignee_updated_email"></el-switch>
                </div>
                <div>
                  A task was updated
                  <el-switch v-model="editSettingsDicts.email.task_updated_email"></el-switch>
                </div>
                <div>
                  A task is overdue
                  <el-switch v-model="editSettingsDicts.email.task_overdue_email"></el-switch>
                </div>
                <hr />
                <span class="info-message"
                  >Reminders and nudges cannot be disabled.</span
                >
              </div>
              <div class="update-container">
                <el-button
                  :disabled="isSettingsUpdateDisabled"
                  :loading="isUpdatingSettings"
                  type="primary"
                  class="update-button"
                  @click="onClickUpdate"
                >
                  Update
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <LeadDrawer
      v-if="showLeadQuickViewPane"
      :drawer="showLeadQuickViewPane"
      :lead="lead"
      :leadId="activeLeadId"
      @close="showLeadQuickViewPane = false"
      :activeTab="'first'"
    />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import LeadDrawer from "../leadManagement/components/leadsDrawer.vue";
import NotificationCards from "../notificationPopUp/NotificationCards.vue";
import Vue from "vue";
import API from "../../services/api";
import { fetchOrganisationId } from '../../utils';
import { Interval, DateTime } from "luxon";
window.DateTime = DateTime;

export default {
  components: {
    Navbar,
    LeadDrawer,
    NotificationCards
  },
  data() {
    return {
      notificationOrgDetails: {},
      showLeadQuickViewPane: false,
      activeLeadId: null,
      notifFilterOne: "latest",
      notifFilterTwo: "all",
      settingsTab: "",
      activeSettingsTab: "in_app",
      isUnreadFilterOn: false,
      isUpdatingSettings: false,
      isLoadingNotifications: false,
      notificationsInfoMessage: "Fetching notifications..",
      settingsDicts: {
        in_app: {
          "lead_assignee_updated_in_app": true,
          "lead_updated_in_app": false,
          "order_updated_in_app": false,
          "proposal_updated_in_app": false,
          "task_assignee_updated_in_app": true,
          "task_overdue_in_app": false,
          "task_updated_in_app": true
        },
        email: {
          "lead_assignee_updated_email": true,
          "lead_updated_email": false,
          "order_updated_email": true,
          "proposal_updated_email": true,
          "task_assignee_updated_email": true,
          "task_overdue_email": true,
          "task_updated_email": true
        }
      },
      editSettingsDicts: {
        in_app: {
          "lead_assignee_updated_in_app": true,
          "lead_updated_in_app": false,
          "order_updated_in_app": false,
          "proposal_updated_in_app": false,
          "task_assignee_updated_in_app": true,
          "task_updated_in_app": true,
          "task_overdue_in_app": false,
        },
        email: {
        "lead_assignee_updated_email": true,
        "lead_updated_email": false,
        "order_updated_email": true,
        "proposal_updated_email": true,
        "task_assignee_updated_email": true,
        "task_updated_email": true,
        "task_overdue_email": true,
        }
      },
      lead: {
        id: 67276,
        weather: null,
        project_type: "commercial",
        lead_details: {
          id: 1270,
          stage: "Lead",
          owner: "John Doe",
          deal_value: 0.0,
          latest_notes: null,
          estimated_system_size: 10.0,
          last_contacted: "3 hours ago",
          lead_source: "website",
          target_closure_date: null,
          name: "1qww",
          email: "lead.name@gmail.com",
          phone: "9228383048",
          created_at: "2023-06-30T12:13:03.146071Z",
        },
        country: null,
        tags: [
          {
            id: 2,
            name: "com",
          },
          {
            id: 10,
            name: "res",
          },
          {
            id: 16,
            name: "krishna",
          },
          {
            id: 17,
            name: "212211122221",
          },
          {
            id: 22,
            name: "hello",
          },
          {
            id: 24,
            name: "tag 2",
          },
          {
            id: 86,
            name: "sssfsg",
          },
          {
            id: 241,
            name: "vbkhgbe",
          },
          {
            id: 242,
            name: "rjgb",
          },
        ],
        activity_logs: [
          {
            id: 4807,
            name: "John Doe tagged lead as com",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:43.976736Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:43.976736Z",
            modified_at: "2023-07-02T09:23:43.976776Z",
          },
          {
            id: 4803,
            name: "Lead Created",
            activity_type: "lead_created",
            created_by: 1596,
            project: 67276,
            description: "Lead created through  website",
            documents: [],
            activitylog_created: "2023-06-30T12:13:03.159698Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-06-30T12:13:03.159698Z",
            modified_at: "2023-06-30T12:13:03.159741Z",
          },
          {
            id: 4804,
            name: "Lead moved to Lead",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-06-30T12:13:03.172003Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-06-30T12:13:03.172003Z",
            modified_at: "2023-06-30T12:13:03.172045Z",
          },
          {
            id: 4805,
            name: "Assigned deal to John",
            activity_type: "owner_assigned",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-06-30T12:13:03.182708Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-06-30T12:13:03.182708Z",
            modified_at: "2023-06-30T12:13:03.182750Z",
          },
          {
            id: 4806,
            name: "John Doe tagged lead as res",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:40.380419Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:40.380419Z",
            modified_at: "2023-07-02T09:23:40.380462Z",
          },
          {
            id: 4808,
            name: "John Doe tagged lead as 212211122221",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:48.260154Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:48.260154Z",
            modified_at: "2023-07-02T09:23:48.260194Z",
          },
          {
            id: 4809,
            name: "John Doe tagged lead as tag 2",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:51.552052Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:51.552052Z",
            modified_at: "2023-07-02T09:23:51.552091Z",
          },
          {
            id: 4810,
            name: "John Doe tagged lead as hello",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:54.798853Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:54.798853Z",
            modified_at: "2023-07-02T09:23:54.798893Z",
          },
          {
            id: 4811,
            name: "John Doe tagged lead as krishna",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:23:58.322263Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:23:58.322263Z",
            modified_at: "2023-07-02T09:23:58.322343Z",
          },
          {
            id: 4812,
            name: "John Doe tagged lead as sssfsg",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:24:10.184196Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:24:10.184196Z",
            modified_at: "2023-07-02T09:24:10.184236Z",
          },
          {
            id: 4813,
            name: "John Doe tagged lead as vbkhgbe",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:24:13.760649Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:24:13.760649Z",
            modified_at: "2023-07-02T09:24:13.760687Z",
          },
          {
            id: 4814,
            name: "John Doe tagged lead as rjgb",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:24:17.653104Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:24:17.653104Z",
            modified_at: "2023-07-02T09:24:17.653142Z",
          },
          {
            id: 4815,
            name: "John Doe updated the property type to 'Commercial'",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:24:36.024890Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:24:36.024890Z",
            modified_at: "2023-07-02T09:24:36.024933Z",
          },
          {
            id: 4816,
            name: "John Doe set the system size  as '10.0 kW'",
            activity_type: "lead_updated",
            created_by: 1596,
            project: 67276,
            description: "",
            documents: [],
            activitylog_created: "2023-07-02T09:24:50.195498Z",
            activity_time: null,
            modified_by: null,
            created_at: "2023-07-02T09:24:50.195498Z",
            modified_at: "2023-07-02T09:24:50.195542Z",
          },
        ],
        reminder_details: null,
        address: "",
        zoom: null,
        site_survey_token: null,
      },
      notificationsList: [
              { 
                  notification_details: {
                      action_by: "Navneet",
                      action_for_name: "Nirmal",
                      action_for: 1596,
                      content_obj_type: "lead",
                      content_obj_name: "design details kc",
                      content_obj_id: 1325,
                      action: "%%action_by%% assigned %%content_obj_name%% to %%action_for%%",
                      date: "2023-07-01T05:32:29.616Z",
                  },
                  is_read: false
              },
              {
                  notification_details: {
                      action_by: "Ajay",
                      content_obj_type: "lead",
                      content_obj_name: "document test",
                      content_obj_id: 1194,
                      lead_id: 12,
                      action_for_name: null,
                      action_for_id: null,
                      lead_status: "In Progress",
                      action: "%%action_by%% updated %%content_obj_name%% to %%lead_status%%",
                      date: "2023-06-25T05:32:29.616Z",
                  },
                  is_read: true
              },
              {
                  notification_details: {
                      action_by: "Sanjay",
                      content_obj_type: "task",
                      content_obj_name:
                          "Collect copies of electricity bills and the signed contract",
                      lead_id: 12,
                      action_for_name: null,
                      action_for: 1596,
                      lead_status: "In Progress",
                      action: "%%action_by%% assigned %%content_obj_name%% to %%action_for%%",
                      date: "2023-06-20T05:32:29.616Z",
                  },
                  is_read: false
              },
          ],
    };
  },
  created() {
    // this.modifyNotifications();
    this.fecthOrganisationNotifSettings();
  },
  computed: {
    isSettingsUpdateDisabled() {
      let changedObj = this.changedSettingsObject;
      if (Object.keys(changedObj).length) {
        return false;
      }

      return true;
    },
    changedSettingsObject() {
      let activeType = this.activeSettingsTab;
      let settingsDicts = this.settingsDicts;
      let editSettingsDicts = this.editSettingsDicts;

      let obj = {};
      Object.keys(settingsDicts[activeType]).forEach((key) => {
        if (
          editSettingsDicts[activeType][key] != settingsDicts[activeType][key]
        ) {
          obj[key] = editSettingsDicts[activeType][key];
        }
      });

      return obj;
    },
  },
  methods: {
    handleOpenDrawer(value){
            this.lead = value
            this.showLeadQuickViewPane = true
        },
    getNotificationTime(isoTime) {
      let unitsOrder = [
        "years",
        "months",
        "weeks",
        "days",
        "hours",
        "minutes",
        "seconds",
      ];

      let curTime = DateTime.now();
      let notifTime = DateTime.fromISO(isoTime);

      let intv = Interval.fromDateTimes(notifTime, curTime);
      let duration = intv.toDuration();
      let durObj = duration.rescale().toObject();

      let foundUnit;
      for (let unit of unitsOrder) {
        if (durObj[unit] != undefined) {
          foundUnit = unit;
          break;
        }
      }

      let unitText = foundUnit[0];
      if (foundUnit == "months") {
        unitText = "mon";
      }
      return durObj[foundUnit] + unitText + " ago";
    },
    onClickNotification(notification) {
      if (notification.notification_type == "lead") {
        this.activeLeadId = notification.lead_id;
        this.showLeadQuickViewPane = true;
      }
    },
    async onClickTab() {
      this.notificationsInfoMessage = "Fetching notifications..",
      this.isLoadingNotifications = true
      this.settingsTab = "";
      this.notifFilterOne ||= "latest";
      this.notifFilterTwo ||= "all";

      let queries = {
        notification_for: this.notifFilterTwo,
        type: this.notifFilterOne
      }

      try {
        let resp = await API.NOTIFICATIONS.GET_ALL_NOTIFICATIONS(queries)
        let results = resp.data.results
        this.notificationsList = results
        if (!results.length) {
          this.notificationsInfoMessage = "No notifications to show."
        }
      } catch {
        this.notificationsList = []
        this.notificationsInfoMessage = "There was an error while fetching notifications."
      }
      this.isLoadingNotifications = false
    },
    onClickSettings() {
      let settingsTypes = ["in_app", "email"];
      let settingsDicts = this.settingsDicts;
      let editSettingsDicts = this.editSettingsDicts;
      settingsTypes.forEach((type) => {
        Object.keys(settingsDicts[type]).forEach((key) => {
          editSettingsDicts[type][key] = settingsDicts[type][key];
        });
      });

      this.notifFilterOne = "";
      this.notifFilterTwo = "";
    },
    async fecthOrganisationNotifSettings(){
      let organisation_id = fetchOrganisationId()
      let response = await API.NOTIFICATIONS.GET_NOTIFICATION_SETTINGS(organisation_id);
      this.notificationOrgDetails = response.data;
      for (const key in this.notificationOrgDetails) {
        if(key.includes("in_app")) {
          this.editSettingsDicts.in_app[key] = this.notificationOrgDetails[key];
          this.settingsDicts.in_app[key] = this.notificationOrgDetails[key];
        }
        else if(key.includes("email")) {
          this.editSettingsDicts.email[key] = this.notificationOrgDetails[key];
          this.settingsDicts.email[key] = this.notificationOrgDetails[key];
        }
      }
    },
    async onClickUpdate() {
      this.isUpdatingSettings = true;
      let organisation_id = fetchOrganisationId()
      let changeObj = this.changedSettingsObject;

      try {
        let resp = await API.NOTIFICATIONS.UPDATE_NOTIFICATION_SETTINGS(
          organisation_id , changeObj
        );
        this.$message({
          showClose: true,
          message: 'Notification settings have been successfully updated.',
          type: "success",
          center: true
        })
        let activeType = this.activeSettingsTab;
        Object.keys(this.settingsDicts[activeType]).forEach((key) => {
          this.settingsDicts[activeType][key] = this.editSettingsDicts[activeType][key];
        });
        
      } catch (err) {
        console.error(err)
        this.$message({
          showClose: true,
          message:
            "There was an error while updating notification settings. Please try again.",
          type: "error",
          center: true,
        });
      }
      this.isUpdatingSettings = false;
    },
    // modifyNotifications() {
    //   function extractParts(input) {
    //     const regex = /(\{[^{}]+\}|[^{}]+)/g;
    //     return input.match(regex);
    //   }
    //   this.notificationsList.forEach((msg) => {
    //     let components = extractParts(msg.string);
    //     Vue.set(msg, "components", components);
    //   });
    // },
  },
};
</script>

<style scoped>
.page-container {
  background-color: rgb(232 237 242);
  padding: 1.6em;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.page-heading {
  margin-bottom: 1em;
}

.section-container {
  background-color: white;
  border-radius: 5px;
  padding: 1em;
  display: flex;
  gap: 1em;
  overflow: hidden;
}

.sidebar {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1em;
  color: rgb(129, 135, 140);
}

.tabs-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tab-section-heading {
  padding: 1em;
}

.tabs {
  display: flex;
  flex-direction: column;
  font-size: unset;
}

.tabs-one {
  margin-bottom: 1em;
}

.tabs ::v-deep.el-radio-button__inner,
.settings-button ::v-deep.el-checkbox-button__inner {
  color: rgb(129, 135, 140);
  border: none;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 1em;
  box-shadow: none;
}

.tabs ::v-deep.el-radio-button__inner:hover,
.settings-button ::v-deep.el-checkbox-button__inner:hover {
  background-color: rgb(242, 245, 247);
}

.tabs .is-active ::v-deep.el-radio-button__inner,
.settings-button.is-checked ::v-deep.el-checkbox-button__inner {
  color: black;
  background-color: rgb(232 237 242);
  font-weight: bold;
}

.table-container {
  width: 100%;
  flex: 8;
  display: flex;
  flex-direction: column;
}

.top-row {
  padding: 0.8em 0;
  color: rgb(129, 135, 140);
  display: flex;
  justify-content: space-between;
}

.latest-section {
  display: flex;
  align-items: center;
  gap: 0.4em;
}

.notif-count {
  padding: 0.4em;
  background-color: rgb(232 237 242);
  border-radius: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 1.6em;
  min-height: 1em;
}

.notifications-container {
  padding: 1em;
  background-color: rgb(232 237 242);
  height: 100%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.notification {
  padding: 0.5em 1em;
  background-color: white;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
}

.notif-right-section {
  display: flex;
  align-items: center;
  gap: 1em;
  color: rgb(129, 135, 140);
}

.unread-circle {
  background-color: #409EFF;
  height: 8px;
  width: 8px;
  border-radius: 50%;
}

.notification-action-by {
  font-weight: bold;
}

.settings-page-container {
  flex-direction: row;
  gap: 1em;
}

.settings-types-container {
  /* flex: 2 2 auto; */
}

.settings-border {
  flex: 6;
  display: flex;
  padding: 1em;
  background-color: rgb(232 237 242);
  border-radius: 5px;
}

.settings-container {
  flex: 1;
  background-color: white;
  border-radius: 5px;
  padding: 1em;
  display: flex;
  flex-direction: column;
}

.options-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.options-container * {
  margin: 0.3em 0;
}

.settings-header {
  font-weight: bold;
}

.info-message {
  color: rgb(129, 135, 140);
}

.update-container {
  margin-top: 1em;
  display: flex;
  justify-content: flex-end;
}
div >>> .el-radio-button__inner{
  background-color: white !important;
  border: 0 !important; 
  box-shadow: 0 !important;
}
.is-active >>> .el-radio-button__inner{
  background-color: #E8EDF2 !important;
  border: 0 !important; 
  box-shadow: 0 !important;
}
div >>> .is-focus{  
  background-color: #E8EDF2 !important;
  border: 0 !important; 
  box-shadow: none !important;
}
div >>> .el-radio-group{
  background-color: transparent !important;
}
div >>> label{
  box-shadow: none !important;
}

</style>
