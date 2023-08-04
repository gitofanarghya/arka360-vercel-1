import TWEEN from '@tweenjs/tween.js';
import * as SunCalc from 'suncalc';
import * as THREE from 'three';
import { SUN_REVOLUTION_RADIUS } from '../coreConstants';

export default class TweenControls {
    constructor(stage) {
        this.stage = stage;
        this.endDate = 0;
        this.selectedTime = 0;
        this.easeTime = 0;
        this.intervalTime = 0;
        this.shadowsEnabled = false;
        this.date = { x: 0 };
        this.TweenActions = {
            startDay: this.startDay.bind(this),
            endDay: this.endDay.bind(this),
            startYear: this.startYear.bind(this),
            endYear: this.endYear.bind(this),
            sun: this.setSunPosition.bind(this),
            startDrag: this.startDragging.bind(this),
            time: 0,
            dayRunning: false,
            yearRunning: false,
            toggleShadows: this.stage.lightsManager.toggleShadows.bind(this.stage.lightsManager),
            latitude: this.stage.getLatitude(),
            longitude: this.stage.getLongitude(),
        };
    }

    createTween() {
        if (this.tween !== undefined) this.tween.stop();
        this.tween = new TWEEN.Tween(this.date)
            .to({ x: this.endDate }, this.easeTime)
            .onUpdate(this.setPos.bind(this))
            .start()
            .onComplete(this.onEnd.bind(this));
    }

    setPos() {
        this.stage.lightsManager
            .setLightPosition(
                this.timeToPos(this.date.x, this.stage.getLatitude(), this.stage.getLongitude()),
            );
        this.stage.lightsManager.setLightTarget();
        this.TweenActions.time = this.date.x;
    }

    startDay() {
        this.TweenActions.dayRunning = true;
        this.simDay();
    }

    endDay() {
        this.TweenActions.dayRunning = false;
        this.tween.stop();
    }

    simDay() {
        this.date = { x: this.TweenActions.time };
        this.endDate = this.TweenActions.time + (24 * 60 * 60 * 1000);
        this.easeTime = 5000;
        this.createTween();
    }
    onEnd() {
        this.simDay();
    }

    startYear() {
        this.TweenActions.yearRunning = true;
        this.t = this.TweenActions.time;
        this.intervalTime = 50;
        this.i = this.t;
        this.timer = setInterval(this.setPositionForYear.bind(this), this.intervalTime);
    }
    endYear() {
        this.TweenActions.yearRunning = false;
        clearInterval(this.timer);
    }

    setPositionForYear() {
        this.stage.lightsManager
            .setLightPosition(this
                .timeToPos(this.i, this.stage.getLatitude(), this.stage.getLongitude()));
        this.stage.lightsManager.setLightTarget();
        this.TweenActions.time = this.i;
        this.i += 24 * 60 * 60 * 1000;
        if ((new Date()).getFullYear() !== (new Date(this.i)).getFullYear()) {
            this.i -= 365 * 24 * 60 * 60 * 1000;
        }
    }

    startDragging() {
        if (this.TweenActions.dayRunning) {
            this.tween.stop();
            this.TweenActions.dayRunning = false;
        }
        else if (this.TweenActions.yearRunning) {
            clearInterval(this.timer);
            this.TweenActions.yearRunning = false;
        }
    }

    setSunPosition() {
        this.stage.lightsManager
            .setLightPosition(this
                .timeToPos(
                    this.TweenActions.time, this.stage.getLatitude(), this.stage.getLongitude()),
            );
        this.stage.lightsManager.setLightTarget();
    }

    setSunPositionForLidar(time) {
        this.stage.lightsManager
            .setLightPosition(this
                .timeToPos(
                    time, this.stage.getLatitude(), this.stage.getLongitude()),
            );
        this.stage.lightsManager.setLightTarget();
    }

    timeToPos(timeAndDate, latitude, longitude) {
        const value = SunCalc.getPosition(timeAndDate, latitude, longitude);
        const pos = new THREE.Vector3(
            -SUN_REVOLUTION_RADIUS * Math.sin(value.azimuth) * Math.cos(value.altitude),
            -SUN_REVOLUTION_RADIUS * Math.cos(value.azimuth) * Math.cos(value.altitude),
            SUN_REVOLUTION_RADIUS * Math.sin(value.altitude));
    
        return pos;
    }
}
