<template>
  <div id="detailedBOM">
    <div class="navBar-container">
      <NavBar/>
    </div>
    <main class="main_controller">
      <section class="details-section">
        <div class="container"> 
          <ul class="tab_item noprint">
            <li class="item-list" :class="{ active: activePage === 'summary'}" >
              <a class="setCursor" @click="activePage = 'summary'">Summary</a>
            </li>
            <li class="item-list" :class="{ active: activePage === 'bom'}">
              <a class="setCursor" @click="activePage = 'bom'">Bill of Material</a>
            </li>
          </ul>

           <el-checkbox
                        v-if="roleForTATA!=='CP'"
                        v-model="balanceOfSupplyCheck"
                        class="checkbox noprint"
           />
           <span v-if="roleForTATA!=='CP'"> Balance Of Supply </span>

           <div class="select_area" v-if="mainRole==='ADMIN'">
                    <el-select
                    v-model="roleForTATA"
                    >
                        <el-option
                          v-for="tataRole in allTATARoles"
                          :key="tataRole.value"
                          :label="tataRole.label"
                          :value="tataRole.value"
                        />
                    </el-select>
            </div>

          <Summary :activePage="activePage"
                   :roleForTATA ="roleForTATA"
                   :balanceOfSupplyCheck="balanceOfSupplyCheck"
                   @updateBOMInformation="getUpdatedBOMInformation"
           />
        
          <BillOfMaterial :activePage="activePage" 
                          :roleForTATA ="roleForTATA"
                          :balanceOfSupplyCheck="balanceOfSupplyCheck"
                          :bomData ="bomData" />
        </div>
      </section>
      <!-- end-details-section -->
    </main>
  </div>
</template>


<script>
import API from "@/services/api/";
import NavBar from "@/components/ui/newNavbar.vue"
import Summary from "./components/summary.vue";
import BillOfMaterial from "./components/billOfMaterial.vue";
export default {
  name: "detailedBOM",
  components: {
    NavBar,
    Summary,
    BillOfMaterial,
  },
  data() {
    return {
      currentPage: "detailedBOM",
      activePage: "summary",
      bomData:{},
      CPMode:false,
      isManager:false,
      role:'',
      roleForTATA:'ADMIN',
      mainRole:'',
      allTATARoles:[
        {
          value:'CP',
          label:'Channel Partner'
        },
        {
          value:'ADMIN',
          label:'Admin'
        },
        {
          value:'Sales Manager',
          label:'Sales Manager'
        },

      ],
      balanceOfSupplyCheck:false,
     
    };
  },
  computed: {
    // roleForTATA(){
    //   const user = JSON.parse(localStorage.getItem('user'));
    //     this.isManager = user.is_manager;
    //     this.role = user.role;
    //     if(this.role==='ADMIN')
    //         return 'ADMIN';
    //     else{
    //       if(this.isManager)
    //         return 'Sales Manager';
    //       else
    //         return 'CP';
    //     } 
    // }
  },
  mounted() {
    // this.getUserInformation();
  },
  created() {
    this.getUserInformation();
  },
  methods: {
    getUpdatedBOMInformation(data){
         this.bomData = data;
    },
    getUserInformation(){
        const user = JSON.parse(localStorage.getItem('user'));
        this.isManager = user.is_manager;
        this.role = user.role;
        if(this.role==='ADMIN')
        this.roleForTATA = 'ADMIN';
        else{
          if(this.isManager)
          this.roleForTATA = 'Sales Manager';
          else
          this.roleForTATA = 'CP';
        }
        this.mainRole = this.roleForTATA; 
    },
  },
};
</script>


<style scoped>



* {
  font-family: "Roboto", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 15px;
  -webkit-text-size-adjust: 100%;
}

html,
body {
  height: 100%;
  background-color: #e8edf2;
  color: #222222;
  font-size: 16px;
}

ul li {
  list-style: none;
}

*:focus {
  outline: none;
}

img {
  max-width: 100%;
}

a {
  text-decoration: none;
}

/*DEFAULT CLASSES*/


.container {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 32px;
}
@media (max-width: 767px) {
  .container {
    padding: 0 16px;
  }
}

.checkbox input {
  padding: 0;
  height: initial;
  width: initial;
  margin-bottom: 0;
  display: none;
  cursor: pointer;
}
.checkbox input:checked + label:after {
  content: "";
  display: block;
  position: absolute;
  top: 4px;
  left: 6px;
  width: 4px;
  height: 8px;
  border: solid #0183c3;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox label {
  position: relative;
  cursor: pointer;
}
.checkbox label:before {
  content: "";
  -webkit-appearance: none;
  background-color: transparent;
  border: 1px solid #999999;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
  padding: 8px;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  cursor: pointer;
  margin-right: 8px;
  border-radius: 2px;
}


