/// <reference path="./index.d.ts" />
import merge from 'merge'
import { usePipe, overrideUseStat } from './stat'

const options: Jafish_Stat.UseWatchRouteOptions = {
    routeChangeClearUseStat: true
}

// 使用 watchRoute
export const useWatchRoute: Jafish_Stat.UseWatchRoute = (wr,
    {
        routeChangeClearUseStat = true, // 路由改变时，清除之前路由的 useStat，默认清除
    } = options
) => {
    // 检测是否为浏览器环境
    const inWeb: boolean = typeof window === 'object' && !!window.navigator && (!!window.history || !!window.location) && !!window.document && !!window.screen

    if (!inWeb) return console.error('useWatchRoute: 所在环境非web环境')
    if (!wr || !wr.initWatchRoute) return console.error('useWatchRoute: 需要 @jafish/watch-route 模块')

    // {
    //     initWatchRoute,
    //     routeChange,
    //     getCurrentPage,
    //     getPageForward,
    //     updatePageStackOtherData,
    //     removePageStackOtherData,
    //     getCurrentPageOtherData,
    // }

    const otherDataKey: string = 'stat'

    // 初始化路由监听
    wr.initWatchRoute()

    // 路由改变时清除之前的 useStat 回调
    wr.routeChange((newPage, oldPage) => routeChangeClearUseStat && wr.removePageStackOtherData(oldPage.id, otherDataKey))

    // 使用页面默认值
    usePipe(data => merge.recursive(
        true,
        wr.getCurrentPageOtherData(wr.getCurrentPage(), otherDataKey) || {},
        data
    ))

    // 重写 useStat
    overrideUseStat(callback => {
        // 当 watchRoute 存在时，方法缓存于页面栈
        wr.updatePageStackOtherData(otherDataKey, callback)
    })

    // 给该函数提供一个获取上一个页面数据的便捷方法
    useWatchRoute.getPrevPageStatData = () => {
        const prev = wr.getPageForward().pop()

        if (prev) return prev.otherData[otherDataKey] || {}
        else return {}
    }
}

