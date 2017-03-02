# skyux-cli

[![npm](https://img.shields.io/npm/v/@blackbaud/skyux-cli.svg)](https://www.npmjs.com/package/@blackbaud/skyux-cli)
[![status](https://travis-ci.org/blackbaud/skyux-cli.svg?branch=master)](https://travis-ci.org/blackbaud/skyux-cli)

The SKY UX CLI provides a command line interface for the SKY UX Builder. For documentation how to use SKY UX CLI, see [the Learn section of the SKY UX 2 website](https://developer.blackbaud.com/skyux2/learn). 

## Installation

For guidance on prerequisites and how to install SKY UX CLI, including instructions to install [skyux-ca.crt](https://raw.githubusercontent.com/blackbaud/skyux-builder/master/ssl/skyux-ca.crt) root certificate file, see [the initial SKY UX setup section of the SKY UX 2 website](https://developer.blackbaud.com/skyux2/learn/tutorials/install).

## Usage

For guidance on how to create and edit a SKY UX SPA, see [the getting started tutorials on the SKY UX 2 website](https://developer.blackbaud.com/skyux2/learn/tutorials).

## CLI commands and SPA configuration options

For the commands and options available in the SKY UX CLI and reference information such as configuration options for SKY UX SPAs, see [the technical reference section of the SKY UX 2 website](https://developer.blackbaud.com/skyux2/learn/reference).

## Testing

### Unit testing

We automatically configure [Karma](https://karma-runner.github.io) to run unit tests matching the `*.spec.ts` pattern. We suggest following the [Angular2 Style Guide](https://angular.io/styleguide#!#naming) regarding what to name your spec files and where to store them. Check out the example included in our template via `skyux new` (coming soon) or learn more about [writing unit tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux test` to run your tests, or `skyux watch` every time you make a change to a spec file.

### End-to-end (e2e) testing

We automatically configure [Protractor](http://www.protractortest.org) to run end-to-end tests matching the `e2e/*.e2e-spec.ts` pattern. Check out the example include in our template via `skyux new` (coming soon) or learn more about [writing end-to-end tests](https://angular.io/docs/ts/latest/testing/) in SKY UX.

Use `skyux e2e` to run your tests.
