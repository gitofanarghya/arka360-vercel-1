<template>
    <div style="overflow-x: hidden">
        <el-header class="navBar-container">
            <navBar :current-page="currentPage" />
        </el-header>
        <div class="order-summary-container">
            <div class="order-summary-container-wrapper">
                <div class="card-container">
                    <div v-if="true" class="add-ons-card">
                        <div class="title-block">Add Add-ons</div>
                        <div class="line1"></div>
                        <div class="add-ons-block">
                            <div class="title-block">
                                <div style="">Add-ons</div>
                                <div style="">No. of User</div>
                            </div>
                            <div class="line1"></div>
                            <div class="add-on-description">
                                <div class="description">3D Model export for SketchUp and PVsyst
                                    <div style="" class="price-block"><span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User</div>
                                </div>
                                <div class="minus" @click="setAddOnCount('modelExport', 'minus')">
                                    <img src="../../assets/drop/group-200.png" alt="-" width="12px"
                                    height="2px" />
                                </div>
                                <div class="number">{{ modelExportCount }}</div>
                                <div class="plus" @click="setAddOnCount('modelExport', 'plus')">
                                    <img src="../../assets/drop/group-196.png" alt="+" width="12px"
                                    height="12px" />
                                </div>
                                <!-- <div class="price-block"><span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User</div> -->
                            </div>
                            <div class="line1"></div>
                            <div class="add-on-description">
                                <div class="description">3D Model export for SketchUp and PVsyst
                                    <div class="price-block">
                                        <span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User
                                    </div>
                                </div>
                                <div class="minus disabled" @click="setAddOnCount('modelExport', 'minus')">
                                    <img src="../../assets/drop/group-200.png" alt="-" width="12px"
                                    height="2px" />
                                </div>
                                <div class="number">{{ modelExportCount }}</div>
                                <div class="plus disabled" @click="setAddOnCount('modelExport', 'plus')">
                                    <img src="../../assets/drop/group-196.png" alt="+" width="12px"
                                    height="12px" />
                                </div>
                                <!-- <div class="price-block"><span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User</div> -->
                            </div>
                            <div class="line1" style=""></div>
                            <div class="detailed-design-block">
                                <div class="title-block">Detailed Design</div>
                                <div class="detailed-design-description">
                                    <div class="description">
                                        <div class="sl-no">1.</div>
                                        <div class="text-block">
                                            <div class="text">Detailed Design Lite (Sites up to 200 Kw)</div>
                                            <div style="" class="price-block"><span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User
                                            </div>
                                        </div>
                                    </div>
                                    <div class="minus disabled" @click="setAddOnCount('detailedLite', 'minus')">
                                        <img src="../../assets/drop/group-200.png" alt="-" width="12px"
                                        height="2px" />
                                    </div>
                                    <div class="number">{{ detailedDesignLiteCount }}</div>
                                    <div class="plus disabled" @click="setAddOnCount('detailedLite', 'plus')">
                                        <img src="../../assets/drop/group-196.png" alt="+" width="12px"
                                        height="12px" />
                                    </div>
                                </div>
                                <div class="detailed-design-description">
                                    <div class="description">
                                        <div class="sl-no">1.</div>
                                        <div class="text-block">
                                            <div class="text">Detailed Design Lite (Sites up to 200 Kw)</div>
                                            <div style="" class="price-block"><span style="font-size: 1rem; font-weight: bold">₹1,250</span>/Month/User
                                            </div>
                                        </div>
                                    </div>
                                    <div class="minus disabled" @click="setAddOnCount('detailedLite', 'minus')">
                                        <img src="../../assets/drop/group-200.png" alt="-" width="12px"
                                        height="2px" />
                                    </div>
                                    <div class="number">{{ detailedDesignLiteCount }}</div>
                                    <div class="plus disabled" @click="setAddOnCount('detailedLite', 'plus')">
                                        <img src="../../assets/drop/group-196.png" alt="+" width="12px"
                                        height="12px" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="order-summary-card">
                        <div class="title-block">Order Summary</div>
                        <div class="line1"></div>
                        <div class="order-summary-block">
                            <div class="plan-block">
                                <div class="plan-tl">{{ `Plan: ${selectedPlan.plan_name}` }}</div>
                                <div class="plan-bl">{{ selectedPlan.isRenew ? `${selectedPlan.existing_users} + ${selectedPlan.new_users} Users` : `${selectedPlan.new_users} Users` }}</div>
                                <div class="plan-tr">{{ `₹ ${selectedPlan.plan_amount.toLocaleString()}`}}</div>
                                <div class="plan-br">Per Year/User</div>
                            </div>
                            <div class="line1" style=""></div>
                            <div class="order-summary-add-ons-block" v-if="false">
                                <div class="title-block">
                                    Add-ons
                                </div>
                                <div v-if="true" class="description-block no-addon">
                                    <div class="description" v-if="false">
                                        <div class="slno">1.</div>
                                        <div class="text">3D Model export for SketchUp and PVsyst (1 User)</div>
                                        <div class="price">₹15,000</div>
                                    </div>
                                    <div class="description" v-if="false">
                                        <div class="slno">1.</div>
                                        <div class="text">3D Model export for SketchUp and PVsyst (1 User)</div>
                                        <div class="price">₹15,000</div>
                                    </div>
                                    <div class="description" v-if="false">
                                        <div class="slno">1.</div>
                                        <div class="text">3D Model export for SketchUp and PVsyst (1 User)</div>
                                        <div class="price">₹15,000</div>
                                    </div>
                                    <div v-if="false">No Add-ons</div>
                                </div>
                            </div>
                            <div class="plan-amount">
                                <div>Plan Amount</div>
                                <div>{{ `₹ ${selectedPlan.plan_amount.toLocaleString()}`}}</div>
                            </div>
                            <div class="line1"></div>
                            <div class="add-ons-amount" v-if="true">
                                <div>Add-ons Amount</div>
                                <div>₹ 0</div>
                            </div>
                            <div class="line1"></div>
                            <div class="gst-amount">
                                <div>GST Amount</div>
                                <div>{{ `₹ ${((selectedPlan.plan_amount * 18) / 100).toLocaleString()}`}}</div>
                            </div>
                            <div class="line1"></div>
                            <div class="total-payable-amount">
                                <div>Total Amount Payable</div>
                                <div>{{ `₹ ${(((selectedPlan.plan_amount * 18) / 100) + selectedPlan.plan_amount).toLocaleString()}`}}</div>
                            </div>
                            <div class="plan-expiry-message-block">
                                <div class="message">
                                    {{ selectedPlan ? selectedPlan.message : '' }}
                                </div>
                            </div>
                            <div class="button" @click="paymentRedirect">Pay Now</div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useAuthStore } from '../../stores/auth';
