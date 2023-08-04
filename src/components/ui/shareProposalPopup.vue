<template>
  <div id="parentContainer" v-loading.fullscreen="isLoading">
    <el-dialog
      :visible="isShareProposalPopupVisible"
      :close-on-click-modal="true"
      title="Share Proposal"
      @close="onDialogClose"
      append-to-body
    >
      <div :class="project.designs.length > 0 ? 'container' : 'noDesignCont'">
        <div class="backOne" v-if="project.designs.length > 0">
          <div class="table_section table_normal">
            <table class="data_table">
              <thead class="headerSticky">
                <tr>
                  <th>
                    <div class="data_head">
                      <p class="headerTitle">Name</p>
                    </div>
                  </th>
                  <th>
                    <div class="data_head">
                      <p class="headerTitle">System Size</p>
                    </div>
                  </th>
                  <th>
                    <div class="data_head">
                      <p class="headerTitle">Last Modified</p>
                    </div>
                  </th>
                  <th>
                    <div class="data_head">
                      <p class="headerTitle">Action</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="tr" v-for="design in project.designs" :key="design.id">
                  <td>
                    <div class="md_head">Name</div>
                    <div class="value_type">{{ design.name }}</div>
                  </td>
                  <td>
                    <div class="md_head">System Size</div>
                    <div class="commonVal">
                      {{
                        design.versions.summary.nameplate_dc_size
                          ? design.versions.summary.nameplate_dc_size + " kW"
                          : "—"
                      }}
                    </div>
                  </td>
                  <td class="orderOn">
                    <div class="md_head">Last Modified</div>
                    <div class="value_type">
                      <p class="commonVal">
                        {{ dateFormat(design.versions.modified_at) }}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="md_head">Actions</div>
                    <div class="value_type pName">
                      <ProposalButtons :design="design" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- <div v-observe-visibility="loadMoreRequests" style="text-align: center">
                            <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
                        </div> -->
          </div>
        </div>
        <p class="noDesign" v-else>No designs</p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import API from "@/services/api";
import ProposalButtons from "../../pages/designSummaryCRM/components/ProposalButtons.vue";
import { isWebProposalDisabled, isDocProposalDisabled } from "@/utils.js";
import { mapActions, mapState } from "pinia"
import { useProjectStore } from "../../stores/project"
export default {
  name: "previousProposalRequests",
  components: {
    ProposalButtons,
  },
  props: {
    isShareProposalPopupVisible: {
      type: Boolean,
      default: false,
    },
    lead: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },

  created() {
    this.sendDataToState();
  },

  computed: {
    ...mapState(useProjectStore, {
      project: state => state
    })
  },

  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),

    onDialogClose() {
      this.$emit("update:isShareProposalPopupVisible", false);
    },

    async sendDataToState() {
      try {
          await this.GET_CURRENT_PROJECT(this.lead.id);
        } catch (err) {
        this.$message({
          showClose: true,
          message: 'Error in loading lead. Please try again.',
          type: 'error',
          center: true
        });
      };
    },

    dateFormat(val) {
      if (val) {
        const dateObj = new Date(val);
        const month = ("0" + (dateObj.getUTCMonth() + 1)).slice(-2);
        const day = ("0" + dateObj.getUTCDate()).slice(-2);
        const year = dateObj.getUTCFullYear();
        const formattedDate = `${month}-${day}-${year}`;
        return formattedDate;
      } else {
        return "—";
      }
    },

    openWebProposalPage(referenceId) {
      let routeData = this.$router.resolve({
        name: "webProposal",
        params: { designUUID: referenceId },
      });
      window.open(routeData.href, "_blank");
    },

    openDocProposalPage(designId) {
      let routeData = this.$router.resolve({
        name: "documentProposal",
        params: { designId: designId },
      });
      window.open(routeData.href, "_blank");
    },

    ThreedLinkPage(referenceId) {
      let routeData = this.$router.resolve({
        name: "DesignOverview",
        params: { designUUID: referenceId },
      });
      window.open(routeData.href, "_blank");
    },
  },
};
</script>

