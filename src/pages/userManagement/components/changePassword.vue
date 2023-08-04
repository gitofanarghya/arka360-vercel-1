<template>
  <div class="modal modal_form" id="change_password">
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Change Password</h4>
          <button
            class="modal-close modal-toggle"
            @click="$emit('toggleChangePass')"
          >
            <img src="../assets/img/close.svg" alt="Close" />
          </button>
        </div>
        <form class="inside_form">
          <div class="scroll_content">
            <div class="floating-form">
              <div class="floating-label">
                <div class="container">
                  <div class="input-field">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="oldPass"
                      v-if="showPasswordOld"
                    />
                    <input class="floating-input" 
                    type="password" 
                    v-model="oldPass"
                    v-else
                    />
                  </div>
                  <div class="hide-text">
                    <!-- <button class="button" @click.prevent="toggleShowPasswordOld"><span class="icon is-small is-right">
                    <i class="fas" :class="{ 'fa-eye-slash': showPasswordOld, 'fa-eye': !showPasswordOld }"></i>
                      </span>
                    </button> -->
                    <button class="button" @click.prevent="toggleShowPasswordOld">
                      <span class="toggle-text">
                        {{ toggleTextOld }}
                      </span>
                    </button>
                  </div>
                </div>
                <p class="error-msg" v-if="errorMsg">*{{ errorMsg }}</p>
                <label>Old Password</label>
              </div>
              <div class="floating-label">
                <div class="container">
                  <div class="input-field">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="newPass"
                      v-if="showPasswordNew"
                    />
                    <input class="floating-input" 
                    type="password" 
                    v-model="newPass"
                    v-else
                    />
                  </div>
                  <div class="hide-text">
                    <!-- <button class="button" @click.prevent="toggleShowPasswordNew"><span class="icon is-small is-right">
                    <i class="fas" :class="{ 'fa-eye-slash': showPasswordNew, 'fa-eye': !showPasswordNew }"></i>
                      </span>
                    </button> -->
                    <button class="button" @click.prevent="toggleShowPasswordNew">
                      <span class="toggle-text">
                        {{ toggleTextNew }}
                      </span>
                    </button>
                  </div>
                </div>
                <p class="error-msg" v-if="errorMsg">*{{ errorMsg }}</p>
                <label>New Password</label>
              </div>
              <!-- <div class="floating-label">
                <input
                  class="floating-input"
                  type="password"
                  v-model="newPass"
                />
                <label>New Password</label>
              </div> -->

              <div class="floating-label">
              <div class="container">
                <div class="input-field">
                  <input
                    class="floating-input"
                    type="text"
                    v-model="confirmPass"
                    v-if="showPasswordConfirm"
                  />
                  <input class="floating-input" 
                  type="password" 
                  v-model="confirmPass"
                  v-else
                  />
                </div>
                <div class="hide-text">
                  <!-- <button class="button" @click.prevent="toggleShowPasswordConfirm"><span class="icon is-small is-right">
                  <i class="fas" :class="{ 'fa-eye-slash': showPasswordConfirm, 'fa-eye': !showPasswordConfirm }"></i>
                    </span>
                  </button> -->
                  <button class="button" @click.prevent="toggleShowPasswordConfirm">
                    <span class="toggle-text">
                      {{ toggleTextConfirm }}
                    </span>
                  </button>
                </div>
              </div>
              <p
                  class="error-msg"
                  v-if="!isNewAndConfirmSame && hasSubmitted"
                >
                  *New password & Confirm password must be same
                </p>
                <p class="error-msg" v-if="detailMsg">*{{ detailMsg }}</p>
              <label>Confirm New Password</label>
            </div>
               
              <!-- CONFIRM PASSWORD -->
              <!-- <div class="floating-label">
                <input
                  class="floating-input"
                  type="password"
                  v-model="confirmPass"
                />
                <p
                  class="error-msg"
                  v-if="!isNewAndConfirmSame && hasSubmitted"
                >
                  *New password & Confirm password must be same
                </p>
                <p class="error-msg" v-if="detailMsg">*{{ detailMsg }}</p>
                <label>Confirm New Password</label>
              </div> -->
              <!-- CONFIRM PASSWORD END -->
            </div>
            <div class="button_area">
              <input
                type="submit"
                class="btn btn-primary"
                value="Change Password"
                @click.prevent="resetPassword"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  props: {
    toggleChangePassPopup: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      showPasswordOld: false,
      showPasswordNew: false,
      showPasswordConfirm: false,
      toggleTextOld: "Show",
      toggleTextNew: "Show",
      toggleTextConfirm: "Show",
      oldPass: "",
      newPass: "",
      confirmPass: "",
      hasSubmitted: false,
      errorMsg: "",
      detailMsg: "",
    };
  },
  computed: {
    isNewAndConfirmSame() {
      return this.newPass === this.confirmPass;
    },
    isPassValid() {
      return this.newPass.length >= 7 && this.confirmPass.length >= 7;
    },
  },
  methods: {
    toggleShowPasswordOld() {
      this.showPasswordOld = !this.showPasswordOld;
      this.toggleTextOld = (this.showPasswordOld) ? "Hide" : "Show";
    },

    toggleShowPasswordNew() {
      this.showPasswordNew = !this.showPasswordNew;
      this.toggleTextNew = (this.showPasswordNew) ? "Hide" : "Show";
    },

    toggleShowPasswordConfirm() {
      this.showPasswordConfirm = !this.showPasswordConfirm;
      this.toggleTextConfirm = (this.showPasswordConfirm) ? "Hide" : "Show";
    },

    async resetPassword() {
      this.hasSubmitted = true;
      console.log(!this.isPassValid, this.isNewAndConfirmSame);
      if (!this.isNewAndConfirmSame || !this.isPassValid) return;
      try {
        const body = {
          old_password: this.oldPass,
          new_password: this.newPass,
          confirm_password: this.confirmPass,
        };
        await API.USERS.CHANGE_PASSWORD(body);
        this.$emit("toggleChangePass");
        this.$message({
          showClose: true,
          message: "Password changed successfully.",
          type: "success",
          center: true
        });
      } catch (e) {
        const resp = e.response.data;
        console.log(resp);
        this.errorMsg = resp.error;
        this.detailMsg = resp.detail;
        this.$message({
          showClose: true,
          message: "Failed to add change password.",
          type: "error",
          center: true
        });
      }
    },
  },
};
</script>

<style scoped>
  .container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }
  .input-field {
    height: 100%;
    width: 100%;
  }
  .hide-text {
    height: 100%;
    flex: auto;
    position: absolute;
    right: 0;
    top: 25%
  }
  .button {
    display: inline-block;
    border: none;
    background-color: transparent;
    margin-right: 10px;
    cursor: pointer;
  }
  .toggle-text {
    font-size: 14px;
    color: #222;
    /* color: yellow; */
    /* background-color: red; */
  }

  .modal.modal_form .modal-wrapper .modal-content .modal-header{
    height: 48px !important;
  }

  .modal-header h4{
    font-weight: 600 !important;
  }

  .floating-input{
    height: 48px !important;
    font-size: 16px !important;
  }

  .floating-label label{
    color: #222 !important;
    font-size: 14px !important;
  }
</style>
