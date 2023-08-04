<template>
  <el-switch v-model="isActive" inactive-color="#F98022"
    :active-text="activeText"
    :inactive-text="inactiveText"
    @change="handleToggleChange"
    ></el-switch>
</template>
  
<script>
export default {
  data() {
    return {
      isActive: false
    };
  },
  props: {
    activeText: {
      type: String,
      default: ""
    },
    inactiveText: {
      type: String,
      default: ""
    }
  },
  methods: {
    handleToggleChange(value) {
      this.$emit("change", value);
    }
  }
};
</script>
  