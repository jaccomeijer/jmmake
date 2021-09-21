import {
  getGitKey,
  parseOriginUrl,
  githubCollaboratorPermissionLevel,
  githubUserName,
} from './github'

export const validateToken = async () => {
  if (!process.env.GITHUB_TOKEN) return false

  const username = await githubUserName({
    token: process.env.GITHUB_TOKEN || '',
  })
  if (username === 'none') {
    console.log('Could not authenticate with Github')
    return false
  }
  console.log(`Checking token permissions level for Github user ${username}`)

  const remoteOriginUrl = <string>await getGitKey({ key: 'remoteOriginUrl' })
  const { owner, repo } = parseOriginUrl({ remoteOriginUrl })
  console.log(`Using github repo ${repo} and owner ${owner}`)

  const permissionLevel = await githubCollaboratorPermissionLevel({
    owner,
    repo,
    token: process.env.GITHUB_TOKEN || '',
    username,
  })

  if (permissionLevel === 'admin' || permissionLevel === 'write') {
    console.log(`Token permission level is valid: ${permissionLevel}`)
    return true
  }
  console.log(
    `Token permission level (${permissionLevel}) cannot create a Github release`
  )

  return false
}
