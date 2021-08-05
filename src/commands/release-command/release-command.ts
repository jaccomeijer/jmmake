/**
 * - Bump version of package
 * - Sync versions of all packages
 * - Update all dependencies that use the packages
 * - Copy files to build folder
 * - Extend package.json fields in build folder
 * - Publish all packages that changed to npm
 *
 */

import { getFsChildPackageNames } from '../../lib/arborist'
import { validateToken } from '../../lib/validate-token'
import { npmWhoami } from '../../lib/npmWhoami'
import { makeContextFactory } from './make-context-factory'
import { confirm } from './confirm'
import {
  getNewChangelogs,
  versionDependencies,
  versionTarget,
  writeNewChangelogs,
  writeRootRelease,
  writeRootChangelog,
} from './version'
import { publish } from './publish'
import { buildPackage } from './build'

export type Command = 'build' | 'version' | 'publish' | 'release'

export interface RunCommand {
  packageName: string
  subCommand?: Command
}

export const releaseCommand = async ({
  packageName,
  subCommand,
}: RunCommand) => {
  const makeContext = await makeContextFactory({
    targetPackageName: packageName,
  })

  if (!makeContext.rootNode) {
    console.log(`An error occured getting nodes`)
    return
  }

  if (!makeContext.targetNode && subCommand !== 'build') {
    console.log(`Without package name the build command is required`)
    return
  }

  const packageNames = getFsChildPackageNames({
    fsChildren: makeContext.rootNode.fsChildren,
  })

  if (makeContext.buildNodes.length === 0) {
    console.log(
      `Package ${
        packageName || '<none>'
      } not found, please choose from:\n${packageNames.join('\n')}`
    )
    return
  }

  if (subCommand === 'publish' || subCommand === 'release') {
    const isValidToken = await validateToken()
    if (!isValidToken) {
      console.log("A valid GITHUB_TOKEN needs to be set for 'publish' command")
      return
    }
    const whoami = await npmWhoami()
    if (!whoami) {
      console.log("'npm whoami' needs to return a value for 'publish' command")
      return
    } else {
      console.log(`npm whoami: ${whoami}`)
    }
  }
  const isConfirmed = await confirm({
    subCommand,
    buildNodes: makeContext.buildNodes,
  })
  if (!isConfirmed) return

  switch (subCommand) {
    case 'build':
      await buildPackage({ makeContext })
      break
    case 'version':
      await versionTarget({ makeContext })
      await versionDependencies({ makeContext })
      await getNewChangelogs({ makeContext })
      await writeNewChangelogs({ makeContext })
      await writeRootRelease({ makeContext })
      await writeRootChangelog({ makeContext })
      break
    case 'publish':
      await getNewChangelogs({ makeContext })
      await publish({ makeContext })
      break
    default:
      await buildPackage({ makeContext })
      await versionTarget({ makeContext })
      await versionDependencies({ makeContext })
      await getNewChangelogs({ makeContext })
      await writeNewChangelogs({ makeContext })
      await writeRootRelease({ makeContext })
      await writeRootChangelog({ makeContext })
      await publish({ makeContext })
      break
  }
}
