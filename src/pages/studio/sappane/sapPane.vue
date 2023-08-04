<template>
    <div id="sapPane">
        <div
            id="sapPaneSummary"
            class="navbarSummary">
            <sap-pane-summaries
                :summary-data="summaryData"/>
        </div>
        <div
            id="sapPaneAction"
            class="navbarAction">
            <sap-pane-actions
                :actions-data="actionsData"/>
        </div>
        <div
            id="sapPaneProp"
            class="navbarProperties">
            <sap-pane-properties
                :properties-data="propertiesData"
                :update-locked-parameter-flag="updateLockedParameterFlag"
                :update-getters-flag="updateGettersFlag" />
        </div>
    </div>
</template>

<script>

import SapPaneSummaries from './summary/summary.vue';
import SapPaneActions from './actions/actions.vue';
import SapPaneProperties from './properties/properties.vue';
import { serverBus } from '../../../main';
import { SET_SAP_PANE } from '../../../componentManager/componentManagerConstants';
import mutationTypes from '../../../store/modules/studio/modules/sapPane/mutationTypes';
import {mapState, mapActions} from 'pinia';
import { useStudioSapPaneStore } from '../../../stores/studio-sapPane';
const objectNames = ['HOME', 'MODEL', 'WALKWAY', 'SUBARRAY', 'TABLE', 'PANEL', 'STRING',
 'DIMENSION', 'TREE', 'SLD', 'CUSTOM IMAGE', 'INVERTER', 'ACDB', 'DCDB', 'GAZEBO','EWRACK',
 'SAFETYLINE', 'TEXTBOX', 'HANDRAIL', 'PROPERTY', 'ACCABLE', 'DCCABLE', 'INVERTERMENU', 'CONDUIT',
 'CABLETRAY', 'MICROINVERTER', 'SMARTROOFMODEL', 'SMARTROOFFACE', 'DORMER', 'COMBINERBOX'];

export default {
    name: 'SapPane',
    components: {
        SapPaneSummaries,
        SapPaneActions,
        SapPaneProperties,
    },
    data() {
        return {
            summaryData: {},
            actionsData: {},
            propertiesData: {},
            updateGettersFlag: 0,
            updateLockedParameterFlag: 0,
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
    },
    created() {
        serverBus.$on(
            SET_SAP_PANE,
            (
                objectName,
                summaryData,
                actionsData,
                propertiesData,
                creationMode = false,
                {
                    onlyUpdateGetters,
                    onlyUpdateLockedParameter,
                } = { onlyUpdateGetters: false, onlyUpdateLockedParameter: false },
            ) => {
                if (objectNames.includes(objectName)) {
                    this.setObjectName(objectName);
                    if (
                        (creationMode && !this.creationMode) ||
                        (!creationMode && this.creationMode)
                    ) {
                        this.setCreationMode(creationMode);
                    }
                    if (onlyUpdateGetters || onlyUpdateLockedParameter) {
                        if (onlyUpdateGetters) {
                            this.updateGettersFlag += 1;
                        }
                        if (onlyUpdateLockedParameter) {
                            this.updateLockedParameterFlag += 1;
                        }
                    }
                    else {
                        this.summaryData = summaryData !== undefined ? summaryData :
                            this.summaryData;
                        this.actionsData = actionsData !== undefined ? actionsData :
                            this.actionsData;
                        this.propertiesData =
                            propertiesData !== undefined ? propertiesData : this.propertiesData;
                        this.sapStyling(objectName);
                    }
                }
                else {
                    console.error('sapPane: OBJECT_NAME: Unidentified object name');
                }
            },
        );
    },
    mounted() {
        serverBus.$on(
            SET_SAP_PANE,
            (
                objectName,
                summaryData,
                actionsData,
                propertiesData,
                creationMode = false,
                {
                    onlyUpdateGetters,
                    onlyUpdateLockedParameter,
                } = { onlyUpdateGetters: false, onlyUpdateLockedParameter: false },
            ) => {
                if (objectNames.includes(objectName)) {
                    this.setObjectName(objectName);
                    if (
                        (creationMode && !this.creationMode) ||
                        (!creationMode && this.creationMode)
                    ) {
                        this.setCreationMode(creationMode);
                    }
                    if (onlyUpdateGetters || onlyUpdateLockedParameter) {
                        if (onlyUpdateGetters) {
                            this.updateGettersFlag += 1;
                        }
                        if (onlyUpdateLockedParameter) {
                            this.updateLockedParameterFlag += 1;
                        }
                    }
                    else {
                        this.summaryData = summaryData !== undefined ? summaryData :
                            this.summaryData;
                        this.actionsData = actionsData !== undefined ? actionsData :
                            this.actionsData;
                        this.propertiesData =
                            propertiesData !== undefined ? propertiesData : this.propertiesData;
                        this.sapStyling(objectName);
                    }
                }
                else {
                    console.error('sapPane: OBJECT_NAME: Unidentified object name');
                }
            },

        );
    },
    methods: {
        ...mapActions(useStudioSapPaneStore, {
            setObjectName: mutationTypes.SET_OBJECT_NAME,
            setCreationMode: mutationTypes.SET_CREATION_MODE,
        }),
        sapStyling(objectName) {
            const action = document.getElementById('sapPaneAction');
            const sapPanePropertiesElement = document.getElementById('sapPaneProp');
            const summ = document.getElementById('sapPaneSummary');
            if (objectName === 'HOME'
                || objectName === 'SLD' || objectName === 'INVERTERMENU' 
                || objectName === 'MICROINVERTER' || objectName === 'COMBINERBOX') {
                sapPanePropertiesElement.style.display = 'none';
                action.style.display = 'none';
                summ.style.height = '100%';
                summ.style.display = 'block';
            }
            else if (objectName === 'CUSTOM IMAGE') {
                sapPanePropertiesElement.style.height = '70%';
                sapPanePropertiesElement.style.display = 'block';
                action.style.display = 'none';
                summ.style.display = 'none';
            }
            else if (objectName === 'SAFETYLINE'
                || objectName === 'TEXTBOX'
                || objectName === 'HANDRAIL'
                || objectName === 'PROPERTY' ) {
                sapPanePropertiesElement.style.display = 'none';

                action.style.display = 'flex';
                summ.style.height = '25%';
            }
            else {
                sapPanePropertiesElement.style.display = 'block';
                sapPanePropertiesElement.style.height = '70%';

                action.style.display = 'flex';
                summ.style.height = '25%';
            }
        },
    },
};
</script>

<style scoped>
#sapPane {
    position: relative !important;
    height: 100% !important;
    width: 100% !important;
}

