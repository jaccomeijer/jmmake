import dotenv from 'dotenv'
import yargs, { Argv, ArgumentsCamelCase } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { linkCommand } from './commands/link-command/link-command'
import { listCommand } from './commands/list-command/list-command'
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
  return yargs.positional('package', {
    type: 'string',
    describe: 'full package name with organisation',
  })
}

const pathPositional = (yargs: Argv) => {
  return yargs.positional('path', {
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
    (argv: ArgumentsCamelCase<CliArguments>) => {
      releaseCommand({ packageName: argv.package, subCommand: 'build' })
    }
  )
  .command(
    'version [package]',
    'bumps package and related packages to their new versions',
    packagePositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      releaseCommand({ packageName: argv.package, subCommand: 'version' })
    }
  )
  .command(
    'publish [package]',
    'publish package to package repository and commit/push to git repository',
    packagePositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      releaseCommand({ packageName: argv.package, subCommand: 'publish' })
    }
  )
  .command(
    'release [package]',
    'run all three: build, version and publish',
    packagePositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      releaseCommand({ packageName: argv.package })
    }
  )
  .command(
    'link [path]',
    'create links to monorepo in node_modules',
    pathPositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      linkCommand({ monoRepoPath: argv.path })
    }
  )
  .command(
    'sync [path]',
    'sync root package.json values to all packages in monorepo',
    packagePositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      syncCommand({ monoRepoPath: argv.path })
    }
  )
  .command(
    'list [path]',
    'list packages in monorepo',
    pathPositional,
    (argv: ArgumentsCamelCase<CliArguments>) => {
      listCommand({ monoRepoPath: argv.path })
    }
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .help().argv
