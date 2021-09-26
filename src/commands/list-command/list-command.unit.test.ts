import { listCommand } from './list-command'

describe('List command should', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  beforeEach(() => {
    consoleSpy.mockReset()
  })

  test('list single repo packages', async () => {
    await listCommand({
      monoRepoPath:
        './src/commands/list-command/__fixtures__/list-command-single-repo',
    })
    expect(consoleSpy.mock.calls).toEqual([['list-command-single-repo']])
  })

  test('list mono repo packages', async () => {
    await listCommand({
      monoRepoPath:
        './src/commands/list-command/__fixtures__/list-command-mono-repo',
    })
    expect(consoleSpy.mock.calls[0][0]).toMatch(/package-[abc]/)
    expect(consoleSpy.mock.calls[1][0]).toMatch(/package-[abc]/)
    expect(consoleSpy.mock.calls[2][0]).toMatch(/package-[abc]/)
  })
})
