<template>
    <div v-loading="googleMapsState.isLoadingAddressFromMarker">
        <input v-model="googleMapsState.address" ref="autocomplete" :placeholder="placeholder" @focus="$event.target.select()"/>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useMiscStore } from '../../stores/misc'
import mapsLoaded from "./googleMaps.js"
import { getDetailsFromGoogleMapsResult } from '../../utils'

export default {
    props: {
        placeholder: {
            type: String,
            default: "",
        }
    },
    mounted() {
        let vm = this
        mapsLoaded.then((google) => {
            let input = this.$refs.autocomplete
            const searchBox = new google.maps.places.SearchBox(input);
            searchBox.addListener("places_changed", () => {
                vm.$emit("placesChanged")
                let places = searchBox.getPlaces()
                for (let place of places) {
                    let coordinates = place?.geometry?.location
                    if (!coordinates) { continue }

                    let address = vm.$refs.autocomplete.value
                    let { countryCode, state, postalCode } = getDetailsFromGoogleMapsResult(place)
                    let isAddressChosenByInput = true
                    // Weird logic, but it works
                    if (!place.address_components) {
                        isAddressChosenByInput = false
                    }
                    vm.UPDATE_GOOGLE_MAPS_STATE({ coordinates, address, state, countryCode, isAddressChosenByInput , postalCode})
                    break
                }
            })
        });
    },
    computed: {
        ...mapState(useMiscStore, {
            googleMapsState: "GET_GOOGLE_MAPS_STATE"
        }),
    },
    methods: {
        ...mapActions(useMiscStore, ["UPDATE_GOOGLE_MAPS_STATE"]),
    }
}
</script>

<style scoped>
.searchBarWrapper input {
  height: 48px;
  background-color: #e8edf2;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  color: #222;
  border-radius: 4px;
}

.createLeadSearchBarWrapper input{
    height: 48px;
  background-color: #e8edf2;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
  font-size: 16px;
  color: #222;
  border-radius: 4px;
}
</style>