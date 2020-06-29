import ParseError from './parse-error'

const operatorPrecedence = { '||': 2, '&&': 3, '<': 7, '>': 7, '<=': 7, '>=': 7, '==': 7, '!=': 7, '+': 10, '-': 10, '*': 20, '/': 20, '%': 20 }

// number: NUMBER
function parseNumber (tokens) {
  return {
    type: 'number',
    value: tokens.advance('NUMBER')
  }
}

// string: STRING
function parseString (tokens) {
  return {
    type: 'string',
    value: tokens.advance('STRING')
  }
}

// boolean: KEYWORD<true|false>
function parseBoolean (tokens) {
  return {
    type: 'boolean',
    value: tokens.advance('KEYWORD', ['true', 'false'])
  }
}

// undef: KEYWORD<undef>
function parseUndef (tokens) {
  return {
    type: 'undef',
    value: tokens.advance('KEYWORD', 'undef')
  }
}

// variable: IDENTIFIER
function parseVariable (tokens) {
  return {
    type: 'variable',
    value: tokens.advance('IDENTIFIER')
  }
}

// range: PUNCTUATION<[> expression (PUNCTUATION<:> expression){1,2} PUNCTUATION<]>
// vector: PUNCTUATION<[> (expression (PUNCTUATION<,> expression)*)? PUNCTUATION<]>
function parseVectorOrRange (tokens) {
  const values = []
  let first = true
  let separator = null

  const startToken = tokens.advance('PUNCTUATION', '[')
  while (!tokens.check('EOF')) {
    if (tokens.check('PUNCTUATION', ']')) break

    if (first) first = false
    else if (separator !== null) tokens.advance('PUNCTUATION', separator)
    else separator = tokens.advance('PUNCTUATION', [',', ':']).value

    values.push(parseExpression(tokens))
  }
  const endToken = tokens.advance('PUNCTUATION', ']')

  // range: PUNCTUATION<[> expression (PUNCTUATION<:> expression){1,2} PUNCTUATION<]>
  if (separator === ':') {
    if (values.length === 2) {
      const [start, end] = values
      return { type: 'range', start, increment: undefined, end }
    }
    if (values.length === 3) {
      const [start, increment, end] = values
      return { type: 'range', start, increment, end }
    }
    throw new ParseError(
      'Range not well formatted.',
      startToken.startLine,
      startToken.startColumn,
      endToken.endLine,
      endToken.endColumn
    )
  }

  // vector: PUNCTUATION<[> (expression (PUNCTUATION<,> expression)*)? PUNCTUATION<]>
  return { type: 'vector', values: values }
}

// functionCall(identifier): (?<=identifier) parameterList
function parseFunctionCall (tokens, identifier) {
  const parameters = parseParameterList(tokens)
  return {
    type: 'functionCall',
    name: identifier,
    parameters
  }
}

// atom: PUNCTUATION<(> expression PUNCTUATION<)>
//     | unaryOp
//     | vector
//     | range
//     | number
//     | string
//     | boolean
//     | functionCall(identifier)
//     | variable
//     | undef
function parseAtom (tokens) {
  // atom: PUNCTUATION<(> expression PUNCTUATION<)>
  if (tokens.check('PUNCTUATION', '(')) {
    tokens.advance('PUNCTUATION', '(')
    const expression = parseExpression(tokens)
    tokens.advance('PUNCTUATION', ')')
    return expression
  }

  // atom: unaryOp
  if (tokens.check('OPERATOR', ['+', '-', '!'])) return parseUnaryOp(tokens)

  // atom: vector
  // atom: range
  if (tokens.check('PUNCTUATION', '[')) return parseVectorOrRange(tokens)

  // atom: number
  if (tokens.check('NUMBER')) return parseNumber(tokens)

  // atom: string
  if (tokens.check('STRING')) return parseString(tokens)

  // atom: boolean
  if (tokens.check('KEYWORD', ['true', 'false'])) return parseBoolean(tokens)

  if (tokens.check('IDENTIFIER')) {
    const variable = parseVariable(tokens)
    // atom: functionCall(identifier)
    if (tokens.check('PUNCTUATION', '(')) return parseFunctionCall(tokens, variable.value)

    // atom: variable
    return variable
  }

  // atom: undef
  if (tokens.check('KEYWORD', 'undef')) return parseUndef(tokens)

  throw new ParseError(
    `Unexpected token ${tokens.current.type}.`,
    tokens.current.startLine,
    tokens.current.startColumn,
    tokens.current.endLine,
    tokens.current.endColumn
  )
}

