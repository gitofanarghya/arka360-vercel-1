<template>
  <div class="deleteModule">
    <el-dialog
      :visible="isLeadPermissionPopup"
      :close-on-click-modal="false"
      title="Add User"
      width="30%"
      @close="closeModal"
      append-to-body
    >
      <div class="crossIcon">
        <span @click="onClose()">&#x2716;</span>
      </div>
      <div class="containerTask">
        <p class="msg">
          The lead is not shared with {{ userName }}.
          Do you want to share the lead with this user?
        </p>
        <div class="button_container" v-if="showBtns">
          <el-button class="commonBtn noBtn" @click="$emit('cancelDelete')"
            >No</el-button
          >
          <el-button
            class="commonBtn yesBtn"
            type="primary"
            @click="showBtns = false"
            >Yes</el-button
          >
        </div>
        <el-select
          v-model="value"
          placeholder="Select Permission Type"
          v-if="!showBtns"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div class="button_container shareBtnCont" v-if="value != null">
          <el-button
            class="commonBtn shareBtn"
            type="primary"
            @click="onShareTask()"
            >Share</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>
  
<script>
import API from "@/services/api/";
export default {
  props: {
    project_id: {
      type: Number,
    },
    userId: {
      type: Number,
    },
    userName: {
      type: String,
    },
    isLeadPermissionPopup: {
      type: Boolean,
      default: false,
    },
    projectIdTobeDeleted: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      options: [
        {
          value: "view",
          label: "View",
        },
        {
          value: "change",
          label: "Edit",
        },
      ],
      value: null,
      showBtns: true,
      showShareBtn: false,
    };
  },
  mounted() {
    this.$mousetrap.bind("enter", () => {
      this.$emit("confirmDelete");
    });
  },
  methods: {
    onClose() {
      this.$emit("close", false);
    },
    onCloseAfterShare() {
      this.$emit("closeAfterShare");
    },
    closeModal() {
      this.$emit("cancelDelete");
    },
    async onShareTask() {
      const payload = {
        new_users: [
          {
            email: this.userId,
            permission: this.value,
          },
        ],
      };
      await API.PROJECTS.POST_PROJECT_PERMISSIONS(this.project_id, payload);
      this.onCloseAfterShare();
    },
  },
};
</script>
  
<style scoped>
.crossIcon {
    cursor: pointer;
    display: flex;
    flex-direction: row-reverse;
}
.el-dialog__wrapper >>> .el-dialog {
  border-radius: 8px;
  margin-top: 20vh !important;
  width: 80vw;
  max-width: 400px;
  min-height: 212px;
}

.el-dialog__wrapper >>> .el-dialog__header {
  display: none;
}

.el-dialog__wrapper >>> .el-input__inner {
  color: #000;
  border: 1px solid #999;
  font-size: 16px;
}

.el-dialog__wrapper >>> .el-input__inner::placeholder {
  color: #000;
}

.el-dialog__wrapper >>> .el-select .el-input .el-select__caret {
  color: #999;
  font-size: 18px;
  font-weight: bold;
}

.containerTask {
  display: grid;
  padding: 32px 24px;
  place-items: center;
  text-align: center;
}

.msg {
  font-size: 16px;
  color: #000;
  line-height: 1.5;
  max-width: 325px;
  margin-bottom: 32px;
  word-break: break-word;
}

.button_container {
  display: flex;
  gap: 16px;
}

.shareBtnCont {
  margin-top: 32px;
}

.commonBtn {
  font-size: 16px;
  font-weight: bold;
  height: 40px;
  width: 91px;
}

.noBtn {
  color: #000;
  border: 1px solid #999;
}

.shareBtn {
  width: 109px;
}
</style>
  