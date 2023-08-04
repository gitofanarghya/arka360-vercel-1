<template>
    <div id="productOrders">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <ProductOrders />
  </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import ProductOrders from "./components/productOrders.vue";
export default{

        components:{
    Navbar,
    Sidebar,
    ProductOrders
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

