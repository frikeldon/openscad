/* eslint-disable camelcase */

export const is_undef = {
  parametersCount: 1,
  method ({ value }) {
    return typeof value === 'undefined'
  }
}

export const is_bool = {
  parametersCount: 1,
  method ({ value }) {
    return typeof value === 'boolean'
  }
}

export const is_num = {
  parametersCount: 1,
  method ({ value }) {
    return typeof value === 'number'
  }
}

export const is_string = {
  parametersCount: 1,
  method ({ value }) {
    return typeof value === 'string'
  }
}

export const is_list = {
  parametersCount: 1,
  method ({ value }) {
    return Array.isArray(value)
  }
}
