import ParseError from './parse-error'

const reserved = ['true', 'false', 'undef', 'module', 'function', 'include', 'use', 'if', 'else', 'for']
const operators = ['<', '>', '+', '-', '*', '/', '%', '!', '?', '#']
const operators2chars = ['||', '&&', '<=', '>=', '==', '!=']
const punctuation = ['(', ')', '[', ']', '{', '}', ';', ':', ',', '.']
const prePathKeywords = ['include', 'use']

const stringEscapes = { '"': '"', '\\': '\\', t: '\t', n: '\n', r: '\r' }
const stringReplaces = { x: 2, u: 4, U: 6 }

function skipWhitespace (chars) {
  while (/\s/.test(chars.current)) {
    chars.advance()
  }
}

function readInlineComment (chars) {
  const { line, column } = chars
  chars.advance('/')
  chars.advance('/')
  let value = ''
  while (!chars.eof) {
    if (chars.current === '\n') {
      chars.advance('\n')
      break
    }
    value += chars.advance()
  }
  return {
    type: 'COMMENT',
    value,
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function readBlockComment (chars) {
  const { line, column } = chars
  let value = ''
  chars.advance('/')
  chars.advance('*')
  while (chars.current !== '*' || chars.next !== '/') {
    if (chars.eof) {
      throw new ParseError('Unclosed comment', line, column, chars.line, chars.column)
    }
    value += chars.advance()
  }
  chars.advance('*')
  chars.advance('/')
  return {
    type: 'COMMENT',
    value,
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function readNumber (chars) {
  const { line, column } = chars
  let text = ''
  let hasDot = false
  let hasExp = false
  let expSign = false

  while (!chars.eof) {
    if (chars.current === '.') {
      if (hasDot) break
      else {
        hasDot = true
        text += chars.advance()
        continue
      }
    }

    if (/[eE]/.test(chars.current)) {
      if (hasExp) break
      else {
        hasExp = true
        expSign = true
        text += chars.advance()
        continue
      }
    }

    if (expSign) {
      expSign = false
      if (/[+-]/.test(chars.current)) {
        text += chars.advance()
        continue
      }
    }

    if (/\d/.test(chars.current)) {
      text += chars.advance()
      continue
    }

    break
  }

  if (/[eE+-]$/.test(text)) {
    throw new ParseError('Wrong number format', line, column, chars.line, chars.column)
  }

  return {
    type: 'NUMBER',
    value: parseFloat(text),
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function readIdentifier (chars) {
  const { line, column } = chars
  var value = ''
  while (/\w/.test(chars.current)) value += chars.advance()
  const type = reserved.includes(value) ? 'KEYWORD' : 'IDENTIFIER'
  return {
    type,
    value,
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function readString (chars) {
  const { line, column } = chars
  let value = ''

  chars.advance('"')

  while (chars.current !== '"') {
    if (chars.eof) {
      throw new ParseError('Unclosed string', line, column, chars.line, chars.column)
    }

    const current = chars.current

    if (current === '\\') {
      const { line: escapeLine, column: escapeColumn } = chars
      chars.advance('\\')
      const escape = chars.advance()

      if (escape in stringEscapes) {
        value += stringEscapes[escape]
        continue
      }

      if (escape in stringReplaces) {
        const replace = stringReplaces[escape]
        let hexCode = ''
        for (let i = 0; i < replace; i += 1) {
          const digit = chars.current
          if (!/[0-9a-f]/i.test(digit)) {
            throw new ParseError('Invalid hexadecimal digit', escapeLine, escapeColumn, chars.line, chars.column)
          }
          hexCode += chars.advance()
        }
        const charCode = parseInt(hexCode, 16)
        value += String.fromCharCode(charCode)
        continue
      }

      throw new ParseError('Invalid string escape', escapeLine, escapeColumn, chars.line, chars.column)
    }

    if (current === '\n' || current === '\r') {
      throw new ParseError('Invalid end of string', line, column, chars.line, chars.column)
    }

    value += chars.advance()
  }

  chars.advance('"')

  return {
    type: 'STRING',
    value,
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function readPath (chars) {
  const { line, column } = chars
  let value = ''

  chars.advance('<')

  while (chars.current !== '>') {
    if (chars.eof) {
      throw new ParseError('Unclosed path', line, column, chars.line, chars.column)
    }
    value += chars.advance()
  }

  chars.advance('>')

  return {
    type: 'PATH',
    value,
    startLine: line,
    startColumn: column,
    endLine: chars.line,
    endColumn: chars.column
  }
}

function getNextToken (chars, previousToken) {
  skipWhitespace(chars)

  const { current, next, line, column } = chars

  if (chars.eof) {
    return {
      type: 'EOF',
      value: 'EOF',
      startLine: line,
      startColumn: column,
      endLine: line,
      endColumn: column
    }
  }

  if (previousToken.type === 'KEYWORD' && prePathKeywords.includes(previousToken.value)) {
    if (current === '<') {
      return readPath(chars)
    }
  }

  if (current === '/') {
    if (next === '/') {
      return readInlineComment(chars)
    }

    if (next === '*') {
      return readBlockComment(chars)
    }
  }

  if (operators2chars.includes(current + next)) {
    return {
      type: 'OPERATOR',
      value: chars.advance() + chars.advance(),
      startLine: line,
      startColumn: column,
      endLine: chars.line,
      endColumn: chars.column
    }
  }

  if (operators.includes(current)) {
    return {
      type: 'OPERATOR',
      value: chars.advance(),
      startLine: line,
      startColumn: column,
      endLine: chars.line,
      endColumn: chars.column
    }
  }

  if (punctuation.includes(current)) {
    return {
      type: 'PUNCTUATION',
      value: chars.advance(),
      startLine: line,
      startColumn: column,
      endLine: chars.line,
      endColumn: chars.column
    }
  }

  if (current === '=') {
    return {
      type: 'ASSIGNATION',
      value: chars.advance(),
      startLine: line,
      startColumn: column,
      endLine: chars.line,
      endColumn: chars.column
    }
  }

  if (/[0-9]/.test(current)) {
    return readNumber(chars)
  }

  if (/[$a-z]/i.test(current)) {
    return readIdentifier(chars)
  }

  if (current === '"') {
    return readString(chars)
  }

  throw new ParseError(`Unexpected character '${current}'`, line, column)
}

export default function tokenizer (chars) {
  let previous = {}
  let current = getNextToken(chars, previous)

  return {
    get current () {
      return current
    },

    check (type, value) {
      if (type != null && type !== current.type) {
        return false
      }

      if (value != null) {
        if (Array.isArray(value)) {
          return value.includes(current.value)
        } else if (value !== current.value) {
          return false
        }
      }

      return true
    },

    advance (type, value) {
      if (type && current.type !== type) {
        throw new ParseError(
          `Expected a token with type '${type}', but found '${current.type}'`,
          current.startLine,
          current.startColumn,
          current.endLine,
          current.endColumn
        )
      }

      if (value != null) {
        if (Array.isArray(value)) {
          if (!value.includes(current.value)) {
            throw new ParseError(
              `Expected a token with a set of values, but found '${current.value}'`,
              current.startLine,
              current.startColumn,
              current.endLine,
              current.endColumn
            )
          }
        } else if (current.value !== value) {
          throw new ParseError(
            `Expected a token with value '${value}', but found '${current.value}'`,
            current.startLine,
            current.startColumn,
            current.endLine,
            current.endColumn
          )
        }
      }

      previous = current
      current = getNextToken(chars, previous)
      while (current.type === 'COMMENT') current = getNextToken(chars, previous)
      return previous
    }
  }
}
