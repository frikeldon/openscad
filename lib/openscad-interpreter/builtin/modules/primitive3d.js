export const cube = {
  parameters: [
    { name: 'size', value: [1, 1, 1] },
    { name: 'center', value: false }
  ],
  unnamedParameters: ['size', 'center'],
  method (environment, children, size, center) {
    if (typeof size === 'number' || (Array.isArray(size) && size.length === 3)) {
      const sizeSel = typeof size === 'number'
        ? [size, size, size]
        : size
      const centerSel = center === true
      return {
        type: 'primitive',
        object: 'cube',
        size: sizeSel,
        center: centerSel
      }
    }
  }
}
