<template>
  <div>
    <GlobalPageHeader>
      <template v-slot:children>
        <div class="outer-container">
          <div v-if="show">
            <el-alert title="success alert" type="success"> </el-alert>
          </div>
          <div class="header" style="z-index: 0">
            <div>
              <h2 style="margin: 0; padding: 0; color: #1c3366">
                Project Adders and Discounts
              </h2>
            </div>
            <div class="right-header">
              <div style="
                  color: #777777;
                  display: flex;
                  align-items: center;
                  gap: 0.2rem;
                " v-if="permissions.isAdmin">
                Allow users to create, edit & delete adders
                <el-tooltip class="item" style="margin-top: 2px" effect="dark"
                  content="If you turn on the toggle, your organization will be able to edit and delete the adders and discounts."
                  placement="top">
                  <img src="../../../src/assets/img/tooltipAND.svg" alt="tooltip" width="12px" />
                </el-tooltip>
                <div style="margin-left: 0.8rem">
                  <el-switch v-model="permissions.toggleEdit" @change="changeOrgPermission">
                  </el-switch>
                </div>
              </div>
              <div class="createButton" style="margin-left: 0.5rem" v-if="permissions.isAdmin || permissions.toggleEdit">
                <!-- <el-button type="primary" @click="handleCreate" >New</el-button> -->
                <el-dropdown @command="handleCreate" trigger="click">
                  <el-button type="primary" style="height: 46.5px; width: 102.5px" v-on:click="handleSortDisplay">
                    New<i style="margin-left: 20px" class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown" style="
                      transform-origin: center top;
                      padding-top: 0px;
                      padding-bottom: 0px;
                      margin-bottom: 0px;
                      margin-top: 0px;
                      border-bottom-width: 0px;
                      border-top-width: 0px;
                    ">
                    <el-dropdown-item command="adder" style="
                        padding: 8px;
                        height: 38px;
                        width: 100px;
                        line-height: 20px;
                        color: #000000;
                      ">Adder</el-dropdown-item>
                    <el-dropdown-item command="discount" style="
                        padding: 8px;
                        height: 38px;
                        width: 100px;
                        line-height: 20px;
                        color: #000000;
                      ">Discount</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </div>
          <div class="newTable" style="max-height: 100vh">
            <ListViewTable :tableColumns="tableHeader" :tableData="tableData" :showBorder="true" :showSearch="true"
              :handleRowClick="handleShow" :tableHeightOffset="'19.5rem'" :getHeaderStyles="() => {
                  return 'start';
                }
                " :showHeaderSortable="true" @handleSearch="handleSearch" searchHeight="22.5%" :cellHeight="'44px'"
              :paddingLeft="'10px'" :loadMoreLeadData="loadMoreLeadData" :nextUrl="nextUrl" @sortTableApi="sortTableApi"
              @getAddersData="getAddersData" :sortShow="sortShow"></ListViewTable>
            <SlideDrawer v-if="showSlideDrawer" :isOpen="showSlideDrawer" :isSlide="computeSlide" :isClose="isClose"
              :width="'75%'">
              <template v-slot:body>
                <EditAdder :mode="view" :form="form" :selectedData="drawerData" :edit-mode="editMode"
                  :handleClose="closeDrawer" :permissions="permissions" @submit="handleSubmit" @delete="handleDelete"
                  @updateData="handleUpdate" :show.sync="show" v-show="isSlide" />
                <Skeleton :width="'1000px'" :height="'1000px'" v-show="!isSlide" />
              </template>
            </SlideDrawer>
          </div>
          <!-- <div class="adderTable-container">
            <AdderTable :tableData="tableData" />
          </div> -->
        </div>
      </template>
    </GlobalPageHeader>
  </div>
</template>

