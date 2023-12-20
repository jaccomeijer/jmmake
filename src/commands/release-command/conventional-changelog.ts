import conventionalRecommendedBump from 'conventional-recommended-bump'
import conventionalChangelog from 'conventional-changelog'
import createConfig from 'conventional-changelog-conventionalcommits'

export const getAsyncConfig = createConfig({
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'chore', section: 'Commits' },
    { type: 'docs', section: 'Documentation' },
    { type: 'style', section: 'Styling' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'perf', hidden: true },
    { type: 'test', hidden: true },
  ],
})

export interface BumpVersion {
  config: conventionalRecommendedBump.Options['config']
  path: string
}

export const bumpVersion = ({
  config,
  path,
}: BumpVersion): Promise<conventionalRecommendedBump.Recommendation> => {
  const options = {
    config,
    path,
  } as conventionalRecommendedBump.Options
  return conventionalRecommendedBump(options)
}

export interface GetNewChangelog {
  config: conventionalRecommendedBump.Options['config']
  newVersion: string
  path: string
}

export const callConventionalChangelog = ({
  config,
  newVersion,
  path,
}: GetNewChangelog): Promise<string> => {
  return new Promise((resolve, reject) => {
    let newChangelog = ''
    const changelogStream = conventionalChangelog(
      { config },
      { version: newVersion },
      { merges: null, path }
    )
    changelogStream.on('error', (error) => {
      return reject(error)
    })
    changelogStream.on('data', (buffer) => {
      newChangelog += buffer.toString()
    })
    changelogStream.on('end', () => {
      return resolve(newChangelog)
    })
  })
}
