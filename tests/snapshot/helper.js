const fs = require('fs');
const compareImages = require("resemblejs/compareImages");

// Get stage data from ground truth
function getSceneData(testName) {
  let pathToGTScene = `ground-truth/tests/${testName}/stage-data.txt`;
  return new Promise((resolve, reject) => {
    fs.readFile(pathToGTScene, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

// Get stage data from recent tests
function getTestData(testName) {
  let pathToScene = `tests/snapshot/tests/${testName}/stage-data.txt`;
  return new Promise((resolve, reject) => {
    fs.readFile(pathToScene, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

// Compare scene data
function compareSceneData(testName) {
  let promise1 = getSceneData(testName);
  let promise2 = getTestData(testName);

  return new Promise((resolve) => {
    Promise.all([promise1, promise2]).then((results) => {
      let d1 = results[0];
      let d2 = results[1];
      if (d1 === d2) {
        resolve(true);
        return true;
      }
      else {
        resolve(false);
        return false;
      }
    });
  })
}

function compareScreenshots(testName) {
  return new Promise(async (resolve) => {
    const options = {
      output: {
        errorColor: {
          red: 255,
          green: 0,
          blue: 255
        },
        ignoredBox: {
          left: 0,
          top: 0,
          right: 3000,
          bottom: 1000
        },
        errorType: "movement",
        transparency: 0.4,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true
      },
      scaleToSameSize: true,
      ignore: "antialiasing"
    };
    const data = await compareImages(`ground-truth/tests/polygonTest/model.png`, `tests/snapshot/tests/polygonTest/model.png`, options);
    resolve(data);
  })
}

module.exports = { compareSceneData, compareScreenshots };
