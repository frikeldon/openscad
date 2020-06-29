import binaryOperation from './binary-operation'
import { createGroup } from './builtin/utils'

function registerParameters (environment, parameterDefinitions, parameters) {
  for (const param of parameterDefinitions) {
    environment.setVariable(param.name.value, param.value)
  }

  if (parameters) {
    let annonymous = 0
    for (let index = 0; index < parameters.length; index += 1) {
      const param = parameters[index]
      if (param.name) {
        environment.setVariable(param.name.value, param.value)
      } else if (annonymous < parameterDefinitions.length) {
        environment.setVariable(parameterDefinitions[annonymous].name.value, param.value)
        annonymous += 1
      }
    }
  }
}

function getBuiltinModuleParameters (parameterDefinitions, parameters) {
  const params = []

  for (const param of parameterDefinitions) params.push(param.value)

  let annonymous = 0
  for (let index = 0; index < parameters.length; index += 1) {
    const param = parameters[index]
    let name
    if (param.name) {
      name = param.name.value
    } else if (annonymous < parameterDefinitions.length) {
      name = parameterDefinitions[annonymous].name
      annonymous += 1
    } else {
      continue
    }
    const position = parameterDefinitions.findIndex((param) => param.name === name)
    if (position >= 0) {
      params[position] = param.value
    }
  }

  return params
}

export function empty (environment) {
  environment.popProcess()
}

export function number (environment, node) {
  environment.pushValue(node.value.value)
  environment.popProcess()
}

export function string (environment, node) {
  environment.pushValue(node.value.value)
  environment.popProcess()
}

export function boolean (environment, node) {
  switch (node.value.value) {
    case 'true':
      environment.pushValue(true)
      break
    case 'false':
      environment.pushValue(false)
      break
    default:
      throw new Error(`Invalid boolean value '${node.value.value}'`)
  }
  environment.popProcess()
}

export function undef (environment) {
  environment.pushValue(undefined)
  environment.popProcess()
}

export function variable (environment, node) {
  const value = environment.getVariable(node.value.value)
  environment.pushValue(value)
  environment.popProcess()
}

export const vector = [
  function vector1 (environment, node) {
    environment.pushProcess(...node.values)
  },
  function vector2 (environment, node) {
    const quantity = node.values.length
    const values = environment.unstackValues(quantity)
    environment.pushValue(values)
    environment.popProcess()
  }
]

export const range = [
  function range1 (environment, node) {
    environment.pushProcess(node.start, node.increment, node.end)
  },
  function range2 (environment, node) {
    const end = environment.popValue()
    const increment = node.increment
      ? environment.popValue()
      : 1
    const start = environment.popValue()

    if (!node.increment && start > end) {
      environment.pushValue({ type: 'range', start: end, increment, end: start })
    } else {
      environment.pushValue({ type: 'range', start, increment, end })
    }

    environment.popProcess()
  }
]

export const functionCall = [
  function functionCall1 (environment, node) {
    const func = environment.getFunction(node.name.value)

    if (!func) {
      environment.pushValue(undefined)
      environment.popProcess()
      return
    }

    if (node.parameters.length > 0) {
      environment.pushProcess(...node.parameters)
    }
  },
  function functionCall2 (environment, node) {
    const func = environment.getFunction(node.name.value)
    const quantity = node.parameters.length
    const parameters = environment.unstackValues(quantity)

    if (func.method) {
      if (func.parametersCount === -1 || func.parametersCount === parameters.length) {
        environment.pushValue(func.method(...parameters))
      } else {
        environment.pushValue(undefined)
      }
      environment.popProcess()
    } else {
      environment.extendContext()
      registerParameters(environment, func.parameters, parameters)
      environment.pushProcess(func.expression)
    }
  },
  function functionCall3 (environment) {
    environment.destroyContext()
    environment.popProcess()
  }
]

export const indexAccessor = [
  function indexAccessor1 (environment, node) {
    environment.pushProcess(node.index, node.target)
  },
  function indexAccessor2 (environment) {
    const target = environment.popValue()
    const index = environment.popValue()
    environment.pushValue(target[index])
    environment.popProcess()
  }
]

export const propertyAccessor = [
  function propertyAccessor1 (environment, node) {
    environment.pushProcess(node.target)
  },
  function propertyAccessor2 (environment, node) {
    const target = environment.popValue()
    switch (node.property.value) {
      case 'x':
        environment.pushValue(target[0])
        break
      case 'y':
        environment.pushValue(target[1])
        break
      case 'z':
        environment.pushValue(target[2])
        break
      default:
        environment.pushValue(undefined)
    }
    environment.popProcess()
  }
]

export const unaryOp = [
  function unaryOp1 (environment, node) {
    environment.pushProcess(node.value)
  },
  function unaryOp2 (environment, node) {
    const operator = node.operator.value
    const value = environment.popValue()
    switch (operator) {
      case '+':
        environment.pushValue(+value)
        break
      case '-':
        environment.pushValue(-value)
        break
      case '!':
        environment.pushValue(!value)
        break
      default:
        throw new Error(`Unrecognized unitary operator '${operator}'`)
    }
    environment.popProcess()
  }
]

