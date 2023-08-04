import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Walkway from '../objects/model/Walkway';
import Tree from '../objects/model/Tree';
import Table from '../objects/subArray/Table';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import { CLIPBOARD_READ_ACCESS, CLIPBOARD_WRITE_ACCESS } from '../coreConstants';
import TextBox from '../objects/subObjects/TextBox';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import HippedDormer from '../objects/model/smartroof/dormers/HippedDormer';
import GabledDormer from '../objects/model/smartroof/dormers/GabledDormer';
import FlatDormer from '../objects/model/smartroof/dormers/FlatDormer';

export async function handleClipboardDataEvent(clipboardAccessMode, event, copyData = null) {
    let clipboardPermission = false;
    let pasteData = null;
    if (navigator.clipboard) {
        try {
            const permission = await navigator.permissions.query({
                name: clipboardAccessMode,
            });
            clipboardPermission = permission.state === 'granted';
        }
        catch (ex) {
            console.error('ERROR: DuplicateManager: AsyncClipboardApi not supported', ex);
        }
    }
    if (clipboardPermission) {
        try {
            if (clipboardAccessMode === CLIPBOARD_READ_ACCESS) {
                pasteData = await navigator.clipboard.readText();
            }
            else if (clipboardAccessMode === CLIPBOARD_WRITE_ACCESS) {
                await navigator.clipboard.writeText(copyData);
            }
        }
        catch (ex) {
            console.error(`ERROR: DuplicateManager: ${clipboardAccessMode} text issue.`, ex);
        }
    }
    else {
        try {
            if (clipboardAccessMode === CLIPBOARD_READ_ACCESS) {
                pasteData = event.clipboardData.getData('text/plain');
            }
            else if (clipboardAccessMode === CLIPBOARD_WRITE_ACCESS) {
                event.clipboardData.setData('text/plain', copyData);
            }
            event.preventDefault();
        }
        catch (ex) {
            console.error('ERROR: DuplicateManager: event.clipboardData not accessible', ex);
        }
    }
    return pasteData;
}

export function copyObjectJson(objects) {
    if (objects !== null) {
        const objectData = [];
        for (let i = 0; i < objects.length; i += 1) {
            if (objects[i] instanceof PolygonModel
                || objects[i] instanceof CylinderModel
                || objects[i] instanceof Table
                || objects[i] instanceof Walkway
                || objects[i] instanceof Tree
                || objects[i] instanceof Inverter
                || objects[i] instanceof ACDB
                || objects[i] instanceof TextBox
                || objects[i] instanceof SmartroofModel
                || objects[i] instanceof HippedDormer
                || objects[i] instanceof GabledDormer
                || objects[i] instanceof FlatDormer
            ) {
                objectData.push(objects[i].saveObject(true));
            }
        }
        return window.btoa(JSON.stringify(objectData));
    }
    return null;
}
