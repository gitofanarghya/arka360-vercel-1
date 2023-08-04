<template>
  <div>
    <div class="allContainer" v-loading.fullscreen.lock="isLoading"></div>
    <div class="allContainer" v-if="!isLoading">
      <div class="sectionOneImg">
        <div class="sectionOneCont">
          <h3 class="headingOne">Solar Project<br />Proposal</h3>
          <p class="pvSystemOne">
            {{
              convertedWithComaskWh(
                dataFromAPI.system_metrics["Module DC Nameplate"]
              )
            }}
            kWp Rooftop PV System
          </p>
          <hr class="hrOne" />
          <p class="contentOne">
            Your system is estimated to produce
            {{
              convertedWithComaskWh(
                dataFromAPI.system_metrics["Annual Production_usa"]
              )
            }}
            kWh per year with an expected lifetime of more than 25 years and
            will offset over
            {{
              convertedWithComaskWh(dataFromAPI.green_impact_data.co2_offset)
            }}
            tons of CO<sub>2</sub>, equal to planting
            {{ dataFromAPI.green_impact_data.acres_of_forest }} acres of trees!
          </p>
          <div class="blackBox">
            <div class="preForCont">
              <p class="preFor">PREPARED FOR</p>
              <p
                class="nameBlackBox"
                v-html="projectNameFiltered(dataFromAPI.project_head.name)"
              ></p>
              <p class="noEmail">
                {{
                  dataFromAPI.organisation_data.phone
                    ? dataFromAPI.project_head.client_contact_number
                    : "NA"
                }}
                |
                {{
                  dataFromAPI.organisation_data.email_id
                    ? dataFromAPI.project_head.client_email_id
                    : ""
                }}
              </p>
              <p class="addressBlackBox">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div class="preByCont">
              <p class="preFor">PREPARED BY</p>
              <p class="nameBlackBox">
                {{ dataFromAPI.project_head.project_creator_name }}
              </p>
              <p class="noEmail">
                {{ dataFromAPI.project_head.project_creator_phone_number }} |
                {{ dataFromAPI.organisation_data.email_id }}
              </p>
              <p
                v-if="dataFromAPI.organisation_data.address"
                class="addressBlackBox"
              >
                {{ dataFromAPI.organisation_data.address[0] }}
              </p>
            </div>
          </div>
        </div>
        <div class="overlayFPage"></div>
      </div>

      <div class="blackBoxContMD">
        <div class="blackBoxMD">
          <div class="preForContMD">
            <p class="preForMD">PREPARED FOR</p>
            <p
              class="nameBlackBoxMD"
              v-html="projectNameFiltered(dataFromAPI.project_head.client_name)"
            ></p>
            <p class="noEmailMD">
              {{
                dataFromAPI.organisation_data.phone
                  ? dataFromAPI.project_head.client_contact_number
                  : "NA"
              }}
              |
              {{
                dataFromAPI.organisation_data.email_id
                  ? dataFromAPI.project_head.client_email_id
                  : ""
              }}
            </p>
            <p class="addressBlackBoxMD">
              {{ dataFromAPI.project_head.address }}
            </p>
          </div>
          <hr class="hrMD" />
          <div class="preByContMD">
            <p class="preForMD">PREPARED BY</p>
            <p class="nameBlackBoxMD">
              {{ dataFromAPI.project_head.project_creator_name }}
            </p>
            <p class="noEmailMD">
              {{ dataFromAPI.project_head.project_creator_phone_number }} |
              {{ dataFromAPI.organisation_data.email_id }}
            </p>
            <p
              v-if="dataFromAPI.organisation_data.address"
              class="addressBlackBoxMD"
            >
              {{ dataFromAPI.organisation_data.address[0] }}
            </p>
          </div>
        </div>
      </div>

      <div class="secTwoContCO">
        <div class="secTwoCont">
          <p class="strokeCO">Company Overview</p>
          <h3 class="headingCO">Company Overview</h3>
          <p
            class="contentCO"
            style="text-align: left; -webkit-line-clamp: unset; padding: 0"
          >
            {{ dataFromAPI.organisation_data.about_us }}
          </p>
          <div class="imagesContCO">
            <div
              class="imgOneContCO"
              v-if="
                dataFromAPI.previous_project_details.previous_project_one_image
              "
            >
              <!-- <img src="./img/unnamed (3).webp" class="imgOneCO" /> -->
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_one_image
                "
                class="imgOneCO"
              />
              <div class="overlayCO"></div>
              <div class="contentContCO">
                <!-- <p class="pName">Project name goes here...</p> -->
                <p class="pName">
                  {{
                    dataFromAPI.previous_project_details
                      .previous_project_one_name
                  }}
                </p>
                <p class="prePro">Previous Project</p>
              </div>
            </div>
            <div
              class="imgTwoContCO"
              v-if="
                dataFromAPI.previous_project_details.previous_project_two_image
              "
            >
              <!-- <img src="./img/unnamed (3).webp" class="imgTwoCO" /> -->
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_two_image
                "
                class="imgOneCO"
              />
              <div class="overlayCO"></div>
              <div class="contentContCO">
                <!-- <p class="pName">Project name goes here...</p> -->
                <p class="pName">
                  {{
                    dataFromAPI.previous_project_details
                      .previous_project_two_name
                  }}
                </p>
                <p class="prePro">Previous Project</p>
              </div>
            </div>
            <div
              class="imgThreeContCO"
              v-if="
                dataFromAPI.previous_project_details
                  .previous_project_three_image
              "
            >
              <!-- <img src="./img/unnamed (6).webp" class="imgTwoCO" /> -->
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_three_image
                "
                class="imgOneCO"
              />
              <div class="overlayCO"></div>
              <div class="contentContCO">
                <!-- <p class="pName">Project name goes here...</p> -->
                <p class="pName">
                  {{
                    dataFromAPI.previous_project_details
                      .previous_project_three_name
                  }}
                </p>
                <p class="prePro">Previous Project</p>
              </div>
            </div>
          </div>
          <p class="footCO">
            Our professional experts are certified and highly trained. We are
            licensed, bonded and insured.
          </p>
          <hr class="hrTwo" />
          <div class="iconContCO">
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.webp" class="iconCO" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="iconCO" />
          </div>
        </div>
      </div>

      <div class="secTwoContSL">
        <!-- <design-overview /> -->
        <div class="secThreeCont">
          <p class="stroke">System Layout</p>
          <h3 class="headingSL">System Layout</h3>
          <div class="sunSimContSL">
            <designOverview :isReport="isReport" />
          </div>

          <p class="stroke">System Details</p>
          <h3 class="headingSD">System Details</h3>

          <div class="accordianTable">
            <button class="accordionTableSDS">
              System Components
              <img src="./img/Group 63.svg" class="whiteArrSD" />
            </button>
            <div class="panelTableSDS" id="tableContainerSDSId">
              <table id="customersSDS">
                <tbody id="allComponentValuesId" class="allComponentValues">
                  <tr class="tablevalueSDS tbleHeaderNone">
                    <td class="tablevalueWidthSDS firTble boldTxtSDS">
                      Component
                    </td>
                    <td class="tablevalueWidthSDS secTble boldTxtSDS">
                      Manufacturer
                    </td>

                    <!-- <td class="tablevalueWidthSDS frTble boldTxtSDS">Model</td> -->
                    <td class="tablevalueWidthSDS frTble boldTxtSDS">Qty.</td>
                  </tr>

                  <tr
                    class="tablevalueSDS"
                    v-for="(data, index) in createdArray"
                    :key="index"
                  >
                    <td class="tablevalueWidthSDS firTble">
                      <p class="BoldTableMD">Component</p>
                      <br class="brTag" />
                      {{ data.component }}
                    </td>
                    <td class="tablevalueWidthSDS secTble">
                      <p class="BoldTableMD">Manufacturer</p>
                      <br class="brTag" />
                      {{ data.make }}
                    </td>
                    <!-- <td class="tablevalueWidthSDS thrTble"><p class="BoldTableMD">Model</p><br class="brTag"/>
                                  {{ systemComponent.model }}</td> -->
                    <td class="tablevalueWidthSDS frTble">
                      <p class="BoldTableMD">Qty.</p>
                      <br class="brTag" />
                      <!-- {{ data.count }} -->
                      <div class="value_type">
                        <display-length
                          v-if="
                            data.component === 'Handrail' ||
                            data.component === 'Walkways' ||
                            data.component === 'Safetyline' ||
                            data.component === 'DC Cable' ||
                            data.component === 'AC Cable' ||
                            data.component === 'Railings' ||
                            data.component === 'Cable Conduits' ||
                            data.component === 'Earthing Strip' ||
                            data.component === 'Lifeline'
                          "
                          :metric-value="parseFloat(data.count).toFixed(2)"
                          :appendMeterUnit="true"
                        />
                        <span
                          v-else-if="
                            data.component === 'Structure' ||
                            data.component === 'Racking System' ||
                            data.component === 'BOS' ||
                            !data.make
                          "
                        ></span>
                        <span v-else class="nowrap">
                          {{ parseFloat(data.count).toFixed(0) || "-" }}
                          </span
                        >
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="accordianTableSO">
            <button class="accordionTableSO">
              System Orientation
              <img src="./img/Group 63.svg" class="whiteArrSO" />
            </button>
            <div class="tableContainerSO panelTableSO" id="tableContainerSOId">
              <table id="customersSO">
                <tbody id="allComponentValuesId" class="allComponentValues">
                  <tr class="tablevalueSO tbleHeaderNone">
                    <td class="tablevalueWidthSO firTbleSO boldTxtSO">
                      Orientation
                    </td>
                    <td class="tablevalueWidthSO secTbleSO boldTxtSO">Tilt</td>
                    <td class="tablevalueWidthSO thrTbleSO boldTxtSO">
                      Azimuth
                    </td>
                    <td class="tablevalueWidthSO frTbleSO boldTxtSO">
                      Modules
                    </td>
                    <!-- <td class="tablevalueWidthSO fivTbleSO boldTxtSO">Inverters</td> -->
                    <td class="tablevalueWidthSO sixTbleSO boldTxtSO">
                      Array Size (DC)
                    </td>
                  </tr>
                  <tr
                    class="tablevalueSDS"
                    v-for="(data, index) in createdSystemOrientationArray"
                    :key="index"
                  >
                    <td class="tablevalueWidthSO firTbleSO">
                      <p class="BoldTableMD">Orientation</p>
                      <br class="brTag" />
                      {{ data.orientation }}
                    </td>
                    <td class="tablevalueWidthSO secTbleSO">
                      <p class="BoldTableMD">Tilt</p>
                      <br class="brTag" />
                      {{ data.tilt }}
                    </td>
                    <td class="tablevalueWidthSO thrTbleSO">
                      <p class="BoldTableMD">Azimuth</p>
                      <br class="brTag" />
                      {{ data.azimuth }}
                    </td>
                    <td class="tablevalueWidthSO frTbleSO">
                      <p class="BoldTableMD">Modules</p>
                      <br class="brTag" />
                      {{ data.modules }}
                    </td>
                    <!-- <td class="tablevalueWidthSO fivTbleSO"><p class="BoldTableMD">Inverters</p><br class="brTag"/>
                                    {{ systemOrientation.values[4] }}
                                    </td> -->
                    <td class="tablevalueWidthSO sixTbleSO">
                      <p class="BoldTableMD">Array Size (DC)</p>
                      <br class="brTag" />
                      {{ data.arraySizeDC }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="dataFromAPI.battery_data['batteries'].length">
            <p class="stroke">Battery Storage</p>
            <h3 class="headingSD">Battery Storage</h3>

            <div class="footerContBS">
              <div class="containerBS">
                <img src="./img/Group 1745.svg" class="thunderIcon" />
                <div class="tbcContainerBS">
                  <p class="tbcContentBS">Total Battery Capacity</p>
                  <h3 class="tbcValueBS">
                    {{ dataFromAPI.battery_data["total_battery_capacity"] }} kWh
                  </h3>
                </div>
              </div>
              <div class="boxOneBS">
                <img src="./img/cloudWeb.svg" class="cloudImgBS" />
                <div class="BOContBS">
                  <div class="ftrIconsBS">
                    <p class="dAndHrsBS">
                      {{ batteryBackupOnStorageAndLoadText }}
                    </p>
                  </div>
                  <p class="strgBS">on storage with critical load</p>
                </div>
              </div>
              <div class="boxOneBS">
                <img src="./img/cloudEngWeb.svg" class="cloudImgBS" />
                <div class="BOContBS">
                  <div class="ftrIconsBS">
                    <p class="dAndHrsBS">{{ batteryBackupOnStorageText }}</p>
                  </div>
                  <p class="strgBS">on storage only</p>
                </div>
              </div>
              <div class="boxTwoBS">
                <img src="./img/sunWeb.svg" class="cloudImgBS" />
                <div class="BOContBS">
                  <div class="ftrIconsBS">
                    <p class="dAndHrsBS">
                      {{ batteryBackupOnStorageAndSolarText }}
                    </p>
                  </div>
                  <p class="strgBS">on solar & storage</p>
                </div>
              </div>
            </div>

            <table id="customersSDS">
              <thead id="headComponents">
                <tr class="tableHeaderSDS">
                  <th class="tableHeaderWidthBS oneHead">
                    Battery<br class="brTag" />
                    Manufacturer
                  </th>
                  <th class="tableHeaderWidthBS twoHead">Model</th>
                  <th class="tableHeaderWidthBS threeHead">Capacity</th>
                  <th class="tableHeaderWidthBS fourHead">Quantity.</th>
                </tr>
              </thead>
              <tbody id="allComponentValuesId" class="allComponentValues">
                <tr
                  class="tablevalueBS"
                  v-for="(battery, index) in dataFromAPI.battery_data[
                    'batteries'
                  ]"
                  :key="index"
                >
                  <td class="tablevalueWidthBS firTbleBS">
                    {{ battery["name"] }}
                  </td>
                  <td class="tablevalueWidthBS secTbleBS">
                    {{ battery["model"] }}
                  </td>
                  <td class="tablevalueWidthBS thrTbleBS">
                    {{ battery["capacity"] }} kW
                  </td>
                  <td class="tablevalueWidthBS frTbleBS">
                    {{ battery["quantity"] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="secTwoContPVS">
        <div class="secThreeContPVS">
          <p class="strokePVS">Production vs Savings</p>
          <h3 class="headingPVS">Production vs Savings</h3>
          <div class="radioBtnPVS boxed">
            <input
              type="radio"
              id="android"
              name="skills"
              value="Estimated Monthly Savings"
              class="inputOnePVS"
              @click="displayEstimatedMonthlySavingsDivFunc()"
              checked
            />
            <label for="android" class="labelOnePVS"
              >Estimated Monthly Savings</label
            >

            <input
              type="radio"
              id="ios"
              name="skills"
              value="Estimated Annual Production"
              class="inputTwoPVS"
              @click="displayEstimatedAnnualProductionDivFunc()"
            />
            <label for="ios" class="labelTwoPVS"
              >Estimated Annual Production</label
            >
          </div>
          <div
            class="estimatedMonthlySavingsDiv"
            v-if="displayEstimatedMonthlySavingsDiv"
          >
            <p class="contentPVS">
              Although solar will reduce your utility bill throughout the year,
              the greatest savings will come in months with higher solar
              generation.
            </p>
            <div class="flexContPVS">
              <div class="graphContPVS">
                <!-- <img src="./img/Group 275.svg" class="graphPVS" /> -->
                <div class="chartDivPVS">
                  <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels" :savingsGraph="savingsGraph"/> -->
                  <p class="yUnitPVS">
                    {{
                      currencySymbolNameMap[dataFromAPI.country.currency_code]
                    }}
                  </p>
                  <div class="chartPVS">
                    <web-proposal-bar-chart-savings
                      :savingsData="savingsData"
                      :savingsDataLabels="savingsDataLabels"
                      :currencyCode="currencyCode"
                      :reportTemplate="reportTemplate"
                    />
                  </div>
                </div>
              </div>
              <div class="graphSideContPVS">
                <p class="estAvgPVS">Estimated Average Monthly Savings</p>
                <p class="estRateValPVS">
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.average_monthly_saving_usa
                    )
                  }}/month
                </p>
              </div>
            </div>
          </div>
          <div
            class="estimatedAnnualProductionDiv"
            v-if="displayEstimatedAnnualProductionDiv"
          >
            <p class="contentPVS">
              During the first year of operation, your system is estimated to
              produce
              {{
                convertedWithComaskWh(
                  parseFloat(
                    dataFromAPI.system_metrics["Annual Production_usa"].replace(
                      ",",
                      ""
                    )
                  ).toFixed(0)
                )
              }}
              kWh*.
            </p>
            <div class="flexContPVS">
              <div class="graphContPVS">
                <!-- <img src="./img/Group 275.svg" class="graphPVS" /> -->
                <div class="chartDivPVS">
                  <!-- <web-proposal-bar-chart :productionData="productionData" :productionDataLabels="productionDataLabels" :productionGraph="productionGraph"/> -->
                  <p class="yUnit-kWhPVS">kWh</p>
                  <div class="chartPVS">
                    <web-proposal-bar-chart-production
                      :productionData="productionData"
                      :productionDataLabels="productionDataLabels"
                      :reportTemplate="reportTemplate"
                    />
                  </div>
                </div>
                <p class="graphContentPVS">
                  * Based on 8760 shading analysis and NREL TMY weather data
                </p>
              </div>
              <div class="graphSideContPVS">
                <p class="estAvgPVS">
                  Estimated Average Generation of the System
                </p>
                <p class="estAvgValPVS">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Average Monthly Production"]
                    )
                  }}
                  kWh/month
                </p>
                <p class="estRatePVS">Estimated Annual Degradation Rate</p>
                <p class="estRateValPVS">
                  {{ dataFromAPI.system_metrics["Degradation Rate"] }}%/year
                </p>
              </div>
            </div>
          </div>
          <div class="diduKnowContPVS">
            <div class="diduKnowPVS">Did You Know?</div>
            <p class="diduKnowValuePVS">
              The value of homes with a solar PV system can increase by up to
              4.1% over comparable homes without solar. (based on a Zillow.com
              study).
            </p>
          </div>
          <p class="strokePVA">PV as an Asset</p>
          <h3 class="headingPVA">PV as an Asset</h3>
          <div class="flexContPVA">
            <div class="cardPVA">
              <p class="cardHeadPVA">Lifetime Savings</p>
              <p class="cardValuePVA">
                {{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(dataFromAPI.financial_data.total_savings)
                }}
              </p>
            </div>
            <div class="cardPVA">
              <p class="cardHeadPVA">Payback Period</p>
              <p class="cardValuePVA">
                {{ dataFromAPI.financial_data.payback.years }} yrs.
                {{ dataFromAPI.financial_data.payback.months }} mos.
              </p>
            </div>
            <div class="cardPVA">
              <p class="cardHeadPVA">Price</p>
              <!-- <p class="cardValuePVA">${{ dataFromAPI.financial_data.price_per_watt }}/Wp</p> -->
              <!-- <p class="cardValuePVA" v-if="dataFromAPI.financial_data.price_per_w_usa !== null || dataFromAPI.financial_data.price_per_w_usa !== ' '"> -->
              <!-- {{ currencySymbolNameMap[dataFromAPI.country.currency_code] +  convertedWithComas(dataFromAPI.financial_data.price_per_w_usa) }}/W abcd -->
              <!-- {{currencySymbolNameMap[dataFromAPI.country.currency_code] +  computedPrice(dataFromAPI.financial_data)}} -->

              <!-- </p> -->

              <p
                class="cardValuePVA"
                v-if="dataFromAPI.financial_data.price_per_watt !== null"
              >
                {{
                  convertedWithComas(dataFromAPI.financial_data.price_per_watt)
                }}
                {{ dataFromAPI.country.currency_code }}/W
              </p>
              <p
                class="cardValuePVA"
                v-if="dataFromAPI.financial_data.absolute_price !== null"
              >
                {{
                  convertedWithComas(dataFromAPI.financial_data.absolute_price)
                }}
                {{ dataFromAPI.country.currency_code }}
              </p>
              <p
                class="cardValuePVA"
                v-if="dataFromAPI.financial_data.price_per_kw !== null"
              >
                {{
                  convertedWithComas(dataFromAPI.financial_data.price_per_kw)
                }}
                {{ dataFromAPI.country.currency_code }}/kW
              </p>
            </div>
          </div>
          <div class="flexCont2PVA">
            <div class="card2PVA">
              <p class="cardHead2PVA">Internal Rate of Return</p>
              <p class="cardValue2PVA">{{ dataFromAPI.financial_data.irr }}%</p>
            </div>
            <div class="card2PVA">
              <p class="cardHead2PVA">Year 1 Usage Offset</p>
              <p class="cardValue2PVA">
                {{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%
              </p>
            </div>
            <div class="card2PVA">
              <p class="cardHead2PVA">LCOE</p>
              <p class="cardValue2PVA">{{ dataFromAPI.financial_data.LCOE }}</p>
            </div>
            <div class="card2PVA">
              <p class="cardHead2PVA">System Life</p>
              <p class="cardValue2PVA">
                {{ dataFromAPI.financial_data.expected_life_years }} Years
              </p>
            </div>
            <div class="card2PVA">
              <p class="cardHead2PVA">Savings from Solar</p>
              <p class="cardValue2PVA">
                {{ dataFromAPI.financial_data.savings_from_Solar }}%
              </p>
            </div>
            <div
              class="card2PVA"
              v-if="
                dataFromAPI.insentives_data &&
                dataFromAPI.insentives_data.length
              "
            >
              <p class="cardHead2PVA">Incentives</p>
              <span
                v-for="(insentive_check, index) in dataFromAPI.insentives_data"
                :key="index"
              >
                <p
                  class="cardValue2PVA"
                  v-if="insentive_check.amount_percentage == 0"
                >
                  {{ insentive_check.name }}- ${{
                    convertedWithComas(insentive_check.amount_required)
                  }}
                </p>
                <p class="cardValue2PVA" v-else>
                  {{ insentive_check.name }}-
                  {{ insentive_check.amount_percentage }}%
                </p>
              </span>
            </div>
            <div class="card2PVA" v-else>
              <p class="cardHead2PVA">Incentives</p>
              <p class="cardValue2PVA">-</p>
            </div>
          </div>
          <div class="graphContPVA">
            <!-- <img src="./img/Group 272.svg" class="graphPVA" /> -->
            <div class="chartDivPVA">
              <p class="yUnitBreakEvenPVA">
                {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}
              </p>
              <div class="chartBreakEvenPVA">
                <web-proposal-bar-chart
                  :breakEvenAnalysisData="breakEvenAnalysisData"
                  :breakEvenAnalysisDataLabels="breakEvenAnalysisDataLabels"
                  :currencyCode="currencyCode"
                  :reportTemplate="reportTemplate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secTwoContSL">
        <div class="secThreeCont">
          <p class="stroke">System Pricing</p>
          <h3 class="headingSL">System Pricing</h3>
          <div class="metrics_data common_inside">
            <div class="containerSP">
              <div class="columnSP">
                <p class="labelSP">Base Price</p>
                <p class="valSP">
                  {{ handleCurrencySymbol }}
                  {{ dataFromAPI.base_price }}
                </p>
              </div>
              <div
                class="columnSP"
                v-if="dataFromAPI.adders && isHomeOwnerFacing('adder')"
              >
                <p class="labelSP">Add-ons</p>
                <p class="valSP">
                  {{ handleCurrencySymbol }}{{ dataFromAPI.adders }}
                </p>
              </div>
              <div
                v-for="adder in dataFromAPI.adders_and_discounts"
                :key="adder.id"
              >
                <div
                  v-if="
                    adder.adders_discounts__type === 'adder' &&
                    adder.adders_discounts__is_homeowner_facing === true
                  "
                  class="paddingColumnSP"
                >
                  <p
                    class="labelSP"
                    v-if="adder.adders_discounts__is_homeowner_facing === true"
                  >
                    {{ adder.adders_discounts__name }}
                  </p>
                  <p
                    class="valSp"
                    v-if="adder.adders_discounts__show_adder_total === true"
                  >
                    {{ handleCurrencyFormate(adder.amount * adder.quantity) }}
                  </p>
                </div>
              </div>

              <div
                v-if="dataFromAPI.discounts && isHomeOwnerFacing('discount')"
              >
                <div class="columnSP">
                  <p class="labelSP">Discounts{{ isHomeOwnerFacing }}</p>
                  <p class="valSP" v-if="dataFromAPI.discounts != 0">
                    {{ handleCurrencySymbol }}{{ dataFromAPI.discounts }}
                  </p>
                </div>

                <div
                  v-for="disc in dataFromAPI.adders_and_discounts"
                  :key="disc.id"
                >
                  <div
                    class="paddingColumnSP"
                    v-if="
                      disc.adders_discounts__type === 'discount' &&
                      disc.adders_discounts__is_homeowner_facing === true
                    "
                  >
                    <p
                      class="labelSP"
                      v-if="disc.adders_discounts__is_homeowner_facing === true"
                    >
                      {{ disc.adders_discounts__name }}
                    </p>
                    <p
                      class="valSP"
                      v-if="disc.adders_discounts__show_adder_total === true"
                    >
                      {{ handleCurrencyFormate(disc.amount * disc.quantity) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="totalColumnSP">
                <p class="labelSPBlue">
                  Total Payable Now (See Payment Schedule)
                </p>
                <p class="labelSPBlue">
                  {{ handleCurrencySymbol
                  }}{{ dataFromAPI.total_cost_before_incentive }}
                </p>
              </div>
              <div class="columnSP">
                <p class="labelSP">Incentive</p>
                <p class="valSP">
                  -{{ handleCurrencySymbol }}{{ dataFromAPI.total_insentive }}
                </p>
              </div>
              <div
                v-for="insentives in dataFromAPI.insentives_data"
                :key="insentives.id"
              >
                <div class="paddingColumnSP">
                  <p class="labelSP">{{ insentives.name }}</p>
                  <p class="valSP">
                    {{
                      handleCurrencyFormate(insentives.tot_amount_contribution)
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secTwoContPVS">
        <div class="secThreeContPVS">
          <p class="strokeCNG">Cost of Not Going Solar</p>
          <h3 class="headingCNG">Cost of Not Going Solar</h3>
          <p class="contentCNG">
            Energy prices increase every year. Solar energy protects from these
            rising rates by limiting or reducing the need for energy supplied
            from the utility.
          </p>
          <div class="graphContCNG">
            <!-- <img src="./img/Group 274.svg" class="graphCNG" /> -->
            <div class="chartDivCNG">
              <p class="yUnitBillWithOrWithoutSolarCNG">
                {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}
              </p>
              <div class="chartBillWithOrWithoutSolarCNG">
                <web-proposal-multi-bar-chart
                  :estimatedUtilityBillWithSolarData="
                    estimatedUtilityBillWithSolarData
                  "
                  :estimatedUtilityBillWithoutSolarData="
                    estimatedUtilityBillWithoutSolarData
                  "
                  :estimatedUtilityBillDataLabels="
                    estimatedUtilityBillDataLabels
                  "
                  :currencyCode="currencyCode"
                  :reportTemplate="reportTemplate"
                />
              </div>
            </div>
          </div>
          <div class="flexContainerCGS">
            <div class="avgGenContainerCGS">
              <div class="sqBlueCGS"></div>
              <span class="avgGenValueCGS">Bill With Solar</span>
            </div>
            <div class="yrDegContainerCGS">
              <div class="sqGreyCGS"></div>
              <p class="avgGenValueCGS">Bill Without Solar</p>
            </div>
          </div>
          <p class="graphContentCNG">
            Historically, utility rates have increased more than 1.5% over
            annual inflation and electricity charges have increased 4.5% between
            2007 - 2022.
          </p>
        </div>
      </div>

      <div class="secTwoContWAR">
        <div
          class="secThreeContWAR"
          v-if="dataFromAPI.country.country_code == 'US'"
        >
          <p class="strokeWAR">Warranties</p>
          <h3 class="headingWAR">Warranties</h3>
          <!-- TEST -->
          <div class="tableContainerWTY">
            <table id="customersWTY">
              <tr class="tableHeaderWTY">
                <th class="tableHeaderWidthWTY" colspan="4">
                  Product Warranty
                </th>
              </tr>
              <tr class="tablevalueWTY tbleHeaderNone">
                <th class="tablevalueWidthWTY oneWTY boldWTY">Component</th>
                <th class="tablevalueWidthWTY twoWTY boldWTY">Manufacturer</th>
                <!-- <th class="tablevalueWidthWTY threeWTY boldWTY">Model</th> -->
                <th class="tablevalueWidthWTY fourWTY boldWTY">Warranty</th>
              </tr>
              <tr
                class="tablevalueWTY"
                v-for="(data, index) in warrantyArray"
                :key="index"
              >
                <template>
                  <td
                    class="tablevalueWidthWTY oneWTY"
                    v-if="
                      data.component === 'Modules' ||
                      data.component === 'Inverters'
                    "
                  >
                    <p class="BoldTableMD">Component</p>
                    <br class="brTag" />
                    {{ data.component }}
                  </td>
                  <td
                    class="tablevalueWidthWTY twoWTY"
                    v-if="
                      data.component === 'Modules' ||
                      data.component === 'Inverters'
                    "
                  >
                    <p class="BoldTableMD">Manufacturer</p>
                    <br class="brTag" />
                    {{ data.make }}
                  </td>
                  <td
                    class="tablevalueWidthWTY fourWTY"
                    v-if="createdArray.length"
                  >
                    <p class="BoldTableMD">Warranty</p>
                    <br class="brTag" />
                    {{ isWarrantyApplicable(data.component) }}
                  </td>
                </template>
              </tr>
            </table>
          </div>
        </div>
        <div class="secThreeContWAR">
          <p class="strokeIR">Installation Roadmap</p>
          <h3 class="headingIR">Installation Roadmap</h3>

          <section id="conference-timeline">
            <div class="conference-center-line"></div>
            <div
              class="conference-timeline-content"
              v-for="(data, index) in installationRoadmap"
              :key="index"
            >
              <!-- Article -->
              <div class="timeline-article">
                <div
                  :class="[
                    data.step.left
                      ? 'content-left-container'
                      : 'content-right-container',
                  ]"
                >
                  <div
                    :class="[data.step.left ? 'content-left' : 'content-right']"
                  >
                    <p class="headIR" v-if="data.step.head">
                      {{ data.step.head }}
                    </p>
                    <p class="valueIR" v-if="data.step.value">
                      ({{ data.step.value }}).
                    </p>
                  </div>
                  <span class="timeline-author">{{ data.step.author }}</span>
                </div>
                <div class="meta-date">
                  <span class="date">{{ data.step.date }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div
        class="secTwoContFAQ"
        v-if="
          dataFromAPI.frequently_asked_questions &&
          dataFromAPI.frequently_asked_questions.length
        "
      >
        <div class="secThreeContFAQ">
          <p class="strokeFAQ">Frequently Asked Questions</p>
          <h3 class="headingFAQ">Frequently Asked Questions</h3>

          <div class="FAQContainer">
            <div v-for="(faq, index) in faqData" :key="index">
              <button class="accordion">
                Q. {{ faq.question }}
                <img src="./img/Group 67.svg" class="whiteArrFAQ" />
              </button>
              <div class="panel">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secTwoContSAA">
        <div class="secThreeContSAA">
          <p class="strokeSAA">Summary and Approvals</p>
          <h3 class="headingSAA">Summary and Approvals</h3>
          <p class="contentSAA">
            {{ dataFromAPI.organisation_data.name }} proposes to install the
            solar energy system outlined in this proposal for a turn-key price
            of
            {{
              currencySymbolNameMap[dataFromAPI.country.currency_code] +
              finalCost
            }}, which includes sales tax. This includes design, project
            management, procurement, materials, installation, and quality
            assurance.
          </p>
          <div class="tableContainerSAA">
            <table id="customersSAA">
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">System Size (DC STC)</td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Module DC Nameplate"]
                    )
                  }}
                  kWp
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">
                  Estimated Year 1 Production
                </td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Annual Production_usa"]
                    )
                  }}
                  kWh
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">
                  Estimated Year 1 Savings
                </td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.monthly_saving_year
                    )
                  }}
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">Price</td>
                <!-- <td class="tablevalueWidthSAA twoSAA">${{ dataFromAPI.financial_data.price_per_watt }}/Wp</td> -->
                <!-- <td class="tablevalueWidthSAA twoSAA" v-if="dataFromAPI.financial_data.price_per_w_usa !== null || dataFromAPI.financial_data.price_per_w_usa !== ' '"> -->
                <!-- {{ currencySymbolNameMap[dataFromAPI.country.currency_code] +  convertedWithComas(dataFromAPI.financial_data.price_per_w_usa) }}/W -->
                <!-- {{currencySymbolNameMap[dataFromAPI.country.currency_code] +  computedPrice(dataFromAPI.financial_data)}} -->
                <!-- </td> -->

                <td class="tablevalueWidthSAA twoSAA">
                  <p v-if="dataFromAPI.financial_data.price_per_watt !== null">
                    {{
                      convertedWithComas(
                        dataFromAPI.financial_data.price_per_watt
                      )
                    }}
                    {{ dataFromAPI.country.currency_code }}/W
                  </p>
                  <p v-if="dataFromAPI.financial_data.absolute_price !== null">
                    {{
                      convertedWithComas(
                        dataFromAPI.financial_data.absolute_price
                      )
                    }}
                    {{ dataFromAPI.country.currency_code }}
                  </p>
                  <p v-if="dataFromAPI.financial_data.price_per_kw !== null">
                    {{
                      convertedWithComas(
                        dataFromAPI.financial_data.price_per_kw
                      )
                    }}
                    {{ dataFromAPI.country.currency_code }}/kW
                  </p>
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">Module</td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ getFirstComponents[0].make }}
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">Inverter</td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ getFirstComponents[1].make }}
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">
                  Energy Generated from Solar
                </td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">
                  Electricity Bill Saved from Solar
                </td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ dataFromAPI.financial_data.savings_from_Solar }}%
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">Utility Company</td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ dataFromAPI.system_metrics.Utility_Company }}
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">Billing Rate</td>
                <td class="tablevalueWidthSAA twoSAA">
                  {{ dataFromAPI.system_metrics.utilityRate }}
                </td>
              </tr>
              <tr class="tablevalueSAA">
                <td class="tablevalueWidthSAA oneSAA">
                  Annual Electric Rate Increase
                </td>
                <td class="tablevalueWidthSAA twoSAA">2%</td>
              </tr>
            </table>
          </div>
          <div class="flexContSAA">
            <div class="flexSAA">
              <p class="headSAA">Total Cost</p>
              <p class="valueSAA">
                {{
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
              <p class="headSAA">Incentives</p>
              <p class="valueSAA">
                -{{
                  handleCurrencyFormate(
                    parseFloat(
                      dataFromAPI.total_insentive.replace(/,/g, "")
                    )
                  )
                }}
              </p>
            </div>
            <div class="flexSAA">
              <p class="headSAA">Cost After Incentives</p>
              <p class="valueSAA">
                {{ handleCurrencySymbol
                }}{{
                  dataFromAPI.total_cost_after_adders_and_discounts_incentive
                }}
              </p>
            </div>
          </div>
          <p class="contentTwoSAA">
            Additional charges will be included if changes are made to the
            project scope once this document has been signed and/or differences
            between the allowance outlined above and the actual cost of these
            items varies.
          </p>
          <div class="solarFinContSAA">
            <div class="roiContainerSAA">
              <h4 class="roiSAA">Your Return on Investment (ROI)</h4>
              <ul>
                <li class="listRoiSAA">
                  Over the next
                  {{ dataFromAPI.financial_data.expected_life_years }} years,
                  you will save an estimated
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(dataFromAPI.financial_data.total_savings)
                  }}
                  in energy costs.
                </li>
                <li class="listRoiSAA">
                  Your new solar energy system will pay for itself in energy
                  cost savings in
                  {{ dataFromAPI.financial_data.payback.years }} yr.
                  {{ dataFromAPI.financial_data.payback.months }}mos.
                </li>
              </ul>
            </div>
            <el-button
              type="primary"
              class="solarFinBtn"
              @click="isUserDetailsPopupVisible = true"
              >Get Solar Financing</el-button
            >
          </div>
          <!-- {{ referenceIdUrl }} -->
          <!-- {{ designId }} -->
          <share-proposal-popup
            v-if="isShareProposalPopupVisible"
            :isShareProposalPopupVisible.sync="isShareProposalPopupVisible"
            :systemCapacity="systemCapacity"
            :referenceIdUrl="referenceIdUrl"
            :projectCreator="projectCreator"
            :design_id="dataFromAPI.design_id"
            :currencyCode="currencyCode"
          />
          <UserDetailsPopup
            v-if="isUserDetailsPopupVisible"
            :isUserDetailsPopupVisible.sync="isUserDetailsPopupVisible"
          />
          <div class="contAAS">
            <div class="headingContAAS">
              <p class="accASign">Accept & Sign</p>
              <!-- {{ !checkURL }} -->
              <div
                v-if="userToken"
                class="shareContAAS"
                @click="openShareProposalPopup()"
              >
                <img src="./img/share-fill.svg" class="shareIcon" />
                <span class="sAndD">Share</span>
              </div>
            </div>
            <esignPlugin
              :referenceId="referenceId"
              :proposalData="proposalData"
            ></esignPlugin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebProposalBarChartSavings from "../../components/ui/charts/commonCharts/webProposalBarChartSavings.vue";
