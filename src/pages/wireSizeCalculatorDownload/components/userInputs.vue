<template>
    <div class="main-container" id="userInputs">
        <el-row class="tableBorder">
            <!-- <button @click="checkSelectedPanel">check panel inf in console</button>
             <button @click="checkSelectedInverter">check inverter inf in console</button> -->
            <el-header>MODULE SPECIFICATIONS

               <!-- <infinite-scroll-dropdown-panel
               data-html2canvas-ignore="true"
                    :panel.sync="selectedPanel"
                    :areFavoritesRequired="false"
                    @event-to-save-panel-obj="saveSelectedPanel"/> -->

            </el-header>
            <el-row class="row-container">
                <el-col class="col left"><span>MANUFACTURER NAME</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.manufactureName"
                        class="tableEditValue classAfterPrint1 "
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-solar', solarModuleSpecs)"
                        @change="$emit('update-solar', solarModuleSpecs)">

                        <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;"  v-else>{{solarModuleSpecs.manufactureName}}</span> -->
                        <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;" >{{solarModuleSpecs.manufactureName}}</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>MODEL NAME</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.modelName"
                        class="tableEditValue"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                        <span class="printModeTrue" v-else>{{solarModuleSpecs.modelName}}</span> -->
                        <span class="printModeTrue">{{solarModuleSpecs.modelName}}</span>
                        
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>V<sub>mp</sub></span></el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.vmp"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                    <span class="printModeTrue" v-else>{{solarModuleSpecs.vmp}}</span> -->
                    <span class="printModeTrue">{{solarModuleSpecs.vmp}}</span>
                    <span style="padding: 5px">V</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>I<sub>mp</sub></span></el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.imp"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                    <span class="printModeTrue" v-else>{{solarModuleSpecs.imp}}</span> -->
                    <span class="printModeTrue">{{solarModuleSpecs.imp}}</span>
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>V<sub>oc</sub></span></el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.voc"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                    <span class="printModeTrue" v-else>{{solarModuleSpecs.voc}}</span>     -->
                    <span class="printModeTrue">{{solarModuleSpecs.voc}}</span>
                    <span style="padding: 5px">V</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>I<sub>sc</sub></span></el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.isc"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                        <span class="printModeTrue" v-else>{{solarModuleSpecs.isc}}</span>    -->
                    <span class="printModeTrue">{{solarModuleSpecs.isc}}</span> 
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>MODULE DIMENSIONS</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="solarModuleSpecs.dimensions"
                        placeholder="L x W x D"
                        class="tableEditValue classAfterPrint1"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-solar', solarModuleSpecs)">
                    <span class="printModeTrue" style="margin-left: 10px !important;" v-else>{{solarModuleSpecs.dimensions}}</span>  -->
                    <span class="printModeTrue" style="margin-left: 10px !important;">{{solarModuleSpecs.dimensions}}</span>
                </el-col>
            </el-row>
        </el-row>
        <el-row class="tableBorder" style = "text-transform:uppercase;">
            <el-header>INVERTER 1  SPECIFICATIONS
                 <!-- <infinite-scroll-dropdown-inverter
                    data-html2canvas-ignore="true"
                    :inverter.sync="selectedInverter"
                    :are-favorites-required="false"
                    :inverter-type = "inverterSpecs[0].type"
                    :current-index=0
                    @event-to-save-inverter-obj="saveSelectedInverter"
                /> -->
            </el-header>
            <el-row data-html2canvas-ignore="true" class="row-container row-dropdown-input" >
                <el-col class="col left"><span>Inverter Type</span></el-col>
                <el-col class="col right">
                    <!-- <el-select
                        v-if="! printMode"
                        v-model="inverterSpecs[0].type"
                        class="tableEditValue numberInput"
                        style="width: 105%; minWidth: 105%;"
                        placeholder="Select"
                        size="mini"
                        @keyup="$emit('update-inverter', inverterSpecs)"
                        @click="$emit('update-inverter', inverterSpecs)"
                        @change="$emit('update-inverter', inverterSpecs)">
                        
                        <el-option
                            v-for="inverter in inverterOptions"
                            :key="inverter.value"
                            :label="inverter.label"
                            :value="inverter.value"
                            :disabled="inverter.disabled"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{inverterSpecs[0].type}}</span> -->
                    <span class="printModeTrue">{{inverterSpecs[0].type}}</span> 
                </el-col>
            </el-row>
            <!-- <el-row
                data-html2canvas-ignore="true"
                v-show="inverterSpecs[0].type === 'String Inverter'"
                class="row-container">
                <el-col class="col left">
                    <span class="inputRed">With Optimizer</span>
                    
                </el-col>
                <el-col class="col right">
                    <el-checkbox
                        v-model="inverterSpecs[0].optimizer"
                        class="tableEditValue numberInput"
                        style="border: none"
                         @change="$emit('update-inverter', inverterSpecs)"
                        @keyup="$emit('update-inverter', inverterSpecs)"/>
                </el-col>
            </el-row> -->
            <el-row class="row-container">
                <el-col class="col left"><span>Manufacturer Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].manufactureName"
                        class="tableEditValue classAfterPrint1"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;" v-else>{{inverterSpecs[0].manufactureName}}</span>  -->
                    <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;">{{inverterSpecs[0].manufactureName}}</span>
                    
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Model Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].modelName"
                        class="tableEditValue classAfterPrint1"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" style="font-size:9px !important;" v-else>{{inverterSpecs[0].modelName}}</span>  -->
                    <span class="printModeTrue" style="font-size:9px !important;">{{inverterSpecs[0].modelName}}</span>
                    
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Number of Inverter</span>
                    <span v-else>Number of Inverter</span>
                </el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="!printMode"
                        v-model="inverterSpecs[0].no_of_inverters"
                        type="number"
                        value="inverterSpecs[0].no_of_inverters"
                        @keyup=" pushObjectsIntoInverter(inverterSpecs[0].no_of_inverters);
                         $emit('update-inverter', inverterSpecs); $emit('update-no-of-inverter',inverterSpecs[0].no_of_inverters); "
                       
                        class="tableEditValue"
                        style="width: 100%; height: 100%; border: hidden;">
                    <span class="printModeTrue" style="margin-left:20px !important;" v-else>{{inverterSpecs[0].no_of_inverters}}</span>      -->
                    <span class="printModeTrue" style="margin-left:20px !important;">{{inverterSpecs[0].no_of_inverters}}</span>  
                </el-col>
            </el-row>
            <el-row class="row-container row-dropdown-input" style="height:35px !important; min-height:35px !important;">
                <el-col class="col left">
                    <span v-if="! printMode" class="inputRed" >Operating Voltage</span>
                    <span v-else style="font-size:10px !important;">Operating Voltage</span>
                    <!-- <span>Operating Voltage</span> -->
                    </el-col>
                <el-col class="col right">
                        
                    <!-- <el-select 
                        v-if="! printMode"
                        v-model="inverterSpecs[0].maxOutputVoltage"
                        class="tableEditValue numberInput"
                        size="mini"
                            @change="$emit('update-inverter', inverterSpecs)"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <el-option
                        v-for="voltageType in voltageTypeOption"
                        :key="voltageType.value"
                        :label="voltageType.label"
                        :value="voltageType.value"/>
                    </el-select>
                    <span class="printModeTrue" style="margin-left:10px !important;" v-else>{{inverterSpecs[0].maxOutputVoltage}}</span>  -->
                     <span class="printModeTrue" style="margin-left:10px !important;">{{inverterSpecs[0].maxOutputVoltage}}</span>
                    <span style="padding: 5px">V</span>
                </el-col>
            </el-row>
            
            <el-row class="row-container" style="height:24px !important; min-height:24px !important;">
                <el-col class="col left">
                    <span v-if="! printMode">Nominal Output Current</span>
                    <span v-else style="font-size:10px !important;">Nominal Output Current</span>
                    </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].maxOutputCurrent"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                     <span class="printModeTrue" style="margin-left:10px !important;" v-else>{{inverterSpecs[0].maxOutputCurrent}}</span>      -->
                     <span class="printModeTrue" style="margin-left:10px !important;">{{inverterSpecs[0].maxOutputCurrent}}</span>     
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
        </el-row>


        <div v-if="parseInt(inverterSpecs[0].no_of_inverters)>1 &&  inverterSpecs.length>1 " >
        <!-- <div v-for="i in parseInt(inverterSpecs[0].no_of_inverters)-1" :key="i"> -->
        <div v-for="i in parseInt(inverterSpecs.length)-1" :key="i">

    
         <el-row v-show="differentTypeInverter" class="tableBorder" style = "text-transform:uppercase;">
            <el-header>INVERTER {{i+1}} SPECIFICATIONS
                 <!-- <infinite-scroll-dropdown-inverter
                    data-html2canvas-ignore="true"
                    :inverter.sync="selectedInverter"
                    :are-favorites-required="false"
                    :current-index="i"
                    :inverter-type ="inverterSpecs[i].type"
                    @event-to-save-inverter-obj="saveSelectedInverter"
                /> -->
            </el-header>
            <!-- <el-row data-html2canvas-ignore="true" class="row-container row-dropdown-input" >
                <el-col class="col left"><span>Inverter Type</span></el-col>
                <el-col class="col right">
                    <el-select
                        v-if="! printMode"
                        v-model="inverterSpecs[i].type"
                        class="tableEditValue numberInput "
                        style="width: 105%; minWidth: 105%;"
                        placeholder="Select"
                        size="mini"
                        @keyup="$emit('update-inverter', inverterSpecs)"
                        @click="$emit('update-inverter', inverterSpecs)"
                        @change="$emit('update-inverter', inverterSpecs)">
                        
                        <el-option
                            v-for="inverter in inverterOptions"
                            :key="inverter.value"
                            :label="inverter.label"
                            :value="inverter.value"
                            :disabled="inverter.disabled"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{inverterSpecs[i].type}}</span>
                </el-col>
            </el-row> -->


            <!-- <el-row
                data-html2canvas-ignore="true"
                v-show="inverterSpecs.type === 'String Inverter'"
                class="row-container">
                <el-col class="col left">
                    <span>With Optimizer</span>
                </el-col>
                <el-col class="col right">
                    <el-checkbox
                        v-model="inverterSpecs.optimizer"
                        class="tableEditValue numberInput"
                        style="border: none"
                         @change="$emit('update-inverter', inverterSpecs)"
                        @keyup="$emit('update-inverter', inverterSpecs)"/>
                </el-col>
            </el-row> -->
            <el-row class="row-container">
                <el-col class="col left"><span>Manufacturer Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[i].manufactureName"
                        class="tableEditValue "
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;" v-else>{{inverterSpecs[i].manufactureName}}</span>  -->
                    <span class="printModeTrue" style="margin-left: 10px !important; font-size:9px !important;">{{inverterSpecs[i].manufactureName}}</span>
                    
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Model Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                       v-model="inverterSpecs[i].modelName"
                        class="tableEditValue"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" style="font-size:9px !important;" v-else>{{inverterSpecs[i].modelName}}</span>  -->
                    <span class="printModeTrue" style="font-size:9px !important;">{{inverterSpecs[i].modelName}}</span>
                </el-col>
            </el-row>
            <!-- <el-row class="row-container">
                <el-col class="col left"><span>Number of Inverter</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <input
                        v-if="!printMode"
                        v-model="inverterSpecs.no_of_inverters"
                        type="number"
                         @keyup="$emit('update-inverter', inverterSpecs)"
                        class="tableEditValue"
                        style="width: 100%; height: 100%; border: hidden;">
                    <span class="printModeTrue" style="margin-left:20px !important;" v-else>{{inverterSpecs.no_of_inverters}}</span>     
                </el-col>
            </el-row> -->
            <el-row class="row-container" style="height:35px !important; min-height:35px !important;">
                <el-col class="col left">
                    <span v-if="! printMode">Operating Voltage</span>
                    <span v-else style="font-size:10px !important;">Operating Voltage</span>
                    </el-col>
                <el-col class="col right">

                    <!-- <el-select 
                        v-if="! printMode"
                        v-model="inverterSpecs[i].maxOutputVoltage"
                        class="tableEditValue numberInput"
                        size="mini"
                        @change="$emit('update-inverter', inverterSpecs)"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <el-option
                        v-for="voltageType in voltageTypeOption"
                        :key="voltageType.value"
                        :label="voltageType.label"
                        :value="voltageType.value"/>
                    </el-select>
                    <span class="printModeTrue" style="margin-left:10px !important;" v-else>{{inverterSpecs[i].maxOutputVoltage}}</span>      -->
                    <span class="printModeTrue" style="margin-left:10px !important;">{{inverterSpecs[i].maxOutputVoltage}}</span>     
                    <span style="padding: 5px">V</span>
                </el-col>
            </el-row>
            <el-row class="row-container" style="height:24px !important; min-height:24px !important;">
                <el-col class="col left">
                    <span v-if="! printMode">Nominal Output Current</span>
                    <span v-else style="font-size:10px !important;">Nominal Output Current</span>
                    </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[i].maxOutputCurrent"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" style="margin-left:10px !important;" v-else>{{inverterSpecs[i].maxOutputCurrent}}</span>      -->
                    <span class="printModeTrue" style="margin-left:10px !important;">{{inverterSpecs[i].maxOutputCurrent}}</span>     
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
        </el-row>
        </div>
        </div>


        <el-row
            v-if="isOptimizerVisible"
            style = "text-transform:uppercase;"
            class="tableBorder">
            <el-header style="justify-content: space-between">
                OPTIMIZER SPECIFICATIONS

                        <!-- <el-select
                        data-html2canvas-ignore="true"
                        v-model="optimizerPanelMake"
                        placeholder="Select Optimizer"
                        name="optimizer"
                        size="medium"   
                        >
                        <el-option
                          v-for="(row,index) in optimizerList"
                           :key="index"
                           :value="row.optimizer.Make"
                           :label="row.optimizer.Make"
                        />
                        </el-select> -->
                </el-header>
            <el-row class="row-container">
                <el-col class="col left"><span>Manufacturer Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].optimizerSpecs.manufactureName"
                        class="tableEditValue "
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" v-else>{{inverterSpecs[0].optimizerSpecs.manufactureName}}</span>  -->
                    <span class="printModeTrue">{{inverterSpecs[0].optimizerSpecs.manufactureName}}</span> 
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Model Name</span></el-col>
                <el-col
                    class="col right"
                    style="padding: 0">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].optimizerSpecs.modelName"
                        class="tableEditValue"
                        style="width: 100%; height: 100%; border: hidden;"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" v-else>{{inverterSpecs[0].optimizerSpecs.modelName}}</span>  -->
                    <span class="printModeTrue">{{inverterSpecs[0].optimizerSpecs.modelName}}</span> 
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Max DC Current</span></el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="inverterSpecs[0].optimizerSpecs.maxDCCurrent"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight"
                        placeholder="0"
                        @keyup="$emit('update-inverter', inverterSpecs)">
                    <span class="printModeTrue" v-else>{{inverterSpecs[0].optimizerSpecs.maxDCCurrent}}</span>  -->
                    <span class="printModeTrue">{{inverterSpecs[0].optimizerSpecs.maxDCCurrent}}</span> 
                    <span style="padding: 5px">A</span>
                </el-col>
            </el-row>
        </el-row>
        <el-row style = "text-transform:uppercase;" class="tableBorder">
            <el-header style="justify-content: start">SITE SPECIFIC DATA</el-header>
            <el-row class="row-container row-dropdown-input">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Weather Station</span>
                    <span v-else>Weather Station</span>
                </el-col>
                <el-col
                    class="col right"
                    style="padding: 0; overflow:auto;">
                    <!-- <input
                        v-if="! printMode"
                        v-model="siteData.weatherStation"
                        class="tableEditValue "
                        style="width: 100%; height: 100%; border: hidden;"
                       @keyup="$emit('update-site', siteData)">
                    <span class="printModeTrue" v-else>{{siteData.weatherStation}}</span>  -->

                    <span class="printModeTrue">{{(siteData.weatherStation).length >70 ? `${(siteData.weatherStation).substring(0,70)}...` : (siteData.weatherStation)  }}</span> 
                    
                </el-col>
            </el-row>


            <el-row class="row-container" style="height:24px !important; min-height:24px !important;">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Record Low Temp</span>
                    <span v-else>Record Low Temp</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="siteData.recordLowTemp"
                        type="number"
                        class="tableEditValue numberInput toReduceHeight "
                        placeholder="0"
                        @keyup="$emit('update-site', siteData)">
                    <span class="printModeTrue" v-else>{{siteData.recordLowTemp}}</span>  -->
                    <span class="printModeTrue">{{Number(siteData.recordLowTemp).toFixed(2)}}</span> 
                    <span style="padding: 5px">℃</span>
                </el-col>
            </el-row>
            <el-row class="row-container" style="height:34px !important; max-height:none !important">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Ambient Temperature (High Temp 2%)</span>
                    <span v-else>Ambient Temperature (High Temp 2%)</span>
                </el-col>
                <el-col class="col right">
                    <!-- <input
                        v-if="! printMode"
                        v-model="siteData.ambientTemp"
                        type="number"
                        class="tableEditValue numberInput "
                        placeholder="0"
                        @keyup="$emit('update-site', siteData)">
                    <span class="printModeTrue" v-else>{{siteData.ambientTemp}}</span>      -->
                    <span class="printModeTrue">{{Number(siteData.ambientTemp).toFixed(2)}}</span>     
                    <span style="padding: 5px">℃</span>
                </el-col>
            </el-row>
            <el-row class="row-container row-dropdown-input">
                <el-col class="col left">
                    <span class="inputRed" v-if="! printMode">Conduit Height</span>
                    <span v-else>Conduit Height</span>
                </el-col>
                <el-col class="col right">
                    <!-- <el-select 
                        v-if="! printMode"
                        v-model="siteData.conduitHeight"
                        class="tableEditValue numberInput "
                        placeholder="0 in"
                        size="mini"
                        @change="$emit('update-site', siteData)"
                        @keyup="$emit('update-site', siteData)">
                        <el-option
                            v-for="height in conduitHeightOption"
                            :key="height.value"
                            :label="height.label"
                            :value="height.value"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{siteData.conduitHeight}}</span> -->
                    <span class="printModeTrue">{{siteData.conduitHeight}}</span>
                </el-col>
            </el-row>
            <el-row class="row-container">
                <el-col class="col left"><span>Roof Top Temperature</span></el-col>
                <el-col class="col right">
                    <span  v-if="! printMode" style="padding: 5px; margin-left: 4%;">{{ roofTopTemp }}</span>
                     <span  v-else style="padding: 5px; margin-left: 8px;">{{ roofTopTemp }}</span>
                    <span style="padding: 5px">℃</span>
                </el-col>
            </el-row>
            <el-row class="row-container row-dropdown-input">
                <el-col class="col left"><span>Temp Correction Factor On Roof</span></el-col>
                <el-col class="col right">
                    <!-- <el-select 
                        v-if="! printMode"
                        v-model="siteData.tempCorrectionFactorDC"
                        class="tableEditValue numberInput "
                        placeholder="90 ⁰C"
                        size="mini"
                         @change="$emit('update-site', siteData)"
                        @keyup="$emit('update-site', siteData)">
                        <el-option
                            v-for="tempOption in tempCorrectionOptions"
                            :key="tempOption.value"
                            :label="tempOption.label"
                            :value="tempOption.value"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{siteData.tempCorrectionFactorDC}}</span> -->
                    <span class="printModeTrue">{{siteData.tempCorrectionFactorDC}}</span>
                </el-col>
            </el-row>
            <!-- <el-row data-html2canvas-ignore="true" class="row-container row-dropdown-input">
                <el-col class="col left"><span>Type of Conductor DC</span></el-col>
                <el-col class="col right">
                    <el-select 
                        v-if="! printMode"
                        v-model="siteData.conductorTypeDC"
                        class="tableEditValue numberInput "
                        placeholder="Copper"
                        size="mini"
                        @change="$emit('update-site', siteData)"
                        @keyup="$emit('update-site', siteData)">
                        <el-option
                            v-for="conductor in conductorMaterialOptions"
                            :key="conductor.value"
                            :label="conductor.label"
                            :value="conductor.value"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{siteData.conductorTypeDC}}</span>
                </el-col>
            </el-row> -->
            <el-row class="row-container row-dropdown-input">
                <el-col class="col left"><span>Temp Correction Factor Off roof</span></el-col>
                <el-col class="col right">
                    <!-- <el-select
                        v-if="! printMode"
                        v-model="siteData.tempCorrectionFactorAC"
                        class="tableEditValue numberInput "
                        placeholder="75 ⁰C"
                        size="mini"
                         @change="$emit('update-site', siteData)"
                        @keyup="$emit('update-site', siteData)">
                        <el-option
                            v-for="tempOption in tempCorrectionOptions"
                            :key="tempOption.value"
                            :label="tempOption.label"
                            :value="tempOption.value"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{siteData.tempCorrectionFactorAC}}</span> -->
                    <span class="printModeTrue">{{siteData.tempCorrectionFactorAC}}</span>
                </el-col>
            </el-row>
            <!-- <el-row data-html2canvas-ignore="true" class="row-container row-dropdown-input">
                <el-col class="col left"><span>Type of Conductor AC</span></el-col>
                <el-col class="col right">
                    <el-select
                        v-if="! printMode"
                        v-model="siteData.conductorTypeAC"
                        class="tableEditValue numberInput "
                        placeholder="Copper"
                        size="mini"
                         @change="$emit('update-site', siteData)"
                        @keyup="$emit('update-site', siteData)">
                        <el-option
                            v-for="conductor in conductorMaterialOptions"
                            :key="conductor.value"
                            :label="conductor.label"
                            :value="conductor.value"/>
                    </el-select>
                    <span class="printModeTrue" v-else>{{siteData.conductorTypeAC}}</span>
                </el-col>
            </el-row> -->
        </el-row>
    </div>
