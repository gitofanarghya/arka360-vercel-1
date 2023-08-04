<template>
  <div>
    <el-dialog
      title="Select Incentive"
      :visible="selectDialogFormVisible"
      @close="closeIconHandller"
      id="selectIncentiveDialog"
      append-to-body
    >
              <div class="field_group">
            <input
              class="input_field"
              type="text"
              placeholder="Search Incentive"
              v-model="searchText"
              style="border-radius: 4px !important; height: 5vh;"
            />
            <i
              class="el-icon-search"
              v-if="searchText===''"
              style="position: absolute; right: 20px; top: 33%;"
            ></i>
             <i
              v-else
              @click="searchText=''"
              class="el-icon-close"
              style="position: absolute; right: 20px; top: 33%;"
            ></i>
          </div>
      <div class="table_section table_normal" v-loading="!isDataLoaded">
        <table class="data_table">
          <tr v-for="(item, index) in filteredList" :key="item.id" :style="[index%2===0 ? {'background': '#f7f7f7'} : {'background': '#fff'}]">
            <td style="width:72rem; padding-left: 1.25rem;">
              <div class="incentiveName">{{ item.name }}</div>
              <div class="value_type" style="word-break:keep-all;">
                {{ item.description }}
              </div>
            </td>
            <td style="padding-right: 1.25rem;">
              <el-button
                @click="isAdded(item)"
                :loading="item.addOrAdded === `Adding..`"
                :style="[item.addOrAdded === `Add`? {color: '#409EFF', border: 'solid 1px #409eff', width: '6rem', 'font-weight': '600'} : {border: 'solid 1px #999', color: '#999999', width: '6rem', 'font-weight': '600'}]">{{
                item.addOrAdded
              }}</el-button>
            </td>
          </tr>
        </table>  
      </div>
      <div
        v-infinite-scroll="getMoreIncentives"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="10"
        style="text-align: center">
        <i v-if="busy" class="el-icon-loading infiniteScrollLoader"/>
      </div>  
    </el-dialog>
  </div>
</template>

<script>
import {mapState} from "pinia";
import { useDesignStore } from "../../../../stores/design";
import { useProjectStore } from "../../../../stores/project";
import Vue from "vue";
import debounce from "debounce";
import API from "@/services/api/";
import infiniteScroll from 'vue-infinite-scroll'

Vue.use(infiniteScroll)

