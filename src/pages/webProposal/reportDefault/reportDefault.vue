<template>
  <div id="reportDefault" class="reportLoaded" :class="isPuppeteer ? '' : 'media_queries'">
    <!-- first pageDefault starts here DONE-->

    <div class="pageDefault next_page homePage" :class="isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('title')">
      <!-- left block starts here-->
      <!-- {{ dataFromAPI }} -->
      <div id="projectDescription" style="display: inline-block">
        <div
          id="projectName"
          class="headings primaryColor"
          style="font-size: 28px; word-wrap: break-word; -webkit-box-orient: vertical;
            -webkit-line-clamp: 3; overflow: hidden; display: -webkit-box;"
        >
          <p v-html="projectNameFiltered(dataFromAPI.project_head.name)"></p>
        </div>
        <div
          id="projectAddress"
          class="firstPageAddress secondaryColor"
          style="
            word-wrap: break-word;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 7;
            overflow: hidden;
            font-size: 19px;
          "
        >
          {{ dataFromAPI.project_head.address }}
        </div>
        <div
          id="dcSize"
          class="headings primaryColor"
          style="font-size: 32px; padding: 10px 0"
        >
          {{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"])}} kWp
        </div>
        <div
          id="latlong"
          class="firstPageAddress secondaryColor"
          style="font-size: 16px"
        >
          ({{ parseFloat(dataFromAPI.project_head.latitude).toFixed(5) }} ,
          {{ parseFloat(dataFromAPI.project_head.longitude).toFixed(5) }})
        </div>
        <div
          id="clientName"
          class="firstPageAddress secondaryColor nameBottomPosition"
          style="word-wrap: break-word"
        >
         <p v-html="projectNameFiltered(clientNameComputed)"></p>
        </div>
      </div>
      <!-- left block ends here -->

      <!-- right block starts here -->
      <div style="display: inline-block" class="fPageBoxWidth">
        <div
          style="height: 390px; border: solid 12px"
          class="frontPageLayoutImage"
          v-loading="!dataFromAPI.detailed_layout"
        >
          <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" class="view3DModelViaImage">
            <img :src="dataFromAPI.detailed_layout" class="reportImages loadingImages" />
          </router-link>
         
        </div>

        <div class="view3D" style="text-align: right; padding: 10px 6px 0 0">
          <router-link :to="{ name: 'DesignOverview', params: { designUUID: this.referenceId }}" class="view3DModel primaryColor">
            Click to View 3D Model
          </router-link>
        </div>
      </div>

      <!-- right block ends here -->
      <!-- branding and contact details part -->

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- first pageDefault ends here -->

    <!-- about us pageDefault starts here -->

    <!-- <div
      class="pageDefault next_page aboutUsPage"
      :class="isPuppeteer ? 'pagePuppeteer' : ''"
      v-if="pagesNew.includes('about-us')"
    >
      <div>
        <div class="abtFlxMD">
          <div class="headings primaryColor" style="margin: 0 0 10px 0; white-space: nowrap;">
            About Us
          </div>

          <div>
            <img
              style="max-width: 200px; max-height: 100px"
              :src="dataFromAPI.organisation_data.logo"
              class="abtLogo"
            />
          </div>
        </div>
      </div>

      <div style="width: auto; margin: 0px 0 0 10px">
        <div class="aboutUsText" v-if="dataFromAPI.organisation_data.about_us">
          {{ dataFromAPI.organisation_data.about_us }}
        </div>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            Generated on 22 Aug, 2022 | 03:25 PM 
            Generated on {{ dateAndTime }}
          </div>
        </div>
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- about us pageDefault end here -->
    <!-- sytem metrics starts here -->


   <div id="companyOverviewMain" v-show="pagesNew.includes('company-overview')">
      <div
        class="pageDefault next_page sysMetricsPage"
        :class="isPuppeteer ? 'pagePuppeteer' : ''"
      >
        <div style=" display: inline-block"  id="headerIdCO">
          <div class="headings primaryColor">Company Overview</div>
          <div class="subheadings"></div>
        </div>

        <div style="width: auto; display: inline-block">
          <div class="contentContCO">
              <p class="contentCO">{{ dataFromAPI.organisation_data.about_us }}</p>
            </div>
            <h4 class="headingCO" v-if="dataFromAPI.previous_project_details.previous_project_one_name ||
                                      dataFromAPI.previous_project_details.previous_project_two_name ||
                                      dataFromAPI.previous_project_details.previous_project_three_name">Previous Projects</h4>
            <div class="imgContainerCODefault">
              <div class="imgContCO"  v-if="dataFromAPI.previous_project_details.previous_project_one_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_one_image" class="imgCO" />
                <div class="flexContCO">
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_one_name }}
                  </p>
                </div>
              </div>
              <div class="imgContCO" v-if="dataFromAPI.previous_project_details.previous_project_two_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_two_image" class="imgCO" />
                <div class="flexContCO">
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_two_name }}
                  </p>
                </div>
              </div>
              <div class="imgContCO" v-if="dataFromAPI.previous_project_details.previous_project_three_name">
                <img :src="dataFromAPI.previous_project_details.previous_project_three_image" class="imgCO" />
                <div class="flexContCO">
                  <p class="imgDescCO">
                    {{ dataFromAPI.previous_project_details.previous_project_three_name }}
                  </p>
                </div>
              </div>
            </div>
          <div class="footerDiv" id="footer">
          <div>
            <hr
              style="
                border: 1px solid #d1d1d1;
                width: 100%;
                margin: auto;
                margin-bottom: 12px;
              "
            />
            <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
              <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
            </div>
            <div
              style="display: inline-block; padding-left: 4px"
              class="footerCompanyName"
            >
              {{ organisationName }}
            </div>
            <div class="brandingFooter">
              <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
              Generated on {{ dateAndTime }}
            </div>
          </div>

          <!-- company Logo -->
          <div class="organisationLogoandDetailsWrapper">
            <div>
              <div class="companyDetails">
                <div v-if="dataFromAPI.organisation_data.email_id">
                  {{ dataFromAPI.organisation_data.email_id }}
                </div>

                <div v-if="dataFromAPI.organisation_data.phone">
                  {{ dataFromAPI.organisation_data.phone }}
                </div>

                <div v-if="dataFromAPI.organisation_data.website">
                  {{ dataFromAPI.organisation_data.website }}
                </div>
              </div>
            </div>
            <div style="max-height: 55px; max-width: 200px; object-fit: contain">
              <!-- company Logo -->

              <div id="companyLogo" style="height: 100%">
                <img
                  style="max-height: 40px; max-width: 100px"
                  :src="dataFromAPI.organisation_data.logo"
                  alt=""
                  class="fPageFLogo"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>  
    <div id="ourTeamMain" v-show="pagesNew.includes('our-team') && teamMembersArray.length">
    <div
      class="pageDefault next_page sysMetricsPage"
      :class="isPuppeteer ? 'pagePuppeteer' : ''"
    >
      <div style="width: 240px; display: inline-block" id="headerIdOT">
        <div class="headings primaryColor">Our Team</div>
        <div class="subheadings"></div>
      </div>

      <div style="width: auto; display: inline-block">
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
        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>   
    </div>
    <div
      class="pageDefault next_page sysMetricsPage"
      :class="isPuppeteer ? 'pagePuppeteer' : ''"
      v-if="pagesNew.includes('system-metrics')"
    >
      <div style="width: 240px; display: inline-block">
        <div class="headings primaryColor">System Metrics</div>
        <div class="subheadings"></div>
      </div>

      <div style="width: auto; display: inline-block">
        <div style="margin: 0px 0 24px 0" class="sysBox">
          <div class="performanceBoxes primaryColorBackground">
            <div class="boxParameters">ANNUAL PRODUCTION</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              <!-- {{ dataFromAPI.system_metrics["Annual Production"]}} -->
              <div class="values_text">{{ convertedWithComaskWh(annualProduction) }}</div>
            </div>
            <div class="metricUnits">x 1000 kWh (Units)</div>
          </div>

          <div class="performanceBoxes secondaryColorBackground">
            <div class="boxParameters">PERFORMANCE RATIO</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              {{ dataFromAPI.system_metrics["Performance Ratio"] }}
            </div>
            <div class="metricUnits"></div>
          </div>

          <div
            class="performanceBoxes tertiaryColorBackground"
            style="margin-right: 0px"
          >
            <div class="boxParameters">SPECIFIC GENERATION</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              {{
                convertedWithComaskWh(dataFromAPI.system_metrics["Specific Generation (kWh/kWp/year)"])
              }}
            </div>
            <div class="metricUnits">kWh/kWp/year</div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 16px">
          <div class="leftParameters">
            <div class="parameter primaryColor">Module DC Nameplate</div>
            <div class="parameterValue">
              {{ convertedWithComaskWh(dataFromAPI.system_metrics["Module DC Nameplate"]) }} kWp
            </div>
          </div>

          <div class="rightParameters">
            <div class="parameter primaryColor">AC Nameplate</div>
            <div class="parameterValue">
              <!-- {{ dataFromAPI.system_metrics["AC Nameplate"] }} -->
              {{ convertedWithComaskWh(acNameplate) }} kW
            </div>
          </div>

          <div class="leftParameters">
            <div class="parameter primaryColor">DC-AC Ratio</div>
            <div class="parameterValue">
              <!-- {{ dataFromAPI.system_metrics["AC Nameplate"] }} -->
              {{ loadRatio }}
            </div>
          </div>

          <div class="rightParameters">
            <div class="parameter primaryColor">Weather Dataset</div>
            <div class="parameterValue">
              {{ dataFromAPI.system_metrics["Weather Dataset"] }}
            </div>
          </div>
        </div>

        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- -----------------------------------------system pricing---------------------------------- -->
    <div id="systemPricingMain">
      <div
        class="pageDefault next_page sysMetricsPage"
        :class="isPuppeteer ? 'pagePuppeteer' : ''"
        v-if="pagesNew.includes('system-pricing')"
      >
        <div style="width: 240px; display: inline-block" id="headerIdPricing">
          <div class="headings primaryColor">System Pricing</div>
          <div class="subheadings"></div>
        </div>

        <div style="width: 100%; display: inline-block">
          <div class="containerSP">
              <div class="columnSP">
                <p class="labelSP">Base Price</p>
                <p class="valSP"> {{  handleCurrencyFormate(parseFloat(dataFromAPI.base_price.replace(/,/g, ''))) }}</p>
              </div>
            <div id="tableContainerSDSId">
              <div id="adderFullId" class="adderFullClass">
              <div class="columnSP" id="addonHeading">
                <p class="labelSP">Add-ons</p>
                <p class="valSP" id="addonValue">{{ handleCurrencyFormate(parseFloat(dataFromAPI.adders.replace(/,/g, ''))) }}</p>
              </div>
              <div class="allAddons">
              <div class="paddingColumnSP"  v-for="adder in addersData" :key="adder.id">
                <p class="labelSP"  v-if="adder.adders_discounts__is_homeowner_facing === true">{{ adder.adders_discounts__name }}</p>
                <p class="valSP" v-if="adder.adders_discounts__show_adder_total === true">{{ handleCurrencyFormate(adder.amount * adder.quantity) }}</p>
              </div>
            </div>
            </div>
            <div id="discountFullId" class="discountFullClass">
              <div class="columnSP">
                <p class="labelSP">Discounts</p>
                <p class="valSP">{{ handleCurrencySymbol }}{{ dataFromAPI.discounts }}</p>
              </div>
            <div class="allDiscounts">
              <div class="paddingColumnSP" v-for="disc in discountsData" :key="disc.id">
                <p class="labelSP" v-if="disc.adders_discounts__is_homeowner_facing === true">{{ disc.adders_discounts__name }}</p>
                <p class="valSP"  v-if="disc.adders_discounts__show_adder_total === true">{{ handleCurrencyFormate(disc.amount * disc.quantity) }}</p>
              </div>
            </div>
            </div>
            <div id="elsePart">
              <div class="totalColumnSP">
                <p class="labelSPBlue">Total Payable Now (See Payment Schedule)</p>
                <p class="labelSPBlue">{{ handleCurrencyFormate(parseFloat(dataFromAPI.total_cost_before_incentive.replace(/,/g, '')))}}</p>
              </div>
              <div class="columnSP">
                <p class="labelSP">Incentives</p>
                <p class="valSP">-{{ handleCurrencyFormate(parseFloat(dataFromAPI.total_insentive.replace(/,/g, ''))) }}</p>
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
        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>


   <!-- ----------------------------------------Battery Storage---------------------------------- -->
   <div id="batteryMain" v-show="pagesNew.includes('battery-storage') && isBatteryAvailable">
    <div
      class="pageDefault next_page sysMetricsPage"
      :class="isPuppeteer ? 'pagePuppeteer' : ''"
    >
      <div style="width: 240px; display: inline-block" id="headerIdBattery">
        <div class="headings primaryColor">Battery Storage</div>
        <div class="subheadings"></div>
      </div>

      <div style="width: auto; display: inline-block">
        <div class="containerBS">
          <div class="tbcContainerBS">
            <p class="tbcContentBS">Total Battery Capacity</p>
            <h3 class="tbcValueBS">{{batteryData['total_battery_capacity'] ? batteryData['total_battery_capacity'] : '-'}} kWh</h3>
          </div>
          <div class="tbcContainerBS">
            <p class="tbcContentBS">Additional Saving from Battery</p>
            <h3 class="tbcValueBS">{{additionalSavingsPostBattery ? currencySymbolNameMap[dataFromAPI.country.currency_code] + additionalSavingsPostBattery : '-'}}</h3>
          </div>
        </div>
        <p class="backupContentBS">In an outage, get a backup of</p>
        <div class="footerContBS">
          <div class="boxOneBS boxOneColorBS">
              <div class="ftrIconsBS">
                <p class="dAndHrsBS">{{batteryBackupOnStorageAndLoadText}}</p>
              </div>
              <p class="strgBS">on storage with critical load</p>
          </div>
          <div class="boxOneBS boxTwoColorBS">
              <div class="ftrIconsBS">
                <p class="dAndHrsBS">{{batteryBackupOnStorageText}}</p>
              </div>
              <p class="strgBS">on storage only</p>
          </div>
          <div class="boxTwoBS boxThreeColorBS">
              <div class="ftrIconsBS">
                <p class="dAndHrsBS">{{batteryBackupOnStorageAndSolarText}}</p>
              </div>
              <p class="strgBS">on solar & storage</p>
          </div>
        </div>
          <table id="customersSDS" class="customersSDS2Class">
                  <thead id="headBattery">
                    <tr class="tableHeaderSDS">
                      <th class="tableHeaderWidthSDS oneHead">Battery<br/>Manufacturer</th>
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
            <div class="lossesChartWrapper" style="margin-top: 40px">
              <!-- <canvas id="with_without_solar_chart"></canvas>           -->
              <div style="margin-bottom: 10px; font-size: 15px; margin-left: 20px; color: white;">{{ this.currencyCode }}</div>
              <div class="graph_area_withOrWithoutSolar">
                <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
                <battery-saving-analysis-chart
                    :estimatedUtilityBillWithSolarData="estimatedUtilityBillWithSolarData" :estimatedUtilityBillWithoutSolarData="residualEnergyPostBatteryBill" :estimatedUtilityBillDataLabels="estimatedUtilityBillDataLabels"
                    :currencyCode="currencyCode" 
                    :updatedData="updatedData" 
                    :key="notGoingSolarkey"
                    :reportTemplate="reportTemplate" />
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
                    <span class="whiteFont">Bill with Solar & Battery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
   </div>

    <!-- sytem metrics ends here -->

    <!-- sytem metrics 2nd pageDefault starts here -->

    <!-- sytem metrics ends here -->

    <!-- Estimated Savings starts here -->

    <div
      class="pageDefault next_page estSavingPage"
       :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('savings') && !isThisPageDisabled('savings')"
    >
      <div style="display: inline-block">
        <div class="headings primaryColor">Estimated Savings</div>
        <div class="subheadings">
          The estimated savings using solar for the next 25 years along with
          Total Savings, Payback Period and IRR
        </div>
      </div>

      <div style="width: 516px; display: inline-block" class="estWidth">
        <div style="margin: 0px 0 24px 0" class="estSavBox">
          <div class="performanceBoxesSavings primaryColorBackground">
            <div class="boxParameters">TOTAL SAVINGS</div>
            <hr class="alignHorizontalSavings" />
            <div class="savings_metrics">
              {{ convertedWithComas(dataFromAPI.financial_data?.total_savings) }}
            </div>
            <div class="metricUnits">
              {{ dataFromAPI.country.currency_code }}
            </div>
          </div>

          <div class="performanceBoxesSavings secondaryColorBackground">
            <div class="boxParameters">PAYBACK PERIOD</div>
            <hr class="alignHorizontalSavings" />
            <div class="savings_metrics" id="paybackPeriod">
              <div>
                  {{ dataFromAPI.financial_data && dataFromAPI.financial_data.payback.years }}  
                        <span class="subscriptMonthYear" v-if="dataFromAPI.financial_data && dataFromAPI.financial_data.payback.years && dataFromAPI.financial_data.payback.years>1" >yrs.</span>
                        <span class="subscriptMonthYear" v-else> yr. </span>

                        {{ dataFromAPI.financial_data && dataFromAPI.financial_data.payback.months }} 
                        <span class="subscriptMonthYear" v-if=" dataFromAPI.financial_data && dataFromAPI.financial_data.payback.months && dataFromAPI.financial_data.payback.months>1" >mons.</span>
                        <span class="subscriptMonthYear" v-else>mon.</span>
              </div>
            </div>
          </div>

          <div
            class="performanceBoxesSavings tertiaryColorBackground"
            style="margin-right: 0px"
          >
            <div class="boxParameters">INTERNAL RATE OF RETURN</div>
            <hr class="alignHorizontalSavings" />
            <div class="savings_metrics">
              {{ dataFromAPI.financial_data.irr }}%
            </div>
            <div class="metricUnits"></div>
          </div>
        </div>

        <div class="estSavBox">
          <div class="savingsParameters">
            <div class="parameter primaryColor">Price</div>
            <div class="parameterValue">
              <div
                class="value"
                v-if="dataFromAPI.financial_data.price_per_watt !== null"
              >
                {{ convertedWithComas(dataFromAPI.financial_data.price_per_watt) }}
                {{ dataFromAPI.country.currency_code }}/W
              </div>
              <div
                class="value"
                v-if="dataFromAPI.financial_data.absolute_price !== null"
              >
                {{ dataFromAPI.financial_data.absolute_price }}
                {{ dataFromAPI.country.currency_code }}
              </div>
              <div
                class="value"
                v-if="dataFromAPI.financial_data.price_per_kw !== null"
              >
                {{ dataFromAPI.financial_data.price_per_kw }}
                {{ dataFromAPI.country.currency_code }}/kW
              </div>
            </div>
          </div>

          <div class="savingsParameters">
            <div class="parameter primaryColor"> {{ taxType }} </div>
            <div class="parameterValue">
              {{ dataFromAPI.financial_data.tax }}% 
            </div>
          </div>
          <div class="savingsParameters">
            <div class="parameter primaryColor">Year 1 Usage Offset</div>
            <div class="parameterValue">
              {{ dataFromAPI.system_metrics['Year 1 Usage Offset'] }}%
            </div>
          </div>
          <div class="savingsParameters">
            <div class="parameter primaryColor">LCOE</div>
            <div class="parameterValue">
              {{currencySymbolNameMap[dataFromAPI.country.currency_code] + convertedWithComas(dataFromAPI.financial_data.LCOE) }}/kWh
              <!-- {{ dataFromAPI.country.currency_code }} -->
            </div>
          </div>

          <div class="savingsLastParameters">
            <div class="parameter primaryColor">Expected Life Years</div>
            <div class="parameterValue">
              {{ dataFromAPI.financial_data.expected_life_years }} Years
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column">
          
            <div style="margin-bottom: 10px; font-size: 15px; margin-left: 35px;">{{ this.currencyCode }}</div>
            <div class="estimatedSavingsDiv">
              <web-proposal-bar-chart-estimated-savings 
                :savingsData="savingsDataYearly" 
                :savingsDataLabels="savingsDataLabelsYearly" 
                :currencyCode="currencyCode"
                :reportTemplate="reportTemplate"
                :key="estSavingGraphKey"
                :updatedData="updatedData" />
          </div>
          <div style="font-size: 15px; text-align: center; margin-left: 80px;">Estimated Savings</div>
          <!-- <div>Estimated Savings</div> -->
        </div>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  Incentives starts here -->
    <div class="pageDefault next_page incentivesPage"  :class="isPuppeteer ? 'pagePuppeteer' : ''"  v-if="dataFromAPI.insentives_data && dataFromAPI.insentives_data.length">
      <div>
        <div
          class="headings primaryColor"
          style="width: 100%; color: rgb(0, 84, 130)"
        >
          Incentives
        </div>
        <div
          class="incentivesContainer"
          v-if="dataFromAPI.insentives_data.length > 0"
        >
          <div
            class="incentivesDetails"
            v-for="(insentive_check, index) in dataFromAPI.insentives_data"
            :key="index"
          >
            <h4 class="incentiveHeading">{{ insentive_check.name }}</h4>
            <p class="incentiveContent">{{ insentive_check.description }}</p>
          </div>
        </div>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estimated Savings ends here -->
    <!-- components pageDefault starts here -->

    <div id="componentsPageMain" v-if="pagesNew.includes('components')">
      <div class="pageDefault next_page componentsPage"  :class="isPuppeteer ? 'pagePuppeteer' : ''" >
        <!-- left block starts here-->
        <div
          style="width: 268px; display: inline-block"
          id="componentsLeftBlock"
        >
          <div class="headings primaryColor" style="width: 216px">
            Components
          </div>
          <div class="subheadings" style="width: 216px">
            Your installation uses latest technology in solar
          </div>
        </div>
        <!-- left block ends here -->
        <!-- right block starts here -->
        <div>
          <div
            style="width: 484px; display: inline-block; padding: 9px 0 0 0"
            id="componentsRightBlock" class="componentsRightBlockClass"
          >
            <div
              style="margin-bottom: 16px"
              v-for="(comp, ind) in modifiedComponentData"
              v-bind:key="'comp' + ind"
              :id="comp.comp"
            >
              <div style="display: flex; margin: 0 0 8px 0">
                <div class="componentBoxes primaryColorBackground">
                  <img :src="comp.iconFile" style="width: 15px; height: 15px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" />
                </div>
                <div class="parameter primaryColor componentsParameter">
                  {{ comp.comp }}
                </div>
              </div>
              <div
                v-for="(subComp, sInd) in comp.subComps"
                v-bind:key="'sComp' + sInd"
              >
                <div
                  class="parameterValue componentsParameterValue primaryColor" 
                  style="font-size: 14px"
                >
                <span :class=" subComp[0].length> 80 ? 'componentMake' : ''">{{ subComp[0] }}</span>
                </div>
                <div
                  class="componentsItemValue primaryColor"
                  style="display: inline-block; width: 85px"
                >
                  {{ subComp[1] }} {{ subComp[2] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- right block ends here -->
        <!-- branding part -->

        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- </div> -->
    <!-- components pageDefault ends here -->
    <!-- Monthly Production pageDefault starts here -->

    <div
      class="pageDefault next_page expAnnProPage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('monthly-production')"
    >
      <div class="monthlyProductionSavingsLeftBlock">
        <div class="headings primaryColor" style="width: 100%">
          Expected Annual Production
        </div>
        <div class="subheadings mrgnBtm" style="margin: 8px 0 285px 0">
          During the first year of operations, your system is expected to
          produce {{ convertedWithComaskWh(annualProduction) }} x 1000 kWh.
        </div>
        <div class="subheadings">Expected average generation of the system</div>
        <div
          style="font-size: 15px; margin: 0px 0px 10px"
          class="secondaryColor"
        >
          {{ convertedWithComaskWh(dataFromAPI.system_metrics["Average Monthly Production"]) }}
          kWh/month
        </div>
        <div class="subheadings">Yearly degradation rate</div>
        <div style="font-size: 15px" class="secondaryColor">
          {{ dataFromAPI.system_metrics["Degradation Rate"] }}%/year
        </div>
      </div>

      <div class="monthlyProductionSavingsRightBlock primaryColorBackground">
        <div class="monthlyProductionChartWrapper">
          <div style="height: 90%; width: 100%" class="grphHeight">
            <!-- <canvas id="monthly_prod_chart">
                  <web-proposal-bar-chart-production :productionData="productionData" :productionDataLabels="productionDataLabels" />
                </canvas>          -->
            <div class="graph_area_production" style="height: 100%; width: 100%">
              <!-- <img src="./assets/img/graph21.png" alt="Graph" /> -->
              <div class="unitsWhite">kWh (units)</div>
              <web-proposal-bar-chart-production
                :productionData="productionData"
                :productionDataLabels="productionDataLabels"
                :reportTemplate="reportTemplate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Production pageDefault ends here -->

    <!-- Monthly Savings pageDefault starts here -->

    <div class="pageDefault next_page monthSavPage" :class="isPuppeteer ? 'pagePuppeteer' : ''"  v-if="pagesNew.includes('monthly-savings') && !isThisPageDisabled('monthly-savings')">
      <div class="monthlyProductionSavingsLeftBlock">
        <div class="headings primaryColor" style="width: 100%">
          Monthly Savings
        </div>
        <div class="subheadings mrgnBtm" style="margin: 8px 0 400px 0">
          Estimated savings for each month during the first year.
        </div>
        <div class="subheadings">Expected average monthly savings</div>
        <div style="font-size: 15px; margin: 0 0 10px 0" class="secondaryColor">
          {{ convertedWithComas(dataFromAPI.financial_data.average_monthly_saving) }}
          {{ dataFromAPI.country.currency_code }}/month
        </div>
      </div>

      <div class="monthlyProductionSavingsRightBlock primaryColorBackground">
        <div class="monthlyProductionChartWrapper">
          <div style="height: 90%; width: 100%" class="grphHeight">
            <!-- <canvas id="monthly_savings_chart"></canvas>          -->
            <div class="graph_area_savings">
              <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
              <div class="unitsWhite">
                {{ dataFromAPI.country.currency_code }}
              </div>
              <web-proposal-bar-chart-savings
                :savingsData="savingsData"
                :savingsDataLabels="savingsDataLabels"
                :currencyCode="currencyCode"
                :reportTemplate="reportTemplate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Savings pageDefault ends here -->

    <!-- monthly table starts here -->

    <div
      class="pageDefault next_page monthTblePage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('monthly-table')"
    >
      <div
        class="headings primaryColor"
        style="width: 100%; padding: 0 0 20px 0"
      >
        Monthly Table
      </div>
      <div>
        <table class="monthly_table">
            <thead class="monthly_table_head">
            <tr class="thead-light">
              <th class="primaryColor">Months</th>

              <th class="primaryColor">Direct <br> Irradiance <br> (kWh/m2)</th>

              <th class="primaryColor">Diffused <br> Irradiance <br> (kWh/m2)</th>

              <th class="primaryColor">Effective Irradiance (kWh/m2)</th>

              <th class="primaryColor">DC Energy <br> (kWh)</th>

              <th class="primaryColor">AC Energy <br> (kWh)</th>

              <th class="primaryColor">Specific <br> Generation</th>

              <th class="primaryColor">Performance <br> Ratio</th>
            </tr>
            </thead>
          <tbody class="monthly_table_body">
            <tr
              v-for="(data, index) in monthlyTableData"
              :key="index"
              class="thead-light"
            >
              <td>{{ data[0] }}</td>
              <td>{{ convertedWithComaskWh(data[1]) }}</td>
              <td>{{ convertedWithComaskWh(data[2]) }}</td>
              <td>{{ convertedWithComaskWh(data[3]) }}</td>
              <td>{{ convertedWithComaskWh(data[4]) }}</td>
              <td>{{ convertedWithComaskWh(data[5]) }}</td>
              <td>{{ convertedWithComas(data[6]) }}</td>
              <td>{{ convertedWithComas(data[7]) }}</td>
            </tr>
            
          </tbody>
        </table>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- monthly table ends here -->

    <!-- Field segments starts here -->
    <div id="fs" class="pageDefault next_page fieldSegPage"  :class="isPuppeteer ? 'pagePuppeteer' : ''" v-if="pagesNew.includes('field-segments')">
      <div
        class="headings primaryColor"
        style="width: 100%; padding: 0px 0px 20px; color: rgb(0, 84, 130)"
      >
        Field Segments
      </div>
      <div style="width: 100%" id="field_segment_table">
        <table class="monthly_table">
            <thead class="monthly_table_head">
            <tr class="thead-light">
               <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Name
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Orientation
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">Tilt</th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Azimuth
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Row<br>Spacing
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Frame<br>Size
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">
                Modules
              </th>

              <th class="primaryColor" style="color: rgb(0, 84, 130)">Power</th>
            </tr>
            </thead>
          <tbody class="monthly_table_body">

            <!-- <tr class="thead-light"> -->
            <tr v-for="(data, index) in fieldSegmentsData" :key="index" class="thead-light">
              <td class="secondaryColor">{{data[0] ? data[0] : `Subarray #${index + 1}`}}</td>

              <td class="secondaryColor">{{ data[1] }}</td>

              <td class="secondaryColor">{{ data[2] }}</td>

              <td class="secondaryColor">{{ data[3] }}</td>

              <td class="secondaryColor">{{ data[4] }}</td>

              <td class="secondaryColor">{{ data[5] }}</td>

              <td class="secondaryColor">{{ data[6] }}</td>

              <td class="secondaryColor">{{data[7]}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Shadow Analysis pages start here -->

    <div
      class="pageDefault next_page shadingPage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('shadow-analysis')"
    >
      <div  style="width: 365px; display: inline-block" class="shdAnlImg">
        <div
          class="headings primaryColor"
          style="width: 100%; padding: 0 0 16px 0"
        >
          Shading Analysis
        </div>
        <div class="subheadings" style="font-size: 18px">
          <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
          June 21 |
          {{
            convertTimeTo12HourFormat(
              dataFromAPI.report_defaults_data.shadowAnalysis
                .start_time_shadow_analysis
            )
          }}
        </div>
        <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images 
        || !dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image">
          <img
            :src="
              dataFromAPI.shadow_analysis_images.shadow_summer_start_time_image
            "
            class="reportImages loadingImages"
            v-if="dataFromAPI.shadow_analysis_images !== null"
          />
        </div>
      </div>

      <div class="heatMapShadowAnalysisRightBlock">
        <div class="subheadings" style="font-size: 18px">
          <!-- June 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
          June 21 |
          {{
            convertTimeTo12HourFormat(
              dataFromAPI.report_defaults_data.shadowAnalysis
                .end_time_shadow_analysis
            )
          }}
        </div>
        <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images
        || !dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image">
          <img
            :src="
              dataFromAPI.shadow_analysis_images.shadow_summer_end_time_image
            "
            class="reportImages loadingImages"
            v-if="dataFromAPI.shadow_analysis_images !== null"
          />
        </div>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="pageDefault next_page shadingPage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      style="padding: 32px 32px 0 32px"
      v-if="pagesNew.includes('shadow-analysis')"
    >
      <div style="width: 365px; display: inline-block" class="shdAnlImg">
        <div
          class="headings primaryColor"
          style="width: 100%; padding: 0 0 5px 0"
        >
          Shading Analysis
        </div>
        <div class="subheadings" style="font-size: 18px; width: 250px">
          <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.start_time_shadow_analysis}} HOURS -->
          December 21 |
          {{
            convertTimeTo12HourFormat(
              dataFromAPI.report_defaults_data.shadowAnalysis
                .start_time_shadow_analysis
            )
          }}
        </div>
        <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images
        || !dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image">
          <img
            :src="
              dataFromAPI.shadow_analysis_images.shadow_winter_start_time_image
            "
            class="reportImages loadingImages"
            v-if="dataFromAPI.shadow_analysis_images !== null"
          />
        </div>
      </div>

      <div class="heatMapShadowAnalysisRightBlock imgsWidth">
        <div class="subheadings" style="font-size: 18px; width: 250px">
          <!-- Dec 21 | {{ dataFromAPI.report_defaults_data.shadowAnalysis.end_time_shadow_analysis}} HOURS -->
          December 21 |
          {{
            convertTimeTo12HourFormat(
              dataFromAPI.report_defaults_data.shadowAnalysis
                .end_time_shadow_analysis
            )
          }}
        </div>
        <div class="shadowAnalysisImages" v-loading="!dataFromAPI.shadow_analysis_images
        || !dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image">
          <img
            :src="
              dataFromAPI.shadow_analysis_images.shadow_winter_end_time_image
            "
            class="reportImages loadingImages"
            v-if="dataFromAPI.shadow_analysis_images !== null"
          />
        </div>
      </div>
      <div class="shadowFreeText">
        <span style="font-weight: bold">Summary:</span>
        Modules are shadow free for
        <span style="font-weight: bold"
          >{{
            calcSolarTime(dataFromAPI.system_metrics["Shading Loss"])
          }}%</span
        >
        of solar time throughout the year.
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shadow Analysis pages end here -->
    <!-- Heat Map pageDefault starts here -->

    <div class="pageDefault next_page irradPage" :class="isPuppeteer ? 'pagePuppeteer' : ''"  v-if="pagesNew.includes('heat-map')">
      <div style="width: 365px; display: inline-block" class="shdAnlImg">
        <div class="headings primaryColor" style="width: 100%">
          Irradiance Map
        </div>
        <div class="heatMapImages" v-loading="!dataFromAPI.heat_map">
          <img :src="dataFromAPI.heat_map" class="reportImages loadingImages" />
        </div>
      </div>

      <div class="heatMapShadowAnalysisRightBlock">
        <div class="headings primaryColor" style="width: 100%">
          Solar Access
        </div>
        <div class="heatMapImages" v-loading="!dataFromAPI.solar_access_image">
          <img :src="dataFromAPI.solar_access_image" class="reportImages loadingImages" />
        </div>
      </div>

      <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      


      <!-- Losses pageDefault starts here -->
      
      
      
    </div>

    <!-- Heat Map pageDefault ends here -->

    <!-- Losses pageDefault starts here -->

    <div
      class="pageDefault next_page sysProLossPage primaryColorBackground" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('losses')"
      style="background: #005482"
    >
      <div style="display: inline-block">
        <div class="headings" style="width: 100%; color: #ffffff">
          System Production Losses
        </div>
        <div class="subheadings" style="color: #ffffff">
          Loss in generation predicted due to environmental and electrical
          factors
        </div>
      </div>

      <div class="lossesChartWrapper">
        <!-- <canvas id="system_loss_src_chart"></canvas>           -->
        <div class="graph_box">
          <!-- <img src="./assets/img/graph2.jpg" alt="Graph" /> -->
          <lossBarChart class="lossBarChart" 
                :lossData="convertLossDataFromArrayToGraphFormat(lossData)"
                :reportTemplate="reportTemplate" 
                :updatedData="updatedData" 
                :key="lossesGraphKey"/>
        </div>
      </div>
    </div>

    <!-- Losses pageDefault ends here -->

    <!-- Losses pageDefault starts here -->

    <div
      class="pageDefault next_page costNotSolPage primaryColorBackground" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('bill-with-without-solar') && !isThisPageDisabled('bill-with-without-solar')"
      style="background: #005482"
    >
      <div style="display: inline-block">
        <div class="headings" style="width: 100%; color: #ffffff">
          Cost of Not Going Solar
        </div>
        <div class="subheadings" style="color: #ffffff">
          Your estimated annual electricity bill with and without solar for the
          next 25 years
        </div>
      </div>

      <div class="lossesChartWrapper" style="margin-top: 40px">
        <!-- <canvas id="with_without_solar_chart"></canvas>           -->
        <div style="margin-bottom: 10px; font-size: 15px; margin-left: 20px; color: white;">{{ this.currencyCode }}</div>
        <div class="graph_area_withOrWithoutSolar">
          <!-- <img src="./assets/img/graph1.png" alt="Graph" /> -->
          <web-proposal-multi-bar-chart 
              :estimatedUtilityBillWithSolarData="estimatedUtilityBillWithSolarData2" :estimatedUtilityBillWithoutSolarData="estimatedUtilityBillWithoutSolarData" :estimatedUtilityBillDataLabels="estimatedUtilityBillDataLabels"
              :currencyCode="currencyCode" 
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
              <span class="whiteFont">{{ isBatteryAvailable ? "Bill with Solar & Battery" : "Bill with Solar" }}</span>
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
    </div>

    <!-- Losses pageDefault ends here -->
    <!-- sytem metrics starts here -->

    <div
      class="pageDefault next_page envImpPage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      v-if="pagesNew.includes('environmental-impact')"
    >
      <div style="display: inline-block; height: 100%">
        <div class="headings primaryColor">Environmental Impact</div>
        <div class="subheadings">
          You are contributing to solve Earth's biggest problem - Climate
          Change.
        </div>
      </div>

      <div style="width: 516px; display: inline-block" class="envBox">
        <div
          style="display: flex; gap: 16px; margin: 0px 0 24px 0"
          class="envFlx"
        >
          <div class="performanceBoxes primaryColorBackground">
            <div class="boxParameters">CARBON DIOXIDE OFFSET</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.co2_offset) }}
            </div>
            <div class="metricUnits">metric tons</div>
          </div>

          <div class="performanceBoxes secondaryColorBackground">
            <div class="boxParameters">EQUIVALENT ACRES OF FOREST</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.acres_of_forest) }}
            </div>
            <div class="metricUnits">acres/year</div>
          </div>

          <div
            class="performanceBoxes tertiaryColorBackground"
            style="margin-right: 0px"
          >
            <div class="boxParameters">COAL BURN AVOIDED</div>
            <hr class="alignHorizontal" />
            <div class="metrics">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.coal_burn_avoided) }}
            </div>
            <div class="metricUnits">metric tons</div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
          <div class="leftParameters">
            <div class="parameter primaryColor">
              Equivalent Number of Trees Planted
            </div>
            <div class="parameterValue">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.trees) }} trees
            </div>
          </div>

          <div class="rightParameters">
            <div class="parameter primaryColor">
              Petrol Consumption Avoided
            </div>
            <div class="parameterValue">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.gasoline_consumed) }} litres
            </div>
          </div>

          <div class="leftParameters">
            <div class="parameter primaryColor">Equivalent Kilometers Driven</div>
            <div class="parameterValue">
              {{ convertedWithComaskWh(dataFromAPI.green_impact_data.kilometers_driven) }} kms
            </div>
          </div>
        </div>


        <div class="footerDiv" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    <div id="faqMain" v-show="pagesNew.includes('frequently-asked-questions') && faqData.length">
      <div
        class="pageDefault next_page sysMetricsPage"
        style="flex-direction: column;"
        :class="isPuppeteer ? 'pagePuppeteer' : ''"
      >
        <div style=" display: inline-block" id="headerIdFAQ">
          <div class="headings primaryColor">Frequently Asked Questions</div>
          <div class="subheadings"></div>
        </div>

        <div style="width: auto; display: inline-block">
          <div class="allFaqs" id="allFAQs">
              <div class="quesContFAQ" v-for="(faq, index) in faqData" :key="index">
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
          <div class="footerDiv" id="footerId">
          <div>
            <hr
              style="
                border: 1px solid #d1d1d1;
                width: 100%;
                margin: auto;
                margin-bottom: 12px;
              "
            />
            <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
              <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
            </div>
            <div
              style="display: inline-block; padding-left: 4px"
              class="footerCompanyName"
            >
              {{ organisationName }}
            </div>
            <div class="brandingFooter">
              <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
              Generated on {{ dateAndTime }}
            </div>
          </div>

          <!-- company Logo -->
          <div class="organisationLogoandDetailsWrapper">
            <div>
              <div class="companyDetails">
                <div v-if="dataFromAPI.organisation_data.email_id">
                  {{ dataFromAPI.organisation_data.email_id }}
                </div>

                <div v-if="dataFromAPI.organisation_data.phone">
                  {{ dataFromAPI.organisation_data.phone }}
                </div>

                <div v-if="dataFromAPI.organisation_data.website">
                  {{ dataFromAPI.organisation_data.website }}
                </div>
              </div>
            </div>
            <div style="max-height: 55px; max-width: 200px; object-fit: contain">
              <!-- company Logo -->

              <div id="companyLogo" style="height: 100%">
                <img
                  style="max-height: 40px; max-width: 100px"
                  :src="dataFromAPI.organisation_data.logo"
                  alt=""
                  class="fPageFLogo"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
    <!-- green pageDefault ends here -->

    <div
      class="pageDefault next_page thankyouPage" :class="isPuppeteer ? 'pagePuppeteer' : ''" 
      style="display: flex"
      v-if="pagesNew.includes('thank-you')"
    >
      <div style="display: flex; width: 100%" class="thankYouFlex">
        <div style="width: 50%; height: 400px" class="thnkUWidth">
          <div class="leftBlockThank" v-if="dataFromAPI.organisation_data.logo">
            <img
              style="max-width: 350px; max-height: 350px"
              :src="dataFromAPI.organisation_data.logo"
              class="thnkuLogo"
            />
          </div>
        </div>
        <div style="width: 50%" class="thnkUWidth">
          <div class="rightBlockThank">
            <div class="headings primaryColor thnku" style="width: auto">
              Thank you
            </div>
            <div
              class="orgNameThankPage secondaryColor"
              v-if="dataFromAPI?.organisation_data?.name"
            >
              {{ dataFromAPI.organisation_data.name }}
            </div>
            <div
              class="thankPageContact"
              v-if="dataFromAPI.organisation_data.email_id"
            >
              {{ dataFromAPI.organisation_data.email_id }}
            </div>
            <div
              class="thankPageContact"
              v-if="dataFromAPI.organisation_data.phone"
            >
              {{ dataFromAPI.organisation_data.phone }}
            </div>
            <div
              class="thankPageContact"
              v-if="dataFromAPI.organisation_data.website"
            >
              {{ dataFromAPI.organisation_data.website }}
            </div>
            <!-- <a href="http://None" style="color: #303030; text-decoration: none">
              <div class="thankPageContact">None</div>
            </a> -->
          </div>
        </div>
      </div>

      <div class="footerDiv thnkUFooter" id="footer">
        <div>
          <hr
            style="
              border: 1px solid #d1d1d1;
              width: 100%;
              margin: auto;
              margin-bottom: 12px;
            "
          />
          <div style="max-width: 30px; max-height: 13.3px; display: inline-block">
            <img :src="arkaEnergyLogoMark" style="max-width: 30px; max-height: 13.3px;" alt=""/>
          </div>
          <div
            style="display: inline-block; padding-left: 4px"
            class="footerCompanyName"
          >
            {{ organisationName }}
          </div>
          <div class="brandingFooter">
            <!-- Generated on 22 Aug, 2022 | 03:25 PM -->
            Generated on {{ dateAndTime }}
          </div>
        </div>

        <!-- company Logo -->
        <div class="organisationLogoandDetailsWrapper">
          <div>
            <div class="companyDetails">
              <div v-if="dataFromAPI.organisation_data.email_id">
                {{ dataFromAPI.organisation_data.email_id }}
              </div>

              <div v-if="dataFromAPI.organisation_data.phone">
                {{ dataFromAPI.organisation_data.phone }}
              </div>

              <div v-if="dataFromAPI.organisation_data.website">
                {{ dataFromAPI.organisation_data.website }}
              </div>
            </div>
          </div>
          <div style="max-height: 55px; max-width: 200px; object-fit: contain">
            <!-- company Logo -->

            <div id="companyLogo" style="height: 100%">
              <img
                style="max-height: 40px; max-width: 100px"
                :src="dataFromAPI.organisation_data.logo"
                alt=""
                class="fPageFLogo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

