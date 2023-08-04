import API from '@/services/api';
import { useLeadStore } from '../../../../../stores/lead';
let leadStore = useLeadStore();
const weatherMixin = {
    created() {
    },
    methods: {
        getDistanceFromLocation(lat1, lon1, lat2, lon2) {

            const R = 6371; // Radius of the earth in km
            const dLat = this.deg2rad(lat2 - lat1);
            const dLon = this.deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km
            return d.toFixed(2);
        },

        deg2rad(deg) {
            return deg * (Math.PI / 180);
        },
        async fetchWeatherFiles(lat, lon) {
            
            if (lat !== null && lon !== null) {
                try {
                    const response = await API.MASTER_DATA_WEATHER.GET_SORTED_WEATHER_FILES(lat, lon);
                    const updatedWeatherFiles = [];
                    response.data.results.forEach((item) => {
                        const distanceToLocation = this.getDistanceFromLocation(item.latitude, item.longitude, lat, lon);
                        updatedWeatherFiles.push({
                            id: item.id,
                            format: item.format,
                            siteName: item.site_name,
                            latitude: parseFloat(item.latitude).toFixed(3),
                            longitude: parseFloat(item.longitude).toFixed(3),
                            source: item.source,
                            distance: distanceToLocation,
                            status:item.old,
                        });
                    });
                    return updatedWeatherFiles;
                }
                catch (e) {
                }
            }
        },
        async patchWeatherStation(weatherId) {

            // on changing weather station, make a patch api call to projectSummary
            const patchData = {
                weather: weatherId,
            };
            const projectID = this.$route.params.projectId || leadStore?.project_details?.id;
            try {
                await API.PROJECTS.PATCH_WEATHER_STATION(projectID, patchData);
                this.$message({
                    showClose: true,
                    message: 'Successfully updated weather station.',
                    type: 'success',
                    center: true
                });
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in updating weather station. Try again.',
                    type: 'error',
                    center: true
                });
                throw e;
            }
        },
    },
};

export { weatherMixin };
