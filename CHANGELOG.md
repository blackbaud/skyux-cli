# 1.4.1 (2018-05-25)

- Bugfix to correctly pass all commands to modules. [#153](https://github.com/blackbaud/skyux-cli/pull/153)

# 1.4.0 (2018-05-11)

- Updated verbose logging capabilities. [#151](https://github.com/blackbaud/skyux-cli/pull/151)
- Update to log an error and exit when no modules are found for a given command. [#150](https://github.com/blackbaud/skyux-cli/pull/150) Thanks [@Blackbaud-ColbyWhite](https://github.com/Blackbaud-ColbyWhite)!

# 1.3.0 (2018-03-16)

- Migrated all logging to use the `@blackbaud/skyux-logger` package. [#145](https://github.com/blackbaud/skyux-builder/pull/145)

# 1.2.0 (2018-02-07)

- Updated the `--template` flag to accept a Git URL.

# 1.1.3 (2017-11-30)

- Bugfix to prevent multiple calls to a module. [#143](https://github.com/blackbaud/skyux-cli/pull/143)

# 1.1.2 (2017-10-31)

- Bugfix when looking for scoped modules locally. [#141](https://github.com/blackbaud/skyux-cli/pull/141)

# 1.1.1 (2017-10-31)

- Bugfix when looking for modules globally. [#138](https://github.com/blackbaud/skyux-cli/pull/138)
- Use the `--verbose` flag to log additional information. [#140](https://github.com/blackbaud/skyux-cli/pull/140)

# 1.1.0 (2017-10-30)

- Made finding modules to process SKY UX commands less restrictive. [#135](https://github.com/blackbaud/skyux-cli/pull/135)

# 1.0.0 (2017-09-27)

- Determining the latest versions of `@blackbaud/skyux` and `@blackbaud/skyux-builder` before the `npm install` step of `skyux new`. [#130](https://github.com/blackbaud/skyux-cli/pull/130)

# 1.0.0-rc.1 (2017-09-14)

- Updated `skyux help` messaging and functionality.  Use `skyux help [command]` to learn about a specific command. [#128](https://github.com/blackbaud/skyux-cli/pull/128)

# 1.0.0-rc.0 (2017-08-21)

- Fixed formatting of `package.json` when running `skyux new`. [#126](https://github.com/blackbaud/skyux-cli/pull/126)

# 1.0.0-beta.7 (2017-08-17)

- Updated package dependencies. [#124](https://github.com/blackbaud/skyux-cli/pull/124)
- Component libraries created using `skyux new -t library` are given a package name with prefix `skyux-lib-*`. [#123](https://github.com/blackbaud/skyux-cli/pull/123)

# 1.0.0-beta.6 (2017-07-14)

- Fixed typo in branch name when running `skyux new`. [#120](https://github.com/blackbaud/skyux-cli/pull/120)

# 1.0.0-beta.5 (2017-06-02)

- Automatically installing the latest version of `@blackbaud/skyux` and `@blackbaud/skyux-builder` when running `skyux new` command.
- If a repo URL is specified during `skyux new`, we automatically create an `initial-commit` branch and switch to it.

# 1.0.0-beta.4 (2017-03-17)

- Allowed changing of the default template to be cloned via `--template` or `-t` when running `skyux new`.  See help for more information.  Thanks @Blackbaud-SteveBrush!

# 1.0.0-beta.3 (2017-02-17)

- Removed `--noServe` from `skyux help` since it's been deprecated.

# 1.0.0-beta.2 (2017-01-18)

- Implemented update-notifier module to display CLI updates.
- Updated documentation in help task for the `-l` or `--launch` flags.

# 1.0.0-beta.1 (2017-01-13)

- Created (default) `help` task.

# 1.0.0-beta.0 (2017-01-05)

- Initial release to NPM.

# 1.0.0-alpha.0 (2017-01-05)

- Renamed package to `@blackbaud/skyux-cli` in preparation of publishing to NPM.
- Deprecated the `sky-pages` command in favor of `skyux`.
