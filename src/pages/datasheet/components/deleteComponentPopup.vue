<template>
    <div class="parentContainer">
      <el-dialog
        :visible="isDeleteComponentPopup"
        :close-on-click-modal="false"
        title="Add User"
        width="472px"
        class="delete_module"
        @close="closeModal"
      >
        <div class="close_button">
          <img
            src="../assets/img/Group 166.svg"
            alt="close"
            @click="$emit('cancelDelete')"
          />
        </div>
        <div class="alert">
          <img
            src="../assets/img/alert (1).svg"
            alt="alert"
            class="warningImage"
          />
        </div>
        <p class="msg">Are you sure you want to delete this component?</p>
        <div class="button_container">
          <el-button id="delete-btn" type="primary" @click="$emit('confirmDelete')"
            >Yes</el-button
          >
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
      };
    },
    props: {
        isDeleteComponentPopup: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      deleteModal() {
        this.$emit('confirmDelete')
      },
      closeModal() {
        this.$emit("cancelDelete");
      },
    },
    watch: {
      isDeleteComponentPopup: {
        deep: true,
        handler(value) {
            if (value) {
              this.$mousetrap.bind('enter', () => {
                  document.getElementById("delete-btn").click();
              });
            } else {
              this.$mousetrap.unbind('enter');
            }
        },
      }
    },
  };
  </script>
  
  <style scoped>
  .parentContainer .delete_module >>> .el-dialog {
    border-radius: 16px;
    margin-top: 14vh !important;
    width: 472px !important;
  }
  .parentContainer .delete_module >>> .el-dialog__header {
    display: none;
  }
  .parentContainer .delete_module .alert {
    margin: 16px 0px 30px 0px;
  }
  .parentContainer .delete_module .alert,
  .parentContainer .delete_module .msg,
  .parentContainer .delete_module .button_container {
    display: flex;
    justify-content: center;
  }
  .parentContainer .delete_module .close_button {
    display: flex;
    justify-content: flex-end;
    padding: 10px 5px 0 0;
    cursor: pointer;
  }
  
  .msg {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    text-align: center;
    color: #222;
    word-break: break-word;
    margin-bottom: 12px;
  }
  
  .parentContainer .delete_module >>> .el-button {
    font-size: 18px;
    font-weight: 600;
    width: 120px;
    margin-bottom: 48px;
    margin-top: 24px;
  }
  
  @media (max-width: 650px) {
    .parentContainer .delete_module >>> .el-dialog {
      margin-top: 0vh !important;
      width: 90vw !important;
    }
  
    .parentContainer .delete_module .alert {
      margin: 8px 0px 16px 0px;
    }
  
    .msg {
      font-size: 14px;
      margin-bottom: 8px;
    }
  
    .parentContainer .delete_module >>> .el-button {
      font-size: 16px;
      width: 100px;
      margin-bottom: 24px;
      margin-top: 16px;
    }
  }
  </style>