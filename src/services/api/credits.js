import axios from 'axios';

export default {

    FETCH_CREDIT_BALANCE() {
        return axios.get(`api/credits/`);
    },
    FETCH_CREDIT_CONVERSION_RATE() {
        return axios.get('/api/credits/conversion_rate/')
    },
    GET_CREDIT_TRANSACTION_HISTORY(all = false) {
        let allString = '?all=true'
        if (!all) { allString = '' }
        return axios.get(`/api/credit/history/${allString}`);
    },
    LOAD_MORE_CREDIT_USAGE(url) {
        return axios.get(url);
    }
}