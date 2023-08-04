<template>
    <div id="logoIcon">
        <img
            src="https://front-end-assests.s3-us-west-2.amazonaws.com/white_logo.png"
            alt="The Solar Labs"
            class="logo"
            style="cursor:pointer;"
            @click="$router.push('/')" >
    </div>

</template>

<script>

export default {
    name: 'HeaderLogo',
};
</script>

<style type="text/css" scoped>
#logoIcon {
    line-height: 0;
}
#logoIcon img {
    width: 6vw;
    vertical-align: middle;
    padding: 0.5rem;
}
</style>
