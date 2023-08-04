<template>
  <div class="my-card" :class="'my-card-' + color">
    <span class="my-card-dot"></span>   
      <slot></slot>
 
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "teal"
    }
  }
};
</script>

<style scoped>
.my-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 24px;
  border-radius: 12px;
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
  background-color: #E6FFFA;
}

.my-card-teal .my-card-dot {
  background-color: #2DCCA7;
}

.my-card-blue {
  background-color: #EBF8FF;
}

.my-card-blue .my-card-dot {
  background-color: #3182CE;
}

  /* Use Tailwind CSS styles here */
</style>
