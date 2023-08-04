<template>
  <div id="app" class="reportLoaded" :class="isPuppeteer ? 'puppeteer_classes' : 'media_queries'">
        
    <main class="main" :class="[isActive ? 'portrait_controller' : '',  isPuppeteer ? 'pagePuppeteer' : '']"> <!-- add or remove class "portrait_controller" accordingly to required pages mode -->
      
      <section class="landing_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('title')">
        <!-- {{ dataFromAPI }} -->
        <div class="content_section">
          <div class="flex_box">
            <div class="left_area">
              <div class="image_area primaryColorBackground" v-loading="!dataFromAPI.detailed_layout">
                <figure class="figure"  >
                  <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" >
                    <img class="loadingImages" :src="dataFromAPI.detailed_layout" alt="Pannel" /> 
                  </router-link>
                </figure>
                <!-- 21/12/2021 -->
                <span class="pseudo_color secondaryColorBackground"></span>
                <!-- end -->
              </div>
            </div>
            <div class="right_area">
              <div class="index_logo">
                <img :src="dataFromAPI.organisation_data.logo" alt="Logo" />
              </div>
              <h1 style="word-wrap: break-word; -webkit-box-orient: vertical;
            -webkit-line-clamp: 2; overflow: hidden; display: -webkit-box;" v-html="projectNameFiltered(dataFromAPI.project_head.name)"></h1>
              <div class="sub_text">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"])}} kWp</div>
              <div class="address">
            <div style=" word-wrap: break-word; -webkit-box-orient: vertical;
            -webkit-line-clamp: 3; overflow: hidden; display: -webkit-box;">
              {{ dataFromAPI.project_head.address }}
            </div>
                ({{ parseFloat(dataFromAPI.project_head.latitude).toFixed(5) }} , {{ parseFloat(dataFromAPI.project_head.longitude).toFixed(5) }})
              </div>
              <div class="button_area">
                <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" >
                  <button class="btn">Click here for 3D Model</button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
            <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      <!-- <section class="about_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('about-us')">
        <div class="flex_box">
          <div class="left_section">
            <div class="content_section primaryColorBackground">
              <h2>About Us</h2>
              <p v-if="dataFromAPI.organisation_data.about_us">{{ dataFromAPI.organisation_data.about_us }}</p>
            </div>
          </div>
          <div class="right_section">
            <div class="about_logo"> 
              <img :src="dataFromAPI.organisation_data.logo" alt="Logo" />
            </div>
            <div class="content">
              <h4>Get in touch</h4>
              <ul class="touch_list">
                <li class="mail" v-if="dataFromAPI.organisation_data.email_id">
                  <span class="icon primaryColorBackground">
                    <img src="./assets/img/chat-left-text.svg" alt="Chat" />
                  </span>
                  <div class="text">
                    {{ dataFromAPI.organisation_data.email_id }}
                  </div>
                </li>
                <li class="phone" v-if="dataFromAPI.organisation_data.phone">
                  <span class="icon secondaryColorBackground">
                    <img src="./assets/img/phone.svg" alt="Phone" />
                  </span>
                  <div class="text">
                    {{ dataFromAPI.organisation_data.phone }}
                  </div>
                </li>
                <li class="web" v-if="dataFromAPI.organisation_data.website">
                  <span class="icon tertiaryColorBackground">
                    <img src="./assets/img/globe.svg" alt="Globe" />
                  </span>
                  <div class="text">
                    {{ dataFromAPI.organisation_data.website }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section> -->
    
      <div id="companyOverviewMain" v-show="pagesNew.includes('company-overview')">
        <section class="estimation_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''">
          <header class="main_header primaryColorBackground" id="headerIdCO">
            <div class="header_title">
              <h3>Company Overview</h3>
            </div>
            <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
              <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
              <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
            </div>
          </header>
          <div class="metrics_data common_inside">
            <div class="contentContCO">
              <p class="contentCO">{{ dataFromAPI.organisation_data.about_us }}</p>
            </div>
            <h4 class="headingCO" v-if="dataFromAPI.previous_project_details.previous_project_one_name ||
                                      dataFromAPI.previous_project_details.previous_project_two_name ||
                                      dataFromAPI.previous_project_details.previous_project_three_name">Previous Projects</h4>
            <div class="imgContainerCO">
              <div class="imgContCO" v-if="dataFromAPI.previous_project_details.previous_project_one_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_one_image" class="imgCO" />
                <div class="flexContCO">
                  <!-- <p class="imgContentCO"></p> -->
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_one_name }}
                  </p>
                </div>
              </div>
              <div class="imgContCO" v-if="dataFromAPI.previous_project_details.previous_project_two_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_two_image" class="imgCO" />
                <div class="flexContCO">
                  <!-- <p class="imgContentCO"></p> -->
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_two_name }}
                  </p>
                </div>
              </div>
              <div class="imgContCO" v-if="dataFromAPI.previous_project_details.previous_project_three_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_three_image" class="imgCO" />
                <div class="flexContCO">
                  <!-- <p class="imgContentCO"></p> -->
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_three_name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <footer class="footer">
            <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
            <div class="right">
              <div class="gen_text">
                <div>Generated on: </div>
                <div>{{ dateAndTime }} with</div>
              </div>
              <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
            </div>
          </footer>
        </section>
      </div>  

      <div id="ourTeamMain" v-show="pagesNew.includes('our-team') && teamMembersArray.length">
      <section class="estimation_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''">
        <header class="main_header primaryColorBackground" id="headerIdOT">
          <div class="header_title">
            <h3>Our Team</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          <div id="allCEOs" class="allCeos">
                <div class="ourTeamContOT" v-for="(member, index) in teamMembersArray" :key="index">
                  <img :src="member.image" class="imgOT" />
                  <div class="otContentOT">
                    <h4 class="nameOT">{{ member.name }}, {{ member.position }}</h4>
                    <p class="valueOT">
                      {{ member.description }}
                    </p>
                  </div>
                </div>
              </div>
        </div>
        <footer class="footer" id="footerId">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      </div>
      <section class="metrics_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('system-metrics')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>System Metrics</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_cards">
          <ul class="cards_list">
            <li>
              <div class="panel_card light_red">
                <div class="card_head primaryColorBackground">
                  <div class="icons">
                    <img src="./assets/img/production.svg" alt="Production" />
                  </div>
                  <h3>Annual Production</h3>
                </div>
                <div class="card_content">
                  <!-- <div class="value">{{ dataFromAPI.system_metrics["Annual Production"]}}</div> -->
                  <div class="value">{{ convertedWithComaskWh(annualProduction) }}</div>
                  <div class="subvalue">x 1000 kWh (Units)</div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_blue">
                <div class="card_head secondaryColorBackground">
                  <div class="icons">
                    <img src="./assets/img/bar-chart-line.svg" alt="Chart" />
                  </div>
                  <h3>Performance Ratio</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ (dataFromAPI.system_metrics["Performance Ratio"])}}</div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_gray">
                <div class="card_head tertiaryColorBackground">
                  <div class="icons">
                    <img src="./assets/img/calendar.svg" alt="Cable" />
                  </div>
                  <h3>Specific Generation</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Specific Generation (kWh/kWp/year)"])}}</div>
                  <div class="subvalue">kWh/kWp/year</div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="metrics_data module_content heightSysMet">
          <div class="detailed_info">
            <div class="info_inside">
              <ul class="info_list">
                <li>
                  <div class="info_inside_details primaryColorBackground">
                    <h5>Module DC Nameplate</h5>
                    <div class="value">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"]) }} kWp</div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details secondaryColorBackground">
                    <h5>AC Nameplate</h5>
                    <div class="value">{{ convertedWithComaskWh(acNameplate) }} kW</div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details tertiaryColorBackground">
                    <h5>DC-AC Ratio</h5>
                    <div class="value">{{ loadRatio }}</div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details primaryColorBackground">
                    <h5>Weather Dataset</h5>
                    <div class="value">{{ dataFromAPI.system_metrics["Weather Dataset"] }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <!-- -------------------------------------------------system pricing------------------------------->
      <div id="systemPricingMain" v-show="pagesNew.includes('system-pricing')">
      <section class="production_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''">
        <header class="main_header primaryColorBackground" id="headerIdPricing">
          <div class="header_title">
            <h3>System Pricing</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          <div class="containerSP">
            <div class="columnSP">
              <p class="labelSP">Base Price</p>
              <p class="valSP">{{  handleCurrencyFormate(parseFloat(dataFromAPI.base_price?.replace(/,/g, ''))) }}</p>
            </div>
            <div id="tableContainerSDSId">
              <div id="adderFullId" class="adderFullClass">
                <div class="columnSP" id="addonHeading">
                  <p class="labelSP">Add-ons</p>
                  <p class="valSP" id="addonValue">{{ handleCurrencyFormate(parseFloat(dataFromAPI.adders?.replace(/,/g, ''))) }}</p>
                </div>
                <div class="allAddons">
                  <div class="paddingColumnSP" v-for="adder in addersData" :key="adder.id">
                    <p class="labelSP" v-if="adder.adders_discounts__is_homeowner_facing === true">{{ adder.adders_discounts__name }}</p>
                    <p class="valSP" v-if="adder.adders_discounts__show_adder_total === true">{{ handleCurrencyFormate(adder.amount * adder.quantity) }}</p>
                  </div>
                </div>
            </div>
            <div id="discountFullId" class="discountFullClass">
            <div class="columnSP">
              <p class="labelSP">Discounts</p>
              <p class="valSP">  {{ handleCurrencyFormate(parseFloat(dataFromAPI.discounts.replace(/,/g, ""))) }}</p>
            </div>
            <div class="allDiscounts">
            <div class="paddingColumnSP" v-for="disc in discountsData" :key="disc.id">
              <p class="labelSP" v-if="disc.adders_discounts__is_homeowner_facing === true">{{ disc.adders_discounts__name }}</p>
              <p class="valSP">{{ handleCurrencyFormate(disc.amount * disc.quantity) }}</p>
            </div>
            </div>
            </div>
            <div id="elsePart">
            <div class="totalColumnSP">
              <p class="labelSPBlue">Total Payable Now (See Payment Schedule)</p>
              <p class="labelSPBlue">{{ handleCurrencyFormate(parseFloat(dataFromAPI.total_cost_before_incentive?.replace(/,/g, '')))}}</p>
            </div>
            <div class="columnSP">
              <p class="labelSP">Incentives</p>
              <p class="valSP">-{{ handleCurrencyFormate(parseFloat(dataFromAPI.total_insentive?.replace(/,/g, ''))) }}</p>
            </div>
            <div class="paddingColumnSP" v-for="insentives in dataFromAPI.insentives_data" :key="insentives.id">
              <p class="labelSP">{{ insentives.name }}</p>
              <p class="valSP">{{handleCurrencyFormate(insentives.tot_amount_contribution)}}</p>
            </div>
            <div class="totalLastColumnSP">
              <p class="labelSP">Effective Price after Incentives</p>
              <p class="valSP">{{ handleCurrencySymbol}}{{dataFromAPI.total_cost_after_adders_and_discounts_incentive}}</p>
            </div>
            </div>
          </div>
        </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
    </div>

      <!-- - ----------------------------------------Battery Storage------------------------------------->
    <div id="batteryMain" v-show="pagesNew.includes('battery-storage') && isBatteryAvailable">
      <section class="production_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''">
        <header class="main_header primaryColorBackground" id="headerIdBS">
          <div class="header_title">
            <h3>Battery Storage</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          <div class="iconsContBS">
            <div class="containerBS">
              <img src="../img/Group 1745.svg" class="thunderIcon" />
              <div class="tbcContainerBS">
                <p class="tbcContentBS">Total Battery Capacity</p>
                <h3 class="tbcValueBS">{{batteryData['total_battery_capacity'] ? batteryData['total_battery_capacity'] : '-'}} kWh</h3>
              </div>
            </div>
            <div class="containerBS">
              <img src="../img/Group 2686.svg" class="thunderIcon" />
              <div class="tbcContainerBS">
                <p class="tbcContentBS">Additional Saving from Battery</p>
                <h3 class="tbcValueBS">{{additionalSavingsPostBattery ? currencySymbolNameMap[dataFromAPI.country.currency_code] + additionalSavingsPostBattery : '-'}}</h3>
              </div>
          </div>
          </div>
                <p class="backupContentBS">In an outage, get a backup of</p>
                <div class="footerContBS">
                  <div class="boxOneBS boxOneColorBS primaryColorBackground">
                    <img src="../img/cloud (2).svg" class="cloudImgBS" />
                    <div class="BOContBS">
                      <div class="ftrIconsBS">
                        <p class="dAndHrsBS">{{batteryBackupOnStorageAndLoadText}}</p>
                      </div>
                      <p class="strgBS">on storage with critical load</p>
                    </div>
                  </div>
                  <div class="boxOneBS boxTwoColorBS secondaryColorBackground">
                    <img src="../img/Group 1746.svg" class="cloudImgBS" />
                    <div class="BOContBS">
                      <div class="ftrIconsBS">
                        <p class="dAndHrsBS">{{batteryBackupOnStorageAndSolarText}}</p>
                      </div>
                      <p class="strgBS">on storage only</p>
                    </div>
                  </div>
                  <div class="boxTwoBS boxThreeColorBS tertiaryColorBackground">
                    <img
                      src="../img/brightness-high (2).svg"
                      class="cloudImgBS"
                    />
                    <div class="BOContBS">
                      <div class="ftrIconsBS">
                        <p class="dAndHrsBS">{{batteryBackupOnStorageAndLoadText}}</p>
                      </div>
                      <p class="strgBS">on solar & storage</p>
                    </div>
                  </div>
                </div>

            
                      <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
                <table id="customersSDS" class="customersSDS2Class">
                  <thead id="headBattery">
                    <tr class="tableHeaderSDS">
                      <th class="tableHeaderWidthSDS oneHead">Battery Manufacturer</th>
                      <th class="tableHeaderWidthSDS twoHead">Model</th>
                      <th class="tableHeaderWidthSDS threeHead">Capacity</th>
                      <th class="tableHeaderWidthSDS fourHead">Quantity.</th>
                    </tr>
                  </thead>
                  <tbody id="allComponentValuesId" class="allBatteryValues">
                    <tr class="tablevalueSDS" v-for="(battery, index) in batteryData['batteries']" :key="index">
                      <td class="tablevalueWidthSDS firTbleBS">{{battery['name']}}</td>
                      <td class="tablevalueWidthSDS secTbleBS">
                        {{battery['model']}}
                      </td>
                      <td class="tablevalueWidthSDS thrTbleBS">
                        {{battery['capacity']}} kW
                      </td>
                      <td class="tablevalueWidthSDS frTbleBS">
                        {{battery['quantity']}}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div id="batterySavingsAnalysisChart">
          <div class="savings_graph" style="padding-top: 0px;">
            <div class="yUnit" style="margin-left: 35px; margin-top: 10px;">{{ this.currencyCode }}</div>
            <div class="title" style="margin-left: 20px; display: flex; justify-content: center; margin-top: -24px;">Estimated Utility Bill</div>
            <div class="graph_area">
                  <battery-saving-analysis-chart
                    :estimatedUtilityBillWithSolarData="estimatedUtilityBillWithSolarData" :estimatedUtilityBillWithoutSolarData="residualEnergyPostBatteryBill" :estimatedUtilityBillDataLabels="estimatedUtilityBillDataLabels"
                    :currencyCode="currencyCode" 
                    :updatedData="updatedData" 
                    :key="notGoingSolarkey"
                    :reportTemplate="reportTemplate" />
                    <ul class="indicates">
                      <li>
                        <span class="color color_orange"></span>
                        Bill with Solar only
                      </li>
                      <li>
                        <span class="color color_gray primaryColorBackground"></span>
                        Bill with Solar & Battery
                      </li>
                    </ul>
                    </div>
                  </div>
                </div>    
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
    </div>


      <section class="metrics_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('savings') && !isThisPageDisabled('savings')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Estimated Savings</h3>
            <p>The estimated savings using solar for the next 25 years along with Total Savings, Payback Period and IRR</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_cards">
          <ul class="cards_list">
            <li>
              <div class="panel_card light_red">
                <div class="card_head primaryColorBackground">
                  <h3>Total Savings</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ convertedWithComas(dataFromAPI.financial_data.total_savings) }} {{ this.currencyCode }}</div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_blue">
                <div class="card_head secondaryColorBackground">
                  <h3>Payback Period</h3>
                </div>
                <div class="card_content">
                  <div class="value">
                        {{ dataFromAPI.financial_data && dataFromAPI.financial_data.payback.years }}  
                        <span v-if="dataFromAPI.financial_data && dataFromAPI.financial_data.payback.years && dataFromAPI.financial_data.payback.years>1" >yrs.</span>
                        <span v-else> yr. </span>

                        {{ dataFromAPI.financial_data && dataFromAPI.financial_data.payback.months }} 
                        <span v-if=" dataFromAPI.financial_data && dataFromAPI.financial_data.payback.months && dataFromAPI.financial_data.payback.months>1" >mons.</span>
                        <span v-else>mon.</span>
                    
                    </div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_gray">
                <div class="card_head tertiaryColorBackground">
                  <h3>Internal Rate of Return</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ dataFromAPI.financial_data.irr }}%</div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="metrics_data module_content heightEstSav">
          <div class="detailed_info">
            <div class="info_inside">
              <ul class="info_list">
                <li>
                  <div class="info_inside_details primaryColorBackground">
                    <h5>Price</h5>
                    <div class="value" v-if="dataFromAPI.financial_data.price_per_watt !== null">
                      {{ convertedWithComas(dataFromAPI.financial_data.price_per_watt) }} {{ dataFromAPI.country.currency_code }}/W
                    </div>
                    <div class="value" v-if="dataFromAPI.financial_data.absolute_price !== null">
                      {{ convertedWithComas(dataFromAPI.financial_data.absolute_price) }} {{ dataFromAPI.country.currency_code }}
                    </div>
                    <div class="value" v-if="dataFromAPI.financial_data.price_per_kw !== null">
                      {{ convertedWithComas(dataFromAPI.financial_data.price_per_kw) }} {{ dataFromAPI.country.currency_code }}/kW
                    </div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details secondaryColorBackground">
                    <h5>Tax</h5>
                    <div class="value">
                      {{ dataFromAPI.financial_data.tax }}%
                    </div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details tertiaryColorBackground">
                    <h5>Year 1 Usage Offset</h5>
                    <div class="value">
                      {{ dataFromAPI.system_metrics['Year 1 Usage Offset'] }}%
                    </div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details secondaryColorBackground">
                    <h5>LCOE</h5>
                    <div class="value">
                      {{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.LCOE) }}/kWh
                    </div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details tertiaryColorBackground">
                    <h5>Expected Life Years</h5>
                    <div class="value">
                      {{ dataFromAPI.financial_data.expected_life_years }} Years
                    </div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details primaryColorBackground">
                    <h5>Incentives</h5>
                    <div class="value"  v-if="dataFromAPI.financial_data.subsidy_percentage !== null">
                      {{ currencySymbolNameMap[dataFromAPI.country.currency_code]}} {{ dataFromAPI.total_insentive }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <section class="estimation_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('savings') && !isThisPageDisabled('savings')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Estimated Savings</h3>
            <p>The estimated savings using solar for the next 25 years along with Total Savings, Payback Period and IRR</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          
          <div class="savings_graph savings_graph_savings">
            <div class="title">Estimated Savings</div>
            <div class="graph_area">
              <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
              <div class="yUnit" style="margin-left: 35px; margin-bottom: 10px;">{{ this.currencyCode }}</div>
              <div class="chart">
                <web-proposal-bar-chart-estimated-savings 
                :savingsData="savingsDataYearly" 
                :savingsDataLabels="savingsDataLabelsYearly" 
                :currencyCode="currencyCode"
                :key="estSavingGraphKey"
                :updatedData="updatedData"
                :reportTemplate="reportTemplate" />
              </div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>


      <!-- -----------------------------------------incentives------------------------>

      <section class="estimation_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="dataFromAPI.insentives_data && dataFromAPI.insentives_data.length">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Incentives</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          <div class="incentivesContainer" v-if="dataFromAPI.insentives_data.length > 0">
            <div class="incentivesDetails" v-for="(insentive_check, index) in dataFromAPI.insentives_data" :key="index">
              <h4 class="incentiveHeading">{{ insentive_check.name }}</h4>
              <p class="incentiveContent">{{ insentive_check.description }}</p>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

            <section class="component_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('components')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Components</h3>
            <p>Your installation uses latest technology in solar</p>
          </div>
          <div class="header_logo">
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="component_inside common_inside">
          <div class="row">
            <div v-for="(comp, ind) in modifiedComponentData" v-bind:key="'col-comp' + ind" class="col">
              <div class="component_items">
                <div class="icon secondaryColorBackground">
                  <img :src="comp.iconFile" alt="comp.comp" />
                </div>
                <div class="component_info">
                  <h5>{{comp.comp}}</h5>
                  <div v-for="(subComp, sInd) in comp.subComps" v-bind:key="'sComp' + sInd" class="detailed_text">
                    <span class="componentMake">{{subComp[0]}}</span><span style="font-weight: bold" v-if="subComp[1]"> - {{subComp[1]}} {{subComp[2]}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <section class="production_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('monthly-production')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Expected Annual Production</h3>
            <p>During the first year of operations, your system is expected to produce  {{ convertedWithComaskWh(dataFromAPI.system_metrics["Annual Production"])}} x 1000 kWh over the year</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside">
          <ul class="savings_item">
            <li>
              <div class="title">
                Expected average generation of the system
              </div>
              <div class="values">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Average Monthly Production"]) }} kWh/month</div>
            </li>
            <li>
              <div class="title">
                Yearly degradation rate
              </div>
              <div class="values">{{ dataFromAPI.system_metrics["Degradation Rate"] }}%/year</div>
            </li>
            
          </ul>
          <div class="savings_graph">
            <div class="title">kWh (Units)</div>
            <div class="graph_area">
              <!-- <img src="./assets/img/graph21.png" alt="Graph" /> -->
              <web-proposal-bar-chart-production 
              :productionData="productionData" 
              :productionDataLabels="productionDataLabels" 
              :reportTemplate="reportTemplate"
              :updatedData="updatedData"
              :key="avgMonthProdGraphKey" />
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <section class="production_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('monthly-savings') && !isThisPageDisabled('monthly-savings')">
        <header class="main_header primaryColorBackground" style="background-color: rgb(248, 214, 206);">
          <div class="header_title">
            <h3>Monthly Savings</h3>
            <p>Estimated savings for each month during the first year.</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside" style="padding-top: 24px;">
          <div class="savings_graph"  style="margin-top: 0px;">
            <div class="title" style="margin-left: 24px">{{ dataFromAPI.country.currency_code }}</div>
            <div class="graph_area ">
              <web-proposal-bar-chart-savings 
                :savingsData="savingsData" 
                :savingsDataLabels="savingsDataLabels"
                :currencyCode="currencyCode"
                :reportTemplate="reportTemplate"
                :updatedData="updatedData" 
                :key="monthlySavingsGraphKey" />
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <section class="table_info widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''"  v-if="pagesNew.includes('monthly-table')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Monthly Table</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="table_inside common_inside">
          <div>
            <table class="monthly_table">
              <thead class= "monthly_table_head">
                <tr>
                  <th>Months</th>
                  <th>
                    Direct<br /> Irradiance<br>
                    <span>(kWh/m2)</span>
                  </th>
                  <th>
                    Diffused<br /> Irradiance<br>
                    <span>(kWh/m2)</span>
                  </th>
                  <th>
                    Effective<br />Irradiance<br>
                    <span>(kWh/m2)</span>
                  </th>
                  <th>
                    DC<br/>Energy<br>
                    <span>(kWh)</span>
                  </th>
                  <th>
                    AC<br /> Energy<br>
                    <span>(kWh)</span>
                  </th>
                  <th>
                    Specific
                    <br> 
                    Generation
                  </th>
                  <th>
                    Performance
                    <br> 
                    Ratio
                  </th>
                </tr>
              </thead>
             
              <tbody class= "monthly_table_body">
                 
                <tr v-for="(data, index) in monthlyTableData" :key="index">
                  <td>{{data[0] }}</td>
                  <td>{{ convertedWithComaskWh(data[1]) }}</td>
                  <td>{{ convertedWithComaskWh(data[2]) }}</td>
                  <td>{{ convertedWithComaskWh(data[3]) }}</td>
                  <td>{{ convertedWithComaskWh(data[4]) }}</td>
                  <td>{{ convertedWithComaskWh(data[5]) }}</td>
                  <td>{{ convertedWithComaskWh(data[6]) }}</td>
                  <td>{{ convertedWithComaskWh(data[7]) }}</td>
                </tr>
        
              </tbody>
              <tfoot class="monthly_table_footer">
                <tr>
                  <td>{{ annualMonthlyTableData[0] }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[1]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[2]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[3]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[4]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[5]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[6]) }}</td>
                  <td>{{ convertedWithComaskWh(annualMonthlyTableData[7]) }}</td>                  
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
    <div id='fs'>
      <section class="table_info widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('field-segments')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Field Segments</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="table_inside common_inside">
          <div id="field_segment_table">
            <table class= "monthly_table">
              <thead class= "monthly_table_head">
                <tr>
                  <th>Name</th>
                  <th>
                    Orientation
                  </th>
                  <th>
                    Tilt
                  </th>
                  <th>
                    Azimuth
                  </th>
                  <th>
                    Row<br>Spacing
                  </th>
                  <th>Frame<br>Size</th>
                  <!-- <th>Solar Access</th> -->
                  <th>Modules</th>
                  <th>Power</th>
                </tr>
              </thead>
              <tbody class= "monthly_table_body">
                <tr v-for="(data, index) in fieldSegmentsData" :key="index">
                  <td>{{data[0] ? data[0] : `Subarray #${index + 1}`}}</td>
                  <td>{{ data[1] }}</td>
                  <td>{{ data[2] }}</td>
                  <td>{{ data[3] }}</td>
                  <td>{{ data[4] }}</td>
                  <td>{{ data[5] }}</td>
                  <!-- <td>80.9</td> -->
                  <td>{{ data[6] }}</td>
                  <td>{{data[7]}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
    </div>
      <section class="analysis_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('shadow-analysis')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Shading Analysis</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="analysis_inside common_inside">
          <div class="row">
            <div class="col">
              <div class="time">
                <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
                June 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.shadow_analysis_images 
              || !dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image">
                <img
                  class="loadingImages"
                  :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image"
                  alt="Pannel" />
              </figure>
            </div>
            <div class="col">
              <div class="time">
                <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
                June 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.shadow_analysis_images 
              || !dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image">
                <img
                class="loadingImages"
                :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image"
                alt="Pannel" />
              </figure>
            </div>
          </div>
           <div class="row" v-if="isActive">
            <div class="col">
              <div class="time">
                <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
                December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig"  v-loading="!dataFromAPI.shadow_analysis_images 
              || !dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image">
                <img
                  class="loadingImages"
                  :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image"
                  alt="Pannel" />
              </figure>
            </div>
            <div class="col">
              <div class="time">
                <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
                December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.shadow_analysis_images 
              || !dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image">
                <img
                  class="loadingImages"
                  :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image"
                  alt="Pannel" />
              </figure>
            </div>
          </div>
          <div v-if="isActive" class="conclusion"><strong>Summary: </strong> Modules are shadow free for {{ calcSolarTime(dataFromAPI.system_metrics["Shading Loss"]) }}% of solar time throughout the year.</div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      <section class="analysis_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('shadow-analysis') && !isActive">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Shading Analysis</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="analysis_inside common_inside">
          <div class="row">
            <div class="col">
              <div class="time">
                <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
                December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.shadow_analysis_images 
              || !dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image">
                <img
                  class="loadingImages"
                  :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image"
                  alt="Pannel" />
              </figure>
            </div>
            <div class="col">
              <div class="time">
                <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
                December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }}
              </div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.shadow_analysis_images 
              || ! dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image">
                <img
                  class="loadingImages"
                  :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image"
                  alt="Pannel" />
              </figure>
            </div>
          </div>
          <div class="conclusion"><strong>Conclusion: </strong> Modules are shadow free for {{ calcSolarTime(dataFromAPI.system_metrics["Shading Loss"]) }}% of solar time throughout the year.</div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      <section class="analysis_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('heat-map')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Irradiance Map/ Solar Access</h3>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="analysis_inside common_inside">
          <div class="row">
            <div class="col">
              <div class="time">Irradiance Map</div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.heat_map">
                <img class="loadingImages" :src="dataFromAPI.heat_map" alt="Pannel" />
              </figure>
            </div>
            <div class="col">
              <div class="time">Solar Access</div>
              <figure class="analysis_fig" v-loading="!dataFromAPI.solar_access_image">
                <img class="loadingImages" :src="dataFromAPI.solar_access_image" alt="Pannel" />
              </figure>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      <section class="losses_graph_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('losses')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>System Production Losses</h3>
            <p>Loss in generation predicted due to environmental and electrical factors</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>

        <div class="losses_graph_inside common_inside" style="padding-top: 16px">
          <div class="graph_box" style="height: 96%;">
            <lossBarChart class="lossBarChart" 
            :lossData="convertLossDataFromArrayToGraphFormat(lossData)" 
            :updatedData="updatedData" 
            :key="lossesGraphKey"
            :reportTemplate="reportTemplate" />
          </div>
        </div>
        
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      <section class="cost_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('bill-with-without-solar') && !isThisPageDisabled('bill-with-without-solar')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Cost of Not Going Solar</h3>
            <p>Your estimated annual electricity bill with and without solar for next 25 years</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="cast_graph common_inside">
          <div class="savings_graph">
            <div class="title" style="margin-left: 20px;">{{ this.currencyCode }}</div>
            <div class="graph_area">
              <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
              <web-proposal-multi-bar-chart 
              :estimatedUtilityBillWithSolarData="estimatedUtilityBillWithSolarData2" :estimatedUtilityBillWithoutSolarData="estimatedUtilityBillWithoutSolarData" :estimatedUtilityBillDataLabels="estimatedUtilityBillDataLabels"
              :currencyCode="currencyCode" 
              :updatedData="updatedData" 
              :key="notGoingSolarkey"
              :reportTemplate="reportTemplate" />
              <ul class="indicates">
                <li>
                  <span class="color color_orange"></span>
                  {{ isBatteryAvailable ? "Bill with Solar & Battery" : "Bill with Solar" }}
                </li>
                <li>
                  <span class="color color_gray primaryColorBackground"></span>
                  Bill without Solar
                </li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>
      
      <section class="metrics_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('environmental-impact')">
        <header class="main_header primaryColorBackground">
          <div class="header_title">
            <h3>Environmental Impact</h3>
            <p>You are contributing to solve Earth's biggest problem - Climate Change.</p>
          </div>
          <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
            <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
            <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
          </div>
        </header>
        <div class="metrics_data common_inside" style="padding-top: 24px;">
          <ul class="cards_list">
            <li>
              <div class="panel_card light_red">
                <div class="card_head primaryColorBackground">
                  <h3>Carbon Dioxide Offset</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.co2_offset) }}</div>
                  <div class="subvalue">metric tons</div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_blue">
                <div class="card_head secondaryColorBackground">
                  <h3>Equivalent Acres of Forest</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.acres_of_forest) }}</div>
                  <div class="subvalue">acres/year</div>
                </div>
              </div>
            </li>
            <li>
              <div class="panel_card light_gray">
                <div class="card_head tertiaryColorBackground">
                  <h3>Coal Burn Avoided</h3>
                </div>
                <div class="card_content">
                  <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.coal_burn_avoided) }}</div>
                  <div class="subvalue">metric tons</div>
                </div>
              </div>
            </li>
          </ul>
          <div class="detailed_info mt-3">
            <div class="info_inside">
              <ul class="info_list">
                <li>
                  <div class="info_inside_details primaryColorBackground">
                    <h5>Equivalent Number of Trees Planted</h5>
                    <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.trees)}} trees</div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details secondaryColorBackground">
                    <h5>Petrol Consumption Avoided</h5>
                    <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.gasoline_consumed) }} litres</div>
                  </div>
                </li>
                <li>
                  <div class="info_inside_details tertiaryColorBackground">
                    <h5>Equivalent Kilometers Driven</h5>
                    <div class="value">{{ convertedWithComaskWh(dataFromAPI.green_impact_data.kilometers_driven) }} kms</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
          <div class="right">
            <div class="gen_text">
              <div>Generated on: </div>
              <div>{{ dateAndTime }} with</div>
            </div>
           <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
          </div>
        </footer>
      </section>

      <div id="faqMain" v-show="pagesNew.includes('frequently-asked-questions') && faqData.length">
        <section class="estimation_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''">
          <header class="main_header primaryColorBackground" id="headerIdFAQ">
            <div class="header_title">
              <h3>Frequently Asked Questions</h3>
            </div>
            <div class="header_logo" v-if="dataFromAPI.organisation_data.logo">
              <!-- <img src="./assets/img/Tata_logo.png" alt="Tata" /> -->
              <img :src="dataFromAPI.organisation_data.logo" alt="logo" />
            </div>
          </header>
          <div class="metrics_data common_inside">
            <div class="allFaqs" id="allFAQs">
              <div class="quesContFAQ"  v-for="(faq, index) in faqData" :key="index">
                <div class="ansFlexFAQ">
                  <pre class="huihuiFAQ">Q. </pre>
                    <h3 class="quesFAQ">
                      {{ faq.question }}
                    </h3>
                  </div>
                  <div class="ansFlexFAQ">
                  <pre class="huihuiAnsFAQ">A. </pre>
                  <p class="ansFAQ">
                    {{ faq.answer }}
                  </p>
                </div>
              <hr class="qansFAQ" />
              </div>
            </div>
          </div>
          <footer class="footer">
            <div class="left">Client: <strong  v-html="projectNameFiltered(clientNameComputed)"></strong></div>
            <div class="right">
              <div class="gen_text">
                <div>Generated on: </div>
                <div>{{ dateAndTime }} with</div>
              </div>
              <img :src="arkaEnergyLogo" class="g_logo" alt="TSL"/>
            </div>
          </footer>
        </section>
       </div>
      <section class="thanks_section widthPages" :class=" isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('thank-you')">
        <div class="thanks_inside common_inside">
          <h2 class="thnkUDskTp">Thank You</h2>
          <div class="thanks_content">
            <div class="thanks_logo" v-if="dataFromAPI.organisation_data.logo">
              <img :src="dataFromAPI.organisation_data.logo" alt="Tata" />
            </div>
            <h2 class="thnkUMD">Thank You</h2>
            <ul class="touch_list">
              <li class="mail" v-if="dataFromAPI.organisation_data.email_id">
                <span class="icon primaryColorBackground">
                  <img src="./assets/img/chat-left-text.svg" alt="Chat" />
                </span>
                <div class="text">{{ dataFromAPI.organisation_data.email_id }}</div>
              </li>
              <li class="phone" v-if="dataFromAPI.organisation_data.phone">
                <span class="icon secondaryColorBackground">
                  <img src="./assets/img/phone.svg" alt="Phone" />
                </span>
                <div class="text">{{ dataFromAPI.organisation_data.phone }}</div>
              </li>
              <li class="web" v-if="dataFromAPI.organisation_data.website">
                <span class="icon tertiaryColorBackground">
                  <img src="./assets/img/globe.svg" alt="Globe" />
                </span>
                <div class="text">{{ dataFromAPI.organisation_data.website }}</div>
              </li>
            </ul>
          </div>
          
        </div>
      </section>
    </main>
  </div>
