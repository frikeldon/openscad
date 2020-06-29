import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function Player (container) {
  const { clientWidth: width, clientHeight: height } = container
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.up = new THREE.Vector3(0, 0, 1)
  let meshes = []

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.setClearColor(0xffffff, 1)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.2))

  const light = new THREE.PointLight(0xffffff, 0.7)
  camera.add(light)
  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)

  camera.position.x = 5
  camera.position.y = 5
  camera.position.z = 3

  const gridHelper = new THREE.GridHelper(100, 100)
  gridHelper.rotateX(Math.PI / 2)
  scene.add(gridHelper)

  const animate = function () {
    window.requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()

  return {
    setMeshes (newMeshes) {
      for (const oldMesh of meshes) scene.remove(oldMesh)
      meshes = newMeshes || []
      if (newMeshes) {
        for (const newMesh of meshes) scene.add(newMesh)
      }
    }
  }
}
