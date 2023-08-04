async function cylinderTest(page) {
  await page.waitFor(3000);
  // Click Model button
  await page.waitForSelector('.sideBarTopPart > div > #model > span > .el-button');
  await page.click('.sideBarTopPart > div > #model > span > .el-button');

  await page.waitFor(3000);
  await page.waitFor('#cylinder_button', { visible: true })

  await page.evaluate(() => {
    document.querySelector('#cylinder_button').click();
  });

  await page.mouse.click(570, 360);

  await page.mouse.move(573, 365)

  await page.mouse.move(577, 372)

  await page.mouse.move(579, 373)

  await page.mouse.move(581, 377)

  await page.mouse.move(582, 379)

  await page.mouse.move(584, 382)

  await page.mouse.move(586, 384)

  await page.mouse.move(588, 387)

  await page.mouse.move(589, 388)

  await page.mouse.move(592, 391)

  await page.mouse.move(593, 392)

  await page.mouse.move(594, 393)

  await page.mouse.move(595, 394)

  await page.mouse.move(596, 394)

  await page.mouse.move(596, 394)

  await page.mouse.move(596, 394)

  await page.mouse.click(596, 394)

  await page.waitFor(1500)

  // Save button

  await page.waitForSelector('.midPart > .el-row > .el-col > #save_button > #save_button')
  await page.click('.midPart > .el-row > .el-col > #save_button > #save_button')
}

module.exports = cylinderTest;
