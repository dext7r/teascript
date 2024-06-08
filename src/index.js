const { tea } = require('./tea')
const { closeBrowser } = require('./browser')
  ; (async () => {
    await tea()
    // await closeBrowser()
  })()
