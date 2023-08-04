<template>
    <div style="display: relative;">
        <el-popover
                v-if="removable"
                :popper-class="'popover-avatar'"
                placement="top"
                v-model="forceClose"
                trigger="click">
                <div class="tag-box">
                    <el-tag
                        style="cursor: default;"
                        v-for="avatar in $props.avatars"
                        :key="avatar.id"
                        :size="'medium'"
                        @close="handleRemove(avatar.id)"
                        closable
                        :type="'info'">
                        <el-avatar
                            :size="20"
                            :style="getTagAvatarStyle(avatar.name)"
                            >
                                <span>{{ generateInitials(avatar.name) }}</span>
                        </el-avatar>
                        <span>{{avatar.name}}</span>
                    </el-tag>
                </div>
                <div :style="{position: 'relative', cursor: 'pointer', width: computeWidth}" slot="reference">
                    <el-avatar
                        :class="$props.hover ? 'avatar-hover' : ''"
                        :size="imgWidth"
                        v-for="(avatar, index) in computedAvatars"
                        :key="index"
                        :style="getAvatarStyle(avatar.name, index)"
                        >
                        <el-tooltip class="item" effect="dark" :content="avatar.message" placement="top">
                            <span>{{ limitNotRequired ? (generateInitials(avatar.name)) : ($props.avatars.length > $props.limit ? (index === 0 ? avatar.name : generateInitials(avatar.name)) :  generateInitials(avatar.name)) }}</span>
                        </el-tooltip>
                    </el-avatar>
                </div>
            </el-popover>
            <div :style="{position: 'relative', cursor: 'pointer', width: computeWidth}" v-else >
                    <el-avatar
                        :class="$props.hover ? 'avatar-hover' : ''"
                        :size="`${$props.imgWidth}`"
                        v-for="(avatar, index) in computedAvatars"
                        :key="index"
                        :style="getAvatarStyle(avatar.name, index)"
                        >
                        <el-tooltip class="item" effect="dark" :content="avatar.message" placement="top">
                            <span>{{ limitNotRequired ? (generateInitials(avatar.name)) : ($props.avatars.length > $props.limit ? (index === 0 ? avatar.name : generateInitials(avatar.name)) :  generateInitials(avatar.name)) }}</span>
                        </el-tooltip>
                    </el-avatar>
                </div>
                <div v-if="$props.editable">
                    <!-- <el-button icon="el-icon-plus" size="mini"
                    class="selection-avatars"
                    :style="{left: computeLeft, 
                        // top: `${$props.imgWidth*1/4}px`,
                         position: 'absolute',
                         }"
                    @click="handleClick"
                    v-show="false"
                    >Add </el-button> -->
                    <el-select v-model="selectedValue" 
                        v-show="true"
                        filterable 
                        placeholder="" 
                        :size="`${$props.imgWidth}`" 
                        class="selection-avatars" 
                        :style="{left: computeLeft, 
                             top: `-${$props.imgWidth*1/5}px`,
                            }"
                        @change="handleAdd"
                        @visible-change="handleVisibleChange"
                        ref="selection"
                        >
                        <el-option
                            v-for="avatar in computedSelectionAvatars"
                            :key="avatar.id"
                            :label="avatar.name"
                            :value="avatar.id">
                            <div>
                                <el-avatar
                                    :size="20"
                                    :style="getSelectionAvatarStyle(avatar.name)"
                                    >
                                        <span>{{ generateInitials(avatar.name) }}</span>
                                </el-avatar>
                                <span>{{avatar.name}}</span>
                            </div>
                        </el-option>
                    </el-select>
                </div>
            </div>
