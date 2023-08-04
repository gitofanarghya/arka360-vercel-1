const homeRedirectionMixin = {
    methods: {
        redirectToHomeBasedOnCountry() {
            const user = JSON.parse(localStorage.getItem('user'));
                console.log("@@@@ country",user.country);
                if(user.isUSFlagEnabled){
                this.$router.push({ name: "projectListViewHome" });
                }else{
                this.$router.push({ name: "home" });
                }
        }
    },
};

export default homeRedirectionMixin;
