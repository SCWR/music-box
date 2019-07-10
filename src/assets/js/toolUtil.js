// 60 => 01:00
export const secondToFormat = (second) => `${String(Math.floor((second / 60 % 60))).padStart(2, '00')}:${String(Math.floor((second % 60))).padStart(2, '00')}`
// 01:00 => 60
export const formatToSecond = (format) => {
  let [m, s] = format.split(':')
  if (isNaN(m) || isNaN(s)) {
    return -1
  }
  return Number(m) * 60 + Number(s)
}

export const binerySearch = (contrast, arr, start, end) => {
  start = start || 0
  end = !end && end !== 0 ? arr.length - 1 : end
  let mid = Math.floor((start + end) / 2)
  let target = arr[mid]
  if (contrast >= target) {
    if (mid === arr.length - 1) {
      return contrast
    } else if (contrast < arr[mid + 1]) {
      return target
    } else {
      return binerySearch(contrast, arr, mid + 1, end)
    }
  } else if (contrast < target) {
    if (mid === 0) {
      return contrast
    } else if (contrast > arr[mid - 1]) {
      return arr[mid - 1]
    } else {
      return binerySearch(contrast, arr, start, mid - 1)
    }
  }
}
