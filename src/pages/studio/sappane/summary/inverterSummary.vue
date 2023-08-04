<template>
    <div id="inverterSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Inverter ID
                    <span class="sappane-value">
                        {{ inverterNumber }}
                    </span>
                </p>
                <p class="sappane-label">
                    Manufacture and 
                    <span class="sappane-value">
                        {{ summaryData.inverterManufacturer}},
                    </span>
                </p>
                <p class="sappane-label model-name">
                    Model Name
                    <span class="sappane-value">
                        {{summaryData.inverterMake }}
                    </span>
                </p>
                <p class="sappane-label">
                    Number of MPPTs
                    <span class="sappane-value">
                        {{ summaryData.numberOfMppts }}
                    </span>
                </p>
                <!-- <p class="sappane-label">
                    String Numbers
                    <span class="sappane-value">
                        {{ inverterNumber }}
                    </span>
                </p> -->
                <p class="sappane-label">
                    AC Size
                    <span class="sappane-value">
                        {{ summaryData.acSize.toFixed(3) }}
                        (kW)
                    </span>
                </p>
                <p class="sappane-label">
                    DC Size
                    <span class="sappane-value">
                        {{ dcSize.toFixed(3) }}
                        (kW)
                    </span>
                </p>
                <p class="sappane-label">
                    DC/AC Ratio
                    <span class="sappane-value">
                        {{ dcAcRatio }}
                    </span>
                </p>
                 <!-- <p class="sappane-label">
                    Subarray ID
                    <span class="sappane-value">
                        {{ inverterNumber }}
                    </span>
                </p>
                <p class="sappane-label">
                    Inverter Number
                    <span class="sappane-value">
                        {{ inverterNumber }}
                    </span>
                </p> -->
                
            </div>
        </div>
    </div>
</template>

<script>
import { serverBus } from '../../../../main';
import { UPDATE_INVERTER_DC_SIZE } from '../../../../componentManager/componentManagerConstants';
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'InverterSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    inverterNumber: 0,
                    inverterMake: 'Custom Inverter',
                    inverterManufacturer: '',
                    numberOfMppts: 2,
                    getDcSize: () => {},
                    acSize: 100,
                };
            },
        },
    },
    data() {
        return {
            // dcSize: this.summaryData.getDcSize() / 1000,
        }
    },
    mounted() {
        // TODO: remove all the emit on this tag
        // serverBus.$on(UPDATE_INVERTER_DC_SIZE, () => {
        //     console.log('called updated')
        //     // this.dcSize = this.summaryData.getDcSize() / 1000;
        //     this.dcSize;
        // });
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        inverterNumber() {
            if (Array.isArray(this.summaryData.inverterNumber)) {
                return String(this.summaryData.inverterNumber);
            }
            return this.summaryData.inverterNumber;
        },
        dcSize() {
            return this.summaryData.getDcSize() / 1000;
        },
        dcAcRatio() {
            return parseFloat((this.dcSize / this.summaryData.acSize).toFixed(3));
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'src/styles/components/input.scss';
@import 'src/styles/components/button.scss';
</style>

<style scoped>
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
.sappane-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
