import Environment from './environment'
import builtinVariables from './builtin/variables'
import builtinFunctions from './builtin/functions'
import builtinModules from './builtin/modules'
import * as processors from './processors'
import clean from './clean'

export default function OpenSCADInterpreter (ast) {
  const environment = Environment(builtinVariables, builtinFunctions, builtinModules)
  environment.pushProcess(ast)

  while (environment.hasProcess()) {
    const process = environment.topProcess()
    const nodeType = process.node.type

    if (!(nodeType in processors)) {
      throw new Error(`Interpreter visitor for node type '${nodeType}' is not implemented.`)
    }

    process.count += 1

    const processor = processors[nodeType]
    if (typeof processor === 'function') {
      processor(environment, process.node)
    } else {
      const step = processor[process.count]
      if (step) {
        step(environment, process.node)
      } else {
        throw new Error(`Processor '${nodeType}' has no step ${process.count}`)
      }
    }
  }

  return clean(environment.destroyContext())
}
