<template>
    <div  id="wireSizeCalculator" v-loading.fullscreen.lock="isLoading">
        <el-header class="navBar-container">
            <navBar :current-page="currentPage"/>
            <!-- <NavBar/> -->
        </el-header>

        
        <el-row class="top-header">

            <el-col :span="8">

                <el-checkbox
                    v-if="inverterType==='String Inverter'"
                    v-model="differentTypeInverter"
                    class="tableEditValue numberInput checkbox"          
                />
                <span v-if="inverterType==='String Inverter'" @click="printAllTables()">
                     Use  Different types of Inverters 
                </span> 

                <el-select
                    v-if="! printMode"
                    v-model="typeOfInterconnection"
                    size="small"
                    class="interconnectionDropdown"
                    placeholder="Type of Interconnection">

                    <el-option
                    v-for="type in typeOfInterconnectionOptions"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value" />
                </el-select>     
                <span class="printModeTrue" v-else> TYPE OF INTERCONNECTION IS {{typeOfInterconnection}}</span>
            </el-col>
            

            <el-col :span="16">
            <el-select
                v-if="! printMode"
                v-model="calculationBasis"
                class="calculationDropDown"
                size="medium"
                placeholder="Select">
                <el-option
                    v-for="calculation in calculationOptions"
                    :key="calculation.value"
                    :label="calculation.label"
                    :value="calculation.value"
                    :disabled="calculation.disabled"/>
            </el-select>
            <span class="printModeTrue" v-else>WIRE SIZE CALCULATIONS AS PER {{calculationBasis}}</span>
            <div class="reset-save">
            <el-button
               data-html2canvas-ignore="true"
                type="text"
                round
                @click="resetData">Reset
            </el-button>

            <el-button
              data-html2canvas-ignore="true"
                type="text"
                round
                @click="confirmOnClickAction">Save
            </el-button>
        <router-link  
        :to="'/studio/'+this.designId" > 
             <el-button
              data-html2canvas-ignore="true"
                type="text"
                round>Studio
            </el-button>
        </router-link>

            <!-- <el-button v-if="! printMode"
                data-html2canvas-ignore="true"
                type="text"
                round
                @click="printDiv('onlyTables')">DownloadAsPDF
            </el-button>
            <el-button
            v-else
              data-html2canvas-ignore="true"
                type="text"
                round
                >Downloading...Pls Wait!!
            </el-button> -->

             <router-link  
                :to="'/wireSizeCalculatorDownload/'+this.designId" target="_blank" > 
             <el-button
              data-html2canvas-ignore="true"
                type="text"
                round>Download
            </el-button>
            </router-link>

            <el-button
               data-html2canvas-ignore="true"
                type="text"
                round
                @click="downloadExcelFormat">Export Excel
            </el-button>

            </div>
            </el-col>

        
        </el-row>
        <el-row id="onlyTables" :gutter="20">
            <el-col :span="6" style="font-size:11px;">
                 <userInput
                    v-if="inverterDataFetched=== true"
                    :initial-solar-module-specs="solarModuleSpecs"
                    :initial-inverter-specs="inverterSpecs"
                    :initial-site-data="siteData"
                    :reset="reset"
                    :calculationBasis = "calculationBasis"
                    :print-mode="printMode"
                    :different-type-inverter ="differentTypeInverter"
                    :initial-optimizer-list="optimizerList"
                    @update-solar ="updateSolar"
                    @update-inverter="updateInverter"
                    @update-site="updateSite"
                    @update-no-of-inverter="updateNoOfInverter"
                    @update-optimizer-list="updateOptimizerList"
                />
            </el-col>
            <el-col :span="9" style="font-size:11px;">
                <calculationTable
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader1"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors="Number(tables[0].conductors)"
                    :initial-max-micro-inverters-in-one-string="Number(tables[0].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[0].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '0'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
                <div class = "togglebuttonClass">
                <span data-html2canvas-ignore="true" v-if = "tableHeader2.length > 0 && inverterSpecs[0].type !== 'String Inverter'" class="togglebuttonheader">{{tableHeader2}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader2.length > 0 && inverterSpecs[0].type !== 'String Inverter'" class="switch">
                   <input  v-model = "showtableheader2" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-if="inverterSpecs[0].type === 'String Inverter' || inverterSpecs[0].type === 'Micro Inverter'"
                    v-show="showtableheader2 || inverterSpecs[0].type === 'String Inverter'"
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader2"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[1].conductors)"
                    :initial-max-micro-inverters-in-one-string = "Number(tables[1].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[1].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '1'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />

         <div v-if="printMode" style="height:80px"></div>

          <!-- replica of above table for now when differentTypeInverter is true-->
            <div  v-if="parseInt(inverterSpecs[0].no_of_inverters)>0 && inverterSpecs[0].type !=='Micro Inverter' " >
             <div v-for="i in parseInt(inverterSpecs[0].no_of_inverters)-1" :key="i">

                <div v-show="differentTypeInverter" class = "togglebuttonClass">
                <span data-html2canvas-ignore="true" v-if = "tableHeader2.length > 0 && inverterSpecs[0].type !== 'String Inverter'" class="togglebuttonheader">{{tableHeader2}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader2.length > 0 && inverterSpecs[0].type !== 'String Inverter'" class="switch">
                   <input  v-model = "showtableheader2" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-if="inverterSpecs[0].type === 'String Inverter'"
                    v-show="differentTypeInverter && (showtableheader2 || inverterSpecs[0].type === 'String Inverter')"
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader2"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[i+7].conductors)"   
                    :initial-max-micro-inverters-in-one-string ="Number(tables[i+7].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[i+7].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    :for-loop-index = "i+1"
                    :table-no ="String(i +7)"
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />

                </div>
                </div>

                <!-- <div class="html2pdf__page-break"></div> -->
                <div  class = "togglebuttonClass ">
                <span  data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader3}}</span>
                <label  v-if = "tableHeader3.length > 0" class="switch">
                   <input data-html2canvas-ignore="true" v-model = "showtableheader3" type="checkbox">
                   <span data-html2canvas-ignore="true" class="slider round"></span>
               </label>
               </div>
                <calculationTable
                   v-if="inverterSpecs[0].type === 'String Inverter'"
                    v-show="inverterSpecs[0].type === 'String Inverter' && showtableheader3"
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader3"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors="Number(tables[2].conductors)"
                    :initial-max-micro-inverters-in-one-string="Number(tables[2].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[2].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '2'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />

                <!-- replica of above table for now when differentTypeInverter is true-->


              <div v-if="parseInt(inverterSpecs[0].no_of_inverters)>0 && inverterSpecs[0].type !=='Micro Inverter' " >
             <div v-for="i in parseInt(inverterSpecs[0].no_of_inverters)-1" :key="i">

                  <div v-show="differentTypeInverter"  class = "togglebuttonClass ">
                <span  data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader3}}</span>
                <label  v-if = "tableHeader3.length > 0" class="switch">
                   <input data-html2canvas-ignore="true" v-model = "showtableheader3" type="checkbox">
                   <span data-html2canvas-ignore="true" class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-if="inverterSpecs[0].type === 'String Inverter'"
                    v-show=" differentTypeInverter && inverterSpecs[0].type === 'String Inverter' && showtableheader3"
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader3"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors="Number(tables[i+7+Number(inverterSpecs[0].no_of_inverters)-1].conductors)"
                    :initial-max-micro-inverters-in-one-string="Number(tables[i+7+Number(inverterSpecs[0].no_of_inverters)-1].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[i+7+Number(inverterSpecs[0].no_of_inverters)-1].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    :for-loop-index = "i+1"
                    :table-no ="String(i +7 + Number(inverterSpecs[0].no_of_inverters)-1)"
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
             </div>
             </div>

            </el-col>
            <el-col :span="9" style="font-size:11px;">
               <div class = "togglebuttonClass">
                <span data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader4}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader4.length > 0" class="switch">
                   <input  v-model = "showtableheader4" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-if="inverterSpecs[0].type === 'String Inverter'"
                    v-show="inverterSpecs[0].type === 'String Inverter' && showtableheader4"
                    :calculationBasis = "calculationBasis"
                    :solar-module-specs="solarModuleSpecs"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader4"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors="Number(tables[3].conductors)"
                    :initial-max-micro-inverters-in-one-string="Number(tables[3].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[3].tagId"
                    :print-mode="printMode"
                    :initial-number-of-load-centres="Number(numberOfLoadCentres)"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '3'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @update-load-centres="saveTableLoadCentres"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
               
                <div v-if="false" class = "togglebuttonClass">
                <span data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader5}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader5.length > 0" class="switch">
                   <input v-model = "showtableheader5" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-if="false"
                    v-show = "showtableheader5"
                    :solar-module-specs="solarModuleSpecs"
                    :calculationBasis = "calculationBasis"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader5"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[4].conductors)"
                    :initial-max-micro-inverters-in-one-string = "Number(tables[4].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[4].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '4'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
                
                <div class = "togglebuttonClass">
                <span data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader6}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader6.length > 0" class="switch">
                   <input v-model = "showtableheader6" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-show="showtableheader6"
                    :solar-module-specs="solarModuleSpecs"
                    :calculationBasis = "calculationBasis"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader6"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[5].conductors)"
                    :initial-max-micro-inverters-in-one-string = "Number(tables[5].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[5].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '5'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />

                <div v-if="printMode" style="height:20px"></div>

                
                <div class = "togglebuttonClass" :class="{tableno6: (showtableheader6 && showtableheader4)}">
                <span data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader7}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader7.length > 0" class="switch">
                   <input v-model = "showtableheader7" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-show="showtableheader7"
                    :solar-module-specs="solarModuleSpecs"
                    :calculationBasis = "calculationBasis"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader7"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[6].conductors)"
                    :initial-max-micro-inverters-in-one-string = "Number(tables[6].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[6].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '6'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
                <div class = "togglebuttonClass" :class="{tableno7: ((showtableheader4 && showtableheader6 && !showtableheader7) || (!showtableheader4 &&showtableheader6 && showtableheader7) || (showtableheader4 && !showtableheader6 && showtableheader7)) }">
                <span data-html2canvas-ignore="true" class="togglebuttonheader">{{tableHeader8}}</span>
                <label data-html2canvas-ignore="true" v-if = "tableHeader8.length > 0" class="switch">
                   <input v-model = "showtableheader8" type="checkbox">
                   <span class="slider round"></span>
               </label>
               </div>
                <calculationTable
                    v-show="showtableheader8"
                    :solar-module-specs="solarModuleSpecs"
                    :calculationBasis = "calculationBasis"
                    :inverter-specs="inverterSpecs"
                    :site-data="siteData"
                    :table-header="tableHeader8"
                    :wire-sizes.sync="wireSizes"
                    :total-inverters.sync="totalInverters"
                    :reset="reset"
                    :initial-conductors ="Number(tables[7].conductors)"
                    :initial-max-micro-inverters-in-one-string = "Number(tables[7].maxMicroInvertersInOneString)"
                    :initial-tag-id = "tables[7].tagId"
                    :print-mode="printMode"
                    :type-of-interconnection="typeOfInterconnection"
                    :different-type-inverter ="differentTypeInverter"
                    table-no = '7'
                    @conductor-from-table="saveTableConductor"
                    @max-micro-from-table="saveTableMaxMicro"
                    @all-calculation-obj="saveAllCalculationFromTable"
                    @tag-id-from-table="saveTagIdFromTable"
                />
            </el-col>
        </el-row>
    </div>
