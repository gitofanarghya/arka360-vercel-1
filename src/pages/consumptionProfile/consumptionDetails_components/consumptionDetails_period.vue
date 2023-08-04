<template>
  <div class="custom-select" :tabindex="tabindex" @blur="open = false">
    <div class="selected" :class="{ open: open }" @click="open = !open">
      {{ (capitalize(selected)) }}
    </div>
    <div class="items" :class="{ selectHide: !open }">
      <div
        v-for="(option, i) of options"
        :key="i"
        @click="handleSelect(option)"
      >
        {{ (capitalize(option)) }}
      </div>
    </div>
  </div>
</template>

<script scoped>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    default: {
      type: String,
      required: false,
      default: 'MONTHLY',
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      selected: this.default
        ? this.default
        : this.options.length > 0
        ? this.options[0]
        : null,
      open: false,
    };
  },
  mounted() {
    this.$emit("input", this.selected);
  },
  methods: {
    capitalize(str) {
      return str.charAt(0) + str.slice(1).toLowerCase();
    },
    handleSelect(option) {
      this.selected = option;
      this.open = false;
      this.$emit('input', option);
      this.$emit('selectPeriod', this.selected);
    }
  }
};
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  text-align: left;
  outline: none;
  height: 47px;
  line-height: 47px;
  top: -12.5px;
}

.custom-select .selected {
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #cccccc;
  color: #222222;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
}

.custom-select .selected.open {
  border: 1px solid #cccccc;
  border-radius: 4px 4px 0px 0px;
}

.custom-select .selected:after {
  position: absolute;
  content: "";
  top: 22px;
  right: 1em;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-color: #7a7373 transparent transparent transparent;
}

.custom-select .items {
  color: #fff;
  border-radius: 0px 0px 4px 4px;
  overflow: hidden;
  border-right: 1px solid #cccccc;
  border-left: 1px solid #cccccc;
  border-bottom: 1px solid #cccccc;
  position: absolute;
  background-color: #ffffff;
  left: 0;
  right: 0;
  z-index: 1;
}

.custom-select .items div {
  color: #222222;
  padding-left: 1em;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #ccc;
}

.custom-select .items div:hover {
  background-color: #cccccc;
}

.selectHide {
  display: none;
}
</style>
