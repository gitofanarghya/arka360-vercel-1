// If two meshes are using same materials,
// then we cannot have different colors for those two meshes.
export function updateMeshWithColor(newColor, mesh) {
    if (newColor !== undefined && mesh !== undefined &&
        mesh !== null && mesh.material.color.getHex() !== newColor) {
        mesh.material.color.setHex(newColor);
    }
}

export function setMeshVisible(mesh) {
    if (mesh !== null && mesh !== undefined) {
        mesh.visible = true;
    }
}

export function setMeshInvisible(mesh) {
    if (mesh !== null && mesh !== undefined) {
        mesh.visible = false;
    }
}
