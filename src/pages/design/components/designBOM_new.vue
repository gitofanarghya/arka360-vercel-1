<template>
  <div class="card">
    <div :class="{
      'card_header':!isOnLeadSummaryPage,
      'incentive-header':isOnLeadSummaryPage
    }">
      <h4>Bill of Materials</h4>
    </div>
    <div class="card_content"
    :class="{
      'card_content':!isOnLeadSummaryPage,
      'card_content_CRM':isOnLeadSummaryPage
    }">
      <div class="material_bill">
        <div class="table_section table_normal">
          <table>
            <thead>
              <tr>
                <th class="col1">Component</th>
                <th class="col2">Description</th>
                <th class="col3">Quantity</th>
                <th class="action-title col4">Action</th>
              </tr>
            </thead>
            <tbody v-if="bomData.length > 0">
              <tr v-for="(data, idx) in bomData" :key="idx">
                <td>
                  <div class="md_head">Component</div>
                  <div class="value_type">{{data.component || '-'}}</div>
                </td>
                <td>
                  <div class="md_head">Description</div>
                  <div class="value_type">{{data.make || '-'}}</div>
                </td>
                <td>
                  <div class="md_head">Quantity</div>
                  <div class="value_type">
                    <display-length v-if="isComponentNonCountable(data.component)" 
                      :metric-value="parseFloat(data.count)"
                      :appendMeterUnit="true"/>
                    <span v-else-if="data.component === 'Structure'"></span>
                    <span v-else class="nowrap">
                      {{parseFloat(data.count).toFixed(2) || '-'}} No.</span>
                  </div>
                </td>
                <td></td>
              </tr>
            </tbody>
            <tbody v-if="!isBOQTableDataEmpty">
              <tr 
                v-for="(data, idx) in boqTableData"
                :key="idx"
              >
                <td>
                  <div class="md_head">Component</div>
                  <div class="value_type">{{data.category}}</div>
                </td>
                <td>
                  <div class="md_head">Description</div>
                  <div class="value_type make_type" v-show="editBOQRowData.index !== idx">{{data.make}}</div>
                  <div
                    v-show="editBOQRowData.index === idx">
                    <div v-if="isRowCategoryAvailableInInventory(data.category)">
                      <el-select
                        v-model="editBOQRowData.make"
                        allow-create
                        filterable
                        >
                        <el-option
                          v-for="(makeOptions, index) in boqInventoryData[data.category]"
                          :key="index"
                          :label="makeOptions.make"
                          :value="makeOptions.make"/>
                      </el-select>
                    </div>
                      <div v-else>
                        <input
                          v-model="editBOQRowData.make"
                          placeholder="required"
                          class="input_field"/>
                      </div>
                    </div>
                </td>
                <td>
                  <div class="md_head">Quantity</div>
                  <div class="value_type" v-show="editBOQRowData.index !== idx">
                    <display-length  v-if="isComponentNonCountable(data.category)"
                        :metric-value="parseFloat(data.quantity)"
                        :appendMeterUnit="true"/>
                    <span v-else class="nowrap">
                      {{parseFloat(data.quantity).toFixed(2) || '-'}} No.</span>
                  </div>
                  <div
                    v-show="editBOQRowData.index === idx">
                    <!-- <input
                      v-model="editBOQRowData.quantity"
                      placeholder="required"
                      @input="afterEdit( data.quantity)"
                      class="input_field"/> -->
                    
                      <input-length 
                        v-if="isComponentNonCountable(data.category)"
                        v-model="editBOQRowData.quantity"
                        :name="'quantity'"
                        :inputValidation="lengthValidation"
                        :class-input="'input_field'"
                        @enterPressed = "pressed($event)"
                        />
                        <p>
                        <span Style="Color:red">{{ errors.first('quantity') }}</span>
                        </p>
                    </div> 
                    <div
                      v-show="editBOQRowData.index === idx">

                       <input v-if="isComponentCountable(data.category)"
                        v-model="editBOQRowData.quantity"
                        placeholder="required"
                        class="input_field"
                        @keyup.enter="onConfirmBOQRowEdit(idx, data.category,data.make, data.quantity,distanceUnit)"/>
                       
                    </div>
                </td>
                <td>
                  <div class="md_head">Action</div>
                  <div class="value_type">
                    <div class="button_action">
                      <ul class="action_list">
                        <li>
                          <button class="btn"
                            v-show="editBOQRowData.index !== idx"
                            :disabled="isBOQRowBeingEdited"
                            @click="onEditBOQRowCategory(idx, data.make, data.quantity, data.category,distanceUnit)"
                          >
                            <span class="icon edit-alt"></span>
                          </button>
                        </li>
                        <li>
                          <button
                            v-show="editBOQRowData.index === idx"
                            class="icon loading-alt"
                            :disabled="existingBOQConfirmInProgress"
                            :class="BOQTableConfirmLoadingIconToggle"
                            @click="onConfirmBOQRowEdit(idx, data.category,data.make, data.quantity,distanceUnit)">
                          </button>
                        </li>
                        <li>
                          <button class="btn"
                            :disabled="existingBOQDeleteInProgress"
                            @click="onDeleteBOQRow(idx)"
                          >
                            <span :class="deletingBOQIndex === idx ? 'icon loading-alt' : 'icon delete-alt'"
                            ></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div 
          class="field_group"
          @submit.native.prevent>
            <div class="input-group-prepend">
              <!-- {{ order_status }} -->
              <el-select
                v-validate="requiredValidation"
                v-model="newBOQRowData.category"
                name="Category"
                class="btn"
                placeholder="Select Component"
                @change="resetNewBOQRowData"
                :disabled="(order_status === 'cancelled') || (order_status === 'rejected')"
                >
                <el-option
                  v-for="category in BOQ_CATEGORIES"
                  :key="category.VALUE"
                  :label="category.LABEL"
                  class="select_dropdown"
                  style="border: none"
                  :value="category.VALUE"/>
              </el-select>
            </div>
            <input
              v-model="newBOQRowData.make"
              name="Make"
              class="input_field"
              placeholder="Enter Make"/>
            <input-length 
               v-if="isComponentNonCountable(newBOQRowData.category)"
               :holder="EnterQuantity"
               v-model="newBOQRowData.quantity"
               :name="'New Quantity'"
               :class-input="'inputfeet'" 
               :inputValidation="lengthValidation"
               :spanWidth="'spanWidth'"
               class="input_field smallScreen" 
               @enterPressed = "pressed($event)"
             />
             <div v-if="!isValidValue && !isValidValueForFeet && distanceUnit === 'feet' && isComponentNonCountable(newBOQRowData.category)"
               class="mobileScreen">
               Enter quantity Value in 1 ft 0 in format.
              </div>
              <div class="meterValMobile" v-if="isValidValue && isComponentNonCountable(newBOQRowData.category)">
               {{meterValue}}
              </div>
              <div class="meterValMobile" v-if="isValidValueForFeet && isComponentNonCountable(newBOQRowData.category)">
               {{feetValue}}
              </div>
            <input 
              v-if ="isComponentCountable(newBOQRowData.category)"
              class="input_field" 
              type="number" 
              v-validate="requiredValidation"
              v-model="newBOQRowData.quantity"
              name="Quantity"
              placeholder="Enter Quantity"
              @keyup.enter="addNewBOQRow();"
            />
            <div class="meterValMobile" v-if=" isValidValue && isComponentCountable(newBOQRowData.category)">
               {{meterValue}}
              </div>
            <div class="meterValMobile" v-if=" isValidValueForFeet && isComponentCountable(newBOQRowData.category)">
               {{feetValue}}
              </div>
            <input 
              v-if ="!newBOQRowData.category"
              class="input_field" 
              type="number" 
              v-validate="requiredValidation"
              v-model="newBOQRowData.quantity"
              name="Quantity"
              placeholder="Enter Quantity"
            />

            <!---<input 
              v-if="distanceUnit === 'meters'"
              class="input_field" 
              type="number" 
              v-validate="requiredValidation"
              v-model="newBOQRowData.quantity"
              name="Quantity"
              placeholder="Enter Quantity" />-->
            <div class="input-group-append">
              <el-tooltip
                :disabled="projectPermissionObject.edit_design || !isCrmUser()"
                effect="dark"
                placement="top-start"
                :content="'You dont have permission to change design information.'"
              >
                <span>
                    <button
                      style="height:63px"
                      :disabled="areNewBOQRowFieldsInvalid || newRowAdditionInProgress || (!projectPermissionObject.edit_design && isCrmUser())"
                      class="btn btn-primary"
                      @click="addNewBOQRow()">
                      <i
                        v-show="newRowAdditionInProgress"
                        style="width:7.4ch;"
                        class="el-icon-loading"
                      />
                      <span v-show="!newRowAdditionInProgress"> Add Component</span>
                    </button>
                  </span>
              </el-tooltip>
            </div>
        </div>
        <div v-if="isQuantityValid && !isValidValue && !isValidValueForFeet && distanceUnit === 'feet' && isComponentNonCountable(newBOQRowData.category)"
               class="desktopScreen">
               Enter quantity value in 1 ft 0 in format.
        </div>
        <div
          v-if="!isQuantityValid "
          class="formErrors"
          style="margin: 0 0 20px 0; color:red;">
          Component, Quantity fields are required
        </div>
        <div class="meterValDesktop" v-if="isValidValue ">
        {{meterValue}}
        </div>
        <div class="meterValDesktop" v-if="isValidValueForFeet">
        {{feetValue}}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import validationMixins from '@/pages/studio/sappane/properties/validationMixins';
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../stores/design';
import { useProjectStore } from "../../../stores/project";
import { useOrgInventoryBOQStore } from '../../../stores/organisation-inventory-BOQ';
import { BOQ_CATEGORIES } from '@/pages/constants';
import { isCrmUser } from "@/utils.js";

