# @jafish/stat

[![npm](https://img.shields.io/npm/v/@jafish/stat)](https://www.npmjs.com/package/@jafish/stat)

埋点工具

### 注意事项

* onElement 使用了节点实例，需要注意及时的释放
* 使用 useStat 时，需注意回调函数内是否有外部引用
* 除去 useWatchRoute 及 element 相关的方法，stat本身可用在非web端（小程序之类）
* 一般来说需要在 useUpload 这个统一埋点出口做一些符合需求的优化

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
    // 详见源码中的 watch-route.ts 文件
    ...
})

/**
 * @desc 使用页面级的数据缓存，可选
 * @desc watchRoute 能获取到路由相关信息，具体见 @jafish/watch-route
 * @param watchRoute 即 @jafish/watch-route 模块
 * @param {Object} options
 *        {Boolean} routeChangeClearUseStat 在路由切换的时候默认会移除上一个页面使用的 useStat，防止内存泄漏
  */
$stat.useWatchRoute(watchRoute, { routeChangeClearUseStat: true })

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
 * @desc 添加需要展示埋点的节点，且同时支持点击埋点
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

