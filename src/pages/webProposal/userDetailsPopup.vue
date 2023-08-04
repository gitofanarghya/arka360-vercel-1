<template>
    <div id="parentContainer">
        <el-dialog :visible="isUserDetailsPopupVisible" :close-on-click-modal="false" title="User Details" width="600px"
            @close="onDialogClose">
            <div class="container">
                <div class="inputsContainer">
                    <div class="rowInputs">
                        <div class="inputCont">
                            <p class="label">First Name*</p>
                            <input type="text" v-model="userDetails.firstName" class="inputTag"
                                v-validate="firstNameValidation" name="firstName" @input="isFirstName()" />
                            <p class="errorMsg" v-show="errors.has('firstName')">First name is required.</p>
                        </div>
                        <div class="inputCont">
                            <p class="label">Last Name</p>
                            <input type="text" v-model="userDetails.lastName" class="inputTag" />
                        </div>
                    </div>
                    <div class="inputCont">
                        <p class="label">Email Id*</p>
                        <input type="text" v-model="userDetails.emailId" class="inputTag" v-validate="emailValidation"
                            name="email id" @input="isEmail()" />
                        <p class="errorMsg" v-show="errors.has('email id')">
                            {{ errors.first("email id") }}
                        </p>
                    </div>
                    <div class="inputCont">
                        <p class="label">Mobile No.* </p>
                        <div class="flexCont">
                            <input type="text" v-model="countryCode" class="countryCode inputTag" disabled />
                            <input v-model="userDetails.mobileNum" class="inputTag" type="tel" minlength="10" maxlength="10"
                                oninput="this.value = this.value.replace(/[^0-9]/g, '');" v-validate="phNoValidation"
                                name="mobile number" @input="isPhNo()" />

                        </div>
                        <p class="errorMsg" v-show="errors.has('mobile number')">
                            {{ errors.first("mobile number") }}
                        </p>

                    </div>
                    <div class="inpCont" >
                        <p class="label">State*</p>
                        <el-select v-model="userDetails.state" filterable placeholder="" name="state"
                            v-validate="stateValidation">
                            <el-option v-for="item in states" :key="item.label" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                        <p class="errorMsg" v-show="errors.has('state')">
                            {{ errors.first("state") }}
                        </p>
                    </div>
                    <div class="inputCont gridCont">
                        <div>
                            <p class="label">City*</p>
                            <el-select v-model="userDetails.city" filterable placeholder="" name="city"
                                v-validate="cityValidation" :disabled="cityOptions.length == 0">
                                <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item">
                                </el-option>
                            </el-select>
                            <p class="errorMsg" v-show="errors.has('city')">
                                {{ errors.first("city") }}
                            </p>
                        </div>
                        <div class="logoContainer">
                            <p class="poweredBy">Powered By</p>
                            <img src="./img/ecofy.png" class="logo" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="footerCont">
                <el-button type="primary" class="btn" @click="submitDetails()" :loading="loadingStateButton"
                    :disabled="errors.items.length > 0">Submit</el-button>
            </div>
        </el-dialog>
    </div>
</template>
  
<script>

import API from '@/services/api/';


export default {
    props: {
        isUserDetailsPopupVisible: {
            type: Boolean,
            default: false,
        },
        designId: {
            type: Number
        },
    },

    data() {
        return {
            firstNameValidation: {
                required: true,
            },
            emailValidation: {
                required: true,
                email: true,
            },
            stateValidation: {
                required: true,
            },
            cityValidation: {
                required: true,
            },

            phNoValidation: {
                required: true,
            },
            userDetails: {
                firstName: null,
                lastName: null,
                mobileNum: null,
                emailId: null,
                state: null,
                city: null,
            },

            states: [{
                value: 'GJ',
                label: 'Gujarat'
            }, {
                value: 'KA',
                label: 'Karnataka'
            }, {
                value: 'MH',
                label: 'Maharashtra'
            }, {
                value: 'MP',
                label: 'Madhya Pradesh'
            }, {
                value: 'RJ',
                label: 'Rajasthan'
            }, {
                value: 'TG',
                label: 'Telangana'
            }],

            cityOptions: [],

            countryCode: "+91",
            loadingStateButton:false,

        };
    },

    methods: {
        onDialogClose() {
            this.$emit("update:isUserDetailsPopupVisible", false);
        },

        async submitDetails() {
            let isFormValid = false;
            await this.$validator.validateAll().then((result) => {
                if (!result) {
                    // validation failed, display error messages
                    const errors = this.$validator.errors.all();
                    // do something with the errors, such as displaying them in a div on the page
                } else {
                    isFormValid = true
                    // validation passed, submit the form normally
                }
            });

            if (isFormValid) {
                this.loadingStateButton = true;
                let response;
                try {
                    const postData = {
                        "first_name": this.userDetails.firstName,
                        "last_name": this.userDetails.lastName,
                        "email": this.userDetails.emailId,
                        "phone_no": this.userDetails.mobileNum,
                        "city": this.userDetails.city.toUpperCase()
                    }
                    response = await API.DESIGNS.POST_USER_DETAILS_INFO(this.designId, postData);
                    window.open(response.data.data.application_link, "_blank");
                    this.loadingStateButton = true;
                    this.onDialogClose()
                } catch (e) {
                    this.$message({
                        showClose: true,
                        message: e.response.data.message,
                        type: "error",
                        center: true
                    });
                    this.loadingStateButton = false;
                }

            }
        },

        isFirstName() {
            this.$validator.validate('firstName', this.userDetails.firstName);
        },
        isEmail() {
            this.$validator.validate('email id', this.userDetails.emailId);
        },
        isPhNo() {
            this.$validator.validate('mobile number', this.userDetails.mobileNum);
        },
        stateName() {
            this.$validator.validate('state', this.userDetails.state);
        },
        cityName() {
            this.$validator.validate('city', this.userDetails.city);
        },

        citiesOfStates() {
            let state = this.userDetails.state;
            const url = `https://api.countrystatecity.in/v1/countries/IN/states/${state}/cities`;
            const apiKey = "YVNFNGpzYW45Rk5EaTVqbFdmZGdaelR6YlVsVDlqaE5qQ1Z2NWJ5Wg==";
            fetch(url, {
            headers: {
                "X-CSCAPI-KEY": apiKey
            }
            })
            .then(response => response.json())
            .then(cityDetails => {
                this.cityOptions = [];
                this.userDetails.city = null;
                for (let i = 0; i < cityDetails.length; i++) {
                    this.cityOptions.push(cityDetails[i].name)
                }
            })
        }
    },

    mounted() {
        this.citiesOfStates();
    },

    computed: {
        isValidEmail() {
            return /^[^@]+@\w+(\.\w+)+\w$/.test(this.userDetails.emailId);
        },
    },

    watch: {
        'userDetails.state': {
            handler(val, old) {
                this.citiesOfStates();
            }
        },
    }
};
</script>
  