export default {
  name: "DesignBom",
  props: {
    orderStatus: {
      type: String,
    }
  },
  data() {
    return {
      isOnLeadSummaryPage: this.$route.name.includes("leadSummary"),
      order_status: this.$props.orderStatus,
      msg: "I am in designBom",
      showBomData: false,
      data: [],
      newBOQRowData: {
        category: "",
        make: "",
        quantity: "",
      },
      requiredValidation: {
        required: true,
      },
      editBOQRowData: {
        make: "",
        quantity: "",
        index: "",
      },
      EnterQuantity:"Enter Quantity",
      isValidValueForFeet:false,
      isValidValue:false,
      error:false,
      feetinvalid:false,
      action:false,
      rowQuantity:"",
      isBOQRowBeingEdited: false,
      IsTableRendering: false,
      existingBOQConfirmInProgress: false,
      existingBOQDeleteInProgress: false,
      deletingBOQIndex: "",
      newRowAdditionInProgress: false,
      isQuantityValid: true,
      meterValue:"The quantity field must be 0.001 or more.",
      feetValue:"Quantity field can't be less than 0.1 feet",
    };
  },
   mixins: [
        validationMixins.lengthValidation,
    ],
  nonReactiveData() {
        return {
            BOQ_CATEGORIES,
        };
    },
  created() { 
    this.fetchOrganisationBOQ();
  },
  computed: {
    ...mapState(useDesignStore, {
      bomData: "GET_BOM_DATA",
      boqTableData: 'GET_ORGANISATION_BOQ_TABLE_DATA',
    }),
    ...mapState(useDesignStore, {
      wiringUnit: (state) => state.versions.setting.wiring_unit,
      distanceUnit: (state) => state.versions.setting.distance_unit,
    }),
    ...mapState(useOrgInventoryBOQStore, {
      boqInventoryData: 'GET_ORGANISATION_BOQ_INVENTORY',
    }),
    ...mapState(useProjectStore, {
        projectPermissionObject: 'GET_PERMISISON_OBJECT',
    }),
    isBOQTableDataEmpty() {
      if (this.boqTableData === undefined || this.boqTableData === null) {
        return true;
      }
      return this.boqTableData.length === 0;
    },
    isCategoryAvailableInInventory() {
      if(!this.boqInventoryData)
        return false;
      const categoriesInBOQData = Object.keys(this.boqInventoryData);
      return categoriesInBOQData.indexOf(this.newBOQRowData.category) !== -1;
    },
    isEditedBOQRowInvalid() {
      return this.editBOQRowData.quantity === "";
    },
    areNewBOQRowFieldsInvalid() {
      return this.errors.any("newBOQ");
    },
    BOQTableConfirmLoadingIconToggle() {
      return this.existingBOQConfirmInProgress
        ? "el-icon-loading"
        : "el-icon-check";
    },
    BOQTableDeleteLoadingIconToggle() {
      return this.existingBOQDeleteInProgress
        ? "el-icon-loading"
        : "el-icon-delete";
    },
    // confirmEnabled(){
    //   return this.errors.any()? `${this.feetinvalid = true}`: `${this.feetinvalid = false}`
    // },
    AddnewData(){
      return this.errors.any()? "Please enter value 0ft 0in in this format": ""
    },
  },
  methods: {
    ...mapActions(useOrgInventoryBOQStore,{
      fetchOrganisationBOQ: 'FETCH_ORGANISATION_BOQ',
    }),
    ...mapActions(useDesignStore, {
      updateBOQTable: "UPDATE_BOQ_TABLE",
    }),
    isRowCategoryAvailableInInventory(category) {
      const availableCategoriesInInventory = Object.keys(this.boqInventoryData);
      return availableCategoriesInInventory.indexOf(category) !== -1;
    },
    onEditBOQRowCategory(rowIndex, rowMake, rowQuantity, rowCategory,distanceUnit) {
      this.isValidValue=false;
      this.NewBOQRowDataReset();
      this.assignTempValueForMakeQuantity(rowMake, rowQuantity, rowIndex, rowCategory,distanceUnit);
      this.isBOQRowBeingEdited = true;
    },
    pressed(press){
      if(this.newBOQRowData.quantity!=""){
        if(this.newBOQRowData.quantity<=0 && this.distanceUnit === 'meters'){
           this.isValidValue = true;
         setTimeout(() => {
          this.isValidValue = false;
        }, 5000);
        }
        if(this.newBOQRowData.quantity<=0 && this.distanceUnit==='feet'){
           this.isValidValueForFeet = true;
         setTimeout(() => {
          this.isValidValueForFeet = false;
        }, 5000);
        }
       this.addNewBOQRow();
        this.existingBOQConfirmInProgress = false;
      }
       if(this.editBOQRowData.quantity!=""){
         this.onConfirmBOQRowEdit(this.editBOQRowData.index, this.data.category,this.editBOQRowData.make, this.editBOQRowData.quantity,this.distanceUnit);
       }
    },
    confirmEnabled(rowCategory){
      if(this.editBOQRowData.quantity <= '0' &&(rowCategory === 'ACDB' ||
          rowCategory === 'DCDB' ||
          rowCategory === 'LA' ||
          rowCategory === 'Earthing Pit' ||
          rowCategory === 'Connectors' ||
          rowCategory === 'Elbows' ||
          rowCategory === 'Tees'||
          rowCategory === 'Monitoring Solution'||
          rowCategory === 'Coupler' )){
            this.feetinvalid = true; 
           }else{
             
       this.errors.any()? this.feetinvalid = true : this.feetinvalid = false ;
           }
       if(this.$validator.errors.items.length==1 &&  this.$validator.errors.items[0].field=="Category" ) 
       {
         this.feetinvalid = false ;
       }
        if(this.$validator.errors.items.length==2 &&  this.$validator.errors.items[0].field=="Category" ) 
       {
         this.feetinvalid = false ;
       }
       if(this.$validator.errors.items.length==3 && ( this.$validator.errors.items[0].field=="New Quantity") )
       {
         this.feetinvalid = false ;
       }
        if(this.editBOQRowData.quantity <= '0' && (this.distanceUnit === 'meters' || this.distanceUnit === 'feet') ) 
       {
         this.feetinvalid = true ;
       }

    },
    addNewEnabled(){
       this.errors.any()? this.error = true : this.error = false ;
       if(this.$validator.errors.items.length==1 && this.$validator.errors.items[0].field=="Category" )
       {
         this.error = false ;
       }
        if(this.$validator.errors.items.length==2 && this.$validator.errors.items[0].field=="New Quantity"  )
       {
         this.error = false ;
       }
       if(this.$validator.errors.items.length==2 && this.$validator.errors.items[0].msg=="The New Quantity field must be 0.001 or more."  )
       {
         this.isValidValue = true;
         setTimeout(() => {
          this.isValidValue = false;
        }, 5000);
       }
       if( this.$validator.errors.items.length ==0 )
       {
         this.isValidValue =false;
       }
       if(this.newBOQRowData.quantity === '0' && ( this.newBOQRowData.category === 'ACDB' ||
              this.newBOQRowData.category === 'DCDB' ||
              this.newBOQRowData.category === 'LA' ||
              this.newBOQRowData.category === 'Earthing Pit' ||
              this.newBOQRowData.category === 'Connectors' ||
              this.newBOQRowData.category === 'Elbows' ||
              this.newBOQRowData.category === 'Tees'||
              this.newBOQRowData.category === 'Monitoring Solution'||
              this.newBOQRowData.category === 'Coupler' ))
       {
         this.isValidValue = true;
         this.isValidValueForFeet = false;
         setTimeout(() => {
          this.isValidValue = false;
        }, 5000);
       }     

        if(this.$validator.errors.items.length==1 && this.$validator.errors.items[0].msg =="New Quantity field can't be less than 0.03 inches" )
       {
         this.isValidValueForFeet = true;
         setTimeout(() => {
          this.isValidValueForFeet = false;
        }, 5000);
       }
    },
    assignTempValueForMakeQuantity(rowMake, rowQuantity, rowIndex, rowCategory,distanceUnit) {
    
      if(rowCategory === 'Handrail' ||
         rowCategory === 'Walkways' ||
         rowCategory === 'Safetyline' ||
         rowCategory === 'DC Cable' ||
         rowCategory === 'AC Cable' ||
         rowCategory === 'Railings' ||
         rowCategory === 'Cable Conduits' ||
         rowCategory === 'Structure' ||
         rowCategory === 'Earthing Strip'||
         rowCategory === 'Lifeline'){
      if(distanceUnit === 'meters'){
         this.editBOQRowData.make = rowMake;
         this.editBOQRowData.quantity =rowQuantity;
         this.editBOQRowData.index = rowIndex;
        }
         this.editBOQRowData.make = rowMake;
         this.editBOQRowData.quantity =rowQuantity;
         this.editBOQRowData.index = rowIndex;  
      }else{
         this.editBOQRowData.make = rowMake;
         this.editBOQRowData.quantity =rowQuantity;
         this.editBOQRowData.index = rowIndex;
      }
      },
    async onConfirmBOQRowEdit(rowIndex, rowCategory,rowMake, rowQuantity,distanceUnit) {
       this.confirmEnabled(rowCategory);
       //console.log("feetInvalid value is",this.feetinvalid,rowIndex,rowCategory,rowMake,rowQuantity);
       //console.log("boq table data",this.boqTableData);
       //console.log("boq table data",this.$validator);
    
       if(this.feetinvalid===false || (this.distanceUnit==='meters' && this.editBOQRowData.quantity>0.001)){
          // this.pushUnitsToCurrentNewBOQRowQuantity( rowCategory,"edit");
          this.existingBOQConfirmInProgress = true;
          const boqTableDataCopy = [...this.boqTableData];
          boqTableDataCopy[rowIndex].make = this.editBOQRowData.make;
          boqTableDataCopy[rowIndex].quantity = String(this.editBOQRowData.quantity);
          const payload = {
            manual_bom_data: boqTableDataCopy,
          };
          await this.updateBOQTable(payload);
          this.isBOQRowBeingEdited = false;
          this.existingBOQConfirmInProgress = false;
          this.editBOQRowData.index = "";
       }


      // if(this.feetinvalid === true){
      //   return;
      // }else{
      //    this.pushUnitsToCurrentNewBOQRowQuantity( rowCategory,"edit");
      // this.existingBOQConfirmInProgress = true;
      // const boqTableDataCopy = [...this.boqTableData];
      // boqTableDataCopy[rowIndex].make = this.editBOQRowData.make;
      // boqTableDataCopy[rowIndex].quantity = this.editBOQRowData.quantity;
      // const payload = {
      //   manual_bom_data: boqTableDataCopy,
      // };
      // await this.updateBOQTable(payload);
      // this.isBOQRowBeingEdited = false;
      // this.existingBOQConfirmInProgress = false;
      // this.editBOQRowData.index = "";
      // }
       },
    async onDeleteBOQRow(rowIndex) {
      this.deletingBOQIndex = rowIndex;
      this.existingBOQDeleteInProgress = true;
      const boqTableDataCopy = [...this.boqTableData];
      boqTableDataCopy.splice(rowIndex, 1);
      const payload = {
        manual_bom_data: boqTableDataCopy,
      };
      await this.updateBOQTable(payload);
      if (this.isBOQRowBeingEdited && rowIndex === this.editBOQRowData.index) {
        this.isBOQRowBeingEdited = false;
        this.editBOQRowData.index = "";
      }
      // when editing row place gets changed
      else if (
        this.isBOQRowBeingEdited &&
        rowIndex < this.editBOQRowData.index
      ) {
        this.editBOQRowData.index -= 1;
        this.manageTableRendering();
      }
      this.existingBOQDeleteInProgress = false;
      this.deletingBOQIndex = "";
    },
    NewBOQRowDataReset() {
      this.feetinvalid = false ;
      this.newBOQRowData.category="";
      this.newBOQRowData.quantity = "";
      this.newBOQRowData.make = "";
    },
    resetNewBOQRowData() {
      if( this.newBOQRowData.category === 'ACDB' ||
              this.newBOQRowData.category === 'DCDB' ||
              this.newBOQRowData.category === 'LA' ||
              this.newBOQRowData.category === 'Earthing Pit' ||
              this.newBOQRowData.category === 'Connectors' ||
              this.newBOQRowData.category === 'Elbows' ||
              this.newBOQRowData.category === 'Tees'||
              this.newBOQRowData.category === 'Monitoring Solution'||
              this.newBOQRowData.category === 'Coupler' ){
      this.newBOQRowData.quantity = "";
      this.newBOQRowData.make = "";
              }
    },
    manageTableRendering() {
      this.IsTableRendering = true;
      setTimeout(() => {
        this.IsTableRendering = false;
      }, 1500);
    },
    tableHeaderStyle({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0) {
        return "display:none";
      }
    },
    async addNewBOQRow() {
      
      this.addNewEnabled();
      const areNewBOQFieldsValid = await this.$validator.validateAll("newBOQ");
      if (!Number(this.newBOQRowData.quantity)|| this.newBOQRowData.category === ''){
        this.isQuantityValid = false;
        setTimeout(() => {
          this.isQuantityValid = true;
        }, 5000);
        return;
      }
      if(this.isValidValue == true ){
        return;
      }
       if(this.error===false || (this.distanceUnit==='meters' && this.newBOQRowData.quantity >0.001)){
      if (areNewBOQFieldsValid) {
        this.newRowAdditionInProgress = true;
        // this.pushUnitsToCurrentNewBOQRowQuantity(this.newBOQRowData.category,"new");
        let payload = {};
        if (Array.isArray(this.boqTableData)) {
          let boqTableDataCopy = [...this.boqTableData];
          boqTableDataCopy.push(this.newBOQRowData);
          for(let j=0;j<boqTableDataCopy.length;j++){
            boqTableDataCopy[j].quantity = String( boqTableDataCopy[j].quantity);
          }
          payload = {
            manual_bom_data: boqTableDataCopy,
          };
        } else {
          this.newBOQRowData.quantity = String(this.newBOQRowData.quantity);
          payload = {
            manual_bom_data: [this.newBOQRowData],
          };
        }
        try{
          await this.updateBOQTable(payload);
        }catch(error){
          let errorMessage = error.response.status === 403 ?
           "You don't have permission to edit this project." : 'error'
          this.$message({
            showClose: true,
            message: errorMessage,
            type: "error",
            center: true
          })
        }
        this.newRowAdditionInProgress = false;
      }
      this.newBOQRowData = {
        category: "",
        make: "",
        quantity: "",
      }
       }
    },
    measurementUnit(category) {
      if( 
          category === 'Handrail' ||
          category === 'Walkways' ||
          category === 'Safetyline' ||
          category === 'DC Cable' ||
          category === 'AC Cable' ||
          category === 'Lifeline' ||
          category === 'Railings' ||
          category === 'Cable Conduits' ||
          category === 'Structure' ||
          category === 'Earthing Strip'
        ) {
          return this.distanceUnit === 'meters'? "m":"";
        }
      else {
        return "No."
      }  
    },
    pushUnitsToCurrentNewBOQRowQuantity(category,type){
       if( 
          category === 'Handrail' ||
          category === 'Walkways' ||
          category === 'SafetyLine' ||
          category === 'DC Cable' ||
          category === 'AC Cable' ||
          category === 'Lifeline' ||
          category === 'Railings' ||
          category === 'Cable Conduits' ||
          category === 'Earthing Strip'
        ) {
          if(type ==='new'){
            let str1 = String(this.newBOQRowData.quantity);
           // if(!str1.includes('m'))
           // this.newBOQRowData.quantity +=' m';
          }
          else if(type ==='edit'){
            let str2 = String(this.editBOQRowData.quantity);
           // if(this.distanceUnit === 'meters' && !str2.includes('m'))
            //this.editBOQRowData.quantity +=' m';
          }
        }
      else {
          if(type ==='new'){
            let str1 = String(this.newBOQRowData.quantity);
            if(!str1.includes('No.'))
            this.newBOQRowData.quantity +=' No.';
          }
          else if(type === 'edit'){
            let str2 = String(this.editBOQRowData.quantity);
            if(!str2.includes('No.'))
            this.editBOQRowData.quantity+=' No.';
          }
      }  
    },
    isComponentCountable(comp) {
      let countableComps = [
        'ACDB',
        'DCDB',
        'LA',
        'Earthing Pit',
        'Connectors',
        'Elbows',
        'Tees',
        'Monitoring Solution',
        'Coupler',
        'Battery'
      ]
      return countableComps.includes(comp)
    },
    isComponentNonCountable(comp) {
      let nonCountableComps = [
        'Handrail',
        'Walkways',
        'Safetyline',
        'DC Cable',
        'AC Cable',
        'Railings',
        'Cable Conduits', 
        'Earthing Strip',
        'Lifeline',
      ]
      return nonCountableComps.includes(comp)
    },
    isCrmUser,
  },
};
</script>