</template>

<script>
import { AMBIENT_TEMP_ADJUSTMENT_TABLE } from '../referenceTables';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanelForWireSize.vue';
import infiniteScrollDropdownInverter from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverterForWireSize.vue';
import axios from 'axios';
import API from '@/services/api/';
export default {

    components: {
        infiniteScrollDropdownPanel,
        infiniteScrollDropdownInverter
    },
    props: {
        initialSolarModuleSpecs: {
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
        calculationBasis: '',
        initialInverterSpecs: {
            type: Array,
            default() {
                return [{
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
            },
        },
        initialSiteData: {
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
                    tempCorrectionFactorAC: 75,
                    conductorTypeAC: 'Copper',
                    tempCoeff: 0,
                };
            },
        },
        initialOptimizerList:{
               type: Object,
               default(){
                  return {};
               },
        },

        reset: {
            type: Number,
            default() {
                return 0;
            },
        },
        printMode :{
            type : Boolean,
            default(){
                return false;
            }
        },
        differentTypeInverter: {
               type : Boolean,
               default()  {
                return false;
            }
        },
    },
    data() {
        return {
            selectedPanel: {},
            selectedInverter: {},
            optimizerList :this.initialOptimizerList,
            optimizer: {},
            optimizerPanelMake:"",
            designId: this.$route.params.designId,
            patchMode : false,
            solarModuleSpecs : this.initialSolarModuleSpecs,
            inverterSpecs   : this.initialInverterSpecs,    // Now it is an array
            siteData       : this.initialSiteData,
            afterPushingObjectsIntoInverter :false,
            inverterOptions: [
                {
                    value: 'String Inverter',
                    label: 'String Inverter',
                },
                {
                    value: 'Micro Inverter',
                    label: 'Micro Inverter',
                },
                {
                    value: 'Central Inverter',
                    label: 'Central Inverter',
                    disabled: true,
                },
            ],
            conduitHeightOption : [
                {
                    value: 0,
                    label: '0 in'
                },
                { 
                    value: 0.874,
                    label: 'less than 7/8 in'
                },
                {
                    value: 0.876,
                    label: 'more than 7/8 in'
                }
            ],
            tempCorrectionOptions: [
                {
                    value: 60,
                    label: '60 ℃',
                },
                {
                    value: 75,
                    label: '75 ℃',
                },
                {
                    value: 90,
                    label: '90 ℃',
                },
            ],
            conductorMaterialOptions: [
                {
                    value: 'Copper',
                    label: 'Copper',
                },
                {
                    value: 'Aluminium',
                    label: 'Aluminium',
                },
            ],
            voltageTypeOption :[
                {
                    value: 208,
                    label: 208,
                },
                {
                    value: 240,
                    label: 240,
                },
            ]
        };
    },
    computed: {
        isOptimizerVisible() {
            return this.inverterSpecs[0].optimizer && this.inverterSpecs[0].type === 'String Inverter';
        },
        roofTopTemp() {
            const ambientTemp = parseInt(this.siteData.ambientTemp, 10) || 0;
            const ambientTempAdj = AMBIENT_TEMP_ADJUSTMENT_TABLE(this.siteData.conduitHeight) || 0;
            return (ambientTemp + ambientTempAdj);
        },
    },

    mounted(){
       console.log("inside mounted", this.initialInverterSpecs);
       this.initializeUserInputs();
    },
    methods: {

        initializeUserInputs(){
            this.solarModuleSpecs = JSON.parse(JSON.stringify(this.initialSolarModuleSpecs));
            this.inverterSpecs =    JSON.parse(JSON.stringify(this.initialInverterSpecs));
            this.siteData      =    JSON.parse(JSON.stringify(this.initialSiteData));
            this.optimizerList  = JSON.parse(JSON.stringify(this.initialOptimizerList));
            this.initializeConduitHeightOptions();
        },

        initializeConduitHeightOptions(){
            if (this.calculationBasis != "NEC-2014") {
            this.conduitHeightOption = [
                {
                    value: 0,
                    label: '0 in'
                },
                { 
                    value: 0.874,
                    label: 'less than 7/8 in'
                },
                {
                    value: 0.876,
                    label: 'more than 7/8 in'
                }
            ]
            } else {
                this.conduitHeightOption = [
                {
                    value: 0,
                    label: '0 in'
                },
                { 
                    value: 0.5,
                    label: '0.5 in'
                },
                {
                    value: 3.5,
                    label: '3.5 in'
                },
                { 
                    value: 12,
                    label: '12 in'
                }
                ]
            }
        },

        pushObjectsIntoInverter(noOfInverters){
            //   this.inverterSpecs = [this.inverterSpecs[0]];
            if(noOfInverters===0 || noOfInverters==='' )
            return;

            let N = this.inverterSpecs.length;
            N--;
            while(N--)
            {
                this.inverterSpecs.pop();
            }
            let N2 = this.inverterSpecs.length;
            let obj1 = {
                    type: 'String Inverter',
                    manufactureName: '',
                    modelName: '',
                    maxOutputVoltage: 0,
                    maxOutputCurrent: 0,
                 };

            for(let j=1; j<=  noOfInverters-1; j++)
            {
                this.inverterSpecs.push(obj1);
            }    
            // console.log("while pushing object into inverter array ",this.inverterSpecs);
            this.afterPushingObjectsIntoInverter = true;
            let N1 = this.inverterSpecs.length;
        },

         saveSelectedInverter(selectedInv,index){
                console.log("event triggered when inv selected",selectedInv,index);
                // this.inverterSpecs[0].manufactureName = this.selectedInverter.Manufacturer;
                // this.inverterSpecs[0].modelName = this.selectedInverter.Make;
                // this.inverterSpecs[0].maxOutputCurrent = this.selectedInverter.max_ac_current;

                this.inverterSpecs[index].manufactureName = this.selectedInverter.Manufacturer;
                this.inverterSpecs[index].modelName = this.selectedInverter.Make;
                this.inverterSpecs[index].maxOutputCurrent = this.selectedInverter.max_ac_current;
                this.$emit('update-inverter', this.inverterSpecs);
                if(index===0){
                    this.callApiForOptimizer();
                }
                // this.inverterSpecs.maxOutputVoltage = this.selectedInverter.nominal_ac_voltage;
                // if(this.selectedInverter.inverter_type==null || this.selectedInverter.inverter_type=='String')
                // this.inverterSpecs.type = 'String Inverter';
                // else
                // this.inverterSpecs.type= 'Micro Inverter';
         },

       async callApiForOptimizer(){
            const requestBody = {"moduleID":this.selectedPanel.id,"inverterID":this.selectedInverter.id};
            const resp = await axios.post(`api/designs/25324/get_optimizer_list/`, requestBody);
            console.log("exiting call Api for optimizer",resp);
            //    this.optimizerList = resp.data.optimizerList;
               this.optimizerList = [
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P320",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P340",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P370",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P400",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P401",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P405",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"485P",
                                           max_output_I: 15,
                                       }
                                   },
                                   {
                                       optimizer: {
                                           Manufacturer :"Solaredge",
                                           Make:"P505",
                                           max_output_I: 15,
                                       }
                                   }

               ]
               this.optimizerStatus = resp.data.status;
               this.optimizer = this.optimizerList[Object.keys(this.optimizerList)[0]];

               console.log("first optimizer",this.optimizer);

               this.inverterSpecs[0].optimizerSpecs.manufactureName = this.optimizer.optimizer.Manufacturer;
               this.inverterSpecs[0].optimizerSpecs.modelName = this.optimizer.optimizer.Make;
               this.inverterSpecs[0].optimizerSpecs.maxDCCurrent = this.optimizer.optimizer.max_output_I;

               this.$emit('update-inverter', this.inverterSpecs);
               this.$emit('update-optimizer-list',this.optimizerList);
         },

         saveSelectedPanel(selectedPan){
             console.log("event triggered when module selected",this.selectedPanel);

              this.solarModuleSpecs.manufactureName = this.selectedPanel.company_name;
              this.solarModuleSpecs.modelName =  this.selectedPanel.model;
              this.solarModuleSpecs.vmp = this.selectedPanel.vmpp;
              this.solarModuleSpecs.imp = this.selectedPanel.impp;
              this.solarModuleSpecs.voc = this.selectedPanel.voc;
              this.solarModuleSpecs.isc =  this.selectedPanel.isc;

              this.selectedPanel.length = this.selectedPanel.length/25.4;
              this.selectedPanel.length = this.selectedPanel.length.toFixed(2);
              this.selectedPanel.width = this.selectedPanel.width/25.4;
              this.selectedPanel.width = this.selectedPanel.width.toFixed(2);
              this.selectedPanel.thickness = this.selectedPanel.thickness/25.4;
              this.selectedPanel.thickness = this.selectedPanel.thickness.toFixed(2);

              this.solarModuleSpecs.dimensions = `${this.selectedPanel.length}"L x ${this.selectedPanel.width}"W x ${this.selectedPanel.thickness}"D`;
               
                this.$emit('update-solar', this.solarModuleSpecs);


                if(this.selectedInverter){
                     this.callApiForOptimizer();
                }
               

         },

           checkSelectedPanel(){
                console.log("selected module is", this.selectedPanel);
           },

           checkSelectedInverter(){
                console.log("selected inverter is", this.selectedInverter);
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
            this.inverterSpecs = [{
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
                }
                
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
            this.optimizerList ={};
            // this.wireSizes = {
            //     wireSizeATOJ: 10,
            //     wireSizeITOA: 10,
            //     wireSizeJTOC: 10,
            //     wireSizeCTOA: 10,
            // };
            // this.reset += 1;
        },




        isNumber(event) {
            const evt = event || window.event;
            const charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                evt.preventDefault();
            }
            else {
                return true;
            }
            return false;
        },
        changeconduitHeightOption() {
            this.siteData.conduitHeight = 0;
            if (this.calculationBasis != "NEC-2014") {
            this.conduitHeightOption = [
                {
                    value: 0,
                    label: '0 in'
                },
                { 
                    value: 0.874,
                    label: 'less than 7/8 in'
                },
                {
                    value: 0.876,
                    label: 'more than 7/8 in'
                }
            ]
            } else {
                this.conduitHeightOption = [
                {
                    value: 0,
                    label: '0 in'
                },
                { 
                    value: 0.5,
                    label: '0.5 in'
                },
                {
                    value: 3.5,
                    label: '3.5 in'
                },
                { 
                    value: 12,
                    label: '12 in'
                }
                ]
            }
        }
    },
    watch: {
        calculationBasis: {
            deep: true,
            handler() {
               this.changeconduitHeightOption()
            }

        },
        optimizerPanelMake() {
            for (const x in this.optimizerList) {
                if (this.optimizerList[x].optimizer.Make === this.optimizerPanelMake) {
                    this.optimizer = this.optimizerList[x];
                    break;
                }
            }
            this.inverterSpecs[0].optimizerSpecs.manufactureName = this.optimizer.optimizer.Manufacturer;
            this.inverterSpecs[0].optimizerSpecs.modelName = this.optimizer.optimizer.Make;
            this.inverterSpecs[0].optimizerSpecs.maxDCCurrent = this.optimizer.optimizer.max_output_I;
            this.$emit('update-inverter', this.inverterSpecs);
        },

        reset() {
                this.resetData();
        },
        initialSolarModuleSpecs:{
            deep: true,
            immediate: true,
            handler(val){
                this.solarModuleSpecs = JSON.parse(JSON.stringify(this.initialSolarModuleSpecs));
            }
        },
        initialInverterSpecs:{
            deep:true,
            immediate:true,
            handler(val){
                this.inverterSpecs = JSON.parse(JSON.stringify(this.initialInverterSpecs));
            }
        },
        initialSiteData:{
            deep:true,
            immediate:true,
            handler(val){
                this.siteData = JSON.parse(JSON.stringify(this.initialSiteData));
            }
        }

}
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

