<template>
  <div class="tableTypeCont">
    <div
      :class="['tableOpt', !isTableOptClicked ? 'activeClass' : '']"
      @click="handleNonList"
    >
      <img
        :src="!isTableOptClicked ? kanbanActiveIcon : kanbanNotActiveIcon"
        class="typeIcon"
      />
      <!-- <img
        src="../../../leadManagement/components/assets/SolarLabs 360-5 1.svg"
        class="typeIcon"
      /> -->
    </div>
    <div
      :class="['cardOpt', isTableOptClicked ? 'activeClass' : '']"
      @click="handleList"
    >
      <img
        :src="isTableOptClicked ? tableActiveIcon : tableNotactiveIcon"
        class="typeIcon"
      />
      <!-- <img
        src="../../../leadManagement/components/assets/SolarLabs 360-6 1.svg"
        class="typeIcon"
      /> -->
    </div>
  </div>
</template>

<script>
import kanbanActive from "../../assets/kanbanActive.svg";
import kanbanNotActive from "../../assets/kanbanInActive.svg";
import tableActive from "../../assets/tableActive.svg";
import tableNotactive from "../../assets/tableInActive.svg";
export default {
  data() {
    return {
      isTableOptClicked: false,
      kanbanActiveIcon: kanbanActive,
      kanbanNotActiveIcon: kanbanNotActive,
      tableActiveIcon: tableActive,
      tableNotactiveIcon: tableNotactive,
    };
  },
  props: {
    toggleViewType: {
      type: Function,
    },
  },
  methods: {
    handleList() {
      this.isTableOptClicked = true;
      this.$props.toggleViewType(true);
    },
    handleNonList() {
      this.isTableOptClicked = false;
      this.$props.toggleViewType(false);
    },
  },
};
</script>

<style scoped>
.tableTypeCont {
  margin-left: 1rem;
  display: flex;
  align-items: center;
}
.tableOpt,
.cardOpt {
  display: grid;
  place-items: center;
  height: 40px;
  width: 40px;
  border: solid 1.1px #999;
  cursor: pointer;
}

.tableOpt {
  border-right: none;
}
.activeClass {
  background-color: #1c3366;
}
</style>
