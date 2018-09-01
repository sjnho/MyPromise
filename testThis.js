'use strict'
class Test{
  constructor(handler,val){
    this.x  =  val
    handler(this.test1.bind(this))
  }
  test1(){
    console.log('汉书外');
    (()=>{
      console.log('函数里',this.x)
    })()
  }
}
let x = 1
let test = new Test((test1)=>{
    let x =3
    this.x = 4
    test1()
},2)
console.log('全局',this)