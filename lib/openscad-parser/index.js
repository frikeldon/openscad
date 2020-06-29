import CharStream from './char-stream'
import TokenStream from './token-stream'
import Parser from './parser'

export default function OpenSCADParser (code) {
  const charStream = CharStream(code)
  const tokenStream = TokenStream(charStream)
  const ast = Parser(tokenStream)
  return ast
}
