<template>
    <div class="main-container">
        <div :v-if="showlogoutconfirmbox"> 
            <vue-confirm-dialog class = "ConfirmBox"></vue-confirm-dialog>
        </div>
        <div class="login-container" v-loading="isLogin">
            <div class="same-container">
            <div class="logoContainer">
                <div class="logo">
                    <img :src="arkaEnergyLogo" alt="Logo" width="200px" height="auto" class="logoLog"/></div>
                <div class="heading1">Login</div>
                <div class="heading2">Welcome back! Please enter your email and password to access your account.</div>
            </div>    
                <form class="form-container">
                    <div class="input-container">
                        <div class="label" id="label1" >Email Id</div>
                        <div class="input-block">
                            <input type="text" placeholder="Email Id" v-model="userName" required @input="inputUserNameCheck()" @keyup.enter="login"/>
                            <div class="tooltip" id="username-tooltip"></div>
                            <div id="err-email" class="err-message-block">email doesnt exist</div>
                        </div>
                    </div>
                    <div class="input-container">
                        <div class="label" id="label2">Password</div>
                        <div class="input-block">
                            <input type="password" placeholder="Password" id="password" v-model="userPassword" required @input="inputPasswordCheck()" @keyup.enter="login"/>
                            <div id="show-pwd" @click="togglePassword">Show</div>
                            <div class="tooltip" id="pwd-tooltip">Warning: Caps lock is on</div>
                            <div id="err-pwd" class="err-message-block">wrong password</div>
                        </div>
                    </div>
                    <div class="forgot-pwd">
                        <div class="left">
                            <input type="checkbox" v-model="isLoginActive">
                            <div class="chkBxCnt">Keep me signed in</div>
                        </div>
                        <div style="cursor: pointer" @click="handleModal('open', 'reset-pwd')">Forgot Password?</div>

                    </div>
                    <div class="button-container">
                        <div class="button" @click="login">Login</div>
                    </div>
                </form>
                <div class="signup">Don’t have an account? <span class="spnSU">Sign Up</span></div>
            </div>
        </div>
        <div class="modal-background hide" id="modal-background"></div>
        <div class="modal-container hide" id="modal-container">
            <div class="reset-pwd-block" id="reset-pwd">
                <div class="cancel-icon" @click="handleModal('close', 'reset-pwd')">
                    <img src="../../assets/drop/group-167.png" alt="X" height="90%" width="90%" />
                </div>
                <form class="reset-form">
                    <div class="text1">Reset Password</div>
                    <div class="text2">
                        <p>Enter your registered email id and we'll send you a password reset link</p>
                    </div>
                    <div class="input-container">
                        <input type="text" placeholder="Enter Email Id" v-model="userResetEmail" />
                        <div id="err-reset-email" >hello</div>
                    </div>
                    <div class="button-container">
                        <div class="button" @click="passwordResetConfirm">Send Link</div>
                    </div>
                </form>
            </div>
            <div class="resend-mail-block" id="resend-verification">
                <div class="cancel-icon" @click="handleModal('close', 'resend-verification')">
                    <img src="../../assets/drop/group-167.png" alt="X" height="90%" width="90%" />
                </div>
                <form class="resend-form">
                    <div class="text1">Verify Email Id</div>
                    <div class="text2">
                        <div>Please check your registered email inbox for the verification link.</div>
                    </div>
                    <div class="button-container">
                        <div class="button" @click="resendVerificationLink">Resend Verification Link.</div>
                    </div>
                </form>
            </div>
        </div>
        <div id="error-msg-block">username or password is incorrect</div>
    </div>
    
</template>
<script>
import API from '@/services/api/';
import { setCookie } from '@/utils.js'
import { SL360_URL, COOKIE_IDENTIFIER_FOR_ARKA } from "../../constants"
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '../../stores/auth';
import { useIntegrationStore } from '../../stores/integration';
import logo from './components/loginLogo.vue';
import { initializeSignedIntercom } from '../../plugins/intercom';
import { checkEmailValidation, handleLoader } from '../../core/utils/utils';
import Axios from 'axios';
import { fetchArkaEnergyLogo } from "@/pages/utils/utils.js";