<style scoped>
.el-icon-check, .el-icon-loading{
  background-color: transparent;
  border-color: transparent;
  cursor: pointer;
  color: #606266;
  font-size: 20px;
}
.feetVal{
      display: flex;
    justify-content: flex-end;
    margin-right: 153px;
}

.incentive-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 16px 0px 16px;
}

.card .incentive-header h4 {
    font-size: 16px;
    font-weight: 600 !important;
    color: black;
}
.Active{
  border:none;
}
.select_dropdown{
  color: black;
}
.input-group-prepend >>> input {
  border:none !important;
}
.input-group-prepend >>> input::-webkit-input-placeholder {
    color: rgb(109, 108, 108);
}
.input-group-prepend >>>  input::-moz-input-placeholder {
  color: rgb(109, 108, 108);
}
.input-group-prepend >>>  input::-ms-input-placeholder {
  color: rgb(109, 108, 108);
}
.el-select >>> input{
  color: black;
  height: 49px;
  border: 1px solid #a5a4a4;
}
th.col1{
  width: 17.5%
}
th.col2 {
  width: 52.5%;
}

.card .card_header{
  height: 48px !important;
}

.card .card_header h4 {
    font-size: 16px;
    font-weight: 600 !important;
    color: var(--primary);
}

.card_content_CRM {
  padding: 24px 16px 24px 16px;
}

.mobileScreen{
  display: none;
}
.meterValMobile{
  display:none;
}

.desktopScreen{
  display: flex;
  justify-content:flex-start;
  font-size: 13px;
  margin-top: 4px;
  color:red;
}
.meterValDesktop{
   display: flex;
  justify-content: flex-start;
  font-size: 13px;
  margin-top: 4px;
  color:red;
}


@media screen and (max-width: 768px) {
  .el-select >>> input{
  height: 39px;
}

.mobileScreen{
  display: flex;
  font-size: 13px;
  margin-top: 4px;
  color:red;
}

.meterValMobile{
  display: flex;
  font-size: 13px;
  margin-top: 4px;
  color:red;
}

.desktopScreen{
  display: none;
}
.meterValDesktop{
  display:none;
}
  
.smallScreen{
    height: 39px !important;
}

.field_group .input-group-prepend .btn {
    padding: 0px !important;
}
 .note1st{
   display:none;
 }
 .note{
   display:flex;
 }
}


</style>