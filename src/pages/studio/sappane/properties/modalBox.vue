<template>
    <div id="newProfiles">
        <el-dialog
            :visible.sync="isVisible"
            :close-on-click-modal="false"
            @close = "closeModalActions"
            width="30%"
        >
            <div class="alert-img">
                <img 
                :src="alertBox" 
                alt="alert" 
                class="warningImage"
                />
            </div>
            <div class="alertMsg">{{ message }}</div>
            <div class="button-continue">
                <el-button
                    v-if="inverterObject"
                    type="primary"
                    class="confirmbutton"
                    size="mini"
                    @click="deleteInverter(deletedInverter, inverters)"
                >
                    Continue
                </el-button>
                <el-button
                    v-else
                    type="primary"
                    class="confirmbutton"
                    size="mini"
                    @click="deleteString">
                    Continue
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { serverBus } from '../../../../main';
import AlertBox from '../../../../assets/img/alert.svg';
import { onClickInverterMenu } from '../../../../../src/componentManager/sapPaneAssistant' ;

export default {
    name: 'ModalBox',
    props: {
    // message: String,
    },
    data() {
        return {
            isVisible: false,
            alertBox: AlertBox,
            inverterObject: false,
            deletedInverter: [],
            inverters: [],
            message: '',
            deleteId: null,
        };
    },
    mounted() {
        serverBus.$on('modalBoxOn', (delString, msg) => {
            this.deleteId = delString;
            this.isVisible = true;
            this.message = msg;
            this.$mousetrap.bind('enter', () => {
                this.deleteString();
            });
        });
        serverBus.$on('modalBoxInverter', (deletedInverter, inverters, msg) => {
            this.deletedInverter = deletedInverter;
            this.inverters = inverters;
            this.inverterObject = true;
            this.isVisible = true;
            this.message = msg;
            this.$mousetrap.bind('enter', () => {
                if (this.inverterObject) this.deleteInverter(this.deletedInverter, this.inverters);
            });
        });
        // serverBus.$on('modalBoxMicroInverter', (deletedMicroInverter, microInverters, msg) => {
        //     this.deletedMicroInverter = deletedMicroInverter;
        //     this.microInverters = microInverters;
        //     this.inverterObject = true;
        //     this.isVisible = true;
        //     this.message = msg;
        //     if (this.inverterObject) {
        //         this.deleteMicroInverter(this.deletedMicroInverter, this.microInverters);
        //     }
        //     this.$mousetrap.bind('enter', () => {
        //         if (this.inverterObject) {
        //             this.deleteMicroInverter(this.deletedMicroInverter, this.microInverters);
        //         }
        //     });
        // });
        this.isVisible = false;
    },
    beforeDestroy() {
        this.isVisible = false;
        serverBus.$off('modalBoxOn');
        serverBus.$off('modalBoxInverter');
        // serverBus.$off('modalBoxMicroInverter');
        this.$mousetrap.unbind('enter');
    },
    methods: {
       closeModalActions(){
            this.$mousetrap.unbind('enter');
       },
        deleteString() {
            this.deleteId();
            this.isVisible = false;
        },
        deleteInverter(deletedInverter, inverters) {

            for(let i in deletedInverter){
                for (let inverter in inverters) {
                    if (deletedInverter[i].id === inverters[inverter].id) {
                        let index = inverters.indexOf(deletedInverter[i]);
                        inverters.splice(index, 1);
                        break;
                    }
                }
                deletedInverter[i].startContainer();
                deletedInverter[i].removeObject();
                deletedInverter[i].stopContainer();
                this.isVisible = false;
            }
        },
        // deleteMicroInverter(deletedMicroInverter, microInverters) {
        //     for (let inverter in microInverters) {
        //         if (deletedMicroInverter.id === microInverters[inverter].id) {
        //             let index = microInverters.indexOf(deletedMicroInverter);
        //             microInverters.splice(index, 0);
        //             break;
        //         }
        //     }
        //     deletedMicroInverter.removeObject();
        //     this.isVisible = false;
        // }
    },
};
</script>

<style type="text/css" scoped>
#newProfiles >>> .el-dialog__header {
  background: white !important;
  border-radius: 10px;
}
.button-continue {
  text-align: center;
}
.el-dialog__wrapper >>> div {
  border-radius: 10px;
}
#newProfiles >>> .el-dialog__wrapper {
  top: 20%;
}
.alert-img {
  text-align: center;
  margin-bottom: 20px;
  padding: 5px;
}
.alert-img >>> img {
  padding: 10px;
}
.confirmbutton {
  width: 9.5rem;
  height: 3rem;
  font-size: 18px !important;
  font-weight: bold !important;
  margin: 25px;
}
.button-confirm {
  padding: 15px 55px 16px;
}
.alert-img >>> a {
  text-decoration: none;
}
</style>
<style >
#newProfiles .el-dialog__close {
  color: rgb(27, 24, 24);
  margin-top: 18px;
  font-size: 24px;
  font-weight: bold;
  padding: 10px 5px 0 0;
}
#newProfiles .el-dialog__close:hover {
  color: black !important;
}

#newProfiles .alertMsg{
    word-break: break-word;
    font-size: 16px!important;
    font-weight: 100!important;
    line-height: 1.5!important;
    color: #222!important;
    text-align: center;
}
</style>
