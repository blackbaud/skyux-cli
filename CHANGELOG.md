# 1.0.0-beta.5 (2017-05-25)

- Automatically installing the latest version of `@blackbaud/skyux` and `@blackbaud/skyux-builder` when running `skyux new` command.
- If a repo URL is specified during `skyux new`, we automatically create a `feature-newproject` branch and switch to it.

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