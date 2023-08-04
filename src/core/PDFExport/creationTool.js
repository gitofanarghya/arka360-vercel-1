import * as makerjs from 'makerjs';
import { saveAs } from 'file-saver';
// import blobStream from 'blob-stream';
import * as THREE from 'three';
import API from '@/services/api/';

import { store } from '../../store';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Tree from '../objects/model/Tree';
import {
    CreatePDFTemplate,
    generateHeader,
    createProjectHeading,
} from './componentGenerator';
import gsap from 'gsap';
import { getAllModuleQuantity } from '../utils/subarrayUtils';
import tz_lookup from 'tz-lookup';
import { DateTime } from 'luxon';
import fixWebmDuration from 'webm-duration-fix';

function extractModelData(object) {
    const model = {};

    if (object instanceof CylinderModel) {
        model.type = 'Circle';
        model.radius = object.cylinderRadius;
        model.center = object.get2DOutlineVertices().shift();
    }
    else if (object instanceof Tree) {
        model.type = 'Circle';
        model.radius = object.crownRadius;
        model.center = object.get2DOutlineVertices().shift();
    }
    else if (object instanceof PolygonModel) {
        model.type = 'Polygon';
        model.vertices = object.get2DVertices();
    }
    model.children = [];

    const children = object.getChildren();
    for (let i = 0, len = children.length; i < len; i += 1) {
        if (children[i] instanceof CylinderModel ||
            children[i] instanceof Tree ||
            children[i] instanceof PolygonModel) {
            const modelData = extractModelData(children[i]);
            model.children.push(modelData);
        }
    }

    return model;
}

function getProjectDetails() {
    const data = {
        projectName: store.state.design.project.name,
        clientDetails: {
            clientName: store.state.project.client_name,
            clientAddress: store.state.project.client_address,
            contact: store.state.project.client_phone,
        },
        designDetails: {
            designName: store.state.design.name,
            geoLocation: {
                lat: store.state.design.project.latitude,
                long: store.state.design.project.longitude,
            },
        },
    };
    return data;
}

function extractDimensionData(dimensionObjects) {
    const dimensions = [];
    const keys = Object.keys(dimensionObjects);
    for (let i = 0, len = keys.length; i < len; i += 1) {
        const p1 = dimensionObjects[keys[i]].vertexObj1.getPosition().toArray();
        p1.pop();
        const p2 = dimensionObjects[keys[i]].vertexObj2.getPosition().toArray();
        p2.pop();
        dimensions.push([p1, p2]);
    }

    return dimensions;
}

export function extractDesignData(stage) {
    const designData = {};
    designData.models = extractModelData(stage.ground);
    designData.dimensions = extractDimensionData(stage.dimensionObjects);

    return designData;
}

function getTimeStamp() {
    const time = new Date();
    const date = time.getDate();
    const month = time.getMonth() + 1;
    const year = time.getFullYear();
    const hrs = time.getHours();
    const mins = time.getMinutes();

    return `{${date < 10 ? '0' : ''}${date}-${month < 10 ? '0' : ''}${month}-${year} ${hrs < 10 ? '0' : ''}${hrs}-${mins < 10 ? '0' : ''}${mins}}`;
}

// function addText(){
//     const canvas = document.createElement("p");
//     let textNode = document.createTextNode("Hello World");
//     canvas.appendChild(textNode);
//     //set styling properties
//     canvas.style.position = 'absolute';
//     canvas.style.top = 10 + '%';
//     canvas.style.right = 3 + '%';
//     canvas.style.width = 32 + '%';
//     canvas.style.minHeight = 10 + '%';
//     canvas.style.display = 'inline';
//     canvas.style.background = 'rgba(255, 255, 255, .3)';
//     canvas.style.padding = 15 + 'px';
//     //canvas.style.textAlign = 'justify';
//     canvas.style.fontSize = 25 + 'px';
//     canvas.style.fontWeight = 'bold';
//     canvas.style.color = 'rgba(0, 0, 0, 1)';
//     canvas.style.borderRadius = 8 + '%';
//     //add text to design
//     const element = document.getElementById("studio-stage");
//     const child = document.getElementById("design-canvas");
//     element.appendChild(canvas,child);
//     return canvas;
// }

