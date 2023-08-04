<template>
  <div class="parentContainer">
    <div class="btnContainer">
      <el-tooltip :disabled="addIndex != 4" placement="top" effect="dark" content="You can only add three previous projects">
        <el-button
        type="primary"
        class="addBtn"
        @click="addProjectPopup()"
        >Add Project</el-button
      >
      </el-tooltip>      
    </div>
    <div class="container" v-if="!isEmptyList">
      <div class="FAQcontainer">
        <div class="pCard" v-if="this.previous_projects.previous_project_one_name != null">
          <img v-if="previous_projects.previous_project_one_image" :src="previous_projects.previous_project_one_image" class="image" />
          <img v-else src="../../../../assets/img/unnamed (3).webp" class="image" />
          <div class="pContainer">
            <p class="projectName">{{previous_projects.previous_project_one_name}}</p>
            <!-- <p class="projectPlace">Place</p> -->
            <div class="flexIcon">
              <el-tooltip
                class="item"
                effect="dark"
                content="Edit"
                placement="top-start"
              >
                <i class="icon edit-alt" id="1" @click="editProjectPopup($event)"/>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete"
                placement="top-start"
              >
                <i
                  class="icon delete-alt"
                  @click="deleteProjectPopup($event)"
                  id="1"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="pCard" v-if="this.previous_projects.previous_project_two_name != null">
          <img v-if="previous_projects.previous_project_two_image" :src="previous_projects.previous_project_two_image" class="image" />
          <img v-else src="../../../../assets/img/unnamed (3).webp" class="image" />
          <div class="pContainer">
            <p class="projectName">{{previous_projects.previous_project_two_name}}</p>
            <!-- <p class="projectPlace">Place</p> -->
            <div class="flexIcon">
              <el-tooltip
                class="item"
                effect="dark"
                content="Edit"
                placement="top-start"
              >,
                <i class="icon edit-alt" id="2" @click="editProjectPopup($event)"/>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete"
                placement="top-start"
              >
                <i
                  class="icon delete-alt"
                  @click="deleteProjectPopup($event)"
                  id="2"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="pCard"  v-if="this.previous_projects.previous_project_three_name != null">
          <img v-if="previous_projects.previous_project_three_image" :src="previous_projects.previous_project_three_image" class="image" />
          <img v-else src="../../../../assets/img/unnamed (3).webp" class="image" />
          <div class="pContainer">
            <p class="projectName">{{previous_projects.previous_project_three_name}}</p>
            <!-- <p class="projectPlace">Place</p> -->
            <div class="flexIcon">
              <el-tooltip
                class="item"
                effect="dark"
                content="Edit"
                placement="top-start"
              >
                <i class="icon edit-alt" id="3" @click="editProjectPopup($event)"/>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete"
                placement="top-start"
              >
                <i
                  class="icon delete-alt"
                  @click="deleteProjectPopup($event)"
                  id="3"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="emptyContainer" v-else>
      <p class="emptyContent">
        You can add your three previous projects here, that you want to show to
        your customers in the report. Click 'Add Project' button above to add a
        project.
      </p>
    </div>

    <AddProjectPopup
      v-if="isAddProjectPopupVisible"
      :isAddProjectPopupVisible.sync="isAddProjectPopupVisible"
      :mode = "mode"
      :previousProjects = "previousProjects"
      :index = "index"
    />
    <DeleteProjectPopup
      :isDeleteProjectPopup="isDeleteProjectPopup"
      @cancelDelete="isDeleteProjectPopup = false"
      :previousProjects = "previousProjects"
      :index = "index"
    />
  </div>
</template>

<script>
import AddProjectPopup from "./addProjectPopup.vue";
import DeleteProjectPopup from "./deleteProjectPopup.vue";

export default {
  name: "previousProject",
  components: {
    AddProjectPopup,
    DeleteProjectPopup,
  },

  props : {
    previous_projects : "",
  },

  data() {
    return {
      isAddProjectPopupVisible: false,
      isDeleteProjectPopup: false,
      addProject: true,
      mode: "",
      index: "",
      previousProjects: this.previous_projects,
    };
  },
  computed: {
        addIndex(){
            return this.previous_projects.previous_project_one_name == null ? '1' : 
                   this.previous_projects.previous_project_two_name == null ? '2' :
                   this.previous_projects.previous_project_three_name == null ? '3' : '4';
        },
        isEmptyList() {
            return (this.previous_projects.previous_project_one_name == null && 
                    this.previous_projects.previous_project_two_name == null && 
                    this.previous_projects.previous_project_three_name == null) ? true : false;
        }
    },

  methods : {
    deleteProjectPopup(event) {
      this.isDeleteProjectPopup = true;
      this.index = event.currentTarget.id;
    },
    addProjectPopup() {
      this.mode = "add";
      this.index = this.addIndex;
      if(this.index ==4)
      {
        this.$message({
          showClose: true,
          message: "Cannot add more than 3 projects",
          type: "error",
          center: true
        });
      }
      else
        this.isAddProjectPopupVisible = true;
    },
    editProjectPopup(event) {
      this.mode='edit';
      this.index= event.currentTarget.id;
      this.isAddProjectPopupVisible = true;
    },
  },
};
</script>

<style scoped>
.btnContainer {
  text-align: end;
  margin-top: 8px;
}

.container {
  margin-top: 24px;
  overflow: hidden;
  overflow-y: scroll;
  max-height: 64vh;
}

.FAQcontainer {
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  grid-gap: 24px;
  flex-wrap: wrap;
}

.pCard {
  width: 296px;
  border-radius: 8px;
}

.image {
  width: 296px;
  height: 296px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #Ccc;
}

.pContainer {
  padding: 4px 0px 24px 0px;
}

.projectName {
  font-size: 20px;
  color: #1c3366;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.projectPlace {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  word-break: break-word;
}

.flexIcon {
  margin-top: 10px;
  margin-left: -8px;
  display: flex;
  align-items: center;
}

.edit-alt {
  font-size: 34px;
  color: #777777;
  margin-right: 8px;
  cursor: pointer;
}

.delete-alt {
  font-size: 26px;
  color: #777777;
  cursor: pointer;
}

.emptyContainer {
  margin-top: 24px;
  overflow: hidden;
  height: 64vh;
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.emptyContent {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  width: 550px;
  word-break: break-word;
  text-align: center;
}

@media (max-width: 500px) {
  .FAQcontainer {
    padding: 16px;
  }

}
</style>
