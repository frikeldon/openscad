import CodeEditor from '../code-editor'
import ModelViewer from '../model-viewer'
import OpenSCADParser from '../openscad-parser'
import OpenSCADInterpreter from '../openscad-interpreter'
import CsgThree from '../csg-three'

function Logger (container) {
  return {
    clear () {
      container.textContent = ''
    },
    log (message) {
      const pre = document.createElement('PRE')
      pre.textContent = message
      container.appendChild(pre)
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const logger = Logger(document.getElementById('logger'))
  const codeEditor = CodeEditor(document.getElementById('codeEditor'))
  const modelViewer = ModelViewer(document.getElementById('modelViewer'))

  codeEditor.addChangeHandler(function () {
    logger.clear()
    try {
      const ast = OpenSCADParser(codeEditor.getValue())
      const csg = OpenSCADInterpreter(ast)
      const meshes = CsgThree(csg)
      modelViewer.setMeshes(meshes)
    } catch (error) {
      modelViewer.setMeshes()
      codeEditor.setErrorMark(error)
      logger.log(JSON.stringify(error))
    }
  })
})
