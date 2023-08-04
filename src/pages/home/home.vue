<template>
    <div class="home">
        <NavBar/>
        <main class='main-container'>
          <div class='backdrop'></div>
          <SideBar/>
          <div v-if="isUS">
             <dashboard /> 
          </div>
          <div v-else><ProjectListView/></div>
         
         
        </main>
    </div>
</template>

<script>
import NavBar from '../../components/ui/newNavbar.vue';
import SideBar from '../../components/ui/sidebar.vue';
import ProjectListView from './components/projectListView.vue';
import dashboard from '../dashboard/components/dashboard.vue';

export default {
  name: 'Home',
  components: {
    NavBar,
    SideBar,
    ProjectListView,
    dashboard
  },
  data() {
    return {
      isSidebarOpen: false,
      isUS:true
    }
  },
  created(){
     const user = JSON.parse(localStorage.getItem('user'));
    //  console.log("@@@@ country",user.country);
    // if(user.isUSFlagEnabled)
    // this.isUS = true;
    // else
    // this.isUS=false;

  }
}
</script>

<style scoped>
/* @import url(./styles/styles.css); */


.home{
  height: 100vh;
}
@media (min-height:1280px) {
  .home{
    overflow-y: auto;
  }
}
</style>
