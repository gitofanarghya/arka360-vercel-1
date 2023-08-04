<template>
  <div id="container">
    <Navbar @handleToggleSideBar="handleSidebar" />
    <Sidebar :isSidebarOpen="isSidebarOpen" />
    <section class="right_section" v-loading.fullscreen.lock="isShareLoading">
      <div class="content_section">
        <PageHeading
          :active="active"
          @toggle-view="toggleView"
          :title="title"
          :togglebtn1="togglebtn1"
          :togglebtn2="togglebtn2"
          @filterView="filterView"
          @selected-column="handleColumnType"
          @handlefilterView="handlefilterView"
          @removeFilter="removeFilter"
          @sortView="sortView"
          @customDate="customDate"
          @customDueDate="customDueDate"
          @columnType="columnType"
          @removeSort="removeSort"
          @search="handleSearch"
          @refresh-data="handleRefresh"
        />
        <slot name="children"></slot>
      </div>
    </section>
  </div>
</template>

<script>
import Navbar from "../../../components/ui/newNavbar.vue";
import Sidebar from "../../../components/ui/sidebar.vue";
import PageHeading from "./pageHeading.vue";

export default {
  components: {
    Navbar,
    Sidebar,
    PageHeading,
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
      required: true,
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
    handleRefresh() {
      console.log("sdahghs");
      this.$emit("refresh");
    },
    handleSidebar(isSidebarOpen) {
      this.isSidebarOpen = isSidebarOpen;
    },
    handleColumnType(value) {
      console.log(value);
      this.$emit("selected-column", value);
    },
    filterView(value) {
      console.log(value);
      this.$emit("filterView", value);
    },
    handlefilterView(value) {
      console.log(value);
      this.$emit("handlefilterView", value);
    },
    removeFilter(value) {
      console.log(value);
      this.$emit("removeFilter", value);
    },
    removeSort(value) {
      console.log(value);
      this.$emit("removeSort", value);
    },
    customDate(value) {
      console.log(value);
      this.$emit("customDate", value);
    },
    customDueDate(value) {
      console.log(value);
      this.$emit("customDueDate", value);
    },
    sortView(value) {
      console.log(value);
      this.$emit("sortView", value);
    },
    columnType(type) {
      console.log("columnType", type);
      this.$emit("columnType", type);
    },
    toggleView(active) {
      this.$emit("toggle", active);
      console.log(active);
    },
    handleSearch(data) {
      this.$emit("search", data);
    },
  },
};
</script>

<style scoped>
.container {
  overflow: hidden;
}
.right_section {
  background: var(--step-50);
  /* width: calc(100% - 74px) !important; */
}
.content_section {
  padding: 32px;
  min-height: calc(100vh - 100px);
}

@media (min-width: 1281px) {
  .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}
</style>