// maybeIndexAccessor(target): (?<=target) PUNCTUATION<[> expression PUNCTUATION<]>
//                           | (?<=target)
function maybeIndexAccessor (tokens, target) {
  // maybeIndexAccessor(target): (?<=target) PUNCTUATION<[> expression PUNCTUATION<]>
  if (tokens.check('PUNCTUATION', '[')) {
    tokens.advance('PUNCTUATION', '[')
    const index = parseExpression(tokens)
    tokens.advance('PUNCTUATION', ']')
    return {
      type: 'indexAccessor',
      index,
      target
    }
  }
  // maybeIndexAccessor(target): (?<=target)
  return target
}

// maybePropertyAccessor(target): (?<=target) PUNCTUATION<.> IDENTIFIER
//                              | (?<=target)
function maybePropertyAccessor (tokens, target) {
  // maybePropertyAccessor(target): (?<=target) PUNCTUATION<.> IDENTIFIER
  if (tokens.check('PUNCTUATION', '.')) {
    tokens.advance('PUNCTUATION', '.')
    return {
      type: 'propertyAccessor',
      property: tokens.advance('IDENTIFIER'),
      target
    }
  }
  // maybePropertyAccessor(target): (?<=target)
  return target
}

// factor: maybePropertyAccessor(maybeIndexAccessor(atom))
function parseFactor (tokens) {
  const possibleIndexAccessor = maybeIndexAccessor(tokens, parseAtom(tokens))
  return maybePropertyAccessor(tokens, possibleIndexAccessor)
}

// unaryOp: OPERATOR[+,-] factor
function parseUnaryOp (tokens) {
  return {
    type: 'unaryOp',
    operator: tokens.advance('OPERATOR', ['+', '-', '!']),
    value: parseFactor(tokens)
  }
}

// maybeBinaryOp(left): (?<=left) OPERATOR factor
//                    | (?<=left)
function maybeBinaryOp (tokens, left, precedence = 0) {
  // maybeBinaryOp(left): (?<=left) OPERATOR factor
  if (tokens.check('OPERATOR', Object.keys(operatorPrecedence))) {
    const nextPrecendence = operatorPrecedence[tokens.current.value]
    if (nextPrecendence > precedence) {
      const operator = tokens.advance('OPERATOR')
      const right = maybeBinaryOp(tokens, parseFactor(tokens), nextPrecendence)
      const binaryToken = {
        type: 'binaryOp',
        operator: operator,
        left,
        right
      }
      return maybeBinaryOp(tokens, binaryToken, precedence)
    }
  }

  // maybeBinaryOp(left): (?<=left)
  return left
}

// maybeTernaryOp(condition): (?<=condition) OPERATOR<?> factor PUNCTUATION<:> factor
//                          | (?<=condition)
function maybeTernaryOp (tokens, condition) {
  // maybeTernaryOp(condition): (?<=condition) OPERATOR<?> factor PUNCTUATION<:> factor
  if (tokens.check('OPERATOR', '?')) {
    tokens.advance('OPERATOR', '?')
    const right = parseExpression(tokens)
    tokens.advance('PUNCTUATION', ':')
    const wrong = parseExpression(tokens)
    return { type: 'ternaryOp', condition, right, wrong }
  }

  // maybeTernaryOp(condition): (?<=condition)
  return condition
}

// expression: maybeTernaryOp(maybeBinaryOp(factor))
function parseExpression (tokens) {
  const possibleBinaryOp = maybeBinaryOp(tokens, parseFactor(tokens))
  return maybeTernaryOp(tokens, possibleBinaryOp)
}

