import CodeEditor from '../code-editor'

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

  codeEditor.addChangeHandler(function () {
    logger.clear()
    logger.log(codeEditor.getValue())
  })
})
