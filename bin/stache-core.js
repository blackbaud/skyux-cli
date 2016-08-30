#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const cli = require('../lib/cli');

cli(minimist(process.argv.slice(2)));
