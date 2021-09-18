import chalk from 'chalk'
import { MakeContext } from './make-context-factory'
import { SubCommandString } from './release-command'

interface GetCommandReport {
  makeContext: MakeContext
  packageName: string
  subCommand: SubCommandString
}

const getCommandReport = ({
  makeContext,
  packageName,
  subCommand,
}: GetCommandReport) => {
  let report: string
  const exitCode = makeContext.exitCodes[packageName][subCommand]

  if (exitCode.codeUnknown) {
    report = chalk.bold.cyan(`${subCommand}: skipped`)
  } else if (exitCode.code === 0) {
    report = chalk.bold.green(`${subCommand}: ${exitCode.versionInfo || 'ok'}`)
  } else {
    report = chalk.bold.red(`${subCommand}: failed (${exitCode.code})`)
  }
  return report
}

export interface LogReport {
  makeContext: MakeContext
}

export const logReport = ({ makeContext }: LogReport) => {
  const log = console.log
  for (const packageName of Object.keys(makeContext.exitCodes)) {
    const buildReport = getCommandReport({
      makeContext,
      packageName,
      subCommand: 'build',
    })
    const versionReport = getCommandReport({
      makeContext,
      packageName,
      subCommand: 'version',
    })
    const publishReport = getCommandReport({
      makeContext,
      packageName,
      subCommand: 'publish',
    })
    log(chalk.bold(packageName))
    log(buildReport)
    log(versionReport)
    log(publishReport)
  }
}
