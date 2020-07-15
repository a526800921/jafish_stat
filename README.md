# @jafish/stat

[![npm](https://img.shields.io/npm/v/@jafish/stat)](https://www.npmjs.com/package/@jafish/stat)

埋点工具

### 注意事项

* onElement 使用了节点实例，需要注意及时的释放
* 使用 useStat 时，需注意回调函数内是否有外部引用
* 除去 useWatchRoute 及 element 相关的方法，stat本身可用在非web端（小程序之类）
* 一般来说需要在 useUpload 这个统一埋点出口做一些符合需求的优化
* 节点相关的埋点在 react 可以封装成一个组件，在 vue 可以封装成一个指令，便于使用

### 使用

```js
import * as $stat from '@jafish/stat'
import * as watchRoute from '@jafish/watch-route'

/**
 * @desc 统一的上传入口
 * @param {Object} data 发起埋点传入的数据
 * @param {any} params 发起埋点传入的其他参数，用于自定义操作，如上报记录缓存
 */
$stat.useUpload((data, ...params) => {
    console.log(data, ...params)
})

/**
 * @desc 发起埋点
 * @param {Object} data 埋点参数
 * @param {any} params 自定义参数
*/
$stat.onStat({
    target: '页面展示',
    action: 'view',
    actionParams: {
        bbb: 'cc'
    }
}, ...params)

/**
 * @desc 用于处理埋点数据的方法
 * @param {Function} 在回调中处理数据，需返回处理后的数据
  */
$stat.usePipe((data, ...params) => {
    // 处理传入的数据，最终数据会到达 useUpload
    const newData = { ...data }
    ...
    return newData
})

// 当使用了 watchRoute 时为设置当前页面默认参数
// 否则设置为持久的默认参数，直至下一次 useStat 替换
// 默认参数会与发起埋点传入的参数做一次 merge
$stat.useStat(() => {
    return {
        page: '首页',
        pageParams: {
            aaa: this.aaa
        }
    }
})

// 重写 useStat
$stat.overrideUseStat(callback => {
    // callback 为 useStat 传入的回调
    // 调用该方法后，默认的 merge 会被取消
    // 需要自己调用 usePipe 进行自定义的数据操作
    // 使用方式可参考源码中的 watch-route.ts 文件
    ...
})

/**
 * @desc 使用页面级的数据缓存，可选
 * @desc watchRoute 能获取到路由相关信息，具体见 @jafish/watch-route
 * @param watchRoute 即 @jafish/watch-route 模块
 * @param {Object} options
 *        {Boolean} options.routeChangeClearUseStat 在路由切换的时候默认会移除上一个页面使用的 useStat，防止内存泄漏
  */
$stat.useWatchRoute(watchRoute, { routeChangeClearUseStat: true })

// 使用 useWatchRoute 之后，可以获得一个获取上一个页面数据的便捷方法
$stat.useWatchRoute.getPrevPageStatData()

/**
 * @desc 用于处理节点数据的入口
 * @param {Object} param
 *        {string} param.action 节点上报时的来源 'view' -> 节点展示， 'click' -> 节点被点击
 * @param {Object} data 节点绑定时传入的数据
 * @param {any} params 发起埋点传入的其他参数
*/
$stat.useElement((param, data, ...params) => {
    console.log(param, data, ...params)

    // 在这里走统一入口上报，因为数据只会在 onStat 处理
    $stat.onStat({
        ...data,
        action: param.action
    }, ...params)
})

/**
 * @desc 添加需要展示及点击埋点的节点
 * @param {HTMLElement} el 节点实例，因需要使用 el.getBoundingClientRect 判断节点在屏幕中的位置
 * @param {Object} data 埋点参数
 * @param {any} params 自定义参数
 * @return {Function} removeElement 移除埋点节点
  */
const removeElement = $stat.onElement(el, {
    target: 'button',
    actionParams: {
        dd: 'ee'
    }
}, ...params)

// 释放节点绑定
removeElement()

/**
 * @desc 移除埋点节点，以另一种方式移除
 * @param {HTMLElement} el 节点实例
  */
$stat.removeElement(el)

// 触发节点的埋点，用于节点展示
// 通常用作于 onscroll 事件，一般来说使用下面的 onScrollAutoView 足够
$stat.onElementView()

// 监听全局 onscroll ，在滚动结束的时候自动的节点展示埋点
$stat.onScrollAutoView()
```

### 实践

```js
// main.js
import * as $stat from '@jafish/stat'
import * as watchRoute from '@jafish/watch-route'

$stat.useUpload((data, { cache = '' } = {}) => {
    // 最终结果
    console.log('useUpload', data, cache)
    // 获取上个页面的数据，如果需求需要的话
    console.log('parent', $stat.useWatchRoute.getPrevPageStatData())

    // 拿到结果后，可以进行缓存、防抖等一系列优化，然后进行上传给服务器
})

$stat.usePipe((data) => {
    // 添加公共的默认参数
    if (!data.target) data.target = '页面'
    if (!data.action) data.action = 'view'
    return data
})

// 可选
$stat.useWatchRoute(watchRoute)

// 节点埋点
$stat.useElement((param, data, ...params) => {
    console.log('useElement', param, data, ...params)

    $stat.onStat({
        ...data,
        action: param.action
    }, ...params)
})

// 页面滚动，自动触发节点展示埋点
$stat.onScrollAutoView()


// home.js
componentDidMount() {
    // 当前页面需要使用的默认参数
    $stat.useStat(() => ({
        page: '首页',
    }))

    // 页面展示埋点
    $stat.onStat()

    // 节点展示及点击埋点
    const removeElement = $stat.onElement(this.div.current, {
        target: 'div'
    })

    // 在特定情况下移除节点绑定
    setTimeout(() => removeElement(), 5000)
}

componentWillUnmount() {
    // 页面销毁时，移除节点绑定
    $stat.removeElement(this.div.current)
}
```

### 节点埋点封装

> react

```js
import React, { Component, createRef } from 'react'
import * as $stat from '@jafish/stat'

export default class StatBox extends Component {
    constructor({ stat }) {
        super()

        this.box = createRef()
    }

    componentDidMount() {
        const { stat } = this.props

        $stat.onElement(this.box.current, stat)
    }

    componentWillUnmount() {
        $stat.removeElement(this.box.current)
    }

    render() {
        const { children } = this.props

        return (
            <div ref={this.box}>
                {children}
            </div>
        )
    }
}

// 使用
<StatBox stat={{ target: 'box' }}>
    xxx
</StatBox>
```

> vue

```js
import Vue from 'vue'
import * as $stat from '@jafish/stat'

// 绑定
const onElement = ( 
    el, 
    { 
        value = {}
    } = {},
) => $stat.onElement(el, value)

// 移除绑定
const removeElement = (el) => $stat.removeElement(el)

Vue.directive('stat', {
    inserted: onElement,
    componentUpdated: onElement,
    unbind: removeElement,
})

// 使用
<div v-stat="{ target: 'div' }"></div>
```

