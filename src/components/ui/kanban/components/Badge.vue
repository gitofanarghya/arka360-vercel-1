<template>
  <div class="my-card" :class="'my-card-' + color">
    <!-- <span class="my-card-dot"></span>    -->
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "teal",
    },
  },
};
</script>

<style scoped>
.my-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 24px;
  border-radius: 100%;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.my-card-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}

.my-card-teal {
  background-color: #e6fffa;
}

.my-card-teal .my-card-dot {
  background-color: #2dcca7;
}

.my-card-blue {
  background-color: #ebf8ff;
}

.my-card-blue .my-card-dot {
  background-color: #3182ce;
}

/* Use Tailwind CSS styles here */
</style>
