<template>
  <div id="parentContainer">
    <el-dialog
      :visible="isGenericPayNowPopupVisible"
      :close-on-click-modal="false"
      title="Order Details"
      width="976px"
      @close="onDialogClose"
    >
      <div class="container">
        <div class="leftContainer">
          <div class="headerContainer">
            <h3 class="headings">Permit Package with Battery</h3>
            <p class="headContent">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua.
            </p>
          </div>
          <div class="drpDownContainer">
            <el-select v-model="value" placeholder="Select">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="checkBoxContainer">
            <el-checkbox v-model="checked"
              >PE Electrical (119 Credits) - 2 Working Days
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The percentage of system cost minus grants that will be
                    financed with the loan
                  </p>
                </div>
              </div>
            </el-checkbox>
            <el-checkbox v-model="checked"
              >PE Structural (119 Credits) - 2 Working Days
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The percentage of system cost minus grants that will be
                    financed with the loan
                  </p>
                </div>
              </div>
            </el-checkbox>
            <el-checkbox v-model="checked"
              >Nearmap Hi-Res Imagery (5 Credits)
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The percentage of system cost minus grants that will be
                    financed with the loan
                  </p>
                </div>
              </div>
            </el-checkbox>
            <el-checkbox v-model="checked"
              >Nearmap 3D Data (5 Credits)
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The percentage of system cost minus grants that will be
                    financed with the loan
                  </p>
                </div>
              </div>
            </el-checkbox>
          </div>
          <div class="footer">
            <p class="note">
              <span class="boldTxt">Note:</span>
              Our design team will only create the design in the software.
            </p>
            <el-checkbox v-model="checked">
              <p class="agreeContent">
                I agree that after ordering this service, we will fill up the
                consumption, incentives and financial data in the order and
                download the report.
              </p>
            </el-checkbox>
          </div>
        </div>
        <div class="rightContainer">
          <div class="headerContainer">
            <h3 class="headings">Payment Details</h3>
            <div class="packageDetails">
              <p class="details">Permit Package</p>
              <p class="detailsValue">119 Credits</p>
            </div>
          </div>
          <div class="selectedPayments">
            <div class="packageDetails">
              <p class="detailsSmall">PE Electrical</p>
              <p class="detailsValue">10 Credits</p>
            </div>
            <div class="packageDetails">
              <p class="detailsSmall">PE Structural</p>
              <p class="detailsValue">10 Credits</p>
            </div>
            <div class="packageDetails">
              <p class="detailsSmall">Nearmap Hi-Res Imagery</p>
              <p class="detailsValue">5 Credits</p>
            </div>
            <div class="packageDetails">
              <p class="detailsSmall">Nearmap 3D Data</p>
              <p class="detailsValue">5 Credits</p>
            </div>
          </div>
          <div class="estDeleiveryTimeContainerOne">
            <div class="packageDetails">
              <p class="details">Estimated Delivery Time</p>
              <p class="detailsValue">3 Working Day</p>
            </div>
          </div>
          <div class="estDeleiveryTimeContainerTwo">
            <h3 class="creditBal">Credit Balance</h3>
            <div class="packageDetails">
              <div class="crdtBalChkBoxContainer">
                <el-checkbox v-model="checked"
                  >Promotional Credit Balance
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Use your bonus credits for sales proposals, revision requests, self-design creation, and some upgrades on a design level.
                      </p>
                    </div>
                  </div>
                </el-checkbox>
              </div>
              <p class="details">0</p>
            </div>
          </div>
          <div class="purCredBalContainer">
            <div class="packageDetails">
              <p class="detailsSmall">Purchased Credit Balance</p>
              <p class="detailsValue">0</p>
            </div>
          </div>
          <div class="footerBtnContainer">
            <div class="packageDetails">
              <p class="totalPayCred">Total Payable Credits:</p>
              <p class="totalPayCredVal">179</p>
            </div>
            <el-button class="footerBtn" type="primary"
              >Add 179 Credits</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
    
    <script>
export default {
  name: "GenericPayNowPopup",

  props: {
    isGenericPayNowPopupVisible: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      checked: true,
      isAddCreditPopup: false,
      form: {
        name: "",
      },
      options: [
        {
          value: "Option1",
          label: "Option1",
        },
        {
          value: "Option2",
          label: "Option2",
        },
        {
          value: "Option3",
          label: "Option3",
        },
        {
          value: "Option4",
          label: "Option4",
        },
        {
          value: "Option5",
          label: "Option5",
        },
      ],
      value: "",
    };
  },

  methods: {
    onDialogClose() {
      this.$emit("update:isGenericPayNowPopupVisible", false);
    },
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
  height: 592px;
  /* overflow-y: auto; */
  margin-top: 4vh !important;
  overflow: hidden;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

#parentContainer >>> .el-form-item__label {
  color: #222;
  font-size: 16px;
}

#parentContainer >>> .el-select {
  max-width: 290px;
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
  grid-template-columns: 60% 40%;
  word-break: break-word;
}

.leftContainer {
  border-right: 1px solid #ccc;
  padding: 24px 16px 24px 24px;
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

.headContent {
  font-size: 14px;
  font-weight: 100;
  color: #222;
  line-height: 1.5;
}

.drpDownContainer,
.checkBoxContainer,
.purCredBalContainer,
.estDeleiveryTimeContainerOne,
.estDeleiveryTimeContainerTwo {
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: auto;
  gap: 13px;
}

.estDeleiveryTimeContainerTwo {
  border-bottom: none;
  padding-bottom: 0px;
}

.selectedPayments {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  min-height: 143px;
}

#parentContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

#parentContainer >>> ::placeholder {
  color: #222;
}

.hover_information {
  display: inline-block;
  position: relative;
  margin-left: 4px;
}

.hover_information .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 300px;
  left: -15px;
  bottom: 75%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
  z-index: 100;
}

.hover_information .tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
  white-space: initial;
}
.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.fa-info-circle {
  color: #777;
}

.footer {
  margin-top: 10px;
}

.note {
  color: #777;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.boldTxt {
  font-weight: 600;
  color: #222;
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

.agreeContent {
  font-size: 14px;
  line-height: 1.5;
  white-space: initial;
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

.creditBal {
  color: #1c3366;
  font-size: 16px;
  font-weight: 600;
}

.footerBtnContainer {
  padding: 16px 0px 24px 0px;
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
    height: 76vh;
    margin-bottom: 16px;
  }

  .container {
    grid-template-columns: 1fr;
  }

  .leftContainer {
    padding: 16px 16px 16px 16px;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .rightContainer {
    padding: 16px 16px 0px 16px;
  }
}
</style>