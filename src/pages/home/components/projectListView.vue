<template>
  <section class="right_section" v-loading.fullscreen.lock="isShareLoading">
    <div :v-if="showlogoutconfirmbox">
      <vue-confirm-dialog class="ConfirmBox"></vue-confirm-dialog>
    </div>
    <div class="content_section">
      <div class="filter_section">
        <div class="title">
          <div
            v-if="active"
            class="title projectTitle"
            style="margin-left: -1.5%"
          >
            {{projectText}}s
          </div>
          <!-- <div class="project_btn" v-if="window.width < 767">
            <a class="btn btn-primary" @click="isNewProjectFormVisible = true"
              >Create New {{projectText}}</a
            >
          </div> -->
        </div>
        <div class="filter_area" @click="toggleSidebarStatus">
          <div class="search_field" >
            <span
              class="icon search"
              :class="!isSearchEnabled ? 'moveRight': ''"
              @click="isSearchEnabled = !isSearchEnabled"
              v-if="search.length == 0"
            ></span>
            <span class="crossIcon" v-if="search.length > 0" @click="resetInput">
              <img src="https://cdn.zeplin.io/5fe06da7bcd15d47b191f058/assets/3b7d2dcf-3845-4086-baf4-d160366c22c9.svg" />
            </span>
            <input
              v-model="search"
              suffix-icon="el-icon-search"
              class="input_field"
              :class="{ isSearchEnabled: isSearchEnabled }"
              type="search"
              :placeholder="`Search ${projectText}s by Name or Created by`"
            />
          </div>
          <div class="view_type">
            <a @click="toggleViewType" class="tab_list" :class="{ active }">
              <span class="icon list-icon"></span>
              <span class="list_text">List</span>
            </a>
            <a
              @click="toggleViewType"
              class="tab_list"
              :class="{ active: !active }"
            >
              <span class="icon location"></span>
              <span class="list_text">Map</span>
            </a>
          </div>
          <div class="project_btn">
            <a class="btn btn-primary" @click="isNewProjectFormVisible = true"
              >Create New {{projectText}}</a
            >
          </div>
        </div>
      </div>
      <div class="tab_content">
        <div
          v-if="active"
          class="table_section"
          :style="{
            height: `${
              window.width > 767 ? window.height - 250 : window.height - 150
            }px`,
          }"
        >
          <!-- remove hidden attr for show content -->
          <div class="table_scroll">
            <table>
              <thead style="top: 0px; position: sticky">
                <tr>
                  <th>{{projectText}}s ({{ total_project }})</th>
                  <th>Designs</th>
                  <th>Created On</th>
                  <th>Client Name</th>
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody v-if="allProjectsList.length == 0">
                <tr class="empty-list" v-if="isLoading" v-loading="isLoading">
                  <td colspan="6">
                    <div class="create_list">
                      <!-- <figure>
                        <a @click="isNewProjectFormVisible = true">
                          <img src="../assets/img/add-list.svg" alt="Create" />
                        </a>
                      </figure>
                      <div class="info_content">
                        <p>
                          You have not created any project. To create your first
                          project click “Create New Project” button above
                        </p>
                      </div> -->
                    </div>
                  </td>
                </tr>

                <tr class="empty-list" v-if="!isLoading">
                  <td colspan="6">
                    <div class="create_list">
                      <figure>
                        <a @click="isNewProjectFormVisible = true">
                          <img src="../assets/img/add-list.svg" alt="Create" />
                        </a>
                      </figure>
                      <div class="info_content">
                        <p v-if="isSearchedProjectEmpty">
                          Your searched {{projectText}}s are not Found. To create your
                          {{projectText}} click “Create New {{projectText}}" button above
                        </p>
                        <p v-else>
                          You have not created any {{projectText}}. To create your first
                          {{projectText}} click “Create New {{projectText}}” button above
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>

              <tbody v-if="allProjectsList.length != 0" v-loading="isLoading">
                <tr v-for="project in allProjectsList" :key="project.id">
                  <td class="address_td">
                    <router-link :to="'/projectSummary/' + project.id">
                      <div class="project_info">
                        <figure>
                          <img :src="project.staticImageUrl" alt />
                        </figure>
                        <div class="project_content">
                          <h5 v-html="projectNameFiltered(project.projectName)"></h5>
                          <em>{{ project.projectType }}</em>
                          <p>{{ project.clientAddress }}</p>
                        </div>
                      </div>
                    </router-link>
                  </td>
                  <!-- <td> {{project.projectName}} </td> -->
                  <td class="title_td grow_td title_td_count">
                    <router-link :to="'/projectSummary/' + project.id">
                      <div class="md_head" style="color: var(--primary)">
                        Design Count
                      </div>
                      <div class="value_type">
                        {{ project.number_of_designs }}
                      </div>
                    </router-link>
                  </td>
                  <td class="title_td">
                    <router-link :to="'/projectSummary/' + project.id">
                      <div class="md_head" style="color: var(--primary)">
                        Created On
                      </div>
                      <span class="date">{{ project.date }}</span>
                    </router-link>
                  </td>
                  <td class="title_td">
                    <router-link :to="'/projectSummary/' + project.id">
                      <div class="md_head" style="color: var(--primary)">
                        Client
                      </div>
                      <div class="value_type client_name">
                        <span v-html="clientNameFiltered(project.clientName)"></span>
                      </div>
                    </router-link>
                  </td>

                  <td class="title_td">
                    <router-link :to="'/projectSummary/' + project.id">
                      <div class="md_head" style="color: var(--primary)">
                        Created By
                      </div>
                      <div class="value_type creator_name">
                        {{
                          project.createdBy.first_name +
                          " " +
                          project.createdBy.last_name
                        }}
                      </div>
                    </router-link>
                  </td>

                  <td
                    class="md_dot"
                    :class="{ active: project.isActionListActive }"
                    @click="toggleActionList(project)"
                  >
                    <div class="dot">
                      <span class="fas fa-ellipsis-v"></span>
                    </div>
                    <div class="action_btn">
                      <ul class="action_list">
                        <li
                          v-if="isSharingAllowed"
                          data-toggle="modal"
                          data-target="#share_project"
                          @click="share_project(project)"
                          :disabled="project.permission === 'view_project'"
                        >
                          <el-tooltip
                            effect="dark"
                            placement="top-start"
                            :content="`Share ${projectText}`"
                          >
                            <button class="btn">
                              <span class="fas fa-share-alt"></span>
                            </button>
                          </el-tooltip>
                          <div class="act_text">Share</div>
                        </li>
                        <li
                          data-toggle="modal"
                          data-target="#delete_project"
                          @click="deleteProject(project)"
                          :disabled="project.permission === 'view_project'"
                        >
                          <el-tooltip
                            effect="dark"
                            placement="top-start"
                            :content="`Delete ${projectText}`"
                          >
                            <button class="btn">
                              <span class="fas fa-trash-alt"></span>
                            </button>
                          </el-tooltip>
                          <div class="act_text">Delete</div>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-infinite-scroll="loadMoreProjects"
              infinite-scroll-disabled="busy"
              infinite-scroll-distance="10"
              style="text-align: center"
            >
              <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
            </div>
          </div>
        </div>
        <div v-else class="tab_content">
          <div class="map_area">
            <!-- <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14019.673228798889!2d77.3344533!3d28.5421751!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xbdac94bd5b5e046c!2sThe%20Solar%20Labs!5e0!3m2!1sen!2sin!4v1618738317069!5m2!1sen!2sin"
              width="100%"
              style="border:0;"
              allowfullscreen
              loading="lazy"
            ></iframe>-->
            <HomeMap
              ref="homeMapImport"
              @deleteProject="deleteProject"
              @shareProject="share_project"
              :all-projects="allProjectsMapInfo"
            />
          </div>
        </div>
      </div>
    </div>
    <shareProject
      v-if="shareDialogBoxVisible"
      :shareDialogBoxVisible.sync="shareDialogBoxVisible"
      :project_id="project_id"
    />
    <newProjectDialog
      v-if="isNewProjectFormVisible"
      :is-new-project-form-visible.sync="isNewProjectFormVisible"
    />
    <DeleteProject
       v-if="isDeleteProjectPopupOpen"
      :isDeleteProjectPopupOpen="isDeleteProjectPopupOpen"
      :projectIdTobeDeleted="projectIdTobeDeleted"
      @confirmDelete="actualDelete()"
      @cancelDelete="isDeleteProjectPopupOpen = false"
    />
  </section>