.input_area {
  margin-top: 8px;
}
.input_area label {
  font-size: 14px;
  color: #222222;
  margin-bottom: 6px;
  display: block;
}
.input_area .input_append {
  position: relative;
}
.input_area .input_append input {
  padding-right: 32px;
}
.input_area .input_append .pct {
  position: absolute;
  right: 12px;
  top: 12px;
}

input {
  padding: 10px 16px;
  border-radius: 4px;
  border: solid 1px #cccccc;
  background-color: #ffffff;
  width: 100%;
  font-size: 16px;
}
input:focus {
  outline: none;
}

.select_area select {
  padding: 10px 16px;
  border-radius: 4px;
  border: solid 1px #cccccc;
  background-color: #ffffff;
  width: 100%;
  font-size: 16px;
}
.select_area select:focus {
  outline: none;
}



/* TSL */
.header_section {
  position: sticky;
  top: 0;
  padding: 12px 16px;
  background-color: #141414;
  z-index: 9999;
}
.header_section .header_inside {
  display: flex;
}
.header_section a {
  color: #ffffff;
  display: inline-block;
  margin-right: 8px;
}
.header_section .header_title {
  flex-grow: 1;
}
@media (min-width: 768px) {
  .header_section .header_title {
    padding-right: 92px;
    text-align: center;
  }
}
.header_section .header_title h4 {
  font-size: 18px;
  color: #ffffff;
  margin: 0;
  font-weight: 500;
}
@media (max-width: 767px) {
  .header_section .header_title h4 {
    font-size: 14px;
  }
}

.row {
  margin: 0 -16px;
  display: flex;
  flex-wrap: wrap;
}
.row .col {
  padding: 0 16px;
}
.row .col-4 {
  width: calc(100% / 3);
}
@media (max-width: 767px) {
  .row .col-4 {
    width: 100%;
  }
}
.row .col-7 {
  width: 58%;
}
@media (max-width: 1280px) {
  .row .col-7 {
    width: 100%;
  }
}
.row .col-5 {
  width: 42%;
}
@media (max-width: 1280px) {
  .row .col-5 {
    width: 100%;
  }
}

.filter_value {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
}
.filter_value .select_area {
  max-width: 150px;
  margin-left: auto;
  width: 100%;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}
.card .card_content {
  padding: 16px 24px 24px;
}
@media (max-width: 767px) {
  .card .card_content {
    padding: 10px 16px 16px;
  }
}
.card .card_content.feild_content .table_title {
  margin: 0;
}
.card .card_content.feild_content .input_area {
  margin-top: 16px;
}

.main_controller {
  padding: 32px 0;
}
@media (max-width: 767px) {
  .main_controller {
    padding: 16px 0;
  }
}
.main_controller .button_group {
  margin-top: 30px;
}
@media (max-width: 767px) {
  .main_controller .button_group {
    margin-top: 16px;
  }
}
.main_controller .button_group button:not(:last-child) {
  margin-right: 12px;
}
.main_controller .card {
  margin-top: 24px;
}
.main_controller .tab_item {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid #b3b3b3;
}
.main_controller .tab_item li {
  position: relative;
}
.main_controller .tab_item li:not(:last-child) {
  margin-right: 2px;
}
.main_controller .tab_item li:after {
  content: "";
  position: absolute;
  height: 2px;
  width: 0;
  background-color: #222222;
  display: block;
  top: 100%;
  left: 0;
  transition: all 0.4s;
}
.main_controller .tab_item li a {
  font-size: 14px;
  padding: 12px 16px;
  display: inline-block;
  color: #222222;
}
.main_controller .tab_item li.active:after,
.main_controller .tab_item li:hover:after {
  width: 100%;
}
.main_controller .tab_item li.active a,
.main_controller .tab_item li:hover a {
  font-weight: 500;
}

.action_icon {
  margin-top: 26px;
  margin-left: 8px;
}
.action_icon .add_icon,
.action_icon .remove_icon {
  display: inline-block;
  cursor: pointer;
}
.action_icon .add_icon {
  width: 14px;
  height: 7px;
  border-left: 2px solid #f46545;
  border-bottom: 2px solid #f46545;
  transform: rotate(-45deg);
}
.action_icon .remove_icon {
  position: relative;
  width: 13px;
  height: 16px;
  margin-top: 8px;
}
.action_icon .remove_icon:after,
.action_icon .remove_icon:before {
  content: "";
  width: 2px;
  height: 100%;
  display: inline-block;
  background-color: #999999;
  position: absolute;
  top: 0;
  transform-origin: bottom;
}
.action_icon .remove_icon:after {
  transform: rotate(45deg);
  left: 0;
}
.action_icon .remove_icon:before {
  transform: rotate(-45deg);
  right: 0;
}

