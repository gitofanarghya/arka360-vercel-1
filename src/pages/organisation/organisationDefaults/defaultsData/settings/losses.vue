<template>
	<div id="settingsLossesDefaults">

		<div>

			<div>
				<p class="headings"> Soiling </p>
				<p class="data"> {{ profileData.constant_losses.irradiance.soiling }} </p>
			</div>

			<div>
				<p class="headings"> Mismatch </p>
				<p class="data"> {{ profileData.constant_losses.dc.mismatch }} </p>
			</div>

			<div>
				<p class="headings"> LID </p>
				<p class="data"> {{ profileData.constant_losses.dc.lid }} </p>
			</div>

			<div>
				<p class="headings"> DC Ohmic </p>
				<p class="data"> {{ profileData.constant_losses.dc.dc_ohmic }} </p>
			</div>

			<div>
				<p class="headings"> AC Ohmic </p>
				<p class="data"> {{ profileData.constant_losses.ac.ac_ohmic }} </p>
			</div>

			<div>
				<p class="headings"> Unavailibility </p>
				<p class="data"> {{ profileData.constant_losses.ac.unavailability }} </p>
			</div>

			<div>
				<p class="headings"> Module Degradation Rate </p>
				<p class="data"> {{ profileData.constant_losses.module_degradation_rate }} </p>
			</div>


			<div>
				<p class="headings"> Inverter Efficiency </p>
				<p class="data"> {{ profileData.constant_losses.inverter_efficiency }} </p>
			</div>

		</div>



	</div>
</template>

<script>

    export default {
        name: 'settingsLossesDefaults',
        props: ['profileData'],

        data() {
            return {
                msg: ' I am in settingsLossesDefaults',
            }
        },
    }

</script>
