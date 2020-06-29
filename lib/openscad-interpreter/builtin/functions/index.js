import * as typeTest from './type-test'
import * as general from './general'
import * as mathematical from './mathematical'

const functions = []

for (const name in typeTest) functions.push([name, typeTest[name]])
for (const name in general) functions.push([name, general[name]])
for (const name in mathematical) functions.push([name, mathematical[name]])

export default functions