// import webProposalBarChartSavings from "../../../components/ui/charts/reportDefault/webProposalBarChartSavings.vue";
import webProposalBarChartSavings from "../../../components/ui/charts/commonCharts/webProposalBarChartSavings.vue";
// import webProposalBarChartProduction from "../../../components/ui/charts/reportDefault/webProposalBarChartProduction.vue";
import webProposalBarChartProduction from "../../../components/ui/charts/commonCharts/webProposalBarChartProduction.vue";
import webProposalMultiBarChart from "../../../components/ui/charts/commonCharts/webProposalMultiBarChart.vue";
// import lossBarChartOld from "../../../components/ui/charts/commonCharts/lossAnalysisChart.vue";
import lossBarChart from "../../../components/ui/lossAnalysisChart.vue";
import modifyComponentData from "../js/modifyComponentData.js";
import webProposalBarChartEstimatedSavings from "../../../components/ui/charts/commonCharts/webProposalBarChartEstimatedSavings.vue";
import { formatDateForReport } from "@/pages/utils/utils.js"
import currencySymbolNameMap from '../../currency-symbol-name-map';
import { formatNumberWithCommas, convertLossDataFromArrayToGraphFormat } from '@/utils.js'
import solarLabsLogoMark from '../../../assets/drop/reportOneIcon.png';
import { fetchArkaEnergyLogo, convertTimeTo12HourFormat } from "../../utils/utils"
import batterySavingAnalysisChart from "../../../components/ui/charts/commonCharts/batterySavingAnalysisChart.vue";
import {
  getCurrencySymbol,
  getFormattedCurrencyComas,
} from "../../../utils/numberFormat/currencyFormatter";

