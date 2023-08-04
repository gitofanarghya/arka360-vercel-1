import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

export default function mergeAll(objectsGroup) {
    const newGroup = new THREE.Group();
    // Grouping meshes according to their structure type so
    // that each have their distinguished material
    const grouped = {};
    for (let i = 0, len = objectsGroup.children.length; i < len; i += 1) {
        if (objectsGroup.children[i].userData[1] !== 'blockUtil') {
            if (grouped[`${objectsGroup.children[i].userData[0]}-${objectsGroup.children[i].userData[1]}`]) {
                grouped[`${objectsGroup.children[i].userData[0]}-${objectsGroup.children[i].userData[1]}`].push(objectsGroup.children[i]);
            }
            else {
                grouped[`${objectsGroup.children[i].userData[0]}-${objectsGroup.children[i].userData[1]}`] = [objectsGroup.children[i]];
            }
        }
        else {
            newGroup.add(objectsGroup.children[i].clone());
        }
    }

    Object.values(grouped).forEach((meshes) => {
        addMergedMesh(meshes, newGroup);
    });
    return newGroup;
}
function addMergedMesh(mesh, newGroup) {
    const singleMaterial = mesh[0].material;
    const allGeometries = [];

    for (let i = 0; i < mesh.length; i += 1) {
        mesh[i].updateMatrix();
        const temp = mesh[i].geometry.clone();
        temp.applyMatrix4(mesh[i].matrix);
        allGeometries.push(temp);
    }

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);
    const mergedMesh = new THREE.Mesh(mergedGeometry, singleMaterial);

    const mergedLineGeometry = new THREE.EdgesGeometry(mergedGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(mergedLineGeometry, lineMaterial);
    // let bufferGeometry = new THREE.BufferGeometry().fromGeometry(singleGeometry);

    newGroup.add(mergedMesh);
    newGroup.add(wireframe);
}
