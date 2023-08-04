<!-- <template>
  <div>
    <el-button
      :type="button.type"
      :style="button.style"
      @click="handleButtonClick"
      :disabled="button.disableCondition"
    >
      {{ button.label }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: "ReusableButton",
  props: {
    button: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  methods: {
    handleButtonClick() {
      console.log("click");
      console.log(this.$props.button);
      this.$emit("click");
    },
  },
};
</script> -->
<template>
  <div>
    <template v-if="button.disableCondition">
      <el-tooltip effect="dark" placement="top">
        <div slot="content">
          {{ button.tooltip }}
        </div>
        <div>
          <el-button
            :loading="loading"
            :type="button.type"
            :class="button.className"
            :style="button.styleDisabled"
            @click="handleButtonClick"
            :disabled="button.disableCondition"
          >
            {{ button.label }}
          </el-button>
        </div>
      </el-tooltip>
    </template>
    <template v-else>
      <el-button
        :loading="loading"  
        :type="button.type"
        :class="button.className"
        :style="button.styleEnabled"
        @click="handleButtonClick"
        :disabled="button.disableCondition"
      >
        {{ button.label }}
      </el-button>
    </template>
  </div>
</template>

<script>
export default {
  name: "ReusableButton",
  props: {
    button: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    loading:{
      type: Boolean,
      default:false,
    }
  },
  methods: {
    handleButtonClick() {
      console.log("click");
      console.log(this.$props.button);
      this.$emit("click");
    },
  },
};
</script>
<style scoped>
.el-button.is-disabled {
  pointer-events: none;
}
</style>
