export const translate = {
  parameters: [{ name: 'v' }],
  unnamedParameters: ['v'],
  method (environment, children, v) {
    if (Array.isArray(v) && (v.length === 2 || v.length === 3)) {
      const translation = v.length === 2
        ? [...v, 0]
        : v
      return {
        type: 'operation',
        object: 'translate',
        translation,
        children
      }
    }
  }
}