</template>

<script>

import webProposalBarChartEstimatedSavings from '../../../components/ui/charts/commonCharts/webProposalBarChartEstimatedSavings.vue';
import webProposalBarChartSavings from '../../../components/ui/charts/commonCharts/webProposalBarChartSavings.vue';
import webProposalBarChartProduction from '../../../components/ui/charts/commonCharts/webProposalBarChartProduction.vue';
import webProposalMultiBarChart from "../../../components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
// import lossBarChartOld from "../../../components/ui/charts/commonCharts/lossAnalysisChart.vue";
import lossBarChart from "../../../components/ui/lossAnalysisChart.vue";
import modifyComponentData from "../js/modifyComponentData.js"
import { formatDateForReport } from "@/pages/utils/utils.js"
import { formatNumberWithCommas, convertLossDataFromArrayToGraphFormat } from '@/utils.js'
import currencySymbolNameMap from '../../currency-symbol-name-map';
import solarLabsLogo from '../../../assets/drop/70cdd171-53f.png';
import {fetchArkaEnergyLogo, convertTimeTo12HourFormat } from "../../utils/utils"
import batterySavingAnalysisChart from "../../../components/ui/charts/commonCharts/batterySavingAnalysisChart.vue";
import {
  getCurrencySymbol,
  getFormattedCurrencyComas,
} from "../../../utils/numberFormat/currencyFormatter";

