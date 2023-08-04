<template>
  <div class="parentClass reportLoaded" :class="isPuppeteer ? 'puppeteer_classes' : 'media_queries'">
    <main class="potrait_screen">
      <!-- --------------------------------------SolarProjectProposal------------------------------------ -->
      <div class="pageGap pagesHeight firstPage">
        <div class="imgContainerFP">
          <img
            src="./assests/img/Front Cover (4x8) w_ Gradient.png"
            class="imgFP"
          />
          <img :src="dataFromAPI.organisation_data.logo" class="logoFPLeft" />
          <img src="./assests/img/Union.png" class="logoFPRight" />
        </div>
        <div class="containerFP">
          <h3 class="headingFP">PowerGazebo™ Project Proposal</h3>
          <h4 class="subHeadingFP">{{dataFromAPI.gazebo_system_name}}</h4>
          <div class="gridFP">
            <div class="boxOneFP">
              <p class="prpFP">PREPARED FOR</p>
              <p class="nameFP"  v-html="projectNameFiltered(clientNameComputed)"></p>
              <p class="addrFP">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div class="boxTwoFP">
              <p class="prpFP">PREPARED BY</p>
              <p class="nameFP">{{ dataFromAPI.project_head.project_creator_name }}</p>
              <p class="roofFP">{{ dataFromAPI.organisation_data.name }}</p>
              <p class="mailFP">{{ dataFromAPI.organisation_data.email_id }}</p>
              <!-- <p class="licFP">State Lic. #</p> -->
            </div>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Company overview---------------------------------- -->

      <div class="pageGap pagesHeight">
        <!-- <div class="headerAll">
          <h2 class="headingAll">Company Overview</h2>
        </div> -->
        <Header heading="Company Overview" />
        <div class="containerAll">
          <!-- <h4 class="headingContCO">
            Our professional experts are certified and highly trained.<br
              class="brTag"
            />
            We are licensed, bonded and insured.
          </h4> -->
          <p class="contentCO" v-if="dataFromAPI.organisation_data.about_us" :style="[dataFromAPI.team_members.length > 3 ? {'-webkit-line-clamp': '7'} : {'-webkit-line-clamp': '17'}]">{{ dataFromAPI.organisation_data.about_us }}</p>

          <!-- <p class="contentCO" v-if="dataFromAPI.team_members.length < 4">This proposal provides a system summary and the costs associated with installing a {{dataFromAPI.gazebo_system_name}} at {{dataFromAPI.project_head.address}}.</p> -->
          <div class="ourTeamContainerCO">
            <h3 class="ourTeamHeadingCO">Our Team</h3>
            <!-- <p class="contentTwoCO">
              The cost of energy from private or municipal owned utilities rises
              every year, all while we face the challenges of maintaining a
              healthy environment. Your choice to install a solar photovoltaic
              energy system is a simple way to both reduce your environmental
              footprint and lower your monthly energy bills.
            </p> -->
            <div class="ourTeamImgContainerCO">
              <div class="imgContainerCO" v-for="(item, index) in dataFromAPI.team_members" :key="index">
                <img :src="item.image" class="imgCO" />
                <p class="captionCO">{{item.name}}</p>
                <p class="positionCO">{{item.position}}</p>
              </div>
              <!-- <div class="imgContainerCO">
                <img src="./assests/img/cooooo.png" class="imgCO" />
                <p class="captionCO">Janice Norton</p>
                <p class="positionCO">COO</p>
              </div>
              <div class="imgContainerCO">
                <img src="./assests/img/cooooo.png" class="imgCO" />
                <p class="captionCO">Jesse Miros</p>
                <p class="positionCO">Lead - SAN JOSE</p>
              </div> -->
            </div>
            <!-- <div class="footerAll">
              <div class="pageNo">
                <p class="pgNo">1</p>
              </div>
              <div class="powByCont">
                <p class="powBy">
                  Powered by <span class="boldTxt">SolarLabs 360</span>
                </p>
              </div>
            </div> -->
            <Footer pageNo="1" :companyName="companyName" />
          </div>
        </div>
      </div>

      <!-- ----------------------------------------PowerGazebo™ Value Proposition---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="PowerGazebo™ Value Proposition" />
        <div class="containerAll">
          <div class="gridContainerPG">
            <div class="boxPG">
              <img src="./assests/img/stars.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Unparalleled Aesthetics</h4>
                <p class="contPG">
                  PowerGazebo™ upgrades your yard or terrace into an opulent,
                  utiliatarian living space.
                </p>
              </div>
            </div>
            <div class="boxPG">
              <img src="./assests/img/Subtract.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Incredible Performance</h4>
                <p class="contPG">
                  PowerGazebo™ is engineered to offer great performance, while
                  ensuring your safety.
                </p>
              </div>
            </div>
            <div class="boxPG">
              <img src="./assests/img/cloud_circle.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Weather-proof Indeed</h4>
                <p class="contPG">
                  PowerGazebo™ is tested to withstand hail, snow, heavy rain and
                  high-speed winds.
                </p>
              </div>
            </div>
          </div>
          <div class="imgContainerPG">
            <img
              src="./assests/img/Value Proposition Background.png"
              class="backImgPG"
            />
            <img
              src="./assests/img/Value Proposition Image.png"
              class="frntImgPG"
            />
          </div>
          <div class="gridContainerPG">
            <div class="boxPG">
              <img src="./assests/img/shield.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Superior Safety</h4>
                <p class="contPG">
                  PowerGazebo™ ensures there is no high-voltage DC flowing
                  through any major cables.
                </p>
              </div>
            </div>
            <div class="boxPG">
              <img src="./assests/img/mountain.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Reliable and Robust</h4>
                <p class="contPG">
                  PowerGazebo™ is engineered with long-term reliability and
                  robustness in mind.
                </p>
              </div>
            </div>
            <div class="boxPG">
              <img src="./assests/img/offline_bolt.png" class="valProIconPG" />
              <div>
                <h4 class="headPG">Decades of Power</h4>
                <p class="contPG">
                  PowerGazebo™ provides an independent power-source for your
                  home, for decades to come.
                </p>
              </div>
            </div>
          </div>
          <Footer pageNo="2" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------System Layout & Details---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="System Layout & Details" />
        <div class="containerAll">
          <h4 class="sysLaySL">System Layout</h4>
          <div class="gridContainerSL">
            <img :src="dataFromAPI.detailed_layout" class="imgSL" />
            <div class="gridBoxSL">
              <div class="gridContainerSLTwo">
                <p class="scanContSL">
                  Scan the QR code to view a 3D model of your roof with the PV
                  installed.
                </p>
                <img :src="threeDLinkQR" class="scanImgSL" />
              </div>
              <p class="v3dModSL">
                Or click on the 'View 3D Model' button below:
              </p>
              <p class="v3dModSLMD">
                Click on the button below to view a 3D model of your roof with
                the PV installed.
              </p>
              <div  >
                <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" class="view3dBtnSL">
                  View 3D Model
                </router-link> 
              </div>
            </div>
          </div>
          <div class="tableContainerSL">
            <h4 class="tableHeadingSL">System Components</h4>
            <table id="customersSL">
              <thead id="headComponents">
                <tr class="tableHeaderSL">
                  <th class="tableHeaderWidthSL oneHeadSL">Component</th>
                  <th class="tableHeaderWidthSL twoHeadSL">
                    Component Details
                  </th>
                  <th class="tableHeaderWidthSL thrHeadSL">Qty.</th>
                </tr>
              </thead>
              <tbody id="allComponentValuesSLIdSL" class="allComponentValuesSL">
                <tr class="tablevalueSL" v-for="value, key in dataFromAPI.gazebo_components" :key="key">
                  <td class="tablevalueWidthSL firTbleSL subfirTbleSL">
                    PowerGazebo™
                  </td>
                  <td class="tablevalueWidthSL secTbleSL subfirTbleSL">
                   {{key}}
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL">
                    {{value}}
                  </td>
                </tr>
                <!-- <tr class="tablevalueSL">
                  <td class="tablevalueWidthSL firTbleSL subfirTbleSL">
                    PowerGazebo™
                  </td>
                  <td class="tablevalueWidthSL secTbleSL subfirTbleSL">
                    PowerGazebo™ 5×8 (18.73ft.×11.94ft.)
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL">
                    1
                  </td>
                </tr> -->
                <!-- <tr class="tablevalueSL">
                  <td class="tablevalueWidthSL firTbleSL subfirTbleSL">
                    PowerGazebo™
                  </td>
                  <td class="tablevalueWidthSL secTbleSL subfirTbleSL">
                    PowerGazebo™ 6×8 (22.42ft.×11.94ft.)
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL">
                    1
                  </td>
                </tr> -->
                <!-- <tr class="tablevalueSL">
                  <td class="tablevalueWidthSL firTbleSL subfirTbleSL">
                    PowerGazebo™
                  </td>
                  <td class="tablevalueWidthSL secTbleSL subfirTbleSL">
                    PowerGazebo™ 7×8 (26.11ft.×11.94ft.)
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL">
                    1
                  </td>
                </tr> -->
              </tbody>
            </table>
            <!-- <h4 class="tableHeadingSL">System Orientation</h4>
            <table id="customersSL">
              <thead id="headComponents">
                <tr class="tableHeaderSL">
                  <th class="tableHeaderWidthSL oneHeadSL">Orientation</th>
                  <th class="tableHeaderWidthSL twoHeadSL">Tilt</th>
                  <th class="tableHeaderWidthSL thrHeadSL">Azimuth</th>
                  <th class="tableHeaderWidthSL thrHeadSL">Modules</th>
                  <th class="tableHeaderWidthSL thrHeadSL">Array Size (DC)</th>
                </tr>
              </thead>
              <tbody id="allComponentValuesSLIdSL" class="allComponentValuesSL">
                <tr class="tablevalueSL">
                  <td class="tablevalueWidthSL firTbleSL subfirTbleSL2">
                    Landscape
                  </td>
                  <td class="tablevalueWidthSL secTbleSL subfirTbleSL2">7°</td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL2">
                    215°
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL2">
                    40
                  </td>
                  <td class="tablevalueWidthSL thrTbleSL subfirTbleSL2">
                    3.08 kWp
                  </td>
                </tr>
              </tbody>
            </table> -->
          </div>
          <div class="tbleContainerSLMD">
            <h4 class="tableHeadingSL">System Components</h4>
            <div class="sysOrienSLMD">
              <div class="sysSLMD">
                <p class="nameHeadSCSLMD">
                  PowerGazebo™ 4×8 (15.04ft.×11.94ft.)
                </p>
                <p class="valueHeadSCSLMD">1</p>
              </div>
              <div class="sysSLMD">
                <p class="nameHeadSCSLMD">PowerGazebo™ 5×8 (18.73ft.×11.94ft.)</p>
                <p class="valueHeadSCSLMD">1</p>
              </div>
              <div class="sysSLMD">
                <p class="nameHeadSCSLMD">PowerGazebo™ 6×8 (22.42ft.×11.94ft.)</p>
                <p class="valueHeadSCSLMD">1</p>
              </div>
              <div class="sysSLMD">
                <p class="nameHeadSCSLMD">PowerGazebo™ 7×8 (26.11ft.×11.94ft.)</p>
                <p class="valueHeadSCSLMD">1</p>
              </div>
            </div>
            <!-- <h4 class="tableHeadingSL">System Orientation</h4>
            <div class="sysOrienSLMD">
              <div class="sysSLMD">
                <p class="nameSLMD">Orientation</p>
                <p class="valueSLMD">Landscape</p>
              </div>
              <div class="sysSLMD">
                <p class="nameSLMD">Tilt</p>
                <p class="valueSLMD">7°</p>
              </div>
              <div class="sysSLMD">
                <p class="nameSLMD">Azimuth</p>
                <p class="valueSLMD">215°</p>
              </div>
              <div class="sysSLMD">
                <p class="nameSLMD">Module</p>
                <p class="valueSLMD">40</p>
              </div>
              <div class="sysSLMD">
                <p class="nameSLMD">Array Size (DC)</p>
                <p class="valueSLMD">3.08 kWp</p>
              </div>
            </div> -->
          </div>
          <Footer pageNo="3" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------Estimated Annual Production---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="Estimated Production & Savings" />
        <div class="containerAll">
          <div class="grphOneContEPS">
            <h4 class="headingEPS">Estimated Annual Production</h4>
            <p class="paraEPS">
              During the first year of operation, your system is estimated to
              produce {{ convertedWithComaskWh(annualProduction) }} x 1000 kWh.
            </p>
            <p class="lineMDEPS">
              * Based on 8760 hours Shading Analysis and NREL TMY Weather Data
            </p>
            <div class="gridContEPS">
              <div class="grphOneEPS">
               <div class="chartDiv">
                <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels"/> -->
                <span class="yUnit">kWh</span>
                <div class="chart">
                  <web-proposal-bar-chart-production 
                  :productionData="productionData"  
                  :productionDataLabels="productionDataLabels" 
                  :reportTemplate="reportTemplate"
                  :countryCode="countryCode" />
                </div>
              </div>
              </div>
              <div class="cntEPS">
                <div class="eagContEPS">
                  <p class="eagsEPS">
                    Estimated Average Generation of the System
                  </p>
                  <p class="valueEPS">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Average Monthly Production"])}} kWh/month</p>
                </div>
                <p class="lineEPS">
                  * Based on 8760 hours Shading Analysis and NREL TMY Weather
                  Data
                </p>
              </div>
            </div>
          </div>
          <div class="grphTwoContEPS">
            <h4 class="headingEPS">Estimated Monthly Savings</h4>
            <p class="paraEPS">
              Although solar will reduce your utility bill throughout the year,
              the greatest savings will come in months with higher solar
              generation.
            </p>
            <div class="gridContEPS">
              <div class="grphOneEPS">
                <div class="chartDiv">
                <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels"/> -->
                <span class="yUnit">{{currencySymbolNameMap[dataFromAPI.country.currency_code]}}</span>
                <div class="chart">
                  <web-proposal-bar-chart-savings 
                  :savingsData="this.dataFromAPI.financial_data.monthly_saving" 
                  :savingsDataLabels="productionDataLabels"
                  :currencyCode="currencyCode"
                  :countryCode="countryCode"
                  :reportTemplate="reportTemplate"
                  />
                </div>
              </div>
              </div>
              <div class="cntEPS">
                <div class="eagContEPS">
                  <p class="eagsEPS">Estimated Average Monthly Savings</p>
                  <p class="valueEPS">{{currencySymbolNameMap[dataFromAPI.country.currency_code] + parseFloat(dataFromAPI.financial_data.average_monthly_saving_usa).toFixed(2).toLocaleString("en-US") }}/month</p>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="diduKnowContEPS">
            <div class="diduKnowEPS">Did You Know?</div>
            <p class="diduKnowValueEPS">
              The PowerGazebo™ is available in multiple sizes, so you can always
              select the one that best suits your space and energy needs.
            </p>
          </div> -->
        </div>
        <Footer pageNo="4" :companyName="companyName" />
      </div>

      <!-- ----------------------------------------Site Evaluation---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="Site Evaluation" />
        <div class="containerAll">
          <h3 class="paraSE">
            Effect of shading on your roof on the longest and the shortest days
            of the year.
          </h3>
          <h3 class="headingSE">Shading Effects</h3>
          <div class="imagesContainerSE">
            <div class="imageContSE">
              <p class="imgContentSE">June 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }}</p>
              <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image">
                <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image" class="imgSE" />
              </div>
            </div>
            <div class="imageContSE">
              <p class="imgContentSE">June 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }}</p>
              <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image">
                <img :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image" class="imgSE" />
              </div>
            </div>
            <div class="imageContSE">
              <p class="imgContentSE">December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }} </p>
              <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images|| !dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image">
              <img
                :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image"
                class="imgSE"
              /></div>
            </div>
            <div class="imageContSE">
              <p class="imgContentSE">December 21 | {{ convertTimeTo12HourFormat(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }}</p>
              <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images || !dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image">
              <img
                :src="dataFromAPI.shadow_analysis_images && dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image"
                class="imgSE"
              /></div>
            </div>
          </div>
          <p class="summarySE">
            <span class="boldSE">Summary:</span><br />
            Your PowerGazebo™ is shade free for {{ calcSolarTime(dataFromAPI.system_metrics["Shading Loss"]) }}% of solar time throughout
            the year.
          </p>
          <Footer pageNo="5" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------PowerGazebo™: An Asset---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="PowerGazebo™: An Asset" />
        <div class="containerAll">
          <div class="containerPE">
            <div class="gridOnePE">
              <div class="gridOneContPE">
                <h4 class="gcontPE">Price</h4>
                <h2 class="gValuePE borderPE">{{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.absolute_price) }}</h2>
              </div>
              <div class="gridOneContPE">
                <h4 class="gcontPE">Lifetime Savings</h4>
                <h2 class="gValuePE">{{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.total_savings) }}</h2>
              </div>
              <div class="gridOneContPE"></div>
            </div>

            <div class="flexContainerPE">
              <div class="gridTwoPE">
                <div class="gridTwoContPE">
                  <p class="gcontTwoPE">Internal Rate of Return</p>
                  <p class="gValueTwoPE">{{ dataFromAPI.financial_data.irr }}%</p>
                </div>
                <div class="gridTwoContPE">
                  <p class="gcontTwoPE">Year 1 Usage Offset</p>
                  <p class="gValueTwoPE">{{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%</p>
                </div>
                <div class="gridTwoContPE" v-if="dataFromAPI.insentives_data[0]" style="grid-row: span 2">
                  <p class="gcontTwoPE">Incentives</p>
                  <p class="gValueTwoPE" v-for="(insentive_check, index) in dataFromAPI.insentives_data" :key="index">
                      <span v-if="insentive_check.amount_percentage == 0">{{insentive_check.name}}- {{currencySymbolNameMap[dataFromAPI.country.currency_code] +convertedWithComas(insentive_check.amount_required)}}</span>
                      <span v-else>{{insentive_check.name}}- {{insentive_check.amount_percentage}}%</span>
                  </p>
                </div>
                <div class="gridTwoContPE">
                  <p class="gcontTwoPE">System Life</p>
                  <p class="gValueTwoPE">{{ dataFromAPI.financial_data.expected_life_years }} Years</p>
                </div>
                <div class="gridTwoContPE">
                  <p class="gcontTwoPE">Savings from Solar</p>
                  <p class="gValueTwoPE">{{ dataFromAPI.financial_data.savings_from_Solar }}%</p>
                </div>
              </div>
              <div class="imgContPE">
              <div class="chartDivWOrWSolar">
                <div style="font-weight: bold;">Estimated Utility Bill</div>
                <span class="yUnitBillWithOrWithoutSolar">{{currencySymbolNameMap[dataFromAPI.country.currency_code] }}</span>
                <div class="chartBillWithOrWithoutSolar">
                  <web-proposal-multi-bar-chart :estimatedUtilityBillWithSolarData="estimatedUtilityBillWithSolarData" :estimatedUtilityBillWithoutSolarData="estimatedUtilityBillWithoutSolarData" :estimatedUtilityBillDataLabels="estimatedUtilityBillDataLabels"
                  :currencyCode="currencyCode" :countryCode="countryCode"
                  :reportTemplate="reportTemplate" />
                </div>
              </div> 
              
              <div class="legend-container">
                <div class="legend-sub-container">
                  <div class="legend-color blue"></div>
                  <span class="legend-text">Bill With Solar</span>
                </div>
                <div class="legend-sub-container">
                  <div class="legend-color red"></div>
                  <span class="legend-text">Bill Without Solar</span>
                </div>
              </div>
              
                              <!-- <img
                  src="./assests/img/Page07_EstimatedUtilityBill.png"
                  class="imgPE"
                /> -->
              </div>
            </div>
            <!-- <div class="diduKnowContPE">
              <div class="diduKnowPE">Did You Know?</div>
              <p class="diduKnowValuePE">
                A
                <span class="underlinePE">2015 study by Berkeley Lab </span>
                found that, on average, buyers were willing to pay a premium for
                homes, of $4 per watt of solar PV installed. You can bet the
                PowerGazebo™ adds even more value!
              </p>
            </div> -->
          </div>
          <Footer pageNo="6" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------Summary and Approvals---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="Summary and Approvals" />
        <div class="containerAll">
          <div class="containerSAA">
            <h4 class="headingsSAA">
              {{ dataFromAPI.organisation_data.name }} proposes to install the solar energy system outlined
              in this proposal for a turn-key price of {{ currencySymbolNameMap[dataFromAPI.country.currency_code] +  dataFromAPI.total_cost_after_incentive }}, which includes
              sales tax. This includes design, project management, procurement,
              materials, installation, and quality assurance.
            </h4>
            <div class="gridContSAA">
              <div class="gridSAA">
                <p class="sumSAA">System Size (DC STC)</p>
                <p class="valueSAA">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"])}} kWp</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Estimated Year 1 Production</p>
                <p class="valueSAA">{{ convertedWithComaskWh(dataFromAPI.system_metrics["Annual Production_usa"])}} kWh</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Estimated Year 1 Savings</p>
                <p class="valueSAA">{{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.monthly_saving_year) }}</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Price Per Watt Peak</p>
                <p class="valueSAA">{{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.price_per_w_usa) }}/Wp</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Structure</p>
                <p class="valueSAA">PowerGazebo™</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Module</p>
                <p class="valueSAA">{{dataFromAPI.modules}}</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Micro-Inverter</p>
                <p class="valueSAA">{{dataFromAPI.inverter}}</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Energy Generated from Solar</p>
                <p class="valueSAA">{{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Electricity Bill Saved from Solar</p>
                <p class="valueSAA">{{ dataFromAPI.financial_data.savings_from_Solar }}%</p>
              </div>
            </div>
            <hr class="hrSAA" />
            <div class="flexContSAA">
              <div class="flexSAA">
                <h4 class="flexInfoSAA">Total Cost</h4>
                <p class="flexValueSAA">{{
                      handleCurrencyFormate(
                        parseFloat(
                          dataFromAPI.total_cost_before_incentive.replace(
                            /,/g,
                            ""
                          )
                        )
                      )
                    }}
                </p>
              </div>
              <div class="flexSAA">
                <h4 class="flexInfoSAA">Incentives</h4>
                <p class="flexValueSAA">-{{
                      handleCurrencyFormate(
                        parseFloat(
                          dataFromAPI.total_insentive.replace(/,/g, "")
                        )
                      )
                    }}
                </p>
              </div>
              <div class="flexSAA">
                <h4 class="flexInfoSAA">Cost After Incentives</h4>
                <p class="flexValueSAA">{{currencySymbolNameMap[currencyCode]+dataFromAPI.total_cost_after_adders_and_discounts_incentive}}</p>
              </div>
            </div>
            <p class="addChargesSAA">
              Additional charges will be included if changes are made to the
              project scope once this document has been signed and/or
              differences between the allowance outlined above and the actual
              cost of these items varies.
            </p>

            <div class="roiContainerSAA">
              <h4 class="roiSAA">Your Return on Investment (ROI)</h4>
              <ul class="ulSAA">
                <li class="listRoiSAA">
                  Over the next {{dataFromAPI.financial_data.expected_life_years}} years, you will save an estimated {{currencySymbolNameMap[dataFromAPI.country.currency_code] +  convertedWithComas(dataFromAPI.financial_data.total_savings) }} in
                  energy costs.
                </li>
                <li class="listRoiSAA">
                  Your new solar energy system will pay for itself in energy
                  cost savings in {{ dataFromAPI.financial_data.payback.years }} yr. {{ dataFromAPI.financial_data.payback.months }} mos.
                </li>
              </ul>
            </div>

            <div class="signatureContainerSAA">
              <div class="signContSAA">
                <div class="signSAA"></div>
                <p class="sigContentSAA">
                  Installer/Authorized Representative</p>
              </div>
              <div class="signContSAA">
                <div class="signSAA"></div>
                <p class="sigContentSAA">
                  Buyer/Authorized Representative</p>
              </div>
              <div class="userContSAA">
                <h3 class="ucSAA">Installer PM/Supervisor/Owner</h3>
                <p class="utSAA">{{ dataFromAPI.organisation_data.name }}</p>
                <!-- <P class="tcnSAA">Tata</P> -->
              </div>
              <div class="userContSAA">
                <h3 class="ucSAA">{{ clientNameComputed }}</h3>
                <p class="utSAA">{{ dataFromAPI.project_head.address }}</p>
                <!-- <P class="tcnSAA">Client Name</P> -->
              </div>
            </div>

            <div class="userContainerSAA"></div>
          </div>
          <Footer pageNo="7" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------Project Steps & Roadmap---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="Project Steps & Roadmap" />
        <div class="containerAll">
          <div class="nextStepContainerNS">
            <div class="flexContPSR">
              <h1 class="countPSR">01</h1>
              <p class="valuePSR">
                Review and Approve Proposed Design (Owner).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">02</h1>
              <p class="valuePSR">
                Detailed System Design and Engineering (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">03</h1>
              <p class="valuePSR">
                Plans Sent to HOA Review, if Applicable. (We Provide the
                Information, You Submit it to the HOA).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">04</h1>
              <p class="valuePSR">
                Approvals by Utility and Municipality (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">05</h1>
              <p class="valuePSR">
                System Installation and Commissioning (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">06</h1>
              <p class="valuePSR">
                Obtain Permission to Operate (PTO) from Utility (We'll Take Care
                of it!).
              </p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">07</h1>
              <p class="valuePSR">Turn System On, and Start Saving Money!</p>
            </div>
            <div class="flexContPSR">
              <h1 class="countPSR">08</h1>
              <p class="valuePSR">Join Our Referral Program!</p>
            </div>
          </div>
          <Footer pageNo="8" :companyName="companyName" />
        </div>
      </div>

      <!-- ----------------------------------------PowerGazebo™ Datasheet---------------------------------- -->

      <div class="pageGap pagesHeight">
        <Header heading="PowerGazebo™ Datasheet" />
        <div class="containerAll">
          <table id="customersDS">
            <thead id="headComponents">
              <tr class="tableHeaderDS">
                <th class="tableHeaderWidthDS oneHeadDS">PowerGazebo™</th>
                <th class="tableHeaderWidthDS twoHeadDS"></th>
              </tr>
            </thead>
            <tbody id="allComponentValuesSLIdDS" class="allComponentValuesDS">
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">
                  System Configuration
                </td>
                <td class="tablevalueWidthDS secTbleDS">
                  <span class="spnWdthDS">185 sq.ft.</span>
                  <span class="spnWdthDS">225 sq.ft.</span>
                  <span class="spnWdthDS">268 sq.ft.</span>
                  <span class="spnWdthDS brdrNoneDS">312 sq.ft.</span>
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Capacity</td>
                <td class="tablevalueWidthDS secTbleDS">
                  <span class="spnWdthDS">2.46 kWp</span>
                  <span class="spnWdthDS">3.08 kWp</span>
                  <span class="spnWdthDS">3.08 kWp</span>
                  <span class="spnWdthDS brdrNoneDS">4.31 kWp</span>
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Gazebo Structure</td>
                <td class="tablevalueWidthDS secTbleDS">
                  MS Steel with Zinc Primer and Powder Coating
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Color</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Black finish (other variants available)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">False Ceiling</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Soffit metal ceiling
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Design Conditions</td>
                <td class="tablevalueWidthDS secTbleDS">
                  105 mph, 20 psf | 120 mph, 20 psf snow load, waterproofing
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Assembly</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Pre-cut, pre-drilled assembly kit for easy installation
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Front Clearance</td>
                <td class="tablevalueWidthDS secTbleDS">7 ft. / 84 in.</td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">
                  Front Elevation and Rear Elevation
                </td>
                <td class="tablevalueWidthDS secTbleDS">
                  7.5 ft. (Front) and 9ft. (Rear) / 90 in. (Front) and 108 in.
                  (Rear)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Accessories</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Recessed Light, Power Outlet & Premium Optionals Like LED
                  Lights
                </td>
              </tr>
            </tbody>
            <thead id="headComponents">
              <tr class="tableHeaderDS">
                <th class="tableHeaderWidthDS oneHeadDS">PV System</th>
                <th class="tableHeaderWidthDS twoHeadDS"></th>
              </tr>
            </thead>
            <tbody id="allComponentValuesSLIdDS" class="allComponentValuesDS">
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Tile Capacity</td>
                <td class="tablevalueWidthDS secTbleDS">
                  77 Wp +2% | System Voltage 600 V
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Cells</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Mono-PERC, High-Efficiency Cells (>22%)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Tile Dimensions</td>
                <td class="tablevalueWidthDS secTbleDS">
                  44.1 in. × 18.3 in. (1120 mm × 465 mm)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Construction</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Glass-on-glass (3.2 mm each)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Color</td>
                <td class="tablevalueWidthDS secTbleDS">Black</td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Inverter</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Compatible with String & Micro-inverters
                </td>
              </tr>
            </tbody>
            <thead id="headComponents">
              <tr class="tableHeaderDS">
                <th class="tableHeaderWidthDS oneHeadDS">Software Features</th>
                <th class="tableHeaderWidthDS twoHeadDS"></th>
              </tr>
            </thead>
            <tbody id="allComponentValuesSLIdDS" class="allComponentValuesDS">
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">
                  Design Tool Assistance
                </td>
                <td class="tablevalueWidthDS secTbleDS">Using SolarLabs 360</td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Remote Monitoring</td>
                <td class="tablevalueWidthDS secTbleDS">
                  Available on Spotlight App
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">
                  AR, VR Visualizations
                </td>
                <td class="tablevalueWidthDS secTbleDS">
                  Available on Spotlight App
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">
                  Customer Application
                </td>
                <td class="tablevalueWidthDS secTbleDS">
                  Spotlight App available on Web, iOS & Android
                </td>
              </tr>
            </tbody>
            <thead id="headComponents">
              <tr class="tableHeaderDS">
                <th class="tableHeaderWidthDS oneHeadDS">Certifications</th>
                <th class="tableHeaderWidthDS twoHeadDS"></th>
              </tr>
            </thead>
            <tbody id="allComponentValuesSLIdDS" class="allComponentValuesDS">
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Tiles (Module)</td>
                <td class="tablevalueWidthDS secTbleDS">
                  IEC 61215, UL 61730 (both in progress at NRTL)
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Gazebo Structure</td>
                <td class="tablevalueWidthDS secTbleDS">
                  PE Approved for CA/NV/AZ/NM
                </td>
              </tr>
            </tbody>
            <thead v-if="dataFromAPI.country.country_code=='US'" id="headComponents">
              <tr class="tableHeaderDS">
                <th class="tableHeaderWidthDS oneHeadDS">Warranty</th>
                <th class="tableHeaderWidthDS twoHeadDS"></th>
              </tr>
            </thead>
            <tbody v-if="dataFromAPI.country.country_code=='US'" id="allComponentValuesSLIdDS" class="allComponentValuesDS">
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">PV Tile</td>
                <td class="tablevalueWidthDS secTbleDS">
                  10-year workmanship & 25-year peak performance warranties
                </td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Gazebo Structure</td>
                <td class="tablevalueWidthDS secTbleDS">5-year warranty</td>
              </tr>
              <tr class="tablevalueDS">
                <td class="tablevalueWidthDS firTbleDS">Micro Inverters</td>
                <td class="tablevalueWidthDS secTbleDS">Pass through</td>
              </tr>
            </tbody>
          </table>
          <Footer pageNo="9" :companyName="companyName" />
        </div>
      </div>

      <!-- --------------------------------------Thank You------------------------------------ -->

      <div class="pageGap pagesHeight lastPage">
        <div class="imgContainerTK">
          <img src="./assests/img/Back Cover Image.png" class="imgTK" />
          <img
            src="./assests/img/Front Cover (5x8) w_ Gradient.png"
            class="imgMDTK"
          />
          <img :src="dataFromAPI.organisation_data.logo" class="logoTKLeft" />
          <img src="./assests/img/Union.png" class="logoTKRight" />
        </div>
        <div class="containerTK">
          <h3 class="headingTK">Thank You</h3>
          <div class="gridTK">
            <div class="boxTK" v-if="dataFromAPI.organisation_data.phone">
              <img src="./assests/img/Phone Icon.png" class="thnkuIconsTK" />
              <p class="phNoTK">{{dataFromAPI.organisation_data.phone}}</p>
            </div>
            <div class="boxTK" v-if="dataFromAPI.organisation_data.name || organisationAddress">
              <img src="./assests/img/Home Icon.png" class="thnkuIconsTK" />
              <div>
                <p class="nameTK">{{dataFromAPI.organisation_data.name}}</p>
                <p class="ctyTK">{{organisationAddress}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Header from "./components/header.vue";
import Footer from "./components/footer.vue";
import { formatNumberWithCommas } from '@/utils.js'
import webProposalMultiBarChart from "@/components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
import WebProposalBarChartSavings from "@/components/ui/charts/commonCharts/webProposalBarChartSavings.vue";
import WebProposalBarChartProduction from "@/components/ui/charts/commonCharts/webProposalBarChartProduction.vue";
import currencySymbolNameMap from '../../currency-symbol-name-map';
import { convertTimeTo12HourFormat } from "../../utils/utils"
import { getFormattedCurrencyComas } from "../../../utils/numberFormat/currencyFormatter";


export default {
  components: {
    Header,
    Footer,
    webProposalMultiBarChart,
    WebProposalBarChartProduction,
    WebProposalBarChartSavings
  },

  props: {
    pages: {
      type: Array,
    }, 
    pagesNew: {
      type: Array,
    },
    dataFromAPI: {
      type: Object
    },
    isPuppeteer: {
      type: Boolean,
    },
    // finalCost: {
    //   type: String,
    // },
    // costAfterIncentive: {
    //   type: String,
    // },
    updatedData:{
      type: Object,
    },
  },

  data() {
    return {
      referenceId : this.dataFromAPI.reference_id,
      companyName: "Arka360",
      currencyCode: this.dataFromAPI.country.currency_code,
      countryCode: this.dataFromAPI.country.country_code,
      productionDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      estimatedUtilityBillDataLabels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      reportTemplate: 'reportGazebo',
    };
  },

  nonReactiveData() {
    return {
        currencySymbolNameMap,
    }
  },

  computed: {
    // finalCost(){
    //   return parseFloat(this.dataFromAPI.total_cost_after_incentive - this.dataFromAPI.total_insentive).toFixed(2);
    // },

    clientNameComputed(){
      return this.dataFromAPI.project_head.client_name || this.dataFromAPI.project_head.name;
    },

    organisationAddress() {
      return Array.isArray(this.dataFromAPI.organisation_data.address) ? this.dataFromAPI.organisation_data.address[0] : this.dataFromAPI.organisation_data.address
    },
    annualProduction() {
      let data = this.dataFromAPI.system_metrics["Annual Production"];
      let final = data.split('-');
      let annualProduction = final[0];
      return annualProduction;
    },
     threeDLinkQR(){
      return `https://api.qrserver.com/v1/create-qr-code/?data=${this.dataFromAPI.detailed_layout_link}`;
    },
     estimatedUtilityBillWithSolarData() {
      return this.dataFromAPI.financial_data.bill_with_solar;
    },

    estimatedUtilityBillWithoutSolarData() {
      return this.dataFromAPI.financial_data.bill_without_solar;
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
  },

  methods: {
//     count(value) {
//       this.dataFromAPI.gazebo_components.filter(function(value){
//     return value === value;
// }).length  

//     }
    handleCurrencyFormate(amount) {
      if (amount.toString().includes(".")) {
        amount = amount.toFixed(2);
        let arr = amount.toString().split(".");
        return getFormattedCurrencyComas(this.currencyCode, parseInt(arr[0])) + "." + arr[1];
      }
      return getFormattedCurrencyComas(this.currencyCode, amount) + ".00";

    },
        convertedWithComas(value){
      return formatNumberWithCommas(value, this.dataFromAPI.country.id === 91)
    },

    projectNameFiltered(val){
      if(val){
        const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
        return eval("`" + escapedVal + "`");
      }
      else{
        return "-"
      }
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
    convertTimeTo12HourFormat,
  }
};
</script>

<style lang="scss"  scoped>
@import url("https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap");

.legend-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 12px;
  column-gap: 60px;
}

.legend-sub-container {
  display: flex;
}

.legend-text {
  font-size: 15px;
  color: #222;
}

.legend-color {
  width: 32px;
  height: 16px;
  border-radius: 2px;
  margin-right: 8px;
}

.legend-color.blue {
  background-color: #409eff;
}

.legend-color.red {
  background-color: #ff8d8f;
}


.chartDiv {
  /* background-color: white; */
  background-color: #f0f3f8;
  /* position: relative; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 4px;
  /* min-width: 600px; */
  /* padding: 10px; */
}

.chart {
   /* background: yellow; */
   width: 300px;

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
    color: #222;
}

.chartDivWOrWSolar {
  padding-top: 10px;
  // padding-bottom: 10px;
  height: 350px;
  /* margin-top: 20px; */
  /* margin-bottom: 20px; */
  /* margin-left: 22px; */
  /* width: 547px; */
  background-color: #f0f3f8;
  /* position: relative; */
  /* display: flex; */
  /* flex-direction: column; */
  /* align-items: center; */
  /* justify-content: center; */
  /* padding-top: 10px; */
  /* padding-bottom: 10px; */
  position: relative;

}

.yUnitBillWithOrWithoutSolar {
    /* position: absolute;
    top: 0px;
    left: 101px; */
    /* align-self: flex-start;
    margin-left: 130px;
    margin-top: 40px; */

    /* width: 10px; */
    /* height: 22px; */
    /* font-family: BrandonText; */
    /* font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.38;
    letter-spacing: normal; */
    /* text-align: right; */
    color: #222;
    // position: absolute;
    // top: 9px;
    // left: 37px;
    float: left;
    padding-left: 30px;
}

.chartBillWithOrWithoutSolar {
    /* width: 900px; */
    /* margin-left: 20px; */
    /* background: yellow; */
    /* padding: 20px; */
    // width: 530px;
    margin: auto;
    /* display: flex;
    align-items: center;
    justify-content: center; */
}

.chartBillWithOrWithoutSolar #bar-chart{
    display: block !important;
    /* width: 500px !important; */
    /* width: 100% !important; */
    width: 547px !important;
    height: 300px !important;
    /* margin-left: 20px; */
    /* background: yellow; */
    /* padding: 20px; */
}

* {
  font-family: "Lato";
}

// ---------------------------------------mixins------------------------------------------
@mixin bold-font-16 {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 800;
}

@mixin regular-font-16 {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 600;
}

@mixin light-font-16 {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 500;
}

@mixin bold-font-14 {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 800;
}

@mixin regular-font-14 {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
}

@mixin light-font-14 {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
}

@mixin bold-font-12 {
  color: #1d1d1f;
  font-size: 12px;
  font-weight: 800;
}

@mixin regular-font-12 {
  color: #1d1d1f;
  font-size: 12px;
  font-weight: 600;
}

@mixin light-font-12 {
  color: #1d1d1f;
  font-size: 12px;
  font-weight: 500;
}

.parentClass {
  background-color: #f0f3f8;
}

.potrait_screen {
  margin: 0px auto;
  width: 612px;
  height: auto;
}

.pagesHeight {
  height: 792px;
  width: 100%;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  background-color: #fff;
  word-break: break-word;
}

.containerAll {
  margin: 20px 30px;
}

/*-------------------------------------SolarProjectProposal------------------------------------*/

.imgContainerFP {
  width: 100%;
  height: 500px;
  position: relative;
}

.imgFP {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-image: linear-gradient(
    to bottom,
    #fff 54%,
    rgba(255, 255, 255, 0) 100%
  );
}

.logoFPRight {
  position: absolute;
  top: 20px;
  right: 30px;
  max-width: 147px;
  max-height: 40px;
}

.logoFPLeft {
  position: absolute;
  top: 20px;
  left: 30px;
  max-width: 147px;
  max-height: 40px;
}

.containerFP {
  margin: 20px 30px;
}

.headingFP {
  font-size: 24px;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 15px;
}

.subHeadingFP {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.gridFP {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
  margin-top: 30px;
}

.boxOneFP {
  border-right: 1px solid #d2d2d7;
}

.prpFP,
.addrFP,
.mailFP,
.licFP {
  margin-bottom: 10px;
  @include regular-font-12;
}

.nameFP {
  font-size: 20px;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 10px;
}

.roofFP {
  @include bold-font-12;
  line-height: 1.6;
}

.addrFP,
.mailFP,
.licFP {
  line-height: 1.6;
}

.mailFP {
  margin-bottom: 0px;
}

/* ---------------------------------------Company overview---------------------------------- */

.headingContCO {
  border-left: 10px solid #0066cc;
  padding-left: 10px;
  line-height: 1.5;
  @include bold-font-14;
}

.contentCO {
  padding: 0 !important;
}

.contentCO,
.contentTwoCO {
  line-height: 1.5;
  margin: 10px auto 18px auto;
  @include light-font-14;
}

.contentTwoCO {
  // margin: 10px auto;
}

.ourTeamHeadingCO {
  @include bold-font-16;
  margin-bottom: 12px;
}

.ourTeamImgContainerCO {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px 43px;
}

.imgCO {
  width: 141px;
  height: 141px;
  border-radius: 10px;
  border: 1px solid #d2d2d7;
}

.captionCO {
  font-size: 17.6px;
  color: #1d1d1f;
  margin-bottom: 2px;
  font-weight: 800;
  margin-top: 6px;
}

.positionCO {
  @include regular-font-12;
}

/* ----------------------------------------PowerGazebo™ Value Proposition--------------------------------- */

.gridContainerPG {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 36px;
  justify-content: center;
}

.imgContainerPG {
  position: relative;
  text-align: center;
  margin: 10px 0px;
}

.backImgPG {
  width: 390px;
}

.frntImgPG {
  position: absolute;
  width: 240px;
  height: 160px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  border: 1px solid #d2d2d7;
}

.boxPG {
  text-align: center;
}

.valProIconPG {
  width: 30px;
  height: 30px;
}

.headPG {
  @include regular-font-14;
  margin: 10px 0px;
  text-align: left;
}

.contPG {
  color: #6e6e73;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}

/*----------------------------------------System Layout & Details---------------------------------- */

.sysLaySL {
  margin-bottom: 20px;
  @include bold-font-16;
}

.gridContainerSL {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
  margin-bottom: 30px;
}

.gridContainerSLTwo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
}

.imgSL {
  width: 250px;
  height: 245px;
  border-radius: 8px;
}

.scanContSL {
  @include light-font-14;
  line-height: 1.4;
}

.scanImgSL {
  width: 100px;
  height: 100px;
}

.v3dModSL {
  @include light-font-14;
  line-height: 1.4;
  margin: 27px auto;
}

.v3dModSLMD {
  display: none;
}

.view3dBtnSL {
  border-radius: 8px;
  background-color: #000;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  cursor: pointer;
  padding: 10px 40px;
}

.tableHeadingSL {
  @include bold-font-16;
  margin-bottom: 15px;
  margin-top: 20px;
}

.tbleContainerSLMD {
  display: none;
}

#customersSL {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderSL {
  background-color: #000;
  color: #ffffff;
  font-size: 14px;
  text-align: center;
}

.tablevalueSL {
  color: #222;
  text-align: left;
  word-break: break-word;
}

.tableHeaderWidthSL {
  white-space: nowrap;
  height: 30px;
}

.oneHeadSL {
  border-right: 2px solid #fff;
}

.twoHeadSL {
}

.thrHeadSL {
  border-left: 2px solid #fff;
}

.tablevalueWidthSL {
  word-break: break-word;
  color: #6e6e73;
  padding: 7px;
  font-size: 12px;
}

.firTbleSL {
  border-right: 2px solid #fff;
  padding-left: 30px;
}

.secTbleSL {
  padding-left: 30px;
}

.thrTbleSL {
  border-left: 2px solid #fff;
  padding-left: 20px;
}

.tablevalueSL:nth-child(even) {
  background-color: #f5f5f7;
}

.subfirTbleSL {
  @include regular-font-14;
  padding: 7px;
}

.subfirTbleSL2 {
  @include regular-font-14;
  padding: 7px;
  text-align: center;
}

/* ----------------------------------------Estimated Annual Production---------------------------------- --> */

.headingEPS {
  @include bold-font-16;
  line-height: 1;
  margin-bottom: 8px;
}

.paraEPS {
  @include regular-font-14;
  line-height: 1.4;
}

.gridContEPS {
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-gap: 16px;
  margin-top: 15px;
  margin-bottom: 30px;
}

.grphImgEPS {
  width: 296.3px;
  height: 160px;
}

.cntEPS {
  position: relative;
}

.eagsEPS {
  @include regular-font-12;
  line-height: 1.4;
  margin-bottom: 5px;
}

.valueEPS {
  @include bold-font-16;
  line-height: 1.4;
}

.lineEPS {
  position: absolute;
  bottom: 0px;
  font-size: 10px;
  color: #1d1d1f;
  font-weight: 600;
  line-height: 1.4;
}

.lineMDEPS {
  display: none;
}

.diduKnowContEPS {
  border-radius: 4px;
  background-color: #f5f5f7;
  position: relative;
  padding: 10px;
  margin: 25px 0px 15px 0px;
}

.diduKnowEPS {
  background-color: #000000;
  border-radius: 6px;
  position: absolute;
  padding: 8px 20px;
  top: -14px;
  left: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.diduKnowValueEPS {
  @include regular-font-12;
  margin: 16px 0px 4px 8px;
  word-break: break-word;
  line-height: 1.6;
}

/*----------------------------------------Project Steps & Roadmap---------------------------------- - */

.flexContPSR {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 60px;
}

.flexContPSR:nth-child(odd) {
  background-color: #f5f5f7;
}

.countPSR {
  color: #0066cc;
  margin: 0px;
  font-size: 20px;
  margin-right: 24px;
  word-break: keep-all;
  font-weight: 800;
}

.valuePSR {
  @include bold-font-16;
  color: #222;
  margin: 0px;
  word-break: break-word;
  line-height: 1.5;
}

/*----------------------------------------Summary and Approval---------------------------------- - */

.headingsSAA {
  word-break: break-word;
  font-size: 12px;
  font-weight: 800;
  color: #263342;
  margin: 8px 0px;
  line-height: 1.4;
}

.gridSAA {
  display: grid;
  grid-template-columns: 45% 55%;
  column-gap: 16px;
}

.valueSAA,
.sumSAA {
  font-size: 12px;
  color: #222222;
  margin: 4px 0px;
  font-weight: 600;
}

.hrSAA {
  margin: 8px 0px;
  color: #000;
}

.flexContSAA {
  display: flex;
  justify-content: space-between;
}

.flexInfoSAA {
  @include bold-font-12;
  margin: 0px;
}

.flexValueSAA {
  @include regular-font-12;
  margin: 8px 0px;
}

.addChargesSAA {
  margin: 15px 0px 0px 0px;
  font-size: 12px;
  word-break: break-word;
  color: #263342;
  line-height: 1.4;
  font-weight: 600;
}

.roiContainerSAA {
  margin: 10px 0px;
}

.roiSAA {
  font-size: 12px;
  font-weight: 800;
  color: #222;
  word-break: break-word;
  margin: 8px 0px 8px 0px;
}

.listRoiSAA {
  font-size: 12px;
  font-weight: 600;
  color: #263342;
  word-break: break-word;
  margin: 4px 0px 4px 0px;
}

.signatureContainerSAA {
  display: grid;
  margin: 8px 0px;
  grid-template-columns: 1fr 1fr;
  grid-gap: 58px;
  row-gap: 0px;
}

.signSAA {
  height: 60px;
  text-align: center;
  background: #f5f5f7;
}

.sigContentSAA {
  font-size: 12px;
  color: #263342;
  border-top: 1px solid #6e6e73;
  padding-top: 4px;
  word-break: break-word;
  margin-bottom: 6px;
  font-weight: 600;
}

.ucSAA {
  margin: 0px;
  font-weight: 800;
  color: #222222;
  font-size: 12px;
  word-break: break-word;
}

.utSAA {
  margin: 0px 0px 8px 0px;
  font-weight: 600;
  color: #222;
  font-size: 12px;
  word-break: break-word;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.tcnSAA {
  margin: 0px 0px 8px 0px;
  font-weight: 600;
  color: #222;
  font-size: 12px;
  word-break: break-word;
}

.ulSAA {
  list-style: initial;
  margin-left: 16px;
}

/*----------------------------------------Site Evaluation---------------------------------- - */

.paraSE {
  @include regular-font-14;
  word-break: break-word;
  margin: 16px 0px 8px 0px;
}

.headingSE {
  @include bold-font-16;
  color: #263342;
  margin: 25px 0px 12px 0px;
}

.imagesContainerSE {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0px;
  row-gap: 10px;
}

.imageContSE {
  width: 100%;
}

.imgContentSE {
  margin: 5px 0;
  @include regular-font-14;
}

.imgSE {
  width: 220px;
  height: 215px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

.summarySE {
  @include regular-font-14;
  line-height: 1.4;
  margin-top: 10px;
}

.boldSE {
  font-weight: 800;
}

/*----------------------------------------PowerGazebo™: An Asset---------------------------------- - */

.gridOnePE {
  margin: 10px 0px 0px 0px;
  display: flex;
  gap: 35px;
  row-gap: 0px;
}

.gridOneContPE {
  flex: 1;
}

.gcontPE {
  @include bold-font-14;
  color: #6e6e73;
  margin-bottom: 4px;
  margin-top: 8px;
  word-break: break-word;
}

.gValuePE {
  @include bold-font-16;
  margin: 0px;
  padding-bottom: 15px;
  border-bottom: 5px solid #f5f5f7;
  word-break: break-word;
}

.gridTwoPE {
  margin: 20px 0px 10px 0px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 35px;
  row-gap: 20px;
}

.gcontTwoPE {
  @include bold-font-14;
  color: #6e6e73;
  word-break: break-word;
  margin-bottom: 8px;
}

.gValueTwoPE {
  @include regular-font-12;
  margin-bottom: 8px;
  margin: 0px;
  word-break: break-word;
}

.imgContPE {
  text-align: center;
}

.imgPE {
  margin: 14px 0px;
  width: 452px;
  height: 300px;
}

.diduKnowContPE {
  border-radius: 4px;
  background-color: #f5f5f7;
  position: relative;
  padding: 10px;
  margin: 25px 0px 15px 0px;
}

.diduKnowPE {
  background-color: #000000;
  border-radius: 6px;
  position: absolute;
  padding: 8px 20px;
  top: -14px;
  left: 16px;
  @include regular-font-14;
  color: #fff;
}

.diduKnowValuePE {
  @include regular-font-12;
  margin: 16px 0px 4px 8px;
  word-break: break-word;
  line-height: 1.4;
}

.underlinePE {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ----------------------------------------PowerGazebo™ Datasheet--------------------------------- */

#customersDS {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderDS {
  background-color: #000;
  color: #ffffff;
  font-size: 11px;
  text-align: left;
}

.tablevalueDS {
  color: #222;
  text-align: left;
  word-break: break-word;
}

.tableHeaderWidthDS {
  white-space: nowrap;
  height: 20px;
  padding: 4px 10px 3px 10px;
}

.oneHeadDS {
  border-right: 2px solid #fff;
}

.tablevalueWidthDS {
  word-break: break-word;
  @include regular-font-14;
  font-size: 11px;
  padding: 4px 10px 3px 10px;
}

.firTbleDS {
  border-right: 2px solid #fff;
}

.secTbleDS {
}

.spnWdthDS {
  display: inline-block;
  width: 25%;
  border-right: 1px solid #d2d2d7;
  text-align: center;
}

.brdrNoneDS {
  border-right: none;
}

.tablevalueDS:nth-child(even) {
  background-color: #f5f5f7;
}

/*----------------------------------------Thank You---------------------------------- - */

.imgContainerTK {
  width: 100%;
  height: 520px;
  position: relative;
}

.imgTK {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-image: linear-gradient(
    to bottom,
    #fff 54%,
    rgba(255, 255, 255, 0) 100%
  );
  border-bottom: 10px solid #0066cc;
}

.imgMDTK {
  display: none;
}

.logoTKLeft {
  position: absolute;
  top: 20px;
  left: 30px;
  max-width: 117px;
  max-height: 40px;
}

.logoTKRight {
  position: absolute;
  top: 20px;
  right: 30px;
  max-width: 117px;
  max-height: 40px;
}

.containerTK {
  margin: 25px 30px;
}

.headingTK {
  font-size: 24px;
  font-weight: 800;
  color: #1d1d1f;
}

.gridTK {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 30px;
  margin-top: 30px;
}

.boxTK {
  display: flex;
  gap: 12px;
}

.thnkuIconsTK {
  width: 22px;
  height: 22px;
}

.phNoTK,
.nameTK {
  @include bold-font-14;
  line-height: 1.6;
  margin-bottom: 4px;
}

.ctyTK {
  @include regular-font-14;
}

.media_queries {
  .pageGap {
    margin-bottom: 24px;
}

@media (max-width: 644px) {
  .chart{
    width: 100%;
  }

  .potrait_screen {
    width: 80vw;
    width: 400px;
    height: auto;
  }

  .pagesHeight {
    min-height: 675px;
    height: auto;
    width: 100%;
    padding-bottom: 60px;
  }

  .firstPage,
  .lastPage {
    padding-bottom: 0px;
  }

  .containerAll,
  .containerFP {
    margin: 20px 20px;
  }

  .imgContainerFP {
    height: 320px;
  }

  .logoFPRight{
    top: 10px;
    right: 10px
  }

    .logoFPLeft {
    top: 10px;
    left: 10px
  }

  .headingFP {
    font-size: 34px;
    margin-bottom: 30px;
    margin-top: 30px;
  }

  .subHeadingFP {
    font-size: 27px;
  }

  .gridFP {
    grid-template-columns: 1fr;
    grid-gap: 30px;
    margin-top: 30px;
  }

  .boxOneFP {
    border-right: none;
    border-bottom: 1px solid #d2d2d7;
    padding-bottom: 20px;
  }

  .addrFP,
  .mailFP,
  .licFP,
  .prpFP {
    font-size: 14px;
  }

  .brTag {
    display: none;
  }

  .ourTeamImgContainerCO {
    grid-template-columns: 1fr;
    grid-gap: 20px;
  }

  .imgContainerCO {
    margin: auto;
  }

  .positionCO {
    @include regular-font-14;
  }

  .imgContainerPG {
    margin: 30px 0px 24px 0px;
  }

  .frntImgPG {
    width: 100%;
    height: 250px;
  }

  .gridContainerPG {
    grid-template-columns: 1fr;
    grid-gap: 36px;
  }

  .boxPG {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .headPG {
    font-weight: 800;
  }

  .contPG {
    font-weight: 600;
  }

  .sysLaySL {
    font-size: 18px;
  }

  .gridContainerSL {
    grid-template-columns: 1fr;
    grid-gap: 0px;
    text-align: center;
  }

  .imgSL {
    width: 340px;
    height: 340px;
    margin: auto;
  }

  .v3dModSLMD {
    @include regular-font-14;
    line-height: 1.4;
    margin: 27px auto;
    display: inherit;
    max-width: 260px;
  }

  .v3dModSL,
  .gridContainerSLTwo,
  .tableContainerSL {
    display: none;
  }

  .tbleContainerSLMD {
    display: initial;
  }

  .sysOrienSLMD {
  }

  .sysSLMD {
    display: flex;
    justify-content: space-between;
    padding: 6px;
    align-items: flex-end;
  }

  .sysSLMD:nth-child(even) {
    background-color: #f5f5f7;
}

  .nameSLMD,
  .valueSLMD {
    @include regular-font-12;
    color: #000;
  }

  .nameSCSLMD,
  .valueSCSLMD,
  .nameSCSLMD2 {
    @include regular-font-12;
    color: #6e6e73;
  }

  .nameSCSLMD {
    margin-bottom: 4px;
  }

  .undrLineSCSLMD {
    border-bottom: 1px solid #6e6e73;
  }

  .nameSCSLMD2 {
    padding-left: 10px;
  }

  .nameHeadSCSLMD {
    @include regular-font-12;
  }

  .lineMDEPS {
    display: block;
    font-size: 10px;
    color: #1d1d1f;
    font-weight: 600;
    line-height: 1.4;
    margin-top: 15px;
  }

  .lineEPS {
    display: none;
  }

  .gridContEPS,
  .imagesContainerSE {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .grphImgEPS {
    width: 100%;
  }

  .diduKnowEPS,
  .diduKnowPE {
    left: 50%;
    transform: translate(-50%, 0%);
  }

  .imgSE {
    width: 340px;
    height: 340px;
  }

  .gridOnePE {
    flex-direction: column-reverse;
    gap: 16px;
    text-align: center;
  }

  .gValuePE {
    padding-bottom: 20px;
    width: 50%;
    margin: auto;
  }

  .borderPE {
    border-bottom: none;
  }

  .flexContainerPE {
    display: flex;
    flex-direction: column-reverse;
  }

  .gridTwoPE {
    margin: 20px 0px;
    grid-template-columns: 1fr;
    text-align: center;
  }

  .flexContPSR {
    padding: 15px;
    height: inherit;
  }

  .valuePSR {
    font-size: 13px;
  }

  .imgContainerTK {
    height: 350px;
  }

  .imgTK {
    display: none;
  }

  .imgMDTK {
    display: initial;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-bottom: 10px solid #0066cc;
  }

  .logoTKLeft {
    left: 10px;
    top: 10px;
  }

  .logoTKRight {
    right: 10px;
    top: 10px;
  }

  .headingTK {
    text-align: center;
  }

  .gridTK {
    grid-template-columns: 1fr;
  }

  .boxTK {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 432px) {
  .potrait_screen {
    width: 100%;
  }
}

@media (max-width: 340px) {
  .logoFPRight, .logoFPLeft {
    max-width: 117px;
  }

  .frntImgPG {
    height: 100%
  }
}
}
</style>