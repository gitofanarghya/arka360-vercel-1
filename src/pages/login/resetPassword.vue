<template>
	<div class="main-container">
		<form class="reset-container">
			<div class="same-container">
			<div class="heading">Reset Password</div>
			<div class="input-container">
				<div class="input-block">
                    <!-- <div class='pwd-line'>
                        <div v-if="passwordValidation.errors.length" class="pwd-req-tooltip" id="pwd-req-tooltip">
                            <p v-for="error in passwordValidation.errors" :key="error">
                                {{ error }}
                            </p>
                        </div>
                    </div> -->
                    <input
                        type="password"
                        placeholder="Enter New Password"
                        id="password1"
                        v-model="newPassword"
                        required
                    />
                    <div class="show-pwd" id="show-pwd1" @click="togglePassword(1)">
                        Show
                    </div>
                    <div class="tooltip" id="pwd-tooltip1">
                        Warning: Caps lock is on
                    </div>
				</div>
				<div id="err-pwd" class="err-message-block">email doesnt exist</div>
			</div>
            <div class="pwd-req-block" id="pwd-req-block">
                <div style="margin: 12px 0">Password must contain:</div>
                <div class="req-field" id="pwd-req1" style="margin: 0">
                    <span class="symbol">
                        <span class="tick" id="tick1">✓</span>
                        <span class="bullet" id="bullet1"></span>
                    </span>
                    At least one alphabet (a-z)
                </div>
                <div class="req-field" id="pwd-req2">
                    <span class="symbol">
                        <span class="tick" id="tick2">✓</span>
                        <span class="bullet" id="bullet2"></span>
                    </span>
                    Al least one numeric character (0-9)
                </div>
                <div class="req-field" id="pwd-req3">
                    <span class="symbol">
                        <span class="tick" id="tick3">✓</span>
                        <span class="bullet" id="bullet3"></span>
                    </span>
                    At least 8 characters
                </div>
            </div>
			<div class="input-container">
				<div class="input-block">
				<input
					type="password"
					placeholder="Confirm New Password"
					id="password2"
					v-model="confirmNewPassword"
					required
				/>
				<div class="show-pwd" id="show-pwd2" @click="togglePassword(2)">
					Show
				</div>
				<div class="tooltip" id="pwd-tooltip2">Passwords not matching</div>
				</div>
				<div id="err-cnf-pwd" class="err-message-block">Passwords do not match</div>
			</div>
			<div class="button-container">
				<div class="button" @click="updatePassword">Reset Password</div>
			</div>
			</div>
		</form>
	</div>
</template>

<script>
import API from "@/services/api/";
import logo from "./components/loginLogo.vue";

