/*jshint jasmine: true, node: true */
'use strict';

const jasmineReporters = require('jasmine-reporters');

jasmine.getEnv().addReporter(
    new jasmineReporters.JUnitXmlReporter({
        savePath: 'testresults'
    }));
