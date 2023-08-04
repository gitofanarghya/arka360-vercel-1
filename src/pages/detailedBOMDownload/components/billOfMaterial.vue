<template>
                 <div v-if="activePage==='bom'" class="tab_content" id="tab2" v-loading.fullscreen.lock="isLoading">
                     <button @click="printDiv('tab2')" class="noprint printPDF">Print</button>
                        <div class="card ">
                            <div class="card_content feild_content">
                                <h4 class="table_title">Customer Order Details</h4>
                                <div class="row">
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Version Name</label>
                                            <div class="replaceInput" >{{customerOrderDetails.title || '-'}}</div>
                                        </div>
                                        
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Project Name</label>
                                            <div class="replaceInput">{{customerOrderDetails.projectName || '-'}}</div>
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Project Location</label>
                                            <div class="replaceInput">{{customerOrderDetails.location || '-'}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Customer Contact Name</label>
                                            <div class="replaceInput">{{customerOrderDetails.customerName || '-'}}</div>
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Created By</label>
                                            <div class="replaceInput">{{customerOrderDetails.projectManager || '-'}}</div>
                                        </div>
                                    </div>
                                     <div class="col col-4">
                                        <div class="input_area">
                                            <label>System Capacity Wp</label>
                                            <div class="replaceInput">{{customerOrderDetails.systemCapacityWp || '-'}}</div>
                                        </div>
                                    </div>
                                    <!-- <div class="col col-4">
                                        <div class="input_area">
                                            <label>Sales Person Name</label>
                                            <div class="replaceInput">{{customerOrderDetails.salesPerson || '-'}}</div>
                                        </div>
                                    </div> -->
                                </div>
                                <div class="row">
                                    <!-- <div class="col col-4">
                                        <div class="input_area">
                                            <label>Payment Terms</label>
                                             <div class="replaceInput">{{customerOrderDetails.paymentTerms || '-'}}</div>
                                        </div>
                                    </div> -->
                                    <!-- <div class="col col-4">
                                        <div class="input_area">
                                            <label>Module Wattage</label>
                                            <input type="text" v-model="customerOrderDetails.moduleWattage" />
                                        </div>
                                    </div> -->
                                    <!-- <div class="col col-4">
                                        <div class="input_area">
                                            <label>System Capacity Wp</label>
                                            <div class="replaceInput">{{customerOrderDetails.systemCapacityWp || '-'}}</div>
                                        </div>
                                    </div> -->
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Created At</label>
                                            <div class="replaceInput">{{createdAt || '-'}}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="button_group" v-if="enableUpdateCustomerOrderDetails()">
                                    <button class="btn btn-outline" @click="onCancelCustomerOrderDetails()">Cancel</button>
                                    <button class="btn btn-primary" @click="updateCustomerOrderDetails()">Save</button>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card_content">
                                <div class="filter_value noprint" >
                                    <div class="select_area">
                                        <el-select
                                        v-model="roofType"
                                        @change="changeRoofType"
                                        >
                                            <el-option
                                              v-for="type in allRoofTypes"
                                              :key="type.value"
                                              :label="type.label"
                                              :value="type.value"
                                            />
                                        </el-select>
                                    </div>
                                </div>

                                <div class="table_component">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th v-if="roleForTATA==='ADMIN'">Part Number</th>
                                                <th v-else></th>
                                                <th>Descritpion</th>
                                                <th>UOM</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <!-- <th>Actions</th> -->
                                            </tr>
                                        </thead>
                                        <tbody v-for="(keyName,index) in currentRoofKeyArray" :key="index">
                                            <tr v-if="currentRoof[keyName].length">
                                                <th colspan="6"  v-if="(roleForTATA==='CP' || (roleForTATA!=='CP' && !balanceOfSupplyCheck ))
                                                 && keyName!=='Installation Kit' && keyName!=='Lightning Arrester and Earthing' && keyName!=='AC Cables'
                                                 && keyName!=='Ceig Charges' && keyName!=='Freight Charges' && keyName!=='Service IC'">
                                                    {{keyName}}
                                                </th>
                                                <th colspan="6" v-if="(roleForTATA!=='CP' && balanceOfSupplyCheck)">{{keyName}}</th>
                                            </tr>
                                            <template v-if="(roleForTATA==='CP' || (roleForTATA!=='CP' && !balanceOfSupplyCheck )) 
                                                && keyName!=='Installation Kit' && keyName!=='Lightning Arrester and Earthing' && keyName!=='AC Cables'
                                                && keyName!=='Ceig Charges' && keyName!=='Freight Charges' && keyName!=='Service IC'">
                                                <tr v-for="(item,index1) in currentRoof[keyName]" :key="index1">

                                                  <td></td>
                                                  <td v-if="roleForTATA==='ADMIN'">{{item.partnumber}}</td>
                                                  <td v-else></td>
                                                  <td>{{item.description}}</td>
                                                  <td>{{item.UoM}}</td>
                                                  <td>{{item.quantity}}</td>
                                                  <td></td> 
                                                  <!-- <td></td>   -->
                                            </tr>
                                            </template>

                                            <template v-if="(roleForTATA!=='CP' && balanceOfSupplyCheck)">
                                                <tr v-for="(item,index1) in currentRoof[keyName]" :key="index1">

                                                  <td></td>
                                                  <td v-if="roleForTATA==='ADMIN'">{{item.partnumber}}</td>
                                                  <td v-else></td>
                                                  <td>{{item.description}}</td>
                                                  <td>{{item.UoM}}</td>
                                                  <td>{{item.quantity}}</td>
                                                  <td></td> 
                                                  <!-- <td></td>   -->
                                            </tr>
                                            </template>
                                        </tbody>
                                        <tbody v-if="showAddCustomItem">
                                            <tr class="add_tr_items">
                                                <td>
                                                    <div class="input_area">
                                                        <label>Category</label>
                                                        <input type="text" v-model="customItem.category" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="input_area">
                                                        <label>Part Number</label>
                                                        <input type="text" v-model="customItem.partNumber" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="input_area">
                                                        <label>Description</label>
                                                        <textarea type="text" v-model="customItem.description" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="input_area">
                                                        <label>UOM</label>
                                                        <input type="text" v-model="customItem.uom" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="input_area">
                                                        <label>QTY</label>
                                                        <input type="text" v-model="customItem.qty" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="input_area">
                                                        <label>Price</label>
                                                        <input type="number" v-model="customItem.price" />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="item_action">
                                                        <div class="action_icon">
                                                            <span @click="postNewCustomItem()" class="add_icon"></span>
                                                            <span @click="cancelAddNewItem()" class="remove_icon"></span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr> 
                                        </tbody>
                                    </table>
                                </div>
                                <!-- <div class="add_rows_items noprint">
                                    <span class="setCursor" @click="showAddCustomItem = true">
                                        <span class="plus">+</span>
                                        <span class="add_text">Add Custom Item</span>
                                    </span>
                                </div> -->
                            </div>
                        </div>      
                        <ChecksForBOM
                            :dialogFormVisible="dialogFormVisible"
                            :messageForCheck="messageForCheck"
                            @close="dialogFormVisible=false"
                            @cancelDelete="dialogFormVisible = false"
                        />
                </div>
</template>

<script>
import API from '@/services/api/';
import ChecksForBOM from './ChecksForBOMToRedirect.vue'
export default {
      data(){
        return {
            designId: this.$route.params.designId,
            roofs:{},
            currentRoof:{},
            totalRoofCount:0,
            currentRoofKeyArray:[],
            selectedRoofNo:"1",
            allRoofTypes : [],
            roofType:"allRoofs",
            customerOrderDetails:{
                    title:"",
                    projectName:"",
                    location:"",
                    customerName:"",
                    paymentTerms:"",
                    systemCapacityWp:"",
                    projectManager:"",
                    salesPerson:"",
            },

            customerOrderDetailsTemp:{
                    title:"",
                    projectName:"",
                    location:"",
                    customerName:"",
                    paymentTerms:"",
                    systemCapacityWp:"",
                    projectManager:"",
                    salesPerson:"",
            },
            showAddCustomItem:false,
            customItem:{
                category:"",
                partNumber:"",
                description:"",
                uom:"",
                qty:"",
                price:"",
            },
            incomingCustomItemArray:[],
            editBOQRowData:{
                category:"",
                index:"",
                partNumber:"",
                description:"",
                uom:"",
                qty:"",
                price:"",
            },
            isBOQRowBeingEdited: false,
            existingBOQConfirmInProgress:false,
            deletingBOQIndex: "",
            existingBOQDeleteInProgress:false,
            bomData:{},
            rowNo:0,
            isLoading:true,
            inverterDescriptionArray: [],
            isInverterValid:true,
            dialogFormVisible:false,
            messageForCheck:'',
            summary:{},
            createdAt:'',



        };
    },
    components:{
        ChecksForBOM,
    },
    props:{
        activePage:{
            type: String,
            default: '',
        },
        roleForTATA:{
                    type: String,
                    default: 'CP',
        },
        balanceOfSupplyCheck:{
                type : Boolean,
                default:false,
        }
    },
    computed:{
         
    },

    // watch:{
    //     bomData:{
    //         deep:true,
    //         handler(value){
    //             console.log("BOM data changed");
    //             this.bomData = value;
    //             this.fetchBOMInformation();
    //         }
    //     }
    // },
    mounted(){
       this.fetchBOMInformation();
    },
    methods:{
             
            printDiv(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            var originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
        },

           
            async fetchBOMInformation(){
                try{
                    const response = await API.DESIGNS.GENERATE_DETAILED_BOM(this.designId);
                    // const response = this.bomData;
                    this.bomData = response;
                    this.roofs = response.data.Roof;
                    this.totalRoofCount = Object.keys(this.roofs).length;
                    this.updateAllRoofTypes();
                    this.currentRoof = JSON.parse(JSON.stringify(response.data["All Roofs"]));
                    this.createdAt = response.data.bom_generated_date;
                    this.initializeCustomerOrderDetails();
                    this.currentRoofKeyArray = Object.keys(this.currentRoof);
                    this.initializeIncomingCustomItem(response);
                    this.isLoading = false;
                    await  this.redirectToDetailedBOM(response.data["All Roofs"])
                }
                catch{
                      this.isLoading = true;
                      this.dialogFormVisible=true;
                      this.messageForCheck = "Problem with API or Inverter Selection";
                }
            },

            async  redirectToDetailedBOM(obj){
                try{
                    const response = await API.DESIGNS.FETCH_DESIGN(this.designId, false);
                    this.summary = response.data.versions.summary;
                         let ac =    this.summary.ac_size;
                         let dc =    this.summary.nameplate_dc_size;
                      if(ac * dc === 0){
                          this.dialogFormVisible=true;
                          this.messageForCheck = "noInverter";
                      }
                      else if((this.summary.nameplate_dc_size)*1000 <10000 || (this.summary.nameplate_dc_size)*1000 >1000000){
                          this.dialogFormVisible=true;
                          this.messageForCheck = "generationNotInRange";
                      }
                      else{
                          this.checkValidInverters(obj);
                      }
                }
                    catch(e){
                          if (e.response.status) {
                            if (e.response.status === 404 || e.response.status === 403) {
                                this.$message({
                                    showClose: true,
                                    message: 'Design not found. Redirecting to Home Page ...',
                                    type: 'error',
                                });
                            }
                            else if (e.response.status === 500) {
                                this.$message({
                                    showClose: true,
                                    message: 'Error in loading design. Please try again.',
                                    type: 'error',
                                });
                            }
                            setTimeout(()=>{ this.$router.push({ name: 'home' })}, 2000 );
                        }
                    }
                  
                },

                checkValidInverters(obj){
                    let inverterArray = [];
                    inverterArray = obj["Inverter"];
                    console.log("all inverter's list",inverterArray,obj);
                    for(let i=0; i<inverterArray.length;i++){
                        this.inverterDescriptionArray.push(inverterArray[i].description);
                    }
                    this.isInverterValid=true;
                    console.log("inverter description array",this.inverterDescriptionArray);
                    for(let i=0;i<this.inverterDescriptionArray.length;i++){
                        let currentInverterDescription = this.inverterDescriptionArray[i];
                        if(!(currentInverterDescription.includes("Solis")|| currentInverterDescription.includes("Goodwe"))){
                            this.isInverterValid = false;
                            break;
                        }
                    }
                    if(this.isInverterValid===false){
                        this.dialogFormVisible = true;
                        this.messageForCheck = "invalidInverters";
                        console.log("invalid inverter");
                    }
                    
                },

            initializeIncomingCustomItem(response){
                let additionalBOM = response.data.billOfMaterial["addtionalBOM"];
                if(additionalBOM){
                    this.incomingCustomItemArray = [];
                    this.incomingCustomItemArray = additionalBOM;
                }
                else{
                    this.incomingCustomItemArray = [];
                }
            },

            updateAllRoofTypes(){
                this.allRoofTypes=[
                    {
                        value: "allRoofs",
                        label: "All Roofs",
                    }
                ];
                for(let i=1 ; i<= this.totalRoofCount;i++)
                {   
                    this.allRoofTypes.push(
                        {
                            value: `roof${i}`,
                            label:`Roof ${i}`,
                        }
                    )
                }
            },

            changeRoofType(){
                if(this.roofType==='allRoofs'){
                    this.currentRoof = JSON.parse(JSON.stringify(this.bomData.data["All Roofs"]));
                }
                else{
                    let str = this.roofType;
                    this.seletedRoofNo = str.substring(4)
                    this.currentRoof = JSON.parse(JSON.stringify(this.roofs[str.substring(4)]));
                }
                this.initializeCustomerOrderDetails();
                this.currentRoofKeyArray = Object.keys(this.currentRoof);
            },

            initializeCustomerOrderDetails(){
                this.customerOrderDetailsTemp.title = this.bomData.data.billOfMaterial.customerOrderDetails["title"];
                this.customerOrderDetailsTemp.projectName = this.bomData.data.billOfMaterial.customerOrderDetails["projectName"];
                this.customerOrderDetailsTemp.paymentTerms = this.bomData.data.billOfMaterial.customerOrderDetails["paymentTerms"];
                this.customerOrderDetailsTemp.systemCapacityWp = this.bomData.data.billOfMaterial.customerOrderDetails["systemCapacityWp"];
                this.customerOrderDetailsTemp.location = this.bomData.data.billOfMaterial.customerOrderDetails["location"]['display_name'];
                this.customerOrderDetailsTemp.customerName = this.bomData.data.billOfMaterial.customerOrderDetails["customerName"][0];
                this.customerOrderDetailsTemp.salesPerson = this.bomData.data.billOfMaterial.customerOrderDetails["salesPerson"];
                this.customerOrderDetailsTemp.projectManager = this.bomData.data.billOfMaterial.customerOrderDetails["projectManager"];
                this.onCancelCustomerOrderDetails();  
            },
            
            onCancelCustomerOrderDetails(){
                this.customerOrderDetails.title = this.customerOrderDetailsTemp.title;
                this.customerOrderDetails.projectName = this.customerOrderDetailsTemp.projectName;
                this.customerOrderDetails.paymentTerms = this.customerOrderDetailsTemp.paymentTerms;
                this.customerOrderDetails.systemCapacityWp = this.customerOrderDetailsTemp.systemCapacityWp;
                this.customerOrderDetails.location =  this.customerOrderDetailsTemp.location ;
                this.customerOrderDetails.customerName =  this.customerOrderDetailsTemp.customerName ;
                this.customerOrderDetails.salesPerson = this.customerOrderDetailsTemp.salesPerson ;
                this.customerOrderDetails.projectManager = this.customerOrderDetailsTemp.projectManager ;
            },

            enableUpdateCustomerOrderDetails(){
                return (
                    (this.customerOrderDetails.title != this.customerOrderDetailsTemp.title) ||
                    (this.customerOrderDetails.projectName != this.customerOrderDetailsTemp.projectName) ||
                    (this.customerOrderDetails.paymentTerms != this.customerOrderDetailsTemp.paymentTerms) ||
                    (this.customerOrderDetails.systemCapacityWp != this.customerOrderDetailsTemp.systemCapacityWp) ||
                    (this.customerOrderDetails.location !=  this.customerOrderDetailsTemp.location) ||
                    (this.customerOrderDetails.customerName !=  this.customerOrderDetailsTemp.customerName) ||
                    (this.customerOrderDetails.salesPerson != this.customerOrderDetailsTemp.salesPerson) ||
                    (this.customerOrderDetails.projectManager != this.customerOrderDetailsTemp.projectManager)
                );
            },

           async updateCustomerOrderDetails(){
                const patchData = {
                    "title":this.customerOrderDetails.title,
                    "projectName": this.customerOrderDetails.projectName,
                    "location": this.customerOrderDetails.location, 
                    "customerName": this.customerOrderDetails.customerName,
                    "projectManager": this.customerOrderDetails.projectManager,
                    "salesPerson":this.customerOrderDetails.salesPerson,
                    "paymentTerms": this.customerOrderDetails.paymentTerms,
                    "systemCapacityWp": this.customerOrderDetails.systemCapacityWp,
                };
                try{
                    await API.DESIGNS. UPDATE_BILL_OF_MATERIAL(this.designId,patchData);
                    this.customerOrderDetailsTemp = JSON.parse(JSON.stringify(this.customerOrderDetails));
                    this.$message({
                            showClose: true,
                            message: 'Successfully Updated!',
                            type: 'success',
                    });
                }
                catch{
                    this.onCancelCustomerOrderDetails();
                    this.$message({
                        showClose: true,
                        message: 'Error ',
                        type: 'error',
                    });
                }
            },

            async postNewCustomItem(){

                let currentNewCustomItem = [];
                let tempObj = {
                                        category:this.customItem.category,
                                        partNumber:this.customItem.partNumber,
                                        description:this.customItem.description,
                                        uom:this.customItem.uom,
                                        qty:this.customItem.qty,
                                        price: this.customItem.price,
                             }
                currentNewCustomItem.push(tempObj);     
                if(this.incomingCustomItemArray.length>0){
                    this.incomingCustomItemArray.push(tempObj);
                }
                else{
                    this.incomingCustomItemArray = [];
                    this.incomingCustomItemArray.push(tempObj);
                }
                const postData = {
                     "addtionalBOM" : this.incomingCustomItemArray
                };

                try{
                    const response = await API.DESIGNS.POST_NEW_CUSTOM_ITEM(this.designId,postData);
                    this.showAddCustomItem = false;
                    this.customItem =   {
                                            category:"",
                                            partNumber:"",
                                            description:"",
                                            uom:"",
                                            qty:"",
                                            price:"",
                                        };
                    this.$message({
                            showClose: true,
                            message: 'Successfully Added!',
                            type: 'success',
                    });
                    
                }
                catch{
                    this.$message({
                            showClose: true,
                            message: 'Error',
                            type: 'error',
                    });
                }
            },

            onEditBOQRowCategory(rowIndex, rowCategory, rowPartNumber, rowDescription, rowUOM, rowQTY,rowPrice) {   
                this.assignTempValueForBOQRow(rowIndex,rowCategory, rowPartNumber, rowDescription, rowUOM, rowQTY,rowPrice);
                this.isBOQRowBeingEdited = true;
            },
            assignTempValueForBOQRow(rowIndex, rowCategory, rowPartNumber, rowDescription, rowUOM, rowQTY,rowPrice) {
                this.editBOQRowData.category = rowCategory;
                this.editBOQRowData.index = rowIndex;
                this.editBOQRowData.partNumber = rowPartNumber;
                this.editBOQRowData.description = rowDescription;
                this.editBOQRowData.uom = rowUOM;
                this.editBOQRowData.qty= rowQTY;
                this.editBOQRowData.price = rowPrice;
            },

            async onConfirmBOQRowEdit(rowIndex) {
                this.existingBOQConfirmInProgress = true;
                const boqTableDataCopy = [...this.incomingCustomItemArray];
                boqTableDataCopy[rowIndex].category = this.editBOQRowData.category;
                boqTableDataCopy[rowIndex].partNumber = this.editBOQRowData.partNumber;
                boqTableDataCopy[rowIndex].description = this.editBOQRowData.description;
                boqTableDataCopy[rowIndex].uom = this.editBOQRowData.uom;
                boqTableDataCopy[rowIndex].qty = this.editBOQRowData.qty;
                boqTableDataCopy[rowIndex].price = this.editBOQRowData.price;
                const payload = {
                "addtionalBOM" : boqTableDataCopy,
                };

                try{
                    const response = await API.DESIGNS.POST_NEW_CUSTOM_ITEM(this.designId,payload);
                    this.cancelAddNewItem();
                    this.$message({
                            showClose: true,
                            message: 'Successfully Edited!',
                            type: 'success',
                    });
                    
                }
                catch{
                    this.$message({
                            showClose: true,
                            message: 'Error',
                            type: 'error',
                    });
                }
                this.isBOQRowBeingEdited = false;
                this.existingBOQConfirmInProgress = false;
                this.editBOQRowData.index = "";
            },

             async onDeleteBOQRow(rowIndex) {
                this.deletingBOQIndex = rowIndex;
                this.existingBOQDeleteInProgress = true;
                const boqTableDataCopy = [...this.incomingCustomItemArray];
                boqTableDataCopy.splice(rowIndex, 1);
                this.incomingCustomItemArray.splice(rowIndex, 1);
                const payload = {
                "addtionalBOM" : boqTableDataCopy,
                };

                 try{
                    const response = await API.DESIGNS.POST_NEW_CUSTOM_ITEM(this.designId,payload);
                    this.$message({
                            showClose: true,
                            message: 'Successfully Deleted!',
                            type: 'success',
                    });
                }
                catch{
                    this.$message({
                            showClose: true,
                            message: 'Error!',
                            type: 'error',
                    });
                }
                if (this.isBOQRowBeingEdited && rowIndex === this.editBOQRowData.index) {
                this.isBOQRowBeingEdited = false;
                this.editBOQRowData.index = "";
                }
                this.existingBOQDeleteInProgress = false;
                this.deletingBOQIndex = "";
            },

            cancelAddNewItem(){
                this.showAddCustomItem = false;
                this.customItem =   {
                                        category:"",
                                        partNumber:"",
                                        description:"",
                                        uom:"",
                                        qty:"",
                                        price:"",
                                    };
            }
            
    },
}
</script>


<style scoped>

table {page-break-before: always;}

.noshow{
    /* display: none; */
    visibility: hidden;
}

@media print 
{
    @page {
        size: A2;  
        margin-top:-5px;
        margin-bottom: -10px;
    }
    .noprint {
                  /* visibility: hidden; */
                  display: none;
    }
    html, body {
        width: 210mm;
        /* height: 282mm; */
        height:auto;
        font-size: 11px;
        background: #FFF;
        overflow:visible;
    }
    body {
        padding-top:15mm;
    }
}

.remove_icon{
    margin-left: 8px;
}
.setCursor{
    cursor: pointer;
}
.replaceInput{
    padding: 10px 16px;
  border-radius: 4px;
  border: solid 1px #cccccc;
  background-color: #ffffff;
  width: 100%;
  font-size: 16px;
}

.noshow{
    /* display: none; */
    visibility: hidden;
}
.printPDF{
    padding: .55rem 1.5rem;
    background-color: #409eff;
    background-image: linear-gradient(180deg,var(--danger),#3092f7);
    color: white;
    border: 1px solid #999;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    line-height: 1.42857143;
    font-size: 0.950rem;

}
</style>

<style scoped>

.btn {
  color: white;
  background-color: #f46545;
  border-color: #f46545;
  padding: 8px 20px;
  font-size: 14px;
  line-height: 1.78;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
}
.btn:focus,
.btn.focus {
  color: white;
  background-color: #f13d15;
  border-color: #af280a;
  outline: none;
}
.btn:hover {
  color: white;
  background-color: #f13d15;
  border-color: #ee370e;
}
.btn:active,
.btn.active,
.open > .btn.dropdown-toggle {
  color: white;
  background-color: #f13d15;
  background-image: none;
  border-color: #ee370e;
}
.btn:active:hover,
.btn:active:focus,
.btn:active.focus,
.btn.active:hover,
.btn.active:focus,
.btn.active.focus,
.open > .btn.dropdown-toggle:hover,
.open > .btn.dropdown-toggle:focus,
.open > .btn.dropdown-toggle.focus {
  color: white;
  background-color: #d6310d;
  border-color: #af280a;
}
.btn.disabled:hover,
.btn.disabled:focus,
.btn.disabled.focus,
.btn[disabled]:hover,
.btn[disabled]:focus,
.btn[disabled].focus,
fieldset[disabled] .btn:hover,
fieldset[disabled] .btn:focus,
fieldset[disabled] .btn.focus {
  background-color: #f46545;
  border-color: #f46545;
}
.btn .badge {
  color: #f46545;
  background-color: white;
}
.btn-primary {
  color: white;
  background-color: #f46545;
  border-color: #f46545;
}
.btn-primary:focus,
.btn-primary.focus {
  color: white;
  background-color: #f13d15;
  border-color: #af280a;
  outline: none;
}
.btn-primary:hover {
  color: white;
  background-color: #f13d15;
  border-color: #ee370e;
}
.btn-primary:active,
.btn-primary.active,
.open > .btn-primary.dropdown-toggle {
  color: white;
  background-color: #f13d15;
  background-image: none;
  border-color: #ee370e;
}
.btn-primary:active:hover,
.btn-primary:active:focus,
.btn-primary:active.focus,
.btn-primary.active:hover,
.btn-primary.active:focus,
.btn-primary.active.focus,
.open > .btn-primary.dropdown-toggle:hover,
.open > .btn-primary.dropdown-toggle:focus,
.open > .btn-primary.dropdown-toggle.focus {
  color: white;
  background-color: #d6310d;
  border-color: #af280a;
}
.btn-primary.disabled:hover,
.btn-primary.disabled:focus,
.btn-primary.disabled.focus,
.btn-primary[disabled]:hover,
.btn-primary[disabled]:focus,
.btn-primary[disabled].focus,
fieldset[disabled] .btn-primary:hover,
fieldset[disabled] .btn-primary:focus,
fieldset[disabled] .btn-primary.focus {
  background-color: #f46545;
  border-color: #f46545;
}
.btn-primary .badge {
  color: #f46545;
  background-color: white;
}
.btn-outline {
  color: #222;
  background-color: white;
  border-color: #999;
}
.btn-outline:focus,
.btn-outline.focus {
  color: #222;
  background-color: #e6e6e6;
  border-color: #595959;
  outline: none;
}
.btn-outline:hover {
  color: #222;
  background-color: #e6e6e6;
  border-color: #7a7a7a;
}
.btn-outline:active,
.btn-outline.active,
.open > .btn-outline.dropdown-toggle {
  color: #222;
  background-color: #e6e6e6;
  background-image: none;
  border-color: #7a7a7a;
}
.btn-outline:active:hover,
.btn-outline:active:focus,
.btn-outline:active.focus,
.btn-outline.active:hover,
.btn-outline.active:focus,
.btn-outline.active.focus,
.open > .btn-outline.dropdown-toggle:hover,
.open > .btn-outline.dropdown-toggle:focus,
.open > .btn-outline.dropdown-toggle.focus {
  color: #222;
  background-color: #d4d4d4;
  border-color: #595959;
}
.btn-outline.disabled:hover,
.btn-outline.disabled:focus,
.btn-outline.disabled.focus,
.btn-outline[disabled]:hover,
.btn-outline[disabled]:focus,
.btn-outline[disabled].focus,
fieldset[disabled] .btn-outline:hover,
fieldset[disabled] .btn-outline:focus,
fieldset[disabled] .btn-outline.focus {
  background-color: white;
  border-color: #999;
}
.btn-outline .badge {
  color: white;
  background-color: #222;
}

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
.d-flex {
  display: -webkit-box;
  display: -moz-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

.d-inline-flex {
  display: -webkit-inline-box;
  display: -moz-inline-box;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  -ms-justify-content: space-between;
  justify-content: space-between;
  -ms-flex-pack: space-between;
}

.justify-content-center {
  -webkit-justify-content: center;
  -moz-justify-content: center;
  -ms-justify-content: center;
  justify-content: center;
  -ms-flex-pack: center;
}

.w-100 {
  width: 100%;
}

.col-50 {
  -ms-flex: 0 0 50%;
  flex: 0 0 50%;
  max-width: 50%;
}

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

.check_group {
  display: flex;
  flex-wrap: wrap;
}
.check_group .checkbox {
  margin-top: 16px;
}
.check_group .checkbox:not(:last-child) {
  margin-right: 12px;
  min-width: 160px;
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

.parameter_items {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}
.parameter_items li {
  display: flex;
  margin-top: 8px;
}
.parameter_items li .param_title {
  flex-grow: 1;
  padding-right: 8px;
  font-size: 16px;
  margin-top: 12px;
}
.parameter_items li .param_field {
  min-width: 120px;
  width: 120px;
}
.parameter_items li .param_field .pct {
  top: 9px;
}
.parameter_items li .param_field input,
.parameter_items li .param_field select {
  background: #f6f8f9;
  padding-top: 8px;
  padding-bottom: 8px;
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


</style>


<style scoped>
@media print{
    .noprint{
        display: none;
    }

}
</style>


