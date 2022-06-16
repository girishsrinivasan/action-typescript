import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {extractCommitTypesFromComments, commitTypesToLabels} from './commentsparser'

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

//Get comments from both the pull request itself and the commits in the pull request
async function getComments(octokit: InstanceType<typeof GitHub>, prNumber: number): Promise<string[]> {
  const prComments = await getPullRequestComments(octokit, prNumber)
  const commitComments = await getCommitComments(octokit, prNumber)
  return prComments.concat(commitComments)
}

//Label the pull request
async function labelPullRequest(octokit: InstanceType<typeof GitHub>, prNumber: number, labels: Set<string>): Promise<void> {
  if (labels.size === 0) return

  const context = github.context
  const params = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    labels: [...labels]
  }
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', params)
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true}) || process.env.GITHUB_TOKEN
    const prNumber = parseInt(core.getInput('pull_number', {required: true}))
    if (!token) return
    const octokit = github.getOctokit(token)
    const comments = await getComments(octokit, prNumber)
    const commitTypes = extractCommitTypesFromComments(comments)
    const labels = commitTypesToLabels(commitTypes)
    await labelPullRequest(octokit, prNumber, labels)
    core.setOutput('labels', [...labels].join(','))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown exception was thrown'
    core.setFailed(message)
  }
}

run()
