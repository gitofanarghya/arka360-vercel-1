<template>
  <div id="project" v-loading.fullscreen="isLoading">
    <Navbar @handleToggleSideBar="handleSidebar"/>
    <Sidebar :isSidebarOpen="isSidebarOpen"/>
    <ProjectSummary />
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useGeographyStore } from "../../stores/geography";
import { useProjectStore } from "../../stores/project";
import Navbar from "../../components/ui/newNavbar.vue";
import Sidebar from "../../components/ui/sidebar.vue";
import projectImage from "./components/projectImage.vue";
import ProjectSummary from "./components/projectSummary/projectSummary.vue";
import clientRequirements from "./components/clientRequirements/clientRequirements.vue";
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';

export default {
  name: "Project",
  components: {
    Navbar,
    Sidebar,
    projectImage,
    ProjectSummary,
    clientRequirements,
  },
  data() {
    return {
      currentPage: "projectSummary",
      isProjectBeingLoaded: true,
      isSidebarOpen: false,
      isLoading: false,
    };
  },
  mixins: [homeRedirectionMixin],
  async created() {
    this.isLoading = true
    await Promise.all([
      this.fetchCountryDetails(),
      this.getProjectDetails(),
    ])
    this.isLoading = false
  },
  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
    ...mapActions(useGeographyStore, {
      fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
    }),
    async getProjectDetails() {
      try {
        await this.GET_CURRENT_PROJECT(this.$route.params.projectId);
        this.isProjectBeingLoaded = false;
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
    
    handleSidebar(isSidebarOpen){
      this.isSidebarOpen = isSidebarOpen; 
    }
  },
};
</script>

<style type="text/css" scoped>
.projectInformationCard {
  border-radius: 3px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.05);
  border: solid 1px #e8e8e8;
  background-color: #ffffff;
  padding: 2.5vw 1.5vw;
  width: 45%;
  box-sizing: border-box;
  height: 30vw;
  min-height: 242px;
}

.projectImage {
  height: 100%;
  border-radius: 3px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.05);
  border: solid 1px #e8e8e8;
  background-color: #ffffff;
}

.projectRequirementsCard {
  border-radius: 3px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.05);
  border: solid 1px #e8e8e8;
  background-color: #ffffff;
  padding: 1vw;
  width: 80%;
}

.cardHeaders {
  margin-bottom: 3%;
  font-size: 1.2vw;
  color: #707070;
  font-weight: bold;
}
</style>
