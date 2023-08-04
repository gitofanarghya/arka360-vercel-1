<template>
  <div id="container">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <Sidebar :isSidebarOpen="isSidebarOpen" />
    <section
      :class="['right_section', isCrmUser() ? 'containerCRM' : '']"
      v-loading.fullscreen.lock="isShareLoading"
    >
      <div class="content_section">
        <!-- <PageHeading
            :active="active"
            @toggle-view="toggleView"
            :title="title"
            :togglebtn1="togglebtn1"
            :togglebtn2="togglebtn2"
          /> -->
        <slot name="children"></slot>
      </div>
    </section>
  </div>
</template>

<script>
import Navbar from "../newNavbar.vue";
import Sidebar from "../sidebar.vue";
import { isCrmUser } from "../../../utils";
export default {
  components: {
    Navbar,
    Sidebar,
  },
  data() {
    return {
      isSidebarOpen: false,
      isShareLoading: false,
    };
  },
  props: {
    title: {
      type: String,
    },
    togglebtn1: {
      type: String,
    },
    togglebtn2: {
      type: String,
    },
    active: {
      type: Boolean,
    },
  },
  methods: {
    isCrmUser,
    isCrmUsercheck() {
      return isCrmUser();
    },
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    toggleView(active) {
      this.$emit("toggle", active);
    },
  },
};
</script>

<style scoped>
#container {
  max-height: 100vh !important;
  overflow: hidden;
}

.right_section {
  background: var(--step-50);
}

.content_section {
  padding: 4px;
  min-height: calc(100vh - 100px);
}

@media (min-width: 1281px) {
  .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }

  .containerCRM {
    width: calc(100% - 74px);
  }
}
@media screen and (max-width: 768px) {
  .content_section {
    padding: 0;
  }
}
</style>
