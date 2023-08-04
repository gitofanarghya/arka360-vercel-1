<template>
    <div>
        <el-row class="tableBorder">
            <span class="header1">{{ prefix }}</span>
             <span  class="header1" v-if="tableHeader=='JUNCTION BOX TO INVERTER'">{{ tableHeaderDynamic1 }}</span>
             <span  class="header1" v-else-if="tableHeader=='INVERTER TO LOAD CENTRE'">{{ tableHeaderDynamic2 }}</span>
             <span  class="header1" v-else>{{ tableHeader }}</span>
            <el-row
                v-show="additionalUserInput"
                class="row-container">
                <el-col class="col left">
                    <span v-if="additionalUserInput==='Inverters'">Number of {{ additionalUserInput }}</span>
                    <span v-else-if="! printMode" class="inputRed">Number of {{ additionalUserInput }}</span>
                    <span v-else>Number of {{ additionalUserInput }}</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        :disabled="additionalUserInputDisabled"
                        v-model="noOfInverters"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                        @change="$emit('update-load-centres', noOfInverters)"
                        @keyup="updateInverterData">
                    <span class="printModeTrue" v-else>{{noOfInverters}}</span> -->
                    <span class="printModeTrue">{{noOfInverters}}</span>
                </el-col>
            </el-row> 
            <el-row
                v-show="isAmbientTempAdjVisible"
                class="row-container" style="height: 30px;max-height: none;">
                <el-col class="col left">
                    <span>Ambient Temperature Adjustment For Exposed Conduit Per NEC {{latestNECForAmbientTemp}} </span>
                </el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">{{ ambientTempAdjustment }}</span>
                    <span style="padding: 5px">℃</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Expected Wire Temperature (in celsius)</span></el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">{{ ambientTemp }}</span>
                    <span style="padding: 5px">℃</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Temperature Correction Per Table {{latestNECForTempCorr}}</span></el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">{{ tempCorrectionValue }}</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">No. of Current Carrying Conductors</span>
                    <span v-else >No. of Current Carrying Conductors</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                       v-if="! printMode"
                       type="number"
                        v-model="conductors"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                        @keyup="callToEmitConductor">
                    <span class="printModeTrue" v-else>{{conductors}}</span> -->
                    <span class="printModeTrue">{{conductors}}</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Conduit Fill Correction Per NEC {{latestNECForConduitFill}}</span></el-col>
                <el-col class="col right">
                    <span v-if="! printMode" class="calculatorOutput">{{ conduitCorrectionValue }}</span>
                    <span v-else class="calculatorOutput printModeTrue">{{ conduitCorrectionValue }}</span>
                </el-col>
            </el-row>
            <el-row class="row-container row-dropdown-input">
                <el-col class="col left"><span>Circuit Conductor Size</span></el-col>
                <el-col class="col right">
                    <!-- <el-select 
                        v-if="! printMode"
                        v-model="circuitConductorSize"
                        class="tableEditValue numberInput"
                        size="mini"
                        placeholder="Select"
                        @change="updateWireSize();">
                        <el-option
                            v-for="conductorSize in conductorSizeOptions"
                            :key="conductorSize.value"
                            :label="conductorSize.label"
                            :value="conductorSize.value"
                            :disabled="conductorSize.disabled"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{circuitConductorSize}}</span> -->
                    <span class="printModeTrue">{{circuitConductorSize}}</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Circuit Conductor Ampacity</span></el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">{{ circuitConductorAmpacity }}</span>
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
            <el-row
                v-show="isMicroInverterVisible"
                class="row-container">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Maximum Number Of Micro Inverters In One String</span>
                    <span v-else>Maximum Number Of Micro Inverters In One String</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model=  "maxMicroInvertersInOneString"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                         @keyup="callToEmitMaxMicro">
                    <span class="printModeTrue" v-else>{{maxMicroInvertersInOneString}}</span> -->
                    <span class="printModeTrue">{{maxMicroInvertersInOneString}}</span>
                </el-col>
            </el-row>
            <el-row class="row-container" style="height:33px !important; max-height:none !important">
                <el-col class="col left" style="display: flex;flex-direction: column;">
                <!-- <span style="border-bottom: 1px solid" v-if = "!checkAc()">Required Circuit Conductor Ampacity Per NEC  690.8(B)</span>
                <span style="border-bottom: 1px solid" v-if = "checkAc()">Required Circuit Conductor Ampacity Per NEC 690.8(B)</span> -->
                <span style="border-bottom: 1px solid" >Required Circuit Conductor Ampacity Per NEC {{latestNECForRequiredCCA}}</span>
                <span v-if = "!checkAc() && inverterSpecs[0].optimizer"> DC output current X 1.25</span>
                <span v-if = "!checkAc() && !inverterSpecs[0].optimizer"> 1.25 X 1.25 X I<sub>sc</sub> </span>
                <span v-if = "checkAc()"> 1.25 X Max Inverter Output Current </span>
                </el-col>

                <el-col class="col right">
                    <span class="calculatorOutput">{{ reqCircuitConductorAmpacity }}</span>
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
            <el-row class="row-container" style="height:56px !important; max-height:none !important">
                <el-col class="col left" style="display: flex;flex-direction: column;"><span style="border-bottom: 1px solid;">Derated Ampacity of Circuit Conductor Per NEC {{latestNECForDeratedAmpacity}} </span>
                <span> Temperature correction as per Table {{latestNECForTempCorr}} X Conduit Fill Correction Per Table {{latestNECForConduitFill}} X Circuit Conductor Ampacity </span>
                </el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">{{ deratedCircuitConductorAmpacity }}</span>
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>

            <el-row class="row-container">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Tag Id</span>
                    <span v-else >Tag Id</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                       v-if="! printMode"
                        v-model="tagId"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                        @keyup="callToEmitTagId"> -->
                    <span class="printModeTrue">{{tagId}}</span>
                </el-col>
            </el-row>
            
            <el-row
            data-html2canvas-ignore="true"
                v-show="conductorSizeError !== 'none'"
                class="error">
                <span :style="{ color: conductorSizeError }">
                    ERROR: Wire Size is not as per the guidelines of Permit Drawing.
                </span>
            </el-row>



            <!-- <el-row data-html2canvas-ignore="true" v-if="tableHeader!=='ARRAY TO JUNCTION BOX' && tableHeader!=='INVERTER TO INTERCONNECTION' && tableHeader!=='LOAD CENTRE TO INTERCONNECTION'" 
            class="row-container row-dropdown-input">
                <el-col class="col left"><span>Ground Wire Size</span></el-col>
                <el-col class="col right">
                     <span class="printModeTrue">{{groundWireSize}}</span>
                </el-col>
            </el-row> -->


            <!-- <el-row v-if="tableHeader!=='ARRAY TO JUNCTION BOX' && tableHeader!=='INVERTER TO INTERCONNECTION' && tableHeader!=='LOAD CENTRE TO INTERCONNECTION'" class="row-container">
                <el-col class="col left"><span>Conduit Size</span></el-col>
                <el-col class="col right">
                    <span class="calculatorOutput">
                    {{ conduitSizeCalculation(sizeToin2[circuitConductorSize]*conductors + sizeToin2[groundWireSize] )}}
                    </span>
                    
                </el-col>
            </el-row> -->



        </el-row>
    </div>
