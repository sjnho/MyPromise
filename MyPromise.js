const EventLoopRun = require('./EventLoopRun');

class MyPromise {
  constructor(executor) {
    this._status = MyPromise.PENDING
    this._data = undefined
    this._callbacks = []
    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }
  _changeState(state, data) {
    if (this._status === MyPromise.PENDING) {
      this._status = state
      this._data = data
      this._callbacks.forEach(callback => callback())
    }
  }
  resolve(data) {
    this._changeState(MyPromise.FULLFILLED, data)
  }
  reject(error) {
    this._changeState(MyPromise.REJECTED, error)
  }
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  then(onResolved, onRejected) {
    let promise2 = new MyPromise((resolve, reject) => {
      let fn = () => {
        EventLoopRun(() => {
          onResolved = typeof onResolved === 'function' ? onResolved : (value) => value
          onRejected = typeof onRejected === 'function' ? onRejected : (value) => { throw value }
          try {
            let x = this._status === MyPromise.FULLFILLED ? onResolved(this._data) : onRejected(this._data)
            resolveProcedure(resolve, reject, promise2, x)
          } catch (e) {
            reject(e)
          }
        })
      }
      if (this._status === MyPromise.PENDING) {
        this._callbacks.push(fn)
      } else {
        fn()
      }
    })
    return promise2
  }
  static deferred() {
    var dfd = {}
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }
}
// 根据 x 值，解析 promise 状态 resolveProcedure(promise, x)
function resolveProcedure(resolve, reject, promise2, x) {
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise!'));
  }
  if (x instanceof MyPromise) {    // 2.3.2 If x is a promise, adopt its state
    x.then(value => resolveProcedure(resolve, reject, promise2, value), reason => reject(reason));
  } else if ((typeof x === 'object' && x !== null) || (typeof x === 'function')) {  // 2.3.3 
    let resolvedOrRejected = false;
    try {
      let then = x.then;      // 2.3.3.1 Let then be x.then
      if (typeof then === 'function') {   // 2.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
        then.call(x, value => {
          if (!resolvedOrRejected) {
            resolveProcedure(resolve, reject, promise2, value); // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
            resolvedOrRejected = true;
          }
          // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
        }, reason => {
          if (!resolvedOrRejected) {
            reject(reason);             // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
            resolvedOrRejected = true;
          }
          // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
        });
      } else {                // 2.3.3.4 If then is not a function, fulfill promise with x.
        resolve(x);
      }
    } catch (e) {
      if (!resolvedOrRejected) {
        // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
        // 2.3.3.4 If calling then throws an exception e
        reject(e);
      }
    }
  } else {
    resolve(x);     // 2.3.4 If x is not an object or function, fulfill promise with x.
  }
}
module.exports = MyPromise
MyPromise.PENDING = Symbol('pending')
MyPromise.FULLFILLED = Symbol('fullfilled')
MyPromise.REJECTED = Symbol('rejected')

