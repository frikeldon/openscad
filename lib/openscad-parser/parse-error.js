export default class ParseError extends Error {
  constructor (message, startLine, startColumn, endLine = startLine, endColumn = startColumn + 1) {
    super(`${message}. At line ${startLine} column ${startColumn}.`)
    this.displayMessage = message
    this.startLine = startLine
    this.startColumn = startColumn
    this.endLine = endLine
    this.endColumn = endColumn
  }
}
