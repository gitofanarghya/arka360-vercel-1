<template>
  <div>
    <el-row class="sections" v-for="(proj, index) in DetailsData" :key="index">
      <el-row class="section-header" v-if="proj.title">
        <el-col>{{ proj.title }}</el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="6" class="label">{{ proj.label }} </el-col>
        <el-col :span="18" class="value">{{
          orderData[proj.prop] ? orderData[proj.prop] : "NA"
        }}</el-col>
      </el-row>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    DetailsData: {
      type: Array,
      default: [],
    },
    orderData: {
      type: Object,
    },
  },
};
</script>

<style scoped>
.section-header {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 600;
}
.sections {
  margin-top: 0.5rem;
}
.label {
  color: grey;
}
</style>
