<template>
  <div class="card">
    <div class="card_header flex_header">
      <div class="heading">
        <h4>Project Upgrade</h4>
      </div>
    </div>
    <div class="container">
      <p class="paragraph">
        Upgrade your project to use more features in your design.
      </p>
      <div class="listContainer">
        <li class="lists" v-for="features in availableFeatures" :key="features.id">
          {{features.featureName }} ({{features.credits + ' Credits'}})
        </li>
      </div>
      <el-tooltip
        :disabled="!isDisabled"
        effect="dark"
        placement="top-start"
        :content="tooltipMessageForUpgrade"
       >
       <span>
        <el-button type="primary" class="upgradeBtn"  @click="isProjectUpgradePopupVisible = true" :disabled="isDisabled">Upgrade Now</el-button>
       </span>
      </el-tooltip>
    </div>

    <project-upgrade-popup v-if="isProjectUpgradePopupVisible"
      :isProjectUpgradePopupVisible.sync="isProjectUpgradePopupVisible" />
  </div>
</template>
    
<script>
import { mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";

export default {
  name: "comments",
  data() {
    return {
      isProjectUpgradePopupVisible: false,
      availableFeatures: [],
    };
  },
  props: {
    totalSelfDesigns: {
      type: Number,
      default: 0
    },
  },
  mounted() {
    this.projectUpgradeInfo();
  },
  computed:{
    ...mapState(useProjectStore, {
      getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
    }),
    ISUs(){
      const user = JSON.parse(localStorage.getItem('user')) || {};
      return user.isUSFlagEnabled;
    },
    tooltipMessageForUpgrade(){
      return (this.getAllFeaturesFromProject.available_features && this.getAllFeaturesFromProject.available_features.length) == 0 ? "No more upgrades available" : "You can create a new design to upgrade the project size."
    },
    isDisabled(){
      if((!this.totalSelfDesigns && !this.ISUs) || (this.getAllFeaturesFromProject.available_features && this.getAllFeaturesFromProject.available_features.length == 0)){
        return true;
      }
      else{
        return false;
      }
    },
  },
  methods: {
    projectUpgradeInfo() {
      const projectUpgradeInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
      if(projectUpgradeInfo.self_designing_info.input_checkbox.length > 0) {
        for(let i = 0; i < projectUpgradeInfo.self_designing_info.available_features.length; i++) {
          this.availableFeatures.push({
          id: projectUpgradeInfo.self_designing_info.available_features[i].id,
          featureName: projectUpgradeInfo.self_designing_info.available_features[i].name,
          credits: projectUpgradeInfo.self_designing_info.available_features[i].credits,
          });
        }   
      }
    },
  },
};
</script>
    
<style scoped>
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  padding: 16px 16px 16px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px;
}

.card .card_header .heading h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.container {
    padding: 24px;
}

.paragraph {
    color: #777;
    font-size: 16px;
    line-height: 1.5;
    word-break: break-word;
    margin-bottom: 8px;
}

.lists::before {
    content: "•";
    color: #999; 
    font-size: 32px; 
    margin-right: 8px;
}

.listContainer {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 32px;
    margin-bottom: 12px;
    list-style-type: none;
}

.lists {
    font-size: 16px;
    color: #222;
    display: flex;
    align-items: center;
}

.upgradeBtn {
    font-size: 16px;
    font-weight: 600;
}


</style>
    
    
    
    
    