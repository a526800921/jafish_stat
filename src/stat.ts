/// <reference path="./index.d.ts" />
import merge from 'merge'


// 配置项
export const options: Jafish_Stat.Options = {

}

// 设置配置项
export const setOptions = (newOptions: Jafish_Stat.Options) => Object.assign(options, newOptions)

// 埋点出口
let uploadCallback: Jafish_Stat.UploadCallback = (data, ...arg) => console.log('stat upload:', data, ...arg)
export const useUpload = (callback: Jafish_Stat.UploadCallback) => uploadCallback = callback

// 发起埋点
export const onStat = (data: Jafish_Stat.KV, ...arg: any[]): any => uploadCallback(handleData(data), ...arg)

// 添加处理埋点数据的回调
const pipeCallbacks: Jafish_Stat.PipeCallback[] = []
export const usePipe = (callback: Jafish_Stat.PipeCallback): Function => {
    pipeCallbacks.push(callback)
    return (): void => {
        const index = pipeCallbacks.indexOf(callback)
        if (index > -1) pipeCallbacks.splice(index, 1)
    }
}
// 处理埋点数据
const handleData = (data: Jafish_Stat.KV, ...arg: any[]): Jafish_Stat.KV => pipeCallbacks.reduce((newData, callback) => callback(newData, ...arg), data)

// 设置默认值
let statCallback: Jafish_Stat.StatCallback = () => ({})
// 默认 useStat 处理方式
let statHandle: Jafish_Stat.StatHandle = callback => statCallback = callback
// 设置默认值
export const useStat = (callback: Jafish_Stat.StatCallback) => statHandle(callback)
// 使用默认值
const removeDefaultPipe = usePipe(data => merge.recursive(true, statCallback(), data))
// 重写 useStat，用于兼容自定义
export const overrideUseStat = (callback: Jafish_Stat.StatHandle): void => {
    // 重写之后 statCallback 便无用了，在这里移除
    removeDefaultPipe()
    // 重写处理方法
    statHandle = callback
}


