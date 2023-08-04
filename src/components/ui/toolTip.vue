<template>
  <div class="tooltipCommon">
    <div class="tooltipContainer tooltipConditionStudio">
      <p class="tooltipText">View Tasks</p>
    </div>
    <p>dhasd</p>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.tooltipContainer {
  width: max-content;
  background-color: #fff;
  position: absolute;
  z-index: 100;
  margin-bottom: 10rem;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  display: none;
}

.tooltipText {
  font-size: 12px;
  color: #222;
}
.tooltipCommon:hover .tooltipContainer {
  display: inherit;
}
</style>
