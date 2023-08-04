import { INVALID_SCALE } from '../coreConstants';
import { getImageDimensions } from './utils';

export function getCroppedImage(imageUrl, scale = 1) {
    const canvasElement = document.createElement('canvas');

    const canvasContext = canvasElement.getContext('2d');
    const image = new Image();

    return new Promise((resolve) => {
        image.addEventListener('load', () => {
            canvasElement.height = image.height * (1 / scale);
            canvasElement.width = image.width * (1 / scale);
            canvasContext.drawImage(
                image,
                (image.width * ((1 / scale) - 1)) / 2,
                (image.height * ((1 / scale) - 1)) / 2,
                image.width,
                image.height,
            );

            resolve(canvasElement.toDataURL());
        });

        image.setAttribute('crossOrigin', 'anonymous');
        image.src = imageUrl;
    });
}

export async function getAspectRatio(imageSource) {
    const image = new Image();
    return new Promise((r) => {
        image.addEventListener('load', () => {
            r(image.width / image.height);
        });
        image.src = imageSource;
    });
}

export function getCustomImageDimensions(stageImageDimensions, customImageDimensions) {
    const newDimensions = {};
    if (customImageDimensions.width > customImageDimensions.height) {
        newDimensions.width = stageImageDimensions.width;
        newDimensions.height = stageImageDimensions.width *
            (customImageDimensions.height / customImageDimensions.width);
    }
    else {
        newDimensions.height = stageImageDimensions.height;
        newDimensions.width = stageImageDimensions.height *
            (customImageDimensions.width / customImageDimensions.height);
    }
    return newDimensions;
}

export function scaleRatioToMeters(scaleRatio, groundSize) {
    return groundSize * scaleRatio;
}

export function scaleMetersToRatio(scaleMeters, aspectRatio, groundSize) {
    let scaleRatio;
    if (aspectRatio < 1) {
        scaleRatio = scaleMeters / (groundSize * aspectRatio);
    }
    scaleRatio = scaleMeters / groundSize;

    return parseFloat(scaleRatio.toFixed(3));
}

export function getNewScale(vertices, newValue, oldScale) {
    const newScale = oldScale * (newValue / (vertices[0].distanceTo(vertices[1])));
    return parseFloat(newScale.toFixed(3));
}

function isValidBase64(data) {
    return data.match(/^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g) !== null;
}

export async function imageURLToBase64(imageData) {
    if (isValidBase64(imageData)) {
        return imageData;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';

    await new Promise((r) => {
        image.addEventListener('load', () => {
            r();
        });
        image.src = imageData;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL();
}

export function getDefaultGroundSize(stage) {
    return getImageDimensions(stage.latitude, stage.longitude, stage.zoom, 512, 512);
}
