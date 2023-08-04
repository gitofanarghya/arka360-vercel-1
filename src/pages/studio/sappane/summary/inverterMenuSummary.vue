<template>
    <div
        id="inverterMenuSummary"
        style="overflow: hidden; margin: 0px">
        <div style="padding-bottom: 5px">
            <div
                class="center-space-between-alignment"
                style="width: 100%; padding-bottom: 5px"
            >
                <div
                    class="sappane-label"
                    style="padding-bottom: 0; flex-shrink: 0; width: 85%">
                    Show Inverter in 3D Design
                </div>
                <div style="width: 15%">
                    <el-switch
                        v-model="summaryData.showInverterIn3D"
                        active-color="#3498db"
                        class="sappane-switch"
                        @change = "toggleCall"
                    />
                </div>
            </div>
        </div>
        <p class="sappane-label"> Inverter Quantity  <span class="sappane-value"> {{  }}</span></p>
        <div
            v-show=" Object.keys(selectedStringInverter).length == 0 && Object.keys(selectedCentralInverter).length == 0"
            class = "sappane-label" >
            <hr>
            <div class="sappane-label inverters-sappane-labels"  @click="handleCollapsable('1')">
                <div>MICRO INVERTERS ({{microInverterCount()}})</div>
                <div v-if="dropClose == 1"><img :src="dropdownArrowUp" width="20px" height="20px" /></div>
                <div v-else><img :src="dropdownArrowDown" width="20px" height="20px" /></div>
            </div>
            <div class = "hidden" id="1">
                <div style="padding: 5px; padding-top: 10px; padding-bottom: 15px">
                <div class="addInverterClass">
                <infinite-scroll-dropdown-inverter
                    :inverter.sync="selectedMicroInverter"
                    inverter-type="microInverter"
                    theme="darkDropdownWithFilters"
                    action="addMicroInverter"
                />
                </div>
                </div>
                <div class='inverter_scroll'>
                <div
                    v-for="inverter in summaryData.microInverters"
                    :key="inverter.id"
                    class="inverterSelection"
                >
                    <p style="padding-top: 5px">{{ inverter.name }} ({{inverter.microInverterCount}})</p>
                    <input
                        id="inverter_delete"
                        type="checkbox"
                        width="20px"
                        height="20px"
                        style="float: right"
                        @click="addInverterForDeletion(inverter)"
                    >
                    <div
                        style="margin-top: 7px"
                        @click="inverterSelected(inverter)">
                        <h4>{{ inverter.Manufacturer }}</h4>
                        <p style="margin-top: 5px">
                            {{ inverter.Make }}
                        </p>
                        <p style="margin-top: 5px; margin-bottom: 7px">
                            Size: {{ inverter.Size }}kW
                        </p>
                        <p style="margin-top: 5px; margin-bottom: 7px">
                            Module Count: {{ inverter.panelCount }}
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div
            v-show=" Object.keys(selectedMicroInverter).length == 0 && Object.keys(selectedCentralInverter).length == 0"
            class = "sappane-label">
            <hr>
            <div class="sappane-label inverters-sappane-labels"  @click="handleCollapsable('2')">
                <div>STRING INVERTERS ({{summaryData.stringInverters.length}})</div>
                <div v-if="dropClose == 2"><img :src="dropdownArrowUp" width="20px" height="20px" /></div>
                <div v-else><img :src="dropdownArrowDown" width="20px" height="20px" /></div>
            </div>
            <div class = "hidden" id="2">
                <div style="padding: 5px; padding-top: 10px; padding-bottom: 15px">
                <div class="addInverterClass">
                <infinite-scroll-dropdown-inverter
                    :inverter.sync="selectedStringInverter"
                    inverter-type="stringInverter"
                    theme="darkDropdownWithFilters"
                    action="addInverter"
                />
                </div>
                </div>
                <div class='inverter_scroll'>
                    <div
                        v-for="inverter in summaryData.stringInverters"
                        :key="inverter.id"
                        class="inverterSelection"
                    >
                        <p style="padding-top: 5px">{{ inverter.name }}</p>
                        <input
                            id="inverter_delete"
                            type="checkbox"
                            width="20px"
                            height="20px"
                            style="float: right"
                            @click="addInverterForDeletion(inverter)"
                        >
                        <div
                            style="margin-top: 7px"
                            @click="inverterSelected(inverter)">
                            <h4>{{ inverter.Manufacturer }}</h4>
                            <p style="margin-top: 5px">
                                {{ inverter.Make }}
                            </p>
                            <p style="margin-top: 5px; margin-bottom: 7px">
                                Size: {{ inverter.Size }}kW
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-show=" Object.keys(selectedStringInverter).length == 0 && Object.keys(selectedMicroInverter).length == 0"
            class = "sappane-label">
            <hr>
            <div class="sappane-label inverters-sappane-labels"  @click="handleCollapsable('3')">
                <div>CENTRAL INVERTERS ({{summaryData.centralInverters.length}})</div>
                <div v-if="dropClose == 3"><img :src="dropdownArrowUp" width="20px" height="20px" /></div>
                <div v-else><img :src="dropdownArrowDown" width="20px" height="20px" /></div>
            </div>
            <div class = "hidden" id="3">
                <div style="padding: 5px; padding-top: 10px; padding-bottom: 15px">
                <div class="addInverterClass">
                <infinite-scroll-dropdown-inverter
                    :inverter.sync="selectedCentralInverter"
                    inverter-type="centralInverter"
                    theme="darkDropdownWithFilters"
                    action="addInverter"
                />
                </div>
                </div>
                <div class='inverter_scroll'>
                <div
                    v-for="inverter in summaryData.centralInverters"
                    :key="inverter.id"
                    class="inverterSelection"
                >
                    <p style="padding-top: 5px">{{ inverter.name }}</p>
                    <input
                        id="inverter_delete"
                        type="checkbox"
                        width="20px"
                        height="20px"
                        style="float: right"
                        @click="addInverterForDeletion(inverter)"
                    >
                    <div
                        style="margin-top: 7px"
                        @click="inverterSelected(inverter)">
                        <h4>{{ inverter.Manufacturer }}</h4>
                        <p style="margin-top: 5px">
                            {{ inverter.Make }}
                        </p>
                        <p style="margin-top: 5px; margin-bottom: 7px">
                            Size: {{ inverter.Size }}kW
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div
            v-if="noOfInverterToBeDeleted > 0"
            class="footer"
        >
        <hr>
            <div class="button__container" style="margin-top: -4%">
                <button 
                    class="button-dark-theme-icons"
                    @click="deleteInverterAction">
                    Delete
                </button>
            </div>
        </div>
        <modal-box
            message="Performing this action will delete the Inverter. Are you sure you want to continue?"
        />
    </div>
