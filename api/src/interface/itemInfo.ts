export  type ItemInfo = oneChannelItemInfo | multiChannelItemInfo

export interface oneChannelItemInfo {
  url: string,
  size: number,
  name: string,
  folder?: string,
  ext:string,
needYoutubeDl: boolean,
}


export interface multiChannelItemInfo {
  size: number,
  name: string,
  folder?: string,
  needYoutubeDl: boolean,
  ext:string,
video: {
  ext: string,
  url:string,
},
audio: {
  ext: string,
  url:string,
}
}

export function isOneChannel(item: ItemInfo): item is oneChannelItemInfo{ //todo test guards
  const one = item as oneChannelItemInfo
  return (one.url !== undefined)
}

export function isMultiChannel(item: ItemInfo): item is multiChannelItemInfo{
  const multi = item as multiChannelItemInfo
  return ((multi.video !== undefined) && (multi.audio !==undefined))
}