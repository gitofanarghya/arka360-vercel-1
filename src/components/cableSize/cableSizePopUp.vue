<!-- UNUSED FILE -->
<template>
    <keep-alive>
    <dialog open >
        <section>
            <form id="cableSizeForm">
                    <section>
                        <label for="voltage" >Voltage</label>
                        <input id="voltage" type="number" name="voltage" v-model.number="cableSizeProperties.voltage">
                        <label for="deratingFactor" name="Overall Derating Factor">Overall D.F.</label>
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
            <button class="submit-btn" @click="generateQueryAndMakeRequest">
                {{calculating ? 'Caclulating...': 'Calculate'}}
            </button>
        </section>
        <section v-if="!calculating && calculationResult.length > 0" class="table-section">
            <el-table
            v-model="selectedRow"
                :data="calculationResult"
                row-key="id"
                height="300px"
                @row-click="selectRow"
            >
                <el-table-column prop="size" :label="'Size'+' ('+cableSizeUnit+')'" />
                <el-table-column prop="rating" label="Rating (A)" />
                <el-table-column prop="voltageDrop" label="Voltage Drop (%)" />
            </el-table>
        </section>
    </dialog>
    </keep-alive>
</template>

<script>
import axios from 'axios';
export default {
    name: 'cableSizePopUp',
    props: [ 'cableSizeProperties' ],
    data(){
        return{
            calculating: false,
            powerFactor: 1,
            cableLength: this.cableSizeProperties.maxCableLength,
            maxVoltageDrop: .99,
            selectedRow: '',
            calculationResult: []
        };
    },

    computed: {
        cableSizeUnit(){
            return this.cableSizeProperties.wireSizeUnit === 'sq.mm' ? 'mm2' : 'AWG';
        }
    },

    methods:{
        selectRow(row){
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
    },
}
</script>


<style scoped>

dialog {
    position: absolute;
    top: 1%;
    padding: 2px 2px 2px 1px;
    z-index: 100;
    border-radius: 5px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    font-size: smaller;
    /* overflow: visible; */
    width: 95%;
}

#cableSizeForm{
    color: #525252;
    padding: 10px;
    display: flex;
}
@media screen and (max-width: 1081){
    #cableSizeForm{
        display: block;
    }
}
#cableSizeForm > *{
    flex-basis: 100%; 
}
#cableSizeForm input, #cableSizeForm label{
    display:block;
    white-space: nowrap;
    margin-top: 1px;
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
    margin-bottom: 7px;
    width: 75%;
}
#cableSizeForm input:hover{
    border-color: #a0a0a0;
}
#cableSizeForm input:focus{
    outline: none;
    border-color: #699dfd;
}

.submit-btn{
    width: 94%;
    padding: 2% 5% 2% 5%;
    margin: 2% 3% 2.5% 3%;
    background: #409eff;
    cursor: pointer;
    border: 2px solid #409eff;
    border-radius: 4px;
    font-size: 15px;
    letter-spacing: 2px;
}
.submit-btn:hover{
    background: #3198ff;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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
</style>
