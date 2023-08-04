import { serverBus } from '../main';
import * as CONSTANTS from './componentManagerConstants';

function onMouseMove(cursorCoordinates) {
    serverBus.$emit(CONSTANTS.MOUSE_MOVE, cursorCoordinates);
}

function initRepeat(repeatFunc) {
    function onChange(repeatCount) {
        repeatFunc(repeatCount);
    }
    serverBus.$emit(CONSTANTS.INIT_REPEAT, onChange);
}

function rKeyPress() {
    serverBus.$emit(CONSTANTS.R_KEY_PRESSED);
}

export { onMouseMove, initRepeat, rKeyPress };
