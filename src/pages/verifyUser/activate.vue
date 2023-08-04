<template>
  <div>
    <h4 id="valid">Verifying User. Please Wait</h4>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "activate",
  async mounted() {
    let respCode;
    const currentPageURL = this.$route.path;
    const activationKey = currentPageURL.substring(10);
    await axios
      .post("/api/user/user-email-verification", {
        secret_key: activationKey,
      })
      .then((resp) => {
        respCode = resp.status;
      })
      .catch((error) => {
        console.error(error);
      });
    if (respCode !== 200) {
      document.getElementById("valid").innerHTML =
        "Invalid URL. Please try again";
    } else {
      this.$router.push("/login"); //user verified
    }
  },
};
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20%;
}
</style>