export default {
  name: "selectIncentive",
  emits: ["close", "added"],
  props: {
    selectDialogFormVisible: {
      type: Boolean,
      default: false,
    },
    selectedIncentivesData: {
      default: () => [],
    },
  },
  data() {
    return {
      isDataLoaded: false,
      searchText: "",
      busy: false,
      allIncentives: [],
      totalIncentives: null,
      incentiveType: "",
      baseOn: "",
      loading: false,
      addorAdded: "Add",
      addArray: [],
      incentiveTypes: [
        {
          label: "Fixed Grant",
          value: "Fixed Grant",
        },
        {
          label: "System Cost Based Grant",
          value: "System Cost Based Grant",
        },
        {
          label: "System Production Based Grant",
          value: "System Production Based Grant",
        },
        {
          label: "System Size Based Grant",
          value: "System Size Based Grant",
        },
      ],
      basedOn: [
        {
          label: "AC",
          value: "ac",
        },
        {
          label: "DC",
          value: "dc",
        },
      ],
      formLabelWidth: "120px",
    };
  },
  methods: {
    closeIconHandller() {
      this.$emit("close");
    },
    async isAdded(item) {
      if (item.addOrAdded !== "Add") { return }
      this.addArray.push(item.id);
      item.addOrAdded = "Adding..";
      if(this.$route.params.designId || this.designDataFull.id){
        await API.INCENTIVE_INFORMATION.UPDATE_ADDED_INCENTIVE_LIST(
          {
            incentives: this.addArray,
          },
          this.$route.params.designId || this.designDataFull.id
        );
        this.$emit("added");
      }
      else{
        let response = await API.INCENTIVE_INFORMATION.SELECT_MULTIPLE_INCENTIVES_FROM_EXPERT_SERVICE(
          {
            incentives: this.addArray,
          }
        )
        this.$emit("added",response);
      }
      item.addOrAdded = "Added";
      // this.$emit("added",response);
    },
    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }
      if (this.nextUrl) {
        this.loadMoreIncentives();
      } else {
        this.loading = false;
      }
    },
    async loadMoreProjectsHelper() {
      try {
        const response = await API.PROJECTS.LOAD_MORE_PROJECTS(this.nextUrl);
        this.assignAPIResponseWithMapRefresh(response);
        // this.setBounds();
        this.busy = false;
      }
      catch (error) {
        console.error(error);
      }
    },

    getMoreIncentives() {
      if (!this.nextUrl) {
        this.busy = false
        return
      }
      this.busy = true;
      this.loadMoreIncentives();
    },
    async getIncentives() {
      try {
        this.isDataLoaded = false;
        this.busy = false
        const response = await API.INCENTIVE_INFORMATION.FETCH_INCENTIVES();
        this.totalIncentives = response.data.count;
        this.nextUrl = response.data.next;
        this.allIncentives = response.data.results;
        this.allIncentives = this.allIncentives.map((v) => ({
          ...v,
          addOrAdded: "Add",
        }));
        if(this.$route.params.designId || this.designDataFull.id){
          var currArray = this.incentivesData;
          this.addArray = currArray.map((a) => a.id);
        }else{
          this.addArray = this.selectedIncentivesData.map((a) => a.id);
        }
        // const incResponse = await API.INCENTIVE_INFORMATION.SELECTED_INCENTIVE_LIST(
        //   this.$route.params.designId
        // );
        // let currArray = incResponse.data.incentives;
        let selectedArray = this.addArray;
        this.allIncentives.forEach(function(obj) {
          if (selectedArray.includes(obj.id)) obj.addOrAdded = "Added";
        });
        this.isDataLoaded = true;
      } catch (error) {
        console.log(error);
      }
    },
    async loadMoreIncentives() {
      if (!this.nextUrl) { return }
      
      let moreIncentives = await API.INCENTIVE_INFORMATION.LOAD_MORE_INCENTIVES(
        this.nextUrl
      );
      this.allIncentives.push(...moreIncentives.data.results);
      this.allIncentives = this.allIncentives.map((v) => ({
        ...v,
        addOrAdded: "Add",
      }));
      let selectedArray = this.addArray;

      this.allIncentives.forEach(function(obj) {
        if (selectedArray.includes(obj.id)) obj.addOrAdded = "Added";
      });
      this.nextUrl = moreIncentives.data.next;
      this.busy=false;
    },
    async searchIncentives(value) {
      let response = await API.INCENTIVE_INFORMATION.SEARCH_ALL_INCENTIVES(
        value
      );
      this.totalIncentives = response.data.count;
      this.nextUrl = response.data.next;
      this.allIncentives = response.data.results;
      this.allIncentives = this.allIncentives.map((v) => ({
        ...v,
        addOrAdded: "Add",
      }));
      // const incResponse = await API.INCENTIVE_INFORMATION.SELECTED_INCENTIVE_LIST(
      //   this.$route.params.designId
      // );
      let currArray = this.incentivesData;
      this.addArray = currArray.map((a) => a.id);
      let selectedArray = this.addArray;
      this.allIncentives.forEach(function(obj) {
        if (selectedArray.includes(obj.id)) obj.addOrAdded = "Added";
      });
    },
      //       getMoreIncentives($state) {
      //       this.scrollState = $state;
      //       if (this.nextUrl !== null) {
      //           this.getMoreIncentivesHelper(this.nextUrl, $state);
      //       }
      //       else {
      //           $state.complete();
      //           this.isScrollStateToBeReset = true;
      //       }
      //   },
      //       async getMoreIncentivesHelper(url, $state) {
      //       try {
      // let moreIncentives = await API.INCENTIVE_INFORMATION.LOAD_MORE_INCENTIVES(
      //   this.nextUrl
      // );
      // this.allIncentives.push(...moreIncentives.data.results);
      // this.allIncentives = this.allIncentives.map((v) => ({
      //   ...v,
      //   addOrAdded: "Add",
      // }));
      // let selectedArray = this.addArray;

      // this.allIncentives.forEach(function(obj) {
      //   if (selectedArray.includes(obj.id)) obj.addOrAdded = "Added";
      // });
      // this.nextUrl = moreIncentives.data.next;
      //           $state.loaded();
      //       }
      //       catch (e) {
      //           $state.error();
      //           console.error();
      //       }
      //   },
  },
  created() {
    this.getIncentives();
    this.searchIncentives = debounce(this.searchIncentives, 1000);
  },
  computed: {
    ...mapState(useDesignStore,{
        incentivesData: 'GET_DESIGN_INCENTIVES_INFORMATION',
        designDataFull: (state) => state
    }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),
   filteredList() {
      // return this.allIncentives.filter((str) =>
      //   str.name.toLowerCase().includes(this.searchText.toLowerCase())
      // );
      return this.allIncentives;
    },
  },
  watch: {
    searchText: {
      handler(val) {
        this.searchIncentives(val);
      },
    },
    selectDialogFormVisible: {
      handler(val) {
        if (val === true) {
          this.getIncentives();
        } else {
          this.busy = false
        }
      },
    },
  },
};
</script>

