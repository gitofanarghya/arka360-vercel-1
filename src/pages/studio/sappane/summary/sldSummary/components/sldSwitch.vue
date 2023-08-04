<template>
    <div id = 'sld-switch'>
        <label>
            <input type="radio" name="vModelGroup" value="SLD" v-model="checkedGroupVModel" @click='switchToSLD()'>
            SLD
        </label>
        <label>
            <input type="radio" name="vModelGroup" value="3LD" v-model="checkedGroupVModel" @click='switchTo3LD()'>
            3LD
        </label>
    </div>
</template>

<script>
export default {
    props: {
        switchToSLD: {
            type: Function,
            default: () => { return null; }
        },
        switchTo3LD: {
            type: Function,
            default: () => { return null; }
        },
    },
    data() {
        return {
            checkedGroupVModel: "SLD", //some defaul
            toggleChecked: false,
        };
    },
}
</script>

<style lang="scss" scoped>
@import '../../../../../../styles/components/input';
#sld-switch {
    color: white;
    font-size: 1vw;
    border-bottom: 0.5px solid grey;
    padding: 10px 0 10px 0;
    display: flex;
    justify-content: left;
}
label {
    padding-right: 4em;
    cursor: pointer;
}
</style>