import navBar from '@/components/ui/navBar/navBar.vue';
import { expiryPopupDisplay } from '../../core/utils/utils';

export default {
    name: 'orderSummary',
    components: {
        navBar,
    },
    data() {
        return {
            currentPage: 'orderSummary',
            apiIntegrationCount: 0,
            modelExportCount: 0,
            detailedDesignLiteCount: 0,
            detailedDesignBasicCount: 0,
            selectedPlan: undefined,
        };
    },
    nonReactiveData() {
    },
    computed: {
    },
    methods: {
        ...mapActions(useAuthStore, [
            'PLAN_PAYMENT_LINK',
        ]),
        setAddOnCount(addon, value) {
            return;
            if (addon === 'modelExport') {
                if (value === 'plus') {
                    this.modelExportCount += 1;
                }
                else if (value === 'minus' && this.modelExportCount > 0) {
                    this.modelExportCount -= 1;
                }
            }
            if (addon === 'apiIntegration') {
                if (value === 'plus') {
                    this.apiIntegrationCount += 1;
                }
                else if (value === 'minus' && this.apiIntegrationCount > 0) {
                    this.apiIntegrationCount -= 1;
                }
            }
            if (addon === 'detailedLite') {
                if (value === 'plus') {
                    this.detailedDesignLiteCount += 1;
                }
                else if (value === 'minus' && this.detailedDesignLiteCount > 0) {
                    this.detailedDesignLiteCount -= 1;
                }
            }
            if (addon === 'detailedBasic') {
                if (value === 'plus') {
                    this.detailedDesignBasicCount += 1;
                }
                else if (value === 'minus' && this.detailedDesignBasicCount > 0) {
                    this.detailedDesignBasicCount -= 1;
                }
            }
        },
        async paymentRedirect() {
            let planObj = {
                plan_id: 4,
                selected_payment_type: 1,
            }
            try {
                const response = await this.PLAN_PAYMENT_LINK(planObj);
                if (response.data.authLink) {
                    let top = (screen.height - 500) / 2;
                    let left = (screen.width - 500) / 2;
                    window.open(response.data.authLink, "", 'toolbar=yes,scrollbars=yes,resizable=yes, top=' + top + ', left=' + left +', width=500, height=500');
                }
            }
            catch(e) {
                console.error(e);
            }
        }
    },
    mounted() {
        expiryPopupDisplay.isPricingPage = true;
        // this.getData()
        if (this.$route.params.selectedPlan) {
            this.selectedPlan = this.$route.params.selectedPlan;
        }
        else {
            this.$router.push({path: '/pricing'});
        }
    },
    destroyed() {
        expiryPopupDisplay.isPricingPage = false;
    }
};
</script>

