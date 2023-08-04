<template>
  <div
    v-loading.fullscreen.lock="isLoading"
    class="reportLoaded"
    :class="[isPuppeteer ? 'puppeteer-report' : 'media-queries']"
  >
    <main class="potrait_screen">
      <!-- --------------------------------------SolarProjectProposal------------------------------------ -->
      <div class="SolarProjectProposal">
        <div class="headerRep">
          <div class="headerContentOne"></div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="headerTwo">
          <h2 class="headerTwoContentOne boldColor">
            Solar Project Proposal
            <!-- {{ dataFromAPI }} -->
          </h2>
          <h4 class="headerTwoContentTwo boldColor">
            {{
              convertedWithComaskWh(
                dataFromAPI.system_metrics["Module DC Nameplate"]
              )
            }}
            kWp Rooftop PV System
          </h4>
        </div>
        <div class="contContainer">
          <p class="preparedFor boldColor">PREPARED FOR</p>
          <p
            class="firstName boldColor"
            v-html="projectNameFiltered(clientNameComputed)"
          ></p>
          <p
            class="phNoOne"
            v-if="dataFromAPI.organisation_data.phone !== null"
          >
            {{ dataFromAPI.project_head.client_contact_number }}
          </p>
          <p
            class="mailOne"
            v-if="dataFromAPI.organisation_data.email_id !== null"
          >
            {{ dataFromAPI.project_head.client_email_id }}
          </p>
          <hr />
          <div class="userInfo">
            <p class="address">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div class="preparedByContainer">
            <h4 class="preparedBy boldColor">PREPARED BY</h4>
            <h2 class="nameBy boldColor">
              {{ dataFromAPI.project_head.project_creator_name }}
            </h2>
            <p class="tata">{{ dataFromAPI.organisation_data.name }}</p>
            <p class="phNo">
              {{ dataFromAPI.project_head.project_creator_phone_number }}
            </p>
            <p class="mailBy">{{ dataFromAPI.organisation_data.email_id }}</p>
            <p class="lic">{{ dataFromAPI.organisation_data.address[0] }}</p>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Application---------------------------------- -->

      <div
        class="application_section doc-page"
        v-show="pagesNew.includes('user-note')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div class="headerContentTwo">
            <!-- <img
                src="./assets/img/istockphoto-1331182224-612x612.png"
                class="logo"
              /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <hr class="hrHeaderAPL" />
        <div class="contentContainerAPL">
          <p class="appHeadAPL">
            Dear
            <span
              class="boldAPL"
              v-html="projectNameFiltered(clientNameComputed)"
            ></span
            ><span>,</span>
          </p>
          <h4 class="paraOneAPL">
            We realize that each solar project presents it own unique
            challenges. At {{ dataFromAPI.organisation_data.name }} we pride
            ourselves on creating a custom energy solution to meet the
            individual needs of your home, office, or commercial building.
          </h4>

          <p class="paraTwoAPL">
            The cost of energy from private or municipal owned utilities rises
            every year, all while we face the challenges of maintaining a
            healthy environment. Your choice to install a solar photovoltaic
            energy system is a simple way to both reduce your environmental
            footprint and lower your monthly energy bills. We know that you care
            about the environment as much as we do. Solar modules produce
            non-polluting, renewable energy from the greatest source of natural
            energy known - our very own sun. This proposal provides a system
            summary and the costs associated with installing an energy
            generating system at {{ dataFromAPI.project_head.address }}.
          </p>

          <p class="paraThreeAPL">
            Your system is estimated to produce
            {{ dataFromAPI.system_metrics["Annual Production_usa"] }} kWh per
            year with an expected lifetime of more than 25 years and will offset
            over {{ dataFromAPI.green_impact_data.co2_offset }} tons of C02,
            equal to planting
            {{ dataFromAPI.green_impact_data.acres_of_forest }} acres of trees!
          </p>

          <p class="paraFourAPL">
            {{ dataFromAPI.organisation_data.name }} is licensed to install your
            system by the state of {{ dataFromAPI.state }}, using certified
            equipment, a design reviewed and approved by competent engineers,
            and built by our experienced construction staff. The following pages
            will present in detail the system to be installed, equipment used,
            product warrantees, system cost, anticipated production, and
            financial payback.
          </p>

          <p class="paraFiveAPL">
            We confidently believe that our qualifications and past experience
            in the solar energy field make
            {{ dataFromAPI.organisation_data.name }} the right choice to meet
            your needs and look forward to making this project a reality.
          </p>

          <p class="sincerelyAPL">Sincerely,</p>
          <p class="sincerelyAPL">
            {{ dataFromAPI.project_head.project_creator_name }}
          </p>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Company overview---------------------------------- -->

      <div
        class="CompanyOverview_section doc-page"
        v-show="pagesNew.includes('company-overview')"
      >
        <div class="headerRep">
          <!-- {{ pages }} -->
          <!-- {{ pagesNew }} -->
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderCO secHeaderMD">
            <h1 class="secHeaderContentCO">Company Overview</h1>
          </div>
          <div class="contentCO">
            <p class="contentOneCO">
              {{ dataFromAPI.organisation_data.about_us }}
            </p>
          </div>
          <p class="contentHeadingCO">
            Our professional experts are certified and highly trained. We are
            licensed, bonded and insured.
          </p>
          <h4
            class="headCO"
            v-if="
              dataFromAPI.previous_project_details.previous_project_one_name ||
              dataFromAPI.previous_project_details.previous_project_two_name ||
              dataFromAPI.previous_project_details.previous_project_three_name
            "
          >
            Previous Projects
          </h4>

          <div class="contentImgCO">
            <div
              class="imgContainerCO"
              v-if="
                dataFromAPI.previous_project_details.previous_project_one_name
              "
            >
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_one_image
                "
                class="imgCO"
              />
              <p class="captionCO">
                {{
                  dataFromAPI.previous_project_details.previous_project_one_name
                }}
              </p>
            </div>
            <div
              class="imgContainerCO"
              v-if="
                dataFromAPI.previous_project_details.previous_project_two_name
              "
            >
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_two_image
                "
                class="imgCO"
              />
              <p class="captionCO">
                {{
                  dataFromAPI.previous_project_details.previous_project_two_name
                }}
              </p>
            </div>
            <div
              class="imgContainerCO"
              v-if="
                dataFromAPI.previous_project_details.previous_project_three_name
              "
            >
              <img
                :src="
                  dataFromAPI.previous_project_details
                    .previous_project_three_image
                "
                class="imgCO"
              />
              <p class="captionCO">
                {{
                  dataFromAPI.previous_project_details
                    .previous_project_three_name
                }}
              </p>
            </div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Our Team---------------------------------- -->

      <div
        id="ourTeamMain"
        v-show="pagesNew.includes('our-team') && teamMembersArray.length"
      >
        <div class="ourTeam_section doc-page" id="ourTeamId">
          <div class="headerRep" id="headerId">
            <div class="headerContentOne">
              <p
                class="headerName"
                v-html="projectNameFiltered(clientNameComputed)"
              ></p>
              <p class="headerAddress">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
          <div class="contentContainer" id="contentContainerId">
            <div class="secHeaderOT secHeaderMD" id="secHeaderOTId">
              <h1 class="secHeaderContentOT">Our Team</h1>
            </div>
            <!-- {{ teamMembersArray }} -->
            <div class="ourTeamContainerOT" id="ourTeamContainerOTId">
              <div id="allCEOs" class="allCeos">
                <div
                  class="ourTeamContOT"
                  id="c1"
                  v-for="(member, index) in teamMembersArray"
                  :key="index"
                >
                  <!-- <img src="./img/Ellipse 1.png" class="imgOT" /> -->
                  <img :src="member.image" class="imgOT" />
                  <div class="otContentOT">
                    <h4 class="nameOT">
                      {{ member.name }}, {{ member.position }}
                    </h4>
                    <p class="valueOT">
                      {{ member.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="footer" id="footerId">
            <hr class="hrFooter" />
            <p class="footerContent">
              Powered by <span class="bold2">ARKA 360</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------System layout---------------------------------- -->

      <div
        class="systemLayout_section doc-page"
        v-show="pagesNew.includes('system-layout')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderSL secHeaderMD">
            <h1 class="secHeaderContentSL">System Layout</h1>
          </div>

          <div class="imgContainerSL" v-loading="!dataFromAPI.detailed_layout">
            <img :src="dataFromAPI.detailed_layout" class="imgSL" />
          </div>
          <div class="scannerContSL">
            <div class="absoluteContSL">
              <p class="absoluteSL">
                Scan the QR code below to view a 3D model of your roof with the
                PV installed.
              </p>
            </div>
            <img class="scannerImgSL" :src="threeDLink" />
            <div class="absoluteContSL">
              <p class="absoluteSL">Or click 'View 3D Model' button below</p>
            </div>
            <div class="btnSL">
              <router-link
                :to="{
                  name: 'DesignOverview',
                  params: { designUUID: this.referenceIdFor3dLink },
                }"
                class="aTagSL"
              >
                View 3D Model
              </router-link>
            </div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------System details---------------------------------- -->

      <div id="sytemDetailsMain" v-show="pagesNew.includes('system-details')">
        <div class="systemDetails_section doc-page" id="systemDetailsId">
          <div class="headerRep">
            <div class="headerContentOne">
              <p
                class="headerName"
                v-html="projectNameFiltered(clientNameComputed)"
              ></p>
              <p class="headerAddress">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
          <div class="contentContainer">
            <div class="secHeaderSDS secHeaderMD" id="secHeaderSDSId">
              <h1 class="secHeaderContentSDS">System Details</h1>
            </div>

            <div class="tableContainerSDS" id="tableContainerSDSId">
              <h4 class="tableHeadingSDS" id="tableHeadingSDSId">
                System Components
              </h4>
              <table id="customersSDS">
                <thead id="headComponents">
                  <tr class="tableHeaderSDS">
                    <th class="tableHeaderWidthSDS oneHead">Component</th>
                    <th class="tableHeaderWidthSDS twoHead">Manufacturer</th>
                    <!-- <th class="tableHeaderWidthSDS threeHead">Model</th> -->
                    <th class="tableHeaderWidthSDS fourHead">Qty.</th>
                  </tr>
                </thead>
                <tbody id="allComponentValuesId" class="allComponentValues">
                  <tr
                    class="tablevalueSDS"
                    v-for="(data, index) in createdArray"
                    :key="index"
                  >
                    <td class="tablevalueWidthSDS firTble">
                      {{ data.component }}
                    </td>
                    <td class="tablevalueWidthSDS secTble">
                      {{ data.make }}
                    </td>
                    <!-- <td class="tablevalueWidthSDS thrTble">
                        AJP-SB60 330, 330 W<br />AJP-SB60 260, 260 W
                      </td> -->
                    <td class="tablevalueWidthSDS frTble">
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
              <div id="sysOrientation">
                <h4 class="tableHeading2SDS" id="tableHeading2SDSId">
                  System Orientation
                </h4>
                <table id="customersSDS2" class="customersSDS2Class">
                  <thead id="headOrientation">
                    <tr class="tableHeaderSDS">
                      <th class="thHeadSDS">Orientation</th>
                      <th class="thHeadSDS">Tilt</th>
                      <th class="thHeadSDS">Azimuth</th>
                      <th class="thHeadSDS">Modules</th>
                      <!-- <th class="thHeadSDS">Inverters</th> -->
                      <th class="thHeadSDS">Array Size (DC)</th>
                    </tr>
                  </thead>
                  <tbody
                    id="allOrientationValuesId"
                    class="allOrientationValues"
                  >
                    <tr
                      class="tablevalueSDS"
                      v-for="(data, index) in createdSystemOrientationArray"
                      :key="index"
                    >
                      <td class="thValueSDS">{{ data.orientation }}</td>
                      <td class="thValueSDS">{{ data.tilt }}</td>
                      <td class="thValueSDS">{{ data.azimuth }}</td>
                      <td class="thValueSDS">{{ data.modules }}</td>
                      <!-- <td class="thValueSDS">NA</td> -->
                      <td class="thValueSDS">{{ data.arraySizeDC }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="footer">
            <hr class="hrFooter" />
            <p class="footerContent">
              Powered by <span class="bold2">ARKA 360</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Battery Storage---------------------------------- -->

      <div
        id="batteryStorageMain"
        v-show="pagesNew.includes('battery-storage') && isBatteryAvailable"
      >
        <div class="batteryStorage_section doc-page" id="batteryStorageId">
          <div class="headerRep">
            <div class="headerContentOne">
              <p
                class="headerName"
                v-html="projectNameFiltered(clientNameComputed)"
              ></p>
              <p class="headerAddress">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
          <div class="contentContainer">
            <div class="secHeaderSDS secHeaderMD" id="batteryHeaderSDSId">
              <h1 class="secHeaderContentSDS">Battery Storage</h1>
            </div>
            <div class="tableContainerBattery" id="tableContainerBSId">
              <div class="iconsContBS">
                <div class="containerBS">
                  <img src="../img/Group 1745.svg" class="thunderIcon" />
                  <div class="tbcContainerBS">
                    <p class="tbcContentBS">Total Battery Capacity</p>
                    <h3 class="tbcValueBS">
                      {{
                        batteryData["total_battery_capacity"]
                          ? batteryData["total_battery_capacity"]
                          : "-"
                      }}
                      kWh
                    </h3>
                  </div>
                </div>
                <div class="containerBS">
                  <img src="../img/Group 2686.svg" class="thunderIcon" />
                  <div class="tbcContainerBS">
                    <p class="tbcContentBS">Additional Saving from Battery</p>
                    <h3 class="tbcValueBS">
                      {{
                        additionalSavingsPostBattery
                          ? currencySymbolNameMap[
                              dataFromAPI.country.currency_code
                            ] + additionalSavingsPostBattery
                          : "-"
                      }}
                    </h3>
                  </div>
                </div>
              </div>
              <p class="backupContentBS">In an outage, get a backup of</p>
              <div class="footerContBS">
                <div class="boxOneBS">
                  <img src="../img/cloud (2).svg" class="cloudImgBS" />
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
                  <img src="../img/Group 1746.svg" class="cloudImgBS" />
                  <div class="BOContBS">
                    <div class="ftrIconsBS">
                      <p class="dAndHrsBS">{{ batteryBackupOnStorageText }}</p>
                    </div>
                    <p class="strgBS">on storage only</p>
                  </div>
                </div>
                <div class="boxTwoBS">
                  <img
                    src="../img/brightness-high (2).svg"
                    class="cloudImgBS"
                  />
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

              <div class="batteryGraph">
                <p class="batteryUnit">
                  {{ currencySymbolNameMap[dataFromAPI.country.currency_code] }}
                </p>
                <battery-saving-analysis-chart
                  :estimatedUtilityBillWithSolarData="
                    estimatedUtilityBillWithSolarData
                  "
                  :estimatedUtilityBillWithoutSolarData="
                    residualEnergyPostBatteryBill
                  "
                  :estimatedUtilityBillDataLabels="
                    estimatedUtilityBillDataLabels
                  "
                  :currencyCode="currencyCode"
                  :reportTemplate="reportTemplate"
                />
              </div>

              <div class="flexContainerCGS">
                <div class="avgGenContainerCGS">
                  <div class="sqBlueCGS"></div>
                  <span class="avgGenValueCGS">Bill with Solar only</span>
                </div>
                <div class="yrDegContainerCGS">
                  <div class="sqGreyCGS"></div>
                  <p class="avgGenValueCGS">Bill with Solar & Battery</p>
                </div>
              </div>

              <table id="customersBattery">
                <thead id="headBattery">
                  <tr class="tableHeaderBattery">
                    <th class="tableHeaderWidthSDS oneHead">
                      Battery Manufacturer
                    </th>
                    <th class="tableHeaderWidthSDS twoHead">Model</th>
                    <th class="tableHeaderWidthSDS threeHead">Capacity</th>
                    <th class="tableHeaderWidthSDS fourHead">Quantity.</th>
                  </tr>
                </thead>
                <tbody id="allBatteryValuesId" class="allBatteryValues">
                  <tr
                    class="tablevalueSDS"
                    v-for="(battery, index) in batteryData['batteries']"
                    :key="index"
                  >
                    <td class="tablevalueWidthSDS firTbleBS">
                      {{ battery["name"] }}
                    </td>
                    <td class="tablevalueWidthSDS secTbleBS">
                      {{ battery["model"] }}
                    </td>
                    <td class="tablevalueWidthSDS thrTbleBS">
                      {{ battery["capacity"] }} kW
                    </td>
                    <td class="tablevalueWidthSDS frTbleBS">
                      {{ battery["quantity"] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="footer">
            <hr class="hrFooter" />
            <p class="footerContent">
              Powered by <span class="bold2">ARKA 360</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Estimated Annual Production---------------------------------- -->

      <div
        class="annualProduction_section doc-page"
        v-show="pagesNew.includes('estimated-annual-production')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderEAP secHeaderMD">
            <h1 class="secHeaderContentEAP">Estimated Annual Production</h1>
          </div>

          <div class="graphContainerEAP">
            <p class="graphContentEAP">
              During the first year of operation, your system is estimated to
              produce
              {{
                convertedWithComaskWh(
                  dataFromAPI.system_metrics["Annual Production_usa"]
                )
              }}
              kWh*.
            </p>
            <!-- <img src="./img/Group 56.png" class="graphImgEAP" /> -->
            <div class="chartDiv">
              <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels"/> -->
              <span class="yUnit-kWh">kWh</span>
              <div class="chart">
                <web-proposal-bar-chart-production
                  :productionData="productionData"
                  :productionDataLabels="productionDataLabels"
                  :reportTemplate="reportTemplate"
                />
              </div>
            </div>
            <p class="paraEAP">
              * Based on 8760 hours shading analysis and
              {{ dataFromAPI.system_metrics["Weather Dataset"] }} weather data
            </p>
            <div class="flexContainerEAP">
              <div class="avgGenContainerEAP">
                <p class="avgGenEAP">
                  Estimated Average Generation of the System
                </p>
                <p class="avgGenValueEAP">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Average Monthly Production"]
                    )
                  }}
                  kWh/month
                </p>
              </div>
              <div class="yrDegContainerEAP">
                <p class="yrDegEAP">Estimated Annual Degradation Rate</p>
                <p class="yrDegValueEAP">
                  {{ dataFromAPI.system_metrics["Degradation Rate"] }}%/year
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Estimated monthly Saving---------------------------------- -->

      <div
        class="monthlyProduction_section doc-page"
        v-show="pagesNew.includes('estimated-monthly-savings')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderEMS secHeaderMD">
            <h1 class="secHeaderContentEMS">Estimated Monthly Savings</h1>
          </div>

          <div class="graphContainerEMS">
            <p class="graphContentEMS">
              Although solar will reduce your utility bill throughout the year,
              the greatest savings will come in months with higher solar
              generation.
            </p>
            <!-- <img src="./img/Group 57.png" class="graphImgEMS" /> -->
            <div class="chartDiv">
              <!-- <web-proposal-bar-chart :savingsData="savingsData" :savingsDataLabels="savingsDataLabels"/> -->
              <span class="yUnit">{{
                currencySymbolNameMap[dataFromAPI.country.currency_code]
              }}</span>
              <div class="chart">
                <web-proposal-bar-chart-savings
                  :savingsData="savingsData"
                  :savingsDataLabels="savingsDataLabels"
                  :currencyCode="currencyCode"
                  :reportTemplate="reportTemplate"
                />
              </div>
            </div>
            <div class="flexContainerEMS">
              <div class="avgGenContainerEMS">
                <p class="avgGenEMS">Estimated Average Monthly Savings</p>
                <p class="avgGenValueEMS">
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.average_monthly_saving_usa
                    )
                  }}/month
                </p>
              </div>
            </div>

            <div class="diduKnowContEMS">
              <div class="diduKnowEMS">Did You Know?</div>
              <p class="diduKnowValueEMS">
                Your system can be paid back in
                {{ dataFromAPI.financial_data?.payback?.years }} years and
                {{ dataFromAPI.financial_data?.payback?.months }} months with
                incentives and produce free electricity after that during its
                lifetime.
              </p>
            </div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Site Evaluation----------------------------------------------- -->

      <div
        class="siteEvaluation_section doc-page"
        v-show="
          pagesNew.includes('site-evaluation') ||
          pagesNew.includes('shadow-analysis')
        "
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderSE secHeaderMD">
            <h1 class="secHeaderContentSE">Site Evaluation</h1>
          </div>
          <h3 class="paraSE">
            Effect of shading on your roof on the longest and the shortest days
            of the year.
          </h3>
          <h3 class="headingSE">Shading Effects</h3>
          <div class="imagesContainerSE">
            <div
              class="imageContSE"
              v-loading="!dataFromAPI.shadow_analysis_images"
            >
              <p class="imgContentSE">
                <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
                <!-- June 21 | {{ timeConvertion(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }} -->
                June 21 |
                {{
                  convertTimeTo12HourFormat(
                    dataFromAPI.report_defaults_data.shadowAnalysis
                      .start_time_shadow_analysis
                  )
                }}
              </p>
              <div
                v-loading="
                  !dataFromAPI.shadow_analysis_images ||
                  !dataFromAPI.shadow_analysis_images
                    .shadow_summer_start_time_image
                "
              >
                <img
                  :src="
                    dataFromAPI.shadow_analysis_images &&
                    dataFromAPI.shadow_analysis_images
                      .shadow_summer_start_time_image
                  "
                  class="imgSE"
                />
              </div>
            </div>
            <div
              class="imageContSE"
              v-loading="!dataFromAPI.shadow_analysis_images"
            >
              <p class="imgContentSE">
                <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS</p> -->
                <!-- June 21 | {{ timeConvertion(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }} -->
                June 21 |
                {{
                  convertTimeTo12HourFormat(
                    dataFromAPI.report_defaults_data.shadowAnalysis
                      .end_time_shadow_analysis
                  )
                }}
              </p>
              <div
                class="shadowAnalysisImages"
                v-loading="
                  !dataFromAPI.shadow_analysis_images ||
                  !dataFromAPI.shadow_analysis_images
                    .shadow_summer_end_time_image
                "
              >
                <img
                  :src="
                    dataFromAPI.shadow_analysis_images &&
                    dataFromAPI.shadow_analysis_images
                      .shadow_summer_end_time_image
                  "
                  class="imgSE"
                />
              </div>
            </div>
            <div
              class="imageContSE"
              v-loading="!dataFromAPI.shadow_analysis_images"
            >
              <p class="imgContentSE">
                <!-- December 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
                <!-- December 21 | {{ timeConvertion(dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis) }}  -->
                December 21 |
                {{
                  convertTimeTo12HourFormat(
                    dataFromAPI.report_defaults_data.shadowAnalysis
                      .start_time_shadow_analysis
                  )
                }}
              </p>
              <div
                class="shadowAnalysisImages"
                v-loading="
                  !dataFromAPI.shadow_analysis_images ||
                  !dataFromAPI.shadow_analysis_images
                    .shadow_winter_start_time_image
                "
              >
                <img
                  :src="
                    dataFromAPI.shadow_analysis_images &&
                    dataFromAPI.shadow_analysis_images
                      .shadow_winter_start_time_image
                  "
                  class="imgSE"
                />
              </div>
            </div>
            <div
              class="imageContSE"
              v-loading="!dataFromAPI.shadow_analysis_images"
            >
              <p class="imgContentSE">
                <!-- December 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
                <!-- December 21 | {{ timeConvertion(dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis) }} -->
                December 21 |
                {{
                  convertTimeTo12HourFormat(
                    dataFromAPI.report_defaults_data.shadowAnalysis
                      .end_time_shadow_analysis
                  )
                }}
              </p>
              <div
                class="shadowAnalysisImages"
                v-loading="
                  !dataFromAPI.shadow_analysis_images ||
                  !dataFromAPI.shadow_analysis_images
                    .shadow_winter_end_time_image
                "
              >
                <img
                  :src="
                    dataFromAPI.shadow_analysis_images &&
                    dataFromAPI.shadow_analysis_images
                      .shadow_winter_end_time_image
                  "
                  class="imgSE"
                />
              </div>
            </div>
          </div>
          <p class="summarySE">
            <span class="boldSE">Summary:</span> Panels are shadow free for
            {{ calcSolarTime(dataFromAPI.system_metrics["Shading Loss"]) }}% of
            solar time throughout the year.
          </p>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Site Evaluation Two----------------------------------------------- -->

      <div
        class="siteEvaluationTwo_section doc-page"
        v-show="
          pagesNew.includes('site-evaluation') ||
          pagesNew.includes('shadow-analysis')
        "
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderSETwo secHeaderMD">
            <h1 class="secHeaderContentSETwo">Site Evaluation</h1>
          </div>
          <h3 class="paraSETwo">Solar irradiance incident on site.</h3>
          <div class="imagesContainerSETwo">
            <div class="imageContSETwo" v-loading="!dataFromAPI.heat_map">
              <h3 class="imgHeadSETwo">Site Irradiance Map</h3>
              <!-- <img src="./img/Screenshot (435).png" class="imgSETwo" /> -->
              <img :src="dataFromAPI.heat_map" class="imgSETwo" />
              <div class="infoSETwo">
                <p class="gradText">Poor</p>
                <p class="gradText">Average</p>
                <p class="gradText">Better</p>
                <p class="gradText">Best</p>
              </div>
              <p class="imgContentSETwo">Expected Site Solar Irradiance</p>
            </div>
            <div
              class="imageContSETwo"
              v-loading="!dataFromAPI.solar_access_image"
            >
              <h3 class="imgHeadSETwo">Array Irradiance Map</h3>
              <!-- <img src="./img/Screenshot (436).png" class="imgSETwo" /> -->
              <img :src="dataFromAPI.solar_access_image" class="imgSETwo" />
              <div class="infoSEThree">
                <p class="gradText">Poor</p>
                <p class="gradText">Average</p>
                <p class="gradText">Better</p>
                <p class="gradText">Best</p>
              </div>
              <p class="imgContentSETwo">Expected Array Solar Access</p>
            </div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------System Price ----------------------------------------------- -->
      <!-- <div id="sytemDetailsMain">
    <div class="systemDetails_section doc-page" id="systemDetailsId">
      <div class="headerRep">
        <div class="headerContentOne">
          <p
            class="headerName"
            v-html="projectNameFiltered(clientNameComputed)"
          ></p>
          <p class="headerAddress">{{ dataFromAPI?.project_head.address }}</p>
        </div>
        <div class="headerContentTwo" v-if="dataFromAPI.organisation_data.logo">
          <img :src="dataFromAPI.organisation_data.logo" class="logo" />
        </div>
      </div>

      <div class="contentContainer">
        <div class="secHeaderSDS secHeaderMD" id="secHeaderSDSId">
          <h1 class="secHeaderContentSDS">System Pricing</h1>
        </div>

        <div class="system_items">
          <div class="items">
            <p class="name">Base Price</p>
            <p class="amount">
              {{ handleCurrencySymbol }}{{ dataFromAPI.base_price }}
            </p>
          </div>
          <div v-if="dataFromAPI.adders && isHomeOwnerFacing">
            <div class="items">
              <p class="name">Add-ons</p>
              <p class="amount" v-if="dataFromAPI.adders != 0">
                {{ handleCurrencySymbol }}{{ dataFromAPI.adders }}
              </p>
            </div>
            <div v-for="adder in dataFromAPI.adders_and_discounts" :key="adder.id">
              <div
                v-if="
                  adder.adders_discounts__type === 'adder' &&
                  adder.adders_discounts__is_homeowner_facing === true
                "
                class="item"
              >
                <p
                  class="item_name sub_name"
                  v-if="adder.adders_discounts__is_homeowner_facing === true"
                >
                  {{ adder.adders_discounts__name }}
                </p>
                <p
                  class="amount"
                  v-if="adder.adders_discounts__show_adder_total === true"
                >
                  {{ handleCurrencyFormate(adder.amount * adder.quantity) }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="dataFromAPI.discounts && isHomeOwnerFacing">
            <div class="items">
              <p class="name">Discount</p>
              <p class="amount" v-if="dataFromAPI.discounts != 0">
                -{{ handleCurrencySymbol }}{{ dataFromAPI.discounts }}
              </p>
            </div>
            <div v-for="disc in dataFromAPI.adders_and_discounts" :key="disc.id">
              <div
                class="item"
                v-if="
                  disc.adders_discounts__type === 'discount' &&
                  disc.adders_discounts__is_homeowner_facing === true
                "
              >
                <p
                  class="item_name sub_name"
                  v-if="disc.adders_discounts__is_homeowner_facing === true"
                >
                  {{ disc.adders_discounts__name }}
                </p>
                <p
                  class="amount"
                  v-if="disc.adders_discounts__show_adder_total === true"
                >
                  {{ handleCurrencyFormate(disc.amount * disc.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="total_cost">
          <hr class="totalFooter" />
          <div class="amount_total">
            <p>Total Payable Now(See Payment Schedule)</p>
            <p>
              {{ handleCurrencySymbol }}{{ dataFromAPI.total_cost_before_incentive }}
            </p>
          </div>

          <div class="items">
            <p>Incentive</p>
            <p>-{{ handleCurrencySymbol }}{{ dataFromAPI.total_insentive }}</p>
          </div>
          <div>
            <div v-for="incentive in dataFromAPI.insentives_data" :key="incentive.id">
              <div class="item">
                <p class="item_name sub_name">{{ incentive?.name || "" }}</p>
                <p>
                  {{ handleCurrencySymbol
                  }}{{ incentive.tot_amount_contribution.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
          <div class="payable">
            <hr class="hrFooter" />
            <div class="last_item">
              <p>Effective Price after Incentive</p>
              <p>
                {{ handleCurrencySymbol
                }}{{ dataFromAPI.total_cost_after_adders_and_discounts_incentive }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <hr class="hrFooter" />
        <p class="footerContent">
          Powered by <span class="bold2">ARKA 360</span>
        </p>
      </div>
    </div>
  </div> -->

      <div
        id="projectEconomicsMain"
        v-show="pagesNew.includes('system-pricing')"
      >
        <div
          class="projectPricing_section doc-page"
          id="projectPricing_sectionId"
        >
          <div class="headerRep">
            <div class="headerContentOne">
              <p
                class="headerName"
                v-html="projectNameFiltered(clientNameComputed)"
              ></p>
              <p class="headerAddress">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
          <div class="contentContainer" id="contentContainerId">
            <div class="secHeaderPE secHeaderMD" id="secHeaderPEId">
              <h1 class="secHeaderContentPE">System Pricing</h1>
            </div>
            <div class="containerSP">
              <div class="columnSP">
                <p class="labelSP">Base Price</p>
                <p class="valSP">
                  {{
                    handleCurrencyFormate(
                      parseFloat(dataFromAPI.base_price.replace(/,/g, ""))
                    )
                  }}
                </p>
              </div>
              <div id="tableContainerSYSId">
                <div id="adderFullId" class="adderFullClass">
                  <div class="columnSP" id="addonHeading">
                    <p class="labelSP">Add-ons</p>
                    <p class="valSP" id="addonValue">
                      {{
                        handleCurrencyFormate(
                          parseFloat(dataFromAPI.adders.replace(/,/g, ""))
                        )
                      }}
                    </p>
                  </div>
                  <div class="allAddons">
                    <div
                      class="paddingColumnSP"
                      v-for="adder in addersData"
                      :key="adder.id"
                    >
                      <p
                        class="labelSPNormal"
                        v-if="
                          adder.adders_discounts__is_homeowner_facing === true
                        "
                      >
                        {{ adder.adders_discounts__name }}
                      </p>
                      <p
                        class="valSP"
                        v-if="adder.adders_discounts__show_adder_total === true && adder.adders_discounts__rate_type=='percentage_of_system_cost'"
                      >
                        {{
                          handleCurrencyFormate((adder.amount *  parseFloat(dataFromAPI.base_price.replace(/,/g, "")))/100 * adder.quantity)
                        }}
                      </p>
                      <p
                        class="valSP"
                        v-else-if ="adder.adders_discounts__show_adder_total === true "
                      >
                        {{
                          handleCurrencyFormate(adder.amount * adder.quantity)
                        }}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div id="discountFullId" class="discountFullClass">
                    <div class="columnSP" id="discountHeading">
                      <p class="labelSP">Discounts</p>
                      <p class="valSP">
                     {{ handleCurrencyFormate(parseFloat(dataFromAPI.discounts.replace(/,/g, ""))) }}
                      </p>
                    </div>
                    <div class="allDiscounts">
                      <div
                        class="paddingColumnSP"
                        v-for="disc in discountsData"
                        :key="disc.id"
                      >
                        <p
                          class="labelSPNormal"
                          v-if="
                            disc.adders_discounts__is_homeowner_facing === true
                          "
                        >
                          {{ disc.adders_discounts__name }}
                        </p>
                        <p
                          class="valSP"
                          v-if="
                            disc.adders_discounts__show_adder_total === true && disc.adders_discounts__rate_type=='percentage_of_system_cost'"
                        >
                        {{
                          handleCurrencyFormate((disc.amount *  parseFloat(dataFromAPI.base_price.replace(/,/g, "")))/100 * disc.quantity)
                        }}
                        </p>
                        <p
                          class="valSP"
                          v-else-if="
                            disc.adders_discounts__show_adder_total === true
                          "
                        >
                          {{
                            handleCurrencyFormate(disc.amount * disc.quantity)
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="elsePart">
                <div class="totalColumnSP">
                  <p class="labelSPBlue">
                    Total Payable Now (See Payment Schedule)
                  </p>
                  <p class="labelSPBlue">
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
                <div class="columnSP">
                  <p class="labelSP">Incentives</p>
                  <p class="valSP">
                    -{{
                      handleCurrencyFormate(
                        parseFloat(
                          dataFromAPI.total_insentive.replace(/,/g, "")
                        )
                      )
                    }}
                  </p>
                </div>
                <div
                  class="paddingColumnSP"
                  v-for="insentives in dataFromAPI.insentives_data"
                  :key="insentives.id"
                >
                  <p class="labelSPNormal">{{ insentives.name }}</p>
                  <p class="valSP">
                    {{
                      handleCurrencyFormate(insentives.tot_amount_contribution)
                    }}
                  </p>
                </div>
                <div class="totalLastColumnSP">
                  <p class="labelSP">Effective Price after Incentives</p>
                  <p class="valSP">
                    {{ handleCurrencySymbol
                    }}{{
                      dataFromAPI.total_cost_after_adders_and_discounts_incentive
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="footer">
            <hr class="hrFooter" />
            <p class="footerContent">
              Powered by <span class="bold2">ARKA 360</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Project Economics----------------------------------------------- -->

      <div
        class="projectEconomics_section doc-page"
        v-show="pagesNew.includes('pv-as-an-asset')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderPE secHeaderMD">
            <h1 class="secHeaderContentPE">PV as an Asset</h1>
          </div>

          <div class="gridOnePE">
            <div class="gridOneContPE">
              <h4 class="gcontPE">Price</h4>
              <h2
                class="gValuePE"
                v-if="
                  dataFromAPI.financial_data.price_per_w_usa !== null ||
                  dataFromAPI.financial_data.price_per_w_usa !== ' '
                "
              >
                {{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(
                    dataFromAPI.financial_data.price_per_w_usa
                  )
                }}/W
              </h2>
            </div>
            <div class="gridOneContPE">
              <h4 class="gcontPE">Payback Period</h4>
              <h2 class="gValuePE">
                {{ dataFromAPI?.financial_data?.payback?.years }} yrs.
                {{ dataFromAPI.financial_data?.payback?.months }} mos.
              </h2>
            </div>
            <div class="gridOneContPE">
              <h4 class="gcontPE">Lifetime Savings</h4>
              <h2 class="gValuePE">
                {{
                  currencySymbolNameMap[dataFromAPI.country.currency_code] +
                  convertedWithComas(dataFromAPI.financial_data.total_savings)
                }}
              </h2>
            </div>
          </div>

          <div class="gridTwoPE">
            <div class="gridTwoContPE">
              <p class="gcontTwoPE">Internal Rate of Return</p>
              <p class="gValueTwoPE">{{ dataFromAPI.financial_data.irr }}%</p>
            </div>
            <div class="gridTwoContPE">
              <p class="gcontTwoPE">Year 1 Usage Offset</p>
              <p class="gValueTwoPE">
                {{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%
              </p>
            </div>
            <div class="gridTwoContPE">
              <p class="gcontTwoPE">LCOE</p>
              <p class="gValueTwoPE">{{currencySymbolNameMap[dataFromAPI.country.currency_code] +  convertedWithComas(dataFromAPI.financial_data.LCOE) }}/kWH</p>
            </div>
            <div class="gridTwoContPE">
              <p class="gcontTwoPE">System Life</p>
              <p class="gValueTwoPE">
                {{ dataFromAPI.financial_data.expected_life_years }} Years
              </p>
            </div>
            <div class="gridTwoContPE">
              <p class="gcontTwoPE">Savings from Solar</p>
              <p class="gValueTwoPE">
                {{ dataFromAPI.financial_data.savings_from_Solar }}%
              </p>
            </div>
            <div
              class="gridTwoContPE"
              v-if="dataFromAPI.insentives_data.length"
            >
              <p class="gcontTwoPE">Incentives</p>
              <p
                class="gValueTwoPE"
                v-for="(insentive_check, index) in dataFromAPI.insentives_data"
                :key="index"
              >
                <span v-if="insentive_check.amount_percentage == 0"
                  >{{ insentive_check.name }}-
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(insentive_check.amount_required)
                  }}</span
                >
                <span v-else
                  >{{ insentive_check.name }}-
                  {{ insentive_check.amount_percentage }}%</span
                >
              </p>
            </div>
            <!-- <div v-else>
                <p class="gcontTwoPE">Incentives</p>
                <p class="gValueTwoPE">Federal ITC - 22%</p>
              </div> -->
            <!-- <p class="gValueTwoPE">Federal ITC - 22%</p> -->
          </div>
          <!-- <img src="./img/Group 58.png" class="imgPE" /> -->
          <div class="chartDivBreakEven">
            <span class="yUnitBreakEven">{{
              currencySymbolNameMap[dataFromAPI.country.currency_code]
            }}</span>
            <div class="chartBreakEven">
              <web-proposal-bar-chart
                :breakEvenAnalysisData="breakEvenAnalysisData"
                :breakEvenAnalysisDataLabels="breakEvenAnalysisDataLabels"
                :currencyCode="currencyCode"
                :reportTemplate="reportTemplate"
              />
            </div>
          </div>
          <div class="diduKnowContPE">
            <div class="diduKnowPE">Did You Know?</div>
            <p class="diduKnowValuePE">
              The value of homes with a solar PV system can increase by up to
              4.1% over comparable homes without solar. (based on a Zillow.com
              study).
            </p>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Cost of Not Going Solar---------------------------------- -->

      <div
        class="costofnotgoingsolar_section doc-page"
        v-show="pagesNew.includes('cost-of-not-going-solar')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderCGS secHeaderMD">
            <h1 class="secHeaderContentCGS">Cost of Not Going Solar</h1>
          </div>

          <div class="graphContainerCGS">
            <p class="graphContentCGS">
              Energy prices increase every year. Solar energy protects from
              these rising rates by limiting or reducing the need for energy
              supplied from the utility.
            </p>
            <!-- <img src="./img/Group 59.png" class="graphImgCGS" /> -->
            <div class="chartDivWOrWSolar">
              <span class="yUnitBillWithOrWithoutSolar">{{
                currencySymbolNameMap[dataFromAPI.country.currency_code]
              }}</span>
              <div class="chartBillWithOrWithoutSolar">
                <web-proposal-multi-bar-chart
                  :estimatedUtilityBillWithSolarData="
                    estimatedUtilityBillWithSolarData2
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
            <div class="flexContainerCGS">
              <div class="avgGenContainerCGS">
                <div class="sqBlueCGS"></div>
                <span class="avgGenValueCGS">{{
                  isBatteryAvailable
                    ? "Bill with Solar & Battery"
                    : "Bill with Solar"
                }}</span>
              </div>
              <div class="yrDegContainerCGS">
                <div class="sqGreyCGS"></div>
                <p class="avgGenValueCGS">Bill Without Solar</p>
              </div>
            </div>
            <p class="paraCGS">
              Historically, utility rates have increased more than 1.5% over
              annual inflation and electricity charges have increased 4.5%
              between 2007 - 2022.
            </p>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------warranty---------------------------------- -->

      <div
        class="systemWarranty_section doc-page"
        v-show="pagesNew.includes('warranties')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderWTY secHeaderMD">
            <h1 class="secHeaderContentWTY">Warranties</h1>
          </div>

          <div class="tableContainerWTY">
            <h4 class="tableHeadingWTY">Product Warranty</h4>
            <table id="customersWTY">
              <tr class="tableHeaderSDS">
                <!-- <th class="tableHeaderWidthWTY oneWTY">Type</th> -->
                <th class="tableHeaderWidthWTY twoWTY">Component</th>
                <!-- <th class="tableHeaderWidthWTY threeWTY">Model</th> -->
                <th class="tableHeaderWidthWTY threeWTY">Manufacturer</th>
                <th class="tableHeaderWidthWTY fourWTY">Warranty</th>
              </tr>
              <tr
                class="tablevalueWTY"
                v-for="(data, index) in warrantyArray"
                :key="index"
              >
                <td
                  class="tablevalueWidthWTY oneWTY"
                  v-if="
                    data.component === 'Modules' ||
                    data.component === 'Inverters'
                  "
                >
                  {{ data.component }}
                </td>
                <td
                  class="tablevalueWidthWTY twoWTY"
                  v-if="
                    data.component === 'Modules' ||
                    data.component === 'Inverters'
                  "
                >
                  {{ data.make }}
                </td>
                <td
                  class="tablevalueWidthWTY fourWTY"
                  v-if="createdArray.length"
                >
                  {{ isWarrantyApplicable(data.component) }}
                </td>
              </tr>
            </table>
            <h4 class="tableHeading2WTY">Workmanship</h4>
            <p class="paraWTY">
              We warranty the system against defects in workmanship for a period
              of 10 years. See contract for additional details.
            </p>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Summary and Approvals----------------------------------------------- -->

      <div
        class="summaryandApprovals_section doc-page"
        v-show="pagesNew.includes('summary-and-approvals')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderSAA secHeaderMD">
            <h1 class="secHeaderContentSAA">Summary and Approvals</h1>
          </div>

          <div class="containerSAA">
            <h4 class="headingsSAA">
              {{ dataFromAPI.organisation_data.name }} proposes to install the
              solar energy system outlined in this proposal for a turn-key price
              of
              {{
                currencySymbolNameMap[dataFromAPI.country.currency_code] +
                dataFromAPI.total_cost_after_incentive
              }}, which includes sales tax. This includes design, project
              management, procurement, materials, installation, and quality
              assurance.
            </h4>
            <div class="gridContSAA">
              <div class="gridSAA">
                <p class="sumSAA">System Size (DC STC)</p>
                <p class="valueSAA">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Module DC Nameplate"]
                    )
                  }}
                  kWp
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Estimated Year 1 Production</p>
                <p class="valueSAA">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Annual Production_usa"]
                    )
                  }}
                  kWh
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Estimated Year 1 Savings</p>
                <p class="valueSAA">
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.monthly_saving_year
                    )
                  }}
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Price Per Watt Peak</p>
                <p
                  class="valueSAA"
                  v-if="
                    dataFromAPI.financial_data.price_per_w_usa !== null ||
                    dataFromAPI.financial_data.price_per_w_usa !== ' '
                  "
                >
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.price_per_w_usa
                    )
                  }}/W
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Module</p>
                <p class="valueSAA">
                  {{ getFirstComponents[0].make }}
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Inverter</p>
                <p class="valueSAA">{{ getFirstComponents[1].make }}</p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Energy Generated from Solar</p>
                <p class="valueSAA">
                  {{ dataFromAPI.system_metrics["Year 1 Usage Offset"] }}%
                </p>
              </div>
              <div class="gridSAA">
                <p class="sumSAA">Electricity Bill Saved from Solar</p>
                <p class="valueSAA">
                  {{ dataFromAPI.financial_data.savings_from_Solar }}%
                </p>
              </div>
            </div>
            <hr class="hrSAA" />
            <div class="flexContSAA">
              <div class="flexSAA">
                <h4 class="flexInfoSAA">Total Cost</h4>
                <p class="flexValueSAA">
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
                <h4 class="flexInfoSAA">Incentives</h4>
                <p class="flexValueSAA">
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
                <h4 class="flexInfoSAA">Cost After Incentives</h4>
                <p class="flexValueSAA">
                  {{ handleCurrencySymbol
                    }}{{
                      dataFromAPI.total_cost_after_adders_and_discounts_incentive
                    }}
                </p>
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
                  {{ dataFromAPI.financial_data?.payback?.years }} yr.
                  {{ dataFromAPI.financial_data?.payback?.months }} mos.
                </li>
              </ul>
            </div>

            <div class="signatureContainerSAA">
              <div class="signContSAA">
                <div class="signSAA"></div>
                <p class="sigContentSAA">
                  Installer/Authorized Representative Signature
                </p>
              </div>
              <div class="signContSAA">
                <div class="signSAA"></div>
                <p class="sigContentSAA">
                  Buyer/Authorized Representative Signature
                </p>
              </div>
              <div class="userContSAA">
                <h3 class="ucSAA">User Assigned</h3>
                <p class="utSAA">
                  {{ dataFromAPI.project_head.project_creator_name }}
                </p>
                <!-- <P class="tcnSAA">Tata</P> -->
              </div>
              <div class="userContSAA">
                <h3 class="ucSAA">Client Name</h3>
                <p
                  class="utSAA"
                  v-html="projectNameFiltered(clientNameComputed, true)"
                ></p>
                <!-- <P class="tcnSAA">Client Name</P> -->
              </div>
            </div>

            <div class="userContainerSAA"></div>
          </div>
        </div>
        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Installation Roadmap----------------------------------------------- -->

      <div
        class="nextStep_section doc-page"
        v-show="pagesNew.includes('installation-roadmap')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderFAQ secHeaderMD">
            <h1 class="secHeaderContentFAQ">Installation Roadmap</h1>
          </div>

          <div class="nextStepContainerNS">
            <div class="flexContNS">
              <h1 class="countNS">01</h1>
              <p class="valueNS">Review and Approve Proposed Design (Owner).</p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">02</h1>
              <p class="valueNS">
                Detailed System Design and Engineering (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">03</h1>
              <p class="valueNS">
                Plans Sent to HOA Review, if Applicable. (We Provide the
                Information, You Submit it to the HOA).
              </p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">04</h1>
              <p class="valueNS">
                Approvals by Utility and Municipality (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">05</h1>
              <p class="valueNS">
                System Installation and Commissioning (We'll Take Care of it!).
              </p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">06</h1>
              <p class="valueNS">
                Obtain Permission to Operate (PTO) from Utility (We'll Take Care
                of it!).
              </p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">07</h1>
              <p class="valueNS">Turn System On, and Start Saving Money!</p>
            </div>
            <div class="flexContNS">
              <h1 class="countNS">08</h1>
              <p class="valueNS">Join Our Referral Program!</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Frequently Asked Questions----------------------------------------------- -->

      <div
        id="faqMain"
        v-show="
          pagesNew.includes('frequently-asked-questions') && faqData.length
        "
      >
        <div class="FAQ_section doc-page" id="FAQ_sectionId">
          <div class="headerRep">
            <div class="headerContentOne">
              <p
                class="headerName"
                v-html="projectNameFiltered(clientNameComputed)"
              ></p>
              <p class="headerAddress">
                {{ dataFromAPI.project_head.address }}
              </p>
            </div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
          <div class="contentContainer">
            <div class="secHeaderFAQ secHeaderMD" id="secHeaderFAQId">
              <h1 class="secHeaderContentFAQ">Frequently Asked Questions</h1>
            </div>

            <div class="quesContainerFAQ" id="quesContainerFAQId">
              <div class="allFaqs" id="allFAQs">
                <div
                  class="quesContFAQ"
                  v-for="(faq, index) in faqData"
                  :key="index"
                >
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

            <div class="footer">
              <hr class="hrFooter" />
              <p class="footerContent">
                Powered by <span class="bold2">ARKA 360</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ----------------------------------------Additional Information----------------------------------------------- -->

      <div
        class="additionalInfo_section doc-page"
        v-show="pagesNew.includes('additional-information')"
      >
        <div class="headerRep">
          <div class="headerContentOne">
            <p
              class="headerName"
              v-html="projectNameFiltered(clientNameComputed)"
            ></p>
            <p class="headerAddress">{{ dataFromAPI.project_head.address }}</p>
          </div>
          <div
            class="headerContentTwo"
            v-if="dataFromAPI.organisation_data.logo"
          >
            <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
            <img :src="dataFromAPI.organisation_data.logo" class="logo" />
          </div>
        </div>
        <div class="contentContainer">
          <div class="secHeaderFAQ secHeaderMD">
            <h1 class="secHeaderContentFAQ">Additional Information</h1>
          </div>
          <div class="nextStepContainerADI">
            <p class="paraADI">
              This solar installation proposal is based on information about
              your electrical energy usage and applicable site factors. The
              suggested design, estimated energy production and estimated
              financial savings are presented for illustration and bid
              evaluation purposes and are not guaranteed. System details are
              subject to site verification and revision if necessary. Should
              such revision(s) occur resulting in work outside the scope of this
              initial bid, it may be subject to a change order. This non-binding
              proposal is not a contract. Federal tax credit and other
              incentives, if applicable, are estimated and not guaranteed.
              Consult a qualified tax professional for tax-related questions
              arising from this proposal. The information we've provided is
              based on the following data:
            </p>

            <table id="customersADI">
              <tr class="tableHeaderADI">
                <th class="tableHeaderWidthADI" colspan="2">
                  Electricity Usage
                </th>
                <th class="tableHeaderWidthADI" colspan="2">
                  Financial Analysis
                </th>
              </tr>
              <tr class="tablevalueADI">
                <td class="tablevalueWidthADI">Utility Company</td>
                <td class="tablevalueWidthADI tableBorderADI">
                  {{ dataFromAPI.system_metrics.Utility_Company }}
                </td>
                <td class="tablevalueWidthADI">DC System Size</td>
                <td class="tablevalueWidthADI">
                  {{
                    convertedWithComaskWh(
                      dataFromAPI.system_metrics["Module DC Nameplate"]
                    )
                  }}
                  kWp
                </td>
              </tr>
              <tr class="tablevalueADI">
                <td class="tablevalueWidthADI">Annual System Degradation</td>
                <td class="tablevalueWidthADI tableBorderADI">
                  {{ dataFromAPI.system_metrics["Degradation Rate"] }}%
                </td>
                <td class="tablevalueWidthADI">Incentive</td>
                <td class="tablevalueWidthADI">
                  -{{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(dataFromAPI.total_insentive)
                  }}
                </td>
              </tr>
              <tr class="tablevalueADI">
                <td class="tablevalueWidthADI">Billing Rate</td>
                <td class="tablevalueWidthADI tableBorderADI">
                  {{
                    dataFromAPI.system_metrics.utility_rate
                      ? dataFromAPI.system_metrics.utility_rate
                      : ""
                  }}
                </td>
                <td class="tablevalueWidthADI">Cash flows Discount Rate</td>
                <td class="tablevalueWidthADI">
                  {{ dataFromAPI.financial_data.discount_rate }}%
                </td>
              </tr>
              <tr class="tablevalueADI">
                <td class="tablevalueWidthADI">Annual Electricity Usage</td>
                <td class="tablevalueWidthADI tableBorderADI">
                  {{ convertedWithComaskWh(dataFromAPI.annual_consumption) }}
                  kWh
                </td>
                <td class="tablevalueWidthADI">
                  Estimated Current Electricity Bill
                </td>
                <td class="tablevalueWidthADI">
                  {{
                    currencySymbolNameMap[dataFromAPI.country.currency_code] +
                    convertedWithComas(
                      dataFromAPI.financial_data.bill_with_solar_year_one
                    )
                  }}
                </td>
              </tr>
            </table>
          </div>

          <div class="nextStepContainerTwoADI">
            <ul class="listContADI">
              <li class="listADI">
                The Standard Test Condition rating (STC) assumes a standard set
                of optimal operating conditions (25°C cell temperature, 1000
                W/m2 and an air mass of 1.5). The STC rating is most often used
                by manufacturers to classify the power output of PV modules.
              </li>
              <li class="listADI">
                Energy Output is calculated based on historical solar irradiance
                at the given location. A typical meteorological year is selected
                using statistical methods. Factors including module tilt,
                orientation (azimuth), and system efficiency are taken into
                account.
              </li>
              <li class="listADI">
                System efficiency is estimated to account for losses caused by a
                variety of factors. These factors include intermittent shading,
                cable losses, dirt, utility scheduled downtime, manufacturer
                tolerances, inverter efficiency, and other factors.
              </li>
              <li class="listADI">
                United States Environmental Protection Agency. 2017. Greenhouse
                Gases Equivalencies Calculator - Calculations and References.
                Available at:
                <a
                  href="https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#kilowatt."
                  target="_blank"
                  class="aADI"
                  >https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#kilowatt.</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <hr class="hrFooter" />
          <p class="footerContent">
            Powered by <span class="bold2">ARKA 360</span>
          </p>
        </div>
      </div>

      <!-- ----------------------------------------Thank you----------------------------------------------- -->

      <div class="thankYou_section doc-page">
        <div class="thankYouSec">
          <div class="headerRep">
            <div class="headerContentOne"></div>
            <div
              class="headerContentTwo"
              v-if="dataFromAPI.organisation_data.logo"
            >
              <!-- <img src="./img/Panasonic_logo_(Blue).svg.png" class="logo" /> -->
              <img :src="dataFromAPI.organisation_data.logo" class="logo" />
            </div>
          </div>
        </div>
        <div class="footerThanku">
          <h3 class="thankU">Thank You</h3>
          <div class="gridTY">
            <div class="flexTY">
              <div
                class="imgBorder"
                v-if="dataFromAPI.organisation_data.email_id"
              >
                <img src="./assets/img/chat-left-text.png" class="iconTY" />
              </div>
              <p class="mailTY">
                {{
                  dataFromAPI.organisation_data.email_id
                    ? dataFromAPI.organisation_data.email_id
                    : ""
                }}
              </p>
            </div>
            <div class="flexTY">
              <div class="imgBorder" v-if="dataFromAPI.organisation_data.phone">
                <img src="./assets/img/phone.png" class="iconTY" />
              </div>
              <p class="mailTY">
                {{
                  dataFromAPI.organisation_data.phone
                    ? dataFromAPI.organisation_data.phone
                    : ""
                }}
              </p>
            </div>
            <div class="flexTY">
              <div
                class="imgBorder"
                v-if="
                  dataFromAPI.organisation_data.address &&
                  dataFromAPI.organisation_data.address[0]
                "
              >
                <img src="./assets/img/building.png" class="iconTY" />
              </div>
              <p class="mailTY">
                {{
                  dataFromAPI.organisation_data.address
                    ? dataFromAPI.organisation_data.address[0]
                    : ""
                }}
              </p>
            </div>
            <div class="flexTY">
              <div
                class="imgBorder"
                v-if="dataFromAPI.organisation_data.website"
              >
                <img src="./assets/img/globe.png" class="iconTY" />
              </div>
              <!-- <p class="mailTY">{{ testData.organisation_data.website ? testData.organisation_data.website : ''}}</p> -->
              <p class="mailTY" v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import WebProposalBarChartSavings from "../../../components/ui/charts/commonCharts/webProposalBarChartSavings.vue";
import WebProposalBarChartProduction from "../../../components/ui/charts/commonCharts/webProposalBarChartProduction.vue";
import webProposalBarChart from "../../../components/ui/charts/commonCharts/webProposalBarChart.vue";
import webProposalMultiBarChart from "../../../components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
import API from "@/services/api";
import { formatNumberWithCommas } from "@/utils.js";
import { convertTimeTo12HourFormat } from "../../utils/utils";
import currencySymbolNameMap from "../../currency-symbol-name-map";
import batterySavingAnalysisChart from "../../../components/ui/charts/commonCharts/batterySavingAnalysisChart.vue";
import {
  getCurrencySymbol,
  getFormattedCurrencyComas,
  getFormattedNumberWithCurrency,
} from "../../../utils/numberFormat/currencyFormatter";
import SystemPricing from "../systemPricing.vue";
export default {
  name: "App",

  props: {
    isBatteryAvailable: {
      type: Number,
      default: 0,
    },
    pages: {
      type: Array,
    },
    pagesNew: {
      type: Array,
    },
    dataFromAPI: {
      type: Object,
    },
    // finalCost: {
    //   type: String,
    // },
    costAfterIncentive: {
      type: String,
    },
    isPuppeteer: {
      type: Boolean,
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
  },

  data() {
    return {
      chwck:
        "knflknslkfdlnskfdslknfdksndflnsndfnlsnfdlndfkdhfdhfkhdkfhdkfhddjfhdjfdjhfdhfabcd",
      referenceIdFor3dLink: this.dataFromAPI.reference_id,
      currencyCode: this.dataFromAPI.country.currency_code,
      documentProposalPageUrl: window.location.href,
      isLoading: false,
      designId: this.$route.params.designId,
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
      referenceId: this.$route.params.referenceId,
      reportTemplate: "reportUSA",
      countryCode: this.$props.dataFromAPI.country.currency_code,
    };
  },

  nonReactiveData() {
    return {
      currencySymbolNameMap,
    };
  },

  components: {
    webProposalBarChart,
    webProposalMultiBarChart,
    WebProposalBarChartProduction,
    WebProposalBarChartSavings,
    batterySavingAnalysisChart,
    SystemPricing,
  },

  methods: {
    handleCurrencyFormate(amount) {
      if (amount.toString().includes(".")) {
        amount = amount.toFixed(2);
        let arr = amount.toString().split(".");
        return getFormattedCurrencyComas(this.countryCode, parseInt(arr[0])) + "." + arr[1];
      }
      return getFormattedCurrencyComas(this.countryCode, amount) + ".00";

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
          false;
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
    calcSolarTime(shadingLoss) {
      let absLoss = Math.abs(shadingLoss);
      return 100 - absLoss;
    },
    convertTimeTo12HourFormat,
    isWarrantyApplicable(component) {
      if (component === "Modules" || component === "Inverters") {
        return "25 yrs.";
      } else {
        return "";
      }
    },
  },

  computed: {
    addersData() {
      let addersDataArray = [];
      for (let i = 0; i < this.dataFromAPI.adders_and_discounts?.length; i++) {
        if (
          this.dataFromAPI.adders_and_discounts[i].adders_discounts__type ===
            "adder" &&
          this.dataFromAPI.adders_and_discounts[i]
            .adders_discounts__is_homeowner_facing === true
        ) {
          addersDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return addersDataArray;
    },

    discountsData() {
      let discountsDataArray = [];
      for (let i = 0; i < this.dataFromAPI.adders_and_discounts?.length; i++) {
        if (
          this.dataFromAPI.adders_and_discounts[i].adders_discounts__type ===
            "discount" &&
          this.dataFromAPI.adders_and_discounts[i]
            .adders_discounts__is_homeowner_facing === true
        ) {
          discountsDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return discountsDataArray;
    },

    clientNameComputed() {
      return (
        this.dataFromAPI.project_head.client_name ||
        this.dataFromAPI.project_head.name
      );
    },
    handleCurrencySymbol() {
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },

    clientNameComputed() {
      return (
        this.dataFromAPI.project_head.client_name ||
        this.dataFromAPI.project_head.name
      );
    },

    finalCost() {
      return (
        parseFloat(this.dataFromAPI.total_cost_after_incentive) +
        parseFloat(this.dataFromAPI.total_insentive.replace(/,/g, ""))
      ).toFixed(2);
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

    batteryData() {
      return this.dataFromAPI.battery_data;
    },

    warrantyArray() {
      return this.createdArray.filter((item) => {
        return item.component === "Modules" || item.component === "Inverters";
      });
    },

    threeDLink() {
      return `https://api.qrserver.com/v1/create-qr-code/?data=${this.dataFromAPI.detailed_layout_link}`;
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

    teamMembersArray() {
      let newArray = [];
      if (this.dataFromAPI.team_members)
        newArray = Object.values(this.dataFromAPI.team_members);
      return newArray;
    },

    productionData() {
      // let mainArray = this.dataFromAPI.monthly_table.values;
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      mainArray.pop();
      let finalArray = [];
      for (let item in mainArray) {
        finalArray.push(mainArray[item][5]);
      }

      let lastArray = finalArray.map((str) => {
        return parseFloat(str.replace(/,/g, ""));
      });
      return lastArray;
    },

    savingsData() {
      return this.dataFromAPI.financial_data.monthly_saving;
    },

    breakEvenAnalysisData() {
      return this.dataFromAPI.financial_data.cumulative_savings;
    },

    estimatedUtilityBillWithSolarData() {
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    estimatedUtilityBillWithSolarData2() {
      if (this.isBatteryAvailable) {
        return this.dataFromAPI.financial_data
          ?.residual_energy_post_battery_bill;
      }
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    residualEnergyPostBatteryBill() {
      return this.dataFromAPI.financial_data?.residual_energy_post_battery_bill;
    },

    additionalSavingsPostBattery() {
      if (this.dataFromAPI.financial_data) {
        return parseFloat(
          this.dataFromAPI.financial_data.additional_savings_post_battery
        ).toFixed(2);
      } else {
        return null;
      }
    },

    estimatedUtilityBillWithoutSolarData() {
      return this.dataFromAPI.financial_data?.bill_without_solar;
    },

    faqData() {
      if (this.dataFromAPI.frequently_asked_questions)
        return this.dataFromAPI.frequently_asked_questions;
      else return [];
    },
  },

  mounted() {
    // this.testAPI();
    // this.convertToArray();
    // this.modifyJson();
    // this.modifiedSystemOrientationJson();
    // this.createArray();
    // this.createdSystemOrientationArray();
    var pageNumber = 2;
    this.countryCode = this.$props.dataFromAPI.country.currency_code;
    // cloneIt("sysDetails", "systemDetails_section", "secHeaderSDSId", "sysDetails", "tableContainerSDS", "sysDetails", "sysDetailsId");

    function cloneIt(
      sectionName,
      sectionClass,
      secHeaderId,
      pageName,
      containerClass,
      wrapperId,
      wrapperClass
    ) {
      // Cloning the entire div and adding the section class to it
      let cloneIt = document.createElement("div");
      cloneIt.classList.add(sectionClass);
      cloneIt.classList.add("doc-page");

      cloneIt.id = sectionName + "cloneIt" + pageNumber;

      // Creating header clone and appending it
      let header = document.getElementById("headerId");
      let headerClone = header.cloneNode(true);
      headerClone.id = sectionName + "cloneIt" + pageNumber;
      cloneIt.appendChild(headerClone);

      // Creating heading clone for OUR TEAM
      let contentClone = document.createElement("div");
      contentClone.classList.add("contentContainer");
      contentClone.id = sectionName + "contentClone" + pageNumber;
      cloneIt.appendChild(contentClone);
      let secHeader = document.getElementById(secHeaderId);
      let secHeaderClone = secHeader.cloneNode(true);
      secHeaderClone.id = sectionName + "secHeaderClone" + pageNumber;
      contentClone.appendChild(secHeaderClone);

      // Creating footer clone and appending it
      let footer = document.getElementById("footerId");

      let footerClone = footer.cloneNode(true);
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
      if (sectionName == "faq") {
        let faqMain = document.getElementById("faqMain");
        faqMain.appendChild(cloneIt);
      } else if (sectionName == "sysDetails") {
        let systemDetailsMain = document.getElementById("sytemDetailsMain");
        systemDetailsMain.appendChild(cloneIt);
      } else if (sectionName == "batteryStorage") {
        let batteryStorageMain = document.getElementById("batteryStorageMain");
        batteryStorageMain.appendChild(cloneIt);
      } else if (sectionName == "projectEconomics") {
        let projectEconomicsMain = document.getElementById(
          "projectEconomicsMain"
        );
        projectEconomicsMain.appendChild(cloneIt);
      } else {
        let ourTeamMain = document.getElementById("ourTeamMain");
        ourTeamMain.appendChild(cloneIt);
      }
      pageNumber++;
      return insideDiv;
    }

    function cloneSystemPricing() {
      let availableHeight = 504;
      let ceo = document.getElementsByClassName("allAddons");
      let ceo1 = document.getElementsByClassName("allDiscounts");
      console.log('ceo1: ', ceo1, ceo);
      let noOfCEOs = ceo[0].childElementCount;
      let noOfCEOs1 = ceo1[0].childElementCount;
      let elsePart = document.getElementById("elsePart");
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
          if (noOfCEOs) {
            availableHeight = 560;
            var newClone = null;
            newClone = cloneIt(
              "projectEconomics",
              "projectPricing_section",
              "secHeaderPEId",
              "projectEconomics",
              "tableContainerSYS",
              "sysPricingcontentClone"
            );
            var newPage = pageNumber - 1;
            let idName = "sysPricingcontentClone" + newPage;
            let newTableBody = document.getElementById(idName);
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
            }
            if (!noOfCEOs1) {
              let sysOrientation = document.getElementById("discountFullId");
              newTableBody.appendChild(sysOrientation);
              availableHeight -= 40;
            }
          } else {
            if (availableHeight > 40) {
              halfed = false;
              if (newClone) {
                let newPage2 = pageNumber - 1;
                let containerId = "sysPricingcontentClone" + newPage2;
                let newTableBody = document.getElementById(containerId);
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
                availableHeight = 560;
                var newClone = cloneIt(
                  "projectEconomics",
                  "projectPricing_section",
                  "secHeaderPEId",
                  "projectEconomics",
                  "tableContainerSYS",
                  "sysPricingcontentClone"
                );
                console.log("fhgg");
                let newPage = pageNumber - 1;
                let sysOrientation = document.getElementById("discountFullId");
                let containerId = "sysPricingcontentClone" + newPage;
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
              } else {
                availableHeight = 560;
                var newClone = cloneIt(
                  "projectEconomics",
                  "projectPricing_section",
                  "secHeaderPEId",
                  "projectEconomics",
                  "tableContainerSYS",
                  "sysPricingcontentClone"
                );
                newPage = pageNumber - 1;
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
      if (availableHeight < 140) {
        var newClone = cloneIt(
          "projectEconomics",
          "projectPricing_section",
          "secHeaderPEId",
          "projectEconomics",
          "tableContainerSYS",
          "sysPricingcontentClone"
        );
        let newPage = pageNumber - 1;
        let idName = "sysPricingcontentClone" + newPage;
        let newTableBody = document.getElementById(idName);
        newTableBody.appendChild(elsePart);
      } else {
        let newPage1 = pageNumber - 1;
        let idName1 = "sysPricingcontentClone" + newPage;
        let idName2 = "sysPricingcontentClone" + newPage1;
        let newTableBody = document.getElementById(idName1)
          ? document.getElementById(idName1)
          : document.getElementById(idName2);
        if (newTableBody) {
          newTableBody.appendChild(elsePart);
        }
      }
      pageNumber = 2;
    }

    function cloneSystemDetails() {
      let availableHeight = 490.2;
      let ceo = document.getElementsByClassName("allComponentValues");
      let ceo1 = document.getElementsByClassName("allOrientationValues");
      let noOfCEOs = ceo[0].childElementCount;
      let noOfCEOs1 = ceo1[0].childElementCount;
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
          var newPage = pageNumber - 1;
          if (noOfCEOs) {
            availableHeight = 490.2;
            var newClone = null;
            newClone = cloneIt(
              "sysDetails",
              "systemDetails_section",
              "secHeaderSDSId",
              "sysDetails",
              "tableContainerSDS",
              "sysDetails",
              "sysDetailsId"
            );
            let innerHeading = document.getElementById("tableHeadingSDSId");
            let innerHeadingClone = innerHeading.cloneNode(true);
            innerHeadingClone.id = "tableHeadingSDSId" + newPage;
            newClone.appendChild(innerHeadingClone);
            let newComponentTable = document.createElement("table");
            newComponentTable.id = "customersSDS2" + newPage;
            newComponentTable.classList.add("customersSDS2Class");
            newClone.appendChild(newComponentTable);
            let tableHead = document.getElementById("headComponents");
            let newTableHead = tableHead.cloneNode(true);
            newComponentTable.appendChild(newTableHead);
            let newTableBody = document.createElement("tbody");
            newTableBody.classList.add("allComponentValues");
            newTableBody.id = "allComponentValues" + newPage;
            newComponentTable.appendChild(newTableBody);
            while (
              ceo[0].children[i] &&
              availableHeight >= ceo[0].children[i].clientHeight
            ) {
              availableHeight -= ceo[0].children[i].clientHeight;
              newTableBody.appendChild(ceo[0].children[i]);
              noOfCEOs--;
            }
          } else {
            if (availableHeight > 140) {
              halfed = false;
              if (newClone) {
                let newPage2 = pageNumber - 1;
                let containerId = "sysDetailscontainerClone" + newPage2;
                let newClone = document.getElementById(containerId);
                let sysOrientation = document.getElementById("sysOrientation");
                newClone.appendChild(sysOrientation);
                availableHeight -= 105;
              } else {
                let oldClone = document.getElementById("tableContainerSDSId");
                let sysOrientation = document.getElementById("sysOrientation");
                oldClone.appendChild(sysOrientation);
                availableHeight -= 105;
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
                availableHeight = 490.2;
                var newClone = cloneIt(
                  "sysDetails",
                  "systemDetails_section",
                  "secHeaderSDSId",
                  "sysDetails",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );
                let sysOrientation = document.getElementById("sysOrientation");
                newClone.appendChild(sysOrientation);
                while (
                  ceo1[0].children[j] &&
                  availableHeight >= ceo1[0].children[j].clientHeight
                ) {
                  availableHeight -= ceo1[0].children[j].clientHeight;
                  j++;
                  noOfCEOs1--;
                }
                halfed = false;
              } else {
                availableHeight = 490.2;
                var newClone = cloneIt(
                  "sysDetails",
                  "systemDetails_section",
                  "secHeaderSDSId",
                  "sysDetails",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );
                let innerHeading2 =
                  document.getElementById("tableHeading2SDSId");
                let innerHeadingClone2 = innerHeading2.cloneNode(true);
                innerHeadingClone2.id = "tableHeading2SDSId" + newPage;
                newClone.appendChild(innerHeadingClone2);
                let newOrientationTable = document.createElement("table");
                newOrientationTable.id = "customersSDS4" + newPage;
                newOrientationTable.classList.add("customersSDS2Class");
                newClone.appendChild(newOrientationTable);
                let tableHead = document.getElementById("headOrientation");
                let newTableHead = tableHead.cloneNode(true);
                newOrientationTable.appendChild(newTableHead);
                let newTableBody = document.createElement("tbody");
                newTableBody.classList.add("allOrientationValues");
                newTableBody.id = "allOrientationValues" + newPage;
                newOrientationTable.appendChild(newTableBody);
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
      pageNumber = 2;
    }

    function cloneBatteryStorage() {
      let availableHeight = 0;
      let ceo = document.getElementsByClassName("allBatteryValues");
      let noOfCEOs = ceo[0].childElementCount;
      let i = 0;
      let j = 0;
      while (noOfCEOs) {
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
          var newPage = pageNumber - 1;
          if (noOfCEOs) {
            availableHeight = 490.2;
            var newClone = null;
            newClone = cloneIt(
              "batteryStorage",
              "batteryStorage_section",
              "batteryHeaderSDSId",
              "sysDetails",
              "tableContainerBattery",
              "sysDetails",
              "sysDetailsId"
            );
            let newComponentTable = document.createElement("table");
            newComponentTable.id = "customersSDS2" + newPage;
            newComponentTable.classList.add("customersSDS2Class");
            newClone.appendChild(newComponentTable);
            let tableHead = document.getElementById("headBattery");
            let newTableHead = tableHead.cloneNode(true);
            newComponentTable.appendChild(newTableHead);
            let newTableBody = document.createElement("tbody");
            newTableBody.classList.add("allBatteryValues");
            newTableBody.id = "allBatteryValues" + newPage;
            newComponentTable.appendChild(newTableBody);
            while (
              ceo[0].children[i] &&
              availableHeight >= ceo[0].children[i].clientHeight
            ) {
              availableHeight -= ceo[0].children[i].clientHeight;
              newTableBody.appendChild(ceo[0].children[i]);
              noOfCEOs--;
            }
          }
        }
      }
      let removedChild = document.getElementById("customersBattery");
      removedChild.setAttribute("style", "display:none !important");
      pageNumber = 2;
    }

    function cloneCallOT(wrapperId, wrapperClass) {
      let availableHeight = 580;
      let ceo = document.getElementsByClassName(wrapperClass);
      let noOfCEOs = ceo[0].childElementCount;
      let i = 0;
      while (noOfCEOs) {
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
          availableHeight = 580;
          let newClone = null;
          if (wrapperClass === "allFaqs") {
            newClone = cloneIt(
              "faq",
              "FAQ_section",
              "secHeaderFAQId",
              "faq",
              "quesContainerFAQ",
              wrapperId,
              wrapperClass
            );
          } else {
            newClone = cloneIt(
              "ourTeam",
              "ourTeam_section",
              "secHeaderOTId",
              "ourTeam",
              "ourTeamContainerOT",
              wrapperId,
              wrapperClass
            );
          }
          let newPage = pageNumber - 1;
          let eleId = wrapperId + newPage;
          let newCloneProp = document.getElementById(eleId);
          while (
            ceo[0].children[i] &&
            availableHeight >= ceo[0].children[i].clientHeight
          ) {
            availableHeight -= ceo[0].children[i].clientHeight;
            newCloneProp.appendChild(ceo[0].children[i]);
            noOfCEOs--;
          }
        }
      }
      pageNumber = 2;
    }

    function cloneCallFAQ(wrapperId, wrapperClass) {
      let availableHeight = 535;
      let ceo = document.getElementsByClassName(wrapperClass);
      if (ceo[0]) {
        let noOfCEOs = ceo[0].childElementCount;
        let i = 0;
        while (noOfCEOs) {
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
            availableHeight = 535;
            let newClone = null;
            if (wrapperClass === "allFaqs") {
              newClone = cloneIt(
                "faq",
                "FAQ_section",
                "secHeaderFAQId",
                "faq",
                "quesContainerFAQ",
                wrapperId,
                wrapperClass
              );
            } else {
              newClone = cloneIt(
                "ourTeam",
                "ourTeam_section",
                "secHeaderOTId",
                "ourTeam",
                "ourTeamContainerOT",
                wrapperId,
                wrapperClass
              );
            }
            let newPage = pageNumber - 1;
            let eleId = wrapperId + newPage;
            let newCloneProp = document.getElementById(eleId);
            while (
              ceo[0].children[i] &&
              availableHeight >= ceo[0].children[i].clientHeight
            ) {
              availableHeight -= ceo[0].children[i].clientHeight;
              newCloneProp.appendChild(ceo[0].children[i]);
              noOfCEOs--;
            }
          }
        }
        pageNumber = 2;
      }
    }

    cloneSystemDetails();
    if (this.isBatteryAvailable) {
      cloneBatteryStorage();
    }
    cloneCallOT("allCEOs", "allCeos");
    cloneCallFAQ("allFAQs", "allFaqs");
    cloneSystemPricing();
  },
};
</script>

<style lang="scss" scoped>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Helvetica;
  word-break: break-word;
}

.boldColor {
  font-weight: bold;
  color: #222;
  margin: 0px;
}

.potrait_screen {
  margin: 0px auto;
  width: 595px;
  height: auto;
}

.puppeteer-report .thankYou_section {
  margin-bottom: 0 !important;
}

.SolarProjectProposal {
  height: 841px;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.headerContentTwo {
  height: 70px;
  display: flex;
  justify-content: end;
  align-items: center;
  width: 184px;
}

.logo {
  /* width: 140px; */
  max-width: 140px;
  max-height: 70px;
  object-fit: contain;
}

.SolarProjectProposal .headerTwo {
  background-color: #ecdb41;
  padding: 16px 0px 20px 0px;
}

.SolarProjectProposal .headerTwo .headerTwoContentOne {
  font-size: 40px;
  text-align: center;
  margin: 0px 0px 11px 0px;
}

.SolarProjectProposal .headerTwo .headerTwoContentTwo {
  font-size: 23px;
  text-align: center;
  margin: 0px;
}

.SolarProjectProposal .contContainer {
  background-color: #ecdb41;
  width: 41%;
  margin: 24px 0px 24px 24px;
  padding: 20px;
  border-radius: 4px;
  height: 550px;
  position: relative;
}

.SolarProjectProposal .contContainer .preparedFor {
  font-size: 14px;
  margin-bottom: 8px;
}

.SolarProjectProposal .contContainer .firstName {
  word-break: break-word;
  font-size: 28px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.phNoOne {
  font-size: 15px;
  word-break: break-all;
  margin: 6px 0px;
  font-weight: 100;
}

.SolarProjectProposal .contContainer hr {
  background-color: #222222;
  height: 1px;
  margin: 14px 0px 14px 0px;
}

.SolarProjectProposal .contContainer .userInfo {
  /* height: 270px; */
}

.userInfo .address {
  font-size: 18px;
  margin: 4px 0px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
  line-height: 1.3;
}

.mailOne {
  font-size: 14px;
  margin: 6px 0px;
  word-break: break-word;
  width: 238px;
}

.preparedByContainer {
  position: absolute;
  bottom: 24px;
  padding-right: 20px;
}

.preparedByContainer .preparedBy {
  font-size: 14px;
  margin-bottom: 6px;
}

.preparedByContainer .nameBy {
  font-size: 28px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.preparedByContainer .tata {
  font-size: 28px;
  word-break: break-word;
  margin: 0px 0px 8px 0px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.preparedByContainer .mailBy,
.preparedByContainer .phNo {
  font-size: 15px;
  word-break: break-all;
  margin: 4px 0px;
  font-weight: 100;
}

.preparedByContainer .lic {
  font-size: 15px;
  margin: 0px;
  font-weight: 500;
}

/* -- ----------------------------------------Application---------------------------------- */

.application_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.headerRep {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  height: 94px;
  box-sizing: border-box;
}

.headerName {
  margin: 4px 0px;
  font-weight: 600;
  font-size: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  width: 278px;
}

.headerAddress {
  margin: 4px 0px;
  font-weight: 500;
  font-size: 16px;
  width: 278px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.hrHeaderAPL {
  color: #999;
}

.contentContainerAPL {
  margin: 24px 20px;
}

.paraOneAPL {
  font-weight: 600;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.appHeadAPL {
  font-size: 14px;
  margin-bottom: 16px;
}

.boldAPL {
  font-weight: 600;
}

.paraTwoAPL,
.paraThreeAPL,
.paraFourAPL,
.paraFiveAPL,
.sincerelyAPL {
  font-weight: 500;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.hrFooter {
  color: #999;
  margin: 0px;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.footerContent {
  text-align: right;
  font-weight: 500;
  font-size: 16px;
  padding: 4px 20px;
  margin: 16px 0px;
}

.bold2 {
  font-weight: 600;
}

/* -- ----------------------------------------company overview---------------------------------- */

.CompanyOverview_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.secHeaderCO {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentCO {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.contentCO {
  padding: 16px 24px;
}

.contentOneCO,
.contentTwoCO {
  font-size: 15px;
  word-break: break-word;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contentImgCO {
  display: flex;
  padding: 8px 24px 14px 24px;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 16px;
}

.imgContainerCO {
  width: 175px;
}

.contentHeadingCO {
  font-size: 22px;
  font-weight: 600;
  word-break: break-word;
  margin: 0 24px 16px 24px !important;
  padding-left: 16px;
  border-left: 4px solid #ecdb41;
}

.hrHihiCO {
  width: 25%;
  margin: 16px 0px 0px 0px;
  border: 1px solid #222;
}

.headCO {
  margin: 24px 24px 0px 24px;
  font-size: 16px;
  font-weight: bold;
  color: #263342;
}

.imgCO {
  width: 100%;
  height: 168px;
  object-position: center;
  object-fit: cover;
  border-radius: 8px;
}

.captionCO {
  font-size: 14px;
  margin: 0px;
  color: #263342;
  word-break: break-word;
}

/* --------------------------------------------our team--------------------- */

.ourTeam_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.secHeaderOT {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentOT {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.ourTeamContainerOT {
  margin: 16px 24px;
}

.ourTeamContOT:nth-child(2n) {
  border-radius: 2px;
  background-color: #f0f3f8;
}

.ourTeamContOT {
  display: flex;
  align-items: center;
  padding: 8px;
}

.imgOT {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}

.nameOT {
  font-size: 16px;
  font-weight: bold;
  color: #263342;
  margin: 0px 0px 4px 0px;
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

/* ------------------------------system layout -------------------- */

.systemLayout_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.secHeaderSL {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentSL {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.imgContainerSL {
  margin: 24px 24px 16px 24px;
  // border: 20px solid #f0f3f8;
  // border-radius: 8px;
  text-align: center;
}

.imgSL {
  width: 300px;
  height: 300px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

.scannerContSL {
  margin: 8px 24px;
  text-align: center;
}

.absoluteContSL {
}

.scannerImgSL {
  width: 110px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.absoluteSL {
  font-size: 14px;
  font-weight: 100;
  word-break: break-word;
  margin: 0px;
  text-align: center;
  color: #222;
}

.btnSL {
  text-align: center;
  margin-top: 24px;
}

.aTagSL {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  background-color: #3092f7;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 4px;
}

/* ------------------------------system details -------------------- */

.systemDetails_section,
.batteryStorage_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderSDS {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.systemDetails_section {
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.system_items {
  margin: 1.5rem;
  margin-bottom: 0.5rem;
}
.headerRep {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  height: 94px;
  box-sizing: border-box;
}

.headerContentOne {
  width: 60%;
}

.headerName {
  font-weight: 600;
  font-size: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  width: 278px;
}

.headerAddress {
  margin: 4px 0px;
  font-weight: 500;
  font-size: 16px;
  width: 278px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.3;
}

.headerAddress {
  width: 100%;
}

.secHeaderSDS {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderMD {
  padding: 14px;
}

.secHeaderContentSDS {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.items {
  margin-top: 10px;
  background-color: #e8edf2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 1rem;
}

.item {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 1rem;
}

.item_name {
  margin-left: 10px;
}

.total_cost {
  margin: 1.5rem;
  margin-top: 0;
}
.amount_total {
  margin-bottom: -10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #409eff;
  padding: 1rem;
}
.last_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.hrFooter {
  color: #999;
  margin: 0px;
}

.totalFooter {
  border-color: #409eff;
}

.footerContent {
  text-align: right;
  font-weight: 500;
  font-size: 16px;
  padding: 4px 20px;
  margin: 16px 0px;
}

.bold2 {
  font-weight: 600;
}
.sub_name {
  padding-left: 0.5rem;
}

.secHeaderContentSDS {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.tableContainerSDS,
.tableContainerSYS,
.tableContainerBattery {
  padding: 14px 24px;
}

.tableHeaderWidthSDS {
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

.tablevalueWidthSDS {
  word-break: break-word;
  padding-left: 16px;
  padding: 10px 16px;
  line-height: 1.5;
}

.firTble {
  width: 25%;
  padding: 10px 8px 10px 16px;
}

.secTble {
  width: 60%;
  padding: 10px 8px;
}

/* .thrTble {
    width: 35%;
    padding: 10px 8px;
} */

.frTble {
  width: 15%;
  padding: 10px 16px 10px 8px;
}

.tablevalueSDS:nth-child(even) {
  background-color: #f0f3f8;
}

.tableHeadingSDS {
  margin: 8px 0px 8px 0px;
  font-size: 18px;
  font-weight: 600;
}

.tableHeading2SDS {
  margin: 24px 0px 8px 0px;
  font-size: 18px;
  font-weight: 600;
}

#customersSDS {
  width: 100%;
  border-collapse: collapse;
}

#customersBattery {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderSDS,
.tableHeaderBattery {
  background-color: #263342;
  color: #ffffff;
  font-size: 13px;
  text-align: left;
  vertical-align: baseline;
}

.thHeadSDS {
  white-space: nowrap;
}

.thHeadSDS,
.thValueSDS {
  word-break: break-word;
  padding-left: 16px;
  padding: 10px 0px 10px 16px;
}

.tablevalueSDS {
  font-size: 13px;
  color: #222;
  text-align: left;
  vertical-align: baseline;
  word-break: break-word;
}

/* ------------------------------warranty-------------------- */

.systemWarranty_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderWTY {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentWTY {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.tableContainerWTY {
  margin: 14px 24px;
}

#customersWTY {
  width: 100%;
  border-collapse: collapse;
}

.tableHeaderWidthWTY {
  padding: 10px 16px;
  word-break: break-word;
  white-space: nowrap;
}

.tablevalueWidthWTY {
  word-break: break-word;
  padding: 10px 0px 10px 16px;
  line-height: 1.5;
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

.tablevalueWTY:nth-child(even) {
  background-color: #f0f3f8;
}

.tableHeadingWTY {
  margin: 8px 0px 8px 0px;
  font-size: 18px;
  font-weight: 600;
}

.tableHeading2WTY {
  margin: 24px 0px 8px 0px;
  font-size: 18px;
  font-weight: 600;
}

.tablevalueWTY {
  font-size: 13px;
  color: #222;
  text-align: left;
  vertical-align: baseline;
  word-break: break-word;
}

.paraWTY {
  font-size: 13px;
  word-break: break-word;
  font-weight: 500;
  color: #222;
  margin-top: 4px;
  line-height: 1.5;
}

/* ------------------------------Estimated Annual Production -------------------- */

.annualProduction_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderEAP {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentEAP {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.graphContainerEAP {
  padding: 8px 24px;
}

.graphContentEAP {
  font-size: 14px;
  word-break: break-word;
  margin-bottom: 8px;
}

.graphImgEAP {
  width: 546px;
}

.paraEAP {
  margin: 0px;
  font-size: 12px;
  color: #222;
  word-break: break-word;
  margin-top: 14px;
  margin-bottom: 8px;
}

.flexContainerEAP {
  display: grid;
  grid-template-columns: auto auto;
}

.avgGenEAP,
.yrDegEAP {
  font-size: 14px;
  word-break: break-word;
  margin-bottom: 8px;
}

.avgGenValueEAP,
.yrDegValueEAP {
  font-size: 15px;
  word-break: break-word;
  color: #409eff;
  margin: 0;
  font-weight: 600;
}

/* ------------------------------Estimated Monthly Savings -------------------- */

.monthlyProduction_section {
  height: fit-content;
  padding-bottom: 65px;
  min-height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderEMS {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentEMS {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.graphContainerEMS {
  padding: 8px 24px;
}

.graphContentEMS {
  font-size: 14px;
  word-break: break-word;
  line-height: 1.5;
  margin-bottom: 8px;
}

.graphImgEMS {
  width: 546px;
}

.flexContainerEMS {
  display: flex;
  justify-content: space-between;
}

.avgGenEMS,
.yrDegEMS {
  font-size: 14px;
  word-break: break-word;
  margin-bottom: 8px;
  margin-top: 8px;
}

.avgGenValueEMS,
.yrDegValueEMS {
  font-size: 15px;
  word-break: break-word;
  color: #409eff;
  margin: 0;
  font-weight: 600;
}

.diduKnowContEMS {
  border-radius: 4px;
  background-color: #f0f3f8;
  margin-top: 32px;
  position: relative;
  padding: 8px;
}

.diduKnowEMS {
  background-color: #ecdb41;
  border-radius: 4px;
  position: absolute;
  padding: 8px;
  padding: 6px;
  top: -14px;
  left: 10px;
  font-size: 14px;
  font-weight: 600;
}

.diduKnowValueEMS {
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0px 4px 0px;
  line-height: 1.5;
  word-break: break-word;
}

/* -------------------------------------------------------Cost of Not Going Solar----------------------------------- */

.costofnotgoingsolar_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderCGS {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentCGS {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.graphContainerCGS {
  padding: 8px 24px;
}

.graphContentCGS {
  font-size: 14px;
  word-break: break-word;
  line-height: 1.5;
  margin-bottom: 8px;
}

.graphImgCGS {
  width: 546px;
}

.flexContainerCGS {
  display: grid;
  grid-template-columns: auto auto auto;
  margin-top: 13px;
  margin-bottom: 13px;
}

.avgGenContainerCGS,
.yrDegContainerCGS {
  display: flex;
}

.avgGenCGS,
.yrDegCGS {
  font-size: 14px;
  word-break: break-word;
  margin-bottom: 8px;
}

.avgGenValueCGS,
.yrDegValueCGS {
  font-size: 15px;
  word-break: break-word;
  color: #222222;
  margin: 0;
}

.paraCGS {
  font-size: 14px;
  margin-top: 24px;
  line-height: 1.5;
}

.sqBlueCGS {
  width: 32px;
  height: 16px;
  background-color: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.sqGreyCGS {
  width: 32px;
  height: 16px;
  background-color: #ff8d8f;
  border-radius: 2px;
  margin-right: 8px;
}

/* -------------------------------------------------------Site Evaluation----------------------------------- */

.siteEvaluation_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderSE {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentSE {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.paraSE {
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  margin: 16px 24px 8px 24px;
}

.headingSE {
  font-size: 16px;
  color: #263342;
  margin: 16px 24px 8px 24px;
  font-weight: 600;
}

.imagesContainerSE {
  margin: 0px 24px;
  display: grid;
  grid-template-columns: 200px 200px;
  grid-gap: 24px;
  row-gap: 12px;
}

.imageContSE {
  width: 100%;
}

.imgContentSE {
  font-size: 14px;
  margin: 5px 0;
}

.imgSE {
  width: 200px;
  height: 200px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

.summarySE {
  font-size: 14px;
  margin-left: 24px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.boldSE {
  font-weight: 600;
}

/* -------------------------------------------------------Site Evaluation Two----------------------------------- */

.siteEvaluationTwo_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderSETwo {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentSETwo {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.paraSETwo {
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  margin: 16px 24px 0px 24px;
}

.imagesContainerSETwo {
  margin: 0px 24px;
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 16px;
}

.imageContSETwo {
  width: 100%;
}

.imgContentSETwo {
  font-size: 14px;
  margin: 16px 0;
  color: #263342;
}

.infoSETwo {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  background-image: linear-gradient(
    to left,
    #b2cd3e,
    #b2cd3e,
    #b2cd3e,
    #fa9656,
    #fa9656,
    #fa9656,
    #fa9656,
    #f16840,
    #f16840,
    #e84c2b,
    #aa489a,
    #7b2b91,
    #7b2b91
  );
  padding: 6px 16px;
  border-radius: 4px;
}

.infoSEThree {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 6px 16px;
  border-radius: 4px;
  background-image: linear-gradient(
    to left,
    #1a9850,
    #1a9850,
    #47ae5b,
    #b6e074,
    #fee28f,
    #f6da86,
    #f6da86,
    #fa9656,
    #fa9656,
    #f16840,
    #f16840,
    #f16840,
    #e44023,
    #e44023
  );
}

.gradText {
  margin: 0px;
  font-size: 14px;
}

.betterBoxSETwo {
  height: 12px;
  width: 13px;
  background-color: #f06640;
  border-radius: 2px;
}

.bestBoxSETwo {
  height: 12px;
  width: 13px;
  background-color: #b6e074;
  border-radius: 2px;
}

.exBoxSETwo {
  height: 12px;
  width: 13px;
  background-color: #1a9850;
  border-radius: 2px;
}

.poorSETwo {
  font-size: 14px;
  margin-left: -8px;
}

.imgHeadSETwo {
  font-size: 16px;
  color: #263342;
  margin: 16px 0px 8px 0px;
}

.imgSETwo {
  width: 265px;
  height: 265px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

/* -------------------------------------------------------Project Economics----------------------------------- */

.projectEconomics_section {
  height: fit-content;
  padding-bottom: 65px;
  min-height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderPE {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentPE {
  font-size: 38px;
  margin: 0;
  font-weight: 600;
}

.secHeaderContentTwoPE {
  font-size: 30px;
}

.gridOnePE {
  margin: 10px 24px 0px 24px;
  display: grid;
  grid-template-columns: 31% 31% 32%;
  grid-gap: 16px;
  row-gap: 0px;
}

.gcontPE {
  color: #777;
  font-size: 16px;
  margin-bottom: 4px;
  margin-top: 8px;
  font-weight: 600;
  word-break: break-word;
}

.gValuePE {
  color: #222222;
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 600;
  margin: 0px;
  padding-bottom: 13px;
  border-bottom: 8px solid #f0f3f8;
  word-break: break-word;
}

.gridTwoPE {
  margin: 16px 24px 8px 24px;
  display: grid;
  grid-template-columns: 31% 31% 32%;
  grid-gap: 16px;
  row-gap: 16px;
}

.gcontTwoPE {
  color: #263342;
  font-size: 16px;
  word-break: break-word;
  margin-bottom: 8px;
  font-weight: 600;
}

.gValueTwoPE {
  color: #222222;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
  margin: 0px;
  word-break: break-word;
}

.imgPE {
  margin: 14px 24px;
  width: 547px;
}

.diduKnowContPE {
  border-radius: 4px;
  background-color: #f0f3f8;
  position: relative;
  padding: 8px;
  margin: 14px 24px;
}

.diduKnowPE {
  background-color: #ecdb41;
  border-radius: 4px;
  position: absolute;
  padding: 8px;
  padding: 6px;
  top: -14px;
  left: 10px;
  font-size: 14px;
  font-weight: 600;
}

.diduKnowValuePE {
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0px 4px 0px;
  word-break: break-word;
  line-height: 1.5;
}

/* -------------------------------------------------------Summary and Approvals----------------------------------- */

.summaryandApprovals_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.contentContainer {
}

.secHeaderSAA {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentSAA {
  font-size: 38px;
  margin: 0;
  font-weight: bold;
}

.containerSAA {
  margin: 16px 24px;
}

.headingsSAA {
  word-break: break-word;
  font-size: 14px;
  font-weight: bold;
  color: #263342;
  margin: 8px 0px;
}

.gridSAA {
  display: grid;
  grid-template-columns: 45% 55%;
  column-gap: 16px;
}

.valueSAA,
.sumSAA {
  font-size: 13px;
  color: #222222;
  margin: 4px 0px;
}

.hrSAA {
  margin: 8px 0px;
}

.flexContSAA {
  display: flex;
  justify-content: space-between;
}

.flexInfoSAA {
  font-size: 13px;
  font-weight: 600;
  margin: 0px;
}

.flexValueSAA {
  font-size: 13px;
  font-weight: 500;
  margin: 8px 0px;
}

.addChargesSAA {
  margin: 4px 0px 0px 0px;
  font-size: 13px;
  font-weight: 100;
  word-break: break-word;
  color: #263342;
}

.roiContainerSAA {
  margin: 10px 0px;
}

.roiSAA {
  font-size: 14px;
  font-weight: bold;
  color: #222;
  word-break: break-word;
  margin: 8px 0px 8px 0px;
}

.listRoiSAA {
  font-size: 13px;
  font-weight: 500;
  color: #263342;
  word-break: break-word;
  margin: 4px 0px 4px 0px;
}

.signatureContainerSAA {
  display: grid;
  margin: 16px 0px;
  grid-template-columns: auto auto;
  grid-gap: 58px;
  row-gap: 0px;
}

.signSAA {
  width: 100px;
  height: 20px;
  border-bottom: #999;
  text-align: center;
}

.sigContentSAA {
  font-size: 13px;
  font-weight: 100;
  color: #263342;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  word-break: break-word;
  margin-bottom: 8px;
}

.ucSAA {
  margin: 0px 0px 8px 0px;
  font-weight: 600;
  color: #222;
  font-size: 13px;
  word-break: break-word;
}

.utSAA {
  margin: 0px 0px 8px 0px;
  font-weight: 500;
  color: #222;
  font-size: 13px;
  word-break: break-word;
}

.tcnSAA {
  margin: 0px 0px 8px 0px;
  font-weight: 500;
  color: #222;
  font-size: 13px;
  word-break: break-word;
}

.ulSAA {
  list-style: initial;
  margin-left: 16px;
}

/* -------------------------------------------------------Frequently Asked Questions----------------------------------- */

.FAQ_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.secHeaderFAQ {
  background-color: #ecdb41;
  padding: 14px 24px;
}

.secHeaderContentFAQ {
  font-size: 38px;
  margin: 0;
  font-weight: bold;
}

.quesContainerFAQ {
  margin: 14px 24px;
}

.quesContainerTwoFAQ {
  margin: 24px;
}

.quesFAQ {
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
  margin: 0px 0px;
}

.ansFAQ {
  color: #777777;
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 600;
  margin: 0px;
  overflow: initial;
}

.huihuiAnsFAQ {
  color: #777;
  font-weight: 600;
  font-size: 13px;
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

/* ------------------------------------------------------next step-------------------------------------- */

.nextStep_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.nextStepContainerNS {
  margin: 24px;
}

.flexContNS {
  display: flex;
  align-items: center;
  padding: 13px;
}

.flexContNS:nth-child(odd) {
  background-color: #f0f3f8;
}

.countNS {
  color: #ecdb41;
  margin: 0px;
  font-size: 35px;
  margin-right: 24px;
  word-break: keep-all;
  font-weight: 600;
}

.valueNS {
  color: #222;
  font-size: 15px;
  font-weight: 600;
  margin: 0px;
  word-break: break-word;
  line-height: 1.5;
}

/* ------------------------------------------------------Additional Information----------------------------------------------- */

.additionalInfo_section {
  height: fit-content;
  padding-bottom: 65px;
  min-height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.nextStepContainerADI {
  margin: 12px 24px 12px 24px;
}

.paraADI {
  line-height: 1.3;
  font-size: 11px;
  margin-bottom: 8px;
  color: #222;
  word-break: break-word;
}

.nextStepContainerTwoADI {
  margin: 12px 24px 12px 24px;
}

.listContADI {
  list-style-position: outside;
  list-style: initial;
  margin-left: 16px;
}

.listADI {
  line-height: 1.3;
  font-size: 12px;
  margin-bottom: 8px;
  color: #222;
  word-break: break-word;
}

.aADI {
  color: #409eff;
}

#customersADI {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 1px solid #ccc;
}

.tableHeaderADI {
  background-color: #263342;
  color: #ffffff;
  font-size: 11px;
  text-align: left;
  vertical-align: baseline;
}

.tableHeaderWidthADI {
  padding: 6px 10px;
  word-break: break-word;
  border: 1px solid #ccc;
}

.tablevalueWidthADI {
  word-break: break-word;
  padding: 6px 2px 6px 10px;
  line-height: 1.5;
}

.tablevalueADI {
  font-size: 10px;
  color: #222;
  text-align: left;
  vertical-align: baseline;
  word-break: break-word;
}

.tablevalueADI:nth-child(even) {
  background-color: #f0f3f8;
}

.tableBorderADI {
  border-right: 1px solid #ccc;
  width: 150px;
  word-break: break-word;
  padding: 6px 6px 6px 10px;
}

/* ------------------------------------------------------thank you -------------------------------------- */

.thankYou_section {
  border: 1px solid #ccc;
  margin-bottom: 24px;
  height: 841px;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}

.thankYouSec {
  position: relative;
  height: 620px;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
}

.footerThanku {
  border-top: 10px solid #ecdb41;
  padding: 0px 24px;
}

.thankU {
  font-size: 30px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
  margin-top: 24px;
}

.gridTY {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 70px;
  margin-bottom: 8px;
}

.flexTY {
  display: grid;
  align-items: center;
  grid-template-columns: 30px auto;
  margin: 0px 0px 8px 0px;
}

.imgBorder {
  height: 30px;
  width: 30px;
  background-color: #263342;
  border-radius: 4px;
  position: relative;
}

.iconTY {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: 16px;
}

.mailTY {
  font-size: 17px;
  color: #222;
  word-break: break-word;
  margin: 8px 0px;
  margin-left: 13px;
}

.containerBS {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-top: 8px;
}

.thunderIcon {
  width: 45px;
}

.iconsContBS {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #999;
  padding-bottom: 16px;
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
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
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
  padding: 12px 10px;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  align-items: center;
  height: 85px;
  gap: 8px;
}

.dAndHrsBS {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.strgBS {
  font-size: 12px;
  color: #222;
}

.batteryUnit {
  margin-left: 24px;
  margin-bottom: 6px;
}

.cloudImgBS {
  width: 50px;
}

.ftrIconsBS {
  margin-bottom: 4px;
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

.containerSP {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
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
  font-size: 14px;
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

.media-queries {
  @media (max-width: 648px) {
    .potrait_screen {
      width: 100%;
      overflow: hidden;
    }

    .secHeaderMD {
      padding: 14px;
    }

    .headerContentOne {
      width: 60%;
    }

    .headerRep {
      gap: 12px;
      padding: 14px;
    }

    .headerName,
    .headerAddress {
      font-size: 14px;
    }

    .headerAddress {
      width: 100%;
    }

    .headerContentTwo {
      height: 60px;
      width: 120px;
    }

    .logo {
      max-width: 120px;
      max-height: 60px;
    }

    .application_section,
    .CompanyOverview_section,
    .ourTeam_section,
    .systemLayout_section,
    .systemDetails_section,
    .batteryStorage_section .siteEvaluation_section,
    .summaryandApprovals_section,
    .siteEvaluationTwo_section,
    .nextStep_section,
    .annualProduction_section,
    .costofnotgoingsolar_section,
    .FAQ_section,
    .batteryStorage_section {
      height: fit-content;
      padding-bottom: 65px;
      min-height: 841px;
    }

    .secHeaderContentCO,
    .secHeaderContentOT,
    .secHeaderContentSL,
    .secHeaderContentSDS,
    .secHeaderContentSE,
    .secHeaderContentSETwo,
    .secHeaderContentPE,
    .secHeaderContentWTY,
    .SolarProjectProposal .headerTwo .headerTwoContentOne {
      font-size: 30px;
    }

    .secHeaderContentEAP,
    .secHeaderContentEMS,
    .secHeaderContentCGS,
    .secHeaderContentSAA,
    .secHeaderContentFAQ,
    .preparedByContainer .tata {
      font-size: 23px;
    }

    .SolarProjectProposal {
      background-position-x: 72%;
    }

    .SolarProjectProposal .headerTwo .headerTwoContentTwo,
    .SolarProjectProposal .contContainer .firstName,
    .preparedByContainer .nameBy {
      font-size: 18px;
    }

    .SolarProjectProposal .contContainer {
      width: 50%;
      margin: 24px 0px 24px 16px;
      padding: 14px;
    }

    .SolarProjectProposal .contContainer .preparedFor,
    .preparedByContainer .preparedBy,
    .preparedByContainer .mailBy,
    .preparedByContainer .phNo,
    .phNoOne,
    .mailOne {
      font-size: 12px;
    }

    .userInfo .address,
    .imgHeadSETwo {
      font-size: 14px;
    }

    .contentContainerAPL,
    .ourTeamContainerOT,
    .imgContainerSL,
    .paraSE,
    .headingSE,
    .imagesContainerSE,
    .summarySE,
    .paraSETwo,
    .imagesContainerSETwo,
    .gridOnePE,
    .gridTwoPE,
    .imgPE,
    .diduKnowContPE,
    .tableContainerWTY,
    .containerSAA,
    .nextStepContainerNS,
    .quesContainerFAQ,
    .nextStepContainerADI {
      margin-left: 14px;
      margin-right: 14px;
    }

    .contentCO,
    .tableContainerSDS,
    .tableContainerSYS,
    .tableContainerBattery,
    .graphContainerEAP,
    .graphContainerEMS,
    .graphContainerCGS {
      padding: 14px;
    }

    .contentImgCO {
      flex-wrap: wrap;
      column-gap: 8px;
      row-gap: 16px;
    }

    .imgContainerCO {
      width: 48%;
    }

    .imgCO {
      width: 100%;
    }

    .tableHeaderSDS,
    .tableHeaderBattery,
    .tablevalueSDS {
      font-size: 10px;
    }

    .thHeadSDS,
    .thValueSDS {
      padding: 10px 0px 10px 10px;
    }

    .gridOnePE {
      grid-template-columns: 30% 30% 30%;
      grid-gap: 14px;
    }

    .gcontPE,
    .gcontTwoPE {
      font-size: 12px;
    }

    .gValuePE {
      font-size: 16px;
    }

    .imgPE {
      width: 92%;
    }

    .tablevalueWidthWTY {
      padding: 10px 0px 10px 8px;
    }

    .tableHeaderWidthWTY {
      padding: 10px 8px;
    }

    .tablevalueWTY {
      font-size: 10px;
    }

    .footerThanku {
      padding: 0 14px;
    }

    .thankYouSec {
      height: 550px;
    }

    .mailTY {
      font-size: 14px;
    }

    .gridTY {
      column-gap: 32px;
    }

    .imgContentSE {
      font-size: 13px;
    }

    .imagesContainerSE {
      margin: 0px 14px;
      display: grid;
      grid-template-columns: 150px 150px;
      grid-gap: 16px;
      row-gap: 12px;
    }

    .imagesContainerSETwo {
      grid-template-columns: auto;
      grid-gap: 0px;
    }

    .imgSETwo {
      width: 100%;
      height: auto;
    }

    .tableBorderADI {
      width: 112px;
    }

    .ourTeamContOT {
      align-items: flex-start;
    }

    .imgSE {
      height: 150px;
      width: 150px;
    }

    .iconsContBS {
      grid-template-columns: 1fr;
    }
  }
}

.SolarProjectProposal {
  background-image: url("./assets/img/image.png");
}

.thankYouSec {
  background-image: url("./assets/img/istockphoto-1331182224-612x612.png");
}
</style>

<style scoped>
.ourTeam_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
  background-color: #fff;
  -webkit-box-shadow: 0 4px 4px 0 rgb(0 0 0 / 8%);
  box-shadow: 0 4px 4px 0 rgb(0 0 0 / 8%);
}
/* .parentContainer {
  background-color: #f0f3f8;
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  padding: 50px 24px 24px 24px;
  gap: 80px;
}

.cardContainer {
  width: 350px;
  position: sticky;
  top: 50px;
}

.cardPS {
  width: 100%;
  padding: 15px 15px 24px 15px;
  border-radius: 4px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f3f8;
  background-color: #fff;
}

.proSumHead {
  font-size: 16px;
  font-weight: normal;
  color: #777;
  margin-bottom: 16px;
}

.flexContPS {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.txtPS {
  font-size: 16px;
  font-weight: normal;
  color: #263342;
}

.boldPS {
  font-weight: 600;
}

.hrPS {
  margin: 16px auto;
  color: #ccc;
}

.aAndSBtn {
  width: 100%;
  margin-top: 16px;
  font-size: 20px;
  font-weight: bold;
}

.lowBtnCont {
  border-radius: 4px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #777;
  background-color: #fff;
  margin-top: 24px;
  text-align: center;
  padding: 14px 0px;
  cursor: pointer;
}

.lowBtn {
  font-size: 20px;
  font-weight: bold;
  color: #777;
} */

.chartDiv {
  /* background-color: white; */
  background-color: #f0f3f8;
  /* position: relative; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  /* min-width: 600px; */
  /* padding: 10px; */
}

.chart {
  /* background: yellow; */
  width: 500px;
}

.chart #bar-chart {
  /* background: cyan; */
  width: 100%;
}

.chartDivBreakEven {
  /* margin: 16px 24px 32px 24px;
  width: 547px;
  background-color: #f0f3f8;
  display: flex; */
  /* flex-direction: column; */
  /* align-items: center;
  justify-content: center; */
  /* padding-top: 10px; */
  /* padding-bottom: 10px; */
  /* position: relative; */

  background-color: #f0f3f8;
  /* display: flex;
  align-items: center;
  justify-content: center; */
  /* width: auto; */
  /* width: 100%; */
  width: 547px;
  margin-left: 24px;
  position: relative;
  /* padding-top: 24px; */
  padding-top: 5px;
}

.chartBreakEven {
  /* display: flex;
    align-items: center;
    justify-content: center; */
  /* background: yellow; */
  /* width: 100%; */
  /* width: 500px; */
  /* margin-left: 20px; */
  /* background: yellow; */
  /* padding: 20px; */
}

.chartBreakEven #bar-chart {
  /* width: 100% !important; */
  display: block !important;
  /* width: 500px !important; */
  width: 547px !important;
  height: 300px !important;
  /* padding-left: 5px !important; */
  /* margin-left: 20px; */
  /* background: yellow; */
  /* padding: 20px; */
}

.chartDivWOrWSolar {
  padding-top: 36px;
  padding-bottom: 10px;
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

.chartBillWithOrWithoutSolar {
  /* width: 900px; */
  /* margin-left: 20px; */
  /* background: yellow; */
  /* padding: 20px; */
  width: 100%;
  /* display: flex;
    align-items: center;
    justify-content: center; */
}

.chartBillWithOrWithoutSolar #bar-chart {
  display: block !important;
  /* width: 500px !important; */
  /* width: 100% !important; */
  width: 547px !important;
  height: 300px !important;
  /* margin-left: 20px; */
  /* background: yellow; */
  /* padding: 20px; */
}

.yUnit {
  /* position: absolute;
    top: 0px;
    left: 101px; */
  align-self: flex-start;
  margin-left: 40px;
  margin-top: 0px;
  margin-bottom: 4px;
  /* width: 10px; */
  height: 22px;
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: right;
  color: #222;
}

.yUnit-kWh {
  /* position: absolute;
    top: 0px;
    left: 101px; */
  align-self: flex-start;
  margin-left: 25px;
  /* margin-top: 40px; */
  margin-bottom: 4px;

  /* width: 10px; */
  height: 22px;
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: right;
  color: #222;
}

.yUnitBreakEven {
  /* position: absolute;
    top: 0px;
    left: 101px; */
  /* align-self: flex-start;
    margin-left: 130px;
    margin-top: 40px; */

  /* width: 10px; */
  /* height: 22px;
    font-family: BrandonText;
    font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.38;
    letter-spacing: normal;
    text-align: right;
    color: #222; */
  color: #222;
  position: absolute;
  top: 9px;
  left: 37px;
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
  position: absolute;
  top: 9px;
  left: 37px;
}
</style>

<style>
.FAQ_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.ourTeam_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.ourTeamContainerOT {
  margin: 16px 24px;
}
.quesContainerFAQ {
  margin: 14px 24px;
}
.systemDetails_section,
.projectPricing_section,
.batteryStorage_section {
  height: 841px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
  background-color: #fff;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.tableContainerSDS,
.tableContainerSYS,
.tableContainerBattery {
  padding: 14px 24px;
}
.customersSDS2Class {
  width: 100%;
  border-collapse: collapse;
}

/* CSS LEAK POSSIBILITY HERE */
.doc-page {
  margin-top: 24px;
}

.puppeteer-report .doc-page {
  margin-top: 0 !important;
  width: 595px;
  height: 842px;
}

.contentCO {
  padding: 16px 24px;
}

.contentOneCO,
.contentTwoCO {
  font-size: 15px;
  word-break: break-word;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contentHeadingCO {
  font-size: 22px;
  font-weight: 600;
  word-break: break-word;
  margin: 0 24px 16px 24px !important;
  padding-left: 16px;
  border-left: 4px solid #ecdb41;
}

@media (max-width: 648px) {
  .application_section,
  .CompanyOverview_section,
  .ourTeam_section,
  .systemLayout_section,
  .systemDetails_section,
  .batteryStorage_section,
  .FAQ_section,
  .batteryStorage_section {
    height: fit-content;
    padding-bottom: 65px;
    min-height: 841px;
  }
}
</style>

<style lang="scss" scoped>
.media-queries {
  @media (max-width: 648px) {
    .chart {
      width: 100%;
    }

    .chartDivBreakEven {
      width: 92%;
      margin-right: 14px;
      margin-left: 14px;
    }

    .yUnitBreakEven,
    .yUnitBillWithOrWithoutSolar {
      left: 16px;
    }

    .yUnit {
      margin-left: 16px;
    }

    .cardContainer {
      width: 100%;
    }

    .parentContainer {
      padding: 24px 16px;
    }

    body {
      font-size: 50%;
    }

    .potrait_screen {
      width: 100%;
      overflow: hidden;
    }

    .imgOT {
      width: 40px;
      height: 40px;
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

    .containerSP {
      padding: 16px;
    }

    .paddingColumnSP {
      padding-left: 24px;
    }
  }
}
</style>
