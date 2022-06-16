const commitTypeToLabelMap = new Map([
  ['fix', 'bug'],
  ['feat', 'enhancement']
])

export function extractCommitTypesFromComments(comments: string[]): Set<string> {
  //Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/#specification
  //extract type from type(scope)!:space where (scope) and ! are optional
  const typeRegEx = /^\s*([\w]+?)(?:\([\w+]+?\))?!?:\s/
  function extractFromComment(comment: string): string {
    const matches = comment.match(typeRegEx)
    return matches ? matches[1].toLowerCase() : ''
  }
  return new Set<string>(comments.map(c => extractFromComment(c)).filter(c => c !== ''))
}

export function commitTypesToLabels(types: Set<string>): Set<string> {
  const labels = [...types].map(c => (commitTypeToLabelMap.has(c) ? commitTypeToLabelMap.get(c) ?? '' : c)).filter(c => c !== '')
  return new Set<string>(labels)
}
