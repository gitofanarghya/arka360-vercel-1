<template>
    <div id="walkwaysDefaults">

        <div>
            <p class="headings"> Core Height </p>
            <p class="data">
                <display-length
                    :metric-value="profileData.drawing_defaults.walkwayModel.coreHeight"/>
            </p>
        </div>

        <div>
            <p class="headings"> Width </p>
            <p class="data">
                <display-length
                    :metric-value="profileData.drawing_defaults.walkwayModel.width"/>
            </p>
        </div>

    </div>
</template>

<script>

export default {
    name: 'WalkwaysDefaults',
    props: ['profileData'],
    data() {
        return {
            msg: ' I am in walkwaysDefaults',
        };
    },
};

</script>
