// 1 - globalComponent.js

import Vue from 'vue' // 引入vue

// 处理首字母大写 abc => Abc
function changeStr(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/*
    require.context(arg1,arg2,arg3)
        arg1 - 读取文件的路径
        arg2 - 是否遍历文件的子目录
        arg3 - 匹配文件的正则
    关于这个Api的用法，建议小伙伴们去查阅一下，用途也比较广泛
*/
const requireComponent = require.context('./components/threeObj', false, /\.vue$/)
requireComponent.keys().forEach(fileName => {
  const config = requireComponent(fileName)
  const componentName = changeStr(
    fileName.replace(/^\.\//, '').replace(/\.\w+$/, '') // ./child1.vue => child1
  )

  Vue.component(componentName, config.default || config) // 动态注册该目录下的所有.vue文件
})

const meshComponent = require.context('./components/mesh', false, /\.vue$/)
meshComponent.keys().forEach(fileName => {
  const config = meshComponent(fileName)
  const componentName = changeStr(
    fileName.replace(/^\.\//, '').replace(/\.\w+$/, '') // ./child1.vue => child1
  )

  Vue.component(componentName, config.default || config) // 动态注册该目录下的所有.vue文件
})

const oimoComponent = require.context('./components/oimo', false, /\.vue$/)
oimoComponent.keys().forEach(fileName => {
  const config = oimoComponent(fileName)
  const componentName = changeStr(
    fileName.replace(/^\.\//, '').replace(/\.\w+$/, '') // ./child1.vue => child1
  )

  Vue.component(componentName, config.default || config) // 动态注册该目录下的所有.vue文件
})
