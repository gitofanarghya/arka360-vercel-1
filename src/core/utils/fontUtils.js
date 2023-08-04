import * as THREE from 'three';

const FontLoader = new THREE.FontLoader();
const FONTS = {};

FontLoader.load('https://res.cloudinary.com/f4t4lax3/raw/upload/v1601649146/fonts/Arial_Regular_hbo1cu.json', (font) => {
    FONTS.arialRegular = font;
});

export default FONTS;
