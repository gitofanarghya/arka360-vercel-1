<template>
    <div id="leadManagement">
        <Navbar @handleToggleSideBar="handleSidebar" />
        <Sidebar :isSidebarOpen="isSidebarOpen" />
        <DesignSummaryCRM />
    </div>
</template>

<script>
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import DesignSummaryCRM from "./components/designSummaryCRM.vue";
export default {

    components: {
        Navbar,
        Sidebar,
        DesignSummaryCRM
    },
    data() {
        return {
            isSidebarOpen: false,
        }
    },
    methods: {
        handleSidebar(isSidebarOpen) {
            this.isSidebarOpen = isSidebarOpen;
        }
    }
}
</script>