.el-header {
    min-height: 30px;
    max-height: 100px;
    height: 100px;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
}

.el-col {
    border: 1px solid #000000;
    width: 50%;
}

.tableBorder {
    padding: 0vw;
    display: table;
    width: 100%;
}

.row-container {
  display: flex;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  height: 17px;
  min-height: 17px;
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

.row-container .col.left {
    align-items: center;
}
.row-container .col.right {
    align-items: center;
    justify-content: left;

    min-width: 50%;
    width: 50%;
}

.row-container .col > .tableEditValue {
    width: 90%;
    min-width: 90%;
    text-align: center;
    
}

.row-container .col > .numberInput {
   /* margin-left: 30%; */
   margin-left: 0%;
    
}

.row-container .col > .tableEditValue:hover  {
    border: 1px solid rgb(20, 144, 160);
    cursor: pointer;
}

 .dropdown-input > .el-input--mini .el-input__inner {
    height: 20px !important;
    min-height: 20px !important;
}

.row-dropdown-input{
 
 height:35px !important;
 min-height: 35px !important;

}

.printModeTrue{
    margin-left: 10px;
}

.toReduceHeight{
    height: 18px !important;
}

/* .inputRed{
    color: red;
} */

@media print {
    .classAfterPrint1{
        margin-left: 10px !important;
        font-size:9px !important;
    }
    .classAfterPrint2{
        margin-left:20px !important; 
    }
    .classAfterPrint3{
        padding: 5px;
        margin-left: 8px;
    }
}
/* @media print{

.inputRed{
    color: black;
}

} */



</style>
