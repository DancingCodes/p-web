export const IMAGE_CATEGORIES = [
  { name: '全部', value: 'all' },
  { name: '海报', value: 'poster' },
  { name: '易拉宝', value: 'banner' },
  { name: '详情页', value: 'detail' },
  { name: '宣传页', value: 'promo' },
  { name: '折页', value: 'fold' },
]

export const VIDEO_CATEGORIES = [
  { name: '全部', value: 'all' },
  { name: '口播', value: 'speech' },
  { name: '风采', value: 'showcase' },
  { name: 'Ai', value: 'ai' },
]

export function categoryLabel(type, category) {
  const list = type === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES
  return list.find((item) => item.value === category).name
}
