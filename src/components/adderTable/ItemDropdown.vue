<template>
    <el-select v-model="selectedItem" placeholder="Select an item">
      <el-option
        v-for="item in items"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
  </template>
  
  <script>
  export default {
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        selectedItem: null,
      };
    },
    watch: {
      selectedItem(value) {
        this.$emit('item-selected', value);
        this.selectedItem = null;
      },
    },
  };
  </script>
  