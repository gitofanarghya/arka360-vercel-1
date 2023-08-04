<template>
    <div class="tasks" :style="{backgroundColor:backgroundColor}">
      <TaskHeader :heading="headingText" v-if="hasHeader">
        <slot name="header"></slot>
      </TaskHeader>
  
      <TaskBody :forLeadSummary="forLeadSummary">
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
      forLeadSummary: {
          type: Boolean,
           default: false,
      },
      headingText: {
        type: String,
        default: "",
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
      margin-top: 5px;
      display: absolute;
      color: #909399;
      font-size: smaller;
  }
  </style>
  