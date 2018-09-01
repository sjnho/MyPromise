const process = require('process');
module.exports = (handler) => {
  process.nextTick(() => {
    handler()
  })
}