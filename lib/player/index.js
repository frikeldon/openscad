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
  logger.clear()
})