.item_action {
  display: flex;
}

.add_rows_items {
  margin-top: 8px;
}
.add_rows_items .plus {
  display: inline-flex;
  font-weight: 400;
  font-size: 18px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: #ffffff;
  align-items: center;
  justify-content: center;
  background-color: #1c3366;
  margin-right: 4px;
}
.add_rows_items a {
  display: inline-flex;
  align-items: center;
}
.add_rows_items span {
  display: inline-flex;
  align-items: center;
}
.add_rows_items .add_text {
  color: #1c3366;
  font-weight: 500;
  text-decoration: underline;
}

.text_right {
  text-align: right;
}

.table_card {
  overflow: hidden;
}

.table_title {
  margin-bottom: 16px;
  color: #1c3366;
}

.card_title {
  color: #1c3366;
  font-size: 16px;
  border-bottom: 1px solid #999999;
  margin: 0;
  font-weight: 500;
  padding: 0 0 12px;
}

.total_amount {
  font-size: 16px;
  font-weight: 500;
  color: #222222;
  padding: 14px 0;
}

.table_component {
  overflow-x: auto;
}
.table_component td,
.table_component th {
  padding: 10px 12px;
  font-size: 14px;
}
@media (max-width: 767px) {
  .table_component td,
  .table_component th {
    font-size: 13px;
    padding: 8px;
  }
}
.table_component th {
  font-weight: 500;
  white-space: nowrap;
}
.table_component table {
  width: 100%;
  border: 0;
  border-collapse: collapse;
  text-align: left;
}
.table_component table .input_area {
  min-width: 80px;
}
.table_component table .input_area label {
  white-space: nowrap;
}
.table_component:not(.absolute_value_table) table thead {
  background-color: #1c3366;
}
.table_component:not(.absolute_value_table) table thead tr th {
  color: #ffffff;
  font-weight: 600;
}
.table_component:not(.absolute_value_table) table tbody tr td,
.table_component:not(.absolute_value_table) table tbody tr th {
  border-bottom: 1px solid #cccccc;
}
.table_component:not(.absolute_value_table)
  table
  tbody
  tr:nth-child(2n + 2)
  td {
  background-color: #f6f8f9;
}
.table_component:not(.absolute_value_table) table tbody tr.total_amount td,
.table_component:not(.absolute_value_table) table tbody tr.add_tr_items td {
  background-color: #ffffff;
  border-bottom: none;
}
.table_component:not(.absolute_value_table) table tbody tr th {
  font-weight: bold;
  background-color: #e8edf2;
}
.table_component:not(.absolute_value_table)
  table
  tbody
  tr.compact_tr:last-child {
  border-bottom: 1px solid #cccccc;
}
.table_component:not(.absolute_value_table) table tbody tr.compact_tr td {
  border: none;
  background-color: #f6f8f9;
}
.table_component:not(.absolute_value_table) table tbody tr.compact_white td {
  background-color: #ffffff;
}

.absolute_value_table td,
.absolute_value_table th {
  padding: 16px;
}
@media (max-width: 767px) {
  .absolute_value_table td,
  .absolute_value_table th {
    padding: 8px;
  }
}

.absolute_value_table > table > thead {
  background-color: #1c3366;
}
.absolute_value_table > table > thead > tr > th {
  color: #ffffff;
}
.absolute_value_table > table > thead > tr > th:not(:last-child) {
  border-right: 1px solid #cccccc;
}

.absolute_value_table > table > tbody tr td {
  border-bottom: 1px solid #cccccc;
}

.absolute_value_table > table > tbody > tr > td {
  padding: 0;
  vertical-align: top;
}
.absolute_value_table > table > tbody > tr > td:not(:last-child) {
  border-right: 1px solid #cccccc;
  white-space: nowrap;
}

.absolute_value_table > table > tbody .sub_table thead > tr > th {
  border-bottom: 1px solid #cccccc;
}

.absolute_value_table > table > tbody .sub_table tbody tr td {
  background-color: #e8edf2;
  font-weight: bold;
}
.absolute_value_table > table > tbody .sub_table tbody tr td .blank {
  visibility: hidden;
}

.absolute_value_table
  > table
  > tbody
  .sub_table
  tbody
  tr:last-child
  td:first-child {
  text-align: right;
}

.absolute_value_table
  > table
  > tbody
  .sub_table
  tbody
  tr:last-child
  td:not(:last-child) {
  border-right: 1px solid #cccccc;
}


#detailedBOM{
  background-color: #e8edf2;
  min-height: 100%;
  height: auto;
}

</style>


<style scoped>
@media print 
{
  .noprint{
    /* visibility: hidden; */
    display: none;
  }
}
</style>

<style scoped>
.setCursor{
    cursor: pointer;
}
</style>


