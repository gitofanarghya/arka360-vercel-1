import API from "@/services/api/";
import axios from "axios";
import {
  GOOGLE_API_KEY,
  GOOGLE_SIGNING_SECRET,
  DATABASE_URL_FOR_WEBSOCKET,
} from "./constants";
import { signRequest } from "./core/utils/utils";

export function setCookie(name, data, expiryDate) {
  if (!expiryDate) {
    // If no expiry date, expire next year
    expiryDate = new Date(new Date().getTime() + 31536000000);
  }

  let cookieString = `${name}=${data}; expires=${expiryDate};`;
  if (location.hostname.includes("thesolarlabs.com")) {
    cookieString += " domain=thesolarlabs.com;";
  }
  document.cookie = cookieString;
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Setting the cookie to expire at a date in the past will delete the cookie
export function eraseCookie({ name, domain, path }) {
  let deleteCookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  if (domain) {
    deleteCookieString += ` domain=${domain};`;
  }
  if (path) {
    deleteCookieString += ` path=${path};`;
  }
  document.cookie = deleteCookieString;
}
export function fetchOrganisationId() {
  let org = JSON.parse(localStorage.getItem("organisation"));
  return org?.id;
}
export function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (user.role == "ADMIN") {
    return true;
  }
  return false;
}

export function isCrmUser() {
  let org = JSON.parse(localStorage.getItem("organisation"));
  return org?.is_crm_enabled;
}

export function isAccountSubscribed() {
  let allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
  let selfDesignId = allServicesInfo?.self_designing_info?.id;
  return !Boolean(selfDesignId);
}

export function isUserOfRole(role) {
  return JSON.parse(localStorage.getItem("user"))?.role == role;
}

export function isUSFlagEnabled() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.isUSFlagEnabled;
}

export async function fetchOrganisationDetails() {
  const { organisation_id } = { ...JSON.parse(localStorage.getItem("user")) };
  let orgResponse = await API.ORGANISATION.FETCH_ORGANISATION(organisation_id);
  localStorage.setItem("organisation", JSON.stringify(orgResponse.data));

  return orgResponse.data;
}
export async function fetchUserDetails() {
  let userData = JSON.parse(localStorage.getItem("user")) || {};
  let userResponse = await API.USERS.FETCH_USER(userData["user_id"]);

  userData["logo"] = userResponse.data.logo;
  localStorage.setItem("user", JSON.stringify(userData));

  return userResponse.data;
}
export function formatNumberWithCommas(value, isIndianFormat, options) {
  // For options parameter, check here:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
  if (typeof value === "string") {
    value = value.replace(/,/g, "");
  }
  if (!options) {
    options = {};
  }
  // options.minimumFractionDigits = 2;
  options.maximumFractionDigits = 2;
  if (isIndianFormat) {
    return parseFloat(value).toLocaleString("en-IN", options);
  } else {
    return parseFloat(value).toLocaleString("en-US", options);
  }
}

export async function paginationHelper(data) {
  let origArray = data.origArray;
  let paginationDict = data.paginationDict;

  let paginationUnavailable =
    paginationDict.copyUrl == paginationDict.nextUrl || !paginationDict.nextUrl;
  if (paginationUnavailable) {
    return;
  }

  paginationDict.copyUrl = paginationDict.nextUrl;
  paginationDict.busy = true;
  let response = await axios.get(paginationDict.nextUrl);
  let newArray = origArray.concat(response.data.results);

  paginationDict.nextUrl = response.data.next;
  paginationDict.busy = false;

  return newArray;
}

export function replaceGoogleApiKeyInUrl(url) {
  if (!url.includes("maps.googleapis")) {
    return url;
  }
  if (url && url.includes("&key=")) {
    let beforeAPIkey = url.split("&key=")[0];
    let apiKeyAndAfter = url.split("&key=")[1];
    let afterAPIkey = apiKeyAndAfter.split("&")[1];
    let newUrl = beforeAPIkey + "&key=" + GOOGLE_API_KEY;
    if (afterAPIkey) {
      newUrl += "&" + afterAPIkey;
    }
    return newUrl;
  }
  return url;
}

