<template>
  <div class="profile_container">
    <div class="profile_data">
      <div class="girdCont">
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Trunk Height</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.tree.trunkHeight"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Core Height</div>
            <div class="item_value"><display-length :appendMeterUnit="true"
                        :metric-value="profileData.drawing_defaults.tree.crownHeight"/></div>
          </div>
        </div>
        <div class="col col_3">
          <div class="item_ditails">
            <div class="item_label">Enhanced Visualization in 3D</div>
            <div class="item_value">{{ computedIsProportional }}</div>
          </div>
        </div>
      </div>
      <div class="flexContainer">
        <div class='cards' v-if="computedTreeId === 1"> 
            <img src="../../../../assets/img/Mask Group 15.png" class="imgs"/>
            <p class="treeName">Small Oak</p>
        </div>
        <div class='cards' v-if="computedTreeId === 2"> 
            <img src="../../../../assets/img/Mask Group 11.png" class="imgs"/>
            <p class="treeName">Birch</p>
        </div>
        <div class='cards' v-if="computedTreeId === 3"> 
            <img src="../../../../assets/img/Mask Group 13.png" class="imgs"/>
            <p class="treeName">Branched</p>
        </div>
        <div class='cards' v-if="computedTreeId === 4"> 
            <img src="../../../../assets/img/Mask Group 14.png" class="imgs"/>
            <p class="treeName">Pine</p>
        </div>
        <div class='cards' v-if="computedTreeId === 5"> 
            <img src="../../../../assets/img/apple.png" class="imgs"/>
            <p class="treeName">Apple</p>
        </div>
        <div class='cards' v-if="computedTreeId === 6"> 
            <img src="../../../../assets/img/Mask Group 12.png" class="imgs"/>
            <p class="treeName">Palm</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeDefaults',
  props: {
    profileData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      msg: ' I am in treesDefaults',
    };
  },
  computed:{
    computedTreeId(){
      return this.profileData.drawing_defaults.tree.treeId;
    },
    computedIsProportional(){
      if( !this.profileData.drawing_defaults.tree.isProportional ) {
        return "Disabled";
      } else { 
        return "Enabled";
      }
    }
  },
};
</script>
<style scoped>
.item_label{
  font-size:16px;
}
.design_section .col_area .item_ditails .item_label {
    font-size: 16px;
    color: var(--step-250);
}

.flexContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
}

.cards {
    position: relative;
}

.activeCard {
    position: absolute;
    top: 6px;
    right: 6px;
    height: 18px;
    width: 18px;
    border: 1px solid #fff;
    background-color: #409eff;
    color: #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 11px;
}

.imgActive {
    border: 2px solid #409eff;
    border-radius: 11px;
}
.imgs {
    width: 136px;
    height: 136px;
    border-radius: 11px;
}


.treeName {
    font-size: 14px;
    color: #222;
    margin-top: 8px;
    text-align: center;
}

.girdCont {
  display: flex;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .col_row .col_3 {
    flex: inherit;
  }
}

</style>