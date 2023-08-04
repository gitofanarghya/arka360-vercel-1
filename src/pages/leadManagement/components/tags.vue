<template>
  <div class="tagsParentContainer">
    <el-tag
      class="tagsContainer"
      v-for="(tag, index) in tags"
      :key="tag.name"
      closable
      @close="removeTag(index)"
    >
      {{ tag.name }}
    </el-tag>
   
    <el-button v-if="!showInput" :class="tags.length == 0 ? 'fixButton0' : 'fixButton' "  icon="el-icon-plus" @click="showInput = true; showInputDropdown(); paddingUL();">
      <span v-if="tags.length == 0" class="addTag">Add Tag</span>
    </el-button>
    <!-- :filter-method="searchAndFilter" -->
    <div v-else>
      <!-- {{ searchedInput }} -->
      <el-select
            :placement="top-start"
            filterable
            :filter-method="searchAndFilter"
            v-model="inputValue"
            placeholder=""
            ref="saveTagSelect"
            size="mini"
            @change="addTag(inputValue)"
            @visible-change="onVisibleChange"
            v-enter="selectTagOnEnter"
            class="select"
          > 
            <el-option
              v-for="tag in suggestions"
              :key="tag.id"
              :label="tag.name"
              :value="tag"
            >
          </el-option>
         
          <div slot="empty" v-if="searchedInput && suggestions.length==0" class="createTagContainer"  @click="selectTagOnEnter()">
            <p class="createTagLabel">Create tag for ‘{{searchedInput}}’</p>
          </div>
          <div v-else-if="searchedInput && suggestions.length>0" class="createTagContainer createTagContainerSticky createTagContainerBorder" 
             @click="selectTagOnEnter()">
            <p class="createTagLabel">Create tag for ‘{{searchedInput}}’</p>
          </div>
      </el-select>
    </div>
  </div>
</template>