export function convertLossDataFromArrayToGraphFormat(lossData) {
  const lossDataGraphFormat = [
    {
      Irradiation: [
        {
          initial_name: "Horizontal Global Irradiation",
          initial_value: lossData[0].Irradiance[0].initial_value,
          units: "kWh/m²",
        },
        {
          loss: "Global Incidence on PV plane",
          percent: lossData[0].Irradiance[1].percent,
        },
        {
          loss: "Near Shading: irradiance loss",
          percent: lossData[0].Irradiance[2].percent,
        },
        {
          loss: "Irradiance after reflection",
          percent: lossData[0].Irradiance[3].percent,
        },
        {
          loss: "Soiling loss factor",
          percent: lossData[0].Irradiance[4].percent,
        },
      ],
    },
    {
      DC: [
        {
          initial_name: "Nominal Energy after PV conversion",
          initial_value: lossData[1].DC[0].initial_value,
          units: "kWh",
        },
        {
          loss: "PV loss due to environmental condition",
          percent: lossData[1].DC[1].percent,
        },
        {
          loss: "Light Induced Degradation",
          percent: lossData[1].DC[2].percent,
        },
        {
          loss: "Mismatch loss, modules and strings",
          percent: lossData[1].DC[3].percent,
        },
        {
          loss: "Ohmic wiring loss",
          percent: lossData[1].DC[4].percent,
        },
      ],
    },
    {
      AC: [
        {
          loss: "Clipping losses",
          percent: lossData[2].AC[0].percent,
        },
        {
          loss: "DC/AC conversion",
          percent: lossData[2].AC[1].percent,
        },
        {
          loss: "System Availability",
          percent: lossData[2].AC[2].percent,
        },
        {
          loss: "AC Ohmic loss",
          percent: lossData[2].AC[3].percent,
        },
      ],
    },
  ];
  return lossDataGraphFormat;
}

export function convertLossDataFromJsonToGraphFormat(lossData) {
  const lossDataGraphFormat = [
    {
      Irradiance: [
        {
          initial_name: "Horizontal Global Irradiation",
          initial_value: lossData.energy.irradiance.ghi,
          units: "kWh/m²",
        },
        {
          loss: "Global Incidence on PV plane",
          percent: lossData.losses.irradiance.epoa,
        },
        {
          loss: "Near Shading: irradiance loss",
          percent: lossData.losses.irradiance.shading,
        },
        {
          loss: "Soiling loss factor",
          percent: lossData.losses.irradiance.soiling,
        },
        {
          loss: "Irradiance after reflection",
          percent: lossData.losses.irradiance.iam,
        },
      ],
    },
    {
      DC: [
        {
          initial_name: "Nominal Energy after PV conversion",
          initial_value: lossData.energy.dc.nominal,
          units: "kWh",
        },
        {
          loss: "PV loss due to environmental condition",
          percent: lossData.losses.dc.environmental,
        },
        {
          loss: "Light Induced Degradation",
          percent: lossData.losses.dc.lid,
        },
        {
          loss: "Mismatch loss, modules and strings",
          percent: lossData.losses.dc.mismatch,
        },
        {
          loss: "Ohmic wiring loss",
          percent: lossData.losses.dc.dc_ohmic,
        },
      ],
    },
    {
      AC: [
        {
          loss: "Clipping losses",
          percent: lossData.losses.ac.clipping,
        },
        {
          loss: "DC/AC conversion",
          percent: lossData.losses.ac.inverter_conversion,
        },
        {
          loss: "System Availability",
          percent: lossData.losses.ac.unavailability,
        },
        {
          loss: "AC Ohmic loss",
          percent: lossData.losses.ac.ac_ohmic,
        },
      ],
    },
  ];
  return lossDataGraphFormat;
}

import { useCreditsStore } from "./stores/credits";
import { useOrgInventoryBOQStore } from "./stores/organisation-inventory-BOQ";
import { useOrganisationStore } from "./stores/organisation";

export async function initializeStore() {
  let creditsStore = useCreditsStore();
  let orgInventoryBOQStore = useOrgInventoryBOQStore();
  let organisationStore = useOrganisationStore();

  creditsStore.FETCH_AND_UPDATE_CREDIT_BALANCE();
  // store.dispatch('organisation/inventory/panels/FETCH_ORGANISATION_PANELS');
  // store.dispatch('organisation/inventory/inverters/FETCH_ORGANISATION_INVERTERS');
  orgInventoryBOQStore.SET_ORGANISATION_ID();
  //store.dispatch('organisation/inventory/BOQ/FETCH_ORGANISATION_BOQ');
  await organisationStore.GET_ALL_AVAILABLE_PRICING_PLANS();
  organisationStore.SET_QUOTA_DETAILS_AND_DEFAULT_VALUES();
}

