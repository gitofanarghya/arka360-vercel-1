<template>
    <div id="leadManagement">
        <GlobalPageHeader>
            <template v-slot:children>
                <TaskKanbanView />
            </template>
        </GlobalPageHeader>
    </div>
</template>
  
<script>
import GlobalPageHeader from "../../components/ui/GlobalPageHeader/globalPageHeader.vue";
import TaskKanbanView from "./components/taskKanbanView.vue";
export default {
    components: {
        GlobalPageHeader,
        TaskKanbanView,
    },
    data() {
        return {
            isSidebarOpen: false,
        };
    },
    methods: {
        handleSidebar(isSidebarOpen) {
            this.isSidebarOpen = isSidebarOpen;
        },
    },
};
</script>
  