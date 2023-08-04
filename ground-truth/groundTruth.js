// Script to generate ground truth
const pupeeteer = require('puppeteer');
const fs = require('fs');
const tests = [];
const credentials = {
  email: null,
  password: null
};


// Dynamically import all the tests
function getDirectories() {
  return new Promise((resolve, reject) => {
    fs.readdir('ground-truth/tests/', function (err, items) {
      if (err) {
        reject();
        console.log(`Error: ${err}`)
      }
      items.map(async item => {
        try {
          let stats = await fs.statSync(`ground-truth/tests/${item}`);
          if (stats.isDirectory()) {
            tests.push({ importedFunction: require(`./tests/${item}/index`), name: item })
          }
        } catch (e) {
          console.log(e)
        }
      });
      resolve();
    })
  });
}

(async () => {
  // Open chromium without headless mode (for testing only)
  try {
    if(credentials.email === null || credentials.password === null) {
      console.log('\x1b[31m', 'ERROR: Enter crendentials for login in groundTruth.js');
      return;
    }
    console.log('\x1b[33m%s\x1b[0m', 'WARNING: The script will throw an error if the App is not running on localhost:8080 or Production mode is turned on');
    console.log('\x1b[34m%s\x1b[0m', 'INFO: You can run the App using yarn run serve');
    console.log('\x1b[34m%s\x1b[0m', 'INFO: You can disable the production mode by visiting src/core/coreConstants.js');

    let pro = getDirectories();
    const proo = pro.then(async () => {
      const browser = await pupeeteer.launch({ headless: false });

      // Create new page
      const page = await browser.newPage();

      // Set viewport width and height 
      await page.setViewport({ width: 1440, height: 821 })

      // Navigate to http://app.thesolarlabs.com/login
      await page.goto('http://localhost:8080/login');

      // Type login email
      await page.waitForSelector('.el-form:nth-child(1) > .el-form-item > .el-form-item__content > .el-input > .el-input__inner');
      await page.type('.el-form:nth-child(1) > .el-form-item > .el-form-item__content > .el-input > .el-input__inner', `${credentials.email}`);

      // Type login password
      await page.waitForSelector('.el-col > .el-form-item > .el-form-item__content > .el-input > .el-input__inner');
      await page.type('.el-col > .el-form-item > .el-form-item__content > .el-input > .el-input__inner', `${credentials.password}`);

      // Submit form
      await page.waitForSelector('.el-form:nth-child(1) > .el-form-item > .el-form-item__content > .el-button > span');
      await page.click('.el-form:nth-child(1) > .el-form-item > .el-form-item__content > .el-button > span');

      await page.waitFor(3000);
      await page.goto('http://localhost:8080/projectSummary/25')

      await (async function runScripts() {
        try {
          // Iterate through tests
          for (let i = 0; i < tests.length; i++) {
            // Create new design
            await page.waitForSelector('.el-row > #projectDesigns > .projectSummaryHeadings > .allPagesIcons > .el-button')
            await page.click('.el-row > #projectDesigns > .projectSummaryHeadings > .allPagesIcons > .el-button')

            await page.waitForSelector('.el-dialog__body > div > div > .el-input > .el-input__inner');
            await page.type('.el-dialog__body > div > div > .el-input > .el-input__inner', 'Puppet Design ' + (i + 1));

            await page.waitForSelector('.el-dialog > .el-dialog__footer > .dialog-footer > #projectDesignsConfirmButton > span')
            await page.click('.el-dialog > .el-dialog__footer > .dialog-footer > #projectDesignsConfirmButton > span')

            await page.waitFor(3000)

            // Make the Edit Icon visible and go to studio page by firing click event
            await page.waitFor('.left_part > div > .header_text > .el-tooltip > .el-button', { visible: true })

            await page.evaluate(() => {
              document.querySelector('.left_part > div > .header_text > .el-tooltip > .el-button').click();
            });

            // Execute test script
            await tests[i].importedFunction(page);

            await setTimeout(async () => {
              await page.screenshot({ path: `ground-truth/tests/${tests[i].name}/model.png` });
            }, 500);

            await page.waitFor(1500)

            // Get Stage data
            const stageData = await page.evaluate(() => {
              let data = {}
              data = window.windowStage.saveStage();
              return JSON.stringify(data);
            });

            // Save stage data in test directory
            await fs.writeFile(`ground-truth/tests/${tests[i].name}/stage-data.txt`, stageData, { flag: 'w+' }, function (err) {
              if (err) {
                return console.log(err);
              }
              console.log("Stage data saved");
            });

            await page.waitFor(2000)
            // Go back to project page          
            await page.goBack(0)
            await page.goBack(0)
            await page.waitFor(3000)
          }
        } catch (e) {
          console.log('An error occured while executing the scripts. Error message: ', e.message)
        }
      })()

      // Handle Rejections!
      process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.close();
      });

      // Close the browser
      setTimeout(() => {
        browser.close();
      }, 4000)
    });
  } catch (e) {
    console.log('Ground truth generation failed!', e.message)
  }
})();

