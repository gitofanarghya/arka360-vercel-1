<template>
    <div class="google-maps-container">
        <div id="google-map" ref="map"></div>
        <img v-if="showCentralMarker" class="google-maps-marker" :src="pinImageUrl">
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useMiscStore } from '../../stores/misc';
import mapsLoaded from "./googleMaps.js"
import { getDetailsFromGoogleMapsResult, mapPinImageUrl, getProjectImageUrl,  } from '../../utils'
import {getLatLngOfGivenPixel, getPixelOfLatLng, getDistanceBetweenTwoLatLng } from '../../core/utils/utils'
import { useMapImagesStore } from '../../stores/mapImages';
import { serverBus } from '../../main';


// Fullscreen alterations
async function initFullscreenControl(map) {
    await new Promise(resolve => setTimeout(resolve, 500))

    const elementToSendFullscreen = document.querySelector(".google-maps-container");
    const oldFullscreenControl = map.getDiv().querySelector(".gm-fullscreen-control");
    if (!oldFullscreenControl) {
        return await initFullscreenControl(map)
    }
    const newFullscreenControl = oldFullscreenControl.cloneNode(true);
    oldFullscreenControl.parentNode.replaceChild(newFullscreenControl, oldFullscreenControl);

    newFullscreenControl.onclick = function () {
        if (isFullscreen(elementToSendFullscreen)) {
            exitFullscreen();
        } else {
            requestFullscreen(elementToSendFullscreen);
        }
    };

    document.onwebkitfullscreenchange =
        document.onmsfullscreenchange =
        document.onmozfullscreenchange =
        document.onfullscreenchange =
        function () {
            if (isFullscreen(elementToSendFullscreen)) {
                newFullscreenControl.classList.add("is-fullscreen");
            } else {
                newFullscreenControl.classList.remove("is-fullscreen");
            }
        };
}

function isFullscreen(element) {
    return (
        (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) == element
    );
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullScreen) {
        element.msRequestFullScreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}


