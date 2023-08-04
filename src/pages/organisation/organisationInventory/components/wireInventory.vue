<!-- UNUSED FILE -->
<template>
    <div id="wireInventory">

        <p> {{ msg }} </p>


    </div>


</template>

<script>

export default {
    name: 'WireInventory',
    data() {
  	return {
  		msg: ' I am in wireInventory',
            addPanelDiv: false,
            loading: false,
            selectedPanelId: '',
  		panelSearch: '',
            panelInventory: [],
            nextURL: '',
            prevURL: '',
  	};
    },
};
</script>


<style type="text/css">

</style>
