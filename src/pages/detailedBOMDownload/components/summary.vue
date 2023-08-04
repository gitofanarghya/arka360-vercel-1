<template>
    
                 <div v-if="activePage==='summary'" class="tab_content" id="tab1" >
                        <div class="card">
                            <div class="card_content">
                                <div class="row">
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label > Dollar Rate</label>
                                            <input type="number" v-model="firstObj.dollarRate" />
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Module</label>
                                            <input type="number" v-model="firstObj.moduleCost" />
                                        </div>
                                    </div>
                                     <div class="col col-4">
                                        <div class="input_area">
                                            <label>Distance from Above Site</label>
                                            <input type="number" v-model="firstObj.entryDistance" />
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Data Monitoring</label>
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
                        <!-- <div v-if="!CPMode" class="card">
                            <div class="card_content">
                                <div class="row">
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Capacity</label>
                                            <input type="text" value="100 MW" />
                                        </div>
                                    </div>
                                    <div class="col col-4">
                                        <div class="input_area">
                                            <label>Channel Partner Margin</label>
                                            <div class="input_append">
                                                <input type="text" value="74.37" />
                                                <span class="pct">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div> -->
                        <!-- <div class="card">
                            <div class="card_content">
                                <div class="data_area">
                                    <h5>Data Loggers</h5>
                                    <div class="check_group">
                                        <div class="checkbox">
                                            <input type="checkbox" id="radiation" />
                                            <label for="radiation">Radiation</label>
                                        </div>
                                        <div class="checkbox">
                                            <input type="checkbox" id="temperature" />
                                            <label for="temperature">Temperature</label>
                                        </div>
                                        <div class="checkbox">
                                            <input type="checkbox" id="wind" />
                                            <label for="wind">Wind</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>  -->

                        <!-- <div class="card table_card">
                            <div class="table_component absolute_value_table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Absolute Values</th>
                                            <th>CEIG & CMC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table class="sub_table">
                                                    <thead>
                                                        <tr>
                                                            <th>COGS</th>
                                                            <th>kWp</th>
                                                            <th>Main Supply</th>
                                                            <th>Supply - Optional</th>
                                                            <th>Spares</th>
                                                            <th>I&C</th>
                                                            <th>Other Civil</th>
                                                            <th>Freight</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Total</td>
                                                            <td>40.26</td>
                                                            <td>10,71,677.1</td>
                                                            <td>0.0</td>
                                                            <td>0.0</td>
                                                            <td>96,624.0</td>
                                                            <td>9,623.4</td>
                                                            <td>30,096.0</td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="5">Total COS of the System</td>
                                                            <td>12,08,021</td>
                                                            <td>Rs/Wp (total)</td>
                                                            <td>30.01</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td>
                                                <table class="sub_table">
                                                    <thead>
                                                        <tr>
                                                            <th>CEIG</th>
                                                            <th>O&M</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>0.0</td>
                                                            <td>0.0</td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2">
                                                                <span class="blank">blank</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> -->


                        <div  class="row">
                            <div class="col col-7">
                                <div v-if="!CPMode" class="card">
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
                                                    <tr v-if="keyName !== 'Inverter'">
                                                        <td>{{keyName}}</td>
                                                        <td>{{amount[`${keyName}`]}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                        <!-- <td></td>
                                                        <td></td> -->
                                                    </tr>    
                                                </tbody>

                                                <tbody>
                                                    <!-- <tr>
                                                        <td>Module</td>
                                                        <td>7,72,833 </td>
                                                        <td colspan="3">7,72,833 </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Structure</td>
                                                        <td>31,710 </td>
                                                        <td>0.79 </td>
                                                        <td>0.90</td>
                                                        <td>0.11</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Inverter</td>
                                                        <td>1,17,249</td>
                                                        <td>2.91</td>
                                                        <td>2.13</td>
                                                        <td>-0.78</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Data Monitoring</td>
                                                        <td>10,055 </td>
                                                        <td>0.25</td>
                                                        <td>0.09</td>
                                                        <td>-0.16</td>
                                                    </tr>
                                                    <tr>
                                                        <td>ACDB</td>
                                                        <td>54,900</td>
                                                        <td>1.36</td>
                                                        <td>0.35</td>
                                                        <td>-1.02</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Cables</td>
                                                        <td>28,051 </td>
                                                        <td>0.70</td>
                                                        <td>0.82</td>
                                                        <td>0.13</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Other BOS</td>
                                                        <td>77,879</td>
                                                        <td>1.93</td>
                                                        <td>0.72</td>
                                                        <td>-1.22</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service IC</td>
                                                        <td>1,06,247</td>
                                                        <td>2.64</td>
                                                        <td>2.65</td>
                                                        <td>0.01</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service Civil</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>CEIG</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>CMC-O&M - 1 yr</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td>0.01</td>
                                                        <td>0.01</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Logistics</td>
                                                        <td>30,096</td>
                                                        <td>0.75</td>
                                                        <td>0.54</td>
                                                        <td>-0.21</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Walkway, Safetyline, optional etc</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td>1.59</td>
                                                        <td>1.59</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Spares</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td>-</td>
                                                        <td></td>
                                                    </tr> -->
                                                    <tr>
                                                        <th>Basic Costs</th>
                                                        <th>{{totalAmount}}</th>
                                                        <th colspan="3">{{basicCostRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Contingency</td>
                                                        <td>{{contingency}}</td>
                                                        <td colspan="3">{{contingencyRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Forex</td>
                                                        <td>{{forex}}</td>
                                                        <td colspan="3">{{forexRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>TOTAL COGS</th>
                                                        <th>{{totalCOGS}}</th>
                                                        <th colspan="3">{{totalCOGSRsPerWP}}</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Gross Margins</td>
                                                        <td>{{grossMargin}}</td>
                                                        <td colspan="3">{{grossMarginRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Revenue Price</th>
                                                        <th>{{revenuePrice}}</th>
                                                        <th colspan="3">{{revenuePriceRsPerWP}}</th>
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
                                                        <td>{{systemParameters.workingCapital}}</td>
                                                        <td colspan="3">{{workingCapitalRsPerWP}}</td>
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
                                                        <td>Customer Charges</td>
                                                        <td>{{customerCharges}}</td>
                                                        <td colspan="3">{{customerChargesRsPerWP}}</td>
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
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="CPMode" class="card">
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
                                                <tbody v-for="(keyName, index) in currentRoofKeyArray" :key="index">
                                                   <tr v-if="keyName !== 'Inverter' && keyName !== 'Installation Kit' && keyName !== 'Earthing' && keyName !== 'Service IC' ">
                                                        <td>{{keyName}}</td>
                                                        <td>{{quantity[keyName]}}</td>
                                                        <!-- <td>{{((Number(amount[`${keyName}`]) + (Number(systemParameters.grossMarginPercentage) * Number(amount[`${keyName}`]))/100)).toFixed(2)}}</td> -->
                                                        
                                                    </tr>    
                                                </tbody>
                                                <tbody>
                                                    <tr>
                                                        <th>Basic Costs</th>
                                                        <th> Rs {{finalBasicCostForChannelPartner}} </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="!CPMode" class="card">
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
                                                        <td>{{amount["Module"]}} </td>
                                                        <td colspan="2">{{rsPerWP["Module"]}} </td>
                                                    </tr>
                                                    <tr>
                                                        <td>BOS</td>
                                                        <td>{{BOS}}</td>
                                                        <td colspan="2">{{BOSRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Erection, Testing and Commissioning</td>
                                                        <td>{{ETC}}</td>
                                                        <td colspan="2">{{ETCRsPerWP}}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Basic Prices (Without Taxes)</th>
                                                        <th>{{basicPrice}} </th>
                                                        <th colspan="2">{{basicPriceRsPerWP}}</th>
                                                    </tr>
                                                    <!-- <tr>
                                                        <td>GST on Module+Inverter</td>
                                                        <td>97,872</td>
                                                        <td>2.43</td>
                                                        <td>8.90%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>GST on BOS</td>
                                                        <td>31,753</td>
                                                        <td>0.79</td>
                                                        <td>8.90%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service Tax</td>
                                                        <td>9,954</td>
                                                        <td>0.25</td>
                                                        <td>8.90%</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Total Price of system without O&M</th>
                                                        <th>17,07,887</th>
                                                        <th colspan="2">42.42</th>
                                                    </tr> -->
                                                
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            <div class="col col-5">
                                <div v-if="!CPMode" class="card">
                                    <div class="card_content">
                                        <h5 class="card_title" >AC Cable distance</h5>
                                        <ul class="parameter_items" v-for="i in roofCount" :key="i">
                                            <li>
                                                <div class="param_title">
                                                    Roof {{i}}
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="acCableLength[i-1]"
                                                            v-validate="acCableLengthValidation"
                                                            name="AC Cable" />
                                                            <span class="pct">m</span>
                                                        </div>
                                                    </div>
                                                    <p class="formErrors">
                                                        <span>{{ errors.first('AC Cable') }}</span>
                                                    </p>
                                                </div>
                                                
                                            </li>
                                        </ul>
                                        <div class="button_group" v-if="enableACCableLengthData()" >
                                            <button type="button" class="btn btn-outline" @click="onCancelACCableLength()">Cancel</button>
                                            <button type="button" class="btn btn-primary" @click="updateACCableLength()">Update</button>
                                        </div>
                                    </div>
                                </div>


                                <div v-if="!CPMode" class="card">
                                    <div class="card_content">
                                        <h5 class="card_title">System Parameters</h5>
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
                                                    Working Capital
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
                                                    Customer Charges
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.customerChargesPercentage" />
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
                                                    Module Margin
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="number" v-model="systemParameters.moduleMarginPercentage" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <!-- <li>
                                                <div class="param_title">
                                                    Operations & Maintenance (CMC)
                                                </div>
                                                <div class="param_field">
                                                    <div class="select_area">
                                                        <select>
                                                            <option value="">25 Years</option>
                                                            <option value="">20 Years</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </li> -->
                                            <!-- <li>
                                                <div class="param_title">
                                                    Sales Commission
                                                </div>
                                                <div class="param_field">
                                                    <div class="input_area">
                                                        <div class="input_append">
                                                            <input type="text" value="" />
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
                                                            <input type="text" value="" />
                                                            <span class="pct">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li> -->
                                        </ul>
                                        <div class="button_group" v-if="enableUpdateSystemParameters()">
                                            <button type="button" class="btn btn-outline" @click="onCancelSystemParameters()">Cancel</button>
                                            <button type="button" class="btn btn-primary" @click="updateSystemParameters()">Update</button>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="!CPMode" class="card">
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

                                                   <tr v-if="keyName !== 'Inverter'">
                                                        <td>{{keyName}}</td>
                                                        <td>{{rsPerWP[`${keyName}`]}}</td>
                                                        <td>{{costBreakupRsPerWPPercentage[`${keyName}`]}}</td>
                                                        <!-- <td>{{((Number(amount[`${keyName}`]) + (Number(systemParameters.grossMarginPercentage) * Number(amount[`${keyName}`]))/100)).toFixed(2)}}</td> -->
                                                        
                                                    </tr>    
                                                </tbody>
                                                <tbody>
                                                    <!-- <tr>
                                                        <td>Module</td>
                                                        <td>19.20</td>
                                                        <td>62.9%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Structure</td>
                                                        <td>0.79</td>
                                                        <td>2.6%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Inverter</td>
                                                        <td>2.91</td>
                                                        <td>9.5%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Data Monitoring</td>
                                                        <td>0.25</td>
                                                        <td>0.8%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>ACDB</td>
                                                        <td>1.36</td>
                                                        <td>4.5%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Cables</td>
                                                        <td>0.70</td>
                                                        <td>2.3%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Other BOS</td>
                                                        <td>1.93</td>
                                                        <td>6.3%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service IC</td>
                                                        <td>2.64</td>
                                                        <td>8.6%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Service Civil</td>
                                                        <td>0.00</td>
                                                        <td>0.0%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>CEIG</td>
                                                        <td>0.00</td>
                                                        <td>0.0%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>CMC-O&M - 1 yr</td>
                                                        <td>0.00</td>
                                                        <td>0.0%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Logistics</td>
                                                        <td>0.75</td>
                                                        <td>2.4%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Walkway, Safetyline, optional etc</td>
                                                        <td>0.00</td>
                                                        <td>0.0%</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Spares</td>
                                                        <td>0.00</td>
                                                        <td>0.0%</td>
                                                    </tr> -->
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
                                <!-- <div class="card">
                                    <div class="card_content">
                                        <h4 class="table_title">O&M (5 lac/MWp)</h4>
                                        <div class="table_component">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Years</th>
                                                        <th class="text_right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Year 1</td>
                                                        <td class="text_right">23,753</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Year 2</td>
                                                        <td class="text_right">24,941</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Year 3</td>
                                                        <td class="text_right">26,188</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Year 4</td>
                                                        <td class="text_right">27,498</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Year 5</td>
                                                        <td class="text_right">28,872</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Total</th>
                                                        <th>1,31,253</th>
                                                    </tr>
                                                    <tr>
                                                        <th>NPV Value</th>
                                                        <th> 1,10,364.21</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                 -->
                            </div>
                        </div>
                    </div>
                   
</template>



<script>
import API from '@/services/api/';
export default {
    data(){
        return {
            designId: this.$route.params.designId,
            firstObj:{
                dollarRate:74.37,
                moduleCost:0.26,
                entryDistance:0,
                dataMonitoring:0,
            },
            firstObjTemp:{
                dollarRate:74.37,
                moduleCost:0.26,
                entryDistance:0,
                dataMonitoring:0,
            },
            acCableLength:[],
            acCableLengthTemp:[],
            moduleWattage:0,
            systemCapacityWp:0,
            allRoof:{},
            currentRoof:{},
            currentRoofKeyArray:[],
            amount:{},
            rsPerWP:{},
            quantity:{},
            costBreakupRsPerWPPercentage:{},
            tempAmount:0,
            tempRsPerWP:0,
            tempQuantity:0,
            totalAmount:0,
            totalRsPerWP:0,
            contingency:0,
            forex:0,
            systemParameters:{
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
            },
            serviceIC:0,
            roofCount:0,
            acCableLengthValidation:{
                required: true,
                max_value: 200,
            },
            
            
        };
    },
    props:{
       activePage:{
           type: String,
           default: '',
       },
       CPMode:{
           type: Boolean,
           default: false,
       }
    },
    computed:{
                basicCostRsPerWP(){
                     return (this.totalAmount/(this.systemCapacityWp)).toFixed(2) ;
                },
                contingencyRsPerWP(){
                    return this.contingency/(this.systemCapacityWp) ;
                },
                forexRsPerWP(){
                    return this.forex/(this.systemCapacityWp);
                },
                totalCOGS(){
                    let temp = Number(this.totalAmount) + Number(this.contingency) + Number(this.forex);
                    return temp;
                },
                totalCOGSRsPerWP(){
                     return (this.totalCOGS/(this.systemCapacityWp)).toFixed(2);
                },
                grossMargin(){
                    return ((this.systemParameters.grossMarginPercentage * this.totalCOGS)/100).toFixed(2) ;
                },
                grossMarginRsPerWP(){
                     return (this.grossMargin/(this.systemCapacityWp)).toFixed(2);
                },
                revenuePrice(){
                    return (Number(this.grossMargin) + Number(this.totalCOGS)).toFixed(2);
                },
                revenuePriceRsPerWP(){
                     return (this.revenuePrice/(this.systemCapacityWp)).toFixed(2);
                },
                insuranceAndBG(){
                    return ((Number(this.systemParameters.insuranceAndBGPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                insuranceAndBGRsPerWP(){
                     return (this.insuranceAndBG/(this.systemCapacityWp)).toFixed(2);
                },
                ddProvisions(){
                    return ((Number(this.systemParameters.ddProvisionsPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                ddProvisionsRsPerWP(){
                     return (this.ddProvisions/(this.systemCapacityWp)).toFixed(2);
                },
                warrantyProvision(){
                    return ((Number(this.systemParameters.warrantyProvisionPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                warrantyProvisionRsPerWP(){
                     return (this.warrantyProvision/(this.systemCapacityWp)).toFixed(2);
                },
                workingCapitalRsPerWP(){
                     return (this.systemParameters.workingCapital/(this.systemCapacityWp)).toFixed(2);
                },
                projectOverhead(){
                    return ((Number(this.systemParameters.projectOverheadPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                projectOverheadRsPerWP(){
                     return (this.projectOverhead/(this.systemCapacityWp)).toFixed(2);
                },
                companyOverhead(){
                    return ((Number(this.systemParameters.companyOverheadPercentage) * Number(this.revenuePrice))/100).toFixed(2);
                },
                companyOverheadRsPerWP(){
                     return (this.companyOverhead/(this.systemCapacityWp)).toFixed(2);
                },
                customerCharges(){
                    return ((Number(this.systemParameters.customerChargesPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                customerChargesRsPerWP(){
                     return (this.customerCharges/(this.systemCapacityWp)).toFixed(2);
                },
                salesCommission(){
                    return ((Number(this.systemParameters.salesCommissionPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                salesCommissionRsPerWP(){
                     return (this.salesCommission/(this.systemCapacityWp)).toFixed(2);
                },
                otherCharges(){
                    return ((Number(this.systemParameters.otherChargesPercentage) * Number(this.revenuePrice))/100).toFixed(2) ;
                },
                otherChargesRsPerWP(){
                     return (this.otherCharges/(this.systemCapacityWp)).toFixed(2);
                },
                totalOtherCost(){
                    return (
                       ( Number(this.insuranceAndBG) + Number(this.ddProvisions) + Number(this.warrantyProvision) 
                         + Number(this.projectOverhead) + Number(this.companyOverhead)
                        + Number(this.customerCharges) + Number(this.salesCommission) + Number(this.otherCharges)).toFixed(2)
                    );
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
                EBIDTA(){
                    return (Number(this.netMargin) + (Number(this.insuranceAndBG)/2) + Number(this.systemParameters.workingCapital)).toFixed(2) ;
                },
                EBIDTARsPerWP(){
                     return (this.EBIDTA/(this.systemCapacityWp)).toFixed(2);
                },
                BOSRsPerWP(){
                    return ((Number(this.basicCostRsPerWP) - Number(this.rsPerWP["Module"] ))/0.95).toFixed(2);
                },
                BOS(){
                    return (this.BOSRsPerWP * this.systemCapacityWp).toFixed(2);
                },
                ETC(){
                    return (Number(this.serviceIC)/0.95).toFixed(2);
                },
                ETCRsPerWP(){
                     return (Number(this.ETC)/Number(this.systemCapacityWp)).toFixed(2);
                },
                basicPrice(){
                    return (Number(this.amount["Module"])+ Number(this.BOS) + Number(this.ETC)).toFixed(2);
                },
                basicPriceRsPerWP(){
                    return (Number(this.basicPrice)/Number(this.systemCapacityWp)).toFixed(2);
                },

                removeExtraCostForChannelPartner(){
                    // here we are calculating total cost of Installation Kit, Earthing, and Service IC (including gross percentage) so that
                    // that can be remove from total basic cost gross included for channel partner
                    let removedCost = Number(this.amount['Installation Kit']) + Number(this.amount['Earthing']) + Number(this.amount['Service IC']) ;
                    // now include gross
                    removedCost = removedCost + (Number(this.systemParameters.grossMarginPercentage)* removedCost)/100 ;
                    return removedCost;
                },

                finalBasicCostForChannelPartner(){
                    return (Number(this.totalAmount) + Number((Number(this.totalAmount) * Number(this.systemParameters.grossMarginPercentage))/100) - this.removeExtraCostForChannelPartner).toFixed(2);
                },

                

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
                        this.moduleWattage = response.data.billOfMaterial.customerOrderDetails["moduleWattage"];
                        this.systemCapacityWp = response.data.billOfMaterial.customerOrderDetails["systemCapacityWp"];
                        this.allRoof = response.data["All Roofs"];
                        this.roofCount = Object.keys(response.data.Roof).length;  //Roof count
                        this.currentRoof = JSON.parse(JSON.stringify( this.allRoof ));
                        this.currentRoofKeyArray = Object.keys(this.currentRoof);
                        this.assignAmount();
                        this.totalAmount =  this.totalAmount.toFixed(2);
                        this.totalRsPerWP =  this.totalRsPerWP.toFixed(2);
                        this.getACCableLength(response);
                        this.$emit('updateBOMInformation',response);
                    }
                    catch{

                    }
                },

                getACCableLength(response){
                    this.acCableLength=[];
                    this.acCableLengthTemp=[];
                    for(let i=0; i<this.roofCount;i++){
                        this.acCableLength.push(0);
                        this.acCableLengthTemp.push(0);
                    }
                    let incomingArray = response.data.summary.acCableLength;
                    for(let j=0;j<incomingArray.length;j++){
                        this.acCableLength[j] = incomingArray[j];
                        this.acCableLengthTemp[j] = incomingArray[j];
                    }
                    // this.acCableLengthTemp = [...this.acCableLength];
                    // this.acCableLengthTemp = this.acCableLengthTemp.slice();
                },

                onCancelACCableLength(){
                    this.acCableLength = [...this.acCableLengthTemp];
                },

                assignAmount(){
                    this.totalAmount =0;
                    this.totalRsPerWP=0;

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
                        if(this.amount[category]!=='NaN' )
                        this.totalAmount += Number(this.amount[category]);
                        if(this.rsPerWP[category]!=='NaN')
                        this.totalRsPerWP += Number(this.rsPerWP[category]);
                    }
                     for(let i=0; i<this.currentRoofKeyArray.length; i++){
                        let category = this.currentRoofKeyArray[i];
                        category = String(category);
                        this.costBreakupRsPerWPPercentage[category] = ((this.rsPerWP[category]/this.totalRsPerWP)*100).toFixed(2);
                     }
                     this.serviceIC = this.amount["Service IC"];
                },

                initializeFirstObjectData(response){
                    const summaryData = response.data.summary;
                    this.firstObjTemp.dollarRate = summaryData.dollarRate;
                    this.firstObjTemp.moduleCost = summaryData.module;
                    this.firstObjTemp.entryDistance = summaryData.entryDistance;
                    this.firstObjTemp.dataMonitoring = summaryData.dataMonitoring;

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

                },

                onCancelSystemParameters(){
                    this.systemParameters.grossMarginPercentage = this.systemParametersTemp.grossMarginPercentage;
                    this.systemParameters.insuranceAndBGPercentage = this.systemParametersTemp.insuranceAndBGPercentage;
                    this.systemParameters.ddProvisionsPercentage = this.systemParametersTemp.ddProvisionsPercentage;
                    this.systemParameters.warrantyProvisionPercentage = this.systemParametersTemp.warrantyProvisionPercentage;
                    this.systemParameters.workingCapital = this.systemParametersTemp.workingCapital;
                    this.systemParameters.projectOverheadPercentage =  this.systemParametersTemp.projectOverheadPercentage ;
                    this.systemParameters.companyOverheadPercentage = this.systemParametersTemp.companyOverheadPercentage;
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
                        (this.firstObj.dataMonitoring!= this.firstObjTemp.dataMonitoring)
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
                        || (this.systemParameters.customerChargesPercentage != this.systemParametersTemp.customerChargesPercentage)
                        || (this.systemParameters.salesCommissionPercentage != this.systemParametersTemp.salesCommissionPercentage)
                        || (this.systemParameters.otherChargesPercentage != this.systemParametersTemp.otherChargesPercentage)
                        || (this.systemParameters.moduleMarginPercentage != this.systemParametersTemp.moduleMarginPercentage) 
                    );
                },

                async updateFirstObjectData(){

                    const patchData = {
                                        "dollarRate": this.firstObj.dollarRate,
                                        "module":this.firstObj.moduleCost,
                                        "entryDistance": this.firstObj.entryDistance,
                                        "dataMonitoring": this.firstObj.dataMonitoring,
                    }
                    try{
                        await API.DESIGNS.UPDATE_SUMMARY_DATA(this.designId,patchData);
                        this.firstObjTemp = JSON.parse(JSON.stringify(this.firstObj));
                        this.getBomAndSummaryData();
                        this.$message({
                            showClose: true,
                            message: 'Successfully Updated.',
                            type: 'success',
                            center: true
                        });
                    }
                    catch{
                        this.onCancelFirstObjectData();
                        this.$message({
                        showClose: true,
                        message: 'Error',
                        type: 'error',
                        center: true
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
                            message: 'Successfully Updated.',
                            type: 'success',
                            center: true
                         });
                    }
                    catch{
                            this.$message({
                            showClose: true,
                            message: 'Error',
                            type: 'error',
                            center: true
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
                            message: 'Successfully Updated.',
                            type: 'success',
                            center: true
                        });
                    }
                    catch{
                        this.onCancelSystemParameters();
                        this.$message({
                            showClose: true,
                            message: 'Error',
                            type: 'error',
                            center: true
                        });
                        
                    }
                },

                
    },
}
</script>



