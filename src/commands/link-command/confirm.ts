import inquirer from 'inquirer'
import { ArboristNode } from '../../lib/arborist'
import { confirmQuestions } from '../../lib/confirm-questions'
import { linkNodes } from './link-nodes'

interface GetIsConfirmed {
  nodes: ArboristNode[]
}

export const confirm = async ({ nodes }: GetIsConfirmed) => {
  console.log(
    `This will link ${nodes.length === 1 ? 'this package' : 'these packages'}:`
  )
  linkNodes({ nodes, dryRun: true })
  const answers = await inquirer.prompt(confirmQuestions)
  return answers.policy === 'y'
}
