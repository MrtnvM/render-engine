import babelTraverse from '@babel/traverse'

// const traverseModule = await import('@babel/traverse')
// let traverseFunction = traverseModule.default

// // Fix of loading @babel/traverse
// if (!traverseFunction) {
//   const anyTraverse: any = traverseModule.default

//   if (anyTraverse?.default) {
//     traverseFunction = anyTraverse.default
//     console.log('Loaded @babel/traverse default.default')
//   } else if (anyTraverse) {
//     traverseFunction = anyTraverse.default
//     console.log('Loaded @babel/traverse default')
//   } else {
//     traverseFunction = traverseModule as any
//     console.log('Loaded @babel/traverse')
//   }
// }

export const traverse = babelTraverse || (babelTraverse as any).default || (babelTraverse as any).default.default
//export const traverse = traverseFunction
