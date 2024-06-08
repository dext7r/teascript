const config = require('../config')
const { getBrowser, closeBrowser } = require('./browser')
const { injectStorage } = require('./utils')
const { readFileToArray, extractTableData, compareData } = require('../src/utils');
const { common } = require('./common');

async function availableTea(page, availableProjects) {
  // for (const project of availableProjects) {
  await page.goto(common.urls.newProject, { waitUntil: 'networkidle0' });
  await page.type('.placeholder-subtle', availableProjects[0], { delay: 100 });
  await page.click('#agreeRisk');

  console.log(`已申请 ${availableProjects[0]} 项目`);
  // }
}


async function tea() {
  const browser = await getBrowser()
  const page = await browser.newPage()
  // 注入 localStorage 数据
  await injectStorage(page, config.teaStore);
  // 设置 viewport
  const dimensions = await page.evaluate(() => {
    return {
      width: window.screen.width / 2,
      height: window.screen.height,
    }
  })
  await page.setViewport(dimensions)
  await page.goto(common.urls.projects, { waitUntil: 'networkidle0' });
  const project = await extractTableData(page);
  console.log(`已申请 ${project.length} 个项目`);
  const npmPkg = await readFileToArray(common.filePath.npmPkg);
  console.log(`存在 ${npmPkg.length} 个npm包`);
  const availableProjects = await compareData(project, npmPkg);
  console.log(`npm包中还有申请 ${availableProjects.length} 个项目可申请`);
  await availableTea(page, availableProjects);
}



module.exports = {
  tea
}