<script>
import {
  getCurrencySymbol,
  getFormattedComasWithDecimal,
} from "../../utils/numberFormat/currencyFormatter";
import ListViewTable from "../designOrders/components/ListViewTable.vue";
import SlideDrawer from "./SlideDrawer.vue";
import EditAdder from "./Adder.vue";
import API from "../../services/api";
import AdderTable from "../../components/adderTable/index.vue";
import GlobalPageHeader from "../../components/ui/GlobalPageHeader/globalPageHeader.vue";
import Skeleton from "../../../src/pages/dashboardCRM/components/models/Card/Skeleton.vue";
export default {
  components: {
    ListViewTable,
    SlideDrawer,
    EditAdder,
    AdderTable,
    GlobalPageHeader,
  },
  data() {
    return {
      sortShow: false,
      nextUrl: "",
      countryCode: JSON.parse(localStorage.getItem("organisation")) || {},
      TYPE_CONSTANT: [
        {
          value: "per_sq_feet_of_roof_area",
          label: "Per sq ft. (of roof area)",
        },
        {
          value: "per_watt_of_system_size",
          label: "Per watt (of system size)",
        },
        {
          value: "per_panel",
          label: "Per panel",
        },
        {
          value: "percentage_of_system_cost",
          label: "Percentage (of system cost)",
        },
        {
          value: "flat_rate",
          label: "Flat rate",
        },
        {
          label: "Only roof containing panels",
          value: "only_roof_containing_panels",
        },
        {
          label: "Underneath arrays",
          value: "underneath_arrays",
        },
        {
          label: "All roof faces on buildings with solar panels",
          value: "all_roof_faces_with_solar_panles",
        },
        {
          label: "Adder",
          value: "adder",
        },
        {
          label: "Discount",
          value: "discount",
        },
      ],
      debounceTimer: null,
      view: "view",
      permissions: {
        toggleEdit: false,
        isAdmin: true,
      },
      searchTerm: "",
      drawerData: {},
      tableData: [],
      scrollData: [],
      isClose: false,
      show: false,
      tableHeader: [
        {
          id: "name",
          title: "Name",
          width: "100",
          isSortable: "true",
        },
        { id: "type", title: "Type", width: "90", isSortable: "true" },
        {
          id: "rate_type",
          title: "Rate Type",
          width: "120",
          isSortable: "true",
        },
        {
          id: "default_value",
          title: "Default Value",
          width: "90",
          isSortable: "true",
        },
      ],
      // tableData: [
      //   {
      //     name: "Ayush Ranjan",
      //     type: "Adder",
      //     rateType: "Per sq Ft",
      //     defaultValue: "$179",
      //   },
      //   {
      //     name: "Aman",
      //     type: "Adder",
      //     rateType: "Percentage",
      //     defaultValue: "7%",
      //   },
      //   {
      //     name: "Charan",
      //     type: "Adder",
      //     rateType: "Flat Rate",
      //     defaultValue: "$599",
      //   },
      //   {
      //     name: "Songmung",
      //     type: "Discount",
      //     rateType: "Percentage",
      //     defaultValue: "5%",
      //   },
      // ],
      name: [],
      showSlideDrawer: false,
      isSlide: false,
      form: {
        heading1: "Adder Details",
        heading: "Edit Adder",
        fields: [
          {
            name: "Name",
            prop: "name",
            input_type: "text",
          },
          {
            name: "Rate Type",
            prop: "rate_type",
            input_type: "selection",
            options: [
              {
                value: "flat_rate",
                label: "Flat rate",
              },
              {
                value: "per_panel",
                label: "Per panel",
              },
              {
                value: "per_watt_of_system_size",
                label: "Per watt (of system size)",
              },
              {
                value: "percentage_of_system_cost",
                label: "Percentage (of system cost)",
              },
              {
                value: "per_sq_feet_of_roof_area",
                label: "Per sq ft. (of roof area)",
              },
            ],
          },
          {
            name: "Sub Type",
            prop: "sub_type",
            input_type: "selection",
            options: [
              {
                label: "Only roof containing panels",
                value: "only_roof_containing_panels",
                description:
                  "Target the combined area of all roof faces with panels",
              },
              {
                label: "Underneath arrays",
                value: "underneath_arrays",
                description: "Target only the roof area under arrays",
              },
              {
                label: "All roof faces on buildings with solar panels",
                value: "all_roof_faces_with_solar_panles",
                description:
                  "Target the total roof area of buildings with panels",
              },
            ],
            description: [
              "Target the combined area of all roof faces with panels",
              "Target only the roof area under arrays",
              "Target the total roof area of buildings with panels",
            ],
          },
          {
            name: "Default Amount",
            prop: "default_amount",
            adderdis: "Please enter the amount with tax",
            discountdis: "Please enter the amount with tax",
            input_type: "number",
          },
          // {
          //   name: "Default Percentage",
          //   prop: "defaultPercentage",
          //   input_type: "number",
          // },
          {
            name: "Allow amount to be edited",
            prop: "allow_amount_edit",
            input_type: "switch",
            options: [true, false],
          },
          {
            name: "Allow Quantity to be edited",
            prop: "allow_quantity_edit",
            input_type: "switch",
            options: [true, false],
          },
          {
            name: "Is Homeowner Facing",
            adder_dis:
              "If on, this adder will be shown in Sales Mode, the web proposal, and the proposal summary PDF.",
            discount_dis:
              "If on, this discount will be shown in Sales Mode, the web proposal, and the proposal summary PDF.",
            prop: "is_homeowner_facing",
            input_type: "switch",
            options: [true, false],
          },
          {
            name: "Show amount to Homeowner",
            prop: "show_adder_total",
            input_type: "switch",
            options: [true, false],
          },
          {
            name: "Incentives can be applied",
            adder_dis:
              "Toggle on if the amount associated with this adder can be included when calculating cost based incentives like the Federal ITC.",
            discount_dis:
              "Toggle on if the amount associated with this discount can be included when calculating cost based incentives like the Federal ITC.",
            prop: "apply_incentives",
            input_type: "switch",
            options: [true, false],
          },
        ],
      },
    };
  },
  computed: {
    getTableHeight() {
      if (window.matchMedia("(max-width: 600px)").matches) {
        return "33.5rem"; // Condition for small screens
      } else if (window.matchMedia("(max-width: 960px)").matches) {
        return "33.5rem"; // Condition for medium screens
      } else if (window.matchMedia("(max-width: 1280px)").matches) {
        return "33.5rem"; // Condition for large screens
      } else if (window.matchMedia("(max-width: 1300px)").matches) {
        return "33.5rem"; // Condition for large screens
      } else {
        return "34rem"; // Default table height for other screen sizes
      }
    },
  },
  computed: {
    computeSlide() {
      setTimeout(() => {
        this.isSlide = this.isOpen;
        return this.isSlide;
      }, 600);
    },
  },
  methods: {
    // handleCurrencySymbol() {
    //   return this.countryCode
    //     ? getCurrencySymbol(this.countryCode.currency_code)
    //     : "";
    // },

    handleSortDisplay() {
      console.log(this.sortShow);
      this.sortShow = !this.sortShow;
    },
    // filterOption(type, name) {
    //   let res;
    //   if (name === "rate") {
    //     res = this.form.fields[1].options.filter((e) => {
    //       if (e.value === type) return e.label;
    //     });
    //   }
    //   if (name === "sub") {
    //     res = this.form.fields[2].options.filter((e) => {
    //       if (e.value === type) return e.label;
    //     });
    //   }
    //   return res[0] ? res[0].label : res.label;
    // },
    // getOptions(data) {
    //   let res = data.map((e) => {
    //     return {
    //       ...e,
    //       rate_type: this.filterOption(e.rate_type, "rate"),
    //       sub_type: this.filterOption(e.sub_type, "sub"),
    //     };
    //   });
    //   return res[0].label;
    // },
    filterOption(type, index) {
      let res = this.form.fields[index].options.filter((e) => {
        if (e.value === type) return e.label;
      });
      return res[0].label;
    },
    getOptions(data) {
      let res = data.map((e) => {
        return { ...e, rate_type: this.filterOption(e.rate_type, 1) };
      });
      return res;
    },
    getSubOptions(data) {
      let res = data.map((e) => {
        if (e.sub_type) {
          return { ...e, sub_type: this.filterOption(e.sub_type, 2) };
        }
        return e;
      });
      return res;
    },
    async loadMoreLeadData() {
      if (this.nextUrl !== null) {
        console.log("test");
        let { data } = await API.ADDERS_DISCOUNTS.LOAD_MORE_ADDERS(
          this.nextUrl
        );
        console.log(data);
        this.nextUrl = data.next;
        let filteredData = await this.getOptions(data.results);
        filteredData = await this.getSubOptions(filteredData);
        console.log(filteredData);
        this.scrollData = filteredData.map((item) => {
          let default_value = "";
          item.type = this.handleSwap("value", "label", item.type);
          if (item.rate_type === "Percentage (of system cost)") {
            default_value = item.default_percentage.toFixed(2) + "%";
          } else {
            let cc = item.country == null ? this.countryCode.currency_code : item.country_details.currency_code
            let dd = item.default_amount.toFixed(2);
            let append = ''
            // if(!item.default_amount.toString().includes('.')){
            //   append = '.00'
            // }

            default_value = `${getCurrencySymbol(cc)}${getFormattedComasWithDecimal(
              cc,
              dd,
              2
            )}`;
            console.log(default_value)
          }
          return {
            ...item,
            default_value,
          };
        });
        this.tableData = [...this.tableData, ...this.scrollData];
      }
    },

    async sortTableApi(data) {
      const sort_by = data[0];
      const order_by = data[1];
      console.log(sort_by, order_by);
      try {
        let { data } = await API.ADDERS_DISCOUNTS.SORT_ADDERS_DISCOUNT_DATA(
          sort_by,
          order_by
        );
        console.log(data);
        this.nextUrl = data.next;

        console.log(this.nextUrl);
        let filteredData = await this.getOptions(data.results);
        filteredData = await this.getSubOptions(filteredData);
        this.tableData = filteredData.map((item) => {
          let default_value = "";
          item.type = this.handleSwap("value", "label", item.type);
          if (item.rate_type === "Percentage (of system cost)") {
            default_value = item.default_percentage.toFixed(2) + "%";
          } else {
            let cc = item.country == null ? this.countryCode.currency_code : item.country_details.currency_code
            let dd = item.default_amount.toFixed(2);
            let append = ''
            // if(!item.default_amount.toString().includes('.')){
            //   append = '.00'
            // }

            default_value = `${getCurrencySymbol(cc)}${getFormattedComasWithDecimal(
              cc,
              dd,
              2
            )}`;
            console.log(default_value)
          }

          return {
            ...item,
            default_value,
          };
        });
        if (this.nextUrl !== null) {
          this.loadMoreLeadData();
        }
      } catch (err) {
        console.log(err);
      }
    },

    async getAddersData() {
      try {
        let { data } =
          await API.ADDERS_DISCOUNTS.FETCH_ALL_ADDERS_AND_DISCOUNTS();
        console.log(data);
        this.nextUrl = data.next;

        console.log(this.nextUrl);
        // this.name = data.response.map((name) => name.name);
        let filteredData = await this.getOptions(data.results);
        filteredData = await this.getSubOptions(filteredData);
        this.tableData = filteredData.map((item) => {
          let default_value = "";
          item.type = this.handleSwap("value", "label", item.type);
          if (item.rate_type === "Percentage (of system cost)") {
            default_value = item.default_percentage.toFixed(2) + "%";
          } else {
            let cc = item.country == null ? this.countryCode.currency_code : item.country_details.currency_code
            let dd = item.default_amount.toFixed(2);
            let append = ''
            // if(!item.default_amount.toString().includes('.')){
            //   append = '.00'
            // }

            default_value = `${getCurrencySymbol(cc)}${getFormattedComasWithDecimal(
              cc,
              dd,
              2
            )}`;
            console.log(default_value)
          }
          return {
            ...item,
            default_value,
          };
        });
        if (this.nextUrl !== null) {
          this.loadMoreLeadData();
        }
      } catch (err) {
        this.$message({
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: "There was an error while fetching the data.",
          type: "error",
        });
      }
    },
    async handleSearch(term) {
      this.searchTerm = term;
      let { data } =
        await API.ADDERS_DISCOUNTS.FETCH_ALL_SEARCHED_ADDERS_AND_DISCOUNTS(
          term
        );
      let filteredData = this.getOptions(data.results);
      this.nextUrl = data.next;
      this.tableData = filteredData.map((item) => {
        let default_value = "";
        if (item.rate_type === "Percentage (of system cost)") {
          default_value = item.default_percentage.toFixed(2) + "%";
        } else {
          let cc = item.country == null ? this.countryCode.currency_code : item.country_details.currency_code
            let dd = item.default_amount.toFixed(2);
            let append = ''
            // if(!item.default_amount.toString().includes('.')){
            //   append = '.00'
            // }

            default_value = `${getCurrencySymbol(cc)}${getFormattedComasWithDecimal(
              cc,
              dd,
              2
            )}`;
            console.log(default_value)
        }
        return {
          ...item,
          default_value,
        };
      });
      if (this.nextUrl !== null) {
        this.loadMoreLeadData();
      }
    },
    async patchAddersData(id, data) {
      try {
        let { check } =
          await API.ADDERS_DISCOUNTS.PATCH_SEARCHED_ADDERS_AND_DISCOUNTS_ID(
            id,
            data
          );
      } catch (err) {
        this.$message({
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: "There was an error while updating the data.",
          type: "error",
        });
      }
      if (this.searchTerm) {
        this.handleSearch(this.searchTerm);
      } else {
        this.getAddersData();
      }
    },
    async deleteTableData(id) {
      try {
        await API.ADDERS_DISCOUNTS.DELETE_SEARCHED_ADDERS_AND_DISCOUNTS_ID(id);
      } catch (err) {
        this.$message({
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: "There was an error while deleting the data.",
          type: "error",
        });
      }
    },

    async createAddersAndDiscount(data) {
      try {
        await API.ADDERS_DISCOUNTS.INSERT_ADDERS_AND_DISCOUNTS_ID(data);
      } catch (err) {
        console.log(err);
        let message = "There was an error while creating the data";
        if (data.name) {
          if (data.name.length > 149) {
            message = "The name should be below 150 characters";
          } else {
            message = `Adders & Discount with name "${data.name}" already exists.`;
          }
        }
        this.$message({
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: message,
          type: "error",
        });
      }
      if (this.searchTerm) {
        this.handleSearch(this.searchTerm);
      } else {
        this.getAddersData();
      }
    },

    async getOrgPermissions() {
      let orgId = JSON.parse(localStorage.getItem("organisation")).id;
      let res =
        await API.ADDERS_DISCOUNTS.FETCH_PERMISSION_ADDERS_AND_DISCOUNTS(orgId);
      this.permissions.toggleEdit = res.data.allow_managing_adders_discounts;
    },
    async changeOrgPermission() {
      this.debouncePostRequest(1000);
    },
    debouncePostRequest(duration) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        let orgId = JSON.parse(localStorage.getItem("organisation")).id;
        let data = {
          allow_managing_adders_discounts: this.permissions.toggleEdit,
        };
        let res =
          await API.ADDERS_DISCOUNTS.PATCH_PERMISSION_ADDERS_AND_DISCOUNTS(
            orgId,
            data
          );
      }, duration);
    },
    handleSubmit(value) {
      if (value.rate_type === "percentage_of_system_cost") {
        value.default_percentage = value.default_amount;
        delete value.default_amount;
      }
      this.createAddersAndDiscount(value);
      // this.tableData.push(value);
    },
    handleDelete(value) {
      const { id } = value;
      this.deleteTableData(id);
      this.tableData = this.tableData.filter((e) => e.id !== value.id);
    },
    handleSwap(type, returnType, value) {
      let data = this.TYPE_CONSTANT.find((e) => e[type] === value);
      if (data === undefined) return value;
      return data[returnType];
    },
    handleUpdate(value) {
      value.type = this.handleSwap("label", "value", value.type);
      if (value.rate_type)
        value.rate_type = this.handleSwap("label", "value", value.rate_type);
      if (value.sub_type)
        value.sub_type = this.handleSwap("label", "value", value.sub_type);
      // if(value.type === 'Adder') value.type = 'adder'
      // if(value.type === 'Discount') value.type = 'discount'
      // if(value.rate_type === 'Per sq ft. (of roof area)') value.rate_type = "per_sq_feet_of_roof_area"
      // if(value.rate_type === 'Per watt (of system size)') value.rate_type = "per_watt_of_system_size"
      // if(value.rate_type === 'Per panel') value.rate_type = "per_panel"
      // if(value.rate_type === 'Percentage (of system cost)') value.rate_type = "percentage_of_system_cost"
      // if(value.rate_type === 'Flat rate') value.rate_type = "flat_rate"
      // if(value.sub_type === 'Only roof containing panels') value.sub_type = "only_roof_containing_panels"
      // if(value.sub_type === 'Underneath arrays') value.sub_type = "underneath_arrays"
      // if(value.sub_type === 'All roof faces on buildings with solar panels') value.sub_type = "all_roof_faces_with_solar_panles"
      if (value.rate_type === "percentage_of_system_cost") {
        value.default_percentage = value.default_amount;
        delete value.default_amount;
      }
      const { id } = value;
      //value.rate_type = this.getNames(value, 1);
      this.patchAddersData(id, value);

      this.tableData = this.tableData.map((e) => {
        if (e.id === value.id) return value;
        return e;
      });

      if (this.searchTerm !== "") {
        this.handleSearch(this.searchTerm);
      } else {
        this.getAddersData();
      }
    },
    // getNames(value, type){
    //   console.log((form.fields[type].options.find(e => e.label === value.rate_type)).value)
    //     return (form.fields[type].options.find(e => e.label === value.rate_type)).value
    // },
    handleCreate(command) {
      if (command === "adder") {
        // this.showAdder = true;
        this.showSlideDrawer = true;
        setTimeout(() => {
          this.isSlide = true;
        }, 800);
        this.view = "adder";
      } else {
        this.showSlideDrawer = true;
        setTimeout(() => {
          this.isSlide = true;
        }, 800);
        this.view = "discount";
      }
      if (this.searchTerm) {
        this.handleSearch(this.searchTerm);
      } else {
        this.getAddersData();
      }
    },
    handleShow(data) {
      console.log(data)
      this.drawerData = data;
      this.view = "view";
      this.showSlideDrawer = true;
      setTimeout(() => {
        this.isSlide = true;
      }, 800);
    },
    closeDrawer() {
      // event.preventDefault();
      this.isClose = true;
      this.isSlide = false;
      setTimeout(() => {
        this.showSlideDrawer = false;
        this.isClose = false;
      }, 500);
    },
  },
  created() {
    this.permissions.isAdmin =
      JSON.parse(localStorage.getItem("user")).role === "ADMIN" ? true : false;
    this.getOrgPermissions();
    this.getAddersData();
  },
};
</script>

<style scoped>
.outer-container {
  padding: 0rem 2rem 8rem 2rem;

  background-color: #e8edf2;
}

.createDD {
  width: 70px;
  cursor: pointer;
  height: 30px;
  background-color: #409eff;
  color: white;
  text-align: center;
  padding-top: 6px;
}

.header {
  border: 0;
  padding: 0 0 0.5rem 0;
  background-color: #e8edf2;
  display: flex;
}

.right-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.newTable {
  position: relative;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
}

.adderTable-container {
  background-color: white;
  margin-top: 2rem;
  padding: 1rem 1rem 2rem;
  border: 1px solid #cccccc;
  border-radius: 1rem;
}
</style>
