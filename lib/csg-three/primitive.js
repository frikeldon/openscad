import { BoxGeometry, MeshPhongMaterial, Mesh } from 'three'

export function cube (visitor, node) {
  const geometry = new BoxGeometry(node.size[0], node.size[1], node.size[2])
  const material = new MeshPhongMaterial({ shininess: 80, color: 0x92ffb2 })
  const object = new Mesh(geometry, material)
  if (!node.center) {
    object.translateX(node.size[0] / 2)
    object.translateY(node.size[1] / 2)
    object.translateZ(node.size[2] / 2)
  }
  return object
}
