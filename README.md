<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Automatically label pull requests based on Conventional Commits

Automatically extract types from comments and use that to label pull request. Automatic conversions are applied to know type. If it is not one of the known types then the type from the commit message is used directly as the label. 

### Known Convention Commit types

|Type|Label|
|-------|-----|
|feat|enhancement
|fix|bug

See [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

## Building

> You will need node 16 to build.

Install the dependencies  
```bash
npm install
```
Run the tests :heavy_check_mark:  
```bash
npm test
```

Build the action and package it for distribution
```bash
npm run all
```


```yaml
uses: girishsrinivasan/action-typescript@main
id: autolabel
with:
  pull_number: 9
  token: ${{  secrets.GITHUB_TOKEN }}
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