async function uploadFileToBlob(videoBlob,refId){

    const accountName = "downloadstsl";
    const containerName = "threedvideos";
    const fileName = refId + '.mp4';
    // const sasToken = 'se=2023-01-12T12%3A50%3A43Z&sp=rwdl&sv=2021-06-08&sr=c&sig=A7J8yC4ZhvpjVh/5G2u5AvOR0p1H8WTeLWLoqCqZk6g%3D';
    const response_Azure_sas = await API.AZURE_SAS_TOKEN.FETCH_AND_SET_SAS_TOKEN();
    const sasToken = response_Azure_sas.data['sas_token'];


    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;
    const response = await fetch(url,
        {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
            },
            body: videoBlob
        });
    let downloadUrl = response.url.split('?');
    console.log('downloadUrl: ', downloadUrl[0]);
    return downloadUrl[0];
}

async function on_media_recorder_stop(videoData, refId = '') {
    const blob = new Blob(videoData, { type: "video/webm; codecs=vp9" });
    // Create a new video element
    const fixBlob = await fixWebmDuration(blob);
    let recording_url = URL.createObjectURL(fixBlob);
    const a = document.createElement('a');
    a.style = "display: none;";
    a.href = recording_url;
    a.download = "Design_Demo_" + refId + ".webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
        URL.revokeObjectURL(recording_url);
    }, 100);
    return fixBlob;
}

function recordScreen(refId) {
    const videochunks = [];
    const canvasEl = document.getElementById("design-canvas");
    const canvas_stream = canvasEl.captureStream(60); // fps
    // Create media recorder from canvas stream
    let media_recorder = new MediaRecorder(canvas_stream, { mimeType: "video/webm; codecs=vp9" });
    // Record data in chunks array when data is available
    media_recorder.ondataavailable = (evt) => { 
        // console.log(evt.data);
        videochunks.push(evt.data); 
    };
    media_recorder.onstop = () => {
        on_media_recorder_stop(videochunks,refId);
    }
    // Start recording using a 1s timeslice [ie data is made available every 1s)
    media_recorder.start();

    // setTimeout(() => {
    //     media_recorder.stop();
    // }, 71000);
    return media_recorder;
}

function getLocalIana(lat, long) {
    const zoneIANA = tz_lookup(lat, long);
    return zoneIANA;
}

function getLocalTimeOffset(lat, long) {
    const zoneIANA = getLocalIana(lat, long);
    const time = DateTime.fromMillis(Date.now(), { zone: zoneIANA });
    const timeOffset = time.offset * 60 * 1000;
    return timeOffset;
}

function getLocalTime(lat, long, hour, min, day, month) {
    return new Date(Date.UTC(new Date().getFullYear(), month - 1, day, hour, min)).getTime() - getLocalTimeOffset(lat, long);
}

async function loadHeatMap(stage) {
    await stage.heatMap.show(false);
    stage.heatMap.hide();
}
async function loadSolarAccess(stage) {
    await stage.asyncManager.updateSolarAccess(false);
    stage.hideSolarAccess();
}

function showHMSLA(stage) {
    stage.showSolarAccess();
    if (stage.heatMap.material.map !== null) {
        stage.heatMap.show();
    }
}
function hideHMSLA(stage) {
    stage.hideSolarAccess();
    if (stage.heatMap.material.map !== null) {
        stage.heatMap.hide();
    }
}

function getOrgName() {
    let organisationData = JSON.parse(localStorage.getItem('organisation')) || {};
    return organisationData.name;
}

