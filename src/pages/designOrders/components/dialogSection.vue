<template>
  <div class="container">
    <div>
      <el-row class="heading">
        <el-col :span="8" class="title"> Order Details</el-col>
        <el-col :span="16" class="btn-container">
          <div
            v-if="
              orderData?.add_ons_availed &&
              orderData.add_ons_availed?.length > 0
            "
          >
            <el-tag
              style="margin-right: 0.5rem"
              v-for="(addons, inx) in orderData.add_ons_availed"
              :key="inx"
              class="tag"
            >
              {{ addons }}
            </el-tag>
          </div>
          <!-- <div>
            <el-button @click="handleWebProposal()">web</el-button>
            <el-button @click="handleWebDoc">Doc</el-button>
            <el-button @click="handle3D">3D</el-button>
          </div> -->
          <div></div>
          <button
            v-if="
              orderData.order_status === 'incomplete' ||
              orderData.order_status === 'order_placed'
            "
            class="btn btn-primary btn-spacing"
            data-toggle="modal"
            data-target="#make_panel"
            size="mini"
            @click="handleAccept"
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
          <rejectDialog
            v-if="orderData?.order_status !== 'rejected'"
            :orderData="orderData"
            :orderDetailsPopVisible.sync="propsData.orderDetailsPopVisible"
            :rejectStatus.sync="rejectStatus"
          />
        </el-col>
      </el-row>
    </div>

    <el-row class="body">
      <el-col
        :span="12"
        v-for="(label, ind) in labelData"
        :key="ind"
        class="body-container"
      >
        <el-row class="label">
          {{ label.label }}
        </el-row>

        <el-row class="value">
          <el-select
            v-if="label.inputType == 'select'"
            placeholder="Select an Owner"
            v-model="orderData[label.prop]"
            @change="onAssigneeChange($event, label.prop, orderData)"
          >
            <el-option
              v-for="(item, ind) in label.options"
              :key="ind"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
              <el-badge
                is-dot
                v-if="item.shifts"
                :type="getType(item.shifts)"
                :class="'dot-badge'"
              ></el-badge>
              <span v-if="item.competence" :style="{ paddingLeft: '1rem' }">
                <el-tag
                  v-for="(comp, indx) in item.competence"
                  :key="indx"
                  class="tag"
                  :color="handleColorLightning(handleColor(comp), 80)"
                  :style="{
                    color: `${handleColor(comp)}`,
                    marginLeft: '0.2rem',
                  }"
                  type="red"
                  size="mini"
                >
                  {{ comp }}
                </el-tag>
              </span>
            </el-option>
          </el-select>
          <div v-else-if="label.inputType === 'icon'">
            <el-col
              :span="12"
              v-for="(icon, inx) in buttonsData"
              v-if="
                (orderData.design && icon.exist === 'desgin') ||
                (orderData.additional_info?.path && icon.exist === 'survey')
              "
            >
              <div class="icon-container" @click.navtive.stop="icon.callback()">
                <span>
                  <i
                    :key="inx"
                    :class="icon.icon"
                    class="icon-size"
                    style="padding-left: 0.5rem; color: #409eff"
                  ></i
                ></span>
                <span class="icon-text">{{ icon.tooltipContent }}</span>
              </div>
            </el-col>
          </div>
          <div v-else>{{ orderData[label.prop] }}</div>

          <el-col :span="9" class="addition-section">
            <!-- <i
              class="el-icon-document-checked"
              style="font-size: 1.2rem; padding-left: 0.5rem"
            ></i> -->
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row class="proposal-btns" v-if="designData">
      <el-col :span="24">
        <ProposalButtons :design="designData" />
      </el-col>
    </el-row>

    <div class="tabs">
      <Tabs
        :active="'1'"
        :token="token"
        :DetailsData="projectDetails"
        :orderData="orderData"
        :projectData="projectData"
        :customer="customerDetails"
        :ownerDetails="ownerDetails"
        :moduleDetails="moduleDetails"
        :additionalNotes="additionalNotes"
        :ahjDetails="ahjDetails"
      />
    </div>
    <ChatBox v-if="ISUs" :orderData="orderData" />
    <!-- <CollapsableContainer :containerWidth="700">
          <template v-slot:body>
            <ChatBox v-if="ISUs" :orderData="orderData" />
          </template>
        </CollapsableContainer> -->
  </div>
</template>

