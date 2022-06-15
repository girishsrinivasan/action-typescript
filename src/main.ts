import * as core from '@actions/core'
import * as github from '@actions/github'

async function getLabels(prNumber: number, token: string): Promise<Set<String>> {
  const octokit = github.getOctokit(token)
  const context = github.context

  const prCommentsParams = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber
  }

  const comments = await octokit.rest.issues.listComments(prCommentsParams)
  const pullRequestComments = comments.data.filter(comment => comment !== null).map(comment => comment.body)
  const txt = pullRequestComments.join('\n')
  core.debug(txt)
  core.setOutput('log', txt)
  return new Set<String>(txt)
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