import WebProposalBarChartProduction from "../../components/ui/charts/commonCharts/webProposalBarChartProduction.vue";
import webProposalBarChart from "../../components/ui/charts/commonCharts/webProposalBarChart.vue";
import webProposalMultiBarChart from "../../components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
import API from "@/services/api";
import shareProposalPopup from "./shareProposalPopup.vue";
import UserDetailsPopup from "./userDetailsPopup.vue";
import { checkEmailValidation } from "../../core/utils/utils";
import designOverview from "../designOverview/DesignOverview.vue";
import esignPlugin from "../../components/ui/esignPlugin.vue";
import currencySymbolNameMap from "../currency-symbol-name-map";
import { Form } from "element-ui";
import { formatNumberWithCommas } from "@/utils.js";
import { modifyBackupTime } from "./../../pages/design/components/js/utils";

import { mapState } from "pinia";
import { useProjectStore } from "../../stores/project";
import {
  getCurrencySymbol,
  getFormattedCurrencyComas,
  getFormattedNumberWithCurrency,
} from "../../utils/numberFormat/currencyFormatter.js";
export default {
  data() {
    return {
      countryCode: "",
      // savingsGraph: true,
      // productionGraph: true,
      //   currencyCode: this.dataFromAPI.country.currency_code,
      proposalData: {},
      proposalState: "PENDING",
      designVersion: null,
      reportTemplate: "webProposal",
      currencyCode: "",
      isReport: true,
      isNameValid: true,
      isEmailValid: true,
      referenceId: this.$route.params.designUUID,
      nameIsRequired: false,
      emailIsRequired: false,
      enterValidEmail: false,
      acceptanceCheckbox: false,
      enteredName: "",
      enteredEmail: "",
      webProposalPageUrl: window.location.href,
      dataFromAPI: [],
      isShareProposalPopupVisible: false,
      displayEstimatedMonthlySavingsDiv: true,
      displayEstimatedAnnualProductionDiv: false,
      isLoading: true,
      designId: this.$route.params.designId,
      isUserDetailsPopupVisible: false,
      // designId: this.$route.params.designId || this.$route.params.designId1,
      // designId: 31502,
      savingsDataLabels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      productionDataLabels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      breakEvenAnalysisDataLabels: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
      estimatedUtilityBillDataLabels: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ],
      installationRoadmap: [
        {
          step: {
            head: "Review and Approve Proposed Design",
            value: "Owner",
            author: "John Doe",
            date: "01",
            left: true,
          },
        },
        {
          step: {
            head: "Detailed System Design and Engineering",
            value: "We'll Take Care of it!",
            author: "John Doe",
            date: "02",
          },
        },
        {
          step: {
            head: "Plans Sent to HOA Review, if Applicable.",
            value: "We Provide the Information, You Submit it to the HOA",
            author: "John Doe",
            date: "03",
            left: true,
          },
        },
        {
          step: {
            head: "Approvals by Utility and Municipality",
            value: "We'll Take Care of it!",
            author: "John Doe",
            date: "04",
          },
        },
        {
          step: {
            head: "System Installation and Commissioning",
            value: "We'll Take Care of it!",
            author: "John Doe",
            date: "05",
            left: true,
          },
        },
        {
          step: {
            head: "Obtain Permission to Operate (PTO) from Utility",
            value: "We'll Take Care of it!",
            author: "John Doe",
            date: "06",
          },
        },
        {
          step: {
            head: "Turn System On, and Start Saving Money!",
            value: null,
            author: "John Doe",
            date: "07",
            left: true,
          },
        },
        {
          step: {
            head: "Join Our Referral Program!",
            value: null,
            author: "John Doe",
            date: "08",
          },
        },
      ],

      // faqData: testAPIResponse.frequently_asked_questions,
    };
  },

  components: {
    webProposalBarChart,
    webProposalMultiBarChart,
    shareProposalPopup,
    designOverview,
    WebProposalBarChartProduction,
    WebProposalBarChartSavings,
    esignPlugin,
    UserDetailsPopup,
    // chartjstest
  },

  nonReactiveData() {
    return {
      currencySymbolNameMap,
    };
  },
  //   created(){
  //     this.testAPI();
  //   },
  mounted() {
    this.testAPI();
  },

  updated() {
    this.faqAccordion();
    this.toggleAccordionTableSDS();
    this.toggleAccordionTableSO();
  },
  computed: {
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
    }),

    clientNameComputed() {
      return (
        this.dataFromAPI.project_head.client_name ||
        this.dataFromAPI.project_head.name
      );
    },
    handleCurrencySymbol() {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode));
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },

    finalCost() {
      return (
        parseFloat(this.dataFromAPI.total_cost_after_incentive) +
        parseFloat(this.dataFromAPI.total_insentive.replace(/,/g, ""))
      ).toFixed(2);
    },
    //     finalCost() {
    //       let totalCost = 0;
    //       let dcSize = 0;

    //       if(this.dataFromAPI.system_metrics["Module DC Nameplate"]){
    //          dcSize = parseFloat(this.dataFromAPI.system_metrics["Module DC Nameplate"].split(" ")[0]);
    //       }

    //       if (this.dataFromAPI.financial_data.price_per_kw) {
    //         totalCost  = Math.round(
    //           parseFloat(this.dataFromAPI.financial_data.price_per_kw) * dcSize * 1000) / 1000;
    //         } else if(this.dataFromAPI.financial_data.price_per_watt){
    //           totalCost = Math.round( parseFloat(this.dataFromAPI.financial_data.price_per_watt) * dcSize * 1000 * 1000 ) / 1000;
    //         }else if(this.dataFromAPI.financial_data.absolute_price){
    //          totalCost =Math.round(parseFloat(this.dataFromAPI.financial_data.absolute_price.replace(/,/g,"")) * 1000)/ 1000;
    //         }
    //         else{
    //           totalCost = 0;
    //         }

    //         if(this.dataFromAPI.financial_data.tax){
    //           totalCost += totalCost * this.dataFromAPI.financial_data.tax / 100;
    //         }
    //         // if (this.maintenanceCostUnit == "relative" &&  this.financingDetailsForm.maintenance_cost){
    //         //   this.maintenance_cost = this.financingDetailsForm.maintenance_cost * this.summary.nameplateDcSize;
    //         // }
    //         // else{
    //         //   this.maintenance_cost = this.financingDetailsForm.maintenance_cost;
    //         // }

    //         // if(!this.maintenance_cost){
    //         //   this.maintenance_cost = 0;
    //         // }

    //         // var totalMaintenanceCost = this.maintenance_cost * this.financingDetailsForm.expected_life_years;
    //         // console.log(totalMaintenanceCost);
    //         // this.finalCost= this.finalCost + totalMaintenanceCost;
    //         // console.log("total cost after adding maintainence", this.finalCost);

    //         // if(this.financingDetailsForm.subsidyUnit == "relative"){
    //         //   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_percentage_value/100;
    //         // }
    //         // else if(this.financingDetailsForm.subsidy_amount_value){
    //         //   this.finalCost -= this.finalCost * this.financingDetailsForm.subsidy_amount_value;
    //         // }

    //         // console.log("Cost after subsidy",this.finalCost);
    //         // if (this.financingDetailsForm.o_and_m_cost  && this.financingDetailsForm.system_lifetime){
    //         //   this.finalCost += this.financingDetailsForm.o_and_m_cost * this.financingDetailsForm.system_lifetime
    //         // }

    //         // if (this.financingDetailsForm.system_lifetime && this.financingDetailsForm.equipment_lifetime){
    //         // let frequency = (this.financingDetailsForm.system_lifetime - 1) / this.financingDetailsForm.equipment_lifetime
    //         //   if (this.financingDetailsForm.equipment_replacement_cost){
    //         //     this.finalCostt += frequency * this.financingDetailsForm.equipment_replacement_cost;
    //         //   }
    //         // }

    //         // console.log(this.finalCost);
    //         return totalCost.toFixed(2);
    //   },

    costAfterIncentive() {
      return parseFloat(
        this.finalCost -
          parseFloat(this.dataFromAPI.total_insentive.replace(",", ""))
      ).toFixed(2);
    },

    onChangeName() {
      return this.enteredName;
    },
    userToken() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.token;
    },
    onChangeEmail() {
      return this.enteredEmail;
    },

    checkURL() {
      return this.webProposalPageUrl.includes(this.referenceId);
    },

    // ...mapState({
    //   referenceId: (state) => state.versions.reference_id,
    // }),

    // ...mapGetters({
    //   summary: "GET_DESIGN_INFORMATION",
    //   profileData: "GET_DESIGN_VERSION_SETTINGS",
    //   designImageUrl: "GET_DESIGN_IMAGE",
    //   monthlyAc: "GET_DESIGN_MONTHLY_AC_GENERATION",
    //   lossData: "GET_DESIGN_LOSS_DATA",
    //   siteSurvey:"GET_EXPERT_SERVICE_INFO"
    // }),

    referenceIdUrl() {
      let url = new URL(this.webProposalPageUrl);
      console.log("url is", url);
      let newUrl = url.toString();
      let testUrl = newUrl.split("/");
      testUrl.pop();
      //   testUrl.push(this.designId);
      testUrl.push(this.referenceId);
      let referenceUrl = testUrl.join("/");
      // let referenceUrl = `http://localhost:8080/webProposalRef/${this.referenceId}/`
      return referenceUrl;
    },
    // systemCapacity: testAPIResponse.system_metrics["Module DC Nameplate"],
    systemCapacity() {
      return this.dataFromAPI.system_metrics["Module DC Nameplate"];
    },

    // projectCreator: testAPIResponse.project_head.project_creator_name,
    projectCreator() {
      return this.dataFromAPI.project_head.project_creator_name;
    },

    // savingsData: testAPIResponse.financial_data.monthly_saving,
    savingsData() {
      return this.dataFromAPI.financial_data.monthly_saving;
    },

    productionData() {
      let mainArray = this.dataFromAPI.monthly_table.values;
      mainArray.pop();
      let finalArray = [];
      for (let item in mainArray) {
        finalArray.push(mainArray[item][5]);
      }

      let lastArray = finalArray.map((str) => {
        return parseFloat(str.replace(",", ""));
      });
      return lastArray;
    },

    // breakEvenAnalysisData: testAPIResponse.financial_data.savings,
    breakEvenAnalysisData() {
      return this.dataFromAPI.financial_data.cumulative_savings;
    },

    // estimatedUtilityBillWithSolarData: testAPIResponse.financial_data.bill_with_solar,
    estimatedUtilityBillWithSolarData() {
      return this.dataFromAPI.financial_data.bill_with_solar;
    },

    // estimatedUtilityBillWithoutSolarData: testAPIResponse.financial_data.bill_without_solar,
    estimatedUtilityBillWithoutSolarData() {
      return this.dataFromAPI.financial_data.bill_without_solar;
    },

    faqData() {
      return this.dataFromAPI.frequently_asked_questions;
    },

    warrantyArray() {
      return this.createdArray.filter((item) => {
        return item.component === "Modules" || item.component === "Inverters";
      });
    },

    modifiedJson() {
      let data = this.dataFromAPI.components;
      delete data["components"];
      return data;
    },

    createdArray() {
      const bomData = [];
      // Restructuring bom data to fit in with table data
      for (let key in this.modifiedJson) {
        // Null pointer check
        if (
          typeof this.modifiedJson[key] === "undefined" ||
          this.modifiedJson[key] === null
        ) {
          // do nothing
        } else if (key == "manual_bom_data") {
          Object.keys(this.modifiedJson[key]).forEach((compKey) => {
            for (let i = 0; i < this.modifiedJson[key][compKey].length; i++) {
              let comp = this.modifiedJson[key][compKey][i];
              let compObj = JSON.parse(
                JSON.stringify({
                  component: comp.category,
                  make: comp.make,
                  count: comp.quantity,
                })
              );
              let condition =
                parseFloat(compObj.count) ||
                compObj.make.toLowerCase().includes("structure");
              if (condition) {
                bomData.push(compObj);
              }
            }
          });
        } else {
          const componentData = this.modifiedJson[key];
          componentData.forEach((arrayItem) => {
            if (arrayItem[1] !== 0) {
              let compObj = JSON.parse(
                JSON.stringify({
                  component: key.charAt(0).toUpperCase() + key.slice(1),
                  make: arrayItem[0],
                  count: arrayItem[1],
                })
              );
              if (compObj.component == "BOS") {
                compObj.component = arrayItem[0];
                compObj.make = "";
              }
              let condition =
                parseFloat(compObj.count) ||
                compObj.make.toLowerCase().includes("structure");
              if (condition) {
                bomData.push(compObj);
              }
            }
          });
        }
      }
      return bomData;
      // this.createdArray = bomData;
    },

    getFirstComponents() {
      let firstModule = null;
      let firstInverter = null;
      for (let i = 0; i < this.warrantyArray.length; i++) {
        const component = this.warrantyArray[i];
        if (component.component === "Modules" && firstModule === null) {
          firstModule = component;
        } else if (
          component.component === "Inverters" &&
          firstInverter === null
        ) {
          firstInverter = component;
        }
        if (firstModule !== null && firstInverter !== null) {
          break;
        }
      }
      return [firstModule, firstInverter];
    },

    modifiedSystemOrientationJson() {
      let data = this.dataFromAPI.field_segments_usa;
      delete data["headers"];
      return data;
    },

    createdSystemOrientationArray() {
      const bomData = [];
      // Restructuring bom data to fit in with table data
      for (let key in this.modifiedSystemOrientationJson) {
        // Null pointer check
        if (
          typeof this.modifiedSystemOrientationJson[key] === "undefined" ||
          this.modifiedSystemOrientationJson[key] === null
        ) {
          // do nothing
        } else {
          const componentData = this.modifiedSystemOrientationJson[key];
          componentData.forEach((arrayItem) => {
            if (arrayItem[1] !== 0) {
              bomData.push(
                JSON.parse(
                  JSON.stringify({
                    // component:
                    //     key.charAt(0).toUpperCase() +
                    //     key.slice(1),
                    // make: arrayItem[0],
                    // count: arrayItem[1],
                    // component:
                    //     key.charAt(0).toUpperCase() +
                    //     key.slice(1),
                    orientation: arrayItem[1],
                    tilt: arrayItem[2],
                    azimuth: arrayItem[3],
                    modules: arrayItem[4],
                    arraySizeDC: arrayItem[5],
                  })
                )
              );
            }
          });
        }
      }
      return bomData;
      // this.createdSystemOrientationArray = bomData;
    },
    batteryBackupOnStorageText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage
      );
    },

    batteryBackupOnStorageAndSolarText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage_and_solar
      );
    },

    batteryBackupOnStorageAndLoadText() {
      return modifyBackupTime(
        this.dataFromAPI.battery_data.battery_backup_on_storage_and_load
      );
    },
  },

  watch: {
    onChangeName: {
      handler() {
        this.checkName();
      },
    },
    onChangeEmail: {
      handler() {
        this.checkEmail();
      },
    },
  },
  created() {
    this.getProposalData();
  },
  methods: {
    handleCurrencyFormate(amount) {
      console.log(this.countryCode);
      console.log(getCurrencySymbol(this.countryCode, amount));
      return this.countryCode
        ? getFormattedCurrencyComas(this.countryCode, amount)
        : "";
    },
    isHomeOwnerFacing(flag) {
      if (this.dataFromAPI.adders_and_discounts.length > 0) {
        const adderDiscounts = this.dataFromAPI.adders_and_discounts;
        const isAdderHomewner = adderDiscounts.find(
          (d) =>
            d.adders_discounts__is_homeowner_facing === true &&
            d.adders_discounts__type === flag
        );
        const isDiscountHomewner = adderDiscounts.find(
          (d) =>
            d.adders_discounts__is_homeowner_facing === true &&
            d.adders_discounts__type === flag
        );
        if (isAdderHomewner) {
          return true;
        } else if (isDiscountHomewner) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    projectNameFiltered(val, short = false) {
      if (val) {
        if (short && val.length > 77) {
          const truncatedVal = val.slice(0, 77).replace(/`/g, "\\`") + "...";
          return truncatedVal;
        } else {
          const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
          return eval("`" + escapedVal + "`");
        }
      } else {
        return "-";
      }
    },

    projectNameFiltered(val) {
      if (val) {
        const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
        return eval("`" + escapedVal + "`");
      } else {
        return "-";
      }
    },

    computedPrice(obj) {
      var countOfDecimal = 2;
      if (this.currencySymbol == "د.إ") {
        countOfDecimal = 3;
      }
      if (!obj.price_per_kw && !obj.absolute_price && !obj.price_per_watt)
        return "-";
      if (!obj.absolute_price && !obj.price_per_watt) {
        return `${this.currencySymbol}${parseFloat(obj.price_per_kw).toFixed(
          countOfDecimal
        )}/kW`;
      } else if (!obj.absolute_price && !obj.price_per_kw) {
        return `${this.currencySymbol}${parseFloat(obj.price_per_watt).toFixed(
          countOfDecimal
        )}/W`;
      } else
        return `${this.currencySymbol}${parseFloat(obj.absolute_price).toFixed(
          countOfDecimal
        )}`;
    },
    convertedWithComas(value) {
      return formatNumberWithCommas(value, this.dataFromAPI.country.id === 91);
    },
    convertedWithComaskWh(value) {
      if (typeof value === "string") {
        return parseFloat(value.replace(/,/g, "")).toLocaleString("en-US");
      } else {
        return parseFloat(value).toLocaleString("en-US");
      }
    },

    async getProposalData() {
      try {
        const response2 = await API.PROPOSAL_INFO.GET_PROPOSAL_DETAILS(
          this.referenceId
        );
        this.proposalData = response2.data;
        this.proposalState = response2.data.state;
        this.designVersion = response2.data.design_version;
        const postData = {
          design_version: this.referenceId,
        };
        if (this.designVersion == null) {
          this.createProposal(postData);
        }
      } catch (e) {
        console.log(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while fetching proposal details",
          type: "error",
          center: true,
        });
      }
    },
    async createProposal(postData) {
      try {
        const response = await API.PROPOSAL_INFO.CREATE_PROPOSAL(postData);
        this.proposalData = response.data;
      } catch (e) {
        console.log(e);
        this.$message({
          showClose: true,
          message: "There was an unknown error while creating proposal",
          type: "error",
          center: true,
        });
      }
    },
    faqAccordion() {
      var acc = document.getElementsByClassName("accordion");

      for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var panel = this.nextElementSibling;
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      }
      // console.log(this.summary);
    },
    checkName() {
      if (!this.enteredName) {
        this.isNameValid = false;
      } else {
        this.isNameValid = true;
      }
    },

    checkEmail() {
      if (!checkEmailValidation(this.enteredEmail)) {
        this.isEmailValid = false;
      } else {
        this.isEmailValid = true;
      }
    },

    async acceptProposal() {
      this.nameIsRequired = false;
      this.enterValidEmail = false;
      this.emailIsRequired = false;
      try {
        const postData = {
          name: this.enteredName,
          email: this.enteredEmail,
          // link: this.webProposalPageUrl,
          signature: "",
        };
        console.log("payload", postData);
        this.resetAcceptProposalFields();
      } catch (error) {
        this.$message({
          showClose: true,
          message: "Failed to post details. Try Again!",
          type: "error",
          center: true,
        });
      }
    },

    resetAcceptProposalFields() {
      this.enteredName = "";
      this.enteredEmail = "";
    },

    openShareProposalPopup() {
      this.isShareProposalPopupVisible = true;
    },

    displayEstimatedMonthlySavingsDivFunc() {
      this.displayEstimatedMonthlySavingsDiv = true;
      this.displayEstimatedAnnualProductionDiv = false;
    },

    displayEstimatedAnnualProductionDivFunc() {
      this.displayEstimatedAnnualProductionDiv = true;
      this.displayEstimatedMonthlySavingsDiv = false;
    },

    isWarrantyApplicable(warranty) {
      if (warranty === "Modules") {
        return "25 yrs.";
      } else if (warranty === "Inverters") {
        return "25 yrs.";
      } else {
        return "";
      }
    },

    async testAPI() {
      console.log("testAPI", this.designId);
      try {
        this.isLoading = true;
        let response;
        response = await API.DESIGNS.FETCH_WEB_PROPOSAL_DATA_BY_REFRENCE_ID(
          this.referenceId
        );
        this.dataFromAPI = response.data;
        this.currencyCode = this.dataFromAPI.country.currency_code;
        this.countryCode = this.dataFromAPI.country.currency_code;
        console.log("testAPI response", response.data);
        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
        console.log("Error", error);
        this.$message({
          showClose: true,
          message: "Failed to fetch details. Try Again!",
          type: "error",
          center: true,
        });
      }
    },
    toggleAccordionTableSDS() {
      // console.log('toggle Accordion Table SDS');
      var acc = document.getElementsByClassName("accordionTableSDS");
      var i;

      for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var panel = this.nextElementSibling;
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      }
    },

    toggleAccordionTableSO() {
      // console.log('toggle accordion table SO');
      var acc = document.getElementsByClassName("accordionTableSO");
      var i;

      for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var panel = this.nextElementSibling;
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "BrandonText";
  word-break: break-word;
}

#err-email {
  color: red;
  /* font-size: 13px; */
}