export default {
  name: 'App',

  props: {
    isBatteryAvailable:{
      type: Number,
      default: 0,
    },
    batteryBackupOnStorageText: {
      type: String,
    },

    batteryBackupOnStorageAndSolarText: {
      type: String,
    },

    batteryBackupOnStorageAndLoadText: {
      type: String,
    },

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

  components: {
    webProposalBarChartEstimatedSavings,
    webProposalBarChartSavings,
    webProposalBarChartProduction,
    webProposalMultiBarChart,
    lossBarChart,
    batterySavingAnalysisChart,
  },

  data() {
    return {
      referenceId : this.dataFromAPI.reference_id,
      solarLabsLogo: solarLabsLogo,
      arkaEnergyLogo: fetchArkaEnergyLogo(),
      windowWidth: window.innerWidth,
      savingsDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      savingsDataLabelsYearly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      productionDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      estimatedUtilityBillDataLabels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      currencyCode: this.dataFromAPI.country.currency_code,
       isActive: true,
       estSavingGraphKey: 0,
       avgMonthProdGraphKey: 0,
       lossesGraphKey: 0,
       notGoingSolarkey: 0,
       monthlySavingsGraphKey: 0,
      reportTemplate: 'reportThree',
      countryCode: this.$props.dataFromAPI.country.currency_code,
    }
  },
  watch:{
    windowWidth:{
      handler(val){
        this.updateReportParameters();
      }
    },
    updatedData:{
      deep: true,
      handler(val){
        this.estSavingGraphKey++;
        this.avgMonthProdGraphKey++;
        this.lossesGraphKey++;
        this.notGoingSolarkey++;
        this.monthlySavingsGraphKey++;
        this.updateReportParameters();
      }
    },
  },
  mounted(){
    window.onresize = () => {
      this.windowWidth = window.innerWidth
    }
    this.reportThreeScriptHandler();
    this.countryCode= this.$props.dataFromAPI.country.currency_code;
  },

  nonReactiveData() {
    return {
        currencySymbolNameMap,
    }
  },

  methods: {
    convertLossDataFromArrayToGraphFormat,
    projectNameFiltered(val){
      if(val){
        const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
        return eval("`" + escapedVal + "`");
      }
      else{
        return "-"
      }
    },

    
    handleCurrencyFormate(amount) {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode, amount));
      return this.countryCode
        ? getFormattedCurrencyComas(this.countryCode, amount)
        : "";
    },

    isThisPageDisabled(page){
      if(['savings','monthly-savings','bill-with-without-solar'].includes(page) && 
      (!this.dataFromAPI['financial_data'] || !this.dataFromAPI['financial_data']['payback']))
      return true;
      else 
      return false;
    },
    reportThreeScriptHandler(){
    var pageNumber = 2;
    function cloneIt(sectionName, sectionClass, secHeaderId, pageName, containerClass, wrapperId, wrapperClass, isPuppet) {
      
      // Cloning the entire div and adding the section class to it
      let cloneIt = document.createElement("section");
      cloneIt.classList.add("estimation_section");
      cloneIt.classList.add("widthPages");
      cloneIt.classList.add('doc-page');
      if(isPuppet){
        cloneIt.classList.add('pagePuppeteer');
      }
      cloneIt.id = sectionName + "cloneIt" + pageNumber;

      // Creating header clone and appending it
      let header = null;
      if(sectionName == 'batteryStorage') {
        header = document.getElementById("headerIdBS");
      } else if (sectionName == 'ourTeam') {
        header = document.getElementById("headerIdOT");
      } else if (sectionName == 'companyOverviews') {
        header = document.getElementById("headerIdCO");
      } else if(sectionName == 'sysPricing') {
        header = document.getElementById("headerIdPricing");
      } else {
        header = document.getElementById("headerIdFAQ");
      }
      let headerClone = header.cloneNode(true);
      headerClone.id = sectionName + "cloneIt" + pageNumber;
      cloneIt.appendChild(headerClone);

      // Creating heading clone for OUR TEAM
      let contentClone = document.createElement("div");
      contentClone.classList.add("metrics_data");
      contentClone.classList.add("common_side");
      contentClone.id = sectionName + "contentClone" + pageNumber;
      cloneIt.appendChild(contentClone);

      // Creating footer clone and appending it
      let footer = document.getElementById("footerId");
      let footerClone = footer.cloneNode(true);
      footerClone.id = sectionName + "footerClone" + pageNumber;
      cloneIt.appendChild(footerClone);
      if (sectionName == 'faq') {
          let faqMain = document.getElementById("faqMain");
          faqMain.appendChild(cloneIt);
      } else if (sectionName == 'batteryStorage') {
          let batteryMain = document.getElementById("batteryMain");
          batteryMain.appendChild(cloneIt);  
      } else if (sectionName == 'companyOverviews') {
          let companyOverviewMain = document.getElementById("companyOverviewMain");
          companyOverviewMain.appendChild(cloneIt);  
      } else if(sectionName == 'sysPricing') {
        let systemPricingMain = document.getElementById("systemPricingMain");
        systemPricingMain.appendChild(cloneIt);  
      } else{
        let ourTeamMain = document.getElementById("ourTeamMain");
        ourTeamMain.appendChild(cloneIt);
      }

      // Now we have cloneIt, contentClone, headerClone, secHeaderClone, footerClone and cloneIt is the whole clone which we made so far..
      // Lets add the Team members dynamically


      // // Now we append the page next to the previous Our Team Page or FAQ page based on this check
      // if (sectionName == 'faq') {
      //     let faqMain = document.getElementById("faqMain");
      //     faqMain.appendChild(cloneIt);
      // }
      // else if (sectionName == 'sysDetails') {
      //     let systemDetailsMain = document.getElementById("sytemDetailsMain");
      //     systemDetailsMain.appendChild(cloneIt);
      // }
      // else {
      //     let ourTeamMain = document.getElementById("ourTeamMain");
      //     ourTeamMain.appendChild(cloneIt);
      // }
      pageNumber++;
      return cloneIt;
    }

    function cloneCallCompanyOverview(wrapperId, wrapperClass, isPuppet) {
          let availableHeight = 300;
          if(report_type.trim()==='portrait'){
            availableHeight=300;
          }
          let ceo = document.getElementsByClassName(wrapperClass);
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
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
                  availableHeight = 413;
                  if(report_type.trim()==='portrait'){
                    availableHeight=611;
                  }
                  let newClone = cloneIt("companyOverviews", "companyOverview_section", "companyOverviewHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet);
                  let newPage = pageNumber - 1;
                  let eleId = "companyOverviewscontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }
          pageNumber = 2;
    }

    function cloneBatteryStorage(isPuppet, isBillWithSolar) {
        let chartPage = pageNumber;
        let beforeChart = false;
        let availableHeight = 157;
        if(report_type.trim()==='portrait'){
            availableHeight=400;
        }
        let ceo = document.getElementsByClassName("allBatteryValues");
        let noOfCEOs = ceo[0].childElementCount;
        let i = 0;
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
                var newPage = pageNumber;
                if (noOfCEOs) {
                    availableHeight = 157;
                    if(report_type.trim()==='portrait'){
                        availableHeight=400;
                    }
                    var newClone = null;
                    newClone = cloneIt("batteryStorage", "batteryStorage_section", "batteryHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet);
                    beforeChart = true;
                    let newComponentTable = document.createElement("table");
                    newComponentTable.id = "customersSDS2" + newPage;
                    chartPage = newPage+1;
                    newComponentTable.classList.add("customersSDS2Class");
                    let eleId = "batteryStoragecontentClone" + newPage;
                    let newCloneProp = document.getElementById(eleId);
                    newCloneProp.appendChild(newComponentTable);
                    let tableHead = document.getElementById("headBattery");
                    let newTableHead = tableHead.cloneNode(true);
                    newComponentTable.appendChild(newTableHead);
                    let newTableBody = document.createElement("tbody");
                    newTableBody.classList.add("allBatteryValues");
                    newTableBody.id = "allBatteryValues" + newPage;
                    newComponentTable.appendChild(newTableBody);
                    while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                        availableHeight -= ceo[0].children[i].clientHeight;
                        newTableBody.appendChild(ceo[0].children[i]);
                        noOfCEOs--;
                    }
                  }
             }
         }
         if(availableHeight<390){
          let cloneForChart = cloneIt("batteryStorage", "batteryStorage_section", "batteryHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet);
          if(!beforeChart) {
            chartPage++;
          }
          let eleId = "batteryStoragecontentClone" + chartPage;
          let newChartCloneProp = document.getElementById(eleId);
          let batteryAnalysisChart = document.getElementById("batterySavingsAnalysisChart");
          newChartCloneProp.appendChild(batteryAnalysisChart);
          if(!isBillWithSolar){
            cloneForChart.setAttribute('style', 'display:none !important');
          }
        }
        pageNumber = 2;
     }

    function cloneCallOT(wrapperId, wrapperClass, isPuppet) {
          let availableHeight = 413;
          if(report_type.trim()==='portrait'){
            availableHeight=611;
          }
          let ceo = document.getElementsByClassName(wrapperClass);
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
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
                  availableHeight = 413;
                  if(report_type.trim()==='portrait'){
                    availableHeight=611;
                  }
                  let newClone = null;
                  if (wrapperClass === 'allFaqs') {
                      newClone = cloneIt("faq", "FAQ_section", "secHeaderFAQId", "faq", "quesContainerFAQ", wrapperId, wrapperClass, isPuppet);
                  }
                  else {
                      newClone = cloneIt("ourTeam", "ourTeam_section", "secHeaderOTId", "ourTeam", "ourTeamContainerOT", wrapperId, wrapperClass, isPuppet);
                  }
                  let newPage = pageNumber - 1;
                  let eleId = "ourTeamcontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }
          pageNumber = 2;
    }

    function cloneSystemDetails() {
      let availableHeight = 285;
      if(report_type.trim()==='portrait'){
        availableHeight=551;
      }
      let ceo = document.getElementsByClassName("allAddons");
      let ceo1 = document.getElementsByClassName("allDiscounts");
      let noOfCEOs = ceo[0].childElementCount;
      let noOfCEOs1 = ceo1[0].childElementCount;
      let elsePart = document.getElementById("elsePart")
      console.log(noOfCEOs, noOfCEOs1);
      let i = 0;
      let j = 0;
      let halfed = true;
      while (noOfCEOs || noOfCEOs1) {
        if (pageNumber == 2) {
          while (
            ceo[0].children[i] &&
            availableHeight >= ceo[0].children[i].clientHeight
          ) {
            availableHeight -= ceo[0].children[i].clientHeight;
            i++;
            noOfCEOs--;
          }
          pageNumber++;
        } else {
          var newPage = pageNumber;
          if (noOfCEOs) {
            availableHeight = 365;
            if(report_type.trim()==='portrait'){
              availableHeight=565;
            }
            var newClone = null;
            newClone = cloneIt(
              "sysPricing",
              "systemPricing_section",
              "secHeaderSDSId",
              "sysPricing",
              "tableContainerSDS",
              "sysDetails",
              "sysDetailsId"
            );
            let idName = "sysPricingcontentClone" + newPage;
            let newTableBody = document.getElementById(idName);
            console.log(newTableBody);
            let addonHeading = document.getElementById("addonHeading");
            let addonHeadingClone = addonHeading.cloneNode(true);
            addonHeadingClone.id = "addonHeading"+newPage;
            addonHeadingClone.removeChild(addonHeadingClone.childNodes[1]);
            newTableBody.appendChild(addonHeadingClone);
            availableHeight-=40;
            while (
              ceo[0].children[i] &&
              availableHeight >= ceo[0].children[i].clientHeight
            ) {
              availableHeight -= ceo[0].children[i].clientHeight;
              newTableBody.appendChild(ceo[0].children[i]);
              noOfCEOs--;
              console.log(availableHeight);
            }
            if(!noOfCEOs1) {
              let newPage2 = pageNumber-1;
              let containerId = "sysPricingcontentClone" + newPage2;
              console.log(containerId);
              let newTableBody = document.getElementById(containerId);
              console.log(newTableBody);
              let sysOrientation = document.getElementById("discountFullId");
              newTableBody.appendChild(sysOrientation);
              availableHeight -= 40;
            }
          } else {
            console.log(availableHeight);
            if (availableHeight > 40) {
              halfed = false;
              if (newClone) {
                let newPage2 = pageNumber-1;
                let containerId = "sysPricingcontentClone" + newPage2;
                console.log(containerId);
                let newTableBody = document.getElementById(containerId);
                console.log(newTableBody);
                let sysOrientation = document.getElementById("discountFullId");
                newTableBody.appendChild(sysOrientation);
                availableHeight -= 40;
              } else {
                availableHeight -= 40;
              }
              while (
                ceo1[0].children[j] &&
                availableHeight >= ceo1[0].children[j].clientHeight
              ) {
                availableHeight -= ceo1[0].children[j].clientHeight;
                j++;
                noOfCEOs1--;
              }
            } else {
              if (halfed) {
                let newPage = pageNumber;
                availableHeight = 365;
                if(report_type.trim()==='portrait'){
                  availableHeight=611;
                }
                var newClone = cloneIt(
                  "sysPricing",
                  "systemPricing_section",
                  "secHeaderSDSId",
                  "sysPricing",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );
                let sysOrientation = document.getElementById("discountFullId");
                let containerId = "sysPricingcontentClone" + newPage;
                console.log(containerId);
                let newCloneBody = document.getElementById(containerId);
                newCloneBody.appendChild(sysOrientation);
                while (
                  ceo1[0].children[j] &&
                  availableHeight >= ceo1[0].children[j].clientHeight
                ) {
                  availableHeight -= ceo1[0].children[j].clientHeight;
                  j++;
                  noOfCEOs1--;
                }
                halfed = false;
                console.log(availableHeight);
              } else {
                availableHeight = 365;
                if(report_type.trim()==='portrait'){
                  availableHeight=611;
                }
                var newClone = cloneIt(
                  "sysPricing",
                  "systemPricing_section",
                  "secHeaderSDSId",
                  "sysPricing",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );            
                let idName = "sysPricingcontentClone" + newPage;
                let newTableBody = document.getElementById(idName);
                let discountHeading = document.getElementById("addonHeading");
                let discountHeadingClone = discountHeading.cloneNode(true);
                discountHeadingClone.id = "discountHeading"+newPage;
                discountHeadingClone.removeChild(discountHeadingClone.childNodes[1]);
                discountHeadingClone.childNodes[0].innerText = "Discounts";
                newTableBody.appendChild(discountHeadingClone);
                availableHeight-=40; 
                while (
                  ceo1[0].children[j] &&
                  availableHeight >= ceo1[0].children[j].clientHeight
                ) {
                  availableHeight -= ceo1[0].children[j].clientHeight;
                  newTableBody.appendChild(ceo1[0].children[j]);
                  noOfCEOs1--;
                }
              }
            }
          }
        }
      }
      console.log(availableHeight);
      if(availableHeight<140) {
        console.log(availableHeight);
        var newClone = cloneIt(
          "sysPricing",
          "systemPricing_section",
          "secHeaderSDSId",
          "sysPricing",
          "tableContainerSDS",
          "sysDetails",
          "sysDetailsId"
        );         
        let newPage = pageNumber - 1;
        let idName = "sysPricingcontentClone" + newPage;
        let newTableBody = document.getElementById(idName);
        newTableBody.appendChild(elsePart);
      } else {

        let newPage1 = newPage-1;
        let idName1 = "sysPricingcontentClone" + newPage;
        let idName2 = "sysPricingcontentClone" + newPage1;
        console.log(idName2);
        let newTableBody = document.getElementById(idName1) ? document.getElementById(idName1) : document.getElementById(idName2);
        if(newTableBody){
          newTableBody.appendChild(elsePart);
        }
      }
      pageNumber = 2;
    }


    function cloneCallFAQ(wrapperId, wrapperClass, isPuppet) {
          let availableHeight = 413;
          if(report_type.trim()==='portrait'){
            availableHeight=611;
          }
          let ceo = document.getElementsByClassName(wrapperClass);
          if(ceo[0])
          {
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
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
                  let availableHeight = 413;
                  if(report_type.trim()==='portrait'){
                    availableHeight=611;
                  }
                  let newClone = null;
                  if (wrapperClass === 'allFaqs') {
                      newClone = cloneIt("faq", "FAQ_section", "secHeaderFAQId", "faq", "quesContainerFAQ", wrapperId, wrapperClass, isPuppet);
                  }
                  else {
                      newClone = cloneIt("ourTeam", "ourTeam_section", "secHeaderOTId", "ourTeam", "ourTeamContainerOT", wrapperId, wrapperClass, isPuppet);
                  }

                  let newPage = pageNumber - 1;
                  let eleId = "faqcontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }

          pageNumber = 2;
          }
      }
      function modifyOriginalFieldSegment() {
    let tableData = originalFsNode.getElementsByTagName('tbody')[0];
    // setting all null, excluding first 12, which should be displayed on first page(original page)
    for (let c = 0; c < numberOfFsRows; c++ ) {
      if ( c > numberOfRowsPerPage ) {
        tableData.children[c].style.display = "none";
      }
    }
  }
  // function to duplicate field segment node and modify the table the data as required
  function duplicateFieldSegmentNode(i, j) {
    var cloneFsNode = originalFsNode.cloneNode(true); // "deep" clone
    cloneFsNode.id = "fs" + ++i;
    let tableData = cloneFsNode.getElementsByTagName('tbody')[0];
    // iterating on all child nodes and them to null if data doesn't need to displayed on current node
    for (let c = 0; c < numberOfFsRows; c++ ) {
      if (!(c > j && c <= j + numberOfRowsPerPage)) {
        tableData.children[c].style.display = "none";
      }
    }
    // inserting the new node to the DOM right after the current node
    originalFsNode.parentNode.insertBefore( cloneFsNode, currNode.nextSibling );
    // updaing the current node
    currNode = cloneFsNode;
  }
  async function removeEmptyCols() {
    let originalComponentNode = document.querySelector('.component_inside');
    let componentCols = originalComponentNode.getElementsByClassName('col');
    let colsToRemove = [];
    for(let i=0; i<componentCols.length; i++){
      if(componentCols[i].querySelector('.component_info').innerText.trim() == ""){
        colsToRemove.push(componentCols[i]);
      }
    }
    await colsToRemove.forEach(item => item.remove());
  }

  async function breakComponentPage(maxRowOffsetHeight) {
    let initialComponentTag = document.querySelector('.component_section');
    let currentComponentNode = initialComponentTag;
    let componentSection = document.querySelector('.component_section').querySelector('.row');
    let allCols = componentSection.getElementsByClassName('col');
    let colsArr = []

    for(let i=0; i<allCols.length; i++) colsArr.push(allCols[i]) // copy of all col nodes

    while (componentSection.lastElementChild) {
      await componentSection.removeChild(componentSection.lastElementChild); // remove all the cols
    }

    let currentColIdx = 0;
    let cloneComponentNode = initialComponentTag.cloneNode(true);
    cloneComponentNode.id = currentColIdx;
    while(currentColIdx < colsArr.length) {
      await componentSection.appendChild(colsArr[currentColIdx]); //append new cols until height < maxRowOffsetHeight
      if(componentSection.offsetHeight > maxRowOffsetHeight) {
        await componentSection.removeChild(componentSection.lastElementChild);
        cloneComponentNode.id = currentColIdx;
        await initialComponentTag.parentNode.insertBefore(cloneComponentNode.cloneNode(true), currentComponentNode.nextSibling);
        currentComponentNode = currentComponentNode.nextSibling;
        componentSection = document.getElementById(currentColIdx).querySelector('.row')
        componentSection.appendChild(colsArr[currentColIdx]);
      }
      currentColIdx++;
    }
  }
  var report_type = this.updatedData.report_type;
  var isPuppet = this.isPuppeteer;
  var isBillWithSolar = !this.dataFromAPI['financial_data'] || !this.dataFromAPI['financial_data']['payback'];
  if(this.pagesNew.includes('field-segments')){
    var originalFsNode = document.getElementById('fs');
    var currNode = originalFsNode;
    var numberOfRowsPerPage =0;
    if (report_type==='portrait'){
      numberOfRowsPerPage = 25;
    }
    else{
        numberOfRowsPerPage = 13;
      }
    // -1 for excluding header row
    if (originalFsNode !== null) {
      var numberOfFsRows = document.getElementById("fs").getElementsByTagName('tr').length - 1;
      var numberOfExtraFsPagesRequired = Math.ceil(numberOfFsRows / numberOfRowsPerPage) - 1;
    }
    
    if (numberOfExtraFsPagesRequired !== undefined) {
      // variable for handling data indexing 
        let j = numberOfRowsPerPage;
      // create the required number of field segment nodes
        for(let i = 1; i <= numberOfExtraFsPagesRequired; i++ ) {
          duplicateFieldSegmentNode(i, j);
          j = j + numberOfRowsPerPage;
        }
      // modify the original node at the end
      modifyOriginalFieldSegment();
    }
  }
  if(this.pagesNew.includes('components')){
    let originalComponentNode = document.querySelector('.component_inside');
    removeEmptyCols();
    let maxRowOffsetHeight = 400;
    report_type = this.updatedData.report_type;
    if (report_type==='portrait')
      maxRowOffsetHeight = 650;
      
    if(originalComponentNode.querySelector('.row').offsetHeight > maxRowOffsetHeight)
      breakComponentPage(maxRowOffsetHeight);
  }
    cloneCallCompanyOverview("companyOverviews", "imgContainerCO", isPuppet);
    if(this.isBatteryAvailable){
      cloneBatteryStorage(isPuppet, !isBillWithSolar);
    }
    cloneCallOT("allCEOs", "allCeos", isPuppet);
    cloneCallFAQ("allFAQs", "allFaqs", isPuppet);
    if(this.pagesNew.includes('system-pricing')) {
      cloneSystemDetails();
    }
    this.updateReportParameters();

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
    updateReportParameters(){
        document.documentElement.style.setProperty('--primary', `${this.updatedData.custom_color.primary_color}`);
        document.documentElement.style.setProperty('--secondary', `${this.updatedData.custom_color.secondary_color}`);
        document.documentElement.style.setProperty('--tertiary',  `${this.updatedData.custom_color.tertiary_color}`);
        document.documentElement.style.setProperty('--danger',  `${this.updatedData.custom_color.secondary_color}`);
        if(this.updatedData.report_type === "portrait" || (!this.isPuppeteer && this.windowWidth < 765))
        {
          this.isActive = true;
        }
        else{
          this.isActive = false;
        }
    },
    calcSolarTime(shadingLoss) {
      let absLoss = Math.abs(shadingLoss)
      return 100 - absLoss;
    },

    convertTimeTo12HourFormat,

    getComponentColorClass(ind) {
      let classList = ['light_red', 'light_gray', 'light_blue']
      return classList[ind%3]
    },

  },

  computed: {

    handleCurrencySymbol() {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode));
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },


    addersData(){
      let addersDataArray = [];
      for(let i=0;i<this.dataFromAPI.adders_and_discounts?.length;i++){
        if(this.dataFromAPI.adders_and_discounts[i].adders_discounts__type === 'adder' && this.dataFromAPI.adders_and_discounts[i].adders_discounts__is_homeowner_facing === true) {
          addersDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return addersDataArray;
    },

    discountsData(){
      let discountsDataArray = [];
      for(let i=0;i<this.dataFromAPI.adders_and_discounts?.length;i++){
        if(this.dataFromAPI.adders_and_discounts[i].adders_discounts__type === 'discount' && this.dataFromAPI.adders_and_discounts[i].adders_discounts__is_homeowner_facing === true) {
          discountsDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return discountsDataArray;
    },

    clientNameComputed(){
      return this.dataFromAPI.project_head.client_name || this.dataFromAPI.project_head.name;
    },

    batteryData(){
      return this.dataFromAPI.battery_data;  
    },

    residualEnergyPostBatteryBill() {
      return this.dataFromAPI.financial_data?.residual_energy_post_battery_bill;
    },

    estimatedUtilityBillWithSolarData2() {
      if(this.isBatteryAvailable) {
       return this.dataFromAPI.financial_data?.residual_energy_post_battery_bill;
      }
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    additionalSavingsPostBattery() {
      if(this.dataFromAPI.financial_data){
        return parseFloat(this.dataFromAPI.financial_data.additional_savings_post_battery).toFixed(2);
      } else {
        return null;
      }
    },


    teamMembersArray() {
      let newArray = [];
      if(this.dataFromAPI.team_members)
      newArray = Object.values(this.dataFromAPI.team_members);
      return newArray;
    },

    faqData() {
      if( this.dataFromAPI.frequently_asked_questions)
      return this.dataFromAPI.frequently_asked_questions;
      else
      return [];
    },


    annualProduction() {
      let data = this.dataFromAPI.system_metrics["Annual Production"];
      let final = data.split('-');
      let annualProduction = final[0];
      return annualProduction;
    },

    dateAndTime() {
      var dateAndTime
      if (this.isPuppeteer) {
        dateAndTime = this.$route.params.date
      } else {
        dateAndTime = formatDateForReport(new Date())
      }
      return dateAndTime;
    },

    acNameplate() {
      let data = this.dataFromAPI.system_metrics["AC Nameplate"];
      let final = data.split(',');
      let acNameplate = final[0];
      return acNameplate;
    },

    loadRatio() {
      let data = this.dataFromAPI.system_metrics["AC Nameplate"];
      let final = data.split(',');
      let loadRatio = final[1].split(':')[1].trim();
      return loadRatio;
    },

    savingsDataYearly() {
      // return this.dataFromAPI.financial_data.monthly_saving;
      // return this.dataFromAPI.financial_data.savings;
      return this.dataFromAPI.financial_data.cumulative_savings;
    },

    savingsData() {
      return this.dataFromAPI.financial_data.monthly_saving;
      // return this.dataFromAPI.financial_data.savings;
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

    monthlyTableData() {
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      mainArray.pop();
      return mainArray;
    },

    annualMonthlyTableData() {
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      mainArray = mainArray[mainArray.length - 1];
      return mainArray;
    },

    fieldSegmentsData() {
      let mainArray = this.dataFromAPI.field_segments.values;
      return mainArray;
    },

    estimatedUtilityBillWithSolarData() {
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    estimatedUtilityBillWithoutSolarData() {
      return this.dataFromAPI.financial_data?.bill_without_solar;
    },

    lossData() {
      return this.dataFromAPI.chart_data.system_loss_src;
    },
    
    modifiedComponentData() {
      return modifyComponentData(this.dataFromAPI, 'reportThree')
    },
  },

}
</script>

<style scoped>
 /* @import './assets/styles/style.css'; */

 /* .graph_area {
  background: yellow;
  max-height: 280px;
  display: flex;
  flex-direction: column;
 } */

.main .pagePuppeteer {
  margin: 0px;
  width: 842px;
  height: 595px;
}

.main.portrait_controller .pagePuppeteer {
  width: 595px;
  height: 842px;
}

:root {
    --font: 'Roboto', sans-serif;
    --primary: #1c3366;
    --primary-1: #03A9F4;
    --secondary: #4c618f;
    --secondary-1: #d7e1f8;
    --tertiary: #385086;
    --secondary1: #00c4c7;
    --danger: #f46545;
    --error: #ff0808;
    --dark: #001b2c;
    --medium: #cbcbcb;
    --light-m: #eee;
    --white: #fff;
    --light-blue: #f0f3f8;
    --light: #917f7f;
    --light-gray: #dbe3f3;
    --step-0: #ffffff;
    --step-50: #f5f7fa;
    --step-100: #ccc;
    --step-150: #999;
    --step-200: #777;
    --step-250: #222;
}

 .content_section {
    min-height: fit-content !important;
}
.footer {
    position: relative !important;
    bottom: 0 !important;
    width: 100% !important;
}
.info_list li {
    margin: 0 !important;
    padding-left: 0 !important;
    position: inherit !important;
    }
.table_section table thead tr th {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    text-align: left !important;
    color: #1c3366 !important;
    font-size: 7px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    border-top: 1px solid var(--step-100) !important;
    white-space: nowrap !important;
    
}

.table_section table th, .table_section table td {
    padding: 5px 3px !important;
}
.incentivesDetails:nth-child(odd){
  background-color: white !important;
}

.yUnit {
    /* position: absolute;
    top: 0px;
    left: 101px; */
    /* align-self: flex-start; */
    display: inline-block;
    margin-left: 5px;
    margin-bottom: 5px;
    /* margin-top: 40px; */
    /* margin-bottom: 20px; */

    /* width: 10px; */
    height: 22px;
    font-family: "Helvetica Neue";
    font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.38;
    letter-spacing: normal;
    text-align: right;
    color: #222;
}
</style>

<style scoped>
/* This style tag is a replacent for import styles.css statement*/


/* @import url(./../font/stylesheet.css); */


:root {
    --font: 'Roboto', sans-serif;
    --primary: #1c3366;
    --primary-1: #03A9F4;
    --secondary: #4c618f;
    --secondary-1: #d7e1f8;
    --tertiary: #385086;
    --secondary1: #00c4c7;
    --danger: #f46545;
    --error: #ff0808;
    --dark: #001b2c;
    --medium: #cbcbcb;
    --light-m: #eee;
    --white: #fff;
    --light-blue: #f0f3f8;
    --light: #917f7f;
    --light-gray: #dbe3f3;
    --step-0: #ffffff;
    --step-50: #f5f7fa;
    --step-100: #ccc;
    --step-150: #999;
    --step-200: #777;
    --step-250: #222;
}

* {
    box-sizing: border-box;
    margin: 0;
    font-family: var(--font);
}

ul {
    padding: 0;
    list-style: none;
}

a {
    text-decoration: none;
}

a:focus {
    outline: none;
    background-color: transparent;
}

a:active,
a:hover {
    outline: 0;
}

html {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
}

button {
    overflow: visible;
}

body {
    margin: 0;
    font-size: 16px;
    color: var(--step-250);
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
menu,
nav,
section,
summary {
    display: block;
}

figure {
    margin: 0;
}

audio {
    display: inline-block;
    vertical-align: baseline;
}

audio:not([controls]) {
    display: none;
    height: 0;
}

canvas {
    display: inline-block;
    vertical-align: baseline;
}

progress {
    display: inline-block;
    vertical-align: baseline;
}

video {
    display: inline-block;
    vertical-align: baseline;
}

[hidden] {
    display: none;
}

template {
    display: none;
}

abbr[title] {
    border-bottom: none;
    text-decoration: underline;
    text-decoration: underline dotted;
}

b {
    font-weight: bold;
}

strong {
    font-weight: bold;
}

dfn {
    font-style: italic;
}

small {
    font-size: 80%;
}

sub {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
    bottom: -0.25em;
}

sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
    top: -0.5em;
}

img {
    border: 0;
    max-width: 100%;
}

svg:not(:root) {
    overflow: hidden;
}

hr {
    box-sizing: content-box;
    height: 0;
}

pre {
    overflow: auto;
    font-family: monospace, monospace;
    font-size: 1em;
}

code {
    font-family: monospace, monospace;
    font-size: 1em;
}

kbd {
    font-family: monospace, monospace;
    font-size: 1em;
}

samp {
    font-family: monospace, monospace;
    font-size: 1em;
}

button {
    color: inherit;
    font: inherit;
    margin: 0;
}

button:focus {
    outline: none;
    text-transform: none;
    -webkit-appearance: button;
    cursor: pointer;
}

button:focus::-moz-focus-inner {
    border: 0;
    padding: 0;
}

input {
    color: inherit;
    font: inherit;
    margin: 0;
    box-sizing: border-box;
}

input:focus {
    outline: none;
}

input:focus::-moz-focus-inner {
    border: 0;
    padding: 0;
}

optgroup {
    color: inherit;
    font: inherit;
    margin: 0;
}

optgroup:focus {
    outline: none;
    font-weight: bold;
}

select {
    color: inherit;
    font: inherit;
    margin: 0;
    box-sizing: border-box;
}

select:focus {
    outline: none;
    text-transform: none;
}

textarea {
    color: inherit;
    font: inherit;
    margin: 0;
    box-sizing: border-box;
}

textarea:focus {
    outline: none;
    overflow: auto;
}

html input[type="button"] {
    -webkit-appearance: button;
    cursor: pointer;
    box-sizing: border-box;
}

html input[disabled] {
    cursor: default;
}

input[type="reset"] {
    -webkit-appearance: button;
    cursor: pointer;
    box-sizing: border-box;
}

input[type="submit"] {
    -webkit-appearance: button;
    cursor: pointer;
    box-sizing: border-box;
}

button[disabled] {
    cursor: default;
}

input[type="checkbox"] {
    box-sizing: border-box;
    padding: 0;
}

input[type="radio"] {
    box-sizing: border-box;
    padding: 0;
}

input[type="number"]::-webkit-inner-spin-button {
    height: auto;
}

input[type="number"]::-webkit-outer-spin-button {
    height: auto;
}

input[type="search"] {
    -webkit-appearance: textfield;
    box-sizing: content-box;
}

input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
}

input[type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
}

legend {
    border: 0;
    padding: 0;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}

td {
    padding: 0;
}

th {
    padding: 0;
}

:root {
    --font: 'Roboto', sans-serif;
    --primary: #1c3366;
    --primary-1: #03A9F4;
    --secondary: #4c618f;
    --secondary-1: #d7e1f8;
    --tertiary: #385086;
    --secondary1: #00c4c7;
    --danger: #f46545;
    --error: #ff0808;
    --dark: #001b2c;
    --medium: #cbcbcb;
    --light-m: #eee;
    --white: #fff;
    --light-blue: #f0f3f8;
    --light: #917f7f;
    --light-gray: #dbe3f3;
    --step-0: #ffffff;
    --step-50: #f5f7fa;
    --step-100: #ccc;
    --step-150: #999;
    --step-200: #777;
    --step-250: #222;
}

.table_section table {
    width: 100%;
    border-radius: 4px;
    border-collapse: separate;
    background-color: #f0f3f8;
    border: 1px solid var(--step-100);
}

.table_section table th,
.table_section table td {
    padding: 5px 8px;
    font-size: 12px;
    vertical-align: top;
}

.table_section table thead tr th {
    padding-top: 8px;
    padding-bottom: 8px;
    text-align: left;
    color: #1c3366 !important;
    font-weight: 600;
    border-bottom: 1px solid var(--step-100);
}

.table_section table thead tr th span {
    display: block;
}

.table_section table tbody tr td {
    font-weight: 400;
    color: var(--step-250);
}

.table_section table tfoot tr td {
    font-weight: 600;
    color: var(--step-250);
    border-top: 1px solid var(--step-100);
}

h1,
h2,
h3,
h4,
h5,
h6 {
    font-weight: 600;
}

.btn {
    color: var(--dark);
    background-color: var(--step-0);
    border-radius: 4px;
    display: inline-block;
    font-weight: 600;
    font-size: var(--f14);
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    padding: 0.55rem 1.5rem;
    line-height: 1.42857143;
    user-select: none;
    box-shadow: 0 0 2px 0 var(--step-150);
}

.btn.btn-primary {
    border-color: var(--danger);
    background-color: var(--tertiary);
    background-image: linear-gradient(to bottom, var(--danger), #ea3912);
    color: var(--white);
}

.btn.btn-primary:disabled,
.btn.btn-primary.disabled {
    background-image: linear-gradient(to bottom, var(--light-gray), var(--step-100));
    border-color: var(--step-100);
}

.pade_mode {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    align-items: center;
}

.pade_mode p {
    flex-grow: 1;
    padding-right: 8px;
}

.pade_mode .orientation_button {
    display: flex;
    border: 2px solid var(--primary);
    border-radius: 4px;
    padding: 1px;
}

.pade_mode .orientation_button input[type="radio"] {
    display: none;
}

.pade_mode .orientation_button input[type="radio"]:checked+.box {
    background-color: var(--primary);
}

.pade_mode .orientation_button input[type="radio"]:checked+.box span {
    color: white;
}

.pade_mode .orientation_button input[type="radio"]:checked+.box span:before {
    transform: translateY(0px);
    opacity: 1;
}

.pade_mode .orientation_button .box {
    width: auto;
    height: auto;
    background-color: white;
    transition: all 250ms ease;
    will-change: transition;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    font-weight: 900;
}

.pade_mode .orientation_button .box span {
    transition: all 300ms ease;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    font-weight: 400;
    user-select: none;
    color: #1c3366;
}

.pade_mode .orientation_button label {
    display: flex;
}

.pade_mode .orientation_button label:first-child .box {
    border-radius: 3px 0px 0 3px;
}

.pade_mode .orientation_button label:last-child .box {
    border-radius: 0 3px 3px 0;
}

.main {
    max-width: 842px;
    margin: 0 auto;
    /* about */
    /* metrics */
    /* estimation */
    /* estimation */
    /* component */
    /* table */
    /* analysis */
    /* losses */
    /* table */
}

.main section {
    margin: 24px 0;
    page-break-after: always;
}

.main .indicates {
    list-style: none;
    padding: 0;
    margin: 0;
}

.main .indicates li {
    display: flex;
    align-items: center;
}

.main .indicates li:not(:first-child) {
    margin-top: 12px;
}

.main .indicates li .color {
    width: 22px;
    height: 22px;
    border-radius: 2px;
    display: inline-block;
    margin-right: 6px;
}

.main .indicates li .color_gray {
    background-color: #cccccc;
}

.main .indicates li .color_orange {
    background-color: #999999;
}

.main .indicates li .color_lightblue {
    background-color: #d7e1f8;
}

.main .touch_list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.main .touch_list li {
    display: flex;
    align-items: center;
    margin-top: 16px;
}

.main .touch_list li .icon {
    width: 24px;
    height: 24px;
    border-radius: 2px;
    background: var(--danger);
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    margin-right: 4px;
}

.main .touch_list li .icon img {
    display: flex;
    max-height: 16px;
}

.main .touch_list li .text {
    font-weight: 14px;
    color: var(--step-200);
}

.main .touch_list li.mail .icon {
    background-color: #f8d6ce;
}

.main .touch_list li.phone .icon {
    background-color: #d7e1f8;
}

.main .touch_list li.web .icon {
    background-color: #cccccc;
}

.main .main_header {
    background: var(--secondary-1);
    padding: 22px 32px;
    display: flex;
    color: var(--white);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100px;

}

.main .main_header .header_title {
    width: 75%;
}

.main .main_header .header_title h3 {
    font-size: 24px;
    font-weight: bold;
    color: var(--step-250);
}

.main .main_header .header_title p {
    font-size: 12px;
    color: var(--step-250);
    margin: 4px 0 0;
    line-height: 16px;
}

.main .main_header .header_logo img {
    max-width: 120px;
    max-height: 50px;
}

.main .metrics_list {
    margin: 0 -12px;
    padding: 0;
    display: flex;
    justify-content: space-between;
}

.main .metrics_list li {
    width: calc(100% / 3);
    padding: 0 12px;
    max-width: 250px;
}

.main .metrics_list li .icons img {
    max-height: 44px;
}

.main .metrics_list li .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--step-200);
    margin-top: 8px;
}

.main .metrics_list li .bar {
    height: 8px;
    background: var(--light-gray);
    border-radius: 10px;
    margin: 8px 0;
}

.main .metrics_list li .values .values_text {
    font-size: 20px;
    color: var(--step-250);
    font-weight: bold;
}

.main .metrics_list li .values .sub_text {
    display: block;
    font-size: 12px;
    font-weight: 400;
    color: var(--step-250);
    margin-top: 4px;
}

.main .detailed_info {
    background-color: #f0f3f8;
    padding: 12px 24px;
    border-radius: 8px;
}

.main .detailed_info .info_list {
    list-style: none;
    margin: 0 -12px;
    display: flex;
    flex-wrap: wrap;
    padding: 12px;
}

.main .detailed_info .info_list li {
    width: calc(100% / 3);
    padding: 8px 12px;
}

.info_list>li:before{
    display: none;
}

.main .detailed_info .info_list li .info_inside_details {
    background-color: #fcefeb;
    padding: 12px 16px;
    border-radius: 4px;
    height: 100%;
}

.main .detailed_info .info_list li:nth-child(2n + 1) .info_inside_details {
    background-color: #eff3fc;
}

.main .detailed_info .info_list li:nth-child(3n + 1) .info_inside_details {
    background-color: #ebebeb;
}

.main .detailed_info .info_list li h5 {
    color: #1c3366;
    font-size: 14px;
}

.main .detailed_info .info_list li .value {
    font-size: 14px;
    margin-top: 8px;
    color: var(--step-250);
}

.main .detailed_info .info_inside:not(:first-child) {
    border-top: 1px solid var(--step-150);
    margin-top: 14px;
    padding-top: 14px;
}

.main .footer {
    padding: 24px;
    border-top: 1px solid var(--step-100);
    display: flex;
    justify-content: space-between;
    color: var(--step-200);
    font-size: 14px;
    background-color: #fff;
    max-height: 81px;
    overflow: hidden;
}

.main .footer .left {
    font-weight: 600;
    word-wrap: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
     display: -webkit-box;
     max-height: 34px;
     max-width: 45%;
}

.main .footer .right {
    display: inline-flex;
    align-items: right;
    max-height: 32px;
}

.main .footer .right .gen_text {
    margin-right: 8px;
    padding-right: 12px;
    position: relative;
    font-size: 12px;
    line-height: 1.3;
    text-align: right;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.main .footer .right .gen_text:after {
    content: '';
    width: 1px;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    background: var(--step-150);
}

.main .footer .g_logo {
  height: 30px;
  margin-left: 0px;
}

.main .common_inside {
    height: 413px;
    background-color: #fff;
}

.main .panel_card {
    border-radius: 6px;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.main .panel_card .card_content {
    padding: 16px;
    border: 2px solid;
    border-radius: 0 0 6px 6px;
    flex-grow: 1;
}

.main .panel_card .card_content .value {
    font-size: 22px;
    color: var(--step-250);
    font-weight: 600;
}

.main .panel_card .card_content .subvalue {
    font-size: 12px;
    color: var(--step-250);
    margin-top: 4px;
}

.main .panel_card .card_head {
    display: flex;
    padding: 8px 16px;
}

.main .panel_card .card_head .icons {
    margin-right: 12px;
}

.main .panel_card .card_head .icons img {
    width: 24px;
}

.main .panel_card .card_head h3 {
    font-size: 17px;
    margin: 0;
    color: var(--step-250);
}

.main .panel_card.light_red .card_head {
    background: #f8d6ce;
}

.main .panel_card.light_red .card_content {
    border-color: #f8d6ce;
}

.main .panel_card.light_blue .card_head {
    background: #d7e1f8;
}

.main .panel_card.light_blue .card_content {
    border-color: #d7e1f8;
}

.main .panel_card.light_gray .card_head {
    background: #cccccc;
}

.main .panel_card.light_gray .card_content {
    border-color: #cccccc;
}

.main .landing_section {
    background: url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 100px);
    background-color: var(--white);
    /* margin-top: 4px; */
    border: 1px solid var(--step-100);
    /* .footer {
      padding: 24px 32px;
      border-top: 1px solid var(--tertiary);
      display: flex;
      justify-content: space-between;
      color: var(--white);
      font-size: 14px;
      .right {
        display: inline-flex;
        align-items: center;
      }
      .g_logo {
        max-height: 24px;
        max-width: 200px;
        margin-left: 10px;
      }
    } */
}

.main .landing_section .content_section {
    padding: 0 32px 24px;
    height: 512px;
}

.main .landing_section .content_section h1 {
    margin: 0;
    color: var(--step-250);
    font-size: 32px;
    font-weight: bold;
}

.main .landing_section .content_section .sub_text {
    color: var(--step-250);
    font-size: 24px;
    font-weight: bold;
}

.main .landing_section .content_section .address {
    font-size: 18px;
    color: var(--step-250);
    margin-top: 16px;
    max-width: 300px;
    line-height: 1.6;
}

.main .landing_section .content_section .button_area {
    margin-top: 10px;
}

.main .landing_section .content_section .button_area .btn {
    border: 0;   
    color: #1c3366;
    background: #f8d6ce;
    font-weight: bold;
    font-size: 16px;
}

.main .landing_section .content_section .flex_box {
    display: flex;
}

.main .landing_section .content_section .flex_box .left_area {
    max-width: 400px;
    padding-right: 24px;
    width: 50%;
}

.main .landing_section .content_section .flex_box .left_area .image_area {
    background-color: #f8d6ce;
    border-radius: 0 0 40px 40px;
    overflow: hidden;
    position: relative;
    text-align: center;
    display: inline-block;
    height: 100%;
    display: flex;
    align-items: center;
    /* 21/12/2021 */
}

.main .landing_section .content_section .flex_box .left_area .image_area .pseudo_color {
    width: 100%;
    height: 50%;
    background-color: #d7e1f8;
    bottom: -4px;
    left: 0;
    position: absolute;
}

.main .landing_section .content_section .flex_box .left_area .image_area:before {
    content: "";
    width: 100%;
    height: 14px;
    background-color: var(--white);
    top: calc(50% - 7px);
    left: 0;
    position: absolute;
    z-index: 1;
}

.main .landing_section .content_section .flex_box .left_area .image_area .figure {
    border-radius: 50%;
    padding: 18px;
    position: relative;
    z-index: 1;
}

.main .landing_section .content_section .flex_box .left_area .image_area .figure img {
    width: 320px;
    height: 320px;
    object-fit: cover;
    background-color: var(--white);
    padding: 10px;
    border-radius: 50%;
    min-height: 300px;
    min-width: 250px;
}

.main .landing_section .content_section .flex_box .right_area {
    flex-grow: 1;
    padding: 16px 0;
    /*   .button_area {
            display: none;
          } */
    width: 50%;
}

.main .landing_section .content_section .flex_box .right_area h1 {
    margin-top: 30px;
}

.main .landing_section .content_section .flex_box .right_area .index_logo {
    text-align: right;
}

.main .landing_section .content_section .flex_box .right_area .index_logo img{
  max-width: 150px;
  max-height: 65px;
}

.main .landing_section .content_section .flex_box .right_area .figure {
    background: var(--white);
    padding: 4px;
    border-radius: 12px;
}

.main .landing_section .content_section .flex_box .right_area .figure img {
    border-radius: 10px;
    display: flex;
    width: 100%;
    height: 290px;
    object-fit: cover;
}

.main .about_section {
    border: 1px solid var(--step-100);
    background: url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 100px), url(./assets/img/dots.png) no-repeat 32px calc(100% - 158px);
    background-color: var(--white);
}

.main .about_section .flex_box {
    display: flex;
    width: 100%;
    background-color: #fff;
    background: url(./assets/img/dots.png) no-repeat 4% calc(74%), url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 20px), white;
}

.main .about_section .flex_box .left_section {
    width: 54%;
    height: 512px;
    align-items: center;
    margin-left: -1px;
    padding-left: 32px;
}

.main .about_section .flex_box .left_section .content_section {
    background-color: #d7e1f8;
    border-radius: 0 0 30px 30px;
    overflow: hidden;
    position: relative;
    padding: 40px 32px 32px;
}

.main .about_section .flex_box .left_section .content_section .about_head {
    display: flex;
    align-items: center;
}

.main .about_section .flex_box .left_section .content_section .about_head .company_logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--white);
    margin-right: 12px;
}

