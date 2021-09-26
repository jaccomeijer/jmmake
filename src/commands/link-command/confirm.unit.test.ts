import inquirer from 'inquirer'
import { nodes } from './__fixtures__/nodes'
import { confirm } from './confirm'

jest.mock('inquirer')
const mockedPrompt: jest.MockedFunction<any> = inquirer.prompt

describe('Link command confirm', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
  beforeEach(() => {
    consoleSpy.mockReset()
  })

  test('should return true when comfirmed', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'y' }))
    const response = await confirm({ nodes })
    expect(response).toEqual(true)
    expect(consoleSpy.mock.calls[0][0]).toEqual('This will link this package:')
    expect(consoleSpy.mock.calls[1][0]).toEqual(
      'Skipping: ./package-a does not exist'
    )
  })

  test('should return false when not comfirmed', async () => {
    mockedPrompt.mockImplementation(() => Promise.resolve({ policy: 'n' }))
    const response = await confirm({ nodes })
    expect(response).toEqual(false)
    expect(consoleSpy.mock.calls[0][0]).toEqual('This will link this package:')
    expect(consoleSpy.mock.calls[1][0]).toEqual(
      'Skipping: ./package-a does not exist'
    )
  })
})
