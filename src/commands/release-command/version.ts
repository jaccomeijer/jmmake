import { existsSync, readFileSync, writeFileSync } from 'fs'
import semver from 'semver'
import { ArboristNode, updateEdgesOut } from '../../lib/arborist'
import { writeNodeSync } from '../../lib/read-write-node'
import { cmdRun } from '../../lib/run'
import {
  bumpVersion,
  callConventionalChangelog,
  getAsyncConfig,
} from './conventional-changelog'
import { MakeContext } from './make-context-factory'
import { getExitCodePassed, setExitCode } from './exit-code'

export interface VersionMakeContext {
  makeContext: MakeContext
}

export const versionTarget = async ({ makeContext }: VersionMakeContext) => {
  const { rootNode, targetNode } = makeContext
  if (!targetNode) return

  // Skip package if build failed
  const buildValid = getExitCodePassed({
    makeContext,
    node: targetNode,
    subCommand: 'build',
  })
  if (!buildValid) return
  const config = await getAsyncConfig
  const path = targetNode.path
  const recommendation = await bumpVersion({ config, path })
  const { releaseType } = recommendation
  const newVersion = semver.inc(
    rootNode.package.version,
    releaseType as semver.ReleaseType
  )
  const versionReason = `(${recommendation.reason} => ${recommendation.releaseType})`
  const versionInfo = `${targetNode.package.version} => ${newVersion}`
  console.log(versionInfo, versionReason)
  targetNode.package.version = newVersion
  setExitCode({
    exitCode: 0,
    makeContext,
    node: targetNode,
    subCommand: 'version',
    versionInfo,
  })
}

export const versionDependencies = async ({
  makeContext,
}: VersionMakeContext) => {
  const { rootNode, targetNode, buildNodes } = makeContext
  if (!targetNode) return
  const fsChildrenPlusRoot = [...Array.from(rootNode.fsChildren), rootNode]

  // Set root package version
  rootNode.package.version = targetNode.package.version

  for (const buildNode of buildNodes) {
    // Skip package if build failed
    const buildValid = getExitCodePassed({
      makeContext,
      node: buildNode,
      subCommand: 'build',
    })
    if (!buildValid) continue

    // Update packages with target node version
    buildNode.package.version = targetNode.package.version

    // Make packages depend on new version of package
    updateEdgesOut({ node: buildNode, fsChildren: fsChildrenPlusRoot })
    setExitCode({
      exitCode: 0,
      makeContext,
      node: buildNode,
      subCommand: 'version',
      versionInfo: `${rootNode.package.version} (from root)`,
    })
  }

  // Write all changes to all nodes
  fsChildrenPlusRoot.forEach((node: ArboristNode) => writeNodeSync({ node }))

  // Update package-lock.json
  await cmdRun({
    cmd: 'npm',
    args: ['install'],
    node: rootNode,
  })
}

export const getNewChangelogs = async ({ makeContext }: VersionMakeContext) => {
  const { buildNodes } = makeContext
  for (const buildNode of buildNodes) {
    // Skip package if build failed
    const buildValid = getExitCodePassed({
      makeContext,
      node: buildNode,
      subCommand: 'build',
    })
    if (!buildValid) continue

    const path = buildNode.path
    // Package version must have been set to new version
    const newVersion = buildNode.package.version
    const packageName = buildNode.package.name
    const config = await getAsyncConfig
    makeContext.newChangeLogs[packageName] = await callConventionalChangelog({
      config,
      path,
      newVersion,
    })
  }
}

const createFileIfNotExists = (fileName: string) => {
  if (!existsSync(fileName)) {
    writeFileSync(fileName, '\n', 'utf8')
  }
}

export const writeNewChangelogs = async ({
  makeContext,
}: VersionMakeContext) => {
  const { buildNodes, isMonoRepo } = makeContext
  // Skip this if we're not handling a mono repo
  if (!isMonoRepo) return
  for (const buildNode of buildNodes) {
    // Skip package if build failed
    const buildValid = getExitCodePassed({
      makeContext,
      node: buildNode,
      subCommand: 'build',
    })
    if (!buildValid) continue

    const changelogFile = `${buildNode.path}/CHANGELOG.md`
    createFileIfNotExists(changelogFile)
    const changelogContent = readFileSync(changelogFile, 'utf-8')
    const headerLength = changelogContent.search(
      /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+)/m
    )
    const existingChangelog = changelogContent.substring(headerLength)
    writeFileSync(
      changelogFile,
      `# Changelog\n\n${
        makeContext.newChangeLogs[buildNode.package.name]
      }${existingChangelog}`,
      'utf8'
    )
  }
}

export const writeRootRelease = async ({ makeContext }: VersionMakeContext) => {
  const { rootNode, buildNodes, newChangeLogs } = makeContext
  const rootReleaseFile = `${rootNode.path}/RELEASE.md`
  createFileIfNotExists(rootReleaseFile)
  const packageChanges = buildNodes.map(
    (buildNode) =>
      `## ${buildNode.package.name} ${buildNode.package.version}\n\n${
        newChangeLogs[buildNode.package.name]
      }\n`
  )
  writeFileSync(rootReleaseFile, packageChanges.join('\n'), 'utf8')
}

export const writeRootChangelog = async ({
  makeContext,
}: VersionMakeContext) => {
  const { rootNode } = makeContext
  const rootChangelogFile = `${rootNode.path}/CHANGELOG.md`
  const releaseFile = `${rootNode.path}/RELEASE.md`
  createFileIfNotExists(rootChangelogFile)
  const changelogContent = readFileSync(rootChangelogFile, 'utf-8')
  const releaseContent = readFileSync(releaseFile, 'utf-8')
  const headerLength = changelogContent.search(/(^# Release)/m)
  const existingChangelog = changelogContent.substring(headerLength)
  writeFileSync(
    rootChangelogFile,
    `# Changelog\n\n# Release ${rootNode.package.version}\n\n${releaseContent}${existingChangelog}`,
    'utf8'
  )
}