.err-message-block {
  /* display: none; */
  width: 100%;
  height: 16px;
  margin: 5px 0 0 5px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
  font-size: 0.87rem;
  font-weight: normal;
  text-align: left;
  color: #ff0808;
}

.chartDivPVS {
  background-color: white;
  width: auto;
  /* width: 90%; */
  position: relative;
  padding-top: 40px;
}

.chartPVS {
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  height: 100%;
}

.chartPVS #bar-chart {
  /* background: yellow; */
}

.chartDivPVA {
  background-color: white;
  width: auto;
  position: relative;
  /* padding-top: 24px; */
  padding-top: 10px;
}

.chartBreakEvenPVA {
  /* background: yellow; */
  padding-left: 10px;
  padding-right: 10px;
}

.chartDivCNG {
  background-color: white;
  width: auto;
  position: relative;
  padding-top: 48px;
}

.chartBillWithOrWithoutSolarCNG {
  /* background: yellow; */
  padding-left: 10px;
  padding-right: 10px;
}

.chartBreakEven {
  /* width: 900px; */
  /* margin-left: 20px; */
  /* background: yellow; */
  padding: 20px;
}

.chartBillWithOrWithoutSolar {
  /* width: 900px; */
  /* margin-left: 20px; */
  /* background: yellow; */
  padding: 20px;
}

