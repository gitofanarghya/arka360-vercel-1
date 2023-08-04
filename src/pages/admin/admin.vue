<template>
  <div class="">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <main class="main-controller">
      <div class="backdrop"></div>
      <Sidebar :isSidebarOpen="isSidebarOpen" />

      <panelAndInverterListView />
    </main>

    <!-- <addPanelPopUp 
   :addPanelVisible.sync = "addPanelVisible"
  /> -->
  </div>
</template>


<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import panelAndInverterListView from "./components/panelAndInverterListView.vue";

export default {
  name: "Admin",
  components: {
    Navbar,
    Sidebar,
    panelAndInverterListView,
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

<style>
/* @import url(./styles/styles.css); */
</style>