export function getDetailsFromGoogleMapsResult(result, allResults = null) {
  let addressComponents = result?.address_components?.filter((component) => {
    return component.types[0] == "administrative_area_level_1";
  });
  let state = addressComponents?.[0]?.long_name;
  let countryCodeObj = {};
  if (allResults) {
    for (let eachResult of allResults) {
      countryCodeObj = eachResult?.address_components?.filter((component) => {
        return component.types.includes("country");
      });
      if (Object.keys(countryCodeObj).length > 0) break;
    }
  } else {
    countryCodeObj = result?.address_components?.filter((component) => {
      return component.types.includes("country");
    });
  }
  let countryCode = countryCodeObj?.[0]?.short_name;
  let postalCode = result?.address_components?.filter((component) => {
    return component.types.includes("postal_code");
  });
  return { state, countryCode, postalCode };
}

export function isTataOrg() {
  return JSON.parse(localStorage.getItem("user")).organisation_id == 263;
}

export function getLeadPipelineStages() {
  return JSON.parse(localStorage.getItem("organisation")).pipelines[0][
    "stages"
  ];
}

export function getLeadSourceOptions() {
  return [
    {
      value: "website",
      label: "Website",
    },
    {
      value: "referral",
      label: "Referral",
    },
    {
      value: "marketing",
      label: "Marketing Campaigns",
    },
    {
      value: "outbound",
      label: "Outbound",
    },
  ];
}

export function getExpertServicesList() {
  const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
  let services = [];
  if (allServicesInfo) {
    for (let template of allServicesInfo.service_templates) {
      services.push({
        id: template.id,
        serviceName: template.template_constant[0].name,
        description: template.template_constant[0].description,
        detailedService: template,
        basePrice: template.base_price,
      });
    }
  }

  return services;
}

export function getSelfDesignInfo() {
  const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
  return allServicesInfo?.self_designing_info;
}