.navbarSummary {
    height: 100%;
    overflow-y: scroll;
    padding: 9% 1% 2.5% 4%;
    border-bottom: 1px solid black;
    box-sizing: border-box;
    margin-bottom: 5px;

}

.navbarSummary .vb-content {
    width: calc(100% - 9px) !important;
}

.navbarAction {
    border-bottom: 1px solid black;
    display: none;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-sizing: border-box;
}

.navbarProperties {
	padding: 9% 1% 2.5% 4%;
	height: fit-content !important;
    /* overflow-x: hidden; */
	box-sizing: border-box;
	display: none;
    padding-right: 10px;
}

.navbarProperties .vb-content {
    width: calc(100% - 9px) !important;
}

.propertiesFooter {
    height: 80%;
    overflow-x: hidden;
}

.summaryFooter {
    height: 0px;
    flex-grow: 1;
}


#sapPane .header_sap {
    display: block;
    color: #eaeaea;
    text-align: left;
    font-size: 0.84vw;
    text-decoration: none;
    width: 100%;
    padding-bottom: 4.5%;
}

/* Classes for scroller */

/* Bar width when rail is hovered */
.ps > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y {
    width: 6px;
}

/* Rail width in scrolling */
.ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail {
    opacity: 0.6;
    width: 6px;
    background-color: #d3d3d3;
}

/* Bar width while scrolling */
.ps:hover.ps--in-scrolling.ps--y > .ps__scrollbar-y-rail > .ps__scrollbar-y {
    width: 6px;
}

/* Over riding bar default right padding */
.ps > .ps__scrollbar-y-rail > .ps__scrollbar-y {
    right: 0;
}

.ps > .ps__scrollbar-y-rail:hover > .ps__scrollbar-y {
    width: 6px;
}

/* Controls for hovering on the rail */
.ps:hover > .ps__scrollbar-y-rail {
    width: 6px;
}

/* When rail is active but goes out of the div */
.ps > .ps__scrollbar-y-rail {
    width: 11px;
}
.sapPaneTitle {
    color: white;
    font-size: 12px;
    padding: 7px 7px 0 7px;
}
/* .intercom-lightweight-app-launcher {
    right: max(19.4% + 5px, 185px) !important;
    bottom: 20px !important;
}
.intercom-namespace .intercom-1gj2ivk {
    right: max(19.4% + 5px, 185px) !important;
    bottom: 20px !important;
} */
/* .navbarProperties {
    overflow-y: scroll;
} */
::-webkit-scrollbar {
    width: 7px !important;
}
::-webkit-scrollbar-thumb {
    border-radius: 4px !important;
    background-color: #cccccc !important;
    box-shadow: 0 0 1px rgba(255, 255, 255, .5) !important;
}

#sapPane >>> .vue-slider-component .vue-slider-tooltip {
    font-size: 13px !important;
    padding: 2px 3px !important;
}
</style>