</template>

<script>
import Vue from "vue";
import debounce from "debounce";
import API from "@/services/api/";
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from "../../../constants";
import shareProject from "../../project/components/projectNameAndActions/shareProject.vue";
import newProjectDialog from "@/components/ui/newProject/newProject.vue";
import { ObserveVisibility } from "vue-observe-visibility";
import HomeMap from "./homeMap.vue";
import DeleteProject from "./deleteProject.vue";
import { mapActions } from "pinia";
import { useOrganisationStore } from "../../../stores/organisation";
import { useRootStore } from '../../../stores/root';
Vue.directive("observe-visibility", ObserveVisibility);
import { isTataOrg } from "../../../utils";
import { signRequest } from '../../../core/utils/utils';

export default {
  components: {
    shareProject,
    newProjectDialog,
    DeleteProject,
    HomeMap,
  },
  data() {
    return {
      msg: "I am in home ALL Leads",
      isShareLoading: false,
      search: "",
      isHomeMapVisible: true,
      currentPage: "Projects",
      allProjectsList: [],
      allProjectsMapInfo: [],
      nextUrl: null,
      prevUrl: null,
      busy: false,
      isNewProjectFormVisible: false,
      loader: true,
      active: true,
      projectList: [],
      showlogoutconfirmbox: false,
      shareDialogBoxVisible: false,
      project_id: null,
      total_project: null,
      isNewProjectFormVisible: false,
      isActionListActive: false,
      isSearchEnabled: true,
      isDeleteProjectPopupOpen: false,
      projectIdTobeDeleted: -1,
      projectTobeDeleted: {},

      window: {
        width: 0,
        height: 0,
      },
      isLoading: false,
      isSearchedProjectEmpty: false,
      isSearchingProjects: false

    };
  },
  // this watch can be removed as well by using remote in input
  watch: {
    search(newVal) {
      this.searchAllProjects(newVal);
    },
  },
  created() {
    // when the component has been created,
    // we replaced the original method with a debounced version
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.searchAllProjects = debounce(this.searchAllProjects, 1000);
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    isSharingAllowed() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.role !== "ADMIN" && isTataOrg()) {
        return false;
      }
      return true;
    },
    projectText() {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      let isSL360User = user.is_sl_360_user
      if (isSL360User) {
        return 'Design'
      } else {
        return 'Project'
      }
    }
  },
  mounted() {
    this.fetchAPIgoogleMapProject();
    this.setUsedQuotaDetailsAndQuotaType();
  },
  methods: {
    ...mapActions(useOrganisationStore, {
        setUsedQuotaDetailsAndQuotaType: 'SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE'
    }),
    projectNameFiltered(val){
      if(val){
        const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
        return eval("`" + escapedVal + "`");
      }
      else{
        return "-"
      }
    },
    clientNameFiltered(val){
      if(val){
        const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
        return eval('`' + escapedVal + '`');
      }
      else{
        return "-"
      }
    },
    resetInput() {
      this.search = "";
    },
    toggleSidebarStatus() {
      if (useRootStore().sidebarStatus) {
        useRootStore().toggleSidebar();
      }
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    toggleViewType() {
      return (this.active = !this.active);
    },
    toggleMap() {
      this.isHomeMapVisible = !this.isHomeMapVisible;
    },
    toggleActionList(project) {
      project.isActionListActive = !project.isActionListActive;
    },

    onRightClick(row) {
      const rowIndex = this.allProjectsList.indexOf(row);
      const projectID = this.allProjectsList[rowIndex].id;
      const routeData = this.$router.resolve({
        name: "projectSummary",
        params: { projectId: projectID },
      });

      window.open(routeData.href, "_blank");
    },
    async deleteProject(project) {
      let is_user_permitted = await this.checkUserpermission(project);
      if (is_user_permitted) {
        this.showlogoutconfirmbox = true;
        this.isDeleteProjectPopupOpen = true;
        this.projectIdTobeDeleted = project.id;
        this.projectTobeDeleted = project;

      } 
      else
        this.$toastr.e("You don't have permission to delete this project");
    },

    async actualDelete() {
      this.isDeleteProjectPopupOpen = false;
      // no need to check the permission once again.  We already checked just before opening the delete popup.
      let is_user_permitted = true
      if (is_user_permitted) {
        const index = this.allProjectsList.indexOf(this.projectTobeDeleted);
        const mapIndex = this.allProjectsMapInfo.indexOf(
          this.projectTobeDeleted
        );
        try {
          await API.PROJECTS.DELETE_PROJECT(this.projectTobeDeleted.id);
          this.allProjectsList.splice(index, 1);
          let allProjectsMap = this.allProjectsMapInfo.filter((item) => {
            return item.info.projectId !== this.projectTobeDeleted.id;
          });
          this.allProjectsMapInfo = allProjectsMap;
          try {
            this.setBounds();
          } catch {}
          this.$message({
            showClose: true,
            message: "Project deleted successfully.",
            type: "success",
            center: true,
          });
        } catch (error) {
          this.$message({
            showClose: true,
            message: "Failed to delete project.",
            type: "error",
            center: true,
          });
        }
      }
    },
    async share_project(project) {
      let is_user_permitted = await this.checkUserpermission(project);
      if (is_user_permitted)
        this.shareDialogBoxVisible = !this.shareDialogBoxVisible;
      else this.$toastr.e("You don't have permission to share this project");
    },
    async fetchAllProjects() {
      try {
        // this await would ensure that call is made only after google
        // instance is loaded
        this.isLoading = true;
        this.isSearchingProjects=false;
        const response = await API.PROJECTS.FETCH_ALL_PROJECTS();
        //--------- we dont to use projects.json API's results if we searched somehting
        if(this.isSearchingProjects){
          return;
        }
        //---------------------------------------------------------------------//
        this.total_project = response.data.count;
        this.assignAPIResponseWithMapRefresh(response);
        this.isLoading = false;
        const map_response = await API.PROJECTS.FETCH_API_GOOGLE_MAP_PROJECTS();

        // this.assignAPIResponseGoogleMapPro(response);
       
        this.assignAPIResponseGoogleMapPro(map_response);
        
        // this.setBounds();
      } catch (e) {
        console.error(e);
        console.error(
          "home.vue: fetchAllProjects: Project didn't load. Refresh page"
        );
      }
    },
    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }
      this.loadMoreProjects();
    },
    async fetchAPIgoogleMapProject() {
      try {
        //await this.$refs.homeMapImport.$refs.gmap.$mapPromise;
        // const response = await API.PROJECTS.FETCH_API_GOOGLE_MAP_PROJECTS();
        // this.assignAPIResponseGoogleMapPro(response);
        // this.setBounds();
        this.fetchAllProjects();
      } catch (e) {
        console.error(
          "home.vue: fetchAPIgoogleMapProject: Project didn't load. Refresh page"
        );
      }
    },
    async checkUserpermission(project) {
      this.isShareLoading = true;
      const user = JSON.parse(localStorage.getItem("user"));
      const currUserId = user.user_id;
      let currentUserEditPermission = false;

      this.project_id = project.id.toString();
      let response;
      try{
        response = await API.PROJECTS.FETCH_PROJECT_PERMISSIONS(
        this.project_id
      );
      }
      catch(e){
        if(e.response.status==403){
          this.isShareLoading = false;
          return false;
        }
      }
      console.log(response);
      const users = JSON.parse(JSON.stringify(response.data));

      // IT means it is publicly shared So I have the permisison to delete
      if(Array.isArray(response.data) && response.data.length==0){
        currentUserEditPermission = true;
        this.isShareLoading = false;
        return true;
      }
      // checking if current user has permission to modify sharing permissions
      users.forEach((item) => {
        if (
          item.user.id == currUserId &&
          item.permission== 'change'
        ) {
          currentUserEditPermission = true;
          this.isShareLoading = false;
          return true;
        }
      });
      this.isShareLoading = false;
      return currentUserEditPermission;

      // slicing current user. Users list is also modified here

      // let isPublicShared = response.data.organisation.length > 0;
      // if (isPublicShared || currentUserEditPermission) {
      //   this.isShareLoading = false;
      //   return true;
      // } else {
      //   this.isShareLoading = false;
      //   return false;
      // }
    },
    async loadMoreProjectsHelper() {
      try {
        const response = await API.PROJECTS.LOAD_MORE_PROJECTS(this.nextUrl);
        this.assignAPIResponseWithMapRefresh(response);
        this.busy = false;
      } catch (error) {
        console.error();
      }
    },

    loadMoreProjects() {
      if (this.nextUrl !== null) {
        this.busy = true;
        this.loadMoreProjectsHelper();
      }
    },
    async searchAllProjectsHelper(query) {
      try {
        //await this.$refs.homeMapImport.$refs.gmap.$mapPromise;
        this.isSearchedProjectEmpty = true;
        this.isLoading=true;
        this.isSearchingProjects=true;

        const response = await API.PROJECTS.SEARCH_ALL_PROJECTS(query);
        this.allProjectsList = [];
        this.assignAPIResponseWithMapRefresh(response);
        this.isLoading=false;
        const mapresponse =
          await API.PROJECTS.FETCH_API_GOOGLE_MAP_PROJECTS_QUERY(query);
        this.allProjectsMapInfo = [];
        this.assignAPIResponseGoogleMapPro(mapresponse);
        
        if (this.allProjectsList.lenght > 0)
          this.isSearchedProjectEmpty = false;
      } catch (error) {
        console.error();
      }
    },
    assignAPIResponse(response) {
      this.total_project = response.data.count;
      this.nextUrl = response.data.next;
      this.prevUrl = response.data.previous;
      let resultTableData = response.data.results;
      for (let key in resultTableData) {
        //let tempProjectMapObject = {};
        let tempProjectObject = {};
        let obj = resultTableData[key];
        tempProjectObject["createdBy"] = obj.created_by;
        tempProjectObject["permission"] = obj.permission;
        tempProjectObject["id"] = obj.id;
        tempProjectObject["projectName"] = obj.name || "";
        tempProjectObject["address"] = obj.client_address || "";
        tempProjectObject["contactNumber"] = obj.contactNumber;
        tempProjectObject["number_of_designs"] = obj.number_of_designs;

        let curDate = obj.created_at.split("T")[0];
        curDate = new Date(curDate);
        curDate = curDate.toDateString();
        let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
        let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
        let dt = `${curDate[8]}${curDate[9]}`;
        let modifiedDate = `${dt} ${month} ${year}`;
        tempProjectObject["date"] = modifiedDate;

        // tempProjectObject["date"] = obj.created_at.split("T")[0];
        tempProjectObject["clientName"] = obj.client_name;
        tempProjectObject["clientAddress"] = obj.client_address;
        tempProjectObject["quotaType"] =
          obj.quota_type === "LARGE" ? "Commercial" : "Residential";
        tempProjectObject["isActionListActive"] = false;
        tempProjectObject["staticImageUrl"] = this.getProjectStaticImage(
          obj.latitude,
          obj.longitude
        );
        this.allProjectsList.push(tempProjectObject);
        let position = {};
        position["lat"] = parseFloat(obj.latitude);
        position["lng"] = parseFloat(obj.longitude);
        let info = {};
        info["projectName"] = obj.name || "";
        info["projectId"] = obj.id;
        info["systemSize"] = obj.size || "";
        tempProjectMapObject["position"] = position;
        tempProjectMapObject["info"] = info;
        this.allProjectsMapInfo.push(tempProjectMapObject);
        this.setBounds();
      }
      this.loader = false;
    },

    assignAPIResponseWithMapRefresh(response) {
      this.nextUrl = response.data.next;
      this.prevUrl = response.data.previous;
      let resultTableData = response.data.results;
      for (let key in resultTableData) {
        let tempProjectMapObject = {};
        let tempProjectObject = {};
        let obj = resultTableData[key];
        tempProjectObject["id"] = obj.id;
        tempProjectObject["projectName"] = obj.name || "";
        tempProjectObject["projectType"] = obj.project_type || "";
        tempProjectObject["address"] = obj.client_address || "";
        tempProjectObject["createdBy"] = obj.created_by;
        tempProjectObject["contactNumber"] = obj.contactNumber;
        tempProjectObject["number_of_designs"] = obj.number_of_designs;

        let curDate = obj.created_at.split("T")[0];
        curDate = new Date(curDate);
        curDate = curDate.toDateString();
        let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
        let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
        let dt = `${curDate[8]}${curDate[9]}`;
        let modifiedDate = `${dt} ${month} ${year}`;
        tempProjectObject["date"] = modifiedDate;

        // tempProjectObject["date"] = obj.modified_at.split("T")[0];
        tempProjectObject["clientName"] = obj.client_name;
        tempProjectObject["clientAddress"] = obj.client_address;
        tempProjectObject["quotaType"] =
          obj.quota_type === "LARGE" ? "Commercial" : "Residential";
        tempProjectObject["isActionListActive"] = false;
        tempProjectObject["staticImageUrl"] = this.getProjectStaticImage(
          obj.latitude,
          obj.longitude
        );

        this.allProjectsList.push(tempProjectObject);
        let position = {};
        position["lat"] = parseFloat(obj.latitude);
        position["lng"] = parseFloat(obj.longitude);
        let info = {};
        info["projectName"] = obj.name || "";
        info["projectId"] = obj.id;
        tempProjectMapObject["position"] = position;
        tempProjectMapObject["info"] = info;
        this.allProjectsMapInfo.push(tempProjectMapObject);
      }
      //this.setBounds()
    },
    assignAPIResponseGoogleMapPro(response) {
      let resultTableData = response.data;
      for (let key in resultTableData) {
        let tempProjectMapObject = {};
        let obj = resultTableData[key];

        let position = {};
        position["lat"] = parseFloat(obj.latitude);
        position["lng"] = parseFloat(obj.longitude);
        let info = {};
        info["projectName"] = obj.name || "";
        info["projectId"] = obj.id;

        tempProjectMapObject["position"] = position;
        tempProjectMapObject["info"] = info;
        this.allProjectsMapInfo.push(tempProjectMapObject);
      }
    },
    setBounds() {
      const bounds = new google.maps.LatLngBounds();
      for (const m of this.allProjectsMapInfo) {
        bounds.extend(m.position);
      }
      try {
        this.$refs.homeMapImport.$refs.gmap.$mapObject.fitBounds(bounds);
      } catch {}
    },
    getProjectStaticImage(latitude, longitude) {
      return signRequest(`https://maps.googleapis.com/maps/api/staticmap?center=${latitude.toString()},
            ${longitude.toString()}&scale=2&zoom=18&maptype=satellite&size=80x80&key=${GOOGLE_API_KEY}`,GOOGLE_SIGNING_SECRET);
    },

    searchAllProjects(query) {
      if (query !== "") {
        this.isLoading = true;
        setTimeout(() => {
          this.searchAllProjectsHelper(query);
        }, 200);
      } else {
        // fetching all projects
        this.allProjectsList = [];
        this.allProjectsMapInfo = [];
        // this.setBounds();
        this.isLoading = true;
        this.fetchAPIgoogleMapProject();
      }
    },
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");
* {
  box-sizing: border-box;
  margin: 0;
}
figure {
  margin: 0;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 500;
}
ul {
  list-style-type: none;
  padding: 0px;
}
/* .action_list {
  display: flex;
} */