export default {
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
      type: Object,
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
    webProposalBarChartSavings,
    webProposalBarChartProduction,
    webProposalMultiBarChart,
    // lossBarChartOld,
    lossBarChart,
    webProposalBarChartEstimatedSavings,
    batterySavingAnalysisChart,
  },
  nonReactiveData() {
    return {
        currencySymbolNameMap,
    }
  },
  watch:{
    updatedData:{
      handler(val){
        this.estSavingGraphKey++;
        this.lossesGraphKey++
        this.notGoingSolarkey++;
        this.updateReportParameters(); 
      }
    },
  },


  data(){
        return {
          organisationName: "Arka 360",
          solarLabsLogoMark: solarLabsLogoMark,
          arkaEnergyLogoMark:'https://spotlightdocuments.blob.core.windows.net/documents/Arka%20Logomark%20-%20Black.png?sp=r&st=2023-03-09T12:04:36Z&se=2025-10-02T20:04:36Z&spr=https&sv=2021-12-02&sr=b&sig=aobZNPIAgkoLhpsEfebc%2BYHjtJ7ZbbU5HK8XGd4bt2Q%3D',
          arkaEnergyLogo: fetchArkaEnergyLogo(),
          solarLabsLogo: 'https://front-end-assests.s3-us-west-2.amazonaws.com/tsl_logo.png',  
          savingsDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          productionDataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          estimatedUtilityBillDataLabels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          savingsDataLabelsYearly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          currencyCode: this.dataFromAPI.country.currency_code,
          reportTemplate: 'reportDefault',
          estSavingGraphKey: 0,
          lossesGraphKey: 0,
          notGoingSolarkey: 0,
          referenceId : this.dataFromAPI.reference_id,
          taxType: 'Tax',
          countryCode: this.$props.dataFromAPI.country.currency_code,
        };
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
      return this.countryCode
        ? getFormattedCurrencyComas(this.countryCode, amount)
        : "";
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
    isThisPageDisabled(pageDefault){
      if(['savings','monthly-savings','bill-with-without-solar'].includes(pageDefault) && 
      (!this.dataFromAPI['financial_data'] || !this.dataFromAPI['financial_data']['payback']))
      return true;
      else 
      return false;
    },
    updateReportParameters(){
        document.documentElement.style.setProperty('--primary', `${this.updatedData.custom_color.primary_color}`);
        document.documentElement.style.setProperty('--secondary', `${this.updatedData.custom_color.secondary_color}`);
        document.documentElement.style.setProperty('--tertiary',  `${this.updatedData.custom_color.tertiary_color}`);
    },
    reportDefaultScriptHandler(Puppeteer) {
    var isComponentPageAdjusted = false;
    var pageNumber = 2;
    var secPageNumber = 2;
    var primary_color = this.updatedData.custom_color.primary_color;
    function cloneIt(sectionName, sectionClass, secHeaderId, pageName, containerClass, wrapperId, wrapperClass, isPuppet, isBatteryChart = false) {
    // Cloning the entire div and adding the section class to it
    let cloneIt = document.createElement("div");
    cloneIt.classList.add("pageDefault");
    cloneIt.classList.add("next_page");
    cloneIt.classList.add('sysMetricsPage');

    if(isPuppet){
        cloneIt.classList.add('pagePuppeteer');
    }
    cloneIt.id = sectionName + "cloneIt" + secPageNumber;

    // Creating header clone and appending it
    let header = null;
    if(sectionName == 'faq'){
      header = document.getElementById("headerIdFAQ");
    } else if (sectionName == 'ourTeam') {
      header = document.getElementById("headerIdOT"); 
    } else if (sectionName == 'companyOverviews') {
        header = document.getElementById("headerIdCO");
    } else if (sectionName == 'sysPricing') {
        header = document.getElementById("headerIdPricing");
    } else {
      header = document.getElementById("headerIdBattery");
    }

    let headerClone = header.cloneNode(true);
    headerClone.id = sectionName + "cloneIt" + secPageNumber;
    cloneIt.appendChild(headerClone);

    if(isBatteryChart){
      cloneIt.style.backgroundColor = primary_color;
      headerClone.children[0].setAttribute('style', 'color:#fff !important');
    }

    // Creating heading clone for OUR TEAM
    let contentClone = document.createElement("div");
    contentClone.id = sectionName + "contentClone" + secPageNumber;
    cloneIt.appendChild(contentClone);
    if(sectionName == 'sysPricing')
      contentClone.style.width = '100%';

    // Creating footer clone and appending it
    if(!isBatteryChart){
      let footer = document.getElementById("footerId");
      let footerClone = footer.cloneNode(true);
      footerClone.id = sectionName + "footerClone" + secPageNumber;
      cloneIt.appendChild(footerClone);
    }
    if (sectionName == 'faq') {
        let faqMain = document.getElementById("faqMain");
        faqMain.appendChild(cloneIt);
    } else if (sectionName == 'batteryStorage') {
          let batteryMain = document.getElementById("batteryMain");
          batteryMain.appendChild(cloneIt);  
    } else if (sectionName == 'companyOverviews') {
          let companyOverviewMain = document.getElementById("companyOverviewMain");
          companyOverviewMain.appendChild(cloneIt);  
      } else if (sectionName == 'sysPricing') {
          let systemPricingMain = document.getElementById("systemPricingMain");
          systemPricingMain .appendChild(cloneIt);  
      } else{
      let ourTeamMain = document.getElementById("ourTeamMain");
      ourTeamMain.appendChild(cloneIt);
    }

    // Now we have cloneIt, contentClone, headerClone, secHeaderClone, footerClone and cloneIt is the whole clone which we made so far..
    // Lets add the Team members dynamically


    // // Now we append the pageDefault next to the previous Our Team pageDefault or FAQ pageDefault based on this check
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
    secPageNumber++;
    return cloneIt;
    }

    function cloneSystemDetails() {
      let availableHeight = 383;
      let ceo = document.getElementsByClassName("allAddons");
      let ceo1 = document.getElementsByClassName("allDiscounts");
      let noOfCEOs = ceo[0].childElementCount;
      let noOfCEOs1 = ceo1[0].childElementCount;
      let elsePart = document.getElementById("elsePart")
      let i = 0;
      let j = 0;
      let halfed = true;
      while (noOfCEOs || noOfCEOs1) {
        if (secPageNumber == 2) {
          while (
            ceo[0].children[i] &&
            availableHeight >= ceo[0].children[i].clientHeight
          ) {
            availableHeight -= ceo[0].children[i].clientHeight;
            i++;
            noOfCEOs--;
          }
          secPageNumber++;
        } else {
          if (noOfCEOs) {
            availableHeight = 430;
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
            var newPage = secPageNumber-1;
            let idName = "sysPricingcontentClone" + newPage;
            let newTableBody = document.getElementById(idName);
            let addonHeading = document.getElementById("addonHeading");
            let addonHeadingClone = addonHeading.cloneNode(true);
            addonHeadingClone.id = "addonHeading"+newPage;
            addonHeadingClone.removeChild(addonHeadingClone.childNodes[1]);
            newTableBody.appendChild(addonHeadingClone);
            availableHeight-=40;
            console.log(idName);
            while (
              ceo[0].children[i] &&
              availableHeight >= ceo[0].children[i].clientHeight
            ) {
              availableHeight -= ceo[0].children[i].clientHeight;
              newTableBody.appendChild(ceo[0].children[i]);
              noOfCEOs--;
            }
            if(!noOfCEOs1) {
              let sysOrientation = document.getElementById("discountFullId");
              newTableBody.appendChild(sysOrientation);
              availableHeight -= 40;
            }
          } else {
            if (availableHeight > 40) {
              halfed = false;
              if (newClone) {
                let newPage2 = secPageNumber-1;
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
                availableHeight = 380;
                var newClone = cloneIt(
                  "sysPricing",
                  "systemPricing_section",
                  "secHeaderSDSId",
                  "sysPricing",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );
                let newPage = secPageNumber-1;
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
                availableHeight = 430;
                var newClone = cloneIt(
                  "sysPricing",
                  "systemPricing_section",
                  "secHeaderSDSId",
                  "sysPricing",
                  "tableContainerSDS",
                  "sysDetails",
                  "sysDetailsId"
                );            
                newPage = secPageNumber-1;
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
      if(availableHeight<140) {
        var newClone = cloneIt(
          "sysPricing",
          "systemPricing_section",
          "secHeaderSDSId",
          "sysPricing",
          "tableContainerSDS",
          "sysDetails",
          "sysDetailsId"
        );         
        let newPage = secPageNumber - 1;
        let idName = "sysPricingcontentClone" + newPage;
        let newTableBody = document.getElementById(idName);
        newTableBody.appendChild(elsePart);
      } else {
        let newPage1 = secPageNumber-1;
        let idName1 = "sysPricingcontentClone" + newPage;
        let idName2 = "sysPricingcontentClone" + newPage1;
        let newTableBody = document.getElementById(idName1) ? document.getElementById(idName1) : document.getElementById(idName2);
        if(newTableBody){
        newTableBody.appendChild(elsePart);
        }
      }
      secPageNumber = 2;
    }

    function cloneCallCompanyOverview(wrapperId, wrapperClass, isPuppet) {
          let availableHeight = 200;
          let ceo = document.getElementsByClassName(wrapperClass);
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
          while (noOfCEOs) {
              if (secPageNumber == 2) {
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      i++;
                      noOfCEOs--;
                  }
                  secPageNumber++;
              }
              else {
                  availableHeight = 400;
                  let newClone = cloneIt("companyOverviews", "companyOverview_section", "companyOverviewHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet);
                  let newPage = secPageNumber - 1;
                  let eleId = "companyOverviewscontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  newCloneProp.classList.add("imgContainerCODefault");
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }
          secPageNumber = 2;
    }


    function cloneCallOT(wrapperId, wrapperClass, report_type, isPuppet) {
          let availableHeight = 413;
          if(report_type.trim()==='portrait'){
            availableHeight=658;
          }

          let ceo = document.getElementsByClassName(wrapperClass);
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
          while (noOfCEOs) {
              if (secPageNumber == 2) {
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      i++;
                      noOfCEOs--;
                  }
                  secPageNumber++;
              }
              else {
                  availableHeight = 413;
                  if(report_type.trim()==='portrait'){
                    availableHeight=658;
                  }
                  let newClone = null;
                  if (wrapperClass === 'allFaqs') {
                      newClone = cloneIt("faq", "FAQ_section", "secHeaderFAQId", "faq", "quesContainerFAQ", wrapperId, wrapperClass, isPuppet);
                  }
                  else {
                      newClone = cloneIt("ourTeam", "ourTeam_section", "secHeaderOTId", "ourTeam", "ourTeamContainerOT", wrapperId, wrapperClass, isPuppet);
                  }
                  let newPage = secPageNumber - 1;
                  let eleId = "ourTeamcontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }
          secPageNumber = 2;
    }


    
    function cloneBatteryStorage(isPuppet, isBillWithSolar) {
        let availableHeight = 165;
        let chartPage = secPageNumber;
        let beforeChart = false;
        let ceo = document.getElementsByClassName("allBatteryValues");
        let noOfCEOs = ceo[0].childElementCount;
        let i = 0;
        while (noOfCEOs) {
            if (secPageNumber == 2) {
                while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                    availableHeight -= ceo[0].children[i].clientHeight;
                    i++;
                    noOfCEOs--;
                }
                secPageNumber++;
            }
            else {
                var newPage = secPageNumber;
                if (noOfCEOs) {
                    availableHeight = 340;
                    var newClone = null;
                    newClone = cloneIt("batteryStorage", "batteryStorage_section", "batteryHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet);
                    let newComponentTable = document.createElement("table");
                    newComponentTable.id = "customersSDS2" + newPage;
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
         
         if(availableHeight<310){
          let cloneForChart = cloneIt("batteryStorage", "batteryStorage_section", "batteryHeaderSDSId", "sysDetails", "tableContainerBattery", "sysDetails", "sysDetailsId", isPuppet, true);
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
         secPageNumber = 2;
     }


    function cloneCallFAQ(wrapperId, wrapperClass, report_type, isPuppet) {
          let availableHeight = 390;
          if(report_type.trim()==='portrait'){
            availableHeight=658;
          }
          let ceo = document.getElementsByClassName(wrapperClass);
          if(ceo[0])
          {
          let noOfCEOs = ceo[0].childElementCount;
          let i = 0;
          while (noOfCEOs) {
              if (secPageNumber == 2) {
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      i++;
                      noOfCEOs--;
                  }
                  secPageNumber++;
              }
              else {
                  let availableHeight = 390;
                  if(report_type.trim()==='portrait'){
                    availableHeight=658;
                  }
                  let newClone = null;
                  if (wrapperClass === 'allFaqs') {
                      newClone = cloneIt("faq", "FAQ_section", "secHeaderFAQId", "faq", "quesContainerFAQ", wrapperId, wrapperClass, isPuppet);
                  }
                  else {
                      newClone = cloneIt("ourTeam", "ourTeam_section", "secHeaderOTId", "ourTeam", "ourTeamContainerOT", wrapperId, wrapperClass, isPuppet);
                  }
                  let newPage = secPageNumber - 1;
                  let eleId = "faqcontentClone" + newPage;
                  let newCloneProp = document.getElementById(eleId);
                  while (ceo[0].children[i] && availableHeight >= ceo[0].children[i].clientHeight) {
                      availableHeight -= ceo[0].children[i].clientHeight;
                      newCloneProp.appendChild(ceo[0].children[i]);
                      noOfCEOs--;
                  }
              }
          }
          secPageNumber = 2;
          }
      }
    function adjustComponentsPage(pageNumber) {
      let componentsRightBlock;
      if (pageNumber == 2) {
        componentsRightBlock = document.getElementById("componentsRightBlock");
      } else {
        let rightBlock = "rightBlockPage" + (pageNumber - 1);
        componentsRightBlock = document.getElementById(rightBlock);
      }
      if (componentsRightBlock !== null) {
        let componentsRightBlockChildren = componentsRightBlock.children;
        // determined by taking total pageDefault height - footerdiv - padding/margin
        let availableHeight = 460;
        if (componentsRightBlock.clientHeight >= availableHeight) {
          let componentsPageMain =
            document.getElementById("componentsPageMain");
          let leftBlockPage = "leftBlockPage" + pageNumber;
          let leftBlockPage2 = document
            .getElementById("componentsLeftBlock")
            .cloneNode(true);
          leftBlockPage2.id = leftBlockPage;
          let rightBlockPage = "rightBlockPage" + pageNumber;
          let rightBlockPage2 = document.createElement("div");
          rightBlockPage2.id = rightBlockPage;
          rightBlockPage2.classList.add("rightBlockPadding");
          rightBlockPage2.classList.add("componentsRightBlockClass");
          let footerClone = "";
          if (document.getElementById("footer")) {
            footerClone = document.getElementById("footer").cloneNode(true);
          }
          let organisationLogoWrapperNext = document.createElement("div");
          organisationLogoWrapperNext.id = "organisationLogoWrapperNext";
          organisationLogoWrapperNext.classList.add("organisationLogoWrapper");
          let companyLogoCLone = "";
          if (document.getElementById("companyLogo")) {
            companyLogoCLone = document
              .getElementById("companyLogo")
              .cloneNode(true);
          }
          let componentsPage = "componentsPage" + pageNumber;
          let componentsPage2 = document.createElement("div");
          componentsPage2.id = componentsPage;
          let componentsRightBlockChildrenBottomMargin = parseInt(
            componentsRightBlockChildren[0].style.marginBottom
          );
          for (let i = 0; i < componentsRightBlockChildren.length; i++) {
            if (
              componentsRightBlockChildren[i].clientHeight +
                componentsRightBlockChildrenBottomMargin <
              availableHeight
            ) {
              availableHeight =
                availableHeight -
                componentsRightBlockChildren[i].clientHeight -
                (componentsRightBlockChildrenBottomMargin + 1);
            } else {
              componentsPage2.appendChild(leftBlockPage2);
              componentsPage2.appendChild(rightBlockPage2);
              let unfittedDivs = componentsRightBlockChildren.length - i;
              for (let j = unfittedDivs; j > 0; j--) {
                rightBlockPage2.appendChild(
                  componentsRightBlockChildren[
                    componentsRightBlockChildren.length - j
                  ]
                );
              }
            }
          }
          if (componentsPage2.childElementCount == 2) {
            componentsPageMain.appendChild(componentsPage2);
            if (document.getElementById("footer")) {
              componentsPage2.appendChild(footerClone);
            }
            if (document.getElementById("companyLogo")) {
              organisationLogoWrapperNext.appendChild(companyLogoCLone);
            }
           // componentsPage2.appendChild(organisationLogoWrapperNext);
            componentsPage2.classList.add("pageDefault", "flexComponents");
            if(Puppeteer){
              componentsPage2.classList.add("pagePuppeteer");
            }
            componentsPage2.classList.add("componentsPage");
            componentsPage2.classList.add("pageDefault");
            // console.log(this.$route.name);
          }
        } else {
          isComponentPageAdjusted = true;
        }
      } else {
        isComponentPageAdjusted = true;
      }
    }

    function isOverflown(element) {
      return (
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth
      );
    }

    function adjustProjectNameDiv() {
      let project_description_div =
        document.getElementById("projectDescription");
      if (project_description_div !== null) {
        let is_project_description_overflown = isOverflown(
          project_description_div
        );
        if (is_project_description_overflown) {
          document.getElementById("projectName").style.fontSize = "36px";
          document.getElementById("projectAddress").style.fontSize = "20px";
          document.getElementById("dcSize").style.fontSize = "26px";
          document.getElementById("latlong").style.fontSize = "20px";
          document.getElementById("clientName").style.fontSize = "20px";
        }
      }
    }

  function modifyOriginalFieldSegment() {
    let tableData = originalFsNode.getElementsByTagName('tbody')[0];
    // setting all null, excluding first 12, which should be displayed on first pageDefault(original pageDefault)
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

    function duplicateConditionSetPage(originalConditionSetNode) {
      var cloneConditionSetPage = originalConditionSetNode.cloneNode(true); // "deep" clone
      cloneConditionSetPage.id = "conditionsSets 1";
      // setting display property of divs not required on this pageDefault
      cloneConditionSetPage.querySelector(
        ".conditionSetTempWeather"
      ).style.display = "none";
      cloneConditionSetPage.querySelector(
        ".conditionSetSoiling"
      ).style.display = "none";
      // inserting the new node to the DOM right after the current node
      originalConditionSetNode.parentNode.insertBefore(
        cloneConditionSetPage,
        originalConditionSetNode.nextSibling
      );
    }
    if(this.pagesNew.includes('field-segments')){
      var originalFsNode = document.getElementById('fs');
      var currNode = originalFsNode;
      var numberOfRowsPerPage = 13;
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
      adjustProjectNameDiv();
      if(this.pagesNew.includes('components')){
        while (!isComponentPageAdjusted) {
        adjustComponentsPage(pageNumber);
        pageNumber++;
        }
      }
      var report_type = this.updatedData.report_type; 
      var isPuppet = this.isPuppeteer;
      var isBillWithSolar = !this.dataFromAPI['financial_data'] || !this.dataFromAPI['financial_data']['payback'];
      cloneCallCompanyOverview("companyOverviews", "imgContainerCODefault", isPuppet);
      if(this.isBatteryAvailable) {
        cloneBatteryStorage(isPuppet, !isBillWithSolar);
      }
      cloneCallOT("allCEOs", "allCeos", report_type, isPuppet);
      cloneCallFAQ("allFAQs", "allFaqs", report_type, isPuppet);
      if(this.pagesNew.includes('system-pricing')) {
        cloneSystemDetails();
      }
      this.updateReportParameters();
  },



    calcSolarTime(shadingLoss) {
      let absLoss = Math.abs(shadingLoss)
      return 100 - absLoss;
    },

    convertTimeTo12HourFormat,
  },

  computed: {

    handleCurrencySymbol() {
      return this.countryCode ? getCurrencySymbol(this.countryCode) : "";
    },

    addersData(){
      let addersDataArray = [];
      for(let i=0;i<this.dataFromAPI.adders_and_discounts.length;i++){
        if(this.dataFromAPI.adders_and_discounts[i].adders_discounts__type === 'adder' && this.dataFromAPI.adders_and_discounts[i].adders_discounts__is_homeowner_facing === true) {
          addersDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return addersDataArray;
    },

    discountsData(){
      let discountsDataArray = [];
      for(let i=0;i<this.dataFromAPI.adders_and_discounts.length;i++){
        if(this.dataFromAPI.adders_and_discounts[i].adders_discounts__type === 'discount' && this.dataFromAPI.adders_and_discounts[i].adders_discounts__is_homeowner_facing === true) {
          discountsDataArray.push(this.dataFromAPI.adders_and_discounts[i]);
        }
      }
      return discountsDataArray;
    },

    additionalSavingsPostBattery() {
      if(this.dataFromAPI.financial_data){
        return parseFloat(this.dataFromAPI.financial_data.additional_savings_post_battery).toFixed(2);
      } else {
        return null;
      }
    },

    clientNameComputed(){
      return this.dataFromAPI.project_head.client_name || this.dataFromAPI.project_head.name;
    },

    batteryData(){
      return this.dataFromAPI.battery_data;  
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
      let final = data.split("-");
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
      let final = data.split(",");
      let acNameplate = final[0];
      return acNameplate;
    },

    loadRatio() {
      let data = this.dataFromAPI.system_metrics["AC Nameplate"];
      let final = data.split(",");
      let loadRatio = final[1].split(":")[1].trim();
      return loadRatio;
    },

    savingsData() {
      return this.dataFromAPI.financial_data.monthly_saving;
    },

    productionData() {
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      mainArray.pop();
      let finalArray = [];
      for (let item in mainArray) {
        finalArray.push(mainArray[item][5]);
      }

      let lastArray = finalArray.map((str) => {
        return parseFloat(str.replace(/,/g, ''));
      });
      return lastArray;
    },

    monthlyTableData() {
      let mainArray = [...this.dataFromAPI.monthly_table.values];
      return mainArray;
    },

    fieldSegmentsData() {
      let mainArray = this.dataFromAPI.field_segments.values;
      return mainArray;
    },

    estimatedUtilityBillWithSolarData() {
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    estimatedUtilityBillWithSolarData2() {
      if(this.isBatteryAvailable) {
       return this.dataFromAPI.financial_data?.residual_energy_post_battery_bill;
      }
      return this.dataFromAPI.financial_data?.bill_with_solar;
    },

    estimatedUtilityBillWithoutSolarData() {
      return this.dataFromAPI.financial_data?.bill_without_solar;
    },

    residualEnergyPostBatteryBill() {
      return this.dataFromAPI.financial_data?.residual_energy_post_battery_bill;
    },

    additionalSavingsPostBattery() {
      if(this.dataFromAPI.financial_data){
        return parseFloat(this.dataFromAPI.financial_data.additional_savings_post_battery).toFixed(2);
      } else {
        return null;
      }
    },

    lossData() {
      return this.dataFromAPI.chart_data.system_loss_src;
    },

    modifiedComponentData() {
      return modifyComponentData(this.dataFromAPI, "reportDefault");
    },

    savingsDataYearly() {
      // return this.dataFromAPI.financial_data.monthly_saving;
      // return this.dataFromAPI.financial_data.savings;
      return this.dataFromAPI.financial_data?.cumulative_savings;
    },
  },

  mounted(){
    let Puppeteer = false;
    if(this.$route.name === 'documentProposalPuppeteer')
    Puppeteer = true;
    this.reportDefaultScriptHandler(Puppeteer);
    this.countryCode= this.$props.dataFromAPI.country.currency_code;
    const user = JSON.parse(localStorage.getItem("user")) || {};
    if(user.country === 91) this.taxType = 'GST'
  }
}

</script>

<style scoped>
#reportDefault {
  max-width: 842px;
  margin: 0 auto;
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

/* #horizontalbar-chart {
  height: 600px;
  background: yellow;
} */

/* canvas.estimatedSavings {
  max-height: 180px;
  max-width: 500px;
} */

.estimatedSavingsDiv {
  /* display: block !important;
    height: 180px !important;
    width: 500px !important; */
  height: 180px;
}

/* .yUnit {
  position: absolute;
  top: 0px;
  left: 37px;
} */

/* .estimatedSavingsDiv #bar-chart {
    display: block !important;
    height: 180px !important;
    width: 500px !important;
} */

.unitsWhite {
  color: white;
  text-align: center;
  margin-bottom: 10px;
}

/* #estimated_savings_chart {
  background: yellow;
} */

@page {
  size: auto;
}

@media print {
  .next_page {
    -webkit-column-break-before: always;
    break-before: always;
  }

  /*  .table th {
    font-family: segoe-regular;
    font-weight: 500;
    color: #6d6d6d !important;
    background-color: #f8dfb6 !important;
  }*/

  /*  .image_container img {
    width: 100%;
 
  }*/
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
  color: var(--primary) !important;
}

.secondaryColor{
  color: var(--secondary) !important;
}

.tertiaryColor{
  color: var(--tertiary) !important;
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

.table .thead-light th {
  color: #005482;
}

.table-sm th {
  color: #005482;
}

.pageDefault {
  width: 842px;
  height: 595px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 32px 32px 0 32px;
  position: relative;
  overflow-y: visible;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
}
.pagePuppeteer {
  margin-bottom: 0px !important;
  flex-direction: row !important;
}
.headings {
  font-size: 31px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  display: block;
  padding-bottom: 3px;
  width: 100%;
}

.subheadings {
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #515151;
  width: 210px;
  margin-top: 8px;
}

.performanceBoxes {
  width: 161px;
  height: 200px;
  border-radius: 3.7px;
  font-size: 12px;
  padding: 42px 0 0 0;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-family: "Helvetica Neue";
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  display: inline-block;
}

.performanceBoxesSavings {
  width: 160px;
  height: 150px;
  border-radius: 3.7px;
  font-size: 12px;
  padding: 22px 0 0 0;
  text-align: center;
  box-sizing: border-box;
  font-family: "Helvetica Neue";
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  display: inline-block;
}

.conditionSetParametersValue {
  min-height: 50px;
  margin: 0 0 20px 0;
  word-wrap: break-word;
}

.componentsParameter {
  display: inline-block;
  margin: 8px 0 0 8px;
  line-height: 25px;
}

.componentsParameterValue {
  line-height: 1.37;
  display: inline-block;
  width: 359px;
  margin-left: 36px;
}

.componentMake{
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

}

.metrics {
  font-size: 28px;
  font-weight: bold;
  padding: 12px 8px 6px 8px;
}

.savings_metrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 49px;
  font-size: 23px;
  font-weight: bold;
}

.monthlyProductionSavingsLeftBlock {
  display: inline-block;
  width: 40%;
  padding: 32px 0 0 32px;
}

.monthlyProductionSavingsRightBlock {
  display: inline-block;
  width: 60%;
  margin: 0 0 0 0px;
}
.monthlyProductionChartWrapper {
  padding: 0 55px 0 40px;
  height: 100%;
  width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.graph_area_production {
  height: 100%;
}

.graph_area_savings {
  height: 100%;
}

.parameter {
  font-size: 12px;
  font-weight: bold;
  opacity: 0.8;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  margin-bottom: 7px;
}

.lossesChartWrapper {
  display: inline-block;
  /* width: 560px; */
}

.lossesChartWrapper .graph_box {
  /* height: 80%; */
  height: 90%;
}

.lossBarChart {
  height: 100%;
  /* height: 500px; */
  width: 560px;
}

.lossesChartWrapper .graph_area_withOrWithoutSolar {
  height: 100%;
}

.heatMapImages {
  margin: 12px 0 0 0;
  height: 345px;
  width: 100%;
}

.shadowAnalysisImages {
  margin: 12px 0 0 0;
  height: 345px;
  width: 100%;
}

.parameterValue {
  padding-left: 0;
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #303030;
  word-break: break-word;
}

.componentBoxes {
  width: 29.3px;
  height: 28.8px;
  border-radius: 3.7px;
  color: #ffffff;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: inline-block;
  overflow: hidden;
  text-align: center;
  line-height: 25px;
  position: relative;
}

.table .thead-light th {
  border: none;
  background-color: transparent;
  max-width: 80px;
  padding-bottom: 7px;
}

.table-sm td,
.table-sm th {
  padding-left: 0;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
}

.table-sm th {
  font-size: 12px;
  opacity: 0.8;
  font-weight: bold;
}

.table-sm td {
  font-size: 14px;
  font-family: "Helvetica Neue";
  color: #303030;
}

.monthlyRow {
  height: 35px;
}

.componentsItemValue {
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.54;
  letter-spacing: normal;
  text-align: right;
  color: #194a91;
}

.table td,
.table th {
  border: none;
}

.metricUnits {
  height: 14px;
  font-family: "Helvetica Neue";
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  padding-right: 0px;
}

.firstPageAddress {
  font-size: 24px;
  font-weight: 300 !important;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
}

hr {
  /*color: white;*/
  border-top: 1px solid white;
}

.table {
  padding-left: 10px;
  width: 100%;
}

.brandingFooter {
  opacity: 0.5;
  font-size: 10px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #515151;
  margin-top: 5px;
}

.brandingFooterColored {
  opacity: 0.5;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #fcfcfc;
  margin-top: 5px;
}

.footerCompanyName {
  opacity: 0.5;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #05154c;
}

.subscriptMonthYear {
  font-size: 12px;
  padding: 0 3px;
}

.footerColoredCompanyName {
  opacity: 0.5;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #fcfcfc;
}
.view3DModelViaImage{
  cursor: pointer;
}

.view3DModel {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.21;
  letter-spacing: normal;
  text-decoration: underline;
  cursor: pointer;
}

.flexComponents {
  display: flex;
}

.nameBottomPosition {
  position: absolute;
  bottom: 85px;
  overflow-wrap: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    display: -webkit-box;
}

.leftParameters {
  display: inline-block;
  width: 31%;
  /* margin-bottom: 20px;
  margin-right: 60px; */
}

.savingsParameters {
  display: inline-block;
  width: 118.3px;
  /*margin-right: 22.6px;*/
  margin-bottom: 20px;
}

.savingsLastParameters {
  width: auto;
}

.rightParameters {
  display: inline-block;
  width: 31%;
}

.alignHorizontal {
  width: 90%;
  margin-right: auto;
  margin-left: auto;
  margin-top: 8px;
}

.alignHorizontalSavings {
  width: 90%;
  margin-top: 4px;
  margin-bottom: 12px;
  margin-right: auto;
  margin-left: auto;
}

.rightBlockPadding {
  padding: 9px 0 0 0;
}
.pmData {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

/* .headingsTest {
  font-size: 32px;
  
  color: var(--main);
  font-family: Poppins-Bold;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  display: block;
  padding-bottom: 10px;
  width: 157px;
  
}

.subheadingsTest {

  
  font-family: Poppins-Regular;
  font-size: 11px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #515151;
  
  width: 186px;
}

.performanceBoxesTest {

  width: 156px;
  height: 242px;
  border-radius: 3.7px;
  font-size: 12px;
  padding: 58px 0 0 0;
  text-align: center;
  box-sizing: border-box;
  font-family: "HelveticaNeue";
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  display: inline-block;
  margin-right: 22.3px;
  
}

.metricsTest {
  height: 53px;
  font-size: 44px; 
  font-weight: bold; 
}

.parameterTest {
  color: var(--main);
  font-size: 12px;
  font-weight: bold;
  font-family: Poppins-Bold;
  opacity: 0.8;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  margin-bottom: 7px;
}

.parameterValueTest {

  padding-left: 0;
  font-family: "HelveticaNeue";
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #303030;

}

.metricUnitsTest {

  height: 14px;
  font-family: "HelveticaNeue";
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: right;
  color: #ffffff;
  padding-right: 20px;

}

.brandingFooterTest {


  opacity: 0.5;
  font-family: Poppins-Regular;
  font-size: 10px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #515151;
  margin-top: 5px;

} 

.footerCompanyNameTest {

  opacity: 0.5;
  font-family: Poppins-Regular;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #05154c;

} */

.boxParameters {
  width: 114px;
  height: 35px;
  text-align: center;
  margin: auto;
}

.footerDiv {
  position: absolute;
  left: 32px;
  color: #05154c;
  width: 92%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 0px 0px 24px 0px;
  bottom: 0px;
}

.companyLogo {
  position: absolute;
  right: 50px;
  top: 514px;
  color: #05154c;
  height: 40px;
}

.companyDetails {
  color: #515151;
  font-size: 11px;
  line-height: 13px;
  text-align: right;
  opacity: 0.8;
}

.reportImages {
  height: 100%;
  width: 100%;
}

.leftDatasets {
  display: inline-block;
  width: 166px;
  margin: 0 30px 0 0;
}

.rightDatasets {
  display: inline-block;
  width: 126px;
}

.heatMapShadowAnalysisRightBlock {
  width: 365px;
  display: inline-block;
  margin: 0 0 0 15px;
}

.table-sm-cs td {
  font-size: 13.6px;
  padding: 5px 5px 5px 0;
  max-width: 176px;
  word-wrap: break-word;
}

.table-sm-cs th {
  font-weight: 600;
}

.orgNameThankPage {
  font-size: 24px;
  font-weight: 300 !important;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  /* color: #0086ae; */
  padding: 0 0 10px 0;
}

.thankPageContact {
  font-family: "Helvetica Neue";
  font-size: 20px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.4;
  letter-spacing: normal;
  text-align: left;
  color: #303030;
  overflow-wrap: break-word;
}

.aboutUsText {
  font-family: "Helvetica Neue";
  font-size: 15px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #303030;
  white-space: pre-line;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 19;
  -webkit-box-orient: vertical;
   word-break: break-word;
}

.shadowFreeText {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #303030;
  margin: 5px 0 0 0;
}

.organisationLogoWrapper {
  /* position: absolute;
  top: 540px;
  right: 50px; */
  max-height: 40px;
  max-width: 100px;
  object-fit: contain;
}

.organisationLogoWrapper #companyLogo img {
  max-width: 100px;
  max-height: 40px
}

.organisationLogoandDetailsWrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leftBlockThank {
  margin: 50px 0 0 0;
  padding-right: 35px;
  border-right: 2px solid #222;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.rightBlockThank {
  margin: 50px 0 0 50px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.incentivesContainer {
  height: 100%;
  margin-top: -16px;
}

.incentivesDetails:nth-child(odd) {
  border-radius: 2px;
  background-color: #f0f3f8;
  margin-top: 35px;
}

.incentivesDetails {
  padding: 10px 17px;
}

.incentiveContent {
  font-size: 14px;
  color: rgb(0, 0, 0);
  margin-top: 8px;
  font-family: "Helvetica Neue";
}
.incentiveHeading {
  /* font-size: 14px; */
  color: rgb(28, 51, 102);
  margin-top: 8px;
  font-size: 12px;
  /* font-weight: bold; */
  opacity: 0.8;
  /* font-weight: bold; */
  font-style: normal;
  font-stretch: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.homePage,
.aboutUsPage,
.sysMetricsPage,
.ourTeamPage,
.sysBox,
.estSavingPage,
.estSavBox,
.componentsPage,
.expAnnProPage,
.monthSavPage,
.sysProLossPage,
.costNotSolPage,
.envImpPage {
  display: flex;
  gap: 16px;
}

.expAnnProPage,
.monthSavPage {
  padding: 0px !important;
}

  .homePage {
    justify-content: space-between;
  }

  #projectDescription {
    width: 45%;
  }

  .fPageBoxWidth{
    width: 50%;
  }

.incentiveHeading {
  word-break: break-word;
}

.monthly_table {
    display: flex;
    flex-direction: column;
    row-gap: 1em;
    width: 100%;
    border-radius: 4px;
    border-collapse: separate;
    background-color: var(--light-blue);
    border: 1px solid var(--step-100);
  }
  
  .monthly_table tr {
    display: flex;
  }
  
 .monthly_table th, .monthly_table td {
    width: 12.5%;
    padding: 0;
    border: 0;
    color: var(--secondary);
    background-image: none;
    font-size: 12px;
    word-wrap: break-word;
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

  table field_segment_table td:nth-child(3) {
    text-align: center;
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
  white-space: pre-line;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  word-break: break-word;
  padding: 0px;
}

.headingCO {
  color: #263342;
  font-size: 17px;
  font-weight: bold;
}



.imgContCO {
  display: grid;
  grid-template-columns: 165px auto;
  gap: 16px;
  align-items: flex-start;
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
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 3px solid #f0f3f8;
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
  padding: 16px 12px 12px 12px;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  text-align: center;
  height: 106px;
  gap: 4px;
}

.boxOneColorBS {
  background-color: var(--primary) !important;
}

.boxTwoColorBS {
  background-color: var(--secondary) !important;
}

.boxThreeColorBS {
  background-color: var(--tertiary) !important;
}

.dAndHrsBS {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  padding-bottom: 12px;
  border-bottom: 1px solid #fff;
}

.strgBS {
  font-size: 12px;
  color: #fff;
  line-height: 1.5;
}

.ftrIconsBS{
  margin-bottom: 4px;
  width: 100%;
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
    color: var(--primary) !important;

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

.tablevalueWidthSDS {
    word-break: break-word;
    padding-left: 16px;
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 13px;

}

.firTbleBS {
    width: 28%;
    padding: 10px 8px 10px 0px;
}

.secTbleBS {
    width: 37%;
    padding: 10px 8px;
}

.thrTbleBS {
  padding: 10px 8px;
}

.frTbleBS {
    width: 15%;
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
.labelSPBlue {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.labelSPBlue {
  color: #1c3366;
}

.totalColumnSP {
  border-top: 2px solid #1c3366;
  background-color: #fff;
}

.totalLastColumnSP {
  border-top: 2px solid #ccc;
  background-color: #fff;
}
</style>


<style>

@media (max-width: 840px) {

  .media_queries .sysMetricsPage{
    flex-direction: column;
    height: fit-content;
    padding: 16px 16px 100px 16px !important;
  }
}

.pageDefault {
  height: 595px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 32px 32px 0 32px;
  position: relative;
  overflow-y: visible;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
} 

.pagePuppeteer {
  margin-bottom: 0px !important;
  flex-direction: row !important;
}

.pagePuppeteer {
  margin-bottom: 0px;
}
.flexComponents {
  display: flex;
   gap: 16px;
}

.rightBlockPadding {
  padding: 9px 0 0 0;
}


.sysMetricsPage
 {
  display: flex;
  gap: 16px;
}

</style>

<style lang="scss" scoped>
.media_queries {
@media (max-width: 840px) {
  .lossBarChart {
    width: auto !important;
    /* height: 440px !important; */
    height: 500px !important;
  }
}

@media (max-width: 500px) {
  .lossBarChart {
    /* height: 380px !important; */
    height: 440px !important;
  }

  .organisationLogoandDetailsWrapper {
    display: none;
  }
}


@media only screen and (max-width: 768px) {
  .monthly_table th,  .monthly_table td {
    font-size: 1.5vw;
    word-wrap: break-word;
  }
}

@media (max-width: 840px) {
  #reportDefault{
    overflow: hidden !important;
  }

  #projectDescription,
  .monthlyProductionSavingsLeftBlock {
    width: 100%;
  }
  
  .fPageBoxWidth {
    width: 100%;
    text-align: -webkit-center;
  }

  .view3D{
    width: fit-content;
  }

  .pageDefault {
    width: 100%;
    height: 595px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 16px 16px 0 16px !important;
    position: relative;
    overflow-y: visible;
    background-color: #fff;
    margin-bottom: 20px;
    -webkit-box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.08);
  }

  .expAnnProPage,
  .monthSavPage {
    padding: 0px !important;
    height: fit-content;
  }

  .sysMetricsPage,
  .ourTeamPage,
  .estSavingPage,
  .componentsPage,
  .shadingPage,
  .irradPage,
  .envImpPage,
  .homePage {
    min-height: 595px;
    height: fit-content;
    padding: 16px 16px 100px 16px !important;
  }

  .expAnnProPage{
    height: fit-content !important;
  }

  .homePage {
    padding: 16px 16px 175px 16px !important;
  }

  .fPageFLogo {
    max-width: 75px !important;
    max-height: 40px !important;
  }

  .homePage,
  .aboutUsPage,
  .sysMetricsPage,
  .ourTeamPage,
  .estSavingPage,
  .componentsPage,
  .envImpPage,
  .sysProLossPage,
  .costNotSolPage,
  .expAnnProPage,
  .monthSavPage {
    flex-direction: column;
  }

  .sysBox,
  .estSavBox,
  .envFlx {
    flex-wrap: wrap;
  }

  .estWidth,
  .subheadings,
  .componentsParameterValue,
  .envBox,
  .monthlyProductionSavingsRightBlock {
    width: 100% !important;
  }

  .shdAnlImg {
    width: 47% !important;
  }

  .componentsParameterValue {
    margin-left: 0px;
  }

  .nameBottomPosition {
    position: absolute;
    bottom: 80px;
    width: 90% !important;
  }

  .frontPageLayoutImage {
    height: 100% !important;
    max-height: 400px !important;
    width: 100% !important;
    max-width: 400px !important;
    border: 8px solid !important;
    min-height: 300px !important;
  }

  .subheadings {
    font-size: 12px;
  }

  .footerDiv {
    left: 16px;
    width: 95%;
  }

  .organisationLogoWrapper {
    max-height: 50px;
    max-width: 75px;
  }

  .abtFlxMD {
    display: flex;
    gap: 16px;
  }

  .abtLogo {
    max-width: 100px !important;
    max-height: 50px !important;
  }

  .performanceBoxes {
    width: 31%;
    height: 200px;
    border-radius: 3.7px;
    font-size: 12px;
    padding: 42px 0 0 0;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-family: "Helvetica Neue";
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: center;
    color: #ffffff;
    display: inline-block;
  }

  .leftParameters,
  .rightParameters {
    width: 47%;
  }

  .performanceBoxesSavings {
    width: 31%;
    height: 101px;
    border-radius: 3.7px;
    font-size: 12px;
    padding: 22px 0 0 0;
  }

  .boxParameters {
    height: auto;
  }

  .alignHorizontalSavings {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .alignHorizontal {
    margin-top: 16px;
  }

  .savings_metrics {
    font-size: 18px;
    height: auto;
  }

  .savingsParameters {
    width: 47%;
    margin-bottom: 0px;
  }

  .estSavBox {
    margin-bottom: 24px;
  }

  #componentsRightBlock {
    width: 100% !important;
    padding: 9px 0px 0px;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    column-gap: 16px !important;
  }

    .componentsRightBlockClass{
    width: 100% !important;
    padding: 9px 0px 0px;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    column-gap: 16px !important;
  }

  .componentsItemValue {
    text-align: left !important;
  }

  .table-sm th {
    font-size: 7.3px;
    opacity: 0.8;
    font-weight: bold;
    padding: 2px;
  }

  .table-sm td {
    font-size: 8px;
    font-family: "Helvetica Neue";
    color: #303030;
    padding: 2px;
  }

  .heatMapShadowAnalysisRightBlock {
    width: 47%;
    margin: 0px;
    margin-top: 16px;
    margin-left: 16px;
  }

  .leftBlockThank {
    margin: 50px 0 0 0;
    padding-right: 16px;
    border-right: 2px solid #222;
  }

  .thnkuLogo {
    max-width: 150px !important;
    max-height: 170px !important;
    padding-bottom: 12px;
  }

  .rightBlockThank {
    margin: 50px 0 0 16px;
  }

  .thnku {
    font-size: 24px;
  }

  .orgNameThankPage {
    font-size: 18px;
  }

  .thankPageContact {
    font-size: 11px;
  }

  .shadowAnalysisImages {
    margin: 12px 0 0 0;
    height: 100%;
    max-height: 350px;
    width: 100%;
    max-width: 350px;
    min-height: 300px;
  }

  .heatMapImages {
    margin: 12px 0 0 0;
    height: 100%;
    max-height: 350px;
    width: 100%;
    max-width: 350px;
    min-height: 300px;
  }

  .lossesChartWrapper {
    display: inline-block;
    width: 100%;
  }

  .lossesChartWrapper .graph_box {
    /* height: 100%; */
    height: 90%;
  }

  .monthlyProductionSavingsLeftBlock {
    padding: 16px;
  }

  .mrgnBtm {
    margin-bottom: 16px !important;
  }

  .monthlyProductionChartWrapper {
    padding: 16px 16px 0px 16px;
  }

  .grphHeight{
    height: 100% !important;
  }
}

@media (max-width: 575px) {
  .shdAnlImg {
    width: 100% !important;
  }

  .heatMapShadowAnalysisRightBlock {
    width: 100%;
    margin: 0px;
  }
}


@media (max-width: 500px) {

  .performanceBoxes,
  .performanceBoxesSavings {
    width: 47%;
  }

  .thankYouFlex{
    flex-direction: column;
    display: flex;
    width: 100%;
    justify-content: center;
    margin-bottom: 90px;
  }

  .thnkUWidth{
    width: 100% !important;
    height: auto !important;
  }

  .leftBlockThank {
    margin: auto;
    padding-right: 0px;
    border-right: none;
    justify-content: center;
    flex-direction: column;
  }

  .rightBlockThank {
    margin: 0px;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .orgNameThankPage{
    padding: 13px 0px 16px 0px;
    font-weight: 600 !important;
  }

  .thankPageContact{
    font-size: 16px;
    margin-bottom: 6px;
  }

  .thnkUFooter{
    display: none;
  }
}

@media (max-width: 840px) {
  .homePage,
  .aboutUsPage,
  .sysMetricsPage,
  .ourTeamPage,
  .estSavingPage,
  .componentsPage,
  .envImpPage,
  .sysProLossPage,
  .costNotSolPage,
  .expAnnProPage,
  .monthSavPage {
    flex-direction: column;
  }
}
}

@media (max-width: 590px) {
  .headingCO {
  text-align: center;
}

.imgContainerCODefault {
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
    height: 86px;
    gap: 4px;
  }

  .tablevalueWidthSDS {
    font-size: 10px;
  }

  .paddingColumnSP {
    padding-left: 24px;
  }

}
</style>

<style lang="scss">


.imgContainerCODefault {
  display: grid;
  grid-template-columns: 100%;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
  height: fit-content;
}

.media_queries {
@media (max-width: 840px) {
  .componentsRightBlockClass{
    width: 100% !important;
    padding: 9px 0px 0px;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    column-gap: 16px !important;
  }
  
  .componentsPage {
    flex-direction: column;
  }

}
}

.ourTeamPage{
  display: inline-block !important;
}
</style>
