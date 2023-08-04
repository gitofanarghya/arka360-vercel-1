<template>
    <div class="task-header">
      <h3>{{ heading }}</h3>
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: "TaskHeader",
    props: ["heading"],
  };
  </script>

  <style scoped>
  .task-header {
    display: flex;
    align-items: center;
    /*/* font-family: "Switzer";*/
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;
    line-height: 26px;
    padding: 0;
    height:auto;
    margin: 0;
    gap: 0.5rem;
    padding-top: 8px;
  }
  </style>