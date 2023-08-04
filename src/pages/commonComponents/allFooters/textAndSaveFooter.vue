<template>
    <div>
        <div class="bottomCard">
              <el-card class="boxCard">
                  <el-input type="textarea" :rows="4" placeholder="Add your notes here" ></el-input>
                  <div class="outerBtn">
                      <el-button type="primary" class="submitBtn" @click="onSave">Save</el-button>
                  </div>
              </el-card>
          </div>
    </div>
</template>

<script>

export default {
    data(){
        return {

        };
    },
    methods:{
        onSave(){
            this.$emit('save', false)
        }
    }
}
</script>

<style lang="scss" scoped>

.bottomCard{
    position: absolute;
    bottom: 0px;
    width: -webkit-fill-available;
}


.outerBtn{
  padding: 20px 0px 20px 20px;
  margin-bottom: 20px;
}
.submitBtn{
    position: absolute;
    /* left: 75%; */
    right: 20px;
}

</style>