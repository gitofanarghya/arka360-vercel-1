import axios from "axios";

import { DATABASE_URL } from "../../constants";

// Importing all the services
import masterDataPanel from "./masterDataPanel";
import siteSurveyLinkApi from "./siteSurveyLinkApi";
import masterDataWeather from "./masterDataWeather";
import masterDataCountry from "./masterDataCountry";
import masterDataInverter from "./masterDataInverter";
import leads from "./leads";
import projects from "./projects";
import credits from "./credits";
import payments from "./payments";
import designs from "./designs";
import designsVersions from "./designVersions";
import organisation from "./organisations";
import users from "./users";
import integration from "./integration";
import incentiveInformation from "./incentiveInformation";
import financialsInformations from "./financialsInformations";
import finanacialsInformation from "./finanacialsInformation";
import ahjInformation from "./ahjInformation.js";
import defaultUserShares from "./defaultUserShares";
import defaultOrgShares from "./defaultOrgShares";
import designVersionScene from "./designVersionScene";
import designVersionSettings from "./designVersionSettings";
import designVersionSummary from "./designVersionSummary";
import projectModels from "./projectModels";
import projectConsumptionDetails from "./projectConsumptionDetails";
import projectTargets from "./projectTargets";
import defaultsProfiles from "./defaultsProfile";
import designFinancialDetails from "./designFinancialDetails";
import organisationInverters from "./organisationInverter";
import organisationPanels from "./organisationPanel";
import organisationBOQ from "./organisationBOQ";
import featureStatus from "./featureStatus";
import reports from "./reports";
import wireSizeCalculator from "./wireSizeCalculator.js";
import utils from "./utils";
import team from "./team.js";
import orderinformation from "./orderinformation";
import dashboardinfo from "./dashboardinfo";
import optimizerList from "./optimizerList";
import documentInfo from "./documentInfo";
import chatInfo from "./chatInformation";
import lidarInfo from "./lidarInfo";
import fetchMap from "./fetchMap";
import azureSasToken from "./azureSasToken";
import arka from "./arka";
import proposalInfo from "./proposalInfo";
import selfDesign from "./selfDesign";
import tou from "./tou";
import designOrders from "./designOrders";
import esUsers from "./esUsers";
import shifts from "./esUserShifts";
import competencies from "./competencies";
import crmDashboard from "./crmDashboard";
import addersDiscounts from "./adders&discounts";

export default {
  MASTER_DATA_PANEL: masterDataPanel,
  SITE_SURVEY_LINK: siteSurveyLinkApi,
  MASTER_DATA_WEATHER: masterDataWeather,
  MASTER_DATA_INVERTER: masterDataInverter,
  PROJECTS: projects,
  CREDITS: credits,
  PAYMENTS: payments,
  DESIGNS: designs,
  DESIGN_VERSIONS: designsVersions,
  ORGANISATION: organisation,
  USERS: users,
  INTEGRATION: integration,
  ORG_SHARES: defaultOrgShares,
  USER_SHARES: defaultUserShares,
  PROJECT_MODELS: projectModels,
  PROJECT_TARGETS: projectTargets,
  DEFAULTS_PROFILE: defaultsProfiles,
  PROJECT_CONSUMPTION_DETAILS: projectConsumptionDetails,
  DESIGN_VERSION_SCENE: designVersionScene,
  DESIGN_VERSION_SETTINGS: designVersionSettings,
  DESIGN_VERSION_SUMMARY: designVersionSummary,
  DESIGN_FINANCIAL_DETAILS: designFinancialDetails,
  ORGANISATION_PANELS: organisationPanels,
  ORGANISATION_INVERTERS: organisationInverters,
  ORGANISATION_BOQ: organisationBOQ,
  FEATURE_STATUS: featureStatus,
  REPORTS: reports,
  UTILS: utils,
  MASTER_DATA_COUNTRY: masterDataCountry,
  WIRE_SIZE_CALCULATOR: wireSizeCalculator,
  INCENTIVE_INFORMATION: incentiveInformation,
  FINANACIALS_INFORMATION: financialsInformations,
  FINANACIALS_INFORMATION: finanacialsInformation,
  ORDER_INFORMATION: orderinformation,
  DASHBOARD_INFO: dashboardinfo,
  AHJ_INFORMATION: ahjInformation,
  TEAM: team,
  OPTIMIZER_LIST: optimizerList,
  DOCUMENT_INFO: documentInfo,
  CHAT_iNFO: chatInfo,
  LIDAR_INFO: lidarInfo,
  AZURE_SAS_TOKEN: azureSasToken,
  TOU: tou,
  PROPOSAL_INFO: proposalInfo,
  FETCH_MAP: fetchMap,
  ARKA: arka,
  SELF_DESIGN: selfDesign,
  DESIGN_ORDERS: designOrders,
  ES_USERS: esUsers,
  LEADS: leads,
  SHIFTS: shifts,
  COMPETENCIES: competencies,
  CRM_DASHBOARD: crmDashboard,
  ADDERS_DISCOUNTS: addersDiscounts,
  SET_DATABASE_URL() {
    axios.defaults.baseURL = DATABASE_URL;
  },

  SET_TOKEN_HEADER(token) {
    if (token) {
      axios.defaults.headers.common.Authorization = `Token ${token}`;
    }
  },

  SET_AXIOS_RESPONSE_HANDLER() {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        throw error;
      }
    );
  },
};