export default {
  name: "resetPassword",
  components: {
    logo,
  },
  data() {
    return {
      newPasswordValidateForm: {
        newPassword: "",
        confirmNewPassword: "",
      },
      passwordsDifferent: false,
      showTokenExpired: false,
      newPassword: "",
      confirmNewPassword: "",
      rules: [
        { id: 1 ,message: "One letter required.", regex: /[a-zA-Z]+/ },
            { id: 2 ,message: "One number required.", regex: /[0-9]+/ },
            { id: 3 ,message: "7 characters minimum.", regex: /.{7,}/ },
      ],
    };
  },
  mounted() {
    // checking if token received is valid
    this.isTokenValid();
    document.getElementById("password1").addEventListener("keyup", this.handleCapsLock);
    document.addEventListener('click', this.handleDropdowns);
  },
  methods: {
    async updatePassword(e) {
        e.preventDefault();
        const vm = this;
        const token = this.$route.query.token;

        // document.getElementById("pwd-tooltip2").style.visibility = 'hidden';
		document.getElementById('err-pwd').style.display = 'none';
		document.getElementById('err-cnf-pwd').style.display = 'none';

        if (!this.newPassword) {
            document.getElementById('err-pwd').style.display = 'flex';
			document.getElementById('err-pwd').innerHTML = '* This is a required field';
            return;
        }
        else if (!this.confirmNewPassword) {
            document.getElementById('err-cnf-pwd').style.display = 'flex';
			document.getElementById('err-cnf-pwd').innerHTML = '* This is a required field';
            return;
        }
        
        if (this.newPassword !== this.confirmNewPassword) {
			document.getElementById('err-cnf-pwd').style.display = 'flex';
			document.getElementById('err-cnf-pwd').innerHTML = 'Passwords do not match';
            return;
        }
        if (!this.checkPasswordValidation(this.newPassword)) {
            // document.getElementById("pwd-tooltip2").style.visibility = 'visible';
            // document.getElementById("pwd-tooltip2").innerHTML = 'Password format wrong';
			document.getElementById('err-pwd').style.display = 'flex';
			document.getElementById('err-pwd').innerHTML = 'Password format wrong';
            return;
        }
        try {
            const postData = {
                token,
                password: this.newPassword,
            };

            await API.USERS.CONFIRM_RESET_PASSWORD(postData);

            this.$toastr.s("Password Succesfully Changed");

            setTimeout(() => {
                vm.$router.push({ name: 'login' });
            }, 500);
        }
        catch (e) {
            if (e.response.status === 404) {
                // token expired
                this.showTokenExpired = true;
            } else if (e.response.status === 400) {
                e = e.response.data.password;
                e = e.join(" ");
                this.$message({
                    showClose: true,
                    message: e,
                    type: 'error',
                    center: true
                });
				this.$toastr.e(e);

            }
            else {
                this.$message({
                    showClose: true,
                    message: 'Error in updating password. Try again.',
                    type: 'error',
                    center: true
                });
            }
        }
    },
    checkPasswordValidation(password) {
        const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{7,}$/;
        return re.test(password);
    },
    handleCapsLock(e) {
        if (e.getModifierState("CapsLock")) {
            document.getElementById("pwd-tooltip1").style.visibility = "visible";
            document.getElementById("pwd-tooltip1").innerHTML = 'Warning: Caps lock is on';
        }
        else {
            document.getElementById("pwd-tooltip1").style.visibility = "hidden";
        }
    },
    handleDropdowns(e) {
        if (e.target.id !== 'password1') {
            document.getElementById('pwd-req-block').style.display = 'none';
        }
        else if(e.target.id === 'password1') {
            document.getElementById('pwd-req-block').style.display = 'flex';
        }
    },
    setNewPassword() {
        if (this.newPasswordValidateForm.newPassword === this.newPasswordValidateForm.confirmNewPassword) {
            this.passwordsDifferent = false;
            this.updatePassword();
        }
        else {
            this.passwordsDifferent = true;
        }
    },

    async isTokenValid() {
        const token_ = this.$route.query.token;

        try {
            const postData = {
                token: token_,
            };

            await API.USERS.TOKEN_STATUS(postData);
        }
        catch (e) {
            if (e.response.status === 400) {
                // token expired
                this.showTokenExpired = true;
            }
            else {
                // something went wrong
                this.$message({
                    showClose: true,
                    message: 'Something went wrong. Please try again.',
                    type: 'error',
                    center: true
                });
            }
        }
    },

    returnToLogin() {
        this.$router.push({ name: 'login' });
        this.showTokenExpired = false;
    },
    togglePassword(val) {
        const el = document.getElementById(`password${val}`);
        if (el.type === 'password') {
            el.type = 'text';
            document.getElementById(`show-pwd${val}`).innerHTML = 'Hide';
        }
        else {
            el.type = 'password';
            document.getElementById(`show-pwd${val}`).innerHTML = 'Show';
        }
    },
  },
  destroyed() {
      document.removeEventListener('click', this.handleDropdowns);
  },
  computed: {
    passwordValidation() {
      let errors = [];
      for (let condition of this.rules) {
        if (!condition.regex.test(this.newPassword)) {
          errors.push(condition.message);
        }
      }
      if (errors.length === 0) {
        return { valid: true, errors };
      } else {
        return { valid: false, errors };
      }
    },
  },
  watch: {
      newPassword(newVal) {
          for (let condition of this.rules) {
                if (!condition.regex.test(newVal)) {
                    document.getElementById(`pwd-req${condition.id}`).style.color = '#222222';
                    document.getElementById(`tick${condition.id}`).style.display = 'none';
                    document.getElementById(`bullet${condition.id}`).style.display = 'flex';
                }
                else {
                    document.getElementById(`pwd-req${condition.id}`).style.color = '#409EFF';
                    document.getElementById(`tick${condition.id}`).style.display = 'flex';
                    document.getElementById(`bullet${condition.id}`).style.display = 'none';
                }
            }
      }
  }
}
</script>

<style type="text/css" scoped>
.formErrors {
  font-size: 12px;
  padding-bottom: 20px;
}

#resetPassword {
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
}

.resetConfirmationText {
  text-align: center;
}
.input-block .pwd-req-tooltip {
    visibility: hidden;
    flex-direction: column;
    box-sizing: border-box;
    position: absolute;
    padding: 10px 20px;
    background: linear-gradient(to bottom, #409EFF, #e85130);
    bottom: 5px;
    right: 0px;
    color: white;
    border-radius: 4px;
    
}
.input-block:hover .pwd-req-tooltip {
    visibility: visible; 
}
.pwd-line{
    position: relative;
    height: 1px;
    width: 100%;
}
</style>

<style lang="scss" scoped>
@import "../../styles/pages/login/reset-pwd";
@import "../../styles/components/button";
@import "../../styles/components/forms";
</style>