.infiniteScrollLoader {
  font-size: 20px;
}
input {
  color: inherit;
  font: inherit;
  margin: 0;
  box-sizing: border-box;
}
input:focus {
  outline: none;
}
input:focus::-moz-focus-inner {
  border: 0;
  padding: 0;
}
input[type="search"] {
  -webkit-appearance: textfield;
  box-sizing: content-box;
}
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

a {
  text-decoration: none;
}
a:focus {
  outline: none;
  background-color: transparent;
}
a:active,
a:hover {
  outline: 0;
}

.input_field {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--step-250);
  background-color: var(--white);
  background-clip: padding-box;
  border: 1px solid var(--step-100);
  border-radius: 0.25rem;
}

.input_field {
  border: 1px solid var(--step-150);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  background-color: var(--white);
  padding: 13px 16px;
  font-size: var(--f14);
  box-sizing: border-box;
}
.tab_content {
  margin-top: 75px;
}

td a {
  text-decoration: none;
  color: inherit;
  display: block;
}

@media (max-width: 1200px) {
  .tab_content {
    margin-top: 60px;
  }
}
@media (max-width: 767px) {
  .tab_content {
    margin-top: 30px;
  }
}

.tab_content .map_area {
  border-radius: 16px;
  overflow: hidden;
  height: calc(100vh - 250px);
  border: 1px solid var(--step-100);
}
.tab_content .map_area iframe {
  height: 100%;
}
@media (max-width: 767px) {
  .tab_content .map_area {
    margin: 0 -24px;
    border-radius: 0;
    border-right: 0;
    border-left: 0;
    height: calc(100vh - 114px);
  }
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border-radius: 12px;
  border-collapse: separate;
}
tbody tr {
  background-color: var(--white);
  -webkit-transition: background-color 800ms linear;
  -moz-transition: background-color 800ms linear;
  -o-transition: background-color 800ms linear;
  -ms-transition: background-color 800ms linear;
  transition: background-color 800ms linear;
}
tbody tr:hover {
  background-color: #dfdfdf;
  cursor: pointer;
}
td,
th {
  padding: 0;
}

