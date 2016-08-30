/*jshint node: true*/
'use strict';

const fs = require('fs');
const open = require('open');
const path = require('path');
const util = require('util');
const logger = require('winston');
const packageJson = require('../../package.json');

/**
 * Executes the version command.
 * @name version
 * @returns {String} version
 */
const version = (argv) => packageJson.version;

module.exports = version;
