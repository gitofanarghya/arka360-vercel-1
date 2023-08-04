<template>
    <div id="roleManagement">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <RoleManagement />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import RoleManagement from "./components/roleManagement.vue";
export default{

        components:{
    Navbar,
    Sidebar,
    RoleManagement
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