// assignation(variable): (?<=variable) ASSIGNATION<=> expression
function parseAssignation (tokens, identifier) {
  tokens.advance('ASSIGNATION', '=')
  const value = parseExpression(tokens)
  return { type: 'assignation', variable: identifier, value }
}

// assignationSentence(variable): assignation(variable) PUNCTUATION<;>
function parseAssignationSentence (tokens, identifier) {
  const assignation = parseAssignation(tokens, identifier)
  tokens.advance('PUNCTUATION', ';')
  return assignation
}

// block: PUNCTUATION<{> sentence* PUNCTUATION<}>
function parseBlock (tokens) {
  const sentences = []
  tokens.advance('PUNCTUATION', '{')
  while (!tokens.check('PUNCTUATION', '}')) {
    sentences.push(parseSentence(tokens))
  }
  tokens.advance('PUNCTUATION', '}')

  return { type: 'block', sentences }
}

// conditionalBody: block
//                | moduleCall(identifier)
function parseConditionalBody (tokens) {
  // conditionalBody: block
  if (tokens.check('PUNCTUATION', '{')) return parseBlock(tokens)

  // conditionalBody: moduleCall(identifier)
  const identifier = tokens.advance('IDENTIFIER')
  return parseModuleCall(tokens, identifier)
}

// conditional: KEYWORD<if> PUNCTUATION<(> conditionalBody PUNCTUATION<)> conditionalBody (KEYWORD<else> sentence)?
function parseConditional (tokens) {
  tokens.advance('KEYWORD', 'if')
  tokens.advance('PUNCTUATION', '(')
  const condition = parseExpression(tokens)
  tokens.advance('PUNCTUATION', ')')
  const pass = parseConditionalBody(tokens)
  let fail = null
  if (tokens.check('KEYWORD', 'else')) {
    tokens.advance('KEYWORD', 'else')
    fail = parseConditionalBody(tokens)
  }
  return { type: 'conditional', condition, pass, fail }
}

// parameter: IDENTIFIER ASSIGNATION<=> expression
//          | expression
function parseParameter (tokens) {
  const node = parseExpression(tokens)

  // parameter: IDENTIFIER ASSIGNATION<=> expression
  if (node.type === 'variable' && tokens.check('ASSIGNATION', '=')) {
    tokens.advance('ASSIGNATION', '=')
    const value = parseExpression(tokens)
    return { type: 'parameter', name: node.value, value }
  }

  // parameter: expression
  return { type: 'parameter', name: undefined, value: node }
}

// parameterList: PUNCTUATION<(> (parameter (PUNCTUATION<,> parameter)*)? PUNCTUATION<)>
function parseParameterList (tokens) {
  const parameters = []
  let first = true

  tokens.advance('PUNCTUATION', '(')
  while (!tokens.check('EOF')) {
    if (tokens.check('PUNCTUATION', ')')) break

    if (first) first = false
    else tokens.advance('PUNCTUATION', ',')

    parameters.push(parseParameter(tokens))
  }
  tokens.advance('PUNCTUATION', ')')
  return parameters
}

// parameterDefinition: IDENTIFIER ASSIGNATION<=> expression
//                    | IDENTIFIER
function parseParameterDefinition (tokens) {
  const name = tokens.advance('IDENTIFIER')

  // parameterDefinition: IDENTIFIER ASSIGNATION<=> expression
  if (tokens.check('ASSIGNATION', '=')) {
    tokens.advance('ASSIGNATION', '=')
    return { type: 'parameterDefinition', name, value: parseExpression(tokens) }
  }

  // parameterDefinition: IDENTIFIER
  return { type: 'parameterDefinition', name, value: undefined }
}

// parseParameterDefinitionList: PUNCTUATION<(> (parameterDefinition (PUNCTUATION<,> parameterDefinition)*)? PUNCTUATION<)>
function parseParameterDefinitionList (tokens) {
  const parameters = []
  let first = true

  tokens.advance('PUNCTUATION', '(')
  while (!tokens.check('EOF')) {
    if (tokens.check('PUNCTUATION', ')')) break

    if (first) first = false
    else tokens.advance('PUNCTUATION', ',')

    parameters.push(parseParameterDefinition(tokens))
  }
  tokens.advance('PUNCTUATION', ')')
  return parameters
}

