<template>
  <div class="card-body">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "CardBody",
};
</script>

<style scoped>
.card-body {
  padding: 20px;
}
</style>