.main .about_section .flex_box .left_section .content_section .about_head .company_logo img {
    max-width: 100%;
}

.main .about_section .flex_box .left_section .content_section .about_head .about_title {
    font-size: 32px;
    font-weight: bold;
}

.main .about_section .flex_box .left_section .content_section p {
    font-size: 12px;
    line-height: 1.6;
    margin: 24px 0 0;
    word-break: break-word;
    white-space: pre-wrap;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 9;
    -webkit-box-orient: vertical;
}


.main .about_section .flex_box .right_section {
    width: 46%;
    padding: 32px 32px 32px 42px;
}

.main .about_section .flex_box .right_section .about_logo {
    text-align: right;
}

.main .about_section .flex_box .right_section .about_logo img {
  max-width: 120px;
  max-height: 50px;
}

.main .about_section .flex_box .right_section .content {
    margin-top: 60px;
}

.main .metrics_section {
    border: 1px solid var(--step-100);
}

.main .metrics_section .metrics_data .cards_list {
    margin: 0 -12px;
    display: flex;
}

.main .metrics_section .metrics_data .cards_list li {
    padding: 0 12px;
    width: calc(100% / 3);
    display: flex;
}

.main .metrics_section .module_content {
    height: 220px;
    background-color: #fff;
}

.main .metrics_section .common_inside {
    height: 413px;
}