<script>
import { DateTime } from "luxon";
import rejectDialog from "./rejectDialog.vue";
import API from "@/services/api/";
import Tabs from "./tabs/tabs.vue";
import ChatBox from "../../project/components/chatBox/chatBox.vue";
import CollapsableContainer from "./pocComponents/collapsableContainer.vue";
import { isShiftOngoing } from "../../../utils/userStatus";
import {
  getLightenedColor,
  handleCompetenceColor,
} from "../../../utils/colorGenerator.js";
import {
  SITE_SURVEY_LINK,
  BASE_URL_FOR_REPORT_IMAGES,
} from "../../../constants";

import { chatEvents, sendEvent } from "../../../utils";
import ProposalButtons from "../../designSummaryCRM/components/ProposalButtons.vue";

export default {
  components: {
    rejectDialog,
    Tabs,
    ChatBox,
    CollapsableContainer,
    ProposalButtons,
  },
  data() {
    return {
      previousOrderStatus: "",
      rejectStatus: false,
      designData: "",
      order: this.$props.propsData.order,
      users: this.handleOptions(this.$props.propsData.users),

      orderData: null,
      projectData: null,
      ownerName: null,
      options: this.$props.propsData.users,
      buttonsData: [
        {
          type: "none",
          icon: "el-icon-edit-outline",
          size: "mini",
          callback: () => {
            console.log("Table 1 Delete");
            window.open(
              `${BASE_URL_FOR_REPORT_IMAGES}studio/${this.orderData.design}`
            );
          },
          exist: "desgin",
          tooltipContent: "Edit Design",
        },
        {
          type: "none",
          icon: "el-icon-document-checked",
          size: "mini",
          callback: () => {
            console.log("Table 1 Delete");
            const url = `${SITE_SURVEY_LINK}${this.orderData.additional_info?.path}/tsl`;
            window.open(url);
          },
          exist: "survey",
          tooltipContent: "Edit SiteSurvey",
        },
      ],
      labelData: [
        { label: "Order ID", prop: "id" },
        { label: "Order Type", prop: "service_type" },
        { label: "Project Name", prop: "name" },
        { label: "Created On", prop: "created_at" },

        {
          label: "Owner",
          prop: "engineer_name",
          inputType: "select",
          options: this.$props.propsData.users,
        },

        {
          label: "Status",
          prop: "order_status",
          inputType: "select",
          options: this.$props.propsData.orderStatusOptions,
        },
        { label: "Due Date", prop: "due_date" },
        {
          label: "",
          prop: "project",
          inputType: "icon",
        },
      ],
      token: [{ label: "TOKEN", prop: "user_token" }],
      projectDetails: [
        { title: "Project Details" },
        { label: "Name", prop: "name" },
        { label: "Stage", prop: "order_status" },
        { label: "Type", prop: "service_type" },
        { label: "Revisions", prop: "revision_version" },
      ],
      customerDetails: [
        { title: "Customer Details" },
        { label: "Name", prop: "client_name" },
        { label: "Email", prop: "client_email_id" },
        { label: "Phone", prop: "client_phone" },
        { label: "Address", prop: "client_address" },
      ],
      ownerDetails: [
        { title: "Owner Details" },
        { label: "Name", prop: "owner_name" },
        { label: "Email", prop: "owner_email" },
        { label: "Phone", prop: "owner_phone" },
      ],
      moduleDetails: [
        { title: "Module Inverter Details" },
        { label: "Module ID", prop: "component_type" },
        { label: "Module Data", prop: "moduleData" },
        { label: "Inverter ID", prop: "inverterID" },
        { label: "Inverter Data", prop: "inverterData" },
        { label: "Optimization Target", prop: "optimisationTarget" },
      ],
      ahjDetails: [
        { title: "AHJ" },
        { label: "AHJ Name", prop: "AHJName" },
        { label: "AHJ Code", prop: "AHJCode" },
        { label: "Building Code", prop: "BuildingCode" },
        { label: "Residential Code", prop: "ResidentialCode" },
        { label: "Fire Code", prop: "FireCode" },
        { label: "Electricity Code", prop: "ElectricCode" },
      ],

      additionalNotes: [
        { title: "Additional Notes" },
        { label: "Local Codes", prop: "local_code" },
        { label: "Project Requirements", prop: "Project_Requirements" },
      ],
    };
  },
  props: {
    propsData: {
      type: Object,
    },
  },
  created() {
    if (this.order.design) {
      console.log("design");
      // this.getDesignByID(this.order);
    }
  },

  mounted() {
    this.getOrderDetails(this.order);
  },
  watch: {
    // orderDetailsPopVisible(val) {
    //   if (val === false) {
    //     this.$props.propsData.handleOrderUpdate();
    //   }
    // },
    rejectStatus(val) {
      console.log(val);

      this.$props.propsData.handleOrderUpdate();
      this.rejectStatus = false;
    },
    propsData(newVal, oldVal) {
      console.log(this.orderData);
      const newOrder = newVal.order;
      this.getOrderDetails(newOrder);
      this.getDesignByID(newOrder);
      this.activeName = "1";
    },
  },
  methods: {
    handleModuleInverter(data) {
      let result = "";
      data.map((d, inx) => {
        result = result + d[0] + ` ${data.length - 1 > inx ? "," : ""}`;
      });
      console.log(result);
      return result;
    },
    handleIsShiftOngoing(shift) {
      return isShiftOngoing(shift);
    },
    getType(shifts) {
      return this.handleIsShiftOngoing(shifts) ? "success" : "info";
    },
    handleColor(data) {
      console.log(data);
      return handleCompetenceColor(data);
    },
    handleColorLightning(color, perc) {
      return getLightenedColor(color, perc);
    },
    ISUs() {
      this.activeName = "1";

      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    async updateOrders(id, data) {
      try {
        const resData = await API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(
          id,
          data
        );
        const updatedData = resData.data;
        console.log(resData);
        this.$props.propsData.handleOrderUpdate(updatedData, data);
        this.$emit("dialogUpdates", !this.$props.dialogUpdates);
      } catch {
        console.log("error updating orders");
      }
    },
    fullNameHandler(data) {
      console.log(this.users);
      console.log(data);
      const nameValue = this.users.find((u) => u.id == parseInt(data));

      console.log(nameValue);
      return nameValue?.label || "NA";
    },
    async getDesignByID(data) {
      const designs = await API.DESIGNS.FETCH_DESIGN(data.design);
      this.designData = designs.data;
      // console.log(designs.data.versions.scene.panelMap[0].structureType);
      // console.log(this.orderData);

      // console.log(this.designData.versions.summary?.bom_data);
    },

    async getOrderDetails(newOrder) {
      console.log(newOrder);
      let moduleInvers = "";
      this.projectData = newOrder.project ? newOrder.project : null;

      console.log(this.projectData);
      if (newOrder?.design) {
        let designs = await API.DESIGNS.FETCH_DESIGN(newOrder.design);
        moduleInvers = designs.data.versions?.summary?.bom_data;
        console.log(designs.data.versions.summary);
      }
      console.log(moduleInvers);
      let response = await API.DESIGN_ORDERS.FETCH_DESIGN_ORDER_BY_ID_METHOD(
        newOrder.id
      );
      console.log(response);
      const resData = response.data;
      const project = this.projectdata;
      const engineerData = resData.engineer_name
        ? this.users.find((u) => u.id == parseInt(resData?.engineer_name))
        : null;

      console.log(newOrder);
      resData.name = newOrder ? newOrder?.name || "NA" : "NA";
      resData.owner_name =
        resData?.created_by.first_name ||
        "" + resData?.created_by.last_name ||
        "" ||
        "NA";
      resData.owner_phone = resData?.created_by.phone || "NA";
      resData.owner_email = resData?.created_by.email || "NA";
      resData.engineer_name = this.fullNameHandler(resData.engineer_name);

      this.ownerName = resData.engineer_name;
      resData.created_at = this.handleDueDate(resData.created_at);
      resData.due_date = this.handleDueDate(resData.due_date);
      resData.revision_version = resData.revision_version
        ? resData.revision_version
        : 0;

      resData.moduleID = resData.module_inverter_data?.moduleID || "NA";
      resData.moduleData = moduleInvers
        ? this.handleModuleInverter(moduleInvers.modules)
        : resData.module_inverter_data?.moduleData || "NA";

      resData.inverterID = resData.module_inverter_data?.inverterID || "NA";
      resData.inverterData = moduleInvers
        ? this.handleModuleInverter(moduleInvers.inverters)
        : resData.module_inverter_data?.inverterData || "NA";
      resData.optimisationTarget = moduleInvers
        ? this.handleModuleInverter(moduleInvers.Optimizers)
        : resData.module_inverter_data?.optimisationTarget || "NA";
      resData.Project_Requirements =
        resData.additional_notes?.Project_Requirements || "NA";
      resData.local_code = resData.additional_notes?.local_code || "NA";

      this.orderData = resData;
      console.log(resData);

      this.labelData.map((l) => console.log(this.orderData[l.prop]));
    },
    handleDueDate(dateTime) {
      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() ===
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return "Today";
      }

      if (
        DateTime.fromISO(dateTime).startOf("day").toISO() >
        DateTime.local().startOf("day").toISO()
      ) {
        const date = DateTime.fromISO(dateTime);
        return "Overdue";
      }

      return DateTime.fromISO(dateTime).toFormat("dd/MM/y  hh:mm a");
    },

    onAssigneeChange(e, prop, orderData) {
      console.log(e);
      console.log(this.order);
      console.log(orderData);
      let patchData = {};
      const value = prop === "engineer_name" ? parseInt(e) : e;
      patchData[prop] = value;

      if (prop === "order_status" || prop === "engineer_name") {
        this.sendChatEvent(prop, value, this.orderData.id);
      }
      if (prop === "order_status") {
        this.$emit("update-card-column", this.orderData, value);
      } else {
        this.$emit("update-card", this.orderData, value);
      }

      this.updateOrders(this.orderData.id, patchData);
    },
    handleAccept() {
      console.log("accept");
      console.log(this.orderData);
      let orderStatus = {
        order_status: "in_process",
      };
      this.updateOrders(this.orderData.id, orderStatus);
    },
    handleOptions(user) {
      console.log(this.$props.propsData.users);
      user.map((u) => {
        let first = u?.first_name || "";
        let last = u?.last_name || "";
        u.label = first + " " + last;
        u.value = u.id;
      });

      return user;
    },

    sendChatEvent(prop, value, order_id) {
      if (prop === "engineer_name") {
        sendEvent(chatEvents.ORDER_ASSIGNMENT, order_id);
      }

      if (prop === "order_status") {
        if (value === "in_process") {
          console.log("sending event");
          sendEvent(chatEvents.ORDER_ACCEPTED, order_id);
        } else if (value === "complete") {
          sendEvent(chatEvents.COMPLETED_DESIGN, order_id);
        } else if (value === "rejected") {
          sendEvent(chatEvents.ORDER_REJECTED, order_id);
        }
      }
    },
    handleWebProposal() {
      console.log(this.designData);
      const designUUID = this.designData?.versions?.reference_id;
      console.log(designUUID);
      const route = { name: "webProposal", params: { designUUID } };

      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      console.log(url);
      // Open the URL in a new tab
      window.open(url, "_blank");
      console.log("proposal");
    },
    handleWebDoc() {
      const designId = this.designData?.id;
      const route = { name: "documentProposal", params: { designId } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    handle3D() {
      const designUUID = this.designData?.versions?.reference_id;
      const route = { name: "DesignOverview", params: { designUUID } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
      console.log("3D");
    },
  },
};
</script>

<style scoped>
.container {
  padding: 1.5rem;
}

.heading {
  display: flex;
  align-items: center;
}

.title {
}

.btn-container {
  display: flex;
  justify-content: end;
}

.btn-spacing {
  margin-right: 0.5rem;
}

.body {
  margin: 1.5rem 0rem 1rem 0rem;
}

.body-container {
  margin-bottom: 1rem;
}

.tabs {
  padding-bottom: 40px;
}

.label {
  padding-bottom: 0.5rem;
  font-size: 0.75rem;
  color: grey;
}

.custom-collapse .el-collapse-item__wrap {
  display: flex;
  flex-direction: column-reverse;
}

.custom-collapse .el-collapse-item__wrap {
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.custom-collapse .el-collapse-item.is-active .el-collapse-item__wrap {
  max-height: 1000px;
  /* Set a value larger than the expected content height */
}

.tag {
  border-radius: 20px;
}

.icon-container {
  cursor: pointer;
}

.icon-size {
  font-size: 1.5rem;
}

.icon-text {
  color: rgb(64, 158, 255);
  padding-left: 0.5rem;
}

.dot-badge {
  margin-left: 10px;
  height: 10px !important;
  width: 10px !important;
  margin-bottom: 6px !important;
}
.proposal-btns {
  margin-bottom: 0.5rem;
}
</style>
