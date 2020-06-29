const visitors = {
  operation: {
    translate (node) {
      if (!node.children || node.children.length === 0) return

      const children = []
      for (const child of node.children) {
        const object = visit(child)
        if (object) children.push(object)
      }
      if (children.length === 0) return

      if (node.translation[0] === 0 && node.translation[1] === 0 && node.translation[2] === 0) {
        return {
          type: 'operation',
          object: 'group',
          objects: children
        }
      }

      return { ...node, children }
    },
    group (node) {
      if (!node.objects || node.objects.length === 0) return
      const objects = []
      for (const child of node.objects) {
        const object = visit(child)
        if (object) objects.push(object)
      }
      return { ...node, objects }
    }
  },
  primitive: {
    cube (node) {
      return node
    }
  }
}

function visit (node) {
  if (node) {
    if (node.type in visitors) {
      const type = visitors[node.type]
      if (node.object in type) {
        return type[node.object](node)
      }
      throw new Error(`CsgThree cleanner visitor of type '${node.type}' for node object '${node.object}' is not implemented.`)
    }
    throw new Error(`CsgThree cleanner visitor for node type '${node.type}' is not implemented.`)
  }
}

export default function clean (csg) {
  const objects = []
  for (const child of csg) {
    if (child) {
      const object = visit(child)
      if (Object) objects.push(object)
    }
  }
  return objects
}
