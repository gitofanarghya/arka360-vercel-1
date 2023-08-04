<template>
  <div>
    <el-drawer
      :append-to-body="true"
      title="I am the title"
      :visible="drawer"
      class="allDrawer"
      :with-header="false"
      :size="drawerSize"
      :show-close="true"
      :before-close="onClose"
    >
      <component
        :is="componentName"
        :drawerStage.sync="drawerStage"
        :propsData.sync="propsData"
        @save="onSave()"
        @close="onClose()"
        :key="taskKey"
        :leadId="leadId"
        :tasks="tasks"
        :project_id="project_id"
        :forAddTask="forAddTask"
        :isDraw="isDrawer"
      >
        <template #header> </template>
        <template #body> </template>
        <template #footer> </template>
      </component>
    </el-drawer>
  </div>
</template>

<script>
import addOrEditTask from '../../leadManagement/components/addOrEditTask.vue';
import showTaskDetails from '../../leadManagement/components/models/showTaskDetails.vue';
import setReminder from "./../../setReminder/setReminder.vue";
import createLead from "./../../createLead/components/index.vue";
import dialogSection from "../../designOrders/components/dialogSection.vue";
import editActivity from "../../leadManagement/components/editActivity.vue";
import { mapActions } from 'pinia';
import { useMiscStore } from '../../../stores/misc';
export default {
  data() {
    return {
      isReminder: true,
      taskKey: 0,
    };
  },
  props: {
    isDrawer:{
      default: true,
      type: Boolean
    },
    drawer: {
      default: true,
      type: Boolean,
    },
    componentName: {
      type: String,
    },
    drawerSize: {
      type: Number,
      default: 700,
    },
    drawerStage: {
      type: String,
    },
    propsData: {
      type: Object,
    },
    leadId: {
      default: null,
      type: Number,
    },
    tasks:{
        type: Array,
        default: () => []
    },
    project_id:{
        type: Number,
    },
    forAddTask: {
      type: Boolean,
    },
  },
  components: {
    showTaskDetails,
    setReminder,
    createLead,
    dialogSection,
    editActivity,
    addOrEditTask,
  },
  methods: {
    ...mapActions(useMiscStore, {
      setDrawerState: "SET_DRAWER_STATE"
    }),
    onSave() {
      console.log("save");
      this.$emit("save", false);
    },
    onClose() {
      this.$emit("close", false);
      this.$emit("save", false);
    },
  },
  destroyed() {
    this.setDrawerState('globalDrawer', false);
  },
  watch: {
    drawerStage(newVal, oldVal) {
      console.log(newVal);
    },
    drawer(isDrawer) {
      if(isDrawer){
        if(this.componentName=="addOrEditTask") {
          this.taskKey++;
        }
        this.setDrawerState('globalDrawer', true);
      }
      else {
        this.setDrawerState('globalDrawer', false);
      }
      
    }
  },
};
</script>

<style lang="scss" scoped></style>
