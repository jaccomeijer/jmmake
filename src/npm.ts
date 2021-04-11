import { spawn } from 'child_process'
import fs from 'fs'

type Package = Record<string, any>

type Node = {
  path: string
  edgesOut?: any
  package?: Package
}

export const depTypeToKey = {
  optional: 'optionalDependencies',
  prod: 'dependencies',
  peer: 'peerDependencies',
  dev: 'devDependencies',
}

type Edge = {
  name: string
  type: keyof typeof depTypeToKey
}

// TODO: Fix proper type
type Stream = any

export interface LogStream {
  stream: Stream
}

export const packagePath = (node: Node, cloneDir?: string) =>
  cloneDir
    ? `${node.path}/${cloneDir}/package.json`
    : `${node.path}/package.json`

export const logStream = async ({ stream }: LogStream) => {
  for await (const data of stream) {
    process.stdout.write(data)
  }
}
export const commitTypes = [
  { type: 'feat', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'chore', section: 'Commits' },
  { type: 'docs', section: 'Documentation' },
  { type: 'style', section: 'Styling' },
  { type: 'refactor', section: 'Code Refactoring' },
  { type: 'perf', hidden: true },
  { type: 'test', hidden: true },
]
export interface DeepMerge {
  target: Package
  source: Package
}
export const deepMerge = ({ target, source }: DeepMerge) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(
        source[key],
        deepMerge({ target: target[key], source: source[key] })
      )
  }
  Object.assign(target || {}, source)
  return target
}

export interface ReadNodeSync {
  node: Node
  cloneDir?: string
}
export const readNodeSync = ({ node, cloneDir }: ReadNodeSync) => {
  const data = fs.readFileSync(packagePath(node, cloneDir), 'utf8')
  return JSON.parse(data)
}
export interface WriteNodeSync {
  cloneDir?: string
  node: Node
  packageObject: Package
}
export const writeNodeSync = ({
  node,
  cloneDir,
  packageObject,
}: WriteNodeSync) => {
  let pkgObjToSave = node.package
  if (packageObject) {
    pkgObjToSave = {}
    deepMerge({ target: pkgObjToSave, source: node.package! })
    deepMerge({ target: pkgObjToSave, source: packageObject })
  }
  fs.writeFileSync(
    packagePath(node, cloneDir),
    JSON.stringify(pkgObjToSave, null, 2),
    'utf8'
  )
}
export interface CmdRun {
  cmd: string
  args: string[]
  cwd: string
}
export const cmdRun = async ({ cmd, args, cwd }: CmdRun) => {
  console.log(`==> (${cwd}) ${cmd} ${args.join(' ')}`)
  const child = spawn(cmd, args, { cwd })
  await Promise.all([
    logStream({ stream: child.stdout }),
    logStream({ stream: child.stderr }),
  ])
}
export interface NpmRun {
  args: string[]
  cloneDir?: string
  node: Node
}
export const npmRun = async ({ args, cloneDir, node }: NpmRun) => {
  cmdRun({
    cmd: 'npm',
    args: ['run', ...args],
    cwd: cloneDir ? `${node.path}/${cloneDir}` : node.path,
  })
}
export interface updatePackage {
  node: Node
  cloneDir?: string
  packageObject: Package
}
export interface CloneToDirSync {
  node: Node
  cloneDir: string
  fileNameList: string[]
}
export const cloneToDirSync = async ({
  node,
  cloneDir,
  fileNameList,
}: CloneToDirSync) => {
  for (const fileName of fileNameList) {
    fs.copyFileSync(
      `${node.path}/${fileName}`,
      `${node.path}/${cloneDir}/${fileName}`
    )
  }
}
export interface GetEdgesOut {
  packageName: string
  allNodes: Node[]
}
// Edges out are packages that depend on packageName
export const getEdgesOut = ({ packageName, allNodes }: GetEdgesOut) => {
  const edgesOut: Edge[] = []
  for (const aNode of allNodes) {
    aNode.edgesOut.forEach((edgeOut: Edge) => {
      if (edgeOut.name === packageName) {
        edgesOut.push(edgeOut)
      }
    })
  }
  return edgesOut
}
export interface GetRecursEdgesOut {
  packageName: string
  allNodes: Node[]
}
// Recursive ddges out are packages that depend on packageName and the packages
// that depend on these
export const getRecursEdgesOut = ({
  packageName,
  allNodes,
}: GetRecursEdgesOut) => {
  const edgesOut = getEdgesOut({ packageName, allNodes })
  edgesOut.forEach((edgeOut) => {
    const recursEdgesOut = getRecursEdgesOut({
      packageName: edgeOut.name,
      allNodes,
    })
    edgesOut.push(...recursEdgesOut)
  })
  return edgesOut
}
export interface UpdateEdgesOut {
  node: Node
  allNodes: Node[]
}
export const updateEdgesOut = ({ allNodes, node }: UpdateEdgesOut) => {
  const edgesOut = getEdgesOut({
    allNodes,
    packageName: node.package!.name,
  })
  for (const edgeOut of edgesOut) {
    const depNode = allNodes.find((node) => node.package!.name === edgeOut.name)
    deepMerge({
      target: depNode!.package!,
      source: {
        [depTypeToKey[edgeOut.type]]: {
          [edgeOut.name]: node.package!.version,
        },
      },
    })
  }
}
export interface GetNodesToPublish {
  node: Node
  allNodes: Node[]
}

export const getSyncedNodes = ({ allNodes, node }: GetNodesToPublish) => {
  // Sync all packages that use node to the node version version
  const edgesOut = getRecursEdgesOut({
    packageName: node.package!.name,
    allNodes,
  })
  const syncedNodes = []
  for (const edgeOut of edgesOut) {
    const depNode = allNodes.find((node) => node.package!.name === edgeOut.name)
    deepMerge({
      target: depNode!.package!,
      source: { version: node.package!.version },
    })
    syncedNodes.push(depNode)
  }
  return syncedNodes
}
