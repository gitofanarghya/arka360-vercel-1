import symbols from "../../pages/currency-symbol-name-map";

function getCurrencySymbol(countryCode) {
  console.log(countryCode);
  return symbols[countryCode];
}

function getLocaleAbbreviations(country, amount, isLabel, isNotRounded) {
  //isLabel - get rounded values upto 1 decimal point
  //isNotRounded - get unrounded value upto 1 decimal point
  let options = {};
  if (isLabel) {
    options = {
      notation: "compact",
      compactDisplay: "short",
    };
  } else if (isNotRounded) {
    if (amount > 999) {
      options = {
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      };
    } else {
      options = {
        notation: "compact",
        compactDisplay: "short",
      };
    }
  } else {
    options = {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    };
  }
  let result;
  if (country === "INR" && amount < 99950) {
    result = new Intl.NumberFormat("en-US", {
      ...options,
    }).format(amount);
  } else {
    country = separateFirstTwo(country);
    result = new Intl.NumberFormat(COUNTRY_LOCALES[country], {
      ...options,
    }).format(amount);
  }

  if (result.toString().split(".")[1]) {
    if (isNotRounded) {
      return formatGrand(getOneDigitAfterDecimalAndNonNumeric(result));
    }
  }
  return formatGrand(result);
}

function formatGrand(str) {
  str = str.toString();
  if (str.charAt(str.length - 1) === "K") {
    str = str.split("");
    str[str.length - 1] = "k";
    return str.join("");
  }
  return str;
}

