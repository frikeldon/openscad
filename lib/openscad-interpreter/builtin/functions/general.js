import { toString, calcRange } from '../utils'

export const concat = {
  parametersCount: -1,
  method (...parameters) {
    const array = []
    for (const { value } of parameters) {
      if (Array.isArray(value)) {
        for (const element of value) array.push(element)
      } else {
        array.push(value)
      }
    }
    return array
  }
}

export const lookup = {
  parametersCount: 2,
  method ({ value: key }, { value: array }) {
    if (typeof key === 'number' && Array.isArray(array)) {
      let prev, next
      for (const [entryKey, entryValue] of array) {
        if (typeof entryKey === 'number' && typeof entryValue === 'number') {
          if (entryKey === key) return entryValue
          if (entryKey < key && (!prev || prev.value < entryKey)) {
            prev = { key: entryKey, value: entryValue }
            continue
          }
          if (entryKey > key && (!next || next.value > entryKey)) {
            next = { key: entryKey, value: entryValue }
            continue
          }
        }
      }
      if (prev && !next) return prev.value
      if (next && !prev) return next.value
      if (prev && next) {
        const ratio = (key - prev.key) / (next.key - prev.key)
        return (ratio * (next.value - prev.value)) + prev.value
      }
    }
  }
}

export const str = {
  parametersCount: -1,
  method (...parameters) {
    return toString(...parameters.map(parameter => parameter.value))
  }
}

function innerChr (values) {
  const strings = []
  for (const value of values) {
    if (typeof value === 'number') strings.push(String.fromCharCode(value))
    else if (Array.isArray(value)) strings.push(innerChr(value))
    else if (typeof value === 'object' && value.type === 'range') strings.push(innerChr(calcRange(value)))
  }
  return strings.join('')
}

export const chr = {
  parametersCount: -1,
  method (...parameters) {
    return innerChr(parameters.map(parameter => parameter.value))
  }
}

export const ord = {
  parametersCount: 1,
  method ({ value }) {
    return typeof value === 'string' ? value.charCodeAt(0) : undefined
  }
}
