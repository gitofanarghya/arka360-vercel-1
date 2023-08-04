<template>
  <div class="reportLoaded" :class="isPuppeteer ? 'puppeteer_classes' : 'media_queries'">
    <!-- TATA 1st page -->
    <div class="page next_page">
      <div style="position: absolute; top: 5%; width: 90%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <img
            src="https://tatalogo.s3-us-west-2.amazonaws.com/Tata+Power+White+Logo.png"
            style="height: 50px; margin-left: 20px"
          />
          <div style="color: white">{{dataFromAPI.date}}</div>
        </div>
      </div>

      <div
        style="background-color: #005da4; height: 420px; padding: 160px 20px 0"
      >
        <div style="color: #f0f0f0; font-size: 24px">
          Detailed Technical Proposal
        </div>
        <div style="color: #f0f0f0; font-size: 40px">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"])}} kWp</div>
        <div style="color: #83b01b; font-size: 40px">Solar Power Plant</div>
      </div>
      <div style="position: relative">
        <img
          src="./img/frontPageTata.png"
          style="width: 100%; height: 250px; position: absolute; top: -100px"
        />
      </div>
      <div
        style="
          display: flex;
          justify-content: space-around;
          margin: 150px 20px 0;
        "
      >
        <div style="width: 50%">
          <div class="blueLight">Customer Name</div>
          <div class="timeSmall">
            (hereinafter referred to as the “customer”)
          </div>
          <div
            style="
              color: #83b01b;
              font-size: 25px;
              margin-bottom: 2px;
              line-height: 25px;
            "
          >{{ clientNameComputed }}</div>
          <div class="blueLight">Description</div>
          <div class="timeSmall">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"])}} kWp
            <div>Solar Plant for {{ clientNameComputed }}</div>
          </div>
          <div class="blueLight">Location</div>
          <div class="timeSmall">{{ dataFromAPI.project_head.address }}<br>({{ dataFromAPI.project_head.latitude }} , {{ dataFromAPI.project_head.longitude}})</div>
        </div>
        <div>
          <div>
            <div class="blueLight">Customer Contact Person</div>
            <div class="timeSmall">{{ dataFromAPI.project_head.name }}</div>
            <div class="timeSmall">{{ dataFromAPI.project_head.client_contact_number }}</div>
          </div>
          <div class="blueLight">TPSSL Point of Contact</div>
          <div class="timeSmall">{{dataFromAPI.project_head.project_creator_name}}</div>
          <div class="timeSmall">{{dataFromAPI.project_head.project_creator_phone_number}}</div>
          <div class="blueLight">3D Model of Site</div>
          <div class="timeSmall">
            <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" style="color: #404040; text-decoration: none">
              Click here to see in 3D
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <!-- TATA 1st page end -->

    <!-- TATA 2nd page -->
    <div class="page next_page">
      <img src="./img/tataPage2.png" class="fullPageImage" />
    </div>
    <!-- TATA 2nd end -->

    <!-- TATA 3rd page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/1.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 3rd end -->

    <!-- TATA 4th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/2.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 4th end -->

    <!-- TATA 5th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/3.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 5th end -->

    <!-- TATA 6th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/4.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 6th end -->

    <!-- TATA 7th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/5.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 7th end -->

    <!-- TATA 8th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/6.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 8th end -->

    <!-- TATA 9th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/7.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 9th end -->

    <!-- TATA 10th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/8.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 10th end -->

    <!-- TATA 11th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/9.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 11th end -->

    <!-- TATA 12th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/10.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 12th end -->

    <!-- TATA 13th page -->
    <div class="page next_page">
      <img
        src="https://tata-report-asset.s3.ap-south-1.amazonaws.com/11.png"
        class="fullPageImage"
      />
    </div>
    <!-- TATA 13th end -->

    <div class="page next_page pagePadding">
      <div style="position: absolute; top: 5%; width: 90%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <img
            src="https://tatalogo.s3-us-west-2.amazonaws.com/TPS+Logo+%5BPrint%5D.jpg"
            style="height: 30px"
          />
          <div class="blueLight">Technical Proposal</div>
        </div>
      </div>

      <div
        style="
          width: 19px;
          height: 8px;
          background-color: #83b01b;
          position: relative;
          top: 16px;
          left: -20px;
        "
      ></div>
      <div style="font-size: 18px; color: #005da4; margin: 0 0 2px 0">
        2.2-Technical Details – Project specific
      </div>
      <div class="greenHeadings">2.2.1 Site Layout</div>
      <div style="display: flex; align-items: flex-end">
        <div style="border: solid 6px #d1e7f2">
          <a href="">
            <!-- <img src="" style="width: 225px; height: 210px" /> -->
            <figure class="figure"  style="width: 225px; height: 210px">
                <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" v-loading="!dataFromAPI.detailed_layout">
                  <img class="loadingImages" :src="dataFromAPI.detailed_layout" alt="Pannel"/> 
                </router-link>
            </figure>
          </a>
        </div>
        <div style="margin: 0px 10px">
          <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" style="color: #383737; text-decoration: underline">
            Click on the image to view in 3D
          </router-link>
        </div>
      </div>
      <div style="display: flex; margin: 10px 0 0 0">
        <div style="width: 100%">
          <div class="greenHeadings">2.2.2 System Metrics</div>
          <div style="display: flex">
            <div style="width: 33%">
              <div class="blueBold">Annual Production</div>
              <div class="metricValues">{{convertedWithComaskWh(dataFromAPI.system_metrics["Annual Production"])}} x 1000 kWh</div>
              <!-- <div class="blueLight">x 1000 kWh (Units)</div> -->
            </div>
            <div style="width: 33%">
              <div class="blueBold">Performance Ratio</div>
              <div class="metricValues">{{dataFromAPI.system_metrics["Performance Ratio"]}}</div>
            </div>
            <div style="width: 33%">
              <div class="blueBold">Specific Generation</div>
              <div class="metricValues">{{dataFromAPI.system_metrics["Specific Generation (kWh/kWp/year)"]}}</div>
              <div class="blueLight">kWh/kWp/year</div>
            </div>
          </div>
          <div style="display: flex; margin: 10px 0">
            <div style="width: 33%">
              <div class="blueLight">Module DC Nameplate</div>
              <div class="metricValuesLight">{{dataFromAPI.system_metrics["Module DC Nameplate"]}}</div>
            </div>
            <div style="width: 33%">
              <div class="blueLight">AC Nameplate</div>
              <div class="metricValuesLight">{{acNameplate}}</div>
            </div>
            <div style="width: 33%">
              <div class="blueLight">Weather Dataset</div>
              <div class="metricValuesLight">{{dataFromAPI.system_metrics["Weather Dataset"]}}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: flex-end">
        <div>
          <div class="greenHeadings">2.2.3 Monthly Production</div>
          <div
            class="monthlyProductionLeftBlock primaryColorBackground"
            style="height: 230px"
          >
            <div class="monthlyProductionChartWrapper blueBold">
                <div class="chartDiv">
                  <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels"/> -->
                  <!-- <span class="yUnit">kWh</span> -->
                  <div class="chart">
                    <web-proposal-bar-chart-production 
                    :productionData="productionData"  
                    :productionDataLabels="productionDataLabels" 
                    :reportTemplate="reportTemplate"
                    :countryCode="dataFromAPI.country_code" />
                  </div>
                </div>
            </div>
          </div>
        </div>
        <div class="blueLight" style="margin: 0 0 0 16px">
          <div style="font-size: 10px;">Expected average generation of the system</div>
          <div style=" font-size: 10px; margin: 0 0 10px 0">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Average Monthly Production"]) }} kWh/month</div>
          <div style="font-size: 10px;">Yearly degradation rate</div>
          <div style="font-size: 10px;">{{dataFromAPI.system_metrics["Degradation Rate"]}}%/year</div>
        </div>
      </div>
      <div
        style="
          position: absolute;
          height: 23px;
          width: 79px;
          display: flex;
          justify-content: flex-end;
          bottom: 0;
          left: 0;
          background-image: url(https://tata-report-asset.s3.ap-south-1.amazonaws.com/bottom_green_strip.png);
        "
      >
        <span
          style="
            font-size: 15px;
            color: white;
            margin-right: 10px;
            font-weight: 100;
            bottom: 0;
          "
        >
          10</span
        >
      </div>
    </div>

    <div class="page next_page pagePadding">
      <div style="position: absolute; top: 5%; width: 90%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <img
            src="https://tatalogo.s3-us-west-2.amazonaws.com/TPS+Logo+%5BPrint%5D.jpg"
            style="height: 30px"
          />
          <div class="blueLight">Technical Proposal</div>
        </div>
      </div>
      <div class="greenHeadings">2.2.4 Shadow Analysis</div>
      <div style="display: flex; justify-content: space-between">
        <div>
          <div class="timeSmall">June 21 | 9:00 AM</div>
          <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image">
            <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image" style="width: 210px; height: 185px" />
          </div>
        </div>
        <div class="rightMarginImage">
          <div class="timeSmall">June 21 | 5:00 PM</div>
          <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image">
            <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image" style="width: 210px; height: 185px" />
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between">
        <div>
          <div class="timeSmall">December 22 | 9:00 AM</div>
          <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image">
            <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image" style="width: 210px; height: 185px" />
          </div>
        </div>
        <div class="rightMarginImage">
          <div class="timeSmall">December 22 | 5:00 PM</div>
          <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image">
            <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image" style="width: 210px; height: 185px" />
          </div>
        </div>
      </div>
      <div class="timeSmall" style="margin: 5px 0">
        <span style="font-weight: bold">Conclusion:</span>
        Modules are shadow free for
        <span style="font-weight: bold">{{ calcSolarTime(dataFromAPI.system_metrics["Shading Loss"]) }}%</span>
        of solar time throughout the year.
      </div>
      <div class="greenHeadings">2.2.5 Irradiance Map and Solar Access</div>
      <div style="display: flex; justify-content: space-between">
        <img :src="dataFromAPI.heat_map" style="width: 210px; height: 185px" />
        <img
          :src="dataFromAPI.solar_access_image"
          style="width: 210px; height: 185px"
          class="rightMarginImage"
        />
      </div>
      <div
        style="
          position: absolute;
          height: 23px;
          width: 79px;
          display: flex;
          justify-content: flex-end;
          bottom: 0;
          left: 0;
          background-image: url(https://tata-report-asset.s3.ap-south-1.amazonaws.com/bottom_green_strip.png);
        "
      >
        <span
          style="
            font-size: 15px;
            color: white;
            margin-right: 10px;
            font-weight: 100;
            bottom: 0;
          "
        >
          11</span
        >
      </div>
    </div>

    <div class="page pagePadding">
      <div style="position: absolute; top: 5%; width: 90%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <img
            src="https://tatalogo.s3-us-west-2.amazonaws.com/TPS+Logo+%5BPrint%5D.jpg"
            style="height: 30px"
          />
          <div class="blueLight">Technical Proposal</div>
        </div>
      </div>
      <div class="greenHeadings">2.2.6 Impact on Environment</div>
      <div class="timeSmall">
        You are contributing to solve Earth's biggest problem - Global Warming.
      </div>
      <div style="display: flex; margin: 20px 0">
        <div style="width: 33%">
          <div class="blueBoldSmallFont">Carbon Dioxide Offset</div>
          <div class="blueBold">{{dataFromAPI.green_impact_data.co2_offset}}</div>
          <div>metric tons</div>
        </div>
        <div style="width: 37%">
          <div class="blueBoldSmallFont">Equivalent Acres of Forest</div>
          <div class="blueBold">{{dataFromAPI.green_impact_data.acres_of_forest}}</div>
          <div>acres/year</div>
        </div>
        <div style="width: 33%">
          <div class="blueBoldSmallFont">Coal Burn Avoided</div>
          <div class="blueBold">{{dataFromAPI.green_impact_data.coal_burn_avoided}}</div>
          <div>metric tons</div>
        </div>
      </div>
      <div style="display: flex">
        <div style="width: 50%">
          <div class="blueLight">Equivalent Number of Trees Planted</div>
          <div>{{dataFromAPI.green_impact_data.trees}} trees</div>
        </div>
        <div style="width: 50%">
          <div class="blueLight">Petrol Consumption Avoided</div>
          <div>{{dataFromAPI.green_impact_data.gasoline_consumed}} litres</div>
        </div>
      </div>
      <div style="display: flex; margin: 20px 0">
        <div>
          <div class="blueLight">Equivalent Kilometers Driven</div>
          <div>{{dataFromAPI.green_impact_data.kilometers_driven}} kms</div>
        </div>
      </div>
      <div
        style="
          position: absolute;
          height: 23px;
          width: 79px;
          display: flex;
          justify-content: flex-end;
          bottom: 0;
          left: 0;
          background-image: url(https://tata-report-asset.s3.ap-south-1.amazonaws.com/bottom_green_strip.png);
        "
      >
        <span
          style="
            font-size: 15px;
            color: white;
            margin-right: 10px;
            font-weight: 100;
            bottom: 0;
          "
        >
          12</span
        >
      </div>
    </div>

    <div class="page pagePadding">
      <div style="position: absolute; top: 5%; width: 90%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <img
            src="https://tatalogo.s3-us-west-2.amazonaws.com/TPS+Logo+%5BPrint%5D.jpg"
            style="height: 30px"
          />
          <div class="blueLight">Technical Proposal</div>
        </div>
      </div>
      <div class="greenHeadings">2.2.7 Estimated Savings</div>
      <div class="timeSmallES">
        The estimated savings using solar for the next 25 years along with Total
        Savings, Payback Period and IRR
      </div>
      <div style="display: flex">
        <div style="width: 33%">
          <div class="blueBold">Total Savings</div>
          <div class="metricValues">₹{{dataFromAPI.financial_data.total_savings}}</div>
        </div>
        <div style="width: 33%">
          <div class="blueBold">Payback Period</div>
          <div class="metricValues">
            {{dataFromAPI.financial_data.payback.years}}<span class="subscriptMonthYear"> yrs. </span>
            {{dataFromAPI.financial_data.payback.months}}<span class="subscriptMonthYear"> mos. </span>
          </div>
        </div>
        <div style="width: 33%">
          <div class="blueBold">Internal Rate of Return</div>
          <div class="metricValues">{{
                    parseFloat(dataFromAPI.financial_data.irr).toFixed(2) >= 0
                      ? parseFloat(dataFromAPI.financial_data.irr).toFixed(2) + "%"
                      : "-"
                  }}</div>
        </div>
      </div>
      <div style="display: flex; margin-top: 4px;">
        <div style="width: 33%">
          <div class="blueLight">Price</div>
          <div class="metricValuesLight" v-if="dataFromAPI.financial_data.price_per_watt !== null">
            {{ convertedWithComas(dataFromAPI.financial_data.price_per_watt) }} {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}/W
          </div>
          <div class="metricValuesLight" v-if="dataFromAPI.financial_data.absolute_price !== null">
            {{ convertedWithComas(dataFromAPI.financial_data.absolute_price) }} {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}
          </div>
          <div class="metricValuesLight" v-if="dataFromAPI.financial_data.price_per_kw !== null">
            {{ convertedWithComas(dataFromAPI.financial_data.price_per_kw) }} {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}/kW
          </div>
        </div>
        <div style="width: 33%">
          <div class="blueLight">Tax</div>
          <div class="metricValuesLight">{{dataFromAPI.financial_data.tax}}%</div>
        </div>
        <div style="width: 33%">
          <div class="blueLight">Expected Life Years</div>
          <div class="metricValuesLight">{{dataFromAPI.financial_data.expected_life_years}} Years</div>
        </div>
      </div>
        <div style="display: flex; flex-direction: column">
          
            <div style="margin: 10px 0px 4px 20px; font-size: 12px;">{{currencySymbolNameMap[dataFromAPI.country.currency_code]}}</div>
            <div class="estimatedSavingsDiv">
              <web-proposal-bar-chart-estimated-savings 
                :savingsData="dataFromAPI.financial_data.cumulative_savings" 
                :savingsDataLabels="savingsDataLabelsYearly" 
                :currencyCode="dataFromAPI.country.currency_code"
                :reportTemplate="reportTemplate"
                :key="estSavingGraphKey"
                :updatedData="updatedData" />
          </div>
          <!-- <div style="font-size: 15px; text-align: center; margin-left: 80px;">Estimated Savings</div> -->
          <!-- <div>Estimated Savings</div> -->
        </div>
      <div class="greenHeadings">2.2.8 Cost of not going solar</div>
      <div class="lossesChartWrapper" style="height: 345px; background-color: #005482;">
        <!-- <canvas id="with_without_solar_chart"></canvas>           -->
        <div style="margin-bottom: 4px; font-size: 15px; margin-left: 20px; color: white;">{{currencySymbolNameMap[dataFromAPI.country.currency_code]}}</div>
        <div class="graph_area_withOrWithoutSolar">
          <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
          <web-proposal-multi-bar-chart 
              :estimatedUtilityBillWithSolarData="billWithSolar" 
              :estimatedUtilityBillWithoutSolarData="billWithoutSolar" 
              :estimatedUtilityBillDataLabels="savingsDataLabelsYearly"
              :currencyCode="dataFromAPI.country.currency_code" 
              :reportTemplate="reportTemplate" 
              :updatedData="updatedData"
              :key="notGoingSolarkey"/>
          <div
            class="indicates"
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 5px;
            "
          >
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 20px;
              "
            >
              <!-- <span class="color color_orange"></span> -->
              <span class="color whiteColorBackground"></span>
              <span class="whiteFont">Bill with Solar</span>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <!-- <span class="color color_gray"></span> -->
              <span class="color tertiaryColorBackground"></span>
              <span class="whiteFont">Bill without Solar</span>
            </div>
          </div>
        </div>
      </div>
      <div
        style="
          position: absolute;
          height: 23px;
          width: 79px;
          display: flex;
          justify-content: flex-end;
          bottom: 0;
          left: 0;
          background-image: url(https://tata-report-asset.s3.ap-south-1.amazonaws.com/bottom_green_strip.png);
        "
      >
        <span
          style="
            font-size: 15px;
            color: white;
            margin-right: 10px;
            font-weight: 100;
            bottom: 0;
          "
        >
          13</span
        >
      </div>
    </div>
    <!-- TATA 17th page end-->
    <!-- TATA 18th page start-->

    <!-- TATA 18th page end-->
    <div id="bomPageMain">
      <div class="page pagePadding bomSection">
        <div style="position: absolute; top: 5%; width: 90%" id="bomHeaderId">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <img
              src="https://tatalogo.s3-us-west-2.amazonaws.com/TPS+Logo+%5BPrint%5D.jpg"
              style="height: 30px"
            />
            <div class="blueLight">Technical Proposal</div>
          </div>
        </div>
        <div class="greenHeadings contentContainer">2.2.9 Bill of Materials</div>
        <div class="tableContainerBOM">
          <table style="text-align: left" class="table table-sm">
            <thead id="headBOM">
              <tr class="thead-light">
                <th v-for="(heading, index) in dataFromAPI.components.headers" :key="index">{{heading}}</th>
  
              </tr>
            </thead>
            <tbody class="allBillValues" id="allBillValuesId">
              <tr v-for="(row, rowIndex) in computedComponents" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
         id="footerId"
          style="
            position: absolute;
            height: 23px;
            width: 79px;
            display: flex;
            justify-content: flex-end;
            bottom: 0;
            left: 0;
            background-image: url(https://tata-report-asset.s3.ap-south-1.amazonaws.com/bottom_green_strip.png);
          "
        >
          <span
            id="pageNo"
            class="spanPage"
            style="
              font-size: 15px;
              color: white;
              margin-right: 10px;
              font-weight: 100;
              bottom: 0;
            "
          >
            14</span
          > 
        </div>
      </div>
    </div> 
    <!-- TATA 19th page -->
    <div class="page next_page">
      <img src="./img/tataPage18.png" class="fullPageImage" />
    </div>
    <!-- TATA 19th end -->
  </div>
</template>

<script>
import WebProposalBarChartProduction from "@/components/ui/charts/commonCharts/webProposalBarChartProduction.vue";
import webProposalBarChartEstimatedSavings from "@/components/ui/charts/commonCharts/webProposalBarChartEstimatedSavings.vue";
import webProposalMultiBarChart from "@/components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
import { formatNumberWithCommas } from '@/utils.js'
import currencySymbolNameMap from '../../currency-symbol-name-map';

export default {

  name: 'App',

    components: {
    WebProposalBarChartProduction,
    webProposalBarChartEstimatedSavings,
    webProposalMultiBarChart,
  },

  data() {
    return {
      referenceId : this.dataFromAPI.reference_id,
      estSavingGraphKey: 0,
      lossesGraphKey: 0,
      notGoingSolarkey: 0,
      reportTemplate: 'reportTata',
      productionDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      savingsDataLabelsYearly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }
  },

    nonReactiveData() {
    return {
        currencySymbolNameMap,
    }
  },

  props: {
    dataFromAPI: {
      type: Object
    },
    pages: {
      type: Array,
    }, 
    pagesNew: {
      type: Array,
    },
    updatedData:{
      type: Object,
    },
    isPuppeteer: {
      type: Boolean,
    },
  },

  mounted() {
    var pageNumber = 2;
    var orignalPageNo = 14;

    function cloneIt(sectionName, sectionClass, secHeaderId, pageName, containerClass, wrapperId, wrapperClass, isPuppet) {

      // Cloning the entire div and adding the section class to it
      let cloneIt = document.createElement("div");
      cloneIt.classList.add(sectionClass);
      cloneIt.classList.add('page');
      cloneIt.classList.add('pagePadding');
      if(isPuppet) {
        cloneIt.setAttribute("style", "margin-bottom:0px !important;");
      }

      cloneIt.id = sectionName + "cloneIt" + pageNumber;

      // Creating header clone and appending it
      let header = document.getElementById(secHeaderId);
      let headerClone = header.cloneNode(true);
      headerClone.id = sectionName + "cloneIt" + pageNumber;
      cloneIt.appendChild(headerClone);

      // Creating heading clone for OUR TEAM
      let contentClone = document.createElement("div");
      contentClone.classList.add("contentContainer");
      contentClone.id = sectionName + "contentClone" + pageNumber;  
      cloneIt.appendChild(contentClone);



      // Creating footer clone and appending it
      let footer = document.getElementById("footerId");
      let footerClone = footer.cloneNode(true);
      orignalPageNo++;
      let pageNoClone = footerClone.getElementsByClassName("spanPage")[0];
      pageNoClone.innerText = orignalPageNo;
      footerClone.id = sectionName + "footerClone" + pageNumber;
      cloneIt.appendChild(footerClone);


      // Now we have cloneIt, contentClone, headerClone, secHeaderClone, footerClone and cloneIt is the whole clone which we made so far..
      // Lets add the Team members dynamically
      let containerClone = document.createElement("div");
      containerClone.classList.add(containerClass);
      containerClone.id = sectionName + "containerClone" + pageNumber;
      contentClone.appendChild(containerClone);

      let insideDiv = document.createElement("div");
      insideDiv.id = wrapperId + pageNumber;
      containerClone.appendChild(insideDiv);

      // Now we append the page next to the previous Our Team Page or FAQ page based on this check
      if (sectionName == 'bom') {
          let bomPageMain = document.getElementById("bomPageMain");
          bomPageMain.appendChild(cloneIt);
      }
      pageNumber++;
      return insideDiv;
    }

    
    function cloneComponents(isPuppet) {
        let availableHeight = 600;
        let ceo = document.getElementsByClassName("allBillValues");
        let noOfCEOs = ceo[0].childElementCount;
        let i = 0;
        let j = 0;
        while (noOfCEOs) {
            if (pageNumber == 2) {
                while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                    availableHeight -= ceo[0].children[i].clientHeight;
                    i++;
                    noOfCEOs--;
                }
                pageNumber++;
            }
            else {
                var newPage = pageNumber - 1;
                if (noOfCEOs) {
                    availableHeight = 600;
                    var newClone = null;
                    newClone = cloneIt("bom", "bomSection", "bomHeaderId", "sysDetails", "tableContainerBOM", "sysDetails", "sysDetailsId", isPuppet);
                    let newComponentTable = document.createElement("table");
                    newComponentTable.id = "customersSDS2" + newPage;
                    newComponentTable.classList.add("table");
                    newComponentTable.classList.add("table-sm");
                    newClone.appendChild(newComponentTable);
                    let tableHead = document.getElementById("headBOM");
                    tableHead.classList.add("table-sm");
                    let newTableHead = tableHead.cloneNode(true);
                    newComponentTable.appendChild(newTableHead);
                    let newTableBody = document.createElement("tbody");
                    newTableBody.classList.add("allBillValues");
                    newTableBody.id = "allBillValues" + newPage;
                    newComponentTable.appendChild(newTableBody);
                    while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                        availableHeight -= ceo[0].children[i].clientHeight;
                        newTableBody.appendChild(ceo[0].children[i]);
                        noOfCEOs--;
                    }
                  }
             }
         }
        pageNumber = 2;
     }
    var isPuppet = this.isPuppeteer;
    cloneComponents(isPuppet);
  

  },

  computed: {

    clientNameComputed(){
      return this.dataFromAPI.project_head.client_name || this.dataFromAPI.project_head.name;
    },

    computedComponents(){
      if(this.dataFromAPI.components.values.length) {
        let output = this.dataFromAPI.components.values.map(arr => {
        const lastValue = arr[arr.length - 1];
        if (typeof lastValue === "string" && lastValue.trim().split(" ").length >= 2) {
          arr[arr.length - 1] = lastValue.split(" ").slice(0, 2).join(" ");
          }
          return arr;
        });
      return output;
      }
      return [];
      },

    productionData() {
      // let mainArray = this.dataFromAPI.monthly_table.values;
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      mainArray.pop();
      let finalArray = [];
      for (let item in mainArray) {
	      finalArray.push(mainArray[item][5]);
      }

      let lastArray = finalArray.map(str => {
        return parseFloat(str.replace(/,/g, ''));
      })
      return lastArray;
    },
    acNameplate() {
      let data = this.dataFromAPI.system_metrics["AC Nameplate"];
      let final = data.split(',');
      let acNameplate = final[0];
      return acNameplate;
    },
    billWithSolar() {
      return this.dataFromAPI.financial_data.bill_with_solar.slice(0, 10)
    },
    billWithoutSolar() {
      return this.dataFromAPI.financial_data.bill_without_solar.slice(0, 10)
    }
  },

  methods: {
    UOMValue(componentName, componentQuantity) {
      return componentName == "Premium Structure" ? "Set" : (componentQuantity == 1 ? "No." : "Nos.")
    },
    convertedWithComas(value){
      return formatNumberWithCommas(value, this.dataFromAPI.country.id === 91)
    },
    convertedWithComaskWh(value){
      if (typeof value === 'string'){
        return parseFloat(value.replace(/,/g, '')).toLocaleString("en-US")
      }
      else{
        return parseFloat(value).toLocaleString("en-US")
      }
    },
    calcSolarTime(shadingLoss) {
      let absLoss = Math.abs(shadingLoss)
      return 100 - absLoss;
    },
  },

    watch:{
    updatedData:{
      handler(val){
        this.estSavingGraphKey++;
        this.lossesGraphKey++
        this.notGoingSolarkey++;
        // this.updateReportParameters();
      }
    },
  },
}
</script>

<style scoped>

.table th, .table td {
    padding: 0.75rem;
    vertical-align: top;
    border-top: 1px solid #eceeef;
}

.chartDiv {
  /* background-color: white; */
  height: 100%;
  background-color: #005482;
  /* position: relative; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding-top: 10px; */
  /* padding-bottom: 4px; */
  /* min-width: 600px; */
  /* padding: 10px; */
}
.chart {
   /* background: yellow; */
   width: 320px;

}

.chart #bar-chart{
   /* background: cyan; */
   width: 100%;

}

.yUnit {
    align-self: flex-start;
    margin-left: 12px;
    /* margin-top: 40px; */
    /* margin-bottom: 4px; */
    /* width: 10px; */
    /* height: 22px; */
    font-size: 12px;
    font-weight: bold;
    /* font-stretch: normal; */
    /* font-style: normal; */
    /* line-height: 1.38; */
    /* letter-spacing: normal; */
    /* text-align: right; */
    color: #fff;
}
.lossesChartWrapper {
  /* height: 100%; */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.graph_area_withOrWithoutSolar {
    width: 535px;
   margin: 0px auto;
}
.whiteColorBackground {
  background-color: #ffffff;
}

.whiteFont {
  color: #ffffff;
}

.color {
  width: 22px;
  height: 22px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 6px;
}
.tertiaryColorBackground {
    background-color: var(--tertiary) !important;
}
.page {
  margin: auto;
  margin-bottom: 24px;
  background: #fff;
  width: 595px;
  height: 842px;
  position: relative;
  padding: 0px;
}

@media print {
  .next_page {
    -webkit-column-break-before: always;
    break-before: always;
  }
}

.fullPageImage {
  width: 100%;
  height: 100%;
}

.greenHeadings {
  color: #83b01b;
  opacity: 1;
  font-size: 15px;
  margin: 10px 0 10px 0;
}

.monthlyProductionLeftBlock {
  display: inline-block;
  width: 340px;
}

.monthlyProductionChartWrapper {
  height: 100%;
  display: -webkit-box;
  display: block;
}

.pagePadding {
  padding: 80px 20px 0px 20px;
}

.blueBold {
  color: #004471;
  font-size: 12px;
  font-weight: bold;
}

.blueLight {
  color: #004471;
  font-size: 11px;
}

.metricValues {
  color: #161615;
  font-size: 13px;
  margin-top: 4px;
}

.metricValuesLight {
  color: #464545;
  font-size: 17px;
}

.timeSmall {
  color: #404040;
  font-size: 12px;
  margin: 3px 0;
}

.timeSmallES {
  color: #404040;
  font-size: 11px;
  margin-bottom: 8px;
}

.rightMarginImage {
  margin: 0 40px 0 0;
}

.subscriptMonthYear {
  font-size: 14px;
  padding: 0 3px;
}

.blueBoldSmallFont {
  color: #004471;
  font-size: 15px;
  font-weight: bold;
}

.primaryColor {
  color: #005482;
}

.secondaryColor {
  color: #0086ae;
}

.primaryColorBackground {
  background-color: #005482;
}

.secondaryColorBackground {
  background-color: #0086ae;
}

.tertiaryColorBackground {
  background-color: #00c2c7;
}

.table .thead-light th {
  color: #005482;
}

.table-sm th {
  color: #005482;
}

.table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #eceeef;
}

.table thead th {
  border-bottom: 2px solid #eceeef;
}

.table tbody + tbody {
  border-top: 2px solid #eceeef;
}

</style>

<style lang="scss"  scoped>

.puppeteer_classes {
  .page {
    margin-bottom: 0px;
  }
}
</style>

<style>

.table th, .table td {
    padding: 0.75rem;
    vertical-align: top;
    border-top: 1px solid #eceeef;
}

.page {
  margin: auto;
  margin-bottom: 24px;
  background: #fff;
  width: 595px;
  height: 842px;
  position: relative;
  padding: 0px;
}

.pagePadding {
  padding: 80px 20px 0px 20px;
}


.table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
}

</style>