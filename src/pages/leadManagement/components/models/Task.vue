<template>
    <div class="container">
        <el-row :class="hasDescription ? 'task-div' : 'noDescription'">
            <el-col :span="2">
                <div class="icon-div" @click="toggleStatus(info.id, info.is_completed)">
                    <i v-if="info.is_completed" class='el-icon-success'></i>
                    <img width="14px" src="/img/icons/circle.svg" alt="incomplete" v-else>
                </div>
            </el-col>
            <el-col :span="18">
                <div class="info-div">
                    <h3 @click="onshowTaskDetails()">{{ info.name }}</h3>
                    <p :class="seeMore || isMultiLines(info.description) ? 'description-more' : 'description'" style="white-space: pre-line;" @click="onshowTaskDetails()">
                        {{  getTruncatedDescription(info.description)}}<span v-if="seeMore" class="see-more">See More</span>
                        
                    </p>
                </div>
            </el-col>
            <el-col :span="4" :style="[$props.countSize > 40 ? {'padding-left': '4rem'} : '']">
                <div :class="forLeadSummary ? 'leadSummarybodyContent' : 'bodyContent'">
                    <p class="ownerN">{{ textInitial(info.assigned_to) }}</p>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="23"><div class="border-div"></div></el-col>
        </el-row>
        <all-drawer :drawer="detailsDrawer" @save="detailsDrawer = false" :componentName="componentName" :drawerSize="500"
            @close="detailsDrawer = false" :tasks="info" :forAddTask="false"/>
    </div>
    
</template>
<script>
import API from "@/services/api/";
import showTaskDetails from "./showTaskDetails.vue";
    export default {
        name: 'Task',
        components: {
            showTaskDetails,
        },
        props: {
            info:{
                type: Object,
                default: []
            },
            project_id:{
                type: Number,
            },
            forLeadSummary: {
                type: Boolean,
                default: false,
            },
            countSize: {
                type: Number,
                default: 24,
                required: false,
            }
        },
        data() {
            return {
                seeMore: false,
                componentName: "addOrEditTask",
                detailsDrawer: false,
                color: '',
            }
         },
         computed: {
            hasDescription() {
                return Boolean(this.info.description);
            },
        },

        methods: {
            
            textInitial(text) {
                return text?.[0]?.toUpperCase()
            },
            onshowTaskDetails(){
                this.detailsDrawer = !this.detailsDrawer;
            },
            toggleStatus(id,isCompleted){
                this.$emit('toggleStatus', id,isCompleted)
            },
            getTruncatedDescription(description) {
                let linesArr = description.split('\n')
                    // let arrOfFirst = linesArr[0].split(' ') 
                    // let max = (arrOfFirst.sort((a,b) =>   b.length - a.length))[0]
                    // console.log(max)
                    // if(linesArr[0].length > Math.ceil(this.$props.countSize/2)){
                    //         this.seeMore = true
                    //         return linesArr[0].substring(0, Math.floor(this.$props.countSize)-4)+ '...';
                    // }

                    if(linesArr.length > 1){
                        if(linesArr[0].length > Math.floor(this.$props.countSize)/2){
                            this.seeMore = true;
                            return linesArr[0].substring(0, Math.floor(this.$props.countSize)-4)+ '...';
                        }
                        if(linesArr.length > 2){
                            this.seeMore = true;
                            return `${linesArr[0]}\n${linesArr[1].substring(0, Math.floor(this.$props.countSize)/3)}...`
                        }else{
                            if(linesArr[1].length < Math.ceil(this.$props.countSize/2)){
                                return `${linesArr[0]}\n${linesArr[1]}`
                            }
                        }
                    }else{
                        if(description.length > this.$props.countSize){
                            this.seeMore = true
                            return description.substring(0, this.$props.countSize)+'...';
                        }else{
                            return description
                        }
                    }

                    // if(linesArr.length > 1){
                    //     if(linesArr[1].length > Math.ceil(this.$props.countSize/2)){
                    //             this.seeMore = true
                    //             return `${linesArr[0]}\n${linesArr[1].substring(0, Math.floor(this.$props.countSize/2)-12)+ '...'}`
                    //     }
                    //     if(linesArr[0].length > Math.floor(this.$props.countSize/2)){
                    //         this.seeMore = true
                    //         return description.substring(0, Math.floor(this.$props.countSize))+ '...';
                    //     }else{
                    //         if(linesArr[1].length > Math.floor(this.$props.countSize/2)){
                    //             this.seeMore = true
                    //             return `${linesArr[0]}\n${description.substring(0, Math.floor(this.$props.countSize/2))}`+ '...';
                    //         }else{
                    //             if(linesArr.length > 2){
                    //                 this.seeMore = true
                    //                 return `${linesArr[0]}\n${linesArr[1]}`+'...'
                    //             }else{
                    //                 return description
                    //             }
                    //         }
                    //     }
                    // }
                    
                

            },
            isMultiLines(value){
                if(value.split('\n')[1]) return true
                return false
            }
            // showSeeMore(description) {
            //     return description.length > this.$props.countSize;
            // },
        },
    }
</script>
<style scoped>  
.container{
    padding: 0;
    margin: 0;
}
.border-div{
    height: 0px;
    border-top: 2px dashed #CCCCCC;
    margin-left: 1rem;
}
.avatar-img{
    border-radius: 50%;
}
.description, .description-more{    
    margin-top: 5px;
    color: #909399; 
    opacity: 0;
    height: 0;
    transition: opacity 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    word-wrap: break-word;
}


.see-more {
  color: #409eff; 
  font-weight: 500;
  font-size: 14px; 
  cursor: pointer;
}

.icon-div {
    position: absolute;
    top: 1.3rem;
    left: 1rem;
}
.avatar-div{
    margin: 0.7rem 0 0.3rem;
}
.info-div {
    margin-top: 18px;
    margin-left: 1rem;
    padding-left: 2rem;
    transition: 0.2s;
    margin-bottom: 15px;
}
div >>> .el-col-16{
    padding-left: 0 !important;
    margin-left: 0;
}
.task-div{
    padding: 0 !important;
    margin: 0 !important;
}
.task-div:hover .description-more{
    opacity: 1;
    height: 45px; 
    position: relative;
    margin-bottom: -15px;

}
.task-div:hover .description{
    opacity: 1;
    height: 35px; 
    position: relative;
    margin-bottom: -18px;
}
.task-div:hover .info-div{
    margin-top: 10px;
}
.info-div h3{
    cursor: pointer;
    user-select: none;
}
div >>> .el-row{
    padding-bottom: 0;
}
.bodyContent {
  display: flex;
  align-items: center;
  min-height: 60px;
  margin-left: 30px;
  width: 175px;
}
.leadSummarybodyContent{
    display: flex;
    padding-left: 1.5rem;
    align-items: center;
    min-height: 50px;
    width: 175px;
}
.ownerN {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #1c3366;
  font-size: 16px;
  font-weight: 400;
  color: #fff;
  
}
.info-div p{
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
}

.info-div h3{
    font-weight: 500;
    font-size: 16px;
}
.container:nth-last-child(1) >>> .border-div{
    border: 0 !important;
    margin-top: 20px;
}
</style>