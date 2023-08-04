<template>
  <div class="container">
    <P>Role Management</P>
  </div>
</template>


<script>

export default {
 
  data() {
    return {
  }
  }
};

</script>


<style scoped>
@media (min-width: 1281px) {
  .container {
    width: calc(100% - 260px);
    margin-left: auto;
    padding: 24px 64px;
    background-color: #e8edf2;
    height: 95vh;
  }
}

@media (max-width: 1280px) {
  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}

@media (max-width: 650px) {
  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}
</style>