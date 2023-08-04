<template>
  <div>
    <div class="table_section table_normal">
      <table class="data_table">
        <thead class="headerSticky">
          <tr>
            <th>
              <div class="data_head pName">
                <span class="title_text">Utility Provider</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Tariff Rates</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Actions</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tariff, index) in computedTariffData" :key="index">
            <td class="smallScr" style="width: 65%;">
              <div class="md_head">Utility Provider</div>   
              <div class="value_type pName">
                  <div class="pNameData">
                    {{tariff.utility_provider_name}}
                  </div>
              </div>
            </td>
            <td style="width: 25%;">
              <div class="md_head">Tariff Rates</div>
              <div class="value_type">
                <span class="nowrap">
                  {{tariff.utility_rate_name}}
                </span>
              </div>
            </td>
            <td class="text-center action-delete" v-if="window.width >= 767" style="text-align: justify;">
              <div class="md_head">Actions</div>
              <div class="value_type">
                <span class="nowrap">
              <i
                class="icon copy-alt"
                style="font-size: 1.7rem; cursor: pointer;"
                @click="handleCopy(tariff)"
              />
              <i
                class="icon edit-alt"
                style="font-size: 1.7rem; cursor: pointer;"
                @click="handleEdit(tariff)"
                v-if="tariff.organisation"
              />
              <i
                class="icon delete-alt"
                style="font-size: 1.7rem; cursor: pointer;"
                @click="handleDelete(tariff.id)"
                v-if="tariff.organisation"
              />
            </span>
              </div>
            </td>
            <td v-else>
              <el-dropdown
                trigger="click"
                @command="handleCommand"
              >
                <span class="el-dropdown-link">
                  <span data-v-12684b02="" class="fas fa-ellipsis-v"></span>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    icon="icon copy-alt"
                    :command="{ name: 'copy', tariff: `${tariff}` }"
                    >Copy
                    </el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="tariff.organisation"
                    icon="icon edit-alt"
                    :command="{ name: 'edit', tariff: `${tariff}` }"
                    >Edit</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="tariff.organisation"
                    icon="icon delete-alt"
                    :command="{ name: 'delete', id: `${tariff.id}` }"
                    >Delete</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-infinite-scroll="loadMoreTariffs"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="10"
        style="text-align: center"
      >
        <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
      </div>
    </div>
    <CreateTariffPopup
      :createTariffPopup="createTariffPopup"
      :typeOfOperation="typeOfOperation"
      :tariffForId="tariffForId"
      :key="createCounter"
      @added="handleAdd()"
      @close="handleClose()"
    />
    <DeleteTariffPopup
      :tariffId="tariffId"
      :isDeleteTariffPopup="isDeleteTariffPopup"
      @close="handleClose()"
      @delete="handleAfterDelete()"
    />
  </div>
</template>
<script>
import DeleteTariffPopup from "./deleteTariff.vue";
import CreateTariffPopup from "./createTariffPopup.vue";

import API from "@/services/api/";
import { mapState, mapActions } from "pinia";
import { useGeographyStore } from "../../../stores/geography";
import { useProjectStore } from "../../../stores/project";


