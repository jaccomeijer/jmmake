/**
 * - Lookup all workspace packages
 * - Sync root package.json values to all packages in monorepo
 */

import { getFromArborist } from '../../lib/arborist'
import { confirm } from './confirm'
import { syncNodes } from './sync-nodes'

export interface SyncCommand {
  monoRepoPath: string
}

export const syncCommand = async ({ monoRepoPath }: SyncCommand) => {
  const { rootNode, fsChildren } = await getFromArborist({ path: monoRepoPath })
  if (!rootNode) {
    console.log(
      `An error occured getting nodes` + monoRepoPath
        ? `from path ${monoRepoPath}`
        : ''
    )
    return
  }
  const nodes = fsChildren
  if (nodes.length === 0) {
    console.log(`No npm packages found at path ${monoRepoPath}`)
    return
  }
  const isConfirmed = await confirm({
    nodes,
    rootNode,
  })
  if (!isConfirmed) return
  syncNodes({ rootNode, nodes })
}
