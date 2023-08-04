const APP_VERSION = "v0.1.31";
let environment = import.meta.env.VITE_APP_ENVIRONMENT;
let isRunningLocally = import.meta.env.DEV;

let availableEnvironments = ["dev", "beta", "prod"];

if (!availableEnvironments.includes(environment)) {
  if (environment) {
    throw new Error(
      `"${environment}" is not in the list of available environments. It may have to be configured before it can be used.`
    );
  } else {
    if (isRunningLocally) {
      let errorText =
        "Environment has not been set. Please make sure you have configured your .env.local file.";
      throw new Error(errorText);
    } else {
      // For safety reasons, assuming 'prod' environment in case the
      // environment variable isn't available in production environments.
      environment = "prod";
    }
  }
}

const stripePkSandbox =
  "pk_test_51KrDMhE9DCOsh5Kqk0ob4ZmDxQp0jtvgRWp2HIJ5uiAa6go9LMPTBbRHysWQXiHoSGE7dz1s8TRvRYZlftobrZvl0093hjXNkJ";
const stripePkLive =
  "pk_live_51KrDMhE9DCOsh5KqrmIqgx94BNCZ4QBRG8rj8gVzBV85S7zVS77A2Y2FMKEJrAv9Z0UvDMFPc27OE7nwFrYnsJxA00Vkjv0DVj";

const razorpayKeyTesting = "rzp_test_irnPQxt2hSfRUv";
const razorpayKeyLive = "rzp_live_5DAsPjFh3YV8ad";

let DATABASE_URL;
let DATABASE_URL_FOR_WEBSOCKET;
let DATABASE_URL_FOR_SITE_SURVEY;
let SL360_URL;
let ARKA_AUTH_URL;
let ARKA_BASE_URL;
let BASE_URL_FOR_REPORT_IMAGES;
let COOKIE_IDENTIFIER_FOR_ARKA;
let SITE_SURVEY_LINK;
let STRIPE_PK;
let USE_CASHFREE_PROD;
let RAZORPAY_KEY;
let PRODUCTION_ENV;
let defaultModuleId;
let defaultGazeboModuleId;
let gazeboAllowedModules;
let lidarTiltApi;
let useLivePayments;
let es_org_id;

if (environment == "dev") {
  DATABASE_URL = "https://devapi.thesolarlabs.com:8004/";
  DATABASE_URL_FOR_SITE_SURVEY = "https://devgosolar.thesolarlabs.com/";
  // DATABASE_URL_FOR_WEBSOCKET = "WSS://devapi.thesolarlabs.com:8001/ws/chat/";
  DATABASE_URL_FOR_WEBSOCKET = "wss://daphnedev.thesolarlabs.com:8002/ws/chat/";
  BASE_URL_FOR_REPORT_IMAGES = "https://dev.thesolarlabs.com/";
  lidarTiltApi = "https://designstudiodev.azurewebsites.net";
  SL360_URL = "https://dev.arkaenergy.com/360/";
  ARKA_AUTH_URL = "https://arka-authentication-development.azurewebsites.net/";
  ARKA_BASE_URL = "https://arka360-production-development.azurewebsites.net/";
  SITE_SURVEY_LINK = "https://tsl-survey-tool-development.azurewebsites.net";
  COOKIE_IDENTIFIER_FOR_ARKA = "_dev";
  useLivePayments = false;
  PRODUCTION_ENV = false;
  defaultModuleId = 24018;
  defaultGazeboModuleId = 23925;
  gazeboAllowedModules = [23925, 24016, 24017];
  es_org_id = 822;
} else if (environment == "beta") {
  DATABASE_URL = "https://betaapi.thesolarlabs.com/";
  DATABASE_URL_FOR_SITE_SURVEY = "https://gosolar.thesolarlabs.com/";
  // DATABASE_URL_FOR_WEBSOCKET = "//betaapi.thesolarlabs.com/";
  DATABASE_URL_FOR_WEBSOCKET =
    "wss://daphneprod.thesolarlabs.com:8002/ws/chat/";
  BASE_URL_FOR_REPORT_IMAGES = "https://beta.thesolarlabs.com/";
  lidarTiltApi = "https://designstudioapp.azurewebsites.net";
  SL360_URL = "https://beta.arkaenergy.com/360/";
  ARKA_AUTH_URL = "https://arka-authentication-testing.azurewebsites.net/";
  ARKA_BASE_URL = "https://arka360-production.azurewebsites.net/"; // TODO: Need to get Actual URL for Beta
  SITE_SURVEY_LINK = "https://tsl-survey-tool.azurewebsites.net";
  COOKIE_IDENTIFIER_FOR_ARKA = "_test";
  useLivePayments = false;
  PRODUCTION_ENV = false;
  defaultModuleId = 30003;
  defaultGazeboModuleId = 28429;
  gazeboAllowedModules = [28429, 28776];
  // org id need to be updated
  es_org_id = 491;
} else if (environment == "prod") {
  DATABASE_URL = "https://prodapi.thesolarlabs.com/";
  DATABASE_URL_FOR_SITE_SURVEY = "https://gosolar.thesolarlabs.com/";
  // DATABASE_URL_FOR_WEBSOCKET = "//prodapi.thesolarlabs.com/";
  DATABASE_URL_FOR_WEBSOCKET =
    "wss://daphneprod.thesolarlabs.com:8002/ws/chat/";
  BASE_URL_FOR_REPORT_IMAGES = "https://app.thesolarlabs.com/";
  lidarTiltApi = "https://designstudioapp.azurewebsites.net";
  SL360_URL = "https://app.arkaenergy.com/360/";
  ARKA_AUTH_URL = "https://arka-authentication.azurewebsites.net/";
  ARKA_BASE_URL = "https://arka360-production.azurewebsites.net/";
  SITE_SURVEY_LINK = "https://tsl-survey-tool.azurewebsites.net";
  COOKIE_IDENTIFIER_FOR_ARKA = "";
  useLivePayments = true;
  PRODUCTION_ENV = true;
  defaultModuleId = 30003;
  defaultGazeboModuleId = 28429;
  gazeboAllowedModules = [28429, 28776];
  // org id need to be updated
  es_org_id = 491;
}