.main .metrics_section .metrics_data {
    padding: 8px 32px 32px 32px;
    /* 21/12/2021 */
    min-height: 249px;
}

.main .metrics_section .heightEstSav {
  height: 274px;
}

.main .metrics_section .detailed_info {
    margin-top: 0;
    padding: 0;
    background-color: var(--white);
}

.main .metrics_section .detailed_info.mt-3 {
    margin-top: 16px;
}

.main .metrics_section .metrics_cards {
    padding: 40px 32px 0px 32px;
    min-height: 139px;
    background-color: #fff;
}

.main .metrics_section .metrics_cards .cards_list {
    margin: 0 -12px;
    display: flex;
}

.main .metrics_section .metrics_cards .cards_list li {
    padding: 0 12px;
    width: calc(100% / 3);
    display: flex;
}

/* .main .estimation_section {
    border: 1px solid var(--step-100);
} */

.main .estimation_section .common_inside {
    height: 413px;
    background-color: #fff;
}

.main .estimation_section .metrics_data {
    padding: 24px 32px;
}

.main .estimation_section .savings_graph {
    margin-top: 0;
    background: #f0f3f8;
    border-radius: 8px;
    padding: 16px 8px;
    
}

.main .estimation_section .savings_graph .title {
    font-size: 16px;
    color: #1c3366;   
    font-weight: 600;
    margin-left: 16px;
    text-align: center;
}

