<template>
                 <div v-if="activePage==='summary'" class="tab_content" id="tab1" v-loading.fullscreen.lock="isLoading" >
                        <div class="card">
                            <div class="card_content">
                                <div class="row">
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label > Forex Rate (INR/USD)</label>
                                            <input type="number" class="cursorClass" v-model="firstObj.dollarRate" :disabled="roleForTATA!=='ADMIN'" />
                                        </div>
                                    </div>
                                    <div class="col col-4" v-if="!(roleForTATA==='CP')">
                                        <div class="input_area">
                                            <label>PV Module Price in cents</label>
                                            <input type="number" class="cursorClass" v-model="firstObj.moduleCost" :disabled="roleForTATA!=='ADMIN'" />
                                        </div>
                                    </div>
                                     <div class="col col-4" v-if="!(roleForTATA==='CP')" >
                                        <div class="input_area">
                                            <label>Warehouse (for material supply)</label>
                                            <!-- <input type="number" v-model="firstObj.entryDistance" /> -->
                                                <el-select
                                                    v-model="firstObj.warehouseCity"
                                                    class="cursorClass"
                                                    :class="{disabled: roleForTATA==='Sales Manager'}"
                                                    :disabled="roleForTATA==='Sales Manager'"
                                                    >
                                                        <el-option
                                                        v-for="warehouse in warehouseCityArray"
                                                        :key="warehouse.value"
                                                        :label="warehouse.label"
                                                        :value="warehouse.value"
                                                        />
                                                </el-select>
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Number of Data Monitoring Systems</label>
                                            <input type="number" v-model="firstObj.dataMonitoring" />
                                        </div>
                                    </div>
                                    <div class="col col-4" v-if="enableUpdateFirstObjectData()">
                                        <div class="button_group">
                                            <button type="button" class="btn btn-outline" @click="onCancelFirstObjectData()">Cancel</button>
                                            <button type="button" class="btn btn-primary" @click="updateFirstObjectData">Update</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div  class="row">
                            <div class="col col-7">
                                <div v-if="!(roleForTATA==='CP')" class="card">
                                    <div class="card_content">
                                        <h4 class="table_title">Cost Summary</h4>
                                        <div class="table_component">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Amount</th>
                                                        <th>Rs/Wp</th>
                                                        <!-- <th>BOS Ref</th>
                                                        <th>Delta</th> -->
                                                    </tr>
                                                </thead>
                                                <tbody v-for="(keyName, index) in currentRoofKeyArray" :key="index" >
                                                    <tr v-if=" keyName !== 'Installation Kit' && keyName !== 'Lightning Arrester and Earthing'
                                                    && keyName !== 'Service IC' && keyName!== 'Ceig Charges' && keyName!=='Freight Charges'
                                                    &&keyName!=='AC Cables' && keyName!== 'ITB'
                                                    && roleForTATA!=='CP' && balanceOfSupplyCheck===false ">
                                                        <td>{{keyName}}</td>
                                                        <td>{{amount[`${keyName}`]}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                        <!-- <td></td>
                                                        <td></td> -->
                                                    </tr>    

                                                    <tr v-else-if="(roleForTATA!=='CP' && balanceOfSupplyCheck)  ">
                                                        <td>{{keyName}}</td>
                                                        <td>{{amount[`${keyName}`]}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                    </tr>
                                                </tbody>

                                                <tbody v-for="(item, index) in customItemArray" :key="index+'a'">
                                                    <tr>
                                                        <td>{{item.category}}</td>
                                                        <td>{{amount[item.category]}}</td>
                                                        <td>{{rsPerWP[item.category]}}</td>
                                                    </tr>

                                                </tbody>

                                                <tbody>
                                                   
                                                    <tr>
                                                        <th>Basic Costs</th>
                                                        <th>{{totalAmount}}</th>
                                                        <th colspan="3">{{basicCostRsPerWP}}</th>
                                                    </tr>
                                                    <!-- <tr>
                                                        <td>Contingency</td>
                                                        <td>{{contingency}}</td>
                                                        <td colspan="3">{{contingencyRsPerWP}}</td>
                                                    </tr> -->
                                                    <tr>
                                                        <td>Forex</td>
                                                        <td>{{forex}}</td>
                                                        <td colspan="3">{{forexRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>TOTAL COGS</th>
                                                        <th>{{totalCOGS.toFixed(2)}}</th>
                                                        <th colspan="3">{{totalCOGSRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Gross Margins</td>
                                                        <td>{{grossMargin}}</td>
                                                        <td colspan="3">{{grossMarginRsPerWP}}</td>
                                                    </tr>
                                                    <!-- <tr>
                                                        <th>Revenue Price</th>
                                                        <th>{{revenuePrice}}</th>
                                                        <th colspan="3">{{revenuePriceRsPerWP}}</th>
                                                    </tr> -->
                                                     <tr>
                                                        <th>Revenue Price</th>
                                                        <th>{{finalRevenuePriceWithForex}}</th>
                                                        <th colspan="3">{{finalRevenuePriceWithForexRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Insurance & BG @ 0.5%</td>
                                                        <td>{{insuranceAndBG}}</td>
                                                        <td colspan="3">{{insuranceAndBGRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>DD Provisions @ 0.5%</td>
                                                        <td>{{ddProvisions}}</td>
                                                        <td colspan="3">{{ddProvisionsRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Warranty Provision @ 0.5%</td>
                                                        <td>{{warrantyProvision}}</td>
                                                        <td colspan="3">{{warrantyProvisionRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Working Capital</td>
                                                        <td>{{workingCapitalComputed}}</td>
                                                        <td colspan="3">{{Number(workingCapitalRsPerWP).toFixed(2)}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Project Overhead</td>
                                                        <td>{{projectOverhead}}</td>
                                                        <td colspan="3">{{projectOverheadRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Company Overhead</td>
                                                        <td>{{companyOverhead}}</td>
                                                        <td colspan="3">{{companyOverheadRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Contingency</td>
                                                        <td>{{contingency}}</td>
                                                        <td colspan="3">{{contingencyRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Sales Commission</td>
                                                        <td>{{salesCommission}}</td>
                                                        <td colspan="3">{{salesCommissionRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Other Charges</td>
                                                        <td>{{otherCharges}}</td>
                                                        <td colspan="3">{{otherChargesRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Total Other Cost</th>
                                                        <th>{{totalOtherCost}} </th>
                                                        <th colspan="3">{{totalOtherCostRsPerWP}} </th>
                                                    </tr>
                                                    <tr>
                                                        <th>Gross Margins</th>
                                                        <th>{{grossMargin}}</th>
                                                        <th colspan="3">{{grossMarginRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <th>Net Margins</th>
                                                        <th>{{netMargin}}</th>
                                                        <th colspan="3">{{netMarginRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <th>EBIDTA</th>
                                                        <th>{{EBIDTA}}</th>
                                                        <th colspan="3">{{EBIDTARsPerWP}}</th>
                                                    </tr>
                                                     <tr>
                                                        <th>Net Margins after Tax</th>
                                                        <th>{{Number(netMarginAfterTax).toFixed(2)}}</th>
                                                        <th colspan="3">{{netMarginAfterTaxRsPerWP}}</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="(roleForTATA==='CP')" class="card">
                                    <div class="card_content">
                                        <h4 class="table_title">Cost Breakup</h4>
                                        <div class="table_component">
                                            <table>
                                               <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody v-for="(keyName, index) in costBreakupKeyArray" :key="index+'p'">
                                                    <tr>
                                                        <td>{{keyName}}</td>
                                                        <td>{{costBreakupObj[keyName]}}</td>
                                                    </tr>

                                                </tbody>

                                                <!-- <tbody v-for="(keyName, index) in currentRoofKeyArray" :key="index">
                                                   <tr v-if="keyName !== 'Inverter' && keyName !== 'Installation Kit' && keyName !== 'Lightning Arrester and Earthing'
                                                    && keyName !== 'Service IC' && keyName!== 'Ceig Charges' && keyName!=='Charges' &&keyName!=='AC Cables'">
                                                        <td>{{keyName}}</td>
                                                        <td>{{quantity[keyName]}}</td> 
                                                    </tr>    
                                                </tbody> -->

                                                <tbody v-for="(item, index) in customItemArray" :key="index+'c'">
                                                    <tr>
                                                        <td>{{item.category}}</td>
                                                        <td>{{item.qty}}</td>
                                                    </tr>
                                                </tbody>

                                                <tbody>
                                                    <tr>
                                                        <th>Basic Costs</th>
                                                        <th> ₹{{finalBasicCostForChannelPartner}} </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!(roleForTATA==='CP')" class="card">
                                    <div class="card_content">
                                        <div class="table_component">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Price Summary</th>
                                                        <th>Total</th>
                                                        <th>Rs/Wp</th>
                                                        <!-- <th>Percentage</th> -->
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Module+Inverter</td>
                                                        <td>{{(Number(amount["Module"]) + Number(amount["Inverter"])).toFixed(2)}} </td>
                                                        <td colspan="2">{{(Number(rsPerWP["Module"]) + Number(rsPerWP["Inverter"])).toFixed(2)}} </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Balance of Supply</td>
                                                        <td>{{BOS}}</td>
                                                        <td colspan="2">{{BOSRsPerWP}}</td>
                                                    </tr>
                                                    <tr v-if="balanceOfSupplyCheck">
                                                        <td>Erection, Testing and Commissioning</td>
                                                        <td>{{ETC}}</td>
                                                        <td colspan="2">{{ETCRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Basic Prices (Without Taxes)</th>
                                                        <th>{{basicPrice}} </th>
                                                        <th colspan="2">{{basicPriceRsPerWP}}</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col col-5">
                              <div class="card">
                                <div class="card_content">
                                    <h5 class="card_title">ACDB Toggle</h5>
                                    <div class="acdbDiv">
                                       <el-radio-group v-model="acdbToggle" @change="updateACDBToggle">
                                          <el-radio  label="allRoofs">For All Roofs</el-radio>
                                          <el-radio  label="individualRoofs">For individual Roofs</el-radio>
                                      </el-radio-group>
                                    </div>
                                </div>
                              </div>
                                <div  class="card" v-if="(roleForTATA==='ADMIN' ||(roleForTATA==='Sales Manager' && balanceOfSupplyCheck))">
                                    <div class="card_content">
                                        <h5 class="card_title" >AC Cable Distance (ACDB to LT Module)</h5>
                                        <ul class="parameter_items" v-for="i in roofCount" :key="i">
                                            <li>
                                                <div class="param_title">
                                                  For Roof {{i}}
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="acCableLength[i-1]"
                                                            name="AC Cable" />
                                                            <span class="pct">m</span>
                                                        </div>
                                                    </div>
                                                    <p class="formErrors" v-if="invalidACCables.includes(i-1)">
                                                        <span class="errorMsg">Must be between 0 to 200.</span>
                                                    </p>
                                                </div>
                                                
                                            </li>
                                        </ul>
                                        <div class="button_group" v-if="enableACCableLengthData()" >
                                            <button type="button" class="btn btn-outline" @click="onCancelACCableLength()">Cancel</button>
                                            <button type="button" class="btn btn-primary" @click="updateACCableLength()" 
                                            :disabled="invalidACCables.length>0">Update</button>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!(roleForTATA==='CP')" class="card">
                                    <div class="card_content">
                                        <h5 class="card_title">Financial Parameters</h5>
                                        <ul class="parameter_items">
                                            <li>
                                                <div class="param_title">
                                                    Gross Margin
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.grossMarginPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Insurance & BG @ 0.5%
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.insuranceAndBGPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    DD Provisions @ 0.5%
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.ddProvisionsPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Warranty Provision @ 0.5%
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.warrantyProvisionPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Working Capital(In Months)
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <input type="number" v-model="systemParameters.workingCapital" />
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Project Overhead
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.projectOverheadPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Company Overhead
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.companyOverheadPercentage"/>
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Contingency
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.contingencyPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Sales Commission
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.salesCommissionPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    Other Charges
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.otherChargesPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div class="param_title">
                                                    PAT
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area" style="background: #cccccc;">
                                                        <div class="input_append" >
                                                            <input type="number" class="cursorClass" v-model="PAT" disabled/>
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                        <div class="button_group" v-if="enableUpdateSystemParameters()">
                                            <button type="button" class="btn btn-outline" @click="onCancelSystemParameters()">Cancel</button>
                                            <button type="button" class="btn btn-primary" @click="updateSystemParameters()">Update</button>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!(roleForTATA==='CP')" class="card">
                                    <div class="card_content">
                                        <h4 class="table_title">Cost Breakup</h4>
                                        <div class="table_component">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Rs/Wp</th>
                                                        <th>%</th>
                                                        <!-- <th>Amount</th> -->
                                                    </tr>
                                                </thead>
                                                <tbody v-for="(keyName, index) in currentRoofKeyArray" :key="index">

                                                   <tr v-if=" keyName !== 'Installation Kit' && keyName !== 'Lightning Arrester and Earthing'
                                                    && keyName !== 'Service IC' && keyName!== 'Ceig Charges' && keyName!=='Freight Charges'
                                                    && keyName!=='AC Cables' && keyName!== 'ITB'
                                                    && roleForTATA!=='CP' && balanceOfSupplyCheck===false">
                                                        <td>{{keyName}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                        <td>{{costBreakupRsPerWPPercentage[`${keyName}`]}}</td>
                                                        <!-- <td>{{((Number(amount[`${keyName}`]) + (Number(systemParameters.grossMarginPercentage) * Number(amount[`${keyName}`]))/100)).toFixed(2)}}</td> -->
                                                        
                                                    </tr>
                                                    <tr v-else-if="(roleForTATA!=='CP' && balanceOfSupplyCheck)  ">
                                                        <td>{{keyName}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                        <td>{{costBreakupRsPerWPPercentage[`${keyName}`]}}</td>
                                                    </tr>    
                                                </tbody>
                                                <tbody v-for="(item, index) in customItemArray" :key="index+'b'">
                                                    <tr>
                                                        <td>{{item.category}}</td>
                                                        <td>{{rsPerWP[item.category]}}</td>
                                                        <td>{{costBreakupRsPerWPPercentage[item.category]}}</td>
                                                    </tr>
                                                </tbody>
                                                <tbody>
                                                    <tr>
                                                        <th>Total</th>
                                                        <th>{{totalRsPerWP}}</th>
                                                        <th>100.0%</th>
                                                        <!-- <th>{{(Number(totalAmount) + Number((Number(totalAmount) * Number(systemParameters.grossMarginPercentage))/100)).toFixed(2)}}</th> -->
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
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
            firstObj:{
                dollarRate:74.37,
                moduleCost:0.26,
                entryDistance:0,
                dataMonitoring:1,
                warehouseCity:"Bengaluru",
            },
            firstObjTemp:{
                dollarRate:74.37,
                moduleCost:0.26,
                entryDistance:0,
                dataMonitoring:1,
                warehouseCity:"Bengaluru",
            },
            acCableLength:[],
            acCableLengthTemp:[],
            moduleWattage:0,
            systemCapacityWp:0,
            allRoof:{},
            currentRoof:{},
            currentRoofKeyArray:[],
            customItemArray:[],
            amount:{},
            rsPerWP:{},
            quantity:{},
            costBreakupRsPerWPPercentage:{},
            tempAmount:0,
            tempRsPerWP:0,
            tempQuantity:0,
            totalAmount:0,
            totalAmountForCP:0,
            totalRsPerWP:0,
            totalRsPerWPUnchanged:0,
            // contingency:0,
            forex:0,
            systemParameters:{
                grossMarginPercentage:74.37,
                insuranceAndBGPercentage:0.5,
                ddProvisionsPercentage:0.5,
                warrantyProvisionPercentage:0.5,
                workingCapital:0,
                projectOverheadPercentage:3.5,
                companyOverheadPercentage:3.5,
                contingencyPercentage:0,
                customerChargesPercentage:0,
                salesCommissionPercentage:2,
                otherChargesPercentage:0,
                moduleMarginPercentage:0,
                
            },
            systemParametersTemp:{
                grossMarginPercentage:74.37,
                insuranceAndBGPercentage:0.5,
                ddProvisionsPercentage:0.5,
                warrantyProvisionPercentage:0.5,
                workingCapital:0,
                projectOverheadPercentage:3.5,
                companyOverheadPercentage:3.5,
                customerChargesPercentage:0,
                salesCommissionPercentage:2,
                otherChargesPercentage:0,
                moduleMarginPercentage:0,
                contingencyPercentage:0,
                
            },
            serviceIC:0,
            roofCount:0,
            acCableLengthValidation:{
                required: true,
                max_value: 200,
            },
            invalidACCables: [],
            isLoading:true,
            warehouseCityArray:[
        {
          value:'Bengaluru',
          label:'Bengaluru'
        },
        {
          value:'Panvel',
          label:'Panvel'
        },
        {
          value:'Gurgaon',
          label:'Gurgaon'
        },
        {
          value:'Raipur',
          label:'Raipur'
        },
      ],
        warehouseCity: 'Bengaluru',
        inverterDescriptionArray: [],
        isInverterValid:true,
        dialogFormVisible:false,
        messageForCheck:'',
        summary:{},
        costBreakupObj:{},
        costBreakupKeyArray:[],
        totalCustomItemsAmount:0,
        acdbToggle:'allRoofs',
        acdbForAllRoofs:true,

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
                // ...mapGetters({
                //     summary: 'GET_DESIGN_INFORMATION',
                //     profileData: 'GET_DESIGN_VERSION_SETTINGS',
                // }),
                basicCostRsPerWP(){
                     return (this.totalAmount/(this.systemCapacityWp)).toFixed(2) ;
                },
                contingencyRsPerWP(){
                    return this.contingency/(this.systemCapacityWp) ;
                },
                forexRsPerWP(){
                    return Number(this.forex/(this.systemCapacityWp)).toFixed(2);
                },
                totalCOGS(){
                    let temp = Number(this.totalAmount) + Number(this.contingency) + Number(this.forex);
                    return temp;
                },
                totalCOGSRsPerWP(){
                     return (this.totalCOGS/(this.systemCapacityWp)).toFixed(2);
                },
                grossMargin(){
                    // return ((this.systemParameters.grossMarginPercentage * this.totalCOGS)/100).toFixed(2) ;
                    // console.log("inside gross argin", this.revenuePrice,this.totalAmount);
                    return Number(this.revenuePrice - this.totalAmount).toFixed(2);
                    
                },
                grossMarginRsPerWP(){
                     return (this.grossMargin/(this.systemCapacityWp)).toFixed(2);
                },
                revenuePrice(){
                    // return (Number(this.grossMargin) + Number(this.totalCOGS)).toFixed(2);
                    // console.log("inside revenuePrice",this.totalAmount,this.grossMarginPercentage);
                    return Number(Number(this.totalAmount)/(1-Number(this.systemParameters.grossMarginPercentage)/100)).toFixed(2);
                   
                },
                finalRevenuePriceWithForex(){
                    return Number(Number(this.revenuePrice) + Number(this.forex)).toFixed(2);
                },
                finalRevenuePriceWithForexRsPerWP(){
                    return (this.finalRevenuePriceWithForex/(this.systemCapacityWp)).toFixed(2);
                },
                revenuePriceRsPerWP(){
                     return (this.revenuePrice/(this.systemCapacityWp)).toFixed(2);
                },
                insuranceAndBG(){
                    return ((Number(this.systemParameters.insuranceAndBGPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                insuranceAndBGRsPerWP(){
                     return (this.insuranceAndBG/(this.systemCapacityWp)).toFixed(2);
                },
                ddProvisions(){
                    return ((Number(this.systemParameters.ddProvisionsPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                ddProvisionsRsPerWP(){
                     return (this.ddProvisions/(this.systemCapacityWp)).toFixed(2);
                },
                warrantyProvision(){
                    return ((Number(this.systemParameters.warrantyProvisionPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                warrantyProvisionRsPerWP(){
                     return (this.warrantyProvision/(this.systemCapacityWp)).toFixed(2);
                },
                workingCapitalRsPerWP(){
                    //  return (this.systemParameters.workingCapital/(this.systemCapacityWp)).toFixed(2);
                    return (Number(this.systemParameters.workingCapital)/12)*(8.5/100)*(this.finalRevenuePriceWithForexRsPerWP);
                },
                workingCapitalComputed(){
                    return Number(this.workingCapitalRsPerWP * this.systemCapacityWp).toFixed(2);
                },
                projectOverhead(){
                    return ((Number(this.systemParameters.projectOverheadPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                projectOverheadRsPerWP(){
                     return (this.projectOverhead/(this.systemCapacityWp)).toFixed(2);
                },
                companyOverhead(){
                    return ((Number(this.systemParameters.companyOverheadPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2);
                },
                companyOverheadRsPerWP(){
                     return (this.companyOverhead/(this.systemCapacityWp)).toFixed(2);
                },
                contingency(){
                    return ((Number(this.systemParameters.contingencyPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                contingencyRsPerWP(){
                    return (this.contingency/(this.systemCapacityWp)).toFixed(2);
                },
                customerCharges(){
                    return ((Number(this.systemParameters.customerChargesPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                customerChargesRsPerWP(){
                     return (this.customerCharges/(this.systemCapacityWp)).toFixed(2);
                },
                salesCommission(){
                    return ((Number(this.systemParameters.salesCommissionPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                salesCommissionRsPerWP(){
                     return (this.salesCommission/(this.systemCapacityWp)).toFixed(2);
                },
                otherCharges(){
                    return ((Number(this.systemParameters.otherChargesPercentage) * Number(this.finalRevenuePriceWithForex))/100).toFixed(2) ;
                },
                otherChargesRsPerWP(){
                     return (this.otherCharges/(this.systemCapacityWp)).toFixed(2);
                },
                totalOtherCost(){
                    return (
                       ( Number(this.insuranceAndBG) + Number(this.ddProvisions) + Number(this.warrantyProvision) 
                         + Number(this.projectOverhead) + Number(this.companyOverhead)+ Number(this.contingency)
                         + Number(this.salesCommission) + Number(this.otherCharges) + Number(this.workingCapitalComputed)).toFixed(2)
                         
                    );
                    //Number(this.customerCharges) is removed from above
                },
                totalOtherCostRsPerWP(){
                     return (this.totalOtherCost/(this.systemCapacityWp)).toFixed(2);
                },
                netMargin(){
                    return (this.grossMargin - this.totalOtherCost).toFixed(2);
                },
                netMarginRsPerWP(){
                     return (this.netMargin/(this.systemCapacityWp)).toFixed(2);
                },
                netMarginAfterTax(){
                    return (this.netMargin - (25.10/100 * this.netMargin));
                },
                netMarginAfterTaxRsPerWP(){
                    return (this.netMarginAfterTax/(this.systemCapacityWp)).toFixed(2);
                },
                PAT(){
                    return Number((this.netMarginAfterTax/this.finalRevenuePriceWithForex)* 100).toFixed(2);
                },
                EBIDTA(){
                    return (Number(this.netMargin) + (Number(this.insuranceAndBG)/2) + Number(this.workingCapitalComputed)).toFixed(2) ;
                },
                EBIDTARsPerWP(){
                     return (this.EBIDTA/(this.systemCapacityWp)).toFixed(2);
                },
                BOS(){
                    // return (this.BOSRsPerWP * this.systemCapacityWp).toFixed(2);
                    return (Number(this.totalAmount) - Number(this.amount["Module"])- Number(this.amount["Inverter"])).toFixed(2);
                },
                BOSRsPerWP(){
                    // return ((Number(this.basicCostRsPerWP) - Number(this.rsPerWP["Module"] ) - Number(this.rsPerWP["Inverter"]))/0.95).toFixed(2);
                    return (this.BOS/this.systemCapacityWp).toFixed(2);
                },
                // BOS(){
                //     return (this.BOSRsPerWP * this.systemCapacityWp).toFixed(2);
                // },
                ETC(){
                    return (Number(this.serviceIC)/0.95).toFixed(2);
                },
                ETCRsPerWP(){
                     return (Number(this.ETC)/Number(this.systemCapacityWp)).toFixed(2);
                },
                basicPrice(){
                    // return (Number(this.amount["Module"])+ Number(this.BOS) + Number(this.ETC)).toFixed(2);
                    // return (Number(this.amount["Module"])+ Number(this.BOS) + Number(this.amount["Inverter"])).toFixed(2);
                    if(!this.balanceOfSupplyCheck)
                    return (Number(this.totalAmount)*(1+ Number(this.systemParameters.grossMarginPercentage)/100)).toFixed(2);
                    else
                    return (Number(this.totalAmount)+ Number(this.ETC)).toFixed(2);
                    // return this.finalBasicCostForChannelPartner;
                },
                basicPriceRsPerWP(){
                    return (Number(this.basicPrice)/Number(this.systemCapacityWp)).toFixed(2);
                },

                removeExtraCostForChannelPartner(){
                    // here we are calculating total cost of Installation Kit, Earthing, and Service IC , Ceig Charges and Charges (including gross percentage) so that
                    // that can be remove from total basic cost gross included for channel partner
                    let removedCost = Number(this.amount['Installation Kit']) + 
                    Number(this.amount['Lightning Arrester and Earthing']) + Number(this.amount['Service IC'])+ Number(this.amount['ITB']) 
                    + Number(this.amount['Ceig Charges']) + Number(this.amount['Freight Charges']) + Number(this.amount['AC Cables']);
                    // now include gross
                    removedCost = removedCost + (Number(this.systemParameters.grossMarginPercentage)* removedCost)/100 ;
                    return removedCost;
                },

                finalBasicCostForChannelPartner(){
                    return (
                      Number(this.totalAmountForCP) +
                      Number((Number(this.totalAmountForCP) * Number(this.systemParameters.grossMarginPercentage))/100) 
                      - Number(this.removeExtraCostForChannelPartner) 
                      -((Number(this.totalCustomItemsAmount) * Number(this.systemParameters.grossMarginPercentage))/100)
                      ).toFixed(2);

                     // what we are doing is, totalAmount and its gross margin...but subtracting for those items which are not requiered
                     // but  want custom items....but dont want gross margin of custom items.
                     // I know its complicated. Its because of Tata's continuoulsly changing demands.
                },

                totalExtraAmount(){
                    let extraCost = Number(this.amount['Installation Kit']) + 
                    Number(this.amount['Lightning Arrester and Earthing']) + Number(this.amount['Service IC']) 
                    + Number(this.amount['Ceig Charges']) + Number(this.amount['Freight Charges']) + Number(this.amount['ITB'])
                    + Number(this.amount['AC Cables']);

                    return extraCost;
                },
                totalExtraRsPerWP(){
                    let extraRsPerWP = Number(this.rsPerWP['Installation Kit']) + 
                    Number(this.rsPerWP['Lightning Arrester and Earthing']) + Number(this.rsPerWP['Service IC']) 
                    + Number(this.rsPerWP['Ceig Charges']) + Number(this.rsPerWP['Freight Charges']) + Number(this.rsPerWP['ITB'])
                    + Number(this.rsPerWP['AC Cables']);

                    return extraRsPerWP;
                }
    },
    mounted(){
        this.getBomAndSummaryData();
    },
    
    methods:{   
                async getBomAndSummaryData(){
                    try{
                        // const response = await API.DESIGNS.UPDATE_GENERATE_DETAILED_BOM(this.designId,postData);
                        const response = await API.DESIGNS.GENERATE_DETAILED_BOM(this.designId);
                        this.initializeFirstObjectData(response);
                        this.initializeSystemParameters(response);
                        this.initializeACDBToggle(response);
                        this.moduleWattage = response.data.billOfMaterial.customerOrderDetails["moduleWattage"];
                        this.systemCapacityWp = response.data.billOfMaterial.customerOrderDetails["systemCapacityWp"];
                        this.allRoof = response.data["All Roofs"];
                        this.roofCount = Object.keys(response.data.Roof).length;  //Roof count
                        this.currentRoof = JSON.parse(JSON.stringify( this.allRoof ));
                        this.currentRoofKeyArray = Object.keys(this.currentRoof);
                        if(response.data["billOfMaterial"]["addtionalBOM"])
                        this.customItemArray = response.data["billOfMaterial"]["addtionalBOM"];
                        await this.assignAmount();
                        this.totalAmount =  this.totalAmount.toFixed(2);
                        this.totalRsPerWP =  this.totalRsPerWP.toFixed(2);
                        this.totalRsPerWPUnchanged = this.totalRsPerWPUnchanged.toFixed(2);
                        this.totalAmountForCP = this.totalAmountForCP.toFixed(2);
                        await this.getACCableLength(response);
                        this.isLoading = false;
                        await this.redirectToDetailedBOM(response.data["All Roofs"]);

                        if(this.roleForTATA!=='CP' && !this.balanceOfSupplyCheck){
                            this.reduceTotalAmountForBalanceOfSupplyCheck();
                            this.reduceTotalRsPerWPForBalanceOfSupplyCheck();
                        }
                        await this.assignCostBreakupForCP(response);
                        // this.checkValidInverters(response.data["All Roofs"]);
                        this.$emit('updateBOMInformation',response);
                    }
                    catch{
                        this.isLoading = true;
                        this.dialogFormVisible=true;
                        this.messageForCheck = "Problem with API or Inverter Selection";
                    }
                },
                assignCostBreakupForCP(response){
                    this.costBreakupObj = response.data['cost_breakup'];
                    this.costBreakupKeyArray = Object.keys(this.costBreakupObj);
                },
                
                async redirectToDetailedBOM(obj){
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
                    for(let i=0; i<inverterArray.length;i++){
                        this.inverterDescriptionArray.push(inverterArray[i].description);
                    }
                    this.isInverterValid=true;
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
                getACCableLength(response){
                    this.acCableLength=[];
                    this.acCableLengthTemp=[];
                    for(let i=0; i<this.roofCount;i++){
                        this.acCableLength.push(50);
                        this.acCableLengthTemp.push(50);
                    }
                    let incomingArray = response.data.summary.acCableLength;
                    for(let j=0;j<incomingArray.length;j++){
                        this.acCableLength[j] = incomingArray[j];
                        this.acCableLengthTemp[j] = incomingArray[j];
                    }
                },
                onCancelACCableLength(){
                    this.acCableLength = [...this.acCableLengthTemp];
                },
                assignAmount(){
                    this.totalAmount =0;
                    this.totalRsPerWP=0;
                    this.totalRsPerWPUnchanged=0;
                    this.totalAmountForCP=0;

                    for(let i=0; i<this.currentRoofKeyArray.length; i++){
                        let category = this.currentRoofKeyArray[i];
                        category = String(category);
                        this.amount[category]=0;
                        this.quantity[category]=0;
                        this.rsPerWP[category]=0;
                        this.tempAmount =0;
                        this.tempRsPerWP=0;
                        this.tempQuantity=0;
                        for(let j=0; j< this.currentRoof[category].length; j++){
                            this.tempAmount+=  this.currentRoof[category][j].total;
                            this.tempRsPerWP += this.currentRoof[category][j].rsPerWP;
                            this.tempQuantity += this.currentRoof[category][j].quantity;
                        }
                        this.amount[category]=  this.tempAmount.toFixed(2);
                        this.rsPerWP[category] = this.tempRsPerWP.toFixed(2);
                        this.quantity[category] = this.tempQuantity.toFixed(2);
                        if(this.amount[category]!=='NaN' ){
                            this.totalAmount += Number(this.amount[category]);
                            this.totalAmountForCP = this.totalAmount;
                        }
                        if(this.rsPerWP[category]!=='NaN'){
                            this.totalRsPerWP += Number(this.rsPerWP[category]);
                            this.totalRsPerWPUnchanged += Number(this.rsPerWP[category]);
                        }
                    }
                    // Now for custom added items
                        this.totalCustomItemsAmount=0;
                    for(let j=0;j<this.customItemArray.length;j++){
                        let category1 = this.customItemArray[j].category;
                        this.amount[category1] = (this.customItemArray[j].price);
                        this.rsPerWP[category1] = (this.customItemArray[j].price/this.systemCapacityWp).toFixed(2);
                        if(this.amount[category1]!=='NaN' ){
                        this.totalAmount += Number(this.amount[category1]);
                        this.totalAmountForCP = this.totalAmount;
                        this.totalCustomItemsAmount+= Number(this.amount[category1]);
                        }
                        if(this.rsPerWP[category1]!=='NaN'){
                        this.totalRsPerWP += Number(this.rsPerWP[category1]);
                        this.totalRsPerWPUnchanged += Number(this.rsPerWP[category1]);
                        }
                    }
                    // console.log("amount obj is",this.amount);
                    for(let i=0; i<this.currentRoofKeyArray.length; i++){
                        let category = this.currentRoofKeyArray[i];
                        category = String(category);
                        this.costBreakupRsPerWPPercentage[category] = ((this.rsPerWP[category]/this.totalRsPerWP)*100).toFixed(2);
                    }
                    // cost breakup for custom items
                    for(let i=0;i<this.customItemArray.length;i++){
                        let category = this.customItemArray[i].category;
                        category = String(category);
                        this.costBreakupRsPerWPPercentage[category] = ((this.rsPerWP[category]/this.totalRsPerWP)*100).toFixed(2);
                    }
                    this.serviceIC = this.amount["Service IC"];
                    this.forex = Number(this.amount['Module']*(2/12)*(5/100)).toFixed(2);
                },
                initializeACDBToggle(response){
                  let temp = response.data.summary['acdb_for_all_roofs'];
                  if(temp){
                    this.acdbToggle = 'allRoofs';
                  }
                  else
                  this.acdbToggle = 'individualRoofs';
                },
                initializeFirstObjectData(response){
                    const summaryData = response.data.summary;
                    this.firstObjTemp.dollarRate = summaryData.dollarRate;
                    this.firstObjTemp.moduleCost = summaryData.module;
                    this.firstObjTemp.entryDistance = summaryData.entryDistance;
                    this.firstObjTemp.dataMonitoring = summaryData.dataMonitoring;
                    this.firstObjTemp.warehouseCity = summaryData.warehouseCity;
                    this.onCancelFirstObjectData();
                },
                initializeSystemParameters(response){
                    const summaryData = response.data.summary;
                    this.systemParametersTemp.grossMarginPercentage = summaryData.grossMarginPercentage;
                    this.systemParametersTemp.insuranceAndBGPercentage = summaryData.insuranceAndBGPercentage;
                    this.systemParametersTemp.ddProvisionsPercentage = summaryData.ddProvisionsPercentage;
                    this.systemParametersTemp.warrantyProvisionPercentage = summaryData.warrantyProvisionPercentage;
                    this.systemParametersTemp.workingCapital = summaryData.workingCapital;
                    this.systemParametersTemp.projectOverheadPercentage = summaryData.projectOverheadPercentage;
                    this.systemParametersTemp.companyOverheadPercentage = summaryData.companyOverheadPercentage;

                    if(summaryData.contingencyPercentage)
                    this.systemParametersTemp.contingencyPercentage = summaryData.contingencyPercentage;

                    this.systemParametersTemp.customerChargesPercentage = summaryData.customerChargesPercentage;
                    this.systemParametersTemp.salesCommissionPercentage = summaryData.salesCommissionPercentage;
                    this.systemParametersTemp.otherChargesPercentage = summaryData.otherChargesPercentage;
                    this.systemParametersTemp.moduleMarginPercentage = summaryData.moduleMarginPercentage;
                    this.onCancelSystemParameters();
                },
                onCancelFirstObjectData(){
                    this.firstObj.dollarRate =  this.firstObjTemp.dollarRate;
                    this.firstObj.moduleCost =  this.firstObjTemp.moduleCost;
                    this.firstObj.entryDistance =  this.firstObjTemp.entryDistance;
                    this.firstObj.dataMonitoring =  this.firstObjTemp.dataMonitoring;
                    this.firstObj.warehouseCity   = this.firstObjTemp.warehouseCity;
                },
                onCancelSystemParameters(){
                    this.systemParameters.grossMarginPercentage = this.systemParametersTemp.grossMarginPercentage;
                    this.systemParameters.insuranceAndBGPercentage = this.systemParametersTemp.insuranceAndBGPercentage;
                    this.systemParameters.ddProvisionsPercentage = this.systemParametersTemp.ddProvisionsPercentage;
                    this.systemParameters.warrantyProvisionPercentage = this.systemParametersTemp.warrantyProvisionPercentage;
                    this.systemParameters.workingCapital = this.systemParametersTemp.workingCapital;
                    this.systemParameters.projectOverheadPercentage =  this.systemParametersTemp.projectOverheadPercentage ;
                    this.systemParameters.companyOverheadPercentage = this.systemParametersTemp.companyOverheadPercentage;
                    this.systemParameters.contingencyPercentage = this.systemParametersTemp.contingencyPercentage;
                    this.systemParameters.customerChargesPercentage = this.systemParametersTemp.customerChargesPercentage;
                    this.systemParameters.salesCommissionPercentage = this.systemParametersTemp.salesCommissionPercentage;
                    this.systemParameters.otherChargesPercentage = this.systemParametersTemp.otherChargesPercentage;
                    this.systemParameters.moduleMarginPercentage = this.systemParametersTemp.moduleMarginPercentage;
                },
                enableUpdateFirstObjectData(){
                    return (
                        (this.firstObj.dollarRate !=  this.firstObjTemp.dollarRate) ||
                        (this.firstObj.moduleCost !=  this.firstObjTemp.moduleCost) ||
                        (this.firstObj.entryDistance !=  this.firstObjTemp.entryDistance) ||
                        (this.firstObj.dataMonitoring!= this.firstObjTemp.dataMonitoring) ||
                        (this.firstObj.warehouseCity!= this.firstObjTemp.warehouseCity)
                    );
                },
                enableACCableLengthData(){
                    for(let i=0;i<this.acCableLength.length;i++){
                        if(this.acCableLength[i]!=this.acCableLengthTemp[i])
                        return true;
                    }
                    return false;
                },
                enableUpdateSystemParameters(){
                    return (
                        (this.systemParameters.grossMarginPercentage != this.systemParametersTemp.grossMarginPercentage) 
                        || (this.systemParameters.insuranceAndBGPercentage != this.systemParametersTemp.insuranceAndBGPercentage)
                        || (this.systemParameters.ddProvisionsPercentage != this.systemParametersTemp.ddProvisionsPercentage)
                        || (this.systemParameters.warrantyProvisionPercentage != this.systemParametersTemp.warrantyProvisionPercentage)
                        || (this.systemParameters.workingCapital != this.systemParametersTemp.workingCapital)
                        || (this.systemParameters.projectOverheadPercentage !=  this.systemParametersTemp.projectOverheadPercentage)
                        || (this.systemParameters.companyOverheadPercentage != this.systemParametersTemp.companyOverheadPercentage)
                        || (this.systemParameters.contingencyPercentage != this.systemParametersTemp.contingencyPercentage)
                        || (this.systemParameters.customerChargesPercentage != this.systemParametersTemp.customerChargesPercentage)
                        || (this.systemParameters.salesCommissionPercentage != this.systemParametersTemp.salesCommissionPercentage)
                        || (this.systemParameters.otherChargesPercentage != this.systemParametersTemp.otherChargesPercentage)
                        || (this.systemParameters.moduleMarginPercentage != this.systemParametersTemp.moduleMarginPercentage) 
                    );
                },
                async updateACDBToggle(){
                    if(this.acdbToggle==='allRoofs')
                    this.acdbForAllRoofs=true;
                    else
                    this.acdbForAllRoofs=false;
                    const patchData={
                        "acdb_for_all_roofs": this.acdbForAllRoofs
                    };
                    try{
                      await API.DESIGNS.UPDATE_SUMMARY_DATA(this.designId,patchData);
                      this.getBomAndSummaryData();
                        this.$message({
                            showClose: true,
                            message: 'Successfully Updated!',
                            type: 'success',
                        });
                    }
                    catch{
                          this.$message({
                          showClose: true,
                          message: 'Error ',
                          type: 'error',
                      });
                    }  
                },
                async updateFirstObjectData(){
                    const patchData = {
                                        "dollarRate": this.firstObj.dollarRate,
                                        "module":this.firstObj.moduleCost,
                                        "entryDistance": this.firstObj.entryDistance,
                                        "dataMonitoring": this.firstObj.dataMonitoring,
                                        "warehouseCity":this.firstObj.warehouseCity,
                    }
                    try{
                        await API.DESIGNS.UPDATE_SUMMARY_DATA(this.designId,patchData);
                        this.firstObjTemp = JSON.parse(JSON.stringify(this.firstObj));
                        this.getBomAndSummaryData();
                        this.$message({
                            showClose: true,
                            message: 'Successfully Updated!',
                            type: 'success',
                        });
                    }
                    catch{
                        this.onCancelFirstObjectData();
                        this.$message({
                        showClose: true,
                        message: 'Error ',
                        type: 'error',
                    });
                    }
                },
                async updateACCableLength(){
                    for(let i=0;i<this.acCableLength.length;i++)
                    {
                        this.acCableLength[i] = Number(this.acCableLength[i]);
                    }
                    const patchData =   {
                                            "acCableLength" : this.acCableLength,
                                        }
                    try{
                            await API.DESIGNS.UPDATE_AC_CABLE_LENGTH(this.designId,patchData);
                            this.getBomAndSummaryData();
                            this.$message({
                            showClose: true,
                            message: 'Successfully Updated!',
                            type: 'success',
                         });
                    }
                    catch{
                            this.$message({
                            showClose: true,
                            message: 'Error ',
                            type: 'error',
                        });
                    }
                },
                async updateSystemParameters(){
                    const patchData = {
                                        grossMarginPercentage:          this.systemParameters.grossMarginPercentage,
                                        insuranceAndBGPercentage:       this.systemParameters.insuranceAndBGPercentage,
                                        ddProvisionsPercentage:         this.systemParameters.ddProvisionsPercentage,
                                        warrantyProvisionPercentage:    this.systemParameters.warrantyProvisionPercentage,
                                        workingCapital:                 this.systemParameters.workingCapital,
                                        projectOverheadPercentage:      this.systemParameters.projectOverheadPercentage,
                                        companyOverheadPercentage:      this.systemParameters.companyOverheadPercentage,
                                        contingencyPercentage:          this.systemParameters.contingencyPercentage,
                                        customerChargesPercentage:      this.systemParameters.customerChargesPercentage,
                                        salesCommissionPercentage:      this.systemParameters.salesCommissionPercentage,
                                        otherChargesPercentage:         this.systemParameters.otherChargesPercentage,
                                        moduleMarginPercentage:         this.systemParameters.moduleMarginPercentage,
                    }
                    try{
                        await API.DESIGNS.UPDATE_SUMMARY_DATA(this.designId,patchData);
                        this.systemParametersTemp = JSON.parse(JSON.stringify(this.systemParameters));
                        this.$message({
                            showClose: true,
                            message: 'Successfully Updated!',
                            type: 'success',
                        });
                    }
                    catch{
                        this.onCancelSystemParameters();
                        this.$message({
                            showClose: true,
                            message: 'Error ',
                            type: 'error',
                        });
                        
                    }
                },
                reduceTotalAmountForBalanceOfSupplyCheck(){
                    this.totalAmount = Number(this.totalAmountForCP) - Number(this.totalExtraAmount);
                    this.totalAmount = Number(this.totalAmount).toFixed(2);
                },
                reduceTotalRsPerWPForBalanceOfSupplyCheck(){
                    this.totalRsPerWP = Number(this.totalRsPerWPUnchanged) - Number(this.totalExtraRsPerWP);
                    this.totalRsPerWP = Number(this.totalRsPerWP).toFixed(2);
                    this.costBreakupTableRsPerWPPercentage();
                },
                costBreakupTableRsPerWPPercentage(){
                    for(let i=0; i<this.currentRoofKeyArray.length; i++){
                            let category = this.currentRoofKeyArray[i];
                            category = String(category);
                            this.costBreakupRsPerWPPercentage[category] = ((this.rsPerWP[category]/this.totalRsPerWP)*100).toFixed(2);
                    }
                    // cost breakup for custom items
                    for(let i=0;i<this.customItemArray.length;i++){
                        let category = this.customItemArray[i].category;
                        category = String(category);
                        this.costBreakupRsPerWPPercentage[category] = ((this.rsPerWP[category]/this.totalRsPerWP)*100).toFixed(2);
                    }
                },
    },
    watch: {
        acCableLength(val) {
            let idx = -1;
            this.acCableLength.forEach(item => {
                idx++;
                if(item <0 || item > 200 || item==='') {
                    
                    if(!this.invalidACCables.includes(idx))
                        this.invalidACCables.push(idx)
                }else {
                    
                    const tempIdx = this.invalidACCables.indexOf(idx);
                    if(tempIdx != -1) this.invalidACCables.splice(tempIdx, 1);
                }
            })
        },
        roleForTATA:{
            handler(val,oldVal){
                if(val==='CP'){
                    this.totalAmount = Number(this.totalAmountForCP).toFixed(2);
                    this.totalRsPerWP = Number(this.totalRsPerWPUnchanged).toFixed(2);
                }
                if((val!=='CP')){
                    if(!this.balanceOfSupplyCheck){
                        this.totalAmount = Number(this.totalAmountForCP) - Number(this.totalExtraAmount);
                        this.totalRsPerWP = Number(this.totalRsPerWPUnchanged) - Number(this.totalExtraRsPerWP);
                    }
                    else{
                        this.totalAmount = Number(this.totalAmountForCP).toFixed(2);
                        this.totalRsPerWP = Number(this.totalRsPerWPUnchanged).toFixed(2)
                    }
                }
                this.totalAmount = Number(this.totalAmount).toFixed(2);
                this.totalRsPerWP = Number(this.totalRsPerWP).toFixed(2);
                this.costBreakupTableRsPerWPPercentage();
            }
        },
        balanceOfSupplyCheck:{
            handler(val){
                if(this.roleForTATA!=='CP' && val=== true){
                    this.totalAmount = Number(this.totalAmountForCP).toFixed(2);
                    this.totalRsPerWP = Number(this.totalRsPerWPUnchanged).toFixed(2)
                }
                else if(this.roleForTATA!=='CP' && val===false){
                    this.totalAmount = Number(this.totalAmountForCP) - Number(this.totalExtraAmount);
                    this.totalRsPerWP = Number(this.totalRsPerWPUnchanged) - Number(this.totalExtraRsPerWP);
                }
                this.totalAmount = Number(this.totalAmount).toFixed(2);
                this.totalRsPerWP = Number(this.totalRsPerWP).toFixed(2);
                this.costBreakupTableRsPerWPPercentage();
            }
        }
        
    }
}
</script>


<style scoped>
.errorMsg{
    color: red;
    font-size: 12px;
}

#tab1 >>> .el-radio__label{
  font-size: 16px !important;
}
#tab1 >>> .el-radio:last-child{
  margin-left: 20px;
}
.acdbDiv{
  margin-top: 10px;
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
  background-color: #409eff;
  border-color: #409eff;
  outline: none;
}
.btn-primary:hover {
  color: white;
  background-color: #409eff;
  border-color: #409eff;
}
.btn-primary:active,
.btn-primary.active,
.open > .btn-primary.dropdown-toggle {
  color: white;
  background-color: #409eff;
  background-image: none;
  border-color: #409eff;
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
  background-color: #409eff;
  border-color: #409eff;
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
  /* background: #f6f8f9; */
  background: white;
  padding-top: 8px;
  padding-bottom: 8px;
}

.parameter_items li .param_field input[disabled]
 {
  /* background: #f6f8f9; */
  background: #eeeeee;
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
.el-select{
    width: 100%;
}
.el-input__inner{
    color: black !important;
}

.el-select-dropdown__item{
    padding: 0 20px;
}
.cursorClass[disabled] {
  background: #eeeeee;
  cursor: not-allowed;
  color: #777777;
}

</style>