export const binaryOp = [
  function binaryOp1 (environment, node) {
    environment.pushProcess(node.left, node.right)
  },
  function binaryOp2 (environment, node) {
    const right = environment.popValue()
    const left = environment.popValue()
    const operator = node.operator.value
    environment.pushValue(binaryOperation[operator](left, right))
    environment.popProcess()
  }
]

export const ternaryOp = [
  function ternaryOp1 (environment, node) {
    environment.pushProcess(node.condition)
  },
  function ternaryOp2 (environment, node) {
    const condition = environment.popValue()
    environment.popProcess()
    environment.pushProcess(condition ? node.right : node.wrong)
  }
]

export const assignation = [
  function assignation1 (environment, node) {
    environment.pushProcess(node.value)
  },
  function assignation2 (environment, node) {
    const name = node.variable.value
    const value = environment.popValue()
    environment.setVariable(name, value)
    environment.popProcess()
  }
]

export const block = [
  function block1 (environment, node) {
    environment.extendContext()
    environment.pushProcess(...node.sentences)
  },
  function block2 (environment, node) {
    const objects = environment.destroyContext()
    if (objects.length > 0) {
      environment.pushObject(createGroup(objects))
    } else {
      environment.pushObject(undefined)
    }
    environment.popProcess()
  }
]

export const conditional = [
  function conditional1 (environment, node) {
    environment.pushProcess(node.condition)
  },
  function conditional2 (environment, node) {
    const condition = environment.popValue()
    const nextProcess = condition ? node.pass : node.fail
    environment.popProcess()
    environment.pushProcess(nextProcess)
  }
]

export const parameter = [
  function parameter1 (environment, node) {
    if (node.value) {
      environment.pushProcess(node.value)
    } else {
      environment.pushValue({ name: node.name, value: undefined })
      environment.popProcess()
    }
  },
  function parameter2 (environment, node) {
    const value = environment.popValue()
    environment.pushValue({ name: node.name, value })
    environment.popProcess()
  }
]

export const parameterDefinition = [
  function parameterDefinition1 (environment, node) {
    if (node.value) {
      environment.pushProcess(node.value)
    } else {
      environment.pushValue({ name: node.name, value: undefined })
      environment.popProcess()
    }
  },
  function parameterDefinition1 (environment, node) {
    const value = environment.popValue()
    environment.pushValue({ name: node.name, value })
    environment.popProcess()
  }
]

export const functionDefinition = [
  function functionDefinition1 (environment, node) {
    environment.pushProcess(...node.parameters)
  },
  function functionDefinition2 (environment, node) {
    const name = node.name.value
    const parameters = environment.unstackValues(node.parameters.length)
    const expression = node.expression
    environment.setFunction(name, { parameters, expression })
    environment.popProcess()
  }
]

export const moduleDefinition = [
  function moduleDefinition1 (environment, node) {
    environment.pushProcess(...node.parameters)
  },
  function moduleDefinition2 (environment, node) {
    const name = node.name.value
    const parameters = environment.unstackValues(node.parameters.length)
    const body = node.body
    environment.setModule(name, { parameters, body })
    environment.popProcess()
  }
]

export const moduleCall = [
  function moduleCall1 (environment, node) {
    const module = environment.getModule(node.name.value)

    if (!module) {
      environment.popProcess()
      environment.pushObject(undefined)
      return
    }

    if (node.parameters.length > 0) {
      environment.pushProcess(...node.parameters)
    }

    if (node.children) {
      environment.pushProcess(node.children)
    }
  },
  function moduleCall2 (environment, node) {
    const module = environment.getModule(node.name.value)
    const parameters = environment.unstackValues(node.parameters.length)
    let children = null
    if (node.children) {
      const object = environment.popObject()
      if (object) {
        children = node.children.type === 'block'
          ? object.objects
          : [object]
      }
    }
    if (module.method) {
      const params = module.parameters
        ? getBuiltinModuleParameters(module.parameters, parameters)
        : parameters
      const object = module.method(environment, children, ...params)
      environment.pushObject(object)
      environment.popProcess()
    } else {
      environment.extendContext()
      environment.setChildren(children)
      registerParameters(environment, module.parameters, parameters)
      const sentences = module.body.type === 'block'
        ? module.body.sentences
        : [module.body]
      environment.pushProcess(...sentences)
    }
  },
  function moduleCall4 (environment) {
    const objects = environment.destroyContext()
    environment.pushObject(createGroup(objects))
    environment.popProcess()
  }
]

export const program = [
  function program1 (environment, node) {
    environment.extendContext()
    environment.pushProcess(...node.sentences)
  },
  function program2 (environment, node) {
    const objects = environment.destroyContext()
    environment.pushObject(...objects)
    environment.popProcess()
  }
]
