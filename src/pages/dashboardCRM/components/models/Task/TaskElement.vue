<template>
    <div class="tasks" :style="{width:taskWidth, backgroundColor:backgroundColor}">
      <TaskHeader :heading="headingText" v-if="hasHeader">
        <slot name="header"></slot>
      </TaskHeader>
  
      <TaskBody>
        <slot name="body"></slot>
      </TaskBody>
    </div>
  </template>
  
  <script>
  import TaskHeader from "./TaskHeader.vue";
  import TaskBody from "./TaskBody.vue";
  
  export default {
    name: "TaskElement",
    components: {
      TaskHeader,
      TaskBody,
    },
    props: {
      headingText: {
        type: String,
        default: "",
      },
      taskWidth:{
        type: String || Number,
        default: "400px",
      },
      backgroundColor: {
        type: String,
        default: 'white'
      }
    },
    computed: {
      hasHeader() {
        return !!this.$slots.header;
      },
    },
  };
  </script>
  
  <style>
  .tasks{
      padding-bottom: 1rem;
  }
  .taskStatus{
      color: #909399;
      font-size: smaller;
  }
  </style>
  