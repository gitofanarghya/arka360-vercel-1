<template>
  <div class="">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <main class="main-controller">
      <div class="backdrop"></div>
      <Sidebar :isSidebarOpen="isSidebarOpen" />
       <financials-wrapper></financials-wrapper>
    </main>
   
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import financialsWrapper from "./components/financialsWrapper.vue";

export default {
  name: "Financials",
  components: {
    Navbar,
    Sidebar,
    financialsWrapper
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
