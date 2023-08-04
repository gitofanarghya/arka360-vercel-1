import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import createBufferGeometry from '../../utils/meshUtils';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

const FONTS = {};
const fontLoader = new FontLoader();
let fontsLoaded = false;
export async function getFont (){
    let promList = []
    if(!fontsLoaded){
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Regular.json').then((font) => { FONTS.arialRegular = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Bold.json').then((font) => { FONTS.arialBold = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Italic.json').then((font) => { FONTS.arialItalics = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Bold_Italic.json').then((font) => { FONTS.arialBoldItalics = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-Normal.json').then((font) => { FONTS.helveticaRegular = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica_Bold.json').then((font) => { FONTS.helveticaBold = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-BoldItalic.json').then((font) => { FONTS.helveticaItalics = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-BoldItalic.json').then((font) => { FONTS.helveticaBoldItalics = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/gentilis_regular.json').then((font) => { FONTS.gentilisRegular = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/gentilis_bold.json').then((font) => { FONTS.gentilisBold = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Gentilis_Bold_Italic.json').then((font) => { FONTS.gentilisItalics = font; }));
        promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Gentilis_Bold_Italic.json').then((font) => { FONTS.gentilisBoldItalics = font; }));
        
        await Promise.all(promList)
    }
    fontsLoaded = true;
}
export async function loadFonts(reqFonts){
    let promList = []
    if(reqFonts.Arial.isPresent){
        if(reqFonts.Arial.boldItalic){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Bold_Italic.json').then((font) => { FONTS.arialBoldItalics = font; }));
        }
        if(reqFonts.Arial.bold){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Bold.json').then((font) => { FONTS.arialBold = font; }));
        }
        if(reqFonts.Arial.italics){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Italic.json').then((font) => { FONTS.arialItalics = font; }));
        }
        else {
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Arial_Regular.json').then((font) => { FONTS.arialRegular = font; }));
        }
    }
    if(reqFonts.Helvetica.isPresent){
        if(reqFonts.Helvetica.boldItalic){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-BoldItalic.json').then((font) => { FONTS.helveticaBoldItalics = font; }));
        }
        if(reqFonts.Helvetica.bold){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica_Bold.json').then((font) => { FONTS.helveticaBold = font; }));
        }
        if(reqFonts.Helvetica.italics){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-BoldItalic.json').then((font) => { FONTS.helveticaItalics = font; }));
        }
        else {
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Helvetica-Normal.json').then((font) => { FONTS.helveticaRegular = font; }));
        }
    }
    if(reqFonts.Gentilis.isPresent){
        if(reqFonts.Gentilis.boldItalic){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Gentilis_Bold_Italic.json').then((font) => { FONTS.gentilisBoldItalics = font; }));
        }
        if(reqFonts.Gentilis.bold){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/gentilis_bold.json').then((font) => { FONTS.gentilisBold = font; }));
        }
        if(reqFonts.Gentilis.italics){
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/Gentilis_Bold_Italic.json').then((font) => { FONTS.gentilisItalics = font; }));
        }
        else {
            promList.push(fontLoader.loadAsync('https://fontfe.blob.core.windows.net/fonts/gentilis_regular.json').then((font) => { FONTS.gentilisRegular = font; }));
        }
    }
    await Promise.all(promList)
}
const currentFont = {
    name: null,
    file: null,
};

let update = {
    wrapLine: false,
    isUpdate: false,
};

let widths = {
    lineWidth: 1,
    prevWidth: null,
};

function getFontName(textBox) {
    let fontType;

    if (textBox.fontBold && !textBox.fontItalics) {
        fontType = 'Bold';
    }
    else if (textBox.fontItalics && !textBox.fontBold) {
        fontType = 'Italics';
    }
    else if (!textBox.fontItalics && !textBox.fontBold) {
        fontType = 'Regular';
    }
    else if (textBox.fontItalics && textBox.fontBold) {
        fontType = 'BoldItalics';
    }

    return `${textBox.font.toLowerCase()}${fontType}`;
}

async function loadFont(selectedFont) {
    // create a name based mapping to load fonts.
    // or may be load all fonts asynchronously and load them as required.
    // const selectedFont = getFontName(textBox);
    // const file = new THREE.fontLoader().parse(FONTS[selectedFont]);
    const file = FONTS[selectedFont];
    currentFont.file = file;
}

export function calculateHorizontalWrappingLimit(char, textBox) {
    // if (update) {
    //     textBox.isUpdate = true;
    //     textBox.textForUpdate = '';
    //     textBox.prevLineText = '';
    //     textBox.currLineText = '';
    //     textBox.wrapLine = false;
    //     textBox.wordArray = [];
    // }
    // console.log(char,textBox)
    // console.log("text for update",textBox.textForUpdate)
    // console.log("text for update",textBox.wrapLine, textBox.isUpdate,textBox.wordArray)
    

    const textBoxWidth = textBox.getTextBoxWidth();
    // const textBoxXpos = textBox.outlinePoints[0].getPosition().x;
    // let prevText = textBox.currLineText;
    // textBox.currLineText += char;
    textBox.textForUpdate += char;
    const selectedFont = getFontName(textBox);
    if (currentFont.name === null
        || currentFont.name !== selectedFont) {
        currentFont.name = selectedFont;
        loadFont(selectedFont);
    }

    const shapes = currentFont.file.generateShapes(char, textBox.fontSize);
    const charGeometry = new THREE.ShapeGeometry(shapes);
    charGeometry.computeBoundingBox();
    const charBBox = charGeometry.boundingBox;
    const charSize = new THREE.Vector3();
    charBBox.getSize(charSize);
    let lineShapes = null;
    if (textBox.isUpdate) { // update.isUpdate
        lineShapes = currentFont.file.generateShapes(textBox.textForUpdate, textBox.fontSize);
        // widths.lineWidth = 1;
        // widths.prevWidth = null;
    }
    else {
        lineShapes = currentFont.file.generateShapes(textBox.text, textBox.fontSize);
    }

    const lineCharGeometry = new THREE.ShapeGeometry(lineShapes);
    lineCharGeometry.computeBoundingBox();
    const lineCharBBox = lineCharGeometry.boundingBox;
    const lineCharSize = new THREE.Vector3();
    lineCharBBox.getSize(lineCharSize);

    textBox.wrappingLimit = Math.max(textBox.wrappingLimit, charSize.x);
    textBox.lineWidth = (lineCharBBox.max.x - textBox.prevWidth) + textBox.lineWidth;
    textBox.prevWidth = lineCharBBox.max.x;
    if (textBox.lineWidth >= textBoxWidth) {
        textBox.wrapLine = true;
        // update.wrapLine = true;
        textBox.lineWidth = charSize.x ? 1 + charBBox.max.x : 1;
        textBox.prevLineText = textBox.currLineText;
        textBox.currLineText = char.trimLeft();
    }
    else {
        textBox.currLineText += char;
    }
    // console.log(textBox.wrappingLimit)
    // textBox.wrappingLimit = (textBox.wrappingLimit + charSize.x) / 2;
}

// function textWrapper(text, length, spill) {
//     const wrapArray = [];
//     const wordArray = text.trim().split(' ');
//     const idealLength = (length && length.constructor === Number && length > 0) ?
//         length : parseInt(text.length / 5, 10);
//     const spillLength = (idealLength + spill);

//     const wordLoop = (value, i) => {
//         /* returns an array of trimmed lines */
//         let tmp = null;
//         let diff = null;
//         let currentWord = value || wordArray[i] || '';
//         const nextWord = (wordArray[i + 1]) || '';
//         const nextWordLen = nextWord.length || 0;
//         const newLength = (currentWord.length + nextWordLen);
//         const overflow = (newLength >= idealLength) && (newLength >= spillLength);
//         const maxWordLength = Math.max(idealLength, spillLength);
//         const eof = !wordArray[i + 1];
//         const getNextWord = (!eof && !overflow);
//         const candidate = `${currentWord} ${nextWord}`;

//         if (getNextWord) {
//             return wordLoop(candidate, i + 1);
//         }

//         if (nextWordLen >= maxWordLength) {
//             tmp = (candidate).slice(0, maxWordLength);
//             diff = (candidate).length - tmp.length;
//             wordArray[i + 1] = nextWord.slice(-diff);
//             currentWord = tmp;
//         }

//         if (currentWord.length > maxWordLength) {
//             tmp = currentWord.slice(0, maxWordLength);
//             diff = currentWord.length - tmp.length;
//             wrapArray.push(tmp);
//             currentWord = currentWord.slice(-diff);
//             return wordLoop(currentWord, i);
//         }
//         if (currentWord) { // Here is where you can do something with each row of text
//             wrapArray.push(currentWord.trim());
//             return wordLoop('', i + 1);
//         }
//         return wrapArray;
//     };

//     return wordLoop(wordArray[0], 0);
// }

// textWrapper function is responsible for wrapping the text line in such a way that it fits to the given width,
// if an incoming letter exceeds the width of box, then the text till that line is pushed in to wordarray.
function textWrapper(textBox) {
    if (textBox.wrapLine) { // this boolean value becomes true if it is exceeding the width of box
        textBox.wordArray[textBox.wordArray.length - 1] = textBox.prevLineText;
        textBox.wordArray.push(textBox.currLineText);
        textBox.wrapLine = false; // update.wrapLine = false;
    }
    if (textBox.wordArray.length === 0) {
        textBox.wordArray[textBox.wordArray.length] = textBox.currLineText;
    }
    else {
        textBox.wordArray[textBox.wordArray.length - 1] = textBox.currLineText;
    }
}

function generateTextGeometry(textBox, alignPosition) {
    // For text Alignment
    // Left : Set starting x Position of textBox outlinePoint[0] (top Left Corner)
    // Center : Set starting x Position of textBox midpoint
    // Right : Set starting x Position of textBox outlinePoint[1] (bottom right Corner)
    const selectedFont = getFontName(textBox);
    if (currentFont.name === null
        || currentFont.name !== selectedFont) {
        currentFont.name = selectedFont;
        loadFont(selectedFont);
    }
    
    // const wrapLimit = Math.ceil(textBox.getTextBoxWidth() / textBox.wrappingLimit);
    // let wordWrapArray = textWrapper(textBox.text, wrapLimit, 2);
    textWrapper(textBox);
    const wordWrapArray = textBox.wordArray;
    let textGeometry = createBufferGeometry();
    const lines = [];
    // wordWrapArray = textBox.wordWrapArray;
    for (let i = 0, len = wordWrapArray.length; i < len; i += 1) {
        const line = wordWrapArray[i];
        const shapes = currentFont.file.generateShapes(line, textBox.fontSize);
        const lineGeometry = new THREE.ShapeGeometry(shapes);
        lineGeometry.center();

        lineGeometry.translate(
            alignPosition.x,
            alignPosition.y - (i * (textBox.fontSize + textBox.lineSpacing)),
            alignPosition.z,
        );

        lineGeometry.computeBoundingBox();
        const lineBBox = lineGeometry.boundingBox;
        lineGeometry.translate(
            alignPosition.x - lineBBox.min.x,
            0,
            0,
        );
        lines.push(lineGeometry);
    }
    textGeometry = BufferGeometryUtils.mergeGeometries(lines);

    return textGeometry;
}

export async function updateText(textBox, { updateTextBox, adjust } = { updateTextBox: false, adjust: false }) {
    if (updateTextBox) {
        // this condition runs whenever text data is updated 
        textBox.isUpdate = true;
        textBox.textForUpdate = '';
        textBox.prevLineText = '';
        textBox.currLineText = '';
        textBox.wrapLine = false;
        textBox.wordArray = [];
        // widths.lineWidth = 1;
        textBox.lineWidth = 1;
        // update.wrapLine = false;
        // update.isUpdate = true;
        // widths.prevWidth = null;
        textBox.prevWidth = null;
        if(textBox.text){
            //for each letter in stored text it sets the new updated properties and updates the texts accordingly.
            for (let i = 0, len = textBox.text.length; i < len; i += 1) {
                // console.log(textBox)
                calculateHorizontalWrappingLimit(textBox.text[i], textBox);
                textWrapper(textBox);
                // textBox.wrapLine = false;
            }
        }
    }

    // left aligned by default
    const xPosition = textBox.outlinePoints[0].getPosition().x + textBox.textPadding;
    const yPosition = textBox.outlinePoints[0].getPosition().y - textBox.textPadding - textBox.fontSize;
    const zPosition = textBox.getPosition().z;
    const alignPosition = new THREE.Vector3(
        xPosition,
        yPosition,
        zPosition,
    );

    // center aligned
    // const xPosition = textBox.getPosition().x;
    // const yPosition = textBox.outlinePoints[0].getPosition().y - textBox.textPadding - textBox.fontSize;
    // const zPosition = textBox.getPosition().z;
    // const alignPosition = new THREE.Vector3(
    //     xPosition,
    //     yPosition,
    //     zPosition,
    // );
 
    const textGeometry = generateTextGeometry(textBox, alignPosition);
    textGeometry.computeBoundingBox();
    const textBBox = textGeometry.boundingBox;
    const textBBoxSize = new THREE.Vector3();
    textBBox.getSize(textBBoxSize);
    // vertical textBox adjustments
    // const currentHeight = Math.floor(textBox.getTextBoxHeight());
    // const textHeight = Math.ceil(textBBoxSize.y);

    // if (textHeight > currentHeight) {
    //     const dY = textHeight - currentHeight;
    //     await textBox.resizeTextBox(0, dY, 0);
    // }

    const currentHeight = textBox.outlinePoints[1].getPosition().y;
    const textHeight = textBBox.min.y;
    const textWidth = textBBox.max.x
    const currentWidth = textBox.outlinePoints[1].getPosition().x;
    if (textBox.startY) {
        // setting startYPosition value with start bottom y position of box.
        textBox.startYPosition = currentHeight;
        textBox.startY = false;
    }

    if (textWidth > currentWidth) {
        const dx = textWidth - currentWidth;
        await textBox.resizeTextBox(dx, 0, 0);
    }
    if (textHeight < currentHeight) {
        const dY = currentHeight - textHeight;
        await textBox.resizeTextBox(0, dY, 0);
    }
    // else if (updateTextBox && textBox.text) {
    //     // this condition checks if there is any update in the textbox then it sets the textbox height to default size where user has drawn at the start.
    //     const dy = currentHeight - textBox.startYPosition;
    //     await textBox.resizeTextBox(0, dy, 0);
    // }
    // if (adjust) {
    //     const dy = currentHeight - textHeight;
    //     await textBox.resizeTextBox(0, dy, 0);
    // }

    textBox.textMesh.geometry = textGeometry;
}