.yUnitPVS {
  position: absolute;
  top: 10px;
  left: 24px;
}

.yUnit-kWhPVS {
  position: absolute;
  top: 10px;
  left: 16px;
}

.yUnitBreakEvenPVA {
  position: absolute;
  top: 10px;
  left: 24px;
}

.yUnitBillWithOrWithoutSolarCNG {
  position: absolute;
  /* top: 30px; */
  top: 10px;
  left: 24px;
}

@font-face {
  font-family: "BrandonText";
  src: url("./fonts/HVD Fonts - BrandonText-Thin.otf");
  font-weight: 100;
}

@font-face {
  font-family: "BrandonText";
  src: url("./fonts/HVD Fonts - BrandonText-Bold.otf");
  font-weight: 600;
}

@font-face {
  font-family: "BrandonText";
  src: url("./fonts/HVD Fonts - BrandonText-Regular.otf");
  font-weight: 500;
}

.sectionOneImg {
  position: relative;
  height: 80vh;
  width: 100%;
  background-image: url("./img/Group 270.png");
  background-size: cover;
  background-position: center;
}

.sectionOneCont {
  width: 70%;
  margin: auto;
  padding-top: 14vh;
}

.headingOne {
  font-size: 72px;
  font-weight: 600;
  color: #fff;
  line-height: 1.1;
}

