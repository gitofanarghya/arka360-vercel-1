import API from '@/services/api/';
// this is for miscellaneous Stuffs which doesn't belong to any important category
export default {
    namespaced: true,
    state: {
        workingDays: null,
        googleMapsState: {
            address: "",
            coordinates: {},
            isLoadingAddressFromMarker: false,
            state:'',
            countryCode:'IN',
            isAddressChosenByInput: false
        }
    },
    mutations: {
        SET_WORKING_DAYS(state, noOfWorkingDays) {
            state.workingDays = noOfWorkingDays;
        },
        SET_GOOGLE_MAPS_STATE(state, data) {
            Object.keys(data).forEach(key => {
                state.googleMapsState[key] = data[key];
            })
        },
        SET_COUNTRY_CODE(state,countryCode){
            state.googleMapsState.countryCode = countryCode;
        }
    },
    actions: {
        UPDATE_WORKING_DAYS({ commit }, noOfWorkingDays) {
            commit('SET_WORKING_DAYS', noOfWorkingDays);
        },
        UPDATE_GOOGLE_MAPS_STATE({ commit }, data) {
            commit('SET_GOOGLE_MAPS_STATE', data);
        },
        INITIALIZE_COUNTRY_CODE({commit}, countryCode){
            commit('SET_COUNTRY_CODE',countryCode);
        }
    },
    getters: {
        GET_WORKING_DAYS: state => state.workingDays,
        GET_GOOGLE_MAPS_STATE: state => state.googleMapsState,
    },

}