<template>
  <div id="parentContainer" v-loading.fullscreen="isLoading">
    <el-dialog
      :close-on-click-modal="false"
      :visible="isAddCreditPopupVisible"
      title="Add Credits"
      width="856px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="leftContainer">
          <div class="addCreditContainer">
            <el-form ref="form" :model="form">
              <el-form-item label="Add Credits"
                ><br />
                <!-- The below regex pattern and onkeypress listener will limit the input to positive integers -->
                <el-input
                  v-model="form.creditCount"
                  pattern=" 0+\.[0-9]*[1-9][0-9]*$"
                  onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                  type="number">
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="serviceTax">
            <p class="note" v-if="currency_code=='INR'">
              *{{taxRate * 100}}% {{taxText}} will be included in the total payable amount.
            </p>
            <p v-else>*Price is inclusive of all the taxes</p>
          </div>
          <div class="footer">
            <p class="footerContent">
              If you are facing issues regarding payment, please contact our
              <span class="supportTeam" onclick="window.Intercom('show')">Support Team</span>
            </p>
          </div>
        </div>
        <div class="rightContainer">
          <div class="headerContainer">
            <h3 class="headings">Payment Details</h3>
            <div class="packageDetails">
              <p class="details">Credit Amount</p>
              <p class="detailsValue">{{formatNumberWithCommas(+form.creditCount, currency_code=='INR')}}</p>
            </div>
          </div>
          <div class="selectedPayments">
            <div class="packageDetails">
              <p class="detailsSmall">Amount</p>
              <p class="detailsValue">{{currencySymbolNameMap[currency_code]}}{{formatNumberWithCommas(creditAmount.toFixed(2), currency_code=='INR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}</p>
            </div>
            <div class="packageDetails" v-if="currency_code=='INR'">
              <p class="detailsSmall">{{taxText}}</p>
              <p class="detailsValue">{{currencySymbolNameMap[currency_code]}}{{formatNumberWithCommas(taxAmount.toFixed(2), currency_code=='INR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}</p>
            </div>
          </div>
          <div class="footerBtnContainer">
            <div class="packageDetails">
              <p class="totalPayCred">Total Payable Amount</p>
              <p class="totalPayCredVal">{{currencySymbolNameMap[currency_code]}}{{formatNumberWithCommas(totalAmount.toFixed(2), currency_code=='INR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}}</p>
            </div>
            <div class="footerMD">
              <p class="footerContent">
                If you are facing issues regarding payment, please contact our
                <span class="supportTeam" onclick="window.Intercom('show')">Support Team</span>
              </p>
            </div>
            <el-button class="footerBtn" type="primary" :disabled="isTataOrg" @click="openPaymentGateway()">{{isTataOrg ? "Credits Unavailable" : "Pay Now"}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      @close="isPaymentGatewayPopupVisible = false"
      :visible="isPaymentGatewayPopupVisible"
      v-if="isPaymentGatewayPopupVisible"
      class="payment-dialog"
      style="z-index: 10000">
      <div ref="cashfree-payment-element" v-if="paymentGateway == 'cashfree'"></div>
      <div v-else-if="paymentGateway == 'stripe'" style="padding: 1em">
        <div class="purchase-info">
          <span class="purchase-description">{{formatNumberWithCommas(form.creditCount)}} Credits</span>
          <span class="purchase-amount">{{currencySymbolNameMap[currency_code]}}{{totalAmount.toFixed(2)}}</span>
        </div>
        <div id="stripe-payment-element"></div>
        <el-button type="primary" ref="stripe-pay-button" style="width: 100%; margin-top: 2em">Pay</el-button>
      </div>
    </el-dialog>
  </div>
</template>
  
<script>
import { mapActions } from 'pinia';
import { useCreditsStore } from '../../stores/credits';
import API from "@/services/api/";
import { STRIPE_PK, USE_CASHFREE_PROD, RAZORPAY_KEY } from '../../constants'
import currencySymbolNameMap from "@/pages/currency-symbol-name-map.js"
import { cashfreeSandbox, cashfreeProd } from 'cashfree-dropjs'
import { loadStripe } from '@stripe/stripe-js';
import { fetchOrganisationDetails, formatNumberWithCommas, isTataOrg } from '@/utils.js'

// Depending on whether it's cashfreeProd or cashfreeSandbox,
// the corresponding Cashfree APIs (api/sandbox) will be called
// Refer: https://docs.cashfree.com/reference/pg-new-apis-endpoint
let cashfree = cashfreeSandbox
if (USE_CASHFREE_PROD) {
  cashfree = cashfreeProd
}

export default {
  name: "AddCreditPopup",

  nonReactiveData() {
    return {
      currencySymbolNameMap,
    }
  },

  props: {
    isAddCreditPopupVisible: {
      type: Boolean,
      default: false,
    },
    preFilledCreditCount: {
      type: Number,
      default: 0,
    }
  },

  data() {
    return {
      isPaymentGatewayPopupVisible: false,

      form: {
        creditCount: 0,
      },

      creditPriceForCurrency: 1,
      currency_code: 'INR',
      taxText: "service tax",
      taxRate: 0.05,

      isLoading: false,
      // isCashfree: false,
      paymentGateway: ''
    };
  },

  computed: {
    creditAmount() {
      return this.form.creditCount * this.creditPriceForCurrency
    },
    taxAmount() {
      return this.creditAmount * this.taxRate
    },
    totalAmount() {
      if(this.currency_code=='INR')
      return this.creditAmount + this.taxAmount;
      else 
      return this.creditAmount;
    },
    isTataOrg
  },

  async created() {
    this.isLoading = true

    let resp
    try {
      resp = await API.CREDITS.FETCH_CREDIT_CONVERSION_RATE()
    } catch(err) {
      console.error(err)
      this.$message({
        showClose: true,
        message: 'There was an unknown error while fetching credit payment information.',
        type: "error",
        center: true
      })
      this.onDialogClose()
      return
    }
    this.creditPriceForCurrency = resp.data.conversion_rate
    this.taxRate = resp.data.tax_rate/100       // Divide by 100 as the backend sends it as percentage
    this.taxText = resp.data.tax_description
    
    let orgDetails = JSON.parse(localStorage.getItem('organisation')) || {}
    if (!orgDetails.currency_code) {
      orgDetails = await fetchOrganisationDetails()
    }
    this.currency_code = orgDetails.currency_code
    // Currency will either be INR or USD, for now
    if (this.currency_code != 'INR') {
      this.currency_code = 'USD'
    }

    this.isLoading = false
  },

  mounted() {
    this.form.creditCount = Math.ceil(this.preFilledCreditCount)
  },

  methods: {
    ...mapActions(useCreditsStore, ["UPDATE_CREDIT_BALANCE"]),
    onDialogClose() {
      this.$emit("update:isAddCreditPopupVisible", false);
    },
    async openPaymentGateway() {
      
      // To show alert when user is closing the tab before finishing the payment
      window.addEventListener('beforeunload', this.showAlertWhenClosingWindow)

      let vm = this

      if (!this.form.creditCount) {
        this.$message({
          showClose: true,
          message: 'Please enter a valid credit amount.',
          type: "error",
          center: true
        });
        return
      }
      
      this.isLoading = true

      if (this.currency_code == 'INR') {
        // this.isCashfree = true
        this.paymentGateway = 'razorpay'
      } else {
        // this.isCashfree = false
        this.paymentGateway = 'stripe'
      }

      let totalAmount = +this.totalAmount.toFixed(2)
      let paymentData = {
        amount: totalAmount
      }

      let orderResp
      try {
        orderResp = await API.PAYMENTS.CREATE_PAYMENT_ORDER(paymentData)
      } catch {
        this.$message({
          showClose: true,
          message: 'There was an error initiating the payment.',
          type: "error",
          center: true
        });
        this.isLoading = false  
        return
      }

      // No need to open the popup for Razorpay as it has its own popup for the gateway.
      if (this.paymentGateway != 'razorpay') {
        this.isPaymentGatewayPopupVisible = true
      }

      // Delay required for DOM elements to be available for render, for the payment gateway UI
      await new Promise(resolve => setTimeout(resolve, 500))

      this.isLoading = false
      let errorMessageText = "There was an error while initiating the payment."

      if (this.paymentGateway == 'razorpay') {
        let orderId = orderResp.data.order_id
        var options = {
          "key": RAZORPAY_KEY, // Enter the Key ID generated from the Dashboard
          "amount": totalAmount*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": "INR",
          // "name": "Acme Corp",
          // "description": "Test Transaction",
          // "image": "https://example.com/your_logo",
          "order_id": orderId,
          "handler": vm.handlePaymentSuccess,
          "prefill": {
            // "name": "Gaurav Kumar",
            // "email": "gaurav.kumar@example.com",
            // "contact": "9999999999"
          },
          "notes": {
            // "address": "Razorpay Corporate Office"
          },
          "theme": {
            // "color": "#3399cc"
          }
        };
        let Razorpay = window.Razorpay
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response){
          console.log("Razorpay FAILED")
          console.log(response)
          let message = {
            showClose: true,
            type: "error",
            center: true
          }
          if (response.error && response.error.description) {
            errorMessageText = data.transaction.txMsg
          }
          message.message = errorMessageText
          vm.$message(message)
        });
        rzp1.open();
      } else if (this.paymentGateway == 'cashfree') {
        // Cashfree
        let orderToken = orderResp.data.order_token
      
        let cashfreeObj = new cashfree.Cashfree()
        cashfreeObj.initialiseDropin(this.$refs['cashfree-payment-element'], {
          orderToken: orderToken,
          onSuccess: vm.handlePaymentSuccess,
          onFailure: function(data) {
            console.log("CASHFREE FAILED")
            console.log(data)
            vm.isPaymentGatewayPopupVisible = false
            let message = {
              showClose: true,
              type: "error",
              center: true
            }
            if (data.transaction) { errorMessageText = data.transaction.txMsg }
            message.message = errorMessageText
            vm.$message(message)
          },
          components: [
            "order-details",
            "card",
            "netbanking",
            "app",
            "upi",
            "paylater",
            "creditcardemi",
            "cardlessemi",
          ],
          style: {
            "theme": "light",
          },
        })
      } else {
        // Stripe
        const stripe = await loadStripe(STRIPE_PK);
        
        let clientSecret = orderResp.data.clientSecret
        if (!clientSecret) {
          console.log(orderResp)
          let message = {
            showClose: true,
            type: "error",
            center: true,
            message: errorMessageText
          }
          vm.$message(message)
          return
        }

        let appearance = {
          theme: 'stripe',
        };
        let elements = stripe.elements({ appearance, clientSecret });
        const paymentElement = elements.create("payment");
        paymentElement.mount("#stripe-payment-element");

        let payNowButton = this.$refs['stripe-pay-button'].$el
        console.log(payNowButton)
        payNowButton.onclick = async () => {
          this.isLoading = true
          let resp = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
          });
          console.log(resp)

          if (resp.paymentIntent && resp.paymentIntent.status == 'succeeded') {
            vm.handlePaymentSuccess(resp)
          } else {
            console.log(resp)
            this.isLoading = false
            if (resp.error) {
              vm.$message({
                showClose: true,
                message: resp.error.message,
                type: "error",
                center: true
              });
              return
            }
          }
        }
      }
    },
    async handlePaymentSuccess(data) {
      this.isPaymentGatewayPopupVisible = false
      this.isLoading = true
      window.removeEventListener('beforeunload', this.showAlertWhenClosingWindow)
      
      let statusData
      if (this.paymentGateway == 'razorpay') {
        statusData = data
      } else if (this.paymentGateway == 'cashfree') {
        statusData = { order_id: data.order.orderId }
      } else {
        statusData = { order_id: data.paymentIntent.id }
      }

      let resp
      try {
        resp = await API.PAYMENTS.VERIFY_PAYMENT_STATUS(statusData)
      } catch {
        this.isLoading = false
        this.$message({
          showClose: true,
          message: 'There was an error while verifying the payment. Please reach out to us.',
          type: "error",
          center: true
        })
        return
      }
      console.log(resp)

      if (resp.data.purchased_credits) {
        this.UPDATE_CREDIT_BALANCE(resp.data)
        this.$message({
          showClose: true,
          message: 'Credits have been succesfully added.',
          type: "success",
          center: true
        })

        this.onDialogClose()
        this.$emit('update-history-table')
      } else {
        this.$message({
          showClose: true,
          message: 'An unknown error occurred.',
          type: "error",
          center: true
        })
      }
      this.isLoading = false
    },
    formatNumberWithCommas,
    showAlertWhenClosingWindow(event) {
      event.preventDefault();
      event.returnValue = "Are you sure you want to exit?";
    }
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.showAlertWhenClosingWindow)
  },
};
</script>


<style scoped>

#parentContainer >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

#parentContainer >>> .el-dialog__title {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 8px !important;
  margin-top: 4vh !important;
  overflow: hidden;
  height: auto !important;
  min-height: auto;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

#parentContainer >>> .el-form-item__label {
  color: #222;
  font-size: 16px;
}

#parentContainer >>> .el-form-item__content {
  max-width: 144px;
}
#parentContainer >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
}

.container {
  display: grid;
  grid-template-columns: 55% 45%;
  word-break: break-word;
  height: 400px;
}

.leftContainer {
  border-right: 1px solid #ccc;
  padding: 16px 16px 24px 24px;
  position: relative;
}

.rightContainer {
  padding: 24px 24px 24px 16px;
}

.headerContainer {
  border-bottom: 1px solid #ccc;
  padding-bottom: 12px;
}

.headings {
  font-size: 18px;
  font-weight: 600;
  color: #1c3366;
  margin-bottom: 8px;
}

.selectedPayments {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  min-height: 179px;
}

#parentContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

#parentContainer >>> ::placeholder {
  color: #222;
}

.serviceTax {
  margin-top: 10px;
}

.note {
  color: #777;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.footer {
  position: absolute;
  bottom: 24px;
  width: 90%;
}

.footerContent {
  font-size: 14px;
  font-weight: 100;
  color: #222;
  line-height: 1.5;
}

.supportTeam {
  font-weight: 500;
  color: #1c3366;
  cursor: pointer;
  text-decoration: underline;
}

#parentContainer >>> .el-checkbox {
  display: flex;
  margin-right: 0px;
}

