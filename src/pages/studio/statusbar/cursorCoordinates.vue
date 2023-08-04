<template>
    <div
        id="cursorCoordinates">
        <div>
            <p class="cursorCoordinates">
                x:
                <display-length
                    :metric-value="coordinates.x"/>
                y:
                <display-length
                    :metric-value="coordinates.y"/>
                z:
                <display-length
                    :metric-value="coordinates.z"/>
            </p>
        </div>
    </div>

</template>

<script>
export default {
    name: 'CursorCoordinates',
    props: {
        coordinates: {
            type: Object,
            default() {
                return {
                    x: '--',
                    y: '--',
                    z: '--',
                };
            },
        },
    },
    data() {
        return {
        };
    },
};
</script>

<style type="text/css" scoped>
    .cursorCoordinates {
        color: white;
        float: right;
        font-size: 0.9vw;
        line-height: 15px;
        vertical-align: middle;
    }

</style>
