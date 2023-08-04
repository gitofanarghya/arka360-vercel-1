<template>
    <div class="task-body">
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: "TaskBody",
  };
  </script>
  
  <style scoped>
  .task-body {
    margin: 0 1rem 1rem 1rem;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    max-height: 500px;
    overflow: auto;
    overflow-x: hidden;
  }
  </style>
  