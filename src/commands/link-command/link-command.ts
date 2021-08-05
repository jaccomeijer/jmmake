/**
 * - Lookup all workspace packages
 * - Create symlinks in node_modules to all package/build folders
 */

import { getFromArborist } from '../../lib/arborist'
import { confirm } from './confirm'
import { linkNodes } from './link-nodes'

export interface LinkCommand {
  monoRepoPath: string
}

export const linkCommand = async ({ monoRepoPath }: LinkCommand) => {
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

  const isConfirmed = await confirm({ nodes })
  if (!isConfirmed) return
  linkNodes({ nodes })
}
