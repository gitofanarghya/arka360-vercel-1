<template>
    <div id="dashboard">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <Dashboard />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import Dashboard from './components/dashboard.vue'
export default{

        components:{
            Navbar,
            Sidebar,
            Dashboard
        },
        data(){
            return{
                isSidebarOpen: false,
            }
        },
        methods:{
            handleSidebar(isSidebarOpen){
                this.isSidebarOpen = isSidebarOpen; 
            }
        }
}
</script>

