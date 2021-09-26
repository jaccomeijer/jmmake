import { linkCommand } from './link-command'
import { confirm } from './confirm'
import { linkNodes } from './link-nodes'

let confirmMock: jest.Mock
jest.mock('./confirm', () => {
  confirmMock = jest.fn(async () => true)
  return { confirm: confirmMock }
})
let linkNodesMock: jest.Mock
jest.mock('./link-nodes', () => {
  linkNodesMock = jest.fn()
  return { linkNodes: linkNodesMock }
})

describe('Link command', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  beforeEach(() => {
    consoleSpy.mockReset()
    confirmMock.mockClear()
    linkNodesMock.mockClear()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('should run with a single repo', async () => {
    await linkCommand({
      monoRepoPath:
        './src/commands/link-command/__fixtures__/link-command-single-repo',
    })
    const mockedConfirm = confirm as unknown as jest.MockInstance<any, any>
    const mockedLinkNodes = linkNodes as unknown as jest.MockInstance<any, any>
    expect(mockedConfirm.mock.calls[0][0].nodes.length).toEqual(1)
    expect(mockedLinkNodes.mock.calls[0][0].nodes.length).toEqual(1)
    expect(mockedConfirm.mock.calls[0][0].nodes[0].name).toEqual(
      'link-command-single-repo'
    )
    expect(mockedLinkNodes.mock.calls[0][0].nodes[0].name).toEqual(
      'link-command-single-repo'
    )
  })

  test('should run with a mono repo', async () => {
    await linkCommand({
      monoRepoPath:
        './src/commands/link-command/__fixtures__/link-command-mono-repo',
    })
    const mockedConfirm = confirm as unknown as jest.MockInstance<any, any>
    const mockedLinkNodes = linkNodes as unknown as jest.MockInstance<any, any>
    expect(mockedConfirm.mock.calls[0][0].nodes.length).toEqual(3)
    expect(mockedLinkNodes.mock.calls[0][0].nodes.length).toEqual(3)
    expect(mockedConfirm.mock.calls[0][0].nodes[0].name).toMatch(
      /package-[abc]/
    )
    expect(mockedLinkNodes.mock.calls[0][0].nodes[0].name).toMatch(
      /package-[abc]/
    )
    expect(mockedConfirm.mock.calls[0][0].nodes[1].name).toMatch(
      /package-[abc]/
    )
    expect(mockedLinkNodes.mock.calls[0][0].nodes[1].name).toMatch(
      /package-[abc]/
    )
    expect(mockedConfirm.mock.calls[0][0].nodes[2].name).toMatch(
      /package-[abc]/
    )
    expect(mockedLinkNodes.mock.calls[0][0].nodes[2].name).toMatch(
      /package-[abc]/
    )
  })
})
