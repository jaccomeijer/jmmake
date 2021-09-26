import inquirer from 'inquirer'
import { nodes } from './__fixtures__/nodes'
import { confirm } from './confirm'

jest.mock('inquirer')
const mockedPrompt = inquirer.prompt as unknown as jest.Mock<any>

describe('Link command confirm', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  beforeEach(() => {
    consoleSpy.mockReset()
  })
  afterAll(() => {
    jest.restoreAllMocks()
    mockedPrompt.mockRestore()
  })

  test('should return true when comfirmed', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'y' }))
    const response = await confirm({ nodes })
    expect(response).toEqual(true)
  })

  test('should return false when not comfirmed', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'n' }))
    const response = await confirm({ nodes })
    expect(response).toEqual(false)
  })

  test('should list a single package', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'n' }))
    await confirm({ nodes: [nodes[0]] })
    expect(consoleSpy.mock.calls[0][0]).toEqual('This will link this package:')
    expect(consoleSpy.mock.calls[1][0]).toEqual(
      'Skipping: ./package-a does not exist'
    )
  })

  test('should list multiple packages', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'n' }))
    await confirm({ nodes })
    expect(consoleSpy.mock.calls[0][0]).toEqual(
      'This will link these packages:'
    )
    expect(consoleSpy.mock.calls[1][0]).toEqual(
      'Skipping: ./package-a does not exist'
    )
    expect(consoleSpy.mock.calls[2][0]).toEqual(
      'Skipping: ./package-b does not exist'
    )
  })
})
