import { spawn } from 'child_process'
import { Readable } from 'stream'
import { ArboristNode } from './arborist'

export interface LogStream {
  stream: Readable
}

export const logStream = async ({ stream }: LogStream) => {
  for await (const data of stream) {
    process.stdout.write(data)
  }
}

export interface CmdRun {
  args: string[]
  cmd: string
  node: ArboristNode
}

export const cmdRun = async ({ cmd, args, node }: CmdRun) => {
  let exitCode = -1
  const cwd = node.path
  console.log(`==> (${cwd}) ${cmd} ${args.join(' ')}`)
  const child = spawn(cmd, args, { cwd })
  // Create a promise so that we won't leave before we have an exit code
  const exitCodePromise = new Promise((resolve) => {
    child.on('close', (code: number) => {
      exitCode = code
      resolve(code)
    })
  })
  await Promise.all([
    logStream({ stream: child.stdout }),
    logStream({ stream: child.stderr }),
    exitCodePromise,
  ])
  return exitCode
}

export interface NpmRun {
  args: string[]
  node: ArboristNode
}

export const npmRun = async ({ args, node }: NpmRun) => {
  return await cmdRun({
    cmd: 'npm',
    args: ['run', ...args],
    node,
  })
}
