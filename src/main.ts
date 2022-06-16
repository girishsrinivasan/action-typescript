import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

const commitTypeToLabelMap = new Map([
  ['fix', 'bug'],
  ['feat', 'enhancement']
]);

//Get the comments that are directly on the pull request
async function getPullRequestComments(octokit: InstanceType<typeof GitHub>, prNumber: number): Promise<string[]> {
  const context = github.context
  const prParams = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber
  }
  const comments = await octokit.rest.issues.listComments(prParams)
  return comments.data.map(comment => comment?.body ?? '').filter(x => x !== '')
}

//Get the comments that are on the commits that are in the pull request
async function getCommitComments(octokit: InstanceType<typeof GitHub>, prNumber: number): Promise<string[]> {
  const context = github.context
  const prParams = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber
  }
  const commits = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', prParams)
  return commits.data.map(commit => commit?.commit?.message ?? '').filter(x => x !== '')
}

async function getCommitTypes(prNumber: number, token: string): Promise<Set<string>> {
  const octokit = github.getOctokit(token)
  const prComments = await getPullRequestComments(octokit, prNumber)
  const commitComments = await getCommitComments(octokit, prNumber)
  const comments = prComments.concat(commitComments)
  return extractCommitTypesFromComments(comments)
}

export function extractCommitTypesFromComments(comments: string[]): Set<string> {
  //Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/#summary
  const typeRegEx = /^\s*([\S:]+?):\s/
  const scopeRegEx = /\(.*?\)/gi
  const breakingAndWSRegEx = /[\s!]/gi
  function extractFromComment(comment: string): string {
    const matches = comment.match(typeRegEx)
    return matches ? matches[1].replace(breakingAndWSRegEx, '').replace(scopeRegEx, '').toLowerCase() : ''
  }
  return new Set<string>(comments.map(c => extractFromComment(c)).filter(c => c !== ''))
}

export function commitTypesToLabels(types: Set<string>) {
  const labels = [...types].map(c => commitTypeToLabelMap.has(c) ? commitTypeToLabelMap.get(c) ?? '' : c).filter(c => c !== '')
  return new Set<string>(labels)
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true }) || process.env.GITHUB_TOKEN
    const prNumber = parseInt(core.getInput('pull_number', { required: true }))
    if (!token) return
    const commitTypes = await getCommitTypes(prNumber, token)
    const labels = commitTypesToLabels(commitTypes)

    core.setOutput('commit_types', [...commitTypes].join(','))

  } catch (error) {
    const message = error instanceof Error ? error.message:"Unknown exception was thrown"
    core.setFailed(message)
  }
}

run()
