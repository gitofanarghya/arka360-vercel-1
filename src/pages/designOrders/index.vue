<template>
  <div id="orders">
    <DesignOrderPageContent />
  </div>
</template>

<script>
import DesignOrderPageContent from "./components/designOrderPageContent.vue";
export default {
  components: {
    DesignOrderPageContent,
  },
  data() {
    return {
      isSidebarOpen: false,
    };
  },
};
</script>

<style scoped>
#orders {
  height: 100%;
  overflow: hidden;
}
</style>
