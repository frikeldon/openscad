import { Group } from 'three'

export function translate (visitor, node) {
  const group = new Group()
  for (const child of node.children) group.add(visitor(visitor, child))
  group.translateX(node.translation[0])
  group.translateY(node.translation[1])
  group.translateZ(node.translation[2])
  return group
}

export function group (visitor, node) {
  const group = new Group()
  for (const object of node.objects) group.add(visitor(visitor, object))
  return group
}
