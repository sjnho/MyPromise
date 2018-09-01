const EventLoopRun = require('./EventLoopRun');

class MyPromise {
  constructor(excutor) {
    this.status = MyPromise.PENDING
    this.data = undefined
    this.resolveQueue = []
    this.rejectQueue = []
    try {
      excutor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  resolve(data) {
    EventLoopRun(() => {
      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULLFILLED
        this.data = data
        for (let i = 0; i < this.resolveQueue.length; i++) {
          this.resolveQueue[i](data)
        }
      }
    })

  }
  reject(error) {
    EventLoopRun(() => {

      if (this.status === MyPromise.PENDING) {
        this.status = MyPromise.FULLFILLED
        this.data = error
        for (let i = 0; i < this.rejectQueue.length; i++) {
          this.rejectQueue[i](error)
        }
      }
    })
  }
  then(onResolved, onRejected) {
      typeof onResolved ==='function'?
  }
}
MyPromise.PENDING = Symbol('pending')
MyPromise.FULLFILLED = Symbol('fullfilled')
MyPromise.REJECTED = Symbol('rejected')

