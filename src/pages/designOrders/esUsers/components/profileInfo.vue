<template>
  <div class="profile-card">
    <div class="section-first">
      <div class="avatar">
        <el-avatar :size="'large'" :style="computedStyle">
          <template v-if="hasImage">
            <img :src="imageSrc" alt="Avatar" />
          </template>
          <template v-else>
            {{ generateInitials() }}
          </template>
        </el-avatar>
      </div>

      <div class="info">
        <div class="name">{{ fullName }}</div>
        <div class="phone-email-container">
          <div class="phone">
            <i class="el-icon-phone"></i>
            {{ phoneNumber }}
          </div>
          <div class="email">
            <i class="el-icon-message"></i>
            {{ email }}
          </div>
        </div>
        <div class="address">
          <i class="el-icon-location"></i>
          {{ address }}
        </div>
      </div>
    </div>

    <div class="share-btn">
      <el-button icon="el-icon-share" circle></el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      default: "",
    },
  },
  computed: {
    hasImage() {
      return this.imageSrc !== "";
    },
    avatarSize() {
      return this.hasImage ? "large" : "medium";
    },
    computedStyle() {
      return !this.hasImage
        ? "font-size: 25px !important; padding-top:12px; background-color:red"
        : "";
    },
  },
  methods: {
    generateInitials() {
      const names = this.fullName.split(" ");
      let initials = "";

      if (names.length > 0) {
        initials += names[0].charAt(0);

        if (names.length > 1) {
          initials += names[names.length - 1].charAt(0);
        }
      }

      return initials.toUpperCase();
    },
  },
};
</script>

<style scoped>
i {
  margin-left: 5px;
  margin-right: 2px;
}

.profile-card {
  display: flex;
  /*align-items: center;*/
  margin: 24px 18px;
}

.section-first {
  display: flex;
}

.avatar {
  align-self: center;
}
.avatar >>> .el-avatar--large {
  /*margin-left: 10px;*/
  margin-right: 20px;
  height: 70px;
  width: 70px;
}

.info {
  flex-grow: 1;
}

.name {
  font-weight: bold;
  font-size: 23px;
  margin-left: 5px;
}

.phone,
.email,
.address {
  display: flex;
  align-items: center;
  margin-left: 5px;
  margin-top: 5px;
  font-size: 0.875rem;
  color: #777777;
}

.phone i,
.email i,
.address i {
  margin-right: 5px;
}

.phone-email-container {
  display: flex;
  flex-direction: column;
}

.share-btn {
  margin-left: auto;
  color: #777777;
}

.el-button:hover,
.el-button:focus {
  background-color: transparent;
  border: none;
  color: #777777;
}

.share-btn::v-deep .is-circle {
  border: none;
}

.el-button {
  font-size: 1.2rem;
}
</style>
