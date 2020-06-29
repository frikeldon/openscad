import monaco from './monaco'

export default function CodeEditor (container) {
  const changeHandlers = []

  const editor = monaco.editor.create(container, { value: '' })

  editor.onDidChangeModelContent(function () {
    monaco.editor.setModelMarkers(editor.getModel(), 'error', [])

    for (const handler of changeHandlers) {
      handler(editor)
    }
  })

  return {
    getValue () {
      return editor.getValue()
    },
    addChangeHandler (handler) {
      if (typeof handler === 'function') {
        changeHandlers.push(handler)
      } else {
        throw new Error(`Expected a function but found a '${typeof handler}'`)
      }
    },
    removeChangeHandler (handler) {
      const index = changeHandlers.indexOf(handler)
      if (index >= 0) {
        changeHandlers.splice(index, 1)
      }
    },
    setErrorMark (error) {
      monaco.editor.setModelMarkers(editor.getModel(), 'error', [{
        message: error.displayMessage,
        startLineNumber: error.startLine,
        startColumn: error.startColumn,
        endLineNumber: error.endLine,
        endColumn: error.endColumn,
        severity: monaco.MarkerSeverity.Error
      }])
    }
  }
}
