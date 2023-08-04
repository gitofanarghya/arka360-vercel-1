<template>
  <div class="home">
    <NavBar />
    <main class="main-container">
      <div class="backdrop"></div>
      <SideBar />
      <ProfileDetails />
    </main>
  </div>
</template>

<script>
import NavBar from "../../components/ui/newNavbar.vue";
import SideBar from "../../components/ui/sidebar.vue";
import ProfileDetails from "./components/profileDetails.vue";

export default {
  name: "Home",
  components: {
    NavBar,
    SideBar,
    ProfileDetails,
  },
  data() {
    return {
      isSidebarOpen: false,
    };
  },
};
</script>

<style scoped>
/* @import url(../userManagement/styles/styles.css); */
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
