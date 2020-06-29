function toDegrees (angle) {
  return angle * (180 / Math.PI)
}

function toRadians (angle) {
  return angle * (Math.PI / 180)
}

export const abs = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.abs(value)
    }
  }
}

export const sign = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      if (value > 0) return 1
      if (value < 0) return -1
      return 0
    }
  }
}

export const sin = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.sin(toRadians(value))
    }
  }
}

export const cos = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.cos(toRadians(value))
    }
  }
}

export const tan = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.tan(toRadians(value))
    }
  }
}

export const asin = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return toDegrees(Math.asin(value))
    }
  }
}

export const acos = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return toDegrees(Math.acos(value))
    }
  }
}

export const atan = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return toDegrees(Math.atan(value))
    }
  }
}

export const atan2 = {
  parametersCount: 2,
  method ({ value: valueX }, { value: valueY }) {
    if (typeof valueX === 'number' && typeof valueY === 'number') {
      return toDegrees(Math.atan2(valueX, valueY))
    }
  }
}

export const floor = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.floor(value)
    }
  }
}

export const round = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.round(value)
    }
  }
}

export const ceil = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.ceil(value)
    }
  }
}

export const ln = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.log(value)
    }
  }
}

export const len = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length
    }
  }
}

// let

export const log = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.log10(value)
    }
  }
}

export const pow = {
  parametersCount: 2,
  method ({ value: base }, { value: exponent }) {
    if (typeof base === 'number' && typeof exponent === 'number') {
      return Math.pow(base, exponent)
    }
  }
}

export const sqrt = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.sqrt(value)
    }
  }
}

export const exp = {
  parametersCount: 1,
  method ({ value }) {
    if (typeof value === 'number') {
      return Math.exp(value)
    }
  }
}

// rands

export const min = {
  parametersCount: -1,
  method (...parameters) {
    if (parameters.length === 1 && Array.isArray(parameters[0].value)) {
      return Math.min(...parameters[0].value)
    }
    return Math.min(...parameters.map(param => param.value))
  }
}

export const max = {
  parametersCount: -1,
  method (...parameters) {
    if (parameters.length === 1 && Array.isArray(parameters[0].value)) {
      return Math.max(...parameters[0].value)
    }
    return Math.max(...parameters.map(param => param.value))
  }
}

// norm
// cross
