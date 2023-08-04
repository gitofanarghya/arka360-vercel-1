<template>
  <div class="">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <main class="main-controller">
      <div class="backdrop"></div>
      <Sidebar :isSidebarOpen="isSidebarOpen" />

      <outerIncentiveListView />
    </main>

    <!-- <addPanelPopUp 
   :addPanelVisible.sync = "addPanelVisible"
  /> -->
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import outerIncentiveListView from "./components/outerIncentiveListView.vue";

export default {
  name: "Incentives",
  components: {
    Navbar,
    Sidebar,
    outerIncentiveListView,
  },

  data() {
    return {
      isSidebarOpen: false,
    };
  },

  methods: {
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
  },
};
</script>

<style scoped>
/* @import url(./styles/styles.css); */
</style>
