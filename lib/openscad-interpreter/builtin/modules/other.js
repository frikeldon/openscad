import { toString, calcRange, createGroup } from '../utils'

export const echo = {
  method (environment, children, ...parameters) {
    const texts = []
    for (const parameter of parameters) {
      if (parameter.name) texts.push(`${parameter.name.value} = ${toString(parameter.value)}`)
      else texts.push(toString(parameter.value))
    }
    console.log(texts.join(', '))
  }
}

export const children = {
  method (environment, children, { value: idx }) {
    const childs = environment.getChildren()

    if (!childs) {
      return
    }

    if (idx == null) {
      return createGroup(childs)
    }

    if (typeof idx === 'number') {
      return childs[idx]
    }

    if (Array.isArray(idx) || idx.type === 'range') {
      const objects = []
      const indices = Array.isArray(idx) ? calcRange(idx) : idx
      for (const index of indices) {
        if (typeof index === 'number') {
          objects.push(childs[index])
        }
      }
      return createGroup(objects)
    }
  }
}