export default {
  name: "tabContainer",
  components: {
    DeleteTariffPopup,
    CreateTariffPopup,
  },
  props:{
    typeOfTariff: {
      type: String,
      default: "allTariffs",
    },
    searchQuery:{
      default: "",
      type: String
    }
  },
  data() {
    return {
      isDataLoading: true,
      createCounter: 0,
      deleteCounter: 0,
      tariffId: null,
      tariffForId: [],
      createTariffPopup: false,
      window: {
        width: 0,
        height: 0,
      },
      loading: false,
      tariffData: [],
      nextUrl: null,
      copyURL: "",
      previousUrl: "",
      busy: false,
      isDeleteTariffPopup: false,
      typeOfTariffLocal: this.$props.typeOfTariff,
      totalCount: 0,
      typeOfOperation: "Create"
    };
  },

  computed:{

    ...mapState(useGeographyStore, {
      countryDetails: "GET_COUNTRY_DETAILS",
    }),

    ...mapState(useProjectStore, {
        currencySymbol: 'GET_CURRENCY_SYMBOL',
    }),
    computedTariffData(){
      return this.tariffData;
    }
  },

  watch:{
    searchQuery:{
      handler(){
        this.handleSearch();
      }
    }
  },

  created(){
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.fetchCountryDetails();
  },

  mounted(){
    this.loadTariffData();
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {

    ...mapActions(useGeographyStore, {
      fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
    }),

    handleCommand(command) {
      if (command.name === "edit") {
        this.handleEdit(command.tariff);
      } else if (command.name === "copy") {
        this.handleCopy(command.tariff);
      } else if (command.name === "delete") {
        this.handleDelete(command.id);
      }
    },

    async loadTariffData(){
      this.loading = true;
      let response = null;
      if(this.typeOfTariff === 'allTariffs') {
        response =  await API.TOU.TARIFF_CRUD("Read");
      } else {
        response = await API.TOU.TARIFF_CRUD("Read", null, false);
      }
      this.previousUrl = response.data.previous;
      this.totalCount = response.data.count;
      this.tariffData = response.data.results;
      this.nextUrl = response.data.next;
      this.loadMoreTariffs();
    },

    loadMoreTariffs() {
      console.log(this.typeOfTariff, this.copyURL, this.nextUrl);
      if (this.copyURL == this.nextUrl) {
        return;
      }
      if (this.nextUrl !== null) {
        this.copyURL = this.nextUrl;
        this.busy = true;
        this.loadMoreOrdersCaller();
      }
    },

    async loadMoreOrdersCaller() {
      try {
        const response = await API.TOU.LOAD_MORE_TARIFF(
          this.nextUrl
        );
        this.assignAPIResponse(response);
        this.nextUrl = response.data.next;

        this.busy = false;
      } catch (error) {
        // console.error();
      }
    },

    async handleSearch(){
        this.loading = true;
          this.loading = false;
          if(this.searchQuery){
            await this.loadSearchTariffData();
          } else {
            await this.loadTariffData();
          }
          this.loadMoreTariffs();
    },

    async loadSearchTariffData(){
      let isAll = this.typeOfTariff=="allTariffs" ? true : false;
      let response = await API.TOU.SEARCH_TARIFF(this.searchQuery, isAll);
      this.previousUrl = response.data.previous;
      this.totalCount = response.data.count;
      this.tariffData = response.data.results;
      this.nextUrl = response.data.next;
    },

    assignAPIResponse(response) {
      const data = response.data.results;
      this.tariffData = this.tariffData.concat(data);
      this.nextUrl = response.data.next;
    },

    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },

    handleCopy(tariff){
      this.typeOfOperation = "Copy";
      this.tariffForId = tariff;
      this.createTariffPopup = true;
    },

    handleEdit(tariff){
      this.typeOfOperation = "Edit";
      this.tariffForId = tariff;
      this.createTariffPopup = true;
    },

    handleDelete(tariffId){
      this.deleteCounter++;
      this.tariffId = tariffId;
      this.isDeleteTariffPopup=true;
    },

    async handleAdd(){
      this.createTariffPopup = false;
      this.isDeleteTariffPopup = false;
      this.$emit('update');
    },

    async handleClose(){
      console.log("jfsksljd");
      this.createTariffPopup = false;
      this.isDeleteTariffPopup = false;
    },

    async handleAfterDelete(){
      this.createTariffPopup = false;
      this.isDeleteTariffPopup = false;
      this.$emit('update');
    }

  },
};
</script>
<style scoped>

.headerSticky{
  position: sticky !important;
  top: 0px !important;
  z-index: 1 !important;
}
.manage_details {
  padding: 0px !important;
}

.table_normal {
  height: calc(100vh - 320px) !important;
}

.table_section {
  overflow-x: auto;
  border-top-style: none !important;
  margin-top: 0.5rem;
}

.title_text {
  font-size: 14px !important;
  font-weight: 700 !important;
}

.pNameImg {
  border:1px solid #dedbdb;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-position: center; 
  margin-right: 12px;
}

.figureImg{
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.pNameImage{
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.pDefaultImage{
    width: 50%;
    height: 100%;
    border-radius: 8px;
    /* margin-left: 18px; */
    position: relative;
    left: 23%;
    top: -2%;
}

.pName {
  padding-left: 24px !important;

}

.pNameCont {
  display: flex !important;
}

.pNameHeading {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  line-height: 1.2;
}

.pNameType {
  font-size: 14px;
  font-weight: 100;
  color: #777;
  margin: 8px auto;
}

.pNameAddress {
  font-size: 14px;
  font-weight: 100;
}

.pNameData{
  font-size: 16px;
}

.orderDate {
  font-weight: 100;
  font-size: 16px;
  color: #222;
  line-height: 1.5;
}

.orderType {
  font-weight: 100;
  font-size: 16px;
  color: #222;
}

.nowrap {
  font-size: 16px;
  font-weight: 100;
  padding-right: 16px;
}
.incompleteCursor{
  cursor:normal;
}
.incompleteColor{
  color: #ff0404;
}

.inProcessColor{
  color: #409eff;
}

.completedColor{
  color: #2cc21c;
}

.el-button {
  font-size: 13px !important;
  padding: 8px 8px !important;
  margin-top: 8px !important;
  margin-right: 8px !important;
}

.btnText {
  font-size: 16px;
  font-family: "Helvetica Neue";
  color: #222;
}
.tr{
  cursor:pointer;
}

@media (max-width: 1200px) {
  .table_section table tbody {
    padding: 0px 8px !important;
  }

  .table_section table tbody tr td .value_type,
  .table_section table tbody tr td .date {
    margin-top: 4px;
    display: block;
    padding-left: 0px !important;
  }
}

@media (max-width: 1200px) {
  .table_normal {
    height: calc(100vh - 320px) !important;
  }

  .table_section.table_normal table tbody tr td{
    width: initial !important;
    flex-grow: 1 !important;
  }

  .table_section.table_normal table tbody tr .smallScr{
    width: 100% !important
  }

  .table_section.table_normal table tbody tr .orderOn{
    margin-left: 92px !important;
  }
}

@media (max-width: 791px) {
.table_section.table_normal table tbody tr td{
    width: 50% !important;
    flex-grow: initial !important;
  }

.table_section.table_normal table tbody tr .orderOn{
    margin-left: 0px !important;
  }

  .table_section table tbody tr{
    padding-bottom: 8px !important;
    padding-right: 0px !important;
  }
}

</style>
  