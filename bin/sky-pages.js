#!/usr/bin/env node
'use strict';

const minimist = require('minimist');
const cli = require('../index');

cli(minimist(process.argv.slice(2)));
