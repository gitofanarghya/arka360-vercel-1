<template>
  <div>
    <el-card class="box-card cardCss desktop">
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.value">
          <TabContainer :typeOfTariff="tab.value" id="1" @update="updateCaller()" :key="counter" :searchQuery="searchQuery"/>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import TabContainer from "./tabContainer.vue";
export default {
  components: {
    TabContainer,
  },
  props:{
    tabCounter: {
      default: 0,
    },
    searchQuery:{
      default: "",
      type: String
    }
  },
  watch: {
    tabCounter:{
      handler(val){
        this.counter++;
      }
    }
  },
  data() {
    return {
      activeTab: "All Tariffs",
      counter: 0,
      tabs: [
        { label: "All Tariffs", value: "allTariffs" },
        { label: "My Tariffs", value: "myTariffs" }
      ],
    };
  },
  methods: { 
    updateCaller(){
      this.counter++;
    }
  }
};
</script>


    <style scoped>
.box-card >>> .el-card__body {
  padding: 12px 20px 20px 20px;
}

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
.desktop {
  display: block;
}
.mobile {
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
}

.box-card >>> .el-tabs__item.is-active {
  color: #1c3366 !important;
  font-weight: 600 !important;
}

.box-card >>> .el-tabs__active-bar {
  background-color: #1c3366 !important;
}

.box-card >>> .el-tabs__item:hover {
  color: #1c3366 !important;
  cursor: pointer;
}
</style>
    