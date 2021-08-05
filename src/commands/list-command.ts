/**
 * - Lookup all workspace packages
 * - List all packages
 */

import { getFromArborist } from '../lib/arborist'

export interface ListCommand {
  monoRepoPath: string
}

export const listCommand = async ({ monoRepoPath }: ListCommand) => {
  const { rootNode, fsChildren } = await getFromArborist({ path: monoRepoPath })

  if (!rootNode) {
    console.log(
      `An error occured getting nodes from ` +
        (monoRepoPath ? `${monoRepoPath}` : 'current folder')
    )
    return
  }
  let nodes = fsChildren
  // When this is not a monorepo, use the root node
  if (nodes.length === 0) nodes = [rootNode]

  for (const node of nodes) console.log(node.package.name)
}
