declare namespace Jafish_Stat {
    interface KV {
        [key: string]: any
    }

    interface Options {
        
    }

    type UploadCallback = (data: KV, ...arg: any[]) => any

    type PipeCallback = (data: KV, ...arg: any[]) => KV

    type StatCallback = () => KV

    type StatHandle = (callback: StatCallback) => any

    interface ElementParam {
        id: ElementID
        action: string
    }

    type ElementCallback = (param: ElementParam, data: KV, ...arg: any[]) => any

    type ElementID = number
    type El = HTMLElement
    type Showed = boolean
    interface ElementItem {
        id: ElementID
        el: El
        upload: (e: any) => any
        showed: Showed
    }


}