</template>
<script>
import {generateColorFromName} from '../../../utils';
export default {
    name: 'AvatarHandler',
    props: {
        avatars: {
            type: Array,
            default: [{}]
        },
        selectionAvatars: {
            type: Array,
            default:[{}]
        },
        overlap: {
            type: Boolean,
            default: false
        },
        imgWidth: {
            type: Number,
            default: 50
        },
        limit: {
            type: Number,
            default: 3
        },
        fontSize: {
            type: String,
            default: '20px'
        },
        gap: {
            type: Number,
            default: 10
        },
        removable: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: true,
        },
        hover: {
            type: Boolean,
            default: false,
        }
    },
    data(){
        return {
            showSelection: false,
            forceClose: null,
            limitNotRequired: null,
            selectedValue: null,
        }
    },
    computed: {
        computeAvatarLength(){
            return (this.$props.avatars.length < this.$props.limit ? this.$props.avatars.length : this.$props.limit)
        },
        computeLeft(){
            if(this.$props.avatars.length < this.$props.limit){
                if(this.$props.overlap){
                    return `${(this.$props.imgWidth * (this.$props.avatars.length+1) - ((this.computeAvatarLength-1) * this.$props.gap))}px`
                }
                return `${(this.$props.imgWidth * (this.$props.avatars.length+1) + (this.computeAvatarLength * this.$props.gap))}px`
            }
            if(this.$props.overlap){
                    return `${(this.$props.imgWidth * (this.$props.limit+1) - ((this.computeAvatarLength-1) * this.$props.gap))+2}px`
                }
            return `${(this.$props.imgWidth * (this.$props.limit+1) + (this.computeAvatarLength * this.$props.gap))+4}px`
        },
        computeWidth(){
            return `${this.$props.imgWidth * this.$props.limit}px`
        },
        computedSelectionAvatars(){
            return this.$props.selectionAvatars.filter(o1 => !this.$props.avatars.some(o2 => o1.id === o2.id));
        },
        computedAvatars(){
             if(this.$props.limit < this.$props.avatars.length ){
                this.limitNotRequired = false;
                let filteredArr = this.$props.avatars.slice(0,(this.$props.limit+1))
                let last = this.$props.avatars.slice(this.$props.limit, this.$props.avatars.length)
                let lastMessage='';
                last.forEach((e, index) => {
                    lastMessage += e.name + `${index === last.length-1 ? '' : ', '}`
                })
                filteredArr = filteredArr.map((e, index) => {
                    if(index === filteredArr.length-1) {
                        return { ...e, name: `+${(this.$props.avatars.length-1) -(this.$props.limit-1)}`, message: lastMessage}}
                    return {...e , message: e.name}
                })
                return filteredArr.reverse()
            }else{
                this.limitNotRequired = true;
                this.$props.limit = this.$props.avatars.length-1
                let arr = this.$props.avatars.map((e) => {
                        return {...e, message: e.name} 
                    })
                return arr.reverse()
            }
        }
    },
    methods: {
        handleVisibleChange(bool){
            if(!bool) this.showSelection = false
        },
        handleClick(){
            this.showSelection = true
            this.$nextTick(() => {
                this.$refs.selection.focus();
            });
        },
        handleAdd(id){
            let ele = this.$props.selectionAvatars.find(e => e.id === id)
            this.$emit('handleAdd', ele)
            //if(this.$props.selectionAvatars.filter(o1 => !this.$props.avatars.some(o2 => o1.id === o2.id)).length === 0){} 
            this.showSelection = false
            this.selectedValue = ''
        },
        handleRemove(id){
            if(this.$props.avatars.length-3 < this.$props.limit) this.$props.limit = this.$props.avatars.length-1
            this.$emit('handleRemove', id)
        },
        generateInitials(name) {
                if (!name || name.trim().length === 0) {
                    return "N/A"; // Return empty string for blank names
                }

                const names = name.trim().split(" ");
                const initials = names.map((n) => n.charAt(0).toUpperCase());

                if (initials.length === 1) {
                    return initials[0]; // Return single initial if only one name is available
                } else {
                    return initials[0] + initials[initials.length - 1]; // Return first and last initials for multiple names
                }
            
            },

            getAvatarStyle(value, index) {
                const backgroundColor = generateColorFromName(value);
                if(this.$props.overlap){
                    return {
                    backgroundColor: backgroundColor,
                    fontSize: this.$props.fontSize,
                    position: 'absolute',
                    left: `${((this.$props.limit+1)-(index+1)) * this.$props.imgWidth - ((this.$props.limit+1)-(index+1)) * (this.$props.gap)}px`
                };
                }
                return {
                    marginRight: "2.5px",
                    marginLeft: "2.5px",
                    backgroundColor: backgroundColor,
                    fontSize: this.$props.fontSize,
                    position: 'absolute',
                    left: `${((this.$props.limit+1)-(index+1)) * (this.$props.imgWidth + this.$props.gap) - ((this.$props.limit+1)-(index+1))}px`
                };
            },
            getTagAvatarStyle(value, index) {
                const backgroundColor = generateColorFromName(value);
                return {
                    marginRight: "2.5px",
                    marginLeft: "2.5px",
                    backgroundColor: backgroundColor,
                    fontSize: '10px',
                    position: 'absolute',
                    left: '5px',
                    top: '3px'
                };
            },
            getSelectionAvatarStyle(value){
                const backgroundColor = generateColorFromName(value);
                return {
                    marginRight: "2.5px",
                    marginTop: "2.5px",
                    backgroundColor: backgroundColor,
                    fontSize: '10px',
                    position: 'relative',
                    top: '4px',
                    left: '-5px'
                };
            }
    },
    watch:{
        avatars:{
            handler(value) {
                    if(value.length === 0){
                        this.forceClose = false
                    }
                }
            }
        }
}
</script>
<style scoped>
.tag-box{
    max-width: 500px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0.5rem;
}
.tag-box >>> .el-tag.el-tag--info{
    padding-left: 40px;
    position: relative;
}

.avatar-hover:hover{
    border: 1px solid white;
    z-index: 1;
}
.selection-avatars >>> .el-input__inner{
    width: 100px;
    display: absolute;
    background-color: transparent;
    border: transparent;
}
.selection-avatars:hover{
    color: transparent;
    background-color: transparent;
    border: transparent;
}
.selection-avatars >>> .el-input.is-focus .el-input__inner{
    border: transparent;
    background-color: transparent;
}
.selection-avatars >>> .el-select__caret{
    color: transparent !important;
}
</style>