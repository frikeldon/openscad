import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return './editor.worker.bundle.js'
  }
}

export default monaco