#parentContainer >>> .el-checkbox__inner {
  width: 20px;
  height: 20px;
}

#parentContainer >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

#parentContainer >>> .el-checkbox__label {
  color: #222;
  font-size: 16px;
  white-space: initial;
  padding-left: 12px;
}

.footer >>> .el-checkbox__label {
  color: #222;
  font-size: 14px;
  white-space: initial;
  padding-left: 12px;
}

#parentContainer >>> .el-checkbox__inner::after {
  top: 3px;
  left: 7px;
  border-width: 2px;
}

.packageDetails {
  display: flex;
  justify-content: space-between;
}

.details,
.detailsValue {
  font-size: 16px;
  color: #222;
}

.detailsSmall {
  font-size: 14px;
  color: #222;
}

.footerBtnContainer {
  padding: 16px 0px 0px 0px;
}

.totalPayCred,
.totalPayCredVal {
  font-weight: 600;
  font-size: 16px;
  color: #222;
  padding-bottom: 21px;
}

.footerBtn {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
}

.footerMD {
  display: none;
}

#parentContainer >>> .payment-dialog {
  margin-top: 0 !important;
  max-height: none !important;
}

.payment-dialog >>> .el-dialog__body {
  max-height: 85vh;
  overflow-y: auto;
}

.purchase-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
  align-items: center;
}

.purchase-info .purchase-description {
  color: gray;
}

.purchase-info .purchase-amount {
  font-size: 2em;
  color: black;
}

@media (max-width: 1000px) {
  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
    margin-top: 0vh !important;
    max-height: auto !important;
  }

  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
    height: auto;
  }

  #parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  #parentContainer >>> .el-dialog__body {
    overflow: hidden;
    overflow-y: scroll;
    max-height: 76vh;
    margin-bottom: 16px;
  }

  .container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .leftContainer {
    padding: 8px 16px 16px 16px;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .rightContainer {
    padding: 16px 16px 0px 16px;
  }

  .footer {
    display: none;
  }

  .footerContent {
    margin-bottom: 16px;
}

  .footerMD {
    display: inherit;
  }
}
</style>