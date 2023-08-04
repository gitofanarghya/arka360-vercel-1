<template>
    <div class="home">
        <NavBar/>
        <main class='main-container'>
          <div class='backdrop'></div>
          <SideBar/>
          
          <ProjectListView/>
         
         
        </main>
    </div>
</template>

<script>

import NavBar from '../../../components/ui/newNavbar.vue';
import SideBar from '../../../components/ui/sidebar.vue';
import ProjectListView from './projectListView.vue';


export default {
  name: 'projectListViewHome',
  components: {
    NavBar,
    SideBar,
    ProjectListView,
  
  },
  data() {
    return {
      isSidebarOpen: false,
    }
  },
}
</script>

<style scoped>
/* @import url(./styles/styles.css); */


.home{
  height: 100vh;
}
@media (min-height:840px) {
  .home{
    overflow-y: hidden;
  }
}
.home{
  overflow-y: hidden;
}
</style>
