<template>
  <div class="headerAll">
    <h2 class="headingAll">{{heading}}</h2>
  </div>
</template>

<script>
export default {
  props: {
    heading: {
      type: String,
      default: "",
    },
  },

  data() {
    return {};
  },
};
</script>

<style scoped>
.headerAll {
  padding: 15px 30px;
  background-color: #f5f5f7;
  margin-top: 20px;
  font-family: "Lato";
}

.headingAll {
  font-size: 24px;
  font-weight: 800;
  color: #1d1d1f;
  font-family: "Lato";
}

@media (max-width: 644px) {
  .headerAll {
    padding: 15px 20px;
  }

  .headingAll {
    font-size: 20px;
  }
}
</style>