//returns with currency symbol
function getFormattedCurrencyComas(country, amount) {
  let currencyCode = country;
  country = separateFirstTwo(country);
  let result = new Intl.NumberFormat(COUNTRY_LOCALES[country], {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount);
  if (result.toString().split(".")[1]) {
    return getOneDigitAfterDecimal(result);
  }
  return result;
}

//returns without currency symbol
function getFormattedComas(country, amount) {
  country = separateFirstTwo(country);
  return new Intl.NumberFormat(COUNTRY_LOCALES[country], {
    minimumFractionDigits: 0,
  }).format(amount);
}

function getFormattedComasWithDecimal(country, amount, num) {
  country = separateFirstTwo(country);
  return new Intl.NumberFormat(COUNTRY_LOCALES[country], {
    minimumFractionDigits: num,
  }).format(amount);
}

function getFormattedNumberWithCurrency(num, isDecimal) {
  console.log(num, isDecimal);
  const newNum = num.split(".")[0];
  console.log(newNum);
  // num = num.toFixed(2);
  // let cc = this.countryCode
  //   ? getCurrencySymbol(this.countryCode.currency_code)
  //   : "USD";
  let formattedFirst = getFormattedComas("USD", newNum);

  let isDot = formattedFirst.toString().includes(".");

  if (!isDot && isDecimal) return formattedFirst;
  return formattedFirst;
}

function separateFirstTwo(country) {
  if (country.length > 2) {
    country = country.split("");
    country.pop();
    country = country.join("").toUpperCase();
  }
  return country;
}
function getOneDigitAfterDecimalAndNonNumeric(str) {
  const match1 = str.match(/\.(\d)[^\d]*/);
  const match2 = str.match(/\.(\d+)(\D*)$/);
  if (match1 && match2) {
    const digitAfterDecimal = match1[1];
    const nonNumericCharacters = match2[2];
    let digitBeforeDecimal = str.split(".")[0];
    if (digitAfterDecimal === "0") {
      return `${digitBeforeDecimal}${nonNumericCharacters}`;
    }
    return `${digitBeforeDecimal}.${digitAfterDecimal}${nonNumericCharacters}`;
  }
  return null;
}
function getOneDigitAfterDecimal(str) {
  const match1 = str.match(/\.(\d)[^\d]*/);
  if (match1) {
    const digitAfterDecimal = match1[1];
    let digitBeforeDecimal = str.split(".")[0];
    if (digitAfterDecimal === "0") {
      return `${digitBeforeDecimal}`;
    }
    return `${digitBeforeDecimal}.${digitAfterDecimal}`;
  }
  return null;
}
export {
  getCurrencySymbol,
  getLocaleAbbreviations,
  getFormattedComas,
  getFormattedCurrencyComas,
  getFormattedNumberWithCurrency,
  getFormattedComasWithDecimal,
};

const COUNTRY_LOCALES = {
  AF: "ps-AF", // Afghanistan
  AL: "sq-AL", // Albania
  DZ: "ar-DZ", // Algeria
  AS: "en-US", // American Samoa
  AD: "ca-AD", // Andorra
  AO: "pt-AO", // Angola
  AI: "en-AI", // Anguilla
  AQ: "en-US", // Antarctica
  AG: "en-AG", // Antigua and Barbuda
  AR: "es-AR", // Argentina
  AM: "hy-AM", // Armenia
  AW: "nl-AW", // Aruba
  AU: "en-AU", // Australia
  AT: "de-AT", // Austria
  AZ: "az-AZ", // Azerbaijan
  BS: "en-BS", // Bahamas
  BH: "ar-BH", // Bahrain
  BD: "bn-BD", // Bangladesh
  BB: "en-BB", // Barbados
  BY: "be-BY", // Belarus
  BE: "nl-BE", // Belgium
  BZ: "en-BZ", // Belize
  BJ: "fr-BJ", // Benin
  BM: "en-BM", // Bermuda
  BT: "dz-BT", // Bhutan
  BO: "es-BO", // Bolivia
  BQ: "nl-BQ", // Bonaire, Sint Eustatius and Saba
  BA: "bs-BA", // Bosnia and Herzegovina
  BW: "en-BW", // Botswana
  BR: "pt-BR", // Brazil
  BN: "ms-BN", // Brunei Darussalam
  BG: "bg-BG", // Bulgaria
  BF: "fr-BF", // Burkina Faso
  BI: "fr-BI", // Burundi
  CV: "pt-CV", // Cabo Verde
  KH: "km-KH", // Cambodia
  CM: "fr-CM", // Cameroon
  CA: "en-CA", // Canada
  KY: "en-KY", // Cayman Islands
  CF: "fr-CF", // Central African Republic
  TD: "fr-TD", // Chad
  CL: "es-CL", // Chile
  CN: "zh-CN", // China
  CO: "es-CO", // Colombia
  KM: "ar-KM", // Comoros
  CG: "fr-CG", // Congo
  CK: "en-CK", // Cook Islands
  CR: "es-CR", // Costa Rica
  HR: "hr-HR", // Croatia
  CU: "es-CU", // Cuba
  CW: "nl-CW", // Curaçao
  CY: "el-CY", // Cyprus
  CZ: "cs-CZ", // Czech Republic
  DK: "da-DK", // Denmark
  DJ: "fr-DJ", // Djibouti
  DM: "en-DM", // Dominica
  DO: "es-DO", // Dominican Republic
  EC: "es-EC", // Ecuador
  EG: "ar-EG", // Egypt
  SV: "es-SV", // El Salvador
  GQ: "es-GQ", // Equatorial Guinea
  ER: "ti-ER", // Eritrea
  EE: "et-EE", // Estonia
  ET: "am-ET", // Ethiopia
  FO: "fo-FO", // Faroe Islands
  FJ: "en-FJ", // Fiji
  FI: "fi-FI", // Finland
  FR: "fr-FR", // France
  PF: "fr-PF", // French Polynesia
  GA: "fr-GA", // Gabon
  GM: "en-GM", // Gambia
  GE: "ka-GE", // Georgia
  DE: "de-DE", // Germany
  GH: "en-GH", // Ghana
  GI: "en-GI", // Gibraltar
  GR: "el-GR", // Greece
  GL: "kl-GL", // Greenland
  GD: "en-GD", // Grenada
  GU: "en-US", // Guam
  GT: "es-GT", // Guatemala
  GG: "en-GB", // Guernsey
  GN: "fr-GN", // Guinea
  GW: "pt-GW", // Guinea-Bissau
  GY: "en-GY", // Guyana
  HT: "ht-HT", // Haiti
  HN: "es-HN", // Honduras
  HK: "zh-HK", // Hong Kong
  HU: "hu-HU", // Hungary
  IS: "is-IS", // Iceland
  IN: "en-IN", // India
  ID: "id-ID", // Indonesia
  IR: "fa-IR", // Iran
  IQ: "ar-IQ", // Iraq
  IE: "en-IE", // Ireland
  IM: "en-GB", // Isle of Man
  IL: "he-IL", // Israel
  IT: "it-IT", // Italy
  JM: "en-JM", // Jamaica
  JP: "ja-JP", // Japan
  JE: "en-GB", // Jersey
  JO: "ar-JO", // Jordan
  KZ: "kk-KZ", // Kazakhstan
  KE: "sw-KE", // Kenya
  KI: "en-KI", // Kiribati
  KP: "ko-KP", // Korea (Democratic People's Republic of)
  KR: "ko-KR", // Korea (Republic of)
  KW: "ar-KW", // Kuwait
  KG: "ky-KG", // Kyrgyzstan
  LA: "lo-LA", // Lao People's Democratic Republic
  LV: "lv-LV", // Latvia
  LB: "ar-LB", // Lebanon
  LS: "en-LS", // Lesotho
  LR: "en-LR", // Liberia
  LY: "ar-LY", // Libya
  LI: "de-LI", // Liechtenstein
  LT: "lt-LT", // Lithuania
  LU: "fr-LU", // Luxembourg
  MO: "zh-MO", // Macao
  MG: "mg-MG", // Madagascar
  MW: "ny-MW", // Malawi
  MY: "ms-MY", // Malaysia
  MV: "dv-MV", // Maldives
  ML: "fr-ML", // Mali
  MT: "mt-MT", // Malta
  MH: "en-MH", // Marshall Islands
  MR: "ar-MR", // Mauritania
  MU: "en-MU", // Mauritius
  YT: "fr-YT", // Mayotte
  MX: "es-MX", // Mexico
  FM: "en-FM", // Micronesia (Federated States of)
  MD: "ro-MD", // Moldova
  MC: "fr-MC", // Monaco
  MN: "mn-MN", // Mongolia
  ME: "sr-ME", // Montenegro
  MS: "en-MS", // Montserrat
  MA: "ar-MA", // Morocco
  MZ: "pt-MZ", // Mozambique
  MM: "my-MM", // Myanmar
  NA: "en-NA", // Namibia
  NR: "en-NR", // Nauru
  NP: "ne-NP", // Nepal
  NL: "nl-NL", // Netherlands
  NC: "fr-NC", // New Caledonia
  NZ: "en-NZ", // New Zealand
  NI: "es-NI", // Nicaragua
  NE: "fr-NE", // Niger
  NG: "en-NG", // Nigeria
  NU: "en-NU", // Niue
  MP: "en-MP", // Northern Mariana Islands
  NO: "nb-NO", // Norway
  OM: "ar-OM", // Oman
  PK: "ur-PK", // Pakistan
  PW: "en-PW", // Palau
  PS: "ar-PS", // Palestine, State of
  PA: "es-PA", // Panama
  PG: "en-PG", // Papua New Guinea
  PY: "es-PY", // Paraguay
  PE: "es-PE", // Peru
  PH: "fil-PH", // Philippines
  PN: "en-PN", // Pitcairn
  PL: "pl-PL", // Poland
  PT: "pt-PT", // Portugal
  PR: "es-PR", // Puerto Rico
  QA: "ar-QA", // Qatar
  RO: "ro-RO", // Romania
  RU: "ru-RU", // Russian Federation
  RW: "rw-RW", // Rwanda
  SH: "en-SH", // Saint Helena, Ascension and Tristan da Cunha
  KN: "en-KN", // Saint Kitts and Nevis
  LC: "en-LC", // Saint Lucia
  MF: "fr-MF", // Saint Martin (French part)
  PM: "fr-PM", // Saint Pierre and Miquelon
  VC: "en-VC", // Saint Vincent and the Grenadines
  WS: "en-WS", // Samoa
  SM: "it-SM", // San Marino
  ST: "pt-ST", // Sao Tome and Principe
  SA: "ar-SA", // Saudi Arabia
  SN: "fr-SN", // Senegal
  RS: "sr-RS", // Serbia
  SC: "fr-SC", // Seychelles
  SL: "en-SL", // Sierra Leone
  SG: "en-SG", // Singapore
  SX: "nl-SX", // Sint Maarten (Dutch part)
  SK: "sk-SK", // Slovakia
  SI: "sl-SI", // Slovenia
  SB: "en-SB", // Solomon Islands
  SO: "so-SO", // Somalia
  ZA: "en-ZA", // South Africa
  SS: "en-SS", // South Sudan
  ES: "es-ES", // Spain
  LK: "si-LK", // Sri Lanka
  SD: "ar-SD", // Sudan
  SR: "nl-SR", // Suriname
  SZ: "en-SZ", // Eswatini
  SE: "sv-SE", // Sweden
  CH: "de-CH", // Switzerland
  SY: "ar-SY", // Syrian Arab Republic
  TW: "zh-TW", // Taiwan
  TJ: "tg-TJ", // Tajikistan
  TZ: "sw-TZ", // Tanzania
  TH: "th-TH", // Thailand
  TL: "pt-TL", // Timor-Leste
  TG: "fr-TG", // Togo
  TK: "tk-TK", // Tokelau
  TO: "en-TO", // Tonga
  TT: "en-TT", // Trinidad and Tobago
  TN: "ar-TN", // Tunisia
  TR: "tr-TR", // Turkey
  TM: "tk-TM", // Turkmenistan
  TC: "en-TC", // Turks and Caicos Islands
  TV: "en-TV", // Tuvalu
  UG: "en-UG", // Uganda
  UA: "uk-UA", // Ukraine
  AE: "ar-AE", // United Arab Emirates
  GB: "en-GB", // United Kingdom of Great Britain and Northern Ireland
  US: "en-US", // United States of America
  UM: "en-US", // United States Minor Outlying Islands
  UY: "es-UY", // Uruguay
  UZ: "uz-UZ", // Uzbekistan
  VU: "bi-VU", // Vanuatu
  VE: "es-VE", // Venezuela
  VN: "vi-VN", // Vietnam
  VG: "en-VG", // Virgin Islands (British)
  VI: "en-VI", // Virgin Islands (U.S.)
  WF: "fr-WF", // Wallis and Futuna
  EH: "ar-EH", // Western Sahara
  YE: "ar-YE", // Yemen
  ZM: "en-ZM", // Zambia
  ZW: "sn-ZW", // Zimbabwe
};