<style scoped>
.el-dialog__wrapper >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

.el-dialog__wrapper >>> .el-dialog__title {
  width: 257px;
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
  margin-left: 10px;
  color: #222222 !important;
}

.el-dialog__wrapper >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.el-dialog__wrapper >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 2vh !important;
  width: 700px !important;
}

.noDesignCont {
  display: grid;
  place-items: center;
  height: 200px;
}

.noDesign {
  font-size: 16px;
  font-weight: bold;
  color: #222;
}

.table_normal {
  height: 50vh !important;
  max-height: 400px;
}

.table_section table thead tr:first-child th:first-child {
  border-top-left-radius: 0px;
}

.value_type {
  font-size: 16px;
  color: #222;
  line-height: 1.2;
  display: flex;
  gap: 8px;
}

.commonVal {
  font-size: 14px;
  color: #222;
}

.el-dialog__wrapper >>> .el-dialog__body {
  padding: 0px !important;
}

.el-dialog__wrapper >>> .el-button--primary.is-disabled {
  background-image: linear-gradient(to bottom, #ddd, #ccc);
  color: #fff;
  cursor: not-allowed;
  border: none;
}

.data_head {
  text-transform: capitalize;
  color: #777;
}

.md_head {
  text-transform: capitalize !important;
  color: #777 !important;
}

.headerTitle {
  font-size: 14px;
  font-weight: 600;
  color: #777;
}

img.Group-2096 {
  object-fit: contain;
}

.headerSticky {
  position: sticky !important;
  top: 0px !important;
  z-index: 1 !important;
}

.backOne {
  padding: 4px 16px 16px 16px;
  min-height: 400px;
}

.incompleteCursor {
  cursor: normal;
}

.commonBtn {
  font-size: 12px;
  height: 28px;
  padding: 0px 10px;
}

.table_section.table_normal table tbody tr td {
  border: none;
}

.table_section.table_normal table td {
  padding: 16px 12px;
}

.table_section.table_normal table td:first-child,
.table_section.table_normal table th:first-child {
  padding-left: 0px;
}

.table_section.table_normal table td:last-child,
.table_section.table_normal table th:last-child {
  padding-right: 0px;
}

@media (max-width: 1200px) {
  .backOne {
    padding-top: 24px;
  }

  .table_section table tbody {
    padding: 0px 8px !important;
  }

  .md_head {
    text-transform: capitalize !important;
    color: #777 !important;
  }

  .table_section table tbody tr td .value_type,
  .table_section table tbody tr td .date {
    margin-top: 4px;
    display: block;
    padding-left: 0px !important;
  }
}

@media (max-width: 1200px) {
  .table_normal {
    height: calc(100vh - 320px) !important;
  }

  .md_head {
    text-transform: capitalize !important;
    color: #777 !important;
  }

  .table_section.table_normal table tbody tr td {
    width: initial !important;
    flex-grow: 1 !important;
  }

  .table_section.table_normal table tbody tr .smallScr {
    width: 100% !important;
  }

  .table_section.table_normal table tbody tr .orderOn {
    margin-left: 92px !important;
  }
}

@media (max-width: 791px) {
  .el-dialog__wrapper >>> .el-dialog {
    width: 85vw !important;
  }

  .table_section.table_normal table td:first-child,
  .table_section.table_normal table th:first-child {
    padding-left: 12px;
  }

  .table_section.table_normal table tbody tr td {
    width: 50% !important;
    flex-grow: initial !important;
  }

  .md_head {
    text-transform: capitalize !important;
    color: #777 !important;
  }

  .table_section.table_normal table tbody tr .orderOn {
    margin-left: 0px !important;
  }

  .table_section table tbody tr {
    padding-bottom: 8px !important;
    padding-right: 0px !important;
  }
}
</style>
