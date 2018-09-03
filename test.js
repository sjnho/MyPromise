const MyPromise = require('./MyPromise');
let promise = new MyPromise(resolve => resolve(10))
promise.then(value => {
    console.log("value",value)
    return 888
}).then(value => {
  console.log("value",value)
  throw Error("!234")
}).catch(e=>console.error(e))