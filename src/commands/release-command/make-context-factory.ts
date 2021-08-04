import { getGitKey, parseOriginUrl } from '../../lib/github'
import {
  ArboristNode,
  getFsChild,
  getFromArborist,
  getSyncedNodes,
} from '../../lib/arborist'

export interface MakeContext {
  buildNodes: ArboristNode[]
  newChangeLogs: {
    [packageName: string]: string
  }
  rootNode: any
  targetNode?: ArboristNode
}

export interface GetMakeContext {
  targetPackageName: string
}

export const makeContextFactory = async ({
  targetPackageName,
}: GetMakeContext) => {
  const { rootNode, fsChildren } = await getFromArborist({
    path: process.cwd(),
  })
  const response = {
    newChangeLogs: {},
    rootNode,
  } as MakeContext
  let buildNodes = [] as ArboristNode[]
  let targetNode = undefined as ArboristNode | undefined

  // When this is not a monorepo, use the root node
  if (fsChildren.length === 0) {
    return { ...response, buildNodes: [rootNode], targetNode: rootNode }
  }

  if (!targetPackageName) {
    // Set all children as buildNodes, leave tagetNode undefined
    buildNodes = fsChildren
    console.log(`No package name, running with all packages`)
  } else {
    // Set targetNode
    targetNode = getFsChild({ fsChildren, packageName: targetPackageName })
    if (!targetNode) {
      // Try finding the targetNode by prefixing the packageName with the owner
      const remoteOriginUrl = <string>(
        await getGitKey({ key: 'remoteOriginUrl' })
      )
      const { owner } = parseOriginUrl({ remoteOriginUrl })
      const prefixedTargetPackageName = `@${owner}/${targetPackageName}`
      console.log(
        `Package ${targetPackageName} not found, prefixing owner: ${prefixedTargetPackageName}`
      )
      targetNode = getFsChild({
        fsChildren,
        packageName: prefixedTargetPackageName,
      })
    }
    // Set buildNodes
    if (targetNode) {
      buildNodes = [
        targetNode,
        ...getSyncedNodes({ node: targetNode, fsChildren }),
      ]
    }
  }
  return { ...response, buildNodes, targetNode }
}
