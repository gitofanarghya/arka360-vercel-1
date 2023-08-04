<template>
    <div class="design-defaults">
        <NavBar/>
        <main class='main-controller'>
          <div class='backdrop'></div>
          <SideBar/>
          <AllProfiles/>
        </main>
    </div>
</template>

<script>
import NavBar from '../../../components/ui/newNavbar.vue';
import SideBar from '../../../components/ui/sidebar.vue';
import AllProfiles from './allProfiles.vue'
export default {
  components: {
    NavBar,
    SideBar,
    AllProfiles,
  }
}
</script>

<style scoped>
/* @import url(./styles/styles.css); */
</style>