<style scoped>
.errorMsg {
    color: rgb(214, 12, 12);
    font-size: 14px;
    margin-top: 4px;
}

#parentContainer>>>.el-dialog__header {
    /* background-color: #1c3366; */
    background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0 !important;
    height: 48px !important;
}

#parentContainer>>>.el-dialog__title {
    width: auto;
    /* height: 19px; */
    /* margin: 3px 892px 2px 0; */
    font-family: "Helvetica Neue";
    font-size: 16px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 2.38;
    letter-spacing: normal;
    text-align: left;
    color: #222;
    margin-left: 10px;
    color: #222222 !important;
    display: flex;
    align-items: center;
    gap: 8px;
}

#parentContainer>>>.el-dialog__close {
    color: #222222 !important;
    font-weight: 800 !important;
    font-size: 24px !important;
}

#parentContainer>>>.el-dialog {
    border-radius: 12px !important;
    height: auto;
    /* overflow-y: auto; */
    margin-top: 4vh !important;
    width: 600px !important;
}

#parentContainer>>>.el-dialog__body {
    padding: 0px !important;
}

.container {
    padding: 16px 24px 0px 24px;
    overflow: hidden;
    overflow-y: scroll;
    word-break: break-word;
}

.userDetails {
    font-size: 14px;
    color: #222;
    margin-bottom: 16px;
    font-weight: 600;
}

.inputsContainer {
    display: flex;
    flex-direction: column;
    gap: 24px;
    text-align: left;
}

.rowInputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.label {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    margin-bottom: 2px;
}

.inputTag {
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #222;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 4px;
    background-color: #fff;
}

.gridCont {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
}

.logoContainer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
}

.logo {
    max-width: 250px;
    max-height: 150px;
    margin-right: -40px;
}

.poweredBy {
    margin-right: 80px;
    font-size: 16px;
    margin-bottom: -16px;
}

.container>>>.el-select {
    width: 100%;
}

.gridCont>>>.el-select {
    width: 110%;
}

.container>>>.el-select .el-input.is-focus .el-input__inner {
    border-color: #999;
}

.container>>>.el-input__inner {
    height: 48px;
    border: 1px solid #999;
    font-size: 16px;
    color: #222;
    padding: 16px;
    box-sizing: border-box;
    outline: none;
}

.flexCont {
    display: grid;
    grid-template-columns: 60px auto;
    gap: 16px;
}

.countryCode {
    cursor: not-allowed;
}

.footerCont {
    padding: 24px;
}

.btn {
    height: 48px;
    font-size: 18px;
    font-weight: bold;
    border: none;
    width: 100%;
}

.btn:disabled {
    cursor: not-allowed;
}


@media (max-width: 840px) {
    #parentContainer>>>.el-dialog {
        width: 90vw !important;
        overflow-y: hidden;
        max-width: 600px;
    }

    #parentContainer>>>.el-dialog__wrapper {
        left: 5vw;
        right: 5vw;
        min-width: 0 !important;
        overflow: hidden;
        max-height: fit-content;
    }

    #parentContainer>>>.el-dialog__title {
        margin-left: 0px;
    }

    .container {
        padding: 24px 16px 16px 16px;
    }
}

@media (max-width: 500px) {
    #parentContainer>>>.el-dialog__wrapper {
        margin-top: 0vh !important;
    }

    .container {
        max-height: 70vh;
        overflow: hidden;
        overflow-y: scroll;

    }

    .gridCont>>>.el-select {
        width: 140%;
    }

    .inputsContainer {
        gap: 16px;
    }
}
</style>