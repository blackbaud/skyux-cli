/*jshint node: true */
'use strict';

const winston = require('winston');
const minimist = require('minimist');

// Read args in order to disable colors on vsts
const argv = minimist(process.argv.slice(2));
const color = argv.hasOwnProperty('color') ? argv.color : true;


module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      colorize: color,
      showLevel: false
    })
  ]
});
