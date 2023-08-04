<template>
  <div class="col_area design_properties" v-if="isDataVisible">
    <div class="header_title">
      <h4>Properties</h4>
    </div>
    <div class="content_scroller">
      <ul class="properties_nav">
        <li class="inside_items" @click="activteCurrentCategory({ label: 'Quick View', id: 20 })">
          <span :class="{ 'active-category': activeCategory === 20 }">
            Quick-View 
          </span>
        </li>
        <li class="inside_items" :class="{ activeSetting }"
          @click="activteCurrentCategory({label: 'settings',id:0});"
          key="0"
        >
          <span :class="{'active-category': activeCategory===0}" @click="toggleClassSetting();">Settings <img src="../../../assets/drop/group-44.png" class="dropDownArrow"></span>
          <ul class="propertis_navbar" id="settings_navbar">
            <li 
              :class="{active: data.id === activeData && windowWidth>1023}" 
              v-for="data in settingsData" 
              :key="data.id" 
              @click="openProfileDetails(data); nextStep()"
            >
              <span v-if="data.label !== 'AutoModulePlacement'">{{data.label}}</span>
              <i class="fas fa-arrow-right"></i>
            </li>
          </ul>
        </li>
        <li class="inside_items" :class="{ activeObject }">
          <span :class="{'active-category': activeCategory > 0 && activeCategory !== 20}" @click="toggleClassObject();">Objects <img src="../../../assets/drop/group-44.png" class="dropDownArrow"></span>
          <ul class="propertis_navbar" id="objects_navbar">
            <li class="inside_items" 
              v-for="category in objectsData" 
              :key="category.id"
              @click="activteCurrentCategory(category)"
            >
              <span :class="{'active-category': activeCategory===category.id}"
               @click="toggleClassInsideObject(category.label);">{{category.label}}<img  src="../../../assets/drop/group-44.png" v-if="category.label !== 'Subarray'" class="dropDownArrow"></span>
              <ul class="sub_navbar" :id="category.label" :class="[{activeModel:activeModel} ,{activeAC: activeAC}]">
                <li 
                  :class="{active: data.id === activeData && windowWidth>1023}" 
                  v-for="data in category.children" 
                  :key="data.id" 
                  @click="openProfileDetails(data); nextStep()"
                >
                  <span>{{data.label}}</span>
                  <i class="fas fa-arrow-right"></i>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>  
    </div>
  </div>
</template>

<script>
import { serverBus } from '../../../main';

