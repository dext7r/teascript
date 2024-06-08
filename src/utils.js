const fs = require('fs').promises;
const path = require('path');

/**
 * 设置页面cookie
 *
 * @param page 页面对象
 * @param cookie cookie字符串
 * @param domain cookie所属域名，默认为当前页面的host
 * @returns 无返回值
 */
const setPageCookie = async (page, cookie, domain) => {
  if (!domain) domain = page.url().JSON.parse(page.url()).host;
  if (!cookie) return;
  const cookies = cookie.split(';').map((pair) => {
    const name = pair.trim().slice(0, pair.trim().indexOf('='))
    const value = pair.trim().slice(pair.trim().indexOf('=') + 1)
    return { name, value, domain: domain }
  })
  await page.setCookie(...cookies)
}

/**
 * 将本地存储数据注入到页面中
 *
 * @param page 页面对象
 * @param localStorageData 本地存储数据，默认为空对象
 * @returns 返回一个 Promise，表示操作完成
 */
async function injectStorage(page, localStorageData = {}) {
  await page.evaluateOnNewDocument((data) => {
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
    });
  }, localStorageData);
}

/**
 * 读取指定路径的文件并将内容转换为数组
 * @param {string} filePath - 文件路径
 * @returns {Promise<string[]>} - 包含文件行内容的数组
 */
async function readFileToArray(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');

    // 将文件内容按行拆分为数组，并去除空行和首尾空白字符
    const array = data.split('\n').map(line => line.trim()).filter(line => line !== '');
    return array;
  } catch (err) {
    throw new Error('Error reading file: ' + err.message);
  }
}



/**
 * 提取表格数据
 *
 * @param page 页面对象
 * @returns 返回表格数据数组
 */
async function extractTableData(page) {
  const data = await page.evaluate(() => {
    const tableElement = document.querySelector('div[data-testid="table-element"]');
    if (!tableElement) return null;

    const rows = tableElement.querySelectorAll('tbody tr[data-testid="table-row-element"]');
    const result = [];

    rows.forEach(row => {
      const projectName = row.querySelector('td:nth-child(1) section div').textContent.trim();
      const projectTreasury = row.querySelector('td:nth-child(2) div span').textContent.trim();
      const rewardsStatus = row.querySelector('td:nth-child(3) span span').textContent.trim();
      const unclaimedRewards = row.querySelector('td:nth-child(4) div span').textContent.trim();

      result.push({
        projectName,
        projectTreasury,
        rewardsStatus,
        unclaimedRewards,
      });
    });

    return result;
  });

  return data;
}

/**
 * 比较表格数据和npm包数据，返回不在表格数据中的npm包名称列表
 *
 * @param tableData 表格数据，包含多个对象，每个对象包含一个projectName属性
 * @param npmPkg npm包名称列表
 * @returns 不在表格数据中的npm包名称列表
 */
async function compareData(tableData, npmPkg) {
  const tableDataNames = tableData.map(item => item.projectName);
  const npmPkgNames = npmPkg;

  const notExistingInTableData = npmPkgNames.filter(name => !tableDataNames.includes(name));

  return notExistingInTableData;
}

module.exports = {
  setPageCookie,
  injectStorage,
  readFileToArray,
  extractTableData,
  compareData
}
