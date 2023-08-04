<template>
  <div class="container">
    <div class="childContainer" v-loading.fullscreen="isLoadingProject">
      <div class="flexContainerDS" v-if="!isLoadingProject">
        <LeadProjectDetails />
        <div class="tabsContainerCRM" v-loading="isLoadingProject">
          <Tabs />
        </div>
        <div class="tasksContainerhi">
          <Tasks v-if="leadInfo?.project_details?.id" :forLeadSummary="forLeadSummary" :project_id="leadInfo?.project_details?.id"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import LeadProjectDetails from "./leadProjectDetails.vue"
import Tasks from '../../leadManagement/components/tasks.vue'
import Tabs from './tabs.vue'
import { mapActions, mapState } from "pinia"
import { useLeadStore } from "../../../stores/lead"
import { useProjectStore } from "../../../stores/project"
import { useGeographyStore } from "../../../stores/geography";



export default {

  components: {
    LeadProjectDetails,
    Tasks,
    Tabs
  },
  data() {
    return {
      forLeadSummary: true,
      leadId: this.$route.params.leadId,
      isLoading: true,
      isLoadingProject: true,
      componentKey:0,
    }
  },
  async created() {
    try {
      await this.setLead(this.leadId)
      this.isLoading = false
      try {
        await this.GET_CURRENT_PROJECT(this.leadInfo.project_details.id);
        this.isLoadingProject = false
      } catch (err) {
        console.error(err)
        this.$message({
          showClose: true,
          message: 'There was an error loading project details for this lead.',
          type: 'error',
          center: true
        });
      }
    } catch (err) {
      console.error(err)
      this.$message({
        showClose: true,
        message: 'Error in loading lead. Please try again.',
        type: 'error',
        center: true
      });
      setTimeout(()=>{ this.$router.goBackOrGoHome() }, 2000 );
    };
  },
  mounted(){
    this.fetchCountryDetails();
  },
  computed: {
    ...mapState(useLeadStore, {
      leadInfo: state => state
    })
  },
  methods: {
    ...mapActions(useLeadStore, {
      setLead: "SET_LEAD"
    }),
    ...mapActions(useGeographyStore, {
        fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
      }),
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT"]),
  }
}
</script>


<style scoped>

@media (min-width: 1281px) {
  .container {
    width: calc(100% - 74px) !important;
    height: calc(100vh - 101px);
    margin-left: auto;
    background-color: #e8edf2;
  }
}

@media (max-width: 1280px) {
  .container {
    background-color: #e8edf2;
    height: calc(100vh - 101px);
    overflow: hidden;
    overflow-y: scroll;
  }
}

@media (max-width: 650px) {
  .container {
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}
</style>

<style scoped>
.childContainer {
  height: calc(100vh - 101px);
  margin-left: auto;
  background-color: #e8edf2;
}
.flexContainerDS {
  display: flex;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
}

.tabsContainerCRM {
  width: 100%;
}

.tasksContainerhi {
  background-color: #fff;
  height: 100%;
  max-width: 400px;
  min-width: 360px;
  padding: 24px;
  overflow-y: scroll;
}
</style>