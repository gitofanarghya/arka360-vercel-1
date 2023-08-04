const { compareSceneData, compareScreenshots } = require("./helper");
const data = require("./temp.json");
const fs = require("fs");
const threshold = 0.3;
const tests = data.tests;

describe('Compare Scene data', () => {
  for (let i = 0; i < tests.length; i++) {
    test(`${tests[i]} should match ground truth`, async () => {
      expect.assertions(1);
      const data = await compareSceneData(tests[i]);
      return expect(data).toBe(true);
    });
  }
});

describe('Compare Screenshots', () => {
  for (let i = 0; i < tests.length; i++) {
    test(`${tests[i]} screenshot should match ground truth`, async () => {
      expect.assertions(1);
      const data = await compareScreenshots(tests[i]);
      const floatData = parseFloat(data.misMatchPercentage);
      return expect(floatData).toBeLessThanOrEqual(threshold);
    });
  }
});

function remove() {
  return new Promise((resolve, reject) => {
    fs.unlink('tests/snapshot/temp.json', (err) => {
      if (err) {
        reject(err);
        throw err;
      }
      else {
        resolve();
      }
    });
  });
}

afterAll(async () => {
  return await remove();
});