// For Arka #ArkaLoginFlow
// Set cookies if user is a 360 user
async function loginForArka(tslLoginResponse) {
    const user = JSON.parse(localStorage.getItem('user'));
    let sl360UserCondition = user.is_sl_360_user
    if (!sl360UserCondition) { return }

    let tslCookieData = {
        jwt_encoded_data: tslLoginResponse.jwt_encoded_data,
        token: user.token,
        user_id: user.user_id,
    }
    setCookie(`tsl${COOKIE_IDENTIFIER_FOR_ARKA}`, JSON.stringify(tslCookieData))
}

export default {
    name: 'Login',
    components: {
        logo
    },
    data() {
        return {
            arkaEnergyLogo: fetchArkaEnergyLogo(),
            solarLabsLogo: "https://cdn.zeplin.io/5fe06da7bcd15d47b191f058/assets/9c2f70a0-64e8-45d5-baa3-3d7deb4c6a79.png",
            loginForm: {
                username: '',
                password: '',
            },
            authenticationError: false,
            passwordResetForm: {
                emailID: '',
            },
            loginCredentialsBox: true,
            forgotPasswordBox: false,
            passwordResetConfirmation: false,
            emailNotRegistered: false,
            resetEmailError: false,
            isResetting: false,
            showlogoutconfirmbox: false,
            userName: '',
            userPassword: '',
            userResetEmail: '',
            isLoginActive: false,
            token: '',
            isLogin:false,
        };
    },
    computed: {
        ...mapState(useIntegrationStore, [
            'IS_INTEGRATION',
        ]),
    },
    mounted() {
        // handleLoader(false);
        // Resetting store if user reaches this page without using logout
        if (localStorage.getItem("user")) {
            this.handlelogin(this.IS_INTEGRATION)
        }
        document.getElementById("password").addEventListener("keyup", this.handleCapsLock);
    },
    methods: {
        ...mapActions(useAuthStore, [
            'LOGIN',
            'LOGOUT',
        ]),
        ...mapActions(useIntegrationStore, {
            checkProjectExistAndSetId: 'CHECK_PROJECT_EXIST_AND_SET_ID',
            removeProjectDataFromSessionStorage: 'REMOVE_PROJECTDATA_FROM_SESSION_STORAGE',
            routeToProjectSummary: 'ROUTE_TO_PROJECT_SUMMARY',
        }),
        async login(event) {
            this.isLogin = true;
            event.preventDefault();
            // handleLoader(true);
            document.getElementById('err-email').style.display = 'none';
            document.getElementById('err-pwd').style.display = 'none';

            if (!this.userName || !this.userPassword) {
                this.isLogin = false;
                if (!this.userName) {
                    document.getElementById("err-email").style.display = 'initial';
                    document.getElementById("err-email").innerHTML = '* This is a required field';
                }
                else {
                    document.getElementById("err-email").style.display = 'initial';
                    document.getElementById("err-email").innerHTML = '';
                }
                if(!this.userPassword){
                   document.getElementById("err-pwd").style.display = 'initial';
                   document.getElementById("err-pwd").innerHTML = '* This is a required field'; 
                }else{
                   document.getElementById("err-pwd").style.display = 'initial';
                   document.getElementById("err-pwd").innerHTML = ''; 
                }
                // handleLoader(false);
                return;
            }
            if (!checkEmailValidation(this.userName.trim())) {
                this.isLogin = false;
                // document.getElementById("username-tooltip").style.visibility = 'visible';
                // document.getElementById("username-tooltip").innerHTML = 'Please enter valid email id';
                document.getElementById('err-email').style.display = 'flex';
                document.getElementById('err-email').innerHTML = 'Please enter valid email id';
                return;
            }
            // setting Intercom user data
            initializeSignedIntercom(this.userName);

            // setting this to false
            this.authenticationError = false;

            const postData = {
                username: this.userName.trim(),
                password: this.userPassword,
            };

            // Checking the condition of /integration routing
            try {
                this.showlogoutconfirmbox = false
                let response = await this.LOGIN(postData);
                if (response.status !== 302 && !response.is_verified) {
                    this.isLogin = false;
                    
                    this.token = response.token;
                    this.handleModal('open', 'resend-verification');
                    return;
                }
                if (response.status == 302) {
                    this.isLogin = false;
                    this.showlogoutconfirmbox = true;
                    API.SET_TOKEN_HEADER(response.token);
                    this.$confirm({
                       message: `You are already logged in from other device. Kindly logout from other device or confirm to logout from here. All your unsaved data in other session/device will be lost if you continue from here.`,
                       button: {
                            no: 'Cancel',
                            yes: 'Continue on this device'
                        },
                        callback: async confirm => {
                            if (confirm) {
                                this.isLogin = true

                                await API.USERS.LOGOUT(postData);
                                this.showlogoutconfirmbox = false;
                                response = await this.LOGIN(postData);
                                if (!response.is_verified) {
                                    this.token = response.token;
                                    this.handleModal('open', 'resend-verification');
                                    return;
                                }
                                loginForArka(response)
                                this.handlelogin(this.IS_INTEGRATION);
                                
                                this.isLogin = false
                            }
                        }
                    })
                    setTimeout(() => {
                        let container = document.getElementsByClassName("vc-container");
                        if (container) {
                            container = container[0];
                            container.setAttribute("style", "width:454px !important; height: 256px;")
                        }
                        let node = document.getElementsByClassName("vc-text-grid");
                        if (node) {
                            node = node[0];
                            node.setAttribute("style", "display: flex;flex-direction: column;justify-content: space-between;height: 100%;");
                        }
                        let textElement = document.getElementsByClassName("vc-text");
                        if (textElement.length >= 0) {
                            textElement = textElement[0];
                            textElement.setAttribute("style", "display: flex;height: 90%;align-items: center;margin:auto;font-size: 18px;white-space: pre-line;line-height: 1.6;")
                        }
                        let btns = document.getElementsByClassName("vc-btn");
                        for (let btn = 0; btn < btns.length; btn++) {
                            let button = btns[btn];
                            button.setAttribute("style", "color: #ffffff;background-color: #409EFF")
                        }
                    }, 0);
                } 
                else {
                    const user = JSON.parse(localStorage.getItem('user'));

                    if(this.$router.currentRoute.path==="/arkaLogin"){
                        window.location.href = `${SL360_URL}sso/tsl/?token=${response.token}&user_id=${user.user_id}`;
                    }
                    else {
                        loginForArka(response)
                        this.handlelogin(this.IS_INTEGRATION);
                    }
                    this.isLogin = false;
                }
            }
            catch (e) {
                console.error(e)
                this.isLogin = false;
                if (e.response.data.status === 404) {
                    document.getElementById('err-email').style.display = 'flex';
                    document.getElementById('err-email').innerHTML = e.response.data.message;
                } else if (e.response.data.message) {
                    this.$toastr.e(e.response.data.message);
                } else if (e.response.data.status === 500) {
                    document.getElementById('err-pwd').style.display = 'flex';
                    document.getElementById('err-pwd').innerHTML = 'There was an unknown error while logging in. Please try again in a while';
                } else {
                    document.getElementById('err-pwd').style.display = 'flex';
                    document.getElementById('err-pwd').innerHTML = 'Password is Incorrect';
                }
                if (typeof e.response !== 'undefined' && e.response.status === 400) {
                    this.authenticationError = true;
                }
                // Resetting in case of error
                this.LOGOUT();
            }
            // handleLoader(false);
        },
        async handlelogin(IS_INTEGRATION) {
            if (IS_INTEGRATION) {
                const doesProjectExist = await this.checkProjectExistAndSetId();
                if (doesProjectExist) {
                    this.routeToProjectSummary();
                    this.removeProjectDataFromSessionStorage();
                }
                else {
                    this.$router.push({ name: 'integration', props: { isRedirectedFromLoginPage: true } });
                }
            }
            else {
                this.$router.push({ name: 'home' });
            }
        },
        inputUserNameCheck(){
                this.isLogin = false;
                if (!this.userName) {
                    this.isLogin = false;
                    document.getElementById("err-email").style.display = 'initial';
                    document.getElementById("err-email").innerHTML = '* This is a required field';
                    return;
                }else {
                   document.getElementById("err-email").style.display = 'initial';
                   document.getElementById("err-email").innerHTML = ''; 
                }
        },
        inputPasswordCheck(){
                this.isLogin = false;
                if (!this.userPassword) {
                    this.isLogin = false;
                    document.getElementById("err-pwd").style.display = 'initial';
                    document.getElementById("err-pwd").innerHTML = '* This is a required field';
                    return;
                }else {
                   document.getElementById("err-pwd").style.display = 'initial';
                   document.getElementById("err-pwd").innerHTML = ''; 
                }
        },
        forgotPassword() {
            this.passwordResetForm.emailID = '';
            this.loginCredentialsBox = false;
            this.forgotPasswordBox = true;
            this.authenticationError = false;
        },

        resetLoginForm() {
            this.loginForm.username = '';
            this.loginForm.password = '';
        },

        returnToSignIn() {
            this.loginCredentialsBox = true;
            this.forgotPasswordBox = false;
            this.passwordResetConfirmation = false;
            this.resetLoginForm();
        },

        async passwordResetConfirm() {
            // handleLoader(true);
            this.handleModal('open', 'reset-pwd');
            document.getElementById('err-reset-email').style.display = 'none';
            if (!checkEmailValidation(this.userResetEmail)) {
                document.getElementById('err-reset-email').style.display = 'flex';
                document.getElementById('err-reset-email').innerHTML = 'Please enter valid email id';
                return;
            }
            const postData = {
                email: this.userResetEmail,
            };

            this.emailNotRegistered = false;
            this.resetEmailError = false;
            this.isResetting = true;

            try {
                await API.USERS.RESET_PASSWORD(postData);
                this.isResetting = false;
                this.passwordResetConfirmation = true;
                this.forgotPasswordBox = false;
                this.loginCredentialsBox = false;
                this.$toastr.s("Email Successfully Sent");
                this.handleModal('close', 'reset-pwd');
            }
            catch (e) {
                // hiding loading bar
                this.isResetting = false;

                // When it's not a valid email, data will have email key.
                // If no active user exists then data will have validation error
                
                // temporary solution until backend gets a fix
                // if (JSON.stringify(e.response.data)[1] === 'V') {
                //     this.emailNotRegistered = true;
                //     document.getElementById('err-reset-email').innerHTML = 'Please enter a registered email id';
                // }
                // else {
                //     // Something went Wrong. Try Again
                //     this.resetEmailError = true;
                //     document.getElementById('err-reset-email').innerHTML = 'Internal Server Error';
                // }
                if (e.response.status === 400) {
                    document.getElementById('err-reset-email').style.display = 'flex';
                    document.getElementById('err-reset-email').innerHTML = 'Please enter a registered email id';
                }
                else {
                    document.getElementById('err-reset-email').style.display = 'flex';
                    document.getElementById('err-reset-email').innerHTML = 'Internal Server Error';
                }
            }
            // handleLoader(false);
        },

        async resendVerificationLink() {
            // this.handleModal('close', 'resend-verification');
            try {
                 const postObj = {
                    token: this.token,
                }
                const response = await Axios.post('api/user/send-verification-email-again', postObj);
                if (response.data.message) {
                    this.$toastr.s(response.data.message);
                    this.handleModal('close', 'resend-verification');
                }
            }
            catch(e) {
                this.$toastr.e('Please click on verification button again.');
            }
        },

        forgotPasswordCancel() {
            this.forgotPasswordBox = false;
            this.loginCredentialsBox = true;
            this.passwordResetConfirmation = false;
            this.resetEmailError = false;
            this.emailNotRegistered = false;
            this.authenticationError = false;
            this.resetLoginForm();
        },
        togglePassword(e) {
            const el = document.getElementById("password");
            if (el.type === 'password') {
                el.type = 'text';
                document.getElementById("show-pwd").innerHTML = 'Hide';
            }
            else {
                el.type = 'password';
                document.getElementById("show-pwd").innerHTML = 'Show';
            }
        },
        handleCapsLock(e) {
            if (!e.getModifierState) { return }
            
            if (e.getModifierState("CapsLock")) {
                document.getElementById("pwd-tooltip").style.visibility = "visible";
                document.getElementById("pwd-tooltip").innerHTML = 'Warning: Caps lock is on';
            }
            else {
                document.getElementById("pwd-tooltip").style.visibility = "hidden";
            }
        },
        handleModal(type, id) {
            if (type === 'close') {
                document.getElementById('modal-container').classList.remove('show');
                document.getElementById('modal-background').classList.remove('show');

                document.getElementById('modal-background').classList.add('hide');
                document.getElementById('modal-container').classList.add('hide');

                document.getElementById(id).style.display = 'none';

                this.userResetEmail = '';
            }
            else {
                document.getElementById('modal-container').classList.remove('hide');
                document.getElementById('modal-background').classList.remove('hide');

                document.getElementById('modal-background').classList.add('show');
                document.getElementById('modal-container').classList.add('show');

                document.getElementById(id).style.display = 'flex';
            }
        },
        redirectRouter(type) {
            this.$router.push({ name: 'signup'});
        },

    },

    watch: {
        userName(newVal) {
            if (newVal !== '') {
                document.getElementById("label1").style.display = 'block';
                document.getElementById("username-tooltip").style.visibility = 'hidden';
            }
            else {
                document.getElementById("label1").style.display = 'none';
            }
        },
        userPassword(newVal) {
            if (newVal !== '') {
                document.getElementById("label2").style.display = 'block';
                document.getElementById("pwd-tooltip").style.visibility = 'hidden';
            }
            else {
                document.getElementById("label2").style.display = 'none';
            }
        }
    }

};

