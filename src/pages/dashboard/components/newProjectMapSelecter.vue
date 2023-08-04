<!-- UNUSED FILE -->
<template>
  <div id="mapSelector">
    <div id="mapWrapperNewProject">
      <!-- <div class="searchBarWrapper">
                <label>
                    <gmap-autocomplete
                        id="mapAutoSearch"
                        @place_changed="setPlace"/>
                </label>
            </div> -->

      <GmapMap
        :center="geoLocation.center"
        :zoom="20"
        :mapTypeId="mapType"
        :tilt='0'
        :options="{ mapTypeControl: true, streetViewControl: false, zoomControl: true, }"
        class="mapImageStyler"
        @center_changed="updateCenter"
        @zoom_changed="updateZoom"
        @idle="sync"
      >
        <GmapMarker :position="searchedLocation" />
      </GmapMap>
    </div>
  </div>
</template>

<script>
export default {
  name: "MapSelector",
  props: {
    geoLocation: {
      type: Object,
      default() {
        return {
          center: { lat: 28.5421285, lng: 77.3348087 },
          zoom: 20,
        };
      },
    },
    place: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      msg: " I am in newProject",
      mapType: "hybrid",
      reportedMapCenter: {
        lat: 28.5421285,
        lng: 77.3348087,
      },
      searchedLocation: {
        lat: 28.5421285,
        lng: 77.3348087,
      },
    };
  },
  watch: {
    place: {
      deep: true,
      handler(value) {
        this.setPlace(value);
      },
    },
  },
  methods: {
    updateCenter(latLng) {
      this.reportedMapCenter = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
    },
    updateZoom(zoom) {
      this.geoLocation.zoom = zoom;
    },
    setPlace(place) {
      // figure out if it is lat lng or address
      if (place.hasOwnProperty("geometry")) {
        this.reportedMapCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        this.searchedLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        // this.searchedLocation.lat = place.geometry.location.lat();
        // this.searchedLocation.lng = place.geometry.location.lng();
      } else {
        // splitting the value
        let coordinatesStringsArray = place["name"].split(/(?:,| )+/);

        // filtering non empty values
        let filteredCoordinatesStringsArray = coordinatesStringsArray.filter(
          function(el) {
            return parseFloat(el);
          }
        );

        // syncing searched lat long with map
        if (filteredCoordinatesStringsArray.length === 2) {
          let latitude = parseFloat(filteredCoordinatesStringsArray[0]);
          let longitude = parseFloat(filteredCoordinatesStringsArray[1]);
          this.reportedMapCenter = {
            lat: latitude,
            lng: longitude,
          };
          this.searchedLocation = {
            lat: latitude,
            lng: longitude,
          };
          // this.searchedLocation.lat = latitude;
          // this.searchedLocation.lng = longitude;
        } else {
          console.error("MapSelector: setPlace: Search Query is not correct");
        }
      }
      this.sync();
    },
    sync() {
      this.geoLocation.center = this.reportedMapCenter;
    },
  },
};
</script>

<style type="text/css" scoped>
#mapSelector {
  width: 325px;
  height: 310px;
}

.searchBarWrapper {
  text-align: left;
  border: 2px solid #c0c4cc;
  height: 28px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
}

#mapWrapperNewProject {
  background-color: white;
  width: 100%;
  height: 100%;
  display: block;
}

#mapWrapperNewProject >>> .vue-map {
  border-radius: 4px !important;
}

#mapWrapperNewProject input {
  height: 100%;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
}
/* optimised assuming map is to be kept as a square */
.mapImageStyler {
  height: 465px;
  width: 512px;
  transform: scale(calc(325 / 512));
  position: relative;
  top: -90px;
  left: -93px;
}

 @media (max-width: 1140px) {
 .mapImageStyler {
  height: 70vh;
  width: 140vw;
  transform: scale(calc(325 / 512));
  position: relative;
  top: -13vh;
  left: -25vw;
}
 #mapSelector {
  width: auto;
  height: auto;
}

 }

</style>

<!--  This is required for map styling (suggestion dropdown) -->
<style>
.pac-container {
  z-index: 3000;
}

body .gm-control-active .gm-fullscreen-control {
  margin: 20px !important;
  width: 30px;
  height: 30px;
}
</style>
