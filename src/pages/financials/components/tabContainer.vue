<template>
  <div>
    <div class="desktop">
      <div class="headerDetails">
        <el-input
          :placeholder="searchPlaceholder"
          v-model="searchText"
          class="headerDetailsSearch"
        ></el-input>
        <i
              class="el-icon-search"
              v-if="searchText===''"
            ></i>
             <i
              v-else
              @click="searchText=''"
              class="el-icon-close"
            ></i>
        <el-button
          type="primary"
          class="headerDetailsBtn"
          @click="isAddPopupOpenClick()"
          v-if="is_give_permission"
          >Add {{ typeOfTab }}</el-button
        >
      </div>
      <div class="bodyDetails">
        <el-table
          :data="loanData"
          style="width: 100%"
          v-el-table-infinite-scroll="loadMoreFinancial"
        >
          <el-table-column prop="name" label="Name" min-width="60%">
            <div slot-scope="scope" class="text-right">
              <h3 class="heading">{{ scope.row.name }}</h3>
              <p class="description">
                {{ scope.row.description }}
              </p>
            </div>
          </el-table-column>
          <el-table-column
            prop="projecttype"
            label="Project Type"
            align="left"
            min-width="10%"
          >
          </el-table-column>
          <el-table-column
            min-width="11%"
            header-align="left"
            label="Actions"
            align="left"
            v-if="is_give_permission"
          >
            <div slot-scope="scope" class="text-right flexIcon">
              <el-tooltip
                class="item"
                effect="dark"
                content="Copy"
                placement="top-start"
              >
                <i
                  class="icon copy-alt"
                  @click="handleCopy(scope.row)"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Edit"
                placement="top-start"
              >
                <i
                  class="icon edit-alt"
                  @click="handleEdit(scope.row)"
                  :style="[
                    scope.row.organisation == null
                      ? { cursor: 'not-allowed', opacity: '0.6' }
                      : { cursor: 'pointer', opacity: '1' },
                  ]"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="Delete"
                placement="top-start"
              >
                <i
                  class="icon delete-alt"
                  @click="handleDelete(scope.row)"
                  :style="[
                    scope.row.organisation == null
                      ? { cursor: 'not-allowed', opacity: '0.6' }
                      : { cursor: 'pointer', opacity: '1' },
                  ]"
                />
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </div>

      <addOrEditOrCopyDialogBoxForPpaAndLease
        v-if="typeOfTab != 'Loan'"
        :isAddOrEditOrCopyPopupOpen="isAddOrEditOrCopyPopupOpen"
        v-on:confirmOperation="confirmOperation"
        @cancelAdd="isAddOrEditOrCopyPopupOpen = false"
        :editOrCopyObj="editOrCopyObj"
        :typeOfTab="typeOfTab"
        :typeOfOperation="typeOfOperation"
        :key="counter"
      ></addOrEditOrCopyDialogBoxForPpaAndLease>

      <addOrEditOrCopyDialogBoxForLoan
        v-else
        :isAddOrEditOrCopyLoanPopupOpen="isAddOrEditOrCopyPopupOpen"
        v-on:addLoan="confirmOperation"
        @cancelAdd="isAddOrEditOrCopyPopupOpen = false"
        :editOrCopyObj="editOrCopyObj"
        :typeOfTab="typeOfTab"
        :typeOfOperation="typeOfOperation"
        :key="counter"
      ></addOrEditOrCopyDialogBoxForLoan>
    </div>
    <div class="mobile">
      <div class="searchContainer">
        
        <!-- <span
          v-if="searchText.length > 0"
          class="fa fa-times"
          @click="eraseSearchTerm"
        ></span> -->

        <el-input
          :placeholder="searchPlaceholder"
          v-model="searchText"
          class="mobheaderDetailsSearch"
        ></el-input>
         <i
              class="el-icon-search"
              v-if="searchText===''"
            ></i>
             <i
              v-else
              @click="searchText=''"
              class="el-icon-close"
            ></i>
        <el-button
          type="primary"
          class=""
          @click="isAddPopupOpenClickMob()"
          v-if="is_give_permission"
          >Add {{ typeOfTab }}</el-button
        >
      </div>
      <div
        style="overflow: auto"
        :style="{ height: `${window.height - 300}px` }"
      >
        <table>
          <tbody>
            <tr width="100%" v-for="(loan, index) in loanData" :key="index">
              <td>
                <el-card class="box-card">
                  <td data-v-12684b02="" class="md_dot active" v-if="is_give_permission">
                    <div
                      data-v-12684b02=""
                      class="dot"
                      @click="menuClick(index)"
                    >
                    </div>
                     <el-dropdown
                trigger="click"
                
                @command="handleCommand"
              >
                <span class="el-dropdown-link">
                  <span data-v-12684b02="" class="fas fa-ellipsis-v" ></span>
                </span>
                <el-dropdown-menu slot="dropdown" >
                  <el-dropdown-item
                    icon="icon copy-alt"
                    :command="{ name: 'copy', id: loan }"
                   >Copy</el-dropdown-item
                  >
                  <el-dropdown-item
                    icon="icon edit-alt"
                    :command="{ name: 'edit', id: loan }"
                    >Edit</el-dropdown-item
                  >
                  <el-dropdown-item
                    icon="icon delete-alt"
                    :command="{ name: 'delete', id: loan }"
                    >Delete</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
                  </td>
                  <div class="mobtitleDes">
                    <h2 class="mobtitle">{{ loan.name }}</h2>
                    <p class="mobdescription">
                      {{ loan.description }}
                    </p>
                  </div>
                  <div class="mobType">
                    <h2 class="projectType">PROJECT TYPE</h2>
                    <p class="mobTypeDes">{{ loan.projecttype }}</p>
                  </div>
                </el-card>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-observe-visibility="loadMoreFinancialMobile"
          style="text-align: center"
        >
          <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
        </div>
      </div>
    </div>
    <addOrEditOrCopyDialogBoxForPpaAndLease
        v-if="typeOfTab != 'Loan'"
        :isAddOrEditOrCopyPopupOpen="isAddOrEditOrCopyPopupOpenMob"
        v-on:confirmOperation="confirmOperationMob"
        @cancelAdd="isAddOrEditOrCopyPopupOpenMob = false"
        :editOrCopyObj="editOrCopyObjMob"
        :typeOfTab="typeOfTab"
        :typeOfOperation="typeOfOperation"
        :key="counter"
      ></addOrEditOrCopyDialogBoxForPpaAndLease>

      <addOrEditOrCopyDialogBoxForLoan
        v-else
        :isAddOrEditOrCopyLoanPopupOpen="isAddOrEditOrCopyPopupOpenMob"
        v-on:addLoan="confirmOperationMob"
        @cancelAdd="isAddOrEditOrCopyPopupOpenMob = false"
        :editOrCopyObj="editOrCopyObjMob"
        :typeOfTab="typeOfTab"
        :typeOfOperation="typeOfOperation"
        :key="counter"
      ></addOrEditOrCopyDialogBoxForLoan>
    <deleteDialogbox
       v-if="isDeletePopupOpen"
      :isDeletePopupOpen="isDeletePopupOpen"
      @confirmDelete="actualDelete()"
      @cancelDelete="isDeletePopupOpen= false"
      :toBeDeleted="typeOfTab"
    />
  </div>
