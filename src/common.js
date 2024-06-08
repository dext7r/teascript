const path = require('path');
const common = {
  urls: {
    projects: 'https://app.tea.xyz/my-projects',
    newProject: 'https://app.tea.xyz/my-projects/new',
  },
  filePath: {
    npmPkg: path.join(__dirname, '../', 'config', 'npm.txt'),
  }
}
module.exports = {
  common
}