</script>

<style lang="scss" scoped>
@import '../../styles/components/button';
@import '../../styles/components/forms';
@import '../../styles/pages/login/login';
</style>
<style scoped>
:root {
    box-sizing: border-box !important;
    font-size: 16px;
}
body {
    box-sizing: border-box;
}
@media screen and (max-height: 749px) {
    :root {
        font-size: 14px !important;
    }
}
</style>
<style scoped>
.logoContainer{
 display:flex;
 flex-direction: column;
 margin-bottom: 0px;

}
.logo{
    display:flex;
    justify-content:center;
    margin-top: 16px;
}
.headingOne{
    display: flex;
    justify-content: center;
    font-size: 28px;
    margin: 18px 108px 7px 91px;
    font-weight: 700;
}
.headingTwo{
    display: flex;
    justify-content: center;
    font-size: 22px;
}

.main-container .login-container .same-container .form-container .input-container .input-block input {
    height: 48px;
    width: 100%;
    padding: 5px 10px;
    font-size: 16px;
    outline: none;
}

.chkBxCnt{
    font-size: 14px;
}

.main-container .login-container .same-container .form-container .forgot-pwd .left input{
    width: 20px;
    height: 20px;
    margin-right: 12px;
    background-image: linear-gradient(to bottom, #fff, #ccc);
}

.main-container .login-container .same-container .form-container .input-container .input-block #show-pwd{
    top: 17px;
    font-size: 14px;
}

