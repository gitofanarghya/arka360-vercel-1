<template>
  <div class="tabsContainer">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Details" name="1">
        <div class="sections">
          <!-- <DetailsView :DetailsData="token" :orderData="orderData" /> -->
          <DetailsView :DetailsData="DetailsData" :orderData="orderData" />
          <DetailsView :DetailsData="customer" :orderData="projectData" />
          <DetailsView :DetailsData="ownerDetails" :orderData="orderData" />
          <DetailsView :DetailsData="moduleDetails" :orderData="orderData" />
          <DetailsView :DetailsData="ahjDetails" :orderData="projectData" />
          <DetailsView :DetailsData="additionalNotes" :orderData="orderData" />
        </div>
      </el-tab-pane>
      <el-tab-pane label="Documents" name="2" v-if="orderData.project">
        <Documents :orderData="orderData" />
      </el-tab-pane>
      <!-- <el-tab-pane label="Component Details" name="3">
        <DetailsView :DetailsData="moduleDetails" :orderData="orderData" />
      </el-tab-pane>
      <el-tab-pane label="AHJ" name="4" v-if="projectData">
        <DetailsView :DetailsData="ahjDetails" :orderData="projectData" />
      </el-tab-pane>
      <el-tab-pane label="Additional Notes" name="5" v-if="projectData">
        <DetailsView :DetailsData="additionalNotes" :orderData="orderData" />
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import DetailsView from "./detailsView.vue";
import Documents from "./documents.vue";

export default {
  components: {
    Documents,
    DetailsView,
  },
  mounted() {
    console.log("adhsa");
    this.activeName = "1";
  },

  data() {
    return {
      activeName: this.$props.active,
    };
  },
  props: {
    token: {
      type: Array,
    },
    DetailsData: {
      type: Array,
    },
    orderData: {
      type: Object,
    },
    projectData: {
      type: Object,
    },
    customer: {
      type: Array,
    },
    ownerDetails: {
      type: Array,
    },
    moduleDetails: {
      type: Array,
    },

    additionalNotes: {
      type: Array,
    },
    ahjDetails: {
      type: Array,
    },
    active: {
      type: String,
    },
  },

  methods: {
    ISUs() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      console.log(user);
      return user.isUSFlagEnabled;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  watch: {
    orderData(val) {
      console.log("ahdfg");
      this.activeName = "1";
    },
  },
};
</script>

<style scoped>
/* .sections {
  max-height: 20rem;
  overflow: auto;
  margin-bottom: 1rem;
} */
.tagsContainer {
  margin-bottom: 24px;
}

.flexContainer6 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.tags {
  padding: 4px 12px;
  border-radius: 50px;
  background-color: #e8edf2;
  color: #222;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #777;
  margin-bottom: 4px;
}
.tabsContainer {
}
.tabsContainer >>> .el-tabs__item {
  font-size: 18px;
  color: #777;
}

.tabsContainer >>> .el-tabs__item.is-active {
  color: #1c3366;
  font-weight: bold;
}

.tabsContainer >>> .el-tabs__active-bar {
  background-color: #1c3366;
}
</style>