<style scoped>
@media only screen { 
    .disabled {
        cursor: not-allowed;
    }
    .order-summary-container {
        box-sizing: border-box;
        /* height: calc(100vh - 55px); */
        min-height: calc(100vh - 55px);
        /* max-height: calc(100vh - 55px); */
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        background-color: #f5f7fa;
        overflow: hidden scroll;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .order-summary-container-wrapper {
        height: 100%;
        min-height: 1000px;
        min-width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card-container {
        position: relative;
        height: 963px;
        min-height: 963px;
        /* max-height: 880px; */
        /* width: 1630px; */
        width: 100%;
        max-width: 1500px;
        /* background: #409EFF; */
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
    }
    .add-ons-card {
        box-sizing: border-box;
        min-height: 925px;
        /* min-height: 450px; */
        /* max-height: 848px; */
        width: 45%;
        max-width: 715px;
        padding: 35px 0;
        border-radius: 24px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        border: solid 1px #cccccc;
        background-color: #ffffff;
    }
    .add-ons-card > .title-block, .order-summary-card > .title-block {
        /* width: 150px; */
        height: 28px;
        margin: 0 0 33px 35px;
        /* font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; */
        font-size: 1.5rem;
        font-weight: bold;
        /* line-height: 2.92; */
        text-align: left;
        color: #222222;
        
    }
    .add-ons-card .add-ons-block {
        box-sizing: border-box;
        padding: 0 33px 0 36px;
    }
    .add-ons-card .add-ons-block .title-block {
        box-sizing: border-box;
        width: 100%;
        height: 19px;
        margin: 31px 0 13px 0;
        padding: 0 33px 0 0;
        /* font-family: HelveticaNeue; */
        font-size: 1rem;
        font-weight: bold;
        text-align: left;
        color: #1c3366;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .add-ons-card .add-ons-block .line2 {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        height: 2px;
        /* margin: 13px 33px 24px 36px; */
        background-color: #cccccc;
    }
    .add-ons-card .add-ons-block .add-on-description {
        position: relative;
        min-height: 98px;
        width: 100%;
        display: flex;
    }
    .add-ons-card .add-ons-block .add-on-description .description {
        position: absolute;
        top: 27px;
        left: 0;
        max-width: 65%;
        text-overflow: ellipsis;
        font-size: 16px;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .price-block {
        margin: 10px 0 24px 0;
        font-size: 0.87rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .minus {
        box-sizing: border-box;
        position: absolute;
        width: 24px;
        height: 24px;
        top: 24px;
        right: 95px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: not-allowed;
    }
    .add-ons-card .add-ons-block .add-on-description .number {
        position: absolute;
        top: 27px;
        right: 71px;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .plus {
        box-sizing: border-box;
        position: absolute;
        width: 24px;
        height: 24px;
        top: 24px;
        right: 31px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: not-allowed;
    }
    /* .add-ons-card .add-ons-block .add-on-description .top .left {
        font-size: 12px;
    } */
    .add-ons-card .add-ons-block .detailed-design-block {
    }
    .add-ons-card .add-ons-block .detailed-design-block .title-block {
        /* width: 117px; */
        height: 19px;
        margin: 25px 0 0;
        /* font-family: HelveticaNeue; */
        font-size: 1rem;
        font-weight: 500;
        color: #777777;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description {
        position: relative;
        min-height: 78px;
        width: 100%;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .description {
        position: absolute;
        top: 16px;
        left: 0;
        max-width: 65%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        /* text-overflow: ellipsis; */
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .description .text-block {
        margin: 0 0 0 11px;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .description .text-block .text {
        text-overflow: ellipsis;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .description .text-block .price-block {
        margin: 8px 0 0;
    }

    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .price-block {
        margin: 10px 0 15px 24px;
        font-size: 0.87rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .minus {
        position: absolute;
        top: 12px;
        right: 95px;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: not-allowed;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .plus {
        position: absolute;
        top: 12px;
        right: 31px;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: not-allowed;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .number {
        position: absolute;
        top: 15px;
        right: 71px;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .order-summary-card {
        box-sizing: border-box;
        height: auto;
        min-height: 925px;
        /* min-height: 450px; */
        /* max-height: 848px; */
        width: 40%;
        max-width: 619px;
        padding: 35px 0;
        border-radius: 24px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        border: solid 1px #cccccc;
        background-color: #ffffff;
    }
    .order-summary-card .order-summary-block {
        box-sizing: border-box;
        padding: 0 35px 0 32px;
    }
    .order-summary-card .order-summary-block .plan-block {
        position: relative;
        height: 102px;
        width: 100%;
    }
    .order-summary-card .order-summary-block .plan-block .plan-tl {
        position: absolute;
        top: 31px;
        left: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .plan-block .plan-tr {
        position: absolute;
        top: 31px;
        right: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .plan-block .plan-bl {
        position: absolute;
        top: 63px;
        left: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #777777;
    }
    .order-summary-card .order-summary-block .plan-block .plan-br {
        position: absolute;
        top: 63px;
        right: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #777777;
    }
    .add-ons-card .line1, .order-summary-card .line1 {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        height: 1px;
        background-color: #cccccc;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block {
        
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .title-block {
        height: 24px;
        margin: 24px 0 0 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block {
        box-sizing: border-box;
        width: 100%;
        min-height: 144px;
        margin: 24px 0 0 0;
        padding: 23px 19px 1px 16px;
        border-radius: 12px;
        background-color: #f5f7fa;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block.no-addon {
        /* justify-content: center;
        align-items: center; */
        color: #7B7D7D;
        font-size: 25px;
        font-weight: bold;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description {
        margin: 0 0 21px 0;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        font-size: 1rem;
        color: #222222;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .slno {
        font-weight: normal;
        text-align: left;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .text {
        margin: 0 0 0 11px;
        text-overflow: ellipsis;
        font-weight: normal;
        text-align: left;
    }

    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .price {
        margin: 0 0 0 50px;
        font-weight: 500;
        text-align: right;
    }

    .order-summary-card .order-summary-block .plan-amount, .order-summary-card .order-summary-block .add-ons-amount, .order-summary-card .order-summary-block .gst-amount {
        width: 100%;
        height: 19px;
        margin: 28px 0 29px 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 1rem;
        font-weight: bold;
        color: #222222;
    }
    .order-summary-card .order-summary-block .total-payable-amount {
        width: 100%;
        height: 22px;
        margin: 29px 0 35px 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 1.2rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .plan-expiry-message-block {
        width: 100%;
        /* height: 36px; */
        display: flex;
        justify-content: center;
    }
    .order-summary-card .order-summary-block .plan-expiry-message-block .message {
        width: 80%;
        font-size: 0.87rem;
        font-weight: normal;
        line-height: 1.43;
        text-align: center;
        color: #777777;
    }
    .order-summary-card .order-summary-block .button {
        box-sizing: border-box;
        width: 100%;
        height: 72px;
        margin: 25px 0 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background-image: linear-gradient(to bottom, #409EFF,  #3092F7);
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
        cursor: pointer;
    }
}
@media only screen and (min-width: 2000px) { 
    .order-summary-container {
        box-sizing: border-box;
        /* height: calc(100vh - 55px); */
        min-height: calc(100vh - 55px);
        /* max-height: calc(100vh - 55px); */
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        background-color: #f5f7fa;
        overflow: scroll;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .order-summary-container-wrapper {
        height: 100%;
        min-height: 1000px;
        min-width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card-container {
        position: relative;
        height: 963px;
        min-height: 963px;
        /* max-height: 880px; */
        /* width: 1630px; */
        width: 1500px;
        /* max-width: 1400px; */
        /* background: #409EFF; */
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
    }
    .add-ons-card {
        box-sizing: border-box;
        height: 848px;
        /* min-height: 450px; */
        /* max-height: 848px; */
        width: 715px;
        /* max-width: 715px; */
        padding: 35px 0;
        border-radius: 24px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        border: solid 1px #cccccc;
        background-color: #ffffff;
    }
    .add-ons-card > .title-block, .order-summary-card > .title-block {
        /* width: 150px; */
        height: 28px;
        margin: 0 0 33px 35px;
        /* font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; */
        font-size: 1.5rem;
        font-weight: bold;
        /* line-height: 2.92; */
        text-align: left;
        color: #222222;
        
    }
    .add-ons-card .add-ons-block {
        box-sizing: border-box;
        padding: 0 33px 0 36px;
    }
    .add-ons-card .add-ons-block .title-block {
        box-sizing: border-box;
        width: 100%;
        height: 19px;
        margin: 31px 0 13px 0;
        padding: 0 33px 0 0;
        /* font-family: HelveticaNeue; */
        font-size: 1rem;
        font-weight: bold;
        text-align: left;
        color: #1c3366;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .add-ons-card .add-ons-block .line2 {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        height: 2px;
        /* margin: 13px 33px 24px 36px; */
        background-color: #cccccc;
    }
    .add-ons-card .add-ons-block .add-on-description {
        position: relative;
        height: 98px;
        width: 100%;
    }
    .add-ons-card .add-ons-block .add-on-description .description {
        position: absolute;
        top: 27px;
        left: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .price-block {
        margin: 10px 0 0;
        font-size: 0.87rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .minus {
        box-sizing: border-box;
        position: absolute;
        width: 24px;
        height: 24px;
        top: 24px;
        right: 95px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: pointer;
    }
    .add-ons-card .add-ons-block .add-on-description .number {
        position: absolute;
        top: 27px;
        right: 71px;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .add-on-description .plus {
        box-sizing: border-box;
        position: absolute;
        width: 24px;
        height: 24px;
        top: 24px;
        right: 31px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: pointer;
    }
    /* .add-ons-card .add-ons-block .add-on-description .top .left {
        font-size: 12px;
    } */
    .add-ons-card .add-ons-block .detailed-design-block {
    }
    .add-ons-card .add-ons-block .detailed-design-block .title-block {
        /* width: 117px; */
        height: 19px;
        margin: 25px 0 12px 0;
        /* font-family: HelveticaNeue; */
        font-size: 1rem;
        font-weight: 500;
        color: #777777;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description {
        position: relative;
        height: 78px;
        width: 100%;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .description {
        position: absolute;
        top: 16px;
        left: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .price-block {
        margin: 10px 0 0 24px;
        font-size: 0.87rem;
        font-weight: normal;
        color: #222222;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .minus {
        position: absolute;
        top: 12px;
        right: 95px;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: pointer;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .plus {
        position: absolute;
        top: 12px;
        right: 31px;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #1c3366;
        cursor: pointer;
    }
    .add-ons-card .add-ons-block .detailed-design-block .detailed-design-description .number {
        position: absolute;
        top: 15px;
        right: 71px;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .order-summary-card {
        box-sizing: border-box;
        height: 848px;
        /* min-height: 450px; */
        /* max-height: 848px; */
        width: 619px;
        /* max-width: 715px; */
        padding: 35px 0 48px;
        border-radius: 24px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        border: solid 1px #cccccc;
        background-color: #ffffff;
    }
    .order-summary-card .order-summary-block {
        box-sizing: border-box;
        padding: 0 35px 0 32px;
    }
    .order-summary-card .order-summary-block .plan-block {
        position: relative;
        height: 102px;
        width: 100%;
    }
    .order-summary-card .order-summary-block .plan-block .plan-tl {
        position: absolute;
        top: 31px;
        left: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .plan-block .plan-tr {
        position: absolute;
        top: 31px;
        right: 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .plan-block .plan-bl {
        position: absolute;
        top: 63px;
        left: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #777777;
    }
    .order-summary-card .order-summary-block .plan-block .plan-br {
        position: absolute;
        top: 63px;
        right: 0;
        font-size: 1rem;
        font-weight: normal;
        color: #777777;
    }
    .add-ons-card .line1, .order-summary-card .line1 {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        height: 1px;
        background-color: #cccccc;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block {
        
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .title-block {
        height: 24px;
        margin: 24px 0 0 0;
        font-size: 1.25rem;
        font-weight: bold;
        color: #1c3366;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block {
        box-sizing: border-box;
        width: 100%;
        height: 144px;
        margin: 24px 0 0 0;
        padding: 23px 19px 24px 16px;
        border-radius: 12px;
        background-color: #f5f7fa;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block.no-addon {
        /* justify-content: center;
        align-items: center; */
        color: #7B7D7D;
        font-size: 25px;
        font-weight: bold;
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description {
        
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .slno {
        
    }
    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .text-block {
        
    }

    .order-summary-card .order-summary-block .order-summary-add-ons-block .description-block .description .text-block .right {
        
    }

    .order-summary-card .order-summary-block .plan-amount, .order-summary-card .order-summary-block .add-ons-amount, .order-summary-card .order-summary-block .gst-amount {
        width: 100%;
        height: 19px;
        margin: 28px 0 29px 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 1rem;
        font-weight: bold;
        color: #222222;
    }
    .order-summary-card .order-summary-block .total-payable-amount {
        width: 100%;
        height: 22px;
        margin: 29px 0 35px 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 1.1rem;
        font-weight: bold;
        color: #222222;
    }
    .order-summary-card .order-summary-block .plan-expiry-message-block {
        width: 100%;
        /* height: 36px; */
        display: flex;
        justify-content: center;
    }
    .order-summary-card .order-summary-block .plan-expiry-message-block .message {
        width: 80%;
        font-size: 0.87rem;
        font-weight: normal;
        line-height: 1.43;
        text-align: center;
        color: #777777;
    }
    .order-summary-card .order-summary-block .button {
        box-sizing: border-box;
        width: 100%;
        height: 72px;
        margin: 25px 0 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background-image: linear-gradient(to bottom, #409EFF,  #3092F7);
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
        cursor: pointer;
    }
}
@media only screen and (min-width: 1630px) {
    .order-summary-container {
        justify-content: center;
    }
    .order-summary-container-wrapper {
        min-width: 100%;
    }
}

</style>
<style scoped>
body {
    box-sizing: border-box;
}
</style>
