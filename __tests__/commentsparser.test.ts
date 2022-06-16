import {expect, test} from '@jest/globals'
import {extractCommitTypesFromComments} from '../src/commentsparser'

//Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/#specification

test('Basic', async () => {
  const comments = ['feat: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>(['feat']))
})

test('Type with scope', async () => {
  const comments = ['\n\nfeat(wfm): blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>(['feat']))
})

test('Type with scope and !', async () => {
  const comments = ['\n\nfeat(wfm)!: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>(['feat']))
})

test('Ignore white space at start ', async () => {
  const comments = ['\n\nfeat: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>(['feat']))
})

// Test that we do not pick up types when they are not valid

test('Ignore types that are not on the header line', async () => {
  const comments = ['\nThis is the header line\nfeat(wfm)!: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>([]))
})

test('Colons in type', async () => {
  const comments = ['feat:feat: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>([]))
})

test('Spaces in type', async () => {
  const comments = ['feat feat: blah blah\nBREAKING CHANGE: `extends` key']
  const actual = extractCommitTypesFromComments(comments)
  expect(actual).toEqual(new Set<String>([]))
})