</template>
<script>
import Vue from "vue";
import elTableInfiniteScroll from "el-table-infinite-scroll";
Vue.use(elTableInfiniteScroll);

import deleteDialogbox from "./deleteDialogbox.vue";
import addOrEditOrCopyDialogBoxForPpaAndLease from "./addOrEditOrCopyDialogBoxForPpaAndLease.vue";
import addOrEditOrCopyDialogBoxForLoan from "./addOrEditOrCopyDialogBoxForLoan.vue";
import axios from "axios";
import debounce from "debounce";

import API from "@/services/api/";
export default {
  name: "tabContainer",
  components: {
    deleteDialogbox,
    addOrEditOrCopyDialogBoxForPpaAndLease,
    addOrEditOrCopyDialogBoxForLoan,
  },
  props: ["typeOfTab"],
  data() {
    return {
      counter: 0,
      loanLength: 30,
      searchText: "",
      loanData: [],
      loanToBeDeleted: null,
      isDeletePopupOpen: false,
      isAddOrEditOrCopyPopupOpen: false,
      isAddOrEditOrCopyPopupOpenMob:false,
      searchPlaceholder: "Search " + this.$props.typeOfTab,
      editOrCopyObj: {},
      editOrCopyObjMob: {},
      toBeUpdated: "",
      typeOfOperation: "",
      allow_To_Do_Operations: false,
      isLoading: false,
      isBusy: false,
      isAdmin: false,
      is_give_permission: false,
      busy: false,
      nextUrl: null,
      previousUrl: null,
      typeOfTabLocal: this.$props.typeOfTab,
      totalCount: 0,
      window: {
        width: 0,
        height: 0,
      },
      copyURL: "",
    };
  },
  mounted() {
    // this.loadMoreFinancialHelperMobile();
  },
  watch: {
    searchText(newVal) {
      this.getData();
    },
    typeOfTab(newval) {
      this.searchPlaceholder =
        "Please search " + this.$props.typeOfTab + " by name";
    },
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.getData();
    this.getData = debounce(this.getData, 1000);
    const user = JSON.parse(localStorage.getItem("user")) || {};
    if (user.role != "ADMIN") {
      this.checkPermission();
    } else {
      this.is_give_permission = true;
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {

 handleCommand(command) {
      
      if (command.name === "edit") {
        this.handleEditMob(command.id);
      } else if (command.name === "copy") {
        this.handleCopyMob(command.id);
      } else if (command.name === "delete") {
        this.handleDeleteMob(command.id);
      }
    },

    eraseSearchTerm() {
      this.searchText = "";
    },
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    menuClick(index) {
      var x = this.$refs.input[index];
      if (x.style.display === "block") {
        x.style.display = "none";
      } else {
        x.style.display = "block";
      }
    },
    deleteHandler(loanId) {
      this.isDeletePopupOpen = true;
      this.loanToBeDeleted = loanId;
    },
    loadMoreFinancial() {
      if (this.copyURL == this.nextUrl) {
        return;
      }
      if (this.nextUrl !== null) {
        this.copyURL = this.nextUrl;
        this.busy = true;
        this.loadMoreFinancialHelper();
      }
    },
    async loadMoreFinancialHelper() {
      try {
        const response = await API.FINANACIALS_INFORMATION.LOAD_MORE_FINANCIAL(
          this.nextUrl
        );
        this.assignAPIResponse(response);
        this.nextUrl = response.data.next;

        this.busy = false;
      } catch (error) {
        // console.error();
      }
    },
    checkPermission() {
      this.isLoading = true;
      const { organisation_id } = {
        ...JSON.parse(localStorage.getItem("user")),
      };
      const responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      this.isLoading = false;
      this.allow_To_Do_Operations = responseData.allow_adding_updating_payment_methods;
      this.is_give_permission = this.allow_To_Do_Operations;

      if(!Object.keys(responseData).length){
          axios.get(`/api/organisations/${organisation_id}/`).then((res) => {
            this.isLoading = false;
            this.allow_To_Do_Operations =
            res.data.allow_adding_updating_payment_methods;
            this.is_give_permission = this.allow_To_Do_Operations;
        });
      }
      // axios.get(`/api/organisations/${organisation_id}/`).then((res) => {
      //   this.isLoading = false;
      //   this.allow_To_Do_Operations =
      //     res.data.allow_adding_updating_payment_methods;

      //   this.is_give_permission = this.allow_To_Do_Operations;
      // });
    },
    isAddPopupOpenClick() {
      this.typeOfOperation = "Add";
      this.editOrCopyObj = {};
      this.editOrCopyObjMob = {};
      this.isAddOrEditOrCopyPopupOpen = true;
      this.counter++;
    },
    isAddPopupOpenClickMob() {
      this.typeOfOperation = "Add";
      this.editOrCopyObjMob = {};
      this.isAddOrEditOrCopyPopupOpenMob =true;
      this.counter++;
    },
    confirmOperation(childObj) {
      this.isAddOrEditOrCopyPopupOpen = false;
      childObj["payment_method_type"] = this.typeOfTab.toLowerCase();
      switch (this.typeOfOperation) {
        case "Add":
          this.addData(childObj);
          break;
        case "Edit":
          this.updateData(childObj);
          break;
        case "Copy":
          this.addData(childObj);
          break;
      }
    },
    confirmOperationMob(childObj) {   
      this.isAddOrEditOrCopyPopupOpenMob =false;
      childObj["payment_method_type"] = this.typeOfTab.toLowerCase();
      switch (this.typeOfOperation) {
        case "Add":
          this.addData(childObj);
          break;
        case "Edit":
          this.updateData(childObj);
          break;
        case "Copy":
          this.addData(childObj);
          break;
      }
    },
    assignAPIResponse(response) {
      const data = this.getFormatData(response.data.results);
      this.loanData = this.loanData.concat(
        this.getFormatData(response.data.results)
      );
    },
    async addData(childObj) {
      this.loading = true;
      let response = await API.FINANACIALS_INFORMATION.POST_NEW_FINANCIAL(
        childObj
      );

      this.getData();
      this.typeOfOperation = "";
    },
    async updateData(childObj) {
      this.loading = true;
      let response = await API.FINANACIALS_INFORMATION.UPDATE_PAYMENT_METHOAD(
        childObj,
        this.toBeUpdated
      );

      this.getData();
      this.typeOfOperation = "";
      this.toBeUpdated = "";
    },
    handleCopy(copy) {
      this.isAddOrEditOrCopyPopupOpen = true;
      this.typeOfOperation = "Copy";
      this.counter++;
      this.getDetailOfPaymentMethoadForCopy(copy.id);
    },
    handleCopyMob(copy) {
      this.isAddOrEditOrCopyPopupOpenMob = true;
      this.typeOfOperation = "Copy";
      this.counter++;
      this.getDetailOfPaymentMethoadForCopy(copy.id);
    },
    async deleteData(rowId) {
      this.loading = true;
      let response = await API.FINANACIALS_INFORMATION.DELETE_FINANCIAL(rowId);

      this.getData();
    },
    //-------------------------------------get data method --------------------!>
    async getData() {
      this.loading = true;
      var reqObj = `payment_method_type=${this.$props.typeOfTab.toLowerCase()}`;

      if (this.searchText.length > 0) {
        reqObj = `payment_method_type=${this.$props.typeOfTab.toLowerCase()}&query=${
          this.searchText
        }`;
      }

      let response = await API.FINANACIALS_INFORMATION.FETCH_PAYMENT_METHOAD_TYPE(
        reqObj
      );

      this.previousUrl = response.data.previous;
      this.totalCount = response.data.count;
      this.loanData = [];
      this.loanData = this.getFormatData(response.data.results);
      this.nextUrl = response.data.next;
    },
    getFormatData(res) {
      var formatResult = [];
      formatResult = res.map((res) => {
        var obj = {};
        obj["name"] = res.name;
        var pt = "";
        if (res.project_type == "residential") {
          pt = "Residential";
        } else {
          pt = "Commercial";
        }
        obj["projecttype"] = pt;
        obj["id"] = res.id;
        obj["organisation"] = res.organisation;
        obj["description"] = res.description;
        return obj;
      });
      return formatResult;
    },
    handleDelete(row) {
      if(row.organisation == null){
        return;
      }
      this.loanToBeDeleted = row.id;
      this.isDeletePopupOpen = true;
    },
    actualDelete() {
      this.deleteData(this.loanToBeDeleted);
      this.isDeletePopupOpen = false;
    },
    async handleEdit(item) {
      if(item.organisation == null){
        return;
      }
      this.typeOfOperation = "Edit";
      this.counter++;
      await this.getDetailOfPaymentMethoad(item.id);
      this.toBeUpdated = item.id;
    },
    async handleEditMob(item) {
      if(item.organisation == null){
        return;
      }
      this.typeOfOperation = "Edit";
      this.counter++;
      await this.getDetailOfPaymentMethoadMob(item.id);
      this.toBeUpdated = item.id;
    },
    getDetailOfPaymentMethoadForCopy(id) {
      axios.get(`/api/financial/payment-methods/${id}/`).then((getObj) => {
        getObj.data.name = getObj.data.name + "-(copy)";

        this.editOrCopyObj = getObj.data;
        this.editOrCopyObjMob = getObj.data;

      });
    },
    async getDetailOfPaymentMethoad(id) {
      let response = await API.FINANACIALS_INFORMATION.GET_DETAIL_OF_PAYMENT_METHOAD(
        id
      );
      this.editOrCopyObj = { ...response.data };
      this.isAddOrEditOrCopyPopupOpen = true;
    },
     async getDetailOfPaymentMethoadMob(id) {
      let response = await API.FINANACIALS_INFORMATION.GET_DETAIL_OF_PAYMENT_METHOAD(
        id
      );
      this.editOrCopyObjMob = { ...response.data };
      this.isAddOrEditOrCopyPopupOpenMob =true;
    },
    maintainScrollState() {
      if (this.isScrollStateToBeReset) {
        this.scrollState.reset();
      }
    },
    loadMoreFinancialMobile($state) {
      if (this.nextUrl !== null) {
        this.loading = true;
        this.loadMoreFinancialHelperMobile(this.nextUrl, $state);
      } else {
        if (document.readyState === "complete") {
          try {
            $state.complete();
          } catch (e) {
            console.error();
          }
        }
      }
    },
    async loadMoreFinancialHelperMobile(url, $state) {
      try {
        const response = await API.FINANACIALS_INFORMATION.LOAD_MORE_FINANCIAL(
          url
        );
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        for (let i = 0; i < response.data.results.length; i++) {
          this.loanData.push(response.data.results[i]);
        }
        this.assignAPIResponseMobile(response);

        this.loading = false;

        $state.loaded();
      } catch (e) {
        console.error();
      }
    },
    assignAPIResponseMobile(response) {
      const data = this.getFormatData(response.data.results);
      this.loanData = this.loanData.concat(
        this.getFormatData(response.data.results)
      );
      this.nextUrl = response.data.next;
    },
  },
};
</script>
<style scoped>
.mobile {
  display: none;
}
.desktop {
  display: block;
}
.el-icon-search{
  cursor:pointer;
  position:relative;
  display: flex;
  align-items: center;
  position: relative;
  right: 29px;
}
.el-icon-close{
  cursor:pointer;
  position:relative;
  display: flex;
  align-items: center;
  position: relative;
  right: 29px;
}

.flexIcon {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  justify-content: flex-start;
  /* display: grid;
  column-gap: 10px;
  grid-template-columns: repeat(auto-fill, 15px); */
}
.headerDetails {
  display: flex;
  justify-content: right;
}
.headerDetailsSearch {
  width: 22%;
}
.headerDetailsBtn {
  margin-left: 1%;
  font-weight: 700 !important;
}
.icon {
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--step-200);
}

.edit-alt {
  font-size: 1.7rem !important;
  margin: auto 8px;
}

.elBtn {
  border: none;
  background: none;
}
.bodyDetails >>> .el-table__body-wrapper {
  height: calc(100vh - 394px) !important;
  border-bottom: 2px solid white;
  z-index: 1;
}
/* .bodyDetails >>> .el-table th > .cell {
  padding-right: 35px !important;
} */

.heading {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 100;
  color: #222;
  margin-bottom: 3px;
}

.description {
  font-size: 14px;
  line-height: 18px;
  word-break: break-word;
}

@media only screen and (max-width: 920px) {
  .el-card.is-always-shadow {
    box-shadow: none;
    margin: 5px auto;
  }
  .mobile >>> .el-input__inner {
    border: 1px solid #ccc !important;
  }

  .mobile >>> ::placeholder {
    color: rgb(184, 179, 179) !important;
  }

  .searchContainer {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .searchStyle {
    position: absolute;
    z-index: 1;
    top: 30%;
    right: 5%;
    font-size: 1.3rem;
  }
  .fa-times {
    position: absolute;
    z-index: 1;
    top: 30%;
    right: 5%;
    font-size: 1.2rem;
    color: #777;
  }
  .mobheaderDetailsSearch {
    width: 35%;
    margin-right: 10px;
  }

  .mobile >>> .el-card__body {
    padding: 15px;
    /* border: 1px solid #ccc; */
    /* border-radius: 4px; */
    position: relative;
  }

  .desktop {
    display: none;
  }
  .mobile {
    display: block;
  }

  .md_dot {
    position: absolute;
    top: 10%;
    right: 5%;
  }

  .action_btn {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    opacity: 1;
    visibility: visible;
    -webkit-transition: all ease-in-out 0.4s;
    transition: all ease-in-out 0.4s;
  }

  .action_list {
    width: 110px;
    border-radius: 4px;
    -webkit-box-shadow: 0 6px 18px 0 rgb(0 0 0 / 10%);
    box-shadow: 0 6px 18px 0 rgb(0 0 0 / 10%);
    background: var(--white);
  }

  .fas {
    color: #777777;
    font-size: 15px;
  }

  .delete {
    margin-left: 14px;
    font-size: 14px;
    font-weight: 100;
  }

  .btn {
    border: none;
    box-shadow: none;
  }

  .mobtitle {
    font-size: 16px;
    font-weight: 500;
    color: #222;
    margin-bottom: 8px;
  }

  .mobdescription {
    font-size: 14px;
    font-weight: 100;
    color: #777;
    word-break: break-word;
    line-height: 20px;
  }

  .mobtitleDes {
    margin-bottom: 25px;
  }

  .projectType {
    font-size: 12px;
    font-weight: 500;
    color: #1c3366;
    margin-bottom: 6px;
  }

  .mobTypeDes {
    font-size: 16px;
    font-weight: 100;
    color: #222;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100% !important;
}
}

@media only screen and (max-width: 500px){
.mobheaderDetailsSearch {
    width: 73% !important;
    margin-right: 10px;
}
}
</style>
