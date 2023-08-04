<template>
    <div class="container">
        <el-row>
            <el-col :span="2">
                <div class="icon-div" @click="toggleStatus(info.id)">
                        <i :class="info.isCompleted ? 'el-icon-success': 'el-icon-remove-outline' "></i>
                </div>
            </el-col>
            <el-col :span="18">
                <div class="info-div">
                    <h3 @click="toggleStatus(info.id)">{{ info.title }}</h3>
                    <p class="description">{{ info.description }}</p>
                </div>
            </el-col>
            <el-col :span="4">
                <div class="avatar-div">
                    <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="avatar" width="32px" class="avatar-img" :title="info.assignee">
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="23"><div class="border-div"></div></el-col>
        </el-row>
    </div>
</template>
<script>
    export default {
        name: 'Task',
        props: ['info'],
        methods: {
            toggleStatus(id){
                this.$emit('toggleStatus', id)
            }
        },
    }
</script>
<style scoped>  
.border-div{
    border-bottom: 1px dashed #909399;
    padding-bottom: 0.5rem;
    margin-left: 1rem;
}
.avatar-img{
    border-radius: 50%;
}
.description{
    color: #909399; 
    opacity: 0;
    height: 0;
    transition: opacity 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
}
.icon-div {
    margin: 1.2rem 1rem 0 1rem;
    text-align: right;
    cursor: pointer;
}
.avatar-div{
    margin: 0.7rem 0 0.3rem;
}
.info-div{
    margin-top: 1.1rem;
    margin-left: 0.5rem;
    padding-left: 0;
}
div >>> .el-col-16{
    padding-left: 0 !important;
    margin-left: 0;
}
.container:hover .description{
    opacity: 1;
    height: 100px; 
}
.info-div h3{
    cursor: pointer;
    user-select: none;
}
div >>> .el-row{
    padding-bottom: 0;
}
</style>