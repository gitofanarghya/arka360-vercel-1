<template>
  <div>
    <TaskElement
      :headingText="headName"
      :taskWidth="'400px'"
      :backgroundColor="'white'"
    >
      <template v-slot:header>
        <span class="taskStatus">{{ tasksStatus }}</span>
        <div>
          <el-button type="text" icon="el-icon-plus" @click="isOpen = true"
            >Add Task</el-button
          >
        </div>
      </template>
      <template v-slot:body>
        <Task
          v-for="task in tasks"
          :info="task"
          :key="task.id"
          v-on:toggleStatus="toggleStatus"
        />
      </template>
    </TaskElement>
    <GlobalDialog
      :dialogTitle="'Add Task'"
      :dialogVisible="isOpen"
      @handleClose="closeDialog"
      @handleClick="addTask"
    >
      <template v-slot:body>
        <el-input placeholder="Please input Title" v-model="title"></el-input>
        <div style="margin: 20px 0"></div>
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="Please input Description"
          v-model="description"
        >
        </el-input>
      </template>
    </GlobalDialog>
  </div>
</template>
<script>
const TASKS = [
  {
    id: 1,
    title: "Information Gathering",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: true,
    time: 1684402096698,
  },
  {
    id: 2,
    title: "Add Consumption",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: true,
    time: 1684402095698,
  },
  {
    id: 3,
    title: "Add Pricing",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: true,
    time: 1684402094698,
  },
  {
    id: 4,
    title: "Add Incentives",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: true,
    time: 1684402093698,
  },
  {
    id: 5,
    title: "Send Proposal",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 1684402092998,
  },
  {
    id: 6,
    title: "Send Contract",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 1684402092898,
  },
  {
    id: 7,
    title: "Collect copies of electricity bills",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 1684402092798,
  },
  {
    id: 8,
    title: "Collect the signed contract",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 1684402092699,
  },
  {
    id: 9,
    title: "Collect financing approval documents or advance cash payment",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
  },
  {
    id: 10,
    title: "Complete Sale",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 1684402092698,
  },
  {
    id: 11,
    title: "Complete Saleeeee",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis odit, qui voluptatem harum quis sint dolore id ducimus reprehenderit numquam fuga. Pariatur delectus suscipit ab consequuntur, velit ullam praesentium quo.",
    assignee: "Sonmung",
    isCompleted: false,
    time: 2684402092698,
  },
];

import TaskElement from "./models/Task/TaskElement.vue";
import GlobalDialog from "../../commonComponents/GlobalDialog.vue";
import Task from "./models/Task/Task.vue";
import mathUtils from "gjk/lib/math-utils";
export default {
  name: "TaskActivity",
  components: {
    TaskElement,
    Task,
    GlobalDialog,
  },
  data() {
    return {
      headName: "Tasks",
      tasks: [],
      tasksStatus: "",
      isOpen: false,
      title: "",
      description: "",
    };
  },
  methods: {
    toggleStatus(id) {
      this.tasks = this.tasks.map((e) =>
        e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
      );
      this.updateFinishedTasks();
    },
    sortTasks() {
      this.tasks.sort(function (a, b) {
        return b.time - a.time;
      });
    },
    updateFinishedTasks() {
      let completedTasks = 0;
      this.tasks.forEach((e) => {
        if (e.isCompleted) completedTasks++;
      });
      this.tasksStatus = `${completedTasks}/${this.tasks.length}`;
    },
    closeDialog() {
      this.isOpen = false;
    },
    addTask() {
      let newTask = {
        id: Math.floor(Math.random() * 1000000000),
        title: this.title,
        description: this.description,
        isCompleted: false,
        assignee: "Sonmung",
        time: this.computeSeconds(),
      };
      console.log(newTask);
      this.tasks.push(newTask);
      this.title = "";
      this.description = "";
      this.sortTasks();
    },
    computeSeconds() {
      let now = new Date();
      return now.getTime();
    },
  },
  computed: {},
  mounted() {
    TASKS.sort(function (a, b) {
      return b.time - a.time;
    });
    this.tasks = TASKS;
    console.log(this.tasks);
    let completedTasks = 0;
    this.tasks.forEach((e) => {
      if (e.isCompleted) completedTasks++;
    });
    this.tasksStatus = `${completedTasks}/${this.tasks.length}`;
  },
};
</script>
<style></style>