<style scoped>
.right_spacing {
  margin-right: 1rem;
  width: -webkit-fill-available;
}
#selectIncentiveDialog >>> .el-select {
  display: inline-block;
  position: relative;
  width: -webkit-fill-available;
}

#selectIncentiveDialog >>> .el-dialog__footer {
  text-align: center !important;
}

#selectIncentiveDialog >>> .el-dialog {
  width: 63%;
  border-radius: 8px;
}

#selectIncentiveDialog >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#selectIncentiveDialog >>> .el-dialog__header {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  justify-content: flex-start;
  background-color: #e8edf2;
  margin-bottom: 0 !important;
  height: 3.5rem;
  padding-left: 1.25rem !important;
}

#selectIncentiveDialog >>> .el-dialog__body {
  display: grid;
  grid-template-rows: 13%;
  padding: 0 !important;
  height: 66vh;
  overflow-y: scroll;
  border-radius: 8px !important;
}

#selectIncentiveDialog >>> .el-dialog__title {
  font-family: "Helvetica Neue" !important;
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  color: #222222 !important;
}

.incentiveName {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 2;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

.value_type {
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: normal;
  text-align: left;
  color: #777;
}

#selectIncentiveDialog >>> .el-input--suffix .el-input__inner {
  background-color: var(--step-50) !important;
}

tr {
  border-top: 1px solid #ccc;
}
.table_section {
  margin-top: 0;
  overflow: visible;
}
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

#selectIncentiveDialog >>> .field_group{
    width: 20vw;
    margin: 16px 1.25rem 16px 0;
    margin-left: 66%;
}
  
@media (max-width: 1024px) {
  #selectIncentiveDialog >>> .field_group{
    width: 95.5%;
    margin: 16px 0px 16px 0;
    margin-left: 2%;
}
}

@media (max-width: 767px) {
  .incentiveName{
    font-size: 14px;
  }
  .value_type{
    font-size: 12px;
  }
  #selectIncentiveDialog >>> .el-dialog {
  width: 80vw;
  border-radius: 8px;
  z-index: 20000;
}
  #selectIncentiveDialog >>> .field_group>.input_field{
    margin-top: 0;
  }

}

</style>