function makeTextSprite(message, parameters, stage, prevMesh = false, lineHeight = 34) {
    if (prevMesh) {
        let selectedObject = stage.sceneManager.scene.getObjectById(prevMesh.id);
        stage.sceneManager.scene.remove(selectedObject);
    }
    if (parameters === undefined) parameters = {};
    let fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Helvetica neue";
    let fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 11;
    let borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 20;
    let borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 255, g: 255, b: 255, a: 1.0 };
    let backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 0, b: 255, a: 1.0 };
    let textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

    let canvas = document.getElementById('copyCanvas');
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "Bold " + fontsize + "px " + fontface;
    context.backgroundColor = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.borderColor = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
    context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
    context.textAlign = 'center';

    let words = message.split(' ');
    let line = '';
    let x = canvas.width/2;
    let y = fontsize + borderThickness;
    for(let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > canvas.width && n > 0) {
        context.fillText(line, x, y,canvas.width);
        line = words[n] + ' ';
        y += lineHeight;
      }else if (words[n] === '\n'){
        context.fillText(line, x, y,canvas.width);
        line = '';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y,canvas.width);

    let texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;
    let spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    sprite.position.set(-5, -10, -5);
    stage.sceneManager.scene.add(sprite);
    return sprite;
}

function getPointWithDeltaToAPoint(v1, v2, delta = 15,down = true,deltaDown = 7.5) {
    // v1.z += 0.5;
    const distanceP1ToP2 = v1.distanceTo(v2);
    const ratio = delta / distanceP1ToP2;
    const requiredPoint = new THREE.Vector3(
        ((1 - ratio) * v1.x) + (ratio * v2.x),
        ((1 - ratio) * v1.y) + (ratio * v2.y),
        ((1 - ratio) * v1.z) + (ratio * v2.z),
    );
    if(down){
        let reqP = requiredPoint.clone();
        let v3 = new THREE.Vector3(0,0,0);
        v3 = requiredPoint.clone().sub(v1).normalize();
        // var myPlane = new THREE.Plane(v3, requiredPoint.clone().distanceTo(v2));
        var myPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(v3, requiredPoint.clone());
        reqP.z = reqP.z-1;
        let result = new THREE.Vector3();
        myPlane.projectPoint(reqP, result);
        const dirVec = requiredPoint.clone().sub(result);
        result = dirVec.normalize().negate().multiplyScalar(deltaDown);
        requiredPoint.add(result);
    }
    return requiredPoint;
}

function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.id = "copyCanvas";
    canvas.width = 600;
    canvas.height = 350;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";
    canvas.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
}

