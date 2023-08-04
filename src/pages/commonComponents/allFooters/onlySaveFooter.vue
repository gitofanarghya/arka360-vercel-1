<template>
    <div class="onlySave">
        <el-button  @click="onSave">
            Save
        </el-button>
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
            this.$emit('save', false);
        }
    }
}

</script>

<style lang="scss" scoped>

.onlySave{
    height: 200px;
    position: relative;
}

.onlySave .el-button{
    position: absolute;
    right: 0;
    bottom: 0;
    margin: 25px;
}
</style>