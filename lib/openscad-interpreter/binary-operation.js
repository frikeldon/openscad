function castBoolean (value) {
  if (typeof value === 'boolean') return value
  return !(
    value === 0 ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    value === undefined
  )
}

function getMatrixSize (array) {
  if (Array.isArray(array)) {
    if (Array.isArray(array[0])) {
      const length = array[0].length
      if (array.every(row =>
        Array.isArray(row) &&
          row.length === length &&
          row.every(cell => typeof cell === 'number')
      )) {
        return { type: 'matrix', rows: array.length, cols: length }
      }
    }
    if (array.every(cell => typeof cell === 'number')) {
      return { type: 'vector', rows: 1, cols: array.length }
    }
  }
  return { type: 'none' }
}

function operationOneByOne (left, right, operator) {
  const length = Math.min(left.length, right.length)
  const result = []
  for (let index = 0; index < length; index += 1) {
    result.push(operators[operator](left[index], right[index]))
  }
  return result
}

function operationManyToOne (array, number, operator) {
  const result = []
  for (const element of array) {
    result.push(operators[operator](element, number))
  }
  return result
}

function operationOneToMany (number, array, operator) {
  const result = []
  for (const element of array) {
    result.push(operators[operator](number, element))
  }
  return result
}

function dotProduct (left, right) {
  let result = 0
  for (let index = 0; index < left.length; index += 1) {
    if (typeof left[index] !== 'number' || typeof right[index] !== 'number') {
      return undefined
    }
    result += left[index] * right[index]
  }
  return result
}

function matrixMultiplication (left, right) {
  const newRows = left.length
  const newCols = right[0].length
  const common = right.length
  const result = new Array(newRows)
  for (let row = 0; row < newRows; row += 1) {
    result[row] = new Array(newCols)
    for (let col = 0; col < newCols; col += 1) {
      let value = 0
      for (let index = 0; index < common; index += 1) {
        value += left[row][index] * right[index][col]
      }
      result[row][col] = value
    }
  }
  return result
}

function matrixDotVector (matrix, vector) {
  const newLength = matrix.length
  const result = new Array(newLength)
  for (let index = 0; index < newLength; index += 1) {
    let value = 0
    for (let counter = 0; counter < vector.length; counter += 1) {
      value += matrix[index][counter] * vector[counter]
    }
    result[index] = value
  }
  return result
}

function vectorDotMatrix (vector, matrix) {
  const newLength = matrix[0].length
  const result = new Array(newLength)
  for (let index = 0; index < newLength; index += 1) {
    let value = 0
    for (let counter = 0; counter < vector.length; counter += 1) {
      value += vector[counter] * matrix[counter][index]
    }
    result[index] = value
  }
  return result
}

const operators = {
  '+' (left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return left + right
    }
    if (Array.isArray(left) && Array.isArray(right)) {
      return operationOneByOne(left, right, '+')
    }
  },
  '-' (left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right
    }
    if (Array.isArray(left) && Array.isArray(right)) {
      return operationOneByOne(left, right, '-')
    }
  },
  '*' (left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return left * right
    }
    if (Array.isArray(left) && typeof right === 'number') {
      return operationManyToOne(left, right, '*')
    }
    if (typeof left === 'number' && Array.isArray(right)) {
      return operationOneToMany(left, right, '*')
    }

    const leftSize = getMatrixSize(left)
    const rightSize = getMatrixSize(right)
    if (
      leftSize.type === 'matrix' &&
      rightSize.type === 'matrix' &&
      leftSize.cols === rightSize.rows
    ) {
      return matrixMultiplication(left, right)
    }
    if (
      leftSize.type === 'matrix' &&
      rightSize.type === 'vector' &&
      leftSize.cols === rightSize.cols
    ) {
      return matrixDotVector(left, right)
    }
    if (
      leftSize.type === 'vector' &&
      rightSize.type === 'matrix' &&
      leftSize.cols === rightSize.rows
    ) {
      return vectorDotMatrix(left, right)
    }

    if (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length
    ) {
      return dotProduct(left, right)
    }
  },
  '/' (left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return left / right
    }
    if (Array.isArray(left) && typeof right === 'number') {
      return operationManyToOne(left, right, '/')
    }
    if (typeof left === 'number' && Array.isArray(right)) {
      return operationOneToMany(left, right, '/')
    }
  },
  '%' (left, right) {
    if (typeof left === 'number' && typeof right === 'number') {
      return left % right
    }
  },
  '<' (left, right) {
    if (typeof left === 'object' || typeof right === 'object') return false
    return left < right
  },
  '<=' (left, right) {
    if (typeof left === 'object' || typeof right === 'object') return false
    return left <= right
  },
  '==' (left, right) {
    if (typeof left === typeof right) {
      if (typeof left !== 'object') {
        return left === right
      }
      if (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length
      ) {
        for (let i = 0; i < left.length; i++) {
          if (!operators['=='](left[i], right[i])) {
            return false
          }
        }
        return true
      }
    }
    return false
  },
  '!=' (left, right) {
    if (typeof left === typeof right) {
      if (typeof left !== 'object') {
        return left !== right
      }
      if (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length
      ) {
        for (let i = 0; i < left.length; i++) {
          if (!operators['!='](left[i], right[i])) {
            return false
          }
        }
        return true
      }
    }
    return true
  },
  '>=' (left, right) {
    if (typeof left === 'object' || typeof right === 'object') return false
    return left >= right
  },
  '>' (left, right) {
    if (typeof left === 'object' || typeof right === 'object') return false
    return left > right
  },
  '||' (left, right) {
    return castBoolean(left) || castBoolean(right)
  },
  '&&' (left, right) {
    return castBoolean(left) && castBoolean(right)
  }
}

export default operators
