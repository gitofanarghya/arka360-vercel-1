<template>
  <div class="card-header">
    {{ heading }}
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "CardHeader",
  props: ["heading"],
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /*/* font-family: "Switzer";*/
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.5rem;
  border-bottom: 1px solid #cccccc;
  border-radius: 8px 8px 0px 0px;
  color: #222222;
  padding: 16px;
  /*height: 3.875rem;*/
  height: fit-content;
}
h3 {
  font-style: none;
}
</style>
