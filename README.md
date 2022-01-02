# Make

Node build tool for npm packages in a git repository. Npm 7 workspaces are
supported. Heavy lifting is done by the `@npmcli/arborist` package.

## Npm workspace

The build tool works with git repostiories that contain npm packages. Either
with or witout workspaces.

## Github token

Creating Github releases requires a token with write access to the repository.

```bash
export GITHUB_TOKEN=paste_token_here
```

You can rename [template.env.development](template.env.development) into
`.env.development` and save the token in there.

## Install

```bash
npm install -g @jaccomeijer/jmmake
```

## Run without installing

```bash
npx @jaccomeijer/jmmake build
```

## List all packages in a repository

Lists the workspaces of a package. Without workspaces the repository itself is
listed.

```bash
jmmake list
```

## Build all packages in a repository

The build command runs `npm run build` in all package folders. The command does
not publish, push or release.

```bash
jmmake build
```

## Version a package in a repository

The version command updates all related packages in a repository. The command
does not publish, push or release.

![Versioning](https://github.com/jaccomeijer/jmmake/raw/main/make.png)

```bash
jmmake version @org/package-name
```

## Publish a package in a repository

The publish command publishes the package to the npm repository. The command
also pushes and releases to git.

```bash
jmmake publish @org/package-name
```

## Release a package in a repository

The release command combines the three commands above. The command will build,
version and publish the package.

```bash
jmmake release @org/package-name
```

## Sync and sort package.json for all workspaces

Read values from the root `package.json` and write them to the `package.json` of all workspaces.

These fields values are synced:

- author
- bugs
- contributors
- engines
- homepage
- keywords
- license
- publishConfig
- repository

This key order is used:

- name
- version
- private
- description
- keywords
- homepage
- bugs
- repository
- license
- author
- contributors
- exports
- typesVersions
- main
- files
- bin
- publishConfig
- workspaces
- scripts
- dependencies
- devDependencies
- peerDependencies
- engines
- browserslist

```bash
jmmake sync
```

## Link packages from another repository into the working directory

Creates symlinks in the `./node_modules` folder for the package found at the path specified.

```bash
jmmake link ../link/this/repository
```
