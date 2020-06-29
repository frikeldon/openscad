import * as primitive3d from './primitive3d'
import * as transformation from './transformation'
import * as other from './other'

const modules = []

for (const name in primitive3d) modules.push([name, primitive3d[name]])
for (const name in transformation) modules.push([name, transformation[name]])
for (const name in other) modules.push([name, other[name]])

export default modules
