<template>
  <section v-loading.fullscreen.lock="false">
    <div class="content_section_table">
      <div class="">
        <!-- remove hidden attr for show content -->
        <div class="table_scroll">
          <div class="container-body" id="table">
            <el-table
              v-if="screenSize >= 1200"
              v-model="selectedRow"
              :data="data"
              row-key="id"
              width="100%"
              @row-click="selectRow"
            >
              <el-table-column
                v-for="column in headers"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
              >
              </el-table-column>
              <el-table-column
                v-if="buttonsData"
                width="180"
                :label="'Actions'"
              >
                <template slot-scope="scope">
                  <span
                    v-for="(btn, btnindex) in buttonsData"
                    :key="btnindex"
                    class="btn_container"
                  >
                    <el-tooltip
                      v-if="
                        (scope.row.design && btn.exist === 'desgin') ||
                        (scope.row.additional_info?.path &&
                          btn.exist === 'survey') ||
                        btn.exist === 'dialog'
                      "
                      :content="btn.tooltipContent"
                      placement="top"
                    >
                      <el-button
                        :type="btn.type"
                        :icon="btn.icon"
                        :size="btn.size"
                        @click.native.stop="btn.callback(scope.row)"
                      ></el-button>
                      <!-- end -->
                    </el-tooltip>
                  </span>

                  <!-- <el-button size="mini">d</el-button> 
                    <el-button size="mini" type="danger">d</el-button> -->
                </template>
              </el-table-column>

              <!-- <el-table-column prop="name" label="Name" width="180"> </el-table-column>
      <el-table-column prop="address" label="Address"> </el-table-column> -->
            </el-table>

            <!-----------------------------Card View-------------------------------------->
            <el-card
              class="card-container"
              v-else
              v-for="item in data"
              :key="item.id"
              @click.native="() => selectRow(item)"
            >
              <el-row>
                <el-col
                  v-for="head in headers"
                  :key="head.prop"
                  :span="3"
                  :xs="12"
                  :sm="6"
                  class="card-col"
                >
                  <div class="label-container">{{ head.label }}</div>
                  <div class="value-container">{{ item[head.prop] }}</div>
                </el-col>
                <el-col :span="3">
                  <div class="action_btn">
                    <ul class="action_list">
                      <li
                        data-toggle="modal"
                        data-target="#design_tool"
                        v-for="(btn, btnIndex) in buttonsData"
                        :key="btnIndex"
                      >
                        <el-tooltip
                          effect="dark"
                          placement="top-start"
                          :content="btn.tooltipContent"
                        >
                          <!-- RKChange2 +comment-->
                          <!-- <button class="btn" @click="handleDesign(scope.row)">
                              <span class="icon edit-alt"></span>
                            </button> -->
                          <el-button
                            :type="btn.type"
                            :icon="btn.icon"
                            :size="btn.size"
                            @click="btn.callback(item)"
                          ></el-button>
                          <!-- end -->
                        </el-tooltip>
                        <!-- <div class="act_text">Edit Site Survey</div> -->
                      </li>
                    </ul>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      selectedRow: "",
      screenSize: "",
    };
  },
  props: {
    headers: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    handleOrderClick: {
      type: Function,
      required: true,
    },
    buttonsData: {
      type: Array,
    },
  },
  methods: {
    selectRow(row) {
      console.log(row);
      this.selectedRow = row;
      this.$props.handleOrderClick(true);

      this.$emit("update:order", row);
    },
    handleResize() {
      const screenWidth = window.innerWidth;
      let screenSize;
      if (screenWidth <= 768) {
        screenSize = "xs";
      } else if (screenWidth <= 992) {
        screenSize = "sm";
      } else if (screenWidth <= 1200) {
        screenSize = "md";
      } else {
        screenSize = "lg";
      }
      this.screenSize = screenWidth;
    },
    handleBtnClick(action) {
      console.log(action);
    },
  },
  components: {},
  mounted() {
    console.log(this.$props.buttonsData);
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
};
</script>

<style scoped>
.content_section_table{
  margin-top: 1rem;
}
#table >>> .el-table th.el-table__cell {
  background: #e8edf2 !important;
}
.table_section {
  overflow-x: auto;
  height: 33rem;
  border-radius: 10px;
}
.el-table {
  /* background: #e8edf2 !important; */
  border: 1px solid #ccc;
  border-radius: 12px;
}
.container {
  max-width: 100%;
  margin-left: 2rem;
  margin-top: 2rem;
  background: var(--step-50);
  overflow-x: auto;
  /* max-height: 80vh; */
  overflow-y: hidden;
  scrollbar-width: none;
}
.btn {
  margin-left: 8px;
}

li {
  margin-left: 8px;
}

.action_list {
  display: flex;
}
.edit-alt {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  align-content: center;
}
.card-container {
  margin-bottom: 1rem;
  /* display: flex;
      flex-wrap: wrap; */
  padding: 24px 32px 24px 24px;
  position: relative;
  background: var(--white);
  border: 1px solid var(--step-100);
  border-radius: 4px;
}

.card-col {
  padding-bottom: 10px;
}
.container-body {
  /* height: 30rem; */
}
.btn_container {
  padding-left: 0.5rem;
}
</style>