export const orderStatusDict = {
  incomplete: "Incomplete",
  pending: "Pending",
  order_placed: "Order Placed",
  in_process: "In Process",
  on_hold: "On Hold",
  complete: "Complete",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function getOrderStatusColor(status) {
  if (status == "complete") {
    return "#2cc21c";
  } else if (["incomplete", "rejected", "cancelled"].includes(status)) {
    return "#ff0404";
  } else {
    return "#409eff";
  }
}

export function connectWebsocketUtil(url) {
  let chatSocket = new WebSocket(url);

  chatSocket.onopen = function (event) {
    console.log(event);
    console.log("!!Successfully connected to the websocket server...");
  };
  return chatSocket;
}

export function getMessagesFromWebsocketUtil(chatSocket) {
  console.log("getmessages");
  chatSocket.onmessage = function (event) {
    console.log("!!!Message from server ", event.data);
    window.dispatchEvent(
      new CustomEvent("chatSocket-onMessage-called", {
        detail: {
          storage: event.data,
        },
      })
    );
  };
}

export function chatSendUtil(data, id, chatSocket, PostObj) {
  let messageVmodal = data;
  console.log(messageVmodal);
  if (messageVmodal) {
    let jsonSt = JSON.stringify(PostObj);
    chatSocket.send(jsonSt);
    // this.scrollToBottom();
    messageVmodal = "";
    // this.getMessagesFromWebsocket();
  }
}

const reverseDisplay = (myList) => {
  let result = myList.slice().reverse();
  return result;
};

export async function getChatMessagesFromDbUtil(id) {
  const response = await API.CHAT_iNFO.FETCH_CHAT_MESSAGES(id);
  console.log("!! messages from rest api", response);
  let chatMessages = response.data.results;
  chatMessages = reverseDisplay(chatMessages);
}

export function generateColorFromName(name) {
  // Generate a hash code from the name
  if (name) {
    let hashCode = 0;
    for (let i = 0; i < name.length; i++) {
      hashCode = name.charCodeAt(i) + ((hashCode << 5) - hashCode);
    }

    // Convert the hash code to a hexadecimal color code
    let color = (hashCode & 0x00ffffff).toString(16).toUpperCase();

    // Prepend zeros if the color code is less than 6 characters
    while (color.length < 6) {
      color = "0" + color;
    }

    // Return the final color string
    return "#" + color;
  }
}

export function getProjectImageUrl(lat, lng, zoom, boundEdgePixels = 512) {
  zoom ||= 19;
  const mapWidth = Math.round(boundEdgePixels);
  const mapHeight = Math.round(boundEdgePixels);
  return signRequest(
    `https://maps.googleapis.com/maps/api/staticmap?center=${lat.toString()},
  ${lng.toString()}&scale=2&zoom=${zoom.toString()}&maptype=satellite&size=${mapWidth}x${mapHeight}&key=${GOOGLE_API_KEY}`,
    GOOGLE_SIGNING_SECRET
  );
}

export function setUiInStorage(ui) {
  localStorage.setItem("ui", JSON.stringify(ui));
}

export function getUiFromStorage() {
  {
    let ui = JSON.parse(localStorage.getItem("ui")) || {};
    ui.leadManagement ||= {};
    ui.leadSummary ||= {};
    return ui;
  }
}

export function isGenerationDisabled(info) {
  let { nameplateDcSize, acSize } = info;
  if (!(nameplateDcSize && acSize)) return true;
}

export function isWebProposalDisabled(info) {
  let { orderStatus, nameplateDcSize, acSize, financials } = info;

  if (orderStatus == "cancelled" || orderStatus == "rejected") {
    return true;
  }

  return (
    !nameplateDcSize ||
    !acSize ||
    (financials.length > 0 && !financials[0].payback) ||
    financials.length == 0
  );
}

export function isDocProposalDisabled(info) {
  let { orderStatus, nameplateDcSize, acSize, financials, reportTemplate } =
    info;

  if (orderStatus == "cancelled" || orderStatus == "rejected") {
    return true;
  }

  let isDisabled = !nameplateDcSize || !acSize;
  // For US and Gazebo reports, a lot of pages depend on payback period. Hence, there is a check for payback as well.
  if (
    reportTemplate == "solar_labs_usa" ||
    reportTemplate == "report_gazebo" ||
    reportTemplate == "tata_power"
  ) {
    isDisabled =
      isDisabled ||
      (financials.length > 0 && !financials[0].payback) ||
      financials.length == 0;
  }
  return isDisabled;
}

export function isDesignExpertService(design) {
  return design?.request_expert_service?.id;
}

export function showProposalButtons(design) {
  if (!isDesignExpertService(design)) {
    return true;
  }

  if (
    isDesignExpertService(design) &&
    design?.request_expert_service?.order_status == "cancelled"
  ) {
    return false;
  }

  return true;
}

export const mapPinImageUrl =
  "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/location-pin.png";

export const chatEvents = {
  ORDER_ASSIGNMENT: {
    message: "Assigned to user_name ",
    event: "Order Assignment",
  },
  DOCUMENT_UPLOAD: {
    message: "user_name uploaded a document",
    event: "document upload",
  },
  REVISION_REQUESTED: { message: "user_name requested a revision" },
  CONSUMPTION_UPDATED: { message: "user_name updated the consumption" },
  SITE_SURVEY_UPDATED: { message: "user_name updated the site survey" },
  NOTES_ADDED: {
    message: "user_name notes updated/added",
    event: "notes added",
  },
  AHJ_ADDED: { message: "user_name AHJ updated/added", event: "ahj added" },
  MODULES_ADDED: {
    message: "user_name Modules updated/added",
    event: "modules added",
  },
  INVERTER_ADDED: {
    message: "user_name Inverters updated/added",
    event: "Inverters added",
  },
  STORAGE_ADDED: {
    message: "user_name Storage updated/added",
    event: "Storage added",
  },
  PROPOSAL_REQUESTED: {
    message: "user_name Proposal Requested",
    event: "Proposal Requested",
  },
  COMPLETED_DESIGN: {
    message: "user_name completed the design",
    event: "design completed",
  },
  ORDER_ACCEPTED: {
    message: "user_name accepted the order",
    event: "order accepted",
  },
  REVISION_REQUEST_ACCEPTED: {
    message: "user_name accepted revesion request",
    event: "accepted revesion request",
  },
  ORDER_REJECTED: {
    message: "user_name rejected the order",
    event: "order rejected",
  },
  PROPOSAL_OR_ORDER_REJECTED_CUSTOMER: {
    message: "user_name rejected the proposal/order",
    event: "rejected the proposal/order",
  },
};

export const sendEvent = async (eventName, orderId) => {
  if (!eventName || !orderId) throw new Error();

  const url = `${DATABASE_URL_FOR_WEBSOCKET}order/${orderId}/`;
  const { user_id, first_name, last_name } = JSON.parse(
    localStorage.getItem("user")
  );
  const chatSocket = new WebSocket(url);
  chatSocket.onopen = function (event) {
    console.log(`Successfully connected for event ${eventName.event}`);

    const data = {
      order_id: orderId,
      message: eventName.message.replace(
        "user_name",
        `${first_name} ${last_name}`
      ),
      user_id: user_id,
      message_type: "event",
    };

    chatSocket.send(JSON.stringify(data));

    chatSocket.close();
  };

  chatSocket.onerror = function (event) {
    console.log(`Error occured for event ${eventName.event}`);
    console.log(event);

    throw new Error(`Error occured for event ${eventName.event}`);
  };

  chatSocket.onclose = function (event) {
    console.log(`Closed for event ${eventName.event}`);

    return `Closed for event ${eventName.event}`;
  };
};

export const reportPagesListNonUs = [
  {
    label: "title",
    name: "Title",
  },
  {
    label: "company-overview",
    name: "Company Overview",
  },
  {
    label: "heat-map",
    name: "Irradiance Map",
  },
  {
    label: "shadow-analysis",
    name: "Shadow Analysis",
  },
  {
    label: "system-metrics",
    name: "System Metrics",
  },
  {
    label: "system-pricing",
    name: "System Pricing",
  },
  {
    label: "savings",
    name: "Savings",
  },
  {
    label: "battery-storage",
    name: "Battery Storage",
  },
  {
    label: "components",
    name: "Components",
  },
  {
    label: "monthly-production",
    name: "Monthly Production",
  },
  {
    label: "monthly-savings",
    name: "Monthly Savings",
  },
  {
    label: "monthly-table",
    name: "Monthly Table",
  },
  {
    label: "field-segments",
    name: "Field Segments",
  },
  {
    label: "losses",
    name: "Losses",
  },
  {
    label: "our-team",
    name: "Our Team",
  },
  {
    label: "frequently-asked-questions",
    name: "Frequently Asked Questions",
  },
  {
    label: "bill-with-without-solar",
    name: "Bill With Without Solar",
  },
  {
    label: "environmental-impact",
    name: "Environmental Impact",
  },
  {
    label: "thank-you",
    name: "Thank You",
  },
];

export const reportPagesPlainListNonUs = reportPagesListNonUs.map(
  (page) => page.label
);

export const reportPagesListUs = [
  {
    label: "user-note",
    name: "User Note",
  },
  {
    label: "company-overview",
    name: "Company Overview",
  },
  {
    label: "our-team",
    name: "Our Team",
  },
  {
    label: "system-layout",
    name: "System Layout",
  },
  {
    label: "system-details",
    name: "System Details",
  },
  {
    label: "system-pricing",
    name: "System Pricing",
  },
  {
    label: "battery-storage",
    name: "Battery Storage",
  },
  {
    label: "estimated-annual-production",
    name: "Estimated Annual Production",
  },
  {
    label: "estimated-monthly-savings",
    name: "Estimated Monthly Savings",
  },
  {
    label: "shadow-analysis",
    name: "Site Evaluation",
  },
  {
    label: "pv-as-an-asset",
    name: "PV as an Asset",
  },
  {
    label: "cost-of-not-going-solar",
    name: "Cost of Not Going Solar",
  },
  {
    label: "warranties",
    name: "Warranties",
  },
  {
    label: "summary-and-approvals",
    name: "Summary and Approvals",
  },
  {
    label: "installation-roadmap",
    name: "Installation Roadmap",
  },
  {
    label: "frequently-asked-questions",
    name: "Frequently Asked Questions",
  },
  {
    label: "additional-information",
    name: "Additional Information",
  },
];

export const reportPagesPlainListUs = reportPagesListUs.map(
  (page) => page.label
);