.main-container .login-container .same-container .heading1{
    font-size: 28px;
    margin-bottom: 16px;
    font-weight: 600;
    margin-top: 32px;
}

.main-container .login-container .same-container .signup{
    font-size: 18px;
    height: auto;
    margin-top: 32px;
    margin-bottom: 30px;
    display: none;
}

.spnSU{
    color: #409eff;
    cursor: not-allowed;
    margin-left: 3px;
    font-weight: 600;
}

.main-container .login-container .same-container .heading2{
    margin-bottom: 32px;
    margin-top: 0px;
}

.main-container .login-container .same-container .form-container .input-container{
    height: auto;
    margin-bottom: 32px;
    max-height: 33%;
}

.main-container .login-container .same-container .form-container{
    height: auto;
    max-height: 325px;
}

.main-container .login-container .same-container .form-container .button-container {
    margin-top: 32px;
}

.main-container .login-container .same-container .form-container .button-container .button{
    height: 57px;
    max-height: 57px;
    margin-top: 10px;
}

.main-container .login-container{
    height: auto;
    min-height: 650px;
    max-height: 650px;
    width: 40%;
    min-width: 355px;
    max-width: 600px;
    border-radius: 24px;
}

.main-container .login-container .same-container .form-container .forgot-pwd{
    margin-top: -10px;
}


@media (max-width: 500px) {
    .logoLog{
        width: 125px;
        height: auto;
    }

    .main-container .login-container{
    height: auto;
    min-height: 580px;
    max-height: 580px;
    width: 40%;
    min-width: 355px;
    max-width: 600px;
    border-radius: 24px;
}   
    .main-container .login-container .same-container .heading1 {
    font-size: 24px;
    margin-bottom: 16px;
    margin-top: 24px;
    }
}
</style>
