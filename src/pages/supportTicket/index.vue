<template>
    <div id="supportTicket">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <SupportTicket />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import SupportTicket from "./components/supportTicket.vue";
export default{

        components:{
    Navbar,
    Sidebar,
    SupportTicket
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

