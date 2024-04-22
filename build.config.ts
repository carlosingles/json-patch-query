import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/JSONPatchQuery.ts',
  ],
  rollup: {
    emitCJS: true,
  },
  declaration: true,
})