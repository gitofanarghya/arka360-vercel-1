<template>
  <div class="home">
    <NavBar />
    <main class="main-container">
      <div class="backdrop"></div>
      <SideBar />
      <ProfileManager />
    </main>
  </div>
</template>

<script>
import NavBar from "../../components/ui/newNavbar.vue";
import SideBar from "../../components/ui/sidebar.vue";
import ProfileManager from "./profileManager.vue";

export default {
  name: "Home",
  components: {
    NavBar,
    SideBar,
    ProfileManager,
  },
  data() {
    return {
      isSidebarOpen: false,
    };
  },
};
</script>

<style scoped>
/* @import url(./styles/styles.css); */
.home {
  height: 100vh;
}
@media (min-height: 840px) {
  .home {
    overflow-y: hidden;
  }
}
.home {
  overflow-y: hidden;
}
</style>