export default {
  name: 'ProfileTree',
  props: {
    ['isDataVisible']: Boolean,
    step: Number,
    windowWidth: Number,
    selectedProperty:Object
  },
  data() {
    return {
      activeSetting:true,
      activeObject:true,
      activeModel:true,
      activeAC:true,
      msg: ' I am in allProfiles',
      currentPage: 'organisationSettings',
      activeData: 0,
      activeCategory: 20,
      settingsData: [
        {
          id: 1,
          label: 'General',
        },
        {
          id: 2,
          label: 'Losses',
        },
        {
          id: 3,
          label: 'AutoModulePlacement',
        },
        {
          id: 4,
          label: 'Report',
        },
      ],
      objectsData: [
        {
          id: 5,
          label: 'Models',
          children: [
            {
              id: 6,
              label: 'Polygon',
            },
            {
              id: 7,
              label: 'Cylinder',
            },
            {
              id: 77,
              label: 'Smartroof',
            },
            {
              id: 8,
              label: 'Walkways',
            },
            {
              id: 9,
              label: 'Tree',
            },
          ],
        },
        // {
        //   id: 10,
        //   label: 'Subarrays',
        //   children: []
        // },
        // {
        //   id: 11,
        //   label: 'Components',
        //   children: [
        //     {
        //       id: 12,
        //       label: 'Inverter',
        //     },
        //     //this code is hidden temporarily.ACDB_HIDE
        //     // {
        //     //   id: 13,
        //     //   label: 'ACDB',
        //     // },
        //     /* {
        //       id: 14,
        //       label: 'AC Cable',
        //     }, */
        // ],
        // },
      ],
      isVipPowerGazebo: false,
    }
  },
  async mounted () {
    this.isVipPowerGazebo = await this.setGazeboStatus();
    const isOrgUnirac = await this.isOrganisationUnirac();
    if (!this.isVipPowerGazebo){
      this.objectsData.push({
        id: 10,
          label: 'Subarray',
          children: []
      });
      this.objectsData.push({
        id: 11,
          label: 'Components',
          children: [
            {
              id: 12,
              label: 'Inverter',
            },
          ],
      });
      if(isOrgUnirac) {
          this.activeData = 10;
          this.activeCategory = 20;
      }
      else{
          this.activeData = 1;
          this.activeCategory = 0;
      }
  }
  },
  methods: {
    openProfileDetails(data) {
      this.activeData = data.id;
      this.$emit('update:selectedProperty',data)
      serverBus.$emit('component', data.label);
    },
    activteCurrentCategory(category) {
      this.activeCategory = category.id;
      if(category.id === 10 || category.id === 20){
        this.openProfileDetails(category)
      }
    },
    async isOrganisationUnirac() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const organisationId = user.organisation_id;

      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!Object.keys(responseData).length && organisationId){
          responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      return (responseData.name === 'Unirac' && responseData.id === 114 );
    },
    toggleClassSetting(){
      this.activeSetting =!this.activeSetting;
    },
    toggleClassObject(){
      this.activeObject =!this.activeObject;
    },
    toggleClassInsideObject(category){
      if(category==='Models')
      this.activeModel = !this.activeModel;
      else if(category==='Components')
      this.activeAC = !this.activeAC;
    },
    nextStep(){
      this.$emit('nextStep');
    },
    nextStepForSubarray() {
      if(this.activeCategory==10)
      this.nextStep();
    },
    async setGazeboStatus() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
          responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
      }
      return Promise.resolve(responseData.vip_for_power_gazebo);
    },
  },
   watch : {
    activeCategory:function(val) {
       if(val==10)
       this.nextStep();
    },
  },
};

</script>

<style scoped>
.col_area .content_scroller .properties_nav .inside_items #settings_navbar{
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}
.col_area .content_scroller .properties_nav .inside_items.activeSetting #settings_navbar{
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.col_area .content_scroller .properties_nav .inside_items #objects_navbar{
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar{
  visibility: visible;
  max-height: 400px;
  transform: scaleY(1);
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Models {
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Models.activeModel {
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Components {
  visibility: hidden;
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar .inside_items #Components.activeAC {
  visibility: visible;
  max-height: 300px;
  transform: scaleY(1);
}

.col_area .content_scroller .properties_nav .inside_items #objects_navbar .inside_items #Subarray:after{
  display: none;
}

@media (max-width: 1024px){
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar[data-v-4da2f746] {
    visibility: visible;
    max-height: 500px !important;
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
}
}

.properties_nav .inside_items:after{
  display: none !important;
}

.dropDownArrow{
  float: right;
  width: 18px;
  transition: 0.3s;
}

.dropDownArrow:active{
 transform: rotate(-90deg);
}

.properties_nav span{
  padding: 8px 15px 8px 24px !important;
    font-size: 16px;

}

.properties_nav>li .propertis_navbar>li span{
  padding: 8px 36px !important;
}

.properties_nav>li .propertis_navbar>li .sub_navbar li span{
  padding-left: 46px !important;
}

.properties_nav .inside_items .propertis_navbar .inside_items>span {
    color: var(--step-250);
    padding-right: 15px !important;
}

@media (max-width: 767px){

.col_area .content_scroller .properties_nav .inside_items #objects_navbar{
  visibility: hidden;
 
}
.col_area .content_scroller .properties_nav .inside_items.activeObject #objects_navbar{
  visibility: visible;
}

}


</style>