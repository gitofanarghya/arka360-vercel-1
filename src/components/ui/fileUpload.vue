<template>
  <div class="col">
    <div class="upload_area" @dragover="enableDragAndDrop && dragover" @drop="enableDragAndDrop && drop">
      <div :class="[(!this.$props.fromEsign) ? 'insicloseUploadde_content' : '']">
       
        <div :class="['browse_button', ((this.$props.fromEsign) ? 'backGround' : '')]">
          <label class="select_label" v-show="!isWeatherFileUploading">
          
            <p class="Drag-files-to-upload ">Drag files to upload</p>
            <P class="or">or</P>
            <input
              v-show="!isWeatherFileUploading"
              class="btn btn-outline"
              type="file"
              ref="file"
              @change="onChange"
              :disabled="isWeatherFileUploading"
            />
            <div class="BrowseBtn">
            <p class="addContentSD" >Browse File</p>
            </div>
          </label>
          <i class="el-icon-loading" v-show="isWeatherFileUploading"></i>
        </div>
      
      </div>
    </div>
    <p v-show="isInvalidFile" class="error-msg">* {{ errorMsg }}</p>
  </div>
</template>
<script>
export default {

  props: {
    fromEsign: {
      type: Boolean,
    },
    enableDragAndDrop: {
      type: Boolean,
      default: true,
    },
  },

  
  data() {
    return {
      isWeatherFileUploading: false,
      fileList: [],
      errorMsg: "",
      isInvalidFile: false,
    };
  },
  mounted(){
    if(!this.$props.fromEsign){
      if(this.$refs.file){
         this.$refs.file.setAttribute("multiple","");
      } 
    }else{
       if(this.$refs.file){
       this.$refs.file.setAttribute("accept","image/png,image/jpeg,image/jpg");
       }
    }
  },
  methods: {
    dragover(event) {
      event.preventDefault();
    },
    drop(event) {
      event.preventDefault();
      this.$refs.file.files = event.dataTransfer.files;
      this.onChange(); // Trigger the onChange event manually
    },
    async uploadWeatherFile(file) {
      console.log("@@file", file);
    },
    onChange() {
      console.log("!!this.$refs", this.$refs);
      this.fileList = this.$refs.file.files;
      this.uploadWeatherFile(this.fileList);
      this.$emit("openFiles", this.fileList);
    },
  },
};
</script>


<style scoped>
.btn-outline {
  display: none;

}
.insicloseUploadde_content{
  border: 1px dashed #999;
  border-radius: 4px;
}
.browse_button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px;
  height: 160px;
  border-radius: 4px;
  position: relative;
  text-align: center;
  border: none;
  background-color: #e8edf2;

}

.backGround{
  padding-top: 0px;
  margin-top: -24px;
  background-color: #fff;
}

.addContentSD {
  line-height: 1.5;
  margin-top: 3px;
  font-size: 16px;
  color: #222;
  word-break: break-word;
  font-weight: 500;
}

.createIcon {
  cursor: pointer;
}
.BrowseBtn {
  width: 117px;
  height: 32px;
  margin-left: 41px;
  margin-top: 14px;
  padding: 0px 8px;
  border-radius: 4px;
  border: solid 1px #222;
  cursor: pointer;
}
.Drag-files-to-upload {
  width: 123px;
  height: 10px;
  margin: 5px 38px 14px 38px;
  font-size: 14px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.57;
  letter-spacing: normal;
  text-align: center;
  color: #222;
}
.or {
  width: 15px;
  height: 18px;
  margin:0px 10px 0px 88px;
  font-family: HelveticaNeue;
  font-size: 16px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: center;
  color: #777;
}


</style>