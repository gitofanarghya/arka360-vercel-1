<template>
  <div class="">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <main class="main-controller">
      <div class="backdrop"></div>
      <Sidebar :isSidebarOpen="isSidebarOpen" />
      <CustomTariffWrapper />
    </main>
  </div>
</template>
  
  <script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import CustomTariffWrapper from "./components/customTariffWrapper.vue";

export default {
  name: "customTariff",
  components: {
    Navbar,
    Sidebar,
    CustomTariffWrapper,
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
</style>