export async function createVideo(stage) {
    try {
        createCanvas(640,512);
        //switch to 3d http://localhost:8080/studio/33597
        let orgName = getOrgName();

        stage.switchTo3d();
        await new Promise(resolve => setTimeout(resolve, 200));
        stage.controlsManager._3dControls.reset()
        stage.controlsManager._3dControls.disable();
        stage.controlsManager._2dControls.disable();

        //stage.sceneManager.scene.add(stage.cameraManager.perspectiveCamera);
        // for scaling animation as per design
        let initialPos = stage.cameraManager.perspectiveCamera.position.clone();
        let groundLength = Math.abs(stage.ground.get2DVertices()[0][0]);

        // add text
        let spritey = makeTextSprite("The Solar Labs, worlds best solar design software.", { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage);
        spritey.position.set(5, 10, 5);
        // let text = addText();
        let text = "";
        let lat = stage.getLatitude();
        let long = stage.getLongitude();
        //addEndScene();

        // set Shadow & reset camera 
        stage.tweenControls.TweenActions.toggleShadows();
        stage.tweenControls.TweenActions.time = getLocalTime(lat, long, 13, 0, 21, 3);
        stage.tweenControls.TweenActions.sun();

        // Load Solar Access & HeatMap
        let timeLine = gsap.timeline();
        loadSolarAccess(stage);
        loadHeatMap(stage);
        //get module data and dc size
        let modules = getAllModuleQuantity(stage);
        let dcSize = parseFloat(stage.getDcSize()).toFixed(2);
        let media_recorder = recordScreen(stage.getReferenceId());
        const videochunks = [];
        // Record data in chunks array when data is available
        //media_recorder.ondataavailable = (evt) => { videochunks.push(evt.data); };
        try {
            // Start Animation: 1min 10.5seconds
            await timeLine.to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: -groundLength * 1.3,
                z: initialPos.z - 3,
                duration: 5,
                ease: 'inline',
                //stagger: 0.1,
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    //('perspectiveCamera: ',  stage.cameraManager.perspectiveCamera.position);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    //('cameaPos: ', cameaPos);
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0),8,true,4);
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onStart: function () {
                    // text.innerHTML = 'Welcome';
                    // text.style.display = 'inline';
                    spritey = makeTextSprite("This 3D design of a solar generation system is just a simulation,"+ 
                    " not considering the shadows of nearby objects. The design is for informational purposes only,"
                    +" with all copyrights and trademarks reserved.", 
                    { fontsize: 18, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey, 24);
                },
                onComplete: function () {
                    //text.style.display = 'inline';
                },
            }).to(stage.cameraManager.perspectiveCamera.position, {
                x: groundLength,
                y: groundLength * 2.5,
                z: 0,
                duration: 10,
                ease: 'inline',
                //sstagger: 0.1,
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onStart: function () {
                    text = modules + ' Solar Panels with system size of ' + dcSize + ' kW';
                    spritey = makeTextSprite(text, { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey);
                    // text.style.display = 'inline';
                },
                onComplete: function () {
                    //text.style.display = 'inline';
                },
            }).to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: initialPos.y,
                z: -groundLength * 1.5,
                duration: 10,
                ease: 'inline',
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
            })
                
            let temp = 0;
            let index = 0;
            let sunTime = [
                getLocalTime(lat, long, 0, 0, 21, 3),
                getLocalTime(lat, long, 0, 0, 21, 6),
                getLocalTime(lat, long, 0, 0, 21, 9),
                getLocalTime(lat, long, 0, 0, 21, 12),
            ];
            // sunTime = [1647849600000, 1655798400000,1663747200000,1671609600000];
            let sunMonth = ['21 March', '21 June', '21 September', '21 December'];

            await timeLine.to(stage.cameraManager.perspectiveCamera.position, {
                x: -groundLength * 1.5,
                y: initialPos.y,
                z: 0,
                duration: 5,
                ease: 'inline',
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onStart: function () {
                    text = 'Sun Path Simulation of ' + new Date().getFullYear();
                    spritey = makeTextSprite(text, { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey);
                    //text.style.display = 'inline';
                },
                onComplete: function () {
                    gsap.ticker.add(changeDay);
                    stage.tweenControls.TweenActions.startDay();
                }
            });

            //executes on every tick after the core engine updates
            function changeDay(time, deltaTime, frame) {
                time = parseInt(time);
                if (temp !== time && time % 5 === 0) {
                    if (index < 4) {
                        if (index !== 0) {
                            stage.tweenControls.TweenActions.endDay();
                        }
                        text = 'Shadows of ' + sunMonth[index];
                        spritey = makeTextSprite(text, { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey);
                        temp = time;
                        stage.tweenControls.TweenActions.time = sunTime[index];
                        stage.tweenControls.TweenActions.startDay();
                        index = index + 1;
                    }
                }
            }
            await timeLine.to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: groundLength * 1.6,
                z: groundLength * 2.3,
                duration: 19.5,
                ease: 'power1.out',
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onComplete: function () {
                    gsap.ticker.remove(changeDay);
                    stage.tweenControls.TweenActions.endDay();
                }
            }, '>-0.2').to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: 1,
                z: groundLength * 3,
                duration: 6,
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onComplete: function () {
                    stage.tweenControls.TweenActions.toggleShadows();
                    showHMSLA(stage);
                },
            }, '>-0.2').to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: 1,
                z: groundLength * 2,
                duration: 10,
                onStart: function () {
                    text = 'Solar Access & Heatmap';
                    spritey = makeTextSprite(text, { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey);
                    //text.style.display = 'inline';
                },
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0));
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
            }, '>-0.2');
            await timeLine.to(stage.cameraManager.perspectiveCamera.position, {
                x: 0,
                y: groundLength * 3,
                z: groundLength * 2,
                duration: 5,
                onUpdate: function () {
                    stage.controlsManager._3dControls.update();
                    stage.cameraManager.perspectiveCamera.lookAt(0, 0, 0);
                    let cameaPos = stage.cameraManager.perspectiveCamera.position.clone();
                    let pos = getPointWithDeltaToAPoint(cameaPos, new THREE.Vector3(0, 0, 0),15,true,7);
                    spritey.position.set(pos.x, pos.y, pos.z);
                },
                onStart: function () {  
                    orgName = orgName || '';
                    //stage.eventManager.solarAccessVisibility(false);
                    text = 'A design by \n ' + orgName+' \n www.thesolarlabs.com';
                    spritey = makeTextSprite(text, { fontsize: 30, textColor: { r: 255, g: 255, b: 255, a: 1.0 } }, stage, spritey);
                },
            }, '>-0.2');

            let selectedObject = stage.sceneManager.scene.getObjectById(spritey.id);
            stage.sceneManager.scene.remove(selectedObject);
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }

        //media_recorder.stop();
        //remove canvas
        const copyCanvas = document.getElementById("copyCanvas");
        copyCanvas.remove();
        // console.log('videochunks: ', videochunks);
        // // setTimeout(() => {
            // const blob = new Blob(videochunks, { type: "video/webm" });
            // console.log('blob: ', blob);
            // const recording_url = URL.createObjectURL(blob);
        // console.log('recording_url: ', recording_url);
        // // Attach the object URL to an <a> element, setting the download file name
        // const a = document.createElement('a');
        // a.style = "display: none;";
        // a.href = recording_url;
        // a.download = "Design_Demo_" + stage.getReferenceId() + ".mp4";
        // document.body.appendChild(a);
        // a.click();
        // Trigger the file download
        // setTimeout(() => {a.click();}, 1000);
        // setTimeout(() => {
        //     // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
        //     URL.revokeObjectURL(recording_url);
        // }, 1200);
        // let azureURL = await uploadFileToBlob(blob, stage.getReferenceId());
        // return azureURL;
        media_recorder.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
        hideHMSLA(stage);
        stage.switchTo2d();
        //await new Promise(resolve => setTimeout(resolve, 1000));
        // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
        return true;
    }
    catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
}

export async function createPDF(stage) {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const designData = extractDesignData(stage);
        const pdfTemplate = new CreatePDFTemplate(designData);
        const projectDetails = getProjectDetails();
        const pdfOptions = {
            compress: false,
            info: {
                Producer: 'The Solar Labs',
                Author: 'Design Studio',
            },
        };

        // eslint-disable-next-line no-undef
        const doc = new PDFDocument(pdfOptions);
        const stream = doc.pipe(blobStream());

        const leftMargin = 0.25;
        const topMargin = 0.25;

        // PDF document PPI is 72.
        makerjs.exporter.toPDF(doc, pdfTemplate, { origin: [leftMargin * 72, topMargin * 72] });
        generateHeader(doc);
        createProjectHeading(doc, projectDetails.projectName, projectDetails.designDetails);
        doc.end();

        let blobData;
        const designName = stage.eventManager.getProjectDesignName();
        const timeStamp = getTimeStamp();

        await stream.on('finish', () => {
            // get a blob you can do whatever you like with
            blobData = stream.toBlob('application/pdf');
            saveAs(blobData, `${designName}_${timeStamp}.pdf`);
        });
        return Promise.resolve(true);
    }
    catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
}