@media (max-width: 1200px) {
  table {
    display: block;
    background-color: transparent;
  }
}
.table_section table thead tr th {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
}

.table_section {
  overflow-x: auto;
  height: 700px;
  border-radius: 10px;
}

.table_section table th,
.table_section table td {
  padding: 16px;
}
.table_section table th .date,
.table_section table td .date {
  white-space: nowrap;
}
@media (max-width: 1200px) {
  .table_section table thead {
    display: none;
  }
}
.table_section table thead tr th {
  padding-top: 16px;
  padding-bottom: 16px;
  text-align: left;
  color: var(--primary);
  font-size: var(--f14);
  text-transform: uppercase;
  border-top: 1px solid var(--step-100);
  white-space: nowrap;
}
.table_section table thead tr th:first-child {
  border-left: 1px solid var(--step-100);
}
.table_section table thead tr th:last-child {
  border-right: 1px solid var(--step-100);
}
.table_section table thead tr:first-child th:first-child {
  border-top-left-radius: 10px;
}
.table_section table thead tr:first-child th:last-child {
  border-top-right-radius: 10px;
}
@media (max-width: 1200px) {
  .table_section table tbody {
    display: block;
    width: 100%;
  }
}
@media (max-width: 1200px) {
  .table_section table tbody tr {
    display: flex;
    flex-wrap: wrap;
    padding: 24px 32px 24px 24px;
    position: relative;
    background: var(--white);
    border: 1px solid var(--step-100);
    border-radius: 4px;
  }
  .table_section table tbody tr:not(:last-child) {
    margin-bottom: 16px;
  }
}
@media (max-width: 1200px) and (max-width: 767px) {
  .table_section table tbody tr:not(:last-child) {
    margin-bottom: 8px;
  }
}
@media (max-width: 1200px) {
  .table_section table tbody tr .act_text {
    display: block;
    margin-left: 8px;
  }
}
@media (min-width: 1281px) {
  .table_section table tbody tr td {
    border-bottom: 1px solid var(--step-100);
    vertical-align: middle;
  }
  .table_section table tbody tr td:first-child {
    border-left: 1px solid var(--step-100);
  }
  .table_section table tbody tr td:last-child {
    border-right: 1px solid var(--step-100);
  }
}
.table_section table tbody tr td .action_btn {
  display: flex;
}
.table_section table tbody tr td .action_btn .btn {
  background-color: var(--white);
  padding: 8px;
  border: 1px solid var(--step-100);
  box-shadow: none;
  min-width: 32px;
  height: 32px;
  transition: all ease-in-out 0.35s;
  padding: 6px;
}
.table_section table tbody tr td .action_btn .btn:not(:last-child) {
  margin-right: 12px;
}
.table_section table tbody tr td .action_btn .btn span {
  color: var(--step-200);
  font: 14px;
}
.table_section table tbody tr td .action_btn .btn:hover {
  background-color: var(--step-100);
}
.table_section table tbody tr td .action_btn .btn:hover span {
  color: var(--primary);
}
@media (max-width: 1200px) {
  .table_section table tbody tr td {
    padding: 0;
  }
  .table_section table tbody tr td.address_td {
    flex-grow: 1;
    flex: 0 0 100%;
  }
  .table_section table tbody tr td.title_td {
    flex-grow: 1;
  }
}
.empty-list {
  justify-content: center;
}
@media (max-width: 1200px) and (max-width: 767px) {
  .table_section table tbody tr td.title_td {
    margin-top: 12px;
    /* padding-left: 25%; */
  }
  td.title_td {
    width: 50%;
  }
}
.design_count {
  text-align: center;
}
@media (max-width: 1200px) {
  .table_section table tbody tr td.title_td.grow_td {
    margin-left: 84px;
  }
}
@media (min-width: 1200px) {
  .title_td_count {
    text-align: start;
  }
}