.main .estimation_section .savings_graph .graph_area {
    margin-top: 8px;
    position: relative;
}

.main .estimation_section .savings_item {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    margin: 0 -12px;
    justify-content: space-between;
}

.main .estimation_section .savings_item li {
    padding: 0 12px;
    min-width: 120px;
    margin-top: 8px;
}

.main .estimation_section .savings_item li .title {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
}

.main .estimation_section .savings_item li .values {
    font-size: 14px;
    color: var(250);
    margin-top: 4px;
}

.main .estimation_section .metrics_list li .title {
    margin: 0;
}

.main .estimation_section .metrics_list li .values {
    margin-top: 8px;
}

.main .production_section {
    border: 1px solid var(--step-100);
}

.main .production_section .metrics_data {
    /* padding: 16px 32px; */
    padding: 0px 32px;
}

.main .production_section .savings_graph {
    margin-top: 24px;
    background-color: #f0f3f8;
    padding: 0px 16px;
    border-radius: 8px;
    /* height: 300px; */
    padding-top: 16px;
}

.main .production_section .savings_graph .title {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
}

.main .production_section .savings_graph .graph_area {
    margin-top: 8px;
}

.main .production_section .savings_graph .graph_area img {
    max-width: 94%;
}

.main .production_section .savings_item {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    margin: 0 -12px;
    justify-content: space-between;
}

.main .production_section .savings_item li {
    padding: 0 12px;
    min-width: 120px;
    margin-top: 12px;
    width: calc(100% / 2);
}

.main .production_section .savings_item li .title {
    font-size: 14px;
    color: var(250);
}

.main .production_section .savings_item li .values {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
    margin-top: 4px;
}

.main .component_section {
    border: 1px solid var(--step-100);
}

.main .component_section .component_inside {
    padding: 16px 32px;
}

.main .component_section .component_inside .row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -12px;
}

.main .component_section .component_inside .row .col {
    width: calc(100% / 2);
    padding: 0 12px;
}

.main .component_section .component_items {
    display: flex;
    border: 1px solid var(--step-100);
    padding: 12px;
    border-radius: 4px;
    margin: 12px 0;
    flex: 0 0 48%;
}

.main .component_section .component_items .component_info {
    max-width: 270px;
}

.main .component_section .component_items .component_info h5 {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
    margin: 0 0 4px;
}

.main .component_section .component_items .component_info .detailed_text {
    font-size: 12px;
    color: var(--step-250);
    word-break: break-word;
    display: inline-block;
    flex-wrap: wrap;
}

.main .component_section .component_items .component_info .detailed_text .componentMake{
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    display: inline;
}

.main .component_section .component_items .component_info .detailed_text:not(:last-child) {
    margin-bottom: 12px;
}

