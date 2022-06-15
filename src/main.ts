import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'

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

async function getLabels(prNumber: number, token: string): Promise<Set<String>> {
  const octokit = github.getOctokit(token)
  const prComments = await getPullRequestComments(octokit, prNumber)
  core.debug(`prComments length: ${prComments.length}`)
  for (const c of prComments) core.debug(c)

  const commitComments = await getCommitComments(octokit, prNumber)

  core.debug(`commitComments length: ${commitComments.length}`)
  for (const c of commitComments) core.debug(c)

  return new Set<String>()
}

async function run(): Promise<void> {
  try {
    core.debug('In run.')
    const token = core.getInput('token', {required: true}) || process.env.GITHUB_TOKEN
    const prNumber = parseInt(core.getInput('prNumber', {required: true}))
    if (!token) throw new Error('No token specified')

    await getLabels(prNumber, token)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