<script>
import API from "@/services/api";
import Vue from "vue";
import { mapState, mapActions } from 'pinia';
import { useLeadStore } from "../../../stores/lead";
Vue.directive('enter', {
  inserted(el, binding, vnode) {
    el.addEventListener('keydown', event => {
      if (event.keyCode === 13) {
        vnode.context[binding.expression](event);
      }
    });
  },
});
export default {
  props: {
    tagsInProps: {
        type: Array,
        default: () => []
    },
    lead: {
        type: Object,
        default: () => {}
    },
    isUsingStore:{
      type: Boolean,
      default: false
    },
    currentRowNumber:{
      type: Number,
      default:0,
    },
    isCreateLeadMode:{
      type: Boolean,
      default: false
    }
  },
  created(){
    this.getAllTags();
    if(this.isCreateLeadMode){
      return;
    }
    if(this.isUsingStore)
      this.initializeTagsFromStore();
    else
      this.initializeTagsFromProps();

  },
  data() {
    return {
      showInput: false,
      tags:[],
      oldTags:[],
      inputValue: '',
      suggestions:[],
      totalSuggestions:[],
      searchedInput:'',
      search2: ''
    }
  },
  computed: {
    ...mapState(useLeadStore, {
        leadInfo: state => state
    }),
  },
 
  watch: {
    tags:{
      handler(value){
        if(!this.isUsingStore)
          this.$emit("updated-tags",this.tags,this.currentRowNumber);
      }
    }
  },
  methods: {
    paddingUL() {
      setTimeout(() => {
        let nodeList = document.querySelectorAll('.el-select-dropdown__item');
        for (let i = 0; i < nodeList.length; i++) {
          // nodeList[i].style.color = "#222";
          // nodeList[i].style.fontSize = "16px";
          // nodeList[i].style.padding = "0px 6px";
          nodeList[i].style.paddingBottom = "16px";
        }
        let paddingUL = document.querySelectorAll('.el-select-dropdown__list');
        for (let i = 0; i < paddingUL.length; i++) {
          // paddingUL[i].style.padding = "0px 6px";
          paddingUL[i].style.paddingBottom = "16px";
          // paddingUL[i].style.color = "#222";
          // paddingUL[i].style.fontSize = "16px";
        }
      }, 100);
    },
    ...mapActions(useLeadStore, {
        updateLead: "UPDATE_LEAD_FROM_DRAWER"
    }),
    isSearchedInputAlreadyInTotalSuggestions(value){
      return  this.totalSuggestions.find(obj=> {
          return (obj.name == value)
        })
    },
    selectTagOnEnter(){
      this.inputValue =   this.isSearchedInputAlreadyInTotalSuggestions(this.searchedInput)
      if(!this.inputValue) //if input value is null it means send searched Input and not the object
        this.inputValue = this.searchedInput;
      this.addTag(this.inputValue)
    },
    onVisibleChange(value){
      this.suggestions = [... this.totalSuggestions];
      if(!value){
        this.showInput=false;
      }
      this.searchedInput='';
    },
    showInputDropdown() {
      // this.inputVisible = true;
      this.$nextTick((_) => {
        const selectInput =
          this.$refs.saveTagSelect.$refs.reference.$el.querySelector(
            ".el-input__inner"
          );
        selectInput.focus();
        this.$refs.saveTagSelect.visible = true;
      });
    },
    searchAndFilter(value){
      this.searchedInput = value;
      let filteredSuggestions = []
      for(let i=0;i<this.totalSuggestions.length;i++){
        if(this.totalSuggestions[i]['name'].includes(value)){
          filteredSuggestions.push(this.totalSuggestions[i]);
        }
      }
      this.suggestions = [...filteredSuggestions];
      let temp = {
        name: "",
        id:983208324324
      }
      if(value && this.suggestions.length>0)
        this.suggestions.push(temp);
    },
    initializeTagsFromStore(){
      if(this.isUsingStore){
        this.tags = this.leadInfo.tags;
      }
    },
    initializeTagsFromProps(){
      if(!this.isUsingStore){
        this.tags = JSON.parse(JSON.stringify(this.tagsInProps));
      }
    },
    async createTags(postData){
        try{
            const response = await API.ORGANISATION.CREATE_TAGS(postData);
            return response.data;
        }catch(e) {
          console.log(e);
          let message='There was an unknown error while creating the tag';
          if(e.response?.data?.non_field_errors[0]=='Tag already exists'){
            message = 'Tag already exists'
          }
          this.$message({
              showClose: true,
              message: message,
              type: "error",
              center: true
          })
        }
    },
    async getAllTags(){
      try{
        const response = await API.ORGANISATION.GET_TAGS();
        this.suggestions = response.data;
        this.totalSuggestions = response.data;
      }
      catch(e){
        this.$message({
              showClose: true,
              message: 'There was an unknown error while fetching the tags',
              type: "error",
              center: true
        })
      }
    },
    functionForNotification(type,message){
      this.$message({
              showClose: true,
              message: message,
              type: type,
              center: true
        })
    },
    async addTag(tag){
      if( Array.isArray(tag))
        tag = tag[0];

      this.oldTags = [... this.tags];  
      if(typeof tag =='string'){
        const postData = {
          name: tag,
        }
        // calling API to create Tag in Org level
        let createdTag = await this.createTags(postData);
        // calling API to add Tag in the Lead
        if(createdTag?.id){
          this.tags.push(createdTag);
          this.totalSuggestions.push(createdTag);  // as new tag is created, it should be included in the total suggestions
        }
        this.inputValue = ''
        this.showInput=false;
        if(this.isCreateLeadMode)
          this.$emit('fetchTagsToSendForLead',this.tags);
        if(!this.isCreateLeadMode)
          await this.addTagInLead(createdTag.id);
      }
      else if(typeof tag =='object'){
        // it means the tag object is already created so just need to add in the lead and not in the org.
        // calling API to add Tag in the Lead
        if(!this.isThisTagAlreadyAdded(tag)){
          this.tags.push(tag);
        }
        else{
          this.$message({
              showClose: true,
              message: 'Tags already added.',
              type: "error",
              center: true
          })
        }
        this.inputValue = ''
        this.showInput=false;
        if(this.isCreateLeadMode)
          this.$emit('fetchTagsToSendForLead',this.tags);
        if(!this.isCreateLeadMode)
          await this.addTagInLead(tag.id);
      }
    },
    isThisTagAlreadyAdded(tag){
     let index =  this.tags.findIndex(item => item.name == tag.name);
     if(index<0)
      return false;
     else
      return true
    },
    async addTagInLead(createdTagId){
      let patchData = {
        tags: [createdTagId]
      }
      try{
        await this.updateLead(this.lead.lead_details.id,this.lead.id,patchData,this.functionForNotification);
      }
      catch(e){
        this.tags = [... this.oldTags];
        this.$message({
              showClose: true,
              message: 'There is some error while adding the tag.',
              type: "error",
              center: true
        })
      }
      
    },
    async deleteTagInLead(tagId){
      let patchData = {
        deleted_tags: [tagId]
      }
      await this.updateLead(this.lead.lead_details.id,this.lead.id,patchData,this.functionForNotification);
    },
    removeTag(index) {
      let tagIdToDelete = this.tags[index]['id'];
      // if(!this.isUsingStore)
      this.tags.splice(index, 1);
      if(this.isCreateLeadMode)
        this.$emit('fetchTagsToSendForLead',this.tags);  
      if(!this.isCreateLeadMode)
        this.deleteTagInLead(tagIdToDelete);
    },
    createTag(tagName) {
      this.tags.push({ name: tagName })
      this.inputValue = ''
      this.showInput=false;
    }
  }
}
</script>

