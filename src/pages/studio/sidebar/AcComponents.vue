<template>
    <div id="aCComponent">
        <el-popover
            v-model="popperVisible"
            placement="right">
            <!-- Inverters are removed for now to add from here -->
            <!-- DCDB will be initialized on Toggle on off in Inverter properties
            <div
                @click="popperVisible = !popperVisible">
                <button
                    id="dcdb_button"
                    class="button-sidebar-dropdown"
                    @click="newDCDBFunc">
                    DCDB
                </button>
            </div> -->
            <div @click="popperVisible = !popperVisible">
                <button
                    id="inverter_button"
                    class="button-sidebar-dropdown"
                    @click="newInverterFunc"
                >
                    Inverter Menu (I)
                </button>
            </div>
            <!-- this code is hidden temporarily.ACDB_HIDE -->
            <!-- <div @click="popperVisible = !popperVisible">
                <button
                    id="acdb_button"
                    class="button-sidebar-dropdown"
                    @click="newACDBFunc"
                >
                    ACDB
                </button>
            </div> -->
            <!-- dc cable disabled
      <div class="sideBarTopPart" v-if="popperVisible">
        <el-tooltip
          content="Conduits"
          placement="right"
          class="side-bar-tooltip-wrapper"
          popper-class="side-bar-tooltip"
        >
          <el-popover   placement="right">
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newConduitFunc"
              >
                Single Conduit
              </button>
            </div>
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newDoubleConduitFunc"
              >
                Double Conduit
              </button>
            </div>
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newDoubleSeparateConduitFunc"
              >
                Double Separate Conduit
              </button>
            </div>
            <button
              style="width: 180px"
              slot="reference"
              :disabled="!acEnabled"
              class="button-sidebar-dropdown"
            >
              Conduits
            </button>
          </el-popover>
        </el-tooltip>
      </div>
      <div class="sideBarTopPart" v-if="popperVisible">
        <el-tooltip
          content="Cabletray"
          placement="right"
          class="side-bar-tooltip-wrapper"
          popper-class="side-bar-tooltip"
        >
          <el-popover   placement="right">
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newSingleCableTrayFunc"
              >
                Single Cabletray
              </button>
            </div>
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newDoubleCableTrayFunc"
              >
                Double Cabletray
              </button>
            </div>
            <div  @click="popperVisible = !popperVisible">
              <button
                id="cable"
                class="button-sidebar-dropdown"
                @click="newDoubleSeparateCableTrayFunc"
              >
                Double Separate Cabletray
              </button>
            </div>
            <button
              style="width: 180px"
              slot="reference"
              :disabled="!acEnabled"
              class="button-sidebar-dropdown"
            >
              Cabletray
            </button>
          </el-popover>
        </el-tooltip>
      </div>-->
            <button
                slot="reference"
                :disabled="!acEnabled"
                class="el-icon-files button-sidebar-icons"
            />
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import {
    INIT_INVERTER_MENU,
    INIT_ACDB,
    INIT_DCDB,
    INIT_ACCABLE,
    INIT_CONDUIT,
    INIT_DOUBLECONDUIT,
    INIT_DOUBLESEPARATECONDUIT,
    INIT_SINGLECABLETRAY,
    INIT_DOUBLECABLETRAY,
    INIT_DOUBLESEPARATECABLETRAY,
} from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';

export default {
    name: 'ACComponent',
    components: {

    },
    data() {
        return {
            popperVisible: false,
        };
    },
    nonReactiveData() {
        return {
            newInverterFunc: () => {},
            newACDBFunc: () => {},
            newDCDBFunc: () => {},
            newAcCableFunc: () => {},
            newConduitFunc: () => {},
            newDoubleConduitFunc: () => {},
            newDoubleSeparateConduitFunc: () => {},
            newSingleCableTrayFunc: () => {},
            newDoubleCableTrayFunc: () => {},
            newDoubleSeparateCableTrayFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            acEnabled: state => state.acEnabled,
        }),
    },
    mounted() {
        serverBus.$once(INIT_INVERTER_MENU, (newInverter) => {
            this.newInverterFunc = newInverter;
            this.$mousetrap.bind('i', () => {
                if (this.acEnabled) {
                    newInverter();
                }
            });
        });
        //this code is hidden temporarily.ACDB_HIDE
        // serverBus.$once(INIT_ACDB, (newACDB) => {
        //     this.newACDBFunc = newACDB;
        //     this.$mousetrap.bind('a', () => {
        //         if (this.acEnabled) newACDB();
        //     });
        // });

        // serverBus.$once(INIT_DCDB, (newDCDB) => {
        //     this.newDCDBFunc = newDCDB;
        //     this.$mousetrap.bind('a', () => {
        //         if (this.acEnabled) newDCDB();
        //     });
        // });
        serverBus.$once(INIT_ACCABLE, (newCable) => {
            this.newAcCableFunc = newCable;
        });
        serverBus.$once(INIT_CONDUIT, (newCable) => {
            this.newConduitFunc = newCable;
        });
        serverBus.$once(INIT_DOUBLECONDUIT, (newCable) => {
            this.newDoubleConduitFunc = newCable;
        });
        serverBus.$once(INIT_DOUBLESEPARATECONDUIT, (newCable) => {
            this.newDoubleSeparateConduitFunc = newCable;
        });
        serverBus.$once(INIT_SINGLECABLETRAY, (newCable) => {
            this.newSingleCableTrayFunc = newCable;
        });
        serverBus.$once(INIT_DOUBLECABLETRAY, (newCable) => {
            this.newDoubleCableTrayFunc = newCable;
        });
        serverBus.$once(INIT_DOUBLESEPARATECABLETRAY, (newCable) => {
            this.newDoubleSeparateCableTrayFunc = newCable;
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('i');
        this.$mousetrap.unbind('a');
    },
    methods: {

    },
};
</script>
<style lang="scss" scoped>
@import "../../../styles/components/utils";
@import "../../../styles/components/button";
.sideBarTopPart {
  width: 100%;
  height: 50%;
  border: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
