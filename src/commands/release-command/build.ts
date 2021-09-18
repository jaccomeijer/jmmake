import { npmRun } from '../../lib/run'
import { MakeContext } from './make-context-factory'
import { setExitCode } from './exit-code'

export interface BuildMakeContext {
  makeContext: MakeContext
}

export const buildPackage = async ({ makeContext }: BuildMakeContext) => {
  // Build all nodes
  for (const buildNode of makeContext.buildNodes) {
    const exitCode = await npmRun({ args: ['build'], node: buildNode })
    setExitCode({ exitCode, makeContext, node: buildNode, subCommand: 'build' })
  }
}
