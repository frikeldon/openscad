export function toString (...values) {
  const strings = []
  for (const value of values) {
    if (value === undefined) strings.push('undef')
    else if (typeof value === 'string') strings.push(value)
    else if (Array.isArray(value)) strings.push(`[${value.map(element => toString(element)).join(', ')}]`)
    else if (value.type === 'range') strings.push(`[${value.start}:${value.increment}:${value.end}]`)
    else strings.push(value.toString())
  }
  return strings.join('')
}

export function calcRange (range) {
  const values = []
  if (
    (range.increment !== 0) ||
    (range.increment > 0 && range.start < range.end) ||
    (range.increment < 0 && range.start > range.end)
  ) {
    const compare = range.increment > 0
      ? value => value <= range.end
      : value => value >= range.end
    for (let value = range.start; compare(value); value += range.increment) {
      values.push(value)
    }
  }
  return values
}

export function createGroup (objects) {
  return {
    type: 'operation',
    object: 'group',
    objects: [...objects]
  }
}
