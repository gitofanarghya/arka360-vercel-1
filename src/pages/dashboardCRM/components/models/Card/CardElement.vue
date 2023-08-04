<template>
  <div class="card">
    <CardHeader :heading="headingText" v-if="hasHeader">
      <slot name="header"></slot>
    </CardHeader>

    <CardBody>
      <slot name="body"></slot>
    </CardBody>
  </div>
</template>

<script>
import CardHeader from "./CardHeader.vue";
import CardBody from "./CardBody.vue";

export default {
  name: "CardElement",
  components: {
    CardHeader,
    CardBody,
  },
  props: {
    headingText: {
      type: String,
      default: "",
    },
  },
  computed: {
    hasHeader() {
      return !!this.$slots.header;
    },
  },
};
</script>

<style>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px; /* 5px rounded corners */
  width: 100%;
  /* height: 100vh; */
  /*padding: 30px;*/
}
</style>