@media (max-width: 1200px) and (max-width: 767px) {
  .table_section table tbody tr td.title_td.grow_td {
    margin-left: 0;
  }
}
@media (max-width: 1200px) {
  .table_section table tbody tr td.title_td:not(:last-child) {
    padding-right: 12px;
  }
  .table_section table tbody tr td.md_dot {
    position: absolute;
    right: 16px;
    cursor: pointer;
  }
  .table_section table tbody tr td.md_dot .action_btn {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    opacity: 0;
    visibility: hidden;
    transition: all ease-in-out 0.4s;
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list {
    width: 152px;
    border-radius: 4px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
    border: solid 1px var(--step-100);
    background: var(--white);
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list li {
    display: flex;
    width: 100%;
    padding: 4px 8px;
    align-items: center;
  }
  .table_section
    table
    tbody
    tr
    td.md_dot
    .action_btn
    .action_list
    li:not(:last-child) {
    border-bottom: 1px solid var(--step-100);
  }
  .table_section table tbody tr td.md_dot .action_btn .action_list li .btn {
    padding: 0;
    border: 0;
    width: 24px;
    height: 24px;
    margin: 0;
  }
  .table_section table tbody tr td.md_dot.active .action_btn {
    opacity: 1;
    visibility: visible;
  }
  .table_section table tbody tr td .value_type,
  .table_section table tbody tr td .date {
    margin-top: 4px;
    display: block;
  }
}
@media (min-width: 1201px) {
  .action_list {
    display: flex;
  }
  .dot,
  .md_head,
  .act_text {
    display: none;
  }
}
.md_head,
.sr_value {
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  min-width: max-content;
}

@media (min-width: 1281px) {
  .table_section table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }
  .table_section table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }
}
.table_section.table_normal table {
  border-collapse: collapse;
  width: 100%;
  border: 0;
}
.table_section.table_normal table td,
.table_section.table_normal table th {
  padding: 12px;
  text-align: left;
  font-size: 14px;
}
@media (min-width: 1281px) {
  .table_section.table_normal table td:first-child,
  .table_section.table_normal table th:first-child {
    padding-left: 0;
    border-left: 0;
  }
  .table_section.table_normal table td:last-child,
  .table_section.table_normal table th:last-child {
    padding-right: 0;
    border-right: 0;
  }
}
.table_section.table_normal table thead tr th {
  border-bottom: solid 2px var(--step-100);
  border-top: 0;
  font-weight: 500;
  background: var(--white);
}
.table_section.table_normal table thead tr th.action-title {
  text-align: right;
}
@media (max-width: 1024px) {
  .table_section.table_normal table tbody tr {
    padding: 0;
  }
}
@media (min-width: 1281px) {
  .table_section.table_normal table tbody tr td {
    display: table-cell;
    border-bottom: solid 1px var(--step-100);
  }
}
@media (max-width: 1200px) {
  .table_section.table_normal table tbody tr td {
    width: 33.333%;
  }
}
@media (max-width: 767px) {
  .table_section.table_normal table tbody tr td {
    width: 80%;
  }
}
.table_section.table_normal table tbody tr td.no_border {
  border: 0;
}
.project_info {
  display: flex;
}
.project_info figure {
  margin: 0 12px 0 0;
  border: 1px solid var(--step-100);
  border-radius: 8px;
  width: 80px;
  min-width: 80px;
  height: 80px;
  overflow: hidden;
}
.project_info figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 1200px) {
  .project_info figure {
    width: 72px;
    min-width: 72px;
    height: 72px;
  }
}
.project_info .project_content h5 {
  line-height: normal;
  color: var(--step-250);
  font-size: var(--f18);
  font-weight: 500;
  word-break: break-word;
}
.project_info .project_content em {
  line-height: 1;
  color: var(--step-200);
  font-size: var(--f14);
  font-weight: normal;
  margin-top: 8px;
  display: block;
}
.project_info .project_content p {
  line-height: normal;
  color: var(--step-200);
  font-size: var(--f16);
  font-weight: normal;
  margin-top: 8px;
  max-width: 100%;
  word-break: break-word;
}
@media (max-width: 1200px) {
  .project_info .project_content h5 {
    font-size: var(--f16);
  }
  .project_info .project_content p {
    font-size: var(--f12);
  }
}

