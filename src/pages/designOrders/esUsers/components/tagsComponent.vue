<template>
  <div>
    <div v-if="title">
      <p class="title">{{ title }}</p>
    </div>
    <div class="container">
      <el-tag
        :key="tag.id"
        :size="tagSize"
        v-for="tag in selectedTags"
        :closable="editable"
        :disable-transitions="false"
        @close="handleClose(tag)"
      >
        {{ tag.name }}
      </el-tag>
      <div v-if="editable">
        <el-select
          v-if="inputVisible"
          v-model="selectedTag"
          ref="saveTagSelect"
          size="mini"
          @change="handleInputConfirm"
          class="select"
        >
          <el-option
            v-for="tag in filteredTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag"
          ></el-option>
        </el-select>
        <el-button v-else class="button-new-tag" size="small" @click="showInput"
          >+ New {{ title }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    availableTags: {
      required: true,
      type: Array,
    },
    selectedTags: {
      required: true,
      type: Array,
    },
    handleUpdate: {
      required: true,
      type: Function,
    },
    title: {
      type: String,
    },
    editable: {
      required: true,
      type: Boolean,
    },
    tagSize:{
      type: String,
      default: "medium",
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: "",
      selectedTag: null,
    };
  },
  computed: {
    filteredTags() {
      return this.availableTags.filter(
        (tag) =>
          !this.selectedTags.some((selectedTag) => selectedTag.id === tag.id)
      );
    },
  },
  methods: {
    handleClose(tag) {
      this.$emit(
        "update:selectedTags",
        this.selectedTags.filter((selectedTag) => selectedTag.id !== tag.id)
      );
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        const selectInput =
          this.$refs.saveTagSelect.$refs.reference.$el.querySelector(
            ".el-input__inner"
          );
        selectInput.focus();
        this.$refs.saveTagSelect.visible = true;
      });
    },
    handleInputConfirm() {
      if (this.selectedTag) {
        this.$emit("update:selectedTags", [
          ...this.selectedTags,
          this.selectedTag,
        ]);
      }
      this.inputVisible = false;
      this.selectedTag = null;
      // this.$props.handleUpdate(this.selectedTags);
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0.5rem 0;
}

.el-tag + .el-tag {
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  vertical-align: bottom;
}

.select {
  margin-left: 10px;
  max-width: 100px;
}

.title {
  margin-top: 5px;
  margin-bottom: 5px;
  /*font-size: 1.2rem;*/
  font-size: 14px;
  color: #777777;
}
div >>> .select[data-v-0aeb7c98]{
  margin: 0 !important;
}
</style>
