<template>
  <div >
    <Navbar/>
    <!-- <div class="allContainer" v-if="isLoading"  v-loading.lock="isLoading">
    </div> -->
    <div class="allContainer" v-loading.lock="isLoading">
      <div class="sub_header">
          <span class="backLink" @click="goToHomePage">Projects /</span>
          <span @click="moveToProjectSummary" class="backLink"> Project Summary /</span>
          <span class="backLink active"> Consumption profile</span>
          <div class="group_title">
              <!-- <button class="el-icon-arrow-left icon_size_header" @click="goToHomePage" /> -->
              <span class="title_text">{{  'Consumption Profile' }}</span>
          </div>
      </div>
      <meteringType
      v-if="!isLoading"
      :isGenabilityEnabled="isGenabilityEnabled"/>
      <!-- <consumptionType
        v-if="!isLoading"
        :projectIdFromGenericComponent="projectId"
      /> -->
      <consumptionProfileEnergy
      v-if="!isLoading"
      :isGenabilityEnabled="isGenabilityEnabled"/>
      <el-button class="el-icon-back" @click="moveToProjectSummary" type="primary" > Back to Project Summary Page</el-button>
    </div>
  </div>
</template>
<script>
import Navbar from '../../components/ui/newNavbar.vue';
import consumptionType from "./components/consumptionType.vue"
import consumptionProfileEnergy from "./components/consumptionProfileEnergy.vue"
import meteringType from "./components/meteringType.vue";
import API from '@/services/api/';
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';
import { mapActions } from "pinia";
import { useProjectStore } from '../../stores/project';
export default {
  name: "App",
  components: {
    consumptionProfileEnergy,
    consumptionType,
    meteringType,
    Navbar,
  },
  data() {
    return {
        projectId: this.$route.params.projectId,
        isGenabilityEnabled: false,
        isProjectBeingLoaded: true,
        isLoading: false,
    };
  },
  mixins: [homeRedirectionMixin],
  computed: {},
  created(){
    this.getProjectDetails();
    this.getOrganisationInformation();
  },
  mounted() {
    // this.getOrganisationInformation();
  },
  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    goToHomePage() {
      this.redirectToHomeBasedOnCountry();
    },
    moveToProjectSummary(){
              this.$router.push({
                        name: 'projectSummary',
                        params: { projectId: this.projectId },
                    });
    },
    async getOrganisationInformation(){
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisation_id);
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      if(!Object.keys(responseData).length){
        responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisation_id)).data;
      }
      this.isGenabilityEnabled = responseData.is_genability_enabled;

    },
    async getProjectDetails() {
      try {
        this.isLoading = true;
        await this.GET_CURRENT_PROJECT(this.$route.params.projectId);
        this.isProjectBeingLoaded = false;
        this.isLoading = false;
      } catch (e) {
        if (e.response.status) {
          if (e.response.status === 404 || e.response.status === 403) {
            this.$message({
              showClose: true,
              message: "Project not found. Redirecting to Home Page ...",
              type: "error",
              center: true
            });
          } else if (e.response.status === 500) {
            this.$message({
              showClose: true,
              message: "Error in loading project. Please try again.",
              type: "error",
              center: true
            });
          }
          setTimeout(() => {
            this.redirectToHomeBasedOnCountry()
            // this.$router.push({ name: "home" });
          }, 2000);
        }
      }
    },
  },
  watch: {},
};
</script>

<style scoped>
.allContainer {
  /* width: 100%; */
   overflow: auto;
  background-color: #e8edf2;
  margin: 0;
  padding: 32px 5%;
  min-height: 100vh;
  /* padding: 0; */
}

.el-button--primary{
    background-image: linear-gradient(to bottom, #409eff, #3092f7);
    font-size: 16px;
    font-weight: 500;
    float: left;
    margin-left: 5%;
}

.sub_header {
  width: 90%;
  margin: 0 auto;
}

.backLink{
  color: #777777;
  font-size: 14px;
}
.backLink:hover {
  cursor: pointer;
   color: #1c3366;
}

.backLink.active {
  color: #1c3366;
}


.group_title {
  margin-top: 16px;
  display: flex;
  align-items: center;
}
.group_title .title_text {
  font-size: 1.5rem;
  font-weight: normal;
  color: var(--primary);
  display: inline-flex;
  padding-right: 8px;
}
.group_title .action_btn {
  border: 0;
  background: none;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}
.group_title .action_btn:focus {
  outline: none;
}
.group_title .icon {
  font-size: 20px;
}

@media screen and (max-width: 800px) {
  .allContainer {
  padding: 32px 0px;
  overflow-x: hidden;
}
}
</style>
