/* eslint-disable no-undef */
/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-use-before-define */
function pathsDFS(models, scenegroup) {
    if (models.hasOwnProperty('paths')) {
        if (Object.entries(models.paths).length) {
            try {
                addPaths(models.paths, scenegroup);
            }
            catch (error) {
                console.log(models.paths);
                console.error(error);
            }
        }
    }
    for (const i in models) {
        const model = models[i];
        if (model) {
            if (model.hasOwnProperty('paths')) {
                if (Object.entries(model.paths).length) {
                    try {
                        addPaths(model.paths, scenegroup);
                    }
                    catch (error) {
                        console.log(model.paths);
                        console.error(error);
                    }
                }
            }
            if (model.hasOwnProperty('models')) {
                const newpaths = pathsDFS(model.models, scenegroup);
                if (newpaths !== undefined && Object.entries(newpaths).length !== 0) {
                    try {
                        addPaths(newpaths, scenegroup);
                    }
                    catch (error) {
                        console.log(newpaths);
                        console.error(error);
                    }
                }
            }
        }
    }
}

function addPaths(paths, scenegroup) {
    for (const i in paths) {
        try {
            const path = paths[i];
            let mesh;
            if (path.type = 'line') {
                mesh = getThreeLine(path);
            }
            else if (path.type = 'arc') {
                mesh = getThreeArc(path);
            }
            else if (path.type = 'circle') {
                mesh = getThreeCircle(path);
            }
            scenegroup.add(mesh);
        }
        catch (error) {
            console.log(path);
            console.error(error);
        }
    }
}

function getThreeArc({
    origin,
    radius,
    startAngle,
    endAngle,
}, n_points = 20) {
    const arc = new THREE.EllipseCurve(
        ...origin,
        radius, radius,
        startAngle,
        endAngle,
        true, // have to verify, also some left params (bezierData.startT,bezierData.endT)
    );
    const points = arc.getPoints(n_points);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const mesh = new THREE.Line(geometry, material);
    console.log('made arc');
    return mesh;
}

function getThreeCircle({ radius, origin }, segments = 20) {
    const circle = new THREE.RingGeometry(radius - 0.1, radius + 0.1, segments);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    circle.translate(...origin, 0);
    const mesh = new THREE.Mesh(geometry, material);
    console.log('made circle');
    return mesh;
}

function getThreeLine({ origin, end }) {
    const points = [
        new THREE.Vector2(...origin),
        new THREE.Vector2(...end),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);
    console.log('made line');
    return line;
}
