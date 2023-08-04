<template>
  <div class="footerAll">
    <div class="pageNo">
      <p class="pgNo">{{ pageNo }}</p>
    </div>
    <div class="powByCont">
      <p class="powBy">
        Powered by <span class="boldTxt">{{ companyName }}</span>
      </p>
    </div>
  </div>
</template>
  
  <script>
export default {
  props: {
    pageNo: {
      type: String,
      default: null,
    },
    companyName: {
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

.footerAll {
  position: absolute;
  bottom: 0px;
  height: 52px;
  border-top: 1px solid #d2d2d7;
  width: 100%;
  padding: 0px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  right: 0px;
}

.pageNo {
  width: 40px;
  height: 52px;
  background-color: #d2d2d7;
  display: grid;
  place-items: center;
}

.pgNo {
  color: #1d1d1f;
  font-size: 12px;
  font-weight: 800;
}

.powBy {
  font-size: 16px;
}

.boldTxt {
  font-weight: 800;
}

@media (max-width: 644px) {
  .footerAll {
    padding: 0 20px;
  }
}
</style>