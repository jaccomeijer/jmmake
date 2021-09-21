import { spawn } from 'child_process'
import { Readable } from 'stream'

export interface ReadStream {
  /** Stream to read */
  stream: Readable
  /** Array to push messages to */
  messages: string[]
}

export const readStream = async ({ stream, messages }: ReadStream) => {
  for await (const data of stream) {
    messages.push(data.toString())
  }
}

export const npmWhoami = async () => {
  const cwd = process.cwd()
  const child = spawn('npm', ['whoami'], { cwd })
  const stdout: string[] = []
  const stderr: string[] = []
  await Promise.all([
    readStream({ stream: child.stdout, messages: stdout }),
    readStream({ stream: child.stderr, messages: stderr }),
  ])
  let response
  if (stdout.length === 1 && stderr.length === 0) {
    response = stdout[0].replace('\n', '')
  }
  return response
}
