import axios from 'axios';

export default {
    CREATE_PAYMENT_ORDER(paymentData) {
        return axios.post('api/payment/order/', paymentData);
    },

    VERIFY_PAYMENT_STATUS(statusData) {
        let queryString = new URLSearchParams(statusData).toString()
        return axios.get(`api/payment/order/status/?${queryString}`);
    }
}