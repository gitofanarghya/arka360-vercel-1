<template>
    <div>
        <Navbar @handleToggleSideBar="handleSidebar"/>
        <Sidebar :isSidebarOpen="isSidebarOpen"/>
        <CreditTransactionHistory />
    </div>
</template>

<script>
import Navbar from '@/components/ui/newNavbar.vue'
import Sidebar from '@/components/ui/sidebar.vue'
import CreditTransactionHistory from './components/creditTransactionHistory.vue'

export default {
    components: {
        Navbar,
        Sidebar,
        CreditTransactionHistory
    },

    data() {
        return {
            isSidebarOpen: false,
        }
    },
    methods: {
        handleSidebar(isSidebarOpen) {
            this.isSidebarOpen = isSidebarOpen; 
        },
    }
}
</script>