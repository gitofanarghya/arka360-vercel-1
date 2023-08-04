
<template>
  <!-- unused     
  
  -->
  <div>
    <!-- Exceed dialog -->
    <!-- <el-dialog :visible="openExceedDialog" :close-on-click-modal="false" :show-close="true" style="min-width: 800px"
      :title="'Warning'" width="90%" :before-close="toggleExceedDialogModeState">
      <h3 style="padding:2rem" class="containerHeading">Only {{ limit }} file(s) can be uploaded</h3>
    </el-dialog> -->

    <el-upload class="upload-demo" drag :on-preview="handlePreview" :on-remove="handleRemove" :onChange="handleOnChange"
      :before-upload="handleBeforeUpload" action="" :before-remove="handleBeforeRemove" :on-success="handleSuccess"
      :on-progress="handleOnProgress" :submit="handleOnSubmitFinal" :on-error="handleOnError"
      :http-request="handleHttpReq" :on-exceed="handleOnExceed" :file-list="fileList" multiple :show-file-list=true
      thumbnail-mode :limit="limit" :accept="permittedFileTypes" ref="uploader">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      <div class="el-upload__tip" slot="tip">Maximum {{ limit }} files which are of the following formats {{
        permittedFileTypes }}, with a size less than 500kb </div>
    </el-upload>
    <el-row type="flex" class="row-bg" justify="end">
      <el-button type="primary" @click="handleUploadFiles">Save</el-button>

    </el-row>

  </div>
</template>

<script>
export default {
  //props - limit,submit,file types
  props: {
    limit: Number,
    permittedFileTypes: String,
    handleUpload: Function
  },
  data() {
    return {
      fileList: [], openExceedDialog: false
    }
  },
  methods: {
    toggleExceedDialogModeState() {
      console.log('called', this.openExceedDialog)
      this.openExceedDialog = !this.openExceedDialog
    },
    async handleUploadFiles() {
      console.log({ files: this.fileList })
      await this.$props.handleUpload(this.fileList)
      this.$refs.uploader.clearFiles()
    },
    handleOnChange(file, fileList) {
      console.log('handleOnChange', { file, fileList })
      this.fileList = fileList
    },
    handleBeforeUpload(file) {
      console.log('handleBeforeUpload', { file })
    },
    handleHttpReq(e) {
      console.log('handleHttpReq', { e })
    },

    handlePreview(data) {
      console.log('handlePreview', { bane: data.name, percentage: data.percentage, raw: data.raw, size: data.size, status: data.status, uid: data.uid })
    },

    handleRemove(data, fileList) {
      console.log('handleRemove', { data, fileList })
      this.fileList = fileList

    },
    handleBeforeRemove(file, fileList) {
      console.log('handleBeforeRemove', { file, fileList })
    },
    handleOnExceed(files, fileList) {
      console.log('handleOnExceed', { files, fileList })
      this.$notify({
        title: 'Warning',
        message: `Only ${this.limit} file(s) can be uploaded`,
        type: 'warning',
        duration: 2000,
        position: 'top-right'
      });
      // this.toggleExceedDialogModeState()
    },
    handleSuccess(response, file, fileList) {
      console.log('handleSuccess', { response, file, fileList })
    },
    handleOnError(err, file, fileList) {
      console.log('handleOnError', { err, file, fileList })
    },
    handleOnProgress(event, file, fileList) {
      console.log('handleOnProgress', { event, file, fileList })
    },

    handleOnSubmitFinal() {
      console.log('handleOnSubmitFinal', { fileList: this.fileList })
    },

  },


}

</script>

<style scoped>
.upload-demo {
  width: 100% !important;
}

.upload-demo>>>.el-upload {
  width: 100% !important;
}

.upload-demo>>>.el-upload-dragger {
  width: 100% !important;
}
</style>
<style type="text/css" scoped>
#designOrders>>>.el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

#designOrders>>>.el-input__icon {
  line-height: 0;
}

#designOrders>>>.el-dialog__body {
  overflow: hidden;
  height: 65vh;
  padding: 24px 19px !important;
}

#designOrders>>>.el-dialog__footer {
  margin: 0;
  text-align: center !important;
  padding: 0px !important;
}

#designOrders>>>.el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
}

#designOrders>>>.el-dialog__title {
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
  font-size: 15px;
  margin-left: 10px;
  color: #222222 !important;
}

#designOrders>>>.scroll-area {
  margin-left: 10px;
  overflow: visible !important;
}

#designOrders>>>.el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#designOrders>>>.button-confirm {
  background-color: #409eff !important;
  font-size: 16px !important;
  border: none !important;
  padding: 9px 2px !important;
  width: 200px !important;
  /* height: 40px !important; */
  border-radius: 4px !important;
  background-image: -webkit-gradient(linear,
      left top,
      left bottom,
      from(#409eff),
      to(#3092f7)) !important;
  background-image: linear-gradient(to bottom, #409eff, #3092f7) !important;
  font-family: "Helvetica Neue" !important;
  font-size: 18px !important;
  font-weight: bold !important;
  height: 50px !important;
}

#designOrders>>>.create-button {
  margin-right: 15px;
}

#designOrders>>>.el-dialog {
  border-radius: 12px !important;
  height: auto !important;
  /* overflow-y: auto; */
}

@media (max-width: 1140px) {
  #designOrders>>>.el-dialog {
    border-radius: 12px !important;
    width: 90vw !important;
    overflow-y: hidden;
    height: auto;
  }

  #designOrders>>>.el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }

  #designOrders>>>.el-dialog__body {
    overflow-y: scroll;
  }
}
</style>
