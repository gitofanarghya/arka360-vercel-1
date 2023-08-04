<template>
    <div :class="forLeadSummary ? 'borderContainer' : 'withoutBorder'">
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: "TaskBody",
    props: {
        forLeadSummary: {
            type: Boolean,
            default: false,
        },
    },
  };
  </script>
  
  <style scoped>
  .borderContainer {
     padding: 0px;
     border-radius: 8px;
     border: 1px solid #ccc;
     background-color: #fff;
     max-height: 65vh;
     overflow: auto;
     overflow-x: hidden;
 }

 .withoutBorder {
     padding: 0px 0px 0px 8px;
     border-radius: 8px;
     background-color: #fff;
     overflow: auto;
     overflow-x: hidden;
    
 }
  </style>
  