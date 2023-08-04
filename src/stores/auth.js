import { defineStore } from 'pinia'
import API from '@/services/api/';
import { COOKIE_IDENTIFIER_FOR_ARKA } from '../constants';
import { initializeStore } from "../utils";
import { fetchOrganisationDetails, eraseCookie } from '../utils'
import { useCreditsStore } from './credits';

// #ArkaLoginFlow
function clearArkaLoginInfo() {
    // TODO: Cookies are no longer used. So cookie related code can be removed
    let isOnLocal = location.hostname.includes('localhost')
    let domain = 'thesolarlabs.com'
    if (isOnLocal) { domain = 'localhost' }
    eraseCookie({ name: `tsl${COOKIE_IDENTIFIER_FOR_ARKA}`, domain })
    eraseCookie({ name: `arka${COOKIE_IDENTIFIER_FOR_ARKA}`, domain })
    localStorage.removeItem('sidebar_items')
    localStorage.removeItem('arka')
    localStorage.removeItem('360_ENV_TYPE')
    localStorage.removeItem('360_ORG_SETTINGS')
    localStorage.removeItem('360_ACL')
    localStorage.removeItem('env')
}

function clearImpLocalStorageInfoOnLogoutOrReset(){
    localStorage.removeItem('user');
    localStorage.removeItem('organisation');
    localStorage.removeItem('allServicesInfo');
    localStorage.removeItem('all_country_details');
    localStorage.removeItem('allocated-quota-details');
    localStorage.removeItem('all-available-pricing-plans');
}

export const useAuthStore = defineStore('auth', {
    state: () => {
        return {
            status: '',
            token: localStorage.getItem('token') || '',
            user: {},
        }
    },
    getters: {},
    actions: {
        async LOGIN(userCredentials) {
            this.status = 'loading';
            try {
                let response = await API.USERS.LOGIN(userCredentials);
                // for already login session of the users
                if (response.data.status === 302) {
                    return {
                        'status': response.data.status,
                        'message': response.data.message,
                        'token' : response.data.token
                    }
                }
                const user = response.data;
                if (!user.is_verified) {
                    return {
                        'status': response.data.status,
                        'is_verified': false,
                        'token': response.data.token,
                        'jwt_encoded_data': response.data.jwt_encoded_data
                    }
                }
                    
                if (user.country == 52)
                    user.isUSFlagEnabled=true;
                else
                    user.isUSFlagEnabled=false;  

                localStorage.setItem('user', JSON.stringify(user));
                this.status = 'success';
                this.token = user.token;
                this.user = user;

                // Initializing services
                API.SET_TOKEN_HEADER(user.token);

                initializeStore();
                await fetchOrganisationDetails();
                await this.assignAllServicesInfo();
                return {
                    'status': response.data.status, 
                    'is_verified': true,
                    'token': response.data.token,
                    'jwt_encoded_data': response.data.jwt_encoded_data
                }
            }
            catch (e) {
                this.status = 'error';
                throw e;
            }
        },
        async  assignAllServicesInfo(){
            if(!JSON.parse(localStorage.getItem('allServicesInfo'))){
                try{
                    let response = await API.DASHBOARD_INFO.FETCH_ALL_SERVICES_INFO();
                    localStorage.setItem('allServicesInfo',JSON.stringify(response.data));
                }
                catch(e){
                    this.status = 'error';
                    throw e;
                }
              }
        },
        async LOGOUT() {
            this.AUTH_LOGOUT()
            clearImpLocalStorageInfoOnLogoutOrReset();
            useCreditsStore().UPDATE_CREDIT_BALANCE({ purchased_credits: 0, promotional_credits: 0 })
            clearArkaLoginInfo()
        },
        
        async LOGOUTSESSION() {
            this.AUTH_LOGOUT()
            if (JSON.parse(localStorage.getItem('user'))) {
                await API.USERS.LOGOUTSESSION(JSON.parse(localStorage.getItem('user')));
            }
            clearImpLocalStorageInfoOnLogoutOrReset();
            clearArkaLoginInfo()
        },

        RESET() {
            this.AUTH_LOGOUT()
            clearImpLocalStorageInfoOnLogoutOrReset();
            clearArkaLoginInfo()
        },

        async PLAN_PAYMENT_LINK(selectedPlan) {
            try {
                const response = await API.USERS.PLAN_PAYMENT_LINK(selectedPlan);
                return response.data;
            }
            catch(e) {
                throw e;
            }
        },

        AUTH_LOGOUT() {
            this.status = '';
            this.token = '';
            this.user = {};
        },
    }
})
