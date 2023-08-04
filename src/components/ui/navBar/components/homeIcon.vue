<template>
    <div
        id="homeIcon"
        class="topBarButtons">
        <img
            src="https://front-end-assests.s3-us-west-2.amazonaws.com/home.png"
            alt="The Solar Labs"
            class="homeLogo"
            style="cursor:pointer;"
            @click="$router.push('/')">
    </div>
</template>

<script>

export default {
    name: 'HomeIcon',
    data() {
        return {
            msg: 'I am in home Icon',
        };
    },
};
</script>

<style type="text/css" scoped>

.homeLogo {
height: 100%;
}

#homeIcon {
color: #C0C0C0;
}

</style>
