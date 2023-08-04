<!-- <template>
  <div id="draw">
    <el-drawer
      :title="title"
      :visible="isOpen"
      :size="drawerSize"
      :append-to-body="true"
      :show-close="true"
      :direction="drawerDirection"
      :before-close="handleCloseDialog"
      :with-header="title ? true : false"
    >
      <div class="drawer">
        <slot name="header"></slot>
        <slot name="body"></slot>
        <slot name="footer"></slot>
        <div class="pinned-footer">
          <slot name="pinned-footer"></slot>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    isOpen: {
      default: true,
      type: Boolean,
    },
    drawerSize: {
      type: Number,
      default: 700,
    },
    title: {
      type: String,
      default: "Title",
    },
    handleCloseDialog: {
      type: Function,
      required: true,
    },
    drawerDirection: {
      type: String,
      default: "rtl",
    },
  },
  components: {},
  methods: {
    // onSave() {
    //     this.$emit("save", false);
    // },
  },
};
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer {
  height: 100%;
  position: relative;
  /* Other styles for the drawer */
}

.pinned-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Other styles for the pinned div */
}
/*#draw::v-deep .el-drawer__header*/
::v-deep .el-drawer__header {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0;
  color: #222222;
}
</style> -->

<template>
  <div id="draw">
    <el-drawer
      :title="title"
      :visible="isOpen"
      :size="computedDrawerSize"
      :append-to-body="true"
      :show-close="true"
      :direction="drawerDirection"
      :before-close="handleCloseDialog"
      :with-header="title ? true : false"
    >
      <div class="drawer">
        <slot name="header"></slot>
        <slot name="body"></slot>
        <slot name="footer"></slot>
        <div class="pinned-footer">
          <slot name="pinned-footer"></slot>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useMiscStore } from "../../../stores/misc";
export default {
  data() {
    return {};
  },
  props: {
    isOpen: {
      default: true,
      type: Boolean,
    },
    drawerSize: {
      type: [Number, String],
      default: 700,
    },
    title: {
      type: String,
      default: "Title",
    },
    handleCloseDialog: {
      type: Function,
      required: true,
    },
    drawerDirection: {
      type: String,
      default: "rtl",
    },
    title: {
      type: String,
      default: "rtl",
    },
  },
  computed: {
    computedDrawerSize() {
      if (this.isMobileScreen) {
        console.log("mobile");
        return "100vw";
      } else {
        console.log("general");
        return this.drawerSize;
      }
    },
    isMobileScreen() {
      console.log(window.innerWidth < 768);
      return window.innerWidth < 768;
    },
  },
  mounted() {
    if(this.isOpen){
      this.setDrawerState("globalDrawer", true);
    }
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  destroyed() {
    this.setDrawerState("globalDrawer", false);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    ...mapActions(useMiscStore, {
      setDrawerState: "SET_DRAWER_STATE",
    }),
    handleResize() {
      this.$forceUpdate();
    },
  },
  watch: {
    isOpen(isOpenDrawer) {
      if (isOpenDrawer) {
        this.setDrawerState("globalDrawer", true);
      } else {
        this.setDrawerState("globalDrawer", false);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer {
  height: 100%;
  position: relative;
  /* Other styles for the drawer */
}

.pinned-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* Other styles for the pinned div */
}

::v-deep .el-drawer__header {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0;
  color: #222222;
  margin-bottom: 0.5rem;
  padding: 1rem 1rem 0rem 1rem;
}

::v-deep .el-icon-close {
  font-size: 16px;
  font-weight: bolder;
}
</style>
