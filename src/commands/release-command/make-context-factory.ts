import Arborist from '@npmcli/arborist'
import { getGitKey, parseOriginUrl } from '../../lib/github'
import { ArboristNode, getFsChild, getSyncedNodes } from '../../lib/arborist'

export interface MakeContext {
  buildNodes: ArboristNode[]
  newChangeLogs: {
    [packageName: string]: string
  }
  rootNode: any
  targetNode: ArboristNode
}

export interface GetMakeContext {
  targetPackageName: string
}

export const makeContextFactory = async ({
  targetPackageName,
}: GetMakeContext) => {
  const arborist = new Arborist({ path: process.cwd() })
  const rootNode = await arborist.loadActual()
  const fsChildren = rootNode.fsChildren
  let targetNode = getFsChild({ fsChildren, packageName: targetPackageName })

  if (!targetNode && targetPackageName) {
    // Try prefixing the packageName with the owner
    const remoteOriginUrl = <string>await getGitKey({ key: 'remoteOriginUrl' })
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

  let buildNodes = [] as ArboristNode[]
  if (targetNode) {
    buildNodes = [
      targetNode,
      ...getSyncedNodes({ node: targetNode, fsChildren }),
    ]
  }

  return {
    buildNodes,
    newChangeLogs: {},
    rootNode,
    targetNode,
  } as MakeContext
}
