import dotenv from 'dotenv'
import yargs, { Argv, Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { linkCommand } from './commands/link-command/link-command'
import { listCommand } from './commands/list-command'
import { releaseCommand } from './commands/release-command/release-command'
import { syncCommand } from './commands/sync-command/sync-command'

type CliArguments = {
  package: string
  path: string
}

// Will read GITHUB_TOKEN from .env.developemnt
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
})

const packagePositional = (yargs: Argv) => {
  yargs.positional('package', {
    type: 'string',
    describe: 'full package name with organisation',
  })
}
const pathPositional = (yargs: Argv) => {
  yargs.positional('path', {
    type: 'string',
    describe: 'path to npm 7 monorepo',
  })
}

yargs(hideBin(process.argv))
  .scriptName('jmmake')
  .usage('$0 <cmd> [args]')
  .command(
    'build [package]',
    'build a package',
    packagePositional,
    function (argv: Arguments<CliArguments>) {
      releaseCommand({ packageName: argv.package, subCommand: 'build' })
    }
  )
  .command(
    'version [package]',
    'bumps package and related packages to their new versions',
    packagePositional,
    function (argv: Arguments<CliArguments>) {
      releaseCommand({ packageName: argv.package, subCommand: 'version' })
    }
  )
  .command(
    'publish [package]',
    'publish package to package repository and commit/push to git repository',
    packagePositional,
    function (argv) {
      releaseCommand({ packageName: argv.package, subCommand: 'publish' })
    }
  )
  .command(
    'release [package]',
    'run all three: build, version and publish',
    packagePositional,
    function (argv) {
      releaseCommand({ packageName: argv.package })
    }
  )
  .command(
    'link [path]',
    'create links to monorepo in node_modules',
    pathPositional,
    function (argv) {
      linkCommand({ monoRepoPath: argv.path })
    }
  )
  .command(
    'sync [path]',
    'sync root package.json values to all packages in monorepo',
    packagePositional,
    function (argv) {
      syncCommand({ monoRepoPath: argv.path })
    }
  )
  .command(
    'list [path]',
    'list packages in monorepo',
    pathPositional,
    function (argv) {
      listCommand({ monoRepoPath: argv.path })
    }
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .help().argv
