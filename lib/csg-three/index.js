import * as primitive from './primitive'
import * as operation from './operation'

const types = { primitive, operation }

function visit (visitor, node) {
  if (node.type in types) {
    const type = types[node.type]
    if (node.object in type) {
      return type[node.object](visitor, node)
    }
    throw new Error(`CsgThree visitor of type '${node.type}' for node object '${node.object}' is not implemented.`)
  }
  throw new Error(`CsgThree visitor for node type '${node.type}' is not implemented.`)
}

export default function CsgThree (csg) {
  const meshes = []
  for (const object of csg) meshes.push(visit(visit, object))
  return meshes
}
