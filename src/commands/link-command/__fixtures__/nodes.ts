import { ArboristNode } from '../../../lib/arborist'

export const nodes: ArboristNode[] = [
  {
    package: {
      name: 'package-a',
    },
    path: './package-a',
    edgesOut: new Set([]),
  },
  {
    package: {
      name: 'package-b',
    },
    path: './package-b',
    edgesOut: new Set([]),
  },
]
