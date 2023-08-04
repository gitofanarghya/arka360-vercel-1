<template>
    <div id="tasks">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <Tasks />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import Tasks from "./components/tasks.vue";
export default{

        components:{
    Navbar,
    Sidebar,
    Tasks
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

