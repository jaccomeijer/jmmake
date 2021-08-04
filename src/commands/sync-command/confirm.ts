import inquirer from 'inquirer'
import { ArboristNode } from '../../lib/arborist'
import { confirmQuestions } from '../../lib/confirm-questions'
import { syncNodes } from './sync-nodes'

interface GetIsConfirmed {
  nodes: ArboristNode[]
  rootNode: any
}

export const confirm = async ({ nodes, rootNode }: GetIsConfirmed) => {
  console.log('Sync fields from root package.json to packages and sort them')
  syncNodes({ nodes, rootNode, dryRun: true })
  const answers = await inquirer.prompt(confirmQuestions)
  return answers.policy === 'y'
}