// functionDefinition: KEYWORD<function> IDENTIFIER parseParameterDefinitionList ASSIGNATION<=> expression PUNCTUATION<;>
function parseFunctionDefinition (tokens) {
  tokens.advance('KEYWORD', 'function')
  const name = tokens.advance('IDENTIFIER')
  const parameters = parseParameterDefinitionList(tokens)
  tokens.advance('ASSIGNATION', '=')
  const expression = parseExpression(tokens)
  tokens.advance('PUNCTUATION', ';')
  return { type: 'functionDefinition', name, parameters, expression }
}

// moduleDefinition: KEYWORD<module> IDENTIFIER parseParameterDefinitionList sentence
function parseModuleDefinition (tokens) {
  tokens.advance('KEYWORD', 'module')
  const name = tokens.advance('IDENTIFIER')
  const parameters = parseParameterDefinitionList(tokens)
  const body = parseSentence(tokens)
  return { type: 'moduleDefinition', name, parameters, body }
}

// moduleCall(identifier): (?<=identifier) parameterList moduleCall(IDENTIFIER)
//                       | (?<=identifier) parameterList block
//                       | (?<=identifier) parameterList PUNCTUATION<;>
function parseModuleCall (tokens, identifier) {
  const parameters = parseParameterList(tokens)

  // moduleCall(identifier): (?<=identifier) parameterList moduleCall(IDENTIFIER)
  if (tokens.check('IDENTIFIER')) {
    const childIdentifier = tokens.advance('IDENTIFIER')
    return {
      type: 'moduleCall',
      name: identifier,
      parameters,
      children: parseModuleCall(tokens, childIdentifier)
    }
  }

  // moduleCall(identifier): (?<=identifier) parameterList block
  if (tokens.check('PUNCTUATION', '{')) {
    return {
      type: 'moduleCall',
      name: identifier,
      parameters,
      children: parseBlock(tokens)
    }
  }

  // moduleCall(identifier): (?<=identifier) parameterList PUNCTUATION<;>
  tokens.advance('PUNCTUATION', ';')
  return {
    type: 'moduleCall',
    name: identifier,
    parameters,
    children: undefined
  }
}

// emtpy: PUNCTUATION<;>
function parseEmpty (tokens) {
  tokens.advance('PUNCTUATION', ';')
  return { type: 'empty' }
}

// sentence: functionDefinition
//         | moduleDefinition
//         | conditional
//         | assignationSentence(IDENTIFIER)
//         | moduleCall(IDENTIFIER)
//         | block
//         | empty
function parseSentence (tokens) {
// sentence: functionDefinition
  if (tokens.check('KEYWORD', 'function')) {
    return parseFunctionDefinition(tokens)
  }

  // sentence: moduleDefinition
  if (tokens.check('KEYWORD', 'module')) {
    return parseModuleDefinition(tokens)
  }

  // sentence: conditional
  if (tokens.check('KEYWORD', 'if')) {
    return parseConditional(tokens)
  }

  if (tokens.check('IDENTIFIER')) {
    const variable = tokens.advance('IDENTIFIER')

    // sentence: assignationSentence(IDENTIFIER)
    if (tokens.check('ASSIGNATION', '=')) {
      return parseAssignationSentence(tokens, variable)
    }

    // sentence: moduleCall(IDENTIFIER)
    if (tokens.check('PUNCTUATION', '(')) {
      return parseModuleCall(tokens, variable)
    }
  }

  // sentence: block
  if (tokens.check('PUNCTUATION', '{')) {
    return parseBlock(tokens)
  }

  // sentence: empty
  return parseEmpty(tokens)
}

// program: sentence*
function parseProgram (tokens) {
  const sentences = []
  while (!tokens.check('EOF')) {
    sentences.push(parseSentence(tokens))
  }
  return { type: 'program', sentences }
}

export default function parser (tokens) {
  return parseProgram(tokens)
}
