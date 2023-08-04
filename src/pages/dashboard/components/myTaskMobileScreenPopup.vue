<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isMyTaskMobileScreenPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 800px"
      title="Project 1"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="innrBdyCont">
          <div class="innerBodyContainer">
            <div>
              <p class="headMD">NAME</p>
              <div class="arrowDropCont">
                <img
                  src="../../../assets/drop/Group 2018.svg"
                  class="innrIcnTSK"
                />
                <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
              </div>
            </div>
            <p class="createdBy">
              <span class="headMD">CREATED BY</span>John Doe
            </p>
            <p class="strtDate">
              <span class="headMD">START DATE</span>08-24-2022
            </p>
            <p class="endDate">
              <span class="headMD">END DATE</span>08-24-2022
            </p>
            <div>
              <p class="headMD">STATUS</p>
              <el-select v-model="value" placeholder="In-progress">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="innerBodyContainer">
            <div>
              <p class="headMD">PROJECT NAME</p>
              <div class="arrowDropCont">
                <img
                  src="../../../assets/drop/Ellipse 182.svg"
                  class="innrIcnTSK"
                />
                <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
              </div>
            </div>
            <p class="createdBy">
              <span class="headMD">CREATED BY</span>John Doe
            </p>
            <p class="strtDate">
              <span class="headMD">START DATE</span>08-24-2022
            </p>
            <p class="endDate">
              <span class="headMD">END DATE</span>08-24-2022
            </p>
            <div>
              <p class="headMD">STATUS</p>
              <el-select v-model="value" placeholder="In-progress">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="innerBodyContainer">
            <div>
              <p class="headMD">PROJECT NAME</p>
              <div class="arrowDropCont">
                <img
                  src="../../../assets/drop/Group 2015.svg"
                  class="innrIcnTSK"
                />
                <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
              </div>
            </div>
            <p class="createdBy">
              <span class="headMD">CREATED BY</span>John Doe
            </p>
            <p class="strtDate">
              <span class="headMD">START DATE</span>08-24-2022
            </p>
            <p class="endDate">
              <span class="headMD">END DATE</span>08-24-2022
            </p>
            <div>
              <p class="headMD">STATUS</p>
              <el-select v-model="value" placeholder="In-progress">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="innerBodyContainer">
            <div>
              <p class="headMD">PROJECT NAME</p>
              <div class="arrowDropCont">
                <img
                  src="../../../assets/drop/Group 2016.svg"
                  class="innrIcnTSK"
                />
                <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
              </div>
            </div>
            <p class="createdBy">
              <span class="headMD">CREATED BY</span>John Doe
            </p>
            <p class="strtDate">
              <span class="headMD">START DATE</span>08-24-2022
            </p>
            <p class="endDate">
              <span class="headMD">END DATE</span>08-24-2022
            </p>
            <div>
              <p class="headMD">STATUS</p>
              <el-select v-model="value" placeholder="In-progress">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="innerBodyContainer">
            <div>
              <p class="headMD">PROJECT NAME</p>
              <div class="arrowDropCont">
                <img
                  src="../../../assets/drop/Group 2018.svg"
                  class="innrIcnTSK"
                />
                <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
              </div>
            </div>
            <p class="createdBy">
              <span class="headMD">CREATED BY</span>John Doe
            </p>
            <p class="strtDate">
              <span class="headMD">START DATE</span>08-24-2022
            </p>
            <p class="endDate">
              <span class="headMD">END DATE</span>08-24-2022
            </p>
            <div>
              <p class="headMD">STATUS</p>
              <el-select v-model="value" placeholder="In-progress">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </div>

        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "myTaskMobileScreenPopup",

  props: {
    isMyTaskMobileScreenPopupVisible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {};
  },

  methods: {
    onDialogClose() {
      this.$emit("update:isMyTaskMobileScreenPopupVisible", false);
    },
  },
};
</script>

<style scoped>
#parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#parentContainer >>> .el-dialog__title {
  /* width: 157px; */
  /* height: 19px; */
  /* margin: 3px 892px 2px 0; */
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  /* font-weight: 600; */
  font-size: 18px;
  margin-left: 10px;
  color: #222222 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 14vh !important;
  display: none;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
}

@media (max-width: 650px) {
  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
    display: inherit;
    margin-top: 2vh !important;
  }

  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    top: -15vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  .container {
    max-height: 77vh;
    overflow: hidden;
    overflow-y: scroll;
    margin-bottom: 24px;
  }

  .innerBodyContainer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-start;
    border-bottom: 1px solid #ccc;
    grid-gap: 16px;
    padding: 24px 24px 16px 24px;
  }

  #parentContainer >>> .el-input__inner {
    background-color: #fff;
    border: none;
    font-size: 14px;
    color: #222;
    width: 100%;
    padding-left: 0px;
    height: 16px;
  }

  #parentContainer >>> .el-input__icon {
    height: auto;
    margin-top: -13px;
  }

  .createdBy,
  .strtDate,
  .endDate {
    font-size: 14px;
    color: #222;
    word-break: break-word;
    margin-bottom: 8px;
  }

  .projectNoInnr {
    font-size: 14px;
    color: #222;
    font-weight: 500;
  }

  .arrowDropCont {
    display: flex;
    align-items: flex-start;
  }

  .innrIcnTSK {
    margin-right: 6px;
  }

  .headMD {
    display: block;
    color: #1c3366;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}
</style>