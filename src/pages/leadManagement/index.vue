<template>
  <div id="leadManagement">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <Sidebar :isSidebarOpen="isSidebarOpen" />
    <LeadManagement />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import LeadManagement from "./components/leadManagement.vue";
export default {
  components: {
    Navbar,
    Sidebar,
    LeadManagement,
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