.pvSystemOne {
  font-size: 42px;
  color: #fff;
  font-weight: 500;
  margin: 11px auto 15px;
}

.hrOne {
  width: 80px;
  border: 4px solid #fff;
}

.contentOne {
  font-size: 18px;
  color: #fff;
  width: 555px;
  line-height: 1.6;
  margin-top: 24px;
}

.blackBoxMD,
.hrMD {
  display: none;
}

.blackBox {
  position: absolute;
  bottom: -100px;
  width: 70%;
  background-color: #263342;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 24px;
  justify-content: space-around;
}

.preForCont {
  width: 50%;
}

.preByCont {
  border-left: 1px solid #fff;
  padding-left: 24px;
  width: 50%;
}

.nameBlackBox {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.preFor,
.noEmail,
.addressBlackBox {
  font-size: 16px;
  color: #fff;
  margin-bottom: 8px;
}

.secTwoContCO {
  background-color: #f0f3f8;
}

.secTwoCont {
  width: 70%;
  margin: auto;
  padding-top: 175px;
  text-align: center;
  padding-bottom: 64px;
}

.strokeCO {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #f0f3f8;
  line-height: 1;
}

.headingCO {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.contentCO {
  font-size: 16px;
  font-weight: normal;
  color: #222;
  line-height: 1.6;
}

.imagesContCO {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 80px;
}

.imgOneContCO,
.imgTwoContCO,
.imgThreeContCO {
  position: relative;
  width: 33%;
  border-radius: 8px;
  transition: 0.5s ease;
}

.imgOneCO,
.imgTwoCO,
.imgThreeCO {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.imgOneContCO:hover,
.imgTwoContCO:hover,
.imgThreeContCO:hover {
  transform: translateY(-16px);
}

.imgOneContCO:hover .overlayCO,
.imgTwoContCO:hover .overlayCO,
.imgThreeContCO:hover .overlayCO {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(38, 51, 66, 0.1), #263342);
  transition: 0.5s ease;
  border-radius: 8px;
}

.contentContCO {
  position: absolute;
  bottom: 10px;
  text-align: left;
  left: 16px;
  display: none;
}

.imgOneContCO:hover .contentContCO,
.imgTwoContCO:hover .contentContCO,
.imgThreeContCO:hover .contentContCO {
  display: initial;
}

.pName {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  max-height: 100px;
  overflow: auto;
}

.prePro {
  font-size: 16px;
  font-weight: normal;
  color: #fff;
}

.footCO {
  font-size: 28px;
  font-weight: bold;
  color: #222;
  max-width: 702px;
  margin: 56px auto 24px auto;
}

.hrTwo {
  width: 80px;
  margin: 0px auto;
  border: 2px solid #ecdb41;
}

.iconContCO {
  max-width: 300px;
  max-height: 200px;
  margin: 28px auto 0px auto;
}

.iconCO {
  max-width: 300px;
  max-height: 200px;
}

.secTwoContSL {
  background-color: #fff;
}

.secThreeCont {
  width: 70%;
  margin: auto;
  padding-top: 50px;
  text-align: center;
  padding-bottom: 64px;
}

.stroke {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.headingSL {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.radioBtnContSLMD {
  display: none;
}

.radioBtnContSL {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f0f3f8;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border: 1px solid #ccc;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16);
}

.slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 0px;
  bottom: 0px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border: 1px solid #ccc;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(28px);
  transform: translateX(28px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.shaEffBtnCont,
.irradianceBtnCont {
  display: flex;
  gap: 12px;
  align-items: center;
}

.shEffBtn,
.irradianceBtn {
  font-size: 24px;
  font-weight: bold;
  color: #777;
}

.flexContSL {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
}

.cardSL {
  background-color: #f0f3f8;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 25%;
  text-align: left;
}

.cardHeadSL {
  font-size: 20px;
  font-weight: bold;
  color: #263342;
}

.cardValueSL {
  font-size: 28px;
  font-weight: bold;
  color: #263342;
}

.sunSimContSL {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #f0f3f8;
  border-radius: 8px;
  margin-top: 24px;
  margin-bottom: 70px;
  height: 95vh;
}

.sunImgContSL {
  width: 65%;
  height: auto;
  border-radius: 8px;
}

.sunImgSL {
  width: 100%;
  border-radius: 8px;
}

.headingSD {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.tablevalueWidthSDS {
  word-break: break-word;
  padding-left: 16px;
  padding: 10px 16px;
  line-height: 1.5;
  font-size: 16px;
}

.firTble {
  width: 20%;
  padding: 10px 8px 10px 16px;
}

.secTble {
  width: 40%;
  padding: 10px 8px;
}

.thrTble {
  width: 30%;
  padding: 10px 8px;
}

.frTble {
  width: 10%;
  padding: 10px 16px 10px 8px;
}

.boldTxtSDS {
  font-weight: 600;
}

.tablevalueSDS:nth-child(even) {
  background-color: #f0f3f8;
}

#customersSDS {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderWTY {
  background-color: #263342;
  color: #ffffff;
  font-size: 13px;
  text-align: left;
  vertical-align: baseline;
}

.tablevalueSDS {
  font-size: 13px;
  color: #222;
  text-align: left;
  vertical-align: baseline;
  word-break: break-word;
}

.accordianTable {
  position: relative;
}

.accordionTableSDS {
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: 0.4s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #263342;
  color: #ffffff;
  font-size: 18px;
  text-align: left;
  vertical-align: baseline;
  padding: 16px;
  border-radius: 4px;
}

.panelTableSDS {
  font-size: 16px;
  font-weight: normal;
  color: #222;
  background-color: #fff;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  text-align: left;
  /* background: yellow; */
}

.accordionTableSDS.active .whiteArrSD {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrSD {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
}

.tablevalueWidthSO {
  word-break: break-word;
  padding-left: 16px;
  padding: 10px 16px;
  line-height: 1.5;
  font-size: 16px;
}

.firTbleSO,
.secTbleSO,
.thrTbleSO,
.frTbleSO,
.fivTbleSO,
.sixTbleSO {
  width: 16.5%;
  padding: 10px 8px 10px 8px;
}

/* .secTbleSO {
    width: 40%;
    padding: 10px 8px;
}

.thrTbleSO {
    width: 30%;
    padding: 10px 8px;
}

.frTbleSO {
    width: 10%;
    padding: 10px 16px 10px 8px;
} */

.boldTxtSO {
  font-weight: 600;
}

.tablevalueSO:nth-child(even) {
  background-color: #f0f3f8;
}

#customersSO {
  width: 100%;
  border-collapse: collapse;
}

.tablevalueSO {
  font-size: 13px;
  color: #222;
  text-align: left;
  vertical-align: baseline;
  word-break: break-word;
}

.accordianTableSO {
  position: relative;
  margin-bottom: 64px;
}

.accordionTableSO {
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: 0.4s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #263342;
  color: #ffffff;
  font-size: 18px;
  text-align: left;
  vertical-align: baseline;
  padding: 16px;
  border-radius: 4px;
}

.panelTableSO {
  font-size: 16px;
  font-weight: normal;
  color: #222;
  background-color: #fff;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  text-align: left;
}

.accordionTableSO.active .whiteArrSO {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrSO {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
}

.containerBS {
  display: flex;
  gap: 8px;
  align-items: center;
  text-align: left;
}

.tbcContentBS {
  font-size: 24px;
  font-weight: 600;
  color: #777;
  margin-bottom: 4px;
}

.tbcValueBS {
  font-size: 34px;
  font-weight: bold;
  color: #222;
}

.footerContBS {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 24px;
  align-items: center;
  word-break: break-word;
  margin-bottom: 32px;
}

.boxOneBS,
.boxTwoBS {
  padding: 16px 16px;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  align-items: center;
  min-height: 130px;
  gap: 16px;
}

.dAndHrsBS {
  font-size: 24px;
  font-weight: 600;
  color: #222;
  text-align: left;
}

.strgBS {
  font-size: 18px;
  color: #222;
  line-height: 1.33;
  text-align: left;
}

#customersSDS {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderSDS {
  color: #fff;
  background-color: #263342;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  vertical-align: baseline;
  border-bottom: 1px solid #999;
  border-top: 1px solid #999;
}

.tableHeaderWidthBS {
  padding: 10px 16px;
  white-space: nowrap;
}

.oneHead {
  padding: 10px 8px 10px 16px;
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

.tablevalueWidthBS {
  word-break: break-word;
  padding-left: 16px;
  padding: 10px 16px;
  line-height: 1.5;
  font-size: 16px;
  text-align: left;
}

.firTbleBS {
  width: 30%;
  padding: 10px 8px 10px 16px;
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

.tablevalueBS:nth-child(even) {
  background-color: #f0f3f8;
}

.secTwoContPVS {
  background-color: #f0f3f8;
}

.secThreeContPVS {
  width: 70%;
  margin: auto;
  padding-top: 50px;
  text-align: center;
  padding-bottom: 64px;
}

.strokePVS {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #f0f3f8;
  line-height: 1;
}

.headingPVS {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.radioBtnPVS {
  position: relative;
  margin-bottom: 135px;
}

.labelOnePVS,
.labelTwoPVS {
  display: inline-block;
  width: 50%;
  height: 80px;
  padding: 10px;
  transition: all 0.3s;
  border-radius: 40px;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16);
  background-color: #fff;
  position: absolute;
  cursor: pointer;
}

.labelOnePVS {
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 40%;
  text-align: center;
  align-items: center;
  display: flex;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #263342;
}

.labelTwoPVS {
  margin-left: auto;
  margin-right: auto;
  left: 40%;
  right: 0;
  text-align: center;
  align-items: center;
  display: flex;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #263342;
}

.boxed input[type="radio"] {
  display: none;
}

.boxed input[type="radio"]:checked + .labelOnePVS {
  background-color: #263342;
  color: #fff;
  z-index: 1;
}

.boxed input[type="radio"]:checked + .labelTwoPVS {
  background-color: #263342;
  color: #fff;
  z-index: 1;
}

.contentPVS {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

.flexContPVS {
  display: flex;
  gap: 22px;
  margin-top: 26px;
}

.graphContPVS {
  width: 70%;
}

.graphPVS {
  width: 100%;
  height: auto;
}

.graphContentPVS {
  font-size: 14px;
  font-weight: normal;
  color: #222;
  text-align: left;
}

.graphSideContPVS {
  width: 30%;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.18);
  background-color: #fff;
  height: fit-content;
  text-align: left;
}

.estAvgPVS,
.estRatePVS {
  font-size: 16px;
  font-weight: normal;
  color: #222;
  margin-bottom: 6px;
}

.estAvgValPVS {
  margin-bottom: 24px;
}

.estAvgValPVS,
.estRateValPVS {
  font-size: 24px;
  font-weight: bold;
  color: #263342;
}

.diduKnowContPVS {
  border-radius: 4px;
  background-color: #fff;
  margin-top: 40px;
  position: relative;
  padding: 8px;
  width: 68%;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.12);
  margin-bottom: 64px;
}

.diduKnowPVS {
  background-color: #ecdb41;
  border-radius: 4px;
  position: absolute;
  padding: 8px 16px;
  top: -14px;
  left: 10px;
  font-size: 18px;
  font-weight: 600;
}

.diduKnowValuePVS {
  font-size: 16px;
  font-weight: 500;
  margin: 32px 0px 8px 0px;
  line-height: 1.5;
  word-break: break-word;
  text-align: left;
}

.strokePVA {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #f0f3f8;
  line-height: 1;
}

.headingPVA {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.flexContPVA {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
}

.cardPVA {
  background-color: #263342;
  padding: 24px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 33%;
}

.cardHeadPVA {
  font-size: 20px;
  font-weight: normal;
  color: #fff;
}

.cardValuePVA {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.flexCont2PVA {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  margin-bottom: 24px;
  justify-content: center;
  text-align: left;
  flex-wrap: wrap;
}

.card2PVA {
  border-radius: 4px;
  width: 32%;
}

.cardHead2PVA {
  font-size: 20px;
  font-weight: bold;
  color: #263342;
}

.cardValue2PVA {
  font-size: 18px;
  font-weight: normal;
  color: #222;
}

.graphContPVA {
  width: 100%;
  margin-bottom: 60px;
}

.graphPVA {
  width: 100%;
}

.strokeCNG {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #f0f3f8;
  line-height: 1;
}

.headingCNG {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.contentCNG {
  font-size: 16px;
  font-weight: normal;
  color: #263342;
  margin-bottom: 16px;
}

.graphContCNG {
  width: 100%;
  margin-bottom: 40px;
}

.graphCNG {
  width: 100%;
}

.flexContainerCGS {
  display: grid;
  grid-template-columns: auto auto;
  gap: 100px;
  justify-content: center;
  margin-bottom: 30px;
}

.avgGenContainerCGS,
.yrDegContainerCGS {
  display: flex;
}

.avgGenValueCGS {
  font-size: 18px;
  word-break: break-word;
  color: #222222;
  margin: 0;
}

.sqBlueCGS {
  width: 47px;
  height: 24px;
  background-color: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.sqGreyCGS {
  width: 47px;
  height: 24px;
  background-color: #ff8d8f;
  border-radius: 2px;
  margin-right: 8px;
}

.graphContentCNG {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

.secTwoContWAR {
  background-color: #fff;
}

.secThreeContWAR {
  width: 70%;
  margin: auto;
  padding-top: 50px;
  text-align: center;
  padding-bottom: 64px;
}

.strokeWAR {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.headingWAR {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.tableContainerWTY {
  margin: 14px auto 50px auto;
}

#customersWTY {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderWidthWTY {
  padding: 10px 16px;
  word-break: break-word;
  white-space: nowrap;
  font-size: 16px;
}

.tablevalueWidthWTY {
  word-break: break-word;
  padding: 10px 0px 10px 16px;
  line-height: 1.5;
  font-size: 16px;
}

.BoldTableMD {
  display: none;
}

.oneWTY {
  width: 16%;
}

.twoWTY {
  width: 28%;
}

.threeWTY {
  width: 28%;
}

.fourWTY {
  width: 28%;
}

.boldWTY {
  font-weight: 600;
}

.tablevalueWTY {
  text-align: left;
  background-color: #f0f3f8;
}

.tablevalueWTY:nth-child(even) {
  background-color: #fff;
}

.brTag {
  display: none;
}

.strokeIR {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.headingIR {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

#conference-timeline {
  position: relative;
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
}

#conference-timeline .timeline-start,
#conference-timeline .timeline-end {
  display: table;
  font-family: "Roboto", sans-serif;
  font-size: 18px;
  font-weight: 900;
  text-transform: uppercase;
  background: #00b0bd;
  padding: 15px 23px;
  color: #fff;
  max-width: 5%;
  width: 100%;
  text-align: center;
  margin: 0 auto;
}

#conference-timeline .conference-center-line {
  position: absolute;
  width: 4px;
  height: 90%;
  top: 90px;
  left: 50%;
  margin-left: -2px;
  background: #ccc;
  z-index: 0;
}

#conference-timeline .conference-timeline-content {
  padding-top: 24px;
}

.timeline-article {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  margin: 20px 0;
}

.timeline-article .content-left-container,
.timeline-article .content-right-container {
  max-width: 44%;
  width: 100%;
}

.timeline-article .timeline-author {
  display: block;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  color: #242424;
  text-align: right;
  visibility: hidden;
}

.timeline-article .content-left,
.timeline-article .content-right {
  position: relative;
  width: auto;
  padding: 27px 25px;
  text-align: left;
  border-radius: 8px;
  background-color: #fff;
  -webkit-box-shadow: 0px 3px 6px 0 rgb(0 0 0 / 16%),
    inset 0 0 3px rgb(0 0 0 / 16%);
  box-shadow: 0px 3px 6px 0 rgb(0 0 0 / 16%), inset 0 0 3px rgb(0 0 0 / 16%);
}

.timeline-article .headIR {
  padding: 0;
  font-weight: 600;
  color: #242424;
  font-size: 18px;
  line-height: 24px;
  position: relative;
}

.valueIR {
  font-size: 18px;
  font-weight: normal;
  margin-top: 4px;
}

.timeline-article .content-left-container {
  float: left;
}

.timeline-article .content-right-container {
  float: right;
}

.timeline-article .content-left:before,
.timeline-article .content-right:before {
  position: absolute;
  top: 20px;
  font-size: 23px;
  font-family: "FontAwesome";
  color: #fff;
}

.timeline-article .meta-date {
  position: absolute;
  top: 0;
  left: 50%;
  width: 81px;
  height: 80px;
  margin-left: -41px;
  color: #fff;
  border-radius: 100%;
  background: #fff;
  display: flex;
  border: 4px solid #ccc;
  align-items: center;
  justify-content: center;
}

.timeline-article .meta-date .date {
  display: block;
  text-align: center;
  font-weight: 600;
}

.timeline-article .meta-date .date {
  font-size: 36px;
  line-height: 40px;
  color: #777;
}

.secTwoContFAQ {
  background-color: #f0f3f8;
}

.secThreeContFAQ {
  width: 70%;
  margin: auto;
  padding-top: 50px;
  text-align: center;
  padding-bottom: 64px;
}

.strokeFAQ {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #f0f3f8;
  line-height: 1;
}

.headingFAQ {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.FAQContainer {
  background-color: #fff;
  padding: 25px 22px;
  margin-top: 24px;
  border-radius: 4px;
}

.accordion {
  background-color: #f0f3f8;
  color: #222;
  cursor: pointer;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  border: 1px solid #ccc;
  text-align: left;
  outline: none;
  transition: 0.4s;
  text-align: left;
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel {
  padding: 0 18px;
  font-size: 16px;
  font-weight: normal;
  color: #222;
  background-color: #fff;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  text-align: left;
}

.panel p {
  padding: 16px 0px 16px 0px;
  font-size: 16px;
}

.accordion.active .whiteArrFAQ {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrFAQ {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
}

.secTwoContSAA {
  background-color: #fff;
}

.secThreeContSAA {
  width: 70%;
  margin: auto;
  padding-top: 50px;
  text-align: center;
  padding-bottom: 64px;
}

.strokeSAA {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #ccc;
  font-size: 76px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.headingSAA {
  font-size: 48px;
  font-weight: 600;
  transform: translateY(-32px);
  line-height: 1;
}

.contentSAA {
  font-size: 18px;
  font-weight: 600;
  color: #263342;
  text-align: left;
}

.tableContainerSAA {
  margin: 30px auto 24px auto;
}

#customersSAA {
  width: 100%;
  border-collapse: collapse;
}

.tablevalueWidthSAA {
  word-break: break-word;
  padding: 12px 20px;
  line-height: 1.5;
  font-size: 16px;
}

.oneSAA {
  width: 65%;
}

.twoSAA {
  width: 35%;
}

.tablevalueSAA {
  text-align: left;
}

.tablevalueSAA {
  background-color: #f0f3f8;
}

.tablevalueSAA:nth-child(even) {
  background-color: #fff;
}

.flexContSAA {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  text-align: left;
}

.headSAA {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}

.valueSAA {
  font-size: 16px;
  font-weight: normal;
  color: #222;
}

.contentTwoSAA {
  font-size: 16px;
  font-weight: normal;
  color: #263342;
  text-align: left;
  margin: 21px auto 16px auto;
}

.solarFinContSAA {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.solarFinBtn {
  font-size: 18px;
  font-weight: 600;
  height: 56px;
  width: 210px;
}

.roiContainerSAA {
  margin: 16px 0px;
  text-align: left;
}

.roiSAA {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  word-break: break-word;
  margin: 8px 0px 8px 0px;
}

.roiContainerSAA ul {
  list-style-position: outside;
  margin-left: 22px;
}

.listRoiSAA {
  font-size: 16px;
  font-weight: 500;
  color: #263342;
  word-break: break-word;
  margin: 4px 0px 4px 0px;
  list-style-type: disc !important;
}

.contAAS {
  padding: 16px 24px;
  border-radius: 8px;
  background-color: #f0f3f8;
}

.shareContAASMD {
  display: none;
}

.headingContAAS,
.shareContAAS {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shareContAAS {
  padding: 10px 12px;
}

.accASign {
  font-size: 28px;
  font-weight: bold;
  color: #222;
}

.shareContAAS {
  border-radius: 4px;
  border: 1px solid #777;
  background-color: #fff;
  cursor: pointer;
}

.sAndD {
  font-size: 20px;
  font-weight: bold;
  color: #777;
  margin-left: 12px;
}

.inputsContAAS {
  display: flex;
  gap: 24px;
  text-align: left;
  margin-top: 32px;
}

.inpTextContAAS,
.signContAAS {
  width: 50%;
}

.inpLabAAS {
  font-size: 16px;
  font-weight: normal;
  color: #777;
}

.inpTextContAAS .inpAAS {
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
  outline: none;
  border: none;
  height: 48px;
  margin-bottom: 16px;
  margin-top: 2px;
  padding: 8px 16px;
  font-size: 16px;
}

.chekBxContAASMD {
  display: none;
}

.chekBxContAAS {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.inpChkAAS {
  width: 24px;
  height: 24px;
  border: 1px solid #999;
  border-radius: 2px;
  background-color: #fff;
  margin-right: 8px;
  cursor: pointer;
}

.chBxAAS {
  font-size: 16px;
  font-weight: normal;
  text-align: left;
  color: #263342;
}

.boldAAS {
  font-weight: 600;
}

.signDrwAAS {
  width: 100%;
  height: 273px;
}

.fBtnAAS {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 10px;
}

.rAsAAS {
  font-size: 20px;
  font-weight: bold;
  color: #777;
  padding: 10px 15px;
  background-color: #f0f3f8;
  border-radius: 4px;
  border: 1px solid #777;
  cursor: pointer;
}

.accpAAS {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  border-radius: 4px;
  background-color: #409eff;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}

.btnDisabled {
  opacity: 0.5;
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
  background-color: #f0f3f8;
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
.labelSPBlue,
.labelSPNormal {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.labelSPNormal {
  font-weight: 500;
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

@media only screen and (max-width: 1200px) {
  .sectionOneCont,
  .secTwoCont,
  .secThreeCont,
  .secThreeContPVS,
  .secThreeContWAR,
  .secThreeContFAQ,
  .secThreeContSAA,
  .blackBox {
    width: 80%;
  }
}

@media only screen and (max-width: 1050px) {
  .sectionOneCont,
  .secTwoCont,
  .secThreeCont,
  .secThreeContPVS,
  .secThreeContWAR,
  .secThreeContFAQ,
  .secThreeContSAA,
  .blackBox {
    width: 90%;
  }

  .sectionOneImg {
    background-position: right;
    height: 80vh;
  }

  .sectionOneCont {
    padding-top: 8vh;
  }
}

@media only screen and (max-width: 940px) {
  .flexContSL {
    gap: 2%;
    row-gap: 16px;
    flex-wrap: wrap;
  }

  .cardSL {
    width: 49%;
  }

  .card2PVA {
    width: 30%;
  }

  .strokeCO,
  .stroke,
  .strokePVS,
  .strokeCNG,
  .strokeIR,
  .strokeFAQ,
  .strokeSAA,
  .strokePVA,
  .strokeWAR {
    display: none;
  }

  .headingCO,
  .headingSL,
  .headingPVS,
  .headingPVA,
  .headingWAR,
  .headingFAQ,
  .headingSAA {
    margin-top: 20px;
  }

  .headingIR {
    transform: initial;
  }

  .flexContPVS {
    flex-direction: column;
  }

  .graphContPVS {
    width: 100%;
  }
}

@media only screen and (max-width: 775px) {
  .blackBox {
    display: none;
  }

  .sectionOneImg {
    background-position: 82% 0%;
    height: 70vh;
  }

  .sectionOneCont {
    padding-top: 16vh;
  }

  .blackBoxContMD {
    padding: 24px;
    background-color: #f0f3f8;
  }

  .blackBoxMD {
    position: relative;
    background-color: #263342;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    gap: 24px;
    justify-content: space-around;
  }

  .preForContMD {
    width: 50%;
  }

  .preByContMD {
    border-left: 1px solid #fff;
    padding-left: 24px;
    width: 50%;
  }

  .nameBlackBoxMD {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
  }

  .preForMD,
  .noEmailMD,
  .addressBlackBoxMD {
    font-size: 16px;
    color: #fff;
    margin-bottom: 8px;
  }

  .secTwoCont {
    padding-top: 24px;
  }
}

/*===== // Vertical Timeline =====*/

/*===== Resonsive Vertical Timeline =====*/
@media only screen and (max-width: 830px) {
  #conference-timeline .timeline-start,
  #conference-timeline .timeline-end {
    margin: 0;
  }

  #conference-timeline .conference-center-line {
    margin-left: 0;
    left: 37px;
  }

  .timeline-article .meta-date {
    margin-left: 0;
    left: 0px;
  }

  .timeline-article .content-left-container,
  .timeline-article .content-right-container {
    max-width: 100%;
    width: auto;
    float: none;
    margin-left: 93px;
    min-height: 53px;
  }

  .timeline-article .content-left-container {
    margin-bottom: 20px;
  }

  .timeline-article .content-left,
  .timeline-article .content-right {
    padding: 10px 25px;
    min-height: 65px;
  }

  .timeline-article .content-left:before {
    content: "\f0d9";
    right: auto;
    left: -8px;
  }

  .timeline-article .content-right:before {
    display: none;
  }

  .footerContBS {
    grid-template-columns: 1fr 1fr;
  }
}

@media only screen and (max-width: 400px) {
  .timeline-article .headIR {
    margin: 0;
  }

  .footerContBS {
    grid-template-columns: 1fr;
    grid-gap: 16px;
  }
}

@media only screen and (max-width: 620px) {
  .sectionOneImg {
    /* background-position: 82% 0%; */
    height: 80vh;
    overflow: hidden;
    background-image: url("./img/Group 319.png");
  }

  /* .overlayFPage {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        background-image: linear-gradient(to bottom, rgba(81, 125, 216, 0.5), rgba(70, 113, 210, 0.5));
        ;
        transition: .5s ease;
        border-radius: 8px;
    } */

  .headingOne {
    font-size: 50px;
  }

  .pvSystemOne {
    font-size: 24px;
  }

  .hrOne {
    border: 2px solid #fff;
  }

  .contentOne {
    width: auto;
  }

  .blackBoxMD {
    flex-direction: column;
  }

  .preByContMD {
    padding-left: 0px;
    border: none;
  }

  .preForContMD,
  .preByContMD {
    width: 100%;
  }

  .hrMD {
    display: initial;
    width: 112px;
    margin-bottom: 8px;
  }

  .blackBoxMD {
    gap: 16px;
  }

  .noEmailMD {
    line-height: 1.5;
  }

  .headingCO,
  .headingSL,
  .headingSD,
  .headingPVS,
  .headingPVA,
  .headingCNG,
  .headingWAR,
  .headingFAQ,
  .headingSAA,
  .headingIR {
    font-size: 32px;
  }

  .imgOneContCO:hover,
  .imgTwoContCO:hover,
  .imgThreeContCO:hover {
    transform: none;
    transition: 0.5s ease;
  }

  .contentContCO {
    display: initial;
  }

  .footCO {
    font-size: 24px;
    font-weight: bold;
    color: #222;
    max-width: 702px;
    margin: 32px auto 24px auto;
  }

  .iconContCO {
    margin-top: 16px;
  }

  .radioBtnContSL {
    display: none;
  }

  .radioBtnContSLMD {
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
    text-align: left;
  }

  .switchMD {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }

  .switchMD input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .sliderMD {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f0f3f8;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border: 1px solid #ccc;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16);
  }

  .sliderMD:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 0px;
    bottom: -1px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border: 1px solid #ccc;
  }

  #conference-timeline .conference-timeline-content {
    padding-top: 35px;
  }

  #conference-timeline .conference-center-line {
    height: 87%;
  }

  input:checked + .sliderMD {
    background-color: #2196f3;
  }

  input:focus + .sliderMD {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .sliderMD:before {
    -webkit-transform: translateX(21px);
    -ms-transform: translateX(21px);
    transform: translateX(21px);
  }

  /* Rounded sliders */
  .sliderMD.roundMD {
    border-radius: 34px;
  }

  .sliderMD.roundMD:before {
    border-radius: 50%;
  }

  .shaEffBtnContMD,
  .irradianceBtnContMD {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .shEffBtnMD,
  .irradianceBtnMD {
    font-size: 18px;
    font-weight: bold;
    color: #777;
  }

  .flexContSL {
    margin-top: 0px;
  }

  .headingFAQ {
    font-size: 27px;
  }

  .tableContainerWTY {
    margin: -8px auto 50px auto;
  }

  .FAQContainer {
    margin-top: 0px;
  }

  .imagesContCO {
    margin-top: 24px;
    flex-wrap: wrap;
  }

  .imgOneContCO,
  .imgTwoContCO,
  .imgThreeContCO {
    width: 100%;
  }

  .cardHeadSL {
    font-size: 16px;
  }

  .cardValueSL {
    font-size: 22px;
  }

  .sunSimContSL {
    flex-wrap: wrap;
    display: flex;
    background-color: #fff;
    padding: 0px;
  }

  .sunImgContSL {
    width: 100%;
  }

  .radioBtnPVS {
    position: relative;
    margin-bottom: 91px;
  }

  .labelOnePVS,
  .labelTwoPVS {
    font-size: 14px;
    height: 56px;
    width: 50%;
  }

  .labelOnePVS {
    padding: 10px 32px 10px 10px;
  }

  .labelTwoPVS {
    padding-right: 0px;
  }

  .flexContPVS {
    flex-wrap: wrap;
  }

  .graphContPVS,
  .graphSideContPVS,
  .diduKnowContPVS {
    width: 100%;
  }

  .diduKnowContPVS {
    margin-bottom: 80px;
  }

  .flexContPVA {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .cardPVA {
    width: 47%;
    padding: 16px 12px;
  }

  .cardHeadPVA {
    font-size: 18px;
  }

  .cardValuePVA {
    font-size: 24px;
  }

  .card2PVA {
    width: 47%;
  }

  .cardHead2PVA {
    font-size: 15px;
  }

  .avgGenValueCGS {
    font-size: 14px;
  }

  .flexContainerCGS {
    gap: 24px;
  }

  .secThreeContPVS,
  .secThreeContWAR,
  .secTwoCont,
  .secThreeCont {
    padding-bottom: 30px;
  }

  .timeline-article {
    margin: 0px !important;
  }

  .timeline-article .meta-date .date {
    font-size: 14px;
  }

  .timeline-article .meta-date {
    width: 38px;
    height: 37px;
  }

  #conference-timeline .conference-center-line {
    left: 17px;
    top: 59px;
  }

  .timeline-article .content-left-container,
  .timeline-article .content-right-container {
    margin-left: 52px;
    margin-bottom: 0px;
  }

  .timeline-article .headIR,
  .valueIR {
    font-size: 16px;
  }

  .secThreeContWAR {
    padding-bottom: 0px;
  }

  .FAQContainer {
    padding: 8px;
  }

  .accordion {
    font-size: 16px;
  }

  .whiteArrFAQ {
    margin-left: 12px;
  }

  .contentSAA {
    font-size: 16px;
    text-align: center;
  }

  #customersSAA {
    border: 1px solid #ccc;
  }

  .flexContSAA {
    flex-wrap: wrap;
    gap: 16px;
  }

  .flexSAA {
    width: 46%;
  }

  .roiSAA {
    margin: 30px 0px 8px 0px;
  }

  .listRoiSAA {
    margin: 8px 0px;
    list-style-type: disc !important;
  }

  .contAAS {
    width: 100vw;
    margin-left: -5vw;
    border-radius: 0px;
  }

  .shareContAAS {
    display: none;
  }

  .secThreeContSAA {
    padding-bottom: 0px;
  }

  .headingContAAS {
    justify-content: center;
  }

  .inputsContAAS {
    flex-wrap: wrap;
    gap: 0px;
  }

  .chekBxContAAS {
    display: none;
  }

  .chekBxContAASMD {
    display: flex;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 24px;
  }

  .inpChkAASMD {
    width: 24px;
    height: 24px;
    border: 1px solid #999;
    border-radius: 2px;
    background-color: #fff;
    margin-right: 8px;
  }

  .chBxAASMD {
    font-size: 16px;
    font-weight: normal;
    text-align: left;
    color: #263342;
  }

  .inpTextContAAS,
  .signContAAS {
    width: 100%;
  }

  .shareContAASMD {
    border-radius: 4px;
    border: 1px solid #777;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 30px;
    margin-top: 30px;
    cursor: pointer;
  }

  .sAndDMD {
    font-size: 20px;
    font-weight: bold;
    color: #777;
    margin-left: 12px;
  }

  .tablevalueWTY {
    display: flex;
    flex-wrap: wrap;
  }

  .oneWTY,
  .twoWTY,
  .threeWTY,
  .fourWTY,
  .firTble,
  .secTble,
  .thrTble,
  .frTble {
    width: 50%;
  }

  .firTbleSO,
  .secTbleSO,
  .thrTbleSO,
  .frTbleSO,
  .fivTbleSO,
  .sixTbleSO {
    width: 50%;
    padding: 10px 8px 10px 8px;
  }

  .tablevalueWidthSDS {
    padding: 8px 12px;
  }

  .BoldTableMD {
    display: initial;
    font-weight: bold;
    font-size: 16px;
  }

  .tablevalueWidthWTY {
    padding: 8px 12px;
  }

  .tablevalueWTY,
  .tablevalueSDS:nth-child(even) {
    background-color: #fff;
    padding: 6px;
  }

  .tablevalueSDS,
  .tablevalueWTY:nth-child(even) {
    background-color: #f0f3f8;
  }

  #customersWTY,
  .panelTableSDS,
  #customersSO {
    border: 1px solid #ccc;
  }

  .accordianTable {
    margin-bottom: 16px;
  }

  .tablevalueSDS {
    display: flex;
    flex-wrap: wrap;
  }

  .tbleHeaderNone {
    display: none;
  }

  .brTag {
    display: initial;
  }

  .tableHeaderSDS,
  .tablevalueBS {
    font-size: 12px;
  }

  .footerContBS {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .boxOneBS,
  .boxTwoBS {
    padding: 12px 16px;
    min-height: 90px;
    gap: 16px;
  }

  .tablevalueWidthBS {
    font-size: 12px;
  }

  .solarFinContSAA {
    gap: 0px;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .solarFinBtn {
    font-size: 16px;
    height: 48px;
    width: 180px;
  }

  .paddingColumnSP {
    padding-left: 24px;
  }

  .labelSP,
  .valSP,
  .labelSPBlue,
  .labelSPNormal {
    font-size: 14px;
  }
}
</style>