<style scoped>
.tagsParentContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
 }
 .fixButton0{
  font-size: 20px;
  font-weight: 600;
  color: #777;
  padding: 6px 12px 6px 8px;
  border: 1px dotted #777;
  border-radius: 16px; 
 }

 .fixButton{
  font-size: 20px;
  font-weight: 600;
  color: #777;
  padding: 6px;
  border: none;
 }

 .tagsParentContainer >>> .el-tag {
  font-size: 16px;
  color: #222;
  background-color: #e8edf2;
  border-radius: 58px;
  border: none;
  height: auto;
  padding: 0px 16px;
 }

 .tagsParentContainer >>> .el-tag .el-icon-close {
  font-size: 16px;
  font-weight: 600;
  height: 16px;
  width: 16px;
  color: #222;
 }

 .tagsParentContainer >>> .el-tag .el-tag__close:hover {
  color: #222;
  background-color: #e8edf2;
 }

  .dropdownClass {
  max-height: 300px;
  overflow: hidden;
  overflow-y: scroll;
 }

 .addTag {
  font-size: 16px;
  color: #777;
 }

 .tag-input {
  width: 100%;
 }

 .createTagContainer {
  padding: 12px 20px;
  /* border-top: 1px solid #ccc;  */
  /* position: absolute; */
  width: 100%;
  background: #fff;
  bottom: 0;
  z-index: 10;
  cursor: pointer;
 }
 .createTagContainerSticky{
  position: absolute;
 }
 .createTagContainerBorder{
  border-top: 1px solid #ccc; 
 }

 .createTagLabel {
  font-size: 16px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
 }

 .createTagLabel::before {
  content: "";
  background: url("./assets/addTag.svg");
  min-width: 24px;
  width: 24px;
  height: 24px;
  display: block;
  }

 .tagsParentContainer >>> .el-input__inner {
  border: none !important;
  background-color: #fff !important;
  font-size: 16px;
  color: #222;
 }

 .tagsParentContainer >>> .el-input__icon {
  display: none !important;
 }

 .tagsParentContainer >>> .el-select-dropdown{
  top: 594px;
 }

 .el-select-dropdown >>> .el-select-dropdown__wrap {
  padding-bottom: 40px;
 }
 
</style>