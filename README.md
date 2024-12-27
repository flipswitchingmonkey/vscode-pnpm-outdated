# vscode-pnpm-outdated

After switching my projects to pnpm workspaces, I noticed that most extensions dealing with out of date npm package versions did not yet cover them. So, as much as an excercise to learn about vscode extensions as for providing me with the needed functionality for my projects, I created this small extension.

In essence it combines `pnpm list` and `pnpm outdated` to notify the user of outdated package versions in `package.json` and `pnpm-workspace.yaml` files when using `pnpm` as their package manager. It uses lenses to display the information inline with an immediate action to update the semver version to the latest version available (as reported by `pnpm outdated`)

## Features

### Check for outdated package versions

For example if there is an image subfolder under your extension project workspace:

### Check compliance of installed packages with version ranges

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- `pnpm` needs to be installed and used as the project's package manager
- `pnpm install` must have been executed at least once
- for projects using pnpm workspaces, a `package.json` needs to exist alongside the `pnpm-workspace.yaml`

## Extension Settings

- `pnpm-outdated.enabled`: Enable/disable this extension.
- `pnpm-outdated.showInstalledVersionLens`: Show a lens with the current version information even when there is no update available

## Known Issues

- early alpha version

## Release Notes

### 1.0.0

Initial release
