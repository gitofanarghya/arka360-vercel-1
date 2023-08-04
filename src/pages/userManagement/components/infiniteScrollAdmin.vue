<template>
  <div id="usersInfiniteScroll">
    <el-select
      id="userSelected"
      v-model="selectedUser"
      @change="$emit('update:user', selectedUser)"
      :remote-method="searchUsers"
      :loading="loading"
      class="projectSharing"
      style="width: 100%"
      value-key="id"
      filterable
      multiple
      remote
      reserve-keyword
      placeholder="Enter names or email addresses"
      :popper-class="theme"
    >
      <el-option
        v-for="currUser in usersList"
        :key="currUser.id"
        :label="`${currUser['first_name']} ${currUser['last_name']}`"
        :value="currUser.id"
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
      type: Array,
      default: () => [],
    },
    theme: {
      type: String,
      default: "lightDropdown",
    },
  },
  data() {
    return {
      selectedUser: {},
      usersList: [],
      loading: false,
      scrollState: "",
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
        const response = await API.USERS.FETCH_ALL_ADMINS();

        this.nextURL = response.data.next;
        this.usersList = JSON.parse(JSON.stringify(response.data.results));
        this.scrollState.reset();
      } catch (e) {
        console.error();
      }
    },

    async loadMoreUsersHelper(url, $state) {
      try {
        const response = await API.USERS.LOAD_MORE_USERS(url);

        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        for (let i = 0; i < response.data.results.length; i++) {
          this.usersList.push(response.data.results[i]);
        }

        $state.loaded();
      } catch (e) {
        console.error();
      }
    },

    async searchUsersHelper(query) {
      try {
        const response = await API.USERS.SEARCH_ADMINS(query);
        this.usersList = [];
        this.usersList = JSON.parse(JSON.stringify(response.data.results));
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
      } catch (e) {
        this.scrollState.error();
        console.error();
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
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.searchUsersHelper(query);
        }, 200);
      } else {
        this.usersList = [];
        this.fetchAllUsers();
      }
    },
  },

  mounted() {
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
  height: 100%;
  font-size: 12px;
  border-radius: 4px 0px 0px 4px;
}

.el-select {
  height: 100%;
}

.el-select >>> .el-input {
  height: 100%;
}
</style>
