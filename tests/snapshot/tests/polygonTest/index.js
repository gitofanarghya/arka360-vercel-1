async function polygonTest(page) {
  await page.waitFor(3000);
  // Click Model button
  await page.waitForSelector('.sideBarTopPart > div > #model > span > .el-button', { visible: true });
  await page.click('.sideBarTopPart > div > #model > span > .el-button');

  await page.waitFor(1000);
  await page.waitForSelector('#polygon_button', { visible: true })

  await page.evaluate(() => {
    document.querySelector('#polygon_button').click();
  });
  // Point 1
  await page.mouse.click(515, 361);
  await page.mouse.move(516, 359)

  await page.mouse.move(518, 357)

  await page.mouse.move(520, 355)

  await page.mouse.move(521, 354)

  await page.mouse.move(523, 352)

  await page.mouse.move(525, 350)

  await page.mouse.move(527, 348)

  await page.mouse.move(528, 347)

  await page.mouse.move(533, 343)

  await page.mouse.move(537, 339)

  await page.mouse.move(538, 338)

  await page.mouse.move(542, 334)

  await page.mouse.move(544, 333)

  await page.mouse.move(546, 330)

  await page.mouse.move(547, 330)

  await page.mouse.move(548, 329)

  await page.mouse.move(549, 328)

  await page.mouse.move(550, 327)

  await page.mouse.move(551, 327)

  await page.mouse.move(552, 326)

  await page.mouse.move(553, 325)

  await page.mouse.move(553, 324)

  await page.mouse.move(554, 324)

  await page.mouse.move(555, 323)

  await page.mouse.move(556, 322)

  await page.mouse.move(556, 322)

  await page.mouse.move(557, 320)

  await page.mouse.move(558, 320)

  await page.mouse.move(560, 318)

  await page.mouse.move(561, 318)

  await page.mouse.move(561, 317)

  await page.mouse.move(562, 316)

  await page.mouse.move(563, 315)

  await page.mouse.move(563, 315)

  await page.mouse.move(564, 314)

  await page.mouse.move(564, 314)

  await page.mouse.move(564, 314)

  await page.mouse.move(565, 312)

  await page.mouse.move(565, 311)

  await page.mouse.move(567, 310)

  await page.mouse.move(568, 309)

  await page.mouse.move(569, 308)

  await page.mouse.move(569, 308)

  await page.mouse.move(569, 307)

  await page.mouse.move(570, 307)

  await page.mouse.move(571, 306)

  await page.mouse.move(572, 306)

  await page.mouse.move(572, 305)

  await page.mouse.move(573, 305)

  // Point 2
  await page.mouse.click(573, 305);
  await page.mouse.move(573, 306)

  await page.mouse.move(574, 309)

  await page.mouse.move(579, 315)

  await page.mouse.move(584, 321)

  await page.mouse.move(589, 327)

  await page.mouse.move(594, 334)

  await page.mouse.move(599, 340)

  await page.mouse.move(606, 348)

  await page.mouse.move(609, 351)

  await page.mouse.move(613, 354)

  await page.mouse.move(616, 355)

  await page.mouse.move(618, 356)

  await page.mouse.move(619, 358)

  await page.mouse.move(620, 359)

  await page.mouse.move(621, 359)

  await page.mouse.move(622, 360)

  await page.mouse.move(623, 361)

  await page.mouse.move(624, 362)

  await page.mouse.move(624, 362)

  await page.mouse.move(624, 362)
  // point 3
  await page.mouse.click(624, 362)
  await page.mouse.move(621, 364)

  await page.mouse.move(612, 371)

  await page.mouse.move(605, 377)

  await page.mouse.move(603, 378)

  await page.mouse.move(599, 382)

  await page.mouse.move(596, 385)

  await page.mouse.move(596, 385)

  await page.mouse.move(593, 388)

  await page.mouse.move(590, 391)

  await page.mouse.move(589, 392)

  await page.mouse.move(588, 393)

  await page.mouse.move(587, 393)

  await page.mouse.move(585, 395)

  await page.mouse.move(584, 396)

  await page.mouse.move(582, 398)

  await page.mouse.move(580, 401)

  await page.mouse.move(578, 403)

  await page.mouse.move(577, 404)

  await page.mouse.move(577, 405)

  await page.mouse.move(576, 408)

  await page.mouse.move(575, 411)

  await page.mouse.move(575, 412)

  await page.mouse.move(575, 412)

  await page.mouse.move(575, 413)

  await page.mouse.move(574, 414)

  await page.mouse.move(574, 415)

  await page.mouse.move(573, 415)

  await page.mouse.move(572, 416)

  await page.mouse.move(572, 416)

  await page.mouse.move(571, 416)

  await page.mouse.move(570, 416)

  await page.mouse.move(569, 417)

  await page.mouse.move(569, 417)

  await page.mouse.move(569, 417)

  //point 4
  await page.mouse.click(569, 417)
  await page.mouse.move(566, 415)

  await page.mouse.move(560, 410)

  await page.mouse.move(552, 403)

  await page.mouse.move(549, 400)

  await page.mouse.move(542, 394)

  await page.mouse.move(537, 387)

  await page.mouse.move(533, 383)

  await page.mouse.move(531, 381)

  await page.mouse.move(530, 379)

  await page.mouse.move(529, 379)

  await page.mouse.move(529, 378)

  await page.mouse.move(528, 377)

  await page.mouse.move(527, 376)

  await page.mouse.move(527, 375)

  await page.mouse.move(527, 375)

  await page.mouse.move(526, 375)

  await page.mouse.move(526, 374)

  await page.mouse.move(525, 373)

  await page.mouse.move(524, 371)

  await page.mouse.move(523, 370)

  await page.mouse.move(523, 370)

  await page.mouse.move(522, 370)

  await page.mouse.move(522, 369)

  await page.mouse.move(521, 369)

  await page.mouse.move(521, 369)

  await page.mouse.move(520, 368)

  await page.mouse.move(520, 368)

  await page.mouse.move(519, 367)

  await page.mouse.move(519, 367)

  await page.mouse.move(519, 367)

  await page.mouse.move(519, 367)

  await page.mouse.move(519, 367)

  await page.mouse.move(519, 367)

  await page.mouse.move(518, 366)

  await page.mouse.move(518, 365)

  await page.mouse.move(517, 365)

  await page.mouse.move(517, 365)

  await page.mouse.move(517, 365)

  await page.mouse.move(517, 364)

  await page.mouse.move(517, 364)

  await page.mouse.move(516, 364)

  await page.mouse.move(516, 364)

  await page.mouse.move(516, 363)

  await page.mouse.move(516, 363)

  await page.mouse.move(516, 363)

  await page.mouse.move(515, 363)

  await page.mouse.move(515, 362)

  // Point 5 (final)
  await page.mouse.click(515, 362)

  await page.waitForSelector('.midPart > .el-row > .el-col > #complete > #studio-app-complete-button')
  await page.click('.midPart > .el-row > .el-col > #complete > #studio-app-complete-button')

  // Save The design
  await page.mouse.click(781, 21)
}

module.exports = polygonTest