</template>

<script>
import {
    CONDUIT_CORRECTION_TABLE,
    CIRCUIT_CONDUCTOR_AMPACITY_TABLE,
    AMBIENT_TEMP_ADJUSTMENT_TABLE,
    TEMP_CORRECTION_TABLE,
} from '../referenceTables';

export default {
    props: {
        initialConductors:{
            type : Number,
            default(){
                return 0;
            }
        },
        initialMaxMicroInvertersInOneString : {
            type : Number,
            default(){
                return 0;
            }
        },
        initialTagId:{
            type : String,
            default(){
                return 0;
            }
        },
        initialNumberOfLoadCentres:{
            type : Number,
            default(){
                return 0;
            }
       },

        tableNo: {
            type : String,
            default(){
                return 0;
            }
        },
        tableHeader: {
            type: String,
            default() {
                return 'Calculation Table';
            },
        },
        solarModuleSpecs: {
            type: Object,
            default() {
                return {
                    manufactureName: '',
                    modelName: '',
                    vmp: 0,
                    imp: 0,
                    voc: 0,
                    isc: 0,
                    dimensions: '',
                };
            },
        },
        // inverterSpecs: {
        //     type: Object,
        //     default() {
        //         return {
        //             type: 'String Inverter',
        //             optimizer: false,
        //             manufactureName: '',
        //             modelName: '',
        //             no_of_inverters: 0,
        //             maxOutputVoltage: 0,
        //             maxOutputCurrent: 0,
        //             optimizerSpecs: {
        //                 manufactureName: '',
        //                 modelName: '',
        //                 maxDCCurrent: 0,
        //             },
        //         };
        //     },
        // },

        inverterSpecs: {
            type: Array,
            default() {
                return [{
                    type: 'String Inverter',
                    optimizer: false,
                    manufactureName: '',
                    modelName: '',
                    no_of_inverters: 0,
                    maxOutputVoltage: 0,
                    maxOutputCurrent: 0,
                    optimizerSpecs: {
                        manufactureName: '',
                        modelName: '',
                        maxDCCurrent: 0,
                    },
                },];
            },
        },
        siteData: {
            type: Object,
            default() {
                return {
                    weatherStation:'',
                    recordLowTemp: 0,
                    ambientTemp: 0,
                    conduitHeight: 0,
                    roofTopTemp: 0,
                    tempCorrectionFactorDC: 90,
                    conductorTypeDC: 'Copper',
                    tempCorrectionFactorAC: 90,
                    conductorTypeAC: 'Copper',
                    tempCoeff: 0,
                };
            },
        },
        wireSizes: {
            type: Object,
            default() {
                return {
                    wireSize1: 10,
                    wireSize2: 10,
                    wireSize3: 10,
                    wireSize4: 10,
                };
            },
        },
        reset: {
            type: Number,
            default() {
                return 0;
            },
        },
        totalInverters: {
            type: Object,
            default() {
                return {
                    a: 0,
                    b: 0,
                };
            },
        },
        calculationBasis: {
            type: String,
            default() {
                return 'NEC-2014'
            }
        },

         printMode :{
            type : Boolean,
            default(){
                return false;
            }
        },

        typeOfInterconnection :{
            type: String,
            default(){
                return 'BACKFEED';
            }
        },
         differentTypeInverter: {
               type : Boolean,
               default()  {
                return false;
            }
        },

        forLoopIndex : {
            type : Number,
            default(){
                return 1;
            }
        }
    },
    data() {
        return {
            tableHeaderDynamic1:"",
            tableHeaderDynamic2:"",
            conductors: this.initialConductors,
            maxMicroInvertersInOneString : this.initialMaxMicroInvertersInOneString,
            tagId:this.initialTagId,
            numberOfLoadCentres : this.initialNumberOfLoadCentres,
            additionalUserInputDisabled : false,
            conductorSizeOptions: [
                {
                    value: 2000,
                    label: '2000 AWG',
                },
                {
                    value: 1750,
                    label: '1750 AWG',
                },
                {
                    value: 1500,
                    label: '1500 AWG',
                },
                {
                    value: 1250,
                    label: '1250 AWG',
                },
                {
                    value: 1000,
                    label: '1000 AWG',
                },
                {
                    value: 900,
                    label: '900 AWG',
                },
                {
                    value: 800,
                    label: '800 AWG',
                },
                {
                    value: 750,
                    label: '750 AWG',
                },
                {
                    value: 700,
                    label: '700 AWG',
                },
                {
                    value: 600,
                    label: '600 AWG',
                },
                {
                    value: 500,
                    label: '500 AWG',
                },
                {
                    value: 400,
                    label: '400 AWG',
                },
                {
                    value: 350,
                    label: '350 AWG',
                },
                {
                    value: 300,
                    label: '300 AWG',
                },
                {
                    value: 250,
                    label: '250 AWG',
                },
                {
                    value: '1/0',
                    label: '1/0 AWG',
                    disabled: false,
                },
                {
                    value: '2/0',
                    label: '2/0 AWG',
                    disabled: false,
                },
                {
                    value: '3/0',
                    label: '3/0 AWG',
                    disabled: false,
                },
                {
                    value: '4/0',
                    label: '4/0 AWG',
                    disabled: false,
                },
                {
                    value: 1,
                    label: '1 AWG',
                    disabled: false,
                },
                {
                    value: 2,
                    label: '2 AWG',
                    disabled: false,
                },
                {
                    value: 3,
                    label: '3 AWG',
                    disabled: false,
                },
                {
                    value: 4,
                    label: '4 AWG',
                    disabled: false,
                },
                {
                    value: 6,
                    label: '6 AWG',
                    disabled: false,
                },
                {
                    value: 8,
                    label: '8 AWG',
                    disabled: false,
                },
                {
                    value: 10,
                    label: '10 AWG',
                    disabled: false,
                },
                {
                    value: 12,
                    label: '12 AWG',
                    disabled: false,
                },
                {
                    value: 14,
                    label: '14 AWG',
                    disabled: false,
                },
                {
                    value: 16,
                    label: '16 AWG',
                    disabled: false,
                },
                {
                    value: 18,
                    label: '18 AWG',
                    disabled: false,
                },
            ],
            noOfInverters: '',
            // conductors: '',
            circuitConductorSize: 10,
            groundWireSize : 8,
            // maxMicroInvertersInOneString: '',
            optimizedConductorSizeIdx: 25,
            conductorSizeError: 'none',

            sizeToin2 :{
                     
                          '250' : 0.3970,
                          '1/0' : 0.1855,
                           '2/0': 0.2223,
                           '3/0': 0.2679,
                           '4/0': 0.3237,
                           '1'  : 0.1562,
                            '2' : 0.1158,
                            '3' : 0.0973,
                            '4' : 0.0824,
                            '6' : 0.0507,
                            '8' : 0.0366,
                            '10': 0.0211,
                            '12': 0.0133,
                            '14': 0.0097, 
            },
            in2Size : {
                     '0.213' : '3/4',
                     '0.346' : '1',
                     '0.598' : '5/4',
                     '0.814' : '3/2',
                     '1.342' : '2',
                     '2.343' : '5/2',
                     '3.538' : '3',
                     '4.618' : '7/2',
                     '5.901' : '4',     
            },
            inchArray : [0.213,0.346,0.598,0.814,1.342,2.343,3.538,4.618,5.901],
            allCalculationObj:{
                    "EXPECTED WIRE TEMPERATURE (IN CELSIUS)":'',
                    "TEMPERATURE CORRECTION PER TABLE 310.15(B)(2)(A)":'',
                    "NO. OF CURRENT CARRYING CONDUCTORS":'',
                    "CONDUIT FILL CORRECTION PER NEC 310.15(B)(3)(A)":'',
                    "CIRCUIT CONDUCTOR SIZE":'',
                    "CIRCUIT CONDUCTOR AMPACITY 310.15(B)(16)":'',
                    "AMBIENT TEMPERATURE ADJUSTMENT FOR EXPOSED CONDUIT PER NEC 310.15(B)(2)(C)":'',
                    "GROUND WIRE SIZE":'',
                    "CONDUIT SIZE":'',
                    "REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR DC AND STRING":'',
                    "REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING":'',
                    "REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO INITIAL STAGE":'',
                    "REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO AFTERWARDS":'',
                    "DERATED AMPACITY OF CIRCUIT CONDUCTOR PER NEC 310.15(B)(2)(A)":'',
                    "MAXIMUM NUMBER OF MICRO INVERTERS IN ONE STRING":'',
                    "TAG ID":'',
            },
            conduitSize:'',
        };
    },
    computed: {
        prefix() {
            let prefix;
            if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
            || this.tableHeader === 'JUNCTION BOX TO INVERTER') {
                prefix = 'DC CONDUCTOR AMPACITY CALCULATIONS';
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
            || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
            || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE'
            || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION' 
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                prefix = 'AC CONDUCTOR AMPACITY CALCULATIONS';
            }
            return `${prefix}: `;
        },
        ambientTempAdjustment() {
            const adjValue = AMBIENT_TEMP_ADJUSTMENT_TABLE(this.siteData.conduitHeight, this.calculationBasis);
            return adjValue !== null ? adjValue : 'N/A';
        },
        ambientTemp() {
            const ambientTemp = parseInt(this.siteData.ambientTemp, 10) || 0;
            const ambientTempAdj = AMBIENT_TEMP_ADJUSTMENT_TABLE(this.siteData.conduitHeight, this.calculationBasis) || 0;
            return this.isAmbientTempAdjVisible ? (ambientTemp + ambientTempAdj) : ambientTemp;
        },
        tempCorrectionValue() {
            const roundOffAmbientTemp = Math.min(
                Math.max(0, Math.floor((this.ambientTemp + 4) / 5) * 5),
                85,
            );
            let tempCorrectionFactor;

            if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
            || this.tableHeader === 'JUNCTION BOX TO INVERTER'
            || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
            || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {
                tempCorrectionFactor = this.siteData.tempCorrectionFactorDC;
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT') {
                tempCorrectionFactor = this.siteData.tempCorrectionFactorAC;
            }
            const adjValue = TEMP_CORRECTION_TABLE[`${roundOffAmbientTemp}`][`${tempCorrectionFactor}`];
            return adjValue !== null ? adjValue : 'N/A';
        },
        conduitCorrectionValue() {
            const adjValue = CONDUIT_CORRECTION_TABLE(this.conductors);
            return adjValue !== null ? adjValue : 'N/A';
        },
        circuitConductorAmpacity() {
            let conductorType;
            let tempCorrectionFactor;

            if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
            || this.tableHeader === 'JUNCTION BOX TO INVERTER'
            || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
            || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {
                conductorType = this.siteData.conductorTypeDC;
                tempCorrectionFactor = this.siteData.tempCorrectionFactorDC;
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                conductorType = this.siteData.conductorTypeAC;
                tempCorrectionFactor = this.siteData.tempCorrectionFactorAC;
            }
            const adjValue = CIRCUIT_CONDUCTOR_AMPACITY_TABLE[`${this.circuitConductorSize}`][`${conductorType}`][`${tempCorrectionFactor}`];
            return adjValue !== null ? adjValue : 'N/A';
        },
        reqCircuitConductorAmpacity() {
            let value;
            // console.log("value of value",value);
            if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
            || this.tableHeader === 'JUNCTION BOX TO INVERTER') {
                if (this.inverterSpecs[0].optimizer
                && parseFloat(this.inverterSpecs[0].optimizerSpecs.maxDCCurrent)) {
                    value = 1.25 * this.inverterSpecs[0].optimizerSpecs.maxDCCurrent;
                }
                else {
                    value = 1.25 * 1.25 * this.solarModuleSpecs.isc;
                }
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR DC AND STRING"] = value;
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE' || this.tableHeader === 'INVERTER TO INTERCONNECTION' || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                // Different type of inverter's Condition Applied
                if(this.differentTypeInverter=== false)
                value = 1.25 * this.inverterSpecs[0].maxOutputCurrent * this.inverterSpecs[0].no_of_inverters; //original line
              
                else  
                {
                    let totalSumOfCurrent=0;
                    for(let i=0;i< this.inverterSpecs.length;i++)
                    {
                        if(this.inverterSpecs[i].maxOutputCurrent>=0)
                        totalSumOfCurrent += Number(this.inverterSpecs[i].maxOutputCurrent);
                    }
                    value = 1.25 * totalSumOfCurrent;
                }
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING"]= value;
                
            }
            else if (this.tableHeader === 'JUNCTION BOX TO COMBINER BOX' || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {

                // Different type of inverter's Condition Applied
                if(this.differentTypeInverter=== false){
                value = 1.25 * this.maxMicroInvertersInOneString *      //original line
                    this.inverterSpecs[0].maxOutputCurrent;
                }
                else
                {
                    let totalSumOfCurrent=0;
                    for(let i=0;i< this.inverterSpecs.length;i++)
                    {
                        if(this.inverterSpecs[i].maxOutputCurrent>=0)
                        totalSumOfCurrent += Number(this.inverterSpecs[i].maxOutputCurrent);
                    }
                    value = 1.25 * totalSumOfCurrent;
                }   
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO INITIAL STAGE"] = value;        
            }
            else if (this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
                    || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                    || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
                    || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
                    || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
                    || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                     // Different type of inverter's Condition Applied
                if(this.differentTypeInverter=== false)
                value = 1.25 * this.inverterSpecs[0].maxOutputCurrent * this.inverterSpecs[0].no_of_inverters  ; //original line

                else
                {
                    let totalSumOfCurrent=0;
                    for(let i=0;i< this.inverterSpecs.length;i++)
                    {
                        if(this.inverterSpecs[i].maxOutputCurrent>=0)
                            totalSumOfCurrent += Number(this.inverterSpecs[i].maxOutputCurrent);
                    }
                    value = 1.25 * totalSumOfCurrent;
                }    
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO AFTERWARDS"] = value;
            }
            else if (this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT') {
                if (this.inverterSpecs[0].type === 'String Inverter') {

                    // Different type of inverter's Condition Applied
                          if(this.differentTypeInverter=== false)
                          value = 1.25 * this.inverterSpecs[0].maxOutputCurrent * this.inverterSpecs[0].no_of_inverters;  //original line
                          else
                         {
                                let totalSumOfCurrent=0;
                                 for(let i=0;i< this.inverterSpecs.length;i++)
                                {
                                    if(this.inverterSpecs[i].maxOutputCurrent>=0)
                                    totalSumOfCurrent += Number(this.inverterSpecs[i].maxOutputCurrent);
                                    
                                }
                                // console.log("hello totalsumofcurrent",totalSumOfCurrent);
                                 value = 1.25 * totalSumOfCurrent;   
                          }    
                          this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING"] = value;
                        //   debugger
                }
                else {
                    // Different type of inverter's Condition Applied
                    if(this.differentTypeInverter=== false)
                    value = 1.25 * this.inverterSpecs[0].maxOutputCurrent * this.inverterSpecs[0].no_of_inverters;  //original line

                    else
                    {
                        let totalSumOfCurrent=0;
                            for(let i=0;i< this.inverterSpecs.length;i++)
                        {
                            if(this.inverterSpecs[i].maxOutputCurrent>=0)
                                totalSumOfCurrent += Number(this.inverterSpecs[i].maxOutputCurrent);
                        }
                            value = 1.25 * totalSumOfCurrent;
                    }
                    this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO AFTERWARDS"] = value;    

                }
            }
            return value ? parseFloat(value.toFixed(2)) : 'N/A';
        },
        deratedCircuitConductorAmpacity() {
            const value = this.tempCorrectionValue *
                this.conduitCorrectionValue * this.circuitConductorAmpacity;
            return value !== null ? parseFloat(value.toFixed(2)) : 'N/A';
        },
        isMicroInverterVisible() {
            if (this.tableHeader === 'JUNCTION BOX TO COMBINER BOX' || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {
                return true;
            }
            return false;
        },
        additionalUserInput() {
            if (this.inverterSpecs[0].type === 'String Inverter') {
                if (this.tableHeader === 'INVERTER TO LOAD CENTRE' || this.tableHeader === 'INVERTER TO AC DISCONNECT'
                || this.tableHeader === 'INVERTER TO INTERCONNECTION' || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                    this.noOfInverters = this.inverterSpecs[0].no_of_inverters
                    this.additionalUserInputDisabled = true
                    return 'Inverters';
                }

                else if (this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER' || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT') {
                    this.numberOfLoadCentres = this.initialNumberOfLoadCentres;
                    this.noOfInverters = this.numberOfLoadCentres;
                    return 'Load Centres';
                }
            }
            else if (this.inverterSpecs[0].type === 'Micro Inverter') {
                if (this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
                || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
                || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
                || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
                || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
                || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
                || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT') {
                    this.noOfInverters = this.inverterSpecs[0].no_of_inverters
                    this.additionalUserInputDisabled = true
                    return 'Inverters';
                }
            }
            return null;
        },
        isAmbientTempAdjVisible() {
            if (this.tableHeader === 'JUNCTION BOX TO INVERTER'
            || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
            || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {
                return true;
            }
            return false;
        },

        latestNECForAmbientTemp(){
            if(this.inverterSpecs[0].type=='Micro Inverter'){
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' ){
                    return '310.15(B)(3)(C)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(B)(2)';
                }
            }
            else if(this.inverterSpecs[0].type=='String Inverter'){
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' ){
                    return '310.15(B)(3)(C)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(B)(1)';
                }
            }
        },
        latestNECForTempCorr(){
            if(this.inverterSpecs[0].type=='Micro Inverter' || this.inverterSpecs[0].type=='String Inverter' ){
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' ){
                    return '310.15(B)(2)(a)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(B)(1)';
                }
            }
        },
        latestNECForConduitFill(){
            if(this.inverterSpecs[0].type=='Micro Inverter'){
                if(this.calculationBasis=='NEC-2014' ){
                    return '310.15(B)(2)(b)';
                }
                else if(this.calculationBasis=='NEC-2017'){
                    return '310.15(B)(3)(a)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(C)(1)';
                }
            }
            else if(this.inverterSpecs[0].type=='String Inverter'){
                if(this.calculationBasis=='NEC-2014' ||  this.calculationBasis=='NEC-2017'){
                    return '310.15(B)(3)(a)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(C)(1)';
                }
            }
        },
        latestNECForRequiredCCA(){
             console.log("inside latestNECForRequiredCCA computed data",this.inverterSpecs[0].type);
            if(this.inverterSpecs[0].type=='Micro Inverter'){
                console.log("inside latestNECForRequiredCCA computed data");
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' || this.calculationBasis=='NEC-2020' ){
                    if(this.tableHeader=='JUNCTION BOX TO COMBINER BOX' || this.tableHeader=='JUNCTION BOX TO LOAD CENTRE' ){
                        return '690.8(A&B)';
                    }
                    else{
                        return '690.8(B)'
                    }
                }
            }
            else if(this.inverterSpecs[0].type=='String Inverter'){
                if(this.calculationBasis=='NEC-2014' ||  this.calculationBasis=='NEC-2017' || this.calculationBasis=='NEC-2020' ){
                    if(this.tableHeader=='ARRAY TO JUNCTION BOX' || this.tableHeader=='JUNCTION BOX TO INVERTER' ){
                        return '690.8(A&B)';
                    }
                    else{
                        return '690.8(B)'
                    }
                }
               
            }
        },
        latestNECForDeratedAmpacity(){
            if(this.inverterSpecs[0].type=='Micro Inverter'){
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' ){
                    if(this.tableHeader=='JUNCTION BOX TO COMBINER BOX' || this.tableHeader=='JUNCTION BOX TO LOAD CENTRE'){
                        return '310.15(B)(2)(a)';
                    }
                    else{
                        return '310.16'
                    }
                }
                else if(this.calculationBasis=='NEC-2020'){
                    if(this.tableHeader=='JUNCTION BOX TO COMBINER BOX' || this.tableHeader=='JUNCTION BOX TO LOAD CENTRE'){
                        return '310.15(B)(1)';
                    }
                    else{
                        return '310.16'
                    }
                }
            }
            else if(this.inverterSpecs[0].type=='String Inverter'){
                if(this.calculationBasis=='NEC-2014' || this.calculationBasis=='NEC-2017' ){
                    return '310.15(B)(2)(a)';
                }
                else if(this.calculationBasis=='NEC-2020'){
                    return '310.15(B)(1)';
                }
            }
        }
    },
    watch: {
        reqCircuitConductorAmpacity() {
            this.calculateOptimisedConductorSize();
            this.updateWireSizeError();
            this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR DC AND STRING"] = this.reqCircuitConductorAmpacity;
            this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING"] = this.reqCircuitConductorAmpacity;
            this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO INITIAL STAGE"] = this.reqCircuitConductorAmpacity;
            this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO AFTERWARDS"] = this.reqCircuitConductorAmpacity;

            this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
        },
        // deratedCircuitConductorAmpacity() {
        //     this.calculateOptimisedConductorSize();
        // },
        tempCorrectionValue() {
            this.calculateOptimisedConductorSize();
            this.allCalculationObj["TEMPERATURE CORRECTION PER TABLE 310.15(B)(2)(A)"] = this.tempCorrectionValue;

            this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
        },
        conduitCorrectionValue() {
            this.calculateOptimisedConductorSize();
            this.allCalculationObj["CONDUIT FILL CORRECTION PER NEC 310.15(B)(3)(A)"] = this.conduitCorrectionValue;

            this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));

        },
        circuitConductorSize() {
            this.updateWireSize();
            this.updateWireSizeError();
            this.allCalculationObj["CIRCUIT CONDUCTOR SIZE"] = this.circuitConductorSize;

            this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
        },
        reset() {
            this.resetData();
        },
        typeOfInterconnection:{
            immediate: true,
            handler(val){
                if(val==='TAP' && this.tableHeader ==='AC DISCONNECT TO INTERCONNECTION')
                {
                     if(this.circuitConductorSize ===8  ||
                        this.circuitConductorSize ===10 ||
                        this.circuitConductorSize ===12 ||
                        this.circuitConductorSize ===14 ||
                        this.circuitConductorSize ===16 ||
                        this.circuitConductorSize ===18 )
                     
                     {
                     this.circuitConductorSize=6;
                     this.conductorSizeError = 'none';

                     }
                }
                else
                 this.calculateOptimisedConductorSize();
                // else
                //  this.circuitConductorSize=10;

            }
        },
        initialConductors: {
           immediate: true,
               handler (val, oldVal) {
              this.conductors = val;
            }
        },
        initialMaxMicroInvertersInOneString : {
               immediate: true,
               handler (val, oldVal) {
              this.maxMicroInvertersInOneString = val;
            }
        },
        initialTagId:{
            immediate: true,
            handler(val){
                this.tagId = val;
            }
        },
        wireSizes: {
            deep: true,
            handler() {
                let idx;
                if (this.tableHeader === 'JUNCTION BOX TO INVERTER') {
                    idx = this.conductorSizeOptions
                        .findIndex(obj => obj.value === this.wireSizes.wireSizeATOJ);
                }
                else if (this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
                         || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                         || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
                         || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
                         || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
                         || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                    this.wireSizes.wireSize2 = this.circuitConductorSize;
                    idx = this.conductorSizeOptions
                        .findIndex(obj => obj.value === this.wireSizes.wireSizeJTOC);
                }
                else if (this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
                || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
                || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION') {
                    if (this.inverterSpecs[0].type === 'String Inverter') {
                        idx = this.conductorSizeOptions
                            .findIndex(obj => obj.value === this.wireSizes.wireSizeITOA);
                    }
                    else {
                        idx = this.conductorSizeOptions
                            .findIndex(obj => obj.value === this.wireSizes.wireSizeCTOA);
                    }
                }
                if (idx !== -1 && idx !== undefined) {
                    const currentSizeIdx = this.conductorSizeOptions
                        .findIndex(obj => obj.value === this.circuitConductorSize);
                    if (currentSizeIdx > idx) {
                        this.circuitConductorSize = this.conductorSizeOptions[idx].value;
                    }
                    for (let i = 0, len = this.conductorSizeOptions.length; i < len; i += 1) {
                        if (i <= idx) {
                            this.conductorSizeOptions[i].disabled = false;
                        }
                        else {
                            this.conductorSizeOptions[i].disabled = true;
                        }
                    }
                }
            },
        },
        ambientTemp:{
            handler(val){
                this.allCalculationObj["EXPECTED WIRE TEMPERATURE (IN CELSIUS)"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        conductors:{
            handler(val){
                this.allCalculationObj["NO. OF CURRENT CARRYING CONDUCTORS"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        circuitConductorAmpacity:{
            handler(val){
                this.allCalculationObj["CIRCUIT CONDUCTOR AMPACITY 310.15(B)(16)"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        ambientTempAdjustment:{
            handler(val){
                this.allCalculationObj["AMBIENT TEMPERATURE ADJUSTMENT FOR EXPOSED CONDUIT PER NEC 310.15(B)(2)(C)"]= val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        groundWireSize:{
            handler(val){
                this.allCalculationObj["GROUND WIRE SIZE"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        conduitSize:{
            handler(val){
                this.allCalculationObj["CONDUIT SIZE"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        deratedCircuitConductorAmpacity:{
            handler(val){
                this.allCalculationObj["DERATED AMPACITY OF CIRCUIT CONDUCTOR PER NEC 310.15(B)(2)(A)"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        maxMicroInvertersInOneString:{
            handler(val){
                this.allCalculationObj["MAXIMUM NUMBER OF MICRO INVERTERS IN ONE STRING"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        tagId:{
            handler(val){
                this.allCalculationObj["TAG ID"] = val;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            }
        },
        differentTypeInverter:{
            handler(val){
                this.differentTypeInverter = val;
            }
        } 
    },
    mounted() {
        this.initializeDynamicTableHeader();
        this.calculateOptimisedConductorSize();
        this.changeCircuitConductorSizeWhenTap();
        this.initializeAndEmitAllCalculationData();
    },
    methods: {
            initializeDynamicTableHeader(){
                if(this.tableHeader=='JUNCTION BOX TO INVERTER'){
                    this.tableHeaderDynamic1 = this.tableHeader+' '+Number(this.forLoopIndex);
                }
                if(this.tableHeader=='INVERTER TO LOAD CENTRE'){
                    this.tableHeaderDynamic2 = 'INVERTER'+' '+Number(this.forLoopIndex)+' TO LOAD CENTRE';
                }
            },
            initializeAndEmitAllCalculationData(){
                this.allCalculationObj["EXPECTED WIRE TEMPERATURE (IN CELSIUS)"] = this.ambientTemp;
                this.allCalculationObj["TEMPERATURE CORRECTION PER TABLE 310.15(B)(2)(A)"] = this.tempCorrectionValue;
                this.allCalculationObj["NO. OF CURRENT CARRYING CONDUCTORS"] = this.conductors;
                this.allCalculationObj["CONDUIT FILL CORRECTION PER NEC 310.15(B)(3)(A)"] = this.conduitCorrectionValue;
                this.allCalculationObj["CIRCUIT CONDUCTOR SIZE"] = this.circuitConductorSize;
                this.allCalculationObj["CIRCUIT CONDUCTOR AMPACITY 310.15(B)(16)"] = this.circuitConductorAmpacity;
                this.allCalculationObj["AMBIENT TEMPERATURE ADJUSTMENT FOR EXPOSED CONDUIT PER NEC 310.15(B)(2)(C)"]= this.ambientTempAdjustment;
                this.allCalculationObj["GROUND WIRE SIZE"] = this.groundWireSize;
                this.allCalculationObj["CONDUIT SIZE"] = this.conduitSize;
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR DC AND STRING"]=this.reqCircuitConductorAmpacity;
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING"]=this.reqCircuitConductorAmpacity;
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO INITIAL STAGE"]=this.reqCircuitConductorAmpacity;
                this.allCalculationObj["REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR MICRO AFTERWARDS"]=this.reqCircuitConductorAmpacity;
                this.allCalculationObj["DERATED AMPACITY OF CIRCUIT CONDUCTOR PER NEC 310.15(B)(2)(A)"] = this.deratedCircuitConductorAmpacity;
                this.allCalculationObj["MAXIMUM NUMBER OF MICRO INVERTERS IN ONE STRING"] = this.maxMicroInvertersInOneString;
                this.allCalculationObj["TAG ID"] = this.tagId;
                this.$emit('all-calculation-obj',this.allCalculationObj, Number(this.tableNo));
            },

            conduitSizeCalculation(finalValue){
                let actualInch;
                for(let i=0; i< this.inchArray.length; i++)
                {
                    if(this.inchArray[i]> finalValue)
                    {
                         actualInch = this.inchArray[i];
                         break;
                    }
                }
                this.conduitSize = this.in2Size[actualInch];

                return this.in2Size[actualInch];

            },
            changeCircuitConductorSizeWhenTap(){

                if(this.typeOfInterconnection==='TAP' && this.tableHeader ==='AC DISCONNECT TO INTERCONNECTION')
                this.circuitConductorSize=6;
                else
                 this.circuitConductorSize=10;
 
            },
       


            checkAc() {
                if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
                || this.tableHeader === 'JUNCTION BOX TO INVERTER') {
                    return false;
                }
                else if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
                || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
                || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
                || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
                || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
                || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE'
                || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
                || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                || this.tableHeader === 'INVERTER TO AC DISCONNECT'
                || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
                || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
                || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
                || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
                || this.tableHeader === 'INVERTER TO INTERCONNECTION'
                || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                return true;
            }
        },
            calculateOptimisedConductorSize() {
            let idx = 25;
            let conductorType;
            let tempCorrectionFactor;
            let conductorSize = this.conductorSizeOptions[idx].value;

            if (this.tableHeader === 'ARRAY TO JUNCTION BOX'
            || this.tableHeader === 'JUNCTION BOX TO INVERTER') {
                conductorType = this.siteData.conductorTypeDC;
                tempCorrectionFactor = this.siteData.tempCorrectionFactorDC;
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION'
            || this.tableHeader === 'JUNCTION BOX TO COMBINER BOX'
            || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE'
            || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                conductorType = this.siteData.conductorTypeAC;
                tempCorrectionFactor = this.siteData.tempCorrectionFactorAC;
            }
            conductorSize = this.conductorSizeOptions[idx].value;
            const tableValue = CIRCUIT_CONDUCTOR_AMPACITY_TABLE[`${conductorSize}`][`${conductorType}`][`${tempCorrectionFactor}`];
            const circuitConductorAmpacity = tableValue !== null ? tableValue : 'N/A';

            const value = this.tempCorrectionValue *
                this.conduitCorrectionValue * circuitConductorAmpacity;
            let DCCA = value !== null ? parseFloat(value.toFixed(2)) : 'N/A';

            let changed = false;
            while ((this.reqCircuitConductorAmpacity > DCCA) && DCCA !== 'N/A') {
                if (idx < 0) {
                    idx = 0;
                    break;
                }
                conductorSize = this.conductorSizeOptions[idx].value;
                const adjValue = CIRCUIT_CONDUCTOR_AMPACITY_TABLE[`${conductorSize}`][`${conductorType}`][`${tempCorrectionFactor}`];
                const CCA = adjValue !== null ? adjValue : 'N/A';

                DCCA = this.tempCorrectionValue *
                    this.conduitCorrectionValue * CCA;
                idx -= 1;
                changed = true;
            }

            this.optimizedConductorSizeIdx = changed ? idx + 1 : idx;
            this.circuitConductorSize = conductorSize;
        },
        updateWireSize() {
            if (this.tableHeader === 'ARRAY TO JUNCTION BOX') {
                this.wireSizes.wireSizeATOJ = this.circuitConductorSize;
            }
            else if (this.tableHeader === 'JUNCTION BOX TO COMBINER BOX' || this.tableHeader === 'JUNCTION BOX TO LOAD CENTRE') {
                this.wireSizes.wireSizeJTOC = this.circuitConductorSize;
            }
            else if (this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
                     || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
                     || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
                     || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
                     || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
                     || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT') {
                this.wireSizes.wireSizeCTOA = this.circuitConductorSize;
            }
            else if (this.tableHeader === 'INVERTER TO LOAD CENTRE' || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION' || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                this.wireSizes.wireSizeITOA = this.circuitConductorSize;
            }
            this.$emit('update:wireSizes', this.wireSizes);
        },
        updateWireSizeError() {
            const currentSizeIdx = this.conductorSizeOptions
                .findIndex(obj => obj.value === this.circuitConductorSize);
            let errorColor = 'none';
            if (this.optimizedConductorSizeIdx === currentSizeIdx) {
                errorColor = 'none';
            }
            else if (currentSizeIdx > this.optimizedConductorSizeIdx) {
                errorColor = 'red';
            }
            else if (currentSizeIdx < this.optimizedConductorSizeIdx) {
                errorColor = 'red';
            }
            this.conductorSizeError = errorColor;
            if(this.typeOfInterconnection=='TAP' && this.tableHeader =='AC DISCONNECT TO INTERCONNECTION' && this.circuitConductorSize == 6) {
                this.conductorSizeError = 'none';
            }
        },
        updateInverterData() {
            if (this.tableHeader === 'INVERTER TO LOAD CENTRE'
            || this.tableHeader === 'COMBINER BOX TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'COMBINER BOX TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION'
            || this.tableHeader === 'COMBINER BOX TO AC DISCONNECT'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO AC DISCONNECT'
            || this.tableHeader === 'INVERTER TO INTERCONNECTION'
            || this.tableHeader === 'LOAD CENTRE TO INTERCONNECTION') {
                this.totalInverters.a = this.noOfInverters;
            }
            else if (this.tableHeader === 'LOAD CENTRE TO PRODUCTION METER'
            || this.tableHeader === 'LOAD CENTRE TO AC DISCONNECT'
            || this.tableHeader === 'PRODUCTION METER TO AC DISCONNECT'
            || this.tableHeader === 'AC DISCONNECT TO INTERCONNECTION') {
                this.totalInverters.b = this.noOfInverters;
            }
            this.$emit('update:totalInverters', this.totalInverters);
        },
        resetData() {
            console.log("inside calculationTable in reset method");
            this.noOfInverters = '';
            this.conductors = '';
            this.circuitConductorSize = 10;
            if(this.typeOfInterconnection=='TAP' && this.tableHeader =='AC DISCONNECT TO INTERCONNECTION')
                this.circuitConductorSize=6;    
            this.maxMicroInvertersInOneString = '';
            this.optimizedConductorSizeIdx = 25;
        },
        callToEmitConductor(){
            this.$emit('conductor-from-table',this.conductors, Number(this.tableNo));
        },
        callToEmitMaxMicro(){
            this.$emit('max-micro-from-table', this.maxMicroInvertersInOneString, Number(this.tableNo));
        },
        callToEmitTagId(){
            this.$emit('tag-id-from-table',this.tagId,Number(this.tableNo))
        },
    },
};
</script>
<style type="text/css" scoped>
* {
    box-sizing: border-box;
    font-size: 11px;
}
input{
    font-size: 12px;
}

.header1 {
    min-height: 12px;
    max-height: 12px;
    height: 100px;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}

.el-col {
    border: 1px solid #000000;
    width: 50%;
}

.tableBorder {
    padding: 0vw;
    display: table;
    width: 100%;

    text-transform:uppercase;
}

.row-container {
    display: flex;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    height: 26px;
    min-height: 26px;
    max-height: 60px;
    flex-direction: row;
}
.row-container .col {
    min-width: 50%;
    max-width: 50%;
    width: 50%;
    padding: 0 10px 0 10px;
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    display: flex;
}

.row-container .error {
    min-width: 100%;
    max-width: 100%;
    width: 100%;
    padding: 0 10px 0 10px;
    height: 70%;
    min-height: 70%;
    max-height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.row-container .col.left {
    align-items: center;

    min-width: 80%;
}
.row-container .col.right {
    align-items: center;
    justify-content: left;

    min-width: 20%;
}

.row-container .col > .tableEditValue {
    width: 100%;
    min-width: 100%;
    text-align: center;
}

.row-container .col > .numberInput {
    margin-left: 0%;
}
.calculatorOutput {

    margin-left: 40%;
}
.row-container .col > .tableEditValue:hover  {
    border: 1px solid rgb(20, 144, 160);
    cursor: pointer;
}

.row-dropdown-input{
 
 height:18px !important;
 min-height: 18px !important;

}

.printModeTrue{
    margin-left: 50%;
}

.toReduceHeight{
    height: 18px !important;
}

/* .inputRed{
    color: red;
} */
</style>

