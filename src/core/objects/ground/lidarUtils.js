export function lerp(a, b, alpha) {
    return a + (b - a) * alpha;
}

export function normalize(v, vMin, vMax) {
    return ((v - vMin) / (vMax - vMin));
}

export function fitToLidar(model) {
    model.stage.stateManager.startContainer();
    model.onClickFitToLidar();
    model.stage.stateManager.stopContainer();
}

export function toFixedNoRounding(x, n) {
    const reg = new RegExp(`^-?\\d+(?:\\.\\d{0,${n}})?`, 'g');
    const a = x.toString().match(reg)[0];
    const dot = a.indexOf('.');
    if (dot === -1) { // integer, insert decimal dot and pad up zeros
        return `${a}.${'0'.repeat(n)}`;
    }
    const b = (n - (a.length - dot)) + 1;
    return b > 0 ? (a + '0'.repeat(b)) : a;
}

export const mode = a =>
    Object.values(a.reduce((count, e) => {
        if (!(e in count)) {
            count[e] = [0, e];
        }

        count[e][0]++;
        return count;
    }, {})).reduce((a, v) => (v[0] < a[0] ? a : v), [0, null])[1];

export function median(arr) {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}
export function getGroundHieght(groundArray, heightWieght) {
    const ordered = Object.keys(groundArray).sort().reduce(
        (obj, key) => {
            obj[key] = groundArray[key];
            return obj;
        },
        {},
    );
    const keys = Object.keys(ordered);
    let arr = [];
    for (let i = 0; i < keys.length; i++) {
        if (ordered[keys[i]].length * heightWieght > ordered[keys[i + 1]].length) {
            arr = ordered[keys[i]];
            break;
        }
    }

    if (arr.length < 1) {
        arr = ordered[keys[0]];
    }

    const array = [];
    for (let i = 0; i < arr.length; i++) {
        array.push(arr[i].z);
    }

    return median(array);
}

export function groupByKey(array, key, stepSize) {
    return array
        .reduce((hash, obj) => {
            if (obj[key] === undefined) return hash;
            // console.log(hash, key)
            if (Object.keys(hash).length > 0) {
                const closest = Object.keys(hash).reduce((prev, curr) =>
                    (Math.abs(curr - obj[key]) < Math.abs(prev - obj[key]) ? curr : prev));
                const last = hash[closest];
                if (last !== undefined) {
                    if (Math.abs(obj[key] - last[0].z) < stepSize) {
                        return Object.assign(hash, { [last[0].z]: last.concat(obj) });
                    }
                }
            }
            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
        }, {});
}
