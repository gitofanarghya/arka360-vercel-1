<template>
<div>
  <el-card class="box-card cardCss desktop">
    <el-tabs v-model="activeTab">
          <el-tab-pane :label="tab" :name="tab" v-for="tab in tabs" :key="tab">
            <tabContainer :typeOfTab="tab" id="1"></tabContainer>
          </el-tab-pane>
    </el-tabs>
  </el-card>
  </div>
</template>
<script>
import tabContainer from "./tabContainer.vue";
export default {
  components: {
    tabContainer
  },
  data() {
    return {
      activeTab: "Loan",
      tabs:[
        "Loan",
        "PPA",
        "Lease"
      ]
    };
  },
};
</script>
<style scoped>

 .el-card.is-always-shadow {
  margin-top: 20px !important;
}

.el-tabs__item {
  font-size: 40px !important;
}
.el-tabs__item.is-active {
  color: rgb(255, 0, 0) !important;
  background: green !important;
}
.desktop{
  display: block;
}
.mobile{
display: none;
}
#tab-firstu {
  color: rgb(255, 0, 0) !important;
  background: green !important;
}
.cardCss {
  border-radius: 12px;
  box-shadow: none !important;
  border: 1px solid #ccc;
}
.box-card >>> .el-table__body-wrapper {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 394px);
  overflow-y: scroll;
}

.box-card >>> .el-tabs__item {
  color: #777777;
  font-size: 18px !important;
  font-weight: 100 !important;
}

.box-card >>> .el-tabs__item.is-active {
  color: #1c3366 !important;
}

.box-card >>> .el-tabs__active-bar {
  background-color: #1c3366 !important;
}

.box-card >>> .el-tabs__item:hover {
  color: #1c3366 !important;
  cursor: pointer;
}
</style>
