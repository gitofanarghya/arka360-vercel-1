import { USER_TIER, QUOTA_TYPE, PLANS_HAVING_SMALL_AND_MEDIUM } from '@/pages/constants';
// import defaults from './modules/defaults';
import API from '@/services/api/';
import { defineStore } from 'pinia'

export const useOrganisationStore = defineStore('organisation', {
    state: () => {
        return {
            allocatedQuotaDetails: {
                plan_id: 0,
                small_projects: 0,
                medium_projects: 0,
                large_projects: 0,
                number_of_seats: 1,
                start_date: null,
                end_date: null,
            },
            usedQuotaDetails: {
                small_used: 0,
                medium_used: 0,
                large_used: 0,
            },
            allAvailablePricingPlans: [],
            userTier: USER_TIER.BASIC,
            quotaType: QUOTA_TYPE.LARGE,
        }
    },
    getters: {
        GET_PROJECTS_QUOTA: state => ({
            small_projects: state.allocatedQuotaDetails.small_projects,
            medium_projects: state.allocatedQuotaDetails.medium_projects,
            large_projects: state.allocatedQuotaDetails.large_projects,
            end_date: state.allocatedQuotaDetails.end_date,
        }),
        GET_PROJECTS_USED: state => ({
            small_used: state.usedQuotaDetails.small_used,
            medium_used: state.usedQuotaDetails.medium_used,
            large_used: state.usedQuotaDetails.large_used,
        }),
        GET_USER_TIER: state => state.userTier,
        IS_PROJECT_QUOTA_EXHAUSTED: (state) => {
            let isProjectQuotaExhausted = true;
            if (PLANS_HAVING_SMALL_AND_MEDIUM.includes(state.userTier)) {
                if (state.usedQuotaDetails.small_used < state.allocatedQuotaDetails.small_projects
                    || state.usedQuotaDetails.medium_used < state.allocatedQuotaDetails.medium_projects) {
                    isProjectQuotaExhausted = false;
                }
            }
            else {
                // eslint-disable-next-line no-lonely-if
                if (state.usedQuotaDetails.large_used < state.allocatedQuotaDetails.large_projects) {
                    isProjectQuotaExhausted = false;
                }
            }
            return isProjectQuotaExhausted;
        },
        GET_TYPE_OF_PROJECT: state => state.quotaType,
        GET_AVAILABLE_PROJECT_SIZES: (state) => {
            const availableProjectSizes = {
                small: false,
                medium: false,
            };
            if (PLANS_HAVING_SMALL_AND_MEDIUM.includes(state.userTier)) {
                if (state.usedQuotaDetails.small_used < state.allocatedQuotaDetails.small_projects) {
                    availableProjectSizes.small = true;
                }
                if (state.usedQuotaDetails.medium_used < state.allocatedQuotaDetails.medium_projects) {
                    availableProjectSizes.medium = true;
                }
            }
            return availableProjectSizes;
        },
        GET_PRICING_PLANS_DETAILS: (state) => ({
            plan_id: state.allocatedQuotaDetails.plan_id,
            small_projects: state.allocatedQuotaDetails.small_projects,
            medium_projects: state.allocatedQuotaDetails.medium_projects,
            large_projects: state.allocatedQuotaDetails.large_projects,
            start_date: state.allocatedQuotaDetails.start_date,
            end_date: state.allocatedQuotaDetails.end_date,
            number_of_users: state.allocatedQuotaDetails.number_of_seats,
            allAvailablePricingPlans: state.allAvailablePricingPlans,
            small_used: state.usedQuotaDetails.small_used,
            medium_used: state.usedQuotaDetails.medium_used,
            large_used: state.usedQuotaDetails.large_used,
        })
    },
    actions: {
        async SET_QUOTA_DETAILS_AND_DEFAULT_VALUES() {
            await this.SET_ALLOCATED_QUOTA_DETAILS();
            this.SET_USER_TIER();
        },
        async SET_ALLOCATED_QUOTA_DETAILS() {
    
            let allocatedQuotaDetails = JSON.parse(localStorage.getItem('allocated-quota-details'));
            if(!allocatedQuotaDetails){
                const response = await API.ORGANISATION.FETCH_ALLOCATED_QUOTA();
                localStorage.setItem('allocated-quota-details', JSON.stringify(response.data));
                this.SET_ALLOCATED_QUOTA_DETAILS_IN_STORE(response.data.results[0]);
            }
            else{
                this.SET_ALLOCATED_QUOTA_DETAILS_IN_STORE(allocatedQuotaDetails.results[0]);
            }
            // const responseAllocatedQuota = await API.ORGANISATION.FETCH_ALLOCATED_QUOTA();
        },
        async SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE() {
            const responseUsedQuota = await API.ORGANISATION.FETCH_USED_QUOTA();
            this.SET_USED_QUOTA_DETAILS(responseUsedQuota.data.results[0]);
            this.SET_DEFAULT_QUOTA_TYPE();
        },
        async GET_ALL_AVAILABLE_PRICING_PLANS() {
            let allPricingPlans = JSON.parse(localStorage.getItem('all-available-pricing-plans'));
            if (!allPricingPlans) {
                const response = await API.ORGANISATION.FETCH_ALL_AVAILABLE_PRICING_PLANS();
                localStorage.setItem('all-available-pricing-plans', JSON.stringify(response.data));
                this.SET_ALL_AVAILABLE_PRICING_PLANS(response.data);
            } else {
                this.SET_ALL_AVAILABLE_PRICING_PLANS(allPricingPlans);
            }
        },

        SET_ALLOCATED_QUOTA_DETAILS_IN_STORE(payload) {
            if (payload) {
                this.allocatedQuotaDetails.plan_id = payload.plan_id;
                this.allocatedQuotaDetails.small_projects = payload.small_projects;
                this.allocatedQuotaDetails.medium_projects = payload.medium_projects;
                this.allocatedQuotaDetails.large_projects = payload.large_projects;
                this.allocatedQuotaDetails.number_of_seats = payload.number_of_seats;
                this.allocatedQuotaDetails.start_date = payload.start_date;
                this.allocatedQuotaDetails.end_date = payload.end_date;
            }
        },
        SET_USED_QUOTA_DETAILS(payload) {
            this.usedQuotaDetails.small_used = payload.small_used;
            this.usedQuotaDetails.medium_used = payload.medium_used;
            this.usedQuotaDetails.large_used = payload.large_used;
        },
        SET_USER_TIER() {
            let mappingOfUserTiers = {
                'lite': 'LITE',
                'trial': 'TRIAL',
                'trial lite': 'TRIAL_LITE',
                'residential' : 'RESIDENTIAL',
                'basic': 'BASIC',
                'test_trial_lite' : 'TEST_TRIAL_LITE',
                'test_residential': 'TEST_RESIDENTIAL',
                'test_trial' : 'TEST_TRIAL',
                'test_basic' : 'TEST_BASIC',
                'test_lite' : 'TEST_LITE' ,
                'enterprise': 'ENTERPRISE'
            }
            let allocatedPlan = this.allAvailablePricingPlans.find(plan => plan.id == this.allocatedQuotaDetails.plan_id)

            let allocatedPlanNameInLowerCase = allocatedPlan?.Name.toLowerCase();
            this.userTier = USER_TIER[mappingOfUserTiers[allocatedPlanNameInLowerCase]];
            console.log("user tier is",this.userTier);
            // if (allocatedPlan.Name.toLowerCase() == 'lite') {
            //     this.userTier = USER_TIER.LITE;
            // }
            // else if(allocatedPlan.Name.toLowerCase()=='trial lite'){
            //     this.userTier = USER_TIER.TRIAL_LITE
            // }
            // else if(allocatedPlan.Name.toLowerCase()=='residential'){
            //     this.userTier = USER_TIER.RESIDENTIAL;
            // }
            // else {
            //     this.userTier = USER_TIER.BASIC;
            // }
        },
        SET_DEFAULT_QUOTA_TYPE() {
            if(PLANS_HAVING_SMALL_AND_MEDIUM.includes(this.userTier)){
                this.quotaType = QUOTA_TYPE.SMALL;
            }
            else
            this.quotaType = QUOTA_TYPE.LARGE;
            // if (this.userTier === USER_TIER.BASIC) {
            //     this.quotaType = QUOTA_TYPE.LARGE;
            // }
            // else {
            //     // eslint-disable-next-line no-lonely-if
            //     if (this.usedQuotaDetails.small_used < this.allocatedQuotaDetails.small_projects) {
            //         this.quotaType = QUOTA_TYPE.SMALL;
            //     }
            //     else if (this.usedQuotaDetails.medium_used < this.allocatedQuotaDetails.medium_projects) {
            //         this.quotaType = QUOTA_TYPE.MEDIUM;
            //     }
            //     else this.quotaType = QUOTA_TYPE.SMALL;
            // }
        },
        SET_QUOTA_TYPE(payload) {
            this.quotaType = payload;
        },
        SET_ALL_AVAILABLE_PRICING_PLANS(payload) {
            this.allAvailablePricingPlans = payload;
        }
    }
});