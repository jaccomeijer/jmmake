import path from 'path'
import { cmdRun } from '../../lib/run'
import { getGitKey, parseOriginUrl, githubRelease } from '../../lib/github'
import { MakeContext } from './make-context-factory'
import {
  getExitCodePassed,
  getAllExitCodesPassed,
  setExitCode,
} from './exit-code'

export interface PublishMakeContext {
  makeContext: MakeContext
}

export const publish = async ({ makeContext }: PublishMakeContext) => {
  const { buildNodes, rootNode, targetNode, isMonoRepo } = makeContext
  if (!targetNode) return
  for (const publishNode of buildNodes) {
    // Skip package if build or version failed
    const buildValid = getExitCodePassed({
      makeContext,
      node: publishNode,
      subCommand: 'build',
    })
    const versionValid = getExitCodePassed({
      makeContext,
      node: publishNode,
      subCommand: 'version',
    })
    if (!buildValid || !versionValid) continue

    if (publishNode.package.private) {
      console.log(
        `X=> Will not publish private package ${publishNode.package.name}`
      )
    } else {
      const exitCode = await cmdRun({
        cmd: 'npm',
        args: ['publish'],
        node: publishNode,
      })
      setExitCode({
        exitCode,
        makeContext,
        node: publishNode,
        subCommand: 'publish',
      })
    }
  }
  const allValid = getAllExitCodesPassed({ makeContext })
  if (!allValid) {
    console.log('Errors found, skipping git push and git release')
    return
  }

  const gitAddFiles = [
    'CHANGELOG.md',
    'package-lock.json',
    'package.json',
    'RELEASE.md',
  ]
  if (isMonoRepo) {
    // For a single repo the root files are enough, a monorepo requires all
    // packages to be added here
    for (const publishNode of buildNodes) {
      gitAddFiles.push(path.relative(process.cwd(), publishNode.path))
    }
  }
  const version = targetNode.package.version
  const cmd = 'git'

  let args
  args = ['add', ...gitAddFiles]
  const gitAddExitCode = await cmdRun({ cmd, args, node: rootNode })

  args = ['commit', '-m', version, ...gitAddFiles]
  const gitCommitExitCode = await cmdRun({ cmd, args, node: rootNode })

  args = ['tag', '-m', version, version]
  const gitTagExitCode = await cmdRun({ cmd, args, node: rootNode })

  const branch = <string>await getGitKey({ key: 'branch' })
  args = ['push', 'origin', branch, '--follow-tags']
  const gitPushExitCode = await cmdRun({ cmd, args, node: rootNode })

  const exitCode =
    gitAddExitCode ||
    gitCommitExitCode ||
    gitTagExitCode ||
    gitPushExitCode ||
    0

  if (!exitCode) {
    console.log('Git push errors found, skipping git release')
    return
  }

  const remoteOriginUrl = <string>await getGitKey({ key: 'remoteOriginUrl' })
  const { owner, repo } = parseOriginUrl({ remoteOriginUrl })
  await githubRelease({
    owner,
    repo,
    rootNode,
    tag: version,
    token: process.env.GITHUB_TOKEN || '',
  })
}