.right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}
.right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}

.content_section {
  padding: 32px;
  min-height: calc(100vh - 100px);
}
@media (max-width: 767px) {
  .content_section {
    overflow: hidden;
  }
}
@media (min-width: 1281px) {
  .content_section {
    padding: 32px 64px;
  }
}
@media (max-width: 767px) {
  .content_section {
    padding: 24px;
    min-height: calc(100vh - 56px);
  }
}
.content_section .title {
  font-size: var(--f24);
  color: var(--primary);
  flex-flow: 1;
  padding-right: 12px;
}
@media (max-width: 767px) {
  .content_section .title {
    font-size: 24px;
    padding-right: 0;
    /* width: 100% !important; */
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }

  .projectTitle{
    margin-left: 0px !important;
  }
}
.content_section .filter_section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}
@media (min-width: 1281px) {
  .content_section .filter_section {
    position: fixed;
    padding: 30px 3px;
    background: var(--step-50);
    margin-top: -40px;
    min-width: calc(100vw - 388px);
  }
}
@media (max-width: 1200px) and (min-width: 767px) {
  .content_section .filter_section {
    position: fixed;
    padding: 25px 3px 11px;
    background: var(--step-50);
    margin-top: -40px;
    min-width: calc(100vw - 60px);
    z-index: 1;
  }
}
@media (max-width: 767px) {
  .content_section .filter_section {
    margin-top: 0px;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .content_section .filter_section .filter_area {
    width: auto;
    gap: 16px;
  }

  .content_section .filter_section .filter_area .project_btn {
    margin-left: 0px !important;
  }
}
.content_section .filter_section .filter_area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* @media (max-width: 767px) {
  .content_section .filter_section .filter_area {
    position: fixed;
    top: 12px;
    right: 24px;
    z-index: 432;
    padding-right: 32px;
  }
} */
.content_section .filter_section .filter_area .search_field {
  margin-right: 16px;
  width: 310px;
  position: relative;
}

.content_section .filter_section .filter_area .search_field .input_field {
  padding-right: 32px;
  transition: all ease-in-out 0s;
  box-sizing: border-box;
  z-index: 0;
}
@media (min-width: 1281px) {
  .content_section .filter_section .filter_area .search_field .input_field {
    min-width: 250px;
  }
}

@media (max-width: 767px) {
  .content_section .filter_section .filter_area .search_field .search {
    position: absolute;
    right: 5%;
    color: var(--step-200);
    cursor: pointer;
    z-index: 1;
    top:3px;
    font-size: 22px;
  }

  .moveRight {
    right: 30% !important;
  }
}

@media (min-width: 767px) {
  .content_section .filter_section .filter_area .search_field .search {
    position: absolute;
    right: 5%;
    top: 35%;
    color: var(--step-200);
    cursor: pointer;
    z-index: 1;
  }
}

.crossIcon{
  position: absolute;
    right: 4%;
    top: 25%;
    cursor: pointer;
    z-index: 1;
}

@media (max-width: 767px) {
  .crossIcon{
    right: 4%;
    top: 5%;
}
  .content_section .filter_section .filter_area .search_field {
    order: 2;
    margin: 0;
    /* position: absolute; */
    right: 0;
    width: 32px;
    height: 30px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .content_section .filter_section .filter_area .search_field .input_field {
    height: 38px;
    padding: 10px 12px;
    top: -6px;
    right: 0px;
    position: absolute;
    transition: all ease-in-out 0s;
    width: calc(100vw - 48px);
    visibility: visible ;
    opacity: 1 !important;
  }
  .content_section .filter_section .filter_area .search_field  .isSearchEnabled {
    visibility: hidden !important;
  }

  .content_section
    .filter_section
    .filter_area
    .search_field.active
    .input_field {
    visibility: visible;
    max-width: none;
    min-width: calc(100vw - 32px);
    opacity: 1 !important;
  }
}
.content_section .filter_section .filter_area .project_btn {
  margin-left: 16px;
}
@media (max-width: 1200px) {
  .content_section .filter_section .filter_area .project_btn {
    display: block !important;
  }
}
.content_section .filter_section .filter_area .view_type {
  display: flex;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
}
.content_section .filter_section .filter_area .view_type .tab_list {
  border: 1px solid var(--step-100);
  margin-right: -1px;
  overflow: hidden;
  padding: 15px 16px;
  cursor: pointer;
  background-color: var(--white);
  color: var(--step-200);
  transition: all ease-in-out 0s;
  display: flex;
  align-items: center;
}
@media (max-width: 767px) {
  .content_section .filter_section .filter_area .view_type .tab_list {
    padding: 8px 12px;
  }
}
.content_section .filter_section .filter_area .view_type .tab_list:first-child {
  border-radius: 4px 0 0 4px;
}
.content_section .filter_section .filter_area .view_type .tab_list:last-child {
  border-radius: 0px 4px 4px 0px;
}
.content_section .filter_section .filter_area .view_type .tab_list span {
  font-size: 15px;
  color: var(--step-200);
}
.content_section
  .filter_section
  .filter_area
  .view_type
  .tab_list
  span.stacklist-icon {
  font-size: 12px;
}
.content_section
  .filter_section
  .filter_area
  .view_type
  .tab_list
  span.list_text {
  margin-left: 8px;
}
@media (max-width: 767px) {
  .content_section
    .filter_section
    .filter_area
    .view_type
    .tab_list
    span.list_text {
    display: none;
  }
}
.content_section .filter_section .filter_area .view_type .tab_list:hover,
.content_section .filter_section .filter_area .view_type .tab_list.active {
  background-color: var(--step-100);
  color: var(--white);
}
.content_section .filter_section .filter_area .view_type .tab_list:hover span,
.content_section .filter_section .filter_area .view_type .tab_list.active span {
  color: var(--white);
}
.content_section .filter_section .filter_area .view_type .tab_list.active {
  background-color: var(--primary);
  border-color: var(--primary);
}

.btn {
  color: var(--dark);
  background-color: var(--step-0);
  border: 1px solid var(--step-150);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  font-size: var(--f14);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.84rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  box-shadow: 0 1px 2px 0 var(--step-150);
}
.btn.btn-primary {
  border-color: var(--danger);
  background-color: var(--tertiary);
  background-image: linear-gradient(to bottom, var(--danger), #3092f7);
  color: var(--white);
}

.create_list {
  width: 100%;
  text-align: center;
  min-height: 56vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.create_list figure {
  margin: 0;
  text-align: center;
}
.create_list figure img {
  cursor: pointer;
}
.create_list .info_content p {
  max-width: 400px;
  font-size: var(-f16);
  line-height: 2;
  color: var(--step-250);
  font-weight: normal;
  margin: 8px auto 0;
  text-align: center;
}
.creator_name {
  max-width: 12ch;
  word-break: break-word;
}

.client_name {
  max-width: 12ch;
  word-break: break-word;
}

@media (max-width: 767px) {
  /* .content_section .filter_section .filter_area .project_btn {
    position: absolute;
    top: 190%;
    right: 4%;
  } */

  .btn {
    padding: 6px 10px;
  }

  .content_section .filter_section .filter_area .search_field{
    margin-top: 6px !important;
  }

  .table_section table tbody tr td.title_td{
    margin-top: 24px !important;
  }

  
}



@media (min-width: 767px) and (max-width: 875px) {
.content_section .filter_section .filter_area .search_field {
    margin-right: 16px;
    width: 215px !important;
    position: relative;
  }
}

@media (max-width: 450px) {
  .content_section .filter_section {
    flex-direction: column;
    align-items: flex-start;
  }

  .content_section .filter_section .filter_area {
    width: 100%;
  }

  .content_section .filter_section .filter_area .project_btn {
    margin-left: 14vw !important;
  }
}


</style>
