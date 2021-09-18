import { ArboristNode } from '../../lib/arborist'
import { MakeContext } from './make-context-factory'
import { SubCommandString } from './release-command'

export type ExitCode = {
  /** The actual exit code */
  code?: number
  /** Set to true when command did not run and the code in unknown */
  codeUnknown?: boolean
  /** Info on version bump */
  versionInfo?: string
}
export type PackageExitCodes = Record<SubCommandString, ExitCode>

export interface SetExitCode {
  exitCode: number
  makeContext: MakeContext
  node: ArboristNode
  subCommand: SubCommandString
  versionInfo?: string
}

export const setExitCode = ({
  exitCode,
  makeContext,
  node,
  subCommand,
  versionInfo,
}: SetExitCode) => {
  const packageName = node.package.name
  if (!makeContext.exitCodes[packageName]) {
    makeContext.exitCodes[packageName] = {
      build: { codeUnknown: true },
      version: { codeUnknown: true },
      publish: { codeUnknown: true },
    }
  }
  const exitCodeObj = makeContext.exitCodes[packageName][subCommand]
  exitCodeObj.codeUnknown = false
  exitCodeObj.code = exitCode
  if (versionInfo && !exitCodeObj.versionInfo)
    exitCodeObj.versionInfo = versionInfo
}

export interface GetExitCodePassed {
  makeContext: MakeContext
  node: ArboristNode
  subCommand: SubCommandString
}

export const getExitCodePassed = ({
  makeContext,
  node,
  subCommand,
}: GetExitCodePassed) => {
  const packageName = node.package.name
  if (!makeContext.exitCodes[packageName]) {
    // No commands for this package found, hence no bad exit codes
    return true
  }
  const exitCode = makeContext.exitCodes[packageName][subCommand]
  return exitCode.codeUnknown || exitCode.code === 0
}

export interface GetAllExitCodesPassed {
  makeContext: MakeContext
}

export const getAllExitCodesPassed = ({
  makeContext,
}: GetAllExitCodesPassed) => {
  let allValid = true
  for (const packageName of Object.keys(makeContext.exitCodes)) {
    const exitCode = makeContext.exitCodes[packageName]
    const buildPassed = exitCode.build.codeUnknown || exitCode.build.code === 0
    const versionPassed =
      exitCode.version.codeUnknown || exitCode.version.code === 0
    const publishPassed =
      exitCode.publish.codeUnknown || exitCode.publish.code === 0
    if (!buildPassed || !versionPassed || !publishPassed) {
      allValid = false
      break
    }
  }
  return allValid
}
