<template>
  <div id="usersInfiniteScroll" style="width: 100%;">
    <el-select
      id="userSelected"
      v-model="selectedUser"
      @change="$emit('update:user', selectedUser)"
      :disabled="isUserListDisabled"
      :remote-method="searchUsers"
      :loading="loading"
      class="projectSharing"
      style="width: 100%"
      value-key="id"
      filterable
      remote
      reserve-keyword
      @visible-change="onVisibleChange"
      :placeholder="!crmMode ?  'Enter name or email address' : 'Select Owner'"
      :popper-class="theme"
    >
      <el-option
        v-for="currUser in usersList"
        :key="currUser.id"
        :label="`${currUser['first_name']} - ${currUser['email']}`"
        :value="currUser"
      />
      <infinite-loading
        :distance="0"
        spinner="bubbles"
        @infinite="loadMoreUsers"
      >
        <div slot="no-more" style="color: #606266; font-size: 12px">
          No more users!!
        </div>
        <div slot="error" style="color: #606266; font-size: 12px">
          Error in fetching users, retry!!
        </div>
        <div slot="no-results" style="color: #606266; font-size: 12px">
          No more users!!
        </div>
      </infinite-loading>
    </el-select>
  </div>
</template>

<script>
import API from "@/services/api/";

export default {
  name: "usersScroll",
  props: {
    user: {
      type: Object,
      default() {
        return {};
      },
    },
    theme: {
      type: String,
      default: "lightDropdown",
    },
    isUserListDisabled:{
      type: Boolean,
      default: false,
    },
    crmMode:{
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      selectedUser: {},
      usersList: [],
      loading: false,
      scrollState: "",
      apiPromise: null,
      initialUsersList:[],
    };
  },

  watch: {
    user: {
      deep: true,
      handler(value) {
        this.selectedUser = JSON.parse(JSON.stringify(value));
      },
    },
  },

  methods: {
    async fetchAllUsers() {
      try {
        let promise = API.USERS.FETCH_ALL_USERS();
        this.apiPromise = promise
        this.loading = true;
        promise.then(response => {
          if (this.apiPromise != promise) { return }

          this.loading = false;

          this.nextURL = response.data.next;
          this.usersList = JSON.parse(JSON.stringify(response.data.results));
          this.initialUsersList = JSON.parse(JSON.stringify(response.data.results));
          this.scrollState.reset();
        })
      } catch (e) {
        this.loading = false;
        console.error(e);
      }
    },

    async loadMoreUsersHelper(url, $state) {
      try {
        let promise = API.USERS.LOAD_MORE_USERS(url);
        this.apiPromise = promise
        promise.then(response => {
          if (this.apiPromise != promise) { return }

          this.nextURL = response.data.next;
          this.prevURL = response.data.previous;
          for (let i = 0; i < response.data.results.length; i++) {
            this.usersList.push(response.data.results[i]);
          }
  
          $state.loaded();
        })

      } catch (e) {
        console.error();
      }
    },

    async searchUsersHelper(query) {
      try {
        let promise = API.USERS.SEARCH_USERS(query)
        this.apiPromise = promise
        this.loading = true;
        promise.then(response => {
          if (this.apiPromise != promise) { return }

          this.loading = false;
          
          this.usersList = [];
          this.usersList = JSON.parse(JSON.stringify(response.data.results));
          this.nextURL = response.data.next;
          this.prevURL = response.data.previous;
        })
      } catch (e) {
        this.loading = false;
        console.error(e);
      }
    },

    loadMoreUsers($state) {
      this.scrollState = $state;
      if (this.nextURL !== null) {
        this.loadMoreUsersHelper(this.nextURL, $state);
      } else {
        $state.complete();
      }
    },
    searchUsers(query) {
      if (query !== "") {
        setTimeout(() => {
          this.searchUsersHelper(query);
        }, 200);
      } else {
        this.usersList = [];
        this.fetchAllUsers();
      }
    },
    onVisibleChange(value){
      if(!value){  //after searching something, need to clear the value with the initial list of users after collapsing the dropdown
        this.usersList = JSON.parse(JSON.stringify(this.initialUsersList));
      }
    }
  },

  mounted() {
    if(this.crmMode)
    this.selectedUser = this.user;
    
    this.fetchAllUsers();
  },
};
</script>

<style type="text/css" scoped>
#usersInfiniteScroll {
  width: 100%;
  height: 2.7rem;
  margin-bottom: 8px;
}
.projectSharing >>> .el-input__inner {
    font-size: 16px !important;
    border-radius: 4px 0px 0px 4px;
    height: 48px;
    background-color: #e8edf2 !important;
    border: none !important;
    color: #222 !important;
}

.projectSharing >>> .el-input__inner::placeholder {
  font-size: 12px !important;
}


.el-select {
  height: 100%;
}

.el-select >>> .el-input {
  height: 100%;
}


  @media (max-width: 1140px) {
    .projectSharing >>> .el-input__inner::placeholder {
  font-size: 16px !important;
}
  }

</style>