.main .component_section .component_items .icon {
    width: 40px;
    min-width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 2px;
    background: var(--danger);
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.main .component_section .component_items .icon.light_blue {
    background-color: #d7e1f8;
}

.main .component_section .component_items .icon.light_gray {
    background-color: #ebebeb;
}

.main .component_section .component_items .icon.light_red {
    background-color: #f8d6ce;
}

.main .component_section .component_items .icon img {
    display: flex;
    max-height: 24px;
}

.main .table_info {
    border: 1px solid var(--step-100);
}

.main .table_info .common_inside {
    /* height: 425px; */
}

.main .table_info .table_inside {
    padding: 24px 32px;
}

.main .analysis_section {
    border: 1px solid var(--step-100);
}

.main .analysis_section .common_inside {
    /* height: 425px; */
}

.main .analysis_section .analysis_inside {
    padding: 16px 32px;
}

.main .analysis_section .analysis_inside .conclusion {
    font-size: 14px;
    color: var(--step-250);
    margin-top: 0px;
}

.main .analysis_section .analysis_inside .row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.main .analysis_section .analysis_inside .row .col {
    padding: 12px 0px;
}

.main .analysis_section .analysis_inside .row .col .time {
    font-size: 16px;
    color: var(--step-250);
    font-weight: 600;
}

.main .analysis_section .analysis_inside .row .col .analysis_fig {
    margin: 12px 0 0;
}

.main .analysis_section .analysis_inside .row .col .analysis_fig img {
    width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
    display: flex;
}

.main .losses_graph_section {
    border: 1px solid var(--step-100);
}

.main .losses_graph_section .losses_graph_inside {
    /* padding: 24px 32px; */
    padding: 0px 32px;
    /* background: yellow; */
}

.main .losses_graph_section .losses_graph_inside .graph_box {
    height: 100%;
    width: 100%;
    background: #f0f3f8;
    border-radius: 8px;
}

.main .losses_graph_section .losses_graph_inside .graph_box .lossBarChart {
    height: 100%;
}

.main .losses_graph_section .losses_graph_inside .graph_box .lossBarChart #horizontalbar-chart {
    height: 100% !important;
}

.main .losses_graph_section .losses_graph_inside .row {
    display: flex;
    margin: 0 -12px;
    height: 100%;
}

.main .losses_graph_section .losses_graph_inside .row .col {
    padding: 0 12px;
}

.main .losses_graph_section .losses_graph_inside .row .col:not(.col_list) {
    flex-grow: 1;
}

.main .losses_graph_section .losses_graph_inside .row .col_list {
    width: 150px;
}

.main .losses_graph_section .losses_graph_inside .row .col .graph_box {
    background-color: #f0f3f8;
    padding: 0px 24px;
    border-radius: 8px;
    height: 100%;
}

.main .losses_graph_section .losses_graph_inside .row .col .graph_box .lossBarChart {
    /* background-color: #f0f3f8;
    padding: 24px;
    border-radius: 8px; */
    height: 100%;
}

.main .losses_graph_section .losses_graph_inside .row .col .graph_box .lossBarChart #horizontalbar-chart {
    display: block !important;
    width: 578px !important;
    /* height: 400px !important; */
    height: 100% !important;
}

.main .cost_section {
    border: 1px solid var(--step-100);
}

.main .cost_section .cast_graph {
    /* padding: 32px; */
    padding: 16px 24px;
}

.main .cost_section .cast_graph .savings_graph {
    /* margin-top: 16px; */
    background-color: #f0f3f8;
    padding: 16px;
    border-radius: 8px;
}

.main .cost_section .cast_graph .savings_graph .title {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
}

.main .cost_section .cast_graph .savings_graph .graph_area {
    margin-top: 8px;
}

.main .cost_section .cast_graph .savings_graph .graph_area .indicates {
    display: flex;
    flex-wrap: wrap;
    margin-left: 70px;
}


.main .cost_section .cast_graph .savings_graph .graph_area .indicates li {
    margin-top: 4px;
}

.main .cost_section .cast_graph .savings_graph .graph_area .indicates li:not(:last-child) {
    margin-right: 14px;
}

.main .estimation_section  .savings_graph .graph_area .indicates li {
    margin-top: 4px;
}

.main .estimation_section  .savings_graph .graph_area .indicates li:not(:last-child) {
    margin-right: 14px;
}

/* .main .estimation_section {
    border: 1px solid var(--step-100);
} */

.main .estimation_section .cast_graph {
    /* padding: 32px; */
    padding: 16px 24px;
}

.main .estimation_section .cast_graph .savings_graph {
    /* margin-top: 16px; */
    background-color: #f0f3f8;
    padding: 16px;
    border-radius: 8px;
}

.main .estimation_section .cast_graph .savings_graph .title {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
}

.main .estimation_section  .savings_graph .graph_area {
    margin-top: 8px;
}

.main .estimation_section  .savings_graph .graph_area .indicates {
    display: flex;
    flex-wrap: wrap;
    margin-left: 70px;
}

.main .production_section  .savings_graph .graph_area .indicates li {
    margin-top: 4px;
}

.main .production_section  .savings_graph .graph_area .indicates li:not(:last-child) {
    margin-right: 14px;
}

.main .production_section {
    border: 1px solid var(--step-100);
}

.main .production_section .cast_graph {
    /* padding: 32px; */
    padding: 16px 24px;
}

.main .production_section .cast_graph .savings_graph {
    /* margin-top: 16px; */
    background-color: #f0f3f8;
    padding: 16px;
    border-radius: 8px;
}

.main .production_section .cast_graph .savings_graph .title {
    font-size: 16px;
    color: #1c3366;
    font-weight: 600;
}

.main .production_section  .savings_graph .graph_area {
    margin-top: 8px;
}

.main .production_section  .savings_graph .graph_area .indicates {
    display: flex;
    flex-wrap: wrap;
    margin-left: 70px;
}

.main .thanks_section {
    background-color: var(--white);
    border: 1px solid var(--step-100);
    border-bottom: 6px solid var(--primary);
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main .thanks_section .thanks_inside {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 524px;
}

.main .thanks_section .thanks_inside .thnkUDskTp{
    font-size: 32px;
    font-weight: 800;
    color: #1c3366;
    margin: 0;
    text-align: center;
}

.thnkUMD{
  display: none;
}

.main .thanks_section .thanks_inside .thanks_content {
    display: flex;
    align-items: center;
    margin-top: 12px;
}

.main .thanks_section .thanks_inside .thanks_content .thanks_logo {
    text-align: right;
    padding-right: 24px;
}

.main .thanks_section .thanks_inside .thanks_content .thanks_logo img{
    max-width: 200px;
    max-height: 200px;
}

.main .thanks_section .thanks_inside .thanks_content .touch_list {
    border-left: 2px solid #222;
    padding: 0 0 16px 24px;
}

.main.portrait_controller {
    width: 595px;
    /* about */
    /* estimation */
    /* analysis */
    /* losses */
    /*  */
    /* table */
    /* thanks */
}

.main.portrait_controller .panel_card .card_head h3 {
    font-size: 12px;
}

.main.portrait_controller .panel_card .card_content .value {
    font-size: 16px;
}

.main.portrait_controller .common_inside {
    height: 659px;
}

.main.portrait_controller .landing_section {
  background: url(./assets/img/dots.png) no-repeat 70% calc(40% - 11px), url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 100px);
    background-color: var(--white);
    position: relative;
}

.main.portrait_controller .landing_section .header {
    padding: 24px 32px 8px;
}

.main.portrait_controller .landing_section .content_section {
    padding: 0 32px 24px;
    height: 759px;
}

.main.portrait_controller .landing_section .content_section .address {
    max-width: 100%;
}

.main.portrait_controller .landing_section .content_section .flex_box {
    flex-wrap: wrap;
}

.main.portrait_controller .landing_section .content_section .flex_box .left_area {
    max-width: 100%;
    padding-right: 0;
    margin-top: 32px;
    /* margin-left: -32px; */
    width: 70%;
}

.main.portrait_controller .landing_section .content_section .flex_box .left_area .image_area {
    border-radius: 0 40px 40px 0;
    /* 21/12/2021 */
}

