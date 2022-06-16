import {expect, test} from '@jest/globals'
import {extractCommitTypesFromComments} from '../src/main'

test('Labels from comments basic', async () => {
  const comments = [
    'feat: blah blah\nBREAKING CHANGE: `extends` key',
    'feat(api)!: blah blah',
    'chore!: blah blah',
    '\n   \nfix(wfm)!: blah blah',
    //the next line is not valid since the type is not on the header. we will ignore the type called refactor
    '\n\nfirstline\nrefactor!: blah blah'
  ]

  const actual = extractCommitTypesFromComments(comments)
  const expected = new Set<String>(['feat', 'chore', 'fix'])
  expect(actual).toEqual(expected)
})