if (useLivePayments) {
  STRIPE_PK = stripePkLive;
  USE_CASHFREE_PROD = true;
  RAZORPAY_KEY = razorpayKeyLive;
} else {
  STRIPE_PK = stripePkSandbox;
  USE_CASHFREE_PROD = false;
  RAZORPAY_KEY = razorpayKeyTesting;
}

// const GOOGLE_API_KEY = "AIzaSyB03FdBoXg_cEe7xWRkbs0ySmMsgMUWrS0" // old
const GOOGLE_API_KEY = "AIzaSyCRKem7aP2ORcLP9jmBSIADnrmgxzQNWEg"; // new
const GOOGLE_API_KEY_TILES = "AIzaSyBOVbQ7oSTZZVfg4eVzBCYifEMT-tx-5sI";
const GOOGLE_SIGNING_SECRET = "xte8ioISnvNiBiCaCeuEtUfLE-0=";
const SAVE_REPORT_LAMBDA_ENDPOINT =
  "https://udlt2cbkgpskt7blcrjw2uky3q0rbmhz.lambda-url.ap-south-1.on.aws/";
const STAGE_REPORT_LAMBDA_ENDPOINT =
  "https://hxzb3wckog4uk26bxxvnzkdz6m0nwqkj.lambda-url.ap-south-1.on.aws/"; // stageReport
// const STAGE_REPORT_LAMBDA_ENDPOINT = "https://5nltgrxshc.execute-api.ap-south-1.amazonaws.com/default/stageReport2" // stageReport2

export {
  APP_VERSION,
  environment,
  DATABASE_URL,
  DATABASE_URL_FOR_WEBSOCKET,
  DATABASE_URL_FOR_SITE_SURVEY,
  BASE_URL_FOR_REPORT_IMAGES,
  SL360_URL,
  ARKA_AUTH_URL,
  ARKA_BASE_URL,
  COOKIE_IDENTIFIER_FOR_ARKA,
  STRIPE_PK,
  USE_CASHFREE_PROD,
  RAZORPAY_KEY,
  SITE_SURVEY_LINK,
  GOOGLE_API_KEY,
  GOOGLE_API_KEY_TILES,
  GOOGLE_SIGNING_SECRET,
  SAVE_REPORT_LAMBDA_ENDPOINT,
  STAGE_REPORT_LAMBDA_ENDPOINT,
  PRODUCTION_ENV,
  defaultModuleId,
  defaultGazeboModuleId,
  gazeboAllowedModules,
  lidarTiltApi,
  es_org_id,
};
