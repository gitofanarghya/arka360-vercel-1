<template>
  <div
    :class="[
      'slide-drawer',
      $props.isOpen && 'slide-in',
      $props.isClose && 'slide-out',
    ]"
    :style="{'--to-width': $props.width}"
  >
    <slot name="body"> </slot>
  </div>
  
</template>
<script>
export default {
  name: "SlideDrawer",
  props: {
    isOpen: {
      type: Boolean,    
      default: false,
      required: true,
    },
    name: {
      type: String,
      default: "Someone",
    },
    width: {
      type: String,
      default: "80%",
    },
    isClose: {
      type: Boolean,
      default: false,
    },
    // drawerData: {
    //   type: Object,
    //   default: {},
    // },
  },
  data() {
    return {
    };
  },
  watch:{
  },
  methods: {
    // closeDrawer() {
    //   this.isClose = true;
    //   setTimeout(() => {
    //     this.$emit("closeDrawer");
    //   }, 500);
    // }, 
  },
};
</script>
<style scoped>
.slide-drawer {
  position: absolute;
  top: 0;
  right: 0;
  background-color: white;
  color: black; 
  padding: 22px 18px 42px 46px;
  border-left: 1px solid #CCCCCC;
  border-radius: 5px;
  width: 0;
  height: 100%;
  font-size: 16px !important;
  z-index: 1;
  /* overflow-y: scroll; */
}
.slide-in {
  animation: slide 0.7s linear;
  width: var(--to-width);
  opacity: 100%;
}
.slide-out {
  animation: slideOut 0.5s ease-out;
}
@keyframes slide {
  0% {
    width: 0;
    /* opacity: 0; */
    font-size: 0;
  }
  100% {
    width: var(--to-width);
    /* opacity: 100%; */
    font-size: 16px;
  }
}
@keyframes slideOut {
  0% {
    /* opacity: 100%; */
    width: var(--to-width);
    font-size: 16px;
  }
  100% {
    /* opacity: 0; */
    width: 0;
    font-size: 0;
  }
}
</style>
