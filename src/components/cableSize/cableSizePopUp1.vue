<template>
  <div class='cableSizePopup'>
    <el-dialog
      title="Cable Size Setting"
      :visible="isCableSizePopUpOpen"
      :close-on-click-modal="false"
      @close="$emit('close-popup')"
    >
      <section class="main-section" style="height: 200px">
            <form id="cableSizeForm">
                    <section>
                        <label for="voltage" >Voltage</label>
                        <input id="voltage" type="number" name="voltage" v-model.number="cableSizeProperties.voltage">
                        <label for="deratingFactor" name="Overall Derating Factor">Overall Derating Factor</label>
                        <input id="deratingFactor" type="number" name="deratingFactor" v-model.number="cableSizeProperties.deratingFactor">
                    </section>
                    
                    <section >
                        <label for="current">Current</label>
                        <input id="current" type="number" name="current" v-model.number="cableSizeProperties.current">
                        <label for="subject">No of runs</label>
                        <input id="powerFactor" type="number" value=1 name="powerFactor" v-model.number="powerFactor">
                        
                    </section>
                    
                    <section >
                        <label for="cableLength">Cable Length</label>
                        <input id="cableLength" type="number" name="cableLength" v-model.number="cableLength">
                        <label for="maxVoltageDrop">Voltage drop(%)</label>
                        <input id="maxVoltageDrop" type="number" min=1 max=100 value="5" name="maxVoltageDrop" v-model.number="maxVoltageDrop">
                        
                    </section>
            </form>
            <div class='action-section'>
                <button class="submit-btn" @click="generateQueryAndMakeRequest">
                    <p v-show="!calculating">Update</p>
                    <i class="el-icon-loading" v-show="calculating"></i>
                </button>
                <button class="submit-btn btn-cancel" @click="closePopup">
                    <p>Cancel</p>
                </button>
            </div>

        </section>
        <section v-if="!calculating && calculationResult.length > 0" class="table-section">
            <el-table
                v-model="selectedRow"
                :data="calculationResult"
                row-key="id"
                height="300px"
                @row-click="selectRow"
                highlight-current-row
            >
                <el-table-column type="index"/>
                <el-table-column prop="size" :label="'Size'+' ('+cableSizeUnit+')'" />
                <el-table-column prop="rating" label="Rating (A)" />
                <el-table-column prop="voltageDrop" label="Voltage Drop (%)" />
            </el-table>
        </section>
        <section v-else class="table-section">
            <el-table
                v-model="selectedRow"
                :data="calculationResult"
                row-key="id"
                height="300px"
                @row-click="selectRow"
                highlight-current-row
            >
                <el-table-column type="index"/>
                <el-table-column prop="size" :label="'Size'+' ('+cableSizeUnit+')'" />
                <el-table-column prop="rating" label="Rating (A)" />
                <el-table-column prop="voltageDrop" label="Voltage Drop (%)" />
            </el-table>
        </section>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  props: {
    isCableSizePopUpOpen: {
      type: Boolean,
      default: false,
    },
    cableSizeProperties: {
      type: Object,
      default: {},
    },
    calculationResultArr: {
        type: Array,
        default: []
    }
  },
  data(){
        return{
            calculating: false,
            powerFactor: 1,
            cableLength: parseFloat(this.cableSizeProperties.maxCableLength).toFixed(2),
            maxVoltageDrop: .99,
            selectedRow: '',
            calculationResult: this.calculationResultArr,
            currentSelectedRow: this.calculationResultArr.filter(item => item.size === size),
        };
    },
    computed: {
        cableSizeUnit(){
            return this.cableSizeProperties.wireSizeUnit === 'sq.mm' ? 'mm2' : 'AWG';
        }
    },

    methods:{
        selectRow(row){
            this.maxVoltageDrop = row.voltageDrop;
            this.cableLength = row.size;

            this.$emit('select-cable', row)
            this.$emit('close-popup');
        },
        async generateQueryAndMakeRequest(){
            this.calculating = true;
            const requestBody = { 
                    "voltage": parseFloat(this.cableSizeProperties.voltage),
                    "current": parseFloat(this.cableSizeProperties.current),
                    "powerFactor": this.powerFactor,
                    "deratingFactor": this.cableSizeProperties.deratingFactor,
                    "length": parseFloat(this.cableLength),
                    "voltageDrop": this.maxVoltageDrop,
                }
            await axios.post(`api/designs/${this.designId}/get_wire_size/`, requestBody).
                    then(resp =>{
                        const response = resp.data
                        this.calculationResult = [];
                        for(let i=0; i<response.sqmm.length; i++){
                            this.calculationResult.push({
                                id: i, 
                                size: this.cableSizeProperties.wireSizeUnit === 'sq.mm' ? response.sqmm[i] : response.AWG[i], 
                                rating: response.Imax[i], 
                                voltageDrop: response.vdrop[i]
                            })
                        }
                    }).
                    catch(error => console.error(error));
            this.calculating = false;
            this.$emit('setNewInputValues', requestBody);
        },
        closePopup() {
            this.$emit('close-popup');
        },
    },
}
</script>

<style scoped>
#cableSizeForm{
    color: #525252;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
}
@media screen and (max-width: 1081){
    #cableSizeForm{
        display: block;
    }
}

#cableSizeForm input, #cableSizeForm label{
    display:block;
    white-space: nowrap;
    margin-top: 3px;
    width: 45%;
    padding-left: 2px;
    text-align: left;

}
#cableSizeForm input{
    height: 24px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 2px solid #DCDFE6;
    color: #606266;
    padding-left:5px;
    margin: 4px 0px 14px 0;
    width: 100%;
}
#cableSizeForm input:hover{
    border-color: #a0a0a0;
}
#cableSizeForm input:focus{
    outline: none;
    border-color: #699dfd;
}

form section{
  width: 100%;
  padding: 0 10px;
}

.el-dialog__body{
  min-height:200px !important;
}
.submit-btn{
    padding: 5px 8px;
    margin: 5px auto 10px auto;
    background: #409eff;
    cursor: pointer;
    border: 2px solid #409eff;
    border-radius: 4px;
    font-size: 15px;
    text-align: center;
    display: block;
}
.submit-btn:hover{
    background: #3198ff;
}
.btn-cancel{
    background: none;
    border: 1px solid #2c2c2c !important;
    color: #2c2c2c;
}
.btn-cancel:hover{
    background: none;
    cursor: pointer;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.table-section{
  margin: 0px 5px 2px 10px;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
.el-table thead{
    background: rgb(230, 228, 228);
    color: black;
    font-size: small;
}
thead tr th .cell{
    word-break: break-word;
}
.action-section{
    display: flex;
    justify-content: space-around;
    margin: 0 33%;
}
</style>