.main.portrait_controller .landing_section .content_section .flex_box .left_area .image_area .pseudo_color {
    width: 50%;
    height: 100%;
    left: auto;
    right: 0;
    bottom: 0;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area {
    margin-top: 4px;
    width: 100%;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area h1 {
    margin-top: 0;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .index_logo {
    position: absolute;
    top: 32px;
    right: 32px;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .index_logo img {
  max-width: 150px;
  max-height: 60px;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .figure {
    max-width: 420px;
    margin: 0 auto;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .figure img {
    height: 320px;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .button_area {
    display: block;
    margin-top: 12px;
}

.main.portrait_controller .about_section {
    position: relative;
    display: flex;
    flex-direction: column;
    background: url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 100px);
    background-color: #fff;
}

.main.portrait_controller .about_section .flex_box {
  background: url(./assets/img/dots.png) no-repeat calc(100% - 16px) calc(100% - 20px);
  flex-grow: 1;
  flex-wrap: wrap;
  }

.main.portrait_controller .about_section .flex_box .left_section {
    width: 100%;
    min-height: unset;
    padding: 0 48px 0 0;
    height: auto;
}

.main.portrait_controller .about_section .flex_box .left_section .content_section {
    padding: 48px;
    border-radius: 0 30px 30px 0;
}

.main.portrait_controller .about_section .flex_box .right_section {
    width: 100%;
    padding: 48px 32px;
    display: block;
    height: 327px;
}

.main.portrait_controller .about_section .flex_box .right_section .about_logo {
    position: absolute;
    top: 32px;
    right: 32px;
}

.main.portrait_controller .about_section .flex_box .right_section .about_logo {
  max-width: 120px;
}

.main.portrait_controller .about_section .flex_box .right_section .content {
    margin-top: 0;
}

.main.portrait_controller .about_section .flex_box .right_section .touch_list {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

.main.portrait_controller .about_section .flex_box .right_section .touch_list li {
    width: 45%;
}

.main.portrait_controller .estimation_section .common_inside {
    height: 659px;
}

.main.portrait_controller .estimation_section .savings_item {
    justify-content: unset;
}

.main.portrait_controller .estimation_section .savings_item li {
    width: calc(100% / 3);
}

.main.portrait_controller .metrics_list li .title {
    font-size: 14px;
}

.main.portrait_controller .metrics_list li .values .values_text {
    font-size: 20px;
}

.main.portrait_controller .analysis_section .common_inside {
    height: 659px;
}

.main.portrait_controller .analysis_section .analysis_inside .row .col .analysis_fig img {
    height: 250px;
    width: 250px;
}

.main.portrait_controller .losses_graph_section .common_inside {
    height: 660px;
    /* padding: 30px 0px; */

}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row {
    flex-wrap: wrap;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row .col {
    padding: 0 12px;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row .col:not(.col_list) {
    flex-grow: 1;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row .col_list {
    width: 100%;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row .col .indicates {
    display: flex;
    flex-wrap: wrap;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row .col .indicates li {
    margin: 12px 12px 0 0;
    min-width: 60px;
}

.main.portrait_controller .metrics_section .common_inside {
    height: 659px;
}

.main.portrait_controller .metrics_section .metrics_cards {
    min-height: 173px;
}

.main.portrait_controller .metrics_section .module_content {
    height: 486px;
    padding-top: 0px;
}

.main.portrait_controller .metrics_section .metrics_data .metrics_list.metrics_list2 li .title {
    min-height: 40px;
}

.main.portrait_controller .metrics_section .detailed_info .info_list {
    flex-wrap: wrap;
    padding-top: 0px;
}

.main.portrait_controller .metrics_section .detailed_info .info_list li {
    width: calc(100% / 2);
}

.main.portrait_controller .table_info .common_inside {
    height: 659px;
}

.main.portrait_controller .table_info .table_section table td,
.main.portrait_controller .table_info .table_section table th {
    padding: 6px;
    font-size: 10px;
}

.main.portrait_controller .thanks_section .common_inside {
    height: 771px;
}


.incentivesContainer {
    height: 100%;
    margin-top: -16px;
}

.incentivesDetails:nth-child(even) {
    border-radius: 2px;
    background-color: #f0f3f8;
}

.incentivesDetails {
    padding: 21px 17px;
}


.incentiveContent {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
    margin-right: 0px !important;
}

.incentivesDetails:nth-child(odd){
        margin-right: inherit !important;
    }

    .primaryColorBackground {
    background-color: var(--primary) !important;
}

.secondaryColorBackground {
    background-color: var(--secondary) !important;
}

.tertiaryColorBackground {
    background-color: var(--tertiary) !important;
}

.primaryColor{
  color: #1c3366 !important;
}

.secondaryColor{
  color: #1c3366 !important;
}

.tertiaryColor{
  color: #1c3366 !important;
}

.main .widthPages {
  height: 595px !important;
}

.main.portrait_controller .widthPages {
  height: 842px !important;
}

.monthly_table {
    display: flex;
    flex-direction: column;
    row-gap: 1em;
    width: 100%;
    border-radius: 4px;
    border-collapse: separate;
    background-color: #f0f3f8;
    border: 1px solid var(--step-100);
  }
  
  .monthly_table tr {
    display: flex;
  }
  
  .table_info .monthly_table th, .table_info .monthly_table td {
    width: 12.5%;
    padding: 0;
    border: 0;
    color: var(--step-250);
    background-image: none;
    font-size: 10px;
    word-wrap: break-word;
  }

  .table_info .monthly_table th {
    color: #1c3366;
  }
  
  .monthly_table_body{
    display: flex;
    padding: 0 8px 8px;
    flex-direction: column;
    row-gap: 0.6em;
  }
  
  .monthly_table_head {
    display: block;
    padding: 8px;
    text-align: left;
    color: var(--primary);
    font-weight: 600;
    border-bottom: 1px solid var(--step-100);
  }
  
  .monthly_table_footer{
    display: block;
    padding: 8px;
    border-top: 1px solid var(--step-100);
    font-weight: 600;
  }

  .incentiveHeading {
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

#field_segment_table table tbody tr td:nth-child(2),
#field_segment_table table thead tr th:nth-child(2) {
  padding-left: 6px;
}
#field_segment_table table tbody tr td:nth-child(3),
#field_segment_table table thead tr th:nth-child(3) {
  padding-left: 14px;
}

.contentContCO {
  margin-bottom: 16px;
}

.contentCO {
  font-size: 14px;
  color: #222;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-line;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  padding: 0px;
}


.main.portrait_controller .contentCO {
  font-size: 14px;
  color: #222;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-line;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 18;
  -webkit-box-orient: vertical;
}

.headingCO {
  color: #263342;
  font-size: 17px;
  font-weight: bold;
}

.imgContainerCO {
  display: grid;
  grid-template-columns: 100%;
  gap: 16px;
  margin-top: 8px;
}


.imgContCO {
  display: grid;
  grid-template-columns: 165px auto;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.imgCO {
  width: 165px;
  height: 165px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.imgContentCO {
  font-size: 16px;
  color: #263342;
  font-weight: 600;
}


.imgDescCO {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  margin-top: 8px;
}

.ourTeamContOT:nth-child(2n) {
    border-radius: 2px;
    background-color: #f0f3f8;
}

.ourTeamContOT {
    display: flex;
    align-items: flex-start;
    padding: 10px;
}

.imgOT {
    width: 65px;
    height: 65px;
    margin-right: 16px;
    object-fit: cover;
    object-position: center;
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-top: 2px;
}

.nameOT {
    font-size: 16px;
    font-weight: bold;
    color: #263342;
    margin: 0px 0px 8px 0px;
    word-break: break-word;
}

.valueOT {
    font-size: 13px;
    font-weight: 100;
    color: #222;
    word-break: break-word;
    margin: 0px 0px 8px 0px;
    line-height: 1.4;
}

.quesFAQ {
    font-size: 14px;
    font-weight: 600;
    word-break: break-word;
    margin: 0px 0px;
}

.ansFAQ {
    color: #777777;
    font-size: 14px;
    margin: 0px;
    word-break: break-word;
    line-height: 1.4;
}


.ansFlexFAQ {
    display: flex;
    align-items: baseline;
    margin-bottom: 8px;
}

.huihuiFAQ {
    font-size: 14px;
    font-weight: 600;
    margin: 0px;
    overflow: initial;
}

.huihuiAnsFAQ {
    color: #777;
    font-weight: 600;
    font-size: 14px;
    margin: 0px;
    overflow: initial;
}

.dotPositionFAQ {
    list-style-position: outside;
    padding-left: 24px;
    margin: 0px 0px 8px 0px;
}

.liAnsFAQ {
    font-size: 14px;
    font-weight: 500;
    word-break: break-word;
    color: #777777;
    margin-left: 24px;
    margin-bottom: 8px;
}

.liAnsFAQ::marker {
    color: #222;
    font-size: 16px;
}

.qansFAQ {
    margin: 10px 0px 12px 0px;
    color: #ccc;
    opacity: 0.5;
}

.liHrFAQ {
    margin-top: 12px;
}

.containerBS {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.iconsContBS {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #999;
  padding-bottom: 16px;
}

.thunderIcon {
  width: 38px;
}

.tbcContentBS {
  font-size: 18px;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.tbcValueBS {
  font-size: 24px;
  font-weight: bold;
  color: #222;
}


.backupContentBS {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
  margin-top: 12px;
}


.footerContBS {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 16px;
  align-items: center;
  word-break: break-word;
  margin-bottom: 20px;
}

.boxOneBS,
.boxTwoBS {
  padding: 12px 12px;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  align-items: center;
  height: 85px;
  gap: 8px;
}

.boxOneColorBS {
  background-color: #fcefeb;
}

.boxTwoColorBS {
  background-color: #eff3fc;
}

.boxThreeColorBS {
  background-color: #ebebeb;
}

.dAndHrsBS {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.strgBS {
  font-size: 12px;
  color: #222;
  line-height: 1.5;
}

.cloudImgBS {
  width: 50px;
}

.ftrIconsBS{
  margin-bottom: 4px;
}


#customersSDS {
    width: 100%;
    border-collapse: collapse;
}

.tableHeaderSDS {
    color: #1c3366;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    vertical-align: baseline;
    border-bottom: 1px solid #999;
    border-top: 1px solid #999;
}

.tableHeaderWidthSDS {
    padding: 10px 16px;
    white-space: nowrap;
}

.oneHead {
    padding: 10px 8px 10px 0px;
}

.twoHead {
    padding: 10px 8px;
}

.threeHead {
    padding: 10px 8px;
}

.fourHead {
    padding: 10px 16px 10px 8px;
}

.tablevalueSDS {
  border-bottom: 1px solid #999;
}

.tablevalueWidthSDS {
    word-break: break-word;
    padding-left: 16px;
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 13px;

}

.firTbleBS {
    width: 30%;
    padding: 10px 8px 10px 0px;
}

.secTbleBS {
    width: 32%;
    padding: 10px 8px;
}

.thrTbleBS {
  padding: 10px 8px;
}

.frTbleBS {
    width: 18%;
    padding: 10px 16px 10px 8px;
}

.containerSP {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.columnSP,
.paddingColumnSP,
.totalColumnSP,
.totalLastColumnSP {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background-color: #fcefeb;
  padding: 8px 16px;
  min-height: 40px;
}

.paddingColumnSP {
  padding-left: 40px;
  min-height: 24px;
  background-color: #fff;
}

.labelSP,
.valSP,
.labelSPBlue {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.labelSPBlue {
  color: #409eff;
}

.totalColumnSP {
  border-top: 2px solid #409eff;
  background-color: #fff;
}

.totalLastColumnSP {
  border-top: 2px solid #ccc;
  background-color: #fff;
}
  
</style>

<style lang="scss" scoped>
    .puppeteer_classes {
    .table_info .monthly_table th, .table_info .monthly_table td {
    font-size: 8px;
    word-wrap: break-word;
  } 
    }

  .media_queries {

    @media (max-width: 590px) {
    .main {
        width: auto;
        margin: 0 auto;
    }

    .main.portrait_controller{
        width: auto;
        margin: 0 auto;
    }

    .main .widthPages {
      height: fit-content !important;
      min-height: 512px !important;
    }

    .main.portrait_controller .widthPages {
      height: fit-content !important;
      min-height: 512px !important;
    }

    .main .landing_section .content_section,
    .main .estimation_section .common_inside,
    .main .common_inside,
    .main .analysis_section .common_inside,
    .main .metrics_section .common_inside,
    .main .table_info .common_inside,
    .main.portrait_controller .common_inside,
    .main.portrait_controller .table_info .common_inside,
    .main.portrait_controller .analysis_section .common_inside{
        height: fit-content !important;
        min-height: 512px !important;
    }

    .main .metrics_section .metrics_cards,
    .main .landing_section .content_section,
    .main .metrics_section .metrics_data,
    .main .estimation_section .metrics_data,
    .main .component_section .component_inside,
    .main .production_section .metrics_data,
    .main .table_info .table_inside,
    .main .analysis_section .analysis_inside,
    .main .losses_graph_section .losses_graph_inside,
    .main .cost_section .cast_graph,
    .main .estimation_section .cast_graph,
    .main .thanks_section
    {
        padding: 24px 16px !important;
        background-color: #fff;
    }

    .main .metrics_section .module_content,
    .main.portrait_controller .metrics_section .module_content {
        height: auto;
    }

    .main .metrics_section .metrics_cards .cards_list,
    .main .component_section .component_inside .row,
    .main .analysis_section .analysis_inside .row,
    .main .losses_graph_section .losses_graph_inside .row,
    .main .metrics_section .metrics_data .cards_list{
        flex-direction: column;
        gap: 16px;
    }

    .main .metrics_section .metrics_cards .cards_list li,
    .main .detailed_info .info_list li,
    .main .component_section .component_inside .row .col,
    .main .analysis_section .analysis_inside .row .col,
    .main .metrics_section .metrics_data .cards_list li{
        width: 100%;
    }

    .incentivesDetails:nth-child(odd){
        margin: 0px;
    }

    .main .detailed_info .info_list{
        padding: 0px;
        margin: 0px;
    }

    

    .main .landing_section .content_section .flex_box .right_area .index_logo img {
        max-width: 100px;
        margin-top: -16px;
        max-height: 45px;
    }

  .main .about_section .flex_box .right_section .about_logo img {
      max-width: 100px;
    }

    .main.portrait_controller .about_section .flex_box .right_section .touch_list{
      gap: 16px;
    }

    .main .component_section .component_items{
      margin: 0px 0;
      flex: 0 0 100%;
    }

    .lossBarChart {
    height: 500px;
    pointer-events: none;
    /* width: 85vw; */
    /* width: 90%; */
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area{
  margin-top: 0px;
}

.main .landing_section .content_section{
  padding-top: 40px !important;
}

.table_section table thead {
     display: inherit;
}

.table_section table tbody {
    display: block;
    width: 100%;
}

.table_section table tbody tr {
    display: inherit;
    position: relative;
    background: var(--white);
    border: 1px solid var(--step-100);
    padding: 0px;
}

.table_section table td, #main.portrait_controller .table_info .table_section table th {
    width: 13.5% !important;
    font-size: 8px !important;
    padding: 3px !important;
}

#main.portrait_controller .table_info .table_section table td {
    padding: 6px !important;
    font-size: 7px !important;
}

.table_section table tbody tr:not(:last-child) {
    margin-bottom: 0px;
}

.table_section table thead tr th {
    font-size: 5.85px !important;
    width: 13.5% !important;
}

.main.portrait_controller .losses_graph_section .losses_graph_inside .row {
  flex-wrap: nowrap;
}

.main .main_header{
  padding: 24px 16px;
  gap: 8px;
  height: auto;
}

.main .main_header .header_logo img {
    max-width: 68px;
    max-height: 60px;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .index_logo img {
  max-width: 115px;
  max-height: 45px;
}


.main .footer {
    padding: 24px 16px
}

.main .thanks_section .thanks_inside .thanks_content .thanks_logo {    
      padding-right: 8px;
    }

.main .thanks_section .thanks_inside .thanks_content .thanks_logo img{
    min-width: 10px;
    max-width: 125px;
    max-height: 100px;
    padding-left: 10px;
}

.main .thanks_section .thanks_inside .thanks_content .touch_list {
    padding: 0 0 16px 8px;
}

.main.portrait_controller .about_section .flex_box .left_section .content_section {
  padding: 48px 16px;
}

.main.portrait_controller .about_section .flex_box .right_section{
  padding: 24px 16px;
}

.main.portrait_controller .about_section .flex_box .right_section .touch_list li{
  width: 100%;
}

.main.portrait_controller .analysis_section .analysis_inside .row .col .analysis_fig img{
  height: auto;
  width: auto;
  max-width: 300px;
  min-height: 300px;
}

.main.portrait_controller .landing_section .content_section .flex_box .right_area .index_logo,
.main.portrait_controller .about_section .flex_box .right_section .about_logo {
  right: 16px;
}

.main .metrics_section  .heightSysMet,
.main .metrics_section  .heightEstSav{
  padding-top: 0px !important;
}

.headingCO {
  text-align: center;
}

.imgContainerCO {
  grid-template-columns: 100%;
  justify-content: center;
}

.ourTeamContOT:nth-child(2n) {
    background-color: #fff;
}

.ourTeamContOT {
    display: flex;
    align-items: flex-start;
    padding: 0px;
    margin-bottom: 8px;
}


.imgContCO {
  grid-template-columns: 1fr;
  gap: 8px;
  text-align: center;
}

.imgCO {
  margin: auto;
}

}

  @media only screen and (max-width: 659px) {
  
  .table_info .monthly_table th, .table_info .monthly_table td {
    font-size: 1.5vw;
    word-wrap: break-word;
  }

  .tableHeaderSDS,
.tablevalueSDS {
  font-size: 10px;
}

.footerContBS {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .boxOneBS,
  .boxTwoBS {
    padding: 12px 16px;
    height: 75px;
    gap: 16px;
  }

  .tablevalueWidthSDS {
    font-size: 10px;
  }

  .iconsContBS {
    grid-template-columns: 1fr;
  }

  .paddingColumnSP {
    padding-left: 24px;
  }
}

  @media only screen and (max-width: 520px) {

.main.portrait_controller .landing_section .content_section .flex_box .left_area {
  width: 100%;
}

.main .thanks_section .thanks_inside .thnkUDskTp{ 
  display: none;
}

.thnkUMD {
  display: inherit;
  font-size: 32px;
  font-weight: 800;
  color: #1c3366;
  margin: 0;
  text-align: center;
}

.main .thanks_section .thanks_inside .thanks_content {
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    margin-top: 12px;
    flex-direction: column;
    margin-bottom: 80px;
}

.main .thanks_section .thanks_inside .thanks_content .touch_list {
  padding: 0px;
  border-left: none;
  font-size: 16px;
}

.main .thanks_section .thanks_inside .thanks_content .thanks_logo img {
    min-width: 10px;
    max-width: 140px;
    max-height: 140px;
    padding-left: 10px;
    padding-bottom: 12px;
}

.main .landing_section .content_section .flex_box .left_area .image_area .figure img {
  width: 273px;
  height: 273px;
  min-height: 250px;
  min-width: 250px;
}

.main .footer .right {
  display: none;
}

.main .footer .left {
  width: 100%;
}

  }

  }
</style>


<style>

.main .metrics_section .metrics_data {
  padding: 32px;
}
.main .estimation_section .metrics_data {
  padding: 24px 32px;
  height: 413px;
  min-height: 413px;
  background-color: #fff;
}

.main.portrait_controller .metrics_section .metrics_data .metrics_list.metrics_list2 li .title {
  min-height: 40px;
}

.main .metrics_section .metrics_data,
.main .estimation_section .metrics_data,
.main .common_inside,
.main .thanks_section,
.main .component_section .component_inside,
.main .landing_section .content_section,
.main .about_section .flex_box .left_section,
.main .about_section .flex_box .right_section {
  padding: 24px 16px !important;
}

.ourTeamContOT:nth-child(2n) {
    border-radius: 2px;
    background-color: #f0f3f8;
}

.ourTeamContOT{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: start;
    -ms-flex-align: start;
    align-items: flex-start;
    padding: 10px;
}

.main .common_inside {
    background-color: #fff !important;
}

.main .common_inside {
  background-color: #fff;
  height: 413px;
  min-height: 413px;
}

.main .estimation_section .common_inside {
  height: 413px;
  min-height: 413px;
} 


.main.portrait_controller .estimation_section .metrics_data {
    height: 659px;
}

.main .widthPages {
  height: 595px !important;
}

.main.portrait_controller .widthPages {
  height: 842px !important;
}

@media (max-width: 508px){
.main .metrics_section .metrics_data,
.main .estimation_section .metrics_data,
.main .common_inside,
.main .thanks_section,
.main .component_section .component_inside,
.main .landing_section .content_section,
.main .about_section .flex_box .left_section,
.main .about_section .flex_box .right_section {
  height: fit-content !important;
  min-height: 512px !important;
}  

.main .metrics_section.pagePuppeteer .metrics_data,
.main .estimation_section.pagePuppeteer .metrics_data,
.main .common_inside,
.main .thanks_section,
.main .component_section.pagePuppeteer .component_inside,
.main .landing_section.pagePuppeteer .content_section,
.main .about_section.pagePuppeteer .flex_box .left_section,
.main .about_section.pagePuppeteer .flex_box .right_section {
  height: 659px !important;
  min-height: 512px !important;
} 

.main .widthPages {
  height: fit-content !important;
  min-height: 512px !important;
}

.main.portrait_controller .widthPages {
  height: fit-content !important;
  min-height: 512px !important;
}
}

.main .pagePuppeteer {
  margin: 0px;
  width: 842px;
  height: 595px;
}


.main.portrait_controller .pagePuppeteer {
  width: 595px;
  height: 842px;
}

.main.portrait_controller .estimation_section.pagePuppeteer .metrics_data {
    height: 659px !important;
}

.main.portrait_controller .landing_section.pagePuppeteer .content_section {
    padding: 0 32px 24px;
    height: 759px !important;
}

.main.portrait_controller .metrics_section.pagePuppeteer .module_content {
    height: 486px !important;
    min-height: auto !important;
  }


</style>
