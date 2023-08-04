<template>
  <div class="otContainer">
    <div class="btnContainer">
      <el-tooltip :disabled="team.length != 5" placement="top" effect="dark" content="You can only add five team">
        <el-button
          type="primary"
          class="addBtn"
          @click="AddMemberPopup()"
          >Add New Member</el-button
        >
      </el-tooltip>  
    </div>
    <div class="container" v-if="team.length">
      <div v-for="(member,index) in team" :key="index" :id="index" class="FAQcontainer">
        <div class="flexContainer">
          <img v-if="member.image" :src="member.image" class="userImg" />
          <img v-else src="../../../../assets/img/person-fill.svg" class="userImg" />
        </div>
        <div class="flexAnsContainer">
          <div class="flexContainerName">
            <p class="userName">{{member.name}}</p>
            <div class="flexIcon desktopIcon">
              <el-tooltip
                class="item"
                effect="dark"
                content="Edit"
                placement="top-start"
              >
              <i class="icon edit-alt" :id="index" @click="EditMemberPopup($event)"/>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete"
                placement="top-start"
              >
                <i
                  class="icon delete-alt" :id="index" @click="DeleteMemberPopup($event)"
                />
              </el-tooltip>
            </div>
          </div>
          <p class="designation">{{member.position}}</p>
          <p class="description">{{member.description}}</p>
          <div class="flexIcon mobileIcon">
            <el-tooltip
              class="item"
              effect="dark"
              content="Edit"
              placement="top-start"
            >
              <i class="icon edit-alt" :id="index" @click="EditMemberPopup($event)"/>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="Delete"
              placement="top-start"
            >
              <i class="icon delete-alt"  :id="index" @click="DeleteMemberPopup($event)"/>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div class="emptyContainer" v-else>
      <p class="emptyContent">
        You will have the option to add our team page to your sales proposal
        while downloading the report and the members you add here will be
        visible on your sales proposal. Click 'Add New Member' button above to
        add a member.
      </p>
    </div>
    <AddMemberPopup
      v-if="isAddMemberPopupVisible"
      :mode="mode"
      :isAddMemberPopupVisible.sync="isAddMemberPopupVisible"
      :formProp="editMember"
      :teamProp="team"
      :index="index"
    />
    <DeleteOurTeamPopup
      v-if="isDeleteOurTeamPopupVisible"
      :isDeleteOurTeamPopupVisible.sync="isDeleteOurTeamPopupVisible"
      @cancelDelete="isDeleteOurTeamPopupVisible = false"
      :index="index"
      :teamProp="team"
    />
  </div>
</template>

<script>
import AddMemberPopup from "./addMemberPopup.vue";
import DeleteOurTeamPopup from "./deleteOurTeamPopup.vue";

export default {
  name: "ourTeam",
  components: {
    AddMemberPopup,
    DeleteOurTeamPopup,
  },

  mounted() {
    this.teamSize()
      },
  props: {
    team_members : "",
  },
  data() {
    return {
      isAddMemberPopupVisible: false,
      isDeleteOurTeamPopupVisible: false,
      addMember: true,
      team: [],
      editMember:{
        name: "",
        image:"",
        position: "",
        description: "",
      },
      mode:"",
      index:"",
    };
  },

  methods:{
    EditMemberPopup(event) {
      this.mode='edit';
      this.index= event.currentTarget.id;
      this.editMember.name= this.team[this.index].name;
      this.editMember.position=this.team[this.index].position;
      this.editMember.image=this.team[this.index].image;
      this.editMember.description=this.team[this.index].description;
      this.isAddMemberPopupVisible = true;
    },
    AddMemberPopup() {
      this.index=this.team.length;
      this.mode='add';
      if(this.index >=5)
      {
        this.$message({
          showClose: true,
          message: "Cannot add more than 5 members",
          type: "error",
          center: true
        });
      }
      else
      this.isAddMemberPopupVisible = true
    },
    DeleteMemberPopup(event) {
      this.index = event.currentTarget.id;
      this.isDeleteOurTeamPopupVisible = true;
    },
    teamSize() {
      this.team = (this.team_members === null ? [] : this.team_members);
    },
  }
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
}

.flexContainer {
  margin-right: 32px;
  max-height: 112px;
  max-width: 112px;
  min-width: 112px;
  border-radius: 50%;
}

.userImg {
  height: 112px;
  width: 112px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc
}

.flexContainerName {
  display: flex;
  align-items: center;
}

.userName {
  font-size: 24px;
  color: #1c3366;
  word-break: break-all;
  white-space: pre-wrap;
}

.designation {
  margin-top: 10px;
  margin-bottom: 12px;
  font-size: 16px;
  color: #222;
  word-break: break-all;
  white-space: pre-wrap;

}

.description {
  font-size: 16px;
  color: #222;
  word-break: break-all;
  line-height: 1.5;
  white-space: pre-wrap;
}

.flexIcon {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.edit-alt {
  font-size: 30px;
  color: #777777;
  margin-right: 8px;
  cursor: pointer;
}

.delete-alt {
  font-size: 22px;
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
  width: 705px;
  word-break: break-word;
  text-align: center;
}

.mobileIcon {
  display: none;
}

@media screen and (max-width: 550px) {
  .FAQcontainer {
    padding: 16px;
    flex-direction: column;
  }

  .flexContainer {
    margin: 0px auto;
  }

  .flexContainerName {
    justify-content: center;
  }

  .designation,
  .userName {
    text-align: center;
  }

  .edit-alt {
    font-size: 34px;
  }

  .desktopIcon {
    display: none;
  }

  .delete-alt{
    font-size: 26px;
  }

  .mobileIcon {
    display: flex;
    margin-left: -6px;
    margin-top: 10px;
  }
}
</style>

