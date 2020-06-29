import ParseError from './parse-error'

export default function charStream (text) {
  let position = 0
  let line = 1
  let column = 1

  return {
    get current () {
      const current = text.charAt(position)
      if (current === '\r' && text.charAt(position + 1) === '\n') {
        return '\n'
      }
      return current
    },

    get next () {
      return text.charAt(position + 1)
    },

    get eof () {
      return position >= text.length
    },

    get line () {
      return line
    },

    get column () {
      return column
    },

    advance (char) {
      const current = text.charAt(position)
      position += 1

      if (current === '\n') {
        line += 1
        column = 1
        if (char && char !== current) {
          throw ParseError(`Exepected character '${char}' and found '${current}'`, line, column)
        }
        return current
      }

      if (current === '\r') {
        line += 1
        column = 1

        const next = text.charAt(position)
        if (next === '\n') {
          position += 1
          if (char && char !== next) {
            throw new ParseError(`Exepected character '${char}' and found '${next}'`, line, column)
          }
          return next
        }

        if (char && char !== current) {
          throw new ParseError(`Exepected character '${char}' and found '${current}'`, line, column)
        }
        return current
      }

      if (char && char !== current) {
        throw new ParseError(`Exepected character '${char}' and found '${current}'`, line, column)
      }

      column += 1
      return current
    }
  }
}