</template>

<script>
import navBar from '@/components/ui/navBar/navBar.vue';
// import NavBar from '@/components/ui/newNavbar';
import API from '@/services/api/';
import userInput from './components/userInputs.vue';
import calculationTable from './components/calculationTable.vue';
import infiniteScrollDropdownInverter from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverter.vue/';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';
export default {
    components: {
        userInput,
        calculationTable,
        navBar,
        infiniteScrollDropdownInverter,
        infiniteScrollDropdownPanel,
    },
    data() {
        return {
            designId: this.$route.params.designId,
            zeroth : 0,
            patchMode : false,
            currentPage: 'wireSizeCalculator',
            showtableheader2: false,
            showtableheader3: false,
            showtableheader4:false,
            showtableheader5: false,
            showtableheader6: false,
            showtableheader7: false,
            showtableheader8: false,
            typeOfInterconnection: 'BACKFEED',
            typeOfInterconnectionOptions : [
                {
                    value: 'BACKFEED',
                    label: 'BACKFEED',
                },
                {
                    value: 'TAP',
                    label: 'TAP',
                }
            ],
            calculationOptions: [
                {
                    value: 'NEC-2014',
                    label: 'WIRE SIZE CALCULATIONS AS PER NEC 2014 and less',
                },
                { 
                    value: 'NEC-2017',
                    label: 'WIRE SIZE CALCULATIONS AS PER NEC 2017',
                },
                {
                    value: 'NEC-2020',
                    label: 'WIRE SIZE CALCULATIONS AS PER NEC 2020',
                },
                {
                    value: 'Voltage Drop',
                    label: 'WIRE SIZE CALCULATIONS AS PER VOLTAGE DROP',
                    disabled: true,
                },
            ],
            calculationBasis: 'NEC-2014',
            tableHeader1 : 'ARRAY TO JUNCTION BOX',
            tableHeader2 :'JUNCTION BOX TO INVERTER',
            tableHeader3 : 'INVERTER TO LOAD CENTRE',
            tableHeader4 : 'LOAD CENTRE TO PRODUCTION METER',
            tableHeader5 : 'PRODUCTION METER TO AC DISCONNECT',
            tableHeader6 : 'INVERTER TO AC DISCONNECT',
            tableHeader7 : 'AC DISCONNECT TO INTERCONNECTION',
            tableHeader8 : 'INVERTER TO INTERCONNECTION',
            reset: 0,
            totalInverters: {
                a: 0,
                b: 0,
            },
            numberOfLoadCentres : 0,
            wireSizes: {
                wireSizeATOJ: 10,
                wireSizeITOA: 10,
                wireSizeJTOC: 10,
                wireSizeCTOA: 10,
            },
            solarModuleSpecs: {
                manufactureName: '',
                modelName: '',
                vmp: '',
                imp: '',
                voc: '',
                isc: '',
                dimensions: '',
            },
            inverterSpecs: [ {
                    type: 'String Inverter',
                    optimizer: false,
                    manufactureName: '',
                    modelName: '',
                    maxOutputVoltage: 0,
                    no_of_inverters: 0,
                    maxOutputCurrent: 0,
                    optimizerSpecs: {
                        manufactureName: '',
                        modelName: '',
                        maxDCCurrent: 0,
                    },
       },
            ],
            siteData: {
                weatherStation:'',
                recordLowTemp: '',
                ambientTemp: '',
                conduitHeight: '',
                roofTopTemp: '',
                tempCorrectionFactorDC: 90,
                conductorTypeDC: 'Copper',
                tempCorrectionFactorAC: 90,
                conductorTypeAC: 'Copper',
                tempCoeff: 0,
            },
            tables: [
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },
                        {
                            conductors: 0,
                            maxMicroInvertersInOneString: 0,
                            allCalculationObj:{},
                            tagId:0,
                        },

                    ]
                ,

                dropClose: false,
                selectedMicroInverter: {},
                selectedStringInverter: {},
                addPanelDiv: false,
                printMode : false,
                isLoading:false,
                differentTypeInverter : false,

                inverterDataFetched :false,

                optimizerList:{},
                allCalculationObj:{},
                allCalculationData: {
                                        "String":{
                                            "ARRAY TO JUNCTION BOX":{},
                                            "JUNCTION BOX TO INVERTER":[],
                                            "INVERTER TO LOAD CENTRE":[],
                                            "LOAD CENTRE TO AC DISCONNECT":{},
                                            "INVERTER TO AC DISCONNECT":{},
                                            "AC DISCONNECT TO INTERCONNECTION":{},
                                            "LOAD CENTRE TO INTERCONNECTION":{},
                                        },
                                        "Micro" :{
                                            "JUNCTION BOX TO COMBINER BOX":{},
                                            "COMBINER BOX TO PRODUCTION METER":{},
                                            "COMBINER BOX TO AC DISCONNECT":{},
                                            "AC DISCONNECT TO INTERCONNECTION":{},
                                            "COMBINER BOX TO INTERCONNECTION":{},
                                        },
                                    }
            
        };
    },
    computed: {  
                inverterType(){ 
                    return this.inverterSpecs[0].type;
                }
    },
    watch: {
        inverterSpecs: {
            deep: true,
            handler(val) {

            //    console.log("inside watch for inverterSpecs", val[0].type);

                if (val[0].type === 'String Inverter') {
                    this.showtableheader2 = true;
                    this.tableHeader1 = 'ARRAY TO JUNCTION BOX';
                    this.tableHeader2 = 'JUNCTION BOX TO INVERTER';
                    this.tableHeader3 = 'INVERTER TO LOAD CENTRE';
                    this.tableHeader4 = 'LOAD CENTRE TO AC DISCONNECT';
                    this.tableHeader5 = 'PRODUCTION METER TO AC DISCONNECT';
                    this.tableHeader6 = 'INVERTER TO AC DISCONNECT'
                    this.tableHeader7 = 'AC DISCONNECT TO INTERCONNECTION';
                    this.tableHeader8 = 'INVERTER TO INTERCONNECTION'

                    if(val[0].no_of_inverters>=2){
                         this.tableHeader8 = 'LOAD CENTRE TO INTERCONNECTION';
                    }
                }
                else if (val[0].type === 'Micro Inverter') {

                    // this.showtableheader2 = false;
                    this.tableHeader1 = 'JUNCTION BOX TO COMBINER BOX';
                    this.tableHeader2 = 'COMBINER BOX TO PRODUCTION METER';
                    this.tableHeader3 = '';
                    this.tableHeader4 = '';
                    this.tableHeader5 = 'PRODUCTION METER TO AC DISCONNECT';
                    this.tableHeader6 = 'COMBINER BOX TO AC DISCONNECT';
                    this.tableHeader7 = 'AC DISCONNECT TO INTERCONNECTION';
                    this.tableHeader8 = 'COMBINER BOX TO INTERCONNECTION';
                }
            },
        },

        tables: {
            deep: true,
            handler(val){
                
                if(this.inverterSpecs[0].type ==='Micro Inverter'){

                if(val[0].conductors >8){

                            this.tableHeader1 = 'JUNCTION BOX TO LOAD CENTRE';
                            this.tableHeader2 = 'LOAD CENTRE TO PRODUCTION METER';
                            this.tableHeader3 = '';
                            this.tableHeader4 = '';
                            this.tableHeader5 = 'PRODUCTION METER TO AC DISCONNECT';
                            this.tableHeader6 = 'LOAD CENTRE TO AC DISCONNECT';
                            this.tableHeader7 = 'AC DISCONNECT TO INTERCONNECTION';
                            this.tableHeader8 = 'LOAD CENTRE TO INTERCONNECTION';
                }
                else{
                            this.tableHeader1 = 'JUNCTION BOX TO COMBINER BOX';
                            this.tableHeader2 = 'COMBINER BOX TO PRODUCTION METER';
                            this.tableHeader3 = '';
                            this.tableHeader4 = '';
                            this.tableHeader5 = 'PRODUCTION METER TO AC DISCONNECT';
                            this.tableHeader6 = 'COMBINER BOX TO AC DISCONNECT';
                            this.tableHeader7 = 'AC DISCONNECT TO INTERCONNECTION';
                            this.tableHeader8 = 'COMBINER BOX TO INTERCONNECTION';
                }
              }

            },
        },

        
       
    },



    mounted(){
        this.fetchCalculatorInformation();
        //    this.downloadPdf();
        this.addScript('https://raw.githack.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js');
    },


    methods: {
        async downloadExcelFormat() {
            try {
                const response = await API.WIRE_SIZE_CALCULATOR.GET_EXCEL(this.designId);
                const excelUrl = response.data;
                this.downloadFileHelper(excelUrl, '.xlsx');
            }
            catch (e) {
                console.error('ERROR: Download failed');
                this.$message({
                    showClose: true,
                    message: 'Error downloading Excel. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        downloadFileHelper(url, extension) {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.setAttribute('download', this.designId + extension); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        },
        printDiv(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            var originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
        },
        downloadPdf(){
            this.printMode = true;
            //this.addScript('https://raw.githack.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js');
            // let element = document.getElementById("wireSizeCalculator");
            setTimeout ( () => {
            let element = document.getElementById("onlyTables");
            console.log("yes here");
            let opt = {
                margin:       0.25,
                filename:     'wireSizeCalculator.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { dpi: 300,scale: 6 },
                jsPDF:        { unit: 'in', format: [15,8], orientation: 'landscape' },
            };
            // html2pdf(element);
            html2pdf().set(opt).from(element).save();
            this.printMode = false;
            }, 3000)
        },

       addScript(url) {
         var script = document.createElement('script');
         script.type = 'application/javascript';
         script.src = url;
         document.head.appendChild(script);
       },

        saveTableConductor(conductors,index){
            this.tables[index].conductors = conductors;    
        },
        saveTableMaxMicro(maxMicro, index){
            this.tables[index].maxMicroInvertersInOneString = maxMicro;
        },
        saveTagIdFromTable(tagId, index){
            this.tables[index].tagId = tagId;  
        },
        saveAllCalculationFromTable(allCalculationObj,index){

                // console.log("got all calculation from calculation table from table no",index);
                // this.allCalculationObj[String(index)] = allCalculationObj;
                // console.log(this.allCalculationObj,index);
                this.tables[index].allCalculationObj = {};
                this.tables[index].allCalculationObj = allCalculationObj;
        },
        saveTableLoadCentres(loadCentres)
        {
             this.numberOfLoadCentres = loadCentres;
        },
        updateSolar(solarObj){
           
        
               this.solarModuleSpecs = solarObj;
               
        },

        updateOptimizerList(optimizerList){
            this.optimizerList = optimizerList;
 
        },

         updateNoOfInverter(noOfInverter){
                    if(noOfInverter==='')
                    return;

                    let obj1 = {
                                    conductors: 0,
                                    maxMicroInvertersInOneString: 0,
                                    allCalculationObj:{},
                                    tagId:0,
                                };
                    let N =  noOfInverter; 
                    let X1 = this.tables.length;
                    while(this.tables.length>8)
                    {
                        this.tables.pop();
                    }
                    let X2 = this.tables.length;
                     // Now the length of tables array must be 8 (index 0 to 7)
                    for(let j=1; j<= 2*(N-1); j++)
                    {
                        this.tables.push(obj1);
                    }
                    let X = this.tables.length;
                     
        },
        updateInverter(inverterObj){
            this.inverterSpecs = inverterObj;   // saving whole array which i am recieving
        },
        updateSite(siteObj){ 
            this.siteData = siteObj;
        },
        printAllTables(){
            console.log("print tables",this.tables);
            console.log("inverterDataFetched value",this.inverterDataFetched)
        },
        adjustAllCalculationDataForSLD(){
            console.log("inside adjustment function",this.tables);
            let numberOfInverters = (this.tables.length - 6)/2;
            if(this.inverterSpecs[0].type==='String Inverter'){
                this.allCalculationData.String["ARRAY TO JUNCTION BOX"] = this.tables[0].allCalculationObj;
                this.allCalculationData.String["JUNCTION BOX TO INVERTER"]=[];
                this.allCalculationData.String["JUNCTION BOX TO INVERTER"].push(this.tables[1].allCalculationObj); 
                for(let i=1+7;i<1+7+numberOfInverters-1;i++){
                    this.allCalculationData.String["JUNCTION BOX TO INVERTER"].push(this.tables[i].allCalculationObj);
                }
                this.allCalculationData.String["INVERTER TO LOAD CENTRE"]=[];
                this.allCalculationData.String["INVERTER TO LOAD CENTRE"].push(this.tables[2].allCalculationObj);
                for(let i=1+7+numberOfInverters-1 ; i<1+7+numberOfInverters-1+ numberOfInverters-1;i++){
                    this.allCalculationData.String["INVERTER TO LOAD CENTRE"].push(this.tables[i].allCalculationObj);
                }
                this.allCalculationData.String["LOAD CENTRE TO AC DISCONNECT"] = this.tables[3].allCalculationObj;
                this.allCalculationData.String["INVERTER TO AC DISCONNECT"] = this.tables[5].allCalculationObj;
                this.allCalculationData.String["AC DISCONNECT TO INTERCONNECTION"] = this.tables[6].allCalculationObj;
                this.allCalculationData.String["LOAD CENTRE TO INTERCONNECTION"] = this.tables[7].allCalculationObj;
            }
            else{
                this.allCalculationData.Micro["JUNCTION BOX TO COMBINER BOX"] = this.tables[0].allCalculationObj;
                this.allCalculationData.Micro["COMBINER BOX TO PRODUCTION METER"] = this.tables[1].allCalculationObj;
                this.allCalculationData.Micro["COMBINER BOX TO AC DISCONNECT"] = this.tables[5].allCalculationObj;
                this.allCalculationData.Micro["AC DISCONNECT TO INTERCONNECTION"] = this.tables[6].allCalculationObj;
                this.allCalculationData.Micro["COMBINER BOX TO INTERCONNECTION"] = this.tables[7].allCalculationObj;
            }
        },

         async confirmOnClickAction() {
              
                // this.postNewInputCalculator();
                this.adjustAllCalculationDataForSLD();

                 if(this.patchMode=== false)
                this.postNewInputCalculator();

                else if(this.patchMode === true)
                {
                    this.patchInputCalculator();
                }

               
            },

               async postNewInputCalculator() {
            
               let scene= {
                solarModuleSpecsToSend: {
                manufactureName: this.solarModuleSpecs.manufactureName,
                modelName: this.solarModuleSpecs.modelName,
                vmp: this.solarModuleSpecs.vmp,
                imp: this.solarModuleSpecs.imp,
                voc: this.solarModuleSpecs.voc,
                isc: this.solarModuleSpecs.isc,
                dimensions: this.solarModuleSpecs.dimensions,
              },

                // inverterSpecsToSend: {
                // type: this.inverterSpecs.type,
                // optimizer: this.inverterSpecs.optimizer,
                // manufactureName: this.inverterSpecs.manufactureName,
                // no_of_inverters: this.inverterSpecs.no_of_inverters,
                // modelName: this.inverterSpecs.modelName,
                // maxOutputVoltage: this.inverterSpecs.maxOutputVoltage,
                // maxOutputCurrent: this.inverterSpecs.maxOutputCurrent,
                //    optimizerSpecs: {
                //     manufactureName: this.inverterSpecs.optimizerSpecs.manufactureName,
                //     modelName: this.inverterSpecs.optimizerSpecs.modelName,
                //     maxDCCurrent: this.inverterSpecs.optimizerSpecs.maxDCCurrent,
                //   },
                // },

                inverterSpecsToSend : this.inverterSpecs,   // array of inverterSpecs



                siteDataToSend: {
                weatherStation : this.siteData.weatherStation,
                recordLowTemp: this.siteData.recordLowTemp,
                ambientTemp: this.siteData.ambientTemp,
                conduitHeight: this.siteData.conduitHeight,
                tempCorrectionFactorDC: this.siteData.tempCorrectionFactorDC,
                conductorTypeDC: this.siteData.conductorTypeDC,
                tempCorrectionFactorAC: this.siteData.tempCorrectionFactorAC,
                conductorTypeAC: this.siteData.conductorTypeAC,
                
            },

                THeader2: this.showtableheader2,
                THeader3: this.showtableheader3,
                THeader4: this.showtableheader4,
                THeader5: this.showtableheader5,
                THeader6: this.showtableheader6,
                THeader7: this.showtableheader7,
                THeader8: this.showtableheader8,

                tableArray : this.tables,

                calculationBasis : this.calculationBasis,

                numberOfLoadCentres : this.numberOfLoadCentres,
                typeOfInterconnection : this.typeOfInterconnection,
                optimizerList : this.optimizerList,
                differentTypeInverter : this.differentTypeInverter,
                allCalculationData : this.allCalculationData,


            };
                 let postData = {
                "design": this.designId,
                "scene": scene 
                }
           
                try {
                   
                   
                    const response = await API.WIRE_SIZE_CALCULATOR.POST_CALCULATOR(postData);
                    this.fetchCalculatorInformation();
                    this.$message({
                        showClose: true,
                        message: 'Information saved successfully.',
                        type: 'success',
                        center: true
                    });
                }
                catch (e) {

                      this.$message({
                        showClose: true,
                        message: 'Error in saving the information. Try again.',
                        type: 'error',
                        center: true
                    });

                   
                    console.log(e);
                }
            
        },   


         async patchInputCalculator() {

               let scene= {
                solarModuleSpecsToSend: {
                manufactureName: this.solarModuleSpecs.manufactureName,
                modelName: this.solarModuleSpecs.modelName,
                vmp: this.solarModuleSpecs.vmp,
                imp: this.solarModuleSpecs.imp,
                voc: this.solarModuleSpecs.voc,
                isc: this.solarModuleSpecs.isc,
                dimensions: this.solarModuleSpecs.dimensions,
              },

                // inverterSpecsToSend: {
                // type: this.inverterSpecs.type,
                // optimizer: this.inverterSpecs.optimizer,
                // manufactureName: this.inverterSpecs.manufactureName,
                // no_of_inverters: this.inverterSpecs.no_of_inverters,
                // modelName: this.inverterSpecs.modelName,
                // maxOutputVoltage: this.inverterSpecs.maxOutputVoltage,
                // maxOutputCurrent: this.inverterSpecs.maxOutputCurrent,
                //    optimizerSpecs: {
                //     manufactureName: this.inverterSpecs.optimizerSpecs.manufactureName,
                //     modelName: this.inverterSpecs.optimizerSpecs.modelName,
                //     maxDCCurrent: this.inverterSpecs.optimizerSpecs.maxDCCurrent,
                //   },
                // },

                inverterSpecsToSend: this.inverterSpecs,

                   siteDataToSend: {
                weatherStation : this.siteData.weatherStation,
                recordLowTemp: this.siteData.recordLowTemp,
                ambientTemp: this.siteData.ambientTemp,
                conduitHeight: this.siteData.conduitHeight,
                tempCorrectionFactorDC: this.siteData.tempCorrectionFactorDC,
                conductorTypeDC: this.siteData.conductorTypeDC,
                tempCorrectionFactorAC: this.siteData.tempCorrectionFactorAC,
                conductorTypeAC: this.siteData.conductorTypeAC,
                
            },   

                THeader2: this.showtableheader2,
                THeader3: this.showtableheader3,
                THeader4: this.showtableheader4,
                THeader5: this.showtableheader5,
                THeader6: this.showtableheader6,
                THeader7: this.showtableheader7,
                THeader8: this.showtableheader8,

                tableArray : this.tables,
                 calculationBasis : this.calculationBasis,
                 numberOfLoadCentres : this.numberOfLoadCentres,
                 typeOfInterconnection : this.typeOfInterconnection,
                 optimizerList : this.optimizerList,
                 differentTypeInverter : this.differentTypeInverter,
                 allCalculationData : this.allCalculationData,
                 

          };

          
                      let patchData = {
                       "design": this.designId,
                       "scene": scene 
                       }
           
                     try {
                         console.log("patch data",patchData);
                       const response = await API.WIRE_SIZE_CALCULATOR.PATCH_CALCULATOR(patchData, this.designId);
                       // this.fetchCalculatorInformation();


                        this.$message({
                        showClose: true,
                        message: 'Information updated successfully.',
                        type: 'success',
                        center: true
                    });
                      }
                     catch (e) {
                         
                         console.error(e);


                         this.$message({
                        showClose: true,
                        message: 'Error in updating the information. Try again.',
                        type: 'error',
                        center: true
                    });
                     }
            
        },


           async fetchCalculatorInformation(){
                this.isLoading = true;
                try {
                    const response = await API.WIRE_SIZE_CALCULATOR.GET_CALCULATOR(this.designId);
                    this.patchMode = true;
                    let obj = response.data.scene;
                    let solarModuleSpecsObj = obj.solarModuleSpecsToSend;
                    let inverterSpecsObj = obj.inverterSpecsToSend;  // now it should be an array containing objects
                    let siteDataObj = obj.siteDataToSend;
                

                    this.showtableheader2 = obj.THeader2;
                    this.showtableheader3 = obj.THeader3;
                    this.showtableheader4 = obj.THeader4;
                    this.showtableheader5 = obj.THeader5;
                    this.showtableheader6 = obj.THeader6;
                    this.showtableheader7 = obj.THeader7;
                    this.showtableheader8 = obj.THeader8;

                    this.calculationBasis = obj.calculationBasis;
                    this.numberOfLoadCentres = obj.numberOfLoadCentres;
                    this.typeOfInterconnection = obj.typeOfInterconnection;
                    this.optimizerList = obj.optimizerList;
                    this.differentTypeInverter = obj.differentTypeInverter;
                   
                    this.tables = obj.tableArray;
                    let N1 = inverterSpecsObj.length;
                    let numberOfConductorsFromStudio = this.tables[0].conductors;
                    // total length of table array should be 8 + 2*(N1-1);
                    // Now if suppose for the first time there will be length 8 only for table array but more inverters can come as done for sld
                    // so check the condition and increase the table length by pushing some obejcts
 

                    // if(this.tables.length !== 8+ 2*(N1-1) && inverterSpecsObj[0].type=='String Inverter'){
                    //     let count = (8+ 2*(N1-1))- this.tables.length;
                    //     while(count--){
                    //         this.tables.push(
                    //             {
                    //             conductors: 0,
                    //             maxMicroInvertersInOneString: 0,
                    //             allCalculationObj:{},
                    //             },
                    //         );
                    //     }
                    // }

                    if(this.tables.length !== 8+ 2*(N1-1)){
                        // for microInverter this case is already handled because , N1 will always be 1 in that case.
                        this.tables = []; //reset the tables and add again as no of inverters has been changed .
                        let total = 8 + 2*(N1-1);
                        while(total--){
                            this.tables.push(
                                {
                                conductors: 0,
                                maxMicroInvertersInOneString: 0,
                                allCalculationObj:{},
                                tagId:0,
                                },
                            );
                        }
                    }
                    for(let i1=0;i1<this.tables.length;i1++){
                        if(inverterSpecsObj[0].type=='String Inverter'){
                            if((i1>=0 && i1<2)||(i1>=8 &&  i1<(8+N1-1))){
                                this.tables[i1].conductors = numberOfConductorsFromStudio;
                            }
                        }
                        else if(inverterSpecsObj[0].type=='Micro Inverter'){
                            this.tables[0].conductors = numberOfConductorsFromStudio;
                        }
                    }
                    for(let j=0;j<this.tables.length;j++){
                        if((j>=2 && j<=7) || (j>= (8+N1-1))){
                            if(this.tables[j].conductors==0)
                            this.tables[j].conductors = 3;
                        }
                    }
                    if(inverterSpecsObj[0].type=='Micro Inverter'){
                        if(this.tables[1].conductors==0)
                        this.tables[1].conductors =3;
                    }
                    
                    // this.zeroth = Number(this.tables[0].conductors);
                    this.solarModuleSpecs.manufactureName = solarModuleSpecsObj.manufactureName;
                    this.solarModuleSpecs.modelName = solarModuleSpecsObj.modelName ;
                    this.solarModuleSpecs.vmp = solarModuleSpecsObj.vmp;
                    this.solarModuleSpecs.imp = solarModuleSpecsObj.imp;
                    this.solarModuleSpecs.voc = solarModuleSpecsObj.voc;
                    this.solarModuleSpecs.isc = solarModuleSpecsObj.isc

                    // `${this.selectedPanel.length}"L x ${this.selectedPanel.width}"W x ${this.selectedPanel.thickness}"D`
                    this.solarModuleSpecs.dimensions = `${solarModuleSpecsObj.dimensions[0]}"L x ${solarModuleSpecsObj.dimensions[1]}"W x ${solarModuleSpecsObj.dimensions[2]}"D` ;
                    // this.solarModuleSpecs.dimensions = solarModuleSpecsObj.dimensions;

                    this.inverterSpecs = inverterSpecsObj;  // while fetching data,recieveing array directly instead of object and properties
                    console.log("Yes here is incoming inverterSpecs",this.inverterSpecs);
                    this.inverterDataFetched = true;
                    console.log("Yes, inverter data is fetched");

                    this.siteData.weatherStation = siteDataObj.weatherStation;
                    this.siteData.recordLowTemp = siteDataObj.recordLowTemp;
                    this.siteData.ambientTemp = siteDataObj.ambientTemp;
                    this.siteData.conduitHeight = siteDataObj.conduitHeight;
                    this.siteData.tempCorrectionFactorDC = siteDataObj.tempCorrectionFactorDC;
                    this.siteData.conductorTypeDC = siteDataObj.conductorTypeDC;
                    this.siteData.tempCorrectionFactorAC = siteDataObj.tempCorrectionFactorAC;
                    this.siteData.conductorTypeAC = siteDataObj.conductorTypeAC;

                    this.isLoading = false;

                }
                catch (e) {
                    this.isLoading = false;
                    if(e.response.status === 404 || e.response.status === 400)
                    {
                        this.resetData();
                    }
                    console.error(e);
                }
           }, 

        resetData() {
            this.solarModuleSpecs = {
                manufactureName: '',
                modelName: '',
                vmp: '',
                imp: '',
                voc: '',
                isc: '',
                dimensions: '',
            };
            this.inverterSpecs =[ {
                type: 'String Inverter',
                    optimizer: false,
                    manufactureName: '',
                    modelName: '',
                    maxOutputVoltage: 0,
                    no_of_inverters: 0,
                    maxOutputCurrent: 0,
                    optimizerSpecs: {
                        manufactureName: '',
                        modelName: '',
                        maxDCCurrent: 0,
                    },
            }];
            this.siteData = {
                weatherStation:'',
                recordLowTemp: '',
                ambientTemp: '',
                conduitHeight: '',
                roofTopTemp: '',
                tempCorrectionFactorDC: 90,
                conductorTypeDC: 'Copper',
                tempCorrectionFactorAC: 90,
                conductorTypeAC: 'Copper',
                tempCoeff: 0,
            };
            this.wireSizes = {
                wireSizeATOJ: 10,
                wireSizeITOA: 10,
                wireSizeJTOC: 10,
                wireSizeCTOA: 10,
            };
            this.reset += 1;

            this.showtableheader2=false;
            this.showtableheader3=false;
            this.showtableheader4=false;
            this.showtableheader5=false;
            this.showtableheader6=false;
            this.showtableheader7=false;
            this.showtableheader8=false;

            while(this.tables.length>8)
            this.tables.pop();

            for(let i=0;i<this.tables.length;i++)
            {
                this.tables[i].conductors=0;
                this.tables[i].maxMicroInvertersInOneString =0;
                this.tables[i].allCalculationObj={};
                this.tables[i].tagId=0;
            }
            this.optimizerList = {};
            this.numberOfLoadCentres =0;
            this.differentTypeInverter = false;

            this.confirmOnClickAction(); 
            //   this.fetchCalculatorInformation();
             
        },

         handleCollapsable(id) {
            if (this.prevComId !== id) {
                this.prevComId ? document.getElementById(this.prevComId).classList.remove('open') : '';
                this.dropClose = id;
                document.getElementById(id).classList.add('open');
                this.prevComId = id;
            }
            else if (this.prevComId === id) {
                document.getElementById(this.prevComId).classList.remove('open');
                this.dropClose = false;
                this.prevComId = null;
            }
        },
    },
};
</script>
<style type="text/css" scoped>

@media print {
  .tableno6 {page-break-before: always;}
  .tableno7 {page-break-before: always;}

  /* html,body{
      width: 15in;
      height: 8in;
  } */
  @page{
      size: 17in 11in;
  }
}

.top-header {
    /* margin-top: 44px; */
    min-height: 100px;
    max-height: 100px;
    height: 100px;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    /* background-color: #f5f5f5; */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 20px;
}

/* .el-header {
    min-height: 60px;
    max-height: 100px;
    height: 100px;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 700;
} */
.calculationDropDown {
    min-height: 50px;
    max-height: 50px;
    height: 50px;
    width: 400px;
    min-width: 420px;
    max-width: 420px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 40%;
    /* position: fixed !important; */
}

.interconnectionDropdown{
    min-height: 50px;
    max-height: 50px;
    height: 50px;
    width: 40%;
    min-width: 40%;
    max-width: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 90%;
    margin-top: -43px;

}
#wireSizeCalculator {
    overflow-x: hidden;
}
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 70px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
  width: 57px;
}

.slider.round:before {
  border-radius: 50%;
}
.togglebuttonClass {
    display:flex;
    justify-content: space-between;
    margin-top: 15px;
}
.togglebuttonheader {
    padding: 10px;
}



.inverters-sappane-labels {
    color: black;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}
.hidden {
    display: none;
}
.hidden.open {
    display: block;
}

.addInventoryWrapper {
    width: 40%;
    float: right;
    display: flex;
}

/* .el-button  {
    margin-left: 330px !important;
} */

.reset-save{
    margin-left: 48%;
}


.printModeTrue{
    margin-left: 42%;
}

/* .el-checkbox__inner{
    
    border: 1px solid #409EFF !important;
} */
/* .darkDropdownWithFilters{

    margin-right: 64.5% !important;
    margin-top: 31px !important;
    min-width: 540px !important;
} */

</style>
