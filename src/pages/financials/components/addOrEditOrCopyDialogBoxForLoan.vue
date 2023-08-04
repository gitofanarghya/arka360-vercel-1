<template>
  <div class="deleteModule">
    <el-dialog
      :visible="isAddOrEditOrCopyLoanPopupOpen"
      :close-on-click-modal="false"
      :title="heading"
      width="45%"
      class="delete_module"
      @close="$emit('cancelAdd')"
    >
      <div class="container">
        <!-- -----------------input Container--------- -->
        <div class="scrollableCont">
          <div class="inputContainer">
            <el-form ref="form" :model="form">
              <!-- -----------------Input One--------- -->
              <div class="inputOne">
                <el-form-item
                  :label="'Enter ' + typeOfTab + ' Name*'"
                  class="firstInput"
                >
                  <el-input
                    v-model="form.name"
                    @input="EnterProjectName"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="projectNameInvalid"
                    
                  >
                    {{ nameField }}
                  </p>
                </el-form-item>
              </div>
              <div></div>

              <!-- -----------------other Four Inputs--------- -->
              <div class="inputs">
                <el-form-item label="Project Type*"
                  ><br />
                  <el-select
                    v-model="form.project_type"
                    placeholder="Select Project Type"
                    @change="SelectProjectType"
                  >
                    <el-option
                      v-for="(project_type, index) in project_type"
                      :key="index"
                      :label="project_type.label"
                      :value="project_type.value"
                    ></el-option>
                  </el-select>
                  <p
                    class="validationCss"
                    v-if="projectTypeInvalid"
                    
                  >
                    {{ project_typeField }}
                  </p>
                </el-form-item>
                <el-form-item label="Loan Type*"
                  ><br />

                  <el-select
                    v-model="form.loan_type"
                    placeholder="Select Loan Type"
                    @change="SelectLoanType"
                  >
                    <el-option
                      v-for="(loan_type, index) in loan_type"
                      :key="index"
                      :label="loan_type.label"
                      :value="loan_type.value"
                      :summary="loan_type.summary"
                      class="loanDropdown"
                      ><h3 class="labelDropdown">{{ loan_type.label }}</h3>
                      <p class="descDropdown">{{ loan_type.summary }}</p>
                      <hr />
                    </el-option>
                  </el-select>
                  <p
                    class="validationCss"
                    v-if="loanTypeInvalid"
                    
                  >
                    {{ loan_typeField }}
                  </p>
                </el-form-item>

                <el-form-item label="Principal*">
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        The percentage of system cost minus grants that will be
                        financed with the loan
                      </p>
                    </div>
                  </div>

                  <span class="inputValues">%</span>
                  <el-input
                    v-model="form.principal_amount"
                    type="Number"
                    min="0"
                    @input="IsPrincipalAmount()"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="principalAmountExceed"
                    
                  >
                    {{ principalIsInvalid }}
                  </p>
                  <p
                    class="validationCss"
                    v-if="principalAmountInvalid"
                    
                  >
                    {{ principal_amountField }}
                  </p>
                </el-form-item>
                <el-form-item
                  v-if="
                    form.loan_type === 'bullet' ||
                    form.loan_type === 'mortgage_style'
                  "
                  label="Interest Rate *"
                >
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        The proportion of a loan that is charged as interest to
                        the borrower, expressed as an annual percentage of the
                        loan outstanding
                      </p>
                    </div>
                  </div>
                  <span class="inputValues">%</span>
                  <el-input
                    v-model="form.interest_rate"
                    type="Number"
                    min="0"
                    @input="IsInterestRate()"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="interestRateExceed"
                    
                  >
                    {{ interest_rateIsInvalid }}
                  </p>
                  <p
                    class="validationCss"
                    v-if="interestRateInvalid"
                    
                  >
                    {{ interest_rateField }}
                  </p>
                </el-form-item>

                <el-form-item
                  v-if="
                    form.loan_type === 'bullet' ||
                    form.loan_type === 'mortgage_style'
                  "
                  label="Duration*"
                >
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>The term of the loan in months</p>
                    </div>
                  </div>
                  <span class="inputValues">Months</span>
                  <el-input
                    v-model="form.duration"
                    type="Number"
                    min="0"
                    max="600"
                    @input="IsDuration()"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="durationInvalid"
                    
                  >
                    {{ monthField }}
                  </p>
                   <p
                    class="validationCss"
                    v-if="durationInvalidExceeds"
                    
                  >
                    {{ monthFieldExceeds }}
                  </p>
                </el-form-item>
              </div>

              <!-- --------------------border container---------- -->
              <div
                v-if="form.loan_type === 'interest_only'"
                class="termOneContainer"
              >
                <hr class="interestHr" />
                <h3 class="termsHeading">Term 1: Interest Only</h3>
                <el-form ref="form" :model="form" class="termInputs">
                  <el-form-item label="Interest Rate*">
                    <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>
                          The proportion of a loan that is charged as interest
                          to the borrower, expressed as an annual percentage of
                          the loan outstanding
                        </p>
                      </div>
                    </div>
                    <span class="inputValues">%</span>
                    <el-input
                      v-model="form.interest_rate_for_term_one"
                      type="Number"
                      min="0"
                      @input="IsInterest_rate_for_term_one"
                    ></el-input>
                    <p
                      class="validationCss"
                      v-if="interestRateExceedInterestOnly"
                      
                    >
                      {{ interest_rateIsInvalid }}
                    </p>
                    <p
                      class="validationCss"
                      v-if="interest_rate_for_term_oneInvalidINterestOnly"
                      
                    >
                      {{ interest_rate_for_term_oneField }}
                    </p>
                  </el-form-item>

                  <el-form-item label="Duration*">
                    <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>The term of the loan in months</p>
                      </div>
                    </div>
                    <span class="inputValues">Months</span>
                    <el-input
                      v-model="form.duration_for_term_one"
                      type="Number"
                      min="0"
                      max="600"
                      @input="IsDuration_for_term_one"
                    ></el-input>
                    <p
                      class="validationCss"
                      v-if="monthValidationForTermOneInvalid"
                      
                    >
                      {{ duration_for_term_oneField }}
                    </p>
                     <p
                      class="validationCss"
                      v-if="monthValidationForTermOneExceeded"
                      
                    >
                      {{ duration_for_term_oneFieldExceeds }}
                    </p>
                  </el-form-item>

                  <!-- --------------------border container---------------->
                  <div class="borderContainer">
                    <el-form-item :label="isPaid" class="borderContainerRadio">
                      <div class="hover_information">
                        <i class="fas fa-info-circle"></i>
                        <div class="tooltip">
                          <p>
                            If this is checked, the prepayment percent of the
                            loan will be paid down in the specified month, which
                            keeps the loan payments the same. If this is not
                            checked, the prepayment will not be made, resulting
                            in higher monthly loan payments.
                          </p>
                        </div>
                      </div>
                      <br />
                      <el-radio v-model="radioValue" label="true">Yes</el-radio>
                      <el-radio v-model="radioValue" label="false">No</el-radio>
                    </el-form-item>

                    <el-form-item
                      :label="isPrePercentage"
                      class="borderContainerInputs"
                    >
                      <div class="hover_information">
                        <i class="fas fa-info-circle"></i>
                        <div class="tooltip">
                          <p>
                            The percentage of the loan that will be paid of
                            early
                          </p>
                        </div>
                      </div>
                      <span class="inputValues">%</span>
                      <el-input
                        v-model="form.pre_payment_percentage"
                        type="Number"
                        min="0"
                        :disabled="!isDisableInterest"
                        @input="IsPrePaymentPercentage()"
                      ></el-input>
                      <p
                        class="validationCss"
                        v-if="prepaymentExceed && isDisabled"
                        
                      >
                        {{ prePaymentIsInvalid }}
                      </p>
                      <p
                        class="validationCss"
                        v-if="pre_payment_percentageInvalid && isDisabled"
                        
                      >
                        {{ prepaidField }}
                      </p>
                    </el-form-item>

                    <el-form-item
                      :label="isPreMonth"
                      class="borderContainerInputs"
                    >
                      <div class="hover_information">
                        <i class="fas fa-info-circle"></i>
                        <div class="tooltip">
                          <p>
                            The month that the repayment will be paid to the
                            lender and the loan will be remortized
                          </p>
                        </div>
                      </div>
                      <span class="inputValues">Month</span>
                      <el-input
                        v-model="form.pre_payment_month"
                        type="Number"
                        min="0"
                        :disabled="!isDisableInterest"
                        @input="IsPrePaymentMonth()"
                      ></el-input>
                      <p
                        class="validationCss"
                        v-if="pre_payment_monthInvalid && isDisabled"
                        
                      >
                        {{ pre_payment_monthField }}
                      </p>
                      <p
                        class="validationCss"
                        v-if="pre_payment_monthInvalidExceeeded && isDisabled"
                        
                      >
                        {{ pre_payment_monthFieldExceeds }}
                      </p>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
              <div
                v-if="form.loan_type === 'no_payment'"
                class="termOneContainer"
              >
                <hr class="nopaymentHr" />
                <h3 class="termsHeading">Term 1: No Payment</h3>
                <el-form ref="form" :model="form" class="termInputs">
                  <el-form-item label="Interest Rate*">
                    <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>
                          The proportion of a loan that is charged as interest
                          to the borrower, expressed as an annual percentage of
                          the loan outstanding
                        </p>
                      </div>
                    </div>
                    <span class="inputValues">%</span>
                    <el-input
                      v-model="form.interest_rate_for_term_one"
                      type="Number"
                      min="0"
                      @input="IsInterest_rate_for_term_one_forNoPay()"
                    ></el-input>
                    <p
                      class="validationCss"
                      v-if="interestRateExceedNoPayment"
                      
                    >
                      {{ interest_rateIsInvalid }}
                    </p>
                    <p
                      class="validationCss"
                      v-if="interest_rate_for_term_oneNoPayment"
                      
                    >
                      {{ interest_rate_for_term_oneField }}
                    </p>
                  </el-form-item>

                  <el-form-item label="Duration*">
                    <div class="hover_information">
                      <i class="fas fa-info-circle"></i>
                      <div class="tooltip">
                        <p>The term of the loan in months</p>
                      </div>
                    </div>
                    <span class="inputValues">Months</span>
                    <el-input
                      v-model="form.duration_for_term_one"
                      type="Number"
                      min="0"
                      max="600"
                      @input="IsDuration_for_term_one_ForNoPay()"
                    ></el-input>
                    <p
                      class="validationCss"
                      v-if="monthValidationForTermOneInvalid"
                      
                    >
                      {{ duration_for_term_oneField }}
                    </p>
                    <p
                      class="validationCss"
                      v-if="monthValidationForTermOneExceeded"
                      
                    >
                      {{ duration_for_term_oneFieldExceeds }}
                    </p>
                  </el-form-item>
                </el-form>
              </div>
              <div
                v-if="
                  form.loan_type === '' || form.loan_type === 'mortgage_style'
                "
                class="borderContainer"
              >
                <el-form-item :label="isPaid" class="borderContainerRadio">
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        If this is checked, the prepayment percent of the loan
                        will be paid down in the specified month, which keeps
                        the loan payments the same. If this is not checked, the
                        prepayment will not be made, resulting in higher monthly
                        loan payments
                      </p>
                    </div>
                  </div>
                  <br />

                  <el-radio v-model="radioValue" label="true">Yes</el-radio>
                  <el-radio v-model="radioValue" label="false">No</el-radio>
                  <p
                    class="validationCss"
                    v-if="prepaymentInvalid"
                    
                  >
                    {{ prepaidField }}
                  </p>
                </el-form-item>

                <el-form-item
                  :label="isPrePercentage"
                  class="borderContainerInputs"
                >
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        The percentage of the loan that will be paid of early
                      </p>
                    </div>
                  </div>
                  <span class="inputValues">%</span>
                  <el-input
                    v-model="form.pre_payment_percentage"
                    type="Number"
                    min="0"
                    :disabled="!isDisabled"
                    @input="IsPrePaymentPercentage()"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="prepaymentExceed && isDisabled"
                    
                  >
                    {{ prePaymentIsInvalid }}
                  </p>
                  <p
                    class="validationCss"
                    v-if="pre_payment_percentageInvalid && isDisabled"
                    
                  >
                    {{ prepaidField }}
                  </p>
                </el-form-item>

                <el-form-item :label="isPreMonth" class="borderContainerInputs">
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        The month that the repayment will be paid to the lender
                        and the loan will be remortized
                      </p>
                    </div>
                  </div>
                  <!-- <span class="inputValues">%</span> -->
                  <el-input
                    v-model="form.pre_payment_month"
                    type="Number"
                    min="0"
                    :disabled="!isDisabled"
                    @input="IsPrePaymentMonthForNoPay()"
                  ></el-input>
                  <p
                    class="validationCss"
                    v-if="pre_payment_monthInvalid && isDisabled"
                    
                  >
                    {{ pre_payment_monthField }}
                  </p>
                </el-form-item>
              </div>
            </el-form>
          </div>
          <!------------------------termTwo--------------------------------->
          <div
            v-if="
              form.loan_type === 'interest_only' ||
              form.loan_type === 'no_payment'
            "
            class="termTwoContainer"
          >
            <hr />
            <h3 class="termsHeading">Term 2: Mortgage-Style</h3>
            <el-form ref="form" :model="form" class="termInputs">
              <el-form-item label="Interest Rate*">
                <div class="hover_information">
                  <i class="fas fa-info-circle"></i>
                  <div class="tooltip">
                    <p>
                      The proportion of a loan that is charged as interest to
                      the borrower, expressed as an annual percentage of the
                      loan outstanding
                    </p>
                  </div>
                </div>
                <span class="inputValues">%</span>
                <el-input
                  v-model="form.interest_rate_for_term_two"
                  type="Number"
                  min="0"
                  @input="IsInterest_rate_for_term_two_ForMortagage()"
                ></el-input>
                <p
                  class="validationCss"
                  v-if="interestRateExceedForMortgage"
                  
                >
                  {{ interest_rateIsInvalid }}
                </p>
                <p
                  class="validationCss"
                  v-if="interest_rate_for_term_TwoInvalid"
                  
                >
                  {{ interest_rate_for_term_twoField }}
                </p>
              </el-form-item>

              <el-form-item label="Duration*">
                <div class="hover_information">
                  <i class="fas fa-info-circle"></i>
                  <div class="tooltip">
                    <p>The term of the loan in months</p>
                  </div>
                </div>
                <span class="inputValues">Months</span>
                <el-input
                  v-model="form.duration_for_term_two"
                  type="Number"
                  min="0"
                  max="600"
                  @input="IsDurationForTermTwo()"
                ></el-input>
                <p
                  class="validationCss"
                  v-if="duration_for_term_twoInvalid"
                  
                >
                  {{ duration_for_term_twoField }}
                </p>
                  <p
                  class="validationCss"
                  v-if="duration_for_term_twoInvalidExceeded"
                  
                >
                  {{ duration_for_term_twoFieldExceeds }}
                </p>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <!-- --------------------bottom info---------- -->
        <div class="bottomInfo">
          <hr />
          <p style="word-break: break-word">
            {{ getDescription() }}
          </p>
        </div>

        <!-- -----------------button--------- -->
        <div class="popupBtnContainer">
          <el-button
            v-if="typeOfOperation === 'Add' || typeOfOperation === 'Copy'"
            class="popupBtn"
            type="primary"
            @click="addLoan"
            >{{ typeOfOperation }} {{ typeOfTab }}</el-button
          ><el-button
            v-if="typeOfOperation === 'Edit'"
            class="popupBtn"
            type="primary"
            @click="addLoan"
            >Update {{ typeOfTab }}</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: [
    "isAddOrEditOrCopyLoanPopupOpen",
    "typeOfTab",
    "editOrCopyObj",
    "typeOfOperation",
  ],
  data() {
    return {
      monthValidationForTermOneExceeded: false,
      projectNameInvalid: false,
      projectTypeInvalid: false,
      loanTypeInvalid: false,
      principalAmountInvalid: false,
      principalAmountExceed: false,
      incentiveInvalid: false,
      interestTaxInvalid: false,
      interestRateInvalid: false,
      interestRateExceed: false,
      interestRateExceedForMortgage: false,
      interestRateExceedInterestOnly: false,
      interestRateExceedNoPayment: false,
      durationInvalid: false,
      durationInvalidExceeds: false,
      durationForTermOneInvalid: false,
      interest_rate_for_term_oneInvalidINterestOnly: false,
      interest_rate_for_term_oneInvalid: false,
      interest_rate_for_term_TwoInvalid: false,
      monthValidationForTermOneInvalid: false,
      monthValidationForTermOneExceeded: false,
      prepaidInvalid: false,
      prepaymentInvalid: false,
      radioValue: "false",
      pre_payment_percentageInvalid: false,
      prepaymentExceed: false,
      pre_payment_monthInvalid: false,
      pre_payment_monthInvalidExceeeded: false, 
      interest_rate_for_term_oneNoPayment: false,
      interest_rate_for_term_twoInvalid: false,
      duration_for_term_twoInvalid: false,
      form: {
        name: "",
        principal_amount: 0,
        interest_rate_for_term_one: 0,
        interest_rate_for_term_two: 0,
        pre_payment_month: 0,
        pre_payment_percentage: 0,
        duration_for_term_one: 12,
        duration_for_term_two: 12,
        prepaid: false,
        interest_rate: 0,
        duration: 12,

        delivery: "",
        type: [],

        desc: "",
        loan_type: "",
        project_type: "",
        description: "",
        msg: "abc",
        will_be_pre_paid: false,
      },
      nameField: "* This field is required",
      project_typeField: "* This field is required",
      loan_typeField: "* This field is required",
      principal_amountField: "* Enter Amount Between 0-100",
      principalIsInvalid: "* Enter Valid Percentage",
      interest_rateField: "* This field is required",
      duration_for_term_twoInvalidExceeded: false,
      interest_rateIsInvalid: "* Enter Amount Between 0-100 ",
      monthField: "* Enter Value above 0",
      monthFieldExceeds: "* Duration must be less than 600",
      interest_rate_for_term_oneField: "* This field is required",
      duration_for_term_oneField: "* Enter Value above 0",
      duration_for_term_oneFieldExceeds: "* Duration must be less than 600",
      prepaidField: "* This field is required",
      pre_payment_percentageField: "* Pre-Payment Percentage",
      prePaymentIsInvalid: "* Enter Amount Between 0-100",
      pre_payment_monthField: "* Enter Value above 0",
      pre_payment_monthFieldExceeds: "* Duration must be less than 600",
      duration_for_term_oneFieldExceeds: "* Duration must be less than 600",
      interest_rate_for_term_twoField: "* This field is required",
      duration_for_term_twoField: "* Enter Value above 0",
      duration_for_term_twoFieldExceeds: "* Duration must be less than 600",
      rateField: "* This field is required",

      loan_type: [
        {
          value: "bullet",
          label: "Bullet",
          summary:
            "Interest and the principal will be at the and of the loan term",
        },
        {
          value: "mortgage_style",
          label: "Mortgage-Style",
          summary:
            "No payments with one month solar loan, and constant payments with an expected ITC buy down",
        },
        {
          value: "interest_only",
          label: "Interest Only",
          summary:
            "Paying interest two-term loan only for the first term, and regular mortgage after",
        },
        {
          value: "no_payment",
          label: "No Payment",
          summary:
            "No payments for the first term with two-term loan, and regular mortgage after",
        },
      ],
      project_type: [
        {
          label: "Residential",
          value: "residential",
        },
        {
          label: "Commercial",
          value: "commercial",
        },
      ],
    };
  },
  watch: {
    // "form.name": {
    //   handler(val) {
    //     if (val == "") {
    //       this.projectNameInvalid = true;
    //     } else {
    //       this.projectNameInvalid = false;
    //     }
    //   },
    // },
    // "form.project_type": {
    // handler(val) {
    // if (val == "") {
    // this.projectTypeInvalid = true;
    //} else {
    //this.projectTypeInvalid = false;
    // }
    //},
    // },
    // "form.loan_type": {
    //  handler(val) {
    //   if (val == "") {
    //    this.loanTypeInvalid = true;
    //  } else {
    //  this.loanTypeInvalid = false;
    // }
    // },
    // },
    /*  "form.principal_amount": {
      handler(val) {
        console.log("watcher calling for priciple amount");
        if (val === "") {
          this.principalAmountInvalid = true;
        } else {
          this.principalAmountInvalid = false;
        }
      },
    }, */
    /* "form.interest_rate": {
      handler(val) {
        if (val === "") {
          this.interestRateInvalid = true;
        } else {
          this.interestRateInvalid = false;
        }
      },
    },
    "form.duration": {
      handler(val) {
        if (val === "") {
          this.durationInvalid = true;
        } else {
          this.durationInvalid = false;
        }
      },
    },
    "form.pre_payment_percentage": {
      handler(val) {
        if (val === "") {
          this.pre_payment_percentageInvalid = true;
        } else {
          this.pre_payment_percentageInvalid = false;
        }
      },
    },
    "form.pre_payment_month": {
      handler(val) {
        if (val === "") {
          this.pre_payment_monthInvalid = true;
        } else {
          this.pre_payment_monthInvalid = false;
        }
      },
    },
    "form.interest_rate_for_term_two": {
      handler(val) {
        if (val === "") {
          this.interest_rate_for_term_TwoInvalid = true;
        } else {
          this.interest_rate_for_term_TwoInvalid = false;
        }
      },
    },
    "form.duration_for_term_one": {
      handler(val) {
        if (val === "") {
          this.monthValidationForTermOneInvalid = true;
        } else {
          this.monthValidationForTermOneInvalid = false;
        }
      },
    },
    "form.interest_rate_for_term_one": {
      handler(val) {
        if (val === "") {
          this.interest_rate_for_term_oneInvalidINterestOnly = true;
        } else {
          this.interest_rate_for_term_oneInvalidINterestOnly = false;
        }
      },
    },
    "form.Interest_rate_for_term_one": {
      handler(val) {
        if (val === "") {
          this.interest_rate_for_term_oneNoPayment = true;
        } else {
          this.interest_rate_for_term_oneNoPayment = false;
        }
      },
    },
    "form.duration_for_term_two": {
      handler(val) {
        if (val === "") {
          this.duration_for_term_twoInvalid = true;
        } else {
          this.duration_for_term_twoInvalid = false;
        }
      },
    }, */
    editOrCopyObj(newval) {
      switch (this.$props.typeOfOperation) {
        case "Add":
          this.form = {
            name: "",
            principal_amount: 0,
            interest_rate_for_term_one: 0,
            interest_rate_for_term_two: 0,
            pre_payment_month: 0,
            pre_payment_percentage: 0,
            duration_for_term_one: 12,
            duration_for_term_two: 12,
            prepaid: false,
            interest_rate: 0,
            duration: 12,

            desc: "",
            loan_type: "",
            project_type: "",
            will_be_pre_paid: false,
          };

          this.projectTypeInvalid = false;
          this.loanTypeInvalid = false;
          break;
        case "Edit":
          this.editOrCopyObjFunction(newval);
          break;
        case "Copy":
          this.editOrCopyObjFunction(newval);
          break;
      }
    },
  },

  methods: {
    getDescription() {
      var prePaymentPercentage = "";
      var perpaymentMonth = "";
      if (this.radioValue == "true") {
        prePaymentPercentage = ` with ${this.form.pre_payment_percentage}% prepayment in`;
        perpaymentMonth = `${this.form.pre_payment_month} month(s) `;
      }
      var des = "";
      switch (this.form.loan_type) {
        case "bullet":
          des = `Bullet loan for ${this.form.principal_amount}% will be received by the
            system owner of the project cost with an interest rate of
            ${this.form.interest_rate}% over ${this.computedDuration.years} year(s) and ${this.computedDuration.months} month(s). The owner will
            not make any payments until the last period of the loan where both
            interest and principal is paid.`;
          break;
        case "interest_only":
          des = `Interest Only loan for ${this.form.principal_amount}% of the project cost will be received by the system owner where only interest will be
            paid for the first  ${this.interestOnlyComputedDuration.years} year(s) and ${this.interestOnlyComputedDuration.months} month(s) with an interest rate of ${this.form.interest_rate_for_term_one}% per annum  ${prePaymentPercentage}  ${perpaymentMonth}  then the principal will
            be paid down over the next  ${this.mortageComputedDuration.years} year(s) and ${this.mortageComputedDuration.months} month(s) with an interest rate of ${this.form.interest_rate_for_term_two}% per annum.`;
          break;
        case "no_payment":
          des = ` No payment will be made for the first  ${this.interestOnlyComputedDuration.years} year(s) and ${this.interestOnlyComputedDuration.months} month(s) with an interest rate of ${this.form.interest_rate_for_term_one}% per annum and the
            system owner will receive a loan for ${this.form.principal_amount}% of
            the project cost where interest will accrue. Principal and interest
            will be paid down over the next ${this.mortageComputedDuration.years} year(s) and ${this.mortageComputedDuration.months} month(s) of interest rate of ${this.form.interest_rate_for_term_two}% per annum.`;
          break;
        case "mortgage_style":
          des = `Mortgage loan for ${this.form.principal_amount}% of the project cost will be recieved by the system owner with an interest rate of ${this.form.interest_rate}% over ${this.computedDuration.years} year(s) and ${this.computedDuration.months} month(s)  ${prePaymentPercentage} ${perpaymentMonth}.`;
          break;
      }
      this.form.description = des;
      return des;
    },
    closeModal() {
      this.$emit("cancelLoan");
    },
    onSubmit() {
      this.$emit("confirmOperation", this.form);
      this.form = {};
    },
    addLoan() {
      const isFormValid = this.validate();
      if (!isFormValid) {
        return;
      }
      this.form.will_be_pre_paid = this.radioValue;
      this.$emit("addLoan", this.form);
      this.form = {};
    },
    editOrCopyObjFunction(newVal) {
      if (this.$props.editOrCopyObj) {
        this.form = {
          name: "",
          principal_amount: "",
          interest_rate_for_term_one: "",
          interest_rate_for_term_two: "",
          pre_payment_month: "",
          pre_payment_percentage: "",
          duration_for_term_one: "",
          duration_for_term_two: "",
          prepaid: false,
          interest_rate: "",
          duration: "",
          desc: "",
          loan_type: "",
          project_type: "",
          will_be_pre_paid: false,
        };
        this.projectTypeInvalid = false;
        this.loanTypeInvalid = false;
        this.form.name = newVal.name;
        this.form.principal_amount = newVal.principal_amount;
        this.form.interest_rate_for_term_one =
          newVal.interest_rate_for_term_one;
        this.form.interest_rate_for_term_two =
          newVal.interest_rate_for_term_two;
        this.form.pre_payment_month = newVal.pre_payment_month;
        this.form.pre_payment_percentage = newVal.pre_payment_percentage;
        this.form.duration_for_term_one = newVal.duration_for_term_one;
        this.form.duration_for_term_two = newVal.duration_for_term_two;
        this.form.prepaid = newVal.prepaid;
        this.form.interest_rate = newVal.interest_rate;
        this.form.duration = newVal.duration;
        this.form.delivery = newVal.delivery;
        this.form.desc = newVal.desc;
        this.form.loan_type = newVal.loan_type;
        this.form.project_type = newVal.project_type;
        this.form.will_be_pre_paid = newVal.will_be_pre_paid;
        this.radioValue = newVal.will_be_pre_paid + "";
      }
    },
    validate() {
      let countValid = 0;
      if (this.form.name === "") {
        this.projectNameInvalid = true;
        countValid++;
      } else {
        this.projectNameInvalid = false;
      }
      if (this.form.project_type === "") {
        this.projectTypeInvalid = true;
        countValid++;
      } else {
        this.projectTypeInvalid = false;
      }
      if (this.form.loan_type === "") {
        this.loanTypeInvalid = true;
        countValid++;
      } else {
        this.loanTypeInvalid = false;
      }
      if (
        this.form.principal_amount <= 0 ||
        this.form.principal_amount === ""
      ) {
        this.principalAmountInvalid = true;
        countValid++;
      } else {
        this.principalAmountInvalid = false;
      }

      if (this.form.principal_amount > 100) {
        this.principalAmountExceed = true;
        countValid++;
      } else {
        this.principalAmountExceed = false;
      }
      if (
        this.form.interest_rate_for_term_one < 0 ||
        this.form.interest_rate_for_term_one === ""
      ) {
        this.interest_rate_for_term_oneInvalidINterestOnly = true;
        countValid++;
      } else {
        this.interest_rate_for_term_oneInvalidINterestOnly = false;
      }

      if (this.form.interest_rate_for_term_one > 100) {
        this.interestRateExceedInterestOnly = true;
        countValid++;
      } else {
        this.interestRateExceedInterestOnly = false;
      }

      if (this.form.interest_rate_for_term_one > 100) {
        this.interestRateExceedNoPayment = true;
        countValid++;
      } else {
        this.interestRateExceedNoPayment = false;
      }

      if (
        this.form.interest_rate_for_term_one < 0 ||
        this.form.interest_rate_for_term_one === ""
      ) {
        this.interest_rate_for_term_oneNoPayment = true;
        countValid++;
      } else {
        this.interest_rate_for_term_oneNoPayment = false;
      }

      if (
        this.form.interest_rate_for_term_two < 0 ||
        this.form.interest_rate_for_term_two === ""
      ) {
        this.interest_rate_for_term_TwoInvalid = true;
        countValid++;
      } else {
        this.interest_rate_for_term_TwoInvalid = false;
      }

      if (this.form.interest_rate_for_term_two > 100) {
        this.interestRateExceedForMortgage = true;
        countValid++;
      } else {
        this.interestRateExceedForMortgage = false;
      }

      if (this.form.pre_payment_month <= 0 && this.radioValue == "true") {
        this.pre_payment_monthInvalid = true;
        countValid++;
      } else {
        this.pre_payment_monthInvalid = false;
      }
      if (this.form.pre_payment_month > 600 && this.radioValue == "true") {
        this.pre_payment_monthInvalid = true;
        countValid++;
      } else {
        this.pre_payment_monthInvalid = false;
      }
      if (
        this.form.pre_payment_percentage < 0 ||
        this.form.pre_payment_percentage === ""
      ) {
        this.pre_payment_percentageInvalid = true;
        countValid++;
      } else {
        this.pre_payment_percentageInvalid = false;
      }

      if (this.form.pre_payment_percentage > 100) {
        this.prepaymentExceed = true;
        countValid++;
      } else {
        this.prepaymentExceed = false;
      }

      if (
        this.form.duration_for_term_one < 0 ||
        this.form.duration_for_term_one === ""
      ) {
        this.durationForTermOneInvalid = true;
        countValid++;
      } else {
        this.durationForTermOneInvalid = false;
      }
      if (
        this.form.duration_for_term_one > 600
      ) {
        this.monthValidationForTermOneExceeded = true;
        countValid++;
      } else {
        this.monthValidationForTermOneExceeded = false;
      }
      
      if (this.form.prepaid === "") {
        this.prepaymentInvalid = true;
        countValid++;
      } else {
        this.prepaymentInvalid = false;
      }
      if (this.form.interest_rate < 0 || this.form.interest_rate === "") {
        this.interestRateInvalid = true;
        countValid++;
      } else {
        this.interestRateInvalid = false;
      }

      if (this.form.interest_rate > 100) {
        this.interestRateExceed = true;
        countValid++;
      } else {
        this.interestRateExceed = false;
      }

      if (this.form.duration < 0 || this.form.duration === "") {
        this.durationInvalid = true;
        countValid++;
      } else {
        this.durationInvalid = false;
      }
      if (this.form.duration > 600) {
        this.durationInvalidExceeds = true;
        countValid++;
      } else {
        this.durationInvalidExceeds = false;
      }
      if (
        this.form.duration_for_term_two <= 0 || this.form.duration_for_term_two <= 0||
        this.form.duration_for_term_two === ""
      ) {
        this.duration_for_term_twoInvalid = true;
        countValid++;
      } else {
        this.duration_for_term_twoInvalid = false;
      }
      if (
        this.form.duration_for_term_two > 600
      ) {
        this.duration_for_term_twoInvalidExceeded = true;
        countValid++;
      } else {
        this.duration_for_term_twoInvalidExceeded = false;
      }
      if (this.form.prepaid === "") {
        this.prepaymentInvalid = true;
        countValid++;
      } else {
        this.prepaymentInvalid = false;
      }
      if (countValid === 0) {
        return true;
      } else {
        return false;
      }
    },
    EnterProjectName() {
      if (this.form.name === "") {
        this.projectNameInvalid = true;
      } else {
        this.projectNameInvalid = false;
      }
    },
    SelectProjectType() {
      if (this.form.project_type === "") {
        this.projectTypeInvalid = true;
      } else {
        this.projectTypeInvalid = false;
      }
    },
    SelectLoanType() {
      if (this.form.loan_type === "") {
        this.loanTypeInvalid = true;
      } else {
        this.loanTypeInvalid = false;
      }
    },
    IsPrincipalAmount() {
      if (
        this.form.principal_amount <= 0 ||
        this.form.principal_amount === ""
      ) {
        this.principalAmountInvalid = true;
      } else {
        this.principalAmountInvalid = false;
      }
      if (this.form.principal_amount > 100) {
        this.principalAmountExceed = true;
      } else {
        this.principalAmountExceed = false;
      }
    },

    IsInterest_rate_for_term_one() {
      if (
        this.form.interest_rate_for_term_one < 0 ||
        this.form.interest_rate_for_term_one === ""
      ) {
        this.interest_rate_for_term_oneInvalidINterestOnly = true;
      } else {
        this.interest_rate_for_term_oneInvalidINterestOnly = false;
      }

      if (this.form.interest_rate_for_term_one > 100) {
        this.interestRateExceedInterestOnly = true;
      } else {
        this.interestRateExceedInterestOnly = false;
      }
    },

    IsInterest_rate_for_term_one_forNoPay() {
      if (
        this.form.interest_rate_for_term_one < 0 ||
        this.form.interest_rate_for_term_one === ""
      ) {
        this.interest_rate_for_term_oneNoPayment = true;
      } else {
        this.interest_rate_for_term_oneNoPayment = false;
      }
      if (this.form.interest_rate_for_term_one > 100) {
        this.interestRateExceedNoPayment = true;
      } else {
        this.interestRateExceedNoPayment = false;
      }
    },
    IsInterest_rate_for_term_two_ForMortagage() {
      if (
        this.form.interest_rate_for_term_two < 0 ||
        this.form.interest_rate_for_term_two === ""
      ) {
        this.interest_rate_for_term_TwoInvalid = true;
      } else {
        this.interest_rate_for_term_TwoInvalid = false;
      }
      if (this.form.interest_rate_for_term_two > 100) {
        this.interestRateExceedForMortgage = true;
      } else {
        this.interestRateExceedForMortgage = false;
      }
    },

    IsPrePaymentMonth() {
      if (
        this.form.pre_payment_month <= 0 ||
        this.form.pre_payment_month === ""
      ) {
        this.pre_payment_monthInvalid = true;
      } else {
        this.pre_payment_monthInvalid = false;
      }
      if (
        this.form.pre_payment_month > 600 ||
        this.form.pre_payment_month === ""
      ) {
        this.pre_payment_monthInvalidExceeeded = true;
      } else {
        this.pre_payment_monthInvalidExceeeded = false;
      }
    },
    IsPrePaymentMonthForNoPay() {
      if (
        this.form.pre_payment_month <= 0 ||
        this.form.pre_payment_month === ""
      ) {
        this.pre_payment_monthInvalid = true;
      } else {
        this.pre_payment_monthInvalid = false;
      }
    },
    IsPrePaymentPercentage() {
      if (
        this.form.pre_payment_percentage < 0 ||
        this.form.pre_payment_percentage === ""
      ) {
        this.pre_payment_percentageInvalid = true;
      } else {
        this.pre_payment_percentageInvalid = false;
      }
      if (this.form.pre_payment_percentage > 100) {
        this.prepaymentExceed = true;
      } else {
        this.prepaymentExceed = false;
      }
    },
    IsDuration_for_term_one_ForNoPay() {
      if (
        this.form.duration_for_term_one <= 0 ||
        this.form.duration_for_term_one === ""
      ) {
        this.monthValidationForTermOneInvalid = true;
      } else {
        this.monthValidationForTermOneInvalid = false;
      }
      if (
        this.form.duration_for_term_one > 600
      ) {
        this.monthValidationForTermOneExceeded = true;
      } else {
        this.monthValidationForTermOneExceeded = false;
      }
    },
    IsInterestRate() {
      if (!this.form.interest_rate < 0 || this.form.interest_rate === "") {
        this.interestRateInvalid = true;
      } else {
        this.interestRateInvalid = false;
      }
      if (this.form.interest_rate > 100) {
        this.interestRateExceed = true;
      } else {
        this.interestRateExceed = false;
      }
    },

    IsDuration() {
      if (this.form.duration <= 0) {
        this.durationInvalid = true;
      } else {
        this.durationInvalid = false;
      }
      if (this.form.duration > 600) {
        this.durationInvalidExceeds = true;
      } else {
        this.durationInvalidExceeds = false;
      }
    },
    IsDurationForTermTwo() {
      if (this.form.duration_for_term_two <= 0) {
        this.duration_for_term_twoInvalid = true;
      } else {
        this.duration_for_term_twoInvalid = false;
      }
      if (this.form.duration_for_term_two > 600) {
        this.duration_for_term_twoInvalidExceeded = true;
      } else {
        this.duration_for_term_twoInvalidExceeded = false;
      }
    },
    IsDuration_for_term_one() {
      if (this.form.duration_for_term_one <= 0) {
        this.monthValidationForTermOneInvalid = true;
      } else {
        this.monthValidationForTermOneInvalid = false;
      }
      if (this.form.duration_for_term_one > 600) {
        this.monthValidationForTermOneExceeded = true;
      } else {
        this.monthValidationForTermOneExceeded = false;
      }

    },
  },
  computed: {
    heading(){
      return this.typeOfOperation + " " + this.typeOfTab;
    },
    isDisableInterest: function () {
      if (this.radioValue == "true") {
        return this.radioValue;
      } else {
        !this.radioValue;
      }
    },
    isDisabled: function () {
      if (this.radioValue == "true") {
        return this.radioValue;
      } else {
        !this.radioValue;
      }
    },
    isPaid: function () {
      if (this.radioValue == "true") {
        return "Prepayment Will be Completed*";
      } else {
        return "Prepayment Will be Completed";
      }
    },
    isPrePercentage() {
      if (this.radioValue == "true") {
        return "Prepayment*";
      } else {
        return "Prepayment";
      }
    },
    isPreMonth() {
      if (this.radioValue == "true") {
        return "Month*";
      } else {
        return "Month";
      }
    },
    computedDuration: {
      get() {
        return {
          years: parseInt(this.form.duration / 12),
          months: this.form.duration % 12,
        };
      },
    },
    mortageComputedDuration: {
      get() {
        return {
          years: parseInt(this.form.duration_for_term_two / 12),
          months: this.form.duration_for_term_two % 12,
        };
      },
    },
    interestOnlyComputedDuration: {
      get() {
        return {
          years: parseInt(this.form.duration_for_term_one / 12),
          months: this.form.duration_for_term_one % 12,
        };
      },
    },
  },
};
</script>
<style scoped>
.el-dialog__wrapper {
  margin-top: 2vh !important;
  overflow: hidden;
}
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}
.deleteModule .delete_module >>> .el-dialog {
  border-radius: 8px;
  margin-top: 1vh !important;
}
.deleteModule .delete_module >>> .el-dialog__header {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  color: #222;
  /* margin-left: 20px; */
  margin-bottom: 0px;
  width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 48px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.deleteModule .delete_module >>> .el-dialog__title {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  color: #222 !important;
  margin-left: 20px;
}


.deleteModule .delete_module >>> .el-dialog__close {
    color: #222222 !important;
    font-weight: 800 !important;
    font-size: 22px !important;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

.deleteModule .delete_module >>> ::placeholder {
  color: #222 !important;
}

.deleteModule .delete_module >>> .el-popover {
  word-break: unset !important;
  padding: 18px 20px !important;
  border: none !important;
  text-align: left !important;
}

.el-scrollbar {
  width: 275px !important ;
}

.loanDropdown {
  padding: 0 0px !important;
  height: auto !important;
  white-space: inherit !important;
}

.labelDropdown {
  padding: 4px 15px !important;
  font-size: 14px !important;
  color: #222 !important;
  font-weight: 100 !important;
  line-height: 20px !important;
}
.descDropdown {
  padding: 0 15px 5px 15px !important;
  font-size: 12px !important;
  line-height: 18px !important;
  color: #777 !important;
  font-weight: 100 !important;
  word-wrap: break-word !important;
  width: 275px !important;
}

.Rectangle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.rectContent {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 20px;
}
.scrollableCont {
  max-height: 64vh;
  overflow-x: hidden;
  overflow-y: scroll;
}

.closeBtn {
  margin-right: 15px;
  cursor: pointer;
}

.inputContainer {
  padding: 8px 20px 16px 20px;
}

.inputs {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.deleteModule .delete_module >>> .el-form-item__label {
  font-size: 14px !important;
  word-break: break-word;
  text-align: left;
  color: #222 !important;
}

.deleteModule .delete_module >>> .el-form-item {
  width: 48%;
  margin-bottom: 5px !important;
}

.el-select {
  width: 100%;
}

.firstInput {
  width: 100% !important;
}

.deleteModule .delete_module >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  padding: 0 26px !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
}

.termsHeading {
  padding: 20px 0px 0px 0px;
  font-size: 18px;
  font-weight: 500;
  color: #1c3366;
}

.termInputs {
  padding: 0px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.fas {
  font-weight: 900;
  margin: 0 -7px;
}

.hover_information {
  display: inline-block;
  position: relative;
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
}
.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.inputValues {
  position: absolute;
  top: 44px;
  right: 10px;
  font-size: 16px;
  z-index: 100;
  color: #222;
}

.popupBtnContainer {
  margin: auto;
  text-align: center;
}

.popupBtn {
  padding: 17px 52px 17px 62px;
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  margin-bottom: 25px;
}

.borderContainer {
  display: grid;
  grid-template-columns: 42% auto auto;
  column-gap: 20px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin: 15px auto;
  padding: 5px 10px;
}
.borderContainerRadio {
  width: 100% !important;
  margin-right: 10px;
}

.borderContainerInputs {
  width: 100% !important;
  margin-right: 10px;
}

hr {
  background-color: #ccc;
  opacity: 0.6;
}

.bottomInfo p {
  padding: 15px 20px;
  margin: auto;
  font-family: "Helvetica Neue";
  font-size: 14px;
  font-weight: 100;
  text-align: left;
  color: #777;
  line-height: 1.5;
  word-wrap: break-word;
}
.termTwoContainer {
  padding: 0px 20px 20px 20px;
}

.validationCss {
  word-break: break-word;
  margin: 4px auto 0px auto;
  line-height: 25px;
  font-size: 12px;
  color: #ff0000;
}

.interestHr {
  margin-top: 16px !important;
}

.nopaymentHr {
  margin-top: 16px !important;
}
.deleteModule .delete_module >>> input::-webkit-outer-spin-button,
.deleteModule .delete_module >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

@media screen and (max-width: 1200px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 80% !important;
  }
  .hover_information .tooltip {
    border-radius: 8px;
    -webkit-box-shadow: 0 6px 18px 0 rgb(0 0 0 / 10%);
    box-shadow: 0 6px 18px 0 rgb(0 0 0 / 10%);
    border: solid 1px var(--light-m);
    background-color: var(--white);
    padding: 12px;
    position: absolute;
    width: 24vw;
    left: -15px;
    bottom: 75%;
    visibility: hidden;
    opacity: 0;
    -webkit-transition: all ease-in-out 0.35s;
    transition: all ease-in-out 0.35s;
    z-index: 100;
  }
}

@media screen and (max-width: 500px) {
  .deleteModule .delete_module >>> .el-form-item {
    width: 100%;
  }

  .rectContent {
    font-size: 16px;
    margin-left: 10px;
  }

  .closeBtn {
    height: 18px;
  }

  .hover_information .tooltip {
    padding: 8px;
    width: 235px;
    left: -116px;
  }

  .hover_information .tooltip p {
    font-size: 12px;
  }
  .descDropdown {
    width: 255px !important;
  }

  .borderContainer {
    flex-direction: column;
    display: flex !important;
  }
  .borderContainerRadio {
    width: 100% !important;
  }

  .borderContainerInputs {
    width: 100% !important;
  }

  .popupBtn {
    padding: 12px 30px 12px 30px;
    font-size: 12px;
  }

  .inputContainer{
    padding: 8px 16px 20px 16px !important;
  }

  .scrollableCont {
    max-height: 64vh;
    overflow-x: hidden;
    overflow-y: scroll;

  }


}
</style>
