/// <reference path="./index.d.ts" />

// 节点埋点统一出口
let elementCallback: Jafish_Stat.ElementCallback = (param, data, ...arg) => console.log('useElement', param, data, ...arg)
export const useElement = (callback: Jafish_Stat.ElementCallback) => elementCallback = callback

// 节点对应id
let elementID: Jafish_Stat.ElementID = 1
const useElementID = (): Jafish_Stat.ElementID => elementID++

// 记录节点和参数
const elements: Jafish_Stat.ElementItem[] = []
export const onElement = (el: Jafish_Stat.El, data: Jafish_Stat.KV, ...arg: any[]): Function => {
    // 使用 id 而非 el 是为了防止 return 的方法中产生依赖而内存不得已释放
    const id = useElementID()
    // 先移除旧的
    const showed = removeElement(el)
    // 新增
    const item: Jafish_Stat.ElementItem = {
        id,
        el,
        showed,
        upload: action => elementCallback({ id, action: typeof action === 'string' ? action : 'click' }, data, ...arg),
    }
    // 添加点击事件
    item.el.addEventListener('click', item.upload)
    // 添加到记录
    elements.push(item)
    // 添加完成，默认给一次展示
    autoView()
    // 给一个简单的移除方式
    return () => removeElement(id)
}

// 删除记录
export const removeElement = (idOrEl: Jafish_Stat.ElementID | Jafish_Stat.El): Jafish_Stat.Showed => {
    const findIndex = typeof idOrEl === 'number' ?
        elements.findIndex(item => item.id === idOrEl) :
        elements.findIndex(item => item.el === idOrEl)

    // 如果有，则移除旧数据
    if (findIndex > -1) {
        const item = elements[findIndex]
        // 移除旧的点击事件
        item.el.removeEventListener('click', item.upload)
        // 移除旧的数据
        elements.splice(findIndex, 1)
        // 更新继承，是否展示过
        return item.showed
    }

    return false
}

// 验证节点是否展示，触发节点的埋点
export const onElementView = () => {
    const { innerHeight, innerWidth } = window

    elements.forEach(item => {
        // 展示过不再展示
        if (item.showed) return
        // 没有位置方法的不予处理
        if (!item.el.getBoundingClientRect) return

        const { left, top } = item.el.getBoundingClientRect()
        const { offsetWidth, offsetHeight } = item.el

        if (
            // 在窗口内
            left >= 0 - offsetWidth / 3 * 2 &&
            left <= innerWidth - offsetWidth / 3 &&
            top >= 0 - offsetHeight / 3 * 2 &&
            top <= innerHeight - offsetHeight / 3
        ) {
            // 标记为已展示过
            item.showed = true
            // 发起埋点，来源展示
            item.upload('view')
        }
    })
}

// 自动展示
let autoViewTimer: number = null
const autoView = (): void => {
    clearTimeout(autoViewTimer)
    autoViewTimer = setTimeout(onElementView, 800)
}

// 监听全局 scroll ，在滚动的时候自动的节点展示埋点
export const onScrollAutoView = () => document.addEventListener('scroll', autoView, { capture: true })





