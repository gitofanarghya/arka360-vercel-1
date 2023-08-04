import { Loader } from '@googlemaps/js-api-loader'
import { GOOGLE_API_KEY_TILES } from "../../constants";

const loader = new Loader({
    apiKey: GOOGLE_API_KEY_TILES,
    version: "weekly",
    libraries: ["places"]
});

export default loader.load()