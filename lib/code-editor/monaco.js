import * as monaco from 'monaco-editor'

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return './editor.worker.bundle.js'
  }
}

export default monaco
