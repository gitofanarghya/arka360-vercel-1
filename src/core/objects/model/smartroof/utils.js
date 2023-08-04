export function getDist(a, b) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    const z = a.z - b.z;
    return Math.sqrt(x*x + y*y +  z*z);
}
// Some funtions depend on this, resolve them before deleting this file.
