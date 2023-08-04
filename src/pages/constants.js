export const QUOTA_TYPE = {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
};

export const USER_TIER = {
    BASIC: 'BASIC',
    LITE: 'LITE',
    TRIAL:'TRIAL',
    TRIAL_LITE: 'TRIAL_LITE',
    RESIDENTIAL : 'RESIDENTIAL',
    TEST_TRIAL_LITE : 'TEST_TRIAL_LITE',
    TEST_RESIDENTIAL : 'TEST_RESIDENTIAL',
    TEST_TRIAL: 'TEST_TRIAL',
    TEST_BASIC: 'TEST_BASIC',
    TEST_LITE : 'TEST_LITE',
    ENTERPRISE: 'ENTERPRISE',


}

export const PLANS_HAVING_SMALL_AND_MEDIUM = ['LITE','TRIAL_LITE','RESIDENTIAL','TEST_TRIAL_LITE','TEST_RESIDENTIAL','TEST_LITE']

export const exchangeRateTypes = {
    custom: 'custom',
    preset: 'preset',
};

export const TOOLTIP_CONTENT_BASIC_PLAN_DESC = 'Upgrade to Basic and design unlimited projects of any size.';
export const TOOLTIP_PROJECT_COUNT_DESC = 'Please note, once you create this design, project will be counted towards your quota.';
export const TOOLTIP_CONTENT_QUOTA_EXHAUSTED = 'You\'ve exhausted your monthly quota.';
export const TOOLTIP_PROJECT_SUMMARY_QUOTA_TYPE_MEDIUM_RADIO = 'Please note that you cannot change back to small once medium is selected.';

export const PLAN_UPGRADE_REQUEST_SUCCESS = 'Your request has been successfully recorded. Our team will contact you soon';
export const PVSYST_UPGRADE_REQUEST_SUCCESS = 'Your upgrade request for pvsyst export has been successfully recorded. Our team will contact you soon';
export const SKETCHUP_UPGRADE_REQUEST_SUCCESS = 'Your upgrade request for sketchup export has been successfully recorded. Our team will contact you soon';
export const COMMERCIAL_PLAN_UPGRADE_REQUEST_SUCCESS = 'Your upgrade request for commercial plan has been successfully recorded. Our team will contact you soon';
export const RESIDENTIAL_PLAN_UPGRADE_REQUEST_SUCCESS = 'Your upgrade request for residential plan has been successfully recorded. Our team will contact you soon';

export const BOQ_CATEGORIES = [{
    VALUE: 'DC Cable',
    LABEL: 'DC Cable',
}, {
    VALUE: 'AC Cable',
    LABEL: 'AC Cable',
}, {
    VALUE: 'ACDB',
    LABEL: 'ACDB',
}, {
    VALUE: 'DCDB',
    LABEL: 'DCDB',
}, {
    VALUE: 'LA',
    LABEL: 'LA',
}, {
    VALUE: 'Lifeline',
    LABEL: 'Lifeline',
}, {
    VALUE: 'Earthing Pit',
    LABEL: 'Earthing Pit',
}, {
    VALUE: 'Railings',
    LABEL: 'Railings',
}, {
    VALUE: 'Connectors',
    LABEL: 'Connectors',
}, {
    VALUE: 'Cable Conduits',
    LABEL: 'Cable Conduits',
}, {
    VALUE: 'Elbows',
    LABEL: 'Elbows',
}, {
    VALUE: 'Tees',
    LABEL: 'Tees',
}, {
    VALUE: 'Monitoring Solution',
    LABEL: 'Monitoring Solution',
}, {
    VALUE: 'Earthing Strip',
    LABEL: 'Earthing Strip',
}, {
    VALUE: 'Coupler',
    LABEL: 'Coupler',
}, {
    VALUE: 'Battery',
    LABEL: 'Battery',
}];

export const METERING_TYPES = {
    NET_METERING: 'Net metering',
    GROSS_METERING: 'Gross metering',
};
export const ERROR_MESSAGE_QUOTA_EXHAUSTED = 'Sorry, it seems like you have used all your allocated projects. Upgrade to Basic plan and design unlimited projects of any size.';
