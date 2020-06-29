function createAccesor (stack, type) {
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
  return {
    [`set${capitalized}`] (name, value) {
      const vault = stack[stack.length - 1][type]
      vault.set(name, value)
    },
    [`get${capitalized}`] (name) {
      let index = stack.length - 1
      while (index >= 0) {
        const vault = stack[index][type]
        if (vault.has(name)) {
          return vault.get(name)
        }
        index -= 1
      }
    }
  }
}

export default function Environment (builtinVariables, builtinFunctions, builtinModules) {
  const processStack = []
  const valueStack = []
  const contextStack = [{
    variable: new Map(builtinVariables),
    function: new Map(builtinFunctions),
    module: new Map(builtinModules),
    objects: [],
    children: null
  }]

  return {
    processStack,
    // Process
    pushProcess (...nodes) {
      for (let index = nodes.length - 1; index >= 0; index -= 1) {
        const node = nodes[index]
        if (node) {
          processStack.push({ node, count: -1 })
        }
      }
    },
    popProcess () {
      return processStack.pop().node
    },
    topProcess () {
      return processStack[processStack.length - 1]
    },
    hasProcess () {
      return processStack.length > 0
    },

    // Value
    pushValue (...value) {
      valueStack.push(...value)
    },
    popValue () {
      return valueStack.pop()
    },
    unstackValues (quantity) {
      return valueStack.splice(valueStack.length - quantity)
    },

    // Context
    extendContext () {
      contextStack.push({
        variable: new Map(),
        function: new Map(),
        module: new Map(),
        objects: [],
        children: null
      })
    },
    destroyContext () {
      return contextStack.pop().objects
    },
    ...createAccesor(contextStack, 'variable'),
    ...createAccesor(contextStack, 'function'),
    ...createAccesor(contextStack, 'module'),
    pushObject (object) {
      const context = contextStack[contextStack.length - 1]
      context.objects.push(object)
    },
    popObject () {
      const context = contextStack[contextStack.length - 1]
      return context.objects.pop()
    },
    setChildren (value) {
      contextStack[contextStack.length - 1].children = value
    },
    getChildren () {
      let index = contextStack.length - 1
      while (index >= 0) {
        if (contextStack[index].children != null) {
          return contextStack[index].children
        }
        index -= 1
      }

      return null
    }
  }
}
