import axios from 'axios';

export default {
    FETCH_COUNTRY_DETAILS() {
        // to retrieve the data of currency code, converion factor etc.
        return axios.get('/api/master-data/country/');
    },
};