</template>

<script>
import { serverBus } from '../../../../main';
import { INIT_INVERTER_MENU } from '../../../../componentManager/componentManagerConstants';
import infiniteScrollDropdownInverter from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverter.vue/';
import modalBox from '../properties/modalBox.vue';
import dropdownArrowUp from '../../../../assets/drop/dropdown-arrow-up.png';
import dropdownArrowDown from '../../../../assets/drop/dropdown-arrow-down.png';
export default {
    name: 'InverterMenuSummary',
    components: {
        infiniteScrollDropdownInverter,
        modalBox,
    },
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    onClickAddInverter: () => {},
                    onClickAddMicroInverter: () => {},
                    updateVisualsOfInverters: () => {},
                    setSelectedObject: () => {},
                    microInverterCount,
                    stringInverters: [],
                    centralInverters: [],
                    microInverters: [],
                    showInverterIn3D: true,
                    inverterToBeDeleted,
                };
            },
        },
    },
    data() {
        return {
            msg: 'I am in Inverter Menu summary',
            inverter3D: false,
            selectedInverter: {},
            selectedMicroInverter: {},
            selectedStringInverter: {},
            selectedCentralInverter: {},
            dropClose: false,
            dropdownArrowUp: dropdownArrowUp,
            dropdownArrowDown: dropdownArrowDown,
        };
    },
    nonReactiveData() {
        return {
            newInverterFunc: () => {},
        };
    },

    computed: {
        noOfInverterToBeDeleted(){
            let noOfInverterToBeDeleted = this.summaryData.inverterToBeDeleted.length;
            return noOfInverterToBeDeleted;
        },
        // inverterQuantity() {
        //     return this.summaryData.inverters.length;
        // },
        
    },
    mounted() {
        this.$root.$on('trigerStringInverter', (selectedInverter) => {
            this.summaryData.onClickAddInverter(selectedInverter);
        });
        this.$root.$on('trigerMicroInverter', (selectedInverter) => {
            this.summaryData.onClickAddMicroInverter(selectedInverter);
        });
        this.$root.$on('trigerCentralInverter', (selectedInverter) => {
            this.summaryData.onClickAddInverter(selectedInverter);
        });

    },
    beforeDestroy() {
        this.$root.$off('trigerStringInverter');
        this.$root.$off('trigerMicroInverter');
        this.$root.$off('trigerCentralInverter');
        // this.$mousetrap.unbind('i');
    },
    methods: {
        inverterSelected(inverter) {
            this.summaryData.setSelectedObject(inverter.getInverter());
            if(inverter.inverterType == "microInverters" && inverter.getInverter().panels.length == 0){
                inverter.getInverter().stage.microInverterSelectionMode.initialize(inverter.getInverter());
            }
            
        },
        addInverterForDeletion(inverter) {
            const index = this.summaryData.inverterToBeDeleted.indexOf(inverter);
            if (index > -1) {
                this.summaryData.inverterToBeDeleted.splice(index, 1);
                return 0;
            }
            else {
                this.summaryData.inverterToBeDeleted.push(inverter);
            }
        },
        deleteInverterAction() {
            if(this.summaryData.inverterToBeDeleted[0].inverterType == "stringInverters") {
                serverBus.$emit(
                    'modalBoxInverter',
                    this.summaryData.inverterToBeDeleted,
                    this.summaryData.stringInverters,
                    'Performing this action will delete the Inverter. Are you sure you want to continue?',
                );
            }
            if(this.summaryData.inverterToBeDeleted[0].inverterType == "microInverters") {
                serverBus.$emit(
                    'modalBoxInverter',
                    this.summaryData.inverterToBeDeleted,
                    this.summaryData.microInverters,
                    'Performing this action will delete the Inverter. Are you sure you want to continue?',
                );
            }
            if(this.summaryData.inverterToBeDeleted[0].inverterType == "centralInverters") {
                serverBus.$emit(
                    'modalBoxInverter',
                    this.summaryData.inverterToBeDeleted,
                    this.summaryData.centralInverters,
                    'Performing this action will delete the Inverter. Are you sure you want to continue?',
                );
            }
        },
        microInverterCount() {
            let microInverterCount = 0;
            for (let i = 0 ; i < this.summaryData.microInverters.length ; i++) {
                microInverterCount += Math.ceil(this.summaryData.microInverters[i].microInverterCount);
            }

            return microInverterCount;
        },
        toggleCall() {
            this.summaryData.updateVisualsOfInverters();
        },
        handleCollapsable(id) {
            if (this.prevComId !== id) {
                this.prevComId ? document.getElementById(this.prevComId).classList.remove('open') : '';
                this.dropClose = id;
                document.getElementById(id).classList.add('open');
                this.prevComId = id;
            }
            else if (this.prevComId === id) {
                document.getElementById(this.prevComId).classList.remove('open');
                this.dropClose = false;
                this.prevComId = null;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../../../../styles/components/button.scss";
@import "../../../../styles/components/input.scss";
</style>

<style scoped>
.inverter_scroll{
    max-height: 240px;
    overflow-y: scroll;
    width: 100%;
    padding-left: 5px;
}
.footer{
    position: absolute;
    bottom: 10px;
    width: 94%;
}
.button-dark-theme-icons {
  font-size: small;
  border: 1px solid white;
  height: 30px;
  width: 85px;
  margin-top: 15px;
}
.button__container{
    display: flex;
    justify-content: center;
}
.inverterSelection:hover {
  background-color: rgba(110, 121, 133, 0.425);
  cursor: pointer;
}

#inverterSummary ::-webkit-scrollbar {
  display: none;
}

#inverterSummary .vb > .vb-dragger > .vb-dragger-styler {
  visibility: hidden;
}

#inverterSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
  visibility: visible;
}
#inverterSummary .data-summary {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.model-name {
  margin-top: -7px;
}
.hidden {
    display: none;
}
.hidden.open {
    display: block;
}
.inverters-sappane-labels {
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}
</style>