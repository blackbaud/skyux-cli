#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const updateNotifier = require('update-notifier');

const cli = require('../index');
const pkg = require('../package.json');
const notifier = updateNotifier({ pkg: pkg });

notifier.notify({ defer: false });
cli(minimist(process.argv.slice(2)));
