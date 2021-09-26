# Make

Node build tool for npm packages in a git repository. Npm 7 workspaces are
supported. Heavy lifting is done by the `@npmcli/arborist` package.

## Npm workspace

The build tool works with git repostiories that contain npm packages. Either
with or witout workspaces.

## Todo

- [x] Support for single npm repos
- [x] Check for valid npm login (npm whoami)
- [x] Show overview of exit status
- [x] Documentation
- [ ] Unit tests

## Install

```bash
npm install -g jmmake
```

## Run without installing

Prefix `jmmake` with `npx @jaccomeijer/` allows for running without installing.

```bash
npx @jaccomeijer/jmmake build
```

## Build all packages in a repository

The build command runs `npm run build` in all package folders. The command does
not publish, push or release.

```bash
jmmake build
```

## Version a packages in a repository

The version command updates all related packages in a repository. The command
does not publish, push or release.

![Versioning](https://github.com/jaccomeijer/jmmake/raw/main/make.png)

```bash
jmmake version @org/package-name
```

## Publish a packages in a repository

The publish command publishes the package to the npm repository. The command
also pushes and releases to git.

```bash
jmmake publish @org/package-name
```

## Release a packages in a repository

The release command combines the three commands above. This will build, version
and publish the package.

```bash
jmmake release @org/package-name
```
