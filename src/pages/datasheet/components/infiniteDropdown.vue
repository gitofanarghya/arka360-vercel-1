<template>
    <div id="dropdownInfiniteScroll">

        <el-select v-model="value" placeholder="Pro Clamp" class="dropdownClass" @input="handleChange">
            <div class="formClass">
                <div class="positionR">
                    <input id="myInput" type="text" placeholder="Search" class="formInput" v-model="search" autocomplete="off">
                    <button class="searchIconBtn" type="submit" :class="styleSearchButton" />
                </div>
            </div>

            <p class="make">Make</p>

            <el-option 
                v-for="(item, idx) in finalOptions" 
                :key="item.id" 
                :label="getLabel(item.company_name, [item.model, item.make, item.series], item.location)" 
                :value="item.id"
                class="drpdwnOptClass">
            </el-option>

            <!-- <infinite-loading
                :distance="0"
                spinner="bubbles"
                @infinite="fetchMoreUtilityRateByLSEID"
            >
                <div
                    slot="no-more"
                    style="color: #606266; font-size: 12px">
                    No more utility rates!!
                </div>
                <div
                    slot="no-results"
                    style="color: #606266; font-size: 12px">
                    No more utility rates!!
                </div>

                <div
                    slot="error"
                    style="color: #606266; font-size: 12px">
                    Error in fetching utility rates, retry!!
                </div>
            </infinite-loading> -->
        </el-select>
    </div>
</template>

<script>
import axios from 'axios';
import { serverBus } from '../../../main';


export default {
    props: {
        options: {
            type: Array,
            default: () => [],
        },
        componentKey: {
            type: String,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        selectedPDF: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            finalOptions: this.options,
            search: '',
            value: '',
            styleSearchButton: 'el-icon-search button-light-theme-icons searchButtonStyleAddition',
            styleDeleteButton: 'el-icon-delete button-light-theme-icons deleteButtonStyleAddition',
        }
    },
    mounted() {
        this.value = this.selectedPDF || this.options[0].model || this.options[0].location ||this.options[0].make || this.options[0].series;
    },
    methods: {
        async fetchData(endPoint) {
            try {
                const response = await axios.get(endPoint);
                return response.data;
            }
            catch(e) {
                console.log('e: ', e);
            }

        },
        getLabel(company, options = [], location) {
            let make;
            for (let i = 0; i < options.length; i+= 1) {
                if (options[i]) {
                    make = options[i];

                    break
                }
            }

            const label = location ? `${company} ${make} ${location}` : `${company} ${make}`;

            return label
        },
        handleChange: function (value) {
            serverBus.$emit('select-datasheet-option', {
                key: this.componentKey,
                value: value,
                index: this.index,
            })
        },
    },
    watch: {
        search: {
            handler(val) {
                
                this.finalOptions = [];
                let foundNothing = true;

                for (let i = 0; i < this.options.length; i += 1) {
                    const option = this.options[i];

                    const value = String(option.model || option.make || option.series).toLowerCase();
                    const companyName = String(option.company_name).toLocaleLowerCase();
                    const searchCheck = String(val).toLocaleLowerCase();
                    const location = String(option.location).toLocaleLowerCase();

                    if (value.includes(searchCheck) || companyName.includes(searchCheck) || location.includes(searchCheck)) {
                        this.finalOptions.push(option)

                        foundNothing = false;
                    }
                }

                if (foundNothing) {
                    this.finalOptions = this.options;
                }
    
            }
        },
    }
}
</script>

<style scoped>
#dropdownInfiniteScroll>>> ::placeholder {
    color: #222;
    font-size: 16px;
    font-weight: 100;
}

#dropdownInfiniteScroll>>>.el-select .el-input .el-select__caret {
    color: #777;
    font-weight: bold;
    font-size: 16px;
}

#dropdownInfiniteScroll>>>.el-select {
    width: 100%;
    max-width: 208px;
}

#dropdownInfiniteScroll>>>.el-input {
    width: 100% !important;
}

#dropdownInfiniteScroll>>>.el-input__inner {
    border: none !important;
    background-color: #e8edf2 !important;
    color: #222 !important;
    font-size: 16px !important;
    height: 40px !important;
}

#dropdownInfiniteScroll>>>.el-select-dropdown {
    min-width: 336px !important;
}

.formClass {
    margin: 8px 16px 0px 16px;
}



.formInput {
    width: 100%;
    height: 48px;
    border: 1px solid #999;
    border-radius: 4px;
    padding: 0px 30px 0px 16px;
}

.positionR {
    position: relative;
}


.make {
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #999;
    padding-bottom: 8px;
    color: #777;
    margin: 16px 16px 8px 16px;
}

.searchIconBtn {
    position: absolute;
    top: 13px;
    right: 4px;
    background-color: #fff;
    border: none;
    cursor: pointer;
    font-size: 20px;
}

.drpdwnOptClass {
    min-width: 336px !important;
    max-width: 500px !important;
    font-size: 16px !important;
    color: #222 !important;
    font-weight: 500;
}
</style>