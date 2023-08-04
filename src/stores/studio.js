import API from '@/services/api/';
import { defineStore } from 'pinia'
import { useStudioStageStore } from "./studio-stage"
import { useStudioSideBarStore } from "./studio-sideBar"
import { useStudioTextTopBarStore } from "./studio-topBar"
import { useStudioSapPaneStore } from "./studio-sapPane"
import { useStudioTextToolBarStore } from "./studio-textToolBar"
import { useStudioSuggestionBarStore } from "./studio-suggestionBar"
import { useStudioStatusBarStore } from "./studio-statusBar"
import { useMapImagesStore } from './mapImages';

function getInitialState() {
    return {
        solarAccess: {
            loading: false,
        },
        sunSimulation: {
            enabled: false,
            sliderTime:
                Date.now() - (parseInt(Date.now() / 24 / 60 / 60 / 1000, 10) * 24 * 60 * 60 * 1000),
            pickerTime:
                Date.now() - (parseInt(Date.now() / 24 / 60 / 60 / 1000, 10) * 24 * 60 * 60 * 1000),
            sliderDate: parseInt(Date.now() / 24 / 60 / 60 / 1000, 10) * 24 * 60 * 60 * 1000,
            pickerDate: parseInt(Date.now() / 24 / 60 / 60 / 1000, 10) * 24 * 60 * 60 * 1000,
            dayRunning: false,
            yearRunning: false,
            timer: null,
        },
        lidarSwitchEnabled:false,
        isGoogle3dSwitchEnabled: false,
        isFitToTilesEnabled: false,
        generationData: {
            intervalId: null,
            lastUpdated: 0,
            annualGeneration: 0,
            specificGeneration: 0,
            performanceRatio: 0,
            offset:0,
            lossData: {
                energy: {},
                losses: {},
            },
        },
    };
}

export const useStudioStore = defineStore('studio', {
    state: () => getInitialState(),
    getters: {
        GET_CURRENT_GENERATION: (state) => {
            return state.generationData;
        },
    },
    actions: {
        // RESET_STATE({ commit }) {
        //     // TODO: Convert to pinia
        //     commit('RESET_STATE');
        //     commit('sapPane/RESET_STATE');
        //     commit('sideBar/RESET_STATE');
        //     commit('stage/RESET_STATE');
        //     commit('suggestionBar/RESET_STATE');
        //     commit('topBar/RESET_STATE');
        //     commit('statusBar/RESET_STATE');
        //     commit('textToolBar/RESET_STATE');
            
        // },
        async FETCH_GENERATION(designId) {
            try {
                const response =
                    await API.UTILS.FETCH_GENERATION_NUMBERS(designId);
                this.UPDATE_GENERATION_DATA(response);
            }
            catch (error) {
                throw error;
            }
        },
        async FETCH_PROBABILITY(designId) {
            try {
                const response =
                    await API.UTILS.FETCH_PROBABILITY(designId);
                return response;
            }
            catch (error) {
                throw error;
            }
        },

        RESET_STATE() {
            Object.assign(this, getInitialState());
            useStudioStageStore().$reset()
            useStudioSideBarStore().$reset()
            useStudioTextTopBarStore().$reset()
            useStudioSapPaneStore().$reset()
            useStudioTextToolBarStore().$reset()
            useStudioSuggestionBarStore().$reset()
            useStudioStatusBarStore().$reset()
            useMapImagesStore().$reset();
        },
        SOLAR_ACCESS_LOADING(loading) {
            this.solarAccess.loading = loading;
        },
        SET_GOOGLE3D_STATUS(enable) {
            this.isGoogle3dSwitchEnabled = enable;
        },
        SET_FITGOOGLE3D_STATUS(enable) {
            this.isFitToTilesEnabled = enable;
        },
        SET_LIDAR_STATUS(enabled) {
            if(!this.lidarSwitchEnabled && !this.sunSimulation.enabled ){
                this.lidarSwitchEnabled = enabled;
            }
            //when lidar false and sun simulation is true
            else if(!this.lidarSwitchEnabled && this.sunSimulation.enabled){
                this.lidarSwitchEnabled = enabled;
                this.sunSimulation.enabled = !enabled;
            }
            //when lidar is true and sun simulation is false
            else if(this.lidarSwitchEnabled && !this.sunSimulation.enabled){
                this.lidarSwitchEnabled = enabled;
                // this.sunSimulation.enabled = !enabled;
            }
        },
        SET_SUN_SIMULATION_STATUS(enabled) {
            if(!this.lidarSwitchEnabled && !this.sunSimulation.enabled ){
                this.sunSimulation.enabled = enabled;
            }
             //when lidar false and sun simulation is true
             else if(!this.lidarSwitchEnabled && this.sunSimulation.enabled){
                // this.lidarSwitchEnabled = !enabled;
                this.sunSimulation.enabled = enabled;
            }
            //when lidar is true and sun simulation is false
            else if(this.lidarSwitchEnabled && !this.sunSimulation.enabled){
                this.lidarSwitchEnabled = !enabled;
                this.sunSimulation.enabled = enabled;
            }
        },
        SET_SLIDER_TIME(sliderTime) {
            this.sunSimulation.sliderTime = sliderTime;
        },
        SET_PICKER_TIME(pickerTime) {
            this.sunSimulation.pickerTime = pickerTime;
        },
        SET_SLIDER_DATE(sliderDate) {
            this.sunSimulation.sliderDate = sliderDate;
        },
        SET_PICKER_DATE(pickerDate) {
            this.sunSimulation.pickerDate = pickerDate;
        },
        SET_DAY_RUNNING(dayRunning) {
            this.sunSimulation.dayRunning = dayRunning;
        },
        SET_YEAR_RUNNING(yearRunning) {
            this.sunSimulation.yearRunning = yearRunning;
        },
        SET_TIMER(timer) {
            this.sunSimulation.timer = timer;
        },
        UPDATE_GENERATION_DATA(response) {
            this.generationData.annualGeneration =
                response.data.monthly.ac.reduce((a, b) => a + b, 0) / 1000;
            this.generationData.specificGeneration =
                response.data.monthly.specific_generation.reduce((a, b) => a + b, 0);
            this.generationData.performanceRatio =
                response.data.monthly.pr.reduce((a, b) => a + b, 0) / 12;
            this.generationData.lossData.losses = response.data.losses;
            this.generationData.lossData.energy = response.data.energy;
            this.generationData.offset = response.data.offset;
            if (this.generationData.intervalId !== null) {
                clearInterval(this.generationData.intervalId);
            }
            this.generationData.lastUpdated = 0;
            this.generationData.intervalId = setInterval(() => {
                this.generationData.lastUpdated += 1;
            }, 60000);
        },
        UPDATE_PROBABILITY_DATA(response) {
            this.probabilty_distribution = response

        }
    },
});