export default {
    props: {
        center: {},
        zoom: {},
        mapOptions: {},
        markerPositions: {},
        allProjects: {},
        showCentralMarker: {},
        infoWindowContent: {},
        isResize: {
        type: Boolean,
        default: false
        },
    },
    data() {
        return {
            pinImageUrl: mapPinImageUrl,
            mapObj: null,
            isCentreChanged: false,
            lastWindow: null,
            activeProject: {},
            zoomLevels: {
              20: 3000,
              19: 6200,
              18: 20000,
              17: 70000,
            },
            updatedZoom: useMapImagesStore().zoomLevel,
            updatedLat: useMapImagesStore().latitude,
            updatedLng: useMapImagesStore().longitude,
            updatedDimensions: useMapImagesStore().dimensions,
        }
    },
    async mounted() {
        let vm = this
        vm.UPDATE_GOOGLE_MAPS_STATE({ address: "", coordinates: {} })
        let google
        try {
            google = await mapsLoaded
            this.google = google
        } catch (err) {
            console.error("Google Maps API Load Error")
            console.error(err)
            return
        }

        let mapOptions = this.mapOptions
        mapOptions.center = this.center
        mapOptions.zoom = this.zoom
        mapOptions.tilt = 0
        let map = new google.maps.Map(this.$refs.map, mapOptions);
        this.mapObj = map
        let geocoder = new google.maps.Geocoder();

        if(this.isResize){
            const cityCircle = new google.maps.Circle({
            strokeColor: "#409eff",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#409eff",
            fillOpacity: 0.1,
            map,
            center: {...this.center},
            radius: 100,
            });
            // Set the bounds of the map square
            let pixelBounds = useMapImagesStore().square;
            let bounds = {};
            if (pixelBounds.north == 100) {
                // Make new square
                const swlatlng = getLatLngOfGivenPixel(useMapImagesStore().latitude, useMapImagesStore().longitude, map.getZoom(), 100, 100, pixelBounds.south, pixelBounds.west);
                const nelatlng = getLatLngOfGivenPixel(useMapImagesStore().latitude, useMapImagesStore().longitude, map.getZoom(), 100, 100, pixelBounds.north, pixelBounds.east);
                bounds = {
                    "south": swlatlng.lat,
                    "west": swlatlng.lng,
                    "north": nelatlng.lat,
                    "east": nelatlng.lng,
                };
            }else{
                // If pre-existing square exists
                bounds = {
                    "south": pixelBounds.south,
                    "west": pixelBounds.west,
                    "north": pixelBounds.north,
                    "east": pixelBounds.east,
                };
            }
            // Define a rectangle and set its editable property to true.
            const rectangle = new google.maps.Rectangle({
                bounds: bounds,
                editable: true,
                draggable: true,
                strokeColor: "#fff",
                geodesic: false,
                zIndex:2,
            });

            rectangle.setMap(map);

            let updatingBounds = false;
            let previousBounds = rectangle.getBounds();
            
            rectangle.addListener("bounds_changed", function () {
                if (updatingBounds) return; // Check if bounds are already being updated

                updatingBounds = true; // Set updatingBounds flag

                // Get current bounds of the rectangle
                const currentBounds = rectangle.getBounds();

                // Calculate the pixel coordinates of the northEast and southWest corner
                const nePixel = getPixelOfLatLng(currentBounds.getNorthEast().lat(), currentBounds.getNorthEast().lng(), map.zoom, 100, 100, useMapImagesStore().latitude, useMapImagesStore().longitude); 
                const swPixel = getPixelOfLatLng(currentBounds.getSouthWest().lat(), currentBounds.getSouthWest().lng(), map.zoom, 100, 100, useMapImagesStore().latitude, useMapImagesStore().longitude);

                // Calculate the maximum length (width or height) of the rectangle
                const maxLength = Math.max(Math.abs(nePixel.x - swPixel.x), Math.abs(nePixel.y - swPixel.y));

                const center = {
                    x: (nePixel.x + swPixel.x) / 2, // Calculate the x-coordinate of the center
                    y: (nePixel.y + swPixel.y) / 2, // Calculate the y-coordinate of the center
                };

                // Calculate the boundary of the new pixel bounds
                const newPixelBounds = {
                    north: center.x + maxLength / 2,
                    south: center.x - maxLength / 2,
                    east: center.y + maxLength / 2,
                    west: center.y - maxLength / 2,
                };

                // Convert the pixel coordinates of the corners to latitude and longitude
                const nelatlng1 = getLatLngOfGivenPixel(useMapImagesStore().latitude, useMapImagesStore().longitude, map.getZoom(), 100, 100, newPixelBounds.north, newPixelBounds.east);
                const swlatlng1 = getLatLngOfGivenPixel(useMapImagesStore().latitude, useMapImagesStore().longitude, map.getZoom(), 100, 100, newPixelBounds.south, newPixelBounds.west);

                // Set the latitude of the new bounds
                const newBounds = {
                    south: swlatlng1.lat, 
                    west: swlatlng1.lng,
                    north: nelatlng1.lat,
                    east: nelatlng1.lng,
                };

                // Check if the center of the rectangle is inside the circle
                const centerInCircle = cityCircle.getBounds().contains(currentBounds.getCenter()); 
                if (centerInCircle) {
                    rectangle.setBounds(newBounds);
                    // Calculate zoom and fetch image based on the new bounds and center
                    vm.calculateZoomAndFetchImage(newBounds, currentBounds.getCenter()); 

                    // Update the longitude & latitude value
                    vm.updatedLng = currentBounds.getCenter().lng(); 
                    vm.updatedLat = currentBounds.getCenter().lat();
                    vm.$emit("areaFinal", vm.updatedLat, vm.updatedLng, vm.updatedZoom, vm.updatedDimensions, newBounds);
                    
                    // Store the new bounds as previous bounds for future reference
                    previousBounds = newBounds; 
                    this.newBoundsCheck = {updatedLat: vm.updatedLat, updatedLng: vm.updatedLng, updatedZoom: vm.updatedZoom, updatedDimensions: vm.updatedDimensions};
                    serverBus.$emit("newBounds", this.newBoundsCheck)
                } else if (previousBounds) {
                    // Restore the previous bounds of the rectangle
                    rectangle.setBounds(previousBounds); 
                }

                updatingBounds = false; // Reset the updatingBounds flag
            });
        }
        google.maps.event.addListener(map, 'zoom_changed', function () {
            vm.$emit("zoomChanged", map.getZoom())
        });

        google.maps.event.addListener(map, 'center_changed', function () {
            vm.$emit("centerChanged", map.getCenter())
            vm.isCentreChanged = true
        });

        google.maps.event.addListener(map, 'idle', function () {
            vm.addMarkerPoints()

            if (!vm.isCentreChanged) { return }

            vm.$emit("idle")
            vm.isCentreChanged = false
            let pos = map.getCenter()
            vm.googleMapsState.isLoadingAddressFromMarker = true
            geocoder.geocode({
                latLng: pos
            }, function (responses) {
                if (!(responses && responses.length)) { return }
                let address = responses[0].formatted_address
                let { countryCode, state, postalCode } = getDetailsFromGoogleMapsResult(responses[0],responses);
                if (!vm.googleMapsState.isAddressChosenByInput) {
                    vm.UPDATE_GOOGLE_MAPS_STATE({ state, countryCode, address, postalCode })
                } else {
                    vm.UPDATE_GOOGLE_MAPS_STATE({ state, countryCode, isAddressChosenByInput: false, postalCode })
                }  
                vm.googleMapsState.isLoadingAddressFromMarker = false
            })
        });
        initFullscreenControl(map)
    },
    computed: {
        ...mapState(useMiscStore, {
            googleMapsState: "GET_GOOGLE_MAPS_STATE"
        }),
    },
    methods: {
        ...mapActions(useMiscStore, ["UPDATE_GOOGLE_MAPS_STATE"]),
        addMarkerPoints() {
            if (!this.allProjects?.length) { return }

            let map = this.mapObj
            let content = this.infoWindowContent
            this.allProjects.forEach(proj => {
                let pos = proj.position
                let marker = new this.google.maps.Marker({
                    position: pos,
                    map,
                });

                let infowindow = new google.maps.InfoWindow({
                    content,
                });

                marker.addListener("click", () => {
                    // this.activeProject = proj
                    this.$emit("changeActiveProject", proj)
                    infowindow.open({
                        anchor: marker,
                        map,
                    });
                    if (this.lastWindow) {
                        this.lastWindow.close()
                    }
                    this.lastWindow = infowindow
                });
            })
        },
        calculateZoomAndFetchImage(newBounds,center) {
          const { north, south, east, west } = newBounds;
          const area = this.calculateArea(north, south, east, west);
          const zoom = this.calculateZoom(area);
          const boundEdgePixels = ( Math.sqrt(area) * 512) / (72 * Math.pow(2, 20 - Number(zoom)));
          this.updatedDimensions = parseInt(boundEdgePixels)+(parseInt(boundEdgePixels*0.15));
          this.updatedZoom = zoom;

        },

        calculateArea(north, south, east, west) {
            const length = getDistanceBetweenTwoLatLng(north, east, south, east)
            const breadth = getDistanceBetweenTwoLatLng(north, east, north, west)
            const area = length * breadth;
            return area;
        },
        calculateZoom(area) {
            let closestZoomLevel = null;
            let minDifference = Infinity;

            for (const zoom in this.zoomLevels) {
              const areaDiff = Math.abs(area - this.zoomLevels[zoom]);
              if (areaDiff < minDifference) {
                minDifference = areaDiff;
                closestZoomLevel = zoom;
              }
            }

            return parseInt(closestZoomLevel);
        },



    },
    watch: {
        "googleMapsState.coordinates": function (newVal) {
            if (!this.google) { return }

            var latLng = new this.google.maps.LatLng(newVal.lat(), newVal.lng())
            // this.mapObj.panTo(latLng)
            this.mapObj.setCenter(latLng)
            this.mapObj.setZoom(19)
        },
    }
}
</script>

<style scoped>
.google-maps-container {
    height: 100%;
    width: 100%;
    position: relative;
}

#google-map {
    height: 100%;
    width: 100%;
}

.google-maps-marker {
    position: absolute;
    height: 40px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    pointer-events: none;
    filter: drop-shadow(-0px -0px 4px #000000);
}
</style>