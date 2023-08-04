import {panelMapExporter, roofMapExporter} from "../utils/exporters";
import axios from "axios";
import {BASE_URL} from "../coreConstants";
import PolygonModel from "../objects/model/PolygonModel";
import CylinderModel from "../objects/model/CylinderModel";
import Subarray from "../objects/subArray/Subarray";
import { DATABASE_URL } from '../../constants';
import { SmartroofModel } from "../objects/model/smartroof/SmartroofModel";
import SmartroofFace from "../objects/model/smartroof/SmartroofFace";
import Dormer from "../objects/model/smartroof/Dormer";

export default class AsyncManager {

    constructor(stage) {

        this.stage = stage;

        this.solarAccessComputed = true;
        this.solarAccessNotificationObject = null;
        this.LATEST_SOLAR_ACCESS_REQUEST_ID = 0;
        this.showError = true;
    }

    _getSolarAccessRequestId() {
        this.LATEST_SOLAR_ACCESS_REQUEST_ID += 1;
        return this.LATEST_SOLAR_ACCESS_REQUEST_ID;
    }

    static _updateSubarraySolarAccess(object, solarAccessMap) {
        for (let child of object.getChildren()) {
            if (child instanceof PolygonModel || child instanceof CylinderModel || child instanceof SmartroofFace || child instanceof SmartroofModel || child instanceof Dormer) {
                AsyncManager._updateSubarraySolarAccess(child, solarAccessMap);
            }
            else if (child instanceof Subarray) {
                child.updateSolarAccess(solarAccessMap[ child.id.toString() ]);
            }
        }
    }

    _setSolarAccessComputing() {
        if (this.solarAccessComputed) {
            this.solarAccessComputed = false;
            this.solarAccessNotificationObject = this.stage.eventManager.solarAccessLoading();
        }
    }

    _setSolarAccessFinished() {
        if (!this.solarAccessComputed) {
            this.solarAccessComputed = true;
            this.stage.eventManager.solarAccessLoaded(this.solarAccessNotificationObject);
        }
    }

    isSolarAccessComputed() {
        return this.solarAccessComputed;
    }

    setReportSpecialSettings() {
        this.showError = false;
    }

    async updateSolarAccess(notify = true) {

        const panelMap = panelMapExporter(this.stage);

        // check if there are panels, then do all this, else pass
        if (panelMap.length > 0) {
            let solarAccessRequestId = this._getSolarAccessRequestId();

            try {
                // let solarAccessResponse;
                // if (!localStorage.getItem("solaraccessData")) {
                if (notify) {
                    this._setSolarAccessComputing();
                }
                let refOrDesignID = ""
                    if(this.stage.getDesignId()){
                    refOrDesignID = this.stage.getDesignId()
                    }else{
                    refOrDesignID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
                }
                const solarAccessResponse = await axios.get(DATABASE_URL + 'api/designs/' + refOrDesignID + '/solar_access/');
                if (solarAccessRequestId === this.LATEST_SOLAR_ACCESS_REQUEST_ID) {
                    AsyncManager._updateSubarraySolarAccess(this.stage.ground, solarAccessResponse.data);
                    if (solarAccessRequestId === this.LATEST_SOLAR_ACCESS_REQUEST_ID) {
                        this._setSolarAccessFinished();
                    }
                }
                // }
                // else {
                //     solarAccessResponse = JSON.parse(localStorage.getItem('solaraccessData'))
                //     AsyncManager._updateSubarraySolarAccess(this.stage.ground, solarAccessResponse);
                // }
            } catch (error) {
                if (this.showError) {
                    if (solarAccessRequestId === this.LATEST_SOLAR_ACCESS_REQUEST_ID) {
                        console.error('Solar Access: updateHeatMap: Request failed.', error);
                        if (notify) {

                            this.stage.eventManager.solarAccessLoadingFailed(this.solarAccessNotificationObject);
                        }
                    }
                }
                else {
                    this._setSolarAccessFinished();
                }
                console.error('ERROR: AsyncManager: updateSolarAccess unsuccessful.', error);
            }
        }
    }

    async updateSolarAccessForSubarray(subarray) {

        let notificationObject = this.stage.eventManager.setSolarAccessLoadingForSubarray(subarray.name);

        let solarAccessRequest = {
            roofMap: roofMapExporter(
                this.stage,
                { approximateCylinder: true },
                { approximateTree: true },
            ),
            panelMap: [subarray.getSubarrayMap()],
            allPanelMap: panelMapExporter(this.stage),
        };

        try {
            let solarAccessResponse = await axios.post(
                BASE_URL + 'partial-solar-access?lat=' + this.stage.getLatitude().toString()
                + '&lon=' + this.stage.getLongitude().toString()
                + '&weather=' + this.stage.eventManager.getWeatherID(),
                solarAccessRequest
            );

            if (!solarAccessResponse.data.hasOwnProperty(subarray.id.toString())) {
                console.error('ERROR: AsyncManager: Requested and received subarrays don\'t match');
                this.stage.eventManager.setSolarAccessFailedForSubarray(subarray.name, notificationObject);
                return Promise.reject(new Error('Requested and received subarrays don\'t match'));
            }
            subarray.updateSolarAccess(solarAccessResponse.data[subarray.id.toString()]);
            this.stage.eventManager.setSolarAccessFinishedForSubarray(notificationObject);
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: AsyncManager: updateSolarAccessForSubarray failed', error);
            this.stage.eventManager.setSolarAccessFailedForSubarray(subarray.name, notificationObject);
            return Promise.reject(error);
        }
    }

}
